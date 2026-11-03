"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Filter, 
  ExternalLink,
  Receipt,
  X,
  FileSpreadsheet
} from "lucide-react";
import { api } from "@/services/api";
import { RevenueAnalyticsItem, SourcingDealItem, InvoiceItem } from "@/types";

export const AdminRevenueDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<RevenueAnalyticsItem | null>(null);
  const [deals, setDeals] = useState<SourcingDealItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Credit Note Modal
  const [isCreditNoteModalOpen, setIsCreditNoteModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(5000);
  const [creditReason, setCreditReason] = useState("");

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [analyticsData, dealsData, invoicesData] = await Promise.all([
        api.monetization.getAnalytics("INR"),
        api.monetization.deals.list(),
        api.monetization.invoices.list(),
      ]);
      setAnalytics(analyticsData);
      setDeals(dealsData || []);
      setInvoices(invoicesData || []);
    } catch (e: any) {
      console.error("Failed to load revenue analytics:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyDeal = async (dealId: string, status: "verified" | "rejected") => {
    try {
      await api.monetization.admin.verifyDeal(dealId, "admin-ops-01", status, `Verified by admin via dashboard`);
      showToast(`Deal marked as ${status}.`);
      loadData();
    } catch (e: any) {
      alert(`Verification action failed: ${e.message}`);
    }
  };

  const handleIssueCreditNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await api.monetization.admin.issueCreditNote(selectedInvoice.id, creditAmount, creditReason, "admin-ops-01");
      showToast(`Credit note of ₹${creditAmount.toLocaleString()} issued successfully.`);
      setIsCreditNoteModalOpen(false);
      setCreditReason("");
      loadData();
    } catch (e: any) {
      alert(`Credit note issuance failed: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Executive Revenue Control & Bullion Audit</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Monetization & Commercial Revenue
          </h1>
          <p className="text-xs text-gray-400">
            Real-time PostgreSQL aggregation of sourcing deal volume, assessed 5% success fees, collections, and dispute audits.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-semibold flex items-center gap-2 self-start transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Live KPIs</span>
        </button>
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV */}
        <div className="p-5 rounded-2xl bg-[#0e121b] border border-white/[0.06] shadow-lg relative overflow-hidden">
          <div className="text-xs font-medium text-gray-400">Confirmed Deal GMV</div>
          <div className="text-2xl font-black text-white mt-2">
            ₹{(analytics?.total_contract_gmv || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Across {analytics?.confirmed_deals_count || 0} confirmed contracts
          </div>
          <div className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
        </div>

        {/* 5% Assessed */}
        <div className="p-5 rounded-2xl bg-[#0e121b] border border-white/[0.06] shadow-lg relative overflow-hidden">
          <div className="text-xs font-medium text-gray-400">5% Success Fees Assessed</div>
          <div className="text-2xl font-black text-blue-400 mt-2">
            ₹{(analytics?.total_assessed_fee || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            + ₹{(analytics?.total_tax_assessed || 0).toLocaleString()} GST (18%)
          </div>
          <div className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* Total Collected */}
        <div className="p-5 rounded-2xl bg-[#0e121b] border border-white/[0.06] shadow-lg relative overflow-hidden">
          <div className="text-xs font-medium text-gray-400">Realized Revenue Collected</div>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            ₹{(analytics?.total_collected || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-500 font-medium mt-1">
            {analytics?.collection_rate_pct || 0}% Collection Efficiency
          </div>
          <div className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>

        {/* Receivables */}
        <div className="p-5 rounded-2xl bg-[#0e121b] border border-white/[0.06] shadow-lg relative overflow-hidden">
          <div className="text-xs font-medium text-gray-400">Outstanding Receivables</div>
          <div className="text-2xl font-black text-amber-400 mt-2">
            ₹{(analytics?.outstanding_receivables || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Overdue: ₹{(analytics?.overdue_receivables || 0).toLocaleString()}
          </div>
          <div className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Verification Queue & Deal Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deal Verification Queue (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0e121b] border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Deal Evidence Verification Queue</span>
            </h3>
            <span className="text-xs text-gray-400">
              {deals.filter((d) => d.verification_status === "pending").length} Pending
            </span>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {deals.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-500">No deals in verification queue.</div>
            ) : (
              deals.map((deal) => (
                <div key={deal.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{deal.title}</span>
                      <span className="text-[10px] font-mono text-gray-400">{deal.contract_reference}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        deal.verification_status === "verified"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : deal.verification_status === "rejected"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {deal.verification_status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Supplier: <span className="text-gray-200">{deal.supplier_name || "Supplier"}</span> &bull; Value: <span className="text-white font-semibold">₹{deal.confirmed_deal_value.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {deal.verification_status !== "verified" && (
                      <button
                        onClick={() => handleVerifyDeal(deal.id, "verified")}
                        className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold"
                      >
                        Verify Evidence
                      </button>
                    )}
                    {deal.verification_status !== "rejected" && (
                      <button
                        onClick={() => handleVerifyDeal(deal.id, "rejected")}
                        className="px-3 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-semibold"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Commercial Pipeline Status Breakdown (1 col) */}
        <div className="p-6 rounded-2xl bg-[#0e121b] border border-white/[0.06] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>Pipeline Breakdown</span>
          </h3>

          <div className="space-y-3">
            {(analytics?.status_breakdown || []).map((b) => (
              <div key={b.status} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white capitalize">{b.status.replace(/_/g, " ")}</div>
                  <div className="text-[11px] text-gray-400">{b.count} deals</div>
                </div>
                <div className="text-xs font-bold text-gray-200">
                  ₹{b.total_value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices & Credit Notes Audit */}
      <div className="p-6 rounded-2xl bg-[#0e121b] border border-white/[0.06] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Commercial Invoices & Credit Adjustment Ledger</span>
          </h3>
          <span className="text-xs text-gray-400">{invoices.length} Invoices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-gray-400">
                <th className="py-2.5 px-3">Invoice Number</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Fee Subtotal (5%)</th>
                <th className="py-2.5 px-3">Total Amount (Inc GST)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-mono font-medium text-white">{inv.invoice_number}</td>
                  <td className="py-3 px-3 text-gray-300">{inv.customer_name || "NexaTech Hardware"}</td>
                  <td className="py-3 px-3 text-gray-300">₹{inv.subtotal.toLocaleString()}</td>
                  <td className="py-3 px-3 font-bold text-white">₹{inv.total_amount.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      inv.status === "paid"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <a
                      href={api.monetization.invoices.getHtmlUrl(inv.invoice_number)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 inline-flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setIsCreditNoteModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                    >
                      Credit Note
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREDIT NOTE MODAL */}
      {isCreditNoteModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleIssueCreditNote} className="bg-[#10141f] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                <Receipt className="w-5 h-5" />
                <span>Issue Commercial Credit Note</span>
              </div>
              <button type="button" onClick={() => setIsCreditNoteModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Applying a credit note against Invoice <strong>#{selectedInvoice.invoice_number}</strong> will issue an auditable reversal for dispute settlement or fee waiver.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Credit Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedInvoice.total_amount}
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Audit Rationale</label>
                <textarea
                  required
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  placeholder="e.g. Sourcing deal volume renegotiated down under mutual dispute agreement."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreditNoteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-500/25"
              >
                Issue Credit Note
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
