import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

const USERS_COLLECTION = 'users';
const PROJECTS_COLLECTION = 'projects';
const MOLECULES_COLLECTION = 'molecules';
const NOTES_COLLECTION = 'notes';
const REACTIONS_COLLECTION = 'reactions';

// ─────────────────────────────────────────────────────────────────────────────
// 1. User Profiles
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create or overwrite a user profile document in Firestore.
 */
export async function createUserProfile(uid, data = {}) {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const profileData = {
    uid,
    displayName: data.displayName || data.name || '',
    email: data.email || '',
    photoURL: data.photoURL || data.avatar || '',
    workplace: data.workplace || 'ChemNova Advanced Institute',
    role: data.role || 'Lead Research Chemist',
    department: data.department || 'Department of Synthetic & Computational Chemistry',
    updatedAt: serverTimestamp(),
    preferences: {
      theme: 'dark',
      defaultTool: 'dashboard',
      ...(data.preferences || {})
    }
  };

  await setDoc(userRef, profileData, { merge: true });
  return profileData;
}

/**
 * Fetch a user's profile from Firestore.
 */
export async function getUserProfile(uid) {
  if (!uid) return null;
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Merge-update fields in a user's Firestore profile.
 */
export async function updateUserProfile(uid, data) {
  if (!uid) return;
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Laboratory Research Projects
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserProjects(userId) {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('[Firestore] Notice fetching projects:', err.message);
    // Fallback if composite index is pending
    try {
      const fallbackQ = query(
        collection(db, PROJECTS_COLLECTION),
        where('userId', '==', userId)
      );
      const snap = await getDocs(fallbackQ);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
      return [];
    }
  }
}

export async function saveProject(projectData, userId) {
  const projectId = projectData.id || ('proj_' + Date.now().toString(36));
  const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
  const payload = {
    ...projectData,
    id: projectId,
    userId: userId || projectData.userId || 'guest',
    updatedAt: serverTimestamp()
  };
  if (!projectData.createdAt) {
    payload.createdAt = serverTimestamp();
  }
  await setDoc(projectRef, payload, { merge: true });
  return { id: projectId, ...payload };
}

export async function deleteProject(projectId) {
  if (!projectId) return;
  const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
  await deleteDoc(projectRef);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Saved Molecular Structures
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserMolecules(userId) {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, MOLECULES_COLLECTION),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('[Firestore] Notice fetching molecules:', err.message);
    return [];
  }
}

export async function saveMolecule(moleculeData, userId) {
  const molId = moleculeData.id || ('mol_' + Date.now().toString(36));
  const molRef = doc(db, MOLECULES_COLLECTION, molId);
  const payload = {
    ...moleculeData,
    id: molId,
    userId: userId || moleculeData.userId || 'guest',
    updatedAt: serverTimestamp()
  };
  await setDoc(molRef, payload, { merge: true });
  return { id: molId, ...payload };
}

export async function deleteMolecule(molId) {
  if (!molId) return;
  const molRef = doc(db, MOLECULES_COLLECTION, molId);
  await deleteDoc(molRef);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Lab Notebook Entries (Notes)
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserNotes(userId) {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, NOTES_COLLECTION),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('[Firestore] Notice fetching notes:', err.message);
    return [];
  }
}

export async function saveNote(noteData, userId) {
  const noteId = noteData.id || ('note_' + Date.now().toString(36));
  const noteRef = doc(db, NOTES_COLLECTION, noteId);
  const payload = {
    ...noteData,
    id: noteId,
    userId: userId || noteData.userId || 'guest',
    updatedAt: serverTimestamp()
  };
  await setDoc(noteRef, payload, { merge: true });
  return { id: noteId, ...payload };
}

export async function deleteNote(noteId) {
  if (!noteId) return;
  const noteRef = doc(db, NOTES_COLLECTION, noteId);
  await deleteDoc(noteRef);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Chemical Reactions History
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserReactions(userId) {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, REACTIONS_COLLECTION),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('[Firestore] Notice fetching reactions:', err.message);
    return [];
  }
}

export async function saveReaction(reactionData, userId) {
  const rxnId = reactionData.id || ('rxn_' + Date.now().toString(36));
  const rxnRef = doc(db, REACTIONS_COLLECTION, rxnId);
  const payload = {
    ...reactionData,
    id: rxnId,
    userId: userId || reactionData.userId || 'guest',
    updatedAt: serverTimestamp()
  };
  await setDoc(rxnRef, payload, { merge: true });
  return { id: rxnId, ...payload };
}
