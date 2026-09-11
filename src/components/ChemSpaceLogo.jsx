import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * ChemSpaceLogo
 * Refined, premium scientific brand mark for ChemSpace.
 * Features a precision hexagonal molecular geometry with orbital depth,
 * restrained scientific colors, and subtle, smooth 3D depth perspective.
 */
export default function ChemSpaceLogo({
  size = 'md', // 'sm' | 'md' | 'lg'
  showText = true,
  interactive = true,
  className = ''
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Dimension presets
  const sizeMap = {
    sm: { icon: 'w-7 h-7', mark: 28, text: 'text-[11px]', sub: 'text-[7.5px]' },
    md: { icon: 'w-8 h-8', mark: 32, text: 'text-xs', sub: 'text-[8.5px]' },
    lg: { icon: 'w-9 h-9', mark: 36, text: 'text-sm', sub: 'text-[9.5px]' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 3D Depth Logo Mark Container */}
      <div
        className={`relative ${currentSize.icon} rounded-xl flex items-center justify-center transition-transform duration-500 ease-out ${
          interactive ? 'group-hover:[transform:perspective(500px)_rotateY(14deg)_rotateX(-6deg)]' : ''
        } ${
          isDark
            ? 'bg-[#12151e] border border-slate-700/60 shadow-sm shadow-black/40'
            : 'bg-white border border-slate-200/90 shadow-sm shadow-slate-200/50'
        }`}
        style={{
          perspective: '600px',
          transformStyle: 'preserve-3d'
        }}
        aria-hidden="true"
      >
        {/* Subtle Ambient Depth Glow (Calm & Restrained) */}
        <div
          className={`absolute inset-0 rounded-xl opacity-30 pointer-events-none transition-opacity duration-300 ${
            isDark ? 'bg-gradient-to-br from-emerald-500/10 via-transparent to-slate-800/20' : 'bg-gradient-to-br from-emerald-500/5 via-transparent to-slate-100'
          }`}
        />

        {/* Precision Scientific SVG Mark */}
        <svg
          viewBox="0 0 32 32"
          width={currentSize.mark - 8}
          height={currentSize.mark - 8}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform duration-700 ease-in-out"
        >
          {/* Outer Hexagonal Molecular Geometry */}
          <polygon
            points="16,3 27.5,9.5 27.5,22.5 16,29 4.5,22.5 4.5,9.5"
            stroke={isDark ? '#64748b' : '#94a3b8'}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeOpacity="0.8"
          />

          {/* Internal Resonant Chemical Bonds (Subtle) */}
          <line
            x1="16"
            y1="3"
            x2="16"
            y2="10"
            stroke={isDark ? '#475569' : '#cbd5e1'}
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />
          <line
            x1="27.5"
            y1="22.5"
            x2="21.5"
            y2="19"
            stroke={isDark ? '#475569' : '#cbd5e1'}
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />
          <line
            x1="4.5"
            y1="22.5"
            x2="10.5"
            y2="19"
            stroke={isDark ? '#475569' : '#cbd5e1'}
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />

          {/* Precision Orbital Ring */}
          <ellipse
            cx="16"
            cy="16"
            rx="10.5"
            ry="4.2"
            transform="rotate(-28 16 16)"
            stroke={isDark ? '#38bdf8' : '#0284c7'}
            strokeWidth="1.2"
            strokeOpacity="0.8"
            strokeDasharray="1.5 2"
          />

          {/* Central Nucleus Node */}
          <circle
            cx="16"
            cy="16"
            r="2.8"
            fill={isDark ? '#10b981' : '#059669'}
          />
          <circle
            cx="16"
            cy="16"
            r="1.2"
            fill="#ffffff"
          />

          {/* Coordinate Electron Nodes */}
          <circle
            cx="24.5"
            cy="11.5"
            r="1.4"
            fill={isDark ? '#f8fafc' : '#0f172a'}
          />
          <circle
            cx="7.5"
            cy="20.5"
            r="1.4"
            fill={isDark ? '#94a3b8' : '#475569'}
          />
        </svg>
      </div>

      {/* Typography Hierarchy */}
      {showText && (
        <div className="flex flex-col truncate leading-none">
          <div className="flex items-center gap-1">
            <span className={`${currentSize.text} font-bold tracking-wider text-[var(--text-primary)] font-sans truncate`}>
              CHEMSPACE
            </span>
          </div>
          <span className={`${currentSize.sub} font-mono text-[var(--text-muted)] tracking-[0.2em] uppercase font-semibold mt-0.5`}>
            STUDIO
          </span>
        </div>
      )}
    </div>
  );
}
