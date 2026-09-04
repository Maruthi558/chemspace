import React, { useState } from 'react';
import {
  GitBranch,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  FlaskConical,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Award
} from 'lucide-react';

export default function RetrosynthesisTreeExplorer({
  retrosynthesisData,
  onSelectStepDetail
}) {
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  if (!retrosynthesisData || !retrosynthesisData.routes || retrosynthesisData.routes.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-3xl text-center space-y-2 border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)]">
        <GitBranch className="w-8 h-8 mx-auto text-cyan-400/40" />
        <p>No retrosynthetic pathways calculated yet. Enter a target SMILES and click "Plan Retrosynthesis".</p>
      </div>
    );
  }

  const routes = retrosynthesisData.routes;
  const currentRoute = routes[selectedRouteIndex] || routes[0];

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* 1. ROUTE SELECTOR TABS & METRICS */}
      <div className="glass-panel p-4 rounded-3xl border border-[var(--border-subtle)] space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-inherit pb-2">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black uppercase text-[var(--text-primary)]">
              Retrosynthetic Synthesis Route Explorer
            </span>
            <span className="telemetry-pill text-[9px] font-bold">
              {routes.length} {routes.length === 1 ? 'ROUTE GENERATED' : 'ROUTES GENERATED'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {routes.map((rt, idx) => (
              <button
                key={rt.routeId}
                onClick={() => setSelectedRouteIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedRouteIndex === idx
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                    : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>Route {idx + 1}</span>
                <span className="text-[9px] opacity-75">({rt.overallYield})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Route Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-2xl inner-box space-y-0.5">
            <span className="text-[9px] text-[var(--text-muted)] uppercase">Overall Yield</span>
            <div className="text-sm font-black text-emerald-400">{currentRoute.overallYield}</div>
          </div>
          <div className="p-3 rounded-2xl inner-box space-y-0.5">
            <span className="text-[9px] text-[var(--text-muted)] uppercase">Confidence Score</span>
            <div className="text-sm font-black text-cyan-400">{currentRoute.confidenceScore}</div>
          </div>
          <div className="p-3 rounded-2xl inner-box space-y-0.5">
            <span className="text-[9px] text-[var(--text-muted)] uppercase">Linear Steps</span>
            <div className="text-sm font-black text-violet-400">{currentRoute.steps?.length || 1} Step(s)</div>
          </div>
          <div className="p-3 rounded-2xl inner-box space-y-0.5">
            <span className="text-[9px] text-[var(--text-muted)] uppercase">Green Chemistry</span>
            <div className="text-sm font-black text-amber-400">{currentRoute.greenChemistryScore || 'A'}</div>
          </div>
        </div>
      </div>

      {/* 2. HIERARCHICAL REACTION TREE PATHWAY */}
      <div className="space-y-4">
        {/* Target Header Node */}
        <div className="glass-panel p-4 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/30 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] text-cyan-400 uppercase font-black tracking-wider">
                Target Synthesis Goal
              </span>
              <h3 className="text-sm font-black text-[var(--text-primary)]">
                {retrosynthesisData.targetName || 'Target Molecule'}
              </h3>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                SMILES: {retrosynthesisData.targetSmiles}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-bold text-cyan-300 font-mono">
              {retrosynthesisData.formula} • {retrosynthesisData.molWeight} g/mol
            </span>
          </div>
        </div>

        {/* Reaction Steps Cards */}
        {currentRoute.steps?.map((step, sIdx) => (
          <div
            key={sIdx}
            className="glass-panel p-5 rounded-3xl border border-[var(--border-subtle)] space-y-4 shadow-xl relative overflow-hidden"
          >
            {/* Step Header */}
            <div className="flex items-center justify-between border-b border-inherit pb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-violet-500/15 text-violet-400 font-black text-xs border border-violet-500/30">
                  Step {step.stepNumber}
                </span>
                <span className="font-bold text-xs text-[var(--text-primary)]">{step.reactionType}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-black text-xs">Step Yield: {step.stepYield}</span>
                {onSelectStepDetail && (
                  <button
                    onClick={() => onSelectStepDetail(step)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition"
                    title="View Step Mechanism Details"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Disconnection Rationale */}
            <div className="p-3 rounded-2xl inner-box space-y-1 text-xs">
              <span className="text-[9px] text-cyan-400 uppercase font-black">
                Strategic Disconnection:
              </span>
              <p className="text-[var(--text-primary)] font-sans">{step.disconnection}</p>
            </div>

            {/* Precursors Grid */}
            <div>
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-black block mb-2">
                Identified Precursors &amp; Synthons:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {step.precursors?.map((prec, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-3 rounded-2xl bg-black/20 border border-white/5 space-y-1 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-cyan-300 font-bold">{prec.name}</strong>
                      {prec.commercialAvailable && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20">
                          Commercial Available
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] truncate font-mono">
                      {prec.smiles}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reaction Conditions Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-[var(--text-secondary)]">
              <div className="truncate">
                <strong className="text-[var(--text-primary)]">Reagents: </strong>
                <span>{step.reagents}</span>
              </div>
              <div className="truncate">
                <strong className="text-[var(--text-primary)]">Solvent: </strong>
                <span>{step.solvents}</span>
              </div>
              <div className="truncate">
                <strong className="text-[var(--text-primary)]">Temp: </strong>
                <span>{step.temperature}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
