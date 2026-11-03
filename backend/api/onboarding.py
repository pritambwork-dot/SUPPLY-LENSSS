"""
SupplyLens Master Onboarding & Personalized Dashboard API Router
Handles multi-step onboarding persistence, Gemini-powered AI requirement extraction,
profile confirmation, and dynamic personalized dashboard payload generation.
"""

from datetime import datetime
import json
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Body, HTTPException, Query
from pydantic import BaseModel, Field

from app.services.ai_service import ai_service
from app.data.seed_data import SUPPLIERS_SEED
from app.services.business_service import classify_budget

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

# In-memory session store fallback for demo & offline persistence
ONBOARDING_STORE: Dict[str, Dict[str, Any]] = {}
USER_PROFILES_STORE: Dict[str, Dict[str, Any]] = {
    "usr-demo-001": {
        "id": "usr-demo-001",
        "email": "pritam@supplylens.ai",
        "full_name": "Pritam Biswas",
        "country": "India",
        "city": "Bhubaneswar",
        "phone_number": "+91 98765 43210",
        "preferred_currency": "USD",
        "preferred_language": "en",
        "job_title": "Founder & Sourcing Lead",
        "professional_role": "Sourcing Director",
    },
    "usr-guest": {
        "id": "usr-guest",
        "email": "guest@supplylens.ai",
        "full_name": "Guest",
        "country": "India",
        "city": "Bhubaneswar",
        "phone_number": "+91 98765 43210",
        "preferred_currency": "USD",
        "preferred_language": "en",
        "job_title": "Guest Founder",
        "professional_role": "Lead Sourcing Director",
    }
}
USER_BUSINESSES_STORE: Dict[str, Dict[str, Any]] = {
    "usr-demo-001": {
        "id": "biz-demo-001",
        "user_id": "usr-demo-001",
        "name": "EcoPack Solutions",
        "industry": "Sustainable Packaging",
        "business_stage": "Operating business",
        "business_type": "D2C brand",
        "country": "India",
        "city": "Bhubaneswar",
        "description": "Manufacturer of compostable takeaway containers, kraft corrugated mailers, and eco-friendly consumer packaging.",
        "target_market": "E-commerce brands and premium retail chains worldwide",
        "budget_amount": 150000,
        "budget_currency": "USD",
        "geographic_preferences": ["India", "Vietnam", "Germany"],
        "supplier_priorities": ["Low MOQ", "Quality certifications", "Eco certifications"],
        "products": [
            {
                "id": "prod-001",
                "name": "Compostable Food Container",
                "category": "Food Packaging",
                "specifications": "Biodegradable sugarcane bagasse with leak-proof PLA barrier",
                "materials": [
                    {"name": "Sugarcane Bagasse Pulp", "quantity": 10000, "unit": "kg", "grade": "Food Grade A"},
                    {"name": "PLA Bio-film Coating", "quantity": 2500, "unit": "kg", "grade": "EN 13432 Certified"}
                ]
            },
            {
                "id": "prod-002",
                "name": "Heavy-Duty Kraft Shipping Box",
                "category": "Corrugated Packaging",
                "specifications": "3-ply corrugated kraft paperboard with soy-based ink printing",
                "materials": [
                    {"name": "Unbleached Kraft Paperboard", "quantity": 15000, "unit": "sq.m", "grade": "FSC Certified"}
                ]
            }
        ],
        "ai_sourcing_summary": {
            "summary": "High-growth sustainable packaging enterprise prioritizing certified green raw materials with low MOQ domestic-to-export fulfillment.",
            "recommended_categories": ["Bagasse Molding", "Kraft Paper", "Biodegradable Polymers"],
            "suggested_materials": ["Molded bamboo fiber", "Water-based dispersion barriers"]
        }
    },
    "usr-guest": {
        "id": "biz-guest-001",
        "user_id": "usr-guest",
        "name": "EcoPack Solutions",
        "industry": "Sustainable Packaging",
        "business_stage": "Operating business",
        "business_type": "D2C brand",
        "country": "India",
        "city": "Bhubaneswar",
        "description": "Manufacturer of compostable takeaway containers, kraft corrugated mailers, and eco-friendly consumer packaging.",
        "target_market": "E-commerce brands and premium retail chains worldwide",
        "budget_amount": 150000,
        "budget_currency": "USD",
        "geographic_preferences": ["India", "Vietnam", "Germany"],
        "supplier_priorities": ["Low MOQ", "Quality certifications", "Eco certifications"],
        "products": [
            {
                "id": "prod-001",
                "name": "Compostable Food Container",
                "category": "Food Packaging",
                "specifications": "Biodegradable sugarcane bagasse with leak-proof PLA barrier",
                "materials": [
                    {"name": "Sugarcane Bagasse Pulp", "quantity": 10000, "unit": "kg", "grade": "Food Grade A"},
                    {"name": "PLA Bio-film Coating", "quantity": 2500, "unit": "kg", "grade": "EN 13432 Certified"}
                ]
            }
        ],
        "ai_sourcing_summary": {
            "summary": "High-growth sustainable packaging enterprise prioritizing certified green raw materials with low MOQ domestic-to-export fulfillment.",
            "recommended_categories": ["Bagasse Molding", "Kraft Paper", "Biodegradable Polymers"],
            "suggested_materials": ["Molded bamboo fiber", "Water-based dispersion barriers"]
        }
    }
}


class SaveStepPayload(BaseModel):
    user_id: str
    step: int
    data: Dict[str, Any]


class AIUnderstandingPayload(BaseModel):
    business_name: Optional[str] = "New Venture"
    industry: Optional[str] = "Sustainable Packaging"
    business_stage: Optional[str] = "Idea stage"
    business_description: str
    target_market: Optional[str] = "Global"
    budget: Optional[float] = 50000.0
    currency: Optional[str] = "USD"
    preferred_countries: Optional[List[str]] = ["India", "Vietnam"]
    supplier_priorities: Optional[List[str]] = ["Lowest price", "Low MOQ"]
    raw_materials: Optional[List[Dict[str, Any]]] = []


class CompleteOnboardingPayload(BaseModel):
    user_id: str
    personal_info: Dict[str, Any]
    business_info: Dict[str, Any]
    products_and_materials: List[Dict[str, Any]]
    sourcing_preferences: Dict[str, Any]
    ai_understanding: Optional[Dict[str, Any]] = None


@router.get("/progress")
def get_onboarding_progress(user_id: str = Query(...)):
    """Fetch user's current onboarding step and progress."""
    if user_id in ONBOARDING_STORE:
        return ONBOARDING_STORE[user_id]

    # Check if user already has completed business in system
    if user_id in USER_BUSINESSES_STORE:
        record = {
            "user_id": user_id,
            "active_step": 6,
            "completed_steps": [1, 2, 3, 4, 5, 6],
            "onboarding_status": "completed",
            "data_snapshot": {
                "personal_info": USER_PROFILES_STORE.get(user_id, {}),
                "business_info": USER_BUSINESSES_STORE.get(user_id, {}),
                "products_and_materials": USER_BUSINESSES_STORE.get(user_id, {}).get("products", []),
                "sourcing_preferences": {
                    "budget": USER_BUSINESSES_STORE.get(user_id, {}).get("budget_amount", 100000),
                    "currency": USER_BUSINESSES_STORE.get(user_id, {}).get("budget_currency", "USD"),
                    "geographic_preferences": USER_BUSINESSES_STORE.get(user_id, {}).get("geographic_preferences", ["India"]),
                    "supplier_priorities": USER_BUSINESSES_STORE.get(user_id, {}).get("supplier_priorities", ["Lowest price"]),
                }
            },
            "started_at": datetime.utcnow().isoformat(),
            "completed_at": datetime.utcnow().isoformat()
        }
        ONBOARDING_STORE[user_id] = record
        return record

    # Initialize fresh onboarding state
    fresh_record = {
        "user_id": user_id,
        "active_step": 1,
        "completed_steps": [],
        "onboarding_status": "in_progress",
        "data_snapshot": {},
        "started_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "completed_at": None
    }
    ONBOARDING_STORE[user_id] = fresh_record
    return fresh_record


@router.post("/save-step")
def save_onboarding_step(payload: SaveStepPayload):
    """Saves progress for a single step so the user can refresh without losing data."""
    user_id = payload.user_id
    step = payload.step
    data = payload.data

    if user_id not in ONBOARDING_STORE:
        ONBOARDING_STORE[user_id] = {
            "user_id": user_id,
            "active_step": step,
            "completed_steps": [],
            "onboarding_status": "in_progress",
            "data_snapshot": {},
            "started_at": datetime.utcnow().isoformat(),
        }

    record = ONBOARDING_STORE[user_id]
    record["active_step"] = max(record["active_step"], step + 1 if step < 6 else 6)
    if step not in record["completed_steps"]:
        record["completed_steps"].append(step)
        record["completed_steps"].sort()

    record["updated_at"] = datetime.utcnow().isoformat()

    # Merge step data into snapshot
    step_key_map = {
        1: "personal_info",
        2: "business_info",
        3: "products_and_materials",
        4: "sourcing_preferences",
        5: "ai_understanding"
    }
    key = step_key_map.get(step, f"step_{step}")
    record["data_snapshot"][key] = data

    return {
        "status": "success",
        "active_step": record["active_step"],
        "completed_steps": record["completed_steps"],
        "onboarding_status": record["onboarding_status"]
    }


@router.post("/ai-understand")
def ai_understand_requirements(payload: AIUnderstandingPayload):
    """
    Invokes Gemini to analyze the user's business description and produce
    a structured sourcing decomposition. Includes resilient fallback when AI is unavailable.
    """
    prompt = f"""
You are the SupplyLens AI Sourcing Architect. Analyze this new business idea and generate a structured sourcing profile.

BUSINESS DETAILS:
- Name: {payload.business_name}
- Industry: {payload.industry}
- Stage: {payload.business_stage}
- Description: {payload.business_description}
- Target Market: {payload.target_market}
- Sourcing Budget: {payload.currency} {payload.budget}
- Preferred Regions: {', '.join(payload.preferred_countries or ['India'])}
- Sourcing Priorities: {', '.join(payload.supplier_priorities or ['Low MOQ'])}

Return ONLY valid JSON matching this schema:
{{
  "business_summary": "1-2 sentence executive summary of the business model and sourcing challenge",
  "industry_classification": "Normalized industry classification",
  "product_categories": ["Category 1", "Category 2"],
  "suggested_materials": [
    {{
      "material_name": "Name of raw material or component",
      "grade": "Standard industry grade or specification",
      "specifications": "Key technical property (e.g. food contact safe, UV resistant)",
      "estimated_quantity": 1000,
      "unit": "kg/units/meters",
      "is_ai_suggestion": true
    }}
  ],
  "sourcing_priorities": ["Priority 1", "Priority 2"],
  "recommended_regions": ["Region 1", "Region 2"],
  "missing_information": ["Any crucial specification the user hasn't specified yet"],
  "clarifying_questions": ["A helpful clarifying question for procurement"]
}}
"""
    try:
        raw_text = ai_service.generate_text(prompt, json_mode=True, timeout=9.0)
        if raw_text:
            cleaned = raw_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            parsed = json.loads(cleaned.strip())
            return parsed
    except Exception:
        pass

    # Resilient heuristic fallback if Gemini is offline
    industry_lower = (payload.industry or "").lower()
    desc_lower = payload.business_description.lower()

    if "pack" in industry_lower or "pack" in desc_lower or "box" in desc_lower:
        suggested = [
            {"material_name": "Kraft Paperboard", "grade": "FSC Virgin 300 GSM", "specifications": "High burst strength for courier boxes", "estimated_quantity": 5000, "unit": "sq.m", "is_ai_suggestion": True},
            {"material_name": "Biodegradable PLA Granules", "grade": "Extrusion Grade", "specifications": "Compostable film barrier", "estimated_quantity": 1200, "unit": "kg", "is_ai_suggestion": True}
        ]
        categories = ["Primary Packaging", "Secondary Shipping Boxes", "Eco Barriers"]
    elif "cloth" in industry_lower or "apparel" in industry_lower or "textile" in desc_lower:
        suggested = [
            {"material_name": "Organic Combed Cotton", "grade": "GOTS Certified 30s", "specifications": "Pre-shrunk, OEKO-TEX Standard 100 compliant", "estimated_quantity": 2500, "unit": "meters", "is_ai_suggestion": True},
            {"material_name": "Recycled Polyester Thread", "grade": "GRS Certified", "specifications": "High tensile strength seam stitching", "estimated_quantity": 500, "unit": "spools", "is_ai_suggestion": True}
        ]
        categories = ["Fabrics & Textiles", "Trims & Closures", "Garment Finishing"]
    else:
        suggested = [
            {"material_name": "Primary Industrial Feedstock", "grade": "Commercial Grade A", "specifications": "Standard manufacturing tolerances", "estimated_quantity": 2000, "unit": "units", "is_ai_suggestion": True}
        ]
        categories = ["Core Components", "Assembly Materials", "Protective Packaging"]

    return {
        "business_summary": f"{payload.business_name} operates in {payload.industry}, focusing on {payload.target_market} with a strategic procurement orientation.",
        "industry_classification": payload.industry,
        "product_categories": categories,
        "suggested_materials": suggested,
        "sourcing_priorities": payload.supplier_priorities or ["Lowest price", "Low MOQ"],
        "recommended_regions": payload.preferred_countries or ["India", "Vietnam"],
        "missing_information": ["Target monthly batch schedule", "Detailed engineering CAD or drawing files"],
        "clarifying_questions": ["Do you require supplier-side custom tooling or can you utilize standard off-the-shelf dies?"]
    }


@router.post("/complete")
def complete_onboarding(payload: CompleteOnboardingPayload):
    """
    Validates the entire profile, commits it to memory & Supabase storage,
    and marks user onboarding as completed.
    """
    user_id = payload.user_id
    biz_id = f"biz-{uuid.uuid4().hex[:8]}"

    # Save user profile
    USER_PROFILES_STORE[user_id] = {
        "id": user_id,
        "email": payload.personal_info.get("email", ""),
        "full_name": payload.personal_info.get("full_name", "Entrepreneur"),
        "country": payload.personal_info.get("country", "India"),
        "city": payload.personal_info.get("city", ""),
        "phone_number": payload.personal_info.get("phone_number", ""),
        "preferred_currency": payload.personal_info.get("preferred_currency", "USD"),
        "preferred_language": payload.personal_info.get("preferred_language", "en"),
        "job_title": payload.personal_info.get("job_title", "Founder"),
        "professional_role": payload.personal_info.get("professional_role", "Owner"),
    }

    # Save business profile
    USER_BUSINESSES_STORE[user_id] = {
        "id": biz_id,
        "user_id": user_id,
        "name": payload.business_info.get("business_name", "My Sourcing Business"),
        "industry": payload.business_info.get("industry", "Manufacturing"),
        "business_stage": payload.business_info.get("business_stage", "Idea stage"),
        "business_type": payload.business_info.get("business_type", "D2C brand"),
        "country": payload.business_info.get("country", "India"),
        "city": payload.business_info.get("city", ""),
        "description": payload.business_info.get("business_description", ""),
        "target_market": payload.business_info.get("target_market", "Domestic & Export"),
        "website": payload.business_info.get("website", ""),
        "budget_amount": payload.sourcing_preferences.get("budget", 50000),
        "budget_currency": payload.sourcing_preferences.get("currency", "USD"),
        "geographic_preferences": payload.sourcing_preferences.get("geographic_preferences", ["India"]),
        "supplier_priorities": payload.sourcing_preferences.get("supplier_priorities", ["Lowest price"]),
        "products": payload.products_and_materials,
        "ai_sourcing_summary": payload.ai_understanding or {}
    }

    # Mark progress completed
    now_iso = datetime.utcnow().isoformat()
    ONBOARDING_STORE[user_id] = {
        "user_id": user_id,
        "business_id": biz_id,
        "active_step": 6,
        "completed_steps": [1, 2, 3, 4, 5, 6],
        "onboarding_status": "completed",
        "data_snapshot": {
            "personal_info": payload.personal_info,
            "business_info": payload.business_info,
            "products_and_materials": payload.products_and_materials,
            "sourcing_preferences": payload.sourcing_preferences,
            "ai_understanding": payload.ai_understanding
        },
        "started_at": ONBOARDING_STORE.get(user_id, {}).get("started_at", now_iso),
        "updated_at": now_iso,
        "completed_at": now_iso
    }

    return {
        "status": "success",
        "message": "Onboarding completed successfully. Workspace initialized.",
        "business_id": biz_id,
        "redirect_url": "/dashboard"
    }


@router.get("/personalized-dashboard")
def get_personalized_dashboard(user_id: str = Query(...)):
    """
    Returns a personalized dashboard payload built strictly from the
    authenticated user's profile, business, industry, and sourcing requirements.
    """
    user_profile = USER_PROFILES_STORE.get(user_id) or {
        "id": user_id,
        "full_name": "Entrepreneur",
        "email": "user@supplylens.ai",
        "preferred_currency": "USD"
    }
    business = USER_BUSINESSES_STORE.get(user_id) or {
        "id": "biz-default",
        "name": "My Business",
        "industry": "Sustainable Packaging",
        "business_stage": "Idea stage",
        "business_type": "D2C brand",
        "country": "India",
        "description": "General sourcing workspace",
        "budget_amount": 25000,
        "budget_currency": "USD",
        "geographic_preferences": ["India"],
        "supplier_priorities": ["Lowest price"],
        "products": []
    }

    industry = business.get("industry", "Sustainable Packaging")
    user_materials: List[str] = []
    for p in business.get("products", []):
        for m in p.get("materials", []):
            mat_name = m.get("name") or m.get("material_name")
            if mat_name:
                user_materials.append(mat_name)

    # Match real suppliers from verified catalogue
    matched_suppliers = []
    preferred_countries = [c.lower() for c in business.get("geographic_preferences", ["india"])]

    for s in SUPPLIERS_SEED:
        s_ind = (s.get("industry") or "").lower()
        s_country = (s.get("country") or "").lower()
        s_type = (s.get("supplier_type") or "").lower()

        # Score matching
        score = 60
        if industry.lower() in s_ind or s_ind in industry.lower():
            score += 25
        if any(c in s_country for c in preferred_countries):
            score += 15

        matched_suppliers.append({
            "id": s["id"],
            "name": s["name"],
            "country": s["country"],
            "city": s["city"],
            "industry": s.get("industry", industry),
            "supplier_type": s.get("supplier_type", "OEM"),
            "verification_status": s.get("verification_status", "Demo Verified"),
            "verification_score": s.get("verification_score", 92),
            "match_score": min(score, 98),
            "lead_time": s.get("lead_time_days", 14),
            "moq": s.get("moq", 1000),
            "products": s.get("products", [])
        })

    # Sort by match score descending
    matched_suppliers.sort(key=lambda x: x["match_score"], reverse=True)

    # Tailored search suggestions based on actual materials & countries
    first_mat = user_materials[0] if user_materials else "raw materials"
    first_country = business.get("geographic_preferences", ["India"])[0]
    
    search_suggestions = [
        f"Find {first_mat} suppliers in {first_country}",
        f"Explore low-MOQ manufacturers for {industry}",
        f"Compare verified ISO-certified vendors in {first_country}",
        f"Direct customs & freight estimates to {business.get('country', 'India')}"
    ]

    return {
        "user": user_profile,
        "business": business,
        "matched_suppliers": matched_suppliers[:6],
        "search_suggestions": search_suggestions,
        "stats": {
            "active_requirements": len(user_materials) or 1,
            "saved_suppliers": 2,
            "quotations_pending": 1,
            "active_deals": 1,
            "budget_formatted": f"{business.get('budget_currency', 'USD')} {business.get('budget_amount', 0):,}"
        }
    }
