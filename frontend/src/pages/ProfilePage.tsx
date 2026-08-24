import React from 'react';
import { UserProfile } from '../types/schema';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { User, Sparkles, RefreshCw, Target, Shield, Clock, Moon, Briefcase } from 'lucide-react';
import { useStaggerEntrance } from '../hooks/useGsap';

interface ProfilePageProps {
  profile: UserProfile | null;
  onOpenOnboarding: () => void;
  onResetProfile?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onOpenOnboarding, onResetProfile }) => {
  const containerRef = useStaggerEntrance('.stagger-card', [profile?.user_id]);

  return (
    <div ref={containerRef} className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="stagger-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-slate-500">
            ACCOUNT PREFERENCES
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading tracking-tight mt-0.5 flex items-center gap-2.5">
            <User className="w-7 h-7 text-[#5850EC]" /> Account & Baseline
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Your personal information, bandwidth constraints, and priority weights.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="default" size="sm" onClick={onOpenOnboarding} className="gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Button>

          {onResetProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetProfile}
              className="text-[#F43F5E] border-[#F43F5E]/30 hover:bg-[#FFF1F2] hover:border-[#F43F5E]/50 font-bold gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#F43F5E]" />
              <span>Reset Profile</span>
            </Button>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="stagger-card grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[26px] border border-black/[0.07] p-6 shadow-sm space-y-4">
          <div className="border-b border-black/[0.06] pb-3">
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.16em] text-[#5850EC]">
              IDENTITY & ACADEMICS
            </span>
            <h3 className="text-lg font-bold text-[#0F172A] font-heading">
              Personal Baseline
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-black/[0.04]">
              <span className="text-slate-500 font-mono text-[11px]">Full Name</span>
              <span className="font-bold text-[#0F172A]">{profile?.name || 'User'}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-black/[0.04]">
              <span className="text-slate-500 font-mono text-[11px]">Education Background</span>
              <span className="font-semibold text-slate-700">{profile?.education || 'Not specified'}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-black/[0.04]">
              <span className="text-slate-500 font-mono text-[11px]">Career Target</span>
              <span className="font-bold text-[#5850EC]">{profile?.career_goal || 'Software & AI Engineer'}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-black/[0.04]">
              <span className="text-slate-500 font-mono text-[11px]">Financial Weight</span>
              <span className="font-mono font-bold text-[#F59E0B]">{profile?.financial_priority ?? 7} / 10</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[26px] border border-black/[0.07] p-6 shadow-sm space-y-4">
          <div className="border-b border-black/[0.06] pb-3">
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.16em] text-[#5850EC]">
              BANDWIDTH CONSTRAINTS
            </span>
            <h3 className="text-lg font-bold text-[#0F172A] font-heading">
              Capacity & Buffer
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-black/[0.04]">
              <span className="text-slate-500 font-mono text-[11px]">Available Daily Buffer</span>
              <span className="font-mono font-bold text-[#0F172A]">{profile?.available_hours_per_day ?? 6.0} hours/day</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-black/[0.04]">
              <span className="text-slate-500 font-mono text-[11px]">Target Sleep Quota</span>
              <span className="font-mono font-semibold text-slate-700">{profile?.sleep_hours ?? 7.0} hours/night</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-black/[0.04]">
              <span className="text-slate-500 font-mono text-[11px]">Workload Level</span>
              <span className="font-bold text-[#F43F5E] uppercase font-mono">{profile?.workload ?? 'MEDIUM'}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-black/[0.04]">
              <span className="text-slate-500 font-mono text-[11px]">Active Tracks</span>
              <span className="font-mono font-bold text-purple-600">{profile?.major_commitments?.length ?? 0} tracks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Summary Card */}
      <div className="stagger-card bg-white rounded-[26px] border border-black/[0.07] p-6 shadow-sm space-y-5">
        <div className="border-b border-black/[0.06] pb-3">
          <span className="text-[9px] font-mono font-bold uppercase tracking-[0.16em] text-slate-400">
            TECHNICAL PROFILE
          </span>
          <h3 className="text-lg font-bold text-[#0F172A] font-heading">
            Skills & Development Focus
          </h3>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <span className="text-slate-500 font-mono font-bold uppercase tracking-wider text-[10px] block mb-2">Current Active Skills</span>
            <div className="flex flex-wrap gap-2">
              {profile?.skills?.map((sk, i) => (
                <Badge key={i} variant="success" size="default">{sk}</Badge>
              )) || <Badge variant="success" size="default">Python, React, FastAPI</Badge>}
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-mono font-bold uppercase tracking-wider text-[10px] block mb-2">Growth Target Skills</span>
            <div className="flex flex-wrap gap-2">
              {profile?.skills_to_improve?.map((sk, i) => (
                <Badge key={i} variant="indigo" size="default">{sk}</Badge>
              )) || <Badge variant="indigo" size="default">DSA, System Design</Badge>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
