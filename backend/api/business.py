from typing import Any, Dict
from fastapi import APIRouter, Body, HTTPException, Query
from app.services.business_service import classify_budget, generate_business_snapshot, get_stage_guidelines
from app.services.profile_service import validate_and_save_profile, get_profile

router = APIRouter(prefix="/api/business", tags=["business"])

@router.get("/profile")
def fetch_profile(business_id: str = Query("biz-001")):
    profile = get_profile(business_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    budget_info = classify_budget(profile["budget_amount"], profile["budget_currency"])
    profile["budget_constraint_category"] = budget_info["category"]
    profile["budget_insight"] = budget_info["insight"]
    profile["business_snapshot"] = generate_business_snapshot(profile)
    profile["stage_guidelines"] = get_stage_guidelines(profile.get("business_stage", "idea"))
    return profile

@router.post("/profile")
def update_profile(profile_data: Dict[str, Any] = Body(...)):
    saved = validate_and_save_profile(profile_data)
    budget_info = classify_budget(saved["budget_amount"], saved["budget_currency"])
    saved["budget_constraint_category"] = budget_info["category"]
    saved["budget_insight"] = budget_info["insight"]
    saved["business_snapshot"] = generate_business_snapshot(saved)
    return saved
