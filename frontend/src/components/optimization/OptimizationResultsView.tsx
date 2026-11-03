"use client";

import React, { useState } from "react";
import {
  OptimizationResultResponse,
  OptimizationAlternativesResponse,
  AlternativePlan,
  BusinessProfile,
} from "../../types";
import { AllocationVisualizer } from "./AllocationVisualizer";
import { AlternativeStrategiesTable } from "./AlternativeStrategiesTable";

interface OptimizationResultsViewProps {
  result: OptimizationResultResponse;
  alternatives?: OptimizationAlternativesResponse | null;
  businessProfile?: BusinessProfile | null;
  onAdoptStrategy: (strategyName: string, plan: AlternativePlan) => void;
  explanation?: string | null;
}

export const OptimizationResultsView: React.FC<OptimizationResultsViewProps> = ({
  result,
  alternatives,
  businessProfile,
  onAdoptStrategy,
  explanation,
}) => {
  const [showTechnicalDrawer, setShowTechnicalDrawer] = useState<boolean>(false);

  const {
    total_cost,
    weighted_lead_time_days,
    weighted_risk_score,
    allocations,
    savings_summary,
    solver_metadata,
    constraints_audit,
  } = result;

  const totalUnits = allocations.reduce((sum, a) => sum + a.quantity, 0);

  return (
    <div className="space-y-6">
      {/* 1. Recommended Sourcing Plan Executive Card */}
      <div className="bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 dark:border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Optimal Plan Found
              </span>
              <span className="text-slate-300 dark:text-slate-600 text-xs">•</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs capitalize">
                {result.objective_type} Strategy
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Recommended Sourcing Plan
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Order distributed across <strong className="text-slate-900 dark:text-white font-semibold">{allocations.length} verified supplier(s)</strong> to maximize cost savings while preventing factory bottlenecks.
            </p>
          </div>

          {/* Quick Metrics Outlay */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10 min-w-[150px]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Total Estimated Cost</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                ₹{total_cost.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                ₹{(total_cost / (totalUnits || 1)).toFixed(2)}/unit delivered
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10 min-w-[130px]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Avg Lead Time</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                ~{weighted_lead_time_days}d
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Order to door
              </span>
            </div>
          </div>
        </div>

        {/* Clear Sourcing Allocations Breakdown */}
        <div className="space-y-2 mt-6 pt-5 border-t border-slate-100 dark:border-white/10">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Supplier Order Distribution:
          </span>
          {allocations.map((a) => (
            <div
              key={a.supplier_id}
              className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm py-2 px-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 gap-1"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-white">{a.supplier_name}:</span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {a.quantity.toLocaleString()} units ({a.percentage_of_total}%)
                </span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                ₹{a.total_cost.toLocaleString()} total
              </span>
            </div>
          ))}
        </div>

        {/* Savings vs Single Supplier Ribbon */}
        {savings_summary && savings_summary.savings_amount > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              <div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">
                  Savings vs single supplier: ₹{savings_summary.savings_amount.toLocaleString()} ({savings_summary.savings_percentage}%)
                </span>
                <span className="text-[11px] text-slate-400">
                  Compared to ordering 100% from {savings_summary.baseline_supplier_name || "single vendor"} (₹{savings_summary.baseline_cost?.toLocaleString()})
                </span>
              </div>
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
              ✓ Multi-supplier advantage
            </div>
          </div>
        )}
      </div>

      {/* 2. Plain Language Explanation (Section 29) */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs p-6">
        <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-white font-semibold text-sm">
          <span>💡</span>
          <span>Why this plan?</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {explanation ||
            "Gives the lowest total landed cost while meeting your delivery timeline and keeping backup supplier readiness."}
        </p>
      </div>

      {/* 3. Visual Allocation Progress & Supplier Cards */}
      <AllocationVisualizer
        allocations={allocations}
        totalDemand={totalUnits}
        totalCost={total_cost}
      />

      {/* 4. Alternative Strategies Comparison (Cheapest vs Balanced vs Diversified) */}
      {alternatives && (
        <AlternativeStrategiesTable
          alternatives={alternatives}
          onSelectPlan={onAdoptStrategy}
          activePlanName={result.objective_type}
        />
      )}

      {/* 5. Collapsible Technical Details: Why this allocation works */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 text-slate-700 dark:text-slate-300 shadow-xs">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowTechnicalDrawer(!showTechnicalDrawer)}>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              Why this allocation works
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mathematical solver verification • Factory MOQs • Line capacity
            </p>
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-[#0071E3] hover:underline"
          >
            {showTechnicalDrawer ? "Hide Details" : "Show Details"}
          </button>
        </div>

        {/* 3 Core Operational Pillars always visible */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-white/10 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5">
            <span className="text-slate-400 block text-[11px]">MOQ satisfied</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              ✓ All suppliers meet batch thresholds
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5">
            <span className="text-slate-400 block text-[11px]">Capacity satisfied</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              ✓ Within line capacity limits
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5">
            <span className="text-slate-400 block text-[11px]">Estimated Lead Time</span>
            <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
              ~{weighted_lead_time_days} days to door
            </span>
          </div>
        </div>

        {showTechnicalDrawer && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Solver Engine</span>
                <span className="font-semibold text-slate-900 dark:text-white">{solver_metadata.solver}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Execution Time</span>
                <span className="font-semibold text-slate-900 dark:text-white">{solver_metadata.runtime_ms} ms</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Mathematical Status</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{solver_metadata.solver_status}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Optimality Gap</span>
                <span className="font-semibold text-slate-900 dark:text-white">{solver_metadata.optimality_gap ?? 0.0}%</span>
              </div>
            </div>

            {/* Constraint Audit Table */}
            <div>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider">
                Rigorous Constraint Verification Audit
              </span>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10">
                <table className="w-full text-left text-xs bg-white dark:bg-[#1C1C1E]">
                  <thead className="bg-slate-100/70 dark:bg-white/10 border-b border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-3 font-semibold">Constraint</th>
                      <th className="p-3 font-semibold">Formal Requirement</th>
                      <th className="p-3 font-semibold">Actual Solution Value</th>
                      <th className="p-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {constraints_audit.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white capitalize">
                          {c.constraint_type.replace("_", " ")}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          {c.constraint_value}
                        </td>
                        <td className="p-3 text-slate-900 dark:text-white font-medium">
                          {c.actual_value}
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              c.status === "satisfied"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
