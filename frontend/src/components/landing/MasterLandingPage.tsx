"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  Layers,
  GitCompare,
  SlidersHorizontal,
  DollarSign,
  Maximize2,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Building2,
  Globe,
  TrendingUp,
  Cpu,
  BarChart3,
  Scale,
  Users,
  Lock,
  FileText,
  Clock,
  ChevronDown,
  Menu,
} from "lucide-react";
import { GlobalGlobe } from "@/components/3d/GlobalGlobe";
import { verifiedSuppliers } from "@/data/mockData";
import { authService } from "@/lib/auth";

const iosSpring = { type: "spring" as const, stiffness: 350, damping: 28 };
const iosQuick = { type: "spring" as const, stiffness: 450, damping: 30 };

export const MasterLandingPage: React.FC = () => {
  // Navigation & UI States
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeGalleryTab, setActiveGalleryTab] = useState<number>(0);
  const [lightboxImage, setLightboxImage] = useState<string>("/images/supplylens-dashboard-preview.webp");
  const [lightboxTitle, setLightboxTitle] = useState<string>("SupplyLens 3D Sourcing Dashboard");

  // Hero 3D Card Interactive Tilt
  const heroCardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);

  useEffect(() => {
    setIsLoggedIn(authService.getStoredUser() !== null);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroCardRef.current) return;
    const rect = heroCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = -((y - centerY) / centerY) * 5;
    const rotY = ((x - centerX) / centerX) * 5;
    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Gallery screenshots configuration
  const galleryScreens = [
    {
      id: "dashboard",
      tab: "dashboard",
      title: "3D Sourcing Command Center",
      badge: "CORE ENGINE",
      subtitle: "Multi-workspace orchestration, budget analytics & real-time telemetry",
      description: "Aggregates landed capital allocations across active purchase orders, models monthly variances, and surfaces 10-D audited factory partners.",
      image: "/images/supplylens-dashboard-preview.webp",
      route: "/dashboard",
    },
    {
      id: "suppliers",
      tab: "discover",
      title: "Global Supplier Directory",
      badge: "DISCOVERY",
      subtitle: "Deterministic filtering across factories, HS codes & raw material capabilities",
      description: "Live search by material and product with transparent MOQs, factory locations, quoted unit economics, and physical audit scores.",
      image: "/images/supplylens-suppliers-preview.webp",
      route: "/?tab=discover",
    },
    {
      id: "verification",
      tab: "verification",
      title: "10-Dimension Compliance Desk",
      badge: "COMPLIANCE",
      subtitle: "Factual evidence evaluation, regulatory filings & physical GIS audits",
      description: "Evaluates factories against 10 deterministic criteria with simulated dossiers and cryptographic audit records—zero hallucinated ratings.",
      image: "/images/supplylens-verification-preview.webp",
      route: "/?tab=verification",
    },
    {
      id: "billing",
      tab: "billing",
      title: "In-Dashboard Billing & 5% Fee Hub",
      badge: "COMMERCIAL",
      subtitle: "Transparent success-fee settlement exclusively on confirmed contracts",
      description: "Embedded right inside your dashboard. Features instant corporate UPI/Card settlement and cryptographic GST tax invoices.",
      image: "/images/supplylens-billing-preview.webp",
      route: "/?tab=billing",
    },
    {
      id: "economics",
      tab: "economics",
      title: "Landed Cost & Logistics Engine",
      badge: "ECONOMICS",
      subtitle: "Multi-modal freight corridors, duties, insurance & delivered unit costs",
      description: "Calculate transparent landed costs across ocean, air, and rail transit with automated duty schedules and volume tipping points.",
      image: "/images/supplylens-economics-preview.webp",
      route: "/?tab=economics",
    },
    {
      id: "optimization",
      tab: "optimization",
      title: "OR-Tools Multi-Supplier Solver",
      badge: "MATHEMATICAL SOLVER",
      subtitle: "Constrained procurement optimization balancing cost, MOQ & dual-sourcing risk",
      description: "Distribute production volume across primary and secondary backup suppliers while satisfying budget ceilings and delivery windows.",
      image: "/images/supplylens-optimization-preview.webp",
      route: "/?tab=optimization",
    },
  ];

  const openLightbox = (imgSrc: string, title: string) => {
    setLightboxImage(imgSrc);
    setLightboxTitle(title);
    setIsLightboxOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900 antialiased selection:bg-blue-600/20 selection:text-blue-900 font-sans">
      {/* =========================================================================
          SECTION 1 — MINIMAL STICKY NAVIGATION BAR
         ========================================================================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_16px_rgba(0,0,0,0.04)] py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-blue-600 group-hover:rotate-45 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 font-sans">
                Supply<span className="text-blue-600">Lens</span>
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60 shadow-inner">
            <a
              href="#showcase"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all"
            >
              Platform
            </a>
            <a
              href="#how-it-works"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all"
            >
              How It Works
            </a>
            <a
              href="#capabilities"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all"
            >
              Capabilities
            </a>
            <a
              href="#global"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all"
            >
              Global Reach
            </a>
            <a
              href="#workspace"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all"
            >
              Workspace
            </a>
            <a
              href="#trust"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all"
            >
              Trust & Transparency
            </a>
          </nav>

          {/* Right: Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {isLoggedIn ? (
              <motion.div whileTap={{ scale: 0.96 }} transition={iosQuick}>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                >
                  <span>Go to Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-full transition-colors"
                >
                  Sign In
                </Link>
                <motion.div whileTap={{ scale: 0.96 }} transition={iosQuick}>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Actions & Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href={isLoggedIn ? "/dashboard" : "/signup"}
              className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-xs"
            >
              {isLoggedIn ? "Dashboard" : "Get Started"}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Sheet */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-3"
            >
              <a
                href="#showcase"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 py-1"
              >
                Platform Showcase
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 py-1"
              >
                How It Works
              </a>
              <a
                href="#capabilities"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 py-1"
              >
                Capabilities
              </a>
              <a
                href="#global"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 py-1"
              >
                Global Sourcing
              </a>
              <a
                href="#workspace"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 py-1"
              >
                Workspace Gallery
              </a>
              <a
                href="#trust"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 py-1"
              >
                Trust & Transparency
              </a>
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/?login=true"
                  className="w-full py-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 text-center text-xs font-bold text-white bg-blue-600 rounded-xl shadow-xs"
                >
                  Start Sourcing
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* =========================================================================
          SECTION 2 & 3 — HERO SECTION & DASHBOARD PRODUCT SHOWCASE CENTERPIECE
         ========================================================================= */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Soft Ambient Light Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-blue-400/10 via-sky-300/10 to-indigo-400/5 blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={iosSpring}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-[11px] font-bold text-blue-700 uppercase tracking-widest mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Global Sourcing Intelligence</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...iosSpring, delay: 0.1 }}
            className="text-2xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.2] sm:leading-[1.08] max-w-4xl mx-auto font-sans px-2"
          >
            Find the right suppliers. <br />
            <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
              Build your business with confidence.
            </span>
          </motion.h1>

          {/* Concise Supporting Value Statement */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...iosSpring, delay: 0.2 }}
            className="mt-5 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed px-2"
          >
            Finding reliable suppliers shouldn&apos;t be the hardest part of building a business. SupplyLens helps you discover manufacturers, explore raw-material options, compare sourcing costs and make smarter procurement decisions with AI-powered intelligence.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...iosSpring, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
          >
            <motion.div whileTap={{ scale: 0.96 }} transition={iosQuick} className="w-full sm:w-auto">
              <Link
                href={isLoggedIn ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <span>{isLoggedIn ? "Open Sourcing Workspace" : "Get Started Free"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div whileTap={{ scale: 0.96 }} transition={iosQuick} className="w-full sm:w-auto">
              <a
                href="#showcase"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200/90 shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>Explore the Platform</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </a>
            </motion.div>
          </motion.div>

          {/* Trust Subtext */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-5 text-xs text-slate-500 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-medium"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>10-Dimension Physical Audits</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Zero Upfront Sourcing Fees</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              <span>Deterministic Landed Costs</span>
            </span>
          </motion.div>

          {/* =====================================================================
              MANDATORY HERO CENTERPIECE: REAL SUPPLYLENS DASHBOARD SCREENSHOT
             ===================================================================== */}
          <div id="showcase" className="mt-14 sm:mt-18 perspective-[1400px]">
            <motion.div
              ref={heroCardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transformStyle: "preserve-3d",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative max-w-6xl mx-auto rounded-3xl p-2 sm:p-3 bg-white/95 border border-slate-200/90 shadow-[0_24px_70px_-15px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.8)_inset] backdrop-blur-2xl group transition-shadow duration-300 hover:shadow-[0_32px_90px_-20px_rgba(37,99,235,0.18)]"
            >
              {/* Glossy Browser Chrome Bar */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
                  </div>
                  <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 ml-2">
                    https://supplylens.com/app/sourcing-workspace
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                    DEMO ENVIRONMENT · SAMPLE DATA
                  </span>
                  <button
                    onClick={() => openLightbox("/images/supplylens-dashboard-preview.webp", "SupplyLens 3D Sourcing Dashboard (Full Screen)")}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    title="Expand full high-resolution preview"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* The Actual Rendered Dashboard Preview */}
              <div
                onClick={() => openLightbox("/images/supplylens-dashboard-preview.webp", "SupplyLens 3D Sourcing Dashboard")}
                className="relative rounded-b-2xl overflow-hidden cursor-zoom-in bg-slate-900 group/img"
              >
                <Image
                  src="/images/supplylens-dashboard-preview.webp"
                  alt="SupplyLens 3D Global Sourcing Dashboard displaying active workspaces, landed budget analytics, neural intelligence sphere, and verified factory partners"
                  width={2560}
                  height={1440}
                  priority
                  className="w-full h-auto object-cover rounded-b-2xl transition-transform duration-500 group-hover/img:scale-[1.01]"
                />

                {/* Floating Interactive Callout Badges on Screenshot */}
                <div className="absolute top-4 left-4 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md text-xs font-semibold text-slate-800">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  <span>Interactive Sourcing Workspace · 4 Factory Allocations</span>
                </div>

                <div className="absolute bottom-5 right-5 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md text-xs font-semibold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>10-D Verified Suppliers (100 pts)</span>
                </div>

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="px-4 py-2 rounded-full bg-white/95 text-slate-900 text-xs font-bold shadow-xl flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Click to Expand High-Resolution Preview</span>
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="p-4 bg-white rounded-b-3xl border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">One workspace. Your entire sourcing journey.</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Explore suppliers, evaluate available information and manage your sourcing decisions through one connected platform.
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 shrink-0"
                >
                  <span>Launch Live Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4 — THE SOURCING PROBLEM
         ========================================================================= */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-widest block mb-2 font-mono">
              The Procurement Bottleneck
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Finding suppliers shouldn&apos;t slow down your business.
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Starting a business often means searching through disconnected directories, contacting multiple manufacturers and manually comparing prices, quantities and capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Challenge 1 */}
            <div className="p-7 rounded-3xl bg-slate-50/70 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-5">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Fragmented Supplier Discovery
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Finding relevant manufacturers and raw-material suppliers across different countries can be difficult, scattered across unverified catalogs and language barriers.
              </p>
            </div>

            {/* Challenge 2 */}
            <div className="p-7 rounded-3xl bg-slate-50/70 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Unclear Sourcing Information
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Price, MOQ, manufacturing capabilities and public business information may be spread across different sources with no verifiable physical audit trails.
              </p>
            </div>

            {/* Challenge 3 */}
            <div className="p-7 rounded-3xl bg-slate-50/70 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-5">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Difficult Procurement Decisions
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choosing suitable suppliers requires more than finding the cheapest listing. Businesses must evaluate product fit, quantity requirements, location and other constraints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5 — INTRODUCING SUPPLYLENS
         ========================================================================= */}
      <section className="py-20 md:py-28 bg-[#F7F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest block mb-2 font-mono">
              The Intelligent Solution
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A smarter way to approach global sourcing.
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              SupplyLens brings supplier discovery, sourcing intelligence and procurement decision support together in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Capability 1 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                Understand Your Business
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Describe your business idea and sourcing needs. SupplyLens helps translate them into structured product and raw-material requirements.
              </p>
            </div>

            {/* Capability 2 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                Discover Global Suppliers
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Explore relevant suppliers and manufacturers using structured search and available public business information across key manufacturing regions.
              </p>
            </div>

            {/* Capability 3 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-4">
                <GitCompare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                Compare Your Options
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Evaluate sourcing alternatives across price, MOQ, location, product relevance and available supplier evidence side by side.
              </p>
            </div>

            {/* Capability 4 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                Make Better Decisions
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Use AI-powered insights, compatibility analysis and sourcing optimization to understand your alternatives before committing capital.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6 — HOW IT WORKS
         ========================================================================= */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest block mb-2 font-mono">
              Simple 4-Step Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              From idea to informed sourcing decisions.
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              A structured workflow that guides you from natural-language concept to factory-ready procurement plans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/70 relative">
              <div className="text-2xl font-black text-blue-600/30 mb-2 font-mono">01</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Tell Us What You&apos;re Building</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Describe your business, product, target market and initial volume. SupplyLens decomposes ideas into structured BOM specifications.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/70 relative">
              <div className="text-2xl font-black text-blue-600/30 mb-2 font-mono">02</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Discover Relevant Suppliers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Explore matched supplier candidates across India, Vietnam, and global manufacturing clusters based on your exact requirements.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/70 relative">
              <div className="text-2xl font-black text-blue-600/30 mb-2 font-mono">03</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Compare Supplier Options</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review available factory quotes, minimum order quantities (MOQs), delivery lead times, and deterministic physical audit scores.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/70 relative">
              <div className="text-2xl font-black text-blue-600/30 mb-2 font-mono">04</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Optimize Your Sourcing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Distribute batch production across primary and secondary backup suppliers while balancing cost, budget caps and delivery dates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7 — PRODUCT CAPABILITIES
         ========================================================================= */}
      <section id="capabilities" className="py-20 md:py-28 bg-[#F7F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest block mb-2 font-mono">
              Comprehensive Feature Set
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              One platform. Multiple sourcing capabilities.
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Every capability you need to move from an early idea to reliable commercial contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 w-fit mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">AI-Powered Requirement Understanding</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Convert natural-language business concepts into structured material specs, HS code classifications, and manufacturing readiness criteria.
              </p>
            </div>

            {/* 2 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 w-fit mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Global Supplier Discovery</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Explore candidate manufacturers across packaging, apparel, electronics, and precision components with instant capability filters.
              </p>
            </div>

            {/* 3 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 w-fit mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Supplier Intelligence</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Review available company registrations, production floor capabilities, physical plant coordinates, and verified factory contact desks.
              </p>
            </div>

            {/* 4 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 w-fit mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Evidence-Based Verification</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Understand which supplier details are supported by physical audits and which still need confirmation before sending POs.
              </p>
            </div>

            {/* 5 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 w-fit mb-4">
                <GitCompare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Supplier Comparison</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Side-by-side matrices comparing up to 5 manufacturers across quoted prices, volume tiers, ISO certifications, and verified capacity.
              </p>
            </div>

            {/* 6 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 w-fit mb-4">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Sourcing Optimization</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Evaluate quantities, budgets, and minimum order requirements using mathematical optimization where sufficient data exists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8 — GLOBAL SOURCING 3D VISUALIZATION
         ========================================================================= */}
      <section id="global" className="py-20 md:py-28 bg-white border-y border-slate-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Description */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest font-mono">
                Cross-Border Sourcing
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Think beyond borders. Source globally.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Explore suppliers and manufacturing opportunities across verified industrial corridors in India, Vietnam, Thailand, and Southeast Asia.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Geographic Supplier Markers</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Physical GIS location verified against commercial enterprise registries.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Multi-Modal Freight Corridors</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Calculate ocean container and air freight transit times directly to your warehouse.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/?tab=discover"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition-colors"
                >
                  <span>Explore Supplier Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right: Live Interactive 3D Globe */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <div className="w-full max-w-lg aspect-square rounded-3xl bg-gradient-to-b from-slate-50 to-blue-50/30 border border-slate-200/80 p-4 shadow-sm flex flex-col items-center justify-center relative">
                <div className="w-full flex items-center justify-between px-3 text-xs text-slate-500 mb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>3D Sourcing Geography</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Drag to rotate</span>
                </div>

                <div className="w-full flex-1 relative flex items-center justify-center">
                  <GlobalGlobe suppliers={verifiedSuppliers} height={380} />
                </div>

                <div className="w-full pt-2 text-center text-[11px] text-slate-400">
                  *Illustrative sample locations shown for demo purposes
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9 — SMARTER SOURCING DECISIONS
         ========================================================================= */}
      <section className="py-20 md:py-28 bg-[#F7F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest block mb-2 font-mono">
              Decision Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Don&apos;t just find suppliers. Understand your options.
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Supplier selection involves more than comparing base prices. Evaluate the trade-offs between cost, minimum quantities, manufacturing capabilities, location and sourcing constraints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-blue-600 text-xs font-mono font-bold mb-1">01 / ECONOMICS</div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Delivered Landed Cost</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect raw factory quotes to freight, duties, customs clearance, and local transit. Never get surprised by unexpected landed surcharges.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-emerald-600 text-xs font-mono font-bold mb-1">02 / CAPITAL</div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">MOQ Sensitivity Analysis</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Understand inventory break-evens. See where volume price breaks justify higher orders and where low MOQ preserves essential cash runway.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-indigo-600 text-xs font-mono font-bold mb-1">03 / CONTINUITY</div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Dual-Sourcing Allocation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mitigate single-point-of-failure risks by splitting pilot runs between primary volume factories and secondary local backup providers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-amber-600 text-xs font-mono font-bold mb-1">04 / AUDIT</div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Compliance & Readiness</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Score candidate manufacturers on 10 deterministic criteria before signing agreements, issuing purchase orders, or transferring escrow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10 — THE WEB APPLICATION: INTERACTIVE PRODUCT GALLERY
         ========================================================================= */}
      <section id="workspace" className="py-20 md:py-28 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest block mb-2 font-mono">
              Working Software Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Meet your sourcing workspace.
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              SupplyLens gives entrepreneurs a connected workspace to manage business requirements, explore suppliers, compare alternatives and make more informed sourcing decisions.
            </p>
          </div>

          {/* iOS Segmented Tabs for Gallery */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 max-w-3xl mx-auto mb-10 border border-slate-200/80">
            {galleryScreens.map((screen, idx) => (
              <button
                key={screen.id}
                onClick={() => setActiveGalleryTab(idx)}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeGalleryTab === idx
                    ? "text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {activeGalleryTab === idx && (
                  <motion.div
                    layoutId="activeGalleryTabPill"
                    transition={iosSpring}
                    className="absolute inset-0 bg-white rounded-xl shadow-xs"
                  />
                )}
                <span className="relative z-10">{screen.badge}</span>
              </button>
            ))}
          </div>

          {/* Active Screen Display */}
          {galleryScreens[activeGalleryTab] && (
            <motion.div
              key={galleryScreens[activeGalleryTab].id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={iosSpring}
              className="max-w-5xl mx-auto rounded-3xl bg-slate-50 border border-slate-200/80 shadow-md p-3 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {galleryScreens[activeGalleryTab].title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                      {galleryScreens[activeGalleryTab].badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {galleryScreens[activeGalleryTab].subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      openLightbox(
                        galleryScreens[activeGalleryTab].image,
                        galleryScreens[activeGalleryTab].title
                      )
                    }
                    className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 shadow-xs transition-colors"
                    title="Expand image"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href={galleryScreens[activeGalleryTab].route}
                    className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <span>Open in Live App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* High-Resolution Screenshot Frame */}
              <div
                onClick={() =>
                  openLightbox(
                    galleryScreens[activeGalleryTab].image,
                    galleryScreens[activeGalleryTab].title
                  )
                }
                className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900 cursor-zoom-in group shadow-inner"
              >
                <Image
                  src={galleryScreens[activeGalleryTab].image}
                  alt={galleryScreens[activeGalleryTab].title}
                  width={2560}
                  height={1440}
                  className="w-full h-auto object-cover rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="px-4 py-2 rounded-full bg-white text-slate-900 text-xs font-bold shadow-lg flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Zoom High-Resolution View</span>
                  </span>
                </div>
              </div>

              {/* Description footer */}
              <p className="text-xs text-slate-600 mt-4 px-2 leading-relaxed">
                {galleryScreens[activeGalleryTab].description}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 11 — WHO IS SUPPLYLENS FOR?
         ========================================================================= */}
      <section className="py-20 md:py-28 bg-[#F7F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest block mb-2 font-mono">
              Designed For Builders
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built for people building businesses.
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Whether you are launching your first physical SKU or optimizing established container supply chains.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">First-Time Entrepreneurs</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Discover sourcing options without depending entirely on an existing supplier network or expensive middleman brokers.
              </p>
            </div>

            {/* 2 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">D2C & E-Commerce Brands</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Explore verified packaging, textiles, and hardware manufacturers with transparent unit economics and lower pilot MOQs.
              </p>
            </div>

            {/* 3 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Growing SMBs</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Compare supplier quotes side-by-side and organize structured procurement requirements across multiple teams.
              </p>
            </div>

            {/* 4 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Procurement Teams</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bring supplier research, factory verification audits, and mathematical order allocation into a single unified workspace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 12 — TRUST AND TRANSPARENCY
         ========================================================================= */}
      <section id="trust" className="py-20 md:py-28 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest block mb-2 font-mono">
              Factual Verification Standard
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Better decisions start with better information.
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              SupplyLens distinguishes between available source information, verified evidence, missing details and analytical recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Source-Linked Information</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every factual claim links directly to official commercial registry filings, customs manifests, or verified factory submissions.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">10-D Deterministic Audits</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Suppliers are evaluated on 10 deterministic dimensions including physical GIS presence, machinery, tax IDs, and certifications.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Published vs Estimated Prices</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Clear visual indicators separate binding manufacturer quotes from algorithmic estimates and benchmark industry averages.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Zero Invented Contacts</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                We never fabricate email addresses, factory owners, or unverified claims. Missing data is clearly declared as &ldquo;unverified.&rdquo;
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Transparent 5% Success Fee</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Zero fees for searching, browsing, or comparing quotes. You only pay a 5% success fee upon confirmed pre-tax contract awards.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Traceable Sourcing Log</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cryptographic audit trails track contract confirmations, tax invoice issues, and settlement records with tamper-proof SHA-256 hashes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 13 — FINAL CONVERSION CALL TO ACTION
         ========================================================================= */}
      <section className="py-24 bg-gradient-to-b from-[#F7F9FC] to-blue-50/30 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
          <div className="w-14 h-14 rounded-3xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25 mb-2">
            <Compass className="w-7 h-7" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Your next business deserves a smarter way to source.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Start with your idea. Explore supplier options. Make informed sourcing decisions with SupplyLens.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <motion.div whileTap={{ scale: 0.96 }} transition={iosQuick}>
              <Link
                href={isLoggedIn ? "/dashboard" : "/signup"}
                className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-xl shadow-blue-500/30 flex items-center gap-2 transition-all"
              >
                <span>{isLoggedIn ? "Open Your Sourcing Workspace" : "Get Started with SupplyLens"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div whileTap={{ scale: 0.96 }} transition={iosQuick}>
              <Link
                href="/vendors"
                className="px-8 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200/90 shadow-sm transition-all"
              >
                <span>Explore Verified Vendors</span>
              </Link>
            </motion.div>
          </div>

          <div className="pt-4 text-xs text-slate-400 font-mono">
            Free discovery & comparison • No credit card required to explore
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 14 — FOOTER
         ========================================================================= */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
          <div className="space-y-3 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-900">
                Supply<span className="text-blue-600">Lens</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              AI-Powered Global Sourcing Intelligence for Entrepreneurs. Discover verified factories, evaluate landed economics, and make smarter procurement decisions.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>DEMO ENVIRONMENT · SAMPLE DATA</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Platform</h4>
              <ul className="space-y-1.5 text-slate-600">
                <li><Link href="/dashboard" className="hover:text-blue-600 transition-colors">3D Dashboard</Link></li>
                <li><Link href="/?tab=discover" className="hover:text-blue-600 transition-colors">Supplier Directory</Link></li>
                <li><Link href="/?tab=verification" className="hover:text-blue-600 transition-colors">10-D Verification Desk</Link></li>
                <li><Link href="/?tab=economics" className="hover:text-blue-600 transition-colors">Landed Economics</Link></li>
                <li><Link href="/?tab=optimization" className="hover:text-blue-600 transition-colors">Optimization Solver</Link></li>
                <li><Link href="/?tab=billing" className="hover:text-blue-600 transition-colors">Billing & 5% Fee Hub</Link></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Governance</h4>
              <ul className="space-y-1.5 text-slate-600">
                <li><span className="text-slate-500">10-D Audit Framework</span></li>
                <li><span className="text-slate-500">5.0% Success Fee Policy</span></li>
                <li><span className="text-slate-500">Source Provenance</span></li>
                <li><span className="text-slate-500">Cryptographic Logs</span></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-1.5 text-slate-600">
                <li><span className="text-slate-500 hover:text-slate-700 cursor-pointer">Privacy Policy</span></li>
                <li><span className="text-slate-500 hover:text-slate-700 cursor-pointer">Terms of Service</span></li>
                <li><span className="text-slate-500 hover:text-slate-700 cursor-pointer">Security Standards</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} SupplyLens Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Physical Audits Grounded</span>
            <span>•</span>
            <span>Deterministic Landed Costs</span>
            <span>•</span>
            <span>10-Dimension Verification</span>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          HIGH-RESOLUTION SCREENSHOT LIGHTBOX MODAL
         ========================================================================= */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={iosSpring}
              className="bg-white rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-white/20"
            >
              {/* Lightbox Topbar */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h4 className="text-sm font-bold text-slate-900">{lightboxTitle}</h4>
                  <span className="text-[11px] font-mono text-slate-400">2560 × 1440 HD</span>
                </div>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lightbox Image Container */}
              <div className="flex-1 overflow-auto p-4 bg-slate-900 flex items-center justify-center">
                <Image
                  src={lightboxImage}
                  alt={lightboxTitle}
                  width={2560}
                  height={1440}
                  className="w-full h-auto max-h-[75vh] object-contain rounded-xl shadow-2xl"
                />
              </div>

              {/* Lightbox Footer */}
              <div className="px-6 py-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
                <span>Real SupplyLens Production Environment Screenshot</span>
                <Link
                  href="/dashboard"
                  className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Launch Live Platform</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
