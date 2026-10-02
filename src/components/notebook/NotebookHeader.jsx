import React from 'react';
import {
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Activity,
  CheckCircle2,
  Trash2,
  BookOpen
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function NotebookHeader({
  kernelStatus = 'ready', // 'ready' | 'busy' | 'restarting'
  isExecutingAll = false,
  onAddCell,
  onRunAll,
  onRestartKernel,
  onClearAllOutputs,
  onLoadTemplate
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className="border-b border-inherit pb-5 space-y-4">
      {/* Title & Kernel Telemetry Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--home-text-primary)]">
              RDKit Laboratory
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-500 font-semibold">
              Python 3.14 · RDKit 2026.03.5
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--home-text-secondary)]">
            Interactive scientific notebook environment with persistent Python sessions, 2D Kekulé graphs, and 3D conformers.
          </p>
        </div>

        {/* Compact Kernel Status Chip */}
        <div className="flex items-center gap-2 text-xs font-mono select-none self-start sm:self-auto">
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition ${
              kernelStatus === 'busy' || isExecutingAll
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                : 'bg-[var(--home-surface-subtle)] border-[var(--home-border)] text-[var(--home-text-secondary)]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                kernelStatus === 'busy' || isExecutingAll
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-emerald-500'
              }`}
            />
            <span>
              Kernel: <strong>{kernelStatus === 'busy' || isExecutingAll ? 'Busy' : 'Ready'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Left Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary + Code Button */}
          <button
            onClick={onAddCell}
            className="btn-orange py-1.5 px-3.5 text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Add a new code cell"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Code</span>
          </button>

          {/* Run All Cells */}
          <button
            onClick={onRunAll}
            disabled={isExecutingAll}
            className="btn-secondary py-1.5 px-3 text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
            title="Run all notebook cells sequentially"
          >
            <Play className="w-3 h-3 fill-current text-emerald-500" />
            <span>Run All</span>
          </button>

          {/* Restart Kernel */}
          <button
            onClick={onRestartKernel}
            className="btn-outline py-1.5 px-3 text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Reset notebook kernel session (clears variables)"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restart Kernel</span>
          </button>

          {/* Clear Outputs */}
          <button
            onClick={onClearAllOutputs}
            className="btn-ghost py-1.5 px-2.5 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            title="Clear all cell outputs"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear Outputs</span>
          </button>
        </div>

        {/* Right: Starter Templates Selector */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <BookOpen className="w-3.5 h-3.5 text-[var(--home-text-muted)]" />
          <span className="text-[var(--home-text-muted)] hidden sm:inline">Templates:</span>
          <select
            onChange={(e) => {
              if (e.target.value) {
                onLoadTemplate(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="px-2.5 py-1.5 rounded-lg border border-[var(--home-border)] bg-[var(--home-surface-subtle)] text-[var(--home-text-primary)] text-xs font-mono cursor-pointer outline-none focus:border-emerald-500"
          >
            <option value="" disabled>Load Chemistry Template...</option>
            <option value="aspirin">1. Aspirin 2D &amp; 3D Molecular Studio</option>
            <option value="lipinski">2. Lipinski Rule-of-5 Compliance Table</option>
            <option value="conformer">3. MMFF94 3D Conformer Generation</option>
            <option value="descriptors">4. High-Throughput Descriptors &amp; Plot</option>
          </select>
        </div>
      </div>
    </header>
  );
}
