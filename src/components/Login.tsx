import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ShieldAlert } from 'lucide-react';
import { useAppContext } from '../store/AppContext';

export function Login() {
  const [error, setError] = useState<string | null>(null);
  const { authError, users, login } = useAppContext();

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface via-bg to-bg">
      
      <div className="bg-surface p-10 md:p-12 rounded-[2rem] shadow-2xl border border-border w-full max-w-lg relative overflow-hidden">
        {/* Subtle decorative accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/20 via-accent to-accent/20"></div>

        <div className="text-center mb-10">
          <h1 className="text-[2.5rem] font-black mb-3 tracking-tighter text-ink leading-none">ICT Ticket Hub</h1>
          <p className="text-sm font-medium text-ink-muted">Select a mock user profile to initialize the session</p>
        </div>
        
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-xs font-medium text-red-500">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => login(u.id)}
              className="w-full text-left p-5 border border-border rounded-2xl bg-bg/50 hover:bg-surface hover:border-accent/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-accent group-hover:text-white transition-colors">
                  {u.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-ink text-[15px] group-hover:text-accent transition-colors">{u.name}</div>
                  <div className="text-[10px] text-ink-muted font-bold tracking-widest uppercase mt-1">{u.role}</div>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-border group-hover:bg-accent transition-colors"></div>
            </button>
          ))}
        </div>
        
        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Development Mode Active</p>
        </div>
      </div>
    </div>
  );
}
