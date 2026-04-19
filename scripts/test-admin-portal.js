/**
 * ============================================================
 * GATEKEEPER ADMIN PORTAL — COMPREHENSIVE TEST SUITE
 * ============================================================
 * Tests: Schema integrity, Firebase backend connectivity,
 *        and all dashboard feature modules.
 *
 * Run: node scripts/test-admin-portal.js
 * ============================================================
 */

const admin = require("firebase-admin");
const path = require("path");

const SA_PATH = path.join(__dirname, "../../Gatekeeper/gatekeeper-15331-firebase-adminsdk-fbsvc-9bdc68e4ea.json");

let db, auth;
let PASS = 0, FAIL = 0, WARN = 0;

// ─── Helpers ──────────────────────────────────────────────────
const green  = (s) => `\x1b[32m${s}\x1b[0m`;
const red    = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold   = (s) => `\x1b[1m${s}\x1b[0m`;
const dim    = (s) => `\x1b[2m${s}\x1b[0m`;

function pass(label) { PASS++; console.log(`  ${green("✅ PASS")}  ${label}`); }
function fail(label, detail = "") { FAIL++; console.log(`  ${red("❌ FAIL")}  ${label}${detail ? dim(" → " + detail) : ""}`); }
function warn(label, detail = "") { WARN++; console.log(`  ${yellow("⚠️  WARN")}  ${label}${detail ? dim(" → " + detail) : ""}`); }
function section(title) { console.log(`\n${bold("══════════════════════════════════════════")}`); console.log(bold(`  ${title}`)); console.log(bold("══════════════════════════════════════════")); }

// ─── Init ─────────────────────────────────────────────────────
async function init() {
  try {
    const sa = require(SA_PATH);
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    db = admin.firestore();
    auth = admin.auth();
    console.log(green(`\n[INIT] Connected → Firebase project: ${sa.project_id}`));
  } catch (e) {
    console.error(red(`[FATAL] Cannot initialize Firebase Admin: ${e.message}`));
    process.exit(1);
  }
}

// ─── TEST 1: Firebase Connectivity ───────────────────────────
async function testConnectivity() {
  section("1 · FIREBASE CONNECTIVITY");
  try {
    await db.collection("_health_check").limit(1).get();
    pass("Firestore read connection established");
  } catch (e) { fail("Firestore connection failed", e.message); }

  try {
    await auth.listUsers(1);
    pass("Firebase Auth connection established");
  } catch (e) { fail("Firebase Auth connection failed", e.message); }
}

// ─── TEST 2: Schema — Users Collection ───────────────────────
async function testUsersSchema() {
  section("2 · SCHEMA INTEGRITY — /users");
  const REQUIRED_FIELDS = ["email", "displayName", "kycStatus", "createdAt"];

  try {
    const snap = await db.collection("users").limit(50).get();
    if (snap.empty) { warn("No users found in database"); return; }
    pass(`Collection exists — ${snap.size} documents`);

    let missingKyc = 0, missingBvn = 0, missingEmail = 0, missingDisplayName = 0, missingTimestamp = 0;

    snap.forEach(doc => {
      const d = doc.data();
      if (!d.email)       missingEmail++;
      if (!d.displayName) missingDisplayName++;
      if (!d.kycStatus)   missingKyc++;
      if (!d.bvn)         missingBvn++;
      if (!d.createdAt)   missingTimestamp++;
    });

    missingEmail       ? fail(`${missingEmail} user(s) missing email`)          : pass("All users have email");
    missingDisplayName ? warn(`${missingDisplayName} user(s) missing displayName`) : pass("All users have displayName");
    missingKyc         ? warn(`${missingKyc} user(s) missing kycStatus`)        : pass("All users have kycStatus");
    missingBvn         ? warn(`${missingBvn} user(s) missing BVN`)              : pass("All users have BVN");
    missingTimestamp   ? warn(`${missingTimestamp} user(s) missing createdAt`)  : pass("All users have createdAt timestamp");
  } catch (e) { fail("User schema check failed", e.message); }
}

// ─── TEST 3: Schema — Wallets ─────────────────────────────────
async function testWalletSchema() {
  section("3 · SCHEMA INTEGRITY — /users/{uid}/wallet/balance");
  try {
    const usersSnap = await db.collection("users").limit(20).get();
    if (usersSnap.empty) { warn("No users to check wallet for"); return; }

    let hasWallet = 0, missingWallet = 0, negativeBalance = 0;

    for (const userDoc of usersSnap.docs) {
      const walletSnap = await db.doc(`users/${userDoc.id}/wallet/balance`).get();
      if (!walletSnap.exists) {
        missingWallet++;
      } else {
        hasWallet++;
        const bal = walletSnap.data().balance;
        if (typeof bal !== "number") fail(`User ${userDoc.id} wallet balance is not a number (got: ${typeof bal})`);
        if (bal < 0) negativeBalance++;
      }
    }

    hasWallet    > 0 ? pass(`${hasWallet} users have wallet sub-document`) : warn("No wallet documents found");
    missingWallet > 0 ? warn(`${missingWallet} users are missing /wallet/balance`) : pass("All checked users have wallet balance");
    negativeBalance  ? fail(`${negativeBalance} wallets have negative balance`) : pass("No negative balances detected");
  } catch (e) { fail("Wallet schema check failed", e.message); }
}

// ─── TEST 4: Schema — Cards Collection ───────────────────────
async function testCardsSchema() {
  section("4 · SCHEMA INTEGRITY — /cards");
  try {
    const snap = await db.collection("cards").limit(50).get();
    if (snap.empty) { warn("No cards issued yet"); return; }
    pass(`Collection exists — ${snap.size} documents`);

    let missingStatus = 0, missingAccountId = 0, missingBridgecardId = 0;
    snap.forEach(doc => {
      const d = doc.data();
      if (!d.status)           missingStatus++;
      if (!d.account_id)       missingAccountId++;
      if (!d.bridgecard_card_id) missingBridgecardId++;
    });

    missingStatus      ? fail(`${missingStatus} card(s) missing status field`)          : pass("All cards have status field");
    missingAccountId   ? warn(`${missingAccountId} card(s) missing account_id`)         : pass("All cards have account_id");
    missingBridgecardId? warn(`${missingBridgecardId} card(s) missing bridgecard_card_id`) : pass("All cards have Bridgecard ID");
  } catch (e) { fail("Cards schema check failed", e.message); }
}

// ─── TEST 5: Schema — Rules Collection ───────────────────────
async function testRulesSchema() {
  section("5 · SCHEMA INTEGRITY — /rules");
  try {
    const snap = await db.collection("rules").limit(50).get();
    if (snap.empty) { warn("No rules configured yet"); return; }
    pass(`Collection exists — ${snap.size} rule documents`);

    let missingCardId = 0, missingType = 0, missingEnabled = 0;
    snap.forEach(doc => {
      const d = doc.data();
      if (!d.card_id)              missingCardId++;
      if (!d.type && !d.rule_type) missingType++;
      if (d.enabled === undefined) missingEnabled++;
    });

    missingCardId  ? warn(`${missingCardId} rule(s) missing card_id reference`) : pass("All rules have card_id");
    missingType    ? warn(`${missingType} rule(s) missing type/rule_type`)       : pass("All rules have type field");
    missingEnabled ? warn(`${missingEnabled} rule(s) missing enabled flag`)      : pass("All rules have enabled flag");
  } catch (e) { fail("Rules schema check failed", e.message); }
}

// ─── TEST 6: Schema — Webhook Events ─────────────────────────
async function testWebhookSchema() {
  section("6 · SCHEMA INTEGRITY — /webhook_events");
  try {
    const snap = await db.collection("webhook_events").limit(20).get();
    if (snap.empty) { warn("No webhook events logged yet"); return; }
    pass(`Collection exists — ${snap.size} events`);

    let missingEvent = 0, missingTimestamp = 0;
    snap.forEach(doc => {
      const d = doc.data();
      if (!d.event && !d.type)  missingEvent++;
      if (!d.timestamp && !d.createdAt) missingTimestamp++;
    });

    missingEvent     ? warn(`${missingEvent} event(s) missing event/type field`) : pass("All webhook events have event type");
    missingTimestamp ? warn(`${missingTimestamp} event(s) missing timestamp`)    : pass("All webhook events have timestamp");
  } catch (e) { fail("Webhook schema check failed", e.message); }
}

// ─── TEST 7: E2E Smoke Test — Write/Read/Delete ───────────────
async function testE2ESmokeTest() {
  section("7 · E2E SMOKE TEST — Write → Verify → Teardown");
  const mockUid = `test_${Date.now()}`;

  try {
    // Write
    await db.doc(`users/${mockUid}`).set({
      email: "smoke@gatekeeper.test",
      displayName: "Smoke Test Agent",
      kycStatus: "verified",
      bvn: "22200000000",
      createdAt: new Date().toISOString()
    });
    pass("Firestore write: created mock user document");

    // Read
    const snap = await db.doc(`users/${mockUid}`).get();
    if (!snap.exists) throw new Error("Document not found after write");
    if (snap.data().email !== "smoke@gatekeeper.test") throw new Error("Data mismatch after write");
    pass("Firestore read: data verified post-write");

    // Wallet sub-collection
    await db.doc(`users/${mockUid}/wallet/balance`).set({ balance: 25000, currency: "NGN", isLocked: false });
    const walletSnap = await db.doc(`users/${mockUid}/wallet/balance`).get();
    if (walletSnap.data().balance !== 25000) throw new Error("Wallet balance mismatch");
    pass("Firestore sub-collection write/read: wallet verified");

    // Transaction log
    const txRef = await db.collection(`users/${mockUid}/wallet_transactions`).add({
      amount: 25000, type: "credit", reference: "smoke_test_01",
      timestamp: new Date().toISOString()
    });
    pass(`Transaction log write: ${txRef.id}`);

    // Teardown
    await db.doc(`users/${mockUid}/wallet/balance`).delete();
    await db.doc(`users/${mockUid}`).delete();
    pass("Teardown: mock documents deleted");

  } catch (e) {
    fail("E2E Smoke Test failed", e.message);
    // Attempt cleanup
    try { await db.doc(`users/${mockUid}`).delete(); } catch (_) {}
  }
}

// ─── TEST 8: Auth — Verify Real Users ────────────────────────
async function testAuthUsers() {
  section("8 · AUTH — FIREBASE AUTHENTICATION STATE");
  try {
    const result = await auth.listUsers(100);
    const users = result.users;

    if (users.length === 0) { warn("No users registered in Firebase Auth"); return; }
    pass(`Firebase Auth contains ${users.length} registered user(s)`);

    let unverified = 0, disabled = 0;
    users.forEach(u => {
      if (!u.emailVerified) unverified++;
      if (u.disabled)       disabled++;
    });

    unverified ? warn(`${unverified} user(s) have unverified email`) : pass("All Auth users have verified email");
    disabled   ? warn(`${disabled} user(s) are disabled in Auth`)    : pass("No users are disabled");

    // Cross-check Auth ↔ Firestore
    let orphanedAuth = 0;
    for (const user of users) {
      const fsDoc = await db.doc(`users/${user.uid}`).get();
      if (!fsDoc.exists) orphanedAuth++;
    }
    orphanedAuth ? fail(`${orphanedAuth} Auth user(s) have no matching Firestore profile`) : pass("All Auth users have matching Firestore profiles");

  } catch (e) { fail("Auth user check failed", e.message); }
}

// ─── TEST 9: Admin Env Variable Validation ────────────────────
async function testEnvVars() {
  section("9 · SERVER ENVIRONMENT — Required Env Variables");

  const vars = {
    "FIREBASE_PROJECT_ID":   process.env.FIREBASE_PROJECT_ID,
    "FIREBASE_CLIENT_EMAIL": process.env.FIREBASE_CLIENT_EMAIL,
    "FIREBASE_PRIVATE_KEY":  process.env.FIREBASE_PRIVATE_KEY,
  };

  for (const [k, v] of Object.entries(vars)) {
    if (v && v.trim().length > 0) {
      pass(`${k} is set`);
    } else {
      warn(`${k} is NOT set — dashboard will use fallback hardcoded values`);
    }
  }

  const optionalVars = {
    "DASHBOARD_ADMIN_PASSWORD":       process.env.DASHBOARD_ADMIN_PASSWORD,
    "NEXT_PUBLIC_RECAPTCHA_SITE_KEY": process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    "BRIDGECARD_ACCESS_TOKEN":        process.env.BRIDGECARD_ACCESS_TOKEN,
  };

  for (const [k, v] of Object.entries(optionalVars)) {
    if (v && v.trim().length > 0) {
      pass(`${k} is set (optional)`);
    } else {
      warn(`${k} is not set (optional — some features will be limited)`);
    }
  }
}

// ─── TEST 10: API Health — Vercel Dashboard Endpoint ─────────
async function testDashboardHealth() {
  section("10 · LIVE DASHBOARD — HTTP Health Check");
  const DASHBOARD_URL = "https://gatekipa-dashboard.vercel.app";

  try {
    const res = await fetch(DASHBOARD_URL, { method: "GET", redirect: "manual" });
    if (res.status === 401 || res.status === 200 || res.status === 302) {
      pass(`Dashboard is live and responding (HTTP ${res.status})`);
    } else {
      fail(`Unexpected HTTP response: ${res.status}`);
    }
  } catch (e) { fail("Dashboard HTTP check failed", e.message); }

  // Check /users route
  try {
    const res = await fetch(`${DASHBOARD_URL}/users`, { method: "GET", redirect: "manual" });
    if (res.status === 401 || res.status === 200) {
      pass(`/users route responding (HTTP ${res.status})`);
    } else {
      fail(`/users route returned unexpected HTTP ${res.status}`);
    }
  } catch (e) { fail("/users route check failed", e.message); }

  // Check /wallet route
  try {
    const res = await fetch(`${DASHBOARD_URL}/wallet`, { method: "GET", redirect: "manual" });
    if (res.status === 401 || res.status === 200) {
      pass(`/wallet route responding (HTTP ${res.status})`);
    } else {
      fail(`/wallet route returned unexpected HTTP ${res.status}`);
    }
  } catch (e) { fail("/wallet route check failed", e.message); }

  // Check /cards route
  try {
    const res = await fetch(`${DASHBOARD_URL}/cards`, { method: "GET", redirect: "manual" });
    if (res.status === 401 || res.status === 200) {
      pass(`/cards route responding (HTTP ${res.status})`);
    } else {
      fail(`/cards route returned unexpected HTTP ${res.status}`);
    }
  } catch (e) { fail("/cards route check failed", e.message); }
}

// ─── FINAL REPORT ─────────────────────────────────────────────
function printReport() {
  console.log("\n" + bold("══════════════════════════════════════════"));
  console.log(bold("  GATEKEEPER ADMIN PORTAL — TEST REPORT"));
  console.log(bold("══════════════════════════════════════════"));
  console.log(`  ${green("PASSED")}:   ${PASS}`);
  console.log(`  ${red("FAILED")}:   ${FAIL}`);
  console.log(`  ${yellow("WARNINGS")}: ${WARN}`);
  console.log(bold("══════════════════════════════════════════"));

  if (FAIL === 0 && WARN === 0) {
    console.log(green(bold("  ✅  ALL SYSTEMS OPERATIONAL — PRODUCTION READY")));
  } else if (FAIL === 0) {
    console.log(yellow(bold(`  ⚠️   PASSED WITH ${WARN} WARNING(S) — REVIEW BEFORE DEPLOYING`)));
  } else {
    console.log(red(bold(`  ❌  ${FAIL} FAILURE(S) DETECTED — REMEDIATION REQUIRED`)));
  }
  console.log(bold("══════════════════════════════════════════\n"));
}

// ─── RUNNER ───────────────────────────────────────────────────
async function main() {
  console.log(bold("\n🛡️  GATEKEEPER ADMIN PORTAL — FULL DIAGNOSTIC SUITE"));
  console.log(dim(`  Running at: ${new Date().toISOString()}\n`));

  await init();
  await testConnectivity();
  await testEnvVars();
  await testUsersSchema();
  await testWalletSchema();
  await testCardsSchema();
  await testRulesSchema();
  await testWebhookSchema();
  await testAuthUsers();
  await testE2ESmokeTest();
  await testDashboardHealth();

  printReport();
  process.exit(FAIL > 0 ? 1 : 0);
}

main();
