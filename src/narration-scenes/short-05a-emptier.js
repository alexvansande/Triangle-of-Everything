// =============================================================
// Scene: short-05a-emptier — The Largest Structures in Space, video 5's part 1, as a take of its own (the author's
// recording of 2026-11-11, rec66, re-recorded whole: video/short-05a-emptier/). The density lines (water's), denser to
// the left, emptier to the right: stars less dense than water and air, red giants and nebulae, then video 5's slow pan
// up from the globular clusters past the galaxies ("here we find home"), clusters and superclusters to the voids, and the
// rightmost edge ahead, where the expansion of the universe meets the speed of light.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

import V5 from "./short-05-hubble-sphere.js";

const NAMED = (n, label, more = {}) => ({ obj: n, ...(label === undefined ? {} : { label }), ...more });

export default {
  ...V5,
  title: "The Largest Structures in Space",
  blurb: "The bigger something is, the less dense it is: stars, nebulae, galaxies, clusters, superclusters and voids, up to the chart's rightmost edge.",
  start: { r: 3, m: 9, span: 56 },
  sound: [],
  // the galaxies and clusters 20% smaller (the author, 2026-11-09)
  iconBoost: { from: 19.5, k: 0.8 },

  cues: [
    // the chart, and every diagonal a density (water's marked)
    { at: "exploring this chart", offset: -0.4, cam: { obj: "Human", span: 26 }, dur: 8, drift: 0.02 },
    { at: "mass and size", hl: [{ line: "triangle" }] },
    { at: "density line", cam: { r: 6, m: 20, span: 30 }, dur: 2.5, clear: true, hl: [{ density: 0, label: "a density" }] },
    { at: "density of water", hl: [{ density: 0, label: "the density of water" }, { obj: "Human", label: false }] },
    // denser to the left
    { at: "denser and denser", cam: { r: 7.9, m: 32.4, span: 10.5 }, dur: 2.4, clear: true, hl: [{ density: 0 }] },
    // each with its own density line, further left (the author, 2026-11-10: "show other density lines … that match
    // the denser brown dwarf, the denser white dwarf, the denser neutron star"), the camera panning left with them;
    // log g/cm³ from each one's mass and size in objects.json
    { at: "brown dwarfs", cam: { r: 8.4, m: 32.2, span: 10.5 }, dur: 1.2,
      hl: [{ density: 0 }, { density: 1.46, label: "~30× water", delay: 0.1 }, NAMED("T Brown Dwarf", "brown dwarfs", { place: "left", delay: 0.3 })] },
    { at: "white dwarfs", cam: { r: 7.6, m: 32.6, span: 10.5 }, dur: 1.2,
      hl: [{ density: 0 }, { density: 1.46 }, { density: 5.98, label: "~1 tonne per cm³", delay: 0.1 }, NAMED("T Brown Dwarf", false), NAMED("White Dwarf", "white dwarfs", { place: "above", delay: 0.3 })] },
    { at: "neutron stars", cam: { r: 6.8, m: 33, span: 10.5 }, dur: 1.2,
      hl: [{ density: 0 }, { density: 1.46 }, { density: 5.98 }, { density: 14.53, label: "~300 million tonnes per cm³", delay: 0.1 }, NAMED("White Dwarf", false), NAMED("PSR J0030+0451", "neutron stars", { place: "left", delay: 0.3 })] },
    // today: the largest; emptier to the right
    // (water's line stays through the zoom out, not drawn again: the author, 2026-11-11, "you don't need to reanimate the
    // density lines you've already animated")
    { at: "largest objects", cam: { r: 18, m: 39, span: 22 }, dur: 3, hl: [{ density: 0 }] },
    { at: "emptier and emptier", hl: [{ density: 0 }, { density: -24, label: "a galaxy · ~1 atom per cm³", delay: 0.3 }] },
    // stars: lots of them less dense than water, giants less dense than air
    // (from "lots of stars", the water line named as the camera arrives, and then air's: the author, 2026-11-10)
    { at: ["lots of stars", "lot of stars"], cam: { r: 11.6, m: 33.6, span: 6 }, dur: 2.4,
      hl: [{ density: 0, label: "density of water" }, NAMED("Sirius A", "Sirius", { place: "right", delay: 1.2 }), NAMED("Vega", false, { delay: 1.4 })] },
    { at: ["even less dense than air", "less dense than air"], hl: [{ density: 0, label: "density of water" }, { density: -2.92, label: "density of air", delay: 0.1 }, NAMED("Sirius A", false), NAMED("Betelgeuse", "giants", { place: "left", delay: 0.5 })] },
    { at: ["red giant", "supergiant", "super giant"], cam: { r: 13.4, m: 33.8, span: 7 }, dur: 2, clear: true, hl: [NAMED("Sun", undefined, { place: "left" }), NAMED("Red Giant", "red giant", { delay: 0.5 })] },
    // the nebula on "nebula" (the author, 2026-11-11: it waited for "supernova remnant"), the remnant when it's named
    { at: ["into a nebula", "nebula"], cam: { r: 16, m: 34, span: 9 }, dur: 2.4,
      hl: [NAMED("Red Giant", false), NAMED("Planetary Nebula", "a nebula")] },
    { at: "supernova remnant", hl: [NAMED("Red Giant", false), NAMED("Planetary Nebula", "a nebula"), NAMED("Crab Nebula", "supernova remnant")] },
    { at: "atmosphere of the moon", hl: [NAMED("Planetary Nebula", false), NAMED("Crab Nebula", "emptier than the Moon's air")] },
    // up the line of emptiness: video 5's slow pan, from the globular clusters to the voids
    { at: "globular clusters", cam: { r: 19.6, m: 37.6, span: 4, glide: true }, dur: 2, clear: true, density: 118,
      hl: [{ obj: "Globular Cluster" }, { obj: "Dwarf Galaxy", label: "small galaxies", delay: 0.5 }] },
    // (the Whirlpool, right beside the Milky Way, keeps its picture off through the galaxies: at "local group" its companion
    // galaxy read as a blob beside home, the author, 2026-11-11, 1:10)
    { at: ["a galaxy is really", "a galaxy is", "between its stars"], cam: { r: 21.6, m: 41.4, span: 4, glide: true }, forceIcons: ["Milky Way"], hideIcons: ["Whirlpool", "NGC5194", "Whirlpool Galaxy"], hl: [{ obj: "Milky Way", label: "~1 atom per cm³" }] },   // the glide to the Milky Way starts as the galaxy's emptiness is described (rec66: "…because a galaxy is really mostly the empty space between the stars")
    // "here we find home: that's the Milky Way, and Andromeda, our sister galaxy" (the author's rewrite, rec66)
    { at: ["find home", "we find home"], hl: [{ obj: "Milky Way", label: "home" }] },
    { at: "andromeda", cam: { r: 22.5, m: 44.0, span: 4, glide: true }, forceIcons: ["Milky Way", "Andromeda (M31)"], hl: [{ obj: "Milky Way", label: "home" }, { obj: "Andromeda (M31)", label: "our sister galaxy", delay: 0.2 }] },   // the Milky Way's picture is forced from the glide to "home" (the Whirlpool's would take its room), and Andromeda's with it from here (lifting the force gave the Whirlpool the room: the blob at 1:10)
    { at: "local group", hl: [{ obj: "Milky Way", label: false }, { obj: "Andromeda (M31)", label: "local group" }] },
    { at: "galaxy clusters", cam: { r: 23.8, m: 46.4, span: 4, glide: true }, forceIcons: null, hideIcons: null, hl: [{ obj: "Bullet Cluster", label: "emptier still" }] },
    { at: "between them", hl: [{ obj: "Bullet Cluster", label: "Bullet Cluster" }] },
    { at: ["super clusters", "superclusters"], cam: { r: 25.5, m: 48.3, span: 4, glide: true }, hl: [{ obj: "Laniakea", label: "superclusters" }] },
    { at: "laniakea", hl: [{ obj: "Laniakea", label: "Laniakea · 100,000 galaxies" }] },
    { at: "voids", cam: { r: 26.3, m: 49.6, span: 4, glide: true }, hl: [{ obj: "Laniakea", label: false }, { obj: "Boötes Void", label: "voids" }, { obj: "KBC Void", label: false, delay: 0.4 }] },
    { at: "not completely empty", hl: [{ obj: "Boötes Void", label: "emptier than average" }, { obj: "KBC Void", label: false }] },
    // the edge ahead: "a rightmost limit in our chart… where the expansion of the universe meets the speed of light"
    // (rec66; rec62 said "our second edge in the triangle of everything")
    { at: ["any bigger than that", "any bigger"], cam: { r: 26.8, m: 51.0, span: 4.3, glide: true } },
    { at: ["second edge", "rightmost limit"], cam: { r: 25, m: 51, span: 16 }, dur: 3, clear: true, density: null, hl: [{ line: "horizon", label: "the rightmost edge" }] },
    { at: "speed of light", hl: [{ line: "horizon", label: "where expansion meets the speed of light" }] },
  ],
};
