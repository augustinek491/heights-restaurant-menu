#!/usr/bin/env node
// Grants the `role: 'admin'` custom claim to a Firebase Auth user, looked up
// by email. Run this once per admin user after they've signed up (or after
// you've created them in the Firebase Console / Auth emulator UI).
//
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json \
//     npm run set-admin -- someone@example.com
//
// Against the emulator:
//   FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 npm run set-admin -- someone@example.com

import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "heights-restaurant-menu";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run set-admin -- someone@example.com");
    process.exitCode = 1;
    return;
  }

  const app = initializeApp({ projectId: PROJECT_ID });
  const auth = getAuth(app);

  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { role: "admin" });

  console.log(`Granted role:admin to ${email} (uid: ${user.uid}).`);
  console.log("They must sign out and back in (or get a fresh ID token) for the claim to take effect.");
}

main().catch((err) => {
  console.error("set-admin-claim failed:", err);
  process.exitCode = 1;
});
