"use server";

import { db, auth } from "@/lib/firebaseAdmin";
import { revalidatePath } from "next/cache";

// --- SYSTEM STATE ACTIONS --- //

export async function toggleGlobalFreeze(isCurrentlyFrozen: boolean) {
  try {
    const newState = isCurrentlyFrozen ? "NORMAL" : "LOCKDOWN";
    
    // Write to system_state/global
    await db.collection("system_state").doc("global").set({
      mode: newState,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    revalidatePath("/freeze");
    return { success: true, mode: newState };
  } catch (error) {
    console.error("Failed to toggle global freeze:", error);
    return { success: false, error: "Failed to toggle global freeze." };
  }
}

// --- CARD ACTIONS --- //

export async function toggleCardFreeze(cardId: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === "active" ? "frozen" : "active";
    
    // In a real scenario, this should also hit the Bridgecard API to actually freeze the card.
    // We will update the Firestore state which the mobile app listens to.
    await db.collection("cards").doc(cardId).update({
      local_status: newStatus,
      updatedAt: new Date().toISOString()
    });

    revalidatePath("/cards");
    return { success: true, status: newStatus };
  } catch (error) {
    console.error("Failed to toggle card status:", error);
    return { success: false, error: "Failed to update card status." };
  }
}
