import React, { useState } from 'react';
import { UserProfile } from '../../types/schema';
import { analyzeCareerGoal } from '../../utils/goalIntelligence';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Target,
  CheckCircle2,
  Clock,
  ArrowRight,
  Check,
  Circle
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

  const goalAnalysis = analyzeCareerGoal(
    profile?.career_goal,
    profile?.skills || [],
    profile?.skills_to_improve || []
  );

  const currentPhase = goalAnalysis.milestones[activePhaseIndex] || goalAnalysis.milestones[0];

  return (
    <div className="bg-white border border-black/[0.07] rounded-[24px] p-6 space-y-5 shadow-sm">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5850EC] to-[#10B981] rounded-t-[24px]" />

      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#5850EC] flex items-center gap-1.5">
            <Target className="w-3 h-3" />
            GOAL ROADMAP
          </span>
          <h2 className="text-lg font-extrabold text-[#0F172A] font-heading tracking-tight">
            {goalAnalysis.normalizedTitle}
          </h2>
          <p className="text-xs text-slate-500 font-medium">{goalAnalysis.tagline}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-center px-3 py-2 bg-slate-50 border border-black/[0.06] rounded-xl">
            <div className="text-base font-extrabold font-mono text-[#0F172A]">{goalAnalysis.readinessPercentage}%</div>
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Readiness</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenOnboarding}
            className="text-[11px] font-bold h-auto py-1.5 px-3"
          >
            Edit Goal
          </Button>
        </div>
      </div>

      {/* REQUIRED COMPETENCIES */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400 block">
          Required Competencies
          <span className="ml-2 text-[#10B981]">({goalAnalysis.matchingSkills.length} acquired)</span>
          <span className="ml-1 text-slate-400">/ ({goalAnalysis.skillsToAcquire.length} to learn)</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {goalAnalysis.requiredCompetencies.map((skill, idx) => {
            const acquired = goalAnalysis.matchingSkills.includes(skill);
            return (
              <span
                key={idx}
                className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                  acquired
                    ? 'bg-[#ECFDF5] border-[#10B981]/30 text-[#065F46]'
                    : 'bg-slate-50 border-black/[0.08] text-slate-600'
                }`}
              >
                {acquired
                  ? <Check className="w-3 h-3 text-[#10B981] shrink-0" />
                  : <Circle className="w-3 h-3 text-slate-300 shrink-0" />
                }
                {skill}
              </span>
            );
          })}
        </div>
      </div>

      {/* 90-DAY PHASES */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400 block">
          90-Day Milestone Phases
        </span>

        {/* Phase selector tabs */}
        <div className="grid grid-cols-3 gap-2">
          {goalAnalysis.milestones.map((m, idx) => {
            const isActive = activePhaseIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhaseIndex(idx)}
                className={`text-left p-3 rounded-2xl border transition-all text-xs space-y-0.5 ${
                  isActive
                    ? 'bg-[#5850EC] border-[#5850EC] text-white shadow-md shadow-[#5850EC]/20'
                    : 'bg-slate-50 border-black/[0.06] text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className={`text-[9px] font-mono font-bold uppercase ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                  Phase {idx + 1} · {m.recommendedHoursPerWeek}h/wk
                </div>
                <div className="font-bold leading-snug line-clamp-2">{m.focusTitle}</div>
              </button>
            );
          })}
        </div>

        {/* Active phase deliverables */}
        {currentPhase && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-black/[0.06] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#0F172A]">{currentPhase.focusTitle}</span>
              <Badge variant="success" size="sm" className="shrink-0 font-mono text-[10px]">
                {currentPhase.duration}
              </Badge>
            </div>
            <div className="space-y-1.5">
              {currentPhase.keyDeliverables.map((item, dIdx) => (
                <div key={dIdx} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER: Time budget + CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-black/[0.06]">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 text-[#5850EC]" />
          <span>
            <span className="font-bold text-[#0F172A]">{goalAnalysis.recommendedWeeklyHours.total} hrs/week</span>
            {' '}— {goalAnalysis.recommendedWeeklyHours.coreLearning}h study · {goalAnalysis.recommendedWeeklyHours.practicalProjects}h projects · {goalAnalysis.recommendedWeeklyHours.reviewAndOutreach}h outreach
          </span>
        </div>
        <Button
          variant="gradient"
          size="sm"
          onClick={() => onNavigateTab('simulator')}
          className="gap-1.5 font-bold shadow-md shadow-[#5850EC]/20 shrink-0"
        >
          Simulate Plan
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
