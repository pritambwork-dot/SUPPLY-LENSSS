"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Download,
  Lock,
  Building2,
  DollarSign,
  ChevronRight,
  QrCode,
  Building,
  Check,
  Receipt
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/services/api";

interface InvoiceRecord {
  id: string;
  invoice_number: string;
  deal_id: string;
  deal_value: number;
  supplier_name: string;
  customer_name: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: "issued" | "paid" | "in_escrow" | "disputed";
  issued_date: string;
  due_date: string;
  paid_at?: string;
  payment_method?: string;
  payment_reference?: string;
}

interface BillingDashboardViewProps {
  onNavigateTab?: (tab: string) => void;
  onSelectSupplier?: (supplierId: string) => void;
}

const iosSpring = { type: "spring" as const, stiffness: 350, damping: 28 };
const iosSheetSpring = { type: "spring" as const, stiffness: 300, damping: 26, mass: 0.8 };

export const BillingDashboardView: React.FC<BillingDashboardViewProps> = ({
  onNavigateTab,
  onSelectSupplier,
}) => {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([
    {
      id: "inv-demo-01",
      invoice_number: "INV-2026-0001",
      deal_id: "deal-001",
      deal_value: 1000000,
      supplier_name: "Utkal GreenFiber Pvt Ltd",
      customer_name: "Sustainable Packaging Labs",
      subtotal: 50000,
      tax_amount: 9000,
      total_amount: 59000,
      currency: "INR",
      status: "issued",
      issued_date: "2026-11-01T10:00:00Z",
      due_date: "2026-11-16T10:00:00Z",
    },
    {
      id: "inv-demo-02",
      invoice_number: "INV-2026-0002",
      deal_id: "deal-002",
      deal_value: 140000,
      supplier_name: "Deccan BioPlastics & Packaging",
      customer_name: "Sustainable Packaging Labs",
      subtotal: 7000,
      tax_amount: 1260,
      total_amount: 8260,
      currency: "INR",
      status: "paid",
      issued_date: "2026-10-18T14:30:00Z",
      due_date: "2026-11-02T14:30:00Z",
      paid_at: "2026-10-24T16:15:00Z",
      payment_method: "Corporate UPI (Instant Settlement)",
      payment_reference: "UPI-SL984372911-TXN",
    },
    {
      id: "inv-demo-03",
      invoice_number: "INV-2026-0003",
      deal_id: "deal-003",
      deal_value: 500000,
      supplier_name: "Aura Organic Looms & Knitwear",
      customer_name: "Sustainable Packaging Labs",
      subtotal: 25000,
      tax_amount: 4500,
      total_amount: 29500,
      currency: "INR",
      status: "paid",
      issued_date: "2026-09-12T09:15:00Z",
      due_date: "2026-09-27T09:15:00Z",
      paid_at: "2026-09-20T11:45:00Z",
      payment_method: "Bank NEFT Wire",
      payment_reference: "NEFT-AXIS-2026-092044",
    },
  ]);

  const [activeTab, setActiveTab] = useState<"all" | "unpaid" | "paid">("all");
  const [selectedInvoiceForCheckout, setSelectedInvoiceForCheckout] = useState<InvoiceRecord | null>(null);
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<InvoiceRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "wire">("upi");
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    api.monetization.getAnalytics("INR")
      .then((data) => {
        if (data) setAnalytics(data);
      })
      .catch(() => {});

    api.monetization.invoices.list()
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          setInvoices(data);
        }
      })
      .catch(() => {});
  }, []);

  const totalGMV = invoices.reduce((sum, inv) => sum + (inv.deal_value || inv.subtotal * 20), 0);
  const totalAssessed = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalPaid = invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalOutstanding = invoices.filter((inv) => inv.status !== "paid").reduce((sum, inv) => sum + inv.total_amount, 0);

  const filteredInvoices = invoices.filter((inv) => {
    if (activeTab === "unpaid") return inv.status !== "paid";
    if (activeTab === "paid") return inv.status === "paid";
    return true;
  });

  const handleSimulatePayment = () => {
    if (!selectedInvoiceForCheckout) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      const updatedInvoices = invoices.map((inv) => {
        if (inv.id === selectedInvoiceForCheckout.id) {
          return {
            ...inv,
            status: "paid" as const,
            paid_at: new Date().toISOString(),
            payment_method:
              paymentMethod === "upi"
                ? "Instant UPI / QR Settlement"
                : paymentMethod === "card"
                ? "Corporate Credit Card (•••• 4242)"
                : "Escrow Bank Wire / NEFT",
            payment_reference: `SL-TXN-${Date.now().toString().slice(-8)}`,
          };
        }
        return inv;
      });

      setInvoices(updatedInvoices);
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
    }, 900);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with iOS Frosted Glass & Sourcing Fee Disclosure */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={iosSpring}
        className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 font-bold shrink-0 shadow-xs">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Customer Billing & Success Fee Statements
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                5.0% SERVICE FEE POLICY
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              SupplyLens charges a <strong>5% success fee</strong> solely upon confirmed pre-tax contract value.
              Zero fees for discovering suppliers, generating estimates, or comparing quotations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audited Pre-Tax Base</span>
          </span>
        </div>
      </motion.div>

      {/* KPI Overview Tiles (Apple Health / Settings Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: GMV */}
        <motion.div
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
        >
          <span className="text-[11px] font-semibold text-slate-500 block mb-1">
            Confirmed Sourcing Contract Value
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900">
              ₹ {totalGMV.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">
            3 platform contract awards
          </span>
        </motion.div>

        {/* Tile 2: 5% Fee Assessed */}
        <motion.div
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
        >
          <span className="text-[11px] font-semibold text-slate-500 block mb-1">
            Total 5% Fee Assessed
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-blue-600">
              ₹ {totalAssessed.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">
            Includes 18% GST itemized
          </span>
        </motion.div>

        {/* Tile 3: Settled Paid Fees */}
        <motion.div
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
        >
          <span className="text-[11px] font-semibold text-slate-500 block mb-1">
            Settled Service Fees
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-600">
              ₹ {totalPaid.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block font-semibold">
            ✓ 2 Invoices Cleared
          </span>
        </motion.div>

        {/* Tile 4: Outstanding Due */}
        <motion.div
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
        >
          <span className="text-[11px] font-semibold text-slate-500 block mb-1">
            Outstanding Due
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-amber-600">
              ₹ {totalOutstanding.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-amber-600 mt-1 block font-semibold">
            Due within 14 days
          </span>
        </motion.div>
      </div>

      {/* iOS Segmented Control Filter Tabs */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center gap-1 shadow-inner">
          {[
            { id: "all", label: `All Invoices (${invoices.length})` },
            { id: "unpaid", label: `Unpaid Due (${invoices.filter((i) => i.status !== "paid").length})` },
            { id: "paid", label: `Settled (${invoices.filter((i) => i.status === "paid").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="ios-active-billing-tab"
                  transition={iosSpring}
                  className="absolute inset-0 bg-white rounded-xl shadow-xs"
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            // Re-fetch
            api.monetization.invoices.list().catch(() => {});
          }}
          className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Refresh Statements</span>
        </button>
      </div>

      {/* Invoices List / Cards */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredInvoices.map((inv) => (
            <motion.div
              key={inv.id}
              whileHover={{ backgroundColor: "rgba(248, 250, 252, 0.8)" }}
              className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors"
            >
              {/* Left Details */}
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                    inv.status === "paid"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : "bg-amber-50 border-amber-200 text-amber-600"
                  }`}
                >
                  {inv.status === "paid" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                      {inv.invoice_number}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        inv.status === "paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {inv.status === "paid" ? "SETTLED / PAID" : "PAYMENT DUE"}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-semibold">
                      Contract: ₹ {(inv.deal_value || inv.subtotal * 20).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-700">{inv.supplier_name}</span>
                    <span>•</span>
                    <span>Issued: {inv.issued_date.slice(0, 10)}</span>
                    <span>•</span>
                    <span>Due: {inv.due_date.slice(0, 10)}</span>
                  </div>

                  {inv.paid_at && (
                    <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
                      ✓ Settled via {inv.payment_method} on {inv.paid_at.slice(0, 10)} (Ref: {inv.payment_reference})
                    </span>
                  )}
                </div>
              </div>

              {/* Amount Breakdown & Actions */}
              <div className="flex items-center justify-between lg:justify-end gap-6 self-stretch lg:self-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="text-left lg:text-right">
                  <span className="text-[10px] text-slate-400 font-medium block">
                    5% Fee (₹ {inv.subtotal.toLocaleString()}) + 18% GST
                  </span>
                  <span className="text-base font-extrabold text-slate-900 block">
                    ₹ {inv.total_amount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedInvoiceForReceipt(inv)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Receipt</span>
                  </button>

                  {inv.status !== "paid" ? (
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setSelectedInvoiceForCheckout(inv);
                        setPaymentSuccess(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay Fee (5%)</span>
                    </motion.button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-400 text-xs font-semibold border border-slate-200/60">
                      Paid
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {filteredInvoices.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-xs">
              No fee statements found matching this filter.
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          IN-DASHBOARD PAYMENT CHECKOUT SHEET / MODAL (Apple iOS Modal Sheet)
         ========================================================================= */}
      <AnimatePresence>
        {selectedInvoiceForCheckout && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={iosSheetSpring}
              className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 overflow-hidden flex flex-col"
            >
              {/* iOS Top Pull Bar */}
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden" />

              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      Settle 5% Success Fee
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200">
                      {selectedInvoiceForCheckout.invoice_number}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Supplier: {selectedInvoiceForCheckout.supplier_name}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedInvoiceForCheckout(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="py-4 space-y-4">
                {/* Contract Summary Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Confirmed Contract Value (GMV)</span>
                    <span className="font-bold text-slate-900">
                      ₹ {(selectedInvoiceForCheckout.deal_value || selectedInvoiceForCheckout.subtotal * 20).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SupplyLens 5.0% Service Fee</span>
                    <span className="font-bold text-blue-600">
                      ₹ {selectedInvoiceForCheckout.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Applicable GST (18.0%)</span>
                    <span className="font-semibold text-slate-700">
                      ₹ {selectedInvoiceForCheckout.tax_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                    <span>Total Service Fee Payable</span>
                    <span className="text-blue-600">
                      ₹ {selectedInvoiceForCheckout.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {paymentSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto font-bold text-lg">
                      ✓
                    </div>
                    <h3 className="text-sm font-bold text-emerald-900">
                      Payment Successfully Verified!
                    </h3>
                    <p className="text-xs text-emerald-700">
                      Your 5% service fee statement is settled. The commercial deal escrow has been activated.
                    </p>
                    <span className="text-[11px] font-mono text-emerald-600 block pt-1">
                      Transaction Ref: SL-TXN-{Date.now().toString().slice(-8)}
                    </span>
                  </motion.div>
                ) : (
                  <>
                    {/* Payment Method Selector (iOS Segmented Cards) */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-2">
                        Select Payment Method
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "upi", label: "Instant UPI", icon: QrCode },
                          { id: "card", label: "Credit Card", icon: CreditCard },
                          { id: "wire", label: "NEFT / Wire", icon: Building },
                        ].map((m) => {
                          const Icon = m.icon;
                          const isSelected = paymentMethod === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setPaymentMethod(m.id as any)}
                              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
                                isSelected
                                  ? "bg-blue-50/60 border-blue-500 text-blue-700 shadow-xs"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-[11px] font-bold">{m.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Method details */}
                    {paymentMethod === "upi" && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800 block">VPA: supplylens.settlement@icici</span>
                          <span className="text-[10px] text-slate-500">Supports GPay, PhonePe, Paytm, BHIM</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                          Zero Surcharge
                        </span>
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <span className="font-bold text-slate-800 block">Encrypted Gateway Tokenization</span>
                        <span className="text-[10px] text-slate-500">Card ending in •••• 4242 will be authorized for settlement.</span>
                      </div>
                    )}

                    {paymentMethod === "wire" && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 font-mono">
                        <span className="font-bold text-slate-800 block font-sans">Corporate Escrow Account</span>
                        <span className="text-[10px] text-slate-500 block">A/C: 50200084920491 • IFSC: HDFC0000128</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForCheckout(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  {paymentSuccess ? "Close" : "Cancel"}
                </button>

                {!paymentSuccess && (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleSimulatePayment}
                    disabled={isProcessingPayment}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Authorize ₹ {selectedInvoiceForCheckout.total_amount.toLocaleString()}</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          INVOICE RECEIPT MODAL (Apple Sheet Style)
         ========================================================================= */}
      <AnimatePresence>
        {selectedInvoiceForReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={iosSpring}
              className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 overflow-hidden flex flex-col"
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Commercial Tax Invoice & Fee Statement
                  </h3>
                  <span className="text-xs font-mono text-slate-500">
                    Ref: {selectedInvoiceForReceipt.invoice_number}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedInvoiceForReceipt(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="py-5 space-y-4 text-xs">
                {/* Billed To / From */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                      Issuer & Platform
                    </span>
                    <strong className="text-slate-900 block">SupplyLens Global Inc.</strong>
                    <span className="text-slate-500 block">Sourcing Intelligence Desk</span>
                    <span className="text-slate-400 block font-mono text-[10px]">GSTIN: 21AAACS9823M1ZX</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                      Billed Customer
                    </span>
                    <strong className="text-slate-900 block">{selectedInvoiceForReceipt.customer_name}</strong>
                    <span className="text-slate-500 block">Lead Sourcing Director</span>
                    <span className="text-slate-500 block">Contract Deal: {selectedInvoiceForReceipt.deal_id}</span>
                  </div>
                </div>

                {/* Line Items */}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase">
                      <th className="py-2">Description</th>
                      <th className="py-2 text-right">Fee Rate</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 font-medium text-slate-800">
                        SupplyLens Success Fee on Confirmed Sourcing Deal ({selectedInvoiceForReceipt.supplier_name})
                      </td>
                      <td className="py-2.5 text-right font-semibold text-slate-600">5.0%</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">
                        ₹ {selectedInvoiceForReceipt.subtotal.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-slate-600">Integrated Goods & Services Tax (IGST)</td>
                      <td className="py-2.5 text-right font-semibold text-slate-600">18.0%</td>
                      <td className="py-2.5 text-right font-semibold text-slate-800">
                        ₹ {selectedInvoiceForReceipt.tax_amount.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-t-2 border-slate-200 font-extrabold text-sm">
                      <td className="py-3 text-slate-900">Total Billed Due</td>
                      <td></td>
                      <td className="py-3 text-right text-blue-600">
                        ₹ {selectedInvoiceForReceipt.total_amount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Cryptographic Proof */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 font-mono text-[10px] text-slate-500">
                  <span className="block font-sans font-bold text-slate-700">Cryptographic Proof & Settlement Hash</span>
                  <span className="block truncate text-slate-400 mt-0.5">
                    SHA-256: 7d4924a919fae33b9148d88e09f7a77e163b7829a8f4c2810a916723ef982b12
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Receipt</span>
                </button>

                <button
                  onClick={() => setSelectedInvoiceForReceipt(null)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
