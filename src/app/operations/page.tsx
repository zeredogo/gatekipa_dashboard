"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "@/lib/firebase";
import { Activity, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function WebhookOperationsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "webhook_events"), orderBy("created_at", "desc"), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const handleRetryWebhook = async (eventId: string) => {
    if (!confirm(`Force execution of payload for Event ID: ${eventId}?`)) return;
    setProcessingId(eventId);
    
    try {
      const functions = getFunctions();
      const retryWebhook = httpsCallable(functions, 'retryWebhook');
      await retryWebhook({ eventId });
      toast.success(`Webhook ${eventId} safely re-entered execution sequence.`);
    } catch (err: any) {
      toast.error(`Retry Failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 className="gk-title">Operations Control</h2>
          <p className="gk-subtitle" style={{ marginBottom: 0 }}>Monitor system events and trigger webhook retries.</p>
        </div>
      </div>

      <div className="gk-table-wrapper glass-panel">
        <table className="gk-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Provider</th>
              <th>Event Type</th>
              <th>Status</th>
              <th>Payload Snippet</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((evt) => (
              <tr key={evt.id}>
                <td style={{ fontSize: "13px", color: "hsl(var(--text-muted))" }}>
                  {new Date(evt.created_at).toLocaleString()}
                </td>
                <td style={{ textTransform: "capitalize", fontWeight: 500 }}>{evt.provider}</td>
                <td style={{ fontFamily: "monospace", fontSize: "13px" }}>{evt.event_type}</td>
                <td>
                  {evt.status === "processed" ? (
                    <span className="gk-badge success">Processed</span>
                  ) : evt.status === "failed" ? (
                    <span className="gk-badge danger">Failed</span>
                  ) : (
                    <span className="gk-badge warning">{evt.status}</span>
                  )}
                </td>
                <td style={{ fontSize: "11px", fontFamily: "monospace", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "hsl(var(--text-muted))" }}>
                  {JSON.stringify(evt.payload?.data || {})}
                </td>
                <td>
                   <button 
                     onClick={() => handleRetryWebhook(evt.id)}
                     disabled={processingId === evt.id}
                     className="gk-button" 
                     style={{ background: "transparent", border: "1px solid hsl(var(--border-color))", color: "hsl(var(--text-main))", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}
                   >
                     <RefreshCw size={14} className={processingId === evt.id ? "animate-spin" : ""} /> 
                     {processingId === evt.id ? "Retrying..." : "Retry"}
                   </button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "hsl(var(--text-muted))" }}>
                  <Activity size={32} style={{ marginBottom: "16px", opacity: 0.5 }} />
                  <br />
                  No system events recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
