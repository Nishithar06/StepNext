import React from 'react';
import { SimulationResponse, ActionRoadmap, ProgressSummary, AdaptiveFutureFeedback } from '../types/schema';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
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
      <Card level={2} className="p-6 bg-gradient-to-r from-white via-[#FAF9F5] to-[#F0EEFF] border border-[#635BFF]/30 space-y-2 light-card-shadow">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] font-mono flex items-center gap-1.5 justify-center sm:justify-start">
              <Compass className="w-4 h-4 text-[#635BFF]" /> LIFEPILOT INTELLIGENCE STATUS
            </span>
            <h3 className="text-lg font-bold text-[#171827] font-heading">
              Choose a direction to begin your LifePilot.
            </h3>
            <p className="text-xs text-[#667085]">
              Adjust investment sliders and click "Run Simulation" to generate your authoritative recommendation and personal roadmap.
            </p>
          </div>
          <Badge variant="indigo" className="text-xs px-4 py-2 shrink-0 font-mono">
            STATUS: AWAITING SIMULATION
          </Badge>
        </div>
      </Card>
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
    if (trend === 'improving') return <span className="text-[#32C6A6] font-bold text-[11px] flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> ↑ Improving</span>;
    if (trend === 'declining') return <span className="text-[#FF7A6B] font-bold text-[11px] flex items-center gap-0.5"><TrendingDown className="w-3 h-3" /> ↓ Declining</span>;
    if (trend === 'stable') return <span className="text-[#635BFF] font-bold text-[11px] flex items-center gap-0.5"><Minus className="w-3 h-3" /> → Stable</span>;
    return <span className="text-[#667085] text-[11px] font-mono">• Awaiting Data</span>;
  };

  const renderFutureStatusBadge = () => {
    switch (futureStatus) {
      case 'on_track':
        return <Badge variant="green" className="text-[10px] px-2 py-0.5 font-mono">ON TRACK</Badge>;
      case 'needs_adjustment':
        return <Badge variant="amber" className="text-[10px] px-2 py-0.5 font-mono">NEEDS ADJ</Badge>;
      case 'stabilize':
        return <Badge variant="indigo" className="text-[10px] px-2 py-0.5 font-mono">STABILIZE</Badge>;
      case 're_evaluate':
        return <Badge variant="red" className="text-[10px] px-2 py-0.5 font-mono animate-pulse">RE-EVALUATE</Badge>;
      default:
        return <Badge variant="neutral" className="text-[10px] font-mono">ON TRACK</Badge>;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full">
      <Card level={2} className="p-5 bg-gradient-to-r from-white via-[#FAF9F5] to-[#F0EEFF] border border-[#635BFF]/30 rounded-[24px] space-y-4 light-card-shadow min-w-0">
      <div className="flex items-center justify-between border-b border-[#E5E5DC] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] font-mono flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-[#635BFF]" /> LIFEPILOT SYSTEM INTELLIGENCE STATUS
        </span>
        <span className="text-[10px] font-mono text-[#667085]">
          Active User: <strong>{progress?.user_id || roadmap?.user_id || "demo_user"}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* Card 1: DIRECTION */}
        <div className="p-3.5 rounded-xl bg-white border border-[#E5E5DC] space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#667085] font-mono block">
            1. DIRECTION
          </span>
          <div className="font-extrabold text-[#171827] text-sm font-heading flex items-center justify-between">
            <span>{recommendedScenario.toUpperCase()}</span>
            <span className="text-xs font-mono text-[#635BFF] font-bold">{directionScore}/100</span>
          </div>
          <span className="text-[10px] text-[#219B81] font-medium block">★ Strongest Path</span>
        </div>

        {/* Card 2: EXECUTION */}
        <div className="p-3.5 rounded-xl bg-white border border-[#E5E5DC] space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#667085] font-mono block">
            2. EXECUTION
          </span>
          <div className="font-extrabold text-[#171827] text-sm font-mono flex items-center justify-between">
            <span>{executionPct}% completion</span>
            {renderTrendBadge()}
          </div>
          <span className="text-[10px] text-[#667085] font-mono flex items-center gap-1">
            <Flame className="w-3 h-3 text-[#FF7A6B]" /> {streak}-wk streak (≥50%)
          </span>
        </div>

        {/* Card 3: WORKLOAD */}
        <div className="p-3.5 rounded-xl bg-white border border-[#E5E5DC] space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#667085] font-mono block">
            3. WORKLOAD
          </span>
          <div className="font-extrabold text-[#171827] text-sm font-heading flex items-center justify-between">
            <span>{workloadLevel}</span>
            <span className="text-xs font-mono text-[#667085]">{weeklyHours}h/wk</span>
          </div>
          <span className="text-[10px] text-[#667085] block">Sustainable capacity</span>
        </div>

        {/* Card 4: FUTURE HEALTH */}
        <div className="p-3.5 rounded-xl bg-white border border-[#E5E5DC] space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#667085] font-mono block">
            4. FUTURE HEALTH
          </span>
          <div className="font-extrabold text-[#171827] text-sm font-heading flex items-center justify-between">
            {renderFutureStatusBadge()}
            <span className="text-xs font-mono text-[#635BFF] font-bold">{confidence}% conf</span>
          </div>
          <span className="text-[10px] text-[#667085] block truncate">
            {adaptiveFuture?.trigger_reason || "Trajectory is consistent"}
          </span>
        </div>
      </div>

      {/* NEXT BEST ACTION FOOTER BANNER */}
      <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#171827]">
          <CheckCircle2 className="w-4 h-4 text-[#635BFF] shrink-0" />
          <span className="font-bold">Next Best Action:</span>
          <span className="text-[#667085] truncate max-w-md">{nextActionText}</span>
        </div>
        <Badge variant="indigo" className="text-[10px] shrink-0 font-mono">
          INTENTIONAL PROGRESS
        </Badge>
      </div>
    </Card>
    </div>
  );
};
