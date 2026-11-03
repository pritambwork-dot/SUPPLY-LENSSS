"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Award,
  TrendingDown,
  Zap,
  Star,
  ArrowRight,
  ShieldCheck,
  Check,
  Plus,
  Info,
  MapPin,
  Clock,
} from "lucide-react";
import { SupplierRecommendation, Supplier, BusinessProfile } from "@/types";

interface RecommendationCardsProps {
  businessProfile: BusinessProfile | null;
  recommendations: SupplierRecommendation[];
  suppliers: Supplier[];
  onSelectSupplier: (supplier: Supplier) => void;
  onToggleCompare: (supplier: Supplier) => void;
  comparedSupplierIds: string[];
}

export const RecommendationCards: React.FC<RecommendationCardsProps> = ({
  businessProfile,
  recommendations,
  suppliers,
  onSelectSupplier,
  onToggleCompare,
  comparedSupplierIds,
}) => {
  const [selectedType, setSelectedType] = useState<string>("best_overall");

  const getLensIcon = (type: string) => {
    switch (type) {
      case "best_overall":
        return Award;
      case "cheapest":
        return TrendingDown;
      case "highest_rated":
        return Star;
      case "fastest":
        return Zap;
      default:
        return Sparkles;
    }
  };

  const getBadgeStyle = (color: string) => {
    switch (color) {
      case "emerald":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "cyan":
      case "blue":
        return "bg-[#0071E3]/10 text-[#0071E3] dark:text-[#3894f8] border-[#0071E3]/30";
      case "amber":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-white/10 dark:text-slate-300 dark:border-white/10";
    }
  };

  const activeRec = recommendations.find((r) => r.type === selectedType) || recommendations[0];
  const matchedSupplier = suppliers.find((s) => s.id === activeRec?.supplierId) || suppliers[0];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0071E3]/10 px-3 py-1 text-xs font-semibold text-[#0071E3] dark:text-[#3894f8] border border-[#0071E3]/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Profile-Aware Personalization</span>
          </span>
          {businessProfile && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Personalized for {businessProfile.city} • Stage: {businessProfile.businessStage.toUpperCase()}
            </span>
          )}
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Best match for your business
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          We ranked these suppliers based on your actual budget, order size, distance from {businessProfile?.city || "your location"}, and physical audit reliability.
        </p>
      </div>

      {/* 4 Recommendation Lenses Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {recommendations.map((rec) => {
          const Icon = getLensIcon(rec.type);
          const isSelected = selectedType === rec.type;

          return (
            <button
              key={rec.type}
              onClick={() => setSelectedType(rec.type)}
              className={`rounded-2xl border p-4 text-left transition-all flex flex-col justify-between active:scale-95 ${
                isSelected
                  ? "border-[#0071E3] bg-[#0071E3]/5 shadow-xs dark:bg-[#0071E3]/15 dark:border-[#0071E3]"
                  : "border-slate-200/80 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-[#1C1C1E] dark:hover:border-white/20"
              }`}
            >
              <div>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl mb-3 ${
                    isSelected
                      ? "bg-[#0071E3] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {rec.title}
                </h4>
              </div>

              <div className="mt-3">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate block">
                  {rec.supplierName}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Detailed Recommendation Card */}
      {activeRec && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#1C1C1E] transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${getBadgeStyle(
                    activeRec.badgeColor
                  )}`}
                >
                  <Sparkles className="h-3 w-3" />
                  <span>{activeRec.highlightBadge}</span>
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {activeRec.title}
                </span>
              </div>

              <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {activeRec.supplierName}
              </h4>
              {matchedSupplier && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-[#0071E3]" />
                  <span>
                    {matchedSupplier.city}, {matchedSupplier.country} ({matchedSupplier.distanceKm} km away)
                  </span>
                  <span>•</span>
                  <span>{matchedSupplier.supplierType}</span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3 shrink-0">
              {matchedSupplier && (
                <button
                  onClick={() => onToggleCompare(matchedSupplier)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                    comparedSupplierIds.includes(matchedSupplier.id)
                      ? "bg-[#0071E3]/10 text-[#0071E3] dark:text-[#3894f8] border border-[#0071E3]/30"
                      : "border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  {comparedSupplierIds.includes(matchedSupplier.id) ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>In Compare</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Add to Compare</span>
                    </>
                  )}
                </button>
              )}

              {matchedSupplier && (
                <button
                  onClick={() => onSelectSupplier(matchedSupplier)}
                  className="flex items-center gap-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] px-5 py-2.5 text-xs font-semibold text-white shadow-xs active:scale-95 transition-all"
                >
                  <span>View Full Dossier</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Plain Business Language Rationale */}
          <div className="my-6 rounded-2xl border border-[#0071E3]/20 bg-[#0071E3]/5 p-4 sm:p-5 dark:border-[#0071E3]/20 dark:bg-[#0071E3]/10">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0071E3]/20 text-[#0071E3] dark:text-[#3894f8] shrink-0 mt-0.5">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#0071E3] dark:text-[#3894f8] mb-1">
                  Why this supplier was chosen for your business:
                </h5>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {activeRec.rationale}
                </p>
              </div>
            </div>
          </div>

          {/* Sourcing Metrics Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-white/10 dark:bg-white/5">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">
                Ex-Factory Quoted
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                {activeRec.metrics.quotedPrice}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-white/10 dark:bg-white/5">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">
                Est. Landed Cost
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                {activeRec.metrics.landedCost}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-white/10 dark:bg-white/5">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">
                Minimum Batch (MOQ)
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                {activeRec.metrics.moq}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-white/10 dark:bg-white/5">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">
                Transit & Delivery
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                {activeRec.metrics.leadTime}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-white/10 dark:bg-white/5 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">
                Reliability Audit
              </span>
              <span className="text-sm font-bold text-amber-500 mt-1 block">
                {activeRec.metrics.rating}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
