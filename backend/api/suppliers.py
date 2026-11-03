import asyncio
import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Body, HTTPException, Query
from app.data.seed_data import SUPPLIERS_SEED
from app.services.suppliers.discovery import SupplierDiscoveryService
from app.services.suppliers.verification import VerificationEngine
from app.services.suppliers.contacts import ContactService
from app.services.suppliers.ranking import SupplierRankingEngine
from app.services.maps.service import MapService
from app.services.suppliers.ingestion import LiveIngestionPipeline
from app.services.ai_service import ai_service
from app.services.profile_service import get_profile

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/suppliers", tags=["suppliers"])

SAVED_SUPPLIERS_STORE: List[Dict[str, Any]] = []

@router.get("")
async def list_suppliers(
    country: Optional[str] = Query(None, description="Filter by country"),
    city: Optional[str] = Query(None, description="Filter by city"),
    product: Optional[str] = Query(None, description="Filter by product name"),
    search: Optional[str] = Query(None, description="Search term in name, city, or product"),
    supplier_type: Optional[str] = Query(None, description="Filter by supplier type"),
    max_moq: Optional[int] = Query(None, description="Filter by maximum MOQ"),
    max_price: Optional[float] = Query(None, description="Filter by maximum unit price"),
    min_rating: Optional[float] = Query(None, description="Filter by minimum rating"),
    verified_only: bool = Query(True, description="Filter to verified suppliers only"),
    sort_by: str = Query("recommended", description="Sorting criterion"),
    business_id: str = Query("biz-001"),
):
    profile = get_profile(business_id)
    # Live Ingestion when search/product specified
    query_str = search or product
    if query_str and len(SUPPLIERS_SEED) < 15:
        try:
            pipeline = LiveIngestionPipeline()
            new_suppliers = await asyncio.wait_for(pipeline.discover_and_ingest(query_str, max_urls=1), timeout=2.5)
            if new_suppliers:
                SUPPLIERS_SEED.extend(new_suppliers)
        except Exception as e:
            logger.info(f"Live ingestion skipped or completed: {e}")

    search_res = SupplierDiscoveryService.search_suppliers(
        catalog=SUPPLIERS_SEED,
        query=search,
        product=product,
        country=country,
        city=city,
        supplier_type=supplier_type,
        max_moq=max_moq,
        max_price=max_price,
        min_rating=min_rating,
        verified_only=verified_only,
        sort_by=sort_by,
        business_profile=profile,
    )
    return search_res

@router.post("/natural-search")
async def natural_supplier_search(payload: Dict[str, Any] = Body(...)):
    query_text = payload.get("query", "")
    business_id = payload.get("business_id", "biz-001")
    profile = payload.get("business_profile") or get_profile(business_id)
    intent = ai_service.interpret_natural_search(query_text)
    
    # Live Ingestion
    search_query = intent.get("product") or intent.get("original_query") or query_text
    if search_query:
        try:
            pipeline = LiveIngestionPipeline()
            new_suppliers = await asyncio.wait_for(pipeline.discover_and_ingest(search_query, max_urls=1), timeout=2.5)
            if new_suppliers:
                SUPPLIERS_SEED.extend(new_suppliers)
        except Exception as e:
            logger.info(f"Live ingestion skipped or completed: {e}")

    search_res = SupplierDiscoveryService.search_suppliers(
        catalog=SUPPLIERS_SEED,
        query=None if intent.get("product") else intent.get("original_query"),
        product=intent.get("product"),
        country=intent.get("country"),
        city=intent.get("city"),
        supplier_type=intent.get("supplier_type"),
        max_moq=intent.get("max_moq"),
        max_price=intent.get("max_price"),
        min_rating=intent.get("min_rating"),
        verified_only=intent.get("verified_only", True),
        sort_by="cheapest" if intent.get("priority") == "price" else "recommended",
        business_profile=profile,
    )

    return {
        "structured_intent": intent,
        "search_results": search_res,
    }

@router.post("/compare")
def compare_suppliers(payload: Dict[str, Any] = Body(...)):
    supplier_ids = payload.get("supplier_ids") or payload.get("supplierIds") or []
    if len(supplier_ids) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 suppliers can be compared simultaneously.")

    profile = payload.get("business_profile") or payload.get("businessProfile") or get_profile("biz-001")
    candidates = [s for s in SUPPLIERS_SEED if s["id"] in supplier_ids]

    enriched = []
    for c in candidates:
        dossier = VerificationEngine.evaluate_supplier(c)
        score, dims, reason = SupplierRankingEngine.score_supplier(c, profile)
        c_copy = dict(c)
        c_copy["verification_status"] = dossier["verification_status"]
        c_copy["verification_score"] = dossier["verification_score"]
        c_copy["data_confidence"] = dossier["data_confidence"]
        c_copy["match_score"] = score
        c_copy["match_reason"] = reason
        enriched.append(c_copy)

    ai_summary = ai_service.summarize_supplier_comparison(enriched, profile)

    return {
        "compared_count": len(enriched),
        "suppliers": enriched,
        "ai_summary": ai_summary,
    }

from app.services.recommendation_service import generate_recommendations

@router.post("/recommendations")
def get_recommendations(payload: Dict[str, Any] = Body(...)):
    profile = payload.get("business_profile") or payload.get("businessProfile") or get_profile("biz-001")
    recs = generate_recommendations(SUPPLIERS_SEED, profile)
    return recs

@router.get("/clusters")
def get_map_clusters(zoom: int = Query(4)):
    return MapService.get_map_clusters_and_markers(SUPPLIERS_SEED, zoom_level=zoom)

@router.post("/save")
def save_supplier(payload: Dict[str, Any] = Body(...)):
    supplier_id = payload.get("supplier_id") or payload.get("supplierId")
    if not supplier_id:
        raise HTTPException(status_code=400, detail="supplier_id is required")

    existing = next((item for item in SAVED_SUPPLIERS_STORE if item["supplier_id"] == supplier_id), None)
    if existing:
        SAVED_SUPPLIERS_STORE.remove(existing)
        return {"action": "removed", "saved_id": existing["id"], "is_saved": False}

    s = next((item for item in SUPPLIERS_SEED if item["id"] == supplier_id), None)
    if not s:
        raise HTTPException(status_code=404, detail="Supplier not found")

    p0 = s.get("products", [{}])[0] if s.get("products") else {}
    new_saved = {
        "id": f"saved-{len(SAVED_SUPPLIERS_STORE) + 1}",
        "supplier_id": s["id"],
        "supplier_name": s["name"],
        "product_name": p0.get("name", "Product line"),
        "country": s.get("country", ""),
        "city": s.get("city", ""),
        "current_price": p0.get("quoted_price"),
        "currency": p0.get("currency", "INR"),
        "current_rating": s.get("rating", 4.5),
        "last_verified_date": s.get("verification_date", "August 2026"),
        "saved_at": "Today",
    }
    SAVED_SUPPLIERS_STORE.insert(0, new_saved)
    return {"action": "saved", "item": new_saved, "is_saved": True}

@router.get("/saved")
def get_saved_suppliers():
    return SAVED_SUPPLIERS_STORE

@router.get("/{supplier_id}")
def get_supplier(supplier_id: str, business_id: str = Query("biz-001")):
    profile = get_profile(business_id)
    for s in SUPPLIERS_SEED:
        if s["id"] == supplier_id:
            dossier = VerificationEngine.evaluate_supplier(s)
            contact_info = ContactService.format_supplier_contacts(s)
            score, dims, reason = SupplierRankingEngine.score_supplier(s, profile)

            enriched = dict(s)
            enriched["verification_status"] = dossier["verification_status"]
            enriched["verification_score"] = dossier["verification_score"]
            enriched["data_confidence"] = dossier["data_confidence"]
            enriched["verification_dossier"] = dossier
            enriched["public_phone"] = contact_info["public_phone"]
            enriched["public_email"] = contact_info["public_email"]
            enriched["has_verified_email"] = contact_info["has_verified_email"]
            enriched["email_fallback_message"] = contact_info["email_fallback_message"]
            enriched["match_score"] = score
            enriched["match_reason"] = reason
            return enriched

    raise HTTPException(status_code=404, detail="Supplier not found")

@router.post("/{supplier_id}/report")
def report_supplier(supplier_id: str, payload: Dict[str, Any] = Body(...)):
    """User endpoint to report incorrect supplier data."""
    import uuid
    from core.database import SessionLocal
    from app.models.database import SupplierReport
    
    db = SessionLocal()
    try:
        report = SupplierReport(
            id=str(uuid.uuid4()),
            user_id=payload.get("user_id", "default_user"),
            supplier_id=supplier_id,
            report_type=payload.get("report_type", "other"),
            description=payload.get("description", "")
        )
        db.add(report)
        db.commit()
        return {"status": "success", "message": "Report submitted successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
