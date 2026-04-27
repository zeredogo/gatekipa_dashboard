import React from "react";
import { db } from "@/lib/firebaseAdmin";
import BroadcastClient from "./BroadcastClient";

export const dynamic = "force-dynamic";

const serializeData = (data: any) => JSON.parse(JSON.stringify(data));

export default async function BroadcastPage() {
  const snapshot = await db.collection("users").get();
  const users = snapshot.docs.map(doc => ({
    id: doc.id,
    ...serializeData(doc.data())
  }));

  return <BroadcastClient initialUsers={users} />;
}
