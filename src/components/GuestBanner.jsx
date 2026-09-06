import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function GuestBanner() {
  const { isGuest } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  if (!isGuest) return null;

  return (
    <div
      className={`w-full mb-4 px-4 py-2.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono transition-all backdrop-blur-md shadow-sm select-none ${
        isDark
          ? 'bg-neutral-900/90 border-neutral-800 text-neutral-200 shadow-black/40'
          : 'bg-white/90 border-neutral-200 text-neutral-800 shadow-neutral-200/50'
      }`}
    >
      <div className="flex items-center gap-2.5 truncate">
        <span
          className={`p-1.5 rounded-xl shrink-0 ${
            isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-black'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
        </span>
        <div className="truncate">
          <span className="font-bold">Guest Exploration Mode Active</span>
          <span className="opacity-70 hidden md:inline">
            {' '}
            — Temporary session. Create an account to unlock saved projects &amp; cloud history.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => navigate('/login?mode=signup')}
          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer ${
            isDark
              ? 'bg-white text-black hover:bg-neutral-200'
              : 'bg-black text-white hover:bg-neutral-800'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Create Account</span>
        </button>

        <button
          onClick={() => navigate('/login')}
          className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition active:scale-95 cursor-pointer ${
            isDark
              ? 'border-neutral-800 text-neutral-300 hover:bg-neutral-800'
              : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <span>Sign In</span>
        </button>
      </div>
    </div>
  );
}
