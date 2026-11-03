"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Bookmark,
  BookmarkCheck,
  Building2,
  Package,
  ShieldCheck,
  Send,
  Star,
  ExternalLink,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  LayoutGrid,
  Map as MapIcon,
  Globe2,
  GitCompare,
  ArrowUpDown,
  ChevronRight,
} from "lucide-react";
import { Supplier, BusinessProfile } from "@/types";
import { api } from "@/services/api";
import { RequestQuotationModal } from "@/components/quotations/RequestQuotationModal";
import { LeftNavRail } from "@/components/layout/LeftNavRail";
import { AIAssistantDrawer } from "@/components/assistant/AIAssistantDrawer";
import { AnimatedGlassBackground } from "@/components/common/AnimatedGlassBackground";
import { initialBusinessProfile } from "@/data/mockData";
import { LayoutDashboard, FileText, Bell, Check, ChevronDown, ChevronLeft } from "lucide-react";

export default function VendorDirectoryPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [maxMoq, setMaxMoq] = useState<number>(100000);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [sortBy, setSortBy] = useState("recommended");
  const [savedSupplierIds, setSavedSupplierIds] = useState<string[]>([]);
  const [comparedSupplierIds, setComparedSupplierIds] = useState<string[]>([]);

  // Modal State
  const [selectedSupplierForRfq, setSelectedSupplierForRfq] = useState<Supplier | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [businessProfile] = useState<BusinessProfile>(initialBusinessProfile);

  // Fetch initial suppliers from backend API
  useEffect(() => {
    async function loadSuppliers() {
      setIsLoading(true);
      try {
        const list = await api.suppliers.list({
          verified_only: verifiedOnly,
          sort_by: sortBy,
        });
        setSuppliers(list);
      } catch (err) {
        console.error("Error loading suppliers:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSuppliers();
  }, [verifiedOnly, sortBy]);

  // Load saved suppliers
  useEffect(() => {
    async function loadSaved() {
      try {
        const saved = await api.suppliers.getSaved();
        if (Array.isArray(saved)) {
          setSavedSupplierIds(saved.map((item: any) => item.supplier_id));
        }
      } catch {}
    }
    loadSaved();
  }, []);

  const handleToggleSave = async (supplier: Supplier, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res: any = await api.suppliers.save(supplier.id);
      if (res.is_saved) {
        setSavedSupplierIds((prev) => [...prev, supplier.id]);
        showToast(`Saved ${supplier.name} to your shortlisted vendors`);
        api.customer.logActivity({
          activity_type: "save_vendor",
          title: `Saved ${supplier.name}`,
          description: `Added ${supplier.name} (${supplier.city}, ${supplier.country}) to saved vendors list.`,
          entity_type: "supplier",
          entity_id: supplier.id,
        });
      } else {
        setSavedSupplierIds((prev) => prev.filter((id) => id !== supplier.id));
        showToast(`Removed ${supplier.name} from saved vendors`);
      }
    } catch {
      showToast("Could not update bookmark.");
    }
  };

  const handleToggleCompare = (supplier: Supplier, e: React.MouseEvent) => {
    e.stopPropagation();
    if (comparedSupplierIds.includes(supplier.id)) {
      setComparedSupplierIds((prev) => prev.filter((id) => id !== supplier.id));
      showToast(`Removed ${supplier.name} from comparison`);
    } else {
      if (comparedSupplierIds.length >= 5) {
        showToast("Maximum 5 suppliers can be compared simultaneously");
        return;
      }
      setComparedSupplierIds((prev) => [...prev, supplier.id]);
      showToast(`Added ${supplier.name} to comparison matrix`);
      api.customer.logActivity({
        activity_type: "compare",
        title: `Added ${supplier.name} to Comparison`,
        description: `Selected ${supplier.name} for multi-vendor cost and capability evaluation.`,
        entity_type: "supplier",
        entity_id: supplier.id,
      });
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Extract unique filters
  const countries = useMemo(() => {
    const set = new Set(suppliers.map((s) => s.country).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [suppliers]);

  const supplierTypes = useMemo(() => {
    const set = new Set(suppliers.map((s) => s.supplierType).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [suppliers]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    suppliers.forEach((s) => {
      s.products?.forEach((p) => {
        if (p.category) cats.add(p.category);
      });
    });
    return ["all", ...Array.from(cats)];
  }, [suppliers]);

  // Client-side filtering
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesCity = s.city.toLowerCase().includes(q);
        const matchesCountry = s.country.toLowerCase().includes(q);
        const matchesType = (s.supplierType || "").toLowerCase().includes(q);
        const matchesProduct = s.products?.some(
          (p) => p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q))
        );
        const matchesCapability = s.capabilities?.some((c) => c.toLowerCase().includes(q));
        if (!matchesName && !matchesCity && !matchesCountry && !matchesType && !matchesProduct && !matchesCapability) {
          return false;
        }
      }

      if (selectedCountry !== "all" && s.country !== selectedCountry) return false;
      if (selectedType !== "all" && s.supplierType !== selectedType) return false;
      if (selectedCategory !== "all") {
        const hasCategory = s.products?.some((p) => p.category === selectedCategory);
        if (!hasCategory) return false;
      }

      // Check MOQ & Price
      const minMoq = s.products && s.products.length > 0 ? Math.min(...s.products.map((p) => p.moq || 1000)) : 1000;
      if (minMoq > maxMoq) return false;

      return true;
    });
  }, [suppliers, searchQuery, selectedCountry, selectedType, selectedCategory, maxMoq]);

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
        router.push("/customer/invoices");
        break;
      case "landing":
        router.push("/landing");
        break;
      default:
        router.push("/dashboard");
        break;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F6F9] text-slate-800 antialiased font-sans">
      {/* Sleek Left Navigation Rail */}
      <LeftNavRail
        activeTab="suppliers"
        onTabChange={handleTabChange}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenAuth={() => {}}
        isLoggedIn={true}
        theme="light"
      />

      {/* Main Cockpit Content Area */}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative p-3 sm:p-5 flex flex-col gap-4 font-sans antialiased">
        {/* Animated Glassmorphism Ambient Mesh Background */}
        <AnimatedGlassBackground />

        {/* =========================================================================
            TOP FLOATING COCKPIT BAR (Frosted Glassmorphism with Backdrop Blur)
           ========================================================================= */}
        <header className="bg-white/80 backdrop-blur-xl border border-white/80 shadow-[0_4px_24px_rgba(15,23,42,0.03)] rounded-3xl p-3 sm:p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-20 shrink-0">
          {/* Left: Section Dropdown Switcher + Quick Navigation Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <button
                onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                className="flex items-center gap-1.5 text-base font-extrabold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer group"
              >
                <span>Verified Factory Partners</span>
                <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-transform group-hover:translate-y-0.5" />
              </button>

              {isWorkspaceDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Workspace Section
                  </div>
                  {[
                    { label: "Verified Factory Directory", href: "/vendors" },
                    { label: "Vendor Comparison Matrix", href: "/customer/comparisons" },
                    { label: "Sourcing Requirements & BOM", href: "/customer/requirements" },
                    { label: "Saved Factory Partners", href: "/customer/saved-vendors" },
                    { label: "10-D Verification Desk", href: "/verification" },
                    { label: "Sourcing Deals & Contracts", href: "/customer/deals" },
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
                      {item.href === "/vendors" && <Check className="w-3.5 h-3.5 text-blue-600" />}
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
            <div className="relative flex items-center w-full">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter suppliers by country, capability, or material..."
                className="w-full pl-10 pr-20 py-2 rounded-full bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xs"
              />
              <button
                type="button"
                className="absolute right-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>

          {/* Right Controls: Audits notification, Date switcher, User profile */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <Link
              href="/verification"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-xs"
            >
              <Bell className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px]">2 audits</span>
            </Link>

            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-700 shadow-xs">
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-800 transition-colors" />
              <span className="text-[11px] font-semibold px-1">Today, Nov 3</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-800 transition-colors" />
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-xs">
              <div className="w-7 h-7 rounded-full bg-blue-600 p-0.5 shadow-xs flex items-center justify-center text-white text-xs font-bold">
                H
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-slate-900 leading-tight">
                  Hossein
                </span>
                <span className="text-[9px] text-slate-400 leading-none">
                  @user680523
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="w-full space-y-4">
        {/* Header & Sourcing Search */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Global Supplier Sourcing Engine
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Verified Vendor Directory
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Discover verified manufacturers, compare commercial MOQs, and submit direct quotation requests with 10-D audit verification.
              </p>
            </div>

            {/* Quick Sourcing Badge */}
            <div className="flex items-center gap-2 self-start md:self-auto px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                <strong className="text-slate-800">{filteredSuppliers.length}</strong> Verified Vendors Active
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by vendor name, raw material, product, manufacturing capability, city, or country..."
              className="w-full pl-12 pr-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Bar Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            {/* Country Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-transparent focus:outline-none font-medium cursor-pointer"
              >
                <option value="all">All Countries</option>
                {countries.filter((c) => c !== "all").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Supplier Type Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent focus:outline-none font-medium cursor-pointer"
              >
                <option value="all">All Vendor Types</option>
                {supplierTypes.filter((t) => t !== "all").map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent focus:outline-none font-medium cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.filter((cat) => cat !== "all").map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Verification Toggle */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                verifiedOnly
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              10-D Verified Only
            </button>

            {/* Sort Dropdown */}
            <div className="ml-auto flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none font-medium cursor-pointer"
              >
                <option value="recommended">Recommended Match</option>
                <option value="rating">Highest Rated</option>
                <option value="cheapest">Lowest Price</option>
                <option value="moq_asc">Lowest MOQ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vendors Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500">Querying verified vendor database...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Vendors Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              We couldn&apos;t find any suppliers matching your current filter criteria. Try clearing your search query or broadening the selected filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCountry("all");
                setSelectedType("all");
                setSelectedCategory("all");
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => {
              const isSaved = savedSupplierIds.includes(supplier.id);
              const isCompared = comparedSupplierIds.includes(supplier.id);
              const p0 = supplier.products?.[0];

              return (
                <div
                  key={supplier.id}
                  onClick={() => router.push(`/vendors/${supplier.id}`)}
                  className="group relative glass-panel-3d rounded-3xl p-6 hover:border-blue-500/50 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Top Row: Logo, Name, Bookmark */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                          {supplier.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                            {supplier.name}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{supplier.city}, {supplier.country}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bookmark Icon */}
                      <button
                        onClick={(e) => handleToggleSave(supplier, e)}
                        className={`p-2 rounded-xl transition-all ${
                          isSaved
                            ? "bg-amber-50 text-amber-600 border border-amber-200"
                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        }`}
                        title={isSaved ? "Saved" : "Save Vendor"}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Verification Status Pill */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {supplier.verificationStatus || "Demo Verified"}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 border-l border-slate-200 pl-2">
                        {supplier.supplierType || "Manufacturer"}
                      </span>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {supplier.description || "Specialized certified manufacturing provider for high-volume custom production."}
                    </p>

                    {/* Commercial Data Box (MOQ & Price) */}
                    <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                          Starting MOQ
                        </span>
                        <span className="font-bold text-slate-900 font-mono">
                          {p0?.moq ? `${p0.moq.toLocaleString()} ${p0.unit || "pcs"}` : "1,000 pcs"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                          Quoted Price
                        </span>
                        <span className="font-bold text-slate-900 font-mono">
                          {p0?.quoted_price ? `${p0.currency || "INR"} ${p0.quoted_price}` : "Quote on Request"}
                        </span>
                      </div>
                    </div>

                    {/* Capabilities & Badges */}
                    {supplier.capabilities && supplier.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {supplier.capabilities.slice(0, 2).map((cap, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-600"
                          >
                            {cap}
                          </span>
                        ))}
                        {supplier.capabilities.length > 2 && (
                          <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-medium text-slate-400">
                            +{supplier.capabilities.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Compare Button */}
                    <button
                      onClick={(e) => handleToggleCompare(supplier, e)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isCompared
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      {isCompared ? "Compared" : "Compare"}
                    </button>

                    {/* Request Quotation */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSupplierForRfq(supplier);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Request Quote
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </main>

      {/* RFQ Modal */}
      <RequestQuotationModal
        isOpen={Boolean(selectedSupplierForRfq)}
        onClose={() => setSelectedSupplierForRfq(null)}
        supplier={selectedSupplierForRfq}
        onSuccess={(rfq) => {
          showToast(`RFQ ${rfq?.id || 'Request'} created successfully!`);
        }}
      />

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

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-800 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
