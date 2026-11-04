"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  GitCompare,
  Building2,
  MapPin,
  ShieldCheck,
  Send,
  Star,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  RotateCcw,
  Search,
  X,
  FileText,
  Check,
} from "lucide-react";
import { Supplier } from "@/types";
import { api } from "@/services/api";
import { RequestQuotationModal } from "@/components/quotations/RequestQuotationModal";
import { SupplierProfileModal } from "@/components/suppliers/SupplierProfileModal";

const DEFAULT_COMPARE_IDS = ["sup-utkal-001", "sup-sjp-004", "sup-jtc-002"];

export default function CustomerComparisonsPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(DEFAULT_COMPARE_IDS);
  const [comparedData, setComparedData] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<string[] | string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSupplierForRfq, setSelectedSupplierForRfq] = useState<Supplier | null>(null);
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState<Supplier | null>(null);
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");

  // 1. Initialize from localStorage if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("supplylens_compared_supplier_ids");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedIds(parsed);
          }
        }
      } catch {}
    }
  }, []);

  // 2. Fetch suppliers and execute comparison
  useEffect(() => {
    async function loadSuppliersAndCompare() {
      setIsLoading(true);
      try {
        const all = await api.suppliers.list();
        setSuppliers(all);

        const targetIds = selectedIds.length > 0 ? selectedIds : DEFAULT_COMPARE_IDS;
        const res: any = await api.suppliers.compare(targetIds);

        let list = res?.suppliers || res?.comparison_matrix || [];
        // Unwrap if items are inside .supplier
        if (list.length > 0 && list[0]?.supplier) {
          list = list.map((item: any) => ({
            ...item.supplier,
            landed_cost: item.landed_cost,
            moq: item.moq,
            lead_time_days: item.lead_time_days,
            verification_score: item.verification_score,
            esg_score: item.esg_score,
          }));
        }

        // Fallback to searching in catalog if response was empty
        if ((!list || list.length === 0) && Array.isArray(all) && all.length > 0) {
          list = all.filter((s: Supplier) => targetIds.includes(s.id));
        }

        setComparedData(list);
        setAiSummary(res?.ai_summary || null);
      } catch (err) {
        console.error("Comparison load error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSuppliersAndCompare();
  }, [selectedIds]);

  // Synchronize changes to localStorage
  const updateSelectedIds = (newIds: string[]) => {
    setSelectedIds(newIds);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("supplylens_compared_supplier_ids", JSON.stringify(newIds));
      } catch {}
    }
  };

  const handleRemove = (id: string) => {
    const updated = selectedIds.filter((i) => i !== id);
    updateSelectedIds(updated);
  };

  const handleAdd = (id: string) => {
    if (!selectedIds.includes(id) && selectedIds.length < 5) {
      const updated = [...selectedIds, id];
      updateSelectedIds(updated);
    }
  };

  const handleReset = () => {
    updateSelectedIds(DEFAULT_COMPARE_IDS);
  };

  const handleClearAll = () => {
    updateSelectedIds([]);
  };

  // Filter suppliers available to be added in the modal
  const availableToAdd = useMemo(() => {
    const q = modalSearchQuery.toLowerCase().trim();
    return suppliers.filter((s) => {
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        (s.supplierType || "").toLowerCase().includes(q);
      return matchesSearch;
    });
  }, [suppliers, modalSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              <GitCompare className="w-3.5 h-3.5" />
              Multi-Vendor Analytical Matrix
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Vendor Comparison Workspace
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Side-by-side evaluation of landed unit economics, MOQ trade-offs, and compliance credentials across up to 5 manufacturers.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset to Top 3 Default Vendors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset (3)</span>
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Clear all selected vendors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}

            <button
              onClick={() => setIsAddVendorModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vendor ({selectedIds.length}/5)</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Comparison Synthesis */}
      {aiSummary && (
        <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-200/60 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI Decision-Support Synthesis</span>
          </div>
          {Array.isArray(aiSummary) ? (
            <ul className="space-y-1.5 pl-5 list-disc text-blue-900/90 leading-relaxed">
              {aiSummary.map((item, idx) => (
                <li
                  key={idx}
                  dangerouslySetInnerHTML={{
                    __html: item.replace(
                      /\*\*(.*?)\*\*/g,
                      '<strong class="text-blue-950 font-bold">$1</strong>'
                    ),
                  }}
                />
              ))}
            </ul>
          ) : (
            <p className="text-blue-800 leading-relaxed">{aiSummary}</p>
          )}
        </div>
      )}

      {/* Comparison Table */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">
            Synthesizing multi-vendor comparison matrix & landed economics...
          </p>
        </div>
      ) : comparedData.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4">
          <GitCompare className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-lg font-bold text-slate-800">No Vendors Selected for Comparison</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Select 2 or more vendors to analyze differences in pricing, starting MOQ, and 10-D audit ratings.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Recommended Top 3</span>
            </button>
            <button
              onClick={() => setIsAddVendorModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add From Directory</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="py-4 px-5 font-bold text-slate-700 w-48">Evaluation Metric</th>
                  {comparedData.map((s) => (
                    <th key={s.id} className="py-4 px-5 font-bold text-slate-900 min-w-[220px]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <button
                            type="button"
                            onClick={() => setSelectedSupplierForModal(s)}
                            className="hover:text-blue-600 transition-colors text-left font-bold text-sm"
                          >
                            {s.name}
                          </button>
                          <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                            {s.city}, {s.country}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemove(s.id)}
                          className="w-6 h-6 rounded-full hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors flex items-center justify-center text-sm font-bold cursor-pointer"
                          title="Remove from comparison"
                        >
                          ×
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Status */}
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-600 bg-slate-50/40">Audit Status</td>
                  {comparedData.map((s) => (
                    <td key={s.id} className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {s.verification_status || s.verificationStatus || "Demo Verified"}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Quoted Unit Price */}
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-600 bg-slate-50/40">Quoted Price</td>
                  {comparedData.map((s) => {
                    const p0 = s.products?.[0];
                    const price = p0?.quoted_price || p0?.quotedPrice || p0?.pricePerUnitEstimate;
                    const curr = p0?.currency || "USD";
                    return (
                      <td key={s.id} className="py-3.5 px-5 font-mono font-bold text-slate-900 text-sm">
                        {price ? `${curr === "USD" ? "$" : "₹"} ${price} / ${p0?.unit || "unit"}` : "Upon RFQ"}
                      </td>
                    );
                  })}
                </tr>

                {/* Starting MOQ */}
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-600 bg-slate-50/40">Starting MOQ</td>
                  {comparedData.map((s) => {
                    const p0 = s.products?.[0];
                    const moq = p0?.moq || s.moq || 1000;
                    return (
                      <td key={s.id} className="py-3.5 px-5 font-mono text-slate-800 font-semibold">
                        {Number(moq).toLocaleString()} {p0?.unit || "units"}
                      </td>
                    );
                  })}
                </tr>

                {/* 10-D Verification Score */}
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-600 bg-slate-50/40">10-D Audit Score</td>
                  {comparedData.map((s) => (
                    <td key={s.id} className="py-3.5 px-5 font-mono font-bold text-blue-600">
                      {s.verification_score || s.verificationScore || 98}/100
                    </td>
                  ))}
                </tr>

                {/* Sourcing Match Score */}
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-600 bg-slate-50/40">AI Sourcing Fit</td>
                  {comparedData.map((s) => (
                    <td key={s.id} className="py-3.5 px-5 font-mono font-bold text-emerald-600">
                      {s.match_score || s.matchScore || 95}% Fit
                    </td>
                  ))}
                </tr>

                {/* Lead Time & Logistics */}
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-600 bg-slate-50/40">Transit & Lead Time</td>
                  {comparedData.map((s) => (
                    <td key={s.id} className="py-3.5 px-5 text-slate-700">
                      <span className="font-semibold">{s.leadTimeDays || 10} days lead</span>
                      <span className="text-slate-400 text-[10px] block mt-0.5">
                        ~{s.estimatedTransitDays || 2} days transit
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Certifications */}
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-600 bg-slate-50/40">Certifications</td>
                  {comparedData.map((s) => (
                    <td key={s.id} className="py-3.5 px-5">
                      <div className="flex flex-wrap gap-1">
                        {s.certifications && s.certifications.length > 0 ? (
                          s.certifications.map((c: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 font-medium">
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700">
                            ISO 9001:2015
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Capabilities */}
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-600 bg-slate-50/40">Capabilities</td>
                  {comparedData.map((s) => (
                    <td key={s.id} className="py-3.5 px-5 text-slate-600">
                      {s.capabilities?.slice(0, 3).join(", ") || "Custom Tooling, Contract Manufacturing"}
                    </td>
                  ))}
                </tr>

                {/* Action Row */}
                <tr>
                  <td className="py-4 px-5 font-semibold text-slate-600 bg-slate-50/40">Direct Actions</td>
                  {comparedData.map((s) => (
                    <td key={s.id} className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedSupplierForRfq(s)}
                          className="flex-1 py-2 px-3 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Quote</span>
                        </button>

                        <button
                          onClick={() => setSelectedSupplierForModal(s)}
                          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                          title="View 10-D Dossier"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Dossier</span>
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Vendor Modal (Search & Picker directly on Comparison page) */}
      {isAddVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 flex flex-col max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Add Factory to Comparison Matrix
                </h3>
              </div>
              <button
                onClick={() => setIsAddVendorModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Box */}
            <div className="relative my-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                placeholder="Search vendor name, country, material, or capability..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Vendor List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-xs pr-1">
              {availableToAdd.map((s) => {
                const isAlreadySelected = selectedIds.includes(s.id);
                const p0 = s.products?.[0];
                return (
                  <div
                    key={s.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{s.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          {s.verificationStatus || "Verified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                        <span>📍 {s.city}, {s.country}</span>
                        <span>•</span>
                        <span>MOQ: {p0?.moq || s.moq || 1000}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-700">
                          Quote: {p0?.quotedPrice ? `$${p0.quotedPrice}` : "Upon Request"}
                        </span>
                      </div>
                    </div>

                    <button
                      disabled={isAlreadySelected || selectedIds.length >= 5}
                      onClick={() => {
                        handleAdd(s.id);
                        setIsAddVendorModalOpen(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 shrink-0 ${
                        isAlreadySelected
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95 cursor-pointer"
                      }`}
                    >
                      {isAlreadySelected ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Compare</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RFQ Modal */}
      <RequestQuotationModal
        isOpen={Boolean(selectedSupplierForRfq)}
        onClose={() => setSelectedSupplierForRfq(null)}
        supplier={selectedSupplierForRfq}
      />

      {/* Supplier Profile Modal */}
      {selectedSupplierForModal && (
        <SupplierProfileModal
          supplier={selectedSupplierForModal}
          onClose={() => setSelectedSupplierForModal(null)}
          onToggleCompare={(sup) => {
            handleAdd(sup.id);
            setSelectedSupplierForModal(null);
          }}
          isCompared={selectedIds.includes(selectedSupplierForModal.id)}
        />
      )}
    </div>
  );
}
