# SUPPLYLENS 3D DESIGN SYSTEM & VISUAL SPECIFICATION
### Architectural Reference Document for Unified Spatial & 3D Experience

**Document Version:** 2.0  
**Status:** Canonical Visual Foundation  
**Target:** Entire SupplyLens Platform (Homepage, Dashboard, Search, Dossiers, Economics, Optimization, Deals, Auth)

---

## 1. Executive Visual Identity Overview

SupplyLens embodies an **Obsidian Spatial Computing Aesthetic**—a refined synthesis of dark glassmorphic surfaces, tactile depth elevation, and real-time WebGL physical materials. The visual language conveys high-trust global intelligence: precise, technical, cinematic, and authoritative.

---

## 2. Color Palette & Chromatic Architecture

All colors follow strict chromatic roles to ensure visual harmony between 2D UI elements and Three.js 3D shaders.

| Role | Hex Code | RGB / HSL | Usage |
|---|---|---|---|
| **Deep Obsidian (Base Void)** | `#0a0d14` | `rgb(10, 13, 20)` | Viewport background, root canvas clear color |
| **Elevated Surface (Plate)** | `#0e1219` | `rgb(14, 18, 25)` | Master panel cards, dashboard container backgrounds |
| **Sub-Surface (Card)** | `#141822` | `rgb(20, 24, 34)` | Nested items, supplier cards, interactive modules |
| **Electric Royal Blue (Hero)** | `#2563eb` | `rgb(37, 99, 235)` | 3D Ribbed Sphere base, primary CTAs, active route arcs |
| **Deep Blue Core Glow** | `#0f245c` | `rgb(15, 36, 92)` | 3D emissive inner glow, atmospheric shadows |
| **Sky / Cyan Rim Light** | `#38bdf8` | `rgb(56, 189, 248)` | 3D specular rim lighting, hover glow rings, active nodes |
| **Emerald Verification** | `#10b981` | `rgb(16, 185, 129)` | Verified supplier badges, 100% capacity/payment status |
| **Amber Callout Accent** | `#f59e0b` | `rgb(245, 158, 11)` | Attention flags, savings highlights, promotional badges |
| **Hairline Structural Border** | `rgba(255, 255, 255, 0.08)` | — | Card perimeters, table dividers, panel borders |
| **Specular Sheen Highlight** | `rgba(255, 255, 255, 0.15)` | — | Top bevel light on cards, hover highlight strokes |

---

## 3. Typography Hierarchy

- **Font Family:** `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", system-ui, sans-serif`
- **Font Feature Settings:** `"cv02", "cv03", "cv04", "cv11"` (geometric tabular figures)
- **Tracking:**
  - Hero Displays (28px - 36px): `-0.025em` (tight, confident)
  - Card Titles (16px - 20px): `-0.015em`
  - Body & Metadata (12px - 14px): `-0.011em`
  - Monospace Data / POs / HS Codes (10px - 12px): `0.05em` (mono uppercase)

---

## 4. 3D Physical Material & Lighting Specifications

Every WebGL canvas across SupplyLens inherits identical lighting, camera, and shader parameters to ensure seamless scene continuity:

### Renderer Configuration
```typescript
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance"
});
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
```

### Studio Lighting Rig
1. **Ambient Blue Fill:**
   `new THREE.AmbientLight(0x0a1936, 1.8)`
   Establishes deep cinematic shadows without pitch-black clipping.
2. **Key Directional Light (Cool White-Cyan):**
   `new THREE.DirectionalLight(0xdbeafe, 3.2)` placed at `(4, 5, 4)`
   Casts crisp specular highlights on top-right edges.
3. **Cyan Rim Backlight:**
   `new THREE.DirectionalLight(0x38bdf8, 2.5)` placed at `(-4, -3, -3)`
   Carves out dramatic silhouette separation from the obsidian background.
4. **Interactive Point Light (Pointer Tracking):**
   `new THREE.PointLight(0x60a5fa, 2.2, 10)` following cursor coordinates with `0.05` lerp smoothing.

### Material Formula (Three.js `MeshPhysicalMaterial`)
- `color`: `#2563eb` (Electric Blue) or `#141822` (Subtle Obsidian)
- `emissive`: `#0f245c` with intensity `0.35`
- `roughness`: `0.26` (smooth satin tactile finish)
- `metalness`: `0.12`
- `clearcoat`: `0.85` (lacquered gloss reflection)
- `clearcoatRoughness`: `0.18`
- `sheen`: `0.5`, `sheenColor`: `#60a5fa`

---

## 5. Spatial Depth & Surface Treatments

### 3D Card Architecture (Layered Stacking)
- **Layer 0 (Void):** `#0a0d14` background with subtle radial gradient `radial-gradient(ellipse at top, rgba(37,99,235,0.08), transparent 70%)`.
- **Layer 1 (Glass Panel):** `background: rgba(14, 18, 25, 0.85)`, `backdrop-filter: blur(24px) saturate(160%)`, `border: 1px solid rgba(255, 255, 255, 0.08)`.
- **Layer 2 (Depth Card):** `box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12)`.
- **Layer 3 (Active Focus / Hover):** 3D perspective tilt (`rotateX`, `rotateY`) up to `8deg`, scale `1.02`, glow halo `box-shadow: 0 0 25px rgba(56, 189, 248, 0.25)`.

---

## 6. Motion Principles & Animation Curves

- **Spatial Deceleration Curve:** `cubic-bezier(0.16, 1, 0.3, 1)` (Swift start, long silky deceleration).
- **Interactive Hover Lerp:** `0.06` factor per animation frame for cursor-tracking 3D meshes.
- **Spring Physics (Framer Motion):** `{ type: "spring", stiffness: 350, damping: 25 }` for tactile button presses.
- **Micro-Interactions:**
  - Button Hover: Scale `1.02`, subtle cyan border glow.
  - Button Active/Click: Scale `0.97`, depth depression `-2px`.
  - Section Reveal: `opacity: 0 -> 1`, `translateY: 16px -> 0px`, `scale: 0.98 -> 1.0`.

---

## 7. Responsive Behavior & Quality Tiers

| Device Class | Screen Width | 3D Quality Tier | Geometry Segments | Particle Count | Interaction Mode |
|---|---|---|---|---|---|
| **Desktop Ultra** | $\ge 1440\text{px}$ | Ultra | 120 segments | Full routes & halos | Mouse drag, tilt, smooth cursor light |
| **Laptop** | $1024\text{px} - 1439\text{px}$ | High | 96 segments | Full routes | Mouse hover tilt |
| **Tablet** | $768\text{px} - 1023\text{px}$ | Medium | 64 segments | Optimized nodes | Touch orbit, tap to focus |
| **Mobile** | $< 768\text{px}$ | Mobile Lightweight | 48 segments | Simplified routes | Auto-rotate, touch scroll safe |

---

## 8. Accessibility & Graceful Fallbacks

1. **`prefers-reduced-motion`:**
   When enabled, auto-rotation is paused, 3D card tilt is deactivated, and transitions use instant opacity cross-fades.
2. **WebGL Detection & Recovery (`SceneFallback`):**
   If WebGL context creation fails or GPU is blacklisted, a pre-rendered high-resolution SVG/canvas gradient with vector node paths renders seamlessly without broken blank areas.
3. **Screen Reader Semantics:**
   All 3D canvases have `aria-hidden="true"` accompanied by accessible HTML tables, headings, and semantic text nodes.
