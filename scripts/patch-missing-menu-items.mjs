#!/usr/bin/env node
// One-off, idempotent patch for the items the PDF-vs-Firestore audit found
// genuinely missing (everything else flagged by the raw diff turned out to
// be already correctly seeded under a properly organized section name).
//
// Safe to re-run: every doc uses the same deterministic slug-based IDs as
// scripts/seed-firestore.mjs and writes via .set(ref, data, {merge:true}).
//
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json node scripts/patch-missing-menu-items.mjs

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "heights-restaurant-menu";

const NEW_SECTIONS = [
  { id: "breakfast-lunch--add-ons-breakfast", categoryId: "breakfast-lunch", name: "Add-Ons", scope: "breakfast", order: 6 },
  { id: "breakfast-lunch--add-ons-lunch", categoryId: "breakfast-lunch", name: "Add-Ons", scope: "lunch", order: 6 },
  { id: "desserts-juices--add-ons", categoryId: "desserts-juices", name: "Add-Ons", order: 8 },
];

const NEW_ITEMS = [
  { id: "breakfast-lunch--add-ons-breakfast--extra-cheese", sectionId: "breakfast-lunch--add-ons-breakfast", name: "Extra Cheese", price: 2000, order: 0 },
  { id: "breakfast-lunch--add-ons-breakfast--extra-egg", sectionId: "breakfast-lunch--add-ons-breakfast", name: "Extra Egg", price: 3000, order: 1 },
  { id: "breakfast-lunch--add-ons-breakfast--extra-bacon", sectionId: "breakfast-lunch--add-ons-breakfast", name: "Extra Bacon", price: 4000, order: 2 },
  { id: "breakfast-lunch--add-ons-breakfast--avocado", sectionId: "breakfast-lunch--add-ons-breakfast", name: "Avocado", price: 3000, order: 3 },

  { id: "breakfast-lunch--add-ons-lunch--extra-cheese", sectionId: "breakfast-lunch--add-ons-lunch", name: "Extra Cheese", price: 2000, order: 0 },
  { id: "breakfast-lunch--add-ons-lunch--extra-fries", sectionId: "breakfast-lunch--add-ons-lunch", name: "Extra Fries", price: 5000, order: 1 },
  { id: "breakfast-lunch--add-ons-lunch--extra-chicken-piece", sectionId: "breakfast-lunch--add-ons-lunch", name: "Extra Chicken Piece", price: 6000, order: 2 },
  { id: "breakfast-lunch--add-ons-lunch--avocado", sectionId: "breakfast-lunch--add-ons-lunch", name: "Avocado", price: 3000, order: 3 },

  { id: "desserts-juices--add-ons--extra-fruit-toppings", sectionId: "desserts-juices--add-ons", name: "Extra Fruit Toppings", price: 2000, order: 0 },
  { id: "desserts-juices--add-ons--whipped-cream", sectionId: "desserts-juices--add-ons", name: "Whipped Cream", price: 2000, order: 1 },
  { id: "desserts-juices--add-ons--chocolate-syrup", sectionId: "desserts-juices--add-ons", name: "Chocolate Syrup", price: 2000, order: 2 },
  { id: "desserts-juices--add-ons--extra-ice-cream-scoop", sectionId: "desserts-juices--add-ons", name: "Extra Ice Cream Scoop", price: 4000, order: 3 },

  { id: "bar--scotch-whiskey--jw-blonde", sectionId: "bar--scotch-whiskey", name: "JW Blonde", priceByTot: 7000, priceByBottle: 100000, order: 5 },
];

async function main() {
  const app = initializeApp({ projectId: PROJECT_ID });
  const db = getFirestore(app);
  const batch = db.batch();

  for (const s of NEW_SECTIONS) {
    const { id, ...data } = s;
    batch.set(db.collection("menuSections").doc(id), data, { merge: true });
  }
  for (const i of NEW_ITEMS) {
    const { id, ...data } = i;
    batch.set(db.collection("menuItems").doc(id), { ...data, featured: false }, { merge: true });
  }

  await batch.commit();
  console.log(`Wrote ${NEW_SECTIONS.length} sections + ${NEW_ITEMS.length} items.`);

  console.log("\nVerifying...");
  for (const s of NEW_SECTIONS) {
    const doc = await db.collection("menuSections").doc(s.id).get();
    console.log(` section ${s.id}:`, doc.exists ? "OK" : "MISSING");
  }
  for (const i of NEW_ITEMS) {
    const doc = await db.collection("menuItems").doc(i.id).get();
    console.log(` item ${i.id}:`, doc.exists ? "OK" : "MISSING");
  }
}

main().catch((err) => {
  console.error("Patch failed:", err);
  process.exitCode = 1;
});
