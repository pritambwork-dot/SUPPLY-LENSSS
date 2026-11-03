"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Building2,
  ShieldCheck,
  MapPin,
  DollarSign,
  Briefcase,
  Layers,
  Receipt,
  LogOut,
  X,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Lock,
  ChevronRight,
  Sparkles,
  Phone
} from "lucide-react";
import { authService, AuthUser } from "@/lib/auth";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  onSignOut?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSignOut,
}) => {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!isOpen) return null;

  const displayUser = user || {
    id: "usr-demo-001",
    email: "hossein@supplylens.ai",
    name: "Hossein",
    role: "Lead Sourcing Director",
    onboarding_status: "completed",
    active_step: 6,
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authService.signOut();
      if (onSignOut) {
        onSignOut();
      }
      onClose();
      router.push("/login");
    } catch {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col scale-in-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 pt-6 pb-12 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-300" />
              Sourcing Operator Profile
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>

          <h3 className="text-xl font-black tracking-tight">{displayUser.name}</h3>
          <p className="text-xs text-blue-100/90 font-medium">{displayUser.role} • EcoPack Solutions</p>
        </div>

        {/* Profile Avatar Overlay & Body */}
        <div className="px-6 -mt-8 pb-6 flex flex-col gap-5 bg-white">
          {/* Avatar Row */}
          <div className="flex items-end justify-between">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-black">
                  {displayUser.name.charAt(0)}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Account ID</span>
              <span className="text-xs font-mono font-bold text-slate-700">{displayUser.id}</span>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-2 py-1">
            <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-base font-black text-slate-900">4</span>
              <span className="text-[10px] font-semibold text-slate-500">Workspaces</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
              <span className="text-base font-black text-blue-600">7</span>
              <span className="text-[10px] font-semibold text-blue-600">Verified Factories</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
              <span className="text-base font-black text-emerald-600">$23.1k</span>
              <span className="text-[10px] font-semibold text-emerald-600">Landed Budget</span>
            </div>
          </div>

          {/* User Details List */}
          <div className="flex flex-col gap-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
              <div className="flex items-center gap-2 text-slate-500">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </div>
              <span className="font-semibold text-slate-800">{displayUser.email}</span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
              <div className="flex items-center gap-2 text-slate-500">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Enterprise</span>
              </div>
              <span className="font-semibold text-slate-800">EcoPack Solutions Pvt Ltd</span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Location</span>
              </div>
              <span className="font-semibold text-slate-800">Bhubaneswar, India</span>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Verification Tier</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                Tier 1 Audited
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-1.5">
            <Link
              href="/customer/profile"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-blue-600 text-xs font-semibold transition-colors group"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                <span>Edit Full Business & Sourcing Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/customer/invoices"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-blue-600 text-xs font-semibold transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                <span>Billing & Settlement Invoices</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* SIGN OUT BUTTON (Prominent Red / Danger Styling) */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200/90 font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{isSigningOut ? "Signing Out..." : "Sign Out of SupplyLens"}</span>
            </button>
            <p className="text-[10px] text-center text-slate-400">
              Session is protected with end-to-end token encryption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
