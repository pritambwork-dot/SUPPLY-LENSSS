"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  DollarSign,
  Package,
  Calendar,
  ArrowRight,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { QuotationRequestItem } from "@/types";
import { api } from "@/services/api";

export default function CustomerQuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuotations() {
      setIsLoading(true);
      try {
        const res = await api.customer.listQuotations("biz-001");
        setQuotations(res.quotations || []);
      } catch (err) {
        console.error("Error loading quotations:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadQuotations();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredQuotes = quotations.filter((q) => {
    if (statusFilter === "all") return true;
    return q.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              <Send className="w-3.5 h-3.5" />
              Direct Factory Inquiries
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Customer Quotation Requests ({quotations.length})
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track submitted RFQs, verified supplier responses, formal price quotes, and delivery timelines.
            </p>
          </div>

          <Link
            href="/vendors"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Send className="w-3.5 h-3.5" />
            New Quotation Request
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
          {["all", "quoted", "under_review", "submitted", "accepted"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all border ${
                statusFilter === st
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Quotation List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading your RFQ registry...</p>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4">
          <Send className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-lg font-bold text-slate-800">No Quotations Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You haven&apos;t submitted any RFQs matching this status filter. Browse vendors to request customized factory quotes.
          </p>
          <Link
            href="/vendors"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Explore Vendors Directory
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((rfq) => (
            <div
              key={rfq.id}
              className="glass-panel-3d rounded-3xl p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                      {rfq.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{rfq.product_name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vendor: <strong className="text-slate-700">{rfq.supplier_name}</strong></span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-400">
                      Submitted {rfq.created_at ? new Date(rfq.created_at).toLocaleDateString() : "Recently"}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    rfq.status === "quoted"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : rfq.status === "under_review"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {rfq.status === "quoted" && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {rfq.status === "under_review" && <Clock className="w-3.5 h-3.5" />}
                  {rfq.status === "submitted" && <Clock className="w-3.5 h-3.5" />}
                  {rfq.status.replace("_", " ")}
                </span>
              </div>

              {/* RFQ Parameters & Response */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Requested Volume</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {rfq.required_quantity?.toLocaleString()} {rfq.unit}s
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Delivery Terms</span>
                  <span className="font-medium text-slate-800">
                    {rfq.delivery_terms || "FOB Factory"}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Quoted Unit Price</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">
                    {rfq.quoted_unit_price ? `${rfq.currency} ${rfq.quoted_unit_price}` : "Pending Quote"}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Production Lead Time</span>
                  <span className="font-mono font-bold text-slate-800">
                    {rfq.quoted_lead_time_days ? `${rfq.quoted_lead_time_days} Days` : "Awaiting Factory"}
                  </span>
                </div>
              </div>

              {/* Vendor Notes */}
              {rfq.vendor_notes && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-0.5">Vendor Response Note:</span>
                  {rfq.vendor_notes}
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                  href={`/vendors/${rfq.supplier_id}`}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  View Vendor Profile <ExternalLink className="w-3 h-3" />
                </Link>

                {rfq.status === "quoted" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => showToast("Quotation declined.")}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Decline
                    </button>
                    <Link
                      href="/customer/deals"
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-sm hover:bg-emerald-700 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Proceed to Commercial Deal
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
