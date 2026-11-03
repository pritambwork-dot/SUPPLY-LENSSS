"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Supplier } from "@/types";
import { api } from "@/services/api";
import { RequestQuotationModal } from "@/components/quotations/RequestQuotationModal";

export default function CustomerComparisonsPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(["sup-utkal-001", "sup-jtc-002", "sup-sjp-004"]);
  const [comparedData, setComparedData] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSupplierForRfq, setSelectedSupplierForRfq] = useState<Supplier | null>(null);

  useEffect(() => {
    async function loadSuppliersAndCompare() {
      setIsLoading(true);
      try {
        const all = await api.suppliers.list();
        setSuppliers(all);

        const res: any = await api.suppliers.compare(selectedIds);
        setComparedData(res.suppliers || []);
        setAiSummary(res.ai_summary || null);
      } catch (err) {
        console.error("Comparison load error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSuppliersAndCompare();
  }, [selectedIds]);

  const handleRemove = (id: string) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const handleAdd = (id: string) => {
    if (!selectedIds.includes(id) && selectedIds.length < 5) {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

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

          <Link
            href="/vendors"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Vendor to Compare
          </Link>
        </div>
      </div>

      {/* AI Comparison Synthesis */}
      {aiSummary && (
        <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-200/60 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600" />
            AI Decision-Support Synthesis
          </div>
          <p className="text-blue-800 leading-relaxed">{aiSummary}</p>
        </div>
      )}

      {/* Comparison Table */}
      {comparedData.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4">
          <GitCompare className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-lg font-bold text-slate-800">No Vendors Selected for Comparison</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Select 2 or more vendors from the directory to analyze differences in pricing, MOQ, and audit ratings.
          </p>
          <Link
            href="/vendors"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            Browse Vendors
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="py-4 px-5 font-bold text-slate-700 w-48">Evaluation Metric</th>
                  {comparedData.map((s) => (
                    <th key={s.id} className="py-4 px-5 font-bold text-slate-900 min-w-[200px]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link href={`/vendors/${s.id}`} className="hover:text-blue-600 transition-colors">
                            {s.name}
                          </Link>
                          <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                            {s.city}, {s.country}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemove(s.id)}
                          className="text-slate-400 hover:text-red-600 text-xs font-bold"
                          title="Remove"
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
                        {s.verification_status || "Demo Verified"}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Quoted Unit Price */}
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-600 bg-slate-50/40">Quoted Price</td>
                  {comparedData.map((s) => {
                    const p0 = s.products?.[0];
                    return (
                      <td key={s.id} className="py-3.5 px-5 font-mono font-bold text-slate-900 text-sm">
                        {p0?.quoted_price ? `${p0.currency || "INR"} ${p0.quoted_price}` : "Upon RFQ"}
                      </td>
                    );
                  })}
                </tr>

                {/* Starting MOQ */}
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-600 bg-slate-50/40">Starting MOQ</td>
                  {comparedData.map((s) => {
                    const p0 = s.products?.[0];
                    return (
                      <td key={s.id} className="py-3.5 px-5 font-mono text-slate-800">
                        {p0?.moq ? `${p0.moq.toLocaleString()} ${p0.unit || "pcs"}` : "1,000 pcs"}
                      </td>
                    );
                  })}
                </tr>

                {/* 10-D Verification Score */}
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-600 bg-slate-50/40">10-D Audit Score</td>
                  {comparedData.map((s) => (
                    <td key={s.id} className="py-3.5 px-5 font-mono font-bold text-blue-600">
                      {s.verification_score || 95}%
                    </td>
                  ))}
                </tr>

                {/* Sourcing Match Score */}
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-600 bg-slate-50/40">AI Sourcing Fit</td>
                  {comparedData.map((s) => (
                    <td key={s.id} className="py-3.5 px-5 font-mono font-bold text-emerald-600">
                      {s.match_score || 92}%
                    </td>
                  ))}
                </tr>

                {/* Certifications */}
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-600 bg-slate-50/40">Certifications</td>
                  {comparedData.map((s) => (
                    <td key={s.id} className="py-3.5 px-5">
                      <div className="flex flex-wrap gap-1">
                        {s.certifications?.map((c: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700">
                            {c}
                          </span>
                        )) || "Standard ISO"}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Capabilities */}
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-600 bg-slate-50/40">Capabilities</td>
                  {comparedData.map((s) => (
                    <td key={s.id} className="py-3.5 px-5 text-slate-600">
                      {s.capabilities?.slice(0, 3).join(", ") || "Custom Tooling, OEM"}
                    </td>
                  ))}
                </tr>

                {/* Action Row */}
                <tr>
                  <td className="py-4 px-5 font-semibold text-slate-600 bg-slate-50/40">Action</td>
                  {comparedData.map((s) => (
                    <td key={s.id} className="py-4 px-5">
                      <button
                        onClick={() => setSelectedSupplierForRfq(s)}
                        className="w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Request Quote
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RFQ Modal */}
      <RequestQuotationModal
        isOpen={Boolean(selectedSupplierForRfq)}
        onClose={() => setSelectedSupplierForRfq(null)}
        supplier={selectedSupplierForRfq}
      />
    </div>
  );
}
