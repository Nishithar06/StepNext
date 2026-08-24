-- Migration 002: Seed Initial Demo User Data

INSERT INTO user_profiles (
    user_id, name, education, career_goal, interests, skills, skills_to_improve,
    available_hours_per_day, sleep_hours, workload, regular_activities, major_commitments,
    financial_priority, short_term_goal
) VALUES (
    'demo_user',
    'Alex Morgan',
    'B.Tech Computer Science (Final Year)',
    'Senior AI Software Engineer',
    '["Machine Learning", "System Design", "Open Source", "Fintech"]'::jsonb,
    '["Python", "FastAPI", "JavaScript", "React", "SQL", "Git"]'::jsonb,
    '["Data Structures & Algorithms", "Distributed Systems", "PyTorch"]'::jsonb,
    6.5,
    6.0,
    'high',
    '["Gym 3x/week", "Open source contributions", "Coding contests"]'::jsonb,
    '[{"name": "Final Year Capstone Project", "hours_per_week": 12}, {"name": "Part-time Internship", "hours_per_week": 15}, {"name": "Course Work & Exams", "hours_per_week": 10}]'::jsonb,
    8,
    'Secure a high-growth tech placement or fund higher studies within 6 months'
) ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW();

INSERT INTO derived_profiles (
    user_id, personality, strengths, weaknesses, motivations, learning_style, risk_factors, career_alignment
) VALUES (
    'demo_user',
    'Analytical, ambitious, and highly goal-oriented. Driven by technical mastery and practical problem-solving under pressure.',
    '["Rapid full-stack web prototyping", "Strong foundational Python & JavaScript skills", "High intrinsic motivation and self-directed learning", "Resourceful problem solver"]'::jsonb,
    '["Tendency to over-commit to multiple concurrent tracks", "Inconsistent sleep schedules during high workload phases", "Reluctance to delegate or drop low-priority commitments"]'::jsonb,
    '["Achieving financial independence early", "Building impactful AI applications", "Continuous technical growth and peer recognition"]'::jsonb,
    'Hands-on project-based execution combined with practical problem solving.',
    '["High workload density leading to cumulative burnout risk", "Sleep deficit (6.0h vs recommended 7.5-8h)", "Time fragmenting across internship, capstone project, and exam prep"]'::jsonb,
    'Strongly aligned with AI engineering and product-focused software development.'
) ON CONFLICT (user_id) DO UPDATE SET
    personality = EXCLUDED.personality,
    updated_at = NOW();

INSERT INTO overload_scores (
    user_id, total_score, risk_level, breakdown, contributing_factors, explanation, recommendations
) VALUES (
    'demo_user',
    58,
    'Moderate',
    '{"sleep_deficit": 20, "high_workload": 18, "commitments_density": 12, "recovery_shortage": 8}'::jsonb,
    '["Sleep duration (6.0 hours/day) is below optimal recovery threshold of 7.5 hours.", "Total weekly commitments (37 hrs) plus daily availability leaves minimal buffer for rest.", "Current workload is self-rated as HIGH."]'::jsonb,
    'Your current schedule reflects Moderate Overload Risk. While manageable short-term, the combination of a 6-hour sleep schedule and 37 hours of weekly commitments creates potential recovery bottlenecks.',
    '["Increase daily sleep targets to at least 7.0 hours to enhance cognitive recovery.", "Cap weekly internship + prep hours to prevent focus fragmentation.", "Schedule at least one full non-coding rest day per week."]'::jsonb
) ON CONFLICT (user_id) DO UPDATE SET
    total_score = EXCLUDED.total_score,
    risk_level = EXCLUDED.risk_level,
    updated_at = NOW();

INSERT INTO scenario_comparisons (
    id, user_id, scenarios, comparison_results, recommendation
) VALUES (
    'e4b2d18a-9321-4f10-b74e-51920dfa1122',
    'demo_user',
    '[{"name": "Placement Focus", "description": "Prepare aggressively for immediate software engineering campus/off-campus placements.", "weekly_hours": 18, "focus_areas": ["DSA & LeetCode", "System Design", "Mock Interviews", "Resume Projects"]}, {"name": "Higher Studies", "description": "Prepare for MS in Computer Science / AI entrance exams and research publications.", "weekly_hours": 22, "focus_areas": ["GRE/TOEFL Exams", "AI Research Paper", "Statement of Purpose", "Professor LORs"]}]'::jsonb,
    '[{"name": "Placement Focus", "goal_alignment": 92, "skill_growth": 85, "financial_outlook": 90, "learning_potential": 78, "risk": 35, "overall_score": 86, "explanation": "High financial return and strong immediate alignment with short-term placement goal (financial priority: 8/10)."}, {"name": "Higher Studies", "goal_alignment": 75, "skill_growth": 88, "financial_outlook": 55, "learning_potential": 94, "risk": 65, "overall_score": 73, "explanation": "Exceptional long-term learning potential, but higher short-term financial burden and workload risk."}]'::jsonb,
    '{"recommended_scenario": "Placement Focus", "reason": "Placement Focus best satisfies your high financial priority (8/10) and provides immediate career security while keeping workload manageable.", "tradeoffs": ["Slightly lower academic research depth compared to Higher Studies", "Requires consistent weekly DSA & algorithm interview practice"], "next_steps": ["Allocate 10 hours/week to DSA problem solving", "Refine 2 flagship projects on GitHub", "Schedule 2 mock technical interviews per week"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;
