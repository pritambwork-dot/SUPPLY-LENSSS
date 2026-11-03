"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DataPoint {
  date: string;
  value: number;
  change: string;
}

const dataByRange: Record<string, DataPoint[]> = {
  "24h": [
    { date: "02:00", value: 1240, change: "+2.1%" },
    { date: "06:00", value: 1890, change: "+4.3%" },
    { date: "10:00", value: 3420, change: "+7.8%" },
    { date: "14:00", value: 4890, change: "+11.4%" },
    { date: "18:00", value: 5538, change: "+9.4%" },
    { date: "22:00", value: 6120, change: "+14.2%" },
  ],
  "Week": [
    { date: "Mon", value: 14200, change: "+3.5%" },
    { date: "Tue", value: 18500, change: "+6.1%" },
    { date: "Wed", value: 24300, change: "+9.8%" },
    { date: "Thu", value: 22100, change: "+7.2%" },
    { date: "Fri", value: 31800, change: "+15.3%" },
    { date: "Sat", value: 29400, change: "+12.0%" },
    { date: "Sun", value: 34500, change: "+18.9%" },
  ],
  "Month": [
    { date: "Mar 8", value: 2100, change: "+3.2%" },
    { date: "Mar 13", value: 2850, change: "+5.1%" },
    { date: "Mar 18", value: 4320, change: "+8.4%" },
    { date: "Mar 23", value: 3950, change: "+6.9%" },
    { date: "Mar 29", value: 5538, change: "+9.41%" },
    { date: "Apr 3", value: 4890, change: "+7.8%" },
    { date: "Apr 8", value: 6840, change: "+19.23%" },
  ],
};

export const InteractiveChart: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<"24h" | "Week" | "Month">("Month");
  const [hoverIndex, setHoverIndex] = useState<number>(4); // Default to Mar 29 matching screenshot

  const points = dataByRange[selectedRange];
  const maxVal = Math.max(...points.map((p) => p.value));
  const minVal = Math.min(...points.map((p) => p.value));

  // Compute SVG coordinates (width: 440, height: 140)
  const width = 440;
  const height = 140;
  const paddingX = 24;
  const paddingY = 20;

  const getCoordinates = (index: number) => {
    const x = paddingX + (index / (points.length - 1)) * (width - 2 * paddingX);
    const normalizedY = (points[index].value - minVal) / (maxVal - minVal || 1);
    const y = height - paddingY - normalizedY * (height - 2 * paddingY);
    return { x, y };
  };

  // Generate smooth cubic bezier SVG path string
  const coords = points.map((_, i) => getCoordinates(i));
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const current = coords[i];
    const next = coords[i + 1];
    const controlX = (current.x + next.x) / 2;
    pathD += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

  const activePoint = points[hoverIndex] || points[points.length - 1];
  const activeCoord = getCoordinates(hoverIndex);

  return (
    <div className="flex flex-col">
      {/* Overview stats & 24h / Week / Month tab selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex flex-col text-left">
          <span className="text-[11px] text-slate-400 font-medium">
            2 times increase to last month
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
              + 12.83 %
            </span>
          </div>
        </div>

        {/* 24h / Week / Month Pill Selector matching screenshot */}
        <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200/80">
          {(["24h", "Week", "Month"] as const).map((range) => {
            const isActive = selectedRange === range;
            return (
              <button
                key={range}
                onClick={() => {
                  setSelectedRange(range);
                  setHoverIndex(Math.floor(dataByRange[range].length / 2));
                }}
                className={`relative px-3 py-1 text-[11px] font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "text-white font-bold bg-[#1E293B] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {range}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive SVG Chart Box */}
      <div className="relative w-full overflow-hidden select-none py-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-32 overflow-visible"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const idx = Math.round(relX * (points.length - 1));
            setHoverIndex(idx);
          }}
        >
          <defs>
            {/* Soft cyan gradient fill */}
            <linearGradient id="chartAreaGradientLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>

            <filter id="glowLight" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#38bdf8" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Area Fill */}
          <path d={areaD} fill="url(#chartAreaGradientLight)" />

          {/* Main Bezier Line in Sky Blue */}
          <path
            d={pathD}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glowLight)"
          />

          {/* Active Vertical Dotted Guide Line */}
          <line
            x1={activeCoord.x}
            y1={activeCoord.y}
            x2={activeCoord.x}
            y2={height - paddingY}
            stroke="#94a3b8"
            strokeDasharray="3 3"
            strokeWidth="1"
          />

          {/* Active Data Point Halo */}
          <circle
            cx={activeCoord.x}
            cy={activeCoord.y}
            r="6"
            fill="#38bdf8"
            fillOpacity="0.3"
            className="animate-ping"
          />
          <circle
            cx={activeCoord.x}
            cy={activeCoord.y}
            r="4.5"
            fill="#ffffff"
            stroke="#0284c7"
            strokeWidth="2"
          />
        </svg>

        {/* Floating Tooltip Pill matching exact Dribbble screenshot */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedRange}-${hoverIndex}`}
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute pointer-events-none z-10 px-3 py-1.5 rounded-xl bg-[#1E293B] border border-slate-700 shadow-xl flex items-center gap-2"
            style={{
              left: `${(activeCoord.x / width) * 100}%`,
              top: `${Math.max(5, (activeCoord.y / height) * 100 - 32)}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <span className="text-[10px] text-slate-300 font-medium">{activePoint.date}</span>
            <span className="text-xs font-bold text-white tracking-tight">
              ${activePoint.value.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-emerald-400">{activePoint.change}</span>
          </motion.div>
        </AnimatePresence>

        {/* Horizontal X Axis Labels */}
        <div className="flex items-center justify-between px-2 text-[10px] font-medium text-slate-400 mt-1">
          {points.map((p, i) => (
            <span
              key={i}
              className={`transition-colors ${i === hoverIndex ? "text-sky-600 font-bold" : ""}`}
            >
              {p.date}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Headline Rate Metric matching screenshot (+ 19.23 %) */}
      <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-100">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-extrabold text-sky-500 tracking-tight">+ 19.23 %</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Last updated Today, 06:49 AM</span>
      </div>
    </div>
  );
};
