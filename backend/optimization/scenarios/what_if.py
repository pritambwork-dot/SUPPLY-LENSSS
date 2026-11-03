"""What-If Scenario and Sensitivity Simulation."""
from copy import deepcopy
from typing import Dict, Any, Optional, List
from ..model.problem import SourcingProblem
from ..solvers.exact_solver import ExactSolver
from ..constraints.validator import ConstraintValidator
from ..results.allocation import format_allocations
from ..results.savings import calculate_savings_analysis

def run_what_if_simulation(
    base_problem: SourcingProblem,
    quantity_delta_pct: Optional[float] = None,
    new_quantity: Optional[int] = None,
    budget_delta_pct: Optional[float] = None,
    new_budget: Optional[float] = None,
    excluded_supplier_ids: Optional[List[str]] = None,
    excluded_countries: Optional[List[str]] = None,
    new_max_supplier_share: Optional[float] = None
) -> Dict[str, Any]:
    """Execute a what-if sensitivity scenario against the base problem."""
    modified = deepcopy(base_problem)

    # 1. Quantity adjustment
    if new_quantity is not None:
        modified.required_quantity = new_quantity
    elif quantity_delta_pct is not None:
        modified.required_quantity = int(round(base_problem.required_quantity * (1.0 + quantity_delta_pct / 100.0)))

    # 2. Budget adjustment
    if new_budget is not None:
        modified.budget_limit = new_budget
    elif budget_delta_pct is not None and base_problem.budget_limit:
        modified.budget_limit = round(base_problem.budget_limit * (1.0 + budget_delta_pct / 100.0), 2)

    # 3. Excluded suppliers
    if excluded_supplier_ids:
        modified.candidate_suppliers = [
            s for s in modified.candidate_suppliers
            if s.supplier_id not in excluded_supplier_ids
        ]

    # 4. Excluded countries
    if excluded_countries:
        curr_excluded = set(modified.excluded_countries or [])
        curr_excluded.update(excluded_countries)
        modified.excluded_countries = list(curr_excluded)

    # 5. Concentration cap
    if new_max_supplier_share is not None:
        modified.max_supplier_share = new_max_supplier_share

    # Solve base problem and modified problem
    solver = ExactSolver()
    base_result = solver.solve(base_problem)
    scenario_result = solver.solve(modified)

    eligible = modified.get_eligible_suppliers()

    if scenario_result.status == "INFEASIBLE":
        return {
            "status": "INFEASIBLE",
            "is_feasible": False,
            "scenario_parameters": {
                "required_quantity": modified.required_quantity,
                "budget_limit": modified.budget_limit,
                "excluded_supplier_ids": excluded_supplier_ids or [],
                "excluded_countries": modified.excluded_countries
            },
            "root_causes": scenario_result.infeasibility_reasons,
            "actionable_remedies": scenario_result.actionable_remedies
        }

    allocs = format_allocations(scenario_result.allocations, eligible, modified.required_quantity)
    savings = calculate_savings_analysis(
        scenario_result.total_cost, scenario_result.weighted_lead_time, scenario_result.weighted_risk,
        modified.required_quantity, eligible
    )

    cost_delta = round(scenario_result.total_cost - base_result.total_cost, 2) if base_result.status != "INFEASIBLE" else 0.0
    lead_delta = round(scenario_result.weighted_lead_time - base_result.weighted_lead_time, 1) if base_result.status != "INFEASIBLE" else 0.0
    risk_delta = round(scenario_result.weighted_risk - base_result.weighted_risk, 3) if base_result.status != "INFEASIBLE" else 0.0

    return {
        "status": "OPTIMAL",
        "is_feasible": True,
        "scenario_parameters": {
            "required_quantity": modified.required_quantity,
            "budget_limit": modified.budget_limit,
            "max_supplier_share": modified.max_supplier_share,
            "excluded_suppliers": excluded_supplier_ids or [],
            "excluded_countries": modified.excluded_countries
        },
        "total_cost": scenario_result.total_cost,
        "cost_delta": cost_delta,
        "lead_time_days": scenario_result.weighted_lead_time,
        "lead_time_delta": lead_delta,
        "risk_score": scenario_result.weighted_risk,
        "risk_delta": risk_delta,
        "allocations": allocs,
        "savings_summary": savings
    }
