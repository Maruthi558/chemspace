import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

/**
 * Background3DCanvas
 * Sophisticated, performance-optimized 3D scientific background.
 * Renders floating molecular geometries, crystal bonds, and depth particles
 * that adapt dynamically to Light Mode (Ceramic/Crystal) and Dark Mode (Obsidian/Neon).
 */
export default function Background3DCanvas() {
  const mountRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Refs to update 3D scene properties without re-creating the entire WebGL context
  const sceneRef = useRef(null);
  const materialsRef = useRef({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera & Adaptive Fog
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const initialFogColor = isDark ? 0x030407 : 0xf8fafc;
    scene.fog = new THREE.FogExp2(initialFogColor, 0.015);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 30);

    // 2. WebGL Renderer with High-Fidelity Anti-aliasing
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 1.25 : 1.05;
    container.appendChild(renderer.domElement);

    // 3. Multi-point Dynamic Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.8 : 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(isDark ? 0x38bdf8 : 0x0284c7, isDark ? 2.8 : 2.0);
    keyLight.position.set(25, 30, 25);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(isDark ? 0xa855f7 : 0x7c3aed, isDark ? 2.0 : 1.5);
    fillLight.position.set(-25, -20, -15);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(isDark ? 0x34d399 : 0x059669, isDark ? 2.5 : 1.8, 60);
    rimLight.position.set(0, 5, 18);
    scene.add(rimLight);

    // 4. Physical Materials (CPK + Crystal Glass)
    const carbonMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x1e293b : 0x334155,
      metalness: isDark ? 0.85 : 0.4,
      roughness: 0.15,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1
    });

    const hydrogenMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0xf8fafc : 0xffffff,
      metalness: 0.1,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transmission: isDark ? 0.2 : 0.45,
      thickness: 0.8
    });

    const oxygenMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0xf43f5e : 0xe11d48,
      metalness: 0.3,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    const nitrogenMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x06b6d4 : 0x0284c7,
      metalness: 0.4,
      roughness: 0.15,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1
    });

    const bondMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x94a3b8 : 0x64748b,
      metalness: isDark ? 0.9 : 0.5,
      roughness: 0.2,
      transparent: true,
      opacity: isDark ? 0.75 : 0.6
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
      rimLight,
      renderer,
      scene
    };

    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);

    function createBond(p1, p2, radius = 0.12) {
      const distance = p1.distanceTo(p2);
      const bondGeo = new THREE.CylinderGeometry(radius, radius, distance, 16);
      const mesh = new THREE.Mesh(bondGeo, bondMat);
      const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mesh.position.copy(midPoint);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
      return mesh;
    }

    // 5. 3D Benzene Molecule Cluster
    const benzeneGroup = new THREE.Group();
    const benzeneRadius = 3.6;
    const benzeneAtoms = [];

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const cPos = new THREE.Vector3(
        benzeneRadius * Math.cos(angle),
        benzeneRadius * Math.sin(angle),
        0
      );
      const cMesh = new THREE.Mesh(sphereGeo, carbonMat);
      cMesh.scale.setScalar(0.85);
      cMesh.position.copy(cPos);
      benzeneGroup.add(cMesh);
      benzeneAtoms.push(cPos);

      // Hydrogen attachment
      const hPos = cPos.clone().multiplyScalar(1.48);
      const hMesh = new THREE.Mesh(sphereGeo, hydrogenMat);
      hMesh.scale.setScalar(0.46);
      hMesh.position.copy(hPos);
      benzeneGroup.add(hMesh);
      benzeneGroup.add(createBond(cPos, hPos, 0.08));
    }

    for (let i = 0; i < 6; i++) {
      const p1 = benzeneAtoms[i];
      const p2 = benzeneAtoms[(i + 1) % 6];
      benzeneGroup.add(createBond(p1, p2, 0.14));
    }

    benzeneGroup.position.set(-12, 6, -6);
    scene.add(benzeneGroup);

    // 6. 3D Water (H2O) Cluster
    const waterGroup = new THREE.Group();
    const oPos = new THREE.Vector3(0, 0, 0);
    const oMesh = new THREE.Mesh(sphereGeo, oxygenMat);
    oMesh.scale.setScalar(1.05);
    waterGroup.add(oMesh);

    const h1Pos = new THREE.Vector3(1.35, 1.05, 0);
    const h1Mesh = new THREE.Mesh(sphereGeo, hydrogenMat);
    h1Mesh.scale.setScalar(0.48);
    h1Mesh.position.copy(h1Pos);
    waterGroup.add(h1Mesh);
    waterGroup.add(createBond(oPos, h1Pos, 0.1));

    const h2Pos = new THREE.Vector3(-1.35, 1.05, 0);
    const h2Mesh = new THREE.Mesh(sphereGeo, hydrogenMat);
    h2Mesh.scale.setScalar(0.48);
    h2Mesh.position.copy(h2Pos);
    waterGroup.add(h2Mesh);
    waterGroup.add(createBond(oPos, h2Pos, 0.1));

    waterGroup.position.set(13, 8, -8);
    scene.add(waterGroup);

    // 7. 3D Ammonia (NH3) Pyramidal Complex
    const nh3Group = new THREE.Group();
    const nPos = new THREE.Vector3(0, 0.5, 0);
    const nMesh = new THREE.Mesh(sphereGeo, nitrogenMat);
    nMesh.scale.setScalar(0.95);
    nh3Group.add(nMesh);

    const nhPositions = [
      new THREE.Vector3(0, -0.75, 1.35),
      new THREE.Vector3(1.15, -0.75, -0.65),
      new THREE.Vector3(-1.15, -0.75, -0.65)
    ];

    nhPositions.forEach((hP) => {
      const hM = new THREE.Mesh(sphereGeo, hydrogenMat);
      hM.scale.setScalar(0.45);
      hM.position.copy(hP);
      nh3Group.add(hM);
      nh3Group.add(createBond(nPos, hP, 0.09));
    });

    nh3Group.position.set(-10, -9, -7);
    scene.add(nh3Group);

    // 8. 3D Fullerene / Molecular Cage
    const fullereneGeo = new THREE.IcosahedronGeometry(5.5, 1);
    const fullereneMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x06b6d4 : 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.22 : 0.15,
      roughness: 0.1
    });
    const fullereneMesh = new THREE.Mesh(fullereneGeo, fullereneMat);
    fullereneMesh.position.set(12, -7, -10);
    scene.add(fullereneMesh);

    // 9. Floating Spatial Ambient Particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 65;
      particlePos[i + 1] = (Math.random() - 0.5) * 65;
      particlePos[i + 2] = (Math.random() - 0.5) * 45;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: isDark ? 0.18 : 0.22,
      color: isDark ? 0x38bdf8 : 0x0284c7,
      transparent: true,
      opacity: isDark ? 0.35 : 0.22
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 10. Smooth Parallax & Responsive Handling
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 11. Efficient Animation Loop with Performance Guard
    let animationId;
    const clock = new THREE.Clock();

    const animate = () => {
      // Pause 3D animation if document is hidden to conserve GPU & battery
      if (!document.hidden) {
        const t = clock.getElapsedTime();

        // Slow, elegant 3D scientific rotations
        benzeneGroup.rotation.y = t * 0.10;
        benzeneGroup.rotation.x = Math.sin(t * 0.12) * 0.08;

        waterGroup.rotation.y = -t * 0.14;
        waterGroup.rotation.z = Math.cos(t * 0.16) * 0.12;

        nh3Group.rotation.x = t * 0.11;
        nh3Group.rotation.y = t * 0.08;

        fullereneMesh.rotation.y = t * 0.06;
        fullereneMesh.rotation.x = t * 0.04;

        particleSystem.rotation.y = t * 0.015;

        // Smooth camera interpolation for depth parallax
        camera.position.x += (targetMouseX * 1.8 - camera.position.x) * 0.025;
        camera.position.y += (-targetMouseY * 1.8 - camera.position.y) * 0.025;
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
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  // Dynamically update materials and fog when theme switches
  useEffect(() => {
    const { scene, renderer, carbonMat, hydrogenMat, bondMat, ambientLight, keyLight, fillLight } = materialsRef.current;
    if (!scene) return;

    const fogColor = isDark ? 0x030407 : 0xf8fafc;
    scene.fog.color.setHex(fogColor);

    if (ambientLight) ambientLight.intensity = isDark ? 0.8 : 1.4;
    if (keyLight) {
      keyLight.color.setHex(isDark ? 0x38bdf8 : 0x0284c7);
      keyLight.intensity = isDark ? 2.8 : 2.0;
    }
    if (fillLight) {
      fillLight.color.setHex(isDark ? 0xa855f7 : 0x7c3aed);
      fillLight.intensity = isDark ? 2.0 : 1.5;
    }
    if (carbonMat) {
      carbonMat.color.setHex(isDark ? 0x1e293b : 0x334155);
      carbonMat.metalness = isDark ? 0.85 : 0.4;
    }
    if (hydrogenMat) {
      hydrogenMat.color.setHex(isDark ? 0xf8fafc : 0xffffff);
      hydrogenMat.transmission = isDark ? 0.2 : 0.45;
    }
    if (bondMat) {
      bondMat.color.setHex(isDark ? 0x94a3b8 : 0x64748b);
      bondMat.opacity = isDark ? 0.75 : 0.6;
    }
    if (renderer) {
      renderer.toneMappingExposure = isDark ? 1.25 : 1.05;
    }
  }, [isDark]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
