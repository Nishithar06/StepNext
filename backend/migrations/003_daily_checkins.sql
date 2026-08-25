-- Migration 003: Daily Check-ins Table for LifePilot

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
