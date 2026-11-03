"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Building2, Package, Calendar, MapPin, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Supplier } from "@/types";
import { api } from "@/services/api";

interface RequestQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  initialProduct?: string;
  onSuccess?: (rfq: any) => void;
}

export const RequestQuotationModal: React.FC<RequestQuotationModalProps> = ({
  isOpen,
  onClose,
  supplier,
  initialProduct,
  onSuccess,
}) => {
  const [productName, setProductName] = useState(initialProduct || (supplier?.products?.[0]?.name ?? "Eco Molded Containers"));
  const [productCategory, setProductCategory] = useState(supplier?.products?.[0]?.category ?? "Sustainable Packaging");
  const [quantity, setQuantity] = useState<number>(supplier?.products?.[0]?.moq ?? 5000);
  const [unit, setUnit] = useState(supplier?.products?.[0]?.unit ?? "piece");
  const [targetBudget, setTargetBudget] = useState<number>(50000);
  const [currency, setCurrency] = useState("INR");
  const [specifications, setSpecifications] = useState("");
  const [deliveryTerms, setDeliveryTerms] = useState("FOB Factory");
  const [destinationCity, setDestinationCity] = useState("Bhubaneswar");
  const [destinationCountry, setDestinationCountry] = useState("India");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRfq, setSubmittedRfq] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (supplier) {
      if (initialProduct) {
        setProductName(initialProduct);
        const match = supplier.products?.find((p) => p.name === initialProduct);
        if (match) {
          setProductCategory(match.category);
          setQuantity(match.moq || 5000);
          setUnit(match.unit || "piece");
        }
      } else if (supplier.products && supplier.products.length > 0) {
        setProductName(supplier.products[0].name);
        setProductCategory(supplier.products[0].category);
        setQuantity(supplier.products[0].moq || 5000);
        setUnit(supplier.products[0].unit || "piece");
      }
    }
  }, [supplier, initialProduct]);

  if (!isOpen || !supplier) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        business_id: "biz-001",
        user_id: "hossein-001",
        supplier_id: supplier.id,
        product_name: productName,
        product_category: productCategory,
        required_quantity: Number(quantity),
        unit: unit,
        target_budget: targetBudget ? Number(targetBudget) : undefined,
        currency: currency,
        specifications: specifications || "Standard factory grade specifications with certified food-contact compliance.",
        delivery_terms: deliveryTerms,
        destination_city: destinationCity,
        destination_country: destinationCountry,
        required_certifications: supplier.certifications || ["ISO 9001:2015"],
      };

      const res = await api.customer.createQuotation(payload);
      setSubmittedRfq(res.quotation);
      if (onSuccess) {
        onSuccess(res.quotation);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to submit quotation request. Please check inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedRfq(null);
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Request Quotation (RFQ)</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Target Vendor: <span className="font-medium text-slate-700">{supplier.name}</span> · {supplier.city}, {supplier.country}
                </p>
              </div>
            </div>
            <button
              onClick={handleResetAndClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {submittedRfq ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Quotation Request Submitted</h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Your formal Request for Quotation (RFQ ID: <span className="font-mono font-medium text-blue-600">{submittedRfq.id}</span>) has been recorded in the SupplyLens quotation registry and routed to {supplier.name}&apos;s verified business desk.
                </p>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs space-y-1.5 max-w-md mx-auto text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Product:</span>
                    <span className="font-medium text-slate-800">{submittedRfq.product_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Required Quantity:</span>
                    <span className="font-medium text-slate-800">{submittedRfq.required_quantity?.toLocaleString()} {submittedRfq.unit}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivery Terms:</span>
                    <span className="font-medium text-slate-800">{submittedRfq.delivery_terms} ({submittedRfq.destination_city})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      SUBMITTED · AWAITING VENDOR
                    </span>
                  </div>
                </div>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={handleResetAndClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Done
                  </button>
                  <a
                    href="/customer/quotations"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                  >
                    Track in Quotations Hub
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                    {error}
                  </div>
                )}

                {/* Sourcing Notice */}
                <div className="p-3.5 bg-blue-50/70 border border-blue-200/70 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900 leading-relaxed">
                    <span className="font-semibold">Direct Vendor Transmission:</span> SupplyLens routes your commercial RFQ directly to {supplier.name}&apos;s verified export and sales departments. Zero broker fees apply for quote discovery.
                  </div>
                </div>

                {/* Product Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Target Product or Material *
                    </label>
                    {supplier.products && supplier.products.length > 0 ? (
                      <select
                        value={productName}
                        onChange={(e) => {
                          setProductName(e.target.value);
                          const matched = supplier.products?.find((p) => p.name === e.target.value);
                          if (matched) {
                            setProductCategory(matched.category);
                            setQuantity(matched.moq || 5000);
                            setUnit(matched.unit || "piece");
                          }
                        }}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                      >
                        {supplier.products.map((p) => (
                          <option key={p.id || p.name} value={p.name}>
                            {p.name} (MOQ: {p.moq?.toLocaleString() || "1,000"} {p.unit || "pcs"})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Product Category
                    </label>
                    <input
                      type="text"
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                    />
                  </div>
                </div>

                {/* Quantity and Unit */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Required Quantity *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        required
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-mono"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium uppercase">
                        {unit}s
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Unit of Measure
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                    >
                      <option value="piece">pieces</option>
                      <option value="meter">meters</option>
                      <option value="kg">kg</option>
                      <option value="box">boxes</option>
                      <option value="roll">rolls</option>
                      <option value="metric_ton">metric tons</option>
                    </select>
                  </div>
                </div>

                {/* Target Budget & Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Estimated Target Budget (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-medium">
                        {currency}
                      </span>
                      <input
                        type="number"
                        value={targetBudget}
                        onChange={(e) => setTargetBudget(Number(e.target.value))}
                        className="w-full pl-12 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Incoterms / Delivery Terms
                    </label>
                    <select
                      value={deliveryTerms}
                      onChange={(e) => setDeliveryTerms(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                    >
                      <option value="FOB Factory">FOB (Free On Board Factory)</option>
                      <option value="CIF Port">CIF (Cost, Insurance & Freight to Port)</option>
                      <option value="DAP Door">DAP (Delivered at Place / Warehouse)</option>
                      <option value="EXW Ex-Works">EXW (Ex-Works / Buyer Arranges Pickup)</option>
                    </select>
                  </div>
                </div>

                {/* Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Destination City
                    </label>
                    <input
                      type="text"
                      value={destinationCity}
                      onChange={(e) => setDestinationCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Destination Country
                    </label>
                    <input
                      type="text"
                      value={destinationCountry}
                      onChange={(e) => setDestinationCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Technical Specifications */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Technical Specifications & Quality Requirements
                  </label>
                  <textarea
                    rows={3}
                    value={specifications}
                    onChange={(e) => setSpecifications(e.target.value)}
                    placeholder="Specify dimensions, material grades (e.g. virgin bagasse, 350 GSM kraft), certified standards, custom printing/embossing, or packaging requirements..."
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-slate-800"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting RFQ...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Quotation Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
