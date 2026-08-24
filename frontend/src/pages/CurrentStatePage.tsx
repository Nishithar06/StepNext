import React, { useState, useEffect } from 'react';
import { OverloadScore, UserProfile, DailyCheckIn } from '../types/schema';
import { getExerciseDisplay } from '../utils/checkinFormatter';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { RiskGauge } from '../components/common/RiskGauge';
import { ProgressBar } from '../components/common/ProgressBar';
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
        <Card title="Current State">
          <Skeleton lines={6} />
        </Card>
      </div>
    );
  }

  if (!overloadScore) {
    return (
      <Card title="Current State">
        <p className="text-xs text-[#667085]">Current state telemetry unavailable.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5DC] pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A6B] font-mono">
            HOW ARE YOU?
          </span>
          <h1 className="text-3xl font-extrabold text-[#171827] font-heading mt-0.5 flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#FF7A6B]" /> Current State
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Understand your present capacity, workload and recovery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCheckInModal}
            icon={<Calendar className="w-3.5 h-3.5" />}
          >
            {todayCheckIn ? "Edit Today's Check-in" : "Log Today's Check-in"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRecalculate}
            isLoading={recalculating}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            {recalculating ? 'Analyzing capacity...' : 'Recalculate Risk'}
          </Button>
        </div>
      </div>

      {/* PARAMETER CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-[18px] border border-[#E5E5DC] p-5 space-y-2 light-card-shadow">
          <div className="flex items-center gap-2 text-xs text-[#667085]">
            <Moon className="w-4 h-4 text-[#635BFF]" />
            <span className="font-bold uppercase tracking-wider">SLEEP</span>
          </div>
          <p className="text-3xl font-extrabold text-[#171827] font-heading font-mono">
            {profile?.sleep_hours ?? 7.0}h
          </p>
          <p className="text-[11px] text-[#B5861E] font-semibold">{profile?.sleep_hours ?? 7.0} hours / night</p>
        </div>

        <div className="bg-white rounded-[18px] border border-[#E5E5DC] p-5 space-y-2 light-card-shadow">
          <div className="flex items-center gap-2 text-xs text-[#667085]">
            <Activity className="w-4 h-4 text-[#FF7A6B]" />
            <span className="font-bold uppercase tracking-wider">WORKLOAD</span>
          </div>
          <p className="text-3xl font-extrabold text-[#171827] font-heading uppercase">
            {profile?.workload ?? 'MEDIUM'}
          </p>
          <p className="text-[11px] text-[#667085]">
            {profile?.workload === 'high' ? 'High intensity' : profile?.workload === 'medium' ? 'Moderate pace' : 'Relaxed pace'}
          </p>
        </div>

        <div className="bg-white rounded-[18px] border border-[#E5E5DC] p-5 space-y-2 light-card-shadow">
          <div className="flex items-center gap-2 text-xs text-[#667085]">
            <Briefcase className="w-4 h-4 text-purple-600" />
            <span className="font-bold uppercase tracking-wider">COMMITMENTS</span>
          </div>
          <p className="text-3xl font-extrabold text-[#171827] font-heading font-mono">
            {profile?.major_commitments?.length ?? 0}
          </p>
          <p className="text-[11px] text-[#667085]">{profile?.major_commitments?.length ?? 0} active track(s)</p>
        </div>

        <div className="bg-white rounded-[18px] border border-[#E5E5DC] p-5 space-y-2 light-card-shadow">
          <div className="flex items-center gap-2 text-xs text-[#667085]">
            <Clock className="w-4 h-4 text-[#32C6A6]" />
            <span className="font-bold uppercase tracking-wider">AVAILABLE TIME</span>
          </div>
          <p className="text-3xl font-extrabold text-[#171827] font-heading font-mono">
            {profile?.available_hours_per_day ?? 6.0}h/day
          </p>
          <p className="text-[11px] text-[#667085]">{profile?.available_hours_per_day ?? 6.0} hours per day</p>
        </div>
      </div>

      {/* OVERLOAD RISK HERO CENTERPIECE WITH SEMI-CIRCLE GAUGE & STACKED BARS */}
      <Card level={3} title="OVERLOAD RISK" subtitle="Capacity & stress analysis">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Semi-Circle Gauge */}
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-[#E5E5DC] light-card-shadow">
            <RiskGauge score={overloadScore.total_score} level={overloadScore.risk_level} size={170} />
            <div className="mt-4">
              <Badge variant={overloadScore.risk_level === 'Low' ? 'green' : overloadScore.risk_level === 'Moderate' ? 'amber' : 'red'} className="text-sm px-3.5 py-1 uppercase font-bold">
                {overloadScore.risk_level} RISK
              </Badge>
            </div>
          </div>

          {/* Stacked Factor Drivers */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              What is driving this score?
            </h4>
            <div className="space-y-3 text-xs">
              <ProgressBar label={`Sleep deficit (+${overloadScore.breakdown?.sleep_deficit ?? 0})`} value={Math.min(100, ((overloadScore.breakdown?.sleep_deficit ?? 0) / 35) * 100)} color="bg-[#F5C96A]" />
              <ProgressBar label={`Workload level (+${overloadScore.breakdown?.high_workload ?? 0})`} value={Math.min(100, ((overloadScore.breakdown?.high_workload ?? 0) / 25) * 100)} color="bg-[#FF7A6B]" />
              <ProgressBar label={`Commitments density (+${overloadScore.breakdown?.commitments_density ?? 0})`} value={Math.min(100, ((overloadScore.breakdown?.commitments_density ?? 0) / 25) * 100)} color="bg-[#635BFF]" />
              <ProgressBar label={`Buffer shortage (+${overloadScore.breakdown?.recovery_shortage ?? 0})`} value={Math.min(100, ((overloadScore.breakdown?.recovery_shortage ?? 0) / 15) * 100)} color="bg-[#32C6A6]" />
            </div>
          </div>
        </div>
      </Card>

      {/* ACTIONABLE SUGGESTIONS (ACTION CARDS) */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
          ACTIONABLE SUGGESTIONS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {overloadScore.recommendations.map((rec, idx) => (
            <Card level={2} key={idx} className="space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-2xl font-extrabold font-mono text-[#635BFF]">
                  0{idx + 1}
                </span>
                <p className="text-xs font-semibold text-[#171827] leading-relaxed">
                  {rec}
                </p>
                <p className="text-[10px] text-[#667085]">
                  Expected effect: <strong className="text-[#219B81]">Lower overload pressure</strong>
                </p>
              </div>

              <Button
                variant={addedPlans[idx] ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => handleTogglePlan(idx)}
                icon={addedPlans[idx] ? <Check className="w-3.5 h-3.5 text-[#32C6A6]" /> : <Plus className="w-3.5 h-3.5" />}
                className="w-full justify-center"
              >
                {addedPlans[idx] ? 'Added to plan' : 'Add to plan'}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* DEDICATED 30-DAY CHECK-IN HISTORY SECTION */}
      <section className="space-y-5 pt-6 border-t border-[#E5E5DC]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] font-mono">
              TELEMETRY LOGS
            </span>
            <h2 className="text-2xl font-extrabold text-[#171827] font-heading mt-0.5 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#635BFF]" /> 30-Day Check-in History
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Review your daily sleep, energy, workload, and habits trends.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenCheckInModal}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            {todayCheckIn ? "Edit Today's Log" : "Log Today's Entry"}
          </Button>
        </div>

        {/* 1. HISTORY SUMMARY CARDS */}
        {totalCount > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-2xl border border-[#E5E5DC] p-4 space-y-1 light-card-shadow">
              <div className="flex items-center gap-1.5 text-[11px] text-[#667085]">
                <Moon className="w-3.5 h-3.5 text-[#635BFF]" />
                <span className="font-bold">AVG SLEEP</span>
              </div>
              <p className="text-xl font-extrabold text-[#171827] font-mono font-heading">
                {avgSleep}h
              </p>
              <p className="text-[10px] text-[#667085]">Target 7.5h</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E5DC] p-4 space-y-1 light-card-shadow">
              <div className="flex items-center gap-1.5 text-[11px] text-[#667085]">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold">AVG ENERGY</span>
              </div>
              <p className="text-xl font-extrabold text-[#171827] font-mono font-heading">
                {avgEnergy}/10
              </p>
              <p className="text-[10px] text-[#667085]">Energy scale</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E5DC] p-4 space-y-1 light-card-shadow">
              <div className="flex items-center gap-1.5 text-[11px] text-[#667085]">
                <Activity className="w-3.5 h-3.5 text-rose-500" />
                <span className="font-bold">AVG STRESS</span>
              </div>
              <p className="text-xl font-extrabold text-[#171827] font-mono font-heading">
                {avgStress}/10
              </p>
              <p className="text-[10px] text-[#667085]">Stress scale</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E5DC] p-4 space-y-1 light-card-shadow">
              <div className="flex items-center gap-1.5 text-[11px] text-[#667085]">
                <Clock className="w-3.5 h-3.5 text-[#32C6A6]" />
                <span className="font-bold">WORK / STUDY</span>
              </div>
              <p className="text-xl font-extrabold text-[#171827] font-mono font-heading">
                {avgWorkStudy}h
              </p>
              <p className="text-[10px] text-[#667085]">Daily average</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E5DC] p-4 space-y-1 light-card-shadow">
              <div className="flex items-center gap-1.5 text-[11px] text-[#667085]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#219B81]" />
                <span className="font-bold">TASKS DONE</span>
              </div>
              <p className="text-xl font-extrabold text-[#171827] font-mono font-heading">
                {taskCompletionRate}%
              </p>
              <p className="text-[10px] text-[#667085]">{totalCompleted}/{totalPlanned} tasks</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E5DC] p-4 space-y-1 light-card-shadow">
              <div className="flex items-center gap-1.5 text-[11px] text-[#667085]">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-bold">EXERCISE</span>
              </div>
              <p className="text-xl font-extrabold text-[#171827] font-mono font-heading">
                {exerciseDays} days
              </p>
              <p className="text-[10px] text-[#667085]">Active workouts</p>
            </div>
          </div>
        )}

        {/* 2. EMPTY STATE WHEN NO CHECK-INS */}
        {totalCount === 0 && !historyLoading && (
          <Card level={2} className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center mx-auto text-xl font-bold">
              🌱
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-[#171827] font-heading">No check-ins yet</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Start logging your day to help StepNext understand your patterns.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenCheckInModal}
              icon={<Calendar className="w-4 h-4" />}
            >
              Log Today's Check-in
            </Button>
          </Card>
        )}

        {/* 3. EXPANDABLE 30-DAY CHECK-IN LIST */}
        {totalCount > 0 && (
          <div className="space-y-3">
            {checkInsHistory.map(c => {
              const isExpanded = !!expandedDates[c.date];
              return (
                <div key={c.id || c.date} className="bg-white border border-[#E5E5DC] rounded-2xl overflow-hidden light-card-shadow transition">
                  <div
                    onClick={() => toggleExpandDate(c.date)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-[#FAF9F5] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#635BFF]/10 text-[#635BFF]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#171827] font-mono text-sm">{c.date}</span>
                          {c.date === todayCheckIn?.date && (
                            <Badge variant="green" className="text-[10px]">Today</Badge>
                          )}
                        </div>
                        <span className="text-xs text-[#667085]">
                          🌙 {c.sleep_duration}h sleep ({c.sleep_time} - {c.wake_time})
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-mono text-[#635BFF] font-semibold bg-[#635BFF]/10 px-2.5 py-1 rounded-lg">
                        ⚡ {c.energy}/10 nrg • 🔥 {c.stress}/10 stress
                      </span>

                      <span className="font-mono text-[#219B81] font-semibold bg-[#32C6A6]/15 px-2.5 py-1 rounded-lg">
                        ✅ {c.completed_tasks}/{c.planned_tasks} tasks
                      </span>

                      {(() => {
                        const exInfo = getExerciseDisplay(c);
                        return (
                          <Badge variant={exInfo.variant === 'green' ? 'green' : 'neutral'} className="font-semibold">
                            {exInfo.text}
                          </Badge>
                        );
                      })()}

                      <div className="flex items-center gap-1 text-[#667085] font-semibold ml-1">
                        <span>{isExpanded ? 'Hide details' : 'View details'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* EXPANDABLE FULL DETAILS */}
                  {isExpanded && (
                    <div className="p-5 bg-[#FAF9F5] border-t border-[#E5E5DC] space-y-4 text-xs animate-fade-in">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-white border border-[#E5E5DC]">
                          <span className="text-[#667085] block text-[11px] font-medium mb-0.5">Work / Study Hours</span>
                          <span className="font-bold text-[#171827] font-mono">{c.work_hours}h work / {c.study_hours}h study</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-[#E5E5DC]">
                          <span className="text-[#667085] block text-[11px] font-medium mb-0.5">Mood Rating</span>
                          <span className="font-bold text-[#219B81] font-mono">{c.mood} / 10</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-[#E5E5DC]">
                          <span className="text-[#667085] block text-[11px] font-medium mb-0.5">Exercise Habit</span>
                          <span className="font-bold text-[#171827]">{getExerciseDisplay(c).text}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-[#E5E5DC]">
                          <span className="text-[#667085] block text-[11px] font-medium mb-0.5">Sleep Window</span>
                          <span className="font-bold text-[#635BFF] font-mono">{c.sleep_time} → {c.wake_time}</span>
                        </div>
                      </div>

                      {c.achievement && (
                        <div className="p-3 rounded-xl bg-white border border-[#E5E5DC]">
                          <span className="text-[#667085] font-bold text-[11px] block mb-0.5">🏆 Biggest Achievement</span>
                          <p className="text-[#171827] font-semibold">{c.achievement}</p>
                        </div>
                      )}

                      {c.blocker && (
                        <div className="p-3 rounded-xl bg-white border border-[#E5E5DC]">
                          <span className="text-[#667085] font-bold text-[11px] block mb-0.5">🚧 Friction / Blocker</span>
                          <p className="text-[#171827] font-semibold">{c.blocker}</p>
                        </div>
                      )}

                      {c.tomorrow_priority && (
                        <div className="p-3 rounded-xl bg-white border border-[#E5E5DC]">
                          <span className="text-[#667085] font-bold text-[11px] block mb-0.5">🎯 Next Day Priority</span>
                          <p className="text-[#635BFF] font-bold">{c.tomorrow_priority}</p>
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

