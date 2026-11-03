"use client";

import React, { useState } from "react";
import { TrendingDown, Info, ShieldAlert, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PredictedPriceBadgeProps {
  predictedPrice: number;
  minPrice: number;
  maxPrice: number;
  actualQuotedPrice?: number;
  volumeDiscountPct?: number;
  currency?: string;
  disclaimer?: string;
}

export const PredictedPriceBadge: React.FC<PredictedPriceBadgeProps> = ({
  predictedPrice,
  minPrice,
  maxPrice,
  actualQuotedPrice,
  volumeDiscountPct = 0,
  currency = "INR",
  disclaimer = "SupplyLens Model Benchmark Prediction • Not an Official Factory Quotation",
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const deltaPct = actualQuotedPrice
    ? Math.round(((actualQuotedPrice - predictedPrice) / predictedPrice) * 100)
    : null;

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 text-xs cursor-pointer hover:bg-indigo-500/15 transition-colors"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Model Est.
        </span>

        <span className="font-extrabold text-slate-900 dark:text-white">
          {formatCurrency(predictedPrice)}
        </span>

        <span className="text-[10px] text-slate-400">
          ({formatCurrency(minPrice)} – {formatCurrency(maxPrice)})
        </span>

        {volumeDiscountPct > 0 && (
          <span className="inline-flex items-center text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 rounded">
            <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
            -{Math.round(volumeDiscountPct)}% vol
          </span>
        )}

        <Info className="h-3 w-3 text-slate-400 hover:text-indigo-400" />
      </div>

      {/* Honest Transparency Popover */}
      {showTooltip && (
        <div className="absolute z-50 left-0 bottom-full mb-2 w-72 p-3.5 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 dark:border-white/10 text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold mb-1 text-[11px]">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>AI Benchmark Estimation</span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
            Predicted unit price based on historical transactions, material price indices, and batch volume economies of scale.
          </p>

          <div className="space-y-1 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl text-[10px]">
            <div className="flex justify-between text-slate-500">
              <span>95% Confidence Interval:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatCurrency(minPrice)} – {formatCurrency(maxPrice)}
              </span>
            </div>
            {actualQuotedPrice && (
              <div className="flex justify-between text-slate-500">
                <span>Supplier Quoted Price:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {formatCurrency(actualQuotedPrice)}
                  {deltaPct !== null && (
                    <span className={deltaPct > 0 ? "text-amber-500 ml-1" : "text-emerald-500 ml-1"}>
                      ({deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`})
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/10 text-[9px] text-slate-400 italic">
            ⚠️ {disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
