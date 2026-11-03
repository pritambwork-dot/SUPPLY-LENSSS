"""Abstract Base Solver interface and SolverResult dataclass."""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, List, Optional
from ..model.problem import SourcingProblem

@dataclass
class SolverResult:
    """Standardized output produced by any optimization solver."""
    status: str                                  # "OPTIMAL", "FEASIBLE", "INFEASIBLE"
    allocations: Dict[str, int] = field(default_factory=dict) # supplier_id -> quantity
    objective_value: float = 0.0
    total_cost: float = 0.0
    weighted_risk: float = 0.0
    weighted_lead_time: float = 0.0
    diversification_score: float = 0.0
    runtime_ms: float = 0.0
    solver_name: str = "ExactSolver"
    iterations: int = 0
    optimality_gap: float = 0.0
    infeasibility_reasons: List[str] = field(default_factory=list)
    actionable_remedies: List[str] = field(default_factory=list)

class BaseSolver(ABC):
    """Abstract interface for sourcing allocation solvers."""

    @abstractmethod
    def solve(self, problem: SourcingProblem) -> SolverResult:
        """Solve the sourcing allocation problem under constraints."""
        pass
