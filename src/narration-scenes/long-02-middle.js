// =============================================================
// Scene: long-02-middle — the middle of long video 2 (space), the author's second take of 2026-11-05
// (rec55; video/long-02-middle/): the truce and how it breaks, the star cycle and the dead cores, the
// black holes whole (with the plant, "remember this line"), dark matter and the lucky few survivors, the
// turn, bigger means emptier up to the voids, the second edge and the cosmic event horizon. It follows
// long-02-intro in the cut (video/cuts/long-02-space.json), and the old video 5 take carries on from
// "Now add up everything…". The shots are video 3's, 4's and 5's (short-03-stars, short-04-black-holes,
// short-05-hubble-sphere), keyed to the new wording, so the pictures match across the series.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

const FULL = { r: -2.2, m: -4.8, span: 74 };
// ── video 3's pieces: the star's end, the cycle, the cores ──
const SPLIT = { split: { from: { obj: "Red Giant" }, core: { obj: "White Dwarf" }, shell: { obj: "Planetary Nebula" } } };
const LOW = { path: "stellar-low-mass" }, HIGH = { path: "stellar-high-mass" };
const CYCLE = [LOW, { path: ["nebula-to-nursery", "remnant-to-nursery"] }];
const NEBULAE = { r: 18.0, m: 33.6, span: 5 };
const CYCLE_VIEW = { r: 16.95, m: 34.5, span: 7.8 };
const WD_LIMIT = (delay = 0, kept = false) => [{ line: "chandrasekhar", label: "white dwarf upper limit", delay, ...(kept ? { draw: 0.01 } : {}) },
  { cross: { r: 9.7, m: 33.46 }, mass: "1.44 solar masses", size: false, color: "#90caf9", delay: delay + 0.4 }];
const PSR_RING = { mark: [6.1, 33.45], color: "#80deea" };
const DENSITIES = [{ density: 0, label: "atomic density" }, { density: 14.36, label: "neutron density" }];
const DENSE_BOTTOM = { r: -9.3, m: -27.6, span: 11.5 };
const DENSE_TOP = { r: DENSE_BOTTOM.r + 19.1, m: DENSE_BOTTOM.m + 3 * 19.1, span: 11.5 };
const H_AT = [-8.28, -23.78], N_AT = [-13.06, -23.77], NU_AT = [-4.5, -32.9];
const MS = { line: "mainsequence", label: "main sequence" };
// gravity's third win, past the electrons' last stand (long video 1 scored the first two)
const SCORE3 = { score: [["Gravity", 3], ["Electromagnetism", 0]] };
// ── video 4's pieces: the black-hole line, the window, dark matter ──
const BH = (m) => ({ r: m - 27.83, m, mark: true });
const SCHW = { line: "schwarzschild" };
const KNOWN = { dust: "blackhole", sweep: 1.6 };
const W0 = [-4.7, 38.3], W1 = [-4.7, 37.3], W2 = [-4.7, 34.3], W3 = [-4.7, 33.3], W4 = [-4.7, 22], W5 = [17, 22], W6 = [17, 18];
const QSO = { m: [37.3, 38.3], grow: "down" };
const CMB = { m: [34.3, 38.3], grow: "down" };
const GW = { m: [33.3, 35.3], grow: "down" };
const ML = { m: [22, 34.8], grow: "down" };
const HAW = { m: [-4.7, 17], grow: "up" };
const NS = { m: [18, 23], dash: true, grow: "down" };
const DM_MICA = { poly: [[-7.75, 0], [-4, 0], [-4, 1.74], [-7.75, 1.74]], hatch: true, fill: "#f2e14a", opacity: 0.85,
  label: "ruled out by\nancient crystals", labelAt: [-9.5, -2.2], labelColor: "#f2e14a" };
const DM_HURT = { poly: [[-3.83, 0], [-3.83, 4.7], [-1.07, 4.7], [-3.42, 0]], hatch: true, fill: "#ff6b5e", opacity: 0.9,
  label: "ruled out by a lack of\nrandom human injuries", labelAt: [-10.5, 5.6], labelColor: "#ff8a80" };
const DM_WD = { poly: [[-4.75, 5.6], [-4.75, 15], [-4.25, 16.2], [-3.65, 20.5], [-2, 21.6], [4, 21.6]], hatch: true, fill: "#6f9bff", opacity: 0.75,
  label: "ruled out by white dwarfs\nthat never exploded", labelAt: [3.4, 14.2], labelColor: "#9ec1ff" };
const DM_CMB = { poly: [[-3.42, 0], [30, 0], [30, 25], [9.08, 25]], hatch: true, fill: "#b8bccc", opacity: 0.45,
  label: "ruled out by the\nmicrowave background", labelAt: [6.5, 4.5], labelColor: "#e0e3f0" };
const DM_CANDS = [
  { mark: [-16.2, -21.25], label: "WIMPs?", place: "right" },
  { mark: [9.85, 30.3], label: "rogue planets?", place: "left" },
  { mark: [10.1, 32.8], label: "faint dwarfs?", place: "left" },
  { mark: [-1, 9], label: "quark nuggets?", place: "left", color: "#ffe9a3" },
];
const DM_SOURCE = { title: "after Sidhu, Scherrer & Starkman (2019),\n“Death and serious injury by dark matter”", small: true, y: 0.7 };
const DM_PBH = { mark: [-8.3, 19.5], label: "primordial black holes?", place: "right", color: "#ff8fa8" };
const DM_WIDE = { r: -3, m: 2, span: 52 };
const DM_TITLE = [-11.85, -3.8];
const DM_HUB = (delay = 0) => [{ text: "here be\ndark matter?", at: DM_TITLE, size: 24, delay },
  ...[[{ r: -11.85, m: -6.2 }, { r: -16.2, m: -21.25 }], [{ r: -10.6, m: -1.1 }, { r: -8.3, m: 19.5 }],
    [{ r: -7.2, m: -1.1 }, { r: 10.1, m: 32.8 }], [{ r: -6.2, m: -1.2 }, { r: 9.85, m: 30.3 }], [{ r: -5, m: -1.3 }, { r: -1, m: 9 }]].map(([from, to], i) =>
    ({ arrow: true, from, to, color: "#ffe9a3", delay: delay + 0.5 + 0.35 * i }))];
const DM_CLOSE = { r: -5.5, m: 2.5, span: 17 };
const still = (h) => ({ ...h, instant: true, delay: 0 });
const DIVE = { in: 2, out: 2, photoAt: 0.9, size: 0.42, mirror: true };
const DIVE_PHOTO = { fadeIn: 1.1, fadeOut: 1.1, dur: 2.1 };
const DIVE_HELD = DIVE.photoAt + DIVE_PHOTO.dur;
const GAL = { dust: "galaxy", src: ["galaxy", "cluster"], color: "#80deea", sweep: 1.2, r: 2.2 };
const DROP_ARROW = { arrow: true, from: { r: 22.7, m: 44.93 }, to: { r: 22.7, m: 43.93 }, color: "#ffd54f", solid: true, width: 4.5 };
const GAL_NAMED = ["Milky Way", "Triangulum (M33)", "Large Magellanic Cloud"].map(obj => ({ obj, label: false }));
const GAL_DROP = { ...GAL, sweep: 0.01, shift: { galaxy: -1, cluster: -0.85 }, shiftAt: 0.5, shiftDur: 2 };
// ── video 5's pieces: bigger means emptier, the second edge ──
const HUB = { line: "hubble" };
const RHO = -29.05;
const AVG = { density: RHO };
const HS = "Observable Universe";
const EH = { r: 28.20, m: 56.17, mark: true };
const EHL_COL = "#ffab40";
const EHL = { line: "eventhorizon" };

export default {
  title: "Space: the middle",
  blurb: "How a star's truce breaks, the cores it leaves, the black-hole line and the search for dark matter, then out to the voids and the second edge.",
  start: { r: 10.9, m: 33.1, span: 3.6 },
  icons: "all",
  forceIcons: ["Sun", "Ton 618", "Laniakea"],
  pbhWindow: false,
  hideLabels: ["Observable Universe"],
  captionFixes: { shard: "chart", protostaur: "protostar", lamps: "lumps", tough: "thought", weight: "weigh", deaf: "death", mother: "matter", nebulas: "nebulae" },

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md): video 4's
  backing: "Mesmerize",
  sound: [
    { at: "fuel runs out", music: "heartbeat", to: "two distinct objects", stop: "cut" },
    { at: "two distinct objects", fx: "boom", offset: 0.1 },
    { at: "collapse into a black hole", fx: "drop", atEnd: true, offset: -0.4 },
    { at: "pool big enough", fx: "bubble", offset: 0.2 },
  ],

  cues: [
    // ── the truce, and how it breaks (video 3's shots) ──
    { at: "new truce", cam: { r: 10.9, m: 33.1, span: 3.6 }, dur: 2, hl: [MS, { obj: "Sun", label: "a truce" }] },
    { at: "to the left", hl: [MS, { obj: "Sun", label: "gravity pulls in" }] },
    { at: "to the right", hl: [MS, { obj: "Sun", label: "fusion pushes out" }] },
    { at: "few billion years", hl: [MS, { obj: "Sun", label: "billions of years" }, { obj: "Sirius A", delay: 0.3 }, { obj: "Vega", delay: 0.6 }] },
    { at: "fuel runs out", hl: [{ line: "mainsequence" }, { obj: "Sun", label: "out of hydrogen" }] },
    // the collapse and swell: two circles, the core staying small while the layers swell and fall back
    { at: "rapidly collapse", cam: { r: 11.85, m: 33.4, span: 3.6 }, hold: 8,
      hl: [{ swing: [{ obj: "Sun" }, { obj: "Red Giant" }], period: 2.4, core: true }, { obj: "Red Giant", label: "red giant", delay: 1 }] },
    { at: "mostly of iron", hl: [{ swing: [{ obj: "Sun" }, { obj: "Red Giant" }], period: 2.4, core: true }, { obj: "Red Giant", label: "an iron core" }] },
    { at: "catastrophic core collapse", hl: [{ swing: [{ obj: "Sun" }, { obj: "Red Giant" }], period: 1.2, core: true }, { obj: "Red Giant", label: "the fire goes out" }] },
    { at: "two distinct objects", cam: { r: 13.1, m: 33.6, span: 12.5 }, dur: 1.6,
      hl: [{ ...SPLIT, coreLabel: "core", shellLabel: "outer layers" }] },
    // the cycle: over to the nebulae, up to the nurseries, round to the stars again
    { at: "outer layers will keep", cam: NEBULAE, dur: 1.6, hl: [...CYCLE, HIGH, { ...SPLIT, draw: 0.01 }, { obj: "Supernova Remnant", label: "supernova remnant", place: "left" }] },
    { at: ["or nebulae", "or nebulas", "nebulae"], hl: [...CYCLE, { ...SPLIT, draw: 0.01 }, { obj: "Planetary Nebula", label: "planetary nebula", place: "below" }] },
    { at: "meet others", cam: CYCLE_VIEW, dur: 3.5, ease: "gentle" },
    { at: "stellar nursery", hl: [...CYCLE, { obj: "Supernova Remnant", label: false }, { obj: "Planetary Nebula", label: false }, { obj: "Stellar Nursery", label: "stellar nursery", place: "left", delay: 0.2 }] },
    { at: ["protostar", "protostaur"], hl: [...CYCLE, { obj: "Stellar Nursery", label: false }, { obj: "Protostar", delay: 0.6 }] },
    { at: "new cycle", cam: { r: 14.6, m: 33.9, span: 9 }, hl: [...CYCLE, { obj: "Stellar Nursery", label: false }, { obj: "Sun", delay: 0.6 }] },
    { at: "richer materials", hl: [...CYCLE, { obj: "Sun", label: "a third-generation star" }] },
    // the cores
    { at: "stays behind", cam: { r: 8.4, m: 33.6, span: 6 }, clear: true, hl: [{ obj: "Sun" }] },
    { at: "white dwarf", cam: { r: 9.85, m: 33.25, span: 2.6 }, hl: [{ obj: "Sun" }, { arrow: true, from: { obj: "Sun" }, to: { obj: "White Dwarf" }, color: "#90caf9" }, { obj: "White Dwarf", place: "left", delay: 0.6 },
      ...WD_LIMIT(1.2)] },
    { at: "carbon and oxygen", hl: [...WD_LIMIT(0, true), { obj: "White Dwarf", label: "carbon and oxygen", place: "left" }] },
    { at: "does go supernova", hl: [...WD_LIMIT(0, true), { obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: false, delay: 0.4 }] },
    // gravity's third win: past the electrons' last stand (the white dwarf limit), the score on screen
    { at: "win once again", hl: [...WD_LIMIT(0, true), { obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: false }, SCORE3] },
    // neutron stars and neutrons, the same density: out to both, a whip down the density lines to the
    // hydrogen atom collapsing into a neutron, then the whip back up (video 3's sequence)
    { at: "protons and electrons", offset: -1, cam: DENSE_TOP, dur: 2.2, ease: "gentle",
      hl: [...DENSITIES, { obj: "L Brown Dwarf", label: "brown dwarfs", place: "left", delay: 0.8 }, { obj: "PSR J0030+0451", label: "neutron stars", place: "right", delay: 1.2 }, { ...PSR_RING, delay: 1.2 }] },
    { at: "squeezed into", offset: -0.6, cam: { ...DENSE_BOTTOM, whip: true, overshoot: 0.15 }, dur: 1,
      icons: ["Neutrino (e)"], hideIcons: ["Hydrogen", "Neutron"], labels: false, hl: [...DENSITIES,
      { clip: "hopf-collapse", from: H_AT, to: N_AT, lead: 1, move: [1.4, 3.6], size: 150 },
      { text: "1 proton + 1 electron\n= 1 neutron + 1 neutrino", at: [-10.3, -20.3], size: 20, color: "#e9ecf5", delay: 1.1 },
      { obj: "Neutrino (e)", label: false, grow: 1.6 },
      { fly: { from: N_AT, to: NU_AT }, dur: 1.2, color: "#b3e5fc", label: "neutrino", delay: 3.8 }] },
    { at: "a neutron star", cam: { ...DENSE_TOP, whip: true, overshoot: 0.15 }, dur: 1, icons: true, hideIcons: [], labels: true,
      hl: [...DENSITIES, { obj: "PSR J0030+0451", label: "neutron star", place: "right" }, PSR_RING,
      { dust: "neutronstar", src: ["neutronstar"], color: "#80deea", sweep: 0.8, delay: 0.8 }] },
    { at: "density line of the neutron", hl: [...DENSITIES, { obj: "PSR J0030+0451", label: "the density of a neutron", place: "right" }, PSR_RING,
      { dust: "neutronstar", src: ["neutronstar"], color: "#80deea", sweep: 0.01 }] },
    { at: "any bigger", hl: [{ path: "stellar-to-bh" }, { line: "tov", label: "neutron star limit · ~2.2–2.3 Suns" }, { obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: false }, { obj: "Stellar BH", label: "black hole", delay: 0.3 }] },
    { at: "collapse into a black hole", offset: 0.6, cam: { obj: "Stellar BH", span: 1.6 }, dur: 1 },
    { at: "collapse into a black hole", offset: 1.4, photo: "m87", obj: "Stellar BH", dive: { in: 1, out: 1 }, dur: 1.2, fadeIn: 0.6, fadeOut: 0.7,
      lens: { icon: [0.5, 0.5, 0.3], photo: [1800, 1800, 700], size: [3600, 3600], fill: "cover", hold: 0.2, fillDur: 1.2 },
      caption: "a black hole · M87* · Event Horizon Telescope · 2019" },
    // (Short only: the line the long cut skips)
    { at: "deserves its own video", offset: 1.3, cam: { r: 9, m: 36.5, span: 22 }, dur: 2.5,
      hl: [{ line: "schwarzschild" }, { obj: "Stellar BH", label: "next: black holes" }] },

    // ── black holes (video 4's shots) ──
    { at: ["most objects on our chart", "objects on our short", "bunch of little dots"], cam: { r: 15.2, m: 35.6, span: 17 }, clear: true, icons: false },
    { at: "bunch of little dots", hold: 6, hl: [
      { ellipse: [9.5, 29.65, 0.75, 1.6], label: "planets", place: "below", color: "#90caf9" },
      { ellipse: [9.05, 33.0, 0.42, 0.45], label: "white dwarfs", place: "left", color: "#e0e0e0", delay: 0.25 },
      { ellipse: [11.3, 33.45, 1.15, 0.7], label: "stars", place: "right", color: "#ffd54f", delay: 0.5 },
      { ellipse: [21.85, 41.6, 0.95, 2.3], label: "galaxies", place: "above", color: "#80deea", delay: 0.75 },
    ] },
    { at: ["they all sit exactly", "they all fit exactly"], icons: true, hl: [KNOWN, { ...SCHW, label: "black holes" }] },
    { at: "called the schwarzschild radius", cam: { obj: "Sgr A*", span: 15 }, dur: 6, drift: 0.02, hl: [{ ...SCHW, label: "schwarzschild radius" }] },
    { at: ["top left edge", "top-left edge", "edge of our triangle"], cam: { r: 11, m: 38.6, span: 20 }, dur: 4, hl: [{ line: "triangle" }, { ...SCHW, label: "nothing crosses it" }, { side: "left", of: "schwarzschild" }] },
    { at: "too small for its mass", cam: { r: 5, m: 28, span: 16 },
      hl: [SCHW, { obj: "Earth" }, { arrow: true, from: { obj: "Earth" }, to: BH(27.78), label: "squeeze to 9 mm", delay: 0.6 }] },
    { at: "above or to the left", hl: [{ ...SCHW, label: "every black hole is here" }] },
    // the plant: it comes back at the Hubble sphere
    { at: "remember this line", cam: { r: 11, m: 38.6, span: 20 }, hl: [{ ...SCHW, label: "remember this line" }] },
    { at: ["doesn't really have a size", "really have a size"], cam: { obj: "Stellar BH", span: 6 }, clear: true, hl: [SCHW, { obj: "Stellar BH", label: "black hole" }] },
    { at: "singularity", hl: [SCHW, { obj: "Stellar BH", label: "a point · size zero" }] },
    { at: "event horizon", hl: [SCHW, { obj: "Stellar BH", label: "size = event horizon" }] },
    { at: "grows in step with its mass", cam: { r: 4, m: 31, span: 24 }, hl: [{ ...SCHW, label: "twice the mass, twice the size" }] },
    { at: ["straight 45-degree", "straight 45 degree", "45 degree line"], hl: [{ ...SCHW, label: "1 : 1 · 45°" }] },
    { at: "squeeze the sun", cam: { r: 7.6, m: 31.5, span: 12 }, dur: 2.5, clear: true, hl: [SCHW, { obj: "Sun", place: "right" },
      { arrow: true, from: { obj: "Sun" }, to: BH(33.3), delay: 0.5 }, { cross: BH(33.3), size: "the Sun: 6 km wide", delay: 1.4 }] },
    { at: ["the earth would be", "the earth will be", "size of a marble"], cam: { r: 4.6, m: 30.3, span: 13 }, dur: 2, hl: [SCHW, { obj: "Sun", label: false }, { mark: [5.47, 33.3], label: "the Sun · 6 km", place: "left" },
      { obj: "Earth", place: "right" }, { arrow: true, from: { obj: "Earth" }, to: BH(27.78), delay: 0.4 }, { cross: BH(27.78), size: "the Earth: 2 cm, a marble", delay: 1.2 }] },
    { at: ["collapsing core of dying stars", "collapsing core"], cam: { r: 8, m: 34, span: 12 }, hl: [{ path: "stellar-to-bh" }, { obj: "PSR J0030+0451", label: false }, { obj: "Stellar BH", label: "collapsed stars" }] },
    { at: "merging with other black holes", hl: [{ path: "bh-mergers" }, { obj: "Stellar BH", label: "or merged black holes" }] },
    { at: "a few suns", cam: { r: 11, m: 38.6, span: 20 }, hl: [{ ...SCHW, label: "every known black hole" }] },
    { at: ["our milky way", "the milky way"], cam: { r: 14, m: 41.5, span: 12 }, hl: [{ obj: "Sgr A*", label: "sgr a* · our galaxy's" }] },
    { at: ["4 million", "four million"], hl: [{ obj: "Sgr A*", label: "4 million suns" }] },
    { at: ["4 million", "four million"], offset: 0.8, cam: { obj: "Sgr A*", span: 12 }, dur: 2 },
    { at: ["4 million", "four million"], offset: 0.8, photo: "sgr-a", obj: "Sgr A*", dive: DIVE, ...DIVE_PHOTO,
      lens: { map: [0.00038123, 0, -0.17691, -0.200666], r: 0.48, size: [3600, 3600] },
      caption: "Sagittarius A*, our galaxy's black hole · Event Horizon Telescope · 2022" },
    { at: ["4 million", "four million"], offset: 0.8 + DIVE_HELD, cam: { r: 13.5, m: 41.3, span: 14 }, dur: 2 },
    { at: "the less dense they are", hl: [SCHW, { line: "water", label: "water" }] },
    { at: "less dense than water", hl: [SCHW, { line: "water", label: "water" }, { side: "right", of: "water" },
      { obj: "Sgr A*", label: "denser than water", place: "left" }, { obj: "M87*", label: "lighter than water", delay: 0.6 }] },
    { at: "pool big enough", hl: [{ line: "water" }, { side: "right", of: "water" }, { obj: "M87*", label: "it would float" }, { obj: "Ton 618", label: false }] },
    { at: ["like m87", "m87"], cam: { obj: "M87*", span: 14 }, dur: 2, hl: [{ obj: "M87*", label: "m87* · first photographed", place: "left" }] },
    { at: ["like m87", "m87"], photo: "m87", obj: "M87*", dive: DIVE, ...DIVE_PHOTO,
      lens: { map: [0.00056505, -0.00003499, -0.550765, -0.453559], r: 0.48, size: [3600, 3600] },
      caption: "M87*, the first black hole ever photographed · Event Horizon Telescope · 2019" },
    { at: ["one of the largest", "largest we know"], cam: { r: 15.4, m: 43.3, span: 7 }, hl: [{ obj: "M87*", label: false }, { obj: "Ton 618", label: "ton 618", place: "above" }] },
    { at: ["bigger than pluto's", "pluto's orbit"], hl: [{ obj: "M87*", label: false }, { obj: "Ton 618", label: "horizon ≈ 20–30× pluto's orbit", place: "above" }] },
    { at: "but how small", cam: { r: -2, m: 25, span: 28 }, dur: 4, clear: true, hl: [{ ...SCHW, label: "the smallest" }] },
    { at: "with enough pressure", cam: { r: 3, m: 28, span: 24 }, dur: 6,
      hl: [SCHW, { obj: "Earth" }, { arrow: true, from: { obj: "Earth" }, to: BH(27.78), label: "squeeze to 9 mm", delay: 0.6 }] },
    { at: ["the core of a dying star", "core of a dying star"], cam: { obj: "Stellar BH", span: 8 }, hl: [{ obj: "Stellar BH", label: "collapsed stars" }] },
    { at: ["instants after the big bang", "instance after the big bang", "after the big bang"], cam: { r: -8, m: 18, span: 34 }, clear: true },
    { at: ["dense soup", "super hot"], hl: [SCHW, { density: 40, label: "♫︎ the whole universe\nwas in a hot dense state ♪︎" }] },
    { at: ["might just be around", "might still be around"], cam: { r: -11, m: 16.8, span: 46 }, clear: true, hl: [{ window: W0, label: "could they\nbe here?", dist: 60 }] },
    { at: "quasars", hl: [{ window: W1, from: W0, trace: W0, cuts: [{ ...QSO, label: "ruled out by\nquasar light" }] }] },
    { at: "cosmic microwave background", hl: [{ window: W2, from: W1, trace: W0, cuts: [QSO, { ...CMB, label: "ruled out by the\nmicrowave background" }] }] },
    { at: "gravitational waves", hl: [{ window: W3, from: W2, trace: W0, cuts: [QSO, CMB, { ...GW, label: "ruled out by\ngravitational waves" }] }] },
    { at: "microlensing", hl: [{ window: W4, from: W3, trace: W0, cuts: [QSO, CMB, GW, { ...ML, label: "ruled out by\nmicrolensing" }] }] },
    { at: "can't be too small", cam: { r: -18, m: 10, span: 34 } },
    { at: ["would have evaporated", "they'd have evaporated"], hl: [{ window: W5, from: W4, trace: W0, cuts: [QSO, CMB, GW, ML, { ...HAW, label: "evaporated by\nhawking radiation" }] }] },
    { at: "narrow window", cam: { r: -8.6, m: 19.4, span: 12 }, hl: [{ window: W5, cuts: [ML, HAW], label: "still open", dist: 40 }] },
    { at: "mass of a small moon", cam: { r: 0.3, m: 20.3, span: 33 }, forceIcons: ["Sun", "Ton 618", "Hyperion", "Eros"], hl: [
      { obj: "Hyperion", label: "hyperion: saturn's moon", place: "below" }, { arrow: true, from: { obj: "Hyperion" }, to: BH(21.75), label: "the size of a virus", delay: 0.4 }] },
    { at: ["asteroid's mass", "asteroid mass"], hl: [{ obj: "Hyperion", label: false }, { arrow: true, from: { obj: "Hyperion" }, to: BH(21.75) },
      { obj: "Eros", label: "eros · an asteroid", place: "below", delay: 0.2 }, { arrow: true, from: { obj: "Eros" }, to: BH(18.83), label: "smaller than an atom", delay: 0.6 }] },
    { at: ["would be invisible", "they'd be invisible"], cam: { r: 23, m: 45, span: 14 }, dur: 9, drift: 0.02, clear: true, forceIcons: null },
    // dark matter: galaxies without it
    { at: ["only notice their gravity", "notice their gravity"], cam: { obj: "Milky Way", span: 7 }, clear: true, hl: [{ obj: "Milky Way" }] },
    { at: "do see that gravity", hl: [{ obj: "Milky Way", label: "more mass than we can see" }] },
    { at: ["when we weigh galaxies", "weigh galaxies", "weight galaxies"], cam: { r: 23, m: 45, span: 10 }, clear: true, hl: [GAL, { line: "darkmatter" }] },
    { at: "much heavier than everything", cam: { r: 22.3, m: 44.1, span: 3.6 }, hold: 6, icons: false,
      hl: [...GAL_NAMED, { ...DROP_ARROW, delay: 0.5, draw: 2 }, { ...GAL_DROP, label: "without dark matter", labelY: 0.12 }, { line: "darkmatter", label: "measured" }, { line: "luminous", label: "stars and gas only", delay: 2 }] },
    { at: ["ten times", "10 times"], hl: [...GAL_NAMED.map(still), { ...DROP_ARROW, draw: 0.01 }, { ...GAL_DROP, shiftAt: -10, label: "about 10× lighter", labelY: 0.12 }, { line: "darkmatter", label: "measured" }, { line: "luminous", label: "stars and gas only" }] },
    { at: "something invisible", cam: DM_WIDE, dur: 4, drift: 0, quiet: true, labels: false, clear: true, icons: true,
      hl: [SCHW, ...DM_CANDS.map((c, i) => ({ ...c, delay: 1.2 + 0.5 * i }))] },
    { at: "we don't know what it is", cam: { r: -8.6, m: 19.4, span: 12 }, dur: 5, drift: 0, quiet: true,
      hl: [SCHW, ...DM_CANDS.map(still), { ...DM_PBH, delay: 0.4 }, { window: W5, cuts: [ML, HAW], delay: 0.8 }] },
    { at: ["just tiny black holes", "tiny black holes"], labels: true, clear: true,
      hl: [{ window: W5, cuts: [ML, HAW], label: "still open", dist: 40 }] },
    { at: ["any new particle"], cam: { r: -7.4, m: 20.6, span: 10 }, dur: 6, drift: 0.01, hl: [{ window: W5, from: W6, trace: W0, cuts: [ML, HAW, NS], label: "still open", dist: 40 }] },
    { at: "something else entirely", cam: DM_WIDE, dur: 4, drift: 0, quiet: true, labels: false, clear: true,
      hl: [SCHW, ...DM_CANDS.map((c, i) => ({ ...c, delay: 1 + 0.5 * i })), { ...DM_PBH, delay: 2.5 }, { window: W5, cuts: [ML, HAW], delay: 2.5 }] },
    { at: "somewhere on this chart", hl: [SCHW, ...DM_HUB(0), ...DM_CANDS.map(still), still(DM_PBH), { window: W5, cuts: [ML, HAW] }] },
    { at: "not only on the black hole line", cam: DM_CLOSE, dur: 4.5, drift: 0, quiet: true,
      hl: [SCHW, ...DM_CANDS.map(still), still(DM_PBH), { window: W5, cuts: [ML, HAW] }] },
    { at: ["lumps about roughly this size", "lamps about roughly this size", "roughly this size"], hl: [SCHW, ...DM_CANDS.map(still), still(DM_PBH), { window: W5, cuts: [ML, HAW] },
      { ...DM_SOURCE, delay: 0.6 }, { ...DM_MICA, delay: 0.2 }] },
    { at: "can't be here either", hl: [SCHW, ...DM_CANDS.map(still), still(DM_PBH), { window: W5, cuts: [ML, HAW] },
      still(DM_SOURCE), still(DM_MICA), { ...DM_HURT, delay: 0.1 }] },
    { at: ["death records", "deaf records"], hl: [SCHW, ...DM_CANDS.map(still), still(DM_PBH), { window: W5, cuts: [ML, HAW] },
      still(DM_SOURCE), still(DM_MICA), { ...DM_HURT, draw: 0.01, label: "ruled out by the\ndeath records" }] },
    { at: "the search for dark matter", cam: DM_WIDE, dur: 8, drift: 0, quiet: true,
      hl: [SCHW, ...DM_CANDS.map(still), still(DM_PBH), { window: W5, cuts: [ML, HAW] },
        still(DM_SOURCE), still(DM_MICA), still(DM_HURT), { ...DM_WD, delay: 0.8 }, { ...DM_CMB, delay: 3.2 },
        { window: W5, cuts: [QSO, CMB, GW, ML, HAW], delay: 5.4 }] },
    // the survivors: one slow zoom out to the whole triangle, the early universe's density line kept on
    { at: ["very first moments of our history", "first very moments of our history", "moments of our history"], cam: FULL, dur: 15, drift: 0, quiet: true, labels: false, clear: true, hold: 20,
      hl: [{ density: 44, label: "density of universe\nfirst instants after big bang" }] },

    // ── the turn, and bigger means emptier (video 5's shots) ──
    { at: "first edge of the triangle", cam: { r: 11.5, m: 40, span: 16 }, dur: 2.4, labels: true, clear: true,
      hl: [{ ...SCHW, label: "edge 1 · the black-hole line" }, { obj: "Stellar BH", label: false }, { obj: "Sgr A*", label: false, delay: 0.4 }, { obj: "M87*", label: false, delay: 0.8 },
        { obj: "Ton 618", label: false, delay: 1.2 }, { side: "left", of: "schwarzschild", label: "nothing", delay: 2 }] },
    { at: ["biggest things there are", "to the right, to the biggest"], cam: { r: 18, m: 39, span: 20 }, dur: 3, clear: true, hl: [{ obj: "Supernova Remnant", label: false }, { obj: "Milky Way", label: false, delay: 0.8 }] },
    { at: "every diagonal on this chart", cam: { r: 14, m: 39, span: 30 }, dur: 2,
      hl: [{ density: 0, label: "atoms · 1 g/cm³" }, { density: 14.36, label: "neutrons", delay: 0.6 }] },
    { at: "density of neutrons", hl: [{ density: 0 }, { density: 14.36, label: "neutron density" }, { obj: "PSR J0030+0451", label: "neutron stars" }] },
    { at: "degenerate matter", hl: [{ density: 0 }, { density: 14.36 }, { obj: "White Dwarf", label: "degenerate electrons hold it up", place: "left" }, { obj: "L Brown Dwarf", label: "and these", place: "left", delay: 0.4 }] },
    { at: "density of atoms", hl: [{ density: 0, label: "atoms · 1 g/cm³" }, { density: 14.36 }, { obj: "Sun", label: false }, { obj: "Earth", label: false, delay: 0.3 }] },
    { at: "less dense than water itself", hl: [{ density: 0, label: "water" }, { side: "right", of: "water" }, { obj: "M87*", label: "lighter than water" }, { obj: "Ton 618", label: false, delay: 0.3 }] },
    { at: "emptier things get", cam: { r: 19.6, m: 37.6, span: 4, glide: true }, dur: 2, clear: true, density: 118,
      hl: [{ obj: "Globular Cluster" }, { obj: "Dwarf Galaxy", delay: 0.5 }, { obj: "Milky Way", label: false, delay: 1 }] },
    { at: "between its stars", cam: { r: 21.6, m: 41.4, span: 4, glide: true }, hl: [{ obj: "Milky Way", label: "~1 atom per cm³" }] },
    { at: ["the milky way", "milky way"], cam: { r: 22.5, m: 44.0, span: 4, glide: true }, hl: [{ obj: "Milky Way" }, { obj: "Andromeda (M31)", delay: 0.6 }] },
    { at: "local group", hl: [{ obj: "Milky Way", label: false }, { obj: "Andromeda (M31)", label: "local group" }] },
    // the callback: the galaxies weighed a minute ago, with and without their dark matter
    { at: ["weighed a minute ago", "a minute ago"], hl: [{ obj: "Milky Way", label: false }, { obj: "Andromeda (M31)", label: false }, { line: "darkmatter", label: "with dark matter" }, { line: "luminous", label: "stars and gas only", delay: 0.6 }] },
    { at: ["ten times heavier", "times heavier"], hl: [{ obj: "Milky Way", label: "5–10× heavier than it looks" }, { line: "darkmatter", label: "with dark matter" }, { line: "luminous", label: "stars and gas only" }] },
    { at: "galaxy clusters", cam: { r: 23.8, m: 46.4, span: 4, glide: true }, hl: [{ obj: "Bullet Cluster", label: "emptier still" }] },
    { at: "between them", hl: [{ obj: "Bullet Cluster", label: "Bullet Cluster" }] },
    { at: "holds them together", hl: [{ obj: "Bullet Cluster", label: "held together by gravity" }] },
    { at: "superclusters", cam: { r: 25.5, m: 48.3, span: 4, glide: true }, hl: [{ obj: "Laniakea", label: "superclusters" }] },
    { at: "laniakea", hl: [{ obj: "Laniakea", label: "Laniakea · 100,000 galaxies" }] },
    { at: "voids", cam: { r: 26.3, m: 49.6, span: 4, glide: true }, hl: [{ obj: "Laniakea", label: false }, { obj: "Boötes Void", label: "voids" }, { obj: "KBC Void", label: false, delay: 0.4 }] },
    { at: "not completely empty", hl: [{ obj: "Boötes Void", label: "emptier than average" }, { obj: "KBC Void", label: false }] },
    { at: "anything be bigger", cam: { r: 26.8, m: 51.0, span: 4.3, glide: true } },

    // ── the second edge ──
    { at: "the second edge", cam: { r: 25, m: 51, span: 16 }, dur: 3, clear: true, density: null, hideIcons: [HS],
      hl: [SCHW, { ...HUB, label: "edge 2" }] },
    { at: "the hubble sphere", hl: [SCHW, { ...HUB, label: "the Hubble sphere's edge" }] },
    { at: "speed limit", hl: [{ ...HUB, label: "nothing travels faster than light" }] },
    { at: "space itself", hl: [{ ...HUB, label: "but space can outrun light" }] },
    { at: "more space being created", hl: [{ ...HUB, label: "new space, everywhere" }] },
    { at: "resolution of a photo", hl: [{ pixels: { cell: 16, steps: [2.6, 5.2] } }] },
    { at: "further away", hl: [HUB, { obj: "Laniakea", label: false }, { arrow: true, from: { obj: "Laniakea" }, to: { obj: HS }, label: "farther, faster" }] },
    { at: "speed of light", hl: [{ ...HUB, label: "here: as fast as light" }] },
    { at: ["14 billion", "fourteen billion"], hl: [{ ...HUB, label: "14 billion light-years away" }] },
    { at: "could never reach us", hl: [{ ...HUB, label: "their light never gets here?" }] },
    { at: "also growing", hl: [{ ...HUB, label: "the sphere grows · their light gets here" }] },
    { at: "real edge", cam: { r: 28.16, m: 55.45, span: 1.1 }, dur: 2.4, labels: false,
      hl: [{ ...HUB, label: "Hubble line" }, { ...EHL, label: "cosmic event horizon", delay: 1.4 }] },
    { at: "can ever affect us", hl: [HUB, { ...EHL, label: "the edge of our universe" }] },
    { at: "limit of the unknowable", hl: [HUB, { ...EHL, label: "the unknowable" }] },
  ],
};
