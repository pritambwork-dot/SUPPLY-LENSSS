"""Demand constraint logic for the Sourcing Optimization Engine."""
from typing import Dict, Tuple

def check_demand_constraint(allocations: Dict[str, int], required_quantity: int) -> Tuple[bool, int, str]:
    """Verify that total allocated units fulfill required demand.
    Returns: (is_satisfied, actual_total, description)
    """
    total_allocated = sum(allocations.values())
    satisfied = total_allocated >= required_quantity
    desc = f"Demand requirement: {required_quantity:,} units. Total allocated: {total_allocated:,} units."
    return satisfied, total_allocated, desc
