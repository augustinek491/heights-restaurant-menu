// Client-side Firebase SDK initialization, used only by the admin login page
// (email/password sign-in via the Firebase client Auth SDK). The public menu
// never touches this — it's fetched server-side via lib/firestore.ts.
//
// Config values come from NEXT_PUBLIC_* env vars so they're safely inlined
// into the client bundle. These are not secrets — Firebase web API keys are
// designed to be public; access control is enforced by Firestore/Storage
// security rules and custom auth claims, not by hiding this config.

import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "heights-restaurant-menu",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseClientApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const clientAuth = getAuth(firebaseClientApp);
