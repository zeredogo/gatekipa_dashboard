"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AlertCircle } from "lucide-react";

export default function FraudAndRiskPage() {
  const [flags, setFlags] = useState<any[]>([]);

  useEffect(() => {
    // Listens to global risk_flags for velocity checks and suspicious behavior
    const q = query(collection(db, "risk_flags"), orderBy("created_at", "desc"), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setFlags(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const handleInvestigate = async (id: string, status: string) => {
    if (status === "resolved") return;
    try {
      await updateDoc(doc(db, "risk_flags", id), { status: "resolved", updated_at: Date.now() });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 className="gk-title" style={{ color: "hsl(var(--danger))" }}>Fraud & Risk Flags</h2>
          <p className="gk-subtitle" style={{ marginBottom: 0 }}>Review velocity alerts, IP anomalies, and blocked behavior engines.</p>
        </div>
      </div>

      <div className="gk-table-wrapper glass-panel">
        <table className="gk-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User ID</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => (
              <tr key={flag.id}>
                <td style={{ fontSize: "13px", color: "hsl(var(--text-muted))" }}>
                  {new Date(flag.created_at).toLocaleString()}
                </td>
                <td style={{ fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--text-main))" }}>{flag.user_id?.substring(0,8) || flag.uid?.substring(0,8)}</td>
                <td style={{ fontWeight: 500, color: "hsl(var(--text-main))" }}>{flag.type?.replace("_", " ") || "Suspicious Activity"}</td>
                <td>
                  <span className={`gk-badge ${flag.severity === "high" || flag.severity === "critical" ? "danger" : "warning"}`} style={{ textTransform: "capitalize" }}>
                    {flag.severity || "medium"}
                  </span>
                </td>
                <td>
                  {flag.status === "open" ? (
                    <span className="gk-badge danger">Open</span>
                  ) : (
                    <span className="gk-badge success">Resolved</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => handleInvestigate(flag.id, flag.status)}
                    disabled={flag.status === "resolved"}
                    className="gk-button" 
                    style={{ background: "transparent", border: "1px solid hsl(var(--border-color))", color: "hsl(var(--text-main))", padding: "6px 12px", opacity: flag.status === "resolved" ? 0.5 : 1 }}>
                    {flag.status === "resolved" ? "Closed" : "Investigate"}
                  </button>
                </td>
              </tr>
            ))}
            {flags.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "hsl(var(--text-muted))" }}>
                   <AlertCircle size={32} style={{ marginBottom: "16px", opacity: 0.5 }} />
                   <br />
                  No open risk flags detected.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
