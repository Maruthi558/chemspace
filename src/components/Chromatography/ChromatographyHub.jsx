import React, { useState, useMemo, useEffect } from 'react';
import {
  FlaskConical,
  Activity,
  Layers,
  Sparkles,
  Award,
  BookOpen,
  FileText,
  Calculator,
  Sliders,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  Info,
  Bot,
  Zap,
  HelpCircle,
  Clock,
  Bookmark,
  Calendar,
  Save,
  Search,
  ChevronRight,
  Sun,
  Radio,
  FileCode2,
  Atom
} from 'lucide-react';
import { CHROMATOGRAPHY_TECHNIQUES } from '../../data/chromatographyLessons';
import {
  calculateRf,
  calculateCapacityFactor,
  calculateResolution,
  calculateSelectivity,
  calculateColumnEfficiency,
  calculateAreaPercentage,
  calculateConcentrationFromCalibration,
  calculateColumnRecovery,
  calculateSEC
} from '../../services/chromatographyCalculations';
import InteractiveChromatogram from './InteractiveChromatogram';
import TLCVisualizer from './TLCVisualizer';
import PaperChromatographyVisualizer from './PaperChromatographyVisualizer';
import ColumnFractionTracker from './ColumnFractionTracker';
import { useTheme } from '../../context/ThemeContext';

export default function ChromatographyHub() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // 1. Technique Selection State
  const [selectedTechniqueId, setSelectedTechniqueId] = useState('hplc');

  // 2. Active Tab State ('experiment' | 'calculator' | 'lessons' | 'records')
  const [activeTab, setActiveTab] = useState('experiment');

  // 3. Technique-Specific Data States

  // Paper Data
  const [paperSolventFront, setPaperSolventFront] = useState(8.5);
  const [paperSolutes, setPaperSolutes] = useState([
    { name: 'Chlorophyll a', distanceCm: 4.2, color: '#16a34a' },
    { name: 'Chlorophyll b', distanceCm: 2.8, color: '#65a30d' },
    { name: 'Xanthophyll', distanceCm: 6.5, color: '#eab308' },
    { name: 'Carotene', distanceCm: 8.1, color: '#ea580c' }
  ]);

  // TLC Data
  const [tlcPlateHeight, setTlcPlateHeight] = useState(10.0);
  const [tlcSolventFront, setTlcSolventFront] = useState(8.0);
  const [tlcLanes, setTlcLanes] = useState([
    {
      name: 'Reactant (R)',
      spots: [{ name: 'Starting Material', distanceCm: 2.4, color: '#0284c7' }]
    },
    {
      name: 'Co-Spot (R+P)',
      spots: [
        { name: 'Starting Material', distanceCm: 2.4, color: '#0284c7' },
        { name: 'Product', distanceCm: 5.6, color: '#ea580c' }
      ]
    },
    {
      name: 'Product (P)',
      spots: [{ name: 'Isolated Product', distanceCm: 5.6, color: '#ea580c' }]
    }
  ]);

  // GC Data
  const [gcDeadTime, setGcDeadTime] = useState(0.8);
  const [gcColumnLength, setGcColumnLength] = useState(30); // meters
  const [gcCarrierGas, setGcCarrierGas] = useState('Helium');
  const [gcOvenTemp, setGcOvenTemp] = useState('180 °C (Isothermal)');
  const [gcPeaks, setGcPeaks] = useState([
    { name: 'Benzene', tR: 2.15, height: 85, width: 0.18, area: 540, responseFactor: 1.0 },
    { name: 'Toluene', tR: 3.82, height: 120, width: 0.24, area: 980, responseFactor: 1.05 },
    { name: 'Ethylbenzene', tR: 5.45, height: 60, width: 0.28, area: 490, responseFactor: 1.1 },
    { name: 'o-Xylene', tR: 6.95, height: 95, width: 0.32, area: 780, responseFactor: 1.12 }
  ]);

  // HPLC Data
  const [hplcDeadTime, setHplcDeadTime] = useState(1.2);
  const [hplcColumnLengthMm, setHplcColumnLengthMm] = useState(150);
  const [hplcFlowRate, setHplcFlowRate] = useState(1.0);
  const [hplcMobilePhase, setHplcMobilePhase] = useState('65% Water (0.1% TFA) / 35% Acetonitrile');
  const [hplcPeaks, setHplcPeaks] = useState([
    { name: 'Paracetamol', tR: 2.45, height: 95, width: 0.22, area: 720, responseFactor: 1.0 },
    { name: 'Aspirin', tR: 4.80, height: 140, width: 0.28, area: 1280, responseFactor: 1.0 },
    { name: 'Caffeine', tR: 7.15, height: 110, width: 0.35, area: 950, responseFactor: 1.0 }
  ]);

  // Column Chromatography Data
  const [columnMassLoaded, setColumnMassLoaded] = useState(600); // mg
  const [columnFractions, setColumnFractions] = useState([
    { fractionNumber: 1, volumeMl: 20, massMg: 0, purity: 0, rfValue: 0, color: '#64748b', notes: 'Void volume eluate' },
    { fractionNumber: 2, volumeMl: 20, massMg: 45, purity: 88, rfValue: 0.72, color: '#f59e0b', notes: 'Fast-running nonpolar impurity' },
    { fractionNumber: 3, volumeMl: 20, massMg: 180, purity: 98, rfValue: 0.45, color: '#06b6d4', notes: 'Target Product (Pure Fraction A)' },
    { fractionNumber: 4, volumeMl: 20, massMg: 290, purity: 99, rfValue: 0.45, color: '#06b6d4', notes: 'Target Product (Pure Fraction B)' },
    { fractionNumber: 5, volumeMl: 20, massMg: 35, purity: 91, rfValue: 0.20, color: '#ec4899', notes: 'Polar baseline impurity' }
  ]);

  // SEC Data
  const [secVe, setSecVe] = useState(14.5);
  const [secV0, setSecV0] = useState(7.5);
  const [secVt, setSecVt] = useState(24.0);

  // Dedicated Calculator State
  const [calcType, setCalcType] = useState('rf');
  const [calcInputs, setCalcInputs] = useState({
    soluteDist: '4.5',
    solventFrontDist: '9.0',
    tR1: '3.2',
    tR2: '4.8',
    w1: '0.3',
    w2: '0.4',
    t0: '0.9',
    lengthMm: '150',
    peakArea: '1450',
    slope: '25.4',
    intercept: '12.0',
    massLoaded: '500',
    recoveredMass: '465'
  });

  // Experiment Logging State
  const [experimentTitle, setExperimentTitle] = useState('Analytical Quality Assay');
  const [experimentSample, setExperimentSample] = useState('Pharmaceutical Formulation Lot #2026-A');
  const [experimentNotes, setExperimentNotes] = useState('Sample was filtered through 0.22 µm PTFE syringe filter prior to column injection. Baseline separation observed with no peak tailing.');
  const [savedRecords, setSavedRecords] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chromatography_experiments')) || [];
    } catch {
      return [];
    }
  });

  const selectedTechnique = useMemo(() => {
    return CHROMATOGRAPHY_TECHNIQUES.find((t) => t.id === selectedTechniqueId) || CHROMATOGRAPHY_TECHNIQUES[0];
  }, [selectedTechniqueId]);

  const handleSaveExperiment = () => {
    const record = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toISOString(),
      title: experimentTitle,
      sample: experimentSample,
      technique: selectedTechnique.name,
      techniqueId: selectedTechnique.id,
      notes: experimentNotes,
      summaryMetric:
        selectedTechniqueId === 'hplc'
          ? `${hplcPeaks.length} Peaks integrated`
          : selectedTechniqueId === 'gc'
          ? `${gcPeaks.length} Peaks integrated`
          : selectedTechniqueId === 'tlc'
          ? `${tlcLanes.length} TLC Lanes resolved`
          : `${paperSolutes.length} Solutes analyzed`
    };

    const updated = [record, ...savedRecords];
    setSavedRecords(updated);
    try {
      localStorage.setItem('chromatography_experiments', JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteRecord = (id) => {
    const updated = savedRecords.filter((r) => r.id !== id);
    setSavedRecords(updated);
    try {
      localStorage.setItem('chromatography_experiments', JSON.stringify(updated));
    } catch {}
  };

  // Dedicated Calculator Results
  const calculatorResult = useMemo(() => {
    switch (calcType) {
      case 'rf':
        return calculateRf(calcInputs.soluteDist, calcInputs.solventFrontDist, 'cm');
      case 'k_factor':
        return calculateCapacityFactor(calcInputs.tR1, calcInputs.t0, 'min');
      case 'resolution':
        return calculateResolution(calcInputs.tR1, calcInputs.tR2, calcInputs.w1, calcInputs.w2, false, 'min');
      case 'selectivity':
        return calculateSelectivity(calcInputs.tR1, calcInputs.tR2, calcInputs.t0);
      case 'efficiency':
        return calculateColumnEfficiency(calcInputs.tR1, calcInputs.w1, calcInputs.lengthMm, false);
      case 'concentration':
        return calculateConcentrationFromCalibration(calcInputs.peakArea, calcInputs.slope, calcInputs.intercept, 'µg/mL');
      case 'sec':
        return calculateSEC(secVe, secV0, secVt);
      default:
        return null;
    }
  }, [calcType, calcInputs, secVe, secV0, secVt]);

  return (
    <div className="workspace-container font-mono select-none space-y-6">
      {/* 1. WORKSPACE HEADER */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <FlaskConical className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-wider text-[var(--text-primary)]">
                Analytical Chromatography &amp; Separation Science Studio
              </h1>
              <span className="telemetry-pill text-[9px] font-bold">
                8 TECHNIQUES INTEGRATED
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] font-sans mt-0.5">
              Instrumental chromatography workflows, real quantitative calculations (Rf, tR, k', α, Rs, N, HETP), interactive visual chromatograms, and experiment logging.
            </p>
          </div>
        </div>

        {/* Global Hub Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-[var(--border-subtle)]">
          {[
            { id: 'experiment', label: 'Analysis & Workspace', icon: Activity },
            { id: 'calculator', label: 'Step-by-Step Calculator', icon: Calculator },
            { id: 'lessons', label: 'Theory & Lessons', icon: BookOpen },
            { id: 'records', label: 'Lab Records & Notes', icon: FileText }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === id
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. TECHNIQUE SELECTOR BAR */}
      <div className="glass-panel p-3.5 rounded-3xl border border-[var(--border-subtle)] flex items-center gap-2 overflow-x-auto custom-scrollbar shadow-lg">
        {CHROMATOGRAPHY_TECHNIQUES.map((tech) => {
          const isSelected = selectedTechniqueId === tech.id;
          return (
            <button
              key={tech.id}
              onClick={() => setSelectedTechniqueId(tech.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border ${
                isSelected
                  ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] border-cyan-400/50 shadow-md font-black'
                  : 'bg-white/5 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
              }`}
            >
              <span>{tech.name}</span>
              <span
                className={`text-[8px] font-mono px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-black/30 text-cyan-200' : 'bg-white/10 text-slate-400'
                }`}
              >
                {tech.shortCode}
              </span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: EXPERIMENT & ANALYSIS WORKSPACE
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'experiment' && (
        <div className="space-y-6">
          {/* Technique Info Banner */}
          <div className="glass-panel p-4 rounded-3xl border border-[var(--border-subtle)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg bg-gradient-to-r from-cyan-500/5 via-transparent to-transparent">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-[var(--text-primary)]">{selectedTechnique.name}</h2>
                <span className="telemetry-pill text-[9px] text-cyan-300 font-bold">
                  {selectedTechnique.category}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-sans">
                {selectedTechnique.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold">
                {selectedTechnique.formula}
              </span>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('chemspace-open-copilot'));
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--border-subtle)] text-cyan-400 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Bot className="w-3.5 h-3.5 animate-pulse" />
                <span>Ask AI</span>
              </button>
            </div>
          </div>

          {/* ── 1. PAPER CHROMATOGRAPHY WORKSPACE ── */}
          {selectedTechniqueId === 'paper' && (
            <div className="space-y-6">
              <div className="glass-panel p-4 rounded-3xl border border-[var(--border-subtle)] space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                  Experimental Parameters
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Solvent Front Distance:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        value={paperSolventFront}
                        onChange={(e) => setPaperSolventFront(parseFloat(e.target.value) || 1)}
                        className="input-control px-2 py-1 text-xs rounded-lg w-full font-bold text-cyan-400"
                      />
                      <span>cm</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Stationary Phase:</span>
                    <input
                      type="text"
                      defaultValue="Whatman No. 1 Chromatography Paper"
                      className="input-control px-2 py-1 text-xs rounded-lg w-full"
                    />
                  </div>

                  <div className="p-3 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Mobile Phase Solvent:</span>
                    <input
                      type="text"
                      defaultValue="n-Butanol : Acetic Acid : Water (4:1:5)"
                      className="input-control px-2 py-1 text-xs rounded-lg w-full"
                    />
                  </div>
                </div>
              </div>

              <PaperChromatographyVisualizer
                solventFrontCm={paperSolventFront}
                solutes={paperSolutes}
                onSolutesChange={setPaperSolutes}
                isDark={isDark}
              />
            </div>
          )}

          {/* ── 2. TLC WORKSPACE ── */}
          {selectedTechniqueId === 'tlc' && (
            <div className="space-y-6">
              <div className="glass-panel p-4 rounded-3xl border border-[var(--border-subtle)] space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                  TLC Chamber &amp; Plate Parameters
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Plate Height:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.5"
                        value={tlcPlateHeight}
                        onChange={(e) => setTlcPlateHeight(parseFloat(e.target.value) || 10)}
                        className="input-control px-2 py-1 text-xs rounded-lg w-full font-bold text-cyan-400"
                      />
                      <span>cm</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Solvent Front Position:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        value={tlcSolventFront}
                        onChange={(e) => setTlcSolventFront(parseFloat(e.target.value) || 8)}
                        className="input-control px-2 py-1 text-xs rounded-lg w-full font-bold text-cyan-400"
                      />
                      <span>cm</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Eluent System:</span>
                    <input
                      type="text"
                      defaultValue="Hexane : Ethyl Acetate (7 : 3 v/v)"
                      className="input-control px-2 py-1 text-xs rounded-lg w-full"
                    />
                  </div>
                </div>
              </div>

              <TLCVisualizer
                plateHeightCm={tlcPlateHeight}
                solventFrontCm={tlcSolventFront}
                lanes={tlcLanes}
                onLanesChange={setTlcLanes}
                isDark={isDark}
              />
            </div>
          )}

          {/* ── 3. GC WORKSPACE ── */}
          {selectedTechniqueId === 'gc' && (
            <div className="space-y-6">
              <div className="glass-panel p-4 rounded-3xl border border-[var(--border-subtle)] space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                  GC Instrument &amp; Oven Parameters
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Unretained Dead Time (t₀):</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.05"
                        value={gcDeadTime}
                        onChange={(e) => setGcDeadTime(parseFloat(e.target.value) || 0.5)}
                        className="input-control px-2 py-1 text-xs rounded-lg w-full font-bold text-amber-400"
                      />
                      <span>min</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Carrier Gas:</span>
                    <input
                      type="text"
                      value={gcCarrierGas}
                      onChange={(e) => setGcCarrierGas(e.target.value)}
                      className="input-control px-2 py-1 text-xs rounded-lg w-full"
                    />
                  </div>

                  <div className="p-3 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Capillary Column:</span>
                    <input
                      type="text"
                      defaultValue="DB-5ms (30 m × 0.25 mm, 0.25 µm)"
                      className="input-control px-2 py-1 text-xs rounded-lg w-full"
                    />
                  </div>

                  <div className="p-3 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Detector:</span>
                    <input
                      type="text"
                      defaultValue="FID (Flame Ionization, 300 °C)"
                      className="input-control px-2 py-1 text-xs rounded-lg w-full"
                    />
                  </div>
                </div>
              </div>

              <InteractiveChromatogram
                title="Gas Chromatogram (GC-FID Trace)"
                peaks={gcPeaks}
                onPeaksChange={setGcPeaks}
                deadTime={gcDeadTime}
                columnLength={gcColumnLength * 1000}
                unit="min"
                isDark={isDark}
              />
            </div>
          )}

          {/* ── 4. HPLC WORKSPACE ── */}
          {selectedTechniqueId === 'hplc' && (
            <div className="space-y-6">
              <div className="glass-panel p-4 rounded-3xl border border-[var(--border-subtle)] space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                  HPLC Chromatographic Conditions
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Column Void Time (t₀):</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.05"
                        value={hplcDeadTime}
                        onChange={(e) => setHplcDeadTime(parseFloat(e.target.value) || 1)}
                        className="input-control px-2 py-1 text-xs rounded-lg w-full font-bold text-amber-400"
                      />
                      <span>min</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Flow Rate:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        value={hplcFlowRate}
                        onChange={(e) => setHplcFlowRate(parseFloat(e.target.value) || 1.0)}
                        className="input-control px-2 py-1 text-xs rounded-lg w-full font-bold text-cyan-400"
                      />
                      <span>mL/min</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Column Specs:</span>
                    <input
                      type="text"
                      defaultValue="C18 RP (150 × 4.6 mm, 3.5 µm)"
                      className="input-control px-2 py-1 text-xs rounded-lg w-full"
                    />
                  </div>

                  <div className="p-3 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">UV Detection:</span>
                    <input
                      type="text"
                      defaultValue="PDA / DAD @ 254 nm"
                      className="input-control px-2 py-1 text-xs rounded-lg w-full"
                    />
                  </div>
                </div>
              </div>

              <InteractiveChromatogram
                title="HPLC UV-Vis Chromatographic Trace"
                peaks={hplcPeaks}
                onPeaksChange={setHplcPeaks}
                deadTime={hplcDeadTime}
                columnLength={hplcColumnLengthMm}
                unit="min"
                isDark={isDark}
              />
            </div>
          )}

          {/* ── 5. COLUMN CHROMATOGRAPHY WORKSPACE ── */}
          {selectedTechniqueId === 'column' && (
            <div className="space-y-6">
              <div className="glass-panel p-4 rounded-3xl border border-[var(--border-subtle)] space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                  Flash Column Setup Parameters
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Crude Mass Loaded:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={columnMassLoaded}
                        onChange={(e) => setColumnMassLoaded(parseFloat(e.target.value) || 100)}
                        className="input-control px-2 py-1 text-xs rounded-lg w-full font-bold text-cyan-400"
                      />
                      <span>mg</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Stationary Adsorbent:</span>
                    <input
                      type="text"
                      defaultValue="Silica Gel 60 (40–63 µm, 25 g)"
                      className="input-control px-2 py-1 text-xs rounded-lg w-full"
                    />
                  </div>

                  <div className="p-3 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Gradient Elution:</span>
                    <input
                      type="text"
                      defaultValue="100% Hexane → 10% EtOAc → 25% EtOAc"
                      className="input-control px-2 py-1 text-xs rounded-lg w-full"
                    />
                  </div>
                </div>
              </div>

              <ColumnFractionTracker
                massLoadedMg={columnMassLoaded}
                fractions={columnFractions}
                onFractionsChange={setColumnFractions}
                isDark={isDark}
              />
            </div>
          )}

          {/* ── 6. ION-EXCHANGE, SEC & AFFINITY WORKSPACES ── */}
          {(selectedTechniqueId === 'ion_exchange' ||
            selectedTechniqueId === 'sec' ||
            selectedTechniqueId === 'affinity') && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <Atom className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-black text-[var(--text-primary)]">
                    {selectedTechnique.name} Analysis &amp; Sizing Matrix
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-sans">
                  {selectedTechnique.principle}
                </p>

                {selectedTechniqueId === 'sec' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-mono">
                    <div className="p-3 rounded-2xl inner-box space-y-1">
                      <span className="text-[10px] text-[var(--text-muted)]">Elution Volume (V_e):</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          value={secVe}
                          onChange={(e) => setSecVe(parseFloat(e.target.value) || 0)}
                          className="input-control px-2 py-1 text-xs rounded-lg w-full font-bold text-cyan-400"
                        />
                        <span>mL</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl inner-box space-y-1">
                      <span className="text-[10px] text-[var(--text-muted)]">Void Volume (V_0):</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          value={secV0}
                          onChange={(e) => setSecV0(parseFloat(e.target.value) || 0)}
                          className="input-control px-2 py-1 text-xs rounded-lg w-full font-bold text-amber-400"
                        />
                        <span>mL</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl inner-box space-y-1">
                      <span className="text-[10px] text-[var(--text-muted)]">Total Volume (V_t):</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          value={secVt}
                          onChange={(e) => setSecVt(parseFloat(e.target.value) || 0)}
                          className="input-control px-2 py-1 text-xs rounded-lg w-full font-bold text-violet-400"
                        />
                        <span>mL</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: STEP-BY-STEP CHROMATOGRAPHY CALCULATOR
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-6 shadow-xl">
            <div className="border-b border-inherit pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-[var(--text-primary)]">
                  Step-by-Step Chromatography Calculation Engine
                </h2>
                <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
                  Select a chromatographic formula to inspect complete mathematical derivations with explicit inputs, formulas, substitutions, and units.
                </p>
              </div>
            </div>

            {/* Formula Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {[
                { id: 'rf', label: 'Retention Factor (Rf)' },
                { id: 'k_factor', label: "Capacity Factor (k')" },
                { id: 'resolution', label: 'Resolution (Rs)' },
                { id: 'selectivity', label: 'Selectivity (α)' },
                { id: 'efficiency', label: 'Plates & HETP (N, H)' },
                { id: 'concentration', label: 'Calibration Standard Curve' },
                { id: 'sec', label: 'SEC Distribution (K_SEC)' }
              ].map((calc) => (
                <button
                  key={calc.id}
                  onClick={() => setCalcType(calc.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold font-mono transition whitespace-nowrap ${
                    calcType === calc.id
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                      : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {calc.label}
                </button>
              ))}
            </div>

            {/* Dynamic Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              {calcType === 'rf' && (
                <>
                  <div className="p-3.5 rounded-2xl inner-box space-y-1.5">
                    <span className="text-[10px] text-[var(--text-muted)]">Distance of Solute (d₁):</span>
                    <input
                      type="number"
                      step="0.1"
                      value={calcInputs.soluteDist}
                      onChange={(e) => setCalcInputs({ ...calcInputs, soluteDist: e.target.value })}
                      className="input-control px-3 py-1.5 text-xs rounded-xl w-full font-bold text-cyan-400"
                    />
                  </div>
                  <div className="p-3.5 rounded-2xl inner-box space-y-1.5">
                    <span className="text-[10px] text-[var(--text-muted)]">Distance of Solvent Front (d₂):</span>
                    <input
                      type="number"
                      step="0.1"
                      value={calcInputs.solventFrontDist}
                      onChange={(e) => setCalcInputs({ ...calcInputs, solventFrontDist: e.target.value })}
                      className="input-control px-3 py-1.5 text-xs rounded-xl w-full font-bold text-cyan-400"
                    />
                  </div>
                </>
              )}

              {calcType === 'resolution' && (
                <>
                  <div className="p-3.5 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Peak 1 Retention (tR₁):</span>
                    <input
                      type="number"
                      step="0.01"
                      value={calcInputs.tR1}
                      onChange={(e) => setCalcInputs({ ...calcInputs, tR1: e.target.value })}
                      className="input-control px-3 py-1.5 text-xs rounded-xl w-full font-bold"
                    />
                  </div>
                  <div className="p-3.5 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Peak 2 Retention (tR₂):</span>
                    <input
                      type="number"
                      step="0.01"
                      value={calcInputs.tR2}
                      onChange={(e) => setCalcInputs({ ...calcInputs, tR2: e.target.value })}
                      className="input-control px-3 py-1.5 text-xs rounded-xl w-full font-bold"
                    />
                  </div>
                  <div className="p-3.5 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Baseline Widths (W₁ + W₂):</span>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={calcInputs.w1}
                        onChange={(e) => setCalcInputs({ ...calcInputs, w1: e.target.value })}
                        className="input-control px-2 py-1 text-xs rounded-xl w-1/2"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={calcInputs.w2}
                        onChange={(e) => setCalcInputs({ ...calcInputs, w2: e.target.value })}
                        className="input-control px-2 py-1 text-xs rounded-xl w-1/2"
                      />
                    </div>
                  </div>
                </>
              )}

              {calcType === 'concentration' && (
                <>
                  <div className="p-3.5 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Sample Peak Area (A_x):</span>
                    <input
                      type="number"
                      value={calcInputs.peakArea}
                      onChange={(e) => setCalcInputs({ ...calcInputs, peakArea: e.target.value })}
                      className="input-control px-3 py-1.5 text-xs rounded-xl w-full font-bold text-cyan-400"
                    />
                  </div>
                  <div className="p-3.5 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Calibration Slope (m):</span>
                    <input
                      type="number"
                      value={calcInputs.slope}
                      onChange={(e) => setCalcInputs({ ...calcInputs, slope: e.target.value })}
                      className="input-control px-3 py-1.5 text-xs rounded-xl w-full font-bold"
                    />
                  </div>
                  <div className="p-3.5 rounded-2xl inner-box space-y-1">
                    <span className="text-[10px] text-[var(--text-muted)]">Y-Intercept (b):</span>
                    <input
                      type="number"
                      value={calcInputs.intercept}
                      onChange={(e) => setCalcInputs({ ...calcInputs, intercept: e.target.value })}
                      className="input-control px-3 py-1.5 text-xs rounded-xl w-full"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Transparent Calculation Results Card */}
            {calculatorResult && calculatorResult.success && (
              <div className="p-6 rounded-3xl border border-cyan-500/30 bg-black/40 space-y-4 shadow-xl font-mono text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-cyan-400 font-bold uppercase tracking-wider text-xs">
                    Step-by-Step Derivation Breakdown
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 font-black text-sm border border-emerald-500/30">
                    {calculatorResult.steps.result}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase block">1. Input Values:</span>
                    <div className="text-[var(--text-primary)] font-bold">{calculatorResult.steps.inputValues}</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase block">2. Standard Formula:</span>
                    <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-cyan-300 text-sm font-bold text-center">
                      {calculatorResult.steps.formula}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase block">3. Variable Substitution:</span>
                    <div className="text-[var(--text-primary)]">{calculatorResult.steps.substitution}</div>
                  </div>

                  {calculatorResult.interpretation && (
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs">
                      <strong>Scientific Interpretation: </strong>
                      {calculatorResult.interpretation}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: THEORY & EDUCATIONAL LESSONS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Principle & Mechanism */}
            <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-3 shadow-xl">
              <span className="text-xs font-black uppercase text-cyan-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Fundamental Principle
              </span>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                {selectedTechnique.principle}
              </p>
            </div>

            {/* Stationary & Mobile Phases */}
            <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-3 shadow-xl">
              <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Phase Chemistry &amp; Mechanism
              </span>
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <strong className="text-[var(--text-primary)]">Stationary Phase: </strong>
                  <span className="text-[var(--text-secondary)] font-sans">{selectedTechnique.stationaryPhase}</span>
                </div>
                <div>
                  <strong className="text-[var(--text-primary)]">Mobile Phase: </strong>
                  <span className="text-[var(--text-secondary)] font-sans">{selectedTechnique.mobilePhase}</span>
                </div>
                <div>
                  <strong className="text-[var(--text-primary)]">Mechanism: </strong>
                  <span className="text-cyan-300 font-sans">{selectedTechnique.mechanism}</span>
                </div>
              </div>
            </div>

            {/* Standard Operating Procedure */}
            <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-3 shadow-xl md:col-span-2">
              <span className="text-xs font-black uppercase text-violet-400 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" /> Standard Laboratory Procedure (SOP)
              </span>
              <ol className="list-decimal pl-5 space-y-2 text-xs text-[var(--text-secondary)] font-sans">
                {selectedTechnique.standardProcedure?.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Troubleshooting Guide */}
            <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-3 shadow-xl md:col-span-2">
              <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <AlertTriangleIcon className="w-4 h-4" /> Troubleshooting &amp; Common Errors
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedTechnique.troubleshooting?.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl inner-box space-y-1.5 border border-amber-500/20">
                    <strong className="text-xs text-amber-300 font-mono block">{item.issue}</strong>
                    <p className="text-xs text-[var(--text-secondary)] font-sans">
                      <strong>Cause: </strong>
                      {item.cause}
                    </p>
                    <p className="text-xs text-emerald-400 font-sans">
                      <strong>Correction: </strong>
                      {item.fix}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4: LAB RECORDS & NOTES LOGGING
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-4 shadow-xl">
            <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
              Record New Analytical Experiment
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-[var(--text-muted)]">Experiment Title:</span>
                <input
                  type="text"
                  value={experimentTitle}
                  onChange={(e) => setExperimentTitle(e.target.value)}
                  className="input-control px-3 py-2 text-xs rounded-xl w-full"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-[var(--text-muted)]">Sample Name / Batch ID:</span>
                <input
                  type="text"
                  value={experimentSample}
                  onChange={(e) => setExperimentSample(e.target.value)}
                  className="input-control px-3 py-2 text-xs rounded-xl w-full"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <span className="text-[10px] text-[var(--text-muted)]">Lab Observations &amp; Notes:</span>
                <textarea
                  rows="3"
                  value={experimentNotes}
                  onChange={(e) => setExperimentNotes(e.target.value)}
                  className="input-control px-3 py-2 text-xs rounded-xl w-full font-sans"
                />
              </div>
            </div>

            <button
              onClick={handleSaveExperiment}
              className="px-4 py-2 rounded-2xl bg-cyan-500 text-slate-950 font-black text-xs font-mono shadow-md hover:bg-cyan-400 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Experiment to Records</span>
            </button>
          </div>

          {/* Saved Records History */}
          <div className="space-y-3">
            <span className="text-xs font-bold font-mono text-[var(--text-secondary)] px-1">
              Saved Laboratory Records ({savedRecords.length})
            </span>

            {savedRecords.length === 0 ? (
              <div className="glass-panel p-8 rounded-3xl text-center text-xs text-slate-500 italic">
                No experiment records saved yet. Fill in the fields above and click "Save Experiment".
              </div>
            ) : (
              savedRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="glass-panel p-4 rounded-2xl border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 text-[10px] font-bold font-mono border border-cyan-500/30">
                        {rec.technique}
                      </span>
                      <strong className="text-xs text-[var(--text-primary)] font-mono">{rec.title}</strong>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">({rec.date})</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] font-sans">{rec.notes}</p>
                    <div className="text-[10px] text-emerald-400 font-mono font-bold">{rec.summaryMetric}</div>
                  </div>

                  <button
                    onClick={() => handleDeleteRecord(rec.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AlertTriangleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
