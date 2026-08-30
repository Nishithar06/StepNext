import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

export const AuthPage: React.FC = () => {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Form Fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ message: string; isInfo?: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setNotice({ message: 'Please enter an email address to continue.' });
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await login(cleanEmail, mode === 'signup' ? fullName.trim() : undefined);
      if (err) {
        setNotice({ message: err.message || 'Unable to enter StepNext. Please try again.' });
      }
    } catch (err: any) {
      setNotice({ message: err.message || 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0F172A] flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-[#5850EC]/10 font-sans taste-grid-bg relative overflow-hidden">
      {/* Subtle Ambient Radial Glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5850EC]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-[#10B981]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <img
            src="/stepnext-logo.png"
            alt="StepNext"
            className="h-16 sm:h-20 w-auto max-w-full object-contain mx-auto drop-shadow-sm"
          />
          <p className="text-xs text-slate-500 font-mono tracking-wider uppercase font-medium">
            Autonomous Decision & Career Intelligence
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-[28px] border border-black/[0.08] p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] space-y-6">
          {/* Tab Switcher */}
          <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-black/[0.05]">
            <button
              type="button"
              onClick={() => { setMode('login'); setNotice(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-slate-500 hover:text-[#0F172A]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setNotice(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-slate-500 hover:text-[#0F172A]'
              }`}
            >
              New Workspace
            </button>
          </div>

          {/* Alert / Notice Banners */}
          {notice && (
            notice.isInfo ? (
              <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#10B981]/30 text-[#065F46] text-xs flex items-center gap-2.5 font-medium">
                <Sparkles className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>{notice.message}</span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-[#FFF1F2] border border-[#F43F5E]/30 text-[#F43F5E] text-xs flex items-center gap-2.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{notice.message}</span>
              </div>
            )
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-slate-50 border border-black/[0.08] focus:border-[#5850EC] focus:ring-2 focus:ring-[#5850EC]/20 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-slate-50 border border-black/[0.08] focus:border-[#5850EC] focus:ring-2 focus:ring-[#5850EC]/20 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] placeholder-slate-400 outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {mode === 'login'
                  ? 'Enter your email to load your existing profile and telemetry.'
                  : 'Enter your email to start a new personalized StepNext workspace.'}
              </p>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full justify-center py-3 text-xs font-bold rounded-2xl gap-2 shadow-md shadow-[#5850EC]/25 hover:shadow-lg"
              disabled={loading}
            >
              <span>{loading ? 'Entering...' : mode === 'login' ? 'Enter StepNext' : 'Create & Enter StepNext'}</span>
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </Button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] font-mono text-slate-400">
          StepNext Autonomous Decision Intelligence
        </p>
      </div>
    </div>
  );
};
