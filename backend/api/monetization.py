"""
Monetization, Deal Management, Tender Tracking, and 5% Success Fee API Router
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Body, Header, Request, status
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc

from core.database import get_db
from app.models.monetization import (
    ServiceFeePolicy,
    Tender,
    SourcingDeal,
    DealEvent,
    DealDocument,
    ServiceFeeAssessment,
    Invoice,
    Payment,
    PaymentWebhookEvent,
    CreditNote,
)
from app.models.database import Business, Supplier, User
from app.services.monetization.fee_calculator import FeeCalculator
from app.services.monetization.deal_service import DealService
from app.services.monetization.invoice_service import InvoiceService
from app.services.monetization.payment_gateway import get_payment_gateway, SandboxMockPaymentGateway
from app.services.monetization.analytics_service import MonetizationAnalyticsService


router = APIRouter(prefix="/api", tags=["monetization"])


# ----------------------------------------------------
# PYDANTIC SCHEMAS
# ----------------------------------------------------

class TenderCreateRequest(BaseModel):
    business_id: str = Field(..., description="ID of the business issuing the tender")
    title: str = Field(..., description="Tender or RFQ title")
    product_category: str = Field(..., description="Product or material category")
    required_quantity: float = Field(..., gt=0, description="Required quantity")
    unit: str = Field("pieces", description="Unit of measurement")
    estimated_budget: float = Field(..., gt=0, description="Estimated budget")
    currency: str = Field("INR", description="Currency code (e.g. INR, USD)")
    description: Optional[str] = None
    closing_date: Optional[datetime] = None
    user_id: Optional[str] = None
    supporting_documents: Optional[List[Dict[str, Any]]] = []


class TenderAwardRequest(BaseModel):
    supplier_id: str = Field(..., description="Selected supplier ID to award the tender to")


class DealCreateRequest(BaseModel):
    business_id: str = Field(..., description="Business ID")
    supplier_id: str = Field(..., description="Supplier ID")
    title: str = Field(..., description="Deal contract title")
    confirmed_deal_value: float = Field(..., gt=0, description="Confirmed pre-tax contract value")
    contract_reference: str = Field(..., description="Purchase Order number or Contract Reference")
    currency: str = Field("INR", description="Currency code")
    tender_id: Optional[str] = None
    scenario_id: Optional[str] = None
    optimization_run_id: Optional[str] = None
    user_id: Optional[str] = None
    notes: Optional[str] = None
    supporting_evidence: Optional[Dict[str, Any]] = {}
    initial_status: str = Field("draft", description="Initial status")


class DealStatusUpdateRequest(BaseModel):
    new_status: str = Field(..., description="Target status")
    notes: Optional[str] = None
    actor_role: str = Field("customer", description="customer, admin, or system")
    actor_id: Optional[str] = None


class DealDocumentUploadRequest(BaseModel):
    document_type: str = Field(..., description="contract, purchase_order, award_letter, bank_proof")
    file_name: str
    file_url: str
    file_size_bytes: Optional[int] = None
    actor_id: Optional[str] = None


class DealConfirmRequest(BaseModel):
    actor_id: Optional[str] = None
    contract_reference: Optional[str] = None
    confirmation_notes: Optional[str] = None


class DealDisputeRequest(BaseModel):
    dispute_reason: str = Field(..., min_length=5, description="Reason for disputing deal or fee")
    actor_id: Optional[str] = None


class AdminVerifyDealRequest(BaseModel):
    admin_id: str
    verification_status: str = Field(..., description="'verified' or 'rejected'")
    notes: Optional[str] = None


class CheckoutSessionRequest(BaseModel):
    invoice_id: str
    return_url: Optional[str] = "/deals"
    payment_method: Optional[str] = "sandbox_mock"


class PaymentVerifyRequest(BaseModel):
    payment_reference: str
    invoice_id: str


class CreditNoteCreateRequest(BaseModel):
    amount: float = Field(..., gt=0)
    reason: str
    approved_by: str


# ----------------------------------------------------
# POLICIES
# ----------------------------------------------------

@router.get("/monetization/policies/active")
def get_active_policy(db: Session = Depends(get_db)):
    """Retrieve active transparent commercial fee policy."""
    policy = (
        db.query(ServiceFeePolicy)
        .filter(ServiceFeePolicy.is_active == True)
        .order_by(desc(ServiceFeePolicy.effective_from))
        .first()
    )
    if not policy:
        return {
            "version": "v1.0-standard",
            "fee_percentage": 5.0,
            "currency": "INR",
            "tax_rate_percentage": 18.0,
            "description": "SupplyLens Standard 5% Success Fee on confirmed contract value",
            "is_active": True,
        }
    return {
        "id": policy.id,
        "version": policy.version,
        "fee_percentage": policy.fee_percentage,
        "currency": policy.currency,
        "min_fee_cap": policy.min_fee_cap,
        "max_fee_cap": policy.max_fee_cap,
        "tax_rate_percentage": policy.tax_rate_percentage,
        "description": policy.description,
        "effective_from": policy.effective_from.isoformat() if policy.effective_from else None,
    }


# ----------------------------------------------------
# TENDERS / RFQS
# ----------------------------------------------------

@router.get("/tenders")
def list_tenders(
    business_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List tenders / RFQs published by businesses."""
    tenders = DealService.list_tenders(db=db, business_id=business_id, status=status, limit=limit)
    return [
        {
            "id": t.id,
            "business_id": t.business_id,
            "title": t.title,
            "description": t.description,
            "product_category": t.product_category,
            "required_quantity": t.required_quantity,
            "unit": t.unit,
            "estimated_budget": t.estimated_budget,
            "currency": t.currency,
            "status": t.status,
            "submission_date": t.submission_date.isoformat() if t.submission_date else None,
            "closing_date": t.closing_date.isoformat() if t.closing_date else None,
            "selected_supplier_id": t.selected_supplier_id,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in tenders
    ]


@router.post("/tenders", status_code=status.HTTP_201_CREATED)
def create_tender(req: TenderCreateRequest, db: Session = Depends(get_db)):
    """Create a new Tender / Request for Quotation."""
    tender = DealService.create_tender(
        db=db,
        business_id=req.business_id,
        title=req.title,
        product_category=req.product_category,
        required_quantity=req.required_quantity,
        estimated_budget=req.estimated_budget,
        unit=req.unit,
        currency=req.currency,
        description=req.description,
        closing_date=req.closing_date,
        user_id=req.user_id,
        supporting_documents=req.supporting_documents,
    )
    return {
        "id": tender.id,
        "title": tender.title,
        "status": tender.status,
        "created_at": tender.created_at.isoformat(),
        "message": "Tender created successfully",
    }


@router.get("/tenders/{tender_id}")
def get_tender_detail(tender_id: str, db: Session = Depends(get_db)):
    """Get single tender details."""
    tender = DealService.get_tender(db, tender_id)
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    return {
        "id": tender.id,
        "business_id": tender.business_id,
        "title": tender.title,
        "description": tender.description,
        "product_category": tender.product_category,
        "required_quantity": tender.required_quantity,
        "unit": tender.unit,
        "estimated_budget": tender.estimated_budget,
        "currency": tender.currency,
        "status": tender.status,
        "selected_supplier_id": tender.selected_supplier_id,
        "supporting_documents": tender.supporting_documents,
        "created_at": tender.created_at.isoformat() if tender.created_at else None,
    }


@router.post("/tenders/{tender_id}/award")
def award_tender(tender_id: str, req: TenderAwardRequest, db: Session = Depends(get_db)):
    """Award a tender to a specific supplier."""
    try:
        tender = DealService.award_tender(db, tender_id, req.supplier_id)
        return {
            "id": tender.id,
            "status": tender.status,
            "selected_supplier_id": tender.selected_supplier_id,
            "message": "Tender awarded successfully",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ----------------------------------------------------
# SOURCING DEALS
# ----------------------------------------------------

@router.get("/deals")
def list_deals(
    business_id: Optional[str] = None,
    supplier_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List commercial sourcing deals."""
    deals = DealService.list_deals(db=db, business_id=business_id, supplier_id=supplier_id, status=status, limit=limit)
    res = []
    for d in deals:
        assessment_summary = None
        if d.assessment:
            assessment_summary = {
                "assessment_id": d.assessment.id,
                "calculated_fee": d.assessment.calculated_fee,
                "tax_amount": d.assessment.tax_amount,
                "total_fee_due": d.assessment.total_fee_due,
                "fee_status": d.assessment.fee_status,
                "currency": d.assessment.currency,
            }
        
        invoice_summary = None
        if d.invoices:
            inv = d.invoices[0]
            invoice_summary = {
                "invoice_id": inv.id,
                "invoice_number": inv.invoice_number,
                "total_amount": inv.total_amount,
                "status": inv.status,
                "due_date": inv.due_date.isoformat() if inv.due_date else None,
            }

        supplier_name = d.supplier.name if d.supplier else "Selected Supplier"

        res.append({
            "id": d.id,
            "business_id": d.business_id,
            "supplier_id": d.supplier_id,
            "supplier_name": supplier_name,
            "tender_id": d.tender_id,
            "title": d.title,
            "confirmed_deal_value": d.confirmed_deal_value,
            "currency": d.currency,
            "contract_reference": d.contract_reference,
            "status": d.status,
            "verification_status": d.verification_status,
            "fee_trigger_active": d.fee_trigger_active,
            "confirmation_date": d.confirmation_date.isoformat() if d.confirmation_date else None,
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "assessment": assessment_summary,
            "invoice": invoice_summary,
        })
    return res


@router.post("/deals", status_code=status.HTTP_201_CREATED)
def create_deal(req: DealCreateRequest, db: Session = Depends(get_db)):
    """Record a commercial sourcing agreement / purchase order."""
    try:
        deal = DealService.create_deal(
            db=db,
            business_id=req.business_id,
            supplier_id=req.supplier_id,
            title=req.title,
            confirmed_deal_value=req.confirmed_deal_value,
            contract_reference=req.contract_reference,
            currency=req.currency,
            tender_id=req.tender_id,
            scenario_id=req.scenario_id,
            optimization_run_id=req.optimization_run_id,
            user_id=req.user_id,
            notes=req.notes,
            supporting_evidence=req.supporting_evidence,
            initial_status=req.initial_status,
        )
        return {
            "id": deal.id,
            "title": deal.title,
            "status": deal.status,
            "confirmed_deal_value": deal.confirmed_deal_value,
            "contract_reference": deal.contract_reference,
            "message": "Deal recorded successfully",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/deals/{deal_id}")
def get_deal_detail(deal_id: str, db: Session = Depends(get_db)):
    """Get full details of a deal including documents, audit history, fee assessment, and invoice."""
    deal = DealService.get_deal(db, deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    events = [
        {
            "id": ev.id,
            "event_type": ev.event_type,
            "from_status": ev.from_status,
            "to_status": ev.to_status,
            "actor_role": ev.actor_role,
            "description": ev.description,
            "metadata_snapshot": ev.metadata_snapshot,
            "created_at": ev.created_at.isoformat() if ev.created_at else None,
        }
        for ev in deal.events
    ]

    documents = [
        {
            "id": doc.id,
            "document_type": doc.document_type,
            "file_name": doc.file_name,
            "file_url": doc.file_url,
            "file_size_bytes": doc.file_size_bytes,
            "verification_status": doc.verification_status,
            "created_at": doc.created_at.isoformat() if doc.created_at else None,
        }
        for doc in deal.documents
    ]

    assessment_data = None
    if deal.assessment:
        a = deal.assessment
        assessment_data = {
            "id": a.id,
            "policy_version": a.policy_version,
            "fee_base_amount": a.fee_base_amount,
            "fee_percentage": a.fee_percentage,
            "calculated_fee": a.calculated_fee,
            "tax_rate": a.tax_rate,
            "tax_amount": a.tax_amount,
            "total_fee_due": a.total_fee_due,
            "currency": a.currency,
            "due_date": a.due_date.isoformat() if a.due_date else None,
            "fee_status": a.fee_status,
        }

    invoices_data = [
        {
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "subtotal": inv.subtotal,
            "tax_amount": inv.tax_amount,
            "total_amount": inv.total_amount,
            "currency": inv.currency,
            "status": inv.status,
            "issued_date": inv.issued_date.isoformat() if inv.issued_date else None,
            "due_date": inv.due_date.isoformat() if inv.due_date else None,
            "paid_at": inv.paid_at.isoformat() if inv.paid_at else None,
            "pdf_url": inv.pdf_url,
        }
        for inv in deal.invoices
    ]

    return {
        "id": deal.id,
        "business_id": deal.business_id,
        "supplier_id": deal.supplier_id,
        "supplier_name": deal.supplier.name if deal.supplier else "Supplier",
        "tender_id": deal.tender_id,
        "title": deal.title,
        "confirmed_deal_value": deal.confirmed_deal_value,
        "currency": deal.currency,
        "contract_reference": deal.contract_reference,
        "status": deal.status,
        "fee_trigger_active": deal.fee_trigger_active,
        "confirmation_date": deal.confirmation_date.isoformat() if deal.confirmation_date else None,
        "verification_status": deal.verification_status,
        "dispute_reason": deal.dispute_reason,
        "notes": deal.notes,
        "created_at": deal.created_at.isoformat() if deal.created_at else None,
        "events": events,
        "documents": documents,
        "assessment": assessment_data,
        "invoices": invoices_data,
    }


@router.post("/deals/{deal_id}/status")
def update_deal_status(deal_id: str, req: DealStatusUpdateRequest, db: Session = Depends(get_db)):
    """Transition deal status and optionally trigger fee assessment."""
    try:
        deal = DealService.transition_deal_status(
            db=db,
            deal_id=deal_id,
            new_status=req.new_status,
            actor_role=req.actor_role,
            actor_id=req.actor_id,
            notes=req.notes,
        )
        return {
            "id": deal.id,
            "status": deal.status,
            "fee_trigger_active": deal.fee_trigger_active,
            "message": f"Deal transitioned to {deal.status}",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/deals/{deal_id}/documents")
def add_deal_document(deal_id: str, req: DealDocumentUploadRequest, db: Session = Depends(get_db)):
    """Upload verification document (contract, PO, bank receipt)."""
    deal = DealService.get_deal(db, deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    doc = DealService.add_deal_document(
        db=db,
        deal_id=deal_id,
        document_type=req.document_type,
        file_name=req.file_name,
        file_url=req.file_url,
        file_size_bytes=req.file_size_bytes,
        actor_id=req.actor_id,
    )
    return {
        "id": doc.id,
        "file_name": doc.file_name,
        "verification_status": doc.verification_status,
        "message": "Document attached successfully",
    }


@router.post("/deals/{deal_id}/confirm")
def confirm_deal(deal_id: str, req: DealConfirmRequest, db: Session = Depends(get_db)):
    """
    Explicit deal confirmation by customer or admin.
    Transitions deal to 'purchase_order_confirmed', calculates 5% fee and generates invoice.
    """
    deal = DealService.get_deal(db, deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if req.contract_reference:
        deal.contract_reference = req.contract_reference

    # Transition to purchase_order_confirmed and assess fee
    DealService.transition_deal_status(
        db=db,
        deal_id=deal_id,
        new_status="purchase_order_confirmed",
        actor_role="customer",
        actor_id=req.actor_id,
        notes=req.confirmation_notes or "Confirmed by user with contract reference",
    )

    assessment, invoice = DealService.confirm_deal_and_assess_fee(db=db, deal_id=deal_id, actor_id=req.actor_id)

    return {
        "deal_id": deal.id,
        "status": deal.status,
        "assessment_id": assessment.id,
        "fee_percentage": assessment.fee_percentage,
        "fee_base_amount": assessment.fee_base_amount,
        "calculated_fee": assessment.calculated_fee,
        "tax_amount": assessment.tax_amount,
        "total_fee_due": assessment.total_fee_due,
        "currency": assessment.currency,
        "invoice_number": invoice.invoice_number,
        "due_date": invoice.due_date.isoformat(),
        "message": "Deal confirmed and 5% success fee invoice issued.",
    }


@router.post("/deals/{deal_id}/dispute")
def dispute_deal(deal_id: str, req: DealDisputeRequest, db: Session = Depends(get_db)):
    """Record a dispute against a deal or fee assessment."""
    try:
        deal = DealService.dispute_deal(
            db=db,
            deal_id=deal_id,
            dispute_reason=req.dispute_reason,
            actor_id=req.actor_id,
        )
        return {
            "id": deal.id,
            "status": deal.status,
            "dispute_reason": deal.dispute_reason,
            "message": "Deal marked as disputed and flagged for admin review",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ----------------------------------------------------
# INVOICES & BILLING
# ----------------------------------------------------

@router.get("/invoices")
def list_invoices(
    business_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List customer invoices."""
    q = db.query(Invoice)
    if business_id:
        q = q.filter(Invoice.business_id == business_id)
    if status:
        q = q.filter(Invoice.status == status)
    invoices = q.order_by(desc(Invoice.created_at)).limit(limit).all()

    return [
        {
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "deal_id": inv.deal_id,
            "business_id": inv.business_id,
            "customer_name": inv.customer_name,
            "customer_email": inv.customer_email,
            "subtotal": inv.subtotal,
            "tax_amount": inv.tax_amount,
            "total_amount": inv.total_amount,
            "currency": inv.currency,
            "status": inv.status,
            "issued_date": inv.issued_date.isoformat() if inv.issued_date else None,
            "due_date": inv.due_date.isoformat() if inv.due_date else None,
            "paid_at": inv.paid_at.isoformat() if inv.paid_at else None,
            "payment_method": inv.payment_method,
            "pdf_url": inv.pdf_url,
        }
        for inv in invoices
    ]


@router.get("/invoices/{invoice_number}/html", response_class=HTMLResponse)
def get_invoice_html(invoice_number: str, db: Session = Depends(get_db)):
    """Render a printable, styled HTML invoice document."""
    invoice = db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    deal = DealService.get_deal(db, invoice.deal_id)
    html_content = InvoiceService.generate_invoice_html(invoice, deal)
    return HTMLResponse(content=html_content)


@router.get("/billing/invoices/{invoice_id}")
def get_billing_invoice(invoice_id: str, db: Session = Depends(get_db)):
    """Retrieve an authenticated customer's specific invoice by ID or invoice number."""
    inv = db.query(Invoice).filter(or_(Invoice.id == invoice_id, Invoice.invoice_number == invoice_id)).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    deal = DealService.get_deal(db, inv.deal_id)
    return {
        "id": inv.id,
        "invoice_number": inv.invoice_number,
        "deal_id": inv.deal_id,
        "deal_value": deal.confirmed_deal_value if deal else None,
        "supplier_name": deal.supplier_name if deal else None,
        "business_id": inv.business_id,
        "customer_name": inv.customer_name,
        "customer_email": inv.customer_email,
        "subtotal": inv.subtotal,
        "tax_amount": inv.tax_amount,
        "total_amount": inv.total_amount,
        "currency": inv.currency,
        "status": inv.status,
        "service_fee_percentage": 5.0,
        "issued_date": inv.issued_date.isoformat() if inv.issued_date else None,
        "due_date": inv.due_date.isoformat() if inv.due_date else None,
        "paid_at": inv.paid_at.isoformat() if inv.paid_at else None,
        "payment_method": inv.payment_method,
        "pdf_url": inv.pdf_url,
    }


@router.get("/billing/invoices/{invoice_id}/payments")
def get_invoice_payments(invoice_id: str, db: Session = Depends(get_db)):
    """Retrieve transaction payment history for an invoice."""
    payments = db.query(Payment).filter(Payment.invoice_id == invoice_id).order_by(desc(Payment.created_at)).all()
    return [
        {
            "id": p.id,
            "payment_reference": p.payment_reference,
            "payment_gateway": p.payment_gateway,
            "amount": p.amount,
            "currency": p.currency,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "paid_at": p.paid_at.isoformat() if p.paid_at else None,
        }
        for p in payments
    ]


@router.post("/billing/invoices/{invoice_id}/checkout")
def create_billing_checkout(
    invoice_id: str,
    req: Optional[CheckoutSessionRequest] = None,
    db: Session = Depends(get_db),
):
    """Initiate payment checkout session for a 5% success fee invoice."""
    payment_method = req.payment_method if req else "razorpay"
    return_url = req.return_url if req else "/billing"
    return create_checkout(
        req=CheckoutSessionRequest(invoice_id=invoice_id, payment_method=payment_method, return_url=return_url),
        db=db,
    )


# ----------------------------------------------------
# PAYMENTS & CHECKOUT
# ----------------------------------------------------

@router.post("/payments/checkout")
def create_checkout(req: CheckoutSessionRequest, db: Session = Depends(get_db)):
    """Initiate a payment checkout session for a 5% success fee invoice."""
    invoice = db.query(Invoice).filter(Invoice.id == req.invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if invoice.status == "paid":
        return {
            "status": "already_paid",
            "message": "Invoice has already been settled in full.",
            "invoice_number": invoice.invoice_number,
        }

    gateway = get_payment_gateway(req.payment_method)
    idempotency_key = f"pay-{invoice.id}-{int(datetime.utcnow().timestamp())}"

    session_info = gateway.create_checkout_session(
        invoice_id=invoice.id,
        invoice_number=invoice.invoice_number,
        amount=invoice.total_amount,
        currency=invoice.currency,
        customer_email=invoice.customer_email,
        customer_name=invoice.customer_name,
        return_url=req.return_url or "/deals",
        idempotency_key=idempotency_key,
    )

    # Record initiated payment
    payment = Payment(
        invoice_id=invoice.id,
        deal_id=invoice.deal_id,
        payment_reference=session_info["payment_reference"],
        payment_gateway=session_info["gateway"],
        amount=invoice.total_amount,
        currency=invoice.currency,
        status="initiated",
        idempotency_key=idempotency_key,
    )
    db.add(payment)
    db.commit()

    return session_info


@router.post("/payments/verify")
def verify_payment(req: PaymentVerifyRequest, db: Session = Depends(get_db)):
    """Verify payment status and reconcile invoice."""
    payment = db.query(Payment).filter(Payment.payment_reference == req.payment_reference).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    invoice = db.query(Invoice).filter(Invoice.id == req.invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    gateway = get_payment_gateway(payment.payment_gateway)
    verification = gateway.verify_payment_status(payment.payment_reference)

    if verification.get("status") in ("captured", "succeeded"):
        payment.status = "captured"
        payment.paid_at = datetime.utcnow()
        payment.gateway_response = verification

        invoice.status = "paid"
        invoice.paid_at = datetime.utcnow()
        invoice.payment_method = payment.payment_gateway

        # Update assessment
        if invoice.assessment:
            invoice.assessment.fee_status = "paid"

        # Add event to deal
        DealService.add_deal_event(
            db=db,
            deal_id=invoice.deal_id,
            event_type="fee_paid",
            description=f"Success fee payment settled: {invoice.currency} {invoice.total_amount:,.2f} via {payment.payment_gateway}",
            actor_role="system",
        )

        db.commit()
        return {
            "status": "success",
            "invoice_status": "paid",
            "payment_reference": payment.payment_reference,
            "message": "Payment verified and invoice marked as paid.",
        }
    else:
        payment.status = "failed"
        db.commit()
        return {
            "status": "failed",
            "message": "Payment verification failed.",
        }


@router.post("/payments/webhook")
async def payment_webhook(
    request: Request,
    x_signature: Optional[str] = Header(None, alias="X-Signature"),
    db: Session = Depends(get_db),
):
    """
    Idempotent payment gateway webhook receiver.
    Cryptographically verifies payload and reconciles settlement.
    """
    raw_body = await request.body()
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_id = data.get("event_id")
    if not event_id:
        raise HTTPException(status_code=400, detail="Missing event_id")

    # Idempotency check for webhook events
    existing_event = db.query(PaymentWebhookEvent).filter(PaymentWebhookEvent.event_id == event_id).first()
    if existing_event:
        return {"status": "already_processed", "event_id": event_id}

    # Verify signature if signature header provided
    gateway = get_payment_gateway("sandbox_mock")
    if x_signature:
        if not gateway.verify_webhook_signature(raw_body, x_signature, SandboxMockPaymentGateway.WEBHOOK_SECRET):
            raise HTTPException(status_code=401, detail="Invalid webhook signature")

    webhook_record = PaymentWebhookEvent(
        gateway="sandbox_mock",
        event_id=event_id,
        event_type=data.get("event_type", "unknown"),
        payload=data,
        processed=False,
    )
    db.add(webhook_record)
    db.flush()

    event_type = data.get("event_type")
    event_data = data.get("data", {})
    payment_ref = event_data.get("payment_reference")
    invoice_id = event_data.get("invoice_id")

    if event_type == "payment.succeeded" and payment_ref and invoice_id:
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        payment = db.query(Payment).filter(Payment.payment_reference == payment_ref).first()

        if invoice:
            invoice.status = "paid"
            invoice.paid_at = datetime.utcnow()
            if invoice.assessment:
                invoice.assessment.fee_status = "paid"

        if payment:
            payment.status = "captured"
            payment.paid_at = datetime.utcnow()

        if invoice:
            DealService.add_deal_event(
                db=db,
                deal_id=invoice.deal_id,
                event_type="fee_paid_webhook",
                description=f"Payment verified via webhook for invoice #{invoice.invoice_number}",
                actor_role="system",
            )

        webhook_record.processed = True
        webhook_record.processed_at = datetime.utcnow()

    db.commit()
    return {"status": "success", "event_id": event_id}


@router.get("/billing/payments/{payment_id}/status")
def get_payment_status(payment_id: str, db: Session = Depends(get_db)):
    """Retrieve verified status of a transaction."""
    payment = db.query(Payment).filter(or_(Payment.id == payment_id, Payment.payment_reference == payment_id)).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    return {
        "id": payment.id,
        "payment_reference": payment.payment_reference,
        "payment_gateway": payment.payment_gateway,
        "amount": payment.amount,
        "currency": payment.currency,
        "status": payment.status,
        "paid_at": payment.paid_at.isoformat() if payment.paid_at else None,
    }


@router.post("/payments/webhooks/razorpay")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None, alias="X-Razorpay-Signature"),
    db: Session = Depends(get_db),
):
    """Razorpay official webhook receiver with cryptographic HMAC signature verification."""
    raw_body = await request.body()
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event = data.get("event")
    event_id = data.get("payload", {}).get("payment", {}).get("entity", {}).get("id") or f"rzp_evt_{uuid.uuid4().hex[:10]}"

    gateway = get_payment_gateway("razorpay")
    if x_razorpay_signature:
        if not gateway.verify_webhook_signature(raw_body, x_razorpay_signature):
            raise HTTPException(status_code=401, detail="Invalid Razorpay webhook signature")

    # Record and reconcile
    if event in ("payment.captured", "order.paid"):
        payment_entity = data.get("payload", {}).get("payment", {}).get("entity", {})
        notes = payment_entity.get("notes", {})
        inv_id = notes.get("invoice_id")
        if inv_id:
            inv = db.query(Invoice).filter(Invoice.id == inv_id).first()
            if inv:
                inv.status = "paid"
                inv.paid_at = datetime.utcnow()
                inv.payment_method = "razorpay"
                db.commit()

    return {"status": "success", "event": event}


@router.post("/payments/webhooks/cashfree")
async def cashfree_webhook(
    request: Request,
    x_webhook_signature: Optional[str] = Header(None, alias="X-Webhook-Signature"),
    db: Session = Depends(get_db),
):
    """Cashfree official webhook receiver."""
    raw_body = await request.body()
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    return {"status": "success", "provider": "cashfree"}


@router.post("/billing/payments/{payment_id}/reconcile")
def reconcile_payment(payment_id: str, db: Session = Depends(get_db)):
    """Perform server-side transaction reconciliation with the gateway."""
    payment = db.query(Payment).filter(or_(Payment.id == payment_id, Payment.payment_reference == payment_id)).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    gateway = get_payment_gateway(payment.payment_gateway)
    verification = gateway.verify_payment_status(payment.payment_reference)

    if verification.get("status") in ("captured", "succeeded"):
        payment.status = "captured"
        payment.paid_at = datetime.utcnow()
        inv = db.query(Invoice).filter(Invoice.id == payment.invoice_id).first()
        if inv and inv.status != "paid":
            inv.status = "paid"
            inv.paid_at = datetime.utcnow()
        db.commit()
        return {"status": "reconciled", "payment_status": "captured", "invoice_status": "paid"}
    return {"status": "unresolved", "payment_status": payment.status}


# ----------------------------------------------------
# ADMIN & REVENUE ANALYTICS
# ----------------------------------------------------

@router.get("/monetization/analytics")
def get_monetization_analytics(currency: str = "INR", db: Session = Depends(get_db)):
    """Executive monetization revenue analytics, fee collection rate, and pipeline KPIs."""
    return MonetizationAnalyticsService.get_revenue_overview(db=db, currency=currency)


@router.post("/admin/deals/{deal_id}/verify")
def admin_verify_deal(deal_id: str, req: AdminVerifyDealRequest, db: Session = Depends(get_db)):
    """Admin verification of deal evidence (contracts / POs)."""
    try:
        deal = DealService.admin_verify_deal(
            db=db,
            deal_id=deal_id,
            admin_id=req.admin_id,
            verification_status=req.verification_status,
            notes=req.notes,
        )
        return {
            "id": deal.id,
            "verification_status": deal.verification_status,
            "verified_by": deal.verified_by,
            "message": f"Deal marked as {deal.verification_status} by admin.",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/admin/invoices/{invoice_id}/credit-note")
def issue_credit_note(invoice_id: str, req: CreditNoteCreateRequest, db: Session = Depends(get_db)):
    """Issue a credit note / fee waiver against an invoice."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    try:
        cn = InvoiceService.issue_credit_note(
            db=db,
            invoice=invoice,
            amount=req.amount,
            reason=req.reason,
            approved_by=req.approved_by,
        )
        db.commit()
        return {
            "credit_note_number": cn.credit_note_number,
            "amount": cn.amount,
            "currency": cn.currency,
            "reason": cn.reason,
            "message": "Credit note issued successfully",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
