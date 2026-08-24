from typing import Optional, Dict, Any
from app.config import get_supabase_client
from app.store import OVERLOADS_STORE, PROFILES_STORE
from app.schemas.models import UserProfile, OverloadScore

def calculate_overload_score(profile: UserProfile) -> OverloadScore:
    """
    Transparent rule-based Overload Risk Engine.
    Evaluates sleep hours, workload level, commitment density, and recovery balance.
    Returns score (0-100), risk level, breakdown, contributing factors, explanation, recommendations.
    """
    breakdown: Dict[str, int] = {}
    contributing_factors = []
    recommendations = []

    # Check if recent daily check-in telemetry exists to inform overload risk
    sleep_hours = profile.sleep_hours
    try:
        from app.services.checkin import get_checkin_summary
        summary = get_checkin_summary(profile.user_id)
        if summary and summary.total_checkins > 0:
            # Use actual recent daily sleep average if available
            sleep_hours = summary.avg_sleep
            if summary.avg_stress >= 7.0:
                breakdown["recent_stress"] = 15
                contributing_factors.append(f"Recent daily check-ins reflect high stress levels (avg {summary.avg_stress}/10).")
                recommendations.append("Incorporate short mindfulness or recovery breaks into your workday.")
            if summary.avg_energy <= 4.0:
                breakdown["low_energy_fatigue"] = 10
                contributing_factors.append(f"Recent daily check-ins indicate low energy levels (avg {summary.avg_energy}/10).")
    except Exception as e:
        print(f"[Overload Service] Check-in summary integration check error: {e}")

    # Factor 1: Sleep Deficit (Max 35 points)
    # Optimal sleep threshold is set at 7.5 hours
    if sleep_hours < 7.5:
        sleep_pts = int(min(35, round((7.5 - sleep_hours) * 16.0)))
        breakdown["sleep_deficit"] = sleep_pts
        contributing_factors.append(
            f"Sleep duration ({sleep_hours:.1f}h/day) is below recommended 7.5-8.0 hour recovery window."
        )
        recommendations.append(
            f"Increase sleep target to at least {min(7.5, sleep_hours + 1.0):.1f} hours daily to improve cognitive recovery."
        )
    else:
        breakdown["sleep_deficit"] = 0

    # Factor 2: Self-reported Workload (Max 25 points)
    wl = profile.workload.lower()
    if wl == "high":
        workload_pts = 25
        contributing_factors.append("Current overall workload is rated as HIGH.")
        recommendations.append("Identify low-impact tasks that can be delegated or paused.")
    elif wl == "medium":
        workload_pts = 14
    else:
        workload_pts = 5
    breakdown["high_workload"] = workload_pts

    # Factor 3: Major Commitments Density (Max 25 points)
    total_commitment_hours = sum(c.hours_per_week for c in profile.major_commitments)
    if total_commitment_hours >= 35:
        commit_pts = 25
        contributing_factors.append(f"Major commitments total {total_commitment_hours} hrs/week, indicating heavy schedule congestion.")
        recommendations.append("Cap non-essential project hours to create a buffer for unexpected tasks.")
    elif total_commitment_hours >= 20:
        commit_pts = 15
        contributing_factors.append(f"Moderate weekly commitment burden ({total_commitment_hours} hrs/week).")
    else:
        commit_pts = 5
    breakdown["commitments_density"] = commit_pts

    # Factor 4: Available Daily Time Buffer (Max 15 points)
    if profile.available_hours_per_day < 5.0:
        buffer_pts = 15
        contributing_factors.append(f"Available daily work buffer is restricted ({profile.available_hours_per_day} hours/day).")
        recommendations.append("Protect dedicated focus time blocks against context switching.")
    elif profile.available_hours_per_day < 7.0:
        buffer_pts = 8
    else:
        buffer_pts = 0
    breakdown["recovery_shortage"] = buffer_pts

    # Total Score Calculation (Capped at 100)
    total_score = min(100, max(0, sum(breakdown.values())))

    # Risk Level mapping
    if total_score <= 30:
        risk_level = "Low"
        explanation = "Your schedule reflects Low Overload Risk. Current commitments and sleep allow for healthy recovery."
    elif total_score <= 60:
        risk_level = "Moderate"
        explanation = "Your schedule reflects Moderate Overload Risk. While manageable short-term, watch out for compounding sleep deficits."
    elif total_score <= 80:
        risk_level = "High"
        explanation = "Your schedule reflects High Overload Risk. Multiple heavy commitments and limited rest create elevated fatigue potential."
    else:
        risk_level = "Critical"
        explanation = "Your schedule reflects Critical Overload Risk. Immediate workload rebalancing and rest prioritized schedule adjustments recommended."

    if not recommendations:
        recommendations.append("Maintain your current balanced schedule and monitor sleep consistency.")

    return OverloadScore(
        user_id=profile.user_id,
        total_score=total_score,
        risk_level=risk_level,
        breakdown=breakdown,
        contributing_factors=contributing_factors,
        explanation=explanation,
        recommendations=recommendations
    )

def calculate_and_save_overload(profile: UserProfile) -> OverloadScore:
    """Calculates overload score and persists in Supabase if available."""
    score_obj = calculate_overload_score(profile)

    # Save to in-memory store
    OVERLOADS_STORE[profile.user_id] = score_obj

    client = get_supabase_client()
    if client:
        try:
            row = {
                "user_id": score_obj.user_id,
                "total_score": score_obj.total_score,
                "risk_level": score_obj.risk_level,
                "breakdown": score_obj.breakdown,
                "contributing_factors": score_obj.contributing_factors,
                "explanation": score_obj.explanation,
                "recommendations": score_obj.recommendations
            }
            client.table("overload_scores").upsert(row).execute()
        except Exception as e:
            print(f"[Overload Service] Supabase upsert error: {e}")

    return score_obj

def get_overload_score(user_id: str) -> OverloadScore:
    """Fetches overload score from Supabase or returns derived score."""
    client = get_supabase_client()
    if client:
        try:
            res = client.table("overload_scores").select("*").eq("user_id", user_id).execute()
            if res.data and len(res.data) > 0:
                data = res.data[0]
                return OverloadScore(
                    user_id=data["user_id"],
                    total_score=data["total_score"],
                    risk_level=data["risk_level"],
                    breakdown=data.get("breakdown", {}),
                    contributing_factors=data.get("contributing_factors", []),
                    explanation=data.get("explanation", ""),
                    recommendations=data.get("recommendations", [])
                )
        except Exception as e:
            print(f"[Overload Service] Supabase read error: {e}")

    # Return in-memory overload score if available
    if user_id in OVERLOADS_STORE:
        return OVERLOADS_STORE[user_id]

    current_profile = PROFILES_STORE.get(user_id, UserProfile(user_id=user_id))
    return calculate_and_save_overload(current_profile)
