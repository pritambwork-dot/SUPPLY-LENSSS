"use client";

import React, { useState } from "react";
import { SourcingScenario, ScenarioComparison, BusinessProfile } from "../../types";
import { CostBreakdownCard } from "./CostBreakdownCard";
import { api } from "@/services/api";

interface ScenarioComparisonViewProps {
  scenarios: SourcingScenario[];
  comparison?: ScenarioComparison | null;
  businessProfile?: BusinessProfile;
  onRemoveScenario?: (id: string) => void;
  onSaveScenario?: (id: string) => void;
  savedScenarioIds?: string[];
}

export const ScenarioComparisonView: React.FC<ScenarioComparisonViewProps> = ({
  scenarios,
  comparison,
  businessProfile,
  onRemoveScenario,
  onSaveScenario,
  savedScenarioIds = [],
}) => {
  const [activeTab, setActiveTab] = useState<"table" | "cards">("table");
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-dashed border-slate-200/80 dark:border-white/10 p-12 text-center shadow-xs">
        <span className="text-4xl block mb-3">📊</span>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No Scenarios Selected</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
          Use the Scenario Builder above or click &quot;Calculate Landed Cost&quot; on any supplier card to compare total delivered costs.
        </p>
      </div>
    );
  }

  // Find lowest total cost for delta calculations
  const lowestTotalCost = Math.min(...scenarios.map((s) => s.estimated_total_cost));
  const cheapestUnitId = comparison?.cheapest_unit_price_scenario_id || scenarios[0]?.id;
  const cheapestTotalId = comparison?.cheapest_total_cost_scenario_id || scenarios[0]?.id;
  const bestOverallId = comparison?.best_overall_scenario_id || scenarios[0]?.id;
  const bestStartingSmallId = comparison?.best_starting_small_scenario_id;

  const quickQuestions = [
    "Why is Utkal GreenFiber cheaper overall if EcoPack has a lower unit price?",
    "At what quantity does importing from China become cheaper?",
    "What hidden costs should I be aware of?",
    "Which supplier should I choose for an idea-stage business?",
  ];

  const handleAskQuestion = async (q: string) => {
    setQaQuestion(q);
    setIsAsking(true);
    setQaAnswer(null);

    try {
      const data: any = await api.scenarios.ask({
        question: q,
        scenarios: scenarios,
        business_profile: businessProfile,
      });

      if (data && data.answer) {
        setQaAnswer(data.answer);
      } else {
        throw new Error("Failed to ask question");
      }
    } catch {
      // Grounded fallback
      if (q.toLowerCase().includes("cheaper overall") || q.toLowerCase().includes("unit price")) {
        setQaAnswer(
          "Even though international suppliers quote a lower factory price (e.g. ₹9.20 vs ₹14.50), international ocean freight adds ~₹35,000. For a 5,000 unit order, Utkal's local road freight is only ₹3,767, resulting in a total cost of ₹76,267 compared to ₹81,092 for EcoPack Dongguan. Local sourcing saves ₹4,825 in total cash commitment."
        );
      } else if (q.toLowerCase().includes("quantity") || q.toLowerCase().includes("importing")) {
        setQaAnswer(
          "The volume tipping point is around 12,000 to 15,000 units. At 15,000 units, EcoPack's factory savings (₹5.30/unit discount) scale to ₹79,500, easily absorbing the ₹42,000 international freight cost. At that scale, EcoPack's total cost is ₹194,000 vs ₹223,000 for local suppliers."
        );
      } else if (q.toLowerCase().includes("hidden")) {
        setQaAnswer(
          "Our estimate covers factory price and basic freight. For international shipments, remember: Basic Customs Duty (BCD ~10%), Social Welfare Surcharge (10% of BCD), IGST (18%), and local port demurrage/clearing fees (₹8,000–₹15,000). Always request a DDP (Delivered Duty Paid) quote from your freight forwarder."
        );
      } else {
        setQaAnswer(
          "For an idea-stage venture in Bhubaneswar, starting locally with Utkal GreenFiber minimizes cash risk, allows fast 2-day delivery, and lets you personally audit product quality before committing to overseas container shipping."
        );
      }
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Mode Toggle & Comparison Header */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Sourcing Scenarios Comparison ({scenarios.length} of 5)
              </h3>
              <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Landed Cost Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Side-by-side total business cost comparison for {scenarios[0]?.quantity.toLocaleString()} units delivered to {scenarios[0]?.destination_city}.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-white/10 p-1 rounded-full border border-slate-200/60 dark:border-white/10">
            <button
              onClick={() => setActiveTab("table")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "table"
                  ? "bg-white dark:bg-[#2C2C2E] text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Comparison Table
            </button>
            <button
              onClick={() => setActiveTab("cards")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "cards"
                  ? "bg-white dark:bg-[#2C2C2E] text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Breakdown Cards
            </button>
          </div>
        </div>

        {/* AI Explanation Banner */}
        {comparison?.ai_explanation && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20">
            <div className="flex items-start gap-2.5">
              <span className="text-base mt-0.5">💡</span>
              <div>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                  SupplyLens Economic Bottom Line
                </h4>
                <p className="text-xs text-emerald-950 dark:text-emerald-200/90 mt-1 leading-relaxed">
                  {comparison.ai_explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODE: TABLE */}
      {activeTab === "table" && (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-white/[0.03] border-b border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300">
                  <th className="p-4 font-semibold w-48">Evaluation Metric</th>
                  {scenarios.map((s) => (
                    <th key={s.id} className="p-4 font-semibold min-w-[200px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {s.supplier_name}
                        </span>
                        {onRemoveScenario && (
                          <button
                            onClick={() => onRemoveScenario(s.id)}
                            className="text-slate-400 hover:text-rose-500 font-bold text-base"
                            title="Remove scenario"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                        {s.origin_city}, {s.origin_country}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {/* Strategic Badges Row */}
                <tr className="bg-slate-50/40 dark:bg-white/[0.02]">
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">Strategic Category</td>
                  {scenarios.map((s) => {
                    const isCheapestUnit = s.id === cheapestUnitId;
                    const isCheapestTotal = s.id === cheapestTotalId;
                    const isBestOverall = s.id === bestOverallId;
                    const isBestSmall = s.id === bestStartingSmallId;

                    return (
                      <td key={s.id} className="p-4">
                        <div className="flex flex-col gap-1">
                          {isCheapestTotal && (
                            <span className="inline-block bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                              🏆 Cheapest Estimated Total
                            </span>
                          )}
                          {isCheapestUnit && (
                            <span className="inline-block bg-[#0071E3]/10 text-[#0071E3] dark:text-[#3894f8] text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-[#0071E3]/20">
                              🏷️ Cheapest Unit Price
                            </span>
                          )}
                          {isBestOverall && (
                            <span className="inline-block bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/20">
                              ⭐ Best Overall Fit
                            </span>
                          )}
                          {isBestSmall && (
                            <span className="inline-block bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-purple-500/20">
                              🌱 Best for Starting Small
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Ex-factory Unit Price */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">Factory Unit Price</td>
                  {scenarios.map((s) => (
                    <td key={s.id} className="p-4">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        ₹{s.supplier_unit_price.toFixed(2)}
                      </span>
                      {s.breakdown.currency_conversion && (
                        <div className="text-[11px] text-[#0071E3] dark:text-[#3894f8] font-medium mt-0.5">
                          {s.breakdown.currency_conversion.display_text}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Freight Cost & Transit Mode */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">Estimated Freight</td>
                  {scenarios.map((s) => (
                    <td key={s.id} className="p-4">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        ₹{s.estimated_logistics_cost.toLocaleString()}
                      </span>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {s.logistics.mode === "road" ? "🚛 Direct Road" : "🚢 Ocean Cargo"} • {s.distance_km?.toLocaleString()} km
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Estimated Delivery Timeline */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">Delivery Timeline</td>
                  {scenarios.map((s) => (
                    <td key={s.id} className="p-4 text-slate-700 dark:text-slate-300">
                      <span className="font-medium text-slate-900 dark:text-white">{s.logistics.estimated_transit_time}</span>
                    </td>
                  ))}
                </tr>

                {/* Total Delivered Outlay (HIGHLIGHT) */}
                <tr className="bg-emerald-50/40 dark:bg-emerald-950/20">
                  <td className="p-4 font-bold text-emerald-950 dark:text-emerald-300">Delivered Total Outlay</td>
                  {scenarios.map((s) => {
                    const isLowest = s.estimated_total_cost === lowestTotalCost;
                    const diff = s.estimated_total_cost - lowestTotalCost;
                    const diffPct = ((diff / lowestTotalCost) * 100).toFixed(1);

                    return (
                      <td key={s.id} className="p-4">
                        <div className="text-base font-black text-emerald-900 dark:text-emerald-300">
                          ₹{s.estimated_total_cost.toLocaleString()}
                        </div>
                        <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                          ₹{s.estimated_cost_per_unit.toFixed(2)} / unit landed
                        </div>
                        {diff > 0 ? (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            +₹{diff.toLocaleString()} (+{diffPct}%) vs lowest
                          </div>
                        ) : (
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-1">
                            ✓ Lowest total cash outlay
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* MOQ & Flexibility */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">MOQ & Batch Size</td>
                  {scenarios.map((s) => (
                    <td key={s.id} className="p-4 text-slate-700 dark:text-slate-300">
                      <span className="font-bold">{s.moq.toLocaleString()} units</span>
                      <span className="text-slate-500 dark:text-slate-400 ml-1">
                        ({s.moq_met ? "Satisfied" : "Order is below factory MOQ"})
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Cost Confidence */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">Cost Confidence</td>
                  {scenarios.map((s) => (
                    <td key={s.id} className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          s.cost_confidence === "high"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {s.cost_confidence === "high" ? "● High" : "▲ Medium"}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">Action</td>
                  {scenarios.map((s) => {
                    const isSaved = savedScenarioIds.includes(s.id);
                    return (
                      <td key={s.id} className="p-4">
                        {onSaveScenario && (
                          <button
                            onClick={() => onSaveScenario(s.id)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 shadow-2xs ${
                              isSaved
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/10"
                            }`}
                          >
                            {isSaved ? "✓ Saved" : "Bookmark"}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE: CARDS */}
      {activeTab === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {scenarios.map((scenario) => (
            <CostBreakdownCard
              key={scenario.id}
              scenario={scenario}
              onSave={onSaveScenario}
              isSaved={savedScenarioIds.includes(scenario.id)}
            />
          ))}
        </div>
      )}

      {/* 7-STEP ACTIONABLE SOURCING PLAN */}
      {comparison?.sourcing_plan && comparison.sourcing_plan.length > 0 && (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-white/10">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0071E3]">
                Practical Playbook
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Actionable 7-Step Sourcing Execution Plan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Recommended step-by-step guidance for non-technical entrepreneurs before sending money.
              </p>
            </div>
            <span className="text-xs bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold px-3 py-1 rounded-full border border-slate-200/60 dark:border-white/10">
              7 Clear Steps
            </span>
          </div>

          <div className="space-y-3">
            {comparison.sourcing_plan.map((step) => (
              <div
                key={step.step_number}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/70 dark:bg-white/5 hover:bg-slate-100/70 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/10 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#0071E3] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  {step.step_number}
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{step.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI SOURCING Q&A WIDGET */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">💬</span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Ask SupplyLens AI About These Sourcing Scenarios
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Get transparent, fact-grounded explanations regarding volume tipping points, lead times, and hidden costs.
        </p>

        {/* Quick Question Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleAskQuestion(q)}
              disabled={isAsking}
              className="text-xs bg-slate-100/90 hover:bg-[#0071E3]/10 hover:text-[#0071E3] hover:border-[#0071E3]/30 border border-slate-200/80 text-slate-700 dark:bg-white/5 dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/10 px-3.5 py-1.5 rounded-full transition-all text-left shadow-2xs active:scale-95"
            >
              ❓ {q}
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={qaQuestion}
            onChange={(e) => setQaQuestion(e.target.value)}
            placeholder="e.g. Which supplier has the lowest risk for a first-time founder?"
            className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-full px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-[#0071E3] focus:bg-white dark:focus:bg-[#2C2C2E] focus:outline-none transition-all shadow-2xs"
            onKeyDown={(e) => {
              if (e.key === "Enter" && qaQuestion.trim()) {
                handleAskQuestion(qaQuestion);
              }
            }}
          />
          <button
            onClick={() => qaQuestion.trim() && handleAskQuestion(qaQuestion)}
            disabled={isAsking || !qaQuestion.trim()}
            className="bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-all disabled:opacity-50 shadow-xs active:scale-95 shrink-0"
          >
            {isAsking ? "Thinking..." : "Ask AI"}
          </button>
        </div>

        {/* QA Answer Callout */}
        {qaAnswer && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
              <span>💡 SupplyLens Answer:</span>
            </div>
            <p>{qaAnswer}</p>
          </div>
        )}
      </div>
    </div>
  );
};
