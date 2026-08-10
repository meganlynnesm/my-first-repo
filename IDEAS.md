# Green Thumbs — Project Ideas

> **Context-engineering doc.** A parking lot of directions the site could grow in — nothing here is a
> commitment. Pairs with [`STYLE-GUIDE.md`](STYLE-GUIDE.md) (the look) and [`FEATURES.md`](FEATURES.md)
> (what's built / planned). Ideas tagged 🎨 lean on the style guide's arches/motifs/colour rhythm.

---

## Per-object ideas

**Temporal — `garden-timeline/`**
- Once founding-year data exists: animate the cumulative curve *drawing on* as you scroll into it. 🎨
- Toggle cumulative ↔ per-year bars; colour segments by borough to tie back to the map.
- A "garden of the year" annotation layer — pin notable openings along the timeline.

**Geospatial — `garden-map/`**
- Cluster dots at low zoom, expand on zoom-in (cleaner at city scale).
- Filter by **status** (active / inactive) and by **size**, not just borough.
- Neighborhood heat: shade areas by garden density.
- Deep-link from the Matchmaker result straight to that garden's dot (fly-to + open popup).

**Relational — `green-thumb/`**
- Offer a **node-link graph** view (borough → jurisdiction → garden) alongside the circle-packing, so
  the object matches the course's relational tutorial and gives two readings of the same hierarchy.
- Search/highlight a garden by name; dim the rest.

**Engagement — `garden-match/`**
- "Share your match" → generate a small card image / copyable link.
- More questions (sun vs shade, what you'd grow) for finer matches.
- Re-skin the match reveal as a seed-packet or botanical almanac card. 🎨

**2D / 3D — `mini-games/`**
- Retheme the sketches toward the garden story (blooming flowers → real GreenThumb species).
- Add short "what I attempted" captions under each canvas (also a contextual-statement requirement).

**Agent — Garden Guide**
- Feed it a small knowledge base of GreenThumb facts so answers are garden-specific, not generic.
- Suggested-question chips to start a conversation.

---

## Site-wide ideas 🎨

- **Arch sections & rounded photo masks** from the reference layouts — apply the STYLE-GUIDE arch to the
  landing hero and section headers for a consistent, editorial rhythm.
- **Marquee divider** ("Grow · Tend · Gather ~") between sections.
- **Colour-band scroll:** alternate forest → cream → rose → pale grounds down the landing.
- **Seasonal theming:** shift accent tones by season (spring rose, summer olive, autumn gold).
- **Vintage-floral texture:** faint film grain over colour blocks and hero imagery.
- **Rose-spiral seal** as a favicon and section-top emblem across all pages (the §7 primary mark).
- A short **"About this portfolio"** page framing the seven objects and the three aesthetics.

---

## Content ideas

- A one-line credit + data-source note in every page footer (partly done).
- Alt text / ARIA passes for accessibility.
- A simple sitemap or "all seven objects" index section on the landing.

---

## Someday / maybe

- Real garden **founding-year** dataset (unblocks the temporal chart).
- Pull live garden updates from NYC Open Data's API instead of the baked `data.js`.
- A print/PDF "zine" export of the portfolio.
