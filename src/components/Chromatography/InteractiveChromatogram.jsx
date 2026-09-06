import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  Trash2,
  Download,
  Upload,
  Info,
  Maximize2,
  Activity,
  Sliders,
  CheckCircle2,
  FileText
} from 'lucide-react';
import {
  calculateAreaPercentage,
  calculateResolution,
  calculateColumnEfficiency,
  calculateCapacityFactor
} from '../../services/chromatographyCalculations';

export default function InteractiveChromatogram({
  peaks = [],
  onPeaksChange,
  deadTime = 0.5,
  columnLength = 150,
  unit = 'min',
  title = 'Interactive Chromatogram',
  isDark = true
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const [selectedPeakIndex, setSelectedPeakIndex] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const svgRef = useRef(null);

  // Time range calculation from user-provided peaks
  const timeRange = useMemo(() => {
    if (!peaks || peaks.length === 0) return { min: 0, max: 10 };
    const validTrs = peaks.map((p) => parseFloat(p.tR) || 0);
    const maxTr = Math.max(...validTrs, 5);
    return { min: 0, max: Math.ceil(maxTr * 1.3) };
  }, [peaks]);

  // Compute area percentages and metrics
  const areaAnalysis = useMemo(() => {
    if (!peaks || peaks.length === 0) return null;
    return calculateAreaPercentage(peaks);
  }, [peaks]);

  // Generate continuous chromatographic curve points using Gaussian peak superposition
  const curveData = useMemo(() => {
    const minT = timeRange.min;
    const maxT = timeRange.max;
    const numPoints = 600;
    const dt = (maxT - minT) / numPoints;
    const points = [];

    // Baseline noise amplitude
    const baseline = 2;

    for (let i = 0; i <= numPoints; i++) {
      const t = minT + i * dt;
      let signal = baseline;

      // Superposition of user peaks: y(t) = Height * exp( -4 * ln(2) * ((t - tR) / W0.5)^2 )
      if (peaks && peaks.length > 0) {
        peaks.forEach((p) => {
          const tR = parseFloat(p.tR) || 0;
          const height = parseFloat(p.height) || (parseFloat(p.area) ? parseFloat(p.area) / 10 : 20);
          const w = parseFloat(p.width) || 0.2;
          if (w > 0 && height > 0) {
            const exponent = -4 * Math.LN2 * Math.pow((t - tR) / w, 2);
            if (exponent > -12) {
              signal += height * Math.exp(exponent);
            }
          }
        });
      }

      points.push({ t: Number(t.toFixed(3)), signal: Number(signal.toFixed(2)) });
    }

    return points;
  }, [peaks, timeRange]);

  const maxSignal = useMemo(() => {
    if (curveData.length === 0) return 100;
    const maxVal = Math.max(...curveData.map((p) => p.signal));
    return Math.max(maxVal * 1.25, 40);
  }, [curveData]);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 320;
  const padding = { top: 30, right: 30, bottom: 45, left: 55 };

  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Coordinate transforms
  const scaleX = (t) => {
    const domainSpan = (timeRange.max - timeRange.min) / zoomLevel;
    const startT = timeRange.min + panOffset;
    return padding.left + ((t - startT) / domainSpan) * plotWidth;
  };

  const scaleY = (signal) => {
    return padding.top + plotHeight - (signal / maxSignal) * plotHeight;
  };

  // Build SVG Path
  const pathD = useMemo(() => {
    if (curveData.length === 0) return '';
    return curveData.reduce((acc, pt, idx) => {
      const x = scaleX(pt.t);
      const y = scaleY(pt.signal);
      return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  }, [curveData, zoomLevel, panOffset, maxSignal]);

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.max(1, Math.min(prev * delta, 6)));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset(0);
  };

  const handleAddPeak = () => {
    const nextTr = peaks.length === 0 ? 2.5 : Number((parseFloat(peaks[peaks.length - 1].tR || 2) + 1.8).toFixed(2));
    const newPeak = {
      name: `Analyte ${String.fromCharCode(65 + peaks.length)}`,
      tR: nextTr,
      height: 65,
      width: 0.28,
      area: 450,
      responseFactor: 1.0
    };
    if (onPeaksChange) {
      onPeaksChange([...peaks, newPeak]);
    }
  };

  const handleRemovePeak = (index) => {
    if (onPeaksChange) {
      const updated = peaks.filter((_, i) => i !== index);
      onPeaksChange(updated);
      if (selectedPeakIndex === index) setSelectedPeakIndex(null);
    }
  };

  const handleUpdatePeakField = (index, field, value) => {
    if (onPeaksChange) {
      const updated = peaks.map((p, i) => {
        if (i === index) {
          const mod = { ...p, [field]: value };
          // If height & width updated, auto-estimate area if unset
          if (field === 'height' || field === 'width') {
            const h = parseFloat(field === 'height' ? value : mod.height) || 0;
            const w = parseFloat(field === 'width' ? value : mod.width) || 0.2;
            mod.area = Math.round(1.064 * h * w * 25);
          }
          return mod;
        }
        return p;
      });
      onPeaksChange(updated);
    }
  };

  const selectedPeak = selectedPeakIndex !== null ? peaks[selectedPeakIndex] : null;

  return (
    <div className="space-y-4">
      {/* 1. TOP CONTROLS & ZOOM TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl inner-box border border-[var(--border-subtle)] bg-[var(--bg-inner)]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold font-mono text-[var(--text-primary)]">{title}</span>
          <span className="telemetry-pill text-[9px] font-mono font-bold">
            {peaks.length} {peaks.length === 1 ? 'PEAK' : 'PEAKS'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleZoom(1.3)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(0.75)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleAddPeak}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-xs font-bold font-mono transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Peak</span>
          </button>
        </div>
      </div>

      {/* 2. CHROMATOGRAM SVG GRAPH CANVAS */}
      <div className="relative rounded-3xl overflow-hidden border border-[var(--border-subtle)] bg-[#03060c] p-2 shadow-2xl">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none"
          style={{ minHeight: '260px' }}
        >
          <defs>
            <linearGradient id="chromGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.0" />
            </linearGradient>
            <clipPath id="plotClip">
              <rect x={padding.left} y={padding.top} width={plotWidth} height={plotHeight} />
            </clipPath>
          </defs>

          {/* Grid lines (X & Y) */}
          <g opacity={0.15}>
            {[0, 0.25, 0.5, 0.75, 1.0].map((frac, i) => {
              const y = padding.top + plotHeight * frac;
              return (
                <line
                  key={`gy-${i}`}
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + plotWidth}
                  y2={y}
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                />
              );
            })}
            {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((frac, i) => {
              const x = padding.left + plotWidth * frac;
              return (
                <line
                  key={`gx-${i}`}
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + plotHeight}
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                />
              );
            })}
          </g>

          {/* Dead Time t0 line */}
          {deadTime > 0 && scaleX(deadTime) >= padding.left && scaleX(deadTime) <= padding.left + plotWidth && (
            <g clipPath="url(#plotClip)">
              <line
                x1={scaleX(deadTime)}
                y1={padding.top}
                x2={scaleX(deadTime)}
                y2={padding.top + plotHeight}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                opacity={0.8}
              />
              <text
                x={scaleX(deadTime) + 4}
                y={padding.top + 14}
                fill="#f59e0b"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                t₀ ({deadTime} {unit})
              </text>
            </g>
          )}

          {/* Peak Curves Area Fill & Stroke */}
          <g clipPath="url(#plotClip)">
            {pathD && (
              <>
                <path
                  d={`${pathD} L ${scaleX(timeRange.max)} ${scaleY(0)} L ${scaleX(timeRange.min)} ${scaleY(0)} Z`}
                  fill="url(#chromGradient)"
                />
                <path d={pathD} fill="none" stroke="#22d3ee" strokeWidth={2.2} strokeLinecap="round" />
              </>
            )}

            {/* Peak Markers & Labels */}
            {peaks.map((p, idx) => {
              const tR = parseFloat(p.tR) || 0;
              const height = parseFloat(p.height) || 40;
              const x = scaleX(tR);
              const y = scaleY(height + 2);

              if (x < padding.left || x > padding.left + plotWidth) return null;

              const isSelected = selectedPeakIndex === idx;

              return (
                <g
                  key={idx}
                  onClick={() => setSelectedPeakIndex(idx)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 5 : 3.5}
                    fill={isSelected ? '#38bdf8' : '#06b6d4'}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={padding.top + plotHeight}
                    stroke={isSelected ? '#38bdf8' : '#06b6d4'}
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    opacity={isSelected ? 0.8 : 0.35}
                  />
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {p.name || `P${idx + 1}`} ({tR.toFixed(2)})
                  </text>
                </g>
              );
            })}
          </g>

          {/* X and Y Axes */}
          <line
            x1={padding.left}
            y1={padding.top + plotHeight}
            x2={padding.left + plotWidth}
            y2={padding.top + plotHeight}
            stroke="#64748b"
            strokeWidth={1.5}
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + plotHeight}
            stroke="#64748b"
            strokeWidth={1.5}
          />

          {/* X Axis Labels */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((frac, i) => {
            const tVal = timeRange.min + (timeRange.max - timeRange.min) * frac;
            const x = padding.left + plotWidth * frac;
            return (
              <g key={`xt-${i}`}>
                <line x1={x} y1={padding.top + plotHeight} x2={x} y2={padding.top + plotHeight + 5} stroke="#64748b" />
                <text
                  x={x}
                  y={padding.top + plotHeight + 18}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {tVal.toFixed(1)}
                </text>
              </g>
            );
          })}
          <text
            x={padding.left + plotWidth / 2}
            y={svgHeight - 8}
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Retention Time t_R ({unit})
          </text>

          {/* Y Axis Labels */}
          {[0, 0.5, 1.0].map((frac, i) => {
            const sigVal = maxSignal * (1 - frac);
            const y = padding.top + plotHeight * frac;
            return (
              <g key={`yt-${i}`}>
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {Math.round(sigVal)}
                </text>
              </g>
            );
          })}
          <text
            x={15}
            y={padding.top + plotHeight / 2}
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            transform={`rotate(-90 15 ${padding.top + plotHeight / 2})`}
          >
            Detector Signal (mAU)
          </text>
        </svg>

        {peaks.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-2 bg-black/60 backdrop-blur-sm">
            <Info className="w-8 h-8 text-cyan-400/60" />
            <p className="text-xs font-mono text-slate-300">
              Enter or add peak retention times ($t_R$), heights, and widths to generate the real chromatogram.
            </p>
            <button
              onClick={handleAddPeak}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs font-mono shadow-md hover:bg-cyan-400 transition"
            >
              + Add Sample Peak
            </button>
          </div>
        )}
      </div>

      {/* 3. PEAK INTEGRATION & QUANTITATIVE RESULTS TABLE */}
      {peaks.length > 0 && (
        <div className="glass-panel p-4 rounded-3xl border border-[var(--border-subtle)] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-inherit pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
              Integrated Chromatographic Peaks &amp; Metrics Table
            </span>
            {areaAnalysis && (
              <span className="text-[10px] text-cyan-400 font-mono font-bold">
                Total Corrected Area: {areaAnalysis.totalCorrectedArea.toLocaleString()}
              </span>
            )}
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-inherit text-[var(--text-secondary)] text-[10px] uppercase">
                  <th className="py-2 px-2">#</th>
                  <th className="py-2 px-2">Analyte Name</th>
                  <th className="py-2 px-2">tR ({unit})</th>
                  <th className="py-2 px-2">Height (mAU)</th>
                  <th className="py-2 px-2">W_0.5 ({unit})</th>
                  <th className="py-2 px-2">Area</th>
                  <th className="py-2 px-2">Area %</th>
                  <th className="py-2 px-2">k' Factor</th>
                  <th className="py-2 px-2">N (Plates)</th>
                  <th className="py-2 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                {peaks.map((p, idx) => {
                  const areaPct = areaAnalysis?.peaks?.find((a) => a.name === p.name)?.percentage || 0;
                  const tRVal = parseFloat(p.tR) || 0;
                  const wVal = parseFloat(p.width) || 0.2;
                  const kVal = deadTime > 0 ? ((tRVal - deadTime) / deadTime).toFixed(2) : 'N/A';
                  const nVal = wVal > 0 ? Math.round(5.545 * Math.pow(tRVal / wVal, 2)).toLocaleString() : 'N/A';
                  const isSelected = selectedPeakIndex === idx;

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-white/5 transition ${isSelected ? 'bg-cyan-500/10 font-bold' : ''}`}
                    >
                      <td className="py-2.5 px-2 text-cyan-400 font-bold">{idx + 1}</td>
                      <td className="py-2.5 px-2">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handleUpdatePeakField(idx, 'name', e.target.value)}
                          className="input-control px-2 py-1 text-xs rounded-lg w-28"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          step="0.01"
                          value={p.tR}
                          onChange={(e) => handleUpdatePeakField(idx, 'tR', e.target.value)}
                          className="input-control px-2 py-1 text-xs rounded-lg w-16"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          step="1"
                          value={p.height}
                          onChange={(e) => handleUpdatePeakField(idx, 'height', e.target.value)}
                          className="input-control px-2 py-1 text-xs rounded-lg w-16"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          step="0.01"
                          value={p.width}
                          onChange={(e) => handleUpdatePeakField(idx, 'width', e.target.value)}
                          className="input-control px-2 py-1 text-xs rounded-lg w-16"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          step="10"
                          value={p.area}
                          onChange={(e) => handleUpdatePeakField(idx, 'area', e.target.value)}
                          className="input-control px-2 py-1 text-xs rounded-lg w-20"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-emerald-400 font-bold">{areaPct}%</td>
                      <td className="py-2.5 px-2 text-amber-400">{kVal}</td>
                      <td className="py-2.5 px-2 text-violet-400">{nVal}</td>
                      <td className="py-2.5 px-2 text-right">
                        <button
                          onClick={() => handleRemovePeak(idx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete Peak"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Adjacent Resolution Rs Display */}
          {peaks.length >= 2 && (
            <div className="p-3 rounded-2xl inner-box space-y-1.5 text-xs font-mono">
              <span className="text-[10px] text-cyan-400 uppercase font-black">
                Adjacent Peak Resolutions (Rs):
              </span>
              <div className="flex flex-wrap gap-3">
                {peaks.slice(0, -1).map((p1, i) => {
                  const p2 = peaks[i + 1];
                  const res = calculateResolution(p1.tR, p2.tR, p1.width, p2.width, true);
                  return (
                    <div
                      key={i}
                      className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] flex items-center gap-2"
                    >
                      <span className="text-[var(--text-secondary)]">
                        {p1.name} ↔ {p2.name}:
                      </span>
                      {res.success ? (
                        <span
                          className={`font-black ${
                            res.rs >= 1.5 ? 'text-emerald-400' : res.rs >= 1.0 ? 'text-amber-400' : 'text-rose-400'
                          }`}
                        >
                          Rs = {res.rs} {res.rs >= 1.5 ? '✓ (Baseline)' : '(Overlap)'}
                        </span>
                      ) : (
                        <span className="text-slate-500">N/A</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
