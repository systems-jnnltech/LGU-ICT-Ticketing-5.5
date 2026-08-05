import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { ShieldCheck, ArrowLeft, Mail, Lock, Layers, Activity } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'sonner';

export function IctLogin() {
  const { signInWithEmail, user, profile, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-bg"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // If already authenticated and has a profile, go to app
  if (user && profile) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Login successful');
      }
    } catch (error: any) {
      toast.error('Failed to log in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row">
      {/* Left Branding Panel */}
      <div className="lg:flex-1 bg-ink text-surface p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center space-x-4 mb-12">
            <div className="w-16 h-16 bg-white rounded-full p-1 flex items-center justify-center shrink-0">
              <img src="/LGU_LOGO1.png" alt="LGU Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Municipality Of Malungon</h1>
              <p className="text-surface-muted text-sm uppercase tracking-wider font-semibold">Sarangani Province</p>
            </div>
          </div>

          <h2 className="text-4xl font-black mb-6 leading-tight">
            Municipal Asset Management System
          </h2>
          <p className="text-lg text-surface-muted mb-12 leading-relaxed">
            A centralized platform for managing government assets, tracking repair and maintenance requests, and monitoring equipment across all LGU departments.
          </p>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Centralized Departments</h3>
                <p className="text-surface-muted">Manage requests across all offices</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Efficient Tracking</h3>
                <p className="text-surface-muted">Real-time status of every equipment repair</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Secure Access</h3>
                <p className="text-surface-muted">Role-based permissions and audit logs</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 mt-16 text-sm text-surface-muted/60">
          Malungon ICT Asset Ticketing System. Created by MO-ICTS © 2026. All rights reserved.
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Right Login Panel */}
      <div className="lg:w-[480px] shrink-0 flex flex-col justify-center py-12 px-6 sm:px-12 bg-bg relative">
        <div className="mx-auto w-full max-w-sm relative">
          <Link to="/" className="absolute -left-12 lg:-left-4 top-1/2 -translate-y-1/2 p-2 text-ink-muted hover:text-ink transition-colors hidden sm:block">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-center mb-8 lg:hidden relative">
            <Link to="/" className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-ink-muted hover:text-ink transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-20 h-20 mx-auto bg-white rounded-full p-1 flex items-center justify-center shadow-sm mb-4">
              <img src="/LGU_LOGO1.png" alt="LGU Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-ink text-center lg:text-left pl-0 sm:pl-2 lg:pl-0">
            ICT Support Portal
          </h2>
          <p className="mt-2 text-sm text-ink-muted text-center lg:text-left pl-0 sm:pl-2 lg:pl-0">
            Sign in with your email and password
          </p>
        </div>

        <div className="mt-8 mx-auto w-full max-w-sm">
          <div className="bg-surface py-8 px-6 shadow-sm rounded-2xl border border-border">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-ink-muted" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-xl bg-bg text-ink text-sm focus:ring-accent focus:border-accent"
                    placeholder="admin@malungon.gov.ph"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-ink-muted" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-xl bg-bg text-ink text-sm focus:ring-accent focus:border-accent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <a href="#" className="font-bold text-accent hover:text-accent/80">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
