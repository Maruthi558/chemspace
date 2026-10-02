import React, { useEffect, useState } from 'react';
import { loadingManager } from '../../services/loadingManager';

/**
 * GlobalLoadingBar
 * High-precision scientific laser progress indicator fixed to the top viewport edge.
 * Provides subtle real-time feedback during route changes and background network activity.
 */
export default function GlobalLoadingBar() {
  const [state, setState] = useState({ isLoading: false, progress: 0 });

  useEffect(() => {
    const unsubscribe = loadingManager.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  if (!state.isLoading && state.progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-hidden="true"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(state.progress)}
      className="fixed top-0 left-0 right-0 z-[999999] h-[2.5px] pointer-events-none overflow-hidden bg-transparent"
    >
      <div
        className="relative h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-300 shadow-[0_0_14px_rgba(249,115,22,0.9)] transition-all ease-out"
        style={{
          width: `${state.progress}%`,
          opacity: state.progress === 100 ? 0 : 1,
          transitionDuration: state.progress === 100 ? '250ms' : '150ms'
        }}
      >
        {/* Leading edge laser flare */}
        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white opacity-80" />
      </div>
    </div>
  );
}
