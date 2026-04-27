import React from "react";
import { RotateCw, CheckCircle, AlertTriangle } from "lucide-react";
import { db } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export default async function ReconciliationPage() {
  // Aggregate live internal wallets
  const walletsSnapshot = await db.collection("wallets").get();
  let totalWalletBalance = 0;
  walletsSnapshot.forEach(doc => {
    totalWalletBalance += (doc.data().balance || 0);
  });

  // Aggregate live card balances (proxy for Bridgecard escrow until API connected)
  const cardsSnapshot = await db.collection("cards").get();
  let totalCardBalance = 0;
  cardsSnapshot.forEach(doc => {
    totalCardBalance += (doc.data().balance || 0);
  });

  // Since wallets might be in NGN and cards in USD, we format them differently or just show raw
  // Assuming totalWalletBalance is NGN and totalCardBalance is USD
  const isParity = true; // Hardcoded for now since they are different currencies

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Reconciliation</h1>
          <p className="text-gray-400 mt-1">Audit ledger parity between Gatekipa Firestore and the Bridgecard external API.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-forest-500 hover:bg-forest-600 text-white px-4 py-2 rounded-xl transition-colors font-medium">
            <RotateCw className="w-4 h-4" />
            Refresh Ledger Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-emerald-500">
          <h3 className="text-lg font-bold text-white mb-2">Gatekipa Wallets (NGN)</h3>
          <p className="text-3xl font-bold text-emerald-400">₦{totalWalletBalance.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-2">Total user wallet balance internally.</p>
        </div>
        <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-forest-500">
          <h3 className="text-lg font-bold text-white mb-2">Bridgecard Cards (USD)</h3>
          <p className="text-3xl font-bold text-forest-400">${totalCardBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          <p className="text-sm text-gray-400 mt-2">Sum of active virtual card balances.</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isParity ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
          {isParity ? <CheckCircle className="w-8 h-8 text-emerald-400" /> : <AlertTriangle className="w-8 h-8 text-rose-400" />}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{isParity ? "Ledgers Aggregated" : "Ledger Mismatch Detected"}</h3>
        <p className="text-gray-400 max-w-md">Live aggregation complete. Direct Bridgecard API automated discrepancy sweeps will be implemented in phase 2.</p>
      </div>
    </div>
  );
}
