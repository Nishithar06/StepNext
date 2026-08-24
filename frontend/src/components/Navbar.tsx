import React from 'react';
import { Activity, Database, Cpu, UserCheck, RefreshCw } from 'lucide-react';
import { HealthResponse } from '../types/schema';

interface NavbarProps {
  health: HealthResponse | null;
  apiConnected: boolean;
  userId: string;
  onOpenOnboarding: () => void;
  onRefreshData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  apiConnected,
  userId,
  onOpenOnboarding,
  onRefreshData
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <span className="text-xl">🚀</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-heading">
                LifePilot
              </h1>
              <span className="chip chip-indigo text-xs py-0.5 px-2">MVP v2.0</span>
            </div>
            <p className="text-xs text-slate-400">AI Decision-Support & Future Navigation</p>
          </div>
        </div>

        {/* Status Indicators & User Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* API Health */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            <Activity className={`w-3.5 h-3.5 ${apiConnected ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span className="text-slate-400">API:</span>
            <span className={apiConnected ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {apiConnected ? 'Connected' : 'Offline'}
            </span>
          </div>

          {/* Supabase DB Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            <Database className={`w-3.5 h-3.5 ${health?.supabase_connected ? 'text-cyan-400' : 'text-amber-400'}`} />
            <span className="text-slate-400">Supabase:</span>
            <span className={health?.supabase_connected ? 'text-cyan-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {health?.supabase_connected ? 'Connected' : 'Fallback Mode'}
            </span>
          </div>

          {/* Gemini AI Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            <Cpu className={`w-3.5 h-3.5 ${health?.gemini_connected ? 'text-purple-400' : 'text-slate-400'}`} />
            <span className="text-slate-400">Gemini AI:</span>
            <span className={health?.gemini_connected ? 'text-purple-400 font-semibold' : 'text-slate-400 font-semibold'}>
              {health?.gemini_connected ? 'Active' : 'Deterministic'}
            </span>
          </div>

          {/* User Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-300">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono font-medium">{userId}</span>
          </div>

          {/* Actions */}
          <button
            onClick={onRefreshData}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenOnboarding}
            className="btn-primary py-1 px-3 text-xs"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </header>
  );
};
