// ===========================================================================
//  garden-timeline.js  —  Gardens Over Time  (the "temporal" object)
//  *** BLANK CANVAS: the chart is set up but has no data to draw yet ***
// ===========================================================================
//
//  WHAT THIS FILE IS FOR, IN PLAIN ENGLISH
//  ---------------------------------------
//  The goal is a line/area chart showing how many NYC community gardens were
//  founded each year — a picture of the movement growing over time. We don't
//  have the "year founded" data yet, so this file builds the EMPTY chart (the
//  frame, the axes, the labels) and a ready-to-use function, renderTimeline(),
//  that will draw the line the moment real data arrives. Think of it as
//  stretching the canvas and laying out the pencil lines before painting.
//
//  THE TOOL: D3
//  ------------
//  D3 is a library for data-driven graphics. Two ideas do most of the work:
//    • SCALES map DATA numbers to PIXEL positions. e.g. a scaleTime turns a
//      date (1985) into an x-position (340px). A scaleLinear does the same for
//      plain numbers on the y-axis (a count → a height).
//    • PATH GENERATORS (d3.line, d3.area) take a list of points and write the
//      long "d" string an SVG <path> needs, so we don't do that maths by hand.
//  (This mirrors the stat679 week-8 notes linked on the page.)
//
//  THE FLOW BELOW
//  --------------
//    1. Pick the chart size + margins (space for axes).
//    2. Create the SVG and an inner group shifted in by the margins.
//    3. Build the x (time) and y (count) scales.
//    4. Draw the axes, titles, and an "empty" note.
//    5. Make empty <path>/<g> holders the data will later fill.
//    6. renderTimeline(data): the function that draws the real chart.
// ===========================================================================


// --- 1. SIZE + MARGINS ------------------------------------------------------
// The "margin convention": we reserve space around the plot for the axes, then
// draw the data inside that. innerW/innerH are the drawing area that's left.
const MARGIN = { top: 24, right: 28, bottom: 40, left: 52 };
const WIDTH  = 900;
const HEIGHT = 440;
const innerW = WIDTH  - MARGIN.left - MARGIN.right;
const innerH = HEIGHT - MARGIN.top  - MARGIN.bottom;

// Placeholder time range for the empty axes. Swap for the real min/max once
// we know the actual span of founding years.
const YEAR_MIN = 1970, YEAR_MAX = 2025;


// --- 2. THE SVG CANVAS ------------------------------------------------------
// d3.select finds the <div id="timeline"> and .append adds an <svg> inside it.
// viewBox + width:100% make the chart scale to fit its container responsively.
const svg = d3.select("#timeline")
  .append("svg")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
    .attr("width", "100%")
    .attr("height", "auto");

// A <g> is an SVG "group". We shift it right/down by the margins so that (0,0)
// inside it is the top-left of the actual plotting area. Everything we draw
// goes into this group.
const plot = svg.append("g")
  .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);


// --- 3. SCALES (data value  →  pixel position) -----------------------------
const scales = {
  // x: dates → horizontal pixels. domain = the data range; range = the pixels.
  x: d3.scaleTime()
      .domain([new Date(YEAR_MIN, 0, 1), new Date(YEAR_MAX, 0, 1)])
      .range([0, innerW]),
  // y: counts → vertical pixels. Note range is [innerH, 0] — flipped, because
  // in SVG y grows DOWNWARD, but we want bigger counts to sit HIGHER up.
  y: d3.scaleLinear()
      .domain([0, 100])          // placeholder max count; real data resets this
      .nice()                    // rounds the domain to tidy numbers
      .range([innerH, 0]),
};


// --- 4. AXES, TITLES, EMPTY NOTE -------------------------------------------
// d3.axisBottom/axisLeft draw a real axis (line + ticks + numbers) from a
// scale. We put the x-axis at the bottom (translate down by innerH).
plot.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(scales.x).ticks(8).tickFormat(d3.timeFormat("%Y"))); // %Y = 4-digit year

plot.append("g")
    .attr("class", "axis y-axis")
    .call(d3.axisLeft(scales.y).ticks(6));

// Axis titles (plain <text> we position by hand).
plot.append("text")
    .attr("class", "axis-title")
    .attr("x", innerW / 2).attr("y", innerH + 34)
    .attr("text-anchor", "middle")
    .text("Year established");

plot.append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")            // turn it sideways for the y-axis
    .attr("x", -innerH / 2).attr("y", -38)
    .attr("text-anchor", "middle")
    .text("Gardens");

// A friendly note in the middle so the empty chart explains itself.
// renderTimeline() removes this once there's real data.
plot.append("text")
    .attr("class", "empty-note")
    .attr("x", innerW / 2).attr("y", innerH / 2)
    .attr("text-anchor", "middle")
    .text("Blank canvas — awaiting garden founding-year data");


// --- 5. EMPTY HOLDERS the data will fill later -----------------------------
// We create the shapes now (empty) and just update them when data arrives.
const areaLayer = plot.append("path").attr("class", "ts-area");  // shaded fill
const lineLayer = plot.append("path").attr("class", "ts-line");  // the curve
const dotsLayer = plot.append("g").attr("class", "ts-dots");     // a dot per year


// --- 6. THE DRAW FUNCTION (ready for when data exists) ---------------------
//
//   renderTimeline(data)
//   • data: an array like [{ year: 1985, count: 22 }, ...] sorted by year.
//   • It turns yearly counts into a RUNNING TOTAL, so the curve climbs to show
//     the network growing, then draws an area + line + a dot per year.
//   To use it later: build that array from real data and call renderTimeline.
//
function renderTimeline(data) {
  if (!data || !data.length) return;   // nothing to draw? do nothing.

  // Add each year's count onto the previous total (cumulative growth).
  let running = 0;
  const cumulative = data.map(d => ({
    date: new Date(d.year, 0, 1),
    value: (running += d.count)
  }));

  // Now that we know the real numbers, stretch the scales to fit them...
  scales.x.domain(d3.extent(cumulative, d => d.date));          // min & max date
  scales.y.domain([0, d3.max(cumulative, d => d.value)]).nice(); // 0 → peak total

  // ...and redraw the axes with the updated scales, and remove the note.
  plot.select(".x-axis")
      .call(d3.axisBottom(scales.x).ticks(8).tickFormat(d3.timeFormat("%Y")));
  plot.select(".y-axis").call(d3.axisLeft(scales.y).ticks(6));
  plot.select(".empty-note").remove();

  // PATH GENERATORS: give each point an x and a y, and D3 writes the SVG path.
  // area has two y's (a top edge y1 and a baseline y0) to make a filled shape.
  const area = d3.area()
      .x(d => scales.x(d.date))
      .y0(innerH)
      .y1(d => scales.y(d.value));

  const line = d3.line()
      .x(d => scales.x(d.date))
      .y(d => scales.y(d.value));

  // .datum binds the whole list to one path, then we set its "d" attribute.
  areaLayer.datum(cumulative).attr("d", area);
  lineLayer.datum(cumulative).attr("d", line);

  // One circle per point. The .data(...).join("circle") pattern is D3's way of
  // creating exactly as many <circle>s as there are data points.
  dotsLayer.selectAll("circle")
    .data(cumulative)
    .join("circle")
      .attr("cx", d => scales.x(d.date))
      .attr("cy", d => scales.y(d.value))
      .attr("r", 3);
}

// Make the function reachable from anywhere (e.g. the browser console or a
// future data script) by hanging it off the global `window` object.
window.renderTimeline = renderTimeline;
