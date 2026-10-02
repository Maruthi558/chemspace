import React, { useEffect } from 'react';
import { loadingManager } from '../../services/loadingManager';
import ChemSpaceLoader from '../loading/ChemSpaceLoader';

/**
 * PageLoader
 * Rendered when lazy modules suspend or during slow page loads.
 * Incorporates the unified ChemSpace scientific loader with module-specific status text.
 */
export default function PageLoader({ label = 'Loading ChemSpace Workspace...' }) {
  useEffect(() => {
    loadingManager.start();
    return () => {
      loadingManager.finish();
    };
  }, []);

  return (
    <ChemSpaceLoader
      variant="page"
      size="md"
      label={label}
      sublabel="Synchronizing Molecular Database & Algorithms"
    />
  );
}
