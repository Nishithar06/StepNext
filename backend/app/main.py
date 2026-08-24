from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.health import router as health_router
from app.routes.profile import router as profile_router
from app.routes.overload import router as overload_router
from app.routes.simulator import router as simulator_router
from app.routes.checkin import router as checkin_router
from app.routes.roadmap import router as roadmap_router
from app.routes.progress import router as progress_router
from app.routes.adaptive_future import router as adaptive_future_router

app = FastAPI(
    title="StepNext API",
    description="Decision-support AI application backend for personal career & lifestyle navigation.",
    version="2.0.0"
)

# Configure CORS for local React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(health_router)
app.include_router(profile_router)
app.include_router(overload_router)
app.include_router(simulator_router)
app.include_router(checkin_router)
app.include_router(roadmap_router)
app.include_router(progress_router)
app.include_router(adaptive_future_router)

@app.get("/")
def root():
    return {
        "app": "StepNext Backend API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/api/health/db"
    }
