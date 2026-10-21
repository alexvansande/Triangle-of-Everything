// =============================================================
// Scene: short-05-hubble-sphere — video 5 (video 6 until 2026-10-21), re-recorded in the
// author's own words (rec29–31, 2026-10-21; video/short-05-hubble-sphere/). One density
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

export default {
  title: "The Hubble sphere",
  blurb: "Bigger means emptier, the second edge of the triangle, the edge of our own universe, why it sits on the black-hole line, and the observable universe.",
  start: FULL,

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md)
  backing: "Fresh Air",

  captionFixes: { hobo: "Hubble", mouth: "mouse", subtor: "super", chaos: "scale", finely: "finally",
    math: "mass", shard: "chart", radio: "radius", plop: "pop" },

  cues: [
    // ── One line, and the split ──────────────────────────────
    { at: "log chart of mass and size", cam: FULL, dur: 2, hl: [{ line: "triangle" }] },
    { at: "diagonal density line", cam: { r: 3, m: 12, span: 40 }, hl: [{ line: "water", label: "made of atoms" }] },
    { at: "smallest", cam: { r: 3.2, m: 11, span: 14 },
      hl: [{ line: "water" }, { obj: "Mouse" }, { obj: "Blue Whale", delay: 0.6 }] },
    { at: "mount everest", cam: { r: 6.5, m: 21, span: 16 }, hl: [{ line: "water" }, { obj: "Mt. Everest" }, { obj: "Moon", delay: 0.5 }] },
    { at: ["to a jupiter", "jupiter-sized planet"], cam: { r: 9.4, m: 29, span: 5 }, hl: [{ obj: "Jupiter" }] },
    { at: "trend changes", cam: { r: 9.88, m: 30.7, span: 2.6 }, hl: [{ obj: "Jupiter", label: "Jupiter size" }] },
    { at: "ten times the mass", hl: [{ obj: "Jupiter", label: false, place: "left" }, { obj: "Beta Pictoris b", label: "super-Jupiter · same size" }] },
    { at: "after brown dwarfs", cam: { r: 10, m: 32.5, span: 9 }, hl: [{ obj: "L Brown Dwarf", label: "brown dwarfs" }] },
    { at: "to the left", cam: { r: 7, m: 33.5, span: 16 }, hl: [{ obj: "L Brown Dwarf", label: false }, { obj: "White Dwarf", label: "no normal matter", place: "below" }] },
    { at: "dead stars",
      hl: [{ obj: "White Dwarf", place: "left" }, { obj: "PSR J0030+0451", label: "neutron star", place: "left", delay: 0.8 }, { obj: "Stellar BH", label: "black hole", delay: 1.6 }] },
    { at: "first limit", cam: FULL, dur: 2.5, hl: [{ ...SCHW, label: "edge 1" }] },
    { at: "called the schwarzschild", hl: [{ ...SCHW, label: "Schwarzschild radius · black holes live on it" }] },
    { at: "can be above that", hl: [SCHW, { side: "left", of: "schwarzschild", label: "nothing" }] },
    { at: "to the right we have stars", cam: { r: 12, m: 34, span: 12 }, clear: true, hl: [{ obj: "Sun" }, { obj: "Red Giant", label: "red giants", delay: 0.4 }] },
    { at: "supernovas", hl: [{ obj: "Red Giant", label: false }, { obj: "Supernova Remnant", label: "supernovae" }] },
    { at: "expand out into space", cam: { r: 17, m: 35, span: 12 },
      hl: [{ obj: "Supernova Remnant", label: false }, { arrow: true, from: { obj: "Supernova Remnant" }, to: { obj: "Stellar Nursery" } }, { obj: "Stellar Nursery", label: "new stars", delay: 0.6 }] },

    // ── Bigger means emptier ─────────────────────────────────
    { at: "mostly made of empty space", cam: { r: 20, m: 40, span: 24 }, clear: true },
    { at: "globular clusters", hl: [{ obj: "Globular Cluster" }, { obj: "Dwarf Galaxy", delay: 0.5 }, { obj: "Milky Way", label: false, delay: 1 }] },
    { at: "the less dense it is", hl: [{ obj: "Nebulae", label: "nebula" }, { obj: "Globular Cluster", label: false }, { obj: "Milky Way", label: false }] },
    { at: "empty space between the stars", cam: { obj: "Milky Way", span: 7 }, hl: [{ obj: "Milky Way", label: "~1 atom per cm³" }] },
    { at: "the milky way", hl: [{ obj: "Milky Way" }, { obj: "Andromeda (M31)", delay: 0.6 }] },
    { at: "local group", hl: [{ obj: "Milky Way", label: false }, { obj: "Andromeda (M31)", label: "local group" }] },
    { at: "galaxy clusters are even", cam: { r: 24, m: 46.5, span: 10 }, hl: [{ obj: "Galaxy Cluster", label: "emptier still" }] },
    { at: "superclusters", cam: { r: 26.2, m: 49.5, span: 7 }, hl: [{ obj: "Laniakea", label: "superclusters" }] },
    { at: "laniakea", hl: [{ obj: "Laniakea", label: "Laniakea · 100,000 galaxies" }] },
    { at: "those are the voids", hl: [{ obj: "Laniakea", label: false }, { obj: "Boötes Void", label: "voids" }, { obj: "KBC Void", label: false, delay: 0.4 }] },
    { at: "not completely empty", hl: [{ obj: "Boötes Void", label: "emptier than average" }, { obj: "KBC Void", label: false }] },

    // ── The second edge ──────────────────────────────────────
    { at: "the second edge", cam: FULL, dur: 2.5, clear: true, hl: [SCHW, { ...HUB, label: "edge 2" }] },
    { at: "will be the hubble sphere", cam: { r: 27.6, m: 55, span: 6 }, hl: [HUB, { obj: HS, label: "Hubble sphere" }] },
    { at: "speed limit", cam: { r: 22, m: 46, span: 30 }, hl: [{ ...HUB, label: "nothing travels faster than light" }] },
    { at: "space itself", hl: [{ ...HUB, label: "but space can outrun light" }] },
    { at: "pixels", hl: [HUB, { obj: "Laniakea", label: "more space between, not motion" }] },
    { at: "the further away", hl: [HUB, { obj: "Laniakea", label: false }, { arrow: true, from: { obj: "Laniakea" }, to: { obj: HS }, label: "farther, faster" }] },
    { at: "speed of light", cam: { r: 27.6, m: 55, span: 6 }, hl: [HUB, { obj: HS, label: "Hubble sphere · 14 billion ly" }] },

    // ── The cosmic event horizon ─────────────────────────────
    { at: "would never reach us", hl: [HUB, { obj: HS, label: "never reaches us?" }] },
    { at: "also growing", hl: [HUB, { obj: HS, label: "the sphere grows · its light gets here" }] },
    { at: "second point", cam: { r: 28.17, m: 56.05, span: 1.2 }, hl: [HUB, { obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: EH, label: "cosmic event horizon · 16 billion ly" }] },
    { at: "truly the edge", hl: [HUB, { obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: EH, label: "the edge of our universe" }] },
    { at: "limit of the unknowable", hl: [HUB, { obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: EH, label: "the unknowable" }] },

    // ── On the black-hole line ───────────────────────────────
    { at: "add up everything", cam: { r: 26.5, m: 54, span: 9 }, clear: true, hl: [{ obj: HS, label: "everything inside the Hubble sphere" }] },
    { at: "exactly on the black hole line", hl: [SCHW, { obj: HS, label: "on the black-hole line" }] },
    { at: "inside a black hole", hl: [SCHW, { obj: HS, label: "a black hole?" }] },
    { at: "an event horizon in some way", hl: [{ ...SCHW, label: "event horizons" }, { ...HUB, label: false }, { obj: HS, label: false }] },
    { at: "can never come out", hl: [{ ...SCHW, label: "nothing gets out" }, { obj: HS, label: false }] },
    { at: "can never come in", hl: [SCHW, { obj: HS, label: "nothing gets in" }] },
    { at: "both are dependent", hl: [SCHW, { ...AVG, label: "both set by mass" }, { obj: HS, label: false }] },
    { at: "rate of expansion", hl: [SCHW, { ...AVG, label: "expansion rate ↔ density" }, { obj: HS, label: false }] },
    { at: "definitive center", cam: { obj: "Ton 618", span: 8 }, hl: [SCHW, { obj: "Ton 618", label: "a black hole: a lump with a centre" }] },

    // ── Our universe ─────────────────────────────────────────
    { at: "it's our universe", cam: { r: 27.6, m: 55, span: 6 }, hl: [HUB, { obj: HS, label: "our universe" }] },
    { at: "on the other side", hl: [HUB, { obj: HS, label: "everyone has their own" }] },
    { at: "may well be infinite", cam: { r: 27, m: 54, span: 10 }, hl: [HUB, { side: "right", of: "hubble" }, { obj: HS, label: "beyond: probably more of the same" }] },

    // ── The two limits, and the observable universe ──────────
    { at: "those two lines", cam: FULL, dur: 3, clear: true, hl: [{ ...SCHW, label: "black-hole line" }, { ...HUB, label: "Hubble line", delay: 0.6 }] },
    { at: "upper limits", hl: [{ line: "triangle" }] },
    { at: "one more thing", cam: { r: 28.4, m: 56.75, span: 2.4 }, clear: true, hl: [{ obj: HS, label: false }] },
    { at: "46 billion", hl: [{ obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: PH, label: "observable universe · 46 billion ly" }] },
    { at: "unreachable", hl: [{ obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: EH, label: "beyond reach" }, { arrow: true, from: { obj: HS }, to: PH, label: false }] },
    { at: "outside our triangle", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, label: "outside the triangle" }] },
    { at: "an illusion", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, label: "where they would be now" }] },
    { at: "history of our own past", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, label: "a history of our own past" }] },
  ],
};
