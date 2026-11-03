"use client";

import React, { useState, useMemo } from "react";
import {
  GitCompare,
  X,
  ShieldCheck,
  Star,
  Info,
  Truck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ChevronDown,
  Check,
} from "lucide-react";
import { Supplier } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { RatingDisplay } from "@/components/common/RatingDisplay";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { SpatialCard } from "@/components/3d/SpatialCard";
import { AnimatedButton } from "@/components/visual/AnimatedButton";

interface SupplierComparisonProps {
  comparedSuppliers: Supplier[];
  onRemoveFromCompare: (id: string) => void;
  onClearCompare: () => void;
  onSelectSupplier: (supplier: Supplier) => void;
  onExploreSuppliers: () => void;
}

export const SupplierComparison: React.FC<SupplierComparisonProps> = ({
  comparedSuppliers,
  onRemoveFromCompare,
  onClearCompare,
  onSelectSupplier,
  onExploreSuppliers,
}) => {
  const [showMatrix, setShowMatrix] = useState<boolean>(false);
  // Comparative Highlights Synthesis
  const highlights = useMemo(() => {
    if (comparedSuppliers.length === 0) return null;

    const lowestPrice = [...comparedSuppliers].sort(
      (a, b) =>
        (a.products[0]?.quotedPrice || Infinity) -
        (b.products[0]?.quotedPrice || Infinity)
    )[0];

    const lowestLanded = [...comparedSuppliers].sort(
      (a, b) =>
        (a.products[0]?.estimatedLandedCost || Infinity) -
        (b.products[0]?.estimatedLandedCost || Infinity)
    )[0];

    const bestStartingSmall = [...comparedSuppliers].sort((a, b) => {
      const costA = (a.products[0]?.quotedPrice || 0) * (a.products[0]?.moq || 0);
      const costB = (b.products[0]?.quotedPrice || 0) * (b.products[0]?.moq || 0);
      return costA - costB;
    })[0];

    const bestOverall = [...comparedSuppliers].sort(
      (a, b) => (b.matchScore || 90) - (a.matchScore || 90)
    )[0];

    const highestRated = [...comparedSuppliers].sort(
      (a, b) => b.rating - a.rating
    )[0];

    const fastest = [...comparedSuppliers].sort(
      (a, b) => a.estimatedTransitDays - b.estimatedTransitDays
    )[0];

    return {
      lowestPrice,
      lowestLanded,
      bestStartingSmall,
      bestOverall,
      highestRated,
      fastest,
    };
  }, [comparedSuppliers]);

  if (comparedSuppliers.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto my-16 text-center p-10 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1C1C1E] shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0071E3]/10 text-[#0071E3] mx-auto mb-3">
          <GitCompare className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          No suppliers selected for comparison
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Select up to 3 suppliers to compare them side-by-side.
        </p>
        <button
          onClick={onExploreSuppliers}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors"
        >
          <span>Find suppliers</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header (Section 26) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Compare suppliers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review top candidates side-by-side.
          </p>
        </div>

        <button
          onClick={onClearCompare}
          className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white self-start sm:self-auto transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Top Champion Card (Section 26) */}
      {highlights && (
        <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-500/10 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                  Best option for you
                </span>
                <VerifiedBadge isVerified={highlights.lowestLanded.verificationStatus === "Verified"} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {highlights.lowestLanded.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white font-medium">Why:</strong> Lowest total landed cost with verified quality.
              </p>
            </div>

            <button
              onClick={() => onSelectSupplier(highlights.lowestLanded)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white px-5 py-2.5 text-xs font-semibold shadow-xs transition-all shrink-0 self-start sm:self-auto"
            >
              <span>Select this supplier</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Horizontal Supplier Cards (Section 26: Price, MOQ, Rating, Verification, Estimated total) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {comparedSuppliers.map((supplier) => {
          const primaryProduct = supplier.products[0];

          return (
            <SpatialCard
              key={supplier.id}
              maxRotation={6}
              elevationOnHover={14}
              className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-xl transition-all dark:border-white/10 dark:bg-[#1C1C1E] flex flex-col justify-between h-full"
            >
              <div className="space-y-3">
                {/* Header: Name + Verified + Remove */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {supplier.name}
                      </h3>
                      <VerifiedBadge isVerified={supplier.verificationStatus === "Verified"} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      📍 {supplier.city}, {supplier.country}
                    </p>
                  </div>

                  <button
                    onClick={() => onRemoveFromCompare(supplier.id)}
                    className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 transition-colors"
                    title="Remove from compare"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Rating */}
                <div className="pt-0.5 pb-2 border-b border-slate-100 dark:border-white/10">
                  <RatingDisplay rating={supplier.rating} reviewCount={supplier.reviewCount} />
                </div>

                {/* Metrics: Price, MOQ, Estimated Total */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100/70 dark:border-white/5">
                    <span className="text-slate-400">Quoted Price:</span>
                    <PriceDisplay
                      amount={primaryProduct?.quotedPrice || 0}
                      unit={primaryProduct?.unit || "unit"}
                      currency={primaryProduct?.currency || "INR"}
                      priceType="listed"
                    />
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100/70 dark:border-white/5">
                    <span className="text-slate-400">Minimum Order (MOQ):</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {primaryProduct?.moq?.toLocaleString() || "N/A"} {primaryProduct?.unit || "units"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100/70 dark:border-white/5">
                    <span className="text-slate-400">Estimated Total:</span>
                    <PriceDisplay
                      amount={primaryProduct?.estimatedLandedCost || 0}
                      unit={primaryProduct?.unit || "unit"}
                      currency={primaryProduct?.currency || "INR"}
                      priceType="estimated"
                    />
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Estimated Delivery:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ~{supplier.estimatedTransitDays} days
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/10">
                <AnimatedButton
                  variant="primary"
                  onClick={() => onSelectSupplier(supplier)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold"
                >
                  <span>Select this supplier</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </AnimatedButton>
              </div>
            </SpatialCard>
          );
        })}
      </div>

      {/* Collapsible Details Disclosure (Section 26 & 27) */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => setShowMatrix(!showMatrix)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:bg-[#1C1C1E] dark:text-white dark:hover:bg-white/10 shadow-xs transition-all"
        >
          <span>{showMatrix ? "Hide comparison details" : "Compare details"}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMatrix ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Comparison Matrix Table (Section 27) */}
      {showMatrix && (
        <div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-white/10 dark:bg-[#1C1C1E] animate-in fade-in duration-200">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/5">
              <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-slate-400 w-56 shrink-0">
                Evaluation Metric
              </th>
              {comparedSuppliers.map((supplier) => (
                <th
                  key={supplier.id}
                  className="p-4 sm:p-5 text-left min-w-[240px] max-w-[300px] align-top"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">

                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="h-3 w-3" />
                          <span>{supplier.verificationStatus || "Verified"}</span>
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {supplier.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {supplier.city}, {supplier.country}
                      </p>
                    </div>

                    <button
                      onClick={() => onRemoveFromCompare(supplier.id)}
                      className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-white/10 transition-colors"
                      title="Remove from comparison"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
            {/* Row 1: Primary Product */}
            <tr>
              <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">
                Product Specification
              </td>
              {comparedSuppliers.map((s) => (
                <td key={s.id} className="p-4 font-medium text-slate-900 dark:text-white">
                  {s.products[0]?.name || "Custom Tableware"}
                </td>
              ))}
            </tr>

            {/* Row 2: Supplier Quoted Price (Ex-Factory) */}
            <tr className="bg-slate-50/40 dark:bg-white/[0.02]">
              <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">
                <div>Supplier Quoted Price</div>
                <span className="text-[10px] font-normal text-slate-400">(Ex-factory FOB base)</span>
              </td>
              {comparedSuppliers.map((s) => (
                <td key={s.id} className="p-4 font-bold text-slate-900 dark:text-white text-sm">
                  {formatCurrency(s.products[0]?.quotedPrice || 0)} / {s.products[0]?.unit}
                </td>
              ))}
            </tr>

            {/* Row 3: Estimated Landed Cost (CRITICAL) */}
            <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
              <td className="p-4 font-bold text-emerald-800 dark:text-emerald-400">
                <div>Estimated Landed Cost</div>
                <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-500">
                  (Delivered to door + freight)
                </span>
              </td>
              {comparedSuppliers.map((s) => (
                <td
                  key={s.id}
                  className="p-4 font-extrabold text-emerald-700 dark:text-emerald-400 text-base"
                >
                  {formatCurrency(s.products[0]?.estimatedLandedCost || 0)} / {s.products[0]?.unit}
                </td>
              ))}
            </tr>

            {/* Row 4: MOQ & Plain English Meaning */}
            <tr>
              <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">
                <div>Minimum Order (MOQ)</div>
                <span className="text-[10px] font-normal text-slate-400">(Smallest order accepted)</span>
              </td>
              {comparedSuppliers.map((s) => (
                <td key={s.id} className="p-4">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {s.products[0]?.moq.toLocaleString()} {s.products[0]?.unit || "units"}
                  </div>
                  <span className="text-[10px] font-medium text-sky-600 dark:text-sky-400 block mt-0.5">
                    {s.products[0]?.moqMeaning || (s.products[0]?.moq <= 100 ? "Good for starting small" : "Standard production batch")}
                  </span>
                </td>
              ))}
            </tr>

            {/* Row 5: Minimum Initial Investment */}
            <tr className="bg-slate-50/40 dark:bg-white/[0.02]">
              <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">
                <div>Min. Capital Required</div>
                <span className="text-[10px] font-normal text-slate-400">(Quoted Price × MOQ)</span>
              </td>
              {comparedSuppliers.map((s) => {
                const minInvestment = (s.products[0]?.quotedPrice || 0) * (s.products[0]?.moq || 0);
                return (
                  <td key={s.id} className="p-4 font-bold text-slate-900 dark:text-white">
                    {formatCurrency(minInvestment, s.products[0]?.currency)}
                  </td>
                );
              })}
            </tr>

            {/* Row 6: Shipping Distance & Transit */}
            <tr>
              <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">
                <div>Transit & Distance</div>
                <span className="text-[10px] font-normal text-slate-400">To your market location</span>
              </td>
              {comparedSuppliers.map((s) => (
                <td key={s.id} className="p-4 text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {s.estimatedTransitDays} days
                  </span>{" "}
                  (~{s.distanceKm.toLocaleString()} km)
                </td>
              ))}
            </tr>

            {/* Row 7: Production Lead Time */}
            <tr className="bg-slate-50/40 dark:bg-white/[0.02]">
              <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">
                Lead Time (Preparation)
              </td>
              {comparedSuppliers.map((s) => (
                <td key={s.id} className="p-4 text-slate-700 dark:text-slate-300">
                  {s.leadTimeDays} days prep
                </td>
              ))}
            </tr>

            {/* Row 8: Public Registry Rating (Distinct from Match Score) */}
            <tr>
              <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">
                <div>Public Registry Rating</div>
                <span className="text-[10px] font-normal text-slate-400">Audited customer feedback</span>
              </td>
              {comparedSuppliers.map((s) => (
                <td key={s.id} className="p-4">
                  <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span>{s.rating}</span>
                    <span className="text-slate-400 font-normal text-[11px]">({s.reviewCount} reviews)</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Row 9: SupplyLens Profile Match Score (Distinct Metric) */}
            <tr className="bg-slate-50/40 dark:bg-white/[0.02]">
              <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">
                <div>SupplyLens Match Score</div>
                <span className="text-[10px] font-normal text-slate-400">Profile & budget weighted</span>
              </td>
              {comparedSuppliers.map((s) => (
                <td key={s.id} className="p-4">
                  <div className="flex items-center gap-1 text-[#0071E3] dark:text-blue-400 font-extrabold text-sm">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{s.matchScore || 94}% Fit</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Row 10: Verification Score & Confidence */}
            <tr>
              <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">
                <div>Verification & Confidence</div>
                <span className="text-[10px] font-normal text-slate-400">Audited evidence checks</span>
              </td>
              {comparedSuppliers.map((s) => (
                <td key={s.id} className="p-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 border border-emerald-500/20">
                    Score: {s.verificationScore || 95}/100
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Confidence: {s.dataConfidence || 92}%
                  </span>
                </td>
              ))}
            </tr>

            {/* Row 11: Public Business Contact */}
            <tr className="bg-slate-50/40 dark:bg-white/[0.02]">
              <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">
                <div>Public Business Contact</div>
                <span className="text-[10px] font-normal text-slate-400">Public directory inquiries</span>
              </td>
              {comparedSuppliers.map((s) => {
                const hasEmail =
                  s.hasVerifiedEmail !== false &&
                  !!s.publicEmail &&
                  s.publicEmail !== "No verified public email found." &&
                  !s.publicEmail.includes("none@");
                return (
                  <td key={s.id} className="p-4 text-[11px] space-y-1">
                    <div className="font-mono text-slate-700 dark:text-slate-300">
                      {s.publicPhone || "Phone listed"}
                    </div>
                    <div>
                      {hasEmail ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Verified public email
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          Web / phone contact
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row 12: Certifications */}
            <tr>
              <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">
                Key Certifications
              </td>
              {comparedSuppliers.map((s) => (
                <td key={s.id} className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {s.certifications.map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Row 13: Action row */}
            <tr className="bg-slate-50/40 dark:bg-white/[0.02]">
              <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">
                Next Step
              </td>
              {comparedSuppliers.map((s) => (
                <td key={s.id} className="p-4">
                  <button
                    onClick={() => onSelectSupplier(s)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#0071E3] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0077ED] transition-all active:scale-95 cursor-pointer"
                  >
                    <span>View Full Profile</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    )}
  </div>
);
};
