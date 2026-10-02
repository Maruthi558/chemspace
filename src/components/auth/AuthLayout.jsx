import React from 'react';
import ChemSpaceLogo from '../ChemSpaceLogo';
import { ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function AuthLayout({
  children,
  title,
  subtitle,
  className = ''
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200 relative ${
        isDark
          ? 'bg-[#090a0f] text-slate-100'
          : 'bg-[#f8fafc] text-slate-900'
      }`}
    >
      {/* reCAPTCHA container for Phone Auth (must not have display:none) */}
      <div id="recaptcha-container" />

      {/* Subtle Ambient Background Gradients */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            isDark ? 'bg-emerald-600/30' : 'bg-emerald-400/20'
          }`}
        />
        <div
          className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            isDark ? 'bg-teal-600/20' : 'bg-teal-300/20'
          }`}
        />
      </div>

      {/* Centered Authentication Card */}
      <div
        className={`w-full max-w-[420px] rounded-2xl p-6 sm:p-8 shadow-xl border transition-all relative z-10 space-y-6 ${
          isDark
            ? 'bg-[#111319]/90 border-white/10 shadow-black/40 backdrop-blur-md'
            : 'bg-white border-slate-200/80 shadow-slate-200/50 backdrop-blur-md'
        } ${className}`}
      >
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <ChemSpaceLogo size="lg" showText={true} interactive={true} />
          </div>

          {title && (
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form & Children Content */}
        {children}

        {/* Security / Laboratory Watermark */}
        <div className="pt-2 border-t border-[var(--border-subtle)] text-[10.5px] font-mono text-center text-[var(--text-muted)] flex items-center justify-center gap-1.5 select-none">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Encrypted Laboratory Identity • chemistry1-e2723</span>
        </div>
      </div>
    </div>
  );
}
