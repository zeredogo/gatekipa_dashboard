import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID.trim(),
          clientEmail: (process.env.FIREBASE_CLIENT_EMAIL || "").trim(),
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, '\n').trim(),
        }),
      });
    } else {
      // Fallback to prevent Vercel build phase from crashing due to missing secrets
      console.warn("FIREBASE_PROJECT_ID is missing. Initializing safe-dummy Firebase Admin app for build context.");
      admin.initializeApp({ projectId: 'demo-gatekipa-build' });
    }
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
