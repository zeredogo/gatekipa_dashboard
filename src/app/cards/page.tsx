"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CardsPage() {
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "cards"));
    const unsub = onSnapshot(q, (snap) => {
      setCards(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 className="gk-title">Virtual Cards</h2>
          <p className="gk-subtitle" style={{ marginBottom: 0 }}>Monitor Bridgecard issuance and lifecycle.</p>
        </div>
      </div>

      <div className="gk-table-wrapper glass-panel">
        <table className="gk-table">
          <thead>
            <tr>
              <th>Internal ID</th>
              <th>Bridgecard ID</th>
              <th>Name</th>
              <th>Type / Category</th>
              <th>Last 4</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((c) => (
              <tr key={c.id}>
                <td style={{ fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--text-muted))" }}>{c.id.substring(0, 8)}</td>
                <td style={{ fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--text-muted))" }}>{c.bridgecard_card_id?.substring(0, 8) || "N/A"}</td>
                <td style={{ fontWeight: 500 }}>{c.name || "Unnamed Card"}</td>
                <td>
                  <div style={{ fontSize: "13px", textTransform: "capitalize" }}>{c.card_type}</div>
                  <div style={{ fontSize: "12px", color: "hsl(var(--text-muted))", textTransform: "capitalize" }}>{c.category}</div>
                </td>
                <td style={{ fontFamily: "monospace" }}>•••• {c.last4 || "****"}</td>
                <td>
                  {c.status === "active" ? (
                    <span className="gk-badge success">Active</span>
                  ) : c.status === "blocked" ? (
                    <span className="gk-badge danger">Blocked</span>
                  ) : (
                    <span className="gk-badge warning">{c.status}</span>
                  )}
                </td>
                <td>
                  <Link 
                    href={`/cards/${c.id}`} 
                    className="gk-button" 
                    style={{ padding: "6px 12px", fontSize: "12px", textDecoration: "none", display: "inline-block" }}
                  >
                    View Card
                  </Link>
                </td>
              </tr>
            ))}
            {cards.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "hsl(var(--text-muted))" }}>
                  No virtual cards issued yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
