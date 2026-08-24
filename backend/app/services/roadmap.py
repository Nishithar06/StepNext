import uuid
from datetime import datetime
from typing import Optional, List
from app.schemas.models import (
    UserProfile,
    SimulationResponse,
    ActionRoadmap,
    RoadmapItem,
    MilestoneGroup,
    MetricToTrack
)
from app.store import ROADMAPS_STORE, save_roadmaps_to_disk

def extract_goal_intelligence(profile: Optional[UserProfile]) -> dict:
    raw_goal = (profile.career_goal or profile.short_term_goal or "").strip() if profile else ""
    if not raw_goal:
        raw_goal = "Professional Specialist"

    # Normalize clean profession name by stripping standard intro phrases
    clean_goal = raw_goal
    lower_goal = clean_goal.lower()
    for prefix in [
        "become a ", "become an ", "become ",
        "work as a ", "work as an ", "work as ",
        "pursue a career as a ", "pursue a career as an ", "pursue ",
        "be a ", "be an ", "transition to "
    ]:
        if lower_goal.startswith(prefix):
            clean_goal = clean_goal[len(prefix):].strip()
            break
    
    profession_title = clean_goal.title() if clean_goal else "Professional Specialist"

    # Extract declared skills / target skills from profile
    skills = profile.skills if (profile and profile.skills) else []
    skills_to_improve = profile.skills_to_improve if (profile and profile.skills_to_improve) else []
    
    primary_skill = skills_to_improve[0] if skills_to_improve else (skills[0] if skills else f"{profession_title} Core Fundamentals")
    secondary_skill = skills_to_improve[1] if len(skills_to_improve) > 1 else (skills[1] if len(skills) > 1 else f"{profession_title} Practical Execution")

    return {
        "raw_goal": raw_goal,
        "profession_title": profession_title,
        "primary_skill": primary_skill,
        "secondary_skill": secondary_skill,
        "skills": skills,
        "skills_to_improve": skills_to_improve
    }

def generate_roadmap_deterministic(
    user_id: str,
    profile: Optional[UserProfile],
    simulation: SimulationResponse
) -> ActionRoadmap:
    print(f"[Roadmap] GENERATION_STARTED for user_id={user_id}")

    goal_info = extract_goal_intelligence(profile)
    prof_title = goal_info["profession_title"]
    p_skill = goal_info["primary_skill"]
    s_skill = goal_info["secondary_skill"]

    rec = simulation.recommendation
    winner_name = rec.recommended_scenario

    print(f"[Roadmap] SCENARIO_SELECTED: name={winner_name} profession={prof_title}")

    winning_result = next(
        (r for r in simulation.results if r.name.lower() in winner_name.lower() or winner_name.lower() in r.name.lower()),
        simulation.results[0]
    )
    winning_scenario = next(
        (s for s in simulation.scenarios if s.name.lower() in winner_name.lower() or winner_name.lower() in s.name.lower()),
        simulation.scenarios[0]
    )

    investments = winning_scenario.investments or {}
    print(f"[Roadmap] INVESTMENTS_RECEIVED: investments={investments}")

    risk_val = winning_result.risk
    overall = winning_result.overall_score

    workload_caution = None
    if risk_val > 70:
        workload_caution = f"Your current allocation ({winning_scenario.weekly_hours} hrs/wk) is ambitious. Prioritize top 2 high-impact activities for {prof_title} to prevent burnout."
    elif risk_val > 50:
        workload_caution = f"Schedule caution: Monitor weekly hours ({winning_scenario.weekly_hours} hrs/wk) for steady {prof_title} execution."

    weekly_actions: List[RoadmapItem] = []
    top_priorities: List[RoadmapItem] = []
    milestones: List[MilestoneGroup] = []
    metrics_to_track: List[MetricToTrack] = []

    scenario_key = winner_name.lower()

    if "study" in scenario_key or "higher" in scenario_key or "specialization" in scenario_key:
        hrs_1 = int(investments.get("exam_prep", 10))
        hrs_2 = int(investments.get("research_papers", 6))
        hrs_3 = int(investments.get("sop_applications", 4))

        weekly_actions = [
            RoadmapItem(
                id=str(uuid.uuid4()),
                title=f"Advanced {prof_title} Specialization & Technique",
                description=f"Complete practice units and deep technique training in {p_skill} for {hrs_1} hrs/week.",
                category="SKILL",
                target=f"{hrs_1} hrs/week",
                status="not_started",
                priority="High"
            ),
            RoadmapItem(
                id=str(uuid.uuid4()),
                title=f"{prof_title} Domain Research & Field Practice",
                description=f"Conduct field research, case studies, or domain papers on {s_skill} for {hrs_2} hrs/week.",
                category="RESEARCH",
                target=f"{hrs_2} hrs/week",
                status="not_started",
                priority="High"
            ),
            RoadmapItem(
                id=str(uuid.uuid4()),
                title=f"Professional Credentials & Grant Prep for {prof_title}",
                description=f"Refine professional portfolio & gather recommendations/credentials for {hrs_3} hrs/week.",
                category="APPLICATION",
                target=f"{hrs_3} hrs/week",
                status="not_started",
                priority="Medium"
            )
        ]

        top_priorities = [
            RoadmapItem(id=str(uuid.uuid4()), title=f"{prof_title} Domain Mastery", description=f"Achieve specialist competence in {p_skill}", category="SKILL", target="Specialist Level", status="in_progress", priority="High"),
            RoadmapItem(id=str(uuid.uuid4()), title=f"{prof_title} Research Publication", description=f"Draft specialist paper or case study on {s_skill}", category="RESEARCH", target="1 Publication Draft", status="not_started", priority="High"),
            RoadmapItem(id=str(uuid.uuid4()), title="Professional Certification / Grant", description=f"Finalize applications for advanced {prof_title} credentials", category="APPLICATION", target="Credentials Ready", status="not_started", priority="Medium")
        ]

        milestones = [
            MilestoneGroup(timeframe="30 DAYS", title=f"{prof_title} Specialization Foundations", items=[f"Complete core units in {p_skill}", "Take 2 field evaluations", f"Outline domain paper on {s_skill}"]),
            MilestoneGroup(timeframe="60 DAYS", title=f"Research & Case Study Draft for {prof_title}", items=[f"Draft literature/case study in {s_skill}", "Finalize professional statement", "Secure 2 recommendation commitments"]),
            MilestoneGroup(timeframe="90 DAYS", title=f"{prof_title} Advanced Certification & Launch", items=[f"Submit applications for advanced {prof_title} programs/grants", "Complete final evaluations", "Finalize professional portfolio"])
        ]

        metrics_to_track = [
            MetricToTrack(name=f"{p_skill} Practice Hours", current="0", target=f"{max(20, hrs_1 * 4)}"),
            MetricToTrack(name="Research & Case Study Pages", current="0", target=f"{max(5, hrs_2 * 2)}"),
            MetricToTrack(name="Portfolio Revisions", current="0", target="4"),
            MetricToTrack(name="Target Programs / Grants", current="0", target="5")
        ]

    elif "startup" in scenario_key or "venture" in scenario_key:
        hrs_1 = int(investments.get("product_development", 12))
        hrs_2 = int(investments.get("market_discovery", 5))
        hrs_3 = int(investments.get("pitching_networking", 3))

        weekly_actions = [
            RoadmapItem(
                id=str(uuid.uuid4()),
                title=f"{prof_title} Venture MVP & Service Deliverables",
                description=f"Build core service offerings & test client workflows in {p_skill} for {hrs_1} hrs/week.",
                category="PROJECT",
                target=f"{hrs_1} hrs/week",
                status="not_started",
                priority="High"
            ),
            RoadmapItem(
                id=str(uuid.uuid4()),
                title=f"{prof_title} Client & Market Discovery",
                description=f"Conduct user/client interviews & validate problem hypotheses for {hrs_2} hrs/week.",
                category="RESEARCH",
                target=f"{hrs_2} hrs/week",
                status="not_started",
                priority="High"
            ),
            RoadmapItem(
                id=str(uuid.uuid4()),
                title=f"Client Pitching & Licensing Outreach for {prof_title} Venture",
                description=f"Refine pitch materials & connect with clients/partners for {hrs_3} hrs/week.",
                category="NETWORKING",
                target=f"{hrs_3} hrs/week",
                status="not_started",
                priority="Medium"
            )
        ]

        top_priorities = [
            RoadmapItem(id=str(uuid.uuid4()), title=f"Working {prof_title} Service MVP", description=f"Deliver functional service/product in {p_skill}", category="PROJECT", target="1 Live MVP", status="in_progress", priority="High"),
            RoadmapItem(id=str(uuid.uuid4()), title="Client Market Validation", description="Validate problem space with target clients/users", category="RESEARCH", target="15 Client Interviews", status="not_started", priority="High"),
            RoadmapItem(id=str(uuid.uuid4()), title=f"{prof_title} Venture Pitch Deck", description=f"Create compelling pitch presentation for {prof_title} venture", category="NETWORKING", target="1 Deck v1", status="not_started", priority="Medium")
        ]

        milestones = [
            MilestoneGroup(timeframe="30 DAYS", title=f"{prof_title} Venture Foundations", items=[f"Build v1 service model in {p_skill}", "Conduct 15 customer discovery interviews", "Define core value proposition"]),
            MilestoneGroup(timeframe="60 DAYS", title=f"Launch Phase for {prof_title} Venture", items=["Launch offering to early clients", "Collect feedback & iterate on core service", "Draft partner pitch deck"]),
            MilestoneGroup(timeframe="90 DAYS", title=f"{prof_title} Venture Scaling", items=["Achieve target client base", f"Present {prof_title} venture to partners/investors", "Finalize growth strategy"])
        ]

        metrics_to_track = [
            MetricToTrack(name="Client Interviews Conducted", current="0", target=f"{max(10, hrs_2 * 3)}"),
            MetricToTrack(name="Service Deliverables Completed", current="0", target=f"{max(4, hrs_1 // 2)}"),
            MetricToTrack(name="Pitch Materials Revisions", current="0", target="10"),
            MetricToTrack(name="Active Clients / Partners", current="0", target="50")
        ]

    else:  # Career Execution Path
        hrs_1 = int(investments.get("dsa_prep", investments.get("skill_prep", 8)))
        hrs_2 = int(investments.get("portfolio_projects", investments.get("practical_work", 6)))
        hrs_3 = int(investments.get("system_design", investments.get("career_prep", 4)))

        weekly_actions = [
            RoadmapItem(
                id=str(uuid.uuid4()),
                title=f"Master {prof_title} Core Skills & {p_skill}",
                description=f"Dedicate {hrs_1} hrs/week to mastering {p_skill} and core domain principles for becoming a {prof_title}.",
                category="SKILL",
                target=f"{hrs_1} hrs/week",
                status="not_started",
                priority="High"
            ),
            RoadmapItem(
                id=str(uuid.uuid4()),
                title=f"Build {prof_title} Practical Portfolio & Case Studies",
                description=f"Invest ~{hrs_2} hrs/week building live portfolio projects, field deliverables, or case studies in {s_skill}.",
                category="PROJECT",
                target=f"{hrs_2} hrs/week",
                status="not_started",
                priority="High"
            ),
            RoadmapItem(
                id=str(uuid.uuid4()),
                title=f"{prof_title} Career Outreach & Portfolio Review",
                description=f"Spend {hrs_3} hrs/week practicing role-specific assessments, portfolio presentations, and industry networking for {prof_title} positions.",
                category="CAREER",
                target=f"{hrs_3} hrs/week",
                status="not_started",
                priority="Medium"
            )
        ]

        top_priorities = [
            RoadmapItem(id=str(uuid.uuid4()), title=f"{prof_title} Core Mastery", description=f"Master key fundamentals in {p_skill}", category="SKILL", target="Core Competency", status="in_progress", priority="High"),
            RoadmapItem(id=str(uuid.uuid4()), title=f"{prof_title} Portfolio Assets", description=f"Build & ship live practical deliverables in {s_skill}", category="PROJECT", target="2 Live Portfolio Items", status="not_started", priority="High"),
            RoadmapItem(id=str(uuid.uuid4()), title=f"{prof_title} Industry Readiness", description="Complete portfolio reviews & professional outreach prep", category="CAREER", target="5 Outreach Contacts", status="not_started", priority="Medium")
        ]

        milestones = [
            MilestoneGroup(timeframe="30 DAYS", title=f"{prof_title} Foundations & Skill Building", items=[f"Complete core practice units in {p_skill}", f"Draft baseline portfolio outline for {prof_title} roles", f"Review core principles in {s_skill}"]),
            MilestoneGroup(timeframe="60 DAYS", title=f"{prof_title} Portfolio & Practical Execution", items=[f"Deploy 2 real-world {prof_title} projects/case studies", f"Complete peer evaluations in {p_skill}", f"Conduct networking outreach for {prof_title} opportunities"]),
            MilestoneGroup(timeframe="90 DAYS", title=f"{prof_title} Career Launch & Placement", items=[f"Achieve top shortlist status as a {prof_title}", "Complete final assessment rounds", f"Secure target offer/position as a {prof_title}"])
        ]

        metrics_to_track = [
            MetricToTrack(name=f"{p_skill} Practice Units", current="0", target=f"{max(20, hrs_1 * 4)}"),
            MetricToTrack(name=f"{prof_title} Portfolio Assets", current="0", target="2"),
            MetricToTrack(name="Portfolio Reviews Completed", current="0", target="5"),
            MetricToTrack(name="Outreach Contacts", current="0", target="10")
        ]

    roadmap_id = f"roadmap_{uuid.uuid4().hex[:8]}"
    roadmap = ActionRoadmap(
        id=roadmap_id,
        user_id=user_id,
        scenario=winner_name,
        overall_score=overall,
        reason=rec.reason,
        workload_risk=risk_val,
        risk_level=winning_result.explanation or f"{risk_val}% risk",
        workload_caution=workload_caution,
        milestones=milestones,
        weekly_actions=weekly_actions,
        top_priorities=top_priorities,
        metrics_to_track=metrics_to_track,
        next_checkin="In 7 Days",
        created_at=datetime.utcnow().isoformat(),
        goal_context=goal_info["raw_goal"]
    )

    print(f"[Personalization] ROADMAP_ACTIONS_GENERATED={len(weekly_actions)} for {prof_title}")
    print(f"[Roadmap] GENERATION_SUCCESS: roadmap_id={roadmap_id} goal='{goal_info['raw_goal']}'")

    ROADMAPS_STORE[user_id] = roadmap
    save_roadmaps_to_disk()
    print(f"[Roadmap] SAVE_SUCCESS: user_id={user_id}")

    return roadmap
