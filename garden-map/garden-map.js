// ===========================================================================
//  garden-map.js  —  NYC Community Garden Map  (the "geospatial" object)
// ===========================================================================
//
//  WHAT THIS FILE DOES, IN PLAIN ENGLISH
//  -------------------------------------
//  It takes the list of 635 community gardens (the same data the circle-packing
//  chart uses) and draws each one as a dot on a real map of New York City.
//  Dots are coloured by borough and sized by how big the garden is. You can
//  click a borough in the legend to hide/show it, and click a dot to read
//  details about that garden.
//
//  THE FLOW (how the code below is organised, top to bottom)
//  ---------------------------------------------------------
//    1. Set up look-up tables (colours per borough, full agency names).
//    2. Turn the nested garden data into "GeoJSON" — the format maps expect.
//    3. Create the map and give it a basemap.
//    4. Describe how dots should look using "expressions".
//    5. When the map is ready: add the dots, the legend, the click pop-ups.
//    6. Helper functions for the clickable borough filter + the stat readout.
//
//  A FEW WORDS YOU'LL SEE A LOT
//  ----------------------------
//    • GeoJSON  — a standard way to write geographic data as JSON. A "Feature"
//                 is one thing on the map (here, one garden) with a geometry
//                 (its point) and "properties" (its name, area, etc.).
//    • source   — the DATA a map draws from.
//    • layer    — a VISUAL drawn from a source (here, circles).
//    • expression — a little rule, written as nested arrays, that MapLibre
//                 reads to decide a colour/size PER FEATURE (e.g. "if borough
//                 is Brooklyn, use dusty rose"). It saves us looping by hand.
//
//  LIBRARY NOTE: the course "Geospatial Structures" tutorial uses Mapbox GL JS.
//  This map uses MAPLIBRE GL — the open-source fork of Mapbox with the same
//  API — so it needs no Mapbox account or access token. Everything the Mapbox
//  tutorial teaches (sources, layers, expressions, popups) applies directly.
// ===========================================================================


// --- 1. LOOK-UP TABLES ------------------------------------------------------

// One colour per borough. These are the SAME colours as the circle-packing
// chart, on purpose — so the map and the chart feel like one project.
const boroughPalette = {
  "Brooklyn":      "#b0495a", // dusty rose
  "Bronx":         "#5f6e2a", // olive green
  "Queens":        "#6e1f38", // burgundy
  "Manhattan":     "#86a24a", // sage green
  "Staten Island": "#cf8ba0", // soft rose-pink
};

// The data stores jurisdictions as short codes ("DPR"). This dictionary turns
// a code into a readable name for the pop-up. (Codes not listed just show
// as-is via the helper below.)
const AGENCY = {
  "DPR": "NYC Parks & Recreation", "NYRP": "New York Restoration Project",
  "NYCHA": "NYC Housing Authority", "BQLT": "Brooklyn–Queens Land Trust",
  "BLT": "Bronx Land Trust", "MLT": "Manhattan Land Trust", "PRI": "Private owner",
  "DOT": "NYC Dept. of Transportation", "NYS DOT": "NY State Dept. of Transportation",
  "DOE": "NYC Dept. of Education", "MTA": "Metropolitan Transportation Authority",
  "DEP": "NYC Dept. of Environmental Protection",
  "HPD": "NYC Housing Preservation & Development",
  "DCAS": "Dept. of Citywide Administrative Services", "NYPD": "NYC Police Department",
  "FDNY": "NYC Fire Department", "ACS": "Administration for Children's Services",
  "NYS PARKS": "NY State Parks", "BANG": "Brooklyn Alliance of Neighbourhood Gardens",
  "JOP": "Jointly Operated Playgrounds",
};
// Given a code, return its full name if we know it, otherwise the code itself.
// (The "? :" is a shorthand if/else called a ternary.)
const agencyName = code => (code && AGENCY[code]) ? AGENCY[code] : (code || "—");


// --- 2. RESHAPE THE DATA INTO GEOJSON --------------------------------------

// The garden data is a nested tree: City → Borough → Jurisdiction → Garden.
// A map can't read that tree directly; it wants a FLAT list of GeoJSON points.
// This function walks the tree and, for every garden at the bottom, builds one
// GeoJSON "Feature". (The .forEach loops are just "do this for each item".)
function gardensToGeoJSON(root) {
  const features = [];                          // we'll fill this list up
  (root.children || []).forEach(boro => {       // for each borough...
    (boro.children || []).forEach(juris => {    //   for each jurisdiction...
      (juris.children || []).forEach(g => {     //     for each garden...
        // Coordinates are stored as text ("40.80"), so parseFloat -> number.
        const lat = parseFloat(g.lat), lon = parseFloat(g.lon);
        if (!isFinite(lat) || !isFinite(lon)) return;  // no coords? skip it.
        features.push({
          type: "Feature",
          // GeoJSON expects coordinates as [longitude, latitude] — lon FIRST.
          // This trips up almost everyone at least once.
          geometry: { type: "Point", coordinates: [lon, lat] },
          properties: {                          // everything we might show later
            name: g.name,
            borough: boro.name,
            jurisdiction: juris.name,
            agency: agencyName(juris.name),
            area: g.value || 0,                  // footprint in square metres
            status: g.status || "",
            address: g.address || "",
            // Some zips are stored like "10,473"; strip the comma for display.
            zipcode: String(g.zipcode || "").replace(/,/g, ""),
          }
        });
      });
    });
  });
  // A GeoJSON "FeatureCollection" is just { type, features: [...] }.
  return { type: "FeatureCollection", features };
}

// Run the reshape once, now, and remember the result.
const gardens = gardensToGeoJSON(gardenData);

// A Set is a list with no duplicates. We use it to remember which boroughs are
// currently switched ON in the legend. It starts with all five.
const activeBoroughs = new Set(Object.keys(boroughPalette));


// --- 3. CREATE THE MAP ------------------------------------------------------

// `new maplibregl.Map({...})` builds the map. `container` points at the empty
// <div id="map"> in the HTML. `style` is the basemap (streets/water/labels) —
// here a Protomaps vector style file (MapBaseV2.json). No access token needed.
const map = new maplibregl.Map({
  container: "map",
  style: "MapBaseV2.json",
  center: [-73.95, 40.70],   // where the map opens: [longitude, latitude] = NYC
  zoom: 10.2,                // bigger number = more zoomed in
  maxZoom: 17,
  minZoom: 9,
});
// Map controls: zoom + compass, fullscreen, and a metric scale bar.
map.addControl(new maplibregl.NavigationControl(), "top-right");
map.addControl(new maplibregl.FullscreenControl(), "top-right");
map.addControl(new maplibregl.ScaleControl({ maxWidth: 80, unit: "metric" }), "bottom-left");


// --- 4. RULES FOR HOW DOTS LOOK (expressions) ------------------------------

// An expression is a rule MapLibre applies to EACH dot on its own.
// "match" works like a switch statement: look at each garden's "borough"
// property, and return the matching colour; if none match, use the fallback.
const boroughColorExpr = [
  "match", ["get", "borough"],
  "Brooklyn", boroughPalette["Brooklyn"],
  "Bronx", boroughPalette["Bronx"],
  "Queens", boroughPalette["Queens"],
  "Manhattan", boroughPalette["Manhattan"],
  "Staten Island", boroughPalette["Staten Island"],
  "#a0787e"   // fallback colour if the borough is something unexpected
];

// "interpolate" = fade smoothly between values. We nest two of them so the dot
// size depends on BOTH the zoom level AND the garden's area:
//   - the outer one reads the zoom (9 = far out, 14 = close in)
//   - the inner one reads the area and maps small→big footprints to small→big
//     radii. So a tiny plot is a small dot; a big farm is a big dot.
const radiusExpr = [
  "interpolate", ["linear"], ["zoom"],
  9,  ["interpolate", ["linear"], ["get", "area"], 50, 1.6, 500, 3, 1500, 5,  3500, 8],
  14, ["interpolate", ["linear"], ["get", "area"], 50, 4,   500, 7, 1500, 12, 3500, 20],
];


// --- 5. WHEN THE MAP IS READY, DRAW EVERYTHING -----------------------------

// A basemap loads its tiles over the internet, which takes a moment. We wait
// for the "load" event before adding our own data, or it wouldn't be there yet.
map.on("load", () => {

  // A SOURCE is the data. We hand MapLibre our GeoJSON of gardens.
  map.addSource("gardens", { type: "geojson", data: gardens });

  // A LAYER is the picture. "circle" draws one filled dot per feature, styled
  // by the expressions from step 4.
  map.addLayer({
    id: "gardens-layer",
    type: "circle",
    source: "gardens",
    paint: {
      "circle-color": boroughColorExpr,
      "circle-radius": radiusExpr,
      "circle-opacity": 0.9,
      "circle-stroke-width": 1,
      "circle-stroke-color": "rgba(245,234,214,0.85)",  // thin cream outline
    }
  });

  // Set the map up to match the legend + stats + filter (defined lower down).
  applyFilter();
  updateStats();
  buildLegend();

  // POP-UP ON CLICK: when a garden dot is clicked, build a little HTML card
  // from that garden's properties and show it at the dot's location.
  map.on("click", "gardens-layer", (e) => {
    const p = e.features[0].properties;                 // the clicked garden
    const coords = e.features[0].geometry.coordinates.slice(); // [lon, lat]
    const area = Number(p.area);
    // Template strings (backticks) let us drop values in with ${...}.
    // The `condition ? "show this" : ""` bits hide rows when data is missing.
    const html =
      `<strong>${p.name}</strong>` +
      `<span class="pp-boro" style="color:${boroughPalette[p.borough] || "#6e1f38"}">${p.borough}</span>` +
      `<div class="pp-row">${p.agency}</div>` +
      (area ? `<div class="pp-row">Footprint: <b>${area.toLocaleString()} m²</b></div>` : "") +
      (p.status ? `<div class="pp-row">Status: ${p.status}</div>` : "") +
      // Only add the zip if the address doesn't already contain it (some do).
      (p.address ? `<div class="pp-muted">${p.address}${p.zipcode && !p.address.includes(p.zipcode) ? ", " + p.zipcode : ""}</div>` : "");
    new maplibregl.Popup({ offset: 10, maxWidth: "260px" })
      .setLngLat(coords).setHTML(html).addTo(map);
  });

  // Small nicety: show a "pointer" cursor when hovering a dot, so it feels
  // clickable. We turn it back to normal when the mouse leaves.
  map.on("mouseenter", "gardens-layer", () => { map.getCanvas().style.cursor = "pointer"; });
  map.on("mouseleave", "gardens-layer", () => { map.getCanvas().style.cursor = ""; });
});


// --- 6. HELPERS: the clickable legend + the stat readout -------------------

// Tell the layer to only show gardens whose borough is currently switched on.
// The "in" expression means "keep a feature if its borough is IN this list".
function applyFilter() {
  map.setFilter("gardens-layer",
    ["in", ["get", "borough"], ["literal", [...activeBoroughs]]]);
}

// Recount how many gardens (and how much total area) are visible right now,
// and write those numbers into the panel. Runs whenever the filter changes.
function updateStats() {
  const shown = gardens.features.filter(f => activeBoroughs.has(f.properties.borough));
  // .reduce adds up a value across a list — here, total area of shown gardens.
  const total = shown.reduce((s, f) => s + Number(f.properties.area || 0), 0);
  document.getElementById("gm-count").textContent =
    `${shown.length.toLocaleString()} gardens`;
  document.getElementById("gm-area").textContent =
    `${Math.round(total).toLocaleString()} m² mapped`;
}

// Build the legend buttons (one per borough) and make each one a toggle.
function buildLegend() {
  const el = document.getElementById("gm-legend-items");
  // .map turns each [name, colour] pair into a button's HTML, then .join
  // glues them into one string we drop into the panel.
  el.innerHTML = Object.entries(boroughPalette).map(([name, col]) => `
    <button class="gm-legend-item active" data-boro="${name}" type="button">
      <span class="gm-swatch" style="background:${col}"></span>${name}
    </button>`).join("");

  // Wire up each button: clicking it flips that borough on/off, then refreshes
  // the map filter and the stats.
  el.querySelectorAll(".gm-legend-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const boro = btn.dataset.boro;
      if (activeBoroughs.has(boro)) { activeBoroughs.delete(boro); btn.classList.remove("active"); }
      else { activeBoroughs.add(boro); btn.classList.add("active"); }
      applyFilter();
      updateStats();
    });
  });
}
