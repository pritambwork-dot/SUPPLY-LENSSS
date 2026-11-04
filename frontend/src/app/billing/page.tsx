"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Search,
  ChevronDown,
  ExternalLink,
  Bell,
  Briefcase,
  Receipt,
  Sparkles,
  Zap,
} from "lucide-react";
import { LeftNavRail } from "@/components/layout/LeftNavRail";
import { BillingDashboardView } from "@/components/billing/BillingDashboardView";
import { AIAssistantDrawer } from "@/components/assistant/AIAssistantDrawer";
import { SupplierProfileModal } from "@/components/suppliers/SupplierProfileModal";
import { UserProfileModal } from "@/components/profile/UserProfileModal";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { authService, AuthUser } from "@/lib/auth";
import { verifiedSuppliers } from "@/data/mockData";
import { Supplier } from "@/types";
import { LiveDateTime } from "@/components/common/LiveDateTime";

export default function BillingHubPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState<Supplier | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    authService.getSessionUser().then((user) => {
      if (user && user.id) {
        setCurrentUser(user);
      } else {
        router.replace("/login?redirect=/billing");
      }
    });
  }, [router]);

  const handleTabChange = (tab: string) => {
    switch (tab) {
      case "dashboard":
        router.push("/dashboard");
        break;
      case "workspaces":
        router.push("/customer/requirements");
        break;
      case "suppliers":
        router.push("/customer/saved-vendors");
        break;
      case "compare":
        router.push("/customer/comparisons");
        break;
      case "verification":
        router.push("/verification");
        break;
      case "deals":
        router.push("/customer/deals");
        break;
      case "billing":
        router.push("/billing");
        break;
      case "landing":
        router.push("/");
        break;
      default:
        router.push("/dashboard");
        break;
    }
  };

  const handleSelectSupplierById = (id: string) => {
    const found = verifiedSuppliers.find((s) => s.id === id);
    if (found) {
      setSelectedSupplierForModal(found);
    }
  };

  const displayUser = currentUser
    ? {
        name: currentUser.name || "Guest",
        handle: `@${(currentUser.name || "guest").toLowerCase().replace(/\s+/g, "")}`,
        role: currentUser.role || "Lead Sourcing Director",
      }
    : {
        name: "Guest",
        handle: "@guest",
        role: "Lead Sourcing Director",
      };

  return (
    <AuthGuard>
      <div className="flex h-screen w-screen overflow-hidden bg-[#F4F6F9] text-slate-800 antialiased font-sans">
        {/* Left Navigation Rail */}
        <LeftNavRail
          activeTab="billing"
          onTabChange={handleTabChange}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onOpenAuth={() => setIsProfileModalOpen(true)}
          isLoggedIn={true}
          theme="light"
          isCollapsed={isExpanded}
          onToggleCollapse={() => setIsExpanded(!isExpanded)}
        />

        {/* Main Content Area */}
        <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative flex flex-col">
          {/* Upper Nav Bar with Live Date & Time Clock */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 shadow-xs">
            {/* Left: View Title & Dropdown */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <button
                  onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                  className="flex items-center gap-1.5 text-slate-900 font-bold text-sm sm:text-base hover:text-blue-600 transition-colors"
                >
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>Billing & Payment Gateway</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isWorkspaceDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Workspaces
                    </div>
                    <button
                      onClick={() => {
                        setIsWorkspaceDropdownOpen(false);
                        router.push("/dashboard");
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                      <span>Executive Cockpit</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsWorkspaceDropdownOpen(false);
                        router.push("/verification");
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Supplier Verification Desk</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsWorkspaceDropdownOpen(false);
                        router.push("/customer/deals");
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>Commercial Deals & POs</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Header Navigation Pills */}
              <div className="hidden lg:flex items-center gap-1.5 ml-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/verification"
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Verification</span>
                </Link>

                <Link
                  href="/customer/deals"
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  <span>Deals</span>
                </Link>

                <Link
                  href="/billing"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-xs"
                >
                  <span className="text-emerald-600 font-bold">$</span>
                  <span>Billing</span>
                </Link>

                <Link
                  href="/landing"
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  <span>Landing Page</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Right: Search, Audits, Live Date & Time Clock, Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Audits Pill */}
              <Link
                href="/verification"
                className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-xs transition-all cursor-pointer relative"
              >
                <Bell className="w-3.5 h-3.5 text-slate-500" />
                <span>2 audits</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute top-1 right-1" />
              </Link>

              {/* Live Real-Time Date & Time Clock in Upper Bar */}
              <LiveDateTime />

              {/* User Profile Capsule */}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer group shrink-0"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                  {displayUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {displayUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-none">
                    {displayUser.handle}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>
            </div>
          </header>

          {/* Billing Hub Body */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <BillingDashboardView
              onNavigateTab={handleTabChange}
              onSelectSupplier={handleSelectSupplierById}
            />
          </div>
        </main>

        {/* Supplier Profile Modal */}
        {selectedSupplierForModal && (
          <SupplierProfileModal
            supplier={selectedSupplierForModal}
            onClose={() => setSelectedSupplierForModal(null)}
            onToggleCompare={() => {
              setSelectedSupplierForModal(null);
              router.push("/customer/comparisons");
            }}
          />
        )}

        {/* AI Assistant Drawer */}
        <AIAssistantDrawer
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          suppliers={verifiedSuppliers}
          businessProfile={{
            id: "biz-001",
            name: "Sustainable Packaging Labs",
            industry: "Sustainable Packaging",
            city: "Bhubaneswar",
            country: "India",
            budgetAmount: 23094.57,
          } as any}
          onSelectSupplierById={handleSelectSupplierById}
          onNavigateTab={handleTabChange}
        />

        {/* User Profile Modal */}
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={currentUser}
        />
      </div>
    </AuthGuard>
  );
}
