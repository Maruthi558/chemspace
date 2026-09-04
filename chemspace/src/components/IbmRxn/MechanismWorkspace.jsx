import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  GitBranch,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  Atom,
  Bot,
  Zap,
  Info,
  Sliders,
  ZoomIn,
  ZoomOut,
  Move,
  Eye,
  Download,
  Share2,
  Mic,
  MicOff,
  CornerDownRight,
  ArrowRight,
  Maximize2,
  Check,
  X,
  Undo2,
  Redo2,
  Search,
  BookOpen,
  FlaskConical,
  Flame,
  Clock,
  ShieldCheck,
  MousePointer2,
  PenTool,
  HelpCircle
} from 'lucide-react';
import ThreeMoleculeViewer from '../ThreeMoleculeViewer';
import { useTheme } from '../../context/ThemeContext';
import { MECHANISM_TEMPLATES, validateMechanismStep } from '../../data/mechanismTemplates';
import { FRAGMENT_LIBRARY, FRAGMENT_CATEGORIES, calculateFragmentAttachment } from '../../data/fragmentLibrary';
import {
  computeHillFormula,
  computeMolecularWeight,
  generateGraphSMILES,
  parseSmilesTo2D,
  PERIODIC_ELEMENTS
} from '../../services/chemicalGraph';
import { logActivity } from '../../services/activityStore';

export default function MechanismWorkspace({
  activeReactionContext = null,
  onApplyToReaction = null
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // ── 1. ACTIVE MECHANISM STATE ──
  const [selectedTemplateId, setSelectedTemplateId] = useState('sn2_bimolecular');
  const [mechanismTitle, setMechanismTitle] = useState('SN2 Bimolecular Nucleophilic Substitution');
  const [mechanismClass, setMechanismClass] = useState('Nucleophilic Substitution');
  const [mechanismDrivingForce, setMechanismDrivingForce] = useState('Expulsion of stable leaving group and C-Nu bond formation.');
  
  // Array of mechanism steps
  const [steps, setSteps] = useState(() => {
    const t = MECHANISM_TEMPLATES[0];
    return JSON.parse(JSON.stringify(t.steps));
  });

  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // History per step
  const [historyStack, setHistoryStack] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);

  // ── 2. TOOLS & DRAWING STATE ──
  // 'select' | 'arrow_pair' | 'arrow_single' | 'atom' | 'bond' | 'fragment' | 'charge_pos' | 'charge_neg' | 'radical' | 'eraser'
  const [activeTool, setActiveTool] = useState('select');
  const [activeElement, setActiveElement] = useState('C');
  const [activeBondType, setActiveBondType] = useState('single');
  const [selectedFragment, setSelectedFragment] = useState(FRAGMENT_LIBRARY[0]);

  // Canvas Viewport (Zoom / Pan)
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Arrow drawing state
  const [arrowDraft, setArrowDraft] = useState(null); // { sourceType, sourceId, startX, startY, currentX, currentY, type }
  const [selectedArrowId, setSelectedArrowId] = useState(null);

  // Atom/Bond Selection & Hover
  const [selectedAtomId, setSelectedAtomId] = useState(null);
  const [selectedBondId, setSelectedBondId] = useState(null);
  const [hoveredAtomId, setHoveredAtomId] = useState(null);
  const [hoveredBondId, setHoveredBondId] = useState(null);
  const [isDraggingAtom, setIsDraggingAtom] = useState(false);
  const [dragStartMouse, setDragStartMouse] = useState(null);
  const [dragInitialPos, setDragInitialPos] = useState({ x: 0, y: 0 });

  // Bond creation drag state
  const [isDrawingBond, setIsDrawingBond] = useState(false);
  const [bondStartAtomId, setBondStartAtomId] = useState(null);
  const [bondCurrentMouse, setBondCurrentMouse] = useState({ x: 0, y: 0 });

  // ── 3. AI MECHANISM ASSISTANT ──
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiExplanationLog, setAiExplanationLog] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your **Organic Mechanism AI Copilot**. I can explain electron pushing, identify nucleophiles & electrophiles, verify charge balance, or propose the next intermediate step.'
    }
  ]);

  // ── 4. VOICE RECOGNITION ──
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef(null);

  // ── 5. MODALS & PANELS ──
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [showFragmentModal, setShowFragmentModal] = useState(false);
  const [fragmentSearch, setFragmentSearch] = useState('');
  const [fragmentCategory, setFragmentCategory] = useState('all');
  const [show3DModal, setShow3DModal] = useState(false);
  const [active3DSmiles, setActive3DSmiles] = useState('');
  const [comparisonMode, setComparisonMode] = useState(false); // side-by-side before/after

  const currentStep = steps[activeStepIndex] || steps[0];

  // Helper: Save current step state into history
  const pushStepHistory = useCallback((updatedSteps) => {
    setSteps(updatedSteps);
  }, []);

  // Update current step properties
  const updateCurrentStep = useCallback((updater) => {
    setSteps((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[activeStepIndex] = typeof updater === 'function' ? updater(next[activeStepIndex]) : { ...next[activeStepIndex], ...updater };
      return next;
    });
  }, [activeStepIndex]);

  // ── 6. TEMPLATE LOADER ──
  const handleLoadTemplate = (template) => {
    setSelectedTemplateId(template.id);
    setMechanismTitle(template.name);
    setMechanismClass(template.class);
    setMechanismDrivingForce(template.drivingForce || '');
    setSteps(JSON.parse(JSON.stringify(template.steps)));
    setActiveStepIndex(0);
    setShowTemplateModal(false);
    logActivity('IBM RXN', 'Loaded Mechanism Template', template.name, 'reaction');
  };

  // ── 7. STEP MANAGEMENT ──
  const handleAddStep = () => {
    const newStepNum = steps.length + 1;
    const baseAtoms = currentStep?.atoms ? JSON.parse(JSON.stringify(currentStep.atoms)) : [];
    const baseBonds = currentStep?.bonds ? JSON.parse(JSON.stringify(currentStep.bonds)) : [];
    
    const newStep = {
      stepNumber: newStepNum,
      title: `Reaction Step ${newStepNum}`,
      isTransitionState: false,
      reagent: '',
      condition: 'Ambient',
      description: 'Intermediate transformation step.',
      nucleophile: 'TBD',
      electrophile: 'TBD',
      drivingForce: 'Thermodynamic equilibrium.',
      atoms: baseAtoms,
      bonds: baseBonds,
      arrows: []
    };

    setSteps([...steps, newStep]);
    setActiveStepIndex(steps.length);
  };

  const handleDuplicateStep = () => {
    const copy = JSON.parse(JSON.stringify(currentStep));
    copy.stepNumber = steps.length + 1;
    copy.title = `${copy.title} (Copy)`;
    setSteps([...steps, copy]);
    setActiveStepIndex(steps.length);
  };

  const handleDeleteStep = (index) => {
    if (steps.length <= 1) return;
    const next = steps.filter((_, i) => i !== index).map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(next);
    setActiveStepIndex(Math.max(0, Math.min(activeStepIndex, next.length - 1)));
  };

  // ── 8. CANVAS COORDINATES ──
  const screenToWorld = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: clientX, y: clientY };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left - panOffset.x) / zoom,
      y: (clientY - rect.top - panOffset.y) / zoom
    };
  }, [panOffset, zoom]);

  // ── 9. MOUSE EVENT HANDLERS (Drawing & Electron Arrows) ──
  const handleCanvasMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Pan
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    const { x, y } = screenToWorld(e.clientX, e.clientY);

    // 1. Electron Arrow Creation Tool
    if (activeTool === 'arrow_pair' || activeTool === 'arrow_single') {
      if (hoveredAtomId) {
        setArrowDraft({
          sourceType: 'atom',
          sourceId: hoveredAtomId,
          startX: x,
          startY: y,
          currentX: x,
          currentY: y,
          type: activeTool === 'arrow_single' ? 'single' : 'pair'
        });
        return;
      }
      if (hoveredBondId) {
        setArrowDraft({
          sourceType: 'bond',
          sourceId: hoveredBondId,
          startX: x,
          startY: y,
          currentX: x,
          currentY: y,
          type: activeTool === 'arrow_single' ? 'single' : 'pair'
        });
        return;
      }
    }

    // 2. Atom Drag / Selection
    if (activeTool === 'select') {
      if (hoveredAtomId) {
        setSelectedAtomId(hoveredAtomId);
        setSelectedBondId(null);
        setSelectedArrowId(null);
        setIsDraggingAtom(true);
        setDragStartMouse({ x: e.clientX, y: e.clientY });
        const atom = currentStep.atoms.find((a) => a.id === hoveredAtomId);
        if (atom) setDragInitialPos({ x: atom.x, y: atom.y });
        return;
      }
      if (hoveredBondId) {
        setSelectedBondId(hoveredBondId);
        setSelectedAtomId(null);
        setSelectedArrowId(null);
        return;
      }
      // Click on background deselects
      setSelectedAtomId(null);
      setSelectedBondId(null);
      setSelectedArrowId(null);
    }

    // 3. Bond Drawing Tool (Click on atom & drag to create bond)
    if (activeTool === 'bond') {
      if (hoveredAtomId) {
        setIsDrawingBond(true);
        setBondStartAtomId(hoveredAtomId);
        setBondCurrentMouse({ x, y });
        return;
      }
      // Click on empty space creates a new atom
      const newId = Date.now();
      const newAtom = { id: newId, element: activeElement, x: Math.round(x), y: Math.round(y), charge: 0 };
      updateCurrentStep((step) => ({
        ...step,
        atoms: [...step.atoms, newAtom]
      }));
      setSelectedAtomId(newId);
    }

    // 4. Fragment Tool (Click on atom to attach, or click empty space to place)
    if (activeTool === 'fragment' && selectedFragment) {
      if (hoveredAtomId) {
        const target = currentStep.atoms.find((a) => a.id === hoveredAtomId);
        if (target) {
          const res = calculateFragmentAttachment(target, currentStep.bonds, currentStep.atoms, selectedFragment);
          updateCurrentStep((step) => ({
            ...step,
            atoms: [...step.atoms, ...res.newAtoms],
            bonds: [...step.bonds, ...res.newBonds]
          }));
          return;
        }
      } else {
        // Place standalone fragment
        const idOff = Date.now();
        const newAtoms = selectedFragment.atoms.map((fa, i) => ({
          id: idOff + i,
          element: fa.el,
          x: Math.round(x + fa.dx),
          y: Math.round(y + fa.dy),
          charge: fa.charge || 0
        }));
        const newBonds = selectedFragment.bonds.map((fb, i) => ({
          id: idOff + 1000 + i,
          from: newAtoms[fb.fromIdx].id,
          to: newAtoms[fb.toIdx].id,
          type: fb.type || 'single',
          order: fb.order || 1
        }));
        updateCurrentStep((step) => ({
          ...step,
          atoms: [...step.atoms, ...newAtoms],
          bonds: [...step.bonds, ...newBonds]
        }));
      }
    }

    // 5. Charge Modification (+ / - / radical)
    if (activeTool === 'charge_pos' && hoveredAtomId) {
      updateCurrentStep((step) => ({
        ...step,
        atoms: step.atoms.map((a) => (a.id === hoveredAtomId ? { ...a, charge: (a.charge || 0) + 1 } : a))
      }));
    }
    if (activeTool === 'charge_neg' && hoveredAtomId) {
      updateCurrentStep((step) => ({
        ...step,
        atoms: step.atoms.map((a) => (a.id === hoveredAtomId ? { ...a, charge: (a.charge || 0) - 1 } : a))
      }));
    }
    if (activeTool === 'radical' && hoveredAtomId) {
      updateCurrentStep((step) => ({
        ...step,
        atoms: step.atoms.map((a) => (a.id === hoveredAtomId ? { ...a, radical: !a.radical } : a))
      }));
    }

    // 6. Eraser Tool
    if (activeTool === 'eraser') {
      if (hoveredAtomId) {
        updateCurrentStep((step) => ({
          ...step,
          atoms: step.atoms.filter((a) => a.id !== hoveredAtomId),
          bonds: step.bonds.filter((b) => b.from !== hoveredAtomId && b.to !== hoveredAtomId),
          arrows: step.arrows.filter((arr) => !(arr.sourceType === 'atom' && arr.sourceId === hoveredAtomId) && !(arr.targetType === 'atom' && arr.targetId === hoveredAtomId))
        }));
      } else if (hoveredBondId) {
        updateCurrentStep((step) => ({
          ...step,
          bonds: step.bonds.filter((b) => b.id !== hoveredBondId),
          arrows: step.arrows.filter((arr) => !(arr.sourceType === 'bond' && arr.sourceId === hoveredBondId) && !(arr.targetType === 'bond' && arr.targetId === hoveredBondId))
        }));
      }
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    const { x, y } = screenToWorld(e.clientX, e.clientY);

    // Atom dragging
    if (isDraggingAtom && selectedAtomId) {
      const dx = (e.clientX - dragStartMouse.x) / zoom;
      const dy = (e.clientY - dragStartMouse.y) / zoom;
      updateCurrentStep((step) => ({
        ...step,
        atoms: step.atoms.map((a) => (a.id === selectedAtomId ? { ...a, x: Math.round(dragInitialPos.x + dx), y: Math.round(dragInitialPos.y + dy) } : a))
      }));
      return;
    }

    // Arrow draft update
    if (arrowDraft) {
      setArrowDraft({ ...arrowDraft, currentX: x, currentY: y });
      return;
    }

    // Bond drawing drag update
    if (isDrawingBond) {
      setBondCurrentMouse({ x, y });
      return;
    }

    // Detect hover on atoms (threshold 16px)
    let foundAtom = null;
    if (currentStep?.atoms) {
      for (const atom of currentStep.atoms) {
        const dist = Math.hypot(atom.x - x, atom.y - y);
        if (dist < 18) {
          foundAtom = atom.id;
          break;
        }
      }
    }
    setHoveredAtomId(foundAtom);

    // Detect hover on bonds (threshold 12px)
    if (!foundAtom && currentStep?.bonds && currentStep?.atoms) {
      let foundBond = null;
      for (const bond of currentStep.bonds) {
        const a1 = currentStep.atoms.find((a) => a.id === bond.from);
        const a2 = currentStep.atoms.find((a) => a.id === bond.to);
        if (a1 && a2) {
          // Distance from (x, y) to line segment (a1, a2)
          const l2 = (a2.x - a1.x) ** 2 + (a2.y - a1.y) ** 2;
          if (l2 === 0) continue;
          let t = ((x - a1.x) * (a2.x - a1.x) + (y - a1.y) * (a2.y - a1.y)) / l2;
          t = Math.max(0, Math.min(1, t));
          const projX = a1.x + t * (a2.x - a1.x);
          const projY = a1.y + t * (a2.y - a1.y);
          const dist = Math.hypot(x - projX, y - projY);
          if (dist < 12) {
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

  const handleCanvasMouseUp = (e) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDraggingAtom) {
      setIsDraggingAtom(false);
      return;
    }

    // Finish electron arrow creation
    if (arrowDraft) {
      const { x, y } = screenToWorld(e.clientX, e.clientY);
      let targetType = null;
      let targetId = null;

      if (hoveredAtomId && hoveredAtomId !== arrowDraft.sourceId) {
        targetType = 'atom';
        targetId = hoveredAtomId;
      } else if (hoveredBondId && hoveredBondId !== arrowDraft.sourceId) {
        targetType = 'bond';
        targetId = hoveredBondId;
      }

      if (targetType && targetId) {
        const newArrow = {
          id: `arrow_${Date.now()}`,
          type: arrowDraft.type,
          sourceType: arrowDraft.sourceType,
          sourceId: arrowDraft.sourceId,
          targetType,
          targetId,
          curveOffset: -35, // default curvature
          label: arrowDraft.type === 'single' ? 'Fishhook (1e⁻)' : 'Pair (2e⁻)',
          description: 'Electron movement'
        };

        updateCurrentStep((step) => ({
          ...step,
          arrows: [...(step.arrows || []), newArrow]
        }));
      }

      setArrowDraft(null);
      return;
    }

    // Finish bond drawing creation
    if (isDrawingBond && bondStartAtomId) {
      const { x, y } = screenToWorld(e.clientX, e.clientY);
      const startAtom = currentStep.atoms.find((a) => a.id === bondStartAtomId);

      if (hoveredAtomId && hoveredAtomId !== bondStartAtomId) {
        // Connect existing atoms
        const existing = currentStep.bonds.find(
          (b) => (b.from === bondStartAtomId && b.to === hoveredAtomId) || (b.from === hoveredAtomId && b.to === bondStartAtomId)
        );
        if (existing) {
          // Cycle bond order: 1 -> 2 -> 3 -> 1
          const nextOrder = existing.order === 1 ? 2 : existing.order === 2 ? 3 : 1;
          const nextType = nextOrder === 2 ? 'double' : nextOrder === 3 ? 'triple' : 'single';
          updateCurrentStep((step) => ({
            ...step,
            bonds: step.bonds.map((b) => (b.id === existing.id ? { ...b, order: nextOrder, type: nextType } : b))
          }));
        } else {
          // Add new bond between them
          const newBond = {
            id: Date.now(),
            from: bondStartAtomId,
            to: hoveredAtomId,
            type: activeBondType,
            order: activeBondType === 'double' ? 2 : activeBondType === 'triple' ? 3 : 1
          };
          updateCurrentStep((step) => ({
            ...step,
            bonds: [...step.bonds, newBond]
          }));
        }
      } else if (startAtom) {
        // Snap to 30 degrees angle & 50px length
        const dx = x - startAtom.x;
        const dy = y - startAtom.y;
        let angle = Math.atan2(dy, dx);
        angle = Math.round(angle / (Math.PI / 6)) * (Math.PI / 6);
        const snappedX = Math.round(startAtom.x + Math.cos(angle) * 50);
        const snappedY = Math.round(startAtom.y + Math.sin(angle) * 50);

        const newAtomId = Date.now();
        const newAtom = { id: newAtomId, element: activeElement, x: snappedX, y: snappedY, charge: 0 };
        const newBond = {
          id: Date.now() + 1,
          from: bondStartAtomId,
          to: newAtomId,
          type: activeBondType,
          order: activeBondType === 'double' ? 2 : activeBondType === 'triple' ? 3 : 1
        };

        updateCurrentStep((step) => ({
          ...step,
          atoms: [...step.atoms, newAtom],
          bonds: [...step.bonds, newBond]
        }));
        setSelectedAtomId(newAtomId);
      }

      setIsDrawingBond(false);
      setBondStartAtomId(null);
    }
  };

  // ── 10. AI MECHANISM EXPLANATION & COPILOT ──
  const handleAskAiMechanism = (promptOverride = null) => {
    const prompt = promptOverride || aiPromptInput;
    if (!prompt.trim()) return;

    setIsAiAnalyzing(true);
    const userMsg = { role: 'user', text: prompt };
    setAiExplanationLog((prev) => [...prev, userMsg]);
    setAiPromptInput('');

    setTimeout(() => {
      let aiResponseText = '';
      const lower = prompt.toLowerCase();

      if (lower.includes('nucleophile') || lower.includes('electrophile')) {
        aiResponseText = `### 🔍 Mechanistic Active Site Identification (Step ${activeStepIndex + 1}):
- **Identified Nucleophile**: \`${currentStep.nucleophile || 'Electron-rich Lewis base / lone-pair center'}\`
- **Identified Electrophile**: \`${currentStep.electrophile || 'Electron-deficient center / empty orbital'}\`
- **Electronic Flow**: Curved arrows originate from the highest occupied molecular orbital (HOMO) lone-pair/π-bond to the lowest unoccupied molecular orbital (LUMO) σ*/π* antibonding orbital.`;
      } else if (lower.includes('next') || lower.includes('intermediate')) {
        aiResponseText = `### ⚡ AI-Predicted Next Mechanistic Step (Proposed):
1. **Transformation**: Collapse of the reactive intermediate with expulsion of the leaving group.
2. **Driving Force**: ${currentStep.drivingForce || 'Restoration of valence octet and formation of thermodynamically favorable bonds.'}
3. **Formal Charge Balance**: Net step charge remains conserved at **${currentStep.atoms.reduce((s, a) => s + (a.charge || 0), 0) >= 0 ? '+' : ''}${currentStep.atoms.reduce((s, a) => s + (a.charge || 0), 0)}**.

*(Note: AI generated prediction based on frontier molecular orbital principles; verify with experimental spectroscopy).*`;
      } else {
        aiResponseText = `### 🧪 Mechanistic Analysis for "${currentStep.title}":
${currentStep.description}

- **Reagents & Environment**: ${currentStep.reagent || 'Standard laboratory conditions'}, ${currentStep.condition || 'Ambient'}
- **Driving Force**: ${currentStep.drivingForce || 'Enthalpic gain from σ-bond stability and entropy of departure.'}
- **Validation**: Step has **${currentStep.arrows?.length || 0}** curved electron movement vectors registered.`;
      }

      setAiExplanationLog((prev) => [
        ...prev,
        { role: 'assistant', text: aiResponseText }
      ]);
      setIsAiAnalyzing(false);
    }, 450);
  };

  // ── 11. VOICE ASSISTANT RECOGNITION ──
  const toggleVoiceAssistant = () => {
    if (isVoiceActive) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsVoiceActive(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsVoiceActive(true);
      setVoiceTranscript('Listening for chemistry voice command...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(transcript);
      handleExecuteVoiceCommand(transcript);
    };

    recognition.onerror = () => {
      setIsVoiceActive(false);
      setVoiceTranscript('');
    };

    recognition.onend = () => {
      setIsVoiceActive(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleExecuteVoiceCommand = (cmd) => {
    const lower = cmd.toLowerCase();

    if (lower.includes('next step') || lower.includes('create next')) {
      handleAddStep();
      handleAskAiMechanism('Explain the newly generated step.');
    } else if (lower.includes('explain') || lower.includes('mechanism')) {
      handleAskAiMechanism('Explain this reaction mechanism step.');
    } else if (lower.includes('nucleophile')) {
      handleAskAiMechanism('Identify the nucleophile and electrophile.');
    } else if (lower.includes('sn2') || lower.includes('substitution')) {
      const t = MECHANISM_TEMPLATES.find((m) => m.id === 'sn2_bimolecular');
      if (t) handleLoadTemplate(t);
    } else if (lower.includes('esterification') || lower.includes('fischer')) {
      const t = MECHANISM_TEMPLATES.find((m) => m.id === 'fischer_esterification');
      if (t) handleLoadTemplate(t);
    } else if (lower.includes('diels') || lower.includes('alder')) {
      const t = MECHANISM_TEMPLATES.find((m) => m.id === 'diels_alder_cycloaddition');
      if (t) handleLoadTemplate(t);
    } else if (lower.includes('arrow') || lower.includes('curved')) {
      setActiveTool('arrow_pair');
    } else if (lower.includes('methyl')) {
      const frag = FRAGMENT_LIBRARY.find((f) => f.id === 'frag_me');
      if (frag) {
        setSelectedFragment(frag);
        setActiveTool('fragment');
      }
    } else if (lower.includes('phenyl')) {
      const frag = FRAGMENT_LIBRARY.find((f) => f.id === 'frag_ph');
      if (frag) {
        setSelectedFragment(frag);
        setActiveTool('fragment');
      }
    }
  };

  // Step Validation Status
  const stepValidation = useMemo(() => {
    return validateMechanismStep(currentStep);
  }, [currentStep]);

  // Current SMILES of the step
  const stepSmiles = useMemo(() => {
    try {
      return generateGraphSMILES(currentStep.atoms, currentStep.bonds);
    } catch {
      return '';
    }
  }, [currentStep]);

  // ── 12. RENDER ARROW HELPER (Bezier Curve with Arrowhead) ──
  const renderArrowPath = (arr, isDraft = false) => {
    let x1, y1, x2, y2;

    if (isDraft) {
      x1 = arr.startX;
      y1 = arr.startY;
      x2 = arr.currentX;
      y2 = arr.currentY;
    } else {
      // Resolve source coordinate
      if (arr.sourceType === 'atom') {
        const a = currentStep.atoms.find((at) => at.id === arr.sourceId);
        if (!a) return null;
        x1 = a.x;
        y1 = a.y;
      } else {
        const b = currentStep.bonds.find((bd) => bd.id === arr.sourceId);
        if (!b) return null;
        const a1 = currentStep.atoms.find((at) => at.id === b.from);
        const a2 = currentStep.atoms.find((at) => at.id === b.to);
        if (!a1 || !a2) return null;
        x1 = (a1.x + a2.x) / 2;
        y1 = (a1.y + a2.y) / 2;
      }

      // Resolve target coordinate
      if (arr.targetType === 'atom') {
        const a = currentStep.atoms.find((at) => at.id === arr.targetId);
        if (!a) return null;
        x2 = a.x;
        y2 = a.y;
      } else {
        const b = currentStep.bonds.find((bd) => bd.id === arr.targetId);
        if (!b) return null;
        const a1 = currentStep.atoms.find((at) => at.id === b.from);
        const a2 = currentStep.atoms.find((at) => at.id === b.to);
        if (!a1 || !a2) return null;
        x2 = (a1.x + a2.x) / 2;
        y2 = (a1.y + a2.y) / 2;
      }
    }

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const offset = arr.curveOffset !== undefined ? arr.curveOffset : -35;
    const cx = (x1 + x2) / 2 + nx * offset;
    const cy = (y1 + y2) / 2 + ny * offset;

    const pathData = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
    const strokeColor = arr.type === 'single' ? '#f59e0b' : '#06b6d4'; // Gold for single fishhook, Cyan for 2-electron pair

    return (
      <g key={arr.id || 'draft_arrow'} className="cursor-pointer">
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth={isDraft ? 2 : 2.5}
          strokeDasharray={isDraft ? '4 4' : 'none'}
          markerEnd={arr.type === 'single' ? 'url(#arrowhead_fishhook)' : 'url(#arrowhead_pair)'}
          className="transition-all hover:stroke-white hover:stroke-[3.5px]"
          onClick={() => setSelectedArrowId(arr.id)}
        />
        {/* Curvature adjustment handle if selected */}
        {selectedArrowId === arr.id && (
          <circle
            cx={cx}
            cy={cy}
            r={5}
            fill="#ffffff"
            stroke={strokeColor}
            strokeWidth={2}
            className="cursor-move"
          />
        )}
      </g>
    );
  };

  return (
    <div className="workspace-container font-mono select-none space-y-4">
      {/* ── TOP HEADER & WORKSPACE BANNER ── */}
      <div className="workspace-header">
        <div className="flex items-center justify-between gap-4 w-full flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-400">
              <CornerDownRight className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-wider text-[var(--text-primary)]">
                  REACTION MECHANISM WORKSPACE
                </h1>
                <span className="telemetry-pill text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                  ELECTRON-PUSHING CAD
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] font-sans mt-0.5">
                Construct multi-step organic reaction pathways with curved electron arrows, transition states [‡], intermediates &amp; AI validation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="btn-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 rounded-xl border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Mechanism Templates</span>
            </button>

            <button
              onClick={() => setComparisonMode(!comparisonMode)}
              className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 rounded-xl border transition ${
                comparisonMode
                  ? 'bg-violet-600 text-white border-violet-400 shadow-md font-black'
                  : 'btn-secondary text-[var(--text-secondary)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{comparisonMode ? 'Single Step View' : 'Compare Steps'}</span>
            </button>

            <button
              onClick={toggleVoiceAssistant}
              className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 rounded-xl border transition ${
                isVoiceActive
                  ? 'bg-rose-500 text-white animate-pulse border-rose-400 font-black'
                  : 'btn-secondary text-[var(--text-secondary)]'
              }`}
              title="Voice controlled mechanism actions"
            >
              {isVoiceActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              <span>{isVoiceActive ? 'Listening...' : 'Voice CAD'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── STEP NAVIGATION TIMELINE BAR ── */}
      <div className="glass-panel p-3 rounded-2xl border border-[var(--border-subtle)] flex items-center justify-between gap-3 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2">
          {steps.map((step, idx) => (
            <React.Fragment key={step.stepNumber}>
              <button
                onClick={() => setActiveStepIndex(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
                  activeStepIndex === idx
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-black'
                    : 'bg-white/5 border-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[10px]">
                  {step.stepNumber}
                </span>
                <span>{step.title}</span>
                {step.isTransitionState && (
                  <span className="text-[10px] text-amber-300 font-black">[‡]</span>
                )}
              </button>

              {idx < steps.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400/50 shrink-0" />
              )}
            </React.Fragment>
          ))}

          <button
            onClick={handleAddStep}
            className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-dashed border-cyan-500/40 transition shrink-0"
            title="Add next mechanism step / intermediate"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleDuplicateStep}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Duplicate current step"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteStep(activeStepIndex)}
            disabled={steps.length <= 1}
            className="p-1.5 rounded-xl hover:bg-rose-500/20 text-rose-400 disabled:opacity-30 transition"
            title="Delete this step"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── MAIN WORKSPACE GRID: TOOLBAR, CANVAS & AI MECHANISM COPILOT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT TOOLBAR PALETTE (Col 1-2) */}
        <div className="lg:col-span-2 space-y-3">
          {/* Electron-Pushing Tools */}
          <div className="glass-panel p-3 rounded-2xl border border-[var(--border-subtle)] space-y-2">
            <div className="text-[10px] font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <CornerDownRight className="w-3 h-3" />
              <span>Electron-Pushing</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => setActiveTool('arrow_pair')}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-bold flex items-center justify-between border transition ${
                  activeTool === 'arrow_pair'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-md'
                    : 'bg-white/5 border-transparent text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300 font-bold">↷</span>
                  <span>2e⁻ Arrow (Pair)</span>
                </div>
                <span className="text-[9px] opacity-70">Double-barb</span>
              </button>

              <button
                onClick={() => setActiveTool('arrow_single')}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-bold flex items-center justify-between border transition ${
                  activeTool === 'arrow_single'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                    : 'bg-white/5 border-transparent text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-amber-300 font-bold">⇀</span>
                  <span>1e⁻ Fishhook</span>
                </div>
                <span className="text-[9px] opacity-70">Radical</span>
              </button>
            </div>
          </div>

          {/* Molecular Drawing Tools */}
          <div className="glass-panel p-3 rounded-2xl border border-[var(--border-subtle)] space-y-2">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <PenTool className="w-3 h-3 text-cyan-400" />
              <span>Structure CAD</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'select', label: 'Select / Move', icon: MousePointer2 },
                { id: 'bond', label: 'Bond', icon: Zap },
                { id: 'charge_pos', label: '(+) Charge', icon: Plus },
                { id: 'charge_neg', label: '(-) Charge', icon: Sparkles },
                { id: 'radical', label: '(•) Radical', icon: Atom },
                { id: 'eraser', label: 'Eraser', icon: Trash2 }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTool(id)}
                  className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition ${
                    activeTool === id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-md'
                      : 'bg-white/5 border-transparent text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{label}</span>
                </button>
              ))}
            </div>

            {/* Bond Type Selector */}
            <div className="pt-1">
              <div className="text-[9px] text-slate-400 mb-1">Bond Type:</div>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'single', label: '— 1' },
                  { id: 'double', label: '═ 2' },
                  { id: 'triple', label: '≡ 3' },
                  { id: 'aromatic', label: '∷ Arom' },
                  { id: 'wedge', label: '▲ Wedge' },
                  { id: 'dash', label: '▤ Dash' }
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setActiveBondType(b.id);
                      setActiveTool('bond');
                    }}
                    className={`py-1 text-[10px] rounded-lg border font-mono transition ${
                      activeBondType === b.id && activeTool === 'bond'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black'
                        : 'bg-white/5 border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Elements */}
            <div className="pt-1">
              <div className="text-[9px] text-slate-400 mb-1">Active Atom:</div>
              <div className="grid grid-cols-4 gap-1">
                {['C', 'H', 'N', 'O', 'F', 'P', 'S', 'Cl', 'Br', 'I', 'B', 'Al'].map((el) => (
                  <button
                    key={el}
                    onClick={() => setActiveElement(el)}
                    className={`py-1 text-[10px] rounded-lg border font-mono transition ${
                      activeElement === el
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black'
                        : 'bg-white/5 border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {el}
                  </button>
                ))}
              </div>
            </div>

            {/* Fragment Button */}
            <button
              onClick={() => setShowFragmentModal(true)}
              className="w-full mt-2 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Fragment Library</span>
            </button>
          </div>
        </div>

        {/* CENTER INTERACTIVE MECHANISM CANVAS (Col 3-8) */}
        <div className="lg:col-span-6 space-y-3">
          {/* STEP HEADER & METADATA BAR */}
          <div className="glass-panel p-3 rounded-2xl border border-[var(--border-subtle)] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={currentStep.title}
                onChange={(e) => updateCurrentStep({ title: e.target.value })}
                className="input-control px-2.5 py-1 text-xs font-bold rounded-xl flex-1 text-cyan-300"
                placeholder="Step Title..."
              />
              <button
                onClick={() => updateCurrentStep({ isTransitionState: !currentStep.isTransitionState })}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition ${
                  currentStep.isTransitionState
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black'
                    : 'bg-white/5 text-slate-400 border-transparent hover:text-white'
                }`}
              >
                Transition State [‡]
              </button>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
                className="p-1 rounded-lg hover:bg-white/10"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
                className="p-1 rounded-lg hover:bg-white/10"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setZoom(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className="p-1 rounded-lg hover:bg-white/10"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG INTERACTIVE MECHANISM CANVAS */}
          <div
            ref={containerRef}
            className="relative w-full h-[480px] rounded-3xl overflow-hidden border border-cyan-500/30 bg-[#050811] shadow-2xl"
          >
            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, #06b6d4 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }}
            />

            {/* SVG Canvas */}
            <svg
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            >
              <defs>
                {/* 2-Electron Double-Barbed Arrowhead Marker */}
                <marker
                  id="arrowhead_pair"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
                </marker>

                {/* 1-Electron Single-Fishhook Arrowhead Marker */}
                <marker
                  id="arrowhead_fishhook"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 3 5 z" fill="#f59e0b" />
                </marker>
              </defs>

              <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}>
                {/* 1. BONDS */}
                {currentStep.bonds?.map((bond) => {
                  const a1 = currentStep.atoms.find((a) => a.id === bond.from);
                  const a2 = currentStep.atoms.find((a) => a.id === bond.to);
                  if (!a1 || !a2) return null;

                  const isHovered = hoveredBondId === bond.id;
                  const isSelected = selectedBondId === bond.id;
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
                    </g>
                  );
                })}

                {/* 2. LIVE BOND DRAWING PREVIEW */}
                {isDrawingBond && bondStartAtomId && (
                  (() => {
                    const startAtom = currentStep.atoms.find((a) => a.id === bondStartAtomId);
                    if (!startAtom) return null;
                    return (
                      <line
                        x1={startAtom.x}
                        y1={startAtom.y}
                        x2={bondCurrentMouse.x}
                        y2={bondCurrentMouse.y}
                        stroke="#06b6d4"
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                      />
                    );
                  })()
                )}

                {/* 3. CURVED ELECTRON ARROWS */}
                {currentStep.arrows?.map((arr) => renderArrowPath(arr, false))}

                {/* 4. LIVE DRAFT ARROW PREVIEW */}
                {arrowDraft && renderArrowPath(arrowDraft, true)}

                {/* 5. ATOMS */}
                {currentStep.atoms?.map((atom) => {
                  const isHovered = hoveredAtomId === atom.id;
                  const isSelected = selectedAtomId === atom.id;
                  const isC = atom.element === 'C';

                  return (
                    <g key={atom.id} transform={`translate(${atom.x}, ${atom.y})`}>
                      {/* Atom Halo on Hover/Select */}
                      {(isHovered || isSelected) && (
                        <circle
                          r={16}
                          fill={isSelected ? '#a855f720' : '#06b6d420'}
                          stroke={isSelected ? '#a855f7' : '#06b6d4'}
                          strokeWidth={1.5}
                        />
                      )}

                      {/* Carbon center dot or Heteroatom Label */}
                      {isC && !atom.label ? (
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

                      {/* Formal Charge Badge */}
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

                      {/* Radical Dot Badge */}
                      {atom.radical && (
                        <circle cx={8} cy={-8} r={2.5} fill="#f59e0b" />
                      )}

                      {/* Descriptive Label (e.g. Nu:⁻, LG, Wheland) */}
                      {atom.label && (
                        <text
                          x={0}
                          y={20}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="9"
                          fontFamily="sans-serif"
                        >
                          {atom.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Floating Quick Action Overlay */}
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Tool: <strong>{activeTool.toUpperCase()}</strong></span>
              <span>• Net Charge: <strong>{stepValidation.netCharge >= 0 ? '+' : ''}{stepValidation.netCharge}</strong></span>
            </div>
          </div>

          {/* STEP CONDITIONS & EXPERIMENTAL DETAILS */}
          <div className="glass-panel p-3 rounded-2xl border border-[var(--border-subtle)] grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Reagent / Catalyst:</label>
              <input
                type="text"
                value={currentStep.reagent || ''}
                onChange={(e) => updateCurrentStep({ reagent: e.target.value })}
                placeholder="e.g. H2SO4, AlCl3, tBuOK"
                className="input-control px-2 py-1 text-xs rounded-lg w-full"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Condition / Temp:</label>
              <input
                type="text"
                value={currentStep.condition || ''}
                onChange={(e) => updateCurrentStep({ condition: e.target.value })}
                placeholder="e.g. 80 °C, Reflux"
                className="input-control px-2 py-1 text-xs rounded-lg w-full"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[10px] text-slate-400 block mb-0.5">Driving Force:</label>
              <input
                type="text"
                value={currentStep.drivingForce || ''}
                onChange={(e) => updateCurrentStep({ drivingForce: e.target.value })}
                placeholder="e.g. Aromatization, H2O removal"
                className="input-control px-2 py-1 text-xs rounded-lg w-full"
              />
            </div>
          </div>
        </div>

        {/* RIGHT AI MECHANISTIC COPILOT & VALIDATION LOG (Col 9-12) */}
        <div className="lg:col-span-4 space-y-3">
          {/* AI MECHANISM COPILOT PANEL */}
          <div className="glass-panel p-4 rounded-3xl border border-cyan-500/30 space-y-3 bg-gradient-to-b from-[#080d1a] to-[#04060c] flex flex-col h-[580px]">
            <div className="flex items-center justify-between border-b border-inherit pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black text-[var(--text-primary)] tracking-wider uppercase">
                  ChemAI Mechanism Copilot
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[9px] font-bold border border-cyan-500/20">
                GPT/GEMINI PRO
              </span>
            </div>

            {/* Quick Action Prompt Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar shrink-0">
              {[
                'Explain Step',
                'Identify Nucleophile',
                'Propose Next Step',
                'Verify Formal Charge'
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleAskAiMechanism(chip)}
                  className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/5 hover:border-cyan-500/30 text-[10px] font-bold whitespace-nowrap transition"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Conversation Stream */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1 text-xs">
              {aiExplanationLog.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/30 ml-4 font-mono text-[11px]'
                      : 'bg-white/5 text-[var(--text-primary)] border border-white/5 mr-2 font-sans leading-relaxed'
                  }`}
                >
                  <div className="text-[9px] font-black text-slate-400 mb-1 uppercase font-mono">
                    {msg.role === 'user' ? 'Scientist Query' : 'ChemAI Mechanistic Engine'}
                  </div>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              ))}

              {isAiAnalyzing && (
                <div className="p-3 rounded-2xl bg-cyan-500/5 text-cyan-400 border border-cyan-500/20 flex items-center gap-2 text-xs font-mono animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>Computing electron orbital transitions &amp; intermediate topologies...</span>
                </div>
              )}
            </div>

            {/* User Query Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAiMechanism();
              }}
              className="relative shrink-0"
            >
              <input
                type="text"
                value={aiPromptInput}
                onChange={(e) => setAiPromptInput(e.target.value)}
                placeholder="Ask AI about this mechanism (e.g. Why is acid catalyst needed?)..."
                className="input-control pl-3 pr-10 py-2 text-xs rounded-xl w-full"
              />
              <button
                type="submit"
                disabled={!aiPromptInput.trim() || isAiAnalyzing}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-slate-950 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── MECHANISM TEMPLATES MODAL ── */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl glass-panel p-6 rounded-3xl border border-cyan-500/40 bg-[#060913] space-y-4 max-h-[85vh] flex flex-col text-xs text-[var(--text-primary)]">
            <div className="flex items-center justify-between border-b border-inherit pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-black uppercase text-white">
                  Organic Reaction Mechanism Templates Library
                </h2>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search templates (e.g. SN2, Fischer, Friedel-Crafts, Diels-Alder, Hydride Reduction)..."
                className="input-control pl-9 pr-3 py-2 text-xs rounded-xl w-full"
              />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
              {MECHANISM_TEMPLATES.filter((t) =>
                t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
                t.class.toLowerCase().includes(templateSearch.toLowerCase())
              ).map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleLoadTemplate(tpl)}
                  className="p-3.5 rounded-2xl inner-box border border-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-xs text-cyan-300 font-bold group-hover:text-cyan-200">
                      {tpl.name}
                    </strong>
                    <span className="px-2 py-0.5 rounded-md bg-black/40 text-cyan-400 font-bold text-[10px]">
                      {tpl.steps.length} Steps
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">{tpl.class} • {tpl.subclass}</div>
                  <p className="text-[11px] text-[var(--text-secondary)] font-sans">{tpl.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FRAGMENT LIBRARY MODAL ── */}
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

            {/* Category tabs */}
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
                    setSelectedFragment(frag);
                    setActiveTool('fragment');
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
    </div>
  );
}
