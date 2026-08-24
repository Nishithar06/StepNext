import React from 'react';
import { AdaptiveFutureFeedback } from '../types/schema';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
import { Button } from './common/Button';
import { InfoTab } from './common/InfoTab';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';

interface AdaptiveFutureSectionProps {
  feedback: AdaptiveFutureFeedback | null;
  loading: boolean;
  onReRunSimulator?: () => void;
}

export const AdaptiveFutureSection: React.FC<AdaptiveFutureSectionProps> = ({
  feedback,
  loading,
  onReRunSimulator
}) => {
  if (loading) {
    return (
      <Card level={2} className="p-8 text-center space-y-4 animate-pulse border-2 border-[#635BFF]">
        <Compass className="w-8 h-8 text-[#635BFF] mx-auto animate-spin" />
        <h3 className="text-base font-extrabold text-[#171827] uppercase tracking-wider font-heading">
          EVALUATING FUTURE TRAJECTORY HEALTH...
        </h3>
        <p className="text-xs text-[#667085]">
          Comparing execution signals against recommended path & score gap threshold...
        </p>
      </Card>
    );
  }

  if (!feedback) {
    return null;
  }

  const renderStatusBadge = () => {
    switch (feedback.status) {
      case 'on_track':
        return <Badge variant="green" className="text-xs px-3.5 py-1 font-mono font-bold">★ ON TRACK</Badge>;
      case 'needs_adjustment':
        return <Badge variant="amber" className="text-xs px-3.5 py-1 font-mono font-bold">⚠ NEEDS ADJUSTMENT</Badge>;
      case 'stabilize':
        return <Badge variant="indigo" className="text-xs px-3.5 py-1 font-mono font-bold">⚡ STABILIZE</Badge>;
      case 're_evaluate':
        return <Badge variant="red" className="text-xs px-3.5 py-1 font-mono font-bold animate-pulse">↻ RE-EVALUATE</Badge>;
      default:
        return <Badge variant="neutral" className="text-xs font-mono">{feedback.status.toUpperCase()}</Badge>;
    }
  };

  return (
    <section id="section-adaptive-future" className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-6 pt-6 border-t border-[#E5E5DC]">
      {/* 1. HERO / HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-white via-[#FAF9F5] to-[#F0EEFF] border border-[#635BFF]/30 rounded-[28px] p-6 lg:p-8 light-card-shadow">
        <div className="space-y-1.5 min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] font-mono flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#635BFF] shrink-0" /> ADAPTIVE DECISION FEEDBACK
          </span>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#171827] font-heading flex items-center gap-2 break-words">
            ✦ CURRENT FUTURE HEALTH
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed break-words max-w-3xl">
            LifePilot evaluates whether low execution stems from <strong>workload friction</strong> or a <strong>long-term future path mismatch</strong>.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 shrink-0 min-w-0 max-w-full md:max-w-[320px]">
          {renderStatusBadge()}
          <div className="text-xs font-mono text-[#667085] text-left md:text-right break-words min-w-0 w-full">
            <span className="text-[10px] uppercase font-bold text-[#667085] block">CURRENT PATH</span>
            <strong className="text-[#171827] block text-xs break-words leading-snug mt-0.5 whitespace-normal">
              {feedback.current_scenario}
            </strong>
            <span className="text-[11px] text-[#635BFF] font-semibold mt-0.5 block">
              {feedback.current_score} / 100 alignment
            </span>
          </div>
        </div>
      </div>

      {/* 2. HEALTH METRICS & CONFIDENCE SCORE GRID (2-COLUMN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Health Overview & Confidence */}
        <Card level={2} className="lg:col-span-6 p-6 space-y-6 flex flex-col min-w-0">
          <div className="flex items-center justify-between border-b border-[#E5E5DC] pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085] font-mono">
              FUTURE DIRECTION CONFIDENCE
            </span>
            <span className="text-sm font-mono font-black text-[#635BFF]">
              {feedback.future_confidence}%
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#667085] font-medium">Confidence Score:</span>
              <span className="font-mono font-bold text-[#171827]">{feedback.future_confidence} / 100</span>
            </div>
            <div className="w-full h-3 bg-[#E5E5DC] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  feedback.future_confidence >= 75
                    ? 'bg-gradient-to-r from-[#635BFF] to-[#32C6A6]'
                    : feedback.future_confidence >= 50
                    ? 'bg-[#F5C96A]'
                    : 'bg-[#FF7A6B]'
                }`}
                style={{ width: `${feedback.future_confidence}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <InfoTab
              label="EXECUTION HEALTH"
              value={feedback.execution_health}
              variant="neutral"
              layout="stacked"
            />
            <InfoTab
              label="WORKLOAD HEALTH"
              value={feedback.workload_health}
              variant="indigo"
              layout="stacked"
            />
          </div>
        </Card>

        {/* Right Column: Why LifePilot Thinks This */}
        <Card level={2} className="lg:col-span-6 p-6 space-y-4 flex flex-col justify-between min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5 border-b border-[#E5E5DC] pb-3">
            <Sparkles className="w-4 h-4 text-[#635BFF] shrink-0" /> WHY LIFEPILOT THINKS THIS
          </h3>

          <div className="space-y-2.5 text-xs">
            {feedback.evidence.map((item, idx) => (
              <InfoTab
                key={idx}
                icon={<CheckCircle2 className="w-4 h-4 text-[#635BFF] shrink-0" />}
                value={item}
                variant="neutral"
                layout="inline"
              />
            ))}
          </div>
        </Card>
      </div>

      {/* 3. RECOMMENDED ADAPTIVE ACTION BANNER */}
      <div
        className={`rounded-[28px] p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 light-card-shadow min-w-0 ${
          feedback.status === 're_evaluate'
            ? 'bg-gradient-to-r from-[#FF7A6B]/15 via-white to-[#FAF9F5] border-2 border-[#FF7A6B]'
            : feedback.status === 'needs_adjustment'
            ? 'bg-gradient-to-r from-amber-500/10 via-white to-[#FAF9F5] border-2 border-amber-500/30'
            : 'bg-gradient-to-r from-[#32C6A6]/10 via-white to-[#FAF9F5] border-2 border-[#32C6A6]'
        }`}
      >
        <div className="space-y-1.5 min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-[#635BFF]">
            RECOMMENDED ADAPTIVE ACTION
          </span>
          <h4 className="text-lg font-bold text-[#171827] font-heading break-words">
            {feedback.next_action}
          </h4>
          <p className="text-xs text-[#667085] leading-relaxed break-words">
            {feedback.trigger_reason}
          </p>
        </div>

        {feedback.should_re_evaluate ? (
          <Button
            variant="primary"
            size="lg"
            onClick={onReRunSimulator}
            icon={<RefreshCw className="w-4 h-4" />}
            className="w-full md:w-auto px-8 py-3.5 font-bold bg-[#FF7A6B] hover:bg-[#D84B3B] text-white shadow-lg shadow-[#FF7A6B]/25 hover:shadow-xl hover:shadow-[#FF7A6B]/40 transition-all shrink-0"
          >
            ↻ RE-RUN FUTURE SIMULATOR
          </Button>
        ) : (
          <Badge variant="indigo" className="text-xs px-4 py-2 shrink-0 font-mono self-start md:self-center whitespace-normal break-words">
            Action: {feedback.recommendation.toUpperCase().replace(/_/g, ' ')}
          </Badge>
        )}
      </div>
    </section>
  );
};
