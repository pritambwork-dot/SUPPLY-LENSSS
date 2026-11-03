"""
SupplyLens Pydantic Schemas for API Serialization & Validation
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field



class BusinessProfileBase(BaseModel):
    name: str
    idea: str
    sector: str
    target_market: str
    location: str
    budget_amount: float
    budget_currency: str = "INR"
    business_model: str = "contract_oem"
    expected_scale: str = "pilot"


class BusinessProfileCreate(BusinessProfileBase):
    pass


class BusinessProfileResponse(BusinessProfileBase):
    id: str
    created_at: str


class RequirementItem(BaseModel):
    id: Optional[str] = None
    name: str
    category: str
    estimated_qty: float
    unit: str = "pieces"
    priority: str = "essential"
    notes: Optional[str] = ""


class VerificationEvidenceCheck(BaseModel):
    check_name: str  # e.g., "Company identity", "Website identity", "Physical location", "Product catalog", "Public contact"
    status: str  # "verified", "passed", "pending"
    source: str  # e.g., "MCA Corporate Registry", "On-site Audit", "Google Business Profile"
    detail: str  # e.g., "CIN U25209PN2018PTC176543 verified active"
    checked_at: str


class SupplierVerificationDossier(BaseModel):
    verification_status: str = "Verified"  # Verified, Partially verified, Unverified
    verification_score: int = 94  # 0 to 100
    data_confidence: int = 92  # 0 to 100%
    last_verified_date: str
    auditor_source: str
    checks: List[VerificationEvidenceCheck] = []


class SupplierContactSchema(BaseModel):
    contact_type: str  # phone, email, website, address
    value: str
    source: str
    is_public: bool = True
    is_verified: bool = True
    display_label: Optional[str] = None


class SupplierProductSchema(BaseModel):
    id: str
    name: str
    category: str
    quoted_price: float
    currency: str = "INR"
    moq: int
    moq_meaning: Optional[str] = "Good for starting small"
    price_per_unit_estimate: float
    estimated_landed_cost: float
    unit: str = "piece"
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    price_type: str = "estimated"  # quoted, publicly_listed, estimated, range, user_provided
    price_note: Optional[str] = "Publicly listed estimate"
    spec_match_score: Optional[int] = 95


class SupplierSchema(BaseModel):
    id: str
    name: str
    legal_name: str
    display_name: Optional[str] = None
    description: Optional[str] = None
    country: str
    country_code: str
    city: str
    state: Optional[str] = None
    address: str
    supplier_type: str
    verified: bool = True
    verification_status: str = "Verified"  # Verified, Partially verified, Unverified
    verification_score: int = 92
    data_confidence: int = 90
    verification_badge: str = "SupplyLens Verified"
    verification_date: str = "August 2026"
    data_source: str
    lat: float
    lng: float
    rating: float
    review_count: int
    rating_source: str = "Public Business Registry & Audits"
    established_year: int
    employee_range: Optional[str] = "50-150 employees"
    website: str
    public_phone: str
    public_email: Optional[str] = None  # None indicates "No verified public email found"
    certifications: List[str] = []
    lead_time_days: int = 7
    distance_km: int = 500
    estimated_transit_days: int = 2
    products: List[SupplierProductSchema] = []
    verification_dossier: Optional[SupplierVerificationDossier] = None
    match_score: Optional[int] = 90
    match_reason: Optional[str] = "Good fit for your business requirements"


class StructuredSearchIntent(BaseModel):
    original_query: str
    product: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    supplier_type: Optional[str] = None
    max_moq: Optional[int] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None
    verified_only: bool = True
    priority: Optional[str] = "balanced"  # price, moq, quality, proximity, balanced


class NaturalSearchRequest(BaseModel):
    query: str
    business_id: Optional[str] = None
    business_profile: Optional[Dict[str, Any]] = None


class RecommendationSchema(BaseModel):
    type: str  # best_overall, cheapest_suitable, best_rated, starting_small
    title: str
    supplier_id: str
    supplier_name: str
    rationale: str
    highlight_badge: str
    badge_color: str
    metrics: Dict[str, str]


class ThreeRecommendationsResponse(BaseModel):
    best_overall: Optional[RecommendationSchema] = None
    cheapest_suitable: Optional[RecommendationSchema] = None
    best_rated: Optional[RecommendationSchema] = None
    starting_small: Optional[RecommendationSchema] = None
    profile_summary: Optional[str] = None


class SupplierComparisonRequest(BaseModel):
    supplier_ids: List[str]
    business_profile: Optional[Dict[str, Any]] = None


class SupplierComparisonResponse(BaseModel):
    suppliers: List[SupplierSchema]
    ai_summary: List[str]
    cheapest_id: Optional[str] = None
    best_rated_id: Optional[str] = None
    best_match_id: Optional[str] = None


class SavedSupplierCreate(BaseModel):
    supplier_id: str
    business_id: Optional[str] = "biz-001"
    product_name: Optional[str] = None
    notes: Optional[str] = ""


class SavedSupplierResponse(BaseModel):
    id: str
    supplier_id: str
    supplier_name: str
    product_name: Optional[str] = None
    country: str
    city: str
    current_price: Optional[float] = None
    currency: str = "INR"
    current_rating: float = 4.5
    last_verified_date: str
    saved_at: str


class ChatQueryRequest(BaseModel):
    query: str
    business_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class ChatQueryResponse(BaseModel):
    reply: str
    suggested_actions: List[Dict[str, str]]
    referenced_supplier_ids: List[str]


class OptimizationRequest(BaseModel):
    budget: float
    requirements: List[Dict[str, Any]]
    max_suppliers: int = 3
    currency: str = "INR"


class OptimizationResponse(BaseModel):
    status: str
    total_landed_cost: float
    budget_utilized_percent: float
    allocations: List[Dict[str, Any]]
    explanation: str


# ==========================================
# PROMPT 4: SOURCING SCENARIO & ECONOMICS
# ==========================================

class DestinationBase(BaseModel):
    name: str
    country: str = "India"
    state: str = "Odisha"
    city: str = "Bhubaneswar"
    address: str = "Industrial Estate, Bhubaneswar, Odisha 751010"
    latitude: float = 20.2961
    longitude: float = 85.8245
    destination_type: str = "Business"  # Business, Warehouse, Store, Port, Market, Other


class DestinationCreate(DestinationBase):
    business_id: Optional[str] = None


class DestinationResponse(DestinationBase):
    id: str
    created_at: Optional[str] = None


class LogisticsEstimateSchema(BaseModel):
    id: Optional[str] = None
    mode: str = "road"  # road, sea, air, multimodal
    distance_km: float
    estimated_transit_time: str
    estimated_cost: float
    currency: str = "INR"
    confidence: str = "medium"  # high, medium, low
    confidence_reason: str = "Based on road distance and standard carrier freight tariffs"
    source: str = "Distance model & indicative freight tariffs"


class CostBreakdownSchema(BaseModel):
    quantity: int
    unit: str = "piece"
    currency: str = "INR"
    unit_price: float
    product_cost: float
    logistics_cost: float
    total_cost: float
    cost_per_unit: float
    included: List[str] = ["Supplier ex-factory quoted price", "Estimated logistics freight to destination"]
    not_included: List[str] = ["Taxes (GST/VAT)", "Customs duty & tariffs", "Cargo insurance", "Port handling / demurrage"]
    confidence: str = "medium"
    confidence_reason: str
    price_freshness: str
    is_price_stale: bool = False
    currency_conversion: Optional[Dict[str, Any]] = None


class ScenarioCalculateRequest(BaseModel):
    supplier_id: str
    product_name: Optional[str] = None
    quantity: int = 1000
    destination_city: str = "Bhubaneswar"
    destination_country: str = "India"
    destination_type: str = "Business"
    business_profile: Optional[Dict[str, Any]] = None


class SourcingScenarioResponse(BaseModel):
    id: str
    supplier_id: str
    supplier_name: str
    product_name: str
    quantity: int
    origin_city: str
    origin_country: str
    origin_lat: float
    origin_lng: float
    destination_city: str
    destination_country: str
    destination_lat: float
    destination_lng: float
    currency: str = "INR"
    supplier_unit_price: float
    estimated_product_cost: float
    estimated_logistics_cost: float
    estimated_total_cost: float
    estimated_cost_per_unit: float
    cost_confidence: str = "medium"
    confidence_reason: str
    price_source: str = "Publicly listed price"
    price_date: str = "Recently verified"
    is_price_stale: bool = False
    moq: int = 1000
    moq_met: bool = True
    rating: float = 4.5
    verification_status: str = "Verified"
    logistics: LogisticsEstimateSchema
    breakdown: CostBreakdownSchema
    scenario_status: str = "active"
    created_at: str


class SourcingScenarioCreate(BaseModel):
    supplier_id: str
    supplier_name: str
    product_name: str
    quantity: int
    destination_city: str = "Bhubaneswar"
    destination_country: str = "India"
    destination_type: str = "Business"
    business_id: Optional[str] = None


class WhatIfSimulationRequest(BaseModel):
    scenario_ids: List[str]
    new_quantity: int
    destination_city: Optional[str] = "Bhubaneswar"
    destination_country: Optional[str] = "India"


class SourcingPlanStep(BaseModel):
    step_number: int
    title: str
    description: str
    action_type: str  # quote_request, sample, moq_check, incoterms, contracting, pilot_order


class ScenarioComparisonResponse(BaseModel):
    scenarios: List[SourcingScenarioResponse]
    cheapest_unit_price_scenario_id: str
    cheapest_total_cost_scenario_id: str
    best_overall_scenario_id: str
    best_starting_small_scenario_id: Optional[str] = None
    ai_explanation: str
    sourcing_plan: List[SourcingPlanStep]
    what_if_insights: List[str]


class SourcingQuestionRequest(BaseModel):
    question: str
    scenarios: List[Dict[str, Any]]
    business_profile: Optional[Dict[str, Any]] = None


class SourcingQuestionResponse(BaseModel):
    answer: str
    relevant_scenario_ids: List[str] = []


# ================= PROMPT 5: OPERATIONS RESEARCH OPTIMIZATION SCHEMAS =================

class OptimizationRequestSchema(BaseModel):
    required_quantity: int = 20000
    budget: float = 1000000.0
    priority: str = "min_cost"  # min_cost, balanced, diversified, min_risk, min_logistics
    max_suppliers: Optional[int] = None
    max_supplier_share: Optional[float] = None  # e.g. 0.50 (50%)
    max_country_share: Optional[float] = None  # e.g. 0.60 (60%)
    preferred_countries: Optional[List[str]] = None
    excluded_countries: Optional[List[str]] = None
    supplier_ids: Optional[List[str]] = None
    product_name: Optional[str] = None
    business_id: Optional[str] = "biz-001"
    business_profile: Optional[Dict[str, Any]] = None
    custom_weights: Optional[Dict[str, float]] = None


class OptimizationAllocationItem(BaseModel):
    supplier_id: str
    supplier_name: str
    city: str
    country: str
    quantity: float
    unit: str = "units"
    unit_price: float
    supplier_cost: float
    percentage_of_total: float
    moq: int
    capacity: float
    rating: float
    distance_km: Optional[float] = None


class ConstraintAuditItem(BaseModel):
    constraint_type: str
    description: str
    target_value: Any
    achieved_value: Any
    status: str  # SATISFIED, VIOLATED, TIGHT


class InfeasibilityDiagnostics(BaseModel):
    reason: str
    primary_bottleneck: str  # capacity, budget, moq, supplier_limit, country_filter
    verified_capacity_available: float
    required_quantity: float
    minimum_budget_required: float
    available_budget: float
    actionable_remedies: List[str]


class OptimizationResultResponse(BaseModel):
    run_id: str
    status: str  # OPTIMAL, FEASIBLE, INFEASIBLE
    objective_type: str
    required_quantity: float
    total_allocated_quantity: float
    available_budget: float
    total_cost: float
    average_unit_cost: float
    suppliers_used_count: int
    allocations: List[OptimizationAllocationItem]
    constraints_audit: List[ConstraintAuditItem]
    diversification_rating: str  # High, Medium, Low
    estimated_savings_vs_single: Optional[Dict[str, Any]] = None
    solver_metadata: Dict[str, Any]
    ai_explanation: Optional[str] = None
    infeasibility_diagnostics: Optional[InfeasibilityDiagnostics] = None


class OptimizationAlternativesResponse(BaseModel):
    cheapest: OptimizationResultResponse
    balanced: OptimizationResultResponse
    diversified: OptimizationResultResponse
    comparison_table: List[Dict[str, Any]]
    recommendation_rationale: str


class OptimizationCommandRequest(BaseModel):
    command: str
    current_request: OptimizationRequestSchema
    business_profile: Optional[Dict[str, Any]] = None


class OptimizationCommandResponse(BaseModel):
    interpreted_intent: str
    updated_request: OptimizationRequestSchema
    explanation: str


# =============================================================
# Machine Learning & Neural Sourcing Schemas
# =============================================================

class FitPredictionRequest(BaseModel):
    business_profile: Dict[str, Any]
    supplier_id: str
    product_id: Optional[str] = None


class FitPredictionResponse(BaseModel):
    supplier_id: str
    supplier_name: str
    fit_score: float
    fit_percentage: int
    fit_tier: str
    compatibility_breakdown: Dict[str, float]
    top_positive_factor: str
    watchpoint: Optional[str] = None
    model_version: str


class PricePredictionRequest(BaseModel):
    product_name: str
    category: str
    country: str
    order_quantity: int
    supplier_type: Optional[str] = "OEM"


class PricePredictionResponse(BaseModel):
    predicted_unit_price: float
    confidence_interval_min: float
    confidence_interval_max: float
    currency: str = "INR"
    confidence_score: float
    volume_discount_pct: float
    disclaimer: str
    model_version: str


class RiskPredictionRequest(BaseModel):
    supplier_id: str
    supplier_data: Optional[Dict[str, Any]] = None


class RiskPredictionResponse(BaseModel):
    supplier_id: str
    supplier_name: str
    predicted_risk_score: float
    risk_level: str
    reliability_index: float
    risk_drivers: List[str]
    model_version: str


class BatchRankRequest(BaseModel):
    business_profile: Dict[str, Any]
    candidate_supplier_ids: Optional[List[str]] = None
    top_k: int = 10


class BatchRankItem(BaseModel):
    rank: int
    supplier_id: str
    supplier_name: str
    country: str
    fit_score: float
    fit_percentage: int
    fit_tier: str
    predicted_risk_score: float
    predicted_price_estimate: float
    actual_quoted_price: float


class BatchRankResponse(BaseModel):
    ranked_suppliers: List[BatchRankItem]
    total_evaluated: int
    model_version: str
    execution_time_ms: float



