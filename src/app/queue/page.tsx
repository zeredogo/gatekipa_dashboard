"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "@/lib/firebase";
import { ServerCrash, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function ProviderQueuePage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "provider_queue"), orderBy("updated_at", "desc"), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const handleRetryTask = async (taskId: string) => {
    if (!confirm(`Force manual admin retry for Task ID: ${taskId}?`)) return;
    setProcessingId(taskId);
    
    try {
      const functions = getFunctions();
      const adminRetryTask = httpsCallable(functions, 'adminRetryTask');
      await adminRetryTask({ taskId });
      toast.success(`Task ${taskId} successfully re-queued for execution.`);
    } catch (err: any) {
      toast.error(`Admin Retry Failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 className="gk-title">Provider Tasks Queue</h2>
          <p className="gk-subtitle" style={{ marginBottom: 0 }}>Monitor and recover failed Bridgecard operations.</p>
        </div>
      </div>

      <div className="gk-table-wrapper glass-panel">
        <table className="gk-table">
          <thead>
            <tr>
              <th>Last Updated</th>
              <th>Operation Type</th>
              <th>Card ID</th>
              <th>Status</th>
              <th>Attempts</th>
              <th>Error Snapshot</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td style={{ fontSize: "13px", color: "hsl(var(--text-muted))" }}>
                  {task.updated_at ? new Date(task.updated_at.toMillis()).toLocaleString() : "Unknown"}
                </td>
                <td style={{ fontWeight: 600 }}>{task.type}</td>
                <td style={{ fontFamily: "monospace", fontSize: "13px" }}>{task.card_id}</td>
                <td>
                  {task.status === "completed" ? (
                    <span className="gk-badge success">Completed</span>
                  ) : task.status === "failed" ? (
                    <span className="gk-badge danger">Failed</span>
                  ) : task.status === "processing" ? (
                    <span className="gk-badge warning">Processing</span>
                  ) : (
                    <span className="gk-badge default">{task.status}</span>
                  )}
                </td>
                <td>{task.attempts}/3</td>
                <td style={{ fontSize: "11px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "hsl(var(--text-muted))" }}>
                  {task.error_message?.message || task.error_message || "-"}
                </td>
                <td>
                   <button 
                     onClick={() => handleRetryTask(task.id)}
                     disabled={processingId === task.id || task.status === "completed" || task.status === "processing" || task.status === "queued"}
                     className="gk-button" 
                     style={{ 
                       background: "transparent", 
                       border: "1px solid hsl(var(--border-color))", 
                       color: "hsl(var(--text-main))", 
                       padding: "6px 12px", 
                       display: "flex", 
                       alignItems: "center", 
                       gap: "6px",
                       opacity: (task.status === "completed" || task.status === "processing" || task.status === "queued") ? 0.4 : 1
                     }}
                   >
                     <RefreshCw size={14} className={processingId === task.id ? "animate-spin" : ""} /> 
                     {processingId === task.id ? "Retrying..." : "Force Retry"}
                   </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "hsl(var(--text-muted))" }}>
                  <ServerCrash size={32} style={{ marginBottom: "16px", opacity: 0.5 }} />
                  <br />
                  No provider tasks recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
