import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

/**
 * Background3DCanvas
 * Sophisticated, performance-optimized, clean 3D scientific background.
 * Renders floating molecular geometries with subtle, calm lighting.
 * Free of random particles and clutter.
 */
export default function Background3DCanvas() {
  const mountRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sceneRef = useRef(null);
  const materialsRef = useRef({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera & Calm Scientific Fog
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const initialFogColor = isDark ? 0x08090d : 0xf8f9fb;
    scene.fog = new THREE.FogExp2(initialFogColor, 0.012);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 32);

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 1.05 : 0.95;
    container.appendChild(renderer.domElement);

    // 3. Balanced Studio Lighting (Neutral & Sophisticated)
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.9 : 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.6 : 1.2);
    keyLight.position.set(20, 25, 20);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x94a3b8, isDark ? 1.0 : 0.8);
    fillLight.position.set(-20, -15, -15);
    scene.add(fillLight);

    // 4. Physical Materials (Neutral Lab-Grade)
    const carbonMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x1e293b : 0x334155,
      metalness: 0.5,
      roughness: 0.25,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2
    });

    const hydrogenMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0xe2e8f0 : 0xffffff,
      metalness: 0.1,
      roughness: 0.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.85
    });

    const oxygenMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0xbe123c : 0xe11d48,
      metalness: 0.3,
      roughness: 0.2,
      clearcoat: 0.7,
      clearcoatRoughness: 0.2
    });

    const nitrogenMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x0369a1 : 0x0284c7,
      metalness: 0.3,
      roughness: 0.2,
      clearcoat: 0.7,
      clearcoatRoughness: 0.2
    });

    const bondMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x475569 : 0x94a3b8,
      metalness: 0.4,
      roughness: 0.3,
      transparent: true,
      opacity: 0.6
    });

    materialsRef.current = {
      carbonMat,
      hydrogenMat,
      oxygenMat,
      nitrogenMat,
      bondMat,
      ambientLight,
      keyLight,
      fillLight,
      renderer,
      scene
    };

    const sphereGeo = new THREE.SphereGeometry(1, 24, 24);

    function createBond(p1, p2, radius = 0.1) {
      const distance = p1.distanceTo(p2);
      const bondGeo = new THREE.CylinderGeometry(radius, radius, distance, 12);
      const mesh = new THREE.Mesh(bondGeo, bondMat);
      const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mesh.position.copy(midPoint);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
      return mesh;
    }

    // 5. 3D Benzene Molecule Structure
    const benzeneGroup = new THREE.Group();
    const benzeneRadius = 3.4;
    const benzeneAtoms = [];

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const cPos = new THREE.Vector3(
        benzeneRadius * Math.cos(angle),
        benzeneRadius * Math.sin(angle),
        0
      );
      const cMesh = new THREE.Mesh(sphereGeo, carbonMat);
      cMesh.scale.setScalar(0.75);
      cMesh.position.copy(cPos);
      benzeneGroup.add(cMesh);
      benzeneAtoms.push(cPos);

      const hPos = cPos.clone().multiplyScalar(1.42);
      const hMesh = new THREE.Mesh(sphereGeo, hydrogenMat);
      hMesh.scale.setScalar(0.42);
      hMesh.position.copy(hPos);
      benzeneGroup.add(hMesh);
      benzeneGroup.add(createBond(cPos, hPos, 0.07));
    }

    for (let i = 0; i < 6; i++) {
      const p1 = benzeneAtoms[i];
      const p2 = benzeneAtoms[(i + 1) % 6];
      benzeneGroup.add(createBond(p1, p2, 0.12));
    }

    benzeneGroup.position.set(-13, 6, -8);
    scene.add(benzeneGroup);

    // 6. 3D Water (H2O) Structure
    const waterGroup = new THREE.Group();
    const oPos = new THREE.Vector3(0, 0, 0);
    const oMesh = new THREE.Mesh(sphereGeo, oxygenMat);
    oMesh.scale.setScalar(0.95);
    waterGroup.add(oMesh);

    const h1Pos = new THREE.Vector3(1.3, 0.95, 0);
    const h1Mesh = new THREE.Mesh(sphereGeo, hydrogenMat);
    h1Mesh.scale.setScalar(0.42);
    h1Mesh.position.copy(h1Pos);
    waterGroup.add(h1Mesh);
    waterGroup.add(createBond(oPos, h1Pos, 0.08));

    const h2Pos = new THREE.Vector3(-1.3, 0.95, 0);
    const h2Mesh = new THREE.Mesh(sphereGeo, hydrogenMat);
    h2Mesh.scale.setScalar(0.42);
    h2Mesh.position.copy(h2Pos);
    waterGroup.add(h2Mesh);
    waterGroup.add(createBond(oPos, h2Pos, 0.08));

    waterGroup.position.set(14, 7, -10);
    scene.add(waterGroup);

    // 7. 3D Ammonia (NH3) Complex
    const nh3Group = new THREE.Group();
    const nPos = new THREE.Vector3(0, 0.4, 0);
    const nMesh = new THREE.Mesh(sphereGeo, nitrogenMat);
    nMesh.scale.setScalar(0.85);
    nh3Group.add(nMesh);

    const nhPositions = [
      new THREE.Vector3(0, -0.65, 1.2),
      new THREE.Vector3(1.05, -0.65, -0.6),
      new THREE.Vector3(-1.05, -0.65, -0.6)
    ];

    nhPositions.forEach((hP) => {
      const hM = new THREE.Mesh(sphereGeo, hydrogenMat);
      hM.scale.setScalar(0.4);
      hM.position.copy(hP);
      nh3Group.add(hM);
      nh3Group.add(createBond(nPos, hP, 0.08));
    });

    nh3Group.position.set(-11, -8, -9);
    scene.add(nh3Group);

    // 8. Minimal Geometric Fullerene Cage
    const fullereneGeo = new THREE.IcosahedronGeometry(4.8, 1);
    const fullereneMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x64748b : 0x94a3b8,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.18 : 0.12,
      roughness: 0.3
    });
    const fullereneMesh = new THREE.Mesh(fullereneGeo, fullereneMat);
    fullereneMesh.position.set(13, -8, -12);
    scene.add(fullereneMesh);

    // Smooth Parallax & Responsive Handling
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 1.5;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 1.5;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Calm Animation Loop (Subtle, non-distracting)
    let animationId;
    const clock = new THREE.Clock();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animate = () => {
      if (prefersReducedMotion) {
        renderer.render(scene, camera);
        return;
      }

      if (!document.hidden) {
        const t = clock.getElapsedTime();

        benzeneGroup.rotation.y = t * 0.06;
        benzeneGroup.rotation.x = Math.sin(t * 0.08) * 0.05;

        waterGroup.rotation.y = -t * 0.08;
        waterGroup.rotation.z = Math.cos(t * 0.09) * 0.06;

        nh3Group.rotation.x = t * 0.07;
        nh3Group.rotation.y = t * 0.05;

        fullereneMesh.rotation.y = t * 0.04;
        fullereneMesh.rotation.x = t * 0.03;

        camera.position.x += (targetMouseX * 1.2 - camera.position.x) * 0.02;
        camera.position.y += (-targetMouseY * 1.2 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sphereGeo.dispose();
      carbonMat.dispose();
      hydrogenMat.dispose();
      oxygenMat.dispose();
      nitrogenMat.dispose();
      bondMat.dispose();
      fullereneGeo.dispose();
      fullereneMat.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const { scene, renderer, ambientLight, keyLight } = materialsRef.current;
    if (!scene) return;

    const fogColor = isDark ? 0x08090d : 0xf8f9fb;
    scene.fog.color.setHex(fogColor);

    if (ambientLight) ambientLight.intensity = isDark ? 0.9 : 1.2;
    if (keyLight) keyLight.intensity = isDark ? 1.6 : 1.2;
    if (renderer) renderer.toneMappingExposure = isDark ? 1.05 : 0.95;
  }, [isDark]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
