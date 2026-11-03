"use client";

import React from "react";
import { FloatingAIAssistant } from "@/components/assistant/FloatingAIAssistant";

export default function VendorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <FloatingAIAssistant />
    </>
  );
}
