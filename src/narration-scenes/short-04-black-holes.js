// =============================================================
// Scene: short-04-black-holes — video 4, re-recorded at home on 2026-10-27 (rec44, rec43 and
// the dark matter addendum rec41; video/short-04-black-holes/). The earlier take (rec24,
// 2026-10-20) and its scene are in git history.
// The top-left limit and its 45° slope, TON 618, the primordial black hole window,
// the red giants' nebulae feeding new stars, the "skeleton" core, the Big Bang's soup,
// galaxies without their dark matter, the areas of the chart crossed off in the search for
// it, and "the lucky few survivors".
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
const QSO = { m: [37.3, 38.3], grow: "down" };   // Lyman-alpha forest in quasar light: above ~1e4 Suns
const CMB = { m: [34.3, 38.3], grow: "down" };   // accretion marks in the CMB: above ~10 Suns
const GW = { m: [33.3, 35.3], grow: "down" };    // LIGO/Virgo merger rates: ~1–100 Suns
const ML = { m: [22, 34.8], grow: "down" };      // microlensing: 1e22 g to ~30 Suns
const HAW = { m: [-4.7, 17], grow: "up" };     // evaporated, or still glowing (Hawking radiation), and the early elements
const NS = { m: [18, 23], dash: true, grow: "down" };  // captured by neutron stars (contested), ~1e18–1e23 g
// a dying star splitting in two (as in video 3): core to the white dwarfs, layers to the nebulae
const SPLIT = { split: { from: { obj: "Red Giant" }, core: { obj: "White Dwarf" }, shell: { obj: "Planetary Nebula" } } };
// what has been ruled out as macro dark matter, from docs/img/dark-matter-constraints.svg
// (Sidhu, Scherrer & Starkman 2019; on the chart's axes, R = √(σ/π))
// hatched = crossed out; each says what ruled it out
const DM_MICA = { poly: [[-7.75, 0], [-4, 0], [-4, 1.74], [-7.75, 1.74]], hatch: true, fill: "#f2e14a", opacity: 0.85,
  label: "ruled out by\nancient crystals", labelAt: [-9.5, -2.2], labelColor: "#f2e14a" };
const DM_HURT = { poly: [[-3.83, 0], [-3.83, 4.7], [-1.07, 4.7], [-3.42, 0]], hatch: true, fill: "#ff6b5e", opacity: 0.9,
  label: "ruled out by a lack of\nrandom human injuries", labelAt: [-10.5, 5.6], labelColor: "#ff8a80" };
const DM_WD = { poly: [[-4.75, 5.6], [-4.75, 15], [-4.25, 16.2], [-3.65, 20.5], [-2, 21.6], [4, 21.6]], hatch: true, fill: "#6f9bff", opacity: 0.75,
  label: "ruled out by white dwarfs\nthat never exploded", labelAt: [3.4, 14.2], labelColor: "#9ec1ff" };
const DM_CMB = { poly: [[-3.42, 0], [30, 0], [30, 25], [9.08, 25]], hatch: true, fill: "#b8bccc", opacity: 0.45,
  label: "ruled out by the\nmicrowave background", labelAt: [6.5, 4.5], labelColor: "#e0e3f0" };
// the candidates, as questions
const DM_CANDS = [
  // (a mark like the others at WIMP*'s place, not the object's own smaller tag: the author's
  // note, 2026-10-28, "WIMPs is smaller than the rest")
  { mark: [-16.2, -21.25], label: "WIMPs?", place: "right" },
  // named for what they'd be, not the physicists' acronyms (the author, 2026-10-29): MACHOs are
  // faint compact bodies (rogue planets, faint dwarfs); "macros" are lumps of
  // nuclear-density matter, a few mm and ~10⁹ g (quark nuggets)
  // (two marks, the author's call: a rogue planet about Jupiter's size and mass, a faint dwarf a
  // faint red dwarf's, ~0.06 Suns)
  { mark: [9.85, 30.3], label: "rogue planets?", place: "left" },
  { mark: [10.1, 32.8], label: "faint dwarfs?", place: "left" },
  { mark: [-1, 9], label: "quark nuggets?", place: "left", color: "#ffe9a3" },
];
// the source of the macro areas, quietly under the title
const DM_SOURCE = { title: "after Sidhu, Scherrer & Starkman (2019),\n\u201cDeath and serious injury by dark matter\u201d", small: true, y: 0.7 };
const DM_PBH = { mark: [-8.3, 19.5], label: "primordial black holes?", place: "right", color: "#ff8fa8" };
// all four candidates at once (WIMPs at the bottom left, MACHOs at the top right), with
// "Here be dark matter?" in the empty middle of the frame, left of the everyday objects'
// density line, between ~1 pg and 1 lb and ~1 fm and 1 cm (the author's note, 2026-10-28;
// it was "Dark matter?" up in the corner above the black-hole line), arrows out to each
// from the title's edge
const DM_WIDE = { r: -3, m: 2, span: 52 };
const DM_TITLE = [-11.85, -3.8];
const DM_HUB = (delay = 0) => [{ text: "here be\ndark matter?", at: DM_TITLE, size: 24, delay },
  ...[[{ r: -11.85, m: -6.2 }, { r: -16.2, m: -21.25 }], [{ r: -10.6, m: -1.1 }, { r: -8.3, m: 19.5 }],
    [{ r: -7.2, m: -1.1 }, { r: 10.1, m: 32.8 }], [{ r: -6.2, m: -1.2 }, { r: 9.85, m: 30.3 }], [{ r: -5, m: -1.3 }, { r: -1, m: 9 }]].map(([from, to], i) =>
    ({ arrow: true, from, to, color: "#ffe9a3", delay: delay + 0.5 + 0.35 * i }))];
// close on the crossed-off corner: ancient crystals and the injuries
const DM_CLOSE = { r: -5.5, m: 2.5, span: 17 };
const still = (h) => ({ ...h, instant: true, delay: 0 });
// the dives (Sgr A*, M87*): one move in over 2 s, the photo fading in over its second half, a
// second held, and the same move out (dive.mirror); the picture grows to 42% of the screen's short side
const DIVE = { in: 2, out: 2, photoAt: 0.9, size: 0.42, mirror: true };
const DIVE_PHOTO = { fadeIn: 1.1, fadeOut: 1.1, dur: 2.1 };
const DIVE_HELD = DIVE.photoAt + DIVE_PHOTO.dur;   // s from the cue to the way out
const GAL = { dust: "galaxy", src: ["galaxy", "cluster"], color: "#80deea", sweep: 1.2, r: 2.2 };
// down from the Milky Way, a decade, as the galaxy cloud drops (the author, 2026-10-30: the arrow in
// one of the galaxies, with the pictures faded so the dots and the named ones show)
const DROP_ARROW = { arrow: true, from: { r: 22.7, m: 44.93 }, to: { r: 22.7, m: 43.93 }, color: "#ffd54f", solid: true, width: 4.5 };
// the named galaxies in the close-up: a halo on their dots, which brings out the chart's own
// names for them (the pictures are off there)
const GAL_NAMED = ["Milky Way", "Triangulum (M33)", "Large Magellanic Cloud"].map(obj => ({ obj, label: false }));
const GAL_DROP = { ...GAL, sweep: 0.01, shift: { galaxy: -1, cluster: -0.85 }, shiftAt: 0.5, shiftDur: 2 };

export default {
  title: "Black holes",
  // the map's own icon visibility throughout (no scene-picked set, no shots without pictures)
  icons: "all",
  blurb: "The top-left limit and why it is 45°, TON 618, the window for primordial black holes, galaxies without their dark matter, and the lucky few survivors.",
  start: FULL,
  // the YouTube thumbnail (scripts/narration-poster.mjs): in close on a white dwarf, a neutron star
  // and the black-hole line they lead to, and the question (the author, 2026-10-30)
  poster: { at: 3, set: { forceIcons: ["PSR J0030+0451", "White Dwarf", "Stellar BH"] }, cues: [{ t: 0, cam: { r: 7.5, m: 34.0, span: 5.2 }, dur: 0.1, drift: 0, hl: [
    { line: "schwarzschild", draw: 0.01 }, { path: "stellar-to-bh", draw: 0.01 },
    { obj: "White Dwarf", label: "white dwarf", place: "below", labelSize: 26 },
    { obj: "PSR J0030+0451", label: "neutron star", place: "below", labelSize: 26 },
    { obj: "Stellar BH", label: "black hole", place: "right", labelSize: 26 },
    { text: "All the universe\nis black holes?", at: [7.5, 37.7], size: 40, instant: true }] }] },
  forceIcons: ["Sun", "Ton 618"],   // the Sun's picture in "squeeze the Sun into a black hole", where nearby stars would otherwise win the room; TON 618 beside the (larger) M87*
  pbhWindow: false,   // the window is drawn as it's told (window highlight), not the map's

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md)
  backing: "Mesmerize",
  sound: [
    { at: "becomes a black hole", fx: "drop", atEnd: true, offset: -0.3 },
    { at: "pool big enough", fx: "bubble", offset: 0.2 },
  ],

  captionFixes: { shard: "chart", protostores: "protostars" },

  cues: [
    // ── The chart so far ─────────────────────────────────────
    { at: ["smallest black hole", "could ever exist"], cam: { r: 3, m: 9, span: 56 }, dur: 12, drift: 0.02, hl: [{ line: "triangle" }] },
    { at: ["contains literally everything", "log chart of both", "size across the bottom"], units: true, unitsFor: 9, hl: [{ axis: "bottom", label: "size" }] },
    { at: ["mass and size", "mass going up"], hl: [{ axis: "bottom", label: "size" }, { axis: "right", label: "mass" }] },
        { at: ["in the last video", "in the last one", "stellar nurseries"], cam: { r: 15, m: 34.6, span: 11 }, hl: [{ obj: "Stellar Nursery", label: "stellar nursery" }, { path: "stellar-low-mass", to: "Protostar", delay: 0.4 }, { obj: "Protostar", delay: 0.8 }] },
            { at: ["stars die", "shed their outer layers"], cam: { r: 13.1, m: 33.6, span: 12.5 }, dur: 1.6, hl: [{ ...SPLIT, coreLabel: "core", shellLabel: "nebula" }] },
        { at: ["dense core behind", "skeleton of a dead star"], cam: { r: 8.4, m: 33.6, span: 6 }, clear: true },
    { at: "white dwarf", hl: [{ obj: "White Dwarf", place: "left" }] },
    { at: "neutron star", hl: [{ obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: "neutron star", place: "right" }] },
    { at: ["want to talk about today", "most interesting of them", "most interesting of them all"], hl: [{ obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: false }, { obj: "Stellar BH", label: "black hole" }] },

    // ── Not an object: a line, the top-left limit ────────────
    // everything else is a cloud of catalogue dots: pictures off, the clouds circled
    // the pictures fade out while the chart is "a bunch of little dots", so only the dots show (the
    // author, 2026-10-29); they come back with the black holes on their line
    { at: ["most objects in this chart", "most objects in our triangle"], cam: { r: 15.2, m: 35.6, span: 17 }, clear: true, icons: false },
    { at: ["bunch of little dots", "clouds of dots", "clusters of dots"], hold: 6, hl: [
      { ellipse: [9.5, 29.65, 0.75, 1.6], label: "planets", place: "below", color: "#90caf9" },
      { ellipse: [9.05, 33.0, 0.42, 0.45], label: "white dwarfs", place: "left", color: "#e0e0e0", delay: 0.25 },
      { ellipse: [11.3, 33.45, 1.15, 0.7], label: "stars", place: "right", color: "#ffd54f", delay: 0.5 },
      { ellipse: [21.85, 41.6, 0.95, 2.3], label: "galaxies", place: "above", color: "#80deea", delay: 0.75 },
    ] },
    { at: ["they all sit exactly", "they all sit on the same line", "they all sit on one line"], icons: true, hl: [KNOWN, { ...SCHW, label: "black holes" }] },
    { at: "called the schwarzschild radius", cam: { obj: "Sgr A*", span: 15 }, dur: 6, drift: 0.02, hl: [{ ...SCHW, label: "schwarzschild radius" }] },
    { at: ["top left edge", "top left limit"], cam: { r: 11, m: 38.6, span: 20 }, dur: 4, hl: [{ line: "triangle" }, { ...SCHW, label: "nothing crosses it" }, { side: "left", of: "schwarzschild" }] },
    { at: ["too small for its mass", "too small or too massive"], cam: { r: 5, m: 28, span: 16 },
      hl: [SCHW, { obj: "Earth" }, { arrow: true, from: { obj: "Earth" }, to: BH(27.78), label: "squeeze to 9 mm", delay: 0.6 }] },
    { at: ["above or to the left", "nothing can cross it"], hl: [{ ...SCHW, label: "every black hole is here" }] },
    // why the line is 45°: the size we draw is the event horizon, proportional to mass
    { at: ["doesn't really have a size", "doesn't actually have a size", "don't really have a size"], cam: { obj: "Stellar BH", span: 6 }, clear: true, hl: [SCHW, { obj: "Stellar BH", label: "black hole" }] },
    { at: "singularity", hl: [SCHW, { obj: "Stellar BH", label: "a point · size zero" }] },
    { at: "event horizon", hl: [SCHW, { obj: "Stellar BH", label: "size = event horizon" }] },
    { at: ["grows in step with its mass", "grows in step with the mass"], cam: { r: 4, m: 31, span: 24 }, hl: [{ ...SCHW, label: "twice the mass, twice the size" }] },
    { at: ["straight 45-degree", "45 degree slope"], hl: [{ ...SCHW, label: "1 : 1 · 45°" }] },

    // ── The big ones ─────────────────────────────────────────
    // the Sun and the Earth squeezed into black holes: straight across (same mass) onto the line
    { at: "squeeze the sun", cam: { r: 7.6, m: 31.5, span: 12 }, dur: 2.5, clear: true, hl: [SCHW, { obj: "Sun", place: "right" },
      { arrow: true, from: { obj: "Sun" }, to: BH(33.3), delay: 0.5 }, { cross: BH(33.3), size: "the Sun: 6 km wide", delay: 1.4 }] },
    { at: "the earth would be", cam: { r: 4.6, m: 30.3, span: 13 }, dur: 2, hl: [SCHW, { obj: "Sun", label: false }, { mark: [5.47, 33.3], label: "the Sun · 6 km", place: "left" },
      { obj: "Earth", place: "right" }, { arrow: true, from: { obj: "Earth" }, to: BH(27.78), delay: 0.4 }, { cross: BH(27.78), size: "the Earth: 2 cm, a marble", delay: 1.2 }] },
    { at: ["collapsing core of dying stars", "collapsing core of a dying star"], cam: { r: 8, m: 34, span: 12 }, hl: [{ path: "stellar-to-bh" }, { obj: "PSR J0030+0451", label: false }, { obj: "Stellar BH", label: "collapsed stars" }] },
    { at: ["merging with other black holes", "merging with each other"], hl: [{ path: "bh-mergers" }, { obj: "Stellar BH", label: "or merged black holes" }] },
    { at: "a few suns", cam: { r: 11, m: 38.6, span: 20 }, hl: [{ ...SCHW, label: "every known black hole" }] },
    { at: ["the milky way", "our milky way", "our own milky way"], cam: { r: 14, m: 41.5, span: 12 }, hl: [{ obj: "Sgr A*", label: "sgr a* · our galaxy's" }] },
    { at: ["4 million", "four million"], hl: [{ obj: "Sgr A*", label: "4 million suns" }] },
    // a dive onto Sgr A*, one continuous move (the author, 2026-10-30): it comes towards us while the
    // camera turns to it (a pan at the same zoom, as long as the approach), the EHT photo fading in
    // over its growing picture (lens, its ring on the picture's photon ring round the shadow);
    // a second held, then the same move backwards, the camera turning back out to what comes next
    { at: ["4 million", "four million"], offset: 0.8, cam: { obj: "Sgr A*", span: 12 }, dur: 2 },
    { at: ["4 million", "four million"], offset: 0.8, photo: "sgr-a", obj: "Sgr A*", dive: DIVE, ...DIVE_PHOTO,
      lens: { map: [0.00038123, 0, -0.17691, -0.200666], r: 0.48, size: [3600, 3600] },
      caption: "Sagittarius A*, our galaxy's black hole · Event Horizon Telescope · 2022" },
    { at: ["4 million", "four million"], offset: 0.8 + DIVE_HELD, cam: { r: 13.5, m: 41.3, span: 14 }, dur: 2 },
    { at: ["the less dense they are", "get less dense"], hl: [SCHW, { line: "water", label: "water" }] },
    { at: "less dense than water", hl: [SCHW, { line: "water", label: "water" }, { side: "right", of: "water" },
      { obj: "Sgr A*", label: "denser than water", place: "left" }, { obj: "M87*", label: "lighter than water", delay: 0.6 }] },
    { at: "pool big enough", hl: [{ line: "water" }, { side: "right", of: "water" }, { obj: "M87*", label: "it would float" }, { obj: "Ton 618", label: false }] },
    // a dive onto M87*, the same move as Sgr A*'s, from "like M87" so it's back out for TON 618
    { at: ["like m87", "m87"], cam: { obj: "M87*", span: 14 }, dur: 2, hl: [{ obj: "M87*", label: "m87* · first photographed", place: "left" }] },
    { at: ["like m87", "m87"], photo: "m87", obj: "M87*", dive: DIVE, ...DIVE_PHOTO,
      lens: { map: [0.00056505, -0.00003499, -0.550765, -0.453559], r: 0.48, size: [3600, 3600] },
      caption: "M87*, the first black hole ever photographed · Event Horizon Telescope · 2019" },
    { at: ["one of the largest", "largest black hole"], cam: { r: 15.4, m: 43.3, span: 7 }, hl: [{ obj: "M87*", label: false }, { obj: "Ton 618", label: "ton 618", place: "above" }] },
    { at: ["bigger than pluto's", "orbits of every planet", "orbits of our planets"], hl: [{ obj: "M87*", label: false }, { obj: "Ton 618", label: "horizon ≈ 20–30× pluto's orbit", place: "above" }] },

    // ── The small ones ───────────────────────────────────────
    { at: "but how small", cam: { r: -2, m: 25, span: 28 }, dur: 4, clear: true, hl: [{ ...SCHW, label: "the smallest" }] },
    { at: "with enough pressure", cam: { r: 3, m: 28, span: 24 }, dur: 6,
      hl: [SCHW, { obj: "Earth" }, { arrow: true, from: { obj: "Earth" }, to: BH(27.78), label: "squeeze to 9 mm", delay: 0.6 }] },
    { at: ["the core of a dying star", "one is the core", "number one"], cam: { obj: "Stellar BH", span: 8 }, hl: [{ obj: "Stellar BH", label: "collapsed stars" }] },
    { at: ["instants after the big bang", "moments after the big bang", "moments of the big bang"], cam: { r: -8, m: 18, span: 34 }, clear: true },
    // the early universe as a density line: ~1e40 g/cm³ about 1e-17 s in, which meets
    // the black-hole line at ~3e21 g (a lump of it the size of its own horizon collapses)
    { at: ["super dense soup", "hot dense soup", "soup of very hot"], hl: [SCHW, { density: 40, label: "\u266B\uFE0E the whole universe\nwas in a hot dense state \u266A\uFE0E" }] },
    // the window narrowing as each survey is named: a red band along the
    // Schwarzschild line from the Planck mass to ~1e5 Suns, cut down to what's
    // still open (log10 g; docs/dark-matter-constraints.md)
    { at: ["might still be around", "might just be around"], cam: { r: -11, m: 16.8, span: 46 }, clear: true, hl: [{ window: W0, label: "could they\nbe here?", dist: 60 }] },
    { at: "quasars", hl: [{ window: W1, from: W0, trace: W0, cuts: [{ ...QSO, label: "ruled out by\nquasar light" }] }] },
    { at: "cosmic microwave background", hl: [{ window: W2, from: W1, trace: W0, cuts: [QSO, { ...CMB, label: "ruled out by the\nmicrowave background" }] }] },
    { at: "gravitational waves", hl: [{ window: W3, from: W2, trace: W0, cuts: [QSO, CMB, { ...GW, label: "ruled out by\ngravitational waves" }] }] },
    { at: "microlensing", hl: [{ window: W4, from: W3, trace: W0, cuts: [QSO, CMB, GW, { ...ML, label: "ruled out by\nmicrolensing" }] }] },
    { at: "can't be too small", cam: { r: -18, m: 10, span: 34 } },
    { at: ["they'd have evaporated", "would have evaporated"], hl: [{ window: W5, from: W4, trace: W0, cuts: [QSO, CMB, GW, ML, { ...HAW, label: "evaporated by\nhawking radiation" }] }] },
    { at: ["narrow window", "tiny window"], cam: { r: -8.6, m: 19.4, span: 12 }, hl: [{ window: W5, cuts: [ML, HAW], label: "still open", dist: 40 }] },
    // straight across: the same mass squeezed onto the black-hole line
    // (Hyperion, a small moon of Saturn, 5.6e21 g → ~17 nm; Eros, an asteroid, 6.7e18 g → ~1/5 of an atom)
    // (no round moon is light enough for the window: Mimas, the smallest, is 3.7e22 g, above it;
    // a moon under ~1e22 g is a lump like Hyperion.) Both pictures forced on (Eros's was hidden by
    // its neighbours, a bare dot: the author's note, 2026-10-30), named, and framed whole with
    // the line they're squeezed onto
    { at: "mass of a small moon", cam: { r: 0.3, m: 20.3, span: 33 }, forceIcons: ["Sun", "Ton 618", "Hyperion", "Eros"], hl: [
      { obj: "Hyperion", label: "hyperion: saturn's moon", place: "below" }, { arrow: true, from: { obj: "Hyperion" }, to: BH(21.75), label: "the size of a virus", delay: 0.4 }] },
    { at: ["asteroid mass", "asteroid's mass"], hl: [{ obj: "Hyperion", label: false }, { arrow: true, from: { obj: "Hyperion" }, to: BH(21.75) },
      { obj: "Eros", label: "eros · an asteroid", place: "below", delay: 0.2 }, { arrow: true, from: { obj: "Eros" }, to: BH(18.83), label: "smaller than an atom", delay: 0.6 }] },
    { at: ["they'd be invisible", "completely invisible", "basically invisible"], cam: { r: 23, m: 45, span: 14 }, dur: 9, drift: 0.02, clear: true, forceIcons: null },

    // ── Dark matter: galaxies without it ─────────────────────
    { at: ["only notice their gravity", "find them by their gravity"], cam: { obj: "Milky Way", span: 7 }, clear: true, hl: [{ obj: "Milky Way" }] },
    { at: "do see that gravity", hl: [{ obj: "Milky Way", label: "more mass than we can see" }] },
    { at: "when we weigh galaxies", cam: { r: 23, m: 45, span: 10 }, clear: true, hl: [GAL, { line: "darkmatter" }] },
    // close in: the cloud runs along its own density diagonal, so a decade's drop
    // only reads up close, onto the parallel line ten times less dense
    // the pictures fade out, leaving the catalogue dots and the named galaxies' dots and labels
    { at: ["much heavier than everything", "much heavier than they ought to be"], cam: { r: 22.3, m: 44.1, span: 3.6 }, hold: 6, icons: false,
      hl: [...GAL_NAMED, { ...DROP_ARROW, delay: 0.5, draw: 2 }, { ...GAL_DROP, label: "without dark matter", labelY: 0.12 }, { line: "darkmatter", label: "measured" }, { line: "luminous", label: "stars and gas only", delay: 2 }] },
    { at: ["ten times", "10 times"], hl: [...GAL_NAMED.map(still), { ...DROP_ARROW, draw: 0.01 }, { ...GAL_DROP, shiftAt: -10, label: "about 10× lighter", labelY: 0.12 }, { line: "darkmatter", label: "measured" }, { line: "luminous", label: "stars and gas only" }] },
    // a slow pull back from the galaxies to the candidates
    { at: "something invisible", cam: DM_WIDE, dur: 4, drift: 0, quiet: true, labels: false, clear: true, icons: true,
      hl: [SCHW, ...DM_CANDS.map((c, i) => ({ ...c, delay: 1.2 + 0.5 * i }))] },
    // no "here be dark matter?" here: it blinked by in under 2 s, and the later one stays (the
    // author, 2026-10-29); a slow pan instead, from the candidates on to the window it's heading for
    { at: ["we don't know what it is", "plenty of candidates"], cam: { r: -8.6, m: 19.4, span: 12 }, dur: 5, drift: 0, quiet: true,
      hl: [SCHW, ...DM_CANDS.map(still), { ...DM_PBH, delay: 0.4 }, { window: W5, cuts: [ML, HAW], delay: 0.8 }] },
    { at: ["if they are just tiny black holes", "if it's tiny black holes", "so we keep looking"], labels: true, clear: true,
      hl: [{ window: W5, cuts: [ML, HAW], label: "still open", dist: 40 }] },
        { at: ["any new particles", "what we think of as empty space"], cam: { r: -7.4, m: 20.6, span: 10 }, dur: 9, drift: 0.01, hl: [{ window: W5, from: W6, trace: W0, cuts: [ML, HAW, NS], label: "still open", dist: 40 }] },

    // ── Ending: maybe most matter is in tiny black holes ─────
    // (the window still open while the narration says why tiny black holes would need no new particle)
    { at: ["to explain them", "to explain it", "heavy as a mountain"], hl: [{ window: W5, cuts: [ML, HAW, NS] }] },

    // ── Crossed off: the search for dark matter, area by area (the addendum, rec41) ──
    // back out to the candidates; each area of the chart that has been ruled out comes in as
    // it's named, and stays (later cues list the earlier ones as `still`, so nothing regrows)
    { at: ["something else entirely", "or maybe not"], cam: DM_WIDE, dur: 4, drift: 0, quiet: true, labels: false, clear: true,
      hl: [SCHW, ...DM_CANDS.map((c, i) => ({ ...c, delay: 1 + 0.5 * i })), { ...DM_PBH, delay: 2.5 }, { window: W5, cuts: [ML, HAW], delay: 2.5 }] },
    // a screen with little else going on: dark matter, if it's real, is one of these
    { at: "somewhere on this chart", hl: [SCHW, ...DM_HUB(0), ...DM_CANDS.map(still), still(DM_PBH), { window: W5, cuts: [ML, HAW] }] },
    // then a slow zoom in, arriving on the crossed-off corner as it's named
    { at: "not only on the black hole line", cam: DM_CLOSE, dur: 4.5, drift: 0, quiet: true,
      hl: [SCHW, ...DM_CANDS.map(still), still(DM_PBH), { window: W5, cuts: [ML, HAW] }] },
    { at: ["lumps about roughly this size", "lumps about this size"], hl: [SCHW, ...DM_CANDS.map(still), still(DM_PBH), { window: W5, cuts: [ML, HAW] },
      { ...DM_SOURCE, delay: 0.6 }, { ...DM_MICA, delay: 0.2 }] },
    { at: ["can't be here either", "were around here"], hl: [SCHW, ...DM_CANDS.map(still), still(DM_PBH), { window: W5, cuts: [ML, HAW] },
      still(DM_SOURCE), still(DM_MICA), { ...DM_HURT, delay: 0.1 }] },
    // "the collective effort…": a slow zoom back out while the rest of what's been ruled out
    // comes in, one area at a time, across the whole sentence
    { at: "the search for dark matter", cam: DM_WIDE, dur: 8, drift: 0, quiet: true,
      hl: [SCHW, ...DM_CANDS.map(still), still(DM_PBH), { window: W5, cuts: [ML, HAW] },
        still(DM_SOURCE), still(DM_MICA), still(DM_HURT), { ...DM_WD, delay: 0.8 }, { ...DM_CMB, delay: 3.2 },
        { window: W5, cuts: [QSO, CMB, GW, ML, HAW], delay: 5.4 }] },
    // radiation era: ρ ≈ 4.5e5 g/cm³ / t² (t in s); 1e44 g/cm³ at ~1e-19 s, which meets the
    // black-hole line at ~2e19 g, in the window
    // from "the very first moments" to the end, one slow zoom out to the whole triangle, the early
    // universe's density line kept on all the way (the author, 2026-10-29)
    { at: ["very first moments of our history", "first nanoseconds of our history"], cam: FULL, dur: 15, drift: 0, quiet: true, labels: false, clear: true, hold: 20,
      hl: [{ density: 44, label: "density of universe\nfirst instants after big bang" }] },
  ],
};
