"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export type MatchTier = "strong" | "good" | "moderate" | "caution";

interface AIMatchBadgeProps {
  tier?: MatchTier | string;
  reason?: string;
  showReason?: boolean;
  className?: string;
  onClickDetails?: (e: React.MouseEvent) => void;
}

export const AIMatchBadge: React.FC<AIMatchBadgeProps> = ({
  tier = "strong",
  reason = "Fits your budget and starting order size",
  showReason = false,
  className = "",
  onClickDetails,
}) => {
  const normalizedTier: MatchTier =
    typeof tier === "string" && tier.toLowerCase().includes("exceptional")
      ? "strong"
      : typeof tier === "string" && tier.toLowerCase().includes("strong")
      ? "strong"
      : typeof tier === "string" && tier.toLowerCase().includes("good")
      ? "good"
      : typeof tier === "string" && tier.toLowerCase().includes("moderate")
      ? "moderate"
      : typeof tier === "string" && tier.toLowerCase().includes("marginal")
      ? "caution"
      : "strong";

  const config = {
    strong: {
      label: "Strong match for you",
      pillClass: "bg-[#0071E3]/10 text-[#0071E3] border-[#0071E3]/20 dark:text-[#3894f8]",
      dotClass: "bg-[#0071E3]",
    },
    good: {
      label: "Good match",
      pillClass: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
      dotClass: "bg-emerald-500",
    },
    moderate: {
      label: "Possible match",
      pillClass: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
      dotClass: "bg-amber-500",
    },
    caution: {
      label: "High MOQ / Higher risk",
      pillClass: "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400",
      dotClass: "bg-rose-500",
    },
  }[normalizedTier];

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${config.pillClass}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
          <span>{config.label}</span>
        </span>

        {onClickDetails && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClickDetails(e);
            }}
            className="text-[11px] text-slate-400 hover:text-[#0071E3] transition-colors font-medium ml-1 cursor-pointer"
          >
            Why?
          </button>
        )}
      </div>

      {showReason && reason && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-normal">
          {reason}
        </p>
      )}
    </div>
  );
};
