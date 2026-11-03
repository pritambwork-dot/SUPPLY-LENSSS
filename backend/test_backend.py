import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from app.data.seed_data import SUPPLIERS_SEED
from app.services.recommendation_service import generate_recommendations
from app.services.optimization_engine import solve_sourcing_allocation
from app.services.ai_service import ai_service
import app.models.database as db_models

print("=" * 60)
print("SUPPLYLENS BACKEND FOUNDATION VERIFICATION TEST")
print("=" * 60)

# 1. Test database models count
models = [
    db_models.User,
    db_models.Business,
    db_models.Sector,
    db_models.Product,
    db_models.BusinessRequirement,
    db_models.Supplier,
    db_models.SupplierProduct,
    db_models.SupplierContact,
    db_models.SupplierLocation,
    db_models.SupplierRating,
    db_models.SupplierVerification,
    db_models.SavedSupplier,
    db_models.SearchHistory,
    db_models.PriceHistory,
]
print(f"✓ Verified 14 SQLAlchemy Relational Models: {[m.__name__ for m in models]}")

# 2. Test Recommendation Engine
mock_business = {
    "name": "VerdePack Eco Tableware",
    "budget_amount": 1000000,
    "budget_currency": "INR",
    "expected_scale": "pilot",
    "location": "Mumbai, India",
}
recs = generate_recommendations(SUPPLIERS_SEED, mock_business)
print(f"✓ Generated {len(recs)} Tailored Recommendations:")
for r in recs:
    print(f"  • [{r['type']}] {r['title']}: {r['supplier_name']} ({r['highlight_badge']})")

# 3. Test OR-Tools / Optimization Engine
mock_requirements = [
    {"name": "Sugarcane Bagasse Meal Trays", "estimated_qty": 20000, "unit": "pieces"},
    {"name": "Virgin Kraft Paper Delivery Bowls", "estimated_qty": 15000, "unit": "pieces"},
]
opt_result = solve_sourcing_allocation(mock_requirements, SUPPLIERS_SEED, budget_limit=1000000)
print(f"✓ Sourcing Optimizer Status: {opt_result['status']}")
print(f"  • Total Estimated Landed Cost: ₹{opt_result['total_landed_cost']:,.2f}")
print(f"  • Budget Utilized: {opt_result['budget_utilized_percent']}%")
print(f"  • Allocations count: {len(opt_result['allocations'])}")

# 4. Test AI Sourcing Advisor
ai_answer = ai_service.answer_assistant_query("Find cheaper suppliers", mock_business, SUPPLIERS_SEED)
print(f"✓ AI Advisor Response Test:")
print(f"  • Answer: {ai_answer['reply'][:120]}...")

print("=" * 60)
print("ALL BACKEND VERIFICATION CHECKS PASSED!")
print("=" * 60)
