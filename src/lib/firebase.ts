import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

import { getAuth, connectAuthEmulator } from "firebase/auth";

// Production configuration mapped to Gatekipa Google project
const firebaseConfig = {
  apiKey: "AIzaSyA_Fc8xFCutxNN0elWvGSqjozMuzKzNJBo",
  authDomain: "gatekipa-bbd1c.firebaseapp.com",
  projectId: "gatekipa-bbd1c",
  storageBucket: "gatekipa-bbd1c.firebasestorage.app",
  messagingSenderId: "274080186354",
  appId: "1:274080186354:web:gatekeeperwebadmin"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// For local development, connect to the Firebase Emulators automatically
if (process.env.NODE_ENV === 'development') {
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    console.log("Connected to local Firestore and Auth emulators");
  } catch (e) {
    // Ignore error if already connected
  }
}

export { db, auth };
