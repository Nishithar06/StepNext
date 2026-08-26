import React from 'react';
import { ProgressSummary } from '../types/schema';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { InfoTab } from './common/InfoTab';
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Activity
} from 'lucide-react';

interface ProgressIntelligenceSectionProps {
  progress: ProgressSummary | null;
  loading: boolean;
}

export const ProgressIntelligenceSection: React.FC<ProgressIntelligenceSectionProps> = ({
  progress,
  loading
}) => {
  if (loading) {
    return (
      <Card level={2} className="p-8 text-center space-y-4 animate-pulse border-2 border-[#5850EC]">
        <BrainCircuit className="w-8 h-8 text-[#5850EC] mx-auto animate-spin" />
        <h3 className="text-base font-extrabold text-[#0F172A] uppercase tracking-wider font-heading">
          ANALYZING EXECUTION INTELLIGENCE...
        </h3>
        <p className="text-xs text-slate-500">
          Calculating execution velocity, completion trends, and adaptive workload recommendations...
        </p>
      </Card>
    );
  }

  // State A: No Roadmap
  if (!progress || progress.scenario === "None") {
    return (
      <Card level={2} className="p-8 text-center space-y-4 border border-dashed border-black/[0.1]">
        <BrainCircuit className="w-10 h-10 text-[#5850EC] mx-auto opacity-70" />
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-[#0F172A] uppercase tracking-wider font-heading">
            PROGRESS INTELLIGENCE INACTIVE
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Complete a Future Simulation to create your first roadmap and unlock adaptive progress intelligence.
          </p>
        </div>
      </Card>
    );
  }

  // State B: Roadmap exists but no check-ins yet
  if (progress.completion_trend === "insufficient_data" && progress.weekly_history_trend.length === 0) {
    return (
      <Card level={2} className="p-8 text-center space-y-4 border border-[#5850EC]/30 bg-[#EEF2FF]/60">
        <BrainCircuit className="w-10 h-10 text-[#5850EC] mx-auto" />
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-[#0F172A] uppercase tracking-wider font-heading">
            WEEKLY PROGRESS TRACKING
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            No check-in data yet. Complete your first daily or weekly check-in to start calculating velocity.
          </p>
        </div>
      </Card>
    );
  }

  const rec = progress.adaptive_recommendation;

  const renderTrendIcon = () => {
    if (progress.completion_trend === 'improving') {
      return <span className="text-[#10B981] font-bold flex items-center gap-1"><TrendingUp className="w-4 h-4" /> ↑ Improving ({progress.execution_velocity > 0 ? `+${progress.execution_velocity}%` : ''})</span>;
    }
    if (progress.completion_trend === 'declining') {
      return <span className="text-[#F43F5E] font-bold flex items-center gap-1"><TrendingDown className="w-4 h-4" /> ↓ Declining ({progress.execution_velocity}%)</span>;
    }
    if (progress.completion_trend === 'stable') {
      return <span className="text-[#5850EC] font-bold flex items-center gap-1"><Minus className="w-4 h-4" /> → Stable</span>;
    }
    return <span className="text-slate-500 font-bold flex items-center gap-1"><HelpCircle className="w-4 h-4" /> • Baseline</span>;
  };

  return (
    <section id="section-progress" className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-6 pt-6 border-t border-black/[0.06]">
      {/* 1. HERO / HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white via-[#FAFAF7] to-[#EEF2FF] border border-[#5850EC]/30 rounded-[28px] p-6 lg:p-8 shadow-[0_4px_24px_rgba(99,102,241,0.08)]">
        <div className="space-y-1.5 min-w-0 flex-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#5850EC] flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4 text-[#5850EC] shrink-0" /> PROGRESS INTELLIGENCE
          </span>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] font-heading flex items-center gap-2 break-words">
            ✦ Adaptive Execution Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words font-medium">
            Real-time execution velocity, streak tracking, and adaptive recommendations learned from your actual check-in data.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 shrink-0 min-w-0 max-w-full md:max-w-[320px]">
          <Badge variant="indigo" size="default" className="font-mono font-bold">
            Workload: {progress.workload_signal}
          </Badge>
          <span className="text-xs font-mono text-slate-500 break-words text-left md:text-right">
            Target: <strong className="text-[#0F172A]">{progress.scenario.toUpperCase()}</strong>
          </span>
        </div>
      </div>

      {/* 2. DIRECTION SIGNAL */}
      <div className="p-5 rounded-[24px] bg-slate-50 border border-black/[0.06] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs min-w-0">
        <div className="flex items-start md:items-center gap-3 min-w-0 flex-1">
          <Activity className="w-5 h-5 text-[#5850EC] shrink-0 mt-0.5 md:mt-0" />
          <div className="min-w-0 flex-1 font-mono text-slate-600 leading-relaxed break-words">
            <strong className="text-[#0F172A] uppercase tracking-wider block sm:inline mr-1">WHAT THIS MEANS FOR YOUR DIRECTION:</strong>
            <span className="text-[#0F172A] font-medium">
              {progress.completion_trend === 'improving'
                ? `Your execution is strengthening (${progress.latest_week_completion_percentage}%). Your ${progress.scenario} direction is becoming increasingly credible.`
                : progress.completion_trend === 'declining'
                ? `Execution velocity dipped recently. Stabilize your weekly action velocity before reconsidering long-term direction.`
                : `Your execution is steady (${progress.latest_week_completion_percentage}%). Protect core priorities.`}
            </span>
          </div>
        </div>
        <Badge variant="indigo" size="sm" className="font-mono self-start md:self-center">
          PROGRESS SIGNAL
        </Badge>
      </div>

      {/* 3. CORE METRICS CARDS (3-COLUMN GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Execution Velocity */}
        <div className="bg-white rounded-[26px] border border-black/[0.07] p-6 space-y-4 shadow-sm flex flex-col justify-between h-full min-w-0 hover:-translate-y-1 transition-transform">
          <div className="space-y-3 min-w-0">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-slate-500 uppercase text-[10px] tracking-wider flex items-center gap-1">
                {renderTrendIcon()}
              </span>
              <span className="text-2xl font-black font-mono text-[#5850EC]">
                {progress.overall_execution_percentage}%
              </span>
            </div>

            <Progress value={progress.overall_execution_percentage} indicatorColor="bg-gradient-to-r from-[#5850EC] to-[#6366F1]" />

            <p className="text-xs text-slate-600 leading-relaxed break-words font-medium">
              Latest week: <strong>{progress.latest_week_completion_percentage}%</strong> (Prev: {progress.previous_week_completion_percentage}%)
            </p>

            {/* Mini Weekly Bar Chart */}
            {progress.weekly_history_trend && progress.weekly_history_trend.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t border-black/[0.05]">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Recent Weeks</span>
                <div className="flex items-end gap-2 h-16 pt-2">
                  {progress.weekly_history_trend.slice().reverse().map((pct, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-mono text-slate-500">{pct}%</span>
                      <div
                        className="w-full bg-gradient-to-t from-[#5850EC] to-[#10B981] rounded-t-md transition-all duration-300"
                        style={{ height: `${Math.max(15, pct)}%` }}
                      />
                      <span className="text-[9px] font-mono text-slate-400">W{progress.weekly_history_trend.length - idx}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-black/[0.04] text-center">
            <span className="text-[10px] font-mono text-slate-500">
              {progress.completion_trend === 'improving' ? 'Accelerating velocity' : progress.completion_trend === 'declining' ? 'Velocity slowing down' : 'Maintaining steady pace'}
            </span>
          </div>
        </div>

        {/* Card 2: Streak & Consistency */}
        <div className="bg-white rounded-[26px] border border-black/[0.07] p-6 space-y-4 shadow-sm flex flex-col justify-between h-full min-w-0 hover:-translate-y-1 transition-transform">
          <div className="space-y-3 min-w-0">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-slate-500 uppercase text-[10px] tracking-wider flex items-center gap-1">
                <Flame className="w-4 h-4 text-[#F59E0B]" /> EXECUTION STREAK
              </span>
              <span className="text-2xl font-black font-mono text-[#F59E0B]">
                {progress.current_execution_streak} WKS
              </span>
            </div>

            <Progress value={Math.min(100, progress.current_execution_streak * 25)} indicatorColor="bg-gradient-to-r from-[#F59E0B] to-[#F43F5E]" />

            <p className="text-xs text-slate-600 leading-relaxed break-words font-medium">
              Consecutive weeks maintaining meaningful execution velocity toward your {progress.scenario} trajectory.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-black/[0.04] flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500 text-[10px]">ACTIONS COMPLETED</span>
            <span className="font-bold text-[#10B981]">{progress.total_actions_completed} / {progress.total_actions_planned}</span>
          </div>
        </div>

        {/* Card 3: What StepNext Learned */}
        <div className="bg-gradient-to-b from-white to-[#EEF2FF]/60 rounded-[26px] border border-[#5850EC]/30 p-6 space-y-4 shadow-sm flex flex-col justify-between h-full min-w-0 md:col-span-2 lg:col-span-1 hover:-translate-y-1 transition-transform">
          <div className="space-y-2 min-w-0">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5850EC] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#5850EC] shrink-0" /> WHAT STEPNEXT LEARNED
            </span>
            <h4 className="text-sm sm:text-base font-bold text-[#0F172A] font-heading leading-snug break-words">
              "{rec.title}"
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed break-words font-medium">
              {rec.message}
            </p>
          </div>

          <div className="pt-2 border-t border-black/[0.05]">
            <Badge variant={rec.recommendation_type === 'reduce_workload' ? 'destructive' : rec.recommendation_type === 'increase_depth' ? 'success' : 'indigo'} size="sm" className="font-mono">
              Strategy: {rec.recommendation_type.toUpperCase().replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
};
