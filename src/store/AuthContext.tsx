import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  supabase,
  isSupabaseConfigured,
} from '../lib/supabase';
import {
  Session,
  User as SupabaseUser,
} from '@supabase/supabase-js';
import { toast } from 'sonner';
import { mockUsers } from './mockData';

export type Role =
  | 'system_admin'
  | 'ict_support'
  | 'employee';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  department_id: string | null;
  status: 'active' | 'inactive' | 'suspended';
  avatar_url?: string;
}

interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  mockLogin: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * ---------------------------------------------------------
   * Check authenticated session and load profile
   * ---------------------------------------------------------
   */
  const checkSessionAndProfile = async (
    currentSession: Session | null
  ) => {
    setSession(currentSession);

    const currentUser = currentSession?.user ?? null;
    setUser(currentUser);

    if (!currentUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    await fetchProfile(currentUser);
  };

  /**
   * ---------------------------------------------------------
   * Initial authentication listener
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      await checkSessionAndProfile(session);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        await checkSessionAndProfile(session);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * ---------------------------------------------------------
   * Fetch profile
   *
   * IMPORTANT:
   * The frontend DOES NOT create profiles.
   *
   * The database trigger:
   *
   * auth.users
   *      ↓
   * handle_new_user()
   *      ↓
   * profiles
   *
   * is responsible for profile creation.
   * ---------------------------------------------------------
   */
  const fetchProfile = async (
    currentUser: SupabaseUser
  ) => {
    try {
      const email = currentUser.email
        ?.toLowerCase()
        .trim();

      /**
       * -----------------------------------------------------
       * 1. Require official Malungon government email
       * -----------------------------------------------------
       */
      if (
        !email ||
        !email.endsWith('@malungon.gov.ph')
      ) {
        toast.error(
          'Only @malungon.gov.ph accounts are allowed.'
        );

        await supabase.auth.signOut();

        setUser(null);
        setSession(null);
        setProfile(null);

        return;
      }

      /**
       * -----------------------------------------------------
       * 2. Fetch profile
       *
       * maybeSingle() is used instead of single()
       * so a missing profile doesn't immediately throw.
       * -----------------------------------------------------
       */
      let profileData: Profile | null = null;
      let profileError: any = null;

      /**
       * The database trigger may need a very short moment
       * after auth.users is created.
       *
       * Retry up to 3 times.
       */
      for (let attempt = 0; attempt < 3; attempt++) {
        const {
          data,
          error,
        } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();

        profileData = data as Profile | null;
        profileError = error;

        if (profileError) {
          break;
        }

        if (profileData) {
          break;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 500)
        );
      }

      /**
       * -----------------------------------------------------
       * 3. Database query failed
       * -----------------------------------------------------
       */
      if (profileError) {
        console.error(
          'Profile query failed:',
          profileError
        );

        throw profileError;
      }

      /**
       * -----------------------------------------------------
       * 4. Auth user exists but profile doesn't
       *
       * This normally means:
       *
       * - the user already existed before the trigger
       * - the profiles table was reset
       * - the trigger failed
       * - or the profile was manually deleted
       *
       * DO NOT create the profile from the frontend.
       * -----------------------------------------------------
       */
      if (!profileData) {
        console.error(
          'Authenticated user has no profile:',
          {
            id: currentUser.id,
            email: currentUser.email,
          }
        );

        toast.error(
          'Your profile was not found. Please contact ICT Support.'
        );

        await supabase.auth.signOut();

        setUser(null);
        setSession(null);
        setProfile(null);

        return;
      }

      /**
       * -----------------------------------------------------
       * 5. Check profile status
       * -----------------------------------------------------
       */
      if (profileData.status !== 'active') {
        toast.error(
          'Your account is currently inactive.'
        );

        await supabase.auth.signOut();

        setUser(null);
        setSession(null);
        setProfile(null);

        return;
      }

      /**
       * -----------------------------------------------------
       * 6. System administrator enforcement
       * -----------------------------------------------------
       */
      if (
        email === 'systems@malungon.gov.ph' &&
        profileData.role !== 'system_admin'
      ) {
        const {
          data: updatedProfile,
          error: updateError,
        } = await supabase
          .from('profiles')
          .update({
            role: 'system_admin',
          })
          .eq('id', currentUser.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        setProfile(
          updatedProfile as Profile
        );
      } else {
        setProfile(profileData);
      }
    } catch (error: any) {
      console.error(
        'Error fetching profile:',
        error
      );

      toast.error(
        error?.message ||
          'Error loading profile. Please contact ICT Support.'
      );

      await supabase.auth.signOut();

      setUser(null);
      setSession(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ---------------------------------------------------------
   * Google Login
   * ---------------------------------------------------------
   */
  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      toast.error(
        'Supabase not configured. Use mock login below.'
      );
      return;
    }

    try {
      const {
        error,
      } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error(
        'Google sign-in error:',
        error
      );

      toast.error(
        error?.message ||
          'Unable to sign in with Google.'
      );
    }
  };

  /**
   * ---------------------------------------------------------
   * Email / Password Login
   * ---------------------------------------------------------
   */
  const signInWithEmail = async (
    email: string,
    password: string
  ) => {
    if (!isSupabaseConfigured) {
      return {
        error: new Error(
          'Supabase not configured.'
        ),
      };
    }

    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  /**
   * ---------------------------------------------------------
   * Sign Out
   * ---------------------------------------------------------
   */
  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      setProfile(null);

      toast.success(
        'Logged out successfully'
      );

      return;
    }

    try {
      await supabase.auth.signOut();

      setUser(null);
      setSession(null);
      setProfile(null);

      toast.success(
        'Logged out successfully'
      );
    } catch (error: any) {
      console.error(
        'Sign-out error:',
        error
      );

      toast.error(
        error?.message ||
          'Unable to sign out.'
      );
    }
  };

  /**
   * ---------------------------------------------------------
   * Mock Login
   * ---------------------------------------------------------
   */
  const mockLogin = (role: Role) => {
    const mockProfile: Profile = {
      id: 'mock-' + role,
      email: role + '@malungon.gov.ph',
      full_name:
        role === 'system_admin'
          ? 'Mock Admin'
          : role === 'ict_support'
          ? 'Mock ICT'
          : 'Mock Employee',
      role,
      department_id:
        role === 'employee'
          ? 'off-1'
          : null,
      status: 'active',
    };

    setUser({
      id: mockProfile.id,
      email: mockProfile.email,
    } as SupabaseUser);

    setProfile(mockProfile);

    toast.success(
      'Mock login successful'
    );
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signOut,
        mockLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};
