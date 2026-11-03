"use client";

import React, { useState } from "react";
import { CostBreakdown, SourcingScenario } from "../../types";

interface CostBreakdownCardProps {
  scenario: SourcingScenario;
  onSave?: (scenarioId: string) => void;
  isSaved?: boolean;
}

export const CostBreakdownCard: React.FC<CostBreakdownCardProps> = ({
  scenario,
  onSave,
  isSaved = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const { breakdown, logistics } = scenario;

  // Confidence styling
  const confidenceConfig = {
    high: {
      label: "High confidence",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      icon: "check-circle",
    },
    medium: {
      label: "Medium confidence",
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      icon: "alert-triangle",
    },
    low: {
      label: "Low confidence",
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
      icon: "alert-circle",
    },
  }[scenario.cost_confidence || "medium"];

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs hover:shadow-md transition-all overflow-hidden text-slate-900 dark:text-white">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-slate-900 dark:text-white text-lg">
                {scenario.supplier_name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-white/10 px-2.5 py-0.5 rounded-full border border-slate-200/80 dark:border-white/10">
                {scenario.origin_city}, {scenario.origin_country}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              {scenario.product_name}
            </p>
          </div>

          {onSave && (
            <button
              onClick={() => onSave(scenario.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 flex items-center gap-1.5 shrink-0 ${
                isSaved
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10"
              }`}
            >
              <svg
                className={`w-3.5 h-3.5 ${isSaved ? "fill-emerald-600 dark:fill-emerald-400" : "fill-none stroke-current"}`}
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {isSaved ? "Saved" : "Save"}
            </button>
          )}
        </div>

        {/* Tags & Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {scenario.recommendation_tags?.map((tag) => (
            <span
              key={tag}
              className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                tag.includes("Cheapest Total")
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25"
                  : tag.includes("Cheapest Unit")
                  ? "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25"
                  : tag.includes("Best Overall")
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25"
                  : "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25"
              }`}
            >
              🏷️ {tag}
            </span>
          ))}

          {/* Confidence Indicator */}
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1.5 ${confidenceConfig.bg}`}
            title={breakdown.confidence_reason}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${confidenceConfig.dot}`} />
            {confidenceConfig.label}
          </span>

          {/* Price Freshness */}
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-white/5 px-2.5 py-0.5 rounded-full border border-slate-200/80 dark:border-white/10 flex items-center gap-1">
            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {breakdown.price_freshness || `Audited ${scenario.price_date || "Recent"}`}
          </span>
        </div>
      </div>

      {/* Vertical Cost Breakdown (Section 28) */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-4 divide-y divide-slate-100 dark:divide-white/10 text-xs sm:text-sm">
          <div className="flex items-center justify-between pb-3">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Product</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              ₹{breakdown.product_cost.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex flex-col">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Estimated logistics</span>
              <span className="text-[11px] text-slate-400">
                {logistics.mode === "road" ? "🚛 Direct road freight" : "🚢 Ocean maritime freight"} (~{logistics.estimated_transit_time})
              </span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              ₹{breakdown.logistics_cost.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 text-sm sm:text-base">
            <span className="font-bold text-slate-900 dark:text-white">Estimated total</span>
            <span className="font-black text-slate-900 dark:text-white text-base sm:text-lg">
              ₹{breakdown.total_cost.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Estimated per unit</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              ₹{breakdown.cost_per_unit.toFixed(2)} / {breakdown.unit}
            </span>
          </div>
        </div>

        {/* Section 28 Footnote */}
        <p className="text-[11px] text-slate-400 italic">
          Estimate — actual cost may vary based on exact shipping address and terms.
        </p>

        {/* Progressive Disclosure: Full Itemization */}
        <div className="border border-slate-100 dark:border-white/10 rounded-2xl p-4 bg-white dark:bg-white/5">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span>Cost itemization (included / not included)</span>
            <span className="text-slate-400 text-[11px]">{showDetails ? "Hide ▲" : "Show details ▼"}</span>
          </button>

          {showDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-white/10 text-xs">
              <div className="space-y-2">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  ✓ What is included
                </span>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                  {breakdown.included.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  ✕ What is not included
                </span>
                <ul className="space-y-1 text-slate-500 dark:text-slate-400">
                  {breakdown.not_included.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-slate-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
