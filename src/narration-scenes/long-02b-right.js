// =============================================================
// Scene: long-02b-right — long video 2 (space), the right of the chart, from the author's second take of the new script
// (rec76, 2026-11-18, part two of the session: video/long-02b-right/, the fact check video/sources/2026-11-18/NOTES.md).
// The nebulae and remnants remembered, then the Largest Structures' shots (emptier and emptier space up to the
// rightmost limit), the Cosmic Event Horizon's (the speed of light, the photo's resolution, the Hubble line and the
// event horizon, the mass inside on the black-hole line, the alien at our edge, the observable universe outside the
// triangle) and the Observable Universe's zoom (the light's ages from the Moon out to the oldest light), each keyed to
// this take's words.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

import S5A from "./short-05a-emptier.js";
import S5B from "./short-05b-hubble-sphere.js";
import S5D from "./short-05d-observable-universe.js";

// this take's wording where it differs from the Shorts' (a cue matches any of its `at`)
const ALIAS = {
  "largest objects": ["massive objects"],
  "lots of stars": ["a lot of the stars"],
  "into a nebula": ["drift off into"],
  "super clusters": ["supper clusters"],
  "the second edge": ["rightmost limit"],
  "that's the hubble sphere": ["meets the speed of light"],
  "speed limit": ["speed of limit"],
  "right on the black hole line": ["the black hole line"],
  "kind of a horizon": ["both are an horizon"],
  "object with a center": ["a definite center"],
  "but let's imagine": ["imagine for a moment"],
  "centered around them": ["center around them"],
  "supernova remnant": ["explodes a supernova", "supernova"],
  "rightmost limit": ["right most limit"],
  "it's time we meet": ["yet another third horizon"],
  "everyone knows": ["you certainly know"],
  "leaving the sun": ["the light from mars", "the light from morse"],
  "light from mars": ["inner planet", "less than a half an hour"],
  "supercluster of galaxies": ["here we see laniakea"],
  "look further down": ["look further away"],
  "this is the observable universe": ["finally reach the observable universe"],
};
const alias = (c) => { const at = [].concat(c.at ?? []); const x = at.flatMap(a => ALIAS[a] ?? []); return x.length ? { ...c, at: [...x, ...at] } : c; };   // (this take's words first: an old phrase can match later on)
const has = (c, at) => [].concat(c.at).includes(at);
const from = (cues, at) => cues.slice(cues.findIndex(c => has(c, at)));

export default {
  ...S5B,
  title: "The Triangle of Everything: space (the right of the chart)",
  blurb: "The bigger something is, the less dense it is: nebulae, galaxies, clusters and voids, up to where the expansion meets the speed of light; the cosmic event horizon, and the observable universe outside the triangle.",
  // the stars' corner, where the long video's dead stars left off
  start: { r: 12.6, m: 34, span: 15 },
  poster: undefined,
  explorer: undefined,
  iconBoost: { from: 19.5, k: 0.8 },
  zoom: S5D.zoom,
  sound: S5D.sound,
  captionFixes: { ...S5B.captionFixes, ebola: "nebula", supper: "super" },
  cues: [
    // the nebulae and remnants the dying stars left, all to the right
    { at: "remember the supernova", cam: { r: 15.2, m: 34.6, span: 12 }, dur: 3, clear: true,
      hl: [{ obj: "Planetary Nebula", label: "nebulae" }, { obj: "Crab Nebula", label: "supernova remnants", delay: 0.6 }] },
    { at: "far right on our map", alts: true, hl: [{ obj: "Planetary Nebula", label: false }, { obj: "Crab Nebula", label: false }] },
    // (its rightmost edge keeps our universe's dot hidden, as the Cosmic Event Horizon's own edge shot did: that one and
    // its "that's the Hubble sphere" fall on the same words here, so they're left out below)
    ...from(S5A.cues, "largest objects").map(alias).map(c => has(c, "second edge") ? { ...c, hideIcons: ["Our Universe"] } : c),
    // the Cosmic Event Horizon from the speed of light on (its opening, the largest anything can be, is 5a's here)
    // (the photo's pixels measured: a galaxy near the middle of the Hubble Deep Field and two neighbours, the author's
    // note, rec76 5:04)
    ...S5B.cues.slice(2).filter(c => !has(c, "the second edge") && !has(c, "that's the hubble sphere")).map(alias).map(c => c.hl?.some(q => q.pixels?.photos)
      ? { ...c, hl: c.hl.map(q => q.pixels?.photos ? { ...q, pixels: { ...q.pixels, measure: { from: [618, 736], to: [[279, 574], [1317, 983]] } } } : q) } : c),
    // the Observable Universe's zoom, from the night sky out
    ...S5D.cues.map(alias),
  ].map(c => c.alts ? { ...c, alts: undefined, at: ["for the right on our map", "far right on our map", "right on our map"] } : c),
};
