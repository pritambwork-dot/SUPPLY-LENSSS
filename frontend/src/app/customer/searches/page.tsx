"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
  Building2,
  Trash2,
  Globe2,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  MapPin,
  FileText,
  AlertCircle,
  X,
  Server,
  Zap,
} from "lucide-react";
import { api } from "@/services/api";

interface SearchItem {
  id: string;
  query: string;
  filters?: Record<string, any>;
  date: string;
  resultsCount: number;
}

export default function CustomerSearchesPage() {
  const router = useRouter();

  // Search input state
  const [newQuery, setNewQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Discovery Job State
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [jobResults, setJobResults] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Evidence Drawer State
  const [selectedSupplierForEvidence, setSelectedSupplierForEvidence] = useState<any | null>(null);
  const [evidenceData, setEvidenceData] = useState<{ records: any[]; conflicts: any[] } | null>(null);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);

  // Historical Searches
  const [searches, setSearches] = useState<SearchItem[]>([
    {
      id: "s-1",
      query: "Eco-friendly sugarcane bagasse food containers in India",
      filters: { country: "India", verified_only: true, max_moq: 5000 },
      date: "Today, 18:30",
      resultsCount: 4,
    },
    {
      id: "s-2",
      query: "Kraft paper takeaway boxes and bowls",
      filters: { category: "Food Packaging", verified_only: true },
      date: "Yesterday, 14:15",
      resultsCount: 6,
    },
    {
      id: "s-3",
      query: "Biodegradable PLA snap lids Cuttack",
      filters: { city: "Cuttack", country: "India" },
      date: "Nov 01, 2026",
      resultsCount: 2,
    },
  ]);

  // Poll active background job
  useEffect(() => {
    if (!activeJobId) return;

    let isPolling = true;
    const interval = setInterval(async () => {
      try {
        const status = await api.discovery.getJobStatus(activeJobId);
        if (!isPolling) return;
        setJobStatus(status);

        if (status.status === "completed") {
          clearInterval(interval);
          const results = await api.discovery.getJobResults(activeJobId);
          if (isPolling) {
            setJobResults(results.suppliers || []);
            // Append to searches history
            setSearches((prev) => [
              {
                id: `s-${Date.now()}`,
                query: status.query,
                filters: { country: selectedCountry, verified_only: true },
                date: "Just now",
                resultsCount: results.total || (results.suppliers || []).length,
              },
              ...prev,
            ]);
          }
        } else if (status.status === "failed") {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Error polling job status:", err);
      }
    }, 1500);

    return () => {
      isPolling = false;
      clearInterval(interval);
    };
  }, [activeJobId]);

  const handleStartDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuery.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setJobResults([]);
    setJobStatus(null);
    setIsModalOpen(true);

    try {
      const res = await api.discovery.startSearch({
        query: newQuery.trim(),
        country: selectedCountry,
        max_results: 3,
      });

      setActiveJobId(res.job_id);
      setJobStatus({
        job_id: res.job_id,
        status: res.status,
        progress_percent: res.progress_percent,
        current_step: res.current_step,
        query: res.query,
      });
    } catch (err: any) {
      console.error("Failed to start discovery:", err);
      setJobStatus({
        status: "failed",
        current_step: "Could not initiate discovery pipeline.",
        error_message: err.message || "Failed to start",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFindMore = async () => {
    if (!activeJobId) return;
    try {
      const res = await api.discovery.findMore(activeJobId);
      setActiveJobId(res.job_id);
      setJobResults([]);
      setJobStatus({
        job_id: res.job_id,
        status: "queued",
        progress_percent: 15,
        current_step: "Deepening search across industrial indexes...",
        query: res.extended_query,
      });
    } catch (err) {
      console.error("Find more error:", err);
    }
  };

  const handleViewEvidence = async (supplier: any) => {
    setSelectedSupplierForEvidence(supplier);
    setIsLoadingEvidence(true);
    try {
      const res = await api.discovery.getSupplierEvidence(supplier.id);
      setEvidenceData({
        records: res.evidence_records || [],
        conflicts: res.conflicts || [],
      });
    } catch (err) {
      console.error("Failed to load evidence:", err);
      setEvidenceData({ records: [], conflicts: [] });
    } finally {
      setIsLoadingEvidence(false);
    }
  };

  const handleClearSearch = (id: string) => {
    setSearches((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              <Search className="w-3.5 h-3.5" />
              Multi-Agent Supplier Intelligence & Discovery
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Supplier Discovery & Search History
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Run autonomous web discovery powered by Nimbleway, Apify, and Gemini with field-level proof.
            </p>
          </div>

          <Link
            href="/admin/providers"
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Server className="w-3.5 h-3.5 text-blue-600" />
            Provider Infrastructure Status
          </Link>
        </div>

        {/* Live Search Discovery Input */}
        <form
          onSubmit={handleStartDiscovery}
          className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/90 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4"
        >
          <div className="flex-1 flex items-center gap-3 px-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
            <input
              type="text"
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              placeholder="Describe your sourcing requirements (e.g., Biodegradable sugarcane bagasse containers in India)..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden font-medium"
            />
          </div>

          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2.5 focus:outline-hidden"
            >
              <option value="India">India</option>
              <option value="Vietnam">Vietnam</option>
              <option value="United States">United States</option>
              <option value="Germany">Germany</option>
            </select>

            <button
              type="submit"
              disabled={isSubmitting || !newQuery.trim()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50 shrink-0"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              Discover Suppliers
            </button>
          </div>
        </form>
      </div>

      {/* Discovery Pipeline Execution Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Multi-Agent Sourcing Intelligence
                    </h3>
                    <p className="text-xs text-slate-500">
                      Query: &ldquo;{jobStatus?.query || newQuery}&rdquo;
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Progress bar and active step */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      {jobStatus?.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                      )}
                      {jobStatus?.current_step || "Initializing discovery..."}
                    </span>
                    <span className="font-bold text-slate-900">
                      {jobStatus?.progress_percent || 10}%
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        jobStatus?.status === "completed" ? "bg-emerald-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${jobStatus?.progress_percent || 10}%` }}
                    />
                  </div>

                  {/* 5-Phase Indicator */}
                  <div className="grid grid-cols-5 gap-1 pt-1 text-[10px] font-semibold text-slate-400 text-center">
                    <span className={jobStatus?.progress_percent >= 20 ? "text-blue-600 font-bold" : ""}>
                      1. Gemini Intent
                    </span>
                    <span className={jobStatus?.progress_percent >= 35 ? "text-blue-600 font-bold" : ""}>
                      2. Nimble Search
                    </span>
                    <span className={jobStatus?.progress_percent >= 50 ? "text-blue-600 font-bold" : ""}>
                      3. Apify Crawl
                    </span>
                    <span className={jobStatus?.progress_percent >= 80 ? "text-blue-600 font-bold" : ""}>
                      4. Normalization
                    </span>
                    <span className={jobStatus?.progress_percent >= 95 ? "text-emerald-600 font-bold" : ""}>
                      5. Verification
                    </span>
                  </div>
                </div>

                {/* Discovered Results */}
                {jobResults.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Discovered & Verified Suppliers ({jobResults.length})
                      </h4>
                      <button
                        onClick={handleFindMore}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                      >
                        Find More Like These
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {jobResults.map((sup) => (
                        <div
                          key={sup.id}
                          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-bold text-slate-900">{sup.name}</h5>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  {sup.verification_status || "Verified"} ({sup.verification_score || 90}/100)
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {sup.city}, {sup.country} · {sup.supplier_type || "Manufacturer"}
                              </p>
                            </div>

                            <button
                              onClick={() => handleViewEvidence(sup)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <FileText className="w-3 h-3 text-blue-600" />
                              View Evidence
                            </button>
                          </div>

                          {sup.description && (
                            <p className="text-xs text-slate-600 line-clamp-2">
                              {sup.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-1 pt-1">
                            {(sup.categories || []).slice(0, 4).map((c: string) => (
                              <span
                                key={c}
                                className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Job ID: <span className="font-mono text-slate-600">{activeJobId}</span>
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Field-Level Evidence Modal */}
      <AnimatePresence>
        {selectedSupplierForEvidence && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Field-Level Verification Provenance
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedSupplierForEvidence.name} · Deterministic evidence and source URL audit
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSupplierForEvidence(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                {isLoadingEvidence ? (
                  <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    Fetching immutable provenance records...
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                      {(evidenceData?.records || []).map((ev: any) => (
                        <div key={ev.id} className="p-4 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-blue-600">
                              {ev.field_name.replace(/_/g, " ")}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                              {ev.verification_status || "passed"}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-800">{ev.field_value}</p>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                            <span className="truncate max-w-[280px]">Source: {ev.source_url}</span>
                            <span className="capitalize font-medium text-slate-600">via {ev.provider}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {evidenceData?.conflicts && evidenceData.conflicts.length > 0 && (
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          Multi-Source Claim Discrepancies ({evidenceData.conflicts.length})
                        </div>
                        {evidenceData.conflicts.map((c: any) => (
                          <div key={c.id} className="text-xs text-amber-900 space-y-0.5">
                            <span className="font-semibold">{c.field_name}:</span> {c.claimed_value_a} vs {c.claimed_value_b}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedSupplierForEvidence(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Close Provenance
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Historical Searches List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider px-1">
          Saved Search Telemetry ({searches.length})
        </h2>
        {searches.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">{s.query}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{s.date}</span>
                <span className="text-slate-300">·</span>
                <span className="font-medium text-slate-700">
                  {s.resultsCount} Verified Suppliers Found
                </span>
                {s.filters && (
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600">
                    Filters Applied
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => handleClearSearch(s.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                title="Remove search"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <Link
                href={`/vendors?search=${encodeURIComponent(s.query)}`}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                Re-run Search
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
