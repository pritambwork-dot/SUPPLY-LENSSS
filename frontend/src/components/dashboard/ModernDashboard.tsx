"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Building2,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  ExternalLink,
  Plus,
  FileSpreadsheet,
  Globe,
  DollarSign,
  Send,
  Zap,
  MoreHorizontal,
  Check,
  Receipt,
  FileText,
  Maximize2,
  Minimize2
} from "lucide-react";
import { AiSphere3D } from "@/components/3d/AiSphere3D";
import { InteractiveChart } from "@/components/dashboard/InteractiveChart";
import { Supplier, BusinessProfile } from "@/types";
import { RequestQuotationModal } from "@/components/quotations/RequestQuotationModal";

interface ModernDashboardProps {
  businessProfile: BusinessProfile;
  suppliers: Supplier[];
  onOpenAssistant: () => void;
  onOpenSupplierModal: (supplier: Supplier) => void;
  onNavigateTab: (tab: string) => void;
  onOpenLoginModal: () => void;
  user: { name: string; handle: string; role: string } | null;
  onPerformLiveSearch?: (query: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const ModernDashboard: React.FC<ModernDashboardProps> = ({
  businessProfile,
  suppliers,
  onOpenAssistant,
  onOpenSupplierModal,
  onNavigateTab,
  onOpenLoginModal,
  user,
  onPerformLiveSearch,
  isExpanded = false,
  onToggleExpand,
}) => {
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [searchQuery, setSearchQuery] = useState("");
  const [workspaceCategory, setWorkspaceCategory] = useState("Manufacturing");
  const [selectedSupplierForRfq, setSelectedSupplierForRfq] = useState<Supplier | null>(null);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [aiSphereMode, setAiSphereMode] = useState<"sphere" | "globe">("sphere");

  const displayUser = user || {
    name: "Hossein",
    handle: "@user680523",
    role: "Lead Sourcing Director",
  };

  const currencySymbol = currency === "USD" ? "$" : "₹";
  const totalBalanceFormatted =
    currency === "USD" ? "23,094.57" : "18,47,565";
  const yearlyAvgFormatted =
    currency === "USD" ? "$ 34,502.19" : "₹ 27,60,175";

  // Factory Partners list matching exact reference screenshot
  const defaultSuppliersList = useMemo(() => {
    return [
      {
        rank: "#1",
        id: "sup-utkal-001",
        name: "Utkal GreenFiber Pvt Ltd",
        shortName: "Utkal GreenFiber",
        admin: "Elena R.",
        adminRole: "Operations Lead",
        dateAdded: "Oct 28, 2026",
        sector: "Sustainable Packaging",
        country: "India",
        city: "Bhubaneswar",
        status: "Audited Tier 1",
        verified: true,
        score: 98.4,
        moq: "1,000 pcs",
        price: currency === "USD" ? "$ 0.08 / pc" : "₹ 6.80 / pc",
        avatars: ["E", "R"],
      },
      {
        rank: "#2",
        id: "sup-kling-003",
        name: "Klingele Paper & Packaging SE",
        shortName: "Klingele Packaging",
        admin: "Marcus W.",
        adminRole: "Plant Director",
        dateAdded: "Oct 24, 2026",
        sector: "Recycled Board",
        country: "Germany",
        city: "Remshalden",
        status: "Audited Tier 1",
        verified: true,
        score: 96.8,
        moq: "5,000 sheets",
        price: currency === "USD" ? "$ 0.12 / sheet" : "₹ 9.90 / sheet",
        avatars: ["M", "W"],
      },
      {
        rank: "#3",
        id: "sup-anphat-004",
        name: "An Phat Holdings Bio-resins",
        shortName: "An Phat Bio",
        admin: "Nguyen T.",
        adminRole: "Export Lead",
        dateAdded: "Oct 19, 2026",
        sector: "Compostable Trays",
        country: "Vietnam",
        city: "Hai Duong",
        status: "Audited Tier 1",
        verified: true,
        score: 95.2,
        moq: "2,500 units",
        price: currency === "USD" ? "$ 0.04 / unit" : "₹ 3.30 / unit",
        avatars: ["N", "T"],
      },
      {
        rank: "#4",
        id: "sup-raj-005",
        name: "Rajshree Poly-Pack BioDivision",
        shortName: "Rajshree Poly-Pack",
        admin: "Rajesh M.",
        adminRole: "MD & Sourcing",
        dateAdded: "Oct 15, 2026",
        sector: "Barrier Packaging",
        country: "India",
        city: "Daman",
        status: "Audited Tier 1",
        verified: true,
        score: 97.5,
        moq: "2,000 pcs",
        price: currency === "USD" ? "$ 0.09 / pc" : "₹ 7.50 / pc",
        avatars: ["R", "M"],
      },
      {
        rank: "#5",
        id: "sup-jtc-002",
        name: "Jamestown Container Company",
        shortName: "Jamestown Container",
        admin: "Stephen L.",
        adminRole: "Global Operations",
        dateAdded: "Sep 30, 2026",
        sector: "Custom Tooling",
        country: "United States",
        city: "Hatboro",
        status: "Audited Tier 1",
        verified: true,
        score: 94.6,
        moq: "500 pcs",
        price: currency === "USD" ? "$ 0.38 / pc" : "₹ 31.50 / pc",
        avatars: ["S", "L"],
      },
      {
        rank: "#6",
        id: "sup-bgb-006",
        name: "Biogreen Bags Industrial",
        shortName: "Biogreen Bags",
        admin: "Priya N.",
        adminRole: "Quality Head",
        dateAdded: "Nov 02, 2026",
        sector: "Cornstarch Resins",
        country: "India",
        city: "Bengaluru",
        status: "Audited Tier 1",
        verified: true,
        score: 93.9,
        moq: "3,000 bags",
        price: currency === "USD" ? "$ 0.05 / bag" : "₹ 4.10 / bag",
        avatars: ["P", "N"],
      },
      {
        rank: "#7",
        id: "sup-pel-007",
        name: "Pela Earth Sustainable Consumer",
        shortName: "Pela Earth",
        admin: "Matt B.",
        adminRole: "Material Science",
        dateAdded: "Oct 12, 2026",
        sector: "Bio-composites",
        country: "Canada",
        city: "Kelowna",
        status: "Audited Tier 1",
        verified: true,
        score: 96.1,
        moq: "1,000 kg",
        price: currency === "USD" ? "$ 0.14 / kg" : "₹ 11.60 / kg",
        avatars: ["M", "B"],
      },
    ];
  }, [currency]);

  // Filtered suppliers based on search query
  const filteredSuppliers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return defaultSuppliersList;
    return defaultSuppliersList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q) ||
        s.admin.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
    );
  }, [defaultSuppliersList, searchQuery]);

  const handleOpenRfqForSupplier = (supplierItem: any) => {
    const found = suppliers.find((s) => s.id === supplierItem.id) || {
      id: supplierItem.id,
      name: supplierItem.name,
      legalName: supplierItem.name,
      country: supplierItem.country,
      city: supplierItem.city,
      supplierType: "OEM",
      verified: true,
      verificationStatus: "Verified",
      verificationScore: Math.round(supplierItem.score),
      dataConfidence: 95,
      verificationBadge: "Tier 1 Audited",
      verificationDate: "2026-10-28",
      contactPerson: supplierItem.admin,
      contactEmail: "sourcing@supplylens.ai",
      contactPhone: "+91 674 258 9102",
      products: [],
    } as unknown as Supplier;

    setSelectedSupplierForRfq(found);
  };

  const handleOpenDossierForSupplier = (supplierItem: any) => {
    const found = suppliers.find((s) => s.id === supplierItem.id) || {
      id: supplierItem.id,
      name: supplierItem.name,
      legalName: supplierItem.name,
      country: supplierItem.country,
      city: supplierItem.city,
      supplierType: "OEM",
      verified: true,
      verificationStatus: "Verified",
      verificationScore: Math.round(supplierItem.score),
      dataConfidence: 95,
      verificationBadge: "Tier 1 Audited",
      verificationDate: "2026-10-28",
      contactPerson: supplierItem.admin,
      contactEmail: "sourcing@supplylens.ai",
      contactPhone: "+91 674 258 9102",
      products: [],
    } as unknown as Supplier;

    onOpenSupplierModal(found);
  };

  return (
    <div
      className={`w-full min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col transition-all duration-300 gap-4 font-sans antialiased selection:bg-blue-600/20 ${
        isExpanded ? "p-2 sm:p-3.5 max-w-none" : "p-3 sm:p-5"
      }`}
    >
      {/* =========================================================================
          TOP FLOATING BAR (Exact Light Mode Styling from Reference Screenshot)
         ========================================================================= */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-1 py-1">
        {/* Left: Dashboard Dropdown + Quick Category Navigation Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
              className="flex items-center gap-1.5 text-base font-extrabold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer group"
            >
              <span>Dashboard</span>
              <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-transform group-hover:translate-y-0.5" />
            </button>

            {isWorkspaceDropdownOpen && (
              <div className="absolute left-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Workspace
                </div>
                {["Manufacturing & Packaging", "Electronics Sourcing", "Chemicals & Polymers", "Logistics & Freight"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setIsWorkspaceDropdownOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors flex items-center justify-between"
                  >
                    <span>{item}</span>
                    {item.includes("Manufacturing") && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Filter Navigation Pills */}
          <button
            onClick={() => onNavigateTab("verification")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100/70 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verification</span>
          </button>

          <button
            onClick={() => onNavigateTab("deals")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100/70 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Deals</span>
          </button>

          <button
            onClick={() => onNavigateTab("billing")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100/70 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span className="text-emerald-600 font-bold">$</span>
            <span>Billing</span>
          </button>

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
              if (searchQuery.trim() && onPerformLiveSearch) {
                onPerformLiveSearch(searchQuery.trim());
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

        {/* Right Controls: Audits notification, Date switcher, Expand Cockpit toggle, User profile */}
        <div className="flex items-center gap-2 self-end lg:self-auto flex-wrap">
          {/* Audits Pill */}
          <button
            onClick={() => onNavigateTab("verification")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-xs"
          >
            <Bell className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px]">2 audits</span>
          </button>

          {/* Date Selector Pill */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-700 shadow-xs">
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-800 transition-colors" />
            <span className="text-[11px] font-semibold px-1">Today, Nov 3</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-800 transition-colors" />
          </div>

          {/* Expand / Standard View Cockpit Toggle */}
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                isExpanded
                  ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/20"
                  : "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50"
              }`}
              title={isExpanded ? "Collapse to Standard View" : "Expand Dashboard View"}
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
          )}

          {/* User Profile Pill */}
          <button
            onClick={onOpenLoginModal}
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

      {/* =========================================================================
          HERO GRID: 3-COLUMN STRUCTURE (Exact Layout from Reference Screenshot)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ---------------------------------------------------------------------
            LEFT COLUMN (lg:col-span-4): Active Sourcing Workspaces & Priority Projects
           --------------------------------------------------------------------- */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Card 1: Active Sourcing Workspaces */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex flex-col gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Active Sourcing Workspaces
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  4 verified factory partners • Active pilot allocation
                </p>
              </div>

              {/* Manufacturing Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span>{workspaceCategory}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-40">
                    {["Manufacturing", "Packaging", "Raw Materials"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setWorkspaceCategory(cat);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Inner Sourcing Activity Trend Box */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-2 relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 tracking-wide">
                    Sourcing Activity Trend
                  </span>
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                </div>
              </div>

              {/* Interactive Spline Chart */}
              <InteractiveChart />
            </div>
          </div>

          {/* Card 2: Priority Projects */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                Priority Projects
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>02 of 5</span>
                <div className="flex items-center gap-1">
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors" />
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors" />
                </div>
              </div>
            </div>

            {/* Two Priority Project Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Project 1: Eco Packaging */}
              <div className="bg-slate-50/80 border border-slate-200/80 hover:border-blue-400 rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[90px]">
                      Eco Packaging
                    </span>
                  </div>
                  <MoreHorizontal className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 cursor-pointer transition-colors" />
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600">
                    3,074 Verified
                  </div>
                  <div className="text-xs font-bold text-emerald-600 mt-0.5">
                    + 9.23 %
                  </div>
                </div>

                {/* Member Avatars */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center -space-x-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-600 border border-white flex items-center justify-center text-[10px] font-bold text-white">
                      U
                    </div>
                    <div className="w-6 h-6 rounded-full bg-purple-600 border border-white flex items-center justify-center text-[10px] font-bold text-white">
                      M
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[9px] font-medium text-slate-600">
                      99+
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab("workspaces")}
                    className="w-6 h-6 rounded-full bg-white hover:bg-blue-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Project 2: IoT Sensors */}
              <div className="bg-slate-50/80 border border-slate-200/80 hover:border-blue-400 rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[90px]">
                      IoT Sensors
                    </span>
                  </div>
                  <MoreHorizontal className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 cursor-pointer transition-colors" />
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600">
                    2,831 Verified
                  </div>
                  <div className="text-xs font-bold text-emerald-600 mt-0.5">
                    + 7.69 %
                  </div>
                </div>

                {/* Member Avatars */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center -space-x-1.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 border border-white flex items-center justify-center text-[10px] font-bold text-white">
                      J
                    </div>
                    <div className="w-6 h-6 rounded-full bg-amber-500 border border-white flex items-center justify-center text-[10px] font-bold text-white">
                      S
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[9px] font-medium text-slate-600">
                      99+
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab("workspaces")}
                    className="w-6 h-6 rounded-full bg-white hover:bg-blue-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------------
            CENTER COLUMN (lg:col-span-4): Total Landed Budget & Commercial Settlement
           --------------------------------------------------------------------- */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Card 1: Total Landed Budget */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-3">
            <div>
              {/* Header with Currency Switcher */}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Total Landed Budget
                </h3>

                <div className="relative">
                  <button
                    onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span>{currency === "USD" ? "US Dollar ($)" : "Indian Rupee (₹)"}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isCurrencyDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-40">
                      <button
                        onClick={() => {
                          setCurrency("USD");
                          setIsCurrencyDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between"
                      >
                        <span>US Dollar ($)</span>
                        {currency === "USD" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                      <button
                        onClick={() => {
                          setCurrency("INR");
                          setIsCurrencyDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between"
                      >
                        <span>Indian Rupee (₹)</span>
                        {currency === "INR" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-1">
                Aggregated capital allocated across active factory purchase orders
              </p>

              {/* Big Hero Stat: $ 23,094.57 with blue dollar sign */}
              <div className="mt-4 flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-blue-600 font-extrabold text-2xl sm:text-3xl">
                    {currencySymbol}
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {totalBalanceFormatted}
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span>Monthly variance</span>
                  <span className="text-rose-500 font-bold">- 37.16 %</span>
                </div>
              </div>

              {/* Subrow stats */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                <div className="font-semibold text-slate-700 flex items-center gap-1">
                  <span>Yearly avg:</span>
                  <span className="text-slate-900 font-bold">{yearlyAvgFormatted}</span>
                  <span className="text-slate-400">↗</span>
                </div>

                <button
                  onClick={onOpenAssistant}
                  className="text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Landed Economics</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Commercial Settlement */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-3 flex-1">
            <div className="flex flex-col gap-2.5">
              {/* Header: Commercial Settlement */}
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-emerald-700 tracking-wider uppercase">
                  Commercial Settlement
                </h3>
                <button
                  onClick={() => onNavigateTab("billing")}
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors cursor-pointer flex items-center gap-0.5"
                >
                  <span>Billing Hub</span>
                  <span className="text-[11px]">&gt;</span>
                </button>
              </div>

              {/* Zero Upfront Sourcing Fees Pill */}
              <div className="w-full py-1.5 px-3 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Upfront Sourcing Fees</span>
              </div>

              {/* Confirmed Contract GMV */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">
                  Confirmed Contract GMV
                </span>
                <span className="text-sm font-bold text-slate-900">
                  $ 142,500
                </span>
              </div>

              {/* Fee Rate Box with 5% flat and Fee Due */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-slate-500 font-medium">
                    Service Fee Rate
                  </span>
                  <span className="text-xs font-bold text-blue-600 mt-0.5">
                    5.0% flat
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-500 font-medium">
                    Fee Due on Close
                  </span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5">
                    $ 7,125
                  </span>
                </div>
              </div>

              {/* Description Paragraph */}
              <p className="text-[11px] text-slate-500 leading-relaxed">
                You only pay when a deal is confirmed. SupplyLens assesses a transparent 5% fee on confirmed contracts.
              </p>
            </div>

            {/* Bottom Row: Track Deals & Pay Fee */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => onNavigateTab("deals")}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold transition-colors cursor-pointer"
              >
                Track Deals (2)
              </button>

              <button
                onClick={() => onNavigateTab("billing")}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Pay Fee (5%)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------------
            RIGHT COLUMN (lg:col-span-4): SupplyLens AI (In Place of Audit Engine)
           --------------------------------------------------------------------- */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between h-full gap-4">
            <div>
              {/* Header: SupplyLens AI + Mode Toggles */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      SupplyLens AI
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Autonomous Sourcing Intelligence
                    </p>
                  </div>
                </div>

                {/* 3D Sphere / 3D Globe Mode Toggles */}
                <div className="flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200/80 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setAiSphereMode("sphere")}
                    className={`px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                      aiSphereMode === "sphere"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    3D Sphere
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiSphereMode("globe")}
                    className={`px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                      aiSphereMode === "globe"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    3D Globe
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className="py-1.5 px-3 rounded-full bg-blue-50/70 border border-blue-100 flex items-center gap-2 text-xs text-blue-800 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span className="text-[11px] font-medium truncate">
                  Updating supplier verification & quote audits now...
                </span>
              </div>

              {/* 3D Blue Ribbed Sphere Canvas */}
              <div className="w-full h-44 sm:h-48 flex items-center justify-center relative my-1">
                <AiSphere3D className="w-full h-full" isAnalyzing={true} />
              </div>
            </div>

            {/* Bottom Actions: Launch Agent & Instant RFQ Dispatch */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={onOpenAssistant}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-200 group-hover:rotate-12 transition-transform" />
                <span>Launch Autonomous Sourcing Agent</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleOpenRfqForSupplier(defaultSuppliersList[0])}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span>Instant Verified RFQ Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM SECTION: Verified Factory Partners (10-D AUDITED POOL)
         ========================================================================= */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-4">
        {/* Table Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Verified Factory Partners
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
              10-D AUDITED POOL
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Verification Desk Button */}
            <button
              onClick={() => onNavigateTab("verification")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Verification Desk</span>
            </button>

            {/* Explore All Suppliers Button */}
            <button
              onClick={() => onNavigateTab("suppliers")}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer group"
            >
              <span>Explore All Suppliers</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Factory Entity</th>
                <th className="py-3 px-3">Contact Desk</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">MOQ</th>
                <th className="py-3 px-3">Unit Quote</th>
                <th className="py-3 px-3">Audit Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSuppliers.map((sup) => (
                <tr
                  key={sup.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-3.5 px-3 font-semibold text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono font-bold">
                      {sup.rank}
                    </span>
                  </td>

                  {/* Factory Entity */}
                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenDossierForSupplier(sup)}
                        className="hover:text-blue-600 transition-colors text-left flex items-center gap-1.5 cursor-pointer font-bold"
                      >
                        <span>{sup.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      </button>
                    </div>
                  </td>

                  {/* Contact Desk */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[10px] font-bold text-blue-700 shrink-0">
                        {sup.avatars[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-medium">{sup.admin}</span>
                        <span className="text-[10px] text-slate-400 leading-none">{sup.adminRole}</span>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-3 text-slate-600 font-medium">
                    {sup.city}, {sup.country}
                  </td>

                  {/* MOQ */}
                  <td className="py-3.5 px-3 text-slate-800 font-semibold font-mono">
                    {sup.moq}
                  </td>

                  {/* Unit Quote */}
                  <td className="py-3.5 px-3 text-slate-900 font-bold font-mono">
                    {sup.price}
                  </td>

                  {/* Audit Status */}
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1 w-max">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{sup.status}</span>
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenRfqForSupplier(sup)}
                        className="px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                      >
                        <Send className="w-3 h-3" />
                        <span>RFQ</span>
                      </button>

                      <button
                        onClick={() => handleOpenDossierForSupplier(sup)}
                        className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Audit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RFQ Request Modal */}
      {selectedSupplierForRfq && (
        <RequestQuotationModal
          supplier={selectedSupplierForRfq}
          isOpen={true}
          onClose={() => setSelectedSupplierForRfq(null)}
          onSuccess={() => {
            setSelectedSupplierForRfq(null);
          }}
        />
      )}
    </div>
  );
};
