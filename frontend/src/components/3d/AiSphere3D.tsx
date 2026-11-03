"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface AiSphere3DProps {
  className?: string;
  isAnalyzing?: boolean;
}

export const AiSphere3D: React.FC<AiSphere3DProps> = ({
  className = "",
  isAnalyzing = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 240;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    // 2. Renderer with anti-aliasing & alpha for seamless transparency
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Create Ribbed 3D Sphere Geometry
    const radius = 1.45;
    const segments = 120;
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const pos = geometry.attributes.position;
    const v = new THREE.Vector3();

    // Sculpt 18 vertical fluted ribs matching the Dribbble artwork
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const r = v.length();
      const theta = Math.acos(Math.min(Math.max(v.y / r, -1), 1)); // polar angle
      const phi = Math.atan2(v.z, v.x); // azimuthal angle

      const ribCount = 18;
      // Fluted ribs vanish at poles so top and bottom stay smooth
      const ribProfile = Math.sin(phi * ribCount);
      const taper = Math.sin(theta);
      const displacement = 0.13 * taper * (ribProfile * 0.75 + Math.sin(phi * ribCount * 2) * 0.1);

      v.normalize().multiplyScalar(r * (1.0 + displacement));
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geometry.computeVertexNormals();

    // 4. Physical Material with deep royal electric blue & specular sheen
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#2563eb"), // Electric vibrant blue
      emissive: new THREE.Color("#0f245c"), // Deep inner ambient glow
      emissiveIntensity: 0.35,
      roughness: 0.26,
      metalness: 0.12,
      clearcoat: 0.85,
      clearcoatRoughness: 0.18,
      reflectivity: 0.95,
      sheen: 0.5,
      sheenColor: new THREE.Color("#60a5fa"),
    });

    const sphereMesh = new THREE.Mesh(geometry, material);
    scene.add(sphereMesh);

    // 5. Lighting Setup
    // Soft ambient blue base
    const ambientLight = new THREE.AmbientLight(0x0a1936, 1.8);
    scene.add(ambientLight);

    // Main Key Light (cool white-cyan from top right)
    const keyLight = new THREE.DirectionalLight(0xdbeafe, 3.2);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    // Cyan Rim Light from bottom-left for dramatic 3D contour edge
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    rimLight.position.set(-4, -3, -3);
    scene.add(rimLight);

    // Interactive cursor tracking point light
    const cursorLight = new THREE.PointLight(0x60a5fa, 2.0, 10);
    cursorLight.position.set(0, 0, 3);
    scene.add(cursorLight);

    // 6. Mouse Tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x * 0.45;
      mouseRef.current.targetY = y * 0.35;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth interpolation for mouse tilt
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Base rotation + mouse tilt
      const speed = isAnalyzing ? 0.45 : 0.25;
      sphereMesh.rotation.y = elapsedTime * speed + mouseRef.current.x;
      sphereMesh.rotation.x = Math.sin(elapsedTime * 0.5) * 0.08 - mouseRef.current.y;
      sphereMesh.rotation.z = Math.cos(elapsedTime * 0.3) * 0.04;

      // Pulse breathing scale when analyzing
      if (isAnalyzing) {
        const pulse = 1.0 + Math.sin(elapsedTime * 2.5) * 0.02;
        sphereMesh.scale.set(pulse, pulse, pulse);
      }

      // Cursor light follow
      cursorLight.position.x = mouseRef.current.x * 3.5;
      cursorLight.position.y = mouseRef.current.y * 3.5;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isAnalyzing]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing ${className}`}
      style={{ minHeight: "220px" }}
    />
  );
};
