from typing import Optional
from app.config import get_supabase_client
from app.store import TWINS_STORE, PROFILES_STORE
from app.schemas.models import UserProfile, DerivedProfile
from app.services.ai import generate_digital_twin_ai

def build_deterministic_digital_twin(profile: UserProfile) -> DerivedProfile:
    """Generates a structured, deterministic Digital Twin from a UserProfile."""
    skills_str = ", ".join(profile.skills) if profile.skills else "Core analytical skills"
    target_skills_str = ", ".join(profile.skills_to_improve) if profile.skills_to_improve else "Advanced engineering"
    
    # Strengths based on profile
    strengths = [
        f"Solid foundation in {skills_str}",
        f"High dedication with {profile.available_hours_per_day} hours/day available work capacity",
        f"Clear direction towards: {profile.career_goal or 'Technical mastery'}"
    ]
    if profile.financial_priority >= 7:
        strengths.append("Strong financial awareness and pragmatism in goal selection")

    # Weaknesses
    weaknesses = [
        f"Skills gap to bridge in: {target_skills_str}",
    ]
    if profile.sleep_hours < 7.0:
        weaknesses.append(f"Sub-optimal sleep allocation ({profile.sleep_hours}h/day) risking fatigue")
    if profile.workload.lower() == "high":
        weaknesses.append("Potential focus dilution due to high existing workload")

    # Motivations
    motivations = [
        f"Achieving short-term milestone: {profile.short_term_goal or 'Career progression'}",
        f"Building technical expertise in {profile.interests[0] if profile.interests else 'Software'}",
        f"Financial security rating priority: {profile.financial_priority}/10"
    ]

    # Risk Factors
    risk_factors = []
    if profile.sleep_hours < 6.5:
        risk_factors.append("Chronic sleep deficit impacting cognitive peak performance")
    if len(profile.major_commitments) >= 3:
        risk_factors.append(f"High commitment density ({len(profile.major_commitments)} major active tracks)")
    if profile.workload.lower() == "high":
        risk_factors.append("High overall perceived stress level")
    if not risk_factors:
        risk_factors.append("Low immediate risk factors detected")

    personality = (
        f"Driven and structured practitioner with a strong emphasis on {profile.career_goal or 'growth'}. "
        f"Maintains a focus level of {profile.workload} workload intensity while managing {len(profile.major_commitments)} key commitments."
    )
    
    learning_style = "Project-centric hands-on learning with practical iteration loops."
    career_alignment = f"High alignment with {profile.career_goal or 'Software Engineering'} & technical leadership."

    return DerivedProfile(
        user_id=profile.user_id,
        personality=personality,
        strengths=strengths,
        weaknesses=weaknesses,
        motivations=motivations,
        learning_style=learning_style,
        risk_factors=risk_factors,
        career_alignment=career_alignment
    )

def generate_and_save_digital_twin(profile: UserProfile) -> DerivedProfile:
    """Generates Digital Twin using AI or deterministic engine, and persists if DB available."""
    twin = generate_digital_twin_ai(profile)
    if not twin:
        twin = build_deterministic_digital_twin(profile)

    # Save to in-memory store
    TWINS_STORE[profile.user_id] = twin

    # Persist in Supabase if available
    client = get_supabase_client()
    if client:
        try:
            row = {
                "user_id": twin.user_id,
                "personality": twin.personality,
                "strengths": twin.strengths,
                "weaknesses": twin.weaknesses,
                "motivations": twin.motivations,
                "learning_style": twin.learning_style,
                "risk_factors": twin.risk_factors,
                "career_alignment": twin.career_alignment
            }
            client.table("derived_profiles").upsert(row).execute()
        except Exception as e:
            print(f"[Digital Twin Service] Supabase upsert error (continuing with in-memory twin): {e}")

    return twin

def get_digital_twin(user_id: str) -> DerivedProfile:
    """Fetches existing Digital Twin from Supabase or returns derived twin."""
    client = get_supabase_client()
    if client:
        try:
            res = client.table("derived_profiles").select("*").eq("user_id", user_id).execute()
            if res.data and len(res.data) > 0:
                data = res.data[0]
                return DerivedProfile(
                    user_id=data["user_id"],
                    personality=data.get("personality", ""),
                    strengths=data.get("strengths", []),
                    weaknesses=data.get("weaknesses", []),
                    motivations=data.get("motivations", []),
                    learning_style=data.get("learning_style", ""),
                    risk_factors=data.get("risk_factors", []),
                    career_alignment=data.get("career_alignment", "")
                )
        except Exception as e:
            print(f"[Digital Twin Service] Supabase read error: {e}")

    # Return from in-memory store if available
    if user_id in TWINS_STORE:
        return TWINS_STORE[user_id]

    # Generate from profile if profile exists
    from app.routes.profile import fetch_profile_from_db_or_fixture
    current_profile = fetch_profile_from_db_or_fixture(user_id) or UserProfile(user_id=user_id)
    return generate_and_save_digital_twin(current_profile)

def update_digital_twin_execution_signal(user_id: str, completion_percentage: int, workload_feeling: str) -> None:
    """Updates Digital Twin's strengths or risk factors with observed real execution signals."""
    twin = get_digital_twin(user_id)
    if not twin:
        return

    signal_str = f"Observed execution velocity: {completion_percentage}% roadmap completion ({workload_feeling} pace)"
    
    if completion_percentage >= 70:
        if not any("Observed execution" in s for s in twin.strengths):
            twin.strengths.insert(0, signal_str)
    elif workload_feeling.lower() in ["heavy", "overwhelming"]:
        if not any("Observed execution" in r for r in twin.risk_factors):
            twin.risk_factors.insert(0, signal_str)

    TWINS_STORE[user_id] = twin
    print(f"[CheckIn] DIGITAL_TWIN_SIGNAL_SENT for user_id={user_id}")
