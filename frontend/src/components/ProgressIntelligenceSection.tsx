import React from 'react';
import { ProgressSummary } from '../types/schema';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
import { ProgressBar } from './common/ProgressBar';
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
      <Card level={2} className="p-8 text-center space-y-4 animate-pulse border-2 border-[#635BFF]">
        <BrainCircuit className="w-8 h-8 text-[#635BFF] mx-auto animate-spin" />
        <h3 className="text-base font-extrabold text-[#171827] uppercase tracking-wider font-heading">
          ANALYZING EXECUTION INTELLIGENCE...
        </h3>
        <p className="text-xs text-[#667085]">
          Calculating execution velocity, completion trends, and adaptive workload recommendations...
        </p>
      </Card>
    );
  }

  // State A: No Roadmap
  if (!progress || progress.scenario === "None") {
    return (
      <Card level={2} className="p-8 text-center space-y-4 border-2 border-dashed border-[#E5E5DC]">
        <BrainCircuit className="w-10 h-10 text-[#635BFF] mx-auto opacity-70" />
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-[#171827] uppercase tracking-wider font-heading">
            PROGRESS INTELLIGENCE INACTIVE
          </h3>
          <p className="text-xs text-[#667085] max-w-md mx-auto">
            Complete a Future Simulation to create your first roadmap and unlock adaptive progress intelligence.
          </p>
        </div>
      </Card>
    );
  }

  // State B: Roadmap exists but no check-ins yet
  if (progress.completion_trend === "insufficient_data" && progress.weekly_history_trend.length === 0) {
    return (
      <Card level={2} className="p-8 text-center space-y-4 border-2 border-[#635BFF]/30 bg-[#635BFF]/5">
        <BrainCircuit className="w-10 h-10 text-[#635BFF] mx-auto" />
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-[#171827] uppercase tracking-wider font-heading">
            WEEKLY PROGRESS
          </h3>
          <p className="text-xs text-[#667085] max-w-md mx-auto">
            No check-in data yet. Complete your first check-in to start tracking execution.
          </p>
        </div>
      </Card>
    );
  }

  const rec = progress.adaptive_recommendation;

  const renderTrendIcon = () => {
    if (progress.completion_trend === 'improving') {
      return <span className="text-[#32C6A6] font-bold flex items-center gap-1"><TrendingUp className="w-4 h-4" /> ↑ Improving ({progress.execution_velocity > 0 ? `+${progress.execution_velocity}%` : ''})</span>;
    }
    if (progress.completion_trend === 'declining') {
      return <span className="text-[#FF7A6B] font-bold flex items-center gap-1"><TrendingDown className="w-4 h-4" /> ↓ Declining ({progress.execution_velocity}%</span>;
    }
    if (progress.completion_trend === 'stable') {
      return <span className="text-[#635BFF] font-bold flex items-center gap-1"><Minus className="w-4 h-4" /> → Stable</span>;
    }
    return <span className="text-[#667085] font-bold flex items-center gap-1"><HelpCircle className="w-4 h-4" /> • Insufficient Data</span>;
  };

  return (
    <section id="section-progress" className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-6 pt-6 border-t border-[#E5E5DC]">
      {/* 1. HERO / HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-white via-[#FAF9F5] to-[#F0EEFF] border border-[#635BFF]/30 rounded-[28px] p-6 lg:p-8 light-card-shadow">
        <div className="space-y-1.5 min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] font-mono flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4 text-[#635BFF] shrink-0" /> PROGRESS INTELLIGENCE
          </span>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#171827] font-heading flex items-center gap-2 break-words">
            ✦ ADAPTIVE EXECUTION PROFILE
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed break-words">
            Real-time execution velocity, streak tracking, and adaptive recommendations learned from your actual check-in data.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 shrink-0 min-w-0 max-w-full md:max-w-[320px]">
          <Badge variant="indigo" className="text-xs px-3.5 py-1 font-mono font-bold whitespace-normal break-words text-left md:text-right">
            Workload: {progress.workload_signal}
          </Badge>
          <span className="text-xs font-mono text-[#667085] break-words text-left md:text-right">
            Target: <strong className="text-[#171827]">{progress.scenario.toUpperCase()}</strong>
          </span>
        </div>
      </div>

      {/* 2. DIRECTION SIGNAL */}
      <div className="p-5 rounded-[24px] bg-[#FAF9F5] border border-[#635BFF]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs min-w-0">
        <div className="flex items-start md:items-center gap-3 min-w-0 flex-1">
          <Activity className="w-5 h-5 text-[#635BFF] shrink-0 mt-0.5 md:mt-0" />
          <div className="min-w-0 flex-1 font-mono text-[#667085] leading-relaxed break-words">
            <strong className="text-[#171827] uppercase tracking-wider block sm:inline mr-1">WHAT THIS MEANS FOR YOUR DIRECTION:</strong>
            <span className="text-[#171827] font-medium">
              {progress.completion_trend === 'improving'
                ? `Your execution is strengthening (${progress.latest_week_completion_percentage}%). Your ${progress.scenario} direction is becoming increasingly credible.`
                : progress.completion_trend === 'declining'
                ? `Execution velocity dipped recently. Stabilize your weekly action velocity before reconsidering long-term direction.`
                : `Your execution is steady (${progress.latest_week_completion_percentage}%). Protect core priorities.`}
            </span>
          </div>
        </div>
        <Badge variant="indigo" className="text-[10px] shrink-0 font-mono self-start md:self-center">
          PROGRESS SIGNAL
        </Badge>
      </div>

      {/* 3. CORE METRICS CARDS (3-COLUMN GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Execution Velocity */}
        <Card level={2} className="p-6 space-y-4 flex flex-col justify-between h-full min-w-0">
          <div className="space-y-3 min-w-0">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#667085] uppercase tracking-wider font-mono flex items-center gap-1">
                {renderTrendIcon()} EXECUTION VELOCITY
              </span>
              <span className="text-xl font-black font-mono text-[#635BFF]">
                {progress.overall_execution_percentage}%
              </span>
            </div>

            <ProgressBar value={progress.overall_execution_percentage} color="bg-[#635BFF]" showPercentage={false} />

            <p className="text-xs text-[#667085] leading-relaxed break-words">
              Latest week: <strong>{progress.latest_week_completion_percentage}%</strong> (Prev: {progress.previous_week_completion_percentage}%)
            </p>

            {/* Mini Weekly Bar Chart */}
            {progress.weekly_history_trend && progress.weekly_history_trend.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t border-[#E5E5DC]">
                <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">Recent Weeks</span>
                <div className="flex items-end gap-2 h-16 pt-2">
                  {progress.weekly_history_trend.slice().reverse().map((pct, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-mono text-[#667085]">{pct}%</span>
                      <div
                        className="w-full bg-gradient-to-t from-[#635BFF] to-[#32C6A6] rounded-t-md transition-all duration-300"
                        style={{ height: `${Math.max(15, pct)}%` }}
                      />
                      <span className="text-[9px] font-mono text-[#667085]">W{progress.weekly_history_trend.length - idx}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <InfoTab
            label="STATUS"
            value={progress.completion_trend === 'improving' ? 'Accelerating completion' : progress.completion_trend === 'declining' ? 'Velocity slowing down' : 'Maintaining pace'}
            variant="neutral"
            layout="inline"
          />
        </Card>

        {/* Card 2: Streak & Consistency */}
        <Card level={2} className="p-6 space-y-4 flex flex-col justify-between h-full min-w-0">
          <div className="space-y-3 min-w-0">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#667085] uppercase tracking-wider font-mono flex items-center gap-1">
                <Flame className="w-4 h-4 text-[#FF7A6B]" /> EXECUTION STREAK
              </span>
              <span className="text-xl font-black font-mono text-[#FF7A6B]">
                {progress.current_execution_streak} WKS
              </span>
            </div>

            <ProgressBar value={Math.min(100, progress.current_execution_streak * 25)} color="bg-[#FF7A6B]" showPercentage={false} />

            <p className="text-xs text-[#667085] leading-relaxed break-words">
              Consecutive weeks maintaining meaningful execution velocity toward your {progress.scenario} trajectory.
            </p>
          </div>

          <InfoTab
            label="ACTIONS COMPLETED"
            value={`${progress.total_actions_completed} / ${progress.total_actions_planned}`}
            variant="green"
            layout="inline"
          />
        </Card>

        {/* Card 3: What LifePilot Learned */}
        <Card level={2} className="p-6 space-y-4 flex flex-col justify-between h-full min-w-0 bg-gradient-to-b from-white to-[#635BFF]/5 border-2 border-[#635BFF]/30 md:col-span-2 lg:col-span-1">
          <div className="space-y-2 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] font-mono flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#635BFF] shrink-0" /> WHAT LIFEPILOT LEARNED
            </span>
            <h4 className="text-sm font-bold text-[#171827] font-heading leading-snug break-words">
              "{rec.title}"
            </h4>
            <p className="text-xs text-[#667085] leading-relaxed break-words">
              {rec.message}
            </p>
          </div>

          <div className="pt-2 border-t border-[#E5E5DC]">
            <Badge variant={rec.recommendation_type === 'reduce_workload' ? 'red' : rec.recommendation_type === 'increase_depth' ? 'green' : 'indigo'} className="text-[10px] font-mono whitespace-normal break-words">
              Strategy: {rec.recommendation_type.toUpperCase().replace('_', ' ')}
            </Badge>
          </div>
        </Card>
      </div>

      {/* 4. ADAPTIVE STRATEGY & PRIORITY FOCUS (FULL WIDTH SECTION) */}
      <Card level={2} className="p-6 lg:p-8 space-y-6 w-full min-w-0">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085] font-mono flex items-center gap-2 border-b border-[#E5E5DC] pb-3">
          <Activity className="w-4 h-4 text-[#635BFF] shrink-0" /> ADAPTIVE STRATEGY & PRIORITY FOCUS
        </h3>

        {/* Strategy Summary Banner */}
        <InfoTab
          label="STRATEGY"
          badge={<Badge variant="indigo" className="text-[10px] font-mono font-bold px-3 py-1">{rec.recommendation_type.toUpperCase().replace('_', ' ')}</Badge>}
          variant="purple"
          layout="stacked"
        >
          <strong className="text-[#171827] block text-sm sm:text-base font-bold mb-1">"{rec.title}"</strong>
          <span>{rec.message}</span>
        </InfoTab>

        {/* Recommended Priority Actions (Horizontal 3-Column Grid) */}
        {rec.priority_actions.length > 0 && (
          <div className="space-y-3 min-w-0 pt-2">
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono block">
              RECOMMENDED PRIORITY ACTIONS
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
              {rec.priority_actions.map((actTitle, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-[#E5E5DC] flex flex-col justify-between gap-3 min-w-0 light-card-shadow transition-all hover:border-[#635BFF]/40"
                >
                  <div className="flex items-center gap-2 text-[#635BFF]">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-mono font-bold text-[#635BFF]">ACTION {idx + 1}</span>
                  </div>
                  <p className="text-xs font-medium text-[#171827] leading-relaxed break-words min-w-0 flex-1">
                    {actTitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WHAT TO TRACK (ULTRA-COMPACT FLAT CARDLESS NUMBERED LIST) */}
        <div className="space-y-3 min-w-0 pt-4 border-t border-[#E5E5DC] w-full">
          <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#32C6A6] shrink-0" /> WHAT TO TRACK (METRICS)
          </span>

          <div className="flex flex-col gap-3 w-full min-w-0 pt-1">
            {/* Row 01: Overall Execution Velocity */}
            <div className="space-y-1.5 w-full min-w-0">
              <div className="flex items-center justify-between gap-3 w-full min-w-0">
                <h4 className="text-base font-extrabold text-[#171827] font-heading break-words min-w-0 leading-tight flex items-center gap-2">
                  <span className="font-mono text-[#635BFF] font-black text-base shrink-0">01.</span>
                  <span>Overall Execution Velocity</span>
                </h4>
                <Badge variant="green" className="shrink-0 text-xs font-mono font-bold px-3 py-0.5 self-center">
                  TARGET: 85%+
                </Badge>
              </div>
              <div className="space-y-1 w-full min-w-0 pl-6 sm:pl-7">
                <div className="flex justify-between items-center text-xs font-mono text-[#667085] px-0.5">
                  <span className="font-semibold text-[#171827]">{progress.overall_execution_percentage}%</span>
                  <span className="font-bold text-[#32C6A6]">85%+</span>
                </div>
                <ProgressBar value={Math.min(100, Math.max(5, progress.overall_execution_percentage))} color="bg-gradient-to-r from-[#635BFF] to-[#32C6A6]" showPercentage={false} height="h-[6px]" />
              </div>
            </div>

            {/* Row 02: Execution Streak Consistency */}
            <div className="space-y-1.5 w-full min-w-0">
              <div className="flex items-center justify-between gap-3 w-full min-w-0">
                <h4 className="text-base font-extrabold text-[#171827] font-heading break-words min-w-0 leading-tight flex items-center gap-2">
                  <span className="font-mono text-[#FF7A6B] font-black text-base shrink-0">02.</span>
                  <span>Execution Streak Consistency</span>
                </h4>
                <Badge variant="amber" className="shrink-0 text-xs font-mono font-bold px-3 py-0.5 self-center">
                  TARGET: 4+ WEEKS
                </Badge>
              </div>
              <div className="space-y-1 w-full min-w-0 pl-6 sm:pl-7">
                <div className="flex justify-between items-center text-xs font-mono text-[#667085] px-0.5">
                  <span className="font-semibold text-[#171827]">{progress.current_execution_streak} Wks</span>
                  <span className="font-bold text-[#32C6A6]">4+ Wks</span>
                </div>
                <ProgressBar value={Math.min(100, Math.max(10, progress.current_execution_streak * 25))} color="bg-gradient-to-r from-[#FF7A6B] to-[#32C6A6]" showPercentage={false} height="h-[6px]" />
              </div>
            </div>

            {/* Row 03: Action Throughput */}
            <div className="space-y-1.5 w-full min-w-0">
              <div className="flex items-center justify-between gap-3 w-full min-w-0">
                <h4 className="text-base font-extrabold text-[#171827] font-heading break-words min-w-0 leading-tight flex items-center gap-2">
                  <span className="font-mono text-[#635BFF] font-black text-base shrink-0">03.</span>
                  <span>Action Throughput & Planned Ratio</span>
                </h4>
                <Badge variant="indigo" className="shrink-0 text-xs font-mono font-bold px-3 py-0.5 self-center">
                  TARGET: {progress.total_actions_planned} ACTIONS
                </Badge>
              </div>
              <div className="space-y-1 w-full min-w-0 pl-6 sm:pl-7">
                <div className="flex justify-between items-center text-xs font-mono text-[#667085] px-0.5">
                  <span className="font-semibold text-[#171827]">{progress.total_actions_completed} Completed</span>
                  <span className="font-bold text-[#32C6A6]">{progress.total_actions_planned} Planned</span>
                </div>
                <ProgressBar value={progress.total_actions_planned > 0 ? Math.min(100, Math.round((progress.total_actions_completed / progress.total_actions_planned) * 100)) : 0} color="bg-[#635BFF]" showPercentage={false} height="h-[6px]" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 5. MISSED / NEEDS ATTENTION (FULL WIDTH STACKED SECTION BELOW) */}
      <Card level={2} className="p-6 lg:p-8 space-y-6 w-full min-w-0">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085] font-mono flex items-center gap-2 border-b border-[#E5E5DC] pb-3">
          <AlertTriangle className="w-4 h-4 text-[#FF7A6B] shrink-0" /> MISSED / NEEDS ATTENTION
        </h3>

        {progress.missed_actions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#219B81] space-y-2 bg-[#32C6A6]/10 rounded-2xl border border-[#32C6A6]/30 min-w-0">
            <CheckCircle2 className="w-8 h-8 text-[#32C6A6] mx-auto" />
            <p className="font-bold text-base">No Missed Actions</p>
            <p className="text-xs text-[#667085] leading-relaxed max-w-md mx-auto">
              You are currently 100% up to date on your weekly roadmap activities!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
            {progress.missed_actions.map(item => (
              <div
                key={item.action_id}
                className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E5E5DC] flex flex-col justify-between gap-4 min-w-0 transition-all hover:border-[#FF7A6B]/40"
              >
                {/* Title & Category Metadata */}
                <div className="min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#FF7A6B] uppercase tracking-wider block">
                      NEEDS ATTENTION
                    </span>
                    <span className="text-[11px] font-mono text-[#667085]">
                      Category: <strong className="text-[#171827] font-semibold">{item.category}</strong>
                    </span>
                  </div>

                  <h4 className="text-sm lg:text-base font-bold text-[#171827] font-heading leading-snug break-words overflow-wrap-anywhere whitespace-normal min-w-0">
                    {item.title}
                  </h4>
                </div>

                {/* Bottom Row: Status Text & Badge */}
                <div className="flex w-full items-center justify-between gap-3 pt-3 border-t border-[#E5E5DC] min-w-0">
                  <span className="flex-1 min-w-0 text-xs font-mono text-[#667085] whitespace-normal leading-snug">
                    Incomplete in check-in history
                  </span>

                  <Badge
                    variant={item.insight_type === 'needs_review' ? 'red' : 'amber'}
                    className="shrink-0 whitespace-nowrap text-[10px] font-mono font-bold px-2.5 py-1"
                  >
                    {item.insight_type === 'needs_review' ? 'NEEDS REVIEW' : 'CARRY FORWARD'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
};
