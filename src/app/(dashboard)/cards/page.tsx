import { adminDb } from "@/lib/firebase/admin";
import { CreditCard, Snowflake, Play, RefreshCw, AlertTriangle } from "lucide-react";

import { syncBridgecardState } from "@/app/actions";
import CardActions from "./CardActions";

export const dynamic = "force-dynamic";

async function fetchCards() {
  try {
    const snap = await adminDb.collection("cards").get();
    
    return Promise.all(snap.docs.map(async (doc) => {
      const data = doc.data();
      let liveState = null;
      
      if (data.bridgecard_card_id) {
        liveState = await syncBridgecardState(doc.id, data.bridgecard_card_id);
      }
      
      return {
        id: doc.id,
        ...data,
        liveBridgecardStatus: liveState?.is_active ? "active" : (liveState ? "frozen" : null)
      };
    }));
  } catch (err: any) {
    console.warn("Failed to fetch cards:", err.message);
    return [];
  }
}

export default async function CardsManagementPage() {
  const cards = await fetchCards();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Bridgecard Fleet Management</h2>
          <p className="text-sm text-neutral-500 mt-1">Cross-examine Firestore card states against Live Bridgecard API.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition">
          <RefreshCw className="w-4 h-4" /> Run Global State Sync
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card: any) => {
          // MISMATCH: Firestore thinks it's active, but the LIVE Bridgecard API says otherwise.
          const isMismatched = card.status === "active" && card.liveBridgecardStatus === "frozen"; 
          
          return (
            <div key={card.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col ${isMismatched ? 'border-amber-300 ring-2 ring-amber-100' : 'border-neutral-200'}`}>
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                    <CreditCard className="w-3.5 h-3.5" /> Virtual
                  </div>
                  {card.status === "blocked" ? (
                    <span className="flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      <Snowflake className="w-3 h-3" /> Blocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      <Play className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-neutral-900 text-lg">{card.name || "Unnamed Card"}</h3>
                <p className="font-mono text-neutral-500 text-sm mt-1">{card.masked_number || "**** **** **** ****"}</p>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Local Status:</span>
                    <span className="font-medium text-neutral-900">{card.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Gateway Data:</span>
                    <span className={`font-mono font-bold ${!card.liveBridgecardStatus ? 'text-neutral-400' : 'text-neutral-900'}`}>{card.liveBridgecardStatus || 'UNREACHABLE'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Firestore Cached:</span>
                    <span className="font-mono">{card.bridgecard_status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Card ID:</span>
                    <span className="font-mono text-xs text-neutral-400 max-w-[120px] truncate" title={card.bridgecard_card_id}>{card.bridgecard_card_id || 'Missing'}</span>
                  </div>
                </div>

                {isMismatched && (
                  <div className="mt-4 bg-amber-50 text-amber-800 p-2.5 rounded-lg text-xs font-medium flex gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    CRITICAL: Active in Firestore, but Live Gateway has frozen the card! Data Desync.
                  </div>
                )}
              </div>
              
              <CardActions cardId={card.id} initialStatus={card.status} />
            </div>
          );
        })}
      </div>
      
      {cards.length === 0 && (
        <div className="p-12 bg-white rounded-xl border border-neutral-200 text-center text-neutral-500">
          No virtual cards issued yet.
        </div>
      )}
    </div>
  );
}
