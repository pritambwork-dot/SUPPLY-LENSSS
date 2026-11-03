"use client";

import React from "react";
import { motion } from "framer-motion";

interface AnimatedGlassBackgroundProps {
  className?: string;
  intensity?: "subtle" | "vibrant";
}

export const AnimatedGlassBackground: React.FC<AnimatedGlassBackgroundProps> = ({
  className = "",
  intensity = "vibrant",
}) => {
  return (
    <div
      className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* 1. Base Subtle Dot Mesh Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(#1e40af 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)",
        }}
      />

      {/* 2. Top-Left Luminous Cyan/Electric Blue Orb */}
      <motion.div
        animate={{
          x: [0, 45, -30, 0],
          y: [0, -35, 25, 0],
          scale: [1, 1.12, 0.94, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-32 -left-32 w-[620px] h-[620px] rounded-full bg-gradient-to-br from-cyan-400/20 via-blue-500/15 to-transparent blur-[90px]"
      />

      {/* 3. Top-Right Violet/Indigo Glow Orb */}
      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -30, 0],
          scale: [1, 0.92, 1.15, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-20 -right-24 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-indigo-500/18 via-purple-500/12 to-transparent blur-[100px]"
      />

      {/* 4. Center-Left Emerald / Teal Sourcing Health Orb */}
      <motion.div
        animate={{
          x: [0, 35, -40, 0],
          y: [0, 50, -25, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/3 left-10 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-emerald-400/12 via-teal-400/10 to-transparent blur-[85px]"
      />

      {/* 5. Center-Right Sky Blue Intelligence Flare */}
      <motion.div
        animate={{
          x: [0, -40, 25, 0],
          y: [0, -45, 35, 0],
          scale: [1, 1.1, 0.92, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 -right-20 w-[550px] h-[550px] rounded-full bg-gradient-to-l from-blue-400/15 via-sky-300/10 to-transparent blur-[95px]"
      />

      {/* 6. Bottom Ambient Warm Violet Foundation */}
      <motion.div
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -20, 30, 0],
          scale: [1, 0.96, 1.08, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-36 left-1/3 w-[680px] h-[500px] rounded-full bg-gradient-to-t from-indigo-400/12 via-blue-500/10 to-transparent blur-[110px]"
      />

      {/* 7. Subtle Vignette Specular Layer for 3D Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-slate-900/[0.02]" />
    </div>
  );
};
