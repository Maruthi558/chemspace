import React, { useId } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * ScientificLayeredBackground
 * 
 * 5-Layer Precision Scientific Environment designed exclusively for the ChemSpace Home Page.
 * 
 * Layer 1: Premium cream / milk-white base (Light) / Deep graphite & charcoal (Dark).
 * Layer 2: Subtle tonal variations & soft ivory translucent surfaces (Warm paper vellum feel).
 * Layer 3: Ultra-refined translucent scientific geometry (Cartesian coordinate grid, crosshairs, ticks).
 * Layer 4: Faint chemistry-inspired vector symbols (Benzene pi-ring, chair conformation, tetrahedral wedge/dash bonds,
 *          wavefunction psi contours, retrosynthesis arrows, atomic coordinate chips).
 * Layer 5: Subtle depth & ambient light interaction (Vignette falloff, controlled slow drift).
 */
export default function ScientificLayeredBackground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const patternId = useId();

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 transition-colors duration-500"
      style={{
        backgroundColor: isDark ? '#0a0c10' : '#faf8f5'
      }}
    >
      {/* ───────────────────────────────────────────────────────────────────────
          LAYER 1 & 2: TONAL VARIATION & SOFT IVORY / GRAPHITE SURFACES
          Simulates luxury scientific vellum paper in light mode,
          and a dark graphite optical bench in dark mode.
         ─────────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: isDark
            ? `radial-gradient(120% 80% at 50% -10%, rgba(20, 24, 36, 0.95) 0%, rgba(10, 12, 16, 0.98) 60%, rgba(8, 9, 13, 1) 100%)`
            : `radial-gradient(120% 85% at 50% -5%, rgba(246, 243, 235, 0.9) 0%, rgba(250, 248, 245, 0.98) 65%, rgba(244, 240, 230, 0.6) 100%)`
        }}
      />

      {/* Ambient Warmth Accent (Upper-Right Light Field) */}
      <div
        className="absolute -top-32 -right-32 w-[680px] h-[680px] rounded-full blur-[140px] pointer-events-none transition-opacity duration-700"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(249, 115, 22, 0.04) 0%, rgba(16, 185, 129, 0.02) 60%, transparent 80%)'
            : 'radial-gradient(circle, rgba(234, 88, 12, 0.028) 0%, rgba(245, 238, 224, 0.4) 50%, transparent 80%)'
        }}
      />

      {/* Subtle Counter-Balance Ambient Falloff (Lower-Left) */}
      <div
        className="absolute -bottom-48 -left-48 w-[640px] h-[640px] rounded-full blur-[160px] pointer-events-none transition-opacity duration-700"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.025) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(240, 235, 220, 0.45) 0%, transparent 75%)'
        }}
      />

      {/* ───────────────────────────────────────────────────────────────────────
          LAYER 3: ULTRA-REFINED TRANSLUCENT SCIENTIFIC GEOMETRY
          1px Cartesian coordinate grid with micro crosshairs & precision ticks.
         ─────────────────────────────────────────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 96px x 96px Laboratory Coordinate Grid Cell */}
          <pattern
            id={`grid-${patternId}`}
            width="96"
            height="96"
            patternUnits="userSpaceOnUse"
          >
            {/* Fine 1px tick marks at grid intersections */}
            <path
              d="M 48 44 L 48 52 M 44 48 L 52 48"
              stroke={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(30, 41, 59, 0.05)'}
              strokeWidth="0.8"
            />
            {/* Center microscopic dot */}
            <circle
              cx="48"
              cy="48"
              r="0.8"
              fill={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(30, 41, 59, 0.07)'}
            />
            {/* Corner hairline alignment ticks */}
            <path
              d="M 0 0 L 4 0 M 0 0 L 0 4 M 96 0 L 92 0 M 96 0 L 96 4 M 0 96 L 4 96 M 0 96 L 0 92 M 96 96 L 92 96 M 96 96 L 96 92"
              stroke={isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(30, 41, 59, 0.035)'}
              strokeWidth="0.6"
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill={`url(#grid-${patternId})`} />
      </svg>

      {/* ───────────────────────────────────────────────────────────────────────
          LAYER 4: FAINT CHEMISTRY-INSPIRED VECTORS & MOLECULAR GEOMETRY
          Precision SVG drawings at 4%–7% opacity.
          Slow, organic drift animation (90s) for a calm, alive feel.
         ─────────────────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none scientific-background-motion">
        <svg
          viewBox="0 0 1600 1000"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Global Vector Color Tokens */}
          {(() => {
            const strokeColor = isDark ? 'rgba(226, 232, 240, 0.06)' : 'rgba(30, 41, 59, 0.065)';
            const accentStroke = isDark ? 'rgba(249, 115, 22, 0.12)' : 'rgba(234, 88, 12, 0.10)';
            const fillSubtle = isDark ? 'rgba(226, 232, 240, 0.02)' : 'rgba(30, 41, 59, 0.02)';
            const textFaint = isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(71, 85, 105, 0.08)';

            return (
              <g>
                {/* 1. BENZENE PI-ELECTRON DELOCALIZATION RING (Top Right Quadrant) */}
                <g transform="translate(1240, 110)">
                  {/* Outer Hexagonal Skeletal Ring */}
                  <polygon
                    points="60,0 120,34.6 120,104 60,138.6 0,104 0,34.6"
                    fill={fillSubtle}
                    stroke={strokeColor}
                    strokeWidth="1.2"
                  />
                  {/* Inner Conjugated Aromatic Pi-Electron Circle */}
                  <circle
                    cx="60"
                    cy="69.3"
                    r="34"
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1"
                    strokeDasharray="4 3"
                  />
                  {/* Carbon Vertex Nodes */}
                  {[
                    [60, 0], [120, 34.6], [120, 104], [60, 138.6], [0, 104], [0, 34.6]
                  ].map(([x, y], idx) => (
                    <circle key={idx} cx={x} cy={y} r="2" fill={strokeColor} />
                  ))}
                  {/* Faint Stereochemical Bond Projection Line */}
                  <line x1="60" y1="0" x2="60" y2="-28" stroke={strokeColor} strokeWidth="1" />
                  <line x1="120" y1="104" x2="144" y2="118" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" />
                  <text x="66" y="-12" fill={textFaint} fontSize="9" fontFamily="monospace">R-1</text>
                  <text x="44" y="73" fill={textFaint} fontSize="10" fontFamily="monospace">6π</text>
                </g>

                {/* 2. TETRAHEDRAL SP3 CARBON VERTEX (Top Left Negative Space) */}
                <g transform="translate(90, 140)">
                  {/* Central Node */}
                  <circle cx="50" cy="50" r="3" fill={accentStroke} />
                  {/* Planar Bonds */}
                  <line x1="50" y1="50" x2="50" y2="12" stroke={strokeColor} strokeWidth="1.2" />
                  <line x1="50" y1="50" x2="18" y2="76" stroke={strokeColor} strokeWidth="1.2" />
                  {/* Solid Wedge Bond (projecting forward) */}
                  <polygon points="50,50 82,68 80,76" fill={strokeColor} opacity="0.6" />
                  {/* Dashed Wedge Bond (projecting backward) */}
                  <g stroke={strokeColor} strokeWidth="1.2">
                    <line x1="44" y1="44" x2="42" y2="40" />
                    <line x1="39" y1="36" x2="35" y2="30" />
                    <line x1="32" y1="26" x2="26" y2="18" />
                  </g>
                  {/* 109.5° Bond Angle Arc */}
                  <path
                    d="M 50 32 A 18 18 0 0 0 35 60"
                    fill="none"
                    stroke={accentStroke}
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                  />
                  <text x="18" y="44" fill={textFaint} fontSize="8" fontFamily="monospace">109.5°</text>
                  <text x="56" y="16" fill={textFaint} fontSize="9" fontFamily="monospace">sp³</text>
                </g>

                {/* 3. CYCLOHEXANE CHAIR CONFORMATION (Right Center Workspace Margin) */}
                <g transform="translate(1380, 520)">
                  {/* Chair skeletal path */}
                  <path
                    d="M 0 45 L 35 15 L 85 15 L 120 45 L 85 75 L 35 75 Z"
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1.2"
                  />
                  {/* Axial C-H Bonds (Vertical) */}
                  <line x1="0" y1="45" x2="0" y2="18" stroke={strokeColor} strokeWidth="0.9" />
                  <line x1="35" y1="15" x2="35" y2="-12" stroke={strokeColor} strokeWidth="0.9" />
                  <line x1="85" y1="15" x2="85" y2="42" stroke={strokeColor} strokeWidth="0.9" />
                  <line x1="120" y1="45" x2="120" y2="72" stroke={strokeColor} strokeWidth="0.9" />
                  <line x1="85" y1="75" x2="85" y2="102" stroke={strokeColor} strokeWidth="0.9" />
                  <line x1="35" y1="75" x2="35" y2="48" stroke={strokeColor} strokeWidth="0.9" />
                  <text x="44" y="49" fill={textFaint} fontSize="9" fontFamily="monospace">chair</text>
                </g>

                {/* 4. RETROSYNTHESIS DISCONNECTION ARROW (Left Mid-Lower) */}
                <g transform="translate(70, 680)">
                  {/* Double Synthetic Transform Arrow */}
                  <path
                    d="M 10 20 L 70 20 M 10 26 L 70 26"
                    stroke={accentStroke}
                    strokeWidth="1.2"
                  />
                  <path
                    d="M 62 14 L 76 23 L 62 32"
                    fill="none"
                    stroke={accentStroke}
                    strokeWidth="1.2"
                  />
                  {/* Precursor Synthons Indicator */}
                  <circle cx="95" cy="23" r="14" fill="none" stroke={strokeColor} strokeWidth="0.9" strokeDasharray="3 2" />
                  <text x="89" y="27" fill={textFaint} fontSize="10" fontFamily="monospace">d¹</text>
                  <text x="12" y="12" fill={textFaint} fontSize="8" fontFamily="monospace">RETRO-SYNTHESIS</text>
                </g>

                {/* 5. MULTI-MODAL SPECTROSCOPIC VIBRATIONAL WAVEFORM (Bottom Center-Left) */}
                <g transform="translate(240, 890)">
                  {/* Baseline Axis */}
                  <line x1="0" y1="40" x2="260" y2="40" stroke={strokeColor} strokeWidth="0.8" />
                  {/* Simulated FTIR Carbonyl C=O Peak & Fingerprint Deconvolution */}
                  <path
                    d="M 0 40 Q 40 40 60 38 T 90 35 T 110 37 T 130 10 T 135 4 T 140 10 T 155 38 T 190 32 T 205 18 T 215 36 T 260 40"
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1.1"
                  />
                  {/* Wavenumber Tick & Peak Identifier */}
                  <line x1="135" y1="4" x2="135" y2="-8" stroke={accentStroke} strokeWidth="0.7" strokeDasharray="2 2" />
                  <text x="120" y="-12" fill={textFaint} fontSize="8" fontFamily="monospace">1715 cm⁻¹ (C=O)</text>
                  <text x="210" y="52" fill={textFaint} fontSize="8" fontFamily="monospace">ν (cm⁻¹)</text>
                </g>

                {/* 6. QUANTUM ORBITAL WAVEFUNCTION LOBES (Bottom Right Quadrant) */}
                <g transform="translate(1120, 760)">
                  {/* dx²-y² Quadrupole Orbital Probability Iso-surfaces */}
                  <ellipse cx="60" cy="30" rx="14" ry="24" transform="rotate(-30 60 30)" fill={fillSubtle} stroke={strokeColor} strokeWidth="1" />
                  <ellipse cx="90" cy="60" rx="14" ry="24" transform="rotate(60 90 60)" fill={fillSubtle} stroke={strokeColor} strokeWidth="1" />
                  <ellipse cx="60" cy="90" rx="14" ry="24" transform="rotate(-30 60 90)" fill={fillSubtle} stroke={strokeColor} strokeWidth="1" />
                  <ellipse cx="30" cy="60" rx="14" ry="24" transform="rotate(60 30 60)" fill={fillSubtle} stroke={strokeColor} strokeWidth="1" />
                  {/* Orbital Phase signs */}
                  <text x="56" y="34" fill={textFaint} fontSize="10" fontFamily="monospace">+</text>
                  <text x="86" y="64" fill={textFaint} fontSize="10" fontFamily="monospace">−</text>
                  <text x="56" y="94" fill={textFaint} fontSize="10" fontFamily="monospace">+</text>
                  <text x="26" y="64" fill={textFaint} fontSize="10" fontFamily="monospace">−</text>
                  <text x="96" y="96" fill={textFaint} fontSize="8" fontFamily="monospace">ψ(d_xy)</text>
                </g>

                {/* 7. AUTHENTIC PERIODIC TABLE COORDINATE CHIPS */}
                <g transform="translate(680, 80)">
                  <rect x="0" y="0" width="44" height="42" rx="4" fill="none" stroke={strokeColor} strokeWidth="0.8" />
                  <text x="5" y="11" fill={textFaint} fontSize="7" fontFamily="monospace">6</text>
                  <text x="14" y="26" fill={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(30,41,59,0.09)'} fontSize="14" fontWeight="bold" fontFamily="sans-serif">C</text>
                  <text x="5" y="37" fill={textFaint} fontSize="7" fontFamily="monospace">12.011</text>
                </g>
                <g transform="translate(732, 80)">
                  <rect x="0" y="0" width="44" height="42" rx="4" fill="none" stroke={strokeColor} strokeWidth="0.8" />
                  <text x="5" y="11" fill={textFaint} fontSize="7" fontFamily="monospace">7</text>
                  <text x="14" y="26" fill={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(30,41,59,0.09)'} fontSize="14" fontWeight="bold" fontFamily="sans-serif">N</text>
                  <text x="5" y="37" fill={textFaint} fontSize="7" fontFamily="monospace">14.007</text>
                </g>
                <g transform="translate(784, 80)">
                  <rect x="0" y="0" width="44" height="42" rx="4" fill="none" stroke={strokeColor} strokeWidth="0.8" />
                  <text x="5" y="11" fill={textFaint} fontSize="7" fontFamily="monospace">8</text>
                  <text x="14" y="26" fill={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(30,41,59,0.09)'} fontSize="14" fontWeight="bold" fontFamily="sans-serif">O</text>
                  <text x="5" y="37" fill={textFaint} fontSize="7" fontFamily="monospace">15.999</text>
                </g>

                {/* 8. CARTESIAN DATUM LABELS & SCALE CALIBRATION */}
                <g transform="translate(80, 960)">
                  <line x1="0" y1="0" x2="60" y2="0" stroke={strokeColor} strokeWidth="1" />
                  <line x1="0" y1="-3" x2="0" y2="3" stroke={strokeColor} strokeWidth="1" />
                  <line x1="60" y1="-3" x2="60" y2="3" stroke={strokeColor} strokeWidth="1" />
                  <text x="16" y="-6" fill={textFaint} fontSize="8" fontFamily="monospace">5.0 Å</text>
                </g>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          LAYER 5: SUBTLE DEPTH & AMBIENT EDGE LIGHT INTERACTION
          Adds a faint vignette that anchors the content workspace.
         ─────────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          boxShadow: isDark
            ? 'inset 0 0 120px rgba(0, 0, 0, 0.65)'
            : 'inset 0 0 100px rgba(220, 212, 195, 0.25)'
        }}
      />
    </div>
  );
}
