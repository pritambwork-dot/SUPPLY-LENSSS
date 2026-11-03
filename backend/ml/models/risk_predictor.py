"""Supplier Operational Risk Neural Prediction Model."""
import os
from typing import Dict, Any, List, Optional
from ..nn.mlp import MultiLayerPerceptron
from ..features.pipeline import extract_risk_vector

CHECKPOINT_PATH = os.path.join(os.path.dirname(__file__), "..", "checkpoints", "risk_predictor_v1.json")

class SupplierRiskModel:
    """Predicts operational risk probabilities from multi-dimensional supplier signals."""

    def __init__(self, checkpoint_file: Optional[str] = None):
        self.model: Optional[MultiLayerPerceptron] = None
        path = checkpoint_file or CHECKPOINT_PATH
        if os.path.exists(path):
            try:
                self.model = MultiLayerPerceptron.load(path)
            except Exception:
                self.model = None

        if self.model is None:
            self.model = MultiLayerPerceptron(layer_dims=[6, 12, 6, 1], activations=["relu", "relu", "sigmoid"])

    def predict_risk(self, supplier: Dict[str, Any]) -> Dict[str, Any]:
        """Compute operational risk score, risk level, and key risk drivers."""
        x = extract_risk_vector(supplier)
        predicted_risk = self.model.forward(x)[0]
        predicted_risk = max(0.04, min(0.95, predicted_risk))

        if predicted_risk < 0.18:
            risk_level = "Low Risk"
        elif predicted_risk < 0.35:
            risk_level = "Moderate Risk"
        else:
            risk_level = "Elevated Risk"

        reliability_idx = round(1.0 - predicted_risk, 3)

        # Risk drivers
        drivers = []
        lead = int(supplier.get("lead_time_days", 7) + supplier.get("estimated_transit_days", 3))
        if lead > 20:
            drivers.append(f"Long international transit route (~{lead} days delivery)")
        elif lead <= 5:
            drivers.append("Short local transit minimizes logistics friction")

        v_score = float(supplier.get("verification_score") or 90.0)
        if v_score < 90.0:
            drivers.append("Limited state regulatory audits available")
        else:
            drivers.append("Verified facility with ISO/CPCB compliant audits")

        if supplier.get("country", "India").lower() != "india":
            drivers.append("Cross-border customs and port clearance exposure")

        return {
            "supplier_id": supplier.get("id", ""),
            "supplier_name": supplier.get("display_name") or supplier.get("name", ""),
            "predicted_risk_score": round(predicted_risk, 4),
            "risk_level": risk_level,
            "reliability_index": reliability_idx,
            "risk_drivers": drivers,
            "model_version": "RiskMLP-v1.0"
        }
