from typing import Any, Dict
from fastapi import APIRouter, Body, HTTPException
from app.data.seed_data import SUPPLIERS_SEED
from optimization import solve_sourcing_problem, generate_alternatives_for_problem
from optimization.scenarios.what_if import run_what_if_simulation
from optimization.model.problem import SourcingProblem
from optimization.model.variables import CandidateSupplier
from app.services.ai_service import ai_service
from app.services.profile_service import get_profile

router = APIRouter(prefix="/api/optimization", tags=["optimization"])

OPTIMIZATION_HISTORY_STORE = []

@router.post("/solve")
def solve_optimization_endpoint(request: Dict[str, Any] = Body(...)):
    required_quantity = int(request.get("required_quantity", 5000))
    budget_limit = request.get("budget_limit")
    if budget_limit is not None:
        budget_limit = float(budget_limit)
    objective_type = request.get("objective_type", "balanced")
    max_suppliers = int(request.get("max_suppliers", 3))
    max_supplier_share = float(request.get("max_supplier_share", 1.0))
    max_country_share = float(request.get("max_country_share", 1.0))
    preferred_countries = request.get("preferred_countries")
    excluded_countries = request.get("excluded_countries")
    supplier_ids = request.get("supplier_ids")
    product_category = request.get("product_category")
    business_id = request.get("business_id", "biz-001")
    business_profile = request.get("business_profile")
    neural_assisted = bool(request.get("neural_assisted", True))

    res = solve_sourcing_problem(
        required_quantity=required_quantity,
        budget_limit=budget_limit,
        objective_type=objective_type,
        max_suppliers=max_suppliers,
        max_supplier_share=max_supplier_share,
        max_country_share=max_country_share,
        preferred_countries=preferred_countries,
        excluded_countries=excluded_countries,
        supplier_ids=supplier_ids,
        product_category=product_category,
        business_id=business_id,
        business_profile=business_profile,
        neural_assisted=neural_assisted,
        save_run=False
    )

    OPTIMIZATION_HISTORY_STORE.insert(0, {
        "run_id": res["run_id"],
        "status": res["status"],
        "objective_type": objective_type,
        "required_quantity": required_quantity,
        "total_cost": res.get("total_cost", 0.0),
        "active_suppliers": len(res.get("allocations", [])),
        "runtime_ms": res.get("solver_metadata", {}).get("runtime_ms", 0.0)
    })

    return res

@router.post("/scenarios")
def get_alternative_plans_endpoint(request: Dict[str, Any] = Body(...)):
    required_quantity = int(request.get("required_quantity", 5000))
    budget_limit = request.get("budget_limit")
    if budget_limit is not None:
        budget_limit = float(budget_limit)
    max_suppliers = int(request.get("max_suppliers", 3))
    max_supplier_share = float(request.get("max_supplier_share", 1.0))
    max_country_share = float(request.get("max_country_share", 1.0))
    preferred_countries = request.get("preferred_countries")
    excluded_countries = request.get("excluded_countries")
    supplier_ids = request.get("supplier_ids")
    product_category = request.get("product_category")

    alternatives = generate_alternatives_for_problem(
        required_quantity=required_quantity,
        budget_limit=budget_limit,
        max_suppliers=max_suppliers,
        max_supplier_share=max_supplier_share,
        max_country_share=max_country_share,
        preferred_countries=preferred_countries,
        excluded_countries=excluded_countries,
        supplier_ids=supplier_ids,
        product_category=product_category
    )
    return alternatives

@router.post("/what-if")
def run_optimization_what_if_endpoint(payload: Dict[str, Any] = Body(...)):
    base_request = payload.get("base_request", {})
    required_quantity = int(base_request.get("required_quantity", 5000))
    budget_limit = base_request.get("budget_limit")
    if budget_limit is not None:
        budget_limit = float(budget_limit)

    candidates = [
        CandidateSupplier.from_dict(s)
        for s in SUPPLIERS_SEED
        if not base_request.get("supplier_ids") or s["id"] in base_request["supplier_ids"]
    ]

    base_problem = SourcingProblem(
        required_quantity=required_quantity,
        budget_limit=budget_limit,
        candidate_suppliers=candidates,
        objective_type=base_request.get("objective_type", "balanced"),
        max_suppliers=int(base_request.get("max_suppliers", 3)),
        max_supplier_share=float(base_request.get("max_supplier_share", 1.0)),
        max_country_share=float(base_request.get("max_country_share", 1.0)),
        preferred_countries=base_request.get("preferred_countries", []),
        excluded_countries=base_request.get("excluded_countries", [])
    )

    result = run_what_if_simulation(
        base_problem=base_problem,
        quantity_delta_pct=payload.get("quantity_delta_pct"),
        new_quantity=payload.get("new_quantity"),
        budget_delta_pct=payload.get("budget_delta_pct"),
        new_budget=payload.get("new_budget"),
        excluded_supplier_ids=payload.get("excluded_supplier_ids"),
        excluded_countries=payload.get("excluded_countries"),
        new_max_supplier_share=payload.get("new_max_supplier_share")
    )
    return result

@router.post("/command")
def parse_optimization_command_endpoint(payload: Dict[str, Any] = Body(...)):
    command = payload.get("command", "")
    current_request = payload.get("current_request", {})
    if not command:
        raise HTTPException(status_code=400, detail="command is required")
    return ai_service.parse_optimization_command(command, current_request)

@router.post("/explain")
def explain_optimization_plan_endpoint(payload: Dict[str, Any] = Body(...)):
    plan = payload.get("plan", {})
    business_profile = payload.get("business_profile") or get_profile("biz-001")
    user_query = payload.get("query")
    return ai_service.explain_optimization_plan(plan, business_profile, user_query)
