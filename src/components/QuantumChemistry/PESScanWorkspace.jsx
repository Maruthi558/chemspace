import React, { useState } from 'react';
import { Activity, Play, RotateCcw, TrendingUp, Info, ChevronRight, Zap } from 'lucide-react';
import { quantumService } from '../../services/quantumService';

export default function PESScanWorkspace({ atoms, coordinates }) {
  const [atom1Idx, setAtom1Idx] = useState(0);
  const [atom2Idx, setAtom2Idx] = useState(1);
  const [startDist, setStartDist] = useState(0.8);
  const [endDist, setEndDist] = useState(2.8);
  const [steps, setSteps] = useState(15);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      const res = await quantumService.computePESScan({
        geometry_atoms: atoms,
        geometry_coords: coordinates,
        atom1_idx: atom1Idx,
        atom2_idx: atom2Idx,
        start_dist: parseFloat(startDist),
        end_dist: parseFloat(endDist),
        steps: parseInt(steps)
      });
      setScanResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="glass-panel rounded-[36px] overflow-hidden border border-white/10 shadow-2xl p-8 bg-slate-900/80 dark:bg-black/80 flex flex-col space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">
              1D Potential Energy Surface (PES) Scanner
            </h2>
            <p className="text-[10px] text-gray-400 font-mono">
              Rigid / Relaxed coordinate scan along chemical bond dissociation coordinate R_AB.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="btn-primary px-6 py-2.5 text-xs font-black rounded-2xl flex items-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          {isScanning ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {isScanning ? 'Computing Scan...' : 'Calculate PES Curve'}
        </button>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Atom 1</label>
          <select
            value={atom1Idx}
            onChange={(e) => setAtom1Idx(parseInt(e.target.value))}
            className="input-control text-xs font-mono font-bold"
          >
            {atoms.map((a, i) => (
              <option key={i} value={i}>{a}#{i + 1}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Atom 2</label>
          <select
            value={atom2Idx}
            onChange={(e) => setAtom2Idx(parseInt(e.target.value))}
            className="input-control text-xs font-mono font-bold"
          >
            {atoms.map((a, i) => (
              <option key={i} value={i}>{a}#{i + 1}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Start (Å)</label>
          <input
            type="number"
            step="0.1"
            value={startDist}
            onChange={(e) => setStartDist(e.target.value)}
            className="input-control text-xs font-mono font-bold"
          />
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">End (Å)</label>
          <input
            type="number"
            step="0.1"
            value={endDist}
            onChange={(e) => setEndDist(e.target.value)}
            className="input-control text-xs font-mono font-bold"
          />
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Points</label>
          <input
            type="number"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            className="input-control text-xs font-mono font-bold"
          />
        </div>
      </div>

      {/* PES Curve & Table View */}
      {scanResult ? (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-black border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest font-mono">
                Potential Energy Profile: {scanResult.atom1} ↔ {scanResult.atom2} Bond Stretch
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                Equilibrium R_e = {scanResult.equilibrium_distance} Å (E_min = {scanResult.equilibrium_energy} E_h)
              </span>
            </div>

            {/* Visual SVG Curve */}
            <div className="h-52 w-full flex items-end justify-between gap-1 pt-6 px-4">
              {scanResult.points.map((pt, i) => {
                const maxRelE = Math.max(...scanResult.points.map((p) => p.relative_energy_ev));
                const minRelE = Math.min(...scanResult.points.map((p) => p.relative_energy_ev));
                const range = maxRelE - minRelE || 1;
                const normalizedHeight = Math.max(12, Math.min(180, ((pt.relative_energy_ev - minRelE) / range) * 160 + 20));
                const isMin = pt.distance_angstrom === scanResult.equilibrium_distance;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        isMin ? 'bg-emerald-400 shadow-[0_0_12px_#10b981]' : 'bg-cyan-500/40 group-hover:bg-cyan-400'
                      }`}
                      style={{ height: `${normalizedHeight}px` }}
                    />
                    <span className="text-[7px] font-mono text-gray-500 mt-1 block group-hover:text-white">
                      {pt.distance_angstrom}
                    </span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[9px] font-mono p-2 rounded-xl border border-white/20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-50 shadow-2xl">
                      <div>R: {pt.distance_angstrom} Å</div>
                      <div>E: {pt.energy_hartree} E_h</div>
                      <div>Rel: {pt.relative_energy_ev} eV</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center border-2 border-dashed border-white/10 rounded-3xl">
          <Activity className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-400 font-mono uppercase font-bold">Configure Scan Parameters &amp; Run</p>
        </div>
      )}
    </div>
  );
}
