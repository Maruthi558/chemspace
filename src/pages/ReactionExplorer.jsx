import React, { useState } from 'react';
import { Activity, ArrowRight, Save, ShieldAlert, Layers, Check, Atom, CheckCircle2 } from 'lucide-react';
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
    <div className="workspace-container font-sans select-none space-y-6 max-w-6xl mx-auto">
      {/* Workspace Header */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider text-[var(--text-primary)]">
                REACTION EXPLORER & TRANSFORMATION STUDIO
              </h1>
              <span className="telemetry-pill text-[9px] font-bold">
                KINETICS & MECHANISMS
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
              Build chemical reaction pathways, inspect 3D reactant & product structures, and review mechanism steps.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="btn-horizontal btn-orange text-xs font-bold shadow-lg px-5 py-2.5 flex items-center gap-2 cursor-pointer"
        >
          {saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Pathway Saved!' : 'Save Pathway'}</span>
        </button>
      </div>

      {/* Scientific Notice */}
      <div className="p-3.5 rounded-2xl inner-box border border-amber-500/30 text-xs text-amber-500 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <span>Reaction predictions and mechanistic pathways are computational representations for research & education. Always perform experimental synthesis with laboratory safety protocols.</span>
      </div>

      {/* Reaction Selectors */}
      <div className="glass-panel p-4 rounded-3xl border border-[var(--border-subtle)] flex items-center gap-3 shadow-lg">
        <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">Select Reaction Preset:</span>
        <div className="flex flex-wrap gap-2">
          {REACTION_PRESETS.map((r) => {
            const isSelected = r.id === selectedReaction.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedReaction(r)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-md font-bold'
                    : 'inner-box hover:border-orange-500/50 text-[var(--text-primary)]'
                }`}
              >
                {r.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Reaction Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
        {/* Reactant 3D Box */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-3xl border border-[var(--border-subtle)] space-y-3 shadow-xl">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-emerald-500 font-bold flex items-center gap-1.5">
              <Atom className="w-4 h-4" /> Reactant: {selectedReaction.reactants[0].name}
            </span>
            <span className="telemetry-pill text-[10px] text-[var(--text-primary)] font-bold">
              {selectedReaction.reactants[0].formula}
            </span>
          </div>
          <div className="h-[280px] w-full rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-canvas)] shadow-inner">
            <ThreeMoleculeViewer molecule={reactantMol} styleMode="ball-stick" />
          </div>
        </div>

        {/* Reaction Arrow Banner */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center p-3 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-md">
            <ArrowRight className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)] p-1.5 rounded-lg inner-box max-w-[120px] text-center">
            {selectedReaction.conditions}
          </span>
        </div>

        {/* Product 3D Box */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-3xl border border-[var(--border-subtle)] space-y-3 shadow-xl">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-orange-500 font-bold flex items-center gap-1.5">
              <Atom className="w-4 h-4" /> Product: {selectedReaction.products[0].name}
            </span>
            <span className="telemetry-pill text-[10px] text-[var(--text-primary)] font-bold">
              {selectedReaction.products[0].formula}
            </span>
          </div>
          <div className="h-[280px] w-full rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-canvas)] shadow-inner">
            <ThreeMoleculeViewer molecule={productMol} styleMode="ball-stick" />
          </div>
        </div>
      </div>

      {/* Mechanism & Details Card */}
      <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-3 text-xs shadow-xl">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-500" /> Mechanistic Overview &amp; Reaction Conditions
        </h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
          {selectedReaction.mechanism}
        </p>
      </div>
    </div>
  );
}
