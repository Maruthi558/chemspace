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
  Sparkles,
  BookOpen,
  Terminal,
  Binary,
  Share2,
  FileSpreadsheet
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ScientificLayeredBackground from '../components/landing/ScientificLayeredBackground';
import ChemSpaceLogo from '../components/ChemSpaceLogo';

/**
 * SCIENTIFIC_MODULES
 * Each module carries a dedicated scientific personality, architectural watermark,
 * and tactile desktop control styling.
 */
const SCIENTIFIC_MODULES = [
  {
    id: 'chemdraw',
    title: 'ChemDraw CAD Studio',
    subtitle: 'Vector 2D Drafting & 3D Conformer Generation',
    description: 'Precision molecular editor with real-time valence verification, IUPAC ring templates, stereocenter projection, and automated 3D energy-minimized conformer generation.',
    path: '/chemdraw',
    icon: PenTool,
    tag: '2D/3D CAD',
    identityBadge: 'CAD Vector Studio',
    accentClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    watermark: 'sp³ · MMFF94',
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
    identityBadge: 'Matrix Tensor Pipeline',
    accentClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    watermark: '[W_ij] · Ro5',
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
    identityBadge: 'Analytical Waveforms',
    accentClass: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    watermark: 'ν (cm⁻¹) · δ (ppm)',
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
    identityBadge: 'Ab-Initio Solver',
    accentClass: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    watermark: 'ψ · ΔE_HL',
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
    identityBadge: 'Reaction Mechanism',
    accentClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    watermark: 'A + B ⟹ Target',
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
    identityBadge: 'IUPAC Reference',
    accentClass: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    watermark: 'Z=118 · Isotopes',
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
    <div className="w-full min-h-screen relative select-none bg-[var(--home-bg-base)] text-[var(--home-text-primary)] overflow-x-hidden font-sans">
      {/* ───────────────────────────────────────────────────────────────────────
          1. 5-LAYER PRECISION SCIENTIFIC BACKGROUND
          Exclusive to Home Page: Cream/Milk-White paper (Light) / Charcoal (Dark)
         ─────────────────────────────────────────────────────────────────────── */}
      <ScientificLayeredBackground />

      {/* Main Content Workspace Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-24">

        {/* ───────────────────────────────────────────────────────────────────────
            2. HERO & WORKBENCH OVERVIEW (DESKTOP-CLASS SCIENTIFIC SOFTWARE)
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="space-y-8 pt-2 sm:pt-4">
          <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8 border-b border-[var(--home-border)] pb-10">
            
            {/* Left: Scientific Proposition & Desktop Controls */}
            <div className="space-y-4 max-w-2xl flex-1 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-[var(--home-border)] bg-[var(--home-surface-subtle)] text-[var(--home-text-secondary)] shadow-sm self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>ChemSpace Molecular Engine • Professional Chemistry Suite</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--home-text-primary)] leading-tight">
                Chemical Computing &amp; Molecular Studio
              </h1>

              <p className="text-xs sm:text-sm text-[var(--home-text-secondary)] leading-relaxed font-sans max-w-xl">
                An integrated desktop-class scientific environment for 2D/3D structure drafting, RDKit physicochemical descriptors, quantum electronic orbital modeling, spectroscopy prediction, and retrosynthetic route planning.
              </p>

              {/* Tactile Desktop Software Action Controls */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/chemdraw')}
                  className="btn-orange group py-2.5 px-4 text-xs uppercase tracking-wider font-bold flex items-center gap-2 cursor-pointer shadow-md active:scale-[0.98]"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Open ChemDraw CAD</span>
                  <ArrowRight className="w-3.5 h-3.5 arrow-micro" />
                </button>

                <button
                  onClick={() => navigate('/rdkit-lab')}
                  className="btn-secondary group py-2.5 px-4 text-xs uppercase tracking-wider font-bold flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                  <span>RDKit Lab</span>
                  <ChevronRight className="w-3 h-3 text-[var(--home-text-muted)] arrow-micro" />
                </button>

                <button
                  onClick={() => navigate('/workspace')}
                  className="btn-outline group py-2.5 px-4 text-xs uppercase tracking-wider font-bold flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <FolderLock className="w-3.5 h-3.5 text-[var(--home-text-secondary)]" />
                  <span>Workspace</span>
                  <ChevronRight className="w-3 h-3 text-[var(--home-text-muted)] arrow-micro" />
                </button>
              </div>
            </div>

            {/* Right: Analytical Chemistry Laboratory Workstation */}
            <div className="relative w-full lg:w-[460px] h-[300px] sm:h-[340px] rounded-2xl border border-[var(--home-border)] bg-[var(--home-surface-card)] overflow-hidden shadow-lg flex items-center justify-center group">
              <img
                src="/assets/analytical_workbench.jpg"
                alt="Analytical Chemistry Research Instrumentation Workstation"
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-102"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono flex items-center gap-2">
                <Microscope className="w-3.5 h-3.5 text-emerald-400" />
                <span>Analytical Instrumentation • ChemNova Certified Facility</span>
              </div>
            </div>
          </div>

          {/* Quick Access Tool Strip with Tactile Feature Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'ChemDraw CAD', path: '/chemdraw', icon: PenTool, desc: '2D/3D Molecular Sketch', badge: 'CAD' },
              { label: 'RDKit Lab', path: '/rdkit-lab', icon: Cpu, desc: 'Physicochemical Descriptors', badge: 'Ro5' },
              { label: 'Spectroscopy', path: '/spectroscopy', icon: Radio, desc: 'FTIR, UV-Vis & NMR', badge: 'FTIR' },
              { label: 'Quantum Lab', path: '/quantum-library', icon: Zap, desc: 'DFT & Molecular Orbitals', badge: 'DFT' },
              { label: 'IBM Synthesis', path: '/ibm-rxn', icon: Activity, desc: 'Multi-step Reaction Trees', badge: 'RXN' },
              { label: 'Periodic Table', path: '/periodic-table', icon: Grid, desc: '118 Elements & Isotopes', badge: '118' }
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.label}
                  onClick={() => navigate(tool.path)}
                  className="card-feature-interactive p-3.5 flex flex-col justify-between space-y-2 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-[var(--home-surface-subtle)] border border-[var(--home-border)] flex items-center justify-center text-[var(--home-text-primary)] group-hover:border-[var(--home-border-strong)] transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--home-surface-subtle)] text-[var(--home-text-muted)] border border-[var(--home-border)]">
                      {tool.badge}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--home-text-primary)] block group-hover:text-emerald-500 transition">
                      {tool.label}
                    </span>
                    <span className="text-[10px] text-[var(--home-text-muted)] line-clamp-1">
                      {tool.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            3. REALISTIC SCIENTIFIC STORYTELLING: MODERN LAB ENVIRONMENT
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="card-feature-interactive overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Photographic Laboratory Visual */}
            <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[340px] overflow-hidden border-b lg:border-b-0 lg:border-r border-[var(--home-border)]">
              <img
                src="/assets/lab_hero.jpg"
                alt="Analytical Chemistry Research Laboratory Workstation"
                className="w-full h-full object-cover object-center transition duration-500 hover:scale-102"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono flex items-center gap-2">
                <Microscope className="w-3.5 h-3.5 text-emerald-400" />
                <span>Analytical Bench • Real Laboratory Verification</span>
              </div>
            </div>

            {/* Scientific Capabilities Narrative */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 font-semibold">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Real-World Laboratory Integration</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--home-text-primary)]">
                  Bridge Experimental Benchwork with Algorithmic Chemistry
                </h2>
                <p className="text-xs sm:text-sm text-[var(--home-text-secondary)] leading-relaxed">
                  ChemSpace translates experimental analytical data directly into computational descriptors. Process HPLC retention times, infrared vibrational modes, and NMR chemical shifts without leaving your browser.
                </p>
                
                <div className="space-y-2 pt-2 text-xs text-[var(--home-text-secondary)]">
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
                  className="btn-primary w-full py-2.5 text-xs font-bold justify-between cursor-pointer active:scale-[0.98]"
                >
                  <span>Launch Molecular CAD Studio</span>
                  <ArrowRight className="w-4 h-4 arrow-micro" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            4. SCIENTIFIC CAPABILITY METRICS STRIP
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="p-6 sm:p-8 rounded-2xl border border-[var(--home-border)] bg-[var(--home-surface-card)] shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[var(--home-text-primary)]">118</span>
              <p className="text-xs font-bold text-[var(--home-text-primary)] uppercase tracking-wider">Periodic Elements</p>
              <p className="text-[11px] text-[var(--home-text-muted)] font-mono">Full isotopic spectra &amp; electron states</p>
            </div>

            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[var(--home-text-primary)]">RDKit</span>
              <p className="text-xs font-bold text-[var(--home-text-primary)] uppercase tracking-wider">Topological Engine</p>
              <p className="text-[11px] text-[var(--home-text-muted)] font-mono">LogP, TPSA, &amp; Lipinski Ro5 compliance</p>
            </div>

            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[var(--home-text-primary)]">FTIR / NMR</span>
              <p className="text-xs font-bold text-[var(--home-text-primary)] uppercase tracking-wider">Spectral Predictions</p>
              <p className="text-[11px] text-[var(--home-text-muted)] font-mono">Vibrational bands &amp; chemical shifts</p>
            </div>

            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[var(--home-text-primary)]">DFT / SCF</span>
              <p className="text-xs font-bold text-[var(--home-text-primary)] uppercase tracking-wider">Ab-Initio Solvers</p>
              <p className="text-[11px] text-[var(--home-text-muted)] font-mono">Slater orbitals &amp; HOMO-LUMO gap</p>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            5. CORE SCIENTIFIC TOOL SUITE WITH DISTINCT FEATURE IDENTITIES
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--home-text-muted)] uppercase tracking-wider font-semibold">
              <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
              <span>Laboratory Modules</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--home-text-primary)]">
              Core Laboratory Applications
            </h2>
            <p className="text-xs sm:text-sm text-[var(--home-text-secondary)] max-w-2xl">
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
                  className="card-feature-interactive p-5 sm:p-6 flex flex-col justify-between group cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[var(--home-surface-subtle)] border border-[var(--home-border)] flex items-center justify-center text-[var(--home-text-primary)] group-hover:border-[var(--home-border-strong)] transition">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--home-border)] bg-[var(--home-surface-subtle)] text-[var(--home-text-muted)]">
                          {module.identityBadge}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[var(--home-text-primary)] group-hover:text-emerald-500 transition">
                        {module.title}
                      </h3>
                      <p className="text-xs text-[var(--home-text-muted)] font-medium mt-0.5">
                        {module.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-[var(--home-text-secondary)] leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[var(--home-border)] flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {module.metrics.slice(0, 2).map((m) => (
                        <span key={m} className="text-[9.5px] font-mono text-[var(--home-text-muted)]">
                          • {m}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[var(--home-text-primary)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
            6. DUAL SCIENTIFIC SPOTLIGHTS (SPECTROSCOPY & SYNTHESIS PHOTOGRAPHY)
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Spotlight 1: Analytical Spectroscopy */}
          <div className="card-feature-interactive flex flex-col justify-between">
            <div className="relative h-48 sm:h-56 overflow-hidden border-b border-[var(--home-border)]">
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
                <h3 className="text-lg font-bold text-[var(--home-text-primary)]">
                  Deconvolute Complex Multi-Modal Spectra
                </h3>
                <p className="text-xs text-[var(--home-text-secondary)] leading-relaxed">
                  Interactive vibrational band peak detection, UV-Vis Beer-Lambert absorbance sweeps, and high-precision NMR chemical shift simulations.
                </p>
              </div>

              <button
                onClick={() => navigate('/spectroscopy')}
                className="btn-secondary w-full py-2 text-xs font-bold justify-between mt-3 cursor-pointer active:scale-[0.98]"
              >
                <span>Open Spectroscopy Suite</span>
                <ArrowRight className="w-3.5 h-3.5 arrow-micro" />
              </button>
            </div>
          </div>

          {/* Spotlight 2: Organic Synthesis & Retrosynthesis */}
          <div className="card-feature-interactive flex flex-col justify-between">
            <div className="relative h-48 sm:h-56 overflow-hidden border-b border-[var(--home-border)]">
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
                <h3 className="text-lg font-bold text-[var(--home-text-primary)]">
                  Algorithmic Forward &amp; Reverse Pathways
                </h3>
                <p className="text-xs text-[var(--home-text-secondary)] leading-relaxed">
                  Break down complex synthetic targets into commercially available building blocks with thermodynamic energy profiles and step-by-step mechanisms.
                </p>
              </div>

              <button
                onClick={() => navigate('/ibm-rxn')}
                className="btn-secondary w-full py-2 text-xs font-bold justify-between mt-3 cursor-pointer active:scale-[0.98]"
              >
                <span>Launch IBM Synthesis Studio</span>
                <ArrowRight className="w-3.5 h-3.5 arrow-micro" />
              </button>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            7. CURATED CHEMICAL SPECIMEN SHOWCASE
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-[var(--home-text-muted)] uppercase tracking-wider font-semibold">Benchmark Specimen Library</span>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--home-text-primary)]">
                Featured Benchmark Compounds
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[var(--home-text-muted)] hidden sm:inline">
              Instant Molecular Analysis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CURATED_SPECIMENS.map((specimen) => (
              <div
                key={specimen.name}
                className="p-4 rounded-xl border border-[var(--home-border)] bg-[var(--home-surface-card)] flex flex-col justify-between space-y-3 shadow-sm hover:border-[var(--home-border-strong)] transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--home-text-primary)]">{specimen.name}</span>
                    <span className="text-xs font-mono text-emerald-500 font-bold">{specimen.formula}</span>
                  </div>
                  <p className="text-[10px] font-mono text-[var(--home-text-muted)] line-clamp-1">{specimen.iupac}</p>
                </div>

                <div className="grid grid-cols-2 gap-1.5 py-2 border-y border-[var(--home-border)] text-[10px] font-mono">
                  <div>
                    <span className="text-[var(--home-text-muted)] block">MW</span>
                    <span className="font-bold text-[var(--home-text-primary)]">{specimen.mw}</span>
                  </div>
                  <div>
                    <span className="text-[var(--home-text-muted)] block">LogP</span>
                    <span className="font-bold text-[var(--home-text-primary)]">{specimen.logp}</span>
                  </div>
                  <div>
                    <span className="text-[var(--home-text-muted)] block">TPSA</span>
                    <span className="font-bold text-[var(--home-text-primary)]">{specimen.tpsa}</span>
                  </div>
                  <div>
                    <span className="text-[var(--home-text-muted)] block">Type</span>
                    <span className="font-bold text-[var(--home-text-primary)] truncate">{specimen.category}</span>
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
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[var(--home-surface-subtle)] border border-[var(--home-border)] text-[10px] font-bold text-[var(--home-text-primary)] hover:border-[var(--home-border-strong)] transition text-center cursor-pointer active:scale-[0.98]"
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
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[var(--home-surface-subtle)] border border-[var(--home-border)] text-[10px] font-bold text-emerald-500 hover:border-emerald-500/40 transition text-center cursor-pointer active:scale-[0.98]"
                  >
                    Compute Ro5
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            8. CHEMICAL FORMAT INTEROPERABILITY BAR
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-[var(--home-text-muted)] uppercase tracking-wider font-semibold">Standard Formats</span>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--home-text-primary)]">
                Chemical Format Interoperability
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[var(--home-text-muted)] hidden sm:inline">
              ISO / IUPAC Compliant Output
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CHEMICAL_FORMATS.map((fmt) => (
              <div
                key={fmt.name}
                className="p-3 rounded-xl border border-[var(--home-border)] bg-[var(--home-surface-card)] flex flex-col justify-between space-y-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-500">{fmt.ext}</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-[var(--home-surface-subtle)] text-[var(--home-text-muted)]">Spec</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--home-text-primary)] block">{fmt.name}</span>
                  <span className="text-[10px] text-[var(--home-text-muted)] line-clamp-2 leading-tight">{fmt.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            9. COMPUTATIONAL ARCHITECTURE & DATA MANAGEMENT
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* Firestore Cloud Sync */}
          <div className="card-feature-interactive p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[var(--home-text-primary)]">
                Cloud Firestore &amp; Secure Laboratory Storage
              </h3>
              <p className="text-xs sm:text-sm text-[var(--home-text-secondary)] leading-relaxed">
                Seamlessly store research projects, saved molecular geometries, laboratory notebook notes, and reaction logs in Cloud Firestore under project <code className="font-mono text-xs px-1 rounded bg-[var(--home-surface-subtle)]">chemistry1-e2723</code>.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[var(--home-text-secondary)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Declarative security rules protecting private scientist records</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Multi-provider authentication: Google, Microsoft, and Apple</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real-time cross-device synchronization of molecular notes</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/workspace')}
              className="btn-secondary w-full py-2.5 text-xs font-bold justify-between cursor-pointer active:scale-[0.98]"
            >
              <span>Open Personal Research Workspace</span>
              <ArrowRight className="w-4 h-4 arrow-micro" />
            </button>
          </div>

          {/* Computational Architecture */}
          <div className="card-feature-interactive p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/25 flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[var(--home-text-primary)]">
                Client-Side WebAssembly &amp; WebGL Acceleration
              </h3>
              <p className="text-xs sm:text-sm text-[var(--home-text-secondary)] leading-relaxed">
                Hardware-accelerated 3D coordinate rendering via Three.js with zero server overhead. Calculations occur in high-efficiency sandboxed client memory.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 rounded-lg border border-[var(--home-border)] bg-[var(--home-surface-subtle)] text-xs font-mono">
                  <span className="font-bold text-[var(--home-text-primary)] block">Zero Latency</span>
                  <span className="text-[10px] text-[var(--home-text-muted)]">In-browser calculations</span>
                </div>
                <div className="p-2.5 rounded-lg border border-[var(--home-border)] bg-[var(--home-surface-subtle)] text-xs font-mono">
                  <span className="font-bold text-[var(--home-text-primary)] block">Privacy First</span>
                  <span className="text-[10px] text-[var(--home-text-muted)]">Structures stay local</span>
                </div>
                <div className="p-2.5 rounded-lg border border-[var(--home-border)] bg-[var(--home-surface-subtle)] text-xs font-mono">
                  <span className="font-bold text-[var(--home-text-primary)] block">WebGL Shaders</span>
                  <span className="text-[10px] text-[var(--home-text-muted)]">Orbital isosurfaces</span>
                </div>
                <div className="p-2.5 rounded-lg border border-[var(--home-border)] bg-[var(--home-surface-subtle)] text-xs font-mono">
                  <span className="font-bold text-[var(--home-text-primary)] block">Offline Capable</span>
                  <span className="text-[10px] text-[var(--home-text-muted)]">PWA cached resources</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/chemdraw')}
              className="btn-secondary w-full py-2.5 text-xs font-bold justify-between cursor-pointer active:scale-[0.98]"
            >
              <span>Launch 3D Conformer Studio</span>
              <ArrowRight className="w-4 h-4 arrow-micro" />
            </button>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            10. SCIENTIFIC PIONEERS DIRECTORY
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="card-feature-interactive p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-500 font-semibold">
              <Award className="w-4 h-4" />
              <span>Historical Chemical Discoveries</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--home-text-primary)]">
              Explore 200 Years of Chemical Pioneers
            </h3>
            <p className="text-xs sm:text-sm text-[var(--home-text-secondary)]">
              Discover foundational breakthroughs from Dmitri Mendeleev, Marie Curie, Linus Pauling, and modern computational chemists who shaped structural biology.
            </p>
          </div>

          <button
            onClick={() => navigate('/scientists')}
            className="btn-primary py-3 px-6 text-xs font-bold uppercase tracking-wider shrink-0 shadow-sm cursor-pointer active:scale-[0.98]"
          >
            <span>Explore Pioneers Directory</span>
            <ArrowRight className="w-4 h-4 arrow-micro" />
          </button>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            11. PROFESSIONAL SCIENTIFIC FOOTER
           ─────────────────────────────────────────────────────────────────────── */}
        <footer className="pt-10 pb-6 border-t border-[var(--home-border)] space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <ChemSpaceLogo size="sm" showText={true} />

            <div className="flex flex-wrap items-center gap-6 text-xs text-[var(--home-text-muted)] font-mono">
              <button onClick={() => navigate('/chemdraw')} className="hover:text-[var(--home-text-primary)] transition">ChemDraw</button>
              <button onClick={() => navigate('/rdkit-lab')} className="hover:text-[var(--home-text-primary)] transition">RDKit</button>
              <button onClick={() => navigate('/spectroscopy')} className="hover:text-[var(--home-text-primary)] transition">Spectra</button>
              <button onClick={() => navigate('/ibm-rxn')} className="hover:text-[var(--home-text-primary)] transition">IBM RXN</button>
              <button onClick={() => navigate('/periodic-table')} className="hover:text-[var(--home-text-primary)] transition">Periodic Table</button>
              <button onClick={() => navigate('/contact')} className="hover:text-[var(--home-text-primary)] transition">Support</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[var(--home-text-muted)] font-mono pt-4 border-t border-[var(--home-border)] gap-2">
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
