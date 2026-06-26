// Shared domain types for the Heights Restaurant menu, mirrored from the
// Firestore data model described in README-backend.md.

export type Scope = "breakfast" | "lunch";

export interface MenuCategory {
  id: string;
  name: string;
  order: number;
  slug: string;
}

export interface MenuSection {
  id: string;
  categoryId: string;
  name: string;
  order: number;
  note?: string;
  scope?: Scope;
}

export interface MenuItem {
  id: string;
  sectionId: string;
  name: string;
  description?: string;
  order: number;
  featured: boolean;
  price?: number;
  unit?: string;
  priceByTot?: number;
  priceByBottle?: number;
}

export interface MenuImage {
  id: string;
  storageUrl: string;
  caption?: string;
  aspect: "16:9" | "4:5";
  afterItemId?: string;
  afterSectionId?: string;
}

export interface SiteSettings {
  name: string;
  contact: {
    email: string;
    phone: string;
  };
  welcome: string;
  eyebrow?: string;
  title?: string;
  titleSub?: string;
}

export interface MenuData {
  categories: MenuCategory[];
  sections: MenuSection[];
  items: MenuItem[];
  images: MenuImage[];
  settings: SiteSettings;
}

// ---- Block config types (rendering order source of truth) ----

export interface SectionBlock {
  type: "section";
  source: "breakfastLunch" | "dinner" | "dessertsJuices" | "bar";
  name: string;
  scope?: Scope;
  featured?: boolean;
  note?: string;
}

export interface ImageBlock {
  type: "image";
  id: string;
  aspect: "16:9" | "4:5";
  caption?: string;
}

export interface DividerBlock {
  type: "divider";
}

export type ConfigBlock = SectionBlock | ImageBlock | DividerBlock;

export const CATEGORY_SLUGS = [
  "breakfast-lunch",
  "dinner",
  "desserts-juices",
  "bar",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  "breakfast-lunch": "Breakfast & Lunch",
  dinner: "Dinner",
  "desserts-juices": "Desserts & Juices",
  bar: "Bar",
};
