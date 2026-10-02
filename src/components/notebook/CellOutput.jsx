import React, { useState } from 'react';
import {
  Layers,
  Box,
  Copy,
  Check,
  Download,
  AlertTriangle,
  RotateCw,
  Eye,
  FileSpreadsheet,
  Maximize2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ThreeMoleculeViewer from '../ThreeMoleculeViewer';

export default function CellOutput({
  output,
  cellIndex,
  executionTime
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [viewMode, setViewMode] = useState('auto'); // 'auto' | '2d' | '3d'
  const [copiedSmiles, setCopiedSmiles] = useState(false);
  const [styleMode3D, setStyleMode3D] = useState('ball-stick'); // 'ball-stick' | 'space-fill' | 'wireframe'

  if (!output) return null;

  const {
    status,
    stdout,
    error,
    traceback,
    result_type,
    result_value,
    molecule_data,
    table_data,
    image_data
  } = output;

  const hasMolData = !!molecule_data;
  const is3DDefault = result_type === 'molecule_3d' || (hasMolData && molecule_data.has_3d && !molecule_data.svg);
  const activeView = viewMode === 'auto' ? (is3DDefault ? '3d' : '2d') : viewMode;

  const handleCopySmiles = () => {
    if (molecule_data?.smiles) {
      navigator.clipboard.writeText(molecule_data.smiles);
      setCopiedSmiles(true);
      setTimeout(() => setCopiedSmiles(false), 1800);
    }
  };

  return (
    <div
      className={`relative w-full rounded-b-xl border-t transition-all duration-200 overflow-hidden ${
        isDark
          ? 'bg-[#0b0e16] border-white/10 text-slate-200'
          : 'bg-[#faf8f4] border-stone-200 text-stone-800'
      }`}
    >
      {/* ── Output Header Telemetry ── */}
      <div
        className={`px-4 py-2 border-b flex items-center justify-between text-[11px] font-mono select-none ${
          isDark
            ? 'bg-[#0e121c] border-white/5 text-slate-400'
            : 'bg-[#f4f1ea] border-stone-200/80 text-stone-500'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-emerald-500 dark:text-emerald-400">
            Out [{cellIndex || 1}]:
          </span>
          {executionTime && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              • completed in {executionTime}
            </span>
          )}
        </div>

        {/* Molecule 2D / 3D Mode Toggle */}
        {hasMolData && (
          <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-inherit">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition ${
                activeView === '2d'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>2D Kekulé</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition ${
                activeView === '3d'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Box className="w-3 h-3" />
              <span>3D Conformer</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Main Output Content Area ── */}
      <div className="p-4 space-y-4">
        {/* 1. PYTHON ERROR / TRACEBACK BLOCK */}
        {status === 'error' && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-rose-500 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error || 'Execution Error'}</span>
            </div>
            {traceback && (
              <pre className="text-[11.5px] leading-relaxed text-rose-600 dark:text-rose-300 overflow-x-auto whitespace-pre-wrap p-2 rounded bg-black/20 dark:bg-black/40">
                {traceback}
              </pre>
            )}
          </div>
        )}

        {/* 2. STDOUT TERMINAL TEXT BLOCK */}
        {stdout && (
          <div
            className={`p-3.5 rounded-xl font-mono text-[12.5px] leading-relaxed overflow-x-auto border ${
              isDark
                ? 'bg-[#090b10] border-white/5 text-slate-300'
                : 'bg-white border-stone-200 text-stone-800'
            }`}
          >
            <pre className="m-0 whitespace-pre-wrap font-mono">{stdout}</pre>
          </div>
        )}

        {/* 3. SCALAR RETURN DATA */}
        {result_type === 'data' && result_value && (
          <div
            className={`inline-block px-3 py-1.5 rounded-lg border font-mono text-xs font-bold ${
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {result_value}
          </div>
        )}

        {/* 4. RDKIT MOLECULE VISUALIZATION (2D & 3D INTERACTIVE) */}
        {hasMolData && (
          <div className="space-y-3">
            {/* Molecular Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pb-2 border-b border-inherit">
              <div className="flex items-center gap-3">
                {molecule_data.formula && (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {molecule_data.formula}
                  </span>
                )}
                {molecule_data.mw && (
                  <span className="text-[11px] text-slate-500">
                    MW: <strong className="text-slate-800 dark:text-slate-200">{molecule_data.mw} g/mol</strong>
                  </span>
                )}
              </div>

              {molecule_data.smiles && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 max-w-[220px] sm:max-w-xs truncate">
                    {molecule_data.smiles}
                  </span>
                  <button
                    onClick={handleCopySmiles}
                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition text-slate-500"
                    title="Copy Canonical SMILES"
                  >
                    {copiedSmiles ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* 2D Vector SVG Rendering */}
            {activeView === '2d' && molecule_data.svg && (
              <div
                className={`relative w-full min-h-[260px] sm:min-h-[300px] rounded-xl border flex items-center justify-center p-4 overflow-hidden transition-colors ${
                  isDark
                    ? 'bg-[#0d1017] border-white/10'
                    : 'bg-white border-stone-200/90 shadow-xs'
                }`}
              >
                <div
                  className="w-full max-w-md mx-auto flex items-center justify-center [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:drop-shadow-xs"
                  dangerouslySetInnerHTML={{ __html: molecule_data.svg }}
                />
              </div>
            )}

            {/* 3D Interactive Conformer Viewer */}
            {activeView === '3d' && (
              <div
                className={`relative w-full h-[360px] sm:h-[420px] rounded-xl border overflow-hidden transition-colors ${
                  isDark
                    ? 'bg-[#090b10] border-white/10'
                    : 'bg-[#f4f2eb] border-stone-300'
                }`}
              >
                {/* 3D Style Controls overlay */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 text-white text-[11px] font-mono">
                  <span>Style:</span>
                  <select
                    value={styleMode3D}
                    onChange={(e) => setStyleMode3D(e.target.value)}
                    className="bg-transparent text-white border-none outline-none font-bold cursor-pointer"
                  >
                    <option value="ball-stick" className="bg-slate-900 text-white">Ball &amp; Stick</option>
                    <option value="space-fill" className="bg-slate-900 text-white">Space Filling</option>
                    <option value="wireframe" className="bg-slate-900 text-white">Wireframe</option>
                  </select>
                </div>

                <ThreeMoleculeViewer
                  molecule={{
                    atoms: molecule_data.atoms_3d || [],
                    bonds: molecule_data.bonds_3d || []
                  }}
                  styleMode={styleMode3D}
                />
              </div>
            )}
          </div>
        )}

        {/* 5. SCIENTIFIC TABLES & DATAFRAMES */}
        {result_type === 'table' && table_data && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Structured Scientific Table ({table_data.rows?.length || 0} rows)</span>
            </div>
            <div
              className={`rounded-xl border overflow-x-auto ${
                isDark
                  ? 'bg-[#0d1017] border-white/10'
                  : 'bg-white border-stone-200'
              }`}
            >
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className={isDark ? 'bg-white/5 border-b border-white/10' : 'bg-stone-100 border-b border-stone-200'}>
                    {table_data.columns?.map((col) => (
                      <th key={col} className="px-3.5 py-2 font-bold text-slate-700 dark:text-slate-300">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-inherit">
                  {table_data.rows?.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={rIdx % 2 === 0 ? '' : isDark ? 'bg-white/[0.02]' : 'bg-stone-50/50'}
                    >
                      {table_data.columns?.map((col) => (
                        <td key={col} className="px-3.5 py-2 text-slate-600 dark:text-slate-300">
                          {typeof row[col] === 'number' ? Number(row[col].toFixed(4)) : String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. MATPLOTLIB HIGH-RES GRAPH IMAGE */}
        {result_type === 'image' && image_data && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-center ${
              isDark ? 'bg-[#0d1017] border-white/10' : 'bg-white border-stone-200'
            }`}
          >
            <img
              src={image_data}
              alt="Matplotlib generated scientific figure"
              className="max-w-full h-auto rounded-lg drop-shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
