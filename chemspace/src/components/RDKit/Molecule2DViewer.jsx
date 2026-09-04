import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Download, Copy, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ELEMENT_COLORS = {
  C: { dark: '#f8fafc', light: '#0f172a' },
  H: { dark: '#94a3b8', light: '#64748b' },
  O: { dark: '#f43f5e', light: '#e11d48' },
  N: { dark: '#38bdf8', light: '#0284c7' },
  S: { dark: '#fbbf24', light: '#d97706' },
  P: { dark: '#fb923c', light: '#ea580c' },
  F: { dark: '#34d399', light: '#059669' },
  Cl: { dark: '#10b981', light: '#047857' },
  Br: { dark: '#a855f7', light: '#7c3aed' },
  I: { dark: '#ec4899', light: '#db2777' }
};

export default function Molecule2DViewer({ atoms = [], bonds = [], smiles = '', formula = '' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const svgRef = useRef(null);

  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);

  if (!atoms || atoms.length === 0) {
    return (
      <div className="w-full h-full min-h-[380px] rounded-2xl flex flex-col items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-inner)] p-8 text-center">
        <p className="text-xs text-[var(--text-muted)] font-mono">
          No 2D molecular graph available. Run an RDKit script or enter a SMILES string.
        </p>
      </div>
    );
  }

  // Calculate bounding box to center & auto-scale the molecule
  const xs = atoms.map((a) => a.x);
  const ys = atoms.map((a) => a.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const width = Math.max(maxX - minX, 100);
  const height = Math.max(maxY - minY, 100);
  const padding = 60;

  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;

  const handleMouseDown = (e) => {
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleReset = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const handleCopySmiles = () => {
    if (!smiles) return;
    navigator.clipboard.writeText(smiles);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formula || 'molecule'}_2D.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bondColor = isDark ? '#94a3b8' : '#475569';

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-inner)] flex flex-col justify-between shadow-inner">
      {/* Top Floating Action Bar */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-[var(--bg-card-glass)] backdrop-blur-md p-1.5 rounded-xl border border-[var(--border-subtle)] shadow-md">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}
          className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
          className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-inherit border-l border-[var(--border-subtle)] mx-0.5" />
        <button
          onClick={handleCopySmiles}
          className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          title="Copy SMILES"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
        <button
          onClick={handleDownloadSVG}
          className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          title="Download Vector SVG"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive 2D Canvas Area */}
      <div
        className="w-full h-full flex-1 cursor-grab active:cursor-grabbing select-none overflow-hidden flex items-center justify-center p-4"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg
            ref={svgRef}
            viewBox={viewBox}
            className="w-full h-full max-h-[380px]"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render Chemical Bonds */}
            {bonds.map((b, idx) => {
              const a1 = atoms.find((a) => a.id === b.from);
              const a2 = atoms.find((a) => a.id === b.to);
              if (!a1 || !a2) return null;

              const dx = a2.x - a1.x;
              const dy = a2.y - a1.y;
              const len = Math.hypot(dx, dy) || 1;
              const nx = -dy / len;
              const ny = dx / len;

              if (b.type === 'double' || b.order === 2) {
                const offset = 3.2;
                return (
                  <g key={`bond_${idx}`}>
                    <line
                      x1={a1.x + nx * offset}
                      y1={a1.y + ny * offset}
                      x2={a2.x + nx * offset}
                      y2={a2.y + ny * offset}
                      stroke={bondColor}
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                    <line
                      x1={a1.x - nx * offset}
                      y1={a1.y - ny * offset}
                      x2={a2.x - nx * offset}
                      y2={a2.y - ny * offset}
                      stroke={bondColor}
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                  </g>
                );
              } else if (b.type === 'triple' || b.order === 3) {
                const offset = 4.2;
                return (
                  <g key={`bond_${idx}`}>
                    <line x1={a1.x} y1={a1.y} x2={a2.x} y2={a2.y} stroke={bondColor} strokeWidth="2.8" strokeLinecap="round" />
                    <line x1={a1.x + nx * offset} y1={a1.y + ny * offset} x2={a2.x + nx * offset} y2={a2.y + ny * offset} stroke={bondColor} strokeWidth="2.4" strokeLinecap="round" />
                    <line x1={a1.x - nx * offset} y1={a1.y - ny * offset} x2={a2.x - nx * offset} y2={a2.y - ny * offset} stroke={bondColor} strokeWidth="2.4" strokeLinecap="round" />
                  </g>
                );
              } else if (b.type === 'aromatic' || b.order === 1.5) {
                const offset = 3.5;
                return (
                  <g key={`bond_${idx}`}>
                    <line x1={a1.x} y1={a1.y} x2={a2.x} y2={a2.y} stroke={bondColor} strokeWidth="2.8" strokeLinecap="round" />
                    <line
                      x1={a1.x + nx * offset}
                      y1={a1.y + ny * offset}
                      x2={a2.x + nx * offset}
                      y2={a2.y + ny * offset}
                      stroke={bondColor}
                      strokeWidth="2.0"
                      strokeDasharray="4 3"
                      strokeLinecap="round"
                    />
                  </g>
                );
              }

              // Standard Single Bond
              return (
                <line
                  key={`bond_${idx}`}
                  x1={a1.x}
                  y1={a1.y}
                  x2={a2.x}
                  y2={a2.y}
                  stroke={bondColor}
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Render Atom Nodes & Labels */}
            {atoms.map((atom) => {
              const el = atom.element || 'C';
              const showLabel = el !== 'C' || atoms.length === 1;
              const colorObj = ELEMENT_COLORS[el] || ELEMENT_COLORS.C;
              const textColor = isDark ? colorObj.dark : colorObj.light;

              return (
                <g key={`atom_${atom.id}`}>
                  {/* Subtle Node Backdrop Disk */}
                  <circle
                    cx={atom.x}
                    cy={atom.y}
                    r={showLabel ? 14 : 4}
                    fill={isDark ? '#06080d' : '#f8fafc'}
                    stroke={showLabel ? 'none' : bondColor}
                    strokeWidth={showLabel ? 0 : 2}
                  />

                  {showLabel && (
                    <text
                      x={atom.x}
                      y={atom.y + 4.5}
                      fill={textColor}
                      fontSize="14"
                      fontWeight="bold"
                      fontFamily="Inter, ui-monospace, sans-serif"
                      textAnchor="middle"
                    >
                      {el}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="px-4 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-card-glass)] flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)]">
        <span className="truncate">
          2D Vector Projection • {atoms.length} Atoms • {bonds.length} Bonds
        </span>
        <span className="font-bold text-[var(--text-primary)]">
          {formula || smiles || 'Canonical Graph'}
        </span>
      </div>
    </div>
  );
}
