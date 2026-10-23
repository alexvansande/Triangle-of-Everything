// =============================================================
// Scene: short-02-up-the-line — video 2: the diagonal; a millilitre of water as a
// cube, then as a ball (how the chart measures size); walking up the water line
// in grid squares (×10 size, ×1000 volume and mass); sink or float, and the air
// line with the balloons; animals in a thin band, the hippo, the elephants,
// dinosaurs, the whale and the sequoia; the Eiffel Tower, the pyramid, lakes,
// asteroids and small moons; round worlds; atmospheres and gas giants, Saturn;
// super-Jupiters and degenerate matter; the split at the brown dwarfs.
// Recorded 2026-10-23 (rec32; video/short-02-up-the-line/). The 2026-10-21 cut
// (rec27 + rec28) and its scene are in git history.
// =============================================================
// Field reference: docs/narration.md, "Scene fields".

// Microchip (−0.65, −1) to the Great Pyramid (4.1, 12.8): the diagonal alone
const CLOSE = { r: 1.7, m: 5.9, span: 9 };
const CUBE = { obj: "1ml of water (cube)" }, ML = { obj: "1 mL of Water" };
const LITER = { obj: "1 Liter of Water" }, TONNE = { obj: "1 Tonne of Water" };
const RIGHT = { r: 0.793, m: 0 };           // the millilitre ball, one square to the right
const WATER = { line: "water" }, AIR = { line: "air" };
const PAN = 3;                              // span of the engineering → planets pan
// one grid square (a decade of size × a decade of mass) with its bottom-left corner at (r, m)
const SQ = (r, m, delay = 0) => ({ poly: [[r, m], [r + 1, m], [r + 1, m + 1], [r, m + 1]], fill: "#ffd54f", opacity: 0.35, delay });
const STEP_RIGHT = [{ arrow: true, from: ML, to: RIGHT, label: "×10 size" }, SQ(-0.207, -1)];
const STEP_UP = [{ arrow: true, from: RIGHT, to: LITER, label: "×1000 volume" }, SQ(0.793, 0, 0.3), SQ(0.793, 1, 0.8), SQ(0.793, 2, 1.3)];
const HEAVIER = [{ ...STEP_UP[0], label: "×1000 heavier" }, ...STEP_UP.slice(1)];   // the same step, once it's a kilogram
const drawn = (list) => list.map(h => h.arrow ? { ...h, draw: 0.01 } : { ...h, instant: true, delay: 0 });

export default {
  title: "Water to brown dwarfs",
  blurb: "From a millilitre of water up the density line: what sinks and floats, animals, mountains, round worlds, gas giants and the brown dwarfs.",
  start: { ...CLOSE, span: 13 },   // a slow push in to CLOSE over the opening
  captionFixes: { short: "chart", math: "mass", mess: "mass" },

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md)
  backing: "Soaring",
  sound: [
    { at: "to the right will float", fx: "bubble", offset: 0.9 },
    { at: "can't actually swim", fx: "glug", offset: 0.2, gain: 2 },
    { at: "float away", fx: "hiss", offset: 0.3 },
    { at: "less dense than water", fx: "bubble", offset: 0.8 },
  ],

  cues: [
    // the diagonal
    { at: "draw everything that exists", cam: CLOSE, dur: 11, drift: 0.02,
      hl: [{ obj: "Microchip" }, { obj: "Human", delay: 0.6 }, { obj: "Great Pyramid", delay: 1.2 }] },
    { at: "those diagonal lines", hl: [{ line: "water", label: "the diagonal" }] },

    // a millilitre of water: a cube 1 cm wide, then the same water as a ball
    { at: "in the metric system", cam: { obj: "1ml of water (cube)", dr: 0.047, span: 0.3 }, units: true, unitsUntil: "that's okay",
      hl: [{ ...CUBE, label: "1 mL · 1 gram" }] },
    { at: "fill a cube", hl: [{ ...CUBE, label: "a cube 1 cm wide" }] },
    { at: "measuring size as a sphere",
      hl: [{ ...CUBE, label: "cube · 1 cm" }, { arrow: true, from: CUBE, to: ML, color: "#80deea" }, { ...ML, label: "ball · 1.24 cm", delay: 0.6 }] },
    { at: "a little bit to the side",
      hl: [{ ...CUBE, label: "cube" }, { arrow: true, from: CUBE, to: ML, color: "#80deea", draw: 0.01 }, { ...ML, label: "a little to the side" }] },

    // walking up the line: the grid's squares are decades, counted out beside the
    // arrows, with the axis each move is measured on lit up
    { at: "multiply all three sides", cam: { r: 0.45, m: 1.4, span: 4.6 }, units: true, unitsUntil: "density of water",
      hl: [{ ...ML, label: "1 mL · 1 cm" }] },
    { at: "one unit to the side",
      hl: [{ ...ML, label: "1 mL" }, ...STEP_RIGHT, { axis: "bottom", label: "size ×10" }] },
    { at: "volume by a thousand",
      hl: [{ ...ML, label: "1 mL" }, ...drawn(STEP_RIGHT), ...STEP_UP] },
    { at: "means one kilogram",
      hl: [{ ...ML, label: "1 mL", place: "left" }, ...drawn(STEP_RIGHT), ...drawn(HEAVIER), { ...LITER, label: "1 liter · 1 kg" }] },
    { at: "three units up", hl: [{ ...ML, place: "left" }, ...drawn(STEP_RIGHT), ...drawn(HEAVIER), { ...LITER, label: "3 squares up" }] },
    { at: "do that again", cam: { r: 1.0, m: 3.2, span: 6.5 },
      hl: [{ ...ML, place: "left" }, { ...LITER, label: "1 kg", place: "left" }, { arrow: true, from: LITER, to: TONNE, label: "×10 size · ×1000 mass" }, { ...TONNE, label: "1 tonne", delay: 0.8 }] },
    { at: "this diagonal line", cam: { r: 2, m: 6.5, span: 16 },
      hl: [{ ...ML, label: false }, { ...LITER, label: false }, { ...TONNE, label: false }, WATER] },
    { at: "density of water", hl: [{ line: "water", label: "density of water" }] },

    // sink or float, in water and in air
    { at: "denser than water", cam: { r: 2.4, m: 7.4, span: 7 }, hl: [WATER, { side: "left", label: "sinks" }] },
    { at: "made of stone", cam: { obj: "Chelyabinsk", span: 2.4 },
      hl: [WATER, { obj: "Chelyabinsk", label: "Chelyabinsk · stone" }, { obj: "Great Sphinx", label: "Sphinx · limestone", place: "left", delay: 0.4 }] },
    { at: "of metal", cam: { obj: "Hoba", span: 2.4 },
      hl: [WATER, { obj: "Hoba", label: "Hoba meteorite · iron" }, { obj: "The Little Mermaid", label: "Little Mermaid · bronze", place: "left", delay: 0.4 }] },
    { at: "to the right will float", cam: { r: 2.8, m: 8, span: 6 }, hl: [WATER, { side: "left", label: "sinks" }, { side: "right", label: "floats" }] },
    // the air line runs to the right of the water line, a thousand times less dense
    { at: "density of air", cam: { r: 2.7, m: 4.6, span: 5.5 }, hl: [WATER, { line: "air", label: "density of air" }] },
    { at: "heavier than air", hl: [WATER, { ...AIR, label: "lighter than air →" }] },
    { at: "lighter -than -air aircraft", cam: { obj: "Zeppelin NT", dr: -0.15, dm: -1.2, span: 3.2 },
      hl: [AIR, { obj: "Zeppelin NT" }, { obj: "Hot-air Balloon", delay: 0.3 }, { obj: "Weather Balloon", delay: 0.6 }, { obj: "Helium Party Balloon", delay: 0.9 }] },
    { at: "balloons and zeppelins",
      hl: [AIR, { obj: "Zeppelin NT", label: "zeppelin" }, { obj: "Hot-air Balloon", label: "balloons" }, { obj: "Weather Balloon", label: false }, { obj: "Helium Party Balloon", label: false }] },

    // animals: bulk density puts them ON the line, so zoom in to see the side
    // (the close-ups keep their neighbours named: nearby)
    { at: "much narrower band", cam: { r: 1.2, m: 3.8, span: 6 },
      hl: [WATER, { obj: "Ant" }, { obj: "Human", delay: 0.4 }, { obj: "Elephant", delay: 0.8 }, { obj: "Blue Whale", delay: 1.2 }] },
    { at: "mostly made of water", cam: { obj: "Human", span: 0.5 }, dur: 1.5, nearby: true,
      hl: [WATER, { obj: "Human", label: "mostly water" }] },
    { at: "heavier than others", cam: { obj: "Hippopotamus", span: 3.5 }, dur: 1.5, nearby: true, hl: [{ obj: "Hippopotamus" }, WATER] },
    { at: "can't actually swim", cam: { obj: "Hippopotamus", span: 0.1 }, dur: 2.5, nearby: true,
      hl: [{ obj: "Hippopotamus", label: "hippo · 1.05 g/cm³" }, WATER, { side: "left", label: "sinks" }] },

    // the biggest living things: from here the camera pans slowly up the line (glide
    // waypoints at their cue times) all the way to the round worlds
    { at: "heavier and heavier animals", cam: { r: 2.6, m: 7.3, span: PAN, glide: true }, hl: [WATER, { obj: "Elephant", label: "elephants" }] },
    { at: "dinosaurs", cam: { r: 2.95, m: 7.5, span: PAN, glide: true }, hl: [WATER, { obj: "Tyrannosaurus rex", label: "T. rex", place: "left" }, { obj: "Argentinosaurus", label: "Argentinosaurus", delay: 0.4 }] },
    { at: "the blue whale", cam: { r: 3.15, m: 8.1, span: PAN, glide: true }, hl: [{ obj: "Blue Whale", label: "largest animal ever" }] },
    { at: "the largest tree", cam: { r: 3.5, m: 8.9, span: PAN, glide: true }, hl: [{ obj: "Blue Whale", place: "left" }, { obj: "Sequoia", label: "largest tree" }] },

    // what we build
    { at: "engineering projects", cam: { r: 3.9, m: 10.2, span: PAN, glide: true }, dur: 2, clear: true,
      hl: [{ obj: "Boeing 747" }, { obj: "Supertanker", delay: 0.3 }] },
    { at: "the eiffel tower", cam: { r: 4.2, m: 10.6, span: PAN, glide: true }, hl: [{ obj: "Eiffel Tower" }] },
    { at: "surprisingly light", hl: [WATER, { obj: "Eiffel Tower", label: "Eiffel Tower · mostly air" }] },
    // a dive without a photo: the tower comes towards the screen, the chart falls back
    { at: "all the internal space", cam: { obj: "Eiffel Tower", span: PAN }, dur: 2 },
    { at: "all the internal space", dolly: { obj: "Eiffel Tower", in: 2, out: 3.5 }, dur: 2 },

    // rocks, lakes, asteroids and small moons
    { at: "lots of big rocks", cam: { r: 4.4, m: 12.4, span: PAN, glide: true }, hl: [{ obj: "Great Pyramid" }] },
    { at: "a giant rock", hl: [{ obj: "Great Pyramid", label: "a giant rock" }, { obj: "Mt. Everest", delay: 0.3 }] },
    // the lakes sit below the line (wide and flat): the pan dips to them
    { at: "lakes and asteroids", cam: { r: 5.4, m: 15.5, span: PAN, glide: true },
      hl: [{ obj: "Königssee", label: "lakes", place: "right" }, { obj: "Hallstätter See", label: false, delay: 0.2 },
        { obj: "Lake Nyos", label: false, delay: 0.4 }, { obj: "Eros", label: "asteroids", delay: 0.6 }] },
    { at: "small moons", cam: { r: 6.0, m: 18.5, span: PAN, glide: true }, hl: [{ obj: "Eros", place: "left" }, { obj: "Deimos", label: false }, { obj: "Phobos", label: "moons of Mars" }] },

    // round worlds
    { at: "less and less potato", cam: { r: 7.2, m: 22.2, span: PAN, glide: true },
      hl: [{ obj: "Hyperion", place: "left", label: "Hyperion · lumpy" }, { obj: "Vesta", delay: 0.4 }, { obj: "Mimas", delay: 0.8 }, { obj: "Ceres", delay: 1.2 }, { obj: "Pluto", delay: 1.6 }] },
    { at: "gravity becomes stronger", cam: { r: 7.6, m: 23.4, span: PAN, glide: true }, hl: [{ obj: "Hyperion", place: "left" }, { obj: "Mimas" }, { obj: "Ceres" }, { obj: "Pluto", label: "round" }] },
    { at: "behave as a liquid", cam: { r: 7.9, m: 24.4, span: PAN, glide: true }, hl: [{ obj: "Ceres" }, { obj: "Pluto", label: "Pluto · round" }] },
    { at: "gravity dominates everything", cam: { r: 8.6, m: 27.1, span: 3.4 }, clear: true },

    // atmospheres
    { at: "moon and mercury", cam: { obj: "Mercury", dr: -0.1, span: 2.2 }, dur: 3.5, hl: [{ obj: "Moon", label: "Moon · none", place: "left" }, { obj: "Mercury", label: "Mercury · none", place: "left" }] },
    { at: "almost none", cam: { obj: "Mars", span: 2.0 }, dur: 3, hl: [{ obj: "Mercury", label: "Mercury", place: "left" }, { obj: "Mars", label: "Mars · almost none" }] },
    // close enough that both Venus's and Earth's pictures show
    { at: "venus and earth", cam: { r: 8.79, m: 27.735, span: 0.25 }, dur: 3, hl: [{ obj: "Mars" }, { obj: "Earth", delay: 0.2 }, { obj: "Venus", place: "left", delay: 0.5 }] },
    { at: "float away", cam: { r: 9.1, m: 28.6, span: 4.6 }, hl: [{ obj: "Earth", label: "hydrogen escapes", place: "left" }] },

    // gas giants
    { at: "those two gases", cam: { r: 9.65, m: 29.8, span: 2.4 },
      hl: [{ obj: "Neptune", place: "left" }, { obj: "Saturn", delay: 0.3 }, { obj: "Jupiter", delay: 0.6 }] },
    // a slow push onto the gas giants (their own icons, no cutaway)
    { at: "gas giant planets", cam: { r: 9.75, m: 30.0, span: 1.7 }, dur: 4, drift: 0.02,
      hl: [{ obj: "Neptune", place: "left" }, { obj: "Saturn", label: "gas giants" }, { obj: "Jupiter", label: false }] },
    { at: "with the rocky planets", cam: { r: 9.5, m: 29.4, span: 2.8 }, hl: [WATER, { obj: "Earth", label: "rocky planets", place: "left" }, { obj: "Venus", label: false, place: "left" }] },
    { at: "mostly made of gas", hl: [WATER, { obj: "Earth", place: "left" }, { obj: "Neptune", place: "left" }, { obj: "Saturn", delay: 0.3 }, { obj: "Jupiter", label: "mostly gas", delay: 0.6 }] },
    { at: "less dense than water", cam: { obj: "Saturn", span: 1.0 }, dur: 3, hl: [WATER, { obj: "Saturn", label: "Saturn · would float", place: "left" }] },

    // super-Jupiters and degenerate matter
    { at: "trend stops", cam: { r: 9.88, m: 30.7, span: 2.4 },
      hl: [WATER, { obj: "Saturn", label: false, place: "left" }, { obj: "Jupiter", label: false }, { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f", delay: 0.6 }] },
    { at: "roughly jupiter", hl: [{ obj: "Jupiter", label: "Jupiter size", place: "left" }, { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f", draw: 0.01 }, { obj: "Y Brown Dwarf", label: false, delay: 0.4 }] },
    { at: "pressure in the core", hl: [{ obj: "Jupiter", place: "left" }, { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f", draw: 0.01 }, { obj: "Y Brown Dwarf", label: false, delay: 0.4 }] },
    { at: "degenerate matter", hl: [{ obj: "Jupiter", place: "left" }, { obj: "Y Brown Dwarf", label: false },
      { obj: "T Brown Dwarf", label: false }, { obj: "L Brown Dwarf", label: "degenerate matter" }] },

    // the split
    { at: "around brown dwarfs", cam: { r: 9.9, m: 32.6, span: 5 },
      hl: [{ obj: "Y Brown Dwarf", label: false }, { obj: "T Brown Dwarf", label: false }, { obj: "L Brown Dwarf", label: "brown dwarfs" }] },
    // travel up each branch: the stars to the right, the dead stars to the left
    { at: "veer to the right", cam: { obj: "Sun", dr: -0.5, dm: -0.3, span: 3.4 }, dur: 2.6,
      hl: [{ obj: "L Brown Dwarf", label: false }, { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f" }] },
    { at: "veer to the left", cam: { obj: "White Dwarf", dr: 0.5, dm: -0.3, span: 3.4 }, dur: 2.6, hl: [{ obj: "L Brown Dwarf", label: false }, { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f" },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "White Dwarf" }, color: "#90caf9" }] },
    { at: "ordinary matter anymore", cam: { r: 9.9, m: 32.4, span: 4.4 }, dur: 2.4, hl: [{ obj: "L Brown Dwarf", label: "brown dwarfs" }, { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f", draw: 0.01 },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "White Dwarf" }, color: "#90caf9", draw: 0.01 }] },
    { at: "life and death of stars", cam: { r: 9.9, m: 32.9, span: 5.6 }, dur: 5, drift: 0.02, hl: [{ obj: "Sun", label: "stars" }, { obj: "White Dwarf", label: "dead stars", place: "left" },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f", draw: 0.01 },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "White Dwarf" }, color: "#90caf9", draw: 0.01 }] },
  ],
};
