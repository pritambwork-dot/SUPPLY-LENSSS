import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from app.services.ai_service import ai_service
from app.services.suppliers.discovery import SupplierDiscoveryService
from app.services.suppliers.verification import VerificationEngine
from app.services.suppliers.contacts import ContactService
from app.services.suppliers.ranking import SupplierRankingEngine
from app.services.maps.service import MapService
from app.data.seed_data import SUPPLIERS_SEED
from app.main import list_suppliers, natural_supplier_search, compare_suppliers, save_supplier, get_saved_suppliers

print("=" * 70)
print("SUPPLYLENS PROMPT 3: SUPPLIER INTELLIGENCE ENGINE ACCEPTANCE TESTS")
print("=" * 70)

# SCENARIO 1: ACCEPTANCE TEST FROM PROMPT 3 SPECIFICATION
# Business: Furniture manufacturing
# Location: Bhubaneswar, India
# Budget: ₹15 lakh
# Business model: Manufacturing
# Requirement: Plywood
# Search: "Find affordable plywood suppliers."

bhubaneswar_furniture_profile = {
    "name": "Kalinga Modular Living",
    "idea": "I want to manufacture modular home and office furniture in Bhubaneswar.",
    "sector": "Furniture & Woodcraft",
    "location": "Bhubaneswar, India",
    "city": "Bhubaneswar",
    "country": "India",
    "budget_amount": 1500000.0,
    "budget_currency": "INR",
    "business_model": "manufacture",
    "expected_scale": "pilot",
    "business_stage": "idea",
}

print("\n--- TEST 1: NATURAL LANGUAGE SEARCH INTERPRETATION ---")
query_text = "Find affordable plywood suppliers."
search_payload = {
    "query": query_text,
    "business_profile": bhubaneswar_furniture_profile
}

natural_res = natural_supplier_search(search_payload)
intent = natural_res["structured_intent"]
print(f"User Query: '{query_text}'")
print(f"Extracted Product: {intent.get('product')}")
print(f"Priority Focus: {intent.get('priority')}")
assert intent.get("product") == "plywood"
print("✓ Natural Language to Structured Intent: PASSED")

print("\n--- TEST 2: VERIFIED-ONLY SUPPLIER DISCOVERY & RESULTS ---")
results = natural_res["search_results"]
suppliers = results["suppliers"]
print(f"Found {results['total_count']} verified plywood suppliers.")
assert results['total_count'] >= 3, f"Expected at least 3 plywood suppliers, got {results['total_count']}"
for s in suppliers:
    p0 = s["products"][0]
    print(f"  • {s['name']} ({s['city']}, {s['country']}) - Quoted: ₹{p0['quoted_price']} | MOQ: {p0['moq']} ({p0.get('moq_meaning')}) | Match: {s['match_score']}% | Status: {s['verification_status']}")
    assert s["verification_status"] == "Verified", f"Supplier {s['name']} is not Verified!"
    assert s["is_demo_data"] is True, "Demo data flag missing!"
    assert s["demo_badge"] == "Demo data", "Demo badge missing!"

print(f"Country Cluster Aggregations: {results['country_counts']}")
assert "India" in results["country_counts"]
print("✓ Verified-Only Gate & Country Aggregations: PASSED")

print("\n--- TEST 3: THREE CORE RECOMMENDATIONS IDENTIFICATION ---")
recs = results["recommendations"]
best_overall = recs["best_overall"]
cheapest = recs["cheapest_suitable"]
best_rated = recs["best_rated"]
starting_small = recs["starting_small"]

print(f"1. Best Overall Match:      {best_overall['supplier_name']} ({best_overall['highlight_badge']}) - {best_overall['rationale']}")
print(f"2. Cheapest Suitable:       {cheapest['supplier_name']} ({cheapest['highlight_badge']}) - {cheapest['rationale']}")
print(f"3. Best Rated / Quality:    {best_rated['supplier_name']} ({best_rated['highlight_badge']}) - {best_rated['rationale']}")
print(f"4. Best for Starting Small: {starting_small['supplier_name']} ({starting_small['highlight_badge']}) - {starting_small['rationale']}")

assert best_overall is not None
assert cheapest is not None
assert best_rated is not None
assert starting_small is not None

# Verify cheapest suitable really has lowest unit price
assert "Yamuna" in cheapest["supplier_name"] or "Viet" in cheapest["supplier_name"]
# Verify best rated has highest rating
assert "GreenDeco" in best_rated["supplier_name"] or "Nordic" in best_rated["supplier_name"]
# Verify best overall is Kalinga EcoPly (close to Bhubaneswar, great match score)
assert "Kalinga" in best_overall["supplier_name"]
print("✓ 3 Core Recommendations + Starting Small: PASSED")

print("\n--- TEST 4: 'WHY VERIFIED?' EVIDENCE AUDIT DOSSIER ---")
kalinga_ply = next(s for s in SUPPLIERS_SEED if s["id"] == "sup-ply-001")
dossier = VerificationEngine.evaluate_supplier(kalinga_ply)
print(f"Audit Dossier for {kalinga_ply['name']}:")
print(f"  Status: {dossier['verification_status']} (Score: {dossier['verification_score']}/100, Confidence: {dossier['data_confidence']}%)")
for chk in dossier["checks"][:4]:
    print(f"  ✓ {chk['check_name']}: {chk['detail']} [Source: {chk['source']}]")
assert len(dossier["checks"]) >= 6
assert dossier["verification_score"] >= 90
print("✓ Evidence-Based Verification Framework: PASSED")

print("\n--- TEST 5: CONTACT PRIVACY & HONEST MISSING EMAIL HANDLING ---")
yamuna_ply = next(s for s in SUPPLIERS_SEED if s["id"] == "sup-ply-002")
yamuna_contacts = ContactService.format_supplier_contacts(yamuna_ply)
print(f"Contacts for {yamuna_ply['name']}:")
print(f"  Phone: {yamuna_contacts['public_phone']}")
print(f"  Email: {yamuna_contacts['public_email']}")
print(f"  Fallback Message: {yamuna_contacts['email_fallback_message']}")
assert yamuna_contacts["has_verified_email"] is False
assert yamuna_contacts["email_fallback_message"] == "No verified public email found."
print("✓ Contact Privacy & 'No verified public email found.' State: PASSED")

print("\n--- TEST 6: MULTI-SUPPLIER COMPARISON & AI SUMMARY ---")
comp_payload = {
    "supplier_ids": ["sup-ply-001", "sup-ply-002", "sup-ply-003"],
    "business_profile": bhubaneswar_furniture_profile
}
comp_res = compare_suppliers(comp_payload)
print(f"Compared {comp_res['compared_count']} suppliers.")
print("Comparative AI Takeaways:")
for bullet in comp_res["ai_summary"]:
    print(f"  • {bullet}")
assert comp_res["compared_count"] == 3
assert len(comp_res["ai_summary"]) >= 3
print("✓ Multi-Supplier Comparison & AI Summary: PASSED")

print("\n--- TEST 7: MAP CLUSTERS & MARKERS ---")
map_data = MapService.get_map_clusters_and_markers(SUPPLIERS_SEED)
print(f"Generated {len(map_data['clusters'])} country clusters and {len(map_data['markers'])} individual markers.")
assert len(map_data["clusters"]) >= 2
assert len(map_data["markers"]) >= 5
print("✓ Google Maps Platform Geographic Layer Data: PASSED")

print("\n--- TEST 8: SAVED SUPPLIERS PERSISTENCE ---")
save_res = save_supplier({"supplier_id": "sup-ply-003"})
print(f"Saved Supplier Action: {save_res['action']}")
saved_list = get_saved_suppliers()
print(f"Total Saved Suppliers: {len(saved_list)}")
print(f"Latest Saved: {saved_list[0]['supplier_name']} - Product: {saved_list[0]['product_name']}")
assert any(s["supplier_id"] == "sup-ply-003" for s in saved_list)
print("✓ Saved Suppliers Feature: PASSED")

print("\n" + "=" * 70)
print("ALL 8 PROMPT 3 ACCEPTANCE TESTS PASSED COMPLETELY!")
print("=" * 70)
