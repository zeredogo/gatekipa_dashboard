import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";

// Verify session cookie — same logic as middleware
async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("gk_admin_session")?.value || "";
  const adminPassword = (process.env.DASHBOARD_ADMIN_PASSWORD || "gatekeeper-admin-secure").trim();
  return session === adminPassword;
}

export async function GET(req: NextRequest) {
  const isAuthed = await verifySession();
  if (!isAuthed) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const docSnap = await adminDb.doc('system_state/global').get();
    const mode = docSnap.exists ? docSnap.data()?.mode || 'NORMAL' : 'NORMAL';
    return NextResponse.json({ success: true, mode });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // 1. Auth gate — must have valid session cookie
  const isAuthed = await verifySession();
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const targetMode = body.mode === 'NORMAL' ? 'NORMAL' : 'LOCKDOWN';

    await adminDb.doc('system_state/global').set({ mode: targetMode }, { merge: true });

    return NextResponse.json({
      success: true,
      message: targetMode === 'LOCKDOWN' 
        ? "Global Network Kill Switch Engaged. All webhooks are now blocking transactions."
        : "Network Restored to Normal Operation.",
      mode: targetMode
    });
  } catch (err: any) {
    console.error("[Kill Switch API] Error:", err.message);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
