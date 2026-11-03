"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ArrowRight,
  Package,
  Layers,
  Wrench,
  Truck,
  ShieldCheck,
  Info,
  Building2,
  AlertCircle,
} from "lucide-react";
import { BusinessRequirement, RequirementCategory, RequirementImportance, BusinessProfile } from "@/types";

interface RequirementsDecompositionProps {
  businessProfile: BusinessProfile | null;
  requirements: BusinessRequirement[];
  onAddRequirement: (req: Omit<BusinessRequirement, "id" | "matchedSuppliersCount">) => void;
  onRemoveRequirement: (id: string) => void;
  onEditRequirement: (id: string, updated: Partial<BusinessRequirement>) => void;
  onFindSuppliersForRequirement: (reqName: string) => void;
}

export const RequirementsDecomposition: React.FC<RequirementsDecompositionProps> = ({
  businessProfile,
  requirements,
  onAddRequirement,
  onRemoveRequirement,
  onEditRequirement,
  onFindSuppliersForRequirement,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<RequirementCategory>("Raw Materials");
  const [newImportance, setNewImportance] = useState<RequirementImportance>("required");
  const [newQty, setNewQty] = useState(5000);
  const [newUnit, setNewUnit] = useState("pieces");
  const [newExplanation, setNewExplanation] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editQty, setEditQty] = useState(0);
  const [editImportance, setEditImportance] = useState<RequirementImportance>("required");
  const [editExplanation, setEditExplanation] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const categories: RequirementCategory[] = [
    "Raw Materials",
    "Machinery & Equipment",
    "Packaging",
    "Logistics & Fulfillment",
    "Certifications & Compliance",
  ];

  const getCategoryIcon = (cat: RequirementCategory) => {
    switch (cat) {
      case "Raw Materials":
        return Layers;
      case "Machinery & Equipment":
        return Wrench;
      case "Packaging":
        return Package;
      case "Logistics & Fulfillment":
        return Truck;
      case "Certifications & Compliance":
        return ShieldCheck;
    }
  };

  const getImportanceBadge = (imp: RequirementImportance) => {
    switch (imp) {
      case "required":
        return {
          label: "Required",
          className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        };
      case "recommended":
        return {
          label: "Recommended",
          className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        };
      case "optional":
        return {
          label: "Optional",
          className: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400 border-slate-200/80 dark:border-white/10",
        };
    }
  };

  const handleStartEdit = (req: BusinessRequirement) => {
    setEditingId(req.id);
    setEditName(req.name);
    setEditQty(req.estimatedQty);
    setEditImportance(req.importance || "required");
    setEditExplanation(req.shortExplanation || "");
    setEditNotes(req.notes || "");
  };

  const handleSaveEdit = (id: string) => {
    onEditRequirement(id, {
      name: editName,
      estimatedQty: editQty,
      importance: editImportance,
      shortExplanation: editExplanation,
      notes: editNotes,
    });
    setEditingId(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddRequirement({
      name: newName.trim(),
      category: newCategory,
      estimatedQty: newQty,
      unit: newUnit,
      priority: newImportance === "required" ? "essential" : newImportance === "recommended" ? "recommended" : "optional",
      importance: newImportance,
      shortExplanation: newExplanation || "Custom business requirement input.",
      notes: newNotes,
    });
    setNewName("");
    setNewExplanation("");
    setNewNotes("");
    setIsAdding(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Business Understanding Snapshot Banner */}
      {businessProfile && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-white/10 dark:bg-[#1C1C1E] shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0071E3]/10 px-3 py-1 text-xs font-bold text-[#0071E3] dark:text-[#3894f8] border border-[#0071E3]/20">
                  <Sparkles className="h-3.5 w-3.5 text-[#0071E3]" />
                  <span>Business Snapshot</span>
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                  Model: {businessProfile.businessModel}
                </span>
                <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-300 border border-purple-500/20">
                  Stage: {businessProfile.businessStage.toUpperCase()}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                What you're building
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {businessProfile.businessSnapshot || businessProfile.idea}
              </p>
            </div>

            {/* Budget Intelligence Callout */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 lg:w-80 shrink-0 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 mb-1">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Budget Intelligence</span>
              </div>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                {businessProfile.budgetInsight}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Requirement Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            To get your business started, you’ll probably need:
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Dynamically deduced inputs. You can add, edit, or remove items to customize your sourcing list.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] px-4 py-2 text-xs font-semibold text-white shadow-xs active:scale-95 transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Requirement</span>
        </button>
      </div>

      {/* 3. Add Requirement Drawer */}
      {isAdding && (
        <form
          onSubmit={handleCreateSubmit}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-[#1C1C1E] animate-in slide-in-from-top-3 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Add Custom Requirement
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Item Name
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Bio-barrier coated paper bowls"
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs text-slate-900 focus:border-[#0071E3] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as RequirementCategory)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs text-slate-900 focus:border-[#0071E3] focus:outline-none dark:border-white/10 dark:bg-[#2C2C2E] dark:text-white transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Importance Level
              </label>
              <select
                value={newImportance}
                onChange={(e) => setNewImportance(e.target.value as RequirementImportance)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs text-slate-900 focus:border-[#0071E3] focus:outline-none dark:border-white/10 dark:bg-[#2C2C2E] dark:text-white transition-all"
              >
                <option value="required">Required (Cannot launch without)</option>
                <option value="recommended">Recommended (Phase 1 launch)</option>
                <option value="optional">Optional (Nice to have later)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Est. Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={newQty}
                  onChange={(e) => setNewQty(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs text-slate-900 focus:border-[#0071E3] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white transition-all"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs text-slate-900 focus:border-[#0071E3] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Short Explanation (Why this is needed)
            </label>
            <input
              type="text"
              value={newExplanation}
              onChange={(e) => setNewExplanation(e.target.value)}
              placeholder="e.g. Primary packaging for restaurant delivery to prevent sogginess..."
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs text-slate-900 focus:border-[#0071E3] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white transition-all"
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-full px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#0071E3] hover:bg-[#0077ED] px-5 py-2 text-xs font-semibold text-white shadow-xs active:scale-95 transition-all"
            >
              Save Requirement
            </button>
          </div>
        </form>
      )}

      {/* 4. Requirements Categorized Grouping */}
      <div className="space-y-6">
        {categories.map((category) => {
          const items = requirements.filter((r) => r.category === category);
          if (items.length === 0) return null;
          const CategoryIcon = getCategoryIcon(category);

          return (
            <div
              key={category}
              className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-white/10 dark:bg-[#1C1C1E]"
            >
              <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-white/10">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0071E3]/10 text-[#0071E3] dark:text-[#3894f8]">
                  <CategoryIcon className="h-4 w-4" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {category}
                </h4>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-400">
                  {items.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {items.map((item) => {
                  const isEditing = editingId === item.id;
                  const badge = getImportanceBadge(item.importance || "required");

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col justify-between"
                    >
                      {isEditing ? (
                        /* Editing View */
                        <div className="space-y-2.5">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded-xl border border-[#0071E3] bg-white p-2 text-xs text-slate-900 dark:bg-[#2C2C2E] dark:text-white"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              value={editQty}
                              onChange={(e) => setEditQty(parseInt(e.target.value) || 0)}
                              className="rounded-xl border border-[#0071E3] bg-white p-2 text-xs text-slate-900 dark:bg-[#2C2C2E] dark:text-white"
                            />
                            <select
                              value={editImportance}
                              onChange={(e) => setEditImportance(e.target.value as RequirementImportance)}
                              className="rounded-xl border border-[#0071E3] bg-white p-2 text-xs text-slate-900 dark:bg-[#2C2C2E] dark:text-white"
                            >
                              <option value="required">Required</option>
                              <option value="recommended">Recommended</option>
                              <option value="optional">Optional</option>
                            </select>
                          </div>
                          <input
                            type="text"
                            value={editExplanation}
                            onChange={(e) => setEditExplanation(e.target.value)}
                            placeholder="Explanation..."
                            className="w-full rounded-xl border border-[#0071E3] bg-white p-2 text-xs text-slate-900 dark:bg-[#2C2C2E] dark:text-white"
                          />
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              className="rounded-full bg-[#34C759] hover:bg-[#30B752] px-3.5 py-1 text-xs font-semibold text-white active:scale-95 flex items-center gap-1 shadow-2xs"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Standard Display View */
                        <>
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <h5 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                                {item.name}
                              </h5>
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${badge.className} shrink-0`}
                              >
                                {badge.label}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                              {item.shortExplanation || item.notes}
                            </p>

                            <div className="text-[11px] text-slate-400">
                              Estimated Quantity:{" "}
                              <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {item.estimatedQty.toLocaleString()} {item.unit}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-300 transition-colors"
                                title="Edit requirement"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => onRemoveRequirement(item.id)}
                                className="rounded-full p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                                title="Remove requirement"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => onFindSuppliersForRequirement(item.name)}
                              className="flex items-center gap-1 rounded-full bg-[#0071E3]/10 px-3.5 py-1.5 text-xs font-semibold text-[#0071E3] hover:bg-[#0071E3]/20 dark:text-[#3894f8] dark:hover:bg-[#0071E3]/25 transition-all active:scale-95"
                            >
                              <span>Find Suppliers</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
