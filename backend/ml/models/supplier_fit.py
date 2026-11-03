"""Supplier Fit Two-Tower Neural Prediction Model."""
import os
from typing import Dict, Any, List, Optional
from ..nn.two_tower import TwoTowerMatchingNetwork
from ..features.pipeline import extract_user_vector, extract_supplier_vector

CHECKPOINT_PATH = os.path.join(os.path.dirname(__file__), "..", "checkpoints", "supplier_fit_v1.json")

class SupplierFitModel:
    """Wrapper for Two-Tower Personalized Supplier Compatibility Model."""

    def __init__(self, checkpoint_file: Optional[str] = None):
        self.model: Optional[TwoTowerMatchingNetwork] = None
        path = checkpoint_file or CHECKPOINT_PATH
        if os.path.exists(path):
            try:
                self.model = TwoTowerMatchingNetwork.load(path)
            except Exception:
                self.model = None

        if self.model is None:
            # Initialize fresh instance
            self.model = TwoTowerMatchingNetwork(user_dim=8, supplier_dim=8, embedding_dim=8)

    def predict_fit(
        self,
        business_profile: Dict[str, Any],
        supplier: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Compute personalized supplier compatibility score and diagnostic factor breakdown."""
        x_user = extract_user_vector(business_profile)
        x_supplier = extract_supplier_vector(supplier)

        # Forward pass through Two-Tower neural network
        fit_score = self.model.forward(x_user, x_supplier)
        fit_score = max(0.01, min(0.99, fit_score))
        pct = int(round(fit_score * 100))

        # Assign tier
        if pct >= 85:
            tier = "Exceptional Match"
        elif pct >= 70:
            tier = "Strong Match"
        elif pct >= 50:
            tier = "Moderate Match"
        else:
            tier = "Low Fit"

        # Diagnostic compatibility breakdown
        # 1. Budget vs MOQ alignment
        budget = float(business_profile.get("budgetAmount") or business_profile.get("budget_amount") or 800000.0)
        p = supplier.get("products", [{}])[0]
        moq = int(p.get("moq", 2000))
        price = float(p.get("quoted_price", 15.0))
        min_order_cost = moq * price
        budget_ratio = min_order_cost / max(1.0, budget)
        budget_fit = max(0.2, min(1.0, 1.0 - budget_ratio))

        # 2. Geographic / Transit alignment
        is_domestic = supplier.get("country", "India").lower() == "india"
        pref = str(business_profile.get("sourcingPreference") or "balanced").lower()
        if pref == "domestic":
            geo_fit = 0.95 if is_domestic else 0.40
        else:
            geo_fit = 0.85

        # 3. Verification & Reliability
        v_score = float(supplier.get("verification_score") or 90.0)
        verif_fit = v_score / 100.0

        # 4. Turnaround speed
        lead = int(supplier.get("lead_time_days", 7) + supplier.get("estimated_transit_days", 3))
        speed_fit = max(0.3, min(1.0, 1.0 - (lead / 35.0)))

        # Determine top positive factor and watchpoint
        if budget_fit >= 0.85:
            top_positive = f"Low factory MOQ ({moq:,} units) fits your working capital budget smoothly."
        elif is_domestic and lead <= 5:
            top_positive = f"Fast regional transit (~{lead} days) eliminates sea transit delays."
        elif verif_fit >= 0.95:
            top_positive = f"High verification audit score ({int(v_score)}/100) minimizes production defects."
        else:
            top_positive = "Solid commercial match across capacity and pricing."

        watchpoint = None
        if budget_ratio > 0.35:
            watchpoint = f"High initial batch cash outlay (₹{min_order_cost:,.0f}) relative to your ₹{budget:,.0f} budget."
        elif not is_domestic and lead > 20:
            watchpoint = f"Long international lead time (~{lead} days) requires early inventory reordering."

        return {
            "supplier_id": supplier.get("id", ""),
            "supplier_name": supplier.get("display_name") or supplier.get("name", ""),
            "fit_score": round(fit_score, 4),
            "fit_percentage": pct,
            "fit_tier": tier,
            "compatibility_breakdown": {
                "budget_alignment": round(budget_fit, 2),
                "geographic_alignment": round(geo_fit, 2),
                "verification_confidence": round(verif_fit, 2),
                "turnaround_speed": round(speed_fit, 2)
            },
            "top_positive_factor": top_positive,
            "watchpoint": watchpoint,
            "model_version": "TwoTower-v1.0"
        }
