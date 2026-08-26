from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class Commitment(BaseModel):
    name: str
    hours_per_week: float = Field(default=0.0, ge=0)

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    user_id: str = "demo_user"
    name: str = "Demo User"
    education: Optional[str] = "B.Tech Computer Science"
    career_goal: Optional[str] = "AI Software Engineer"
    interests: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    skills_to_improve: List[str] = Field(default_factory=list)
    available_hours_per_day: float = Field(default=6.0, ge=0, le=24)
    sleep_hours: float = Field(default=7.0, ge=0, le=24)
    workload: str = Field(default="medium", description="low, medium, high")
    regular_activities: List[str] = Field(default_factory=list)
    major_commitments: List[Commitment] = Field(default_factory=list)
    financial_priority: int = Field(default=5, ge=1, le=10)
    short_term_goal: Optional[str] = "Build high impact software projects"

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    education: Optional[str] = None
    career_goal: Optional[str] = None
    interests: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    skills_to_improve: Optional[List[str]] = None
    available_hours_per_day: Optional[float] = None
    sleep_hours: Optional[float] = None
    workload: Optional[str] = None
    regular_activities: Optional[List[str]] = None
    major_commitments: Optional[List[Commitment]] = None
    financial_priority: Optional[int] = None
    short_term_goal: Optional[str] = None

class DerivedProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    user_id: str = "demo_user"
    personality: str
    strengths: List[str]
    weaknesses: List[str]
    motivations: List[str]
    learning_style: str
    risk_factors: List[str]
    career_alignment: str

class OverloadScore(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    user_id: str = "demo_user"
    total_score: int = Field(ge=0, le=100)
    risk_level: str = Field(description="Low, Moderate, High, Critical")
    breakdown: Dict[str, int] = Field(default_factory=dict)
    contributing_factors: List[str] = Field(default_factory=list)
    explanation: str
    recommendations: List[str] = Field(default_factory=list)

class ScenarioInput(BaseModel):
    name: str
    description: Optional[str] = Field(default="")
    weekly_hours: float = Field(default=15.0, ge=0)
    focus_areas: List[str] = Field(default_factory=list)
    investments: Optional[Dict[str, float]] = Field(default_factory=dict)

class SimulationRequest(BaseModel):
    scenarios: List[ScenarioInput]
    selected_scenario: Optional[str] = Field(default=None, description="Primary selected scenario path: Placement, Higher Studies, or Startup")


class ScenarioResult(BaseModel):
    name: str
    goal_alignment: int = Field(ge=0, le=100)
    skill_growth: int = Field(ge=0, le=100)
    financial_outlook: int = Field(ge=0, le=100)
    learning_potential: int = Field(ge=0, le=100)
    risk: int = Field(ge=0, le=100)
    overall_score: int = Field(ge=0, le=100)
    explanation: str

class Recommendation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    recommended_scenario: str
    reason: str
    tradeoffs: List[str] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)
    engine_used: Optional[str] = Field(default="deterministic_fallback", description="Engine used: gemini-2.0-flash or deterministic_fallback")
    score_gap: Optional[int] = Field(default=None)


class SimulationResponse(BaseModel):
    id: str
    user_id: str = "demo_user"
    scenarios: List[ScenarioInput]
    results: List[ScenarioResult]
    recommendation: Recommendation

class PingResponse(BaseModel):
    message: str = "pong"
    status: str = "ok"

class HealthResponse(BaseModel):
    status: str
    supabase_connected: bool
    gemini_connected: bool
    api_key_configured: bool = False
    api_key_status: str = "missing"
    mode: str

class ConfigCheckResponse(BaseModel):
    api_key_configured: bool
    api_key_status: str
    var_name: str = "GEMINI_API_KEY"
    backend_env_loaded: bool = True
    variable_found: bool = False
    source: str = "unknown"
    note: str = "API key string is strictly concealed for security."



class DailyCheckInInput(BaseModel):
    sleep_time: str = Field(default="23:00", description="HH:MM e.g. 23:30")
    wake_time: str = Field(default="07:00", description="HH:MM e.g. 06:30")
    sleep_duration: float = Field(default=8.0, ge=0, le=24)
    energy: int = Field(default=7, ge=1, le=10)
    stress: int = Field(default=4, ge=1, le=10)
    mood: int = Field(default=7, ge=1, le=10)
    planned_tasks: int = Field(default=5, ge=0)
    completed_tasks: int = Field(default=4, ge=0)
    work_hours: float = Field(default=6.0, ge=0, le=24)
    study_hours: float = Field(default=2.0, ge=0, le=24)
    exercise_completed: Optional[bool] = Field(default=None)
    exercise_summary: Optional[str] = Field(default=None)
    achievement: Optional[str] = None
    blocker: Optional[str] = None
    tomorrow_priority: Optional[str] = None

class DailyCheckIn(DailyCheckInInput):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str = "demo_user"
    date: str  # YYYY-MM-DD
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class CheckInSummary(BaseModel):
    user_id: str = "demo_user"
    total_checkins: int = 0
    streak_days: int = 0
    avg_sleep: float = 0.0
    avg_energy: float = 0.0
    avg_stress: float = 0.0
    avg_mood: float = 0.0
    task_completion_rate: float = 0.0
    exercise_completion_rate: float = 0.0
    average_energy: float = 0.0
    average_stress: float = 0.0
    average_sleep: float = 0.0
    average_completion_rate: float = 0.0
    recent_trend: str = "Stable"
    recent_checkins: List[DailyCheckIn] = Field(default_factory=list)

class RoadmapItem(BaseModel):
    id: str
    title: str
    description: str
    category: str  # SKILL, PROJECT, CAREER, APPLICATION, RESEARCH, NETWORKING, MILESTONE
    target: str
    status: str = "not_started"  # not_started, in_progress, completed
    priority: str = "High"  # High, Medium, Low

class MilestoneGroup(BaseModel):
    timeframe: str  # 30 DAYS, 60 DAYS, 90 DAYS
    title: str
    items: List[str]

class MetricToTrack(BaseModel):
    name: str
    current: str
    target: str

class ActionRoadmap(BaseModel):
    id: str
    user_id: str = "demo_user"
    scenario: str
    overall_score: int
    reason: str
    workload_risk: int
    risk_level: str
    workload_caution: Optional[str] = None
    milestones: List[MilestoneGroup] = Field(default_factory=list)
    weekly_actions: List[RoadmapItem] = Field(default_factory=list)
    top_priorities: List[RoadmapItem] = Field(default_factory=list)
    metrics_to_track: List[MetricToTrack] = Field(default_factory=list)
    next_checkin: str = "In 7 Days"
    created_at: str = ""
    goal_context: Optional[str] = None

class WeeklyCheckInSubmission(BaseModel):
    user_id: str = "demo_user"
    roadmap_id: Optional[str] = None
    action_statuses: Dict[str, str] = Field(default_factory=dict)
    completion_level: str = "Most"
    workload_feeling: str = "Manageable"
    blocker: Optional[str] = "None"

class WeeklyCheckInResult(BaseModel):
    id: str
    user_id: str = "demo_user"
    roadmap_id: Optional[str] = None
    completed_actions_count: int = 0
    total_actions_count: int = 0
    completion_percentage: int = 0
    completion_level: str = "Most"
    workload_feeling: str = "Manageable"
    blocker: Optional[str] = "None"
    guidance_message: str = "Keep tracking your weekly actions consistently."
    created_at: str = ""

class ActionProgressInsight(BaseModel):
    action_id: str
    title: str
    category: str
    status: str = "carry_forward"  # completed, carry_forward, needs_review
    missed_count: int = 0
    insight_type: str = "carry_forward"  # completed, carry_forward, needs_review

class AdaptiveRecommendation(BaseModel):
    recommendation_type: str = "observe"  # reduce_workload, increase_depth, stabilize, continue, observe
    title: str = "Observe Pattern"
    message: str = "Keep checking in weekly so StepNext can identify a reliable execution pattern."
    priority_actions: List[str] = Field(default_factory=list)

class ProgressSummary(BaseModel):
    user_id: str = "demo_user"
    roadmap_id: Optional[str] = None
    scenario: str = "Placement"
    overall_execution_percentage: int = 0
    latest_week_completion_percentage: int = 0
    previous_week_completion_percentage: int = 0
    completion_trend: str = "insufficient_data"  # improving, stable, declining, insufficient_data
    execution_velocity: float = 0.0
    current_execution_streak: int = 0
    total_actions_planned: int = 0
    total_actions_completed: int = 0
    missed_actions: List[ActionProgressInsight] = Field(default_factory=list)
    repeatedly_missed_actions: List[ActionProgressInsight] = Field(default_factory=list)
    weekly_history_trend: List[int] = Field(default_factory=list)
    workload_signal: str = "Unknown"
    adaptive_recommendation: AdaptiveRecommendation

class AdaptiveFutureFeedback(BaseModel):
    user_id: str = "demo_user"
    status: str = "on_track"  # on_track, needs_adjustment, stabilize, re_evaluate
    current_scenario: str = "Placement"
    current_score: int = 85
    execution_health: str = "Healthy (80%)"
    workload_health: str = "Manageable"
    future_confidence: int = 85  # 0 to 100
    trigger_reason: str = "Execution is consistent with the current recommended path."
    recommendation: str = "continue_current_path"  # continue_current_path, reduce_workload, stabilize_execution, re_run_future_simulator
    evidence: List[str] = Field(default_factory=list)
    next_action: str = "Continue executing weekly actions."
    should_re_evaluate: bool = False
    alternative_scenario: Optional[str] = None
    alternative_score: Optional[int] = None
    created_at: str = ""



