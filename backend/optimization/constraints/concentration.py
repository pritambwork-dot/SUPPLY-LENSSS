"""Single-supplier concentration limit constraint logic."""
from typing import Dict, List, Tuple
from ..model.variables import CandidateSupplier

def check_concentration_constraint(
    allocations: Dict[str, int], 
    required_quantity: int,
    max_supplier_share: float,
    suppliers: List[CandidateSupplier]
) -> Tuple[bool, List[str]]:
    """Verify that no single supplier receives more than max_supplier_share of the total demand.
    For example, max_supplier_share=0.50 means no single supplier receives > 50%.
    Returns: (is_satisfied, violation_details)
    """
    if max_supplier_share >= 0.999 or required_quantity <= 0:
        return True, []

    violations = []
    sup_map = {s.supplier_id: s for s in suppliers}
    max_allowed = int(round(required_quantity * max_supplier_share))

    for sup_id, qty in allocations.items():
        if qty > max_allowed:
            name = sup_map[sup_id].supplier_name if sup_id in sup_map else sup_id
            share_pct = round((qty / required_quantity) * 100, 1)
            violations.append(
                f"Supplier '{name}' allocated {qty:,} units ({share_pct}%), exceeding concentration limit of {int(max_supplier_share*100)}% ({max_allowed:,} units)."
            )

    return len(violations) == 0, violations
