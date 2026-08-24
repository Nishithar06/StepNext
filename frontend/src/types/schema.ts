export interface Commitment {
  name: string;
  hours_per_week: number;
}

export interface UserProfile {
  user_id: string;
  name: string;
  education?: string;
  career_goal?: string;
  interests: string[];
  skills: string[];
  skills_to_improve: string[];
  available_hours_per_day: number;
  sleep_hours: number;
  workload: 'low' | 'medium' | 'high' | string;
  regular_activities: string[];
  major_commitments: Commitment[];
  financial_priority: number;
  short_term_goal?: string;
}

export interface DerivedProfile {
  user_id: string;
  personality: string;
  strengths: string[];
  weaknesses: string[];
  motivations: string[];
  learning_style: string;
  risk_factors: string[];
  career_alignment: string;
}

export interface OverloadScore {
  user_id: string;
  total_score: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical' | string;
  breakdown: Record<string, number>;
  contributing_factors: string[];
  explanation: string;
  recommendations: string[];
}

export interface ScenarioInput {
  name: string;
  description: string;
  weekly_hours: number;
  focus_areas: string[];
  investments?: Record<string, number>;
}

export interface ScenarioResult {
  name: string;
  goal_alignment: number;
  skill_growth: number;
  financial_outlook: number;
  learning_potential: number;
  risk: number;
  overall_score: number;
  explanation: string;
}

export interface Recommendation {
  recommended_scenario: string;
  reason: string;
  tradeoffs: string[];
  next_steps: string[];
}

export interface SimulationResponse {
  id: string;
  user_id: string;
  scenarios: ScenarioInput[];
  results: ScenarioResult[];
  recommendation: Recommendation;
}

export interface HealthResponse {
  status: string;
  supabase_connected: boolean;
  gemini_connected: boolean;
  mode: string;
}

export interface DailyCheckInInput {
  sleep_time: string;
  wake_time: string;
  sleep_duration: number;
  energy: number;
  stress: number;
  mood: number;
  planned_tasks: number;
  completed_tasks: number;
  work_hours: number;
  study_hours: number;
  exercise_completed?: boolean | null;
  exercise_summary?: string | null;
  achievement?: string;
  blocker?: string;
  tomorrow_priority?: string;
}

export interface DailyCheckIn extends DailyCheckInInput {
  id: string;
  user_id: string;
  date: string;
  created_at?: string;
  updated_at?: string;
}

export interface CheckInSummary {
  user_id: string;
  total_checkins: number;
  streak_days?: number;
  avg_sleep?: number;
  avg_energy?: number;
  avg_stress?: number;
  avg_mood?: number;
  task_completion_rate?: number;
  exercise_completion_rate?: number;
  average_energy?: number;
  average_stress?: number;
  average_sleep?: number;
  average_completion_rate?: number;
  recent_trend?: string;
  recent_checkins?: DailyCheckIn[];
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: 'SKILL' | 'PROJECT' | 'CAREER' | 'APPLICATION' | 'RESEARCH' | 'NETWORKING' | 'MILESTONE' | string;
  target: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'High' | 'Medium' | 'Low' | string;
}

export interface MilestoneGroup {
  timeframe: string;
  title: string;
  items: string[];
}

export interface MetricToTrack {
  name: string;
  current: string;
  target: string;
}

export interface ActionRoadmap {
  id: string;
  user_id: string;
  scenario: string;
  overall_score: number;
  reason: string;
  workload_risk: number;
  risk_level: string;
  workload_caution?: string;
  milestones: MilestoneGroup[];
  weekly_actions: RoadmapItem[];
  top_priorities: RoadmapItem[];
  metrics_to_track: MetricToTrack[];
  next_checkin: string;
  created_at: string;
}

export interface WeeklyCheckInSubmission {
  user_id: string;
  roadmap_id?: string;
  action_statuses: Record<string, string>;
  completion_level: string;
  workload_feeling: string;
  blocker?: string;
}

export interface WeeklyCheckInResult {
  id: string;
  user_id: string;
  roadmap_id?: string;
  completed_actions_count: number;
  total_actions_count: number;
  completion_percentage: number;
  completion_level: string;
  workload_feeling: string;
  blocker?: string;
  guidance_message: string;
  created_at: string;
}

export interface ActionProgressInsight {
  action_id: string;
  title: string;
  category: string;
  status: 'completed' | 'carry_forward' | 'needs_review' | string;
  missed_count: number;
  insight_type: 'completed' | 'carry_forward' | 'needs_review' | string;
}

export interface AdaptiveRecommendation {
  recommendation_type: 'reduce_workload' | 'increase_depth' | 'stabilize' | 'continue' | 'observe' | string;
  title: string;
  message: string;
  priority_actions: string[];
}

export interface ProgressSummary {
  user_id: string;
  roadmap_id?: string;
  scenario: string;
  overall_execution_percentage: number;
  latest_week_completion_percentage: number;
  previous_week_completion_percentage: number;
  completion_trend: 'improving' | 'stable' | 'declining' | 'insufficient_data' | string;
  execution_velocity: number;
  current_execution_streak: number;
  total_actions_planned: number;
  total_actions_completed: number;
  missed_actions: ActionProgressInsight[];
  repeatedly_missed_actions: ActionProgressInsight[];
  weekly_history_trend: number[];
  workload_signal: string;
  adaptive_recommendation: AdaptiveRecommendation;
}

export interface AdaptiveFutureFeedback {
  user_id: string;
  status: 'on_track' | 'needs_adjustment' | 'stabilize' | 're_evaluate' | string;
  current_scenario: string;
  current_score: number;
  execution_health: string;
  workload_health: string;
  future_confidence: number;
  trigger_reason: string;
  recommendation: 'continue_current_path' | 'reduce_workload' | 'stabilize_execution' | 're_run_future_simulator' | string;
  evidence: string[];
  next_action: string;
  should_re_evaluate: boolean;
  alternative_scenario?: string;
  alternative_score?: number;
  created_at: string;
}
