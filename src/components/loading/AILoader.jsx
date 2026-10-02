import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const DEFAULT_PHASES = [
  'Synthesizing chemical reasoning...',
  'Querying molecular knowledge base...',
  'Verifying structures & valence...',
  'Formulating scientific response...'
];

/**
 * AILoader
 * Premium atomic thinking indicator for ChemSpace AI responses.
 * Displays a dual-ring cyclotron orbital loader with rotating valence nodes,
 * scientific phase telemetry, and instant cancellation.
 */
export default function AILoader({ onCancel, label }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (label) return; // If caller provided custom static label, don't cycle
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % DEFAULT_PHASES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [label]);

  const activeLabel = label || DEFAULT_PHASES[phaseIndex];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`inline-flex items-center gap-3 px-3.5 py-2.5 rounded-xl border select-none transition-all shadow-sm ${
        isDark
          ? 'bg-[#12151e] border-white/10 text-[var(--text-primary)]'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Precision Dual-Ring Atomic Orbital Loader */}
      <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
        {/* Outer Rotating Orbital Ring with Orange/Emerald Arc */}
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full animate-spin [animation-duration:1.2s] pointer-events-none"
          fill="none"
        >
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="currentColor"
            strokeWidth="1.8"
            className="opacity-15"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="#f97316"
            strokeWidth="2"
            strokeDasharray="25 75"
            strokeLinecap="round"
            className="drop-shadow-[0_0_3px_#f97316]"
          />
          {/* Valence electron dot */}
          <circle cx="20" cy="4" r="2.2" fill="#f97316" />
        </svg>

        {/* Inner Counter-Rotating Orbit with Emerald Node */}
        <svg
          viewBox="0 0 40 40"
          className="absolute inset-0 w-full h-full animate-spin [animation-duration:1.8s] [animation-direction:reverse] pointer-events-none"
          fill="none"
        >
          <circle
            cx="20"
            cy="20"
            r="10"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="15 50"
            strokeLinecap="round"
            className="opacity-80"
          />
          <circle cx="20" cy="10" r="1.6" fill="#10b981" />
        </svg>

        {/* Central Quantum Spark */}
        <Sparkles className="w-2 h-2 text-amber-400 animate-pulse absolute" />
      </div>

      {/* Dynamic Telemetry Label with smooth fade */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-xs font-mono font-medium tracking-tight text-[var(--text-secondary)] truncate">
          {activeLabel}
        </span>
      </div>

      {/* Instant Stop / Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          type="button"
          className="ml-auto px-2 py-0.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold transition flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
          title="Stop Generating (Cancel)"
        >
          <X className="w-3 h-3" />
          <span>Stop</span>
        </button>
      )}
    </div>
  );
}

