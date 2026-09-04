import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  MousePointer2,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  RotateCcw,
  Zap,
  Box,
  Copy,
  Check,
  Download,
  Upload,
  Info,
  Maximize2,
  Minimize2,
  Hexagon,
  Minus,
  PenTool,
  Sparkles,
  Plus,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Move,
  FlipHorizontal,
  FlipVertical,
  CheckCircle2,
  ArrowRight,
  Atom,
  Eye,
  Search,
  BookOpen,
  FlaskConical,
  X,
  Sliders
} from 'lucide-react';
import ThreeMoleculeViewer from '../ThreeMoleculeViewer';
import { useTheme } from '../../context/ThemeContext';
import {
  computeHillFormula,
  computeMolecularWeight,
  computeExactMass,
  generateGraphSMILES,
  parseSmilesTo2D,
  cleanUpStructure2D,
  computePhysicochemicalDescriptors,
  validateMolecularGraph,
  PERIODIC_ELEMENTS,
  STANDARD_VALENCES
} from '../../services/chemicalGraph';
import { FRAGMENT_LIBRARY, FRAGMENT_CATEGORIES, calculateFragmentAttachment } from '../../data/fragmentLibrary';

// Bond Definitions
const BOND_DEFINITIONS = [
  { id: 'single', label: 'Single Bond', order: 1, symbol: '—', desc: 'Standard single covalent bond' },
  { id: 'double', label: 'Double Bond', order: 2, symbol: '═', desc: 'Double covalent bond' },
  { id: 'triple', label: 'Triple Bond', order: 3, symbol: '≡', desc: 'Triple covalent bond' },
  { id: 'aromatic', label: 'Aromatic Bond', order: 1.5, symbol: '∷', desc: 'Delocalized aromatic bond' },
  { id: 'wedge', label: 'Wedge (Up)', order: 1, symbol: '▲', desc: 'Stereochemical bond pointing forward' },
  { id: 'dash', label: 'Hashed (Down)', order: 1, symbol: '▤', desc: 'Stereochemical bond pointing backward' },
  { id: 'wavy', label: 'Wavy (Unknown)', order: 1, symbol: '∿', desc: 'Undefined stereochemistry' }
];

// Ring Definitions
const RING_TEMPLATES = [
  { id: 'benzene', label: 'Benzene', sides: 6, aromatic: true, iconRadius: 10 },
  { id: 'cyclohexane', label: 'Cyclohexane', sides: 6, aromatic: false, iconRadius: 10 },
  { id: 'cyclopentane', label: 'Cyclopentane', sides: 5, aromatic: false, iconRadius: 9 },
  { id: 'cyclobutane', label: 'Cyclobutane', sides: 4, aromatic: false, iconRadius: 8 },
  { id: 'cyclopropane', label: 'Cyclopropane', sides: 3, aromatic: false, iconRadius: 8 },
  { id: 'cycloheptane', label: 'Cycloheptane', sides: 7, aromatic: false, iconRadius: 11 },
  { id: 'naphthalene', label: 'Naphthalene', sides: 10, fused: true, aromatic: true, iconRadius: 12 }
];

const COMMON_ELEMENTS = ['C', 'H', 'N', 'O', 'F', 'P', 'S', 'Cl', 'Br', 'I', 'B', 'Si', 'Al'];
const STANDARD_BOND_LENGTH = 50;

export default function ReactionCanvasDrawer({
  initialSmiles = '',
  onSmilesChange,
  onApplyToReaction,
  onApplyAsTarget,
  onOpenMechanism,
  title = 'Professional Reaction & Molecular Sketcher'
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Tools: 'select', 'eraser', 'bond', 'atom', 'ring', 'fragment', 'charge_pos', 'charge_neg', 'radical'
  const [selectedTool, setSelectedTool] = useState('bond');
  const [activeBondType, setActiveBondType] = useState('single');
  const [activeElement, setActiveElement] = useState('C');
  const [activeRing, setActiveRing] = useState('benzene');
  const [activeFragment, setActiveFragment] = useState(FRAGMENT_LIBRARY[0]);

  // Molecular Graph State
  const [atoms, setAtoms] = useState(() => {
    if (initialSmiles) {
      const p = parseSmilesTo2D(initialSmiles);
      if (p?.atoms?.length > 0) return p.atoms;
    }
    return [
      { id: 1, element: 'C', x: 260, y: 200, charge: 0 },
      { id: 2, element: 'C', x: 310, y: 170, charge: 0 },
      { id: 3, element: 'O', x: 360, y: 200, charge: 0 }
    ];
  });

  const [bonds, setBonds] = useState(() => {
    if (initialSmiles) {
      const p = parseSmilesTo2D(initialSmiles);
      if (p?.bonds?.length > 0) return p.bonds;
    }
    return [
      { id: 101, from: 1, to: 2, type: 'single', order: 1 },
      { id: 102, from: 2, to: 3, type: 'single', order: 1 }
    ];
  });

  // History Stack (60 levels)
  const [history, setHistory] = useState([{ atoms, bonds }]);
  const [historyStep, setHistoryStep] = useState(0);

  // Viewport / Zoom & Pan
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Selection & Hover State
  const [selectedAtomIds, setSelectedAtomIds] = useState([]);
  const [selectedBondIds, setSelectedBondIds] = useState([]);
  const [hoveredAtomId, setHoveredAtomId] = useState(null);
  const [hoveredBondId, setHoveredBondId] = useState(null);

  // Dragging / Drawing state
  const [isDraggingAtom, setIsDraggingAtom] = useState(false);
  const [dragStartMouse, setDragStartMouse] = useState(null);
  const [dragInitialPositions, setDragInitialPositions] = useState({});

  // Real-time Drawing Preview
  const [isDrawingBond, setIsDrawingBond] = useState(false);
  const [drawingStartAtomId, setDrawingStartAtomId] = useState(null);
  const [drawingStartPos, setDrawingStartPos] = useState(null);
  const [drawingCurrentPos, setDrawingCurrentPos] = useState(null);
  const [snapToAtomId, setSnapToAtomId] = useState(null);

  // 2D vs 3D View mode
  const [viewMode, setViewMode] = useState('2d');
  const [currentSmiles, setCurrentSmiles] = useState('');
  const [showPeriodicModal, setShowPeriodicModal] = useState(false);
  const [periodicSearch, setPeriodicSearch] = useState('');
  const [periodicCategory, setPeriodicCategory] = useState('all');
  const [showFragmentModal, setShowFragmentModal] = useState(false);
  const [fragmentSearch, setFragmentSearch] = useState('');
  const [fragmentCategory, setFragmentCategory] = useState('all');
  const [isCopied, setIsCopied] = useState(false);

  // Clipboard
  const [clipboard, setClipboard] = useState(null);

  // Push history
  const pushHistory = useCallback((newAtoms, newBonds) => {
    const nextHistory = history.slice(0, historyStep + 1);
    nextHistory.push({
      atoms: JSON.parse(JSON.stringify(newAtoms)),
      bonds: JSON.parse(JSON.stringify(newBonds))
    });
    if (nextHistory.length > 60) nextHistory.shift();
    setHistory(nextHistory);
    setHistoryStep(nextHistory.length - 1);
  }, [history, historyStep]);

  const handleUndo = useCallback(() => {
    if (historyStep > 0) {
      const state = history[historyStep - 1];
      setAtoms(JSON.parse(JSON.stringify(state.atoms)));
      setBonds(JSON.parse(JSON.stringify(state.bonds)));
      setHistoryStep(historyStep - 1);
      setSelectedAtomIds([]);
      setSelectedBondIds([]);
    }
  }, [history, historyStep]);

  const handleRedo = useCallback(() => {
    if (historyStep < history.length - 1) {
      const state = history[historyStep + 1];
      setAtoms(JSON.parse(JSON.stringify(state.atoms)));
      setBonds(JSON.parse(JSON.stringify(state.bonds)));
      setHistoryStep(historyStep + 1);
      setSelectedAtomIds([]);
      setSelectedBondIds([]);
    }
  }, [history, historyStep]);

  // Update SMILES & Telemetry when graph changes
  useEffect(() => {
    try {
      const smi = generateGraphSMILES(atoms, bonds);
      setCurrentSmiles(smi);
      if (onSmilesChange) onSmilesChange(smi);
    } catch {
      setCurrentSmiles('');
    }
  }, [atoms, bonds, onSmilesChange]);

  // Handle external initial SMILES change
  useEffect(() => {
    if (initialSmiles && initialSmiles !== currentSmiles) {
      try {
        const parsed = parseSmilesTo2D(initialSmiles);
        if (parsed?.atoms?.length > 0) {
          setAtoms(parsed.atoms);
          setBonds(parsed.bonds || []);
          pushHistory(parsed.atoms, parsed.bonds || []);
        }
      } catch {}
    }
  }, [initialSmiles]);

  // Descriptors calculation
  const descriptors = useMemo(() => {
    try {
      const formula = computeHillFormula(atoms, bonds);
      const mw = computeMolecularWeight(atoms);
      const exact = computeExactMass(atoms);
      const desc = computePhysicochemicalDescriptors(atoms, bonds);
      return { formula, mw, exact, ...desc };
    } catch {
      return null;
    }
  }, [atoms, bonds]);

  // Coordinate Conversion
  const screenToWorld = useCallback((screenX, screenY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: screenX, y: screenY };
    const rect = canvas.getBoundingClientRect();
    const clientX = screenX - rect.left;
    const clientY = screenY - rect.top;
    return {
      x: (clientX - panOffset.x) / zoom,
      y: (clientY - panOffset.y) / zoom
    };
  }, [panOffset, zoom]);

  // Intelligent Snapping (30 degree increments)
  const getSnappedPosition = useCallback((start, current) => {
    const dx = current.x - start.x;
    const dy = current.y - start.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 8) return start;
    const angle = Math.atan2(dy, dx);
    const snappedAngle = Math.round(angle / (Math.PI / 6)) * (Math.PI / 6);
    return {
      x: Math.round(start.x + Math.cos(snappedAngle) * STANDARD_BOND_LENGTH),
      y: Math.round(start.y + Math.sin(snappedAngle) * STANDARD_BOND_LENGTH)
    };
  }, []);

  // Structure 2D Layout Cleanup
  const handleCleanUp = () => {
    if (atoms.length === 0) return;
    try {
      const cleaned = cleanUpStructure2D(atoms, bonds);
      setAtoms(cleaned);
      pushHistory(cleaned, bonds);
    } catch (e) {
      console.warn('Structure cleanup warning:', e);
    }
  };

  // Helper: Create Ring Stamp
  const insertRingTemplate = (ringType, centerX, centerY) => {
    const rTpl = RING_TEMPLATES.find((r) => r.id === ringType) || RING_TEMPLATES[0];
    const newAtoms = [];
    const newBonds = [];
    const idOffset = Date.now();
    const radius = 45;

    if (rTpl.id === 'naphthalene') {
      // Fused naphthalene 10-carbon ring
      const napAtoms = [
        { x: -50, y: -25 }, { x: -25, y: -50 }, { x: 25, y: -50 }, { x: 50, y: -25 },
        { x: 50, y: 25 }, { x: 25, y: 50 }, { x: -25, y: 50 }, { x: -50, y: 25 },
        { x: 0, y: -25 }, { x: 0, y: 25 }
      ];
      napAtoms.forEach((pos, idx) => {
        newAtoms.push({
          id: idOffset + idx,
          element: 'C',
          x: Math.round(centerX + pos.x),
          y: Math.round(centerY + pos.y),
          charge: 0
        });
      });
      // Aromatic bonds
      const napBonds = [
        [0, 1], [1, 8], [8, 2], [2, 3], [3, 4], [4, 9], [9, 5], [5, 6], [6, 7], [7, 0], [8, 9]
      ];
      napBonds.forEach(([u, v], bIdx) => {
        newBonds.push({
          id: idOffset + 100 + bIdx,
          from: newAtoms[u].id,
          to: newAtoms[v].id,
          type: 'aromatic',
          order: 1.5
        });
      });
    } else {
      const sides = rTpl.sides || 6;
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        newAtoms.push({
          id: idOffset + i,
          element: 'C',
          x: Math.round(centerX + Math.cos(angle) * radius),
          y: Math.round(centerY + Math.sin(angle) * radius),
          charge: 0
        });
      }
      for (let i = 0; i < sides; i++) {
        const next = (i + 1) % sides;
        newBonds.push({
          id: idOffset + 100 + i,
          from: newAtoms[i].id,
          to: newAtoms[next].id,
          type: rTpl.aromatic ? 'aromatic' : 'single',
          order: rTpl.aromatic ? 1.5 : 1
        });
      }
    }

    const updatedAtoms = [...atoms, ...newAtoms];
    const updatedBonds = [...bonds, ...newBonds];
    setAtoms(updatedAtoms);
    setBonds(updatedBonds);
    pushHistory(updatedAtoms, updatedBonds);
  };

  // Canvas Mouse Down
  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    const { x, y } = screenToWorld(e.clientX, e.clientY);

    // 1. SELECT TOOL
    if (selectedTool === 'select') {
      if (hoveredAtomId) {
        setSelectedAtomIds([hoveredAtomId]);
        setSelectedBondIds([]);
        setIsDraggingAtom(true);
        setDragStartMouse({ x: e.clientX, y: e.clientY });
        const initPos = {};
        atoms.forEach((a) => {
          if (a.id === hoveredAtomId) initPos[a.id] = { x: a.x, y: a.y };
        });
        setDragInitialPositions(initPos);
        return;
      }
      if (hoveredBondId) {
        setSelectedBondIds([hoveredBondId]);
        setSelectedAtomIds([]);
        return;
      }
      setSelectedAtomIds([]);
      setSelectedBondIds([]);
    }

    // 2. BOND DRAWING TOOL (Click and drag)
    if (selectedTool === 'bond') {
      if (hoveredAtomId) {
        setIsDrawingBond(true);
        setDrawingStartAtomId(hoveredAtomId);
        const startAtom = atoms.find((a) => a.id === hoveredAtomId);
        setDrawingStartPos({ x: startAtom.x, y: startAtom.y });
        setDrawingCurrentPos({ x: startAtom.x, y: startAtom.y });
        return;
      } else {
        // Free space click -> create starting atom and begin continuous drag
        const newId = Date.now();
        const newAtom = { id: newId, element: activeElement, x: Math.round(x), y: Math.round(y), charge: 0 };
        const nextAtoms = [...atoms, newAtom];
        setAtoms(nextAtoms);
        setIsDrawingBond(true);
        setDrawingStartAtomId(newId);
        setDrawingStartPos({ x: Math.round(x), y: Math.round(y) });
        setDrawingCurrentPos({ x: Math.round(x), y: Math.round(y) });
        setSelectedAtomIds([newId]);
        return;
      }
    }

    // 3. RING TEMPLATE STAMP
    if (selectedTool === 'ring') {
      insertRingTemplate(activeRing, x, y);
      return;
    }

    // 4. FRAGMENT INSERTION / ATTACHMENT
    if (selectedTool === 'fragment' && activeFragment) {
      if (hoveredAtomId) {
        const target = atoms.find((a) => a.id === hoveredAtomId);
        if (target) {
          const res = calculateFragmentAttachment(target, bonds, atoms, activeFragment);
          const updatedAtoms = [...atoms, ...res.newAtoms];
          const updatedBonds = [...bonds, ...res.newBonds];
          setAtoms(updatedAtoms);
          setBonds(updatedBonds);
          pushHistory(updatedAtoms, updatedBonds);
          return;
        }
      } else {
        // Insert free fragment
        const idOff = Date.now();
        const newAtoms = activeFragment.atoms.map((fa, i) => ({
          id: idOff + i,
          element: fa.el,
          x: Math.round(x + fa.dx),
          y: Math.round(y + fa.dy),
          charge: fa.charge || 0
        }));
        const newBonds = activeFragment.bonds.map((fb, i) => ({
          id: idOff + 1000 + i,
          from: newAtoms[fb.fromIdx].id,
          to: newAtoms[fb.toIdx].id,
          type: fb.type || 'single',
          order: fb.order || 1
        }));
        const updatedAtoms = [...atoms, ...newAtoms];
        const updatedBonds = [...bonds, ...newBonds];
        setAtoms(updatedAtoms);
        setBonds(updatedBonds);
        pushHistory(updatedAtoms, updatedBonds);
        return;
      }
    }

    // 5. ATOM TOOL
    if (selectedTool === 'atom') {
      if (hoveredAtomId) {
        // Change element of existing atom
        const updated = atoms.map((a) => (a.id === hoveredAtomId ? { ...a, element: activeElement } : a));
        setAtoms(updated);
        pushHistory(updated, bonds);
      } else {
        const newId = Date.now();
        const newAtom = { id: newId, element: activeElement, x: Math.round(x), y: Math.round(y), charge: 0 };
        const updated = [...atoms, newAtom];
        setAtoms(updated);
        pushHistory(updated, bonds);
      }
      return;
    }

    // 6. CHARGE / RADICAL TOOLS
    if (selectedTool === 'charge_pos' && hoveredAtomId) {
      const updated = atoms.map((a) => (a.id === hoveredAtomId ? { ...a, charge: (a.charge || 0) + 1 } : a));
      setAtoms(updated);
      pushHistory(updated, bonds);
    }
    if (selectedTool === 'charge_neg' && hoveredAtomId) {
      const updated = atoms.map((a) => (a.id === hoveredAtomId ? { ...a, charge: (a.charge || 0) - 1 } : a));
      setAtoms(updated);
      pushHistory(updated, bonds);
    }
    if (selectedTool === 'radical' && hoveredAtomId) {
      const updated = atoms.map((a) => (a.id === hoveredAtomId ? { ...a, radical: !a.radical } : a));
      setAtoms(updated);
      pushHistory(updated, bonds);
    }

    // 7. ERASER TOOL
    if (selectedTool === 'eraser') {
      if (hoveredAtomId) {
        const updatedAtoms = atoms.filter((a) => a.id !== hoveredAtomId);
        const updatedBonds = bonds.filter((b) => b.from !== hoveredAtomId && b.to !== hoveredAtomId);
        setAtoms(updatedAtoms);
        setBonds(updatedBonds);
        pushHistory(updatedAtoms, updatedBonds);
      } else if (hoveredBondId) {
        const updatedBonds = bonds.filter((b) => b.id !== hoveredBondId);
        setBonds(updatedBonds);
        pushHistory(atoms, updatedBonds);
      }
    }
  };

  // Canvas Mouse Move
  const handleMouseMove = (e) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    const { x, y } = screenToWorld(e.clientX, e.clientY);

    // Atom Dragging
    if (isDraggingAtom && selectedAtomIds.length > 0) {
      const dx = (e.clientX - dragStartMouse.x) / zoom;
      const dy = (e.clientY - dragStartMouse.y) / zoom;
      const updated = atoms.map((a) => {
        if (dragInitialPositions[a.id]) {
          return {
            ...a,
            x: Math.round(dragInitialPositions[a.id].x + dx),
            y: Math.round(dragInitialPositions[a.id].y + dy)
          };
        }
        return a;
      });
      setAtoms(updated);
      return;
    }

    // Real-time Bond Drawing Drag
    if (isDrawingBond && drawingStartPos) {
      // Check for snap to nearby atom
      let targetSnapId = null;
      for (const a of atoms) {
        if (a.id !== drawingStartAtomId) {
          const d = Math.hypot(a.x - x, a.y - y);
          if (d < 16) {
            targetSnapId = a.id;
            break;
          }
        }
      }
      setSnapToAtomId(targetSnapId);

      if (targetSnapId) {
        const targetAtom = atoms.find((a) => a.id === targetSnapId);
        setDrawingCurrentPos({ x: targetAtom.x, y: targetAtom.y });
      } else {
        const snapped = getSnappedPosition(drawingStartPos, { x, y });
        setDrawingCurrentPos(snapped);
      }
      return;
    }

    // Detect Hovered Atom
    let foundAtom = null;
    for (const a of atoms) {
      if (Math.hypot(a.x - x, a.y - y) < 16) {
        foundAtom = a.id;
        break;
      }
    }
    setHoveredAtomId(foundAtom);

    // Detect Hovered Bond
    if (!foundAtom) {
      let foundBond = null;
      for (const bond of bonds) {
        const a1 = atoms.find((a) => a.id === bond.from);
        const a2 = atoms.find((a) => a.id === bond.to);
        if (a1 && a2) {
          const l2 = (a2.x - a1.x) ** 2 + (a2.y - a1.y) ** 2;
          if (l2 === 0) continue;
          let t = ((x - a1.x) * (a2.x - a1.x) + (y - a1.y) * (a2.y - a1.y)) / l2;
          t = Math.max(0, Math.min(1, t));
          const projX = a1.x + t * (a2.x - a1.x);
          const projY = a1.y + t * (a2.y - a1.y);
          if (Math.hypot(x - projX, y - projY) < 10) {
            foundBond = bond.id;
            break;
          }
        }
      }
      setHoveredBondId(foundBond);
    } else {
      setHoveredBondId(null);
    }
  };

  // Canvas Mouse Up
  const handleMouseUp = (e) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDraggingAtom) {
      setIsDraggingAtom(false);
      pushHistory(atoms, bonds);
      return;
    }

    // Complete Bond Drag Creation
    if (isDrawingBond && drawingStartAtomId && drawingCurrentPos) {
      if (snapToAtomId) {
        // Connect to existing atom
        const existing = bonds.find(
          (b) =>
            (b.from === drawingStartAtomId && b.to === snapToAtomId) ||
            (b.from === snapToAtomId && b.to === drawingStartAtomId)
        );

        if (existing) {
          // Cycle bond order
          const nextOrder = existing.order === 1 ? 2 : existing.order === 2 ? 3 : 1;
          const nextType = nextOrder === 2 ? 'double' : nextOrder === 3 ? 'triple' : 'single';
          const updatedBonds = bonds.map((b) =>
            b.id === existing.id ? { ...b, order: nextOrder, type: nextType } : b
          );
          setBonds(updatedBonds);
          pushHistory(atoms, updatedBonds);
        } else {
          const newBond = {
            id: Date.now(),
            from: drawingStartAtomId,
            to: snapToAtomId,
            type: activeBondType,
            order: activeBondType === 'double' ? 2 : activeBondType === 'triple' ? 3 : 1
          };
          const updatedBonds = [...bonds, newBond];
          setBonds(updatedBonds);
          pushHistory(atoms, updatedBonds);
        }
      } else {
        // Create new attached atom
        const newAtomId = Date.now();
        const newAtom = {
          id: newAtomId,
          element: activeElement,
          x: drawingCurrentPos.x,
          y: drawingCurrentPos.y,
          charge: 0
        };
        const newBond = {
          id: Date.now() + 1,
          from: drawingStartAtomId,
          to: newAtomId,
          type: activeBondType,
          order: activeBondType === 'double' ? 2 : activeBondType === 'triple' ? 3 : 1
        };
        const updatedAtoms = [...atoms, newAtom];
        const updatedBonds = [...bonds, newBond];
        setAtoms(updatedAtoms);
        setBonds(updatedBonds);
        pushHistory(updatedAtoms, updatedBonds);
        setSelectedAtomIds([newAtomId]);
      }

      setIsDrawingBond(false);
      setDrawingStartAtomId(null);
      setDrawingStartPos(null);
      setDrawingCurrentPos(null);
      setSnapToAtomId(null);
    }
  };

  const handleClearCanvas = () => {
    setAtoms([]);
    setBonds([]);
    setSelectedAtomIds([]);
    setSelectedBondIds([]);
    pushHistory([], []);
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* 1. TOP TOOLBAR & QUICK ACTIONS */}
      <div className="glass-panel p-3 rounded-2xl border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Tool Group Selector */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {[
              { id: 'select', label: 'Select / Drag', icon: MousePointer2 },
              { id: 'bond', label: 'Draw Bond', icon: Zap },
              { id: 'ring', label: 'Ring Stamp', icon: Hexagon },
              { id: 'atom', label: 'Atom', icon: Atom },
              { id: 'fragment', label: 'Fragment', icon: FlaskConical },
              { id: 'eraser', label: 'Eraser', icon: Eraser }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedTool(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  selectedTool === id
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Undo / Redo / Clean */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyStep <= 0}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyStep >= history.length - 1}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleCleanUp}
              className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition"
              title="2D Structure Cleanup & Geometry Optimization"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode & Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              viewMode === '3d'
                ? 'bg-violet-600 text-white border-violet-400 font-black shadow-md'
                : 'btn-secondary text-[var(--text-secondary)]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{viewMode === '3d' ? '2D CAD' : '3D Orbitals'}</span>
          </button>

          {onApplyToReaction && (
            <button
              onClick={() => onApplyToReaction(currentSmiles)}
              disabled={!currentSmiles}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Use as Reactant</span>
            </button>
          )}

          {onApplyAsTarget && (
            <button
              onClick={() => onApplyAsTarget(currentSmiles)}
              disabled={!currentSmiles}
              className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white font-black text-xs transition flex items-center gap-1.5 shadow-md"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Set as Retrosynthesis Target</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SUB-PALETTES: BONDS, RINGS, FRAGMENTS & ELEMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {/* Bond Type Selector */}
        <div className="glass-panel p-2.5 rounded-2xl border border-[var(--border-subtle)] space-y-1.5">
          <div className="text-[10px] font-black text-slate-400 uppercase">Bond Style:</div>
          <div className="flex flex-wrap gap-1">
            {BOND_DEFINITIONS.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setActiveBondType(b.id);
                  setSelectedTool('bond');
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition ${
                  activeBondType === b.id && selectedTool === 'bond'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black'
                    : 'bg-white/5 border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {b.symbol} {b.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Ring Stamps */}
        <div className="glass-panel p-2.5 rounded-2xl border border-[var(--border-subtle)] space-y-1.5">
          <div className="text-[10px] font-black text-slate-400 uppercase">Ring Templates:</div>
          <div className="flex flex-wrap gap-1">
            {RING_TEMPLATES.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setActiveRing(r.id);
                  setSelectedTool('ring');
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition ${
                  activeRing === r.id && selectedTool === 'ring'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black'
                    : 'bg-white/5 border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Common Elements */}
        <div className="glass-panel p-2.5 rounded-2xl border border-[var(--border-subtle)] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase">
            <span>Atom Palette:</span>
            <button
              onClick={() => setShowPeriodicModal(true)}
              className="text-cyan-400 hover:underline flex items-center gap-0.5"
            >
              <Search className="w-2.5 h-2.5" /> Periodic Table
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {COMMON_ELEMENTS.map((el) => (
              <button
                key={el}
                onClick={() => {
                  setActiveElement(el);
                  setSelectedTool('bond');
                }}
                className={`w-6 h-6 rounded-lg text-[11px] font-mono font-bold flex items-center justify-center border transition ${
                  activeElement === el
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black'
                    : 'bg-white/5 border-transparent text-slate-300 hover:text-white'
                }`}
              >
                {el}
              </button>
            ))}
          </div>
        </div>

        {/* Fragment Shortcuts */}
        <div className="glass-panel p-2.5 rounded-2xl border border-[var(--border-subtle)] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-black text-violet-400 uppercase">
            <span>Chemical Groups:</span>
            <button
              onClick={() => setShowFragmentModal(true)}
              className="text-violet-300 hover:underline flex items-center gap-0.5"
            >
              <BookOpen className="w-2.5 h-2.5" /> All Groups
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {FRAGMENT_LIBRARY.slice(0, 6).map((frag) => (
              <button
                key={frag.id}
                onClick={() => {
                  setActiveFragment(frag);
                  setSelectedTool('fragment');
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border transition ${
                  activeFragment?.id === frag.id && selectedTool === 'fragment'
                    ? 'bg-violet-600 text-white border-violet-400 font-black shadow-md'
                    : 'bg-white/5 border-transparent text-violet-300 hover:text-white'
                }`}
              >
                {frag.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. MAIN CANVAS VIEWPORT */}
      <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-cyan-500/30 bg-[#050811] shadow-2xl">
        {viewMode === '2d' ? (
          <>
            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, #06b6d4 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }}
            />

            {/* SVG Drawing Canvas */}
            <svg
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}>
                {/* BONDS */}
                {bonds.map((bond) => {
                  const a1 = atoms.find((a) => a.id === bond.from);
                  const a2 = atoms.find((a) => a.id === bond.to);
                  if (!a1 || !a2) return null;

                  const isHovered = hoveredBondId === bond.id;
                  const isSelected = selectedBondIds.includes(bond.id);
                  const strokeColor = isSelected ? '#a855f7' : isHovered ? '#38bdf8' : isDark ? '#94a3b8' : '#334155';

                  return (
                    <g key={bond.id}>
                      {bond.type === 'single' && (
                        <line
                          x1={a1.x}
                          y1={a1.y}
                          x2={a2.x}
                          y2={a2.y}
                          stroke={strokeColor}
                          strokeWidth={isSelected ? 3.5 : 2.5}
                          strokeLinecap="round"
                        />
                      )}
                      {bond.type === 'double' && (
                        <>
                          <line
                            x1={a1.x - 3}
                            y1={a1.y - 3}
                            x2={a2.x - 3}
                            y2={a2.y - 3}
                            stroke={strokeColor}
                            strokeWidth={2}
                            strokeLinecap="round"
                          />
                          <line
                            x1={a1.x + 3}
                            y1={a1.y + 3}
                            x2={a2.x + 3}
                            y2={a2.y + 3}
                            stroke={strokeColor}
                            strokeWidth={2}
                            strokeLinecap="round"
                          />
                        </>
                      )}
                      {bond.type === 'triple' && (
                        <>
                          <line
                            x1={a1.x}
                            y1={a1.y}
                            x2={a2.x}
                            y2={a2.y}
                            stroke={strokeColor}
                            strokeWidth={2}
                            strokeLinecap="round"
                          />
                          <line
                            x1={a1.x - 4}
                            y1={a1.y - 4}
                            x2={a2.x - 4}
                            y2={a2.y - 4}
                            stroke={strokeColor}
                            strokeWidth={2}
                            strokeLinecap="round"
                          />
                          <line
                            x1={a1.x + 4}
                            y1={a1.y + 4}
                            x2={a2.x + 4}
                            y2={a2.y + 4}
                            stroke={strokeColor}
                            strokeWidth={2}
                            strokeLinecap="round"
                          />
                        </>
                      )}
                      {bond.type === 'aromatic' && (
                        <line
                          x1={a1.x}
                          y1={a1.y}
                          x2={a2.x}
                          y2={a2.y}
                          stroke={strokeColor}
                          strokeWidth={2.5}
                          strokeDasharray="4 3"
                          strokeLinecap="round"
                        />
                      )}
                      {bond.type === 'wedge' && (
                        <polygon
                          points={`${a1.x},${a1.y} ${a2.x - 6},${a2.y + 4} ${a2.x + 6},${a2.y - 4}`}
                          fill={strokeColor}
                        />
                      )}
                      {bond.type === 'dash' && (
                        <line
                          x1={a1.x}
                          y1={a1.y}
                          x2={a2.x}
                          y2={a2.y}
                          stroke={strokeColor}
                          strokeWidth={3}
                          strokeDasharray="3 3"
                        />
                      )}
                    </g>
                  );
                })}

                {/* LIVE BOND PREVIEW LINE */}
                {isDrawingBond && drawingStartPos && drawingCurrentPos && (
                  <line
                    x1={drawingStartPos.x}
                    y1={drawingStartPos.y}
                    x2={drawingCurrentPos.x}
                    y2={drawingCurrentPos.y}
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                  />
                )}

                {/* ATOMS */}
                {atoms.map((atom) => {
                  const isHovered = hoveredAtomId === atom.id;
                  const isSelected = selectedAtomIds.includes(atom.id);
                  const isC = atom.element === 'C';

                  return (
                    <g key={atom.id} transform={`translate(${atom.x}, ${atom.y})`}>
                      {(isHovered || isSelected) && (
                        <circle
                          r={16}
                          fill={isSelected ? '#a855f720' : '#06b6d420'}
                          stroke={isSelected ? '#a855f7' : '#06b6d4'}
                          strokeWidth={1.5}
                        />
                      )}

                      {isC ? (
                        <circle r={4.5} fill={isSelected ? '#a855f7' : '#94a3b8'} />
                      ) : (
                        <>
                          <circle r={12} fill="#050811" />
                          <text
                            textAnchor="middle"
                            dy="0.35em"
                            fill={
                              atom.element === 'O'
                                ? '#f87171'
                                : atom.element === 'N'
                                ? '#60a5fa'
                                : atom.element === 'S'
                                ? '#facc15'
                                : atom.element === 'Cl' || atom.element === 'Br' || atom.element === 'F'
                                ? '#4ade80'
                                : '#ffffff'
                            }
                            fontSize="13"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {atom.element}
                          </text>
                        </>
                      )}

                      {atom.charge !== 0 && (
                        <text
                          x={9}
                          y={-7}
                          fill={atom.charge > 0 ? '#f87171' : '#38bdf8'}
                          fontSize="11"
                          fontWeight="black"
                        >
                          {atom.charge > 0 ? (atom.charge === 1 ? '⁺' : `⁺${atom.charge}`) : atom.charge === -1 ? '⁻' : `⁻${Math.abs(atom.charge)}`}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </>
        ) : (
          <ThreeMoleculeViewer
            smiles={currentSmiles || 'CC(=O)Oc1ccccc1C(=O)O'}
            height="100%"
            style="ball-stick"
          />
        )}

        {/* Bottom Telemetry Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-slate-300 pointer-events-auto flex items-center gap-3">
            <span>Formula: <strong className="text-cyan-300">{descriptors?.formula || 'N/A'}</strong></span>
            <span>• MW: <strong className="text-cyan-300">{descriptors?.mw ? `${descriptors.mw.toFixed(2)} g/mol` : 'N/A'}</strong></span>
            <span>• SMILES: <code className="text-violet-300">{currentSmiles || 'None'}</code></span>
          </div>

          <div className="bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/10 pointer-events-auto flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClearCanvas}
              className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400"
              title="Clear Canvas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. EXTENDED FRAGMENT LIBRARY MODAL */}
      {showFragmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl glass-panel p-6 rounded-3xl border border-violet-500/40 bg-[#060913] space-y-4 max-h-[85vh] flex flex-col text-xs text-[var(--text-primary)]">
            <div className="flex items-center justify-between border-b border-inherit pb-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-black uppercase text-white">
                  Chemical Fragment &amp; Group Library
                </h2>
              </div>
              <button
                onClick={() => setShowFragmentModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {FRAGMENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFragmentCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition whitespace-nowrap border ${
                    fragmentCategory === cat.id
                      ? 'bg-violet-600 text-white border-violet-400 font-black shadow-md'
                      : 'bg-white/5 border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-y-auto custom-scrollbar pr-1">
              {FRAGMENT_LIBRARY.filter(
                (f) => fragmentCategory === 'all' || f.category === fragmentCategory
              ).map((frag) => (
                <div
                  key={frag.id}
                  onClick={() => {
                    setActiveFragment(frag);
                    setSelectedTool('fragment');
                    setShowFragmentModal(false);
                  }}
                  className="p-3 rounded-2xl inner-box border border-white/5 hover:border-violet-500/50 hover:bg-violet-500/10 transition cursor-pointer space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-xs text-violet-300 font-bold group-hover:text-violet-200">
                      {frag.label}
                    </strong>
                    <span className="text-[10px] text-slate-500 font-mono">{frag.smiles}</span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-sans">{frag.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. PERIODIC TABLE MODAL */}
      {showPeriodicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl glass-panel p-6 rounded-3xl border border-cyan-500/40 bg-[#060913] space-y-4 max-h-[85vh] flex flex-col text-xs text-[var(--text-primary)]">
            <div className="flex items-center justify-between border-b border-inherit pb-3">
              <div className="flex items-center gap-2">
                <Atom className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-black uppercase text-white">Periodic Table Element Picker</h2>
              </div>
              <button
                onClick={() => setShowPeriodicModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 overflow-y-auto custom-scrollbar pr-1">
              {PERIODIC_ELEMENTS.map((el) => (
                <button
                  key={el.symbol}
                  onClick={() => {
                    setActiveElement(el.symbol);
                    setSelectedTool('bond');
                    setShowPeriodicModal(false);
                  }}
                  className="p-2.5 rounded-xl inner-box border border-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition flex flex-col items-center justify-center gap-0.5"
                >
                  <span className="text-[9px] text-slate-400">{el.number}</span>
                  <strong className="text-xs text-cyan-300 font-bold font-mono">{el.symbol}</strong>
                  <span className="text-[9px] text-slate-400 truncate w-full text-center">{el.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
