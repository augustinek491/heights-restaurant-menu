# Heights Restaurant — Digital Menu Design System

## Grounding

Subject: Heights Restaurant, the bar/restaurant at Glass Heights Apartments, Kampala, Uganda. Audience: extended-stay residents and business travelers who live upstairs, plus neighborhood walk-ins. Job of the page: let someone standing at a table, having just scanned a QR code, find a dish or drink and its price in seconds, while feeling like the property invested real money in this object.

The brand's own name is the material to design with: **Glass** (transparency, towers, frosted surfaces) + **Heights** (altitude, a skyline silhouette, looking down at the city). Kampala's hills + an equatorial dusk gold light are the two visual facts I'm building from, rather than a generic "elegant dark restaurant" template.

## Self-critique pass

First instinct was the default AI restaurant-menu look: near-black background, a single bright gold accent, Playfair Display headings, card-grid items with rounded corners and drop shadows. That's the cluster every model reaches for — rejected. Changes made to get away from it:
- Replaced Playfair/Cormorant with **Fraunces** — a serif with more idiosyncratic, slightly warped old-style detailing, set at a soft optical size so it doesn't read as a wedding invitation.
- Replaced the card-grid with a **ledger layout**: hairline-rule-separated rows, no boxes, no shadows — closer to how an actual upscale menu is typeset, and it lets the page breathe instead of tiling boxes.
- Prices set in a **tabular monospace** (not the heading serif, not the body sans) so the page reads like a real priced ledger, not a brochure — this is the one typographic risk and it's specific to "menu as a priced document," not decoration.
- The signature device is a **thin gold skyline silhouette** (Kampala hillside + a glass tower) that runs as a continuous line motif between sections — a direct, literal translation of "Glass Heights," redrawn slightly at each section break rather than repeated identically.
- Navigation bar uses real `backdrop-filter` frosted glass — a literal, structural nod to "Glass," not just a visual flourish.
- Added a muted clay-red secondary accent (Ugandan red earth) so the palette isn't a single-gold-on-black default — gold remains primary, clay is used sparingly for spice/heat tags and the Bar section's accents.

## Color tokens

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#14110D` | Base background — warm bistre-black, not blue-black |
| `--surface` | `#1F1A14` | Section bands, sticky nav base (before blur) |
| `--surface-raised` | `#271F17` | Hero/cover panel, footer |
| `--gold` | `#B9883E` | Primary accent — section labels, active nav, prices on hover |
| `--gold-bright` | `#E2B765` | Highlight gold — hero wordmark, skyline line, dividers on focus |
| `--clay` | `#8C4A30` | Secondary accent — spice/heat tags, Bar section accent, hover state on cocktails |
| `--ink` | `#F2E9DA` | Primary text — warm ivory, never pure white |
| `--ink-muted` | `#9C8E78` | Descriptions, secondary labels, prices in resting state |
| `--hairline` | `#3A2F22` | Row dividers, nav underline track |

No pure black, no pure white anywhere — keeps the warmth consistent with equatorial light rather than a cold editorial dark mode.

## Typography

- **Display (dish/category names):** Fraunces, weight 500–600, optical size "soft" — used at 28–40px for category headers, 18–20px for item names. Letter-spacing slightly negative on large sizes.
- **Body (descriptions, intro copy):** Work Sans, weight 400, 14–15px, `--ink-muted`, occasionally italic for short tasting notes.
- **Utility (prices, hours, tags):** Space Mono, weight 400–700, tabular figures, right-aligned in the ledger rows. This is the signature typographic choice — it makes every price column align like a printed bill.
- **Wordmark treatment:** "Heights" in Fraunces italic at large scale on the cover; "Restaurant" in Space Mono uppercase tracked wide beneath it, echoing the existing fork-and-spoon infinity wordmark's mixed-weight feel without copying it.

## Layout & spacing

- Base unit: 8px. Section vertical padding: 64px mobile / 96px desktop. Row padding within a section: 20px vertical.
- **Cover/hero screen:** Full-bleed `--bg`, centered. Thin gold skyline silhouette (hills + a single glass tower glyph) draws on with a 900ms stroke animation on load, then settles as a static line above the wordmark. Below: "Heights Restaurant" (Fraunces italic, `--gold-bright`), "at Glass Heights Apartments" (Space Mono, small, `--ink-muted`). Single tap target: "View the menu ↓" — no button chrome, just type and a hairline underline. Respect `prefers-reduced-motion`: skip the stroke animation, show the line fully drawn.
- **Sticky category nav:** 56px tall, `--surface` at 70% opacity with `backdrop-filter: blur(12px)` — the literal "glass" reference. Pills: Breakfast & Lunch / Dinner / Desserts & Juices / Bar. Active pill gets a 2px `--gold-bright` underline that slides between tabs (translate, not re-render).
- **Item rows (ledger style):** No card backgrounds. Each row: dish name (Fraunces) + description (Work Sans, `--ink-muted`, max 2 lines) on the left, price (Space Mono, right-aligned) on the right. 1px `--hairline` rule below each row at 40% opacity. Combo/featured items get a `--gold` left-edge tick (2px), not a full border.
- **Photography breaks:** Every 4–6 rows within a long section (Dinner, Bar), insert a full-bleed-within-margin image band (16:9 or 4:5 depending on shot) — wide hero shots of signature plates/cocktails, not a thumbnail grid. This is where Higgsfield imagery does the work; rows stay clean and unillustrated except at these rhythm breaks.
- **Bottle/spirits sections (Bar — Brandy, Whiskey, Vodka, etc.):** Two-column tot/bottle price layout reusing the same ledger row, just with two Space Mono price columns instead of one.
- **Section dividers:** The skyline silhouette motif reappears, redrawn slightly shorter/simpler, between major sections (e.g., closing Breakfast & Lunch, opening Dinner) — never identical twice, always thin gold hairline weight.

## Motion

One orchestrated moment only: the cover-screen skyline stroke-draw on load. Everything else is restrained — sticky nav underline slide, and a subtle 150ms fade-up when a new section's rows enter the viewport (stagger 30ms per row, capped at 6 rows so long sections don't feel sluggish). No hover-tilt cards, no parallax, no gradient animation — the ledger format does the work of feeling crafted; motion stays quiet.

## Accessibility floor

- Text contrast: `--ink` on `--bg` exceeds 4.5:1; verify `--ink-muted` on `--surface` separately for description text at small sizes (target AA for body copy ≥14px).
- Visible focus state: 2px `--gold-bright` outline offset 2px on all interactive elements (nav pills, the "View the menu" tap target).
- `prefers-reduced-motion` respected as noted above.
- Category nav pills are real buttons with `aria-selected`, not div onclick.
