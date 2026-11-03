"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Check, X, Sparkles, Building2, MapPin, Coins, Compass } from "lucide-react";
import { BusinessProfile, BusinessStage } from "@/types";
import { formatCurrency, classifyBudget } from "@/lib/utils";
import { api } from "@/services/api";

interface AIConversationalOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: BusinessProfile) => void;
  initialQuery?: string;
}

export const AIConversationalOnboarding: React.FC<AIConversationalOnboardingProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialQuery = "",
}) => {
  // 4 clear questions per Section 10
  const [stepIndex, setStepIndex] = useState<number>(0);

  // Form states
  const [businessType, setBusinessType] = useState(
    initialQuery ? initialQuery.replace(/^i want to (start|manufacture|import|sell)\s+/i, "") : ""
  );
  const [location, setLocation] = useState("Bhubaneswar, India");
  const [budgetAmount, setBudgetAmount] = useState<number>(800000);
  const [sourcingPreference, setSourcingPreference] = useState<"domestic" | "import" | "any">("domestic");

  useEffect(() => {
    if (initialQuery && isOpen) {
      api.ai.extract({ text: initialQuery })
        .then((extracted: any) => {
          if (extracted && !extracted.error) {
            if (extracted.sector || extracted.business_idea || extracted.name) {
              setBusinessType(extracted.sector || extracted.name || extracted.business_idea);
            }
            if (extracted.location) {
              setLocation(extracted.location);
            }
            if (extracted.budget_amount && extracted.budget_amount > 0) {
              setBudgetAmount(extracted.budget_amount);
            }
            if (extracted.sourcing_preference) {
              setSourcingPreference(extracted.sourcing_preference === "international" ? "import" : "domestic");
            }
          }
        })
        .catch(() => {});
    }
  }, [initialQuery, isOpen]);

  if (!isOpen) return null;

  const questions = [
    {
      id: "type",
      title: "What kind of business are you building?",
      subtitle: "Tell SupplyLens your product or industry concept.",
      suggestions: [
        "Sustainable eco-packaging",
        "Clothing & apparel venture",
        "Furniture manufacturing",
        "Consumer electronics accessories",
        "Food & beverage takeaway",
      ],
    },
    {
      id: "location",
      title: "Where do you want to sell?",
      subtitle: "Your target market location helps us calculate direct road freight vs port customs.",
      suggestions: [
        "Bhubaneswar, India",
        "Mumbai, India",
        "Bengaluru, India",
        "Delhi NCR, India",
        "Pan-India Online",
      ],
    },
    {
      id: "budget",
      title: "What's your starting budget?",
      subtitle: "We prioritize low MOQs so you don't commit all your capital upfront.",
      presets: [
        { label: "₹3 Lakh", amount: 300000, desc: "Testing & validation" },
        { label: "₹8 Lakh", amount: 800000, desc: "Small commercial launch" },
        { label: "₹25 Lakh", amount: 2500000, desc: "Growth-stage batch" },
        { label: "₹1 Crore+", amount: 10000000, desc: "Scaled operation" },
      ],
    },
    {
      id: "sourcing",
      title: "How do you want to source?",
      subtitle: "Select your preferred factory supply chain model.",
      options: [
        {
          id: "domestic",
          title: "Domestic suppliers in India",
          desc: "Fast 1-4 day road delivery, low MOQ risk, no customs friction",
          icon: "🇮🇳",
        },
        {
          id: "import",
          title: "Direct international import",
          desc: "Lowest factory unit price for large container batches",
          icon: "🚢",
        },
        {
          id: "any",
          title: "Cheapest suitable option anywhere",
          desc: "Let SupplyLens compare domestic vs global landed costs",
          icon: "⚖️",
        },
      ],
    },
  ];

  const currentQ = questions[stepIndex];

  const handleNext = () => {
    if (stepIndex < questions.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      // Build final BusinessProfile
      const city = location.split(",")[0].trim() || "Bhubaneswar";
      const { category, insight } = classifyBudget(budgetAmount, "INR");

      const finalProfile: BusinessProfile = {
        id: "biz-" + Date.now(),
        name: businessType ? `${businessType} Venture` : "New Business Venture",
        idea: `Starting a ${businessType || "business"} in ${city} with ${formatCurrency(budgetAmount)} capital.`,
        sector: businessType || "Sustainable Packaging",
        targetMarket: location.includes("India") ? "Domestic India" : location,
        targetCustomer: "Local business clients & direct consumers",
        location: location || "Bhubaneswar, India",
        city: city,
        country: "India",
        budgetAmount: budgetAmount,
        budgetCurrency: "INR",
        businessModel: "B2B",
        expectedScale: budgetAmount >= 2500000 ? "growth" : "pilot",
        businessStage: "testing",
        sourcingPreference: sourcingPreference === "import" ? "international" : "domestic",
        manufacturingPreference: "contract_oem",
        facilityStatus: "need_facility",
        budgetConstraintCategory: category,
        budgetInsight: insight,
        businessSnapshot: `A ${businessType} business operating in ${city}, with initial budget of ${formatCurrency(budgetAmount)}.`,
        createdAt: new Date().toISOString(),
      };

      onComplete(finalProfile);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const canProceed =
    (stepIndex === 0 && businessType.trim().length > 0) ||
    (stepIndex === 1 && location.trim().length > 0) ||
    stepIndex === 2 ||
    stepIndex === 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xl dark:border-white/10 dark:bg-[#1C1C1E] transition-all">
        {/* Top bar: Progress indicator & Close button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#0071E3]">
              Step {stepIndex + 1} of {questions.length}
            </span>
            <div className="flex gap-1 items-center">
              {questions.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === stepIndex
                      ? "w-6 bg-[#0071E3]"
                      : idx < stepIndex
                      ? "w-2 bg-emerald-500"
                      : "w-2 bg-slate-200 dark:bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Question Header */}
        <div className="space-y-1 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {currentQ.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {currentQ.subtitle}
          </p>
        </div>

        {/* Step 0: Business Type */}
        {stepIndex === 0 && (
          <div className="space-y-4">
            <input
              type="text"
              autoFocus
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              placeholder="e.g. Sustainable eco-packaging, clothing, furniture..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm sm:text-base text-slate-900 focus:border-[#0071E3] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white transition-all shadow-inner"
              onKeyDown={(e) => {
                if (e.key === "Enter" && canProceed) handleNext();
              }}
            />

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Popular suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentQ.suggestions?.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setBusinessType(item)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs transition-all ${
                      businessType === item
                        ? "border-[#0071E3] bg-[#0071E3]/10 text-[#0071E3] font-semibold"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {stepIndex === 1 && (
          <div className="space-y-4">
            <input
              type="text"
              autoFocus
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bhubaneswar, Mumbai, Delhi..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm sm:text-base text-slate-900 focus:border-[#0071E3] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white transition-all shadow-inner"
              onKeyDown={(e) => {
                if (e.key === "Enter" && canProceed) handleNext();
              }}
            />

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Suggested business hubs:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentQ.suggestions?.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs transition-all ${
                      location === loc
                        ? "border-[#0071E3] bg-[#0071E3]/10 text-[#0071E3] font-semibold"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Budget */}
        {stepIndex === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.presets?.map((preset) => {
                const isSelected = budgetAmount === preset.amount;
                return (
                  <button
                    key={preset.amount}
                    type="button"
                    onClick={() => setBudgetAmount(preset.amount)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "border-[#0071E3] bg-[#0071E3]/5 ring-1 ring-[#0071E3] shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5"
                    }`}
                  >
                    <div className="font-bold text-slate-900 dark:text-white text-base">
                      {preset.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {preset.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="text-[11px] text-slate-400 block mb-1">
                Or enter custom starting capital (₹):
              </label>
              <input
                type="number"
                step={50000}
                min={50000}
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(parseFloat(e.target.value) || 0)}
                className="w-full max-w-xs rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0071E3] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Step 3: Sourcing Preference */}
        {stepIndex === 3 && (
          <div className="space-y-3">
            {currentQ.options?.map((opt) => {
              const isSelected = sourcingPreference === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSourcingPreference(opt.id as any)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? "border-[#0071E3] bg-[#0071E3]/5 ring-1 ring-[#0071E3] shadow-xs"
                      : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5"
                  }`}
                >
                  <span className="text-2xl shrink-0 mt-0.5">{opt.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      {opt.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {opt.desc}
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-[#0071E3] shrink-0 mt-1" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="mt-8 pt-5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white px-6 py-2.5 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all"
          >
            <span>{stepIndex === questions.length - 1 ? "Find Verified Suppliers" : "Continue"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
