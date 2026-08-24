import React, { useState } from 'react';
import { DerivedProfile, UserProfile } from '../types/schema';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/common/Skeleton';
import { Brain, RefreshCw, ShieldCheck, Target, AlertTriangle, Sparkles, Compass } from 'lucide-react';
import { useStaggerEntrance } from '../hooks/useGsap';

interface DigitalTwinPageProps {
  digitalTwin: DerivedProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  onRefreshTwin: () => Promise<void>;
  onOpenOnboarding: () => void;
}

const DigitalTwinAvatar: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group cursor-pointer flex flex-col items-center justify-center p-2 select-none shrink-0"
      title="Your Digital Twin"
    >
      {/* Soft circular background ambient radial aura glow */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-300 pointer-events-none ${
          isHovered
            ? 'bg-gradient-to-tr from-[#5850EC]/30 via-[#10B981]/20 to-[#5850EC]/40 blur-2xl scale-125 opacity-100'
            : 'bg-[#5850EC]/10 blur-xl scale-100 opacity-60'
        }`}
      />

      {/* Subtle circular expanding pulse ring on hover */}
      <div
        className={`absolute inset-1 rounded-full border border-[#5850EC]/40 transition-all duration-500 pointer-events-none ${
          isHovered ? 'animate-ping opacity-30 border-[#5850EC]' : 'opacity-0 scale-95'
        }`}
      />

      {/* Transparent, borderless structural figure wrapper */}
      <div
        className={`relative z-10 w-[130px] h-[130px] flex flex-col items-center justify-center transition-all duration-300 ${
          isHovered ? 'scale-[1.05]' : 'scale-100'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-[88px] h-[108px] transition-all duration-300 ${
            isHovered
              ? 'text-[#5850EC] scale-105 drop-shadow-[0_0_14px_rgba(88,80,236,0.6)]'
              : 'text-[#5850EC]/90 scale-100'
          }`}
        >
          <circle cx="12" cy="4" r="3" />
          <path d="M7 15V10C7 9 7.5 8 9 8H15C16.5 8 17 9 17 10V15" />
          <path d="M9.5 8.5V20.5C9.5 21 10 21.5 10.5 21.5C11 21.5 11.5 21 11.5 20.5V14.5H12.5V20.5C12.5 21 13 21.5 13.5 21.5C14 21.5 14.5 21 14.5 20.5V8.5" />
        </svg>

        {/* Floating micro-label on hover */}
        <span
          className={`absolute -bottom-2 text-[9px] font-mono font-bold text-[#5850EC] bg-white border border-[#5850EC]/30 px-2 py-0.5 rounded-full shadow-sm transition-all duration-300 whitespace-nowrap ${
            isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95 pointer-events-none'
          }`}
        >
          ✦ DIGITAL TWIN ACTIVE
        </span>
      </div>
    </div>
  );
};

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({
  digitalTwin,
  profile,
  loading,
  onRefreshTwin,
  onOpenOnboarding
}) => {
  const containerRef = useStaggerEntrance('.stagger-card', [profile?.user_id]);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefreshTwin();
    setRefreshing(false);
  };

  if (loading && !digitalTwin) {
    return (
      <div className="space-y-6">
        <Card level={2} className="p-8">
          <Skeleton lines={6} />
        </Card>
      </div>
    );
  }

  if (!digitalTwin) {
    return (
      <Card level={2} className="p-8 text-center space-y-4">
        <p className="text-xs text-slate-500 font-mono">
          No Digital Twin model generated yet. Please complete onboarding.
        </p>
        <Button variant="default" size="sm" onClick={onOpenOnboarding}>
          Edit Profile
        </Button>
      </Card>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="stagger-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-purple-600">
            COGNITIVE & BEHAVIORAL IDENTITY
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading tracking-tight mt-0.5 flex items-center gap-2.5">
            <Brain className="w-7 h-7 text-purple-600" /> My Digital Twin
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            A structured model synthesizing your personality, learning style, and growth edges.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Re-analyzing...' : 'Re-analyze'}</span>
          </Button>

          <Button variant="default" size="sm" onClick={onOpenOnboarding}>
            Edit Profile
          </Button>
        </div>
      </div>

      {/* CENTRAL IDENTITY VISUALIZATION NODE CANVAS */}
      <div className="stagger-card bg-gradient-to-br from-white via-[#FAFAF7] to-[#F5F3FF] rounded-[28px] border border-purple-500/20 p-6 lg:p-8 shadow-[0_4px_24px_rgba(168,85,247,0.06)] relative overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-[140px_280px_1fr] xl:grid-cols-[150px_300px_1fr] items-center gap-6 lg:gap-8">
          {/* COLUMN 1: Avatar */}
          <div className="flex justify-center items-center">
            <DigitalTwinAvatar />
          </div>

          {/* COLUMN 2: Identity */}
          <div className="space-y-1.5 min-w-0">
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-[#5850EC] whitespace-nowrap block">
              SYNTHESIZED COGNITIVE MODEL
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading whitespace-nowrap truncate">
              {profile?.name || 'User'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {profile?.career_goal || 'AI / Software Engineering'} • {digitalTwin.learning_style}
            </p>
          </div>

          {/* COLUMN 3: Insight Chips */}
          <div className="space-y-2.5 min-w-0 w-full text-xs">
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="indigo" dot size="default">
                Skills: {profile?.skills?.slice(0, 2).join(', ') || 'Core Skills'}
              </Badge>
              <Badge variant="outline" size="default">
                Goal: {profile?.career_goal || 'Software Engineering'}
              </Badge>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 border border-black/[0.06] flex items-center gap-2 text-[#0F172A] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
              <div className="min-w-0 flex-1 leading-tight">
                <span className="font-mono font-bold text-slate-400 uppercase text-[9px] mr-1.5 tracking-wider">Motivation:</span>
                <span className="font-medium text-[#0F172A]">{digitalTwin.motivations?.[0] || 'Career Growth & Technical Mastery'}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 border border-black/[0.06] flex items-center gap-2 text-[#0F172A] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
              <div className="min-w-0 flex-1 leading-tight">
                <span className="font-mono font-bold text-slate-400 uppercase text-[9px] mr-1.5 tracking-wider">Growth Focus:</span>
                <span className="font-medium text-[#0F172A]">{profile?.skills_to_improve?.[0] || digitalTwin.weaknesses?.[0] || 'Technical Depth'}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFF1F2] border border-[#F43F5E]/20 flex items-center gap-2 text-[#0F172A]">
              <span className="w-2 h-2 rounded-full bg-[#F43F5E] shrink-0" />
              <div className="min-w-0 flex-1 leading-tight">
                <span className="font-mono font-bold text-[#F43F5E] uppercase text-[9px] mr-1.5 tracking-wider">Vulnerability:</span>
                <span className="font-medium text-[#0F172A]">{digitalTwin.risk_factors?.[0] || 'Schedule Overload during crunch periods'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREDIBILITY COMPARISON: DECLARED vs DERIVED */}
      <div className="stagger-card grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WHAT YOU TOLD STEPNEXT */}
        <div className="bg-white rounded-[26px] border border-black/[0.07] p-6 shadow-sm space-y-4">
          <div className="border-b border-black/[0.06] pb-3">
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.16em] text-slate-400">
              INPUT BASELINE
            </span>
            <h3 className="text-lg font-bold text-[#0F172A] font-heading">
              What You Declared
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-black/[0.05]">
              <span className="text-slate-400 font-mono uppercase text-[9px] block mb-1">Declared Career Goal</span>
              <span className="font-bold text-[#0F172A]">{profile?.career_goal || 'Senior AI Software Engineer'}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-black/[0.05]">
              <span className="text-slate-400 font-mono uppercase text-[9px] block mb-1">Active Core Skills</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile?.skills?.map((s, i) => (
                  <Badge key={i} variant="outline" size="sm">{s}</Badge>
                )) || <Badge variant="outline" size="sm">Python, React, FastAPI</Badge>}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-black/[0.05]">
              <span className="text-slate-400 font-mono uppercase text-[9px] block mb-1">Target Development Skills</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile?.skills_to_improve?.map((s, i) => (
                  <Badge key={i} variant="indigo" size="sm">{s}</Badge>
                )) || <Badge key="dsa" variant="indigo" size="sm">DSA, System Design</Badge>}
              </div>
            </div>
          </div>
        </div>

        {/* WHAT STEPNEXT DERIVED */}
        <div className="bg-white rounded-[26px] border border-black/[0.07] p-6 shadow-sm space-y-4">
          <div className="border-b border-black/[0.06] pb-3">
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.16em] text-[#5850EC]">
              COGNITIVE SYNTHESIS
            </span>
            <h3 className="text-lg font-bold text-[#0F172A] font-heading">
              What StepNext Synthesized
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-black/[0.05]">
              <span className="text-slate-400 font-mono uppercase text-[9px] block mb-1">Personality Pattern</span>
              <p className="text-[#0F172A] leading-relaxed font-semibold">{digitalTwin.personality}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-black/[0.05]">
              <span className="text-slate-400 font-mono uppercase text-[9px] block mb-1">Learning Model</span>
              <p className="text-[#0F172A] font-semibold">{digitalTwin.learning_style}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-black/[0.05]">
              <span className="text-slate-400 font-mono uppercase text-[9px] block mb-1">Trajectory Alignment</span>
              <p className="text-[#0F172A] font-semibold">{digitalTwin.career_alignment}</p>
            </div>
          </div>
        </div>
      </div>

      {/* STRATEGIC ATTRIBUTES SECTIONS */}
      <div className="stagger-card grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[24px] border border-black/[0.07] p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-slate-500">
            Strategic Strengths
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {digitalTwin.strengths.map((str, idx) => (
              <Badge key={idx} variant="success" size="default">
                ✓ {str}
              </Badge>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-black/[0.07] p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-slate-500">
            Growth Vectors
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {profile?.skills_to_improve?.map((skill, idx) => (
              <Badge key={idx} variant="indigo" size="default">
                ↑ {skill}
              </Badge>
            )) || digitalTwin.weaknesses.map((w, idx) => (
              <Badge key={idx} variant="outline" size="default">{w}</Badge>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-black/[0.07] p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-slate-500">
            Core Motivations
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {digitalTwin.motivations.map((mot, idx) => (
              <Badge key={idx} variant="warning" size="default">
                ★ {mot}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* RISK FACTORS & VULNERABILITIES */}
      <div className="stagger-card bg-white rounded-[24px] border border-black/[0.07] p-6 shadow-sm space-y-3">
        <h4 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-slate-500">
          Risk Factors & Vulnerabilities
        </h4>
        <div className="flex flex-wrap gap-2">
          {digitalTwin.risk_factors.map((rf, idx) => (
            <Badge key={idx} variant="destructive" size="default">
              ⚠ {rf}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
