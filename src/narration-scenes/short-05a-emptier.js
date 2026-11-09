// =============================================================
// Scene: short-05a-emptier — The Largest Structures in Space, video 5's part 1, as a take of its own (the author's
// recording of 2026-11-09, rec62: video/short-05a-emptier/). The density lines (water's), denser to the left, emptier
// to the right: stars less dense than water and air, red giants and nebulae, then video 5's slow pan up from the
// globular clusters past the galaxies, clusters and superclusters to the voids, and the second edge ahead.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

import V5 from "./short-05-hubble-sphere.js";

const NAMED = (n, label, more = {}) => ({ obj: n, ...(label === undefined ? {} : { label }), ...more });

export default {
  ...V5,
  title: "The Largest Structures in Space",
  blurb: "The bigger something is, the less dense it is: stars, nebulae, galaxies, clusters, superclusters and voids, up to the second edge of the triangle.",
  start: { r: 3, m: 9, span: 56 },
  sound: [],
  cues: [
    // the chart, and every diagonal a density (water's marked)
    { at: "exploring this chart", offset: -0.4, cam: { obj: "Human", span: 26 }, dur: 8, drift: 0.02 },
    { at: "mass and size", hl: [{ line: "triangle" }] },
    { at: "density line", cam: { r: 6, m: 20, span: 30 }, dur: 2.5, clear: true, hl: [{ density: 0, label: "a density" }] },
    { at: "density of water", hl: [{ density: 0, label: "the density of water" }, { obj: "Human", label: false }] },
    // denser to the left
    { at: "denser and denser", cam: { r: 7.9, m: 32.4, span: 10.5 }, dur: 2.4, clear: true, hl: [{ density: 0 }] },
    { at: "brown dwarfs", hl: [{ density: 0 }, NAMED("T Brown Dwarf", "brown dwarfs", { place: "right" })] },
    { at: "white dwarfs", hl: [{ density: 0 }, NAMED("T Brown Dwarf", false), NAMED("White Dwarf", "white dwarfs", { place: "above" })] },
    { at: "neutron stars", hl: [{ density: 0 }, NAMED("White Dwarf", false), NAMED("PSR J0030+0451", "neutron stars", { place: "left" })] },
    // today: the largest; emptier to the right
    { at: "largest objects", cam: { r: 18, m: 39, span: 22 }, dur: 3, clear: true },
    { at: "emptier and emptier", hl: [{ density: 0 }, { density: -24, label: "a galaxy · ~1 atom per cm³", delay: 0.3 }] },
    // stars: lots of them less dense than water, giants less dense than air
    { at: "less dense than water", cam: { r: 11.6, m: 33.6, span: 6 }, dur: 2.4, clear: true,
      hl: [{ density: 0, label: "water" }, NAMED("Sirius A", "Sirius", { place: "right" }), NAMED("Vega", false, { delay: 0.3 })] },
    { at: "less dense than air", hl: [{ density: 0, label: "water" }, { density: -2.92, label: "air", delay: 0.2 }, NAMED("Betelgeuse", "giants", { place: "left", delay: 0.4 })] },
    { at: "red giant", cam: { r: 13.4, m: 33.8, span: 7 }, dur: 2, clear: true, hl: [NAMED("Sun", undefined, { place: "left" }), NAMED("Red Giant", "red giant", { delay: 0.5 })] },
    { at: ["nebula or a supernova remnant", "supernova remnant"], cam: { r: 16, m: 34, span: 9 }, dur: 2.4,
      hl: [NAMED("Red Giant", false), NAMED("Planetary Nebula", "a nebula"), NAMED("Crab Nebula", "supernova remnant", { delay: 0.6 })] },
    { at: "atmosphere of the moon", hl: [NAMED("Planetary Nebula", false), NAMED("Crab Nebula", "emptier than the Moon's air")] },
    // up the line of emptiness: video 5's slow pan, from the globular clusters to the voids
    { at: "globular clusters", cam: { r: 19.6, m: 37.6, span: 4, glide: true }, dur: 2, clear: true, density: 118,
      hl: [{ obj: "Globular Cluster" }, { obj: "Dwarf Galaxy", label: "small galaxies", delay: 0.5 }] },
    { at: "between its stars", cam: { r: 21.6, m: 41.4, span: 4, glide: true }, hl: [{ obj: "Milky Way", label: "~1 atom per cm³" }] },
    { at: "andromeda", cam: { r: 22.5, m: 44.0, span: 4, glide: true }, hl: [{ obj: "Andromeda (M31)" }, { obj: "Milky Way", delay: 0.6 }] },
    { at: "local group", hl: [{ obj: "Milky Way", label: false }, { obj: "Andromeda (M31)", label: "local group" }] },
    { at: "galaxy clusters", cam: { r: 23.8, m: 46.4, span: 4, glide: true }, hl: [{ obj: "Bullet Cluster", label: "emptier still" }] },
    { at: "between them", hl: [{ obj: "Bullet Cluster", label: "Bullet Cluster" }] },
    { at: ["super clusters", "superclusters"], cam: { r: 25.5, m: 48.3, span: 4, glide: true }, hl: [{ obj: "Laniakea", label: "superclusters" }] },
    { at: "laniakea", hl: [{ obj: "Laniakea", label: "Laniakea · 100,000 galaxies" }] },
    { at: "voids", cam: { r: 26.3, m: 49.6, span: 4, glide: true }, hl: [{ obj: "Laniakea", label: false }, { obj: "Boötes Void", label: "voids" }, { obj: "KBC Void", label: false, delay: 0.4 }] },
    { at: "not completely empty", hl: [{ obj: "Boötes Void", label: "emptier than average" }, { obj: "KBC Void", label: false }] },
    // the edge ahead
    { at: "any bigger than that", cam: { r: 26.8, m: 51.0, span: 4.3, glide: true } },
    { at: "second edge", cam: { r: 25, m: 51, span: 16 }, dur: 3, clear: true, density: null, hl: [{ line: "horizon", label: "the second edge" }] },
  ],
};
