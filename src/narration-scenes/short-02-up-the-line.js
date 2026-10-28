// =============================================================
// Scene: short-02-up-the-line — video 2: the diagonal; a millilitre of water as a
// cube, then as a ball (how the chart measures size); walking up the water line
// in grid squares (×10 size, ×1000 volume and mass); sink or float, and the air
// line with the balloons; animals in a thin band, the hippo, the elephants,
// dinosaurs, the whale and the sequoia; the Eiffel Tower, the pyramid, lakes,
// asteroids and small moons; round worlds; atmospheres, the Goldilocks zone, gas giants, Saturn;
// super-Jupiters and degenerate matter; the split at the brown dwarfs.
// Recorded 2026-10-26 (rec33; video/short-02-up-the-line/), re-keyed to its words;
// the 2026-10-23 cut (rec32) and the 2026-10-21 one (rec27 + rec28) are in git history.
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
// rocky to gassy: the trend the exoplanet dots follow from the super-Earths (above
// Kepler-22b) to just under Saturn, as the author drew it; past ~2 Earth masses
// (Chen & Kipping 2017) planets hold on to gas and swell faster than they gain mass
const ROCKY_GAS = { trend: [[8.97, 28.43], [9.93, 29.63]], color: "#4dd0e1" };
// the pan from the round worlds to the brown dwarfs: waypoints at their cue times
const G = (r, m) => ({ r, m, span: PAN, glide: true });
// from the brown dwarfs, one slow zoom out to the end: just enough for the red giant and
// the neutron star
const STARS = { r: 9.48, m: 32.7, span: 7.8 };
const PAN = 2.2;
// what holds a body's shape, either side of the round-world mass (between Vesta and Ceres)
const ROUND_M = 23.7;
// the rocky worlds that keep an atmosphere of heavy gases (N₂, O₂, CO₂) but lose hydrogen and
// helium: from Mars (6×10²⁶ g, a thin one) to about 2 Earth masses (~10²⁸ g), past which planets
// start holding on to hydrogen and puff up. Titan (10²⁶ g) has one too, being so cold:
// "for its temperature"
const AIR_BAND = { poly: [[-40, 26.8], [60, 26.8], [60, 28.08], [-40, 28.08]], fill: "#66bb6a", opacity: 0.16,
  label: "Goldilocks zone", note: "rocky worlds with air", labelCenter: true, labelSize: 28, labelColor: "#a5d6a7" };
// below it a body's shape is held by its material strength, all of it electromagnetic (chemical
// bonds, crystal stiffness, friction between grains); above it self-gravity crushes it round
const BONDS = { side: "below", mass: ROUND_M, label: "electromagnetism\ndominates", note: "(chemical bonds, crystal\nstiffness, friction, etc.)", labelCenter: true, labelSize: 26 };
const GRAVITY = { side: "above", mass: ROUND_M, label: "gravity\ndominates", labelCenter: true, labelSize: 26 };                            // span of the rocks → round worlds pan (as wide as the animals')
// one grid square (a decade of size × a decade of mass) with its bottom-left corner at (r, m)
const SQ = (r, m, delay = 0) => ({ poly: [[r, m], [r + 1, m], [r + 1, m + 1], [r, m + 1]], fill: "#ffd54f", opacity: 0.35, delay });
const STEP_RIGHT = [{ arrow: true, from: ML, to: RIGHT, label: "×10 size" }, SQ(-0.207, -1)];
const STEP_UP = [{ arrow: true, from: RIGHT, to: LITER, label: "×1000 volume" }, SQ(0.793, 0, 0.3), SQ(0.793, 1, 0.8), SQ(0.793, 2, 1.3)];
const HEAVIER = [{ ...STEP_UP[0], label: "×1000 heavier" }, ...STEP_UP.slice(1)];   // the same step, once it's a kilogram
// the Eiffel Tower's close-up (its cues): its outline, then two copies at the other volumes
const EIFFEL = { trace: "Eiffel Tower", grow: 2.6, shapes: [
  { label: ["≈ 1.6 million m³", "6.5 kg per m³"], place: "above" },
  { at: { rho: 0.0306 }, holes: true, label: ["≈ 330,000 m³", "30 kg per m³"], place: "below" },
  { at: { rho: 7.8 }, holes: true, lattice: true, label: ["1,300 m³ of iron", "7,800 kg per m³"], place: "below" }] };
const EIFFEL_LINES = [{ line: "water", label: "water" }, { line: "air", label: "air" }];
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
  // "lots of engineering and big rocks": rocks, hills and monuments go first on the
  // pyramid's screen, ahead of the ships and lakes (where one would overlap a picture
  // already there, it gives way)
  alsoIcons: ["Big Rock (Okotoks)", "Totem Pole (Monument Valley)", "Colosseum", "Morro do Pai Inácio", "Uluru",
    "Stonehenge", "Stone of the Pregnant Woman", "Devils Tower", "West Mitten Butte"],
  backing: "Soaring",
  sound: [
    { at: "to the right will float", fx: "bubble", offset: 0.9 },
    { at: "can't actually swim", fx: "glug", offset: 0.2, gain: 2 },
    { at: "lightest gases", fx: "hiss", offset: 0.3 },
    { at: "less dense than water", fx: "bubble", offset: 0.8 },
  ],

  cues: [
    // the diagonal
    { at: "draw everything that exists", cam: INSECTS, dur: 11, drift: 0.02,
      hl: [{ obj: "Ant", delay: 1.5 }, { obj: "Ladybug", delay: 2.5 }, { obj: "Microchip", delay: 3.5 }] },
    { at: "these diagonal lines", hl: [{ line: "water", label: "the diagonal" }] },

    // a millilitre of water: a cube 1 cm wide, then the same water as a ball
    { at: "in the metric system", cam: { obj: "1ml of water (cube)", dr: 0.033, span: 0.3 }, units: true, unitsUntil: "that's okay",
      hl: [{ ...CUBE, label: "1 mL · 1 gram" }] },
    { at: "fill a cube", hl: [{ ...CUBE, label: "a cube 1 cm wide" }] },
    { at: "measure sizes as spheres",
      hl: [{ ...CUBE, label: "cube · 1 cm" }, { arrow: true, from: CUBE, to: ML, color: "#80deea" }, { ...ML, label: "ball · 1.24 cm", delay: 0.6 }] },
    { at: "a little bit to the side",
      hl: [{ ...CUBE, label: "cube" }, { arrow: true, from: CUBE, to: ML, color: "#80deea", draw: 0.01 }, { ...ML, label: "a little to the side" }] },

    // walking up the line: the grid's squares are decades, counted out beside the
    // arrows, with the axis each move is measured on lit up
    { at: "multiply all three sides", cam: { r: 0.3, m: 1.5, span: 2.7 }, focus: [ML.obj, LITER.obj], units: true, unitsUntil: "density of water",
      hl: [{ ...ML, label: "1 mL · 1 cm" }] },
    { at: "one step to the side",
      hl: [{ ...ML, label: "1 mL" }, ...STEP_RIGHT, { axis: "bottom", label: "size ×10" }] },
    { at: "volume by a thousand",
      hl: [{ ...ML, label: "1 mL" }, ...drawn(STEP_RIGHT), ...STEP_UP] },
    { at: "that's one kilogram",
      hl: [{ ...ML, label: "1 mL", place: "left" }, ...drawn(STEP_RIGHT), ...drawn(HEAVIER), { ...LITER, label: "1 liter · 1 kg" }] },
    { at: "three steps up", hl: [{ ...ML, place: "left" }, ...drawn(STEP_RIGHT), ...drawn(HEAVIER), { ...LITER, label: "3 squares up" }] },
    { at: "do it again", cam: WIDE, dur: 3, drift: 0.04, focus: [ML.obj, LITER.obj, TONNE.obj],
      hl: [{ ...ML, place: "left" }, { ...LITER, label: "1 kg", place: "left" }, { arrow: true, from: LITER, to: TONNE, label: "×10 size · ×1000 mass" }, { ...TONNE, label: "1 tonne", delay: 0.8 }] },
    { at: "draw a diagonal line", focus: false, cam: C(1.2, 3.6, 4.6),
      hl: [{ ...ML, label: false }, { ...LITER, label: false }, { ...TONNE, label: false }, WATER] },
    // no camera point here: it came 0.3 s after the flight into the glide ended, a sudden hop
    // (the author's note, 2026-10-27); the glide runs on to "denser than water"
    { at: "density of water", hl: [{ line: "water", label: "density of water" }] },

    // sink or float, in water and in air
    { at: "denser than water", cam: C(0.7, 2.35, 2.5), hl: [WATER, { side: "left", label: "sinks" }] },
    { at: "made of stone", cam: C(0.68, 2.4, 2.45),
      hl: [WATER, { obj: "Bust of Queen Nefertiti", label: "Nefertiti · limestone", place: "left" }] },
    { at: "and metal", cam: C(0.7, 2.4, 2.4),
      hl: [WATER, { obj: "Voyager Golden Record", label: "golden record · copper" }] },
    { at: "to the right will float", cam: C(1.1, 3.4, 2.35), hl: [WATER, { side: "left", label: "sinks" }, { side: "right", label: "floats" }] },
    // the air line runs to the right of the water line, a thousand times less dense
    { at: "density of air", cam: C(1.5, 4.2, 2.3), hl: [WATER, { line: "air", label: "density of air" }] },
    { at: "heavier than air", cam: C(1.9, 5.0, 2.2), hl: [WATER, { ...AIR, label: "lighter than air →" }] },
    { at: "lighter than air aircraft", cam: C(2.4, 5.8, 2.1),
      hl: [AIR, { obj: "Zeppelin NT" }, { obj: "Hot-air Balloon", delay: 0.3 }] },
    { at: "balloons and zeppelins", cam: C(2.45, 6.0, 2.0),
      hl: [AIR, { obj: "Zeppelin NT", label: "zeppelin" }, { obj: "Hot-air Balloon", label: "balloon" }] },

    // animals and what we build: the glide carries on, a bit over a decade and a half
    // wide, then up the line (waypoints at their cue times) on to the round worlds
    { at: "much narrower band", cam: C(1.8, 6.0, 1.7), hl: [WATER, { obj: "Human" }] },
    { at: "mostly made of water", cam: C(1.85, 6.15, 1.6), hl: [WATER, { obj: "Human", label: "mostly water" }] },
    { at: "denser than others", cam: C(1.92, 6.35, 1.5), hl: [{ obj: "Hippopotamus" }, WATER] },
    { at: "can't actually swim", cam: UP(1.95, 1.5),
      hl: [{ obj: "Hippopotamus", label: "hippo · 1.05 g/cm³" }, WATER, { side: "left", label: "sinks" }] },

    { at: "heavier and heavier animals", cam: UP(2.1, 1.5), hl: [WATER, { obj: "Elephant", label: "elephants" }] },
    { at: "argentinosaurus", cam: UP(2.3, 1.6), hl: [WATER, { obj: "Elephant", place: "left" }, { obj: "Argentinosaurus", label: "Argentinosaurus", delay: 0.2 }] },
    { at: "the blue whale", cam: UP(2.55, 1.9), hl: [{ obj: "Blue Whale", label: "largest animal ever" }] },
    { at: "the largest tree", cam: UP(2.85, 2.2), hl: [{ obj: "Blue Whale", place: "left" }, { obj: "Sequoia", label: "largest tree" }] },

    // what we build
    { at: "to engineering", cam: UP(3.15, 3.2), dur: 2, clear: true,
      hl: [{ obj: "Boeing 747" }, { obj: "Supertanker", delay: 0.3 }] },
    { at: "the eiffel tower", cam: C(3.75, 10.05, 3.4), hl: [{ obj: "Eiffel Tower" }] },
    // the close-up (the author, 2026-10-28, in place of the dive): the camera zooms onto the
    // tower, its picture grows, and everything else on the chart fades but the grid, the water
    // and air lines and the catalogue dots; its outline is traced and the picture fades; then
    // a copy of the outline moves to where a second way of measuring its volume puts it on
    // the chart, and another to the third. Same mass (10,100 t), three volumes:
    //   1. everything inside its envelope, the air too: ~1.56 million m³ (a 125 m square base,
    //      300 m tall), 6.5 kg per m³: where the chart puts it (src/bulk-density.js), near the air line;
    //   2. its silhouette without the space under the arches and between the first two floors:
    //      ~330,000 m³, 30 kg per m³;
    //   3. the iron alone, at 7.8 t per m³: 1,300 m³, left of the water line (it would sink).
    { at: "surprisingly light", cam: { obj: "Eiffel Tower", dm: 0.02, span: 1.3 }, quiet: true, dur: 2.4, drift: 0.04,
      hl: [{ ...EIFFEL, step: -1 }, ...EIFFEL_LINES] },
    { at: "also counting all", hl: [{ ...EIFFEL, step: 0 }, ...EIFFEL_LINES] },
    // (the first copy lands only a fifth of a decade to the left: a closer look, then out
    // enough for the iron, the outlines shrinking to make room)
    { at: "in many ways", cam: { r: 3.76, m: 10.03, span: 1.1 }, quiet: true, dur: 1.6, drift: 0.03,
      hl: [{ ...EIFFEL, step: 1, grow: 1.7, draw: 0.9 }, ...EIFFEL_LINES] },
    // the iron lattice, the third shape: "fractal"
    { at: "fractal", offset: -0.6, cam: { r: 3.38, m: 10.02, span: 1.7 }, quiet: true, dur: 1.4, drift: 0.03,
      hl: [{ ...EIFFEL, step: 2, grow: 1.1, move: 1.1 }, ...EIFFEL_LINES] },

    // rocks, lakes, asteroids and small moons
    { at: "lots of big rocks", cam: C(4.05, 11.3, 3.9), hl: [{ obj: "Great Pyramid" }] },
    { at: "both categories", cam: C(4.3, 12.6, 4.1), hl: [{ obj: "Great Pyramid", label: "rock and building" }, { obj: "Mt. Everest", delay: 0.3 }] },
    // the lakes sit below the line (wide and flat): the pan dips to them
    { at: "lakes and asteroids", cam: C(5.2, 15.6, 4.4),
      hl: [{ obj: "Königssee", label: "lakes", place: "right" }, { obj: "Hallstätter See", label: false, delay: 0.2 },
        { obj: "Lake Nyos", label: false, delay: 0.4 }, { obj: "Eros", label: "asteroids", delay: 0.6 }] },
    { at: "small moons", cam: C(6.0, 18.4, 3.8), hl: [{ obj: "Eros", place: "left" }, { obj: "Deimos", label: false }, { obj: "Phobos", label: "moons of Mars" }] },

    // round worlds
    { at: "less potato", cam: { r: 7.2, m: 22.2, span: PAN, glide: true },
      hl: [{ obj: "Hyperion", place: "left", label: "Hyperion · lumpy" }, { obj: "Vesta", delay: 0.4 }, { obj: "Ceres", delay: 0.8 }, { obj: "Pluto", delay: 1.2 }] },
    // the line between them: the last lumpy asteroid (Vesta) and the first round one (Ceres).
    // Icy moons round up lighter (ice is softer than rock): Mimas is round below it, so it's left out here
    { at: "chemical bonds", cam: { r: 7.45, m: 23.62, span: PAN, glide: true }, hl: [BONDS, { obj: "Hyperion", place: "left" }, { obj: "Vesta", label: "Vesta · lumpy" }] },
    { at: "gravity takes over", cam: { r: 7.6, m: 23.72, span: PAN, glide: true }, hl: [BONDS, GRAVITY, { obj: "Vesta", label: "Vesta · lumpy" }, { obj: "Ceres", label: "Ceres · round", delay: 0.3 }] },
    { at: "shapes planets", cam: G(7.8, 23.95), hl: [BONDS, GRAVITY, { obj: "Ceres" }, { obj: "Pluto", label: "Pluto · round" }] },

    // atmospheres
    { at: "mercury nor the moon", cam: G(8.35, 26.1), hl: [{ obj: "Moon", label: "Moon · none", place: "left" }, { obj: "Mercury", label: "Mercury · none", place: "left" }] },
    // close enough that both Venus's and Earth's pictures show
    { at: "venus and earth", cam: G(8.7, 27.4), hl: [{ obj: "Mercury", place: "left" }, { obj: "Earth", delay: 0.2 }, { obj: "Venus", place: "left", delay: 0.5 }] },
    { at: "lightest gases", cam: G(9.0, 28.2), hl: [{ obj: "Earth", label: "hydrogen escapes" }] },

    // gas giants
    { at: "made of those two", cam: G(9.3, 28.9),
      hl: [{ obj: "Neptune", place: "left" }, { obj: "Saturn", delay: 0.3 }, { obj: "Jupiter", delay: 0.6 }] },
    // a slow push onto the gas giants (their own icons, no cutaway)
    { at: "a gas giant", cam: G(9.45, 29.0),
      hl: [{ obj: "Neptune", place: "left" }, { obj: "Saturn", label: "gas giants" }, { obj: "Jupiter", label: false }] },
    // back to Earth: just enough gravity for its air, not enough for hydrogen
    { at: "goldilocks zone", cam: G(8.85, 27.6), hl: [AIR_BAND, { obj: "Mars", label: false }, { obj: "Earth", label: false }, { obj: "Venus", place: "left", label: false }] },
    { at: "oxygen and nitrogen", cam: G(8.9, 27.7), hl: [{ ...AIR_BAND, instant: true }, { obj: "Earth", label: "keeps oxygen, nitrogen" }] },
    { at: "not enough to hold", cam: G(9.0, 27.9), hl: [{ ...AIR_BAND, instant: true }, { obj: "Earth", label: "loses hydrogen, helium" }] },
    { at: "following the rocky planets", cam: G(9.5, 29.15), hl: [ROCKY_GAS, WATER, { obj: "Earth", label: "rocky planets", place: "left" }, { obj: "Venus", label: false, place: "left" }] },
    { at: "mostly made of gas", cam: G(9.6, 29.5), hl: [{ ...ROCKY_GAS, draw: 0.01 }, WATER, { obj: "Earth", place: "left" }, { obj: "Neptune", place: "left" }, { obj: "Saturn", delay: 0.3 }, { obj: "Jupiter", label: "mostly gas", delay: 0.6 }] },
    { at: "less dense than water", cam: G(9.75, 30.1), hl: [WATER, { obj: "Saturn", label: "Saturn · would float", place: "left" }] },

    // super-Jupiters and degenerate matter
    { at: "trend stops", cam: G(9.85, 30.6),
      hl: [WATER, { obj: "Saturn", label: false, place: "left" }, { obj: "Jupiter", label: false }, { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f", delay: 0.6 }] },
    { at: "still roughly", cam: G(9.85, 30.9), hl: [{ obj: "Jupiter", label: "Jupiter size", place: "left" }, { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f", draw: 0.01 }, { obj: "Y Brown Dwarf", label: false, delay: 0.4 }] },
    { at: "pressure in their core", cam: G(9.85, 31.2), hl: [{ obj: "Jupiter", place: "left" }, { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f", draw: 0.01 }, { obj: "Y Brown Dwarf", label: false, delay: 0.4 }] },
    { at: "degenerate matter", cam: G(9.85, 31.6), hl: [{ obj: "Jupiter", place: "left" }, { obj: "Y Brown Dwarf", label: false },
      { obj: "T Brown Dwarf", label: false }, { obj: "L Brown Dwarf", label: "degenerate matter" }] },

    // the split
    { at: "about brown dwarfs", cam: G(9.85, 32.1),
      hl: [{ obj: "Y Brown Dwarf", label: false }, { obj: "T Brown Dwarf", label: false }, { obj: "L Brown Dwarf", label: "brown dwarfs" }] },
    // travel up each branch: the stars to the right, the dead stars to the left
    { at: "veer to the right",
      hl: [{ obj: "L Brown Dwarf", label: false }, { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f" }] },
    { at: "veer to the left", hl: [{ obj: "L Brown Dwarf", label: false }, { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f" },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "White Dwarf" }, color: "#90caf9" }] },
    { at: "story of ordinary matter", hl: [{ obj: "L Brown Dwarf", label: "brown dwarfs" }, { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f", draw: 0.01 },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "White Dwarf" }, color: "#90caf9", draw: 0.01 }] },
    { at: "life and death of stars", cam: { ...STARS, glide: true }, drift: -0.04, hl: [{ obj: "Sun", label: "stars" }, { obj: "White Dwarf", label: "dead stars", place: "left" },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f", draw: 0.01 },
      { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "White Dwarf" }, color: "#90caf9", draw: 0.01 }] },
  ],
};
