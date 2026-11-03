"use client";

import dynamic from "next/dynamic";

const MasterLandingPage = dynamic(
  () => import("@/components/landing/MasterLandingPage").then((mod) => mod.MasterLandingPage),
  { ssr: false }
);

export default function LandingPage() {
  return <MasterLandingPage />;
}
