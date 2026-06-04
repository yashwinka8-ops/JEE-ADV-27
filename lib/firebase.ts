import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyASRYQVeXxlpE2bu3WH-Xivh8NUZrUuhtE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "jee-excellence-tracker.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://jee-excellence-tracker-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "jee-excellence-tracker",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "jee-excellence-tracker.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "966728640070",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:966728640070:web:8b8727fb20d6eaf0f9cc47",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-LE448HVYY4"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

let db: Firestore;
if (!getApps().length) {
  db = getFirestore(app);
} else {
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
  } catch (e) {
    db = getFirestore(app);
  }
}

// Setup Google Provider for Drive Sync
// IMPORTANT: prompt=consent forces Google to ALWAYS show the permission screen
// so the user can approve Drive and Photos scopes explicitly
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/photoslibrary.readonly');
googleProvider.setCustomParameters({
  prompt: 'consent',           // Always show the consent screen (don't skip it)
  access_type: 'online',       // Get a fresh access token every time
  include_granted_scopes: 'true', // Include previously granted scopes too
});

export { app, auth, db, googleProvider, signInWithPopup, firebaseSignOut };
