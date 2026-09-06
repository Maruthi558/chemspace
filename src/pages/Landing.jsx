import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PenTool,
  Cpu,
  Sparkles,
  ArrowRight,
  Activity,
  Award,
  Zap,
  Radio,
  Grid,
  Atom,
  ShieldCheck,
  Layers,
  Clock,
  History,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Compass,
  FlaskConical,
  Binary,
  Microscope,
  Scale,
  GitBranch,
  Dna,
  Bot,
  Workflow,
  Sliders,
  Database,
  Eye,
  RefreshCw,
  Search,
  Check,
  HelpCircle,
  TrendingUp,
  Share2,
  Terminal,
  Code,
  Flame,
  CornerDownLeft
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getRecentActivities } from '../services/activityStore';
import HomeSpecimenShowcase from '../components/HomeSpecimenShowcase';
import HeroScientificCanvas from '../components/HeroScientificCanvas';

export default function Landing() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [recentActivities, setRecentActivities] = useState([]);
  const [activeDiscipline, setActiveDiscipline] = useState('synthetic');
  const [activeWorkflowStage, setActiveWorkflowStage] = useState(0);
  const [aiPromptInput, setAiPromptInput] = useState('');

  useEffect(() => {
    const acts = getRecentActivities();
    if (acts && acts.length > 0) {
      setRecentActivities(acts.slice(0, 3));
    } else {
      setRecentActivities([
        {
          id: 'seed-1',
          type: 'sketch',
          module: 'ChemDraw CAD',
          title: 'Taxol Core Tricyclic Skeleton',
          detail: 'Constructed bridgehead polycyclic core with valence validation; computed MMFF94 conformer.',
          timestamp: Date.now() - 1000 * 60 * 18
        },
        {
          id: 'seed-2',
          type: 'quantum',
          module: 'Quantum Lab',
          title: 'PySCF B3LYP / 6-31G* DFT Scan',
          detail: 'Hartree-Fock SCF converged in 11 cycles. HOMO-LUMO gap computed at 4.28 eV.',
          timestamp: Date.now() - 1000 * 60 * 42
        },
        {
          id: 'seed-3',
          type: 'spectroscopy',
          module: 'Spectroscopy',
          title: 'FTIR Carbonyl Stretch Deconvolution',
          detail: 'Isolated 1715 cm⁻¹ ester peak vs 1680 cm⁻¹ conjugated amide resonance band.',
          timestamp: Date.now() - 1000 * 60 * 125
        }
      ]);
    }
  }, []);

  const handleLaunchCopilot = (customPrompt) => {
    const query = customPrompt || aiPromptInput.trim();
    window.dispatchEvent(
      new CustomEvent('chemspace-open-copilot', {
        detail: {
          prompt: query || 'Explain how to design and validate novel molecular candidates in ChemNova.'
        }
      })
    );
    if (!customPrompt) setAiPromptInput('');
  };

  // Quick Action Hub Items
  const QUICK_ACTIONS = [
    {
      id: 'chemdraw',
      title: 'ChemDraw',
      desc: '2D/3D CAD Sketcher',
      icon: PenTool,
      route: '/chemdraw',
      accent: 'text-amber-500 hover:border-amber-500/40'
    },
    {
      id: 'quantum',
      title: 'Quantum',
      desc: 'PySCF DFT & Orbitals',
      icon: Zap,
      route: '/quantum-library',
      accent: 'text-violet-500 hover:border-violet-500/40'
    },
    {
      id: 'rxn',
      title: 'IBM RXN',
      desc: 'Retrosynthesis & Reactions',
      icon: Activity,
      route: '/ibm-rxn',
      accent: 'text-rose-500 hover:border-rose-500/40'
    },
    {
      id: 'spectroscopy',
      title: 'Spectroscopy',
      desc: 'FTIR • NMR • Mass Spec',
      icon: Radio,
      route: '/spectroscopy',
      accent: 'text-orange-500 hover:border-orange-500/40'
    },
    {
      id: 'chromatography',
      title: 'Chromatography',
      desc: 'HPLC & GC Simulator',
      icon: FlaskConical,
      route: '/chromatography',
      accent: 'text-teal-500 hover:border-teal-500/40'
    },
    {
      id: 'rdkit',
      title: 'RDKit Lab',
      desc: 'Cheminformatics & Descriptors',
      icon: Cpu,
      route: '/rdkit-lab',
      accent: 'text-emerald-500 hover:border-emerald-500/40'
    },
    {
      id: 'table',
      title: 'Periodic Table',
      desc: '118 Elements & Orbitals',
      icon: Grid,
      route: '/periodic-table',
      accent: 'text-sky-500 hover:border-sky-500/40'
    },
    {
      id: 'scientists',
      title: 'Discoveries',
      desc: 'Pioneers & Nobel History',
      icon: Award,
      route: '/scientists',
      accent: 'text-amber-600 hover:border-amber-600/40'
    }
  ];

  // 3 Scientific Disciplines
  const DISCIPLINES = {
    synthetic: {
      id: 'synthetic',
      name: 'Synthetic & Medicinal Chemistry',
      badge: 'Molecular Construction',
      tagline: 'From retrosynthetic disconnections to validated lead candidates',
      description: 'Engineered for synthetic organic chemists designing novel chemical scaffolds, evaluating retrosynthetic disconnection routes, and optimizing drug-like pharmacokinetic profiles.',
      primaryStudio: {
        name: 'ChemDraw Studio',
        route: '/chemdraw',
        action: 'Launch 2D/3D CAD'
      },
      secondaryStudio: {
        name: 'IBM RXN Retrosynthesis',
        route: '/ibm-rxn',
        action: 'Explore Reaction Pathways'
      },
      metrics: [
        { label: 'Valence Engine', val: 'Kekulé & Lewis Rules' },
        { label: 'Chemoinformatics', val: 'Lipinski Ro5 & QED' },
        { label: 'Reaction AI', val: 'Corey Disconnection' }
      ],
      highlights: [
        'Interactive 2D chemical sketching with live stereochemical parity check',
        'Automated MMFF94 force-field conformer relaxation in real time',
        'Transformer-based forward reaction outcomes and retrosynthesis trees'
      ],
      accentColor: 'text-amber-500',
      accentBg: 'bg-amber-500/10',
      accentBorder: 'border-amber-500/30'
    },
    computational: {
      id: 'computational',
      name: 'Computational & Quantum Chemistry',
      badge: 'Ab Initio Electronic Solvers',
      tagline: 'Solving the Schrödinger equation across potential energy surfaces',
      description: 'Dedicated to quantum modelers analyzing frontier molecular orbitals, calculating reaction activation barriers, and predicting spectroscopic bandgaps from first principles.',
      primaryStudio: {
        name: 'Quantum Chemistry Lab',
        route: '/quantum-library',
        action: 'Open PySCF Solvers'
      },
      secondaryStudio: {
        name: 'RDKit Python Lab',
        route: '/rdkit-lab',
        action: 'Chemoinformatics IDE'
      },
      metrics: [
        { label: 'Hamiltonian Solvers', val: 'PySCF DFT / HF' },
        { label: 'Basis Sets', val: 'STO-3G to 6-311G**' },
        { label: 'Orbital Analysis', val: 'HOMO-LUMO Bandgap' }
      ],
      highlights: [
        'Rigorous Hartree-Fock Self-Consistent Field (SCF) convergence engine',
        '3D frontier molecular orbital isosurface generation and nodal mapping',
        '1D & 2D Potential Energy Surface (PES) dihedral rotational scans'
      ],
      accentColor: 'text-violet-500',
      accentBg: 'bg-violet-500/10',
      accentBorder: 'border-violet-500/30'
    },
    analytical: {
      id: 'analytical',
      name: 'Analytical & Separation Chemistry',
      badge: 'Empirical Verification',
      tagline: 'Characterizing molecular identity through spectral resonance and chromatography',
      description: 'Built for analytical scientists deconvolving complex multi-modal spectra, calculating retention factors, and optimizing preparative column chromatography.',
      primaryStudio: {
        name: 'Spectroscopy Suite',
        route: '/spectroscopy',
        action: 'Enter Spectral Suite'
      },
      secondaryStudio: {
        name: 'Chromatography Suite',
        route: '/chromatography',
        action: 'Simulate HPLC Columns'
      },
      metrics: [
        { label: 'Spectral Modes', val: 'FTIR, 1H/13C NMR, MS' },
        { label: 'Plate Theory', val: 'Van Deemter Kinetics' },
        { label: 'Mendeleev Grid', val: '118 Elements Dossier' }
      ],
      highlights: [
        'Multi-modal overlay of FTIR vibrational bands, NMR shifts, and Mass Spec m/z',
        'Interactive baseline subtraction and automated peak centroid deconvolution',
        'Van Deemter column plate height optimization for HPLC and Gas Chromatography'
      ],
      accentColor: 'text-teal-500',
      accentBg: 'bg-teal-500/10',
      accentBorder: 'border-teal-500/30'
    }
  };

  // 7-Stage Scientific Discovery Workflow
  const WORKFLOW_STAGES = [
    {
      step: '01',
      title: 'Structural CAD & Valence Verification',
      workspace: 'ChemDraw Studio',
      route: '/chemdraw',
      badge: 'CAD Hypotheses',
      question: 'How do we design valid carbon scaffolds without synthetic violations?',
      method: 'Enforces Kekulé valency, bond angles, and aromaticity while continuously computing SMILES and 3D MMFF94 conformers.',
      equation: 'E_MMFF94 = \\sum E_{str} + \\sum E_{ang} + \\sum E_{tor} + \\sum E_{vdw} + \\sum E_{elec}',
      tools: ['Lewis Valence Rules', 'Ring Templates', 'Live 3D Conformer', 'SMILES / InChI'],
      color: 'text-amber-500',
      borderColor: 'hover:border-amber-500/40',
      tagBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    },
    {
      step: '02',
      title: 'Chemoinformatics & Property Screening',
      workspace: 'RDKit Python Lab',
      route: '/rdkit-lab',
      badge: 'Virtual Screening',
      question: 'Does this molecular candidate satisfy drug-likeness criteria?',
      method: 'Calculates Lipinski Rule of 5 bioavailability parameters, topological polar surface area (TPSA), and Morgan circular fingerprints.',
      equation: 'LogP \\le 5, \\quad MW \\le 500, \\quad HBD \\le 5, \\quad HBA \\le 10',
      tools: ['Morgan Fingerprints (ECFP4)', 'TPSA & Rotatable Bonds', 'Substructure Queries', 'Exact Mass Spec'],
      color: 'text-emerald-500',
      borderColor: 'hover:border-emerald-500/40',
      tagBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    },
    {
      step: '03',
      title: 'Ab Initio Electronic Structure & DFT',
      workspace: 'Quantum Chemistry Lab',
      route: '/quantum-library',
      badge: 'Quantum Solvers',
      question: 'Where are the nucleophilic and electrophilic reactive centers located?',
      method: 'Solves the non-relativistic electronic Schrödinger equation via Hartree-Fock and B3LYP DFT algorithms to yield frontier orbitals.',
      equation: '\\hat{H}\\Psi = E\\Psi, \\quad \\Delta E_{gap} = E_{LUMO} - E_{HOMO}',
      tools: ['PySCF Engine', 'HOMO-LUMO Bandgap', 'Dipole Moments', 'Potential Energy Scans'],
      color: 'text-violet-500',
      borderColor: 'hover:border-violet-500/40',
      tagBg: 'bg-violet-500/10 text-violet-500 border-violet-500/20'
    },
    {
      step: '04',
      title: 'Retrosynthetic Disconnection Logic',
      workspace: 'IBM RXN Studio',
      route: '/ibm-rxn',
      badge: 'Synthesis Planning',
      question: 'How can this complex target be synthesized from commercially available synthons?',
      method: 'Applies neural sequence-to-sequence transformers trained on patent chemical datasets to recursively dissect strategic bonds.',
      equation: '\\text{Target Molecule} \\xrightarrow{\\text{Corey Disconnection}} \\text{Synthons} \\xrightarrow{\\text{Reagents}} \\text{Building Blocks}',
      tools: ['Retrosynthetic Tree', 'Forward Yield Prediction', 'Atom-Mapping Matrices', 'Reagent Selection'],
      color: 'text-rose-500',
      borderColor: 'hover:border-rose-500/40',
      tagBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
    },
    {
      step: '05',
      title: 'Multi-Modal Spectral Analytics',
      workspace: 'Spectroscopy Suite',
      route: '/spectroscopy',
      badge: 'Structural Proof',
      question: 'Does empirical spectral resonance unequivocally confirm the target structure?',
      method: 'Deconvolves infrared absorption dipoles, nuclear magnetic resonance chemical shifts, and electron ionization fragmentation patterns.',
      equation: '\\nu = \\frac{1}{2\\pi c}\\sqrt{\\frac{k}{\\mu}}, \\quad \\delta = \\frac{\\nu_{sample} - \\nu_{TMS}}{\\nu_0} \\times 10^6',
      tools: ['FTIR Vibration Bands', '1H / 13C NMR Shifts', 'Mass Spec Fragmentation', 'UV-Vis Absorption'],
      color: 'text-orange-500',
      borderColor: 'hover:border-orange-500/40',
      tagBg: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    },
    {
      step: '06',
      title: 'Preparative Separation & Plate Theory',
      workspace: 'Chromatography Suite',
      route: '/chromatography',
      badge: 'Isolation Science',
      question: 'What is the optimal mobile phase velocity and column stationary phase to isolate pure enantiomers?',
      method: 'Models partition thermodynamics and band-broadening dispersion kinetics via the Van Deemter column efficiency equation.',
      equation: 'H = A + \\frac{B}{u} + C \\cdot u, \\quad R_s = \\frac{2(t_{R2} - t_{R1})}{W_1 + W_2}',
      tools: ['Van Deemter Curves', 'Retention Factor (Rf)', 'Column Efficiency (N)', 'Resolution Factor (Rs)'],
      color: 'text-teal-500',
      borderColor: 'hover:border-teal-500/40',
      tagBg: 'bg-teal-500/10 text-teal-500 border-teal-500/20'
    },
    {
      step: '07',
      title: 'Autonomous Research & Mechanism AI',
      workspace: 'ChemAI Copilot',
      isCopilot: true,
      badge: 'Sidecar Intelligence',
      question: 'How do we synthesize literature findings and resolve computational discrepancies?',
      method: 'Coordinates multimodal analysis across all workspace states to provide contextual explanations, reaction mechanisms, and literature citations.',
      equation: '\\text{Context}(\\text{Structure}, \\text{DFT}, \\text{Spectra}) \\xrightarrow{\\text{ChemAI}} \\text{Scientific Synthesis}',
      tools: ['Mechanism Analysis', 'Spectral Interpretation', 'Literature Correlation', 'Stateful Sidecar'],
      color: 'text-amber-400',
      borderColor: 'hover:border-amber-400/40',
      tagBg: 'bg-amber-400/10 text-amber-400 border-amber-400/20'
    }
  ];

  // 8 Primary Dedicated Studios
  const SCIENTIFIC_SUITES = [
    {
      id: 'chemdraw',
      title: 'ChemDraw Studio',
      subtitle: '2D Chemical CAD & Live 3D Optimization',
      signature: 'MMFF94 Conformer Minimization',
      formula: 'E_MMFF94 = \\sum E_{b} + \\sum E_{\\theta} + \\sum E_{\\phi}',
      description: 'Precision molecular sketcher with valence enforcement, aromatic ring templates, SMILES/InChI export, and real-time synchronized 3D conformer preview.',
      capabilities: ['Valence validation', 'Clean 2D layout', 'MMFF94 3D minimization', 'SMILES / InChI export'],
      icon: PenTool,
      route: '/chemdraw',
      badge: '2D/3D CAD',
      badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      borderHover: 'hover:border-amber-500/40',
      color: 'text-amber-500'
    },
    {
      id: 'rdkit',
      title: 'RDKit Python Lab',
      subtitle: 'Input-Driven Chemoinformatics IDE',
      signature: 'Lipinski Rule of 5 & Morgan Vectors',
      formula: 'ECFP4 \\in \\{0,1\\}^{2048}, \\quad QED \\in [0, 1]',
      description: 'Execute Python RDKit workflows, calculate Lipinski Rule of 5 bioavailability parameters, exact molecular mass, and render high-resolution 2D and 3D molecular structures.',
      capabilities: ['Morgan fingerprints', 'Substructure searching', 'Lipinski filtering', 'Conformer ensembles'],
      icon: Cpu,
      route: '/rdkit-lab',
      badge: 'Chemoinformatics',
      badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      borderHover: 'hover:border-emerald-500/40',
      color: 'text-emerald-500'
    },
    {
      id: 'quantum-library',
      title: 'Quantum Chemistry Lab',
      subtitle: 'Ab Initio Electronic Structure & DFT',
      signature: 'PySCF Hartree-Fock & B3LYP Density Functional',
      formula: '\\hat{H}_{el} = -\\sum_i \\frac{1}{2}\\nabla_i^2 - \\sum_{i,A} \\frac{Z_A}{r_{iA}} + \\sum_{i<j} \\frac{1}{r_{ij}}',
      description: 'Computational chemistry workspace for PySCF, ORCA, and PSI4. Analyze HOMO-LUMO orbitals, 1D PES scans, and self-consistent field convergence.',
      capabilities: ['Hartree-Fock / DFT', 'HOMO-LUMO bandgaps', 'Potential energy surfaces', 'Dipole moments'],
      icon: Zap,
      route: '/quantum-library',
      badge: 'Quantum CAD',
      badgeClass: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
      borderHover: 'hover:border-violet-500/40',
      color: 'text-violet-500'
    },
    {
      id: 'spectroscopy',
      title: 'Spectroscopy Suite',
      subtitle: 'Multi-Modal Spectral Analytics',
      signature: 'FTIR, 1H/13C NMR & Mass Spectrometry',
      formula: '\\nu = \\frac{1}{2\\pi c}\\sqrt{\\frac{k}{\\mu}}, \\quad \\Delta E = h\\nu',
      description: 'Interactive FTIR, 1H-NMR, 13C-NMR, Mass Spectrometry, and UV-Vis absorption spectrum visualizer with automated peak deconvolution.',
      capabilities: ['FTIR vibration bands', '1H & 13C NMR shifts', 'Mass spec m/z peaks', 'Peak deconvolution'],
      icon: Radio,
      route: '/spectroscopy',
      badge: 'Analytical',
      badgeClass: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      borderHover: 'hover:border-orange-500/40',
      color: 'text-orange-500'
    },
    {
      id: 'chromatography',
      title: 'Chromatography Suite',
      subtitle: 'HPLC, GC & Separation Science',
      signature: 'Van Deemter Plate Theory & Retention Factors',
      formula: 'H = A + \\frac{B}{u} + C \\cdot u, \\quad k\' = \\frac{t_R - t_0}{t_0}',
      description: 'Simulate chromatographic column separation, retention factors (Rf), Van Deemter column efficiency curves, and partition thermodynamics.',
      capabilities: ['Retention time modeling', 'Van Deemter curves', 'Peak resolution (Rs)', 'Isocratic / Gradient'],
      icon: FlaskConical,
      route: '/chromatography',
      badge: 'Separation',
      badgeClass: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
      borderHover: 'hover:border-teal-500/40',
      color: 'text-teal-500'
    },
    {
      id: 'ibm-rxn',
      title: 'IBM RXN Studio',
      subtitle: 'Reaction Prediction & Retrosynthesis',
      signature: 'Sequence-to-Sequence AI Reaction Models',
      formula: 'P(\\text{Products} \\mid \\text{Reactants}, \\text{Reagents}) \\rightarrow \\text{Corey Tree}',
      description: 'Predict organic reaction pathways, forward reaction outcomes, automated atom-mapping, and multi-step retrosynthetic disconnection trees.',
      capabilities: ['Retrosynthetic trees', 'Forward yield estimation', 'Atom-mapping matrices', 'Synthon generation'],
      icon: Activity,
      route: '/ibm-rxn',
      badge: 'Synthesis AI',
      badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      borderHover: 'hover:border-rose-500/40',
      color: 'text-rose-500'
    },
    {
      id: 'periodic-table',
      title: 'Periodic Table of Elements',
      subtitle: '118 Elements & Electronic Orbitals',
      signature: 'Mendeleev Grid & Pauli Aufbau Principle',
      formula: '1s^2 \\; 2s^2 \\; 2p^6 \\; 3s^2 \\; 3p^6 \\; 4s^2 \\; 3d^{10} \\dots',
      description: 'Interactive Mendeleev grid with electron configurations, electronegativity trends, ionization energies, and 3D atomic orbital representations.',
      capabilities: ['s/p/d/f block trends', 'Electron shell diagrams', 'Element dossiers', 'Ionization energies'],
      icon: Grid,
      route: '/periodic-table',
      badge: 'Mendeleev Grid',
      badgeClass: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
      borderHover: 'hover:border-sky-500/40',
      color: 'text-sky-500'
    },
    {
      id: 'scientists',
      title: 'Discoveries Gallery',
      subtitle: 'Nobel Laureates & Chemical Pioneers',
      signature: 'Archival Records of Molecular Breakthroughs',
      formula: '1869 \\rightarrow 1911 \\rightarrow 1939 \\rightarrow 1965 \\rightarrow 2024',
      description: 'Explore landmark discoveries of pioneering chemists with Nobel citations and interactive 3D signature molecular structures.',
      capabilities: ['Nobel citations', 'Key historical papers', 'Landmark molecules', 'Archival biographies'],
      icon: Award,
      route: '/scientists',
      badge: 'Nobel History',
      badgeClass: 'bg-amber-600/10 text-amber-600 border-amber-600/20',
      borderHover: 'hover:border-amber-600/40',
      color: 'text-amber-600'
    }
  ];

  // 5 Pillars of Human Chemical Labor
  const HUMAN_PILLARS = [
    {
      num: '01',
      title: 'Molecular Architecture & Retrosynthesis',
      tagline: 'Deconstructing complex carbon skeletons into accessible synthons',
      text: 'Human synthetic chemists do not simply combine reagents—they engineer molecular architecture. Through retrosynthetic analysis pioneered by E.J. Corey, chemists work backward from a target natural product or pharmaceutical API, identifying key disconnections, evaluating functional group interconversions (FGI), and navigating stereocenters.',
      icon: GitBranch,
      tools: 'Retrosynthesis Trees • Atom Mapping • Corey Disconnection Logic',
      accentColor: 'text-amber-500',
      borderClass: 'hover:border-amber-500/30'
    },
    {
      num: '02',
      title: 'Chemoinformatics & Conformational Exploration',
      tagline: 'Translating stereochemistry into computable mathematical vectors',
      text: 'Molecules are dynamic entities that flex across continuous potential energy surfaces. Chemoinformaticians compute Lipinski Rule of 5 bioavailability parameters, Morgan circular fingerprints, and rotatable bond ensembles to screen millions of virtual candidates before a single milligram is synthesized in the fume hood.',
      icon: Binary,
      tools: 'RDKit Engine • MMFF94 Minimization • Lipinski Screening',
      accentColor: 'text-emerald-500',
      borderClass: 'hover:border-emerald-500/30'
    },
    {
      num: '03',
      title: 'Ab Initio Quantum Mechanics & Electronic Orbitals',
      tagline: 'Solving the non-relativistic Schrödinger equation for electronic structure',
      text: 'Chemical reactivity is governed by electronic wavefunctions. By employing Hartree-Fock self-consistent field algorithms and Density Functional Theory (DFT/B3LYP), computational chemists compute Frontier Molecular Orbitals (HOMO and LUMO) to locate nucleophilic and electrophilic reaction centers and predict transition states.',
      icon: Zap,
      tools: 'PySCF DFT Solvers • HOMO-LUMO Orbitals • Energy Scans',
      accentColor: 'text-violet-500',
      borderClass: 'hover:border-violet-500/30'
    },
    {
      num: '04',
      title: 'Empirical Spectroscopy & Peak Deconvolution',
      tagline: 'Extracting indisputable structural proof from resonance and absorption',
      text: 'Analytical chemistry bridges theoretical models with physical reality. Researchers cross-correlate characteristic vibrational stretching frequencies in FTIR, chemical shift coupling in 1H/13C NMR, and fragmentation m/z peaks in Mass Spectrometry to prove constitutional connectivity and stereochemical purity.',
      icon: Microscope,
      tools: 'FTIR Vibration Bands • 1H/13C NMR • Mass Spectrometry',
      accentColor: 'text-orange-500',
      borderClass: 'hover:border-orange-500/30'
    },
    {
      num: '05',
      title: 'Separation Science & Partition Thermodynamics',
      tagline: 'Isolating pure chemical entities through differential phase equilibria',
      text: 'Synthesizing a compound is only half the battle; isolating it from reaction byproducts requires mastery over thermodynamics. In High-Performance Liquid Chromatography (HPLC) and Gas Chromatography, chemists balance retention factors (Rf), stationary phase selectivity, and Van Deemter column band-broadening.',
      icon: Scale,
      tools: 'HPLC Column Modeling • Van Deemter Kinetics • Partition Theory',
      accentColor: 'text-teal-500',
      borderClass: 'hover:border-teal-500/30'
    }
  ];

  // Landmark Discoveries & Nobel Heritage
  const LANDMARKS = [
    {
      year: '1869',
      scientist: 'Dmitri Mendeleev',
      title: 'The Periodic Law of the Chemical Elements',
      connection: 'Powers ChemNova\'s 118-element interactive Mendeleev grid and atomic orbital properties.',
      summary: 'Arranged elements by atomic weight and valency, predicting with startling accuracy the physical properties of then-undiscovered gallium, scandium, and germanium.',
      quote: 'I saw in a dream a table where all elements fell into place as required. Awakening, I immediately wrote it down on a piece of paper.'
    },
    {
      year: '1911',
      scientist: 'Marie Skłodowska-Curie',
      title: 'Isolation of Radium & Discovery of Radioactivity',
      connection: 'Laid the experimental foundation for nuclear physics, isotopic labeling, and mass spectrometry.',
      summary: 'Tirelessly processed metric tons of pitchblende ore by hand fractional crystallization to isolate pure metallic radium, earning two unshared Nobel Prizes.',
      quote: 'Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.'
    },
    {
      year: '1939',
      scientist: 'Linus Pauling',
      title: 'The Nature of the Chemical Bond',
      connection: 'Directly informs the valence enforcement rules and hybridization algorithms in ChemDraw Studio.',
      summary: 'Applied quantum mechanics to molecular geometry, introducing orbital hybridization (sp3, sp2, sp), electronegativity scales, and resonance theory.',
      quote: 'The best way to have a good idea is to have a lot of ideas and throw the bad ones away.'
    },
    {
      year: '1964',
      scientist: 'Dorothy Crowfoot Hodgkin',
      title: 'X-Ray Structure of Penicillin & Vitamin B12',
      connection: 'Precursor to the 3D conformer coordinates and spatial atomic visualization in ChemNova.',
      summary: 'Deciphered the intricate three-dimensional atomic structures of complex biomolecules using X-ray crystallography, confirming the beta-lactam core of penicillin.',
      quote: 'I used to say I was captured by penicillin, but Vitamin B12 held me for thirty-five years in fascinated admiration.'
    },
    {
      year: '1965',
      scientist: 'Robert Burns Woodward',
      title: 'The Art of Organic Total Synthesis',
      connection: 'The intellectual antecedent of retrosynthetic tree planning in ChemNova\'s IBM RXN Studio.',
      summary: 'Synthesized quinine, cholesterol, cortisone, strychnine, and vitamin B12, demonstrating that organic synthesis is an art form driven by human logic and stereochemical rules.',
      quote: 'There is excitement, adventure, and challenge in the synthesis of organic compounds, which can be shared with all who practice it.'
    }
  ];

  // Quick Prompt Chips for the AI Launcher
  const AI_SAMPLE_PROMPTS = [
    'Predict retrosynthesis for ibuprofen',
    'Calculate HOMO-LUMO gap of benzene in PySCF',
    'Deconvolve 1715 cm⁻¹ carbonyl FTIR peak',
    'Explain Van Deemter HPLC plate height equation'
  ];

  const currentDiscipline = DISCIPLINES[activeDiscipline];
  const activeWorkflow = WORKFLOW_STAGES[activeWorkflowStage];

  return (
    <div className="workspace-container select-none space-y-12 pb-16">
      {/* ====================================================================
          1. EDITORIAL HERO SECTION — Architectural Brand Lockup & Briefing
          ==================================================================== */}
      <section className="art-card p-8 sm:p-12 lg:p-14 rounded-[36px] relative overflow-hidden border border-[var(--border-subtle)] shadow-xl">
        {/* 3D WebGL Atmospheric Canvas Background */}
        <HeroScientificCanvas />

        {/* Ambient Gradient Glows */}
        <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-gradient-to-tr from-violet-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl space-y-7 text-left">
          {/* Architectural Brand Telemetry Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="telemetry-pill">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-bold tracking-widest uppercase">CHEMNOVA // MOLECULAR INTELLIGENCE WORKBENCH</span>
              </div>
              <span className="text-[11px] font-mono text-[var(--text-muted)] hidden sm:inline-block">
                VER 2.4.0 • ACCELERATED WEBGL
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>RDKit C++ Kernel</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                <span>PySCF Solvers</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span>118 Elements</span>
              </span>
            </div>
          </div>

          {/* Primary Editorial Headline & Manifesto */}
          <div className="space-y-4">
            <div className="inline-block">
              <span className="text-xs font-mono font-bold tracking-widest text-amber-500 uppercase">
                SCIENTIFIC COMPUTING REIMAGINED
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-primary)] font-serif-editorial leading-[1.08]">
              The Architecture of <br />
              <span className="italic bg-gradient-to-r from-amber-600 via-amber-500 to-teal-500 bg-clip-text text-transparent">
                Molecular Matter.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] font-sans max-w-3xl font-normal leading-relaxed">
              ChemNova unites chemical CAD, chemoinformatics, ab initio quantum Hamiltonian solvers, reaction AI, and analytical spectroscopy into a single, cohesive research workbench. Engineered to replace fragmented desktop software with an intuitive, unified platform for human discovery.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => navigate('/chemdraw')}
              className="btn-horizontal btn-primary text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
              title="Open ChemDraw 2D/3D Molecular CAD"
            >
              <PenTool className="w-4 h-4" />
              <span>ChemDraw</span>
            </button>
            <button
              onClick={() => navigate('/rdkit-lab')}
              className="btn-horizontal btn-secondary text-xs font-bold flex items-center gap-2 cursor-pointer"
              title="Open RDKit Cheminformatics & Descriptors"
            >
              <Cpu className="w-4 h-4 text-emerald-500" />
              <span>RDKit Lab</span>
            </button>
            <button
              onClick={() => navigate('/quantum-library')}
              className="btn-horizontal btn-secondary text-xs font-bold flex items-center gap-2 cursor-pointer"
              title="Open Quantum Chemistry & DFT Solvers"
            >
              <Zap className="w-4 h-4 text-violet-500" />
              <span>Quantum</span>
            </button>
            <button
              onClick={() => navigate('/spectroscopy')}
              className="btn-horizontal btn-secondary text-xs font-bold flex items-center gap-2 cursor-pointer"
              title="Open Spectroscopy (FTIR • NMR • Mass Spec)"
            >
              <Radio className="w-4 h-4 text-orange-500" />
              <span>Spectroscopy</span>
            </button>
            <button
              onClick={() => handleLaunchCopilot()}
              className="btn-horizontal btn-secondary text-xs font-bold flex items-center gap-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 cursor-pointer"
              title="Ask ChemAI Copilot Research Assistant"
            >
              <Bot className="w-4 h-4 text-amber-500" />
              <span>ChemAI</span>
            </button>
          </div>

          {/* Interactive Lightweight ChemAI Search & Query Bar */}
          <div className="pt-2">
            <div className="p-3 sm:p-3.5 rounded-2xl inner-box border border-amber-500/30 bg-black/20 backdrop-blur-md space-y-2.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLaunchCopilot();
                }}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2 text-amber-500 pl-2">
                  <Bot className="w-4 h-4" />
                  <span className="text-[11px] font-mono font-bold uppercase hidden sm:inline">Ask ChemAI</span>
                </div>
                <input
                  type="text"
                  value={aiPromptInput}
                  onChange={(e) => setAiPromptInput(e.target.value)}
                  placeholder="Pose a synthetic mechanism question, query quantum bandgaps, or deconvolve spectra..."
                  className="w-full bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none px-2 font-sans"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-md"
                >
                  <span>Query AI</span>
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Sample Prompt Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[var(--border-subtle)] text-[10px] font-mono">
                <span className="text-[var(--text-muted)] uppercase mr-1">Quick Inquiries:</span>
                {AI_SAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLaunchCopilot(prompt)}
                    className="px-2.5 py-1 rounded-lg bg-[var(--bg-primary)]/70 hover:bg-amber-500/20 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-amber-500/40 transition text-left truncate max-w-[240px]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Micro Scientific Telemetry Strip */}
          <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-[var(--text-secondary)]">
            <div>
              <span className="block text-[10px] text-[var(--text-muted)] uppercase">Conformer Model</span>
              <span className="font-bold text-[var(--text-primary)]">MMFF94 / UFF Forcefield</span>
            </div>
            <div>
              <span className="block text-[10px] text-[var(--text-muted)] uppercase">Quantum Solvers</span>
              <span className="font-bold text-[var(--text-primary)]">PySCF DFT &amp; Hartree-Fock</span>
            </div>
            <div>
              <span className="block text-[10px] text-[var(--text-muted)] uppercase">Spectral Database</span>
              <span className="font-bold text-[var(--text-primary)]">FTIR, 1H/13C NMR, Mass Spec</span>
            </div>
            <div>
              <span className="block text-[10px] text-[var(--text-muted)] uppercase">Reaction Engine</span>
              <span className="font-bold text-rose-500">Transformer Retrosynthesis</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. SMART QUICK ACTIONS BAR — Instant Studio Access Hub
          ==================================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="telemetry-pill text-[10px]">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>COMMAND LAUNCHPAD</span>
            </span>
            <span className="text-xs font-mono font-bold text-[var(--text-primary)] hidden sm:inline">
              Smart Quick Actions
            </span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            DIRECT BENCH ACCESS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => navigate(action.route)}
                className={`art-card p-3.5 rounded-2xl border border-[var(--border-subtle)] ${action.accent} transition-all duration-200 hover:-translate-y-1 text-left flex flex-col justify-between group shadow-sm`}
              >
                <div className="w-8 h-8 rounded-xl inner-box flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors truncate">
                    {action.title}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)] truncate mt-0.5">
                    {action.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ====================================================================
          3. GUIDED ENTRY BY DISCIPLINE — Interactive Scientific Lenses
          ==================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="telemetry-pill text-[10px]">
                <Compass className="w-3.5 h-3.5 text-amber-500" />
                <span>GUIDED ENTRY POINTS</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] font-serif-editorial">
              Explore by Chemical Discipline
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5 max-w-xl">
              Select your primary field of research to configure tailored workflows, calculation models, and studio launchpads.
            </p>
          </div>

          {/* 3 Discipline Toggle Tabs */}
          <div className="flex items-center p-1 rounded-2xl inner-box border border-[var(--border-subtle)] self-start sm:self-auto">
            {Object.values(DISCIPLINES).map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveDiscipline(d.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeDiscipline === d.id
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {d.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Discipline Dossier Card */}
        <div className={`art-card p-7 sm:p-8 rounded-3xl border border-[var(--border-subtle)] transition-all ${currentDiscipline.accentBorder}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Discipline Overview & Methodology */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${currentDiscipline.accentBg} ${currentDiscipline.accentColor} ${currentDiscipline.accentBorder}`}>
                  {currentDiscipline.badge}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {currentDiscipline.tagline}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-[var(--text-primary)] font-serif-editorial">
                {currentDiscipline.name}
              </h3>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                {currentDiscipline.description}
              </p>

              {/* Bullet Highlights */}
              <div className="space-y-2 pt-1">
                {currentDiscipline.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] font-sans">
                    <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${currentDiscipline.accentColor}`} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons for this Discipline */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() => navigate(currentDiscipline.primaryStudio.route)}
                  className="btn-horizontal btn-primary text-xs font-bold flex items-center gap-2"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>{currentDiscipline.primaryStudio.action}</span>
                </button>
                <button
                  onClick={() => navigate(currentDiscipline.secondaryStudio.route)}
                  className="btn-horizontal btn-secondary text-xs font-bold flex items-center gap-2"
                >
                  <span>{currentDiscipline.secondaryStudio.action}</span>
                </button>
              </div>
            </div>

            {/* Right: Telemetry Metrics Box */}
            <div className="lg:col-span-5 p-6 rounded-2xl inner-box border border-[var(--border-subtle)] space-y-4">
              <div className="flex items-center justify-between border-b border-inherit pb-2">
                <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  Discipline Specifications
                </span>
                <span className={`text-[10px] font-mono font-bold ${currentDiscipline.accentColor}`}>
                  LIVE ENGINE
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {currentDiscipline.metrics.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-primary)]/40 border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)] text-[11px]">{m.label}</span>
                    <span className="font-bold text-[var(--text-primary)]">{m.val}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[10px] font-mono text-[var(--text-muted)] flex items-center justify-between">
                <span>Hardware Acceleration</span>
                <span className="text-emerald-500 font-bold">Enabled (WebGL 2.0)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. INTERACTIVE 3D SPECIMEN SHOWCASE — Museum-Grade WebGL Viewer
          ==================================================================== */}
      <section id="showcase" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="telemetry-pill text-[10px]">
                <Atom className="w-3.5 h-3.5 text-amber-500" />
                <span>ARCHIVAL SPECIMEN CABINET</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] font-serif-editorial">
              Interactive 3D Molecular Showcase
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5 max-w-xl">
              Inspect chemical structures with real-time atomic hover raycasting, ball-and-stick / space-filling representations, and physical properties.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)] self-start sm:self-auto">
            WebGL RAYCASTING ENGINE
          </span>
        </div>

        <HomeSpecimenShowcase />
      </section>

      {/* ====================================================================
          5. THE SCIENTIFIC DISCOVERY PIPELINE — Interactive 7-Stage Journey
          ==================================================================== */}
      <section className="art-card p-8 sm:p-10 rounded-3xl border border-[var(--border-subtle)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="telemetry-pill text-[10px]">
                <Workflow className="w-3.5 h-3.5 text-teal-500" />
                <span>END-TO-END RESEARCH LIFECYCLE</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] font-serif-editorial">
              The Systematic Discovery Pipeline
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-sans max-w-2xl">
              From an initial 2D Lewis hypothesis to quantum orbital modeling, retrosynthesis, and empirical spectral verification: explore each milestone of the scientific workflow.
            </p>
          </div>

          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            CLICK ANY STAGE TO INSPECT
          </span>
        </div>

        {/* 7 Step Interactive Pills / Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          {WORKFLOW_STAGES.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setActiveWorkflowStage(idx)}
              className={`p-3 rounded-2xl inner-box border text-left transition-all ${
                activeWorkflowStage === idx
                  ? 'border-amber-500 shadow-md bg-amber-500/10'
                  : 'border-[var(--border-subtle)] hover:border-amber-500/40'
              }`}
            >
              <div className={`text-[10px] font-mono font-black ${s.color}`}>STAGE {s.step}</div>
              <div className="text-xs font-bold text-[var(--text-primary)] truncate mt-1">{s.workspace}</div>
              <div className="text-[10px] font-mono text-[var(--text-muted)] truncate">{s.badge}</div>
            </button>
          ))}
        </div>

        {/* Active Stage Detailed Inspector Panel */}
        <div className="p-6 sm:p-7 rounded-2xl inner-box border border-[var(--border-subtle)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-inherit pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${activeWorkflow.tagBg}`}>
                  STAGE {activeWorkflow.step} • {activeWorkflow.badge}
                </span>
                <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                  {activeWorkflow.workspace}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] font-serif-editorial">
                {activeWorkflow.title}
              </h3>
            </div>

            {activeWorkflow.isCopilot ? (
              <button
                onClick={() => handleLaunchCopilot()}
                className="btn-horizontal btn-primary text-xs font-bold self-start sm:self-auto flex items-center gap-2 border-amber-500 text-amber-500"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Open ChemAI Copilot</span>
              </button>
            ) : (
              <button
                onClick={() => navigate(activeWorkflow.route)}
                className="btn-horizontal btn-primary text-xs font-bold self-start sm:self-auto flex items-center gap-2"
              >
                <span>Enter {activeWorkflow.workspace}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Scientific Question & Method */}
            <div className="lg:col-span-7 space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] block">
                  Fundamental Scientific Inquiry
                </span>
                <p className="text-sm font-medium text-[var(--text-primary)] italic font-serif-editorial mt-0.5">
                  "{activeWorkflow.question}"
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] block">
                  Computational &amp; Experimental Methodology
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed mt-0.5">
                  {activeWorkflow.method}
                </p>
              </div>

              {/* Tools & Algorithms Chip Strip */}
              <div className="pt-2">
                <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] block mb-1.5">
                  Core Algorithms &amp; Standards
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeWorkflow.tools.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Mathematical Model / Governing Equation */}
            <div className="lg:col-span-5 p-4 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-subtle)] space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-amber-500 block">
                  Governing Formalism
                </span>
                <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-primary)] my-2 overflow-x-auto text-center font-bold">
                  {activeWorkflow.equation}
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] font-mono">
                Rigorous mathematical formulation implemented directly in ChemNova's calculation engines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. CURATED SCIENTIFIC WORKSPACES GRID — All 8 Primary Studios + Copilot
          ==================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="telemetry-pill text-[10px]">
                <Layers className="w-3.5 h-3.5 text-teal-500" />
                <span>8 DEDICATED RESEARCH STUDIOS</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] font-serif-editorial">
              Primary Scientific Workspaces
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5 max-w-xl">
              Select any workspace below to enter a specialized, desktop-first laboratory environment.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)] self-start sm:self-auto">
            STANDALONE WORKBENCHES
          </span>
        </div>

        {/* 8 Workspaces Grid (4 cols on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {SCIENTIFIC_SUITES.map((module) => {
            const Icon = module.icon;

            return (
              <div
                key={module.id}
                onClick={() => navigate(module.route)}
                className={`art-card p-6 rounded-3xl cursor-pointer flex flex-col justify-between group space-y-4 border border-[var(--border-subtle)] ${module.borderHover} transition-all duration-200 hover:-translate-y-1 shadow-md`}
              >
                <div className="space-y-3.5">
                  {/* Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${module.badgeClass}`}>
                      {module.badge}
                    </span>
                    <div className="w-9 h-9 rounded-xl inner-box flex items-center justify-center transition-all group-hover:scale-105">
                      <Icon className={`w-4 h-4 ${module.color}`} />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors font-serif-editorial">
                      {module.title}
                    </h3>
                    <p className="text-[11px] font-mono text-[var(--text-secondary)] mt-0.5">
                      {module.subtitle}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-2.5 line-clamp-3 font-sans">
                      {module.description}
                    </p>
                  </div>

                  {/* Bullet Capabilities */}
                  <div className="space-y-1 pt-1">
                    {module.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-muted)]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Launch Indicator */}
                <div className="pt-3 border-t border-inherit flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
                  <span className="text-[11px] font-bold text-[var(--text-primary)]">Enter Studio</span>
                  <div className="flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform text-amber-500">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ChemAI Copilot Spotlight Banner */}
        <div className="art-card p-6 sm:p-7 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-transparent to-teal-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 text-amber-500" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
                  INTELLIGENCE COMPANION
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  ONLINE
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-serif-editorial">
                ChemAI Copilot: Sidecar Research Intelligence
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-sans max-w-2xl leading-relaxed">
                Pose synthetic questions, query mechanism pathways, analyze spectral anomalies, and interpret complex quantum orbital matrices alongside your workspace.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleLaunchCopilot()}
            className="btn-horizontal btn-primary text-xs font-bold shrink-0 self-start sm:self-auto flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            <span>Open ChemAI Copilot</span>
          </button>
        </div>
      </section>

      {/* ====================================================================
          7. WHY WE BUILT CHEMNOVA — The Unified Platform Manifesto
          ==================================================================== */}
      <section className="art-card p-8 sm:p-12 rounded-3xl border border-[var(--border-subtle)] space-y-8">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="telemetry-pill text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>THE SCIENTIFIC RATIONALE</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] font-serif-editorial">
            Why We Built ChemNova
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
            For three decades, chemical researchers have endured a fragmented labyrinth of legacy software: isolated Java applets, opaque command-line wrappers, incompatible PDB/MOL/XYZ files, and expensive single-purpose utilities.
          </p>
        </div>

        {/* Side-by-Side Comparison: Fragmented Past vs ChemNova */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Legacy Status Quo */}
          <div className="p-6 rounded-2xl inner-box border border-red-500/20 space-y-3">
            <div className="flex items-center justify-between border-b border-inherit pb-2">
              <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-wider">
                The Fragmented Status Quo
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">LEGACY ECOSYSTEM</span>
            </div>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)] font-sans">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✕</span>
                <span>Disconnect between 2D sketching, 3D conformers, and quantum DFT software.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✕</span>
                <span>Endless manual conversions between SMILES, Molfile, InChI, and XYZ formats.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✕</span>
                <span>Command-line Python scripts requiring complex local Fortran/C++ compilation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✕</span>
                <span>Isolated spectroscopy viewers incapable of cross-referencing structure CAD.</span>
              </li>
            </ul>
          </div>

          {/* ChemNova Unified Paradigm */}
          <div className="p-6 rounded-2xl inner-box border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-inherit pb-2">
              <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-wider">
                The ChemNova Unified Workbench
              </span>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">UNIFIED STANDARD</span>
            </div>
            <ul className="space-y-2 text-xs text-[var(--text-primary)] font-sans">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>Single cohesive interface linking 2D CAD, 3D WebGL, and quantum solvers seamlessly.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>Zero installation required: runs natively in modern browsers with WebGL acceleration.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>Integrated chemoinformatics with real-time MMFF94 forcefield minimization.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>Multi-modal analytical suite bridging FTIR, NMR, and Mass Spectrometry with structure.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. THE 5 PILLARS OF HUMAN CHEMICAL LABOR — Deep Scientific Reading
          ==================================================================== */}
      <section className="space-y-6">
        <div className="border-b border-[var(--border-subtle)] pb-4 space-y-1">
          <div className="flex items-center gap-2">
            <span className="telemetry-pill text-[10px]">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>THE SCIENTIFIC INQUIRY</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] font-serif-editorial">
            The Five Pillars of Human Chemical Labor
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-sans max-w-2xl">
            Where human creativity, rigorous chemical intuition, and computational mechanics converge to unlock new molecular entities.
          </p>
        </div>

        {/* 5 Pillar Editorial Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {HUMAN_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            const colSpan = idx < 2 ? 'lg:col-span-6' : 'lg:col-span-4';

            return (
              <div
                key={pillar.num}
                className={`art-card p-6 sm:p-7 rounded-3xl border border-[var(--border-subtle)] ${pillar.borderClass} flex flex-col justify-between space-y-4 transition-all duration-200 ${colSpan}`}
              >
                <div className="space-y-3">
                  {/* Card Header: Number & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-[var(--text-muted)] tracking-widest">
                      PILLAR {pillar.num}
                    </span>
                    <div className="w-9 h-9 rounded-xl inner-box flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${pillar.accentColor}`} />
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] font-serif-editorial leading-snug">
                      {pillar.title}
                    </h3>
                    <p className="text-[11px] font-mono text-[var(--text-secondary)] mt-1 font-medium">
                      {pillar.tagline}
                    </p>
                  </div>

                  {/* Long-form Reading Text */}
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans pt-1">
                    {pillar.text}
                  </p>
                </div>

                {/* Sub-tools Pill */}
                <div className="pt-3 border-t border-inherit flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                  <span>{pillar.tools}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ====================================================================
          9. LANDMARK DISCOVERIES & NOBEL HERITAGE — Archival Excerpts
          ==================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="telemetry-pill text-[10px]">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>ARCHIVAL HISTORICAL CONTEXT</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] font-serif-editorial">
              Landmarks of Human Perseverance
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5 max-w-xl">
              The modern tools of computational chemistry rest on the monumental labor of historical chemical pioneers.
            </p>
          </div>
          <button
            onClick={() => navigate('/scientists')}
            className="btn-horizontal btn-secondary text-xs font-bold self-start sm:self-auto flex items-center gap-2"
          >
            <span>Full Pioneers Archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Landmark Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LANDMARKS.map((lm, idx) => (
            <div
              key={idx}
              className="art-card p-6 sm:p-7 rounded-3xl border border-[var(--border-subtle)] space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    {lm.year} • {lm.scientist}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">NOBEL ARCHIVE</span>
                </div>

                <h3 className="text-lg font-bold text-[var(--text-primary)] font-serif-editorial leading-snug">
                  {lm.title}
                </h3>

                <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                  {lm.summary}
                </p>

                <div className="p-2.5 rounded-xl inner-box border border-[var(--border-subtle)] text-[11px] text-[var(--text-primary)] font-mono">
                  <span className="text-amber-500 font-bold block text-[10px] uppercase">Modern ChemNova Counterpart:</span>
                  <span>{lm.connection}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-inherit">
                <p className="text-xs italic font-serif-editorial text-[var(--text-primary)] opacity-90 leading-relaxed">
                  "{lm.quote}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          10. RECENT RESEARCH SESSIONS (Real Telemetry & Session Restore)
          ==================================================================== */}
      {recentActivities.length > 0 && (
        <section className="art-card p-6 sm:p-7 rounded-3xl border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center justify-between border-b border-inherit pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">
                Recent Laboratory Telemetry &amp; Session Continuity
              </h3>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">Real-time Local Persistence</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                onClick={() => {
                  if (act.type === 'sketch') navigate('/chemdraw');
                  else if (act.type === 'rdkit') navigate('/rdkit-lab');
                  else if (act.type === 'spectroscopy') navigate('/spectroscopy');
                  else if (act.type === 'quantum') navigate('/quantum-library');
                  else if (act.type === 'reaction') navigate('/ibm-rxn');
                  else if (act.type === 'chromatography') navigate('/chromatography');
                }}
                className="p-4 rounded-2xl inner-box cursor-pointer hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-2.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-500 font-mono uppercase">{act.module}</span>
                  <span className="text-[9px] text-[var(--text-muted)] font-mono">
                    {typeof act.timestamp === 'number'
                      ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : typeof act.timestamp === 'string'
                      ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Recent'}
                  </span>
                </div>
                <div className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-amber-500 transition-colors">
                  {act.title}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] font-sans line-clamp-2 leading-relaxed">
                  {act.detail}
                </p>
                <div className="pt-2 border-t border-inherit flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                  <span>Restore Session</span>
                  <ArrowRight className="w-3 h-3 text-amber-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ====================================================================
          11. OPEN SCIENCE & COMPUTATIONAL TECHNOLOGY ECOSYSTEM
          ==================================================================== */}
      <section className="p-6 sm:p-8 rounded-3xl inner-box border border-[var(--border-subtle)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="telemetry-pill text-[10px]">
                <Code className="w-3.5 h-3.5 text-emerald-500" />
                <span>COMPUTATIONAL ECOSYSTEM</span>
              </span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] font-serif-editorial">
              Open Science Standards &amp; Calculation Backends
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            WEBASSEMBLY &amp; CLIENT ACCELERATION
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-subtle)] text-center space-y-1">
            <span className="text-amber-500 font-bold block text-[11px]">RDKit C++</span>
            <span className="text-[10px] text-[var(--text-muted)]">Chemoinformatics</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-subtle)] text-center space-y-1">
            <span className="text-violet-500 font-bold block text-[11px]">PySCF / DFT</span>
            <span className="text-[10px] text-[var(--text-muted)]">Quantum Solvers</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-subtle)] text-center space-y-1">
            <span className="text-rose-500 font-bold block text-[11px]">IBM RXN</span>
            <span className="text-[10px] text-[var(--text-muted)]">Neural Synthesis</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-subtle)] text-center space-y-1">
            <span className="text-sky-500 font-bold block text-[11px]">Three.js</span>
            <span className="text-[10px] text-[var(--text-muted)]">3D WebGL 2.0</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-subtle)] text-center space-y-1">
            <span className="text-teal-500 font-bold block text-[11px]">Van Deemter</span>
            <span className="text-[10px] text-[var(--text-muted)]">Plate Kinetics</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-subtle)] text-center space-y-1">
            <span className="text-emerald-500 font-bold block text-[11px]">SMILES / InChI</span>
            <span className="text-[10px] text-[var(--text-muted)]">Open Formats</span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          12. ARCHITECTURAL FOOTER NOTE — Scientific Attribution
          ==================================================================== */}
      <footer className="pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>CHEMNOVA SCIENTIFIC WORKBENCH • VER 2.4.0</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/settings')}
            className="hover:text-[var(--text-primary)] transition"
          >
            Settings &amp; Environment
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="hover:text-[var(--text-primary)] transition"
          >
            Documentation &amp; Support
          </button>
        </div>
      </footer>
    </div>
  );
}
