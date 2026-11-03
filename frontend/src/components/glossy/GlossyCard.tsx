"use client";

import React from "react";

interface GlossyCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlossyCard: React.FC<GlossyCardProps> = ({
  children,
  className = "",
  onClick,
  hoverEffect = true,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-3xl bg-[#0f141e]/80 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden transition-all duration-300 ${
        hoverEffect ? "hover:border-white/[0.18] hover:shadow-[0_16px_48px_rgba(0,0,0,0.7)] hover:-translate-y-0.5" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {/* Specular Top Razor-Thin Sheen */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      {/* Ambient Radial Vignette */}
      <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
      {children}
    </div>
  );
};
