"use client";

import React from "react";
import Link from "next/link";
import { 
  Home, 
  Layers, 
  Building2, 
  GitCompare, 
  Sparkles, 
  LogIn, 
  Compass,
  Receipt,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

export interface LeftNavRailProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAssistant: () => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
  theme?: "dark" | "light";
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const LeftNavRail: React.FC<LeftNavRailProps> = ({
  activeTab,
  onTabChange,
  onOpenAssistant,
  onOpenAuth,
  isLoggedIn,
  theme = "light",
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const isDark = theme === "dark";

  // Streamlined 6 core navigation items (BOM & Requirements unified, Deals & Revenue unified)
  const navItems: Array<{
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
  }> = [
    { key: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    { key: "workspaces", label: "Workspaces & BOM", icon: Layers, href: "/customer/requirements" },
    { key: "suppliers", label: "Supplier Directory", icon: Building2, href: "/vendors" },
    { key: "compare", label: "Compare Matrix", icon: GitCompare, href: "/customer/comparisons" },
    { key: "verification", label: "10-D Verification", icon: ShieldCheck, href: "/verification" },
    { key: "deals", label: "Deals & Revenue Hub", icon: Receipt, href: "/customer/deals" },
  ];

  if (isCollapsed) {
    return (
      <div className="hidden md:flex flex-col items-center py-4 px-1.5 z-30 shrink-0">
        <button
          onClick={onToggleCollapse}
          title="Expand Navigation Rail"
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-all"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* =========================================================================
          DESKTOP LEFT NAVIGATION RAIL (md:flex)
         ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col items-center justify-between w-16 py-5 select-none z-30 shrink-0 transition-all duration-300 ${
          isDark
            ? "bg-[#070B12] border-r border-[#1B253B]"
            : "bg-white/80 backdrop-blur-xl border-r border-slate-200/80 shadow-xs"
        }`}
      >
        {/* Top Logo */}
        <div className="flex flex-col items-center gap-6">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-2xl p-0.5 transition-all group"
            title="SupplyLens Sourcing Cockpit"
          >
            <div
              className={`w-full h-full rounded-xl flex items-center justify-center transition-all ${
                isDark
                  ? "bg-[#0F1523] border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:border-cyan-400 group-hover:scale-105"
                  : "bg-white border border-blue-200 shadow-md group-hover:scale-105"
              }`}
            >
              <Compass
                className={`w-5 h-5 transition-transform duration-300 group-hover:rotate-45 ${
                  isDark ? "text-cyan-400" : "text-blue-600"
                }`}
              />
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="flex flex-col items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              const content = (
                <>
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive
                        ? isDark
                          ? "text-cyan-400"
                          : "text-blue-600"
                        : isDark
                        ? "text-slate-400 group-hover:text-white"
                        : "text-slate-400 group-hover:text-slate-900"
                    }`}
                  />
                  {isActive && (
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full ${
                        isDark ? "bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" : "bg-blue-600"
                      }`}
                    />
                  )}
                </>
              );

              const className = `relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group active:scale-95 ${
                isActive
                  ? isDark
                    ? "bg-[#0F1523] border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-semibold"
                    : "bg-blue-50 text-blue-600 border border-blue-200 shadow-xs font-semibold"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-[#0F1523] border border-transparent"
                  : "text-slate-400 hover:text-slate-800 hover:bg-slate-100/80"
              }`;

              if (item.href) {
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    title={item.label}
                    className={className}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={item.key}
                  onClick={() => onTabChange(item.key)}
                  title={item.label}
                  className={className}
                >
                  {content}
                </button>
              );
            })}

            {/* AI Assistant Special Trigger */}
            <button
              onClick={onOpenAssistant}
              title="SupplyLens AI Assistant"
              className={`w-10 h-10 mt-1 rounded-xl flex items-center justify-center transition-all duration-200 group relative active:scale-95 ${
                isDark
                  ? "bg-[#0F1523] border border-cyan-500/40 text-cyan-400 hover:bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  : "text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 shadow-xs"
              }`}
            >
              <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
            </button>
          </nav>
        </div>

        {/* Bottom Auth / Profile & Rail Collapse Button */}
        <div className="flex flex-col items-center gap-2">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title="Collapse Sidebar (Expand Dashboard View)"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                isDark
                  ? "text-slate-400 hover:text-white hover:bg-[#0F1523]"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onOpenAuth}
            title={isLoggedIn ? "Account Profile & Sign Out" : "Sign In to Workspace"}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${
              isDark
                ? "text-slate-400 hover:text-white hover:bg-[#0F1523] border-transparent hover:border-[#1B253B]"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-transparent hover:border-slate-200"
            }`}
          >
            {isLoggedIn ? (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 p-0.5 shadow-xs">
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isDark ? "bg-[#0B0F19] text-cyan-300" : "bg-white text-blue-600"
                  }`}
                >
                  H
                </div>
              </div>
            ) : (
              <LogIn className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MOBILE FLOATING FROSTED GLASS BOTTOM NAVIGATION BAR (md:hidden)
          Enables seamless one-tap navigation across any mobile/tablet screen
         ========================================================================= */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-3 left-3 right-3 z-50 bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(15,23,42,0.12)] rounded-2xl flex items-center justify-around py-2 px-1 select-none"
      >
        {/* Core Nav items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          const content = (
            <div className="flex flex-col items-center gap-0.5">
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? "text-blue-600 scale-110" : "text-slate-400"
                }`}
              />
              <span
                className={`text-[9px] font-semibold leading-none truncate max-w-[50px] ${
                  isActive ? "text-blue-600 font-bold" : "text-slate-500"
                }`}
              >
                {item.label.split(" ")[0]}
              </span>
            </div>
          );

          const btnClass = `p-1.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center ${
            isActive ? "bg-blue-50/90 text-blue-600" : "text-slate-400 hover:text-slate-700"
          }`;

          if (item.href) {
            return (
              <Link key={item.key} href={item.href} className={btnClass} title={item.label}>
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={btnClass}
              title={item.label}
            >
              {content}
            </button>
          );
        })}

        {/* AI Assistant Special Trigger Pill */}
        <button
          onClick={onOpenAssistant}
          className="relative p-1.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md active:scale-95 transition-transform"
          title="SupplyLens AI Assistant"
        >
          <div className="flex flex-col items-center gap-0.5">
            <Sparkles className="w-5 h-5" />
            <span className="text-[9px] font-bold leading-none">AI</span>
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
        </button>

        {/* User Account Pill */}
        <button
          onClick={onOpenAuth}
          className="p-1.5 rounded-xl text-slate-500 active:scale-95 transition-transform flex flex-col items-center gap-0.5"
          title="User Account & Profile"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 p-0.5 shadow-xs flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[9px] font-bold text-blue-600">
              H
            </div>
          </div>
          <span className="text-[9px] font-semibold text-slate-500 leading-none">Profile</span>
        </button>
      </nav>
    </>
  );
};
