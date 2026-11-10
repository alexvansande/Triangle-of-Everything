// =============================================================
// Scene: short-05b-hubble-sphere — The Cosmic Event Horizon, video 5's part 2, as a take of its own (the author's
// recording of 2026-11-09, rec63: video/short-05b-hubble-sphere/). The largest anything can be, then video 5's shots
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
  cues: [
    { at: "largest anything can be", cam: FULL, dur: 3, hl: [{ line: "triangle" }] },
    { at: "every single object", hl: [{ line: "triangle", label: "every object, by mass and size" }] },
    // video 5's shots, the photo's pixels quicker so each step lands on "four", "nine", "or more" (the author)
    ...V5.cues.slice(idx("the second edge"), idx("object with a center") + 1).map(reword)
      .map(c => [].concat(c.at).includes("resolution of a photo") ? { ...c, hl: [{ pixels: { cell: 16, steps: [2.2, 3.0, 3.8] } }] } : c)
      // the cosmic event horizon's name over its disc: to the right it ran off the frame (the author, 2026-11-09, 1:29)
      .map(c => c.hl ? { ...c, hl: c.hl.map(q => q.mark && q.label === "cosmic event horizon" ? { ...q, place: "above", gap: 58 } : q) } : c),
    // the alien at our edge (the author's design, 2026-11-09; src/narr-diagrams.js drawEdge, the zoom's own objects):
    // dive into our universe; the turn stops and a galaxy at our edge is circled; their universe round it; our observable
    // universe grows round ours, reaching into theirs; its microwave background; and out to the chart
    { at: "our universe is just that", cam: { obj: "Our Universe", span: 0.35 }, dur: 2.6, clear: true },
    { at: "not the universe", hold: 60, hl: [{ edge: {} }] },
    { at: "imagine for a moment", hold: 60, hl: [{ edge: { phase: "alien" }, instant: true }] },
    { at: "centered around them", hold: 60, hl: [{ edge: { phase: "theirs" }, instant: true }] },
    { at: "we can actually see them", hold: 60, hl: [{ edge: { phase: "see" }, instant: true }] },
    { at: "it's time we meet", hold: 60, hl: [{ edge: { phase: "meet" }, instant: true }] },
    // out of the observable universe: from close on it, back to the chart, outside the triangle
    { at: "it's the observable universe", cam: { r: 28.64, m: 57.49, span: 0.3 }, dur: 0.01, clear: true, hideObjects: [], hl: [] },
    { ...reword(V5.cues[idx("the only object")]), at: "it's the observable universe", offset: 0.15, cam: { r: 28.2, m: 56.4, span: 5 }, dur: 2.6, explorer: undefined, hideObjects: [] },
  ],
};
