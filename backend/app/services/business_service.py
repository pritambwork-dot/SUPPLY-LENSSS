"""
SupplyLens Business Understanding & Profile Analysis Service
Calculates budget classification, business snapshot narratives, and stage guidelines.
"""

from typing import Dict, Any, List


def classify_budget(amount: float, currency: str = "INR") -> Dict[str, str]:
    """Classifies capital constraints and generates non-technical guidance."""
    inr_amount = amount * 85.0 if currency == "USD" else (amount * 92.0 if currency == "EUR" else amount)

    if inr_amount <= 1000000.0:  # <= ₹10 Lakh
        return {
            "category": "low_initial_capital",
            "constraint_summary": "Low Initial Capital",
            "insight": "Your biggest constraint right now is initial capital. We're prioritizing suppliers with smaller order sizes (low MOQ) and low upfront tooling costs.",
            "recommended_strategy": "Contract Manufacturing / OEM without buying fixed machinery.",
        }
    elif inr_amount <= 5000000.0:  # <= ₹50 Lakh
        return {
            "category": "moderate_capital",
            "constraint_summary": "Moderate Launch Capital",
            "insight": "You have a balanced launch budget. You can split capital between custom-branded pilot batches and certified packaging.",
            "recommended_strategy": "Dedicated tooling with custom molds and certified compliance.",
        }
    else:
        return {
            "category": "well_funded",
            "constraint_summary": "Growth / Scaled Capital",
            "insight": "You have strong growth capital. We're prioritizing high-capacity manufacturers offering maximum volume discounts and automated lines.",
            "recommended_strategy": "Direct high-volume factory contracts or automated in-house plant machinery.",
        }


def generate_business_snapshot(profile: Dict[str, Any]) -> str:
    """Generates a plain-language summary of what the user is building."""
    idea = profile.get("idea") or profile.get("business_idea", "")
    sector = profile.get("sector", "Manufacturing")
    model = profile.get("business_model", "B2B")
    city = profile.get("city", "India")
    country = profile.get("country", "India")
    customer = profile.get("target_customer", "local businesses")
    budget = profile.get("budget_amount") or profile.get("budget", 800000)
    currency = profile.get("budget_currency") or profile.get("currency", "INR")

    return (
        f"A {model} {sector.lower()} business in {city}, {country} focused on supplying {customer.lower()} "
        f"with an initial operating capital commitment of {currency} {budget:,.0f}."
    )


def get_stage_guidelines(stage: str) -> Dict[str, Any]:
    """Provides sourcing recommendations according to the user's business stage."""
    stage_lower = stage.lower()
    if stage_lower == "idea":
        return {
            "stage": "Idea",
            "focus": "Low-risk validation",
            "priority": "Small MOQ (<5,000 units), low initial capital commitment, nearby suppliers.",
            "risk_tolerance": "Low",
        }
    elif stage_lower == "testing":
        return {
            "stage": "Testing Samples",
            "focus": "Product quality & testing",
            "priority": "Physical sample kits, material testing reports, compliance certifications.",
            "risk_tolerance": "Low",
        }
    elif stage_lower == "launching":
        return {
            "stage": "Launching Soon",
            "focus": "Production kickoff",
            "priority": "Lead time reliability, doorstep delivery terms, initial batch production.",
            "risk_tolerance": "Moderate",
        }
    elif stage_lower == "growing":
        return {
            "stage": "Growing",
            "focus": "Unit economics & scale",
            "priority": "Volume price tiers, multi-source supplier resilience, secondary backups.",
            "risk_tolerance": "Moderate-High",
        }
    else:
        return {
            "stage": "Established",
            "focus": "Supply chain efficiency",
            "priority": "Container load rates (FCL), automated production contracts, direct port freight.",
            "risk_tolerance": "High",
        }
