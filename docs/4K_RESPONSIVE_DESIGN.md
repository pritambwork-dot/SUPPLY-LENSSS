# SupplyLens 4K & Ultra-High-Definition (UHD) Responsive Design Specification

## 1. Multi-Resolution Architecture

SupplyLens is engineered to render crisply from compact mobile viewports (360px) up to Ultra HD and 4K displays (3840×2160):
- **Fluid Scalability**: Container widths scale gracefully using `max-w-[1580px]` on the flagship dashboard and `max-w-7xl` on detail tabs to eliminate awkwardly stretched cards on 4K monitors.
- **Fluid Typography**: Key metrics and headlines utilize CSS `clamp()` tokens to maintain balanced typographic proportion across all DPI settings.
- **High-Density Vector Assets**: All iconography (`lucide-react`) and Three.js canvas targets render at device pixel ratio (`dpr={Math.min(2, window.devicePixelRatio)}`) for razor-sharp clarity on Retina and 4K panels.

---

## 2. Breakpoint Grid Matrix

| Breakpoint | Viewport Width | Column Structure | Key Adaptations |
| :--- | :--- | :--- | :--- |
| **Mobile** | < 640px | 1 column stacked | Horizontal scrolling metrics, pull-to-refresh drawers, bottom fixed navigation bar |
| **Tablet** | 640px – 1023px | 2 columns | Side rail collapses to icon badges, compact comparison matrix |
| **Desktop** | 1024px – 1440px| 3-column Hero (4:5:3)| Standard Dribbble dashboard layout, sticky side rail |
| **Ultra HD / 4K**| 1440px – 3840px| 3-column Hero (Max-W Center)| Auto-centered layout with ambient subtle gradient margins, crisp 2x canvas resolution |

---

## 3. Touch Target & Accessibility Compliance

- **Minimum Touch Target**: All interactive buttons, chips, and table action pills adhere to a minimum 44×44px hit-box target for touch displays.
- **Contrast Ratios**: Body text (`#152238` on `#FFFFFF` / `#F7F9FC`) exceeds WCAG 2.1 AAA contrast standard (12.4:1 ratio).
- **Zoom Compatibility**: Preserves functional integrity up to 200% browser zoom without layout breakage.
