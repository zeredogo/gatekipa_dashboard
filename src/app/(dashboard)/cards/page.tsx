import { db } from "@/lib/firebaseAdmin";
import CardsClient from "./CardsClient";

export const dynamic = "force-dynamic";

export default async function CardsPage() {
  const cardsSnapshot = await db.collection("cards").get();
  const allDocs = cardsSnapshot.docs;
  
  const cards = allDocs
    .map(doc => {
      const data = doc.data();
      const rawCreatedAt = data.createdAt || data.created_at;
      let dateString = "Unknown";
      if (rawCreatedAt) {
        if (rawCreatedAt.toDate) {
          dateString = rawCreatedAt.toDate().toLocaleDateString();
        } else if (typeof rawCreatedAt === 'number') {
          dateString = new Date(rawCreatedAt).toLocaleDateString();
        } else {
          dateString = new Date(rawCreatedAt).toLocaleDateString();
        }
      }

      return {
        id: doc.id,
        name: data.cardName || data.name || "Virtual Card",
        last4: data.last4 || data.bridgecard_card_id?.slice(-4) || "****",
        ownerId: data.userId || data.account_id || "Unknown",
        status: data.local_status || data.status || "active",
        balance: data.balance || 0,
        createdAt: dateString,
        rawDate: rawCreatedAt && rawCreatedAt.toDate ? rawCreatedAt.toDate().getTime() : 0
      };
    })
    .sort((a, b) => b.rawDate - a.rawDate)
    .slice(0, 50);

  return <CardsClient initialCards={cards} />;
}
