// =============================================================
// Scene: short-05b-hubble-sphere — The Cosmic Event Horizon, video 5's part 2, as a take of its own (the author's
// recording of 2026-11-11, rec67, re-recorded whole: video/short-05b-hubble-sphere/). The largest anything can be, then video 5's shots
// from the second edge to "we see them too" with this take's wording, and the observable universe outside the triangle
// to hand on to part 3.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

import V5 from "./short-05-hubble-sphere.js";

const FULL = { r: -2.2, m: -4.8, span: 74 };
const SCHW = { line: "schwarzschild" }, HS = "Our Universe";
const M87 = { r: 15.28, m: 43.11 };                       // M87* (src/objects.json)
const TWO = { r: 21.8, m: 49.8, span: 17 };               // M87* at the bottom left, our universe at the top right
// light falling into the black hole (from its right: it sits near the left edge), and light outside our universe that
// never gets in (from its left), as short solid arrows; a label over the first of each
const LIGHT_IN = [
  { arrow: true, solid: true, width: 3, color: "#ffe9a3", from: { obj: "M87*", dx: 105, dy: -85 }, to: { obj: "M87*", dx: 16, dy: -13 }, label: "light falls in · never out", labelPos: "start", draw: 0.8 },
  { arrow: true, solid: true, width: 3, color: "#ffe9a3", from: { obj: "M87*", dx: 130, dy: 12 }, to: { obj: "M87*", dx: 22, dy: 2 }, draw: 0.8, delay: 0.3 },
  { arrow: true, solid: true, width: 3, color: "#ffe9a3", from: { obj: "M87*", dx: 70, dy: 115 }, to: { obj: "M87*", dx: 12, dy: 20 }, draw: 0.8, delay: 0.6 },
];
const LIGHT_OUT = [
  { arrow: true, solid: true, width: 3, color: "#80deea", from: { obj: HS, dx: -140, dy: 95 }, to: { obj: HS, dx: -58, dy: 40 }, label: "light outside · never in", labelPos: "start", draw: 0.8 },
  { arrow: true, solid: true, width: 3, color: "#80deea", from: { obj: HS, dx: -165, dy: -15 }, to: { obj: HS, dx: -70, dy: -6 }, draw: 0.8, delay: 0.3 },
  { arrow: true, solid: true, width: 3, color: "#80deea", from: { obj: HS, dx: -75, dy: -160 }, to: { obj: HS, dx: -32, dy: -68 }, draw: 0.8, delay: 0.6 },
];
// this take's wording for video 5's phrases (a cue matches any of its `at`)
const ALSO = {
  "the second edge": "rightmost edge",
  "more space being created": "not expanding into anything",
  "can ever affect us": "will never affect us",
  "that's the hubble sphere": "speed of light meets",   // rec67 (2026-11-11): the line after "rightmost edge" (cues resolve in order, so the alternative must come where the old phrase did, not at "the Hubble sphere is also growing"); "all about the speed of light" before it was cut (the author, 14:30)
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
  // the YouTube thumbnail (scripts/narration-poster.mjs, 2026-11-11): the triangle's apex, our universe on the
  // black-hole line at the horizon, the Hubble line, and the question the video opens with
  poster: { at: 3, cues: [{ t: 0, cam: { r: 26.9, m: 53.4, span: 8.5 }, dur: 0.1, drift: 0, hideIcons: null, forceIcons: [HS], hl: [
    { line: "triangle" },
    { ...SCHW, label: "the black-hole line", instant: true },
    { line: "hubble", label: "the Hubble line", instant: true },
    { obj: HS, label: "our universe", place: "above", labelSize: 26, instant: true },
    { text: "16 billion light-years\nin every direction", at: [26.3, 55.7], size: 22, color: "#e0e3f0", instant: true },
    { text: "the largest\nanything can be", at: [25.9, 58.5], size: 40, color: "#ffd54f", instant: true },
  ] }] },
  cues: [
    { at: "largest anything can be", cam: FULL, dur: 3, hl: [{ line: "triangle" }] },
    // (the label along the upper edge, mid-frame: on the outline it sat at the left corner, half off the frame, the author, 2026-11-11)
    { at: "every single object", hl: [{ line: "triangle" }, { line: "schwarzschild", labelOnly: true, label: "every object, by mass and size", labelAt: [0, 27.8] }] },
    // video 5's shots, the photo's pixels quicker so each step lands on "four", "nine", "or more" (the author), and
    // getting smaller inside a picture that keeps its size (the author, 2026-11-10: spreading out, they read as expanding)
    // (the photo the author's own pixelated Hubble Deep Field, 2026-11-11, 14:35: 200, 100, 50, 25, 12 and 6 px blocks,
    // then the original, each step one pixel into four, the grid's new lines sliding in to cut the pixels; the steps
    // land on "four", "nine" and "more", the rest follow quickly)
    ...V5.cues.slice(idx("the second edge"), idx("can never come out")).map(reword)
      .map(c => [].concat(c.at).includes("resolution of a photo") ? { ...c, hl: [{ pixels: { photos: ["hdf-pixels-200.png", "hdf-pixels-100.png", "hdf-pixels-50.png", "hdf-pixels-25.png", "hdf-pixels-12.png", "hdf-pixels-6.png", "hdf-pixels-1.jpg"], blocks: [200, 100, 50, 25, 12, 6, 1], steps: [2.2, 3.0, 3.8, 4.4, 4.9, 5.3] } }] } : c)
      // the cosmic event horizon's name over its disc: to the right it ran off the frame (the author, 2026-11-09, 1:29)
      .map(c => c.hl ? { ...c, hl: c.hl.map(q => q.mark && q.label === "cosmic event horizon" ? { ...q, place: "above", gap: 58 } : q) } : c),
    // the two horizons side by side (the author, 2026-11-11, 2:00: "instead of moving back and forth between the two
    // points, keep both the black hole (M87) and our universe in the screen and show arrows and labels"): M87* at the
    // bottom left, our universe at the top right, both on the black-hole line; light's arrows into the one and stopped
    // outside the other; then the singularity's + at M87*'s centre, and at ours an arrow that is not a centre but our
    // now, which the edge diagram's own "now" arrow takes over through the dive
    { at: "can never come out", cam: TWO, dur: 2.4, forceIcons: ["M87*", HS],
      hl: [SCHW, { obj: "M87*", label: "a black hole", place: "below" }, { obj: HS, label: "our universe", place: "above" },
        ...LIGHT_IN] },
    { at: ["can ever come in", "can never come in"],
      hl: [SCHW, { obj: "M87*", label: "a black hole", place: "below" }, { obj: HS, label: "our universe", place: "above" },
        ...LIGHT_IN, ...LIGHT_OUT] },
    // ("no coincidence" on our universe's left: above or to the right it ran off the frame, the author, 2026-11-11, 14:30)
    ...V5.cues.slice(idx("depend on the mass"), idx("no coincidence") + 1).map(reword)
      .map(c => c.hl ? { ...c, hl: c.hl.map(q => q.obj === HS && q.label === "no coincidence" ? { ...q, place: "left" } : q) } : c),
    { at: "object with a center", hl: [SCHW, { obj: HS, label: false },
      { x: [M87.r, M87.m], plus: true, size: 22, width: 4, color: "#ffd54f" },
      { arrow: true, solid: true, width: 3, color: "#ffd54f", from: { obj: "M87*", dx: 125, dy: -100 }, to: { obj: "M87*", dx: 12, dy: -10 }, label: "a singularity at the centre", labelPos: "start", draw: 0.8 }] },
    // the alien at our edge (the author's design, 2026-11-09; src/narr-diagrams.js drawEdge, the zoom's own objects):
    // dive into our universe; the turn stops and a galaxy at our edge is circled; their universe round it; our observable
    // universe grows round ours, reaching into theirs; its microwave background; and out to the chart
    // (the "now" arrow where the diagram draws its own: 0.62 and 1.035 of its sphere's 0.19 of the short side, left and up)
    { at: "our universe is just that", cam: { obj: "Our Universe", span: 0.35 }, dur: 2.6,
      hl: [{ arrow: true, solid: true, width: 2.5, color: "#80deea", from: { obj: HS, dx: -64, dy: -137 }, to: { obj: HS, dx: -10, dy: -12 }, label: "not the centre, just our now", labelPos: "start", draw: 0.8 }] },
    { at: "not the universe", hold: 60, forceIcons: null, hl: [{ edge: {} }] },
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
    // (grow 2.57: the diagram's sphere measured 462 px wide against the picture's 467 at 2.6, in the 540-px stage)
    { at: ["it's the observable universe", "the observable universe"], offset: 0, dolly: { obj: "Observable Universe", grow: 2.57, in: 0.01, out: 2.4 }, dur: 0 },
    // (the camera pulls out a little after the picture starts shrinking: its first moments swell the picture a little)
    { ...reword(V5.cues[idx("the only object")]), at: ["it's the observable universe", "the observable universe"], offset: 0.75, cam: { r: 28.2, m: 56.4, span: 5 }, dur: 2.6, explorer: undefined, hideObjects: [] },
  ],
};
