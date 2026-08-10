# Green Thumbs — Style Guide

> **Context-engineering doc.** This is the single source of truth for how the Green Thumbs
> site *looks and feels*. Any new page, component, colour, typeface, symbol, or motif must
> follow what is written here. If something isn't covered, extend this file first, then build.

Green Thumbs is a portfolio built around New York City's community gardens. Its visual
language braids together three historical aesthetics — **Aestheticism**, **Romanticism**,
and **Rococo** — all of which share a reverence for natural beauty, ornament, and craft.
The look is *editorial and botanical*: large decorative serifs, arched shapes, moody vintage
florals, gilded accents, and generous colour-blocked sections (see the reference layouts:
a floral-studio site — forest-green / cream / dusty-pink / chartreuse bands, arched photo
masks, numbered steps, a rose emblem, and an FAQ set inside an arch).

---

## 1. The Three Aesthetics

Each movement contributes a distinct ingredient. Hold all three at once.

| Aesthetic | Core idea | What we take from it |
|---|---|---|
| **Aestheticism** — "Art for art's sake" | Beauty is its own justification; refined, sensuous, decorative craft (Wilde, Whistler, Morris, Beardsley). | Curated elegance; flowing organic line-ornament; motifs of **lily, rose, sunflower, peacock**; a harmonious "greenery-yallery" palette (sage, gold, dusty rose, ivory). |
| **Romanticism** — Emotion & the sublime | Feeling over reason; awe of wild nature; nostalgia, longing, atmosphere. | **Moody, painterly florals**; misty, grainy, low-light imagery; deep forest/twilight tones; the sense that a garden is *felt*, not just catalogued. |
| **Rococo** — Ornate & light | 18th-c. French delicacy; asymmetric curves (*rocaille*), gilding, playfulness. | **Arches, S- and C-curves, scrolls, floral garlands**; soft pastels + gold leaf; rounded, graceful forms over hard geometry. |

**The through-line:** botanical subject, refined ornament, curved/arched geometry, muted-but-rich
colour, and emotional warmth. When a design choice serves all three, it's right.

References: [Aestheticism](https://aesthetics.fandom.com/wiki/Aestheticism) ·
[Romanticism](https://aesthetics.fandom.com/wiki/Romanticism) ·
[Rococo](https://aesthetics.fandom.com/wiki/Rococo)

---

## 2. Design Principles

1. **Beauty first.** Every screen should be composed like a printed page. Whitespace is a material.
2. **Nature is the hero.** Lead with the florals/photography and the data; let type and chrome recede.
3. **Curves over corners.** Prefer arches, rounded frames, and soft pills to sharp rectangles.
4. **Ornament with restraint.** Gilded accents and floral motifs are seasoning, not the meal.
5. **One decorative move per section.** A big serif *or* a heavy ornament *or* a full-bleed photo — not all three fighting.
6. **Colour-blocked rhythm.** Alternate solid-colour sections with photographic ones as you scroll.

---

## 3. Colour Palette (keep the original)

The existing Green Thumbs palette is canonical — it already embodies the three aesthetics and
matches the reference layouts. Do not introduce new hues without adding them here first.

| Token | Hex | Role | Aesthetic note |
|---|---|---|---|
| `--olive` | `#738913` | Primary "forest" ground for dark sections | Romantic woodland; Aesthetic green |
| `--maroon` | `#922F3C` | Deep accent, emphasis | Romantic depth |
| `--red` (burgundy) | `#6e1f38` | Editorial ink on cream; hover accent | Rococo richness |
| `--rose` | `#CC8A8F` | Soft section ground / accent | Rococo pastel; Aesthetic rose |
| `--gold` | `#F6CA7D` | **Gilding** — emblem, filled buttons, highlights | Rococo gilt; Aesthetic gold |
| `--pale` | `#E1E3AF` | Chartreuse/celadon section ground | Rococo celadon |
| `--cream` | `#f5ead6` | Warm paper / card ground | shared ivory |
| `--offwhite` | `#FAF7F1` | Lightest card / panel | shared ivory |
| `--offblack` | `#1A1613` | Text on light grounds | — |

**Borough accents** (used on the map + circle-packing; keep consistent everywhere gardens are coloured):
Brooklyn `#b0495a` · Bronx `#5f6e2a` · Queens `#6e1f38` · Manhattan `#86a24a` · Staten Island `#cf8ba0`.

**Usage**
- **Dark sections:** olive or `#2e3d18`-deep-green ground, cream text, gold accents (see "How to get started" reference).
- **Light sections:** cream / offwhite / rose / pale grounds, burgundy or offblack text.
- **Gold is precious** — reserve for the emblem, primary buttons, key highlights. Never large gold fills.
- Aim for a scroll that **alternates**: forest → cream → rose → pale → photo, and back.

---

## 4. Typography

A high-contrast **decorative serif** for display, a quiet humanist **sans** for body — the
editorial pairing in the references.

- **Display / headings — `Playfair Display`** (already loaded), weight 500–600, often **UPPERCASE**,
  tight leading (`line-height: .98–1.05`), large (`clamp(28px … 140px)`). This is the "voice" of the page.
  - For a hero, an optional **script-italic accent word** (e.g. a small *"La"*-style flourish) may sit
    above the main word — use at most once per page.
- **Body — `Montserrat`** (already loaded), 300–400, generous line-height (1.6–1.7). Keep it plain so the serif sings.
- **Eyebrows / labels / nav — Montserrat UPPERCASE**, 11–13px, `letter-spacing: 1.5–3px`. Small-caps feel.
- **Numbers (01 / 02 / 03), tooltips, hex, data labels** — keep the existing mono/label stack.

**Rules**
- One display serif per page. Don't mix two decorative serifs.
- Uppercase + wide tracking = the "engraved label" texture used for eyebrows and buttons.
- Never set body copy in the display serif; never set headings in Montserrat.

---

## 5. Layout & Format

Codified from the reference layouts. Sections stack full-width and alternate colour.

- **Section rhythm:** full-viewport or tall bands, each a single background colour or a full-bleed photo.
  Alternate solid ↔ photographic as you scroll.
- **The arch** is the signature shape (Rococo): a top-rounded "tombstone" arch for framing an FAQ,
  an emblem, or a photo. Also use **rounded-corner rectangles** (radius 16–24px) for image frames and cards.
- **Arched photo masks:** flowers peek through arch/rounded cut-outs at a section's left/right edges (see the CTA reference).
- **Numbered process steps:** a row of 2–4 columns, each = small number (`01`), serif subhead, short body. Centred pill button beneath.
- **FAQ accordion:** hairline-ruled rows, right-aligned **`+`** toggle, set inside a cream arch over a floral photo.
- **CTA block:** small-caps eyebrow → big serif heading → short body → gold pill button, flanked by arched florals.
- **Marquee / ticker:** a slow-scrolling repeated phrase (`Our Work ~ Our Work ~`) as a divider strip between sections.
- **Editorial columns:** body copy in 1–2 narrow columns with an `ABOUT US`-style label, not full-width slabs.
- **Generous margins;** let type breathe. Mobile: single column, arches shrink but stay arched.

---

## 6. Components

- **Buttons — pill shaped** (`border-radius: 999px`).
  - *On dark:* outline pill, cream/1.5px border, uppercase tracked label, fills on hover.
  - *On light:* solid **gold** (or burgundy) pill, cream text.
- **Eyebrow:** uppercase tracked label in maroon/gold above a heading.
- **Hairline rules:** 1px, low-opacity ink (`rgba(110,31,56,.16)`) — dividers, accordion rows.
- **Cards:** cream/offwhite, radius 18–22px, soft shadow (`0 10–18px 30–44px rgba(74,28,41,.12–.2)`),
  optional top border-accent in a borough/section colour.
- **Accordion row:** label left, `+` right, hairline under; `+` rotates to `×` on open.
- **Image frames:** rounded rectangle or arch; never a hard 90° photo edge in a feature spot.

---

## 7. Motifs & Symbols  *(all symbols must conform to this section)*

**Sanctioned motif set** — botanical, curved, gilded or inked:

- **Primary mark — the rose-spiral roundel:** a single rose/spiral inside a circle, in **gold**
  (as in the reference emblem). This is the Green Thumbs "seal." Use at section tops and as a favicon-scale badge.
- **Leaf / petal rosette:** the existing rotated-petal flower on the landing cards — keep; it's on-brand.
- **Sprout / seedling:** the 🌱 growth motif (Matchmaker, chatbot) — fine as a small warm accent.
- **Rococo ornament:** arches, S/C-curves, thin floral garlands, scroll flourishes — sparingly, in gold or ink.
- **Aestheticism florals:** single-line **lily, rose, sunflower** silhouettes; optional peacock-feather accent.

**Rules for any motif or symbol**
1. **Botanical or floral, or a Rococo curve/arch.** No hard geometric, mechanical, or tech iconography.
2. **Monoline or high-contrast**, drawn in **gold** or **ink (burgundy/offblack)** — match the palette, never off-palette.
3. **Curved, symmetrical, or graceful.** Favour arcs and S-curves over straight lines and right angles.
4. **Accent, not clutter** — one or two per section; let the photography and type lead.
5. **Reuse before inventing.** Prefer the rose-roundel, leaf-rosette, or sprout already in the site.

**Bring existing motifs in line:** the temporal page's plain **clock** icon and the Matchmaker **heart**
should be re-drawn as botanical equivalents (e.g. a seasonal bloom / almanac wreath for "over time";
a rose or bloom for the match) so every symbol obeys rules 1–3.

**Explicitly retired** (off-aesthetic — do not use): atomic/orbital glyphs, starbursts, CRT/scanline,
Googie boomerangs, hazard/trefoil signage, and any other motif from the leftover `style.md` (Atompunk) guide.

---

## 8. Imagery & Texture

- **Moody, vintage florals** (Romanticism): soft focus, low light, film grain, faded warmth. Wildflowers,
  poppies, lilies, garden beds. Prefer atmospheric over bright-and-clinical.
- **Botanical cut-outs:** single stems/blooms on flat colour grounds (see the "Our Portfolio" reference).
- **Texture:** a subtle paper grain or film noise over photos and colour blocks is welcome; keep it faint.
- **Overlays:** dark sections can veil a photo with an olive/maroon wash so cream type stays legible.

---

## 9. Voice & Tone

Warm, curious, a little literary — but **brief**. Let the visuals carry the mood; captions and body stay
short and plain. (Contextual statements for each object are the place for reflective writing, in Megan's own voice.)

---

## 10. Do / Don't

**Do:** arches & rounded frames · alternating colour bands · one big serif per section · gilded gold accents ·
moody florals · botanical motifs · generous whitespace.

**Don't:** hard rectangular photo edges in feature spots · two decorative serifs at once · large gold fills ·
neon/off-palette colour · geometric/tech icons · cramped, edge-to-edge text · more than one heavy ornament per section.

---

## Sources
- [Aestheticism — Aesthetics Wiki](https://aesthetics.fandom.com/wiki/Aestheticism)
- [Romanticism — Aesthetics Wiki](https://aesthetics.fandom.com/wiki/Romanticism)
- [Rococo — Aesthetics Wiki](https://aesthetics.fandom.com/wiki/Rococo)
- Reference layouts: GLO Creative Design floral-studio templates ("La Fleur Verte"), supplied by Megan.
- Palette + type: the existing Green Thumbs site (`index.html` `:root`, `garden-*` pages).
