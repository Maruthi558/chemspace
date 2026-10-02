import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChemSpaceLoader from './loading/ChemSpaceLoader';

/**
 * Route Guard: Intercepts unauthenticated navigation attempts
 * Allows both authenticated users and guest users while preserving the intended location.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <ChemSpaceLoader
        variant="fullscreen"
        size="lg"
        label="Verifying Secure Researcher Session..."
        sublabel="Cloud Cryptographic Token Authentication"
      />
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
