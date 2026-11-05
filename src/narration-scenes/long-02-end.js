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
const HUB = { line: "hubble" };
const RHO = -29.05;
const AVG = { density: RHO };
const HS = "Observable Universe";                    // the chart's dot sits at the Hubble radius
const EH = { r: 28.20, m: 56.17, mark: true };       // cosmic event horizon, 16.7 billion ly
const EHL_COL = "#ffab40";
const PH = { r: 28.64, m: 57.49, mark: true };       // particle horizon = observable universe, 46.5 billion ly
const OU = { ellipse: [PH.r, PH.m, 0.09, 0.09], rot: 0, place: "above" };
const LOG_UNIT = Math.log10(1000 / 9.4607e12);
const UNIVERSE_COLOURS = { c: 13, s: 8.5 };
const EARTH_VIEW = { yaw: -2.5666, pitch: 0.835, orbit: 6.2, gmst: 0.035 };
const NATURAL = { c: 22, s: 1 };
const ZOOM_OUT = [[1.2, 0.75, "in"], [4.2, 1.5, "linear"], [6.2, 2.6, "linear"], [8.2, 3.9, "linear"], [10.2, 5.5, "linear"], [12.2, 7.2, "linear"], [14.2, 8.8, "out"]];
const UNIVERSE_NAMES = [
  [4.6, "the Moon's orbit · 1.3 light-seconds", "the Moon · 1.3 light-seconds", 1.5],
  [6.6, "the Sun's path · 8 light-minutes", "the Sun · 8 light-minutes", 1.5],
  [8.6, "Proxima Centauri · 4.2 light-years", "nearest stars · 4 light-years", 1.5],
  [10.6, "Milky Way", "our galaxy · 100,000 light-years", 1.5],
  [12.6, "1 billion ly", "1 billion light-years", 1.5],
  [14.8, "edge", "observable universe's edge", 4.2],
];
const universeCues = (at, k = 1) => [
  ...ZOOM_OUT.map(([dt, ezoom, ease], i) => ({ at, offset: k * dt - 0.25,
    explorer: { ezoom, ease, dur: k * ((ZOOM_OUT[i + 1]?.[0] ?? dt + 3) - dt) } })),
  ...UNIVERSE_NAMES.flatMap(([dt, key, text, hold]) => [
    { at, offset: k * dt - 0.25, explorer: { labels: { [key]: text }, names: 1, dur: 0.5 } },
    { at, offset: k * (dt + hold) - 0.25, explorer: { names: 0, dur: 0.5 } }]),
];
const UNIVERSE_KEY = { key: [["microwave", "#ff6b5e"], ["far infrared", "#7ddc6f"], ["visible light", "#7fa2ff"]], y: 0.7 };
const PLANCK = { r: -30, m: -3, span: 30 };          // where quantum meets relativity (the hook's)

export default {
  title: "Space: the end",
  blurb: "Are we living inside a black hole? The observable universe, the oldest light, and the two edges meeting at the top.",
  start: { r: 27.9, m: 54, span: 9 },
  forceIcons: ["Laniakea", "Ton 618"],
  hideLabels: ["Observable Universe"],
  explorer: { view: "cloud", radius: "log", unit: LOG_UNIT, rings: true, bright: "lin", labels: {},
    ...EARTH_VIEW, ezoom: 0.33, line: 0, guides: 0.75, names: 0, dot: 1.5, exposure: 1.1, ...NATURAL },
  captionFixes: { shard: "chart", short: "chart", hobo: "Hubble", radio: "radius", neighbors: "neighbours" },

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md): video 5's
  backing: "Fresh Air",

  cues: [
    // ── on the black-hole line: the payoff ──
    { at: "add up everything", cam: { r: 27.9, m: 54, span: 9 }, dur: 2, clear: true, hideIcons: null,
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
    { at: "never come out", cam: { r: 26.5, m: 54, span: 9 }, hl: [{ ...SCHW, label: "nothing gets out" }, { obj: HS, label: false }] },
    { at: "can ever come in", hl: [SCHW, { obj: HS, label: "nothing gets in" }] },
    { at: "depend on the mass", hl: [SCHW, { ...AVG, label: "both set by mass" }, { obj: HS, label: false }] },
    { at: "radius of a black hole", hl: [{ ...SCHW, label: "a black hole: size set by mass" }, { obj: HS, label: false }] },
    { at: "how fast the universe expands", hl: [SCHW, { ...AVG, label: "expansion rate ↔ density" }, { obj: HS, label: false }] },
    { at: "on the same line", hl: [{ ...SCHW, label: "the same line" }, { obj: HS, label: "no coincidence" }] },
    // ── our universe, not the universe ──
    { at: ["object with a center", "object with a centre"], cam: { obj: "Ton 618", span: 8 }, hl: [SCHW, { obj: "Ton 618", label: "a black hole: a lump with a centre" }] },
    { at: "not the universe", cam: { r: 27.4, m: 54.8, span: 8 }, hl: [HUB, { obj: HS, label: "our universe" }] },
    { at: ["center around us", "centered around us", "centred around us"], hl: [HUB, { obj: HS, label: "centred on us" }] },
    { at: "one of those galaxies", cam: { r: 25, m: 50, span: 12 }, dur: 3, hl: [HUB, { obj: HS, label: false }, { obj: "Sombrero (M104)", label: "a galaxy at our edge" }] },
    { at: ["center around them", "centered around them", "centred around them"], hl: [HUB, { obj: HS, label: "everyone has their own" }, { obj: "Sombrero (M104)", label: false }] },
    { at: "point a telescope", hl: [HUB, { obj: HS, label: false }, { obj: "Sombrero (M104)", label: "their telescopes" }] },
    { at: "whole lot of other galaxies", hl: [HUB, { side: "right", of: "hubble", label: "more galaxies" }, { obj: HS, label: false }, { obj: "Sombrero (M104)", label: false }] },
    { at: "infinite in all directions", cam: { r: 27, m: 54, span: 10 }, hl: [HUB, { side: "right", of: "hubble" }, { obj: HS, label: "beyond: probably more of the same" }] },
    // ── the observable universe ──
    { at: "even weirder", cam: { r: 28.2, m: 56.4, span: 5 }, clear: true, hl: [HUB, { obj: HS, label: false }] },
    { at: "see them right now", hl: [HUB, { obj: HS, label: "we see them too" }] },
    { at: "limit of our universe", hl: [{ ...HUB, label: "the limit of our universe" }, { obj: HS, label: false }] },
    { at: "14 billion", hl: [HUB, { obj: HS, label: "Hubble sphere · 14 billion ly" }] },
    // the whole universe on a log scale: from Earth out to the edge of the observable universe as the
    // 46 billion is named, a few distances named, the colours explained, then back to the chart
    { at: "46 billion", clear: true, hold: 20, hl: [{ ...UNIVERSE_KEY, delay: 7 }], explorer: { show: true, fade: 1.6, spin: 0.03 } },
    ...universeCues("46 billion", 0.85),
    { at: "46 billion", offset: 5.8, explorer: { ...UNIVERSE_COLOURS, dur: 3 } },
    { at: "farthest light we can see", offset: -0.4, clear: true, explorer: { exposure: 2.4, dot: 2.2, dur: 3 } },
    { at: ["way outside our triangle", "outside our triangle"], explorer: { show: false, fade: 1.4 }, cam: { r: 28.2, m: 56.4, span: 5 }, dur: 0.01, clear: true,
      hl: [{ obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: PH, delay: 0.6 }, { ...OU, label: "observable universe · 46 billion ly", delay: 1.0 }] },
    { at: ["outside our boundaries", "only object"], hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label: "outside the triangle" }] },
    { at: "single object", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label: "not one object" }] },
    { at: "talk to the other", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label: "its sides never met" }] },
    { at: "mirage", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label: "a mirage" }] },
    { at: "snapshot of our own history", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label: "a snapshot of history" }] },
    // the Deep Field for the snapshot, then the microwave background for the oldest light
    { at: "snapshot of our own history", offset: 1.2, photo: "xdf", dur: 9, kb: [1, 1.4], caption: "Hubble eXtreme Deep Field · 2012 · galaxies as they were, up to 13 billion years ago" },
    { at: "cosmic microwave background", offset: 0.6, photo: "cmb", dur: 18, kb: [1.05, 1.2], caption: "the cosmic microwave background · Planck · 2018 · the oldest light there is" },
    { at: "very early universe", cam: { r: 28.2, m: 56.4, span: 7 }, clear: true, hl: [HUB, { mark: [EH.r, EH.m], color: EHL_COL, label: "the oldest light we see" }] },
    // ── the ending: the top of the triangle, and the third side ──
    { at: "top of the triangle", cam: { r: 14, m: 30, span: 60 }, dur: 3, clear: true, hl: [{ line: "triangle" }] },
    { at: "black hole line", hl: [{ line: "triangle" }, { ...SCHW, label: "squeeze: gravity wins" }] },
    { at: "hubble sphere", hl: [{ line: "triangle" }, { ...SCHW, label: "squeeze: gravity wins" }, { ...HUB, label: "stretch: expansion wins" }] },
    { at: "two lines meet", cam: { r: 27.6, m: 55.2, span: 7 }, dur: 2.5, hl: [SCHW, HUB, { obj: HS, label: "our whole universe", delay: 1 }] },
    { at: "one edge", cam: FULL, dur: 3, clear: true, hl: [{ line: "triangle" }, { line: "compton", label: "the third side", delay: 1.5 }] },
    { at: "third side of our triangle", cam: PLANCK, dur: "end", ease: "gentle", drift: 0, hl: [{ line: "compton", label: "next: the small end" }, { line: "schwarzschild" }] },
  ],
};
