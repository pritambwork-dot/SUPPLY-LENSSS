"""Alternative Plans Generation: Cheapest, Balanced, and Diversified plans."""
from copy import deepcopy
from typing import Dict, List, Any
from ..model.problem import SourcingProblem, map_profile_to_weights
from ..solvers.exact_solver import ExactSolver
from ..constraints.validator import ConstraintValidator
from ..results.allocation import format_allocations
from ..results.savings import calculate_savings_analysis
from ..results.metadata import format_solver_metadata

class AlternativePlanGenerator:
    """Generates the three canonical sourcing strategies for executive decision-making."""

    @staticmethod
    def generate_alternatives(
        base_problem: SourcingProblem,
        run_solver = None
    ) -> Dict[str, Any]:
        """Generate Cheapest, Balanced, and Diversified plans side-by-side."""
        solver = run_solver or ExactSolver()
        eligible = base_problem.get_eligible_suppliers()

        # 1. Cheapest Plan (Cost priority, unconstrained concentration)
        cheapest_problem = deepcopy(base_problem)
        cheapest_problem.objective_type = "cost"
        cheapest_problem.weights = map_profile_to_weights("cost")
        cheapest_problem.max_supplier_share = 1.0
        cheapest_res = solver.solve(cheapest_problem)

        # 2. Balanced Plan (Multi-objective balance)
        balanced_problem = deepcopy(base_problem)
        balanced_problem.objective_type = "balanced"
        balanced_problem.weights = map_profile_to_weights("balanced")
        balanced_res = solver.solve(balanced_problem)

        # 3. Diversified Plan (Resilient multi-sourcing, capped at 50% max share if possible)
        diversified_problem = deepcopy(base_problem)
        diversified_problem.objective_type = "diversified"
        diversified_problem.weights = map_profile_to_weights("diversified")
        # Ensure multi-supplier distribution
        if len(eligible) >= 2:
            diversified_problem.max_supplier_share = min(base_problem.max_supplier_share, 0.50)
            diversified_problem.max_suppliers = max(2, base_problem.max_suppliers)
        diversified_res = solver.solve(diversified_problem)

        # Helper to format a plan
        def build_plan_dict(plan_name: str, problem: SourcingProblem, res) -> Dict[str, Any]:
            if res.status == "INFEASIBLE":
                return {
                    "strategy_name": plan_name,
                    "status": "INFEASIBLE",
                    "total_cost": 0.0,
                    "weighted_lead_time_days": 0.0,
                    "weighted_risk_score": 0.0,
                    "diversification_score": 0.0,
                    "active_suppliers_count": 0,
                    "allocations": [],
                    "savings_summary": {},
                    "infeasibility_reasons": res.infeasibility_reasons,
                    "actionable_remedies": res.actionable_remedies
                }

            allocs = format_allocations(res.allocations, eligible, problem.required_quantity)
            savings = calculate_savings_analysis(
                res.total_cost, res.weighted_lead_time, res.weighted_risk,
                problem.required_quantity, eligible
            )
            _, audits = ConstraintValidator.audit_solution(problem, res.allocations)

            return {
                "strategy_name": plan_name,
                "status": "OPTIMAL",
                "total_cost": res.total_cost,
                "weighted_lead_time_days": res.weighted_lead_time,
                "weighted_risk_score": res.weighted_risk,
                "diversification_score": res.diversification_score,
                "active_suppliers_count": len(allocs),
                "allocations": allocs,
                "savings_summary": savings,
                "constraints_audit": audits,
                "solver_metadata": format_solver_metadata(res.solver_name, res.runtime_ms, res.status, res.iterations)
            }

        cheapest_plan = build_plan_dict("Cheapest Plan", cheapest_problem, cheapest_res)
        balanced_plan = build_plan_dict("Balanced Plan", balanced_problem, balanced_res)
        diversified_plan = build_plan_dict("Diversified Plan", diversified_problem, diversified_res)

        # Determine recommended strategy
        # If user explicitly requested cost, cheapest is recommended; else balanced
        if base_problem.objective_type.lower() in ("cost", "cheapest"):
            recommended_name = "Cheapest Plan"
        elif base_problem.objective_type.lower() in ("diversified", "resilient"):
            recommended_name = "Diversified Plan"
        else:
            recommended_name = "Balanced Plan"

        return {
            "recommended_strategy": recommended_name,
            "cheapest_plan": cheapest_plan,
            "balanced_plan": balanced_plan,
            "diversified_plan": diversified_plan
        }
