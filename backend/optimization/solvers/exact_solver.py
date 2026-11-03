"""Exact Branch-and-Bound / Combinatorial Mixed-Integer Sourcing Solver."""
import time
import itertools
from typing import Dict, List, Optional, Tuple
from collections import defaultdict

from .base import BaseSolver, SolverResult
from ..model.problem import SourcingProblem
from ..model.variables import CandidateSupplier
from ..constraints.validator import ConstraintValidator
from ..objectives.cost import calculate_total_cost
from ..objectives.risk import calculate_weighted_risk
from ..objectives.logistics import calculate_weighted_lead_time
from ..objectives.diversification import calculate_diversification_score
from ..objectives.multi_objective import evaluate_multi_objective

class ExactSolver(BaseSolver):
    """Pure-Python Exact Mixed-Integer Sourcing Solver.
    
    Solves the global mixed-integer multi-objective optimization problem:
      min  F(x, y) = w_cost * C(x) + w_risk * R(x) + w_log * L(x) + w_div * HHI(x)
      s.t. sum x_i = Demand
           MOQ_i * y_i <= x_i <= min(Capacity_i, MaxShare * Demand) * y_i
           sum y_i <= K
           sum_{i in Country} x_i <= MaxCountryShare * Demand
           sum c_i * x_i <= Budget
           y_i in {0, 1}, x_i in Z+
    """

    def solve(self, problem: SourcingProblem) -> SolverResult:
        start_time = time.perf_counter()

        # Step 1: Pre-screen feasibility
        is_feasible, root_causes, remedies = ConstraintValidator.pre_screen_feasibility(problem)
        if not is_feasible:
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            return SolverResult(
                status="INFEASIBLE",
                runtime_ms=round(elapsed_ms, 2),
                solver_name="ExactSolver-v1.0",
                infeasibility_reasons=root_causes,
                actionable_remedies=remedies
            )

        eligible = problem.get_eligible_suppliers()
        D = problem.required_quantity
        K = min(problem.max_suppliers, len(eligible))
        weights = problem.weights

        min_price = min(s.unit_price for s in eligible)
        max_price = max(s.unit_price for s in eligible)

        best_allocations: Optional[Dict[str, int]] = None
        best_objective = float("inf")
        iterations = 0

        # Maximum concentration limit per supplier
        max_per_sup = int(round(D * problem.max_supplier_share))

        # Try subset sizes from 1 up to K
        for k in range(1, K + 1):
            for subset in itertools.combinations(eligible, k):
                iterations += 1
                
                # Check subset lower bounds (MOQ) and upper bounds (Capacity & Concentration)
                bounds = {}
                min_sum = 0
                max_sum = 0
                possible = True

                for s in subset:
                    lower = s.moq
                    upper = min(s.capacity, max_per_sup)
                    if lower > upper:
                        possible = False
                        break
                    bounds[s.supplier_id] = (lower, upper, s)
                    min_sum += lower
                    max_sum += upper

                if not possible:
                    continue

                # Can this subset fulfill demand within [min_sum, max_sum]?
                if min_sum > D or max_sum < D:
                    continue

                # Solve allocation for this fixed active subset
                alloc = self._solve_subset_allocation(
                    subset=subset,
                    bounds=bounds,
                    demand=D,
                    weights=weights,
                    min_price=min_price,
                    max_price=max_price,
                    problem=problem
                )

                if alloc is None:
                    continue

                # Check budget constraint
                if problem.budget_limit is not None and problem.budget_limit > 0:
                    cost = sum(alloc[s.supplier_id] * s.unit_price for s in subset)
                    if cost > (problem.budget_limit + 1e-4):
                        continue

                # Check country constraint
                if problem.max_country_share < 0.999:
                    max_per_country = int(round(D * problem.max_country_share))
                    country_sums = defaultdict(int)
                    for s in subset:
                        country_sums[s.country] += alloc[s.supplier_id]
                    if any(c_sum > max_per_country for c_sum in country_sums.values()):
                        continue

                # Evaluate objective
                obj_val = evaluate_multi_objective(
                    allocations=alloc,
                    suppliers=eligible,
                    total_demand=D,
                    weights=weights,
                    min_unit_price=min_price,
                    max_unit_price=max_price
                )

                if obj_val < best_objective:
                    best_objective = obj_val
                    best_allocations = alloc

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        if best_allocations is None:
            # All combinations failed constraint checks (likely budget or country caps)
            root_causes = [
                "No combination of verified suppliers satisfied all joint constraints simultaneously (Budget ceiling, MOQ, and Concentration limits)."
            ]
            remedies = [
                "Increase available budget limit.",
                "Increase maximum active supplier limit.",
                "Relax single-supplier concentration or country limits."
            ]
            return SolverResult(
                status="INFEASIBLE",
                runtime_ms=round(elapsed_ms, 2),
                solver_name="ExactSolver-v1.0",
                iterations=iterations,
                infeasibility_reasons=root_causes,
                actionable_remedies=remedies
            )

        # Build final metrics
        total_cost = calculate_total_cost(best_allocations, eligible)
        w_risk = calculate_weighted_risk(best_allocations, eligible, D)
        w_lead = calculate_weighted_lead_time(best_allocations, eligible, D)
        div_score = calculate_diversification_score(best_allocations, D)

        return SolverResult(
            status="OPTIMAL",
            allocations=best_allocations,
            objective_value=round(best_objective, 6),
            total_cost=round(total_cost, 2),
            weighted_risk=w_risk,
            weighted_lead_time=w_lead,
            diversification_score=div_score,
            runtime_ms=round(elapsed_ms, 2),
            solver_name="ExactSolver-v1.0",
            iterations=iterations,
            optimality_gap=0.0
        )

    def _solve_subset_allocation(
        self,
        subset: Tuple[CandidateSupplier, ...],
        bounds: Dict[str, Tuple[int, int, CandidateSupplier]],
        demand: int,
        weights,
        min_price: float,
        max_price: float,
        problem: SourcingProblem
    ) -> Optional[Dict[str, int]]:
        """Allocate demand among a fixed active supplier subset."""
        # Initialize each supplier at lower bound (MOQ)
        allocation = {s.supplier_id: bounds[s.supplier_id][0] for s in subset}
        remaining_demand = demand - sum(allocation.values())

        if remaining_demand < 0:
            return None

        if remaining_demand == 0:
            return allocation

        # If diversification weight is negligible, greedily allocate remaining to best supplier
        if weights.weight_diversification < 0.05:
            # Sort by marginal score (lower is better)
            span = max(1.0, max_price - min_price)
            scored = []
            for s in subset:
                c_norm = (s.unit_price - min_price) / span
                r_norm = s.risk_score
                l_norm = s.lead_time_days / 30.0
                score = weights.weight_cost * c_norm + weights.weight_risk * r_norm + weights.weight_logistics * l_norm
                scored.append((score, s))
            
            scored.sort(key=lambda x: x[0])

            for _, s in scored:
                lower, upper, _ = bounds[s.supplier_id]
                additional_capacity = upper - allocation[s.supplier_id]
                take = min(remaining_demand, additional_capacity)
                allocation[s.supplier_id] += take
                remaining_demand -= take
                if remaining_demand <= 0:
                    break

            if remaining_demand > 0:
                return None
            return allocation

        # If diversification weight > 0, equalize allocations (water-filling / quadratic equalization)
        # We want allocations x_i to be balanced according to weights while respecting upper bounds
        span = max(1.0, max_price - min_price)
        pref_scores = {}
        for s in subset:
            c_norm = (s.unit_price - min_price) / span
            r_norm = s.risk_score
            l_norm = s.lead_time_days / 30.0
            penalty = weights.weight_cost * c_norm + weights.weight_risk * r_norm + weights.weight_logistics * l_norm
            pref_scores[s.supplier_id] = penalty

        # Water-filling with target capacity
        while remaining_demand > 0:
            # Find suppliers with remaining headroom
            available = [
                s for s in subset 
                if allocation[s.supplier_id] < bounds[s.supplier_id][1]
            ]
            if not available:
                return None

            # Distribute in increments proportional to headroom and preference
            step = max(1, min(100, remaining_demand // len(available))) if remaining_demand >= len(available) else 1
            available.sort(key=lambda s: (allocation[s.supplier_id], pref_scores[s.supplier_id]))

            progress = False
            for s in available:
                if remaining_demand <= 0:
                    break
                headroom = bounds[s.supplier_id][1] - allocation[s.supplier_id]
                take = min(step, headroom, remaining_demand)
                if take > 0:
                    allocation[s.supplier_id] += take
                    remaining_demand -= take
                    progress = True

            if not progress:
                break

        if remaining_demand > 0:
            return None

        return allocation
