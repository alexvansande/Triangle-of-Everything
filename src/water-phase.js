// src/water-phase.js
// The states-of-water easter egg: a phase-diagram inset that lives IN the
// map — it pans and zooms with the chart like any poster furniture. Its
// temperature axis is pinned to the chart's own energy axis (local plot
// rows sit at the exact logM of their kelvin values), so the 0°C/100°C
// gridlines line up with the Liquid Water bracket by construction.
// Pressure is the panel's own horizontal axis.
//
// Boundary curves use measured anchor points: IAPWS melting/vaporization
// values, the 611.657 Pa / 273.16 K triple point, the ice III–V–VI–VII
// junctions, and the ~62 GPa VII→X transition. The superionic boundaries
// are current best estimates and are drawn dashed.
//
// This module owns the data, texts, state, and the panel's LOCAL-coordinate
// markup; main.js projects it into the map with one translate+scale.

// ---- Real boundary data: [pressure Pa, temperature K] ----
const SUBLIMATION = [
  [6e-6, 150], [1.4e-3, 173.15], [0.0548, 193.15], [1.08, 213.15],
  [12.84, 233.15], [103.2, 253.15], [611.657, 273.16],
];
const VAPORIZATION = [
  [611.657, 273.16], [3536.8, 300], [10546, 320], [41682, 350],
  [101325, 373.124], [245770, 400], [932200, 450], [2.639e6, 500],
  [6.117e6, 550], [1.2345e7, 600], [2.2064e7, 647.096],
];
const MELT_IH = [
  [611.657, 273.16], [1e5, 273.15], [1e7, 272.4], [5e7, 269.2],
  [1e8, 266.2], [1.5e8, 262.3], [2.086e8, 251.165],
];
const MELT_III_V_VI = [
  [2.099e8, 251.165], [3.501e8, 256.164], [6.324e8, 273.31], [2.216e9, 355],
];
const MELT_VII = [
  [2.216e9, 355], [5e9, 470], [1e10, 600], [2e10, 780], [4.4e10, 1000],
];
// Superionic bounds (approximate — active research; Millot et al. 2018/19)
const SUPERIONIC_LOWER = [[4.4e10, 1000], [1e11, 1450], [3e11, 2100], [1e12, 3000]];
const SUPERIONIC_UPPER = [[4.4e10, 1000], [1e11, 2600], [3e11, 4600], [1e12, 7000]];
const P_TRIPLE = 611.657, T_TRIPLE = 273.16;
const P_CRIT = 2.2064e7, T_CRIT = 647.096;
const P_IH_III = 2.099e8, P_III_V = 3.501e8, P_V_VI = 6.324e8, P_VI_VII = 2.216e9, P_VII_X = 6.2e10;
const P_MELT_AT_TCRIT = 1.2e10; // melt curve at T_CRIT, between the 1e10/600K and 2e10/780K anchors

// ---- Local panel geometry ----
// One local unit renders at (1.823/394) logM-decades on the chart; the plot's
// vertical scale is exactly the chart's temperature reading.
export const WP_FRAME = { w: 680, h: 648 };
export const WP_PLOT = { x0: 78, x1: 652, y0: 92, y1: 486 };
const LOG_P_MIN = -6, LOG_P_MAX = 12;              // Pa
const LOG_T_MIN = Math.log10(150), LOG_T_MAX = 4;  // K
// dex of logM (= log T) per local unit — pins local Y to the chart's axis
export const WP_DEX_PER_UNIT = (LOG_T_MAX - LOG_T_MIN) / (WP_PLOT.y1 - WP_PLOT.y0);
// chart logM of the frame's local y=0 row: plot y0 renders 10000 K
export const WP_FRAME_TOP_LOGM = (-36.81 + LOG_T_MAX) + WP_PLOT.y0 * WP_DEX_PER_UNIT;

// Pressure increases LEFTWARD — the panel speaks the map's dialect:
// density grows toward the chart's apex (upper-left), vacuum lives right.
const X = (p) => WP_PLOT.x1 - (Math.log10(p) - LOG_P_MIN) / (LOG_P_MAX - LOG_P_MIN) * (WP_PLOT.x1 - WP_PLOT.x0);
const Y = (t) => WP_PLOT.y1 - (Math.log10(t) - LOG_T_MIN) / (LOG_T_MAX - LOG_T_MIN) * (WP_PLOT.y1 - WP_PLOT.y0);
const pts = (arr) => arr.map(([p, t]) => `${X(p).toFixed(1)},${Y(t).toFixed(1)}`).join(" ");
const path = (arr) => "M" + arr.map(([p, t]) => `${X(p).toFixed(1)},${Y(t).toFixed(1)}`).join(" L");

// ---- Click-to-explain content ----
const INFO = {
  intro: "Click any label. Temperature here is the chart's own axis — the 0°C and 100°C rows line up with the Liquid Water bracket. Pressure is this panel's own dimension.",
  vapor: "Too few molecules per volume to condense — water stays a gas. Below the curve, ice doesn't melt; it sublimates straight to vapor.",
  liquid: "The narrow wedge where liquid can exist, fenced by boiling, freezing, and the critical point. Every ocean, cloud, and cell fits inside it.",
  "ice-ih": "Ordinary ice — snowflakes, glaciers, comets. Its melting line leans backwards: squeeze ice Ih and it melts, which is why it floats.",
  "ice-hp": "Past ~0.2 GPa the lattice collapses into denser forms — ice III, V, then VI. The oceans of Ganymede and Titan likely rest on ice VI floors.",
  "ice-vii": "Above ~2 GPa: ice VII, denser than the water it froze from and stable at hundreds of degrees. Tiny grains have surfaced inside diamonds from Earth's mantle.",
  "ice-x": "Near 62 GPa the hydrogens give up and sit exactly midway between oxygens — no more H₂O molecules, just one continuous lattice.",
  superionic: "Oxygen locked in a lattice while hydrogen flows through it like a liquid: black, superhot ice, likely filling Uranus and Neptune. Made on Earth in 2019 — its exact borders are still being measured (drawn dashed here).",
  supercritical: "Past the critical point, liquid and vapor stop being different things — one dense fluid that dissolves like a liquid and flows like a gas.",
  triple: "611.657 Pa and 273.16 K: ice, liquid, and vapor coexist. This point was so exact it defined the kelvin until 2019.",
  critical: "22.064 MPa and 647 K — the end of the boiling line. Beyond it there is nothing left to boil.",
  atm: "Earth at sea level. Read upward along this line: ice below 0°C, liquid to 100°C, vapor above — the one slice of this diagram we inhabit.",
  comet: "A comet's surface sits in vacuum, far right — its ice never melts, it sublimates, and that gas becomes the tail.",
  ganymede: "Ganymede's deep interior: roughly a gigapascal under 900 km of ice and ocean — ice VI country, on this chart at the moon's own dot.",
  neptune: "Neptune's mantle: hundreds of gigapascals, thousands of kelvin — deep in the superionic zone.",
  "edge-p-high": "Keep squeezing: past a few terapascals ice is predicted to go metallic; further, electron shells crush into degenerate matter — white dwarfs — then protons swallow their electrons and it's neutron matter down to the black-hole line. This edge exits onto the chart's stellar graveyard.",
  "edge-t-high": "Above ~10⁴ K the molecules shake apart, then ionize into plasma. Keep heating and you're climbing the chart's own energy axis — free atoms, bare nuclei, quark soup. Water stops being water; the big chart takes over.",
  "edge-p-low": "Thinner and thinner vapor until 'water' means a single molecule alone in space — the H₂O dot on the main chart. Most water in the universe lives out here.",
  "edge-t-low": "Downward, the story just quiets: vapor frozen onto dust becomes amorphous ice (the universe's most common water), and below 72 K ice Ih orders into ice XI. Then nothing more ever happens.",
};

// ---- State ----
let _open = false, _selected = "intro", _onToggle = null;

export function openWaterPhasePanel() { _open = true; _selected = "intro"; if (_onToggle) _onToggle(true); }
export function closeWaterPhasePanel() { if (!_open) return; _open = false; if (_onToggle) _onToggle(false); }
export function isWaterPhaseOpen() { return _open; }
export function selectWaterPhaseKey(key) { if (INFO[key]) _selected = key; }
export function onWaterPhaseToggle(fn) { _onToggle = fn; }

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && _open) { e.stopPropagation(); closeWaterPhasePanel(); }
}, true);

function wrap(text, width) {
  const words = text.split(" "), lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > width) { lines.push(line.trim()); line = w; }
    else line += " " + w;
  }
  if (line.trim()) lines.push(line.trim());
  return lines.slice(0, 4);
}

/** Full panel markup in LOCAL coordinates (WP_FRAME box). main.js places it
 *  in the map with a single translate+scale, so it zooms with the chart. */
export function waterPhaseMarkup() {
  const yC0 = Y(273.15), yC100 = Y(373.15);
  const xAtm = X(101325);
  const vaporFill = `M${WP_PLOT.x0},${WP_PLOT.y1} L` + pts(SUBLIMATION) + " L" + pts(VAPORIZATION) +
    ` L${X(P_CRIT)},${WP_PLOT.y0} L${WP_PLOT.x0},${WP_PLOT.y0} Z`;
  const liquidFill = "M" + pts(VAPORIZATION) + ` L${X(P_MELT_AT_TCRIT)},${Y(T_CRIT)} L` +
    pts([...MELT_VII].reverse().filter(([p]) => p <= P_MELT_AT_TCRIT)) +
    " L" + pts([...MELT_III_V_VI].reverse()) + " L" + pts([...MELT_IH].reverse()) + " Z";
  const ihFill = "M" + pts(SUBLIMATION) + " L" + pts(MELT_IH) + ` L${X(P_IH_III)},${WP_PLOT.y1} L${WP_PLOT.x0},${WP_PLOT.y1} Z`;
  const hpFill = `M${X(P_IH_III)},${Y(251.165)} L` + pts(MELT_III_V_VI) + ` L${X(P_VI_VII)},${WP_PLOT.y1} L${X(P_IH_III)},${WP_PLOT.y1} Z`;
  const viiTop = MELT_VII.concat(SUPERIONIC_LOWER.filter(([p]) => p > 4.4e10 && p <= P_VII_X), [[P_VII_X, 1150]]);
  const viiFill = `M${X(P_VI_VII)},${Y(355)} L` + pts(viiTop.filter(([p]) => p >= P_VI_VII && p <= P_VII_X)) +
    ` L${X(P_VII_X)},${WP_PLOT.y1} L${X(P_VI_VII)},${WP_PLOT.y1} Z`;
  const xTop = [[P_VII_X, 1150]].concat(SUPERIONIC_LOWER.filter(([p]) => p > P_VII_X));
  const xFill = "M" + pts(xTop) + ` L${X(1e12)},${WP_PLOT.y1} L${X(P_VII_X)},${WP_PLOT.y1} Z`;
  const supFill = "M" + pts(SUPERIONIC_LOWER) + " L" + pts([...SUPERIONIC_UPPER].reverse()) + " Z";
  const scFill = `M${X(P_CRIT)},${Y(T_CRIT)} L${X(P_MELT_AT_TCRIT)},${Y(T_CRIT)} L` +
    pts(MELT_VII.filter(([p]) => p > P_MELT_AT_TCRIT)) + " L" + pts(SUPERIONIC_UPPER) +
    ` L${X(1e12)},${WP_PLOT.y0} L${X(P_CRIT)},${WP_PLOT.y0} Z`;

  const tick = (p, label, hot) =>
    `<text x="${X(p)}" y="${WP_PLOT.y1 + 20}" text-anchor="middle" class="wp-tick${hot ? " wp-hot" : ""}">${label}</text>`;
  const ytick = (t, label, hot) =>
    `<text x="${WP_PLOT.x0 - 8}" y="${Y(t) + 4}" text-anchor="end" class="wp-tick${hot ? " wp-hot" : ""}">${label}</text>`;
  const lbl = (key, x, y, text, cls, extra) =>
    `<text x="${x}" y="${y}" class="wp-label wp-i ${cls || ''}" data-key="${key}" ${extra || ""}>${text}</text>`;
  const DOT_COLORS = { triple: ["#ffd764", "#c9b06a"], critical: ["#ffd764", "#c9b06a"],
    comet: ["#8fb8d8", "#8fb8d8"], ganymede: ["#8fb8d8", "#8fb8d8"], neptune: ["#d490cc", "#d490cc"] };
  const dot = (key, p, t, text, anchor, dy) => {
    const [c1, c2] = DOT_COLORS[key];
    return `<g class="wp-dot wp-i" data-key="${key}">` +
      `<circle cx="${X(p)}" cy="${Y(t)}" r="4" fill="${c1}"/>` +
      `<text class="wp-dt" x="${X(p)}" y="${Y(t) + (dy || -10)}" fill="${c2}" text-anchor="${anchor || "middle"}">${text}</text></g>`;
  };

  const caption = wrap(INFO[_selected] || INFO.intro, 92).map((line, i) =>
    `<tspan x="${WP_PLOT.x0 - 44}" dy="${i === 0 ? 0 : 17}">${line}</tspan>`).join("");

  return `
    <rect class="wp-frame" x="0" y="0" width="${WP_FRAME.w}" height="${WP_FRAME.h}" rx="12"/>
    <text x="34" y="40" class="wp-title">THE STATES OF WATER</text>
    <text x="34" y="60" class="wp-sub">temperature shared with the chart · pressure is this panel's own axis</text>
    <g data-close="1" class="wp-close"><rect x="${WP_FRAME.w - 46}" y="18" width="30" height="30" rx="6" fill="transparent"/><text class="wp-close-x" x="${WP_FRAME.w - 31}" y="40" text-anchor="middle">×</text></g>
    <g class="wp-fills">
      <path d="${vaporFill}" fill="rgba(125,130,180,0.06)"/>
      <path d="${scFill}" fill="rgba(160,120,220,0.10)"/>
      <path d="${liquidFill}" fill="rgba(29,158,117,0.16)"/>
      <path d="${ihFill}" fill="rgba(60,110,190,0.16)"/>
      <path d="${hpFill}" fill="rgba(60,120,210,0.26)"/>
      <path d="${viiFill}" fill="rgba(70,130,230,0.34)"/>
      <path d="${xFill}" fill="rgba(90,140,255,0.42)"/>
      <path d="${supFill}" fill="rgba(212,110,200,0.28)"/>
    </g>
    <g stroke="rgba(159,201,232,0.25)" stroke-width="0.7">
      <line x1="${WP_PLOT.x0}" y1="${yC0}" x2="${WP_PLOT.x1}" y2="${yC0}"/>
      <line x1="${WP_PLOT.x0}" y1="${yC100}" x2="${WP_PLOT.x1}" y2="${yC100}"/>
    </g>
    <g stroke="rgba(93,202,165,0.55)" stroke-width="1" stroke-dasharray="2 5">
      <line x1="${WP_PLOT.x1}" y1="${yC0}" x2="${WP_FRAME.w}" y2="${yC0}"/>
      <line x1="${WP_PLOT.x1}" y1="${yC100}" x2="${WP_FRAME.w}" y2="${yC100}"/>
    </g>
    <line class="wp-atm wp-i" data-key="atm" x1="${xAtm}" y1="${WP_PLOT.y0}" x2="${xAtm}" y2="${WP_PLOT.y1}"/>
    <g fill="none" stroke="#bcd8ee" stroke-width="1.5">
      <path d="${path(SUBLIMATION)}"/>
      <path d="${path(VAPORIZATION)}"/>
      <path d="${path(MELT_IH)}"/>
      <path d="${path(MELT_III_V_VI)}"/>
      <path d="${path(MELT_VII)}"/>
      <path d="M${X(P_IH_III)},${Y(251.165)} L${X(P_IH_III)},${WP_PLOT.y1}" stroke="rgba(126,166,196,0.55)" stroke-width="0.8" stroke-dasharray="4 4"/>
      <path d="M${X(P_III_V)},${Y(256.164)} L${X(P_III_V)},${WP_PLOT.y1}" stroke="rgba(126,166,196,0.55)" stroke-width="0.8" stroke-dasharray="4 4"/>
      <path d="M${X(P_V_VI)},${Y(273.31)} L${X(P_V_VI)},${WP_PLOT.y1}" stroke="rgba(126,166,196,0.55)" stroke-width="0.8" stroke-dasharray="4 4"/>
      <path d="M${X(P_VI_VII)},${Y(355)} L${X(P_VI_VII)},${WP_PLOT.y1}" stroke="rgba(126,166,196,0.55)" stroke-width="0.8" stroke-dasharray="4 4"/>
      <path d="M${X(P_VII_X)},${Y(880)} L${X(P_VII_X)},${WP_PLOT.y1}" stroke="rgba(126,166,196,0.55)" stroke-width="0.8" stroke-dasharray="4 4"/>
      <path d="${path(SUPERIONIC_LOWER)}" stroke="rgba(212,144,204,0.8)" stroke-width="1.2" stroke-dasharray="6 4"/>
      <path d="${path(SUPERIONIC_UPPER)}" stroke="rgba(212,144,204,0.8)" stroke-width="1.2" stroke-dasharray="6 4"/>
    </g>
    <g>
      <line stroke="rgba(90,94,134,0.8)" stroke-width="1" x1="${WP_PLOT.x0}" y1="${WP_PLOT.y0}" x2="${WP_PLOT.x0}" y2="${WP_PLOT.y1}"/>
      <line stroke="rgba(90,94,134,0.8)" stroke-width="1" x1="${WP_PLOT.x0}" y1="${WP_PLOT.y1}" x2="${WP_PLOT.x1}" y2="${WP_PLOT.y1}"/>
      ${tick(1, "1 Pa")}${tick(1e3, "1 kPa")}${tick(101325, "1 atm", true)}${tick(1e9, "1 GPa")}${tick(1e12, "1 TPa")}
      ${ytick(150, "150 K")}${ytick(273.15, "0°C", true)}${ytick(373.15, "100°C", true)}${ytick(1000, "1000 K")}${ytick(5000, "5000 K")}
      <text x="${(WP_PLOT.x0 + WP_PLOT.x1) / 2}" y="${WP_PLOT.y1 + 44}" text-anchor="middle" class="wp-axis-title">← PRESSURE</text>
      <text x="${WP_PLOT.x0 - 52}" y="${(WP_PLOT.y0 + WP_PLOT.y1) / 2}" text-anchor="middle" class="wp-axis-title" transform="rotate(-90 ${WP_PLOT.x0 - 52} ${(WP_PLOT.y0 + WP_PLOT.y1) / 2})">TEMPERATURE</text>
    </g>
    ${lbl("edge-t-high", (WP_PLOT.x0 + WP_PLOT.x1) / 2, WP_PLOT.y0 - 8, "↑ plasma, and the rest of the chart", "wp-edge", 'text-anchor="middle"')}
    ${lbl("edge-p-high", WP_PLOT.x0 + 6, Y(480), "← degenerate matter", "wp-edge")}
    ${lbl("edge-p-low", WP_PLOT.x1 - 6, Y(480), "one lone molecule →", "wp-edge", 'text-anchor="end"')}
    ${lbl("edge-t-low", X(1e-2), WP_PLOT.y1 - 8, "↓ amorphous ice, then silence", "wp-edge", 'text-anchor="end"')}
    ${lbl("vapor", X(3), Y(420), "vapor", "wp-c-dim", 'text-anchor="middle"')}
    ${lbl("supercritical", X(3e8), Y(1600), "supercritical fluid", "wp-c-violet", 'text-anchor="middle"')}
    ${lbl("liquid", X(2e6), Y(320), "liquid", "wp-c-teal", 'text-anchor="middle"')}
    ${lbl("ice-ih", X(30), Y(200), "ice Ih", "wp-c-blue", 'text-anchor="middle"')}
    ${lbl("ice-hp", X(8.2e8), Y(175), "III·V·VI", "wp-c-blue", `transform="rotate(-90 ${X(8.2e8)} ${Y(175)})"`)}
    ${lbl("ice-vii", X(8e9), Y(255), "ice VII", "wp-c-blue", 'text-anchor="middle"')}
    ${lbl("ice-x", X(2.4e11), Y(320), "ice X", "wp-c-blue", 'text-anchor="middle"')}
    ${lbl("superionic", X(9e11), Y(3400), "superionic*", "wp-c-pink")}
    ${dot("triple", P_TRIPLE, T_TRIPLE, "triple point", "start", 18)}
    ${dot("critical", P_CRIT, T_CRIT, "critical point", "middle", -12)}
    ${dot("comet", 1e-4, 200, "comet ice", "middle", -10)}
    <g class="wp-dot wp-i" data-key="ganymede">
      <circle cx="${X(1e9)}" cy="${Y(230)}" r="4" fill="#8fb8d8"/>
      <text class="wp-dt" x="${X(1e9) + 10}" y="${Y(230) + 20}" fill="#8fb8d8" text-anchor="start">Ganymede core</text></g>
    ${dot("neptune", 2e11, 3800, "Neptune", "middle", -10)}
    <line class="wp-caption-rule" x1="${WP_PLOT.x0 - 44}" y1="${WP_PLOT.y1 + 58}" x2="${WP_FRAME.w - 28}" y2="${WP_PLOT.y1 + 58}"/>
    <text class="wp-caption" x="${WP_PLOT.x0 - 44}" y="${WP_PLOT.y1 + 80}">${caption}</text>`;
}
