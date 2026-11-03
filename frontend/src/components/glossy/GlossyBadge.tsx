"use client";

import React from "react";

interface GlossyBadgeProps {
  children: React.ReactNode;
  variant?: "cyan" | "emerald" | "amber" | "neutral" | "blue";
  size?: "sm" | "md";
  icon?: React.ReactNode;
  className?: string;
}

export const GlossyBadge: React.FC<GlossyBadgeProps> = ({
  children,
  variant = "cyan",
  size = "sm",
  icon,
  className = "",
}) => {
  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
  }[size];

  const variantStyles = {
    cyan: "bg-sky-500/10 text-sky-400 border-sky-500/25",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    neutral: "bg-white/[0.06] text-white/70 border-white/[0.1]",
    blue: "bg-blue-600/15 text-blue-400 border-blue-500/30",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-bold tracking-tight border backdrop-blur-sm select-none ${sizeStyles} ${variantStyles} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
