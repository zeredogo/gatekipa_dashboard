"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { CreditCard, RefreshCw, Lock, Unlock } from "lucide-react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

export default function CardLedgerPage() {
  const { id } = useParams();
  const cardId = id as string;

  const [card, setCard] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!cardId) return;
    const unsub = onSnapshot(doc(db, "cards", cardId), (snap) => {
      if (snap.exists()) {
        setCard({ id: snap.id, ...snap.data() });
      }
    });
    return unsub;
  }, [cardId]);

  const handleToggleFreeze = async () => {
    if (!card) return;
    const isFreezing = card.is_active;
    if (!confirm(`Are you sure you want to ${isFreezing ? "FREEZE" : "UNFREEZE"} this virtual card?`)) return;

    setLoadingAction("freeze");
    try {
      const functions = getFunctions();
      const freezeBridgecard = httpsCallable(functions, "freezeBridgecard");
      // The backend toggles based on current state or action param
      await freezeBridgecard({ cardId: card.id, action: isFreezing ? "freeze" : "unfreeze" });
      toast.success(`Card successfully ${isFreezing ? "frozen" : "unfrozen"}.`);
    } catch (err: any) {
      toast.error(`Operation Failed: ${err.message}`);
    } finally {
      setLoadingAction("");
    }
  };

  const handleSyncProvider = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const functions = getFunctions();
      const syncBridgecard = httpsCallable(functions, "syncBridgecard");
      await syncBridgecard({ card_id: cardId });
      toast.success("Card synchronized with Bridgecard network successfully.");
    } catch (err: any) {
      toast.error(`Sync Failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!card) {
    return <div style={{ color: "hsl(var(--text-muted))" }}>Loading card data...</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 className="gk-title">Virtual Card Inspector</h2>
          <p className="gk-subtitle" style={{ marginBottom: 0 }}>Card UUID: {cardId}</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
           <button 
             className={`gk-button ${isSyncing ? "opacity-50 cursor-not-allowed" : ""}`}
             style={{ background: "transparent", color: "hsl(var(--text-main))", border: "1px solid hsl(var(--border-color))", display: "flex", gap: "8px", alignItems: "center" }}
             onClick={handleSyncProvider}
             disabled={isSyncing}
           >
             <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} /> {isSyncing ? "Syncing..." : "Sync with Provider"}
           </button>
           <button 
             className="gk-button" 
             style={{ 
               background: card.is_active ? "hsl(var(--danger))" : "hsl(var(--success))", 
               display: "flex", gap: "8px", alignItems: "center", boxShadow: "none" 
             }}
             onClick={handleToggleFreeze}
             disabled={loadingAction === "freeze"}
           >
             {loadingAction === "freeze" ? <RefreshCw size={16} className="animate-spin" /> : (card.is_active ? <Lock size={16} /> : <Unlock size={16} />)}
             {card.is_active ? "Freeze Card" : "Unfreeze Card"}
           </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        <div className="glass-panel" style={{ padding: "24px" }}>
           <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", color: "hsl(var(--text-muted))" }}>Security & State</h3>
           <div style={{ fontSize: "14px", display: "grid", gap: "12px" }}>
             <div><span style={{ color: "hsl(var(--text-muted))" }}>Status:</span> &nbsp; {card.is_active ? <span className="gk-badge success">Active</span> : <span className="gk-badge danger">Frozen</span>}</div>
             <div><span style={{ color: "hsl(var(--text-muted))" }}>Type:</span> &nbsp; <span style={{ textTransform: "capitalize" }}>{card.brand || "Mastercard"}</span> Virtual</div>
             <div><span style={{ color: "hsl(var(--text-muted))" }}>Masked PAN:</span> &nbsp; **** **** **** {card.masked_pan?.slice(-4) || "0000"}</div>
             <div><span style={{ color: "hsl(var(--text-muted))" }}>Expiry:</span> &nbsp; {card.expiry_month}/{card.expiry_year}</div>
           </div>
        </div>
      </div>

    </div>
  );
}
