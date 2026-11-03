"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileSpreadsheet, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  DollarSign, 
  ExternalLink, 
  ShieldCheck, 
  ArrowRight, 
  Upload, 
  RefreshCw, 
  X,
  CreditCard,
  Building,
  Check,
  AlertCircle
} from "lucide-react";
import { api } from "@/services/api";
import { SourcingDealItem, TenderItem, InvoiceItem } from "@/types";

interface DealsTransactionsViewProps {
  businessId?: string;
  onSelectSupplier?: (supplierId: string) => void;
  onNavigateToBilling?: () => void;
}

export const DealsTransactionsView: React.FC<DealsTransactionsViewProps> = ({
  businessId = "biz-001",
  onSelectSupplier,
  onNavigateToBilling,
}) => {
  const [deals, setDeals] = useState<SourcingDealItem[]>([]);
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<"deals" | "tenders" | "invoices">("deals");
  
  // Modals
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [isNewTenderOpen, setIsNewTenderOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isAttachDocOpen, setIsAttachDocOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<SourcingDealItem | null>(null);

  // Form states
  const [confirmRef, setConfirmRef] = useState("");
  const [confirmNotes, setConfirmNotes] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [docType, setDocType] = useState("purchase_order");
  const [docFileName, setDocFileName] = useState("");
  const [docFileUrl, setDocFileUrl] = useState("");

  // New Deal form
  const [newDealTitle, setNewDealTitle] = useState("");
  const [newDealValue, setNewDealValue] = useState<number>(500000);
  const [newDealSupplierId, setNewDealSupplierId] = useState("sup-001");
  const [newDealContractRef, setNewDealContractRef] = useState("PO-2026-");

  // New Tender form
  const [newTenderTitle, setNewTenderTitle] = useState("");
  const [newTenderCategory, setNewTenderCategory] = useState("Electronics Manufacturing");
  const [newTenderQty, setNewTenderQty] = useState<number>(1000);
  const [newTenderBudget, setNewTenderBudget] = useState<number>(600000);

  // Notifications
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedDeals, fetchedTenders] = await Promise.all([
        api.monetization.deals.list(businessId),
        api.monetization.tenders.list(businessId),
      ]);
      setDeals(fetchedDeals || []);
      setTenders(fetchedTenders || []);
    } catch (e: any) {
      console.error("Error loading deals data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [businessId]);

  // Handle deal confirmation and 5% fee generation
  const handleConfirmDeal = async () => {
    if (!selectedDeal) return;
    try {
      const res: any = await api.monetization.deals.confirm(selectedDeal.id, confirmRef, confirmNotes);
      showToast(`Deal confirmed! 5% Success fee assessed: ₹${res.calculated_fee?.toLocaleString()} (Invoice #${res.invoice_number})`);
      setIsConfirmModalOpen(false);
      setConfirmRef("");
      setConfirmNotes("");
      loadData();
    } catch (e: any) {
      alert(`Confirmation failed: ${e.message}`);
    }
  };

  // Handle dispute
  const handleDispute = async () => {
    if (!selectedDeal || !disputeReason) return;
    try {
      await api.monetization.deals.dispute(selectedDeal.id, disputeReason);
      showToast("Deal marked as disputed and flagged for review.");
      setIsDisputeModalOpen(false);
      setDisputeReason("");
      loadData();
    } catch (e: any) {
      alert(`Dispute failed: ${e.message}`);
    }
  };

  // Handle document upload
  const handleAttachDoc = async () => {
    if (!selectedDeal || !docFileName || !docFileUrl) return;
    try {
      await api.monetization.deals.addDocument(selectedDeal.id, {
        document_type: docType,
        file_name: docFileName,
        file_url: docFileUrl,
        file_size_bytes: 1048576,
      });
      showToast(`Document ${docFileName} attached.`);
      setIsAttachDocOpen(false);
      setDocFileName("");
      setDocFileUrl("");
      loadData();
    } catch (e: any) {
      alert(`Failed to attach document: ${e.message}`);
    }
  };

  // Create deal
  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.monetization.deals.create({
        business_id: businessId,
        supplier_id: newDealSupplierId,
        title: newDealTitle,
        confirmed_deal_value: Number(newDealValue),
        contract_reference: newDealContractRef,
        currency: "INR",
        initial_status: "contract_pending",
      });
      showToast("New sourcing deal created!");
      setIsNewDealOpen(false);
      setNewDealTitle("");
      loadData();
    } catch (e: any) {
      alert(`Failed to create deal: ${e.message}`);
    }
  };

  // Create tender
  const handleCreateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.monetization.tenders.create({
        business_id: businessId,
        title: newTenderTitle,
        product_category: newTenderCategory,
        required_quantity: Number(newTenderQty),
        estimated_budget: Number(newTenderBudget),
        currency: "INR",
      });
      showToast("Tender / RFQ published successfully!");
      setIsNewTenderOpen(false);
      setNewTenderTitle("");
      loadData();
    } catch (e: any) {
      alert(`Failed to create tender: ${e.message}`);
    }
  };

  // Handle payment checkout
  const handleSimulatePayment = async () => {
    if (!selectedDeal?.invoice) return;
    try {
      const checkout: any = await api.monetization.payments.checkout(selectedDeal.invoice.id);
      if (checkout.payment_reference) {
        // Verify payment in sandbox
        const verify: any = await api.monetization.payments.verify(checkout.payment_reference, selectedDeal.invoice.id);
        if (verify.status === "success") {
          showToast(`Payment of ₹${selectedDeal.invoice.total_amount.toLocaleString()} settled successfully via Sandbox Gateway!`);
          setIsPayModalOpen(false);
          loadData();
        }
      }
    } catch (e: any) {
      alert(`Payment simulation failed: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header & Policy Explanation Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#10141f] via-[#0d1017] to-[#07090e] border border-white/[0.08] p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Transparent Commercial Monetization &bull; 5% Success Fee</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Deals, Tender Tracking & Fee Settlement
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
              SupplyLens charges a <strong className="text-white">5% service fee</strong> exclusively when you successfully conclude and confirm a sourcing contract or purchase order with a verified supplier. Zero charges for supplier discovery, searches, or quotation comparisons.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsNewTenderOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>New RFQ / Tender</span>
            </button>
            <button
              onClick={() => setIsNewDealOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Record Deal</span>
            </button>
          </div>
        </div>

        {/* Commercial Formula Bar */}
        <div className="mt-6 pt-6 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Success Fee Rate</div>
            <div className="text-lg font-bold text-white mt-1">5.0% <span className="text-xs font-normal text-emerald-400 font-mono">(Policy v1.0)</span></div>
            <div className="text-[11px] text-gray-500 mt-0.5">Calculated on pre-tax contract value</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Trigger Event</div>
            <div className="text-lg font-bold text-white mt-1">Verified Contract / PO</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Never charged on chatbot suggestions</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Payment Terms</div>
            <div className="text-lg font-bold text-white mt-1">Net 15 Days</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Formal invoice with 18% GST</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Discovery & RFQ Fee</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">₹0.00 (Free)</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Unlimited searches & quote comparisons</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("deals")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === "deals"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
            }`}
          >
            Sourcing Deals ({deals.length})
          </button>
          <button
            onClick={() => setActiveSubTab("tenders")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === "tenders"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
            }`}
          >
            Published Tenders & RFQs ({tenders.length})
          </button>
        </div>

        <button
          onClick={loadData}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
          title="Refresh records"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* SOURCING DEALS LIST */}
      {activeSubTab === "deals" && (
        <div className="space-y-4">
          {deals.length === 0 ? (
            <div className="text-center py-16 bg-[#0a0d14]/60 border border-dashed border-white/[0.08] rounded-3xl p-8">
              <FileSpreadsheet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No commercial deals recorded yet</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mt-1 mb-6">
                When you agree terms with a supplier discovered on SupplyLens, record the purchase order here to generate auditable records and track delivery.
              </p>
              <button
                onClick={() => setIsNewDealOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Record First Sourcing Deal</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {deals.map((deal) => {
                const isConfirmed = deal.fee_trigger_active || ["contract_signed", "purchase_order_confirmed", "completed"].includes(deal.status);
                const isPaid = deal.invoice?.status === "paid";
                const isDisputed = deal.status === "disputed";

                return (
                  <div
                    key={deal.id}
                    className="p-5 md:p-6 rounded-2xl bg-[#0e121b] border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-4 shadow-lg"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono text-gray-400">{deal.contract_reference}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            isPaid
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : isDisputed
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : isConfirmed
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {deal.status.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs text-gray-500">&bull;</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-gray-500" />
                            {deal.supplier_name || "Supplier"}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mt-1">{deal.title}</h3>
                      </div>

                      <div className="text-left md:text-right">
                        <div className="text-xs text-gray-400">Confirmed Contract Value</div>
                        <div className="text-xl font-extrabold text-white">
                          ₹{deal.confirmed_deal_value.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* 5% Fee Breakdown Section if Confirmed */}
                    {isConfirmed && deal.assessment && (
                      <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" />
                            <span>SupplyLens 5% Success Fee Assessed</span>
                          </div>
                          <div className="text-xs text-gray-300">
                            Base Fee (5%): <strong className="text-white">₹{deal.assessment.calculated_fee.toLocaleString()}</strong> + GST (18%): <strong className="text-white">₹{deal.assessment.tax_amount.toLocaleString()}</strong> = Total Due: <strong className="text-emerald-400">₹{deal.assessment.total_fee_due.toLocaleString()}</strong>
                          </div>
                          {deal.invoice && (
                            <div className="text-[11px] text-gray-400">
                              Invoice: <span className="font-mono text-gray-200">#{deal.invoice.invoice_number}</span> &bull; Status: <span className={`font-semibold ${isPaid ? "text-emerald-400" : "text-amber-400"}`}>{deal.invoice.status.toUpperCase()}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {deal.invoice && (
                            <a
                              href={api.monetization.invoices.getHtmlUrl(deal.invoice.invoice_number)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-medium flex items-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Invoice HTML</span>
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </a>
                          )}

                          {!isPaid && deal.invoice && (
                            <button
                              onClick={() => {
                                if (onNavigateToBilling) {
                                  onNavigateToBilling();
                                }
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay Fee (5%)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.04]">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedDeal(deal);
                            setIsAttachDocOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-gray-300 text-xs flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5 text-gray-400" />
                          <span>Attach PO / Contract Proof</span>
                        </button>
                        
                        {!isDisputed && (
                          <button
                            onClick={() => {
                              setSelectedDeal(deal);
                              setIsDisputeModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Dispute Deal</span>
                          </button>
                        )}
                      </div>

                      {!isConfirmed && (
                        <button
                          onClick={() => {
                            setSelectedDeal(deal);
                            setConfirmRef(deal.contract_reference);
                            setIsConfirmModalOpen(true);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm Deal & Generate 5% Statement</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TENDERS / RFQS LIST */}
      {activeSubTab === "tenders" && (
        <div className="space-y-4">
          {tenders.length === 0 ? (
            <div className="text-center py-16 bg-[#0a0d14]/60 border border-dashed border-white/[0.08] rounded-3xl p-8">
              <FileSpreadsheet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No active tenders published</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mt-1 mb-6">
                Publish a Request for Quotation (RFQ) to broadcast your sourcing requirements to verified manufacturers in India and Southeast Asia.
              </p>
              <button
                onClick={() => setIsNewTenderOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Publish New Tender</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tenders.map((tender) => (
                <div
                  key={tender.id}
                  className="p-5 rounded-2xl bg-[#0e121b] border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-gray-400">{tender.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                      {tender.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{tender.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{tender.description || "Turnkey contract manufacturing requirement."}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.04] text-xs">
                    <div>
                      <span className="text-gray-500">Qty:</span>{" "}
                      <span className="font-semibold text-white">{tender.required_quantity} {tender.unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Budget:</span>{" "}
                      <span className="font-semibold text-white">₹{tender.estimated_budget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONFIRM DEAL MODAL */}
      {isConfirmModalOpen && selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#10141f] border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Confirm Sourcing Deal & Fee Assessment</span>
              </div>
              <button onClick={() => setIsConfirmModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-300 space-y-2 bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
              <div className="flex justify-between">
                <span className="text-gray-400">Deal:</span>
                <span className="font-semibold text-white">{selectedDeal.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Confirmed Value:</span>
                <span className="font-semibold text-white">₹{selectedDeal.confirmed_deal_value.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-white/[0.04] pt-2">
                <span className="text-gray-400">SupplyLens 5% Service Fee:</span>
                <span className="font-bold text-blue-400">₹{(selectedDeal.confirmed_deal_value * 0.05).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Applicable GST (18%):</span>
                <span className="font-medium text-gray-300">₹{(selectedDeal.confirmed_deal_value * 0.05 * 0.18).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-white border-t border-white/[0.04] pt-2">
                <span>Total Payable (Net 15):</span>
                <span className="text-emerald-400">₹{(selectedDeal.confirmed_deal_value * 0.05 * 1.18).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Contract / PO Reference</label>
                <input
                  type="text"
                  value={confirmRef}
                  onChange={(e) => setConfirmRef(e.target.value)}
                  placeholder="e.g., PO-2026-NXT-001"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Confirmation Notes (Optional)</label>
                <textarea
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  placeholder="e.g., Signed contract signed on Nov 3, delivery scheduled for Dec 15."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeal}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25"
              >
                Confirm & Issue Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAY FEE MODAL */}
      {isPayModalOpen && selectedDeal?.invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#10141f] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <CreditCard className="w-5 h-5" />
                <span>Settle 5% Success Fee</span>
              </div>
              <button onClick={() => setIsPayModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Invoice:</span>
                <span className="font-mono text-white">#{selectedDeal.invoice.invoice_number}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Deal:</span>
                <span className="text-white">{selectedDeal.title}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-white/[0.06] pt-2">
                <span className="text-white">Amount Due:</span>
                <span className="text-emerald-400">₹{selectedDeal.invoice.total_amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300">
              SupplyLens sandbox mock payment gateway is enabled for instant testing and automated reconciliation.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulatePayment}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/25 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Simulate Instant Settlement</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE MODAL */}
      {isDisputeModalOpen && selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#10141f] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Dispute Deal or Success Fee</span>
              </div>
              <button onClick={() => setIsDisputeModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              If the contract was cancelled, terms renegotiated, or supplier failed to meet specifications, enter the reason below. The fee will be held in review by SupplyLens commercial auditors.
            </p>

            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">Dispute Reason</label>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="State clearly why this transaction is disputed..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDisputeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDispute}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-500/25"
              >
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATTACH DOC MODAL */}
      {isAttachDocOpen && selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#10141f] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                <Upload className="w-5 h-5" />
                <span>Attach PO / Contract Proof</span>
              </div>
              <button onClick={() => setIsAttachDocOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0d14] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="purchase_order">Purchase Order (PO)</option>
                  <option value="contract">Signed Commercial Contract</option>
                  <option value="award_letter">Official Award Letter</option>
                  <option value="bank_proof">Bank Transfer Receipt</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">File Name</label>
                <input
                  type="text"
                  value={docFileName}
                  onChange={(e) => setDocFileName(e.target.value)}
                  placeholder="PO_Apex_Signed_2026.pdf"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">File URL or Storage Reference</label>
                <input
                  type="text"
                  value={docFileUrl}
                  onChange={(e) => setDocFileUrl(e.target.value)}
                  placeholder="/uploads/contracts/PO_Apex_Signed_2026.pdf"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsAttachDocOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAttachDoc}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Attach Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW DEAL MODAL */}
      {isNewDealOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleCreateDeal} className="bg-[#10141f] border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                <FileSpreadsheet className="w-5 h-5" />
                <span>Record New Sourcing Deal</span>
              </div>
              <button type="button" onClick={() => setIsNewDealOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Deal Title</label>
                <input
                  type="text"
                  required
                  value={newDealTitle}
                  onChange={(e) => setNewDealTitle(e.target.value)}
                  placeholder="e.g., Turnkey IoT PCB Assembly Batch 1"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Confirmed Value (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newDealValue}
                    onChange={(e) => setNewDealValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">PO / Contract Ref</label>
                  <input
                    type="text"
                    required
                    value={newDealContractRef}
                    onChange={(e) => setNewDealContractRef(e.target.value)}
                    placeholder="PO-2026-001"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNewDealOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25"
              >
                Create Deal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NEW TENDER MODAL */}
      {isNewTenderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleCreateTender} className="bg-[#10141f] border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                <FileSpreadsheet className="w-5 h-5" />
                <span>Publish Tender / RFQ</span>
              </div>
              <button type="button" onClick={() => setIsNewTenderOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Tender Title</label>
                <input
                  type="text"
                  required
                  value={newTenderTitle}
                  onChange={(e) => setNewTenderTitle(e.target.value)}
                  placeholder="e.g., Anodized Aluminum Enclosures - 2,500 Units"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={newTenderCategory}
                  onChange={(e) => setNewTenderCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newTenderQty}
                    onChange={(e) => setNewTenderQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newTenderBudget}
                    onChange={(e) => setNewTenderBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNewTenderOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25"
              >
                Publish Tender
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
