"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Compass, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  SlidersHorizontal, 
  Calculator, 
  FileSpreadsheet, 
  Globe2, 
  Layers, 
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { AiSphere3D } from "@/components/3d/AiSphere3D";
import { GlobalGlobe } from "@/components/3d/GlobalGlobe";
import { SpatialCard } from "@/components/3d/SpatialCard";
import { GlassPanel } from "@/components/visual/GlassPanel";
import { AnimatedButton } from "@/components/visual/AnimatedButton";

export default function CinematicLanding() {
  const router = useRouter();
  const [active3DMode, setActive3DMode] = useState<"sphere" | "globe">("sphere");

  return (
    <div className="min-h-screen bg-[#07090e] text-white font-sans antialiased selection:bg-sky-500/30 selection:text-white overflow-x-hidden">
      {/* Dynamic Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="absolute top-[40%] right-[10%] w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[130px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[160px]" />
      </div>

      {/* Atmospheric Top Navigation Bar */}
      <header className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 p-0.5 shadow-lg shadow-blue-500/30">
            <div className="w-full h-full bg-[#0a0d14] rounded-[14px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white">Supply<span className="text-sky-400">Lens</span></span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.05] border border-white/10 text-gray-400">
              v2.0 Spatial
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            Sign In
          </button>
          <AnimatedButton
            onClick={() => router.push("/")}
            variant="primary"
            size="md"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Launch Platform
          </AnimatedButton>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-20 flex flex-col items-center text-center">
        {/* Top Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-sky-400 shadow-xl backdrop-blur-md mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Next-Generation Sourcing Intelligence</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1]"
        >
          Global Sourcing Intelligence.{" "}
          <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
            Experienced in 3D.
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed"
        >
          Discover verified global manufacturing partners, model complete landed freight economics, and solve optimal procurement allocations with mathematical certainty.
        </motion.p>

        {/* CTA Button Group */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <AnimatedButton
            onClick={() => router.push("/")}
            variant="primary"
            size="lg"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Open Interactive Workspace
          </AnimatedButton>
          <button
            onClick={() => setActive3DMode(active3DMode === "sphere" ? "globe" : "sphere")}
            className="px-6 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-white text-sm font-semibold flex items-center gap-2 transition-all shadow-md backdrop-blur-md"
          >
            <Globe2 className="w-4 h-4 text-sky-400" />
            <span>Switch to {active3DMode === "sphere" ? "3D Earth Globe" : "3D AI Neural Sphere"}</span>
          </button>
        </motion.div>

        {/* =========================================================================
            CENTERPIECE: 3D RIBBED SPHERE / 3D ROTATABLE EARTH GLOBE
           ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1.0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 w-full max-w-4xl relative"
        >
          <GlassPanel className="p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span>{active3DMode === "sphere" ? "3D Autonomous Sourcing Agent Orb" : "3D Global Sourcing Network & Route Arcs"}</span>
              </div>
              <div className="text-[11px] text-gray-500 font-mono">
                {active3DMode === "sphere" ? "Interactive Three.js Ribbed Mesh" : "Drag to Rotate Earth"}
              </div>
            </div>

            <div className="w-full h-80 sm:h-96 relative rounded-2xl bg-[#090c13] overflow-hidden flex items-center justify-center border border-white/[0.04]">
              {active3DMode === "sphere" ? (
                <AiSphere3D className="w-full h-full" isAnalyzing={true} />
              ) : (
                <GlobalGlobe height={380} />
              )}
            </div>
          </GlassPanel>
        </motion.div>
      </section>

      {/* CORE CAPABILITIES GRID (3D SPATIAL CARDS) */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest">End-to-End Procurement</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Architecture of a Complete Sourcing Engine
          </h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            From conversational requirement decomposition to mathematical optimization and commercial 5% fee settlement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <SpatialCard className="p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sky-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Verified Ground-Truth Suppliers</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Real manufacturing facilities across India, Vietnam, and China with audited certifications, factory locations, MOQs, and verifiable contact details. Zero synthetic records.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold pt-2">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Traceable Evidence Dossiers</span>
            </div>
          </SpatialCard>

          {/* Card 2 */}
          <SpatialCard className="p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sky-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Landed Economics & Customs</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Connect raw quote prices to delivered unit costs. Calculate ocean freight, customs tariffs, insurance, inland trucking, and port handling with sensitivity tipping points.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold pt-2">
              <TrendingUp className="w-4 h-4" />
              <span>Multi-Scenario Sensitivity Simulation</span>
            </div>
          </SpatialCard>

          {/* Card 3 */}
          <SpatialCard className="p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sky-400 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Operations Research MILP Solver</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Powered by Google OR-Tools. Mathematically solves multi-supplier order splits satisfying demand, factory capacity, binary MOQ coupling, and concentration limits.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold pt-2">
              <Sparkles className="w-4 h-4" />
              <span>Global Mathematical Optimality</span>
            </div>
          </SpatialCard>

          {/* Card 4 */}
          <SpatialCard className="p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sky-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Transparent 5% Success Fee</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Zero charges for discovery, searches, or quotation comparisons. SupplyLens charges a transparent 5% fee exclusively when you confirm an official contract or purchase order.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold pt-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Auditable Net 15 Invoices & Credit Notes</span>
            </div>
          </SpatialCard>

          {/* Card 5 */}
          <SpatialCard className="p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sky-400 flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Interactive 3D Sourcing Map</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Explore global industrial hubs spatially on a rotatable 3D Earth. Inspect flight & shipping arcs connecting manufacturing clusters to your local delivery hub.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold pt-2">
              <Layers className="w-4 h-4" />
              <span>Geoapify Coordinates Grounded</span>
            </div>
          </SpatialCard>

          {/* Card 6 */}
          <SpatialCard className="p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sky-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Conversational Sourcing Agent</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Grok-powered intelligence advisor contextualized with your business BOM requirements, target budgets, and local supply chain constraints in natural language.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold pt-2">
              <Sparkles className="w-4 h-4" />
              <span>Grounded in Real Factory Data</span>
            </div>
          </SpatialCard>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/[0.06] py-10 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-white">SupplyLens</span>
          <span>&bull; A global sourcing intelligence platform experienced in three dimensions.</span>
        </div>
        <div>
          <span>Three.js WebGL &bull; OR-Tools MILP &bull; Real Supplier Ground Truth</span>
        </div>
      </footer>
    </div>
  );
}
