import os
import json
from pathlib import Path
from dotenv import load_dotenv, dotenv_values

def _is_placeholder_key(val: str) -> bool:
    if not val:
        return True
    v = val.lower().strip().strip("'\"").strip()
    if v in ["", "placeholder", "your-gemini-api-key", "your-api-key", "your_gemini_api_key", "your_api_key", "your_actual_key"]:
        return True
    if v.startswith("your-gemini") or v.startswith("your-api") or v.startswith("<your"):
        return True
    return False

def _load_gemini_config() -> dict:
    app_dir = Path(__file__).resolve().parent
    backend_dir = app_dir.parent
    root_dir = backend_dir.parent
    cwd_dir = Path.cwd()

    candidate_files = [
        ("backend/.env", (backend_dir / ".env").resolve()),
        ("cwd/backend/.env", (cwd_dir / "backend" / ".env").resolve()),
        ("cwd/.env", (cwd_dir / ".env").resolve()),
        ("root .env", (root_dir / ".env").resolve()),
    ]

    var_names = ["GEMINI_API_KEY", "API_KEY", "GOOGLE_API_KEY"]

    found_key = ""
    found_var = "GEMINI_API_KEY"
    found_source = "none"
    found_path = ""

    # 1. Scan candidate files using direct file parsing (dotenv_values)
    for source_label, file_path in candidate_files:
        if file_path.exists():
            values = dotenv_values(dotenv_path=file_path)
            for var in var_names:
                val = values.get(var)
                if val is not None:
                    cleaned = str(val).split("#")[0].strip().strip("'\"").strip()
                    if cleaned:
                        if not found_key or (_is_placeholder_key(found_key) and not _is_placeholder_key(cleaned)):
                            found_key = cleaned
                            found_var = var
                            found_source = source_label
                            found_path = str(file_path)
                            os.environ[var] = cleaned
                            os.environ["GEMINI_API_KEY"] = cleaned

            # Load non-API env vars
            load_dotenv(dotenv_path=file_path, override=False)

    # 2. Check system environment variables if files didn't yield a valid key
    if not found_key or _is_placeholder_key(found_key):
        for var in var_names:
            sys_val = os.getenv(var, "")
            cleaned = sys_val.split("#")[0].strip().strip("'\"").strip()
            if cleaned:
                if not found_key or (_is_placeholder_key(found_key) and not _is_placeholder_key(cleaned)):
                    found_key = cleaned
                    found_var = var
                    found_source = "system environment"
                    found_path = "system environment"
                    os.environ["GEMINI_API_KEY"] = cleaned
                    break


    # Determine status
    if not found_key:
        status = "missing"
        configured = False
        key_present = False
    elif _is_placeholder_key(found_key):
        status = "placeholder"
        configured = False
        key_present = True
    else:
        status = "configured"
        configured = True
        key_present = True

    return {
        "key": found_key,
        "var_name": found_var,
        "source": found_source if found_source != "none" else "not_found",
        "path": found_path if found_path else "none",
        "status": status,
        "configured": configured,
        "variable_found": key_present,
    }

def get_gemini_config() -> dict:
    return _load_gemini_config()

def reload_gemini_config() -> dict:
    return _load_gemini_config()


SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
PORT = int(os.getenv("PORT", "8000"))

def get_gemini_api_key() -> str:
    return get_gemini_config()["key"]

def get_gemini_model() -> str:
    _load_gemini_config()
    model = os.getenv("GEMINI_MODEL") or os.getenv("GOOGLE_GEMINI_MODEL")
    if model and model.strip():
        return model.strip().split("#")[0].strip().strip("'\"")
    return "gemini-3.6-flash"


def is_gemini_available() -> bool:
    return get_gemini_config()["configured"]


def get_api_key_status() -> dict:
    cfg = get_gemini_config()
    return {
        "configured": cfg["configured"],
        "status": cfg["status"],
        "var_name": cfg["var_name"],
        "variable_found": cfg["variable_found"],
        "source": cfg["source"],
        "path": cfg["path"],
    }

_supabase_client = None

def get_supabase_client():
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client
    
    _load_gemini_config()
    url = (os.getenv("SUPABASE_URL") or SUPABASE_URL or "").strip()
    key = (os.getenv("SUPABASE_KEY") or SUPABASE_KEY or "").strip()
    
    if not url or not key or "your-supabase" in url or "your-supabase" in key:
        return None
        
    try:
        from supabase import create_client
        _supabase_client = create_client(url, key)
        return _supabase_client
    except Exception as e:
        print(f"[Config] Warning: Failed to initialize Supabase client: {e}")
        return None

def is_supabase_available() -> bool:
    client = get_supabase_client()
    return client is not None

# Fixture loader helper
FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"

def load_dummy_fixture() -> dict:
    fixture_path = FIXTURES_DIR / "dummy_profile.json"
    if fixture_path.exists():
        with open(fixture_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}




