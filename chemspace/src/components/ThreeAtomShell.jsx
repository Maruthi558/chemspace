import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CATEGORY_COLORS } from '../data/periodicData';

export default function ThreeAtomShell({ element }) {
  const mountRef = useRef(null);
  const groupRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || !element) return;
    const container = mountRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00f2fe, 1.5, 20);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const rootGroup = new THREE.Group();
    groupRef.current = rootGroup;
    scene.add(rootGroup);

    buildBohrAtom3D(element, rootGroup);

    let reqId;
    let angle = 0;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      angle += 0.02;

      if (groupRef.current) {
        groupRef.current.rotation.y += 0.005;

        // Rotate electron shells individually
        groupRef.current.children.forEach((child) => {
          if (child.userData && child.userData.isElectronRing) {
            child.rotation.z += child.userData.speed;
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      renderer.dispose();
    };
  }, [element]);

  return (
    <div className="w-full h-full min-h-[300px] bg-slate-950/80 rounded-xl border border-cyan-500/20 overflow-hidden relative">
      <div ref={mountRef} className="w-full h-full cursor-grab" />
      <div className="absolute bottom-2 left-3 right-3 text-center text-xs text-slate-400 bg-slate-900/80 backdrop-blur-md py-1 px-3 rounded-lg border border-slate-800 font-mono">
        {element.name} ({element.symbol}) • {element.config}
      </div>
    </div>
  );
}

function buildBohrAtom3D(element, group) {
  // 1. Nucleus (Protons & Neutrons cluster)
  const nucleusGroup = new THREE.Group();
  const protonCount = Math.min(element.number, 20);
  const categoryColor = CATEGORY_COLORS[element.category] || '#00f2fe';

  for (let i = 0; i < protonCount; i++) {
    const isProton = i % 2 === 0;
    const geom = new THREE.SphereGeometry(0.2, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: isProton ? new THREE.Color(categoryColor) : new THREE.Color(0x94a3b8),
      roughness: 0.3,
      metalness: 0.4
    });
    const mesh = new THREE.Mesh(geom, mat);
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = Math.pow(Math.random(), 0.5) * 0.45;
    mesh.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
    nucleusGroup.add(mesh);
  }
  group.add(nucleusGroup);

  // 2. Parse Electron Shells from atomic number
  const shellCapacities = [2, 8, 18, 32, 32, 18, 8];
  let remainingElectrons = element.number;
  const shells = [];

  for (let cap of shellCapacities) {
    if (remainingElectrons <= 0) break;
    const count = Math.min(remainingElectrons, cap);
    shells.push(count);
    remainingElectrons -= count;
  }

  // 3. Render 3D Revolving Orbits & Electrons
  shells.forEach((electronCount, shellIdx) => {
    const ringRadius = 1.2 + shellIdx * 0.8;
    const ringGroup = new THREE.Group();
    ringGroup.userData = { isElectronRing: true, speed: 0.015 + shellIdx * 0.005 };

    // Orbit Ring Line
    const ringGeom = new THREE.RingGeometry(ringRadius - 0.01, ringRadius + 0.01, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 2 + shellIdx * 0.3;
    ringGroup.add(ringMesh);

    // Electrons on Ring
    for (let e = 0; e < electronCount; e++) {
      const theta = (e / electronCount) * Math.PI * 2;
      const electronGeom = new THREE.SphereGeometry(0.09, 16, 16);
      const electronMat = new THREE.MeshStandardMaterial({
        color: 0x00f2fe,
        emissive: 0x00f2fe,
        emissiveIntensity: 0.8,
        roughness: 0.1
      });
      const electronMesh = new THREE.Mesh(electronGeom, electronMat);

      const localX = ringRadius * Math.cos(theta);
      const localY = ringRadius * Math.sin(theta);

      // Rotate with ring orientation
      const pos = new THREE.Vector3(localX, 0, localY);
      pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), shellIdx * 0.3);

      electronMesh.position.copy(pos);
      ringGroup.add(electronMesh);
    }

    group.add(ringGroup);
  });
}
