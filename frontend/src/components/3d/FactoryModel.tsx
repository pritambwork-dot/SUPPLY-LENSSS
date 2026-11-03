"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useSceneContext } from "./SceneProvider";
import { SceneFallback } from "./SceneFallback";

interface FactoryModelProps {
  className?: string;
  facilityType?: string; // "OEM Assembly" | "Precision Tooling" | "Chemical Processing" | "Packaging Plant"
  height?: number;
}

export const FactoryModel: React.FC<FactoryModelProps> = ({
  className = "",
  facilityType = "OEM Turnkey Manufacturing",
  height = 240,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { hasWebGL, reducedMotion, qualityTier } = useSceneContext();

  useEffect(() => {
    if (!hasWebGL) return;
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const h = height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / h, 0.1, 100);
    camera.position.set(4.2, 3.8, 5.0);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: qualityTier !== "mobile",
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Factory Facility Group
    const factoryGroup = new THREE.Group();

    // 1. Foundation Base Slab
    const slabGeom = new THREE.BoxGeometry(3.6, 0.15, 3.2);
    const slabMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.1,
    });
    const slab = new THREE.Mesh(slabGeom, slabMat);
    slab.position.y = -0.075;
    factoryGroup.add(slab);

    // 2. Main Production Hall
    const hallGeom = new THREE.BoxGeometry(2.2, 1.1, 1.8);
    const hallMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.3,
      roughness: 0.3,
      clearcoat: 0.5,
    });
    const hall = new THREE.Mesh(hallGeom, hallMat);
    hall.position.set(-0.3, 0.55, 0.1);
    factoryGroup.add(hall);

    // Sawtooth Roof Panels (Classic Industrial Architecture)
    for (let r = 0; r < 3; r++) {
      const roofGeom = new THREE.ConeGeometry(0.38, 0.35, 4);
      const roofMat = new THREE.MeshPhysicalMaterial({
        color: 0x2563eb, // SupplyLens electric blue accents
        roughness: 0.25,
        metalness: 0.2,
      });
      const roof = new THREE.Mesh(roofGeom, roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.set(-1.0 + r * 0.7, 1.25, 0.1);
      factoryGroup.add(roof);
    }

    // 3. Storage Silos (Cylindrical Storage Tanks)
    for (let s = 0; s < 2; s++) {
      const siloGeom = new THREE.CylinderGeometry(0.28, 0.28, 1.4, 24);
      const siloMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8, // Cyan metallic finish
        metalness: 0.75,
        roughness: 0.2,
        clearcoat: 0.8,
      });
      const silo = new THREE.Mesh(siloGeom, siloMat);
      silo.position.set(1.2, 0.7, -0.6 + s * 0.7);
      factoryGroup.add(silo);
    }

    // 4. Logistics Loading Dock Bay
    const bayGeom = new THREE.BoxGeometry(0.8, 0.6, 1.0);
    const bayMat = new THREE.MeshPhysicalMaterial({
      color: 0x111827,
      metalness: 0.4,
      roughness: 0.5,
    });
    const bay = new THREE.Mesh(bayGeom, bayMat);
    bay.position.set(1.1, 0.3, 0.7);
    factoryGroup.add(bay);

    scene.add(factoryGroup);

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0a1936, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xdbeafe, 3.2);
    keyLight.position.set(5, 6, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    // Subtle Cyan Point Light over production hall
    const dockLight = new THREE.PointLight(0x38bdf8, 2.0, 5);
    dockLight.position.set(0, 1.8, 0);
    scene.add(dockLight);

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!reducedMotion) {
        factoryGroup.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      slabGeom.dispose();
      hallGeom.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [hasWebGL, reducedMotion, qualityTier, height]);

  if (!hasWebGL) {
    return <SceneFallback title="Manufacturing Facility Model" subtitle={facilityType} />;
  }

  return (
    <div className={`relative w-full rounded-2xl bg-[#0a0d14] border border-white/[0.08] overflow-hidden ${className}`}>
      <div ref={mountRef} style={{ height }} className="w-full" />
      <div className="absolute bottom-2.5 left-3 z-10">
        <span className="text-[10px] font-mono text-gray-400 bg-black/50 px-2 py-0.5 rounded border border-white/[0.06]">
          3D Procedural Facility &bull; {facilityType}
        </span>
      </div>
    </div>
  );
};
