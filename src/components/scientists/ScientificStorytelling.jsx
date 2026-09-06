import React, { useState, useEffect, useRef } from 'react';
import {
  Atom,
  Activity,
  Zap,
  Layers,
  Sparkles,
  Flame,
  Radio,
  Sliders,
  RotateCcw,
  Play,
  Pause,
  Grid
} from 'lucide-react';
import { getFieldColor } from './ScientistPortrait';
import { useTheme } from '../../context/ThemeContext';

/* ─── 1. QUANTUM ORBITAL VISUALIZER ──────────────────────────────────── */
function QuantumOrbitalSimulator({ scientist, accent }) {
  const [selectedOrbital, setSelectedOrbital] = useState('2pz');
  const [isRotating, setIsRotating] = useState(true);
  const canvasRef = useRef(null);

  const orbitals = [
    { id: '1s', label: '1s (Spherical)', n: 1, l: 0, m: 0 },
    { id: '2px', label: '2px (Dumbbell X)', n: 2, l: 1, m: 1 },
    { id: '2py', label: '2py (Dumbbell Y)', n: 2, l: 1, m: -1 },
    { id: '2pz', label: '2pz (Dumbbell Z)', n: 2, l: 1, m: 0 },
    { id: '3dz2', label: '3dz² (Toroid Z)', n: 3, l: 2, m: 0 },
    { id: '3dx2y2', label: '3dx²-y² (Cloverleaf)', n: 3, l: 2, m: 2 }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Coordinate axes
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx - 110, cy); ctx.lineTo(cx + 110, cy);
      ctx.moveTo(cx, cy - 110); ctx.lineTo(cx, cy + 110);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.save();
      ctx.translate(cx, cy);
      if (isRotating) angle += 0.02;
      ctx.rotate(angle);

      // Draw mathematical orbital clouds based on selection
      if (selectedOrbital === '1s') {
        const radGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 75);
        radGrad.addColorStop(0, `${accent}cc`);
        radGrad.addColorStop(0.5, `${accent}55`);
        radGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 75, 0, Math.PI * 2);
        ctx.fill();
      } else if (selectedOrbital.startsWith('2p')) {
        const rotOffset = selectedOrbital === '2px' ? 0 : selectedOrbital === '2py' ? Math.PI / 2 : Math.PI / 4;
        ctx.rotate(rotOffset);

        // Positive lobe
        const gradPos = ctx.createRadialGradient(0, -42, 5, 0, -42, 45);
        gradPos.addColorStop(0, '#38bdf8');
        gradPos.addColorStop(0.7, '#0284c788');
        gradPos.addColorStop(1, 'transparent');
        ctx.fillStyle = gradPos;
        ctx.beginPath();
        ctx.ellipse(0, -40, 26, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Negative lobe
        const gradNeg = ctx.createRadialGradient(0, 42, 5, 0, 42, 45);
        gradNeg.addColorStop(0, '#f43f5e');
        gradNeg.addColorStop(0.7, '#be123c88');
        gradNeg.addColorStop(1, 'transparent');
        ctx.fillStyle = gradNeg;
        ctx.beginPath();
        ctx.ellipse(0, 40, 26, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nodal line
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-60, 0); ctx.lineTo(60, 0);
        ctx.stroke();
      } else {
        // 3d cloverleaf / donut
        for (let i = 0; i < 4; i++) {
          ctx.save();
          ctx.rotate((Math.PI / 2) * i);
          const grad = ctx.createRadialGradient(0, -40, 0, 0, -40, 35);
          grad.addColorStop(0, i % 2 === 0 ? accent : '#ec4899');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(0, -38, 20, 36, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Central nucleus
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [selectedOrbital, isRotating, accent]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <Atom className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="text-xs font-bold text-white">Quantum Harmonic Wavefunction ψ(r, θ, φ)</span>
        </div>
        <button
          type="button"
          onClick={() => setIsRotating(!isRotating)}
          className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-white/10 hover:bg-white/15 text-slate-200 transition flex items-center gap-1"
        >
          {isRotating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span>{isRotating ? 'Pause Rotation' : 'Resume'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Canvas Visualizer */}
        <div className="sm:col-span-2 relative h-[250px] rounded-2xl overflow-hidden flex items-center justify-center border border-cyan-500/30 bg-black/60 shadow-inner">
          <canvas ref={canvasRef} width={280} height={240} className="w-full h-full object-contain" />
          <div className="absolute bottom-2 left-3 text-[10px] font-mono text-cyan-300 bg-black/80 px-2 py-0.5 rounded border border-cyan-500/30">
            Selected: <strong className="text-white">{selectedOrbital}</strong> • |ψ|² Probability Cloud
          </div>
        </div>

        {/* Orbitals Selector */}
        <div className="space-y-2 p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-2">
              Select Atomic Orbital:
            </span>
            <div className="space-y-1.5">
              {orbitals.map(orb => (
                <button
                  key={orb.id}
                  type="button"
                  onClick={() => setSelectedOrbital(orb.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-mono transition flex items-center justify-between ${
                    selectedOrbital === orb.id
                      ? 'bg-cyan-500 text-black font-black shadow-md'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>{orb.label}</span>
                  <span className="text-[9px] opacity-75">l={orb.l}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="text-[9px] text-slate-400 font-sans mt-2 pt-2 border-t border-white/10">
            Blue indicates positive wave phase (+), red negative (-), separated by nodal zero-probability surfaces.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 2. SPECTROSCOPY & FEMTOSECOND LASER BAND ───────────────────────── */
function SpectroscopySimulator({ scientist, accent }) {
  const [pulseDelay, setPulseDelay] = useState(120); // femtoseconds

  // Simulated absorption peaks
  const peaks = [
    { wl: 280, label: 'UV Aromatic π→π*', intensity: 0.95, color: '#a855f7' },
    { wl: 420, label: 'Soret Band (Blue)', intensity: 0.72, color: '#3b82f6' },
    { wl: 532, label: 'Laser Pump (Green)', intensity: 0.88, color: '#10b981' },
    { wl: 650, label: 'Q-Band (Red)', intensity: 0.60, color: '#ef4444' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
          <span className="text-xs font-bold text-white">Ultrafast Pump-Probe Spectroscopy Dynamics</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
            Delay: {pulseDelay} fs (10⁻¹⁵ s)
          </span>
        </div>
      </div>

      {/* Interactive Spectral Continuum Display */}
      <div className="p-4 rounded-2xl border border-white/10 bg-black/60 space-y-3">
        <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span>Ultraviolet (200 nm)</span>
          <span>Visible Spectrum (400 - 700 nm)</span>
          <span>Near-Infrared (900 nm)</span>
        </div>

        {/* Electromagnetic Spectrum Bar */}
        <div
          className="h-9 w-full rounded-xl relative overflow-hidden flex items-center shadow-inner"
          style={{
            background: 'linear-gradient(90deg, #6366f1 0%, #3b82f6 20%, #06b6d4 35%, #10b981 50%, #eab308 65%, #f97316 80%, #ef4444 100%)'
          }}
        >
          {peaks.map((p, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg flex flex-col items-center justify-center cursor-pointer group"
              style={{ left: `${((p.wl - 200) / 700) * 100}%` }}
              title={`${p.label} at ${p.wl} nm`}
            >
              <div className="w-2 h-2 rounded-full bg-white animate-ping" />
              <div className="absolute -top-7 text-[9px] font-mono font-black bg-black text-white px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition">
                {p.wl}nm
              </div>
            </div>
          ))}
        </div>

        {/* Femtosecond Pulse Delay Slider */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Laser Optical Delay:</span>
            <span className="text-cyan-400 font-bold">{pulseDelay} fs</span>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            value={pulseDelay}
            onChange={e => setPulseDelay(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Transition State Oscillation Waveform Preview */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
            Simulated Coherent Wavepacket Signal (Na···I Dissociation):
          </span>
          <div className="h-12 w-full flex items-center gap-1 overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => {
              const val = Math.sin((i + pulseDelay / 15) * 0.4) * 18 + 20;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-all duration-150"
                  style={{
                    height: `${Math.max(4, val)}px`,
                    background: `linear-gradient(to top, ${accent}, #38bdf8)`
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 3. ARRHENIUS KINETICS & REACTION BARRIER ───────────────────────── */
function KineticsSimulator({ scientist, accent }) {
  const [temperature, setTemperature] = useState(300); // Kelvin
  const [activationEnergy, setActivationEnergy] = useState(50); // kJ/mol

  // Arrhenius rate k = A * exp(-Ea / RT)
  const R = 0.008314; // kJ/(mol*K)
  const kRelative = (Math.exp(-activationEnergy / (R * temperature)) * 1e8).toFixed(2);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-bold text-white">Arrhenius Potential Barrier &amp; Reaction Velocity</span>
        </div>
        <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
          Rate Constant k ∝ {kRelative} s⁻¹
        </span>
      </div>

      <div className="p-4 rounded-2xl border border-white/10 bg-black/60 space-y-4">
        {/* SVG Reaction Coordinate Diagram */}
        <div className="relative h-[160px] w-full rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
          <svg viewBox="0 0 400 160" className="w-full h-full">
            {/* Axis */}
            <line x1="30" y1="130" x2="380" y2="130" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            <line x1="30" y1="130" x2="30" y2="20" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

            {/* Reactant state */}
            <line x1="40" y1="90" x2="90" y2="90" stroke="#10b981" strokeWidth="3" />
            <text x="45" y="80" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">Reactants</text>

            {/* Activation Energy Barrier Peak */}
            <path
              d={`M 90 90 Q 200 ${100 - activationEnergy * 1.2} 310 110`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
            />

            {/* Transition State Asterisk */}
            <circle cx="200" cy={100 - activationEnergy * 1.2} r="5" fill="#ef4444" />
            <text x="180" y={85 - activationEnergy * 1.2} fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">
              [Transition State]‡
            </text>

            {/* Product state */}
            <line x1="310" y1="110" x2="360" y2="110" stroke="#38bdf8" strokeWidth="3" />
            <text x="315" y="102" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">Products</text>
          </svg>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Temperature (T):</span>
              <span className="text-amber-400 font-bold">{temperature} K ({(temperature - 273.15).toFixed(0)}°C)</span>
            </div>
            <input
              type="range"
              min="200"
              max="800"
              value={temperature}
              onChange={e => setTemperature(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Activation Energy (Ea):</span>
              <span className="text-amber-400 font-bold">{activationEnergy} kJ/mol</span>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              value={activationEnergy}
              onChange={e => setActivationEnergy(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 4. RADIOACTIVE DECAY PARTICLE EMITTER ──────────────────────────── */
function RadioactiveDecaySimulator({ scientist, accent }) {
  const canvasRef = useRef(null);
  const [decayType, setDecayType] = useState('alpha');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const particles = [];

    const render = () => {
      ctx.fillStyle = 'rgba(5, 8, 15, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Central Parent Nucleus
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Emit new particle
      if (Math.random() < 0.25) {
        const theta = Math.random() * Math.PI * 2;
        const speed = decayType === 'alpha' ? 2.5 : decayType === 'beta' ? 5.5 : 8.0;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(theta) * speed,
          vy: Math.sin(theta) * speed,
          life: 1.0,
          color: decayType === 'alpha' ? '#f59e0b' : decayType === 'beta' ? '#38bdf8' : '#a855f7',
          size: decayType === 'alpha' ? 4 : decayType === 'beta' ? 2.5 : 1.8
        });
      }

      // Update and draw decay particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.015;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) particles.splice(i, 1);
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [decayType]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-orange-400 animate-pulse" />
          <span className="text-xs font-bold text-white">Subatomic Radioactive Particle Emission Chamber</span>
        </div>
        <div className="flex items-center gap-1.5">
          {['alpha', 'beta', 'gamma'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setDecayType(t)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold transition ${
                decayType === t
                  ? 'bg-orange-500 text-black font-black shadow'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              {t} Decay
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[220px] rounded-2xl overflow-hidden border border-orange-500/30 bg-black/70 shadow-inner flex items-center justify-center">
        <canvas ref={canvasRef} width={400} height={220} className="w-full h-full object-contain" />
        <div className="absolute bottom-2 left-3 text-[10px] font-mono text-orange-300 bg-black/80 px-2 py-0.5 rounded border border-orange-500/30">
          Source: Radium-226 • Active Mode: <strong className="uppercase text-white">{decayType} Particles</strong>
        </div>
      </div>
    </div>
  );
}

/* ─── 5. CRYSTALLOGRAPHIC DIFFRACTION & FOURIER CONTOUR SIMULATOR ─────── */
function CrystallographySimulator({ scientist, accent }) {
  const canvasRef = useRef(null);
  const [helixRadius, setHelixRadius] = useState(24);
  const [repeatDistance, setRepeatDistance] = useState(34);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let time = 0;

    const render = () => {
      ctx.fillStyle = 'rgba(6, 9, 16, 0.35)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      time += 0.02;

      // Draw characteristic X-shaped cross diffraction pattern (Photo 51)
      const numRings = 10;
      for (let l = -numRings; l <= numRings; l++) {
        if (l === 0) continue;
        const yOffset = (l * repeatDistance * 0.28);
        const intensity = Math.abs(Math.sin((l * Math.PI) / 4)) * 0.85 + 0.15;
        const spotX = (helixRadius * 1.4 * (l % 2 === 0 ? 1 : -1)) * (l / 2.5);

        // Reflection spots
        ctx.fillStyle = `rgba(56, 189, 248, ${intensity})`;
        ctx.beginPath();
        ctx.arc(cx + spotX, cy + yOffset, 3.5 + intensity * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(56, 189, 248, ${intensity})`;
        ctx.beginPath();
        ctx.arc(cx - spotX, cy + yOffset, 3.5 + intensity * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Central beam stop shadow
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [helixRadius, repeatDistance]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white">X-Ray Diffraction Fourier Transform (B-DNA / Photo 51)</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
          Helical Repeat: {repeatDistance} Å • Radius: {helixRadius} Å
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative h-[240px] rounded-2xl overflow-hidden border border-emerald-500/30 bg-black/70 flex items-center justify-center shadow-inner">
          <canvas ref={canvasRef} width={320} height={240} className="w-full h-full object-contain" />
          <div className="absolute bottom-2 left-3 text-[10px] font-mono text-emerald-300 bg-black/80 px-2 py-0.5 rounded border border-emerald-500/30">
            Characteristic X-Pattern • Bessel Layer Lines (B-DNA Form)
          </div>
        </div>

        <div className="space-y-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between text-xs font-mono">
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span>Helical Radius:</span>
                <span className="text-emerald-400 font-bold">{helixRadius} Å</span>
              </div>
              <input
                type="range"
                min="15"
                max="35"
                value={helixRadius}
                onChange={e => setHelixRadius(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span>Repeat Pitch:</span>
                <span className="text-emerald-400 font-bold">{repeatDistance} Å</span>
              </div>
              <input
                type="range"
                min="25"
                max="45"
                value={repeatDistance}
                onChange={e => setRepeatDistance(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-sans border-t border-white/10 pt-2">
            Fourier transform of an antiparallel double helix yields the characteristic 10-layer X-diffraction envelope discovered by Franklin.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── 6. MASTER STORYTELLING ROUTER ──────────────────────────────────── */
export default function ScientificStorytelling({ scientist }) {
  const fc = getFieldColor(scientist.field);

  // Structural Crystallographers (Franklin, Hodgkin, Pasteur)
  if (scientist.id === 'franklin' || scientist.id === 'hodgkin' || scientist.id === 'pasteur') {
    return <CrystallographySimulator scientist={scientist} accent={fc.accent} />;
  }

  // Quantum Chemistry & Wave Mechanics
  if (scientist.field === 'Quantum Chemistry' || scientist.field === 'Chemical Physics' || scientist.id === 'bohr' || scientist.id === 'schrodinger') {
    return <QuantumOrbitalSimulator scientist={scientist} accent={fc.accent} />;
  }

  // Spectroscopy & Laser Kinetics
  if (scientist.field === 'Analytical & Spectroscopy' || scientist.id === 'zewail' || scientist.id === 'raman') {
    return <SpectroscopySimulator scientist={scientist} accent={fc.accent} />;
  }

  // Nuclear & Radiation Physics
  if (scientist.field === 'Nuclear & Materials' || scientist.id === 'curie' || scientist.id === 'rutherford' || scientist.id === 'seaborg') {
    return <RadioactiveDecaySimulator scientist={scientist} accent={fc.accent} />;
  }

  // Physical Chemistry & default: Kinetics & Activation Barrier
  return <KineticsSimulator scientist={scientist} accent={fc.accent} />;
}
