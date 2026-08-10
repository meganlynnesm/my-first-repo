// =====================================================================
// Green Thumbs — Garden Matchmaker  (engagement object)
//
// A short, playful quiz that matches the visitor to a REAL NYC GreenThumb
// community garden, drawn from the same gardenData that powers the map and
// the circle-packing chart (../green-thumb/data.js). Three questions →
// a scored match → a reveal card that links out to the map.
// =====================================================================

const boroughPalette = {
  "Brooklyn": "#b0495a", "Bronx": "#5f6e2a", "Queens": "#6e1f38",
  "Manhattan": "#86a24a", "Staten Island": "#cf8ba0",
};
const AGENCY = {
  "DPR": "NYC Parks & Recreation", "NYRP": "New York Restoration Project",
  "NYCHA": "NYC Housing Authority", "BQLT": "Brooklyn–Queens Land Trust",
  "BLT": "Bronx Land Trust", "MLT": "Manhattan Land Trust", "PRI": "Private owner",
};
const agencyName = c => (c && AGENCY[c]) ? AGENCY[c] : (c || "a local steward");

// --- Flatten borough > jurisdiction > garden into a flat list -------------
function flattenGardens(root) {
  const out = [];
  (root.children || []).forEach(boro =>
    (boro.children || []).forEach(juris =>
      (juris.children || []).forEach(g => {
        out.push({
          name: g.name, borough: boro.name, jurisdiction: juris.name,
          area: Number(g.value) || 0, status: g.status || "",
          address: g.address || "", zipcode: String(g.zipcode || "").replace(/,/g, ""),
        });
      })));
  return out;
}
const GARDENS = flattenGardens(gardenData);

// --- Quiz -----------------------------------------------------------------
const QUESTIONS = [
  {
    id: "borough", prompt: "Which corner of the city feels like home?",
    options: [
      { label: "Brooklyn", val: "Brooklyn" }, { label: "The Bronx", val: "Bronx" },
      { label: "Queens", val: "Queens" }, { label: "Manhattan", val: "Manhattan" },
      { label: "Staten Island", val: "Staten Island" }, { label: "Surprise me", val: null },
    ],
  },
  {
    id: "size", prompt: "How much earth do you want under your nails?",
    options: [
      { label: "A cozy pocket plot", val: "small" },
      { label: "Room to grow", val: "mid" },
      { label: "A sprawling farm", val: "large" },
    ],
  },
  {
    id: "mood", prompt: "What kind of place are you after?",
    options: [
      { label: "Active & buzzing", val: "active" },
      { label: "A quiet hidden gem", val: "quiet" },
      { label: "Any that will have me", val: null },
    ],
  },
];

const answers = {};
let step = 0;

const stageEl = document.getElementById("gm-stage");
const progEl  = document.getElementById("gm-progress");

function renderQuestion() {
  const q = QUESTIONS[step];
  progEl.textContent = `Question ${step + 1} of ${QUESTIONS.length}`;
  stageEl.innerHTML = `
    <h2 class="q-prompt">${q.prompt}</h2>
    <div class="q-options">
      ${q.options.map((o, i) =>
        `<button class="q-opt" data-i="${i}" type="button">${o.label}</button>`).join("")}
    </div>`;
  stageEl.querySelectorAll(".q-opt").forEach(btn => {
    btn.addEventListener("click", () => {
      answers[q.id] = q.options[Number(btn.dataset.i)].val;
      step++;
      if (step < QUESTIONS.length) renderQuestion();
      else reveal();
    });
  });
}

// Size buckets by footprint (m²).
const sizeBucket = a => a < 400 ? "small" : a <= 1200 ? "mid" : "large";

function scoreGarden(g) {
  let s = 0;
  if (answers.borough && g.borough === answers.borough) s += 3;
  if (sizeBucket(g.area) === answers.size) s += 2;
  const isActive = /active/i.test(g.status);
  if (answers.mood === "active" && isActive) s += 2;
  if (answers.mood === "quiet" && !isActive) s += 1;
  // A touch of noise so replays with the same answers can surface a different gem.
  s += Math.random() * 0.9;
  return s;
}

function reveal() {
  progEl.textContent = "Your match";

  let pool = GARDENS;
  if (answers.borough) {
    const inBoro = GARDENS.filter(g => g.borough === answers.borough);
    if (inBoro.length) pool = inBoro;   // fall back to all if a borough is empty
  }
  const match = pool.slice().sort((a, b) => scoreGarden(b) - scoreGarden(a))[0];
  const col = boroughPalette[match.borough] || "#6e1f38";

  stageEl.innerHTML = `
    <div class="reveal">
      <div class="reveal-kicker">A garden for you</div>
      <div class="reveal-card" style="--boro:${col}">
        <div class="reveal-sprout" aria-hidden="true">🌱</div>
        <h2 class="reveal-name">${match.name}</h2>
        <div class="reveal-boro">${match.borough}</div>
        <ul class="reveal-facts">
          <li>Tended by <b>${agencyName(match.jurisdiction)}</b></li>
          ${match.area ? `<li>Footprint <b>${match.area.toLocaleString()} m²</b></li>` : ""}
          ${match.status ? `<li>Status <b>${match.status}</b></li>` : ""}
          ${match.address ? `<li class="muted">${match.address}${match.zipcode && !match.address.includes(match.zipcode) ? ", " + match.zipcode : ""}</li>` : ""}
        </ul>
      </div>
      <div class="reveal-actions">
        <a class="btn primary" href="../garden-map/index.html">See it on the map ↗</a>
        <button class="btn" id="gm-again" type="button">Match me again</button>
      </div>
    </div>`;

  document.getElementById("gm-again").addEventListener("click", () => {
    step = 0; for (const k in answers) delete answers[k];
    renderQuestion();
  });
}

// Kick off once the "Start" button is pressed.
document.getElementById("gm-start").addEventListener("click", () => {
  document.getElementById("gm-hero").hidden = true;
  document.getElementById("gm-quiz").hidden = false;
  renderQuestion();
});
