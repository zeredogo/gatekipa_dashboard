import { db } from "@/lib/firebaseAdmin";
import TransactionsClient from "./TransactionsClient";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const transactionsSnapshot = await db.collection("transactions").get();
  
  let vaultDeposits = 0;
  let cardFunding = 0;
  let revenueFees = 0;

  const allDocs = transactionsSnapshot.docs;
  const transactions = allDocs.map(doc => {
    const data = doc.data();
    const amount = data.amount || 0;
    const type = data.type || "unknown";
    
    // Correct mapping for real transaction types
    if (type === "wallet_funding") vaultDeposits += amount;
    if (type === "wallet_to_card") cardFunding += amount;
    if (type === "card_charge") revenueFees += amount; // Assuming Bridgecard spend

    const isDebit = type === "wallet_to_card" || type === "card_charge";

    const rawCreatedAt = data.createdAt || data.created_at;
    let dateString = "Unknown";
    if (rawCreatedAt) {
      if (rawCreatedAt.toDate) {
        dateString = rawCreatedAt.toDate().toLocaleString();
      } else if (typeof rawCreatedAt === 'number') {
        dateString = new Date(rawCreatedAt).toLocaleString();
      }
    }

    return {
      id: doc.id,
      type: type,
      reference: data.metadata?.paystackRef || data.metadata?.bridgecardRef || data.reference || data.idempotency_key || doc.id.substring(0, 8),
      userId: data.user_id || data.userId || "Unknown",
      amount: amount,
      status: data.status?.toLowerCase() || "pending",
      createdAt: dateString,
      isDebit: isDebit,
      rawDate: rawCreatedAt && rawCreatedAt.toDate ? rawCreatedAt.toDate().getTime() : 0
    };
  }).sort((a, b) => b.rawDate - a.rawDate).slice(0, 50);

  // Fetch some aggregate stats or use the locally aggregated sample for now
  // Real implementation would use an aggregation query if Firestore supports it or a separate stats document.
  
  return (
    <TransactionsClient 
      initialTransactions={transactions} 
      stats={{ vaultDeposits, cardFunding, revenueFees }} 
    />
  );
}
