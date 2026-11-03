"use client";

import React from "react";
import { Star } from "lucide-react";

interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  showCount?: boolean;
  className?: string;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewCount,
  size = "sm",
  showCount = true,
  className = "",
}) => {
  if (!rating || rating === 0) {
    return (
      <div className={`inline-flex items-center text-slate-400 dark:text-slate-500 font-medium ${size === "sm" ? "text-[11px]" : "text-xs"} ${className}`}>
        No public rating found
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium ${className}`}>
      <Star className={`${size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} text-amber-500 fill-amber-500 shrink-0`} />
      <span className={`${size === "sm" ? "text-xs" : "text-sm"} font-semibold text-slate-900 dark:text-white`}>
        {rating.toFixed(1)}
      </span>
      {showCount && reviewCount !== undefined && (
        <span className={`${size === "sm" ? "text-[11px]" : "text-xs"} text-slate-400 dark:text-slate-500 font-normal`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
