"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Layers,
  Award,
  FileText,
  Truck,
  CheckCircle,
  ExternalLink,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookmarkCheck,
  AlertCircle,
  Info,
  Building2,
  Calculator,
} from "lucide-react";
import { Supplier } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { FactoryModel } from "@/components/3d/FactoryModel";

interface SupplierProfileModalProps {
  supplier: Supplier | null;
  onClose: () => void;
  onToggleCompare: (supplier: Supplier) => void;
  isCompared: boolean;
  onToggleSave?: (supplier: Supplier) => void;
  isSaved?: boolean;
  onCalculateLandedCost?: (supplier: Supplier) => void;
}

export const SupplierProfileModal: React.FC<SupplierProfileModalProps> = ({
  supplier,
  onClose,
  onToggleCompare,
  isCompared,
  onToggleSave,
  isSaved = false,
  onCalculateLandedCost,
}) => {
  const [showVerificationDossier, setShowVerificationDossier] = useState(false);

  if (!supplier) return null;

  const hasPublicEmail =
    supplier.hasVerifiedEmail !== false &&
    !!supplier.publicEmail &&
    supplier.publicEmail !== "No verified public email found." &&
    !supplier.publicEmail.includes("none@");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1C1C1E] overflow-hidden transition-all">
        {/* Header */}
        <div className="p-6 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-white/5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">

                {/* Verified Badge */}
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>DEMO VERIFIED · SIMULATED EVIDENCE</span>
                </span>

                <span className="text-xs text-slate-400">
                  Audited: {supplier.verificationDate || "August 2026"}
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {supplier.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Legal Entity: <span className="font-semibold text-slate-700 dark:text-slate-300">{supplier.legalName}</span> • {supplier.supplierType} • Est. {supplier.establishedYear}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onToggleSave && (
                <button
                  onClick={() => onToggleSave(supplier)}
                  className={`rounded-full p-2.5 transition-all active:scale-95 border ${
                    isSaved
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                      : "border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10 dark:hover:text-slate-200"
                  }`}
                  title={isSaved ? "Remove from Saved Suppliers" : "Save this supplier"}
                >
                  {isSaved ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </button>
              )}

              <button
                onClick={onClose}
                className="rounded-full p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200 transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 p-3.5">
              <span className="text-[11px] font-semibold text-slate-400 block">Public Rating</span>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white mt-1">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>{supplier.rating} / 5.0</span>
              </div>
              <span className="text-[10px] text-slate-500">
                ({supplier.reviewCount} verified reviews)
              </span>
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 p-3.5">
              <span className="text-[11px] font-semibold text-slate-400 block">SupplyLens Match</span>
              <div className="flex items-center gap-1 text-sm font-bold text-[#0071E3] dark:text-blue-400 mt-1">
                <ShieldCheck className="h-4 w-4" />
                <span>{supplier.matchScore || 95}% Fit</span>
              </div>
              <span className="text-[10px] text-slate-500">
                Profile-weighted score
              </span>
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 p-3.5">
              <span className="text-[11px] font-semibold text-slate-400 block">Transit Time</span>
              <div className="flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                <Truck className="h-4 w-4" />
                <span>{supplier.estimatedTransitDays} days</span>
              </div>
              <span className="text-[10px] text-slate-500">
                ~{supplier.distanceKm.toLocaleString()} km to hub
              </span>
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 p-3.5">
              <span className="text-[11px] font-semibold text-slate-400 block">Production Lead Time</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                {supplier.leadTimeDays} days prep
              </span>
              <span className="text-[10px] text-slate-500">Standard batch tooling</span>
            </div>
          </div>

          {/* Expandable "Why is this supplier verified?" Panel */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:border-emerald-500/20 dark:bg-emerald-950/20 overflow-hidden transition-all">
            <button
              onClick={() => setShowVerificationDossier(!showVerificationDossier)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-emerald-500/10 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    Why is this supplier verified?
                  </div>
                  <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                    Verification Score: <span className="font-bold">{supplier.verificationScore || 95}/100</span> • Data Confidence: <span className="font-bold">{supplier.dataConfidence || 92}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <span>{showVerificationDossier ? "Hide Evidence" : "View Evidence"}</span>
                {showVerificationDossier ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>

            {showVerificationDossier && (
              <div className="p-4 pt-1 border-t border-emerald-500/20 space-y-3 animate-in fade-in duration-200">
                <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  SupplyLens validates every candidate against strict entity verification standards before displaying them. Below is the audited evidence record:
                </div>

                {/* Evidence Checks Table / List */}
                <div className="space-y-2">
                  {supplier.verificationDossier?.checks && supplier.verificationDossier.checks.length > 0 ? (
                    supplier.verificationDossier.checks.map((c, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-200/80 bg-white p-3 text-xs dark:border-white/10 dark:bg-white/5 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {c.checkName}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="h-2.5 w-2.5" />
                              {c.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            {c.detail}
                          </p>
                          <span className="text-[10px] text-slate-400 block">
                            Source: {c.source} • Checked: {c.checkedAt}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-2">
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 text-xs dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="h-3 w-3" />
                          <span>Company Identity Verified</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                          Active registration verified under {supplier.legalName}.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 text-xs dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="h-3 w-3" />
                          <span>Physical Manufacturing Presence Confirmed</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                          Physical facility verified at {supplier.address}.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Auditor Source: {supplier.verificationDossier?.auditorSource || supplier.dataSource}</span>
                  <span>Last Audit: {supplier.verificationDossier?.lastVerifiedDate || supplier.verificationDate}</span>
                </div>
              </div>
            )}
          </div>

          {/* Location & Public Contacts (With Honest Missing Data Handling) */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-sky-400" />
                <span>Registered Facility & Public Inquiries</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                Interactive 3D Simulation
              </span>
            </div>

            {/* 3D Interactive Facility Simulation */}
            <div className="mb-4 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-[#0a0d14] relative shadow-inner">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                  3D Spatial Architecture • {supplier.supplierType}
                </span>
              </div>
              <FactoryModel facilityType={supplier.supplierType} height={190} />
              <div className="absolute bottom-2.5 right-3 z-10 text-[10px] text-slate-400 font-mono pointer-events-none bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                Drag to orbit 360°
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                <MapPin className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-slate-900 dark:text-white">Facility Address</span>
                  <span className="text-slate-600 dark:text-slate-400 leading-relaxed">{supplier.address}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Coordinates: {supplier.lat.toFixed(4)}, {supplier.lng.toFixed(4)}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {/* Public Phone */}
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Official Switchboard:</span>
                    <a
                      href={`tel:${supplier.publicPhone}`}
                      className="font-mono font-semibold text-slate-800 dark:text-slate-200 hover:underline"
                    >
                      {supplier.publicPhone || "No verified public contact found"}
                    </a>
                  </div>
                </div>

                {/* Public Email (Honest Handling) */}
                <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Verified Public Email:</span>
                    {hasPublicEmail ? (
                      <a
                        href={`mailto:${supplier.publicEmail}`}
                        className="font-medium text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        {supplier.publicEmail}
                      </a>
                    ) : (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium text-xs">
                          <AlertCircle className="h-3 w-3" />
                          <span>No verified public email found.</span>
                        </span>
                        <p className="text-[10px] text-slate-400">
                          SupplyLens does not scrape private inboxes. Please contact via official switchboard phone or web inquiry.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Official Website:</span>
                    <a
                      href={supplier.website}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline text-sky-600 dark:text-sky-400 flex items-center gap-1 font-medium"
                    >
                      <span className="truncate max-w-[200px]">{supplier.website}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products & Price Breakdown (With Plain-English MOQ Explanation) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Verified Product Specifications & Pricing
              </h4>
              <span className="text-[11px] text-slate-400">
                {supplier.products.length} verified SKU{supplier.products.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-3">
              {supplier.products.map((p) => {
                const initialBatchOutlay = p.quotedPrice * p.moq;
                return (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {p.name}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{p.category}</span>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                          Est. Landed Cost (Delivered)
                        </span>
                        <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(p.estimatedLandedCost, p.currency)} / {p.unit}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-white/10 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          Ex-Factory Quoted Price
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(p.quotedPrice, p.currency)} / {p.unit}
                        </span>
                        <span className="text-[9px] text-slate-400 block">
                          {p.priceNote || "FOB base quote"}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          Minimum Order (MOQ)
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {p.moq.toLocaleString()} {p.unit}s
                        </span>
                        {/* Plain English MOQ Meaning */}
                        <span className="text-[10px] font-semibold text-[#0071E3] dark:text-blue-400 block">
                          {p.moqMeaning || (p.moq <= 100 ? "Good for starting small" : "Standard production batch")}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          Min. Batch Capital Outlay
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(initialBatchOutlay, p.currency)}
                        </span>
                        <span className="text-[9px] text-slate-400 block">
                          (Quoted Price × MOQ)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Verified Regulatory & Quality Certifications
            </h4>
            <div className="flex flex-wrap gap-2">
              {supplier.certifications.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                >
                  <Award className="h-3.5 w-3.5 text-[#0071E3]" />
                  <span>{cert}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Legitimate Reviews & Audit Logs */}
          {supplier.reviews && supplier.reviews.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Verified Buyer Feedback & Audit Records
              </h4>
              <div className="space-y-3">
                {supplier.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50/60 p-3.5 text-xs dark:bg-white/5"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {rev.author}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 dark:text-slate-400">{rev.company}</span>
                        {rev.verifiedBuyer && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle className="h-2.5 w-2.5" /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[10px]">{rev.date}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-200/80 dark:bg-[#1C1C1E] dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => onToggleCompare(supplier)}
            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
              isCompared
                ? "bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/30"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 shadow-2xs"
            }`}
          >
            {isCompared ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Selected for Comparison</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Add to Comparison</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onCalculateLandedCost && (
              <button
                onClick={() => {
                  onCalculateLandedCost(supplier);
                  onClose();
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 shadow-2xs cursor-pointer"
              >
                <Calculator className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                <span>Calculate Landed Cost</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial rounded-full px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
            >
              Close
            </button>

            {hasPublicEmail ? (
              <a
                href={`mailto:${supplier.publicEmail}?subject=SupplyLens Sourcing Inquiry: ${supplier.products[0]?.name || "Catalog"}`}
                className="flex-1 sm:flex-initial text-center rounded-full bg-[#0071E3] hover:bg-[#0077ED] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Contact via Email
              </a>
            ) : (
              <a
                href={supplier.website}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Visit Official Website</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
