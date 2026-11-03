"""Diversification objective based on the Herfindahl-Hirschman Index (HHI)."""
from typing import Dict

def calculate_concentration_hhi(allocations: Dict[str, int], total_demand: int) -> float:
    """Calculate the Herfindahl-Hirschman Index (sum of squared market shares).
    Range: [1/k, 1.0] where 1.0 is 100% single-supplier concentration.
    Lower values indicate higher resilience and diversification.
    """
    if total_demand <= 0:
        return 1.0
    active_shares = [qty / total_demand for qty in allocations.values() if qty > 0]
    if not active_shares:
        return 1.0
    return round(sum(s ** 2 for s in active_shares), 4)

def calculate_diversification_score(allocations: Dict[str, int], total_demand: int) -> float:
    """Returns a normalized resilience score in [0.0, 1.0] where 1.0 is maximally diversified."""
    hhi = calculate_concentration_hhi(allocations, total_demand)
    # Convert HHI (where 1.0 is monolithic single source) into 0-1 diversification score
    return round(max(0.0, min(1.0, 1.0 - hhi)), 3)
