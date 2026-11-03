"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { verifiedSuppliers } from "@/data/mockData";

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
// 3. CINEMA HERO LANDING PAGE
// ============================================================================
export const CinemaHeroLanding: React.FC = () => {
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
                href="/vendors"
                className="hover:text-white transition-colors"
              >
                Global Directory
              </Link>
              <Link
                href="/verification"
                className="hover:text-white transition-colors"
              >
                10-D Verification
              </Link>
              <Link
                href="/customer/deals"
                className="hover:text-white transition-colors"
              >
                Deals & RFQ
              </Link>
              <Link
                href="/dashboard"
                className="hover:text-white transition-colors"
              >
                Intelligence
              </Link>
            </div>

            {/* Right: "Start a Chat" button */}
            <Link
              href="/assistant"
              className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Start a Chat
            </Link>
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
                    href="/assistant"
                    className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center justify-center text-center text-sm md:text-base"
                  >
                    Start a Chat
                  </Link>
                  <Link
                    href="/dashboard"
                    className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-all inline-flex items-center justify-center text-center text-sm md:text-base"
                  >
                    Explore Now
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
          SUPPLYLENS PLATFORM SHOWCASE (Below the Hero for Comprehensive Exploration)
         ===================================================================== */}
      <section className="relative w-full bg-zinc-950 text-white py-24 px-6 md:px-12 lg:px-16 border-t border-white/10">
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

          {/* Interactive Command Center Showcase */}
          <div className="liquid-glass border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-2">
                Unified Sourcing Operating System
              </span>
              <h2 className="text-3xl md:text-5xl font-normal tracking-tight text-white mb-4">
                Global precision procurement, automated end-to-end.
              </h2>
              <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                SupplyLens bridges enterprise buyers with verified tier-1 manufacturers across North America, Europe, and Asia.
                Compare landed costs, audit compliance certifications, and execute direct RFQs in minutes.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="bg-white text-black px-8 py-3.5 rounded-xl font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                <span>Launch Sourcing Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/vendors"
                className="liquid-glass border border-white/20 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-white hover:text-black transition-all inline-flex items-center gap-2"
              >
                <span>Browse 61 Verified Vendors</span>
                <Globe className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 3 Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="liquid-glass border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">10-D Verification Desk</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Every factory partner is audited against ISO standards, chemical safety declarations, capacity telemetry, and export legality.
              </p>
              <Link
                href="/verification"
                className="text-white hover:text-gray-300 text-sm font-medium inline-flex items-center gap-1.5"
              >
                <span>Inspect Verification Process</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="liquid-glass border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-6">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">Landed Cost Simulator</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Calculate freight rates, import duties, customs tariffs, and warehouse transshipment across ocean, air, and ground lanes.
              </p>
              <Link
                href="/customer/deals"
                className="text-white hover:text-gray-300 text-sm font-medium inline-flex items-center gap-1.5"
              >
                <span>Simulate Landed Economics</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="liquid-glass border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">Autonomous AI Sourcing</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Conversational agents generate precise bills of materials, negotiate volume tiers, and match verified regional suppliers instantly.
              </p>
              <Link
                href="/assistant"
                className="text-white hover:text-gray-300 text-sm font-medium inline-flex items-center gap-1.5"
              >
                <span>Consult AI Agent</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
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
                href="/vendors"
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
                      href={`/vendors/${supplier.id}`}
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
    </div>
  );
};
