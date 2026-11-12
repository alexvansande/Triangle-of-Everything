// =============================================================
// Scene: short-05d-observable-universe — The Observable Universe, from Earth out: the author's rewrite of 5c (the
// script of 2026-11-11, recorded 2026-11-12 twice, rec71 and rec72, the cut from rec72: video/short-05d-observable-universe/). No chart: the whole take is
// the powers-of-ten zoom laid under the captions (`zoom`, src/narration.js), from Earth in the night sky outward, the
// age of the light we see at each step, to the cosmic event horizon and the oldest light. The zoom's own script is
// tools/powers-of-ten/timeline-05d.js in the zoom's checkout (video/zoom-takes.json): it takes its times from the
// marks below. Rendered only: the live player has the zoom only when it's given one (?zoom=<origin>); without it the
// chart holds on our universe.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

import V5 from "./short-05-hubble-sphere.js";

const HS = "Our Universe";
export default {
  ...V5,
  title: "The Observable Universe",
  blurb: "The sky you see is younger than you think: the Moon a second ago, the Sun eight minutes, the far side of Laniakea in the time of the dinosaurs, out to the oldest light there is.",
  start: { obj: HS, span: 8 },
  explorer: undefined,      // video 5's spectrum explorer: not in this part
  zoom: { timeline: "05d" },
  // the whoosh as the universe opens out past the observable one ("infinite", the author, 2026-11-12: "add some sort
  // of subtle whoosh or womp sound here")
  sound: [{ at: "infinite", fx: "whoosh" }],
  cues: [
    // the zoom from the first word (Earth in the night sky, the zoom's script opens on it)
    { at: ["everyone knows", "most people know"], offset: 0, cam: { obj: HS, span: 8 }, dur: 0.01, clear: true, hl: [], zoom: { show: true, fade: 0.01, mark: "earth" } },
    // the marks the zoom's script keys its moves to: each the first word of the thing named
    { at: "the moon", offset: 0, zoom: { mark: "moon" } },
    { at: "leaving the sun", offset: 0, zoom: { mark: "sun" } },
    { at: "light from mars", offset: 0, zoom: { mark: "planets" } },
    { at: "see jupiter", offset: 0, zoom: { mark: "jupiter" } },
    { at: ["nearby stars", "nearest stars"], offset: 0, zoom: { mark: "stars" } },
    { at: "most of the others", offset: 0, zoom: { mark: "farstars" } },
    { at: "other side of the galaxy", offset: 0, zoom: { mark: "galaxy" } },
    { at: "andromeda", offset: 0, zoom: { mark: "andromeda" } },
    { at: ["supercluster of galaxies", "far side of laniakea"], offset: 0, zoom: { mark: "laniakea" } },
    { at: "look further down", offset: 0, zoom: { mark: "past" } },
    { at: "space expands so fast", offset: 0, zoom: { mark: "horizon" } },
    { at: "still see their past", offset: 0, zoom: { mark: "obs" } },
    { at: "this is the observable universe", offset: 0, zoom: { mark: "observable" } },
    { at: "infinite", offset: 0, zoom: { mark: "infinite" } },
    { at: "history", offset: 0, zoom: { mark: "history" } },
    { at: "faint microwave radiation", offset: 0, zoom: { mark: "cmb" } },
  ],
};
