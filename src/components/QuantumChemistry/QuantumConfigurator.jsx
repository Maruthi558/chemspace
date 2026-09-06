import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Zap,
  Activity,
  ShieldCheck,
  HelpCircle,
  Cpu,
  FileText,
  AlertTriangle,
  Sparkles,
  Layers,
  CheckCircle2,
  Info
} from 'lucide-react';
import { quantumService } from '../../services/quantumService';

export default function QuantumConfigurator({
  config,
  onUpdate,
  onRun,
  onGenerateInput,
  isRunning,
  engines = { available_engines: ['pyscf', 'orca', 'psi4'] }
}) {
  const [costEstimate, setCostEstimate] = useState(null);
  const [spinWarning, setSpinWarning] = useState(null);

  // Compute total electrons and validate spin multiplicity
  useEffect(() => {
    const atoms = config.geometry_atoms || [];
    const zMap = { H: 1, He: 2, Li: 3, Be: 4, B: 5, C: 6, N: 7, O: 8, F: 9, P: 15, S: 16, Cl: 17, Br: 35, I: 53 };
    const totalZ = atoms.reduce((sum, a) => sum + (zMap[a] || 6), 0);
    const totalElectrons = totalZ - (config.charge || 0);

    const mult = config.multiplicity || 1;
    const isEvenElectrons = totalElectrons % 2 === 0;
    const isOddMult = mult % 2 === 1;

    // Physical Rule: Even number of electrons must have odd multiplicity (Singlet, Triplet...), Odd electrons must have even multiplicity (Doublet, Quartet...)
    if (isEvenElectrons && !isOddMult) {
      setSpinWarning(`Even electron count (${totalElectrons} e⁻) cannot have even multiplicity (${mult}). Standard ground state is Singlet (1).`);
    } else if (!isEvenElectrons && isOddMult) {
      setSpinWarning(`Odd electron count (${totalElectrons} e⁻) is a radical/open-shell and cannot have odd multiplicity (${mult}). Standard ground state is Doublet (2).`);
    } else {
      setSpinWarning(null);
    }
  }, [config.geometry_atoms, config.charge, config.multiplicity]);

  useEffect(() => {
    const fetchEstimate = async () => {
      if (config.geometry_atoms && config.geometry_atoms.length > 0) {
        const res = await quantumService.estimateCost(config);
        setCostEstimate(res);
      }
    };
    fetchEstimate();
  }, [config.method, config.basis_set, config.geometry_atoms, config.charge]);

  const update = (key, val) => onUpdate({ ...config, [key]: val });

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Theory & Engine Selection */}
      <div className="glass-panel p-6 rounded-[28px] space-y-5 border border-white/10 shadow-xl bg-slate-50/50 dark:bg-black/40 backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-500" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
              Calculation Parameters
            </h3>
          </div>
          <select
            value={config.engine || 'pyscf'}
            onChange={(e) => update('engine', e.target.value)}
            className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1 text-cyan-600 dark:text-cyan-400 outline-none"
          >
            <option value="pyscf">PySCF (Local Engine)</option>
            <option value="orca">ORCA 5.0</option>
            <option value="psi4">PSI4 Engine</option>
            <option value="gaussian">Gaussian 16</option>
            <option value="qchem">Q-Chem</option>
          </select>
        </div>

        {/* Calculation Job Type */}
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Workflow Job Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'single_point', label: 'Single Point (SP)' },
              { id: 'geometry_optimization', label: 'Geometry Opt' },
              { id: 'frequency', label: 'Opt + Freq' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => update('calc_type', t.id)}
                className={`py-2 px-3 rounded-2xl text-[10px] font-bold uppercase transition ${
                  config.calc_type === t.id
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-black'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Method & Basis Set Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Theory Level
            </label>
            <select
              value={config.method}
              onChange={(e) => update('method', e.target.value)}
              className="input-control font-bold text-xs"
            >
              <option value="DFT">Density Functional Theory (DFT)</option>
              <option value="HF">Hartree-Fock (SCF)</option>
              <option value="MP2">Møller-Plesset (MP2)</option>
              <option value="CCSD">Coupled Cluster (CCSD)</option>
            </select>
            <p className="mt-1.5 text-[9px] text-slate-500 leading-relaxed italic">
              {quantumService.getMethodDescription(config.method)}
            </p>
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Basis Set
            </label>
            <select
              value={config.basis_set}
              onChange={(e) => update('basis_set', e.target.value)}
              className="input-control font-bold text-xs"
            >
              <option value="6-31G(d)">6-31G(d) (Standard Polarized)</option>
              <option value="6-31+G(d,p)">6-31+G(d,p) (Diffuse + Pol)</option>
              <option value="def2-SVP">def2-SVP (Ahlrichs Split-Valence)</option>
              <option value="def2-TZVP">def2-TZVP (Triple-Zeta Valence)</option>
              <option value="cc-pVDZ">cc-pVDZ (Dunning Correlation)</option>
              <option value="STO-3G">STO-3G (Minimal Basis)</option>
            </select>
            <p className="mt-1.5 text-[9px] text-emerald-500 font-bold uppercase tracking-tight">
              AI Rec: {quantumService.getBasisRecommendation(config.geometry_atoms, config.charge)}
            </p>
          </div>
        </div>

        {/* Functional Selector (When DFT is selected) */}
        {config.method === 'DFT' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Exchange-Correlation Functional
              </label>
              <span className="text-[8px] font-mono text-cyan-500 font-bold">
                {config.functional || 'B3LYP'}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {['B3LYP', 'PBE', 'PBE0', 'M06-2X', 'wB97X-D'].map((f) => (
                <button
                  key={f}
                  onClick={() => update('functional', f)}
                  className={`py-1.5 px-2 rounded-xl text-[9px] font-black border transition ${
                    config.functional === f
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-md'
                      : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:border-cyan-500/40'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[9px] text-slate-500 leading-relaxed italic">
              {quantumService.getFunctionalDescription(config.functional || 'B3LYP')}
            </p>
          </div>
        )}

        {/* Charge & Multiplicity Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
              Molecular Charge (q)
            </label>
            <input
              type="number"
              value={config.charge}
              onChange={(e) => update('charge', parseInt(e.target.value) || 0)}
              className="input-control text-xs font-mono font-bold"
            />
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
              Spin Multiplicity (2S+1)
            </label>
            <select
              value={config.multiplicity}
              onChange={(e) => update('multiplicity', parseInt(e.target.value) || 1)}
              className="input-control text-xs font-mono font-bold"
            >
              <option value="1">1 (Singlet, Closed-shell)</option>
              <option value="2">2 (Doublet, 1 Unpaired e⁻)</option>
              <option value="3">3 (Triplet, 2 Unpaired e⁻)</option>
              <option value="4">4 (Quartet, 3 Unpaired e⁻)</option>
            </select>
          </div>
        </div>

        {/* Physical Spin Inconsistency Warning */}
        {spinWarning && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{spinWarning}</span>
          </div>
        )}
      </div>

      {/* 2. Computational Cost Auditor */}
      {costEstimate && (
        <div className="glass-panel p-4 rounded-[24px] border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[9px] uppercase tracking-widest">
              <Activity className="w-3.5 h-3.5" />
              Computational Complexity Audit
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                costEstimate.difficulty === 'High'
                  ? 'bg-rose-500 text-white'
                  : costEstimate.difficulty === 'Medium'
                  ? 'bg-amber-500 text-black'
                  : 'bg-emerald-500 text-black'
              }`}
            >
              {costEstimate.difficulty} Difficulty
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[8px] text-gray-500 uppercase block">Basis Functions</span>
              <span className="text-xs font-bold text-white font-mono">{costEstimate.basis_functions}</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[8px] text-gray-500 uppercase block">Memory Req.</span>
              <span className="text-xs font-bold text-white font-mono">{costEstimate.memory_gb} GB</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[8px] text-gray-500 uppercase block">Est. Runtime</span>
              <span className="text-xs font-bold text-white font-mono">{costEstimate.estimated_time_seconds}s</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          onClick={onGenerateInput}
          className="btn-secondary py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Generate Input File
        </button>
        <button
          onClick={onRun}
          disabled={isRunning}
          className="btn-primary py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          {isRunning ? <Activity className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {isRunning ? 'Solving Hamiltonian...' : 'Submit to Compute Engine'}
        </button>
      </div>
    </div>
  );
}
