import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Layers, RotateCcw, Eye, Sliders, Info, Zap } from 'lucide-react';

export default function ThreeOrbitalViewer({ orbitalType = 'HOMO', orbitalEnergy = -5.85, isDark = true }) {
  const mountRef = useRef(null);
  const [selectedType, setSelectedType] = useState(orbitalType);
  const [density, setDensity] = useState(4000);
  const [isRotating, setIsRotating] = useState(true);
  const groupRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const pointLight1 = new THREE.PointLight(0x00f2fe, 2.0, 30);
    pointLight1.position.set(6, 6, 6);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff2a85, 1.8, 30);
    pointLight2.position.set(-6, -6, 6);
    scene.add(pointLight2);

    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    // Build Orbital Point Cloud Isosurface
    buildQuantumOrbital3D(selectedType, density, group);

    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (groupRef.current && isRotating) {
        groupRef.current.rotation.y += 0.006;
        groupRef.current.rotation.x += 0.002;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      renderer.dispose();
    };
  }, [selectedType, density, isRotating]);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-950/95 dark:bg-[#07090e] rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-5 flex flex-col justify-between select-none">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-xs uppercase tracking-wider">3D Molecular Orbital Isosurface</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono font-bold border border-cyan-500/20">
                ψ(r) Wavefunction
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">Frontier Eigenstate Energy: {orbitalEnergy} eV</span>
          </div>
        </div>

        {/* Orbital Switcher */}
        <div className="flex items-center gap-1 bg-black/60 p-1.5 rounded-2xl border border-white/10 text-[10px] font-mono shadow-inner">
          {['HOMO', 'LUMO', 'HOMO-1', 'LUMO+1', '2p_z', '3d_z2', 'pi_star'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2.5 py-1 rounded-xl transition font-bold ${
                selectedType === type
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30 font-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-64 my-auto cursor-grab active:cursor-grabbing" />

      {/* Footer Controls & Legend */}
      <div className="z-10 bg-black/70 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 flex items-center justify-between text-xs text-gray-300">
        <div className="flex items-center gap-3">
          <div className="text-[10px]">
            <span className="text-cyan-400 font-mono font-bold">{selectedType}:</span>{' '}
            <span className="text-gray-400">{getOrbitalDescription(selectedType)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_#00f2fe]" />
            <span className="font-mono text-gray-300">+ Phase (ψ &gt; 0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-pink-500 inline-block shadow-[0_0_8px_#ff2a85]" />
            <span className="font-mono text-gray-300">- Phase (ψ &lt; 0)</span>
          </div>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            title={isRotating ? 'Pause Rotation' : 'Resume Rotation'}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin-slow' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

function buildQuantumOrbital3D(type, count, group) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const colorPositive = new THREE.Color(0x00f2fe);
  const colorNegative = new THREE.Color(0xff2a85);

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0, phase = 1;

    if (type === 'HOMO' || type === 'pi_star') {
      // Delocalized pi / conjugated dumbbell lobe pair
      const r = Math.pow(Math.random(), 1.4) * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const sinP = Math.sin(phi) * Math.sin(theta * 2);
      x = r * Math.cos(theta) * (0.8 + 0.5 * Math.abs(sinP));
      y = r * Math.sin(theta) * 0.6;
      z = (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 1.2);
      phase = (x * z >= 0) ? 1 : -1;
    } else if (type === 'LUMO' || type === 'LUMO+1') {
      // Antibonding orbital with node plane in center
      const r = Math.pow(Math.random(), 1.3) * 3.0;
      const theta = Math.random() * Math.PI * 2;
      const nodeFactor = Math.sin(3 * theta);
      x = r * Math.cos(theta);
      y = r * Math.sin(theta) * 0.7;
      z = (Math.random() > 0.5 ? 1 : -1) * (0.7 + Math.random() * 1.4);
      phase = nodeFactor >= 0 ? 1 : -1;
    } else if (type === 'HOMO-1') {
      // S-like sigma bonding envelope
      const r = Math.pow(Math.random(), 2.0) * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      x = r * Math.sin(phi) * Math.cos(theta) * 1.4;
      y = r * Math.sin(phi) * Math.sin(theta) * 0.9;
      z = r * Math.cos(phi) * 0.9;
      phase = 1;
    } else if (type === '2p_z') {
      const r = Math.pow(Math.random(), 1.5) * 2.6;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const cosP = Math.cos(phi);
      x = r * Math.sin(phi) * Math.cos(theta) * 0.6;
      y = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      z = r * cosP * 1.8;
      phase = z >= 0 ? 1 : -1;
    } else if (type === '3d_z2') {
      const r = Math.pow(Math.random(), 1.5) * 2.6;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const zLobe = 3 * Math.cos(phi) * Math.cos(phi) - 1;
      x = r * Math.sin(phi) * Math.cos(theta);
      y = r * Math.sin(phi) * Math.sin(theta);
      z = r * Math.cos(phi) * (1 + 0.8 * zLobe);
      phase = zLobe >= 0 ? 1 : -1;
    } else {
      // 1s Spherical
      const r = Math.pow(Math.random(), 2) * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      x = r * Math.sin(phi) * Math.cos(theta);
      y = r * Math.sin(phi) * Math.sin(theta);
      z = r * Math.cos(phi);
      phase = 1;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const c = phase > 0 ? colorPositive : colorNegative;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.055,
    vertexColors: true,
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending
  });

  const pointsMesh = new THREE.Points(geometry, material);
  group.add(pointsMesh);
}

function getOrbitalDescription(type) {
  switch (type) {
    case 'HOMO': return 'Highest Occupied Molecular Orbital. Governs electron nucleophilicity and reactivity.';
    case 'LUMO': return 'Lowest Unoccupied Molecular Orbital. Governs electrophilicity and reduction potential.';
    case 'HOMO-1': return 'Penultimate occupied orbital contributing to core molecular bonding skeleton.';
    case 'LUMO+1': return 'Higher-lying virtual orbital involved in electronic absorption and Rydberg states.';
    case '2p_z': return 'Dumbbell-shaped p-orbital aligned along Z with node at XY plane.';
    case '3d_z2': return 'Transition metal d-orbital with axial lobes and toroidal equatorial ring.';
    case 'pi_star': return 'Antibonding π* orbital characterized by nodal planes between bonded atoms.';
    default: return 'Quantum mechanical wave function electron probability density.';
  }
}
