"""Format and enrich allocation results with supplier details and percentages."""
from typing import Dict, List, Any
from ..model.variables import CandidateSupplier

def format_allocations(
    allocations: Dict[str, int], 
    suppliers: List[CandidateSupplier],
    total_demand: int
) -> List[Dict[str, Any]]:
    """Format allocation map into enriched supplier allocation list."""
    sup_map = {s.supplier_id: s for s in suppliers}
    results = []

    # Sort allocations in descending order of quantity
    sorted_items = sorted(allocations.items(), key=lambda item: item[1], reverse=True)

    for sup_id, qty in sorted_items:
        if qty <= 0:
            continue
        sup = sup_map.get(sup_id)
        if not sup:
            continue

        pct = round((qty / total_demand) * 100, 1) if total_demand > 0 else 0.0
        total_sup_cost = round(qty * sup.unit_price, 2)

        results.append({
            "supplier_id": sup.supplier_id,
            "supplier_name": sup.supplier_name,
            "country": sup.country,
            "quantity": qty,
            "percentage_of_total": pct,
            "unit_price": sup.unit_price,
            "total_cost": total_sup_cost,
            "moq": sup.moq,
            "lead_time_days": sup.lead_time_days,
            "risk_score": sup.risk_score,
            "verification_score": sup.verification_score,
            "rating": sup.rating
        })

    return results
