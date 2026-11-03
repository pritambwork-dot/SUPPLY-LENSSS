"use client";

import React from "react";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: "obsidian" | "elevated" | "subtle";
  glow?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = "",
  variant = "obsidian",
  glow = false,
}) => {
  const variantStyles = {
    obsidian: "bg-[#0e1219]/90 border border-white/[0.08] backdrop-blur-2xl shadow-2xl",
    elevated: "bg-[#141822]/95 border border-white/[0.12] backdrop-blur-3xl shadow-2xl",
    subtle: "bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl",
  };

  return (
    <div
      className={`relative rounded-3xl ${variantStyles[variant]} ${
        glow ? "shadow-[0_0_30px_rgba(56,189,248,0.1)]" : ""
      } overflow-hidden ${className}`}
    >
      {/* Top Bevel Sheen Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};
