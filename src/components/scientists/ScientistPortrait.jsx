import React, { useState } from 'react';
import { Eye, ShieldCheck, Cpu } from 'lucide-react';

/* ─── Field Color Map (Refined Neutral Palette) ───────────────────────── */
export const FIELD_COLORS = {
  'Quantum Chemistry':        { accent: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.22)', glow: 'rgba(148,163,184,0.20)' },
  'Physical Chemistry':       { accent: '#a1a1aa', bg: 'rgba(161,161,170,0.10)', border: 'rgba(161,161,170,0.22)', glow: 'rgba(161,161,170,0.20)' },
  'Organic Chemistry':        { accent: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.22)', glow: 'rgba(16,185,129,0.20)' },
  'Inorganic Chemistry':      { accent: '#cbd5e1', bg: 'rgba(203,213,225,0.10)', border: 'rgba(203,213,225,0.22)', glow: 'rgba(203,213,225,0.20)' },
  'Biochemistry':             { accent: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.22)', glow: 'rgba(148,163,184,0.20)' },
  'Analytical & Spectroscopy':{ accent: '#a1a1aa', bg: 'rgba(161,161,170,0.10)', border: 'rgba(161,161,170,0.22)', glow: 'rgba(161,161,170,0.20)' },
  'Computational Chemistry':  { accent: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.22)', glow: 'rgba(148,163,184,0.20)' },
  'Nuclear & Materials':      { accent: '#cbd5e1', bg: 'rgba(203,213,225,0.10)', border: 'rgba(203,213,225,0.22)', glow: 'rgba(203,213,225,0.20)' },
  'Chemical Physics':         { accent: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.22)', glow: 'rgba(148,163,184,0.20)' },
};

export const getFieldColor = (field) =>
  FIELD_COLORS[field] || { accent: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.22)', glow: 'rgba(148,163,184,0.20)' };

/* ─── Animated Quantum Hologram Avatar ───────────────────────────────── */
function QuantumHologramAvatar({ scientist, accent = '#94a3b8', size = 'card' }) {
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
        background: 'radial-gradient(circle at center, rgba(148,163,184,0.12) 0%, #0a0d14 75%, #05070a 100%)'
      }}
    >
      {/* Background Matrix Particle Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      />

      {/* Cyber Scanning Laser Beam */}
      <div
        className="absolute inset-x-0 h-0.5 z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
          boxShadow: '0 0 10px rgba(255,255,255,0.3)',
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
            <feGaussianBlur stdDeviation="2" result="glow" />
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
            stroke="rgba(255,255,255,0.35)"
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
            stroke="rgba(148,163,184,0.4)"
            strokeWidth="1"
            opacity="0.4"
          />
          <circle cx="100" cy="76" r="3" fill="#cbd5e1" filter={`url(#hologram-glow-${scientist.id})`} />
        </g>

        {/* Orbit Ring 3 */}
        <g style={{ transformOrigin: 'center', transform: 'rotate(-60deg)', animation: 'spin 18s linear infinite' }}>
          <ellipse
            cx="100"
            cy="100"
            rx="66"
            ry="22"
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="0.8"
            strokeDasharray="2 4"
            opacity="0.4"
          />
          <circle cx="34" cy="100" r="2.8" fill="#e2e8f0" />
        </g>
      </svg>

      {/* Central Monogram */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div
          className="rounded-full flex items-center justify-center relative transition-transform duration-500 hover:scale-105"
          style={{
            width: isModal ? '110px' : '76px',
            height: isModal ? '110px' : '76px',
            background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.12) 0%, rgba(10,14,22,0.9) 80%)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 0 12px rgba(255,255,255,0.08)'
          }}
        >
          <span
            style={{
              fontSize: isModal ? '2.4rem' : '1.6rem',
              fontWeight: 800,
              color: '#ffffff',
              fontFamily: 'monospace',
              letterSpacing: '0.05em'
            }}
          >
            {initials}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-white/10 bg-black/80 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-slate-300">
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
          <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-black/80 text-slate-200 border border-white/15 backdrop-blur-md">
            <Cpu className="w-2.5 h-2.5 text-slate-400" />
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
        background: 'radial-gradient(circle at top center, rgba(255,255,255,0.06) 0%, #090b10 100%)'
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
              border: '2px solid rgba(255,255,255,0.2)',
              borderTopColor: '#ffffff',
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
          filter: loaded ? 'contrast(1.04) brightness(0.98)' : 'blur(4px)'
        }}
      />

      {/* Subtle laser sweep on hover */}
      <div
        className="absolute inset-x-0 h-0.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          boxShadow: '0 0 8px rgba(255,255,255,0.2)',
          animation: 'scanlineMove 2s ease-in-out infinite alternate'
        }}
      />

      {/* Filmic Vignette & Ambient Gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(3,5,10,0.92) 0%, rgba(3,5,10,0.2) 50%, transparent 100%)'
        }}
      />

      {/* Provenance Badge */}
      {showBadge && (
        <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-black/80 backdrop-blur-md border border-white/15">
          {scientist.isAiPortrait ? (
            <>
              <Cpu className="w-2.5 h-2.5 text-slate-400" />
              <span className="text-slate-300">Illustrative Portrait</span>
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
