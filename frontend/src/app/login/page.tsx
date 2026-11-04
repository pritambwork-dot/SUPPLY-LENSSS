"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Compass,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { authService } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("guest");
  const [password, setPassword] = useState("1234");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rawInput = email.trim().toLowerCase();
    if (!rawInput) {
      setError("Please enter your User ID or work email.");
      return;
    }
    if (rawInput !== "guest" && !rawInput.includes("@")) {
      setError("Please enter a valid User ID ('guest') or work email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.signIn({
        email: email.trim(),
        password,
      });

      if (res.user.onboarding_status === "completed") {
        const dest = redirectTarget && redirectTarget !== "/dashboard" ? redirectTarget : "/dashboard";
        window.location.href = dest;
      } else {
        window.location.href = "/onboarding";
      }
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoAccess = (completed: boolean) => {
    setIsLoading(true);
    setTimeout(() => {
      const demoUser = {
        name: completed ? "Pritam Biswas" : "New Founder",
        email: completed ? "pritam@supplylens.ai" : "newfounder@supplylens.ai",
        role: "Sourcing Director",
      };
      
      authService.signIn({
        email: demoUser.email,
        password: "demoPassword123",
      }).then((res) => {
        setIsLoading(false);
        if (completed) {
          const dest = redirectTarget && redirectTarget !== "/dashboard" ? redirectTarget : "/dashboard";
          window.location.href = dest;
        } else {
          window.location.href = "/onboarding";
        }
      });
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-800 antialiased flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-600/20">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[400px] bg-sky-400/10 rounded-full blur-[100px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 group mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-blue-600 group-hover:rotate-45 transition-transform duration-300" />
            </div>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
            Supply<span className="text-blue-600">Lens</span>
          </span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Sign in to your workspace
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Access your personalized dashboard, verified supplier dossiers, and sourcing deals.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white/90 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {/* Demo Account Credentials Banner */}
          <div className="mb-5 p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                🔑
              </div>
              <div className="text-left">
                <div className="text-slate-900 font-bold flex items-center gap-1.5">
                  <span>Demo Account</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-bold">Ready</span>
                </div>
                <div className="text-slate-600 text-[11px] mt-0.5">
                  ID: <code className="text-blue-700 font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">guest</code> · Password: <code className="text-blue-700 font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">1234</code>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail("guest");
                setPassword("1234");
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
            >
              Fill Credentials
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-700 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User ID or Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                User ID or Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guest or name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("Password reset instructions have been dispatched to your email address.")}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-600">Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Shortcuts */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2">
              Instant Sandbox Access
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoAccess(true)}
                className="p-2.5 rounded-xl border border-blue-200/60 bg-blue-50/50 hover:bg-blue-50 text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-bold text-blue-900 group-hover:text-blue-700 flex items-center justify-between">
                  <span>Demo Profile</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-[10px] text-blue-600/70 mt-0.5">
                  Pre-filled Dashboard
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoAccess(false)}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-50 text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-slate-900 flex items-center justify-between">
                  <span>New User</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Launch Onboarding
                </div>
              </button>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Protected by Supabase Auth Session Management & RLS</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center text-xs text-slate-400">Loading workspace authentication...</div>}>
      <LoginForm />
    </Suspense>
  );
}
