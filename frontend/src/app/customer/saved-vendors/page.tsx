"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Building2,
  MapPin,
  Trash2,
  Send,
  GitCompare,
  ExternalLink,
  ShieldCheck,
  Package,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Supplier, SavedSupplierItem } from "@/types";
import { api } from "@/services/api";
import { RequestQuotationModal } from "@/components/quotations/RequestQuotationModal";

export default function CustomerSavedVendorsPage() {
  const router = useRouter();
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSupplierForRfq, setSelectedSupplierForRfq] = useState<Supplier | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [savedList, allSuppliers] = await Promise.all([
          api.suppliers.getSaved(),
          api.suppliers.list(),
        ]);
        setSavedItems(Array.isArray(savedList) ? savedList : []);
        setSuppliers(allSuppliers);
      } catch (err) {
        console.error("Error loading saved vendors:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRemove = async (supplierId: string, name: string) => {
    try {
      await api.suppliers.save(supplierId);
      setSavedItems((prev) => prev.filter((item) => (item.supplier_id || item.supplierId) !== supplierId));
      showToast(`Removed ${name} from your saved vendors.`);
    } catch {
      showToast("Error removing saved vendor.");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading your saved vendors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              <Bookmark className="w-3.5 h-3.5" />
              Customer Shortlists
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Saved Vendors ({savedItems.length})
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Your private shortlisted suppliers, factory facilities, and verified manufacturing partners.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/customer/comparisons"
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200/70 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <GitCompare className="w-3.5 h-3.5" />
              Compare Shortlist
            </Link>
            <Link
              href="/vendors"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              Browse More
            </Link>
          </div>
        </div>
      </div>

      {/* Saved Vendors List */}
      {savedItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Saved Vendors Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Explore verified manufacturers in the Vendor Directory and click the bookmark icon to save them to your private workspace.
          </p>
          <Link
            href="/vendors"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Explore Vendors Directory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedItems.map((item) => {
            const supplierId = item.supplier_id || item.supplierId;
            const supplierName = item.supplier_name || item.supplierName || "Verified Supplier";
            const fullSupplier = suppliers.find((s) => s.id === supplierId);

            return (
              <div
                key={item.id || supplierId}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-base flex-shrink-0">
                        {supplierName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          href={`/vendors/${supplierId}`}
                          className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors block leading-snug"
                        >
                          {supplierName}
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{item.city || fullSupplier?.city}, {item.country || fullSupplier?.country}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(supplierId, supplierName)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      10-D Verified
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 text-[11px]">
                      Saved {item.saved_at || "Recently"}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Product Line</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[140px] block">
                        {item.product_name || fullSupplier?.products?.[0]?.name || "Standard Catalog"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Quoted Price</span>
                      <span className="font-mono font-bold text-slate-800">
                        {item.current_price ? `${item.currency || "INR"} ${item.current_price}` : "Quote on Request"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/vendors/${supplierId}`}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
                  >
                    View Details
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>

                  <button
                    onClick={() => {
                      if (fullSupplier) {
                        setSelectedSupplierForRfq(fullSupplier);
                      } else {
                        router.push(`/vendors/${supplierId}`);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    Request Quote
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RFQ Modal */}
      <RequestQuotationModal
        isOpen={Boolean(selectedSupplierForRfq)}
        onClose={() => setSelectedSupplierForRfq(null)}
        supplier={selectedSupplierForRfq}
        onSuccess={(rfq) => {
          showToast(`RFQ ${rfq?.id || 'Request'} created successfully!`);
        }}
      />
    </div>
  );
}
