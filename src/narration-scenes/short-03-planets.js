// =============================================================
// Scene: short-03-planets — up the line from humans to brown dwarfs: rocks
// and animals either side of it, the whale and the sequoia, man-made things
// and mountains, round worlds, atmospheres, gas giants and Earth between them,
// Saturn floating, the turn to degenerate matter, and the brown dwarfs.
// Recorded 2026-10-19 (rec12; video/short-03-planets/).
// =============================================================
// Field reference: see the top of ./tour.js.

const FULL = { r: -2.2, m: -4.8, span: 74 };

export default {
  title: "Up the line",
  blurb: "From humans to round worlds, gas giants and brown dwarfs.",
  start: FULL,
  captionFixes: { flow: "float", dressed: "drastic" },

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md)
  backing: "Soaring",
  sound: [
    { at: "start acquiring an atmosphere", fx: "wind", offset: 0.4 },
    { at: "hydrogen does not escape", fx: "hiss" },
    { at: "would float in water", fx: "bubble", offset: 0.3 },
  ],

  cues: [
    // intro (rec13): diagonals are densities, the blue one is water, sink or float; then rec12
    { at: "diagonal lines represent density", cam: { r: 2, m: 6, span: 44 }, dur: 3 },
    { at: "density of water", hl: [{ line: "water", label: "density of water" }] },
    { at: "made of atoms", hl: [{ line: "water" }] },
    { at: "to the left will sink", hl: [{ line: "water" }, { side: "left", label: "sinks" }] },
    { at: "to the right will", hl: [{ line: "water" }, { side: "left", label: "sinks" }, { side: "right", label: "floats" }] },
    { at: "the human scale", cam: { r: 2.4, m: 6.6, span: 12 }, hl: [{ line: "water" }, { obj: "Human" }] },
    { at: "meteorites and rocks", hl: [{ line: "water" }, { side: "left", label: "rocks · sink" }] },
    { at: "actually animals", hl: [{ line: "water" }, { side: "left", label: "rocks · sink" }, { side: "right", label: "animals · float" }] },
    { at: "the blue whale", cam: { obj: "Blue Whale", span: 4 }, hl: [{ obj: "Blue Whale", label: "largest animal" }] },
    { at: "the sequoia", hl: [{ obj: "Blue Whale", place: "left" }, { obj: "Sequoia", label: "largest tree" }] },

    // made by us, and the mountains after them
    { at: "engineering categories", cam: { r: 4, m: 11, span: 6 }, clear: true },
    { at: "like planes", hl: [{ obj: "Boeing 747" }] },
    { at: ["supertankers", "super tankers"], hl: [{ obj: "Boeing 747", place: "left" }, { obj: "Supertanker" }] },
    { at: "the great pyramid", hl: [{ obj: "Boeing 747", place: "left" }, { obj: "Supertanker" }, { obj: "Great Pyramid", place: "left" }] },
    { at: "like mountains", cam: { r: 5, m: 15.6, span: 7 }, hl: [{ obj: "Great Pyramid", place: "left" }, { obj: "Mt. Everest", delay: 0.3 }] },
    { at: "is a mountain", hl: [{ obj: "Great Pyramid", label: "a mountain", place: "left" }, { obj: "Mt. Everest" }] },
    { at: "big rocks", cam: { r: 5.9, m: 18.4, span: 5 }, hl: [{ obj: "Eros", label: "rocks" }] },
    { at: "and comets", hl: [{ obj: "Eros", place: "left" }, { obj: "Halley's Comet", label: "comets", place: "left" }] },
    { at: "small moons", hl: [{ obj: "Halley's Comet", place: "left" }, { obj: "Deimos", label: false }, { obj: "Phobos", label: "small moons" }] },

    // round worlds
    { at: "more and more spherical", cam: { r: 7.4, m: 22.9, span: 6 },
      hl: [{ obj: "Hyperion", place: "left", label: "Hyperion · lumpy" }, { obj: "Mimas", delay: 0.5 }, { obj: "Ceres", delay: 1 }, { obj: "Pluto", delay: 1.5 }] },
    { at: "gravity overcomes", hl: [{ obj: "Hyperion", place: "left" }, { obj: "Mimas" }, { obj: "Ceres" }, { obj: "Pluto", label: "round" }] },
    { at: "might well be liquid", hl: [{ obj: "Ceres" }, { obj: "Pluto", label: "Pluto · round" }] },

    // atmospheres
    { at: "acquiring an atmosphere", cam: { r: 8.6, m: 27.1, span: 3.4 }, clear: true },
    { at: "mercury and the moon", hl: [{ obj: "Mercury", label: "Mercury · none", place: "left" }, { obj: "Moon", label: "Moon · none", place: "left" }] },
    { at: "a thin one", hl: [{ obj: "Mercury", label: "Mercury", place: "left" }, { obj: "Mars", label: "Mars · thin" }] },
    { at: "venus and earth", hl: [{ obj: "Mars" }, { obj: "Venus", place: "left" }, { obj: "Earth", delay: 0.4 }] },

    // gas giants, and Earth between
    { at: "after this point", cam: { r: 9.45, m: 29.3, span: 4 },
      hl: [{ obj: "Neptune", place: "left" }, { obj: "Saturn", delay: 0.3 }, { obj: "Jupiter", delay: 0.6 }] },
    { at: "a gas giant", hl: [{ obj: "Neptune", place: "left" }, { obj: "Saturn", label: "gas giants" }, { obj: "Jupiter", label: false }] },
    { at: "earth really sits", cam: { r: 9.1, m: 28.6, span: 4.6 },
      hl: [{ obj: "Earth", place: "left" }, { obj: "Mars", delay: 0.5 }, { obj: "Neptune", delay: 1 }] },

    // the turn: Saturn floats, then off the diagonal toward degenerate matter
    { at: "further we go in the mass line", cam: { r: 9.8, m: 30.2, span: 4 }, clear: true },
    { at: "right side of the graph", hl: [{ line: "water" }, { side: "right", label: "floats" }] },
    { at: "saturn actually", hl: [{ line: "water" }, { obj: "Saturn", label: "Saturn · would float", place: "left" }] },
    { at: "drastically to the left", hl: [{ line: "water" }, { obj: "Saturn", place: "left" }, { obj: "Jupiter", delay: 0.3 }, { obj: "Beta Pictoris b", label: "super-Jupiter", delay: 0.8 }] },
    { at: "off the main diagonal", cam: { r: 9.95, m: 30.9, span: 4.2 }, hl: [{ line: "water", label: "the diagonal" }, { obj: "Jupiter" }, { obj: "Beta Pictoris b", label: false }] },
    { at: "pressure inside the core", hl: [{ obj: "Jupiter", place: "left" }, { obj: "Beta Pictoris b", label: false }, { obj: "Y Brown Dwarf", label: false, delay: 0.4 }] },
    { at: "becoming degenerate matter", hl: [{ obj: "Jupiter", place: "left" }, { obj: "Y Brown Dwarf", label: false },
      { obj: "T Brown Dwarf", label: false }, { obj: "L Brown Dwarf", label: "degenerate matter" }] },
    { at: "density of water", hl: [{ line: "water", label: "density of water" }, { obj: "L Brown Dwarf", label: false }] },
    { at: "brown dwarf phase", cam: { r: 10, m: 31.5, span: 3.6 },
      hl: [{ obj: "Y Brown Dwarf", label: false }, { obj: "T Brown Dwarf", label: false }, { obj: "L Brown Dwarf", label: "brown dwarfs" }] },

    // the cliffhanger: two directions
    { at: ["drastic turn to the right", "turn to the right"], cam: { r: 9.9, m: 32.6, span: 5 },
      hl: [{ obj: "L Brown Dwarf", label: false }, { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f" }] },
    { at: "turn to the left", hl: [{ obj: "L Brown Dwarf", label: false }, { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f" },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "White Dwarf" }, color: "#90caf9" }] },
    { at: "what is this", hl: [{ arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f", draw: 0.01 },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "White Dwarf" }, color: "#90caf9", draw: 0.01 }] },
  ],
};
