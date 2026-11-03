"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Save,
  Globe2,
  Mail,
  MapPin,
  DollarSign,
  TrendingUp,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  LogOut,
  Lock,
  Phone,
  Briefcase
} from "lucide-react";
import { api } from "@/services/api";
import { authService, AuthUser } from "@/lib/auth";

export default function CustomerBusinessProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "EcoPack Solutions",
    business_idea: "Eco-friendly sugarcane bagasse food containers and biodegradable meal trays for fast-casual restaurants.",
    sector: "Sustainable Packaging",
    business_stage: "launching",
    country: "India",
    city: "Bhubaneswar",
    website: "https://ecopack-solutions.example.com",
    email: "procurement@ecopack.example.com",
    target_customer: "Quick service restaurants, cloud kitchens, and institutional caterers",
    budget_amount: 800000,
    budget_currency: "INR",
    business_model: "contract_oem",
    product_categories: "Molded Fiber, Paperboard Trays, PLA Lids",
    sourcing_priorities: "Lowest Landed Cost, Compostable Certifications (ISO 17088), Fast Lead Time",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const user = await authService.getSessionUser();
        setCurrentUser(user || {
          id: "usr-demo-001",
          email: "hossein@supplylens.ai",
          name: "Hossein",
          role: "Lead Sourcing Director",
          onboarding_status: "completed",
          active_step: 6,
        });

        const p: any = await api.business.getProfile("biz-001");
        if (p) {
          setFormData((prev) => ({
            ...prev,
            business_name: p.business_name || prev.business_name,
            business_idea: p.business_idea || prev.business_idea,
            sector: p.sector || prev.sector,
            business_stage: p.business_stage || prev.business_stage,
            country: p.country || prev.country,
            city: p.city || prev.city,
            website: p.website || prev.website,
            email: p.email || prev.email,
            target_customer: p.target_customer || prev.target_customer,
            budget_amount: p.budget_amount || prev.budget_amount,
            budget_currency: p.budget_currency || prev.budget_currency,
            business_model: p.business_model || prev.business_model,
          }));
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authService.signOut();
      router.push("/login");
    } catch {
      setIsSigningOut(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "budget_amount" ? Number(value) : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.business.saveProfile({
        business_id: "biz-001",
        ...formData,
      });

      api.customer.logActivity({
        activity_type: "profile_view",
        title: "Updated Business Profile",
        description: `Saved business parameters for ${formData.business_name}.`,
      });

      setToastMessage("Business profile saved successfully!");
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      setToastMessage("Error saving business profile. Please try again.");
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading business profile...</p>
      </div>
    );
  }

  const activeUser = currentUser || {
    id: "usr-demo-001",
    email: "hossein@supplylens.ai",
    name: "Hossein",
    role: "Lead Sourcing Director",
    onboarding_status: "completed" as const,
    active_step: 6,
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          USER PROFILE & SOURCING OPERATOR CARD (With Prominent Sign Out Option)
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-md">
              {activeUser.name.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{activeUser.name}</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                Tier 1 Verified
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                {activeUser.role}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
              <div className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{activeUser.email}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Bhubaneswar, India</span>
              </div>
              <span>•</span>
              <span className="font-mono text-slate-400 text-[11px]">ID: {activeUser.id}</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Sign Out Button */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Session</span>
          </div>

          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100/90 text-red-600 hover:text-red-700 border border-red-200 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Sign out of SupplyLens"
          >
            <LogOut className="w-4 h-4" />
            <span>{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ENTERPRISE BUSINESS ARCHITECTURE & SOURCING PROFILE
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" />
            Business Architecture & Sourcing Profile
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Customer Business Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your company details, target markets, operational scale, and procurement constraints used by the AI matching engine.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Identity & Concept */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Business / Brand Name *
              </label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Industry Sector *
              </label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800"
              >
                <option value="Sustainable Packaging">Sustainable Packaging</option>
                <option value="Apparel & Textiles">Apparel & Textiles</option>
                <option value="Furniture & Home Furnishings">Furniture & Home Furnishings</option>
                <option value="Consumer Electronics">Consumer Electronics</option>
                <option value="Food & Beverages">Food & Beverages</option>
                <option value="Beauty & Personal Care">Beauty & Personal Care</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Business Concept & Product Description *
            </label>
            <textarea
              name="business_idea"
              rows={3}
              value={formData.business_idea}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800 resize-none"
            />
          </div>

          {/* Operational Stage & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Business Stage
              </label>
              <select
                name="business_stage"
                value={formData.business_stage}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800"
              >
                <option value="idea">Idea / Concept</option>
                <option value="testing">Testing / Prototyping</option>
                <option value="launching">Launching Pilot Production</option>
                <option value="growing">Scaling & Growth</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sourcing Model
              </label>
              <select
                name="business_model"
                value={formData.business_model}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800"
              >
                <option value="contract_oem">Contract OEM Manufacturing</option>
                <option value="buy_resell">Wholesale Distribution</option>
                <option value="raw_materials">Raw Material Procurement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Market
              </label>
              <input
                type="text"
                name="target_customer"
                value={formData.target_customer}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800"
              />
            </div>
          </div>

          {/* Location & Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Headquarters City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Business Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Procurement Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800 font-mono text-xs"
              />
            </div>
          </div>

          {/* Budget Constraint */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Initial Sourcing Budget Amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-medium">
                  {formData.budget_currency}
                </span>
                <input
                  type="number"
                  name="budget_amount"
                  value={formData.budget_amount}
                  onChange={handleChange}
                  className="w-full pl-12 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Budget Currency
              </label>
              <select
                name="budget_currency"
                value={formData.budget_currency}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800"
              >
                <option value="INR">INR (₹ Indian Rupee)</option>
                <option value="USD">USD ($ US Dollar)</option>
                <option value="EUR">EUR (€ Euro)</option>
              </select>
            </div>
          </div>

          {/* Sourcing Priorities */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Strategic Sourcing Priorities
            </label>
            <input
              type="text"
              name="sourcing_priorities"
              value={formData.sourcing_priorities}
              onChange={handleChange}
              placeholder="e.g. Lowest Landed Cost, Low MOQ for Prototyping, Organic/FSC Certifications..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800"
            />
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Changes are immediately indexed by the AI supplier ranking algorithm.
            </span>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Business Profile
                </>
              )}
            </button>
          </div>
        </form>
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
