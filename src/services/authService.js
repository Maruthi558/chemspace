import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  loginWithGoogle,
  checkGoogleRedirectResult,
  signUpWithEmailPassword,
  signInWithEmailPassword,
  resetUserPassword,
  sendEmailVerificationLink,
  completeEmailLinkSignIn,
  setupRecaptcha,
  sendSMS,
  confirmSMS,
  logoutUser,
  getSavedScientistProfile
} from './firebase';
import { checkEmailExistsApi } from './api';

/**
 * Check whether an account exists with the specified email.
 */
export async function checkEmailExists(email) {
  return checkEmailExistsApi(email);
}

/**
 * Register a new user with email and password via Firebase Auth.
 */
export async function signUpWithEmail(email, password, displayName, profileMeta = {}) {
  return signUpWithEmailPassword(email, password, displayName, profileMeta);
}

/**
 * Sign in an existing user with email and password via Firebase Auth.
 */
export async function signInWithEmail(email, password) {
  return signInWithEmailPassword(email, password);
}

/**
 * Trigger password reset email via Firebase Auth.
 */
export async function resetPassword(email) {
  return resetUserPassword(email);
}

/**
 * Sign in with Google (Popup with fallback)
 */
export async function signInWithGoogle(profileMeta = {}) {
  return loginWithGoogle();
}

/**
 * Capture Google Sign-In result if returning from redirect flow.
 */
export async function getGoogleRedirectResult() {
  return checkGoogleRedirectResult();
}

/**
 * Send Passwordless Email Magic Link via Firebase Auth.
 */
export async function requestEmailLink(email) {
  return sendEmailVerificationLink(email);
}

/**
 * Complete Passwordless Email Link Sign-In.
 */
export async function confirmEmailLink(email, url) {
  return completeEmailLinkSignIn(email, url);
}

/**
 * Initialize reCAPTCHA for Phone Auth.
 */
export function initRecaptcha(containerId = 'recaptcha-container') {
  return setupRecaptcha(containerId);
}

/**
 * Send Phone OTP via Firebase SMS.
 */
export async function requestPhoneOtp(phoneNumber, verifier) {
  return sendSMS(phoneNumber, verifier);
}

/**
 * Confirm Phone OTP via Firebase confirmationResult.
 */
export async function confirmPhoneOtp(confirmationResult, otpCode) {
  return confirmSMS(confirmationResult, otpCode);
}

/**
 * Sign out the currently authenticated user.
 */
export async function signOut() {
  return logoutUser();
}

/**
 * Subscribe to auth state changes.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export {
  loginWithGoogle,
  sendEmailVerificationLink,
  completeEmailLinkSignIn,
  setupRecaptcha,
  sendSMS,
  confirmSMS
};
