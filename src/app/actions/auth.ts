"use server";

import { cookies } from "next/headers";
import { auth } from "@/lib/firebaseAdmin";

export async function createSession(idToken: string) {
  try {
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      return { success: false, error: "DEBUG: Server is missing FIREBASE_PRIVATE_KEY environment variable. Firebase Admin failed to initialize." };
    }
    
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Session creation failed", error);
    return { success: false, error: error?.message || "Unauthorized" };
  }
}

export async function removeSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return { success: true };
}
