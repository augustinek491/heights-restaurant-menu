// Server-side Firestore reads, used by the public menu page and the admin
// dashboard. Every exported function is resilient to the admin SDK being
// unreachable (no credentials at build time, emulator not running, etc.) —
// callers get an empty/fallback value instead of a thrown error, so
// `next build` never fails purely because Firestore isn't reachable.
//
// See lib/firebase-admin.ts for credential resolution rules.

import { adminDb } from "@/lib/firebase-admin";
import type {
  MenuCategory,
  MenuSection,
  MenuItem,
  MenuImage,
  SiteSettings,
  MenuData,
  Scope,
} from "@/types/menu";

const FALLBACK_SETTINGS: SiteSettings = {
  name: "Heights Restaurant",
  contact: {
    email: "info@glassheightsapartments.com",
    phone: "+256 (0) 780 970670",
  },
  welcome:
    "Thank you for joining us today. Every dish here is prepared with fresh, carefully sourced ingredients and the same care we'd give our own family.",
  eyebrow: "Glass Heights Apartments",
  title: "Heights",
  titleSub: "Restaurant",
};

export async function getCategories(): Promise<MenuCategory[]> {
  try {
    const snap = await adminDb.collection("menuCategories").orderBy("order").get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MenuCategory, "id">) }));
  } catch (err) {
    console.error("getCategories: falling back to empty list", err);
    return [];
  }
}

export async function getSections(categoryId?: string, scope?: Scope): Promise<MenuSection[]> {
  try {
    let query = adminDb.collection("menuSections").orderBy("order") as FirebaseFirestore.Query;
    if (categoryId) query = query.where("categoryId", "==", categoryId);
    if (scope) query = query.where("scope", "==", scope);
    const snap = await query.get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MenuSection, "id">) }));
  } catch (err) {
    console.error("getSections: falling back to empty list", err);
    return [];
  }
}

export async function getItems(sectionId?: string): Promise<MenuItem[]> {
  try {
    let query = adminDb.collection("menuItems").orderBy("order") as FirebaseFirestore.Query;
    if (sectionId) query = query.where("sectionId", "==", sectionId);
    const snap = await query.get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MenuItem, "id">) }));
  } catch (err) {
    console.error("getItems: falling back to empty list", err);
    return [];
  }
}

export async function getImages(): Promise<MenuImage[]> {
  try {
    const snap = await adminDb.collection("menuImages").get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MenuImage, "id">) }));
  } catch (err) {
    console.error("getImages: falling back to empty list", err);
    return [];
  }
}

export async function getSettings(): Promise<SiteSettings> {
  try {
    const doc = await adminDb.collection("settings").doc("site").get();
    if (!doc.exists) return FALLBACK_SETTINGS;
    return { ...FALLBACK_SETTINGS, ...(doc.data() as SiteSettings) };
  } catch (err) {
    console.error("getSettings: falling back to default settings", err);
    return FALLBACK_SETTINGS;
  }
}

/** Fetches everything the public menu page needs in one shot. */
export async function getMenuData(): Promise<MenuData> {
  const [categories, sections, items, images, settings] = await Promise.all([
    getCategories(),
    getSections(),
    getItems(),
    getImages(),
    getSettings(),
  ]);
  return { categories, sections, items, images, settings };
}
