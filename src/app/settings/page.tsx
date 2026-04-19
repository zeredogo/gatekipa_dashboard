"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "@/lib/firebase";
import { Shield, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "admins"), (snap) => {
      setAdmins(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const handleSetRole = async (targetUid: string, targetRole: string) => {
    if (!confirm(`Are you sure you want to assign the role "${targetRole}" to ${targetUid}?`)) return;
    if (processingId) return;
    setProcessingId(targetUid);
    try {
      const functions = getFunctions();
      const setAdminRole = httpsCallable(functions, 'setAdminRole');
      const res: any = await setAdminRole({ targetUid, targetRole });
      toast.success(res.data?.message || "Role updated successfully.");
    } catch (err: any) {
      toast.error(`Role assignment failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 className="gk-title">Role-Based Access Control (RBAC)</h2>
          <p className="gk-subtitle" style={{ marginBottom: 0 }}>Allocate strict permissions to your team members.</p>
        </div>
        <button 
          onClick={async () => {
            const uid = prompt("Enter Target User ID:");
            if (!uid) return;
            const role = prompt("Enter Role (support, finance, compliance, super_admin):");
            if (!role) return;
            await handleSetRole(uid, role);
          }}
          className={`gk-button ${processingId === "new" ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={processingId !== null}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          {processingId === "new" ? "Processing..." : <><UserPlus size={16} /> Grant Admin Access</>}
        </button>
      </div>

      <div className="gk-table-wrapper glass-panel">
        <table className="gk-table">
          <thead>
            <tr>
              <th>Admin UID</th>
              <th>Role</th>
              <th>Granted By</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 500 }}>{admin.id}</td>
                <td>
                  <span className={`gk-badge ${admin.role === "super_admin" ? "danger" : "success"}`} style={{ textTransform: "capitalize" }}>
                    {admin.role.replace("_", " ")}
                  </span>
                </td>
                <td style={{ fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--text-muted))" }}>
                   {admin.granted_by?.substring(0,8) || "System"}
                </td>
                <td style={{ fontSize: "13px", color: "hsl(var(--text-muted))" }}>
                   {admin.updated_at ? new Date(admin.updated_at).toLocaleString() : "N/A"}
                </td>
                <td>
                   <button 
                     disabled={processingId !== null}
                     onClick={() => handleSetRole(admin.id, "none")}
                     style={{ 
                       color: "hsl(var(--danger))", 
                       fontSize: "13px", 
                       fontWeight: 500, 
                       background: "transparent", 
                       border: "none", 
                       cursor: processingId !== null ? "not-allowed" : "pointer",
                       opacity: processingId === admin.id ? 0.5 : 1 
                     }}
                   >
                     {processingId === admin.id ? "Revoking..." : "Revoke"}
                   </button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "hsl(var(--text-muted))" }}>
                  <Shield size={32} style={{ marginBottom: "16px", opacity: 0.5 }} />
                  <br />
                  No admins configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
