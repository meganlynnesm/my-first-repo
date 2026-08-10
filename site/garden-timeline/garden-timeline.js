// =====================================================================
// Green Thumbs — Gardens Over Time  (temporal object)  ·  BLANK CANVAS
//
// This is a scaffold. The intended chart is a time series of NYC community
// gardens by the year they were established, following the D3 approach in
//   https://krisrs1128.github.io/stat679_notes/2022/06/01/week8-1.html
//   (d3.scaleTime + d3.line / d3.area path generators).
//
// The current gardenData (../green-thumb/data.js) has NO founding-year field,
// so there is no data to plot yet. The axes + scales below are laid out and
// the render function is written and waiting — once a [{year, count}] array
// is available, call renderTimeline(data) and the chart draws itself.
// =====================================================================

const MARGIN = { top: 24, right: 28, bottom: 40, left: 52 };
const WIDTH  = 900;
const HEIGHT = 440;
const innerW = WIDTH  - MARGIN.left - MARGIN.right;
const innerH = HEIGHT - MARGIN.top  - MARGIN.bottom;

// Placeholder domains — swap for the real extent once data arrives.
const YEAR_MIN = 1970, YEAR_MAX = 2025;

const svg = d3.select("#timeline")
  .append("svg")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
    .attr("width", "100%")
    .attr("height", "auto");

const plot = svg.append("g")
  .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

// Scales (d3.scaleTime on the x-axis, per the reference).
const scales = {
  x: d3.scaleTime()
      .domain([new Date(YEAR_MIN, 0, 1), new Date(YEAR_MAX, 0, 1)])
      .range([0, innerW]),
  y: d3.scaleLinear()
      .domain([0, 100])          // placeholder count domain
      .nice()
      .range([innerH, 0]),
};

// Axes.
plot.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(scales.x).ticks(8).tickFormat(d3.timeFormat("%Y")));

plot.append("g")
    .attr("class", "axis y-axis")
    .call(d3.axisLeft(scales.y).ticks(6));

// Axis titles.
plot.append("text")
    .attr("class", "axis-title")
    .attr("x", innerW / 2).attr("y", innerH + 34)
    .attr("text-anchor", "middle")
    .text("Year established");

plot.append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerH / 2).attr("y", -38)
    .attr("text-anchor", "middle")
    .text("Gardens");

// Empty-state note, centred in the plot area.
plot.append("text")
    .attr("class", "empty-note")
    .attr("x", innerW / 2).attr("y", innerH / 2)
    .attr("text-anchor", "middle")
    .text("Blank canvas — awaiting garden founding-year data");

// Groups the render function will draw into (kept empty for now).
const areaLayer = plot.append("path").attr("class", "ts-area");
const lineLayer = plot.append("path").attr("class", "ts-line");
const dotsLayer = plot.append("g").attr("class", "ts-dots");

// ---------------------------------------------------------------------
// renderTimeline(data)
//   data: array of { year: <number>, count: <number> } sorted by year.
//   Draws a cumulative area + line of gardens established through time,
//   plus a dot per year. Wired to the reference's path-generator pattern;
//   just feed it real data and remove the empty-note above.
// ---------------------------------------------------------------------
function renderTimeline(data) {
  if (!data || !data.length) return;

  // Cumulative running total, so the curve reads as "network growth".
  let running = 0;
  const cumulative = data.map(d => ({ date: new Date(d.year, 0, 1), value: (running += d.count) }));

  scales.x.domain(d3.extent(cumulative, d => d.date));
  scales.y.domain([0, d3.max(cumulative, d => d.value)]).nice();

  plot.select(".x-axis")
      .call(d3.axisBottom(scales.x).ticks(8).tickFormat(d3.timeFormat("%Y")));
  plot.select(".y-axis").call(d3.axisLeft(scales.y).ticks(6));
  plot.select(".empty-note").remove();

  const area = d3.area()
      .x(d => scales.x(d.date))
      .y0(innerH)
      .y1(d => scales.y(d.value));

  const line = d3.line()
      .x(d => scales.x(d.date))
      .y(d => scales.y(d.value));

  areaLayer.datum(cumulative).attr("d", area);
  lineLayer.datum(cumulative).attr("d", line);

  dotsLayer.selectAll("circle")
    .data(cumulative)
    .join("circle")
      .attr("cx", d => scales.x(d.date))
      .attr("cy", d => scales.y(d.value))
      .attr("r", 3);
}

// Expose for when the data is ready (call from the console or a data script).
window.renderTimeline = renderTimeline;
