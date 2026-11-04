"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ProfessionalTaxInvoice } from "@/components/billing/ProfessionalTaxInvoice";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params?.invoice_id as string;

  return (
    <AuthGuard>
      <div className="min-h-screen w-full bg-[#F4F6F9] text-slate-800 p-4 sm:p-8 flex flex-col items-center justify-start print:p-0 print:bg-white">
        <ProfessionalTaxInvoice
          initialPreset={invoiceId?.includes("0002") || invoiceId?.includes("KLING") ? "landed_deal" : "success_fee"}
          onBack={() => router.push("/customer/invoices")}
        />
      </div>
    </AuthGuard>
  );
}
