# Project: StepNext (LifePilot) Platform Optimization

## Architecture
StepNext (LifePilot) is a decision-support and life-navigation platform designed with a closed decision-action-learning telemetry loop.
- **Frontend**: Single-page React 18 TypeScript application using Vite, Tailwind CSS, and Lucide React icons. Manages state via `App.tsx` and modular pages (`DashboardPage`, `DigitalTwinPage`, `CurrentStatePage`, `SimulatorPage`, `ProfilePage`) with modal workflows (`OnboardingModal`, `CheckInModal`). Features an instantaneous 0ms client-side deterministic consequence evaluator (`evaluateScenarioFrontend`) and live API synchronization via `src/api/client.ts`.
- **Backend**: FastAPI backend in Python with Pydantic v2 schemas (`backend/app/schemas/models.py`), structured SQLite/in-memory data models, and dual-tier intelligence engines:
  1. Primary AI synthesis via Google Gemini (`backend/app/services/gemini_service.py`).
  2. Offline deterministic fallback calculation engines:
     - Digital Twin Derivation (`backend/app/services/profile_derivation.py`, `higher_studies_resolver.py`)
     - Overload Risk Calculation (`backend/app/services/overload_calculator.py`)
     - Future Simulator Engine (`backend/app/services/simulator_service.py`)
     - 90-Day Action Roadmap & Check-In Tracking (`backend/app/services/roadmap_service.py`, `checkin_service.py`)
     - Progress Intelligence & Adaptive Future Feedback (`backend/app/services/progress_service.py`, `adaptive_future_service.py`)
- **API Surface**: 8 registered FastAPI routers (`profile`, `overload`, `simulator`, `checkin`, `roadmap`, `progress`, `adaptive_future`, `health`) mapped 1-to-1 to 20 typed frontend API client functions.
- **Telemetry Loop**:
  `Onboarding` → `Profile Baseline & Digital Twin` → `Overload Risk Baseline` → `Simulator Slider Tweaks & Consequence Run` → `90-Day Action Roadmap Generation` → `Daily & Weekly Check-Ins` → `Progress Velocity & Streaks` → `Adaptive Future Recommendations`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | FastAPI Health & System Diagnostic Endpoints | `/api/ping`, `/api/health/db`, `/api/health/config` health checks | M1 | Survey |
| 2 | User Profile & Onboarding Derivation | `/api/profile`, `/api/profile/{id}` persistence and deterministic attribute derivation | M1 | Survey |
| 3 | Higher Studies & Domain Goal Intelligence | Deterministic keyword and degree goal classification across engineering, sciences, arts | M1 | Survey |
| 4 | Digital Twin Identity Synthesis | `/api/digital-twin/{id}` persona generation (What You Told vs Derived, Strengths, Growth, Risks) | M1 | Survey |
| 5 | Overload Risk Capacity Engine | `/api/overload-score/{id}` multi-factor strain, commitment, and sleep analysis | M1 | Survey |
| 6 | Future Simulator Multi-Scenario Modeling | `/api/simulate/{id}`, `/api/scenarios/{id}` deterministic weekly investment consequence evaluator | M1 | Survey |
| 7 | Daily Check-In & Sleep Telemetry | `/api/check-in`, `/api/check-in/today`, summary metrics, and overload score feedback | M1 | Survey |
| 8 | 90-Day Action Roadmap & Task Management | `/api/roadmap/{id}`, `/api/roadmap/{id}/action/{action_id}` status toggle and phase milestones | M1 | Survey |
| 9 | Weekly Check-In & Velocity Intelligence | `/api/check-in/weekly`, `/api/check-in/weekly/history` execution tracking | M1 | Survey |
| 10 | Progress Intelligence Engine | `/api/progress/{id}`, `/api/progress/{id}/adapt` velocity scoring, streaks, and missed actions | M1 | Survey |
| 11 | Adaptive Future Trajectory & Health Scoring | `/api/adaptive-future/{id}` direction confidence, status matrix, and adaptive guidance | M1 | Survey |
| 12 | Pydantic Schema Strictness & Defaults | `ScenarioInput.description` default resolution, schema validations across all models | M1 | Survey |
| 13 | Backend Automated Test Suite Integrity | `test_api.py`, `test_system_integration.py`, `test_adaptive_future.py`, `test_goal_intelligence_regression.py`, `test_progress_intelligence.py` clean pass | M1 | Survey |
| 14 | Frontend AppShell, Navigation & Layout | Responsive desktop sidebar, mobile drawer, topbar breadcrumbs, and user pill | M2 | Survey |
| 15 | Editorial Dashboard Page | Life Orbit hero, daily check-in banner, weekly telemetry trends, snapshot grid, attention advisory | M2 | Survey |
| 16 | Digital Twin Visualizer Page | Avatar silhouette aura, 3-column layout, strengths, growth areas, risk factor badges | M2 | Survey |
| 17 | Current State & Overload Risk Page | Semi-circle SVG RiskGauge, factor breakdown bars, actionable suggestion toggles, 30-day logs | M2 | Survey |
| 18 | Future Simulator & Live Consequence Panel | 3 scenario cards, investment sliders, 0ms local evaluator, decision analysis breakdown | M2 | Survey |
| 19 | Interactive Action Roadmap & Progress Section | Milestone phases, action check toggles, velocity percentage, streak badges, missed actions | M2 | Survey |
| 20 | Adaptive Future Section | Trajectory health status badge, confidence gauge, evidence list, adaptive recommendations | M2 | Survey |
| 21 | Daily & Weekly Check-In Modals | Daily telemetry (sleep duration auto-calc, mood/energy/stress) and weekly roadmap reviews | M2 | Survey |
| 22 | Onboarding Guided Wizard Modal | 6-step wizard with validation, custom goals, and auto-generated user profile | M2 | Survey |
| 23 | Legacy / Orphaned Component Cleanup | Removal of unused `Navbar.tsx`, `WelcomeHeader.tsx`, `SnapshotRow.tsx`, `DigitalTwinView.tsx`, `OverloadRiskView.tsx`, `FutureSimulatorView.tsx` | M2 | Survey |
| 24 | Error Boundaries & Fallback States | SimulatorErrorBoundary, global retry banners, skeleton loaders, and empty states | M2 | Survey |
| 25 | Bidirectional Telemetry Synchronization | End-to-end integration across onboarding, simulation, check-in, roadmap, progress, and adaptive future | M3 | Survey |
| 26 | Comprehensive E2E Test Suite (Tiers 1-4) | Multi-tier test coverage (Feature coverage, Boundary & Corner cases, Cross-feature workflows, Real-world workloads) | M4 | Survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend Core Fixes, Schema Hardening & Test Verification | Resolve `ScenarioInput.description` default, fix `higher_studies_resolver.py` substring match bug, calibrate `progress.py` single check-in logic, tune `adaptive_future.py` decision thresholds, update outdated positional calls in `test_system_integration.py`, and run all backend test suites cleanly. | None | DONE |
| M2 | Frontend Polish, Legacy Component Cleanup & UI Integrity | Clean up 6 orphaned legacy components, fix `App.tsx` styling typo, verify UI responsiveness across all views, and ensure complete static type/build integrity. | None | DONE |
| M3 | End-to-End Telemetry Synchronization & Closed-Loop Verification | Verify complete bidirectional state flows across Onboarding, Simulator, Daily/Weekly Check-ins, Roadmap Actions, Progress Intelligence, and Adaptive Future. | M1, M2 | IN_PROGRESS |
| M4 | E2E Testing Suite (Tiers 1-4) & Final Platform Acceptance | Create comprehensive E2E test suite covering Tiers 1-4, execute all backend and frontend validation suites, and verify 100% acceptance criteria pass. | M3 | IN_PROGRESS |

## Interface Contracts
### Frontend (`src/api/client.ts`) ↔ Backend (`backend/app/routes/*.py`)
- **Health**: `GET /api/ping` -> `{"status": "ok", "app": "LifePilot", "version": "1.0.0"}`
- **Profile**:
  - `POST /api/profile` (Payload: `UserProfileInput`) -> `UserProfile`
  - `GET /api/profile/{user_id}` -> `UserProfile`
  - `GET /api/digital-twin/{user_id}` -> `DerivedProfile`
  - `POST /api/digital-twin/{user_id}` -> `DerivedProfile`
- **Overload**:
  - `GET /api/overload-score/{user_id}` -> `OverloadScore`
  - `POST /api/overload-score/{user_id}` -> `OverloadScore`
- **Simulator**:
  - `POST /api/simulate/{user_id}` (Payload: `{scenarios: ScenarioInput[], selected_scenario_id?: string}`) -> `SimulationResponse`
  - `GET /api/scenarios/{user_id}` -> `ScenarioInput[]`
- **Check-in**:
  - `POST /api/check-in?user_id={user_id}` (Payload: `CheckInInput`) -> `DailyCheckIn`
  - `GET /api/check-in/today?user_id={user_id}` -> `DailyCheckIn | null`
  - `PUT /api/check-in/today?user_id={user_id}` (Payload: `CheckInInput`) -> `DailyCheckIn`
  - `GET /api/check-ins?user_id={user_id}&limit={limit}` -> `DailyCheckIn[]`
  - `GET /api/check-ins/summary?user_id={user_id}` -> `CheckInSummary`
  - `POST /api/check-in/weekly?user_id={user_id}` (Payload: `WeeklyCheckInSubmission`) -> `WeeklyCheckInResult`
  - `GET /api/check-in/weekly/history?user_id={user_id}` -> `WeeklyCheckInSubmission[]`
- **Roadmap**:
  - `GET /api/roadmap/{user_id}` -> `ActionRoadmap`
  - `POST /api/roadmap/{user_id}` -> `ActionRoadmap`
  - `PUT /api/roadmap/{user_id}/action/{action_id}` (Query: `user_id={user_id}`) -> `ActionItem`
- **Progress**:
  - `GET /api/progress/{user_id}` -> `ProgressSummary`
  - `POST /api/progress/{user_id}/adapt` -> `ProgressSummary`
- **Adaptive Future**:
  - `GET /api/adaptive-future/{user_id}` -> `AdaptiveFutureFeedback`
  - `POST /api/adaptive-future/{user_id}` -> `AdaptiveFutureFeedback`

## Code Layout
### Backend (`backend/`)
- `backend/app/main.py`: FastAPI application setup, CORS middleware, router registrations
- `backend/app/schemas/models.py`: Pydantic data schemas and validation models
- `backend/app/routes/`: 8 API route modules (`health.py`, `profile.py`, `overload.py`, `simulator.py`, `checkin.py`, `roadmap.py`, `progress.py`, `adaptive_future.py`)
- `backend/app/services/`: Calculation and intelligence services (`gemini_service.py`, `profile_derivation.py`, `higher_studies_resolver.py`, `overload_calculator.py`, `simulator_service.py`, `roadmap_service.py`, `checkin_service.py`, `progress_service.py`, `adaptive_future_service.py`)
- `backend/tests/`: Backend test suites (`test_api.py`, `test_system_integration.py`, `test_adaptive_future.py`, `test_goal_intelligence_regression.py`, `test_progress_intelligence.py`, `test_telemetry_loop.py`, `test_e2e_multi_tier.py`)

### Frontend (`frontend/`)
- `frontend/src/App.tsx`: Main application coordinator and top-level telemetry state
- `frontend/src/api/client.ts`: Typed API client wrapper
- `frontend/src/types/schema.ts`: TypeScript interface definitions mirroring backend models
- `frontend/src/pages/`: Page views (`DashboardPage.tsx`, `DigitalTwinPage.tsx`, `CurrentStatePage.tsx`, `SimulatorPage.tsx`, `ProfilePage.tsx`)
- `frontend/src/components/`: Modular feature components (`ActionRoadmapSection.tsx`, `ProgressIntelligenceSection.tsx`, `AdaptiveFutureSection.tsx`, `LifePilotStatus.tsx`, `OnboardingModal.tsx`, `CheckInModal.tsx`, `layout/`, `common/`)
