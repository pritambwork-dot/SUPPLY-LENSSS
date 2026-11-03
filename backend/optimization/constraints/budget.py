"""Budget ceiling constraint logic."""
from typing import Dict, List, Optional, Tuple
from ..model.variables import CandidateSupplier

def check_budget_constraint(
    allocations: Dict[str, int], 
    suppliers: List[CandidateSupplier],
    budget_limit: Optional[float]
) -> Tuple[bool, float, Optional[str]]:
    """Verify that total landed cost does not exceed user's available budget.
    Returns: (is_satisfied, actual_total_cost, message)
    """
    sup_map = {s.supplier_id: s for s in suppliers}
    actual_cost = sum(qty * sup_map[s_id].unit_price for s_id, qty in allocations.items() if s_id in sup_map)

    if budget_limit is None or budget_limit <= 0:
        return True, actual_cost, None

    satisfied = actual_cost <= (budget_limit + 1e-4)
    msg = None if satisfied else f"Total procurement cost ₹{actual_cost:,.2f} exceeds allocated budget of ₹{budget_limit:,.2f}."
    return satisfied, actual_cost, msg
