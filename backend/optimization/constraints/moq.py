"""Minimum Order Quantity (MOQ) binary coupling constraint logic."""
from typing import Dict, List, Tuple
from ..model.variables import CandidateSupplier

def check_moq_constraint(
    allocations: Dict[str, int], 
    suppliers: List[CandidateSupplier]
) -> Tuple[bool, List[str]]:
    """Verify that any active supplier (x_i > 0) satisfies x_i >= MOQ_i.
    Returns: (is_satisfied, violation_details)
    """
    violations = []
    sup_map = {s.supplier_id: s for s in suppliers}

    for sup_id, qty in allocations.items():
        if qty > 0:
            supplier = sup_map.get(sup_id)
            if supplier and qty < supplier.moq:
                violations.append(
                    f"Supplier '{supplier.supplier_name}' received {qty:,} units, below required MOQ of {supplier.moq:,}."
                )

    return len(violations) == 0, violations
