import React, { useState } from 'react';
import { Activity, ArrowRight, Plus, Sparkles, Save, ShieldAlert, Layers, Check, Database } from 'lucide-react';
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
      <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
            <Activity className="w-7 h-7 text-cyan-400" />
            Reaction Explorer & Transformation Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build chemical reaction pathways, inspect 3D reactant & product structures, and review mechanism steps.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-extrabold rounded-xl shadow-lg flex items-center gap-2 transition text-xs"
        >
          {saved ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Reaction Saved!' : 'Save Reaction'}</span>
        </button>
      </div>

      {/* Scientific Notice */}
      <div className="bg-amber-950/40 border border-amber-500/30 p-3.5 rounded-2xl text-xs text-amber-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <span>Reaction predictions and mechanistic pathways are computational representations for research & education. Always perform experimental synthesis with laboratory safety protocols.</span>
      </div>

      {/* Reaction Selectors */}
      <div className="flex items-center gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <span className="text-xs font-mono text-slate-400 shrink-0">Select Reaction Preset:</span>
        <div className="flex flex-wrap gap-2">
          {REACTION_PRESETS.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedReaction(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                r.id === selectedReaction.id ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
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
        <div className="lg:col-span-5 bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-cyan-400 font-bold">Reactant: {selectedReaction.reactants[0].name}</span>
            <span className="bg-slate-950 px-2 py-0.5 rounded text-slate-300">{selectedReaction.reactants[0].formula}</span>
          </div>
          <div className="h-[280px] w-full">
            <ThreeMoleculeViewer molecule={reactantMol} styleMode="ball-stick" />
          </div>
        </div>

        {/* Reaction Arrow Banner */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center p-3 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-xl">
            <ArrowRight className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">{selectedReaction.conditions}</span>
        </div>

        {/* Product 3D Box */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-violet-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-violet-400 font-bold">Product: {selectedReaction.products[0].name}</span>
            <span className="bg-slate-950 px-2 py-0.5 rounded text-slate-300">{selectedReaction.products[0].formula}</span>
          </div>
          <div className="h-[280px] w-full">
            <ThreeMoleculeViewer molecule={productMol} styleMode="ball-stick" />
          </div>
        </div>
      </div>

      {/* Mechanism & Details Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
        <h3 className="text-sm font-mono font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" /> Mechanistic Overview & Reaction Conditions
        </h3>
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-slate-300">
          <strong className="text-cyan-400 block mb-1">Reaction Conditions:</strong>
          {selectedReaction.conditions}
        </div>
        <p className="text-slate-300 leading-relaxed font-sans">{selectedReaction.mechanism}</p>
      </div>
    </div>
  );
}
