"use client";

import React, { useState } from "react";
import { OptimizationRequest } from "../../types";

interface OptimizationSetupCardProps {
  currentRequest: OptimizationRequest;
  onSolve: (request: OptimizationRequest) => void;
  isLoading: boolean;
}

const PRESET_QUANTITIES = [2000, 5000, 10000, 20000];

const STRATEGIES: { id: 'cost' | 'balanced' | 'diversified'; label: string; icon: string; desc: string }[] = [
  { id: "cost", label: "Lowest cost", icon: "💰", desc: "Absolute minimum procurement spend" },
  { id: "balanced", label: "Best balance", icon: "⚖️", desc: "Optimized trade-off across cost, risk & speed" },
  { id: "diversified", label: "Lower dependency", icon: "🛡️", desc: "Multi-supplier split to eliminate single-point risk" },
];

export const OptimizationSetupCard: React.FC<OptimizationSetupCardProps> = ({
  currentRequest,
  onSolve,
  isLoading,
}) => {
  const [quantity, setQuantity] = useState<number>(currentRequest.required_quantity || 5000);
  const [hasBudget, setHasBudget] = useState<boolean>(Boolean(currentRequest.budget_limit));
  const [budget, setBudget] = useState<number>(currentRequest.budget_limit || 150000);
  const [objective, setObjective] = useState<any>(currentRequest.objective_type || "balanced");
  const [maxSuppliers, setMaxSuppliers] = useState<number>(currentRequest.max_suppliers || 3);
  const [maxSupplierShare, setMaxSupplierShare] = useState<number>(currentRequest.max_supplier_share || 1.0);
  const [domesticOnly, setDomesticOnly] = useState<boolean>(
    Boolean(currentRequest.preferred_countries?.includes("India") && currentRequest.excluded_countries?.length)
  );
  const [neuralAssisted, setNeuralAssisted] = useState<boolean>(
    currentRequest.neural_assisted !== undefined ? currentRequest.neural_assisted : true
  );
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSolve({
      ...currentRequest,
      required_quantity: quantity,
      budget_limit: hasBudget ? budget : null,
      objective_type: objective,
      max_suppliers: maxSuppliers,
      max_supplier_share: maxSupplierShare,
      preferred_countries: domesticOnly ? ["India"] : [],
      excluded_countries: domesticOnly ? ["China", "Vietnam", "Germany"] : [],
      neural_assisted: neuralAssisted,
    });
  };

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs p-6 sm:p-8 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 mb-5 border-b border-slate-100 dark:border-white/10">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-[#0071E3] uppercase">
            Optimization Engine
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
            Order allocation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            How should you divide your order between suppliers?
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Strategic Priority Objective: 3 Simple Choices (Section 29) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
            How should we optimize your order?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STRATEGIES.map((strat) => {
              const isSelected = objective === strat.id;
              return (
                <button
                  key={strat.id}
                  type="button"
                  onClick={() => {
                    setObjective(strat.id);
                    if (strat.id === "diversified") {
                      setMaxSupplierShare(0.50);
                      setMaxSuppliers(Math.max(3, maxSuppliers));
                    }
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-[#0071E3] bg-[#0071E3]/5 shadow-xs ring-1 ring-[#0071E3]"
                      : "border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">{strat.icon}</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{strat.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{strat.desc}</p>
                  </div>
                  {strat.id === "balanced" && (
                    <span className="text-[10px] font-semibold text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded-full mt-3 self-start">
                      Recommended
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Target Order Quantity */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Target Order Quantity (Units)
          </label>
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            {PRESET_QUANTITIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuantity(q)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  quantity === q
                    ? "bg-[#0071E3] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"
                }`}
              >
                {q.toLocaleString()} units
              </button>
            ))}
          </div>
          <div className="relative max-w-xs">
            <input
              type="number"
              min={500}
              step={500}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 500)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 dark:bg-white/10 dark:border-white/15 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
            />
            <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">units</span>
          </div>
        </div>

        {/* 3. Budget Limit Ceiling */}
        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasBudget}
                onChange={(e) => setHasBudget(e.target.checked)}
                className="w-4 h-4 text-[#0071E3] rounded-md border-slate-300 dark:border-white/20 focus:ring-[#0071E3]"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Enforce Hard Working Capital Budget Limit
              </span>
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Optional procurement ceiling</span>
          </div>

          {hasBudget && (
            <div className="mt-3 max-w-xs relative">
              <span className="absolute left-3 top-2 text-xs font-semibold text-slate-400">₹</span>
              <input
                type="number"
                min={10000}
                step={5000}
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                className="w-full bg-white dark:bg-[#2C2C2E] border border-slate-300 dark:border-white/15 rounded-xl pl-7 pr-3 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                placeholder="150000"
              />
            </div>
          )}
        </div>

        {/* Advanced Constraints Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-[#0071E3] hover:text-[#0077ED] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{showAdvanced ? "▼ Hide" : "▶ Show"} Advanced Sourcing Constraints</span>
            <span className="text-slate-400 font-normal">(Supplier limits, concentration caps & geography)</span>
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 p-4 bg-slate-50/80 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10">
              {/* Max Active Suppliers Limit (K) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Max Active Suppliers (K = {maxSuppliers})
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={maxSuppliers}
                  onChange={(e) => setMaxSuppliers(parseInt(e.target.value, 10))}
                  className="w-full accent-[#0071E3] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>1 (Single)</span>
                  <span>3</span>
                  <span>5 (Max)</span>
                </div>
              </div>

              {/* Single Supplier Concentration Cap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Single-Vendor Cap ({Math.round(maxSupplierShare * 100)}%)
                </label>
                <input
                  type="range"
                  min={0.4}
                  max={1.0}
                  step={0.05}
                  value={maxSupplierShare}
                  onChange={(e) => setMaxSupplierShare(parseFloat(e.target.value))}
                  className="w-full accent-[#0071E3] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>40% (Strict Split)</span>
                  <span>70%</span>
                  <span>100% (No Cap)</span>
                </div>
              </div>

              {/* Domestic Preference Toggle */}
              <div className="flex flex-col justify-center">
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={domesticOnly}
                    onChange={(e) => setDomesticOnly(e.target.checked)}
                    className="w-4 h-4 text-[#0071E3] rounded-md border-slate-300 dark:border-white/20 focus:ring-[#0071E3]"
                  />
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    Domestic India Only 🇮🇳
                  </span>
                </label>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 ml-6">
                  Excludes overseas sea freight & port clearance
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Neural-Assisted Optimization Objective Toggle */}
        <div className="p-4 rounded-2xl border border-[#0071E3]/20 bg-[#0071E3]/5 dark:bg-white/5 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="text-xl">🧠</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Neural-Assisted Optimization
                </span>
                <span className="rounded-full bg-[#0071E3]/10 px-2 py-0.5 text-[9px] font-bold text-[#0071E3] dark:text-blue-400 border border-[#0071E3]/20">
                  Two-Tower Latent Head
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Feeds continuous neural fit rewards and operational disruption risk scores directly into the solver's scalar objective function.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={neuralAssisted}
              onChange={(e) => setNeuralAssisted(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-[#38383A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#34C759]"></div>
          </label>
        </div>

        {/* Action Button (Section 29) */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 disabled:opacity-50 text-white font-semibold text-sm rounded-full shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Finding the best plan...</span>
              </>
            ) : (
              <>
                <span>Find the best plan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
