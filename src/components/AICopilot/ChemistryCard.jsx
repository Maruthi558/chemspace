import React from 'react';
import { Microscope, Activity, Beaker, FlaskConical, ExternalLink, Atom } from 'lucide-react';

export default function ChemistryCard({ data, onAnalyze }) {
  if (!data) return null;

  const { smiles, formula, molWeight, logP, tpsa, lipinskiPassed, name } = data;

  return (
    <div className="my-3 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm overflow-hidden relative group transition-all hover:border-[var(--border-strong)]">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
          <Atom className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">{name || 'Chemical Entity'}</h4>
          <code className="text-[10px] font-mono text-[var(--text-muted)] truncate block max-w-[220px]">{smiles}</code>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Formula</p>
          <p className="text-xs font-mono font-bold text-[var(--text-primary)]">{formula}</p>
        </div>
        <div className="p-2 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Mol. Weight</p>
          <p className="text-xs font-mono font-bold text-[var(--text-primary)]">{molWeight} g/mol</p>
        </div>
        <div className="p-2 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">LogP</p>
          <p className="text-xs font-mono font-bold text-[var(--text-primary)]">{logP}</p>
        </div>
        <div className="p-2 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Lipinski Ro5</p>
          <p className={`text-xs font-bold font-mono ${lipinskiPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
            {lipinskiPassed ? 'COMPLIANT' : 'NON-COMPLIANT'}
          </p>
        </div>
      </div>

      <button
        onClick={() => onAnalyze(data)}
        className="w-full py-2 rounded-xl btn-secondary text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <Activity className="w-3.5 h-3.5 text-emerald-500" />
        <span>Analyze in RDKit Lab</span>
        <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
      </button>
    </div>
  );
}
