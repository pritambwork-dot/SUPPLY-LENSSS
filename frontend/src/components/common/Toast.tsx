"use client";

import React, { useEffect } from "react";
import { Check, X } from "lucide-react";

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  onClose,
  duration = 2400,
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto">
      <div className="flex items-center gap-2 rounded-full bg-slate-900/90 text-white dark:bg-white/95 dark:text-slate-900 px-4 py-2 text-xs font-medium shadow-lg backdrop-blur-md border border-white/10 dark:border-black/10">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
          <Check className="h-2.5 w-2.5" />
        </span>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-1 text-slate-400 hover:text-white dark:hover:text-slate-900"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
