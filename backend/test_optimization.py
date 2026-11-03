"""Comprehensive Unit and Verification Tests for SupplyLens Operations Research Engine."""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from optimization import solve_sourcing_problem, generate_alternatives_for_problem
from optimization.model.variables import CandidateSupplier
from optimization.model.problem import SourcingProblem, map_profile_to_weights
from optimization.solvers.exact_solver import ExactSolver
from optimization.scenarios.what_if import run_what_if_simulation
from optimization.constraints.validator import ConstraintValidator

def test_demand_and_capacity():
    print("\n--- Test 1: Demand Satisfaction & Capacity ---")
    # 10,000 units required
    res = solve_sourcing_problem(
        required_quantity=10000,
        budget_limit=200000.0,
        objective_type="cost",
        max_suppliers=3,
        save_run=False
    )
    assert res["status"] == "OPTIMAL", f"Expected OPTIMAL, got {res['status']}"
    assert res["is_feasible"] is True
    total_alloc = sum(a["quantity"] for a in res["allocations"])
    assert total_alloc == 10000, f"Demand not met: {total_alloc} != 10000"
    print(f"✓ Demand met: {total_alloc} units allocated.")
    for a in res["allocations"]:
        print(f"  - {a['supplier_name']}: {a['quantity']} units ({a['percentage_of_total']}%) @ ₹{a['unit_price']}/unit")

def test_moq_binary_coupling():
    print("\n--- Test 2: MOQ Binary Coupling ---")
    # For every supplier that receives > 0, it must be >= MOQ
    res = solve_sourcing_problem(
        required_quantity=8000,
        objective_type="balanced",
        max_suppliers=2,
        save_run=False
    )
    assert res["status"] == "OPTIMAL"
    for a in res["allocations"]:
        assert a["quantity"] >= a["moq"], f"Supplier {a['supplier_name']} quantity {a['quantity']} < MOQ {a['moq']}"
        print(f"✓ Supplier '{a['supplier_name']}' received {a['quantity']} >= MOQ {a['moq']}.")

def test_concentration_limit():
    print("\n--- Test 3: Concentration Limit (max 50% to any single supplier) ---")
    res = solve_sourcing_problem(
        required_quantity=10000,
        max_suppliers=3,
        max_supplier_share=0.50,
        objective_type="balanced",
        save_run=False
    )
    assert res["status"] == "OPTIMAL"
    for a in res["allocations"]:
        assert a["quantity"] <= 5000, f"Supplier {a['supplier_name']} exceeded 50% cap: {a['quantity']}"
        assert a["percentage_of_total"] <= 50.0
        print(f"✓ Supplier '{a['supplier_name']}' got {a['quantity']} ({a['percentage_of_total']}%) <= 50%.")

def test_canonical_infeasibility_capacity():
    print("\n--- Test 4: Canonical Infeasibility - Insufficient Capacity ---")
    # Available total capacity across all packaging suppliers is ~90,000.
    # Requesting 200,000 units must fail pre-screen with actionable remedies.
    res = solve_sourcing_problem(
        required_quantity=200000,
        save_run=False
    )
    assert res["status"] == "INFEASIBLE", f"Expected INFEASIBLE, got {res['status']}"
    assert res["is_feasible"] is False
    assert len(res["infeasibility_diagnostics"]["root_causes"]) > 0
    assert len(res["infeasibility_diagnostics"]["actionable_remedies"]) > 0
    print("✓ Correctly rejected with INFEASIBLE:")
    print("  Root causes:", res["infeasibility_diagnostics"]["root_causes"][0])
    print("  Remedies:", res["infeasibility_diagnostics"]["actionable_remedies"][0])

def test_canonical_infeasibility_budget():
    print("\n--- Test 5: Canonical Infeasibility - Budget Lower Than Minimum Cost ---")
    # 10,000 units with budget of only ₹10,000 (unit prices are ~₹9.2 - ₹15.4)
    res = solve_sourcing_problem(
        required_quantity=10000,
        budget_limit=10000.0,
        save_run=False
    )
    assert res["status"] == "INFEASIBLE"
    assert res["is_feasible"] is False
    print("✓ Correctly caught budget deficit:")
    print("  Root causes:", res["infeasibility_diagnostics"]["root_causes"][0])
    print("  Remedies:", res["infeasibility_diagnostics"]["actionable_remedies"][0])

def test_three_alternative_plans():
    print("\n--- Test 6: 3 Canonical Alternative Plans ---")
    alt = generate_alternatives_for_problem(
        required_quantity=10000,
        max_suppliers=3
    )
    assert alt["cheapest_plan"]["status"] == "OPTIMAL"
    assert alt["balanced_plan"]["status"] == "OPTIMAL"
    assert alt["diversified_plan"]["status"] == "OPTIMAL"

    print(f"Recommended Strategy: {alt['recommended_strategy']}")
    print(f"  Cheapest Plan Cost: ₹{alt['cheapest_plan']['total_cost']:,.2f} (Lead time: {alt['cheapest_plan']['weighted_lead_time_days']} days)")
    print(f"  Balanced Plan Cost: ₹{alt['balanced_plan']['total_cost']:,.2f} (Lead time: {alt['balanced_plan']['weighted_lead_time_days']} days)")
    print(f"  Diversified Plan Cost: ₹{alt['diversified_plan']['total_cost']:,.2f} (Active suppliers: {alt['diversified_plan']['active_suppliers_count']})")
    
    # Cheapest cost should be <= balanced or diversified
    assert alt["cheapest_plan"]["total_cost"] <= alt["diversified_plan"]["total_cost"] + 1.0
    print("✓ Alternative plans generated successfully with expected trade-offs.")

def test_what_if_sensitivity():
    print("\n--- Test 7: What-If Sensitivity Simulation ---")
    candidates = [
        CandidateSupplier(
            supplier_id="s1", supplier_name="Alpha", country="India", country_code="IN",
            unit_price=14.0, moq=1000, capacity=15000, lead_time_days=4, risk_score=0.10,
            verification_score=95, rating=4.8, is_verified=True
        ),
        CandidateSupplier(
            supplier_id="s2", supplier_name="Beta", country="China", country_code="CN",
            unit_price=10.0, moq=3000, capacity=30000, lead_time_days=20, risk_score=0.20,
            verification_score=92, rating=4.7, is_verified=True
        )
    ]
    prob = SourcingProblem(required_quantity=10000, budget_limit=200000.0, candidate_suppliers=candidates)
    sim = run_what_if_simulation(prob, excluded_supplier_ids=["s2"])
    assert sim["is_feasible"] is True
    print(f"✓ What-if simulation excluding 'Beta': Allocations shifted to Alpha (Total: ₹{sim['total_cost']:,.2f})")

def test_ai_optimization_commands():
    print("\n--- Test 8: AI Natural Language Command Parsing ---")
    from app.services.ai_service import ai_service
    base_req = {
        "required_quantity": 10000,
        "objective_type": "balanced",
        "max_suppliers": 3,
        "max_supplier_share": 1.0
    }

    # Command 1: "Make it cheaper"
    res1 = ai_service.parse_optimization_command("Make it cheaper", base_req)
    assert res1["updated_request"]["objective_type"] == "cost"
    print("✓ Command 'Make it cheaper' translated to objective_type: cost")

    # Command 2: "Don't depend on one supplier"
    res2 = ai_service.parse_optimization_command("Don't depend on one supplier", base_req)
    assert res2["updated_request"]["objective_type"] == "diversified"
    assert res2["updated_request"]["max_supplier_share"] <= 0.50
    print(f"✓ Command 'Don't depend on one supplier' capped share at {res2['updated_request']['max_supplier_share']*100}%")

    # Command 3: "Limit to India"
    res3 = ai_service.parse_optimization_command("Limit to India", base_req)
    assert "India" in res3["updated_request"]["preferred_countries"]
    print("✓ Command 'Limit to India' set preferred_countries: India")

def test_ai_explanation():
    print("\n--- Test 9: AI Non-Technical Plain Founder Explanation ---")
    from app.services.ai_service import ai_service
    plan = {
        "total_cost": 88675.0,
        "allocations": [
            {"supplier_name": "Navrang FiberTech", "quantity": 7500, "percentage_of_total": 75.0},
            {"supplier_name": "Utkal GreenFiber", "quantity": 2500, "percentage_of_total": 25.0}
        ],
        "savings_summary": {
            "savings_amount": 12500.0,
            "savings_percentage": 12.4
        }
    }
    exp = ai_service.explain_optimization_plan(plan, {"city": "Bhubaneswar"})
    assert "explanation" in exp and len(exp["explanation"]) > 20
    assert "recommended_action" in exp
    print("✓ AI Founder Explanation generated:")
    print(" ", exp["explanation"][:120], "...")

if __name__ == "__main__":
    print("==================================================")
    print("RUNNING SUPPLYLENS OPERATIONS RESEARCH ENGINE TEST SUITE")
    print("==================================================")
    test_demand_and_capacity()
    test_moq_binary_coupling()
    test_concentration_limit()
    test_canonical_infeasibility_capacity()
    test_canonical_infeasibility_budget()
    test_three_alternative_plans()
    test_what_if_sensitivity()
    test_ai_optimization_commands()
    test_ai_explanation()
    print("\n==================================================")
    print("ALL OPTIMIZATION TESTS PASSED PERFECTLY!")
    print("==================================================")
