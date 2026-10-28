// =============================================================
// Scene: short-05-hubble-sphere — video 5, re-recorded at home on 2026-10-27 (rec40;
// video/short-05-hubble-sphere/; the rec29–31 take of 2026-10-21 is in git history). One density
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
const PH = { r: 28.64, m: 57.49, mark: true };       // particle horizon = observable universe, 46.5 billion ly
// a dying massive star: the core collapses to a neutron star, the layers blow out as a supernova
const SN_SPLIT = { split: { from: { obj: "Red Giant" }, core: { obj: "PSR J0030+0451" }, shell: { obj: "Supernova Remnant" } } };
const OU = { ellipse: [PH.r, PH.m, 0.09, 0.09], rot: 0, place: "above" };   // a ring on that dot, for its label
// the whole universe on a log scale (the spectrum explorer's Cloud, log radius from 1,000 km,
// as in video 7), false colour: red microwave, green far infrared, blue visible light
const LOG_UNIT = Math.log10(1000 / 9.4607e12);
const UNIVERSE_COLOURS = { c: 13, s: 8.5 };
const UNIVERSE_LABELS = { "1 ly": "1 light-year", "Proxima Centauri · 4.2 light-years": "nearby stars", "1,000 ly": "1,000 light-years",
  "Milky Way": "our galaxy", "1 million ly": "1 million light-years", "1 billion ly": "1 billion light-years", edge: "edge of the observable universe" };
const UNIVERSE_KEY = { key: [["microwave", "#ff6b5e"], ["far infrared", "#7ddc6f"], ["visible light", "#7fa2ff"]], y: 0.7 };   // above the captions, clear of the ring labels

export default {
  title: "The Hubble sphere",
  blurb: "Bigger means emptier, the second edge of the triangle, the edge of our own universe, why it sits on the black-hole line, and the observable universe.",
  start: FULL,

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md)
  backing: "Fresh Air",

  // the explorer's state at t = 0, hidden until "…seeing it right now" (no Compton line over it)
  explorer: { view: "cloud", radius: "log", unit: LOG_UNIT, rings: true, bright: "lin", labels: UNIVERSE_LABELS,
    yaw: 3.74, pitch: 0.5, spinA: 0, zoom: 8, line: 0, guides: 1, exposure: 1, ...UNIVERSE_COLOURS },

  captionFixes: { hobo: "Hubble", mouth: "mouse", subtor: "super", chaos: "scale", finely: "finally",
    math: "mass", shard: "chart", radio: "radius", plop: "pop" },

  cues: [
    // ── One line, and the split ──────────────────────────────
    // a slow push in from the whole chart towards us
    { at: "try to fit everything", offset: -0.4, cam: { obj: "Human", span: 26 }, dur: 14, drift: 0.02 },
    { at: "log chart of mass and size", hl: [{ line: "triangle" }] },
    { at: "this diagonal line", hl: [{ line: "water", label: "made of atoms" }, { obj: "Human", delay: 0.6 }] },
    { at: "smallest", cam: { r: 3.2, m: 11, span: 14 },
      hl: [{ line: "water" }, { obj: "Mouse" }, { obj: "Blue Whale", delay: 0.6 }] },
    { at: "mount everest", cam: { r: 6.5, m: 21, span: 16 }, hl: [{ line: "water" }, { obj: "Mt. Everest" }, { obj: "Moon", delay: 0.5 }] },
    { at: ["to a jupiter", "jupiter-sized planet"], cam: { r: 9.4, m: 29, span: 5 }, hl: [{ obj: "Jupiter" }] },
    { at: "trend changes", cam: { r: 9.88, m: 30.7, span: 2.6 }, hl: [{ obj: "Jupiter", label: "Jupiter size" }] },
    { at: "times jupiter's mass", hl: [{ obj: "Jupiter", label: false, place: "left" }, { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f" }] },
    { at: "after brown dwarfs", cam: { r: 10, m: 32.5, span: 9 }, hl: [{ obj: "L Brown Dwarf", label: "brown dwarfs" }] },
    { at: "to the left", cam: { r: 7, m: 33.5, span: 16 }, hl: [{ obj: "L Brown Dwarf", label: false }, { obj: "White Dwarf", label: "no normal matter", place: "above" }] },
    { at: "dead stars",
      // (the white dwarf's name above its own dot: on the left it read as the neutron star's, below it sat on the red dwarf)
      hl: [{ obj: "White Dwarf", place: "above" }, { obj: "PSR J0030+0451", label: "neutron star", place: "left", delay: 0.8 }, { obj: "Stellar BH", label: "black hole", delay: 1.6 }] },
    { at: "first limit", cam: { r: 11.5, m: 40, span: 16 }, dur: 3,
      hl: [{ ...SCHW, label: "edge 1" }, { obj: "Stellar BH", label: false }, { obj: "Sgr A*", label: false, delay: 0.4 }, { obj: "M87*", label: false, delay: 0.8 }, { obj: "Ton 618", label: false, delay: 1.2 }] },
    { at: "called the schwarzschild", hl: [{ ...SCHW, label: "Schwarzschild radius" }, { obj: "Stellar BH", label: false }, { obj: "Sgr A*", label: "black holes live on it" }, { obj: "M87*", label: false }, { obj: "Ton 618", label: false }] },
    { at: "above or to the left", hl: [SCHW, { side: "left", of: "schwarzschild", label: "nothing" }] },
    // the star as core + outer layers (as in videos 3 and 4), then the split: core to the
    // neutron stars, the layers out to the supernova remnant
    { at: "to the right we have stars", cam: { r: 12.4, m: 33.8, span: 14.5 }, clear: true,
      hl: [{ swing: [{ obj: "Sun" }, { obj: "Red Giant" }], period: 2.4, core: true }, { obj: "Red Giant", label: "red giants", delay: 2.2 }] },
    { at: "explode as supernovae", cam: { r: 12.4, m: 33.8, span: 18.5 }, dur: 1.6, hl: [{ ...SN_SPLIT, coreLabel: "neutron star", shellLabel: "supernova" }] },
    { at: "spreads out into space", cam: { r: 17, m: 35, span: 12 },
      hl: [{ ...SN_SPLIT, draw: 0.01 }, { arrow: true, from: { obj: "Supernova Remnant" }, to: { obj: "Stellar Nursery" } }, { obj: "Stellar Nursery", label: "new stars", delay: 0.6 }] },

    // ── Bigger means emptier ─────────────────────────────────
    // a dive onto the nursery, the Pillars over its picture (lens), as in video 3
    { at: "new generation", cam: { obj: "Stellar Nursery", span: 3 }, dur: 1.6 },
    // the photo already coming in on the approach; the dive unwinds behind it while it fills the
    // screen (dive.under), so it fades straight back to the chart: no zoom back out (author, 2026-10-27)
    { at: "new generation", photo: "pillars", obj: "Stellar Nursery", dive: { in: 1.6, out: 2.5, photoAt: 0.4, under: true }, dur: 4.2, fadeIn: 0.9, fadeOut: 1.5,
      lens: { map: [0.00033491, -0.00026951, -0.34744085, 0.36319975], r: 0.44, size: [2078, 3600], fill: "cover", turn: 0, hold: 0, fillDur: 1.6 },   // turn 0: Webb's pillars lean ~40°; kept tilted so they stay upright like the icon's
      caption: "Pillars of Creation · Webb · 2022 · where stars are born" },
    // after the Pillars, close in (about 5 decades across) and one slow glide up the line, object
    // to object, instead of a wide view and quicker jumps (author, 2026-10-27, evening)
    { at: "mostly empty space", cam: { obj: "Stellar Nursery", span: 5.5 }, dur: 2.5, clear: true },
    { at: "globular clusters", cam: { obj: "Globular Cluster", span: 5.5, glide: true }, hl: [{ obj: "Globular Cluster" }, { obj: "Dwarf Galaxy", delay: 0.5 }, { obj: "Milky Way", label: false, delay: 1 }] },
    { at: "dwarf galaxies", cam: { obj: "Dwarf Galaxy", span: 5.5, glide: true } },
    { at: "dwarf galaxies", photo: "lmc", obj: "Dwarf Galaxy", place: 0.7, dur: 4, kb: [1, 1.25], caption: "Large Magellanic Cloud · a dwarf galaxy · Spitzer" },
    { at: "the less dense it is", cam: { r: 21.8, m: 42.6, span: 5.5, glide: true }, hl: [{ obj: "Globular Cluster", label: false }, { obj: "Dwarf Galaxy", label: false }, { obj: "Milky Way", label: false }] },   // (the nebula, a decade down, is out of this closer frame)
    { at: "empty space between its stars", hl: [{ obj: "Milky Way", label: "~1 atom per cm³" }] },
    { at: "the milky way", cam: { obj: "Milky Way", span: 5.5, glide: true }, hl: [{ obj: "Milky Way" }, { obj: "Andromeda (M31)", delay: 0.6 }] },
    { at: "its sister", photo: "andromeda", obj: "Andromeda (M31)", place: 0.86, dur: 5, kb: [1, 1.3], caption: "Andromeda · Brody Wesner · 2025 · 2.5 million light-years away" },
    { at: "local group", cam: { obj: "Andromeda (M31)", span: 5.5, glide: true }, hl: [{ obj: "Milky Way", label: false }, { obj: "Andromeda (M31)", label: "local group" }] },
    // the Bullet Cluster's real picture stands for the galaxy clusters (the generic one gives way)
    { at: "galaxy clusters are even", cam: { obj: "Bullet Cluster", span: 5.5, glide: true }, hl: [{ obj: "Bullet Cluster", label: "emptier still" }] },
    { at: "galaxy clusters are even", offset: 0.8, photo: "smacs", obj: "Bullet Cluster", place: 0.8, dur: 5, kb: [1, 1.4], caption: "Galaxy cluster SMACS 0723 · Webb · 2022" },
    { at: "empty space between them", hl: [{ obj: "Bullet Cluster", label: "Bullet Cluster" }] },
    { at: "superclusters", cam: { obj: "Laniakea", span: 5.5, glide: true }, hl: [{ obj: "Laniakea", label: "superclusters" }] },
    { at: "laniakea", hl: [{ obj: "Laniakea", label: "Laniakea · 100,000 galaxies" }] },
    { at: "larger actually voids", cam: { obj: "Boötes Void", span: 6, glide: true }, hl: [{ obj: "Laniakea", label: false }, { obj: "Boötes Void", label: "voids" }, { obj: "KBC Void", label: false, delay: 0.4 }] },
    { at: "not completely empty", hl: [{ obj: "Boötes Void", label: "emptier than average" }, { obj: "KBC Void", label: false }] },

    // ── The second edge ──────────────────────────────────────
    { at: "the second edge", cam: { r: 25, m: 51, span: 16 }, dur: 3, clear: true, hl: [SCHW, { ...HUB, label: "edge 2" }] },
    { at: "that's the hubble sphere", cam: { r: 27.4, m: 54.8, span: 8 }, hl: [HUB, { obj: HS, label: "Hubble sphere" }] },
    { at: "speed limit", cam: { r: 24.5, m: 50, span: 16 }, hl: [{ ...HUB, label: "nothing travels faster than light" }] },
    { at: "space itself", hl: [{ ...HUB, label: "but space can outrun light" }] },
    // a picture gaining pixels, on its own and full screen (no chart, no border growing): each
    // pixel becomes four, the new ones fading in between ("raising the resolution", "into four")
    { at: "pixels", hl: [{ pixels: { cell: 16, steps: [2.9, 6.3] } }] },
    { at: "the further away", hl: [HUB, { obj: "Laniakea", label: false }, { arrow: true, from: { obj: "Laniakea" }, to: { obj: HS }, label: "farther, faster" }] },
    { at: "speed of light", cam: { r: 27.4, m: 54.8, span: 8 }, hl: [HUB, { obj: HS, label: "Hubble sphere · 14 billion ly" }] },

    // ── The cosmic event horizon ─────────────────────────────
    { at: "could never reach us", hl: [HUB, { obj: HS, label: "never reaches us?" }] },
    { at: "itself is growing", hl: [HUB, { obj: HS, label: "the sphere grows · its light gets here" }] },
    // close in on the horizon's own dot; the chart's name for the Hubble-sphere dot ("Observable
    // Universe") is hidden here so it isn't read as this one (author, 2026-10-27)
    { at: "second edge a little", cam: { r: 28.12, m: 56.0, span: 1.4 }, dur: 2.4, labels: false,
      hl: [HUB, { obj: HS, label: "Hubble sphere", place: "below" }, { arrow: true, from: { obj: HS }, to: EH, delay: 0.6 }, { mark: [EH.r, EH.m], label: "cosmic event horizon", place: "left", delay: 1.2 }] },
    { at: "true edge", hl: [HUB, { obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: EH, draw: 0.01 }, { mark: [EH.r, EH.m], label: "the edge of our universe", place: "left", instant: true }] },
    { at: "limit of the unknowable", hl: [HUB, { obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: EH, draw: 0.01 }, { mark: [EH.r, EH.m], label: "the unknowable", place: "left", instant: true }] },

    // ── On the black-hole line ───────────────────────────────
    { at: "add up everything", cam: { r: 26.5, m: 54, span: 9 }, labels: true, clear: true, hl: [{ obj: HS, label: "everything inside the Hubble sphere" }] },
    { at: "right on the black hole line", hl: [SCHW, { obj: HS, label: "on the black-hole line" }] },
    { at: "inside a black hole", hl: [SCHW, { obj: HS, label: "a black hole?" }] },
    { at: "kind of horizons", hl: [{ ...SCHW, label: "event horizons" }, { ...HUB, label: false }, { obj: HS, label: false }] },
    // down the black-hole line to M87*, a dive with the EHT photo over its picture (lens);
    // then back up to the Hubble sphere
    { at: "kind of horizons", offset: 0.5, cam: { obj: "M87*", span: 3 }, dur: 2.2,
      hl: [{ ...SCHW, label: "event horizons" }] },
    // the photo already coming in during the dive (dive.photoAt; the author's note on video 4's)
    { at: "kind of horizons", offset: 2.3, photo: "m87", obj: "M87*", dive: { in: 1.6, out: 2, photoAt: 0.4 }, dur: 2.6, fadeIn: 0.9,
      lens: { map: [0.00056505, -0.00003499, -0.550765, -0.453559], r: 0.48, size: [3600, 3600] },
      caption: "M87*'s event horizon · Event Horizon Telescope · 2019" },
    { at: "can never come out", cam: { r: 26.5, m: 54, span: 9 }, hl: [{ ...SCHW, label: "nothing gets out" }, { obj: HS, label: false }] },
    { at: "can ever come in", hl: [SCHW, { obj: HS, label: "nothing gets in" }] },
    { at: "both depend on mass", hl: [SCHW, { ...AVG, label: "both set by mass" }, { obj: HS, label: false }] },
    { at: "how fast the universe expands", hl: [SCHW, { ...AVG, label: "expansion rate ↔ density" }, { obj: HS, label: false }] },
    { at: "definite center", cam: { obj: "Ton 618", span: 8 }, hl: [SCHW, { obj: "Ton 618", label: "a black hole: a lump with a centre" }] },

    // ── Our universe ─────────────────────────────────────────
    { at: "it's our universe", cam: { r: 27.4, m: 54.8, span: 8 }, hl: [HUB, { obj: HS, label: "our universe" }] },
    // a galaxy at the edge of our universe (the Sombrero stands in for any of them), and ours
    { at: "sat in a galaxy", cam: { r: 25, m: 50, span: 12 }, dur: 3, hl: [HUB, { obj: HS, label: false }, { obj: "Sombrero (M104)", label: "a galaxy at the edge" }] },
    { at: "on the other side", hl: [HUB, { obj: HS, label: "everyone has their own" }, { obj: "Sombrero (M104)", label: false }] },
    { at: "our galaxy in one direction", hl: [HUB, { obj: HS, label: false }, { obj: "Sombrero (M104)", label: false }, { obj: "Milky Way", label: "our galaxy" }] },
    { at: "may well be infinite", cam: { r: 27, m: 54, span: 10 }, hl: [HUB, { side: "right", of: "hubble" }, { obj: HS, label: "beyond: probably more of the same" }] },

    // ── The two limits, and the observable universe ──────────
    { at: "those two lines", cam: { r: 26.5, m: 53.5, span: 12 }, dur: 6, drift: 0.02, clear: true, hl: [{ ...SCHW, label: "black-hole line" }, { ...HUB, label: "Hubble line", delay: 0.6 }] },
    { at: "upper limits", hl: [{ line: "triangle" }] },
    // the label sits on the observable universe's own dot, not on the arrow
    { at: "another interesting thing", cam: { r: 28.2, m: 56.4, span: 5 }, clear: true, hl: [{ obj: HS, label: false }] },
    // ── The whole universe on a log scale (author, 2026-10-27) ──
    // from Earth out to the edge of the observable universe in one slow zoom, turning slowly,
    // a few distances named, and what the colours stand for
    { at: "seeing it right now", clear: true, hold: 22, hl: [UNIVERSE_KEY], explorer: { show: true, fade: 1.6, spin: 0.03 } },
    { at: "seeing it right now", offset: 0.4, explorer: { zoom: 0.75, dur: 21 } },
    // the rings and names fainter so the dots show, then gone, the dots brighter (author, 2026-10-27)
    { at: "seeing it right now", offset: 2.5, explorer: { guides: 0.4, dur: 3 } },
    { at: "live forever", offset: -2.5, clear: true, explorer: { guides: 0, exposure: 1.7, dur: 3 } },   // (the colour key goes too)
    { at: "put all of that observable", explorer: { show: false, fade: 1.4 }, cam: { r: 28.2, m: 56.4, span: 5 }, dur: 0.01, clear: true,
      hl: [{ obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: PH, delay: 1.2 }, { ...OU, label: "observable universe · 46 billion ly", delay: 1.6 }] },
    { at: "outside our triangle", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label: "outside the triangle" }] },
    { at: "never been able to reach each other", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label: "where they would be now" }] },
    { at: "history of our own past", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, draw: 0.01 }, { ...OU, label: "a history of our own past" }] },
    // the Deep Field again for the last lines, the galaxies beyond our reach (the author prefers it
    // to the microwave background here, 2026-10-27)
    { at: "history of our own past", offset: 1.2, photo: "xdf", dur: 9, kb: [1, 1.45], caption: "Hubble eXtreme Deep Field · 2012 · galaxies as they were, up to 13 billion years ago" },
  ],
};
