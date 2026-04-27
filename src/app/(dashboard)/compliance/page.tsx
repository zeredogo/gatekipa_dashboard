import React from "react";
import { db } from "@/lib/firebaseAdmin";
import ComplianceClient from "./ComplianceClient";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  // We can't rely on where("kycStatus") because many users might not have the field written yet.
  // Instead, fetch all users and filter in memory, or fetch limited users.
  const snapshot = await db.collection("users").get();
  
  // Filter users who are not verified
  const pendingReviews = snapshot.docs
    .map(doc => {
      const data = doc.data();
      const kyc = data.kycStatus || "pending";
      return { 
        id: doc.id, 
        ...data,
        kycStatus: kyc,
        displayName: data.displayName || (data.firstName ? `${data.firstName} ${data.lastName || ''}` : "Unknown User")
      };
    })
    .filter(user => user.kycStatus === "pending" || user.kycStatus === "rejected" || user.kycStatus === "failed");

  return <ComplianceClient initialReviews={pendingReviews} />;
}
