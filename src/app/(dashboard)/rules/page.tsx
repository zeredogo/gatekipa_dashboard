import React from "react";
import { db } from "@/lib/firebaseAdmin";
import RulesClient from "./RulesClient";

export const dynamic = "force-dynamic";

const serializeData = (data: any) => JSON.parse(JSON.stringify(data));

export default async function RulesPage() {
  // Query system configurations
  const globalStateDoc = await db.collection("system_state").doc("global").get();
  const systemState = globalStateDoc.exists ? serializeData(globalStateDoc.data()) : { mode: "NORMAL" };

  const feesDoc = await db.collection("system_state").doc("fees").get();
  const feesState = feesDoc.exists ? serializeData(feesDoc.data()) : { cardCreationFee: 2.00 };

  return <RulesClient systemState={systemState} initialFees={feesState} />;
}
