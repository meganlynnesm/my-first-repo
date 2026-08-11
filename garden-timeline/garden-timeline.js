// ===========================================================================
//  garden-timeline.js  —  Gardens Over Time  (the "temporal" object)
//  A SERIES of radar "open-hours clocks": Wednesday / Friday / Saturday.
// ===========================================================================
//
//  WHAT THIS IS, IN PLAIN ENGLISH
//  ------------------------------
//  A radar chart arranges its axes around a circle. Here the axes are the HOURS
//  of the day (8 AM round to 7 PM), so each circle reads like a clock, and each
//  coloured shape is a borough. A shape reaches far out at an hour where most of
//  that borough's gardens are open, and pulls in where few are. Time around a
//  circle makes this a *temporal* (cyclical) structure.
//
//  We draw ONE clock per day the dataset records (Wednesday, Friday, Saturday) —
//  "small multiples" — so you can compare how the daily rhythm shifts across the
//  week just by scanning left to right.
//
//  THE DATA IS REAL
//  ----------------
//  garden-hours.js is generated straight from NYC Open Data's GreenThumb records
//  (each garden's listed open hours per day). For every hour we count how many of
//  a borough's gardens are open, as a share of that borough's gardens that list
//  hours that day (so the five shapes are comparable despite very different
//  borough sizes).
//
//  THE CHART CODE
//  --------------
//  Rendering is Nadieh Bremer's radar-chart redesign (radarChart.js, D3 v3) —
//  the gist Megan chose. We call it once per day, into its own little container.
// ===========================================================================

// Borough colours — the same palette as the map and circle-packing.
const boroughColor = {
  "Brooklyn": "#b0495a", "Bronx": "#5f6e2a", "Queens": "#6e1f38",
  "Manhattan": "#86a24a", "Staten Island": "#cf8ba0",
};

// Bremer's radar colours each blob by its series INDEX, so we build an ordinal
// scale over 0..4 in the same order as RADAR_BOROUGHS (from garden-hours.js).
const color = d3.scale.ordinal()
    .domain(d3.range(RADAR_BOROUGHS.length))
    .range(RADAR_BOROUGHS.map(b => boroughColor[b]));

// One small radar per day. Shared options; small enough to sit three across.
const radarOptions = {
  w: 300, h: 300,
  margin: { top: 70, right: 90, bottom: 70, left: 90 },
  maxValue: 1.0,        // values are shares from 0 to 1
  levels: 5,            // grid rings at 20%, 40%, ... 100%
  roundStrokes: true,   // smooth, rounded blobs
  color: color,
  opacityArea: 0.15,
  dotRadius: 2.5,
  strokeWidth: 1.8,
  labelFactor: 1.2,
  wrapWidth: 52,
};

// Build a cell (day title + chart + count) for each day, then draw its radar.
const row = document.getElementById("radar-row");
RADAR_DAYS.forEach(day => {
  const cell = document.createElement("div");
  cell.className = "radar-cell";
  const chartId = "radar-" + day.key;
  cell.innerHTML =
    `<h3 class="radar-day">${day.label}</h3>` +
    `<div class="radarChart" id="${chartId}"></div>` +
    `<p class="radar-sub">${day.total} gardens list hours</p>`;
  row.appendChild(cell);
  RadarChart("#" + chartId, day.data, radarOptions);
});

// One shared borough legend beneath the three clocks.
document.getElementById("ts-legend").innerHTML =
  '<span class="ts-legend-title">Borough</span>' +
  RADAR_BOROUGHS.map(b =>
    `<span class="ts-legend-item"><span class="ts-swatch" style="background:${boroughColor[b]}"></span>${b}</span>`
  ).join("");
