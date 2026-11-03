"use client";

import React, { useState } from "react";
import {
  Settings,
  Bell,
  DollarSign,
  ShieldCheck,
  Save,
  CheckCircle2,
  Users,
} from "lucide-react";

export default function CustomerSettingsPage() {
  const [currency, setCurrency] = useState("INR");
  const [defaultIncoterm, setDefaultIncoterm] = useState("FOB");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [quoteAlerts, setQuoteAlerts] = useState(true);
  const [auditAlerts, setAuditAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Settings className="w-3.5 h-3.5" />
            Customer Preferences & Workspace Configuration
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Workspace Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure your procurement defaults, currency display, quotation alerts, and security settings.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Commercial Defaults */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            Commercial & Sourcing Defaults
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              >
                <option value="INR">INR (₹ Indian Rupee)</option>
                <option value="USD">USD ($ US Dollar)</option>
                <option value="EUR">EUR (€ Euro)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Default Delivery Terms (Incoterms)
              </label>
              <select
                value={defaultIncoterm}
                onChange={(e) => setDefaultIncoterm(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              >
                <option value="FOB">FOB (Free On Board Factory)</option>
                <option value="CIF">CIF (Cost, Insurance & Freight to Port)</option>
                <option value="DAP">DAP (Delivered at Place)</option>
                <option value="EXW">EXW (Ex-Works)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            Communication & Notifications
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">Quotation Responses</span>
                <span className="text-slate-500 text-[11px]">Notify me when a verified vendor quotes an active RFQ.</span>
              </div>
              <input
                type="checkbox"
                checked={quoteAlerts}
                onChange={(e) => setQuoteAlerts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">10-D Verification Audits</span>
                <span className="text-slate-500 text-[11px]">Alert me if a shortlisted vendor updates its compliance filings.</span>
              </div>
              <input
                type="checkbox"
                checked={auditAlerts}
                onChange={(e) => setAuditAlerts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Settings updated successfully!
            </span>
          ) : (
            <span className="text-xs text-slate-400">Settings apply across all customer sessions.</span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
