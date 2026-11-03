"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomerDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Keep ONLY the single flagship dashboard at /dashboard
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">
          Loading SupplyLens Workspace Dashboard...
        </span>
      </div>
    </div>
  );
}
