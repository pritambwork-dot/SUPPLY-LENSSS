"""Risk minimization objective function."""
from typing import Dict, List
from ..model.variables import CandidateSupplier

def calculate_weighted_risk(allocations: Dict[str, int], suppliers: List[CandidateSupplier], total_demand: int) -> float:
    """Calculate the weighted average supplier risk score in [0.0, 1.0].
    Lower score indicates safer, more reliable suppliers.
    """
    if total_demand <= 0:
        return 0.0
    sup_map = {s.supplier_id: s for s in suppliers}
    weighted_sum = sum(qty * sup_map[s_id].risk_score for s_id, qty in allocations.items() if s_id in sup_map)
    return round(weighted_sum / total_demand, 4)
