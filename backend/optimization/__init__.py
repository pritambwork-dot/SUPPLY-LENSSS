"""SupplyLens Operations Research Optimization Engine.

Provides exact mixed-integer multi-objective supplier allocation under
real-world business constraints (Demand, MOQ, Capacity, Budget, Supplier limits,
Concentration, and Country diversification).
"""
import uuid
import json
from typing import Dict, Any, Optional, List

try:
    from sqlalchemy.orm import Session
except ImportError:
    Session = Any  # type: ignore

from .model.variables import CandidateSupplier
from .model.problem import SourcingProblem, map_profile_to_weights
from .solvers.exact_solver import ExactSolver
from .constraints.validator import ConstraintValidator
from .results.allocation import format_allocations
from .results.savings import calculate_savings_analysis
from .results.metadata import format_solver_metadata
from .results.infeasibility import format_infeasibility_diagnostics
from .scenarios.generator import AlternativePlanGenerator
from .scenarios.what_if import run_what_if_simulation

from app.data.seed_data import SUPPLIERS_SEED
from app.models.database import OptimizationRun, OptimizationAllocation, OptimizationConstraintRecord

def _build_candidate_suppliers(
    supplier_ids: Optional[List[str]] = None,
    product_category: Optional[str] = None,
    business_profile: Optional[Dict[str, Any]] = None,
    neural_assisted: bool = True
) -> List[CandidateSupplier]:
    """Load and instantiate CandidateSupplier objects from verified catalog."""
    candidates = []
    
    neural_service = None
    if neural_assisted:
        try:
            from ..ml.inference.service import NeuralInferenceService
            neural_service = NeuralInferenceService.get_instance()
        except Exception:
            neural_service = None

    for s in SUPPLIERS_SEED:
        # Check if specific IDs requested
        if supplier_ids and s["id"] not in supplier_ids:
            continue
        # Check if product category filter applies
        if product_category and s.get("products"):
            cat_match = any(
                product_category.lower() in p.get("category", "").lower() or
                product_category.lower() in p.get("name", "").lower()
                for p in s["products"]
            )
            if not cat_match:
                continue

        cand = CandidateSupplier.from_dict(s)
        
        # Enrich with neural fit and risk predictions if neural-assisted
        if neural_service:
            try:
                fit_pred = neural_service.predict_supplier_fit(business_profile or {}, cand.supplier_id)
                risk_pred = neural_service.predict_supplier_risk(cand.supplier_id)
                cand.neural_fit_score = fit_pred.fit_score
                cand.neural_risk_score = risk_pred.predicted_risk_score
            except Exception:
                pass

        candidates.append(cand)

    return candidates

def solve_sourcing_problem(
    required_quantity: int,
    budget_limit: Optional[float] = None,
    objective_type: str = "balanced",
    max_suppliers: int = 3,
    max_supplier_share: float = 1.0,
    max_country_share: float = 1.0,
    preferred_countries: Optional[List[str]] = None,
    excluded_countries: Optional[List[str]] = None,
    supplier_ids: Optional[List[str]] = None,
    product_category: Optional[str] = None,
    business_id: Optional[str] = None,
    business_profile: Optional[Dict[str, Any]] = None,
    neural_assisted: bool = True,
    db: Optional[Session] = None,
    save_run: bool = True
) -> Dict[str, Any]:
    """Primary entry point to solve a sourcing optimization problem."""
    candidates = _build_candidate_suppliers(
        supplier_ids=supplier_ids,
        product_category=product_category,
        business_profile=business_profile,
        neural_assisted=neural_assisted
    )
    
    problem = SourcingProblem(
        required_quantity=required_quantity,
        budget_limit=budget_limit,
        candidate_suppliers=candidates,
        objective_type=objective_type,
        max_suppliers=max_suppliers,
        max_supplier_share=max_supplier_share,
        max_country_share=max_country_share,
        preferred_countries=preferred_countries or [],
        excluded_countries=excluded_countries or []
    )

    solver = ExactSolver()
    result = solver.solve(problem)
    eligible = problem.get_eligible_suppliers()
    run_id = f"opt-{uuid.uuid4().hex[:8]}"

    if result.status == "INFEASIBLE":
        diagnostics = format_infeasibility_diagnostics(
            is_feasible=False,
            root_causes=result.infeasibility_reasons,
            actionable_remedies=result.actionable_remedies
        )

        response = {
            "run_id": run_id,
            "business_id": business_id,
            "status": "INFEASIBLE",
            "is_feasible": False,
            "objective_type": objective_type,
            "total_cost": 0.0,
            "weighted_lead_time_days": 0.0,
            "weighted_risk_score": 0.0,
            "diversification_score": 0.0,
            "allocations": [],
            "savings_summary": {},
            "constraints_audit": [],
            "infeasibility_diagnostics": diagnostics,
            "solver_metadata": format_solver_metadata(
                solver_name=result.solver_name,
                runtime_ms=result.runtime_ms,
                status="INFEASIBLE",
                iterations=result.iterations
            )
        }

        # Persist infeasible run if DB session provided
        if db and save_run:
            _persist_optimization_run(db, response, problem, result.infeasibility_reasons)

        return response

    # Optimal solution found
    allocations_list = format_allocations(result.allocations, eligible, problem.required_quantity)
    savings = calculate_savings_analysis(
        result.total_cost, result.weighted_lead_time, result.weighted_risk,
        problem.required_quantity, eligible
    )
    all_passed, audit_records = ConstraintValidator.audit_solution(problem, result.allocations)

    response = {
        "run_id": run_id,
        "business_id": business_id,
        "status": "OPTIMAL",
        "is_feasible": True,
        "objective_type": objective_type,
        "total_cost": result.total_cost,
        "weighted_lead_time_days": result.weighted_lead_time,
        "weighted_risk_score": result.weighted_risk,
        "diversification_score": result.diversification_score,
        "allocations": allocations_list,
        "savings_summary": savings,
        "constraints_audit": audit_records,
        "infeasibility_diagnostics": None,
        "solver_metadata": format_solver_metadata(
            solver_name=result.solver_name,
            runtime_ms=result.runtime_ms,
            status="OPTIMAL",
            iterations=result.iterations,
            optimality_gap=0.0
        )
    }

    # Persist in DB
    if db and save_run:
        _persist_optimization_run(db, response, problem)

    return response

def _persist_optimization_run(
    db: Session,
    response: Dict[str, Any],
    problem: SourcingProblem,
    infeasibility_reasons: Optional[List[str]] = None
):
    """Save the optimization run and allocation records to the database."""
    try:
        run_record = OptimizationRun(
            id=response["run_id"],
            business_id=response.get("business_id"),
            objective_type=problem.objective_type,
            objective_configuration={
                "required_quantity": problem.required_quantity,
                "budget_limit": problem.budget_limit,
                "max_suppliers": problem.max_suppliers,
                "max_supplier_share": problem.max_supplier_share,
                "max_country_share": problem.max_country_share,
                "preferred_countries": problem.preferred_countries,
                "excluded_countries": problem.excluded_countries,
            },
            solver=response["solver_metadata"]["solver"],
            status=response["status"],
            total_cost=response.get("total_cost", 0.0),
            runtime_ms=response["solver_metadata"]["runtime_ms"],
            model_version=response["solver_metadata"]["model_version"],
            input_snapshot={
                "candidate_count": len(problem.candidate_suppliers),
                "weights": {
                    "cost": problem.weights.weight_cost,
                    "risk": problem.weights.weight_risk,
                    "logistics": problem.weights.weight_logistics,
                    "diversification": problem.weights.weight_diversification
                }
            },
            infeasibility_reason="; ".join(infeasibility_reasons) if infeasibility_reasons else None
        )
        db.add(run_record)

        # Add allocations
        for item in response.get("allocations", []):
            alloc_rec = OptimizationAllocation(
                id=f"alloc-{uuid.uuid4().hex[:8]}",
                optimization_run_id=response["run_id"],
                supplier_id=item["supplier_id"],
                quantity=item["quantity"],
                unit_price=item["unit_price"],
                supplier_cost=item["total_cost"],
                percentage_of_total=item["percentage_of_total"]
            )
            db.add(alloc_rec)

        # Add constraints
        for item in response.get("constraints_audit", []):
            c_rec = OptimizationConstraintRecord(
                id=f"c-{uuid.uuid4().hex[:8]}",
                optimization_run_id=response["run_id"],
                constraint_type=item["constraint_type"],
                constraint_value=item["constraint_value"],
                actual_value=item["actual_value"],
                status=item["status"]
            )
            db.add(c_rec)

        db.commit()
    except Exception as e:
        db.rollback()
        # Non-blocking log
        print(f"[WARN] Failed to persist optimization run: {e}")

def generate_alternatives_for_problem(
    required_quantity: int,
    budget_limit: Optional[float] = None,
    max_suppliers: int = 3,
    max_supplier_share: float = 1.0,
    max_country_share: float = 1.0,
    preferred_countries: Optional[List[str]] = None,
    excluded_countries: Optional[List[str]] = None,
    supplier_ids: Optional[List[str]] = None,
    product_category: Optional[str] = None
) -> Dict[str, Any]:
    """Generate the 3 alternative plans for the given sourcing configuration."""
    candidates = _build_candidate_suppliers(supplier_ids, product_category)
    problem = SourcingProblem(
        required_quantity=required_quantity,
        budget_limit=budget_limit,
        candidate_suppliers=candidates,
        objective_type="balanced",
        max_suppliers=max_suppliers,
        max_supplier_share=max_supplier_share,
        max_country_share=max_country_share,
        preferred_countries=preferred_countries or [],
        excluded_countries=excluded_countries or []
    )
    return AlternativePlanGenerator.generate_alternatives(problem)
