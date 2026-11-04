"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Globe,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Building2,
  Lock,
  Boxes,
  Maximize2,
  X,
  Eye,
  BarChart3,
  Receipt,
} from "lucide-react";
import { verifiedSuppliers } from "@/data/mockData";
import { authService, AuthUser } from "@/lib/auth";

// ============================================================================
// 1. FADE-IN COMPONENT (As specified: configurable delay & duration)
// ============================================================================
interface FadeInProps {
  children: React.ReactNode;
  delay?: number; // ms
  duration?: number; // ms
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 1000,
  className = "",
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ease-out ${visible ? "opacity-100" : "opacity-0"} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

// ============================================================================
// 2. ANIMATED HEADING COMPONENT (Character-by-character entrance animation)
// ============================================================================
interface AnimatedHeadingProps {
  text: string;
  className?: string;
}

export const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({
  text,
  className = "text-[34px] sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-normal mb-4 text-white",
}) => {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    // Whole animation starts after 200ms initial delay
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const lines = text.split("\n");
  const charDelay = 30; // 30ms per character

  return (
    <h1
      className={className}
      style={{ letterSpacing: "-0.04em", lineHeight: 1.08 }}
    >
      {lines.map((line, lineIndex) => {
        const lineLength = line.length;
        const words = line.split(" ");
        let runningCharIndex = 0;

        return (
          <span key={lineIndex} className="block">
            {words.map((word, wordIndex) => {
              const wordChars = word.split("");
              const wordStartIndex = runningCharIndex;
              runningCharIndex += wordChars.length + 1; // +1 for the space

              return (
                <React.Fragment key={wordIndex}>
                  <span className="inline-block whitespace-nowrap">
                    {wordChars.map((char, cIdx) => {
                      const charIndex = wordStartIndex + cIdx;
                      const delay = (lineIndex * lineLength * charDelay) + (charIndex * charDelay);

                      return (
                        <span
                          key={cIdx}
                          className="inline-block transition-all ease-out"
                          style={{
                            opacity: isAnimated ? 1 : 0,
                            transform: isAnimated ? "translateX(0px)" : "translateX(-18px)",
                            transitionDuration: "500ms",
                            transitionDelay: `${delay}ms`,
                          }}
                        >
                          {char}
                        </span>
                      );
                    })}
                  </span>
                  {wordIndex < words.length - 1 && (
                    <span
                      className="inline-block transition-all ease-out"
                      style={{
                        opacity: isAnimated ? 1 : 0,
                        transform: isAnimated ? "translateX(0px)" : "translateX(-18px)",
                        transitionDuration: "500ms",
                        transitionDelay: `${(lineIndex * lineLength * charDelay) + ((wordStartIndex + wordChars.length) * charDelay)}ms`,
                      }}
                    >
                      {"\u00A0"}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
};

// ============================================================================
// 3. DASHBOARD GALLERY SCREENS CONFIGURATION
// ============================================================================
const galleryScreens = [
  {
    id: "dashboard",
    title: "3D Sourcing Command Center",
    badge: "CORE ENGINE",
    subtitle: "Multi-workspace orchestration, real-time clock telemetry & 3D global globe",
    description: "Aggregates landed capital allocations across active purchase orders, models monthly variances, and surfaces 10-D audited factory partners worldwide.",
    image: "/images/supplylens-dashboard-preview.png",
    route: "/dashboard",
  },
  {
    id: "suppliers",
    title: "Global Supplier Directory",
    badge: "61 FACTORIES",
    subtitle: "Worldwide supplier network across North America, Europe, Asia, and Australia",
    description: "Search 61 verified manufacturing partners across 16 countries, filter by country and MOQ, and compare factory quotes in real time.",
    image: "/images/supplylens-suppliers-preview.png",
    route: "/vendors",
  },
  {
    id: "verification",
    title: "10-D Factory Verification Desk",
    badge: "10-D AUDIT",
    subtitle: "Zero-fraud automated compliance auditing & capacity validation",
    description: "Audits factory partners against ISO quality management, environmental standards, export legality, and live video audit telemetry.",
    image: "/images/supplylens-verification-preview.png",
    route: "/verification",
  },
  {
    id: "economics",
    title: "Landed Cost & Economics Engine",
    badge: "LANDED SIMULATOR",
    subtitle: "End-to-end freight, tariff, duty, and currency modeling",
    description: "Simulates full delivery landed costs across ocean, air, and ground lanes with automatic HS code tariff lookups and volume tiered discounts.",
    image: "/images/supplylens-economics-preview.png",
    route: "/customer/deals",
  },
  {
    id: "billing",
    title: "Commercial Settlement & Invoicing",
    badge: "SETTLEMENT",
    subtitle: "Transparent 5% success fee with automated GST / tax invoices",
    description: "Enterprise payment gateway supporting UPI, card, and escrow settlement with instant PDF tax invoice generation and verified transaction receipts.",
    image: "/images/supplylens-billing-preview.png",
    route: "/billing",
  },
];

// ============================================================================
// 4. MAIN CINEMA HERO LANDING PAGE
// ============================================================================
export const CinemaHeroLanding: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeGalleryTab, setActiveGalleryTab] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<string>("/images/supplylens-dashboard-preview.png");
  const [lightboxTitle, setLightboxTitle] = useState<string>("SupplyLens Sourcing Command Center");

  useEffect(() => {
    const user = authService.getStoredUser();
    setCurrentUser(user);
  }, []);

  const openLightbox = (imgSrc: string, title: string) => {
    setLightboxImage(imgSrc);
    setLightboxTitle(title);
    setIsLightboxOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* =====================================================================
          HERO VIEWPORT CONTAINER (Full Screen Viewport with Video Background)
         ===================================================================== */}
      <section className="relative w-full h-screen min-h-[640px] flex flex-col justify-between overflow-hidden">
        {/* Full-screen background video: raw, no dimming overlay */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* -------------------------------------------------------------------
            NAVBAR (Liquid Glass)
           ------------------------------------------------------------------- */}
        <header className="relative z-10 w-full px-6 md:px-12 lg:px-16 pt-6">
          <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between border border-white/10">
            {/* Left: Logo text */}
            <Link
              href="/"
              className="text-2xl font-semibold tracking-tight text-white hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span>SUPPLYLENS</span>
            </Link>

            {/* Center: Links (hidden on mobile, visible md+) */}
            <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
              <Link
                href={currentUser ? "/vendors" : "/login?redirect=/vendors"}
                className="hover:text-white transition-colors"
              >
                Global Directory
              </Link>
              <Link
                href={currentUser ? "/verification" : "/login?redirect=/verification"}
                className="hover:text-white transition-colors"
              >
                10-D Verification
              </Link>
              <Link
                href={currentUser ? "/customer/deals" : "/login?redirect=/customer/deals"}
                className="hover:text-white transition-colors"
              >
                Deals & RFQ
              </Link>
              <Link
                href={currentUser ? "/dashboard" : "/login?redirect=/dashboard"}
                className="hover:text-white transition-colors"
              >
                Intelligence
              </Link>
            </div>

            {/* Right: Auth-aware action buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {currentUser ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium text-white transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px]">
                      {currentUser.name.charAt(0)}
                    </div>
                    <span className="hidden sm:inline">{currentUser.name}</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="bg-white text-black px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={async () => {
                      await authService.signOut();
                      setCurrentUser(null);
                      window.location.reload();
                    }}
                    className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer px-1.5 py-1"
                    title="Sign Out"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-white text-xs sm:text-sm font-medium px-3 py-1.5 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login?redirect=/dashboard"
                    className="bg-white text-black px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Launch Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </header>

        {/* -------------------------------------------------------------------
            HERO CONTENT (Bottom of viewport)
           ------------------------------------------------------------------- */}
        <div className="relative z-10 w-full px-6 md:px-12 lg:px-16 flex-1 flex flex-col justify-end pb-12 lg:pb-16">
          <div className="lg:grid lg:grid-cols-[1.25fr_0.75fr] lg:items-end gap-8">
            {/* Left Column - Main content */}
            <div>
              {/* Character-by-character animated heading */}
              <AnimatedHeading text={"Shaping tomorrow\nwith vision and action."} />

              {/* Subheading: starts at 800ms delay, 1000ms duration */}
              <FadeIn delay={800} duration={1000}>
                <p className="text-base md:text-lg text-gray-300 mb-5 max-w-xl leading-relaxed">
                  We back visionaries and craft intelligent global supply chains that define what comes next.
                </p>
              </FadeIn>

              {/* Buttons row: starts at 1200ms delay, 1000ms duration */}
              <FadeIn delay={1200} duration={1000}>
                <div className="flex flex-wrap gap-4 items-center">
                  <Link
                    href={currentUser ? "/assistant" : "/login?redirect=/assistant"}
                    className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center justify-center text-center text-sm md:text-base"
                  >
                    {currentUser ? "Start a Chat" : "Sign In to Access"}
                  </Link>
                  <Link
                    href={currentUser ? "/dashboard" : "/login?redirect=/dashboard"}
                    className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-all inline-flex items-center justify-center text-center text-sm md:text-base"
                  >
                    {currentUser ? "Explore Now" : "Launch Workspace"}
                  </Link>
                </div>
              </FadeIn>
            </div>

            {/* Right Column - Tag: starts at 1400ms delay, 1000ms duration */}
            <div className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
              <FadeIn delay={1400} duration={1000}>
                <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl inline-block shadow-2xl">
                  <span className="text-lg md:text-xl lg:text-2xl font-light text-white tracking-wide">
                    Sourcing. Verification. Intelligence.
                  </span>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SUPPLYLENS PLATFORM SHOWCASE (With Real Dashboard Images)
         ===================================================================== */}
      <section id="cockpit-showcase" className="relative w-full bg-zinc-950 text-white py-24 px-6 md:px-12 lg:px-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto space-y-20">
          {/* Key Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="liquid-glass border border-white/10 rounded-2xl p-6">
              <div className="text-3xl md:text-4xl font-light text-white mb-1">61</div>
              <div className="text-xs uppercase tracking-wider text-gray-400">Verified Global Factories</div>
            </div>
            <div className="liquid-glass border border-white/10 rounded-2xl p-6">
              <div className="text-3xl md:text-4xl font-light text-white mb-1">16</div>
              <div className="text-xs uppercase tracking-wider text-gray-400">Manufacturing Hubs</div>
            </div>
            <div className="liquid-glass border border-white/10 rounded-2xl p-6">
              <div className="text-3xl md:text-4xl font-light text-white mb-1">10-D</div>
              <div className="text-xs uppercase tracking-wider text-gray-400">Factory Audit Standard</div>
            </div>
            <div className="liquid-glass border border-white/10 rounded-2xl p-6">
              <div className="text-3xl md:text-4xl font-light text-white mb-1">0%</div>
              <div className="text-xs uppercase tracking-wider text-gray-400">Upfront Sourcing Fee</div>
            </div>
          </div>

          {/* =================================================================
              MANDATORY CENTERPIECE: REAL DASHBOARD IMAGE IN LIVE COCKPIT FRAME
             ================================================================= */}
          <div className="liquid-glass border border-white/10 rounded-3xl p-6 sm:p-10 md:p-12 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
              <div className="max-w-2xl">
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-400 block mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  Live Operational Cockpit Preview
                </span>
                <h2 className="text-3xl md:text-5xl font-normal tracking-tight text-white mb-3">
                  Global precision procurement, automated end-to-end.
                </h2>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  Real-time telemetry showing verified factory partners, live currency conversion, interactive 3D globe visualization, and 10-D factory audits.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 shrink-0">
                <Link
                  href={currentUser ? "/dashboard" : "/login?redirect=/dashboard"}
                  className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2 text-sm"
                >
                  <span>{currentUser ? "Launch Live Dashboard" : "Sign In to Access"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => openLightbox("/images/supplylens-dashboard-preview.png", "3D Sourcing Command Center")}
                  className="liquid-glass border border-white/20 text-white px-5 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors inline-flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4 text-gray-300" />
                  <span>Zoom Screenshot</span>
                </button>
              </div>
            </div>

            {/* High-Resolution Real Dashboard Screenshot Frame */}
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] group">
              {/* Browser Window Chrome Header */}
              <div className="px-4 py-3 bg-zinc-900/90 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="text-xs font-mono text-gray-400 ml-2 hidden sm:inline">
                    https://supplylenss.vercel.app/dashboard • SupplyLens Operational Command Center
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Production Telemetry
                  </span>
                  <button
                    onClick={() => openLightbox("/images/supplylens-dashboard-preview.png", "3D Sourcing Command Center")}
                    className="p-1 rounded-md text-gray-400 hover:text-white transition-colors"
                    title="Fullscreen Preview"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* The Real Dashboard Image */}
              <div
                onClick={() => openLightbox("/images/supplylens-dashboard-preview.png", "3D Sourcing Command Center")}
                className="relative cursor-zoom-in overflow-hidden"
              >
                <Image
                  src="/images/supplylens-dashboard-preview.png"
                  alt="SupplyLens Real Sourcing Command Center Dashboard"
                  width={2560}
                  height={1600}
                  priority
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.008]"
                />
                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="px-4 py-2 rounded-xl bg-black/80 backdrop-blur-md text-white text-xs font-medium border border-white/20 shadow-xl flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-blue-400" />
                    Click to Inspect High-Resolution Dashboard
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================
              MULTI-SCREEN COCKPIT GALLERY: EXPLORE ALL PLATFORM INTERFACES
             ================================================================= */}
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-2">
                Complete Sourcing Suite
              </span>
              <h3 className="text-2xl md:text-4xl font-normal text-white mb-3">
                Explore The SupplyLens Workspace
              </h3>
              <p className="text-sm text-gray-400">
                Click across the interfaces below to view high-definition previews of each integrated sourcing tool.
              </p>
            </div>

            {/* Gallery Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 max-w-3xl mx-auto">
              {galleryScreens.map((screen, idx) => (
                <button
                  key={screen.id}
                  onClick={() => setActiveGalleryTab(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeGalleryTab === idx
                      ? "bg-white text-black font-semibold shadow-md"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {screen.title}
                </button>
              ))}
            </div>

            {/* Active Gallery Screen Container */}
            {galleryScreens[activeGalleryTab] && (
              <div className="liquid-glass border border-white/10 rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-medium text-white">
                        {galleryScreens[activeGalleryTab].title}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-mono border border-white/15">
                        {galleryScreens[activeGalleryTab].badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
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
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title="Expand screenshot"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={currentUser ? galleryScreens[activeGalleryTab].route : `/login?redirect=${encodeURIComponent(galleryScreens[activeGalleryTab].route)}`}
                      className="px-4 py-2 rounded-xl bg-white text-black text-xs font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{currentUser ? "Open in App" : "Sign In to Access"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* The Interactive Screenshot */}
                <div
                  onClick={() =>
                    openLightbox(
                      galleryScreens[activeGalleryTab].image,
                      galleryScreens[activeGalleryTab].title
                    )
                  }
                  className="relative rounded-2xl overflow-hidden border border-white/15 bg-black cursor-zoom-in group shadow-xl"
                >
                  <Image
                    src={galleryScreens[activeGalleryTab].image}
                    alt={galleryScreens[activeGalleryTab].title}
                    width={2560}
                    height={1600}
                    className="w-full h-auto object-cover rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                  <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-3.5 py-1.5 rounded-lg bg-black/80 backdrop-blur-md text-white text-xs font-medium border border-white/20 shadow-md flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" />
                      Click to Expand View
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                  {galleryScreens[activeGalleryTab].description}
                </p>
              </div>
            )}
          </div>

          {/* =================================================================
              3 CORE PILLARS WITH IMAGE THUMBNAILS
             ================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            {/* Pillar 1 */}
            <div className="liquid-glass border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">10-D Verification Desk</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">
                  Every factory partner is audited against ISO standards, chemical safety declarations, capacity telemetry, and export legality.
                </p>
              </div>

              <div>
                <div
                  onClick={() => openLightbox("/images/supplylens-verification-preview.png", "10-D Verification Desk")}
                  className="rounded-xl overflow-hidden border border-white/10 bg-black/50 mb-4 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Image
                    src="/images/supplylens-verification-preview.png"
                    alt="10-D Verification Desk"
                    width={800}
                    height={500}
                    className="w-full h-32 object-cover object-top"
                  />
                </div>
                <Link
                  href={currentUser ? "/verification" : "/login?redirect=/verification"}
                  className="text-white hover:text-gray-300 text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <span>Inspect Verification Process</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="liquid-glass border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-4">
                  <Boxes className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Landed Cost Simulator</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">
                  Calculate freight rates, import duties, customs tariffs, and warehouse transshipment across ocean, air, and ground lanes.
                </p>
              </div>

              <div>
                <div
                  onClick={() => openLightbox("/images/supplylens-economics-preview.png", "Landed Cost Simulator")}
                  className="rounded-xl overflow-hidden border border-white/10 bg-black/50 mb-4 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Image
                    src="/images/supplylens-economics-preview.png"
                    alt="Landed Cost Simulator"
                    width={800}
                    height={500}
                    className="w-full h-32 object-cover object-top"
                  />
                </div>
                <Link
                  href={currentUser ? "/customer/deals" : "/login?redirect=/customer/deals"}
                  className="text-white hover:text-gray-300 text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <span>Simulate Landed Economics</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="liquid-glass border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-4">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Commercial Billing & Invoicing</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">
                  Enterprise settlement gateway supporting multi-currency payments, escrow transactions, and automated PDF tax invoices.
                </p>
              </div>

              <div>
                <div
                  onClick={() => openLightbox("/images/supplylens-billing-preview.png", "Commercial Billing & Invoices")}
                  className="rounded-xl overflow-hidden border border-white/10 bg-black/50 mb-4 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Image
                    src="/images/supplylens-billing-preview.png"
                    alt="Commercial Billing & Invoices"
                    width={800}
                    height={500}
                    className="w-full h-32 object-cover object-top"
                  />
                </div>
                <Link
                  href={currentUser ? "/billing" : "/login?redirect=/billing"}
                  className="text-white hover:text-gray-300 text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <span>View Commercial Settlement</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Featured Global Manufacturers Preview */}
          <div className="border-t border-white/10 pt-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-2">
                  Audited Production Partners
                </span>
                <h3 className="text-2xl md:text-3xl font-normal text-white">
                  Worldwide Supplier Network
                </h3>
              </div>
              <Link
                href={currentUser ? "/vendors" : "/login?redirect=/vendors"}
                className="mt-4 md:mt-0 text-sm text-gray-300 hover:text-white transition-colors inline-flex items-center gap-2"
              >
                <span>Explore all 61 factories in 16 countries</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {verifiedSuppliers.slice(0, 6).map((supplier) => (
                <div
                  key={supplier.id}
                  className="liquid-glass border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
                        {supplier.country}
                      </span>
                      <span className="text-xs text-gray-400">
                        MOQ: {supplier.products[0]?.moq || 500}
                      </span>
                    </div>
                    <h4 className="text-lg font-medium text-white mb-1.5">
                      {supplier.name}
                    </h4>
                    <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                      {supplier.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-300">
                      From ${supplier.products[0]?.quotedPrice || 0.10} / {supplier.products[0]?.unit || "unit"}
                    </span>
                    <Link
                      href={currentUser ? `/vendors/${supplier.id}` : `/login?redirect=${encodeURIComponent(`/vendors/${supplier.id}`)}`}
                      className="text-xs text-white hover:underline inline-flex items-center gap-1"
                    >
                      <span>View Factory</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-white/10 pt-12 pb-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold tracking-tight text-sm">SUPPLYLENS</span>
              <span>— Global Autonomous Sourcing Platform</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="hover:text-white transition-colors">Command Center</Link>
              <Link href="/vendors" className="hover:text-white transition-colors">Directory</Link>
              <Link href="/verification" className="hover:text-white transition-colors">10-D Verification</Link>
              <Link href="/billing" className="hover:text-white transition-colors">Commercial Settlement</Link>
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            </div>
          </footer>
        </div>
      </section>

      {/* =====================================================================
          LIGHTBOX MODAL FOR FULLSCREEN DASHBOARD SCREENSHOT INSPECTION
         ===================================================================== */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="relative max-w-6xl w-full bg-zinc-900 border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Lightbox Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/80">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  {lightboxTitle}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={currentUser ? "/dashboard" : "/login?redirect=/dashboard"}
                  className="px-3 py-1 rounded-lg bg-white text-black text-xs font-semibold hover:bg-gray-100 transition-colors"
                >
                  {currentUser ? "Open Live App" : "Sign In to Access"}
                </Link>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lightbox Image View */}
            <div className="overflow-auto p-4 flex items-center justify-center bg-black">
              <Image
                src={lightboxImage}
                alt={lightboxTitle}
                width={2560}
                height={1600}
                className="max-h-[75vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
