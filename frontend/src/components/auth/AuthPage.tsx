import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { Mail, Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';

export const AuthPage: React.FC = () => {
  const { signInWithPassword, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!isSupabaseConfigured) {
      setError('VITE_SUPABASE_ANON_KEY is missing in environment variables. Please configure VITE_SUPABASE_ANON_KEY in Vercel and redeploy.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: err } = await signInWithPassword(email.trim(), password);
        if (err) {
          setError(err.message || 'Failed to sign in. Please check your credentials.');
        }
      } else {
        const { error: err } = await signUp(email.trim(), password, fullName.trim() || undefined);
        if (err) {
          setError(err.message || 'Failed to create account.');
        } else {
          setMessage('Account created successfully! If email confirmation is enabled, please check your inbox.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#171827] flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-[#635BFF]/10 font-sans taste-grid-bg">
      {/* Subtle Ambient Glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header with Original StepNext Logo PNG Asset */}
        <div className="flex flex-col items-center justify-center text-center">
          <img
            src="/stepnext-logo.png"
            alt="StepNext - Your next step, made clearer."
            className="h-16 sm:h-20 w-auto max-w-full object-contain mx-auto"
          />
        </div>

        {/* Auth Card */}
        <div className="bg-white/95 border border-[#E5E5DC] backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          {/* Tab Switcher */}
          <div className="flex bg-[#F1F1E8] p-1 rounded-xl mb-6 border border-[#E5E5DC]">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setMessage(null); }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#171827] shadow-sm border border-[#E5E5DC]'
                  : 'text-[#667085] hover:text-[#171827]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#171827] shadow-sm border border-[#E5E5DC]'
                  : 'text-[#667085] hover:text-[#171827]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Alert Banners */}
          {!isSupabaseConfigured && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Configuration Notice: VITE_SUPABASE_ANON_KEY is missing in Vercel environment variables. Please add VITE_SUPABASE_ANON_KEY and redeploy.</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[#171827] mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full bg-white border border-[#E5E5DC] focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#171827] placeholder-[#98A2B3] outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#171827] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-white border border-[#E5E5DC] focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#171827] placeholder-[#98A2B3] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171827] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#E5E5DC] focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#171827] placeholder-[#98A2B3] outline-none transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-3 text-xs font-bold bg-[#635BFF] hover:bg-[#5249E0] text-white shadow-md shadow-[#635BFF]/20 border-none rounded-xl transition-all"
              disabled={loading}
              icon={!loading ? <ArrowRight className="w-3.5 h-3.5" /> : undefined}
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In to StepNext' : 'Create StepNext Account'}
            </Button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-[#667085]">
          Protected by Supabase Auth & StepNext Decision Telemetry
        </p>
      </div>
    </div>
  );
};
