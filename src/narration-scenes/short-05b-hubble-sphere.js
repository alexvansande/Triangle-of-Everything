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
  cues: [
    { at: "largest anything can be", cam: FULL, dur: 3, hl: [{ line: "triangle" }] },
    { at: "every single object", hl: [{ line: "triangle", label: "every object, by mass and size" }] },
    ...V5.cues.slice(idx("the second edge"), idx("we also see them") + 1).map(reword),
    // the hand-off to part 3: the one thing outside the triangle
    { ...reword(V5.cues[idx("the only object")]), hideObjects: [] },
  ],
};
