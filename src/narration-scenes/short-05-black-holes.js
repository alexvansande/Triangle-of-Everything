// =============================================================
// Scene: short-05-black-holes — black holes are a line, not a kind of object:
// the Schwarzschild radius as the limit nothing can cross, every known black
// hole on it, the big ones (less dense than water at the top), then the small
// ones (primordial) and the hunt for them as dark matter, ending on the
// chart's dark-matter line. Recorded 2026-10-19 (rec18, rec19;
// video/short-05-black-holes/).
// =============================================================
// Field reference: docs/narration.md, "Scene fields".

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
    { at: "called the schwarzschild radius", hl: [{ ...SCHW, label: "schwarzschild radius" }] },
    { at: "past, present", hl: [{ ...SCHW, label: "nothing crosses it" }, { side: "left", of: "schwarzschild" }] },
    { at: "more massive or more compact", cam: { r: 5, m: 28, span: 16 },
      hl: [SCHW, { obj: "Earth" }, { arrow: true, from: { obj: "Earth" }, to: BH(27.78), label: "squeeze to 9 mm", delay: 0.6 }] },
    { at: "doesn't really have a size", cam: { obj: "Stellar BH", span: 6 }, hl: [SCHW, { obj: "Stellar BH", label: "black hole" }] },
    { at: "event horizon", hl: [SCHW, { obj: "Stellar BH", label: "size = event horizon" }] },
    { at: "directly proportional", cam: { r: 4, m: 31, span: 24 }, hl: [{ ...SCHW, label: "1 : 1 · 45°" }] },
    { at: "anything that reaches this line", hl: [{ ...SCHW, label: "every black hole is here" }] },

    // ── The big ones ─────────────────────────────────────────
    { at: "massive stars collapse", cam: { r: 8, m: 34, span: 12 }, hl: [{ obj: "PSR J0030+0451", label: false }, { obj: "Stellar BH", label: "collapsed stars" }] },
    { at: "all known black holes", cam: { r: 11, m: 38.6, span: 20 }, hl: [{ ...KNOWN, label: "every known black hole", labelY: 0.16 }] },
    { at: "follow the same line", hl: [SCHW] },
    { at: "size of stars", cam: { r: 7.5, m: 35.3, span: 7 }, hl: [{ obj: "Stellar BH", label: "a few suns" }] },
    { at: "center of galaxies", cam: { r: 14, m: 41.5, span: 12 }, hl: [SCHW] },
    { at: "our own milky way", hl: [{ obj: "Sgr A*", label: "sgr a* · our galaxy's" }] },
    { at: "andromeda galaxy", cam: { r: 17.5, m: 43.3, span: 15 },
      hl: [{ obj: "Sgr A*", label: false }, { obj: "Andromeda (M31)", label: "andromeda", place: "left" },
        { arrow: true, from: { obj: "Andromeda (M31)" }, to: BH(41.45), label: "its black hole", delay: 0.6 }] },
    { at: "become less dense", cam: { r: 13.5, m: 41.3, span: 14 }, hl: [SCHW, { line: "water", label: "water" }] },
    { at: "less dense than water", hl: [SCHW, { line: "water", label: "water" }, { side: "right", of: "water" },
      { obj: "Sgr A*", label: "denser than water", place: "left" }, { obj: "M87*", label: "lighter than water", delay: 0.6 }] },
    { at: "float on a pool", hl: [{ line: "water" }, { side: "right", of: "water" }, { obj: "M87*", label: "it would float" }, { obj: "Ton 618", label: false }] },
    { at: "m87", cam: { r: 15.4, m: 43.3, span: 7 }, hl: [{ obj: "M87*", label: "m87* · first photographed", place: "left" }] },
    { at: "largest black hole we know", hl: [{ obj: "M87*", label: false }, { obj: "Ton 618", label: "ton 618 · 66 billion suns", place: "left" }] },
    { at: "swallow our whole solar system", hl: [{ obj: "M87*", label: false }, { obj: "Ton 618", label: "horizon ≈ 40× neptune's orbit", place: "left" }] },

    // ── The small ones (rec20) ───────────────────────────────
    { at: "smallest possible ones", cam: { r: -4, m: 24, span: 40 }, dur: 3, clear: true, hl: [{ ...SCHW, label: "the smallest" }] },
    { at: "giant stars collapse", cam: { obj: "Stellar BH", span: 8 }, hl: [{ obj: "Stellar BH", label: "collapsed stars" }] },
    { at: "any mass into a black hole", cam: { r: 3, m: 28, span: 24 },
      hl: [SCHW, { obj: "Earth" }, { arrow: true, from: { obj: "Earth" }, to: BH(27.78), label: "squeeze to 9 mm", delay: 0.6 }] },
    { at: "conditions exist when a star", cam: { obj: "Stellar BH", span: 8 }, hl: [{ obj: "Stellar BH", label: "collapsing stars" }] },
    { at: "very early moments", cam: { r: -8, m: 18, span: 34 }, clear: true },
    // the map draws the window still open to them (1e17–1e22 g) and what rules out
    // the rest: Hawking radiation below, microlensing above
    { at: "some of them have remained", cam: { r: -8.3, m: 19.5, span: 12 }, clear: true },
    { at: "mass of stars and planets", cam: { r: -5.4, m: 22.6, span: 10 } },
    { at: "much smaller", cam: { r: -11, m: 16.6, span: 10 } },
    { at: "this range", cam: { r: -8.3, m: 19.5, span: 12 }, hl: [{ arrow: true, from: { r: -4.6, m: 17.6 }, to: BH(19.5), label: "still open", delay: 0.3 }] },
    { at: ["small moon", "a small moon"], cam: { r: -1.5, m: 18.8, span: 18 }, hl: [
      { obj: "Phobos", label: "a small moon" }, { arrow: true, from: { obj: "Phobos" }, to: BH(19.03), label: "smaller than an atom", delay: 0.4 },
      { obj: "Mt. Everest", label: "a mountain", place: "below", delay: 1.2 }] },
    { at: "don't know if it exists", cam: { r: -8.3, m: 19.5, span: 12 }, clear: true },

    // ── Dark matter ──────────────────────────────────────────
    { at: "detect their presence", cam: { obj: "Milky Way", span: 7 }, clear: true, hl: [{ obj: "Milky Way" }] },
    { at: "those effects exist", hl: [{ obj: "Milky Way", label: "more mass than we can see" }] },
    { at: "large galaxies on this graph", cam: { r: 18, m: 38, span: 34 }, clear: true,
      hl: [{ obj: "Milky Way" }, { obj: "Andromeda (M31)", label: false, delay: 0.3 }, { obj: "Galaxy Cluster", delay: 0.6 }] },
    { at: "atomic diagonal line", hl: [{ line: "water", label: "atoms" }] },
    { at: "clusters of galaxies", hl: [{ line: "water", label: "atoms" }, { obj: "Milky Way" }, { obj: "Galaxy Cluster", delay: 0.3 }] },
    { at: "this other one", hl: [{ line: "water", label: "atoms" }, { line: "darkmatter", label: "galaxies" }] },
    { at: "much more massive", hl: [{ line: "water", label: "atoms" }, { line: "darkmatter", label: "more mass than we can see" }] },
    { at: ["what we call dark matter", "call dark matter"], hl: [{ line: "darkmatter", label: "dark matter" }] },
    { at: "if primordial black holes exist", hl: [{ line: "darkmatter", label: "primordial black holes?" }] },

    // ── Cliffhanger: where the galaxies' line ends ───────────
    { at: "follow that line of galaxies", cam: { r: 25, m: 49, span: 16 }, hl: [{ line: "darkmatter" }] },
    { at: "next side of our triangle", cam: FULL, dur: 3, hl: [{ line: "darkmatter" }, { line: "hubble", label: "next video", delay: 0.6 }] },
    { at: "another limit", hl: [{ line: "hubble", label: "another limit" }] },
  ],
};
