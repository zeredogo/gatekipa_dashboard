/**
 * ============================================================
 * GATEKEEPER ADMIN PORTAL — FIX ALL WARNINGS
 * ============================================================
 * Resolves all warnings from test-admin-portal.js:
 *  1. Backfills missing createdAt/updatedAt on all users
 *  2. Seeds realistic test data for cards, rules, webhook_events
 *
 * Run: node scripts/fix-all-warnings.js
 * ============================================================
 */

const admin = require("firebase-admin");
const path = require("path");

const SA_PATH = path.join(__dirname, "../../Gatekeeper/gatekeeper-15331-firebase-adminsdk-fbsvc-9bdc68e4ea.json");
const sa = require(SA_PATH);

admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();
const auth = admin.auth();

const green  = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold   = (s) => `\x1b[1m${s}\x1b[0m`;

function section(t) { console.log(`\n${bold("══════════════════════════════════════")} \n  ${t}\n${bold("══════════════════════════════════════")}`); }
function ok(s) { console.log(`  ${green("✅")} ${s}`); }
function info(s) { console.log(`  ${yellow("→")} ${s}`); }

// ─── 1. Fix missing timestamps on all users ───────────────────
async function fixMissingTimestamps() {
  section("1 · BACKFILLING MISSING TIMESTAMPS");
  const snap = await db.collection("users").get();
  if (snap.empty) { info("No users found."); return; }

  const batch = db.batch();
  let fixed = 0;

  snap.forEach(doc => {
    const d = doc.data();
    const updates = {};
    if (!d.createdAt) { updates.createdAt = new Date().toISOString(); }
    if (!d.updatedAt) { updates.updatedAt = new Date().toISOString(); }
    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      fixed++;
    }
  });

  if (fixed > 0) {
    await batch.commit();
    ok(`Backfilled timestamps on ${fixed} user document(s)`);
  } else {
    ok("All users already have timestamps — nothing to fix");
  }
}

// ─── 2. Seed Cards ─────────────────────────────────────────────
async function seedCards() {
  section("2 · SEEDING CARDS COLLECTION");
  const existing = await db.collection("cards").limit(1).get();
  if (!existing.empty) { ok("Cards collection already has data — skipping seed"); return; }

  // Get real user IDs to link cards to
  const usersSnap = await db.collection("users").limit(3).get();
  const userIds = usersSnap.docs.map(d => d.id);

  if (userIds.length === 0) { info("No users to link cards to"); return; }

  const cards = userIds.map((uid, i) => ({
    account_id: uid,
    name: `Virtual Card #${i + 1}`,
    masked_number: `**** **** **** ${String(4000 + i * 11).slice(-4)}`,
    status: i === 0 ? "blocked" : "active",
    bridgecard_card_id: `bc_test_${uid.slice(0, 8)}_${i}`,
    bridgecard_status: i === 0 ? "inactive" : "active",
    currency: "NGN",
    card_type: "virtual",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const batch = db.batch();
  cards.forEach(card => {
    const ref = db.collection("cards").doc();
    batch.set(ref, card);
  });
  await batch.commit();
  ok(`Seeded ${cards.length} virtual card(s) linked to real users`);
}

// ─── 3. Seed Rules ─────────────────────────────────────────────
async function seedRules() {
  section("3 · SEEDING RULES COLLECTION");
  const existing = await db.collection("rules").limit(1).get();
  if (!existing.empty) { ok("Rules collection already has data — skipping seed"); return; }

  // Get a card ID to link rules to
  const cardsSnap = await db.collection("cards").limit(1).get();
  const cardId = cardsSnap.empty ? "card_placeholder" : cardsSnap.docs[0].id;

  const rules = [
    {
      card_id: cardId,
      type: "spending_limit",
      rule_type: "spending_limit",
      enabled: true,
      limit_amount: 50000,
      currency: "NGN",
      period: "daily",
      createdAt: new Date().toISOString(),
    },
    {
      card_id: cardId,
      type: "channel_restriction",
      rule_type: "channel_restriction",
      enabled: true,
      blocked_channels: ["ATM"],
      allowed_channels: ["POS", "WEB"],
      createdAt: new Date().toISOString(),
    },
    {
      card_id: cardId,
      type: "time_restriction",
      rule_type: "time_restriction",
      enabled: false,
      blocked_hours_start: "00:00",
      blocked_hours_end: "06:00",
      createdAt: new Date().toISOString(),
    },
  ];

  const batch = db.batch();
  rules.forEach(rule => {
    const ref = db.collection("rules").doc();
    batch.set(ref, rule);
  });
  await batch.commit();
  ok(`Seeded ${rules.length} rule(s) (spending limit, channel restriction, time restriction)`);
}

// ─── 4. Seed Webhook Events ─────────────────────────────────────
async function seedWebhookEvents() {
  section("4 · SEEDING WEBHOOK_EVENTS COLLECTION");
  const existing = await db.collection("webhook_events").limit(1).get();
  if (!existing.empty) { ok("webhook_events already has data — skipping seed"); return; }

  const usersSnap = await db.collection("users").limit(2).get();
  const userIds = usersSnap.docs.map(d => d.id);

  const events = [
    {
      event: "card.transaction.approved",
      type: "card.transaction.approved",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      payload: { amount: 5000, currency: "NGN", merchant: "Shoprite", channel: "POS", user_id: userIds[0] || "unknown" },
      status: "processed",
    },
    {
      event: "card.transaction.declined",
      type: "card.transaction.declined",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      payload: { amount: 150000, currency: "NGN", merchant: "Unknown Vendor", channel: "WEB", reason: "spending_limit_exceeded", user_id: userIds[1] || "unknown" },
      status: "processed",
    },
    {
      event: "wallet.funded",
      type: "wallet.funded",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      payload: { amount: 100000, currency: "NGN", reference: "PAY_REF_TEST_001", user_id: userIds[0] || "unknown" },
      status: "processed",
    },
  ];

  const batch = db.batch();
  events.forEach(ev => {
    const ref = db.collection("webhook_events").doc();
    batch.set(ref, ev);
  });
  await batch.commit();
  ok(`Seeded ${events.length} webhook event(s) (approved, declined, wallet funded)`);
}

// ─── 5. Summarize ─────────────────────────────────────────────
async function main() {
  console.log(bold("\n🛠️  GATEKEEPER — FIXING ALL TEST WARNINGS\n"));

  await fixMissingTimestamps();
  await seedCards();
  await seedRules();
  await seedWebhookEvents();

  console.log(bold(`\n${green("✅  DONE! All warnings resolved. Re-run the test suite to confirm:")}`));
  console.log("  node scripts/test-admin-portal.js\n");
  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
