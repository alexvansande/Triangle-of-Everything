// =============================================================
// Scene: short-05c-observable-universe — The Observable Universe, video 5's part 3, as a take of its own (the author's
// recording of 2026-11-09, rec64: video/short-05c-observable-universe/). The one thing outside the triangle, the three
// sides, our universe out to the cosmic event horizon; then (the author's review, 2026-11-09) into our universe and out
// to the observable universe, cut open, its rings by the billion light-years; video 5's zoom out from Earth, its rings
// named by when their light left; and the eras before, slowly, out to the oldest light in red (src/narr-diagrams.js
// drawObservable).
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

import V5, { ZOOM_OUT, UNIVERSE_KEY, UNIVERSE_COLOURS } from "./short-05-hubble-sphere.js";

const FULL = { r: -2.2, m: -4.8, span: 74 };
const SCHW = { line: "schwarzschild" };
const HUB = { line: "hubble" };
const HS = "Our Universe";
const PH = { r: 28.64, m: 57.49, mark: true };       // the observable universe, 46.5 billion ly
const OU = { ellipse: [PH.r, PH.m, 0.09, 0.09], rot: 0, place: "above" };
const OUT = (label, more = {}) => [SCHW, HUB, { obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label, ...more }];
const EDGE = { r: 28.2, m: 56.4, span: 5 };
// video 5's zoom out from Earth, each ring named by when its light left (the author, 2026-11-09)
const SEEN = [
  [4.6, "the Moon's orbit · 1.3 light-seconds", "light from 1.3 seconds ago", 1.5],
  [6.6, "the Sun's path · 8 light-minutes", "light from 8 minutes ago", 1.5],
  [8.6, "Proxima Centauri · 4.2 light-years", "light from 4 years ago", 1.5],
  [10.6, "Milky Way", "light from 100,000 years ago", 1.5],
  [12.6, "1 billion ly", "light from 1 billion years ago", 1.5],
  [14.8, "edge", "light from 13.8 billion years ago", 4.2],
];
const seenCues = (at) => [
  ...ZOOM_OUT.map(([dt, ezoom, ease], i) => ({ at, offset: dt - 0.25, explorer: { ezoom, ease, dur: (ZOOM_OUT[i + 1]?.[0] ?? dt + 3) - dt } })),
  ...SEEN.flatMap(([dt, key, text, hold]) => [
    { at, offset: dt - 0.25, explorer: { labels: { [key]: text }, names: 1, dur: 0.5 } },
    { at, offset: dt + hold - 0.25, explorer: { names: 0, dur: 0.5 } }]),
];

export default {
  ...V5,
  title: "The Observable Universe",
  blurb: "Almost everything falls inside the triangle. The one thing outside it is the observable universe: not a map of where things are, but of when.",
  start: FULL,
  cues: [
    // everything in a triangle, almost
    { at: "plotting every object", cam: FULL, dur: 3, hl: [{ line: "triangle" }] },
    { at: "falls into a triangle", hl: [{ line: "triangle", label: "a triangle" }] },
    { at: "falls outside of it", cam: EDGE, dur: 2.5, clear: true, hideObjects: [],
      hl: [{ obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: PH, delay: 0.6 }, { ...OU, label: "outside the triangle", delay: 1 }] },
    { at: "call that an object", hl: OUT("an object?") },
    { at: "exploring the observable universe", hl: OUT("the observable universe") },
    // the three sides
    { at: "three sides", cam: FULL, dur: 3, clear: true, hl: [{ line: "triangle" }] },
    { at: "relativity on the top left", hl: [{ line: "triangle" }, { ...SCHW, label: "relativity" }] },
    { at: "quantum mechanics", hl: [{ line: "triangle" }, SCHW, { line: "compton", label: "quantum mechanics" }] },
    { at: "size of the universe on the right", hl: [{ line: "triangle" }, SCHW, { line: "compton" }, { line: "horizon", label: "the size of the universe" }] },
    // our universe: the cosmic event horizon
    { at: "size of our universe", cam: { r: 27.4, m: 54.8, span: 8 }, dur: 3, clear: true, hl: [{ line: "horizon", label: "cosmic event horizon" }, { obj: HS, label: "our universe" }] },
    { at: "16 billion light years", hl: [{ line: "horizon" }, { obj: HS, label: "16 billion light-years" }] },
    { at: "outside this bubble", hl: [{ line: "horizon" }, { side: "right", of: "hubble", label: "never reaches us" }, { obj: HS, label: false }] },
    // into our universe, and out: the observable universe round it, cut open (drawObservable)
    { at: "call this our universe", cam: { obj: HS, span: 0.35 }, dur: 2.6, clear: true, hl: [{ line: "horizon" }, { obj: HS, label: false }] },
    { at: "call this our universe", offset: 2.6, hold: 60, hl: [{ obs: {} }] },
    { at: "46 billion", hold: 60, hl: [{ obs: { phase: "obs" }, instant: true }] },
    { at: "yet another horizon", hold: 60, hl: [{ obs: { phase: "hl" }, instant: true }] },
    // the telescope: Earth, the universe round it in three colours, and out, each ring by when its light left
    { at: "point a telescope", clear: true, hold: 20, hideObjects: [], hl: [{ ...UNIVERSE_KEY, delay: 7 }], explorer: { show: true, fade: 1.6, spin: 0.03 } },
    ...seenCues("point a telescope"),
    { at: "point a telescope", offset: 5.8, explorer: { ...UNIVERSE_COLOURS, dur: 3 } },
    { at: "talk to what happens", explorer: { show: false, fade: 1 }, cam: EDGE, dur: 0.01, clear: true, hl: OUT("one side can't talk to the other") },
    { at: "single object at all", hl: OUT("not one object") },
    { at: "future that never will be", hl: OUT("a future that never will be") },
    // before the stars: into the observable universe again, and out slowly through the eras, each gone dark behind;
    // the oldest light last, red (the author, 2026-11-09)
    { at: "look at our distant past", cam: { r: PH.r, m: PH.m, span: 0.3 }, dur: 2.4, clear: true, hl: [] },
    { at: "a time before", hold: 60, hl: [{ obs: { phase: "past" } }] },
    { at: "before superclusters", hold: 60, hl: [{ obs: { phase: "superclusters" }, instant: true }] },
    { at: "before clusters", hold: 60, hl: [{ obs: { phase: "clusters" }, instant: true }] },
    { at: "before galaxies", hold: 60, hl: [{ obs: { phase: "galaxies" }, instant: true }] },
    { at: "before stars existed", hold: 60, hl: [{ obs: { phase: "stars" }, instant: true }] },
    { at: "faint radiation", hold: 60, hl: [{ obs: { phase: "cmb" }, instant: true }] },
  ],
};
