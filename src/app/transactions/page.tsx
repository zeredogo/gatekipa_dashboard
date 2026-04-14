"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Note: Live feed aggregates across the global transactions block.
    // In strict multi-tenant Firebase, we may require a Collection Group query over 'wallet'.
    const q = query(collection(db, "transactions"), limit(100)); // Remove orderBy to avoid missing index errors for this prototype
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0)));
    });
    return unsub;
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 className="gk-title">Wallets & Live Transactions</h2>
          <p className="gk-subtitle" style={{ marginBottom: 0 }}>Monitor systemic truth across all multi-currency ledgers.</p>
        </div>
      </div>

      <div className="gk-table-wrapper glass-panel">
        <table className="gk-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>User ID</th>
              <th>Type</th>
              <th>Amount (NGN)</th>
              <th>Status</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td style={{ fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--text-main))" }}>{tx.reference || tx.id.substring(0,8)}</td>
                <td style={{ fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--text-muted))" }}>{tx.uid?.substring(0,8) || "System"}</td>
                <td style={{ textTransform: "capitalize", fontWeight: 500 }}>
                  <span className={`gk-badge ${tx.type === "credit" || tx.type === "funding" ? "success" : "warning"}`}>{tx.type}</span>
                </td>
                <td style={{ fontWeight: 600 }}>₦{tx.amount?.toLocaleString() || "0"}</td>
                <td>
                  {tx.status === "success" || tx.status === "completed" ? <span className="gk-badge success">Success</span> :
                   tx.status === "failed" ? <span className="gk-badge danger">Failed</span> :
                   <span className="gk-badge warning">{tx.status || "Pending"}</span>}
                </td>
                <td style={{ fontSize: "13px", color: "hsl(var(--text-muted))" }}>
                  {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : "Unknown"}
                </td>
                <td>
                   <button style={{ color: "hsl(var(--primary))", fontSize: "13px", fontWeight: 500 }}>Details</button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "hsl(var(--text-muted))" }}>
                  No live transactions detected over the ledger.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
