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
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Bell,
  Check,
  Building2,
  GitCompare,
  Briefcase,
  Receipt,
  Layers,
} from "lucide-react";
import { LeftNavRail } from "@/components/layout/LeftNavRail";
import { VerificationDashboard } from "@/components/verification/VerificationDashboard";
import { AIAssistantDrawer } from "@/components/assistant/AIAssistantDrawer";
import { SupplierProfileModal } from "@/components/suppliers/SupplierProfileModal";
import { UserProfileModal } from "@/components/profile/UserProfileModal";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { authService, AuthUser } from "@/lib/auth";
import { initialBusinessProfile, verifiedSuppliers } from "@/data/mockData";
import { BusinessProfile, Supplier } from "@/types";
import { api } from "@/services/api";
import { LiveDateTime } from "@/components/common/LiveDateTime";

export default function VerificationDeskPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(initialBusinessProfile);
  const [suppliers, setSuppliers] = useState<Supplier[]>(verifiedSuppliers);
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState<Supplier | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    authService.getSessionUser().then((user) => {
      if (user && user.id) {
        setCurrentUser(user);
      } else {
        router.replace("/login?redirect=/verification");
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
        router.push("/vendors");
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
        router.push("/landing");
        break;
      default:
        router.push("/dashboard");
        break;
    }
  };

  const [savedSupplierIds, setSavedSupplierIds] = useState<string[]>([]);

  useEffect(() => {
    api.suppliers.getSaved().then((saved) => {
      if (Array.isArray(saved)) {
        setSavedSupplierIds(saved.map((item: any) => item.supplier_id || item.supplierId));
      }
    }).catch(() => {});
  }, []);

  const handleToggleSaveSupplier = async (supplier: Supplier) => {
    try {
      const res: any = await api.suppliers.save(supplier.id);
      if (res?.is_saved) {
        setSavedSupplierIds((prev) => [...prev, supplier.id]);
      } else {
        setSavedSupplierIds((prev) => prev.filter((id) => id !== supplier.id));
      }
    } catch {}
  };

  const displayUser = currentUser
    ? {
        name: currentUser.name || "Hossein",
        handle: `@${(currentUser.name || "user680523").toLowerCase().replace(/\s+/g, "")}`,
      }
    : {
        name: "Hossein",
        handle: "@user680523",
      };

  return (
    <AuthGuard>
      <div className="flex h-screen w-screen overflow-hidden bg-[#F4F6F9] text-slate-800 antialiased font-sans">
        {/* Sleek Left Navigation Rail */}
      <LeftNavRail
        activeTab="verification"
        onTabChange={handleTabChange}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenAuth={() => setIsProfileModalOpen(true)}
        isLoggedIn={true}
        theme="light"
      />

      {/* Main Cockpit Content Area */}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative p-3 sm:p-5 flex flex-col gap-4 font-sans antialiased pb-24 md:pb-6">
        {/* Tinted Glassmorphic Ambient Mesh Glows in Background */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-gradient-to-bl from-indigo-400/10 via-purple-400/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-gradient-to-tr from-emerald-400/10 via-teal-400/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
        {/* =========================================================================
            TOP FLOATING COCKPIT BAR (Exact Light Mode Styling from Dashboard)
           ========================================================================= */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-1 py-1 shrink-0">
          {/* Left: Section Dropdown Switcher + Quick Navigation Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <button
                onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                className="flex items-center gap-1.5 text-base font-extrabold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer group"
              >
                <span>10-D Verification Desk</span>
                <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-transform group-hover:translate-y-0.5" />
              </button>

              {isWorkspaceDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Workspace Section
                  </div>
                  {[
                    { label: "10-D Verification Desk", href: "/verification" },
                    { label: "Verified Factory Partners", href: "/vendors" },
                    { label: "Sourcing Requirements & BOM", href: "/customer/requirements" },
                    { label: "Vendor Comparison Matrix", href: "/customer/comparisons" },
                    { label: "Sourcing Deals & Contracts", href: "/customer/deals" },
                    { label: "Invoices & Settlement Hub", href: "/customer/invoices" },
                  ].map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        setIsWorkspaceDropdownOpen(false);
                        router.push(item.href);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      {item.href === "/verification" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Navigation Pills */}
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/verification"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100/70 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verification</span>
            </Link>

            <Link
              href="/customer/deals"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100/70 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Deals</span>
            </Link>

            <Link
              href="/billing"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100/70 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span className="text-emerald-600 font-bold">$</span>
              <span>Billing</span>
            </Link>

            <Link
              href="/landing"
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Landing Page</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>

          {/* Center: Search Pill with Search Button inside */}
          <div className="flex-1 max-w-lg mx-auto w-full">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/vendors?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="relative flex items-center w-full"
            >
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search verified factories, audits, GST, DIN codes..."
                className="w-full pl-10 pr-20 py-2 rounded-full bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xs"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          {/* Right Controls: Audits notification, Date switcher, User profile */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px]">10-D Live Audit</span>
            </div>

            <LiveDateTime />

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 p-0.5 shadow-xs flex items-center justify-center text-white text-xs font-bold">
                {displayUser.name.charAt(0)}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-slate-900 leading-tight">
                  {displayUser.name}
                </span>
                <span className="text-[9px] text-slate-400 leading-none">
                  {displayUser.handle}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </header>

        {/* Verification Dashboard Content */}
        <div className="w-full flex-1">
          <VerificationDashboard
            onSelectSupplier={(supplierId) => {
              const sup = suppliers.find((s) => s.id === supplierId);
              if (sup) {
                setSelectedSupplierForModal(sup);
              } else {
                router.push(`/vendors/${supplierId}`);
              }
            }}
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
          isCompared={false}
          onToggleSave={handleToggleSaveSupplier}
          isSaved={savedSupplierIds.includes(selectedSupplierForModal.id)}
        />
      )}

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        businessProfile={businessProfile}
        suppliers={suppliers}
        onSelectSupplierById={(id) => {
          setIsAssistantOpen(false);
          router.push(`/vendors/${id}`);
        }}
        onNavigateTab={(tab) => {
          setIsAssistantOpen(false);
          handleTabChange(tab);
        }}
      />

      {/* User Profile & Sign Out Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onSignOut={() => {
          setCurrentUser(null);
          setIsProfileModalOpen(false);
        }}
      />
    </div>
    </AuthGuard>
  );
}
