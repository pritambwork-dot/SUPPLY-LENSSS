"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Lock, ShieldCheck, ArrowRight, Compass, LogIn } from "lucide-react";
import { authService, AuthUser } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallbackUrl,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loginTarget, setLoginTarget] = useState<string>("/login");

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const fullCurrentPath = search ? `${pathname}${search}` : (pathname || "/dashboard");
    const target = fallbackUrl || `/login?redirect=${encodeURIComponent(fullCurrentPath)}`;
    setLoginTarget(target);

    // 1. Check synchronous stored user
    const stored = authService.getStoredUser();
    if (stored && stored.id) {
      setCurrentUser(stored);
      setIsAuthenticated(true);
      return;
    }

    // 2. Check async session
    authService.getSessionUser().then((sessionUser) => {
      if (sessionUser && sessionUser.id) {
        setCurrentUser(sessionUser);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // Immediate redirect to login
        router.replace(target);
      }
    });
  }, [pathname, fallbackUrl, router]);

  // Loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#090D16] text-white selection:bg-blue-600/30">
        <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col items-center max-w-sm text-center shadow-2xl">
          <div className="relative mb-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Compass className="w-7 h-7 animate-spin" />
            </div>
          </div>
          <h2 className="text-base font-semibold text-white tracking-wide">
            Verifying Workspace Credentials...
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Enforcing strict authentication security protocol.
          </p>
        </div>
      </div>
    );
  }

  // Access Denied Barrier
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#07090E] text-white p-4 selection:bg-blue-600/30">
        <div className="relative p-8 sm:p-10 rounded-3xl bg-zinc-950/90 border border-red-500/20 backdrop-blur-2xl flex flex-col items-center max-w-md text-center shadow-[0_20px_60px_-15px_rgba(239,68,68,0.2)]">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-6 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-mono font-semibold uppercase tracking-wider mb-3">
            Authentication Required
          </span>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Access Restricted
          </h1>

          <p className="text-sm text-gray-300 leading-relaxed mb-6">
            Without authentication, nobody can access SupplyLens workspaces, verified factory catalogs, or procurement dashboards.
          </p>

          <div className="w-full space-y-3">
            <Link
              href={loginTarget}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/landing"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium text-xs border border-white/10 transition-colors"
            >
              <span>Back to Public Showcase</span>
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted zero-trust session gateway</span>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated: Render protected children
  return <>{children}</>;
};
