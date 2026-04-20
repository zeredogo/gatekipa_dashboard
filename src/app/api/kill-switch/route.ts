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

export async function POST(req: NextRequest) {
  // 1. Auth gate — must have valid session cookie
  const isAuthed = await verifySession();
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Fetch all active cards using Admin SDK (bypasses Firestore rules)
    const cardsSnap = await adminDb
      .collection("cards")
      .where("status", "==", "active")
      .get();

    if (cardsSnap.empty) {
      return NextResponse.json({ success: true, processed: 0, frozen: 0, failed: 0 });
    }

    // 3. Batch-update all active cards to 'blocked'
    const chunks: FirebaseFirestore.DocumentSnapshot[][] = [];
    const docs = cardsSnap.docs;
    for (let i = 0; i < docs.length; i += 450) {
      chunks.push(docs.slice(i, i + 450));
    }

    let totalProcessed = 0;
    for (const chunk of chunks) {
      const batch = adminDb.batch();
      for (const doc of chunk) {
        batch.update(doc.ref, {
          status: "blocked",
          ...(doc.data().bridgecard_card_id && { bridgecard_status: "frozen" }),
          admin_locked_at: Date.now(),
        });
        totalProcessed++;
      }
      await batch.commit();
    }

    // Note: Bridgecard API freeze is handled asynchronously by existing Cloud Function webhooks.
    // This endpoint handles the Firestore state change immediately for instant UI feedback.
    return NextResponse.json({
      success: true,
      processed: cardsSnap.size,
      frozen: totalProcessed,
      failed: 0,
    });
  } catch (err: any) {
    console.error("[Kill Switch API] Error:", err.message);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
