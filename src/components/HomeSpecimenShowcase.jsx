import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import {
  RotateCw,
  Sparkles,
  Maximize2,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Compass,
  Atom,
  Info,
  PenTool,
  Cpu
} from 'lucide-react';
import { MOLECULES, ELEMENT_PROPERTIES } from '../data/moleculeData';
import { useTheme } from '../context/ThemeContext';

// Extended scientific metadata for the featured homepage specimens
const SPECIMEN_METRICS = {
  caffeine: {
    logP: '-0.07',
    tpsa: '58.4 Å²',
    rotBonds: 0,
    hDonors: 0,
    hAcceptors: 3,
    classDesc: 'Purine alkaloid reversible adenosine A1/A2A antagonist',
    significance: 'Stimulates neuronal alertness and metabolic rate; model system for xanthine crystallography.'
  },
  aspirin: {
    logP: '1.19',
    tpsa: '63.6 Å²',
    rotBonds: 3,
    hDonors: 1,
    hAcceptors: 3,
    classDesc: 'Salicylate ester non-steroidal anti-inflammatory (NSAID)',
    significance: 'Irreversibly acetylates active-site serine residues in COX-1/COX-2 enzymes to inhibit prostaglandin synthesis.'
  },
  benzene: {
    logP: '2.13',
    tpsa: '0.0 Å²',
    rotBonds: 0,
    hDonors: 0,
    hAcceptors: 0,
    classDesc: 'Planar D6h aromatic hydrocarbon',
    significance: 'Benchmark ring for Hückel 4n+2 pi-electron delocalization and resonance stabilization energy (~150 kJ/mol).'
  },
  water: {
    logP: '-1.38',
    tpsa: '1.0 Å²',
    rotBonds: 0,
    hDonors: 2,
    hAcceptors: 1,
    classDesc: 'Polar inorganic hydride solvent',
    significance: 'Forms tetrahedral hydrogen-bonding networks responsible for high specific heat, surface tension, and liquid density anomalies.'
  },
  ethanol: {
    logP: '-0.31',
    tpsa: '20.2 Å²',
    rotBonds: 1,
    hDonors: 1,
    hAcceptors: 1,
    classDesc: 'Primary aliphatic alcohol',
    significance: 'Amphiphilic solvent capable of dissolving both ionic salts and non-polar organics; key biochemical metabolite.'
  },
  dna: {
    logP: '-4.80',
    tpsa: '240.5 Å²',
    rotBonds: 8,
    hDonors: 4,
    hAcceptors: 8,
    classDesc: 'Deoxyribonucleic acid base-pair synthon',
    significance: 'Demonstrates directional Watson-Crick hydrogen bonding between purine and pyrimidine heterocyclic bases.'
  }
};

export default function HomeSpecimenShowcase() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Available specimens
  const specimens = MOLECULES.filter(m => SPECIMEN_METRICS[m.id]);
  const [activeId, setActiveId] = useState('caffeine');
  const [styleMode, setStyleMode] = useState('ball-stick'); // 'ball-stick' | 'space-filling'
  const [isSpinning, setIsSpinning] = useState(true);
  const [copiedSmiles, setCopiedSmiles] = useState(false);
  const [hoveredAtom, setHoveredAtom] = useState(null);

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const moleculeGroupRef = useRef(null);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });

  const currentMolecule = specimens.find(m => m.id === activeId) || specimens[0];
  const currentMetrics = SPECIMEN_METRICS[currentMolecule?.id] || {};

  // Three.js Render Lifecycle
  useEffect(() => {
    if (!mountRef.current || !currentMolecule) return;
    const container = mountRef.current;
    const width = container.clientWidth || 520;
    const height = container.clientHeight || 420;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 9);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Studio Lighting (Realistic Museum Lighting)
    const ambientLight = new THREE.AmbientLight(isDark ? 0xffffff : 0xf8fafc, isDark ? 0.85 : 1.1);
    scene.add(ambientLight);

    // Warm key light (golden hour warmth)
    const keyLight = new THREE.DirectionalLight(0xfef3c7, isDark ? 1.4 : 1.2);
    keyLight.position.set(8, 12, 10);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Cool fill light (deep indigo / slate fill)
    const fillLight = new THREE.DirectionalLight(isDark ? 0x93c5fd : 0x64748b, isDark ? 0.8 : 0.6);
    fillLight.position.set(-10, -6, -8);
    scene.add(fillLight);

    // Soft rim back-light
    const rimLight = new THREE.PointLight(0x38bdf8, isDark ? 1.0 : 0.6, 20);
    rimLight.position.set(0, 8, -6);
    scene.add(rimLight);

    // Molecule Geometry
    const group = new THREE.Group();
    moleculeGroupRef.current = group;
    scene.add(group);

    buildSpecimenGeometry(currentMolecule, styleMode, group);

    // Center and auto-scale
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 2);
    camera.position.z = Math.max(maxDim * 2.3, 7.5);
    group.position.sub(center);

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (isSpinning && group && !isDraggingRef.current) {
        group.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Mouse & Touch Controls
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !moleculeGroupRef.current) {
        // Raycast for atom hover
        const rect = renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(group.children, true);
        if (hits.length > 0 && hits[0].object.userData?.element) {
          setHoveredAtom(hits[0].object.userData);
        } else {
          setHoveredAtom(null);
        }
        return;
      }

      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;

      moleculeGroupRef.current.rotation.y += dx * 0.008;
      moleculeGroupRef.current.rotation.x += dy * 0.008;

      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z += e.deltaY * 0.006;
      cameraRef.current.position.z = Math.max(3, Math.min(24, cameraRef.current.position.z));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current?.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, [currentMolecule, styleMode, isDark, isSpinning]);

  const handleCopySmiles = () => {
    if (currentMolecule?.smiles) {
      navigator.clipboard.writeText(currentMolecule.smiles);
      setCopiedSmiles(true);
      setTimeout(() => setCopiedSmiles(false), 2000);
    }
  };

  return (
    <div className="art-card rounded-[32px] overflow-hidden border border-[var(--border-subtle)] p-6 lg:p-8 space-y-6">
      {/* Top Header: Section Identity & Molecule Switcher Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="telemetry-pill text-[10px]">
              <Compass className="w-3.5 h-3.5 text-amber-500" />
              <span>INTERACTIVE MOLECULAR ARCHIVE</span>
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              3D WEBGL ENGINE • ATOMIC CPK
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] font-serif-editorial">
            Specimen Examination &amp; Physical Geometry
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-sans max-w-xl">
            Examine validated 3D conformers with stereochemical bond angles, electronic coordination, and topological descriptors.
          </p>
        </div>

        {/* Specimen Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl inner-box">
          {specimens.map((spec) => {
            const isSelected = spec.id === activeId;
            return (
              <button
                key={spec.id}
                onClick={() => setActiveId(spec.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? isDark
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'bg-slate-900 text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                }`}
              >
                <span>{spec.name}</span>
                <span className="text-[10px] font-mono opacity-70">
                  {spec.formula}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Showcase Grid: 3D Canvas (Left) + Scientific Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 3D WebGL Canvas Viewport */}
        <div className="lg:col-span-7 h-[360px] sm:h-[420px] rounded-2xl relative overflow-hidden inner-box border border-[var(--border-subtle)] shadow-inner flex flex-col justify-between p-4">
          {/* Top Interactive Controls Overlay */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="telemetry-pill text-[10px] bg-black/40 backdrop-blur-md">
                <Atom className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono">{currentMolecule.name} ({currentMolecule.formula})</span>
              </span>
              {hoveredAtom && (
                <span className="telemetry-pill text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono animate-fadeIn">
                  Atom: {hoveredAtom.element} #{hoveredAtom.id}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/10">
              {/* Style Switcher */}
              <button
                onClick={() => setStyleMode(prev => prev === 'ball-stick' ? 'space-filling' : 'ball-stick')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition ${
                  styleMode === 'space-filling'
                    ? 'bg-amber-500 text-black'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Toggle Van der Waals Space-Filling Mode"
              >
                {styleMode === 'ball-stick' ? 'Ball & Stick' : 'Van der Waals'}
              </button>

              {/* Rotation Toggle */}
              <button
                onClick={() => setIsSpinning(prev => !prev)}
                className={`p-1.5 rounded-lg text-slate-300 hover:text-white transition ${
                  isSpinning ? 'text-amber-400' : 'opacity-60'
                }`}
                title={isSpinning ? 'Pause Auto-Spin' : 'Resume Auto-Spin'}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin-slow' : ''}`} />
              </button>

              {/* Reset Cam */}
              <button
                onClick={() => {
                  if (moleculeGroupRef.current) moleculeGroupRef.current.rotation.set(0, 0, 0);
                  if (cameraRef.current) cameraRef.current.position.set(0, 0, 9);
                }}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white transition"
                title="Reset Camera View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Three.js Mount DOM */}
          <div
            ref={mountRef}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0"
            title="Click and drag to rotate in 3D • Scroll to zoom"
          />

          {/* Bottom Helper Indicator */}
          <div className="z-10 flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] pointer-events-none pt-2">
            <span>DRAG TO ORBIT // SCROLL TO ZOOM</span>
            <span>SPEC: 3D MMFF94 CONFORMER</span>
          </div>
        </div>

        {/* Detailed Scientific Specimen Dossier */}
        <div className="lg:col-span-5 space-y-4">
          {/* Title & Classification */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                {currentMolecule.category}
              </span>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                {currentMolecule.molWeight}
              </span>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-serif-editorial">
              {currentMolecule.name}
            </h3>

            <p className="text-xs font-mono text-[var(--text-secondary)] italic">
              {currentMolecule.iupac}
            </p>
          </div>

          {/* Narrative Scientific Significance */}
          <div className="p-3.5 rounded-2xl inner-box border border-[var(--border-subtle)] space-y-2">
            <p className="text-xs text-[var(--text-primary)] font-sans leading-relaxed">
              {currentMolecule.description}
            </p>
            <div className="pt-2 border-t border-inherit text-[11px] text-[var(--text-secondary)] font-sans flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{currentMetrics.significance}</span>
            </div>
          </div>

          {/* Chemical Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl inner-box border border-[var(--border-subtle)]">
              <span className="block text-[9px] font-mono uppercase text-[var(--text-muted)] font-bold">LogP (Lipophil)</span>
              <span className="text-xs font-black font-mono text-[var(--text-primary)]">{currentMetrics.logP}</span>
            </div>
            <div className="p-2 rounded-xl inner-box border border-[var(--border-subtle)]">
              <span className="block text-[9px] font-mono uppercase text-[var(--text-muted)] font-bold">Polar Area</span>
              <span className="text-xs font-black font-mono text-[var(--text-primary)]">{currentMetrics.tpsa}</span>
            </div>
            <div className="p-2 rounded-xl inner-box border border-[var(--border-subtle)]">
              <span className="block text-[9px] font-mono uppercase text-[var(--text-muted)] font-bold">H-Bond Donors</span>
              <span className="text-xs font-black font-mono text-[var(--text-primary)]">{currentMetrics.hDonors}</span>
            </div>
            <div className="p-2 rounded-xl inner-box border border-[var(--border-subtle)]">
              <span className="block text-[9px] font-mono uppercase text-[var(--text-muted)] font-bold">Rot. Bonds</span>
              <span className="text-xs font-black font-mono text-[var(--text-primary)]">{currentMetrics.rotBonds}</span>
            </div>
          </div>

          {/* SMILES Notation Box */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl inner-box border border-[var(--border-subtle)] font-mono text-xs">
            <div className="truncate flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">SMILES:</span>
              <span className="truncate text-[var(--text-primary)]">{currentMolecule.smiles}</span>
            </div>
            <button
              onClick={handleCopySmiles}
              className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition shrink-0"
              title="Copy Canonical SMILES"
            >
              {copiedSmiles ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Direct Workbench Launch Triggers */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => navigate(`/chemdraw`)}
              className="btn-horizontal btn-primary text-xs font-bold flex-1"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Open in ChemDraw CAD</span>
            </button>
            <button
              onClick={() => navigate(`/rdkit-lab`)}
              className="btn-horizontal btn-secondary text-xs font-bold flex-1"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-500" />
              <span>Analyze in RDKit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Three.js Molecular Builder
function buildSpecimenGeometry(molecule, styleMode, group) {
  if (!molecule || !molecule.atoms) return;

  const atomMap = new Map();
  const isSpaceFilling = styleMode === 'space-filling';

  // 1. Atoms
  molecule.atoms.forEach((atom) => {
    const props = ELEMENT_PROPERTIES[atom.element] || { color: '#cccccc', radius: 0.6, vdw: 1.5 };
    const radius = isSpaceFilling ? props.vdw * 0.6 : props.radius * 0.55;

    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(props.color),
      roughness: 0.25,
      metalness: 0.25,
      clearcoat: 0.4,
      clearcoatRoughness: 0.15
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(atom.x, atom.y, atom.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { ...atom, ...props };

    group.add(mesh);
    atomMap.set(atom.id, atom);
  });

  // 2. Bonds (Only in Ball & Stick Mode)
  if (!isSpaceFilling && molecule.bonds) {
    molecule.bonds.forEach((bond) => {
      const atomA = atomMap.get(bond.from);
      const atomB = atomMap.get(bond.to);
      if (!atomA || !atomB) return;

      const posA = new THREE.Vector3(atomA.x, atomA.y, atomA.z);
      const posB = new THREE.Vector3(atomB.x, atomB.y, atomB.z);
      const bondOrder = bond.order || 1;
      const bondRadius = 0.085;

      const bondMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.35,
        metalness: 0.2
      });

      if (bondOrder === 1) {
        createCylinder(posA, posB, bondRadius, bondMat, group);
      } else if (bondOrder === 2) {
        const offset = 0.11;
        const dir = new THREE.Vector3().subVectors(posB, posA).normalize();
        const perp = new THREE.Vector3(-dir.y, dir.x, 0).normalize().multiplyScalar(offset);
        createCylinder(posA.clone().add(perp), posB.clone().add(perp), bondRadius * 0.8, bondMat, group);
        createCylinder(posA.clone().sub(perp), posB.clone().sub(perp), bondRadius * 0.8, bondMat, group);
      } else if (bondOrder === 3) {
        createCylinder(posA, posB, bondRadius * 0.7, bondMat, group);
        const offset = 0.13;
        const dir = new THREE.Vector3().subVectors(posB, posA).normalize();
        const perp = new THREE.Vector3(-dir.y, dir.x, 0).normalize().multiplyScalar(offset);
        createCylinder(posA.clone().add(perp), posB.clone().add(perp), bondRadius * 0.7, bondMat, group);
        createCylinder(posA.clone().sub(perp), posB.clone().sub(perp), bondRadius * 0.7, bondMat, group);
      }
    });
  }
}

function createCylinder(posA, posB, radius, material, group) {
  const distance = posA.distanceTo(posB);
  const geometry = new THREE.CylinderGeometry(radius, radius, distance, 16);
  const cylinder = new THREE.Mesh(geometry, material);

  cylinder.position.copy(posA).add(posB).multiplyScalar(0.5);
  cylinder.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3().subVectors(posB, posA).normalize()
  );
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;

  group.add(cylinder);
}
