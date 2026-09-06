import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const USERS_COLLECTION = 'users';

/**
 * Create or overwrite a user profile document in Firestore.
 * Called on first sign-up / first Google login.
 * @param {string} uid - Firebase Auth user UID
 * @param {{ displayName?: string, email?: string, photoURL?: string }} data
 */
export async function createUserProfile(uid, data) {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await setDoc(userRef, {
    uid,
    displayName: data.displayName || '',
    email: data.email || '',
    photoURL: data.photoURL || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    // ChemSpace-specific defaults
    researchProjects: [],
    savedMolecules: [],
    preferences: {
      theme: 'dark',
      defaultTool: 'dashboard',
    },
  });
}

/**
 * Fetch a user's profile from Firestore.
 * @param {string} uid
 * @returns {Promise<object|null>} Profile data or null if not found
 */
export async function getUserProfile(uid) {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Merge-update fields in a user's Firestore profile.
 * @param {string} uid
 * @param {object} data - Fields to update
 */
export async function updateUserProfile(uid, data) {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
