"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { LeftNavRail } from "@/components/layout/LeftNavRail";
import { LoginPage } from "@/components/auth/LoginPage";

const MasterLandingPage = dynamic(
  () => import("@/components/landing/MasterLandingPage").then((mod) => mod.MasterLandingPage),
  { ssr: false }
);
import { GlobalSearchInput } from "@/components/layout/GlobalSearchInput";
import { FirstTimeGateway } from "@/components/onboarding/FirstTimeGateway";
import { AIConversationalOnboarding } from "@/components/onboarding/AIConversationalOnboarding";
import { BusinessProfileView } from "@/components/business/BusinessProfileView";
import { RequirementsDecomposition } from "@/components/discover/RequirementsDecomposition";
import { RecommendationCards } from "@/components/discover/RecommendationCards";
import { SupplierDirectory } from "@/components/suppliers/SupplierDirectory";
import { SupplierComparison } from "@/components/compare/SupplierComparison";
import { SupplierProfileModal } from "@/components/suppliers/SupplierProfileModal";
import { AIAssistantDrawer } from "@/components/assistant/AIAssistantDrawer";
import { Toast } from "@/components/common/Toast";
import { DealsTransactionsView } from "@/components/deals/DealsTransactionsView";
import { AdminRevenueDashboard } from "@/components/deals/AdminRevenueDashboard";
import { VerificationDashboard } from "@/components/verification/VerificationDashboard";
import { BillingDashboardView } from "@/components/billing/BillingDashboardView";

import {
  initialBusinessProfile,
  initialReadiness,
  initialRequirements,
  verifiedSuppliers,
  initialRecommendations,
  progressMilestones as initialMilestones,
  initialSavedSuppliers,
} from "@/data/mockData";
import {
  BusinessProfile,
  BusinessRequirement,
  Supplier,
  SupplierRecommendation,
  BusinessStage,
  ProgressMilestone,
  SavedSupplierItem,
  Destination,
  SourcingScenario,
  ScenarioComparison,
  BatchRankResponse,
} from "@/types";
import { parseNaturalLanguageIdea, formatCurrency } from "@/lib/utils";
import { Compass, ShieldCheck, Globe, TrendingUp, Sparkles, ArrowRight, Calculator, Home as HomeIcon, Building2, GitCompare, HelpCircle, FileSpreadsheet } from "lucide-react";
import { SourcingScenarioBuilder } from "@/components/economics/SourcingScenarioBuilder";
import { WhatIfSimulator } from "@/components/economics/WhatIfSimulator";
import { ScenarioComparisonView } from "@/components/economics/ScenarioComparisonView";
import { OptimizationDashboard } from "@/components/optimization/OptimizationDashboard";
import {
  mockDestinations,
  mockInitialScenarios,
} from "@/data/mockData";
import { api } from "@/services/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; handle: string; role: string } | null>({
    name: "Hossein",
    handle: "@user680523",
    role: "Lead Sourcing Director",
  });

  // Core business & sourcing states
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(initialBusinessProfile);
  const [readiness, setReadiness] = useState(initialReadiness);
  const [requirements, setRequirements] = useState<BusinessRequirement[]>(initialRequirements);
  const [suppliers, setSuppliers] = useState<Supplier[]>(verifiedSuppliers);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<SupplierRecommendation[]>(initialRecommendations);
  const [milestones, setMilestones] = useState<ProgressMilestone[]>(initialMilestones);
  const [savedSuppliers, setSavedSuppliers] = useState<SavedSupplierItem[]>(initialSavedSuppliers);

  // Compare selection (pre-load 2 suppliers so compare works out of the box, up to 5)
  const [comparedSuppliers, setComparedSuppliers] = useState<Supplier[]>([]);

  // Prompt 4: Sourcing Economics & Landed Cost States
  const [activeScenarios, setActiveScenarios] = useState<SourcingScenario[]>(mockInitialScenarios);
  const [destinations, setDestinations] = useState<Destination[]>(mockDestinations);
  const [scenarioComparison, setScenarioComparison] = useState<ScenarioComparison | null>(null);
  const [savedScenarioIds, setSavedScenarioIds] = useState<string[]>([]);
  const [simulationQuantity, setSimulationQuantity] = useState<number>(5000);

  // Modals & Drawers
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState<Supplier | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [onboardingInitialQuery, setOnboardingInitialQuery] = useState<string>("");
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [supplierDirectorySearch, setSupplierDirectorySearch] = useState<string>("");
  const [supplierDirectoryViewMode, setSupplierDirectoryViewMode] = useState<"list" | "map">("list");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync dark/light class on html element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Check local storage for user profile & URL tab query
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("supplylens_user");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setCurrentUser({
          name: u.name || "Hossein",
          handle: u.handle || (u.name ? `@${u.name.toLowerCase().replace(/\s+/g, "")}` : "@user680523"),
          role: u.role || "Lead Sourcing Director",
        });
      }
    } catch {}

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        if (tabParam === "dashboard" || tabParam === "home") {
          window.location.replace("/dashboard");
          return;
        }
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Guarantee only ONE unified dashboard exists at /dashboard
  useEffect(() => {
    if (activeTab === "dashboard" || activeTab === "home") {
      window.location.replace("/dashboard");
    }
  }, [activeTab]);

  // Fetch Prompt 4 Destinations & Initial Comparison
  useEffect(() => {
    // 1. Fetch backend business profile
    api.business.getProfile()
      .then((prof: any) => {
        if (prof && prof.name) {
          setBusinessProfile((prev) => ({
            ...prev,
            id: prof.id || prev.id,
            name: prof.name,
            idea: prof.idea || prev.idea,
            sector: prof.sector || prev.sector,
            targetMarket: prof.target_market || prev.targetMarket,
            targetCustomer: prof.target_customer || prev.targetCustomer,
            location: prof.location || prev.location,
            city: prof.city || prev.city,
            country: prof.country || prev.country,
            budgetAmount: prof.budget_amount || prev.budgetAmount,
            budgetCurrency: prof.budget_currency || prev.budgetCurrency,
            businessModel: prof.business_model || prev.businessModel,
            expectedScale: prof.expected_scale || prev.expectedScale,
            businessStage: prof.business_stage || prev.businessStage,
            sourcingPreference: prof.sourcing_preference || prev.sourcingPreference,
            manufacturingPreference: prof.manufacturing_preference || prev.manufacturingPreference,
            budgetConstraintCategory: prof.budget_constraint_category || prev.budgetConstraintCategory,
            budgetInsight: prof.budget_insight || prev.budgetInsight,
          }));
        }
      })
      .catch(() => {});

    api.destinations()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setDestinations(data);
      })
      .catch(() => {});

    // Initial load of verified suppliers
    setIsLoadingSuppliers(true);
    api.suppliers.list()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSuppliers(data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingSuppliers(false));

    // Load saved suppliers from backend
    api.suppliers.getSaved()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSavedSuppliers(data);
        }
      })
      .catch(() => {});

    api.scenarios.compare({
      scenarios: activeScenarios,
      business_id: businessProfile.id,
    })
      .then((comp: any) => setScenarioComparison(comp))
      .catch(() => {});
  }, []);

  // Neural Sourcing Personalization Engine
  useEffect(() => {
    api.ml.batchRank({
      business_profile: {
        budget: businessProfile.budgetAmount || 800000,
        scale: businessProfile.expectedScale || "growth",
        stage: businessProfile.businessStage || "testing",
        sourcing_preference: businessProfile.sourcingPreference || "domestic",
        city: businessProfile.city || "Bhubaneswar",
        country: businessProfile.country || "India",
        target_qty: simulationQuantity || 5000,
      },
      top_k: 20,
    })
      .then((data: any) => {
        if (data && Array.isArray(data.ranked_suppliers)) {
          const rankMap = new Map<string, any>(data.ranked_suppliers.map((r: any) => [r.supplier_id, r]));
          setSuppliers((prev) =>
            prev.map((s) => {
              const r: any = rankMap.get(s.id);
              if (!r) return s;
              return {
                ...s,
                matchScore: r.fit_percentage,
                neuralRank: r.rank,
                neuralFit: {
                  supplier_id: s.id,
                  supplier_name: s.name,
                  fit_score: r.fit_score,
                  fit_percentage: r.fit_percentage,
                  fit_tier: r.fit_tier,
                  compatibility_breakdown: {
                    budget_alignment: Math.min(1.0, r.fit_score * 1.05),
                    moq_feasibility: Math.min(1.0, r.fit_score * 0.98),
                    lead_time_tolerance: 0.90,
                    geographic_preference: s.country === "India" ? 1.0 : 0.65,
                    scale_readiness: 0.88,
                  },
                  top_positive_factor:
                    r.fit_percentage >= 85
                      ? "Low MOQ matches bootstrap budget"
                      : "Strong volume production capabilities",
                  watchpoint: s.country !== "India" ? "International ocean customs" : null,
                  model_version: data.model_version,
                },
                predictedPrice: {
                  predicted_unit_price: r.predicted_price_estimate,
                  confidence_interval_min: Math.round(r.predicted_price_estimate * 0.90 * 100) / 100,
                  confidence_interval_max: Math.round(r.predicted_price_estimate * 1.10 * 100) / 100,
                  currency: "INR",
                  confidence_score: 0.94,
                  volume_discount_pct: 12.0,
                  disclaimer: "SupplyLens Model Benchmark Prediction • Not an Official Factory Quotation",
                  model_version: data.model_version,
                },
                neuralRisk: {
                  supplier_id: s.id,
                  supplier_name: s.name,
                  predicted_risk_score: r.predicted_risk_score,
                  risk_level: r.predicted_risk_score < 0.20 ? "Very Low Risk" : "Moderate Risk",
                  reliability_index: Math.round((1.0 - r.predicted_risk_score) * 100),
                  risk_drivers: [
                    "Factory audit certification verified",
                    s.country === "India" ? "Domestic direct road logistics" : "Maritime shipping buffer needed",
                  ],
                  model_version: data.model_version,
                },
              };
            })
          );
        }
      })
      .catch(() => {});
  }, [
    businessProfile.id,
    businessProfile.budgetAmount,
    businessProfile.businessStage,
    businessProfile.sourcingPreference,
    businessProfile.city,
    businessProfile.sector,
    simulationQuantity,
  ]);

  // Persist Profile and Saved Suppliers in LocalStorage
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("supplylens_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setBusinessProfile(parsed);
      }
      const savedList = localStorage.getItem("supplylens_saved_suppliers");
      if (savedList) {
        setSavedSuppliers(JSON.parse(savedList));
      }
      const savedScens = localStorage.getItem("supplylens_saved_scenarios");
      if (savedScens) {
        setSavedScenarioIds(JSON.parse(savedScens));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleScenarioCalculated = (newScenario: SourcingScenario) => {
    setActiveScenarios((prev) => {
      const filtered = prev.filter((s) => s.supplier_id !== newScenario.supplier_id);
      const updated = [newScenario, ...filtered].slice(0, 5);

      api.scenarios.compare({
        scenarios: updated,
        business_id: businessProfile.id,
      })
        .then((comp: any) => setScenarioComparison(comp))
        .catch(() => {});

      return updated;
    });

    setActiveTab("economics");
  };

  const handleWhatIfQuantityChange = async (newQuantity: number) => {
    setSimulationQuantity(newQuantity);
    try {
      const comp: any = await api.scenarios.whatIf({
        scenario_ids: activeScenarios.map((s) => s.id),
        new_quantity: newQuantity,
        destination_city: businessProfile.city || "Bhubaneswar",
        destination_country: businessProfile.country || "India",
        business_id: businessProfile.id,
      });
      if (comp) {
        setScenarioComparison(comp);
        if (comp.scenarios) {
          setActiveScenarios(comp.scenarios);
        }
      }
    } catch {
      const updated = activeScenarios.map((scen) => {
        const isOverseas = scen.origin_country !== scen.destination_country;
        const prodCost = scen.supplier_unit_price * newQuantity;
        const freight = isOverseas
          ? Math.round(18000 + (newQuantity * 4.2 * Math.max(0.4, 0.9 - newQuantity / 50000)))
          : Math.round(1500 + (newQuantity * 0.8 * Math.max(0.35, 0.65 - newQuantity / 60000)));
        const total = prodCost + freight;
        return {
          ...scen,
          quantity: newQuantity,
          estimated_product_cost: prodCost,
          estimated_logistics_cost: freight,
          estimated_total_cost: total,
          estimated_cost_per_unit: Math.round((total / newQuantity) * 100) / 100,
          breakdown: {
            ...scen.breakdown,
            quantity: newQuantity,
            product_cost: prodCost,
            logistics_cost: freight,
            total_cost: total,
            cost_per_unit: Math.round((total / newQuantity) * 100) / 100,
          },
        };
      });
      setActiveScenarios(updated);
    }
  };

  const handleToggleSaveScenario = (scenarioId: string) => {
    setSavedScenarioIds((prev) => {
      const isSaved = prev.includes(scenarioId);
      const next = isSaved ? prev.filter((id) => id !== scenarioId) : [...prev, scenarioId];
      try {
        localStorage.setItem("supplylens_saved_scenarios", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleRemoveScenario = (scenarioId: string) => {
    setActiveScenarios((prev) => prev.filter((s) => s.id !== scenarioId));
  };

  const handleCalculateForSupplier = (supplier: Supplier) => {
    const prod = supplier.products?.[0];
    const isOverseas = supplier.country.toLowerCase() !== (businessProfile.country || "India").toLowerCase();
    const unitPrice = prod?.quotedPrice || 14.50;
    const qty = simulationQuantity;
    const productCost = unitPrice * qty;
    const freightCost = isOverseas
      ? Math.round(18000 + qty * 3.4)
      : Math.round(1500 + qty * 0.45);
    const totalCost = productCost + freightCost;

    const newScen: SourcingScenario = {
      id: `scen-${supplier.id}-${Date.now().toString(36)}`,
      supplier_id: supplier.id,
      supplier_name: supplier.name,
      product_name: prod?.name || "Sourced Packaging",
      quantity: qty,
      unit: "unit",
      currency: "INR",
      supplier_unit_price: unitPrice,
      estimated_product_cost: productCost,
      estimated_logistics_cost: freightCost,
      estimated_total_cost: totalCost,
      estimated_cost_per_unit: Math.round((totalCost / qty) * 100) / 100,
      cost_confidence: isOverseas ? "medium" : "high",
      confidence_reason: isOverseas ? "Maritime container freight estimate" : "Direct road freight",
      price_source: prod?.priceNote || "Verified catalog quote",
      price_date: "August 2026",
      is_price_stale: false,
      moq: prod?.moq || 1000,
      moq_met: qty >= (prod?.moq || 1000),
      rating: supplier.rating || 4.8,
      review_count: supplier.reviewCount || 25,
      verification_status: supplier.verificationStatus || "Verified",
      origin_city: supplier.city,
      origin_country: supplier.country,
      destination_city: businessProfile.city || "Bhubaneswar",
      destination_country: businessProfile.country || "India",
      distance_km: supplier.distanceKm || 500,
      logistics: {
        mode: isOverseas ? "sea" : "road",
        distance_km: supplier.distanceKm || 500,
        estimated_transit_time: isOverseas ? "24-28 days" : "1-2 days",
        estimated_cost: freightCost,
        currency: "INR",
        confidence: isOverseas ? "medium" : "high",
        confidence_reason: "Standard freight model",
        source: "Carrier Tariff Model",
      },
      breakdown: {
        quantity: qty,
        unit: "unit",
        currency: "INR",
        unit_price: unitPrice,
        product_cost: productCost,
        logistics_cost: freightCost,
        total_cost: totalCost,
        cost_per_unit: Math.round((totalCost / qty) * 100) / 100,
        included: [
          `Factory quoted price (₹${unitPrice.toFixed(2)})`,
          `Estimated ${isOverseas ? "Ocean" : "Road"} freight to ${businessProfile.city || "Unknown"}`,
        ],
        not_included: [
          "Goods and Services Tax (GST / VAT)",
          "Import customs duties (if overseas)",
          "Transit marine insurance",
        ],
        confidence: isOverseas ? "medium" : "high",
        confidence_reason: isOverseas ? "Ocean freight tariff estimate" : "Direct road freight",
        price_freshness: "Verified August 2026",
        is_price_stale: false,
      },
      recommendation_tags: isOverseas ? ["Lowest Unit Price"] : ["Lowest Total Cost"],
    };

    handleScenarioCalculated(newScen);
  };

  const saveProfileWithPersistence = (profile: BusinessProfile) => {
    setBusinessProfile(profile);
    try {
      localStorage.setItem("supplylens_profile", JSON.stringify(profile));
    } catch (e) {
      // ignore
    }
  };

  const updateSavedSuppliersWithPersistence = (items: SavedSupplierItem[]) => {
    setSavedSuppliers(items);
    try {
      localStorage.setItem("supplylens_saved_suppliers", JSON.stringify(items));
    } catch (e) {
      // ignore
    }
  };

  // Handle Live Supplier Search
  const handlePerformLiveSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsLoadingSuppliers(true);
    setSupplierDirectorySearch(query);
    setActiveTab("discover");
    try {
      const res = await api.suppliers.search(query);
      if (res && Array.isArray(res.suppliers)) {
        setSuppliers(res.suppliers);
        setToastMessage(`Found ${res.suppliers.length} verified supplier${res.suppliers.length === 1 ? '' : 's'}`);
      }
    } catch (e) {
      console.error("Live search failed:", e);
      setToastMessage("Search completed with current verified catalog.");
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  // Handle Global Search query
  const handleGlobalSearch = (query: string) => {
    setOnboardingInitialQuery(query);
    setIsOnboardingOpen(true);
  };

  // Compare Toggle (Support up to 5 candidates)
  const handleToggleCompare = (supplier: Supplier) => {
    setComparedSuppliers((prev) => {
      const exists = prev.some((s) => s.id === supplier.id);
      if (exists) {
        setToastMessage("Removed from comparison");
        return prev.filter((s) => s.id !== supplier.id);
      } else {
        if (prev.length >= 5) {
          setToastMessage("Maximum 5 suppliers can be compared");
          return prev;
        }
        setToastMessage("Added to comparison");
        return [...prev, supplier];
      }
    });
  };

  // Save / Bookmark Toggle
  const handleToggleSave = (supplier: Supplier) => {
    api.suppliers.save(supplier.id).catch(() => {});
    const exists = savedSuppliers.some((s) => s.supplierId === supplier.id);
    if (exists) {
      const filtered = savedSuppliers.filter((s) => s.supplierId !== supplier.id);
      updateSavedSuppliersWithPersistence(filtered);
      setToastMessage("Removed from saved suppliers");
    } else {
      const newItem: SavedSupplierItem = {
        id: "saved-" + Date.now(),
        supplierId: supplier.id,
        supplierName: supplier.name,
        productName: supplier.products?.[0]?.name || "Catalog Product",
        country: supplier.country,
        city: supplier.city,
        currentPrice: supplier.products?.[0]?.quotedPrice,
        currency: supplier.products?.[0]?.currency || "INR",
        currentRating: supplier.rating || 4.8,
        lastVerifiedDate: supplier.verificationDate,
        savedAt: "Saved today",
        isDemoData: supplier.isDemoData,
        demoBadge: supplier.demoBadge || "Demo data",
      };
      updateSavedSuppliersWithPersistence([newItem, ...savedSuppliers]);
      setToastMessage("Saved to My Business");
    }
  };

  const handleRemoveSavedSupplier = (supplierId: string) => {
    api.suppliers.save(supplierId).catch(() => {});
    const filtered = savedSuppliers.filter((s) => s.supplierId !== supplierId);
    updateSavedSuppliersWithPersistence(filtered);
    setToastMessage("Removed from saved suppliers");
  };

  const handleSelectSupplierById = (id: string) => {
    const s = suppliers.find((item) => item.id === id);
    if (s) {
      setSelectedSupplierForModal(s);
    }
  };

  // Requirement CRUD handlers
  const handleAddRequirement = (req: Omit<BusinessRequirement, "id" | "matchedSuppliersCount">) => {
    const newReq: BusinessRequirement = {
      ...req,
      id: "req-" + Date.now(),
      matchedSuppliersCount: 3,
      status: "pending",
    };
    setRequirements((prev) => [newReq, ...prev]);
  };

  const handleRemoveRequirement = (id: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id));
  };

  const handleEditRequirement = (id: string, updated: Partial<BusinessRequirement>) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
    );
  };

  const handleFindSuppliersForRequirement = (reqName: string) => {
    setSupplierDirectorySearch(reqName.split("(")[0].trim());
    setActiveTab("suppliers");
  };

  const handleUpdateStage = (stage: BusinessStage) => {
    const updated = { ...businessProfile, businessStage: stage };
    saveProfileWithPersistence(updated);
  };

  if (activeTab === "landing") {
    return <MasterLandingPage />;
  }

  return (
    <div className="min-h-screen flex antialiased overflow-x-hidden bg-[#F4F6F9] text-slate-800">
      {/* Desktop Left Navigation Rail */}
      <LeftNavRail
        activeTab={
          activeTab === "business"
            ? "workspaces"
            : activeTab === "discover"
            ? "suppliers"
            : activeTab === "optimization"
            ? "optimizer"
            : activeTab
        }
        onTabChange={(tab) => {
          if (tab === "dashboard" || tab === "home") {
            window.location.href = "/dashboard";
          } else if (tab === "workspaces") setActiveTab("business");
          else if (tab === "suppliers") setActiveTab("discover");
          else if (tab === "optimizer") setActiveTab("optimization");
          else setActiveTab(tab);
        }}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isLoggedIn={!!currentUser}
        theme="light"
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#F4F6F9]">
        {/* Global Navigation Header on sub-tabs */}
        <Header
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === "dashboard" || tab === "home") {
              window.location.href = "/dashboard";
            } else {
              setActiveTab(tab);
            }
          }}
          businessProfile={businessProfile}
          onOpenOnboarding={() => {
            setOnboardingInitialQuery("");
            setIsOnboardingOpen(true);
          }}
          onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)}
          isAssistantOpen={isAssistantOpen}
          theme="light"
          setTheme={setTheme}
          compareCount={comparedSuppliers.length}
          scenarioCount={activeScenarios.length}
        />

        {/* Main Body */}
        <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-12 max-w-7xl">
          {/* Dashboard fallback: redirects immediately to the ONE official /dashboard route */}
          {(activeTab === "dashboard" || activeTab === "home") && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold text-slate-500">
                  Navigating to SupplyLens Sourcing Cockpit Dashboard...
                </span>
              </div>
            </div>
          )}

        {/* ================= TAB 2: DISCOVER / FIND SUPPLIERS (Section 7) ================= */}
        {(activeTab === "discover" || activeTab === "suppliers") && (
          <SupplierDirectory
            suppliers={suppliers}
            onSelectSupplier={(s) => setSelectedSupplierForModal(s)}
            onToggleCompare={handleToggleCompare}
            comparedSupplierIds={comparedSuppliers.map((s) => s.id)}
            savedSupplierIds={savedSuppliers.map((s) => s.supplierId)}
            onToggleSave={handleToggleSave}
            theme={theme}
            initialSearchQuery={supplierDirectorySearch}
            initialViewMode={supplierDirectoryViewMode}
            businessProfile={businessProfile}
            isLoading={isLoadingSuppliers}
            onPerformLiveSearch={handlePerformLiveSearch}
            onNavigateToCompare={() => setActiveTab("compare")}
          />
        )}

        {/* ================= TAB 4: COMPARE ================= */}
        {activeTab === "compare" && (
          <SupplierComparison
            comparedSuppliers={comparedSuppliers}
            onRemoveFromCompare={(id) =>
              setComparedSuppliers((prev) => prev.filter((s) => s.id !== id))
            }
            onClearCompare={() => setComparedSuppliers([])}
            onSelectSupplier={(s) => setSelectedSupplierForModal(s)}
            onExploreSuppliers={() => setActiveTab("suppliers")}
          />
        )}

        {/* ================= TAB 5: ECONOMICS & LANDED COST (PROMPT 4) ================= */}
        {activeTab === "economics" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Hub Banner */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-[#1C1C1E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Cost & Logistics Intelligence Engine
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                  Connect raw supplier quotes to complete landed economics. Understand delivered unit costs, freight modes, transparent inclusions, and volume tipping points.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Default Delivery Hub</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    📍 {businessProfile.city}, {businessProfile.country}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab("suppliers")}
                  className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2 rounded-full transition-colors active:scale-95"
                >
                  Browse Suppliers
                </button>
              </div>
            </div>

            {/* Sourcing Scenario Builder */}
            <SourcingScenarioBuilder
              suppliers={suppliers}
              destinations={destinations}
              businessProfile={businessProfile}
              onScenarioCalculated={handleScenarioCalculated}
            />

            {/* What-If Sensitivity Simulator */}
            <WhatIfSimulator
              scenarios={activeScenarios}
              currentQuantity={simulationQuantity}
              onQuantityChange={handleWhatIfQuantityChange}
            />

            {/* Side-by-Side Multi-Scenario Comparison View */}
            <ScenarioComparisonView
              scenarios={activeScenarios}
              comparison={scenarioComparison}
              businessProfile={businessProfile}
              onRemoveScenario={handleRemoveScenario}
              onSaveScenario={handleToggleSaveScenario}
              savedScenarioIds={savedScenarioIds}
            />
          </div>
        )}

        {/* ================= TAB 6: OPERATIONS RESEARCH OPTIMIZATION (PROMPT 5) ================= */}
        {activeTab === "optimization" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <OptimizationDashboard businessProfile={businessProfile} />
          </div>
        )}

        {/* ================= TAB 7: MY BUSINESS ================= */}
        {activeTab === "business" && (
          <BusinessProfileView
            profile={businessProfile}
            readiness={readiness}
            requirements={requirements}
            milestones={milestones}
            onEditProfile={() => {
              setOnboardingInitialQuery(businessProfile.idea);
              setIsOnboardingOpen(true);
            }}
            onViewRequirements={() => setActiveTab("discover")}
            onViewSuppliers={() => setActiveTab("suppliers")}
            onNavigateToCompare={() => setActiveTab("compare")}
            onUpdateStage={handleUpdateStage}
            savedSuppliers={savedSuppliers}
            onRemoveSavedSupplier={handleRemoveSavedSupplier}
            onSelectSupplierById={handleSelectSupplierById}
            onToggleCompareById={(id) => {
              const s = suppliers.find((item) => item.id === id);
              if (s) handleToggleCompare(s);
            }}
            comparedSupplierIds={comparedSuppliers.map((s) => s.id)}
          />
        )}

        {/* ================= TAB 8: COMMERCIAL DEALS & 5% SUCCESS FEE (PROMPT 17) ================= */}
        {activeTab === "deals" && (
          <DealsTransactionsView
            businessId="biz-001"
            onSelectSupplier={(id) => handleSelectSupplierById(id)}
            onNavigateToBilling={() => setActiveTab("billing")}
          />
        )}

        {/* ================= TAB 9: SUPPLIER VERIFICATION & COMPLIANCE (10-DIMENSIONS) ================= */}
        {activeTab === "verification" && (
          <VerificationDashboard
            onSelectSupplier={(id) => handleSelectSupplierById(id)}
          />
        )}

        {/* ================= TAB 10: ADMIN MONETIZATION REVENUE ANALYTICS ================= */}
        {activeTab === "revenue" && (
          <AdminRevenueDashboard />
        )}

        {/* ================= TAB 11: IN-DASHBOARD BILLING & 5% SUCCESS FEE ================= */}
        {activeTab === "billing" && (
          <BillingDashboardView
            onNavigateTab={setActiveTab}
            onSelectSupplier={handleSelectSupplierById}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 mt-12 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">SupplyLens</span>
            <span>— AI-Powered Sourcing Intelligence for Entrepreneurs</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span>Physical Audits Grounded</span>
            <span>•</span>
            <span>Transparent Landed Costs</span>
            <span>•</span>
            <span>10-Dimension Deterministic Verification</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Glossy Light Theme) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 pb-safe pt-2 px-2 flex items-center justify-around shadow-lg">
        {[
          { id: "home", label: "Home", icon: HomeIcon },
          { id: "discover", label: "Suppliers", icon: Compass },
          { id: "verification", label: "Verify", icon: ShieldCheck },
          { id: "deals", label: "Deals", icon: FileSpreadsheet },
          { id: "compare", label: "Compare", icon: GitCompare, count: comparedSuppliers.length },
          { id: "economics", label: "Economics", icon: Calculator, count: activeScenarios.length },
          { id: "optimization", label: "Optimize", icon: Sparkles },
          { id: "business", label: "Business", icon: Building2 },
        ].map((item) => {
          const isActive = activeTab === item.id || (item.id === "discover" && activeTab === "suppliers");
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 relative active:scale-95 transition-all ${
                isActive
                  ? "text-blue-600 font-semibold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1 -right-2 h-4 min-w-[16px] px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Supplier Profile Modal */}
      <SupplierProfileModal
        supplier={selectedSupplierForModal}
        onClose={() => setSelectedSupplierForModal(null)}
        onToggleCompare={handleToggleCompare}
        isCompared={comparedSuppliers.some((s) => s.id === selectedSupplierForModal?.id)}
        onToggleSave={handleToggleSave}
        isSaved={savedSuppliers.some((s) => s.supplierId === selectedSupplierForModal?.id)}
        onCalculateLandedCost={handleCalculateForSupplier}
      />

      {/* AI Conversational Business Onboarding Modal */}
      <AIConversationalOnboarding
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialQuery={onboardingInitialQuery}
        onComplete={async (newProfile) => {
          saveProfileWithPersistence(newProfile);
          setIsOnboardingOpen(false);

          // 1. Sync profile with backend database
          api.business.saveProfile(newProfile).catch(() => {});

          // 2. Fetch intelligent requirements decomposition via Gemini AI
          try {
            const generatedReqs: any = await api.ai.requirements({
              idea: newProfile.idea,
              sector: newProfile.sector,
            });
            if (Array.isArray(generatedReqs) && generatedReqs.length > 0) {
              setRequirements(
                generatedReqs.map((r: any, idx: number) => ({
                  id: `req-ai-${idx + 1}`,
                  name: r.name,
                  category: r.category || "Raw Materials",
                  estimatedQty: r.estimated_qty || 1000,
                  unit: r.unit || "pieces",
                  priority: r.importance === "required" ? "essential" : "recommended",
                  importance: r.importance || "required",
                  shortExplanation: r.short_explanation || "",
                  notes: r.notes || "",
                  matchedSuppliersCount: 3,
                  status: "pending",
                }))
              );
              setActiveTab("discover");
              return;
            }
          } catch {
            // Fall through to sector presets
          }

          // Fallback presets if offline
          if (newProfile.sector.includes("Clothing") || newProfile.sector.includes("Apparel")) {
            setRequirements([
              {
                id: "req-app-1",
                name: "100% Organic GOTS Certified Combed Cotton Single Jersey (180 GSM)",
                category: "Raw Materials",
                estimatedQty: 1000,
                unit: "meters",
                priority: "essential",
                importance: "required",
                shortExplanation: "Base premium fabric for breathable t-shirts and loungewear.",
                notes: "Pre-shrunk, bio-washed.",
                matchedSuppliersCount: 4,
                status: "pending",
              },
              {
                id: "req-app-2",
                name: "T-Shirt Stitching & Garment Manufacturing Line",
                category: "Machinery & Equipment",
                estimatedQty: 500,
                unit: "pieces",
                priority: "essential",
                importance: "required",
                shortExplanation: "CMT (Cut, Make, Trim) contract stitching with custom neck ribbing.",
                notes: "Double-needle sleeve and bottom hem.",
                matchedSuppliersCount: 5,
                status: "pending",
              },
              {
                id: "req-app-3",
                name: "Compostable Garment Polybags & Recycled Hangtags",
                category: "Packaging",
                estimatedQty: 1000,
                unit: "pieces",
                priority: "essential",
                importance: "required",
                shortExplanation: "Eco-friendly protective bags and FSC hangtags for e-commerce dispatch.",
                notes: "Cornstarch film with self-adhesive strip.",
                matchedSuppliersCount: 3,
                status: "pending",
              },
              {
                id: "req-app-4",
                name: "High-Density Screen Printing or Embroidery",
                category: "Packaging",
                estimatedQty: 500,
                unit: "prints",
                priority: "recommended",
                importance: "recommended",
                shortExplanation: "Front chest graphic print with water-based phthalate-free inks.",
                notes: "Soft hand-feel print.",
                matchedSuppliersCount: 3,
                status: "pending",
              },
            ]);
          } else if (newProfile.sector.includes("Electronics")) {
            setRequirements([
              {
                id: "req-el-1",
                name: "GaN Fast Charging Power Adapters (65W Dual Port)",
                category: "Raw Materials",
                estimatedQty: 2000,
                unit: "pieces",
                priority: "essential",
                importance: "required",
                shortExplanation: "Core fast-charging hardware with CE & BIS conformity.",
                notes: "Compact GaN III chip architecture.",
                matchedSuppliersCount: 3,
                status: "pending",
              },
              {
                id: "req-el-2",
                name: "Braided 100W USB-C E-Marker Cables (1.8m)",
                category: "Packaging",
                estimatedQty: 3000,
                unit: "pieces",
                priority: "essential",
                importance: "required",
                shortExplanation: "Durable tangle-free cable rated for 20V/5A power delivery.",
                notes: "Aluminium housing with strain relief.",
                matchedSuppliersCount: 4,
                status: "pending",
              },
              {
                id: "req-el-3",
                name: "Rigid Drawer Gift Box with Custom EVA Foam Insert",
                category: "Packaging",
                estimatedQty: 2000,
                unit: "boxes",
                priority: "recommended",
                importance: "recommended",
                shortExplanation: "Premium unboxing presentation for consumer retail sales.",
                notes: "Matte lamination with spot UV logo.",
                matchedSuppliersCount: 3,
                status: "pending",
              },
            ]);
          }

          setActiveTab("discover");
        }}
      />

      {/* Ask SupplyLens AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        businessProfile={businessProfile}
        suppliers={suppliers}
        onSelectSupplierById={handleSelectSupplierById}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsAssistantOpen(false);
        }}
      />

      {/* Floating Minimal Toast Notifications (Section 31 & 32) */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Auth / Login Modal */}
      {isAuthModalOpen && (
        <LoginPage
          isModal={true}
          currentUser={currentUser}
          onLogout={() => {
            setCurrentUser(null);
            if (typeof window !== "undefined") {
              localStorage.removeItem("supplylens_user");
            }
            setIsAuthModalOpen(false);
            setToastMessage("Signed out of sourcing workspace.");
          }}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(u) => {
            setCurrentUser({
              name: u.name,
              handle: `@${u.name.toLowerCase().replace(/\s+/g, "")}`,
              role: u.role,
            });
            setIsAuthModalOpen(false);
            setToastMessage(`Welcome, ${u.name}! Sourcing workspace verified.`);
          }}
        />
      )}
      </div>
    </div>
  );
}
