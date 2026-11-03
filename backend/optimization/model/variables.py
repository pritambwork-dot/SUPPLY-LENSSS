"""Decision variables and Candidate Supplier data structure for Sourcing Optimization."""
from dataclasses import dataclass
from typing import Optional, Dict, Any

@dataclass
class CandidateSupplier:
    """Represents a verified supplier candidate evaluated by the optimization solver."""
    supplier_id: str
    supplier_name: str
    country: str
    country_code: str
    unit_price: float              # Landed cost per unit or factory price
    moq: int                       # Minimum Order Quantity
    capacity: int                  # Maximum monthly production capacity
    lead_time_days: int            # Order-to-delivery lead time in days
    risk_score: float              # Risk score in [0.0, 1.0] (lower is safer)
    verification_score: float      # Verification score (0 - 100)
    rating: float                  # Customer / directory rating (e.g. 4.8)
    is_verified: bool
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    currency: str = "INR"
    neural_fit_score: float = 0.5
    neural_risk_score: Optional[float] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any], destination_city: Optional[str] = None) -> "CandidateSupplier":
        """Extract candidate parameters from a raw supplier dictionary and product specs."""
        supplier_id = data.get("id", "")
        supplier_name = data.get("display_name") or data.get("name", "")
        country = data.get("country", "India")
        country_code = data.get("country_code", "IN")
        is_verified = bool(
            data.get("verified") if "verified" in data else (data.get("verification_status") in ("Verified", "verified"))
        )
        verification_score = float(data.get("verification_score", 90))
        rating = float(data.get("rating", 4.5))
        lead_time = int(data.get("lead_time_days", 7) + data.get("estimated_transit_days", 2))
        capacity = int(data.get("monthly_capacity", 30000))
        
        # Risk score derived from supplier risk_score or verification score
        raw_risk = data.get("risk_score")
        if raw_risk is not None:
            risk_score = float(raw_risk)
        else:
            risk_score = max(0.05, round((100.0 - verification_score) / 100.0, 3))

        # Check primary product
        products = data.get("products", [])
        product_id = None
        product_name = None
        moq = 1000
        unit_price = 15.0

        if products:
            p = products[0]
            product_id = p.get("id")
            product_name = p.get("name")
            moq = int(p.get("moq", 1000))
            # Use estimated landed cost if available, otherwise quoted_price
            unit_price = float(p.get("estimated_landed_cost") or p.get("quoted_price") or 15.0)

        return cls(
            supplier_id=supplier_id,
            supplier_name=supplier_name,
            country=country,
            country_code=country_code,
            unit_price=unit_price,
            moq=moq,
            capacity=capacity,
            lead_time_days=lead_time,
            risk_score=risk_score,
            verification_score=verification_score,
            rating=rating,
            is_verified=is_verified,
            product_id=product_id,
            product_name=product_name,
            currency="INR",
            neural_fit_score=float(data.get("neural_fit_score", 0.5)),
            neural_risk_score=float(data["neural_risk_score"]) if data.get("neural_risk_score") is not None else None
        )
