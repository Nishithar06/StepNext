-- StepNext Production Database Schema (Supabase PostgreSQL)
-- Defines tables: user_profiles, derived_profiles, overload_scores, scenario_comparisons, daily_checkins
-- Note: Does NOT include demo seed data. Keep demo seed data separate (002_seed_dummy_data.sql).

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Demo User',
    education TEXT,
    career_goal TEXT,
    interests JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    skills_to_improve JSONB DEFAULT '[]'::jsonb,
    available_hours_per_day DOUBLE PRECISION DEFAULT 6.0,
    sleep_hours DOUBLE PRECISION DEFAULT 7.0,
    workload TEXT DEFAULT 'medium',
    regular_activities JSONB DEFAULT '[]'::jsonb,
    major_commitments JSONB DEFAULT '[]'::jsonb,
    financial_priority INT DEFAULT 5,
    short_term_goal TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS derived_profiles (
    user_id TEXT PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    personality TEXT,
    strengths JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    motivations JSONB DEFAULT '[]'::jsonb,
    learning_style TEXT,
    risk_factors JSONB DEFAULT '[]'::jsonb,
    career_alignment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS overload_scores (
    user_id TEXT PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    total_score INT NOT NULL,
    risk_level TEXT NOT NULL,
    breakdown JSONB DEFAULT '{}'::jsonb,
    contributing_factors JSONB DEFAULT '[]'::jsonb,
    explanation TEXT,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scenario_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    scenarios JSONB NOT NULL DEFAULT '[]'::jsonb,
    comparison_results JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendation JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenario_comparisons_user_id ON scenario_comparisons(user_id);

CREATE TABLE IF NOT EXISTS daily_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    sleep_time TEXT DEFAULT '23:00',
    wake_time TEXT DEFAULT '07:00',
    sleep_duration DOUBLE PRECISION DEFAULT 8.0,
    energy INT DEFAULT 7,
    stress INT DEFAULT 4,
    mood INT DEFAULT 7,
    planned_tasks INT DEFAULT 5,
    completed_tasks INT DEFAULT 4,
    work_hours DOUBLE PRECISION DEFAULT 6.0,
    study_hours DOUBLE PRECISION DEFAULT 2.0,
    exercise_completed BOOLEAN DEFAULT FALSE,
    exercise_summary TEXT,
    achievement TEXT,
    blocker TEXT,
    tomorrow_priority TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON daily_checkins(user_id, date DESC);
