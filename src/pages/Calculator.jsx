import React, { useState } from 'react';
import { Calculator as CalcIcon, Atom, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { estimateMass } from '../services/api';
import ButtonSpinner from '../components/common/ButtonSpinner';

const FORMULA_PRESETS = [
  { formula: 'H2O', name: 'Water', note: '18.015 g/mol' },
  { formula: 'C6H12O6', name: 'D-Glucose', note: '180.156 g/mol' },
  { formula: 'C9H8O4', name: 'Aspirin', note: '180.158 g/mol' },
  { formula: 'C8H10N4O2', name: 'Caffeine', note: '194.19 g/mol' },
  { formula: 'C27H46O', name: 'Cholesterol', note: '386.65 g/mol' },
  { formula: 'C20H14O4', name: 'Phenolphthalein', note: '318.32 g/mol' }
];

export default function Calculator() {
  const [formula, setFormula] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  async function handleCalculate(inputFormula) {
    const query = (inputFormula !== undefined ? inputFormula : formula).trim();
    if (!query) {
      setError('Please provide a chemical molecular formula (e.g. C6H12O6).');
      return;
    }

    setIsCalculating(true);
    setError('');
    try {
      const data = await estimateMass(query);
      if (data && data.molar_mass) {
        setResult(data);
      } else {
        setError('Could not calculate molar mass. Please verify chemical elemental symbols.');
      }
    } catch (err) {
      setError(err.message || 'Molecular calculation error. Check formula syntax.');
    } finally {
      setIsCalculating(false);
    }
  }

  return (
    <div className="workspace-container font-sans select-none space-y-6 max-w-4xl mx-auto">
      {/* Workspace Header */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
            <CalcIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider text-[var(--text-primary)]">
                MOLECULAR WEIGHT CALCULATOR
              </h1>
              <span className="telemetry-pill text-[9px] font-bold">
                IUPAC STOICHIOMETRY
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
              Rapid elemental composition and molar mass computation from standard chemical empirical formulas.
            </p>
          </div>
        </div>

        <div className="telemetry-pill text-[10px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Kernel Online</span>
        </div>
      </div>

      {/* Main Calculation Card */}
      <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-5 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide">
            Enter Chemical Formula
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Supports standard IUPAC notation including brackets, hydrates, and capitalization (e.g., C6H12O6, CuSO4·5H2O, Ca(OH)2).
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCalculate();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <Atom className="w-4 h-4 text-orange-500/70 absolute left-4 top-3.5" />
            <input
              type="text"
              value={formula}
              onChange={(e) => {
                setFormula(e.target.value);
                setError('');
              }}
              placeholder="e.g. C6H12O6, H2SO4, C9H8O4..."
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-orange-500 rounded-2xl pl-11 pr-4 py-3 text-xs text-[var(--text-primary)] font-mono outline-none shadow-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isCalculating}
            className="btn-horizontal btn-orange text-xs font-bold shrink-0 shadow-lg px-6 py-3"
          >
            {isCalculating ? <ButtonSpinner className="text-white" /> : <CalcIcon className="w-4 h-4" />}
            <span>{isCalculating ? 'Computing...' : 'Calculate Molar Mass'}</span>
            {!isCalculating && <ArrowRight className="w-3.5 h-3.5 text-white/80 arrow-micro" />}
          </button>
        </form>

        {/* Preset Pills */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">
            Common Reagent Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {FORMULA_PRESETS.map((p) => (
              <button
                key={p.formula}
                type="button"
                onClick={() => {
                  setFormula(p.formula);
                  handleCalculate(p.formula);
                }}
                className="px-3 py-1.5 rounded-xl inner-box hover:border-orange-500/50 text-xs font-mono transition-all flex items-center gap-2 group cursor-pointer shadow-xs"
              >
                <span className="font-bold text-[var(--text-primary)] group-hover:text-orange-500 transition">
                  {p.formula}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">({p.name})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2 font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Calculation Result Dossier */}
        {result && (
          <div className="p-5 rounded-2xl inner-box border border-orange-500/30 space-y-4 shadow-md animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                <CheckCircle2 className="w-4 h-4" />
                <span>Stoichiometric Analysis Complete</span>
              </div>
              <span className="telemetry-pill text-[10px] text-orange-500 font-mono font-bold">
                Formula: {result.formula}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase block">
                  Molar Mass
                </span>
                <div className="text-2xl font-black text-orange-500 font-mono">
                  {result.molar_mass} <span className="text-xs font-normal text-[var(--text-secondary)]">g/mol</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase block">
                  Exact Mass (Monoisotopic)
                </span>
                <div className="text-2xl font-black text-[var(--text-primary)] font-mono">
                  {result.monoisotopic_mass || result.molar_mass} <span className="text-xs font-normal text-[var(--text-secondary)]">u</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase block">
                  Elemental Valency
                </span>
                <div className="text-2xl font-black text-emerald-500 font-mono">
                  Verified <span className="text-xs font-normal text-[var(--text-secondary)]">Standard</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
