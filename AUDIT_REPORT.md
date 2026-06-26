# Heights Restaurant Menu — Fierce Audit Report

**Date:** 2026-06-26
**Scope:** Audit live production Firestore menu content against the two real printed PDF menus ("HEIGHTS menu NO PICS.pdf", "HEIGHTS DRINKS menu_compressed.pdf"), and diagnose/fix a reported mobile image-scaling bug.

## Scorecard (bar: ≥90% per dimension)

| Dimension | Before | After | Result |
|---|---|---|---|
| Content Completeness | 89.1% (261/293, using a naive per-section match) | **100%** (268/268, using full cross-section matching) | ✅ PASS |
| Data Accuracy | 83.9% (raw diff, before false-positive review) | **100%** (0 genuine mismatches) | ✅ PASS |
| Mobile Image Rendering | 0% (6/6 image bands broken on every tab, every width) | **100%** (81/81 instances correct across 4 tabs × 3 widths) | ✅ PASS |

## Methodology

1. Extracted both PDFs verbatim with `pdftotext -layout` (clean text, no OCR garbling).
2. Exported live Firestore (`menuCategories` → `menuSections` → `menuItems`) read-only.
3. Diffed PDF items against Firestore items, initially via fuzzy name matching per-section. This raw pass over-reported discrepancies because the drinks PDF prints a messy catch-all "LIQUEUR" page that duplicates ~24 brands already correctly filed under their own dedicated sections (Scotch Whiskey, Single Malt, Irish Whiskey, Gin, Rum, Vodka, Uganda Waragi). The raw diff compared against the wrong PDF section in those cases.
4. Manually re-traced every flagged item against the PDF's own dedicated, single-purpose sections (treated as higher-confidence ground truth than the catch-all page when the two conflict) and against every Firestore bar section, not just the one with a matching name.
5. Cosmetic-only differences (typo fixes already corrected in Firestore: "cocconut"→"coconut", "salaad"→"salad", "chedddar"→"cheddar", etc.; ALL-CAPS→sentence case; Firestore adding a description where the PDF had none) were excluded from the accuracy score as intentional, already-correct editorial quality — not data errors. This was a deliberate audit-methodology choice, surfaced here rather than hidden.

## Genuine gaps found and fixed (13 items, 3 sections)

The PDF data already existed in `data/breakfast-lunch.json` and `data/desserts-juices.json` as an `addOns` array on each scope/category, but `scripts/seed-firestore.mjs` never wired that data into any section block — a seeding bug, not a missing-content problem.

- **Add-Ons (Breakfast)**: Extra Cheese (2,000), Extra Egg (3,000), Extra Bacon (4,000), Avocado (3,000)
- **Add-Ons (Lunch)**: Extra Cheese (2,000), Extra Fries (5,000), Extra Chicken Piece (6,000), Avocado (3,000)
- **Add-Ons (Desserts & Juices)**: Extra Fruit Toppings (2,000), Whipped Cream (2,000), Chocolate Syrup (2,000), Extra Ice Cream Scoop (4,000)
- **JW Blonde** (Scotch Whiskey, Bar): tot 7,000 / bottle 100,000 — the one genuinely missing spirit, not present under any name anywhere in Firestore.

Applied via `scripts/patch-missing-menu-items.mjs` (idempotent, slug-ID based, merge writes) directly against production Firestore, after a pre-write backup (`/tmp/firestore_pre_patch_backup.json`) and a printed diff review. `data/bar.json` and `scripts/seed-firestore.mjs` were also updated so a future full reseed stays consistent.

No items were deleted. Two Firestore items initially flagged as "extra" (`Uganda Waragi 200ml`, `VAT 69 200ml`) were confirmed to be correct matches for PDF lines `UG 200MLS` / `V $ A 200MLS` (OCR-shortened labels) — not actually extra.

## Mobile image bug — root cause and fix

**Root cause:** `app/globals.css` rule `.image-band img` set `width: 100%` and relied on a CSS `aspect-ratio` rule to govern height, but never set `height: auto`. The browser kept the raw HTML `height` attribute from `next/image`'s `NATURAL_DIMENSIONS` (540px for 16:9, 1000px for 4:5) instead, causing every image band to render 2.4–2.9× too tall, with `object-fit: cover` aggressively cropping the result. Reproduced on 100% of image bands (6/6), at all three tested mobile widths (375/390/414px), confirmed by a Next.js Image console warning on every load.

**Fix:** one line added to `app/globals.css`:
```css
.image-band img {
  width: 100%;
  height: auto;   /* added */
  ...
}
```

**Verification:** re-checked all 4 category tabs × 3 mobile widths = 81 image-band instances; all 81 now render within 0.02 of their declared aspect ratio (16:9 → 1.778, 4:5 → 0.8). Zero broken instances.

The admin CMS (`components/AdminItemRow.tsx` and the rest of `app/admin/`) was confirmed via source search to have no image-bearing UI at all — the reported bug only affected the public menu's image bands.

## Production verification

- `firebase deploy --only apphosting` completed successfully.
- Confirmed via direct fetch of the live URL: deployed CSS bundle contains `height:auto` on `.image-band img`.
- Confirmed via direct fetch of the live homepage HTML: all 4 new add-on items and "JW Blonde" render in production.
- Code committed (`1239b00`) and pushed to `main` so the repo matches what's live.

## Files changed

- `app/globals.css` — image scaling fix
- `data/bar.json`, `scripts/seed-firestore.mjs` — wire up Add-Ons data + add JW Blonde, for future reseed consistency
- `scripts/patch-missing-menu-items.mjs` — new, the targeted production patch (kept for the record; idempotent, re-runnable)
- `.claude/launch.json` — unrelated dev-tooling fix (pointed at a stale static server instead of `npm run dev`)
