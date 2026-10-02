import React, { useEffect, useState } from 'react';
import ChemSpaceLoader from './loading/ChemSpaceLoader';

/**
 * LoadingScreen
 * Backwards-compatible fullscreen loader wrapper forwarding to the unified ChemSpaceLoader.
 */
export default function LoadingScreen({ onFinish, isReady = true }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (isReady) {
      setFading(true);
      const timer = setTimeout(() => {
        if (onFinish) onFinish();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isReady, onFinish]);

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
        sublabel="Laboratory Core Engine"
      />
    </div>
  );
}
