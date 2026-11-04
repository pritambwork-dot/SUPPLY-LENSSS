"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Globe2, 
  Compass, 
  X,
  User,
  Building2
} from "lucide-react";
import { SpatialCard } from "@/components/3d/SpatialCard";
import { authService } from "@/lib/auth";

interface LoginPageProps {
  onSuccess?: (user: { name: string; email: string; role: string }) => void;
  onClose?: () => void;
  isModal?: boolean;
  currentUser?: { name: string; handle: string; role: string } | null;
  onLogout?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onClose,
  isModal = false,
  currentUser,
  onLogout,
}) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("guest");
  const [password, setPassword] = useState("1234");
  const [name, setName] = useState("Guest");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const rawInput = email.trim().toLowerCase();
    const rawPass = password.trim();

    if (rawInput === "guest" || rawInput === "guest@supplylens.ai" || rawInput === "guest@example.com") {
      if (rawPass !== "1234") {
        setError("Invalid password for demo account 'guest'. Use password: 1234");
        setIsLoading(false);
        return;
      }
      setTimeout(() => {
        setIsLoading(false);
        const guestUser = {
          name: "Guest",
          email: "guest@supplylens.ai",
          role: "Lead Sourcing Director",
        };
        authService.setStoredUser({
          id: "usr-guest",
          email: "guest@supplylens.ai",
          name: "Guest",
          role: "Lead Sourcing Director",
          onboarding_status: "completed",
          active_step: 6,
        });
        if (onSuccess) {
          onSuccess(guestUser);
        }
      }, 400);
      return;
    }

    // Default simulation for other inputs
    setTimeout(() => {
      setIsLoading(false);
      const userPayload = {
        name: mode === "signin" ? (name || "Guest") : name,
        email: email || "guest@supplylens.ai",
        role: "Sourcing Director",
      };
      authService.setStoredUser({
        id: `usr-${Date.now()}`,
        email: userPayload.email,
        name: userPayload.name,
        role: userPayload.role,
        onboarding_status: "completed",
        active_step: 6,
      });
      if (onSuccess) {
        onSuccess(userPayload);
      }
    }, 600);
  };

  const handleQuickDemoAccess = () => {
    setEmail("guest");
    setPassword("1234");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const demoUser = {
        name: "Guest",
        email: "guest@supplylens.ai",
        role: "Lead Sourcing Director",
      };
      authService.setStoredUser({
        id: "usr-guest",
        email: "guest@supplylens.ai",
        name: "Guest",
        role: "Lead Sourcing Director",
        onboarding_status: "completed",
        active_step: 6,
      });
      if (onSuccess) {
        onSuccess(demoUser);
      }
    }, 300);
  };

  const content = (
    <SpatialCard
      maxRotation={5}
      elevationOnHover={12}
      className="relative w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-[#0d1117]/95 border border-white/[0.14] shadow-2xl backdrop-blur-2xl text-white"
    >
      {/* Ambient background glow */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Close button if modal */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Top Brand & Crest */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-lg shadow-blue-500/20 mb-3 flex items-center justify-center">
          <div className="w-full h-full bg-[#0a0d14] rounded-[14px] flex items-center justify-center">
            <Compass className="w-6 h-6 text-sky-400 animate-spin-slow" />
          </div>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">
          Supply<span className="text-sky-400">Lens</span>
        </h2>
        <p className="text-xs text-white/50 mt-1 max-w-xs">
          AI-Powered Global Sourcing Intelligence & Verified Supplier Network
        </p>
      </div>

      {/* Active User Card (if logged in) */}
      {currentUser && (
        <div className="mb-5 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 p-0.5">
              <div className="w-full h-full rounded-full bg-[#161a22] flex items-center justify-center text-xs font-bold text-white">
                {currentUser.name.charAt(0)}
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-white">{currentUser.name}</span>
              <span className="text-[10px] text-white/40">{currentUser.role}</span>
            </div>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-6">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            mode === "signin"
              ? "bg-[#1c2230] text-white shadow-sm border border-white/[0.12]"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            mode === "signup"
              ? "bg-[#1c2230] text-white shadow-sm border border-white/[0.12]"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Quick 1-Click Demo Access Pill */}
      <button
        type="button"
        onClick={handleQuickDemoAccess}
        className="w-full mb-3.5 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600/30 via-sky-500/20 to-blue-600/30 border border-sky-400/30 hover:border-sky-400/60 text-sky-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md group"
      >
        <Sparkles className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-12 transition-transform" />
        <span>One-Click Instant Demo Access</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Demo Credentials Box */}
      <div className="mb-5 p-3 rounded-2xl bg-sky-500/10 border border-sky-400/25 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-base">🔑</span>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-sky-400 font-bold">Demo Account</div>
            <div className="text-[11px] text-white/80">
              ID: <code className="text-sky-300 font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded">guest</code> · Password: <code className="text-sky-300 font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded">1234</code>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEmail("guest");
            setPassword("1234");
          }}
          className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-[11px] text-sky-200 font-semibold transition-all cursor-pointer"
        >
          Auto-Fill
        </button>
      </div>

      <div className="relative flex items-center justify-center mb-5">
        <div className="border-t border-white/[0.08] w-full" />
        <span className="bg-[#0d1117] px-3 text-[10px] uppercase tracking-wider text-white/40">
          Or continue with credentials
        </span>
        <div className="border-t border-white/[0.08] w-full" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {mode === "signup" && (
          <div>
            <label className="block text-[11px] font-medium text-white/60 mb-1.5">Full Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-white/40" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pritam Biswas"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-medium text-white/60 mb-1.5">User ID or Work Email</label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 w-4 h-4 text-white/40" />
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="guest or name@company.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-medium text-white/60">Password</label>
            <button type="button" className="text-[11px] text-sky-400 hover:underline">
              Forgot?
            </button>
          </div>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 w-4 h-4 text-white/40" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-white/40 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
            {error}
          </p>
        )}

        {/* Submit Button with high-contrast stark white pill styling */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>{mode === "signin" ? "Sign In to Workspace" : "Create Sourcing Account"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Trust Badges */}
      <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> 256-Bit SSL
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified Supplier Guarantee
        </span>
      </div>
    </SpatialCard>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        {content}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#080a0f] overflow-hidden">
      {/* 3D Atmospheric Background Rings & Gradients */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full border border-sky-500/10 opacity-60 animate-spin-slow" />
        <div className="absolute w-[850px] h-[850px] rounded-full border border-blue-500/5 opacity-40 animate-spin-slow [animation-direction:reverse]" />
        <div className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-blue-600/10 via-sky-500/5 to-transparent blur-3xl" />
      </div>
      {content}
    </div>
  );
};
