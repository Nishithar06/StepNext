import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.schemas.models import UserProfile, ScenarioInput
from app.services.career_context import get_personalized_career_context
from app.services.higher_studies_resolver import resolve_higher_studies_path
from app.services.simulator import build_default_personalized_simulation, evaluate_scenario_deterministic
from app.routes.profile import fetch_profile_from_db_or_fixture
from app.store import PROFILES_STORE

def run_tests():
    print("==================================================")
    print("RUNNING STEPNEXT FASHION & PERSISTENCE VERIFICATION")
    print("==================================================\n")

    # TEST 1: Fashion Designer Career Goal
    print("--- TEST 1: Goal = 'Fashion Designer' ---")
    p_fashion = UserProfile(
        user_id="fashion_user_1",
        name="Fashion User",
        career_goal="Fashion Designer",
        education="B.Sc. Apparel & Fashion",
        skills=["Fashion Illustration", "Pattern Drafting"],
        skills_to_improve=["Garment Construction", "Textile Science"]
    )

    ctx_fashion = get_personalized_career_context(p_fashion)
    print(f"Domain Family: {ctx_fashion['domain_family']}")
    print(f"Sc1 Name: {ctx_fashion['sc1_name']}")
    print(f"Sc2 Name: {ctx_fashion['sc2_name']}")
    print(f"Sc3 Name: {ctx_fashion['sc3_name']}")
    print(f"Focus Areas: {ctx_fashion['focus_areas']}")

    assert ctx_fashion["domain_family"] == "Fashion & Apparel Design", f"Expected Fashion & Apparel Design, got {ctx_fashion['domain_family']}"
    assert "Fashion Design" in ctx_fashion["sc1_name"]
    assert "Fashion Brand" in ctx_fashion["sc3_name"]
    assert not any("ui/ux" in f.lower() or "figma" in f.lower() for f in ctx_fashion["focus_areas"]), "Fashion Designer must NOT have UI/UX or Figma focus areas!"

    # Higher Studies for Fashion Designer
    hs_fashion = resolve_higher_studies_path(p_fashion)
    print(f"Higher Studies Pathway: {hs_fashion['pathway_title']}")
    assert "Fashion" in hs_fashion["pathway_title"] or "M.Des" in hs_fashion["pathway_title"], f"Expected Fashion M.Des, got {hs_fashion['pathway_title']}"
    assert "Science" not in hs_fashion["pathway_title"], "Higher studies for Fashion Designer must NOT default to M.Sc. in Science!"

    sim_fashion = build_default_personalized_simulation("fashion_user_1", p_fashion)
    for sc in sim_fashion.scenarios:
        assert not any("ui/ux" in sc.name.lower() or "figma" in sc.name.lower() for f in sc.focus_areas), f"Scenario {sc.name} contains invalid UI/UX keywords!"
    print("✓ TEST 1 PASSED: Fashion Designer generated fashion-aligned context, scenarios & higher studies without UI/UX defaults.\n")

    # TEST 2: Software Developer
    print("--- TEST 2: Goal = 'Software Developer' ---")
    p_dev = UserProfile(
        user_id="dev_user_1",
        name="Dev User",
        career_goal="Software Developer",
        education="B.Tech CS",
        skills=["Python", "FastAPI"],
        skills_to_improve=["DSA", "System Design"]
    )
    ctx_dev = get_personalized_career_context(p_dev)
    assert ctx_dev["domain_family"] == "Software & Engineering"
    assert "Software Engineering" in ctx_dev["sc1_name"]
    print("✓ TEST 2 PASSED: Software Developer generated software-aligned context.\n")

    # TEST 3: UI/UX Designer
    print("--- TEST 3: Goal = 'UI/UX Designer' ---")
    p_ux = UserProfile(
        user_id="ux_user_1",
        name="UX User",
        career_goal="UI/UX Designer",
        education="B.Des",
        skills=["Figma", "User Research"],
        skills_to_improve=["Design Systems"]
    )
    ctx_ux = get_personalized_career_context(p_ux)
    assert ctx_ux["domain_family"] == "Design & Creative Technologies"
    assert "Product & UX Design" in ctx_ux["sc1_name"]
    print("✓ TEST 3 PASSED: UI/UX Designer generated UI/UX design context.\n")

    # TEST 4: Custom Career ("Architect")
    print("--- TEST 4: Goal = 'Architect' ---")
    p_arch = UserProfile(
        user_id="arch_user_1",
        name="Architect User",
        career_goal="Architect",
        education="B.Arch",
        skills=["3D Modeling", "Building Codes"],
        skills_to_improve=["Urban Planning"]
    )
    ctx_arch = get_personalized_career_context(p_arch)
    assert "UI/UX" not in ctx_arch["sc1_name"]
    assert "Architect" in ctx_arch["profession_title"]
    print("✓ TEST 4 PASSED: Architect generated custom profession-aligned context without UI/UX default.\n")

    # TEST 5: Profile Persistence Lookup
    print("--- TEST 5: Profile Persistence Lookup ---")
    # Fresh unregistered user
    res_none = fetch_profile_from_db_or_fixture("fresh_unregistered_id_9999")
    assert res_none is None, "Unregistered user must return None (404 Not Found)"

    # Store user profile
    PROFILES_STORE["persisted_user_1"] = p_fashion
    res_persisted = fetch_profile_from_db_or_fixture("persisted_user_1")
    assert res_persisted is not None
    assert res_persisted.career_goal == "Fashion Designer"
    print("✓ TEST 5 PASSED: Profile persistence lookup correctly detects saved vs missing profiles.\n")

    print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
