"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const SESSION_COOKIE_NAME = "__session";

async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) throw new Error("Not authenticated");
  const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
  if (decoded.role !== "admin") throw new Error("Not authorized");
  return decoded;
}

export interface MenuItemUpdate {
  id: string;
  name: string;
  description?: string;
  price?: number;
  priceByTot?: number;
  priceByBottle?: number;
  unit?: string;
}

/**
 * Updates a single menu item's editable fields. Writes go straight through
 * the trusted Admin SDK from this server action — Firestore security rules
 * deny all client writes (see firestore.rules), so this server action is the
 * only legitimate write path for menu content.
 */
export async function updateMenuItem(update: MenuItemUpdate) {
  await requireAdmin();

  const { id, ...fields } = update;
  if (!id) throw new Error("Missing item id");

  // Strip undefined fields so we don't clobber existing values with undefined.
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) payload[key] = value;
  }

  await adminDb.collection("menuItems").doc(id).update(payload);
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}
