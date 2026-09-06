import React from 'react';
import { Microscope, Activity, Beaker, FlaskConical, ExternalLink } from 'lucide-react';

export default function ChemistryCard({ data, onAnalyze }) {
  if (!data) return null;

  const { smiles, formula, molWeight, logP, tpsa, lipinskiPassed, name } = data;

  return (
    <div className="my-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden relative group transition-all hover:bg-white/10">
      <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
        <FlaskConical className="w-12 h-12 text-cyan-400" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
          <Microscope className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">{name || 'Chemical Entity'}</h4>
          <code className="text-[10px] text-cyan-400/80 truncate block max-w-[200px]">{smiles}</code>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="inner-box p-2 rounded-xl">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Formula</p>
          <p className="text-xs font-mono font-bold text-white">{formula}</p>
        </div>
        <div className="inner-box p-2 rounded-xl">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Mol. Weight</p>
          <p className="text-xs font-mono font-bold text-white">{molWeight} g/mol</p>
        </div>
        <div className="inner-box p-2 rounded-xl">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">LogP</p>
          <p className="text-xs font-mono font-bold text-white">{logP}</p>
        </div>
        <div className="inner-box p-2 rounded-xl">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Lipinski</p>
          <p className={`text-xs font-bold ${lipinskiPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
            {lipinskiPassed ? 'PASSED' : 'FAILED'}
          </p>
        </div>
      </div>

      <button
        onClick={() => onAnalyze(data)}
        className="w-full py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold transition flex items-center justify-center gap-2"
      >
        <Activity className="w-3.5 h-3.5" />
        Deep Analysis
        <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  );
}
