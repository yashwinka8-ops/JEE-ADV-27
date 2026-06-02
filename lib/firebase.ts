import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyASRYQVeXxlpE2bu3WH-Xivh8NUZrUuhtE",
  authDomain: "jee-excellence-tracker.firebaseapp.com",
  databaseURL: "https://jee-excellence-tracker-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jee-excellence-tracker",
  storageBucket: "jee-excellence-tracker.firebasestorage.app",
  messagingSenderId: "966728640070",
  appId: "1:966728640070:web:8b8727fb20d6eaf0f9cc47",
  measurementId: "G-LE448HVYY4"
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

export { app, auth, db };
