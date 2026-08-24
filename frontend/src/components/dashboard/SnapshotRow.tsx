import React from 'react';
import { OverloadScore, SimulationResponse } from '../../types/schema';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { TrendingUp, Target, Zap } from 'lucide-react';

interface SnapshotRowProps {
  overloadScore: OverloadScore | null;
  simulationData: SimulationResponse | null;
  onNavigateTab: (tab: 'digital_twin' | 'current_state' | 'simulator') => void;
}

export const SnapshotRow: React.FC<SnapshotRowProps> = ({
  overloadScore,
  simulationData,
  onNavigateTab
}) => {
  const placementResult = simulationData?.results.find(r => r.name.toLowerCase().includes('placement'));
  const placementReadiness = placementResult ? placementResult.overall_score : 78;
  const skillProgress = placementResult ? placementResult.skill_growth : 64;

  const getRiskVariant = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'green';
      case 'moderate': return 'amber';
      case 'high':
      case 'critical': return 'red';
      default: return 'amber';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {/* Stat 1: Placement Readiness */}
      <div
        onClick={() => onNavigateTab('simulator')}
        className="bg-[#0D111C] rounded-xl border border-white/[0.08] p-5 cursor-pointer hover:border-indigo-500/40 transition group space-y-3"
      >
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium">Placement Readiness</span>
          <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> ↑ 4% this week
          </span>
        </div>
        <div className="text-3xl font-bold text-white font-heading font-mono">
          {placementReadiness}%
        </div>
        <ProgressBar value={placementReadiness} color="bg-indigo-500" showPercentage={false} />
      </div>

      {/* Stat 2: Skill Progress */}
      <div
        onClick={() => onNavigateTab('digital_twin')}
        className="bg-[#0D111C] rounded-xl border border-white/[0.08] p-5 cursor-pointer hover:border-cyan-500/40 transition group space-y-3"
      >
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium">Skill Progress</span>
          <span className="text-[11px] text-slate-400 font-medium">3 active tracks</span>
        </div>
        <div className="text-3xl font-bold text-white font-heading font-mono">
          {skillProgress}%
        </div>
        <ProgressBar value={skillProgress} color="bg-cyan-400" showPercentage={false} />
      </div>

      {/* Stat 3: Overload Risk */}
      <div
        onClick={() => onNavigateTab('current_state')}
        className="bg-[#0D111C] rounded-xl border border-white/[0.08] p-5 cursor-pointer hover:border-amber-500/40 transition group space-y-3"
      >
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium">Overload Risk</span>
          <Badge variant={getRiskVariant(overloadScore?.risk_level)}>
            {overloadScore?.risk_level || 'Moderate'}
          </Badge>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white font-heading font-mono">
            {overloadScore?.total_score ?? 58}
          </span>
          <span className="text-xs text-slate-400 font-mono">/ 100</span>
        </div>
        <ProgressBar
          value={overloadScore?.total_score ?? 58}
          color={overloadScore?.risk_level === 'Low' ? 'bg-emerald-400' : overloadScore?.risk_level === 'Moderate' ? 'bg-amber-400' : 'bg-rose-400'}
          showPercentage={false}
        />
      </div>
    </div>
  );
};
