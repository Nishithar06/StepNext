import React, { useState } from 'react';
import { OverloadScore, UserProfile } from '../types/schema';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
import { Button } from './common/Button';
import { Skeleton } from './common/Skeleton';
import { Zap, RefreshCw, AlertCircle, CheckCircle2, Moon, Clock, Briefcase, Activity } from 'lucide-react';

interface OverloadRiskViewProps {
  overloadScore: OverloadScore | null;
  profile: UserProfile | null;
  loading: boolean;
  onRecalculate: () => Promise<void>;
}

export const OverloadRiskView: React.FC<OverloadRiskViewProps> = ({
  overloadScore,
  profile,
  loading,
  onRecalculate
}) => {
  const [recalculating, setRecalculating] = useState(false);

  const handleRecalculate = async () => {
    setRecalculating(true);
    await onRecalculate();
    setRecalculating(false);
  };

  if (loading && !overloadScore) {
    return (
      <Card title="Current Overload Risk">
        <Skeleton lines={4} />
      </Card>
    );
  }

  if (!overloadScore) {
    return (
      <Card title="Current Overload Risk">
        <p className="text-xs text-slate-400">Overload score calculation unavailable.</p>
      </Card>
    );
  }

  const getRiskVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'green';
      case 'moderate': return 'amber';
      case 'high':
      case 'critical': return 'red';
      default: return 'amber';
    }
  };

  const getProgressColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-emerald-500';
      case 'moderate': return 'bg-amber-500';
      case 'high':
      case 'critical': return 'bg-rose-500';
      default: return 'bg-amber-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> Current Overload Risk
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational workload evaluation engine calculating schedule congestion & recovery thresholds.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleRecalculate}
          isLoading={recalculating}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Recalculate
        </Button>
      </div>

      {/* Two-Column Balanced Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Current State Parameters */}
        <Card title="Current State Snapshot">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Moon className="w-3.5 h-3.5 text-indigo-400" /> Sleep Duration
              </div>
              <p className="text-xl font-bold text-white font-heading font-mono">
                {profile?.sleep_hours ?? 6.0}h
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">per night</p>
            </div>

            <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Activity className="w-3.5 h-3.5 text-amber-400" /> Workload Intensity
              </div>
              <p className="text-xl font-bold text-white font-heading capitalize">
                {profile?.workload ?? 'High'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">perceived pace</p>
            </div>

            <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" /> Major Commitments
              </div>
              <p className="text-xl font-bold text-white font-heading font-mono">
                {profile?.major_commitments?.length ?? 3}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">active tracks</p>
            </div>

            <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Available Buffer
              </div>
              <p className="text-xl font-bold text-white font-heading font-mono">
                {profile?.available_hours_per_day ?? 6.5}h
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">daily work capacity</p>
            </div>
          </div>
        </Card>

        {/* RIGHT COLUMN: Overload Score Meter & Level */}
        <Card title="Risk Evaluation">
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white font-heading font-mono">
                  {overloadScore.total_score}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
              <Badge variant={getRiskVariant(overloadScore.risk_level)}>
                {overloadScore.risk_level} Risk
              </Badge>
            </div>

            {/* Horizontal Progress Bar Meter */}
            <div className="space-y-1">
              <div className="w-full bg-white/[0.06] h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(overloadScore.risk_level)}`}
                  style={{ width: `${overloadScore.total_score}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 (Optimal)</span>
                <span>50 (Moderate)</span>
                <span>100 (Critical)</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed border-t border-white/[0.06] pt-3">
              {overloadScore.explanation}
            </p>
          </div>
        </Card>
      </div>

      {/* Contributing Factors & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Contributing Factors">
          <ul className="space-y-2 text-xs text-slate-300">
            {overloadScore.contributing_factors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.06]">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Recommended Actions">
          <ul className="space-y-2 text-xs text-slate-300">
            {overloadScore.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.06]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};
