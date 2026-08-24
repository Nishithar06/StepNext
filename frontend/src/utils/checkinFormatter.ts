/**
 * Centralized Check-In Formatting Utility for StepNext AI.
 * Explicitly distinguishes:
 * 1. STATE 1 — NOT PROVIDED (null, undefined, missing) -> "Not logged"
 * 2. STATE 2 — EXPLICITLY NO EXERCISE (false) -> "No exercise"
 * 3. STATE 3 — EXERCISE PROVIDED (true / exercise_summary string) -> "30 min • Running" or "✓ Completed"
 */

import { DailyCheckIn } from '../types/schema';

export interface ExerciseDisplayInfo {
  text: string;
  variant: 'neutral' | 'green' | 'amber';
  isLogged: boolean;
  hasExercise: boolean;
}

export function getExerciseDisplay(checkIn?: Partial<DailyCheckIn> | null): ExerciseDisplayInfo {
  if (!checkIn) {
    return { text: 'No exercise', variant: 'neutral', isLogged: true, hasExercise: false };
  }

  // 1. Check if an explicit exercise summary exists (e.g. "30 min • Running")
  if (checkIn.exercise_summary && checkIn.exercise_summary.trim().length > 0) {
    return {
      text: checkIn.exercise_summary.trim(),
      variant: 'green',
      isLogged: true,
      hasExercise: true
    };
  }

  // 2. Workout completed
  if (checkIn.exercise_completed === true) {
    return {
      text: '✓ Completed',
      variant: 'green',
      isLogged: true,
      hasExercise: true
    };
  }

  // 3. Default to No exercise for false, null, undefined, or missing
  return {
    text: 'No exercise',
    variant: 'neutral',
    isLogged: true,
    hasExercise: false
  };
}
