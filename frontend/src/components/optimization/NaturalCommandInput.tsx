"use client";

import React, { useState } from "react";

interface NaturalCommandInputProps {
  onSendCommand: (commandText: string) => void;
  isProcessing: boolean;
  lastFeedback?: string | null;
}

const STARTER_COMMANDS = [
  "Make it cheaper",
  "Don't depend on one supplier",
  "Limit to Indian suppliers",
  "Prioritize fast delivery",
  "Maximize verified supplier reliability",
];

export const NaturalCommandInput: React.FC<NaturalCommandInputProps> = ({
  onSendCommand,
  isProcessing,
  lastFeedback,
}) => {
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendCommand(inputText.trim());
    setInputText("");
  };

  const handleChipClick = (cmd: string) => {
    if (isProcessing) return;
    onSendCommand(cmd);
  };

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs p-6 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">✨</span>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide">
          Conversational Constraint Tuning
        </h3>
        <span className="bg-[#0071E3]/10 text-[#0071E3] dark:text-blue-400 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-[#0071E3]/20 ml-auto">
          AI Procurement Copilot
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3.5">
        Tell the engine how you want to refine your allocation. AI translates your words into mathematical parameters without altering solver rigor.
      </p>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-1.5 mb-3.5">
        {STARTER_COMMANDS.map((cmd) => (
          <button
            key={cmd}
            type="button"
            disabled={isProcessing}
            onClick={() => handleChipClick(cmd)}
            className="bg-slate-100 hover:bg-slate-200/80 dark:bg-white/10 dark:hover:bg-white/15 active:scale-95 disabled:opacity-50 text-slate-700 dark:text-slate-300 text-xs px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-white/10 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>💬</span>
            <span>"{cmd}"</span>
          </button>
        ))}
      </div>

      {/* Command Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g., 'Make it cheaper' or 'Limit order to 2 domestic suppliers under ₹1.2 lakh'..."
          disabled={isProcessing}
          className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/15 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3]"
        />
        <button
          type="submit"
          disabled={isProcessing || !inputText.trim()}
          className="px-5 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white active:scale-95 disabled:opacity-50 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
        >
          {isProcessing ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Tuning...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Apply Tuning</span>
            </>
          )}
        </button>
      </form>

      {/* Last AI Feedback */}
      {lastFeedback && (
        <div className="mt-3.5 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
          <span className="font-bold">✓</span>
          <span>{lastFeedback}</span>
        </div>
      )}
    </div>
  );
};
