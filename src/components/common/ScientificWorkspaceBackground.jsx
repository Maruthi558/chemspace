import React, { useId } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

/**
 * ScientificWorkspaceBackground
 * 
 * Adaptive 5-Layer Precision Scientific Environment across the entire ChemSpace platform.
 * Dynamically adjusts subtle background geometry depending on the active workspace:
 * - Home: Full rich atmospheric scientific vellum / optical bench
 * - ChemDraw: Precision CAD drafting grid with 120° bond angle guidelines
 * - RDKit Lab: Computational notebook matrix with molecular descriptor datum
 * - Spectroscopy: Frequency baseline and vibrational wavenumber harmonics
 * - Periodic Table: Elemental block matrix and electron shell guidelines
 * - Quantum DFT: Orbital wavefunction probability lobes & HOMO-LUMO energy lines
 * - IBM RXN: Retrosynthetic disconnection arrows & reaction energy profiles
 * - General Workspaces: Minimalist Cartesian coordinate ticks and bench borders
 */
export default function ScientificWorkspaceBackground({ forcedMode = null }) {
  const { theme } = useTheme();
  const location = useLocation();
  const isDark = theme === 'dark';
  const patternId = useId();

  const pathname = forcedMode || location.pathname;

  // Determine workspace identity
  let workspace = 'general';
  if (pathname === '/' || pathname === '/home') workspace = 'home';
  else if (pathname.startsWith('/chemdraw')) workspace = 'chemdraw';
  else if (pathname.startsWith('/rdkit-lab')) workspace = 'rdkit';
  else if (pathname.startsWith('/spectroscopy')) workspace = 'spectroscopy';
  else if (pathname.startsWith('/periodic-table')) workspace = 'periodic';
  else if (pathname.startsWith('/quantum')) workspace = 'quantum';
  else if (pathname.startsWith('/ibm-rxn')) workspace = 'rxn';
  else if (pathname.startsWith('/chromatography')) workspace = 'chromatography';

  const strokeColor = isDark ? 'rgba(226, 232, 240, 0.055)' : 'rgba(30, 41, 59, 0.05)';
  const accentStroke = isDark ? 'rgba(249, 115, 22, 0.12)' : 'rgba(234, 88, 12, 0.09)';
  const emeraldStroke = isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(5, 150, 105, 0.09)';
  const fillSubtle = isDark ? 'rgba(226, 232, 240, 0.015)' : 'rgba(30, 41, 59, 0.015)';
  const textFaint = isDark ? 'rgba(148, 163, 184, 0.07)' : 'rgba(71, 85, 105, 0.07)';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 transition-colors duration-500"
      style={{
        backgroundColor: isDark ? '#0a0c10' : '#faf8f5'
      }}
    >
      {/* ───────────────────────────────────────────────────────────────────────
          LAYER 1 & 2: TONAL VARIATION & AMBIENT SOFT LIGHT FIELD
         ─────────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: isDark
            ? `radial-gradient(120% 80% at 50% -10%, rgba(20, 24, 36, 0.95) 0%, rgba(10, 12, 16, 0.98) 60%, rgba(8, 9, 13, 1) 100%)`
            : `radial-gradient(120% 85% at 50% -5%, rgba(246, 243, 235, 0.85) 0%, rgba(250, 248, 245, 0.98) 65%, rgba(244, 240, 230, 0.5) 100%)`
        }}
      />

      {/* Top-Right Restrained Warm Glow (ChemSpace Orange Accent) */}
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-opacity duration-700"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(249, 115, 22, 0.04) 0%, transparent 75%)'
            : 'radial-gradient(circle, rgba(234, 88, 12, 0.028) 0%, transparent 75%)'
        }}
      />

      {/* Bottom-Left Soft Emerald / Slate Counter-Balance */}
      <div
        className="absolute -bottom-48 -left-48 w-[550px] h-[550px] rounded-full blur-[150px] pointer-events-none transition-opacity duration-700"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.025) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(240, 235, 220, 0.35) 0%, transparent 70%)'
        }}
      />

      {/* ───────────────────────────────────────────────────────────────────────
          LAYER 3: 1PX CARTESIAN COORDINATE PRECISION GRID
         ─────────────────────────────────────────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={`grid-${patternId}`}
            width={workspace === 'chemdraw' ? '48' : '80'}
            height={workspace === 'chemdraw' ? '48' : '80'}
            patternUnits="userSpaceOnUse"
          >
            {/* Fine 1px tick marks at grid intersections */}
            <path
              d={
                workspace === 'chemdraw'
                  ? 'M 24 21 L 24 27 M 21 24 L 27 24'
                  : 'M 40 37 L 40 43 M 37 40 L 43 40'
              }
              stroke={isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(30, 41, 59, 0.038)'}
              strokeWidth="0.75"
            />
            {/* Center dot */}
            <circle
              cx={workspace === 'chemdraw' ? 24 : 40}
              cy={workspace === 'chemdraw' ? 24 : 40}
              r="0.75"
              fill={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(30, 41, 59, 0.05)'}
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill={`url(#grid-${patternId})`} />
      </svg>

      {/* ───────────────────────────────────────────────────────────────────────
          LAYER 4: WORKSPACE-SPECIFIC FAINT SCIENTIFIC VECTOR GEOMETRY
         ─────────────────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <svg
          viewBox="0 0 1600 1000"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 1. BENZENE DELOCALIZATION RING (Universal Subtle Chemistry Anchor) */}
          <g transform="translate(1320, 100)">
            <polygon
              points="50,0 100,28.8 100,86.6 50,115.4 0,86.6 0,28.8"
              fill={fillSubtle}
              stroke={strokeColor}
              strokeWidth="1.1"
            />
            <circle
              cx="50"
              cy="57.7"
              r="28"
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.9"
              strokeDasharray="3.5 2.5"
            />
            {[
              [50, 0], [100, 28.8], [100, 86.6], [50, 115.4], [0, 86.6], [0, 28.8]
            ].map(([x, y], idx) => (
              <circle key={idx} cx={x} cy={y} r="1.8" fill={strokeColor} />
            ))}
            <line x1="50" y1="0" x2="50" y2="-22" stroke={strokeColor} strokeWidth="0.9" />
            <text x="56" y="-10" fill={textFaint} fontSize="8" fontFamily="monospace">CHEMSPACE</text>
          </g>

          {/* 2. CHEMDRAW WORKSPACE: Drafting Angles & Bond Calibrations */}
          {workspace === 'chemdraw' && (
            <g transform="translate(80, 140)">
              {/* 120-degree bond projection angle */}
              <line x1="50" y1="50" x2="110" y2="15" stroke={strokeColor} strokeWidth="1" />
              <line x1="50" y1="50" x2="110" y2="85" stroke={strokeColor} strokeWidth="1" />
              <line x1="50" y1="50" x2="0" y2="50" stroke={strokeColor} strokeWidth="1" />
              <path d="M 80 32 A 35 35 0 0 1 80 68" fill="none" stroke={accentStroke} strokeWidth="0.8" strokeDasharray="2 2" />
              <text x="86" y="53" fill={textFaint} fontSize="8" fontFamily="monospace">120.0°</text>
              <text x="12" y="42" fill={textFaint} fontSize="7" fontFamily="monospace">CAD // CADENCE</text>
            </g>
          )}

          {/* 3. RDKIT LABORATORY: Computational REPL & Conformer Coordinate Lines */}
          {workspace === 'rdkit' && (
            <g transform="translate(70, 160)">
              <rect x="0" y="0" width="130" height="60" rx="6" fill={fillSubtle} stroke={strokeColor} strokeWidth="0.8" />
              <text x="12" y="22" fill={accentStroke} fontSize="9" fontFamily="monospace">In [1]:</text>
              <text x="55" y="22" fill={textFaint} fontSize="8" fontFamily="monospace">Chem.MolFromSmiles()</text>
              <text x="12" y="44" fill={emeraldStroke} fontSize="9" fontFamily="monospace">Out[1]:</text>
              <text x="55" y="44" fill={textFaint} fontSize="8" fontFamily="monospace">RDKit::Mol(3D Conformer)</text>
              <line x1="12" y1="30" x2="118" y2="30" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="2 2" />
            </g>
          )}

          {/* 4. SPECTROSCOPY: Baseline Wavenumber Spectrum Wave */}
          {workspace === 'spectroscopy' && (
            <g transform="translate(180, 860)">
              <line x1="0" y1="40" x2="320" y2="40" stroke={strokeColor} strokeWidth="0.8" />
              <path
                d="M 0 40 Q 50 40 80 38 T 120 35 T 145 37 T 170 8 T 176 2 T 182 8 T 205 38 T 240 32 T 260 16 T 272 36 T 320 40"
                fill="none"
                stroke={accentStroke}
                strokeWidth="1"
              />
              <text x="160" y="-8" fill={textFaint} fontSize="8" fontFamily="monospace">ν (1715 cm⁻¹ C=O)</text>
              <text x="260" y="54" fill={textFaint} fontSize="8" fontFamily="monospace">FTIR // RESOLUTION 0.5 cm⁻¹</text>
            </g>
          )}

          {/* 5. PERIODIC TABLE: Element Box Chips Matrix */}
          {workspace === 'periodic' && (
            <g transform="translate(640, 70)">
              {['H', 'He', 'Li', 'Be', 'B', 'C'].map((sym, idx) => (
                <g key={sym} transform={`translate(${idx * 48}, 0)`}>
                  <rect x="0" y="0" width="42" height="42" rx="4" fill="none" stroke={strokeColor} strokeWidth="0.8" />
                  <text x="5" y="11" fill={textFaint} fontSize="7" fontFamily="monospace">{idx + 1}</text>
                  <text x="14" y="27" fill={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(30,41,59,0.08)'} fontSize="14" fontWeight="bold" fontFamily="sans-serif">{sym}</text>
                </g>
              ))}
            </g>
          )}

          {/* 6. QUANTUM DFT: Molecular Orbital Probability Contours */}
          {workspace === 'quantum' && (
            <g transform="translate(1180, 720)">
              <ellipse cx="60" cy="30" rx="14" ry="24" transform="rotate(-30 60 30)" fill={fillSubtle} stroke={strokeColor} strokeWidth="1" />
              <ellipse cx="90" cy="60" rx="14" ry="24" transform="rotate(60 90 60)" fill={fillSubtle} stroke={strokeColor} strokeWidth="1" />
              <ellipse cx="60" cy="90" rx="14" ry="24" transform="rotate(-30 60 90)" fill={fillSubtle} stroke={strokeColor} strokeWidth="1" />
              <ellipse cx="30" cy="60" rx="14" ry="24" transform="rotate(60 30 60)" fill={fillSubtle} stroke={strokeColor} strokeWidth="1" />
              <text x="56" y="34" fill={textFaint} fontSize="10" fontFamily="monospace">+</text>
              <text x="86" y="64" fill={textFaint} fontSize="10" fontFamily="monospace">−</text>
              <text x="56" y="94" fill={textFaint} fontSize="10" fontFamily="monospace">+</text>
              <text x="26" y="64" fill={textFaint} fontSize="10" fontFamily="monospace">−</text>
              <text x="80" y="105" fill={textFaint} fontSize="8" fontFamily="monospace">ψ(d_xy) • ΔE(HOMO-LUMO)</text>
            </g>
          )}

          {/* 7. IBM RXN: Retrosynthetic Transform Double Arrows */}
          {workspace === 'rxn' && (
            <g transform="translate(80, 680)">
              <path d="M 10 20 L 70 20 M 10 26 L 70 26" stroke={accentStroke} strokeWidth="1.2" />
              <path d="M 62 14 L 76 23 L 62 32" fill="none" stroke={accentStroke} strokeWidth="1.2" />
              <circle cx="95" cy="23" r="14" fill="none" stroke={strokeColor} strokeWidth="0.9" strokeDasharray="3 2" />
              <text x="89" y="27" fill={textFaint} fontSize="10" fontFamily="monospace">d¹</text>
              <text x="12" y="12" fill={textFaint} fontSize="8" fontFamily="monospace">RETROSYNTHESIS // DISCONNECTION</text>
            </g>
          )}

          {/* 8. GENERAL / HOME: Tetrahedral Carbon & Calibrated Scale */}
          {(workspace === 'home' || workspace === 'general') && (
            <>
              {/* Tetrahedral sp3 Carbon */}
              <g transform="translate(90, 140)">
                <circle cx="50" cy="50" r="3" fill={accentStroke} />
                <line x1="50" y1="50" x2="50" y2="12" stroke={strokeColor} strokeWidth="1.1" />
                <line x1="50" y1="50" x2="18" y2="76" stroke={strokeColor} strokeWidth="1.1" />
                <polygon points="50,50 82,68 80,76" fill={strokeColor} opacity="0.6" />
                <path d="M 50 32 A 18 18 0 0 0 35 60" fill="none" stroke={accentStroke} strokeWidth="0.8" strokeDasharray="2 2" />
                <text x="18" y="44" fill={textFaint} fontSize="8" fontFamily="monospace">109.5°</text>
                <text x="56" y="16" fill={textFaint} fontSize="9" fontFamily="monospace">sp³</text>
              </g>

              {/* Cyclohexane Chair Conformation */}
              <g transform="translate(1380, 520)">
                <path d="M 0 45 L 35 15 L 85 15 L 120 45 L 85 75 L 35 75 Z" fill="none" stroke={strokeColor} strokeWidth="1.1" />
                <line x1="0" y1="45" x2="0" y2="20" stroke={strokeColor} strokeWidth="0.8" />
                <line x1="35" y1="15" x2="35" y2="-10" stroke={strokeColor} strokeWidth="0.8" />
                <line x1="85" y1="15" x2="85" y2="40" stroke={strokeColor} strokeWidth="0.8" />
                <line x1="120" y1="45" x2="120" y2="70" stroke={strokeColor} strokeWidth="0.8" />
                <text x="44" y="49" fill={textFaint} fontSize="8" fontFamily="monospace">chair</text>
              </g>
            </>
          )}

          {/* Scale Calibration Datum Bar */}
          <g transform="translate(80, 960)">
            <line x1="0" y1="0" x2="60" y2="0" stroke={strokeColor} strokeWidth="1" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke={strokeColor} strokeWidth="1" />
            <line x1="60" y1="-3" x2="60" y2="3" stroke={strokeColor} strokeWidth="1" />
            <text x="14" y="-6" fill={textFaint} fontSize="8" fontFamily="monospace">5.0 Å</text>
          </g>
        </svg>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          LAYER 5: SUBTLE DEPTH VIGNETTE
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
