import React, { useState } from 'react';
import { DerivedProfile, UserProfile } from '../types/schema';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { Skeleton } from '../components/common/Skeleton';
import { Brain, RefreshCw, ShieldCheck, Target, AlertTriangle, UserCheck } from 'lucide-react';

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
      className="relative group cursor-pointer flex flex-col items-center justify-center p-2 select-none bg-transparent border-none shadow-none outline-none shrink-0"
      title="Your Digital Twin"
    >
      {/* Soft circular background ambient radial aura glow */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-300 pointer-events-none ${
          isHovered
            ? 'bg-gradient-to-tr from-[#635BFF]/30 via-[#32C6A6]/20 to-[#635BFF]/40 blur-2xl scale-125 opacity-100'
            : 'bg-[#635BFF]/10 blur-xl scale-100 opacity-60'
        }`}
      />

      {/* Subtle circular expanding pulse ring on hover */}
      <div
        className={`absolute inset-1 rounded-full border border-[#635BFF]/40 transition-all duration-500 pointer-events-none ${
          isHovered ? 'animate-ping opacity-30 border-[#635BFF]' : 'opacity-0 scale-95'
        }`}
      />

      {/* Transparent, borderless structural figure wrapper (Moderate Balanced 88px x 108px Scale) */}
      <div
        className={`relative z-10 w-[130px] h-[130px] bg-transparent border-none shadow-none outline-none flex flex-col items-center justify-center transition-all duration-300 ${
          isHovered ? 'scale-[1.04]' : 'scale-100'
        }`}
      >
        {/* Moderate Balanced Human Silhouette Figure */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-[88px] h-[108px] transition-all duration-300 ${
            isHovered
              ? 'text-[#635BFF] scale-105 drop-shadow-[0_0_12px_rgba(99,91,255,0.65)]'
              : 'text-[#635BFF]/90 scale-100'
          }`}
        >
          <circle cx="12" cy="4" r="3" />
          <path d="M7 15V10C7 9 7.5 8 9 8H15C16.5 8 17 9 17 10V15" />
          <path d="M9.5 8.5V20.5C9.5 21 10 21.5 10.5 21.5C11 21.5 11.5 21 11.5 20.5V14.5H12.5V20.5C12.5 21 13 21.5 13.5 21.5C14 21.5 14.5 21 14.5 20.5V8.5" />
        </svg>

        {/* Floating micro-label on hover */}
        <span
          className={`absolute -bottom-2 text-[9px] font-mono font-bold text-[#635BFF] bg-white border border-[#635BFF]/30 px-2 py-0.5 rounded-full shadow-sm transition-all duration-300 whitespace-nowrap ${
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
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefreshTwin();
    setRefreshing(false);
  };

  if (loading && !digitalTwin) {
    return (
      <div className="space-y-6">
        <Card title="My Digital Twin">
          <Skeleton lines={6} />
        </Card>
      </div>
    );
  }

  if (!digitalTwin) {
    return (
      <Card title="My Digital Twin">
        <p className="text-xs text-[#667085] mb-4">
          No Digital Twin model generated yet. Please complete onboarding.
        </p>
        <Button variant="primary" size="sm" onClick={onOpenOnboarding}>
          Edit Profile
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5DC] pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 font-mono">
            WHO AM I?
          </span>
          <h1 className="text-3xl font-extrabold text-[#171827] font-heading mt-0.5 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" /> My Digital Twin
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            A structured model built from the information you provide.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            isLoading={refreshing}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Re-analyze
          </Button>

          <Button variant="primary" size="sm" onClick={onOpenOnboarding}>
            Edit Profile
          </Button>
        </div>
      </div>

      {/* CENTRAL IDENTITY VISUALIZATION NODE CANVAS — BALANCED 3-COLUMN GRID */}
      <Card level={3} className="relative overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-[140px_280px_1fr] xl:grid-cols-[150px_300px_1fr] items-center gap-6 lg:gap-8">
          {/* COLUMN 1: LEFT — Human Figure (Dedicated 150px column) */}
          <div className="flex justify-center items-center">
            <DigitalTwinAvatar />
          </div>

          {/* COLUMN 2: MIDDLE — Profile Identity (Dedicated 280-300px column, single line title/name) */}
          <div className="space-y-1.5 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] font-mono whitespace-nowrap block">
              ACTIVE DIGITAL TWIN
            </span>
            <h2 className="text-2xl font-extrabold text-[#171827] font-heading whitespace-nowrap truncate">
              {profile?.name || 'User'}
            </h2>
            <p className="text-xs text-[#667085] leading-relaxed max-w-[290px]">
              {profile?.career_goal || 'AI / Software Engineering'} • {digitalTwin.learning_style}
            </p>
          </div>

          {/* COLUMN 3: RIGHT — Profile Insight Chips (Spacious horizontal layout, zero clipping) */}
          <div className="space-y-2 min-w-0 w-full">
            {/* Row 1: Skills & Goal (Side by Side) */}
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="indigo" icon={<span className="w-2 h-2 rounded-full bg-[#635BFF]" />} className="max-w-full">
                Skills: <span className="font-semibold">{profile?.skills?.slice(0, 2).join(', ') || 'Core Skills'}</span>
              </Badge>
              <Badge variant="neutral" icon={<span className="w-2 h-2 rounded-full bg-blue-500" />} className="max-w-full">
                Goal: <span className="font-semibold">{profile?.career_goal || 'Software Engineering'}</span>
              </Badge>
            </div>

            {/* Row 2: Motivation (Horizontally Spacious Pill) */}
            <div className="px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] text-xs flex items-start sm:items-center gap-2 text-[#171827] w-full">
              <span className="w-2 h-2 rounded-full bg-[#F5C96A] shrink-0 mt-1 sm:mt-0" />
              <div className="min-w-0 flex-1 leading-tight">
                <span className="font-bold text-[#667085] uppercase tracking-wider text-[10px] mr-1.5">Motivation:</span>
                <span className="font-medium text-[#171827] break-words">{digitalTwin.motivations?.[0] || 'Career Growth & Technical Leadership'}</span>
              </div>
            </div>

            {/* Row 3: Growth (Spacious Pill) */}
            <div className="px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] text-xs flex items-center gap-2 text-[#171827] w-full">
              <span className="w-2 h-2 rounded-full bg-[#32C6A6] shrink-0" />
              <div className="min-w-0 flex-1 leading-tight">
                <span className="font-bold text-[#667085] uppercase tracking-wider text-[10px] mr-1.5">Growth:</span>
                <span className="font-medium text-[#171827] break-words">{profile?.skills_to_improve?.[0] || digitalTwin.weaknesses?.[0] || 'Technical Mastery'}</span>
              </div>
            </div>

            {/* Row 4: Risk (Full Width Spacious Pill, soft red highlight) */}
            <div className="px-3 py-1.5 rounded-xl bg-[#FF7A6B]/10 border border-[#FF7A6B]/30 text-xs flex items-start gap-2 text-[#171827] w-full">
              <span className="w-2 h-2 rounded-full bg-[#FF7A6B] shrink-0 mt-1" />
              <div className="min-w-0 flex-1 leading-normal">
                <span className="font-bold text-[#FF7A6B] uppercase tracking-wider text-[10px] mr-1.5">Risk:</span>
                <span className="font-medium text-[#171827] break-words">{digitalTwin.risk_factors?.[0] || 'Schedule Overload during peak deadlines'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* CLEAR CREDIBILITY DISTINCTION: WHAT YOU TOLD vs WHAT STEPNEXT DERIVED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WHAT YOU TOLD STEPNEXT */}
        <Card level={2} title="WHAT YOU TOLD STEPNEXT" subtitle="Explicit user baseline inputs">
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC]">
              <span className="text-[#667085] block mb-1">Declared Career Goal</span>
              <span className="font-bold text-[#171827]">{profile?.career_goal || 'Senior AI Software Engineer'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC]">
              <span className="text-[#667085] block mb-1">Declared Current Skills</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile?.skills?.map((s, i) => (
                  <Badge key={i} variant="neutral">{s}</Badge>
                )) || <Badge variant="neutral">Python, React, FastAPI</Badge>}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC]">
              <span className="text-[#667085] block mb-1">Declared Skills to Develop</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile?.skills_to_improve?.map((s, i) => (
                  <Badge key={i} variant="indigo">{s}</Badge>
                )) || <Badge key="dsa" variant="indigo">DSA, System Design</Badge>}
              </div>
            </div>
          </div>
        </Card>

        {/* WHAT STEPNEXT DERIVED */}
        <Card level={2} title="WHAT STEPNEXT DERIVED" subtitle="Synthesized cognitive & behavior model">
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC]">
              <span className="text-[#667085] block mb-1">Derived Personality Pattern</span>
              <p className="text-[#171827] leading-relaxed font-semibold">{digitalTwin.personality}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC]">
              <span className="text-[#667085] block mb-1">Inferred Learning Model</span>
              <p className="text-[#171827] font-semibold">{digitalTwin.learning_style}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC]">
              <span className="text-[#667085] block mb-1">Synthesized Direction Match</span>
              <p className="text-[#171827] font-semibold">{digitalTwin.career_alignment}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* STRATEGIC ATTRIBUTES SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card level={2} title="Strategic Strengths">
          <div className="flex flex-wrap gap-1.5">
            {digitalTwin.strengths.map((str, idx) => (
              <Badge key={idx} variant="green" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                {str}
              </Badge>
            ))}
          </div>
        </Card>

        <Card level={2} title="Growth Areas">
          <div className="flex flex-wrap gap-1.5">
            {profile?.skills_to_improve?.map((skill, idx) => (
              <Badge key={idx} variant="indigo" icon={<Target className="w-3.5 h-3.5" />}>
                {skill}
              </Badge>
            )) || digitalTwin.weaknesses.map((w, idx) => (
              <Badge key={idx} variant="neutral">{w}</Badge>
            ))}
          </div>
        </Card>

        <Card level={2} title="Primary Motivations">
          <div className="flex flex-wrap gap-1.5">
            {digitalTwin.motivations.map((mot, idx) => (
              <Badge key={idx} variant="amber">
                {mot}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* RISK FACTORS & VULNERABILITIES */}
      <Card level={2} title="Risk Factors & Vulnerabilities">
        <div className="flex flex-wrap gap-2">
          {digitalTwin.risk_factors.map((rf, idx) => (
            <Badge key={idx} variant="red" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
              {rf}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
};
