import React from "react";
import { ShieldCheck, Search, Filter } from "lucide-react";
import { db } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  // Live query for KYC issues
  const snapshot = await db.collection("users").where("kycStatus", "in", ["pending", "rejected"]).get();
  const pendingReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Compliance & KYC Inbox</h1>
          <p className="text-gray-400 mt-1">Review flagged accounts and manual identity verification requests.</p>
        </div>
      </div>

      {pendingReviews.length === 0 ? (
        <div className="glass-panel rounded-2xl overflow-hidden p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-forest-500/10 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-forest-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Inbox Zero</h3>
          <p className="text-gray-400 max-w-md">There are no pending manual KYC reviews. All active users have successfully completed automated identity verification via QoreID.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-sm font-medium text-gray-400">
                <th className="p-4 font-medium">User ID</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {pendingReviews.map((user: any) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4"><code className="text-sm text-gray-300">{user.id}</code></td>
                  <td className="p-4">{user.displayName || user.firstName || "Unknown"}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-medium uppercase tracking-wide">
                      {user.kycStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-forest-400 hover:text-forest-300 text-sm font-medium">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
