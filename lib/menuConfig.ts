// The four *Config() arrays, ported verbatim (ordering preserved) from
// site/js/menu.js. This ordering is the authoritative source of truth for
// where image bands and dividers fall relative to sections, for both the
// public menu renderer and the seed script.

import type { ConfigBlock } from "@/types/menu";

export function fmt(n: number | undefined | null): string {
  if (n === undefined || n === null) return "";
  return "UGX " + n.toLocaleString("en-US");
}

export function breakfastLunchConfig(): ConfigBlock[] {
  const bl = "breakfastLunch" as const;
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
  ];
}

export function dinnerConfig(): ConfigBlock[] {
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

export function dessertsJuicesConfig(): ConfigBlock[] {
  const dj = "dessertsJuices" as const;
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
  ];
}

export function barConfig(): ConfigBlock[] {
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

export const CONFIGS: Record<
  "breakfast-lunch" | "dinner" | "desserts-juices" | "bar",
  () => ConfigBlock[]
> = {
  "breakfast-lunch": breakfastLunchConfig,
  dinner: dinnerConfig,
  "desserts-juices": dessertsJuicesConfig,
  bar: barConfig,
};
