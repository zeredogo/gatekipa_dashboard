"use client";

import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/client";

export default function CardActions({ cardId, initialStatus }: { cardId: string, initialStatus: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(initialStatus);

  const handleToggleFreeze = async () => {
    try {
      setLoading(true);
      const freeze = status !== "blocked";
      const adminFreezeCard = httpsCallable(functions, "adminFreezeCard");
      
      const res: any = await adminFreezeCard({
        card_id: cardId,
        freeze: freeze
      });
      
      if (res.data?.success) {
        setStatus(freeze ? "blocked" : "active");
        alert(res.data.message);
      }
    } catch (e: any) {
      alert("Failed to freeze/unfreeze card: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-50 border-t border-neutral-100 p-3 flex gap-2">
      <button 
        onClick={handleToggleFreeze}
        disabled={loading}
        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-md transition border disabled:opacity-50 ${status === 'blocked' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}`}>
        {loading ? "Processing..." : (status === 'blocked' ? 'Unfreeze Card' : 'Force Freeze')}
      </button>
      <button className="flex-1 bg-white text-neutral-700 border border-neutral-200 py-2 text-xs font-bold uppercase tracking-wide rounded-md hover:bg-neutral-50 transition">
        Audit Logs
      </button>
    </div>
  );
}
