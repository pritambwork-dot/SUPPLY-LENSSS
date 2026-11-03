"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Receipt,
  Building2,
  DollarSign,
  CheckCircle2,
  Clock,
  ExternalLink,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  FileText,
  Download,
} from "lucide-react";
import { InvoiceItem } from "@/types";
import { api } from "@/services/api";
import { ProfessionalTaxInvoice } from "@/components/billing/ProfessionalTaxInvoice";
import { Sparkles, Printer, X } from "lucide-react";

export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceItem | null>(null);
  const [selectedTaxInvoicePreset, setSelectedTaxInvoicePreset] = useState<"success_fee" | "landed_deal" | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoices() {
      setIsLoading(true);
      try {
        const list = await api.monetization.invoices.list("biz-001");
        setInvoices(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Error loading invoices:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInvoices();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePayInvoice = async (invoice: InvoiceItem) => {
    setIsProcessingPayment(true);
    try {
      await api.monetization.payments.checkout(invoice.id);
      // Update local state to paid
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoice.id ? { ...inv, status: "paid" as any } : inv
        )
      );
      setSelectedInvoiceForPayment(null);
      showToast(`Payment verified! Invoice ${invoice.invoice_number} is now marked as Paid.`);

      api.customer.logActivity({
        activity_type: "payment_completed",
        title: `Settled Fee Invoice ${invoice.invoice_number}`,
        description: `Completed 5% platform success fee payment of ${invoice.currency} ${invoice.total_amount?.toLocaleString()}.`,
        entity_type: "invoice",
        entity_id: invoice.id,
      });
    } catch {
      showToast("Payment processing error. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              <Receipt className="w-3.5 h-3.5" />
              Commercial Sourcing Billing & Success Fees
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              SupplyLens Service Fee Invoices ({invoices.length})
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Transparent 5% platform success fee assessed strictly on confirmed deals. Zero upfront fees for search or discovery.
            </p>
          </div>

          <button
            onClick={() => setSelectedTaxInvoicePreset("success_fee")}
            className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Generate Official Bill & Tax Invoice</span>
          </button>
        </div>

        {/* Fee Policy Explanation Banner */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 text-xs text-slate-700 space-y-1.5">
          <span className="font-bold text-slate-900 block">5% Success Fee Policy Breakdown:</span>
          <p className="leading-relaxed">
            SupplyLens assesses a flat <strong>5% commercial service fee</strong> + 18% GST on the pre-tax contract value of verified completed sourcing deals. Payment can be settled via UPI, NetBanking, or Corporate Credit Card with instant cryptographic tax invoice issuance.
          </p>
        </div>
      </div>

      {/* Invoices List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading invoice records...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4">
          <Receipt className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-lg font-bold text-slate-800">No Invoices Outstanding</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You do not have any outstanding service fee assessments. Invoices are generated only after you confirm purchase orders with suppliers.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                      {inv.invoice_number}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      5% Platform Success Fee Invoice
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Issued {inv.issue_date ? new Date(inv.issue_date).toLocaleDateString() : "Recently"}</span>
                    <span className="text-slate-300">·</span>
                    <span>Due: {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "Net-15 Days"}</span>
                  </div>
                </div>

                {/* Status Pill */}
                <span
                  className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    inv.status === "paid"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {inv.status === "paid" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {inv.status}
                </span>
              </div>

              {/* Invoice Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Base Service Fee (5%)</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {inv.currency} {inv.base_fee_amount?.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">18% GST Tax</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {inv.currency} {inv.tax_amount?.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/60">
                  <span className="text-[10px] text-blue-600 block uppercase font-semibold">Total Invoice Amount</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">
                    {inv.currency} {inv.total_amount?.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Payment Status</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {inv.status === "paid" ? "Paid in Full" : "Payment Pending"}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedTaxInvoicePreset(inv.currency === "USD" ? "landed_deal" : "success_fee")}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer py-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Official Bill & Tax Invoice</span>
                </button>

                {inv.status !== "paid" && (
                  <button
                    onClick={() => handlePayInvoice(inv)}
                    disabled={isProcessingPayment}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 active:scale-95"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Pay {inv.currency} {inv.total_amount?.toLocaleString()}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          PROFESSIONAL BILL & TAX INVOICE FULL MODAL SHEET
         ========================================================================= */}
      {selectedTaxInvoicePreset && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start print:p-0 print:bg-white print:static print:inset-auto">
          {/* Close button for non-print view */}
          <div className="w-full max-w-4xl flex justify-end pb-2 print:hidden">
            <button
              onClick={() => setSelectedTaxInvoicePreset(null)}
              className="px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
              <span>Close Invoice</span>
            </button>
          </div>

          <ProfessionalTaxInvoice
            initialPreset={selectedTaxInvoicePreset}
            onBack={() => setSelectedTaxInvoicePreset(null)}
            isModal={true}
          />
        </div>
      )}
    </div>
  );
}
