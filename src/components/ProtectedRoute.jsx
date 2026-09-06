import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Atom } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Route Guard: Intercepts unauthenticated navigation attempts
 * Allows both authenticated users and guest users while preserving the intended location.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isGuest, loading } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <div className={`min-h-screen w-full flex flex-col items-center justify-center font-sans select-none transition-colors ${
        isDark ? 'bg-[#08080a] text-white' : 'bg-[#f8f9fa] text-neutral-900'
      }`}>
        <div className="relative flex items-center justify-center mb-4">
          <div className={`w-16 h-16 rounded-3xl border flex items-center justify-center shadow-xl ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white shadow-black/60' : 'bg-white border-neutral-200 text-black shadow-neutral-300/40'
          }`}>
            <Atom className="w-8 h-8 animate-spin-slow stroke-[1.75]" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-[11px] font-mono uppercase tracking-widest font-bold opacity-60">
            SECURE AUTHENTICATION
          </span>
          <span className="text-xs font-semibold opacity-90">
            Verifying Researcher Session...
          </span>
        </div>
      </div>
    );
  }

  // If neither authenticated nor in active guest mode, redirect to login
  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
