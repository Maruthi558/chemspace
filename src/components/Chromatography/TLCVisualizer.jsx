import React, { useState, useMemo } from 'react';
import {
  Sun,
  Eye,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Info
} from 'lucide-react';
import { calculateRf } from '../../services/chromatographyCalculations';

export default function TLCVisualizer({
  plateHeightCm = 10,
  solventFrontCm = 8.5,
  lanes = [],
  onLanesChange,
  isDark = true
}) {
  const [visMode, setVisMode] = useState('uv254'); // 'uv254' | 'uv365' | 'visible' | 'iodine'
  const [selectedLaneIndex, setSelectedLaneIndex] = useState(null);

  // Background plate styling based on visualization mode
  const plateBgStyle = useMemo(() => {
    switch (visMode) {
      case 'uv254':
        return {
          background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
          spotColor: 'rgba(5, 20, 15, 0.92)',
          textColor: '#ffffff',
          label: 'UV 254 nm (Fluorescence Quenching F254)'
        };
      case 'uv365':
        return {
          background: 'linear-gradient(180deg, #090d16 0%, #030712 100%)',
          spotColor: '#38bdf8',
          textColor: '#38bdf8',
          label: 'UV 365 nm (Fluorescence Emission)'
        };
      case 'iodine':
        return {
          background: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)',
          spotColor: '#78350f',
          textColor: '#451a03',
          label: 'Iodine Vapor Stain (Organic Complexation)'
        };
      case 'visible':
      default:
        return {
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
          spotColor: '#334155',
          textColor: '#0f172a',
          label: 'White Visible Light'
        };
    }
  }, [visMode]);

  const handleAddLane = () => {
    const laneLabels = ['Reactant (R)', 'Co-Spot (R+P)', 'Product (P)', 'Standard (Std)'];
    const label = lanes.length < laneLabels.length ? laneLabels[lanes.length] : `Lane ${lanes.length + 1}`;
    const newLane = {
      name: label,
      spots: [
        { name: 'Component 1', distanceCm: 3.5, color: '#0284c7' }
      ]
    };
    if (onLanesChange) onLanesChange([...lanes, newLane]);
  };

  const handleAddSpotToLane = (laneIndex) => {
    if (onLanesChange) {
      const updated = lanes.map((lane, i) => {
        if (i === laneIndex) {
          const currentCount = lane.spots ? lane.spots.length : 0;
          return {
            ...lane,
            spots: [
              ...(lane.spots || []),
              {
                name: `Spot ${currentCount + 1}`,
                distanceCm: Number((2.0 + currentCount * 1.5).toFixed(1)),
                color: currentCount % 2 === 0 ? '#ea580c' : '#7c3aed'
              }
            ]
          };
        }
        return lane;
      });
      onLanesChange(updated);
    }
  };

  const handleUpdateSpotDistance = (laneIndex, spotIndex, val) => {
    if (onLanesChange) {
      const updated = lanes.map((lane, i) => {
        if (i === laneIndex) {
          const updatedSpots = lane.spots.map((sp, j) => {
            if (j === spotIndex) {
              return { ...sp, distanceCm: parseFloat(val) || 0 };
            }
            return sp;
          });
          return { ...lane, spots: updatedSpots };
        }
        return lane;
      });
      onLanesChange(updated);
    }
  };

  const handleRemoveLane = (index) => {
    if (onLanesChange) {
      onLanesChange(lanes.filter((_, i) => i !== index));
    }
  };

  const handleRemoveSpot = (laneIndex, spotIndex) => {
    if (onLanesChange) {
      const updated = lanes.map((lane, i) => {
        if (i === laneIndex) {
          return {
            ...lane,
            spots: lane.spots.filter((_, j) => j !== spotIndex)
          };
        }
        return lane;
      });
      onLanesChange(updated);
    }
  };

  // Plate SVG geometry
  const plateWidth = 460;
  const plateHeight = 360;
  const originYOffset = 300; // Baseline from top
  const solventFrontY = originYOffset - (solventFrontCm / plateHeightCm) * 260;

  return (
    <div className="space-y-4">
      {/* 1. VISUALIZATION MODE SWITCHER & CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl inner-box border border-[var(--border-subtle)] bg-[var(--bg-inner)]">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {[
            { id: 'uv254', label: 'UV 254 nm', desc: 'F254 Quenching' },
            { id: 'uv365', label: 'UV 365 nm', desc: 'Fluorescence' },
            { id: 'iodine', label: 'Iodine Stain', desc: 'I₂ Vapor' },
            { id: 'visible', label: 'Visible Light', desc: 'White Light' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setVisMode(mode.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition whitespace-nowrap ${
                visMode === mode.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleAddLane}
          className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-xs font-bold font-mono transition flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add TLC Lane</span>
        </button>
      </div>

      {/* 2. 2D TLC PLATE SIMULATION VIEWPORT */}
      <div className="flex flex-col md:flex-row gap-5">
        {/* TLC Plate Canvas Box */}
        <div className="w-full md:w-[480px] shrink-0 p-4 rounded-3xl inner-box border border-[var(--border-subtle)] bg-[#03060c] flex flex-col items-center justify-center shadow-2xl">
          <div className="text-[10px] font-mono text-cyan-400 font-bold mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Mode: {plateBgStyle.label}</span>
          </div>

          <svg
            viewBox={`0 0 ${plateWidth} ${plateHeight}`}
            className="w-full h-auto rounded-2xl shadow-inner border border-white/20"
            style={{ maxWidth: '420px', minHeight: '320px' }}
          >
            {/* TLC Plate Base */}
            <rect
              x="20"
              y="20"
              width={plateWidth - 40}
              height={plateHeight - 40}
              rx="12"
              fill={plateBgStyle.background.includes('gradient') ? '#10b981' : plateBgStyle.background}
              style={{
                fill: visMode === 'uv254' ? '#10b981' : visMode === 'uv365' ? '#090d16' : visMode === 'iodine' ? '#fde68a' : '#f1f5f9'
              }}
            />

            {/* Solvent Front Line (Top) */}
            <line
              x1="30"
              y1={solventFrontY}
              x2={plateWidth - 30}
              y2={solventFrontY}
              stroke={visMode === 'uv365' ? '#38bdf8' : '#047857'}
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <text
              x={plateWidth - 35}
              y={solventFrontY - 6}
              textAnchor="end"
              fill={visMode === 'uv365' ? '#38bdf8' : '#064e3b'}
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              Solvent Front ({solventFrontCm} cm)
            </text>

            {/* Origin Baseline (Bottom) */}
            <line
              x1="30"
              y1={originYOffset}
              x2={plateWidth - 30}
              y2={originYOffset}
              stroke={visMode === 'uv365' ? '#64748b' : '#064e3b'}
              strokeWidth="1.5"
            />
            <text
              x={35}
              y={originYOffset + 14}
              fill={visMode === 'uv365' ? '#94a3b8' : '#064e3b'}
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              Origin (0.0 cm)
            </text>

            {/* Lanes and Spots Rendering */}
            {lanes.map((lane, laneIdx) => {
              const numLanes = lanes.length;
              const laneX = 50 + ((plateWidth - 100) / (numLanes + 1)) * (laneIdx + 1);

              return (
                <g key={laneIdx}>
                  {/* Origin spot marker dot */}
                  <circle
                    cx={laneX}
                    cy={originYOffset}
                    r="2.5"
                    fill={visMode === 'uv365' ? '#64748b' : '#064e3b'}
                  />
                  {/* Lane Label */}
                  <text
                    x={laneX}
                    y={originYOffset + 18}
                    textAnchor="middle"
                    fill={visMode === 'uv365' ? '#38bdf8' : '#0f172a'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {lane.name.slice(0, 10)}
                  </text>

                  {/* Migrated Chromatographic Spots */}
                  {lane.spots?.map((spot, spotIdx) => {
                    const d = Math.min(parseFloat(spot.distanceCm) || 0, solventFrontCm);
                    const spotY = originYOffset - (d / plateHeightCm) * 260;
                    const rfVal = solventFrontCm > 0 ? (d / solventFrontCm).toFixed(2) : '0';

                    let fill = plateBgStyle.spotColor;
                    if (visMode === 'visible') fill = spot.color || '#334155';
                    if (visMode === 'uv365') fill = spotIdx % 2 === 0 ? '#38bdf8' : '#facc15';

                    return (
                      <g key={spotIdx} className="cursor-pointer group">
                        {/* Spot ellipse */}
                        <ellipse
                          cx={laneX}
                          cy={spotY}
                          rx={10}
                          ry={7}
                          fill={fill}
                          opacity={0.88}
                          stroke="#ffffff"
                          strokeWidth={visMode === 'uv365' ? 1.5 : 0.5}
                        />
                        {/* Rf floating pill text */}
                        <text
                          x={laneX + 14}
                          y={spotY + 3}
                          fill={visMode === 'uv365' ? '#ffffff' : '#000000'}
                          fontSize="8"
                          fontFamily="monospace"
                          fontWeight="black"
                        >
                          Rf {rfVal}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Lane Spot Configuration & Rf Calculations Table */}
        <div className="flex-1 space-y-4">
          <div className="glass-panel p-4 rounded-3xl border border-[var(--border-subtle)] space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-inherit pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                TLC Lanes &amp; Solute Rf Measurements
              </span>
              <span className="text-[10px] text-cyan-400 font-mono font-bold">
                Solvent Front: {solventFrontCm} cm
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
              {lanes.map((lane, lIdx) => (
                <div
                  key={lIdx}
                  className="p-3.5 rounded-2xl inner-box border border-[var(--border-subtle)] space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-mono font-black flex items-center justify-center border border-cyan-500/30">
                        {lIdx + 1}
                      </span>
                      <strong className="text-xs text-[var(--text-primary)] font-mono">{lane.name}</strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAddSpotToLane(lIdx)}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 text-[10px] font-mono font-bold transition flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Spot
                      </button>
                      <button
                        onClick={() => handleRemoveLane(lIdx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Lane"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Spots in this lane */}
                  <div className="space-y-1.5">
                    {lane.spots?.map((spot, sIdx) => {
                      const rfRes = calculateRf(spot.distanceCm, solventFrontCm, 'cm');

                      return (
                        <div
                          key={sIdx}
                          className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-black/20 border border-white/5 text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[var(--text-secondary)]">{spot.name}:</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-[var(--text-muted)]">Distance:</span>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max={solventFrontCm}
                                value={spot.distanceCm}
                                onChange={(e) => handleUpdateSpotDistance(lIdx, sIdx, e.target.value)}
                                className="input-control px-2 py-0.5 text-xs rounded-md w-16 text-center font-bold text-cyan-300"
                              />
                              <span className="text-[10px] text-[var(--text-muted)]">cm</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {rfRes.success && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[11px] font-black border border-emerald-500/30">
                                Rf = {rfRes.rf}
                              </span>
                            )}
                            <button
                              onClick={() => handleRemoveSpot(lIdx, sIdx)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition"
                              title="Delete Spot"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
