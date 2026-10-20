// =============================================================
// Scene: short-05b-black-holes — video 5 re-recorded in one take (rec21,
// 2026-10-20; video/short-05b-black-holes/), kept next to short-05 until one is
// picked: the chart so far, black holes as the top-left limit, the known ones
// from stellar to TON 618, the small ones, the surveys and the open window, the
// galaxies sliding down without their dark matter, and the empty-space diagonal
// up to the next side.
// =============================================================
// Field reference: docs/narration.md, "Scene fields".

const FULL = { r: -2.2, m: -4.8, span: 74 };
// On the Schwarzschild line log R = log M − 27.83 (cm, g).
const BH = (m) => ({ r: m - 27.83, m, mark: true });
const SCHW = { line: "schwarzschild" };
const KNOWN = { dust: "blackhole", sweep: 1.6 };
// galaxies and galaxy clusters as catalogue dots; without their dark matter each
// drops about a decade (big spirals 0.8–1, clusters ~0.85 counting their hot gas)
// primordial black holes: the window (log10 g) and the masses each survey rules out
const W0 = [-4.7, 38.3], W1 = [-4.7, 37.3], W2 = [-4.7, 34.3], W3 = [-4.7, 33.3], W4 = [-4.7, 22], W5 = [17, 22], W6 = [17, 18];
const QSO = { m: [37.3, 38.3] };   // Lyman-alpha forest in quasar light: above ~1e4 Suns
const CMB = { m: [34.3, 37.3] };   // accretion marks in the CMB: above ~10 Suns
const GW = { m: [33.3, 34.3] };    // LIGO/Virgo merger rates: ~1–100 Suns
const ML = { m: [22, 33.3] };      // microlensing: 1e22 g to ~30 Suns
const HAW = { m: [-4.7, 17] };     // evaporated, or still glowing (Hawking radiation), and the early elements
const NS = { m: [18, 22], dash: true };  // captured by neutron stars (contested)
const GAL = { dust: "galaxy", src: ["galaxy", "cluster"], color: "#80deea", sweep: 1.2, r: 2.2 };
const GAL_DROP = { ...GAL, sweep: 0.01, shift: { galaxy: -1, cluster: -0.85 }, shiftAt: 0.5, shiftDur: 2 };

export default {
  title: "Black holes (new take)",
  blurb: "The same story in one new take: the top-left limit, TON 618, the window for primordial black holes, and galaxies without their dark matter.",
  start: FULL,

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md)
  backing: "Mesmerize",
  sound: [
    { at: "will just become a black hole", fx: "drop", atEnd: true, offset: -0.3 },
    { at: "float on a pool", fx: "bubble", offset: 0.2 },
  ],

  captionFixes: { shard: "chart", protostores: "protostars" },

  cues: [
    // ── The chart so far ─────────────────────────────────────
    { at: "could have ever existed", cam: FULL, dur: 2, hl: [{ line: "triangle" }] },
    { at: "horizontal axis", hl: [{ axis: "bottom", label: "size" }] },
    { at: "vertical axis", hl: [{ axis: "left", label: "mass" }] },
    { at: "density scatter plot", cam: { r: 2, m: 6, span: 44 }, hl: [{ line: "water", label: "density" }] },
    { at: "stellar nurseries", cam: { r: 14, m: 34, span: 11 }, hl: [{ obj: "Nebulae", label: "stellar nursery" }, { obj: "Protostar", delay: 0.6 }] },
    { at: "main sequence", cam: { r: 11.2, m: 33.4, span: 5 }, hl: [{ line: "mainsequence", label: "main sequence" }, { obj: "Sun" }] },
    { at: "collapse and expand", hl: [{ swing: [{ obj: "Sun" }, { obj: "Red Giant" }], period: 2.4 }] },
    { at: "red giants", hl: [{ obj: "Sun" }, { obj: "Red Giant", label: "red giant" }] },
    { at: "dense core behind", cam: { r: 8.4, m: 33.6, span: 6 }, clear: true },
    { at: "white dwarf", hl: [{ obj: "White Dwarf", place: "left" }] },
    { at: "neutron star", hl: [{ obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: "neutron star", place: "right" }] },
    { at: "even a black hole", hl: [{ obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: false }, { obj: "Stellar BH", label: "black hole" }] },

    // ── Not an object: a line, the top-left limit ────────────
    // everything else is a cloud of catalogue dots: pictures off, the clouds circled
    { at: "very different kind of object", cam: { r: 15.2, m: 35.6, span: 17 }, clear: true, icons: false },
    { at: "cluster of dots", hold: 6, hl: [
      { ellipse: [9.5, 29.65, 0.75, 1.6], label: "planets", place: "below", color: "#90caf9" },
      { ellipse: [9.05, 33.0, 0.42, 0.45], label: "white dwarfs", place: "left", color: "#e0e0e0", delay: 0.25 },
      { ellipse: [11.3, 33.45, 1.15, 0.7], label: "stars", place: "right", color: "#ffd54f", delay: 0.5 },
      { ellipse: [21.85, 41.6, 0.95, 2.3], label: "galaxies", place: "above", color: "#80deea", delay: 0.75 },
    ] },
    { at: "exist on a line", icons: true, hl: [KNOWN, { ...SCHW, label: "black holes" }] },
    { at: "upper limit of our triangle", cam: FULL, hl: [{ line: "triangle" }, { ...SCHW, label: "black holes" }] },
    { at: "top left limit", hl: [{ ...SCHW, label: "nothing crosses it" }, { side: "left", of: "schwarzschild" }] },
    { at: "small enough", cam: { r: 5, m: 28, span: 16 },
      hl: [SCHW, { obj: "Earth" }, { arrow: true, from: { obj: "Earth" }, to: BH(27.78), label: "squeeze to 9 mm", delay: 0.6 }] },
    { at: "schwarzschild radius", hl: [{ ...SCHW, label: "schwarzschild radius" }, { obj: "Earth", label: false }] },
    { at: "never cross it", cam: { r: 4, m: 31, span: 24 }, hl: [{ ...SCHW, label: "every black hole is here" }] },

    // ── The big ones ─────────────────────────────────────────
    { at: "collapsing core of a dying star", cam: { r: 8, m: 34, span: 12 }, hl: [{ obj: "PSR J0030+0451", label: false }, { obj: "Stellar BH", label: "collapsed stars" }] },
    { at: ["5 to 100", "five to a hundred"], hl: [{ obj: "Stellar BH", label: "5 to 100 suns" }] },
    { at: "hundreds and thousands", cam: { r: 11, m: 38.6, span: 20 }, hl: [{ ...KNOWN, label: "every known black hole", labelY: 0.16 }] },
    { at: "our own milky way", cam: { r: 14, m: 41.5, span: 12 }, hl: [KNOWN, { obj: "Sgr A*", label: "sgr a* · our galaxy's" }] },
    { at: ["4 million", "four million"], hl: [KNOWN, { obj: "Sgr A*", label: "4 million suns" }] },
    { at: "become less dense", cam: { r: 13.5, m: 41.3, span: 14 }, hl: [SCHW, { line: "water", label: "water" }] },
    { at: "lighter than water", hl: [SCHW, { line: "water", label: "water" }, { side: "right", of: "water" },
      { obj: "Sgr A*", label: "denser than water", place: "left" }, { obj: "M87*", label: "lighter than water", delay: 0.6 }] },
    { at: "float on a pool", hl: [{ line: "water" }, { side: "right", of: "water" }, { obj: "M87*", label: "it would float" }, { obj: "Ton 618", label: false }] },
    { at: "m87", cam: { r: 15.4, m: 43.3, span: 7 }, hl: [KNOWN, { obj: "M87*", label: "m87* · first photographed", place: "left" }] },
    { at: "largest black hole we know", hl: [KNOWN, { obj: "M87*", label: false }, { obj: "Ton 618", label: "ton 618", place: "left" }] },
    { at: "whole solar system", hl: [{ obj: "M87*", label: false }, { obj: "Ton 618", label: "horizon ≈ 40× neptune's orbit", place: "left" }] },
    { at: "60 billion", hl: [{ obj: "M87*", label: false }, { obj: "Ton 618", label: "~60 billion suns", place: "left" }] },

    // ── The small ones ───────────────────────────────────────
    { at: "how small they can become", cam: { r: -4, m: 24, span: 40 }, dur: 3, clear: true, hl: [{ ...SCHW, label: "the smallest" }] },
    { at: "core of dying stars", cam: { obj: "Stellar BH", span: 8 }, hl: [{ obj: "Stellar BH", label: "collapsed stars" }] },
    { at: "compress anything enough", cam: { r: 3, m: 28, span: 24 },
      hl: [SCHW, { obj: "Earth" }, { arrow: true, from: { obj: "Earth" }, to: BH(27.78), label: "squeeze to 9 mm", delay: 0.6 }] },
    { at: "conditions exist when stars die", cam: { obj: "Stellar BH", span: 8 }, hl: [{ obj: "Stellar BH", label: "collapsing stars" }] },
    { at: "early moments of the universe", cam: { r: -8, m: 18, span: 34 }, clear: true },
    // the window narrowing as each survey is named: a red band along the
    // Schwarzschild line from the Planck mass to ~1e5 Suns, cut down to what's
    // still open (log10 g; docs/dark-matter-constraints.md)
    { at: "still around", cam: { r: -11, m: 16.8, span: 46 }, clear: true, hl: [{ window: W0, label: "could they\nbe here?", dist: 60 }] },
    { at: "quasars", hl: [{ window: W1, from: W0, cuts: [{ ...QSO, label: "ruled out by\nquasar light" }] }] },
    { at: "cosmic background radiation", hl: [{ window: W2, from: W1, cuts: [QSO, { ...CMB, label: "ruled out by the\nmicrowave background" }] }] },
    { at: "gravitational waves", hl: [{ window: W3, from: W2, cuts: [QSO, CMB, { ...GW, label: "ruled out by\ngravitational waves" }] }] },
    { at: "microlensing", hl: [{ window: W4, from: W3, cuts: [QSO, CMB, GW, { ...ML, label: "ruled out by\nmicrolensing" }] }] },
    { at: "cannot be too small", cam: { r: -18, m: 10, span: 34 } },
    { at: "evaporated them by now", hl: [{ window: W5, from: W4, cuts: [QSO, CMB, GW, ML, { ...HAW, label: "evaporated by\nhawking radiation" }] }] },
    { at: "window is still open", cam: { r: -8.6, m: 19.4, span: 12 }, hl: [{ window: W5, cuts: [ML, HAW], label: "still open", dist: 40 }] },
    { at: "mass of a moon", cam: { r: 0.5, m: 19.6, span: 24 }, hl: [
      { obj: "Mimas", label: "a small moon" }, { arrow: true, from: { obj: "Mimas" }, to: BH(22), label: "size of a virus", delay: 0.4 }] },
    { at: "size of an asteroid", hl: [{ obj: "Mimas", label: false }, { arrow: true, from: { obj: "Mimas" }, to: BH(22) },
      { arrow: true, from: { r: 5.3, m: 17 }, to: BH(17), label: "asteroid · smaller than an atom", delay: 0.3 }] },
    { at: "they would be invisible", cam: { r: -8.3, m: 19.5, span: 12 }, clear: true },

    // ── Dark matter: galaxies without it ─────────────────────
    { at: "effects on gravity", cam: { obj: "Milky Way", span: 7 }, clear: true, hl: [{ obj: "Milky Way" }] },
    { at: "ought to exist", hl: [{ obj: "Milky Way", label: "more mass than we can see" }] },
    { at: "galaxies and clusters of galaxies", cam: { r: 23, m: 45, span: 10 }, clear: true, hl: [GAL, { line: "darkmatter" }] },
    // close in: the cloud runs along its own density diagonal, so a decade's drop
    // only reads up close, onto the parallel line ten times less dense
    { at: "much heavier than they ought to be", cam: { r: 22.3, m: 44.1, span: 3.6 }, hold: 6,
      hl: [{ ...GAL_DROP, label: "without dark matter", labelY: 0.12 }, { line: "darkmatter", label: "measured" }, { line: "luminous", label: "stars and gas only", delay: 2 }] },
    { at: "10 times", hl: [{ ...GAL_DROP, shiftAt: -10, label: "about 10× lighter", labelY: 0.12 }, { line: "darkmatter", label: "measured" }, { line: "luminous", label: "stars and gas only" }] },
    { at: "missing mass is dark matter", hl: [GAL, { line: "darkmatter", label: "dark matter" }] },
    { at: "microscopic black holes", hl: [GAL, { line: "darkmatter", label: "primordial black holes?" }] },
    { at: "studies of neutron stars", cam: { r: -8.6, m: 19.4, span: 12 }, clear: true,
      hl: [{ window: W6, from: W5, cuts: [ML, HAW, { ...NS, label: "might be ruled out\nby neutron stars" }] }] },
    { at: "it is still open", hl: [{ window: W5, from: W6, cuts: [ML, HAW, NS], label: "still open", dist: 40 }] },

    // ── Cliffhanger: the empty-space diagonal to the next side ──
    { at: "follow those large galaxies", cam: { r: 18, m: 38, span: 34 }, clear: true, hl: [GAL] },
    { at: "density line of atoms", hl: [GAL, { line: "water", label: "atoms" }] },
    { at: "different diagonal", hl: [GAL, { line: "water", label: "atoms" }, { line: "darkmatter", label: "galaxies" }] },
    { at: "density of empty space", hl: [GAL, { line: "darkmatter", label: "mostly empty space" }] },
    { at: "largest structures", cam: { r: 25, m: 49, span: 16 }, hl: [{ obj: "Laniakea", label: "laniakea" }, { line: "darkmatter" }] },
    { at: "just empty space", hl: [{ obj: "Laniakea", label: false }, { obj: "Boötes Void", label: "voids" }] },
    { at: "keep following that line", cam: { r: 25, m: 51, span: 18 }, hl: [{ line: "darkmatter" }] },
    { at: "second wall", cam: FULL, dur: 3, hl: [{ line: "darkmatter" }, { line: "hubble", label: "next video", delay: 0.6 }] },
    { at: "second side of our triangle", hl: [{ line: "hubble", label: "the second side" }] },
  ],
};
