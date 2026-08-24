import React from 'react';
import { ActionRoadmap, RoadmapItem } from '../types/schema';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Badge } from './common/Badge';
import { ProgressBar } from './common/ProgressBar';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowRight,
  Clock
} from 'lucide-react';

interface ActionRoadmapSectionProps {
  roadmap: ActionRoadmap | null;
  loading: boolean;
  onToggleAction: (actionId: string) => Promise<void>;
  onStartExecution?: () => void;
}

export const ActionRoadmapSection: React.FC<ActionRoadmapSectionProps> = ({
  roadmap,
  loading,
  onToggleAction,
  onStartExecution
}) => {
  if (loading) {
    return (
      <Card level={2} className="p-8 text-center space-y-4 animate-pulse border-2 border-[#635BFF]">
        <Sparkles className="w-8 h-8 text-[#635BFF] mx-auto animate-spin" />
        <h3 className="text-base font-extrabold text-[#171827] uppercase tracking-wider font-heading">
          GENERATING YOUR PERSONALIZED ROADMAP...
        </h3>
        <p className="text-xs text-[#667085]">
          Translating simulation recommendations & investment allocations into weekly actions...
        </p>
      </Card>
    );
  }

  if (!roadmap) {
    return (
      <Card level={2} className="p-8 text-center space-y-4 border-2 border-dashed border-[#E5E5DC]">
        <Target className="w-10 h-10 text-[#635BFF] mx-auto opacity-70" />
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-[#171827] uppercase tracking-wider font-heading">
            ROADMAP READY FOR SIMULATION
          </h3>
          <p className="text-xs text-[#667085] max-w-md mx-auto">
            Your 90-day roadmap will appear here after you run the Future Simulator.
          </p>
        </div>
      </Card>
    );
  }

  const completedCount = roadmap.weekly_actions.filter(a => a.status === 'completed').length;
  const totalActions = roadmap.weekly_actions.length;
  const executionPct = totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 0;

  return (
    <section id="section-roadmap" className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-8 pt-6 border-t border-[#E5E5DC]">
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-[#FAF9F5] to-[#F0EEFF] border border-[#635BFF]/30 rounded-[28px] p-6 lg:p-8 light-card-shadow">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] font-mono flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#635BFF]" /> YOUR NEXT MOVE
          </span>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#171827] font-heading flex items-center gap-2">
            ✦ YOUR 90-DAY ACTION ROADMAP
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
            Concrete milestones, weekly actions, and metric targets derived from your <strong>{roadmap.scenario}</strong> recommendation.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge variant="green" className="text-xs px-3 py-1 font-mono font-bold">
            {roadmap.overall_score} / 100 Alignment
          </Badge>
          <span className="text-[10px] font-mono text-[#667085]">
            Target: <strong>{roadmap.scenario.toUpperCase()}</strong>
          </span>
        </div>
      </div>

      {/* WHY THIS ROADMAP EXISTS CONTEXT BANNER */}
      <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#635BFF]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#171827]">
          <Sparkles className="w-4 h-4 text-[#635BFF] shrink-0" />
          <span className="font-mono text-[#667085]">
            <strong className="text-[#171827]">WHY THIS ROADMAP EXISTS:</strong> Direct execution layer derived from your <strong>{roadmap.scenario}</strong> recommendation ({roadmap.overall_score}/100) and slider allocations.
          </span>
        </div>
        <Badge variant="indigo" className="text-[10px] shrink-0 font-mono">
          EXECUTION LAYER
        </Badge>
      </div>

      {/* WORKLOAD CAUTION ALERT (IF HIGH/CRITICAL RISK) */}
      {roadmap.workload_caution && (
        <Card level={2} className="border-l-4 border-l-[#FF7A6B] bg-[#FF7A6B]/5 p-5 space-y-2">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF7A6B] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D84B3B] font-mono">
                WORKLOAD AWARENESS CAUTION
              </h4>
              <p className="text-xs text-[#171827] font-medium leading-relaxed mt-0.5">
                {roadmap.workload_caution}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 2. 90-DAY MILESTONES (30 / 60 / 90 DAYS) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#635BFF]" /> 90-DAY MILESTONES
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roadmap.milestones.map((m, idx) => (
            <Card key={idx} level={2} className="p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-[#635BFF]">{m.timeframe}</span>
                  <Badge variant={idx === 0 ? 'amber' : idx === 1 ? 'indigo' : 'green'}>
                    {idx === 0 ? 'Phase 1' : idx === 1 ? 'Phase 2' : 'Phase 3'}
                  </Badge>
                </div>
                <h4 className="text-sm font-extrabold text-[#171827] font-heading">{m.title}</h4>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E5E5DC]">
                <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">Key Deliverables</span>
                <ul className="space-y-1.5 text-xs text-[#667085]">
                  {m.items.map((itemStr, itemIdx) => (
                    <li key={itemIdx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF] shrink-0" />
                      <span className="leading-tight">{itemStr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 3. THIS WEEK'S ACTION PLAN ("THIS WEEK") */}
      <div id="section-checkin" className="scroll-mt-24 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#32C6A6]" /> THIS WEEK'S ACTION PLAN
          </h3>
          <span className="text-xs font-mono font-bold text-[#635BFF]">
            {completedCount} / {totalActions} Completed ({executionPct}%)
          </span>
        </div>

        {/* AUTHORITATIVE ROADMAP EXECUTION PROGRESS BAR */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E5DC] space-y-2 light-card-shadow">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#171827] uppercase tracking-wider font-mono">
              ROADMAP EXECUTION PROGRESS
            </span>
            <span className="font-mono font-extrabold text-[#635BFF]">
              {completedCount} OF {totalActions} ACTIONS COMPLETED ({executionPct}%)
            </span>
          </div>
          <ProgressBar value={executionPct} color="bg-[#635BFF]" showPercentage={false} />
        </div>

        <div className="space-y-3">
          {roadmap.weekly_actions.map((act) => {
            const isDone = act.status === 'completed';

            return (
              <div
                key={act.id}
                onClick={() => onToggleAction(act.id)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-[#32C6A6]/10 border-[#32C6A6]/40 opacity-80'
                    : 'bg-white border-[#E5E5DC] hover:border-[#635BFF] hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleAction(act.id);
                    }}
                    className="mt-0.5 text-[#635BFF] hover:scale-110 transition-transform"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-[#32C6A6]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#667085]" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold font-heading ${isDone ? 'line-through text-[#667085]' : 'text-[#171827]'}`}>
                        {act.title}
                      </span>
                      <Badge variant={act.category === 'SKILL' ? 'indigo' : act.category === 'PROJECT' ? 'green' : 'amber'}>
                        {act.category}
                      </Badge>
                      <Badge variant={act.priority === 'High' ? 'red' : 'neutral'}>
                        {act.priority} Priority
                      </Badge>
                    </div>
                    <p className="text-xs text-[#667085] leading-relaxed">{act.description}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E5DC]">
                  <span className="text-[10px] font-mono text-[#667085]">Target:</span>
                  <span className="text-xs font-mono font-bold text-[#635BFF] bg-[#635BFF]/10 px-2.5 py-1 rounded-lg">
                    {act.target}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. TOP PRIORITIES & METRICS TO TRACK (FULL WIDTH HORIZONTAL STACKED SECTIONS) */}
      <div className="space-y-6">
        {/* Top Priorities Section */}
        <Card level={2} className="p-6 lg:p-8 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5 border-b border-[#E5E5DC] pb-3">
            <Award className="w-4 h-4 text-[#F5C96A]" /> TOP STRATEGIC PRIORITIES
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roadmap.top_priorities.map((item, idx) => (
              <div key={item.id} className="p-4.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E5DC] flex flex-col justify-between gap-3 light-card-shadow">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#635BFF] text-xs">0{idx + 1}</span>
                    <span className="font-bold text-[#171827] text-xs font-heading">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-[#667085] leading-relaxed break-words">{item.description}</p>
                </div>
                <Badge variant="indigo" className="self-start text-[10px] font-mono">
                  Target: {item.target}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
        
        {/* What to Track (Metrics) Section (Ultra-Compact Flat Cardless Numbered List) */}
        <Card level={2} className="p-5 sm:p-6 space-y-4 w-full min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5 border-b border-[#E5E5DC] pb-3">
            <TrendingUp className="w-4 h-4 text-[#32C6A6] shrink-0" /> WHAT TO TRACK (METRICS)
          </h3>

          <div className="flex flex-col gap-3 w-full min-w-0 pt-1">
            {roadmap.metrics_to_track.map((m, idx) => {
              const numStr = idx + 1 < 10 ? `0${idx + 1}.` : `${idx + 1}.`;
              const curNum = parseFloat(m.current) || 0;
              const tgtNum = parseFloat(m.target) || 100;
              const pct = tgtNum > 0 ? Math.min(100, Math.max(5, Math.round((curNum / tgtNum) * 100))) : 40;

              return (
                <div key={idx} className="space-y-1.5 w-full min-w-0">
                  {/* Title Line: Number + Name (Left) | Target Badge (Right) */}
                  <div className="flex items-center justify-between gap-3 w-full min-w-0">
                    <h4 className="text-base font-extrabold text-[#171827] font-heading break-words min-w-0 leading-tight flex items-center gap-2">
                      <span className="font-mono text-[#635BFF] font-black text-base shrink-0">{numStr}</span>
                      <span>{m.name}</span>
                    </h4>
                    <Badge variant="green" className="shrink-0 text-xs font-mono font-bold px-3 py-0.5 self-center">
                      TARGET: {m.target}
                    </Badge>
                  </div>

                  {/* Progress Line Underneath */}
                  <div className="space-y-1 w-full min-w-0 pl-6 sm:pl-7">
                    <div className="flex justify-between items-center text-xs font-mono text-[#667085] px-0.5">
                      <span className="font-semibold text-[#171827]">{m.current}</span>
                      <span className="font-bold text-[#32C6A6]">{m.target}</span>
                    </div>
                    <ProgressBar value={pct} color="bg-gradient-to-r from-[#635BFF] to-[#32C6A6]" showPercentage={false} height="h-[6px]" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 5. NEXT CHECK-IN & PRIMARY CTA */}
      <div className="bg-gradient-to-r from-[#635BFF]/10 via-[#32C6A6]/10 to-white border-2 border-[#635BFF] rounded-[28px] p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 light-card-shadow">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] font-mono">
            NEXT CHECK-IN TIMEFRAME
          </span>
          <h4 className="text-lg font-bold text-[#171827] font-heading">
            Schedule Review: <strong>{roadmap.next_checkin}</strong>
          </h4>
          <p className="text-xs text-[#667085]">
            Complete weekly actions above to maintain momentum toward your {roadmap.scenario} trajectory.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={onStartExecution}
          icon={<ArrowRight className="w-4 h-4" />}
          className="w-full sm:w-auto px-8 py-3.5 font-bold shadow-lg shadow-[#635BFF]/25 hover:shadow-xl hover:shadow-[#635BFF]/40 hover:-translate-y-0.5 transition-all"
        >
          ✦ START THIS WEEK
        </Button>
      </div>
    </section>
  );
};
