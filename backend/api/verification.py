import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
from fastapi import APIRouter, Body, HTTPException, Query
from app.data.seed_data import SUPPLIERS_SEED
from app.services.suppliers.verification import VerificationEngine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/verification", tags=["verification"])

# In-memory audit trail for manual reviews and live verifications
VERIFICATION_AUDIT_LOGS: List[Dict[str, Any]] = [
    {
        "id": "log-001",
        "supplier_id": "sup-ecopack-001",
        "supplier_name": "EcoPack Systems Ltd",
        "action": "AUTOMATED_VERIFY_PASS",
        "previous_status": "Demo partially verified",
        "new_status": "Demo verified",
        "auditor": "System (Deterministic 10-D Engine)",
        "timestamp": "2026-11-03T10:15:00Z",
        "notes": "All 10 dimensions evaluated. Machine and GIS geo-coordinates verified."
    },
    {
        "id": "log-002",
        "supplier_id": "sup-greenbox-002",
        "supplier_name": "GreenBox Packaging Co",
        "action": "MANUAL_AUDIT_APPROVED",
        "previous_status": "Demo requires review",
        "new_status": "Demo verified",
        "auditor": "Auditor S. Kulkarni (Admin Desk)",
        "timestamp": "2026-11-03T11:42:00Z",
        "notes": "Verified third-party FSC certification certificate ref FSC-C104523."
    }
]


@router.get("/dashboard")
def get_verification_dashboard():
    """
    Returns high-level verification metrics across the supplier catalog.
    Evaluates real-time verification distribution, pass rates, and pending reviews.
    """
    total = len(SUPPLIERS_SEED)
    verified_count = 0
    partially_count = 0
    requires_review_count = 0
    failed_count = 0
    unverified_count = 0
    total_score = 0

    evaluated_suppliers = []

    for s in SUPPLIERS_SEED:
        eval_res = VerificationEngine.evaluate_supplier(s, is_demo=True)
        score = eval_res["verification_score"]
        total_score += score
        status_key = eval_res["status_key"]

        if "verified" in status_key and "partially" not in status_key and "unverified" not in status_key:
            verified_count += 1
        elif "partially" in status_key:
            partially_count += 1
        elif "review" in status_key:
            requires_review_count += 1
        elif "failed" in status_key:
            failed_count += 1
        else:
            unverified_count += 1

        evaluated_suppliers.append({
            "id": s["id"],
            "name": s["name"],
            "country": s.get("country", "India"),
            "city": s.get("city", ""),
            "status": eval_res["verification_status"],
            "status_key": eval_res["status_key"],
            "badge_text": eval_res["badge_text"],
            "score": score,
            "confidence": eval_res["data_confidence"],
            "passed_dimensions": eval_res["dimensions_passed"],
            "total_dimensions": eval_res["dimensions_evaluated"],
            "last_verified": eval_res["last_verified_date"],
        })

    avg_score = round(total_score / max(1, total), 1)
    pass_rate = round(((verified_count + partially_count) / max(1, total)) * 100, 1)

    return {
        "summary": {
            "total_suppliers": total,
            "verified_count": verified_count,
            "partially_verified_count": partially_count,
            "requires_review_count": requires_review_count,
            "failed_count": failed_count,
            "unverified_count": unverified_count,
            "average_score": avg_score,
            "compliance_pass_rate": f"{pass_rate}%",
            "environment": "DEMO ENVIRONMENT · SAMPLE DATA",
            "policy": "Isolated Simulated Verification Fixtures",
        },
        "dimensions": VerificationEngine.DIMENSIONS,
        "suppliers": evaluated_suppliers,
        "recent_audit_logs": VERIFICATION_AUDIT_LOGS[:10],
    }


@router.post("/verify/{supplier_id}")
def verify_supplier(supplier_id: str):
    """
    Executes real-time deterministic verification on a specific supplier.
    Saves and updates verification status with structured 10-dimension evaluation.
    """
    supplier = next((s for s in SUPPLIERS_SEED if s["id"] == supplier_id), None)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    eval_res = VerificationEngine.evaluate_supplier(supplier, is_demo=True)
    
    # Update seed supplier in memory
    supplier["verification_status"] = eval_res["verification_status"]
    supplier["verification_score"] = eval_res["verification_score"]
    supplier["data_confidence"] = eval_res["data_confidence"]
    supplier["verification_date"] = datetime.utcnow().strftime("%B %Y")

    # Record audit log
    log_entry = {
        "id": f"log-{len(VERIFICATION_AUDIT_LOGS) + 1}",
        "supplier_id": supplier["id"],
        "supplier_name": supplier["name"],
        "action": "LIVE_VERIFICATION_TRIGGERED",
        "previous_status": "Audited",
        "new_status": eval_res["verification_status"],
        "auditor": "System (10-D Deterministic Engine)",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "notes": f"Score: {eval_res['verification_score']}/100. Evaluated {eval_res['dimensions_passed']}/{eval_res['dimensions_evaluated']} dimensions."
    }
    VERIFICATION_AUDIT_LOGS.insert(0, log_entry)

    return {
        "status": "success",
        "message": f"Supplier verification completed for {supplier['name']}",
        "result": eval_res,
        "audit_entry": log_entry
    }


@router.get("/{supplier_id}/evidence")
def get_supplier_evidence(supplier_id: str):
    """
    Retrieves full evidence dossier and simulated inspection fixtures for a supplier.
    """
    supplier = next((s for s in SUPPLIERS_SEED if s["id"] == supplier_id), None)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    eval_res = VerificationEngine.evaluate_supplier(supplier, is_demo=True)

    return {
        "supplier_id": supplier["id"],
        "supplier_name": supplier["name"],
        "country": supplier.get("country", "India"),
        "verification_status": eval_res["verification_status"],
        "badge_text": eval_res["badge_text"],
        "score": eval_res["verification_score"],
        "confidence": eval_res["data_confidence"],
        "checks": eval_res["checks"],
        "evidence_dossier": eval_res["evidence_dossier"],
        "simulated_fixtures": eval_res["simulated_fixtures"],
        "history": [log for log in VERIFICATION_AUDIT_LOGS if log["supplier_id"] == supplier_id]
    }


@router.post("/{supplier_id}/review")
def review_supplier(supplier_id: str, payload: Dict[str, Any] = Body(...)):
    """
    Admin manual override / status update for supplier verification.
    """
    supplier = next((s for s in SUPPLIERS_SEED if s["id"] == supplier_id), None)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    new_status = payload.get("status", "Demo verified")
    notes = payload.get("notes", "Manual auditor verification verified.")
    auditor = payload.get("auditor", "Admin Lead Sourcing Director")

    supplier["verification_status"] = new_status
    supplier["verification_date"] = datetime.utcnow().strftime("%B %Y")

    log_entry = {
        "id": f"log-{len(VERIFICATION_AUDIT_LOGS) + 1}",
        "supplier_id": supplier["id"],
        "supplier_name": supplier["name"],
        "action": "ADMIN_OVERRIDE",
        "previous_status": supplier.get("verification_status", "Unverified"),
        "new_status": new_status,
        "auditor": auditor,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "notes": notes
    }
    VERIFICATION_AUDIT_LOGS.insert(0, log_entry)

    return {
        "status": "success",
        "message": f"Supplier status updated to {new_status}",
        "supplier_id": supplier["id"],
        "new_status": new_status,
        "audit_entry": log_entry
    }
