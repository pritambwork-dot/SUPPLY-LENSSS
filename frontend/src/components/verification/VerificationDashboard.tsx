"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  RefreshCw,
  ExternalLink,
  Lock,
  Globe,
  Sliders,
  Award,
  ChevronRight,
  Info,
  Clock,
  UserCheck,
  Search,
  Filter
} from "lucide-react";
import { api } from "@/services/api";

interface VerificationDashboardProps {
  onSelectSupplier?: (supplierId: string) => void;
}

export const VerificationDashboard: React.FC<VerificationDashboardProps> = ({ onSelectSupplier }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEvidenceSupplier, setSelectedEvidenceSupplier] = useState<any>(null);
  const [evidenceData, setEvidenceData] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [reviewModalSupplier, setReviewModalSupplier] = useState<any>(null);
  const [reviewStatus, setReviewStatus] = useState<string>("Demo verified");
  const [reviewNotes, setReviewNotes] = useState<string>("");

  const loadDashboard = () => {
    setIsLoading(true);
    api.verification.getDashboard()
      .then((res) => {
        if (res) setData(res);
      })
      .catch((err) => console.error("Failed to load verification dashboard:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleRunVerification = async (supplierId: string) => {
    setIsVerifying(supplierId);
    try {
      await api.verification.verifySupplier(supplierId);
      loadDashboard();
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(null);
    }
  };

  const handleViewEvidence = async (supplier: any) => {
    setSelectedEvidenceSupplier(supplier);
    try {
      const ev = await api.verification.getEvidence(supplier.id);
      setEvidenceData(ev);
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualReviewSubmit = async () => {
    if (!reviewModalSupplier) return;
    try {
      await api.verification.reviewSupplier(reviewModalSupplier.id, reviewStatus, reviewNotes);
      setReviewModalSupplier(null);
      setReviewNotes("");
      loadDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredSuppliers = (data?.suppliers || []).filter((s: any) => {
    if (activeFilter === "verified" && !s.status_key.includes("verified")) return false;
    if (activeFilter === "partially" && !s.status_key.includes("partially")) return false;
    if (activeFilter === "review" && !s.status_key.includes("review")) return false;
    if (activeFilter === "failed" && !s.status_key.includes("failed")) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.country.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with Strict Demo Environment Notice */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Supplier Verification & Compliance Engine
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                  DEMO ENVIRONMENT · SAMPLE DATA
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                10-dimension deterministic evaluation, simulated evidence dossiers, and cryptographic audit logging.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadDashboard}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Total Suppliers Audited</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{data?.summary?.total_suppliers || 0}</span>
            <span className="text-xs text-emerald-600 font-semibold">100% active</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">8 Global Industry Sectors</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Demo Verified Factories</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{data?.summary?.verified_count || 0}</span>
            <span className="text-xs text-slate-500">of {data?.summary?.total_suppliers || 0}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Score &ge; 75 pts + Physical GIS</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Compliance Pass Rate</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600">{data?.summary?.compliance_pass_rate || "100%"}</span>
            <span className="text-xs text-emerald-600 font-semibold">&uarr; High Reliability</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Avg Score: {data?.summary?.average_score || 100} / 100</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Pending Admin Reviews</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{data?.summary?.requires_review_count || 0}</span>
            <span className="text-xs text-slate-500">queued</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Audit trail active</span>
        </div>
      </div>

      {/* 10 Audit Dimensions Overview */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Deterministic 10-Dimension Verification Framework</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Each factory is audited against 10 factual criteria. No subjective guesses or hallucinated ratings.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Total Possible: 100 Points
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(data?.dimensions || []).map((dim: any, idx: number) => (
            <div key={dim.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-400">D{idx + 1}</span>
                <span className="text-[11px] font-bold text-blue-600">{dim.weight} pts</span>
              </div>
              <h4 className="text-xs font-semibold text-slate-800 leading-tight line-clamp-2">
                {dim.name}
              </h4>
            </div>
          ))}
        </div>
      </div>

      {/* Controls: Search, Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/60 text-xs">
          {[
            { id: "all", label: "All Suppliers" },
            { id: "verified", label: "Demo Verified" },
            { id: "partially", label: "Partially Verified" },
            { id: "review", label: "Requires Review" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeFilter === tab.id
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search factory or location..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Supplier Verification Table / Cards */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredSuppliers.map((supplier: any) => (
            <div
              key={supplier.id}
              className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div className="flex items-start gap-3.5">
                <button
                  type="button"
                  onClick={() => onSelectSupplier?.(supplier.id)}
                  className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 font-bold shrink-0 hover:bg-blue-100 transition-colors cursor-pointer"
                  title="View Supplier Profile"
                >
                  <Building2 className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectSupplier?.(supplier.id)}
                      className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer text-left"
                    >
                      {supplier.name}
                    </button>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      {supplier.badge_text}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>📍 {supplier.city}, {supplier.country}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">Audit Score: {supplier.score}/100</span>
                    <span>•</span>
                    <span>Passed: {supplier.passed_dimensions}/{supplier.total_dimensions} Dimensions</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                <button
                  onClick={() => handleViewEvidence(supplier)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Inspect Evidence</span>
                </button>

                <button
                  onClick={() => handleRunVerification(supplier.id)}
                  disabled={isVerifying === supplier.id}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors border border-blue-200 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifying === supplier.id ? "animate-spin" : ""}`} />
                  <span>{isVerifying === supplier.id ? "Auditing..." : "Re-Verify"}</span>
                </button>

                <button
                  onClick={() => {
                    setReviewModalSupplier(supplier);
                    setReviewStatus(supplier.status);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
                  title="Admin Review Override"
                >
                  Review
                </button>
              </div>
            </div>
          ))}

          {filteredSuppliers.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-xs">
              No suppliers match the current filter or search criteria.
            </div>
          )}
        </div>
      </div>

      {/* Audit Trail Drawer / Log */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Recent Cryptographic Audit Logs</span>
        </h3>
        <div className="divide-y divide-slate-100 text-xs">
          {(data?.recent_audit_logs || []).map((log: any) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-4">
              <div>
                <span className="font-semibold text-slate-900">{log.supplier_name}</span>
                <span className="text-slate-400 mx-1.5">•</span>
                <span className="text-blue-600 font-mono text-[11px]">{log.action}</span>
                <p className="text-slate-500 text-[11px] mt-0.5">{log.notes}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-400 block">{log.auditor}</span>
                <span className="text-[10px] text-slate-400 font-mono">{log.timestamp.slice(0, 10)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Dossier Modal */}
      <AnimatePresence>
        {selectedEvidenceSupplier && evidenceData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-3xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{evidenceData.supplier_name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      {evidenceData.badge_text}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    10-Dimension Compliance Audit Dossier & Simulated Evidence Fixtures
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedEvidenceSupplier(null);
                    setEvidenceData(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body Scrollable */}
              <div className="overflow-y-auto py-4 space-y-5 pr-1">
                {/* Score & Confidence */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Verification Score</span>
                    <span className="text-2xl font-bold text-slate-900">{evidenceData.score} / 100</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Data Confidence Index</span>
                    <span className="text-2xl font-bold text-blue-600">{evidenceData.confidence}%</span>
                  </div>
                </div>

                {/* 10 Detailed Checks */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-2.5">10 Audit Check Results</h4>
                  <div className="space-y-2">
                    {(evidenceData.checks || []).map((check: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200/70 shadow-xs flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold text-slate-900">{check.name}</span>
                            <p className="text-xs text-slate-600 mt-0.5">{check.detail}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">Source: {check.source}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-blue-600">+{check.score} pts</span>
                          <span className="text-[10px] text-slate-400 block">{check.checked_at}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated Fixtures */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-xs font-bold text-slate-900">Cryptographic Fixture Documents</h4>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Isolated demo:// scheme
                    </span>
                  </div>
                  <div className="space-y-2">
                    {(evidenceData.simulated_fixtures || []).map((fix: any) => (
                      <div key={fix.fixture_id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 font-mono text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800 font-sans">{fix.title}</span>
                          <span className="text-[10px] text-slate-500 font-sans">{fix.format}</span>
                        </div>
                        <span className="text-[11px] text-blue-600 block truncate">{fix.uri}</span>
                        <span className="text-[10px] text-slate-400 block truncate mt-0.5">SHA-256: {fix.hash}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => {
                    setSelectedEvidenceSupplier(null);
                    setEvidenceData(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Manual Review Modal */}
      <AnimatePresence>
        {reviewModalSupplier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6"
            >
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Admin Review: {reviewModalSupplier.name}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Override or confirm verification status. An immutable audit log entry will be created.
              </p>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">New Status</label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Demo verified">Demo verified</option>
                    <option value="Demo partially verified">Demo partially verified</option>
                    <option value="Demo requires review">Demo requires review</option>
                    <option value="Demo failed">Demo failed</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Auditor Notes</label>
                  <textarea
                    rows={3}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Provide justification and document reference..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setReviewModalSupplier(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualReviewSubmit}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  Save Override
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
