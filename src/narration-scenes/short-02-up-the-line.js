// =============================================================
// Scene: short-02-up-the-line — video 2 (it replaced the old videos 2 and 3,
// now public/narration/retired-02-density and retired-03-planets): the diagonal, a liter of
// water and the cube law in grid squares, sink or float, animals in a thin band,
// the hippo, the whale and the sequoia, the Eiffel Tower, the pyramid and the
// mountains, small moons, round worlds, atmospheres, gas giants, Saturn floating,
// super-Jupiters and degenerate matter, and the split at the brown dwarfs.
// Recorded 2026-10-21 (rec27 + rec28; video/short-02-up-the-line/).
// =============================================================
// Field reference: docs/narration.md, "Scene fields".

// Microchip (−0.65, −1) to the Great Pyramid (4.1, 12.8): the diagonal alone
const CLOSE = { r: 1.7, m: 5.9, span: 9 };
const LITER = { obj: "1 Liter of Water" }, TONNE = { obj: "1 Tonne of Water" };
const RIGHT = { r: 1.79, m: 3 };            // the liter, one square to the right
const WATER = { line: "water" };
const PAN = 3;                              // span of the engineering → planets pan
// one grid square (a decade of size × a decade of mass) with its bottom-left corner at (r, m)
const SQ = (r, m, delay = 0) => ({ poly: [[r, m], [r + 1, m], [r + 1, m + 1], [r, m + 1]], fill: "#ffd54f", opacity: 0.35, delay });

export default {
  title: "Water to brown dwarfs",
  blurb: "From a liter of water up the density line: what sinks and floats, animals, mountains, round worlds, gas giants and the brown dwarfs.",
  start: { ...CLOSE, span: 13 },   // a slow push in to CLOSE over the opening
  captionFixes: { short: "chart", math: "mass", mess: "mass" },

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md)
  backing: "Soaring",
  sound: [
    { at: "to the right will float", fx: "bubble", offset: 0.9 },
    { at: "does not actually swim", fx: "glug", offset: 0.2, gain: 2 },
    { at: "float out into space", fx: "hiss", offset: 0.3 },
    { at: "would float", fx: "bubble", offset: 0.3 },
  ],

  cues: [
    // the diagonal, a liter, the cube law (rec27)
    { at: "everything in the universe", cam: CLOSE, dur: 11, drift: 0.02,
      hl: [{ obj: "Microchip" }, { obj: "Human", delay: 0.6 }, { obj: "Great Pyramid", delay: 1.2 }] },
    { at: "this diagonal line", hl: [{ line: "water", label: "the diagonal" }] },
    { at: "one liter of water", cam: { obj: "1 Liter of Water", span: 4.5 },
      hl: [{ ...LITER, label: "1 liter · 1 kg · 10 cm" }] },
    { at: "all three dimensions", cam: { r: 1.35, m: 4.6, span: 4.5 }, units: true, unitsUntil: "diagonal blue line",   // size and mass rulers through the cube law
      hl: [{ ...LITER, label: "10 cm" }] },
    // the grid's squares are decades: one square of size, then three of mass, counted
    // out beside the arrows, with the axis each move is measured on lit up
    { at: "one square to the right",
      hl: [{ ...LITER, label: "10 cm" }, { arrow: true, from: LITER, to: RIGHT, label: "×10 size" },
           SQ(0.79, 2), { axis: "bottom", label: "size ×10" }] },
    { at: "three squares up",
      hl: [{ ...LITER, label: "1 kg" }, { arrow: true, from: LITER, to: RIGHT, label: "×10 size", draw: 0.01 },
           { ...SQ(0.79, 2), instant: true },
           { arrow: true, from: RIGHT, to: TONNE, label: "×1000 volume" },
           SQ(1.79, 3, 0.3), SQ(1.79, 4, 0.8), SQ(1.79, 5, 1.3), { axis: "left", label: "mass ×1000" }] },
    { at: "constant density",
      hl: [{ ...LITER, label: "1 kg" }, { ...TONNE, label: "1 tonne · 1 m" },
           { arrow: true, from: LITER, to: TONNE, label: "×10 size · ×1000 mass" }] },
    { at: "diagonal blue line", cam: { r: 2, m: 6.5, span: 16 }, hl: [{ line: "water", label: "density of water" }] },

    // sink or float (rec28)
    { at: "on the left will sink", cam: { r: 2.4, m: 7.4, span: 7 }, hl: [WATER, { side: "left", label: "sinks" }] },
    { at: "rocks or metal", cam: { obj: "Hoba", span: 2.6 },
      hl: [WATER, { obj: "Hoba", label: "Hoba meteorite · iron" }, { obj: "Chelyabinsk", label: "Chelyabinsk", place: "left", delay: 0.4 }] },
    { at: "statues", cam: { obj: "The Little Mermaid", span: 2 },
      hl: [WATER, { obj: "The Little Mermaid", label: "Little Mermaid · bronze" }, { obj: "Manneken Pis", place: "left", delay: 0.3 }] },
    { at: "to the right will float", cam: { r: 2.8, m: 8, span: 6 }, hl: [WATER, { side: "left", label: "sinks" }, { side: "right", label: "floats" }] },
    { at: "boats", cam: { obj: "Titanic", span: 2.2 },
      // the boat pictures (Bismarck left out: it sits right on top of the Titanic);
      // three are close in size and mass, so their names alternate sides
      hl: [WATER, { obj: "Titanic", label: "Titanic", place: "right" }, { obj: "HMS Victory", place: "right", delay: 0.3 },
        { obj: "USS Enterprise", place: "left", delay: 0.6 }, { obj: "Ever Given", delay: 0.9 }, { obj: "Kursk", place: "left", delay: 1.2 }] },

    // animals: bulk density puts them ON the line, so zoom in to see the side
    // (the close-ups keep their neighbours named: nearby)
    { at: "much narrower range", cam: { r: 1.2, m: 3.8, span: 6 },
      hl: [WATER, { obj: "Ant" }, { obj: "Human", delay: 0.4 }, { obj: "Elephant", delay: 0.8 }, { obj: "Blue Whale", delay: 1.2 }] },
    { at: ["hank green", "famous saying in biology"], cam: { obj: "Human", span: 0.12 }, dur: 1.5, nearby: true,
      hl: [WATER, { obj: "Human", label: "human · 0.985 g/cm³" }, { side: "right", label: "floats" }] },
    { at: "some variation", cam: { obj: "Human", span: 0.5 }, nearby: true, hl: [WATER, { obj: "Human", label: "mostly water" }] },
    { at: ["will be the hippo", "would be the hippo"], cam: { obj: "Hippopotamus", span: 3.5 }, dur: 1.5, nearby: true, hl: [{ obj: "Hippopotamus" }, WATER] },
    { at: "aquatic animal", cam: { obj: "Hippopotamus", span: 0.1 }, dur: 2.5, nearby: true, hl: [{ obj: "Hippopotamus" }, WATER] },
    { at: "sinks to the bottom",
      hl: [{ obj: "Hippopotamus", label: "hippo · 1.05 g/cm³" }, WATER, { side: "left", label: "sinks" }] },

    // the biggest living things: from here the camera pans slowly up the line (glide
    // waypoints at their cue times) all the way to the round worlds
    { at: "larger animals", cam: { r: 2.6, m: 7.3, span: PAN, glide: true }, hl: [WATER, { obj: "Elephant" }, { obj: "Blue Whale", delay: 0.5 }] },
    { at: "dinosaurs", cam: { r: 2.95, m: 7.5, span: PAN, glide: true }, hl: [WATER, { obj: "Tyrannosaurus rex", label: "T. rex", place: "left" }, { obj: "Argentinosaurus", label: "Argentinosaurus", delay: 0.4 }] },
    { at: "the blue whale", cam: { r: 3.15, m: 8.1, span: PAN, glide: true }, hl: [{ obj: "Blue Whale", label: "largest animal" }] },
    { at: "the sequoia", cam: { r: 3.5, m: 8.9, span: PAN, glide: true }, hl: [{ obj: "Blue Whale", place: "left" }, { obj: "Sequoia", label: "largest tree" }] },

    // what we build
    { at: "engineering phase", cam: { r: 3.9, m: 10.2, span: PAN, glide: true }, dur: 2, clear: true,
      hl: [{ obj: "Boeing 747" }, { obj: "Supertanker", delay: 0.3 }] },
    { at: "the eiffel tower", cam: { r: 4.2, m: 10.6, span: PAN, glide: true }, hl: [{ obj: "Eiffel Tower" }] },
    { at: "very to the right", hl: [WATER, { obj: "Eiffel Tower", label: "Eiffel Tower · mostly air" }] },

    // mountains, rocks and small moons
    // a dive without a photo: the tower comes towards the screen, the chart falls back
    { at: "lot of empty space", dolly: { obj: "Eiffel Tower", in: 2, out: 3.5 }, dur: 2 },
    { at: "the great pyramid", cam: { r: 4.4, m: 12.4, span: PAN, glide: true }, hl: [{ obj: "Great Pyramid" }] },
    { at: "hills and mountains", cam: { r: 4.9, m: 14.4, span: PAN, glide: true }, hl: [{ obj: "Great Pyramid", place: "left" }, { obj: "Mt. Everest", delay: 0.3 }] },
    { at: "a mountain itself", hl: [{ obj: "Great Pyramid", label: "a mountain", place: "left" }, { obj: "Mt. Everest" }] },
    { at: "mount everest is here", cam: { r: 5.5, m: 16.8, span: PAN, glide: true }, hl: [{ obj: "Mt. Everest", label: "Everest" }] },
    // the lakes and the glacier sit below the line (wide and flat): the pan dips to them
    { at: "lakes and glaciers", offset: 1.2, cam: { r: 5.2, m: 14.7, span: PAN, glide: true },
      hl: [{ obj: "Königssee", label: "lakes", place: "right" }, { obj: "Hallstätter See", label: false, delay: 0.2 },
        { obj: "Lake Nyos", label: false, delay: 0.4 }, { obj: "Grinnell Glacier", label: "glacier", place: "left", delay: 0.6 }] },
    { at: "asteroids and comets", cam: { r: 5.75, m: 17.2, span: PAN, glide: true },
      hl: [{ obj: "Eros", label: "asteroids" }, { obj: "Halley's Comet", label: "comets", place: "left", delay: 0.4 }] },
    { at: "small moons", cam: { r: 6.0, m: 18.5, span: PAN, glide: true }, hl: [{ obj: "Halley's Comet", place: "left" }, { obj: "Deimos", label: false }, { obj: "Phobos", label: "moons of Mars" }] },

    // round worlds
    { at: "past hyperion", cam: { r: 7.2, m: 22.2, span: PAN, glide: true },
      hl: [{ obj: "Hyperion", place: "left", label: "Hyperion · lumpy" }, { obj: "Vesta", delay: 0.4 }, { obj: "Mimas", delay: 0.8 }, { obj: "Ceres", delay: 1.2 }, { obj: "Pluto", delay: 1.6 }] },
    { at: "force of gravity", cam: { r: 7.6, m: 23.4, span: PAN, glide: true }, hl: [{ obj: "Hyperion", place: "left" }, { obj: "Mimas" }, { obj: "Ceres" }, { obj: "Pluto", label: "round" }] },
    { at: "treated like a liquid", cam: { r: 7.9, m: 24.4, span: PAN, glide: true }, hl: [{ obj: "Ceres" }, { obj: "Pluto", label: "Pluto · round" }] },

    // atmospheres
    { at: "hill of mass", cam: { r: 8.6, m: 27.1, span: 3.4 }, clear: true },
    { at: "moon and mercury", cam: { obj: "Mercury", dr: -0.1, span: 2.2 }, dur: 3.5, hl: [{ obj: "Moon", label: "Moon · none", place: "left" }, { obj: "Mercury", label: "Mercury · none", place: "left" }] },
    { at: "very thin", cam: { obj: "Mars", span: 2.0 }, dur: 3, hl: [{ obj: "Mercury", label: "Mercury", place: "left" }, { obj: "Mars", label: "Mars · thin" }] },
    // close enough that both Venus's and Earth's pictures show
    { at: "venus and earth", cam: { r: 8.79, m: 27.735, span: 0.25 }, dur: 3, hl: [{ obj: "Mars" }, { obj: "Earth", delay: 0.2 }, { obj: "Venus", place: "left", delay: 0.5 }] },
    { at: "float out into space", cam: { r: 9.1, m: 28.6, span: 4.6 }, hl: [{ obj: "Earth", label: "hydrogen escapes", place: "left" }] },

    // gas giants
    { at: "balloon into gas giants", cam: { r: 9.65, m: 29.8, span: 2.4 },
      hl: [{ obj: "Neptune", place: "left" }, { obj: "Saturn", delay: 0.3 }, { obj: "Jupiter", delay: 0.6 }] },
    // a slow push onto the gas giants (their own icons, no cutaway)
    { at: "ordinary matter", cam: { r: 9.75, m: 30.0, span: 1.7 }, dur: 7, drift: 0.02 },
    { at: "become a gas giant", hl: [{ obj: "Neptune", place: "left" }, { obj: "Saturn", label: "gas giants" }, { obj: "Jupiter", label: false }] },
    { at: "rocky planets", cam: { r: 9.5, m: 29.4, span: 2.8 }, hl: [WATER, { obj: "Earth", place: "left" }, { obj: "Neptune", place: "left" }] },
    { at: "right side of the line", cam: { obj: "Saturn", span: 1.5 }, hl: [WATER, { obj: "Neptune", place: "left" }, { obj: "Saturn", label: "Saturn · right of the line" }] },
    { at: "less dense than water", cam: { obj: "Saturn", span: 1.4 }, dur: 3 },
    { at: "would float", cam: { obj: "Saturn", span: 1.0 }, dur: 3, hl: [WATER, { obj: "Saturn", label: "Saturn · would float", place: "left" }] },

    // super-Jupiters and degenerate matter
    { at: "past the jupiter", cam: { r: 9.88, m: 30.7, span: 2.4 },
      hl: [WATER, { obj: "Saturn", label: false, place: "left" }, { obj: "Jupiter", label: false }, { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f", delay: 0.6 }] },
    { at: "same size of jupiter", hl: [{ obj: "Jupiter", label: "Jupiter size", place: "left" }, { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f", draw: 0.01 }, { obj: "Y Brown Dwarf", label: false, delay: 0.4 }] },
    { at: "pressure in the core", hl: [{ obj: "Jupiter", place: "left" }, { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f", draw: 0.01 }, { obj: "Y Brown Dwarf", label: false, delay: 0.4 }] },
    { at: "degenerate matter", hl: [{ obj: "Jupiter", place: "left" }, { obj: "Y Brown Dwarf", label: false },
      { obj: "T Brown Dwarf", label: false }, { obj: "L Brown Dwarf", label: "degenerate matter" }] },

    // the split
    { at: "graph will split", cam: { r: 9.9, m: 32.6, span: 5 },
      hl: [{ obj: "Y Brown Dwarf", label: false }, { obj: "T Brown Dwarf", label: false }, { obj: "L Brown Dwarf", label: "brown dwarfs" }] },
    // travel up each branch: the stars to the right, the dead stars to the left
    { at: "shooting to the right", cam: { obj: "Sun", dr: -0.5, dm: -0.3, span: 3.4 }, dur: 2.6,
      hl: [{ obj: "L Brown Dwarf", label: false }, { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f" }] },
    { at: "shooting to the left", cam: { obj: "White Dwarf", dr: 0.5, dm: -0.3, span: 3.4 }, dur: 2.6, hl: [{ obj: "L Brown Dwarf", label: false }, { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f" },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "White Dwarf" }, color: "#90caf9" }] },
    { at: "on the brown dwarfs", cam: { r: 9.9, m: 32.4, span: 4.4 }, dur: 2.4, hl: [{ obj: "L Brown Dwarf", label: "brown dwarfs" }, { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f", draw: 0.01 },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "White Dwarf" }, color: "#90caf9", draw: 0.01 }] },
    { at: "life and death of stars", cam: { r: 9.9, m: 32.9, span: 5.6 }, dur: 5, drift: 0.02, hl: [{ obj: "Sun", label: "stars" }, { obj: "White Dwarf", label: "dead stars", place: "left" },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f", draw: 0.01 },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "White Dwarf" }, color: "#90caf9", draw: 0.01 }] },
  ],
};
