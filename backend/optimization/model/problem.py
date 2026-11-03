"""Sourcing Problem Definition and Profile-to-Weights Mapping."""
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from .variables import CandidateSupplier

@dataclass
class ObjectiveWeights:
    """Weight factors for multi-objective optimization (must sum to ~1.0)."""
    weight_cost: float = 0.50
    weight_risk: float = 0.25
    weight_logistics: float = 0.15
    weight_diversification: float = 0.10

def map_profile_to_weights(objective_type: str) -> ObjectiveWeights:
    """Deterministic mapping of high-level objective profile to mathematical weights."""
    norm = objective_type.lower().strip()
    if norm in ("cost", "cheapest", "min_cost", "lowest_cost"):
        return ObjectiveWeights(weight_cost=0.90, weight_risk=0.05, weight_logistics=0.05, weight_diversification=0.00)
    elif norm in ("risk", "lowest_risk", "min_risk", "safe", "safest"):
        return ObjectiveWeights(weight_cost=0.25, weight_risk=0.50, weight_logistics=0.15, weight_diversification=0.10)
    elif norm in ("logistics", "fastest", "min_lead_time", "speed"):
        return ObjectiveWeights(weight_cost=0.25, weight_risk=0.15, weight_logistics=0.50, weight_diversification=0.10)
    elif norm in ("diversified", "diversify", "resilient", "multi_source"):
        return ObjectiveWeights(weight_cost=0.30, weight_risk=0.25, weight_logistics=0.15, weight_diversification=0.30)
    else: # "balanced" default
        return ObjectiveWeights(weight_cost=0.50, weight_risk=0.25, weight_logistics=0.15, weight_diversification=0.10)

@dataclass
class SourcingProblem:
    """Encapsulates all inputs, constraints, and objectives for the OR solver."""
    required_quantity: int
    budget_limit: Optional[float]
    candidate_suppliers: List[CandidateSupplier]
    objective_type: str = "balanced"
    max_suppliers: int = 3
    max_supplier_share: float = 1.0        # e.g., 0.50 for max 50% concentration
    max_country_share: float = 1.0         # e.g., 0.60 for max 60% per country
    preferred_countries: List[str] = field(default_factory=list)
    excluded_countries: List[str] = field(default_factory=list)
    weights: ObjectiveWeights = field(default_factory=lambda: ObjectiveWeights())
    business_context: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        if not self.weights or (self.weights.weight_cost == 0.5 and self.weights.weight_risk == 0.25 and self.objective_type != "balanced"):
            self.weights = map_profile_to_weights(self.objective_type)

    def get_eligible_suppliers(self) -> List[CandidateSupplier]:
        """Filter candidates ensuring STRICT data quality gating:
        1. Must be verified
        2. Must have valid positive unit_price, moq, and capacity
        3. Excluded countries are omitted
        """
        eligible = []
        for s in self.candidate_suppliers:
            if not s.is_verified:
                continue
            if self.excluded_countries and (s.country in self.excluded_countries or s.country_code in self.excluded_countries):
                continue
            if s.unit_price <= 0 or s.capacity <= 0 or s.moq <= 0:
                continue
            eligible.append(s)
        return eligible
