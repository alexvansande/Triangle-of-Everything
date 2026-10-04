// src/classic.js
// Hidden "classic" mode: a zoomable redrawing of Fig. 2 of Lineweaver &
// Patel, "All objects and some questions" (Am. J. Phys. 91, 819, 2023),
// with every object from objects.json added as an extra dot. Zooming into
// the small black rectangle fades in the annotations of their Fig. 3
// (stellar collapse). Reached with the L key or /classic/ (old links:
// #classic); Esc or L leaves.
//
// Everything is authored in the published figure's own pixel space
// (1602 × 1785), so at first glance the page lines up with the original.
// Marks that belong to the data (regions, lines, dots, labels) follow the
// zoom; text and stroke widths keep their size. Axes stay put and re-tick.

import * as d3 from "d3";
import "./classic.css";
import { SCHWARZSCHILD_C, COMPTON_C, PLANCK_LOG_R, PLANCK_LOG_M } from "./data.js";
import objectsData from "./objects.json";
import { enableTrackpadPinch } from "./trackpad-pinch.js";
import { loadDust, dustArrays } from "./dust.js";

// ---------- figure geometry ----------
const FIG_W = 1602, FIG_H = 1785;
const FRAME = { x0: 298.5, x1: 1443.5, y0: 142.5, y1: 1660.5 };
const R_DOM = [-40, 55];   // log radius [cm] across the frame
const M_DOM = [-54, 68];   // log mass [g] up the frame
const OUTER_AXIS_X = 161.5; // the log(M☉) axis line, left of the frame
const HEADER_H = 300;       // room above the figure for the paper's title block

// figure px → data, for authoring anchors straight off the published raster
const fr = (fx) => R_DOM[0] + (fx - FRAME.x0) * (R_DOM[1] - R_DOM[0]) / (FRAME.x1 - FRAME.x0);
const fm = (fy) => M_DOM[1] - (fy - FRAME.y0) * (M_DOM[1] - M_DOM[0]) / (FRAME.y1 - FRAME.y0);

// ---------- physics (log10, cgs) ----------
const BH_C = -SCHWARZSCHILD_C;      // black holes:   m − r = 27.83
const CP_C = COMPTON_C;             // Compton limit: m + r = −37.45
const R_I = (CP_C - BH_C) / 2;      // where the two meet
const M_I = R_I + BH_C;
// The site's 2G Planck convention: l_P and m_P sit exactly where the two lines meet
const L_P = PLANCK_LOG_R, M_P = PLANCK_LOG_M;
const LOG_MPC = 24.489, LOG_MSUN = 33.2986, LOG_GEV = -23.749;
// Isodensity lines are m − 3r = const ("c3"); values read off the figure.
const C3 = {
  planck: 92.9, gut: 74.75, ew: 26.75, nuclear: 14.0, atomic: 0.0, recomb: -20.5,
  now: null,                       // through our Observable Universe (set below)
  matterStart: -21.5,              // pink → blue (matter-radiation equality)
  bbn: [-0.5, 5.3], qgp: [13.7, 22.6], inflation: [75.0, 82.4],
};
const ISOCHRONS = ["planck", "gut", "ew", "nuclear", "atomic", "recomb"];
// Objects come from our data, the paper's own named ones included
const byName = (n) => objectsData.find(o => o.name === n);
const UNIVERSE = byName("Observable Universe");
C3.now = UNIVERSE.logM - 3 * UNIVERSE.logR;

const COL = {
  forbidden: "#b9908e", radiation: "#ffc0c1", light: "#ffe6e5", matter: "#b8b1ff",
  lambda: "#d8d8d8", inflation: "#b2b2b2", red: "#e8141c",
};

// ---------- half-plane polygon clipping in data space ----------
// A half-plane [a, b, c] keeps points with a·r + b·m + c ≥ 0.
const HP = {
  belowBH: [1, -1, BH_C], aboveBH: [-1, 1, -BH_C],
  aboveCP: [1, 1, -CP_C], belowCP: [-1, -1, CP_C],
  c3min: (v) => [-3, 1, -v], c3max: (v) => [3, -1, v],
  rmax: (v) => [-1, 0, v],
};
function clipPoly(poly, [a, b, c]) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    const fp = a * p[0] + b * p[1] + c, fq = a * q[0] + b * q[1] + c;
    if (fp >= 0) out.push(p);
    if ((fp >= 0) !== (fq >= 0)) {
      const t = fp / (fp - fq);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  }
  return out;
}

const REGIONS = [
  { fill: COL.lambda,    hp: [HP.belowBH, HP.aboveCP, HP.c3max(C3.now)] },
  { fill: COL.matter,    hp: [HP.belowBH, HP.aboveCP, HP.c3min(C3.now), HP.c3max(C3.matterStart)] },
  { fill: COL.radiation, hp: [HP.belowBH, HP.aboveCP, HP.c3min(C3.matterStart)] },
  { fill: COL.light,     hp: [HP.belowBH, HP.aboveCP, HP.c3min(C3.bbn[0]), HP.c3max(C3.bbn[1])] },
  { fill: COL.light,     hp: [HP.belowBH, HP.aboveCP, HP.c3min(C3.qgp[0]), HP.c3max(C3.qgp[1])] },
  { fill: COL.inflation, hp: [HP.belowBH, HP.aboveCP, HP.c3min(C3.inflation[0]), HP.c3max(C3.inflation[1])] },
  { fill: "#000",        hp: [HP.rmax(R_I), HP.aboveBH, HP.belowCP] },   // QG wedge
];

// Points on lines (data space)
const onC3 = (c3, m) => [(m - c3) / 3, m];
const c3MeetsCompton = (c3) => { const r = (CP_C - c3) / 4; return [r, CP_C - r]; };

// =============================================================
// Annotations, authored in figure px at the published framing
// =============================================================
// at: [fx, fy] where the text sits at the published framing. obj: the point
// it names (defaults to lead[0], else at) — the text and its leader line
// ride rigidly with that point, so zooming never stretches a leader.
// lead: [objEnd, textEnd] leader line. size: font px; rot: degrees;
// maxK: fade out past this zoom; fig3: "out" fades as Fig. 3 fades in.
const ROT_BH = -Math.atan(12.443 / 12.053) * 180 / Math.PI; // −45.9°: m ∝ r
const ROT_ISO = -Math.atan(3 * 12.443 / 12.053) * 180 / Math.PI; // −72.1°: m ∝ r³

const LABELS = [
  // big region words
  { t: "sub − Planckian unknown", at: [367, 586], size: 69.3, rot: -90, anchor: "middle", weight: 370 },
  { t: "forbidden by", at: [652, 457], size: 82.3, rot: -43.9, anchor: "middle", weight: 370 },
  { t: "gravity", at: [697, 518], size: 87.5, rot: -43.9, anchor: "middle", weight: 370 },
  { t: "black holes", at: [511, 907], size: 52, rot: ROT_BH, anchor: "middle", weight: 370 },
  { t: "Compton limit", at: [599, 1331], size: 55.4, rot: 43.9, anchor: "middle", weight: 370 },
  { t: "quantum", at: [594, 1450], size: 86.9, rot: 43.9, anchor: "middle", weight: 370 },
  { t: "uncertainty", at: [539, 1499], size: 86.9, rot: 43.9, anchor: "middle", weight: 370 },
  { t: "QG", at: [338, 1064], size: 36.1, anchor: "middle", fill: "#fff" },
  { t: "instanton", at: [390, 1118], size: 28.6, anchor: "middle" },
  { t: "QGP", at: [725, 978], size: 36, rot: -70.1, anchor: "middle" },
  { t: "BBN", at: [784, 985], size: 26.4, rot: ROT_ISO, anchor: "middle" },
  // isochrons (time since the big bang)
  { t: "Planck 10^{−43} s", at: [643, 248], size: 34, rot: ROT_ISO, anchor: "middle" },
  { t: "GUT 10^{−32} s", at: [720, 233], size: 37.4, rot: ROT_ISO, anchor: "middle" },
  { t: "EW 10^{−11} s", at: [911, 231], size: 34, rot: ROT_ISO, anchor: "middle" },
  { t: "nuclear 10^{−6} s", at: [959, 250], size: 32.3, rot: ROT_ISO, anchor: "middle" },
  { t: "atomic 10^{3} s", at: [1023, 227], size: 30.6, rot: ROT_ISO, anchor: "middle" },
  { t: "recomb. 10^{13} s", at: [1098, 245], size: 32.3, rot: ROT_ISO, anchor: "middle" },
  { t: "now", at: [1154, 182], size: 35.7, rot: -70.1, anchor: "middle" },
  // black holes
  { t: "SMBH", at: [976, 372], size: 34, rot: -52, anchor: "middle" },
  { t: "{", at: [960, 414], size: 96, rot: 90 + ROT_BH, sy: 1.5, anchor: "middle", upright: true, weight: 500, maxK: 2 },
  { t: "stellar mass BH", at: [851, 502], size: 34, rot: ROT_BH, anchor: "middle", lead: [[858, 504], [870, 518]], obj: [843, 509] },
  { t: "{", at: [867, 540], size: 54, rot: 90 + ROT_BH, anchor: "middle", upright: true, maxK: 2 },
  { t: "3K BH", at: [721, 639], size: 36.8, anchor: "middle", lead: [[752, 669], [735, 652]], of: "3K BH" },
  { t: "smallest", at: [564, 694], size: 33, anchor: "middle", obj: [627, 800], of: "Smallest Primordial BH" },
  { t: "observable", at: [566, 725], size: 33, anchor: "middle", obj: [627, 800], of: "Smallest Primordial BH" },
  { t: "PBH", at: [565, 756], size: 36, anchor: "middle", lead: [[627, 800], [600, 760]], of: "Smallest Primordial BH" },
  { t: "Hubble radius", at: [1148, 300], size: 32.3, obj: [1124.6, 286.7], of: "Observable Universe" },
  // large scale and stars (right-hand list)
  { t: "voids", at: [1178, 345], size: 34, lead: [[1104, 356], [1172, 340]] },
  { t: "superclusters", at: [1173, 380], size: 35.7, lead: [[1100, 370], [1172, 371]] },
  { t: "galaxy clusters", at: [1170, 411], size: 35.7, lead: [[1080, 393], [1172, 400]] },
  { t: "Milky Way", at: [1113, 448], size: 35.7, lead: [[1062, 420], [1105, 437]], of: "Milky Way" },
  { t: "galaxies", at: [1088, 485], size: 34, lead: [[1048, 475], [1086, 472]] },
  { t: "globular clusters", at: [1079, 518], size: 34, lead: [[1015, 512], [1075, 507]] },
  { t: "main sequence stars", at: [1066, 555], size: 34, lead: [[926, 554], [1063, 546]], fig3: "out" },
  { t: "red giants", at: [1057, 592], size: 32.3, lead: [[945, 573], [1052, 582]], fig3: "out" },
  { t: "Sun", at: [943, 600], size: 32.3, fig3: "out", lead: [[911.1, 574.3], [940, 588]], of: "Sun" },
  { t: "BD", at: [939, 640], size: 38, fig3: "out", lead: [[903, 595], [935, 620]] },
  { t: "NS", at: [794, 655], size: 30.6, fig3: "out", lead: [[853, 570], [810, 625]] },
  { t: "WD", at: [835, 642], size: 36.1, fig3: "out", lead: [[880, 588], [858, 625]] },
  { t: "Earth", at: [903, 678], size: 32.3, lead: [[886.6, 643], [912, 655]], of: "Earth" },
  { t: "planets", at: [1037, 674], size: 32.3, lead: [[893, 641], [1033, 662]] },
  { t: "moons and dwarf planets", at: [1020, 714], size: 34, lead: [[878, 703], [1015, 703]] },
  // everyday to microscopic
  { t: "whale", at: [831, 897], size: 30, obj: [813, 885], of: "Blue Whale" },
  { t: "human", at: [812, 948], size: 31.5, obj: [803, 930], of: "Human" },
  { t: "flea", at: [786, 1043], size: 28.5, obj: [769, 1031], of: "Flea" },
  { t: "bacterium", at: [740, 1154], size: 31.5, obj: [728, 1141], of: "Bacterium" },
  { t: "COVID", at: [728, 1184], size: 31, obj: [717, 1175], of: "COVID Virus" },
  { t: "virus", at: [730, 1205], size: 31.2, obj: [717, 1175], of: "COVID Virus" },
  { t: "atoms", at: [690, 1275], size: 33, obj: [680, 1270] },
  // particles on the Compton line
  { t: "t", at: [550, 1199], size: 32, lead: [[586, 1253], [560, 1210]], of: "Top" },
  { t: "H^{0}", at: [568, 1196], size: 36.8, lead: [[588, 1253], [577, 1210]], of: "Higgs" },
  { t: "W^{±}", at: [593, 1230], size: 32, lead: [[591, 1258], [597, 1238]], of: "W" },
  { t: "n", at: [618, 1258], size: 35.2, lead: [[624, 1290], [625, 1262]], of: "Neutron" },
  { t: "p", at: [642, 1280], size: 33.6, lead: [[628, 1295], [640, 1292]], of: "Proton" },
  { t: "e", at: [693, 1335], size: 36.8, lead: [[678, 1347], [690, 1340]], of: "Electron" },
  { t: "ν", at: [747, 1389], size: 27.2, lead: [[737, 1405], [748, 1392]], of: "Neutrino (e)" },
];

// Objects the paper draws as bigger dots (fixed px radius), and the one it
// draws as its own glyph (the Planck-scale singularity → the QG disc).
const DOT_STYLE = {
  "Observable Universe": { r: 14 }, "Blue Whale": { r: 7 }, "Human": { r: 7 }, "Flea": { r: 7 },
  "Bacterium": { r: 7 }, "COVID Virus": { r: 7 }, "3K BH": { r: 5 }, "Smallest Primordial BH": { r: 4 },
  "Sgr A*": { r: 5.5 }, "Ton 618": { r: 5.5 }, "Sun": { r: 4.8, fill: "#f2f24a" },
};
const PAPER_HAS = new Set(["Singularity"]);
// Styled like the paper's particles: white disc with a black ring.
const RINGED = new Set(["Top", "Higgs", "W", "Z", "Proton", "Neutron", "Electron",
  "Neutrino (e)", "Neutrino (μ)", "Neutrino (τ)"]);

// Group blobs, figure px: [cx, cy, rx, ry, rotDeg, fill]
const BLOBS = [
  [1104, 364, 21, 3.5, -76, "#a8a8a8"],    // voids
  [1098, 366, 19, 4.5, -76, "#ffffff"],    // superclusters
  [1072, 396, 17, 6, -63, "#fff6ea"],      // galaxy clusters
  [1049, 458, 48, 8, -66, "#e4fbfb"],      // galaxies
  [1009, 515, 15, 6, -72, "#c9f0cc"],      // globular clusters
  [912, 570, 26, 5, -58, "#a9c4f4"],       // main sequence
  [935, 571, 16, 6.5, 0, "#ef5a1e"],       // red giants
  [893, 624, 27, 4.5, -72, "#d6c3ee"],     // planets
  [854, 755, 74, 5, -72, "#a2efa5"],       // moons and dwarf planets
  [900, 594, 6, 5, 0, "#f4dc9c"],          // brown dwarfs
  [680, 1270, 27, 5, -72, "#cdb8de"],      // atoms
];

// Fixed text outside the frame (axis titles), figure px
const TITLES = [
  { t: "log ~{(}physical radius~{)} ~{[}cm~{]}", at: [872, 1769], size: 41.4, anchor: "middle" },
  { t: "log ~{(}radius~{)} ~{[}Mpc~{]}", at: [868, 38], size: 45.5, anchor: "middle" },
  { t: "log ~{(}mass~{)} ~{[}g~{]}", at: [227, 900], size: 43.7, rot: -90, anchor: "middle" },
  { t: "log ~{(}M_{⊙}~{)}", at: [41, 897], size: 46, rot: -90, anchor: "middle" },
  { t: "log ~{(}mass~{)} ~{[}GeV~{]}", at: [1552, 902], size: 43.7, rot: -90, anchor: "middle" },
];

// Fig. 3 window, data space; the paper draws its rectangle a little inside it
const FIG3 = { r: [5.5, 11.5], m: [31.0, 34.42] };
const FIG3_RECT = { r: [fr(850.5), fr(918)], m: [fm(602), fm(565)] };

// Red arrows on the right axis: [log GeV, label, arrow-tail dy, text-baseline dy]
// (offsets from the arrow tip, as drawn in the paper)
const ENERGY_MARKS = [
  [19.09, "E_{P}", 26, 46],      // Planck energy
  [15.1, "E_{GUT}", 13, 37],     // grand unification
  [2.39, "E_{EW}", 0, 14],       // electroweak, 246 GeV
  [-12.63, "CMB", 3, 18],        // kT of the CMB today
];

// =============================================================
// Fig. 3 — stellar collapse, read off the published panel (data space).
// That panel stretches mass 2.5× relative to radius; here it lives in the
// same uniform zoom as everything else, so text angles are converted.
// =============================================================
const FIG3_LIMITS = [
  { m: 33.776, label: "Volkoff − Oppenheimer − Tolman limit", r: 7.33, dm: 0.03 },  // 3 M☉
  { m: 33.443, label: "Chandrasekhar limit", r: 6.62, dm: 0.07 },                 // 1.39 M☉
];
const FIG3_ARROWS = [            // tail → head
  [[6.20, 33.785], [6.01, 33.785]],
  [[8.30, 33.443], [5.94, 33.443]],
  [[10.50, 33.374], [8.88, 33.30]],
  [[10.20, 33.00], [9.21, 32.967]],
];
const FIG3_DASHED = [[[8.57, 33.33], [9.25, 32.90]]];          // white dwarfs' r ∝ m^(−1/3)
const FIG3_LEADERS = [[[6.13, 33.82], [6.48, 33.97]]];          // P_g > P_n → NS
const FIG3_TEXT = [
  { t: "P_{g} > P_{n}", at: [6.49, 33.88], size: 36 },
  { t: "P_{g} > P_{e}", at: [6.3, 33.05], size: 36 },
  { t: "0 ← P_{rad}", at: [9.29, 33.37], size: 36 },
  { t: "NS", at: [5.84, 33.58], size: 28 },
  { t: "white dwarfs", at: [8.80, 32.89], size: 34, rot: 30, anchor: "middle" },
  { t: "main sequence stars", at: [10.67, 32.89], size: 34, rot: -50, anchor: "middle" },
  { t: "BD", at: [10.0, 31.63], size: 30 },
  { t: "nuclear density", at: [5.92, 32.44], size: 36, rot: ROT_ISO, anchor: "middle" },
  { t: "atomic density", at: [10.8, 31.75], size: 36, rot: ROT_ISO, anchor: "middle" },
];
// Blobs: long axis between two points, half-width w (dex of mass)
const FIG3_BLOBS = [
  { pts: [[8.30, 33.47], [9.33, 32.78]], w: 0.10, fill: "#b2c3ee" },   // white dwarfs
  { pts: [[9.74, 32.11], [11.49, 34.47]], w: 0.17, fill: "#b2c3ee" },  // main sequence
  { pts: [[9.64, 32.07], [10.36, 31.38]], w: 0.09, fill: "#eee39a" },  // brown dwarfs
  { pts: [[9.60, 30.85], [10.15, 31.50]], w: 0.16, fill: "#d3a8d2" },  // planets
];

// =============================================================
// State
// =============================================================
let root = null, svg = null, zoom = null;
let xs = null, ys = null;            // current data → figure-px scales
const x0 = d3.scaleLinear(R_DOM, [FRAME.x0, FRAME.x1]);
const y0 = d3.scaleLinear(M_DOM, [FRAME.y1, FRAME.y0]);
let layers = {};

const OBJECTS = objectsData.filter(o => !PAPER_HAS.has(o.name));

// Labels naming one of our objects ride with that object's dot. A leader
// re-aims at it; a label without one shifts by the same amount the dot
// differs from the paper's, keeping the published spacing.
for (const d of LABELS) {
  if (!d.of) continue;
  const o = byName(d.of), p = [x0(o.logR), y0(o.logM)];
  if (d.lead) d.lead = [p, d.lead[1]];
  else {
    const old = d.obj || d.at;
    d.at = [d.at[0] + p[0] - old[0], d.at[1] + p[1] - old[1]];
  }
  d.obj = p;
}

// Names for our extra dots appear once you zoom in (never at the published
// framing). The paper already names these ones its own way.
const PAPER_NAMED = new Set(["Sun", "Earth", "Milky Way", "Globular Cluster", "Galaxy Cluster",
  "Red Giant", "White Dwarf", "Neutron Star", ...RINGED]);
const NAMED = OBJECTS.filter(o => !PAPER_NAMED.has(o.name))
  .sort((a, b) => (a.z || 3) - (b.z || 3));
const NAME_MIN_K = [0, 2.5, 4, 6, 9, 14];   // by object z (1 = most notable)
const NAME_SIZE = 26;
let placedNames = [];
let currentK = 1;

// ---------- text with markup ----------
// ^{..} superscript, _{..} subscript, ~{..} upright (the paper sets
// brackets and parentheses upright inside italic labels).
function richText(sel, str, size) {
  sel.text(null);
  const re = /([\^_~])\{([^}]*)\}/g;
  let last = 0, m, shift = 0;
  const add = (txt, dy, small, upright) => {
    if (!txt) return;
    const ts = sel.append("tspan").text(txt);
    if (small) ts.attr("font-size", size * 0.7);
    if (upright) ts.attr("class", "cl-up");
    if (dy) ts.attr("dy", dy);
  };
  while ((m = re.exec(str))) {
    if (m.index > last) { add(str.slice(last, m.index), shift ? -shift : null); shift = 0; }
    if (m[1] === "~") add(m[2], shift ? -shift : null, false, true), shift = 0;
    else {
      const up = m[1] === "^" ? -0.42 * size : 0.22 * size;
      add(m[2], up - shift, true);
      shift = up;
    }
    last = re.lastIndex;
  }
  if (last < str.length) add(str.slice(last), shift ? -shift : null);
}

// Text from a spec { t, at, size, rot, sx, sy, anchor, fill, upright }
const textTransform = (d, x, y) => `translate(${x},${y})`
  + (d.rot ? ` rotate(${d.rot})` : "") + (d.sx || d.sy ? ` scale(${d.sx || 1},${d.sy || 1})` : "");
function makeTexts(g, data) {
  return g.selectAll("text").data(data).join("text")
    .attr("data-key", d => d.t)
    .attr("class", d => d.upright ? "cl-num" : null)
    .attr("text-anchor", d => d.anchor || "start")
    .attr("font-size", d => d.size)
    .attr("fill", d => d.fill || "#000")
    .style("font-weight", d => d.weight || null)
    .each(function (d) { richText(d3.select(this), d.t, d.size); });
}

// =============================================================
// Build
// =============================================================
function build() {
  root = document.createElement("div");
  root.id = "classic";
  root.hidden = true;
  root.setAttribute("role", "img");
  root.setAttribute("aria-label",
    "Lineweaver & Patel's plot of the masses and sizes of all objects. Scroll or pinch to zoom; press Escape to return.");
  document.body.appendChild(root);

  svg = d3.select(root).append("svg")
    .attr("viewBox", `0 ${-HEADER_H} ${FIG_W} ${FIG_H + HEADER_H}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const defs = svg.append("defs");
  defs.append("clipPath").attr("id", "cl-frame").append("rect")
    .attr("x", FRAME.x0).attr("y", FRAME.y0)
    .attr("width", FRAME.x1 - FRAME.x0).attr("height", FRAME.y1 - FRAME.y0);
  const arrow = (id, fill) => defs.append("marker").attr("id", id)
    .attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5)
    .attr("markerWidth", 9).attr("markerHeight", 9).attr("orient", "auto-start-reverse")
    .append("path").attr("d", "M0,0 L10,5 L0,10 L3,5 Z").attr("fill", fill);
  arrow("cl-arrow-red", COL.red);
  arrow("cl-arrow-blk", "#000");
  defs.append("marker").attr("id", "cl-arrow-blue")
    .attr("viewBox", "0 0 10 10").attr("refX", 6).attr("refY", 5)
    .attr("markerWidth", 4.5).attr("markerHeight", 4.5).attr("orient", "auto")
    .append("path").attr("d", "M0,0 L10,5 L0,10 L2.5,5 Z").attr("fill", "#3a55c4");

  const plot = svg.append("g").attr("clip-path", "url(#cl-frame)");
  layers.regions = plot.append("g");
  layers.lines = plot.append("g");
  layers.blobs = plot.append("g");
  layers.fig3 = plot.append("g").attr("class", "cl-fig3").style("opacity", 0);
  layers.fig3Blobs = layers.fig3.append("g");
  layers.dust = plot.append("path").attr("class", "cl-dust")
    .attr("fill", "none").attr("stroke", "#000").attr("stroke-opacity", 0.2) // a faint texture under the figure
    .attr("stroke-width", DUST_W).attr("stroke-linecap", "round");
  layers.dots = plot.append("g");
  layers.leaders = plot.append("g").attr("stroke", "#000").attr("stroke-width", 1.6);
  layers.labels = plot.append("g").attr("class", "cl-text");
  layers.names = plot.append("g").attr("class", "cl-text");
  layers.fig3text = plot.append("g").attr("class", "cl-text cl-fig3").style("opacity", 0);
  // The Fig. 3 rectangle doubles as a shortcut: click it to fly into Fig. 3
  layers.rect = plot.append("rect").attr("class", "cl-fig3-rect")
    .attr("fill", "none").attr("stroke", "#000").attr("stroke-width", 1.6)
    .attr("pointer-events", "all")
    .on("click", () => svg.transition().duration(1200).call(zoom.transform, fig3Transform()));
  layers.axes = svg.append("g").attr("class", "cl-axes");
  layers.titles = svg.append("g").attr("class", "cl-text");
  layers.legend = svg.append("g");

  // static object marks — positions set in render()
  layers.dots.selectAll("circle.cl-obj").data(OBJECTS).join("circle")
    .attr("class", "cl-obj")
    .attr("r", d => RINGED.has(d.name) ? 4 : 2.8)
    .attr("fill", d => RINGED.has(d.name) ? "#fff" : DOT_STYLE[d.name]?.fill || "#000")
    .attr("stroke", d => RINGED.has(d.name) ? "#000" : null)
    .attr("stroke-width", 1.5);
  layers.qg = layers.dots.append("g");
  layers.qg.append("circle").attr("r", 17).attr("fill", "#fff");
  layers.qg.append("circle").attr("r", 2).attr("fill", "#000");
  layers.rainbow = layers.dots.append("g");
  ["#3b45e6", "#2fb7e8", "#45c43c", "#f2e33a", "#f39a2a"].forEach((c, i) =>
    layers.rainbow.append("rect").attr("x", -15).attr("y", -6 + i * 2.4)
      .attr("width", 30).attr("height", 2.6).attr("fill", c));
  layers.bhArrows = layers.dots.append("g").attr("fill", "#fff");
  layers.bhArrows.append("path").attr("d", "M0,0 L16,-7 L16,7 Z").attr("class", "a1");
  layers.bhArrows.append("path").attr("d", "M0,0 L-16,-7 L-16,7 Z").attr("class", "a2");

  makeTexts(layers.labels, LABELS);
  makeTexts(layers.fig3text.append("g"), FIG3_TEXT).classed("cl-f3", true);
  layers.fig3text.append("g").selectAll("text").data(FIG3_LIMITS).join("text")
    .attr("class", "cl-lim").attr("font-size", 36).text(d => d.label);
  makeTexts(layers.titles, TITLES).attr("transform", d => textTransform(d, ...d.at));

  buildLegend();
  buildAxes();
  buildHeader();

  zoom = d3.zoom()
    .scaleExtent([1, 2e4])
    .extent([[FRAME.x0, FRAME.y0], [FRAME.x1, FRAME.y1]])
    .translateExtent([[FRAME.x0, FRAME.y0], [FRAME.x1, FRAME.y1]])
    .on("zoom", (e) => render(e.transform))
    .on("end", layoutNames);
  svg.call(zoom);
  enableTrackpadPinch(svg.node());   // Safari's trackpad pinch
  render(d3.zoomIdentity);
}

function buildLegend() {
  const g = layers.legend;
  g.append("rect").attr("x", 1079).attr("y", 1188).attr("width", 327).attr("height", 435)
    .attr("rx", 12).attr("fill", "#e0e0e0").attr("fill-opacity", 0.85)
    .attr("stroke", "#a9a9a9").attr("stroke-width", 1.5);
  g.append("text").attr("class", "cl-text").attr("x", 1243).attr("y", 1262)
    .attr("text-anchor", "middle").attr("font-size", 52).text("Domination");
  const items = [["#a6a6a6", "Λ_{i}"], ["#e69c9b", "r"], ["#9c9ae5", "m"], ["#c1c1c1", "Λ"]];
  items.forEach(([fill, sub], i) => {
    const y = 1285 + i * 80;
    g.append("rect").attr("x", 1110).attr("y", y).attr("width", 149).attr("height", 52).attr("fill", fill);
    const t = g.append("text").attr("class", "cl-omega").attr("x", 1275).attr("y", y + 49).attr("font-size", 66);
    t.append("tspan").text("Ω");
    const s = t.append("tspan").attr("dy", 14).attr("font-size", 46).attr("class", "cl-it");
    if (sub === "Λ_{i}") {
      s.text("Λ").attr("font-style", "normal");
      t.append("tspan").attr("dy", 8).attr("font-size", 30).attr("class", "cl-it").text("i");
    } else s.text(sub).attr("font-style", sub === "Λ" ? "normal" : null);
  });
}

// Zoom that fits the Fig. 3 window across the frame
function fig3Transform() {
  const k = (FRAME.x1 - FRAME.x0) / (x0(FIG3.r[1]) - x0(FIG3.r[0]));
  const rc = (FIG3.r[0] + FIG3.r[1]) / 2, mc = (FIG3.m[0] + FIG3.m[1]) / 2;
  return d3.zoomIdentity
    .translate((FRAME.x0 + FRAME.x1) / 2, (FRAME.y0 + FRAME.y1) / 2)
    .scale(k).translate(-x0(rc), -y0(mc));
}

// =============================================================
// Render (every zoom event)
// =============================================================
// The site's ~50k catalogue "dust" objects, as specks smaller than the
// figure's own dots. One <path> of zero-length round-capped segments; at
// most one speck per DUST_CELL figure-px cell, so dense clumps stay cheap.
const DUST_W = 2.2, DUST_CELL = 2;
function renderDust() {
  const d = dustArrays();
  if (!d || !xs) { layers.dust.attr("d", null); return; }
  const { r, m } = d;
  const gx = Math.ceil((FRAME.x1 - FRAME.x0) / DUST_CELL) + 1;
  const gy = Math.ceil((FRAME.y1 - FRAME.y0) / DUST_CELL) + 1;
  const seen = new Uint8Array(gx * gy);
  // linear scales: fold them into a × v + b for the 50k-point loop
  const [ra, rb] = xs.domain(), [xa, xb] = xs.range();
  const [ma, mb] = ys.domain(), [ya, yb] = ys.range();
  const sx = (xb - xa) / (rb - ra), ox = xa - ra * sx - FRAME.x0;
  const sy = (yb - ya) / (mb - ma), oy = ya - ma * sy - FRAME.y0;
  const W = FRAME.x1 - FRAME.x0, H = FRAME.y1 - FRAME.y0;
  const out = [];
  for (let i = 0; i < r.length; i++) {
    const x = r[i] * sx + ox;
    if (x < 0 || x > W) continue;
    const y = m[i] * sy + oy;
    if (y < 0 || y > H) continue;
    const c = Math.floor(y / DUST_CELL) * gx + Math.floor(x / DUST_CELL);
    if (seen[c]) continue;
    seen[c] = 1;
    out.push(`M${(x + FRAME.x0).toFixed(1)} ${(y + FRAME.y0).toFixed(1)}h0`);
  }
  layers.dust.attr("d", out.join("") || null);
}

function render(t) {
  xs = t.rescaleX(x0);
  ys = t.rescaleY(y0);
  const k = currentK = t.k;
  const P = ([r, m]) => [xs(r), ys(m)];
  const F = ([fx, fy]) => [xs(fr(fx)), ys(fm(fy))];

  // visible data window (+ margin) as the clip polygon
  const [ra, rb] = xs.domain(), [mb, ma] = ys.domain();
  const pr = (rb - ra) * 0.05, pm = (ma - mb) * 0.05;
  const view = [[ra - pr, mb - pm], [rb + pr, mb - pm], [rb + pr, ma + pm], [ra - pr, ma + pm]];
  const toPath = (poly) => poly.length < 3 ? "" : "M" + poly.map(p => P(p).join(",")).join("L") + "Z";

  // regions: forbidden brown everywhere, then the triangle's bands
  const regionPaths = [{ fill: COL.forbidden, d: toPath(view) }].concat(
    REGIONS.map(R => ({ fill: R.fill, d: toPath(R.hp.reduce(clipPoly, view)) })));
  layers.regions.selectAll("path").data(regionPaths).join("path")
    .attr("fill", d => d.fill).attr("d", d => d.d);

  // lines (data space segments, clipped by the frame clip-path)
  const far = 400;
  const seg = (a, b) => { const [x1, y1] = P(a), [x2, y2] = P(b); return { x1, y1, x2, y2 }; };
  const nowLow = c3MeetsCompton(C3.now);
  const hub = [UNIVERSE.logR, UNIVERSE.logM];
  const lines = [
    { ...seg([R_I, M_I], [far, far + BH_C]), stroke: "#000", w: 2.6 },                 // black holes
    { ...seg([R_I, M_I], [far, CP_C - far]), stroke: "#000", w: 2.6 },                  // Compton
    { ...seg([-far, -far + BH_C], [R_I, M_I]), stroke: "#000", w: 0 },
    { ...seg(nowLow, hub), stroke: "#000", w: 2.4 },                                    // now (matter edge)
    { ...seg(hub, onC3(C3.now, far)), stroke: "#000", w: 1.3 },                         // now above Hubble
    { ...seg([L_P, -far], [L_P, far]), stroke: "#fff", w: 2 },                           // Planck length
    { ...seg([R_I, M_P], [far, M_P]), stroke: "#000", w: 1.2, dash: "5 4" },             // Planck mass
    ...ISOCHRONS.map(key => ({
      ...seg(c3MeetsCompton(C3[key]), onC3(C3[key], far)), stroke: "#fff", w: 2.6, dash: "11 6",
    })),
  ].filter(l => l.w > 0);
  layers.lines.selectAll("line").data(lines).join("line")
    .attr("x1", d => d.x1).attr("y1", d => d.y1).attr("x2", d => d.x2).attr("y2", d => d.y2)
    .attr("stroke", d => d.stroke).attr("stroke-width", d => d.w)
    .attr("stroke-dasharray", d => d.dash || null);

  // group blobs scale with the data
  layers.blobs.selectAll("ellipse").data(BLOBS).join("ellipse")
    .attr("transform", d => { const [x, y] = F([d[0], d[1]]); return `translate(${x},${y}) rotate(${d[4]})`; })
    .attr("rx", d => d[2] * k).attr("ry", d => d[3] * k).attr("fill", d => d[5]);

  // dots grow a little as you zoom in, never with the full zoom
  const grow = Math.min(2.2, Math.pow(k, 0.28));
  renderDust();
  layers.dots.selectAll("circle.cl-obj").attr("cx", d => xs(d.logR)).attr("cy", d => ys(d.logM))
    .attr("r", d => DOT_STYLE[d.name]?.r || (RINGED.has(d.name) ? 4 : 2.8) * grow);
  const [qx, qy] = P([R_I, M_I]);
  layers.qg.attr("transform", `translate(${qx},${qy})`);
  const [bx, by] = F([717, 1387]);
  layers.rainbow.attr("transform", `translate(${bx},${by})`);
  const [a1x, a1y] = F([728, 703]), [a2x, a2y] = F([776, 652]);
  layers.bhArrows.select(".a1").attr("transform", `translate(${a1x},${a1y}) rotate(${ROT_BH})`);
  layers.bhArrows.select(".a2").attr("transform", `translate(${a2x},${a2y}) rotate(${ROT_BH})`);

  // Fig. 3 fades in as its window fills the frame; local Fig. 2 labels fade out
  const fig3Px = xs(FIG3.r[1]) - xs(FIG3.r[0]);
  const fade = Math.max(0, Math.min(1, (fig3Px - 600) / 300));
  layers.fig3.style("opacity", fade).style("display", fade ? null : "none");
  layers.fig3text.style("opacity", fade).style("display", fade ? null : "none");

  // labels & leaders, each riding rigidly with the point it names
  const off = (d) => {
    const o = d.obj || (d.lead && d.lead[0]) || d.at, [x, y] = F(o);
    return [x - o[0], y - o[1]];
  };
  const fadeK = (d) => d.maxK ? Math.max(0, Math.min(1, (d.maxK * 1.5 - k) / (d.maxK * 0.5))) : 1;
  const opacity = (d) => fadeK(d) * (d.fig3 === "out" ? 1 - fade : 1);
  layers.labels.selectAll("text")
    .attr("transform", d => { const [ox, oy] = off(d); return textTransform(d, d.at[0] + ox, d.at[1] + oy); })
    .style("opacity", d => opacity(d))
    .style("display", d => opacity(d) ? null : "none");
  layers.leaders.selectAll("line").data(LABELS.filter(d => d.lead)).join("line")
    .each(function (d) {
      const [ox, oy] = off(d), [[ax, ay], [bx, by]] = d.lead;
      d3.select(this).attr("x1", ax + ox).attr("y1", ay + oy).attr("x2", bx + ox).attr("y2", by + oy)
        .style("opacity", opacity(d));
    });
  layers.blobs.style("opacity", 1 - fade);
  layers.legend.style("opacity", Math.max(0, Math.min(1, (2 - k) / 0.8)))
    .style("display", k >= 2 ? "none" : null);

  // the Fig. 3 window
  layers.rect.attr("x", xs(FIG3_RECT.r[0])).attr("y", ys(FIG3_RECT.m[1]))
    .attr("width", xs(FIG3_RECT.r[1]) - xs(FIG3_RECT.r[0]))
    .attr("height", ys(FIG3_RECT.m[0]) - ys(FIG3_RECT.m[1]))
    .style("opacity", 1 - fade);

  if (fade) renderFig3(P);
  positionNames();
  renderAxes();
}

// ---------- object names (greedy, collision-free, laid out on zoom end) ----------
function positionNames() {
  layers.names.selectAll("text").data(placedNames, d => d.o.name)
    .attr("x", d => xs(d.o.logR) + (d.left ? -8 : 8))
    .attr("y", d => ys(d.o.logM) + NAME_SIZE * 0.33);
}

function layoutNames() {
  if (!svg) return;
  const ctm = svg.node().getScreenCTM();
  if (!ctm) return;
  const toSvg = (r) => [(r.left - ctm.e) / ctm.a, (r.top - ctm.f) / ctm.d,
    (r.right - ctm.e) / ctm.a, (r.bottom - ctm.f) / ctm.d];
  const taken = [];
  root.querySelectorAll(".cl-text text").forEach(el => {
    if (el.closest("[style*='display: none']") || el.parentNode === layers.names.node()) return;
    if (getComputedStyle(el).opacity === "0") return;
    taken.push(toSvg(el.getBoundingClientRect()));
  });
  // leader lines count as taken too (sampled every few px)
  const marks = [];
  layers.leaders.selectAll("line").each(function () {
    if (this.style.opacity === "0") return;
    const a = [+this.getAttribute("x1"), +this.getAttribute("y1")], b = [+this.getAttribute("x2"), +this.getAttribute("y2")];
    const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 5);
    for (let i = 0; i <= n; i++) marks.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]);
  });
  const hit = (r) => taken.some(q => r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1])
    || marks.some(([x, y]) => x > r[0] && x < r[2] && y > r[1] && y < r[3]);
  placedNames = [];
  for (const o of NAMED) {
    if (currentK < NAME_MIN_K[o.z || 3]) continue;
    const x = xs(o.logR), y = ys(o.logM);
    if (x < FRAME.x0 || x > FRAME.x1 || y < FRAME.y0 || y > FRAME.y1) continue;
    const w = o.name.length * NAME_SIZE * 0.5, h = NAME_SIZE * 0.8;
    let left = x + 8 + w > FRAME.x1;
    let r = left ? [x - 8 - w, y - h / 2, x - 8, y + h / 2] : [x + 8, y - h / 2, x + 8 + w, y + h / 2];
    if (hit(r)) {
      left = !left;
      r = left ? [x - 8 - w, y - h / 2, x - 8, y + h / 2] : [x + 8, y - h / 2, x + 8 + w, y + h / 2];
      if (hit(r) || r[0] < FRAME.x0 || r[2] > FRAME.x1) continue;
    }
    taken.push(r);
    placedNames.push({ o, left });
  }
  layers.names.selectAll("text").data(placedNames, d => d.o.name).join("text")
    .attr("font-size", NAME_SIZE)
    .attr("text-anchor", d => d.left ? "end" : "start")
    .text(d => d.o.name);
  positionNames();
}

function renderFig3(P) {
  const g = layers.fig3;
  const [ra, rb] = xs.domain();
  const seg = (a, b, extra) => ({ a, b, ...extra });
  const lines = [
    ...FIG3_LIMITS.map(l => seg([ra - 5, l.m], [rb + 5, l.m], { stroke: COL.red, w: 2.6 })),
    ...FIG3_DASHED.map(([a, b]) => seg(a, b, { stroke: "#3a55c4", w: 2, dash: "9 6" })),
    ...FIG3_LEADERS.map(([a, b]) => seg(a, b, { stroke: "#000", w: 1.6 })),
  ];
  g.selectAll("line.l").data(lines).join("line").attr("class", "l")
    .attr("x1", d => P(d.a)[0]).attr("y1", d => P(d.a)[1])
    .attr("x2", d => P(d.b)[0]).attr("y2", d => P(d.b)[1])
    .attr("stroke", d => d.stroke).attr("stroke-width", d => d.w)
    .attr("stroke-dasharray", d => d.dash || null);
  layers.fig3Blobs.selectAll("ellipse").data(FIG3_BLOBS).join("ellipse")
    .attr("fill", d => d.fill)
    .each(function (d) {
      const [a, b] = d.pts.map(P);
      const cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2;
      const rot = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
      d3.select(this).attr("cx", cx).attr("cy", cy)
        .attr("rx", Math.hypot(b[0] - a[0], b[1] - a[1]) / 2)
        .attr("ry", Math.max(1, ys(0) - ys(d.w)))
        .attr("transform", `rotate(${rot} ${cx} ${cy})`);
    });
  g.selectAll("line.arr").data(FIG3_ARROWS).join("line").attr("class", "arr")
    .attr("x1", d => P(d[0])[0]).attr("y1", d => P(d[0])[1])
    .attr("x2", d => P(d[1])[0]).attr("y2", d => P(d[1])[1])
    .attr("stroke", "#3a55c4").attr("stroke-width", 7).attr("stroke-linecap", "round")
    .attr("marker-end", "url(#cl-arrow-blue)");
  layers.fig3text.selectAll("text.cl-f3")
    .attr("transform", d => textTransform(d, ...P(d.at)));
  layers.fig3text.selectAll("text.cl-lim")
    .attr("transform", d => `translate(${P([d.r, d.m + d.dm]).join(",")})`);
}

// =============================================================
// Axes (fixed furniture; ticks follow the zoom)
// =============================================================
// Tick step: the paper's density (~13 per axis span) unless labels would
// collide, in which case the next round step that fits.
const NUM_PX = 44;
function tickStep(span, px, horizontal) {
  const raw = span / 13, p = Math.pow(10, Math.floor(Math.log10(raw)));
  for (const f of [1, 2, 5, 10, 20, 50, 100]) {
    const step = f * p;
    if (step < raw * (1 - 1e-9)) continue;
    const dec = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
    const chars = 3 + (dec ? dec + 1 : 0);
    const need = horizontal ? chars * NUM_PX * 0.6 + 18 : NUM_PX * 1.25;
    if (px * step / span >= need) return step;
  }
  return 100 * p;
}
function ticks([a, b], off, px, horizontal) {
  // ticks at round values of (v + off), returned with their data value v
  const lo = Math.min(a, b) + off, hi = Math.max(a, b) + off;
  const step = tickStep(hi - lo, px, horizontal), minor = step / 5;
  const maj = [], min = [];
  for (let v = Math.ceil(lo / minor - 1e-9) * minor; v <= hi + 1e-9; v += minor) {
    const isMaj = Math.abs(v / step - Math.round(v / step)) < 1e-6;
    (isMaj ? maj : min).push({ val: v, pos: v - off });
  }
  const dec = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  return { maj, min, fmt: (v) => {
    const t = Math.abs(v) < step / 1e6 ? "0" : v.toFixed(dec);
    return t.startsWith("-") ? "−" + t.slice(1) : t;
  } };
}

// The paper's title block, set as on its first page (bold Helvetica title,
// authors in Helvetica, affiliation in Times italic, then a parenthetical
// line in roman Times: the citation here), aligned to the plot frame.
function buildHeader() {
  const g = svg.append("g").attr("class", "cl-header");
  const width = FRAME.x1 - FRAME.x0;
  const line = (cls, y, size, txt) => {
    const t = g.append("text").attr("class", cls).attr("x", FRAME.x0).attr("y", y)
      .attr("font-size", size).text(txt);
    // shrink to the frame's width if this machine's fallback face runs wide
    const w = t.node().getComputedTextLength();
    if (w > width) t.attr("font-size", size * width / w);
  };
  line("cl-h-title", -205, 60, "All objects and some questions");
  line("cl-h-authors", -140, 44, "Charles H. Lineweaver and Vihan M. Patel");
  line("cl-h-affil", -88, 36, "Research School of Astronomy and Astrophysics, Australian National University");
  line("cl-h-cite", -30, 42, "(Am. J. Phys. 91, 819–825, 2023)");
}

// Static axis furniture: frame, outer M☉ axis line, Planck and energy markers
function buildAxes() {
  const g = layers.axesStatic = svg.append("g");
  g.append("rect").attr("x", FRAME.x0).attr("y", FRAME.y0)
    .attr("width", FRAME.x1 - FRAME.x0).attr("height", FRAME.y1 - FRAME.y0)
    .attr("fill", "none").attr("stroke", "#000").attr("stroke-width", 2.4);
  g.append("line").attr("x1", OUTER_AXIS_X).attr("y1", FRAME.y0).attr("x2", OUTER_AXIS_X).attr("y2", FRAME.y1)
    .attr("stroke", "#000").attr("stroke-width", 2.4);
  const marker = (cls, label, color, anchor) => {
    const m = g.append("g").attr("class", cls);
    m.append("line").attr("stroke", color).attr("stroke-width", color === "#000" ? 1.6 : 1.8)
      .attr("marker-end", `url(#cl-arrow-${color === "#000" ? "blk" : "red"})`);
    const t = m.append("text").attr("font-size", 40)
      .attr("fill", color).attr("text-anchor", anchor);
    richText(t, label, 40);
    return m;
  };
  layers.mP = marker("cl-mp", "m_{P}", "#000", "end");
  layers.lP = marker("cl-lp", "l_{P}", "#000", "middle");
  layers.energy = ENERGY_MARKS.map(([, txt]) => marker("cl-e", txt, COL.red, "start"));
}

function renderAxes() {
  const inX = (x) => x >= FRAME.x0 - 0.5 && x <= FRAME.x1 + 0.5;
  const inY = (y) => y >= FRAME.y0 - 0.5 && y <= FRAME.y1 + 0.5;
  const labY = (y) => y >= FRAME.y0 + 6 && y <= FRAME.y1 - 6;
  // vertical-axis numbers must not run into the rotated axis titles
  const numW = (txt) => txt.length * NUM_PX * 0.5;
  const clearOf = (x0_, x1_, y, [tx0, ty0, tx1, ty1]) => x1_ < tx0 || x0_ > tx1 || y + 16 < ty0 || y - 16 > ty1;
  const TITLE_BOX = { inner: [190, 773, 232, 1027], outer: [6, 818, 50, 977], right: [1517, 742, 1563, 1062] };
  const MAJ = 12, MIN = 6, PW = FRAME.x1 - FRAME.x0, PH = FRAME.y1 - FRAME.y0;
  const lines = [], nums = [];

  // horizontal axes: bottom log radius [cm], top log radius [Mpc]
  [[0, FRAME.y1, 1, 1718], [-LOG_MPC, FRAME.y0, -1, 113]].forEach(([off, y0_, dir, ny]) => {
    const T = ticks(xs.domain(), off, PW, true);
    T.min.forEach(t => { const x = xs(t.pos); if (inX(x)) lines.push([x, y0_, x, y0_ + dir * MIN, 1.6]); });
    T.maj.forEach(t => {
      const x = xs(t.pos);
      if (!inX(x)) return;
      lines.push([x, y0_, x, y0_ + dir * MAJ, 2]);
      nums.push([x, ny, T.fmt(t.val), "middle"]);
    });
  });
  // vertical axes: inner log mass [g], outer log mass [M☉], right log mass [GeV]
  [[0, FRAME.x0, -1, 279, "end", TITLE_BOX.inner],
   [-LOG_MSUN, OUTER_AXIS_X, -1, 141, "end", TITLE_BOX.outer],
   [-LOG_GEV, FRAME.x1, 1, 1466, "start", TITLE_BOX.right]].forEach(([off, x0_, dir, nx, anchor, box]) => {
    const T = ticks(ys.domain(), off, PH, false);
    T.min.forEach(t => { const y = ys(t.pos); if (inY(y)) lines.push([x0_, y, x0_ + dir * MIN, y, 1.6]); });
    T.maj.forEach(t => {
      const y = ys(t.pos);
      if (!inY(y)) return;
      lines.push([x0_, y, x0_ + dir * MAJ, y, 2]);
      const txt = T.fmt(t.val), w = numW(txt);
      const [a, b] = anchor === "end" ? [nx - w, nx] : [nx, nx + w];
      if (labY(y) && clearOf(a, b, y, box)) nums.push([nx, y + 16, txt, anchor]);
    });
  });
  layers.axes.selectAll("line").data(lines).join("line").attr("stroke", "#000")
    .attr("x1", d => d[0]).attr("y1", d => d[1]).attr("x2", d => d[2]).attr("y2", d => d[3])
    .attr("stroke-width", d => d[4]);
  layers.axes.selectAll("text").data(nums).join("text").attr("class", "cl-num")
    .attr("font-size", NUM_PX)
    .attr("x", d => d[0]).attr("y", d => d[1]).attr("text-anchor", d => d[3]).text(d => d[2]);

  // Planck mass and length arrows, red energy arrows: follow the axes
  const place = (m, show, [x1, y1, x2, y2], [tx, ty]) => {
    m.style("display", show ? null : "none");
    if (!show) return;
    m.select("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
    m.select("text").attr("x", tx).attr("y", ty);
  };
  const yP = ys(M_P), xP = xs(L_P);
  place(layers.mP, inY(yP), [248, yP, 294, yP], [246, yP + 13]);
  place(layers.lP, inX(xP), [xP, 1728, xP, 1666], [xP - 4, 1766]);
  ENERGY_MARKS.forEach(([lg, , tail, base], i) => {
    const y = ys(lg + LOG_GEV);
    place(layers.energy[i], inY(y), [1503, y + tail, 1450, y], [1507, y + base]);
  });
}

// =============================================================
// Open / close
// =============================================================
function onKey(e) {
  if (!isClassicOpen()) return;
  // Swallow every key so the main map's shortcuts stay quiet underneath.
  e.stopImmediatePropagation();
  if (e.key === "Escape" || e.key === "l" || e.key === "L") { e.preventDefault(); closeClassic(); return; }
  const dur = 200;
  if (e.key === "+" || e.key === "=") svg.transition().duration(dur).call(zoom.scaleBy, 1.4);
  else if (e.key === "-" || e.key === "_") svg.transition().duration(dur).call(zoom.scaleBy, 1 / 1.4);
  else if (e.key === "0" || e.key === "Home") svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity);
}

// The figure has its own page, /classic/ (built by build-pages.mjs; the old
// #classic still opens it). Opening pushes that URL, so Back (or a swipe on
// phones, where there's no Escape key) returns to the map.
let pushed = false;
let mapURL = "/";
export const isClassicURL = () => /^\/classic\/?$/.test(location.pathname) || location.hash === "#classic";
function onPop() {
  if (!isClassicURL()) hide();
}

export function openClassic() {
  if (!root) build();
  if (root.classList.contains("shown")) return;
  root.hidden = false;
  void root.offsetWidth;                // commit opacity 0 so the fade runs
  root.classList.add("shown");
  document.documentElement.classList.add("classic-open");
  window.addEventListener("keydown", onKey, true);
  window.addEventListener("popstate", onPop);
  if (!isClassicURL()) {
    mapURL = location.pathname + location.search + location.hash;
    try { history.pushState(null, "", "/classic/"); pushed = true; } catch { /* sandboxed frame */ }
  } else if (location.hash === "#classic") {
    try { history.replaceState(null, "", "/classic/"); } catch { /* sandboxed */ }
  }
  document.title = "All objects and some questions — The Triangle of Everything";
  layoutNames();
  loadDust().then(() => renderDust()).catch(() => {});
}

function hide() {
  if (!root || root.hidden || !root.classList.contains("shown")) return;
  root.classList.remove("shown");
  const done = () => { if (!root.classList.contains("shown")) root.hidden = true; };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) done();
  else setTimeout(done, 3050);          // just past the CSS fade
  document.documentElement.classList.remove("classic-open");
  window.removeEventListener("keydown", onKey, true);
  window.removeEventListener("popstate", onPop);
  document.title = "The Triangle of Everything";
  window.dispatchEvent(new Event("classic-close"));
}

export function closeClassic() {
  if (!isClassicOpen()) return;
  if (pushed) { pushed = false; history.back(); }       // popstate hides it
  else {
    try { history.replaceState(null, "", mapURL); } catch { /* sandboxed */ }
    hide();
  }
}

// Dev-only handle for screenshots and debugging
if (import.meta.env.DEV) {
  window.__classic = {
    fig3: () => svg.call(zoom.transform, fig3Transform()),
    names: () => layoutNames(),
    zoom: (k, r, m) => svg.call(zoom.transform, d3.zoomIdentity
      .translate((FRAME.x0 + FRAME.x1) / 2, (FRAME.y0 + FRAME.y1) / 2).scale(k).translate(-x0(r), -y0(m))),
  };
}

export function isClassicOpen() { return !!root && root.classList.contains("shown"); }
