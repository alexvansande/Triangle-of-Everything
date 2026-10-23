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
const INSECTS = { r: -0.7, m: -1.6, span: 2.4 };   // from a grain of sand up to the 1 mL ball and the penny
const CUBE = { obj: "1ml of water (cube)" }, ML = { obj: "1 mL of Water" };
const LITER = { obj: "1 Liter of Water" }, TONNE = { obj: "1 Tonne of Water" };
const RIGHT = { r: 0.793, m: 0 };           // the millilitre ball, one square to the right
const WATER = { line: "water" }, AIR = { line: "air" };
const WIDE = { r: 1.6, m: 5.4, span: 7 };    // the tonne step, with room around it
// the slow pan up the line through the animals and what we build: a bit over two
// decades wide, centred on the water line (m = 3r + 0.62)
const UP = (r, span = 2.2) => ({ r, m: +(3 * r + 0.62).toFixed(2), span, glide: true });
// from the line's name on, the camera never stands still: one slow glide in to the penny,
// the party balloon and Nefertiti, up to the airships, and on into the animals
const C = (r, m, span) => ({ r, m, span, glide: true });
// where planets turn from rocky to gassy: about 2 Earth masses (Chen & Kipping 2017,
// 2.0 +0.7/-0.6), log m = 28.08; the exoplanet dots step to the right across it
const ROCKY_GAS = { trend: [[8.55, 28.08], [9.75, 28.08]], color: "#80deea", label: "rocky → gas · ~2 Earths" };
// the pan from the round worlds to the brown dwarfs: waypoints at their cue times
const G = (r, m) => ({ r, m, span: PAN, glide: true });
// zoomed out at the split just enough for the red giant and the neutron star
const STARS = { r: 9.48, m: 32.7, span: 7.8 };
const PAN = 2.2;                            // span of the rocks → round worlds pan (as wide as the animals')
// one grid square (a decade of size × a decade of mass) with its bottom-left corner at (r, m)
const SQ = (r, m, delay = 0) => ({ poly: [[r, m], [r + 1, m], [r + 1, m + 1], [r, m + 1]], fill: "#ffd54f", opacity: 0.35, delay });
const STEP_RIGHT = [{ arrow: true, from: ML, to: RIGHT, label: "×10 size" }, SQ(-0.207, -1)];
const STEP_UP = [{ arrow: true, from: RIGHT, to: LITER, label: "×1000 volume" }, SQ(0.793, 0, 0.3), SQ(0.793, 1, 0.8), SQ(0.793, 2, 1.3)];
const HEAVIER = [{ ...STEP_UP[0], label: "×1000 heavier" }, ...STEP_UP.slice(1)];   // the same step, once it's a kilogram
const drawn = (list) => list.map(h => h.arrow ? { ...h, draw: 0.01 } : { ...h, instant: true, delay: 0 });

export default {
  title: "Water to brown dwarfs",
  blurb: "From a millilitre of water up the density line: what sinks and floats, animals, mountains, round worlds, gas giants and the brown dwarfs.",
  // the author's camera script: open close on a moth, zoom out until the millilitre
  // of water shows, then an extreme close-up of the cube and its sister ball, then
  // out again until the litre fits too
  start: { r: -0.93, m: -2.22, span: 0.9 },   // Eois stantonae
  captionFixes: { short: "chart", math: "mass", mess: "mass" },

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md)
  forceIcons: ["Venus"],   // shown behind Earth at the pan's zoom
  backing: "Soaring",
  sound: [
    { at: "to the right will float", fx: "bubble", offset: 0.9 },
    { at: "can't actually swim", fx: "glug", offset: 0.2, gain: 2 },
    { at: "float away", fx: "hiss", offset: 0.3 },
    { at: "less dense than water", fx: "bubble", offset: 0.8 },
  ],

  cues: [
    // the diagonal
    { at: "draw everything that exists", cam: INSECTS, dur: 11, drift: 0.02,
      hl: [{ obj: "Ant", delay: 1.5 }, { obj: "Ladybug", delay: 2.5 }, { obj: "Microchip", delay: 3.5 }] },
    { at: "those diagonal lines", hl: [{ line: "water", label: "the diagonal" }] },

    // a millilitre of water: a cube 1 cm wide, then the same water as a ball
    { at: "in the metric system", cam: { obj: "1ml of water (cube)", dr: 0.033, span: 0.3 }, units: true, unitsUntil: "that's okay",
      hl: [{ ...CUBE, label: "1 mL · 1 gram" }] },
    { at: "fill a cube", hl: [{ ...CUBE, label: "a cube 1 cm wide" }] },
    { at: "measuring size as a sphere",
      hl: [{ ...CUBE, label: "cube · 1 cm" }, { arrow: true, from: CUBE, to: ML, color: "#80deea" }, { ...ML, label: "ball · 1.24 cm", delay: 0.6 }] },
    { at: "a little bit to the side",
      hl: [{ ...CUBE, label: "cube" }, { arrow: true, from: CUBE, to: ML, color: "#80deea", draw: 0.01 }, { ...ML, label: "a little to the side" }] },

    // walking up the line: the grid's squares are decades, counted out beside the
    // arrows, with the axis each move is measured on lit up
    { at: "multiply all three sides", cam: { r: 0.3, m: 1.5, span: 2.7 }, focus: [ML.obj, LITER.obj], units: true, unitsUntil: "density of water",
      hl: [{ ...ML, label: "1 mL · 1 cm" }] },
    { at: "one unit to the side",
      hl: [{ ...ML, label: "1 mL" }, ...STEP_RIGHT, { axis: "bottom", label: "size ×10" }] },
    { at: "volume by a thousand",
      hl: [{ ...ML, label: "1 mL" }, ...drawn(STEP_RIGHT), ...STEP_UP] },
    { at: "means one kilogram",
      hl: [{ ...ML, label: "1 mL", place: "left" }, ...drawn(STEP_RIGHT), ...drawn(HEAVIER), { ...LITER, label: "1 liter · 1 kg" }] },
    { at: "three units up", hl: [{ ...ML, place: "left" }, ...drawn(STEP_RIGHT), ...drawn(HEAVIER), { ...LITER, label: "3 squares up" }] },
    { at: "do that again", cam: WIDE, dur: 3, drift: 0.04, focus: [ML.obj, LITER.obj, TONNE.obj],
      hl: [{ ...ML, place: "left" }, { ...LITER, label: "1 kg", place: "left" }, { arrow: true, from: LITER, to: TONNE, label: "×10 size · ×1000 mass" }, { ...TONNE, label: "1 tonne", delay: 0.8 }] },
    { at: "this diagonal line", focus: false, cam: C(1.2, 3.6, 4.6),
      hl: [{ ...ML, label: false }, { ...LITER, label: false }, { ...TONNE, label: false }, WATER] },
    { at: "density of water", cam: C(0.95, 3.0, 3.3), hl: [{ line: "water", label: "density of water" }] },

    // sink or float, in water and in air
    { at: "denser than water", cam: C(0.7, 2.35, 2.5), hl: [WATER, { side: "left", label: "sinks" }] },
    { at: "made of stone", cam: C(0.68, 2.4, 2.45),
      hl: [WATER, { obj: "Bust of Queen Nefertiti", label: "Nefertiti · limestone", place: "left" }] },
    { at: "of metal", cam: C(0.7, 2.4, 2.4),
      hl: [WATER, { obj: "Voyager Golden Record", label: "golden record · copper" }] },
    { at: "to the right will float", cam: C(1.1, 3.4, 2.35), hl: [WATER, { side: "left", label: "sinks" }, { side: "right", label: "floats" }] },
    // the air line runs to the right of the water line, a thousand times less dense
    { at: "density of air", cam: C(1.5, 4.2, 2.3), hl: [WATER, { line: "air", label: "density of air" }] },
    { at: "heavier than air", cam: C(1.9, 5.0, 2.2), hl: [WATER, { ...AIR, label: "lighter than air →" }] },
    { at: "lighter -than -air aircraft", cam: C(2.4, 5.8, 2.1),
      hl: [AIR, { obj: "Zeppelin NT" }, { obj: "Hot-air Balloon", delay: 0.3 }] },
    { at: "balloons and zeppelins", cam: C(2.45, 6.0, 2.0),
      hl: [AIR, { obj: "Zeppelin NT", label: "zeppelin" }, { obj: "Hot-air Balloon", label: "balloon" }] },

    // animals and what we build: the glide carries on, a bit over a decade and a half
    // wide, then up the line (waypoints at their cue times) on to the round worlds
    { at: "much narrower band", cam: C(1.8, 6.0, 1.7), hl: [WATER, { obj: "Human" }] },
    { at: "mostly made of water", cam: C(1.85, 6.15, 1.6), hl: [WATER, { obj: "Human", label: "mostly water" }] },
    { at: "heavier than others", cam: C(1.92, 6.35, 1.5), hl: [{ obj: "Hippopotamus" }, WATER] },
    { at: "can't actually swim", cam: UP(1.95, 1.5),
      hl: [{ obj: "Hippopotamus", label: "hippo · 1.05 g/cm³" }, WATER, { side: "left", label: "sinks" }] },

    { at: "heavier and heavier animals", cam: UP(2.1, 1.5), hl: [WATER, { obj: "Elephant", label: "elephants" }] },
    { at: "dinosaurs", cam: UP(2.3, 1.6), hl: [WATER, { obj: "Tyrannosaurus rex", label: "T. rex", place: "left" }, { obj: "Argentinosaurus", label: "Argentinosaurus", delay: 0.4 }] },
    { at: "the blue whale", cam: UP(2.55, 1.9), hl: [{ obj: "Blue Whale", label: "largest animal ever" }] },
    { at: "the largest tree", cam: UP(2.85, 2.2), hl: [{ obj: "Blue Whale", place: "left" }, { obj: "Sequoia", label: "largest tree" }] },

    // what we build
    { at: "engineering projects", cam: UP(3.15, 2.6), dur: 2, clear: true,
      hl: [{ obj: "Boeing 747" }, { obj: "Supertanker", delay: 0.3 }] },
    { at: "the eiffel tower", cam: C(3.75, 10.05, 2.8), hl: [{ obj: "Eiffel Tower" }] },
    { at: "surprisingly light", cam: C(3.8, 10.1, 2.8), hl: [WATER, { obj: "Eiffel Tower", label: "Eiffel Tower · mostly air" }] },
    // (no dive for now, the author's call: it stays highlighted, in the frame's middle
    // third the whole time it's talked about)
    { at: "all the internal space", cam: C(3.86, 10.15, 2.85) },
    { at: "lots of big rocks", offset: -0.8, cam: C(3.92, 10.3, 2.9) },

    // rocks, lakes, asteroids and small moons
    { at: "lots of big rocks", cam: C(4.0, 11.2, 3.1), hl: [{ obj: "Great Pyramid" }] },
    { at: "a giant rock", cam: C(4.25, 12.6, 3.2), hl: [{ obj: "Great Pyramid", label: "a giant rock" }, { obj: "Mt. Everest", delay: 0.3 }] },
    // the lakes sit below the line (wide and flat): the pan dips to them
    { at: "lakes and asteroids", cam: C(5.3, 15.8, 3.4),
      hl: [{ obj: "Königssee", label: "lakes", place: "right" }, { obj: "Hallstätter See", label: false, delay: 0.2 },
        { obj: "Lake Nyos", label: false, delay: 0.4 }, { obj: "Eros", label: "asteroids", delay: 0.6 }] },
    { at: "small moons", cam: C(6.0, 18.4, 3.2), hl: [{ obj: "Eros", place: "left" }, { obj: "Deimos", label: false }, { obj: "Phobos", label: "moons of Mars" }] },

    // round worlds
    { at: "less and less potato", cam: { r: 7.2, m: 22.2, span: PAN, glide: true },
      hl: [{ obj: "Hyperion", place: "left", label: "Hyperion · lumpy" }, { obj: "Vesta", delay: 0.4 }, { obj: "Mimas", delay: 0.8 }, { obj: "Ceres", delay: 1.2 }, { obj: "Pluto", delay: 1.6 }] },
    { at: "gravity becomes stronger", cam: { r: 7.6, m: 23.4, span: PAN, glide: true }, hl: [{ obj: "Hyperion", place: "left" }, { obj: "Mimas" }, { obj: "Ceres" }, { obj: "Pluto", label: "round" }] },
    { at: "behave as a liquid", cam: { r: 7.9, m: 24.4, span: PAN, glide: true }, hl: [{ obj: "Ceres" }, { obj: "Pluto", label: "Pluto · round" }] },
    { at: "gravity dominates everything", cam: G(8.15, 25.2), clear: true },

    // atmospheres
    { at: "moon and mercury", cam: G(8.35, 26.1), hl: [{ obj: "Moon", label: "Moon · none", place: "left" }, { obj: "Mercury", label: "Mercury · none", place: "left" }] },
    { at: "almost none", cam: G(8.55, 26.8), hl: [{ obj: "Mercury", label: "Mercury", place: "left" }, { obj: "Mars", label: "Mars · almost none" }] },
    // close enough that both Venus's and Earth's pictures show
    { at: "venus and earth", cam: G(8.8, 27.6), hl: [{ obj: "Mars" }, { obj: "Earth", delay: 0.2 }, { obj: "Venus", place: "left", delay: 0.5 }] },
    { at: "float away", cam: G(9.0, 28.2), hl: [{ obj: "Earth", label: "hydrogen escapes", place: "left" }] },

    // gas giants
    { at: "those two gases", cam: G(9.3, 28.9),
      hl: [{ obj: "Neptune", place: "left" }, { obj: "Saturn", delay: 0.3 }, { obj: "Jupiter", delay: 0.6 }] },
    // a slow push onto the gas giants (their own icons, no cutaway)
    { at: "gas giant planets", cam: G(9.45, 29.0),
      hl: [{ obj: "Neptune", place: "left" }, { obj: "Saturn", label: "gas giants" }, { obj: "Jupiter", label: false }] },
    { at: "with the rocky planets", cam: G(9.5, 29.15), hl: [ROCKY_GAS, WATER, { obj: "Earth", label: "rocky planets", place: "left" }, { obj: "Venus", label: false, place: "left" }] },
    { at: "mostly made of gas", cam: G(9.6, 29.5), hl: [{ ...ROCKY_GAS, draw: 0.01 }, WATER, { obj: "Earth", place: "left" }, { obj: "Neptune", place: "left" }, { obj: "Saturn", delay: 0.3 }, { obj: "Jupiter", label: "mostly gas", delay: 0.6 }] },
    { at: "less dense than water", cam: G(9.75, 30.1), hl: [WATER, { obj: "Saturn", label: "Saturn · would float", place: "left" }] },

    // super-Jupiters and degenerate matter
    { at: "trend stops", cam: G(9.85, 30.6),
      hl: [WATER, { obj: "Saturn", label: false, place: "left" }, { obj: "Jupiter", label: false }, { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f", delay: 0.6 }] },
    { at: "roughly jupiter", cam: G(9.85, 30.9), hl: [{ obj: "Jupiter", label: "Jupiter size", place: "left" }, { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f", draw: 0.01 }, { obj: "Y Brown Dwarf", label: false, delay: 0.4 }] },
    { at: "pressure in the core", cam: G(9.85, 31.2), hl: [{ obj: "Jupiter", place: "left" }, { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f", draw: 0.01 }, { obj: "Y Brown Dwarf", label: false, delay: 0.4 }] },
    { at: "degenerate matter", cam: G(9.85, 31.6), hl: [{ obj: "Jupiter", place: "left" }, { obj: "Y Brown Dwarf", label: false },
      { obj: "T Brown Dwarf", label: false }, { obj: "L Brown Dwarf", label: "degenerate matter" }] },

    // the split
    { at: "around brown dwarfs", cam: G(9.85, 32.1),
      hl: [{ obj: "Y Brown Dwarf", label: false }, { obj: "T Brown Dwarf", label: false }, { obj: "L Brown Dwarf", label: "brown dwarfs" }] },
    // travel up each branch: the stars to the right, the dead stars to the left
    { at: "veer to the right", cam: C(10.05, 32.3, 2.3),
      hl: [{ obj: "L Brown Dwarf", label: false }, { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f" }] },
    { at: "veer to the left", cam: C(9.75, 32.45, 2.4), hl: [{ obj: "L Brown Dwarf", label: false }, { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f" },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "White Dwarf" }, color: "#90caf9" }] },
    { at: "ordinary matter anymore", cam: STARS, dur: 4, hl: [{ obj: "L Brown Dwarf", label: "brown dwarfs" }, { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f", draw: 0.01 },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "White Dwarf" }, color: "#90caf9", draw: 0.01 }] },
    { at: "life and death of stars", hl: [{ obj: "Sun", label: "stars" }, { obj: "White Dwarf", label: "dead stars", place: "left" },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f", draw: 0.01 },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "White Dwarf" }, color: "#90caf9", draw: 0.01 }] },
  ],
};
