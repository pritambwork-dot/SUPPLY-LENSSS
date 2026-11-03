"use client";

import React from "react";

interface GlossyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "glass" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const GlossyButton: React.FC<GlossyButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed select-none overflow-hidden";
  
  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-full",
    md: "px-5 py-2.5 text-xs rounded-full",
    lg: "px-7 py-3.5 text-sm rounded-full",
  }[size];

  const variantStyles = {
    primary: "bg-white text-black hover:bg-slate-100 shadow-[0_4px_16px_rgba(255,255,255,0.15)]",
    secondary: "bg-[#161c28] text-white hover:bg-[#1c2434] border border-white/[0.1] hover:border-white/[0.2] shadow-sm",
    glass: "bg-white/[0.06] text-white hover:bg-white/[0.12] border border-white/[0.12] backdrop-blur-md shadow-inner",
    danger: "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30",
  }[variant];

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
