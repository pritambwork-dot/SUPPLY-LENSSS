"use client";

import React from "react";
import { OptimizationAllocationItem } from "../../types";

interface AllocationVisualizerProps {
  allocations: OptimizationAllocationItem[];
  totalDemand: number;
  totalCost: number;
}

const BAR_COLORS = [
  { bg: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-200", light: "bg-emerald-50" },
  { bg: "bg-indigo-500", text: "text-indigo-700", border: "border-indigo-200", light: "bg-indigo-50" },
  { bg: "bg-amber-500", text: "text-amber-700", border: "border-amber-200", light: "bg-amber-50" },
  { bg: "bg-sky-500", text: "text-sky-700", border: "border-sky-200", light: "bg-sky-50" },
  { bg: "bg-purple-500", text: "text-purple-700", border: "border-purple-200", light: "bg-purple-50" },
];

export const AllocationVisualizer: React.FC<AllocationVisualizerProps> = ({
  allocations,
  totalDemand,
  totalCost,
}) => {
  if (!allocations || allocations.length === 0) {
    return (
      <div className="p-8 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-3xl text-center text-slate-500 dark:text-slate-400 text-xs">
        No supplier allocations to display. Run optimization to generate an allocation.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📊</span> Order Allocation Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Optimal multi-sourcing breakdown satisfying factory MOQs and monthly capacities.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100/90 dark:bg-white/10 px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 font-medium">
          <span>Active Vendors:</span>
          <span className="font-bold text-slate-900 dark:text-white">{allocations.length}</span>
          <span className="text-slate-400">•</span>
          <span>Demand:</span>
          <span className="font-bold text-slate-900 dark:text-white">{totalDemand.toLocaleString()} units</span>
        </div>
      </div>

      {/* Stacked Percentage Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-8 rounded-full overflow-hidden flex bg-slate-100 dark:bg-white/10 p-1 gap-1 border border-slate-200/80 dark:border-white/10">
          {allocations.map((item, idx) => {
            const color = BAR_COLORS[idx % BAR_COLORS.length];
            return (
              <div
                key={item.supplier_id}
                style={{ width: `${Math.max(item.percentage_of_total, 5)}%` }}
                className={`${color.bg} h-full rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-semibold tracking-tight px-1 shadow-2xs overflow-hidden`}
                title={`${item.supplier_name}: ${item.quantity.toLocaleString()} units (${item.percentage_of_total}%)`}
              >
                {item.percentage_of_total >= 12 ? (
                  <span className="truncate">{item.percentage_of_total}%</span>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 mt-3">
          {allocations.map((item, idx) => {
            const color = BAR_COLORS[idx % BAR_COLORS.length];
            return (
              <div key={item.supplier_id} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                <span className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                <span className="font-medium">{item.supplier_name}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{item.percentage_of_total}%</span>
                <span className="text-slate-400">({item.quantity.toLocaleString()} units)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allocations.map((item, idx) => {
          const color = BAR_COLORS[idx % BAR_COLORS.length];

          return (
            <div
              key={item.supplier_id}
              className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-5 transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Tier {idx + 1} Supplier
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                      {item.supplier_name}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      📍 {item.country} • ⭐ {item.rating}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${color.bg} text-white shadow-2xs`}>
                    {item.percentage_of_total}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-3 py-2 border-y border-slate-200/60 dark:border-white/10 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Allocated Units</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {item.quantity.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Unit Cost</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      ₹{item.unit_price.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Subtotal Outlay</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{item.total_cost.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Lead Time</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      ~{item.lead_time_days} days
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ MOQ ({item.moq.toLocaleString()}) met
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Risk: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{Math.round(item.risk_score * 100)}%</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
