# Style Guide: Atompunk

A retro-futurist aesthetic seen through the eyes of the 1950s-60s Atomic Age and Cold War — a cousin of Raygun Gothic, but colder and more mechanical. Where Raygun Gothic is utopian space-opera optimism, Atompunk carries an undercurrent of Cold War unease: giant humming analog computers, civil-defense signage, suburban conformity, and nuclear anxiety just beneath the chrome. Reference: [Atompunk — Aesthetics Wiki](https://aesthetics.fandom.com/wiki/Atompunk).

Palette, font pairing, and background-pattern details below also draw directly from period pulp sci-fi cover art (*Science Fiction Quarterly* "Nov." issue, *Amazing Stories* "I, Rocket"/"Murder in Space" issue, and classic robot-and-console space-station illustration) — see the **Background Patterns & Grids** section for specifics.

## Color Palette

Pulled directly from the *Amazing Stories* "I, Rocket" / "Murder in Space" cover (May issue) — a tight, cover-accurate palette instead of a broad theoretical one:

| Role | Color | Hex |
|---|---|---|
| Background | Deep space navy-black | `#0d1b3a` |
| Hero planet | Dusty magenta | `#a8477a` |
| Hero planet shadow / craters | Deep maroon | `#4a1830` |
| Rocket body | Gold / mustard yellow | `#e8a93c` |
| Rocket shadow | Burnt amber | `#9c6a1f` |
| Masthead fill | Cherry red | `#cc2b2b` |
| Masthead outline & stars | White | `#ffffff` |
| Nebula accent | Teal-green | `#2f7a6b` |

Guidelines:
- The navy-black background carries most of the page — treat magenta, gold, and teal-green as illustration/accent colors on top of it, not competing backgrounds.
- Cherry red is for masthead type and other bold display headlines, always paired with a white outline (see Fonts below) — it's a title color, not a body or UI-chrome color.
- Gold and dusty magenta pair well as a warm/cool duo for hero art, buttons, or featured cards (rocket-gold vs. planet-magenta), with their darker shadow tones (burnt amber, deep maroon) used for gradients, borders, or hover states rather than flat outlines.
- Teal-green is the lone cool accent — use sparingly, e.g. a single nebula-fleck background texture or a small highlight, so it doesn't compete with the cherry red masthead.
- White is reserved for outlines, starfield speckle, and high-contrast body/caption text — not as a background.

## Fonts

- **Masthead / hero title** — [Anton](https://fonts.google.com/specimen/Anton) or [Bebas Neue](https://fonts.google.com/specimen/Bebas%20Neue): ultra-bold condensed sans, matching the "AMAZING STORIES" masthead — set in caps, filled cherry red with a heavy **white** outline (`-webkit-text-stroke: white` or a doubled text-shadow) and a hard offset drop shadow in navy-black, so it reads like bold lettering popping off a busy illustrated cover. A slight upward diagonal skew (`transform: skewY(-2deg)` or increasing letter scale left-to-right) echoes the cover's dynamic perspective lettering.
- **Secondary masthead line** — same condensed sans, smaller, flat cherry red fill with no outline (like "STORIES" sitting under "AMAZING") — use for a subtitle line directly beneath the main masthead word.
- **Caption / kicker** — small bold caps in gold (like "I, ROCKET by Ray Bradbury" or "MAY 25¢" on the cover) — use for a short label above or beside the masthead.
- **Script accent** — [Yesteryear](https://fonts.google.com/specimen/Yesteryear) or [Pacifico](https://fonts.google.com/specimen/Pacifico): reserve for a single flourish word elsewhere on the page (not the masthead) if a softer accent is needed.
- **Display / secondary headings** — [Alfa Slab One](https://fonts.google.com/specimen/Alfa%20Slab%20One): heavy slab serif for section headings one step down from the masthead.
- **Readouts / dials / system labels** — [VT323](https://fonts.google.com/specimen/VT323) or [Share Tech Mono](https://fonts.google.com/specimen/Share%20Tech%20Mono): monospaced, CRT-terminal feel; use for anything meant to look like it's printed on a screen, gauge, or punch card.
- **Nav / buttons / labels** — Uppercase Roboto or Share Tech Mono with wide letter-spacing (2-3px), evoking stenciled control-panel text.
- **Body copy** — Roboto (existing): keep legible and plain, like the small byline text on a pulp cover; the display fonts should stay special-purpose.

Typography rules:
- Pair one heavy condensed masthead font with one monospace "readout" font — the contrast of chunky ad lettering against thin terminal text is the core Atompunk typographic move.
- Masthead type is always cherry-red-fill + white-outline + dark drop shadow, in that order — this exact combination is what reads as "pulp sci-fi cover" rather than generic bold text.
- Use uppercase + letter-spacing on labels to suggest stenciled or engraved panel text.
- Foreground illustration elements (rockets, planets, icons) can still use a black ink outline (see Motifs below) — reserve the *white* outline specifically for masthead type on a dark background.

## Materials & Textures

Atompunk favors "beauty over functionality" — visible, oversized mechanisms and mid-century industrial/domestic surface finishes rather than concealed, minimalist ones:

- **Chrome & brushed aluminum** — glossy metallic gradients (light-to-shadow) on buttons, frames, and dividers.
- **Formica / laminate** — flat, slightly glossy color blocks (use the mustard/aqua/mint accent colors) with a thin contrasting edge, as if trimmed in chrome banding — good for card backgrounds.
- **Bakelite / molded plastic** — rounded, chunky control shapes (large radius corners, thick borders) for buttons and knobs, in cherry red, mustard, or mint.
- **Vinyl / rivets** — subtle repeating dot or stitch patterns as a border treatment on panels, suggesting upholstered or riveted-metal surfaces.
- **CRT glass** — a very faint scanline texture (repeating 1-2px horizontal lines) plus a slight warm glow, on top of amber/green readout text.

## Motifs & Decoration

- **Atomic/orbital symbol** — the classic electron-orbit icon (circles/ellipses around a nucleus); use as a small recurring badge or watermark, not oversized.
- **Starbursts** — Sputnik-style radiating spikes, slightly more angular/mechanical than Raygun Gothic's softer bursts; good as section dividers.
- **Boomerang / Googie shapes** — asymmetric swooping shapes from diner and motel signage; pointy, angular, aerodynamic forms that suggest motion rather than function (the Seattle Space Needle — an upswept, UFO-topped tower — is the canonical architectural reference). Use for card corners or background accents.
- **CRT screen bezels** — rounded-rectangle frames with a slight inner curve and scanline texture (repeating faint horizontal lines) around any "readout" content.
- **Dials, knobs, and gauges** — circular elements with tick marks, suggesting analog instrumentation; good for decorative borders or loaders.
- **Blinking indicator lights** — small glowing circles (amber/green) that pulse via CSS animation, evoking room-sized mainframes.
- **Civil defense signage** — black-and-yellow trefoil or triangular hazard motifs, used sparingly for warnings/alerts only, never as general decoration (keeps the Cold War edge intentional rather than kitschy).
- **Suburban silhouettes** — simple flat-icon outlines of ranch houses, TV antennas, or tail-finned cars as understated background texture.
- **Atomic-motif fabric pattern** — a small repeating pattern of tiny orbit/starburst glyphs (like period atomic-print dresses and wallpaper), useful as a subtle low-opacity background texture on panels rather than a loud foreground element.

Use motifs with restraint and let the palette carry most of the mood: dark bunker backgrounds, punctuated by domestic pastel panels and glowing CRT/dial details, with civil-defense red held back for genuine alerts.

### Optional Dystopian Variant

Atompunk carries real tension between 1950s atomic optimism and Cold War dread (the *Fallout* game series and its "Nuka-Cola" branding are the defining modern touchstone). For a section that leans into that darker side — warnings, an "archive" of failed futures, an error/empty state — desaturate the domestic accent colors toward muted, dusty tones, lean harder on civil-defense yellow/black hazard striping, and favor radiation/warning iconography over cheerful starbursts. Keep this variant to isolated moments; the baseline page should stay in the optimistic register.

## Background Patterns & Grids

Drawn from pulp sci-fi cover illustration (*Science Fiction Quarterly*, *Amazing Stories*, and classic "robot at the console" space-station art):

- **Blueprint / graph-paper grid** — a faint, low-contrast ruled grid (thin lines, ~20-40px cells) laid over a flat color background (e.g. the chartreuse cover backdrop). Reads as a technical schematic. Implement as a repeating `linear-gradient` grid at low opacity over a solid or radial-gradient base.
- **Geometric lattice / dome framing** — a window, portal, or hero-image frame divided by straight lines into triangles or long lattice segments (like the observation-dome glass in the console-room illustration), rather than a plain rectangular border. Use as a decorative frame around a hero image or featured card.
- **Starfield speckle** — scattered small white/light dots of varying size over dark navy-black backgrounds, denser near "focal" points; pairs naturally with the deep-space navy-black background color.
- **Orbital ring overlays** — one or two large, thin circular rings (in a warm glow color — amber, coral, or cherry) positioned off-center and partially cropped by the frame, echoing the lens-flare/orbit-track rings around the console in the illustration. Good as a large, mostly-transparent decorative element behind a hero section.
- **Ink-outline illustration style** — foreground illustrated elements (rockets, figures, planets) are bordered in solid black before color is applied, giving strong figure/ground separation against busy backgrounds. Apply this logic to decorative SVG shapes or icons: black stroke first, flat color fill second, no soft gradients on the outline itself.

Composition note: pulp covers typically stack a bold masthead across the top third, one dominant illustrated figure/scene in the middle, and a smaller silhouette (skyline, rocket, or console) crossing the bottom edge — a useful hero-section layout rhythm (title / big art / grounding detail) even outside of print.

## Sources

- [Atompunk — Aesthetics Wiki](https://aesthetics.fandom.com/wiki/Atompunk)
- [Atomic Age — Aesthetics Wiki](https://aesthetics.fandom.com/wiki/Atomic_Age)
- [Atompunk — Aesthetics of Design](https://www.aesdes.org/2024/01/24/atompunk/)
- [What Is the Atompunk Genre? — Book Riot](https://bookriot.com/atompunk-genre/)
- [What is Atompunk? — My Steampunk Style](https://my-steampunk-style.com/blogs/steampunk-blog/atompunk)
- Period pulp sci-fi cover art: *Science Fiction Quarterly* (Nov. issue, "The Timeless Ones"), *Amazing Stories* ("I, Rocket" / "Murder in Space" issue), and classic robot-and-console space-station illustration
