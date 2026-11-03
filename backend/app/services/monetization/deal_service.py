"""
Deal & Tender Management Service for SupplyLens.
Manages the end-to-end commercial lifecycle from RFQ to confirmed contract,
enforcing evidence verification and triggering idempotent 5% success fee assessments.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.monetization import (
    Tender,
    SourcingDeal,
    DealEvent,
    DealDocument,
    ServiceFeePolicy,
    ServiceFeeAssessment,
    Invoice,
)
from app.models.database import Business, Supplier, User
from app.services.monetization.fee_calculator import FeeCalculator
from app.services.monetization.invoice_service import InvoiceService


class DealService:
    VALID_STATUSES = {
        "draft",
        "negotiation",
        "quotation_received",
        "tender_submitted",
        "awarded",
        "contract_pending",
        "contract_signed",
        "purchase_order_confirmed",
        "completed",
        "cancelled",
        "disputed",
    }

    FEE_TRIGGER_STATUSES = {
        "contract_signed",
        "purchase_order_confirmed",
        "completed",
    }

    # ----------------------------------------------------
    # TENDERS / RFQS
    # ----------------------------------------------------

    @staticmethod
    def create_tender(
        db: Session,
        business_id: str,
        title: str,
        product_category: str,
        required_quantity: float,
        estimated_budget: float,
        unit: str = "pieces",
        currency: str = "INR",
        description: Optional[str] = None,
        closing_date: Optional[datetime] = None,
        user_id: Optional[str] = None,
        supporting_documents: Optional[List[Dict[str, Any]]] = None,
    ) -> Tender:
        tender = Tender(
            business_id=business_id,
            user_id=user_id,
            title=title,
            description=description,
            product_category=product_category,
            required_quantity=required_quantity,
            unit=unit,
            estimated_budget=estimated_budget,
            currency=currency,
            closing_date=closing_date,
            status="published",
            supporting_documents=supporting_documents or [],
        )
        db.add(tender)
        db.commit()
        db.refresh(tender)
        return tender

    @staticmethod
    def get_tender(db: Session, tender_id: str) -> Optional[Tender]:
        return db.query(Tender).filter(Tender.id == tender_id).first()

    @staticmethod
    def list_tenders(
        db: Session,
        business_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50,
    ) -> List[Tender]:
        q = db.query(Tender)
        if business_id:
            q = q.filter(Tender.business_id == business_id)
        if status:
            q = q.filter(Tender.status == status)
        return q.order_by(desc(Tender.created_at)).limit(limit).all()

    @staticmethod
    def award_tender(db: Session, tender_id: str, supplier_id: str) -> Tender:
        tender = db.query(Tender).filter(Tender.id == tender_id).first()
        if not tender:
            raise ValueError(f"Tender {tender_id} not found.")
        tender.selected_supplier_id = supplier_id
        tender.status = "awarded"
        db.commit()
        db.refresh(tender)
        return tender

    # ----------------------------------------------------
    # SOURCING DEALS
    # ----------------------------------------------------

    @classmethod
    def create_deal(
        cls,
        db: Session,
        business_id: str,
        supplier_id: str,
        title: str,
        confirmed_deal_value: float,
        contract_reference: str,
        currency: str = "INR",
        tender_id: Optional[str] = None,
        scenario_id: Optional[str] = None,
        optimization_run_id: Optional[str] = None,
        user_id: Optional[str] = None,
        notes: Optional[str] = None,
        supporting_evidence: Optional[Dict[str, Any]] = None,
        initial_status: str = "draft",
    ) -> SourcingDeal:
        if initial_status not in cls.VALID_STATUSES:
            raise ValueError(f"Invalid status {initial_status}. Must be one of {cls.VALID_STATUSES}")

        deal = SourcingDeal(
            business_id=business_id,
            user_id=user_id,
            supplier_id=supplier_id,
            tender_id=tender_id,
            scenario_id=scenario_id,
            optimization_run_id=optimization_run_id,
            title=title,
            confirmed_deal_value=confirmed_deal_value,
            contract_reference=contract_reference,
            currency=currency,
            status=initial_status,
            notes=notes,
            supporting_evidence=supporting_evidence or {},
            verification_status="pending",
        )
        db.add(deal)
        db.flush()

        # Log creation event
        cls.add_deal_event(
            db=db,
            deal_id=deal.id,
            event_type="deal_created",
            to_status=initial_status,
            description=f"Deal created with value {currency} {confirmed_deal_value:,.2f} (PO/Ref: {contract_reference})",
            actor_role="customer",
            actor_id=user_id,
        )
        db.commit()
        db.refresh(deal)
        return deal

    @staticmethod
    def get_deal(db: Session, deal_id: str) -> Optional[SourcingDeal]:
        return db.query(SourcingDeal).filter(SourcingDeal.id == deal_id).first()

    @staticmethod
    def list_deals(
        db: Session,
        business_id: Optional[str] = None,
        supplier_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50,
    ) -> List[SourcingDeal]:
        q = db.query(SourcingDeal)
        if business_id:
            q = q.filter(SourcingDeal.business_id == business_id)
        if supplier_id:
            q = q.filter(SourcingDeal.supplier_id == supplier_id)
        if status:
            q = q.filter(SourcingDeal.status == status)
        return q.order_by(desc(SourcingDeal.created_at)).limit(limit).all()

    # ----------------------------------------------------
    # AUDIT EVENTS & DOCUMENTS
    # ----------------------------------------------------

    @staticmethod
    def add_deal_event(
        db: Session,
        deal_id: str,
        event_type: str,
        description: str,
        from_status: Optional[str] = None,
        to_status: Optional[str] = None,
        actor_role: str = "system",
        actor_id: Optional[str] = None,
        metadata_snapshot: Optional[Dict[str, Any]] = None,
    ) -> DealEvent:
        event = DealEvent(
            deal_id=deal_id,
            actor_id=actor_id,
            actor_role=actor_role,
            event_type=event_type,
            from_status=from_status,
            to_status=to_status,
            description=description,
            metadata_snapshot=metadata_snapshot,
        )
        db.add(event)
        db.flush()
        return event

    @classmethod
    def add_deal_document(
        cls,
        db: Session,
        deal_id: str,
        document_type: str,
        file_name: str,
        file_url: str,
        file_size_bytes: Optional[int] = None,
        actor_id: Optional[str] = None,
    ) -> DealDocument:
        doc = DealDocument(
            deal_id=deal_id,
            document_type=document_type,
            file_name=file_name,
            file_url=file_url,
            file_size_bytes=file_size_bytes,
            verification_status="pending",
        )
        db.add(doc)
        db.flush()

        cls.add_deal_event(
            db=db,
            deal_id=deal_id,
            event_type="document_uploaded",
            description=f"Uploaded verification document: {file_name} ({document_type})",
            actor_role="customer",
            actor_id=actor_id,
        )
        db.commit()
        db.refresh(doc)
        return doc

    # ----------------------------------------------------
    # STATUS TRANSITIONS & CONFIRMATION WITH 5% FEE
    # ----------------------------------------------------

    @classmethod
    def transition_deal_status(
        cls,
        db: Session,
        deal_id: str,
        new_status: str,
        actor_role: str = "customer",
        actor_id: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> SourcingDeal:
        if new_status not in cls.VALID_STATUSES:
            raise ValueError(f"Invalid status {new_status}")

        deal = cls.get_deal(db, deal_id)
        if not deal:
            raise ValueError(f"Deal {deal_id} not found.")

        old_status = deal.status
        deal.status = new_status
        if notes:
            deal.notes = f"{deal.notes}\n[{datetime.utcnow().isoformat()}] {notes}" if deal.notes else notes

        if new_status in cls.FEE_TRIGGER_STATUSES and not deal.confirmation_date:
            deal.confirmation_date = datetime.utcnow()

        cls.add_deal_event(
            db=db,
            deal_id=deal.id,
            event_type="status_transition",
            from_status=old_status,
            to_status=new_status,
            description=f"Status changed from {old_status} to {new_status}",
            actor_role=actor_role,
            actor_id=actor_id,
        )

        # Trigger fee assessment idempotently if reaching fee triggering state
        if new_status in cls.FEE_TRIGGER_STATUSES and not deal.fee_trigger_active:
            cls.confirm_deal_and_assess_fee(db=db, deal_id=deal.id, actor_id=actor_id)

        db.commit()
        db.refresh(deal)
        return deal

    @classmethod
    def confirm_deal_and_assess_fee(
        cls,
        db: Session,
        deal_id: str,
        actor_id: Optional[str] = None,
    ) -> tuple[ServiceFeeAssessment, Invoice]:
        """
        Confirms deal and assesses the transparent 5% success fee.
        Guaranteed idempotent: If an assessment already exists, returns the existing assessment & invoice.
        """
        deal = cls.get_deal(db, deal_id)
        if not deal:
            raise ValueError(f"Deal {deal_id} not found.")

        if deal.confirmed_deal_value <= 0:
            raise ValueError("Deal confirmed value must be positive to assess a service fee.")

        # Check existing assessment (Idempotency)
        existing_assessment = db.query(ServiceFeeAssessment).filter(ServiceFeeAssessment.deal_id == deal.id).first()
        if existing_assessment:
            existing_invoice = db.query(Invoice).filter(Invoice.assessment_id == existing_assessment.id).first()
            return existing_assessment, existing_invoice

        # Get active fee policy
        policy = db.query(ServiceFeePolicy).filter(ServiceFeePolicy.is_active == True).order_by(desc(ServiceFeePolicy.effective_from)).first()

        # Authoritative Fee Calculation
        calc_result = FeeCalculator.calculate_success_fee(
            confirmed_contract_value=deal.confirmed_deal_value,
            currency=deal.currency,
            policy=policy,
        )

        # Idempotency key per deal
        idempotency_key = f"fee-assess-{deal.id}"

        assessment = ServiceFeeAssessment(
            deal_id=deal.id,
            business_id=deal.business_id,
            user_id=deal.user_id or actor_id,
            policy_id=policy.id if policy else None,
            policy_version=calc_result.policy_version,
            fee_base_amount=calc_result.fee_base_amount,
            fee_percentage=calc_result.fee_percentage,
            calculated_fee=calc_result.calculated_fee,
            tax_rate=calc_result.tax_rate,
            tax_amount=calc_result.tax_amount,
            total_fee_due=calc_result.total_fee_due,
            currency=calc_result.currency,
            due_date=calc_result.due_date,
            fee_status="assessed",
            idempotency_key=idempotency_key,
        )
        db.add(assessment)
        db.flush()

        deal.fee_trigger_active = True
        deal.confirmation_date = deal.confirmation_date or datetime.utcnow()

        # Fetch Business and User for Invoice Generation
        business = db.query(Business).filter(Business.id == deal.business_id).first()
        user = db.query(User).filter(User.id == deal.user_id).first() if deal.user_id else None

        invoice = InvoiceService.create_invoice_for_assessment(
            db=db,
            assessment=assessment,
            deal=deal,
            business=business,
            user=user,
        )

        cls.add_deal_event(
            db=db,
            deal_id=deal.id,
            event_type="fee_assessed",
            description=(
                f"5% Success fee assessed: {assessment.currency} {assessment.calculated_fee:,.2f} "
                f"+ {assessment.tax_rate}% Tax ({assessment.currency} {assessment.tax_amount:,.2f}) "
                f"= Total Due {assessment.currency} {assessment.total_fee_due:,.2f}. Invoice #{invoice.invoice_number} generated."
            ),
            actor_role="system",
            metadata_snapshot=calc_result.to_dict(),
        )

        db.commit()
        db.refresh(assessment)
        db.refresh(invoice)
        return assessment, invoice

    @classmethod
    def dispute_deal(cls, db: Session, deal_id: str, dispute_reason: str, actor_id: Optional[str] = None) -> SourcingDeal:
        deal = cls.get_deal(db, deal_id)
        if not deal:
            raise ValueError(f"Deal {deal_id} not found.")

        old_status = deal.status
        deal.status = "disputed"
        deal.dispute_reason = dispute_reason

        # If assessment exists, flag as disputed
        if deal.assessment:
            deal.assessment.fee_status = "disputed"

        cls.add_deal_event(
            db=db,
            deal_id=deal.id,
            event_type="deal_disputed",
            from_status=old_status,
            to_status="disputed",
            description=f"Deal placed in dispute: {dispute_reason}",
            actor_role="customer",
            actor_id=actor_id,
        )
        db.commit()
        db.refresh(deal)
        return deal

    @classmethod
    def admin_verify_deal(
        cls,
        db: Session,
        deal_id: str,
        admin_id: str,
        verification_status: str,  # verified, rejected
        notes: Optional[str] = None,
    ) -> SourcingDeal:
        if verification_status not in ("verified", "rejected"):
            raise ValueError("Verification status must be 'verified' or 'rejected'")

        deal = cls.get_deal(db, deal_id)
        if not deal:
            raise ValueError(f"Deal {deal_id} not found.")

        deal.verification_status = verification_status
        deal.verified_by = admin_id
        deal.verified_at = datetime.utcnow()

        cls.add_deal_event(
            db=db,
            deal_id=deal.id,
            event_type=f"deal_{verification_status}",
            description=f"Admin {admin_id} marked deal as {verification_status}. Notes: {notes or 'None'}",
            actor_role="admin",
            actor_id=admin_id,
        )
        db.commit()
        db.refresh(deal)
        return deal
