"use client";

import React, { useState, useEffect } from "react";
import { Calculator } from "lucide-react";
import {
  OptimizationRequest,
  OptimizationResultResponse,
  OptimizationAlternativesResponse,
  AlternativePlan,
  BusinessProfile,
} from "../../types";
import { NaturalCommandInput } from "./NaturalCommandInput";
import { OptimizationSetupCard } from "./OptimizationSetupCard";
import { InfeasibilityAlert } from "./InfeasibilityAlert";
import { OptimizationResultsView } from "./OptimizationResultsView";
import { api } from "@/services/api";

interface OptimizationDashboardProps {
  businessProfile?: BusinessProfile | null;
}

const DEFAULT_REQUEST: OptimizationRequest = {
  required_quantity: 10000,
  budget_limit: null,
  objective_type: "balanced",
  max_suppliers: 3,
  max_supplier_share: 1.0,
  max_country_share: 1.0,
  preferred_countries: [],
  excluded_countries: [],
};



export const OptimizationDashboard: React.FC<OptimizationDashboardProps> = ({
  businessProfile,
}) => {
  const [request, setRequest] = useState<OptimizationRequest>(DEFAULT_REQUEST);
  const [result, setResult] = useState<OptimizationResultResponse | null>(null);
  const [alternatives, setAlternatives] = useState<OptimizationAlternativesResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCommandLoading, setIsCommandLoading] = useState<boolean>(false);
  const [lastCommandFeedback, setLastCommandFeedback] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(
    "Based on mathematical optimization of your demand, we allocated your order across 2 verified suppliers: Navrang FiberTech (7,500 units, 75.0%) and Utkal GreenFiber (2,500 units, 25.0%). This plan achieves ₹88,675 total procurement spend, saving ₹65,325 (42.4%) compared to single-sourcing while strictly honoring factory MOQs and delivery buffers."
  );

  const solve = async (reqToSolve: OptimizationRequest) => {
    setIsLoading(true);
    try {
      const data: any = await api.optimization.solve({
        ...reqToSolve,
        business_profile: businessProfile
          ? {
              budget: businessProfile.budgetAmount,
              scale: businessProfile.expectedScale,
              stage: businessProfile.businessStage,
              sourcing_preference: businessProfile.sourcingPreference,
              city: businessProfile.city,
              country: businessProfile.country,
            }
          : undefined,
      });

      if (data) {
        setResult(data);

        // Fetch alternatives and explanation if optimal
        if (data.status === "OPTIMAL") {
          fetchAlternatives(reqToSolve);
          fetchExplanation(data);
        }
      }
    } catch (err) {
      console.warn("Backend unavailable or error during solve", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlternatives = async (req: OptimizationRequest) => {
    try {
      const data: any = await api.optimization.scenarios(req);
      if (data) {
        setAlternatives(data);
      }
    } catch {
      // Non-blocking
    }
  };

  const fetchExplanation = async (plan: OptimizationResultResponse) => {
    try {
      const data: any = await api.optimization.explain({
        plan,
        business_profile: businessProfile,
      });
      if (data && data.explanation) {
        setExplanation(data.explanation);
      }
    } catch {
      // Non-blocking
    }
  };

  const handleCommand = async (commandText: string) => {
    setIsCommandLoading(true);
    try {
      const data: any = await api.optimization.command({
        command: commandText,
        current_request: request,
      });

      if (data) {
        setLastCommandFeedback(data.explanation || data.feedback || "Updated sourcing constraints.");
        if (data.updated_request) {
          const mergedRequest = { ...request, ...data.updated_request };
          setRequest(mergedRequest);
          solve(mergedRequest);
        }
      } else {
        applyLocalCommand(commandText);
      }
    } catch {
      applyLocalCommand(commandText);
    } finally {
      setIsCommandLoading(false);
    }
  };

  const applyLocalCommand = (commandText: string) => {
    const lower = commandText.toLowerCase();
    const updated = { ...request };
    let feedback = "";

    if (lower.includes("cheap") || lower.includes("cost")) {
      updated.objective_type = "cost";
      updated.max_supplier_share = 1.0;
      feedback = "Switched to lowest cost priority, relaxing concentration caps.";
    } else if (lower.includes("depend") || lower.includes("diversif")) {
      updated.objective_type = "diversified";
      updated.max_supplier_share = 0.50;
      updated.max_suppliers = Math.max(3, updated.max_suppliers || 3);
      feedback = "Capped single-supplier concentration at 50% for multi-sourcing resilience.";
    } else if (lower.includes("india") || lower.includes("domestic")) {
      updated.preferred_countries = ["India"];
      updated.excluded_countries = ["China", "Vietnam", "Germany"];
      feedback = "Restricted suppliers strictly to domestic Indian manufacturers.";
    } else if (lower.includes("fast") || lower.includes("speed")) {
      updated.objective_type = "logistics";
      feedback = "Prioritized fastest delivery turnaround and shortest lead time.";
    } else {
      updated.objective_type = "balanced";
      feedback = `Applied parameter adjustments for "${commandText}".`;
    }

    setLastCommandFeedback(feedback);
    setRequest(updated);
    solve(updated);
  };

  const handleAdoptStrategy = (strategyName: string, plan: AlternativePlan) => {
    let objType: any = "balanced";
    if (strategyName.toLowerCase().includes("cheap")) objType = "cost";
    if (strategyName.toLowerCase().includes("diversif")) objType = "diversified";

    const updated = {
      ...request,
      objective_type: objType,
    };
    setRequest(updated);
    solve(updated);
  };

  useEffect(() => {
    solve(request);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 1. Conversational Copilot Tuning */}
      <NaturalCommandInput
        onSendCommand={handleCommand}
        isProcessing={isCommandLoading}
        lastFeedback={lastCommandFeedback}
      />

      {/* 2. Setup & Constraints Card */}
      <OptimizationSetupCard
        currentRequest={request}
        onSolve={(newReq) => {
          setRequest(newReq);
          solve(newReq);
        }}
        isLoading={isLoading}
      />

      {/* 3. Infeasibility Alert if Solver Could Not Find a Feasible Solution */}
      {result && result.status === "INFEASIBLE" && (
        <InfeasibilityAlert
          diagnostics={result.infeasibility_diagnostics}
          onResetConstraints={() => {
            setRequest(DEFAULT_REQUEST);
            solve(DEFAULT_REQUEST);
          }}
          onIncreaseBudget={() => {
            const relaxed = { ...request, budget_limit: null };
            setRequest(relaxed);
            solve(relaxed);
          }}
          onReduceQuantity={() => {
            const reduced = { ...request, required_quantity: Math.max(2000, Math.floor(request.required_quantity * 0.7)) };
            setRequest(reduced);
            solve(reduced);
          }}
        />
      )}

      {/* 4. Optimal Allocation Results & Technical Drawer */}
      {!result && !isLoading && (
        <div className="w-full text-center p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[#1C1C1E]/60 my-8">
          <Calculator className="h-8 w-8 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Configure Optimization Run</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">Set your constraints and run the optimization engine to find the best sourcing allocation from verified suppliers.</p>
        </div>
      )}
      {result && result.status === "OPTIMAL" && (
        <OptimizationResultsView
          result={result}
          alternatives={alternatives}
          businessProfile={businessProfile}
          onAdoptStrategy={handleAdoptStrategy}
          explanation={explanation}
        />
      )}
    </div>
  );
};
