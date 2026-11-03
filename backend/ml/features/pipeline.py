"""Feature extraction pipeline transforming raw entities into numerical vector spaces."""
from typing import Dict, Any, List
from .encoder import (
    normalize_budget,
    normalize_moq,
    normalize_capacity,
    normalize_price,
    normalize_lead_time,
    normalize_rating,
    min_max_scale,
    log_scale
)

USER_FEATURE_DIM = 8
SUPPLIER_FEATURE_DIM = 8

def extract_user_vector(profile: Dict[str, Any]) -> List[float]:
    """Transform user business profile into an 8-dimensional normalized embedding vector."""
    # 1. Budget amount (log scale)
    budget = float(profile.get("budgetAmount") or profile.get("budget_amount") or 800000.0)
    f0_budget = normalize_budget(budget)

    # 2. Stage: idea / testing = 1.0, growth / scaled = 0.0
    stage = str(profile.get("businessStage") or profile.get("business_stage") or "idea").lower()
    f1_is_idea = 1.0 if stage in ("idea", "testing", "early") else 0.0

    # 3. Stage: growth / scaled = 1.0
    f2_is_growth = 1.0 if stage in ("growing", "scaled", "established") else 0.0

    # 4. Expected scale / pilot = low MOQ appetite (0.2), growth (0.6), scaled (1.0)
    scale = str(profile.get("expectedScale") or profile.get("expected_scale") or "pilot").lower()
    scale_map = {"pilot": 0.2, "growth": 0.6, "scaled": 1.0}
    f3_scale = scale_map.get(scale, 0.4)

    # 5. Sourcing preference: domestic = 1.0, international/balanced = 0.0
    pref = str(profile.get("sourcingPreference") or profile.get("sourcing_preference") or "balanced").lower()
    f4_domestic_pref = 1.0 if pref == "domestic" else 0.0

    # 6. Model: B2B/Wholesale = 1.0, D2C/B2C = 0.5
    model = str(profile.get("businessModel") or profile.get("business_model") or "B2B").upper()
    f5_is_b2b = 1.0 if "B2B" in model or "WHOLESALE" in model else 0.5

    # 7. Facility status: have facility = 1.0, need facility = 0.0
    fac = str(profile.get("facilityStatus") or profile.get("facility_status") or "not_sure").lower()
    f6_facility = 1.0 if fac == "have_facility" else 0.0

    # 8. Location affinity: India domestic base = 1.0, others = 0.5
    country = str(profile.get("country") or "India").lower()
    f7_is_india_base = 1.0 if "india" in country else 0.5

    return [
        round(f0_budget, 4),
        f1_is_idea,
        f2_is_growth,
        f3_scale,
        f4_domestic_pref,
        f5_is_b2b,
        f6_facility,
        f7_is_india_base,
    ]

def extract_supplier_vector(supplier: Dict[str, Any]) -> List[float]:
    """Transform candidate supplier dictionary into an 8-dimensional normalized embedding vector."""
    # Price
    products = supplier.get("products", [])
    price = 15.0
    moq = 2000
    if products:
        p = products[0]
        price = float(p.get("estimated_landed_cost") or p.get("quoted_price") or 15.0)
        moq = int(p.get("moq", 2000))

    f0_price = normalize_price(price)
    f1_moq = normalize_moq(moq)

    # Capacity
    cap = int(supplier.get("monthly_capacity") or 25000)
    f2_capacity = normalize_capacity(cap)

    # Rating
    rating = float(supplier.get("rating") or 4.5)
    f3_rating = normalize_rating(rating)

    # Verification score
    v_score = float(supplier.get("verification_score") or 90.0)
    f4_verification = min_max_scale(v_score, 50.0, 100.0)

    # Lead time
    lead = int(supplier.get("lead_time_days", 7) + supplier.get("estimated_transit_days", 3))
    f5_lead_time = normalize_lead_time(lead)

    # Domestic indicator
    country = str(supplier.get("country") or "India").lower()
    f6_is_domestic = 1.0 if "india" in country else 0.0

    # Data confidence
    conf = float(supplier.get("data_confidence") or 90.0)
    f7_confidence = min_max_scale(conf, 50.0, 100.0)

    return [
        round(f0_price, 4),
        round(f1_moq, 4),
        round(f2_capacity, 4),
        round(f3_rating, 4),
        round(f4_verification, 4),
        round(f5_lead_time, 4),
        f6_is_domestic,
        round(f7_confidence, 4),
    ]

def extract_price_regression_vector(
    category: str,
    country: str,
    quantity: int,
    supplier_type: str = "OEM"
) -> List[float]:
    """Vector for price estimation model (5 dimensions)."""
    # 1. Quantity (log scale 500 to 50,000)
    qty_norm = log_scale(float(quantity), 500.0, 50000.0)

    # 2. Country indicator
    c_lower = country.lower()
    is_china = 1.0 if "china" in c_lower or "cn" in c_lower else 0.0
    is_india = 1.0 if "india" in c_lower or "in" in c_lower else 0.0
    is_vietnam = 1.0 if "vietnam" in c_lower or "vn" in c_lower else 0.0

    # 3. Supplier tier: OEM = 1.0, distributor/agent = 0.5
    is_oem = 1.0 if "oem" in supplier_type.lower() or "manufacturer" in supplier_type.lower() else 0.5

    return [
        round(qty_norm, 4),
        is_china,
        is_india,
        is_vietnam,
        is_oem
    ]

def extract_risk_vector(supplier: Dict[str, Any]) -> List[float]:
    """Vector for supplier operational risk prediction (6 dimensions)."""
    v_score = float(supplier.get("verification_score") or 90.0)
    f0_inv_verif = 1.0 - min_max_scale(v_score, 60.0, 100.0)

    conf = float(supplier.get("data_confidence") or 90.0)
    f1_inv_conf = 1.0 - min_max_scale(conf, 60.0, 100.0)

    dist = float(supplier.get("distance_km") or 1000.0)
    f2_distance = min_max_scale(dist, 10.0, 8000.0)

    lead = int(supplier.get("lead_time_days", 7) + supplier.get("estimated_transit_days", 3))
    f3_lead_time = normalize_lead_time(lead)

    reviews = int(supplier.get("review_count") or 20)
    f4_few_reviews = 1.0 - min_max_scale(float(reviews), 1.0, 100.0)

    est_year = int(supplier.get("established_year") or 2018)
    age = max(1, 2026 - est_year)
    f5_young_company = 1.0 - min_max_scale(float(age), 1.0, 25.0)

    return [
        round(f0_inv_verif, 4),
        round(f1_inv_conf, 4),
        round(f2_distance, 4),
        round(f3_lead_time, 4),
        round(f4_few_reviews, 4),
        round(f5_young_company, 4),
    ]
