import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ELEMENT_PROPERTIES } from '../data/moleculeData';
import { RotateCw, ZoomIn, ZoomOut, Eye, Sparkles, Maximize2, Layers, Ruler } from 'lucide-react';

export default function ThreeMoleculeViewer({ molecule, styleMode = 'ball-stick', onSelectAtom }) {
  const mountRef = useRef(null);
  const [selectedAtomInfo, setSelectedAtomInfo] = useState(null);
  const [selectedAtomsPair, setSelectedAtomsPair] = useState([]);
  const [distanceMeasurement, setDistanceMeasurement] = useState(null);
  const [isSpinning, setIsSpinning] = useState(true);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const moleculeGroupRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 1.2);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 0.9);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.1, 25);
    pointLight.position.set(0, 0, 8);
    scene.add(pointLight);

    const moleculeGroup = new THREE.Group();
    moleculeGroupRef.current = moleculeGroup;
    scene.add(moleculeGroup);

    buildMolecule3D(molecule, styleMode, moleculeGroup);

    const box = new THREE.Box3().setFromObject(moleculeGroup);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.z = Math.max(maxDim * 2.2, 6);
    moleculeGroup.position.sub(center);

    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (isSpinning && moleculeGroupRef.current && !isDraggingRef.current) {
        moleculeGroupRef.current.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !moleculeGroupRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      moleculeGroupRef.current.rotation.y += deltaX * 0.007;
      moleculeGroupRef.current.rotation.x += deltaY * 0.007;

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e) => {
      if (!cameraRef.current) return;
      e.preventDefault();
      cameraRef.current.position.z += e.deltaY * 0.005;
      cameraRef.current.position.z = Math.max(2, Math.min(30, cameraRef.current.position.z));
    };

    // Touchless Hand Gesture Zoom and Rotation Handlers
    const handleGestureZoom = (e) => {
      if (!cameraRef.current || !e.detail) return;
      const delta = e.detail.delta || 0;
      // Spread hands (delta > 0) zooms in (decreases z distance)
      cameraRef.current.position.z -= delta * 1.6;
      cameraRef.current.position.z = Math.max(2, Math.min(30, cameraRef.current.position.z));
    };

    const handleGestureRotate = (e) => {
      if (!moleculeGroupRef.current || !e.detail) return;
      moleculeGroupRef.current.rotation.y += (e.detail.deltaX || 0) * 0.015;
      moleculeGroupRef.current.rotation.x += (e.detail.deltaY || 0) * 0.015;
    };

    window.addEventListener('chemspace-gesture-zoom', handleGestureZoom);
    window.addEventListener('chemspace-gesture-rotate', handleGestureRotate);

    const handleClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(moleculeGroup.children, true);
      if (intersects.length > 0) {
        const atomData = intersects[0].object.userData;
        if (atomData && atomData.element) {
          const props = ELEMENT_PROPERTIES[atomData.element] || {};
          const fullInfo = { ...atomData, ...props };
          setSelectedAtomInfo(fullInfo);
          if (onSelectAtom) onSelectAtom(fullInfo);

          // Measure distance between consecutive atom selections
          setSelectedAtomsPair(prev => {
            const nextPair = [...prev, fullInfo].slice(-2);
            if (nextPair.length === 2) {
              const p1 = new THREE.Vector3(nextPair[0].x, nextPair[0].y, nextPair[0].z);
              const p2 = new THREE.Vector3(nextPair[1].x, nextPair[1].y, nextPair[1].z);
              const dist = p1.distanceTo(p2).toFixed(3);
              setDistanceMeasurement({ atom1: nextPair[0], atom2: nextPair[1], distance: dist });
            }
            return nextPair;
          });
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });
    dom.addEventListener('click', handleClick);

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('chemspace-gesture-zoom', handleGestureZoom);
      window.removeEventListener('chemspace-gesture-rotate', handleGestureRotate);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, [molecule, styleMode]);

  return (
    <div className="relative w-full h-full min-h-[440px] bg-gradient-to-b from-[#080c16] via-[#0c1424] to-[#070a12] rounded-2xl border border-cyan-500/25 overflow-hidden shadow-2xl group">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Control overlay */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 p-1.5 rounded-xl shadow-lg z-10">
        <button
          onClick={() => setIsSpinning(!isSpinning)}
          className={`p-2 rounded-lg transition-all ${isSpinning ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}`}
          title={isSpinning ? "Pause Auto-Spin" : "Start Auto-Spin"}
        >
          <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={() => {
            if (cameraRef.current) cameraRef.current.position.z = Math.max(3, cameraRef.current.position.z - 2);
          }}
          className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (cameraRef.current) cameraRef.current.position.z = Math.min(25, cameraRef.current.position.z + 2);
          }}
          className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (moleculeGroupRef.current) moleculeGroupRef.current.rotation.set(0, 0, 0);
          }}
          className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
          title="Reset View"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Tag */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 z-10 font-mono">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>Mode: <strong className="text-cyan-400 capitalize">{styleMode.replace('-', ' ')}</strong></span>
      </div>

      {/* Distance Measurement Badge */}
      {distanceMeasurement && (
        <div className="absolute top-16 left-4 bg-cyan-950/90 backdrop-blur-md border border-cyan-500/50 px-3 py-2 rounded-xl text-xs text-cyan-200 shadow-xl z-10 flex items-center gap-2 font-mono">
          <Ruler className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Distance ({distanceMeasurement.atom1.element}#{distanceMeasurement.atom1.id} ↔ {distanceMeasurement.atom2.element}#{distanceMeasurement.atom2.id}): <strong className="text-white">{distanceMeasurement.distance} Å</strong></span>
          <button onClick={() => setDistanceMeasurement(null)} className="ml-2 text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Selected Atom Info Panel */}
      {selectedAtomInfo && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-xs bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 p-4 rounded-xl shadow-xl z-10 text-xs text-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-slate-950 text-xs" style={{ backgroundColor: selectedAtomInfo.color || '#fff' }}>
                {selectedAtomInfo.element}
              </span>
              <span className="font-bold text-sm text-cyan-300">{selectedAtomInfo.name || selectedAtomInfo.element} Atom</span>
            </div>
            <button onClick={() => setSelectedAtomInfo(null)} className="text-slate-400 hover:text-white text-base">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div><span className="text-slate-400">Atomic Mass:</span> {selectedAtomInfo.mass} u</div>
            <div><span className="text-slate-400">Electroneg:</span> {selectedAtomInfo.electronegativity || 'N/A'}</div>
            <div><span className="text-slate-400">Valency:</span> {selectedAtomInfo.valency}</div>
            <div><span className="text-slate-400">VDW Radius:</span> {selectedAtomInfo.vdw} Å</div>
            <div className="col-span-2 text-slate-400 font-sans mt-1">
              Coords: ({selectedAtomInfo.x.toFixed(2)}, {selectedAtomInfo.y.toFixed(2)}, {selectedAtomInfo.z.toFixed(2)})
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildMolecule3D(molecule, styleMode, group) {
  if (!molecule || !molecule.atoms) return;

  const atomMap = new Map();
  const isSpaceFilling = styleMode === 'space-filling';
  const isWireframe = styleMode === 'wireframe';
  const isRibbon = styleMode === 'ribbon' || styleMode === 'cartoon';

  molecule.atoms.forEach((atom) => {
    const props = ELEMENT_PROPERTIES[atom.element] || { color: '#cccccc', radius: 0.6, vdw: 1.5 };
    const radius = isSpaceFilling ? props.vdw * 0.65 : isWireframe ? 0.2 : isRibbon ? props.radius * 0.4 : props.radius * 0.55;

    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    let material;

    if (isWireframe) {
      material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(props.color),
        wireframe: true
      });
    } else if (isRibbon) {
      material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(props.color),
        transparent: true,
        opacity: 0.85,
        shininess: 90
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(props.color),
        roughness: 0.25,
        metalness: 0.3,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1
      });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(atom.x, atom.y, atom.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { ...atom };

    group.add(mesh);
    atomMap.set(atom.id, atom);
  });

  if (!isSpaceFilling && molecule.bonds) {
    molecule.bonds.forEach((bond) => {
      const atomA = atomMap.get(bond.from);
      const atomB = atomMap.get(bond.to);
      if (!atomA || !atomB) return;

      const posA = new THREE.Vector3(atomA.x, atomA.y, atomA.z);
      const posB = new THREE.Vector3(atomB.x, atomB.y, atomB.z);
      const bondOrder = bond.order || 1;

      const bondRadius = isWireframe ? 0.04 : isRibbon ? 0.06 : 0.09;
      const bondMat = new THREE.MeshStandardMaterial({
        color: isWireframe ? 0x00f0ff : isRibbon ? 0x8b5cf6 : 0xaaaaaa,
        roughness: 0.3,
        metalness: 0.2
      });

      if (bondOrder === 1) {
        createCylinderBond(posA, posB, bondRadius, bondMat, group);
      } else if (bondOrder === 2) {
        const offset = 0.12;
        const dir = new THREE.Vector3().subVectors(posB, posA).normalize();
        const perp = new THREE.Vector3(-dir.y, dir.x, 0).normalize().multiplyScalar(offset);

        createCylinderBond(posA.clone().add(perp), posB.clone().add(perp), bondRadius * 0.8, bondMat, group);
        createCylinderBond(posA.clone().sub(perp), posB.clone().sub(perp), bondRadius * 0.8, bondMat, group);
      } else if (bondOrder === 3) {
        createCylinderBond(posA, posB, bondRadius * 0.7, bondMat, group);
        const offset = 0.14;
        const dir = new THREE.Vector3().subVectors(posB, posA).normalize();
        const perp = new THREE.Vector3(-dir.y, dir.x, 0).normalize().multiplyScalar(offset);
        createCylinderBond(posA.clone().add(perp), posB.clone().add(perp), bondRadius * 0.7, bondMat, group);
        createCylinderBond(posA.clone().sub(perp), posB.clone().sub(perp), bondRadius * 0.7, bondMat, group);
      }
    });
  }

  // Create electrostatic surface cloud in ribbon mode
  if (isRibbon) {
    const box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3());
    const surfaceGeo = new THREE.SphereGeometry(Math.max(size.x, size.y, size.z) * 0.6, 32, 32);
    const surfaceMat = new THREE.MeshPhongMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      wireframe: true
    });
    const cloud = new THREE.Mesh(surfaceGeo, surfaceMat);
    const center = box.getCenter(new THREE.Vector3());
    cloud.position.copy(center);
    group.add(cloud);
  }
}

function createCylinderBond(posA, posB, radius, material, group) {
  const distance = posA.distanceTo(posB);
  const geometry = new THREE.CylinderGeometry(radius, radius, distance, 16);
  const cylinder = new THREE.Mesh(geometry, material);

  const midpoint = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
  cylinder.position.copy(midpoint);

  const dir = new THREE.Vector3().subVectors(posB, posA).normalize();
  cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  group.add(cylinder);
}
