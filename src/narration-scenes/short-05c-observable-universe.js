// =============================================================
// Scene: short-05c-observable-universe — The Observable Universe, video 5's part 3, as a take of its own (the author's
// recording of 2026-11-09, rec64: video/short-05c-observable-universe/). The one thing outside the triangle, the three
// sides, our universe out to the cosmic event horizon, video 5's zoom out to the 46 billion, the Deep Field for the
// distant past, the observable universe's ring, and the shells out to the oldest light (long video 2's ending).
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

import V5 from "./short-05-hubble-sphere.js";

const FULL = { r: -2.2, m: -4.8, span: 74 };
const SCHW = { line: "schwarzschild" };
const HUB = { line: "hubble" };
const HS = "Our Universe";
const PH = { r: 28.64, m: 57.49, mark: true };       // the observable universe, 46.5 billion ly
const OU = { ellipse: [PH.r, PH.m, 0.09, 0.09], rot: 0, place: "above" };
const OUT = (label, more = {}) => [SCHW, HUB, { obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label, ...more }];
const EDGE = { r: 28.2, m: 56.4, span: 5 };
const idx = (phrase) => V5.cues.findIndex(c => [].concat(c.at).includes(phrase));

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
    { at: "call this our universe", hl: [{ line: "horizon" }, { obj: HS, label: "our universe" }] },
    // the 46 billion: video 5's zoom out over the whole universe
    ...V5.cues.slice(idx("46 billion"), idx("sum of all the light") + 1),
    // far is the past: the Deep Field
    { at: "our own distant past", offset: 0.4, photo: "xdf", dur: 12, kb: [1, 1.4], caption: "Hubble eXtreme Deep Field · 2012 · galaxies as they were, up to 13 billion years ago" },
    { at: "talk to what happens", explorer: { show: false, fade: 1 }, cam: EDGE, dur: 0.01, clear: true, hl: OUT("one side can't talk to the other") },
    { at: "single object at all", hl: OUT("not one object") },
    { at: "future that never will be", hl: OUT("a future that never will be") },
    // before the stars: the shells, out to the oldest light (long video 2's ending)
    { at: "a time before", hold: 30, clear: true, hl: [{ cosmos: { zoom: [[0, 1.02], [6, 1.02]], rings: [[0.5, "galaxies"], [1.2, "dark"], [1.9, "cmb"]] } }] },
    { at: "faint radiation", hold: 30, hl: [{ cosmos: { zoom: [[0, 1.02], [16, 1.05]], rings: [[0, "cmb"]] }, instant: true }] },
  ],
};
