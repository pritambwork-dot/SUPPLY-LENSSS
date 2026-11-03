"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Layers,
  GitCompare,
  Briefcase,
  Receipt,
  Building2,
  Settings,
  Bookmark,
  Send,
  Maximize2,
  Minimize2
} from "lucide-react";
import { LeftNavRail } from "@/components/layout/LeftNavRail";
import { AIAssistantDrawer } from "@/components/assistant/AIAssistantDrawer";
import { LoginPage } from "@/components/auth/LoginPage";
import { UserProfileModal } from "@/components/profile/UserProfileModal";
import { authService, AuthUser } from "@/lib/auth";
import { initialBusinessProfile, verifiedSuppliers } from "@/data/mockData";
import { BusinessProfile, Supplier } from "@/types";

export default function CustomerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(initialBusinessProfile);
  const [suppliers, setSuppliers] = useState<Supplier[]>(verifiedSuppliers);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    authService.getSessionUser().then((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser({
          id: "usr-demo-001",
          email: "hossein@supplylens.ai",
          name: "Hossein",
          role: "Lead Sourcing Director",
          onboarding_status: "completed",
          active_step: 6,
        });
      }
    });
  }, []);

  // Determine active rail key based on route
  const getActiveRailKey = () => {
    if (pathname.includes("/customer/requirements")) return "workspaces";
    if (pathname.includes("/customer/saved-vendors")) return "suppliers";
    if (pathname.includes("/customer/comparisons")) return "compare";
    if (pathname.includes("/customer/deals")) return "deals";
    if (pathname.includes("/customer/invoices")) return "billing";
    if (pathname.includes("/customer/profile") || pathname.includes("/customer/business")) return "workspaces";
    return "workspaces";
  };

  // Determine current section title and icon for header breadcrumb
  const getCurrentSection = () => {
    if (pathname.includes("/customer/requirements")) {
      return { title: "Sourcing Requirements & BOM", icon: Layers };
    }
    if (pathname.includes("/customer/comparisons")) {
      return { title: "Vendor Comparison Matrix", icon: GitCompare };
    }
    if (pathname.includes("/customer/saved-vendors")) {
      return { title: "Saved Factory Partners", icon: Bookmark };
    }
    if (pathname.includes("/customer/deals")) {
      return { title: "Sourcing Deals & Contracts", icon: Briefcase };
    }
    if (pathname.includes("/customer/quotations")) {
      return { title: "Quotations & Direct RFQs", icon: Send };
    }
    if (pathname.includes("/customer/invoices")) {
      return { title: "Invoices & Settlement Hub", icon: Receipt };
    }
    if (pathname.includes("/customer/profile") || pathname.includes("/customer/business")) {
      return { title: "Enterprise Business Profile", icon: Building2 };
    }
    if (pathname.includes("/customer/searches")) {
      return { title: "Supplier Search History", icon: Search };
    }
    if (pathname.includes("/customer/settings")) {
      return { title: "Workspace Settings", icon: Settings };
    }
    return { title: "Sourcing Workspace", icon: Layers };
  };

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
        router.push("/customer/saved-vendors");
        break;
      case "deals":
        router.push("/customer/deals");
        break;
      case "economics":
      case "optimizer":
        router.push("/customer/requirements");
        break;
      case "billing":
        router.push("/customer/invoices");
        break;
      case "revenue":
        router.push("/customer/deals");
        break;
      case "landing":
        router.push("/landing");
        break;
      default:
        router.push("/dashboard");
        break;
    }
  };

  const currentSection = getCurrentSection();
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F6F9] text-slate-800 antialiased font-sans">
      {/* Sleek Left Navigation Rail (Identical to Dashboard) */}
      <LeftNavRail
        activeTab={getActiveRailKey()}
        onTabChange={handleTabChange}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenAuth={() => setIsProfileModalOpen(true)}
        isLoggedIn={true}
        theme="light"
        isCollapsed={isExpanded}
        onToggleCollapse={() => setIsExpanded(!isExpanded)}
      />

      {/* Main Cockpit Content Area */}
      <main
        className={`flex-1 h-screen overflow-y-auto overflow-x-hidden relative transition-all duration-300 flex flex-col gap-4 font-sans antialiased ${
          isExpanded ? "p-2 sm:p-3.5" : "p-3 sm:p-5"
        }`}
      >
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
                <span>{currentSection.title}</span>
                <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-transform group-hover:translate-y-0.5" />
              </button>

              {isWorkspaceDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Workspace Section
                  </div>
                  {[
                    { label: "Sourcing Requirements & BOM", href: "/customer/requirements" },
                    { label: "Vendor Comparison Matrix", href: "/customer/comparisons" },
                    { label: "Saved Factory Partners", href: "/customer/saved-vendors" },
                    { label: "Quotations & RFQs", href: "/customer/quotations" },
                    { label: "Sourcing Deals & Contracts", href: "/customer/deals" },
                    { label: "Invoices & Settlement Hub", href: "/customer/invoices" },
                    { label: "Business Profile", href: "/customer/profile" },
                    { label: "Search History", href: "/customer/searches" },
                    { label: "Settings", href: "/customer/settings" },
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
                      {pathname === item.href && <Check className="w-3.5 h-3.5 text-blue-600" />}
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
              href="/customer/saved-vendors"
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
              href="/customer/invoices"
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
                placeholder="Search verified factories, HS codes, BOM components..."
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
            {/* Audits Pill */}
            <Link
              href="/customer/saved-vendors"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-xs"
            >
              <Bell className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px]">2 audits</span>
            </Link>

            {/* Date Selector Pill */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-700 shadow-xs">
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-800 transition-colors" />
              <span className="text-[11px] font-semibold px-1">Today, Nov 3</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-800 transition-colors" />
            </div>

            {/* Expand / Standard View Toggle Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                isExpanded
                  ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/20"
                  : "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50"
              }`}
              title={isExpanded ? "Collapse to Standard View" : "Expand Cockpit View"}
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-white" />
                  <span className="text-[11px] font-bold">Standard</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] font-bold">Expand</span>
                </>
              )}
            </button>

            {/* User Profile Pill */}
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

        {/* Content Section rendered with full width and matching cockpit style */}
        <div className="w-full flex-1">
          {children}
        </div>
      </main>

      {/* Slide-out Full AI Assistant Drawer */}
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

      {/* Auth / Login Modal */}
      {isAuthModalOpen && (
        <LoginPage
          isModal={true}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => {
            setCurrentUser({
              id: "usr-demo-001",
              email: user.email,
              name: user.name,
              role: user.role,
              onboarding_status: "completed",
              active_step: 6,
            });
            setIsAuthModalOpen(false);
          }}
        />
      )}

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
  );
}
