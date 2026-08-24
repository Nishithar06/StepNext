"""
Centralized Personalization Engine for StepNext AI.
Provides a single source of truth for career goal understanding, dynamic dimension derivation,
scenario focus areas, outcome indicators, and roadmap milestones for ANY career goal string.
"""

from typing import Dict, Any, List, Optional
from app.schemas.models import UserProfile
from app.services.higher_studies_resolver import resolve_higher_studies_path

def get_personalized_career_context(profile: Optional[UserProfile]) -> Dict[str, Any]:
    raw_goal = (profile.career_goal or profile.short_term_goal if profile else '') or 'Software & AI Engineer'
    raw_goal_clean = raw_goal.strip()
    
    lower_goal = raw_goal_clean.lower()
    for prefix in [
        "become a ", "become an ", "become ",
        "work as a ", "work as an ", "work as ",
        "pursue a career as a ", "pursue a career as an ", "pursue ",
        "be a ", "be an ", "transition to "
    ]:
        if lower_goal.startswith(prefix):
            raw_goal_clean = raw_goal_clean[len(prefix):].strip()
            lower_goal = raw_goal_clean.lower()
            break

    profession_title = raw_goal_clean.capitalize() if raw_goal_clean else 'Professional Specialist'
    if not profession_title or len(profession_title) < 2:
        profession_title = 'Professional Specialist'

    skills = profile.skills if profile and profile.skills else []
    skills_to_improve = profile.skills_to_improve if profile and profile.skills_to_improve else []

    primary_skill = skills_to_improve[0] if skills_to_improve else (skills[0] if skills else f"{profession_title} Core Principles")
    secondary_skill = skills_to_improve[1] if len(skills_to_improve) > 1 else (skills[1] if len(skills) > 1 else f"{profession_title} Practical Deliverables")

    # Derive Higher Studies scenario (sc2) dynamically from centralized Higher Studies Resolver
    hs_resolved = resolve_higher_studies_path(profile)
    sc2_name = hs_resolved["pathway_title"]
    sc2_desc = hs_resolved["pathway_desc"]
    sc2_focus = hs_resolved["focus_areas"]

    # Domain-specific dimension mappings with fallback for custom/unseen professions
    if any(k in lower_goal for k in ['photographer', 'photography', 'videographer', 'filmmaker', 'wildlife']):
        domain_family = 'Visual Arts & Conservation Media'
        slider1_label = f"Camera Handling & {primary_skill}"
        slider1_desc = f"Exposure mastery, low-light techniques, long-lens operation, and {primary_skill}."
        slider2_label = f"Field Shoots & {secondary_skill}"
        slider2_desc = f"Animal behavior tracking, field photography, post-processing, and portfolio projects."
        slider3_label = f"Client Pitching & Gallery Outreach"
        slider3_desc = f"Nature journal submissions, print licensing, conservation partnerships, and client networking."
        focus_areas = [primary_skill, secondary_skill, "Field Shoots", "Post-Processing", "Client Outreach"]

        sc1_name = "Career Execution (Wildlife Photography)"
        sc1_desc = f"Focus on field photography, technical camera mastery in {primary_skill}, and building a professional wildlife portfolio."
        sc1_focus = [f"Camera & Lens Technique ({primary_skill}) (8h/wk)", "Field Shoots & Editing (6h/wk)", "Portfolio & Outreach (4h/wk)"]

        sc3_name = "Independent Photography Venture"
        sc3_desc = "Prioritize photography business development, client acquisition, print licensing, and conservation organization partnerships."
        sc3_focus = ["Business Development (12h/wk)", "Licensing & Market (5h/wk)", "Brand Partnerships (3h/wk)"]

    elif any(k in lower_goal for k in ['teacher', 'teaching', 'educator', 'professor', 'lecturer', 'tutor', 'instructor']):
        domain_family = 'Education & Pedagogy'
        slider1_label = f"Subject Mastery & {primary_skill}"
        slider1_desc = f"Deepening knowledge in subject specialization and {primary_skill}."
        slider2_label = f"Lesson Planning & {secondary_skill}"
        slider2_desc = f"Developing curriculum, lesson plans, and {secondary_skill}."
        slider3_label = f"Classroom Management & Practice"
        slider3_desc = f"Student engagement, pedagogical practice, and classroom delivery."
        focus_areas = [primary_skill, "Lesson Planning", "Classroom Management", "Pedagogy"]

        sc1_name = "Teaching Career Execution"
        sc1_desc = f"Focus on classroom teaching, subject mastery in {primary_skill}, and curriculum development."
        sc1_focus = [f"Subject Mastery ({primary_skill}) (8h/wk)", "Lesson Planning (6h/wk)", "Classroom Delivery (4h/wk)"]

        sc3_name = "EdTech & Tutoring Venture"
        sc3_desc = "Build an independent online tutoring platform, educational content business, or learning academy."
        sc3_focus = ["Course Creation (12h/wk)", "Student Growth (5h/wk)", "Platform Management (3h/wk)"]

    elif any(k in lower_goal for k in ['doctor', 'medical', 'physician', 'clinician', 'surgeon', 'nurse']):
        domain_family = 'Healthcare & Medicine'
        slider1_label = f"Clinical Knowledge & {primary_skill}"
        slider1_desc = f"Medical theory, diagnostics, and {primary_skill} mastery."
        slider2_label = f"Clinical Practice & Patient Care"
        slider2_desc = f"Direct clinical training, patient interaction, and case analysis."
        slider3_label = f"Medical Boards & Licensing Prep"
        slider3_desc = f"Exam preparation, board certification, and clinical evaluations."
        focus_areas = [primary_skill, "Clinical Practice", "Medical Licensing", "Patient Diagnostics"]

        sc1_name = "Clinical Practice Career"
        sc1_desc = f"Focus on residency preparation, clinical diagnostics, and patient care in {primary_skill}."
        sc1_focus = [f"Clinical Diagnostics ({primary_skill}) (8h/wk)", "Patient Rotations (6h/wk)", "Board Exam Prep (4h/wk)"]

        sc3_name = "HealthTech & Private Practice Venture"
        sc3_desc = "Establish an independent medical practice, clinic management model, or healthcare technology venture."
        sc3_focus = ["Practice Operations (12h/wk)", "HealthTech Discovery (5h/wk)", "Partner Outreach (3h/wk)"]

    elif any(k in lower_goal for k in ['lawyer', 'legal', 'advocate', 'attorney', 'prosecutor', 'counsel']):
        domain_family = 'Legal & Regulatory'
        slider1_label = f"Legal Research & {primary_skill}"
        slider1_desc = f"Statutory analysis, legal precedents, and {primary_skill}."
        slider2_label = f"Case Analysis & Document Drafting"
        slider2_desc = f"Brief writing, contract drafting, and case study preparation."
        slider3_label = f"Moot Court & Advocacy Practice"
        slider3_desc = f"Oral arguments, litigation practice, and bar exam prep."
        focus_areas = [primary_skill, "Legal Research", "Case Briefing", "Advocacy"]

        sc1_name = "Legal Practice Career"
        sc1_desc = f"Focus on associate practice, legal research in {primary_skill}, and court briefing."
        sc1_focus = [f"Legal Research ({primary_skill}) (8h/wk)", "Brief Drafting (6h/wk)", "Client Advocacy (4h/wk)"]

        sc3_name = "Independent Legal Firm Venture"
        sc3_desc = "Establish an independent law consultancy, legal advisory practice, or mediation firm."
        sc3_focus = ["Client Acquisition (12h/wk)", "Practice Setup (5h/wk)", "Networking & Retainers (3h/wk)"]

    elif any(k in lower_goal for k in ['designer', 'ux', 'ui', 'graphic', 'product design']):
        domain_family = 'Design & Creative Technologies'
        slider1_label = f"Design Fundamentals & {primary_skill}"
        slider1_desc = f"Visual hierarchy, typography, and {primary_skill}."
        slider2_label = f"Portfolio Case Studies & {secondary_skill}"
        slider2_desc = f"End-to-end design case studies, prototyping, and user testing."
        slider3_label = f"UX Research & Design Systems"
        slider3_desc = f"User research methods, design system architecture, and client review."
        focus_areas = [primary_skill, "Portfolio Case Studies", "UX Research", "Design Systems"]

        sc1_name = "Product & UX Design Career"
        sc1_desc = f"Focus on UI/UX prototyping, design system architecture, and building portfolio case studies."
        sc1_focus = [f"UI/UX Design ({primary_skill}) (8h/wk)", "Case Studies (6h/wk)", "Design Systems (4h/wk)"]

        sc3_name = "Design Studio & Agency Venture"
        sc3_desc = "Build an independent design studio, client branding agency, or digital product consultancy."
        sc3_focus = ["Client Projects (12h/wk)", "Agency Branding (5h/wk)", "Client Outreach (3h/wk)"]

    elif any(k in lower_goal for k in ['software', 'developer', 'engineer', 'full stack', 'backend', 'frontend', 'ai', 'data scientist', 'programmer']):
        domain_family = 'Software & Engineering'
        slider1_label = f"Technical Fundamentals & {primary_skill}"
        slider1_desc = f"Algorithm optimization, code architecture, and {primary_skill}."
        slider2_label = f"Software Projects & {secondary_skill}"
        slider2_desc = f"Building production-grade applications, deployment, and testing."
        slider3_label = f"System Architecture & Code Review"
        slider3_desc = f"System design patterns, peer code reviews, and technical interview prep."
        focus_areas = [primary_skill, "Software Projects", "System Architecture", "Technical Interview Prep"]

        sc1_name = "Software Engineering Career"
        sc1_desc = f"Focus on technical coding skills, algorithms in {primary_skill}, portfolio apps, and interview prep."
        sc1_focus = [f"DSA & Algorithms ({primary_skill}) (8h/wk)", "Software Projects (6h/wk)", "System Design (4h/wk)"]

        sc3_name = "Tech Startup & Product Venture"
        sc3_desc = "Prioritize product MVP development, tech discovery, and startup pitch deck preparation."
        sc3_focus = ["Product Dev (12h/wk)", "Market Discovery (5h/wk)", "Pitch Deck & Outreach (3h/wk)"]

    else:
        # Dynamic fallback for custom/unseen goals (e.g. Architect, Civil Servant, Journalist, Content Creator)
        domain_family = f"{profession_title} Execution"
        slider1_label = f"Master {primary_skill} & {profession_title} Fundamentals"
        slider1_desc = f"Building core competence in {primary_skill} and foundational domain principles."
        slider2_label = f"{profession_title} Portfolio & {secondary_skill}"
        slider2_desc = f"Creating practical deliverables, portfolio artifacts, and executing {secondary_skill}."
        slider3_label = f"{profession_title} Career Prep & Peer Reviews"
        slider3_desc = f"Industry networking, professional evaluation, and milestone execution."
        focus_areas = [primary_skill, secondary_skill, f"{profession_title} Deliverables", "Professional Review"]

        sc1_name = f"{profession_title} Career Execution"
        sc1_desc = f"Focus on core professional practice, skill building in {primary_skill}, and portfolio deliverables."
        sc1_focus = [f"Domain Mastery ({primary_skill}) (8h/wk)", "Practical Portfolio (6h/wk)", "Professional Prep (4h/wk)"]

        sc3_name = f"Independent {profession_title} Consultancy / Venture"
        sc3_desc = f"Establish an independent practice, consultancy business, or professional service firm in {profession_title}."
        sc3_focus = ["Business Development (12h/wk)", "Market Discovery (5h/wk)", "Client Networking (3h/wk)"]

    return {
        "profession_title": profession_title,
        "raw_goal": raw_goal,
        "domain_family": domain_family,
        "primary_skill": primary_skill,
        "secondary_skill": secondary_skill,
        "path1_title": sc1_name.upper(),
        "path1_description": sc1_desc,
        "sc1_name": sc1_name,
        "sc1_desc": sc1_desc,
        "sc1_focus": sc1_focus,
        "sc2_name": sc2_name,
        "sc2_desc": sc2_desc,
        "sc2_focus": sc2_focus,
        "sc3_name": sc3_name,
        "sc3_desc": sc3_desc,
        "sc3_focus": sc3_focus,
        "slider1": {
            "key": "dimension_1",
            "legacy_key": "dsa_prep",
            "label": slider1_label,
            "description": slider1_desc,
            "badge": "+ HIGH IMPACT"
        },
        "slider2": {
            "key": "dimension_2",
            "legacy_key": "portfolio_projects",
            "label": slider2_label,
            "description": slider2_desc,
            "badge": "+ HIGH IMPACT"
        },
        "slider3": {
            "key": "dimension_3",
            "legacy_key": "system_design",
            "label": slider3_label,
            "description": slider3_desc,
            "badge": "+ SUSTAINED GROWTH"
        },
        "focus_areas": focus_areas
    }
