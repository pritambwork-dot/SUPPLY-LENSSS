# SUPPLYLENS — GLOSSY DESIGN SYSTEM SPECIFICATION

**Product:** SupplyLens  
**Engineering Discipline:** Design Systems, UI/UX Engineering, CSS Architecture  
**Visual Benchmark:** SupplyLens Obsidian Dark & Precision Glass Aesthetic  
**Version:** 1.0 (Production Standard)  

---

## 1. Design Philosophy: Restrained Luxury & Precision Glass

SupplyLens avoids loud, generic neon glassmorphism or low-contrast blurs. The design language is inspired by high-end studio optics, obsidian surfaces, and aerospace telemetry interfaces:

1. **Obsidian Surface Hierarchy:**
   - **Base Canvas (`bg-[#080a0f]`):** Deepest space layer.
   - **Secondary Canvas (`bg-[#0d1117]`):** Surface background for content wells.
   - **Elevated Card Surface (`bg-[#141923]/80`):** Frosted glassmorphism with `backdrop-blur-xl`.
   - **Interactive Modal / Drawer Surface (`bg-[#0f141e]/95`):** High-density optical frosted surface.
2. **Beveled Specular Edge Light:**
   - Instead of thick glowing borders, cards feature a razor-sharp 1px border with a directional top gradient sheen:
     `border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]`
3. **Restrained Color Palette:**
   - **Primary Action (Stark White Pill):** `#ffffff` background with `#000000` text for maximum cognitive clarity.
   - **Electric Cyan (`#38bdf8`):** AI intelligence, live route pulses, and active verification status.
   - **Cobalt Blue (`#2563eb`):** Primary branding accents and links.
   - **Emerald Green (`#10b981`):** Verified evidence, audited documents, and paid transactions.
   - **Subtle Amber (`#f59e0b`):** Warning states and pending audits.

---

## 2. Reusable Glossy Component Anatomy

### 2.1 GlossyCard (`frontend/src/components/glossy/GlossyCard.tsx`)
```tsx
<div className="relative rounded-3xl bg-[#121721]/80 border border-white/[0.1] shadow-2xl backdrop-blur-xl p-6 overflow-hidden transition-all duration-300 hover:border-white/[0.18] hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
  {/* Specular Top Sheen Gradient */}
  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
  {children}
</div>
```

### 2.2 GlossyButton (`frontend/src/components/glossy/GlossyButton.tsx`)
- **Primary:** Stark white pill with black typography, tactile spring press (`active:scale-[0.98]`).
- **Secondary (Glass):** Dark obsidian surface with subtle white border and soft hover reflection.
- **Accent (Cyan):** Gradient border with soft glowing backlight.

### 2.3 GlossyInput (`frontend/src/components/glossy/GlossyInput.tsx`)
- Translucent dark input surface (`bg-white/[0.04]`) with a 1px border that smoothly transitions to electric cyan upon focus (`focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50`).
- Crisp white typography with muted 40% placeholder opacity.

### 2.4 GlossyTable (`frontend/src/components/glossy/GlossyTable.tsx`)
- Clean horizontal divider rules (`border-white/[0.06]`), sticky headers with frosted glass backdrop blur, and row hover highlight (`hover:bg-white/[0.03]`).

---

## 3. Typography & Micro-Interactions

- **Headlines:** Clean sans-serif with tight tracking (`tracking-tight`), uppercase subheadings (`uppercase tracking-wider font-mono text-[11px]`).
- **Financial & Data Numbers:** Monospaced tabular numerals (`font-mono tracking-normal`) for currency and percentages.
- **Scroll Physics:** Smooth inertia scrolling with hardware-accelerated transforms (`transform: translate3d(0, 0, 0)`).
