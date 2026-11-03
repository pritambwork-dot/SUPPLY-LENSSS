"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InvoiceRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/?tab=billing");
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F7F9FC]">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs font-medium">Opening Invoice inside Dashboard...</p>
      </div>
    </div>
  );
}
