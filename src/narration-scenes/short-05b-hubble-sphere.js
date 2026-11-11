// =============================================================
// Scene: short-05b-hubble-sphere — The Cosmic Event Horizon, video 5's part 2, as a take of its own (the author's
// recording of 2026-11-11, rec67, re-recorded whole: video/short-05b-hubble-sphere/). The largest anything can be, then video 5's shots
// from the second edge to "we see them too" with this take's wording, and the observable universe outside the triangle
// to hand on to part 3.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

import V5 from "./short-05-hubble-sphere.js";

const FULL = { r: -2.2, m: -4.8, span: 74 };
// this take's wording for video 5's phrases (a cue matches any of its `at`)
const ALSO = {
  "the second edge": "rightmost edge",
  "more space being created": "not expanding into anything",
  "can ever affect us": "will never affect us",
  "that's the hubble sphere": "all about the speed of light",   // rec67 (2026-11-11): the line after "rightmost edge" (cues resolve in order, so the alternative must come where the old phrase did, not at "the Hubble sphere is also growing")
  "can ever come in": "can never come in",
  "inside a black hole": "living in a black hole",
  "one of those galaxies": "an alien living in a galaxy",
  "out of our reach": "more and more galaxies",
  "practically infinite": "the universe is infinite",
  "we also see them": "we can actually see them",
  "the only object": "only thing that sits outside our triangle",
};
const reword = (c) => {
  const at = [].concat(c.at ?? []);
  const extra = at.map(a => ALSO[a]).filter(Boolean);
  return extra.length ? { ...c, at: [...at, ...extra] } : c;
};
const idx = (phrase) => V5.cues.findIndex(c => [].concat(c.at).includes(phrase));

export default {
  ...V5,
  title: "The Cosmic Event Horizon",
  blurb: "What's the largest anything can be? The Hubble line, the cosmic event horizon, why everything inside it sits on the black-hole line, and why it isn't a black hole.",
  start: FULL,
  // the galaxies and clusters 20% smaller (the author, 2026-11-09: "they're all too large")
  iconBoost: { from: 19.5, k: 0.8 },
  // the de Sitter radius's dotted line (where the horizon ends up, in hundreds of billions of years) left off: beside
  // the cosmic event horizon it reads as a second one (the author, 2026-11-10)
  deSitter: false,
  cues: [
    { at: "largest anything can be", cam: FULL, dur: 3, hl: [{ line: "triangle" }] },
    { at: "every single object", hl: [{ line: "triangle", label: "every object, by mass and size" }] },
    // video 5's shots, the photo's pixels quicker so each step lands on "four", "nine", "or more" (the author), and
    // getting smaller inside a picture that keeps its size (the author, 2026-11-10: spreading out, they read as expanding)
    ...V5.cues.slice(idx("the second edge"), idx("object with a center") + 1).map(reword)
      .map(c => [].concat(c.at).includes("resolution of a photo") ? { ...c, hl: [{ pixels: { cell: 3, steps: [2.2, 3.0, 3.8], fixed: true } }] } : c)
      // the cosmic event horizon's name over its disc: to the right it ran off the frame (the author, 2026-11-09, 1:29)
      .map(c => c.hl ? { ...c, hl: c.hl.map(q => q.mark && q.label === "cosmic event horizon" ? { ...q, place: "above", gap: 58 } : q) } : c),
    // the alien at our edge (the author's design, 2026-11-09; src/narr-diagrams.js drawEdge, the zoom's own objects):
    // dive into our universe; the turn stops and a galaxy at our edge is circled; their universe round it; our observable
    // universe grows round ours, reaching into theirs; its microwave background; and out to the chart
    { at: "our universe is just that", cam: { obj: "Our Universe", span: 0.35 }, dur: 2.6, clear: true },
    { at: "not the universe", hold: 60, hl: [{ edge: {} }] },
    // the distant past's arrow on "but", to our universe's left edge (the author, 2026-11-10)
    { at: ["but let's imagine", "let's imagine"], offset: 0, hold: 60, hl: [{ edge: { phase: "past" }, instant: true }] },
    { at: "imagine for a moment", hold: 60, hl: [{ edge: { phase: "alien" }, instant: true }] },
    { at: "centered around them", hold: 60, hl: [{ edge: { phase: "theirs" }, instant: true }] },
    { at: "we can actually see them", hold: 60, hl: [{ edge: { phase: "see" }, instant: true }] },
    // (the chart's observable universe in view behind the diagram, so its picture has settled before it takes over)
    { at: "it's time we meet", hold: 60, cam: { r: 28.64, m: 57.49, span: 0.3 }, dur: 0.01, hideObjects: [], hl: [{ edge: { phase: "meet" }, instant: true }] },
    // out of the observable universe: from close on it, back to the chart, outside the triangle
    { at: ["it's the observable universe", "the observable universe"], cam: { r: 28.64, m: 57.49, span: 0.3 }, dur: 0.01, clear: true, hideObjects: [], hl: [] },
    // a dive out: the chart's picture of it starts grown to the diagram's sphere, which fades over it, and shrinks back
    // as the camera pulls out (the author, 2026-11-10, 2:55: "make the transition from one observable object to the
    // other smoother"; it was a cut to the small picture, lower down)
    { at: ["it's the observable universe", "the observable universe"], offset: 0, dolly: { obj: "Observable Universe", grow: 2.6, in: 0.01, out: 2.4 }, dur: 0 },
    // (the camera pulls out a little after the picture starts shrinking: its first moments swell the picture a little)
    { ...reword(V5.cues[idx("the only object")]), at: ["it's the observable universe", "the observable universe"], offset: 0.75, cam: { r: 28.2, m: 56.4, span: 5 }, dur: 2.6, explorer: undefined, hideObjects: [] },
  ],
};
