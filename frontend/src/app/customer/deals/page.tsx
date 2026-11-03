"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  FileText,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Receipt,
  AlertCircle,
  Plus,
} from "lucide-react";
import { SourcingDealItem } from "@/types";
import { api } from "@/services/api";
import { PaymentGatewayModal } from "@/components/billing/PaymentGatewayModal";
import { ProfessionalTaxInvoice } from "@/components/billing/ProfessionalTaxInvoice";
import { Zap, X } from "lucide-react";

export default function CustomerDealsPage() {
  const [deals, setDeals] = useState<SourcingDealItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDealForPayment, setSelectedDealForPayment] = useState<SourcingDealItem | null>(null);
  const [selectedTaxInvoicePreset, setSelectedTaxInvoicePreset] = useState<"success_fee" | "landed_deal" | null>(null);

  useEffect(() => {
    async function loadDeals() {
      setIsLoading(true);
      try {
        const list = await api.monetization.deals.list("biz-001");
        setDeals(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Error loading deals:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDeals();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              <Briefcase className="w-3.5 h-3.5" />
              Contract & Purchase Order Management
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sourcing Deals & Contracts ({deals.length})
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Commercial purchase agreements with verified manufacturers. 5% platform success fees apply strictly upon verified contract confirmation.
            </p>
          </div>

          <Link
            href="/customer/invoices"
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200/70 text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Receipt className="w-3.5 h-3.5" />
            View Service Invoices
          </Link>
        </div>
      </div>

      {/* Deals List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading your commercial deals...</p>
        </div>
      ) : deals.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4">
          <Briefcase className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-lg font-bold text-slate-800">No Active Deals Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Once you receive and accept a quotation from a vendor, your purchase order will appear here for commercial tracking.
          </p>
          <Link
            href="/customer/quotations"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700"
          >
            Review Quotation Requests
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="glass-panel-3d rounded-3xl p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                      {deal.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{deal.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vendor: <strong className="text-slate-700">{deal.supplier_name}</strong></span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-slate-600">PO Ref: {deal.contract_reference}</span>
                  </div>
                </div>

                {/* Deal Status Pill */}
                <span
                  className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    deal.status === "confirmed" || deal.status === "verified"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {deal.status}
                </span>
              </div>

              {/* Deal Economics & 5% Fee */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Confirmed Contract Value</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {deal.currency} {deal.confirmed_deal_value?.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/60">
                  <span className="text-[10px] text-blue-600 block uppercase font-semibold">SupplyLens 5% Success Fee</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">
                    {deal.currency} {(deal.confirmed_deal_value * 0.05).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">18% GST on Service Fee</span>
                  <span className="font-mono font-bold text-slate-700 text-sm">
                    {deal.currency} {(deal.confirmed_deal_value * 0.05 * 0.18).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Fee Assessment</span>
                  <span className="font-semibold text-slate-800">
                    {deal.fee_trigger_active ? "Assessed (Invoice Issued)" : "Pending Confirmation"}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <Link
                  href={`/vendors/${deal.supplier_id}`}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  View Vendor Profile <ExternalLink className="w-3 h-3" />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDealForPayment(deal)}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 text-cyan-200" />
                    <span>Settle Fee ({deal.currency} {(deal.confirmed_deal_value * 0.05 * 1.18).toLocaleString()})</span>
                  </button>

                  <Link
                    href="/customer/invoices"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Invoices</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={!!selectedDealForPayment}
        onClose={() => setSelectedDealForPayment(null)}
        deal={selectedDealForPayment}
        onPaymentSuccess={() => {
          if (selectedDealForPayment) {
            setDeals((prev) =>
              prev.map((d) =>
                d.id === selectedDealForPayment.id ? { ...d, status: "settled" } : d
              )
            );
          }
        }}
        onViewTaxInvoice={(preset) => {
          setSelectedTaxInvoicePreset(preset);
        }}
      />

      {/* Official Tax Invoice & Bill Modal */}
      {selectedTaxInvoicePreset && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start print:p-0 print:bg-white print:static print:inset-auto animate-in fade-in duration-200">
          <div className="w-full max-w-4xl flex justify-end pb-2 print:hidden">
            <button
              onClick={() => setSelectedTaxInvoicePreset(null)}
              className="px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
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
