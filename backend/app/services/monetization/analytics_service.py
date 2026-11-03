"""
Monetization Revenue Analytics Service for SupplyLens.
Authoritative SQL aggregations of deal volume, success fees assessed, fees collected,
outstanding receivables, and collection performance metrics.
"""

from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, case, desc
from datetime import datetime, timedelta

from app.models.monetization import SourcingDeal, ServiceFeeAssessment, Invoice, Payment, Tender


class MonetizationAnalyticsService:

    @classmethod
    def get_revenue_overview(cls, db: Session, currency: str = "INR") -> Dict[str, Any]:
        """Calculates comprehensive executive monetization KPIs from live database tables."""

        # Deal Metrics
        total_deals_count = db.query(func.count(SourcingDeal.id)).scalar() or 0
        confirmed_deals_query = db.query(
            func.count(SourcingDeal.id),
            func.coalesce(func.sum(SourcingDeal.confirmed_deal_value), 0.0)
        ).filter(SourcingDeal.fee_trigger_active == True)
        confirmed_deals_count, total_gmv = confirmed_deals_query.first() or (0, 0.0)

        # Service Fee Assessments
        assessments_query = db.query(
            func.count(ServiceFeeAssessment.id),
            func.coalesce(func.sum(ServiceFeeAssessment.calculated_fee), 0.0),
            func.coalesce(func.sum(ServiceFeeAssessment.tax_amount), 0.0),
            func.coalesce(func.sum(ServiceFeeAssessment.total_fee_due), 0.0)
        )
        total_assessments_count, total_assessed_fee, total_tax_assessed, total_gross_assessed = assessments_query.first() or (0, 0.0, 0.0, 0.0)

        # Collections (Paid Invoices / Captured Payments)
        collected_query = db.query(
            func.count(Payment.id),
            func.coalesce(func.sum(Payment.amount), 0.0)
        ).filter(Payment.status.in_(["captured", "authorized", "paid"]))
        collected_payments_count, total_collected = collected_query.first() or (0, 0.0)

        # Invoiced vs Overdue
        now = datetime.utcnow()
        invoices_stats = db.query(
            func.count(Invoice.id),
            func.coalesce(func.sum(case((Invoice.status == 'paid', Invoice.total_amount), else_=0.0)), 0.0),
            func.coalesce(func.sum(case((Invoice.status.in_(['issued', 'pending']), Invoice.total_amount), else_=0.0)), 0.0),
            func.coalesce(func.sum(case((Invoice.due_date < now, case((Invoice.status.in_(['issued', 'pending']), Invoice.total_amount), else_=0.0)), else_=0.0)), 0.0),
        ).first()

        total_invoices_count = invoices_stats[0] or 0
        total_invoiced_paid = invoices_stats[1] or 0.0
        outstanding_receivables = invoices_stats[2] or 0.0
        overdue_receivables = invoices_stats[3] or 0.0

        # Collection efficiency rate
        effective_collected = max(float(total_collected), float(total_invoiced_paid))
        collection_rate_pct = (
            round((effective_collected / float(total_gross_assessed)) * 100.0, 1)
            if total_gross_assessed > 0 else 0.0
        )

        average_deal_size = (
            round(float(total_gmv) / confirmed_deals_count, 2)
            if confirmed_deals_count > 0 else 0.0
        )

        # Tenders Count
        total_tenders = db.query(func.count(Tender.id)).scalar() or 0
        awarded_tenders = db.query(func.count(Tender.id)).filter(Tender.status == "awarded").scalar() or 0

        # Recent deals pipeline
        recent_deals = (
            db.query(SourcingDeal)
            .order_by(desc(SourcingDeal.created_at))
            .limit(10)
            .all()
        )

        pipeline_breakdown = (
            db.query(SourcingDeal.status, func.count(SourcingDeal.id), func.sum(SourcingDeal.confirmed_deal_value))
            .group_by(SourcingDeal.status)
            .all()
        )

        status_breakdown = [
            {
                "status": row[0],
                "count": row[1],
                "total_value": round(float(row[2] or 0.0), 2),
            }
            for row in pipeline_breakdown
        ]

        return {
            "currency": currency,
            "monetization_rate_pct": 5.0,
            "total_tenders": total_tenders,
            "awarded_tenders": awarded_tenders,
            "total_deals_count": total_deals_count,
            "confirmed_deals_count": confirmed_deals_count,
            "total_contract_gmv": round(float(total_gmv), 2),
            "average_deal_size": average_deal_size,
            "total_assessed_fee": round(float(total_assessed_fee), 2),
            "total_tax_assessed": round(float(total_tax_assessed), 2),
            "total_gross_assessed": round(float(total_gross_assessed), 2),
            "total_collected": round(effective_collected, 2),
            "outstanding_receivables": round(float(outstanding_receivables), 2),
            "overdue_receivables": round(float(overdue_receivables), 2),
            "collection_rate_pct": collection_rate_pct,
            "total_invoices_count": total_invoices_count,
            "status_breakdown": status_breakdown,
        }
