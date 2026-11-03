"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe,
  Boxes,
  ShieldCheck,
  DollarSign,
  ChevronRight,
  ArrowRight,
  Compass,
} from "lucide-react";

export const FreightScrollHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lastBlockRef = useRef<HTMLDivElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const track = trackRef.current;
    if (!video || !track) return;

    let targetTime = 0;
    let curTime = 0;
    let animId: number;

    const onLoadedMetadata = () => {
      setIsLoaded(true);
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);

    const handleScroll = () => {
      if (!track || !video.duration) return;
      const rect = track.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const trackTop = -rect.top;
      const totalScrollable = rect.height - viewportHeight;

      if (totalScrollable <= 0) return;

      const p = Math.max(0, Math.min(1, trackTop / totalScrollable));

      // Two-part mapping from spec:
      // While p < 0.7 (knee), camera climbs over train (progress runs 0 -> 0.46)
      // Once past knee, clouds take over (progress runs 0.46 -> 1.0)
      const knee = 0.68;
      let clipProgress = 0;
      if (p < knee) {
        clipProgress = (p / knee) * 0.46;
      } else {
        clipProgress = 0.46 + ((p - knee) / (1 - knee)) * 0.54;
      }

      targetTime = clipProgress * Math.max(0, video.duration - 1 / 48);
    };

    const updateVideoScrub = () => {
      // Smoothing: cur += (target - cur) * 0.22
      curTime += (targetTime - curTime) * 0.22;
      if (video && !video.seeking && Math.abs(video.currentTime - curTime) > 1 / 60) {
        video.currentTime = curTime;
      }
      animId = requestAnimationFrame(updateVideoScrub);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    animId = requestAnimationFrame(updateVideoScrub);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-[#0a0b0c] text-[#F7F5EF] relative font-sans selection:bg-sky-500/30">
      {/* Dynamic Top Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0a0b0c]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-md shadow-sky-500/20">
            <div className="w-full h-full bg-[#0a0d14] rounded-[10px] flex items-center justify-center">
              <Compass className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white font-mono uppercase">
            Supply<span className="text-sky-400">Lens</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-semibold px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/[0.12] text-white transition-all"
          >
            Sourcing Platform
          </Link>
          <Link
            href="/?tab=billing"
            className="text-xs font-semibold px-4 py-2 rounded-full text-white/60 hover:text-white transition-all"
          >
            Billing & 5% Fee
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold px-5 py-2 rounded-full bg-white text-black hover:bg-slate-200 transition-all shadow-md active:scale-95"
          >
            Launch Platform
          </Link>
        </div>
      </nav>

      {/* Track: Scroll-scrubbed sticky video scene container */}
      <div ref={trackRef} className="relative w-full h-[380vh]">
        {/* Sticky full-viewport video backdrop */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            muted
            preload="auto"
            poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/5e018553-cb8a-420a-819f-fcdfa08e5df0.jpg"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          >
            <source
              src="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/e02bb27f-80d8-445f-a03e-1b609dac4261.mp4"
              type="video/mp4"
            />
          </video>

          {/* Vignette & Tint Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
        </div>

        {/* Content Layer (Scrolled over the sticky train) */}
        <div className="absolute inset-x-0 top-0 h-full pointer-events-none flex flex-col items-center">
          {/* 1. Intro Section (Rises along train axis) */}
          <div className="h-screen w-full flex flex-col items-center justify-center text-center px-4 pointer-events-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.304em] text-[#F7F5EF]/70 mb-3 block font-mono">
              GLOBAL SOURCING & FREIGHT INTELLIGENCE
            </span>
            <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tight text-[#F7F5EF] drop-shadow-[0_12px_32px_rgba(0,0,0,0.8)] leading-[1.05] max-w-4xl">
              <span>Logistics</span> <br />
              <span>that works</span> <br />
              <span>as hard as</span> <br />
              <span className="text-sky-400">you do.</span>
            </h1>
            <p className="mt-4 text-xs sm:text-sm font-medium text-white/80 max-w-md drop-shadow">
              Scroll down to climb above the global freight network.
            </p>
          </div>

          {/* 2. Mirrored 5 Features Layer */}
          <div className="w-full max-w-5xl px-6 space-y-36 pt-24 pointer-events-auto">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-24">
              <div className="md:text-right space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-2">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                  One point of contact
                </h3>
                <p className="text-xs text-white/80 leading-relaxed max-w-sm ml-auto">
                  No more chasing multiple vendors. One unified team manages your entire end-to-end flow from factory floor to destination warehouse.
                </p>
              </div>

              <div className="md:text-left space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-2">
                  <Boxes className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                  Full supply chain visibility
                </h3>
                <p className="text-xs text-white/80 leading-relaxed max-w-sm">
                  Track container freight in real time and receive automated, proactive updates before customs issues become costly production delays.
                </p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-24">
              <div className="md:text-right space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-2">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                  Compliance you can trust
                </h3>
                <p className="text-xs text-white/80 leading-relaxed max-w-sm ml-auto">
                  Licensed customs brokers keep your shipments moving smoothly within every domestic and cross-border regulatory requirement.
                </p>
              </div>

              <div className="md:text-left space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-2">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                  Transparent 5% success fee
                </h3>
                <p className="text-xs text-white/80 leading-relaxed max-w-sm">
                  No hidden margins. Transparent 5% success fee payable exclusively upon confirmed contract award, backed by responsive billing support.
                </p>
              </div>
            </div>

            {/* Row 3: Centered 5th Feature */}
            <div ref={lastBlockRef} className="text-center max-w-md mx-auto space-y-2 pb-32">
              <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-2">
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                Fast issue resolution
              </h3>
              <p className="text-xs text-white/80 leading-relaxed">
                When weather or customs anomalies occur, we don&apos;t point fingers—we solve them immediately to protect your manufacturing timeline.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Cloud Transition & Testimonial Section */}
      <section className="relative -mt-[34vh] z-20 pt-[34vh] bg-gradient-to-b from-transparent via-[#e2dedd] to-[#e2dedd] text-[#141516]">
        <div className="max-w-5xl mx-auto px-6 pb-28 pt-8 space-y-12">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 pb-6 border-b border-[#141516]/15">
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none text-[#141516]">
              Trusted <br />
              by businesses <br />
              <span className="text-[#8f8b8a]">across the globe</span>
            </h2>
            <p className="text-xs text-[#141516]/70 leading-relaxed self-end">
              From first-time entrepreneurs to high-volume enterprise importers, our partners stay because every consignment is treated like it matters.
            </p>
          </div>

          {/* Quotes */}
          <div className="space-y-8 divide-y divide-[#141516]/15">
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 pt-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block text-[#141516]">Thomas Reid</span>
                <span className="text-[11px] text-[#141516]/60">Director, Harbour Fit Group</span>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-[#141516]/90">
                &ldquo;My business would not function without this team. They treat every consignment on its own merits, and our account managers know our business well enough to answer before we ask. We have never had that from a bigger carrier.&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 pt-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block text-[#141516]">Ana Park</span>
                <span className="text-[11px] text-[#141516]/60">Supply Chain Lead, Northline Projects</span>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-[#141516]/90">
                &ldquo;As a first-time shipper on a major infrastructure job, we were in unfamiliar territory. They planned the whole route with us, flagged every risk early, and our first delivery reached site on the day they promised.&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 pt-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block text-[#141516]">Liam Carter</span>
                <span className="text-[11px] text-[#141516]/60">Operations Manager, Coastline Foods</span>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-[#141516]/90">
                &ldquo;One contact, one dashboard, no surprises. When a vessel slipped two days, we heard about it before our customers did, and the new plan was already in place.&rdquo;
              </p>
            </div>
          </div>

          {/* Sourcing Call to Action Well */}
          <div className="pt-8 text-center space-y-4">
            <h3 className="text-2xl font-extrabold text-[#141516]">
              Ready to Discover Verified Global Manufacturers?
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/?tab=discover"
                className="px-6 py-3 rounded-full bg-[#141516] text-white text-xs font-bold hover:bg-black transition-all shadow-lg active:scale-95"
              >
                Find Verified Suppliers
              </Link>
              <Link
                href="/?tab=verification"
                className="px-6 py-3 rounded-full bg-white border border-[#141516]/20 text-[#141516] text-xs font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                10-D Verification Desk
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
