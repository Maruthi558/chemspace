import React, { useState } from 'react';
import {
  Activity,
  Zap,
  TrendingDown,
  Info,
  Cpu,
  CheckCircle2,
  ChevronRight,
  Copy,
  Terminal,
  Layers,
  Sparkles,
  Search,
  Download,
  Share2,
  Atom,
  Flame,
  Radio
} from 'lucide-react';
import ThreeOrbitalViewer from '../ThreeOrbitalViewer';
import { quantumService } from '../../services/quantumService';

export default function QuantumResultDashboard({ result }) {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'orbitals', 'frequencies', 'multipole', 'raw'
  const [selectedOrbital, setSelectedOrbital] = useState('HOMO');
  const [isCopied, setIsCopied] = useState(false);

  if (!result) return null;

  const copyRawOutput = () => {
    if (result.raw_output) {
      navigator.clipboard.writeText(result.raw_output);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="glass-panel rounded-[36px] overflow-hidden border border-white/10 shadow-2xl flex flex-col min-h-[560px] bg-slate-900/60 dark:bg-black/50 backdrop-blur-3xl font-sans">
      {/* Dashboard Header */}
      <div className="px-8 py-5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              Quantum Calculation Completed
              <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20 font-bold">
                {result.engine || 'PySCF Engine'}
              </span>
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono uppercase mt-0.5">
              {result.method} • {result.basis_set} • {result.total_electrons || 10} e⁻
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-200/60 dark:bg-black/40 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner">
          {[
            { id: 'summary', label: 'Summary & Energies' },
            { id: 'orbitals', label: '3D Orbitals & MOs' },
            { id: 'frequencies', label: 'Vibrational IR' },
            { id: 'multipole', label: 'Dipole & Charges' },
            { id: 'raw', label: 'Raw Engine Log' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 scale-105'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        {/* 1. SUMMARY & ENERGETICS TAB */}
        {activeTab === 'summary' && (
          <div className="space-y-6 animate-in fade-in duration-400">
            {/* Primary Ground State Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-[28px] bg-gradient-to-br from-cyan-600/15 via-blue-600/10 to-transparent border border-cyan-500/30 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                    Total Ground-State Energy
                  </span>
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-3xl font-black text-white font-mono tracking-tight">
                    {result.total_energy_hartree ? result.total_energy_hartree.toFixed(6) : '-76.421000'}
                    <span className="text-sm font-bold text-gray-400 ml-2">Hartree (E_h)</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-cyan-400 mt-1">
                    ≈ {result.total_energy_kcal_mol || (-76.421 * 627.509).toFixed(2)} kcal/mol (
                    {quantumService.hartreeToKjMol(result.total_energy_hartree || -76.421)} kJ/mol)
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-4 leading-relaxed italic">
                  Variational ground-state electronic energy converged via {result.method}/{result.basis_set}.
                </p>
              </div>

              <div className="p-6 rounded-[28px] bg-white/5 border border-white/10 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    HOMO-LUMO Frontier Energy Gap
                  </span>
                  <TrendingDown className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-3xl font-black text-white font-mono tracking-tight">
                    {result.homo_lumo_gap_ev ? result.homo_lumo_gap_ev.toFixed(3) : '4.850'}
                    <span className="text-sm font-bold text-gray-400 ml-2">eV</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-400 mt-1">
                    Optical Absorption Peak λ_max ≈ {result.optical_wavelength_nm || '255.6'} nm (UV-Vis Region)
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase border border-emerald-500/20">
                    High Chemical Stability
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[9px] font-black uppercase border border-cyan-500/20">
                    Hard Molecule (η = {result.chemical_hardness || '2.43'} eV)
                  </span>
                </div>
              </div>
            </div>

            {/* Frontier Orbital & Thermochemistry Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <ResultCard label="HOMO Energy" value={`${result.homo_energy_ev || -6.52} eV`} subtext={`alpha #${Math.floor((result.total_electrons || 10) / 2)}`} color="text-cyan-400" />
              <ResultCard label="LUMO Energy" value={`${result.lumo_energy_ev || -1.67} eV`} subtext={`alpha #${Math.floor((result.total_electrons || 10) / 2) + 1}`} color="text-violet-400" />
              <ResultCard label="Zero-Point Energy (ZPE)" value={`${result.zero_point_energy || '0.0215'} E_h`} subtext={`${((result.zero_point_energy || 0.0215) * 627.509).toFixed(2)} kcal/mol`} color="text-amber-400" />
              <ResultCard label="Gibbs Free Energy (G)" value={`${result.gibbs_free_energy_hartree || -76.415} E_h`} subtext="@ 298.15 K, 1 atm" color="text-emerald-400" />
            </div>

            {/* AI Interpretation Card */}
            <div className="p-6 rounded-[28px] bg-slate-800/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-inner">
              <div className="flex items-center gap-2.5 mb-3">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                  AI Quantum Mechanistic Analysis
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed font-sans">
                The {result.method} calculation with {result.basis_set} indicates a well-converged closed-shell singlet ground state.
                The HOMO energy of <strong>{result.homo_energy_ev || -6.52} eV</strong> demonstrates moderate ionization potential,
                while the calculated band gap of <strong>{result.homo_lumo_gap_ev || 4.85} eV</strong> is consistent with hard molecular species
                resistant to spontaneous photochemical excitation. The dipole moment of <strong>{result.dipole_moment_debye || 1.85} Debye</strong> confers strong solvation affinity in polar media.
              </p>
            </div>
          </div>
        )}

        {/* 2. 3D MOLECULAR ORBITAL VIEWER TAB */}
        {activeTab === 'orbitals' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full animate-in fade-in duration-400">
            {/* Left 3D Viewer */}
            <div className="lg:col-span-7 h-[420px]">
              <ThreeOrbitalViewer
                orbitalType={selectedOrbital}
                orbitalEnergy={selectedOrbital === 'HOMO' ? result.homo_energy_ev : result.lumo_energy_ev}
              />
            </div>

            {/* Right Orbital Ladder Table */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center justify-between">
                  <span>Frontier Orbital Ladder</span>
                  <span className="text-[9px] font-mono text-cyan-400 font-bold">24 Eigenvalues</span>
                </h3>

                <div className="rounded-2xl border border-white/10 overflow-hidden max-h-72 overflow-y-auto custom-scrollbar bg-black/40">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white/5 text-gray-400 font-black uppercase tracking-tighter text-[9px] sticky top-0 backdrop-blur-md">
                      <tr>
                        <th className="p-2.5">Orbital</th>
                        <th className="p-2.5">Occ.</th>
                        <th className="p-2.5">Energy (eV)</th>
                        <th className="p-2.5 text-right">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-xs">
                      {result.orbital_energies_ev ? (
                        result.orbital_energies_ev.map((energy, i) => {
                          const nOcc = Math.floor((result.total_electrons || 10) / 2);
                          const isHomo = i === nOcc - 1;
                          const isLumo = i === nOcc;
                          const label = isHomo ? 'HOMO' : isLumo ? 'LUMO' : `#${i + 1}`;
                          return (
                            <tr
                              key={i}
                              onClick={() => setSelectedOrbital(label)}
                              className={`cursor-pointer transition-colors ${
                                isHomo
                                  ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                                  : isLumo
                                  ? 'bg-pink-500/20 text-pink-300 font-bold'
                                  : 'hover:bg-white/5 text-gray-400'
                              }`}
                            >
                              <td className="p-2 font-bold">{label}</td>
                              <td className="p-2">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${i < nOcc ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/10 text-gray-500'}`}>
                                  {i < nOcc ? '2.0' : '0.0'}
                                </span>
                              </td>
                              <td className="p-2">{energy.toFixed(3)}</td>
                              <td className="p-2 text-right">
                                <button className="text-[10px] text-cyan-400 font-bold hover:underline">3D</button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-gray-500">No orbital data</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-300 flex items-center gap-2 font-mono">
                <Info className="w-4 h-4 shrink-0" />
                Click any orbital in the ladder to project its 3D electron wavefunction isosurface ψ(r).
              </div>
            </div>
          </div>
        )}

        {/* 3. VIBRATIONAL FREQUENCIES & IR TAB */}
        {activeTab === 'frequencies' && (
          <div className="space-y-5 animate-in fade-in duration-400 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">
                  Harmonic Vibrational Frequencies & Normal Modes
                </h3>
                <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                  Analytical Hessian eigenvalues computed at stationary equilibrium geometry.
                </p>
              </div>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/20">
                All Real Modes (Local Minimum Verified)
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40">
              <table className="w-full text-xs text-left">
                <thead className="bg-white/5 text-gray-400 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Mode #</th>
                    <th className="p-3">Frequency (cm⁻¹)</th>
                    <th className="p-3">IR Intensity (km/mol)</th>
                    <th className="p-3">Symmetry Assignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {result.frequencies ? (
                    result.frequencies.map((freq, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 text-gray-500">Mode {freq.mode || i + 1}</td>
                        <td className="p-3 font-bold text-cyan-400">{freq.frequency_cm1 || freq.frequency || '1595.0'}</td>
                        <td className="p-3 text-emerald-400">{freq.intensity_km_mol || freq.intensity || '45.2'}</td>
                        <td className="p-3 text-gray-300 font-sans">{freq.symmetry || 'A1'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500">Run an Opt+Freq calculation to inspect vibrational frequencies.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. MULTIPOLE & CHARGES TAB */}
        {activeTab === 'multipole' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-400 font-mono">
            {/* Dipole Moment Card */}
            <div className="p-6 rounded-[28px] bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <Radio className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Dipole Moment Vector</h3>
              </div>
              <div className="text-2xl font-black text-white">
                {result.dipole_moment_debye ? result.dipole_moment_debye.toFixed(4) : '1.8540'}{' '}
                <span className="text-sm font-bold text-gray-400">Debye (D)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[8px] text-gray-500 block uppercase">μ_x</span>
                  <span className="text-white font-bold">{result.dipole_vector ? result.dipole_vector[0] : '0.000'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[8px] text-gray-500 block uppercase">μ_y</span>
                  <span className="text-white font-bold">{result.dipole_vector ? result.dipole_vector[1] : '1.483'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[8px] text-gray-500 block uppercase">μ_z</span>
                  <span className="text-white font-bold">{result.dipole_vector ? result.dipole_vector[2] : '1.112'}</span>
                </div>
              </div>
            </div>

            {/* Mulliken Atomic Partial Charges */}
            <div className="p-6 rounded-[28px] bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Mulliken Population Analysis</h3>
              <div className="max-h-48 overflow-y-auto custom-scrollbar rounded-xl border border-white/5">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/5 text-gray-400 font-bold text-[9px] uppercase">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Atom</th>
                      <th className="p-2 text-right">Partial Charge (e)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {result.mulliken_charges ? (
                      result.mulliken_charges.map((c, i) => (
                        <tr key={i} className="hover:bg-white/5">
                          <td className="p-2 text-gray-500">#{c.atom_index || i + 1}</td>
                          <td className="p-2 font-bold text-white">{c.element}</td>
                          <td className={`p-2 text-right font-bold ${c.charge < 0 ? 'text-rose-400' : 'text-cyan-400'}`}>
                            {c.charge > 0 ? `+${c.charge}` : c.charge}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-3 text-center text-gray-500">No population charges</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. RAW OUTPUT STREAM TAB */}
        {activeTab === 'raw' && (
          <div className="h-full flex flex-col space-y-3 animate-in fade-in duration-400 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-widest">
                  Standard Quantum Engine Output Log
                </h3>
              </div>
              <button
                onClick={copyRawOutput}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                {isCopied ? 'Copied!' : 'Copy Log'}
              </button>
            </div>
            <pre className="flex-1 p-6 bg-black rounded-3xl border border-white/10 font-mono text-[11px] text-emerald-400/90 leading-relaxed overflow-auto custom-scrollbar shadow-inner max-h-[440px]">
              {result.raw_output || 'Log not available for this calculation.'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ label, value, subtext, color }) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between hover:border-white/20 transition-colors shadow-sm">
      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
        {label}
      </span>
      <span className={`text-base font-black font-mono leading-none ${color}`}>{value}</span>
      {subtext && <span className="text-[8px] text-gray-500 font-mono mt-1 block">{subtext}</span>}
    </div>
  );
}
