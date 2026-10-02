import React from 'react';
import ChemSpaceLogo from '../ChemSpaceLogo';
import { ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * AuthLayout
 * Refined, minimal, centered scientific authentication layout for ChemNova.
 * Features restrained ambient depth, controlled glass/surface balance,
 * high-contrast typography, and strict visual consistency.
 */
export default function AuthLayout({
  children,
  title = 'Welcome to ChemNova',
  subtitle = 'Sign in to access your scientific AI workstation',
  className = ''
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200 relative select-none ${
        isDark ? 'bg-[#090a0f] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
      }`}
    >
      {/* Background Micro-Grid & Subtle Scientific Glow */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden opacity-30"
        aria-hidden="true"
      >
        <div
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none ${
            isDark ? 'bg-orange-500/5' : 'bg-orange-500/10'
          }`}
        />
        <div
          className={`absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none ${
            isDark ? 'bg-emerald-500/5' : 'bg-emerald-500/10'
          }`}
        />
      </div>

      {/* Centered Authentication Experience Card */}
      <div
        className={`w-full max-w-[420px] rounded-3xl p-7 sm:p-9 shadow-2xl border transition-all relative z-10 space-y-6 ${
          isDark
            ? 'bg-[#111319]/90 border-white/10 shadow-black/60 backdrop-blur-xl'
            : 'bg-white/95 border-slate-200/90 shadow-slate-200/60 backdrop-blur-xl'
        } ${className}`}
      >
        {/* ChemNova Branding & Welcome Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <ChemSpaceLogo
              size="lg"
              showText={true}
              interactive={true}
              brandName="ChemNova"
              subtitle="AI WORKSTATION"
            />
          </div>

          {title && (
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-[320px] mx-auto font-normal">
              {subtitle}
            </p>
          )}
        </div>

        {/* Primary Authentication Interface */}
        <div className="pt-1">
          {children}
        </div>

        {/* Refined Security Watermark */}
        <div className="pt-3 border-t border-[var(--border-subtle)] text-[11px] font-mono text-center text-[var(--text-muted)] flex items-center justify-center gap-1.5 select-none opacity-80">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>End-to-End Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}
