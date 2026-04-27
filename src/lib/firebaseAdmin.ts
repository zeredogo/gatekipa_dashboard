import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

if (!admin.apps.length) {
  try {
    const localKeyPath = path.join(process.cwd(), 'gatekipa.json');
    
    // 1. Try Vercel Environment Variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    } 
    // 2. Try local file if it exists
    else if (fs.existsSync(localKeyPath)) {
      admin.initializeApp({
        credential: admin.credential.cert(localKeyPath),
      });
    } 
    // 3. Fallback for Next.js Build Step (Prevents crashes when env vars are missing during CI)
    else {
      console.warn("Firebase Admin: No credentials found. Initializing with mock config to prevent build crash.");
      admin.initializeApp({
        projectId: "gatekipa-build-mock",
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
