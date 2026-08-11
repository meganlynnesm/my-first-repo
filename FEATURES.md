# Green Thumbs — Feature Planning

> **Context-engineering doc.** What the site *is*, what's built, and what's still on the list.
> Pairs with [`STYLE-GUIDE.md`](STYLE-GUIDE.md) (how it looks) and [`IDEAS.md`](IDEAS.md) (what it could become).

**The site.** A single portfolio website that gathers the required **seven digital objects** for
Computational Design Workflows into one polished, structured whole — themed around New York City's
GreenThumb community gardens. Home page is the repo-root `index.html`; each object is its own page,
linked from a shared nav and the landing cards.

---

## The Seven Digital Objects

| # | Object | Page | Tech | Status | Contextual statement |
|---|---|---|---|---|---|
| 1 | 2D spatial canvas | `mini-games/` | p5.js | ✅ built | ⬜ to write |
| 2 | 3D spatial canvas | `mini-games/` | three.js | ✅ built | ⬜ to write |
| 3 | Temporal structure | `garden-timeline/` | D3 v3 radar (Bremer) | ✅ built (real open-hours) | ✅ on page |
| 4 | Relational structure | `green-thumb/` | D3 (circle-packing) | ✅ built | ⬜ to write |
| 5 | Geospatial structure | `garden-map/` | MapLibre GL + Protomaps | ✅ built | ✅ on page |
| 6 | Engagement component | `garden-match/` | Vanilla JS quiz | ✅ built | ✅ on page (hero) |
| 7 | Agent | Garden Guide widget (site-wide) | Firebase Functions + OpenAI | ✅ built | ⬜ to write |

Legend: ✅ done · 🟡 partial · ⬜ to do

---

## Shared systems

- **One dataset, many views.** `green-thumb/data.js` (`gardenData`, 635 NYC gardens: borough ›
  jurisdiction › garden, each with lat/lon, area, status, address) powers the **circle-packing**,
  the **map**, and the **matchmaker**. Change the data once, all three update.
- **Palette + type.** Green Thumbs palette in each page's `:root`; **Playfair Display** (display) +
  **Montserrat** (body). Governed by [`STYLE-GUIDE.md`](STYLE-GUIDE.md).
- **Navigation.** Every subpage carries the same editorial intro nav; the landing has a card per page.
- **Agent.** The Garden Guide chat widget lives on the landing; secure Cloud Function holds the OpenAI key.

---

## Roadmap / backlog

**Done**
- [x] Geospatial map (MapLibre, borough colours, filter, popups)
- [x] Temporal radar "open-hours clock" — real Saturday hours by borough (Bremer radar, D3 v3)
- [x] Engagement "Garden Matchmaker" quiz
- [x] Promote site to repo root (home = Green Thumbs)
- [x] Beginner-friendly code comments on the new pages
- [x] Style guide + motif system; brought clock/heart motifs into line; body font → Montserrat
- [x] Remove `hello-world.txt.txt`

**Next**
- [ ] **Contextual statements** for objects 1, 2, 4, 7 (short "what I attempted / references / data" blurbs, in Megan's voice)
- [x] **Temporal data** resolved — dataset has no founding year, so the temporal object uses real *open hours* instead
- [ ] **Deploy** — confirm GitHub Pages serves the repo root; grab the live URL for submission
- [ ] **Relational decision** — keep circle-packing, or add a node-link graph to match the course tutorial
- [ ] **Repo cleanup** — remove orphaned root files (`feel-good.*`, loose `p5-MM-*`, `p5_2D.js`, `style.md`) once confirmed
- [ ] Apply STYLE-GUIDE arches / marquee / colour-band rhythm to unify the pages visually
- [ ] Screenshots of each object (map + p5/three sketches need a real browser)

---

## Tech stack

- **Static front-end**, no build step. Plain HTML/CSS/JS per page, served by GitHub Pages from the repo root.
- **Libraries (via CDN):** p5.js, three.js (r128 + WebGPU build), D3 v7, MapLibre GL 5.6.1.
- **Basemap:** Protomaps vector tiles (token-free). *Note: the course tutorial uses Mapbox; we chose
  MapLibre — its open-source, same-API twin — deliberately, to avoid needing a Mapbox account/token.*
- **Agent back-end:** Firebase (Realtime Database for chat history; Cloud Function `chatWithAI` on the
  Blaze plan holding the OpenAI key server-side; Google sign-in required to chat).

## Data sources

- **NYC Open Data — GreenThumb Garden Info** → `green-thumb/data.js` (635 gardens; 579 have coordinates).
- Temporal chart uses garden **Saturday open hours** (`openhrssa`) from the same dataset — 308 of 635 gardens list them. (No founding-year field exists, so open hours is the real time dimension.)

## Constraints & gotchas

- **Maps + WebGL** don't composite in the in-app preview pane, so the map and p5/three sketches must be
  verified/screenshotted in a real browser.
- **Never commit the OpenAI secret key** — it lives only in the Cloud Function, never in client code.
- **Firebase Auth** authorized domains must include `meganlynnesm.github.io` and `localhost`.
