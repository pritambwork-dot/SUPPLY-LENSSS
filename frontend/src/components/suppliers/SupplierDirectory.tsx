"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Check,
  MapPin,
  Bookmark,
  BookmarkCheck,
  X,
  AlertCircle,
  Sparkles,
  Globe2,
} from "lucide-react";
import { Supplier, BusinessProfile } from "@/types";
import { SupplierMap } from "@/components/map/SupplierMap";
import { GlobalGlobe } from "@/components/3d/GlobalGlobe";
import { SpatialCard } from "@/components/3d/SpatialCard";
import { NeuralIntelligenceModal } from "@/components/neural/NeuralIntelligenceModal";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { RatingDisplay } from "@/components/common/RatingDisplay";
import { AIMatchBadge } from "@/components/common/AIMatchBadge";

interface SupplierDirectoryProps {
  suppliers: Supplier[];
  onSelectSupplier: (supplier: Supplier) => void;
  onToggleCompare: (supplier: Supplier) => void;
  comparedSupplierIds: string[];
  savedSupplierIds?: string[];
  onToggleSave?: (supplier: Supplier) => void;
  theme: "dark" | "light";
  initialSearchQuery?: string;
  businessProfile?: BusinessProfile;
  isLoading?: boolean;
  onPerformLiveSearch?: (query: string) => void;
  onNavigateToCompare?: () => void;
  initialViewMode?: "list" | "map" | "globe3d";
}

export const SupplierDirectory: React.FC<SupplierDirectoryProps> = ({
  suppliers,
  onSelectSupplier,
  onToggleCompare,
  comparedSupplierIds,
  savedSupplierIds = [],
  onToggleSave,
  theme,
  initialSearchQuery = "",
  businessProfile,
  isLoading = false,
  onPerformLiveSearch,
  onNavigateToCompare,
  initialViewMode = "list",
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedSupplierType, setSelectedSupplierType] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [maxMoq, setMaxMoq] = useState<number>(100000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [viewMode, setViewMode] = useState<"list" | "map" | "globe3d">(initialViewMode);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [selectedSupplierForNeuralModal, setSelectedSupplierForNeuralModal] = useState<Supplier | null>(null);

  React.useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  React.useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchTerm(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Distinct countries and supplier types
  const countries = useMemo(() => {
    const list = Array.from(new Set(suppliers.map((s) => s.country)));
    return ["all", ...list];
  }, [suppliers]);

  const supplierTypes = useMemo(() => {
    const list = Array.from(new Set(suppliers.map((s) => s.supplierType)));
    return ["all", ...list];
  }, [suppliers]);

  // Quick Filter Chips (Section 18)
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  const handleQuickFilter = (filterKey: string) => {
    if (activeQuickFilter === filterKey) {
      setActiveQuickFilter(null);
      setSortBy("recommended");
      setMaxMoq(100000);
      setMinRating(0);
    } else {
      setActiveQuickFilter(filterKey);
      if (filterKey === "cheapest") {
        setSortBy("cheapest");
      } else if (filterKey === "low_moq") {
        setMaxMoq(2500);
        setSortBy("lowest_moq");
      } else if (filterKey === "highest_rated") {
        setMinRating(4.5);
        setSortBy("highest_rated");
      } else if (filterKey === "nearby") {
        setSortBy("nearest");
      } else if (filterKey === "verified") {
        setVerifiedOnly(true);
        setSortBy("recommended");
      }
    }
  };

  // Filter & Sort Logic
  const filteredSuppliers = useMemo(() => {
    const res = suppliers.filter((s) => {
      // 1. Search Query
      const searchLower = searchTerm.toLowerCase().trim();
      if (searchLower) {
        const matchesName = s.name.toLowerCase().includes(searchLower);
        const matchesCity = s.city.toLowerCase().includes(searchLower);
        const matchesCountry = s.country.toLowerCase().includes(searchLower);
        const matchesProduct = s.products.some(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.category.toLowerCase().includes(searchLower)
        );
        if (!matchesName && !matchesCity && !matchesCountry && !matchesProduct) {
          return false;
        }
      }

      // 2. Country
      if (selectedCountry !== "all" && s.country !== selectedCountry) {
        return false;
      }

      // 3. Supplier Type
      if (selectedSupplierType !== "all" && s.supplierType !== selectedSupplierType) {
        return false;
      }

      // 4. Verified Only
      if (verifiedOnly && s.verificationStatus !== "Verified") {
        return false;
      }

      // 5. MOQ
      const lowestMoq = Math.min(...s.products.map((p) => p.moq));
      if (lowestMoq > maxMoq) {
        return false;
      }

      // 6. Rating
      if (s.rating < minRating) {
        return false;
      }

      return true;
    });

    // Sorting (Section 23: Best for me, Cheapest, Best rated, Best for starting small)
    return [...res].sort((a, b) => {
      if (sortBy === "cheapest") {
        const pA = a.products[0]?.quotedPrice || 999999;
        const pB = b.products[0]?.quotedPrice || 999999;
        return pA - pB;
      }
      if (sortBy === "highest_rated") {
        return b.rating - a.rating;
      }
      if (sortBy === "lowest_moq") {
        const moqA = a.products[0]?.moq || 999999;
        const moqB = b.products[0]?.moq || 999999;
        return moqA - moqB;
      }
      if (sortBy === "nearest") {
        return a.distanceKm - b.distanceKm;
      }
      // Default: Best for me (matchScore)
      return (b.matchScore || 90) - (a.matchScore || 90);
    });
  }, [
    suppliers,
    searchTerm,
    selectedCountry,
    selectedSupplierType,
    verifiedOnly,
    maxMoq,
    minRating,
    sortBy,
  ]);

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSelectedCountry("all");
    setSelectedSupplierType("all");
    setMaxMoq(100000);
    setMinRating(0);
    setVerifiedOnly(true);
    setSortBy("recommended");
    setActiveQuickFilter(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header (Section 12: Find suppliers) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Find suppliers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Verified suppliers matched to your business.
          </p>
        </div>

        {/* List | Map Segmented Control (Section 17) */}
        <div className="flex items-center bg-slate-100/90 dark:bg-white/10 p-1 rounded-full border border-slate-200/60 dark:border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              viewMode === "list"
                ? "bg-white text-slate-900 shadow-2xs dark:bg-[#2C2C2E] dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              viewMode === "map"
                ? "bg-white text-slate-900 shadow-2xs dark:bg-[#2C2C2E] dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setViewMode("globe3d")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === "globe3d"
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>3D Globe</span>
          </button>
        </div>
      </div>

      {/* Prominent Search Field with Live Discovery Trigger */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (searchTerm.trim() && onPerformLiveSearch) {
            onPerformLiveSearch(searchTerm);
          }
        }}
        className="relative flex items-center"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search product, category, or factory name (e.g. biodegradable packaging)..."
          className="w-full rounded-full border border-slate-200/80 bg-white pl-11 pr-28 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none dark:border-white/10 dark:bg-[#1C1C1E] dark:text-white dark:placeholder:text-slate-500 shadow-xs transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !searchTerm.trim()}
            className="rounded-full bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            {isLoading ? (
              <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Small Quick Filters Bar + More Filters Button (Section 18) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "verified", label: "Verified" },
            { id: "cheapest", label: "Cheapest" },
            { id: "low_moq", label: "Low MOQ" },
            { id: "highest_rated", label: "Highest rated" },
            { id: "nearby", label: "Nearby" },
          ].map((item) => {
            const isActive = activeQuickFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleQuickFilter(item.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border ${
                  isActive
                    ? "border-[#0071E3] bg-[#0071E3] text-white shadow-2xs"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-[#1C1C1E] dark:text-slate-300 dark:hover:bg-white/15"
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* More Filters button (opens side/bottom sheet) */}
          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            className="rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-dashed border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white transition-all flex items-center gap-1"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>More filters</span>
          </button>
        </div>

        {/* Candidate Count & Natural Sort */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{filteredSuppliers.length} suppliers</span>
          <span>•</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-xs font-semibold text-[#0071E3] focus:outline-none cursor-pointer"
          >
            <option value="recommended">Best for me</option>
            <option value="cheapest">Cheapest</option>
            <option value="highest_rated">Best rated</option>
            <option value="lowest_moq">Best for starting small</option>
            <option value="nearest">Nearby</option>
          </select>
        </div>
      </div>

      {/* Main Content: 3D Globe, 2D Map, or List (Section 15, 16, 17) */}
      {viewMode === "globe3d" ? (
        <div className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <GlobalGlobe
            suppliers={filteredSuppliers}
            onSelectSupplier={(id) => {
              const found = suppliers.find((s) => s.id === id);
              if (found) onSelectSupplier(found);
            }}
            height={520}
          />
        </div>
      ) : viewMode === "map" ? (
        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-xs">
          <SupplierMap
            suppliers={filteredSuppliers}
            onSelectSupplier={onSelectSupplier}
            onToggleCompare={onToggleCompare}
            comparedSupplierIds={comparedSupplierIds}
            theme={theme}
          />
        </div>
      ) : (
        /* Clean List of Supplier Cards (Section 12 & 13) */
        <div>
          {isLoading ? (
            /* Animated Loading State with Progress Indicator */
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2.5 text-xs text-[#0071E3] dark:text-blue-400 font-medium bg-[#0071E3]/10 dark:bg-[#0071E3]/20 px-4 py-3 rounded-2xl animate-pulse">
                <span className="inline-block h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Discovering verified suppliers via live search indexes...</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-white/10 dark:bg-[#1C1C1E] animate-pulse space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-36 bg-slate-200 dark:bg-white/10 rounded-full" />
                      <div className="h-4 w-16 bg-slate-200 dark:bg-white/10 rounded-full" />
                    </div>
                    <div className="h-4 w-44 bg-slate-100 dark:bg-white/5 rounded-full" />
                    <div className="h-16 w-full bg-slate-100 dark:bg-white/5 rounded-2xl" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-9 flex-1 bg-slate-200 dark:bg-white/10 rounded-full" />
                      <div className="h-9 flex-1 bg-slate-100 dark:bg-white/5 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            /* Friendly, Actionable Empty State */
            <div className="rounded-3xl border border-dashed border-slate-200 dark:border-white/10 p-10 text-center bg-white/70 dark:bg-[#1C1C1E]/70 max-w-lg mx-auto my-6 space-y-4 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0071E3]/10 text-[#0071E3] mx-auto">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Discover verified suppliers
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Search for any material, packaging, or factory product to discover and verify real-world suppliers in real time.
                </p>
              </div>

              {/* Actionable discovery queries */}
              <div className="pt-2 flex flex-wrap justify-center gap-1.5 text-xs">
                {[
                  { label: "Eco Packaging", query: "biodegradable packaging india" },
                  { label: "Corrugated Boxes", query: "corrugated packaging manufacturer" },
                  { label: "Cotton Textiles", query: "cotton apparel manufacturing" },
                  { label: "Injection Molding", query: "plastic injection molding factory" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setSearchTerm(item.query);
                      if (onPerformLiveSearch) onPerformLiveSearch(item.query);
                    }}
                    className="rounded-full px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const q = searchTerm.trim() || "sustainable packaging india";
                    if (onPerformLiveSearch) onPerformLiveSearch(q);
                  }}
                  className="rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white px-5 py-2.5 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Discover live suppliers</span>
                </button>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="rounded-full border border-slate-200 dark:border-white/10 bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-4 py-2.5 text-xs font-semibold transition-all"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSuppliers.map((supplier) => {
                const primaryProduct = supplier.products[0];
                const isCompared = comparedSupplierIds.includes(supplier.id);
                const isSaved = savedSupplierIds.includes(supplier.id);

                return (
                  <div
                    key={supplier.id}
                    className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-all dark:border-white/10 dark:bg-[#1C1C1E] flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Company Name (Strongest) & VerifiedBadge */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 tracking-tight">
                          {supplier.name}
                        </h3>
                        <VerifiedBadge />
                      </div>

                      {/* Location (Secondary) */}
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{supplier.city}, {supplier.country}</span>
                      </div>

                      {/* Rating (Separate public rating per Section 24) */}
                      <div className="mb-3">
                        <RatingDisplay rating={supplier.rating} reviewCount={supplier.reviewCount} />
                      </div>

                      {/* Price & MOQ (Prominent Price, Supporting MOQ per Section 13 & 23) */}
                      {primaryProduct && (
                        <div className="rounded-2xl bg-slate-50/80 dark:bg-white/5 p-3 mb-3 flex items-center justify-between">
                          <PriceDisplay
                            price={primaryProduct.quotedPrice}
                            currency={primaryProduct.currency || "INR"}
                            unit={primaryProduct.unit}
                            priceType="listed"
                          />

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase font-medium">Min. Order</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              MOQ {primaryProduct.moq.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Simple AI Match (Section 25: AIMatchBadge) */}
                      <div className="mb-2">
                        <AIMatchBadge
                          tier={supplier.neuralFit?.fit_tier || "strong"}
                          reason={supplier.neuralFit?.top_positive_factor || "Fits your current order size and budget"}
                          showReason={true}
                          onClickDetails={() => setSelectedSupplierForNeuralModal(supplier)}
                        />
                      </div>
                    </div>

                    {/* Actions: View, Compare, Save (Section 12) */}
                    <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                      {/* View Supplier Details */}
                      <button
                        type="button"
                        onClick={() => onSelectSupplier(supplier)}
                        className="flex-1 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white py-2 text-xs font-semibold transition-colors shadow-2xs text-center"
                      >
                        View
                      </button>

                      {/* Compare Toggle */}
                      <button
                        type="button"
                        onClick={() => onToggleCompare(supplier)}
                        className={`flex-1 flex items-center justify-center gap-1 rounded-full py-2 text-xs font-semibold transition-colors border ${
                          isCompared
                            ? "bg-[#0071E3]/10 text-[#0071E3] border-[#0071E3]/30"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                        }`}
                      >
                        {isCompared ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>Compared</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3" />
                            <span>Compare</span>
                          </>
                        )}
                      </button>

                      {/* Save Bookmark */}
                      {onToggleSave && (
                        <button
                          type="button"
                          onClick={() => onToggleSave(supplier)}
                          className={`rounded-full p-2 border transition-colors ${
                            isSaved
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                              : "border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400"
                          }`}
                          title={isSaved ? "Saved" : "Save supplier"}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="h-4 w-4" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Filter Side Sheet (Section 19: Build a refined bottom sheet or side sheet) */}
      {isFilterSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 border-l border-slate-200 dark:border-white/10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Filter Suppliers
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Filter Sections */}
              <div className="space-y-5 text-xs">
                {/* 1. Country */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-2">
                    Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c === "all" ? "All Global Hubs" : c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Maximum MOQ */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-2">
                    Maximum MOQ
                  </label>
                  <select
                    value={maxMoq}
                    onChange={(e) => setMaxMoq(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    <option value={100}>Under 100 units</option>
                    <option value={1000}>Under 1,000 units</option>
                    <option value={5000}>Under 5,000 units</option>
                    <option value={20000}>Under 20,000 units</option>
                    <option value={100000}>Any MOQ</option>
                  </select>
                </div>

                {/* 3. Rating */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-2">
                    Minimum Rating
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 4.0, 4.5, 4.8].map((rt) => (
                      <button
                        key={rt}
                        type="button"
                        onClick={() => setMinRating(rt)}
                        className={`rounded-2xl p-2.5 font-semibold text-center transition-all border ${
                          minRating === rt
                            ? "border-[#0071E3] bg-[#0071E3]/10 text-[#0071E3]"
                            : "border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                        }`}
                      >
                        {rt === 0 ? "Any" : `${rt}+ ⭐`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Supplier Type */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-2">
                    Supplier Type
                  </label>
                  <select
                    value={selectedSupplierType}
                    onChange={(e) => setSelectedSupplierType(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    {supplierTypes.map((t) => (
                      <option key={t} value={t}>
                        {t === "all" ? "All Supplier Types" : t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Verified Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/20">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Verified suppliers only
                  </span>
                </label>
              </div>
            </div>

            {/* Bottom Actions: Apply Filters & Clear All */}
            <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="flex-1 rounded-full py-2.5 text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 transition-colors"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="flex-1 rounded-full py-2.5 text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-2xs transition-colors"
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Neural match explanation modal */}
      {selectedSupplierForNeuralModal && (
        <NeuralIntelligenceModal
          isOpen={Boolean(selectedSupplierForNeuralModal)}
          supplier={selectedSupplierForNeuralModal}
          businessProfile={businessProfile}
          onClose={() => setSelectedSupplierForNeuralModal(null)}
          onViewProfile={() => {
            const s = selectedSupplierForNeuralModal;
            setSelectedSupplierForNeuralModal(null);
            onSelectSupplier(s);
          }}
        />
      )}
      {/* Floating Bottom Compare Dock (1-5 candidates) */}
      {comparedSupplierIds.length > 0 && onNavigateToCompare && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3.5 bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md border border-white/10 dark:border-black/10 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0071E3] text-[10px] font-bold text-white shadow-2xs">
              {comparedSupplierIds.length}
            </span>
            <span className="text-xs font-semibold">
              {comparedSupplierIds.length} candidate{comparedSupplierIds.length === 1 ? '' : 's'} to compare
            </span>
          </div>
          <div className="h-4 w-px bg-white/20 dark:bg-black/20" />
          <button
            type="button"
            onClick={onNavigateToCompare}
            className="rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white px-3.5 py-1 text-xs font-semibold transition-all shadow-xs active:scale-95"
          >
            Compare now
          </button>
        </div>
      )}
    </div>
  );
};
