import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, signUpWithEmail, signInWithEmail, signInWithGoogle, signOut } from '../services/authService';
import { createUserProfile, getUserProfile } from '../services/firestoreService';

const AuthContext = createContext(null);

/**
 * Provides Firebase Auth state and actions to the entire app.
 * Wrap <App> with this provider.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);          // Firebase Auth user object
  const [profile, setProfile] = useState(null);    // Firestore user profile doc
  const [loading, setLoading] = useState(true);    // true while auth state resolves
  const [error, setError] = useState('');

  // Subscribe to Firebase auth state changes on mount
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setError('');
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch Firestore profile; it may not exist yet for brand-new users
        const prof = await getUserProfile(firebaseUser.uid);
        setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe; // Clean up listener on unmount
  }, []);

  // ── Auth Actions ────────────────────────────────────────────────────────────

  async function handleSignUp(email, password, displayName) {
    setError('');
    setLoading(true);
    try {
      const { user: newUser } = await signUpWithEmail(email, password, displayName);
      // Create the Firestore user profile document
      await createUserProfile(newUser.uid, {
        displayName: displayName || newUser.displayName || '',
        email: newUser.email,
        photoURL: newUser.photoURL || '',
      });
      const prof = await getUserProfile(newUser.uid);
      setProfile(prof);
    } catch (err) {
      setError(formatAuthError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn(email, password) {
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      setError(formatAuthError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setLoading(true);
    try {
      const { user: googleUser } = await signInWithGoogle();
      // Create profile if this is first Google login
      const existing = await getUserProfile(googleUser.uid);
      if (!existing) {
        await createUserProfile(googleUser.uid, {
          displayName: googleUser.displayName || '',
          email: googleUser.email || '',
          photoURL: googleUser.photoURL || '',
        });
      }
      const prof = await getUserProfile(googleUser.uid);
      setProfile(prof);
    } catch (err) {
      setError(formatAuthError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setError('');
    await signOut();
    // onAuthChange listener will clear user/profile state automatically
  }

  // ── Context Value ────────────────────────────────────────────────────────────

  const value = {
    user,           // Firebase Auth user (or null)
    profile,        // Firestore profile doc (or null)
    loading,        // auth state not yet resolved
    error,          // last auth error message
    isAuthenticated: !!user,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithGoogle: handleGoogleSignIn,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context.
 * Must be used inside <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatAuthError(err) {
  const messages = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/unauthorized-domain': 'This domain is not authorized. Contact support.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return messages[err.code] || err.message || 'Authentication failed.';
}
