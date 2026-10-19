// =============================================================
// Scene: short-05-black-holes — black holes are a line, not a kind of object:
// the Schwarzschild radius as the limit nothing can cross, every known black
// hole on it, the big ones (less dense than water at the top), then the small
// ones (primordial) and the hunt for them as dark matter, ending on the
// chart's dark-matter line. Recorded 2026-10-19 (rec18, rec19;
// video/short-05-black-holes/).
// =============================================================
// Field reference: see the top of ./tour.js.

const FULL = { r: -2.2, m: -4.8, span: 74 };
// On the Schwarzschild line log R = log M − 27.83 (cm, g).
const BH = (m) => ({ r: m - 27.83, m, mark: true });
const SCHW = { line: "schwarzschild" };
const KNOWN = { dust: "blackhole", sweep: 1.6 };

export default {
  title: "Black holes",
  blurb: "Not an object but a line: the limit of the chart, from TON 618 to primordial black holes and dark matter.",
  start: FULL,

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md)
  backing: "Mesmerize",
  sound: [
    { at: "simply collapse into a black hole", fx: "drop", atEnd: true, offset: -0.3 },
    { at: "float on a pool", fx: "bubble", offset: 0.2 },
  ],

  captionFixes: { novus: "nurseries", math: "mass" },

  cues: [
    // ── The chart so far ─────────────────────────────────────
    { at: "anything that ever existed", cam: FULL, dur: 2, hl: [{ line: "triangle" }] },
    { at: "vertical axis", hl: [{ axis: "left", label: "mass" }] },
    { at: "horizontal axis", hl: [{ axis: "bottom", label: "size" }] },
    { at: "density scatter plot", cam: { r: 2, m: 6, span: 44 }, hl: [{ line: "water", label: "density" }] },
    { at: "stellar nurseries", cam: { r: 14, m: 34, span: 11 }, hl: [{ obj: "Nebulae", label: "stellar nursery" }, { obj: "Protostar", delay: 0.6 }] },
    { at: "expand and collapse", hl: [{ swing: [{ obj: "Sun" }, { obj: "Red Giant" }], period: 2.4 }] },
    { at: "supernova", hl: [{ obj: "Supernova Remnant", label: "supernova remnant" }] },
    { at: "leave behind a core", cam: { r: 8.6, m: 33.6, span: 8 }, clear: true },
    { at: "white dwarf", hl: [{ obj: "White Dwarf", place: "left" }] },
    { at: "neutron star", hl: [{ obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: "neutron star", place: "right" }] },
    { at: "strangest object", hl: [{ obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: false }, { obj: "Stellar BH", label: "black hole" }] },

    // ── Not an object: a line ────────────────────────────────
    // everything else is a cloud of catalogue dots: pictures off, the clouds circled
    // (ellipses fitted to the dust: 5–95% of each catalogue)
    { at: "unlike most of the other objects", cam: { r: 15.2, m: 35.6, span: 17 }, clear: true, icons: false },
    { at: ["cloud of dots", "appears as dots"], hold: 8, hl: [
      { ellipse: [9.5, 29.65, 0.75, 1.6], label: "planets", place: "below", color: "#90caf9" },
      { ellipse: [9.05, 33.0, 0.42, 0.45], label: "white dwarfs", place: "left", color: "#e0e0e0", delay: 0.25 },
      { ellipse: [11.3, 33.45, 1.15, 0.7], label: "stars", place: "right", color: "#ffd54f", delay: 0.5 },
      { ellipse: [19.4, 37.2, 1.1, 2.2], label: "nebulae & clusters", place: "left", color: "#ce93d8", delay: 0.75 },
      { ellipse: [21.85, 41.6, 0.95, 2.3], label: "galaxies", place: "above", color: "#80deea", delay: 1 },
    ] },
    { at: "but a line", icons: true, hl: [{ ...SCHW, label: "black holes" }] },
    { at: "three sides", cam: FULL, hl: [{ line: "triangle" }, { ...SCHW, label: "black holes" }] },
    { at: "limit of both mass and size", hl: [{ ...SCHW, label: "the limit" }] },
    { at: "more massive or more compact", cam: { r: 5, m: 28, span: 16 },
      hl: [SCHW, { obj: "Earth" }, { arrow: true, from: { obj: "Earth" }, to: BH(27.78), label: "squeeze to 9 mm", delay: 0.6 }] },
    { at: "called the schwarzschild radius", hl: [{ ...SCHW, label: "schwarzschild radius" }] },
    { at: "past, present", hl: [{ ...SCHW, label: "nothing crosses it" }, { side: "left", of: "schwarzschild" }] },
    { at: "doesn't really have a size", cam: { obj: "Stellar BH", span: 6 }, hl: [SCHW, { obj: "Stellar BH", label: "black hole" }] },
    { at: "event horizon", hl: [SCHW, { obj: "Stellar BH", label: "size = event horizon" }] },
    { at: "directly proportional", cam: { r: 4, m: 31, span: 24 }, hl: [{ ...SCHW, label: "1 : 1 · 45°" }] },
    { at: "anything that reaches this line", hl: [{ ...SCHW, label: "every black hole is here" }] },

    // ── The big ones ─────────────────────────────────────────
    { at: "massive stars collapse", cam: { r: 8, m: 34, span: 12 }, hl: [{ obj: "PSR J0030+0451", label: false }, { obj: "Stellar BH", label: "collapsed stars" }] },
    { at: "all known black holes", cam: { r: 11, m: 38.6, span: 20 }, hl: [{ ...KNOWN, label: "every known black hole", labelY: 0.16 }] },
    { at: "follow the same line", hl: [KNOWN, SCHW] },
    { at: "size of stars", cam: { r: 7.5, m: 35.3, span: 7 }, hl: [KNOWN, { obj: "Stellar BH", label: "a few suns" }] },
    { at: "center of galaxies", cam: { r: 14, m: 41.5, span: 12 }, hl: [KNOWN] },
    { at: "our own milky way", hl: [KNOWN, { obj: "Sgr A*", label: "sgr a* · our galaxy's" }] },
    { at: "andromeda galaxy", cam: { r: 17.5, m: 43.3, span: 15 },
      hl: [KNOWN, { obj: "Sgr A*", label: false }, { obj: "Andromeda (M31)", label: "andromeda", place: "left" },
        { arrow: true, from: { obj: "Andromeda (M31)" }, to: BH(41.45), label: "its black hole", delay: 0.6 }] },
    { at: "m87", cam: { r: 15.4, m: 43.3, span: 7 }, hl: [KNOWN, { obj: "M87*", label: "m87* · first photographed", place: "left" }] },
    { at: "largest black hole we know", hl: [KNOWN, { obj: "M87*", label: false }, { obj: "Ton 618", label: "ton 618 · 66 billion suns", place: "left" }] },
    { at: "swallow our whole solar system", hl: [{ obj: "M87*", label: false }, { obj: "Ton 618", label: "horizon ≈ 40× neptune's orbit", place: "left" }] },
    { at: "become less dense", cam: { r: 13.5, m: 41.3, span: 14 }, hl: [SCHW, { line: "water", label: "water" }] },
    { at: "less dense than water", hl: [SCHW, { line: "water", label: "water" }, { side: "right", of: "water" },
      { obj: "Sgr A*", label: "denser than water", place: "left" }, { obj: "M87*", label: "lighter than water", delay: 0.6 }] },
    { at: "float on a pool", hl: [{ line: "water" }, { side: "right", of: "water" }, { obj: "M87*", label: "it would float" }, { obj: "Ton 618", label: false }] },

    // ── The small ones ───────────────────────────────────────
    { at: "other end of this line", cam: { r: 2, m: 28, span: 46 }, dur: 3, clear: true, hl: [SCHW] },
    { at: "smaller black holes", cam: { r: -6, m: 22, span: 30 }, hl: [{ ...SCHW, label: "smaller black holes" }] },
    { at: "giant stars collapse", hl: [SCHW] },
    { at: "any size", hl: [{ ...SCHW, label: "any size" }] },
    { at: "very early moments", cam: { r: -8, m: 18, span: 34 }, clear: true },
    // the map draws the window still open to them (1e17–1e22 g) and what rules out
    // the rest: Hawking radiation below, microlensing above
    { at: "looking for them", cam: { r: -8.3, m: 19.5, span: 12 }, clear: true },
    { at: "many sizes", cam: { r: -8.8, m: 19.3, span: 15 } },
    { at: "some ranges", hl: [{ arrow: true, from: { r: -4.6, m: 17.6 }, to: BH(19.5), label: "still open", delay: 0.3 }] },
    { at: "small asteroid", hl: [{ obj: "Eros", label: "an asteroid" },
      { arrow: true, from: { obj: "Eros" }, to: BH(18.83), label: "smaller than an atom", delay: 0.6 }] },
    { at: "grain of sand", cam: { r: -2, m: 22.5, span: 24 }, hl: [{ obj: "Moon" },
      { arrow: true, from: { obj: "Moon" }, to: BH(25.87), label: "the moon → a grain of sand · ruled out", delay: 0.3 }] },
    { at: "single proton", cam: { r: -11, m: 16.5, span: 16 },
      hl: [{ arrow: true, from: { r: -9.5, m: 13 }, to: BH(14.7), label: "proton-sized · evaporated", delay: 0.2 }] },
    { at: "those are primordial", cam: { r: -8.3, m: 19.5, span: 12 }, clear: true },

    // ── Dark matter ──────────────────────────────────────────
    { at: "galaxies as a whole", cam: { obj: "Milky Way", span: 7 }, clear: true, hl: [{ obj: "Milky Way" }] },
    { at: "full of something", hl: [{ obj: "Milky Way", label: "mostly invisible mass" }] },
    { at: "new physics", hl: [{ obj: "Milky Way", label: "black holes?" }] },
    { at: "missing dark matter", cam: { r: 21, m: 42, span: 22 }, clear: true },
    { at: "looking at galaxies", hl: [{ obj: "Milky Way" }, { obj: "Dwarf Galaxy", delay: 0.3 }, { obj: "Andromeda (M31)", label: false, delay: 0.6 }] },
    { at: "galaxies and clusters", hl: [{ obj: "Milky Way" }, { obj: "Dwarf Galaxy" }, { obj: "Galaxy Cluster", delay: 0.3 }] },
    { at: "separate diagonal line", hl: [{ line: "water", label: "atoms" }, { line: "darkmatter", label: "galaxies", delay: 0.8 }] },
    { at: "much larger than", hl: [{ line: "water", label: "atoms" }, { line: "darkmatter", label: "far bigger for their mass" }] },
    { at: "existence of dark matter", hl: [{ line: "darkmatter", label: "dark matter" }] },
  ],
};
