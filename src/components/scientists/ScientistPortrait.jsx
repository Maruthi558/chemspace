import React, { useState } from 'react';
import { Sparkles, Eye, ShieldCheck, Cpu } from 'lucide-react';

/* ─── Field Color Map ─────────────────────────────────────────────────── */
export const FIELD_COLORS = {
  'Quantum Chemistry':        { accent: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.3)', glow: 'rgba(6,182,212,0.4)' },
  'Physical Chemistry':       { accent: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', glow: 'rgba(245,158,11,0.4)' },
  'Organic Chemistry':        { accent: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', glow: 'rgba(16,185,129,0.4)' },
  'Inorganic Chemistry':      { accent: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', glow: 'rgba(139,92,246,0.4)' },
  'Biochemistry':             { accent: '#ec4899', bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)', glow: 'rgba(236,72,153,0.4)' },
  'Analytical & Spectroscopy':{ accent: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', glow: 'rgba(59,130,246,0.4)' },
  'Computational Chemistry':  { accent: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.3)', glow: 'rgba(6,182,212,0.4)' },
  'Nuclear & Materials':      { accent: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', glow: 'rgba(249,115,22,0.4)' },
  'Chemical Physics':         { accent: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)', glow: 'rgba(168,85,247,0.4)' },
};

export const getFieldColor = (field) =>
  FIELD_COLORS[field] || { accent: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', glow: 'rgba(148,163,184,0.3)' };

/* ─── Animated Quantum Hologram Avatar ───────────────────────────────── */
function QuantumHologramAvatar({ scientist, accent, size = 'card' }) {
  const initials = scientist.name
    .split(' ')
    .filter(n => !['Dr.', 'Prof.', 'Sir', 'Lord', 'Count'].includes(n))
    .map(n => n[0])
    .join('')
    .slice(0, 2);

  const isModal = size === 'modal';

  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden select-none"
      style={{
        background: `radial-gradient(circle at center, ${accent}28 0%, #050811 75%, #020307 100%)`
      }}
    >
      {/* Background Matrix Particle Grid */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${accent} 1px, transparent 1px)`,
          backgroundSize: '16px 16px'
        }}
      />

      {/* Cyber Scanning Laser Beam */}
      <div
        className="absolute inset-x-0 h-1 z-20 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)`,
          boxShadow: `0 0 14px ${accent}`,
          animation: 'scanlineMove 2.8s ease-in-out infinite alternate'
        }}
      />

      {/* Interactive Revolving Quantum Orbits */}
      <svg
        className="absolute w-full h-full pointer-events-none"
        viewBox="0 0 200 200"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <filter id={`hologram-glow-${scientist.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Orbit Ring 1 (Clockwise) */}
        <g style={{ transformOrigin: 'center', animation: 'spin 12s linear infinite' }}>
          <ellipse
            cx="100"
            cy="100"
            rx="74"
            ry="28"
            fill="none"
            stroke={accent}
            strokeWidth="1.2"
            strokeDasharray="4 6"
            opacity="0.6"
          />
          <circle cx="174" cy="100" r="3.5" fill="#ffffff" filter={`url(#hologram-glow-${scientist.id})`} />
        </g>

        {/* Orbit Ring 2 (Tilted) */}
        <g style={{ transformOrigin: 'center', transform: 'rotate(60deg)', animation: 'spinReverse 16s linear infinite' }}>
          <ellipse
            cx="100"
            cy="100"
            rx="70"
            ry="24"
            fill="none"
            stroke={accent}
            strokeWidth="1"
            opacity="0.4"
          />
          <circle cx="100" cy="76" r="3" fill={accent} filter={`url(#hologram-glow-${scientist.id})`} />
        </g>

        {/* Orbit Ring 3 */}
        <g style={{ transformOrigin: 'center', transform: 'rotate(-60deg)', animation: 'spin 18s linear infinite' }}>
          <ellipse
            cx="100"
            cy="100"
            rx="66"
            ry="22"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="0.8"
            strokeDasharray="2 4"
            opacity="0.5"
          />
          <circle cx="34" cy="100" r="2.8" fill="#38bdf8" />
        </g>
      </svg>

      {/* Central Monogram */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div
          className="rounded-full flex items-center justify-center relative transition-transform duration-500 hover:scale-105"
          style={{
            width: isModal ? '110px' : '76px',
            height: isModal ? '110px' : '76px',
            background: `radial-gradient(circle at 35% 35%, ${accent}40 0%, rgba(5,10,20,0.85) 80%)`,
            border: `2px solid ${accent}`,
            boxShadow: `0 0 28px ${accent}60, inset 0 0 16px ${accent}40`
          }}
        >
          <span
            style={{
              fontSize: isModal ? '2.4rem' : '1.6rem',
              fontWeight: 900,
              color: '#ffffff',
              fontFamily: 'monospace',
              textShadow: `0 0 16px ${accent}`
            }}
          >
            {initials}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-white/10 bg-black/70 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: accent }} />
          <span className="text-[9px] font-mono font-bold tracking-widest uppercase" style={{ color: accent }}>
            AI HOLOGRAPHIC MATRIX
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Dual-Mode Scientist Portrait Component ─────────────────────────── */
export default function ScientistPortrait({
  scientist,
  className = '',
  size = 'card',
  mode = 'real', // 'real' | 'animated'
  showBadge = true
}) {
  const [loaded, setLoaded] = useState(false);
  const [urlIndex, setUrlIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  const fc = getFieldColor(scientist.field);
  const photoList = [
    scientist.photo,
    ...(scientist.fallbackPhotos || [])
  ].filter(Boolean);

  const currentPhotoUrl = photoList[urlIndex];

  const handleImageError = () => {
    if (urlIndex + 1 < photoList.length) {
      setUrlIndex(prev => prev + 1);
      setLoaded(false);
    } else {
      setAllFailed(true);
      setLoaded(false);
    }
  };

  // If user selected animated mode, or all images failed, or no image exists:
  if (mode === 'animated' || allFailed || !currentPhotoUrl) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <QuantumHologramAvatar scientist={scientist} accent={fc.accent} size={size} />
        {showBadge && (
          <div className="absolute top-3 left-3 z-30 flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
            <Cpu className="w-2.5 h-2.5" />
            <span>AI Hologram</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden group ${className}`}
      style={{
        background: `radial-gradient(circle at top center, ${fc.accent}20 0%, #070b14 100%)`
      }}
    >
      {/* Loading shimmer indicator */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div
            style={{
              width: size === 'modal' ? '56px' : '36px',
              height: size === 'modal' ? '56px' : '36px',
              borderRadius: '50%',
              border: `3px solid ${fc.accent}`,
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite'
            }}
          />
        </div>
      )}

      {/* Real Archival Portrait Image */}
      <img
        src={currentPhotoUrl}
        alt={`${scientist.name} portrait`}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={handleImageError}
        className="w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-105"
        style={{
          opacity: loaded ? 1 : 0,
          filter: loaded ? 'contrast(1.05) brightness(0.98)' : 'blur(4px)'
        }}
      />

      {/* Subtle laser sweep on hover */}
      <div
        className="absolute inset-x-0 h-0.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${fc.accent}, transparent)`,
          boxShadow: `0 0 10px ${fc.accent}`,
          animation: 'scanlineMove 2s ease-in-out infinite alternate'
        }}
      />

      {/* Filmic Vignette & Ambient Gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(3,5,10,0.95) 0%, rgba(3,5,10,0.2) 50%, transparent 100%)'
        }}
      />

      {/* Provenance Badge */}
      {showBadge && (
        <div className="absolute top-3 left-3 z-30 flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-black/75 backdrop-blur-md border border-white/15">
          {scientist.isAiPortrait ? (
            <>
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span className="text-amber-300">Illustrative Portrait</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-emerald-300">Archival Photo</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
