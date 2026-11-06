// =============================================================
// Scene: long-02-end — the end of long video 2 (space), the author's third take of 2026-11-05 (rec56;
// video/long-02-end/): the Hubble sphere's mass lands on the black-hole line (the plant's payoff), both are
// horizons set by the mass inside, but the universe has no centre and looks the same from every galaxy; the
// observable universe at 46 billion light-years, the astronomer at our edge, the mirage and the snapshot of
// our own history, the cosmic microwave background, and the ending: the two edges meeting at the top, and the
// third side to come. The shots are video 5's (short-05-hubble-sphere), keyed to the new wording, with the
// whole-universe zoom (the explorer) under the 46 billion.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

const FULL = { r: -2.2, m: -4.8, span: 74 };
const SCHW = { line: "schwarzschild" };
const HUB = { line: "hubble", dash: true };
const RHO = -29.05;
const AVG = { density: RHO };
const HS = "Observable Universe";                    // the chart's dot sits at the Hubble radius
const EH = { r: 28.20, m: 56.17, mark: true };       // cosmic event horizon, 16.7 billion ly
const EHL_COL = "#ffab40";
const PH = { r: 28.64, m: 57.49, mark: true };       // particle horizon = observable universe, 46.5 billion ly
const OU = { ellipse: [PH.r, PH.m, 0.09, 0.09], rot: 0, place: "above" };
// the observable universe as nested shells (src/narr-diagrams.js): from us, out to the CMB
const SHELLS = [[0.5, "laniakea"], [3.5, "hubble"], [5, "horizon"], [6.5, "galaxies"], [8, "dark"], [9.5, "cmb"]];
const PLANCK = { r: -30, m: -3, span: 30 };          // where quantum meets relativity (the hook's)

export default {
  title: "Space: the end",
  blurb: "Are we living inside a black hole? The observable universe, the oldest light, and the two edges meeting at the top.",
  start: { r: 27.9, m: 54, span: 9 },
  // galaxies and up 60% of their size, Laniakea a good deal less: it hid everything around it (the author, 2026-11-05)
  iconBoost: { from: 21.2, k: 0.6, slugs: { "laniakea-galaxy-supercluster": 0.55 } },
  forceIcons: ["Laniakea", "Ton 618"],
  hideLabels: ["Observable Universe"],
  captionFixes: { shard: "chart", short: "chart", hobo: "Hubble", radio: "radius", neighbors: "neighbours" },

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md): video 5's
  backing: "Fresh Air",

  cues: [
    // ── on the black-hole line: the payoff ──
    { at: "add up everything", cam: { r: 27.9, m: 54, span: 9 }, dur: 2, clear: true, hideIcons: [HS],   // the CMB picture isn't the Hubble sphere (the author, 2026-11-05)
      hl: [{ obj: HS, label: "everything inside the Hubble sphere" }, { mark: [EH.r, EH.m], color: EHL_COL, delay: 1.2 }] },
    { at: "black hole line", hl: [{ ...SCHW, label: "on the black-hole line" }, { obj: HS, label: false }, { mark: [EH.r, EH.m], color: EHL_COL, label: "cosmic event horizon" }] },
    { at: "remember that line", hl: [{ ...SCHW, label: "the line to remember" }, { obj: HS, label: false }] },
    { at: "inside a black hole", hl: [SCHW, { obj: HS, label: "a black hole?" }] },
    { at: "weird coincidence", hl: [{ ...SCHW, label: "a coincidence?" }, { obj: HS, label: false }] },
    // down the black-hole line to M87*, a dive with the EHT photo over its picture, then back up
    { at: "both are an event horizon", hl: [{ ...SCHW, label: "event horizons" }, { ...HUB, label: false }, { obj: HS, label: false }] },
    { at: "both are an event horizon", offset: 0.5, cam: { obj: "M87*", span: 3 }, dur: 2.2, hl: [{ ...SCHW, label: "event horizons" }] },
    { at: "both are an event horizon", offset: 2.3, photo: "m87", obj: "M87*", dive: { in: 1.6, out: 2, photoAt: 0.4 }, dur: 2.6, fadeIn: 0.9,
      lens: { map: [0.00056505, -0.00003499, -0.550765, -0.453559], r: 0.48, size: [3600, 3600] },
      caption: "M87*'s event horizon · Event Horizon Telescope · 2019" },
    // two circles, two kinds of light: one never gets out, the other never gets here
    { at: "never come out", cam: { r: 26.5, m: 54, span: 9 }, hold: 16, hl: [{ horizons: { right: false } }] },
    { at: "can ever come in", hold: 12, hl: [{ horizons: {}, instant: true }] },
    { at: "depend on the mass", hl: [SCHW, { ...AVG, label: "both set by mass" }, { obj: HS, label: false }] },
    { at: "radius of a black hole", hl: [{ ...SCHW, label: "a black hole: size set by mass" }, { obj: HS, label: false }] },
    { at: "how fast the universe expands", hl: [SCHW, { ...AVG, label: "expansion rate ↔ density" }, { obj: HS, label: false }] },
    { at: "on the same line", hl: [{ ...SCHW, label: "the same line" }, { obj: HS, label: "no coincidence" }] },
    // ── our universe, not the universe ──
    // the black hole has a centre; our sphere doesn't: galaxies floating in 3D, a freeze, an arrow on one at the edge, and
    // the sphere moves there, reaching galaxies ours can't (the author, 2026-11-05; no CMB here, it isn't the Hubble sphere)
    { at: ["object with a center", "object with a centre"], hold: 10, hl: [{ center: {} }] },
    { at: "not the universe", hold: 30, hl: [{ own: { phase: 0 } }] },
    { at: "one of those galaxies", hold: 30, hl: [{ own: { phase: 1 }, instant: true }] },
    { at: ["center around them", "centered around them", "centred around them"], hold: 30, hl: [{ own: { phase: 2 }, instant: true }] },
    { at: "whole lot of other galaxies", hold: 14, hl: [{ own: { phase: 3 }, instant: true }] },
    { at: "infinite in all directions", cam: { r: 27, m: 54, span: 10 }, hl: [HUB, { side: "right", of: "hubble" }, { obj: HS, label: "beyond: probably more of the same" }] },
    // ── the observable universe ──
    { at: "even weirder", cam: { r: 28.2, m: 56.4, span: 5 }, clear: true, hl: [HUB, { obj: HS, label: false }] },
    { at: "see them right now", hl: [HUB, { obj: HS, label: "we see them too" }] },
    { at: "limit of our universe", hl: [{ ...HUB, label: "the limit of our universe" }, { obj: HS, label: false }] },
    { at: "14 billion", hl: [HUB, { obj: HS, label: "Hubble sphere · 14 billion ly" }] },
    // the observable universe, shell by shell, from us out to the CMB, colours by distance (the author, 2026-11-05, in place of the wavelength ball)
    { at: "46 billion", clear: true, hold: 60, hl: [{ cosmos: { zoom: [[0, 11], [1, 11], [10, 1.02]], rings: SHELLS } }] },
    { at: ["way outside our triangle", "outside our triangle"], cam: { r: 28.2, m: 56.4, span: 5 }, dur: 0.01, clear: true,
      hl: [{ obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: PH, delay: 0.6 }, { ...OU, label: "observable universe · 46 billion ly", delay: 1.0 }] },
    { at: ["outside our boundaries", "only object"], hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label: "outside the triangle" }] },
    { at: "single object", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label: "not one object" }] },
    { at: "talk to the other", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label: "its sides never met" }] },
    // the ending on the shells, not the chart; our own 3D CMB, no photo (the author, 2026-11-05)
    { at: "mirage", hold: 60, hl: [{ cosmos: { zoom: [[0, 1.02], [6, 1.02]], rings: [[0.5, "galaxies"], [1.2, "dark"], [1.9, "cmb"]] } }] },
    { at: "cosmic microwave background", hold: 60, hl: [{ cosmos: { zoom: [[0, 1.02], [16, 1.05]], rings: [[0, "cmb"]] }, instant: true }] },
    // ── the ending: the top of the triangle, and the third side ──
    { at: "top of the triangle", cam: { r: 14, m: 30, span: 60 }, dur: 3, clear: true, hl: [{ line: "triangle" }] },
    { at: "black hole line", hl: [{ line: "triangle" }, { ...SCHW, label: "squeeze: gravity wins" }] },
    { at: "hubble sphere", hl: [{ line: "triangle" }, { ...SCHW, label: "squeeze: gravity wins" }, { ...HUB, label: "stretch: expansion wins" }] },
    { at: "two lines meet", cam: { r: 27.6, m: 55.2, span: 7 }, dur: 2.5, hl: [SCHW, HUB, { obj: HS, label: "our whole universe", delay: 1 }] },
    { at: "one edge", cam: FULL, dur: 3, clear: true, hl: [{ line: "triangle" }, { line: "compton", label: "the third side", delay: 1.5 }] },
    { at: "third side of our triangle", cam: PLANCK, dur: "end", ease: "gentle", drift: 0, hl: [{ line: "compton", label: "next: the small end" }, { line: "schwarzschild" }] },
  ],
};
