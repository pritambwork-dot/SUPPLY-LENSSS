"use client";

import React from "react";
import { motion } from "framer-motion";

interface DepthCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverScale?: number;
}

export const DepthCard: React.FC<DepthCardProps> = ({
  children,
  className = "",
  onClick,
  hoverScale = 1.015,
}) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{
        y: -3,
        scale: hoverScale,
        boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 20px rgba(56, 189, 248, 0.1)",
      }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-2xl bg-[#10141f] border border-white/[0.08] hover:border-white/[0.18] transition-colors p-5 shadow-lg overflow-hidden group ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* Top Hairline Sheen */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 group-hover:via-sky-400/30 to-transparent transition-colors" />
      {children}
    </motion.div>
  );
};
