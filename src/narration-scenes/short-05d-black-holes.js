// =============================================================
// Scene: short-05d-black-holes — video 5, take 5 (rec24, 2026-10-20;
// video/short-05d-black-holes/), the chosen take; the older takes 05, 05b, 05c were
// archived as MP4s on 2026-10-20 (see video/EXPORT.md; recoverable from git history).
// As 05c, with the red giants' nebulae feeding new stars, the "skeleton" core,
// the Big Bang's soup, and "the lucky few survivors".
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
// each survey's own range (docs/dark-matter-constraints.md): they overlap, and each stays drawn
const QSO = { m: [37.3, 38.3] };   // Lyman-alpha forest in quasar light: above ~1e4 Suns
const CMB = { m: [34.3, 38.3] };   // accretion marks in the CMB: above ~10 Suns
const GW = { m: [33.3, 35.3] };    // LIGO/Virgo merger rates: ~1–100 Suns
const ML = { m: [22, 34.8] };      // microlensing: 1e22 g to ~30 Suns
const HAW = { m: [-4.7, 17] };     // evaporated, or still glowing (Hawking radiation), and the early elements
const NS = { m: [18, 23], dash: true };  // captured by neutron stars (contested), ~1e18–1e23 g
const GAL = { dust: "galaxy", src: ["galaxy", "cluster"], color: "#80deea", sweep: 1.2, r: 2.2 };
const GAL_DROP = { ...GAL, sweep: 0.01, shift: { galaxy: -1, cluster: -0.85 }, shiftAt: 0.5, shiftDur: 2 };

export default {
  title: "Black holes (take 5)",
  blurb: "Take 5: the top-left limit and why it is 45°, TON 618, the window for primordial black holes, galaxies without their dark matter, and the lucky few survivors.",
  start: FULL,
  pbhWindow: false,   // the window is drawn as it's told (window highlight), not the map's

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md)
  backing: "Mesmerize",
  sound: [
    { at: "will become a black hole", fx: "drop", atEnd: true, offset: -0.3 },
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
    { at: "into nebulas", cam: { r: 15.6, m: 33.8, span: 8 }, hl: [{ obj: "Red Giant", label: false }, { arrow: true, from: { obj: "Red Giant" }, to: { obj: "Planetary Nebula" } }, { obj: "Planetary Nebula", label: "nebula", delay: 0.6 }] },
    { at: "new generation of stars", hl: [{ obj: "Planetary Nebula", label: false }, { arrow: true, from: { obj: "Planetary Nebula" }, to: { obj: "Nebulae" } }, { obj: "Nebulae", label: "new stars", delay: 0.6 }] },
    { at: "skeleton of a dead star", cam: { r: 8.4, m: 33.6, span: 6 }, clear: true },
    { at: "white dwarf", hl: [{ obj: "White Dwarf", place: "left" }] },
    { at: "neutron star", hl: [{ obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: "neutron star", place: "right" }] },
    { at: "interesting one of them", hl: [{ obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: false }, { obj: "Stellar BH", label: "black hole" }] },

    // ── Not an object: a line, the top-left limit ────────────
    // everything else is a cloud of catalogue dots: pictures off, the clouds circled
    { at: "most objects in our triangle", cam: { r: 15.2, m: 35.6, span: 17 }, clear: true, icons: false },
    { at: "cluster of dots", hold: 6, hl: [
      { ellipse: [9.5, 29.65, 0.75, 1.6], label: "planets", place: "below", color: "#90caf9" },
      { ellipse: [9.05, 33.0, 0.42, 0.45], label: "white dwarfs", place: "left", color: "#e0e0e0", delay: 0.25 },
      { ellipse: [11.3, 33.45, 1.15, 0.7], label: "stars", place: "right", color: "#ffd54f", delay: 0.5 },
      { ellipse: [21.85, 41.6, 0.95, 2.3], label: "galaxies", place: "above", color: "#80deea", delay: 0.75 },
    ] },
    { at: "sit all on this line", icons: true, hl: [KNOWN, { ...SCHW, label: "black holes" }] },
    { at: "called the schwarzschild radius", hl: [{ ...SCHW, label: "schwarzschild radius" }] },
    { at: "top left limit", cam: FULL, hl: [{ line: "triangle" }, { ...SCHW, label: "nothing crosses it" }, { side: "left", of: "schwarzschild" }] },
    { at: "too small or too massive", cam: { r: 5, m: 28, span: 16 },
      hl: [SCHW, { obj: "Earth" }, { arrow: true, from: { obj: "Earth" }, to: BH(27.78), label: "squeeze to 9 mm", delay: 0.6 }] },
    { at: "actually cross it", hl: [{ ...SCHW, label: "every black hole is here" }] },
    // why the line is 45°: the size we draw is the event horizon, proportional to mass
    { at: "don't have a size", cam: { obj: "Stellar BH", span: 6 }, clear: true, hl: [SCHW, { obj: "Stellar BH", label: "black hole" }] },
    { at: "singularity", hl: [SCHW, { obj: "Stellar BH", label: "a point · size zero" }] },
    { at: "event horizon", hl: [SCHW, { obj: "Stellar BH", label: "size = event horizon" }] },
    { at: "directly related to mass", cam: { r: 4, m: 31, span: 24 }, hl: [{ ...SCHW, label: "twice the mass, twice the size" }] },
    { at: "45 degree angle", hl: [{ ...SCHW, label: "1 : 1 · 45°" }] },

    // ── The big ones ─────────────────────────────────────────
    { at: "collapsing core of a dying star", cam: { r: 8, m: 34, span: 12 }, hl: [{ obj: "PSR J0030+0451", label: false }, { obj: "Stellar BH", label: "collapsed stars" }] },
    { at: "mergers of other black holes", hl: [{ obj: "Stellar BH", label: "or merged black holes" }] },
    { at: "hundreds and thousands", cam: { r: 11, m: 38.6, span: 20 }, hl: [{ ...SCHW, label: "every known black hole" }] },
    { at: "our own milky way", cam: { r: 14, m: 41.5, span: 12 }, hl: [{ obj: "Sgr A*", label: "sgr a* · our galaxy's" }] },
    { at: ["4 million", "four million"], hl: [{ obj: "Sgr A*", label: "4 million suns" }] },
    { at: "become less dense", cam: { r: 13.5, m: 41.3, span: 14 }, hl: [SCHW, { line: "water", label: "water" }] },
    { at: "lighter than water", hl: [SCHW, { line: "water", label: "water" }, { side: "right", of: "water" },
      { obj: "Sgr A*", label: "denser than water", place: "left" }, { obj: "M87*", label: "lighter than water", delay: 0.6 }] },
    { at: "float on a pool", hl: [{ line: "water" }, { side: "right", of: "water" }, { obj: "M87*", label: "it would float" }, { obj: "Ton 618", label: false }] },
    { at: "m87", cam: { r: 15.4, m: 43.3, span: 7 }, hl: [{ obj: "M87*", label: "m87* · first photographed", place: "left" }] },
    { at: "largest black hole", hl: [{ obj: "M87*", label: false }, { obj: "Ton 618", label: "ton 618", place: "left" }] },
    { at: "our solar system", hl: [{ obj: "M87*", label: false }, { obj: "Ton 618", label: "horizon ≈ 40× neptune's orbit", place: "left" }] },
    { at: "60 billion", hl: [{ obj: "M87*", label: false }, { obj: "Ton 618", label: "~60 billion suns", place: "left" }] },

    // ── The small ones ───────────────────────────────────────
    { at: "how small they can be", cam: { r: -4, m: 24, span: 40 }, dur: 3, clear: true, hl: [{ ...SCHW, label: "the smallest" }] },
    { at: "with enough pressure", cam: { r: 3, m: 28, span: 24 },
      hl: [SCHW, { obj: "Earth" }, { arrow: true, from: { obj: "Earth" }, to: BH(27.78), label: "squeeze to 9 mm", delay: 0.6 }] },
    { at: "core of dying stars", cam: { obj: "Stellar BH", span: 8 }, hl: [{ obj: "Stellar BH", label: "collapsed stars" }] },
    { at: "early moments of the big bang", cam: { r: -8, m: 18, span: 34 }, clear: true },
    // the early universe as a density line: ~1e40 g/cm³ about 1e-17 s in, which meets
    // the black-hole line at ~3e21 g (a lump of it the size of its own horizon collapses)
    { at: "soup of very hot", hl: [SCHW, { density: 40, label: "the whole universe\nwas a hot dense soup" }] },
    // the window narrowing as each survey is named: a red band along the
    // Schwarzschild line from the Planck mass to ~1e5 Suns, cut down to what's
    // still open (log10 g; docs/dark-matter-constraints.md)
    { at: "still be around", cam: { r: -11, m: 16.8, span: 46 }, clear: true, hl: [{ window: W0, label: "could they\nbe here?", dist: 60 }] },
    { at: "quasars", hl: [{ window: W1, from: W0, trace: W0, cuts: [{ ...QSO, label: "ruled out by\nquasar light" }] }] },
    { at: "cosmic background radiation", hl: [{ window: W2, from: W1, trace: W0, cuts: [QSO, { ...CMB, label: "ruled out by the\nmicrowave background" }] }] },
    { at: "gravitational waves", hl: [{ window: W3, from: W2, trace: W0, cuts: [QSO, CMB, { ...GW, label: "ruled out by\ngravitational waves" }] }] },
    { at: "microlensing", hl: [{ window: W4, from: W3, trace: W0, cuts: [QSO, CMB, GW, { ...ML, label: "ruled out by\nmicrolensing" }] }] },
    { at: "cannot be too small", cam: { r: -18, m: 10, span: 34 } },
    { at: "would have evaporated", hl: [{ window: W5, from: W4, trace: W0, cuts: [QSO, CMB, GW, ML, { ...HAW, label: "evaporated by\nhawking radiation" }] }] },
    { at: "tiny window", cam: { r: -8.6, m: 19.4, span: 12 }, hl: [{ window: W5, cuts: [ML, HAW], label: "still open", dist: 40 }] },
    // straight across: the same mass squeezed onto the black-hole line
    // (Hyperion, a small moon of Saturn, 5.6e21 g → ~17 nm; Eros, an asteroid, 6.7e18 g → ~1/5 of an atom)
    { at: "mass of a small moon", cam: { r: -1.2, m: 20.2, span: 20 }, hl: [
      { obj: "Hyperion", label: "a small moon", place: "above" }, { arrow: true, from: { obj: "Hyperion" }, to: BH(21.75), label: "the size of a virus", delay: 0.4 }] },
    { at: "heavy as an asteroid", hl: [{ obj: "Hyperion", label: false }, { arrow: true, from: { obj: "Hyperion" }, to: BH(21.75) },
      { obj: "Eros", label: "an asteroid", place: "below", delay: 0.2 }, { arrow: true, from: { obj: "Eros" }, to: BH(18.83), label: "smaller than an atom", delay: 0.6 }] },
    { at: "basically invisible", cam: { r: -8.3, m: 19.5, span: 12 }, clear: true },

    // ── Dark matter: galaxies without it ─────────────────────
    { at: "effects on their gravity", cam: { obj: "Milky Way", span: 7 }, clear: true, hl: [{ obj: "Milky Way" }] },
    { at: "detected those effects", hl: [{ obj: "Milky Way", label: "more mass than we can see" }] },
    { at: "when we measure galaxies", cam: { r: 23, m: 45, span: 10 }, clear: true, hl: [GAL, { line: "darkmatter" }] },
    // close in: the cloud runs along its own density diagonal, so a decade's drop
    // only reads up close, onto the parallel line ten times less dense
    { at: "much heavier than they ought to be", cam: { r: 22.3, m: 44.1, span: 3.6 }, hold: 6,
      hl: [{ ...GAL_DROP, label: "without dark matter", labelY: 0.12 }, { line: "darkmatter", label: "measured" }, { line: "luminous", label: "stars and gas only", delay: 2 }] },
    { at: ["ten times", "10 times"], hl: [{ ...GAL_DROP, shiftAt: -10, label: "about 10× lighter", labelY: 0.12 }, { line: "darkmatter", label: "measured" }, { line: "luminous", label: "stars and gas only" }] },
    // a slow pull back from the galaxies instead of holding on the dark-matter line
    { at: "of course dark matter", cam: { r: 14, m: 36, span: 44 }, dur: 9, hl: [{ ...GAL, label: "dark matter", labelY: 0.12 }] },
    { at: "research on neutron stars", cam: { r: -8.6, m: 19.4, span: 12 }, clear: true,
      hl: [{ window: W6, from: W5, trace: W0, cuts: [ML, HAW, { ...NS, label: "might be ruled out\nby neutron stars" }] }] },
    { at: "empty space in the universe", hl: [{ window: W5, from: W6, trace: W0, cuts: [ML, HAW, NS], label: "still open", dist: 40 }] },

    // ── Ending: maybe most matter is in tiny black holes ─────
    // a mountain's mass (1e18 g, Everest on the chart) read off both axes on the line
    { at: "much as a mountain", hl: [{ window: W5, cuts: [ML, HAW, NS] },
      { cross: BH(18), mass: "1 trillion tonnes", size: "radius 1.5 picometres", delay: 0.2 }] },
    { at: "something else is dark matter", cam: { r: 4, m: 30, span: 50 }, dur: 6, clear: true },
    // radiation era: ρ ≈ 4.5e5 g/cm³ / t² (t in s); 1e44 g/cm³ at ~1e-19 s, which meets the
    // black-hole line at ~2e19 g, in the window
    { at: "early moments of our history", cam: { r: -8.6, m: 19.4, span: 12 }, clear: true,
      hl: [{ density: 44, label: "density of universe\nfirst instants after big bang" }] },
    { at: "lucky few survivors", cam: FULL, dur: 3, hl: [{ line: "water", label: "everything else" }] },
  ],
};
