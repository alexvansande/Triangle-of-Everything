// =============================================================
// Scene: short-05-hubble-sphere — video 5, re-recorded on 2026-10-29 (rec49, rec50; a recap of the
// series in place of the old opening; video/short-05-hubble-sphere/; the rec40 take of 2026-10-27 and
// the rec29–31 one are in git history). One density
// line and the split; dead stars and the Schwarzschild limit; stars and nebulae; bigger
// means emptier up to Laniakea and the voids; the second edge, expansion and the Hubble
// line; the cosmic event horizon; the Hubble sphere on the black-hole line and why it
// isn't one; everyone's own universe; the two limits; the observable universe.
// =============================================================
// Field reference: docs/narration.md, "Scene fields".

const FULL = { r: -2.2, m: -4.8, span: 74 };
const SCHW = { line: "schwarzschild" };
const HUB = { line: "hubble" };
// the average density of the universe today (the critical density, ~9e-30 g/cm³:
// about five hydrogen atoms' mass per cubic metre); every horizon sits on it
const RHO = -29.05;
const AVG = { density: RHO };
// the three horizons, as spheres of the universe at that density
const HS = "Observable Universe";                    // the chart's dot sits at the Hubble radius
const EH = { r: 28.20, m: 56.17, mark: true };       // cosmic event horizon, 16.7 billion ly
const EHL_COL = "#ffab40";
const EHL = { line: "eventhorizon" };                // …and as a line, like the Hubble line
const PH = { r: 28.64, m: 57.49, mark: true };       // particle horizon = observable universe, 46.5 billion ly
// a dying massive star: the core collapses to a neutron star, the layers blow out as a supernova
const SN_SPLIT = { split: { from: { obj: "Red Giant" }, core: { obj: "PSR J0030+0451" }, shell: { obj: "Supernova Remnant" } } };
const OU = { ellipse: [PH.r, PH.m, 0.09, 0.09], rot: 0, place: "above" };   // a ring on that dot, for its label
// the whole universe on a log scale (the spectrum explorer's Cloud, log radius from 1,000 km,
// as in video 7), false colour: red microwave, green far infrared, blue visible light
const LOG_UNIT = Math.log10(1000 / 9.4607e12);
const UNIVERSE_COLOURS = { c: 13, s: 8.5 };
// Earth close first, in natural colour (the continents), then out to the edge of the observable
// universe; each distance named as it comes into view, one at a time, then faded (author, 2026-10-28)
const EARTH_VIEW = { yaw: -2.5666, pitch: 0.835, orbit: 6.2, gmst: 0.035 };   // (video 7's camera: Europe and Africa in front)
const NATURAL = { c: 22, s: 1 };
// the zoom out: [seconds after "seeing it right now", Earth's size (ezoom), ease], chained into one move
const ZOOM_OUT = [[1.2, 0.75, "in"], [4.2, 1.5, "linear"], [6.2, 2.6, "linear"], [8.2, 3.9, "linear"], [10.2, 5.5, "linear"], [12.2, 7.2, "linear"], [14.2, 8.8, "out"]];
// [seconds after, ring or marker, shown as, seconds shown]
const UNIVERSE_NAMES = [
  [4.6, "the Moon's orbit · 1.3 light-seconds", "the Moon · 1.3 light-seconds", 1.5],
  [6.6, "the Sun's path · 8 light-minutes", "the Sun · 8 light-minutes", 1.5],
  [8.6, "Proxima Centauri · 4.2 light-years", "nearest stars · 4 light-years", 1.5],
  [10.6, "Milky Way", "our galaxy · 100,000 light-years", 1.5],
  [12.6, "1 billion ly", "1 billion light-years", 1.5],
  [14.8, "edge", "observable universe's edge", 4.2],   // (longer names find no room on the ring)
];
// (anchored on a phrase; `k` scales the whole sequence's timing: 0.85 fits it between "46 billion" and
// "the only object that falls outside our triangle" in the rec49/50 take)
const universeCues = (at, k = 1) => [
  ...ZOOM_OUT.map(([dt, ezoom, ease], i) => ({ at, offset: k * dt - 0.25,
    explorer: { ezoom, ease, dur: k * ((ZOOM_OUT[i + 1]?.[0] ?? dt + 3) - dt) } })),
  ...UNIVERSE_NAMES.flatMap(([dt, key, text, hold]) => [
    { at, offset: k * dt - 0.25, explorer: { labels: { [key]: text }, names: 1, dur: 0.5 } },
    { at, offset: k * (dt + hold) - 0.25, explorer: { names: 0, dur: 0.5 } }]),
];
const UNIVERSE_KEY = { key: [["microwave", "#ff6b5e"], ["far infrared", "#7ddc6f"], ["visible light", "#7fa2ff"]], y: 0.7 };   // above the captions, clear of the ring labels

export default {
  title: "The Hubble sphere",
  blurb: "Bigger means emptier, the second edge of the triangle, the edge of our own universe, why it sits on the black-hole line, and the observable universe.",
  start: FULL,

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md)
  backing: "Fresh Air",

  // (the nebulae and everything bigger are drawn larger by the chart's own size curve now,
  // main.js iconSizeCurve: 1.6-2.3x; the scene's 1.4x iconBoost came off so it isn't doubled)
  // Laniakea's picture shows even where the Boötes Void's would hide it, in front of it
  forceIcons: ["Laniakea", "Ton 618"],   // TON 618 beside the (larger, 2026-10-29) M87*
  // no "Observable Universe" name on the Hubble sphere's dot (author, 2026-10-28)
  hideLabels: ["Observable Universe"],

  // the explorer's state at t = 0, hidden until "…seeing it right now" (no Compton line over it)
  explorer: { view: "cloud", radius: "log", unit: LOG_UNIT, rings: true, bright: "lin", labels: {},
    ...EARTH_VIEW, ezoom: 0.33, line: 0, guides: 0.75, names: 0, dot: 1.5, exposure: 1.1, ...NATURAL },

  captionFixes: { hobo: "Hubble", mouth: "mouse", subtor: "super", chaos: "scale", finely: "finally",
    math: "mass", shard: "chart", radio: "radius", plop: "pop" },

  cues: [
    // ── Where we are: the series so far (rec49's recap) ──────
    { at: "exploring this chart", offset: -0.4, cam: { obj: "Human", span: 26 }, dur: 8, drift: 0.02 },
    { at: "mass and size", hl: [{ line: "triangle" }] },
    { at: "made of matter", hl: [{ line: "water", label: "made of atoms" }, { obj: "Human", delay: 0.4 }] },
    { at: "once we reach stars", cam: { r: 10.5, m: 33, span: 12 }, dur: 1.6, hl: [{ line: "water" }, { obj: "Sun", label: "stars" }] },
    { at: "dead remains", cam: { r: 8, m: 33.6, span: 14 }, dur: 1.4,
      hl: [{ obj: "White Dwarf", place: "above" }, { obj: "PSR J0030+0451", label: "neutron star", place: "left", delay: 0.4 }, { obj: "Stellar BH", label: "black hole", delay: 0.8 }] },
    { at: "to the right we have stars", cam: { r: 14, m: 34, span: 14 }, dur: 1.6,
      hl: [{ obj: "Sun" }, { obj: "Red Giant", label: "red giants", delay: 0.6 }, { obj: "Supernova Remnant", label: "supernova remnants", delay: 1.2 }] },
    { at: "the last video", cam: { r: 11.5, m: 40, span: 16 }, dur: 2.4, clear: true,
      hl: [{ ...SCHW, label: "edge 1 · the black-hole line" }, { obj: "Stellar BH", label: false }, { obj: "Sgr A*", label: false, delay: 0.4 }, { obj: "M87*", label: false, delay: 0.8 },
        { obj: "Ton 618", label: false, delay: 1.2 }, { side: "left", of: "schwarzschild", label: "nothing", delay: 2 }] },
    // to the right, up past the nebulae (the Hubble line hidden until it's named)
    { at: "the next edge", cam: { r: 18, m: 39, span: 20 }, dur: 3, clear: true, hl: [{ obj: "Supernova Remnant", label: false }, { obj: "Milky Way", label: false, delay: 0.8 }] },

    // ── Bigger means emptier ─────────────────────────────────
    // every diagonal a density (the series' own): atoms, neutrons (video 3), then emptier and emptier
    { at: "every diagonal line", cam: { r: 14, m: 39, span: 30 }, dur: 2,
      hl: [{ density: 0, label: "atoms · 1 g/cm³" }, { density: 14.36, label: "neutrons", delay: 0.6 }] },
    { at: "neutron stars actually", hl: [{ density: 0 }, { density: 14.36, label: "neutron density" }, { obj: "PSR J0030+0451", label: "neutron stars" }] },
    { at: "emptier and emptier", hl: [{ density: 0 }, { density: -24, label: "a galaxy · ~1 atom per cm³", delay: 0.3 }, { ...AVG, label: "the universe · ~5 atoms per m³", delay: 1.4 }] },
    // closer in (4 decades across) and one slow pan up all the way to the voids, the pictures
    // allowed to overlap so there are plenty of them (`density` above 100) (author, 2026-10-28)
    { at: "the less dense it is", cam: { r: 19.6, m: 37.0, span: 4, glide: true }, dur: 2, clear: true, density: 118,
      hl: [{ obj: "Globular Cluster" }, { obj: "Dwarf Galaxy", delay: 0.5 }, { obj: "Milky Way", label: false, delay: 1 }] },
    { at: "between its stars", cam: { r: 21.6, m: 41.4, span: 4, glide: true }, hl: [{ obj: "Milky Way", label: "~1 atom per cm³" }] },
    { at: "the milky way", cam: { r: 22.5, m: 44.0, span: 4, glide: true }, hl: [{ obj: "Milky Way" }, { obj: "Andromeda (M31)", delay: 0.6 }] },
    { at: "local group", hl: [{ obj: "Milky Way", label: false }, { obj: "Andromeda (M31)", label: "local group" }] },
    // (the Bullet Cluster stands for the galaxy clusters)
    { at: "galaxy clusters", cam: { r: 23.8, m: 46.4, span: 4, glide: true }, hl: [{ obj: "Bullet Cluster", label: "emptier still" }] },
    { at: "between them", hl: [{ obj: "Bullet Cluster", label: "Bullet Cluster" }] },
    { at: "superclusters", cam: { r: 25.5, m: 48.3, span: 4, glide: true }, hl: [{ obj: "Laniakea", label: "superclusters" }] },
    { at: "laniakea", hl: [{ obj: "Laniakea", label: "Laniakea · 100,000 galaxies" }] },
    { at: "voids", cam: { r: 26.3, m: 49.6, span: 4, glide: true }, hl: [{ obj: "Laniakea", label: false }, { obj: "Boötes Void", label: "voids" }, { obj: "KBC Void", label: false, delay: 0.4 }] },
    { at: "not completely empty", hl: [{ obj: "Boötes Void", label: "emptier than average" }, { obj: "KBC Void", label: false }] },
    { at: "anything be bigger", cam: { r: 26.8, m: 51.0, span: 4.3, glide: true } },

    // ── The second edge ──────────────────────────────────────
    // only the line while the Hubble line is talked about; the Hubble sphere's own dot comes with
    // its mass, at "here's where it lands" (the author's note in rec50, 2026-10-29)
    { at: "the second edge", cam: { r: 25, m: 51, span: 16 }, dur: 3, clear: true, density: null, hideIcons: [HS],
      hl: [SCHW, { ...HUB, label: "edge 2" }] },
    { at: "that's the hubble sphere", hl: [SCHW, { ...HUB, label: "the Hubble sphere's edge" }] },
    { at: "speed limit", hl: [{ ...HUB, label: "nothing travels faster than light" }] },
    { at: "space itself", hl: [{ ...HUB, label: "but space can outrun light" }] },
    { at: "more space being created", hl: [{ ...HUB, label: "new space, everywhere" }] },
    // a picture gaining pixels, on its own and full screen: each pixel becomes four
    { at: "resolution of a photo", hl: [{ pixels: { cell: 16, steps: [2.6, 5.2] } }] },
    { at: "further away", hl: [HUB, { obj: "Laniakea", label: false }, { arrow: true, from: { obj: "Laniakea" }, to: { obj: HS }, label: "farther, faster" }] },
    { at: "speed of light", hl: [{ ...HUB, label: "here: as fast as light" }] },

    // ── The cosmic event horizon ─────────────────────────────
    { at: "could never reach us", hl: [{ ...HUB, label: "their light never gets here?" }] },
    { at: "also growing", hl: [{ ...HUB, label: "the sphere grows · their light gets here" }] },
    // the cosmic event horizon as a line like the Hubble line, a little to its right (16.7 vs 14.4
    // billion ly); its dot only comes with the mass, on the black-hole line (author, 2026-10-28)
    { at: "real edge", cam: { r: 28.16, m: 55.45, span: 1.1 }, dur: 2.4, labels: false,
      hl: [{ ...HUB, label: "Hubble line" }, { ...EHL, label: "cosmic event horizon", delay: 1.4 }] },
    { at: "can ever affect us", hl: [HUB, { ...EHL, label: "the edge of our universe" }] },
    { at: "limit of the unknowable", hl: [HUB, { ...EHL, label: "the unknowable" }] },

    // ── On the black-hole line ───────────────────────────────
    { at: "add up everything", cam: { r: 27.9, m: 54, span: 9 }, labels: true, clear: true, hideIcons: null,
      hl: [{ obj: HS, label: "everything inside the Hubble sphere" }, { mark: [EH.r, EH.m], color: EHL_COL, delay: 1.2 }] },
    // (the Hubble sphere unnamed here, so its mass readout gives the dot's name room)
    { at: "right on the black hole line", hl: [{ ...SCHW, label: "on the black-hole line" }, { obj: HS, label: false }, { mark: [EH.r, EH.m], color: EHL_COL, label: "cosmic event horizon" }] },
    { at: "inside a black hole", hl: [SCHW, { obj: HS, label: "a black hole?" }] },
    { at: "kind of a horizon", hl: [{ ...SCHW, label: "event horizons" }, { ...HUB, label: false }, { obj: HS, label: false }] },
    // down the black-hole line to M87*, a dive with the EHT photo over its picture (lens);
    // then back up to the Hubble sphere
    { at: "kind of a horizon", offset: 0.5, cam: { obj: "M87*", span: 3 }, dur: 2.2,
      hl: [{ ...SCHW, label: "event horizons" }] },
    { at: "kind of a horizon", offset: 2.3, photo: "m87", obj: "M87*", dive: { in: 1.6, out: 2, photoAt: 0.4 }, dur: 2.6, fadeIn: 0.9,
      lens: { map: [0.00056505, -0.00003499, -0.550765, -0.453559], r: 0.48, size: [3600, 3600] },
      caption: "M87*'s event horizon · Event Horizon Telescope · 2019" },
    { at: "can never come out", cam: { r: 26.5, m: 54, span: 9 }, hl: [{ ...SCHW, label: "nothing gets out" }, { obj: HS, label: false }] },
    { at: "can ever come in", hl: [SCHW, { obj: HS, label: "nothing gets in" }] },
    { at: "depend on the mass", hl: [SCHW, { ...AVG, label: "both set by mass" }, { obj: HS, label: false }] },
    { at: "radius of a black hole", hl: [{ ...SCHW, label: "a black hole: size set by mass" }, { obj: HS, label: false }] },
    { at: "how fast the universe expands", hl: [SCHW, { ...AVG, label: "expansion rate ↔ density" }, { obj: HS, label: false }] },
    { at: "no coincidence", hl: [{ ...SCHW, label: "the same line" }, { obj: HS, label: "no coincidence" }] },
    { at: "object with a center", cam: { obj: "Ton 618", span: 8 }, hl: [SCHW, { obj: "Ton 618", label: "a black hole: a lump with a centre" }] },

    // ── Our universe ─────────────────────────────────────────
    { at: "our universe", cam: { r: 27.4, m: 54.8, span: 8 }, hl: [HUB, { obj: HS, label: "our universe" }] },
    // a galaxy at the edge of our universe (the Sombrero stands in for any of them), and ours
    { at: "one of those galaxies", cam: { r: 25, m: 50, span: 12 }, dur: 3, hl: [HUB, { obj: HS, label: false }, { obj: "Sombrero (M104)", label: "a galaxy at our edge" }] },
    { at: "centered around them", hl: [HUB, { obj: HS, label: "everyone has their own" }, { obj: "Sombrero (M104)", label: false }] },
    { at: "put up a telescope", hl: [HUB, { obj: HS, label: false }, { obj: "Sombrero (M104)", label: "their telescopes" }] },
    { at: "out of our reach", hl: [HUB, { side: "right", of: "hubble", label: "more galaxies" }, { obj: HS, label: false }, { obj: "Sombrero (M104)", label: false }] },
    { at: "practically infinite", cam: { r: 27, m: 54, span: 10 }, hl: [HUB, { side: "right", of: "hubble" }, { obj: HS, label: "beyond: probably more of the same" }] },

    // ── The observable universe ──────────────────────────────
    { at: "how do we know", cam: { r: 28.2, m: 56.4, span: 5 }, clear: true, hl: [HUB, { obj: HS, label: false }] },
    { at: "we also see them", hl: [HUB, { obj: HS, label: "we see them too" }] },
    // (the real figure on screen: c/H₀ ≈ 14 billion ly; the narration rounds it to 13)
    { at: "13 billion", hl: [HUB, { obj: HS, label: "Hubble sphere · 14 billion ly" }] },
    // ── The whole universe on a log scale (author, 2026-10-27) ──
    // from Earth out to the edge of the observable universe in one zoom as the 46 billion is named,
    // a few distances named, and what the colours stand for; the rings go and the dots brighten at
    // "the sum of all the light", and it hands back to the chart for "outside our triangle"
    { at: "46 billion", clear: true, hold: 20, hl: [{ ...UNIVERSE_KEY, delay: 7 }], explorer: { show: true, fade: 1.6, spin: 0.03 } },
    ...universeCues("46 billion", 0.85),
    { at: "46 billion", offset: 5.8, explorer: { ...UNIVERSE_COLOURS, dur: 3 } },
    { at: "sum of all the light", offset: -0.4, clear: true, explorer: { guides: 0, names: 0, exposure: 2, dot: 2, dur: 3 } },
    { at: ["the only object", "falls outside our triangle"], explorer: { show: false, fade: 1.4 }, cam: { r: 28.2, m: 56.4, span: 5 }, dur: 0.01, clear: true,
      hl: [{ obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: PH, delay: 1.2 }, { ...OU, label: "observable universe · 46 billion ly", delay: 1.6 }] },
    { at: "falls outside our triangle", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label: "outside the triangle" }] },
    { at: "one single object", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label: "not one object" }] },
    { at: "right now", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label: "where they are now" }] },
    { at: "much closer to us", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label: "their light left when they were close" }] },
    { at: "snapshot of history", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label: "a snapshot of history" }] },
    // the Deep Field for the last lines, the galaxies beyond our reach (the author prefers it to the
    // microwave background here, 2026-10-27)
    { at: "snapshot of history", offset: 1.4, photo: "xdf", dur: 24, kb: [1, 1.6], caption: "Hubble eXtreme Deep Field · 2012 · galaxies as they were, up to 13 billion years ago" },
  ],
};
