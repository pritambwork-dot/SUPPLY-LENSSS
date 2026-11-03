"use client";

import React, { useState } from "react";
import {
  Building2,
  MapPin,
  Coins,
  Factory,
  BarChart3,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowUpRight,
  Check,
  TrendingUp,
  Package,
  Layers,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Star,
  ShieldCheck,
  ExternalLink,
  GitCompare,
} from "lucide-react";
import {
  BusinessProfile,
  BusinessReadiness,
  BusinessStage,
  BusinessRequirement,
  ProgressMilestone,
  SavedSupplierItem,
} from "@/types";
import { formatCurrency } from "@/lib/utils";

interface BusinessProfileViewProps {
  profile: BusinessProfile;
  readiness: BusinessReadiness;
  requirements: BusinessRequirement[];
  milestones: ProgressMilestone[];
  onEditProfile: () => void;
  onViewRequirements: () => void;
  onViewSuppliers: () => void;
  onNavigateToCompare?: () => void;
  onUpdateStage: (stage: BusinessStage) => void;
  savedSuppliers?: SavedSupplierItem[];
  onRemoveSavedSupplier?: (id: string) => void;
  onSelectSupplierById?: (id: string) => void;
  onToggleCompareById?: (id: string) => void;
  comparedSupplierIds?: string[];
}

export const BusinessProfileView: React.FC<BusinessProfileViewProps> = ({
  profile,
  readiness,
  requirements,
  milestones,
  onEditProfile,
  onViewRequirements,
  onViewSuppliers,
  onNavigateToCompare,
  onUpdateStage,
  savedSuppliers = [],
  onRemoveSavedSupplier,
  onSelectSupplierById,
  onToggleCompareById,
  comparedSupplierIds = [],
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "saved">("profile");

  const stageOptions: { id: BusinessStage; emoji: string; label: string }[] = [
    { id: "idea", emoji: "💡", label: "Idea" },
    { id: "testing", emoji: "🧪", label: "Testing" },
    { id: "launching", emoji: "🚀", label: "Launching" },
    { id: "growing", emoji: "📈", label: "Growing" },
    { id: "established", emoji: "🏭", label: "Established" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* iOS-Style Sub-Navigation Segmented Control */}
      <div className="flex items-center p-1 rounded-full bg-slate-100 dark:bg-white/10 w-fit">
        <button
          onClick={() => setActiveSubTab("profile")}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activeSubTab === "profile"
              ? "bg-white text-slate-900 shadow-xs dark:bg-[#2C2C2E] dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Business Profile</span>
        </button>

        <button
          onClick={() => setActiveSubTab("saved")}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activeSubTab === "saved"
              ? "bg-white text-slate-900 shadow-xs dark:bg-[#2C2C2E] dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" />
          <span>Saved Suppliers</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              activeSubTab === "saved"
                ? "bg-slate-100 text-slate-700 dark:bg-white/15 dark:text-white"
                : "bg-black/5 dark:bg-white/10 text-slate-500"
            }`}
          >
            {savedSuppliers.length}
          </span>
        </button>
      </div>

      {/* VIEW 1: PROFILE & PROGRESS */}
      {activeSubTab === "profile" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 1. Apple-Style Clean Summary Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#1C1C1E]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-white/10">
              <div className="space-y-1 max-w-2xl">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Your Business Workspace
                </span>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  {profile.name}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                  {profile.idea}
                </p>
              </div>

              <button
                onClick={onEditProfile}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15 transition-all shrink-0 self-start sm:self-auto shadow-xs"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Concise Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 dark:border-white/10">
              <div>
                <span className="text-[11px] text-slate-400 block">Sector</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white block mt-0.5">
                  {profile.sector}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Target Location</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white block mt-0.5">
                  📍 {profile.location}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Initial Budget</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  {formatCurrency(profile.budgetAmount, profile.budgetCurrency)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Current Stage</span>
                <span className="text-sm font-semibold text-[#0071E3] capitalize block mt-0.5">
                  {profile.businessStage || "Testing"}
                </span>
              </div>
            </div>

            {/* Business Stage Selector */}
            <div className="pt-5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2.5">
                Update Stage:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {stageOptions.map((st) => {
                  const isActive = profile.businessStage === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => onUpdateStage(st.id)}
                      className={`flex items-center gap-2 rounded-2xl p-2.5 text-xs font-semibold transition-all border ${
                        isActive
                          ? "border-[#0071E3] bg-[#0071E3]/5 text-[#0071E3] shadow-xs"
                          : "border-slate-200/80 bg-slate-50/50 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                      }`}
                    >
                      <span className="text-base">{st.emoji}</span>
                      <span>{st.label}</span>
                      {isActive && <Check className="h-3.5 w-3.5 ml-auto text-[#0071E3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Single Clear Human AI Suggestion Tip Banner */}
          <div className="rounded-2xl border border-[#0071E3]/20 bg-[#0071E3]/5 p-4 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-[#0071E3] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-[#0071E3]">
                SupplyLens Sourcing Tip:
              </span>{" "}
              {profile.city.toLowerCase() === "bhubaneswar" || profile.location.toLowerCase().includes("odisha")
                ? "Suppliers in nearby Cuttack offer 1-2 day turnaround times, cutting domestic freight by up to 60% compared to southern manufacturing hubs."
                : `Verified suppliers within 300 km of ${profile.city} reduce shipping buffers and lower minimum batch cash outlay for testing.`}
            </div>
          </div>

          {/* 2. Visual Progress Tracker: Business idea ✓ → Requirements ✓ → Suppliers → Compare → Sourcing plan */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-[#1C1C1E]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Sourcing Journey Progress
            </h3>

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              {[
                { key: "idea", label: "Business idea", status: "completed" },
                { key: "requirements", label: "Requirements", status: "completed" },
                { key: "suppliers", label: "Suppliers", status: "current" },
                { key: "compare", label: "Compare", status: "upcoming" },
                { key: "sourcing", label: "Sourcing plan", status: "upcoming" },
              ].map((step, idx) => {
                const isDone = step.status === "completed";
                const isCurrent = step.status === "current";

                return (
                  <div key={step.key} className="flex items-center gap-2.5 md:flex-col md:items-center text-left md:text-center flex-1">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shrink-0 transition-all ${
                        isDone
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                          ? "bg-[#0071E3] text-white ring-4 ring-[#0071E3]/20"
                          : "bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500"
                      }`}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : idx + 1}
                    </div>
                    <div>
                      <span
                        className={`block text-xs font-medium ${
                          isDone
                            ? "text-slate-900 dark:text-white"
                            : isCurrent
                            ? "text-[#0071E3] font-semibold"
                            : "text-slate-400"
                        }`}
                      >
                        {step.label} {isDone && "✓"} {isCurrent && "→"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 1: What you need (Section 9 & 10) */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-[#1C1C1E] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  What you need
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Materials and production inputs identified for your business. Tap any item to find matched suppliers.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-white/10 px-2.5 py-1 rounded-full">
                {requirements.length} inputs
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/5 pt-1">
              {requirements.map((req) => (
                <div
                  key={req.id}
                  onClick={onViewSuppliers}
                  className="group flex items-center justify-between py-3.5 px-3 hover:bg-slate-50/80 dark:hover:bg-white/5 rounded-2xl cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0071E3]/10 text-[#0071E3] shrink-0">
                      {req.category?.toLowerCase().includes("machin") ? (
                        <Factory className="h-4 w-4" />
                      ) : (
                        <Package className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-[#0071E3] transition-colors block">
                        {req.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {req.category} • Est. {req.estimatedQty?.toLocaleString() || "1,000"} {req.unit || "units"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                        req.importance === "required" || req.priority === "essential"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {req.importance || "Required"}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#0071E3] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: Saved Suppliers Preview (Section 9) */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-[#1C1C1E] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Saved suppliers
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verified suppliers saved for comparison and upcoming order allocation.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-white/10 px-2.5 py-1 rounded-full">
                {savedSuppliers.length} saved
              </span>
            </div>

            {savedSuppliers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center bg-slate-50/50 dark:bg-white/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0071E3]/10 text-[#0071E3] mx-auto mb-2.5">
                  <Bookmark className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  No saved suppliers yet.
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                  Explore suppliers and tap save to compare them later.
                </p>
                <button
                  onClick={onViewSuppliers}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  <span>Explore suppliers</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {savedSuppliers.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectSupplierById && onSelectSupplierById(item.supplierId)}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {item.supplierName}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ Verified
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      📍 {item.city}, {item.country}
                    </p>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-white/5">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {formatCurrency(item.currentPrice || 0, item.currency)}
                      </span>
                      <span className="text-amber-500 font-medium flex items-center gap-0.5">
                        ★ {item.currentRating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: Next Step (Section 9) */}
          <div className="rounded-3xl border border-[#0071E3]/25 bg-gradient-to-r from-[#0071E3]/5 via-[#0071E3]/10 to-transparent p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0071E3]">
                  Next step
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  {savedSuppliers.length >= 2
                    ? "Compare your first 3 suppliers"
                    : "Review your packaging requirements"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {savedSuppliers.length >= 2
                    ? "Review delivered landed costs side-by-side to make your first production decision."
                    : "Connect with verified manufacturers ready to supply your initial test batch."}
                </p>
              </div>

              <button
                type="button"
                onClick={savedSuppliers.length >= 2 ? (onNavigateToCompare || onViewRequirements) : onViewSuppliers}
                className="inline-flex items-center gap-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white px-5 py-2.5 text-xs font-semibold shadow-xs transition-all shrink-0 self-start sm:self-auto cursor-pointer active:scale-95"
              >
                <span>{savedSuppliers.length >= 2 ? "Compare suppliers" : "Find suppliers"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SAVED SUPPLIERS (My Business -> Saved Suppliers) */}
      {activeSubTab === "saved" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-sky-500" />
                <span>Saved Suppliers</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bookmarked verified suppliers for your bill of materials and upcoming production runs.
              </p>
            </div>

            <button
              onClick={onViewSuppliers}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs self-start sm:self-auto"
            >
              <span>Explore More Suppliers</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {savedSuppliers.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 p-12 text-center bg-white/50 dark:bg-white/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0071E3]/10 text-[#0071E3] mx-auto mb-3">
                <Bookmark className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                No saved suppliers yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                Explore verified suppliers and save the ones you like.
              </p>
              <button
                onClick={onViewSuppliers}
                className="inline-flex items-center gap-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors"
              >
                <span>Explore suppliers</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedSuppliers.map((item) => {
                const isCompared = comparedSupplierIds.includes(item.supplierId);
                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#1C1C1E] flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">

                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <ShieldCheck className="h-3 w-3" />
                              <span>Verified</span>
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                            {item.supplierName}
                          </h4>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{item.city}, {item.country}</span>
                          </p>
                        </div>

                        {onRemoveSavedSupplier && (
                          <button
                            onClick={() => onRemoveSavedSupplier(item.supplierId)}
                            className="rounded-xl p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Remove from saved suppliers"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Product details */}
                      {item.productName && (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-white/10 dark:bg-white/5">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                            Target Requirement
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                            {item.productName}
                          </span>
                          <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 dark:border-white/10">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Price Listed</span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {formatCurrency(item.currentPrice || 0, item.currency)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Public Rating</span>
                              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                                <Star className="h-3 w-3 fill-amber-500" />
                                {item.currentRating} / 5.0
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
                        <span>Audited: {item.lastVerifiedDate}</span>
                        <span>{item.savedAt}</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                      {onToggleCompareById && (
                        <button
                          onClick={() => onToggleCompareById(item.supplierId)}
                          className={`flex-1 flex items-center justify-center gap-1 rounded-full py-2 text-xs font-semibold transition-all ${
                            isCompared
                              ? "bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/30"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-white/10 dark:text-slate-300"
                          }`}
                        >
                          {isCompared ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>In Compare</span>
                            </>
                          ) : (
                            <>
                              <GitCompare className="h-3.5 w-3.5" />
                              <span>Compare</span>
                            </>
                          )}
                        </button>
                      )}

                      {onSelectSupplierById && (
                        <button
                          onClick={() => onSelectSupplierById(item.supplierId)}
                          className="flex items-center justify-center gap-1 rounded-full bg-[#0071E3] hover:bg-[#0077ED] px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs"
                        >
                          <span>View</span>
                          <ExternalLink className="h-3 w-3" />
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
    </div>
  );
};

