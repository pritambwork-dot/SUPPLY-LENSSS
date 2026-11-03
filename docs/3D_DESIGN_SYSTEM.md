# SupplyLens 3D Design System & WebGL Architecture

## 1. 3D Design Philosophy

SupplyLens incorporates spatial web technologies to make global industrial sourcing tactile, transparent, and cinematic:
1. **Interactive Spatial Sourcing Centerpiece**: Dual-mode WebGL canvas supporting both an interactive neural sourcing sphere (`AiSphere3D`) and a 3D global logistics network globe (`GlobalGlobe`).
2. **Tactile Card Physics (`SpatialCard`)**: Subtle 3D perspective tilts based on mouse movement (`maxRotation={6}`, `elevationOnHover={14}`), giving high-density tables and metrics a physical, premium feel.
3. **Cinematic Landing Page (`FreightScrollHero`)**: Scroll-driven Three.js camera traversing 3D shipping containers, maritime trade lanes, and freight distribution hubs.

---

## 2. 3D Components & Pipeline

### 2.1 `AiSphere3D.tsx`
- **Geometry**: High-resolution `IcosahedronGeometry` with custom vertex and fragment shaders.
- **Material**: Translucent physical wireframe with procedural noise displacement and glowing blue/cyan energy pulses that synchronize with AI thinking telemetry (`isAnalyzing`).
- **Lighting**: Ambient light `intensity={0.4}`, directional light `intensity={1.2}` positioned at `[5, 5, 5]`, and point lights simulating sub-surface scatter.

### 2.2 `GlobalGlobe.tsx`
- **Geometry**: Sphere with geographic arc curves mapping direct factory routes to buyer destination hubs.
- **Interactive Pins**: Dynamic 3D pins located at supplier coordinates with pulsing rings indicating audit confidence.
- **Controls**: Smooth damping camera controls with auto-rotation when idle.

### 2.3 `SpatialCard.tsx`
- **Mathematics**: Uses `transform: perspective(1000px) rotateX(...) rotateY(...)` calculated smoothly via requestAnimationFrame / Framer Motion hooks.
- **Lighting Effect**: Subtle cursor glare overlay that glides across the glossy white surface on pointer move.

---

## 3. Performance & WebGL Optimization

- **Frame Budget**: Strictly locked to 60 FPS on desktop and high-refresh displays.
- **Power Management**: Three.js rendering pauses (`invalidate()`) when the canvas is off-screen or the tab is in the background.
- **Fallback**: Graceful CSS SVG fallback for environments with WebGL disabled or restricted GPU permissions.
