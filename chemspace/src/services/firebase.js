import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────────────────────
// Firebase Configuration
// To get these values:
//   1. Go to https://console.firebase.google.com/project/chemistry-69152/settings/general
//   2. Under "Your apps", register a Web app named "chemspace-web"
//   3. Copy the firebaseConfig object and replace the placeholder values below.
//
// Alternatively, run this CLI command after logging in:
//   npx -y firebase-tools@latest apps:sdkconfig WEB <APP_ID> --project chemistry-69152
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Cloud Firestore
const db = getFirestore(app);

export { app, auth, db };
