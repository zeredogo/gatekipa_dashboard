import * as admin from 'firebase-admin';

/**
 * Normalize a Firebase private key regardless of how Vercel injects it.
 * Vercel can deliver it in 3 ways:
 *  1. With escaped newlines: "-----BEGIN...\\nMII..."  (most common via UI paste)
 *  2. With double-escaped:   "-----BEGIN...\\\\nMII..."
 *  3. With real newlines:    "-----BEGIN...\nMII..."   (if pasted via CLI)
 */
function normalizePrivateKey(raw: string): string {
  return raw
    .replace(/\\\\n/g, '\n')  // double-escaped → real newline
    .replace(/\\n/g, '\n')    // single-escaped → real newline
    .trim();
}

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim() || "";
    const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
    const privateKey = normalizePrivateKey(rawKey);

    // Diagnostics — visible in Vercel Function logs
    console.log("[Firebase Admin] project_id:", projectId || "MISSING");
    console.log("[Firebase Admin] client_email:", clientEmail || "MISSING");
    console.log("[Firebase Admin] key_starts_with:", privateKey.slice(0, 27) || "MISSING");

    if (projectId && privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
      console.log("[Firebase Admin] Initialized successfully.");
    } else {
      console.warn("[Firebase Admin] Missing or malformed credentials. Falling back to dummy project.");
      admin.initializeApp({ projectId: 'demo-gatekipa-build' });
    }
  } catch (error: any) {
    console.error('[Firebase Admin] Initialization error:', error.stack);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
