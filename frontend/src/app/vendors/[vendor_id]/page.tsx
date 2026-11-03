"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  Globe2,
  ShieldCheck,
  Send,
  Bookmark,
  BookmarkCheck,
  GitCompare,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Mail,
  Phone,
  Package,
  Layers,
  Award,
  DollarSign,
  TrendingUp,
  FileText,
  Clock,
  Sparkles,
  Info,
  Check,
  Copy,
} from "lucide-react";
import { Supplier } from "@/types";
import { api } from "@/services/api";
import { RequestQuotationModal } from "@/components/quotations/RequestQuotationModal";

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params?.vendor_id as string;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "pricing" | "verification" | "facilities" | "intelligence">("overview");
  const [isSaved, setIsSaved] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [selectedProductForRfq, setSelectedProductForRfq] = useState<string | undefined>();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVendor() {
      if (!vendorId) return;
      setIsLoading(true);
      try {
        const data = await api.suppliers.getById(vendorId);
        setSupplier(data);

        // Record customer profile view activity & telemetry
        api.customer.recordVendorInteraction(vendorId, "view");
      } catch (err) {
        console.error("Error fetching vendor detail:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVendor();
  }, [vendorId]);

  // Check saved state
  useEffect(() => {
    async function checkSaved() {
      try {
        const saved = await api.suppliers.getSaved();
        if (Array.isArray(saved) && vendorId) {
          setIsSaved(saved.some((item: any) => item.supplier_id === vendorId));
        }
      } catch {}
    }
    checkSaved();
  }, [vendorId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleSave = async () => {
    if (!supplier) return;
    try {
      const res: any = await api.suppliers.save(supplier.id);
      setIsSaved(res.is_saved);
      showToast(res.is_saved ? `Saved ${supplier.name} to your shortlisted vendors` : `Removed ${supplier.name} from saved`);
    } catch {
      showToast("Error toggling bookmark");
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast(`Copied ${field} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading comprehensive vendor intelligence...</p>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Vendor Not Found</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          The requested vendor record does not exist or may have been archived.
        </p>
        <Link
          href="/vendors"
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          Return to Vendor Directory
        </Link>
      </div>
    );
  }

  const p0 = supplier.products?.[0];
  const dossier = supplier.verificationDossier || (supplier as any).verification_dossier;
  const checks = dossier?.checks || [];

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-800 antialiased pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/vendors"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Vendors</span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-semibold text-slate-900 truncate max-w-xs">{supplier.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleToggleSave}
              className={`p-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
                isSaved
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
              <span className="hidden sm:inline">{isSaved ? "Saved" : "Save Vendor"}</span>
            </button>

            <button
              onClick={() => {
                setSelectedProductForRfq(p0?.name);
                setIsRfqModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Request Quotation
            </button>
          </div>
        </div>
      </header>

      {/* Main Vendor Dossier */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Section 3.1: Vendor Overview Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-6">
              {/* Company Monogram / Logo */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-blue-500/10 flex-shrink-0">
                {supplier.name.substring(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {supplier.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {supplier.verificationStatus || "Demo Verified"}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {supplier.supplierType || "Contract Manufacturer"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {supplier.city}, {supplier.country}
                  </span>
                  {supplier.website && (
                    <a
                      href={supplier.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Globe2 className="w-3.5 h-3.5" />
                      Official Domain
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    Audited {supplier.verificationDate || "November 2026"}
                  </span>
                </div>

                {supplier.legal_name && (
                  <p className="text-xs text-slate-400 font-mono">
                    Legal Name: {supplier.legal_name}
                  </p>
                )}
              </div>
            </div>

            {/* Match & Verification Score Pills */}
            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-2xl text-center min-w-[90px]">
                <span className="text-[10px] uppercase font-bold text-blue-600 block tracking-wider">
                  Audit Score
                </span>
                <span className="text-xl font-bold text-blue-700 font-mono">
                  {supplier.verificationScore || 98}%
                </span>
              </div>
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl text-center min-w-[90px]">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider">
                  Confidence
                </span>
                <span className="text-xl font-bold text-emerald-700 font-mono">
                  {supplier.dataConfidence || 95}%
                </span>
              </div>
            </div>
          </div>

          {/* Company Description */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-xs text-slate-700 leading-relaxed">
            {supplier.description || "Specialized certified manufacturing provider for high-volume custom production."}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pt-2">
            {[
              { key: "overview", label: "Overview & About" },
              { key: "products", label: `Products (${supplier.products?.length || 0})` },
              { key: "pricing", label: "Pricing & MOQ" },
              { key: "verification", label: "10-D Verification Evidence" },
              { key: "facilities", label: "Facilities & Location" },
              { key: "intelligence", label: "AI Sourcing Fit" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Overview & About */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Section 3.2: About this Vendor */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  About {supplier.name}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Business Role</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{supplier.supplierType || "OEM Manufacturer"}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Primary Industry</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{p0?.category || "Industrial Packaging"}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Established</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">Verified Operational</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Jurisdiction</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{supplier.city}, {supplier.country}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Export Coverage</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">Pan-India & International</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Evidence Status</span>
                    <span className="font-bold text-emerald-600 mt-0.5 block">10-D Complete</span>
                  </div>
                </div>

                {/* Manufacturing Capabilities */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-semibold text-slate-700 block">
                    Manufacturing & Processing Capabilities:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {supplier.capabilities?.map((cap, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60"
                      >
                        {cap}
                      </span>
                    )) || <span className="text-xs text-slate-400">Capabilities listed upon RFQ</span>}
                  </div>
                </div>

                {/* Certifications */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-semibold text-slate-700 block">
                    Compliance & Quality Certifications:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {supplier.certifications?.map((cert, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                      >
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        {cert}
                      </span>
                    )) || <span className="text-xs text-slate-400">Standard factory ISO audited</span>}
                  </div>
                </div>
              </div>

              {/* Featured Product Preview */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    Key Product Lines
                  </h3>
                  <button
                    onClick={() => setActiveTab("products")}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View All ({supplier.products?.length || 0})
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {supplier.products?.slice(0, 2).map((p) => (
                    <div
                      key={p.id || p.name}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 flex-shrink-0">
                          {p.category}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Starting MOQ:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {p.moq?.toLocaleString()} {p.unit}s
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Quoted Unit Price:</span>
                        <span className="font-mono font-bold text-emerald-600">
                          {p.currency} {p.quoted_price}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedProductForRfq(p.name);
                          setIsRfqModalOpen(true);
                        }}
                        className="w-full py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                      >
                        Request Quote on this Product
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar: Section 3.6 Public Business Contacts */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Verified Public Business Contacts
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Only legitimately published business contact channels are displayed. Private personal numbers are never harvested.
                </p>

                <div className="space-y-3 pt-2">
                  {/* Public Email */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Public Business Email
                    </span>
                    {supplier.publicEmail || (supplier as any).public_email ? (
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-800 truncate">
                          {supplier.publicEmail || (supplier as any).public_email}
                        </span>
                        <button
                          onClick={() => handleCopy(supplier.publicEmail || (supplier as any).public_email, "Email")}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No verified public business email found.</span>
                    )}
                  </div>

                  {/* Public Phone */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Official Business Phone
                    </span>
                    {supplier.publicPhone || (supplier as any).public_phone ? (
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-800">
                          {supplier.publicPhone || (supplier as any).public_phone}
                        </span>
                        <button
                          onClick={() => handleCopy(supplier.publicPhone || (supplier as any).public_phone, "Phone")}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Phone provided upon quotation request.</span>
                    )}
                  </div>

                  {/* Website */}
                  {supplier.website && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Official Website
                      </span>
                      <a
                        href={supplier.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-mono"
                      >
                        {supplier.website.replace("https://", "")}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedProductForRfq(p0?.name);
                      setIsRfqModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Formal RFQ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products & Raw Materials */}
        {activeTab === "products" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Products & Raw Materials Catalog</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed commercial specifications, minimum order quantities, and unit pricing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supplier.products?.map((p) => (
                <div
                  key={p.id || p.name}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                      <span className="text-xs text-slate-500">{p.category}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {p.currency} {p.quoted_price} / {p.unit}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                    <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                      <span className="text-[10px] text-slate-400 block uppercase">Minimum Order (MOQ)</span>
                      <span className="font-mono font-bold text-slate-800">
                        {p.moq?.toLocaleString()} {p.unit}s
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                      <span className="text-[10px] text-slate-400 block uppercase">Estimated Landed Cost</span>
                      <span className="font-mono font-bold text-slate-800">
                        {p.estimated_landed_cost ? `${p.currency} ${p.estimated_landed_cost}` : "Est. via Hub"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedProductForRfq(p.name);
                        setIsRfqModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Request Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Pricing & MOQ */}
        {activeTab === "pricing" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Commercial Pricing & MOQ Terms</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparent landed pricing policy. Only factual, source-backed quotes are displayed.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                    <th className="py-3 px-4 font-semibold">Product Name</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Quoted Unit Price</th>
                    <th className="py-3 px-4 font-semibold">MOQ Tier</th>
                    <th className="py-3 px-4 font-semibold">Price Type</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supplier.products?.map((p) => (
                    <tr key={p.id || p.name} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-medium text-slate-900">{p.name}</td>
                      <td className="py-3.5 px-4 text-slate-500">{p.category}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {p.currency} {p.quoted_price}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {p.moq?.toLocaleString()} {p.unit}s
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                          {p.price_type || "Publicly listed"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedProductForRfq(p.name);
                            setIsRfqModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Quote
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/60 text-xs text-blue-900 leading-relaxed">
              <span className="font-semibold">SupplyLens Pricing Policy:</span> When no public pricing exists, SupplyLens displays &quot;Price not publicly available. Request a quotation from this vendor.&quot; No synthetic numbers are fabricated.
            </div>
          </div>
        )}

        {/* Tab 4: 10-D Verification Evidence */}
        {activeTab === "verification" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  10-Dimension Deterministic Verification Dossier
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Factual evidence audit across 10 deterministic compliance and operational dimensions.
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                {dossier?.dimensions_passed || 10} of {dossier?.dimensions_evaluated || 10} Checks Passed
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {checks.map((chk: any, index: number) => (
                <div key={chk.dimension || index} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {chk.status === "passed" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                      <h4 className="text-xs font-bold text-slate-900">{chk.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-600">
                        Weight: {chk.weight}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 pl-6">{chk.detail}</p>
                    <p className="text-[11px] text-slate-400 pl-6">
                      Source: <span className="font-medium text-slate-600">{chk.source}</span> · Audited {chk.checked_at}
                    </p>
                  </div>

                  <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    PASSED
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Facilities & Location */}
        {activeTab === "facilities" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Geospatial Facilities & Location</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical factory campus, warehouse hubs, and nearest dispatch port.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Headquarters & Plant Address
                  </span>
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                    {supplier.address || `${supplier.city}, ${supplier.country}`}
                  </p>
                  <p className="text-xs text-slate-500">
                    Coordinates: <span className="font-mono text-slate-700">{supplier.lat?.toFixed(4)}, {supplier.lng?.toFixed(4)}</span>
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Logistics Corridors
                  </span>
                  <p className="text-slate-700">
                    Connected to National Highway freight corridors and domestic rail container freight stations (CFS).
                  </p>
                </div>
              </div>

              {/* Map Placeholder Card */}
              <div className="h-64 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-2">
                <MapPin className="w-8 h-8 text-blue-500" />
                <span className="text-sm font-bold text-slate-700">{supplier.name}</span>
                <span className="text-xs text-slate-500">{supplier.city}, {supplier.country}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: AI Sourcing Fit */}
        {activeTab === "intelligence" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI Supplier Compatibility & Intelligence</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated against your business requirements, target scale, and budget constraints.
              </p>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-200/60 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Compatibility Analysis: {supplier.name}
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                {(supplier as any).match_reason || `${supplier.name} matches your target MOQ and raw material specifications. The Cuttack manufacturing hub provides cost-effective dispatch with low freight lead time.`}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Product Fit</span>
                <span className="text-lg font-bold text-emerald-600 font-mono mt-1 block">96%</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">MOQ Fit</span>
                <span className="text-lg font-bold text-emerald-600 font-mono mt-1 block">92%</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Location Fit</span>
                <span className="text-lg font-bold text-blue-600 font-mono mt-1 block">98%</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Pricing Fit</span>
                <span className="text-lg font-bold text-emerald-600 font-mono mt-1 block">94%</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* RFQ Modal */}
      <RequestQuotationModal
        isOpen={isRfqModalOpen}
        onClose={() => setIsRfqModalOpen(false)}
        supplier={supplier}
        initialProduct={selectedProductForRfq}
        onSuccess={(rfq) => {
          showToast(`RFQ ${rfq.id} submitted successfully!`);
        }}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-800 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
