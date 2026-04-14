"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AlertTriangle, Clock, ServerCrash } from "lucide-react";
import toast from "react-hot-toast";

export default function ReconciliationPage() {
  const [fundingRequests, setFundingRequests] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "card_funding_requests"));
    const unsub = onSnapshot(q, (snap) => {
      setFundingRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const stuckRequests = fundingRequests.filter(r => r.status === "processing" || r.status === "unknown_error");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 className="gk-title" style={{ color: "hsl(var(--danger))" }}>Reconciliation Desk</h2>
          <p className="gk-subtitle" style={{ marginBottom: 0 }}>Monitor and manually resolve stuck Bridgecard/Paystack transactions.</p>
        </div>
      </div>

      <div className="metrics-grid" style={{ marginBottom: "24px" }}>
        <div className="gk-card glass-panel" style={{ border: stuckRequests.length > 0 ? "1px solid hsl(var(--danger))" : undefined }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <ServerCrash color={stuckRequests.length > 0 ? "hsl(var(--danger))" : "hsl(var(--success))"} />
            <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Stuck Funding Requests</h3>
          </div>
          <p style={{ fontSize: "32px", fontWeight: 700 }}>{stuckRequests.length}</p>
          <p style={{ fontSize: "13px", color: "hsl(var(--text-muted))", marginTop: "8px" }}>
            Wallet deducted, but API response timed out or is awaiting webhook.
          </p>
        </div>
      </div>

      <div className="gk-table-wrapper glass-panel">
        <table className="gk-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>User ID</th>
              <th>Amount (NGN)</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fundingRequests.map((r) => (
              <tr key={r.id} style={{ background: (r.status === "processing" || r.status === "unknown_error") ? "hsl(var(--danger) / 0.1)" : undefined }}>
                <td style={{ fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--text-main))" }}>{r.transaction_reference || r.id}</td>
                <td style={{ fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--text-muted))" }}>{r.uid?.substring(0,8)}</td>
                <td style={{ fontWeight: 600 }}>₦{r.amount_ngn?.toLocaleString() || "0"}</td>
                <td>
                  {r.status === "completed" ? <span className="gk-badge success">Completed</span> :
                   r.status === "failed" ? <span className="gk-badge danger">Failed</span> :
                   <span className="gk-badge warning" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                     <AlertTriangle size={12} /> {r.status}
                   </span>}
                </td>
                <td style={{ fontSize: "13px", color: "hsl(var(--text-muted))" }}>
                  {r.created_at ? new Date(r.created_at).toLocaleString() : "Unknown"}
                </td>
                <td>
                  {(r.status === "processing" || r.status === "unknown_error") && (
                    <div style={{ display: "flex", gap: "8px" }}>
                       <button className="gk-button" style={{ padding: "6px 12px", fontSize: "12px", background: "hsl(var(--success))", boxShadow: "none" }}>Mark Success</button>
                       <button 
                         disabled={processingId !== null}
                         onClick={async () => {
                           if (!confirm(`Are you sure you want to refund ${r.amount_ngn} NGN to User ${r.uid}?`)) return;
                           if (processingId) return;
                           setProcessingId(r.id);
                           try {
                             const { getFunctions, httpsCallable } = await import("firebase/functions");
                             const refund = httpsCallable(getFunctions(), "processReconciliationRefund");
                             await refund({ requestId: r.id });
                             toast.success("Refund successful.");
                           } catch (err: any) {
                             toast.error(`Refund failed: ${err.message}`);
                           } finally {
                             setProcessingId(null);
                           }
                         }}
                         className={`gk-button ${processingId !== null ? "opacity-50 cursor-not-allowed" : ""}`} 
                         style={{ padding: "6px 12px", fontSize: "12px", background: "hsl(var(--surface-light))", color: "hsl(var(--text-main))", boxShadow: "none", opacity: processingId === r.id ? 0.5 : 1 }}
                       >
                         {processingId === r.id ? "Refunding..." : "Refund User"}
                       </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {fundingRequests.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "hsl(var(--text-muted))" }}>
                  No funding requests to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
