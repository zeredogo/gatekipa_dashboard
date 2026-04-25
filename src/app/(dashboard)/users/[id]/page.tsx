"use client";

import { useEffect, useState } from "react";
import { doc, collection, onSnapshot, query, where, orderBy, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, Activity, CreditCard, RefreshCw, FileText } from "lucide-react";
import { useParams } from "next/navigation";

export default function UserTimelinePage() {
  const { id } = useParams();
  const userId = id as string;

  const [userProfile, setUserProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Fetch User Record
    const userUnsub = onSnapshot(doc(db, "users", userId), (snap) => {
      setUserProfile({ id: snap.id, ...snap.data() });
    });

    // Fetch Wallet
    const walletUnsub = onSnapshot(doc(db, "users", userId, "wallet", "balance"), (snap) => {
      setWallet(snap.exists() ? snap.data() : { balance: 0 });
    });

    // Fetch Transactions
    const txQ = query(collection(db, "transactions"), where("uid", "==", userId));
    const txUnsub = onSnapshot(txQ, (snap) => {
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a:any,b:any) => b.timestamp - a.timestamp));
    });

    // Fetch Virtual Cards
    const cardQ = query(collection(db, "cards"), where("uid", "==", userId));
    const cardUnsub = onSnapshot(cardQ, (snap) => {
      setCards(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Admin Log actions touching this user
    const logQ = query(collection(db, "admin_logs"), where("entity_id", "==", userId));
    const logUnsub = onSnapshot(logQ, (snap) => {
      setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a:any,b:any) => b.created_at - a.created_at));
    });

    return () => {
      userUnsub();
      walletUnsub();
      txUnsub();
      cardUnsub();
      logUnsub();
    };
  }, [userId]);

  if (!userProfile) {
    return <div style={{ color: "hsl(var(--text-muted))" }}>Loading identity profile...</div>;
  }

  // Interleave logic to build ultimate timeline (putting everything chronologically)
  // To keep it simple, we'll just display structured tabs or sections.
  
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 className="gk-title">{userProfile?.displayName || userProfile?.email || "Unknown User"}</h2>
          <p className="gk-subtitle" style={{ marginBottom: 0 }}>ID: {userId}</p>
        </div>
        <div>
           <span className={`gk-badge ${userProfile?.kycStatus?.includes("verified") ? "success" : "warning"}`}>
             KYC: {userProfile?.kycStatus || "pending"}
           </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "hsl(var(--text-muted))" }}>Available Balance</h3>
          <h1 style={{ fontSize: "32px", margin: 0 }}>₦{wallet?.balance ? (wallet.balance / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</h1>
        </div>
        <div className="glass-panel" style={{ padding: "24px" }}>
           <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", color: "hsl(var(--text-muted))" }}>Identity Metadata</h3>
           <div style={{ fontSize: "13px", display: "grid", gap: "8px" }}>
             <div><span style={{ color: "hsl(var(--text-muted))" }}>Email:</span> {userProfile?.email}</div>
             <div><span style={{ color: "hsl(var(--text-muted))" }}>Tier:</span> {userProfile?.kycLevel || "tier1"}</div>
             <div><span style={{ color: "hsl(var(--text-muted))" }}>Created At:</span> {userProfile?.createdAt ? new Date(userProfile?.createdAt?.seconds * 1000 || userProfile?.createdAt).toLocaleString() : "Syncing..."}</div>
           </div>
        </div>
      </div>

      <h3 style={{ fontSize: "18px", marginTop: "32px", marginBottom: "16px" }}>Virtual Cards</h3>
      <div className="gk-table-wrapper glass-panel" style={{ marginBottom: "24px" }}>
        <table className="gk-table">
          <thead>
            <tr>
              <th>Card ID</th>
              <th>Status</th>
              <th>Available Balance</th>
            </tr>
          </thead>
          <tbody>
            {cards.map(c => (
              <tr key={c.id}>
                <td style={{ fontFamily: "monospace", fontSize: "13px" }}>{c.id}</td>
                <td>{c.is_active ? <span className="gk-badge success">Active</span> : <span className="gk-badge danger">Frozen</span>}</td>
                <td>--</td>
              </tr>
            ))}
            {cards.length === 0 && <tr><td colSpan={3} style={{ textAlign: "center", color: "hsl(var(--text-muted))" }}>No active cards.</td></tr>}
          </tbody>
        </table>
      </div>

      <h3 style={{ fontSize: "18px", marginTop: "32px", marginBottom: "16px" }}>Complete Activity Ledger</h3>
      <div className="gk-table-wrapper glass-panel">
        <table className="gk-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action Type</th>
              <th>Status</th>
              <th>Impact / Value</th>
            </tr>
          </thead>
          <tbody>
             {transactions.map(t => (
               <tr key={t.id}>
                 <td style={{ fontSize: "13px", color: "hsl(var(--text-muted))" }}>{t.timestamp ? new Date(t.timestamp).toLocaleString() : ""}</td>
                 <td style={{ fontWeight: 500, textTransform: "capitalize" }}>Wallet {t.type}</td>
                 <td>{t.status}</td>
                 <td style={{ fontWeight: 600, color: t.type === "credit" || t.type === "funding" ? "hsl(var(--success))" : "hsl(var(--text-main))" }}>
                   {t.type === "credit" || t.type === "funding" ? "+" : ""}₦{t.amount?.toLocaleString()}
                 </td>
               </tr>
             ))}
             {transactions.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "hsl(var(--text-muted))" }}>No recorded history.</td></tr>}
          </tbody>
        </table>
      </div>

    </div>
  );
}
