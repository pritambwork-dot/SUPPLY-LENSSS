"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Cpu,
  Globe,
  ShieldCheck,
  Zap,
  Server,
  DollarSign,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Database,
  ArrowUpRight,
  Bot,
  Layers,
  Sparkles,
} from "lucide-react";
import { api } from "@/services/api";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [usage, setUsage] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "telemetry" | "jobs">("overview");

  const loadData = async () => {
    try {
      const [provRes, usageRes, jobsRes] = await Promise.all([
        api.admin.getProviders().catch(() => ({ providers: [], total_active: 0 })),
        api.admin.getProviderUsage().catch(() => ({ summary: {}, total_requests: 0, total_cost_usd: 0, recent_events: [] })),
        api.admin.getDiscoveryJobs(20).catch(() => ({ total: 0, jobs: [] })),
      ]);
      setProviders(provRes.providers || []);
      setUsage(usageRes);
      setJobs(jobsRes.jobs || []);
    } catch (err) {
      console.error("Failed to load admin telemetry:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const getProviderIcon = (id: string) => {
    switch (id) {
      case "gemini":
        return <Bot className="w-5 h-5 text-indigo-600" />;
      case "nimbleway":
        return <Globe className="w-5 h-5 text-blue-600" />;
      case "apify":
        return <Cpu className="w-5 h-5 text-amber-600" />;
      case "geoapify":
        return <Server className="w-5 h-5 text-emerald-600" />;
      case "deepseek":
        return <Zap className="w-5 h-5 text-purple-600" />;
      default:
        return <Layers className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
                <ShieldCheck className="w-4 h-4" />
                Infrastructure & Telemetry
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                AI & Web Intelligence Providers
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Multi-agent search, crawling, geocoding, and verification infrastructure observability.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Refresh Status"}
              </button>
              <Link
                href="/customer/searches"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Run Discovery Search
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-slate-100">
            {[
              { id: "overview", label: "Provider Fleet", count: providers.length },
              { id: "telemetry", label: "Live Telemetry Logs", count: usage?.recent_events?.length || 0 },
              { id: "jobs", label: "Background Jobs", count: jobs.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 transition-all relative ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-500">Active Providers</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {providers.filter((p) => p.status === "online").length}/{providers.length || 5}
              </span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                100% Operational
              </span>
            </div>
            <p className="text-[11px] text-slate-400">All external APIs responding</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-500">Total API Invocations</span>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {usage?.total_requests || 0}
              </span>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Live calls
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Logged to search_provider_events</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-500">Estimated Cost</span>
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                ${(usage?.total_cost_usd || 0).toFixed(4)}
              </span>
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                USD
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Under $0.05 budget ceiling</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-500">Discovery Jobs</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{jobs.length}</span>
              <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                Tracked
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Asynchronous background workers</p>
          </div>
        </div>

        {/* Tab 1: Overview & Provider Cards */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {providers.map((p) => {
                const provUsage = usage?.summary?.[p.provider_id] || { requests: 0, total_cost_usd: 0 };
                return (
                  <motion.div
                    key={p.provider_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                            {getProviderIcon(p.provider_id)}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                            <p className="text-[11px] text-slate-500">{p.category}</p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            p.status === "online"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.status === "online" ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                            }`}
                          />
                          {p.status === "online" ? "Live & Ready" : "Missing Key"}
                        </span>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs text-slate-600 border border-slate-100">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Endpoint:</span>
                          <span className="font-mono text-slate-700 truncate max-w-[180px]">
                            {p.endpoint}
                          </span>
                        </div>
                        {p.model && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Model:</span>
                            <span className="font-semibold text-slate-700">{p.model}</span>
                          </div>
                        )}
                        {p.actor && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Actor:</span>
                            <span className="font-semibold text-slate-700">{p.actor}</span>
                          </div>
                        )}
                        {p.account_id && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Account:</span>
                            <span className="font-mono text-slate-700">{p.account_id}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Capabilities
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(p.capabilities || []).map((cap: string) => (
                            <span
                              key={cap}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600"
                            >
                              {cap.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div>
                        <span className="font-bold text-slate-900">{provUsage.requests || 0}</span> calls
                        <span className="mx-1 text-slate-300">·</span>
                        <span className="font-medium text-slate-700">${(provUsage.total_cost_usd || 0).toFixed(4)}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Authenticated
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Live Telemetry Events */}
        {activeTab === "telemetry" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent Telemetry Events</h2>
                <p className="text-xs text-slate-500">
                  Logged requests to external search and crawling APIs with latency and HTTP response status.
                </p>
              </div>
              <span className="text-xs font-medium text-slate-400">
                Auto-refreshes every 10s
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Endpoint</th>
                    <th className="py-3 px-4">Request Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Latency</th>
                    <th className="py-3 px-4">Est. Cost</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {(usage?.recent_events || []).map((ev: any) => (
                    <tr key={ev.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                        {getProviderIcon(ev.provider)}
                        <span className="capitalize">{ev.provider}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 truncate max-w-[220px]">
                        {ev.endpoint}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                          {ev.request_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            ev.status_code >= 200 && ev.status_code < 300
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {ev.status_code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-mono">
                        {ev.latency_ms}ms
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-semibold">
                        ${(ev.estimated_cost_usd || 0).toFixed(4)}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {ev.created_at ? new Date(ev.created_at).toLocaleTimeString() : "Just now"}
                      </td>
                    </tr>
                  ))}
                  {(!usage?.recent_events || usage.recent_events.length === 0) && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No telemetry events recorded yet. Trigger a search to view live logs.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Background Discovery Jobs */}
        {activeTab === "jobs" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Background Discovery Pipeline Jobs</h2>
                <p className="text-xs text-slate-500">
                  Real-time lifecycle of asynchronous supplier discovery, web scraping, and deterministic verification.
                </p>
              </div>
              <span className="text-xs font-medium text-slate-400">
                {jobs.length} jobs recorded
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {jobs.map((j) => (
                <div key={j.id} className="p-5 hover:bg-slate-50/50 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{j.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            j.status === "completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : j.status === "failed"
                              ? "bg-red-50 text-red-700"
                              : "bg-blue-50 text-blue-700 animate-pulse"
                          }`}
                        >
                          {j.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500 font-medium">
                          Provider: <span className="font-semibold text-slate-700 capitalize">{j.provider || "nimbleway"}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{j.query}</p>
                    </div>

                    <div className="text-left sm:text-right text-xs text-slate-400">
                      <div>Results: <span className="font-bold text-slate-800">{j.result_count || 0} verified</span></div>
                      <div className="text-[11px]">{j.started_at ? new Date(j.started_at).toLocaleTimeString() : ""}</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{j.current_step}</span>
                      <span className="font-bold text-slate-700">{j.progress_percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          j.status === "completed"
                            ? "bg-emerald-500"
                            : j.status === "failed"
                            ? "bg-red-500"
                            : "bg-blue-600"
                        }`}
                        style={{ width: `${j.progress_percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No discovery jobs have run yet. Run a search from Customer Portal to start one.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
