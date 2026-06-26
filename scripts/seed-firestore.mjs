#!/usr/bin/env node
// Seeds Firestore + Cloud Storage from the static prototype's data/*.json
// files and assets/menu/*.jpg images.
//
// DO NOT RUN THIS AGAINST THE LIVE PROJECT YET — Firestore/Auth APIs are
// still being provisioned by a human. This script is written but
// intentionally not executed as part of this build.
//
// Usage (once the project is provisioned):
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json npm run seed
//   -- or --
//   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199 npm run seed
//
// Idempotency: every document uses a deterministic slug-based ID derived
// from category/section/item names (see slugify() + buildItemId() below), so
// re-running this script updates existing docs in place via `.set()` rather
// than creating duplicates.

import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const MENU_ASSETS_DIR = path.join(ROOT, "assets", "menu");

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "heights-restaurant-menu";
const STORAGE_BUCKET =
  process.env.FIREBASE_STORAGE_BUCKET || `${PROJECT_ID}.firebasestorage.app`;

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildItemId(sectionId, itemName) {
  return `${sectionId}--${slugify(itemName)}`;
}

// ---- *Config() arrays, ported from lib/menuConfig.ts / site/js/menu.js ----
// Kept as a self-contained copy here (rather than importing the TS module)
// so this script runs as plain Node ESM with no build step / ts-node needed.

function breakfastLunchConfig() {
  const bl = "breakfastLunch";
  return [
    { type: "section", source: bl, name: "Breakfast Sandwiches", scope: "breakfast" },
    { type: "image", id: "breakfast-01-hero", aspect: "16:9", caption: "Egg & Cheese Sandwich" },
    { type: "section", source: bl, name: "Pancakes & Waffles", scope: "breakfast" },
    { type: "image", id: "breakfast-02-waffles", aspect: "4:5", caption: "Belgian Waffles" },
    { type: "section", source: bl, name: "Breakfast Sides", scope: "breakfast" },
    { type: "section", source: bl, name: "Breakfast Combos", scope: "breakfast" },
    { type: "image", id: "breakfast-04-bigbreakfast", aspect: "16:9", caption: "Combo 3 — Big Breakfast" },
    { type: "section", source: bl, name: "Hot Drinks", scope: "breakfast" },
    { type: "section", source: bl, name: "Cold Drinks", scope: "breakfast" },
    { type: "section", source: bl, name: "Add-Ons", scope: "breakfast" },
    { type: "divider" },
    { type: "section", source: bl, name: "Burgers & Sandwiches", scope: "lunch" },
    { type: "image", id: "lunch-05-beefburger", aspect: "4:5", caption: "Classic Beef Burger" },
    { type: "section", source: bl, name: "Rice & Chicken Meals", scope: "lunch" },
    { type: "image", id: "lunch-08-pilau", aspect: "4:5", caption: "Chicken Pilau" },
    { type: "section", source: bl, name: "Pizza & Snacks", scope: "lunch" },
    { type: "image", id: "lunch-07-pizza", aspect: "4:5", caption: "Mini Pepperoni Pizza" },
    { type: "section", source: bl, name: "Lunch Combos", scope: "lunch" },
    { type: "section", source: bl, name: "Hot Drinks", scope: "lunch" },
    { type: "section", source: bl, name: "Cold Drinks", scope: "lunch" },
    { type: "section", source: bl, name: "Add-Ons", scope: "lunch" },
  ];
}

function dinnerConfig() {
  return [
    { type: "section", source: "dinner", name: "Chicken", featured: false },
    { type: "image", id: "dinner-01-kukuwanazzi", aspect: "16:9", caption: "Kuku wa Nazzi" },
    { type: "section", source: "dinner", name: "Goat" },
    { type: "image", id: "dinner-03-goatribs", aspect: "16:9", caption: "BBQ Goat Ribs" },
    { type: "section", source: "dinner", name: "Fish" },
    { type: "image", id: "dinner-04-wholefish", aspect: "4:5", caption: "Wet/Crisp Whole Fish" },
    { type: "section", source: "dinner", name: "Pasta" },
    { type: "section", source: "dinner", name: "Beef" },
    { type: "image", id: "dinner-06-beefsteak", aspect: "4:5", caption: "Beef Steak" },
    { type: "section", source: "dinner", name: "Pork" },
    { type: "image", id: "dinner-07-porkchops", aspect: "4:5", caption: "Grilled Pork Chops" },
    { type: "section", source: "dinner", name: "Curries" },
    { type: "image", id: "dinner-08-chickentikka", aspect: "4:5", caption: "Chicken Tikka" },
    { type: "section", source: "dinner", name: "Pizza" },
    { type: "section", source: "dinner", name: "Burgers" },
    { type: "section", source: "dinner", name: "Sandwiches" },
    { type: "image", id: "dinner-10-clubsandwich", aspect: "4:5", caption: "Club Sandwich" },
    { type: "section", source: "dinner", name: "Local Food" },
    { type: "image", id: "dinner-11-luwombo", aspect: "16:9", caption: "Chicken Luwombo" },
    { type: "divider" },
    { type: "section", source: "dinner", name: "Hot Drinks" },
    { type: "section", source: "dinner", name: "Iced Drinks" },
    { type: "section", source: "dinner", name: "Flavoured Teas" },
    { type: "section", source: "dinner", name: "Milk Shake" },
    { type: "section", source: "dinner", name: "Smoothies" },
  ];
}

function dessertsJuicesConfig() {
  const dj = "dessertsJuices";
  return [
    { type: "section", source: dj, name: "Fresh Cut Fruits" },
    { type: "image", id: "dessert-01-fruitcup", aspect: "4:5", caption: "Tropical Fruit Cup" },
    { type: "section", source: dj, name: "Classic Juices" },
    { type: "section", source: dj, name: "Special Juice Mixes" },
    { type: "image", id: "dessert-07-juices", aspect: "4:5", caption: "Fresh Juices" },
    { type: "section", source: dj, name: "Ice Cream Cups" },
    { type: "section", source: dj, name: "Sundaes" },
    { type: "image", id: "dessert-04-sundae", aspect: "4:5", caption: "Chocolate Sundae" },
    { type: "section", source: dj, name: "Classic Smoothies" },
    { type: "image", id: "dessert-05-mangosmoothie", aspect: "4:5", caption: "Mango Smoothie" },
    { type: "section", source: dj, name: "Special Smoothies" },
    { type: "section", source: dj, name: "Combo Offers" },
    { type: "image", id: "dessert-02-fruitplatter", aspect: "16:9", caption: "Fruit Platter" },
    { type: "section", source: dj, name: "Add-Ons" },
  ];
}

function barConfig() {
  return [
    { type: "section", source: "bar", name: "Classic Cocktails" },
    { type: "image", id: "bar-03-margarita", aspect: "4:5", caption: "Margarita" },
    { type: "section", source: "bar", name: "Signature Cocktails", featured: true },
    { type: "image", id: "bar-01-ugandanmule", aspect: "16:9", caption: "Ugandan Mule" },
    { type: "image", id: "bar-02-naughtypassion", aspect: "16:9", caption: "Naughty Passion" },
    { type: "divider" },
    { type: "section", source: "bar", name: "Brandy / Cognac" },
    { type: "image", id: "bar-10-cognac", aspect: "4:5", caption: "Cognac" },
    { type: "section", source: "bar", name: "Single Malt" },
    { type: "image", id: "bar-06-singlemalt", aspect: "4:5", caption: "Single Malt Whisky" },
    { type: "section", source: "bar", name: "Scotch Whiskey" },
    { type: "section", source: "bar", name: "Irish Whiskey" },
    { type: "section", source: "bar", name: "Bourbon & Tennessee" },
    { type: "section", source: "bar", name: "Vodka" },
    { type: "section", source: "bar", name: "Gin" },
    { type: "image", id: "bar-07-gin", aspect: "4:5", caption: "Gin & Tonic" },
    { type: "section", source: "bar", name: "Rum" },
    { type: "section", source: "bar", name: "Tequila" },
    { type: "section", source: "bar", name: "Uganda Waragi" },
    { type: "section", source: "bar", name: "Liqueur" },
    { type: "section", source: "bar", name: "Minis (200ml)" },
    { type: "divider" },
    { type: "section", source: "bar", name: "Local & Foreign Beers" },
    { type: "image", id: "bar-09-beers", aspect: "4:5", caption: "Local Lagers" },
    { type: "section", source: "bar", name: "Wine" },
    { type: "image", id: "bar-08-wine", aspect: "4:5", caption: "Wine" },
    { type: "section", source: "bar", name: "Mixers & Soft Drinks" },
  ];
}

const CATEGORY_DEFS = [
  { id: "breakfast-lunch", name: "Breakfast & Lunch", order: 0, slug: "breakfast-lunch", config: breakfastLunchConfig },
  { id: "dinner", name: "Dinner", order: 1, slug: "dinner", config: dinnerConfig },
  { id: "desserts-juices", name: "Desserts & Juices", order: 2, slug: "desserts-juices", config: dessertsJuicesConfig },
  { id: "bar", name: "Bar", order: 3, slug: "bar", config: barConfig },
];

async function loadJsonData() {
  const [breakfastLunch, dinner, dessertsJuices, bar] = await Promise.all([
    readFile(path.join(DATA_DIR, "breakfast-lunch.json"), "utf-8").then(JSON.parse),
    readFile(path.join(DATA_DIR, "dinner.json"), "utf-8").then(JSON.parse),
    readFile(path.join(DATA_DIR, "desserts-juices.json"), "utf-8").then(JSON.parse),
    readFile(path.join(DATA_DIR, "bar.json"), "utf-8").then(JSON.parse),
  ]);
  return { breakfastLunch, dinner, dessertsJuices, bar };
}

function findRawSection(dataMap, source, name, scope) {
  if (source === "breakfastLunch") {
    const scopeData = scope === "lunch" ? dataMap.breakfastLunch.lunch : dataMap.breakfastLunch.breakfast;
    if (name === "Add-Ons") return { name, items: scopeData.addOns || [] };
    return (scopeData.sections || []).find((s) => s.name === name);
  }
  const data = dataMap[source];
  if (name === "Add-Ons") return { name, items: data.addOns || [] };
  return (data.sections || []).find((s) => s.name === name);
}

async function uploadImage(bucket, imageId) {
  const localPath = path.join(MENU_ASSETS_DIR, `${imageId}.jpg`);
  const destination = `menu/${imageId}.jpg`;
  await bucket.upload(localPath, {
    destination,
    metadata: { contentType: "image/jpeg", cacheControl: "public, max-age=31536000" },
  });
  const file = bucket.file(destination);
  await file.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${destination}`;
}

async function main() {
  console.log(`Seeding Firestore + Storage for project "${PROJECT_ID}"...`);

  // ADC resolves automatically from GOOGLE_APPLICATION_CREDENTIALS,
  // FIRESTORE_EMULATOR_HOST, or the App Hosting runtime's attached service
  // account — no explicit credential needed here.
  const app = initializeApp({
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
  });
  const db = getFirestore(app);
  const bucket = getStorage(app).bucket();

  const dataMap = await loadJsonData();
  const batch = db.batch();
  let writes = 0;

  function set(ref, data) {
    batch.set(ref, data, { merge: true });
    writes += 1;
  }

  // settings/site
  set(db.collection("settings").doc("site"), {
    name: "Heights Restaurant",
    contact: dataMap.bar.contact || {
      email: "info@glassheightsapartments.com",
      phone: "+256 (0) 780 970670",
    },
    welcome:
      "Thank you for joining us today. Every dish here is prepared with fresh, carefully sourced ingredients and the same care we'd give our own family.",
    eyebrow: "Glass Heights Apartments",
    title: "Heights",
    titleSub: "Restaurant",
  });

  const uploadedImageIds = new Set();

  for (const categoryDef of CATEGORY_DEFS) {
    set(db.collection("menuCategories").doc(categoryDef.id), {
      name: categoryDef.name,
      order: categoryDef.order,
      slug: categoryDef.slug,
    });

    const blocks = categoryDef.config();
    let sectionOrder = 0;
    let lastSectionId = null;

    for (const block of blocks) {
      if (block.type === "divider") continue;

      if (block.type === "section") {
        const rawSection = findRawSection(dataMap, block.source, block.name, block.scope);
        if (!rawSection) {
          console.warn(`  ! No data found for section "${block.name}" (${block.source}/${block.scope || "-"})`);
          continue;
        }

        const sectionId = block.scope
          ? `${categoryDef.id}--${slugify(block.name)}-${block.scope}`
          : `${categoryDef.id}--${slugify(block.name)}`;
        lastSectionId = sectionId;

        const sectionDoc = {
          categoryId: categoryDef.id,
          name: rawSection.name,
          order: sectionOrder++,
        };
        if (block.scope) sectionDoc.scope = block.scope;
        if (block.note) sectionDoc.note = block.note;
        set(db.collection("menuSections").doc(sectionId), sectionDoc);

        let itemOrder = 0;
        for (const item of rawSection.items || []) {
          const itemId = buildItemId(sectionId, item.name);
          const itemDoc = {
            sectionId,
            name: item.name,
            order: itemOrder++,
            featured: !!block.featured,
          };
          if (item.description) itemDoc.description = item.description;
          if (item.price !== undefined) itemDoc.price = item.price;
          if (item.unit) itemDoc.unit = item.unit;
          if (item.priceByTot !== undefined) itemDoc.priceByTot = item.priceByTot;
          if (item.priceByBottle !== undefined) itemDoc.priceByBottle = item.priceByBottle;
          set(db.collection("menuItems").doc(itemId), itemDoc);
        }
      }

      if (block.type === "image" && !uploadedImageIds.has(block.id)) {
        uploadedImageIds.add(block.id);
        try {
          const storageUrl = await uploadImage(bucket, block.id);
          const imageDoc = {
            storageUrl,
            aspect: block.aspect,
          };
          if (block.caption) imageDoc.caption = block.caption;
          if (lastSectionId) imageDoc.afterSectionId = lastSectionId;
          set(db.collection("menuImages").doc(block.id), imageDoc);
        } catch (err) {
          console.error(`  ! Failed to upload image "${block.id}":`, err.message);
        }
      }
    }
  }

  await batch.commit();
  console.log(`Done. Wrote ${writes} documents and uploaded ${uploadedImageIds.size} images.`);
}

main().catch((err) => {
  console.error("Seed script failed:", err);
  process.exitCode = 1;
});
