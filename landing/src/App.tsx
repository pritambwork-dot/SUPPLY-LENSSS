import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, ArrowDown, ChevronUp, Info, X } from 'lucide-react';
import { useVideoScrub } from '@/useVideoScrub';

const DARK = '#1D3045';
const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260821_114821_a8ca298f-be2c-4613-a4dd-51b69e16bbde.mp4';

const NAV_LINKS = [
  { name: 'VECTRUS ENERGY', active: true },
  { name: 'VECTRUS UPSTREAM', active: false },
  { name: 'VECTRUS MARKETS', active: false },
  { name: 'VECTRUS SYSTEMS', active: false },
  { name: 'VECTRUS+', active: false },
];

interface StaggerItemProps {
  visible: boolean;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}

const StaggerItem: React.FC<StaggerItemProps> = ({
  visible,
  delay = 0,
  className = '',
  children,
}) => {
  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition:
          'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollProgress, canvasLive } = useVideoScrub(
    VIDEO_URL,
    containerRef,
    canvasRef,
    videoRef
  );

  const [navEntered, setNavEntered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Entrance animation for navbar
  useEffect(() => {
    const timer = setTimeout(() => {
      setNavEntered(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const p = scrollProgress;

  // s1Opacity:
  // p < 0.20 → 1
  // else → max(0, 1 - (p - 0.20) / 0.08)
  const s1Opacity = p < 0.2 ? 1 : Math.max(0, 1 - (p - 0.2) / 0.08);

  // s2Opacity:
  // p < 0.32 → 0
  // p < 0.40 → (p - 0.32) / 0.08
  // p < 0.55 → 1
  // else → max(0, 1 - (p - 0.55) / 0.08)
  let s2Opacity = 0;
  if (p < 0.32) {
    s2Opacity = 0;
  } else if (p < 0.4) {
    s2Opacity = (p - 0.32) / 0.08;
  } else if (p < 0.55) {
    s2Opacity = 1;
  } else {
    s2Opacity = Math.max(0, 1 - (p - 0.55) / 0.08);
  }

  // s3Opacity:
  // p < 0.67 → 0
  // p < 0.75 → (p - 0.67) / 0.08
  // else → 1
  let s3Opacity = 0;
  if (p < 0.67) {
    s3Opacity = 0;
  } else if (p < 0.75) {
    s3Opacity = (p - 0.67) / 0.08;
  } else {
    s3Opacity = 1;
  }

  // Stagger visibility thresholds (> 0.3)
  const s1Visible = s1Opacity > 0.3;
  const s2Visible = s2Opacity > 0.3;
  const s3Visible = s3Opacity > 0.3;

  // Nav color flips at p > 0.55: DARK → white (duration-500)
  const isNavWhite = p > 0.55;
  const navColor = isNavWhite ? '#FFFFFF' : DARK;

  return (
    <div ref={containerRef} className="relative h-[500vh]">
      {/* Sticky Viewport Scene */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* 1) Full-cover video element */}
        <video
          ref={videoRef}
          src={VIDEO_URL}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          playsInline
          preload="auto"
        />

        {/* 2) Canvas for decoded frame bank */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300"
          style={{ opacity: canvasLive ? 1 : 0 }}
        />

        {/* 3) Overlay containing Navbar + 3 sequential text sections */}
        <div className="absolute inset-0 pointer-events-none">
          {/* NAVBAR */}
          <nav
            className="absolute top-0 inset-x-0 z-50 pointer-events-auto px-6 sm:px-8 md:px-12 pt-8 sm:pt-12 pb-6 flex items-center justify-between transition-colors duration-500"
            style={{ color: navColor }}
          >
            {/* Desktop Left Cluster */}
            <div className="hidden lg:flex items-center gap-8 xl:gap-10">
              {NAV_LINKS.map((link, idx) => (
                <a
                  key={link.name}
                  href="#"
                  className="text-xs tracking-[0.15em] uppercase font-medium hover:opacity-70 transition-opacity duration-200 relative"
                  style={{
                    opacity: navEntered ? 1 : 0,
                    transform: navEntered ? 'translateY(0)' : 'translateY(-12px)',
                    transition:
                      'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: `${idx * 80 + 100}ms`,
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  {link.name}
                  {link.active && (
                    <span
                      className="absolute left-0 right-0 -bottom-3 h-[2px] transition-colors duration-500"
                      style={{ backgroundColor: navColor }}
                    />
                  )}
                </a>
              ))}
            </div>

            {/* Mobile Hamburger (left) */}
            <button
              type="button"
              className="lg:hidden flex flex-col gap-[5px] cursor-pointer focus:outline-none"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Menu"
            >
              <span
                className="w-6 h-[2px] transition-colors duration-500"
                style={{ backgroundColor: navColor }}
              />
              <span
                className="w-6 h-[2px] transition-colors duration-500"
                style={{ backgroundColor: navColor }}
              />
              <span
                className="w-4 h-[2px] transition-colors duration-500"
                style={{ backgroundColor: navColor }}
              />
            </button>

            {/* Right Cluster */}
            <div
              className="hidden sm:flex items-center gap-6 xl:gap-8"
              style={{
                opacity: navEntered ? 1 : 0,
                transform: navEntered ? 'translateY(0)' : 'translateY(-12px)',
                transition:
                  'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: '500ms',
              }}
            >
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
                <span className="text-xs tracking-[0.2em] uppercase font-medium">NEWS</span>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-500"
                  style={{ backgroundColor: navColor }}
                >
                  <Info size={10} style={{ color: isNavWhite ? DARK : '#FFFFFF' }} />
                </div>
              </div>

              {/* MENU label: span on lg+, button below lg */}
              <span className="hidden lg:inline text-xs tracking-[0.2em] uppercase font-medium">
                MENU
              </span>
              <button
                type="button"
                className="lg:hidden text-xs tracking-[0.2em] uppercase font-medium cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => setMobileMenuOpen(true)}
              >
                MENU
              </button>
            </div>
          </nav>

          {/* SECTION 1 (hero, left aligned, vertically centered) */}
          <section
            className="absolute inset-0 px-6 sm:px-8 md:px-20 lg:px-32 flex flex-col justify-center h-full max-w-7xl"
            style={{
              opacity: s1Opacity,
              pointerEvents: s1Opacity > 0.05 ? 'auto' : 'none',
              transition: 'opacity 0.1s ease-out',
            }}
          >
            <StaggerItem visible={s1Visible} delay={0}>
              <h1
                className="text-[clamp(2rem,5vw,5rem)] font-light uppercase leading-[1.2]"
                style={{ color: DARK }}
              >
                Advancing resources for a cleaner future
              </h1>
            </StaggerItem>

            <StaggerItem visible={s1Visible} delay={150}>
              <p
                className="text-sm tracking-[0.3em] uppercase mt-6"
                style={{ color: '#1D304590' }}
              >
                Sustainable power with purpose
              </p>
            </StaggerItem>

            {/* Bottom-right circle button */}
            <div className="absolute bottom-12 right-6 sm:right-8 md:right-12 pointer-events-auto">
              <StaggerItem visible={s1Visible} delay={300}>
                <button
                  type="button"
                  className="w-12 h-12 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity border"
                  style={{ borderColor: 'rgba(29, 48, 69, 0.50)' }}
                  aria-label="Next"
                >
                  <ArrowRight size={18} style={{ color: DARK }} />
                </button>
              </StaggerItem>
            </div>
          </section>

          {/* SECTION 2 (center) */}
          <section
            className="absolute inset-0 px-6 sm:px-8 flex items-center justify-center h-full"
            style={{
              opacity: s2Opacity,
              pointerEvents: s2Opacity > 0.05 ? 'auto' : 'none',
              transition: 'opacity 0.1s ease-out',
            }}
          >
            <div className="max-w-[900px] mx-auto text-center">
              <StaggerItem visible={s2Visible} delay={0}>
                <h2 className="text-[clamp(1.5rem,4.5vw,4.5rem)] font-extralight tracking-wide leading-[1.3] text-center uppercase">
                  <span style={{ color: DARK }}>We build lasting partnerships with vision </span>
                  <span style={{ color: 'rgba(29, 48, 69, 0.80)' }}>and precision</span>
                  <span style={{ color: DARK }}> </span>
                  <span style={{ color: 'rgba(29, 48, 69, 0.50)' }}>across every frontier</span>
                </h2>
              </StaggerItem>
            </div>

            {/* Right Column controls */}
            <div className="absolute bottom-16 right-6 sm:right-8 md:right-12 flex flex-col items-center gap-4 pointer-events-auto">
              <StaggerItem visible={s2Visible} delay={200}>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center border"
                  style={{ borderColor: 'rgba(29, 48, 69, 0.40)' }}
                >
                  <ArrowDown size={18} style={{ color: DARK }} />
                </div>
              </StaggerItem>

              <StaggerItem visible={s2Visible} delay={350}>
                <div className="mt-4 flex flex-col items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: DARK }}
                  />
                  <span
                    className="w-[6px] h-[6px] rounded-full"
                    style={{ backgroundColor: 'rgba(29, 48, 69, 0.40)' }}
                  />
                  <span
                    className="w-[6px] h-[6px] rounded-full"
                    style={{ backgroundColor: 'rgba(29, 48, 69, 0.40)' }}
                  />
                </div>
              </StaggerItem>

              <StaggerItem visible={s2Visible} delay={500}>
                <div
                  className="mt-2 w-10 h-10 rounded-full flex items-center justify-center border"
                  style={{ borderColor: 'rgba(29, 48, 69, 0.30)' }}
                >
                  <ChevronUp size={16} style={{ color: 'rgba(29, 48, 69, 0.80)' }} />
                </div>
              </StaggerItem>
            </div>
          </section>

          {/* SECTION 3 (right aligned, white type — video is dark here) */}
          <section
            className="absolute inset-0 px-6 sm:px-8 md:px-20 lg:px-32 flex items-center justify-end h-full"
            style={{
              opacity: s3Opacity,
              pointerEvents: s3Opacity > 0.05 ? 'auto' : 'none',
              transition: 'opacity 0.1s ease-out',
            }}
          >
            <div className="max-w-2xl text-left">
              <StaggerItem visible={s3Visible} delay={0}>
                <p className="text-white/60 text-lg tracking-wide mb-4 font-light">
                  Halder | Nordvik
                </p>
              </StaggerItem>

              <StaggerItem visible={s3Visible} delay={150}>
                <h2 className="text-[clamp(2rem,4vw,4rem)] font-light text-white leading-[1.2] uppercase tracking-wide mb-8">
                  Fueling ambition,
                  <br />
                  shaping tomorrow.
                </h2>
              </StaggerItem>

              <StaggerItem visible={s3Visible} delay={300}>
                <div className="flex items-center gap-4 pointer-events-auto">
                  <span className="text-sm tracking-[0.3em] text-white/80 uppercase">
                    Contact Nordvik
                  </span>
                  <button
                    type="button"
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 duration-300 transition-transform cursor-pointer"
                    aria-label="Contact Nordvik"
                  >
                    <ArrowRight size={16} className="text-gray-800" />
                  </button>
                </div>
              </StaggerItem>
            </div>
          </section>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div
        className={`fixed inset-0 z-[100] flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        style={{ backgroundColor: DARK }}
      >
        {/* Top bar with close button */}
        <div className="flex justify-end px-6 sm:px-8 pt-8 sm:pt-12">
          <button
            type="button"
            className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:border-white transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Center links panel */}
        <div
          className={`flex flex-col justify-center px-8 sm:px-12 py-3 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            mobileMenuOpen ? 'translate-y-0' : '-translate-y-8'
          }`}
        >
          {NAV_LINKS.map((link, idx) => (
            <a
              key={link.name}
              href="#"
              className={`py-3 text-2xl sm:text-3xl font-light tracking-wide uppercase transition-all duration-300 ${
                link.active ? 'text-white' : 'text-white/60 hover:text-white'
              }`}
              style={{
                opacity: mobileMenuOpen ? 1 : 0,
                transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                transition:
                  'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: `${idx * 60}ms`,
              }}
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
              }}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs tracking-[0.2em] uppercase text-white/60 px-8 sm:px-12 pb-10">
          <span>NEWS</span>
          <span>CONTACT</span>
        </div>
      </div>
    </div>
  );
}
