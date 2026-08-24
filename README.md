# LifePilot — AI Personal Decision Support & Future Simulator

LifePilot is a decision-support web application that empowers individuals to navigate complex career and life choices through data-backed modeling, overload risk analysis, and multi-scenario future simulations.

## Stack Architecture

- **Frontend**: React 18, Vite, TypeScript, Lucide React, Plain `fetch` API Client (No external Auth needed for MVP).
- **Backend**: FastAPI, Python 3.10+, Pydantic v2.
- **Database**: Supabase Postgres (via `supabase-py` client) with robust local deterministic fallback mode.
- **AI Engine**: Google Gemini (via `google-genai` / `google-generativeai`) with transparent rule-based fallback engines.

---

## Complete Core Product Flow

```
User Profile → Digital Twin → Current Status → Future Simulator → Scenario Comparison → Recommendation
```

1. **User Profile**: Onboarding wizard collecting skills, goals, availability, sleep, and major commitments.
2. **Digital Twin**: Synthetic persona derived from user profile mapping strengths, weaknesses, motivations, learning style, and risk factors.
3. **Current Status**: Transparent **Current Overload Risk** engine calculating a 0–100 workload risk score, risk level, contributing factors, recommendations, and recalculation trigger.
4. **Future Simulator**: Multi-scenario trajectory evaluator contrasting options like **Placement** vs **Higher Studies**.
5. **Scenario Comparison**: Deterministic scoring across Goal Alignment, Skill Growth, Financial Outlook, Learning Potential, and Workload Risk.
6. **Recommendation**: Synthesized recommendation with trade-offs, next steps, and operational disclaimers.

---

## Setup & Running Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

If you have Supabase or Gemini API keys, enter them in `.env`. If credentials are omitted, **LifePilot operates 100% seamlessly in Demo / Fallback Mode** using local deterministic engines and fixtures!

### 2. Database Setup (Supabase SQL Migration)

To set up tables in a Supabase project:
1. Open your Supabase Dashboard -> SQL Editor.
2. Run `backend/migrations/001_initial_schema.sql`.
3. Run `backend/migrations/002_seed_dummy_data.sql`.

---

### 3. Backend Setup & Run (FastAPI)

```bash
# Navigate to backend
cd backend

# Create virtual environment (optional)
python -m venv venv
# On Windows: venv\Scripts\activate
# On Unix: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Unit Tests
pytest

# Start FastAPI Server
python -m uvicorn app.main:app --port 8000 --reload
```

The backend server will run on `http://localhost:8000`. You can view the interactive OpenAPI documentation at `http://localhost:8000/docs`.

---

### 4. Frontend Setup & Run (React + Vite)

In a separate terminal window:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run TypeScript build check
npm run build

# Start Vite Development Server
npm run dev
```

The frontend application will run on `http://localhost:3000`.

---

## Verification & Testing

### Running Backend Tests

```bash
cd backend
pytest
```

Tests cover:
- Health check endpoints (`/api/ping`, `/api/health/db`)
- Profile CRUD & validation (`demo_user`)
- Digital Twin generation & fallback logic
- Overload Risk Engine calculations, breakdown, and boundary conditions
- Future Simulator evaluation (Placement vs Higher Studies) & recommendations

### Verifying Fallback Mode

To test offline/fallback mode:
1. Set `SUPABASE_URL=`, `SUPABASE_KEY=`, and `GEMINI_API_KEY=` in `.env` (or leave them empty).
2. Start backend and frontend.
3. Open `http://localhost:3000`.
4. Observe the **Demo / Fallback Mode** indicator in the navbar.
5. All features (Digital Twin, Overload Risk, Future Simulator) will work deterministically without errors!
