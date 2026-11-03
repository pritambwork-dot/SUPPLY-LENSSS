"use client";

import React from "react";
import { AlternativePlan, OptimizationAlternativesResponse } from "../../types";

interface AlternativeStrategiesTableProps {
  alternatives: OptimizationAlternativesResponse;
  onSelectPlan: (planName: string, plan: AlternativePlan) => void;
  activePlanName?: string;
}

export const AlternativeStrategiesTable: React.FC<AlternativeStrategiesTableProps> = ({
  alternatives,
  onSelectPlan,
  activePlanName = "Balanced Plan",
}) => {
  if (!alternatives) return null;

  const plans = [
    { key: "cheapest", data: alternatives.cheapest_plan, icon: "💰", subtitle: "Lowest Financial Outlay" },
    { key: "balanced", data: alternatives.balanced_plan, icon: "⚖️", subtitle: "Best Trade-off (Recommended)" },
    { key: "diversified", data: alternatives.diversified_plan, icon: "🌍", subtitle: "Resilient Multi-Sourcing" },
  ];

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100 dark:border-white/10">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🎯</span> Compare 3 Canonical Sourcing Strategies
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evaluate mathematically optimal strategies side-by-side before committing your capital.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(({ key, data, icon, subtitle }) => {
          if (!data) return null;
          const isSelected = activePlanName.toLowerCase().includes(data.strategy_name.toLowerCase().split(" ")[0]);
          const isRecommended = data.strategy_name.toLowerCase().includes("balanced");

          if (data.status === "INFEASIBLE") {
            return (
              <div
                key={key}
                className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 p-5 flex flex-col justify-between opacity-80"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{icon}</span>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{data.strategy_name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">{subtitle}</p>
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
                    ⚠️ Infeasible under current constraints.
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={key}
              className={`rounded-2xl border transition-all p-5 flex flex-col justify-between relative ${
                isSelected
                  ? "border-[#0071E3] bg-[#0071E3]/5 shadow-xs ring-1 ring-[#0071E3]"
                  : "border-slate-200/80 dark:border-white/10 bg-slate-50/40 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              {isRecommended && (
                <span className="absolute -top-2.5 right-4 bg-[#0071E3] text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                  Recommended
                </span>
              )}

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{icon}</span>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{data.strategy_name}</h4>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">{subtitle}</p>

                {/* Total Cost Outlay */}
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-3.5 border border-slate-100 dark:border-white/10 mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Total Procurement Cost</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      ₹{data.total_cost.toLocaleString()}
                    </span>
                  </div>
                  {data.savings_summary && data.savings_summary.savings_amount > 0 && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block mt-1">
                      Save ₹{data.savings_summary.savings_amount.toLocaleString()} ({data.savings_summary.savings_percentage}%)
                    </span>
                  )}
                </div>

                {/* Key Metrics Rows */}
                <div className="space-y-2 text-xs border-y border-slate-100 dark:border-white/10 py-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Lead Time:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">~{data.weighted_lead_time_days} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Active Vendors:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{data.active_suppliers_count} supplier(s)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Supplier Risk:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.round(data.weighted_risk_score * 100)}%</span>
                  </div>
                </div>

                {/* Allocation Chips */}
                <div className="mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">Supplier Allocation</span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.allocations.map((a) => (
                      <span
                        key={a.supplier_id}
                        className="bg-slate-100 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-medium px-2.5 py-0.5 rounded-full"
                      >
                        {a.supplier_name.split(" ")[0]}: {a.percentage_of_total}%
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Select Button */}
              <button
                type="button"
                onClick={() => onSelectPlan(data.strategy_name, data)}
                className={`w-full py-2.5 rounded-full text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                  isSelected
                    ? "bg-[#0071E3] text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200"
                }`}
              >
                {isSelected ? "✓ Active Strategy" : "Adopt This Strategy"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
