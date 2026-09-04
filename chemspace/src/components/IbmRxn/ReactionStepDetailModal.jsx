import React from 'react';
import {
  X,
  Workflow,
  Sparkles,
  Layers,
  Thermometer,
  ShieldAlert,
  FlaskConical,
  CheckCircle2,
  FileCode2,
  ArrowRight
} from 'lucide-react';

export default function ReactionStepDetailModal({ step, onClose }) {
  if (!step) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-2xl glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-5 shadow-2xl bg-[#080d1a] max-h-[90vh] overflow-y-auto custom-scrollbar font-mono text-xs text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-inherit pb-3">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-400 font-black text-xs border border-cyan-500/30">
              Step {step.stepNumber}
            </span>
            <h3 className="text-sm font-black text-[var(--text-primary)]">
              {step.reactionType}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Disconnection Rationale */}
        <div className="p-4 rounded-2xl inner-box space-y-1.5 border border-cyan-500/20">
          <span className="text-[10px] text-cyan-400 uppercase font-black">
            Strategic Disconnection Rationale
          </span>
          <p className="text-xs font-sans text-slate-200 leading-relaxed">
            {step.disconnection}
          </p>
        </div>

        {/* Precursors Table */}
        <div className="space-y-2">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-black">
            Reactant Precursors &amp; Building Blocks
          </span>
          <div className="space-y-2">
            {step.precursors?.map((p, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3"
              >
                <div>
                  <strong className="text-xs text-cyan-300">{p.name}</strong>
                  <div className="text-[10px] text-slate-400 font-mono">{p.smiles}</div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-slate-300 font-bold">
                  {p.role || 'Precursor'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reaction Conditions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl inner-box space-y-1">
            <span className="text-[9px] text-[var(--text-muted)] uppercase font-bold">Reagents / Catalyst</span>
            <div className="text-xs font-bold text-slate-200">{step.reagents}</div>
          </div>
          <div className="p-3 rounded-2xl inner-box space-y-1">
            <span className="text-[9px] text-[var(--text-muted)] uppercase font-bold">Solvents</span>
            <div className="text-xs font-bold text-slate-200">{step.solvents}</div>
          </div>
          <div className="p-3 rounded-2xl inner-box space-y-1">
            <span className="text-[9px] text-[var(--text-muted)] uppercase font-bold">Temperature &amp; Time</span>
            <div className="text-xs font-bold text-emerald-400">{step.temperature}</div>
          </div>
        </div>

        {/* Mechanistic Notes */}
        {step.mechanismNotes && (
          <div className="p-4 rounded-2xl inner-box space-y-1.5">
            <span className="text-[10px] text-violet-400 uppercase font-black">
              Mechanistic Pathway &amp; Transformation Notes
            </span>
            <p className="text-xs font-sans text-slate-300 leading-relaxed">
              {step.mechanismNotes}
            </p>
          </div>
        )}

        {/* Hazard & Safety Notes */}
        {step.hazardNotes && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Laboratory Hazard Warning</span>
            </div>
            <p className="text-xs font-sans leading-relaxed text-amber-200/90">
              {step.hazardNotes}
            </p>
          </div>
        )}

        {/* Action button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs font-mono shadow-md hover:bg-cyan-400 transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
