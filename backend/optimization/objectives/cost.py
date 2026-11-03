"""Total Landed Cost objective function."""
from typing import Dict, List
from ..model.variables import CandidateSupplier

def calculate_total_cost(allocations: Dict[str, int], suppliers: List[CandidateSupplier]) -> float:
    """Calculate the total procurement outlay in INR across all allocated suppliers."""
    sup_map = {s.supplier_id: s for s in suppliers}
    return sum(qty * sup_map[s_id].unit_price for s_id, qty in allocations.items() if s_id in sup_map)

def normalize_cost_metric(cost: float, min_cost: float, max_cost: float) -> float:
    """Normalize cost to [0, 1] range for multi-objective weighting."""
    if max_cost <= min_cost:
        return 0.0
    return max(0.0, min(1.0, (cost - min_cost) / (max_cost - min_cost)))
