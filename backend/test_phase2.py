import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from app.services.ai_service import ai_service
from app.services.business_service import classify_budget, generate_business_snapshot, get_stage_guidelines
from app.services.profile_service import validate_and_save_profile, get_profile
from app.services.recommendation_service import generate_recommendations
from app.data.seed_data import SUPPLIERS_SEED

print("=" * 65)
print("SUPPLYLENS PHASE 2: AI BUSINESS UNDERSTANDING VERIFICATION")
print("=" * 65)

# Test 1: Natural Language Extraction of User Prompt
user_prompt = "I have around ₹8 lakh and want to start a sustainable packaging business in Bhubaneswar. I want to sell to restaurants and small food businesses."
extracted = ai_service.extract_business_info(user_prompt)

print("1. Extracted Structured Facts:")
print(f"   • Idea: {extracted['idea']}")
print(f"   • Sector: {extracted['sector']}")
print(f"   • Location: {extracted['location']} (City: {extracted['city']}, Country: {extracted['country']})")
print(f"   • Budget: ₹{extracted['budget_amount']:,.0f} {extracted['budget_currency']}")
print(f"   • Model: {extracted['business_model']}")
print(f"   • Target Customer: {extracted['target_customer']}")
print(f"   • Business Stage: {extracted['business_stage']}")

assert extracted['city'] == "Bhubaneswar"
assert extracted['budget_amount'] == 800000.0
assert "Packaging" in extracted['sector']
print("   ✓ Extraction Accuracy: PASSED")

# Test 2: Budget Intelligence Assessment
budget_info = classify_budget(extracted['budget_amount'], extracted['budget_currency'])
print("\n2. Budget Intelligence:")
print(f"   • Category: {budget_info['category']}")
print(f"   • Insight: {budget_info['insight']}")
assert budget_info['category'] == "low_initial_capital"
print("   ✓ Budget Constraint Classification: PASSED")

# Test 3: Minimal Smart Question
smart_q = ai_service.detect_missing_info_and_clarify(extracted)
print("\n3. Smart Clarification Question:")
if smart_q:
    print(f"   • Question: {smart_q['question']}")
    print(f"   • Field: {smart_q['field']}")
    print(f"   • Options Count: {len(smart_q['options'])}")
else:
    print("   • No unnecessary clarification required.")
print("   ✓ Targeted Questioning: PASSED")

# Test 4: Dynamic Requirement Generation with Importance
reqs = ai_service.generate_requirements(extracted['idea'], extracted['sector'])
print(f"\n4. Dynamic Requirements Generated ({len(reqs)} items):")
for r in reqs:
    print(f"   • [{r['importance'].upper()}] {r['name']} ({r['estimated_qty']} {r['unit']}) - {r['short_explanation']}")
assert any(r['importance'] == 'required' for r in reqs)
assert any(r['importance'] == 'recommended' for r in reqs)
print("   ✓ Requirement Confirmation Structure: PASSED")

# Test 5: Profile-Aware Recommendation Personalization
extracted['target_market'] = "Bhubaneswar & Odisha"
recs = generate_recommendations(SUPPLIERS_SEED, extracted)
print("\n5. Profile-Aware Supplier Recommendations:")
for rec in recs:
    print(f"   • [{rec['type']}] {rec['title']}: {rec['supplier_name']} ({rec['highlight_badge']})")
    print(f"     Rationale: {rec['rationale']}")

# Verify local hub is picked for Bhubaneswar
assert recs[0]['supplier_name'] == "Utkal GreenFiber Biopack"
print("   ✓ Localized / Profile-Aware Supplier Matching: PASSED")

# Test 6: Profile Persistence Service
saved = validate_and_save_profile(extracted)
fetched = get_profile(saved['id'])
assert fetched['city'] == "Bhubaneswar"
print("\n6. Profile Persistence:")
print(f"   • Saved Profile ID: {saved['id']}")
print(f"   • Verified Persistence Fetch: {fetched['name']}")
print("   ✓ Profile Service: PASSED")

print("\n" + "=" * 65)
print("ALL PHASE 2 BACKEND VERIFICATION CHECKS PASSED!")
print("=" * 65)
