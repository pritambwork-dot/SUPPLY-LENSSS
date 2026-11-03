"use client";

import React from "react";
import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";
import { BusinessProfile } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  businessProfile: BusinessProfile | null;
  onOpenOnboarding: () => void;
  onToggleAssistant: () => void;
  isAssistantOpen: boolean;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  compareCount: number;
  scenarioCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  businessProfile,
  onOpenOnboarding,
  onToggleAssistant,
  isAssistantOpen,
  theme,
  setTheme,
  compareCount,
  scenarioCount = 0,
}) => {
  const navItems: Array<{
    id: string;
    label: string;
    badge?: number | null;
    href?: string;
  }> = [
    { id: "landing", label: "Landing", href: "/landing" },
    { id: "home", label: "Dashboard", href: "/dashboard" },
    { id: "discover", label: "Suppliers" },
    { id: "compare", label: "Compare", badge: compareCount > 0 ? compareCount : null },
    { id: "economics", label: "Economics", badge: scenarioCount > 0 ? scenarioCount : null },
    { id: "optimization", label: "Optimize" },
    { id: "verification", label: "Verification" },
    { id: "deals", label: "Deals" },
    { id: "billing", label: "Billing" },
    { id: "business", label: "My Business" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl text-slate-800 transition-colors shadow-xs">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Clean Navigation */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2.5 text-left focus:outline-none shrink-0"
            title="SupplyLens Sourcing Cockpit"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Compass className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
                Supply<span className="text-blue-600">Lens</span>
              </span>
            </div>
          </Link>

          {/* Demo Environment Indicator */}
          <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>DEMO ENVIRONMENT · SAMPLE DATA</span>
          </div>

          {/* Desktop Glossy Segmented Nav */}
          <nav className="hidden md:flex items-center bg-slate-100/80 p-1 rounded-full border border-slate-200/70 shadow-inner">
            {navItems.map((item) => {
              const isActive = activeTab === item.id || (item.id === "discover" && activeTab === "suppliers");
              const content = (
                <>
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </>
              );

              const className = `relative flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-all duration-200 ${
                isActive
                  ? "bg-white text-slate-900 font-semibold shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium"
              }`;

              if (item.href) {
                return (
                  <Link key={item.id} href={item.href} className={className}>
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={className}
                >
                  {content}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Link to Cinematic Landing */}
          <Link
            href="/landing"
            className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-50 hover:bg-blue-100/80 px-3 py-1 text-xs font-semibold text-blue-700 transition-colors shadow-xs"
            title="View cinematic freight landing page"
          >
            <span>Landing Page</span>
            <span className="text-xs">↗</span>
          </Link>

          {/* Active Business Context Capsule */}
          {businessProfile?.name ? (
            <button
              onClick={() => setActiveTab("business")}
              className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold truncate max-w-[120px] text-slate-900">
                {businessProfile.name}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-emerald-600">
                {formatCurrency(businessProfile.budgetAmount, businessProfile.budgetCurrency)}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenOnboarding}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue-600 hover:bg-blue-700 px-3.5 py-1 text-xs font-semibold text-white transition-all shadow-xs active:scale-95"
            >
              <Sparkles className="h-3 w-3" />
              <span>Start Business</span>
            </button>
          )}

          {/* AI Assistant Button */}
          <button
            onClick={onToggleAssistant}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              isAssistantOpen
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
            }`}
          >
            <Sparkles className="h-3 w-3 text-blue-600" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
