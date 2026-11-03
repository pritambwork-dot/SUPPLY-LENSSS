"""Multi-Objective aggregate scalar evaluator combining Cost, Risk, Logistics, and Diversification."""
from typing import Dict, List
from ..model.variables import CandidateSupplier
from ..model.problem import ObjectiveWeights
from .cost import calculate_total_cost
from .risk import calculate_weighted_risk
from .logistics import calculate_weighted_lead_time
from .diversification import calculate_concentration_hhi

def evaluate_multi_objective(
    allocations: Dict[str, int],
    suppliers: List[CandidateSupplier],
    total_demand: int,
    weights: ObjectiveWeights,
    min_unit_price: float = 5.0,
    max_unit_price: float = 25.0
) -> float:
    """Evaluate aggregate scalar penalty (lower is better):
    F = w_cost * CostNorm + w_risk * RiskNorm + w_lead * LeadNorm + w_div * HHINorm
    """
    if total_demand <= 0:
        return 0.0

    sup_map = {s.supplier_id: s for s in suppliers}
    total_cost = calculate_total_cost(allocations, suppliers)
    avg_unit_cost = total_cost / total_demand

    # Normalized cost metric in [0, 1]
    cost_span = max(1.0, max_unit_price - min_unit_price)
    cost_norm = max(0.0, min(1.0, (avg_unit_cost - min_unit_price) / cost_span))

    # Normalized risk metric in [0, 1] (prefers neural risk if available)
    weighted_risk = sum(
        qty * (sup_map[s_id].neural_risk_score if sup_map[s_id].neural_risk_score is not None else sup_map[s_id].risk_score)
        for s_id, qty in allocations.items() if s_id in sup_map
    ) / total_demand
    risk_norm = max(0.0, min(1.0, weighted_risk))

    # Neural personalized fit reward in [0, 1]
    fit_reward = sum(
        qty * sup_map[s_id].neural_fit_score
        for s_id, qty in allocations.items() if s_id in sup_map
    ) / total_demand

    # Normalized lead time (normalize across 0-30 days)
    avg_lead_time = calculate_weighted_lead_time(allocations, suppliers, total_demand)
    lead_norm = max(0.0, min(1.0, avg_lead_time / 30.0))

    # Concentration / HHI metric in [0, 1]
    hhi_norm = calculate_concentration_hhi(allocations, total_demand)

    scalar_penalty = (
        weights.weight_cost * cost_norm +
        weights.weight_risk * risk_norm +
        weights.weight_logistics * lead_norm +
        weights.weight_diversification * hhi_norm -
        0.10 * fit_reward
    )

    return round(scalar_penalty, 6)
