import React, { useState } from 'react';
import { Activity, ArrowRight, Plus, Save, ShieldAlert, Layers, Check, Database } from 'lucide-react';
import ThreeMoleculeViewer from '../components/ThreeMoleculeViewer';
import { MOLECULES } from '../data/moleculeData';

const REACTION_PRESETS = [
  {
    id: 'esterification',
    title: 'Fischer Esterification (Aspirin Synthesis)',
    category: 'Organic Reaction',
    reactants: [
      { name: 'Salicylic Acid', formula: 'C₇H₆O₃', molId: 'aspirin' },
      { name: 'Acetic Anhydride', formula: 'C₄H₆O₃', molId: 'ethanol' }
    ],
    products: [
      { name: 'Aspirin', formula: 'C₉H₈O₄', molId: 'aspirin' },
      { name: 'Acetic Acid', formula: 'C₂H₄O₂', molId: 'ethanol' }
    ],
    conditions: 'H₂SO₄ catalyst, 85°C, 30 min reflux',
    mechanism: 'Nucleophilic acyl substitution: Protonation of carbonyl oxygen increases electrophilicity, followed by alcohol attack, tetrahedral intermediate formation, and elimination of acetic acid.'
  },
  {
    id: 'combustion',
    title: 'Benzene Complete Oxidation Combustion',
    category: 'Thermochemistry',
    reactants: [
      { name: 'Benzene', formula: '2 C₆H₆', molId: 'benzene' },
      { name: 'Oxygen', formula: '15 O₂', molId: 'water' }
    ],
    products: [
      { name: 'Carbon Dioxide', formula: '12 CO₂', molId: 'water' },
      { name: 'Water', formula: '6 H₂O', molId: 'water' }
    ],
    conditions: 'High temperature ignition (Exothermic ΔH = -6542 kJ/mol)',
    mechanism: 'Radical chain combustion breakdown of aromatic hydrocarbon ring.'
  }
];

export default function ReactionExplorer() {
  const [selectedReaction, setSelectedReaction] = useState(REACTION_PRESETS[0]);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const reactantMol = MOLECULES.find(m => m.id === selectedReaction.reactants[0].molId) || MOLECULES[0];
  const productMol = MOLECULES.find(m => m.id === selectedReaction.products[0].molId) || MOLECULES[1];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-[#111319]/90 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="telemetry-pill">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              REACTION KINETICS & MECHANISMS
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Interactive Studio</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <Activity className="w-7 h-7 text-emerald-400" />
            Reaction Explorer & Transformation Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build chemical reaction pathways, inspect 3D reactant & product structures, and review mechanism steps.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2"
        >
          {saved ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Reaction Saved!' : 'Save Reaction'}</span>
        </button>
      </div>

      {/* Scientific Notice */}
      <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-2xl text-xs text-amber-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <span>Reaction predictions and mechanistic pathways are computational representations for research & education. Always perform experimental synthesis with laboratory safety protocols.</span>
      </div>

      {/* Reaction Selectors */}
      <div className="flex items-center gap-3 bg-[#111319]/90 p-4 rounded-2xl border border-white/10">
        <span className="text-xs font-mono text-slate-400 shrink-0">Select Reaction Preset:</span>
        <div className="flex flex-wrap gap-2">
          {REACTION_PRESETS.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedReaction(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                r.id === selectedReaction.id ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' : 'bg-[#181b24] text-slate-300 border border-white/10 hover:bg-[#202532]'
              }`}
            >
              {r.title}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Reaction Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
        {/* Reactant 3D Box */}
        <div className="lg:col-span-5 bg-[#111319]/90 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-emerald-400 font-bold">Reactant: {selectedReaction.reactants[0].name}</span>
            <span className="bg-[#090a0f] border border-white/10 px-2.5 py-0.5 rounded-lg text-slate-300">{selectedReaction.reactants[0].formula}</span>
          </div>
          <div className="h-[280px] w-full rounded-xl overflow-hidden border border-white/5 bg-[#090a0f]">
            <ThreeMoleculeViewer molecule={reactantMol} styleMode="ball-stick" />
          </div>
        </div>

        {/* Reaction Arrow Banner */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center p-3 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-xl">
            <ArrowRight className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-[#090a0f] px-2 py-1 rounded border border-white/10">{selectedReaction.conditions}</span>
        </div>

        {/* Product 3D Box */}
        <div className="lg:col-span-5 bg-[#111319]/90 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-violet-400 font-bold">Product: {selectedReaction.products[0].name}</span>
            <span className="bg-[#090a0f] border border-white/10 px-2.5 py-0.5 rounded-lg text-slate-300">{selectedReaction.products[0].formula}</span>
          </div>
          <div className="h-[280px] w-full rounded-xl overflow-hidden border border-white/5 bg-[#090a0f]">
            <ThreeMoleculeViewer molecule={productMol} styleMode="ball-stick" />
          </div>
        </div>
      </div>

      {/* Mechanism & Details Card */}
      <div className="bg-[#111319]/90 border border-white/10 rounded-2xl p-5 space-y-3 text-xs">
        <h3 className="text-sm font-mono font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" /> Mechanistic Overview & Reaction Conditions
        </h3>
        <div className="p-3 bg-[#090a0f] rounded-xl border border-white/10 font-mono text-slate-300">
          <strong className="text-emerald-400 block mb-1">Reaction Conditions:</strong>
          {selectedReaction.conditions}
        </div>
        <p className="text-slate-300 leading-relaxed font-sans">{selectedReaction.mechanism}</p>
      </div>
    </div>
  );
}
