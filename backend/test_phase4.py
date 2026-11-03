"""
SupplyLens Prompt 4 - Automated Canonical Acceptance Test
Tests all 14 points of the Cost + Logistics + Sourcing Intelligence Engine.
"""

import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.data.seed_data import SUPPLIERS_SEED, DESTINATIONS_SEED
from app.services.logistics.cost_engine import LandedCostEngine
from app.services.logistics.scenario_service import ScenarioService
from app.services.ai_service import ai_service


def run_canonical_acceptance_test():
    print("=" * 60)
    print("SUPPLYLENS PROMPT 4 CANONICAL ACCEPTANCE TEST SUITE")
    print("=" * 60)

    # 1. Verify Seed Destinations
    print("\n[TEST 1] Verifying Freight Destinations Catalog...")
    assert len(DESTINATIONS_SEED) >= 4, f"Expected at least 4 destinations, got {len(DESTINATIONS_SEED)}"
    default_dest = next((d for d in DESTINATIONS_SEED if d.get("is_default")), None)
    assert default_dest is not None, "Expected default destination"
    assert "Bhubaneswar" in default_dest["city"], f"Expected Bhubaneswar as default, got {default_dest['city']}"
    print(f" PASS: Default destination is {default_dest['name']} ({default_dest['city']}, {default_dest['country']})")

    # 2. Verify Canonical Demo Suppliers Exist
    print("\n[TEST 2] Verifying Canonical Packaging Suppliers in Catalog...")
    utkal = next((s for s in SUPPLIERS_SEED if s["id"] == "sup-000-odisha"), None)
    ecopack = next((s for s in SUPPLIERS_SEED if s["id"] == "sup-ecopack-dg"), None)
    vietbio = next((s for s in SUPPLIERS_SEED if s["id"] == "sup-vietbio-kraft"), None)

    assert utkal is not None, "Utkal GreenFiber Biopack not found"
    assert ecopack is not None, "EcoPack Dongguan not found"
    assert vietbio is not None, "VietBio Kraft not found"
    print(f" PASS: Found Utkal ({utkal['city']}), EcoPack ({ecopack['city']}), VietBio ({vietbio['city']})")

    # 3. Calculate 5,000 Units Sourcing Scenarios to Bhubaneswar
    print("\n[TEST 3] Calculating 5,000-unit Landed Cost Scenarios for Bhubaneswar...")
    profile = {
        "business_name": "EcoPack Odisha",
        "city": "Bhubaneswar",
        "country": "India",
        "budget_amount": 1000000,
        "business_stage": "idea",
        "sector": "Sustainable Packaging",
    }

    scen_utkal = ScenarioService.calculate_scenario(
        supplier_id="sup-000-odisha",
        quantity=5000,
        destination_city="Bhubaneswar",
        destination_country="India",
        product_name="Biodegradable Takeaway Packaging Boxes",
        business_profile=profile
    )
    scen_ecopack = ScenarioService.calculate_scenario(
        supplier_id="sup-ecopack-dg",
        quantity=5000,
        destination_city="Bhubaneswar",
        destination_country="India",
        product_name="Biodegradable Takeaway Packaging Boxes",
        business_profile=profile
    )
    scen_vietbio = ScenarioService.calculate_scenario(
        supplier_id="sup-vietbio-kraft",
        quantity=5000,
        destination_city="Bhubaneswar",
        destination_country="India",
        product_name="Biodegradable Takeaway Packaging Boxes",
        business_profile=profile
    )

    print(f" Utkal GreenFiber (Local Road): Unit Price=₹{scen_utkal['supplier_unit_price']:.2f}, Freight=₹{scen_utkal['breakdown']['logistics_cost']:,.0f}, Total=₹{scen_utkal['estimated_total_cost']:,.0f} (₹{scen_utkal['estimated_cost_per_unit']:.2f}/unit)")
    print(f" EcoPack Dongguan (Ocean China): Unit Price=₹{scen_ecopack['supplier_unit_price']:.2f}, Freight=₹{scen_ecopack['breakdown']['logistics_cost']:,.0f}, Total=₹{scen_ecopack['estimated_total_cost']:,.0f} (₹{scen_ecopack['estimated_cost_per_unit']:.2f}/unit)")
    print(f" VietBio Kraft (Ocean VN): Unit Price=₹{scen_vietbio['supplier_unit_price']:.2f}, Freight=₹{scen_vietbio['breakdown']['logistics_cost']:,.0f}, Total=₹{scen_vietbio['estimated_total_cost']:,.0f} (₹{scen_vietbio['estimated_cost_per_unit']:.2f}/unit)")

    # 4. Test Distinction: Cheapest Unit Price vs Cheapest Estimated Total
    print("\n[TEST 4] Testing Multi-Scenario Comparison & Distinguishing 'Cheapest' Labels...")
    comparison = ScenarioService.compare_scenarios([scen_utkal, scen_ecopack, scen_vietbio], profile)

    assert comparison["cheapest_unit_price_scenario_id"] == scen_ecopack["id"], (
        f"Expected EcoPack to be cheapest unit price ({scen_ecopack['supplier_unit_price']}), got {comparison['cheapest_unit_price_scenario_id']}"
    )
    print(f" PASS: Cheapest Unit Price is EcoPack Dongguan (₹{scen_ecopack['supplier_unit_price']:.2f}/unit)")

    assert comparison["cheapest_total_cost_scenario_id"] == scen_utkal["id"], (
        f"Expected Utkal to be cheapest total cost ({scen_utkal['estimated_total_cost']}), got {comparison['cheapest_total_cost_scenario_id']}"
    )
    print(f" PASS: Cheapest Estimated Total is Utkal GreenFiber (₹{scen_utkal['estimated_total_cost']:,.0f} total vs EcoPack ₹{scen_ecopack['estimated_total_cost']:,.0f})")

    assert comparison["best_starting_small_scenario_id"] == scen_utkal["id"], "Expected Utkal to be Best for Starting Small"
    print(f" PASS: Best for Starting Small is Utkal GreenFiber (MOQ {scen_utkal['moq']:,} units)")

    assert comparison["best_overall_scenario_id"] == scen_utkal["id"], "Expected Utkal to be Best Overall for idea stage"
    print(f" PASS: Best Overall is Utkal GreenFiber")

    # 5. Transparent Itemization (Included vs Not Included)
    print("\n[TEST 5] Checking Cost Transparency (Included vs Not Included)...")
    inc = scen_utkal["breakdown"]["included"]
    not_inc = scen_utkal["breakdown"]["not_included"]
    assert len(inc) >= 2, "Expected included items"
    assert len(not_inc) >= 3, "Expected not-included items"
    assert any("GST" in s or "Tax" in s for s in not_inc), "Expected GST/tax disclaimer"
    assert any("Customs" in s for s in not_inc), "Expected customs disclaimer"
    print(f" PASS: Transparency breakdown confirmed ({len(inc)} included, {len(not_inc)} not included)")

    # 6. Cost Confidence & Price Freshness
    print("\n[TEST 6] Checking Confidence Scores & Price Freshness...")
    assert scen_utkal["cost_confidence"] == "high", f"Expected high confidence for local, got {scen_utkal['cost_confidence']}"
    assert scen_ecopack["cost_confidence"] == "medium", f"Expected medium confidence for international, got {scen_ecopack['cost_confidence']}"
    assert scen_utkal["breakdown"]["is_price_stale"] is False, "Price should not be stale"
    print(f" PASS: Utkal confidence='{scen_utkal['cost_confidence']}', EcoPack confidence='{scen_ecopack['cost_confidence']}', Freshness='{scen_utkal['breakdown']['price_freshness']}'")

    # 7. Currency Conversion Preservation
    print("\n[TEST 7] Checking Currency Conversion Preservation...")
    conv = scen_ecopack["breakdown"]["currency_conversion"]
    assert conv is not None, "Expected currency conversion for EcoPack ($0.11 USD)"
    assert conv["original_currency"] == "USD", f"Expected USD, got {conv['original_currency']}"
    assert conv["original_price"] == 0.11, f"Expected 0.11, got {conv['original_price']}"
    print(f" PASS: Converted {conv['display_text']}")

    # 8. What-If Volume Sensitivity: Tipping Point at 15,000 Units
    print("\n[TEST 8] Testing What-If Simulation & Volume Tipping Point at 15,000 units...")
    what_if_15k = ScenarioService.what_if_recalculate(
        scenario_ids=[scen_utkal["id"], scen_ecopack["id"], scen_vietbio["id"]],
        new_quantity=15000,
        destination_city="Bhubaneswar",
        business_profile=profile
    )

    utkal_15k = next(s for s in what_if_15k["scenarios"] if s["supplier_id"] == "sup-000-odisha")
    ecopack_15k = next(s for s in what_if_15k["scenarios"] if s["supplier_id"] == "sup-ecopack-dg")

    print(f" At 15,000 units: Utkal Total=₹{utkal_15k['estimated_total_cost']:,.0f}, EcoPack Total=₹{ecopack_15k['estimated_total_cost']:,.0f}")
    assert ecopack_15k["estimated_total_cost"] < utkal_15k["estimated_total_cost"], (
        f"Expected EcoPack ({ecopack_15k['estimated_total_cost']}) < Utkal ({utkal_15k['estimated_total_cost']}) at 15,000 units"
    )
    assert what_if_15k["cheapest_total_cost_scenario_id"] == ecopack_15k["id"], "EcoPack should become cheapest total at 15k units"
    print(f" PASS: Tipping point validated! EcoPack Dongguan is now Cheapest Total at 15,000 units.")

    # 9. Actionable 7-Step Sourcing Plan
    print("\n[TEST 9] Checking 7-Step Actionable Sourcing Plan...")
    plan = comparison["sourcing_plan"]
    assert len(plan) == 7, f"Expected 7 steps, got {len(plan)}"
    step_titles = [s["title"] for s in plan]
    print(f" PASS: Generated 7 steps: {step_titles}")

    # 10. AI Plain-English Scenario Explanation
    print("\n[TEST 10] Testing AI Plain-English Scenario Explanation...")
    ai_expl = ai_service.explain_sourcing_scenario(scen_utkal, profile)
    assert "headline" in ai_expl and len(ai_expl["headline"]) > 10, "Expected valid headline"
    assert "why_chosen" in ai_expl and len(ai_expl["why_chosen"]) > 20, "Expected valid why_chosen"
    assert "tradeoffs" in ai_expl, "Expected tradeoffs"
    print(f" PASS: AI Headline: {ai_expl['headline']}")

    # 11. AI Sourcing Q&A
    print("\n[TEST 11] Testing AI Sourcing Q&A Grounded Response...")
    qa_res = ai_service.answer_sourcing_question(
        question="Why is Utkal GreenFiber cheaper overall if EcoPack has a lower unit price?",
        scenarios=[scen_utkal, scen_ecopack, scen_vietbio],
        business_profile=profile
    )
    assert len(qa_res["answer"]) > 20, "Expected grounded answer"
    print(f" PASS: AI Answer: {qa_res['answer'][:120]}...")

    # 12. Save Scenario
    print("\n[TEST 12] Testing Scenario Bookmarking...")
    save_res = ScenarioService.save_scenario(scen_utkal["id"])
    assert save_res["status"] == "saved", "Expected status 'saved'"
    saved_list = ScenarioService.get_saved_scenarios()
    assert any(s["id"] == scen_utkal["id"] for s in saved_list), "Expected scenario in saved list"
    print(f" PASS: Successfully saved scenario {scen_utkal['id']} (Total saved: {len(saved_list)})")

    print("\n" + "=" * 60)
    print("ALL 12 CANONICAL ACCEPTANCE TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_canonical_acceptance_test()
