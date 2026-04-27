import React from "react";
import { Zap, Activity } from "lucide-react";
import { db } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export default async function WebhooksPage() {
  // Fetch live webhook events
  const snapshot = await db.collection("webhook_events").orderBy("createdAt", "desc").limit(20).get();
  const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Webhook Traffic</h1>
          <p className="text-gray-400 mt-1">Live feed of incoming API events from Paystack and Bridgecard.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-forest-500/10 border border-forest-500/20 rounded-xl">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-forest-500"></span>
            </span>
            <span className="text-forest-400 font-medium text-sm">Listening</span>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        {events.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Activity className="w-12 h-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-white">No webhooks received yet</h3>
            <p className="text-gray-400 mt-1">Waiting for incoming events from partners...</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-sm font-medium text-gray-400">
                <th className="p-4">Event ID</th>
                <th className="p-4">Type</th>
                <th className="p-4">Provider</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {events.map((evt: any) => (
                <tr key={evt.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4"><code className="text-xs text-gray-400">{evt.id}</code></td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded font-mono text-xs text-gray-300">
                      {evt.event || evt.type || "unknown.event"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${evt.provider === 'paystack' ? 'text-indigo-400' : 'text-forest-400'}`}>
                      {evt.provider || "Unknown"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {evt.createdAt ? new Date(evt.createdAt).toLocaleString() : "Just now"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
