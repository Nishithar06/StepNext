import React, { useState } from 'react';
import { DerivedProfile, UserProfile } from '../types/schema';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
import { Button } from './common/Button';
import { Skeleton } from './common/Skeleton';
import { InfoTab } from './common/InfoTab';
import { Brain, RefreshCw, ShieldCheck, Target, AlertTriangle, Compass, BookOpen, Sparkles, Award } from 'lucide-react';

interface DigitalTwinViewProps {
  digitalTwin: DerivedProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  onRefreshTwin: () => Promise<void>;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({
  digitalTwin,
  profile,
  loading,
  onRefreshTwin
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefreshTwin();
    setRefreshing(false);
  };

  if (loading && !digitalTwin) {
    return (
      <Card title="Digital Twin Persona">
        <Skeleton lines={4} />
      </Card>
    );
  }

  if (!digitalTwin) {
    return (
      <Card title="Digital Twin Persona">
        <p className="text-xs text-[#667085]">
          No Digital Twin generated yet. Edit your profile to analyze your persona.
        </p>
      </Card>
    );
  }

  const skillsText = profile?.skills && profile.skills.length > 0
    ? profile.skills.join(', ')
    : 'Photography basics, DSLR handling';

  const goalText = profile?.career_goal ||
    'Become a highly skilled Wildlife Photographer and build a professional career documenting wildlife and conservation';

  const motivationText = profile?.short_term_goal ||
    (digitalTwin.motivations && digitalTwin.motivations.length > 0
      ? digitalTwin.motivations.join(', ')
      : 'Achieving short-term milestone: Build a strong wildlife photography portfolio and complete 3 real-world projects');

  const growthText = profile?.skills_to_improve && profile.skills_to_improve.length > 0
    ? profile.skills_to_improve.join(', ')
    : digitalTwin.strengths && digitalTwin.strengths.length > 0
    ? digitalTwin.strengths.join(', ')
    : 'Advanced camera techniques, field tracking & lighting';

  const riskText = digitalTwin.risk_factors && digitalTwin.risk_factors.length > 0
    ? digitalTwin.risk_factors.join(' • ')
    : 'Observed execution velocity friction; protect available weekly study & field hours';

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-[#FAF9F5] to-[#F0EEFF] border border-[#635BFF]/30 rounded-[28px] p-6 lg:p-8 light-card-shadow">
        <div className="space-y-1 min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] font-mono flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-[#635BFF] shrink-0" /> DIGITAL TWIN PERSONA
          </span>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#171827] font-heading flex items-center gap-2 break-words">
            ✦ COGNITIVE PROFILE & TRAJECTORY ALIGNMENT
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed break-words max-w-3xl">
            Synthetic cognitive persona synthesized from your raw profile, career parameters, and real-time execution signals.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          isLoading={refreshing}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          className="shrink-0 self-start sm:self-center"
        >
          Re-analyze
        </Button>
      </div>

      {/* 2-Column Responsive Layout: Left Overview + Right Structured 5-Card Vertical Info Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* Left Column: Core Persona Overview */}
        <Card level={2} className="lg:col-span-6 p-6 space-y-5 min-w-0 h-full flex flex-col justify-between">
          <div className="space-y-4 min-w-0">
            <div className="flex items-center justify-between border-b border-[#E5E5DC] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#667085] font-mono flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#635BFF] shrink-0" /> IDENTITY & BEHAVIOR
              </span>
              <Badge variant="indigo" className="text-[10px] font-mono font-bold">
                SYNTHESIZED
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-[#171827] leading-relaxed break-words font-medium">
              {digitalTwin.personality}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#E5E5DC]">
            <InfoTab
              label="LEARNING STYLE"
              icon={<BookOpen className="w-4 h-4 text-[#635BFF] shrink-0" />}
              value={digitalTwin.learning_style}
              variant="indigo"
              layout="inline"
            />

            <InfoTab
              label="CAREER ALIGNMENT"
              icon={<Target className="w-4 h-4 text-[#32C6A6] shrink-0" />}
              value={digitalTwin.career_alignment}
              variant="green"
              layout="inline"
            />
          </div>
        </Card>

        {/* Right Column: ONE Unified PROFILE SIGNALS Panel */}
        <Card level={2} className="lg:col-span-6 p-6 space-y-4 min-w-0 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#E5E5DC] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085] font-mono flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#635BFF] shrink-0" /> PROFILE SIGNALS
            </h3>
            <Badge variant="indigo" className="text-[10px] font-mono font-bold">
              5 ATTRIBUTES
            </Badge>
          </div>

          <div className="space-y-4 min-w-0 flex-1">
            {/* 1. SKILLS */}
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[#635BFF] block">
                SKILLS
              </span>
              <p className="text-xs sm:text-sm text-[#171827] leading-relaxed break-words font-medium">
                {skillsText}
              </p>
            </div>

            <div className="border-t border-[#E5E5DC]" />

            {/* 2. GOAL */}
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[#635BFF] block">
                GOAL
              </span>
              <p className="text-xs sm:text-sm text-[#171827] leading-relaxed break-words font-medium">
                {goalText}
              </p>
            </div>

            <div className="border-t border-[#E5E5DC]" />

            {/* 3. MOTIVATION */}
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[#D97706] block">
                MOTIVATION
              </span>
              <p className="text-xs sm:text-sm text-[#171827] leading-relaxed break-words font-medium">
                {motivationText}
              </p>
            </div>

            <div className="border-t border-[#E5E5DC]" />

            {/* 4. GROWTH */}
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[#219B81] block">
                GROWTH
              </span>
              <p className="text-xs sm:text-sm text-[#171827] leading-relaxed break-words font-medium">
                {growthText}
              </p>
            </div>

            <div className="border-t border-[#E5E5DC]" />

            {/* 5. RISK */}
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[#D84B3B] block">
                RISK
              </span>
              <p className="text-xs sm:text-sm text-[#171827] leading-relaxed break-words font-medium">
                {riskText}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
