import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Layers,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Download,
  Info
} from 'lucide-react';
import { calculateColumnRecovery } from '../../services/chromatographyCalculations';

export default function ColumnFractionTracker({
  massLoadedMg = 500,
  columnDiameterMm = 25,
  columnLengthCm = 30,
  stationaryPhase = 'Silica Gel 60 (40-63 µm)',
  fractions = [],
  onFractionsChange,
  isDark = true
}) {
  const recoveryResult = useMemo(() => {
    return calculateColumnRecovery(massLoadedMg, fractions);
  }, [massLoadedMg, fractions]);

  const handleAddFraction = () => {
    const num = fractions.length + 1;
    const colors = ['#f59e0b', '#06b6d4', '#8b5cf6', '#10b981', '#ec4899', '#64748b'];
    const newFraction = {
      fractionNumber: num,
      volumeMl: 15,
      massMg: num === 1 ? 0 : num === 2 ? 140 : num === 3 ? 280 : 35,
      purity: num === 3 ? 99 : 92,
      rfValue: Number((0.2 + num * 0.15).toFixed(2)),
      color: colors[(num - 1) % colors.length],
      notes: num === 3 ? 'Target Product (Pure)' : 'Impurity / Pre-fraction'
    };
    if (onFractionsChange) onFractionsChange([...fractions, newFraction]);
  };

  const handleRemoveFraction = (index) => {
    if (onFractionsChange) {
      onFractionsChange(fractions.filter((_, i) => i !== index));
    }
  };

  const handleUpdateField = (index, field, value) => {
    if (onFractionsChange) {
      const updated = fractions.map((f, i) => (i === index ? { ...f, [field]: value } : f));
      onFractionsChange(updated);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP CONTROLS & RECOVERY SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-panel p-3.5 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase">Mass Loaded</div>
            <div className="text-sm font-black text-[var(--text-primary)] font-mono">{massLoadedMg} mg</div>
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase">Total Recovered</div>
            <div className="text-sm font-black text-emerald-400 font-mono">
              {recoveryResult.totalRecoveredMg || 0} mg ({recoveryResult.recoveryPercentage || 0}%)
            </div>
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl border border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase">Fractions Collected</div>
            <div className="text-sm font-black text-[var(--text-primary)] font-mono">{fractions.length} Tubes</div>
          </div>
          <button
            onClick={handleAddFraction}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-xs font-bold font-mono transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Tube
          </button>
        </div>
      </div>

      {/* 2. VISUAL FRACTION TUBES RACK */}
      <div className="glass-panel p-4 rounded-3xl border border-[var(--border-subtle)] space-y-3 shadow-xl">
        <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
          Fraction Collection Test Tube Rack
        </span>

        <div className="flex items-end gap-3 overflow-x-auto pb-2 custom-scrollbar p-2 rounded-2xl bg-[#03060c] border border-white/5 min-h-[160px]">
          {fractions.length === 0 ? (
            <div className="w-full text-center py-6 text-xs text-slate-500 italic font-mono">
              No fractions collected yet. Click "+ Add Tube" to record eluted fractions.
            </div>
          ) : (
            fractions.map((f, idx) => {
              const liquidHeight = Math.min(100, Math.max(15, (parseFloat(f.volumeMl) || 15) * 4.5));
              const mass = parseFloat(f.massMg) || 0;

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-1.5 shrink-0 group relative cursor-pointer"
                  style={{ width: '48px' }}
                >
                  {/* Test tube graphic */}
                  <div className="w-8 h-28 rounded-b-full border-2 border-slate-400/50 relative overflow-hidden bg-white/5 flex flex-col justify-end p-0.5 shadow-md">
                    {/* Liquid fill */}
                    <div
                      className="w-full rounded-b-full transition-all duration-500 opacity-80"
                      style={{
                        height: `${liquidHeight}%`,
                        background: f.color || '#06b6d4',
                        boxShadow: `0 0 10px ${f.color || '#06b6d4'}88`
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400">#{f.fractionNumber || idx + 1}</span>
                  <span className="text-[9px] font-mono text-slate-300 font-bold">{mass} mg</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. FRACTIONS LOGGING TABLE */}
      {fractions.length > 0 && (
        <div className="glass-panel p-4 rounded-3xl border border-[var(--border-subtle)] space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-inherit pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
              Fraction Analysis &amp; Purity Table
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-inherit text-[var(--text-secondary)] text-[10px] uppercase">
                  <th className="py-2 px-2">Tube #</th>
                  <th className="py-2 px-2">Volume (mL)</th>
                  <th className="py-2 px-2">Mass (mg)</th>
                  <th className="py-2 px-2">TLC Rf</th>
                  <th className="py-2 px-2">Purity (%)</th>
                  <th className="py-2 px-2">Observations / Compound</th>
                  <th className="py-2 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                {fractions.map((f, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition">
                    <td className="py-2 px-2 text-cyan-400 font-bold">{f.fractionNumber || idx + 1}</td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={f.volumeMl}
                        onChange={(e) => handleUpdateField(idx, 'volumeMl', e.target.value)}
                        className="input-control px-2 py-1 text-xs rounded-lg w-16"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={f.massMg}
                        onChange={(e) => handleUpdateField(idx, 'massMg', e.target.value)}
                        className="input-control px-2 py-1 text-xs rounded-lg w-20 font-bold text-emerald-400"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        step="0.01"
                        value={f.rfValue}
                        onChange={(e) => handleUpdateField(idx, 'rfValue', e.target.value)}
                        className="input-control px-2 py-1 text-xs rounded-lg w-16"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={f.purity}
                        onChange={(e) => handleUpdateField(idx, 'purity', e.target.value)}
                        className="input-control px-2 py-1 text-xs rounded-lg w-16 text-cyan-300"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={f.notes}
                        onChange={(e) => handleUpdateField(idx, 'notes', e.target.value)}
                        className="input-control px-2 py-1 text-xs rounded-lg w-full min-w-[140px]"
                      />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <button
                        onClick={() => handleRemoveFraction(idx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
