"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useSceneContext } from "./SceneProvider";

interface GlassCard3DProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  maxRotation?: number; // degrees
  elevation?: number; // px z-translation
  enableSheen?: boolean;
  glowColor?: string; // e.g. "rgba(59, 130, 246, 0.18)"
}

export const GlassCard3D: React.FC<GlassCard3DProps> = ({
  children,
  className = "",
  onClick,
  maxRotation = 5,
  elevation = 16,
  enableSheen = true,
  glowColor = "rgba(59, 130, 246, 0.16)",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSceneContext();
  const [isHovered, setIsHovered] = useState(false);

  // Raw mouse coordinates relative to card center [-1 to 1]
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for physical damping
  const springConfig = { damping: 22, stiffness: 280 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  // Rotate opposite to cursor direction for realistic physical 3D tilt
  const rotateX = useTransform(smoothY, [-1, 1], [maxRotation, -maxRotation]);
  const rotateY = useTransform(smoothX, [-1, 1], [-maxRotation, maxRotation]);

  // Sheen light highlight position
  const sheenX = useTransform(smoothX, [-1, 1], ["0%", "100%"]);
  const sheenY = useTransform(smoothY, [-1, 1], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = (e.clientX - centerX) / (rect.width / 2);
    const mouseY = (e.clientY - centerY) / (rect.height / 2);
    x.set(Math.max(-1, Math.min(1, mouseX)));
    y.set(Math.max(-1, Math.min(1, mouseY)));
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  if (reducedMotion) {
    return (
      <div
        onClick={onClick}
        className={`rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_4px_24px_rgba(15,23,42,0.04)] ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      style={{ perspective: 1200 }}
      className="relative group transition-transform"
    >
      <motion.div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{
          scale: 1.012,
          boxShadow: `0 20px 35px -10px rgba(15, 23, 42, 0.08), 0 0 25px 0 ${glowColor}, inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)`,
        }}
        whileTap={{ scale: 0.985 }}
        className={`relative rounded-3xl bg-white/75 backdrop-blur-2xl border border-white/85 shadow-[0_4px_20px_rgba(15,23,42,0.04)] group-hover:border-white transition-all overflow-hidden ${className}`}
      >
        {/* Dynamic Specular Sheen Reflection */}
        {enableSheen && isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${sheenX.get()} ${sheenY.get()}, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 55%)`,
            }}
          />
        )}

        {/* Content with 3D Pop Elevation */}
        <div
          style={{
            transform: isHovered ? `translateZ(${elevation}px)` : "translateZ(0px)",
            transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="relative z-10 w-full h-full"
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
};
