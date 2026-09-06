import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowRight, UserPlus, LogIn, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function GuestFeatureLockModal({ isOpen, onClose, featureTitle = 'Restricted Feature' }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-6 relative transition-all ${
          isDark
            ? 'bg-[#0f0f11] border-neutral-800 text-white shadow-black/80'
            : 'bg-white border-neutral-200 text-neutral-900 shadow-neutral-400/20'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-xl transition ${
            isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-500 hover:text-black'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Icon Badge */}
        <div className="text-center space-y-3">
          <div
            className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border shadow-sm ${
              isDark
                ? 'bg-neutral-900 border-neutral-700 text-white'
                : 'bg-neutral-100 border-neutral-300 text-neutral-900'
            }`}
          >
            <Lock className="w-7 h-7 stroke-[1.75]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight">
              Create an Account to Unlock
            </h2>
            <p className={`text-xs font-mono ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {featureTitle} requires a verified scientist profile.
            </p>
          </div>
        </div>

        {/* Benefit Bullet points */}
        <div
          className={`p-4 rounded-2xl border text-xs space-y-2 font-mono ${
            isDark ? 'bg-neutral-900/60 border-neutral-800 text-neutral-300' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Save personal research projects &amp; structures</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Maintain persistent calculation history &amp; exports</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Access private cloud workspace &amp; custom settings</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              onClose();
              navigate('/login?mode=signup');
            }}
            className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
              isDark
                ? 'bg-white text-black hover:bg-neutral-200 shadow-md shadow-white/10'
                : 'bg-black text-white hover:bg-neutral-800 shadow-md shadow-black/10'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/login');
            }}
            className={`w-full py-2.5 rounded-2xl font-bold text-xs border flex items-center justify-center gap-2 transition cursor-pointer ${
              isDark
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Existing Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
