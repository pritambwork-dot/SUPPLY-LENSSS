"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useSceneContext } from "./SceneProvider";

interface SpatialCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  maxRotation?: number; // degrees
  elevation?: number; // px z-translation
  elevationOnHover?: number;
  enableSheen?: boolean;
}

export const SpatialCard: React.FC<SpatialCardProps> = ({
  children,
  className = "",
  onClick,
  maxRotation = 7,
  elevation = 14,
  elevationOnHover,
  enableSheen = true,
}) => {
  const effectiveElevation = elevationOnHover ?? elevation;
  const cardRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSceneContext();
  const [isHovered, setIsHovered] = useState(false);

  // Raw mouse coordinates relative to card center [-1 to 1]
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for physical deceleration
  const springConfig = { damping: 20, stiffness: 300 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  // Rotate opposite to cursor direction for realistic tilt
  const rotateX = useTransform(smoothY, [-1, 1], [maxRotation, -maxRotation]);
  const rotateY = useTransform(smoothX, [-1, 1], [-maxRotation, maxRotation]);
  const translateZ = useTransform(smoothX, [-1, 1], [0, effectiveElevation]);

  // Dynamic specular sheen reflection position
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

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  if (reducedMotion) {
    return (
      <div
        onClick={onClick}
        className={`rounded-2xl bg-[#0e1219] border border-white/[0.08] shadow-lg transition-all ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div style={{ perspective: 1000 }} className="relative group">
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
          scale: 1.015,
          boxShadow: "0 25px 45px -15px rgba(0, 0, 0, 0.7), 0 0 25px rgba(56, 189, 248, 0.12)",
        }}
        whileTap={{ scale: 0.98 }}
        className={`relative rounded-2xl bg-[#0e1219] border border-white/[0.08] group-hover:border-white/[0.18] transition-colors overflow-hidden ${className}`}
      >
        {/* Specular Sheen Highlight Gradient */}
        {enableSheen && isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-20 opacity-30 mix-blend-overlay"
            style={{
              background: `radial-gradient(circle 240px at ${sheenX.get()} ${sheenY.get()}, rgba(255, 255, 255, 0.8), transparent 80%)`,
            }}
          />
        )}

        {/* Interior Children Content with slight forward pop */}
        <div style={{ transform: "translateZ(1px)" }} className="relative z-10 w-full h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
};
