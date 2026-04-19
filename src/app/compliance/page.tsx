"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, limit, orderBy } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "@/lib/firebase";
import { FileCheck, Activity } from "lucide-react";
import toast from "react-hot-toast";

export default function CompliancePage() {
  const [kycRecords, setKycRecords] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Listens to global kyc_records to verify user documents
    const q = query(collection(db, "kyc_records"), orderBy("submitted_at", "desc"), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setKycRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const handleModerate = async (recordId: string, decision: "approved" | "rejected") => {
    if (!confirm(`Are you sure you want to ${decision} this identity record?`)) return;
    setProcessingId(recordId);
    
    try {
      const functions = getFunctions();
      const moderateKYC = httpsCallable(functions, 'moderateKYC');
      await moderateKYC({ recordId, decision, reason: "Manual Review" });
      toast.success(`User KYC successfully ${decision}.`);
    } catch (err: any) {
      toast.error(`Moderation failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 className="gk-title">Compliance Desk</h2>
          <p className="gk-subtitle" style={{ marginBottom: 0 }}>Review identity verification documents and handle manual KYC approvals.</p>
        </div>
      </div>

      <div className="gk-table-wrapper glass-panel">
        <table className="gk-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Tier Level</th>
              <th>Status</th>
              <th>Submitted At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {kycRecords.map((record) => (
              <tr key={record.id}>
                <td style={{ fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--text-main))" }}>{record.user_id?.substring(0,8) || record.id}</td>
                <td style={{ fontWeight: 500 }}>{record.level || "tier1"}</td>
                <td>
                  {record.status === "approved" ? (
                    <span className="gk-badge success">Approved</span>
                  ) : record.status === "rejected" ? (
                    <span className="gk-badge danger">Rejected</span>
                  ) : (
                    <span className="gk-badge warning">Pending</span>
                  )}
                </td>
                <td style={{ fontSize: "13px", color: "hsl(var(--text-muted))" }}>
                   {record.submitted_at ? new Date(record.submitted_at).toLocaleString() : "Unknown"}
                </td>
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                     <button className="gk-button" style={{ background: "transparent", color: "hsl(var(--text-main))", border: "1px solid hsl(var(--border-color))", padding: "6px 12px", fontSize: "12px" }}>
                       Review Docs
                     </button>
                     {record.status === "pending" && (
                       <>
                         <button 
                           onClick={() => handleModerate(record.id, "approved")}
                           disabled={processingId === record.id}
                           className="gk-button" 
                           style={{ background: "hsl(var(--success))", color: "white", padding: "6px 12px", fontSize: "12px", boxShadow: "none" }}
                         >
                           {processingId === record.id ? <Activity size={12} className="animate-spin" /> : "Approve"}
                         </button>
                         <button 
                           onClick={() => handleModerate(record.id, "rejected")}
                           disabled={processingId === record.id}
                           className="gk-button" 
                           style={{ background: "hsl(var(--danger))", color: "white", padding: "6px 12px", fontSize: "12px", boxShadow: "none" }}
                         >
                           Reject
                         </button>
                       </>
                     )}
                  </div>
                </td>
              </tr>
            ))}
            {kycRecords.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "hsl(var(--text-muted))" }}>
                  <FileCheck size={32} style={{ marginBottom: "16px", opacity: 0.5 }} />
                  <br />
                  No pending KYC verifications.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
