import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CATEGORY_COLORS } from '../data/periodicData';
import { Play, Pause, RotateCcw, Orbit, Cloud, CircleDot, Activity } from 'lucide-react';

export default function ThreeAtomShell({ element }) {
  const mountRef = useRef(null);
  const groupRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animIdRef = useRef(null);

  // Visualization Model: 'bohr' | 'quantum' | 'nucleus'
  const [modelMode, setModelMode] = useState('bohr');
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1); // 0.5, 1, 2

  // Track mouse drag for intuitive rotation
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });

  const categoryColor = (element && CATEGORY_COLORS[element.category]) || '#00f2fe';

  useEffect(() => {
    if (!mountRef.current || !element) return;
    const container = mountRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(renderer.domElement);

    // Dynamic Lighting matching element category
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const primaryLight = new THREE.PointLight(categoryColor, 2.5, 30);
    primaryLight.position.set(5, 5, 6);
    scene.add(primaryLight);

    const rimLight = new THREE.PointLight(0xffffff, 1.2, 25);
    rimLight.position.set(-6, -4, -4);
    scene.add(rimLight);

    const rootGroup = new THREE.Group();
    groupRef.current = rootGroup;
    scene.add(rootGroup);

    // Build the active model
    if (modelMode === 'bohr') {
      buildBohrAtom3D(element, rootGroup, categoryColor);
    } else if (modelMode === 'quantum') {
      buildQuantumCloud3D(element, rootGroup, categoryColor);
    } else if (modelMode === 'nucleus') {
      buildNucleusCore3D(element, rootGroup, categoryColor);
    }

    // Animation Loop
    let angle = 0;
    const animate = () => {
      animIdRef.current = requestAnimationFrame(animate);

      if (isPlaying && groupRef.current) {
        const speedFactor = simSpeed;
        angle += 0.015 * speedFactor;

        // Auto-rotation around Y axis
        groupRef.current.rotation.y += 0.005 * speedFactor;

        // Animate individual components
        groupRef.current.children.forEach((child) => {
          if (child.userData && child.userData.isElectronRing) {
            child.rotation.z += child.userData.speed * speedFactor;
          }
          if (child.userData && child.userData.isQuantumCloud) {
            child.rotation.y += 0.008 * speedFactor;
            child.rotation.x += 0.004 * speedFactor;
          }
          if (child.userData && child.userData.isPulsingCore) {
            const scale = 1 + Math.sin(angle * 2) * 0.05;
            child.scale.set(scale, scale, scale);
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Mouse Interaction handlers for drag-to-rotate
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !groupRef.current) return;
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;

      groupRef.current.rotation.y += deltaX * 0.01;
      groupRef.current.rotation.x += deltaY * 0.01;

      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      domElem.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
    };
  }, [element, modelMode, isPlaying, simSpeed]);

  const resetCamera = () => {
    if (groupRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 8);
    }
  };

  // Compute electron configuration shells
  const shellCapacities = [2, 8, 18, 32, 32, 18, 8];
  let remElectrons = element.number;
  const shellBreakdown = [];
  for (let cap of shellCapacities) {
    if (remElectrons <= 0) break;
    const count = Math.min(remElectrons, cap);
    shellBreakdown.push(count);
    remElectrons -= count;
  }
  const valenceElectrons = shellBreakdown[shellBreakdown.length - 1] || 1;

  return (
    <div className="w-full h-full flex flex-col justify-between relative select-none">
      {/* Top Controls Overlay */}
      <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-auto">
        {/* Model Mode Switcher */}
        <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/15 text-[10px]">
          <button
            type="button"
            onClick={() => setModelMode('bohr')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition ${
              modelMode === 'bohr'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Bohr Revolving Orbital Shells"
          >
            <Orbit className="w-3 h-3" />
            <span>Bohr</span>
          </button>
          <button
            type="button"
            onClick={() => setModelMode('quantum')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition ${
              modelMode === 'quantum'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Quantum Electron Probability Cloud"
          >
            <Cloud className="w-3 h-3" />
            <span>Quantum Cloud</span>
          </button>
          <button
            type="button"
            onClick={() => setModelMode('nucleus')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition ${
              modelMode === 'nucleus'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Proton-Neutron Nuclear Core Lattice"
          >
            <CircleDot className="w-3 h-3" />
            <span>Nucleus</span>
          </button>
        </div>

        {/* Playback & Reset controls */}
        <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/15 text-[10px]">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded-lg text-slate-300 hover:text-white transition"
            title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
          </button>
          <button
            type="button"
            onClick={() => setSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 0.5 : 1)}
            className="px-1.5 py-0.5 rounded-lg font-mono text-[9px] font-bold text-slate-300 hover:text-white border border-white/10"
            title="Change Simulation Speed"
          >
            {simSpeed}x
          </button>
          <button
            type="button"
            onClick={resetCamera}
            className="p-1 rounded-lg text-slate-300 hover:text-white transition"
            title="Reset Perspective"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="w-full h-[220px] cursor-grab active:cursor-grabbing rounded-xl overflow-hidden"
        style={{
          background: `radial-gradient(circle at center, ${categoryColor}15 0%, #02040a 75%)`
        }}
      />

      {/* Bottom Telemetry HUD Bar */}
      <div className="mt-1 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: categoryColor }} />
          <span className="font-black text-white">{element.name}</span>
          <span className="text-slate-400">Z={element.number}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span>Shells: <span className="text-white font-bold">{shellBreakdown.join('•')}</span></span>
          <span className="border-l border-white/15 pl-2">
            Valence: <span className="text-cyan-400 font-bold">{valenceElectrons}e⁻</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODEL 1: BOHR ATOMIC ORBITAL SHELLS
══════════════════════════════════════════════════════════════════════════ */
function buildBohrAtom3D(element, group, categoryColor) {
  // 1. Emissive Nucleus Core with glowing binding halo
  const nucleusGroup = new THREE.Group();
  nucleusGroup.userData = { isPulsingCore: true };

  const protonCount = Math.min(element.number, 24);
  for (let i = 0; i < protonCount; i++) {
    const isProton = i % 2 === 0;
    const geom = new THREE.SphereGeometry(0.18, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: isProton ? new THREE.Color(categoryColor) : new THREE.Color(0x94a3b8),
      emissive: isProton ? new THREE.Color(categoryColor) : new THREE.Color(0x334155),
      emissiveIntensity: isProton ? 0.6 : 0.2,
      roughness: 0.2,
      metalness: 0.5
    });
    const mesh = new THREE.Mesh(geom, mat);
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = Math.pow(Math.random(), 0.5) * 0.45;
    mesh.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
    nucleusGroup.add(mesh);
  }

  // Nucleus ambient halo glow
  const haloGeom = new THREE.SphereGeometry(0.65, 24, 24);
  const haloMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(categoryColor),
    transparent: true,
    opacity: 0.18,
    wireframe: true
  });
  nucleusGroup.add(new THREE.Mesh(haloGeom, haloMat));
  group.add(nucleusGroup);

  // 2. Electron Shells
  const shellCapacities = [2, 8, 18, 32, 32, 18, 8];
  let remainingElectrons = element.number;
  const shells = [];

  for (let cap of shellCapacities) {
    if (remainingElectrons <= 0) break;
    const count = Math.min(remainingElectrons, cap);
    shells.push(count);
    remainingElectrons -= count;
  }

  // 3. Render 3D Revolving Orbits & Glowing Electrons
  shells.forEach((electronCount, shellIdx) => {
    const ringRadius = 1.1 + shellIdx * 0.65;
    const ringGroup = new THREE.Group();
    // Alternating speeds and tilts for dynamic gyroscope appearance
    const tiltX = (shellIdx * 0.4) + (shellIdx % 2 === 0 ? 0.2 : -0.2);
    const tiltY = (shellIdx * 0.25);
    ringGroup.rotation.x = tiltX;
    ringGroup.rotation.y = tiltY;
    ringGroup.userData = { isElectronRing: true, speed: 0.012 + (shellIdx * 0.004) };

    // Orbit Ring Line (Fine glowing torus or ring)
    const ringGeom = new THREE.RingGeometry(ringRadius - 0.012, ringRadius + 0.012, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(categoryColor),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringGroup.add(ringMesh);

    // Electrons on Ring
    for (let e = 0; e < electronCount; e++) {
      const theta = (e / electronCount) * Math.PI * 2;
      const electronGeom = new THREE.SphereGeometry(0.08, 16, 16);
      const electronMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: new THREE.Color(categoryColor),
        emissiveIntensity: 0.9,
        roughness: 0.1
      });
      const electronMesh = new THREE.Mesh(electronGeom, electronMat);

      const localX = ringRadius * Math.cos(theta);
      const localZ = ringRadius * Math.sin(theta);
      electronMesh.position.set(localX, 0, localZ);
      ringGroup.add(electronMesh);
    }

    group.add(ringGroup);
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   MODEL 2: QUANTUM ELECTRON PROBABILITY CLOUD
══════════════════════════════════════════════════════════════════════════ */
function buildQuantumCloud3D(element, group, categoryColor) {
  const particleGroup = new THREE.Group();
  particleGroup.userData = { isQuantumCloud: true };

  // Central glowing core
  const coreGeom = new THREE.SphereGeometry(0.35, 24, 24);
  const coreMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(categoryColor),
    emissive: new THREE.Color(categoryColor),
    emissiveIntensity: 1.0,
    roughness: 0.2
  });
  particleGroup.add(new THREE.Mesh(coreGeom, coreMat));

  // Particle swarm representing electron probability density (|ψ|²)
  const particleCount = Math.min(240 + element.number * 8, 900);
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const baseColor = new THREE.Color(categoryColor);
  const outerColor = new THREE.Color(0x38bdf8);

  for (let i = 0; i < particleCount; i++) {
    // Hydrogenic radial probability distribution approximation
    const u = Math.random();
    const radius = 0.5 + Math.pow(u, 0.4) * 2.8;

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Color gradient from center to periphery
    const mixRatio = radius / 3.3;
    const mixed = baseColor.clone().lerp(outerColor, mixRatio);
    colors[i * 3] = mixed.r;
    colors[i * 3 + 1] = mixed.g;
    colors[i * 3 + 2] = mixed.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const pointsMat = new THREE.PointsMaterial({
    size: 0.075,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(geometry, pointsMat);
  particleGroup.add(particleSystem);

  // Subtle quantum nodal shell rings
  for (let s = 1; s <= 3; s++) {
    const ringGeom = new THREE.RingGeometry(s * 0.9 - 0.01, s * 0.9 + 0.01, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(categoryColor),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 3 * s;
    particleGroup.add(ring);
  }

  group.add(particleGroup);
}

/* ══════════════════════════════════════════════════════════════════════════
   MODEL 3: NUCLEAR LATTICE CORE (PROTONS & NEUTRONS)
══════════════════════════════════════════════════════════════════════════ */
function buildNucleusCore3D(element, group, categoryColor) {
  const nucleusGroup = new THREE.Group();
  nucleusGroup.userData = { isPulsingCore: true };

  const Z = element.number; // Protons
  const approxNeutrons = Math.max(0, Math.round(element.mass) - Z); // Neutrons
  const totalNucleons = Math.min(Z + approxNeutrons, 48);

  const protonMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(categoryColor),
    emissive: new THREE.Color(categoryColor),
    emissiveIntensity: 0.5,
    roughness: 0.25,
    metalness: 0.4
  });

  const neutronMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x94a3b8),
    emissive: new THREE.Color(0x475569),
    emissiveIntensity: 0.2,
    roughness: 0.3,
    metalness: 0.6
  });

  // Dense sphere packing for nucleons
  for (let i = 0; i < totalNucleons; i++) {
    const isProton = i < Math.min(Z, totalNucleons / 2);
    const geom = new THREE.SphereGeometry(0.24, 18, 18);
    const mesh = new THREE.Mesh(geom, isProton ? protonMat : neutronMat);

    const phi = Math.acos(2 * (i / totalNucleons) - 1);
    const theta = Math.sqrt(totalNucleons * Math.PI) * phi;
    const r = 0.55 + Math.pow(Math.random(), 0.5) * 0.4;

    mesh.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
    nucleusGroup.add(mesh);
  }

  // Strong force binding energy shell
  const forcefieldGeom = new THREE.SphereGeometry(1.25, 24, 24);
  const forcefieldMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(categoryColor),
    wireframe: true,
    transparent: true,
    opacity: 0.22
  });
  nucleusGroup.add(new THREE.Mesh(forcefieldGeom, forcefieldMat));

  group.add(nucleusGroup);
}
