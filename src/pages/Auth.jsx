import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';

/**
 * Auth Page — ChemNova Scientific Authentication
 * Strict scope: Centered, minimal, professional authentication experience
 * featuring ONLY:
 * 1. Continue with Google
 * 2. Continue with Microsoft
 * 3. Continue with Apple
 */
export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isAuthenticated,
    signInWithGoogle,
    signInWithMicrosoft,
    signInWithApple
  } = useAuth();

  // Redirect destination
  const fromDestination = location.state?.from?.pathname || '/dashboard';

  // If already authenticated with an active session, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate(fromDestination, { replace: true });
    }
  }, [isAuthenticated, navigate, fromDestination]);

  // Loading & Error States
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [error, setError] = useState('');

  /**
   * Unified real-time OAuth provider sign-in handler.
   * Immediately tracks execution without artificial delays.
   */
  async function handleProviderSignIn(providerName, authFn) {
    setError('');
    setLoadingProvider(providerName);

    try {
      const res = await authFn({
        workplace: 'ChemNova Research Institute',
        role: 'Research Chemist'
      });

      if (res) {
        navigate(fromDestination, { replace: true });
      }
    } catch (err) {
      console.warn(`[ChemNova Auth] ${providerName} notice:`, err.code || err.message);

      // Handle user-cancelled popups gracefully without intimidating error banners
      if (
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request' ||
        err.message?.includes('closed-by-user')
      ) {
        // User voluntarily dismissed popup
        setError('');
      } else if (
        err.message &&
        (err.message.includes('not yet enabled') ||
          err.message.includes('configuration not found') ||
          err.code === 'auth/operation-not-allowed')
      ) {
        const titleCaseProvider = providerName.charAt(0).toUpperCase() + providerName.slice(1);
        setError(`${titleCaseProvider} sign-in is currently undergoing verification for this workspace.`);
      } else {
        setError(err.message || `Sign in with ${providerName} could not be completed.`);
      }
    } finally {
      setLoadingProvider(null);
    }
  }

  return (
    <AuthLayout
      title="Welcome to ChemNova"
      subtitle="Sign in to access your scientific AI workstation"
    >
      {/* Contextual Error Message Banner */}
      {error && (
        <div
          className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-150"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{error}</p>
        </div>
      )}

      {/* The 3 Exclusive Authentication Methods */}
      <SocialAuthButtons
        onGoogleSignIn={() => handleProviderSignIn('google', signInWithGoogle)}
        onMicrosoftSignIn={() => handleProviderSignIn('microsoft', signInWithMicrosoft)}
        onAppleSignIn={() => handleProviderSignIn('apple', signInWithApple)}
        loadingProvider={loadingProvider}
      />
    </AuthLayout>
  );
}
