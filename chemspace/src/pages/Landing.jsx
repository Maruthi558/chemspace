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
  Hexagon,
  Clock,
  History,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Compass,
  FileCode,
  Flame
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getRecentActivities } from '../services/activityStore';

export default function Landing() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    setRecentActivities(getRecentActivities().slice(0, 3));
  }, []);

  // 7 Core Primary Scientific Suites
  const SCIENTIFIC_SUITES = [
    {
      id: 'chemdraw',
      title: 'ChemDraw Studio',
      subtitle: '2D Chemical CAD & Live 3D Optimization',
      description: 'Precision molecular sketcher with valence enforcement, aromatic ring templates, SMILES generation, and real-time synchronized 3D conformer preview.',
      icon: PenTool,
      route: '/chemdraw',
      badge: '2D/3D CAD',
      accentColor: 'text-cyan-400',
      borderHover: 'hover:border-cyan-500/40',
      bgGlow: 'from-cyan-500/10 to-transparent'
    },
    {
      id: 'rdkit',
      title: 'RDKit Python Lab',
      subtitle: 'Input-Driven Chemoinformatics IDE',
      description: 'Execute Python RDKit workflows, calculate Lipinski Rule of 5 properties, exact mass, and render high-resolution 2D and 3D molecular structures.',
      icon: Cpu,
      route: '/rdkit-lab',
      badge: 'Chemoinformatics',
      accentColor: 'text-emerald-400',
      borderHover: 'hover:border-emerald-500/40',
      bgGlow: 'from-emerald-500/10 to-transparent'
    },
    {
      id: 'quantum-library',
      title: 'Quantum Chemistry Lab',
      subtitle: 'Ab Initio Electronic Structure & DFT',
      description: 'Input-driven computational chemistry workspace for PySCF, ORCA, PSI4, and Gaussian. Analyze HOMO-LUMO orbitals, 1D PES scans, and SCF convergence.',
      icon: Zap,
      route: '/quantum-library',
      badge: 'Quantum CAD',
      accentColor: 'text-violet-400',
      borderHover: 'hover:border-violet-500/40',
      bgGlow: 'from-violet-500/10 to-transparent'
    },
    {
      id: 'spectroscopy',
      title: 'Spectroscopy Suite',
      subtitle: 'Multi-Modal Spectral Analytics',
      description: 'Interactive FTIR, 1H-NMR, 13C-NMR, Mass Spectrometry, and UV-Vis absorption spectrum visualizer with automated peak deconvolution.',
      icon: Radio,
      route: '/spectroscopy',
      badge: 'Analytical',
      accentColor: 'text-amber-400',
      borderHover: 'hover:border-amber-500/40',
      bgGlow: 'from-amber-500/10 to-transparent'
    },
    {
      id: 'ibm-rxn',
      title: 'IBM RXN Studio',
      subtitle: 'Reaction Prediction & Retrosynthesis',
      description: 'Predict organic reaction pathways, forward reaction outcomes, automated atom-mapping, and multi-step retrosynthetic disconnection trees.',
      icon: Activity,
      route: '/ibm-rxn',
      badge: 'Synthesis AI',
      accentColor: 'text-rose-400',
      borderHover: 'hover:border-rose-500/40',
      bgGlow: 'from-rose-500/10 to-transparent'
    },
    {
      id: 'periodic-table',
      title: 'Periodic Table',
      subtitle: '118 Elements & Electronic Orbitals',
      description: 'Interactive Mendeleev grid with electron configurations, electronegativity trends, ionization energies, and 3D atomic orbital representations.',
      icon: Grid,
      route: '/periodic-table',
      badge: 'Mendeleev Grid',
      accentColor: 'text-sky-400',
      borderHover: 'hover:border-sky-500/40',
      bgGlow: 'from-sky-500/10 to-transparent'
    },
    {
      id: 'scientists',
      title: 'Discoveries Gallery',
      subtitle: 'Nobel Laureates & Chemical Pioneers',
      description: 'Explore the landmark discoveries of history\'s pioneering chemists with Nobel citations and interactive 3D signature molecular structures.',
      icon: Award,
      route: '/scientists',
      badge: 'Nobel History',
      accentColor: 'text-amber-500',
      borderHover: 'hover:border-amber-500/40',
      bgGlow: 'from-amber-500/10 to-transparent'
    }
  ];

  return (
    <div className="workspace-container font-mono select-none space-y-6">
      {/* 1. HERO SECTION — Platform Introduction & Primary Call-to-Action */}
      <div className="glass-panel p-8 sm:p-10 lg:p-12 rounded-[36px] relative overflow-hidden border border-[var(--border-subtle)] shadow-2xl">
        {/* Subtle Ambient Dimensional Lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 via-violet-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Title, Subtitle & Primary Launch Trigger */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="telemetry-pill">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>CHEMNOVA COMPUTATIONAL CHEMISTRY PLATFORM</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-[var(--text-primary)]">
              Precision Chemical <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 bg-clip-text text-transparent">
                Computing &amp; Dynamics.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-sans max-w-2xl font-medium">
              An enterprise scientific platform uniting 2D molecular sketching, RDKit chemoinformatics, ab initio quantum Hamiltonian solvers, and analytical spectroscopy into dedicated research workspaces.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/chemdraw')}
                className="btn-horizontal btn-primary text-xs font-black shadow-lg"
              >
                <PenTool className="w-4 h-4" />
                <span>Open ChemDraw Studio</span>
              </button>
              <button
                onClick={() => navigate('/rdkit-lab')}
                className="btn-horizontal btn-secondary text-xs font-bold"
              >
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>RDKit Python Lab</span>
              </button>
              <button
                onClick={() => navigate('/quantum-library')}
                className="btn-horizontal btn-secondary text-xs font-bold"
              >
                <Zap className="w-4 h-4 text-violet-400" />
                <span>Quantum Chemistry</span>
              </button>
            </div>
          </div>

          {/* Right Column: 3D Platform Branding Visual */}
          <div className="lg:col-span-5 h-[280px] sm:h-[320px] w-full inner-box rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden border border-[var(--border-subtle)] shadow-xl">
            <div className="flex items-center justify-between z-10">
              <div className="telemetry-pill text-[10px]">
                <Atom className="w-3.5 h-3.5 text-cyan-400" />
                <span>PLATFORM CORE</span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">SPEC: MMFF94 / DFT</span>
            </div>

            {/* Central Precision Chemical Graphic Motif */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-3">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-3xl border ${
                  isDark ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-slate-300 bg-slate-100'
                } flex items-center justify-center animate-spin-slow`} />
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xl ${
                  isDark
                    ? 'bg-[#06080e] border-white/20 text-cyan-400'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}>
                  <Atom className="w-9 h-9 animate-pulse" />
                </div>
              </div>

              <div className="text-center space-y-0.5">
                <div className="text-sm font-black tracking-widest uppercase text-[var(--text-primary)]">
                  CHEMNOVA OS
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-mono">
                  COMPUTATIONAL MOLECULAR SUITE
                </div>
              </div>
            </div>

            {/* Bottom Status Ticker */}
            <div className="z-10 pt-2.5 border-t border-inherit flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)]">
              <span>RDKit • Three.js • FastAPI</span>
              <span className="font-bold text-emerald-400">READY</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED SCIENTIFIC SUITES GRID */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
          <div>
            <h2 className="text-lg font-black tracking-tight text-[var(--text-primary)]">
              Primary Scientific Workspaces
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
              Select any workspace below to open an interactive, desktop-first computing environment.
            </p>
          </div>
          <div className="telemetry-pill text-[10px]">
            7 DEDICATED MODULES
          </div>
        </div>

        {/* 7 Workspaces Grid (Each Module Appears Exactly Once) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SCIENTIFIC_SUITES.map((module) => {
            const Icon = module.icon;

            return (
              <div
                key={module.id}
                onClick={() => navigate(module.route)}
                className={`glass-panel p-6 rounded-3xl cursor-pointer flex flex-col justify-between group space-y-5 border border-[var(--border-subtle)] ${module.borderHover} transition-all duration-200 hover:-translate-y-1 shadow-lg`}
              >
                <div className="space-y-4">
                  {/* Card Top: Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="telemetry-pill text-[10px]">
                      {module.badge}
                    </span>
                    <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-all ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white group-hover:bg-white group-hover:text-black shadow-md'
                        : 'bg-slate-100 border-slate-200 text-slate-900 group-hover:bg-slate-900 group-hover:text-white shadow-md'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-black text-[var(--text-primary)] group-hover:text-cyan-400 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-[11px] font-bold text-[var(--text-secondary)] mt-0.5 font-mono">
                      {module.subtitle}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-2.5 line-clamp-3 font-sans font-medium">
                      {module.description}
                    </p>
                  </div>
                </div>

                {/* Footer Launch Indicator */}
                <div className="pt-3.5 border-t border-inherit flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
                  <span className="text-[11px] font-bold text-[var(--text-primary)]">Launch Workspace</span>
                  <div className="flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform text-cyan-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. RECENT RESEARCH ACTIVITY (Real User History, Compact & Secondary) */}
      {recentActivities.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between border-b border-inherit pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                Recent Research Sessions
              </h3>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] font-mono">Real User Telemetry</span>
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
                }}
                className="p-3.5 rounded-2xl inner-box cursor-pointer hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400 font-mono uppercase">{act.module}</span>
                  <span className="text-[9px] text-[var(--text-dim)] font-mono">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-xs font-bold text-[var(--text-primary)] truncate">{act.title}</div>
                <p className="text-[10px] text-[var(--text-secondary)] font-sans line-clamp-2">{act.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
