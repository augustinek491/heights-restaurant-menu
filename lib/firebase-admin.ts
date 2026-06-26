// Server-side Firebase Admin SDK initialization (singleton).
//
// Credential resolution, in order:
//  - Local dev against a real project: set GOOGLE_APPLICATION_CREDENTIALS to
//    point at a service-account JSON key file before running `next dev`.
//  - Local dev against the Firebase emulators: set FIRESTORE_EMULATOR_HOST
//    (e.g. "127.0.0.1:8080") and FIREBASE_AUTH_EMULATOR_HOST
//    (e.g. "127.0.0.1:9099"). `firebase emulators:start` sets these for any
//    process it spawns; for a separately-run `next dev` export them in your
//    shell first.
//  - Production on Firebase App Hosting: Application Default Credentials are
//    resolved automatically from the attached service account — no env vars
//    needed.
//
// All callers MUST be prepared for this module to throw (e.g. at build time
// with no credentials available at all) and should catch around it — see
// lib/firestore.ts.

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "heights-restaurant-menu";
const STORAGE_BUCKET =
  process.env.FIREBASE_STORAGE_BUCKET || `${PROJECT_ID}.firebasestorage.app`;

function buildAdminApp(): App {
  if (getApps().length) return getApps()[0];

  // Allow an explicit service-account JSON via env var (useful for some CI
  // setups) in addition to the standard GOOGLE_APPLICATION_CREDENTIALS file
  // path, which the underlying googleapis client picks up automatically.
  const inlineKey = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inlineKey) {
    const parsed = JSON.parse(inlineKey);
    return initializeApp({
      credential: cert(parsed),
      projectId: PROJECT_ID,
      storageBucket: STORAGE_BUCKET,
    });
  }

  return initializeApp({
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
  });
}

export const adminApp = buildAdminApp();
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
