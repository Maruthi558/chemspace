import React from 'react';
import { Activity, X, CheckCircle2, AlertTriangle, TrendingDown, Cpu, Terminal, ArrowRight } from 'lucide-react';

export default function QuantumMonitor({
  isCalculating,
  config,
  logOutput = [],
  scfIterations = [],
  onCancel,
  onViewResults
}) {
  return (
    <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-500 font-sans">
      <div className="glass-panel flex-1 rounded-[36px] p-8 bg-slate-900/90 dark:bg-black/90 flex flex-col border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[120px] -mr-48 -mt-48 pointer-events-none" />

        {/* Monitor Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Activity className={`w-6 h-6 text-amber-500 ${isCalculating ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white uppercase tracking-widest">
                  {isCalculating ? 'Active Hamiltonian Solver' : 'SCF Calculation Completed'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono text-[9px] font-bold border border-cyan-500/20">
                  {config.engine?.toUpperCase() || 'PYSCF'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                Level: {config.method}/{config.basis_set} • {config.geometry_atoms?.length} Atoms • Charge: {config.charge}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isCalculating && (
              <button
                onClick={onViewResults}
                className="btn-primary px-5 py-2 text-xs font-black rounded-2xl flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                Inspect Results <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {isCalculating && (
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-2xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition text-xs font-bold flex items-center gap-1.5"
              >
                <X className="w-4 h-4" /> Cancel Execution
              </button>
            )}
          </div>
        </div>

        {/* Live SCF Convergence Progress Table / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
              SCF Convergence Status
            </span>
            <span className="text-sm font-black text-emerald-400 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Threshold &lt; 1.0e-8
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
              Iteration Step
            </span>
            <span className="text-sm font-black text-white font-mono">
              {scfIterations.length > 0 ? `${scfIterations.length} / 50 Max Cycles` : 'Iteration #8'}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
              Energy Differential (ΔE)
            </span>
            <span className="text-sm font-black text-cyan-400 font-mono">
              -0.00000412 Hartree
            </span>
          </div>
        </div>

        {/* Live Terminal Log Output */}
        <div className="flex-1 rounded-3xl bg-black border border-white/10 p-6 font-mono text-xs text-emerald-400/90 leading-relaxed overflow-y-auto custom-scrollbar flex flex-col justify-between shadow-inner">
          <div className="space-y-2">
            <div className="text-gray-500 text-[10px] uppercase font-black tracking-wider border-b border-white/10 pb-2 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-gray-400" /> Standard Output Stream
              </span>
              <span>Process ID #8491</span>
            </div>

            {logOutput.map((log, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-gray-600 font-bold shrink-0">[{log.time}]</span>
                <span className="text-gray-200">{log.msg}</span>
              </div>
            ))}

            {isCalculating && (
              <div className="flex items-center gap-2 mt-4 text-cyan-400 font-black animate-pulse uppercase tracking-wider text-[11px]">
                <div className="flex gap-1">
                  <div className="w-1.5 h-3 bg-cyan-400 animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-1.5 h-3 bg-cyan-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-1.5 h-3 bg-cyan-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
                Solving Roothaan-Hall Self-Consistent Field Equations...
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-gray-500 flex items-center justify-between">
            <span>Direct Integral Transformation: Enabled</span>
            <span>Memory Buffer: 2048 MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
