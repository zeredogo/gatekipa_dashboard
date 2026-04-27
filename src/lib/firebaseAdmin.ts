import * as admin from 'firebase-admin';
import path from 'path';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(path.join(process.cwd(), 'gatekipa.json')),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
