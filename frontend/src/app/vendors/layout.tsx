"use client";

import React from "react";
import { FloatingAIAssistant } from "@/components/assistant/FloatingAIAssistant";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function VendorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      {children}
      <FloatingAIAssistant />
    </AuthGuard>
  );
}
