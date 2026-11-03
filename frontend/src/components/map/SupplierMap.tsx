"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Supplier } from "@/types";
import { ShieldCheck, Star, ExternalLink, Plus, Check, MapPin, Sparkles } from "lucide-react";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { RatingDisplay } from "@/components/common/RatingDisplay";
import { PriceDisplay } from "@/components/common/PriceDisplay";

interface SupplierMapProps {
  suppliers: Supplier[];
  onSelectSupplier: (supplier: Supplier) => void;
  onToggleCompare: (supplier: Supplier) => void;
  comparedSupplierIds: string[];
  theme: "dark" | "light";
}

export const SupplierMap: React.FC<SupplierMapProps> = ({
  suppliers,
  onSelectSupplier,
  onToggleCompare,
  comparedSupplierIds,
  theme,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const [activeSupplier, setActiveSupplier] = useState<Supplier | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Country clusters summary
  const countryClusters = useMemo(() => {
    const map = new Map<string, { country: string; count: number; lat: number; lng: number }>();
    suppliers.forEach((s) => {
      const existing = map.get(s.country);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(s.country, { country: s.country, count: 1, lat: s.lat, lng: s.lng });
      }
    });
    return Array.from(map.values());
  }, [suppliers]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import leaflet
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix default leaflet icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapInstanceRef.current) {
        // Initialize map centered on global manufacturing belt
        const map = L.map(mapContainerRef.current, {
          center: [20.5937, 78.9629], // India / South Asia center
          zoom: 4,
          zoomControl: true,
          attributionControl: false,
        });

        // Geoapify Retina Map Tiles
        const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "ffa02fdcc964436d9b4daa0f992effce";
        const isRetina = typeof window !== "undefined" && window.devicePixelRatio > 1;
        const retinaSuffix = isRetina ? "@2x.png" : ".png";
        const style = theme === "dark" ? "dark-matter-purple-roads" : "osm-bright-smooth";
        
        const tileUrl = geoapifyKey
          ? `https://maps.geoapify.com/v1/tile/${style}/{z}/{x}/{y}${retinaSuffix}?apiKey=${geoapifyKey}`
          : theme === "dark"
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

        L.tileLayer(tileUrl, {
          maxZoom: 20,
          subdomains: geoapifyKey ? [] : "abcd",
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapLoaded(true);
      } else {
        // Update tile layer if theme changed
        mapInstanceRef.current.eachLayer((layer: any) => {
          if (layer instanceof L.TileLayer) {
            mapInstanceRef.current.removeLayer(layer);
          }
        });

        const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "ffa02fdcc964436d9b4daa0f992effce";
        const isRetina = typeof window !== "undefined" && window.devicePixelRatio > 1;
        const retinaSuffix = isRetina ? "@2x.png" : ".png";
        const style = theme === "dark" ? "dark-matter-purple-roads" : "osm-bright-smooth";

        const tileUrl = geoapifyKey
          ? `https://maps.geoapify.com/v1/tile/${style}/{z}/{x}/{y}${retinaSuffix}?apiKey=${geoapifyKey}`
          : theme === "dark"
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

        L.tileLayer(tileUrl, {
          maxZoom: 20,
          subdomains: geoapifyKey ? [] : "abcd",
        }).addTo(mapInstanceRef.current);
      }

      // Plot markers
      const LInstance = L;
      const map = mapInstanceRef.current;

      // Clear existing markers
      Object.values(markersRef.current).forEach((marker: any) => marker.remove());
      markersRef.current = {};

      suppliers.forEach((supplier) => {
        const compareIdx = comparedSupplierIds.indexOf(supplier.id);
        const isCompared = compareIdx !== -1;
        const compareLetters = ["A", "B", "C", "D", "E"];
        const compareBadge = isCompared ? compareLetters[compareIdx] || "✓" : "★";

        const pinHtml = `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background: ${isCompared ? "#0071E3" : "#34C759"};
              opacity: 0.2;
            "></div>
            <div style="
              position: relative;
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: ${isCompared ? "#0071E3" : "#1D1D1F"};
              border: 2px solid #ffffff;
              box-shadow: 0 2px 8px rgba(0,0,0,0.18);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
              font-weight: 700;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            ">
              ${compareBadge}
            </div>
          </div>
        `;

        const customIcon = LInstance.divIcon({
          html: pinHtml,
          className: "custom-leaflet-pin",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = LInstance.marker([supplier.lat, supplier.lng], {
          icon: customIcon,
        }).addTo(map);

        marker.on("click", () => {
          setActiveSupplier(supplier);
        });

        markersRef.current[supplier.id] = marker;
      });
    });

    return () => {
      isMounted = false;
    };
  }, [suppliers, theme, comparedSupplierIds]);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs dark:border-white/10 dark:bg-[#1C1C1E]">
      {/* Map DOM node */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Left Overlay Badge */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-slate-800 shadow-xs backdrop-blur-md dark:bg-[#1C1C1E]/90 dark:text-slate-200 border border-slate-200/80 dark:border-white/10">
          <MapPin className="h-4 w-4 text-[#0071E3]" />
          <span>{suppliers.length} Verified Manufacturing Hubs</span>
        </div>
      </div>

      {/* Map Right Overlay: Country Clusters */}
      <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-1.5 max-w-xs sm:max-w-md justify-end">
        {countryClusters.map((cluster) => (
          <button
            key={cluster.country}
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([cluster.lat, cluster.lng], 6, { duration: 1 });
              }
            }}
            className="flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-[#1C1C1E]/90 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 shadow-xs hover:bg-slate-100 dark:hover:bg-white/10 backdrop-blur-md transition-all active:scale-95"
            title={`Zoom to ${cluster.country}`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{cluster.country}</span>
            <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {cluster.count}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Supplier Preview Card Popup (Section 16) */}
      {activeSupplier && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-88 z-30 animate-in slide-in-from-bottom-3 duration-200">
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#1C1C1E]/95 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white leading-tight">
                    {activeSupplier.name}
                  </h4>
                  <VerifiedBadge isVerified={activeSupplier.verificationStatus === "Verified"} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  📍 {activeSupplier.city}, {activeSupplier.country}
                </p>
              </div>

              <button
                onClick={() => setActiveSupplier(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 transition-colors"
                title="Close preview"
              >
                ✕
              </button>
            </div>

            {/* Rating */}
            <div className="pt-0.5 pb-2 border-b border-slate-100 dark:border-white/10">
              <RatingDisplay rating={activeSupplier.rating} reviewCount={activeSupplier.reviewCount} />
            </div>

            {/* Price & MOQ */}
            <div className="flex items-center justify-between gap-2 py-1">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Price</span>
                <PriceDisplay
                  amount={activeSupplier.products?.[0]?.quotedPrice || 0}
                  unit={activeSupplier.products?.[0]?.unit || "unit"}
                  currency={activeSupplier.products?.[0]?.currency || "INR"}
                  priceType="listed"
                />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">MOQ</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {activeSupplier.products?.[0]?.moq?.toLocaleString() || "N/A"}
                </span>
              </div>
            </div>

            {/* Actions (Section 16: View Profile, Compare) */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
              <button
                onClick={() => onSelectSupplier(activeSupplier)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] py-2.5 text-xs font-semibold text-white transition-all shadow-xs"
              >
                <span>View Profile</span>
                <ExternalLink className="h-3 w-3" />
              </button>

              <button
                onClick={() => onToggleCompare(activeSupplier)}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold transition-all ${
                  comparedSupplierIds.includes(activeSupplier.id)
                    ? "bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/30"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-white/10 dark:text-slate-300"
                }`}
              >
                {comparedSupplierIds.includes(activeSupplier.id) ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>In Compare</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>Compare</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Geoapify Map Intelligence Attribution Badge */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 text-[11px] font-medium text-slate-600 dark:text-slate-300 shadow-2xs pointer-events-none">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Geoapify Maps</span>
      </div>
    </div>
  );
};
