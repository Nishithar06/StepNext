import React, { useState } from 'react';
import { UserProfile, DerivedProfile, OverloadScore, SimulationResponse, DailyCheckIn, CheckInSummary } from '../types/schema';
import { getExerciseDisplay } from '../utils/checkinFormatter';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
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
  Sparkles,
  Clock,
  Layers
} from 'lucide-react';
import { TabType } from '../components/layout/Sidebar';
import { useStaggerEntrance } from '../hooks/useGsap';
import { GoalRequirementsCard } from '../components/dashboard/GoalRequirementsCard';

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
  const containerRef = useStaggerEntrance('.stagger-card', [profile?.user_id, !!todayCheckIn]);
  const name = profile?.name ? profile.name.split(' ')[0] : 'User';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const topResult = simulationData?.results[0];
  const placementReadiness = topResult ? topResult.overall_score : (profile ? Math.min(95, 60 + (profile.skills?.length || 0) * 5) : 82);
  const skillProgress = topResult ? topResult.skill_growth : (profile ? Math.min(95, 50 + (profile.skills?.length || 0) * 6) : 78);

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
    <div ref={containerRef} className="space-y-8 animate-fade-in">
      {/* 01: HERO SECTION WITH LUMINOUS ORBITAL MOTIF */}
      <section className="stagger-card relative overflow-hidden bg-gradient-to-br from-white via-[#FAFAF7] to-[#EEF2FF] border border-black/[0.07] rounded-[28px] p-6 lg:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.03),0_12px_40px_-10px_rgba(99,102,241,0.08)]">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#5850EC]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          {/* LEFT: Greeting, Title & Goal Pill */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="indigo" dot size="lg" className="font-mono text-xs font-bold">
                Goal: {profile?.career_goal || 'Software & AI Engineer'}
              </Badge>
              <Badge variant="outline" size="sm" className="font-mono text-slate-500">
                {profile?.education || 'Senior Year'}
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] font-heading tracking-tight leading-[1.1]">
              {greeting.toUpperCase()}, {name.toUpperCase()}.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-medium">
              StepNext keeps your goals, bandwidth, and trajectory continuously aligned. Here is your current life baseline:
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="gradient"
                size="default"
                onClick={() => onNavigateTab('simulator')}
                className="gap-2 shadow-md shadow-[#5850EC]/20 hover:shadow-lg"
              >
                <span>Launch Simulator</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={onOpenCheckInModal}
                className="gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-[#5850EC]" />
                <span>Daily Check-in</span>
              </Button>
            </div>
          </div>

          {/* RIGHT: THE LIFE ORBIT VISUAL MOTIF */}
          <div className="md:col-span-5 flex justify-center">
            <LifeOrbit userName={name} userGoal={profile?.career_goal || 'AI Engineer'} />
          </div>
        </div>
      </section>

      {/* 02: TARGET GOAL REQUIREMENTS & 90-DAY MILESTONE TRAJECTORY */}
      <section className="stagger-card">
        <GoalRequirementsCard
          profile={profile}
          onNavigateTab={onNavigateTab}
          onOpenOnboarding={onOpenOnboarding}
        />
      </section>

      {/* 03: PROMINENT DAILY CHECK-IN HERO BANNER */}
      <section className="stagger-card bg-white rounded-[26px] border border-[#5850EC]/30 p-6 lg:p-7 shadow-[0_4px_24px_rgba(99,102,241,0.08)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#5850EC]">
                DAILY TELEMETRY & SYNC
              </span>
              {todayCheckIn && (
                <Badge variant="success" dot size="sm" className="font-mono font-bold">
                  Logged for Today
                </Badge>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] font-heading tracking-tight">
              {todayCheckIn ? "Today's Status Synchronized" : "How did today actually go?"}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              {todayCheckIn
                ? "Your sleep, energy, workload, and reflections are actively calibrating the Overload Matrix and Adaptive Trajectory."
                : "Log today's sleep duration, energy level, completed tasks, and reflections (takes 30 seconds) to keep StepNext synced with reality."}
            </p>
          </div>

          <Button
            variant={todayCheckIn ? "outline" : "default"}
            size="lg"
            onClick={onOpenCheckInModal}
            className="shrink-0 px-6 font-bold shadow-sm"
          >
            {todayCheckIn ? "Edit Today's Check-in" : "Complete Daily Check-in →"}
          </Button>
        </div>

        {/* If Today's Check-in is complete, show telemetry pill summary */}
        {todayCheckIn && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-black/[0.06] text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-black/[0.05]">
              <span className="text-slate-500 block text-[11px] mb-1 font-mono uppercase tracking-wider">🌙 Sleep Window</span>
              <span className="font-bold text-[#0F172A] font-mono text-sm">
                {todayCheckIn.sleep_duration}h ({todayCheckIn.sleep_time} → {todayCheckIn.wake_time})
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-black/[0.05]">
              <span className="text-slate-500 block text-[11px] mb-1 font-mono uppercase tracking-wider">⚡ Energy & Stress</span>
              <span className="font-bold text-[#0F172A] font-mono text-sm">
                {todayCheckIn.energy}/10 nrg • {todayCheckIn.stress}/10 stress
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-black/[0.05]">
              <span className="text-slate-500 block text-[11px] mb-1 font-mono uppercase tracking-wider">✅ Task Execution</span>
              <span className="font-bold text-[#5850EC] font-mono text-sm">
                {todayCheckIn.completed_tasks} / {todayCheckIn.planned_tasks} tasks ({todayCheckIn.planned_tasks > 0 ? Math.round((todayCheckIn.completed_tasks / todayCheckIn.planned_tasks) * 100) : 100}%)
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-black/[0.05]">
              <span className="text-slate-500 block text-[11px] mb-1 font-mono uppercase tracking-wider">🏋️ Physical Habit</span>
              {(() => {
                const exInfo = getExerciseDisplay(todayCheckIn);
                return (
                  <span className={`font-bold font-mono text-sm ${exInfo.hasExercise ? 'text-[#10B981]' : 'text-slate-500'}`}>
                    {exInfo.text}
                  </span>
                );
              })()}
            </div>
          </div>
        )}
      </section>

      {/* 03: WEEKLY TELEMETRY & STREAK SUMMARY */}
      <section className="stagger-card space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold uppercase tracking-[0.16em] text-slate-500">
            THIS WEEK'S TELEMETRY & TRENDS
          </span>
          {hasWeeklyProgress && (
            <Badge variant="indigo" dot size="sm" className="font-mono font-bold">
              🔥 {checkInSummary?.streak_days || 0} DAY STREAK
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card level={2} className="p-5 space-y-2 hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="font-mono font-bold uppercase text-[10px] tracking-wider">SLEEP AVERAGE</span>
              <Moon className="w-4 h-4 text-[#5850EC]" />
            </div>
            <div className="text-3xl font-extrabold text-[#0F172A] font-mono font-heading">
              {hasWeeklyProgress ? `${checkInSummary?.avg_sleep}h` : '--'} {hasWeeklyProgress && <span className="text-xs font-normal text-slate-500">avg</span>}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {hasWeeklyProgress ? 'Target: 7.5 hours / night' : 'Log daily check-in to track sleep'}
            </p>
          </Card>

          <Card level={2} className="p-5 space-y-2.5 flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="font-mono font-bold uppercase text-[10px] tracking-wider">ENERGY & STRESS</span>
              <Activity className="w-4 h-4 text-[#10B981]" />
            </div>

            {hasWeeklyProgress ? (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-black/[0.06]">
                <div className="space-y-0.5 border-r border-black/[0.06] pr-2">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wider">
                    <Zap className="w-3 h-3 text-[#10B981]" /> ENERGY
                  </div>
                  <div className="text-2xl font-extrabold text-[#0F172A] font-mono font-heading">
                    {checkInSummary?.avg_energy ?? checkInSummary?.average_energy ?? '--'}<span className="text-xs font-normal text-slate-500">/10</span>
                  </div>
                </div>

                <div className="space-y-0.5 pl-2">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#F43F5E] inline-block" /> STRESS
                  </div>
                  <div className="text-2xl font-extrabold text-[#0F172A] font-mono font-heading">
                    {checkInSummary?.avg_stress ?? checkInSummary?.average_stress ?? '--'}<span className="text-xs font-normal text-slate-500">/10</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1 py-1">
                <div className="text-2xl font-extrabold text-[#0F172A] font-mono font-heading">
                  --
                </div>
                <p className="text-[11px] text-slate-500">
                  Log daily check-in to track energy
                </p>
              </div>
            )}
          </Card>

          <Card level={2} className="p-5 space-y-2 flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="font-mono font-bold uppercase text-[10px] tracking-wider">TASK VELOCITY</span>
              <CheckCircle2 className={`w-4 h-4 ${hasWeeklyProgress ? 'text-[#10B981]' : 'text-slate-400'}`} />
            </div>
            <div className="text-3xl font-extrabold text-[#0F172A] font-mono font-heading">
              {hasWeeklyProgress ? `${checkInSummary?.task_completion_rate}%` : '--'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {hasWeeklyProgress ? 'Weekly task completion rate' : 'Log daily check-in to track tasks'}
            </p>
          </Card>

          <Card level={2} className="p-5 space-y-2 flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="font-mono font-bold uppercase text-[10px] tracking-wider">CHECK-IN STREAK</span>
              <Flame className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-3xl font-extrabold text-[#0F172A] font-mono font-heading">
              {hasWeeklyProgress ? `${checkInSummary?.streak_days} days` : '0 days'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {hasWeeklyProgress ? `${checkInSummary?.total_checkins} total check-ins logged` : 'Start your streak today'}
            </p>
          </Card>
        </div>
      </section>

      {/* 04: ASYMMETRIC SNAPSHOT GRID */}
      <section className="stagger-card space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono font-bold uppercase tracking-[0.16em]">YOUR STRATEGIC SNAPSHOT</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Large Placement Readiness Card */}
          <div
            onClick={() => onNavigateTab('simulator')}
            className="md:col-span-6 bg-white border border-black/[0.07] rounded-[24px] p-6 shadow-sm hover:border-[#5850EC]/50 hover:shadow-[0_12px_36px_rgba(99,102,241,0.08)] cursor-pointer transition-all duration-300 group space-y-4"
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono font-bold uppercase tracking-wider text-[10px]">CAREER READINESS</span>
              <span className="text-xs text-[#10B981] font-mono font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Dynamic trajectory
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <div className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] font-heading font-mono">
                {placementReadiness}%
              </div>
              <span className="text-xs text-slate-400 font-mono">alignment index</span>
            </div>

            <div className="w-full h-16 pt-2">
              <svg className="w-full h-full text-[#5850EC]" viewBox="0 0 300 60" fill="none">
                <path
                  d="M0 50 C50 40, 100 45, 150 25 C200 5, 250 20, 300 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="300" cy="10" r="5" fill="#5850EC" />
              </svg>
            </div>
          </div>

          {/* Skill Progress Card */}
          <div
            onClick={() => onNavigateTab('digital_twin')}
            className="md:col-span-3 bg-white border border-black/[0.07] rounded-[24px] p-6 shadow-sm hover:border-purple-300 hover:shadow-[0_12px_36px_rgba(168,85,247,0.08)] cursor-pointer transition-all duration-300 group space-y-4 flex flex-col justify-between"
          >
            <div className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider text-[10px]">
              SKILLS MASTERY
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#0F172A] font-heading font-mono">
                {skillProgress}%
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">{profile?.skills?.length || 0} active skills logged</p>
            </div>
            <Progress value={skillProgress} size="default" indicatorColor="bg-gradient-to-r from-purple-500 to-indigo-600" />
          </div>

          {/* Overload Risk Card */}
          <div
            onClick={() => onNavigateTab('current_state')}
            className="md:col-span-3 bg-white border border-black/[0.07] rounded-[24px] p-6 shadow-sm hover:border-[#F43F5E]/40 hover:shadow-[0_12px_36px_rgba(244,63,94,0.08)] cursor-pointer transition-all duration-300 group space-y-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono font-bold uppercase tracking-wider text-[10px]">OVERLOAD RISK</span>
              <Badge variant={overloadScore?.risk_level === 'Low' ? 'success' : overloadScore?.risk_level === 'Moderate' ? 'warning' : 'destructive'} size="sm">
                {overloadScore?.risk_level || 'Low'}
              </Badge>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-[#0F172A] font-heading font-mono">
                  {overloadScore?.total_score ?? 20}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">Burnout strain score</p>
            </div>
            <Progress
              value={overloadScore?.total_score ?? 20}
              size="default"
              indicatorColor={overloadScore?.risk_level === 'Low' ? 'bg-[#10B981]' : overloadScore?.risk_level === 'Moderate' ? 'bg-[#F59E0B]' : 'bg-[#F43F5E]'}
            />
          </div>
        </div>
      </section>

      {/* 05: EDITORIAL "WHAT NEEDS YOUR ATTENTION?" SECTION */}
      <section className="stagger-card bg-gradient-to-r from-white via-[#FAFAF7] to-[#FFF1F2] border border-[#F43F5E]/30 rounded-[24px] p-6 shadow-[0_4px_24px_rgba(244,63,94,0.06)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#F43F5E]/10 text-[#F43F5E]">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-[#F43F5E]">
              WHAT DESERVES YOUR ATTENTION
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('current_state')}
            className="text-xs text-[#F43F5E] hover:underline font-bold font-mono"
          >
            Review Matrix →
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[#0F172A] font-medium leading-relaxed">
          {overloadScore && overloadScore.total_score > 60 ? (
            <>
              ⚡ <strong>High workload strain detected:</strong> You have {profile?.major_commitments?.length ?? 0} active commitments with only {profile?.available_hours_per_day ?? 0}h/day buffer and {profile?.sleep_hours ?? 0}h sleep. Consider rebalancing low-value tasks to reduce overload score ({overloadScore.total_score}/100).
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
        <section className="stagger-card space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono font-bold uppercase tracking-[0.16em]">DAILY CHECK-IN LOG</span>
            <span className="text-xs text-slate-400 font-mono">Click to inspect entry</span>
          </div>

          <div className="space-y-2.5">
            {checkInSummary.recent_checkins.map(c => {
              const isExpanded = expandedHistoryDate === c.date;
              return (
                <div key={c.id || c.date} className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
                  <div
                    onClick={() => toggleHistoryDate(c.date)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition"
                  >
                    <div className="flex items-center gap-3 text-xs">
                      <Calendar className="w-4 h-4 text-[#5850EC]" />
                      <span className="font-bold text-[#0F172A] font-mono">{c.date}</span>
                      <span className="text-slate-500 hidden sm:inline-block">
                        🌙 {c.sleep_duration}h sleep ({c.sleep_time} → {c.wake_time})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-mono text-[#5850EC] font-bold">
                        ⚡ {c.energy}/10 nrg
                      </span>
                      <span className="font-mono text-[#10B981] font-bold">
                        ✅ {c.completed_tasks}/{c.planned_tasks} tasks
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 bg-slate-50/90 border-t border-black/[0.06] space-y-3 text-xs animate-in fade-in duration-200">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-2.5 rounded-xl bg-white border border-black/[0.05]">
                          <span className="text-slate-500 block text-[10px] font-mono uppercase">Work / Study</span>
                          <span className="font-bold text-[#0F172A] font-mono">{c.work_hours}h work / {c.study_hours}h study</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-black/[0.05]">
                          <span className="text-slate-500 block text-[10px] font-mono uppercase">Mood Rating</span>
                          <span className="font-bold text-[#10B981] font-mono">{c.mood} / 10</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-black/[0.05]">
                          <span className="text-slate-500 block text-[10px] font-mono uppercase">Physical Habit</span>
                          <span className="font-bold text-[#0F172A]">{c.exercise_completed ? '✓ Completed' : 'No workout'}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-black/[0.05]">
                          <span className="text-slate-500 block text-[10px] font-mono uppercase">Sleep Time</span>
                          <span className="font-bold text-[#5850EC] font-mono">{c.sleep_time} → {c.wake_time}</span>
                        </div>
                      </div>

                      {c.achievement && (
                        <div className="p-3 rounded-xl bg-white border border-black/[0.05]">
                          <span className="text-slate-500 font-mono font-bold text-[10px] uppercase block mb-1">🏆 Achievement</span>
                          <p className="text-[#0F172A] font-medium">{c.achievement}</p>
                        </div>
                      )}

                      {c.blocker && (
                        <div className="p-3 rounded-xl bg-white border border-black/[0.05]">
                          <span className="text-slate-500 font-mono font-bold text-[10px] uppercase block mb-1">🚧 Blocker / Problem</span>
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
        </section>
      )}

      {/* 07: FUTURE SIMULATOR HERO CTA CARD */}
      <section className="stagger-card bg-gradient-to-br from-white via-[#FAFAF7] to-[#EEF2FF] rounded-[28px] border border-[#5850EC]/30 p-6 lg:p-8 space-y-4 shadow-[0_4px_24px_rgba(99,102,241,0.08)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#5850EC] flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> DECISION INTELLIGENCE
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading tracking-tight">
              Future Simulator
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Your future isn't one fixed prediction. Compare different career choices, test time trade-offs, and explore how workload affects long-term readiness.
            </p>
          </div>

          <Button
            variant="gradient"
            size="lg"
            onClick={() => onNavigateTab('simulator')}
            className="shrink-0 px-6 font-bold gap-2 shadow-md"
          >
            <span>Explore Trajectories</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};
