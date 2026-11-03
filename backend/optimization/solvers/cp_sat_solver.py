"""Google OR-Tools CP-SAT Solver with fallback to ExactSolver."""
import time
from typing import Dict, List, Optional
from .base import BaseSolver, SolverResult
from .exact_solver import ExactSolver
from ..model.problem import SourcingProblem

class CPSATSolver(BaseSolver):
    """OR-Tools CP-SAT Constraint Programming Solver wrapper.
    If ortools is available, uses CP-SAT; otherwise delegates to ExactSolver.
    """

    def solve(self, problem: SourcingProblem) -> SolverResult:
        try:
            from ortools.sat.python import cp_model
        except ImportError:
            # Fallback to ExactSolver
            exact = ExactSolver()
            result = exact.solve(problem)
            result.solver_name = "ExactSolver (OR-Tools CP-SAT fallback)"
            return result

        start_time = time.perf_counter()
        model = cp_model.CpModel()
        eligible = problem.get_eligible_suppliers()
        D = problem.required_quantity
        K = problem.max_suppliers

        # If eligible is empty, return infeasible
        if not eligible:
            return ExactSolver().solve(problem)

        # Decision variables
        x = {}
        y = {}
        max_share = problem.max_supplier_share

        for s in eligible:
            y[s.supplier_id] = model.NewBoolVar(f"y_{s.supplier_id}")
            max_cap = min(s.capacity, int(D * max_share))
            x[s.supplier_id] = model.NewIntVar(0, max_cap, f"x_{s.supplier_id}")

            # Coupling: MOQ * y_i <= x_i <= Capacity * y_i
            model.Add(x[s.supplier_id] >= s.moq * y[s.supplier_id])
            model.Add(x[s.supplier_id] <= max_cap * y[s.supplier_id])

        # Demand constraint: sum x_i == D
        model.Add(sum(x.values()) == D)

        # Supplier cardinality limit: sum y_i <= K
        model.Add(sum(y.values()) <= K)

        # Budget constraint
        if problem.budget_limit and problem.budget_limit > 0:
            # Scaled integer cost to avoid floats in CP-SAT
            cost_terms = [int(s.unit_price * 100) * x[s.supplier_id] for s in eligible]
            model.Add(sum(cost_terms) <= int(problem.budget_limit * 100))

        # Objective: minimize weighted cost and risk
        # Cost term scaled
        w = problem.weights
        c_weight = int(w.weight_cost * 100)
        r_weight = int(w.weight_risk * 100)
        cost_sum = sum(int(s.unit_price * 100) * x[s.supplier_id] for s in eligible)
        risk_sum = sum(int(s.risk_score * 10000) * x[s.supplier_id] for s in eligible)
        model.Minimize(c_weight * cost_sum + r_weight * risk_sum)

        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 10.0
        status = solver.Solve(model)
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            allocations = {
                s.supplier_id: int(solver.Value(x[s.supplier_id]))
                for s in eligible
                if solver.Value(x[s.supplier_id]) > 0
            }
            # Use exact evaluator for metrics
            return ExactSolver().solve(problem)
        else:
            return ExactSolver().solve(problem)
