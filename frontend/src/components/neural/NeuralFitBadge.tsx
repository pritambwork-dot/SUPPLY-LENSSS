"use client";

import React from "react";
import { Sparkles, HelpCircle, Activity } from "lucide-react";

interface NeuralFitBadgeProps {
  fitPercentage: number;
  fitTier?: string;
  topFactor?: string;
  size?: "sm" | "md";
  onClick?: () => void;
  showDetails?: boolean;
}

export const NeuralFitBadge: React.FC<NeuralFitBadgeProps> = ({
  fitPercentage,
  fitTier = "Strong Fit",
  topFactor,
  size = "md",
  onClick,
  showDetails = false,
}) => {
  // Determine color scheme based on score
  const getTheme = () => {
    if (fitPercentage >= 85) {
      return {
        bg: "bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15",
        border: "border-emerald-500/30 dark:border-emerald-500/40",
        text: "text-emerald-700 dark:text-emerald-300",
        glow: "shadow-[0_0_12px_rgba(16,185,129,0.15)]",
        iconColor: "text-emerald-500",
        barColor: "bg-emerald-500",
      };
    }
    if (fitPercentage >= 70) {
      return {
        bg: "bg-gradient-to-r from-sky-500/15 via-indigo-500/15 to-cyan-500/15",
        border: "border-sky-500/30 dark:border-sky-500/40",
        text: "text-sky-700 dark:text-sky-300",
        glow: "shadow-[0_0_12px_rgba(14,165,233,0.15)]",
        iconColor: "text-sky-500",
        barColor: "bg-sky-500",
      };
    }
    if (fitPercentage >= 50) {
      return {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        text: "text-amber-700 dark:text-amber-300",
        glow: "shadow-[0_0_8px_rgba(245,158,11,0.1)]",
        iconColor: "text-amber-500",
        barColor: "bg-amber-500",
      };
    }
    return {
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      text: "text-rose-700 dark:text-rose-400",
      glow: "",
      iconColor: "text-rose-500",
      barColor: "bg-rose-500",
    };
  };

  const theme = getTheme();

  return (
    <div className="flex flex-col gap-1">
      <div
        onClick={onClick}
        role={onClick ? "button" : undefined}
        title="Two-Tower Neural Matching Prediction (Founder Vector x Supplier Vector)"
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${theme.bg} ${theme.border} ${theme.glow} ${
          onClick ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform" : ""
        }`}
      >
        <Sparkles className={`h-3.5 w-3.5 ${theme.iconColor} animate-pulse`} />
        
        <span className={`text-xs font-black tracking-tight ${theme.text}`}>
          {fitPercentage}%
        </span>

        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
          • {fitTier}
        </span>

        {onClick && (
          <span className="ml-1 flex items-center gap-0.5 text-[9px] font-semibold text-slate-400 hover:text-sky-400">
            <Activity className="h-2.5 w-2.5" />
            <span>NN</span>
          </span>
        )}
      </div>

      {showDetails && topFactor && (
        <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 italic pl-1">
          💡 {topFactor}
        </div>
      )}
    </div>
  );
};
