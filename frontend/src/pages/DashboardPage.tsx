import React, { useState } from 'react';
import { UserProfile, DerivedProfile, OverloadScore, SimulationResponse, DailyCheckIn, CheckInSummary } from '../types/schema';
import { getExerciseDisplay } from '../utils/checkinFormatter';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { LifeOrbit } from '../components/common/LifeOrbit';
import {
  Brain,
  Compass,
  ArrowRight,
  Target,
  TrendingUp,
  AlertTriangle,
  Zap,
  Activity,
  CheckCircle2,
  Calendar,
  Moon,
  Smile,
  Flame,
  Award,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';
import { TabType } from '../components/layout/Sidebar';

interface DashboardPageProps {
  profile: UserProfile | null;
  digitalTwin: DerivedProfile | null;
  overloadScore: OverloadScore | null;
  simulationData: SimulationResponse | null;
  todayCheckIn: DailyCheckIn | null;
  checkInSummary: CheckInSummary | null;
  onNavigateTab: (tab: TabType) => void;
  onOpenOnboarding: () => void;
  onOpenCheckInModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  profile,
  digitalTwin,
  overloadScore,
  simulationData,
  todayCheckIn,
  checkInSummary,
  onNavigateTab,
  onOpenOnboarding,
  onOpenCheckInModal
}) => {
  const name = profile?.name ? profile.name.split(' ')[0] : 'User';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const topResult = simulationData?.results[0];
  const placementReadiness = topResult ? topResult.overall_score : (profile ? Math.min(95, 60 + (profile.skills?.length || 0) * 5) : 80);
  const skillProgress = topResult ? topResult.skill_growth : (profile ? Math.min(95, 50 + (profile.skills?.length || 0) * 6) : 75);

  const [expandedHistoryDate, setExpandedHistoryDate] = useState<string | null>(null);

  const toggleHistoryDate = (dateStr: string) => {
    if (expandedHistoryDate === dateStr) {
      setExpandedHistoryDate(null);
    } else {
      setExpandedHistoryDate(dateStr);
    }
  };

  const hasWeeklyProgress = Boolean(
    checkInSummary && checkInSummary.total_checkins > 0
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 01: EDITORIAL TWO-COLUMN HERO WITH LIFE ORBIT */}
      <section className="bg-gradient-to-r from-white via-[#FAF9F5] to-[#F0EEFF] border border-[#E5E5DC] rounded-[24px] p-6 lg:p-8 light-card-shadow">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* LEFT: Greeting & Goal */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="indigo" icon={<Target className="w-3.5 h-3.5" />}>
                Goal: {profile?.career_goal || 'Software & AI Engineer'}
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-[#171827] font-heading tracking-tight">
              {greeting.toUpperCase()}, {name.toUpperCase()}.
            </h1>
            <p className="text-sm sm:text-base text-[#667085] leading-relaxed max-w-xl">
              Let's see where you are — and what deserves your attention next.
            </p>
          </div>

          {/* RIGHT: THE LIFE ORBIT VISUAL MOTIF */}
          <div className="md:col-span-5 flex justify-center">
            <LifeOrbit userName={name} userGoal={profile?.career_goal || 'Software Engineer'} />
          </div>
        </div>
      </section>

      {/* 02: PROMINENT DAILY CHECK-IN BANNER */}
      <section className="bg-white rounded-[22px] border-2 border-[#635BFF] p-6 light-card-shadow space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#635BFF] font-mono">
                DAILY CHECK-IN
              </span>
              {todayCheckIn && (
                <Badge variant="green" className="text-xs font-bold font-mono">
                  ✓ Today's Check-in Complete
                </Badge>
              )}
            </div>

            <h3 className="text-xl font-extrabold text-[#171827] font-heading">
              {todayCheckIn ? "Today's Telemetry Logged" : "How did today actually go?"}
            </h3>

            <p className="text-xs text-[#667085] leading-relaxed max-w-2xl">
              {todayCheckIn
                ? "Your daily sleep, energy, workload, and reflection data have been synced to StepNext's Overload Risk engine."
                : "Report today's sleep, energy levels, completed tasks, and reflections (takes 30 seconds) to keep StepNext synced with reality."}
            </p>
          </div>

          <Button
            variant={todayCheckIn ? "secondary" : "primary"}
            size="lg"
            onClick={onOpenCheckInModal}
            className="shrink-0 px-5 py-2.5 font-bold"
          >
            {todayCheckIn ? "Edit Check-in" : "Complete Today's Check-in →"}
          </Button>
        </div>

        {/* If Today's Check-in is complete, show telemetry pill summary */}
        {todayCheckIn && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E5E5DC] text-xs">
            <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC]">
              <span className="text-[#667085] block mb-0.5 font-medium">🌙 Sleep Duration</span>
              <span className="font-bold text-[#171827] font-mono">
                {todayCheckIn.sleep_duration}h ({todayCheckIn.sleep_time} → {todayCheckIn.wake_time})
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC]">
              <span className="text-[#667085] block mb-0.5 font-medium">⚡ Energy & Stress</span>
              <span className="font-bold text-[#171827] font-mono">
                {todayCheckIn.energy}/10 energy • {todayCheckIn.stress}/10 stress
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC]">
              <span className="text-[#667085] block mb-0.5 font-medium">✅ Tasks Completed</span>
              <span className="font-bold text-[#635BFF] font-mono">
                {todayCheckIn.completed_tasks} / {todayCheckIn.planned_tasks} tasks
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC]">
              <span className="text-[#667085] block mb-0.5 font-medium">🏋️ Exercise & Habits</span>
              {(() => {
                const exInfo = getExerciseDisplay(todayCheckIn);
                return (
                  <span className={`font-bold ${exInfo.hasExercise ? 'text-[#219B81]' : 'text-[#667085]'}`}>
                    {exInfo.text}
                  </span>
                );
              })()}
            </div>
          </div>
        )}
      </section>

      {/* 03: WEEKLY TELEMETRY TRENDS & STREAK SUMMARY */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#667085]">
          <span className="font-bold uppercase tracking-wider">THIS WEEK'S TELEMETRY & TRENDS</span>
          {hasWeeklyProgress && (
            <span className="font-mono text-[#635BFF] font-bold">
              🔥 {checkInSummary?.streak_days || 0} DAY STREAK
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card level={2} className="space-y-2">
            <div className="flex justify-between items-center text-xs text-[#667085]">
              <span className="font-semibold">SLEEP AVERAGE</span>
              <Moon className="w-4 h-4 text-[#635BFF]" />
            </div>
            <div className="text-2xl font-extrabold text-[#171827] font-mono font-heading">
              {hasWeeklyProgress ? `${checkInSummary?.avg_sleep}h` : '--'} {hasWeeklyProgress && <span className="text-xs font-normal text-[#667085]">avg</span>}
            </div>
            <p className="text-[11px] text-[#667085]">
              {hasWeeklyProgress ? 'Target: 7.5 hours / night' : 'Log daily check-in to track sleep'}
            </p>
          </Card>

          <Card level={2} className="space-y-2.5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs text-[#667085]">
              <span className="font-semibold">ENERGY & STRESS</span>
              <Activity className="w-4 h-4 text-[#32C6A6]" />
            </div>

            {hasWeeklyProgress ? (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E5E5DC]">
                {/* ENERGY METRIC BLOCK */}
                <div className="space-y-1 border-r border-[#E5E5DC] pr-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">
                    <Zap className="w-3.5 h-3.5 text-[#32C6A6]" /> ENERGY
                  </div>
                  <div className="text-xl font-extrabold text-[#171827] font-mono font-heading">
                    {checkInSummary?.avg_energy ?? checkInSummary?.average_energy ?? '--'}<span className="text-xs font-normal text-[#667085]">/10</span>
                  </div>
                  <p className="text-[10px] text-[#667085]">Energy level</p>
                </div>

                {/* STRESS METRIC BLOCK */}
                <div className="space-y-1 pl-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A6B] inline-block" /> STRESS
                  </div>
                  <div className="text-xl font-extrabold text-[#171827] font-mono font-heading">
                    {checkInSummary?.avg_stress ?? checkInSummary?.average_stress ?? '--'}<span className="text-xs font-normal text-[#667085]">/10</span>
                  </div>
                  <p className="text-[10px] text-[#667085]">Stress level</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1 py-1">
                <div className="text-2xl font-extrabold text-[#171827] font-mono font-heading">
                  --
                </div>
                <p className="text-[11px] text-[#667085]">
                  Log daily check-in to track energy
                </p>
              </div>
            )}
          </Card>

          {/* TASK COMPLETION CARD */}
          <Card level={2} className="space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs text-[#667085]">
              <span className="font-semibold">TASK COMPLETION</span>
              <CheckCircle2 className={`w-4 h-4 ${hasWeeklyProgress ? 'text-[#219B81]' : 'text-[#98A2B3]'}`} />
            </div>

            {hasWeeklyProgress ? (
              <>
                <div className="text-2xl font-extrabold text-[#171827] font-mono font-heading">
                  {checkInSummary?.task_completion_rate}%
                </div>
                <ProgressBar value={checkInSummary?.task_completion_rate || 0} color="bg-[#32C6A6]" showPercentage={false} />
              </>
            ) : (
              <div className="space-y-2 py-1">
                <div className="text-sm font-bold text-[#171827] font-heading">
                  No weekly data yet
                </div>
                <p className="text-[11px] text-[#667085] leading-normal">
                  Complete your first weekly check-in to start tracking your progress.
                </p>
                <div className="w-full h-2 bg-[#E5E5DC] rounded-full overflow-hidden">
                  <div className="h-full bg-[#D1D1C7] w-0" />
                </div>
              </div>
            )}
          </Card>

          <Card level={2} className="space-y-2">
            <div className="flex justify-between items-center text-xs text-[#667085]">
              <span className="font-semibold">CHECK-IN STREAK</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-[#171827] font-mono font-heading flex items-center gap-1">
              {hasWeeklyProgress ? `${checkInSummary?.streak_days} days` : '0 days'}
            </div>
            <p className="text-[11px] text-[#667085]">
              {hasWeeklyProgress ? `${checkInSummary?.total_checkins} total check-ins logged` : 'No check-ins logged yet'}
            </p>
          </Card>
        </div>
      </section>

      {/* 04: DASHBOARD ASYMMETRIC SNAPSHOT GRID */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#667085]">
          <span className="font-bold uppercase tracking-wider">YOUR SNAPSHOT</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Large Placement Readiness Card */}
          <div
            onClick={() => onNavigateTab('simulator')}
            className="md:col-span-6 bg-white border border-[#E5E5DC] rounded-[18px] p-6 light-card-shadow cursor-pointer hover:border-[#635BFF]/50 transition group space-y-4"
          >
            <div className="flex items-center justify-between text-xs text-[#667085]">
              <span className="font-semibold uppercase tracking-wider">CAREER READINESS</span>
              <span className="text-xs text-[#32C6A6] font-mono font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> ↗ Dynamic trajectory
              </span>
            </div>

            <div className="text-4xl font-extrabold text-[#171827] font-heading font-mono">
              {placementReadiness}%
            </div>

            <div className="w-full h-16 pt-2">
              <svg className="w-full h-full text-[#635BFF]" viewBox="0 0 300 60" fill="none">
                <path
                  d="M0 50 C50 40, 100 45, 150 25 C200 5, 250 20, 300 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="300" cy="10" r="5" fill="#635BFF" />
              </svg>
            </div>
          </div>

          {/* Skill Progress Card */}
          <div
            onClick={() => onNavigateTab('digital_twin')}
            className="md:col-span-3 bg-white border border-[#E5E5DC] rounded-[18px] p-6 light-card-shadow cursor-pointer hover:border-purple-300 transition group space-y-4 flex flex-col justify-between"
          >
            <div className="text-xs text-[#667085] font-semibold uppercase tracking-wider">
              SKILLS
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#171827] font-heading font-mono">
                {skillProgress}%
              </div>
              <p className="text-xs text-[#667085] mt-1 font-medium">{profile?.skills?.length || 0} active skills</p>
            </div>
            <ProgressBar value={skillProgress} color="bg-purple-600" showPercentage={false} />
          </div>

          {/* Overload Risk Card */}
          <div
            onClick={() => onNavigateTab('current_state')}
            className="md:col-span-3 bg-white border border-[#E5E5DC] rounded-[18px] p-6 light-card-shadow cursor-pointer hover:border-[#FF7A6B]/50 transition group space-y-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-xs text-[#667085]">
              <span className="font-semibold uppercase tracking-wider">OVERLOAD</span>
              <Badge variant={overloadScore?.risk_level === 'Low' ? 'green' : overloadScore?.risk_level === 'Moderate' ? 'amber' : 'red'}>
                {overloadScore?.risk_level || 'Low'}
              </Badge>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-[#171827] font-heading font-mono">
                  {overloadScore?.total_score ?? 20}
                </span>
                <span className="text-xs text-[#667085] font-mono">/ 100</span>
              </div>
              <p className="text-xs text-[#667085] mt-1 font-medium">Capacity load</p>
            </div>
            <ProgressBar
              value={overloadScore?.total_score ?? 20}
              color={overloadScore?.risk_level === 'Low' ? 'bg-[#32C6A6]' : overloadScore?.risk_level === 'Moderate' ? 'bg-[#F5C96A]' : 'bg-[#FF7A6B]'}
              showPercentage={false}
            />
          </div>
        </div>
      </section>

      {/* 05: EDITORIAL "WHAT NEEDS YOUR ATTENTION?" SECTION */}
      <section className="bg-gradient-to-r from-white via-[#FAF9F5] to-[#FFF5F3] border border-[#FF7A6B]/30 rounded-[20px] p-5 light-card-shadow space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#FF7A6B]/15 text-[#D84B3B]">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#D84B3B]">
              WHAT NEEDS YOUR ATTENTION
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('current_state')}
            className="text-xs text-[#D84B3B] hover:underline font-semibold"
          >
            Review →
          </button>
        </div>

        <p className="text-xs text-[#171827] font-medium leading-relaxed">
          {overloadScore && overloadScore.total_score > 60 ? (
            <>
              ⚡ <strong>High workload detected:</strong> You currently have {profile?.major_commitments?.length ?? 0} active commitments with only {profile?.available_hours_per_day ?? 0}h/day buffer and {profile?.sleep_hours ?? 0}h sleep. Consider rebalancing low-value tasks to reduce overload score ({overloadScore.total_score}/100).
            </>
          ) : overloadScore && overloadScore.total_score > 30 ? (
            <>
              ⚡ <strong>Moderate schedule pressure:</strong> Your overload score is {overloadScore.total_score}/100. Managing {profile?.major_commitments?.length ?? 0} active tracks with {profile?.available_hours_per_day ?? 0}h/day focus window.
            </>
          ) : (
            <>
              ✓ <strong>Schedule balanced:</strong> Low overload risk detected ({overloadScore?.total_score ?? 20}/100). You have {profile?.available_hours_per_day ?? 6}h daily focus time and {profile?.sleep_hours ?? 7}h sleep.
            </>
          )}
        </p>
      </section>

      {/* 06: DAILY CHECK-IN HISTORY DRAWER */}
      {checkInSummary && checkInSummary.recent_checkins && checkInSummary.recent_checkins.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#667085]">
            <span className="font-bold uppercase tracking-wider">DAILY CHECK-IN HISTORY</span>
            <span className="text-xs text-[#667085]">Click any date to inspect details</span>
          </div>

          <div className="space-y-2">
            {checkInSummary.recent_checkins.map(c => {
              const isExpanded = expandedHistoryDate === c.date;
              return (
                <div key={c.id || c.date} className="bg-white border border-[#E5E5DC] rounded-xl overflow-hidden light-card-shadow">
                  <div
                    onClick={() => toggleHistoryDate(c.date)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#FAF9F5] transition"
                  >
                    <div className="flex items-center gap-3 text-xs">
                      <Calendar className="w-4 h-4 text-[#635BFF]" />
                      <span className="font-bold text-[#171827] font-mono">{c.date}</span>
                      <span className="text-[#667085]">
                        🌙 {c.sleep_duration}h sleep ({c.sleep_time} - {c.wake_time})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-mono text-[#635BFF] font-bold">
                        ⚡ {c.energy}/10 nrg • 🔥 {c.stress}/10 stress
                      </span>
                      <span className="font-mono text-[#219B81] font-bold">
                        ✅ {c.completed_tasks}/{c.planned_tasks} tasks
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[#667085]" /> : <ChevronDown className="w-4 h-4 text-[#667085]" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 bg-[#FAF9F5] border-t border-[#E5E5DC] space-y-3 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <span className="text-[#667085] block text-[11px]">Work / Study Hours</span>
                          <span className="font-bold text-[#171827] font-mono">{c.work_hours}h work / {c.study_hours}h study</span>
                        </div>
                        <div>
                          <span className="text-[#667085] block text-[11px]">Mood Rating</span>
                          <span className="font-bold text-[#219B81] font-mono">{c.mood} / 10</span>
                        </div>
                        <div>
                          <span className="text-[#667085] block text-[11px]">Exercise Habit</span>
                          <span className="font-bold text-[#171827]">{c.exercise_completed ? '✓ Completed' : 'No'}</span>
                        </div>
                        <div>
                          <span className="text-[#667085] block text-[11px]">Sleep Window</span>
                          <span className="font-bold text-[#635BFF] font-mono">{c.sleep_time} → {c.wake_time}</span>
                        </div>
                      </div>

                      {c.achievement && (
                        <div>
                          <span className="text-[#667085] font-bold text-[11px] block">🏆 Achievement</span>
                          <p className="text-[#171827] font-medium">{c.achievement}</p>
                        </div>
                      )}

                      {c.blocker && (
                        <div>
                          <span className="text-[#667085] font-bold text-[11px] block">🚧 Blocker / Problem</span>
                          <p className="text-[#171827] font-medium">{c.blocker}</p>
                        </div>
                      )}

                      {c.tomorrow_priority && (
                        <div>
                          <span className="text-[#667085] font-bold text-[11px] block">🎯 Priority for Next Day</span>
                          <p className="text-[#635BFF] font-bold">{c.tomorrow_priority}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 07: FUTURE SIMULATOR HERO CTA CARD */}
      <section className="bg-gradient-to-r from-white via-[#FAF9F5] to-[#F0EEFF] rounded-[24px] border border-[#635BFF]/30 p-6 lg:p-8 space-y-4 light-card-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] font-mono flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> EXPLORE WITH ME
            </span>
            <h3 className="text-2xl font-extrabold text-[#171827] font-heading">
              Future Simulator
            </h3>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              Your future isn't one fixed prediction. Compare different choices, change assumptions, and explore how trade-offs adapt to your personal goals.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => onNavigateTab('simulator')}
            icon={<ArrowRight className="w-4 h-4" />}
            className="shrink-0 px-6 py-3"
          >
            Explore futures →
          </Button>
        </div>
      </section>
    </div>
  );
};
