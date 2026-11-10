// =============================================================
// Scene: short-05c-observable-universe — The Observable Universe, video 5's part 3, as a take of its own (the author's
// recording of 2026-11-09, rec64: video/short-05c-observable-universe/). The one thing outside the triangle, the three
// sides, our universe out to the cosmic event horizon; then (the author's notes of 2026-11-09, 21:24) the dive into
// our universe and the rest in the powers-of-ten zoom, laid under the captions (`zoom`, src/narration.js; the zoom's
// own script is tools/powers-of-ten/timeline-05c.js in the zoom's checkout, video/zoom-takes.json). Rendered only:
// the live player has the zoom only when it's given one (?zoom=<origin>).
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
export default {
  ...V5,
  title: "The Observable Universe",
  blurb: "Almost everything falls inside the triangle. The one thing outside it is the observable universe: not a map of where things are, but of when.",
  start: FULL,
  explorer: undefined,      // video 5's spectrum explorer: not in this part
  zoom: { timeline: "05c" },
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
    // into our universe, and on in the powers-of-ten zoom (tools/powers-of-ten/timeline-05c.js, the author's notes of
    // 2026-11-09): the CMB not drawn, outside the horizon shaded as it's said nothing there reaches us; our universe;
    // out to the 46 billion, the CMB fading in; at the telescope, fast in to Earth and slowly out, circles of when the
    // light was sent, the superclusters at "our distant past", the web gone, the Deep Field, then out of the CMB at
    // "faint radiation", and on out at that rate to the end
    { at: "outside this bubble", cam: { obj: HS, span: 0.35 }, dur: 2.6, clear: true, hl: [{ line: "horizon" }, { obj: HS, label: false }], zoom: { mark: "dive" }, offset: 0 },
    { at: "outside this bubble", offset: 0, zoom: { show: true, fade: 1.2 } },   // with the chart's dive, before it goes dark
    { at: "outside this bubble", offset: 1.6, clear: true, hl: [] },   // the chart's lines off the zoom
    { at: "call this our universe", offset: 0, zoom: { mark: "ours" } },
    { at: "46 billion", offset: 0, zoom: { mark: "obs" } },
    { at: "point a telescope", offset: 0, zoom: { mark: "tele" } },
    { at: "look at our distant past", offset: 0, zoom: { mark: "past" } },
    { at: "faint radiation", offset: 0, zoom: { mark: "cmb" } },
  ],
};
