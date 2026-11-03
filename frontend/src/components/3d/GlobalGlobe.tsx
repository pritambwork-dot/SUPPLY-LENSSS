"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useSceneContext } from "./SceneProvider";
import { SceneFallback } from "./SceneFallback";
import { Supplier } from "@/types";

interface GlobalGlobeProps {
  suppliers?: Supplier[];
  activeSupplierId?: string;
  onSelectSupplier?: (supplierId: string) => void;
  className?: string;
  height?: number | string;
}

interface GeoPoint {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  verified: boolean;
  score: number;
}

export const GlobalGlobe: React.FC<GlobalGlobeProps> = ({
  suppliers = [],
  activeSupplierId,
  onSelectSupplier,
  className = "",
  height = 360,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { hasWebGL, reducedMotion, qualityTier } = useSceneContext();
  const [hoveredPoint, setHoveredPoint] = useState<GeoPoint | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convert lat/lng to 3D Cartesian coordinates on sphere
  const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    if (!hasWebGL) return;
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const h = typeof height === "number" ? height : container.clientHeight || 360;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 100);
    camera.position.set(0, 0, 4.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: qualityTier !== "mobile",
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, qualityTier === "ultra" ? 2 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. Earth Globe Core Mesh
    const globeRadius = 1.8;
    const segments = qualityTier === "ultra" ? 80 : qualityTier === "high" ? 64 : 48;
    const globeGeometry = new THREE.SphereGeometry(globeRadius, segments, segments);

    // Physical ocean shader material with deep obsidian blue and sheen
    const globeMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0d1b38"), // Deep navy obsidian
      emissive: new THREE.Color("#050d1e"),
      roughness: 0.35,
      metalness: 0.15,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      reflectivity: 0.8,
    });
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globeMesh);

    // 3. Atmosphere Glow Shell
    const atmosphereGeometry = new THREE.SphereGeometry(globeRadius * 1.035, segments, segments);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#38bdf8"),
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);

    // 4. Latitude / Longitude Continental Coordinate Grids
    const gridGeometry = new THREE.WireframeGeometry(new THREE.SphereGeometry(globeRadius * 1.002, 24, 16));
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x1e3a8a,
      transparent: true,
      opacity: 0.25,
    });
    const gridLines = new THREE.LineSegments(gridGeometry, gridMaterial);
    scene.add(gridLines);

    // 5. Verified Supplier Nodes (Canonical coordinates from live suppliers or defaults)
    const pointsData: GeoPoint[] = suppliers.length > 0
      ? suppliers.map((s) => ({
          id: s.id,
          name: s.name,
          country: s.country,
          lat: s.lat || 18.5204,
          lng: s.lng || 73.8567,
          verified: s.verificationStatus === "Verified",
          score: s.verificationScore || 90,
        }))
      : [
          { id: "sup-001", name: "Apex Precision Electronics", country: "India", lat: 18.5204, lng: 73.8567, verified: true, score: 94 },
          { id: "sup-002", name: "Deccan BioPlastics Hub", country: "India", lat: 17.3850, lng: 78.4867, verified: true, score: 96 },
          { id: "sup-003", name: "Utkal GreenFiber Packaging", country: "India", lat: 20.2961, lng: 85.8245, verified: true, score: 93 },
          { id: "sup-004", name: "Coimbatore CNC Precision", country: "India", lat: 11.0168, lng: 76.9558, verified: true, score: 91 },
          { id: "sup-005", name: "Shenzhen MicroTooling OEM", country: "China", lat: 22.5431, lng: 114.0579, verified: true, score: 95 },
          { id: "sup-006", name: "Saigon Sustainable Polymers", country: "Vietnam", lat: 10.8231, lng: 106.6297, verified: true, score: 92 },
        ];

    const markersGroup = new THREE.Group();
    const markerMeshes: THREE.Mesh[] = [];

    pointsData.forEach((pt) => {
      const pos = latLngToVector3(pt.lat, pt.lng, globeRadius * 1.01);
      
      // Node pin
      const pinGeom = new THREE.SphereGeometry(0.04, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: pt.verified ? 0x38bdf8 : 0xf59e0b,
      });
      const pinMesh = new THREE.Mesh(pinGeom, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.userData = pt;
      markersGroup.add(pinMesh);
      markerMeshes.push(pinMesh);

      // Outer Pulse Ring
      const ringGeom = new THREE.RingGeometry(0.05, 0.075, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pt.verified ? 0x60a5fa : 0xf59e0b,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      markersGroup.add(ringMesh);
    });

    // Destination Delivery Hub (Bengaluru, India: 12.9716, 77.5946)
    const destPos = latLngToVector3(12.9716, 77.5946, globeRadius * 1.01);
    const destPin = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x10b981 }) // Emerald Destination Hub
    );
    destPin.position.copy(destPos);
    markersGroup.add(destPin);

    scene.add(markersGroup);

    // 6. Connect Origins to Destination via 3D Spline Curves (Sourcing Arcs)
    const routesGroup = new THREE.Group();
    pointsData.slice(0, 4).forEach((pt) => {
      const start = latLngToVector3(pt.lat, pt.lng, globeRadius);
      const end = destPos.clone();
      
      // Midpoint elevated away from globe for graceful arc
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const distance = start.distanceTo(end);
      mid.normalize().multiplyScalar(globeRadius + Math.min(distance * 0.45, 0.8));

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const curvePoints = curve.getPoints(40);
      const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
      
      const curveMaterial = new THREE.LineDashedMaterial({
        color: 0x38bdf8,
        dashSize: 0.08,
        gapSize: 0.04,
        transparent: true,
        opacity: 0.75,
      });
      const curveLine = new THREE.Line(curveGeometry, curveMaterial);
      curveLine.computeLineDistances();
      routesGroup.add(curveLine);
    });
    scene.add(routesGroup);

    // 7. Lighting
    const ambientLight = new THREE.AmbientLight(0x0a1936, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xdbeafe, 3.2);
    keyLight.position.set(5, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    rimLight.position.set(-5, -3, -4);
    scene.add(rimLight);

    // 8. Interaction & Mouse Drag Controls
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotSpeedX = 0;
    let rotSpeedY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      setIsDragging(true);
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      // Raycast marker nodes
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markerMeshes);
      if (intersects.length > 0) {
        const found = intersects[0].object.userData as GeoPoint;
        setHoveredPoint(found);
      } else {
        setHoveredPoint(null);
      }

      if (isMouseDown) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        globeMesh.rotation.y += deltaX * 0.005;
        globeMesh.rotation.x += deltaY * 0.005;
        markersGroup.rotation.y = globeMesh.rotation.y;
        markersGroup.rotation.x = globeMesh.rotation.x;
        gridLines.rotation.y = globeMesh.rotation.y;
        gridLines.rotation.x = globeMesh.rotation.x;
        routesGroup.rotation.y = globeMesh.rotation.y;
        routesGroup.rotation.x = globeMesh.rotation.x;

        rotSpeedX = deltaX * 0.005;
        rotSpeedY = deltaY * 0.005;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseUp = () => {
      isMouseDown = false;
      setIsDragging(false);
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // 9. Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Gentle auto-rotation if not dragging and reduced motion disabled
      if (!isMouseDown && !reducedMotion) {
        rotSpeedX *= 0.95;
        rotSpeedY *= 0.95;
        const autoY = 0.002;
        globeMesh.rotation.y += autoY + rotSpeedX;
        globeMesh.rotation.x += rotSpeedY;
        markersGroup.rotation.y = globeMesh.rotation.y;
        markersGroup.rotation.x = globeMesh.rotation.x;
        gridLines.rotation.y = globeMesh.rotation.y;
        gridLines.rotation.x = globeMesh.rotation.x;
        routesGroup.rotation.y = globeMesh.rotation.y;
        routesGroup.rotation.x = globeMesh.rotation.x;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const currentH = typeof height === "number" ? height : container.clientHeight;
      camera.aspect = w / currentH;
      camera.updateProjectionMatrix();
      renderer.setSize(w, currentH);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      globeGeometry.dispose();
      globeMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [hasWebGL, reducedMotion, qualityTier, height, suppliers]);

  if (!hasWebGL) {
    return <SceneFallback title="Global Supplier Network" subtitle="Live supplier geolocation node matrix active" />;
  }

  return (
    <div className={`relative w-full rounded-3xl bg-[#0b0e17] border border-white/[0.08] overflow-hidden select-none group shadow-2xl ${className}`}>
      {/* 3D Canvas */}
      <div
        ref={mountRef}
        style={{ height }}
        className={`w-full cursor-grab ${isDragging ? "cursor-grabbing" : ""}`}
      />

      {/* Floating Header Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
          <span>Interactive 3D Sourcing Network</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">Drag to rotate globe &bull; Live supplier routes to delivery hub</p>
      </div>

      {/* Interactive Tooltip Card on Hover */}
      {hoveredPoint && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs z-20 p-3.5 rounded-2xl bg-[#141822]/95 border border-white/15 backdrop-blur-xl shadow-2xl text-xs space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white truncate max-w-[180px]">{hoveredPoint.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
              {hoveredPoint.score}% Fit
            </span>
          </div>
          <div className="text-[11px] text-gray-400 flex items-center justify-between">
            <span>Location: {hoveredPoint.country}</span>
            <span className="text-sky-400 font-mono text-[10px]">{hoveredPoint.lat.toFixed(2)}°N, {hoveredPoint.lng.toFixed(2)}°E</span>
          </div>
          {onSelectSupplier && (
            <button
              onClick={() => onSelectSupplier(hoveredPoint.id)}
              className="w-full mt-1 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition-colors"
            >
              Inspect Factory Dossier
            </button>
          )}
        </div>
      )}

      {/* Origin/Destination Hub Key */}
      <div className="absolute bottom-3 right-4 z-10 flex items-center gap-3 text-[10px] text-gray-400 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.06] pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>Origin Factory</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Delivery Hub</span>
        </div>
      </div>
    </div>
  );
};
