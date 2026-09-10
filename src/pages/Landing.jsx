import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PenTool,
  Cpu,
  ArrowRight,
  Activity,
  Award,
  Zap,
  Radio,
  Grid,
  Atom,
  ShieldCheck,
  FlaskConical,
  FolderLock,
  ChevronRight,
  Database,
  Code2,
  CheckCircle2,
  Microscope,
  Compass,
  FileCode,
  Layers,
  Search,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Background3DCanvas from '../components/Background3DCanvas';
import HeroScientificCanvas from '../components/HeroScientificCanvas';

const SCIENTIFIC_MODULES = [
  {
    id: 'chemdraw',
    title: 'ChemDraw CAD Studio',
    subtitle: 'Vector 2D Drafting & 3D Conformer Generation',
    description: 'Precision molecular editor with real-time valence verification, IUPAC ring templates, stereocenter projection, and automated 3D energy-minimized conformer generation.',
    path: '/chemdraw',
    icon: PenTool,
    tag: '2D/3D CAD',
    accentClass: 'text-slate-400 border-slate-700/50 bg-slate-800/40',
    metrics: ['MMFF94 Engine', 'SMILES & Molfile', 'Valence Guard']
  },
  {
    id: 'rdkit',
    title: 'RDKit Cheminformatics Lab',
    subtitle: 'Physicochemical Descriptors & Drug-Likeness',
    description: 'High-throughput computational pipeline computing LogP, Topological Polar Surface Area (TPSA), Lipinski Rule-of-Five compliance, and rotatable bond distribution.',
    path: '/rdkit-lab',
    icon: Cpu,
    tag: 'Python Descriptors',
    accentClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    metrics: ['Lipinski Ro5', 'TPSA & LogP', 'Graph Descriptors']
  },
  {
    id: 'spectroscopy',
    title: 'Multi-Modal Spectroscopy',
    subtitle: 'FTIR, UV-Vis, ¹H & ¹³C NMR Prediction',
    description: 'Simulated vibrational spectra with functional group peak detection, UV-Vis electronic absorption transitions, and nuclear magnetic resonance chemical shift calculation.',
    path: '/spectroscopy',
    icon: Radio,
    tag: 'Spectra Analysis',
    accentClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    metrics: ['FTIR Absorption', '¹H & ¹³C NMR', 'Deconvolution']
  },
  {
    id: 'quantum',
    title: 'DFT Quantum Chemistry',
    subtitle: 'Ab-Initio Electronic Wavefunctions & Orbitals',
    description: 'Hartree-Fock and Density Functional solvers: compute HOMO-LUMO bandgaps, Slater-type basis functions, electrostatic potential maps, and electron density isosurfaces.',
    path: '/quantum-library',
    icon: Zap,
    tag: 'DFT Solvers',
    accentClass: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
    metrics: ['HOMO-LUMO Gap', 'Slater Orbitals', 'Density Contours']
  },
  {
    id: 'rxn',
    title: 'IBM RXN Retrosynthesis',
    subtitle: 'Algorithmic Reaction Pathways & Precursors',
    description: 'Automated retrosynthetic forward and reverse search engine: break down complex organic targets into commercially available building blocks with step-by-step mechanisms.',
    path: '/ibm-rxn',
    icon: Activity,
    tag: 'Synthesis Planner',
    accentClass: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    metrics: ['Retrosynthesis Tree', 'Commercial Feedstock', 'Reaction Rules']
  },
  {
    id: 'periodic',
    title: 'Dynamic Periodic Table',
    subtitle: '118 Elements, Orbitals & Thermochemical Data',
    description: 'Interactive elemental catalog detailing electronegativity, ionization energies, atomic radii, electronic configurations, and isotope stability profiles.',
    path: '/periodic-table',
    icon: Grid,
    tag: 'Elemental Data',
    accentClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    metrics: ['118 Elements', 'Isotope Library', 'Orbital Shells']
  }
];

const CHEMICAL_FORMATS = [
  { ext: '.smi', name: 'SMILES', desc: 'Canonical string notation for line-based molecular graphs' },
  { ext: '.mol', name: 'MDL Molfile', desc: 'Cartesian coordinate bond block format (V2000/V3000)' },
  { ext: '.pdb', name: 'Protein Data Bank', desc: 'Atomic macromolecular and coordinate crystallography' },
  { ext: '.xyz', name: 'XYZ Cartesian', desc: 'Raw Cartesian geometry for Gaussian, ORCA & DFT input' },
  { ext: '.svg', name: 'Vector SVG', desc: 'High-resolution publication figures for chemical journals' },
  { ext: '.csv', name: 'Tabular Data', desc: 'Descriptor tables ready for machine learning analysis' }
];

const CURATED_SPECIMENS = [
  {
    name: 'Aspirin',
    formula: 'C₉H₈O₄',
    iupac: '2-Acetyloxybenzoic acid',
    mw: '180.16 g/mol',
    logp: '1.19',
    tpsa: '63.6 Å²',
    smiles: 'CC(=O)Oc1ccccc1C(=O)O',
    category: 'Analgesic / Anti-inflammatory'
  },
  {
    name: 'Caffeine',
    formula: 'C₈H₁₀N₄O₂',
    iupac: '1,3,7-Trimethylxanthine',
    mw: '194.19 g/mol',
    logp: '-0.07',
    tpsa: '58.4 Å²',
    smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
    category: 'Purine Alkaloid'
  },
  {
    name: 'Benzene',
    formula: 'C₆H₆',
    iupac: 'Cyclohexa-1,3,5-triene',
    mw: '78.11 g/mol',
    logp: '2.13',
    tpsa: '0.0 Å²',
    smiles: 'c1ccccc1',
    category: 'Aromatic Hydrocarbon'
  },
  {
    name: 'Paracetamol',
    formula: 'C₈H₉NO₂',
    iupac: 'N-(4-hydroxyphenyl)acetamide',
    mw: '151.16 g/mol',
    logp: '0.46',
    tpsa: '49.3 Å²',
    smiles: 'CC(=O)Nc1ccc(O)cc1',
    category: 'Antipyretic'
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="w-full min-h-screen relative select-none bg-[var(--bg-page)] text-[var(--text-primary)] overflow-x-hidden">
      {/* ───────────────────────────────────────────────────────────────────────
          RESTORED HOMEPAGE BACKGROUND LAYER
          Subtle 3D molecular fog and geometric depth specifically for Homepage
         ─────────────────────────────────────────────────────────────────────── */}
      <Background3DCanvas />

      {/* Main Content Container with relative z-index above background */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-24">

        {/* ───────────────────────────────────────────────────────────────────────
            1. HERO & WORKBENCH OVERVIEW WITH 3D SCIENTIFIC ANIMATION
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="space-y-8 pt-2 sm:pt-4">
          <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8 border-b border-[var(--border-subtle)] pb-10">
            
            {/* Left: Scientific Value Proposition */}
            <div className="space-y-4 max-w-2xl flex-1 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-[var(--text-secondary)] shadow-sm self-start">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>ChemSpace Molecular Engine • Professional Chemistry Suite</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
                Chemical Computing &amp; Molecular Studio
              </h1>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans max-w-xl">
                An integrated scientific environment for 2D/3D structure drafting, RDKit physicochemical descriptors, quantum electronic orbital modeling, spectroscopy prediction, and retrosynthetic route planning.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/chemdraw')}
                  className="btn-primary py-2.5 px-4 text-xs uppercase tracking-wider font-bold flex items-center gap-2 shadow-sm"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Open ChemDraw CAD</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => navigate('/rdkit-lab')}
                  className="btn-secondary py-2.5 px-4 text-xs uppercase tracking-wider font-bold flex items-center gap-2"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>RDKit Lab</span>
                </button>

                <button
                  onClick={() => navigate('/workspace')}
                  className="btn-outline py-2.5 px-4 text-xs uppercase tracking-wider font-bold flex items-center gap-2"
                >
                  <FolderLock className="w-3.5 h-3.5" />
                  <span>Workspace</span>
                </button>
              </div>
            </div>

            {/* Right: Restored 3D Molecular Simulation Hero Canvas */}
            <div className="relative w-full lg:w-[460px] h-[300px] sm:h-[340px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden shadow-lg flex items-center justify-center">
              {/* Interactive 3D Canvas */}
              <HeroScientificCanvas />

              {/* Telemetry Overlay Badges */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-mono border border-[var(--border-subtle)] bg-[var(--bg-inner)]/80 backdrop-blur-md text-[var(--text-muted)] flex items-center gap-1.5">
                <Atom className="w-3 h-3 text-emerald-400" />
                <span>Real-Time 3D Orbital Trajectories</span>
              </div>

              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-mono border border-[var(--border-subtle)] bg-[var(--bg-inner)]/80 backdrop-blur-md text-[var(--text-muted)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>WebGL 2.0 • Hardware Accelerated</span>
              </div>
            </div>
          </div>

          {/* Quick Access Tool Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'ChemDraw CAD', path: '/chemdraw', icon: PenTool, desc: '2D/3D Molecular Sketch' },
              { label: 'RDKit Lab', path: '/rdkit-lab', icon: Cpu, desc: 'Physicochemical Descriptors' },
              { label: 'Spectroscopy', path: '/spectroscopy', icon: Radio, desc: 'FTIR, UV-Vis & NMR' },
              { label: 'Quantum Lab', path: '/quantum-library', icon: Zap, desc: 'DFT & Molecular Orbitals' },
              { label: 'IBM Synthesis', path: '/ibm-rxn', icon: Activity, desc: 'Multi-step Reaction Trees' },
              { label: 'Periodic Table', path: '/periodic-table', icon: Grid, desc: '118 Elements & Isotopes' }
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.label}
                  onClick={() => navigate(tool.path)}
                  className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-strong)] transition cursor-pointer group flex flex-col justify-between space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] group-hover:border-[var(--border-strong)] transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)] block group-hover:text-emerald-400 transition">
                      {tool.label}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                      {tool.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            2. REALISTIC SCIENTIFIC STORYTELLING: MODERN LAB ENVIRONMENT
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="card-scientific overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Photographic Laboratory Visual */}
            <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[340px] overflow-hidden border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)]">
              <img
                src="/assets/lab_hero.jpg"
                alt="Analytical Chemistry Research Laboratory Workstation"
                className="w-full h-full object-cover object-center transition duration-500 hover:scale-102"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono flex items-center gap-2">
                <Microscope className="w-3.5 h-3.5 text-emerald-400" />
                <span>Analytical Instrumentation • ChemNova Certified Facility</span>
              </div>
            </div>

            {/* Scientific Capabilities Narrative */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 font-semibold">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Real-World Laboratory Integration</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  Bridge Experimental Benchwork with Algorithmic Chemistry
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  ChemSpace translates experimental analytical data directly into computational descriptors. Process HPLC retention times, infrared vibrational modes, and NMR chemical shifts without leaving your browser.
                </p>
                
                <div className="space-y-2 pt-2 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Cross-referenced against NIST and PubChem analytical libraries</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Direct import/export of MDL Molfiles, SMILES, and crystallographic PDBs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Real-time client-side force field energy minimization (MMFF94)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/chemdraw')}
                  className="btn-primary w-full py-2.5 text-xs font-bold justify-between"
                >
                  <span>Launch Molecular CAD Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            3. SCIENTIFIC CAPABILITY METRICS STRIP
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[var(--text-primary)]">118</span>
              <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Periodic Elements</p>
              <p className="text-[11px] text-[var(--text-muted)] font-mono">Full isotopic spectra &amp; electron states</p>
            </div>

            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[var(--text-primary)]">RDKit</span>
              <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Topological Engine</p>
              <p className="text-[11px] text-[var(--text-muted)] font-mono">LogP, TPSA, &amp; Lipinski Ro5 compliance</p>
            </div>

            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[var(--text-primary)]">FTIR / NMR</span>
              <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Spectral Predictions</p>
              <p className="text-[11px] text-[var(--text-muted)] font-mono">Vibrational bands &amp; chemical shifts</p>
            </div>

            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[var(--text-primary)]">DFT / SCF</span>
              <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Ab-Initio Solvers</p>
              <p className="text-[11px] text-[var(--text-muted)] font-mono">Slater orbitals &amp; HOMO-LUMO gap</p>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            4. CORE SCIENTIFIC TOOL SUITE
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider font-semibold">Laboratory Modules</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Core Laboratory Applications
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl">
              Each module executes specialized chemical algorithms to support experimental synthetic planning, academic investigation, and molecular analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {SCIENTIFIC_MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  onClick={() => navigate(module.path)}
                  className="card-scientific p-5 sm:p-6 flex flex-col justify-between group cursor-pointer hover:border-[var(--border-strong)] transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] group-hover:border-[var(--border-strong)] transition">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)]">
                        {module.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-emerald-400 transition">
                        {module.title}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] font-medium">
                        {module.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {module.metrics.slice(0, 2).map((m) => (
                        <span key={m} className="text-[9px] font-mono text-[var(--text-muted)]">
                          • {m}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Launch</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            5. DUAL SCIENTIFIC SPOTLIGHTS (SPECTROSCOPY & SYNTHESIS PHOTOGRAPHY)
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Spotlight 1: Analytical Spectroscopy */}
          <div className="card-scientific overflow-hidden flex flex-col justify-between border border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <div className="relative h-48 sm:h-56 overflow-hidden border-b border-[var(--border-subtle)]">
              <img
                src="/assets/spectroscopy_lab.jpg"
                alt="Chemist analyzing FTIR and NMR spectroscopy data"
                className="w-full h-full object-cover object-center transition duration-500 hover:scale-102"
                loading="lazy"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono text-white">
                FT-IR &amp; ¹H/¹³C NMR Spectral Acquisition
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-semibold">Analytical Suite</span>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Deconvolute Complex Multi-Modal Spectra
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Interactive vibrational band peak detection, UV-Vis Beer-Lambert absorbance sweeps, and high-precision NMR chemical shift simulations.
                </p>
              </div>

              <button
                onClick={() => navigate('/spectroscopy')}
                className="btn-secondary w-full py-2 text-xs font-bold justify-between mt-3"
              >
                <span>Open Spectroscopy Suite</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Spotlight 2: Organic Synthesis & Retrosynthesis */}
          <div className="card-scientific overflow-hidden flex flex-col justify-between border border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <div className="relative h-48 sm:h-56 overflow-hidden border-b border-[var(--border-subtle)]">
              <img
                src="/assets/synthesis_lab.jpg"
                alt="Organic chemistry reaction apparatus in fume hood"
                className="w-full h-full object-cover object-center transition duration-500 hover:scale-102"
                loading="lazy"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono text-white">
                Multi-Step Reaction Synthesis &amp; Mechanism
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-500 font-semibold">Retrosynthesis Planner</span>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Algorithmic Forward &amp; Reverse Pathways
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Break down complex synthetic targets into commercially available building blocks with thermodynamic energy profiles and step-by-step mechanisms.
                </p>
              </div>

              <button
                onClick={() => navigate('/ibm-rxn')}
                className="btn-secondary w-full py-2 text-xs font-bold justify-between mt-3"
              >
                <span>Launch IBM Synthesis Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            6. CURATED CHEMICAL SPECIMEN SHOWCASE
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider font-semibold">Benchmark Specimen Library</span>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                Featured Benchmark Compounds
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-muted)] hidden sm:inline">
              Instant Molecular Analysis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CURATED_SPECIMENS.map((specimen) => (
              <div
                key={specimen.name}
                className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] flex flex-col justify-between space-y-3 shadow-sm hover:border-[var(--border-strong)] transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{specimen.name}</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">{specimen.formula}</span>
                  </div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] line-clamp-1">{specimen.iupac}</p>
                </div>

                <div className="grid grid-cols-2 gap-1.5 py-2 border-y border-[var(--border-subtle)] text-[10px] font-mono">
                  <div>
                    <span className="text-[var(--text-muted)] block">MW</span>
                    <span className="font-bold text-[var(--text-primary)]">{specimen.mw}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block">LogP</span>
                    <span className="font-bold text-[var(--text-primary)]">{specimen.logp}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block">TPSA</span>
                    <span className="font-bold text-[var(--text-primary)]">{specimen.tpsa}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block">Type</span>
                    <span className="font-bold text-[var(--text-primary)] truncate">{specimen.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      try {
                        localStorage.setItem('chemspace_active_mol', JSON.stringify({ smiles: specimen.smiles, name: specimen.name }));
                      } catch (e) {}
                      navigate(`/chemdraw?smiles=${encodeURIComponent(specimen.smiles)}`);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[10px] font-bold text-[var(--text-primary)] hover:border-[var(--border-strong)] transition text-center"
                  >
                    Draw 2D/3D
                  </button>
                  <button
                    onClick={() => {
                      try {
                        localStorage.setItem('chemspace_active_mol', JSON.stringify({ smiles: specimen.smiles, name: specimen.name }));
                      } catch (e) {}
                      navigate('/rdkit-lab');
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[10px] font-bold text-emerald-400 hover:border-emerald-500/40 transition text-center"
                  >
                    Compute Ro5
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            7. CHEMICAL FORMAT INTEROPERABILITY BAR
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider font-semibold">Standard Formats</span>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                Chemical Format Interoperability
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-muted)] hidden sm:inline">
              ISO / IUPAC Compliant Output
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CHEMICAL_FORMATS.map((fmt) => (
              <div
                key={fmt.name}
                className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] flex flex-col justify-between space-y-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">{fmt.ext}</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-[var(--bg-inner)] text-[var(--text-muted)]">Spec</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] block">{fmt.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)] line-clamp-2 leading-tight">{fmt.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            8. COMPUTATIONAL ARCHITECTURE & DATA MANAGEMENT
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* Firestore Cloud Sync */}
          <div className="card-scientific p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                Cloud Firestore &amp; Secure Laboratory Storage
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Seamlessly store research projects, saved molecular geometries, laboratory notebook notes, and reaction logs in Cloud Firestore under project <code className="font-mono text-xs px-1 rounded bg-[var(--bg-inner)]">chemistry1-e2723</code>.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Declarative security rules protecting private scientist records</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Multi-provider authentication: Google SSO, Email/Password, Phone OTP</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real-time cross-device synchronization of molecular notes</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/workspace')}
              className="btn-secondary w-full py-2.5 text-xs font-bold justify-between"
            >
              <span>Open Personal Research Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Computational Architecture */}
          <div className="card-scientific p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/25 flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                Client-Side WebAssembly &amp; WebGL Acceleration
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Hardware-accelerated 3D coordinate rendering via Three.js with zero server overhead. Calculations occur in high-efficiency sandboxed client memory.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-xs font-mono">
                  <span className="font-bold text-[var(--text-primary)] block">Zero Latency</span>
                  <span className="text-[10px] text-[var(--text-muted)]">In-browser calculations</span>
                </div>
                <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-xs font-mono">
                  <span className="font-bold text-[var(--text-primary)] block">Privacy First</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Structures stay local</span>
                </div>
                <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-xs font-mono">
                  <span className="font-bold text-[var(--text-primary)] block">WebGL Shaders</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Orbital isosurfaces</span>
                </div>
                <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-xs font-mono">
                  <span className="font-bold text-[var(--text-primary)] block">Offline Capable</span>
                  <span className="text-[10px] text-[var(--text-muted)]">PWA cached resources</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/chemdraw')}
              className="btn-secondary w-full py-2.5 text-xs font-bold justify-between"
            >
              <span>Launch 3D Conformer Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            9. SCIENTIFIC PIONEERS DIRECTORY
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="card-scientific p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-500 font-semibold">
              <Award className="w-4 h-4" />
              <span>Historical Chemical Discoveries</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              Explore 200 Years of Chemical Pioneers
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Discover foundational breakthroughs from Dmitri Mendeleev, Marie Curie, Linus Pauling, and modern computational chemists who shaped structural biology.
            </p>
          </div>

          <button
            onClick={() => navigate('/scientists')}
            className="btn-primary py-3 px-6 text-xs font-bold uppercase tracking-wider shrink-0 shadow-sm"
          >
            <span>Explore Pioneers Directory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            10. PROFESSIONAL SCIENTIFIC FOOTER
           ─────────────────────────────────────────────────────────────────────── */}
        <footer className="pt-10 pb-6 border-t border-[var(--border-subtle)] space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center">
                <Atom className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold tracking-wider font-mono">CHEMSPACE PLATFORM</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)]">
                v2.4 LTS
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[var(--text-muted)] font-mono">
              <button onClick={() => navigate('/chemdraw')} className="hover:text-[var(--text-primary)] transition">ChemDraw</button>
              <button onClick={() => navigate('/rdkit-lab')} className="hover:text-[var(--text-primary)] transition">RDKit</button>
              <button onClick={() => navigate('/spectroscopy')} className="hover:text-[var(--text-primary)] transition">Spectra</button>
              <button onClick={() => navigate('/ibm-rxn')} className="hover:text-[var(--text-primary)] transition">IBM RXN</button>
              <button onClick={() => navigate('/periodic-table')} className="hover:text-[var(--text-primary)] transition">Periodic Table</button>
              <button onClick={() => navigate('/contact')} className="hover:text-[var(--text-primary)] transition">Support</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[var(--text-muted)] font-mono pt-4 border-t border-[var(--border-subtle)] gap-2">
            <span>© 2026 ChemSpace Laboratory Cloud • ISO/IEC 17025 Compliant Algorithms</span>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Client-Side Sandboxed Computing</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
