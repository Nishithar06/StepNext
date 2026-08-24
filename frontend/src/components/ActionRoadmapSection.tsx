import React from 'react';
import { ActionRoadmap } from '../types/schema';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
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
      <Card level={2} className="p-8 text-center space-y-4 animate-pulse border-2 border-[#5850EC]">
        <Sparkles className="w-8 h-8 text-[#5850EC] mx-auto animate-spin" />
        <h3 className="text-base font-extrabold text-[#0F172A] uppercase tracking-wider font-heading">
          GENERATING YOUR PERSONALIZED ROADMAP...
        </h3>
        <p className="text-xs text-slate-500">
          Translating simulation recommendations & investment allocations into weekly actions...
        </p>
      </Card>
    );
  }

  if (!roadmap) {
    return (
      <Card level={2} className="p-8 text-center space-y-4 border border-dashed border-black/[0.1]">
        <Target className="w-10 h-10 text-[#5850EC] mx-auto opacity-70" />
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-[#0F172A] uppercase tracking-wider font-heading">
            ROADMAP READY FOR SIMULATION
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
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
    <section id="section-roadmap" className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-8 pt-6 border-t border-black/[0.06]">
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-white via-[#FAFAF7] to-[#EEF2FF] border border-[#5850EC]/30 rounded-[28px] p-6 lg:p-8 shadow-[0_4px_24px_rgba(99,102,241,0.08)]">
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#5850EC] flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#5850EC]" /> STRATEGIC ACTION PLAN
          </span>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] font-heading tracking-tight flex items-center gap-2">
            ✦ 90-Day Action Roadmap
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Concrete milestones, weekly actions, and metric targets derived from your <strong>{roadmap.scenario}</strong> recommendation.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge variant="success" size="lg" className="font-mono font-bold">
            {roadmap.overall_score} / 100 Alignment
          </Badge>
          <span className="text-[10px] font-mono text-slate-500">
            Target: <strong className="text-[#0F172A]">{roadmap.scenario.toUpperCase()}</strong>
          </span>
        </div>
      </div>

      {/* WHY THIS ROADMAP EXISTS */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#0F172A]">
          <Sparkles className="w-4 h-4 text-[#5850EC] shrink-0" />
          <span className="font-mono text-slate-600">
            <strong className="text-[#0F172A]">EXECUTION LAYER:</strong> Derived from your <strong>{roadmap.scenario}</strong> recommendation ({roadmap.overall_score}/100) and weekly hour allocations.
          </span>
        </div>
        <Badge variant="indigo" size="sm" className="font-mono">
          90-DAY MILESTONES
        </Badge>
      </div>

      {/* WORKLOAD CAUTION ALERT */}
      {roadmap.workload_caution && (
        <div className="border-l-4 border-l-[#F43F5E] bg-[#FFF1F2] rounded-2xl p-5 space-y-2 border border-black/[0.05]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F43F5E] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F43F5E]">
                WORKLOAD AWARENESS CAUTION
              </h4>
              <p className="text-xs text-[#0F172A] font-medium leading-relaxed mt-0.5">
                {roadmap.workload_caution}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. 90-DAY MILESTONES */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-slate-500 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#5850EC]" /> 90-DAY MILESTONES
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roadmap.milestones.map((m, idx) => (
            <div key={idx} className="bg-white rounded-[24px] border border-black/[0.07] p-5 shadow-sm space-y-3 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-[#5850EC] text-xs">{m.timeframe}</span>
                  <Badge variant={idx === 0 ? 'warning' : idx === 1 ? 'indigo' : 'success'} size="sm">
                    {idx === 0 ? 'Phase 1' : idx === 1 ? 'Phase 2' : 'Phase 3'}
                  </Badge>
                </div>
                <h4 className="text-sm font-extrabold text-[#0F172A] font-heading">{m.title}</h4>
              </div>

              <div className="space-y-2 pt-2 border-t border-black/[0.05]">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Key Deliverables</span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {m.items.map((itemStr, itemIdx) => (
                    <li key={itemIdx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5850EC] shrink-0" />
                      <span className="leading-tight">{itemStr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. THIS WEEK'S ACTION PLAN */}
      <div id="section-checkin" className="scroll-mt-24 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#10B981]" /> THIS WEEK'S ACTION PLAN
          </h3>
          <span className="text-xs font-mono font-bold text-[#5850EC]">
            {completedCount} / {totalActions} Completed ({executionPct}%)
          </span>
        </div>

        {/* AUTHORITATIVE ROADMAP EXECUTION PROGRESS BAR */}
        <div className="p-5 rounded-[24px] bg-white border border-black/[0.07] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">
              ROADMAP EXECUTION PROGRESS
            </span>
            <span className="font-mono font-extrabold text-[#5850EC]">
              {completedCount} OF {totalActions} COMPLETED ({executionPct}%)
            </span>
          </div>
          <Progress value={executionPct} size="default" indicatorColor="bg-gradient-to-r from-[#5850EC] to-[#6366F1]" />
        </div>

        <div className="space-y-3">
          {roadmap.weekly_actions.map((act) => {
            const isDone = act.status === 'completed';

            return (
              <div
                key={act.id}
                onClick={() => onToggleAction(act.id)}
                className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-[#ECFDF5] border-[#10B981]/40 opacity-85'
                    : 'bg-white border-black/[0.07] hover:border-[#5850EC] hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleAction(act.id);
                    }}
                    className="mt-0.5 text-[#5850EC] hover:scale-110 transition-transform"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold font-heading ${isDone ? 'line-through text-slate-400' : 'text-[#0F172A]'}`}>
                        {act.title}
                      </span>
                      <Badge variant={act.category === 'SKILL' ? 'indigo' : act.category === 'PROJECT' ? 'success' : 'warning'} size="sm">
                        {act.category}
                      </Badge>
                      <Badge variant={act.priority === 'High' ? 'destructive' : 'outline'} size="sm">
                        {act.priority} Priority
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{act.description}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-black/[0.05]">
                  <span className="text-[10px] font-mono text-slate-400">Target:</span>
                  <span className="text-xs font-mono font-bold text-[#5850EC] bg-[#5850EC]/10 px-2.5 py-1 rounded-lg">
                    {act.target}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. TOP PRIORITIES & METRICS TO TRACK */}
      <div className="space-y-6">
        {/* Top Priorities Section */}
        <div className="bg-white rounded-[26px] border border-black/[0.07] p-6 lg:p-8 space-y-4 shadow-sm">
          <h3 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-slate-500 flex items-center gap-1.5 border-b border-black/[0.06] pb-3">
            <Award className="w-4 h-4 text-[#F59E0B]" /> TOP STRATEGIC PRIORITIES
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roadmap.top_priorities.map((item, idx) => (
              <div key={item.id} className="p-4.5 rounded-2xl bg-slate-50 border border-black/[0.05] flex flex-col justify-between gap-3 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#5850EC] text-xs">0{idx + 1}</span>
                    <span className="font-bold text-[#0F172A] text-xs font-heading">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed break-words">{item.description}</p>
                </div>
                <Badge variant="indigo" size="sm" className="self-start font-mono">
                  Target: {item.target}
                </Badge>
              </div>
            ))}
          </div>
        </div>
        
        {/* What to Track (Metrics) Section */}
        <div className="bg-white rounded-[26px] border border-black/[0.07] p-6 space-y-4 shadow-sm w-full min-w-0">
          <h3 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-slate-500 flex items-center gap-1.5 border-b border-black/[0.06] pb-3">
            <TrendingUp className="w-4 h-4 text-[#10B981] shrink-0" /> WHAT TO TRACK (METRICS)
          </h3>

          <div className="flex flex-col gap-3.5 w-full min-w-0 pt-1">
            {roadmap.metrics_to_track.map((m, idx) => {
              const numStr = idx + 1 < 10 ? `0${idx + 1}.` : `${idx + 1}.`;
              const curNum = parseFloat(m.current) || 0;
              const tgtNum = parseFloat(m.target) || 100;
              const pct = tgtNum > 0 ? Math.min(100, Math.max(5, Math.round((curNum / tgtNum) * 100))) : 40;

              return (
                <div key={idx} className="space-y-1.5 w-full min-w-0">
                  <div className="flex items-center justify-between gap-3 w-full min-w-0">
                    <h4 className="text-sm sm:text-base font-extrabold text-[#0F172A] font-heading break-words min-w-0 leading-tight flex items-center gap-2">
                      <span className="font-mono text-[#5850EC] font-black text-sm shrink-0">{numStr}</span>
                      <span>{m.name}</span>
                    </h4>
                    <Badge variant="success" size="sm" className="shrink-0 font-mono font-bold px-3 py-0.5">
                      TARGET: {m.target}
                    </Badge>
                  </div>

                  <div className="space-y-1 w-full min-w-0 pl-6 sm:pl-7">
                    <div className="flex justify-between items-center text-xs font-mono text-slate-500 px-0.5">
                      <span className="font-semibold text-[#0F172A]">{m.current}</span>
                      <span className="font-bold text-[#10B981]">{m.target}</span>
                    </div>
                    <Progress value={pct} indicatorColor="bg-gradient-to-r from-[#5850EC] to-[#10B981]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. NEXT CHECK-IN & PRIMARY CTA */}
      <div className="bg-gradient-to-r from-[#5850EC]/10 via-[#10B981]/10 to-white border border-[#5850EC]/30 rounded-[28px] p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_4px_24px_rgba(99,102,241,0.08)]">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5850EC]">
            NEXT CHECK-IN TIMEFRAME
          </span>
          <h4 className="text-lg font-bold text-[#0F172A] font-heading">
            Schedule Review: <strong>{roadmap.next_checkin}</strong>
          </h4>
          <p className="text-xs text-slate-600">
            Complete weekly actions above to maintain momentum toward your {roadmap.scenario} trajectory.
          </p>
        </div>

        <Button
          variant="gradient"
          size="lg"
          onClick={onStartExecution}
          className="w-full sm:w-auto px-8 font-bold gap-2 shadow-lg shadow-[#5850EC]/20 hover:shadow-xl"
        >
          <span>✦ START THIS WEEK</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </section>
  );
};
