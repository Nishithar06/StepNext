import json
import time
from typing import Optional, List, Dict, Any, Tuple
from app.config import get_gemini_api_key, get_gemini_model, is_gemini_available, get_api_key_status
from app.schemas.models import UserProfile, DerivedProfile, Recommendation

def get_gemini_client() -> Optional[Tuple[str, Any]]:
    if not is_gemini_available():
        return None
    api_key = get_gemini_api_key()
    
    # 1. Prefer modern google.genai SDK
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        return ("google.genai", client)
    except Exception as e1:
        # 2. Legacy google.generativeai SDK fallback
        try:
            import google.generativeai as genai_old
            genai_old.configure(api_key=api_key)
            return ("google.generativeai", genai_old)
        except Exception as e2:
            safe_err = f"google.genai error: {type(e1).__name__} ({e1}); google.generativeai error: {type(e2).__name__} ({e2})"
            if api_key and len(api_key) > 5 and api_key in safe_err:
                safe_err = safe_err.replace(api_key, "[REDACTED_API_KEY]")
            print(f"[AI Service] GEMINI_REQUEST_FAILED: context=Client Initialization reason={safe_err}")
            return None

def _handle_gemini_exception(e: Exception, context: str) -> None:
    """Safely log Gemini API errors without exposing sensitive API keys."""
    api_key = get_gemini_api_key()
    raw_err = f"{type(e).__name__}: {str(e)}"
    if api_key and len(api_key) > 5 and api_key in raw_err:
        safe_msg = raw_err.replace(api_key, "[REDACTED_API_KEY]")
    else:
        safe_msg = raw_err

    print(f"[AI Service] GEMINI_REQUEST_FAILED: context={context} reason={safe_msg}")
    print(f"[AI Service] GEMINI_FALLBACK_USED: context={context}")

def _call_generate_content(client_info: Tuple[str, Any], model_name: str, prompt: str) -> str:
    client_type, client = client_info
    if client_type == "google.genai":
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )
        return response.text
    else:
        model_obj = client.GenerativeModel(model_name)
        response = model_obj.generate_content(prompt)
        return response.text

def _call_generate_content_with_retry(
    client_info: Tuple[str, Any], 
    model_name: str, 
    prompt: str, 
    context: str,
    max_retries: int = 2
) -> Optional[str]:
    delays = [1.5, 3.5]
    
    for attempt in range(max_retries + 1):
        try:
            raw_text = _call_generate_content(client_info, model_name, prompt)
            if raw_text:
                return raw_text
        except Exception as ex:
            err_str = str(ex)
            err_lower = err_str.lower()
            is_503 = any(token in err_lower for token in ["503", "unavailable", "high demand", "overloaded", "spikes in demand", "temporarily", "server error", "service unavailable", "resource_exhausted"])
            
            if is_503 and attempt < max_retries:
                retry_count = attempt + 1
                reason_code = "503_UNAVAILABLE"
                print(f"[AI Service] GEMINI_RETRY: context={context} attempt={retry_count} reason={reason_code}")
                time.sleep(delays[attempt])
                continue
            else:
                if is_503 and attempt == max_retries:
                    print(f"[AI Service] GEMINI_FALLBACK_USED: context={context} reason=temporary Gemini 503 after retries")
                else:
                    _handle_gemini_exception(ex, context)
                return None

    return None

def generate_digital_twin_ai(profile: UserProfile) -> Optional[DerivedProfile]:
    status_info = get_api_key_status()
    configured = status_info["configured"]
    source_path = status_info.get("path", status_info.get("source", "unknown"))
    key_present_str = "true" if status_info.get("variable_found", False) else "false"
    
    print(f"[AI Service] CONFIG_SOURCE={source_path} GEMINI_KEY_PRESENT={key_present_str} GEMINI_KEY_STATUS={status_info['status']}")
    print(f"[AI Service] GEMINI_KEY_CHECK: configured={'true' if configured else 'false'}")

    if not configured:
        print("[AI Service] GEMINI_FALLBACK_USED: context=Digital Twin Generation reason=API key missing or placeholder")
        return None

    client_info = get_gemini_client()
    if not client_info:
        print("[AI Service] GEMINI_FALLBACK_USED: context=Digital Twin Generation reason=Failed to initialize Gemini client")
        return None

    selected_model = get_gemini_model()
    print(f"[AI Service] GEMINI_MODEL_SELECTED: model={selected_model}")
    print("[AI Service] GEMINI_REQUEST_STARTED: context=Digital Twin Generation")

    prompt = f"""
    You are an expert psychological & career profiler. Analyze the following user profile and return a JSON object ONLY matching this schema:

    Profile Data:
    - Name: {profile.name}
    - Education: {profile.education}
    - Career Goal: {profile.career_goal}
    - Interests: {', '.join(profile.interests)}
    - Current Skills: {', '.join(profile.skills)}
    - Target Skills: {', '.join(profile.skills_to_improve)}
    - Available Daily Hours: {profile.available_hours_per_day}
    - Sleep Hours: {profile.sleep_hours}
    - Workload: {profile.workload}
    - Financial Priority: {profile.financial_priority}/10
    - Short-term Goal: {profile.short_term_goal}

    Return JSON strictly with format:
    {{
      "personality": "...",
      "strengths": ["...", "..."],
      "weaknesses": ["...", "..."],
      "motivations": ["...", "..."],
      "learning_style": "...",
      "risk_factors": ["...", "..."],
      "career_alignment": "..."
    }}
    """

    raw_text = _call_generate_content_with_retry(client_info, selected_model, prompt, "Digital Twin Generation")

    if not raw_text:
        return None

    try:
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_text:
            raw_text = raw_text.split("```")[1].split("```")[0].strip()

        data = json.loads(raw_text)
        print("[AI Service] GEMINI_REQUEST_SUCCESS: context=Digital Twin Generation")
        return DerivedProfile(
            user_id=profile.user_id,
            personality=data.get("personality", "Analytical and goal-oriented."),
            strengths=data.get("strengths", []),
            weaknesses=data.get("weaknesses", []),
            motivations=data.get("motivations", []),
            learning_style=data.get("learning_style", "Hands-on implementation."),
            risk_factors=data.get("risk_factors", []),
            career_alignment=data.get("career_alignment", "Strong alignment with tech goals."),
            engine_used=selected_model
        )
    except Exception as e:
        _handle_gemini_exception(e, "Digital Twin Generation JSON Parsing")
        return None

def explain_scenarios_ai(
    profile: UserProfile,
    scenarios: List[dict],
    results: List[dict],
    selected_scenario_name: Optional[str] = None
) -> Optional[Recommendation]:
    status_info = get_api_key_status()
    configured = status_info["configured"]
    source_path = status_info.get("path", status_info.get("source", "unknown"))
    key_present_str = "true" if status_info.get("variable_found", False) else "false"
    
    print(f"[AI Service] CONFIG_SOURCE={source_path} GEMINI_KEY_PRESENT={key_present_str} GEMINI_KEY_STATUS={status_info['status']}")
    print(f"[AI Service] GEMINI_KEY_CHECK: configured={'true' if configured else 'false'}")

    if not configured:
        print("[AI Service] GEMINI_FALLBACK_USED: context=Scenario Recommendation reason=API key missing or placeholder")
        return None

    client_info = get_gemini_client()
    if not client_info:
        print("[AI Service] GEMINI_FALLBACK_USED: context=Scenario Recommendation reason=Failed to initialize Gemini client")
        return None

    selected_model = get_gemini_model()
    print(f"[AI Service] GEMINI_MODEL_SELECTED: model={selected_model}")
    print("[AI Service] GEMINI_REQUEST_STARTED: context=Scenario Recommendation")

    sorted_res = sorted(results, key=lambda r: r.get("overall_score", 0), reverse=True)
    top_score_res = sorted_res[0] if sorted_res else {}
    target_name = top_score_res.get("name", "Placement")
    top_score_val = top_score_res.get("overall_score", 0)

    prompt = f"""
    Analyze these evaluated future scenarios for user '{profile.name}':

    User Career Goal: {profile.career_goal}
    Education: {profile.education}
    Financial Priority: {profile.financial_priority}/10
    Short-term Goal: {profile.short_term_goal}

    Evaluated Scenarios:
    {json.dumps(results, indent=2)}

    CRITICAL INSTRUCTION: The deterministic scoring engine evaluated '{target_name}' as the top scenario with the highest overall score of {top_score_val}/100.
    You MUST recommend '{target_name}' as recommended_scenario. Do not override or select any lower-scoring scenario.

    Generate a recommendation JSON with exact schema:
    {{
      "recommended_scenario": "{target_name}",
      "reason": "Clear concise reason why this path best fits user goals and score profile",
      "tradeoffs": ["Tradeoff 1", "Tradeoff 2"],
      "next_steps": ["Action step 1", "Action step 2", "Action step 3"]
    }}
    """

    raw_text = _call_generate_content_with_retry(client_info, selected_model, prompt, "Scenario Recommendation")

    if not raw_text:
        return None

    try:
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_text:
            raw_text = raw_text.split("```")[1].split("```")[0].strip()

        data = json.loads(raw_text)
        print("[AI Service] GEMINI_REQUEST_SUCCESS: context=Scenario Recommendation")
        return Recommendation(
            recommended_scenario=target_name,
            reason=data.get("reason", f"{target_name} achieved the highest overall alignment score of {top_score_val}/100."),
            tradeoffs=data.get("tradeoffs", []),
            next_steps=data.get("next_steps", []),
            engine_used=selected_model
        )
    except Exception as e:
        _handle_gemini_exception(e, "Scenario Recommendation JSON Parsing")
        return None


