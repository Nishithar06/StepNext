import uuid
from typing import List, Optional, Dict, Any
from app.config import get_supabase_client
from app.store import SIMULATIONS_STORE
from app.schemas.models import (
    UserProfile,
    ScenarioInput,
    SimulationRequest,
    ScenarioResult,
    Recommendation,
    SimulationResponse
)
from app.services.ai import explain_scenarios_ai
from app.services.overload import get_overload_score
from app.services.digital_twin import get_digital_twin

def evaluate_scenario_deterministic(
    profile: UserProfile,
    scenario: ScenarioInput,
    overload_score_val: int,
    selected_scenario_name: Optional[str] = None
) -> ScenarioResult:
    """Evaluates a single scenario using transparent, scenario-specific deterministic rules."""
    name_lower = scenario.name.lower()
    desc_lower = scenario.description.lower()
    focus_lower = [f.lower() for f in scenario.focus_areas]
    
    # Extract investment sliders payload if available, or parse from focus_areas or fallback to weekly_hours
    investments = dict(scenario.investments or {})
    if (not investments or sum(investments.values()) == 0) and scenario.focus_areas:
        import re
        for f in scenario.focus_areas:
            f_lower = f.lower()
            m = re.search(r'(\d+(?:\.\d+)?)\s*h(?:ours?)?/wk', f_lower)
            hrs = float(m.group(1)) if m else 0.0
            if "dsa" in f_lower:
                investments["dsa_prep"] = max(investments.get("dsa_prep", 0.0), hrs or 8.0)
            elif "portfolio" in f_lower or "project" in f_lower:
                investments["portfolio_projects"] = max(investments.get("portfolio_projects", 0.0), hrs or 6.0)
            elif "system" in f_lower or "design" in f_lower:
                investments["system_design"] = max(investments.get("system_design", 0.0), hrs or 4.0)
            elif "exam" in f_lower or "gre" in f_lower or "gate" in f_lower:
                investments["exam_prep"] = max(investments.get("exam_prep", 0.0), hrs or 8.0)
            elif "research" in f_lower or "paper" in f_lower:
                investments["research_papers"] = max(investments.get("research_papers", 0.0), hrs or 6.0)
            elif "sop" in f_lower or "app" in f_lower:
                investments["sop_applications"] = max(investments.get("sop_applications", 0.0), hrs or 4.0)
            elif "product" in f_lower or "dev" in f_lower or "mvp" in f_lower:
                investments["product_development"] = max(investments.get("product_development", 0.0), hrs or 8.0)
            elif "market" in f_lower or "discovery" in f_lower or "customer" in f_lower:
                investments["market_discovery"] = max(investments.get("market_discovery", 0.0), hrs or 6.0)
            elif "pitch" in f_lower or "network" in f_lower or "deck" in f_lower:
                investments["pitching_networking"] = max(investments.get("pitching_networking", 0.0), hrs or 4.0)

    total_investment_hours = float(scenario.weekly_hours)
    if investments and sum(investments.values()) > 0:
        total_investment_hours = float(sum(investments.values()))

    # Diagnostic logging per requirement
    if "startup" in name_lower:
        pd = investments.get("product_development", 0.0)
        md = investments.get("market_discovery", 0.0)
        pn = investments.get("pitching_networking", 0.0)
        
        print("[Simulator] SCENARIO_INPUT:")
        print(f"name={scenario.name}")
        print(f"product_development={int(pd)}")
        print(f"market_discovery={int(md)}")
        print(f"pitching_networking={int(pn)}")
        print(f"total_investment_hours={int(total_investment_hours)}")

        print("[Simulator] SCORING_INPUT:")
        print(f"name={scenario.name}")
        print(f"product_development={int(pd)}")
        print(f"market_discovery={int(md)}")
        print(f"pitching_networking={int(pn)}")
        print(f"total_investment_hours={int(total_investment_hours)}")

    elif "higher" in name_lower or "study" in name_lower:
        ep = investments.get("exam_prep", 0.0)
        rp = investments.get("research_papers", 0.0)
        sa = investments.get("sop_applications", 0.0)

        print("[Simulator] SCENARIO_INPUT:")
        print(f"name={scenario.name}")
        print(f"exam_prep={int(ep)}")
        print(f"research_papers={int(rp)}")
        print(f"sop_applications={int(sa)}")
        print(f"total_investment_hours={int(total_investment_hours)}")

        print("[Simulator] SCORING_INPUT:")
        print(f"name={scenario.name}")
        print(f"exam_prep={int(ep)}")
        print(f"research_papers={int(rp)}")
        print(f"sop_applications={int(sa)}")
        print(f"total_investment_hours={int(total_investment_hours)}")

    else: # Placement
        dsa = investments.get("dsa_prep", 0.0)
        proj = investments.get("portfolio_projects", 0.0)
        sys_des = investments.get("system_design", 0.0)

        print("[Simulator] SCENARIO_INPUT:")
        print(f"name={scenario.name}")
        print(f"dsa_prep={int(dsa)}")
        print(f"portfolio_projects={int(proj)}")
        print(f"system_design={int(sys_des)}")
        print(f"total_investment_hours={int(total_investment_hours)}")

        print("[Simulator] SCORING_INPUT:")
        print(f"name={scenario.name}")
        print(f"dsa_prep={int(dsa)}")
        print(f"portfolio_projects={int(proj)}")
        print(f"system_design={int(sys_des)}")
        print(f"total_investment_hours={int(total_investment_hours)}")

    cg = (profile.career_goal or "").lower()
    ed = (profile.education or "").lower()
    stg = (profile.short_term_goal or "").lower()

    # 1. GOAL ALIGNMENT
    goal_alignment = 65

    if "higher" in name_lower or "study" in name_lower or "m.sc" in name_lower or "m.tech" in name_lower or "mba" in name_lower or "ma" in name_lower or "post-graduate" in name_lower:
        if ed:
            goal_alignment += 14
        if any(term in cg for term in ["research", "scientist", "academic", "phd", "ms", "master", "higher", "study", "specialist"]):
            goal_alignment += 10
        if profile.financial_priority <= 5:
            goal_alignment += 6
        
        ep_hrs = investments.get("exam_prep", 0.0)
        rp_hrs = investments.get("research_papers", 0.0)
        sa_hrs = investments.get("sop_applications", 0.0)
        hs_alignment_bonus = min(24, int(rp_hrs * 1.0 + ep_hrs * 0.7 + sa_hrs * 0.8))
        goal_alignment += hs_alignment_bonus

    elif "startup" in name_lower or "venture" in name_lower:
        if any(term in cg or term in stg for term in ["founder", "startup", "venture", "build", "business", "entrepreneur"]):
            goal_alignment += 18
        if any(sk.lower() in ["product", "full stack", "react", "python", "ai"] for sk in profile.skills):
            goal_alignment += 8

        md_hrs = investments.get("market_discovery", 0.0)
        pd_hrs = investments.get("product_development", 0.0)
        pn_hrs = investments.get("pitching_networking", 0.0)
        startup_alignment_bonus = min(22, int(md_hrs * 1.2 + pd_hrs * 0.6 + pn_hrs * 0.5))
        goal_alignment += startup_alignment_bonus

    else: # Placement / Career Execution
        if (
            any(term in cg for term in ["software", "developer", "engineer", "placement", "corporate", "job", "full stack", "lead"])
            or "career execution" in name_lower
            or any(word in name_lower for word in cg.split() if len(word) > 3)
        ):
            goal_alignment += 18
        if profile.financial_priority >= 6:
            goal_alignment += 10

        dsa_hrs = investments.get("dsa_prep", 0.0)
        proj_hrs = investments.get("portfolio_projects", 0.0)
        sys_hrs = investments.get("system_design", 0.0)
        place_alignment_bonus = min(22, int(dsa_hrs * 0.8 + proj_hrs * 0.7 + sys_hrs * 0.5))
        goal_alignment += place_alignment_bonus

    goal_alignment = min(98, max(40, goal_alignment))

    # 2. SKILL GROWTH
    skill_growth = 60
    if profile.skills_to_improve:
        matches = sum(1 for target in profile.skills_to_improve if any(target.lower() in f for f in focus_lower))
        skill_growth += min(15, matches * 8)
    
    if "higher" in name_lower or "study" in name_lower:
        ep_hrs = investments.get("exam_prep", 0.0)
        rp_hrs = investments.get("research_papers", 0.0)
        sa_hrs = investments.get("sop_applications", 0.0)
        skill_growth_bonus = min(28, int(rp_hrs * 1.3 + ep_hrs * 0.5 + sa_hrs * 0.2))
    elif "startup" in name_lower or "venture" in name_lower:
        pd_hrs = investments.get("product_development", 0.0)
        md_hrs = investments.get("market_discovery", 0.0)
        pn_hrs = investments.get("pitching_networking", 0.0)
        skill_growth_bonus = min(28, int(pd_hrs * 0.9 + pn_hrs * 0.8 + md_hrs * 0.6))
    else: # Placement
        dsa_hrs = investments.get("dsa_prep", 0.0)
        proj_hrs = investments.get("portfolio_projects", 0.0)
        sys_hrs = investments.get("system_design", 0.0)
        skill_growth_bonus = min(28, int(proj_hrs * 1.1 + dsa_hrs * 0.8 + sys_hrs * 0.7))
    
    skill_growth += skill_growth_bonus
    skill_growth = min(98, max(45, skill_growth))

    # 3. FINANCIAL OUTLOOK
    if "higher" in name_lower or "study" in name_lower:
        rp_hrs = investments.get("research_papers", 0.0)
        ep_hrs = investments.get("exam_prep", 0.0)
        base_fin = 65 + (10 - profile.financial_priority) * 1.2
        fin_bonus = min(16, int(rp_hrs * 1.2 + ep_hrs * 0.4))
        financial_outlook = int(base_fin + fin_bonus)
    elif "startup" in name_lower or "venture" in name_lower:
        pn_hrs = investments.get("pitching_networking", 0.0)
        md_hrs = investments.get("market_discovery", 0.0)
        pd_hrs = investments.get("product_development", 0.0)
        fin_bonus = min(25, int(pn_hrs * 1.8 + md_hrs * 0.9 + pd_hrs * 0.2) + (5 if profile.financial_priority <= 5 else 0))
        financial_outlook = 65 + fin_bonus
    else: # Placement
        sys_hrs = investments.get("system_design", 0.0)
        proj_hrs = investments.get("portfolio_projects", 0.0)
        dsa_hrs = investments.get("dsa_prep", 0.0)
        fin_bonus = min(15, int(sys_hrs * 1.2 + proj_hrs * 0.6 + dsa_hrs * 0.2))
        financial_outlook = 75 + min(10, profile.financial_priority) + fin_bonus
    
    financial_outlook = min(95, max(35, financial_outlook))

    # 4. LEARNING POTENTIAL
    if "higher" in name_lower or "study" in name_lower:
        rp_hrs = investments.get("research_papers", 0.0)
        ep_hrs = investments.get("exam_prep", 0.0)
        sa_hrs = investments.get("sop_applications", 0.0)
        learning_potential = 82 + min(16, int(rp_hrs * 1.1 + ep_hrs * 0.5 + sa_hrs * 0.2))
    elif "startup" in name_lower or "venture" in name_lower:
        md_hrs = investments.get("market_discovery", 0.0)
        pd_hrs = investments.get("product_development", 0.0)
        pn_hrs = investments.get("pitching_networking", 0.0)
        learning_potential = 80 + min(18, int(md_hrs * 0.9 + pd_hrs * 0.6 + pn_hrs * 0.4))
    else: # Placement
        proj_hrs = investments.get("portfolio_projects", 0.0)
        sys_hrs = investments.get("system_design", 0.0)
        dsa_hrs = investments.get("dsa_prep", 0.0)
        learning_potential = 75 + min(20, int(proj_hrs * 0.9 + sys_hrs * 0.8 + dsa_hrs * 0.4))
    
    learning_potential = min(98, max(50, learning_potential))

    # 5. WORKLOAD / RISK CALCULATION (APPLIED AFTER POSITIVE INVESTMENT EFFECTS)
    max_avail_weekly = max(1.0, profile.available_hours_per_day * 7.0)
    hours_risk = int((total_investment_hours / max_avail_weekly) * 25.0)
    
    # Non-linear workload risk penalty for excessive hours beyond sustainable capacity
    excess_risk = 0
    over_capacity_threshold = max(36.0, max_avail_weekly * 0.75)
    if total_investment_hours > over_capacity_threshold:
        excess_hrs = total_investment_hours - over_capacity_threshold
        excess_risk = int((excess_hrs ** 1.1) * 1.5)
        
    overload_penalty = int(overload_score_val * 0.25)
    risk = min(95, max(15, 15 + hours_risk + excess_risk + overload_penalty))

    # 6. OVERALL SCORE CALCULATION (WORKLOAD PENALTY DEDUCTED AFTER POSITIVE DIMENSIONS)
    positive_score = (
        (0.35 * goal_alignment) +
        (0.25 * skill_growth) +
        (0.20 * financial_outlook) +
        (0.20 * learning_potential)
    )
    overall = positive_score - (0.15 * risk)
    overall_score = min(99, max(35, int(round(overall))))

    # Logging scoring result as per requirement 8
    print("[Simulator] SCORING_RESULT:")
    print(f"scenario={scenario.name}")
    print(f"goal_alignment={goal_alignment}")
    print(f"skill_growth={skill_growth}")
    print(f"financial_outlook={financial_outlook}")
    print(f"learning_potential={learning_potential}")
    from app.services.higher_studies_resolver import resolve_higher_studies_path

    if any(k in name_lower for k in ["higher", "study", "m.sc", "m.tech", "m.e.", "ms", "mba", "m.com", "m.a.", "mca", "postgraduate", "master"]):
        hs_res = resolve_higher_studies_path(profile)
        explanation = (
            f"{scenario.name} yields an overall alignment score of {overall_score}/100. "
            f"This academic path is based directly on your current {profile.education or 'undergraduate'} background. "
            f"{hs_res['reasoning']}"
        )
    else:
        explanation = (
            f"{scenario.name} yields an overall score of {overall_score}/100. "
            f"Goal alignment is {goal_alignment}%, skill growth potential is {skill_growth}%, "
            f"learning potential is {learning_potential}%, and estimated financial outlook is {financial_outlook}%."
        )

    return ScenarioResult(
        name=scenario.name,
        goal_alignment=goal_alignment,
        skill_growth=skill_growth,
        financial_outlook=financial_outlook,
        learning_potential=learning_potential,
        risk=risk,
        overall_score=overall_score,
        explanation=explanation
    )

def build_deterministic_recommendation(
    profile: UserProfile,
    scenarios: List[ScenarioInput],
    results: List[ScenarioResult],
    selected_scenario_name: Optional[str] = None
) -> Recommendation:
    """Fallback deterministic recommendation engine selecting strictly highest overall score or user-selected scenario."""
    sorted_results = sorted(results, key=lambda r: r.overall_score, reverse=True)
    top_score_res = sorted_results[0]
    chosen = top_score_res
    
    if selected_scenario_name:
        matching = [r for r in results if selected_scenario_name.lower() in r.name.lower() or r.name.lower() in selected_scenario_name.lower()]
        if matching and matching[0].overall_score >= (top_score_res.overall_score - 15):
            chosen = matching[0]
    
    reason = (
        f"{chosen.name} is recommended as your primary path with an overall alignment score of {chosen.overall_score}/100, "
        f"matching your career goal of '{profile.career_goal or 'career growth'}' and financial priority ({profile.financial_priority}/10)."
    )

    tradeoffs = [
        f"Executing {chosen.name} requires dedicated focus on target skill building.",
    ]
    if len(sorted_results) > 1:
        tradeoffs.append(f"Alternative path {sorted_results[1].name} scores {sorted_results[1].overall_score}/100.")

    next_steps = [
        f"Set up weekly focus schedule for {chosen.name} preparation.",
        f"Focus execution on key growth areas: {', '.join(profile.skills_to_improve[:2]) if profile.skills_to_improve else 'Core fundamentals'}.",
        "Track weekly progress and adjust workload to prevent schedule overload."
    ]

    return Recommendation(
        recommended_scenario=chosen.name,
        reason=reason,
        tradeoffs=tradeoffs,
        next_steps=next_steps,
        engine_used="deterministic_fallback"
    )

def run_simulation(user_id: str, profile: UserProfile, request: SimulationRequest) -> SimulationResponse:
    """Executes future simulation over scenarios, persists in Supabase, returns response."""
    overload_obj = get_overload_score(user_id)
    selected_name = request.selected_scenario
    
    # 1. Deterministic calculation for all scenarios
    results: List[ScenarioResult] = []
    for sc in request.scenarios:
        res = evaluate_scenario_deterministic(profile, sc, overload_obj.total_score, selected_name)
        results.append(res)

    # 2. Recommendation (AI or Deterministic fallback)
    rec = explain_scenarios_ai(
        profile,
        [s.model_dump() for s in request.scenarios],
        [r.model_dump() for r in results],
        selected_name
    )
    if not rec:
        rec = build_deterministic_recommendation(profile, request.scenarios, results, selected_name)

    score_map_str = " ".join([f"{r.name}={r.overall_score}" for r in results])
    print(f"[Simulator] FINAL_SCORES: {score_map_str}")
    print(f"[Simulator] RECOMMENDED_SCENARIO: {rec.recommended_scenario}")
    is_valid = rec.recommended_scenario is not None and len(results) > 0
    print(f"[Simulator] RECOMMENDATION_VALIDATED: {'true' if is_valid else 'false'}")

    comparison_id = str(uuid.uuid4())

    sim_response = SimulationResponse(
        id=comparison_id,
        user_id=user_id,
        scenarios=request.scenarios,
        results=results,
        recommendation=rec
    )

    # Save in memory
    SIMULATIONS_STORE[user_id] = sim_response

    # Auto-generate goal-grounded roadmap for active user profile & winning scenario
    try:
        from app.services.roadmap import generate_roadmap_deterministic
        generate_roadmap_deterministic(user_id, profile, sim_response)
    except Exception as e:
        print(f"[Simulator Service] Error auto-generating roadmap on simulation: {e}")

    # 3. Persist in Supabase if available
    client = get_supabase_client()
    if client:
        try:
            row = {
                "id": comparison_id,
                "user_id": user_id,
                "scenarios": [s.model_dump() for s in request.scenarios],
                "comparison_results": [r.model_dump() for r in results],
                "recommendation": rec.model_dump()
            }
            client.table("scenario_comparisons").insert(row).execute()
        except Exception as e:
            print(f"[Simulator Service] Supabase insert error: {e}")

    return sim_response


def get_latest_scenarios(user_id: str) -> Optional[SimulationResponse]:
    """Retrieves user's latest scenario comparison from Supabase or memory store."""
    client = get_supabase_client()
    if client:
        try:
            res = client.table("scenario_comparisons") \
                .select("*") \
                .eq("user_id", user_id) \
                .order("created_at", desc=True) \
                .limit(1) \
                .execute()
            if res.data and len(res.data) > 0:
                data = res.data[0]
                return SimulationResponse(
                    id=str(data["id"]),
                    user_id=data["user_id"],
                    scenarios=[ScenarioInput(**s) for s in data["scenarios"]],
                    results=[ScenarioResult(**r) for r in data["comparison_results"]],
                    recommendation=Recommendation(**data["recommendation"])
                )
        except Exception as e:
            print(f"[Simulator Service] Supabase query error: {e}")

    # Return in-memory store if available
    if user_id in SIMULATIONS_STORE:
        return SIMULATIONS_STORE[user_id]

    return None

def get_scenario_by_id(user_id: str, comparison_id: str) -> Optional[SimulationResponse]:
    """Retrieves specific scenario comparison by ID from Supabase or fixture."""
    client = get_supabase_client()
    if client:
        try:
            res = client.table("scenario_comparisons") \
                .select("*") \
                .eq("id", comparison_id) \
                .execute()
            if res.data and len(res.data) > 0:
                data = res.data[0]
                return SimulationResponse(
                    id=str(data["id"]),
                    user_id=data["user_id"],
                    scenarios=[ScenarioInput(**s) for s in data["scenarios"]],
                    results=[ScenarioResult(**r) for r in data["comparison_results"]],
                    recommendation=Recommendation(**data["recommendation"])
                )
        except Exception as e:
            print(f"[Simulator Service] Supabase single query error: {e}")

    latest = get_latest_scenarios(user_id)
    if latest and (latest.id == comparison_id or comparison_id == "latest"):
        return latest
    return None

def build_default_personalized_simulation(user_id: str, profile: UserProfile) -> SimulationResponse:
    """Dynamically constructs personalized default simulation for user profile when store is empty."""
    from app.services.career_context import get_personalized_career_context
    ctx = get_personalized_career_context(profile)

    placement_sc = ScenarioInput(
        name=ctx.get("sc1_name", "Career Execution"),
        description=ctx.get("sc1_desc", ctx["path1_description"]),
        weekly_hours=18.0,
        focus_areas=ctx.get("sc1_focus", [
            f"{ctx['slider1']['label']} (8h/wk)",
            f"{ctx['slider2']['label']} (2/mo)",
            f"{ctx['slider3']['label']} (4h/wk)"
        ]),
        investments={"dsa_prep": 8.0, "portfolio_projects": 6.0, "system_design": 4.0}
    )

    hs_sc = ScenarioInput(
        name=ctx.get("sc2_name", "Specialization & Research"),
        description=ctx.get("sc2_desc", "Prioritize domain research, advanced study, and specialized credentials."),
        weekly_hours=20.0,
        focus_areas=ctx.get("sc2_focus", ["Exam Prep (10h/wk)", "Research (6h/wk)", "SOP & Applications (4h/wk)"]),
        investments={"exam_prep": 10.0, "research_papers": 6.0, "sop_applications": 4.0}
    )

    startup_sc = ScenarioInput(
        name=ctx.get("sc3_name", "Independent Venture"),
        description=ctx.get("sc3_desc", "Prioritize business development, client acquisition, and venture building."),
        weekly_hours=20.0,
        focus_areas=ctx.get("sc3_focus", ["Product Dev (12h/wk)", "Market Research (5h/wk)", "Pitching (3h/wk)"]),
        investments={"product_development": 12.0, "market_discovery": 5.0, "pitching_networking": 3.0}
    )

    overload_score = get_overload_score(user_id)
    overload_val = overload_score.total_score if overload_score else 20

    res_placement = evaluate_scenario_deterministic(profile, placement_sc, overload_val)
    res_hs = evaluate_scenario_deterministic(profile, hs_sc, overload_val)
    res_startup = evaluate_scenario_deterministic(profile, startup_sc, overload_val)

    results = [res_placement, res_hs, res_startup]
    winning_result = max(results, key=lambda r: r.overall_score)

    rec = Recommendation(
        recommended_scenario=winning_result.name,
        reason=f"Highest overall score ({winning_result.overall_score}/100) aligned with your trajectory as a {ctx['profession_title']}.",
        score_gap=0,
        engine_used="deterministic_rules"
    )

    sim_res = SimulationResponse(
        id=f"sim_default_{user_id}",
        user_id=user_id,
        scenarios=[placement_sc, hs_sc, startup_sc],
        results=results,
        recommendation=rec
    )

    SIMULATIONS_STORE[user_id] = sim_res
    print(f"[Personalization] CAREER={ctx['profession_title']}")
    print(f"[Personalization] SCENARIOS_GENERATED=3")
    print(f"[Personalization] LEADING_PATH={winning_result.name}")
    print(f"[Simulator] DEFAULT_SIMULATION_CONSTRUCTED: user_id={user_id} profession={ctx['profession_title']}")
    return sim_res
