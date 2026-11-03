"""Supplier monthly capacity constraint logic."""
from typing import Dict, List, Tuple
from ..model.variables import CandidateSupplier

def check_capacity_constraint(
    allocations: Dict[str, int], 
    suppliers: List[CandidateSupplier]
) -> Tuple[bool, List[str]]:
    """Verify that allocation to each supplier does not exceed their production capacity.
    Returns: (is_satisfied, violation_details)
    """
    violations = []
    sup_map = {s.supplier_id: s for s in suppliers}

    for sup_id, qty in allocations.items():
        if qty > 0:
            supplier = sup_map.get(sup_id)
            if supplier and qty > supplier.capacity:
                violations.append(
                    f"Supplier '{supplier.supplier_name}' allocated {qty:,} units, exceeding max capacity of {supplier.capacity:,}."
                )

    return len(violations) == 0, violations
