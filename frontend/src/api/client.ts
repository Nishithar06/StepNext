import {
  UserProfile,
  DerivedProfile,
  OverloadScore,
  ScenarioInput,
  SimulationResponse,
  HealthResponse,
  DailyCheckInInput,
  DailyCheckIn,
  CheckInSummary,
  ActionRoadmap,
  WeeklyCheckInSubmission,
  WeeklyCheckInResult,
  ProgressSummary,
  AdaptiveFutureFeedback
} from '../types/schema';

import { supabase } from '../lib/supabaseClient';

const getApiBase = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim();
  if (!envUrl) {
    return '/api';
  }
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const API_BASE = getApiBase();

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch (err) {
    console.warn('[ApiClient] Auth header resolution notice:', err);
  }
  return headers;
}

async function authFetch(input: string, init?: RequestInit): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  const mergedInit: RequestInit = {
    ...init,
    headers: {
      ...authHeaders,
      ...(init?.headers || {})
    }
  };
  return fetch(input, mergedInit);
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error [${response.status}]: ${errorText || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchPing(): Promise<{ message: string; status: string }> {
  const res = await authFetch(`${API_BASE}/ping`);
  return handleResponse<{ message: string; status: string }>(res);
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await authFetch(`${API_BASE}/health/db`);
  return handleResponse<HealthResponse>(res);
}

export async function fetchProfile(userId: string): Promise<UserProfile> {
  const res = await authFetch(`${API_BASE}/profile/${userId}`);
  return handleResponse<UserProfile>(res);
}

export async function saveProfile(profile: UserProfile): Promise<UserProfile> {
  const res = await authFetch(`${API_BASE}/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  return handleResponse<UserProfile>(res);
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const res = await authFetch(`${API_BASE}/profile/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return handleResponse<UserProfile>(res);
}

export async function fetchDigitalTwin(userId: string): Promise<DerivedProfile> {
  const res = await authFetch(`${API_BASE}/digital-twin/${userId}`);
  return handleResponse<DerivedProfile>(res);
}

export async function generateDigitalTwin(userId: string): Promise<DerivedProfile> {
  const res = await authFetch(`${API_BASE}/digital-twin/${userId}`, {
    method: 'POST'
  });
  return handleResponse<DerivedProfile>(res);
}

export async function fetchOverloadScore(userId: string): Promise<OverloadScore> {
  const res = await authFetch(`${API_BASE}/overload-score/${userId}`);
  return handleResponse<OverloadScore>(res);
}

export async function recalculateOverloadScore(userId: string): Promise<OverloadScore> {
  const res = await authFetch(`${API_BASE}/overload-score/${userId}`, {
    method: 'POST'
  });
  return handleResponse<OverloadScore>(res);
}

export async function runSimulation(userId: string, scenarios: ScenarioInput[], selectedScenario?: string): Promise<SimulationResponse> {
  const res = await authFetch(`${API_BASE}/simulate/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarios, selected_scenario: selectedScenario })
  });
  return handleResponse<SimulationResponse>(res);
}

export async function fetchScenarios(userId: string): Promise<SimulationResponse> {
  const res = await authFetch(`${API_BASE}/scenarios/${userId}`);
  return handleResponse<SimulationResponse>(res);
}

// Daily Check-in APIs
export async function saveCheckIn(input: DailyCheckInInput, userId: string): Promise<DailyCheckIn> {
  const res = await authFetch(`${API_BASE}/check-in?user_id=${encodeURIComponent(userId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return handleResponse<DailyCheckIn>(res);
}

export async function fetchTodayCheckIn(userId: string): Promise<DailyCheckIn | null> {
  const res = await authFetch(`${API_BASE}/check-in/today?user_id=${encodeURIComponent(userId)}`);
  if (res.status === 404) return null;
  return handleResponse<DailyCheckIn | null>(res);
}

export async function updateTodayCheckIn(input: DailyCheckInInput, userId: string): Promise<DailyCheckIn> {
  const res = await authFetch(`${API_BASE}/check-in/today?user_id=${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return handleResponse<DailyCheckIn>(res);
}

export async function fetchCheckIns(userId: string, limit: number = 30): Promise<DailyCheckIn[]> {
  const res = await authFetch(`${API_BASE}/check-ins?user_id=${encodeURIComponent(userId)}&limit=${limit}`);
  return handleResponse<DailyCheckIn[]>(res);
}

export async function fetchCheckInSummary(userId: string): Promise<CheckInSummary> {
  const res = await authFetch(`${API_BASE}/check-ins/summary?user_id=${encodeURIComponent(userId)}`);
  return handleResponse<CheckInSummary>(res);
}

// Action Roadmap APIs
export async function fetchRoadmap(userId: string): Promise<ActionRoadmap | null> {
  const res = await authFetch(`${API_BASE}/roadmap/${encodeURIComponent(userId)}`);
  if (res.status === 404) return null;
  return handleResponse<ActionRoadmap>(res);
}

export async function generateRoadmap(userId: string): Promise<ActionRoadmap> {
  const res = await authFetch(`${API_BASE}/roadmap/${encodeURIComponent(userId)}`, {
    method: 'POST'
  });
  return handleResponse<ActionRoadmap>(res);
}

export async function updateRoadmapAction(userId: string, actionId: string): Promise<ActionRoadmap> {
  const res = await authFetch(`${API_BASE}/roadmap/${encodeURIComponent(userId)}/action/${encodeURIComponent(actionId)}`, {
    method: 'PUT'
  });
  return handleResponse<ActionRoadmap>(res);
}

// Weekly Check-in APIs
export async function submitWeeklyCheckIn(input: WeeklyCheckInSubmission, userId: string): Promise<WeeklyCheckInResult> {
  const res = await authFetch(`${API_BASE}/check-in/weekly?user_id=${encodeURIComponent(userId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return handleResponse<WeeklyCheckInResult>(res);
}

export async function fetchWeeklyCheckInHistory(userId: string): Promise<WeeklyCheckInResult[]> {
  const res = await authFetch(`${API_BASE}/check-in/weekly/history?user_id=${encodeURIComponent(userId)}`);
  return handleResponse<WeeklyCheckInResult[]>(res);
}

// Progress Intelligence APIs
export async function fetchProgress(userId: string): Promise<ProgressSummary> {
  const res = await authFetch(`${API_BASE}/progress/${encodeURIComponent(userId)}`);
  return handleResponse<ProgressSummary>(res);
}

// Adaptive Future Feedback APIs
export async function fetchAdaptiveFuture(userId: string): Promise<AdaptiveFutureFeedback> {
  const res = await authFetch(`${API_BASE}/adaptive-future/${encodeURIComponent(userId)}`);
  return handleResponse<AdaptiveFutureFeedback>(res);
}

export async function requestAdaptiveFuture(userId: string): Promise<AdaptiveFutureFeedback> {
  const res = await authFetch(`${API_BASE}/adaptive-future/${encodeURIComponent(userId)}`, {
    method: 'POST'
  });
  return handleResponse<AdaptiveFutureFeedback>(res);
}


