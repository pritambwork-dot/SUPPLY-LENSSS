"use client";

import React, { useState, useRef } from "react";
import {
  Compass,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  QrCode,
  FileText,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Copy,
  Check,
  ArrowLeft,
  Sparkles
} from "lucide-react";

export interface InvoiceLineItem {
  id: string;
  description: string;
  sac_hsn: string;
  qty: number;
  unit: string;
  unit_price: number;
  amount: number;
}

export interface TaxInvoiceData {
  invoice_number: string;
  issue_date: string;
  due_date: string;
  deal_reference: string;
  currency: "INR" | "USD";
  tax_type: "IGST" | "CGST_SGST" | "VAT";
  tax_rate_percent: number;
  payment_status: "PAID" | "PENDING_ESCROW" | "DUE";
  payment_method: string;
  payment_reference: string;
  
  // Issuer (SupplyLens)
  issuer: {
    name: string;
    legal_name: string;
    cin: string;
    gstin: string;
    pan: string;
    address: string;
    city_state_zip: string;
    country: string;
    email: string;
    phone: string;
    website: string;
  };

  // Bill To (Customer)
  customer: {
    name: string;
    company: string;
    designation: string;
    email: string;
    phone: string;
    address: string;
    city_state_zip: string;
    gstin_pan: string;
  };

  // Supplier / Factory Reference
  factory_partner: {
    name: string;
    location: string;
    audit_tier: string;
    po_reference: string;
  };

  line_items: InvoiceLineItem[];
  bank_details: {
    bank_name: string;
    account_name: string;
    account_number: string;
    ifsc_swift: string;
    branch: string;
    upi_vpa: string;
  };
  notes: string[];
}

export const defaultTaxInvoicePresets: Record<string, TaxInvoiceData> = {
  success_fee: {
    invoice_number: "SL-TAX-2026-08492",
    issue_date: "2026-11-03",
    due_date: "2026-11-18",
    deal_reference: "DEAL-UTKAL-2026-001",
    currency: "INR",
    tax_type: "CGST_SGST",
    tax_rate_percent: 18,
    payment_status: "PAID",
    payment_method: "Corporate UPI Instant Settlement",
    payment_reference: "UPI-SL984372911-TXN",
    issuer: {
      name: "SupplyLens Intelligence Inc.",
      legal_name: "SupplyLens Global Sourcing Technologies Pvt Ltd",
      cin: "U72900KA2026PTC184920",
      gstin: "29AAACS9823M1ZX",
      pan: "AAACS9823M",
      address: "Level 7, Tech Park Tower, Silicon Corridor",
      city_state_zip: "Bengaluru, Karnataka 560103",
      country: "India",
      email: "billing@supplylens.ai",
      phone: "+91 (80) 4128-9100",
      website: "https://supplylens.ai",
    },
    customer: {
      name: "Hossein",
      company: "Sustainable Packaging Labs Ltd",
      designation: "Lead Sourcing Director",
      email: "hossein@supplylens.ai",
      phone: "+91 98450 12891",
      address: "Plot 42, Eco Innovation Hub, Industrial Area",
      city_state_zip: "Mumbai, Maharashtra 400072",
      gstin_pan: "27AABCS4491K1Z2",
    },
    factory_partner: {
      name: "Utkal GreenFiber Pvt Ltd",
      location: "Bhubaneswar, Odisha, India",
      audit_tier: "10-D Tier 1 Audited",
      po_reference: "PO-UGF-2026-8812",
    },
    line_items: [
      {
        id: "li-1",
        description: "SupplyLens Sourcing Success Fee (5.0% on Confirmed Purchase Contract PO-UGF-2026-8812)",
        sac_hsn: "998311",
        qty: 1,
        unit: "Service",
        unit_price: 50000,
        amount: 50000,
      },
      {
        id: "li-2",
        description: "10-D Autonomous Supplier Verification & Factory Audit Dossier Filing",
        sac_hsn: "998313",
        qty: 1,
        unit: "Service",
        unit_price: 6500,
        amount: 6500,
      },
      {
        id: "li-3",
        description: "Commercial Sourcing Escrow Custody & Inspection Milestone Guarantee",
        sac_hsn: "997159",
        qty: 1,
        unit: "Contract",
        unit_price: 3500,
        amount: 3500,
      },
    ],
    bank_details: {
      bank_name: "HDFC Bank Ltd",
      account_name: "SupplyLens Global Sourcing Technologies Pvt Ltd - Escrow",
      account_number: "50200084920491",
      ifsc_swift: "HDFC0000128 / HDFCINBB",
      branch: "Koramangala 4th Block, Bengaluru",
      upi_vpa: "supplylens.settlement@hdfcbank",
    },
    notes: [
      "1. All commercial service fees are assessed under SAC Code 998311 (Management Consulting & Sourcing Services).",
      "2. This electronic tax invoice is generated pursuant to Section 31 of the Central Goods and Services Tax Act, 2017.",
      "3. Payment processed through SupplyLens Escrow Protection ensures 100% refund safety in case of quality dispute.",
      "4. Digital verification hash: SHA-256 e4d909c290d0fb1ca068ffaddf22cbd0fe9a3d463ef199",
    ],
  },
  landed_deal: {
    invoice_number: "SL-TAX-2026-09104",
    issue_date: "2026-11-02",
    due_date: "2026-11-17",
    deal_reference: "DEAL-KLING-2026-004",
    currency: "USD",
    tax_type: "VAT",
    tax_rate_percent: 5,
    payment_status: "PENDING_ESCROW",
    payment_method: "International SWIFT Wire Transfer",
    payment_reference: "SWIFT-REF-889104",
    issuer: {
      name: "SupplyLens Intelligence Inc.",
      legal_name: "SupplyLens Global Sourcing Technologies Inc.",
      cin: "US-DE-7492109",
      gstin: "EIN: 94-3829104",
      pan: "US-TAX-84920",
      address: "548 Market Street, Suite 48201",
      city_state_zip: "San Francisco, CA 94104",
      country: "United States",
      email: "finance@supplylens.ai",
      phone: "+1 (800) 582-7492",
      website: "https://supplylens.ai",
    },
    customer: {
      name: "Hossein",
      company: "Sustainable Packaging Labs Ltd",
      designation: "Lead Sourcing Director",
      email: "hossein@supplylens.ai",
      phone: "+1 (415) 890-2104",
      address: "100 Montgomery St, Financial District",
      city_state_zip: "San Francisco, CA 94104",
      gstin_pan: "US-EIN-92-491029",
    },
    factory_partner: {
      name: "Klingele Paper & Packaging SE",
      location: "Remshalden, Germany",
      audit_tier: "10-D Tier 1 Audited (ISO 9001/FSC)",
      po_reference: "PO-KLG-2026-0091",
    },
    line_items: [
      {
        id: "li-1",
        description: "SupplyLens Platform Sourcing Commission (5.0% on $142,500 Confirmed Sourcing Order)",
        sac_hsn: "998311",
        qty: 1,
        unit: "Contract",
        unit_price: 7125,
        amount: 7125,
      },
      {
        id: "li-2",
        description: "Customs & Harmonized Tariff Code (HS 4819.10) Regulatory Verification",
        sac_hsn: "999799",
        qty: 1,
        unit: "Filing",
        unit_price: 450,
        amount: 450,
      },
      {
        id: "li-3",
        description: "Cross-Border Escrow Multi-Currency Settlement & Compliance Warranty",
        sac_hsn: "997159",
        qty: 1,
        unit: "Guarantee",
        unit_price: 375,
        amount: 375,
      },
    ],
    bank_details: {
      bank_name: "JPMorgan Chase Bank, N.A.",
      account_name: "SupplyLens Global Sourcing Technologies Inc. - Client Escrow",
      account_number: "849201940129",
      ifsc_swift: "CHASUS33XXX",
      branch: "San Francisco Commercial Banking Branch",
      upi_vpa: "swift.wire@supplylens.chase",
    },
    notes: [
      "1. Wire remitted in US Dollars (USD). All intermediary bank charges to be borne by remitter.",
      "2. Commercial settlement covered under SupplyLens Irrevocable Escrow Security Agreement #SL-ESC-2026-99.",
      "3. Digital verification hash: SHA-256 c99e71f01da8812f8a44b93b21ad0808ef71c991209b",
    ],
  },
};

interface ProfessionalTaxInvoiceProps {
  initialPreset?: "success_fee" | "landed_deal";
  onBack?: () => void;
  isModal?: boolean;
}

export const ProfessionalTaxInvoice: React.FC<ProfessionalTaxInvoiceProps> = ({
  initialPreset = "success_fee",
  onBack,
  isModal = false,
}) => {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>(initialPreset);
  const [invoice, setInvoice] = useState<TaxInvoiceData>(
    defaultTaxInvoicePresets[initialPreset] || defaultTaxInvoicePresets.success_fee
  );
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Switch preset
  const handleSelectPreset = (key: string) => {
    setSelectedPresetKey(key);
    if (defaultTaxInvoicePresets[key]) {
      setInvoice(JSON.parse(JSON.stringify(defaultTaxInvoicePresets[key])));
    }
  };

  // Financial calculations
  const subtotal = invoice.line_items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxAmount = (subtotal * invoice.tax_rate_percent) / 100;
  const totalAmount = subtotal + taxAmount;

  const cgstAmount = invoice.tax_type === "CGST_SGST" ? taxAmount / 2 : 0;
  const sgstAmount = invoice.tax_type === "CGST_SGST" ? taxAmount / 2 : 0;
  const igstAmount = invoice.tax_type === "IGST" ? taxAmount : 0;

  const currencySymbol = invoice.currency === "INR" ? "₹" : "$";

  // Helper to format currency
  const formatMoney = (val: number) => {
    return `${currencySymbol} ${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Convert numbers to words (simplified for professional invoices)
  const numberToWords = (num: number, currency: "INR" | "USD") => {
    const rounded = Math.round(num);
    if (currency === "INR") {
      return `${rounded.toLocaleString("en-IN")} Indian Rupees Only`;
    }
    return `${rounded.toLocaleString("en-US")} US Dollars Only`;
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // Line item manipulation
  const handleAddLineItem = () => {
    const newItem: InvoiceLineItem = {
      id: `li-${Date.now()}`,
      description: "Custom Sourcing Service Fee",
      sac_hsn: "998311",
      qty: 1,
      unit: "Service",
      unit_price: 5000,
      amount: 5000,
    };
    setInvoice((prev) => ({
      ...prev,
      line_items: [...prev.line_items, newItem],
    }));
  };

  const handleRemoveLineItem = (index: number) => {
    setInvoice((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, idx) => idx !== index),
    }));
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
    setInvoice((prev) => {
      const updated = [...prev.line_items];
      const target = { ...updated[index], [field]: value };
      if (field === "qty" || field === "unit_price") {
        target.amount = (target.qty || 1) * (target.unit_price || 0);
      }
      updated[index] = target;
      return { ...prev, line_items: updated };
    });
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 antialiased font-sans text-slate-800">
      {/* =========================================================================
          CONTROL TOOLBAR (Hidden when Printing)
         ========================================================================= */}
      <div className="w-full max-w-4xl print:hidden flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          {/* Preset Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => handleSelectPreset("success_fee")}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedPresetKey === "success_fee"
                  ? "bg-white text-blue-600 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              5% Sourcing Success Fee (INR)
            </button>
            <button
              onClick={() => handleSelectPreset("landed_deal")}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedPresetKey === "landed_deal"
                  ? "bg-white text-blue-600 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              International Escrow PO (USD)
            </button>
          </div>

          {/* Editable Mode Toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
              isEditing
                ? "bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-400/20"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? "Exit Edit Mode" : "Edit Invoice Fields"}</span>
          </button>
        </div>

        {/* Action Buttons: Print & Copy Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all active:scale-95 shadow-2xs"
            title="Copy Public Invoice Link"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{isCopied ? "Link Copied!" : "Share"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-blue-500/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          OFFICIAL TAX INVOICE & BILL OF SUPPLY (PRINTABLE A4 CONTAINER)
         ========================================================================= */}
      <div
        id="official-tax-invoice"
        className="w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)] print:shadow-none print:border-none print:p-0 print:rounded-none relative overflow-hidden"
      >
        {/* Subtle Watermark in background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.025] -rotate-12">
          <span className="text-8xl sm:text-9xl font-black tracking-widest text-slate-900 uppercase">
            SUPPLYLENS
          </span>
        </div>

        {/* ---------------------------------------------------------------------
            HEADER SECTION: LOGO + COMPANY DETAILS + TAX INVOICE TITLE
           --------------------------------------------------------------------- */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200 relative z-10">
          {/* Logo & Corporate Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center">
                  <Compass className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">
                    SUPPLY<span className="text-blue-600">LENS</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-bold tracking-wider uppercase">
                    TAX INVOICE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide">
                  Autonomous Sourcing Intelligence & Enterprise Escrow
                </p>
              </div>
            </div>

            {/* Issuer Legal Entity & Registrations */}
            <div className="text-xs text-slate-600 space-y-0.5 pt-1">
              <strong className="text-slate-900 block font-semibold">
                {invoice.issuer.legal_name}
              </strong>
              <p>{invoice.issuer.address}</p>
              <p>{invoice.issuer.city_state_zip}, {invoice.issuer.country}</p>
              <div className="flex items-center gap-3 pt-1 font-mono text-[11px] text-slate-600 flex-wrap">
                <span><strong>CIN:</strong> {invoice.issuer.cin}</span>
                <span>•</span>
                <span><strong>GSTIN:</strong> {invoice.issuer.gstin}</span>
                <span>•</span>
                <span><strong>PAN:</strong> {invoice.issuer.pan}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Email: {invoice.issuer.email} | Web: {invoice.issuer.website}
              </p>
            </div>
          </div>

          {/* Invoice Identification Block */}
          <div className="sm:text-right space-y-2">
            <div className="flex sm:justify-end items-center gap-2">
              <div
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border inline-flex items-center gap-1.5 shadow-xs ${
                  invoice.payment_status === "PAID"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : invoice.payment_status === "PENDING_ESCROW"
                    ? "bg-blue-50 text-blue-700 border-blue-300"
                    : "bg-amber-50 text-amber-700 border-amber-300"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{invoice.payment_status === "PAID" ? "SETTLED & PAID" : invoice.payment_status}</span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                Tax Invoice
              </h1>
              <p className="text-[10px] font-mono text-slate-400">
                Official Bill of Supply & GST Tax Document
              </p>
            </div>

            <div className="space-y-1 font-mono text-xs pt-1">
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-slate-400 uppercase text-[10px] font-sans font-semibold">Invoice No:</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {invoice.invoice_number}
                </span>
              </div>
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-slate-400 uppercase text-[10px] font-sans font-semibold">Invoice Date:</span>
                <span className="text-slate-800 font-semibold">{invoice.issue_date}</span>
              </div>
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-slate-400 uppercase text-[10px] font-sans font-semibold">Due Date:</span>
                <span className="text-slate-800 font-semibold">{invoice.due_date}</span>
              </div>
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-slate-400 uppercase text-[10px] font-sans font-semibold">Deal Contract:</span>
                <span className="text-blue-600 font-bold">{invoice.deal_reference}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------------
            BILL TO & SOURCING FACTORY REFERENCE CARDS
           --------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-slate-200">
          {/* Billed To Customer */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Billed To (Client Consignee)
              </span>
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
            </div>

            <div className="text-xs space-y-0.5">
              <strong className="text-slate-900 block text-sm font-bold">
                {invoice.customer.company}
              </strong>
              <p className="font-semibold text-slate-700">
                Attn: {invoice.customer.name} ({invoice.customer.designation})
              </p>
              <p className="text-slate-600">{invoice.customer.address}</p>
              <p className="text-slate-600">{invoice.customer.city_state_zip}</p>
              <p className="font-mono text-[11px] text-slate-500 pt-1">
                <strong>GSTIN / Tax ID:</strong> {invoice.customer.gstin_pan}
              </p>
              <p className="text-slate-500 text-[11px]">
                Email: {invoice.customer.email} | Phone: {invoice.customer.phone}
              </p>
            </div>
          </div>

          {/* Verified Sourcing Origin / Factory Partner */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Verified Sourcing Factory Origin
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>

            <div className="text-xs space-y-1">
              <strong className="text-slate-900 block text-sm font-bold">
                {invoice.factory_partner.name}
              </strong>
              <p className="text-slate-600">{invoice.factory_partner.location}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                  {invoice.factory_partner.audit_tier}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  PO: {invoice.factory_partner.po_reference}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                Platform Escrow verified. Production batches sealed with 10-D physical audit pass.
              </p>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------------
            LINE ITEMS TABLE WITH SAC / HSN CODES
           --------------------------------------------------------------------- */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Taxable Services & Commercial Fee Schedule
            </h3>
            {isEditing && (
              <button
                onClick={handleAddLineItem}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Description of Sourcing Service</th>
                  <th className="py-2.5 px-3">SAC / HSN</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 text-right">Taxable Amount</th>
                  {isEditing && <th className="py-2.5 px-2 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.line_items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400 font-medium">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(idx, "description", e.target.value)}
                          className="w-full p-1 border border-slate-200 rounded text-xs"
                        />
                      ) : (
                        <span className="font-semibold text-slate-900 block leading-snug">
                          {item.description}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.sac_hsn}
                          onChange={(e) => handleUpdateItem(idx, "sac_hsn", e.target.value)}
                          className="w-20 p-1 border border-slate-200 rounded text-xs font-mono"
                        />
                      ) : (
                        item.sac_hsn
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-slate-700">
                      {isEditing ? (
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleUpdateItem(idx, "qty", parseFloat(e.target.value) || 1)}
                          className="w-14 p-1 border border-slate-200 rounded text-xs text-center font-mono"
                        />
                      ) : (
                        `${item.qty} ${item.unit}`
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {isEditing ? (
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => handleUpdateItem(idx, "unit_price", parseFloat(e.target.value) || 0)}
                          className="w-24 p-1 border border-slate-200 rounded text-xs text-right font-mono"
                        />
                      ) : (
                        formatMoney(item.unit_price)
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatMoney(item.amount)}
                    </td>

                    {isEditing && (
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => handleRemoveLineItem(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------------------------------------------------------------------
            SUMMARY BREAKDOWN: TAX COMPUTATION + GRAND TOTAL
           --------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-4 border-t border-slate-200">
          {/* Left Column: Words & Payment Evidence */}
          <div className="sm:col-span-7 space-y-4">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
                Total Invoice Value in Words
              </span>
              <p className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl capitalize font-mono">
                {numberToWords(totalAmount, invoice.currency)}
              </p>
            </div>

            {/* Bank Remittance Details Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs space-y-1.5 font-mono">
              <span className="font-sans font-bold text-slate-800 text-[11px] block uppercase tracking-wider">
                Remittance & Settlement Account
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-sans">Bank & Branch:</span>
                  <span className="font-semibold text-slate-800">{invoice.bank_details.bank_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-sans">Account No:</span>
                  <span className="font-semibold text-slate-800">{invoice.bank_details.account_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-sans">IFSC / SWIFT:</span>
                  <span className="font-semibold text-slate-800">{invoice.bank_details.ifsc_swift}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-sans">Corporate UPI VPA:</span>
                  <span className="font-semibold text-blue-600">{invoice.bank_details.upi_vpa}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Tax Calculations */}
          <div className="sm:col-span-5 flex flex-col justify-between gap-3">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Taxable Value):</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatMoney(subtotal)}
                </span>
              </div>

              {invoice.tax_type === "CGST_SGST" ? (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>Central GST (CGST @ 9%):</span>
                    <span className="font-mono text-slate-800">
                      {formatMoney(cgstAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>State GST (SGST @ 9%):</span>
                    <span className="font-mono text-slate-800">
                      {formatMoney(sgstAmount)}
                    </span>
                  </div>
                </>
              ) : invoice.tax_type === "IGST" ? (
                <div className="flex justify-between text-slate-600">
                  <span>Integrated GST (IGST @ 18%):</span>
                  <span className="font-mono text-slate-800">
                    {formatMoney(igstAmount)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between text-slate-600">
                  <span>International Sourcing VAT ({invoice.tax_rate_percent}%):</span>
                  <span className="font-mono text-slate-800">
                    {formatMoney(taxAmount)}
                  </span>
                </div>
              )}

              {/* Total Final Line */}
              <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-black text-slate-900 uppercase tracking-tight block">
                    Total Amount Due
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    (Inclusive of all taxes)
                  </span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-blue-600 font-mono tracking-tight">
                  {formatMoney(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------------
            FOOTER: TERMS & CONDITIONS + AUTHORIZED DIGITAL SEAL
           --------------------------------------------------------------------- */}
        <div className="pt-8 mt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
          {/* Notes & Legal Notices */}
          <div className="sm:col-span-8 space-y-1 text-[10px] text-slate-500 leading-relaxed">
            <strong className="text-slate-800 font-bold block mb-1">
              Terms & Legal Declarations:
            </strong>
            {invoice.notes.map((note, i) => (
              <p key={i}>{note}</p>
            ))}
          </div>

          {/* Digital Signature & Corporate Seal */}
          <div className="sm:col-span-4 flex flex-col items-center sm:items-end text-center sm:text-right space-y-2">
            <div className="w-32 h-16 border border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-2 relative select-none">
              <span className="text-[9px] font-mono text-slate-400">SUPPLYLENS VERIFIED</span>
              <div className="font-serif italic text-blue-700 font-bold text-sm tracking-wide">
                Pritam Biswas
              </div>
              <span className="text-[8px] text-emerald-600 font-bold tracking-widest uppercase">
                DIGITALLY SIGNED
              </span>
            </div>

            <div className="text-[10px] text-slate-600 leading-tight">
              <strong className="text-slate-900 block font-semibold">
                For {invoice.issuer.legal_name}
              </strong>
              <span>Authorized Signatory & Finance Controller</span>
            </div>
          </div>
        </div>

        {/* Bottom Micro Print Footer */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono">
          <span>Generated via SupplyLens Platform v2.4</span>
          <span>Original for Recipient • Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};
