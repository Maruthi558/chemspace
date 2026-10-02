import React from 'react';
import { Atom } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * ChemSpaceLoader
 * Unified, premium scientific loading visual identity for ChemSpace.
 * Combines molecular orbital geometry, pulsing valence nodes, and precision typography.
 */
export default function ChemSpaceLoader({
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant = 'card', // 'inline' | 'card' | 'page' | 'fullscreen'
  label = 'Loading ChemSpace...',
  sublabel,
  showProgress = false,
  progress = 0,
  className = ''
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Dimension presets for core mark
  const sizeMap = {
    xs: { outer: 'w-4 h-4', nucleus: 'w-2 h-2', stroke: 1.5, text: 'text-[9px]' },
    sm: { outer: 'w-6 h-6', nucleus: 'w-3 h-3', stroke: 1.5, text: 'text-[10px]' },
    md: { outer: 'w-10 h-10', nucleus: 'w-5 h-5', stroke: 2, text: 'text-xs' },
    lg: { outer: 'w-16 h-16', nucleus: 'w-8 h-8', stroke: 2, text: 'text-sm' },
    xl: { outer: 'w-24 h-24', nucleus: 'w-12 h-12', stroke: 2.2, text: 'text-base' }
  };

  const dim = sizeMap[size] || sizeMap.md;

  // The molecular / orbital core visual mark
  const renderMolecularCore = () => (
    <div className={`relative ${dim.outer} flex items-center justify-center select-none shrink-0`}>
      {/* Outer Rotating Orbital Ring */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full chemspace-orbit pointer-events-none"
      >
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="currentColor"
          strokeWidth={dim.stroke * 3}
          strokeDasharray="18 12"
          className={isDark ? 'text-white/20' : 'text-slate-900/15'}
        />
        {/* Orbital Node 1: Energetic Orange */}
        <circle
          cx="50"
          cy="6"
          r="4.5"
          className="fill-orange-500 drop-shadow-[0_0_6px_#f97316]"
        />
        {/* Orbital Node 2: Laboratory Emerald */}
        <circle
          cx="88"
          cy="72"
          r="3.5"
          className="fill-emerald-400 drop-shadow-[0_0_4px_#10b981]"
        />
        {/* Orbital Node 3: Stark White */}
        <circle
          cx="12"
          cy="72"
          r="3.5"
          className={isDark ? 'fill-white' : 'fill-slate-800'}
        />
      </svg>

      {/* Counter-rotating Elliptical Valence Orbit */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full chemspace-orbit-reverse pointer-events-none opacity-60"
      >
        <ellipse
          cx="50"
          cy="50"
          rx="40"
          ry="22"
          fill="none"
          stroke="currentColor"
          strokeWidth={dim.stroke * 2}
          strokeDasharray="10 8"
          className={isDark ? 'text-orange-400/30' : 'text-orange-500/25'}
          transform="rotate(30 50 50)"
        />
      </svg>

      {/* Central Pulsing Nucleus */}
      <div
        className={`relative ${dim.nucleus} rounded-xl flex items-center justify-center shadow-lg transition-transform chemspace-pulse-glow ${
          isDark
            ? 'bg-gradient-to-br from-orange-500 via-amber-500 to-emerald-500 text-white shadow-orange-500/25'
            : 'bg-gradient-to-br from-orange-600 via-amber-600 to-emerald-600 text-white shadow-orange-600/20'
        }`}
      >
        <Atom className="w-3/4 h-3/4 animate-spin-slow stroke-[2]" />
      </div>
    </div>
  );

  // 1. INLINE VARIANT
  if (variant === 'inline') {
    return (
      <span
        role="status"
        aria-live="polite"
        className={`inline-flex items-center gap-2 select-none ${className}`}
      >
        {renderMolecularCore()}
        {label && (
          <span className={`${dim.text} font-mono font-medium text-[var(--text-secondary)]`}>
            {label}
          </span>
        )}
      </span>
    );
  }

  // 2. CARD / PANEL VARIANT
  if (variant === 'card') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={`p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 select-none ${className}`}
      >
        {renderMolecularCore()}
        <div className="space-y-0.5">
          <p className={`${dim.text} font-mono font-semibold text-[var(--text-primary)]`}>
            {label}
          </p>
          {sublabel && (
            <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-wide">
              {sublabel}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 3. PAGE VARIANT (Container Level)
  if (variant === 'page') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={`flex-1 min-h-[50vh] w-full flex flex-col items-center justify-center p-8 select-none animate-in fade-in duration-200 ${className}`}
      >
        <div className="flex flex-col items-center max-w-sm text-center space-y-4">
          {renderMolecularCore()}
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-[var(--text-primary)]">
              {label}
            </h3>
            {sublabel ? (
              <p className="text-[11px] font-mono text-[var(--text-secondary)]">
                {sublabel}
              </p>
            ) : (
              <p className="text-[11px] font-mono text-[var(--text-muted)]">
                Synchronizing Molecular Workspace...
              </p>
            )}
          </div>

          {showProgress && (
            <div className="w-48 h-1 rounded-full bg-[var(--border-subtle)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 transition-all duration-150 rounded-full"
                style={{ width: `${Math.max(5, progress)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. FULLSCREEN VARIANT (Bootstrap & Heavy Workspace Initialization)
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none transition-all duration-300 ${
        isDark ? 'bg-[#08090d] text-white' : 'bg-[#f8fafc] text-slate-900'
      } backdrop-blur-3xl ${className}`}
    >
      {/* Ambient Scientific Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            isDark ? 'bg-emerald-500' : 'bg-emerald-400'
          }`}
        />
        <div
          className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            isDark ? 'bg-cyan-500' : 'bg-teal-400'
          }`}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {renderMolecularCore()}

        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-bold tracking-widest uppercase font-mono">
              CHEMSPACE
            </span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wider ${
                isDark
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              LABORATORY ENGINE
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            {label}
          </p>
        </div>

        {/* Real Progress Bar */}
        <div className="w-56 space-y-1.5">
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--border-subtle)] border border-[var(--border-subtle)]">
            <div
              className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-150"
              style={{ width: `${Math.max(8, progress)}%` }}
            />
          </div>
          {showProgress && (
            <span className="text-[10px] font-mono text-[var(--text-muted)] block text-right">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
