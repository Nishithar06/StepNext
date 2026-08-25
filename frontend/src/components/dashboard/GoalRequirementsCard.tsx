import React, { useState } from 'react';
import { UserProfile } from '../../types/schema';
import { analyzeCareerGoal, GoalMilestone } from '../../utils/goalIntelligence';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  Target,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Flame,
  Check,
  AlertCircle
} from 'lucide-react';
import { TabType } from '../layout/Sidebar';

interface GoalRequirementsCardProps {
  profile: UserProfile | null;
  onNavigateTab: (tab: TabType) => void;
  onOpenOnboarding: () => void;
}

export const GoalRequirementsCard: React.FC<GoalRequirementsCardProps> = ({
  profile,
  onNavigateTab,
  onOpenOnboarding
}) => {
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const goalAnalysis = analyzeCareerGoal(
    profile?.career_goal,
    profile?.skills || [],
    profile?.skills_to_improve || []
  );

  const currentPhase: GoalMilestone = goalAnalysis.milestones[activePhaseIndex] || goalAnalysis.milestones[0];

  return (
    <Card level={2} className="relative overflow-hidden border-2 border-[#5850EC]/25 shadow-sm space-y-6">
      {/* Decorative top accent gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5850EC] via-[#3B82F6] to-[#10B981]" />

      {/* Header with Target Goal and Readiness */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1 border-b border-black/[0.06] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#5850EC] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              GOAL REQUIREMENTS & REQUIRED MILESTONES
            </span>
            <Badge variant="indigo" size="sm" className="font-mono text-[10px]">
              {goalAnalysis.domainFamily}
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] font-heading tracking-tight flex items-center gap-2">
            <span>Target: {goalAnalysis.normalizedTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl font-medium">
            {goalAnalysis.tagline}
          </p>
        </div>

        {/* Readiness Meter */}
        <div className="flex items-center gap-4 bg-slate-50 border border-black/[0.06] p-3 rounded-2xl shrink-0">
          <div className="space-y-1 text-right">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
              Goal Readiness
            </span>
            <div className="text-xl font-extrabold font-mono text-[#0F172A]">
              {goalAnalysis.readinessPercentage}%
            </div>
          </div>
          <div className="w-24">
            <Progress value={goalAnalysis.readinessPercentage} indicatorColor="bg-gradient-to-r from-[#5850EC] to-[#10B981]" size="default" />
            <span className="text-[9px] font-mono text-slate-400 mt-1 block text-right">
              {goalAnalysis.matchingSkills.length}/{goalAnalysis.requiredCompetencies.length} Skills
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenOnboarding}
            className="text-[10px] font-bold py-1 px-2.5 h-auto"
          >
            Edit Goal
          </Button>
        </div>
      </div>

      {/* 3-PHASE GOAL BREAKDOWN TABS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-[0.14em] text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#5850EC]" />
            REQUIRED 90-DAY MILESTONE PHASES
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Click phase to inspect deliverables
          </span>
        </div>

        {/* Phase Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {goalAnalysis.milestones.map((milestone, idx) => {
            const isActive = activePhaseIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhaseIndex(idx)}
                className={`text-left p-3.5 rounded-2xl border transition-all duration-200 space-y-1.5 ${
                  isActive
                    ? 'bg-gradient-to-br from-white to-[#EEF2FF] border-2 border-[#5850EC] shadow-sm ring-1 ring-[#5850EC]/30'
                    : 'bg-slate-50/80 border-black/[0.06] hover:border-black/[0.15] hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-mono font-bold text-[11px] ${isActive ? 'text-[#5850EC]' : 'text-slate-500'}`}>
                    0{idx + 1} {milestone.duration}
                  </span>
                  <Badge variant={isActive ? 'indigo' : 'outline'} size="sm" className="text-[9px]">
                    {milestone.recommendedHoursPerWeek}h/wk
                  </Badge>
                </div>
                <h4 className="text-xs font-bold text-[#0F172A] line-clamp-1">
                  {milestone.focusTitle}
                </h4>
              </button>
            );
          })}
        </div>

        {/* Active Phase Card Details */}
        {currentPhase && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-black/[0.08] space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.05] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase font-bold text-[#5850EC] tracking-wider">
                  {currentPhase.phaseName} • {currentPhase.duration}
                </span>
                <h3 className="text-base font-bold text-[#0F172A]">
                  {currentPhase.focusTitle}
                </h3>
              </div>
              <Badge variant="success" size="sm" className="font-mono self-start sm:self-auto">
                Target: {currentPhase.recommendedHoursPerWeek} hrs/week focus
              </Badge>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {currentPhase.description}
            </p>

            {/* Key Deliverables Checklist */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                REQUIRED DELIVERABLES & PROOF OF WORK FOR THIS PHASE:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {currentPhase.keyDeliverables.map((item, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-3 rounded-xl bg-white border border-black/[0.06] text-xs font-medium text-[#0F172A] flex items-start gap-2 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* REQUIRED SKILLS & PREREQUISITES MATRIX */}
      <div className="space-y-3 pt-2 border-t border-black/[0.06]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-[0.14em] text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#5850EC]" />
            REQUIRED CORE COMPETENCIES FOR {goalAnalysis.normalizedTitle.toUpperCase()}
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            <span className="text-[#10B981] font-bold">● Acquired ({goalAnalysis.matchingSkills.length})</span> &nbsp;|&nbsp;
            <span className="text-[#5850EC] font-bold">○ To Acquire ({goalAnalysis.skillsToAcquire.length})</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {goalAnalysis.requiredCompetencies.map((skill, sIdx) => {
            const hasSkill = goalAnalysis.matchingSkills.includes(skill);
            return (
              <Badge
                key={sIdx}
                variant={hasSkill ? 'success' : 'indigo'}
                size="default"
                className="gap-1.5 text-xs py-1.5 px-3 rounded-xl font-medium"
              >
                {hasSkill ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Target className="w-3.5 h-3.5 text-[#5850EC]" />
                )}
                <span>{skill}</span>
                <span className="text-[9px] opacity-75 font-mono">
                  {hasSkill ? '(READY)' : '(REQUIRED)'}
                </span>
              </Badge>
            );
          })}
        </div>
      </div>

      {/* RECOMMENDED TIME BUDGET & ACTION CTA */}
      <div className="p-4 rounded-2xl bg-[#5850EC]/[0.04] border border-[#5850EC]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#5850EC]" />
            <span className="text-xs font-bold text-[#0F172A]">
              Recommended Investment: {goalAnalysis.recommendedWeeklyHours.total} hrs/week
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            {goalAnalysis.recommendedWeeklyHours.coreLearning}h Core Study + {goalAnalysis.recommendedWeeklyHours.practicalProjects}h Projects + {goalAnalysis.recommendedWeeklyHours.reviewAndOutreach}h Outreach
          </p>
        </div>

        <Button
          variant="gradient"
          size="sm"
          onClick={() => onNavigateTab('simulator')}
          className="gap-1.5 font-bold shadow-md shadow-[#5850EC]/20 shrink-0"
        >
          <span>Simulate 90-Day Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
};
