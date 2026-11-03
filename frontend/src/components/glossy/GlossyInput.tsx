"use client";

import React from "react";

interface GlossyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const GlossyInput = React.forwardRef<HTMLInputElement, GlossyInputProps>(
  ({ icon, className = "", ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 text-white/40 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 backdrop-blur-md transition-all duration-200 py-2.5 ${
            icon ? "pl-10 pr-4" : "px-4"
          } ${className}`}
          {...props}
        />
      </div>
    );
  }
);

GlossyInput.displayName = "GlossyInput";
