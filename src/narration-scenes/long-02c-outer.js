// =============================================================
// Scene: long-02c-outer — The Outer Limit (long video 2, part two) from its own recording (rec80, 2026-11-27,
// video/long-02c-outer/edl.py; notes and fact check video/sources/2026-11-27/NOTES.md). A new intro (the map, its
// stories, the density diagonal, the dead stars, the upper limit, then off to the right), then long-02b-right's shots
// (rec76's: the emptier and emptier space, the cosmic event horizon, the observable universe's zoom), keyed to this
// take's words.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

import R from "./long-02b-right.js";

// this take's wording where it differs from rec76's (a cue matches any of its `at`; this take's words first)
const ALIAS = {
  "leaving the sun": ["the sun emitted"],
  "light from mars": ["reach mars", "bounce back"],
  "jupiter is just": ["jupiter just"],
  "still see their past": ["we can see their past"],
  "any bigger than that": ["can you get bigger"],
  "could never reach us": ["can't reach us"],
  "both are an horizon": ["both are on a horizon"],
};
const alias = (c) => { const at = [].concat(c.at ?? []); const x = at.flatMap(a => ALIAS[a] ?? []); return x.length ? { ...c, at: [...x, ...at] } : c; };
const has = (c, at) => [].concat(c.at).includes(at);

// the intro: one slow glide over the chart, the diagonal, the dead stars and the black-hole line, then right to the stars
const INTRO = [
  { t: 0, cam: { r: 7.0, m: 21.0, span: 32 }, dur: 0.05, hl: [] },
  { at: "every single object", cam: { r: 6.6, m: 20.0, span: 27, glide: true }, hl: [] },
  { at: "mass and size", units: true, hl: [{ line: "triangle", draw: 1.6 }] },
  { at: "density graph", units: false, cam: { r: 6.2, m: 19.0, span: 25, glide: true }, hl: [] },
  { at: "density diagonal", cam: { r: 4.6, m: 13.5, span: 20, glide: true }, clear: true, hl: [{ line: "water", label: "ordinary matter" }] },
  { at: "dense objects", cam: { r: 8.2, m: 32.2, span: 12, glide: true }, clear: true,
    hl: [{ obj: "White Dwarf", label: "white dwarfs" }, { obj: "PSR J0740+6620", label: "neutron stars", delay: 0.5 }] },
  { at: "limited on the top", cam: { r: 7.6, m: 34.2, span: 14, glide: true }, clear: true,
    hl: [{ line: "schwarzschild", label: "the upper limit" }, { obj: "Stellar BH", label: false, delay: 0.6 }] },
  { at: "nothing can exist", hl: [{ line: "schwarzschild", label: "the upper limit", draw: 0.01 }, { side: "left", of: "schwarzschild", label: "nothing can exist\nabove this", labelX: 0.2, labelY: 0.3 }] },
  { at: "moving to the right", cam: { r: 12.6, m: 34.0, span: 15, glide: true }, dur: 5, clear: true, hl: [] },
];

export default {
  ...R,
  title: "The Triangle of Everything: The Outer Limit",
  blurb: "The bigger something is, the less dense it is: nebulae, galaxies, clusters and voids, up to where the expansion meets the speed of light; the cosmic event horizon, and the observable universe outside the triangle.",
  start: { r: 7.0, m: 21.0, span: 32 },
  captionFixes: { ...R.captionFixes },
  cues: [
    ...INTRO,
    // rec76's opening (the nebulae remembered) isn't in this take: its shots start at the massive objects
    ...R.cues.filter(c => !has(c, "remember the supernova") && ![].concat(c.at).includes("far right on our map")).map(alias),
  ],
};
