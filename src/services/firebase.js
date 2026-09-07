import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────────────────────
// Firebase Configuration for Project maruthii-5b928
// ─────────────────────────────────────────────────────────────────────────────
export const OFFICIAL_FIREBASE_API_KEY = "AIzaSyAOiMjPfccNgrM-MjeJwJ0W2nHKNf7dqYA";

// Automatically ensure client storage has the verified official key
if (typeof window !== 'undefined') {
  const current = localStorage.getItem('chemspace_firebase_api_key');
  if (!current || !current.startsWith('AIzaSy') || current.includes('BigERe2gl7yVROpD')) {
    localStorage.setItem('chemspace_firebase_api_key', OFFICIAL_FIREBASE_API_KEY);
  }
}

export function getFirebaseConfig() {
  const localApiKey = typeof window !== 'undefined' ? localStorage.getItem('chemspace_firebase_api_key') : null;
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;

  const validApiKey = (envApiKey && envApiKey.startsWith('AIzaSy'))
    ? envApiKey
    : (localApiKey && localApiKey.startsWith('AIzaSy') && !localApiKey.includes('BigERe2gl7yVROpD'))
      ? localApiKey
      : OFFICIAL_FIREBASE_API_KEY;

  return {
    apiKey: validApiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "maruthii-5b928.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "maruthii-5b928",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "maruthii-5b928.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "11169483347",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:11169483347:web:d86d1c2d357b117b48d4a6",
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "11169483347-r2iqvfmful9qm0pqq6fpjuepvbcip17u.apps.googleusercontent.com",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PS4MNCTWL6",
  };
}

let app = getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());
let auth = getAuth(app);
let db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Reinitializes Firebase if the API key was updated in local storage or environment
 */
export function ensureFreshFirebaseAuth() {
  const currentConfig = getFirebaseConfig();
  if (app && app.options.apiKey !== currentConfig.apiKey) {
    try {
      deleteApp(app);
    } catch {
      // ignore
    }
    app = initializeApp(currentConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { app, auth, db };
}

/**
 * Retrieves the persistent scientist profile and laboratory working conditions
 */
export function getSavedScientistProfile() {
  try {
    const saved = localStorage.getItem('chemspace_scientist_profile');
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  let existingUser = null;
  try {
    existingUser = JSON.parse(localStorage.getItem('chemspace_user'));
  } catch {
    // ignore
  }

  return {
    name: existingUser?.name || 'Dr. Maruthi Chemist',
    title: existingUser?.role || 'Lead Research Chemist',
    email: existingUser?.email || 'scientist@chemnova.org',
    workplace: existingUser?.workplace || 'ChemNova Advanced Institute of Chemical Sciences',
    department: existingUser?.department || 'Department of Synthetic & Computational Chemistry',
    labRoom: existingUser?.labRoom || 'Research Suite B-402',
    safetyLevel: existingUser?.safetyLevel || 'BSL-2 / Chemical Class 1 Div 2',
    workingCondition: existingUser?.workingCondition || 'STP 298.15 K • 1.00 atm',
    atmosphere: existingUser?.atmosphere || 'Inert Argon / Fume Hood Active',
    researchField: existingUser?.researchField || 'Organic Synthesis & Molecular Modeling',
    orcid: existingUser?.orcid || '0000-0002-1825-0097',
    status: existingUser?.status || 'Active Lab On-Duty',
    avatar: existingUser?.avatar || ''
  };
}

/**
 * Persists scientist profile & laboratory working conditions across the platform
 */
export function saveScientistProfile(profileData) {
  try {
    const current = getSavedScientistProfile();
    const updatedProfile = { ...current, ...profileData };
    localStorage.setItem('chemspace_scientist_profile', JSON.stringify(updatedProfile));

    let currentUser = {};
    try {
      currentUser = JSON.parse(localStorage.getItem('chemspace_user')) || {};
    } catch {
      currentUser = {};
    }

    const updatedUser = {
      ...currentUser,
      uid: currentUser.uid || ('scientist_' + Date.now().toString(36)),
      name: updatedProfile.name,
      username: updatedProfile.name,
      email: updatedProfile.email,
      workplace: updatedProfile.workplace,
      role: updatedProfile.title,
      department: updatedProfile.department,
      labRoom: updatedProfile.labRoom,
      safetyLevel: updatedProfile.safetyLevel,
      workingCondition: updatedProfile.workingCondition,
      atmosphere: updatedProfile.atmosphere,
      researchField: updatedProfile.researchField,
      orcid: updatedProfile.orcid,
      status: updatedProfile.status,
      avatar: updatedProfile.avatar || currentUser.avatar || '',
      verified: true
    };

    localStorage.setItem('chemspace_user', JSON.stringify(updatedUser));
    if (!localStorage.getItem('chemspace_token')) {
      localStorage.setItem('chemspace_token', 'scientist_session_' + Date.now());
    }

    window.dispatchEvent(new Event('chemspace-auth-changed'));
    return { profile: updatedProfile, user: updatedUser };
  } catch (err) {
    console.error('Failed to save scientist profile:', err);
    return null;
  }
}

/**
 * Perform real Google Sign-In with Firebase Popup
 */
export async function loginWithGoogle() {
  ensureFreshFirebaseAuth();
  const profile = getSavedScientistProfile();

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const token = await user.getIdToken();

    const userData = {
      uid: user.uid,
      name: user.displayName || profile.name || 'Verified Scientist',
      username: user.displayName || profile.name || 'Scientist',
      email: user.email || profile.email || '',
      avatar: user.photoURL || profile.avatar || '',
      workplace: profile.workplace || 'ChemNova Advanced Institute',
      role: profile.title || 'Lead Research Chemist',
      department: profile.department,
      safetyLevel: profile.safetyLevel,
      workingCondition: profile.workingCondition,
      researchField: profile.researchField,
      orcid: profile.orcid,
      provider: 'google',
      verified: true
    };

    localStorage.setItem('chemspace_token', token);
    localStorage.setItem('chemspace_user', JSON.stringify(userData));
    localStorage.setItem('chemspace_scientist_profile', JSON.stringify({ ...profile, ...userData }));

    window.dispatchEvent(new Event('chemspace-auth-changed'));
    return userData;
  } catch (err) {
    console.error('Firebase Google Auth error:', err);
    throw err;
  }
}

/**
 * Check if the user is returning from a Google Sign-In redirect flow
 */
export async function checkGoogleRedirectResult() {
  ensureFreshFirebaseAuth();
  const profile = getSavedScientistProfile();
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const user = result.user;
      const token = await user.getIdToken();
      const userData = {
        uid: user.uid,
        name: user.displayName || profile.name || 'Verified Scientist',
        username: user.displayName || profile.name || 'Scientist',
        email: user.email || profile.email || '',
        avatar: user.photoURL || profile.avatar || '',
        workplace: profile.workplace || 'ChemNova Advanced Institute',
        role: profile.title || 'Lead Research Chemist',
        department: profile.department,
        safetyLevel: profile.safetyLevel,
        workingCondition: profile.workingCondition,
        researchField: profile.researchField,
        orcid: profile.orcid,
        provider: 'google',
        verified: true
      };

      localStorage.setItem('chemspace_token', token);
      localStorage.setItem('chemspace_user', JSON.stringify(userData));
      localStorage.setItem('chemspace_scientist_profile', JSON.stringify({ ...profile, ...userData }));
      window.dispatchEvent(new Event('chemspace-auth-changed'));
      return userData;
    }
  } catch (err) {
    console.error('Firebase Google redirect error:', err);
    throw err;
  }
  return null;
}

/**
 * Perform Google Sign-In with Google Identity Services JWT ID Token
 */
export async function loginWithGoogleIdToken(idToken) {
  const profile = getSavedScientistProfile();
  try {
    ensureFreshFirebaseAuth();
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    const user = result.user;
    const token = await user.getIdToken();

    const userData = {
      uid: user.uid,
      name: user.displayName || profile.name,
      username: user.displayName || profile.name,
      email: user.email || profile.email,
      avatar: user.photoURL || profile.avatar || '',
      workplace: profile.workplace,
      role: profile.title,
      department: profile.department,
      safetyLevel: profile.safetyLevel,
      workingCondition: profile.workingCondition,
      researchField: profile.researchField,
      orcid: profile.orcid,
      provider: 'google',
      verified: true
    };

    localStorage.setItem('chemspace_token', token);
    localStorage.setItem('chemspace_user', JSON.stringify(userData));
    localStorage.setItem('chemspace_scientist_profile', JSON.stringify({ ...profile, ...userData }));
    window.dispatchEvent(new Event('chemspace-auth-changed'));
    return userData;
  } catch (err) {
    console.error('Google ID token verification failed:', err);
    throw err;
  }
}

/**
 * Sign out user from Firebase and clear local session
 */
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase signOut error:', err);
  }
  localStorage.removeItem('chemspace_token');
  localStorage.removeItem('chemspace_user');
  window.dispatchEvent(new Event('chemspace-auth-changed'));
}

/**
 * Save custom Firebase Web API key in local storage and reinitialize auth instance
 */
export function setCustomFirebaseApiKey(key) {
  if (!key) return;
  localStorage.setItem('chemspace_firebase_api_key', key.trim());
  ensureFreshFirebaseAuth();
}



/**
 * Setup invisible or standard RecaptchaVerifier for Phone OTP
 */
export function setupRecaptchaVerifier(containerId = 'recaptcha-container') {
  ensureFreshFirebaseAuth();
  if (typeof window === 'undefined') return null;

  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch {
      // ignore
    }
  }

  const container = document.getElementById(containerId);
  if (!container) return null;

  try {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        // reCAPTCHA expired
      }
    });
    return window.recaptchaVerifier;
  } catch (err) {
    console.warn('RecaptchaVerifier init notice:', err);
    return null;
  }
}

/**
 * Send Phone OTP via Firebase Phone Auth
 */
export async function sendFirebasePhoneOtp(phoneNumber, verifier) {
  ensureFreshFirebaseAuth();
  let appVerifier = verifier || window.recaptchaVerifier;
  if (!appVerifier) {
    appVerifier = setupRecaptchaVerifier('recaptcha-container');
  }
  if (!appVerifier) {
    throw new Error('Security verification element not initialized. Please refresh and try again.');
  }
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  return confirmationResult;
}

/**
 * Verify Phone OTP confirmationResult and store authenticated session
 */
export async function verifyFirebasePhoneOtp(confirmationResult, otpCode) {
  const profile = getSavedScientistProfile();
  const result = await confirmationResult.confirm(otpCode);
  const user = result.user;
  const token = await user.getIdToken();

  const formattedPhone = user.phoneNumber || '';
  const userData = {
    uid: user.uid,
    name: user.displayName || profile.name || `Researcher (${formattedPhone.slice(-4)})`,
    username: user.displayName || profile.name || `Researcher`,
    email: user.email || profile.email || '',
    phoneNumber: formattedPhone,
    avatar: user.photoURL || profile.avatar || '',
    workplace: profile.workplace || 'ChemNova Research Institute',
    role: profile.title || 'Lead Research Chemist',
    department: profile.department,
    safetyLevel: profile.safetyLevel,
    workingCondition: profile.workingCondition,
    researchField: profile.researchField,
    provider: 'phone_otp',
    verified: true,
    lastLoginAt: new Date().toISOString()
  };

  localStorage.setItem('chemspace_token', token);
  localStorage.setItem('chemspace_user', JSON.stringify(userData));
  localStorage.setItem('chemspace_scientist_profile', JSON.stringify({ ...profile, ...userData }));
  window.dispatchEvent(new Event('chemspace-auth-changed'));
  return userData;
}

export { app, auth, db, googleProvider };

