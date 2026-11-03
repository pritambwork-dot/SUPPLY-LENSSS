"""
SupplyLens Sourcing Scenario & Multi-Scenario Comparison Service
Implements scenario management, what-if sensitivity simulations, and actionable sourcing plans.
"""

from typing import Dict, Any, List, Optional
import uuid
from app.services.logistics.cost_engine import LandedCostEngine
from app.data.seed_data import SUPPLIERS_SEED


# In-memory storage for active and saved scenarios
_IN_MEMORY_SCENARIOS: Dict[str, Dict[str, Any]] = {}
_SAVED_SCENARIOS: Dict[str, Dict[str, Any]] = {}


class ScenarioService:
    """Manages creation, evaluation, comparison, and what-if simulation of sourcing scenarios."""

    @classmethod
    def calculate_scenario(
        cls,
        supplier_id: str,
        quantity: int = 1000,
        destination_city: str = "Bhubaneswar",
        destination_country: str = "India",
        destination_type: str = "Business",
        product_name: Optional[str] = None,
        business_profile: Optional[Dict[str, Any]] = None,
        scenario_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculates a full sourcing scenario for a supplier, volume, and destination.
        """
        # Find supplier
        supplier = next((s for s in SUPPLIERS_SEED if s["id"] == supplier_id), None)
        if not supplier:
            # Fallback to first verified supplier
            supplier = SUPPLIERS_SEED[0]

        # Find target product
        products = supplier.get("products", [])
        product = products[0] if products else {
            "id": "prod-def",
            "name": product_name or "Standard Sourced Product",
            "quoted_price": 15.0,
            "currency": "INR",
            "moq": 1000,
            "unit": "piece"
        }
        if product_name:
            matching = next((p for p in products if product_name.lower() in p.get("name", "").lower()), None)
            if matching:
                product = matching

        # Calculate landed cost via LandedCostEngine
        calc = LandedCostEngine.calculate_landed_cost(
            supplier=supplier,
            product=product,
            quantity=quantity,
            destination_city=destination_city,
            destination_country=destination_country,
            target_currency="INR"
        )

        sid = scenario_id or f"scen-{uuid.uuid4().hex[:8]}"

        scenario_record = {
            "id": sid,
            "supplier_id": supplier["id"],
            "supplier_name": supplier["name"],
            "product_name": product["name"],
            "quantity": quantity,
            "origin_city": calc["origin"]["city"],
            "origin_country": calc["origin"]["country"],
            "origin_lat": calc["origin"]["lat"],
            "origin_lng": calc["origin"]["lng"],
            "destination_city": destination_city,
            "destination_country": destination_country,
            "destination_lat": calc["destination"]["lat"],
            "destination_lng": calc["destination"]["lng"],
            "currency": "INR",
            "supplier_unit_price": calc["supplier_unit_price"],
            "estimated_product_cost": calc["breakdown"]["product_cost"],
            "estimated_logistics_cost": calc["breakdown"]["logistics_cost"],
            "estimated_total_cost": calc["breakdown"]["total_cost"],
            "estimated_cost_per_unit": calc["breakdown"]["cost_per_unit"],
            "cost_confidence": calc["breakdown"]["confidence"],
            "confidence_reason": calc["breakdown"]["confidence_reason"],
            "price_source": calc["breakdown"]["price_freshness"],
            "price_date": supplier.get("verification_date", "August 2026"),
            "is_price_stale": calc["breakdown"]["is_price_stale"],
            "moq": calc["moq"],
            "moq_met": calc["moq_met"],
            "rating": supplier.get("rating", 4.5),
            "review_count": supplier.get("review_count", 0),
            "verification_status": supplier.get("verification_status", "Verified"),
            "logistics": calc["logistics"],
            "breakdown": calc["breakdown"],
            "scenario_status": "active",
            "created_at": "Today",
        }

        _IN_MEMORY_SCENARIOS[sid] = scenario_record
        return scenario_record

    @classmethod
    def compare_scenarios(
        cls,
        scenarios: List[Dict[str, Any]],
        business_profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Compares up to 5 sourcing scenarios, isolating:
        1. Cheapest Unit Price
        2. Cheapest Estimated Total
        3. Best Overall
        4. Best for Starting Small
        """
        if not scenarios:
            return {
                "scenarios": [],
                "cheapest_unit_price_scenario_id": "",
                "cheapest_total_cost_scenario_id": "",
                "best_overall_scenario_id": "",
                "best_starting_small_scenario_id": None,
                "ai_explanation": "No scenarios provided for comparison.",
                "sourcing_plan": [],
                "what_if_insights": []
            }

        # 1. Cheapest Unit Price (ex-factory listed price)
        sorted_by_unit = sorted(scenarios, key=lambda s: s["supplier_unit_price"])
        cheapest_unit_scenario = sorted_by_unit[0]

        # 2. Cheapest Estimated Total (delivered landed cost for this volume)
        sorted_by_total = sorted(scenarios, key=lambda s: s["estimated_total_cost"])
        cheapest_total_scenario = sorted_by_total[0]

        # 3. Best for Starting Small (lowest initial commitment / lowest MOQ)
        sorted_by_moq = sorted(scenarios, key=lambda s: (s["moq"], s["supplier_unit_price"] * s["moq"]))
        best_starting_small = sorted_by_moq[0]

        # 4. Best Overall Fit
        # Consider user budget and stage
        budget = 1000000.0
        stage = "idea"
        if business_profile:
            budget = float(business_profile.get("budget_amount", 1000000.0))
            stage = business_profile.get("business_stage", "idea").lower()

        # In idea stage / low budget, prefer lowest total cost and lowest risk (high rating & local)
        def score_scenario(sc):
            score = 100.0
            # Total cost factor (lower is better)
            cost_ratio = sc["estimated_total_cost"] / max(1.0, cheapest_total_scenario["estimated_total_cost"])
            score -= (cost_ratio - 1.0) * 35.0
            # Rating bonus
            score += (sc.get("rating", 4.0) - 4.0) * 20.0
            # Proximity bonus (less than 500km gives speed and ease of factory audit)
            dist = sc.get("logistics", {}).get("distance_km", 2000)
            if dist < 100:
                score += 15.0
            elif dist < 500:
                score += 8.0
            # MOQ compliance bonus
            if sc.get("moq_met"):
                score += 10.0
            else:
                score -= 25.0
            return score

        scored = sorted(scenarios, key=score_scenario, reverse=True)
        best_overall = scored[0]

        # 5. Build Honest Comparative AI Explanation
        if cheapest_unit_scenario["id"] != cheapest_total_scenario["id"]:
            explanation = (
                f"**{cheapest_unit_scenario['supplier_name']}** has the lowest ex-factory product price "
                f"(₹{cheapest_unit_scenario['supplier_unit_price']:,.2f}/unit). However, **{cheapest_total_scenario['supplier_name']}** "
                f"has the lowest estimated overall sourcing cost (₹{cheapest_total_scenario['estimated_total_cost']:,.0f} total, "
                f"or ₹{cheapest_total_scenario['estimated_cost_per_unit']:,.2f}/unit) because of its significantly lower logistics freight burden. "
                f"For your current stage, **{best_overall['supplier_name']}** is recommended as the Best Overall fit."
            )
        else:
            explanation = (
                f"**{cheapest_total_scenario['supplier_name']}** leads in both factory unit pricing and overall estimated landed cost "
                f"(₹{cheapest_total_scenario['estimated_total_cost']:,.0f} total). **{best_starting_small['supplier_name']}** remains "
                f"the safest option for small test runs with an accessible MOQ of {best_starting_small['moq']:,} units."
            )

        # 6. Actionable Sourcing Plan (7 Steps)
        sourcing_plan = [
            {
                "step_number": 1,
                "title": f"Contact {best_overall['supplier_name']}",
                "description": f"Initiate communication via official switchboard and confirm specification for {best_overall['product_name']}.",
                "action_type": "quote_request"
            },
            {
                "step_number": 2,
                "title": "Request Physical Production Sample",
                "description": "Order an evaluation sample to physically verify material grade, finish, and durability before batch contracting.",
                "action_type": "sample"
            },
            {
                "step_number": 3,
                "title": f"Confirm Minimum Order (MOQ {best_overall['moq']:,} units)",
                "description": f"Verify if the factory allows a trial batch of {best_overall['quantity']:,} units with standard warranty terms.",
                "action_type": "moq_check"
            },
            {
                "step_number": 4,
                "title": "Confirm Shipping & Incoterms",
                "description": f"Clarify dispatch terms ({'Ex-Factory' if best_overall['origin_country'] == 'India' else 'FOB / CIF'}) and loading charges to {best_overall['destination_city']}.",
                "action_type": "incoterms"
            },
            {
                "step_number": 5,
                "title": "Validate Final Landed Cost",
                "description": f"Verify that total outlay remains within your estimated budget of ₹{best_overall['estimated_total_cost']:,.0f}.",
                "action_type": "contracting"
            },
            {
                "step_number": 6,
                "title": f"Benchmark Against {cheapest_unit_scenario['supplier_name']}",
                "description": f"Keep {cheapest_unit_scenario['supplier_name']} as a secondary alternative for when production scales up.",
                "action_type": "contracting"
            },
            {
                "step_number": 7,
                "title": "Place Small Validation Order",
                "description": "Proceed with payment milestones (e.g. 30% advance, 70% against dispatch inspection report).",
                "action_type": "pilot_order"
            }
        ]

        # 7. What-if volume insights
        what_if_insights = [
            f"At {scenarios[0]['quantity']:,} units: {cheapest_total_scenario['supplier_name']} offers the lowest landed cost.",
            f"If ordering below 2,000 units: {best_starting_small['supplier_name']} has the lowest cash commitment.",
            f"For container-scale orders (>15,000 units): international mills deliver steeper volume price breaks."
        ]

        return {
            "scenarios": scenarios,
            "cheapest_unit_price_scenario_id": cheapest_unit_scenario["id"],
            "cheapest_total_cost_scenario_id": cheapest_total_scenario["id"],
            "best_overall_scenario_id": best_overall["id"],
            "best_starting_small_scenario_id": best_starting_small["id"],
            "ai_explanation": explanation,
            "sourcing_plan": sourcing_plan,
            "what_if_insights": what_if_insights
        }

    @classmethod
    def what_if_recalculate(
        cls,
        scenario_ids: List[str],
        new_quantity: int,
        destination_city: str = "Bhubaneswar",
        destination_country: str = "India",
        business_profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Dynamically recalculates all scenarios at new_quantity and evaluates shifts in cost hierarchy.
        """
        updated_scenarios = []
        for sid in scenario_ids:
            old_scen = _IN_MEMORY_SCENARIOS.get(sid) or _SAVED_SCENARIOS.get(sid)
            supplier_id = old_scen["supplier_id"] if old_scen else SUPPLIERS_SEED[0]["id"]
            product_name = old_scen["product_name"] if old_scen else None

            recomputed = cls.calculate_scenario(
                supplier_id=supplier_id,
                quantity=new_quantity,
                destination_city=destination_city,
                destination_country=destination_country,
                product_name=product_name,
                business_profile=business_profile,
                scenario_id=sid
            )
            updated_scenarios.append(recomputed)

        # Run multi-scenario comparison on updated scenarios
        return cls.compare_scenarios(updated_scenarios, business_profile)

    @classmethod
    def save_scenario(cls, scenario_id: str) -> Dict[str, Any]:
        """Saves a scenario to the user's permanent list."""
        scen = _IN_MEMORY_SCENARIOS.get(scenario_id)
        if scen:
            scen_copy = dict(scen)
            scen_copy["scenario_status"] = "saved"
            _SAVED_SCENARIOS[scenario_id] = scen_copy
            return {"status": "saved", "scenario": scen_copy}
        return {"status": "not_found", "message": "Scenario ID not active in session."}

    @classmethod
    def get_saved_scenarios(cls) -> List[Dict[str, Any]]:
        """Returns all bookmarked scenarios."""
        return list(_SAVED_SCENARIOS.values())
