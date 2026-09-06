import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

/**
 * HeroScientificCanvas
 * Premium 3D WebGL background providing a subtle, scientific atmosphere
 * with rotating molecular geometry, electron orbital trajectories, and soft ambient depth.
 */
export default function HeroScientificCanvas() {
  const mountRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 3. Main Rotating Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Accent Palette based on theme
    const nodeColor = isDark ? 0x38bdf8 : 0x0284c7; // Cyan / Sky
    const bondColor = isDark ? 0x64748b : 0x94a3b8; // Subtle Slate
    const ringColor1 = isDark ? 0xf59e0b : 0xd97706; // Amber
    const ringColor2 = isDark ? 0x8b5cf6 : 0x7c3aed; // Violet
    const particleColor = isDark ? 0x38bdf8 : 0x0d9488; // Teal

    // 4. Create Molecular Hexagonal Lattice Ring
    const hexRadius = 4.8;
    const hexPoints = [];
    const numHexNodes = 6;
    const nodeMeshes = [];

    const sphereGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: nodeColor,
      transparent: true,
      opacity: isDark ? 0.85 : 0.65
    });

    for (let i = 0; i < numHexNodes; i++) {
      const angle = (i / numHexNodes) * Math.PI * 2;
      const x = Math.cos(angle) * hexRadius;
      const y = Math.sin(angle) * hexRadius;
      const z = (Math.sin(angle * 2) * 0.8);
      hexPoints.push(new THREE.Vector3(x, y, z));

      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(x, y, z);
      rootGroup.add(sphere);
      nodeMeshes.push(sphere);
    }

    // Connect Hexagon with Bonds
    const lineMat = new THREE.LineBasicMaterial({
      color: bondColor,
      transparent: true,
      opacity: isDark ? 0.35 : 0.25,
      linewidth: 1
    });

    for (let i = 0; i < numHexNodes; i++) {
      const nextIdx = (i + 1) % numHexNodes;
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        hexPoints[i],
        hexPoints[nextIdx]
      ]);
      const line = new THREE.Line(lineGeo, lineMat);
      rootGroup.add(line);
    }

    // Secondary Inner Tetrahedral Core
    const innerNodes = [
      new THREE.Vector3(0, 1.8, 0.5),
      new THREE.Vector3(-1.6, -1.0, 0.5),
      new THREE.Vector3(1.6, -1.0, 0.5),
      new THREE.Vector3(0, 0, -1.8)
    ];

    const innerSphereGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const innerSphereMat = new THREE.MeshBasicMaterial({
      color: ringColor1,
      transparent: true,
      opacity: isDark ? 0.9 : 0.7
    });

    innerNodes.forEach((pos) => {
      const mesh = new THREE.Mesh(innerSphereGeo, innerSphereMat);
      mesh.position.copy(pos);
      rootGroup.add(mesh);
    });

    // Inner Tetrahedral Bonds
    for (let i = 0; i < innerNodes.length; i++) {
      for (let j = i + 1; j < innerNodes.length; j++) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([innerNodes[i], innerNodes[j]]);
        const line = new THREE.Line(lineGeo, lineMat);
        rootGroup.add(line);
      }
    }

    // 5. Orbital Elliptical Rings
    const createOrbitalRing = (radiusX, radiusY, tiltX, tiltY, color, opacity) => {
      const curve = new THREE.EllipseCurve(
        0, 0,
        radiusX, radiusY,
        0, 2 * Math.PI,
        false,
        0
      );
      const points = curve.getPoints(64);
      const ringGeo = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, p.y, 0))
      );
      const ringMaterial = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        linewidth: 1
      });
      const ring = new THREE.Line(ringGeo, ringMaterial);
      ring.rotation.x = tiltX;
      ring.rotation.y = tiltY;
      return ring;
    };

    const ring1 = createOrbitalRing(6.2, 3.4, Math.PI / 3, Math.PI / 6, ringColor1, isDark ? 0.35 : 0.2);
    const ring2 = createOrbitalRing(7.0, 3.8, -Math.PI / 4, Math.PI / 4, ringColor2, isDark ? 0.3 : 0.18);
    const ring3 = createOrbitalRing(5.5, 5.5, Math.PI / 2.2, 0, nodeColor, isDark ? 0.25 : 0.15);

    rootGroup.add(ring1);
    rootGroup.add(ring2);
    rootGroup.add(ring3);

    // 6. Ambient Particle Cloud
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 22;
      positions[i + 1] = (Math.random() - 0.5) * 14;
      positions[i + 2] = (Math.random() - 0.5) * 12;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.12,
      transparent: true,
      opacity: isDark ? 0.6 : 0.4
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 7. Mouse Parallax Tracking
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = x * 0.4;
      targetRotationX = y * 0.3;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 8. Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (document.hidden) return;
      const elapsedTime = clock.getElapsedTime();

      // Slow elegant base rotation
      rootGroup.rotation.y += 0.003;
      rootGroup.rotation.x += 0.001;

      // Orbital Rings individual slow rotation
      ring1.rotation.z += 0.002;
      ring2.rotation.z -= 0.0025;
      ring3.rotation.z += 0.0015;

      // Soft mouse parallax interpolation
      mouseX += (targetRotationX - mouseX) * 0.05;
      mouseY += (targetRotationY - mouseY) * 0.05;
      rootGroup.position.x = mouseY * 1.5;
      rootGroup.position.y = mouseX * 1.2;

      // Gentle floating particles
      particleSystem.rotation.y = elapsedTime * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      lineMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [isDark]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-85 overflow-hidden"
      aria-hidden="true"
    />
  );
}
