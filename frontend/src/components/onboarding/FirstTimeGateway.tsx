"use client";

import React from "react";
import { Rocket, PackageSearch, Globe, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

interface FirstTimeGatewayProps {
  onStartBusiness: () => void;
  onFindProduct: () => void;
  onFindSuppliers: () => void;
}

export const FirstTimeGateway: React.FC<FirstTimeGatewayProps> = ({
  onStartBusiness,
  onFindProduct,
  onFindSuppliers,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto my-6 sm:my-10">
      <div className="text-center mb-8 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          What would you like to do?
        </h2>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Choose a path to begin exploring verified global suppliers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Option 1: Start a business (PRIMARY CTA) */}
        <div
          onClick={onStartBusiness}
          className="group cursor-pointer rounded-3xl border border-[#0071E3]/40 bg-white p-6 shadow-xs hover:shadow-md hover:border-[#0071E3] dark:border-[#0071E3]/30 dark:bg-[#1C1C1E] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0071E3]/10 text-[#0071E3] group-hover:scale-105 transition-transform">
                <Rocket className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-[#0071E3]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#0071E3]">
                Recommended
              </span>
            </div>

            <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-[#0071E3] transition-colors">
              Start a business
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tell us what you want to build. We’ll identify every material and packaging input and match vetted suppliers.
            </p>

            <ul className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#34C759] shrink-0" />
                <span>Automatic requirement breakdown</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#34C759] shrink-0" />
                <span>Budget & readiness validation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#34C759] shrink-0" />
                <span>Personalized supplier match</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartBusiness();
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] py-2.5 text-xs font-semibold text-white transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span>Start a business</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Option 2: Find a product */}
        <div
          onClick={onFindProduct}
          className="group cursor-pointer rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-[#1C1C1E] dark:hover:border-white/20 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300 group-hover:scale-105 transition-transform mb-4">
              <PackageSearch className="h-5 w-5" />
            </div>

            <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-[#0071E3] transition-colors">
              Find a product
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Looking for a specific component, packaging, or machine? Explore specs, factory prices, and MOQs.
            </p>

            <ul className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Wholesale factory catalog</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Transparent price tiers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Direct specification match</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFindProduct();
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
          >
            <span>Find a product</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Option 3: Find suppliers */}
        <div
          onClick={onFindSuppliers}
          className="group cursor-pointer rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-[#1C1C1E] dark:hover:border-white/20 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300 group-hover:scale-105 transition-transform mb-4">
              <Globe className="h-5 w-5" />
            </div>

            <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-[#0071E3] transition-colors">
              Explore suppliers
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Explore verified manufacturing hubs across India, Vietnam, and global supply regions on the interactive map.
            </p>

            <ul className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Interactive map view</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Audit reports & certifications</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Legitimate verified contacts</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFindSuppliers();
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
          >
            <span>Explore directory</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
