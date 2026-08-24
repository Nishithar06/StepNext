import React, { useState, useEffect } from 'react';
import { DailyCheckIn, DailyCheckInInput, ActionRoadmap, WeeklyCheckInResult } from '../types/schema';
import { fetchRoadmap, submitWeeklyCheckIn, fetchWeeklyCheckInHistory } from '../api/client';
import { Button } from './common/Button';
import { Badge } from './common/Badge';
import { X, CheckCircle2, AlertCircle, Calendar, Sparkles, Target, Clock, ShieldAlert, Award } from 'lucide-react';

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
      const activeUid = localStorage.getItem('stepnext_active_user_id') || 'demo_user';
      
      // Load active roadmap for CheckIn
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

      // Load weekly checkin history
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

  const { duration: calculatedSleepHours } = calculateSleepDurationFrontend(sleepTime, wakeTime);

  // Live calculation of roadmap progress inside Check-in
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

    const activeUid = localStorage.getItem('stepnext_active_user_id') || 'demo_user';

    try {
      // 1. Submit standard daily check-in
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

      // 2. Submit weekly roadmap progress check-in if roadmap exists
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-[#E5E5DC] rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] light-card-shadow">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5DC] bg-white">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🌱</span>
            <div>
              <h3 className="text-base font-bold text-[#171827] font-heading flex items-center gap-2">
                {todayCheckIn ? "Edit Today's Check-in" : "Weekly Execution & Daily Check-in"}
              </h3>
              <p className="text-xs text-[#667085]">Report roadmap progress, sleep duration, and workload feedback</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#667085] hover:text-[#171827] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 bg-white text-[#171827]">
          {error && (
            <div className="p-3 rounded-xl bg-[#FF7A6B]/10 border border-[#FF7A6B]/30 text-xs text-[#D84B3B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* POST-SUBMISSION PROGRESS SUMMARY & GUIDANCE */}
          {submittedResult && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#635BFF]/10 to-[#32C6A6]/10 border-2 border-[#635BFF] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase font-mono text-[#635BFF]">
                  ✦ WEEKLY PROGRESS SUMMARY
                </span>
                <Badge variant="green" className="font-mono">
                  {submittedResult.completion_percentage}% Completed
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-white border border-[#E5E5DC]">
                  <span className="text-[10px] text-[#667085] uppercase block">Completed</span>
                  <span className="font-bold text-[#32C6A6] font-mono">{submittedResult.completed_actions_count}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#E5E5DC]">
                  <span className="text-[10px] text-[#667085] uppercase block">Workload</span>
                  <span className="font-bold text-[#635BFF] font-mono">{submittedResult.workload_feeling}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#E5E5DC]">
                  <span className="text-[10px] text-[#667085] uppercase block">Level</span>
                  <span className="font-bold text-[#F5C96A] font-mono">{submittedResult.completion_level}</span>
                </div>
              </div>

              {/* Workload Intelligence Guidance */}
              <div className="p-3 rounded-xl bg-white border border-[#635BFF]/20 text-xs text-[#171827] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#635BFF] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Workload Intelligence:</strong> {submittedResult.guidance_message}
                </p>
              </div>
            </div>
          )}

          {/* STEP 1: YOUR CURRENT FOCUS (ROADMAP INTEGRATION) */}
          {roadmap && (
            <div className="p-4 rounded-2xl bg-[#635BFF]/5 border border-[#635BFF]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] font-mono flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> YOUR CURRENT FOCUS
                </span>
                <Badge variant="indigo" className="font-mono text-[10px]">
                  Target: {roadmap.scenario.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#171827]">Roadmap Execution Progress</span>
                  <span className="font-mono font-bold text-[#635BFF]">{completedRoadmapActions} / {totalRoadmapActions} actions ({liveProgressPct}%)</span>
                </div>
                <div className="w-full h-2 bg-[#E5E5DC] rounded-full overflow-hidden">
                  <div className="h-full bg-[#635BFF] transition-all duration-300 rounded-full" style={{ width: `${liveProgressPct}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: HOW DID THIS WEEK GO? (ROADMAP ACTION REVIEW) */}
          {roadmap && roadmap.weekly_actions.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#E5E5DC]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#32C6A6]" /> HOW DID THIS WEEK GO? (ROADMAP ACTIONS)
              </h4>

              <div className="space-y-2.5">
                {roadmap.weekly_actions.map(act => {
                  const currentSt = actionStatuses[act.id] || 'not_started';

                  return (
                    <div key={act.id} className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[#171827]">{act.title}</span>
                        <p className="text-[11px] text-[#667085]">{act.target} ({act.category})</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleActionStatusChange(act.id, 'completed')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all ${
                            currentSt === 'completed'
                              ? 'bg-[#32C6A6] text-white shadow-sm'
                              : 'bg-white border border-[#E5E5DC] text-[#667085] hover:border-[#32C6A6]'
                          }`}
                        >
                          ✓ Completed
                        </button>
                        <button
                          type="button"
                          onClick={() => handleActionStatusChange(act.id, 'in_progress')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all ${
                            currentSt === 'in_progress'
                              ? 'bg-[#F5C96A] text-[#171827] shadow-sm'
                              : 'bg-white border border-[#E5E5DC] text-[#667085] hover:border-[#F5C96A]'
                          }`}
                        >
                          In Progress
                        </button>
                        <button
                          type="button"
                          onClick={() => handleActionStatusChange(act.id, 'not_started')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all ${
                            currentSt === 'not_started'
                              ? 'bg-[#E5E5DC] text-[#171827]'
                              : 'bg-white border border-[#E5E5DC] text-[#667085]'
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

          {/* STEP 4: WEEKLY REFLECTION INPUTS */}
          <div className="space-y-4 pt-2 border-t border-[#E5E5DC]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#635BFF]" /> WEEKLY EXECUTION REFLECTION
            </h4>

            {/* 1. Completion level */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#171827]">
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
                        ? 'bg-[#635BFF] text-white shadow-md'
                        : 'bg-[#FAF9F5] border border-[#E5E5DC] text-[#667085] hover:border-[#635BFF]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Workload feeling */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#171827]">
                2. How difficult did the workload feel?
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
                          ? 'bg-[#FF7A6B] text-white shadow-md'
                          : 'bg-[#32C6A6] text-white shadow-md'
                        : 'bg-[#FAF9F5] border border-[#E5E5DC] text-[#667085] hover:border-[#32C6A6]'
                    }`}
                  >
                    {wf}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Primary Blocker */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#171827]">
                3. What blocked you most this week?
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {['Time', 'Motivation', 'Difficulty', 'Unexpected work', 'Other'].map(blk => (
                  <button
                    key={blk}
                    type="button"
                    onClick={() => setSelectedBlocker(blk)}
                    className={`py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                      selectedBlocker === blk
                        ? 'bg-[#171827] text-white shadow-md'
                        : 'bg-[#FAF9F5] border border-[#E5E5DC] text-[#667085] hover:border-[#171827]'
                    }`}
                  >
                    {blk}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STANDARD DAILY TELEMETRY INPUTS */}
          <div className="space-y-4 pt-2 border-t border-[#E5E5DC]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              DAILY TELEMETRY (SLEEP & ENERGY)
            </h4>

            {/* Sleep Schedule */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#667085] mb-1">Bedtime</label>
                <input
                  type="time"
                  value={sleepTime}
                  onChange={e => setSleepTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] text-[#171827] text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#667085] mb-1">Wake Time</label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={e => setWakeTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] text-[#171827] text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Ratings Sliders */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#667085] mb-1">Energy ({energy}/10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={e => setEnergy(Number(e.target.value))}
                  className="w-full cursor-pointer accent-[#635BFF]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#667085] mb-1">Stress ({stress}/10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stress}
                  onChange={e => setStress(Number(e.target.value))}
                  className="w-full cursor-pointer accent-[#FF7A6B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#667085] mb-1">Mood ({mood}/10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mood}
                  onChange={e => setMood(Number(e.target.value))}
                  className="w-full cursor-pointer accent-[#32C6A6]"
                />
              </div>
            </div>

            {/* EXERCISE & HABITS SELECTOR */}
            <div className="space-y-2 pt-2 border-t border-[#E5E5DC]">
              <label className="block text-[11px] font-bold text-[#667085]">
                🏋️ EXERCISE & HABITS
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExerciseCompleted(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition border ${
                    !exerciseCompleted
                      ? 'bg-[#FF7A6B]/15 border-[#FF7A6B] text-[#D84B3B] shadow-sm'
                      : 'bg-[#FAF9F5] border-[#E5E5DC] text-[#667085] hover:border-[#171827]'
                  }`}
                >
                  No Exercise
                </button>
                <button
                  type="button"
                  onClick={() => setExerciseCompleted(true)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition border ${
                    exerciseCompleted
                      ? 'bg-[#32C6A6]/15 border-[#32C6A6] text-[#219B81] shadow-sm'
                      : 'bg-[#FAF9F5] border-[#E5E5DC] text-[#667085] hover:border-[#171827]'
                  }`}
                >
                  Exercise Completed
                </button>
              </div>

              {exerciseCompleted && (
                <div className="pt-2 animate-fade-in">
                  <input
                    type="text"
                    placeholder="e.g. 30 min • Running, 45 min • Gym"
                    value={exerciseSummary}
                    onChange={e => setExerciseSummary(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] text-[#171827] text-xs font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          {/* STEP 10: PREVIOUS CHECK-INS HISTORY */}
          {(() => {
            const uniqueHistory = Array.from(
              new Map(weeklyHistory.map(item => [item.id, item])).values()
            );
            if (uniqueHistory.length === 0) return null;

            return (
              <div className="space-y-3 pt-2 border-t border-[#E5E5DC]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#635BFF]" /> PREVIOUS CHECK-INS HISTORY
                </h4>

                <div className="space-y-2 text-xs">
                  {uniqueHistory.slice(0, 3).map((item, idx) => (
                    <div key={item.id || idx} className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold text-[#635BFF]">Week 0{uniqueHistory.length - idx}</span>
                        <p className="text-[11px] text-[#667085]">{item.completion_percentage}% completed ({item.completed_actions_count}/{item.total_actions_count} actions)</p>
                      </div>
                      <Badge variant="indigo" className="font-mono text-[10px]">
                        Workload: {item.workload_feeling}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E5DC]">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              {submittedResult ? "Close" : "Cancel"}
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={loading}>
              {submittedResult ? "Update Progress" : todayCheckIn ? "Update Check-in" : "Submit Weekly Check-in"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
