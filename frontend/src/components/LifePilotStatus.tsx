import React from 'react';
import { SimulationResponse, ActionRoadmap, ProgressSummary, AdaptiveFutureFeedback } from '../types/schema';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  Compass,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface LifePilotStatusProps {
  simulationData: SimulationResponse | null;
  roadmap: ActionRoadmap | null;
  progress: ProgressSummary | null;
  adaptiveFuture: AdaptiveFutureFeedback | null;
  onNavigateToSection?: (sectionId: string) => void;
}

export const LifePilotStatus: React.FC<LifePilotStatusProps> = ({
  simulationData,
  roadmap,
  progress,
  adaptiveFuture,
  onNavigateToSection
}) => {
  // If no simulation or roadmap exists yet, render clean invitation banner
  if (!simulationData && !roadmap) {
    return (
      <div className="p-6 bg-gradient-to-r from-white via-[#FAFAF7] to-[#EEF2FF] border border-[#5850EC]/30 rounded-[28px] space-y-2 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#5850EC] flex items-center gap-1.5 justify-center sm:justify-start">
              <Compass className="w-4 h-4 text-[#5850EC]" /> STEPNEXT INTELLIGENCE STATUS
            </span>
            <h3 className="text-lg font-bold text-[#0F172A] font-heading">
              Choose a direction to begin your simulation.
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Adjust investment sliders and click "Run Simulation" to generate your authoritative recommendation and personal roadmap.
            </p>
          </div>
          <Badge variant="indigo" size="default" className="font-mono">
            STATUS: AWAITING SIMULATION
          </Badge>
        </div>
      </div>
    );
  }

  // Extract Direction Metrics
  const recommendedScenario = simulationData?.recommendation?.recommended_scenario || roadmap?.scenario || "Placement";
  const winningResult = simulationData?.results?.find(r => r.name.toLowerCase() === recommendedScenario.toLowerCase() || recommendedScenario.toLowerCase().includes(r.name.toLowerCase())) || simulationData?.results?.[0];
  const directionScore = winningResult?.overall_score || roadmap?.overall_score || 85;

  // Extract Execution Metrics
  const executionPct = progress?.latest_week_completion_percentage || 0;
  const trend = progress?.completion_trend || "insufficient_data";
  const streak = progress?.current_execution_streak || 0;

  // Extract Workload Metrics
  const workloadLevel = progress?.workload_signal !== "Unknown" ? progress?.workload_signal : (roadmap?.risk_level || "Manageable");
  const weeklyHours = roadmap?.weekly_actions ? roadmap.weekly_actions.length * 6 : 24;

  // Extract Future Health & Adaptation
  const futureStatus = adaptiveFuture?.status || "on_track";
  const confidence = adaptiveFuture?.future_confidence || 85;
  const nextActionText = adaptiveFuture?.next_action || (roadmap?.weekly_actions?.find(a => a.status !== "completed")?.title || "Complete weekly roadmap actions.");

  const renderTrendBadge = () => {
    if (trend === 'improving') return <span className="text-[#10B981] font-bold text-[11px] flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> ↑ Improving</span>;
    if (trend === 'declining') return <span className="text-[#F43F5E] font-bold text-[11px] flex items-center gap-0.5"><TrendingDown className="w-3 h-3" /> ↓ Declining</span>;
    if (trend === 'stable') return <span className="text-[#5850EC] font-bold text-[11px] flex items-center gap-0.5"><Minus className="w-3 h-3" /> → Stable</span>;
    return <span className="text-slate-400 text-[11px] font-mono">• Awaiting Data</span>;
  };

  const renderFutureStatusBadge = () => {
    switch (futureStatus) {
      case 'on_track':
        return <Badge variant="success" size="sm" className="font-mono">ON TRACK</Badge>;
      case 'needs_adjustment':
        return <Badge variant="warning" size="sm" className="font-mono">NEEDS ADJ</Badge>;
      case 'stabilize':
        return <Badge variant="indigo" size="sm" className="font-mono">STABILIZE</Badge>;
      case 're_evaluate':
        return <Badge variant="destructive" size="sm" className="font-mono animate-pulse">RE-EVALUATE</Badge>;
      default:
        return <Badge variant="outline" size="sm" className="font-mono">ON TRACK</Badge>;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full">
      <div className="bg-white border border-black/[0.07] rounded-[28px] p-5 sm:p-6 shadow-sm space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-black/[0.05] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#5850EC]/10 text-[#5850EC]">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A] font-heading">
              SYSTEM INTELLIGENCE STATUS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">ACTIVE TRAJECTORY:</span>
            <span className="text-xs font-mono font-extrabold text-[#5850EC] bg-[#5850EC]/10 px-2.5 py-0.5 rounded-full">
              {recommendedScenario.toUpperCase()}
            </span>
          </div>
        </div>

        {/* 4 Key Pillars Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* 1. CURRENT DIRECTION */}
          <div
            onClick={() => onNavigateToSection?.('section-simulator')}
            className="p-3.5 rounded-2xl bg-slate-50 border border-black/[0.04] space-y-1.5 cursor-pointer hover:bg-slate-100/80 transition"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-mono font-bold text-[10px] uppercase">DIRECTION</span>
              <Compass className="w-3.5 h-3.5 text-[#5850EC]" />
            </div>
            <p className="font-extrabold text-[#0F172A] truncate text-sm font-heading">
              {recommendedScenario}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-mono font-bold text-[#5850EC]">{directionScore}/100</span>
              <span className="text-[10px] text-slate-400">alignment</span>
            </div>
          </div>

          {/* 2. RECENT EXECUTION */}
          <div
            onClick={() => onNavigateToSection?.('section-progress')}
            className="p-3.5 rounded-2xl bg-slate-50 border border-black/[0.04] space-y-1.5 cursor-pointer hover:bg-slate-100/80 transition"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-mono font-bold text-[10px] uppercase">EXECUTION</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#0F172A] text-sm font-mono font-heading">
                {executionPct}%
              </span>
              {renderTrendBadge()}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
              <Flame className="w-3 h-3 text-[#F59E0B]" />
              <span>{streak} wk streak</span>
            </div>
          </div>

          {/* 3. WORKLOAD LOAD */}
          <div
            onClick={() => onNavigateToSection?.('section-roadmap')}
            className="p-3.5 rounded-2xl bg-slate-50 border border-black/[0.04] space-y-1.5 cursor-pointer hover:bg-slate-100/80 transition"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-mono font-bold text-[10px] uppercase">WORKLOAD</span>
              <Activity className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <p className="font-extrabold text-[#0F172A] truncate text-sm font-heading">
              {workloadLevel}
            </p>
            <p className="text-[10px] text-slate-400 font-mono font-medium">
              ~{weeklyHours}h weekly investment
            </p>
          </div>

          {/* 4. FUTURE HEALTH */}
          <div
            onClick={() => onNavigateToSection?.('section-adaptive-future')}
            className="p-3.5 rounded-2xl bg-slate-50 border border-black/[0.04] space-y-1.5 cursor-pointer hover:bg-slate-100/80 transition"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-mono font-bold text-[10px] uppercase">TRAJECTORY</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#5850EC]" />
            </div>
            <div className="flex items-center gap-1.5">
              {renderFutureStatusBadge()}
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {confidence}% direction confidence
            </p>
          </div>
        </div>

        {/* Bottom Recommendation Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-black/[0.05] text-xs">
          <div className="flex items-center gap-2 text-slate-600 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#5850EC] shrink-0" />
            <span className="font-mono text-slate-400 text-[10px] uppercase">NEXT ADAPTIVE ACTION:</span>
            <span className="font-semibold text-[#0F172A] truncate">{nextActionText}</span>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToSection?.('section-checkin')}
            className="text-[#5850EC] hover:text-[#4338CA] font-bold flex items-center gap-1 text-xs shrink-0 self-end sm:self-center transition"
          >
            <span>Log Check-in</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
