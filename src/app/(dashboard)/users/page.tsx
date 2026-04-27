import { db } from "@/lib/firebaseAdmin";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  // Fetch latest users without relying on a specific index that might be missing
  const usersSnapshot = await db.collection("users").get();
  const allDocs = usersSnapshot.docs;
  
  // Sort in memory to avoid FAILED_PRECONDITION index errors
  const users = allDocs
    .map(doc => {
      const data = doc.data();
      const rawCreatedAt = data.createdAt || data.created_at;
      let dateString = "Unknown";
      if (rawCreatedAt) {
        if (rawCreatedAt.toDate) {
          dateString = rawCreatedAt.toDate().toLocaleDateString();
        } else if (typeof rawCreatedAt === 'number') {
          dateString = new Date(rawCreatedAt).toLocaleDateString();
        } else {
          dateString = new Date(rawCreatedAt).toLocaleDateString();
        }
      }

      return {
        id: doc.id,
        displayName: data.displayName || (data.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : "Unknown User"),
        email: data.email || "",
        isVerified: data.kycStatus === 'verified',
        planTier: data.planTier || "Instant",
        status: data.status || "active",
        createdAt: dateString,
        rawDate: rawCreatedAt && rawCreatedAt.toDate ? rawCreatedAt.toDate().getTime() : 0
      };
    })
    .sort((a, b) => b.rawDate - a.rawDate)
    .slice(0, 50);

  return <UsersClient initialUsers={users} />;
}
