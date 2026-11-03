export type BusinessModel = 'B2B' | 'B2C' | 'D2C' | 'Wholesale' | 'contract_oem' | 'manufacture' | 'buy_resell' | 'unsure';
export type ExpectedScale = 'pilot' | 'growth' | 'scaled';

export type BusinessStage = 'idea' | 'testing' | 'launching' | 'growing' | 'established';

export type SourcingPreference = 'domestic' | 'international' | 'balanced';
export type ManufacturingPreference = 'contract_oem' | 'in_house' | 'buy_resell' | 'undecided';
export type FacilityStatus = 'have_facility' | 'need_facility' | 'not_sure';

export type BudgetConstraintCategory = 'low_initial_capital' | 'moderate_capital' | 'well_funded';

export interface BusinessProfile {
  id: string;
  name: string;
  idea: string;
  sector: string;
  targetMarket: string;
  targetCustomer: string;
  location: string;
  city: string;
  country: string;
  budgetAmount: number;
  budgetCurrency: string;
  businessModel: string;
  expectedScale: ExpectedScale;
  businessStage: BusinessStage;
  sourcingPreference: SourcingPreference;
  manufacturingPreference: ManufacturingPreference;
  facilityStatus?: FacilityStatus;
  budgetConstraintCategory: BudgetConstraintCategory;
  budgetInsight: string;
  businessSnapshot?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ReadinessStatus = 'ready' | 'progress' | 'attention';

export interface ReadinessPillar {
  title: string;
  status: ReadinessStatus;
  summary: string;
  tip: string;
}

export interface BusinessReadiness {
  market: ReadinessPillar;
  suppliers: ReadinessPillar;
  budget: ReadinessPillar;
  logistics: ReadinessPillar;
  competition: ReadinessPillar;
}

export type RequirementCategory =
  | 'Raw Materials'
  | 'Machinery & Equipment'
  | 'Packaging'
  | 'Logistics & Fulfillment'
  | 'Certifications & Compliance';

export type RequirementImportance = 'required' | 'recommended' | 'optional';

export interface BusinessRequirement {
  id: string;
  name: string;
  category: RequirementCategory;
  estimatedQty: number;
  unit: string;
  priority: 'essential' | 'recommended' | 'optional';
  importance: RequirementImportance;
  shortExplanation: string;
  notes: string;
  matchedSuppliersCount: number;
  status?: 'pending' | 'sourced' | 'in_review';
}

export interface VerificationEvidenceCheck {
  checkName: string;
  status: 'verified' | 'passed' | 'pending' | 'unverified';
  source: string;
  detail: string;
  checkedAt: string;
}

export interface SupplierVerificationDossier {
  verificationStatus: 'Verified' | 'Partially verified' | 'Unverified';
  verificationScore: number;
  dataConfidence: number;
  lastVerifiedDate: string;
  auditorSource: string;
  checks: VerificationEvidenceCheck[];
}

export interface SupplierProductItem {
  id: string;
  name: string;
  category: string;
  quotedPrice: number; // Ex-factory / FOB price
  quoted_price?: number;
  currency: string;
  moq: number; // Minimum Order Quantity
  moqMeaning?: string; // Plain-English interpretation
  pricePerUnitEstimate: number; // Estimated Unit Price
  estimatedLandedCost: number; // Delivered Landed Cost Estimate
  estimated_landed_cost?: number;
  unit: string;
  priceMin?: number;
  priceMax?: number;
  priceType?: 'quoted' | 'publicly_listed' | 'estimated' | 'range' | 'user_provided';
  price_type?: string;
  priceNote?: string;
  displayPrice?: string;
  specMatchScore?: number; // 0 - 100%
}

export interface SupplierReview {
  id: string;
  author: string;
  company: string;
  rating: number;
  date: string;
  comment: string;
  verifiedBuyer: boolean;
}

export type SupplierType = 'OEM' | 'Contract Manufacturer' | 'Distributor' | 'Raw Material Producer';

export interface Supplier {
  id: string;
  name: string;
  legalName: string;
  legal_name?: string;
  displayName?: string;
  description?: string;
  country: string;
  countryCode: string;
  city: string;
  state: string;
  address: string;
  supplierType: SupplierType;
  verified: boolean;
  verificationStatus: 'Verified' | 'Partially verified' | 'Unverified';
  verification_status?: string;
  verificationScore: number;
  verification_score?: number;
  dataConfidence: number;
  data_confidence?: number;
  verificationBadge: string;
  verificationDate: string;
  verification_date?: string;
  isDemoData: boolean;
  demoBadge: string;
  dataSource: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  ratingSource?: string;
  establishedYear: number;
  employeeRange?: string;
  website: string;
  publicPhone: string;
  public_phone?: string;
  publicEmail?: string | null;
  public_email?: string | null;
  hasVerifiedEmail?: boolean;
  emailFallbackMessage?: string | null;
  certifications: string[];
  capabilities?: string[];
  leadTimeDays: number;
  distanceKm: number;
  estimatedTransitDays: number;
  products: SupplierProductItem[];
  reviews: SupplierReview[];
  verificationDossier?: SupplierVerificationDossier;
  verification_dossier?: any;
  matchScore?: number;
  match_score?: number;
  matchReason?: string;
  match_reason?: string;
  neuralFit?: FitPredictionResponse;
  neuralRisk?: RiskPredictionResponse;
  predictedPrice?: PricePredictionResponse;
  neuralRank?: number;
  overallScore?: number;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  moq?: number;
  businessMatchScore?: number;
  riskScore?: string;
}

export type RecommendationType =
  | 'best_overall'
  | 'cheapest'
  | 'highest_rated'
  | 'fastest'
  | 'cheapest_suitable'
  | 'best_rated'
  | 'starting_small';

export interface SupplierRecommendation {
  type: RecommendationType;
  title: string;
  supplierId: string;
  supplierName: string;
  rationale: string;
  highlightBadge: string;
  badgeColor: string;
  metrics: {
    quotedPrice: string;
    landedCost: string;
    moq: string;
    leadTime: string;
    rating: string;
  };
  score?: number;
  reason?: string;
  matchReasons?: string[];
  riskAssessment?: string;
  projectedSavingsPercent?: number;
  rank?: number;
}

export interface SavedSupplierItem {
  id?: string;
  supplierId: string;
  supplierName?: string;
  productName?: string;
  country?: string;
  city?: string;
  currentPrice?: number;
  currency?: string;
  currentRating?: number;
  lastVerifiedDate?: string;
  savedAt: string;
  isDemoData?: boolean;
  demoBadge?: string;
  notes?: string;
  status?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string }[];
  referencedSupplierIds?: string[];
}

export interface ProgressMilestone {
  key: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  description: string;
}

// ================= PROMPT 4: SOURCING ECONOMICS & LANDED COST TYPES =================

export interface Destination {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  country_code: string;
  postal_code: string;
  lat: number;
  lng: number;
  is_default?: boolean;
}

export interface CurrencyConversion {
  original_price: number;
  original_currency: string;
  converted_price_inr: number;
  exchange_rate: number;
  display_text: string;
}

export interface CostBreakdown {
  quantity: number;
  unit: string;
  currency: string;
  unit_price: number;
  product_cost: number;
  logistics_cost: number;
  total_cost: number;
  cost_per_unit: number;
  included: string[];
  not_included: string[];
  confidence: 'high' | 'medium' | 'low';
  confidence_reason: string;
  price_freshness: string;
  is_price_stale: boolean;
  currency_conversion?: CurrencyConversion;
}

export interface LogisticsDetails {
  mode: string;
  distance_km: number;
  estimated_transit_time: string;
  estimated_cost: number;
  currency: string;
  confidence: string;
  confidence_reason: string;
  source: string;
}

export interface SourcingScenario {
  id: string;
  supplier_id: string;
  supplier_name: string;
  product_name: string;
  quantity: number;
  unit?: string;
  currency: string;
  supplier_unit_price: number;
  estimated_product_cost: number;
  estimated_logistics_cost: number;
  estimated_total_cost: number;
  estimated_cost_per_unit: number;
  cost_confidence: 'high' | 'medium' | 'low';
  confidence_reason: string;
  price_source?: string;
  price_date?: string;
  is_price_stale?: boolean;
  moq: number;
  moq_met: boolean;
  rating: number;
  review_count?: number;
  verification_status?: string;
  origin_city: string;
  origin_country: string;
  origin_lat?: number;
  origin_lng?: number;
  destination_city: string;
  destination_country: string;
  destination_lat?: number;
  destination_lng?: number;
  distance_km?: number;
  logistics: LogisticsDetails;
  breakdown: CostBreakdown;
  scenario_status?: 'active' | 'saved';
  recommendation_tags?: string[];
  currency_conversion?: CurrencyConversion;
}

export interface SourcingPlanStep {
  step_number: number;
  title: string;
  description: string;
  action_type: string;
}

export interface ScenarioComparison {
  scenarios: SourcingScenario[];
  cheapest_unit_price_scenario_id: string;
  cheapest_total_cost_scenario_id: string;
  best_overall_scenario_id: string;
  best_starting_small_scenario_id?: string;
  ai_explanation: string;
  sourcing_plan: SourcingPlanStep[];
  what_if_insights: string[];
}

// -------------------------------------------------------------
// Operations Research Optimization Engine Types (Prompt 5)
// -------------------------------------------------------------

export interface OptimizationRequest {
  required_quantity: number;
  budget_limit?: number | null;
  objective_type?: 'cost' | 'balanced' | 'risk' | 'logistics' | 'diversified';
  max_suppliers?: number;
  max_supplier_share?: number;
  max_country_share?: number;
  preferred_countries?: string[];
  excluded_countries?: string[];
  supplier_ids?: string[];
  product_category?: string;
  business_id?: string;
  neural_assisted?: boolean;
}

export interface OptimizationAllocationItem {
  supplier_id: string;
  supplier_name: string;
  country: string;
  quantity: number;
  percentage_of_total: number;
  unit_price: number;
  total_cost: number;
  moq: number;
  lead_time_days: number;
  risk_score: number;
  verification_score: number;
  rating: number;
}

export interface SavingsSummary {
  baseline_type?: string;
  baseline_supplier_name?: string;
  baseline_cost?: number;
  savings_amount: number;
  savings_percentage: number;
  lead_time_delta_days?: number;
  risk_score_delta?: number;
}

export interface ConstraintAuditItem {
  constraint_type: string;
  constraint_value: string;
  actual_value: string;
  status: 'satisfied' | 'violated';
  slack?: number;
}

export interface InfeasibilityDiagnostics {
  is_feasible: boolean;
  root_causes: string[];
  actionable_remedies: string[];
}

export interface SolverMetadata {
  solver: string;
  runtime_ms: number;
  solver_status: string;
  iterations?: number;
  optimality_gap?: number;
  model_version: string;
}

export interface OptimizationResultResponse {
  run_id: string;
  business_id?: string;
  status: 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE';
  is_feasible: boolean;
  objective_type: string;
  total_cost: number;
  weighted_lead_time_days: number;
  weighted_risk_score: number;
  diversification_score: number;
  allocations: OptimizationAllocationItem[];
  savings_summary: SavingsSummary;
  constraints_audit: ConstraintAuditItem[];
  infeasibility_diagnostics?: InfeasibilityDiagnostics | null;
  solver_metadata: SolverMetadata;
}

export interface AlternativePlan {
  strategy_name: string;
  status: 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE';
  total_cost: number;
  weighted_lead_time_days: number;
  weighted_risk_score: number;
  diversification_score: number;
  active_suppliers_count: number;
  allocations: OptimizationAllocationItem[];
  savings_summary: SavingsSummary;
  constraints_audit?: ConstraintAuditItem[];
  solver_metadata?: SolverMetadata;
  infeasibility_reasons?: string[];
  actionable_remedies?: string[];
}

export interface OptimizationAlternativesResponse {
  recommended_strategy: string;
  cheapest_plan: AlternativePlan;
  balanced_plan: AlternativePlan;
  diversified_plan: AlternativePlan;
}

export interface OptimizationCommandResponse {
  action_type: string;
  explanation: string;
  current_request: OptimizationRequest;
  updated_request: OptimizationRequest;
}

// =============================================================
// Machine Learning & Neural Sourcing Types
// =============================================================

export interface FitPredictionResponse {
  supplier_id: string;
  supplier_name: string;
  fit_score: number;
  fit_percentage: number;
  fit_tier: 'Exceptional Match' | 'Strong Fit' | 'Moderate Match' | 'Marginal / High Disruption Risk' | string;
  compatibility_breakdown: Record<string, number>;
  top_positive_factor: string;
  watchpoint?: string | null;
  model_version: string;
}

export interface PricePredictionResponse {
  predicted_unit_price: number;
  confidence_interval_min: number;
  confidence_interval_max: number;
  currency: string;
  confidence_score: number;
  volume_discount_pct: number;
  disclaimer: string;
  model_version: string;
}

export interface RiskPredictionResponse {
  supplier_id: string;
  supplier_name: string;
  predicted_risk_score: number;
  risk_level: 'Very Low Risk' | 'Low Risk' | 'Moderate Risk' | 'Elevated Disruption Risk' | string;
  reliability_index: number;
  risk_drivers: string[];
  model_version: string;
}

export interface BatchRankItem {
  rank: number;
  supplier_id: string;
  supplier_name: string;
  country: string;
  fit_score: number;
  fit_percentage: number;
  fit_tier: string;
  predicted_risk_score: number;
  predicted_price_estimate: number;
  actual_quoted_price: number;
}

export interface BatchRankResponse {
  ranked_suppliers: BatchRankItem[];
  total_evaluated: number;
  model_version: string;
  execution_time_ms: number;
}

export interface ModelMetadataItem {
  model_id: string;
  name: string;
  version: string;
  architecture: string;
  status: string;
  metrics: Record<string, any>;
  trained_at: string;
}

// Monetization & Deals Interfaces
export interface TenderItem {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  product_category: string;
  required_quantity: number;
  unit: string;
  estimated_budget: number;
  currency: string;
  status: 'draft' | 'published' | 'evaluating' | 'awarded' | 'closed' | 'cancelled';
  submission_date?: string;
  closing_date?: string;
  selected_supplier_id?: string;
  created_at: string;
}

export interface DealDocumentItem {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size_bytes?: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

export interface DealEventItem {
  id: string;
  event_type: string;
  from_status?: string;
  to_status?: string;
  actor_role: string;
  description: string;
  created_at: string;
}

export interface ServiceFeeAssessmentItem {
  id?: string;
  policy_version?: string;
  fee_base_amount: number;
  fee_percentage: number;
  calculated_fee: number;
  tax_rate?: number;
  tax_amount: number;
  total_fee_due: number;
  currency: string;
  due_date?: string;
  fee_status: string;
}

export interface InvoiceItem {
  id: string;
  invoice_number: string;
  deal_id?: string;
  customer_name?: string;
  subtotal: number;
  base_fee_amount?: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: 'issued' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  issued_date?: string;
  issue_date?: string;
  due_date?: string;
  paid_at?: string;
  pdf_url?: string;
}

export interface SourcingDealItem {
  id: string;
  business_id: string;
  supplier_id: string;
  supplier_name?: string;
  tender_id?: string;
  title: string;
  confirmed_deal_value: number;
  currency: string;
  contract_reference: string;
  status: string;
  verification_status: string;
  fee_trigger_active: boolean;
  confirmation_date?: string;
  created_at: string;
  assessment?: ServiceFeeAssessmentItem;
  invoice?: InvoiceItem;
  events?: DealEventItem[];
  documents?: DealDocumentItem[];
  dispute_reason?: string;
  notes?: string;
}

export interface RevenueAnalyticsItem {
  currency: string;
  monetization_rate_pct: number;
  total_tenders: number;
  awarded_tenders: number;
  total_deals_count: number;
  confirmed_deals_count: number;
  total_contract_gmv: number;
  average_deal_size: number;
  total_assessed_fee: number;
  total_tax_assessed: number;
  total_gross_assessed: number;
  total_collected: number;
  outstanding_receivables: number;
  overdue_receivables: number;
  collection_rate_pct: number;
  total_invoices_count: number;
  status_breakdown: Array<{
    status: string;
    count: number;
    total_value: number;
  }>;
}

// ================= CUSTOMER PORTAL & RFQ TYPES =================

export interface CustomerActivityItem {
  id: string;
  business_id: string;
  user_id?: string;
  activity_type: 'search' | 'profile_view' | 'save_vendor' | 'remove_vendor' | 'compare' | 'quotation_request' | 'deal_update' | 'invoice_created' | 'payment_completed';
  title: string;
  description?: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface QuotationRequestItem {
  id: string;
  business_id: string;
  user_id?: string;
  supplier_id: string;
  supplier_name: string;
  product_name: string;
  product_category: string;
  required_quantity: number;
  unit: string;
  target_budget?: number;
  currency: string;
  specifications?: string;
  delivery_terms?: string;
  destination_city?: string;
  destination_country?: string;
  required_certifications?: string[];
  status: 'submitted' | 'under_review' | 'quoted' | 'accepted' | 'declined' | 'expired';
  quoted_unit_price?: number;
  quoted_moq?: number;
  quoted_lead_time_days?: number;
  quotation_valid_until?: string;
  vendor_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerDashboardMetrics {
  customer_name: string;
  business_name: string;
  business_id: string;
  industry: string;
  profile_completion_pct: number;
  active_searches_count: number;
  saved_vendors_count: number;
  new_search_results_count: number;
  pending_quotations_count: number;
  total_quotations_count: number;
  active_scenarios_count: number;
  confirmed_deals_count: number;
  outstanding_invoices_count: number;
  recent_activities: CustomerActivityItem[];
  budget_summary: {
    amount: number;
    currency: string;
  };
}



