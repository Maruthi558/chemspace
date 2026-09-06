import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  auth,
  sendFirebasePhoneOtp,
  verifyFirebasePhoneOtp,
  setupRecaptchaVerifier,
  getSavedScientistProfile
} from './firebase';
import {
  sendEmailOtp as apiSendEmailOtp,
  verifyEmailOtp as apiVerifyEmailOtp,
  sendPhoneOtpApi,
  verifyPhoneOtpApi
} from './api';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Register a new user with email and password.
 */
export async function signUpWithEmail(email, password, displayName) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  return credential;
}

/**
 * Sign in an existing user with email and password.
 */
export async function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign in with a Google popup.
 */
export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

/**
 * Request Email OTP code.
 */
export async function requestEmailOtp(email) {
  return apiSendEmailOtp(email);
}

/**
 * Verify Email OTP code and receive session.
 */
export async function confirmEmailOtp(email, otp) {
  const result = await apiVerifyEmailOtp(email, otp);
  if (result.token) {
    const profile = getSavedScientistProfile();
    const userData = {
      uid: result.user.uid,
      name: result.user.name || profile.name || 'Researcher',
      username: result.user.username || profile.name,
      email: result.user.email,
      avatar: profile.avatar || '',
      workplace: profile.workplace || 'ChemNova Research Institute',
      role: profile.title || 'Lead Research Chemist',
      department: profile.department,
      safetyLevel: profile.safetyLevel,
      workingCondition: profile.workingCondition,
      researchField: profile.researchField,
      provider: 'email_otp',
      verified: true,
      lastLoginAt: new Date().toISOString()
    };
    localStorage.setItem('chemspace_token', result.token);
    localStorage.setItem('chemspace_user', JSON.stringify(userData));
    localStorage.setItem('chemspace_scientist_profile', JSON.stringify({ ...profile, ...userData }));
    window.dispatchEvent(new Event('chemspace-auth-changed'));
    return { token: result.token, user: userData };
  }
  return result;
}

/**
 * Initialize reCAPTCHA for Phone OTP.
 */
export function initRecaptcha(containerId) {
  return setupRecaptchaVerifier(containerId);
}

/**
 * Send Phone OTP via Firebase SMS or Backend Provider
 */
export async function requestPhoneOtp(phoneNumber, verifier) {
  try {
    const confirmationResult = await sendFirebasePhoneOtp(phoneNumber, verifier);
    return confirmationResult;
  } catch (firebaseErr) {
    console.warn('[ChemSpace Auth] Firebase Phone Auth notice, routing through secure SMS engine:', firebaseErr.message || firebaseErr);
    const apiRes = await sendPhoneOtpApi(phoneNumber);
    return {
      isBackend: true,
      phone: phoneNumber,
      message: apiRes.message
    };
  }
}

/**
 * Confirm Phone OTP.
 */
export async function confirmPhoneOtp(confirmationResult, otpCode) {
  if (confirmationResult && typeof confirmationResult.confirm === 'function') {
    return verifyFirebasePhoneOtp(confirmationResult, otpCode);
  }

  const phone = confirmationResult?.phone || (typeof confirmationResult === 'string' ? confirmationResult : '');
  const result = await verifyPhoneOtpApi(phone, otpCode);
  if (result.token) {
    const profile = getSavedScientistProfile();
    const userData = {
      uid: result.user.uid,
      name: result.user.name || profile.name || `Researcher (${phone.slice(-4)})`,
      username: result.user.username || profile.name,
      email: profile.email || '',
      phoneNumber: phone,
      avatar: profile.avatar || '',
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
    localStorage.setItem('chemspace_token', result.token);
    localStorage.setItem('chemspace_user', JSON.stringify(userData));
    localStorage.setItem('chemspace_scientist_profile', JSON.stringify({ ...profile, ...userData }));
    window.dispatchEvent(new Event('chemspace-auth-changed'));
    return userData;
  }
  return result;
}

/**
 * Sign out the currently authenticated user.
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch {
    // ignore
  }
  localStorage.removeItem('chemspace_token');
  localStorage.removeItem('chemspace_user');
  window.dispatchEvent(new Event('chemspace-auth-changed'));
}

/**
 * Subscribe to auth state changes.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
