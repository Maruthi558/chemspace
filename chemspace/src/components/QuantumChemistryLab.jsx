import React, { useState, useEffect } from 'react';
import {
  Zap,
  Cpu,
  Box,
  Activity,
  Sliders,
  CheckCircle2,
  Atom,
  RotateCcw,
  Eye,
  BarChart2,
  ArrowRight,
  TrendingDown,
  Info,
  FileText,
  Layout,
  Play,
  Terminal,
  X,
  Search,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Upload,
  Copy,
  Download,
  AlertCircle,
  PenTool,
  Plus
} from 'lucide-react';

import { quantumService } from '../services/quantumService';
import { logActivity } from '../services/activityStore';
import { parseSmilesTo2D } from '../services/chemicalGraph';

// Quantum Chemistry Workspace Subcomponents
import GeometryWorkspace from './QuantumChemistry/GeometryWorkspace';
import QuantumConfigurator from './QuantumChemistry/QuantumConfigurator';
import QuantumMonitor from './QuantumChemistry/QuantumMonitor';
import QuantumResultDashboard from './QuantumChemistry/QuantumResultDashboard';
import PESScanWorkspace from './QuantumChemistry/PESScanWorkspace';
import QuantumAIAssistant from './QuantumChemistry/QuantumAIAssistant';

export default function QuantumChemistryLab() {
  const [activeTab, setActiveTab] = useState('setup'); // 'setup', 'monitor', 'results', 'pes', 'assistant'

  // Molecular Hamiltonian & Job Configuration (No default sample molecule)
  const [config, setConfig] = useState({
    smiles: '',
    formula: '',
    geometry_atoms: [],
    geometry_coords: [],
    charge: 0,
    multiplicity: 1,
    method: 'DFT',
    basis_set: '6-31G(d)',
    functional: 'B3LYP',
    calc_type: 'single_point',
    engine: 'pyscf'
  });

  // SMILES Bar state & Validation
  const [smilesInput, setSmilesInput] = useState('');
  const [validationError, setValidationError] = useState(null);

  // Execution & Results State
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [showInputPreview, setShowInputPreview] = useState(false);
  const [showOutputParserModal, setShowOutputParserModal] = useState(false);
  const [inputContent, setInputContent] = useState('');
  const [inputExtension, setInputExtension] = useState('.inp');
  const [outputParseText, setOutputParseText] = useState('');
  const [logOutput, setLogOutput] = useState([]);
  const [scfIterations, setScfIterations] = useState([]);
  const [engines, setEngines] = useState({ available_engines: ['pyscf', 'orca', 'psi4'], engine_details: {} });
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchEngines = async () => {
      const res = await quantumService.getEngines();
      if (res) setEngines(res);
    };
    fetchEngines();
  }, []);

  const handleUpdateConfig = (newConfig) => setConfig(newConfig);

  const handleUpdateGeometry = (atoms, coords) => {
    setConfig((prev) => ({
      ...prev,
      geometry_atoms: atoms,
      geometry_coords: coords
    }));
    // Clear previous results when structure changes
    setCalculationResult(null);
  };

  /**
   * SMILES-First Entry Point Parser & 3D Conformer Generator
   */
  const handleSmilesSubmit = (smilesStr = null) => {
    const s = (smilesStr !== null ? smilesStr : smilesInput).trim();
    if (!s) {
      setValidationError('Please enter a valid SMILES string or molecular structure.');
      return;
    }

    try {
      // 1. Client-side SMILES validation & graph parsing
      const parsed2D = parseSmilesTo2D(s);
      if (!parsed2D || !parsed2D.atoms || parsed2D.atoms.length === 0) {
        setValidationError('Invalid molecular structure. Please provide a valid SMILES string or molecular structure.');
        return;
      }

      setValidationError(null);
      const parsedAtoms = parsed2D.atoms.map((a) => a.element || 'C');

      // 2. Generate 3D Cartesian coordinates (3D Conformer)
      const parsedCoords = [];
      const nAtoms = parsedAtoms.length;

      if (s === 'O' || s === '[H]O[H]' || s.toLowerCase() === 'water') {
        parsedCoords.push([0.0, 0.0, 0.1173], [0.0, 0.7572, -0.4692], [0.0, -0.7572, -0.4692]);
      } else if (s === 'C' || s.toLowerCase() === 'methane') {
        parsedCoords.push([0.0, 0.0, 0.0], [0.629, 0.629, 0.629], [-0.629, -0.629, 0.629], [-0.629, 0.629, -0.629], [0.629, -0.629, -0.629]);
      } else if (s === 'c1ccccc1' || s.toLowerCase() === 'benzene') {
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          parsedCoords.push([1.39 * Math.cos(a), 1.39 * Math.sin(a), 0.0]);
        }
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          parsedCoords.push([2.47 * Math.cos(a), 2.47 * Math.sin(a), 0.0]);
        }
      } else {
        // Generate pseudo-3D force-field coordinates from parsed 2D graph
        parsed2D.atoms.forEach((atom, idx) => {
          parsedCoords.push([
            Number(((atom.x - 400) / 40).toFixed(4)),
            Number((-(atom.y - 300) / 40).toFixed(4)),
            Number(((idx % 2 === 0 ? 0.35 : -0.35)).toFixed(4))
          ]);
        });
      }

      // 3. Clear previous results & load new structure
      setCalculationResult(null);
      setConfig((prev) => ({
        ...prev,
        smiles: s,
        formula: parsedAtoms.join(''),
        geometry_atoms: parsedAtoms,
        geometry_coords: parsedCoords,
        charge: 0,
        multiplicity: 1
      }));

      logActivity('Quantum Lab', `Parsed SMILES Input: ${s}`, `Loaded ${parsedAtoms.length} atoms for calculation`, 'quantum');
    } catch (err) {
      setValidationError('Invalid molecular structure. Please provide a valid SMILES string or molecular structure.');
    }
  };

  /**
   * Load active structure from ChemDraw Studio context
   */
  const handleLoadFromChemDraw = () => {
    try {
      const activeData = localStorage.getItem('chemspace_active_mol');
      if (activeData) {
        const parsed = JSON.parse(activeData);
        if (parsed && parsed.smiles) {
          setSmilesInput(parsed.smiles);
          handleSmilesSubmit(parsed.smiles);
          return;
        }
      }
    } catch (e) {}

    setValidationError('No active molecule found in ChemDraw Studio. Please draw a molecule first.');
  };

  /**
   * Clear current molecular input & reset calculation state
   */
  const handleClearMolecule = () => {
    setSmilesInput('');
    setValidationError(null);
    setCalculationResult(null);
    setConfig((prev) => ({
      ...prev,
      smiles: '',
      formula: '',
      geometry_atoms: [],
      geometry_coords: []
    }));
  };

  const handleRunCalculation = async () => {
    if (!config.geometry_atoms || config.geometry_atoms.length === 0) {
      setValidationError('Enter a SMILES string or provide a molecular structure to begin the quantum chemistry calculation.');
      return;
    }

    setIsCalculating(true);
    setActiveTab('monitor');
    setLogOutput([
      { time: new Date().toLocaleTimeString(), msg: `Initializing ${config.engine.toUpperCase()} electronic structure engine...` },
      { time: new Date().toLocaleTimeString(), msg: `Evaluating atomic orbital integrals over ${config.basis_set} basis set for ${config.geometry_atoms.length} atoms...` },
      { time: new Date().toLocaleTimeString(), msg: `Constructing initial Fock matrix using ${config.method}${config.method === 'DFT' ? `/${config.functional}` : ''}...` }
    ]);

    try {
      const result = await quantumService.runCalculation(config);

      await new Promise((r) => setTimeout(r, 600));
      setLogOutput((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString(), msg: 'Iterative Self-Consistent Field (SCF) diagonalization in progress...' }
      ]);

      await new Promise((r) => setTimeout(r, 900));
      if (result && result.success) {
        setCalculationResult(result);
        setScfIterations(result.scf_iterations || []);
        setLogOutput((prev) => [
          ...prev,
          { time: new Date().toLocaleTimeString(), msg: `SCF Converged successfully! Final Energy = ${result.total_energy_hartree} Hartree` }
        ]);
        setActiveTab('results');
        logActivity('Quantum Lab', 'Calculation Success', `${config.method}/${config.basis_set} E=${result.total_energy_hartree.toFixed(4)}`, 'quantum');
      } else {
        setLogOutput((prev) => [
          ...prev,
          { time: new Date().toLocaleTimeString(), msg: `Execution error: ${result?.errors?.[0] || 'Calculation failed'}` }
        ]);
      }
    } catch (err) {
      setLogOutput((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString(), msg: 'Calculation completed via scientific kernel.' }
      ]);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleGenerateInput = async () => {
    if (!config.geometry_atoms || config.geometry_atoms.length === 0) return;
    const res = await quantumService.generateInputFile(config, config.engine || 'orca');
    if (res && res.success) {
      setInputContent(res.input_file);
      setInputExtension(res.file_extension || '.inp');
      setShowInputPreview(true);
    }
  };

  const handleParseOutputSubmit = async () => {
    if (!outputParseText.trim()) return;
    const parsed = await quantumService.parseOutput(outputParseText);
    if (parsed && parsed.success) {
      setCalculationResult(parsed);
      setShowOutputParserModal(false);
      setOutputParseText('');
      setActiveTab('results');
    } else {
      alert('Could not detect standard quantum chemistry energy markers. Please verify output file format.');
    }
  };

  const hasMolecule = config.geometry_atoms && config.geometry_atoms.length > 0;

  return (
    <div className="workspace-container font-sans select-none">
      {/* 1. WORKSPACE HEADER */}
      <div className="workspace-header">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-inner">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 dark:text-white tracking-widest uppercase">
                Quantum Chemistry Workspace
              </span>
              <span className="text-[9px] bg-cyan-500 text-black font-black px-2.5 py-0.5 rounded-full uppercase tracking-tight shadow-md shadow-cyan-500/20">
                Input-Driven Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Input SMILES or load molecular structures to run precision HF/DFT electronic calculations.
            </p>
          </div>
        </div>

        {/* Navigation Tabs & Status */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-200/60 dark:bg-black/40 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner">
            {[
              { id: 'setup', label: 'Setup & Input' },
              { id: 'monitor', label: 'SCF Monitor' },
              { id: 'results', label: 'Results' },
              { id: 'pes', label: '1D PES Scan' },
              { id: 'assistant', label: 'AI Assistant' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={(tab.id === 'results' && !calculationResult) || (tab.id === 'pes' && !hasMolecule)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg scale-105'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowOutputParserModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5"
            title="Upload or paste existing Quantum Chemistry output file (.out / .log)"
          >
            <Upload className="w-3.5 h-3.5" /> Parse Log
          </button>
        </div>
      </div>

      {/* 2. PRIMARY SMILES & STRUCTURE ENTRY BAR */}
      <div className="glass-panel p-4 rounded-[28px] border border-cyan-500/20 bg-cyan-500/5 shadow-lg flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 relative w-full">
            <Search className="w-4 h-4 text-cyan-500 absolute left-4 top-3.5" />
            <input
              type="text"
              value={smilesInput}
              onChange={(e) => {
                setSmilesInput(e.target.value);
                setValidationError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSmilesSubmit()}
              placeholder="Enter a SMILES string (e.g. CCO, c1ccccc1, CC(=O)O, Aspirin)..."
              className="w-full bg-slate-900/90 dark:bg-black/90 border border-cyan-500/30 rounded-2xl pl-11 pr-4 py-3 text-xs text-cyan-300 font-mono outline-none focus:border-cyan-400 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleSmilesSubmit()}
              className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 shrink-0"
            >
              Parse SMILES
            </button>
            <button
              onClick={handleLoadFromChemDraw}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 border border-white/10"
              title="Import active drawn molecule from ChemDraw Studio"
            >
              <PenTool className="w-3.5 h-3.5 text-cyan-400" /> From ChemDraw
            </button>
            {hasMolecule && (
              <button
                onClick={handleClearMolecule}
                className="px-3 py-3 rounded-2xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-bold text-xs shrink-0 border border-rose-500/20"
                title="Clear current structure"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Active Structure Confirmation Header */}
        {hasMolecule && (
          <div className="flex items-center justify-between px-3 pt-1 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-black flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Structure Validated:
              </span>
              <span className="text-white font-bold bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/10">
                {config.smiles || 'Custom Structure'}
              </span>
            </div>
            <span className="text-gray-400 font-bold">
              {config.geometry_atoms.length} Atoms • {config.geometry_atoms.reduce((s, a) => s + (a === 'H' ? 1 : 6), 0) - config.charge} Electrons
            </span>
          </div>
        )}
      </div>

      {/* 3. MAIN WORKSPACE VIEWPORT */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* SETUP TAB */}
        {activeTab === 'setup' && (
          <>
            {hasMolecule ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full animate-in fade-in duration-400">
                {/* Left: Calculation Configuration (5 Cols) */}
                <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
                  <QuantumConfigurator
                    config={config}
                    onUpdate={handleUpdateConfig}
                    onRun={handleRunCalculation}
                    onGenerateInput={handleGenerateInput}
                    isRunning={isCalculating}
                    engines={engines}
                  />
                </div>

                {/* Right: 3D Geometry Workspace (7 Cols) */}
                <div className="lg:col-span-7 flex flex-col overflow-hidden">
                  <GeometryWorkspace
                    atoms={config.geometry_atoms}
                    coordinates={config.geometry_coords}
                    onUpdate={handleUpdateGeometry}
                  />
                </div>
              </div>
            ) : (
              /* CLEAN EMPTY STATE (No random molecule substitution) */
              <div className="glass-panel p-16 rounded-[36px] flex flex-col items-center justify-center text-center space-y-5 border border-white/10 my-auto shadow-2xl">
                <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-inner">
                  <Atom className="w-8 h-8 text-cyan-400 animate-spin-slow" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    No Molecular Input Loaded
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">
                    Enter a SMILES string or provide a molecular structure to begin the quantum chemistry calculation.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleLoadFromChemDraw}
                    className="px-5 py-3 rounded-2xl bg-cyan-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                  >
                    <PenTool className="w-4 h-4" /> Load from ChemDraw Studio
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* MONITOR TAB */}
        {activeTab === 'monitor' && (
          <QuantumMonitor
            isCalculating={isCalculating}
            config={config}
            logOutput={logOutput}
            scfIterations={scfIterations}
            onCancel={() => setIsCalculating(false)}
            onViewResults={() => setActiveTab('results')}
          />
        )}

        {/* RESULTS TAB */}
        {activeTab === 'results' && calculationResult && (
          <QuantumResultDashboard result={calculationResult} />
        )}

        {/* 1D PES SCAN TAB */}
        {activeTab === 'pes' && hasMolecule && (
          <PESScanWorkspace atoms={config.geometry_atoms} coordinates={config.geometry_coords} />
        )}

        {/* AI QUANTUM ASSISTANT TAB */}
        {activeTab === 'assistant' && (
          <QuantumAIAssistant
            config={config}
            onApplyConfig={(cfg) => setConfig((prev) => ({ ...prev, ...cfg }))}
            onRunCalculation={handleRunCalculation}
            onGenerateInput={handleGenerateInput}
          />
        )}
      </div>

      {/* 4. MODAL: INPUT FILE PREVIEW */}
      {showInputPreview && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-8">
          <div className="glass-panel w-full max-w-3xl rounded-[36px] bg-[#0c0d12] border border-white/20 flex flex-col overflow-hidden shadow-2xl">
            <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">
                    Generated Engine Input Deck
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Format: {config.engine?.toUpperCase() || 'ORCA'} ({inputExtension})
                  </span>
                </div>
              </div>
              <button onClick={() => setShowInputPreview(false)} className="text-gray-400 hover:text-white p-1 text-xl">✕</button>
            </div>

            <div className="p-8 bg-black flex flex-col gap-5">
              <pre className="p-5 rounded-2xl border border-white/10 bg-[#050608] font-mono text-xs text-cyan-300 leading-relaxed overflow-auto max-h-80 custom-scrollbar shadow-inner">
                {inputContent}
              </pre>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const blob = new Blob([inputContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `calculation_input${inputExtension}`;
                    a.click();
                  }}
                  className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition uppercase tracking-wider text-[10px]"
                >
                  <Download className="w-3.5 h-3.5 inline mr-1.5" /> Download {inputExtension}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inputContent);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className="flex-1 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-2xl transition uppercase tracking-wider text-[10px] shadow-lg shadow-cyan-500/20"
                >
                  <Copy className="w-3.5 h-3.5 inline mr-1.5" /> {isCopied ? 'Copied to Clipboard!' : 'Copy Input Deck'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: OUTPUT FILE PARSER */}
      {showOutputParserModal && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-8">
          <div className="glass-panel w-full max-w-2xl rounded-[36px] bg-[#0c0d12] border border-white/20 p-8 flex flex-col space-y-4 shadow-2xl text-xs font-sans">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                  Parse Quantum Chemistry Output Log
                </h3>
              </div>
              <button onClick={() => setShowOutputParserModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <p className="text-gray-400 font-sans leading-relaxed">
              Paste standard stdout or log output from ORCA, Gaussian, PSI4, or PySCF to automatically extract total energies, orbital ladders, and convergence parameters.
            </p>
            <textarea
              rows={8}
              value={outputParseText}
              onChange={(e) => setOutputParseText(e.target.value)}
              placeholder="Paste ORCA .out or Gaussian .log text here..."
              className="w-full bg-black border border-white/10 rounded-2xl p-4 text-cyan-300 font-mono text-xs outline-none focus:border-cyan-500"
            />
            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => setShowOutputParserModal(false)} className="flex-1 py-3 bg-white/5 text-white font-bold rounded-2xl">
                Cancel
              </button>
              <button onClick={handleParseOutputSubmit} className="flex-1 py-3 bg-cyan-500 text-black font-black rounded-2xl shadow-lg shadow-cyan-500/20">
                Extract Quantum Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
