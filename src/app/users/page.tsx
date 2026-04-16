"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("created_at", "desc"), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 className="gk-title">User Manager</h2>
          <p className="gk-subtitle" style={{ marginBottom: 0 }}>View and moderate platform identities.</p>
        </div>
      </div>

      <div className="gk-table-wrapper glass-panel">
        <table className="gk-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email / Phone</th>
              <th>KYC Status</th>
              <th>Bridgecard</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--text-muted))" }}>{u.id.substring(0, 8)}...</td>
                <td style={{ fontWeight: 500 }}>{u.firstName || "Unknown"} {u.lastName || ""}</td>
                <td>
                  <div style={{ fontSize: "13px" }}>{u.email}</div>
                  <div style={{ fontSize: "12px", color: "hsl(var(--text-muted))" }}>{u.phone}</div>
                </td>
                <td>
                  {u.hasBvn ? <span className="gk-badge success">Verified</span> : <span className="gk-badge warning">Pending</span>}
                </td>
                <td>
                  {u.bridgecard_cardholder_id 
                    ? <span className="gk-badge success">Registered</span> 
                    : <span className="gk-badge" style={{ background: "hsl(var(--surface-light))" }}>Unregistered</span>}
                </td>
                <td>
                  <Link href={`/users/${u.id}`} style={{ color: "hsl(var(--primary))", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "hsl(var(--text-muted))" }}>
                  No users found matching query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
