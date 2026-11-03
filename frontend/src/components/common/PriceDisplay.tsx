"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";

interface PriceDisplayProps {
  price?: number;
  amount?: number;
  currency?: string;
  unit?: string;
  prefix?: string;
  priceType?: "listed" | "estimated" | "user_provided";
  secondaryCurrency?: string;
  secondaryRate?: number; // e.g. USD to INR conversion
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  amount,
  currency = "INR",
  unit = "unit",
  prefix,
  priceType = "listed",
  secondaryCurrency,
  secondaryRate = 83.5,
  className = "",
}) => {
  const displayPrice = price !== undefined ? price : (amount !== undefined ? amount : null);
  const typeLabel =
    priceType === "estimated"
      ? "Estimated"
      : priceType === "user_provided"
      ? "User-provided"
      : "Publicly listed";

  if (displayPrice === null || displayPrice === 0) {
    return (
      <div className={`text-xs font-semibold text-slate-500 dark:text-slate-400 ${className}`}>
        Price not publicly available
      </div>
    );
  }

  // Approximate secondary conversion if currency is USD
  const showConversion =
    currency === "USD" || (secondaryCurrency && secondaryCurrency !== currency);
  const convertedAmount =
    currency === "USD" ? displayPrice * secondaryRate : displayPrice;
  const convertedCurrency = currency === "USD" ? "INR" : secondaryCurrency || "INR";

  return (
    <div className={`space-y-0.5 ${className}`}>
      <div className="flex items-baseline gap-1">
        {prefix && (
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            {prefix}
          </span>
        )}
        <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          {formatCurrency(displayPrice, currency)}
        </span>
        {unit && (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            / {unit}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
        <span>{typeLabel}</span>
        {showConversion && (
          <>
            <span>•</span>
            <span title="Approximate currency conversion">
              ≈ {formatCurrency(convertedAmount, convertedCurrency)}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
