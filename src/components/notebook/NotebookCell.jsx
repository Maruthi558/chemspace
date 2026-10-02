import React from 'react';
import {
  Play,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import PythonEditor from './PythonEditor';
import CellOutput from './CellOutput';
import ButtonSpinner from '../common/ButtonSpinner';

export default function NotebookCell({
  cell,
  cellIndex,
  isFirst = false,
  isLast = false,
  onRun,
  onRunAndAdvance,
  onChangeCode,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onClearOutput,
  onInsertCellBelow
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isRunning = cell.status === 'running';
  const isSuccess = cell.status === 'success';
  const isError = cell.status === 'error';

  return (
    <div className="relative group/cell my-4 transition-all duration-200">
      {/* ── Main Cell Card ── */}
      <div
        className={`relative rounded-xl border transition-all duration-200 shadow-sm overflow-hidden ${
          isRunning
            ? isDark
              ? 'border-amber-500/50 bg-[#121622] ring-1 ring-amber-500/20'
              : 'border-amber-500/50 bg-[#fffdfa] ring-1 ring-amber-500/20'
            : isError
            ? isDark
              ? 'border-rose-500/40 bg-[#141016]'
              : 'border-rose-300 bg-[#fff9fa]'
            : isDark
            ? 'border-white/10 bg-[#121520] hover:border-white/20'
            : 'border-stone-200 bg-white hover:border-stone-300 shadow-xs'
        }`}
      >
        {/* Cell Header Action Bar (Minimal, appears subtly on hover/focus) */}
        <div
          className={`px-3 py-1.5 border-b flex items-center justify-between text-xs select-none ${
            isDark
              ? 'bg-[#0e111a] border-white/5 text-slate-400'
              : 'bg-[#f8f6f0] border-stone-200 text-stone-500'
          }`}
        >
          {/* Left: Execution status & Cell Index */}
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span
              className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                isRunning
                  ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                  : isSuccess
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : isError
                  ? 'bg-rose-500/10 text-rose-500'
                  : 'text-slate-400'
              }`}
            >
              In [{isRunning ? '*' : cell.executionCount ?? ' '}]
            </span>

            {isRunning && (
              <span className="flex items-center gap-1.5 text-amber-500 font-medium text-[11px]">
                <ButtonSpinner size="xs" variant="orange" />
                <span>Executing Python Kernel...</span>
              </span>
            )}
          </div>

          {/* Right: Compact Cell Controls */}
          <div className="flex items-center gap-1 opacity-70 group-hover/cell:opacity-100 transition-opacity">
            {/* Quick Run Button */}
            <button
              onClick={onRun}
              disabled={isRunning}
              className={`p-1 px-2 rounded-md font-mono text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition ${
                isRunning
                  ? 'bg-amber-500/20 text-amber-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs active:scale-95'
              }`}
              title="Run Cell (Shift+Enter or Ctrl+Enter)"
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">Run</span>
            </button>

            {/* Move Up */}
            <button
              onClick={onMoveUp}
              disabled={isFirst}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition text-slate-500"
              title="Move Cell Up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            {/* Move Down */}
            <button
              onClick={onMoveDown}
              disabled={isLast}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition text-slate-500"
              title="Move Cell Down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Duplicate Cell */}
            <button
              onClick={onDuplicate}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition text-slate-500"
              title="Duplicate Cell"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Clear Output */}
            {cell.output && (
              <button
                onClick={onClearOutput}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition text-slate-500"
                title="Clear Cell Output"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Delete Cell */}
            <button
              onClick={onDelete}
              className="p-1 rounded hover:bg-rose-500/10 hover:text-rose-500 transition text-slate-500"
              title="Delete Cell"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cell Editor Body */}
        <div className="p-3">
          <PythonEditor
            code={cell.code}
            onChange={onChangeCode}
            onRun={onRun}
            onRunAndAdvance={onRunAndAdvance}
            readOnly={isRunning}
            minHeight={80}
          />
        </div>

        {/* Cell Output Area (Directly underneath the cell that produced it!) */}
        {cell.output && (
          <CellOutput
            output={cell.output}
            cellIndex={cell.executionCount || cellIndex}
            executionTime={cell.executionTime}
          />
        )}
      </div>

      {/* ── Hover Cell Inserter Divider (+ Code) ── */}
      <div className="relative py-2 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
        <div className="absolute inset-x-0 h-px bg-stone-300 dark:bg-white/10 pointer-events-none" />
        <button
          onClick={onInsertCellBelow}
          className="relative z-10 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-white dark:bg-[#1a1f2c] border border-stone-300 dark:border-white/15 text-slate-700 dark:text-slate-200 shadow-sm hover:border-emerald-500 hover:text-emerald-500 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          title="Insert Code Cell Below"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-500" />
          <span>+ Code</span>
        </button>
      </div>
    </div>
  );
}
