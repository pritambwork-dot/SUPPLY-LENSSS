import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://supplylenss.vercel.app"),
  title: "SupplyLens | AI-Powered Global Sourcing Intelligence",
  description: "Discover suppliers, explore raw-material options, compare pricing and MOQ, and make smarter procurement decisions with SupplyLens.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "SupplyLens | AI-Powered Global Sourcing Intelligence",
    description: "Discover suppliers, compare sourcing options and make data-driven procurement decisions—all in one intelligent platform.",
    images: ["/images/supplylens-dashboard-preview.webp"],
  },
};

import { SceneProvider } from "@/components/3d/SceneProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-[#F2F2F7] text-slate-900 antialiased dark:bg-[#000000] dark:text-white transition-colors duration-200">
        <SceneProvider>
          {children}
        </SceneProvider>
      </body>
    </html>
  );
}
