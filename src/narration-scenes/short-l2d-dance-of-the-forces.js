// =============================================================
// Scene: short-l2d-dance-of-the-forces — the forces Short as a take of its own, from its second recording of
// 2026-11-23 (rec78, video/short-l2d-dance-of-the-forces/: 2:57 with the dark-matter ending). The four forces, the bonds,
// the diagonal and gravity rounding things, the giant planets' column, then the simulations one after the other (the
// author, 2026-11-23: "a lot of these simulations can just run right one after the other. We probably don't need to
// keep zooming out into the triangle scenes"): the atoms crushed, fusion, a short look at the dying star, the weak force
// and the neutrons' grid, the powers-of-ten zoom out to the neutron star; then the black hole, the ones we know and the
// primordial ones, their window, dark matter, and the lucky few survivors. The shots and simulation settings are long
// video 2's (long-02b-opening.js), retimed to this take's words.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

import { W5, ML, HAW, NS_OPEN, SRC_NS, DM_PBH } from "./short-04-black-holes.js";

const WATER = { line: "water" };
const ON_LINE = (m) => (m - 0.62) / 3;
const force = (m, dir, color) => ({ arrow: true, solid: true, width: 4, color, from: { r: ON_LINE(m) + dir * 1.5, m }, to: { r: ON_LINE(m) + dir * 0.2, m } });
const GRAV_AT = (m, named = true) => [force(m + 0.9, 1, "#ffab40"), force(m - 0.9, 1, "#ffab40"), ...(named ? [{ text: "gravity\npushes in", at: [ON_LINE(m) + 0.85, m], size: 22, color: "#ffab40" }] : [])];
const EM_AT = (m, named = true) => [force(m + 0.9, -1, "#4fc3f7"), force(m - 0.9, -1, "#4fc3f7"), ...(named ? [{ text: "electro-\nmagnetism\npushes out", at: [ON_LINE(m) - 1.05, m], size: 22, color: "#4fc3f7" }] : [])];
const UP = (m, span = 4.6) => ({ r: ON_LINE(m), m, span, glide: true });
const COLUMN = { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f" };
const G = (r, m, span = 1.7) => ({ r, m, span });
const BD = [{ obj: "Y Brown Dwarf", label: false }, { obj: "T Brown Dwarf", label: false }];
const MS = { line: "mainsequence", label: "main sequence" };
const HIGH = { path: "stellar-high-mass" };
const SCHW = { line: "schwarzschild" };
const NS = { obj: "PSR J0030+0451", label: false };
const ROUND_M = 22.45;
const ROUND_GRAV = { side: "above", mass: ROUND_M, label: "round", labelX: 0.22 };
const WINDOW = { window: W5, cuts: [ML, HAW, NS_OPEN], label: "still open?", dist: 40 };

// the simulations (src/squeeze-sim.js), long video 2's settings; `from` and the P times are seconds into each run, set
// so the moments land on this take's words
// the bonds: a few atoms settling, the pull named on "attracted to the protons" (1.7 s in), the push on "push back" (4.7)
const BONDS = { squeeze: { mode: 1, from: 0, P: { count: 34, startBox: 1.12, endBox: 1.12, shrinkTime: 999, threshold: 9, centreFirst: 0, initSpeed: 140, arrowTime: 30, arrowsIn: false, arrowsOut: false, arrowsBonds: true,
  bondPullFrom: 1.6, bondPushFrom: 4.6 },
  labels: [["electrons and protons attract", "#b39ddb", 1.6], ["electrons repel electrons", "#4fc3f7", 4.6]] } };
// the atoms crushed: every shell left pops on "stripped" (3.8 s after "the pressure in their cores": run 17.1 + 3.8 = 20.9)
const CRUSH = { squeeze: { mode: 1, from: 17.1, zoom: [[2.5, 1], [8.3, 3.2]], follow: [0, 99], boxFollow: true, P: { nucleus: 0.25, arrowsOut: false, arrowsBonds: true, arrowTime: 30, bondPushFrom: 13.4, bondPullFrom: 14.5, bondShare: 0.25,
  popAllAt: 20.9, popAllSpread: 0.8, endBox2: 0.6, shrink2Time: 4 } } };
const FUSION_P = { groups4: true, fourAtOnce: false, count: 200, radius: 100, groupSpacing: 5.0, groupGap: 1.6, groupSpring: 4, startBox: 1.6, endBox: 1.2,
  relief: 0, jitter: 12, initSpeed: 40, damping: 1, hugRate: 1.4, bridgeTime: 0.15, neutrons: 2, arrowTime: 7,
  cycles: true, cyclePeriod: 4.2, cycleBurst: 0.2, expandTime: 1.6, contractRate: 1.6, burstBox: 2.0, burstForce: 1.5, burstTau: 0.8, burstRate: 2.5 };
// the weak force: the first ring clenching on "squeeze a proton" (5.2 s after "a new player enters": run 13.2 + 5.2 = 18.4,
// as in the long video), the neutrons settling into their grid once the last core has turned (run 21.6)
const WEAK = { mode: 3, from: 13.2, P: { helium: true, hexAt: 21.6, hexTime: 1.6 }, zoom: [[0, 2.4], [16, 3.0]] };

export default {
  title: "The dance of the forces",
  blurb: "Electromagnetism against gravity, then the strong force and fusion, then the weak force: from a chemical bond to a neutron star and a black hole, and maybe the black holes that ate most of the universe.",
  start: { r: 3.0, m: 9.3, span: 13 },
  iconBoost: { from: 21.2, k: 0.6, slugs: { "laniakea-galaxy-supercluster": 0.55 } },
  icons: "all",
  forceIcons: ["Sun", "L Brown Dwarf", "T Brown Dwarf", "Y Brown Dwarf"],
  captionFixes: { nuclei: "nucleus", "electrons'": "electrons'" },
  credits: 3,

  backing: "Promises to Keep",
  sound: [
    { at: "comes into play", fx: "ignite", offset: 0.2 },
    { at: "called a supernova", fx: "boom", offset: 0.3 },
    { at: "a black hole", fx: "drop", atEnd: true, offset: -0.2 },
  ],

  cues: [
    // ── The four forces, on the diagonal ──
    { t: 0, cam: { r: 3.0, m: 9.3, span: 13 }, dur: 0.05, units: true, hl: [{ line: "water", label: "the diagonal" }] },
    { at: "delicate dance", cam: { obj: "Human", span: 4.6, glide: true }, dur: 2.5, clear: true, hl: [WATER, { obj: "Human" }] },
    { at: "fundamental forces", hl: [WATER, ...GRAV_AT(3.6, false), ...EM_AT(6.2, false)] },
    // the chemical bonds: a few atoms on black, settling at their distance, until "…the electromagnetic force"
    { at: "at atomic level", hold: 999, hl: [BONDS] },
    { at: "electromagnetic force", offset: 0.3, cam: { obj: "Human", span: 6 }, dur: 0.05, clear: true, hl: [WATER, { obj: "Human", label: "held by chemical bonds" }, ...EM_AT(6.2)] },
    { at: "so if you plot", cam: { r: 3.0, m: 9.3, span: 13, glide: true }, hl: [WATER] },
    { at: "around the diagonal", hl: [{ line: "water", label: "the diagonal" }] },
    // one pan up the line: crushed under its own weight, then gravity named, then the round worlds
    { at: "make something big", cam: UP(8), clear: true, hl: [WATER, { ellipse: [ON_LINE(9.5) + 1.2, 9.5, 0.6, 0.6], rot: 0, label: false, color: "#ffab40" },
      { arrow: true, solid: true, width: 4, color: "#ffab40", from: { r: ON_LINE(9.5) + 1.2, m: 9.5 }, to: { r: ON_LINE(9.5), m: 9.5 }, padEnd: 0, delay: 0.4 },
      { text: "crushes\nunder its\nown weight", at: [ON_LINE(9.5) + 1.0, 10.75], size: 22, color: "#ffab40", delay: 0.5 }] },
    { at: "no negative gravity", cam: UP(17), hl: [WATER, ...GRAV_AT(18.5)] },
    { at: "everything attracts", cam: { r: 7.75, m: 24.1, span: 4.6, glide: true }, hl: [ROUND_GRAV, { obj: "Ceres", label: "Ceres · round", delay: 0.3 }, { obj: "Pluto", label: false, delay: 0.6 }] },
    { at: "nothing repels", cam: { r: 8.6, m: 27.0, span: 4.6, glide: true }, hl: [ROUND_GRAV, { obj: "Earth", label: "shaped by gravity" }, { obj: "Moon", label: false }] },
    // the giant planets' column
    { at: "beyond jupiter", cam: G(9.85, 30.9, 2.4), dur: 2.2, clear: true, hl: [{ obj: "Jupiter", label: "Jupiter", place: "left" }] },
    { at: "any bigger", hl: [{ obj: "Jupiter", label: false, place: "left" }, ...BD, COLUMN] },
    { at: "just get denser", hl: [{ obj: "Jupiter", label: "denser, not bigger", place: "left" }, ...BD, { ...COLUMN, draw: 0.01 }] },

    // ── The simulations, one after the other ──
    // the atoms crushed (every shell pops on "stripped"), the box following the crowd, pushing in on the bare nuclei
    { at: "the pressure in their", hold: 999, hl: [CRUSH] },
    // fusion: the protons, the strong force's reach, the push, the fours captured, the burst, the balance
    ...[["a new force", "start"], ["reaches no longer", "reach"], ["gravity squeezes", "push"], ["captures them", "capture"], ["burst of energy", "energy"], ["counterbalance", "balance"], ["that's fusion", "fusion"]]
      .map(([at, phase], i) => ({ at, hold: 999, hl: [{ fusionSim: { phase, P: FUSION_P }, instant: true, out: phase === "fusion" ? 1.6 : 0.6 }] })),
    // the star running out, close on the chart (one cut, no flight): the main sequence, the fire going out, the supernova
    { at: "that equilibrium", cam: { r: 11.1, m: 33.2, span: 3.0, glide: true }, dur: 0.05, clear: true, hl: [MS, { obj: "Sun", label: "fusing hydrogen" }] },
    { at: "once it runs out", cam: { r: 11.85, m: 33.4, span: 3.6, glide: true }, hl: [{ swing: [{ obj: "Sun" }, { obj: "Red Giant" }], period: 1.2, core: true }, { obj: "Red Giant", label: "out of hydrogen", delay: 0.6 }] },
    { at: "catastrophic core collapse", cam: { r: 12.7, m: 35.0, span: 5 }, dur: 1.5, clear: true, hl: [HIGH, { obj: "Crab Nebula", label: "supernova", delay: 0.6 }, { obj: "PSR J0030+0451", label: "the core", delay: 1.2 }] },
    // the weak force: the cores turn to neutrons, which settle into their grid; then straight on, the zoom out to the star
    { at: "a new player enters", hold: 16, hl: [{ squeeze: WEAK }] },
    { at: "the result is a neutron star", cam: { obj: "PSR J0030+0451", span: 3.4 }, dur: 0.05, clear: true, hold: 999,
      hl: [{ p10: { sim: { at: "a new player enters", ...WEAK } }, instant: true, out: 1.0 }] },

    // ── The black hole ──
    { at: "speed limit on everything", cam: { obj: "PSR J0030+0451", span: 3.4 }, dur: 0.05, clear: true, hl: [{ obj: "PSR J0030+0451", label: "neutron star" }] },
    { at: "speed of light", hl: [{ obj: "PSR J0030+0451", label: "nothing goes faster than light" }] },
    { at: "escape velocity", cam: { r: 8.6, m: 33.7, span: 8 }, dur: 3, clear: true, hl: [NS, { obj: "Stellar BH", label: "?", delay: 0.6 }] },
    { at: "not even light", hl: [NS, { obj: "Stellar BH", label: "not even light gets out" }] },
    { at: "strangest objects", hl: [NS, { obj: "Stellar BH", label: "a black hole" }, SCHW] },

    // ── The other type: primordial black holes, and dark matter ──
    { at: "all the black holes we know", cam: { obj: "Stellar BH", span: 10 }, dur: 2, clear: true, hl: [SCHW, { obj: "Stellar BH", label: "from dying stars" }] },
    { at: "another type", cam: { r: -2, m: 25, span: 28 }, dur: 3.5, clear: true, hl: [{ ...SCHW, label: "smaller ones?" }] },
    { at: "primordial black holes", hl: [SCHW, { ...DM_PBH, label: "primordial black holes", delay: 0.2 }] },
    { at: "moments of the big bang", hl: [SCHW, DM_PBH, { density: 40, label: "the first instants:\nall of it this dense" }] },
    { at: "wouldn't emit any light", cam: { r: -8.6, m: 19.4, span: 12 }, dur: 2.5, clear: true, hl: [WINDOW, SRC_NS] },
    { at: "effects on gravity", cam: { obj: "Milky Way", span: 7 }, dur: 2.5, clear: true, hl: [{ obj: "Milky Way", label: "more mass than we can see" }] },
    { at: "dark matter", hl: [{ obj: "Milky Way", label: "dark matter?" }] },
    { at: "we found none", cam: { r: -8.6, m: 19.4, span: 12 }, dur: 2.5, clear: true, hl: [{ ...WINDOW, label: "none found yet" }, SRC_NS] },
    // the ending: the whole chart, most of the matter on the black-hole line, the rest, ordinary matter, the survivors
    { at: "the early moments", cam: { r: 6, m: 24, span: 46 }, dur: 5, ease: "gentle", clear: true, hl: [{ line: "triangle" }] },
    { at: "into black holes", hl: [{ line: "triangle" }, { ...SCHW, label: "most of the matter?" }] },
    { at: "ordinary matter", hl: [{ line: "triangle" }, SCHW, { line: "water", label: "ordinary matter" }, { obj: "Milky Way", label: false, delay: 0.4 }, { obj: "Human", label: false, delay: 0.7 }] },
    { at: "lucky few survivors", hl: [{ line: "triangle" }, SCHW, { line: "water", label: "the lucky few survivors" }, { obj: "Milky Way", label: false }, { obj: "Human", label: false }] },
  ],
};
