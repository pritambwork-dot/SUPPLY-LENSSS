"""
SupplyLens Personalized Sourcing Suggestion Engine
Generates context-aware, high-conversion suggestion chips and next actions.
"""

from typing import List, Dict, Any, Optional


class SuggestionEngine:
    @staticmethod
    def get_contextual_suggestions(
        active_route: str = "/dashboard",
        business_profile: Optional[Dict[str, Any]] = None,
        active_supplier_id: Optional[str] = None,
    ) -> List[Dict[str, str]]:
        """
        Returns relevant prompt chips tailored to the user's current workflow stage.
        """
        route = (active_route or "").lower()
        biz_name = (business_profile or {}).get("name") or "my business"
        city = (business_profile or {}).get("location") or "my region"

        # 1. Vendor Details Page (/vendors/[id])
        if "/vendors/" in route or active_supplier_id:
            return [
                {
                    "label": "Audit verification evidence",
                    "action": "audit_supplier",
                    "prompt": "Break down the verification score and credibility evidence for this supplier.",
                },
                {
                    "label": "Compare with regional competitors",
                    "action": "compare_competitors",
                    "prompt": "How does this supplier compare with other regional manufacturers in price and MOQ?",
                },
                {
                    "label": "Draft RFQ for this vendor",
                    "action": "draft_rfq",
                    "prompt": "Help me draft a formal Request for Quotation (RFQ) for this supplier for a pilot batch.",
                },
                {
                    "label": "Estimate landed freight cost",
                    "action": "calc_freight",
                    "prompt": "Estimate the landed logistics and road freight cost from this facility to my location.",
                },
            ]

        # 2. Requirements & BOM Page (/customer/requirements)
        if "requirements" in route or "bom" in route:
            return [
                {
                    "label": "Suggest raw material specs",
                    "action": "suggest_specs",
                    "prompt": "Recommend technical specifications and grades for my active bill of materials.",
                },
                {
                    "label": "Identify missing materials",
                    "action": "find_gaps",
                    "prompt": f"Based on {biz_name}'s product concept, what additional raw materials or packaging components might be missing?",
                },
                {
                    "label": "Find certified suppliers for this BOM",
                    "action": "match_bom",
                    "prompt": "Find verified suppliers capable of supplying my primary BOM requirements.",
                },
            ]

        # 3. Saved Vendors Page (/customer/saved-vendors)
        if "saved" in route:
            return [
                {
                    "label": "Compare saved vendors side-by-side",
                    "action": "compare_saved",
                    "prompt": "Compare all my saved suppliers in a structured table highlighting MOQ, pricing, and verification scores.",
                },
                {
                    "label": "Optimal order allocation",
                    "action": "optimize_saved",
                    "prompt": "How should I distribute my purchase order volume across my saved suppliers to minimize risk and cost?",
                },
                {
                    "label": "Check saved vendor availability",
                    "action": "check_status",
                    "prompt": "Review the verification and operational status of my saved suppliers.",
                },
            ]

        # 4. Deals & Invoices Page (/customer/deals, /customer/invoices)
        if "deals" in route or "invoices" in route:
            return [
                {
                    "label": "Payment milestone best practices",
                    "action": "milestones",
                    "prompt": "What are recommended payment milestones (e.g. 30% advance, 70% post-QC) for manufacturing contracts?",
                },
                {
                    "label": "How does SupplyLens escrow work?",
                    "action": "escrow_info",
                    "prompt": "Explain how SupplyLens milestones and platform service fees protect buyers.",
                },
            ]

        # 5. Default Dashboard / Customer Portal Overview
        return [
            {
                "label": "Find verified suppliers near me",
                "action": "near_suppliers",
                "prompt": f"Find verified packaging and raw material manufacturers located near {city}.",
            },
            {
                "label": "Optimize my sourcing budget",
                "action": "optimize_budget",
                "prompt": f"How can I allocate my sourcing budget effectively for {biz_name} to keep cash flow safe during launch?",
            },
            {
                "label": "What does MOQ mean for my cash flow?",
                "action": "explain_moq",
                "prompt": "Explain MOQ tradeoffs and strategies to negotiate lower pilot order quantities.",
            },
            {
                "label": "Explain landed cost vs quoted price",
                "action": "explain_landed",
                "prompt": "What is the difference between ex-factory price and landed cost, including GST and freight?",
            },
        ]
