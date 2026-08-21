// =============================================================
// time-scrubber.js — a free, draggable cosmic-time slider
// =============================================================
// The guided tour already walks through the Big Bang eras one step
// at a time. This exposes the SAME era engine as a standalone scrubber
// so anyone can drag through 10⁻⁴³ s → 10¹⁰⁰ yr and watch objects
// condense into (and fade out of) existence as the universe cools.
//
// It drives nothing itself — it just calls the injected `setEra` /
// `exit` callbacks from main.js, which run the proven Big Bang
// animation. Fully additive: if this module never loads, the rest of
// the app is unaffected.
//
//   initTimeScrubber({ setEra(eraKey), exit(durationMs), isActive() })
//
// `setEra` should map the era key to the Big Bang engine; `exit`
// smoothly restores the present-day chart.

// Ordered stops. `era` keys MUST match BIG_BANG_ERAS in tour-data.js.
const STOPS = [
  { era: "planck",        label: "Planck epoch",     time: "10⁻⁴³ s" },
  { era: "gut",           label: "Grand Unification", time: "10⁻³⁶ s" },
  { era: "electroweak",   label: "Electroweak",       time: "10⁻¹² s" },
  { era: "nuclear",       label: "Quarks & Hadrons",  time: "10⁻⁶ s" },
  { era: "recombination", label: "Recombination",     time: "380,000 yr" },
  { era: "stellar",       label: "First Stars",       time: "~300 Myr" },
  { era: "now",           label: "Now",               time: "13.8 Gyr" },
  { era: "future",        label: "The Sun's End",     time: "+5 Gyr" },
  { era: "far-future",    label: "Last Stars",        time: "10¹⁴ yr" },
  { era: "death",         label: "Heat Death",        time: "10¹⁰⁰ yr" },
];

const NOW_INDEX = STOPS.findIndex((s) => s.era === "now");

export function initTimeScrubber({ setEra, exit, isActive, resetView }) {
  const toggleBtn = document.getElementById("scrubber-btn");
  const panel = document.getElementById("scrubber-panel");
  if (!toggleBtn || !panel) return; // markup absent → no-op

  // --- Build the panel contents once ---
  panel.innerHTML = `
    <button id="scrubber-close" title="Exit time view">&times;</button>
    <div id="scrubber-readout">
      <span id="scrubber-era">Now</span>
      <span id="scrubber-time">13.8 Gyr</span>
    </div>
    <div id="scrubber-track">
      <button id="scrubber-play" title="Play the history of the universe">▶</button>
      <input id="scrubber-range" type="range" min="0" max="${STOPS.length - 1}" value="${NOW_INDEX}" step="1" aria-label="Cosmic time" />
    </div>
    <div id="scrubber-ticks"></div>
  `;

  const range = panel.querySelector("#scrubber-range");
  const eraEl = panel.querySelector("#scrubber-era");
  const timeEl = panel.querySelector("#scrubber-time");
  const playBtn = panel.querySelector("#scrubber-play");
  const closeBtn = panel.querySelector("#scrubber-close");
  const ticksEl = panel.querySelector("#scrubber-ticks");

  // Tick labels (only a few, to avoid clutter): Big Bang, Now, Heat Death
  ticksEl.innerHTML = STOPS.map((s, i) => {
    const major = i === 0 || i === NOW_INDEX || i === STOPS.length - 1;
    const pct = (i / (STOPS.length - 1)) * 100;
    const text = i === 0 ? "Big Bang" : i === NOW_INDEX ? "Now" : i === STOPS.length - 1 ? "Heat Death" : "";
    return `<span class="scrubber-tick${major ? " major" : ""}" style="left:${pct}%">${text}</span>`;
  }).join("");

  let current = NOW_INDEX;
  let playTimer = null;

  function updateReadout(i) {
    eraEl.textContent = STOPS[i].label;
    timeEl.textContent = STOPS[i].time;
  }

  function goTo(i, { animate = true } = {}) {
    i = Math.max(0, Math.min(STOPS.length - 1, i));
    current = i;
    range.value = String(i);
    updateReadout(i);
    setEra(STOPS[i].era, animate);
  }

  function stopPlaying() {
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    playBtn.textContent = "▶";
    playBtn.title = "Play the history of the universe";
  }

  function startPlaying() {
    // If we're at the end, restart from the Big Bang.
    if (current >= STOPS.length - 1) goTo(0);
    playBtn.textContent = "⏸";
    playBtn.title = "Pause";
    playTimer = setInterval(() => {
      if (current >= STOPS.length - 1) { stopPlaying(); return; }
      goTo(current + 1);
    }, 2600); // matches the era fade so each epoch is readable
  }

  // --- Open / close the whole scrubber ---
  function open() {
    panel.classList.add("open");
    toggleBtn.classList.add("active");
    toggleBtn.setAttribute("aria-expanded", "true");
    if (resetView) resetView(); // frame the whole chart before scrubbing
    goTo(current, { animate: true });
  }

  function close() {
    stopPlaying();
    panel.classList.remove("open");
    toggleBtn.classList.remove("active");
    toggleBtn.setAttribute("aria-expanded", "false");
    if (isActive && isActive()) exit(1600);
    current = NOW_INDEX;
    range.value = String(NOW_INDEX);
    updateReadout(NOW_INDEX);
  }

  toggleBtn.addEventListener("click", () => {
    if (panel.classList.contains("open")) close();
    else open();
  });
  closeBtn.addEventListener("click", close);

  range.addEventListener("input", () => {
    stopPlaying();
    goTo(parseInt(range.value, 10));
  });

  playBtn.addEventListener("click", () => {
    if (playTimer) stopPlaying();
    else startPlaying();
  });

  // Esc closes the scrubber. We deliberately do NOT capture ← / → globally:
  // the range slider already steps through eras with arrow keys when it's
  // focused (firing 'input'), and the chart's own arrow-pan handler defers to
  // a focused <input>. Capturing arrows here as well made them step the era
  // AND pan the chart at the same time.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) close();
  });

  updateReadout(NOW_INDEX);
}
