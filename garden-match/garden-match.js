// ===========================================================================
//  garden-match.js  —  Garden Matchmaker  (the "engagement" object)
// ===========================================================================
//
//  WHAT THIS FILE DOES:
//  -------------------------------------
//  A tiny quiz. The visitor answers three questions, and we pair them with ONE
//  real NYC community garden from our data by scoring every garden against
//  their answers and picking the best fit. Then  show a "reveal" card and a
//  button to run it again. It reuses the SAME garden data as the map + chart.
//
//  THE FLOW (top to bottom)
//  ------------------------
//    1. Look-up tables (borough colours, agency names).
//    2. Flatten the nested data into a simple flat list of gardens.
//    3. Define the three questions and their answer options.
//    4. renderQuestion(): show the current question and wait for a click.
//    5. scoreGarden(): give each garden points for matching the answers.
//    6. reveal(): pick the top-scoring garden and show its card.
//    7. Wire up the "Start" button to kick everything off.
//
// ===========================================================================


// --- 1. LOOK-UP TABLES ------------------------------------------------------
const boroughPalette = {
  "Brooklyn": "#b0495a", "Bronx": "#5f6e2a", "Queens": "#6e1f38",
  "Manhattan": "#86a24a", "Staten Island": "#cf8ba0",
};
const AGENCY = {
  "DPR": "NYC Parks & Recreation", "NYRP": "New York Restoration Project",
  "NYCHA": "NYC Housing Authority", "BQLT": "Brooklyn–Queens Land Trust",
  "BLT": "Bronx Land Trust", "MLT": "Manhattan Land Trust", "PRI": "Private owner",
};
// Full agency name if known, otherwise a friendly generic phrase.
const agencyName = c => (c && AGENCY[c]) ? AGENCY[c] : (c || "a local steward");


// --- 2. FLATTEN THE DATA ----------------------------------------------------
// The data is a tree (Borough → Jurisdiction → Garden). For scoring we just
// want a plain array of gardens, so we walk the tree and collect the leaves.
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
const GARDENS = flattenGardens(gardenData);   // the flat list, built once


// --- 3. THE QUESTIONS -------------------------------------------------------
// Each question has an id (where its answer is stored), a prompt, and options.
// Every option carries a `val` — the value we'll score against later.
// A val of `null` means "no preference" (e.g. "Surprise me").
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
    id: "size", prompt: "How much soil do you want to be surrounded by?",
    options: [
      { label: "A cozy pocket plot", val: "small" },
      { label: "Room to grow", val: "mid" },
      { label: "A sprawling farm", val: "large" },
    ],
  },
  {
    id: "mood", prompt: "What kind of vibe are you after?",
    options: [
      { label: "Active & buzzing", val: "active" },
      { label: "A quiet hidden gem", val: "quiet" },
      { label: "Any that will have me", val: null },
    ],
  },
];

// --- STATE: what the program remembers as the visitor plays ---
const answers = {};   // fills up like { borough: "Brooklyn", size: "large", ... }
let step = 0;         // index of the question we're currently showing

// Grab the two page elements we'll be writing into, once.
const stageEl = document.getElementById("gm-stage");     // question / reveal area
const progEl  = document.getElementById("gm-progress");  // "Question 1 of 3"


// --- 4. SHOW THE CURRENT QUESTION ------------------------------------------
function renderQuestion() {
  const q = QUESTIONS[step];
  progEl.textContent = `Question ${step + 1} of ${QUESTIONS.length}`;

  // Build the question + a button per option. .map+.join turns the options
  // array into one HTML string. data-i remembers each button's option number.
  stageEl.innerHTML = `
    <h2 class="q-prompt">${q.prompt}</h2>
    <div class="q-options">
      ${q.options.map((o, i) =>
        `<button class="q-opt" data-i="${i}" type="button">${o.label}</button>`).join("")}
    </div>`;

  // Make each button do something when clicked: record the answer, then either
  // move to the next question or, if that was the last one, show the reveal.
  stageEl.querySelectorAll(".q-opt").forEach(btn => {
    btn.addEventListener("click", () => {
      answers[q.id] = q.options[Number(btn.dataset.i)].val;   // save the choice
      step++;                                                 // advance state
      if (step < QUESTIONS.length) renderQuestion();          // more questions?
      else reveal();                                          // no — show match
    });
  });
}


// --- 5. SCORE A GARDEN AGAINST THE ANSWERS ---------------------------------
// Sort each garden's footprint into a size "bucket" so we can compare it to
// the visitor's size preference.
const sizeBucket = a => a < 400 ? "small" : a <= 1200 ? "mid" : "large";

// Give a garden points for each thing it has in common with the answers.
// More points = better match. Returns a number.
function scoreGarden(g) {
  let s = 0;
  if (answers.borough && g.borough === answers.borough) s += 3;   // right borough
  if (sizeBucket(g.area) === answers.size) s += 2;                // right size
  const isActive = /active/i.test(g.status);                      // status has "active"?
  if (answers.mood === "active" && isActive) s += 2;
  if (answers.mood === "quiet" && !isActive) s += 1;
  // Add a little randomness so replaying with the same answers can surface a
  // different garden instead of always the exact same one.
  s += Math.random() * 0.9;
  return s;
}


// --- 6. PICK THE BEST MATCH AND SHOW ITS CARD ------------------------------
function reveal() {
  progEl.textContent = "Your match";

  // If a borough was chosen, only consider gardens there (unless that would
  // leave us with none, in which case fall back to all gardens).
  let pool = GARDENS;
  if (answers.borough) {
    const inBoro = GARDENS.filter(g => g.borough === answers.borough);
    if (inBoro.length) pool = inBoro;
  }

  // Sort the pool by score, highest first, and take the top one ([0]).
  const match = pool.slice().sort((a, b) => scoreGarden(b) - scoreGarden(a))[0];
  const col = boroughPalette[match.borough] || "#6e1f38";   // its borough colour

  // Build the reveal card. The `? ... : ""` bits skip rows when data is empty,
  // and we only add the zip if the address doesn't already include it.
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

  // "Match me again" resets the state and starts the quiz over.
  document.getElementById("gm-again").addEventListener("click", () => {
    step = 0;
    for (const k in answers) delete answers[k];   // clear previous choices
    renderQuestion();
  });
}


// --- 7. START ---------------------------------------------------------------
// Nothing happens until the visitor presses "Find my garden":  hide the
// intro, show the quiz area, and render the first question.
document.getElementById("gm-start").addEventListener("click", () => {
  document.getElementById("gm-hero").hidden = true;
  document.getElementById("gm-quiz").hidden = false;
  renderQuestion();
});
