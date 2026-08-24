import React, { useState, useEffect } from 'react';
import { OverloadScore, UserProfile, DailyCheckIn } from '../types/schema';
import { getExerciseDisplay } from '../utils/checkinFormatter';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { RiskGauge } from '../components/common/RiskGauge';
import { Skeleton } from '../components/common/Skeleton';
import { fetchCheckIns } from '../api/client';
import {
  Activity,
  RefreshCw,
  Moon,
  Clock,
  Briefcase,
  Plus,
  Check,
  Calendar,
  Flame,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Smile,
  Award
} from 'lucide-react';
import { useStaggerEntrance } from '../hooks/useGsap';

interface CurrentStatePageProps {
  overloadScore: OverloadScore | null;
  profile: UserProfile | null;
  loading: boolean;
  todayCheckIn: DailyCheckIn | null;
  onRecalculate: () => Promise<void>;
  onOpenCheckInModal: () => void;
}

export const CurrentStatePage: React.FC<CurrentStatePageProps> = ({
  overloadScore,
  profile,
  loading,
  todayCheckIn,
  onRecalculate,
  onOpenCheckInModal
}) => {
  const containerRef = useStaggerEntrance('.stagger-card', [profile?.user_id, overloadScore?.total_score]);
  const [recalculating, setRecalculating] = useState(false);
  const [addedPlans, setAddedPlans] = useState<{ [key: number]: boolean }>({});
  
  // 30-Day History State
  const [checkInsHistory, setCheckInsHistory] = useState<DailyCheckIn[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedDates, setExpandedDates] = useState<{ [key: string]: boolean }>({});

  const loadCheckInsHistory = async () => {
    if (!profile?.user_id) {
      setCheckInsHistory([]);
      return;
    }
    setHistoryLoading(true);
    try {
      const data = await fetchCheckIns(profile.user_id, 30);
      setCheckInsHistory(data || []);
    } catch (err) {
      console.warn('Check-in history fetch error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadCheckInsHistory();
  }, [profile?.user_id, todayCheckIn]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    await onRecalculate();
    setRecalculating(false);
  };

  const handleTogglePlan = (idx: number) => {
    setAddedPlans({ ...addedPlans, [idx]: !addedPlans[idx] });
  };

  const toggleExpandDate = (dateStr: string) => {
    setExpandedDates(prev => ({ ...prev, [dateStr]: !prev[dateStr] }));
  };

  // Summary statistics calculations
  const totalCount = checkInsHistory.length;
  const avgSleep = totalCount > 0 ? (checkInsHistory.reduce((s, c) => s + c.sleep_duration, 0) / totalCount).toFixed(1) : '0';
  const avgEnergy = totalCount > 0 ? (checkInsHistory.reduce((s, c) => s + c.energy, 0) / totalCount).toFixed(1) : '0';
  const avgStress = totalCount > 0 ? (checkInsHistory.reduce((s, c) => s + c.stress, 0) / totalCount).toFixed(1) : '0';
  const avgWorkStudy = totalCount > 0 ? (checkInsHistory.reduce((s, c) => s + c.work_hours + c.study_hours, 0) / totalCount).toFixed(1) : '0';
  const exerciseDays = checkInsHistory.filter(c => c.exercise_completed).length;

  const totalPlanned = checkInsHistory.reduce((s, c) => s + c.planned_tasks, 0);
  const totalCompleted = checkInsHistory.reduce((s, c) => s + c.completed_tasks, 0);
  const taskCompletionRate = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;

  if (loading && !overloadScore) {
    return (
      <div className="space-y-6">
        <Card level={2} className="p-8">
          <Skeleton lines={6} />
        </Card>
      </div>
    );
  }

  if (!overloadScore) {
    return (
      <Card level={2} className="p-8 text-center space-y-3">
        <p className="text-xs text-slate-500 font-mono">Current state telemetry unavailable.</p>
      </Card>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="stagger-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#F43F5E]">
            CAPACITY & RECOVERY INTELLIGENCE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading tracking-tight mt-0.5 flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-[#F43F5E]" /> Current State
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Understand your daily workload pressure, recovery windows, and burnout risk.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="default"
            size="sm"
            onClick={onOpenCheckInModal}
            className="gap-1.5 font-bold"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayCheckIn ? "Edit Check-in" : "Log Check-in"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={recalculating}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Analyzing...' : 'Recalculate'}</span>
          </Button>
        </div>
      </div>

      {/* PARAMETER METRIC CARDS */}
      <div className="stagger-card grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-[24px] border border-black/[0.07] p-5 space-y-2 shadow-sm hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Moon className="w-4 h-4 text-[#5850EC]" />
            <span className="font-mono font-bold uppercase text-[10px] tracking-wider">SLEEP QUOTA</span>
          </div>
          <p className="text-3xl font-extrabold text-[#0F172A] font-heading font-mono">
            {profile?.sleep_hours ?? 7.0}h
          </p>
          <p className="text-[11px] text-[#F59E0B] font-semibold">{profile?.sleep_hours ?? 7.0} hours / night</p>
        </div>

        <div className="bg-white rounded-[24px] border border-black/[0.07] p-5 space-y-2 shadow-sm hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Activity className="w-4 h-4 text-[#F43F5E]" />
            <span className="font-mono font-bold uppercase text-[10px] tracking-wider">WORKLOAD</span>
          </div>
          <p className="text-3xl font-extrabold text-[#0F172A] font-heading uppercase font-mono">
            {profile?.workload ?? 'MEDIUM'}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            {profile?.workload === 'high' ? 'High intensity' : profile?.workload === 'medium' ? 'Moderate pace' : 'Relaxed pace'}
          </p>
        </div>

        <div className="bg-white rounded-[24px] border border-black/[0.07] p-5 space-y-2 shadow-sm hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Briefcase className="w-4 h-4 text-purple-600" />
            <span className="font-mono font-bold uppercase text-[10px] tracking-wider">TRACKS</span>
          </div>
          <p className="text-3xl font-extrabold text-[#0F172A] font-heading font-mono">
            {profile?.major_commitments?.length ?? 0}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">{profile?.major_commitments?.length ?? 0} active track(s)</p>
        </div>

        <div className="bg-white rounded-[24px] border border-black/[0.07] p-5 space-y-2 shadow-sm hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-4 h-4 text-[#10B981]" />
            <span className="font-mono font-bold uppercase text-[10px] tracking-wider">FOCUS BUFFER</span>
          </div>
          <p className="text-3xl font-extrabold text-[#0F172A] font-heading font-mono">
            {profile?.available_hours_per_day ?? 6.0}h
          </p>
          <p className="text-[11px] text-slate-500 font-medium">{profile?.available_hours_per_day ?? 6.0} daily focus buffer</p>
        </div>
      </div>

      {/* OVERLOAD RISK HERO CENTERPIECE WITH SEMI-CIRCLE GAUGE & STACKED BARS */}
      <div className="stagger-card bg-white rounded-[28px] border border-black/[0.08] p-6 lg:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-[0.16em] text-[#5850EC]">
              CAPACITY ANALYSIS
            </span>
            <h3 className="text-xl font-extrabold text-[#0F172A] font-heading">
              Overload Risk Matrix
            </h3>
          </div>
          <Badge variant={overloadScore.risk_level === 'Low' ? 'success' : overloadScore.risk_level === 'Moderate' ? 'warning' : 'destructive'} dot size="lg">
            {overloadScore.risk_level} Risk Level
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Semi-Circle Gauge */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50/80 rounded-2xl border border-black/[0.05]">
            <RiskGauge score={overloadScore.total_score} level={overloadScore.risk_level} size={180} />
            <div className="mt-4 text-center">
              <span className="text-xs text-slate-500 font-mono">
                {overloadScore.total_score < 30 ? 'Sustainable load' : overloadScore.total_score < 60 ? 'Moderate schedule friction' : 'Critical burnout hazard'}
              </span>
            </div>
          </div>

          {/* Stacked Factor Drivers */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-slate-500">
              SCORE DRIVER BREAKDOWN
            </h4>
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-[#0F172A]">Sleep Deficit</span>
                  <span className="font-mono text-slate-500">+{overloadScore.breakdown?.sleep_deficit ?? 0} pts</span>
                </div>
                <Progress value={Math.min(100, ((overloadScore.breakdown?.sleep_deficit ?? 0) / 35) * 100)} indicatorColor="bg-[#F59E0B]" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-[#0F172A]">Workload Intensity</span>
                  <span className="font-mono text-slate-500">+{overloadScore.breakdown?.high_workload ?? 0} pts</span>
                </div>
                <Progress value={Math.min(100, ((overloadScore.breakdown?.high_workload ?? 0) / 25) * 100)} indicatorColor="bg-[#F43F5E]" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-[#0F172A]">Commitment Density</span>
                  <span className="font-mono text-slate-500">+{overloadScore.breakdown?.commitments_density ?? 0} pts</span>
                </div>
                <Progress value={Math.min(100, ((overloadScore.breakdown?.commitments_density ?? 0) / 25) * 100)} indicatorColor="bg-[#5850EC]" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-[#0F172A]">Recovery Window Shortage</span>
                  <span className="font-mono text-slate-500">+{overloadScore.breakdown?.recovery_shortage ?? 0} pts</span>
                </div>
                <Progress value={Math.min(100, ((overloadScore.breakdown?.recovery_shortage ?? 0) / 15) * 100)} indicatorColor="bg-[#10B981]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONABLE SUGGESTIONS */}
      <section className="stagger-card space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-slate-500">
          RECOMMENDED ADJUSTMENTS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {overloadScore.recommendations.map((rec, idx) => (
            <div key={idx} className="bg-white rounded-[24px] border border-black/[0.07] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-transform">
              <div className="space-y-2">
                <span className="text-2xl font-extrabold font-mono text-[#5850EC]">
                  0{idx + 1}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#0F172A] leading-relaxed">
                  {rec}
                </p>
                <p className="text-[11px] text-slate-500">
                  Target impact: <strong className="text-[#10B981]">Reduce overload pressure</strong>
                </p>
              </div>

              <Button
                variant={addedPlans[idx] ? 'outline' : 'default'}
                size="sm"
                onClick={() => handleTogglePlan(idx)}
                className="w-full justify-center gap-1.5"
              >
                {addedPlans[idx] ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{addedPlans[idx] ? 'Added to plan' : 'Add to roadmap'}</span>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* 30-DAY CHECK-IN HISTORY SECTION */}
      <section className="stagger-card space-y-5 pt-6 border-t border-black/[0.06]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#5850EC]">
              TELEMETRY ARCHIVE
            </span>
            <h2 className="text-2xl font-extrabold text-[#0F172A] font-heading mt-0.5 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#5850EC]" /> 30-Day Check-in History
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Review daily sleep, energy, workload, and habit patterns.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCheckInModal}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{todayCheckIn ? "Edit Today's Log" : "Log Today's Entry"}</span>
          </Button>
        </div>

        {/* SUMMARY CARDS */}
        {totalCount > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-2xl border border-black/[0.06] p-4 space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Moon className="w-3.5 h-3.5 text-[#5850EC]" />
                <span className="font-mono font-bold text-[10px]">AVG SLEEP</span>
              </div>
              <p className="text-xl font-extrabold text-[#0F172A] font-mono font-heading">
                {avgSleep}h
              </p>
              <p className="text-[10px] text-slate-400 font-mono">Target 7.5h</p>
            </div>

            <div className="bg-white rounded-2xl border border-black/[0.06] p-4 space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-mono font-bold text-[10px]">AVG ENERGY</span>
              </div>
              <p className="text-xl font-extrabold text-[#0F172A] font-mono font-heading">
                {avgEnergy}/10
              </p>
              <p className="text-[10px] text-slate-400 font-mono">Energy index</p>
            </div>

            <div className="bg-white rounded-2xl border border-black/[0.06] p-4 space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Activity className="w-3.5 h-3.5 text-rose-500" />
                <span className="font-mono font-bold text-[10px]">AVG STRESS</span>
              </div>
              <p className="text-xl font-extrabold text-[#0F172A] font-mono font-heading">
                {avgStress}/10
              </p>
              <p className="text-[10px] text-slate-400 font-mono">Stress index</p>
            </div>

            <div className="bg-white rounded-2xl border border-black/[0.06] p-4 space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="font-mono font-bold text-[10px]">WORK/STUDY</span>
              </div>
              <p className="text-xl font-extrabold text-[#0F172A] font-mono font-heading">
                {avgWorkStudy}h
              </p>
              <p className="text-[10px] text-slate-400 font-mono">Daily average</p>
            </div>

            <div className="bg-white rounded-2xl border border-black/[0.06] p-4 space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="font-mono font-bold text-[10px]">TASKS DONE</span>
              </div>
              <p className="text-xl font-extrabold text-[#0F172A] font-mono font-heading">
                {taskCompletionRate}%
              </p>
              <p className="text-[10px] text-slate-400 font-mono">{totalCompleted}/{totalPlanned} tasks</p>
            </div>

            <div className="bg-white rounded-2xl border border-black/[0.06] p-4 space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="font-mono font-bold text-[10px]">WORKOUTS</span>
              </div>
              <p className="text-xl font-extrabold text-[#0F172A] font-mono font-heading">
                {exerciseDays} days
              </p>
              <p className="text-[10px] text-slate-400 font-mono">Active days</p>
            </div>
          </div>
        )}

        {/* EXPANDABLE 30-DAY CHECK-IN LIST */}
        {totalCount > 0 && (
          <div className="space-y-3">
            {checkInsHistory.map(c => {
              const isExpanded = !!expandedDates[c.date];
              return (
                <div key={c.id || c.date} className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
                  <div
                    onClick={() => toggleExpandDate(c.date)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#5850EC]/10 text-[#5850EC]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#0F172A] font-mono text-sm">{c.date}</span>
                          {c.date === todayCheckIn?.date && (
                            <Badge variant="success" size="sm">Today</Badge>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 font-mono">
                          🌙 {c.sleep_duration}h sleep ({c.sleep_time} → {c.wake_time})
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 text-xs">
                      <span className="font-mono text-[#5850EC] font-semibold bg-[#5850EC]/10 px-2.5 py-1 rounded-lg">
                        ⚡ {c.energy}/10 nrg • {c.stress}/10 stress
                      </span>

                      <span className="font-mono text-[#10B981] font-semibold bg-[#10B981]/15 px-2.5 py-1 rounded-lg">
                        ✅ {c.completed_tasks}/{c.planned_tasks} tasks
                      </span>

                      <div className="flex items-center gap-1 text-slate-500 font-semibold ml-1">
                        <span>{isExpanded ? 'Hide' : 'Details'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* EXPANDABLE FULL DETAILS */}
                  {isExpanded && (
                    <div className="p-5 bg-slate-50/90 border-t border-black/[0.06] space-y-4 text-xs animate-in fade-in duration-200">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-white border border-black/[0.05]">
                          <span className="text-slate-500 block text-[10px] font-mono uppercase mb-0.5">Work / Study Hours</span>
                          <span className="font-bold text-[#0F172A] font-mono">{c.work_hours}h work / {c.study_hours}h study</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-black/[0.05]">
                          <span className="text-slate-500 block text-[10px] font-mono uppercase mb-0.5">Mood Rating</span>
                          <span className="font-bold text-[#10B981] font-mono">{c.mood} / 10</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-black/[0.05]">
                          <span className="text-slate-500 block text-[10px] font-mono uppercase mb-0.5">Physical Habit</span>
                          <span className="font-bold text-[#0F172A]">{getExerciseDisplay(c).text}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-black/[0.05]">
                          <span className="text-slate-500 block text-[10px] font-mono uppercase mb-0.5">Sleep Window</span>
                          <span className="font-bold text-[#5850EC] font-mono">{c.sleep_time} → {c.wake_time}</span>
                        </div>
                      </div>

                      {c.achievement && (
                        <div className="p-3 rounded-xl bg-white border border-black/[0.05]">
                          <span className="text-slate-500 font-mono font-bold text-[10px] uppercase block mb-1">🏆 Biggest Achievement</span>
                          <p className="text-[#0F172A] font-medium">{c.achievement}</p>
                        </div>
                      )}

                      {c.blocker && (
                        <div className="p-3 rounded-xl bg-white border border-black/[0.05]">
                          <span className="text-slate-500 font-mono font-bold text-[10px] uppercase block mb-1">🚧 Friction / Blocker</span>
                          <p className="text-[#0F172A] font-medium">{c.blocker}</p>
                        </div>
                      )}

                      {c.tomorrow_priority && (
                        <div className="p-3 rounded-xl bg-white border border-black/[0.05]">
                          <span className="text-slate-500 font-mono font-bold text-[10px] uppercase block mb-1">🎯 Next Day Focus</span>
                          <p className="text-[#5850EC] font-bold font-mono">{c.tomorrow_priority}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
