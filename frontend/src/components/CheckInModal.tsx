import React, { useState, useEffect } from 'react';
import { DailyCheckIn, DailyCheckInInput, ActionRoadmap, WeeklyCheckInResult } from '../types/schema';
import { fetchRoadmap, submitWeeklyCheckIn, fetchWeeklyCheckInHistory } from '../api/client';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, AlertCircle, Calendar, Sparkles, Target, Clock, Zap } from 'lucide-react';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayCheckIn: DailyCheckIn | null;
  onSaveCheckIn: (input: DailyCheckInInput) => Promise<void>;
}

export const calculateSleepDurationFrontend = (sleepTime: string, wakeTime: string): { duration: number; text: string } => {
  try {
    if (!sleepTime || !wakeTime) return { duration: 7.0, text: '7h 0m' };
    
    const [sh, sm] = sleepTime.split(':').map(Number);
    const [wh, wm] = wakeTime.split(':').map(Number);

    const sleepMins = sh * 60 + sm;
    const wakeMins = wh * 60 + wm;

    let totalMins = 0;
    if (wakeMins < sleepMins) {
      totalMins = (1440 - sleepMins) + wakeMins;
    } else {
      totalMins = wakeMins - sleepMins;
    }

    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const decimalHours = Math.round((totalMins / 60.0) * 10) / 10;

    return {
      duration: decimalHours,
      text: mins > 0 ? `${hours}h ${mins}m` : `${hours}h 0m`
    };
  } catch (e) {
    return { duration: 7.0, text: '7h 0m' };
  }
};

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  todayCheckIn,
  onSaveCheckIn
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [sleepTime, setSleepTime] = useState(todayCheckIn?.sleep_time || '23:00');
  const [wakeTime, setWakeTime] = useState(todayCheckIn?.wake_time || '07:00');
  
  const [energy, setEnergy] = useState(todayCheckIn?.energy ?? 7);
  const [stress, setStress] = useState(todayCheckIn?.stress ?? 5);
  const [mood, setMood] = useState(todayCheckIn?.mood ?? 7);

  const [plannedTasks, setPlannedTasks] = useState(todayCheckIn?.planned_tasks ?? 5);
  const [completedTasks, setCompletedTasks] = useState(todayCheckIn?.completed_tasks ?? 4);
  const [workHours, setWorkHours] = useState(todayCheckIn?.work_hours ?? 6.0);
  const [studyHours, setStudyHours] = useState(todayCheckIn?.study_hours ?? 2.0);

  const [exerciseCompleted, setExerciseCompleted] = useState<boolean>(
    todayCheckIn?.exercise_completed ?? false
  );
  const [exerciseSummary, setExerciseSummary] = useState<string>(todayCheckIn?.exercise_summary || '');
  
  const [achievement, setAchievement] = useState(todayCheckIn?.achievement || '');
  const [blocker, setBlocker] = useState(todayCheckIn?.blocker || '');
  const [tomorrowPriority, setTomorrowPriority] = useState(todayCheckIn?.tomorrow_priority || '');

  // Roadmap & Weekly Integration State
  const [roadmap, setRoadmap] = useState<ActionRoadmap | null>(null);
  const [actionStatuses, setActionStatuses] = useState<Record<string, string>>({});
  const [completionLevel, setCompletionLevel] = useState<string>('Most');
  const [workloadFeeling, setWorkloadFeeling] = useState<string>('Manageable');
  const [selectedBlocker, setSelectedBlocker] = useState<string>('None');
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyCheckInResult[]>([]);
  const [submittedResult, setSubmittedResult] = useState<WeeklyCheckInResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      const activeUid = localStorage.getItem('stepnext_active_user_id') || todayCheckIn?.user_id || '';
      if (!activeUid) return;
      
      fetchRoadmap(activeUid)
        .then(rm => {
          if (rm) {
            setRoadmap(rm);
            const initStatuses: Record<string, string> = {};
            rm.weekly_actions.forEach(a => {
              initStatuses[a.id] = a.status || 'not_started';
            });
            setActionStatuses(initStatuses);
          } else {
            setRoadmap(null);
          }
        })
        .catch(err => console.warn('[CheckIn] Roadmap notice:', err));

      fetchWeeklyCheckInHistory(activeUid)
        .then(hist => setWeeklyHistory(hist || []))
        .catch(err => console.warn('[CheckIn] History notice:', err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (todayCheckIn) {
        setSleepTime(todayCheckIn.sleep_time || '23:00');
        setWakeTime(todayCheckIn.wake_time || '07:00');
        setEnergy(todayCheckIn.energy ?? 7);
        setStress(todayCheckIn.stress ?? 5);
        setMood(todayCheckIn.mood ?? 7);
        setPlannedTasks(todayCheckIn.planned_tasks ?? 5);
        setCompletedTasks(todayCheckIn.completed_tasks ?? 4);
        setWorkHours(todayCheckIn.work_hours ?? 6.0);
        setStudyHours(todayCheckIn.study_hours ?? 2.0);
        setExerciseCompleted(todayCheckIn.exercise_completed ?? false);
        setExerciseSummary(todayCheckIn.exercise_summary || '');
        setAchievement(todayCheckIn.achievement || '');
        setBlocker(todayCheckIn.blocker || '');
        setTomorrowPriority(todayCheckIn.tomorrow_priority || '');
      } else {
        setExerciseCompleted(false);
        setExerciseSummary('');
      }
    }
  }, [isOpen, todayCheckIn]);

  if (!isOpen) return null;

  const { duration: calculatedSleepHours, text: calculatedSleepText } = calculateSleepDurationFrontend(sleepTime, wakeTime);

  const totalRoadmapActions = roadmap?.weekly_actions.length || 0;
  const completedRoadmapActions = Object.values(actionStatuses).filter(st => st === 'completed').length;
  const liveProgressPct = totalRoadmapActions > 0 ? Math.round((completedRoadmapActions / totalRoadmapActions) * 100) : 0;

  const handleActionStatusChange = (actionId: string, status: string) => {
    setActionStatuses(prev => ({
      ...prev,
      [actionId]: status
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const activeUid = localStorage.getItem('stepnext_active_user_id') || todayCheckIn?.user_id || '';
    if (!activeUid) {
      setError('User identity not found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const payload: DailyCheckInInput = {
        sleep_time: sleepTime,
        wake_time: wakeTime,
        sleep_duration: calculatedSleepHours,
        energy: Number(energy),
        stress: Number(stress),
        mood: Number(mood),
        planned_tasks: Number(plannedTasks),
        completed_tasks: Number(completedTasks),
        work_hours: Number(workHours),
        study_hours: Number(studyHours),
        exercise_completed: exerciseCompleted,
        exercise_summary: exerciseCompleted ? (exerciseSummary.trim() || null) : null,
        achievement: achievement.trim(),
        blocker: blocker.trim() || selectedBlocker,
        tomorrow_priority: tomorrowPriority.trim()
      };

      await onSaveCheckIn(payload);

      if (roadmap) {
        const weeklyRes = await submitWeeklyCheckIn({
          user_id: activeUid,
          roadmap_id: roadmap.id,
          action_statuses: actionStatuses,
          completion_level: completionLevel,
          workload_feeling: workloadFeeling,
          blocker: selectedBlocker !== 'None' ? selectedBlocker : blocker.trim()
        }, activeUid);

        setSubmittedResult(weeklyRes);
        setWeeklyHistory(prev => {
          const filtered = prev.filter(r => r.id !== weeklyRes.id);
          return [weeklyRes, ...filtered];
        });
      }

      setLoading(false);
      if (!roadmap) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit check-in");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
      <div className="bg-white border border-black/[0.08] rounded-[28px] w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.06] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5850EC]/10 text-[#5850EC] flex items-center justify-center text-xl font-bold">
              🌱
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0F172A] font-heading flex items-center gap-2">
                {todayCheckIn ? "Edit Today's Check-in" : "Weekly Execution & Daily Check-in"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Calibrate roadmap velocity, sleep window, and energy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 bg-white text-[#0F172A]">
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#FFF1F2] border border-[#F43F5E]/30 text-xs text-[#F43F5E] flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* POST-SUBMISSION PROGRESS SUMMARY */}
          {submittedResult && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#5850EC]/10 to-[#10B981]/10 border border-[#5850EC]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#5850EC]">
                  ✦ WEEKLY PROGRESS SUMMARY
                </span>
                <Badge variant="success" size="default">
                  {submittedResult.completion_percentage}% Completed
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-black/[0.05]">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Completed</span>
                  <span className="font-bold text-[#10B981] font-mono text-sm">{submittedResult.completed_actions_count}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-black/[0.05]">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Workload</span>
                  <span className="font-bold text-[#5850EC] font-mono text-sm">{submittedResult.workload_feeling}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-black/[0.05]">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Level</span>
                  <span className="font-bold text-[#F59E0B] font-mono text-sm">{submittedResult.completion_level}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#5850EC]/20 text-xs text-[#0F172A] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#5850EC] shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">
                  <strong>Workload Guidance:</strong> {submittedResult.guidance_message}
                </p>
              </div>
            </div>
          )}

          {/* ROADMAP INTEGRATION FOCUS */}
          {roadmap && (
            <div className="p-5 rounded-2xl bg-[#EEF2FF] border border-[#5850EC]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5850EC] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> ACTIVE ROADMAP TRACK
                </span>
                <Badge variant="indigo" size="sm">
                  {roadmap.scenario}
                </Badge>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#0F172A]">Execution Progress</span>
                  <span className="font-mono font-bold text-[#5850EC]">{completedRoadmapActions} / {totalRoadmapActions} actions ({liveProgressPct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#5850EC] to-[#6366F1] transition-all duration-300 rounded-full" style={{ width: `${liveProgressPct}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* ROADMAP ACTIONS REVIEW */}
          {roadmap && roadmap.weekly_actions.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-black/[0.06]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-slate-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#10B981]" /> WEEKLY ROADMAP ACTIONS
              </h4>

              <div className="space-y-2.5">
                {roadmap.weekly_actions.map(act => {
                  const currentSt = actionStatuses[act.id] || 'not_started';

                  return (
                    <div key={act.id} className="p-3.5 rounded-2xl bg-slate-50 border border-black/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[#0F172A]">{act.title}</span>
                        <p className="text-[11px] text-slate-500">{act.target} ({act.category})</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleActionStatusChange(act.id, 'completed')}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono transition-all ${
                            currentSt === 'completed'
                              ? 'bg-[#10B981] text-white shadow-sm'
                              : 'bg-white border border-black/[0.08] text-slate-600 hover:border-[#10B981]'
                          }`}
                        >
                          ✓ Done
                        </button>
                        <button
                          type="button"
                          onClick={() => handleActionStatusChange(act.id, 'in_progress')}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono transition-all ${
                            currentSt === 'in_progress'
                              ? 'bg-[#F59E0B] text-white shadow-sm'
                              : 'bg-white border border-black/[0.08] text-slate-600 hover:border-[#F59E0B]'
                          }`}
                        >
                          In Progress
                        </button>
                        <button
                          type="button"
                          onClick={() => handleActionStatusChange(act.id, 'not_started')}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono transition-all ${
                            currentSt === 'not_started'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-white border border-black/[0.08] text-slate-600'
                          }`}
                        >
                          Not Started
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* WEEKLY REFLECTION */}
          <div className="space-y-4 pt-2 border-t border-black/[0.06]">
            <h4 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#5850EC]" /> WEEKLY EXECUTION REFLECTION
            </h4>

            {/* Completion level */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#0F172A]">
                1. How much of your planned work did you complete?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Almost none', 'Some', 'Most', 'All'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setCompletionLevel(lvl)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      completionLevel === lvl
                        ? 'bg-[#5850EC] text-white shadow-md'
                        : 'bg-slate-50 border border-black/[0.06] text-slate-600 hover:border-[#5850EC]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Workload feeling */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#0F172A]">
                2. How did the workload feel?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Easy', 'Manageable', 'Heavy', 'Overwhelming'].map(wf => (
                  <button
                    key={wf}
                    type="button"
                    onClick={() => setWorkloadFeeling(wf)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      workloadFeeling === wf
                        ? wf === 'Overwhelming'
                          ? 'bg-[#F43F5E] text-white shadow-md'
                          : 'bg-[#10B981] text-white shadow-md'
                        : 'bg-slate-50 border border-black/[0.06] text-slate-600 hover:border-[#10B981]'
                    }`}
                  >
                    {wf}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Blocker */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#0F172A]">
                3. What was your biggest friction or blocker?
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {['Time', 'Motivation', 'Difficulty', 'Unexpected work', 'None'].map(blk => (
                  <button
                    key={blk}
                    type="button"
                    onClick={() => setSelectedBlocker(blk)}
                    className={`py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                      selectedBlocker === blk
                        ? 'bg-[#0F172A] text-white shadow-md'
                        : 'bg-slate-50 border border-black/[0.06] text-slate-600 hover:border-[#0F172A]'
                    }`}
                  >
                    {blk}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DAILY TELEMETRY INPUTS */}
          <div className="space-y-4 pt-2 border-t border-black/[0.06]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-slate-500">
                DAILY TELEMETRY (SLEEP & ENERGY)
              </h4>
              <span className="text-xs font-mono font-bold text-[#5850EC] bg-[#5850EC]/10 px-2 py-0.5 rounded-md">
                🌙 {calculatedSleepText} sleep
              </span>
            </div>

            {/* Sleep Schedule */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Bedtime</label>
                <input
                  type="time"
                  value={sleepTime}
                  onChange={e => setSleepTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-black/[0.08] text-[#0F172A] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#5850EC]/30"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Wake Time</label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={e => setWakeTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-black/[0.08] text-[#0F172A] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#5850EC]/30"
                />
              </div>
            </div>

            {/* Ratings Sliders */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-black/[0.04] space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Energy</span>
                  <span className="font-mono text-[#5850EC]">{energy}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={e => setEnergy(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-black/[0.04] space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Stress</span>
                  <span className="font-mono text-[#F43F5E]">{stress}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stress}
                  onChange={e => setStress(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-black/[0.04] space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Mood</span>
                  <span className="font-mono text-[#10B981]">{mood}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mood}
                  onChange={e => setMood(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>

            {/* EXERCISE & HABITS */}
            <div className="space-y-2 pt-2 border-t border-black/[0.06]">
              <label className="block text-[11px] font-bold text-slate-600">
                🏋️ PHYSICAL HABIT / WORKOUT
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExerciseCompleted(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition border ${
                    !exerciseCompleted
                      ? 'bg-[#FFF1F2] border-[#F43F5E] text-[#F43F5E] shadow-sm'
                      : 'bg-slate-50 border-black/[0.06] text-slate-600 hover:border-black/[0.2]'
                  }`}
                >
                  No Workout Today
                </button>
                <button
                  type="button"
                  onClick={() => setExerciseCompleted(true)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition border ${
                    exerciseCompleted
                      ? 'bg-[#ECFDF5] border-[#10B981] text-[#10B981] shadow-sm'
                      : 'bg-slate-50 border-black/[0.06] text-slate-600 hover:border-black/[0.2]'
                  }`}
                >
                  ✓ Workout Completed
                </button>
              </div>

              {exerciseCompleted && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <input
                    type="text"
                    placeholder="e.g. 30 min • Running, 45 min • Gym workout"
                    value={exerciseSummary}
                    onChange={e => setExerciseSummary(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-black/[0.08] text-[#0F172A] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#10B981]/30"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.06]">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              {submittedResult ? "Close" : "Cancel"}
            </Button>
            <Button variant="default" size="sm" type="submit" disabled={loading} className="font-bold shadow-md">
              {loading ? "Submitting..." : submittedResult ? "Update Progress" : todayCheckIn ? "Update Check-in" : "Submit Weekly Check-in"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
