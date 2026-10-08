// =============================================================
// Scene: short-04-stars — planets and stars differ by mass: the left turn,
// brown dwarfs, the main sequence, the life of a star, its remnant, and
// the first side of the triangle. Recorded 2026-10-07 (video/short-04-stars/).
// =============================================================
// Field reference: see the top of ./tour.js.

const FULL = { r: -2.2, m: -4.8, span: 74 };

export default {
  title: "Planets into stars",
  blurb: "Brown dwarfs, the main sequence, the life of a star, and the first side.",
  start: { r: 10.4, m: 31.6, span: 6 },
  captionFixes: { short: "chart", spread: "red", nebulae: "nebula" },

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md)
  backing: "Immersed",
  sound: [
    { at: "once they start generating fusion", fx: "ignite", offset: 0.6 },
    { at: "the life cycle of a star", music: "heartbeat", to: "go boom", stop: "cut" },
    { at: "go boom", fx: "boom", offset: 0.25 },
    { at: "becomes a black hole", fx: "drop", atEnd: true, offset: -0.4 },
  ],

  cues: [
    { at: "completely different things", cam: { r: 10.4, m: 31.6, span: 5 },
      hl: [{ obj: "Jupiter", label: "planet", place: "left" }, { obj: "Sun", label: "star", delay: 0.6 }] },
    { at: "evolve into each other", cam: { r: 11, m: 33, span: 14 }, drift: 0.03,
      hl: [{ obj: "Jupiter", place: "left" }, { obj: "Sun" }, { obj: "Red Giant", delay: 0.4 }, { obj: "White Dwarf", delay: 0.8, place: "left" }] },
    { at: "mostly about mass", cam: { r: 10.4, m: 31.6, span: 5 },
      hl: [{ obj: "Jupiter", label: "planet", place: "left" }, { obj: "Sun", label: "star" }] },
    { at: "sharp left turn", cam: { r: 10, m: 30.6, span: 4.4 },
      hl: [{ line: "water" }, { obj: "Saturn", place: "left" }, { obj: "Jupiter", delay: 0.4 }, { obj: "Y Brown Dwarf", label: "brown dwarfs", delay: 0.8 }] },
    { at: "degenerate matter", hl: [{ obj: "Jupiter", place: "left" }, { obj: "Y Brown Dwarf", label: false },
      { obj: "T Brown Dwarf", label: false }, { obj: "L Brown Dwarf", label: "degenerate cores" }] },
    { at: "called brown dwarfs", cam: { r: 10, m: 31.4, span: 3.6 },
      hl: [{ obj: "Jupiter", place: "left" }, { obj: "Y Brown Dwarf", label: false }, { obj: "T Brown Dwarf", label: false },
           { obj: "L Brown Dwarf", label: "brown dwarfs" }, { obj: "Proxima Cen", label: "tiny star", delay: 0.8 }] },
    { at: "generating fusion", cam: { r: 10.6, m: 32.8, span: 4 }, hl: [{ obj: "Proxima Cen" }, { obj: "Sun", delay: 0.6 }] },
    { at: "other diagonal line", cam: { r: 11, m: 33.5, span: 7 },
      hl: [{ obj: "Sun" }, { line: "mainsequence", label: "main sequence" }] },
    { at: "almost every star", hl: [{ line: "mainsequence", label: "main sequence" }, { obj: "Sirius A", delay: 0.3 }, { obj: "Vega", delay: 0.6 }] },

    { at: "life cycle of a star", cam: { r: 12.4, m: 33.7, span: 9 }, hl: [{ obj: "Sun" }] },
    // expand and collapse: the Sun swings toward the red giants and back, further each time
    { at: "sustain that expansion", hold: 25,
      hl: [{ swing: [{ obj: "Sun" }, { obj: "Red Giant" }], period: 2.4 }] },
    { at: "red giant", cam: { r: 12.6, m: 33.8, span: 7 },
      hl: [{ obj: "Sun" }, { arrow: true, from: { obj: "Sun" }, to: { obj: "Red Giant" } }, { obj: "Red Giant", delay: 1 }] },
    { at: "red supergiant", hl: [{ obj: "Red Giant" }, { obj: "Red Supergiant", delay: 0.2 }] },
    { at: "become a supernova", cam: { r: 15.8, m: 34, span: 12 }, dur: 1.4,
      hl: [{ arrow: true, from: { obj: "Red Supergiant" }, to: { obj: "Supernova Remnant" }, color: "#ff8a65" }, { obj: "Supernova Remnant", delay: 0.8 }] },
    { at: "split in two", cam: { r: 12.5, m: 33.8, span: 17 }, hl: [{ obj: "Supernova Remnant", label: "outer layers · nebula", place: "left" }] },
    { at: "very dense object", hl: [{ obj: "Supernova Remnant", label: "outer layers", place: "left" }, { obj: "Neutron Star", label: "dense core", place: "right" }] },
    { at: "neutron star", cam: { r: 7.5, m: 33.8, span: 9 }, hl: [{ obj: "Neutron Star", place: "left" }] },
    { at: "becomes a black hole", hl: [{ obj: "Neutron Star", place: "left" }, { obj: "Stellar BH", place: "left", label: "black hole" }] },
    { at: "first side of our triangle", cam: FULL, dur: 3, hl: [{ line: "schwarzschild", label: "side 1 · black holes" }] },
    { at: "for every object", cam: { r: 5, m: 28, span: 16 }, hl: [{ line: "schwarzschild" }, { obj: "Earth" }] },
    { at: "compressed enough", hl: [{ line: "schwarzschild" }, { obj: "Earth" },
      { arrow: true, from: { obj: "Earth" }, to: { r: -0.05, m: 27.78, mark: true }, label: "squeeze to 9 mm" }] },
    { at: "schwarzschild radius", cam: { r: 4, m: 31, span: 24 }, hl: [{ line: "schwarzschild", label: "schwarzschild radius" }] },
    { at: "one to one slope", hl: [{ line: "schwarzschild", label: "1 : 1 · 45°" }] },
  ],
};
