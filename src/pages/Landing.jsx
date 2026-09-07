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
  Layers,
  ChevronRight,
  Database,
  ExternalLink,
  Code2,
  Lock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import HomeSpecimenShowcase from '../components/HomeSpecimenShowcase';

const SCIENTIFIC_MODULES = [
  {
    id: 'chemdraw',
    title: 'ChemDraw CAD Studio',
    subtitle: 'Structure Sketching & 3D Conformers',
    description: 'Vector-accurate 2D molecular drafting with live valence validation, ring templates, stereochemical projection, and automatic 3D conformer optimization.',
    path: '/chemdraw',
    icon: PenTool,
    tag: 'CAD Studio',
    metrics: ['MMFF94 Conformer', 'SMILES / Molfile', 'Valence Engine']
  },
  {
    id: 'rdkit',
    title: 'RDKit Cheminformatics Lab',
    subtitle: 'Molecular Descriptors & Properties',
    description: 'High-throughput physicochemical descriptor calculations: LogP, TPSA, Lipinski Rule-of-Five compliance, rotatable bonds, and topological graph analyses.',
    path: '/rdkit-lab',
    icon: Cpu,
    tag: 'Cheminformatics',
    metrics: ['Lipinski Ro5', 'TPSA & LogP', 'Topological Graph']
  },
  {
    id: 'spectroscopy',
    title: 'Spectroscopy Suite',
    subtitle: 'FTIR & NMR Spectral Analysis',
    description: 'Simulated functional group vibrational spectra (FTIR) and chemical shift prediction for 1H and 13C nuclear magnetic resonance spectroscopy.',
    path: '/spectroscopy',
    icon: Radio,
    tag: 'Spectra',
    metrics: ['FTIR Absorption', '¹H & ¹³C NMR', 'Peak Deconvolution']
  },
  {
    id: 'quantum',
    title: 'Quantum Chemistry Lab',
    subtitle: 'Molecular Orbitals & DFT Modeling',
    description: 'Ab-initio electronic structure solvers: compute HOMO-LUMO bandgaps, evaluate Slater-type basis sets, and visualize electron density isosurfaces.',
    path: '/quantum-library',
    icon: Zap,
    tag: 'DFT Solvers',
    metrics: ['HOMO-LUMO Gap', 'Slater Orbitals', 'Density Isosurfaces']
  },
  {
    id: 'rxn',
    title: 'IBM RXN Retrosynthesis',
    subtitle: 'Reaction Pathway & Yield Prediction',
    description: 'AI-assisted retrosynthetic tree planning: decompose complex target molecules into commercially available precursors with step-by-step mechanisms.',
    path: '/ibm-rxn',
    icon: Activity,
    tag: 'Synthesis',
    metrics: ['Retrosynthesis Tree', 'Precursor Match', 'Reaction Engine']
  },
  {
    id: 'periodic',
    title: 'Periodic Table of Elements',
    subtitle: 'Atomic Trends & Isotopic Data',
    description: 'Comprehensive interactive elemental database detailing atomic radius, ionization energy, electronegativity, electron configurations, and thermal properties.',
    path: '/periodic-table',
    icon: Grid,
    tag: '118 Elements',
    metrics: ['Isotope Library', 'Electronegativity', 'Orbital Orbit']
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="w-full min-h-screen flex flex-col justify-between select-none">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-24">

        {/* ───────────────────────────────────────────────────────────────────────
            1. HERO SECTION
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="space-y-8 pt-2 sm:pt-6">
          <div className="max-w-3xl space-y-4">
            {/* Status indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-[var(--border-medium)] bg-[var(--bg-inner)] text-[var(--text-secondary)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>ChemSpace Research Platform • v2.4 Production</span>
            </div>

            {/* Main title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-[var(--text-primary)]">
              Advanced Chemical Computing &amp; Molecular Intelligence
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-[var(--text-secondary)] leading-relaxed font-sans max-w-2xl">
              An integrated scientific platform for 2D/3D structure drawing, RDKit topological descriptors, quantum orbital simulations, spectroscopy prediction, and retrosynthetic route planning.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/chemdraw')}
                className="btn-primary py-3 px-5 text-xs uppercase tracking-wider font-bold"
              >
                <span>Launch ChemDraw Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/rdkit-lab')}
                className="btn-secondary py-3 px-5 text-xs uppercase tracking-wider font-bold"
              >
                <span>Cheminformatics Lab</span>
              </button>

              <button
                onClick={() => navigate('/workspace')}
                className="btn-outline py-3 px-5 text-xs uppercase tracking-wider font-bold"
              >
                <FolderLock className="w-4 h-4" />
                <span>My Workspace</span>
              </button>
            </div>
          </div>

          {/* 3D Specimen Showcase Embedding */}
          <div className="w-full">
            <HomeSpecimenShowcase />
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            2. SCIENTIFIC CAPABILITY STRIP
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black font-mono text-[var(--text-primary)]">118</span>
              <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Periodic Elements</p>
              <p className="text-[11px] text-[var(--text-muted)] font-mono">Full isotopic spectra &amp; electron states</p>
            </div>

            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black font-mono text-[var(--text-primary)]">RDKit</span>
              <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Topological Engine</p>
              <p className="text-[11px] text-[var(--text-muted)] font-mono">LogP, TPSA, &amp; Lipinski Ro5 compliance</p>
            </div>

            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black font-mono text-[var(--text-primary)]">FTIR / NMR</span>
              <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Spectral Predictions</p>
              <p className="text-[11px] text-[var(--text-muted)] font-mono">Vibrational bands &amp; chemical shifts</p>
            </div>

            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black font-mono text-[var(--text-primary)]">DFT / SCF</span>
              <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Ab-Initio Solvers</p>
              <p className="text-[11px] text-[var(--text-muted)] font-mono">Slater orbitals &amp; HOMO-LUMO gap</p>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            3. CORE SCIENTIFIC TOOL SUITE
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">Tools &amp; Modules</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Core Laboratory Applications
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl">
              Each module operates with specialized chemical algorithms to support experimental synthetic planning, academic investigation, and molecular analysis.
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
                      <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-cyan-400 transition">
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
            4. RESEARCH WORKFLOW & DATA MANAGEMENT
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* Firestore Cloud Sync */}
          <div className="card-scientific p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
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
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Declarative security rules protecting private scientist records</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Multi-provider authentication: Google SSO, Email/Password, Phone OTP</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
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

          {/* Standard Formats & Interoperability */}
          <div className="card-scientific p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                Universal Chemical Format Interoperability
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Export and import structures using open scientific formats compatible with Gaussian, ORCA, PyMOL, Discovery Studio, and academic publication systems.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-xs font-mono">
                  <span className="font-bold text-[var(--text-primary)] block">SMILES &amp; InChI</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Canonical representations</span>
                </div>
                <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-xs font-mono">
                  <span className="font-bold text-[var(--text-primary)] block">MDL Molfile (V2000)</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Cartesian coordinate bonds</span>
                </div>
                <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-xs font-mono">
                  <span className="font-bold text-[var(--text-primary)] block">PDB &amp; XYZ</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Atomic crystallography</span>
                </div>
                <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-xs font-mono">
                  <span className="font-bold text-[var(--text-primary)] block">Vector SVG / PNG</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Publication-grade figures</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/chemdraw')}
              className="btn-secondary w-full py-2.5 text-xs font-bold justify-between"
            >
              <span>Explore Structure Conversion Tools</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            5. SCIENTIFIC PIONEERS HIGHLIGHT
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="card-scientific p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-500">
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
            className="btn-primary py-3 px-6 text-xs font-bold uppercase tracking-wider shrink-0"
          >
            <span>Explore Pioneers Directory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            6. CALL TO ACTION
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="text-center py-8 sm:py-12 space-y-4 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Ready to Begin Molecular Simulation?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Open the studio now to design compounds, compute molecular descriptors, or connect your persistent research account.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/chemdraw')}
              className="btn-primary py-3 px-6 text-xs font-bold uppercase tracking-wider"
            >
              Start Modeling Now
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-outline py-3 px-6 text-xs font-bold uppercase tracking-wider"
            >
              Sign In / Register
            </button>
          </div>
        </section>

      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          7. PROFESSIONAL SCIENTIFIC FOOTER
         ─────────────────────────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-card)] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-[11px] font-mono block">
                Studio Modules
              </span>
              <ul className="space-y-1.5 text-[var(--text-secondary)]">
                <li><button onClick={() => navigate('/chemdraw')} className="hover:underline">ChemDraw CAD</button></li>
                <li><button onClick={() => navigate('/rdkit-lab')} className="hover:underline">RDKit Descriptors</button></li>
                <li><button onClick={() => navigate('/spectroscopy')} className="hover:underline">Spectroscopy</button></li>
                <li><button onClick={() => navigate('/quantum-library')} className="hover:underline">Quantum Orbitals</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-[11px] font-mono block">
                Synthesis &amp; Data
              </span>
              <ul className="space-y-1.5 text-[var(--text-secondary)]">
                <li><button onClick={() => navigate('/ibm-rxn')} className="hover:underline">IBM Retrosynthesis</button></li>
                <li><button onClick={() => navigate('/periodic-table')} className="hover:underline">Periodic Elements</button></li>
                <li><button onClick={() => navigate('/chromatography')} className="hover:underline">Chromatography</button></li>
                <li><button onClick={() => navigate('/scientists')} className="hover:underline">Nobel Pioneers</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-[11px] font-mono block">
                Account &amp; System
              </span>
              <ul className="space-y-1.5 text-[var(--text-secondary)]">
                <li><button onClick={() => navigate('/workspace')} className="hover:underline">My Workspace</button></li>
                <li><button onClick={() => navigate('/settings')} className="hover:underline">Settings</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:underline">Authentication</button></li>
                <li><button onClick={() => navigate('/contact')} className="hover:underline">Contact Lab</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-[11px] font-mono block">
                Platform Spec
              </span>
              <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">
                ChemSpace v2.4 • Client WebGL &amp; WebAssembly Engine • Firebase backend chemistry1-e2723.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-emerald-500 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>All Laboratory Services Operational</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <Atom className="w-4 h-4 text-cyan-400" />
              <span>ChemSpace Research Platform</span>
            </div>
            <span>© {new Date().getFullYear()} ChemSpace. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
