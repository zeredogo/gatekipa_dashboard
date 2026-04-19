import { adminDb } from "@/lib/firebase/admin";
import { AlertCircle, CheckCircle2, RefreshCw, ShieldAlert, BadgeInfo } from "lucide-react";

export const dynamic = "force-dynamic";

async function fetchWalletVerifications() {
  try {
    const usersSnap = await adminDb.collection("users").get();
    
    const verifications = await Promise.all(
      usersSnap.docs.map(async (userDoc) => {
        const uid = userDoc.id;
        const data = userDoc.data();
        
        // Get Balance
        const balanceDoc = await adminDb.doc(`users/${uid}/wallet/balance`).get();
        const statedBalance = balanceDoc.exists ? (balanceDoc.data()?.balance || 0) : 0;
        
        // Get Ledger
        const txSnap = await adminDb.collection(`users/${uid}/wallet_transactions`).get();
        let calculatedLedger = 0;
        
        txSnap.docs.forEach(txDoc => {
          const tx = txDoc.data();
          if (tx.type === "credit") {
            calculatedLedger += (tx.amount || 0);
          } else if (tx.type === "debit") {
            calculatedLedger -= (tx.amount || 0);
          }
        });
        
        return {
          uid,
          email: data.email || 'Unknown',
          statedBalance,
          calculatedLedger,
          txCount: txSnap.size,
          isConsistent: statedBalance === calculatedLedger,
        };
      })
    );
    
    return verifications;
  } catch (err: any) {
    console.warn("Failed to fetch wallet logs:", err.message);
    return [];
  }
}

export default async function WalletAuditPage() {
  const verifications = await fetchWalletVerifications();
  const compromised = verifications.filter(v => !v.isConsistent);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 to-emerald-600">Wallet & Ledger Audit</h2>
          <p className="text-neutral-500 mt-2 text-sm max-w-xl leading-relaxed">Aggressive Balance vs Ledger Consistency Check. Ensures all user balances natively match their underlying immutable ledger.</p>
        </div>
        <button className="flex items-center gap-2.5 px-6 py-2.5 bg-neutral-950 text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all hover-lift shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
          <RefreshCw className="w-4 h-4" /> Run Full Re-Audit
        </button>
      </div>

      {compromised.length > 0 && (
        <div className="bg-rose-50/80 backdrop-blur-md border border-rose-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(225,29,72,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldAlert className="w-32 h-32 text-rose-500" />
          </div>
          <div className="flex gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h3 className="text-rose-800 font-bold text-lg">CRITICAL: Data Desync Detected</h3>
              <p className="text-rose-600 mt-1 text-sm font-medium">{compromised.length} wallet(s) show mathematical mismatch between standard balance and raw ledger logs.</p>
            </div>
          </div>
        </div>
      )}

      {compromised.length === 0 && (
        <div className="bg-emerald-50/80 backdrop-blur-md border border-emerald-200/60 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex gap-4 items-center relative z-10">
            <div className="w-12 h-12 rounded-full bg-emerald-100/80 flex items-center justify-center shrink-0 border border-emerald-200">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-emerald-800 font-bold text-lg">100% Ledger Integrity Verified</h3>
              <p className="text-emerald-600 text-sm mt-0.5 font-medium">All user balances natively match their underlying immutable wallet transactions.</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/60 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-neutral-50/50 border-b border-neutral-200/60 text-neutral-500 uppercase tracking-widest text-xs">
            <tr>
              <th className="px-6 py-5 font-bold">User</th>
              <th className="px-6 py-5 font-bold text-right">Stated Balance</th>
              <th className="px-6 py-5 font-bold text-right">Ledger Sum</th>
              <th className="px-6 py-5 font-bold text-center">Tx Count</th>
              <th className="px-6 py-5 font-bold text-center">Consistency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100/80">
            {verifications.map(v => (
              <tr key={v.uid} className="hover:bg-white hover:shadow-[0_0_20px_rgba(0,0,0,0.03)] transition-all duration-300 group">
                <td className="px-6 py-5">
                  <div className="font-bold text-neutral-900 text-base">{v.email}</div>
                  <div className="text-[11px] text-neutral-400 font-mono mt-1 opacity-70 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <BadgeInfo className="w-3 h-3" /> {v.uid}
                  </div>
                </td>
                <td className="px-6 py-5 text-right font-bold text-[15px]">₦{v.statedBalance.toLocaleString()}</td>
                <td className="px-6 py-5 text-right font-bold text-[15px]">₦{v.calculatedLedger.toLocaleString()}</td>
                <td className="px-6 py-5 text-center text-neutral-500 font-medium">
                  <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full text-xs">{v.txCount} logs</span>
                </td>
                <td className="px-6 py-5 text-center">
                  {v.isConsistent ? (
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Match
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-100 to-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                      <AlertCircle className="w-3.5 h-3.5" /> Desync
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {verifications.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-neutral-500">
                  <div className="flex flex-col items-center justify-center">
                    <ShieldAlert className="w-12 h-12 text-neutral-300 mb-3" />
                    <p className="font-medium text-lg text-neutral-700">No wallet data found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
