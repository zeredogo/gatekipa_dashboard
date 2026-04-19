"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShieldAlert } from "lucide-react";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "admin_logs"), orderBy("created_at", "desc"), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 className="gk-title">Audit Logs</h2>
          <p className="gk-subtitle" style={{ marginBottom: 0 }}>Immutable record of all administrative actions and system overrides.</p>
        </div>
      </div>

      <div className="gk-table-wrapper glass-panel">
        <table className="gk-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin UID</th>
              <th>Action</th>
              <th>Target Entity</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={{ fontSize: "13px", color: "hsl(var(--text-muted))" }}>
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td style={{ fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--text-main))" }}>{log.admin_id.substring(0,8)}...</td>
                <td>
                   <span className="gk-badge" style={{ background: "hsl(var(--surface-light))" }}>{log.action}</span>
                </td>
                <td>
                  <div style={{ fontSize: "13px", textTransform: "capitalize" }}>{log.entity_type}</div>
                  <div style={{ fontSize: "12px", fontFamily: "monospace", color: "hsl(var(--text-muted))" }}>{log.entity_id.substring(0,8)}</div>
                </td>
                <td style={{ fontSize: "12px", fontFamily: "monospace", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {JSON.stringify(log.metadata)}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "hsl(var(--text-muted))" }}>
                  <ShieldAlert size={32} style={{ marginBottom: "16px", opacity: 0.5 }} />
                  <br />
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
