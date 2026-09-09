import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthChange,
  signInWithGoogle as authServiceSignInWithGoogle,
  signOut as authServiceSignOut,
  signUpWithEmail as authServiceSignUpWithEmail,
  signInWithEmail as authServiceSignInWithEmail,
  resetPassword as authServiceResetPassword,
  requestEmailOtp as authServiceRequestEmailOtp,
  confirmEmailOtp as authServiceConfirmEmailOtp,
  requestEmailLink as authServiceRequestEmailLink,
  confirmEmailLink as authServiceConfirmEmailLink,
  requestPhoneOtp as authServiceRequestPhoneOtp,
  confirmPhoneOtp as authServiceConfirmPhoneOtp,
  initRecaptcha,
  resetRecaptcha,
  checkEmailExists,
  getGoogleRedirectResult
} from '../services/authService';
import { createUserProfile, getUserProfile } from '../services/firestoreService';
import { getSavedScientistProfile, saveScientistProfile } from '../services/firebase';

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
    // Check if user is returning from a Google redirect
    getGoogleRedirectResult()
      .then((redirectUser) => {
        if (redirectUser) {
          setUser({ ...redirectUser, isGuest: false });
        }
      })
      .catch((err) => {
        console.warn('[ChemSpace Auth] Google redirect result notice:', err);
      });

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
              photoURL: fullUser.avatar,
              workplace: fullUser.workplace,
              role: fullUser.role
            });
          }
          setProfile(prof);
        } catch (err) {
          console.warn('[Firestore] Profile sync notice:', err.message);
        }
      } else {
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
   * 1. Email / Password Sign Up
   */
  async function handleSignUpWithEmail(email, password, displayName, profileMeta = {}) {
    setError('');
    try {
      const userData = await authServiceSignUpWithEmail(email, password, displayName, profileMeta);
      try {
        await createUserProfile(userData.uid, {
          displayName: userData.name,
          email: userData.email,
          workplace: userData.workplace,
          role: userData.role
        });
      } catch (err) {
        console.warn('[Firestore] Profile initialization notice:', err.message);
      }
      setUser({ ...userData, isGuest: false });
      return userData;
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  }

  /**
   * 2. Email / Password Sign In
   */
  async function handleSignInWithEmail(email, password) {
    setError('');
    try {
      const userData = await authServiceSignInWithEmail(email, password);
      setUser({ ...userData, isGuest: false });
      return userData;
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  }

  /**
   * 3. Password Reset
   */
  async function handleResetPassword(email) {
    setError('');
    try {
      await authServiceResetPassword(email);
      return true;
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  }

  /**
   * 4. Google Sign-In
   */
  async function handleGoogleSignIn(profileData = {}) {
    setError('');
    try {
      const res = await authServiceSignInWithGoogle(profileData);
      if (!res) return null;

      try {
        await createUserProfile(res.uid, {
          displayName: res.name,
          email: res.email,
          photoURL: res.avatar,
          workplace: res.workplace,
          role: res.role
        });
      } catch {
        // non-critical
      }

      const fullUser = { ...res, isGuest: false };
      setUser(fullUser);
      return fullUser;
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  }

  /**
   * 5. Email Link Passwordless Sign-In
   */
  async function handleSendEmailVerificationLink(email) {
    setError('');
    try {
      return await authServiceRequestEmailLink(email);
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  }

  async function handleCompleteEmailLinkSignIn(email, url) {
    setError('');
    try {
      const userData = await authServiceConfirmEmailLink(email, url);
      try {
        await createUserProfile(userData.uid, {
          displayName: userData.name,
          email: userData.email,
          photoURL: userData.avatar,
          workplace: userData.workplace,
          role: userData.role
        });
      } catch {
        // non-critical
      }
      setUser({ ...userData, isGuest: false });
      return userData;
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  }

  /**
   * 6. Real Email OTP Authentication
   */
  async function handleSendEmailOtp(email) {
    setError('');
    try {
      return await authServiceRequestEmailOtp(email);
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  }

  async function handleVerifyEmailOtp(email, otp, profileData = {}) {
    setError('');
    try {
      const res = await authServiceConfirmEmailOtp(email, otp);
      const savedProfile = getSavedScientistProfile();
      const userData = {
        uid: res.user?.id ? `user_${res.user.id}` : ('scientist_' + Date.now().toString(36)),
        name: profileData.name || res.user?.name || res.user?.username || savedProfile.name || 'Research Scientist',
        username: res.user?.username || email.split('@')[0],
        email: email.trim().toLowerCase(),
        workplace: profileData.workplace || savedProfile.workplace || 'ChemNova Research Institute',
        role: profileData.role || savedProfile.title || 'Lead Research Chemist',
        provider: 'email_otp',
        verified: true,
        lastLoginAt: new Date().toISOString()
      };

      const token = res.token || ('otp_session_' + Date.now());
      localStorage.setItem('chemspace_token', token);
      localStorage.setItem('chemspace_user', JSON.stringify(userData));
      localStorage.setItem('chemspace_scientist_profile', JSON.stringify({ ...savedProfile, ...userData }));
      window.dispatchEvent(new Event('chemspace-auth-changed'));
      setUser({ ...userData, isGuest: false });
      return userData;
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  }

  /**
   * 7. Phone SMS OTP
   */
  async function handleSendPhoneOtp(phoneNumber, verifier) {
    setError('');
    try {
      return await authServiceRequestPhoneOtp(phoneNumber, verifier);
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  }

  async function handleVerifyPhoneOtp(confirmationResult, otp, profileData = {}) {
    setError('');
    try {
      const userData = await authServiceConfirmPhoneOtp(confirmationResult, otp);
      if (profileData.name || profileData.workplace) {
        saveScientistProfile({
          name: profileData.name || userData.name,
          workplace: profileData.workplace || userData.workplace,
          title: profileData.role || userData.role
        });
      }
      try {
        await createUserProfile(userData.uid, {
          displayName: userData.name,
          phoneNumber: userData.phoneNumber,
          workplace: userData.workplace,
          role: userData.role
        });
      } catch {
        // non-critical
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

  /**
   * 8. Guest Session Handlers
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

  function handleExitGuestSession() {
    setError('');
    localStorage.removeItem('chemspace_token');
    localStorage.removeItem('chemspace_user');
    setUser(null);
    setProfile(null);
    window.dispatchEvent(new Event('chemspace-auth-changed'));
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
    signUpWithEmail: handleSignUpWithEmail,
    signInWithEmail: handleSignInWithEmail,
    resetPassword: handleResetPassword,
    signInWithGoogle: handleGoogleSignIn,
    sendEmailOtp: handleSendEmailOtp,
    verifyEmailOtp: handleVerifyEmailOtp,
    sendEmailVerificationLink: handleSendEmailVerificationLink,
    completeEmailLinkSignIn: handleCompleteEmailLinkSignIn,
    sendPhoneOtp: handleSendPhoneOtp,
    verifyPhoneOtp: handleVerifyPhoneOtp,
    setupRecaptcha: initRecaptcha,
    resetRecaptcha,
    continueAsGuest: handleContinueAsGuest,
    exitGuestSession: handleExitGuestSession,
    signOut: handleSignOut,
    checkEmailExists
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

  if (code === 'auth/invalid-verification-code' || message.includes('invalid-verification-code')) {
    return 'Invalid verification code. Please check the code and try again.';
  }
  if (code === 'auth/code-expired' || message.includes('expired')) {
    return 'Verification code has expired. Please request a new code.';
  }
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Invalid email or password. Please verify your credentials or create an account.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (code === 'auth/too-many-requests' || message.includes('Too many')) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }
  if (code === 'auth/invalid-phone-number' || message.includes('phone-number')) {
    return 'Please enter a valid mobile phone number with country code.';
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Sign-in popup was closed before completing.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Sign-in popup was blocked by your browser. Please enable popups for this site.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Authentication domain not authorized. In Firebase Console, ensure "localhost" is listed in Authorized Domains.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'This sign-in provider is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.';
  }
  if (code === 'auth/configuration-not-found') {
    return 'Firebase Authentication is not activated in project chemistry1-e2723. Click "Get Started" in Firebase Console.';
  }
  if (code === 'auth/captcha-check-failed') {
    return 'Security reCAPTCHA verification failed. Please refresh and try again.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection failed. Please check your internet connection.';
  }

  return message || 'Authentication failed. Please try again.';
}
