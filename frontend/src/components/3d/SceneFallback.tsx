"use client";

import React from "react";
import { Globe, ShieldCheck } from "lucide-react";

interface SceneFallbackProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const SceneFallback: React.FC<SceneFallbackProps> = ({
  title = "Global Sourcing Network",
  subtitle = "Interactive 3D visualization paused (Reduced Motion or 2D Mode)",
  className = "",
}) => {
  return (
    <div
      className={`relative w-full h-full min-h-[220px] rounded-2xl bg-gradient-to-br from-[#0e1219] via-[#10141f] to-[#07090e] border border-white/[0.08] p-6 flex flex-col items-center justify-center text-center overflow-hidden ${className}`}
      aria-label={title}
    >
      {/* Background SVG Grid & Vector Arcs */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="fallback-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="fallback-arc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#fallback-grid)" />
        <path
          d="M 50 180 Q 200 40 350 180"
          fill="none"
          stroke="url(#fallback-arc)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <circle cx="50" cy="180" r="4" fill="#38bdf8" />
        <circle cx="350" cy="180" r="4" fill="#2563eb" />
      </svg>

      <div className="relative z-10 space-y-2">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-sky-400 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Globe className="w-5 h-5 animate-pulse" />
        </div>
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">{subtitle}</p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 mt-2">
          <ShieldCheck className="w-3 h-3" />
          <span>Real-time Data Active</span>
        </div>
      </div>
    </div>
  );
};
