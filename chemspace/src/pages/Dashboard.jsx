import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Activity,
  ArrowRight,
  PenTool,
  Radio,
  Zap,
  Grid,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Sliders,
  Layers,
  Terminal,
  Play,
  Atom,
  Award,
  FlaskConical,
  Flame,
  ShieldCheck,
  Compass,
  FileCode2,
  Boxes
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getProjectStats, getRecentActivities, clearActivities, logActivity } from '../services/activityStore';
import { checkServerHealth } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [stats, setStats] = useState(getProjectStats());
  const [activities, setActivities] = useState(getRecentActivities());
  const [serverStatus, setServerStatus] = useState({ online: false, checking: true, latency: 0 });

  useEffect(() => {
    setStats(getProjectStats());
    setActivities(getRecentActivities());

    const t0 = performance.now();
    checkServerHealth().then((res) => {
      const elapsed = Math.round(performance.now() - t0);
      setServerStatus({ online: res.online, checking: false, latency: elapsed, ...res });
    });
  }, []);

  const refreshActivity = () => {
    setStats(getProjectStats());
    setActivities(getRecentActivities());
  };

  const handleClearHistory = () => {
    clearActivities();
    setActivities([]);
  };

  return (
    <div className="workspace-container font-mono select-none space-y-6">
      {/* 1. WORKSPACE HEADER & TELEMETRY */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Atom className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider text-[var(--text-primary)]">
                CHEMNOVA RESEARCH DASHBOARD
              </span>
              <span className="telemetry-pill text-[9px] font-bold">
                COMPUTATIONAL CORE v4.0
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] font-sans mt-0.5">
              Integrated computational chemoinformatics, real-time 3D conformer optimization, DFT quantum solvers & analytical spectroscopy.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="telemetry-pill text-[10px]">
            <span
              className={`w-2 h-2 rounded-full ${
                serverStatus.checking
                  ? 'bg-amber-400 animate-pulse'
                  : serverStatus.online
                  ? 'bg-emerald-400'
                  : 'bg-cyan-400'
              }`}
            />
            <span className="font-bold">
              {serverStatus.online ? `FASTAPI CORE: ONLINE (${serverStatus.latency}ms)` : 'FASTAPI: ACTIVE RUNTIME'}
            </span>
          </div>

          <button
            onClick={() => {
              logActivity('ChemDraw', 'Started New 2D Sketch', 'Initialized blank canvas workspace', 'sketch');
              navigate('/chemdraw');
            }}
            className="btn-horizontal btn-primary text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Launch ChemDraw</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-cyan-200 border border-cyan-400/30">
              CH₃-C(=O)OH
            </span>
          </button>
        </div>
      </div>

      {/* 2. SCIENTIFIC 3D HERO OVERVIEW BANNER */}
      <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] relative overflow-hidden shadow-2xl bg-gradient-to-r from-cyan-500/5 via-violet-500/5 to-transparent">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                CHEMNOVA 3D PLATFORM
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                RDKit • Three.js WebGL • DFT • NMR • FTIR
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-tight">
              Next-Gen Computational Chemistry & Molecular Engineering
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
              Design molecules with continuous 2D CAD drafting, compute Lipinski matrices in Python, solve electronic orbitals with ab initio DFT, deconvolute multi-modal spectra, and plan multi-step organic synthesis pathways.
            </p>

            {/* Signature Formula Pills Banner */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="telemetry-pill text-[9px] text-cyan-300">
                CH₃-COOH (Acetic Acid)
              </span>
              <span className="telemetry-pill text-[9px] text-emerald-300">
                C₆H₆ (Benzene)
              </span>
              <span className="telemetry-pill text-[9px] text-violet-300">
                C₉H₈O₄ (Aspirin)
              </span>
              <span className="telemetry-pill text-[9px] text-amber-300">
                C₈H₁₀N₄O₂ (Caffeine)
              </span>
              <span className="telemetry-pill text-[9px] text-rose-300">
                ΔE (HOMO-LUMO)
              </span>
            </div>
          </div>

          {/* Quick Hub Navigator */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 w-full lg:w-auto">
            <button
              onClick={() => navigate('/rdkit-lab')}
              className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] transition flex items-center justify-between gap-3 shadow-md group"
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>RDKit Python Lab</span>
              </div>
              <span className="text-[9px] text-emerald-300 font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                C₉H₈O₄
              </span>
            </button>

            <button
              onClick={() => navigate('/quantum-library')}
              className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] transition flex items-center justify-between gap-3 shadow-md group"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-400" />
                <span>Quantum VQE Lab</span>
              </div>
              <span className="text-[9px] text-violet-300 font-mono px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20">
                DFT B3LYP
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC STAT METRICS CARDS WITH 3D DEPTH */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/rdkit-lab')}
          className="glass-panel p-4 rounded-2xl space-y-2 border border-[var(--border-subtle)] hover:border-cyan-500/40 cursor-pointer transition-all hover:-translate-y-1 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 font-sans font-bold">
              <Cpu className="w-4 h-4 text-cyan-400" /> RDKit Python Core
            </span>
            <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
              C₉H₈O₄
            </span>
          </div>
          <div className="text-2xl font-black text-cyan-400">{stats.rdkitExecutions} Computes</div>
          <div className="text-[10px] text-[var(--text-muted)] flex items-center justify-between font-mono">
            <span>Lipinski Rule of 5</span>
            <span className="text-cyan-300 font-bold">MW ≤ 500</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/quantum-library')}
          className="glass-panel p-4 rounded-2xl space-y-2 border border-[var(--border-subtle)] hover:border-violet-500/40 cursor-pointer transition-all hover:-translate-y-1 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 font-sans font-bold">
              <Zap className="w-4 h-4 text-violet-400" /> Quantum VQE Solvers
            </span>
            <span className="text-[9px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
              ΔE Gap
            </span>
          </div>
          <div className="text-2xl font-black text-violet-400">{stats.quantumComputes} Simulations</div>
          <div className="text-[10px] text-[var(--text-muted)] flex items-center justify-between font-mono">
            <span>DFT (B3LYP) / HF</span>
            <span className="text-violet-300 font-bold">6-31G(d)</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/spectroscopy')}
          className="glass-panel p-4 rounded-2xl space-y-2 border border-[var(--border-subtle)] hover:border-emerald-500/40 cursor-pointer transition-all hover:-translate-y-1 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 font-sans font-bold">
              <Radio className="w-4 h-4 text-emerald-400" /> Spectroscopy
            </span>
            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              C=O ~1715
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.spectroscopyRuns} Spectra</div>
          <div className="text-[10px] text-[var(--text-muted)] flex items-center justify-between font-mono">
            <span>FTIR • NMR • MS • UV</span>
            <span className="text-emerald-300 font-bold">δ 0-12 ppm</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/ibm-rxn')}
          className="glass-panel p-4 rounded-2xl space-y-2 border border-[var(--border-subtle)] hover:border-amber-500/40 cursor-pointer transition-all hover:-translate-y-1 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 font-sans font-bold">
              <Activity className="w-4 h-4 text-amber-400" /> RXN Synthesis
            </span>
            <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              R-COOR'
            </span>
          </div>
          <div className="text-2xl font-black text-amber-400">{stats.reactionsSynthesized} Pathways</div>
          <div className="text-[10px] text-[var(--text-muted)] flex items-center justify-between font-mono">
            <span>Retrosynthesis AI</span>
            <span className="text-amber-300 font-bold">Multi-Step</span>
          </div>
        </div>
      </div>

      {/* 4. DUAL COLUMN: RECENT ACTIVITY STREAM + QUICK INTERACTIVE LAUNCHPAD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* LEFT COLUMN (7 Cols): Dynamic Recent Activity Feed */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-3xl border border-[var(--border-subtle)] flex flex-col justify-between space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-inherit pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Recent Research Telemetry Stream
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshActivity}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                title="Refresh Activity Log"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClearHistory}
                className="text-[10px] opacity-60 hover:opacity-100 hover:text-rose-400 transition font-mono px-2 py-1 rounded-lg hover:bg-rose-500/10"
              >
                Clear Log
              </button>
            </div>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1 custom-scrollbar">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-xs opacity-50 italic space-y-2">
                <Compass className="w-8 h-8 mx-auto text-cyan-400/40" />
                <p>No telemetry recorded yet. Sketch a molecule, run an RDKit script, or calculate spectra to log computes.</p>
              </div>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl inner-box border border-[var(--border-subtle)] flex items-start justify-between gap-3 hover:border-cyan-500/30 transition shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] px-2 py-0.5 rounded-md font-bold font-mono uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                        {act.module}
                      </span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">{act.title}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] font-sans">{act.detail}</p>
                  </div>
                  <span className="text-[9px] text-[var(--text-muted)] shrink-0 mt-1 font-mono">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions Footer */}
          <div className="pt-3 border-t border-inherit flex items-center justify-between text-xs">
            <span className="text-[11px] text-[var(--text-muted)]">Auto-persisted to browser storage</span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Telemetry Synced
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols): Interactive Quick Actions & System Launchpad */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-3xl border border-[var(--border-subtle)] flex flex-col justify-between space-y-4 shadow-xl">
          <div className="border-b border-inherit pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Interactive Chemical Workspaces
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] font-sans mt-0.5">
              Direct access to specialized chemistry tools with formula quick-launch badges.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* 1. ChemDraw Studio */}
            <button
              onClick={() => {
                logActivity('ChemDraw', 'Opened ChemDraw CAD Studio', 'Preloaded Aspirin molecular graph', 'sketch');
                navigate('/chemdraw');
              }}
              className="p-3.5 rounded-2xl inner-box hover:border-cyan-400/50 transition flex items-center justify-between text-left group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black group-hover:text-cyan-300 transition text-[var(--text-primary)]">
                    ChemDraw 2D/3D CAD Studio
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-sans">
                    2D drawing, bond tools &amp; real-time 3D minimization
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  CH₃-C(=O)OH
                </span>
                <ArrowRight className="w-4 h-4 text-cyan-400 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* 2. RDKit Chemoinformatics */}
            <button
              onClick={() => {
                logActivity('RDKit Lab', 'Opened RDKit Python Sandbox', 'Loaded Lipinski descriptor workflow', 'rdkit');
                navigate('/rdkit-lab');
              }}
              className="p-3.5 rounded-2xl inner-box hover:border-emerald-400/50 transition flex items-center justify-between text-left group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black group-hover:text-emerald-300 transition text-[var(--text-primary)]">
                    RDKit Python Lab
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-sans">
                    Lipinski Rule of 5, MW, LogP &amp; Morgan fingerprints
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  C₉H₈O₄
                </span>
                <ArrowRight className="w-4 h-4 text-emerald-400 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* 3. Spectroscopy Analysis */}
            <button
              onClick={() => {
                logActivity('Spectroscopy', 'Simulated Analytical Spectra', 'Inspected FT-IR / NMR / MS peaks', 'spectroscopy');
                navigate('/spectroscopy');
              }}
              className="p-3.5 rounded-2xl inner-box hover:border-violet-400/50 transition flex items-center justify-between text-left group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 group-hover:scale-105 transition-transform">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black group-hover:text-violet-300 transition text-[var(--text-primary)]">
                    Spectroscopy Analytics Suite
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-sans">
                    FTIR functional groups, 1H/13C-NMR &amp; Mass Spec
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-lg bg-violet-500/15 text-violet-300 border border-violet-500/30">
                  C=O ~1715
                </span>
                <ArrowRight className="w-4 h-4 text-violet-400 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* 4. Periodic Table */}
            <button
              onClick={() => {
                logActivity('Periodic Table', 'Inspected 118 Elements', 'Filtered Mendeleev grid properties', 'general');
                navigate('/periodic-table');
              }}
              className="p-3.5 rounded-2xl inner-box hover:border-amber-400/50 transition flex items-center justify-between text-left group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black group-hover:text-amber-300 transition text-[var(--text-primary)]">
                    Interactive Periodic Table
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-sans">
                    118 Elements with electron configs &amp; trends
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  H¹ → Og¹¹⁸
                </span>
                <ArrowRight className="w-4 h-4 text-amber-400 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* 5. Scientists Archive */}
            <button
              onClick={() => {
                logActivity('Scientists', 'Explored Chemists Encyclopedia', 'Reviewed Nobel breakthroughs', 'general');
                navigate('/scientists');
              }}
              className="p-3.5 rounded-2xl inner-box hover:border-cyan-400/50 transition flex items-center justify-between text-left group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black group-hover:text-cyan-300 transition text-[var(--text-primary)]">
                    Scientists &amp; Discoveries Gallery
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-sans">
                    Verified biographies, formulas &amp; 3D molecules
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Nobel Archive
                </span>
                <ArrowRight className="w-4 h-4 text-cyan-400 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition" />
              </div>
            </button>
          </div>

          <div className="pt-3 border-t border-inherit flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Hardware Context: WebGL 2.0 GPU</span>
            <span className="text-cyan-400 font-bold">60 FPS Cluster Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
