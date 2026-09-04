import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronRight,
  Maximize2,
  Minimize2,
  Hexagon,
  Minus,
  Activity,
  ShieldCheck,
  Search,
  PenTool,
  Sparkles,
  RefreshCw,
  Plus,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Move,
  FlipHorizontal,
  FlipVertical,
  X,
  AlertCircle,
  CheckCircle2,
  Share2,
  FileCode,
  Workflow
} from 'lucide-react';
import ThreeMoleculeViewer from './ThreeMoleculeViewer';
import { useTheme } from '../context/ThemeContext';
import {
  computeHillFormula,
  computeMolecularWeight,
  computeExactMass,
  generateGraphSMILES,
  parseSmilesTo2D,
  cleanUpStructure2D,
  exportToMolfileV2000,
  computePhysicochemicalDescriptors,
  validateMolecularGraph,
  PERIODIC_ELEMENTS,
  STANDARD_VALENCES
} from '../services/chemicalGraph';
import { logActivity } from '../services/activityStore';

// Bond Definitions
const BOND_DEFINITIONS = [
  { id: 'single', label: 'Single Bond', order: 1, symbol: '—', desc: 'Standard single covalent bond' },
  { id: 'double', label: 'Double Bond', order: 2, symbol: '═', desc: 'Double covalent bond' },
  { id: 'triple', label: 'Triple Bond', order: 3, symbol: '≡', desc: 'Triple covalent bond' },
  { id: 'aromatic', label: 'Aromatic Bond', order: 1.5, symbol: '∷', desc: 'Delocalized aromatic bond' },
  { id: 'wedge', label: 'Wedge (Up)', order: 1, symbol: '▲', desc: 'Stereochemical bond pointing forward' },
  { id: 'dash', label: 'Hashed (Down)', order: 1, symbol: '▤', desc: 'Stereochemical bond pointing backward' },
  { id: 'wavy', label: 'Wavy (Unknown)', order: 1, symbol: '∿', desc: 'Undefined or mixture stereochemistry' },
  { id: 'hbond', label: 'Hydrogen Bond', order: 0, symbol: '···', desc: 'Non-covalent hydrogen interaction' },
  { id: 'dative', label: 'Dative / Coordinate', order: 1, symbol: '→', desc: 'Coordinate covalent bond' }
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

// Common Elements for quick palette
const COMMON_ELEMENTS = ['C', 'H', 'N', 'O', 'F', 'P', 'S', 'Cl', 'Br', 'I', 'B', 'Si'];

const STANDARD_BOND_LENGTH = 50;

export default function ChemDrawStudio() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Studio Tools: 'select', 'eraser', 'bond', 'atom', 'ring', 'lasso', 'charge_pos', 'charge_neg'
  const [selectedTool, setSelectedTool] = useState('bond');
  const [activeBondType, setActiveBondType] = useState('single');
  const [activeElement, setActiveElement] = useState('C');
  const [activeRing, setActiveRing] = useState('benzene');

  // Molecular Graph State
  const [atoms, setAtoms] = useState([
    // Initial friendly starting structure: Ethanol
    { id: 1, element: 'C', x: 280, y: 250, charge: 0 },
    { id: 2, element: 'C', x: 330, y: 220, charge: 0 },
    { id: 3, element: 'O', x: 380, y: 250, charge: 0 }
  ]);
  const [bonds, setBonds] = useState([
    { id: 101, from: 1, to: 2, type: 'single', order: 1 },
    { id: 102, from: 2, to: 3, type: 'single', order: 1 }
  ]);

  // History Stack
  const [history, setHistory] = useState([
    {
      atoms: [
        { id: 1, element: 'C', x: 280, y: 250, charge: 0 },
        { id: 2, element: 'C', x: 330, y: 220, charge: 0 },
        { id: 3, element: 'O', x: 380, y: 250, charge: 0 }
      ],
      bonds: [
        { id: 101, from: 1, to: 2, type: 'single', order: 1 },
        { id: 102, from: 2, to: 3, type: 'single', order: 1 }
      ]
    }
  ]);
  const [historyStep, setHistoryStep] = useState(0);

  // Viewport / Zoom & Pan State
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Selection State
  const [selectedAtomIds, setSelectedAtomIds] = useState([]);
  const [selectedBondIds, setSelectedBondIds] = useState([]);
  const [hoveredAtomId, setHoveredAtomId] = useState(null);
  const [hoveredBondId, setHoveredBondId] = useState(null);

  // Dragging / Moving Atoms State
  const [isDraggingAtom, setIsDraggingAtom] = useState(false);
  const [dragStartMouse, setDragStartMouse] = useState(null);
  const [dragInitialAtomPositions, setDragInitialAtomPositions] = useState({});

  // Real-time Drawing Preview State
  const [isDrawingBond, setIsDrawingBond] = useState(false);
  const [drawingStartAtomId, setDrawingStartAtomId] = useState(null);
  const [drawingStartPos, setDrawingStartPos] = useState(null);
  const [drawingCurrentPos, setDrawingCurrentPos] = useState(null);
  const [snapToAtomId, setSnapToAtomId] = useState(null);

  // Box / Lasso Selection State
  const [isBoxSelecting, setIsBoxSelecting] = useState(false);
  const [boxSelectionStart, setBoxSelectionStart] = useState(null);
  const [boxSelectionEnd, setBoxSelectionEnd] = useState(null);

  // Clipboard
  const [clipboard, setClipboard] = useState(null);

  // Scientific Outputs
  const [smiles, setSmiles] = useState('');
  const [descriptors, setDescriptors] = useState(null);
  const [validationResult, setValidationResult] = useState({ valid: true, errors: [], warnings: [] });
  const [showValidationModal, setShowValidationModal] = useState(false);

  // UI Panels & Modals
  const [show3D, setShow3D] = useState(false);
  const [viewStyle3D, setViewStyle3D] = useState('ball-stick');
  const [isCopied, setIsCopied] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importSmilesText, setImportSmilesText] = useState('');
  const [showPeriodicModal, setShowPeriodicModal] = useState(false);
  const [periodicSearch, setPeriodicSearch] = useState('');
  const [periodicCategory, setPeriodicCategory] = useState('all');

  // Push new state to history stack
  const pushHistory = useCallback((newAtoms, newBonds) => {
    const nextHistory = history.slice(0, historyStep + 1);
    nextHistory.push({
      atoms: JSON.parse(JSON.stringify(newAtoms)),
      bonds: JSON.parse(JSON.stringify(newBonds))
    });
    // Cap history at 60 steps
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

  // Coordinate Conversion between Screen & Canvas World Coordinates
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

  const worldToScreen = useCallback((worldX, worldY) => {
    return {
      x: worldX * zoom + panOffset.x,
      y: worldY * zoom + panOffset.y
    };
  }, [panOffset, zoom]);

  // Intelligent Snapping during real-time drawing
  const getSnappedPosition = useCallback((start, current) => {
    const dx = current.x - start.x;
    const dy = current.y - start.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 8) return start;
    const angle = Math.atan2(dy, dx);
    // Snap angle to nearest 30 degrees (Math.PI / 6)
    const snappedAngle = Math.round(angle / (Math.PI / 6)) * (Math.PI / 6);
    return {
      x: Math.round(start.x + Math.cos(snappedAngle) * STANDARD_BOND_LENGTH),
      y: Math.round(start.y + Math.sin(snappedAngle) * STANDARD_BOND_LENGTH)
    };
  }, []);

  // Distance from point to line segment
  const getDistToSegment = (p, v, w) => {
    const l2 = Math.hypot(v.x - w.x, v.y - w.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePaste();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelection();
      } else if (e.key === 'Escape') {
        setSelectedAtomIds([]);
        setSelectedBondIds([]);
        setIsDrawingBond(false);
      } else if (e.key.toLowerCase() === 's') {
        setSelectedTool('select');
      } else if (e.key.toLowerCase() === 'e') {
        setSelectedTool('eraser');
      } else if (e.key.toLowerCase() === 'b') {
        setSelectedTool('bond');
      } else if (['c', 'n', 'o', 's', 'p', 'f', 'h', 'b', 'i'].includes(e.key.toLowerCase())) {
        setActiveElement(e.key.toUpperCase());
        setSelectedTool('atom');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [atoms, bonds, selectedAtomIds, selectedBondIds, clipboard, historyStep, history, handleUndo, handleRedo]);

  // Real-time Scientific & Graph Calculations
  useEffect(() => {
    if (atoms.length === 0) {
      setSmiles('');
      setDescriptors(null);
      setValidationResult({ valid: true, errors: [], warnings: [] });
      try { localStorage.removeItem('chemspace_active_mol'); } catch (e) {}
      return;
    }

    try {
      const generatedSmiles = generateGraphSMILES(atoms, bonds);
      setSmiles(generatedSmiles);
      const desc = computePhysicochemicalDescriptors(atoms, bonds);
      setDescriptors(desc);
      const val = validateMolecularGraph(atoms, bonds);
      setValidationResult(val);

      // Save active structure context for Quantum Chemistry
      if (generatedSmiles && val.errors.length === 0) {
        try {
          localStorage.setItem('chemspace_active_mol', JSON.stringify({
            smiles: generatedSmiles,
            formula: desc ? desc.formula : '',
            atoms: atoms.map(a => ({ element: a.element, x: (a.x - 400) / 50, y: -(a.y - 300) / 50, z: 0.0 }))
          }));
        } catch (e) {}
      }
    } catch (e) {
      console.error(e);
    }
  }, [atoms, bonds]);

  // Canvas Resize Listener
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        renderCanvas();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main Canvas Render Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    // 1. Grid Background
    ctx.fillStyle = isDark ? '#050608' : '#fafafa';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines with zoom & pan
    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.035)';
    ctx.lineWidth = 1;
    const gridSize = 40 * zoom;
    const offsetX = panOffset.x % gridSize;
    const offsetY = panOffset.y % gridSize;

    for (let x = offsetX; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = offsetY; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // 2. World Coordinate Transform
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // 3. Draw Box Selection
    if (isBoxSelecting && boxSelectionStart && boxSelectionEnd) {
      const x = Math.min(boxSelectionStart.x, boxSelectionEnd.x);
      const y = Math.min(boxSelectionStart.y, boxSelectionEnd.y);
      const w = Math.abs(boxSelectionEnd.x - boxSelectionStart.x);
      const h = Math.abs(boxSelectionEnd.y - boxSelectionStart.y);

      ctx.fillStyle = isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(14, 165, 233, 0.08)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.6)' : 'rgba(14, 165, 233, 0.6)';
      ctx.lineWidth = 1.5 / zoom;
      ctx.setLineDash([4 / zoom, 3 / zoom]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
    }

    // 4. Draw Bonds
    bonds.forEach((bond) => {
      const a = atoms.find((at) => at.id === bond.from);
      const b = atoms.find((at) => at.id === bond.to);
      if (!a || !b) return;

      const isSel = selectedBondIds.includes(bond.id);
      const isHov = hoveredBondId === bond.id;

      // Selection Halo
      if (isSel || isHov) {
        ctx.strokeStyle = isSel ? 'rgba(56, 189, 248, 0.5)' : 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Main Bond stroke
      ctx.strokeStyle = isDark ? '#e2e8f0' : '#1e293b';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      drawBondGraphic(ctx, a, b, bond.type, isDark);
    });

    // 5. Draw Real-time Bond Dragging Preview
    if (isDrawingBond && drawingStartPos && drawingCurrentPos) {
      ctx.save();
      const targetPos = snapToAtomId ? atoms.find((a) => a.id === snapToAtomId) : drawingCurrentPos;

      // Ghost preview line
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.85)' : 'rgba(14, 165, 233, 0.85)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      drawBondGraphic(ctx, drawingStartPos, targetPos, activeBondType, isDark);
      ctx.setLineDash([]);

      // Ghost target atom circle preview
      if (!snapToAtomId) {
        ctx.beginPath();
        ctx.arc(targetPos.x, targetPos.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = getElementColor(activeElement, isDark);
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = isDark ? '#ffffff' : '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = isDark ? '#ffffff' : '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(activeElement, targetPos.x, targetPos.y);
      }
      ctx.restore();
    }

    // 6. Draw Atoms
    atoms.forEach((atom) => {
      const isHov = hoveredAtomId === atom.id;
      const isSel = selectedAtomIds.includes(atom.id);
      const isSnap = snapToAtomId === atom.id;
      const isDrawingPivot = isDrawingBond && drawingStartAtomId === atom.id;

      // Valence error badge if applicable
      const hasValenceWarning = validationResult.warnings.some((w) => w.atomId === atom.id);
      const hasValenceError = validationResult.errors.some((e) => e.atomId === atom.id);

      const el = atom.element || 'C';
      const isHetero = el !== 'C' || isHov || isSel || isSnap || isDrawingPivot || atom.charge !== 0;

      if (isHetero) {
        // Outer atom disk
        ctx.beginPath();
        ctx.arc(atom.x, atom.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#0c0e12' : '#ffffff';
        ctx.fill();

        // Selection / Snap ring
        if (isSel) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.stroke();
        } else if (isSnap || isDrawingPivot) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.setLineDash([3, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (hasValenceError) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        } else if (hasValenceWarning) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (isHov) {
          ctx.strokeStyle = isDark ? '#64748b' : '#cbd5e1';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Element Symbol
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillStyle = getElementColor(el, isDark);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el, atom.x, atom.y);

        // Formal Charge Indicator (+ / -)
        if (atom.charge && atom.charge !== 0) {
          const chgText = atom.charge > 0 ? (atom.charge === 1 ? '⁺' : `⁺${atom.charge}`) : (atom.charge === -1 ? '⁻' : `⁻${Math.abs(atom.charge)}`);
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillStyle = atom.charge > 0 ? '#38bdf8' : '#f43f5e';
          ctx.fillText(chgText, atom.x + 11, atom.y - 8);
        }
      } else {
        // Carbon vertex dot
        ctx.beginPath();
        ctx.arc(atom.x, atom.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.fill();

        if (hasValenceWarning || hasValenceError) {
          ctx.strokeStyle = hasValenceError ? '#ef4444' : '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(atom.x, atom.y, 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    });

    ctx.restore();
  }, [
    atoms,
    bonds,
    selectedAtomIds,
    selectedBondIds,
    hoveredAtomId,
    hoveredBondId,
    isDark,
    zoom,
    panOffset,
    isDrawingBond,
    drawingStartPos,
    drawingCurrentPos,
    drawingStartAtomId,
    snapToAtomId,
    activeBondType,
    activeElement,
    isBoxSelecting,
    boxSelectionStart,
    boxSelectionEnd,
    validationResult
  ]);

  // Request Animation Frame Render Trigger
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Draw Specific Bond Types on Canvas Context
  const drawBondGraphic = (ctx, a, b, type, isDarkMode) => {
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const dist = Math.hypot(b.x - a.x, b.y - a.y);

    if (type === 'double') {
      const offset = 3.8;
      const dx = Math.sin(angle) * offset;
      const dy = Math.cos(angle) * offset;
      ctx.beginPath();
      ctx.moveTo(a.x + dx, a.y - dy);
      ctx.lineTo(b.x + dx, b.y - dy);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(a.x - dx, a.y + dy);
      ctx.lineTo(b.x - dx, b.y + dy);
      ctx.stroke();
    } else if (type === 'triple') {
      const offset = 5.5;
      const dx = Math.sin(angle) * offset;
      const dy = Math.cos(angle) * offset;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(a.x + dx, a.y - dy);
      ctx.lineTo(b.x + dx, b.y - dy);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(a.x - dx, a.y + dy);
      ctx.lineTo(b.x - dx, b.y + dy);
      ctx.stroke();
    } else if (type === 'aromatic') {
      // Solid base line + dashed inner line
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      const offset = 4.2;
      const dx = Math.sin(angle) * offset;
      const dy = Math.cos(angle) * offset;
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(a.x + dx, a.y - dy);
      ctx.lineTo(b.x + dx, b.y - dy);
      ctx.stroke();
      ctx.restore();
    } else if (type === 'wedge') {
      const width = 7.5;
      const dx = Math.sin(angle) * width;
      const dy = Math.cos(angle) * width;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x + dx, b.y - dy);
      ctx.lineTo(b.x - dx, b.y + dy);
      ctx.closePath();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
    } else if (type === 'dash') {
      const steps = 9;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const cx = a.x + (b.x - a.x) * t;
        const cy = a.y + (b.y - a.y) * t;
        const w = t * 7;
        const wx = Math.sin(angle) * w;
        const wy = Math.cos(angle) * w;
        ctx.beginPath();
        ctx.moveTo(cx + wx, cy - wy);
        ctx.lineTo(cx - wx, cy + wy);
        ctx.stroke();
      }
    } else if (type === 'wavy') {
      const steps = 14;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const cx = a.x + (b.x - a.x) * t;
        const cy = a.y + (b.y - a.y) * t;
        const waveAmp = (i % 2 === 0 ? 3.5 : -3.5);
        const wx = Math.sin(angle) * waveAmp;
        const wy = Math.cos(angle) * waveAmp;
        ctx.lineTo(cx + wx, cy - wy);
      }
      ctx.stroke();
    } else if (type === 'hbond') {
      ctx.save();
      ctx.strokeStyle = isDarkMode ? '#38bdf8' : '#0284c7';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
    } else if (type === 'dative') {
      // Line with arrowhead
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      const headLen = 9;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - headLen * Math.cos(angle - Math.PI / 6), b.y - headLen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - headLen * Math.cos(angle + Math.PI / 6), b.y - headLen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    } else {
      // Standard Single Bond
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  };

  // CPK Chemistry Color Palette
  const getElementColor = (el, isDarkMode) => {
    switch (el) {
      case 'H': return isDarkMode ? '#e2e8f0' : '#475569';
      case 'C': return isDarkMode ? '#f1f5f9' : '#0f172a';
      case 'O': return '#ef4444';
      case 'N': return '#3b82f6';
      case 'S': return '#eab308';
      case 'P': return '#f97316';
      case 'F': return '#10b981';
      case 'Cl': return '#22c55e';
      case 'Br': return '#b91c1c';
      case 'I': return '#9333ea';
      case 'B': return '#ec4899';
      case 'Si': return '#06b6d4';
      case 'Se': return '#14b8a6';
      default: return isDarkMode ? '#cbd5e1' : '#334155';
    }
  };

  // ----------------- INTERACTIVE POINTER HANDLING -----------------

  const handlePointerDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle click or Alt+Click for panning
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    if (e.button !== 0) return; // Only primary mouse button

    const world = screenToWorld(e.clientX, e.clientY);
    const clickedAtom = atoms.find((a) => Math.hypot(a.x - world.x, a.y - world.y) < 18);
    let clickedBond = null;
    if (!clickedAtom) {
      clickedBond = bonds.find((b) => {
        const a = atoms.find((at) => at.id === b.from);
        const bb = atoms.find((at) => at.id === b.to);
        return a && bb && getDistToSegment(world, a, bb) < 10;
      });
    }

    // 1. SELECT TOOL
    if (selectedTool === 'select') {
      if (clickedAtom) {
        if (e.shiftKey) {
          setSelectedAtomIds((prev) => (prev.includes(clickedAtom.id) ? prev.filter((id) => id !== clickedAtom.id) : [...prev, clickedAtom.id]));
        } else {
          const newSelected = selectedAtomIds.includes(clickedAtom.id) ? selectedAtomIds : [clickedAtom.id];
          setSelectedAtomIds(newSelected);
          setSelectedBondIds([]);
          // Prepare atom drag
          setIsDraggingAtom(true);
          setDragStartMouse(world);
          const initialPos = {};
          newSelected.forEach((id) => {
            const at = atoms.find((a) => a.id === id);
            if (at) initialPos[id] = { x: at.x, y: at.y };
          });
          setDragInitialAtomPositions(initialPos);
        }
      } else if (clickedBond) {
        if (e.shiftKey) {
          setSelectedBondIds((prev) => (prev.includes(clickedBond.id) ? prev.filter((id) => id !== clickedBond.id) : [...prev, clickedBond.id]));
        } else {
          setSelectedBondIds([clickedBond.id]);
          setSelectedAtomIds([]);
        }
      } else {
        // Start Box Selection
        if (!e.shiftKey) {
          setSelectedAtomIds([]);
          setSelectedBondIds([]);
        }
        setIsBoxSelecting(true);
        setBoxSelectionStart(world);
        setBoxSelectionEnd(world);
      }
      return;
    }

    // 2. ERASER TOOL
    if (selectedTool === 'eraser') {
      if (clickedAtom) {
        deleteAtom(clickedAtom.id);
      } else if (clickedBond) {
        deleteBond(clickedBond.id);
      }
      return;
    }

    // 3. CHARGE TOOLS (+ / -)
    if (selectedTool === 'charge_pos' || selectedTool === 'charge_neg') {
      if (clickedAtom) {
        const delta = selectedTool === 'charge_pos' ? 1 : -1;
        const newAtoms = atoms.map((a) => (a.id === clickedAtom.id ? { ...a, charge: (a.charge || 0) + delta } : a));
        setAtoms(newAtoms);
        pushHistory(newAtoms, bonds);
      }
      return;
    }

    // 4. ATOM PLACEMENT TOOL
    if (selectedTool === 'atom') {
      if (clickedAtom) {
        // Change existing atom's element
        const newAtoms = atoms.map((a) => (a.id === clickedAtom.id ? { ...a, element: activeElement } : a));
        setAtoms(newAtoms);
        pushHistory(newAtoms, bonds);
      } else {
        // Place new atom
        const newId = Date.now();
        const newAtoms = [...atoms, { id: newId, element: activeElement, x: Math.round(world.x), y: Math.round(world.y), charge: 0 }];
        setAtoms(newAtoms);
        pushHistory(newAtoms, bonds);
        setSelectedAtomIds([newId]);
      }
      return;
    }

    // 5. BOND DRAWING TOOL (Real-time Drag Drawing)
    if (selectedTool === 'bond') {
      if (clickedBond) {
        // Change bond type directly in-place
        const order = activeBondType === 'double' ? 2 : activeBondType === 'triple' ? 3 : activeBondType === 'aromatic' ? 1.5 : 1;
        const newBonds = bonds.map((b) => (b.id === clickedBond.id ? { ...b, type: activeBondType, order } : b));
        setBonds(newBonds);
        pushHistory(atoms, newBonds);
        return;
      }

      // Start drag drawing from clicked atom OR place new atom and drag from it
      setIsDrawingBond(true);
      if (clickedAtom) {
        setDrawingStartAtomId(clickedAtom.id);
        setDrawingStartPos({ x: clickedAtom.x, y: clickedAtom.y });
        setSelectedAtomIds([clickedAtom.id]);
      } else {
        const newId = Date.now();
        const newAtoms = [...atoms, { id: newId, element: activeElement, x: Math.round(world.x), y: Math.round(world.y), charge: 0 }];
        setAtoms(newAtoms);
        setDrawingStartAtomId(newId);
        setDrawingStartPos({ x: Math.round(world.x), y: Math.round(world.y) });
        setSelectedAtomIds([newId]);
      }
      setDrawingCurrentPos({ x: Math.round(world.x), y: Math.round(world.y) });
      return;
    }

    // 6. RING TOOLS (Placement, Attachment, and Bond-Fusion)
    if (selectedTool === 'ring') {
      if (clickedBond) {
        // FUSE RING ONTO BOND
        fuseRingOntoBond(clickedBond, activeRing);
      } else if (clickedAtom) {
        // ATTACH RING TO ATOM
        attachRingToAtom(clickedAtom, activeRing);
      } else {
        // PLACE STANDALONE RING
        placeStandaloneRing(world.x, world.y, activeRing);
      }
    }
  };

  const handlePointerMove = (e) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    const world = screenToWorld(e.clientX, e.clientY);

    // Hover Detection
    const nearAtom = atoms.find((a) => Math.hypot(a.x - world.x, a.y - world.y) < 18);
    setHoveredAtomId(nearAtom ? nearAtom.id : null);

    if (!nearAtom) {
      const nearBond = bonds.find((b) => {
        const a = atoms.find((at) => at.id === b.from);
        const bb = atoms.find((at) => at.id === b.to);
        return a && bb && getDistToSegment(world, a, bb) < 10;
      });
      setHoveredBondId(nearBond ? nearBond.id : null);
    } else {
      setHoveredBondId(null);
    }

    // Atom Dragging / Repositioning
    if (isDraggingAtom && dragStartMouse) {
      const dx = world.x - dragStartMouse.x;
      const dy = world.y - dragStartMouse.y;
      const newAtoms = atoms.map((a) => {
        if (dragInitialAtomPositions[a.id]) {
          return {
            ...a,
            x: Math.round(dragInitialAtomPositions[a.id].x + dx),
            y: Math.round(dragInitialAtomPositions[a.id].y + dy)
          };
        }
        return a;
      });
      setAtoms(newAtoms);
      return;
    }

    // Box Selection Drag
    if (isBoxSelecting && boxSelectionStart) {
      setBoxSelectionEnd(world);
      const minX = Math.min(boxSelectionStart.x, world.x);
      const maxX = Math.max(boxSelectionStart.x, world.x);
      const minY = Math.min(boxSelectionStart.y, world.y);
      const maxY = Math.max(boxSelectionStart.y, world.y);

      const enclosedAtomIds = atoms
        .filter((a) => a.x >= minX && a.x <= maxX && a.y >= minY && a.y <= maxY)
        .map((a) => a.id);
      setSelectedAtomIds(enclosedAtomIds);
      return;
    }

    // Real-time Bond Drag Preview & Angle/Atom Snapping
    if (isDrawingBond && drawingStartPos) {
      const snappedPos = getSnappedPosition(drawingStartPos, world);
      setDrawingCurrentPos(snappedPos);

      // Snap to existing atom within 18px radius
      const snapCandidate = atoms.find(
        (a) => a.id !== drawingStartAtomId && Math.hypot(a.x - snappedPos.x, a.y - snappedPos.y) < 20
      );
      setSnapToAtomId(snapCandidate ? snapCandidate.id : null);
    }
  };

  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isBoxSelecting) {
      setIsBoxSelecting(false);
      setBoxSelectionStart(null);
      setBoxSelectionEnd(null);
      return;
    }

    if (isDraggingAtom) {
      setIsDraggingAtom(false);
      setDragStartMouse(null);
      setDragInitialAtomPositions({});
      pushHistory(atoms, bonds);
      return;
    }

    // Finalize Bond Creation
    if (isDrawingBond && drawingStartPos && drawingCurrentPos) {
      const startId = drawingStartAtomId;
      let targetId = snapToAtomId;
      const nextAtoms = [...atoms];
      const nextBonds = [...bonds];

      if (!targetId) {
        // Create new destination atom
        targetId = Date.now() + 1;
        nextAtoms.push({
          id: targetId,
          element: activeElement,
          x: drawingCurrentPos.x,
          y: drawingCurrentPos.y,
          charge: 0
        });
      }

      if (startId && targetId && startId !== targetId) {
        const existingBond = nextBonds.find(
          (b) => (b.from === startId && b.to === targetId) || (b.from === targetId && b.to === startId)
        );

        const order = activeBondType === 'double' ? 2 : activeBondType === 'triple' ? 3 : activeBondType === 'aromatic' ? 1.5 : 1;

        if (existingBond) {
          existingBond.type = activeBondType;
          existingBond.order = order;
        } else {
          nextBonds.push({
            id: Date.now() + 2,
            from: startId,
            to: targetId,
            type: activeBondType,
            order
          });
        }

        setAtoms(nextAtoms);
        setBonds(nextBonds);
        pushHistory(nextAtoms, nextBonds);

        // Continue drawing seamlessly from the newly created atom
        setSelectedAtomIds([targetId]);
      }

      setIsDrawingBond(false);
      setDrawingStartAtomId(null);
      setDrawingStartPos(null);
      setDrawingCurrentPos(null);
      setSnapToAtomId(null);
    }
  };

  // ----------------- RING CONSTRUCTION OPERATIONS -----------------

  const placeStandaloneRing = (cx, cy, ringId) => {
    const template = RING_TEMPLATES.find((r) => r.id === ringId) || RING_TEMPLATES[0];
    const radius = 45;
    const baseId = Date.now();
    const newAtoms = [];
    const newBonds = [];

    if (template.fused) {
      // Naphthalene bicyclic 10-carbon system
      const leftCx = cx - 35;
      const rightCx = cx + 35;
      // 10 atoms
      const coords = [
        { x: leftCx - 40, y: cy - 25 }, { x: leftCx - 40, y: cy + 25 },
        { x: leftCx, y: cy + 45 }, { x: leftCx, y: cy - 45 },
        { x: rightCx, y: cy - 45 }, { x: rightCx + 40, y: cy - 25 },
        { x: rightCx + 40, y: cy + 25 }, { x: rightCx, y: cy + 45 },
        { x: cx, y: cy - 25 }, { x: cx, y: cy + 25 }
      ];
      coords.forEach((c, i) => newAtoms.push({ id: baseId + i, element: 'C', x: Math.round(c.x), y: Math.round(c.y), charge: 0 }));
      const edges = [[0,1],[1,2],[2,9],[9,8],[8,3],[3,0],[8,4],[4,5],[5,6],[6,7],[7,9]];
      edges.forEach(([u, v], i) => newBonds.push({ id: baseId + 20 + i, from: baseId + u, to: baseId + v, type: 'aromatic', order: 1.5 }));
    } else {
      const sides = template.sides;
      for (let i = 0; i < sides; i++) {
        const angle = (i * Math.PI * 2) / sides - Math.PI / 2;
        newAtoms.push({
          id: baseId + i,
          element: 'C',
          x: Math.round(cx + radius * Math.cos(angle)),
          y: Math.round(cy + radius * Math.sin(angle)),
          charge: 0
        });
      }
      for (let i = 0; i < sides; i++) {
        const nextIdx = (i + 1) % sides;
        newBonds.push({
          id: baseId + 20 + i,
          from: baseId + i,
          to: baseId + nextIdx,
          type: template.aromatic ? 'aromatic' : 'single',
          order: template.aromatic ? 1.5 : 1
        });
      }
    }

    const nextAtoms = [...atoms, ...newAtoms];
    const nextBonds = [...bonds, ...newBonds];
    setAtoms(nextAtoms);
    setBonds(nextBonds);
    pushHistory(nextAtoms, nextBonds);
  };

  const attachRingToAtom = (atom, ringId) => {
    const template = RING_TEMPLATES.find((r) => r.id === ringId) || RING_TEMPLATES[0];
    const radius = 45;
    const baseId = Date.now();
    const sides = template.sides;

    // Attach in direction away from existing neighbors
    const connectedBonds = bonds.filter((b) => b.from === atom.id || b.to === atom.id);
    let avgAngle = 0;
    if (connectedBonds.length > 0) {
      let sumDx = 0, sumDy = 0;
      connectedBonds.forEach((b) => {
        const otherId = b.from === atom.id ? b.to : b.from;
        const other = atoms.find((a) => a.id === otherId);
        if (other) {
          sumDx += other.x - atom.x;
          sumDy += other.y - atom.y;
        }
      });
      avgAngle = Math.atan2(sumDy, sumDx) + Math.PI; // Opposite direction
    }

    const ringCenter = {
      x: atom.x + (radius + STANDARD_BOND_LENGTH) * Math.cos(avgAngle),
      y: atom.y + (radius + STANDARD_BOND_LENGTH) * Math.sin(avgAngle)
    };

    placeStandaloneRing(ringCenter.x, ringCenter.y, ringId);
  };

  const fuseRingOntoBond = (bond, ringId) => {
    const a1 = atoms.find((a) => a.id === bond.from);
    const a2 = atoms.find((a) => a.id === bond.to);
    if (!a1 || !a2) return;

    const template = RING_TEMPLATES.find((r) => r.id === ringId) || RING_TEMPLATES[0];
    const sides = template.sides;
    const baseId = Date.now();

    // Bond vector and normal
    const dx = a2.x - a1.x;
    const dy = a2.y - a1.y;
    const len = Math.hypot(dx, dy) || 50;
    const nx = -dy / len;
    const ny = dx / len;

    const remainingSides = sides - 2;
    const newAtoms = [];
    const newBonds = [];

    let prevId = a1.id;
    for (let i = 1; i <= remainingSides; i++) {
      const t = i / (remainingSides + 1);
      const ringDepth = 48;
      const posX = Math.round(a1.x + dx * t + nx * ringDepth);
      const posY = Math.round(a1.y + dy * t + ny * ringDepth);

      const atomId = baseId + i;
      newAtoms.push({ id: atomId, element: 'C', x: posX, y: posY, charge: 0 });
      newBonds.push({
        id: baseId + 50 + i,
        from: prevId,
        to: atomId,
        type: template.aromatic ? 'aromatic' : 'single',
        order: template.aromatic ? 1.5 : 1
      });
      prevId = atomId;
    }
    // Close to a2
    newBonds.push({
      id: baseId + 99,
      from: prevId,
      to: a2.id,
      type: template.aromatic ? 'aromatic' : 'single',
      order: template.aromatic ? 1.5 : 1
    });

    const nextAtoms = [...atoms, ...newAtoms];
    const nextBonds = [...bonds, ...newBonds];
    setAtoms(nextAtoms);
    setBonds(nextBonds);
    pushHistory(nextAtoms, nextBonds);
  };

  // ----------------- STRUCTURAL EDITING OPERATIONS -----------------

  const deleteAtom = (id) => {
    const nextAtoms = atoms.filter((a) => a.id !== id);
    const nextBonds = bonds.filter((b) => b.from !== id && b.to !== id);
    setAtoms(nextAtoms);
    setBonds(nextBonds);
    setSelectedAtomIds((prev) => prev.filter((i) => i !== id));
    pushHistory(nextAtoms, nextBonds);
  };

  const deleteBond = (id) => {
    const nextBonds = bonds.filter((b) => b.id !== id);
    setBonds(nextBonds);
    setSelectedBondIds((prev) => prev.filter((i) => i !== id));
    pushHistory(atoms, nextBonds);
  };

  const deleteSelection = () => {
    if (selectedAtomIds.length === 0 && selectedBondIds.length === 0) return;
    const nextAtoms = atoms.filter((a) => !selectedAtomIds.includes(a.id));
    const nextBonds = bonds.filter(
      (b) => !selectedBondIds.includes(b.id) && !selectedAtomIds.includes(b.from) && !selectedAtomIds.includes(b.to)
    );
    setAtoms(nextAtoms);
    setBonds(nextBonds);
    setSelectedAtomIds([]);
    setSelectedBondIds([]);
    pushHistory(nextAtoms, nextBonds);
  };

  const clearCanvas = () => {
    setAtoms([]);
    setBonds([]);
    setSelectedAtomIds([]);
    setSelectedBondIds([]);
    pushHistory([], []);
  };

  const handleCleanUpStructure = () => {
    const cleaned = cleanUpStructure2D(atoms, bonds);
    setAtoms(cleaned.atoms);
    setBonds(cleaned.bonds);
    pushHistory(cleaned.atoms, cleaned.bonds);
  };

  const handleRotate = (deg = 30) => {
    if (atoms.length === 0) return;
    const rad = (deg * Math.PI) / 180;
    // Compute center
    let cx = 0, cy = 0;
    const targetAtoms = selectedAtomIds.length > 0 ? atoms.filter((a) => selectedAtomIds.includes(a.id)) : atoms;
    targetAtoms.forEach((a) => { cx += a.x; cy += a.y; });
    cx /= targetAtoms.length;
    cy /= targetAtoms.length;

    const newAtoms = atoms.map((a) => {
      if (selectedAtomIds.length === 0 || selectedAtomIds.includes(a.id)) {
        const dx = a.x - cx;
        const dy = a.y - cy;
        return {
          ...a,
          x: Math.round(cx + dx * Math.cos(rad) - dy * Math.sin(rad)),
          y: Math.round(cy + dx * Math.sin(rad) + dy * Math.cos(rad))
        };
      }
      return a;
    });

    setAtoms(newAtoms);
    pushHistory(newAtoms, bonds);
  };

  const handleFlip = (direction = 'h') => {
    if (atoms.length === 0) return;
    let cx = 0, cy = 0;
    const targetAtoms = selectedAtomIds.length > 0 ? atoms.filter((a) => selectedAtomIds.includes(a.id)) : atoms;
    targetAtoms.forEach((a) => { cx += a.x; cy += a.y; });
    cx /= targetAtoms.length;
    cy /= targetAtoms.length;

    const newAtoms = atoms.map((a) => {
      if (selectedAtomIds.length === 0 || selectedAtomIds.includes(a.id)) {
        return {
          ...a,
          x: direction === 'h' ? Math.round(cx - (a.x - cx)) : a.x,
          y: direction === 'v' ? Math.round(cy - (a.y - cy)) : a.y
        };
      }
      return a;
    });

    setAtoms(newAtoms);
    pushHistory(newAtoms, bonds);
  };

  const handleCenterStructure = () => {
    if (atoms.length === 0 || !canvasRef.current) return;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    atoms.forEach((a) => {
      minX = Math.min(minX, a.x);
      maxX = Math.max(maxX, a.x);
      minY = Math.min(minY, a.y);
      maxY = Math.max(maxY, a.y);
    });

    const molCx = (minX + maxX) / 2;
    const molCy = (minY + maxY) / 2;
    const targetCx = width / 2;
    const targetCy = height / 2;

    setPanOffset({
      x: targetCx - molCx * zoom,
      y: targetCy - molCy * zoom
    });
  };

  const handleCopy = () => {
    const copyAtoms = selectedAtomIds.length > 0 ? atoms.filter((a) => selectedAtomIds.includes(a.id)) : atoms;
    const copyBonds = bonds.filter(
      (b) => copyAtoms.some((a) => a.id === b.from) && copyAtoms.some((a) => a.id === b.to)
    );
    setClipboard({ atoms: copyAtoms, bonds: copyBonds });
  };

  const handlePaste = () => {
    if (!clipboard || clipboard.atoms.length === 0) return;
    const baseId = Date.now();
    const idMap = {};
    const offset = 40;

    const pastedAtoms = clipboard.atoms.map((a, i) => {
      const newId = baseId + i;
      idMap[a.id] = newId;
      return { ...a, id: newId, x: a.x + offset, y: a.y + offset };
    });

    const pastedBonds = clipboard.bonds.map((b, i) => ({
      ...b,
      id: baseId + 100 + i,
      from: idMap[b.from],
      to: idMap[b.to]
    }));

    const nextAtoms = [...atoms, ...pastedAtoms];
    const nextBonds = [...bonds, ...pastedBonds];
    setAtoms(nextAtoms);
    setBonds(nextBonds);
    setSelectedAtomIds(pastedAtoms.map((a) => a.id));
    pushHistory(nextAtoms, nextBonds);
  };

  const handleImportSmiles = () => {
    if (!importSmilesText.trim()) return;
    try {
      const { atoms: nA, bonds: nB } = parseSmilesTo2D(importSmilesText.trim());
      setAtoms(nA);
      setBonds(nB);
      pushHistory(nA, nB);
      setShowImportModal(false);
      setImportSmilesText('');
      handleCenterStructure();
    } catch (e) {
      alert('SMILES Parsing Error: Please verify chemical notation.');
    }
  };

  const copySMILES = () => {
    if (!smiles) return;
    navigator.clipboard.writeText(smiles);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Filtered elements in full periodic table modal
  const filteredPeriodicElements = PERIODIC_ELEMENTS.filter((el) => {
    const matchesSearch = el.name.toLowerCase().includes(periodicSearch.toLowerCase()) || el.symbol.toLowerCase().includes(periodicSearch.toLowerCase());
    const matchesCat = periodicCategory === 'all' || el.category === periodicCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] font-sans overflow-hidden bg-white dark:bg-[#08080a] rounded-[40px] border border-slate-200 dark:border-white/10 shadow-2xl transition-colors duration-500">
      {/* 1. PROFESSIONAL CAD HEADER */}
      <header className="px-8 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50/70 dark:bg-white/5 backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-inner">
            <PenTool className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              ChemDraw CAD Studio
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase border border-emerald-500/20">Real-time CAD</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest opacity-70">Professional Molecular Drawing & Analysis Suite</p>
          </div>
        </div>

        {/* Action Controls & History */}
        <div className="flex items-center gap-2">
          {/* History Undo / Redo */}
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-black/40 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10">
            <button
              onClick={handleUndo}
              disabled={historyStep <= 0}
              className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition disabled:opacity-30 text-slate-700 dark:text-slate-300"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyStep >= history.length - 1}
              className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition disabled:opacity-30 text-slate-700 dark:text-slate-300"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Geometry Enhancement Tools */}
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-black/40 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10">
            <button
              onClick={handleCleanUpStructure}
              className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition text-cyan-600 dark:text-cyan-400 font-bold"
              title="Clean Up Structure (Intelligent Geometry Layout)"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleRotate(30)}
              className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition text-slate-700 dark:text-slate-300"
              title="Rotate +30°"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleFlip('h')}
              className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition text-slate-700 dark:text-slate-300"
              title="Flip Horizontal"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleFlip('v')}
              className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition text-slate-700 dark:text-slate-300"
              title="Flip Vertical"
            >
              <FlipVertical className="w-4 h-4" />
            </button>
            <button
              onClick={handleCenterStructure}
              className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition text-slate-700 dark:text-slate-300"
              title="Center in Viewport"
            >
              <Move className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-black/40 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
              className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition text-slate-700 dark:text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono font-bold px-1 text-slate-500">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
              className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition text-slate-700 dark:text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Clear Canvas */}
          <button
            onClick={clearCanvas}
            className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition border border-transparent hover:border-rose-500/20"
            title="Clear Molecule Canvas"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>

          {/* Import / Export Buttons & IBM RXN Dispatch */}
          <button
            onClick={() => {
              const currentSmi = generateGraphSMILES(atoms, bonds);
              navigate('/ibm-rxn');
            }}
            className="px-3.5 py-2 text-xs font-black rounded-2xl flex items-center gap-1.5 bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-400 dark:text-violet-300 transition"
            title="Plan reaction or retrosynthesis with IBM RXN"
          >
            <Workflow className="w-3.5 h-3.5" /> Plan in IBM RXN
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-secondary px-4 py-2 text-xs font-bold rounded-2xl flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> Import
          </button>
          <button
            onClick={() => {
              const mol = exportToMolfileV2000(atoms, bonds);
              const blob = new Blob([mol], { type: 'chemical/x-mdl-molfile' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'structure.mol';
              a.click();
            }}
            className="btn-primary px-5 py-2 text-xs font-black rounded-2xl flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
          >
            <Download className="w-3.5 h-3.5" /> Export MDL
          </button>
        </div>
      </header>

      {/* 2. MAIN CAD WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT TOOLBAR: Tools, Comprehensive Bonds, Rings, and Quick Elements */}
        <aside className="w-20 border-r border-slate-200 dark:border-white/5 flex flex-col items-center py-5 gap-4 bg-slate-50/40 dark:bg-black/20 overflow-y-auto no-scrollbar shadow-inner">
          {/* Main Pointer Tools */}
          <div className="flex flex-col gap-2">
            <ToolButton active={selectedTool === 'select'} onClick={() => setSelectedTool('select')} icon={MousePointer2} label="Select (S)" />
            <ToolButton active={selectedTool === 'eraser'} onClick={() => setSelectedTool('eraser')} icon={Eraser} label="Eraser (E)" color="text-rose-500" />
            <ToolButton active={selectedTool === 'charge_pos'} onClick={() => setSelectedTool('charge_pos')} icon={Plus} label="Add Positive Charge (+)" color="text-cyan-500" />
            <ToolButton active={selectedTool === 'charge_neg'} onClick={() => setSelectedTool('charge_neg')} icon={Minus} label="Add Negative Charge (-)" color="text-rose-400" />
          </div>

          <div className="w-10 h-px bg-slate-200 dark:bg-white/10" />

          {/* Complete Bond Types Selection */}
          <div className="flex flex-col gap-2">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider text-center block">Bonds</span>
            {BOND_DEFINITIONS.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedTool('bond');
                  setActiveBondType(b.id);
                }}
                className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all relative group shadow-sm ${
                  selectedTool === 'bond' && activeBondType === b.id
                    ? 'bg-cyan-500 text-white shadow-xl scale-105'
                    : 'text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 border border-transparent'
                }`}
                title={b.label}
              >
                <span className="text-lg font-black leading-none">{b.symbol}</span>
                <span className="text-[7px] uppercase font-bold tracking-tighter opacity-80 mt-0.5">{b.id.slice(0, 5)}</span>
                <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none font-bold uppercase tracking-wider shadow-xl">
                  {b.label} — {b.desc}
                </span>
              </button>
            ))}
          </div>

          <div className="w-10 h-px bg-slate-200 dark:bg-white/10" />

          {/* Ring & Cyclic Templates */}
          <div className="flex flex-col gap-2">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider text-center block">Rings</span>
            {RING_TEMPLATES.slice(0, 4).map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedTool('ring');
                  setActiveRing(r.id);
                }}
                className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all relative group shadow-sm ${
                  selectedTool === 'ring' && activeRing === r.id
                    ? 'bg-violet-600 text-white shadow-xl scale-105'
                    : 'text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 border border-transparent'
                }`}
                title={r.label}
              >
                <Hexagon className="w-5 h-5" />
                <span className="text-[7px] uppercase font-bold tracking-tighter opacity-80 mt-0.5">{r.id.slice(0, 4)}</span>
                <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none font-bold uppercase tracking-wider shadow-xl">
                  {r.label} (Click atom to attach, bond to fuse)
                </span>
              </button>
            ))}
          </div>

          <div className="w-10 h-px bg-slate-200 dark:bg-white/10" />

          {/* Quick Elements Palette */}
          <div className="flex flex-col gap-2 pb-6">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider text-center block">Atoms</span>
            {COMMON_ELEMENTS.map((el) => (
              <button
                key={el}
                onClick={() => {
                  setSelectedTool('atom');
                  setActiveElement(el);
                }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all font-black text-sm relative group shadow-sm ${
                  selectedTool === 'atom' && activeElement === el
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-xl scale-105'
                    : 'text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 border border-transparent'
                }`}
                style={{ color: selectedTool === 'atom' && activeElement === el ? '' : getElementColor(el, isDark) }}
              >
                {el}
                <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none font-bold uppercase tracking-wider shadow-xl">
                  Element: {el}
                </span>
              </button>
            ))}

            {/* Complete Periodic Table Modal Trigger */}
            <button
              onClick={() => setShowPeriodicModal(true)}
              className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 transition-all group relative"
              title="Full Periodic Table"
            >
              <Search className="w-4 h-4" />
              <span className="text-[7px] font-black uppercase tracking-tighter mt-0.5">Table</span>
            </button>
          </div>
        </aside>

        {/* CENTRAL MOLECULAR CANVAS */}
        <main ref={containerRef} className="flex-1 relative cursor-crosshair overflow-hidden bg-white dark:bg-[#050608]">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full h-full touch-none select-none transition-opacity duration-300"
          />

          {/* Validation Engine Status Badge (Bottom Left) */}
          <div className="absolute bottom-6 left-6 flex items-center gap-3.5 bg-white/80 dark:bg-black/70 backdrop-blur-2xl px-5 py-3 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl">
            <div className="relative">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  validationResult.errors.length > 0
                    ? 'bg-rose-500'
                    : validationResult.warnings.length > 0
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                } shadow-lg`}
              />
              {validationResult.errors.length === 0 && (
                <div className="absolute inset-0 w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping opacity-60" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-70">Chemical Valence Engine</span>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                {validationResult.errors.length > 0
                  ? `${validationResult.errors.length} Valence Error(s)`
                  : validationResult.warnings.length > 0
                  ? `${validationResult.warnings.length} Geometry Warning(s)`
                  : 'Structure Graph Validated'}
              </span>
            </div>
            {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
              <button
                onClick={() => setShowValidationModal(true)}
                className="ml-2 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Inspect
              </button>
            )}
          </div>

          {/* Top Center Real-Time Interaction Guide */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="bg-slate-900/80 dark:bg-white/10 backdrop-blur-xl px-5 py-2 rounded-2xl border border-white/10 text-white dark:text-slate-200 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl opacity-75">
              Press & Drag from Atom to Create Bond • Release to Commit • Snap to Angles (30°)
            </div>
          </div>
        </main>

        {/* RIGHT METADATA & PROPERTY TELEMETRY PANEL */}
        <aside className="w-[360px] border-l border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/50 backdrop-blur-3xl flex flex-col overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            {/* 3D Visualizer Toggle Card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">3D Geometry Engine</h3>
                <button
                  onClick={() => setShow3D(!show3D)}
                  className={`p-2 rounded-xl transition-all shadow-sm ${
                    show3D ? 'bg-cyan-500 text-white' : 'bg-slate-200 dark:bg-white/5 text-slate-500'
                  }`}
                  title="Toggle 3D View"
                >
                  <Box className="w-4 h-4" />
                </button>
              </div>

              {show3D && (
                <div className="h-56 rounded-[28px] border border-slate-200 dark:border-white/10 bg-black overflow-hidden shadow-2xl group relative ring-1 ring-white/5">
                  <ThreeMoleculeViewer
                    molecule={{
                      atoms: atoms.map((a, i) => ({
                        id: i + 1,
                        element: a.element,
                        x: (a.x - 350) * 0.02,
                        y: -(a.y - 250) * 0.02,
                        z: Math.sin(i) * 0.2
                      })),
                      bonds: bonds.map((b) => ({
                        from: atoms.findIndex((at) => at.id === b.from) + 1,
                        to: atoms.findIndex((at) => at.id === b.to) + 1,
                        order: b.order
                      }))
                    }}
                    styleMode={viewStyle3D}
                  />
                  <div className="absolute bottom-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {['ball-stick', 'space-fill', 'stick'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setViewStyle3D(s)}
                        className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider backdrop-blur-md transition-all ${
                          viewStyle3D === s ? 'bg-cyan-500 text-white' : 'bg-black/60 text-white hover:bg-black/80'
                        }`}
                      >
                        {s.split('-')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Canonical SMILES Output Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Canonical SMILES</h3>
                <button
                  onClick={copySMILES}
                  className="text-cyan-500 hover:text-cyan-400 transition transform active:scale-90 p-1"
                  title="Copy SMILES String"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-4 rounded-[20px] bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 shadow-inner hover:border-cyan-500/30 transition-all">
                <code className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 break-all leading-relaxed block min-h-[1.5em]">
                  {smiles || 'Awaiting molecular structure...'}
                </code>
              </div>
            </div>

            {/* Scientific Properties Telemetry Grid */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Calculated Chemical Descriptors</h3>
              {descriptors ? (
                <div className="space-y-2.5">
                  <TelemetryCard label="Molecular Formula" value={descriptors.formula} icon={Zap} color="text-amber-500" />
                  <TelemetryCard label="Molecular Weight" value={`${descriptors.mw} g/mol`} icon={Activity} color="text-emerald-500" />
                  <TelemetryCard label="Exact Isotopic Mass" value={`${descriptors.exactMass} Da`} icon={Search} color="text-cyan-500" />
                  <TelemetryCard label="LogP (Hydrophobicity)" value={descriptors.logP} icon={ShieldCheck} color="text-blue-500" />
                  <TelemetryCard label="TPSA (Polar Surface)" value={`${descriptors.tpsa} Å²`} icon={Layers} color="text-violet-500" />

                  {/* Structural Counts Grid */}
                  <div className="pt-2 grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center">
                      <span className="text-[8px] font-black text-slate-400 block uppercase tracking-widest mb-1 opacity-70">Atoms</span>
                      <span className="text-base font-black text-slate-900 dark:text-white leading-none">{atoms.length}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center">
                      <span className="text-[8px] font-black text-slate-400 block uppercase tracking-widest mb-1 opacity-70">Bonds</span>
                      <span className="text-base font-black text-slate-900 dark:text-white leading-none">{bonds.length}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center">
                      <span className="text-[8px] font-black text-slate-400 block uppercase tracking-widest mb-1 opacity-70">Rings</span>
                      <span className="text-base font-black text-slate-900 dark:text-white leading-none">{descriptors.ringCount}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[32px]">
                  <Activity className="w-6 h-6 text-slate-300 dark:text-white/10 mx-auto mb-2" />
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Draw Structure to Calculate</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* 3. MODAL: IMPORT SMILES */}
      {showImportModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/20 rounded-[36px] p-8 max-w-lg w-full space-y-5 text-xs font-sans shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-cyan-500" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">Import SMILES String</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition">✕</button>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Input standard, isomeric, or canonical SMILES to auto-generate the 2D molecular layout with accurate connectivity.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                autoFocus
                value={importSmilesText}
                onChange={(e) => setImportSmilesText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleImportSmiles()}
                placeholder="e.g. CC(=O)Oc1ccccc1C(=O)O (Aspirin)"
                className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 text-cyan-600 dark:text-cyan-300 font-mono text-sm focus:border-cyan-500 outline-none transition-all shadow-inner"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase mr-1 mt-1">Examples:</span>
                {[
                  { name: 'Aspirin', s: 'CC(=O)Oc1ccccc1C(=O)O' },
                  { name: 'Caffeine', s: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C' },
                  { name: 'Paracetamol', s: 'CC(=O)Nc1ccc(O)cc1' },
                  { name: 'Benzene', s: 'c1ccccc1' },
                  { name: 'Ethanol', s: 'CCO' }
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setImportSmilesText(item.s)}
                    className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 transition-all font-mono"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold rounded-2xl transition-all uppercase tracking-widest text-[10px]"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSmiles}
                className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] shadow-lg shadow-cyan-500/20"
              >
                Initialize Layout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: FULL PERIODIC TABLE PICKER */}
      {showPeriodicModal && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/20 rounded-[40px] p-8 max-w-4xl w-full max-h-[85vh] flex flex-col space-y-5 text-xs font-sans shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Search className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">Periodic Table Element Selector</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Select any chemical element for active atom drawing</p>
                </div>
              </div>
              <button onClick={() => setShowPeriodicModal(false)} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition">✕</button>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search element by name, symbol, or number..."
                  value={periodicSearch}
                  onChange={(e) => setPeriodicSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl py-2.5 px-4 text-xs focus:border-cyan-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl">
                {['all', 'nonmetal', 'halogen', 'transition', 'metalloid', 'alkali'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPeriodicCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all ${
                      periodicCategory === cat ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Elements Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 p-1 custom-scrollbar">
              {filteredPeriodicElements.map((el) => (
                <button
                  key={el.symbol}
                  onClick={() => {
                    setActiveElement(el.symbol);
                    setSelectedTool('atom');
                    setShowPeriodicModal(false);
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-between transition-all hover:scale-105 ${
                    activeElement === el.symbol
                      ? 'bg-cyan-500/20 border-cyan-500 shadow-lg'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-cyan-500/40'
                  }`}
                >
                  <span className="text-[8px] font-mono text-slate-400">{el.number}</span>
                  <span className="text-base font-black" style={{ color: getElementColor(el.symbol, isDark) }}>
                    {el.symbol}
                  </span>
                  <span className="text-[7px] truncate max-w-full font-bold text-slate-500">{el.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: VALENCE & GEOMETRY VALIDATION DETAILS */}
      {showValidationModal && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/20 rounded-[36px] p-8 max-w-md w-full space-y-4 text-xs font-sans shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Chemical Graph Validation</h3>
              </div>
              <button onClick={() => setShowValidationModal(false)} className="p-1 text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {validationResult.errors.map((err, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-medium">
                  {err.message}
                </div>
              ))}
              {validationResult.warnings.map((warn, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
                  {warn.message}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowValidationModal(false)}
              className="w-full py-2.5 bg-slate-100 dark:bg-white/10 font-bold rounded-2xl text-slate-700 dark:text-white uppercase tracking-wider text-[10px]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolButton({ active, onClick, icon: Icon, label, color = 'text-slate-400' }) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative group shadow-sm ${
        active
          ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-xl scale-105'
          : `${color} hover:bg-slate-200/50 dark:hover:bg-white/5 border border-transparent`
      }`}
      title={label}
    >
      <Icon className="w-5 h-5" />
      <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none font-bold uppercase tracking-wider shadow-xl">
        {label}
      </span>
    </button>
  );
}

function TelemetryCard({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center gap-3.5 p-3.5 rounded-[22px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm hover:border-cyan-500/20 transition-all">
      <div className={`w-9 h-9 rounded-xl bg-slate-50 dark:bg-black/40 flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/5 ${color}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] opacity-70">{label}</span>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{value}</span>
      </div>
    </div>
  );
}
