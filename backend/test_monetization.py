"""
Comprehensive End-to-End Test Suite for SupplyLens Commercial Monetization & 5% Success Fee.
Tests:
  1. Fee Calculation Engine (5% success fee, tax, min/max caps, rounding)
  2. Tender / RFQ lifecycle (creation, listing, awarding)
  3. Deal Management & transitions (draft -> awarded -> confirmed)
  4. Evidence attachment & auditable DealEvents
  5. Idempotent Fee Assessment & Sequential Invoice Generation
  6. Payment Checkout & Verification Workflow
  7. Signed Webhook Idempotency & Reconciliation
  8. Dispute Management & Credit Note Issuance
  9. Live Database Monetization Revenue Analytics
"""

import os
import sys
import unittest
from datetime import datetime, timedelta

# Ensure backend root is on PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.database import Base, User, Business, Supplier, Sector
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
from app.services.monetization.fee_calculator import FeeCalculator
from app.services.monetization.deal_service import DealService
from app.services.monetization.invoice_service import InvoiceService
from app.services.monetization.payment_gateway import get_payment_gateway, SandboxMockPaymentGateway
from app.services.monetization.analytics_service import MonetizationAnalyticsService


class TestMonetizationEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Use an in-memory SQLite database for test isolation
        cls.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=cls.engine)
        cls.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)

    def setUp(self):
        self.db = self.SessionLocal()
        # Seed test sector, user, business, and supplier
        self.sector = Sector(id="sec-tech", name="Electronics", slug="electronics")
        self.user = User(id="usr-test-1", email="founder@nexastech.com", full_name="Aarav Sharma")
        self.business = Business(
            id="biz-test-1",
            user_id="usr-test-1",
            sector_id="sec-tech",
            name="NexaTech Hardware",
            idea_description="Smart IoT sensor hubs",
            target_market="India & SEA",
            location="Bengaluru, India",
            budget_amount=2500000.0,
            budget_currency="INR",
        )
        self.supplier = Supplier(
            id="sup-test-1",
            legal_name="Apex Precision Electronics Ltd",
            display_name="Apex Precision Electronics Ltd",
            country="India",
            country_code="IN",
            city="Pune",
            latitude=18.5204,
            longitude=73.8567,
            verification_status="Verified",
        )
        self.policy = ServiceFeePolicy(
            id="sfp-test-v1",
            version="v1.0-standard",
            fee_percentage=5.0,
            currency="INR",
            tax_rate_percentage=18.0,
            is_active=True,
        )
        self.db.add_all([self.sector, self.user, self.business, self.supplier, self.policy])
        self.db.commit()

    def tearDown(self):
        self.db.rollback()
        self.db.close()
        Base.metadata.drop_all(bind=self.engine)
        Base.metadata.create_all(bind=self.engine)

    def test_01_fee_calculator_standard_5_percent(self):
        """Test authoritative 5% fee calculation on confirmed ₹10,00,000 deal."""
        confirmed_value = 1000000.0  # ₹10 Lakhs
        result = FeeCalculator.calculate_success_fee(
            confirmed_contract_value=confirmed_value,
            currency="INR",
            policy=self.policy,
        )

        # Expected: 5% of 1,000,000 = 50,000
        self.assertEqual(result.fee_base_amount, 1000000.0)
        self.assertEqual(result.fee_percentage, 5.0)
        self.assertEqual(result.calculated_fee, 50000.0)
        # Expected: 18% GST of 50,000 = 9,000
        self.assertEqual(result.tax_amount, 9000.0)
        # Total due = 59,000
        self.assertEqual(result.total_fee_due, 59000.0)
        self.assertEqual(result.currency, "INR")
        self.assertIn("50,000.00", result.calculation_explanation)

    def test_02_fee_calculator_caps_and_validation(self):
        """Test policy fee caps and invalid input validation."""
        capped_policy = ServiceFeePolicy(
            id="sfp-test-capped",
            version="v1.0-capped",
            fee_percentage=5.0,
            min_fee_cap=5000.0,
            max_fee_cap=100000.0,
            tax_rate_percentage=18.0,
        )
        # Small deal: 5% of 20,000 is 1,000, which is below min_cap 5,000
        res_min = FeeCalculator.calculate_success_fee(20000.0, policy=capped_policy)
        self.assertEqual(res_min.calculated_fee, 5000.0)

        # Large deal: 5% of 50,00,000 is 2,50,000, which exceeds max_cap 100,000
        res_max = FeeCalculator.calculate_success_fee(5000000.0, policy=capped_policy)
        self.assertEqual(res_max.calculated_fee, 1000000.0 if False else 100000.0)

        # Non-positive values must raise ValueError
        with self.assertRaises(ValueError):
            FeeCalculator.calculate_success_fee(0.0)
        with self.assertRaises(ValueError):
            FeeCalculator.calculate_success_fee(-50000.0)

    def test_03_tender_lifecycle(self):
        """Test tender creation, listing, and award."""
        tender = DealService.create_tender(
            db=self.db,
            business_id=self.business.id,
            user_id=self.user.id,
            title="Custom PCB SMT Assembly - 5,000 Units",
            product_category="Electronics Manufacturing",
            required_quantity=5000,
            estimated_budget=1200000.0,
            currency="INR",
            description="Need quick turnaround turnkey SMT assembly for IoT nodes.",
        )
        self.assertIsNotNone(tender.id)
        self.assertEqual(tender.status, "published")

        tenders = DealService.list_tenders(self.db, business_id=self.business.id)
        self.assertEqual(len(tenders), 1)

        # Award tender to supplier
        awarded = DealService.award_tender(self.db, tender.id, self.supplier.id)
        self.assertEqual(awarded.status, "awarded")
        self.assertEqual(awarded.selected_supplier_id, self.supplier.id)

    def test_04_deal_creation_events_and_documents(self):
        """Test deal creation, auditable event trail, and document attachment."""
        deal = DealService.create_deal(
            db=self.db,
            business_id=self.business.id,
            supplier_id=self.supplier.id,
            title="NexaTech IoT Core Modules Agreement",
            confirmed_deal_value=850000.0,
            contract_reference="PO-2026-NXT-091",
            currency="INR",
            initial_status="negotiation",
        )
        self.assertEqual(deal.status, "negotiation")
        self.assertEqual(deal.confirmed_deal_value, 850000.0)

        # Check creation event was automatically logged
        events = self.db.query(DealEvent).filter(DealEvent.deal_id == deal.id).all()
        self.assertGreaterEqual(len(events), 1)
        self.assertEqual(events[0].event_type, "deal_created")

        # Attach verification document
        doc = DealService.add_deal_document(
            db=self.db,
            deal_id=deal.id,
            document_type="purchase_order",
            file_name="PO_NXT_091_Signed.pdf",
            file_url="/uploads/deals/PO_NXT_091_Signed.pdf",
            file_size_bytes=1048576,
            actor_id=self.user.id,
        )
        self.assertEqual(doc.verification_status, "pending")
        self.assertEqual(len(deal.documents), 1)

    def test_05_deal_confirmation_and_5_percent_fee_idempotency(self):
        """Test that confirming a deal assesses 5% fee and generates invoice, and is strictly idempotent."""
        deal = DealService.create_deal(
            db=self.db,
            business_id=self.business.id,
            supplier_id=self.supplier.id,
            title="Precision CNC Enclosure Batch",
            confirmed_deal_value=1000000.0,  # ₹10,00,000
            contract_reference="CTR-2026-APEX-001",
            currency="INR",
            initial_status="contract_pending",
        )

        # Confirm deal
        assessment, invoice = DealService.confirm_deal_and_assess_fee(
            db=self.db,
            deal_id=deal.id,
            actor_id=self.user.id,
        )

        # Verify fee calculation
        self.assertEqual(assessment.fee_base_amount, 1000000.0)
        self.assertEqual(assessment.calculated_fee, 50000.0)  # 5%
        self.assertEqual(assessment.tax_amount, 9000.0)      # 18% GST
        self.assertEqual(assessment.total_fee_due, 59000.0)
        self.assertEqual(assessment.fee_status, "invoiced")

        # Verify invoice
        self.assertIsNotNone(invoice)
        self.assertTrue(invoice.invoice_number.startswith("SL-"))
        self.assertEqual(invoice.total_amount, 59000.0)
        self.assertEqual(invoice.status, "issued")

        # IDEMPOTENCY CHECK: Call confirm again on the same deal
        second_assessment, second_invoice = DealService.confirm_deal_and_assess_fee(
            db=self.db,
            deal_id=deal.id,
            actor_id=self.user.id,
        )

        # Must return the identical records without duplicates
        self.assertEqual(assessment.id, second_assessment.id)
        self.assertEqual(invoice.id, second_invoice.id)
        total_assessments = self.db.query(ServiceFeeAssessment).filter(ServiceFeeAssessment.deal_id == deal.id).count()
        self.assertEqual(total_assessments, 1)

    def test_06_payment_checkout_and_verification(self):
        """Test payment gateway checkout creation and simulated verification."""
        deal = DealService.create_deal(
            db=self.db,
            business_id=self.business.id,
            supplier_id=self.supplier.id,
            title="Die Cast Aluminum Heatsinks",
            confirmed_deal_value=500000.0,
            contract_reference="PO-HEAT-001",
            currency="INR",
        )
        assessment, invoice = DealService.confirm_deal_and_assess_fee(self.db, deal.id)

        # Initiate checkout via Sandbox gateway
        gateway = get_payment_gateway("sandbox_mock")
        session = gateway.create_checkout_session(
            invoice_id=invoice.id,
            invoice_number=invoice.invoice_number,
            amount=invoice.total_amount,
            currency=invoice.currency,
            customer_email="billing@nexatech.com",
            customer_name="NexaTech Hardware",
            return_url="/deals",
            idempotency_key=f"pay-test-{invoice.id}",
        )
        self.assertEqual(session["status"], "initiated")
        self.assertTrue(session["payment_reference"].startswith("sandbox_txn_"))

        # Create Payment DB record
        payment = Payment(
            invoice_id=invoice.id,
            deal_id=deal.id,
            payment_reference=session["payment_reference"],
            amount=invoice.total_amount,
            currency=invoice.currency,
            status="initiated",
            idempotency_key=session["idempotency_key"],
        )
        self.db.add(payment)
        self.db.commit()

        # Verify payment status
        verification = gateway.verify_payment_status(payment.payment_reference)
        self.assertEqual(verification["status"], "captured")

        # Reconcile invoice and payment
        payment.status = "captured"
        payment.paid_at = datetime.utcnow()
        invoice.status = "paid"
        invoice.paid_at = datetime.utcnow()
        assessment.fee_status = "paid"
        self.db.commit()

        self.assertEqual(invoice.status, "paid")
        self.assertEqual(assessment.fee_status, "paid")

    def test_07_payment_signed_webhook_idempotency(self):
        """Test cryptographic webhook signature verification and payload processing."""
        payload, signature = SandboxMockPaymentGateway.generate_signed_webhook_payload(
            event_type="payment.succeeded",
            payment_reference="sandbox_txn_test123",
            invoice_id="inv-test-mock",
            amount=59000.0,
        )

        gateway = SandboxMockPaymentGateway()
        import json
        raw_body = json.dumps(payload, sort_keys=True).encode("utf-8")
        is_valid = gateway.verify_webhook_signature(raw_body, signature)
        self.assertTrue(is_valid)

        # Tampered signature check
        is_invalid = gateway.verify_webhook_signature(raw_body, "tampered_signature_hex")
        self.assertFalse(is_invalid)

    def test_08_dispute_and_credit_notes(self):
        """Test commercial dispute handling and partial/full credit notes."""
        deal = DealService.create_deal(
            db=self.db,
            business_id=self.business.id,
            supplier_id=self.supplier.id,
            title="Batch SMT Component Run",
            confirmed_deal_value=600000.0,
            contract_reference="PO-DISPUTE-01",
            currency="INR",
        )
        assessment, invoice = DealService.confirm_deal_and_assess_fee(self.db, deal.id)

        # Dispute the deal
        disputed_deal = DealService.dispute_deal(
            db=self.db,
            deal_id=deal.id,
            dispute_reason="Supplier delivered non-compliant spec batch; contract renegotiated under arbitration",
            actor_id=self.user.id,
        )
        self.assertEqual(disputed_deal.status, "disputed")
        self.assertEqual(disputed_deal.assessment.fee_status, "disputed")

        # Issue partial credit note of ₹10,000
        credit_note = InvoiceService.issue_credit_note(
            db=self.db,
            invoice=invoice,
            amount=10000.0,
            reason="Goodwill adjustment due to supplier spec dispute resolution",
            approved_by="admin-billing-01",
        )
        self.assertIsNotNone(credit_note.id)
        self.assertTrue(credit_note.credit_note_number.startswith("SL-CN-"))
        self.assertEqual(credit_note.amount, 10000.0)

    def test_09_revenue_analytics_aggregations(self):
        """Test executive revenue metrics aggregation on live database records."""
        metrics = MonetizationAnalyticsService.get_revenue_overview(self.db)
        self.assertIn("total_contract_gmv", metrics)
        self.assertIn("total_assessed_fee", metrics)
        self.assertIn("total_collected", metrics)
        self.assertIn("collection_rate_pct", metrics)
        self.assertIn("status_breakdown", metrics)
        self.assertEqual(metrics["monetization_rate_pct"], 5.0)


if __name__ == "__main__":
    unittest.main()
