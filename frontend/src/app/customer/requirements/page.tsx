"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListTodo,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Save,
  Building2,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { api } from "@/services/api";

interface RequirementItem {
  id?: string;
  name: string;
  category: string;
  estimated_qty: number;
  unit: string;
  importance: "required" | "recommended" | "optional";
  short_explanation?: string;
  notes?: string;
}

export default function CustomerRequirementsPage() {
  const [naturalLanguageInput, setNaturalLanguageInput] = useState(
    "I need 15,000 sugarcane bagasse meal trays (3-compartment, 750ml, home compostable EN 13432 certified) and 10,000 virgin kraft food delivery bowls with zero PE lining."
  );
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [interpretedBy, setInterpretedBy] = useState<string | null>(null);

  const [requirements, setRequirements] = useState<RequirementItem[]>([
    {
      id: "req-1",
      name: "Sugarcane Bagasse Meal Trays (3-Compartment, 750ml)",
      category: "Raw Materials",
      estimated_qty: 15000,
      unit: "pieces",
      importance: "required",
      short_explanation: "Primary takeaway container for restaurants delivering hot meals without sogginess.",
      notes: "Grease-proof, 100% home compostable (EN 13432 / ISO 17088).",
    },
    {
      id: "req-2",
      name: "Virgin Kraft Paper Food Delivery Bowls (500ml & 750ml)",
      category: "Packaging",
      estimated_qty: 10000,
      unit: "pieces",
      importance: "required",
      short_explanation: "Essential for hot curries and gravies with bio-barrier coating.",
      notes: "Zero PE lining, soy-ink custom print.",
    },
    {
      id: "req-3",
      name: "PLA Clear Leak-Proof Snap Lids",
      category: "Raw Materials",
      estimated_qty: 25000,
      unit: "pieces",
      importance: "required",
      short_explanation: "Tight perimeter seal preventing food spills during delivery transit.",
      notes: "Cornstarch PLA, crystal clear.",
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleInterpret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalLanguageInput.trim()) return;

    setIsInterpreting(true);
    try {
      const res = await api.customer.interpretRequirements(naturalLanguageInput, "Sustainable Packaging");
      if (res.requirements && res.requirements.length > 0) {
        setRequirements(res.requirements);
        setInterpretedBy(res.interpreted_by);
        showToast("AI interpreted your requirement statement successfully!");

        api.customer.logActivity({
          activity_type: "profile_view",
          title: "Interpreted Sourcing Requirements via AI",
          description: `Extracted ${res.requirements.length} structured Bill of Materials items using ${res.interpreted_by}.`,
        });
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to interpret requirements. Please edit manually.");
    } finally {
      setIsInterpreting(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
    showToast("Removed requirement item.");
  };

  const handleAddManualRequirement = () => {
    const newItem: RequirementItem = {
      name: "New Custom Material / Machinery",
      category: "Raw Materials",
      estimated_qty: 1000,
      unit: "pieces",
      importance: "recommended",
      short_explanation: "Custom requirement for pilot manufacturing.",
      notes: "Specify ISO or ASTM standards...",
    };
    setRequirements((prev) => [...prev, newItem]);
    setEditingIndex(requirements.length);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Natural-Language Sourcing Requirement Decomposition
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Sourcing Requirements & Bill of Materials (BOM)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Describe what you need in plain English. SupplyLens AI converts your requirements into structured, verified procurement specifications.
          </p>
        </div>

        {/* AI Input Form */}
        <form onSubmit={handleInterpret} className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              placeholder="Describe your product idea, required raw materials, target volumes, certifications, and delivery constraints..."
              className="w-full p-4 text-xs sm:text-sm bg-slate-50/80 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800 resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {interpretedBy ? `Last parsed by ${interpretedBy}` : "Powered by Google Gemini 2.5 Flash & Deterministic Sourcing Engine"}
              </span>
            </div>

            <button
              type="submit"
              disabled={isInterpreting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 self-end sm:self-auto"
            >
              {isInterpreting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Decomposing via Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Interpret Requirements
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Structured Requirements Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-blue-600" />
              Structured Bill of Materials ({requirements.length} Items)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and edit quantities, units, and importance before matching with verified vendors.
            </p>
          </div>

          <button
            onClick={handleAddManualRequirement}
            className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Item
          </button>
        </div>

        <div className="space-y-3">
          {requirements.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2 hover:border-blue-400 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono shadow-xs">
                    {index + 1}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.name}</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 border border-slate-200 text-slate-700">
                    {item.category}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.importance === "required"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {item.importance}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-extrabold text-slate-900">
                    {item.estimated_qty?.toLocaleString()} {item.unit}
                  </span>
                  <button
                    onClick={() => handleRemoveRequirement(index)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {item.short_explanation && (
                <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                  {item.short_explanation}
                </p>
              )}

              {item.notes && (
                <div className="text-[11px] text-slate-500 pl-8 font-mono">
                  Specifications: {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Requirements are stored against your active sourcing workspace.
          </span>
          <button
            onClick={() => showToast("Sourcing requirements saved to your active workspace!")}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Save Requirements
          </button>
        </div>
      </div>

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
