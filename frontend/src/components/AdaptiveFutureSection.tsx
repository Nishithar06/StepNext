import React from 'react';
import { AdaptiveFutureFeedback } from '../types/schema';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
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
      <Card level={2} className="p-8 text-center space-y-4 animate-pulse border-2 border-[#5850EC]">
        <Compass className="w-8 h-8 text-[#5850EC] mx-auto animate-spin" />
        <h3 className="text-base font-extrabold text-[#0F172A] uppercase tracking-wider font-heading">
          EVALUATING FUTURE TRAJECTORY HEALTH...
        </h3>
        <p className="text-xs text-slate-500">
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
        return <Badge variant="success" size="lg" className="font-mono font-bold">★ ON TRACK</Badge>;
      case 'needs_adjustment':
        return <Badge variant="warning" size="lg" className="font-mono font-bold">⚠ NEEDS ADJUSTMENT</Badge>;
      case 'stabilize':
        return <Badge variant="indigo" size="lg" className="font-mono font-bold">⚡ STABILIZE</Badge>;
      case 're_evaluate':
        return <Badge variant="destructive" size="lg" className="font-mono font-bold animate-pulse">↻ RE-EVALUATE</Badge>;
      default:
        return <Badge variant="outline" size="lg" className="font-mono">{feedback.status.toUpperCase()}</Badge>;
    }
  };

  return (
    <section id="section-adaptive-future" className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-6 pt-6 border-t border-black/[0.06]">
      {/* 1. HERO / HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white via-[#FAFAF7] to-[#EEF2FF] border border-[#5850EC]/30 rounded-[28px] p-6 lg:p-8 shadow-[0_4px_24px_rgba(99,102,241,0.08)]">
        <div className="space-y-1.5 min-w-0 flex-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#5850EC] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#5850EC] shrink-0" /> ADAPTIVE DECISION FEEDBACK
          </span>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] font-heading flex items-center gap-2 break-words">
            ✦ Future Trajectory Health
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words max-w-3xl font-medium">
            StepNext evaluates whether low execution stems from <strong>workload friction</strong> or a <strong>long-term future path mismatch</strong>.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 shrink-0 min-w-0 max-w-full md:max-w-[320px]">
          {renderStatusBadge()}
          <div className="text-xs font-mono text-slate-500 text-left md:text-right break-words min-w-0 w-full">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">CURRENT PATH</span>
            <strong className="text-[#0F172A] block text-xs break-words leading-snug mt-0.5 whitespace-normal">
              {feedback.current_scenario}
            </strong>
            <span className="text-[11px] text-[#5850EC] font-semibold mt-0.5 block">
              {feedback.current_score} / 100 alignment
            </span>
          </div>
        </div>
      </div>

      {/* 2. HEALTH METRICS & CONFIDENCE SCORE GRID (2-COLUMN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Health Overview & Confidence */}
        <div className="lg:col-span-6 bg-white rounded-[26px] border border-black/[0.07] p-6 space-y-6 shadow-sm flex flex-col min-w-0">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-slate-500">
              FUTURE DIRECTION CONFIDENCE
            </span>
            <span className="text-base font-mono font-black text-[#5850EC]">
              {feedback.future_confidence}%
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500">Confidence Score</span>
              <span className="font-bold text-[#0F172A]">{feedback.future_confidence} / 100</span>
            </div>
            <Progress
              value={feedback.future_confidence}
              size="lg"
              indicatorColor={
                feedback.future_confidence >= 75
                  ? 'bg-gradient-to-r from-[#5850EC] to-[#10B981]'
                  : feedback.future_confidence >= 50
                  ? 'bg-[#F59E0B]'
                  : 'bg-[#F43F5E]'
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-black/[0.04] space-y-1">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block tracking-wider">EXECUTION HEALTH</span>
              <p className="font-semibold text-[#0F172A]">{feedback.execution_health}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#EEF2FF] border border-[#5850EC]/20 space-y-1">
              <span className="text-[9px] font-mono uppercase font-bold text-[#5850EC] block tracking-wider">WORKLOAD HEALTH</span>
              <p className="font-semibold text-[#0F172A]">{feedback.workload_health}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Why StepNext Thinks This */}
        <div className="lg:col-span-6 bg-white rounded-[26px] border border-black/[0.07] p-6 space-y-4 shadow-sm flex flex-col justify-between min-w-0">
          <h3 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-slate-500 flex items-center gap-1.5 border-b border-black/[0.06] pb-3">
            <Sparkles className="w-4 h-4 text-[#5850EC] shrink-0" /> WHY STEPNEXT CONCLUDED THIS
          </h3>

          <div className="space-y-2.5 text-xs">
            {feedback.evidence.map((item, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-black/[0.04] flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#5850EC] shrink-0" />
                <span className="text-[#0F172A] font-medium leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. RECOMMENDED ADAPTIVE ACTION BANNER */}
      <div
        className={`rounded-[28px] p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm min-w-0 border ${
          feedback.status === 're_evaluate'
            ? 'bg-gradient-to-r from-[#FFF1F2] via-white to-slate-50 border-[#F43F5E]'
            : feedback.status === 'needs_adjustment'
            ? 'bg-gradient-to-r from-[#FFFBEB] via-white to-slate-50 border-[#F59E0B]/50'
            : 'bg-gradient-to-r from-[#ECFDF5] via-white to-slate-50 border-[#10B981]/50'
        }`}
      >
        <div className="space-y-1.5 min-w-0 flex-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5850EC]">
            RECOMMENDED ADAPTIVE ACTION
          </span>
          <h4 className="text-lg sm:text-xl font-bold text-[#0F172A] font-heading break-words">
            {feedback.next_action}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words font-medium">
            {feedback.trigger_reason}
          </p>
        </div>

        {feedback.should_re_evaluate ? (
          <Button
            variant="destructive"
            size="lg"
            onClick={onReRunSimulator}
            className="w-full md:w-auto px-8 font-bold shadow-lg shadow-[#F43F5E]/20 hover:shadow-xl shrink-0 gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>↻ RE-RUN FUTURE SIMULATOR</span>
          </Button>
        ) : (
          <Badge variant="indigo" size="lg" className="font-mono px-4 py-2 shrink-0 self-start md:self-center whitespace-normal break-words">
            Action: {feedback.recommendation.toUpperCase().replace(/_/g, ' ')}
          </Badge>
        )}
      </div>
    </section>
  );
};
