"use client";

import React, { useState } from "react";
import { SourcingScenario } from "../../types";

interface WhatIfSimulatorProps {
  scenarios: SourcingScenario[];
  onQuantityChange: (newQuantity: number) => void;
  currentQuantity: number;
  isRecalculating?: boolean;
}

const PRESET_VOLUMES = [1000, 2500, 5000, 10000, 15000, 20000];

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  scenarios,
  onQuantityChange,
  currentQuantity,
  isRecalculating = false,
}) => {
  const [sliderVal, setSliderVal] = useState<number>(currentQuantity);

  React.useEffect(() => {
    setSliderVal(currentQuantity);
  }, [currentQuantity]);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSliderVal(val);
    onQuantityChange(val);
  };

  const handleQuickSelect = (qty: number) => {
    setSliderVal(qty);
    onQuantityChange(qty);
  };

  // Find local vs overseas scenario
  const localScenario = scenarios.find((s) => s.origin_country === s.destination_country);
  const overseasScenario = scenarios.find((s) => s.origin_country !== s.destination_country);

  const isTippingPointReached = sliderVal >= 15000;

  return (
    <div className="bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 shadow-xs mb-6 border border-slate-200/80 dark:border-white/10 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-100 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              What-If Volume Sensitivity Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Slide volume to test economies of scale and discover when overseas ocean freight becomes cheaper than local trucking.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            Simulated Volume
          </span>
          <span className="text-2xl font-black text-[#0071E3]">
            {sliderVal.toLocaleString()} units
          </span>
        </div>
      </div>

      {/* Slider & Quick Buttons */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-2">
          <span>1,000 units (Pilot Trial)</span>
          <span className="font-bold text-[#0071E3]">
            {sliderVal.toLocaleString()} units
          </span>
          <span>25,000 units (Container Scale)</span>
        </div>

        <input
          type="range"
          min="1000"
          max="25000"
          step="500"
          value={sliderVal}
          onChange={handleSlider}
          className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-[#0071E3]"
        />

        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium mr-1">Quick Presets:</span>
          {PRESET_VOLUMES.map((vol) => (
            <button
              key={vol}
              type="button"
              onClick={() => handleQuickSelect(vol)}
              className={`text-xs px-3.5 py-1 rounded-full font-semibold transition-all active:scale-95 ${
                sliderVal === vol
                  ? "bg-[#0071E3] text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
            >
              {vol >= 1000 ? `${vol / 1000}k units` : `${vol} units`}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Sourcing Insight Banner */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isTippingPointReached
            ? "bg-emerald-500/10 border-emerald-500/20 text-slate-900 dark:text-emerald-100"
            : "bg-[#0071E3]/10 border-[#0071E3]/20 text-slate-900 dark:text-blue-100"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">
            {isTippingPointReached ? "🚢" : "🚛"}
          </span>
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              {isTippingPointReached
                ? "Volume Tipping Point Activated (Scale Sourcing)"
                : "Pilot Batch Optimization (Low Initial Outlay)"}
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                  isTippingPointReached
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                    : "bg-[#0071E3]/20 text-[#0071E3] dark:text-[#3894f8] border border-[#0071E3]/30"
                }`}
              >
                {isTippingPointReached ? "International Cheaper" : "Local Cheaper"}
              </span>
            </h4>
            <p className="text-xs mt-1 leading-relaxed text-slate-600 dark:text-slate-300">
              {isTippingPointReached ? (
                <>
                  At <strong>{sliderVal.toLocaleString()} units</strong>, international bulk discounts unlock substantial factory savings. 
                  Factory unit pricing (e.g. ₹9.20 vs ₹14.50) creates a raw manufacturing saving of over ₹79,000, 
                  easily overcoming international ocean freight charges. <strong>EcoPack Dongguan</strong> is now your lowest total cost delivered solution.
                </>
              ) : (
                <>
                  At <strong>{sliderVal.toLocaleString()} units</strong>, international ocean freight (~₹35,000) adds too much overhead per piece. 
                  Local road delivery from <strong>Utkal GreenFiber (Cuttack, 28 km)</strong> has minimal transit freight (~₹3,700), 
                  making it the cheapest overall cash commitment for testing customer demand in Bhubaneswar.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Mini-Bar for Active Scenarios */}
      {scenarios.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10">
          <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-3">
            Projected Landed Unit Cost at {sliderVal.toLocaleString()} units:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {scenarios.map((s) => {
              const isCheapestAtVol =
                (isTippingPointReached && s.origin_country !== s.destination_country) ||
                (!isTippingPointReached && s.origin_country === s.destination_country);

              return (
                <div
                  key={s.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isCheapestAtVol
                      ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20"
                      : "bg-slate-50/80 dark:bg-white/5 border-slate-100 dark:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900 dark:text-white truncate">{s.supplier_name}</span>
                    {isCheapestAtVol && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Lowest Total
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    ₹{s.breakdown.cost_per_unit.toFixed(2)}
                    <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 ml-1">/ unit landed</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Est. Total: ₹{s.estimated_total_cost.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
