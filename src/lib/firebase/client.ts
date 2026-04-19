import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Admin dashboard Firebase project (gatekeeper-15331) — kept separate from the mobile app (gatekipa-bbd1c)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBfMF-H0uC3AtaeMVpjEzHNIoVeKZ7keiE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "gatekeeper-15331.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gatekeeper-15331",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "gatekeeper-15331.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "731025691522",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:731025691522:web:082105420d459cb30d759b"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
  // Only inject AppCheck in the browser if a valid key exists, preventing 400 Bad Request errors locally
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY), 
    isTokenAutoRefreshEnabled: true
  });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, "us-central1");

export default app;
