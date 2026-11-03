from typing import Any, Dict
from fastapi import APIRouter, Body, HTTPException
from app.data.seed_data import SUPPLIERS_SEED
from ml import neural_service
from app.services.profile_service import get_profile

router = APIRouter(prefix="/api/ml", tags=["ml"])

@router.post("/predict-fit")
def predict_supplier_fit_endpoint(payload: Dict[str, Any] = Body(...)):
    business_id = payload.get("business_id", "biz-001")
    profile = payload.get("business_profile") or get_profile(business_id)
    supplier_id = payload.get("supplier_id")
    supplier = next((s for s in SUPPLIERS_SEED if s["id"] == supplier_id), None)
    if not supplier:
        raise HTTPException(status_code=404, detail=f"Supplier '{supplier_id}' not found")
    return neural_service.predict_supplier_fit(profile, supplier)

@router.post("/predict-price")
def predict_price_range_endpoint(payload: Dict[str, Any] = Body(...)):
    product_name = payload.get("product_name", "Standard Packaging")
    category = payload.get("category", "Packaging")
    country = payload.get("country", "India")
    quantity = int(payload.get("order_quantity") or payload.get("quantity") or 5000)
    supplier_type = payload.get("supplier_type", "OEM")
    return neural_service.predict_price_range(product_name, category, country, quantity, supplier_type)

@router.post("/predict-risk")
def predict_supplier_risk_endpoint(payload: Dict[str, Any] = Body(...)):
    supplier_id = payload.get("supplier_id")
    supplier = next((s for s in SUPPLIERS_SEED if s["id"] == supplier_id), None)
    if not supplier:
        raise HTTPException(status_code=404, detail=f"Supplier '{supplier_id}' not found")
    return neural_service.predict_supplier_risk(supplier)

@router.post("/batch-rank")
def batch_rank_suppliers_endpoint(payload: Dict[str, Any] = Body(...)):
    business_id = payload.get("business_id", "biz-001")
    profile = payload.get("business_profile") or get_profile(business_id)
    top_k = int(payload.get("top_k", 10))
    candidate_ids = payload.get("candidate_supplier_ids")
    candidates = [s for s in SUPPLIERS_SEED if not candidate_ids or s["id"] in candidate_ids]
    return neural_service.rank_suppliers_for_profile(profile, candidates, top_k)

@router.get("/models")
def get_ml_models_metadata_endpoint():
    return neural_service.get_models_metadata()
