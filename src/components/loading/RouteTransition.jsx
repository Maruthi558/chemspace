import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { loadingManager } from '../../services/loadingManager';

/**
 * RouteTransition
 * Wraps dynamic route views with a subtle, GPU-accelerated page transition
 * (smooth opacity + micro slide-up) and signals the global route loading indicator.
 */
export default function RouteTransition({ children }) {
  const location = useLocation();

  useEffect(() => {
    // Start global progress indicator on route shift
    loadingManager.start();

    // Settle quickly as new page is mounted and active
    const timer = setTimeout(() => {
      loadingManager.finish();
    }, 120);

    return () => {
      clearTimeout(timer);
      loadingManager.finish();
    };
  }, [location.pathname]);

  return (
    <div
      key={location.pathname}
      className="w-full min-h-full flex-1 flex flex-col animate-in fade-in duration-200 slide-in-from-bottom-1 ease-out fill-mode-forwards"
    >
      {children}
    </div>
  );
}
