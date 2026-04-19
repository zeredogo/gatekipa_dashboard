import { adminDb } from "@/lib/firebase/admin";
import { Activity, ShieldCheck, PlayCircle, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

async function fetchWebhookEvents() {
  const eventsSnap = await adminDb.collection("webhook_events")
    .orderBy("processed_at", "desc")
    .limit(50)
    .get();
    
  return eventsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    processed_at: doc.data().processed_at?.toDate()?.toISOString() || new Date().toISOString(),
  }));
}

export default async function WebhooksPage() {
  const events = await fetchWebhookEvents();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Transaction Monitor</h2>
          <p className="text-sm text-neutral-500 mt-1">Live webhook processing, signature tracing, and idempotency states.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          <PlayCircle className="w-4 h-4" /> Simulate Webhook Event
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Event ID</th>
              <th className="px-6 py-4 font-semibold">Event Type</th>
              <th className="px-6 py-4 font-semibold">Processed At</th>
              <th className="px-6 py-4 font-semibold text-center">Idempotency Lock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {events.map((event: any) => (
              <tr key={event.id} className="hover:bg-neutral-50 transition">
                <td className="px-6 py-4 font-mono text-xs text-neutral-600">
                  {event.id}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded-md text-xs font-bold font-mono">
                    {event.event_type || 'transaction.authorisation'}
                  </span>
                </td>
                <td className="px-6 py-4 text-neutral-500">
                  {new Date(event.processed_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    <ShieldCheck className="w-3.5 h-3.5" /> Secured
                  </span>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
               <tr>
               <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                 <div className="flex flex-col items-center justify-center space-y-3">
                    <Activity className="w-8 h-8 text-neutral-300" />
                    <span>No Webhook Idempotency records found yet.</span>
                 </div>
               </td>
             </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
