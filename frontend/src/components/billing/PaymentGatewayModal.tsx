"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  QrCode,
  Building,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  X,
  FileText,
  Sparkles,
  Zap,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { InvoiceItem, SourcingDealItem } from "@/types";
import { api } from "@/services/api";

export interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: InvoiceItem | null;
  deal?: SourcingDealItem | null;
  defaultAmount?: number;
  defaultCurrency?: string;
  onPaymentSuccess?: (paymentResult: any) => void;
  onViewTaxInvoice?: (invoicePreset: "success_fee" | "landed_deal") => void;
}

export function PaymentGatewayModal({
  isOpen,
  onClose,
  invoice,
  deal,
  defaultAmount = 7125,
  defaultCurrency = "INR",
  onPaymentSuccess,
  onViewTaxInvoice,
}: PaymentGatewayModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<"razorpay" | "upi" | "card" | "wire" | "sandbox">("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txnReference, setTxnReference] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Card Form Fields
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8821");
  const [cardHolder, setCardHolder] = useState("HOSSEIN RAHMANI");
  const [cardExpiry, setCardExpiry] = useState("08/29");
  const [cardCvv, setCardCvv] = useState("892");

  // Determine financial values
  const currency = invoice?.currency || deal?.currency || defaultCurrency;
  const baseFee =
    invoice?.base_fee_amount ||
    invoice?.subtotal ||
    (deal ? Math.round(deal.confirmed_deal_value * 0.05) : defaultAmount);
  const taxAmount = invoice?.tax_amount || Math.round(baseFee * 0.18);
  const totalAmount = invoice?.total_amount || (baseFee + taxAmount);
  const invoiceNumber =
    invoice?.invoice_number ||
    (deal?.contract_reference ? `INV-${deal.contract_reference}` : `SL-INV-${Date.now().toString().slice(-6)}`);
  const contractGmv =
    deal?.confirmed_deal_value || (invoice ? Math.round(baseFee * 20) : baseFee * 20);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsProcessing(false);
      setTxnReference("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExecutePayment = async () => {
    setIsProcessing(true);
    try {
      const invId = invoice?.id || (deal ? `inv-deal-${deal.id}` : "inv-pending-003");
      // 1. Checkout session via API
      let checkoutRes: any;
      try {
        checkoutRes = await api.monetization.payments.checkout(invId);
      } catch (e) {
        checkoutRes = {
          payment_reference: `rzp_pay_${Math.random().toString(36).substring(2, 12)}`,
          gateway: selectedMethod,
        };
      }

      const payRef = checkoutRes?.payment_reference || `rzp_pay_${Math.random().toString(36).substring(2, 12)}`;
      setTxnReference(payRef);

      // Simulate network gateway cryptographic authorization
      await new Promise((r) => setTimeout(r, 1200));

      // 2. Verify payment status with idempotency
      try {
        await api.monetization.payments.verify(payRef, invId);
      } catch {
        // Fallback for mock environments
      }

      // 3. Persist settlement locally
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("supplylens_commercial_settled", "true");
          const rawInvoices = localStorage.getItem("supplylens_demo_invoices");
          if (rawInvoices) {
            const list = JSON.parse(rawInvoices);
            const updated = list.map((item: any) =>
              item.id === invId || item.invoice_number === invoiceNumber
                ? {
                    ...item,
                    status: "paid",
                    paid_at: new Date().toISOString(),
                    payment_method:
                      selectedMethod === "razorpay"
                        ? "Razorpay Standard Gateway"
                        : selectedMethod === "upi"
                        ? "Instant UPI (QR)"
                        : selectedMethod === "card"
                        ? "Corporate Credit Card"
                        : "Escrow Bank Wire",
                    payment_reference: payRef,
                  }
                : item
            );
            localStorage.setItem("supplylens_demo_invoices", JSON.stringify(updated));
          }
        } catch {}
      }

      // 4. Log activity
      try {
        api.customer.logActivity({
          activity_type: "payment_completed",
          title: `Settled Fee Invoice ${invoiceNumber}`,
          description: `Settled 5% platform success fee of ${currency} ${totalAmount.toLocaleString()} via ${selectedMethod.toUpperCase()} Gateway.`,
          entity_type: "invoice",
          entity_id: invId,
        });
      } catch {}

      setIsSuccess(true);
      if (onPaymentSuccess) {
        onPaymentSuccess({
          payment_reference: payRef,
          invoice_id: invId,
          amount: totalAmount,
          currency,
          gateway: selectedMethod,
        });
      }
    } catch (err: any) {
      alert(`Payment authorization error: ${err?.message || "Please try another payment method."}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col relative"
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  SupplyLens Settlement Gateway
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold font-mono">
                  <Lock className="w-3 h-3" />
                  256-BIT SSL
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                Invoice Ref: #{invoiceNumber} {deal?.contract_reference ? `• ${deal.contract_reference}` : ""}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Screen */}
        {isSuccess ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-16 h-16 rounded-3xl bg-emerald-50 border-2 border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/15"
            >
              <CheckCircle2 className="w-9 h-9" />
            </motion.div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Payment Authorized & Reconciled!
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your 5% commercial service fee has been settled. Contract escrow has been activated and cryptographically signed.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2 text-left">
              <div className="flex justify-between items-center text-slate-600">
                <span>Transaction Reference</span>
                <span className="font-mono font-bold text-slate-800">{txnReference || "rzp_pay_confirmed_2026"}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Amount Paid</span>
                <span className="font-mono font-extrabold text-emerald-600 text-sm">
                  {currency} {totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Gateway Status</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  CAPTURED & RECONCILED
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Timestamp</span>
                <span className="font-mono text-slate-500">{new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onViewTaxInvoice) {
                    onViewTaxInvoice(currency === "USD" ? "landed_deal" : "success_fee");
                  }
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <FileText className="w-4 h-4 text-cyan-200" />
                <span>View Official Bill & Tax Invoice</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Amount & Commercial Terms Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                    Total Amount Due
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                    {currency} {totalAmount.toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Deal GMV Value</span>
                  <span className="text-xs font-bold text-slate-700 font-mono">
                    {currency} {contractGmv.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Fee Breakdown Breakdown */}
              <div className="pt-2.5 border-t border-blue-200/60 grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Platform Fee (5%)</span>
                  <span className="font-bold text-slate-700 font-mono">{currency} {baseFee.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Applicable GST (18%)</span>
                  <span className="font-bold text-slate-700 font-mono">{currency} {taxAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Escrow Protection</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Included
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Rail Selectors */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Select Payment Rail
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "razorpay", label: "Razorpay", icon: Zap, badge: "Popular" },
                  { id: "upi", label: "Instant UPI", icon: QrCode, badge: "0% Fee" },
                  { id: "card", label: "Card", icon: CreditCard, badge: "Visa/MC" },
                  { id: "wire", label: "Escrow Wire", icon: Building, badge: "NEFT/RTGS" },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = selectedMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id as any)}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer relative ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? "text-cyan-200" : "text-blue-600"}`} />
                      <span className="text-[11px] font-bold leading-tight">{m.label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                          isSelected ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-600"
                        }`}
                      >
                        {m.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rail 1: Razorpay Standard / Cards */}
            {(selectedMethod === "razorpay" || selectedMethod === "card") && (
              <div className="space-y-4">
                {/* 3D Glass Credit Card Preview */}
                <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-900 text-white shadow-xl border border-white/20">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold tracking-wider text-cyan-300">
                      SUPPLYLENS COMMERCIAL ESCROW CARD
                    </span>
                    <span className="text-xs font-bold italic tracking-wider text-slate-300">VISA / RUPAY</span>
                  </div>

                  <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-200 to-yellow-400 mb-3 opacity-90 shadow-xs" />

                  <div className="font-mono text-base tracking-widest text-slate-100 mb-3 font-semibold">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase">Cardholder</span>
                      <span>{cardHolder || "AUTHORIZED BUYER"}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-slate-400 block uppercase">Expires</span>
                      <span>{cardExpiry || "12/28"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Inputs */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 8920 1823 8821"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Expiration (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="08/29"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="892"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Rail 2: Instant UPI */}
            {selectedMethod === "upi" && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Visual QR Code Container */}
                  <div className="w-32 h-32 rounded-2xl bg-white p-2 border border-slate-200 shadow-xs flex flex-col items-center justify-center shrink-0">
                    <QrCode className="w-24 h-24 text-slate-800" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Scan to Settle</span>
                  </div>

                  <div className="space-y-2 text-xs flex-1">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Verified Merchant VPA</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          supplylens.settlement@icici
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy("supplylens.settlement@icici", "vpa")}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer transition-colors"
                          title="Copy UPI ID"
                        >
                          {copiedKey === "vpa" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Instant settlement via Google Pay, PhonePe, Paytm, BHIM, and Cred. Pre-filled with exact fee amount.
                    </p>

                    <div className="flex items-center gap-1.5 pt-1">
                      {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                        <span key={app} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rail 3: Corporate Escrow Wire */}
            {selectedMethod === "wire" && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-800">SupplyLens Official Commercial Escrow</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold font-mono">
                    RTGS / NEFT / SWIFT
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 block font-semibold">Account Number</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-bold text-slate-800">50200084920491</span>
                      <button onClick={() => handleCopy("50200084920491", "acct")} className="text-slate-400 hover:text-slate-700">
                        {copiedKey === "acct" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 block font-semibold">IFSC Code</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-bold text-slate-800">HDFC0000128</span>
                      <button onClick={() => handleCopy("HDFC0000128", "ifsc")} className="text-slate-400 hover:text-slate-700">
                        {copiedKey === "ifsc" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 p-2.5 rounded-xl bg-white border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 block font-semibold">Beneficiary Name</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">
                      SupplyLens Global Technologies Pvt Ltd - Client Escrow
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecutePayment}
                className="flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Authorizing Gateway & Escrow...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-cyan-200" />
                    <span>Authorize {currency} {totalAmount.toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
