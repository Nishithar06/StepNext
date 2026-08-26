"""
Centralized Higher Studies Resolver Service for StepNext AI.
Provides a single source of truth for degree normalization, course/major parsing,
postgraduate family resolution, destination awareness, and course-aware investment sliders.
Handles all recognized undergraduate degrees, specializations, and unknown fallbacks safely.
"""

import re
from typing import Dict, Any, List, Optional
from app.schemas.models import UserProfile

def normalize_degree(education_str: str) -> Dict[str, str]:
    """
    Normalizes raw user education input into canonical degree abbreviation,
    degree family, major/course string, and domain.
    """
    raw = (education_str or "").strip()
    if not raw:
        return {
            "degree_code": "UNKNOWN",
            "degree_name": "Undergraduate Degree",
            "degree_family": "Generic",
            "major": "",
            "raw": raw
        }

    raw_clean = re.sub(r'[\.\,]', '', raw)
    lower = raw.lower()
    lower_clean = raw_clean.lower()

    # Degree Family & Abbreviation Detection
    degree_code = "UNKNOWN"
    degree_name = "Undergraduate Degree"
    degree_family = "Generic"

    # Engineering / Tech (B.E., B.Tech, B.S. Engineering)
    if re.search(r'\b(b\.?e\.?|btech|b\.tech|bachelor of engineering|bachelor of technology)\b', lower):
        degree_code = "B.Tech" if ("tech" in lower_clean or "technology" in lower_clean) else "B.E."
        degree_name = "Bachelor of Technology" if degree_code == "B.Tech" else "Bachelor of Engineering"
        degree_family = "Engineering"
    # Science (B.Sc., BSc, B.S.)
    elif re.search(r'\b(b\.?sc\.?|bsc|bachelor of science|bs)\b', lower):
        degree_code = "B.Sc."
        degree_name = "Bachelor of Science"
        degree_family = "Science"
    # Computer Applications (BCA)
    elif re.search(r'\b(bca|b\.c\.a\.?|bachelor of computer applications)\b', lower):
        degree_code = "BCA"
        degree_name = "Bachelor of Computer Applications"
        degree_family = "Computing"
    # Commerce (B.Com, BCom)
    elif re.search(r'\b(b\.?com\.?|bcom|bachelor of commerce)\b', lower):
        degree_code = "B.Com"
        degree_name = "Bachelor of Commerce"
        degree_family = "Commerce"
    # Business / Management (BBA, BMS)
    elif re.search(r'\b(bba|b\.b\.a\.?|bms|b\.m\.s\.?|bachelor of business|bachelor of management)\b', lower):
        degree_code = "BBA"
        degree_name = "Bachelor of Business Administration"
        degree_family = "Management"
    # Arts & Humanities (BA, B.A.)
    elif re.search(r'\b(b\.?a\.?|ba|bachelor of arts)\b', lower):
        degree_code = "BA"
        degree_name = "Bachelor of Arts"
        degree_family = "Humanities"
    # Pharmacy (B.Pharm)
    elif re.search(r'\b(b\.?pharm\.?|bpharm|bachelor of pharmacy)\b', lower):
        degree_code = "B.Pharm"
        degree_name = "Bachelor of Pharmacy"
        degree_family = "Pharmacy"
    # Architecture (B.Arch)
    elif re.search(r'\b(b\.?arch\.?|barch|bachelor of architecture)\b', lower):
        degree_code = "B.Arch"
        degree_name = "Bachelor of Architecture"
        degree_family = "Architecture"
    # Design (B.Des)
    elif re.search(r'\b(b\.?des\.?|bdes|bachelor of design)\b', lower):
        degree_code = "B.Des"
        degree_name = "Bachelor of Design"
        degree_family = "Design"
    # Education (B.Ed)
    elif re.search(r'\b(b\.?ed\.?|bed|bachelor of education)\b', lower):
        degree_code = "B.Ed"
        degree_name = "Bachelor of Education"
        degree_family = "Education"
    # Medical & Health (MBBS, BDS, BPT, Nursing)
    elif re.search(r'\b(mbbs|bds|bpt|nursing)\b', lower):
        degree_code = raw.upper()
        degree_name = raw.title()
        degree_family = "Healthcare"

    # Extract Course / Major / Specialization
    major = extract_major(raw, lower, degree_family)

    return {
        "degree_code": degree_code,
        "degree_name": degree_name,
        "degree_family": degree_family,
        "major": major,
        "raw": raw
    }

def extract_major(raw: str, lower: str, degree_family: str) -> str:
    """Extracts and normalizes major/specialization from raw string."""
    # Computer Science & Computing
    cs_patterns = [
        r'computer\s+science\s+(&|and)?\s*engineering',
        r'\bcse\b',
        r'\bcs\s+engineering\b',
        r'computer\s+science',
        r'computer\s+engineering',
        r'\bcs\b',
        r'\bit\b',
        r'information\s+technology',
        r'software\s+engineering'
    ]
    if any(re.search(pat, lower) for pat in cs_patterns):
        if re.search(r'\b(ai|ml|machine\s+learning|artificial\s+intelligence)\b', lower):
            return "AI & Machine Learning"
        if re.search(r'\b(data\s+science|analytics|big\s+data)\b', lower):
            return "Data Science & Analytics"
        if re.search(r'\b(cyber|security)\b', lower):
            return "Cybersecurity"
        return "Computer Science & Engineering" if degree_family == "Engineering" else "Computer Science"

    # AI / ML
    if any(re.search(pat, lower) for pat in [r'\bai[/\s&]+ml\b', r'artificial\s+intelligence', r'machine\s+learning', r'\bai\b', r'\bml\b']):
        return "AI & Machine Learning"

    # Data Science
    if any(re.search(pat, lower) for pat in [r'data\s+science', r'data\s+analytics', r'big\s+data']):
        return "Data Science & Analytics"

    # Electronics / Electrical
    if any(re.search(pat, lower) for pat in [r'electronics', r'electrical', r'\bece\b', r'\beee\b', r'telecommunication']):
        return "Electronics & Electrical Engineering"

    # Mechanical
    if any(re.search(pat, lower) for pat in [r'mechanical', r'\bmech\b', r'mechatronics', r'automobile', r'automotive']):
        return "Mechanical Engineering"

    # Civil
    if any(re.search(pat, lower) for pat in [r'civil', r'structural', r'construction']):
        return "Civil Engineering"

    # Physical Sciences
    if 'physics' in lower:
        return "Physics"
    if 'chemistry' in lower:
        return "Chemistry"
    if any(re.search(pat, lower) for pat in [r'\bmath\b', r'mathematics', r'\bstats\b', r'statistics']):
        return "Mathematics & Statistics"

    # Life & Biological Sciences
    if 'biotechnology' in lower or 'biotech' in lower:
        return "Biotechnology"
    if 'microbiology' in lower:
        return "Microbiology"
    if 'zoology' in lower:
        return "Zoology"
    if 'botany' in lower:
        return "Botany"
    if 'biology' in lower or 'biological' in lower or 'life science' in lower:
        return "Biology & Life Sciences"
    if 'environmental' in lower or 'marine' in lower:
        return "Environmental & Marine Science" if 'marine' in lower else "Environmental Science"

    # Commerce & Business
    if 'accounting' in lower or 'accounts' in lower:
        return "Accounting & Taxation"
    if 'finance' in lower or 'banking' in lower:
        return "Finance & Banking"
    if 'marketing' in lower:
        return "Marketing"
    if re.search(r'\bhr\b', lower) or 'human resource' in lower:
        return "Human Resource Management"
    if 'business analytics' in lower:
        return "Business Analytics"
    if 'economics' in lower:
        return "Economics"

    # Humanities & Social Sciences
    if 'psychology' in lower:
        return "Psychology"
    if 'sociology' in lower:
        return "Sociology"
    if 'political' in lower or 'politics' in lower:
        return "Political Science"
    if 'history' in lower:
        return "History"
    if 'geography' in lower:
        return "Geography"
    if any(re.search(pat, lower) for pat in [r'journalism', r'media', r'mass\s+comm', r'communication']):
        return "Journalism & Media Communication"
    if 'english' in lower or 'literature' in lower:
        return "English & Literature"

    # Specific professional majors
    if 'marine' in lower:
        return "Marine Science"
    if 'agriculture' in lower or re.search(r'\bagri\b', lower):
        return "Agricultural Sciences"

    # Clean fallback: strip degree prefixes
    cleaned = re.sub(r'(?i)\b(b\.?e\.?|b\.?tech\.?|b\.?sc\.?|bca|b\.?com\.?|bba|ba|b\.?pharm\.?|b\.?arch\.?|b\.?des\.?|b\.?ed\.?|bachelor of [a-z\s]+)\b', '', raw).strip()
    cleaned = re.sub(r'^[,\-\s]+|[,\-\s]+$', '', cleaned)
    if cleaned and len(cleaned) > 2:
        return cleaned.title()

    return ""

def resolve_higher_studies_path(profile: Optional[UserProfile]) -> Dict[str, Any]:
    """
    Main entry point for resolving Higher Studies academic pathway.
    Returns complete structured payload used centrally by backend & frontend.
    """
    raw_ed = (profile.education if profile and profile.education else "").strip()
    norm = normalize_degree(raw_ed)

    deg_code = norm["degree_code"]
    deg_family = norm["degree_family"]
    major = norm["major"]

    # Detect destination preference if present
    destination = "Domestic"
    if profile:
        text_context = f"{profile.career_goal or ''} {profile.short_term_goal or ''} {' '.join(profile.regular_activities or [])}".lower()
        if any(term in text_context for term in ['gre', 'us', 'usa', 'united states', 'germany', 'abroad', 'international', 'uk', 'canada']):
            destination = "International"

    # Priority Goal-Aligned Overrides for Higher Studies when specific career target is set
    career_goal_lower = (profile.career_goal or "").lower() if profile else ""
    if any(k in career_goal_lower for k in ['fashion', 'apparel', 'textile', 'garment']):
        pg_degree = "M.Des / Master's in Fashion Design & Innovation"
        slider1 = "Fashion Design Methodology & Collection Research"
        slider2 = "M.Des / NIFT / Portfolio Entrance Prep"
        slider3 = "Fashion Design Thesis & Collection Showcase"
        domain_name = "Fashion & Apparel Design Studies"

    # Resolve Postgraduate Degree Name & Specialization based on background
    elif deg_family == "Engineering":
        if destination == "International":
            pg_degree = f"MS in {major}" if major else "MS in Engineering"
        else:
            pg_degree = f"M.Tech / M.E. in {major}" if major else "M.Tech / M.E. Graduate Studies"
        slider1 = f"Core Technical Mastery ({major or 'Engineering'})"
        slider2 = "GATE / GRE Exam Preparation"
        slider3 = "Academic Research & Technical Papers"
        domain_name = "Engineering & Technology"

    elif deg_family == "Science":
        if destination == "International":
            pg_degree = f"MS / MSc in {major}" if major else "MS / MSc in Science"
        else:
            pg_degree = f"M.Sc. in {major}" if major else "M.Sc. / Advanced Academic Studies"
        slider1 = f"Core Subject Mastery ({major or 'Science'})"
        slider2 = "M.Sc. / Postgraduate Entrance Prep"
        slider3 = "Research & Laboratory Projects"
        domain_name = "Physical & Life Sciences"

    elif deg_family == "Computing":
        pg_degree = f"MCA ({major})" if (major and major != "Computer Science") else "MCA / MS in Computing"
        slider1 = "Core CS & Systems Programming"
        slider2 = "NIMCET / MCA / MS Entrance Prep"
        slider3 = "Software Architecture & Code Projects"
        domain_name = "Computer Applications & IT"

    elif deg_family == "Commerce":
        pg_degree = f"M.Com / MBA in {major}" if major else "M.Com / MBA in Commerce & Financial Studies"
        slider1 = f"Advanced {major or 'Commerce & Finance'} Fundamentals"
        slider2 = "CAT / M.Com / MBA Entrance Prep"
        slider3 = "Financial Modeling & Case Studies"
        domain_name = "Commerce & Financial Studies"

    elif deg_family == "Management":
        pg_degree = f"MBA / Master's in {major}" if major else "MBA / Advanced Management Studies"
        slider1 = f"Management Principles ({major or 'Business'})"
        slider2 = "CAT / GMAT / MBA Entrance Prep"
        slider3 = "Corporate Strategy & Business Cases"
        domain_name = "Management Studies"

    elif deg_family == "Humanities":
        pg_degree = f"M.A. in {major}" if major else "M.A. / Advanced Master's Studies"
        slider1 = f"Core Academic Theory ({major or 'Humanities'})"
        slider2 = "M.A. Postgraduate Entrance Prep"
        slider3 = "Academic Thesis & Publications"
        domain_name = "Humanities & Social Sciences"

    elif deg_family == "Pharmacy":
        pg_degree = f"M.Pharm in {major}" if major else "M.Pharm Postgraduate Studies"
        slider1 = "Pharmaceutical Sciences Mastery"
        slider2 = "GPAT / M.Pharm Entrance Prep"
        slider3 = "Drug Research & Lab Studies"
        domain_name = "Pharmaceutical Sciences"

    elif deg_family == "Architecture":
        pg_degree = f"M.Arch in {major}" if major else "M.Arch Postgraduate Studies"
        slider1 = "Advanced Architectural Design & Theory"
        slider2 = "GATE / Portfolio Entrance Prep"
        slider3 = "Urban Planning & Design Thesis"
        domain_name = "Architecture & Built Environment"

    elif deg_family == "Design":
        pg_degree = f"M.Des in {major}" if major else "M.Des Master's Studies"
        slider1 = "Advanced Design Methodology"
        slider2 = "CEED / M.Des Entrance & Portfolio Prep"
        slider3 = "Design Research & Master Portfolio"
        domain_name = "Design & Creative Studies"

    elif deg_family == "Education":
        pg_degree = "M.Ed / Master's in Education"
        slider1 = "Advanced Pedagogical Theory"
        slider2 = "M.Ed Entrance & Teaching Certification"
        slider3 = "Curriculum Research & Educational Practice"
        domain_name = "Education & Pedagogy"

    else:
        # Safe Fallback for Unknown / Unlisted Degrees
        if major:
            pg_degree = f"Master's in {major}"
            slider1 = f"Core Domain Mastery ({major})"
        elif raw_ed:
            pg_degree = f"Postgraduate Studies ({raw_ed})"
            slider1 = f"Core Subject Mastery ({raw_ed})"
        else:
            pg_degree = "Relevant Postgraduate Master's Pathway"
            slider1 = "Core Academic Subject Mastery"

        slider2 = "Postgraduate Entrance & Qualifying Prep"
        slider3 = "Academic Research & Thesis Projects"
        domain_name = "Specialized Academic Pathway"

    confidence = 90 if deg_family != "Generic" else (65 if major or raw_ed else 40)
    reasoning = (
        f"Recommended {pg_degree} pathway based directly on your {raw_ed or 'undergraduate'} background. "
        f"This academic route strengthens {slider1.lower()} and builds advanced research qualifications in {domain_name}."
    )

    return {
        "raw_education": raw_ed,
        "normalized_degree": deg_code,
        "degree_family": deg_family,
        "major": major,
        "destination": destination,
        "domain_name": domain_name,
        "pathway_title": pg_degree,
        "pathway_desc": f"Pursue {pg_degree} based on your {raw_ed or 'academic'} foundation, focusing on {slider1.lower()}, entrance preparation, and academic research.",
        "confidence": confidence,
        "reasoning": reasoning,
        "recommended_investments": [
            {"label": slider1, "badge": "+ HIGH IMPACT", "hours": 8.0, "key": "exam_prep"},
            {"label": slider2, "badge": "+ HIGH IMPACT", "hours": 6.0, "key": "research_papers"},
            {"label": slider3, "badge": "+ MODERATE IMPACT", "hours": 4.0, "key": "sop_applications"}
        ],
        "focus_areas": [
            f"{slider1} (8h/wk)",
            f"{slider2} (6h/wk)",
            f"{slider3} (4h/wk)"
        ]
    }
