"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

interface VerifiedBadgeProps {
  label?: string;
  size?: "sm" | "md";
  className?: string;
  onClickWhy?: (e: React.MouseEvent) => void;
  isVerified?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  label = "Demo Verified",
  size = "sm",
  className = "",
  onClickWhy,
  isVerified = true,
}) => {
  if (isVerified === false) return null;

  const displayLabel = label.includes("Demo") ? label : `Demo ${label}`;

  return (
    <span
      title="DEMO VERIFIED · SIMULATED EVIDENCE (10-Dimension Compliance Audit)"
      className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/90 font-bold tracking-tight transition-colors shadow-xs ${
        size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      } ${className}`}
    >
      <ShieldCheck className={size === "sm" ? "h-3.5 w-3.5 text-emerald-600" : "h-4 w-4 text-emerald-600"} />
      <span>{displayLabel}</span>
      {onClickWhy && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClickWhy(e);
          }}
          className="ml-0.5 text-[9px] text-emerald-700/80 hover:text-emerald-900 underline font-medium cursor-pointer"
        >
          Audit Dossier
        </button>
      )}
    </span>
  );
};
