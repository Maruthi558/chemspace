import React, { useEffect, useState } from 'react';
import { Atom, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LoadingScreen({ onFinish, duration = 1200 }) {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setFading(true);
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 350);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [duration, onFinish]);

  const isDark = theme === 'dark';

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-300 ${
        fading ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      } ${
        isDark
          ? 'bg-black text-white'
          : 'bg-[#f8fafc] text-slate-900'
      } backdrop-blur-3xl select-none`}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            isDark ? 'bg-cyan-500' : 'bg-blue-400'
          }`}
        />
        <div
          className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            isDark ? 'bg-violet-500' : 'bg-indigo-400'
          }`}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center space-y-6">
        {/* Animated Atomic Orbital Core */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Outer rotating pulse ring */}
          <div
            className={`absolute inset-0 rounded-3xl border ${
              isDark ? 'border-white/20 bg-white/5' : 'border-black/10 bg-black/5'
            } animate-spin-slow`}
          />
          {/* Inner atom pulse */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl ${
              isDark
                ? 'bg-white text-black shadow-white/10'
                : 'bg-black text-white shadow-black/20'
            }`}
          >
            <Atom className="w-8 h-8 animate-spin-slow" />
          </div>
        </div>

        {/* Brand & Subtitle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <span className="text-base font-black tracking-widest uppercase">
              CHEMNOVA
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                isDark ? 'bg-white text-black' : 'bg-black text-white'
              }`}
            >
              SCIENTIFIC OS
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono tracking-tight">
            Initializing RDKit 2026 Kernel & WebGL 3D Workspaces...
          </p>
        </div>

        {/* Precision Progress Bar */}
        <div className="w-64 space-y-2">
          <div
            className={`w-full h-1.5 rounded-full overflow-hidden border ${
              isDark
                ? 'bg-white/10 border-white/10'
                : 'bg-black/10 border-black/10'
            }`}
          >
            <div
              className={`h-full transition-all duration-75 rounded-full ${
                isDark ? 'bg-white' : 'bg-black'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>CALCULATING MATRICES</span>
            <span className="font-bold text-slate-400">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
