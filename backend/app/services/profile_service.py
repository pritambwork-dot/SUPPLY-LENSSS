"""
SupplyLens Profile Engine Service
Handles persistent structured profiles, validation, and progress milestone updates.
"""

from typing import Dict, Any, Optional
from datetime import datetime
import uuid

# In-memory store for fallback when DB is disconnected
PROFILES_STORE: Dict[str, Dict[str, Any]] = {
    "biz-001": {
        "id": "biz-001",
        "user_id": "usr-lead-sourcing",
        "name": "EcoPack Global Ventures",
        "idea": "Sustainable biodegradable packaging solutions for B2B brands",
        "sector": "Sustainable Packaging",
        "location": "Bhubaneswar, India",
        "city": "Bhubaneswar",
        "country": "India",
        "target_market": "Domestic & Global B2B",
        "target_customer": "D2C brands and e-commerce enterprises",
        "budget_amount": 800000.0,
        "budget_currency": "INR",
        "business_model": "B2B",
        "expected_scale": "growth",
        "business_stage": "testing",
        "sourcing_preference": "domestic",
        "manufacturing_preference": "contract_oem",
        "facility_status": "need_facility",
        "updated_at": datetime.utcnow().isoformat(),
    }
}


def validate_and_save_profile(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """Validates raw extracted facts and updates profile store."""
    business_id = profile_data.get("id") or f"biz-{uuid.uuid4().hex[:8]}"

    # Type & Range Normalizations
    budget_raw = profile_data.get("budget_amount", profile_data.get("budget", 800000))
    try:
        budget_amount = float(budget_raw)
    except (ValueError, TypeError):
        budget_amount = 800000.0

    sanitized: Dict[str, Any] = {
        "id": business_id,
        "user_id": profile_data.get("user_id", "usr-guest"),
        "name": profile_data.get("name") or profile_data.get("business_name") or "My Business",
        "idea": profile_data.get("idea") or profile_data.get("business_idea", ""),
        "sector": profile_data.get("sector", "General Manufacturing"),
        "location": profile_data.get("location", "India"),
        "city": profile_data.get("city", "Bhubaneswar"),
        "country": profile_data.get("country", "India"),
        "target_market": profile_data.get("target_market", "Domestic"),
        "target_customer": profile_data.get("target_customer", "B2B customers"),
        "budget_amount": budget_amount,
        "budget_currency": profile_data.get("budget_currency", profile_data.get("currency", "INR")),
        "business_model": profile_data.get("business_model", "B2B"),
        "expected_scale": profile_data.get("expected_scale", "growth"),
        "business_stage": profile_data.get("business_stage", "testing"),
        "sourcing_preference": profile_data.get("sourcing_preference", "domestic"),
        "manufacturing_preference": profile_data.get("manufacturing_preference", "contract_oem"),
        "facility_status": profile_data.get("facility_status", "need_facility"),
        "updated_at": datetime.utcnow().isoformat(),
    }

    PROFILES_STORE[business_id] = sanitized
    return sanitized


def get_profile(business_id: str) -> Dict[str, Any]:
    """Retrieves structured business profile by ID."""
    return PROFILES_STORE.get(business_id) or PROFILES_STORE.get("biz-001") or {}
