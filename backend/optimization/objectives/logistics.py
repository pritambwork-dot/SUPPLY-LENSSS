"""Logistics friction and lead-time minimization objective function."""
from typing import Dict, List
from ..model.variables import CandidateSupplier

def calculate_weighted_lead_time(allocations: Dict[str, int], suppliers: List[CandidateSupplier], total_demand: int) -> float:
    """Calculate the weighted average delivery lead time in days.
    Lower values indicate faster turnaround and lower logistics friction.
    """
    if total_demand <= 0:
        return 0.0
    sup_map = {s.supplier_id: s for s in suppliers}
    weighted_days = sum(qty * sup_map[s_id].lead_time_days for s_id, qty in allocations.items() if s_id in sup_map)
    return round(weighted_days / total_demand, 2)
