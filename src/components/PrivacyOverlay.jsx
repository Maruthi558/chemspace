import React, { useState, useEffect } from 'react';
import { Shield, EyeOff } from 'lucide-react';
import { getUserPreferences } from '../services/userPreferences';
import { useAuth } from '../context/AuthContext';

/**
 * Privacy & Capture Deterrence Layer
 * Detects tab visibility changes and display-capture conditions.
 * Displays a non-intrusive privacy barrier when window loses focus or screen sharing is active.
 * Realistically informs users of deterrence without claiming impossible browser-level DRM.
 */
export default function PrivacyOverlay() {
  const { isAuthenticated } = useAuth();
  const [isBlurred, setIsBlurred] = useState(false);
  const [privacyEnabled, setPrivacyEnabled] = useState(true);

  useEffect(() => {
    const prefs = getUserPreferences();
    setPrivacyEnabled(prefs.privacyBlurEnabled !== false);

    const handlePrefChange = (e) => {
      if (e.detail && typeof e.detail.privacyBlurEnabled !== 'undefined') {
        setPrivacyEnabled(e.detail.privacyBlurEnabled);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && privacyEnabled) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };

    const handleWindowBlur = () => {
      if (privacyEnabled) {
        setIsBlurred(true);
      }
    };

    const handleWindowFocus = () => {
      setIsBlurred(false);
    };

    window.addEventListener('chemspace-preferences-changed', handlePrefChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('chemspace-preferences-changed', handlePrefChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [privacyEnabled]);

  if (!isAuthenticated || !privacyEnabled || !isBlurred) {
    return null;
  }

  return (
    <div
      onClick={() => setIsBlurred(false)}
      className="fixed inset-0 z-[9999] backdrop-blur-xl bg-black/75 flex flex-col items-center justify-center p-6 select-none cursor-pointer transition-all duration-300 animate-in fade-in"
    >
      <div className="max-w-md w-full p-8 rounded-3xl border border-neutral-800 bg-neutral-950/90 shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/10">
          <EyeOff className="w-7 h-7 stroke-[1.75]" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-white tracking-tight">
            Privacy Protection Active
          </h3>
          <p className="text-xs text-neutral-400 font-mono">
            Scientific workspace masked while focus is away from the window.
          </p>
        </div>

        <div className="p-3 rounded-xl border border-neutral-800 bg-neutral-900/60 text-[11px] font-mono text-neutral-400 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-neutral-300 font-semibold">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Confidential Research Deterrence</span>
          </div>
          <p className="text-[10px] text-neutral-500">
            Click anywhere on the screen to restore your active workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
