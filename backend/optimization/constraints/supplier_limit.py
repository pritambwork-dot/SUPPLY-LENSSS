"""Supplier cardinality limit (sum y_i <= K) constraint logic."""
from typing import Dict, Tuple

def check_supplier_limit(allocations: Dict[str, int], max_suppliers: int) -> Tuple[bool, int, str]:
    """Verify that the number of active suppliers (x_i > 0) does not exceed K.
    Returns: (is_satisfied, active_count, message)
    """
    active_count = sum(1 for qty in allocations.values() if qty > 0)
    satisfied = active_count <= max_suppliers
    msg = f"Active suppliers: {active_count} (Limit: {max_suppliers})"
    return satisfied, active_count, msg
