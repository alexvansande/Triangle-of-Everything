// =============================================================
// Scene: short-03-planets — up the water line: the blue whale and the
// sequoia, man-made things and asteroids, round worlds, atmospheres, gas
// giants, and Earth in between. Recorded 2026-10-07 (video/short-03-planets/).
// =============================================================
// Field reference: see the top of ./tour.js.

const FULL = { r: -2.2, m: -4.8, span: 74 };

export default {
  title: "Up the line",
  blurb: "From whales to round worlds, atmospheres and gas giants.",
  start: { r: 2.5, m: 7, span: 12 },
  captionFixes: { short: "chart", celadus: "Enceladus", celagos: "Enceladus" },

  cues: [
    { at: "move up the line", cam: { r: 2.6, m: 7.2, span: 9 }, hl: [{ line: "water" }] },
    { at: "the blue whale", cam: { obj: "Blue Whale", span: 4 }, hl: [{ obj: "Blue Whale" }] },
    { at: "sequoia tree", cam: { obj: "Sequoia", span: 4 }, hl: [{ obj: "Blue Whale", place: "left" }, { obj: "Sequoia" }] },
    { at: "man made structures", cam: { r: 4.6, m: 13.5, span: 8 },
      hl: [{ obj: "Great Pyramid", place: "left" }, { obj: "Supertanker", delay: 0.4 }] },
    { at: "small asteroids", hl: [{ obj: "Great Pyramid", place: "left" }, { obj: "Supertanker" }, { obj: "Bennu", delay: 0.2 }] },
    { at: "asteroids and moons", cam: { r: 6, m: 18.5, span: 9 }, clear: true },
    { at: "rounder and rounder", cam: { r: 7.3, m: 22.6, span: 6 } },
    { at: "look at hyperion", hl: [{ obj: "Hyperion", place: "left" }] },
    { at: "mimas", hl: [{ obj: "Hyperion", place: "left" }, { obj: "Mimas" }] },
    { at: ["enceladus", "celadus", "celagos"], hl: [{ obj: "Hyperion", place: "left" }, { obj: "Mimas" }, { obj: "Enceladus", place: "left" }] },
    { at: "vesta", hl: [{ obj: "Hyperion", place: "left" }, { obj: "Mimas" }, { obj: "Vesta" }] },
    { at: "ceres", cam: { r: 7.6, m: 23.8, span: 6 }, hl: [{ obj: "Mimas" }, { obj: "Vesta" }, { obj: "Ceres", place: "left" }] },
    { at: "reach pluto", cam: { obj: "Pluto", span: 4 }, hl: [{ obj: "Pluto", label: "Pluto · round" }] },
    { at: "gravity overcomes", cam: { r: 7.6, m: 23.8, span: 6 }, hl: [{ obj: "Mimas" }, { obj: "Ceres" }, { obj: "Pluto" }] },
    { at: "become round", hl: [{ obj: "Mimas", label: "round" }, { obj: "Ceres" }, { obj: "Pluto" }] },

    { at: "having an atmosphere", cam: { r: 8.6, m: 27.1, span: 3.4 }, clear: true },
    { at: "mercury and the moon", hl: [{ obj: "Mercury", label: "Mercury · none", place: "left" }, { obj: "Moon", label: "Moon · none", place: "left" }] },
    { at: "mars has one", hl: [{ obj: "Mercury", label: "Mercury", place: "left" }, { obj: "Mars", label: "Mars · thin" }] },
    { at: "venus and earth", hl: [{ obj: "Mars" }, { obj: "Venus", place: "left" }, { obj: "Earth", delay: 0.5 }] },
    { at: "gas giants", cam: { r: 9.45, m: 29.3, span: 4 },
      hl: [{ obj: "Kepler-22b", label: "super-Earth", place: "left" }, { obj: "Neptune", delay: 0.3 }, { obj: "Saturn", delay: 0.6 }, { obj: "Jupiter", delay: 0.9 }] },
    { at: "hydrogen just cannot escape", hl: [{ obj: "Saturn", place: "left" }, { obj: "Jupiter" }] },
    { at: "earth is really in this thin line", cam: { r: 9.1, m: 28.6, span: 4.6 },
      hl: [{ obj: "Earth", label: "Earth", place: "left" }, { obj: "Mars", delay: 0.6 }, { obj: "Neptune", delay: 1.2 }] },
    { at: "something else start", cam: { r: 10.2, m: 31.2, span: 6 }, drift: 0.04, clear: true },
  ],
};
