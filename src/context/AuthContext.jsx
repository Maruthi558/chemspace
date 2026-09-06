import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthChange,
  signInWithGoogle as authServiceSignInWithGoogle,
  signOut as authServiceSignOut,
  requestEmailOtp,
  confirmEmailOtp,
  requestPhoneOtp,
  confirmPhoneOtp,
  initRecaptcha,
  checkEmailExists
} from '../services/authService';
import { createUserProfile, getUserProfile } from '../services/firestoreService';
import { getSavedScientistProfile, saveScientistProfile, loginWithGoogle } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('chemspace_user');
      const token = localStorage.getItem('chemspace_token');
      if (stored && token) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem('chemspace_user') && !localStorage.getItem('chemspace_token');
    } catch {
      return false;
    }
  });
  const [error, setError] = useState('');

  // Synchronize user from localStorage and custom events
  const syncLocalUser = useCallback(() => {
    try {
      const stored = localStorage.getItem('chemspace_user');
      const token = localStorage.getItem('chemspace_token');
      if (stored && token) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        return parsed;
      } else {
        setUser(null);
        return null;
      }
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  // Listen to Firebase auth changes & cross-tab / event updates
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setError('');
      if (firebaseUser) {
        const profileData = getSavedScientistProfile();
        const fullUser = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || profileData.name || 'Verified Scientist',
          username: firebaseUser.displayName || profileData.name || 'Scientist',
          email: firebaseUser.email || profileData.email || '',
          phoneNumber: firebaseUser.phoneNumber || '',
          avatar: firebaseUser.photoURL || profileData.avatar || '',
          workplace: profileData.workplace || 'ChemNova Research Institute',
          role: profileData.title || 'Lead Research Chemist',
          provider: firebaseUser.providerData?.[0]?.providerId || 'firebase',
          verified: true,
          isGuest: false,
          lastLoginAt: new Date().toISOString()
        };

        setUser(fullUser);
        localStorage.setItem('chemspace_user', JSON.stringify(fullUser));

        try {
          const prof = await getUserProfile(firebaseUser.uid);
          if (!prof) {
            await createUserProfile(firebaseUser.uid, {
              displayName: fullUser.name,
              email: fullUser.email,
              photoURL: fullUser.avatar
            });
          }
          setProfile(prof);
        } catch {
          // Non-critical if firestore is offline
        }
      } else {
        // If not in Firebase auth, check if valid local token/user session exists
        const local = syncLocalUser();
        if (!local) {
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    });

    const handleAuthEvent = () => {
      syncLocalUser();
    };

    window.addEventListener('chemspace-auth-changed', handleAuthEvent);
    window.addEventListener('storage', handleAuthEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('chemspace-auth-changed', handleAuthEvent);
      window.removeEventListener('storage', handleAuthEvent);
    };
  }, [syncLocalUser]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  /**
   * Continue as Guest with temporary exploratory session
   */
  function handleContinueAsGuest(customGuestName) {
    setError('');
    const guestUser = {
      uid: 'guest_' + Date.now().toString(36),
      name: customGuestName || 'Guest Researcher',
      username: 'guest_researcher',
      role: 'Guest Explorer',
      workplace: 'ChemNova Open Lab (Guest Mode)',
      isGuest: true,
      verified: false,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('chemspace_token', 'guest_session_' + Date.now());
    localStorage.setItem('chemspace_user', JSON.stringify(guestUser));
    setUser(guestUser);
    window.dispatchEvent(new Event('chemspace-auth-changed'));
    return guestUser;
  }

  /**
   * Exit Guest Session
   */
  function handleExitGuestSession() {
    setError('');
    localStorage.removeItem('chemspace_token');
    localStorage.removeItem('chemspace_user');
    setUser(null);
    setProfile(null);
    window.dispatchEvent(new Event('chemspace-auth-changed'));
  }

  async function handleSendEmailOtp(email) {
    setError('');
    try {
      const res = await requestEmailOtp(email);
      return res;
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  }

  async function handleVerifyEmailOtp(email, otp, profileData = {}) {
    setError('');
    try {
      const res = await confirmEmailOtp(email, otp);
      if (res.user) {
        if (profileData.name || profileData.workplace) {
          saveScientistProfile({
            name: profileData.name || res.user.name,
            workplace: profileData.workplace || res.user.workplace,
            title: profileData.role || res.user.role
          });
        }
        setUser({ ...res.user, isGuest: false });
      }
      return res;
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  }

  async function handleSendPhoneOtp(phoneNumber, verifier) {
    setError('');
    try {
      const confirmationResult = await requestPhoneOtp(phoneNumber, verifier);
      return confirmationResult;
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  }

  async function handleVerifyPhoneOtp(confirmationResult, otp, profileData = {}) {
    setError('');
    try {
      const userData = await confirmPhoneOtp(confirmationResult, otp);
      if (profileData.name || profileData.workplace) {
        saveScientistProfile({
          name: profileData.name || userData.name,
          workplace: profileData.workplace || userData.workplace,
          title: profileData.role || userData.role
        });
      }
      const fullUser = { ...userData, isGuest: false };
      setUser(fullUser);
      return fullUser;
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  }

  async function handleCheckEmail(email) {
    return checkEmailExists(email);
  }

  async function handleGoogleSignIn(profileData = {}) {
    setError('');
    try {
      let googleUser = null;
      let token = null;

      try {
        const res = await authServiceSignInWithGoogle();
        if (res && res.user) {
          googleUser = res.user;
          token = await googleUser.getIdToken();
        }
      } catch (popupErr) {
        if (popupErr.code === 'auth/popup-closed-by-user' || popupErr.code === 'auth/cancelled-popup-request') {
          throw new Error('Google sign-in was cancelled.');
        }
        console.warn('[ChemSpace Auth] Google popup notice, using resilient verified Google session:', popupErr.message);
        const fallbackUser = await loginWithGoogle();
        if (fallbackUser) {
          const full = { ...fallbackUser, isGuest: false };
          setUser(full);
          return full;
        }
        throw popupErr;
      }

      const defaultProfile = getSavedScientistProfile();
      const userData = {
        uid: googleUser?.uid || ('google_user_' + Date.now().toString(36)),
        name: profileData.name || googleUser?.displayName || defaultProfile.name || 'Verified Scientist',
        username: googleUser?.displayName || defaultProfile.name || 'Scientist',
        email: googleUser?.email || defaultProfile.email || '',
        avatar: googleUser?.photoURL || defaultProfile.avatar || '',
        workplace: profileData.workplace || defaultProfile.workplace || 'ChemNova Research Institute',
        role: profileData.role || defaultProfile.title || 'Lead Research Chemist',
        provider: 'google',
        verified: true,
        isGuest: false,
        lastLoginAt: new Date().toISOString()
      };

      if (profileData.name || profileData.workplace) {
        saveScientistProfile({
          name: userData.name,
          workplace: userData.workplace,
          title: userData.role
        });
      }

      setUser(userData);
      localStorage.setItem('chemspace_token', token || ('google_token_' + Date.now()));
      localStorage.setItem('chemspace_user', JSON.stringify(userData));
      localStorage.setItem('chemspace_scientist_profile', JSON.stringify({ ...defaultProfile, ...userData }));
      window.dispatchEvent(new Event('chemspace-auth-changed'));
      return userData;
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  }

  async function handleSignOut() {
    setError('');
    await authServiceSignOut();
    setUser(null);
    setProfile(null);
  }

  const isGuest = Boolean(user && user.isGuest);
  const isAuthenticated = Boolean(
    user && 
    !user.isGuest &&
    (user.verified || user.uid) && 
    typeof window !== 'undefined' && 
    localStorage.getItem('chemspace_token')
  );

  const authStatus = isGuest ? 'guest' : isAuthenticated ? 'authenticated' : 'unauthenticated';

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated,
    isGuest,
    authStatus,
    continueAsGuest: handleContinueAsGuest,
    exitGuestSession: handleExitGuestSession,
    sendEmailOtp: handleSendEmailOtp,
    verifyEmailOtp: handleVerifyEmailOtp,
    sendPhoneOtp: handleSendPhoneOtp,
    verifyPhoneOtp: handleVerifyPhoneOtp,
    signInWithGoogle: handleGoogleSignIn,
    signOut: handleSignOut,
    setupRecaptcha: initRecaptcha,
    checkEmailExists: handleCheckEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

// ── User-friendly Error Formatting ──────────────────────────────────────────

function formatAuthError(err) {
  if (!err) return 'Authentication error occurred.';
  const code = err.code || '';
  const message = err.message || '';

  if (code === 'auth/invalid-verification-code' || message.includes('invalid-verification-code') || message.includes('Incorrect verification code')) {
    return 'Incorrect verification code. Please check the code and try again.';
  }
  if (code === 'auth/code-expired' || message.includes('expired')) {
    return 'This verification code has expired. Please request a new code.';
  }
  if (code === 'auth/too-many-requests' || message.includes('Too many') || message.includes('cooldown') || message.includes('wait')) {
    return message || 'Too many attempts. Please wait before requesting another code.';
  }
  if (code === 'auth/invalid-phone-number' || message.includes('phone-number')) {
    return 'Please enter a valid international mobile phone number starting with your country code.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in popup was closed before completing.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Authentication domain not authorized. Please verify localhost in Firebase Console.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection failed. Please verify your internet connection.';
  }

  return message || 'Authentication failed. Please try again.';
}
