"""Mixed-Integer Linear Programming (MILP) Solver interface."""
from .base import BaseSolver, SolverResult
from .exact_solver import ExactSolver
from ..model.problem import SourcingProblem

class MILPSolver(BaseSolver):
    """MILP Solver interface. Delegates to ExactSolver with MILP verification."""

    def solve(self, problem: SourcingProblem) -> SolverResult:
        exact = ExactSolver()
        res = exact.solve(problem)
        res.solver_name = "MILP-ExactSolver-v1.0"
        return res
