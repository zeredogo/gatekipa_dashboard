import { adminDb } from "./src/lib/firebase/admin";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function query() {
  console.log("Querying martynseric's account...");
  try {
    const snap = await adminDb.collection("users").where("email", "==", "martynseric@gmail.com").get();
    if (snap.empty) {
      // maybe it's just 'martynseric'
      const all = await adminDb.collection("users").get();
      let uid = null;
      all.forEach(d => {
        if (d.data().email?.includes("martynseric")) {
           uid = d.id;
        }
      });
      if (!uid) {
        console.log("Not found.");
        process.exit(0);
      }
      return await checkUid(uid);
    }
    return await checkUid(snap.docs[0].id);
  } catch (e) {
    console.error(e);
  }
}

async function checkUid(uid) {
  console.log("UID:", uid);
  const bal = await adminDb.doc(`users/${uid}/wallet/balance`).get();
  console.log("Balance:", bal.data());
  
  const h = await adminDb.collection(`users/${uid}/funding_history`).get();
  console.log("Funding events:");
  h.forEach(d => console.log(d.id, d.data()));
  
  const t = await adminDb.collection(`users/${uid}/wallet_transactions`).get();
  console.log("Ledger:");
  t.forEach(d => console.log(d.id, d.data()));
  process.exit(0);
}

query();
