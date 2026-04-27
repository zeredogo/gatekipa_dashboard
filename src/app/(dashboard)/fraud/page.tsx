import React from "react";
import { db } from "@/lib/firebaseAdmin";
import FraudClient from "./FraudClient";

export const dynamic = "force-dynamic";

// Helper to safely serialize Firestore data for Client Components
const serializeData = (data: any) => JSON.parse(JSON.stringify(data));

export default async function FraudPage() {
  // Live query for frozen cards
  const cardsSnapshot = await db.collection("cards").where("local_status", "==", "frozen").get();
  const frozenCards = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) }));

  // Live query for blocked users
  const usersSnapshot = await db.collection("users").where("status", "==", "blocked").get();
  const blockedUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) }));

  return <FraudClient initialFrozenCards={frozenCards} initialBlockedUsers={blockedUsers} />;
}
