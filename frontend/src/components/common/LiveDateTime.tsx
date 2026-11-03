"use client";

import React, { useState, useEffect } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface LiveDateTimeProps {
  showChevrons?: boolean;
  className?: string;
}

export const LiveDateTime: React.FC<LiveDateTimeProps> = ({
  showChevrons = true,
  className = "",
}) => {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(new Date());
  const [dayOffset, setDayOffset] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());

    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const displayDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);

  const formattedDate = mounted
    ? (dayOffset === 0 ? "Today, " : "") +
      displayDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Today, Nov 4";

  const formattedTime = mounted
    ? now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "01:55:00 AM";

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200 text-xs text-slate-700 shadow-xs select-none ${className}`}
      title="Current System Date & Real-Time Clock"
    >
      {showChevrons && (
        <button
          onClick={() => setDayOffset((prev) => prev - 1)}
          className="text-slate-400 hover:text-slate-800 transition-colors p-0.5 rounded cursor-pointer"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>
      )}

      <div className="flex items-center gap-1.5 px-1">
        <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0 animate-pulse" />
        <span className="text-[11px] font-semibold text-slate-800 whitespace-nowrap">
          {formattedDate}
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
        <span className="text-[11px] font-bold text-blue-600 font-mono tabular-nums whitespace-nowrap">
          {formattedTime}
        </span>
      </div>

      {showChevrons && (
        <button
          onClick={() => setDayOffset((prev) => Math.min(0, prev + 1))}
          disabled={dayOffset >= 0}
          className={`p-0.5 rounded transition-colors ${
            dayOffset >= 0
              ? "text-slate-200 cursor-not-allowed"
              : "text-slate-400 hover:text-slate-800 cursor-pointer"
          }`}
          aria-label="Next day"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
