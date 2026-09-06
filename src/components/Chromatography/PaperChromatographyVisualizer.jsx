import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  Sliders,
  CheckCircle2,
  FlaskConical,
  Play,
  RotateCcw
} from 'lucide-react';
import { calculateRf } from '../../services/chromatographyCalculations';

export default function PaperChromatographyVisualizer({
  solventFrontCm = 9.0,
  solutes = [],
  onSolutesChange,
  isDark = true
}) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(1); // 0 to 1

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setProgress(0);
    let curr = 0;
    const interval = setInterval(() => {
      curr += 0.04;
      if (curr >= 1) {
        setProgress(1);
        setIsSimulating(false);
        clearInterval(interval);
      } else {
        setProgress(curr);
      }
    }, 40);
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setProgress(1);
  };

  const handleAddSolute = () => {
    const defaultColors = ['#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#9333ea'];
    const count = solutes.length;
    const newSolute = {
      name: `Pigment / Dye ${count + 1}`,
      distanceCm: Number((2.0 + count * 1.4).toFixed(1)),
      color: defaultColors[count % defaultColors.length]
    };
    if (onSolutesChange) onSolutesChange([...solutes, newSolute]);
  };

  const handleRemoveSolute = (index) => {
    if (onSolutesChange) onSolutesChange(solutes.filter((_, i) => i !== index));
  };

  const handleUpdateDistance = (index, val) => {
    if (onSolutesChange) {
      const updated = solutes.map((s, i) => (i === index ? { ...s, distanceCm: parseFloat(val) || 0 } : s));
      onSolutesChange(updated);
    }
  };

  const stripWidth = 320;
  const stripHeight = 360;
  const baselineY = 300;
  const currentFront = solventFrontCm * progress;
  const currentFrontY = baselineY - (currentFront / 10) * 250;

  return (
    <div className="space-y-4">
      {/* 1. CONTROLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl inner-box border border-[var(--border-subtle)] bg-[var(--bg-inner)]">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold font-mono text-[var(--text-primary)]">
            Paper Chromatography Separation Strip
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-black font-mono transition flex items-center gap-1.5 shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'Developing...' : 'Run Development'}</span>
          </button>

          <button
            onClick={handleResetSimulation}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleAddSolute}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-xs font-bold font-mono transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Solute Spot</span>
          </button>
        </div>
      </div>

      {/* 2. PAPER STRIP VISUALIZER & RESULTS TABLE */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Paper Strip Graphic Box */}
        <div className="w-full md:w-[340px] shrink-0 p-4 rounded-3xl inner-box border border-[var(--border-subtle)] bg-[#03060c] flex flex-col items-center justify-center shadow-2xl">
          <svg
            viewBox={`0 0 ${stripWidth} ${stripHeight}`}
            className="w-full h-auto rounded-2xl shadow-inner border border-white/20"
            style={{ maxWidth: '280px', minHeight: '300px' }}
          >
            {/* Paper Texture Body */}
            <rect
              x="30"
              y="20"
              width={stripWidth - 60}
              height={stripHeight - 40}
              rx="8"
              fill="#faf7ee"
              stroke="#d4cfbe"
              strokeWidth="2"
            />

            {/* Wet Solvent Front Gradient */}
            <rect
              x="30"
              y={currentFrontY}
              width={stripWidth - 60}
              height={baselineY - currentFrontY}
              fill="rgba(186, 230, 253, 0.35)"
            />

            {/* Solvent Front Top Line */}
            <line
              x1="30"
              y1={currentFrontY}
              x2={stripWidth - 30}
              y2={currentFrontY}
              stroke="#0284c7"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <text
              x={stripWidth - 35}
              y={currentFrontY - 6}
              textAnchor="end"
              fill="#0369a1"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              Front ({currentFront.toFixed(1)} cm)
            </text>

            {/* Origin Baseline Line */}
            <line
              x1="30"
              y1={baselineY}
              x2={stripWidth - 30}
              y2={baselineY}
              stroke="#78716c"
              strokeWidth="1.5"
            />
            <text
              x="35"
              y={baselineY + 14}
              fill="#57534e"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              Origin (0.0 cm)
            </text>

            {/* Solute spots migrating */}
            {solutes.map((sol, idx) => {
              const numSol = solutes.length;
              const posX = 60 + ((stripWidth - 120) / (numSol + 1)) * (idx + 1);
              const targetD = Math.min(parseFloat(sol.distanceCm) || 0, solventFrontCm);
              const currentD = targetD * progress;
              const spotY = baselineY - (currentD / 10) * 250;
              const rfVal = solventFrontCm > 0 ? (targetD / solventFrontCm).toFixed(2) : '0';

              return (
                <g key={idx}>
                  {/* Origin start spot */}
                  <circle cx={posX} cy={baselineY} r="2" fill="#78716c" opacity={0.5} />

                  {/* Migrating spot */}
                  <ellipse
                    cx={posX}
                    cy={spotY}
                    rx={9}
                    ry={6}
                    fill={sol.color || '#dc2626'}
                    opacity={0.9}
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  <text
                    x={posX}
                    y={spotY - 9}
                    textAnchor="middle"
                    fill="#1c1917"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {sol.name.slice(0, 8)}
                  </text>
                  <text
                    x={posX}
                    y={baselineY + 24}
                    textAnchor="middle"
                    fill="#0284c7"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="black"
                  >
                    Rf {rfVal}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Measurements & Transparent Calculations Table */}
        <div className="flex-1 space-y-4">
          <div className="glass-panel p-4 rounded-3xl border border-[var(--border-subtle)] space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-inherit pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                Measured Solute Distances &amp; Rf Results
              </span>
              <span className="text-[10px] text-cyan-400 font-mono font-bold">
                Solvent Front: {solventFrontCm} cm
              </span>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
              {solutes.map((sol, idx) => {
                const rfRes = calculateRf(sol.distanceCm, solventFrontCm, 'cm');

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl inner-box border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full border border-white/30 shrink-0 shadow-sm"
                        style={{ background: sol.color || '#dc2626' }}
                      />
                      <div>
                        <strong className="text-xs text-[var(--text-primary)] font-mono">{sol.name}</strong>
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] font-mono">
                          <span>Distance:</span>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max={solventFrontCm}
                            value={sol.distanceCm}
                            onChange={(e) => handleUpdateDistance(idx, e.target.value)}
                            className="input-control px-2 py-0.5 text-xs rounded-md w-16 text-center font-bold text-cyan-300"
                          />
                          <span>cm</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {rfRes.success && (
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-black border border-emerald-500/30 font-mono">
                            Rf = {rfRes.rf}
                          </span>
                          <div className="text-[9px] text-[var(--text-muted)] font-mono mt-0.5">
                            {rfRes.steps.substitution}
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveSolute(idx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Solute"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
