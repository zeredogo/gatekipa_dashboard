import React from "react";
import { AlertOctagon, ShieldAlert } from "lucide-react";
import { db } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export default async function FraudPage() {
  // Live query for frozen cards
  const cardsSnapshot = await db.collection("cards").where("local_status", "==", "frozen").get();
  const frozenCards = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Live query for blocked users
  const usersSnapshot = await db.collection("users").where("status", "==", "blocked").get();
  const blockedUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Fraud Monitoring</h1>
        <p className="text-gray-400 mt-1">Live overview of frozen assets and blocked accounts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Blocked Accounts</h2>
          </div>
          
          {blockedUsers.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No blocked accounts found.</p>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((user: any) => (
                <div key={user.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <p className="text-white font-medium">{user.displayName || "Unknown"}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <span className="px-2 py-1 bg-rose-500/10 text-rose-400 rounded-full text-xs font-medium uppercase tracking-wide">
                    Blocked
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Frozen Cards</h2>
          </div>
          
          {frozenCards.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No frozen cards found.</p>
          ) : (
            <div className="space-y-3">
              {frozenCards.map((card: any) => (
                <div key={card.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <p className="text-white font-medium">Card {card.bridgecard_card_id?.slice(-4) || card.id.slice(-4)}</p>
                    <p className="text-xs text-gray-400">Balance: ${(card.balance || 0).toFixed(2)}</p>
                  </div>
                  <span className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium uppercase tracking-wide">
                    Frozen
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
