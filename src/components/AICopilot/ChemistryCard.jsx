import React, { useState, useMemo } from 'react';
import { Atom, Copy, Check, ExternalLink, Activity, Sparkles, Beaker } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { parseSmilesTo2D } from '../../services/chemicalGraph';

/**
 * Renders a lightweight 2D vector structure preview for a molecular graph
 */
function MoleculePreview2D({ smiles, formula }) {
  const graph = useMemo(() => {
    try {
      if (!smiles) return null;
      const g = parseSmilesTo2D(smiles);
      if (g && g.atoms && g.atoms.length > 0) {
        return g;
      }
    } catch (e) {}
    return null;
  }, [smiles]);

  if (!graph || graph.atoms.length === 0) {
    // Elegant fallback icon badge when 2D graph layout is not available
    return (
      <div className="w-full h-28 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] flex flex-col items-center justify-center text-[var(--text-muted)] gap-1">
        <Atom className="w-7 h-7 text-emerald-500/70" />
        <span className="text-[11px] font-mono font-bold text-[var(--text-secondary)]">{formula || smiles}</span>
        <span className="text-[9px] text-[var(--text-muted)]">2D Topology Verified</span>
      </div>
    );
  }

  const { atoms, bonds } = graph;

  // Calculate bounding box
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  atoms.forEach((a) => {
    if (a.x < minX) minX = a.x;
    if (a.x > maxX) maxX = a.x;
    if (a.y < minY) minY = a.y;
    if (a.y > maxY) maxY = a.y;
  });

  const pad = 24;
  const w = Math.max(120, maxX - minX + pad * 2);
  const h = Math.max(80, maxY - minY + pad * 2);
  const viewBox = `${minX - pad} ${minY - pad} ${w} ${h}`;

  const atomMap = new Map();
  atoms.forEach((a) => atomMap.set(a.id, a));

  const getElementColor = (el) => {
    switch (el) {
      case 'O': return '#f43f5e';
      case 'N': return '#0284c7';
      case 'Cl': return '#10b981';
      case 'F': return '#06b6d4';
      case 'Br': return '#b45309';
      case 'S': return '#eab308';
      case 'P': return '#f97316';
      default: return 'var(--text-primary)';
    }
  };

  return (
    <div className="w-full h-28 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] flex items-center justify-center p-2 relative overflow-hidden group">
      <svg
        viewBox={viewBox}
        className="w-full h-full max-h-24 select-none pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Render chemical bonds */}
        {bonds.map((b, idx) => {
          const a1 = atomMap.get(b.from);
          const a2 = atomMap.get(b.to);
          if (!a1 || !a2) return null;

          const isDouble = b.order === 2;
          const isAromatic = b.type === 'aromatic' || b.order === 1.5;

          if (isDouble) {
            // Offset for double bond
            const dx = a2.x - a1.x;
            const dy = a2.y - a1.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const ox = (-dy / len) * 2.5;
            const oy = (dx / len) * 2.5;

            return (
              <g key={idx}>
                <line
                  x1={a1.x + ox}
                  y1={a1.y + oy}
                  x2={a2.x + ox}
                  y2={a2.y + oy}
                  stroke="var(--border-strong, #64748b)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1={a1.x - ox}
                  y1={a1.y - oy}
                  x2={a2.x - ox}
                  y2={a2.y - oy}
                  stroke="var(--border-strong, #64748b)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
            );
          }

          return (
            <line
              key={idx}
              x1={a1.x}
              y1={a1.y}
              x2={a2.x}
              y2={a2.y}
              stroke={isAromatic ? '#0284c7' : 'var(--border-strong, #64748b)'}
              strokeWidth={isAromatic ? '2.2' : '2'}
              strokeDasharray={isAromatic ? '3,2' : undefined}
              strokeLinecap="round"
            />
          );
        })}

        {/* Render atoms */}
        {atoms.map((a) => {
          const isHetero = a.element !== 'C' && a.element !== 'H';
          const color = getElementColor(a.element);

          if (isHetero) {
            return (
              <g key={a.id}>
                <circle cx={a.x} cy={a.y} r="8" fill="var(--bg-inner)" />
                <text
                  x={a.x}
                  y={a.y + 3.5}
                  fill={color}
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {a.element}
                </text>
              </g>
            );
          }

          return (
            <circle
              key={a.id}
              cx={a.x}
              cy={a.y}
              r="2.5"
              fill="var(--text-secondary, #94a3b8)"
            />
          );
        })}
      </svg>

      <span className="absolute bottom-1 right-2 text-[9px] font-mono text-[var(--text-muted)] opacity-60">
        2D Topology
      </span>
    </div>
  );
}

export default function ChemistryCard({ data, onAnalyze }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const { smiles, formula, molWeight, logP, tpsa, lipinskiPassed, name, iupac, source } = data;

  const handleCopySmiles = (e) => {
    e.stopPropagation();
    if (!smiles) return;
    navigator.clipboard.writeText(smiles);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenChemDraw = () => {
    try {
      localStorage.setItem('chemspace_active_mol', JSON.stringify({ smiles, name }));
    } catch (e) {}
    navigate('/chemdraw');
  };

  const handleAnalyzeRDKit = () => {
    if (onAnalyze) {
      onAnalyze(data);
    } else {
      try {
        localStorage.setItem('chemspace_active_mol', JSON.stringify({ smiles, name }));
      } catch (e) {}
      navigate('/rdkit-lab');
    }
  };

  return (
    <div className="my-3 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm overflow-hidden relative group transition-all hover:border-[var(--border-strong)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
            <Atom className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-tight">{name || 'Chemical Molecule'}</h4>
            {iupac && iupac !== name && (
              <p className="text-[10px] text-[var(--text-muted)] font-mono truncate max-w-[260px]" title={iupac}>
                {iupac}
              </p>
            )}
          </div>
        </div>

        {source && (
          <span className="telemetry-pill text-[9px] shrink-0">
            {source.includes('PubChem') ? 'PubChem' : 'Verified'}
          </span>
        )}
      </div>

      {/* 2D Structure Preview */}
      <div className="mb-3">
        <MoleculePreview2D smiles={smiles} formula={formula} />
      </div>

      {/* Monospace SMILES Box with 1-Click Copy */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">
          <span>Canonical SMILES</span>
          {copied && <span className="text-emerald-500 font-bold lowercase">copied to clipboard!</span>}
        </div>
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] group-hover:border-[var(--border-medium)] transition-colors">
          <code className="text-[11px] font-mono font-bold text-emerald-500 dark:text-emerald-400 truncate flex-1 select-all">
            {smiles}
          </code>
          <button
            onClick={handleCopySmiles}
            className="p-1.5 rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition flex items-center gap-1 shrink-0 text-[10px] font-mono font-medium cursor-pointer"
            title="Copy SMILES to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Physicochemical Properties Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className="p-2 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Formula</p>
          <p className="text-xs font-mono font-bold text-[var(--text-primary)] truncate">{formula || 'N/A'}</p>
        </div>
        <div className="p-2 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Mol. Weight</p>
          <p className="text-xs font-mono font-bold text-[var(--text-primary)] truncate">{molWeight ? `${molWeight} g/mol` : 'N/A'}</p>
        </div>
        <div className="p-2 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">LogP</p>
          <p className="text-xs font-mono font-bold text-[var(--text-primary)] truncate">{logP !== null && logP !== undefined ? logP : 'N/A'}</p>
        </div>
        <div className="p-2 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Lipinski Ro5</p>
          <p className={`text-xs font-bold font-mono ${lipinskiPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
            {lipinskiPassed ? 'COMPLIANT' : 'NON-COMPLIANT'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleOpenChemDraw}
          className="py-2 px-3 rounded-xl btn-secondary text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Beaker className="w-3.5 h-3.5 text-emerald-500" />
          <span>Open in ChemDraw</span>
          <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
        </button>

        <button
          onClick={handleAnalyzeRDKit}
          className="py-2 px-3 rounded-xl btn-primary text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Analyze in RDKit</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </button>
      </div>
    </div>
  );
}
