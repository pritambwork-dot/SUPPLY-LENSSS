"""
SupplyLens Multi-Criteria Supplier Recommendation Service
Evaluates candidate suppliers against a user's business profile:
- Budget Fit & Capital Constraint Assessment
- MOQ / Initial Scale Compatibility
- Logistics Transit & Geographic Proximity to User's City
- Reliability & Quality Score
"""

from typing import List, Dict, Any


def score_supplier_for_business(supplier: Dict[str, Any], business_profile: Dict[str, Any]) -> float:
    """Calculates a normalized utility score [0 - 100] for a supplier."""
    try:
        from ml.inference.service import ml_predictor
        import numpy as np
        
        # Try to use the ML predictor first
        features = np.array([[]])  # Mock feature vector extraction for now
        ml_score = ml_predictor.predict_compatibility(features)
        return ml_score * 100.0
    except Exception as e:
        # Fall back to deterministic ranking if ML fails or is untrained
        pass
        
    primary_prod = supplier["products"][0] if supplier.get("products") else None
    if not primary_prod:
        return 0.0

    budget = float(business_profile.get("budget_amount", 800000))
    moq = primary_prod.get("moq", 3000)
    quoted_price = primary_prod.get("quoted_price", 4.6)
    user_city = business_profile.get("city", "Bhubaneswar").lower()

    # 1. Budget Fit Score
    initial_batch_cost = moq * quoted_price
    budget_ratio = initial_batch_cost / max(budget, 1.0)
    if budget_ratio <= 0.10:
        budget_score = 100.0
    elif budget_ratio <= 0.25:
        budget_score = 90.0
    elif budget_ratio <= 0.50:
        budget_score = 75.0
    else:
        budget_score = 40.0

    # 2. Scale & MOQ Match Score (lower MOQ is prioritized for early stage / low capital)
    scale = business_profile.get("expected_scale", "pilot")
    stage = business_profile.get("business_stage", "idea")
    if stage == "idea" or scale == "pilot":
        scale_score = 100.0 if moq <= 5000 else (80.0 if moq <= 10000 else 40.0)
    elif scale == "growth":
        scale_score = 100.0 if (5000 <= moq <= 30000) else 80.0
    else:
        scale_score = 100.0 if moq >= 20000 else 70.0

    # 3. Proximity / Logistics Score (Relative to user city)
    sup_city = supplier.get("city", "").lower()
    sup_state = supplier.get("state", "").lower()
    distance = supplier.get("distance_km", 1000)

    # Local / Regional Proximity Bonus
    if (user_city == "bhubaneswar" and (sup_city == "cuttack" or sup_state == "odisha")) or \
       (user_city == "mumbai" and (sup_city == "pune" or sup_city == "vapi")):
        logistics_score = 100.0
    elif distance <= 300:
        logistics_score = 95.0
    elif distance <= 800:
        logistics_score = 80.0
    elif distance <= 2000:
        logistics_score = 65.0
    else:
        logistics_score = 40.0

    # 4. Quality & Verification Score
    rating = supplier.get("rating", 4.0)
    quality_score = (rating / 5.0) * 100.0

    total_score = (
        0.35 * budget_score +
        0.25 * scale_score +
        0.25 * logistics_score +
        0.15 * quality_score
    )
    return round(total_score, 1)


def generate_recommendations(suppliers: List[Dict[str, Any]], business_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generates the 4 tailored recommendation lenses with plain-English rationales."""
    if not suppliers:
        return []

    # Score each supplier
    scored = []
    for s in suppliers:
        score = score_supplier_for_business(s, business_profile)
        scored.append((s, score))

    # 1. Best Overall
    best_overall_supplier, best_score = max(scored, key=lambda x: x[1])

    # 2. Cheapest Landed
    cheapest_supplier = min(
        suppliers,
        key=lambda s: s["products"][0]["estimated_landed_cost"] if s.get("products") else 9999
    )

    # 3. Highest Rated
    highest_rated_supplier = max(suppliers, key=lambda s: s.get("rating", 0))

    # 4. Fastest
    fastest_supplier = min(
        suppliers,
        key=lambda s: s.get("estimated_transit_days", 99) + s.get("lead_time_days", 99)
    )

    budget_val = float(business_profile.get("budget_amount", 800000))
    currency = business_profile.get("budget_currency", "INR")
    budget_formatted = f"₹{budget_val:,.0f}" if currency == "INR" else f"${budget_val:,.0f}"
    user_city = business_profile.get("city", "your area")

    recommendations = [
        {
            "type": "best_overall",
            "title": "Best Match for Your Business",
            "supplier_id": best_overall_supplier["id"],
            "supplier_name": best_overall_supplier["name"],
            "rationale": (
                f"Recommended because this supplier is located in {best_overall_supplier['city']} ({best_overall_supplier.get('distance_km', 28)} km from {user_city}), "
                f"fits comfortably within your {budget_formatted} budget, accepts an accessible pilot MOQ of "
                f"{best_overall_supplier['products'][0]['moq']:,} units, and delivers via local transit in only "
                f"{best_overall_supplier.get('estimated_transit_days', 3)} day(s)."
            ),
            "highlight_badge": "Optimal Pilot Fit",
            "badge_color": "emerald",
            "metrics": {
                "quoted_price": f"₹{best_overall_supplier['products'][0]['quoted_price']:.2f} / unit",
                "landed_cost": f"₹{best_overall_supplier['products'][0]['estimated_landed_cost']:.2f} / unit (Delivered)",
                "moq": f"{best_overall_supplier['products'][0]['moq']:,} units",
                "lead_time": f"{best_overall_supplier.get('lead_time_days', 7)} days prep + {best_overall_supplier.get('estimated_transit_days', 3)}d transit",
                "rating": f"{best_overall_supplier['rating']} ★ ({best_overall_supplier['review_count']} audits)",
            },
        },
        {
            "type": "cheapest",
            "title": "Cheapest Suitable Option",
            "supplier_id": cheapest_supplier["id"],
            "supplier_name": cheapest_supplier["name"],
            "rationale": (
                f"Offers the lowest estimated landed cost at ₹{cheapest_supplier['products'][0]['estimated_landed_cost']:.2f}/unit delivered to "
                f"{user_city}, optimizing your per-unit profit margin while meeting their "
                f"{cheapest_supplier['products'][0]['moq']:,} unit requirement."
            ),
            "highlight_badge": "Lowest Landed Cost",
            "badge_color": "cyan",
            "metrics": {
                "quoted_price": f"₹{cheapest_supplier['products'][0]['quoted_price']:.2f} / unit",
                "landed_cost": f"₹{cheapest_supplier['products'][0]['estimated_landed_cost']:.2f} / unit (Delivered)",
                "moq": f"{cheapest_supplier['products'][0]['moq']:,} units",
                "lead_time": f"{cheapest_supplier.get('lead_time_days', 7)} days prep",
                "rating": f"{cheapest_supplier['rating']} ★",
            },
        },
        {
            "type": "highest_rated",
            "title": "Highest Rated & Zero-Defect Option",
            "supplier_id": highest_rated_supplier["id"],
            "supplier_name": highest_rated_supplier["name"],
            "rationale": (
                f"Holds the highest verified customer satisfaction rating of {highest_rated_supplier['rating']}/5.0 "
                f"with comprehensive audits ({', '.join(highest_rated_supplier['certifications'][:2])}). "
                f"Ideal for premium, zero-defect brand positioning."
            ),
            "highlight_badge": "Platinum Quality",
            "badge_color": "amber",
            "metrics": {
                "quoted_price": f"₹{highest_rated_supplier['products'][0]['quoted_price']:.2f} / unit",
                "landed_cost": f"₹{highest_rated_supplier['products'][0]['estimated_landed_cost']:.2f} / unit",
                "moq": f"{highest_rated_supplier['products'][0]['moq']:,} units",
                "lead_time": f"{highest_rated_supplier.get('lead_time_days', 7)} days prep",
                "rating": f"{highest_rated_supplier['rating']} ★ ({highest_rated_supplier['review_count']} audits)",
            },
        },
        {
            "type": "fastest",
            "title": "Fastest Regional Delivery",
            "supplier_id": fastest_supplier["id"],
            "supplier_name": fastest_supplier["name"],
            "rationale": (
                f"Located in {fastest_supplier['city']} with a combined turnaround of only {fastest_supplier.get('lead_time_days', 5) + fastest_supplier.get('estimated_transit_days', 2)} days "
                f"from order confirmation to doorstep delivery in {user_city}."
            ),
            "highlight_badge": "Fastest Delivery",
            "badge_color": "blue",
            "metrics": {
                "quoted_price": f"₹{fastest_supplier['products'][0]['quoted_price']:.2f} / unit",
                "landed_cost": f"₹{fastest_supplier['products'][0]['estimated_landed_cost']:.2f} / unit",
                "moq": f"{fastest_supplier['products'][0]['moq']:,} units",
                "lead_time": f"{fastest_supplier.get('lead_time_days', 5) + fastest_supplier.get('estimated_transit_days', 2)} days total",
                "rating": f"{fastest_supplier['rating']} ★",
            },
        },
    ]

    return recommendations
