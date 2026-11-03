"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

export type QualityTier = "ultra" | "high" | "medium" | "mobile";

interface SceneContextValue {
  hasWebGL: boolean;
  reducedMotion: boolean;
  qualityTier: QualityTier;
  registerScene: () => void;
  unregisterScene: () => void;
  activeScenesCount: number;
}

const SceneContext = createContext<SceneContextValue>({
  hasWebGL: true,
  reducedMotion: false,
  qualityTier: "high",
  registerScene: () => {},
  unregisterScene: () => {},
  activeScenesCount: 0,
});

export const useSceneContext = () => useContext(SceneContext);

export const SceneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [qualityTier, setQualityTier] = useState<QualityTier>("high");
  const [activeScenesCount, setActiveScenesCount] = useState<number>(0);

  useEffect(() => {
    // 1. Detect WebGL support safely
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }

    // 2. Detect prefers-reduced-motion
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);

      // 3. Determine Quality Tier based on screen size & device capabilities
      const updateTier = () => {
        const width = window.innerWidth;
        const memory = (navigator as any).deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 4;

        if (width < 768 || memory < 4 || cores < 4) {
          setQualityTier("mobile");
        } else if (width < 1024) {
          setQualityTier("medium");
        } else if (width >= 1600 && memory >= 8 && cores >= 8) {
          setQualityTier("ultra");
        } else {
          setQualityTier("high");
        }
      };

      updateTier();
      window.addEventListener("resize", updateTier);
      return () => {
        mediaQuery.removeEventListener("change", listener);
        window.removeEventListener("resize", updateTier);
      };
    }
  }, []);

  const registerScene = () => setActiveScenesCount((c) => c + 1);
  const unregisterScene = () => setActiveScenesCount((c) => Math.max(0, c - 1));

  const value = useMemo(
    () => ({
      hasWebGL,
      reducedMotion,
      qualityTier,
      registerScene,
      unregisterScene,
      activeScenesCount,
    }),
    [hasWebGL, reducedMotion, qualityTier, activeScenesCount]
  );

  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>;
};
