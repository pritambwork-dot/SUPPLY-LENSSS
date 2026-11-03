"""
SupplyLens Field-Level Evidence Collector & Conflict Detector
Stores immutable provenance records for every key supplier attribute and flags conflicting claims.
"""

import uuid
import time
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.database import SupplierFieldEvidence, SupplierConflict

logger = logging.getLogger(__name__)


class EvidenceCollector:
    @staticmethod
    def record_field_evidence(
        db: Optional[Session],
        supplier_id: str,
        field_name: str,
        field_value: str,
        source_url: str,
        source_type: str = "official_company_website",
        provider: str = "apify",
        excerpt: Optional[str] = None,
        confidence: str = "high",
        verification_status: str = "passed",
        candidate_id: Optional[str] = None,
    ) -> Optional[str]:
        """
        Records an immutable provenance proof for a specific supplier attribute.
        Detects conflicts if an existing verified claim differs significantly.
        """
        if not db or not supplier_id or not field_value:
            return None

        str_val = str(field_value).strip()

        try:
            # 1. Conflict Check: Look for conflicting evidence on the same field
            existing = (
                db.query(SupplierFieldEvidence)
                .filter(
                    SupplierFieldEvidence.supplier_id == supplier_id,
                    SupplierFieldEvidence.field_name == field_name,
                )
                .first()
            )

            if existing and existing.field_value != str_val and len(str_val) > 2 and len(existing.field_value) > 2:
                # Log Conflict
                conflict_id = f"conf-{uuid.uuid4().hex[:12]}"
                conflict = SupplierConflict(
                    id=conflict_id,
                    supplier_id=supplier_id,
                    field_name=field_name,
                    claimed_value_a=existing.field_value,
                    source_a=existing.source_url,
                    claimed_value_b=str_val,
                    source_b=source_url,
                    resolution_status="unresolved",
                )
                db.add(conflict)
                logger.info(f"Conflict flagged for supplier {supplier_id} on field '{field_name}'")

            # 2. Insert Evidence
            evidence_id = f"evi-{uuid.uuid4().hex[:12]}"
            evidence = SupplierFieldEvidence(
                id=evidence_id,
                supplier_id=supplier_id,
                candidate_id=candidate_id,
                field_name=field_name,
                field_value=str_val,
                source_url=source_url,
                source_type=source_type,
                provider=provider,
                excerpt=excerpt or f"Extracted {field_name} from {source_url}",
                confidence=confidence,
                verification_status=verification_status,
            )
            db.add(evidence)
            db.commit()
            return evidence_id

        except Exception as e:
            logger.warning(f"Failed to record evidence: {e}")
            if db:
                db.rollback()
            return None

    @staticmethod
    def collect_supplier_bundle(
        db: Optional[Session],
        supplier_id: str,
        supplier_data: Dict[str, Any],
        source_url: str,
        provider: str = "apify",
    ) -> None:
        """
        Collects field-level evidence across all core supplier attributes.
        """
        if not db or not supplier_id:
            return

        # Company Name
        if supplier_data.get("name"):
            EvidenceCollector.record_field_evidence(
                db, supplier_id, "company_name", supplier_data["name"], source_url, provider=provider
            )

        # Website
        if supplier_data.get("website"):
            EvidenceCollector.record_field_evidence(
                db, supplier_id, "website", supplier_data["website"], source_url, provider=provider
            )

        # Location
        if supplier_data.get("city") or supplier_data.get("country"):
            loc_str = f"{supplier_data.get('city', '')}, {supplier_data.get('country', '')}".strip(", ")
            EvidenceCollector.record_field_evidence(
                db, supplier_id, "location", loc_str, source_url, provider=provider
            )

        # Contacts
        for c in supplier_data.get("contacts", []):
            field_name = f"public_business_{c.get('type', 'contact')}"
            EvidenceCollector.record_field_evidence(
                db, supplier_id, field_name, c.get("value", ""), source_url, provider=provider,
                excerpt=f"Role: {c.get('role', 'general')}"
            )

        # Products
        for p in supplier_data.get("products", []):
            prod_summary = f"{p.get('name')} (MOQ: {p.get('moq')}, Price: {p.get('quoted_price')} {p.get('currency', 'INR')})"
            EvidenceCollector.record_field_evidence(
                db, supplier_id, "product_listing", prod_summary, source_url, provider=provider
            )

        # Capabilities
        if supplier_data.get("capabilities"):
            EvidenceCollector.record_field_evidence(
                db, supplier_id, "capabilities", ", ".join(supplier_data["capabilities"]), source_url, provider=provider
            )

        # Certifications
        if supplier_data.get("certifications"):
            EvidenceCollector.record_field_evidence(
                db, supplier_id, "certifications", ", ".join(supplier_data["certifications"]), source_url, provider=provider
            )
