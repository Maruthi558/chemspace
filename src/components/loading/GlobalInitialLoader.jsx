import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ChemSpaceLoader from './ChemSpaceLoader';

/**
 * GlobalInitialLoader
 * Displays the ChemSpace global loading animation on initial application boot.
 * Fades away smoothly as soon as the real authentication and workspace session are ready.
 * ZERO fake fixed timeout delay.
 */
export default function GlobalInitialLoader() {
  const { loading: authLoading } = useAuth();
  const [fading, setFading] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      // Start smooth fade-out as soon as real auth state is resolved
      setFading(true);
      const timer = setTimeout(() => {
        setUnmounted(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  if (unmounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden={fading}
    >
      <ChemSpaceLoader
        variant="fullscreen"
        size="lg"
        label="Initializing ChemSpace Molecular Workspace..."
      />
    </div>
  );
}
