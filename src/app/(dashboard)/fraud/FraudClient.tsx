"use client";

import React, { useState, useTransition } from "react";
import { AlertOctagon, ShieldAlert, CheckCircle, Loader2 } from "lucide-react";
import { toggleUserBlockStatus, toggleCardFreeze } from "@/app/actions/adminActions";

export default function FraudClient({ initialFrozenCards, initialBlockedUsers }: { initialFrozenCards: any[], initialBlockedUsers: any[] }) {
  const [frozenCards, setFrozenCards] = useState(initialFrozenCards);
  const [blockedUsers, setBlockedUsers] = useState(initialBlockedUsers);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUnblockUser = (userId: string) => {
    setPendingId(userId);
    startTransition(async () => {
      const result = await toggleUserBlockStatus(userId, "blocked");
      if (result.success) {
        setBlockedUsers(blockedUsers.filter(u => u.id !== userId));
      }
      setPendingId(null);
    });
  };

  const handleUnfreezeCard = (cardId: string) => {
    setPendingId(cardId);
    startTransition(async () => {
      const result = await toggleCardFreeze(cardId, "frozen");
      if (result.success) {
        setFrozenCards(frozenCards.filter(c => c.id !== cardId));
      }
      setPendingId(null);
    });
  };

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
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-rose-500/10 text-rose-400 rounded-full text-xs font-medium uppercase tracking-wide">
                      Blocked
                    </span>
                    <button 
                      onClick={() => handleUnblockUser(user.id)}
                      disabled={pendingId === user.id}
                      className="text-emerald-400 hover:text-emerald-300 text-xs font-medium flex items-center gap-1 ml-2 disabled:opacity-50"
                    >
                      {pendingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Unblock
                    </button>
                  </div>
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
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium uppercase tracking-wide">
                      Frozen
                    </span>
                    <button 
                      onClick={() => handleUnfreezeCard(card.id)}
                      disabled={pendingId === card.id}
                      className="text-emerald-400 hover:text-emerald-300 text-xs font-medium flex items-center gap-1 ml-2 disabled:opacity-50"
                    >
                      {pendingId === card.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Unfreeze
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
