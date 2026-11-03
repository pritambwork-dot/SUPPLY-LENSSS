"""
Invoice Service for SupplyLens.
Handles generation of commercial fee statements, sequential invoice numbering,
HTML preview rendering, and credit notes.
"""

from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.monetization import Invoice, ServiceFeeAssessment, SourcingDeal, CreditNote
from app.models.database import Business, User


class InvoiceService:
    @staticmethod
    def generate_next_invoice_number(db: Session, year: Optional[int] = None) -> str:
        """Generate a sequential invoice number like SL-2026-0001."""
        yr = year or datetime.utcnow().year
        prefix = f"SL-{yr}-"
        
        # Count existing invoices with this prefix
        count = db.query(Invoice).filter(Invoice.invoice_number.like(f"{prefix}%")).count()
        next_num = count + 1
        return f"{prefix}{next_num:04d}"

    @staticmethod
    def generate_next_credit_note_number(db: Session, year: Optional[int] = None) -> str:
        """Generate a sequential credit note number like SL-CN-2026-0001."""
        yr = year or datetime.utcnow().year
        prefix = f"SL-CN-{yr}-"
        count = db.query(CreditNote).filter(CreditNote.credit_note_number.like(f"{prefix}%")).count()
        next_num = count + 1
        return f"{prefix}{next_num:04d}"

    @classmethod
    def create_invoice_for_assessment(
        cls,
        db: Session,
        assessment: ServiceFeeAssessment,
        deal: SourcingDeal,
        business: Business,
        user: Optional[User] = None,
    ) -> Invoice:
        """
        Create a formal invoice for an assessed 5% success fee.
        Idempotent: if an invoice already exists for this assessment, return it.
        """
        existing = db.query(Invoice).filter(Invoice.assessment_id == assessment.id).first()
        if existing:
            return existing

        invoice_number = cls.generate_next_invoice_number(db)
        customer_name = business.name if business else "NexaTech Hardware"
        biz_slug = business.name.lower().replace(' ', '') if business else "nexatech"
        customer_email = user.email if user else f"billing@{biz_slug}.com"
        customer_address = (business.location if business and business.location else "Registered Office, Bengaluru, India")
        biz_id = business.id if business else deal.business_id

        invoice = Invoice(
            invoice_number=invoice_number,
            assessment_id=assessment.id,
            deal_id=deal.id,
            business_id=biz_id,
            customer_name=customer_name,
            customer_email=customer_email,
            customer_address=customer_address,
            subtotal=assessment.calculated_fee,
            tax_rate=assessment.tax_rate,
            tax_amount=assessment.tax_amount,
            total_amount=assessment.total_fee_due,
            currency=assessment.currency,
            status="issued",
            issued_date=datetime.utcnow(),
            due_date=assessment.due_date,
            pdf_url=f"/api/invoices/{invoice_number}/html",
            notes=(
                f"SupplyLens 5% Success Fee for Deal Ref: {deal.contract_reference}. "
                f"Assessment Policy: {assessment.policy_version}. "
                f"Deal Value: {assessment.currency} {assessment.fee_base_amount:,.2f}"
            ),
        )
        db.add(invoice)
        db.flush()

        # Update assessment status to invoiced
        assessment.fee_status = "invoiced"
        db.flush()

        return invoice

    @classmethod
    def generate_invoice_html(cls, invoice: Invoice, deal: SourcingDeal) -> str:
        """Render a clean, professional HTML invoice document for printing/PDF viewing."""
        currency_symbol = "₹" if invoice.currency == "INR" else "$"
        issued_date_str = invoice.issued_date.strftime("%B %d, %Y") if invoice.issued_date else "N/A"
        due_date_str = invoice.due_date.strftime("%B %d, %Y") if invoice.due_date else "N/A"
        
        status_color = "#10B981" if invoice.status == "paid" else "#3B82F6"
        status_label = invoice.status.upper()

        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SupplyLens Invoice {invoice.invoice_number}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #0b0f19;
            color: #e2e8f0;
            margin: 0;
            padding: 40px;
        }}
        .invoice-card {{
            max-width: 800px;
            margin: 0 auto;
            background: #111827;
            border: 1px solid #1f2937;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }}
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid #374151;
            padding-bottom: 24px;
        }}
        .logo {{
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #3b82f6;
        }}
        .logo span {{
            color: #ffffff;
        }}
        .status-badge {{
            display: inline-block;
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            background: rgba(59, 130, 246, 0.1);
            color: {status_color};
            border: 1px solid {status_color};
        }}
        .meta-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-top: 32px;
            padding-bottom: 24px;
            border-bottom: 1px solid #1f2937;
        }}
        .meta-block h4 {{
            margin: 0 0 8px 0;
            font-size: 12px;
            text-transform: uppercase;
            color: #9ca3af;
            letter-spacing: 0.5px;
        }}
        .meta-block p {{
            margin: 0;
            font-size: 15px;
            color: #f3f4f6;
            line-height: 1.5;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 32px;
        }}
        th {{
            text-align: left;
            padding: 12px 16px;
            font-size: 12px;
            text-transform: uppercase;
            color: #9ca3af;
            border-bottom: 1px solid #374151;
        }}
        td {{
            padding: 16px;
            font-size: 14px;
            color: #e5e7eb;
            border-bottom: 1px solid #1f2937;
        }}
        .totals {{
            margin-top: 24px;
            margin-left: auto;
            width: 320px;
        }}
        .total-row {{
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
            color: #9ca3af;
        }}
        .grand-total {{
            font-size: 18px;
            font-weight: 700;
            color: #ffffff;
            border-top: 1px solid #374151;
            padding-top: 12px;
            margin-top: 8px;
        }}
        .footer {{
            margin-top: 48px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #1f2937;
            padding-top: 24px;
        }}
    </style>
</head>
<body>
    <div class="invoice-card">
        <div class="header">
            <div>
                <div class="logo">Supply<span>Lens</span></div>
                <p style="margin: 4px 0 0 0; color: #9ca3af; font-size: 13px;">Commercial Sourcing Intelligence & Success Platform</p>
            </div>
            <div style="text-align: right;">
                <div class="status-badge">{status_label}</div>
                <h2 style="margin: 8px 0 0 0; font-size: 20px; color: #fff;">{invoice.invoice_number}</h2>
            </div>
        </div>

        <div class="meta-grid">
            <div class="meta-block">
                <h4>Billed To</h4>
                <p><strong>{invoice.customer_name}</strong></p>
                <p>{invoice.customer_email}</p>
                <p>{invoice.customer_address}</p>
            </div>
            <div class="meta-block" style="text-align: right;">
                <h4>Invoice Details</h4>
                <p>Issue Date: <strong>{issued_date_str}</strong></p>
                <p>Payment Due: <strong>{due_date_str}</strong></p>
                <p>PO / Contract Ref: <strong>{deal.contract_reference}</strong></p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item & Description</th>
                    <th>Fee Base</th>
                    <th>Rate</th>
                    <th style="text-align: right;">Amount ({invoice.currency})</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>SupplyLens 5% Sourcing Success Fee</strong><br>
                        <span style="font-size: 12px; color: #9ca3af;">Confirmed deal agreement: {deal.title}</span>
                    </td>
                    <td>{currency_symbol}{deal.confirmed_deal_value:,.2f}</td>
                    <td>5.0%</td>
                    <td style="text-align: right;">{currency_symbol}{invoice.subtotal:,.2f}</td>
                </tr>
            </tbody>
        </table>

        <div class="totals">
            <div class="total-row">
                <span>Subtotal (Success Fee)</span>
                <span>{currency_symbol}{invoice.subtotal:,.2f}</span>
            </div>
            <div class="total-row">
                <span>GST / Applicable Tax ({invoice.tax_rate}%)</span>
                <span>{currency_symbol}{invoice.tax_amount:,.2f}</span>
            </div>
            <div class="total-row grand-total">
                <span>Total Payable</span>
                <span>{currency_symbol}{invoice.total_amount:,.2f}</span>
            </div>
        </div>

        <div class="footer">
            <p>SupplyLens Technologies Inc. &bull; Transparent Sourcing Monetization &bull; Payment terms: Net 15</p>
            <p>For questions regarding this fee statement, contact commercial@supplylens.ai</p>
        </div>
    </div>
</body>
</html>"""

    @classmethod
    def issue_credit_note(
        cls,
        db: Session,
        invoice: Invoice,
        amount: float,
        reason: str,
        approved_by: str,
    ) -> CreditNote:
        """Issue an auditable credit note against an invoice."""
        if amount <= 0:
            raise ValueError("Credit note amount must be positive.")
        if amount > invoice.total_amount:
            raise ValueError("Credit note amount cannot exceed the total invoice amount.")

        cn_number = cls.generate_next_credit_note_number(db)
        credit_note = CreditNote(
            credit_note_number=cn_number,
            invoice_id=invoice.id,
            deal_id=invoice.deal_id,
            amount=amount,
            currency=invoice.currency,
            reason=reason,
            approved_by=approved_by,
            status="issued",
        )
        db.add(credit_note)

        # Update invoice status if fully credited
        if amount == invoice.total_amount:
            invoice.status = "refunded"
        
        db.flush()
        return credit_note
