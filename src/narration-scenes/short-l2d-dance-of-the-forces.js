// =============================================================
// Scene: short-l2d-dance-of-the-forces — the forces Short as a take of its own, from its second recording of
// 2026-11-23 (rec78, video/short-l2d-dance-of-the-forces/: 2:57 with the dark-matter ending). The four forces, the bonds,
// the diagonal and gravity rounding things, the giant planets' column, then the simulations one after the other (the
// author, 2026-11-23: "a lot of these simulations can just run right one after the other. We probably don't need to
// keep zooming out into the triangle scenes"): the atoms crushed, fusion, a short look at the dying star, the weak force
// and the neutrons' grid, the powers-of-ten zoom out to the neutron star; then the escape speed and the black hole, the ones we know
// from dying stars, and the ending in one breath: the lucky few survivors (re-cut 2026-11-23, 2:57 with credits: the
// primordial black holes' lines out, the main sequence and the escape speed back in, so no line hangs on one left out). The shots and simulation settings are long
// video 2's (long-02b-opening.js), retimed to this take's words.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

const WATER = { line: "water" };
const ON_LINE = (m) => (m - 0.62) / 3;
const force = (m, dir, color) => ({ arrow: true, solid: true, width: 4, color, from: { r: ON_LINE(m) + dir * 1.5, m }, to: { r: ON_LINE(m) + dir * 0.2, m } });
const GRAV_AT = (m, named = true) => [force(m + 0.9, 1, "#ffab40"), force(m - 0.9, 1, "#ffab40"), ...(named ? [{ text: "gravity\npushes in", at: [ON_LINE(m) + 0.85, m], size: 22, color: "#ffab40" }] : [])];
const EM_AT = (m, named = true) => [force(m + 0.9, -1, "#4fc3f7"), force(m - 0.9, -1, "#4fc3f7"), ...(named ? [{ text: "electro-\nmagnetism\npushes out", at: [ON_LINE(m) - 1.05, m], size: 22, color: "#4fc3f7" }] : [])];
const COLUMN = { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f" };
const G = (r, m, span = 1.7) => ({ r, m, span });
const BD = [{ obj: "Y Brown Dwarf", label: false }, { obj: "T Brown Dwarf", label: false }];
const MS = { line: "mainsequence", label: "main sequence" };
const HIGH = { path: "stellar-high-mass" };
const SCHW = { line: "schwarzschild" };
const NS = { obj: "PSR J0030+0451", label: false };
const ROUND_M = 22.45;
const ROUND_GRAV = { side: "above", mass: ROUND_M, label: "round", labelX: 0.22 };
// the two forces held on the screen while the chart pans slowly up the line under them (the author, 2026-11-23, 0:28: "add
// just two arrows with labels and let these stick on the screen instead of moving with the line"): electromagnetism from
// the less dense side above, gravity from the denser side below, each pointing at the line where it crosses the screen
// (the camera stays on the line; the stage is 9:16 and the line rises 3 : 1)
const EM_SCREEN = (delay) => [
  { arrow: true, screen: true, solid: true, width: 5, color: "#4fc3f7", from: { x: 0.04, y: 0.34 }, to: { x: 0.61, y: 0.34 }, padEnd: 0, delay },
  { text: "electromagnetism\nprevents atoms from\ngetting too dense", screen: true, at: [0.32, 0.255], size: 21, sub: 0.72, color: "#4fc3f7", delay: delay + 0.3 }];
const GRAV_SCREEN = (delay) => [
  { arrow: true, screen: true, solid: true, width: 5, color: "#ffab40", from: { x: 0.96, y: 0.66 }, to: { x: 0.44, y: 0.66 }, padEnd: 0, delay },
  { text: "gravity\nwants to crush\natoms together", screen: true, at: [0.70, 0.585], size: 21, sub: 0.72, color: "#ffab40", delay: delay + 0.3 }];

// the simulations (src/squeeze-sim.js), long video 2's settings; `from` and the P times are seconds into each run, set
// so the moments land on this take's words
// the bonds: a few atoms settling, the pull named on "attracted to the protons" (1.7 s in), the push on "push back" (4.7)
const BONDS = { squeeze: { mode: 1, from: 0, P: { count: 34, startBox: 1.12, endBox: 1.12, shrinkTime: 999, threshold: 9, centreFirst: 0, initSpeed: 140, arrowTime: 30, arrowsIn: false, arrowsOut: false, arrowsBonds: true,
  bondPullFrom: 1.6, bondPushFrom: 4.6 },
  labels: [["electrons and protons attract", "#b39ddb", 1.6], ["electrons repel electrons", "#4fc3f7", 4.6]] } };
// the atoms crushed: every shell left pops on "stripped" (3.8 s after "the pressure in their cores": run 17.1 + 3.8 = 20.9)
const CRUSH = { squeeze: { mode: 1, from: 17.1, zoom: [[2.5, 1], [8.3, 3.2]], follow: [0, 99], boxFollow: true, P: { nucleus: 0.25, inArrowsView: true, arrowsOut: false, arrowsBonds: true, arrowTime: 30, bondPushFrom: 13.4, bondPullFrom: 14.5, bondShare: 0.25,
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
  captionFixes: { "electrons'": "electrons'" },
  credits: 3,

  backing: "Promises to Keep",
  sound: [
    { at: "comes into play", fx: "ignite", offset: 0.2 },
    { at: "in a supernova", fx: "boom", offset: 0.3 },
    { at: "a black hole", fx: "drop", atEnd: true, offset: -0.2 },
  ],

  cues: [
    // ── The four forces, on the diagonal ──
    { t: 0, cam: { r: 3.0, m: 9.3, span: 13 }, dur: 0.05, units: true, hl: [{ line: "water", label: "the diagonal" }] },
    { at: "delicate dance", cam: { obj: "Human", span: 4.6, glide: true }, dur: 2.5, clear: true, hl: [WATER, { obj: "Human" }] },
    { at: "fundamental forces", hl: [WATER, ...GRAV_AT(3.6, false), ...EM_AT(6.2, false)] },
    // the chemical bonds: a few atoms on black, settling at their distance, until "…the electromagnetic force"
    { at: "at the atomic level", hold: 999, hl: [BONDS] },
    { at: "electromagnetic force", offset: 0.3, cam: { obj: "Human", span: 6 }, dur: 0.05, clear: true, hl: [WATER, { obj: "Human", label: "held by chemical bonds" }, ...EM_AT(6.2)] },
    { at: "so if you plot", cam: { r: 3.0, m: 9.3, span: 13, glide: true }, hl: [WATER] },
    { at: "one diagonal", hl: [{ line: "water", label: "the diagonal" }] },
    // one slow pan up the line, wide, the two forces held on the screen: gravity named on "crush", electromagnetism on
    // "unlike electromagnetism" (3.8 s on), then the round worlds
    { at: "make something big", cam: { r: ON_LINE(10.5), m: 10.5, span: 8 }, dur: 1.6, clear: true, hl: [WATER, ...GRAV_SCREEN(1.2), ...EM_SCREEN(4.0)] },
    { at: "crush under", cam: { r: 8.2, m: 25.4, span: 5, glide: true }, dur: 11.4, ease: "gentle" },
    // (no cut on the line: one pan from "crush" up to the round worlds, there by "everything is round"; it stopped at m 20.5
    // and jumped on in 1.6 s on "gravity dominates", which read as a cut: the author, 2026-11-24, video/plans/visual-rules.md)
    { at: "gravity dominates", clear: true, hl: [ROUND_GRAV, { obj: "Ceres", label: "Ceres · round", delay: 0.2 }, { obj: "Earth", label: "shaped by gravity", delay: 0.6 }, { obj: "Moon", label: false, delay: 0.6 }] },
    // the giant planets' column
    { at: "beyond jupiter", cam: G(9.85, 30.9, 2.4), dur: 2.2, clear: true, hl: [{ obj: "Jupiter", label: "Jupiter", place: "left" }] },
    { at: "any bigger", hl: [{ obj: "Jupiter", label: false, place: "left" }, ...BD, COLUMN] },
    { at: "just get denser", hl: [{ obj: "Jupiter", label: "denser, not bigger", place: "left" }, ...BD, { ...COLUMN, draw: 0.01 }] },

    // ── The simulations, one after the other ──
    // the atoms crushed (every shell pops on "stripped"), the box following the crowd, pushing in on the bare nuclei
    { at: "the pressure in their", hold: 999, hl: [CRUSH] },
    // no cut into fusion: the bare nuclei slide to fusion's opening, gravity's arrows doubling on "add even more mass"
    { at: "add even more", hold: 999, hl: [{ morph: true, instant: true }] },
    // fusion: the protons, the strong force's reach, the push, the fours captured, the burst, the balance
    ...[["a new force", "start"], ["reaches no further", "reach"], ["inside a star", "push"], ["captures them", "capture"], ["burst of energy", "energy"], ["holds gravity back", "balance"], ["that's fusion", "fusion"]]
      .map(([at, phase], i) => ({ at, hold: 999, hl: [{ fusionSim: { phase, P: FUSION_P }, instant: true, out: phase === "fusion" ? 1.6 : 0.6 }] })),
    // the star running out, close on the chart (one cut, no flight): the main sequence, the fire going out, the supernova
    { at: "that balance is the main", cam: { r: 11.1, m: 33.2, span: 3.0, glide: true }, dur: 0.05, clear: true, hl: [MS, { obj: "Sun", label: "fusing hydrogen" }] },
    { at: "when hydrogen runs out", cam: { r: 11.85, m: 33.4, span: 3.6, glide: true }, hl: [{ swing: [{ obj: "Sun" }, { obj: "Red Giant" }], period: 1.2, core: true }, { obj: "Red Giant", label: "out of hydrogen", delay: 0.6 }] },
    { at: "massive star collapses", cam: { r: 12.7, m: 35.0, span: 5 }, dur: 1.5, clear: true, hl: [HIGH, { obj: "Crab Nebula", label: "supernova", delay: 0.6 }, { obj: "PSR J0030+0451", label: "the core", delay: 1.2 }] },
    // the weak force: the cores turn to neutrons, which settle into their grid; then straight on, the zoom out to the star
    { at: "a new player enters", hold: 999, hl: [{ squeeze: WEAK }] },   // (999: on till the zoom out, no dip to the chart between; the author, 2026-11-24, 1:49)
    { at: "the result is a neutron star", cam: { obj: "PSR J0030+0451", span: 3.4 }, dur: 0.05, clear: true, hold: 999,
      // (it lands on the escape scene's star, at its size and as the next cue starts, so no chart between: the author, 2026-11-24,
      // "Just zoom out to our model of the neutron star, and keep zooming out")
      hl: [{ p10: { sim: { at: "a new player enters", ...WEAK }, dur: 7.3, km: 24, disc: 0.1875, labels: [] }, instant: true, out: 1.0 }] },

    // ── The black hole ──
    // the neutron star close, its escape speed ring by ring as we pull out; back in on the speed limit; squeezed till its
    // escape speed is light's, a flash, a black disk (the author, 2026-11-24, 1:58): src/narration.js, drawEscape
    { at: "to escape the gravity", cam: { obj: "PSR J0030+0451", span: 3.4 }, dur: 0.05, clear: true, hold: 999, hl: [{ escape: { phase: "start" }, instant: true }] },
    ...[["has a speed limit", "limit"], ["speed of light", "light"], ["so dense that", "dense"], ["than that", "c"], ["that's a black hole", "hole"]]
      .map(([at, phase]) => ({ at, hold: 999, hl: [{ escape: { phase }, instant: true, out: phase === "hole" ? 0.8 : 0.6 }] })),

    // ── The ones we know, and the ending ──
    { at: "we know dying stars", cam: { obj: "Stellar BH", span: 10 }, dur: 2, clear: true, hl: [SCHW, { obj: "Stellar BH", label: "from dying stars" }] },
    // the ending (rec79, one dark-matter sentence): the whole chart, the black-hole line as maybe the dark matter, most of
    // the matter on it, the rest, the delicate equilibrium, the survivors
    { at: "the big bang might", cam: { r: 6, m: 24, span: 46 }, dur: 6, ease: "gentle", clear: true, hl: [{ line: "triangle" }] },
    { at: "the dark matter that", hl: [{ line: "triangle" }, { ...SCHW, label: "dark matter?" }] },
    { at: "dominated most of", hl: [{ line: "triangle" }, { ...SCHW, label: "most of the matter?" }] },
    { at: "everything else that makes", hl: [{ line: "triangle" }, SCHW, { line: "water", label: "everything else" }, { obj: "Milky Way", label: false, delay: 0.4 }, { obj: "Human", label: false, delay: 0.7 }] },
    { at: "few lucky survivors", hl: [{ line: "triangle" }, SCHW, { line: "water", label: "the lucky few survivors" }, { obj: "Milky Way", label: false }, { obj: "Human", label: false }] },
  ],
};
