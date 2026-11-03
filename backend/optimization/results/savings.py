"""Baseline calculation and savings analysis for optimization results."""
from typing import Dict, List, Optional, Any
from ..model.variables import CandidateSupplier

def calculate_savings_analysis(
    optimized_cost: float,
    optimized_lead_time: float,
    optimized_risk: float,
    total_demand: int,
    suppliers: List[CandidateSupplier]
) -> Dict[str, Any]:
    """Compare optimized multi-sourcing plan against single-source baseline."""
    eligible = [s for s in suppliers if s.is_verified]
    if not eligible or total_demand <= 0:
        return {
            "baseline_type": "None",
            "baseline_supplier_name": "None",
            "baseline_cost": optimized_cost,
            "savings_amount": 0.0,
            "savings_percentage": 0.0,
            "lead_time_delta_days": 0.0,
            "risk_score_delta": 0.0
        }

    # Single-source candidates: suppliers with capacity >= demand and MOQ <= demand
    single_source_candidates = [
        s for s in eligible 
        if s.capacity >= total_demand and s.moq <= total_demand
    ]

    baseline_supplier: CandidateSupplier
    if single_source_candidates:
        # Choose the most reputable or default local supplier among single-source candidates
        # If Utkal or local is among them, prefer it as the default single-source baseline
        local_cands = [s for s in single_source_candidates if s.country == "India"]
        if local_cands:
            baseline_supplier = max(local_cands, key=lambda s: s.rating)
        else:
            baseline_supplier = single_source_candidates[0]
        baseline_type = "Single-source verified supplier"
    else:
        # Fallback: Highest rated supplier regardless of capacity
        baseline_supplier = max(eligible, key=lambda s: s.rating)
        baseline_type = "Single-source primary supplier"

    baseline_cost = round(baseline_supplier.unit_price * total_demand, 2)
    baseline_lead = float(baseline_supplier.lead_time_days)
    baseline_risk = float(baseline_supplier.risk_score)

    savings_amount = round(max(0.0, baseline_cost - optimized_cost), 2)
    savings_pct = round((savings_amount / baseline_cost) * 100, 1) if baseline_cost > 0 else 0.0
    lead_delta = round(optimized_lead_time - baseline_lead, 1)
    risk_delta = round(baseline_risk - optimized_risk, 3)

    return {
        "baseline_type": baseline_type,
        "baseline_supplier_name": baseline_supplier.supplier_name,
        "baseline_cost": baseline_cost,
        "savings_amount": savings_amount,
        "savings_percentage": savings_pct,
        "lead_time_delta_days": lead_delta,
        "risk_score_delta": risk_delta
    }
