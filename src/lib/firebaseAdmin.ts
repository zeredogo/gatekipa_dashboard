import * as admin from 'firebase-admin';
import path from 'path';

if (!admin.apps.length) {
  try {
    // 1. Try Vercel Environment Variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      // Vercel sometimes escapes newlines in private keys, so we must unescape them
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    } 
    // 2. Fallback to local service account file for development
    else {
      admin.initializeApp({
        credential: admin.credential.cert(path.join(process.cwd(), 'gatekipa.json')),
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
