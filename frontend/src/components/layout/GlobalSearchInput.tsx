"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Sparkles, ArrowRight, Building2, Package, GitCompare, History, Clock } from "lucide-react";

interface GlobalSearchInputProps {
  onSearchSubmit: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const GlobalSearchInput: React.FC<GlobalSearchInputProps> = ({
  onSearchSubmit,
  isLoading = false,
  placeholder = "I want to start…",
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      onSearchSubmit(query.trim());
    }
  };

  const handleSelectQuery = (text: string) => {
    setQuery(text);
    setIsOpen(false);
    onSearchSubmit(text);
  };

  const recentSearches = [
    "I need low-MOQ packaging suppliers in India",
    "Sugarcane bagasse meal trays",
    "Bhubaneswar local freight suppliers",
  ];

  const suggestedActions = [
    { label: "Find suppliers", icon: Building2, query: "Find verified suppliers" },
    { label: "Find products", icon: Package, query: "Find packaging materials and machinery" },
    { label: "Compare suppliers", icon: GitCompare, query: "Compare low MOQ vs cheapest factory" },
    { label: "Ask SupplyLens", icon: Sparkles, query: "What suppliers do I need for my budget?" },
  ];

  const exampleChips = [
    "I want to start a sustainable cosmetic company in India",
    "I want to sell eco-friendly packaging.",
    "I want to start a clothing business.",
    "I want to import electronics.",
  ];

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center rounded-full border border-slate-200/80 bg-white p-1.5 shadow-xs hover:border-slate-300 focus-within:border-[#0071E3] focus-within:ring-2 focus-within:ring-[#0071E3]/20 dark:border-white/10 dark:bg-[#1C1C1E] transition-all">
          <div className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 ml-1.5">
            <Search className="h-4 w-4" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
          />

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="flex items-center gap-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white px-5 py-2 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all mr-0.5 shadow-2xs shrink-0"
          >
            {isLoading ? (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>Search</span>
                <ArrowRight className="h-3 w-3" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Refined Search Overlay / Dropdown (Section 6) */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-3xl border border-slate-200/80 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Suggested Actions */}
          <div className="mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2 px-1">
              Suggested Actions
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {suggestedActions.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.label}
                    type="button"
                    onClick={() => handleSelectQuery(act.query)}
                    className="flex items-center gap-2.5 rounded-2xl p-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-[#0071E3]">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Searches */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/10">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2 px-1">
              Recent Inquiries
            </span>
            <div className="space-y-1">
              {recentSearches.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectQuery(item)}
                  className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5 transition-colors"
                >
                  <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{item}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Suggestion Chips Below */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 justify-center">
        {exampleChips.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectQuery(item)}
            className="rounded-full border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-[#1C1C1E] dark:text-slate-400 dark:hover:bg-white/15 dark:hover:text-white transition-colors shadow-2xs"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};
