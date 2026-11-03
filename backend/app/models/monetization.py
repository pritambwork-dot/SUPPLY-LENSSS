"""
SupplyLens Deal Management, Tender Tracking, and 5% Success Fee Monetization Models
SQLAlchemy 2.0 declarative models for tenders, sourcing deals, fee policies,
fee assessments, invoices, payments, webhook events, and credit notes.
"""

from datetime import datetime
from typing import Optional, List
import uuid

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.models.database import Base


class ServiceFeePolicy(Base):
    """Configurable commercial monetization policy for SupplyLens.
    Defaults to 5% (0.05) fee on confirmed contract value.
    """
    __tablename__ = "service_fee_policies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    version = Column(String(50), unique=True, nullable=False, index=True)  # e.g., "v1.0-standard"
    fee_percentage = Column(Float, nullable=False, default=5.0)  # 5.0%
    currency = Column(String(10), default="INR")
    min_fee_cap = Column(Float, nullable=True)  # Optional minimum cap
    max_fee_cap = Column(Float, nullable=True)  # Optional maximum cap
    tax_rate_percentage = Column(Float, default=18.0)  # GST 18% default
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    effective_from = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    assessments = relationship("ServiceFeeAssessment", back_populates="policy")


class Tender(Base):
    """Customer Tender or Request for Quotation (RFQ) published to suppliers."""
    __tablename__ = "tenders"

    id = Column(String(36), primary_key=True, default=lambda: f"tnd-{uuid.uuid4().hex[:8]}")
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=False, index=True)
    user_id = Column(String(36), nullable=True, index=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    product_category = Column(String(100), nullable=False)
    required_quantity = Column(Float, nullable=False)
    unit = Column(String(50), default="pieces")
    estimated_budget = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")

    submission_date = Column(DateTime, default=datetime.utcnow)
    closing_date = Column(DateTime, nullable=True)
    selected_supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=True, index=True)

    # draft, published, evaluating, awarded, closed, cancelled
    status = Column(String(50), default="published", index=True)
    supporting_documents = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    business = relationship("Business")
    selected_supplier = relationship("Supplier")
    deals = relationship("SourcingDeal", back_populates="tender")


class SourcingDeal(Base):
    """Commercial sourcing contract or purchase agreement concluded with a supplier.
    Triggers a 5% success fee upon verified confirmation.
    """
    __tablename__ = "sourcing_deals"

    id = Column(String(36), primary_key=True, default=lambda: f"deal-{uuid.uuid4().hex[:8]}")
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=False, index=True)
    user_id = Column(String(36), nullable=True, index=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False, index=True)
    tender_id = Column(String(36), ForeignKey("tenders.id"), nullable=True, index=True)
    scenario_id = Column(String(36), ForeignKey("sourcing_scenarios.id"), nullable=True)
    optimization_run_id = Column(String(36), ForeignKey("optimization_runs.id"), nullable=True)

    title = Column(String(255), nullable=False)
    # The authoritative pre-tax contract or purchase-order value agreed between customer and supplier
    confirmed_deal_value = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    contract_reference = Column(String(100), nullable=False, index=True)  # PO Number, Contract ID

    # Deal lifecycle statuses:
    # draft, negotiation, quotation_received, tender_submitted, awarded,
    # contract_pending, contract_signed, purchase_order_confirmed, completed, cancelled, disputed
    status = Column(String(50), default="draft", index=True)

    fee_trigger_active = Column(Boolean, default=False)
    confirmation_date = Column(DateTime, nullable=True)
    completion_date = Column(DateTime, nullable=True)

    # Verification and dispute
    verification_status = Column(String(50), default="pending")  # pending, verified, rejected
    verified_by = Column(String(36), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    dispute_reason = Column(Text, nullable=True)

    supporting_evidence = Column(JSON, default=dict)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    business = relationship("Business")
    supplier = relationship("Supplier")
    tender = relationship("Tender", back_populates="deals")
    events = relationship("DealEvent", back_populates="deal", cascade="all, delete-orphan")
    documents = relationship("DealDocument", back_populates="deal", cascade="all, delete-orphan")
    assessment = relationship("ServiceFeeAssessment", back_populates="deal", uselist=False, cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="deal", cascade="all, delete-orphan")


class DealEvent(Base):
    """Complete auditable log of state transitions and human actions on a deal."""
    __tablename__ = "deal_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    deal_id = Column(String(36), ForeignKey("sourcing_deals.id"), nullable=False, index=True)
    actor_id = Column(String(36), nullable=True)
    actor_role = Column(String(50), default="customer")  # customer, admin, system
    event_type = Column(String(100), nullable=False)  # deal_created, status_updated, fee_assessed, etc.
    from_status = Column(String(50), nullable=True)
    to_status = Column(String(50), nullable=True)
    description = Column(Text, nullable=False)
    metadata_snapshot = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    deal = relationship("SourcingDeal", back_populates="events")


class DealDocument(Base):
    """Signed contract, purchase order, or official award proof supporting deal confirmation."""
    __tablename__ = "deal_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    deal_id = Column(String(36), ForeignKey("sourcing_deals.id"), nullable=False, index=True)
    document_type = Column(String(50), nullable=False)  # contract, purchase_order, award_letter, bank_proof
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_hash = Column(String(64), nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    verification_status = Column(String(50), default="pending")  # pending, verified, rejected
    verified_by = Column(String(36), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    deal = relationship("SourcingDeal", back_populates="documents")


class ServiceFeeAssessment(Base):
    """The auditable 5% success fee assessment record generated upon confirmed deal."""
    __tablename__ = "service_fee_assessments"

    id = Column(String(36), primary_key=True, default=lambda: f"sfa-{uuid.uuid4().hex[:8]}")
    # Enforces 1 assessment per deal for idempotency
    deal_id = Column(String(36), ForeignKey("sourcing_deals.id"), unique=True, nullable=False, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=False, index=True)
    user_id = Column(String(36), nullable=True, index=True)
    policy_id = Column(String(36), ForeignKey("service_fee_policies.id"), nullable=True)
    policy_version = Column(String(50), default="v1.0-standard")

    fee_base_amount = Column(Float, nullable=False)  # e.g., ₹10,00,000
    fee_percentage = Column(Float, default=5.0)      # e.g., 5.0%
    calculated_fee = Column(Float, nullable=False)   # e.g., ₹50,000
    tax_rate = Column(Float, default=18.0)           # e.g., 18.0%
    tax_amount = Column(Float, nullable=False)       # e.g., ₹9,000
    total_fee_due = Column(Float, nullable=False)    # e.g., ₹59,000
    currency = Column(String(10), default="INR")

    calculation_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=False)

    # assessed, invoiced, paid, adjusted, waived, disputed
    fee_status = Column(String(50), default="assessed", index=True)
    adjustment_amount = Column(Float, default=0.0)
    adjustment_reason = Column(Text, nullable=True)
    idempotency_key = Column(String(100), unique=True, nullable=False, index=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    deal = relationship("SourcingDeal", back_populates="assessment")
    policy = relationship("ServiceFeePolicy", back_populates="assessments")
    invoice = relationship("Invoice", back_populates="assessment", uselist=False)


class Invoice(Base):
    """Customer-facing invoice for the 5% SupplyLens sourcing success fee."""
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=lambda: f"inv-{uuid.uuid4().hex[:8]}")
    invoice_number = Column(String(50), unique=True, nullable=False, index=True)  # e.g., "SL-2026-0001"
    assessment_id = Column(String(36), ForeignKey("service_fee_assessments.id"), unique=True, nullable=False, index=True)
    deal_id = Column(String(36), ForeignKey("sourcing_deals.id"), nullable=False, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=False, index=True)

    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_address = Column(Text, nullable=True)

    subtotal = Column(Float, nullable=False)      # Calculated 5% fee
    tax_rate = Column(Float, default=18.0)
    tax_amount = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")

    # issued, pending, paid, overdue, cancelled, refunded
    status = Column(String(50), default="issued", index=True)
    issued_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=False)
    paid_at = Column(DateTime, nullable=True)
    payment_method = Column(String(50), nullable=True)

    pdf_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assessment = relationship("ServiceFeeAssessment", back_populates="invoice")
    deal = relationship("SourcingDeal", back_populates="invoices")
    payments = relationship("Payment", back_populates="invoice", cascade="all, delete-orphan")
    credit_notes = relationship("CreditNote", back_populates="invoice", cascade="all, delete-orphan")


class Payment(Base):
    """Record of a customer fee settlement transaction."""
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=lambda: f"pay-{uuid.uuid4().hex[:8]}")
    invoice_id = Column(String(36), ForeignKey("invoices.id"), nullable=False, index=True)
    deal_id = Column(String(36), ForeignKey("sourcing_deals.id"), nullable=False, index=True)
    payment_reference = Column(String(100), unique=True, nullable=False, index=True)  # Gateway reference or bank ref
    payment_gateway = Column(String(50), default="sandbox_mock")  # stripe, razorpay, bank_transfer, sandbox_mock

    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")

    # initiated, authorized, captured, failed, refunded
    status = Column(String(50), default="initiated", index=True)
    gateway_fee = Column(Float, default=0.0)
    gateway_response = Column(JSON, nullable=True)
    idempotency_key = Column(String(100), unique=True, nullable=False, index=True)

    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    invoice = relationship("Invoice", back_populates="payments")


class PaymentWebhookEvent(Base):
    """Idempotent record of payment gateway webhook events received."""
    __tablename__ = "payment_webhook_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    gateway = Column(String(50), nullable=False)
    event_id = Column(String(100), unique=True, nullable=False, index=True)  # Gateway unique event ID
    event_type = Column(String(100), nullable=False)
    payload = Column(JSON, nullable=False)
    processed = Column(Boolean, default=False)
    processed_at = Column(DateTime, nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class CreditNote(Base):
    """Adjustments or partial waivers on assessed service fees."""
    __tablename__ = "credit_notes"

    id = Column(String(36), primary_key=True, default=lambda: f"cn-{uuid.uuid4().hex[:8]}")
    credit_note_number = Column(String(50), unique=True, nullable=False, index=True)  # e.g., "SL-CN-2026-0001"
    invoice_id = Column(String(36), ForeignKey("invoices.id"), nullable=False, index=True)
    deal_id = Column(String(36), ForeignKey("sourcing_deals.id"), nullable=False, index=True)

    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    reason = Column(Text, nullable=False)
    approved_by = Column(String(36), nullable=False)

    # issued, applied, refunded
    status = Column(String(50), default="issued")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    invoice = relationship("Invoice", back_populates="credit_notes")
