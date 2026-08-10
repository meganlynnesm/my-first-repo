// =====================================================================
// Green Thumbs — NYC Community Garden Map  (geospatial object)
//
// Plots every NYC GreenThumb community garden on a MapLibre GL map.
// Data source: the SAME gardenData hierarchy that drives the circle-packing
// chart (../green-thumb/data.js) — one dataset, two objects. Each garden
// leaf carries lat/lon, so no re-geocoding is needed.
//
// The Protomaps vector base (MapBaseV2.json) is reused from the
// bench-shade-map project, so both maps share one basemap + API key.
// =====================================================================

// Borough palette — identical to the circle-packing chart so the geospatial
// and relational objects read as one visual family.
const boroughPalette = {
  "Brooklyn":      "#b0495a", // dusty rose
  "Bronx":         "#5f6e2a", // olive green
  "Queens":        "#6e1f38", // burgundy
  "Manhattan":     "#86a24a", // sage green
  "Staten Island": "#cf8ba0", // soft rose-pink
};

// Jurisdiction (agency / land-trust) codes → full names, for the popups.
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
const agencyName = code => (code && AGENCY[code]) ? AGENCY[code] : (code || "—");

// --- Flatten borough > jurisdiction > garden into GeoJSON points ----------
function gardensToGeoJSON(root) {
  const features = [];
  (root.children || []).forEach(boro => {
    (boro.children || []).forEach(juris => {
      (juris.children || []).forEach(g => {
        const lat = parseFloat(g.lat), lon = parseFloat(g.lon);
        if (!isFinite(lat) || !isFinite(lon)) return;   // skip ungeocoded rows
        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [lon, lat] },
          properties: {
            name: g.name,
            borough: boro.name,
            jurisdiction: juris.name,
            agency: agencyName(juris.name),
            area: g.value || 0,
            status: g.status || "",
            address: g.address || "",
            zipcode: String(g.zipcode || "").replace(/,/g, ""),
          }
        });
      });
    });
  });
  return { type: "FeatureCollection", features };
}

const gardens = gardensToGeoJSON(gardenData);
const activeBoroughs = new Set(Object.keys(boroughPalette));

// ---- map ------------------------------------------------------------------
const map = new maplibregl.Map({
  container: "map",
  style: "MapBaseV2.json",
  center: [-73.95, 40.70],   // [lng, lat] — NYC
  zoom: 10.2,
  maxZoom: 17,
  minZoom: 9,
});
map.addControl(new maplibregl.NavigationControl(), "top-right");

// Colour every garden by its borough (match expression on the property).
const boroughColorExpr = [
  "match", ["get", "borough"],
  "Brooklyn", boroughPalette["Brooklyn"],
  "Bronx", boroughPalette["Bronx"],
  "Queens", boroughPalette["Queens"],
  "Manhattan", boroughPalette["Manhattan"],
  "Staten Island", boroughPalette["Staten Island"],
  "#a0787e"   // fallback
];

// Radius grows with the garden's footprint (m²) and with zoom.
const radiusExpr = [
  "interpolate", ["linear"], ["zoom"],
  9,  ["interpolate", ["linear"], ["get", "area"], 50, 1.6, 500, 3, 1500, 5,  3500, 8],
  14, ["interpolate", ["linear"], ["get", "area"], 50, 4,   500, 7, 1500, 12, 3500, 20],
];

map.on("load", () => {
  map.addSource("gardens", { type: "geojson", data: gardens });

  map.addLayer({
    id: "gardens-layer",
    type: "circle",
    source: "gardens",
    paint: {
      "circle-color": boroughColorExpr,
      "circle-radius": radiusExpr,
      "circle-opacity": 0.9,
      "circle-stroke-width": 1,
      "circle-stroke-color": "rgba(245,234,214,0.85)",  // cream ring
    }
  });

  applyFilter();
  updateStats();
  buildLegend();

  // ---- popup on click ----
  map.on("click", "gardens-layer", (e) => {
    const p = e.features[0].properties;
    const coords = e.features[0].geometry.coordinates.slice();
    const area = Number(p.area);
    const html =
      `<strong>${p.name}</strong>` +
      `<span class="pp-boro" style="color:${boroughPalette[p.borough] || "#6e1f38"}">${p.borough}</span>` +
      `<div class="pp-row">${p.agency}</div>` +
      (area ? `<div class="pp-row">Footprint: <b>${area.toLocaleString()} m²</b></div>` : "") +
      (p.status ? `<div class="pp-row">Status: ${p.status}</div>` : "") +
      (p.address ? `<div class="pp-muted">${p.address}${p.zipcode && !p.address.includes(p.zipcode) ? ", " + p.zipcode : ""}</div>` : "");
    new maplibregl.Popup({ offset: 10, maxWidth: "260px" })
      .setLngLat(coords).setHTML(html).addTo(map);
  });

  map.on("mouseenter", "gardens-layer", () => { map.getCanvas().style.cursor = "pointer"; });
  map.on("mouseleave", "gardens-layer", () => { map.getCanvas().style.cursor = ""; });
});

// ---- borough filter (clickable legend) -----------------------------------
function applyFilter() {
  map.setFilter("gardens-layer",
    ["in", ["get", "borough"], ["literal", [...activeBoroughs]]]);
}

function updateStats() {
  const shown = gardens.features.filter(f => activeBoroughs.has(f.properties.borough));
  const total = shown.reduce((s, f) => s + Number(f.properties.area || 0), 0);
  document.getElementById("gm-count").textContent =
    `${shown.length.toLocaleString()} gardens`;
  document.getElementById("gm-area").textContent =
    `${Math.round(total).toLocaleString()} m² mapped`;
}

function buildLegend() {
  const el = document.getElementById("gm-legend-items");
  el.innerHTML = Object.entries(boroughPalette).map(([name, col]) => `
    <button class="gm-legend-item active" data-boro="${name}" type="button">
      <span class="gm-swatch" style="background:${col}"></span>${name}
    </button>`).join("");

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
