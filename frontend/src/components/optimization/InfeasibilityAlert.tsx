"use client";

import React from "react";
import { InfeasibilityDiagnostics } from "../../types";

interface InfeasibilityAlertProps {
  diagnostics?: InfeasibilityDiagnostics | null;
  onResetConstraints?: () => void;
  onIncreaseBudget?: () => void;
  onReduceQuantity?: () => void;
}

export const InfeasibilityAlert: React.FC<InfeasibilityAlertProps> = ({
  diagnostics,
  onResetConstraints,
  onIncreaseBudget,
  onReduceQuantity,
}) => {
  if (!diagnostics) return null;

  return (
    <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-3xl p-6 mb-6 shadow-xs">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">⚠️</span>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-amber-900 dark:text-amber-200">
            No Feasible Sourcing Allocation Under Current Constraints
          </h3>
          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
            The Operations Research solver evaluated all verified supplier candidates, factory minimum order quantities (MOQs), and production limits.
            Mathematically, no valid order split satisfies all specified constraints simultaneously.
          </p>

          {/* Root Causes */}
          {diagnostics.root_causes && diagnostics.root_causes.length > 0 && (
            <div className="mt-4 bg-white/80 dark:bg-[#1C1C1E] rounded-2xl p-4 border border-amber-500/20 dark:border-white/10">
              <span className="text-[11px] font-semibold uppercase text-amber-900 dark:text-amber-300 tracking-wider block mb-1.5">
                Root Causes Detected:
              </span>
              <ul className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
                {diagnostics.root_causes.map((cause, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actionable Remedies */}
          {diagnostics.actionable_remedies && diagnostics.actionable_remedies.length > 0 && (
            <div className="mt-3 bg-white/80 dark:bg-[#1C1C1E] rounded-2xl p-4 border border-emerald-500/20 dark:border-white/10">
              <span className="text-[11px] font-semibold uppercase text-emerald-800 dark:text-emerald-400 tracking-wider block mb-1.5">
                Actionable Remedies:
              </span>
              <ul className="space-y-1 text-xs text-slate-800 dark:text-slate-200">
                {diagnostics.actionable_remedies.map((remedy, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{remedy}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
            {onResetConstraints && (
              <button
                type="button"
                onClick={onResetConstraints}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-semibold rounded-full shadow-xs transition-all cursor-pointer"
              >
                Reset to Balanced Defaults
              </button>
            )}
            {onIncreaseBudget && (
              <button
                type="button"
                onClick={onIncreaseBudget}
                className="px-4 py-2 bg-white dark:bg-[#2C2C2E] hover:bg-amber-50 dark:hover:bg-white/10 active:scale-95 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-500/30 text-xs font-semibold rounded-full shadow-xs transition-all cursor-pointer"
              >
                Relax Budget Ceiling
              </button>
            )}
            {onReduceQuantity && (
              <button
                type="button"
                onClick={onReduceQuantity}
                className="px-4 py-2 bg-white dark:bg-[#2C2C2E] hover:bg-amber-50 dark:hover:bg-white/10 active:scale-95 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-500/30 text-xs font-semibold rounded-full shadow-xs transition-all cursor-pointer"
              >
                Lower Target Quantity
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
