# SupplyLens Motion & Animation System

## 1. Principles of Motion

SupplyLens animations are designed to convey enterprise precision, responsiveness, and tactile physics:
- **Immediate Response**: Interactions provide micro-haptic visual feedback within 16ms of pointer contact.
- **Natural Physics**: Apple-inspired easing curves (`[0.16, 1, 0.3, 1]`) prevent rigid linear snapping.
- **Accessibility & Reduced Motion**: Fully honors `prefers-reduced-motion: reduce` by replacing spatial transitions with instant opacity fades.

---

## 2. Animation Token Standards

| Motion Type | Duration | Easing Curve | Use Case |
| :--- | :--- | :--- | :--- |
| **Entrance** | 300ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Tab switches, page load, modal appearance |
| **Hover Elevation** | 200ms | `ease-out` | Spatial card lift, button focus states |
| **Telemetry Pulse**| 1200ms | `easeInOut` | Live verification check spinning, neural pulse |
| **Modal Scale-In** | 250ms | `[0.34, 1.56, 0.64, 1]` | Evidence inspect dialogs, admin review drawer |
| **Exit** | 180ms | `ease-in` | Dialog dismissals, toast notifications |

---

## 3. Micro-Interactions

1. **Deterministic Verification Check Spin**: When "Re-Verify" is clicked on a factory card, the icon triggers an accelerated 360-degree rotation while status badges transition from pending yellow to verified emerald.
2. **Chart Point Glides**: The Bezier Spline chart (`InteractiveChart.tsx`) smoothly interpolates line height and active metric bubbles upon mouse hover.
3. **Tab Glider**: Navigation pills feature an animated background layoutId glider that smoothly glides between tabs.
