"""Country concentration and preferred/excluded country constraint logic."""
from typing import Dict, List, Tuple
from collections import defaultdict
from ..model.variables import CandidateSupplier

def check_country_constraints(
    allocations: Dict[str, int],
    required_quantity: int,
    max_country_share: float,
    excluded_countries: List[str],
    suppliers: List[CandidateSupplier]
) -> Tuple[bool, List[str]]:
    """Verify that allocations respect country-level constraints:
    1. No allocations to excluded countries.
    2. No country receives more than max_country_share (e.g. 70%) of total demand.
    Returns: (is_satisfied, violation_details)
    """
    violations = []
    sup_map = {s.supplier_id: s for s in suppliers}
    country_allocations = defaultdict(int)

    for sup_id, qty in allocations.items():
        if qty <= 0:
            continue
        sup = sup_map.get(sup_id)
        if not sup:
            continue

        # Check exclusion
        if excluded_countries and (sup.country in excluded_countries or sup.country_code in excluded_countries):
            violations.append(f"Supplier '{sup.supplier_name}' is located in excluded country '{sup.country}'.")

        country_allocations[sup.country] += qty

    if max_country_share < 0.999 and required_quantity > 0:
        max_allowed = int(round(required_quantity * max_country_share))
        for country, c_qty in country_allocations.items():
            if c_qty > max_allowed:
                share_pct = round((c_qty / required_quantity) * 100, 1)
                violations.append(
                    f"Country '{country}' allocated {c_qty:,} units ({share_pct}%), exceeding country cap of {int(max_country_share*100)}% ({max_allowed:,} units)."
                )

    return len(violations) == 0, violations
