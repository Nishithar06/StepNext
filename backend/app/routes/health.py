from fastapi import APIRouter
from app.config import is_supabase_available, is_gemini_available, get_supabase_client, get_api_key_status
from app.schemas.models import PingResponse, HealthResponse, ConfigCheckResponse

router = APIRouter(prefix="/api", tags=["Health"])

@router.get("/ping", response_model=PingResponse)
def ping():
    return PingResponse(message="pong", status="ok")

@router.get("/health/db", response_model=HealthResponse)
def health_check():
    supabase_ok = False
    client = get_supabase_client()
    if client:
        try:
            # Trivial query check
            res = client.table("user_profiles").select("user_id", count="exact").limit(1).execute()
            supabase_ok = True
        except Exception as e:
            print(f"[Health] DB test query error: {e}")
            supabase_ok = False

    gemini_ok = is_gemini_available()
    key_info = get_api_key_status()
    
    if supabase_ok and gemini_ok:
        mode = "Fully Connected"
    elif supabase_ok:
        mode = "Supabase Connected (Deterministic AI Fallback)"
    elif gemini_ok:
        mode = "Gemini Connected (Local/Fixture DB Fallback)"
    else:
        mode = "Demo / Fallback Mode (Offline)"

    return HealthResponse(
        status="healthy",
        supabase_connected=supabase_ok,
        gemini_connected=gemini_ok,
        api_key_configured=key_info["configured"],
        api_key_status=key_info["status"],
        mode=mode
    )

@router.get("/health/config", response_model=ConfigCheckResponse)
def config_check():
    key_info = get_api_key_status()
    source_path = key_info.get("path", key_info.get("source", "unknown"))
    key_present_str = "true" if key_info.get("variable_found", False) else "false"
    print(f"[Health Check] CONFIG_SOURCE={source_path} GEMINI_KEY_PRESENT={key_present_str} GEMINI_KEY_STATUS={key_info['status']}")
    return ConfigCheckResponse(
        api_key_configured=key_info["configured"],
        api_key_status=key_info["status"],
        var_name=key_info["var_name"],
        backend_env_loaded=True,
        variable_found=key_info.get("variable_found", False),
        source=key_info.get("source", "unknown"),
        note="API key string is strictly concealed for security."
    )



