// =============================================================
// Scene: short-06-hubble-sphere — video 6 (rec26, 2026-10-21;
// video/short-06-hubble-sphere/, script in video/plans/06-hubble-sphere.md).
// Bigger means emptier, from nebulae to voids and the average density of the universe;
// the two edges (the Schwarzschild line, the Hubble radius); our own universe; the
// Hubble sphere on the black-hole line, and why; the observable universe outside.
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
  blurb: "Bigger means emptier, the second edge of the triangle, why our universe sits on the black-hole line, and the three horizons.",
  start: FULL,

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md)
  backing: "Fresh Air",

  captionFixes: { hobo: "Hubble" },

  cues: [
    // ── Recap ────────────────────────────────────────────────
    { at: "everything that exists in one chart", cam: FULL, dur: 2, hl: [{ line: "triangle" }] },
    { at: "single diagonal line", cam: { r: 3, m: 12, span: 40 }, hl: [{ line: "water", label: "made of atoms" }] },
    { at: "brown dwarfs", cam: { r: 10, m: 32.5, span: 9 }, hl: [{ obj: "L Brown Dwarf", label: "brown dwarfs" }] },
    { at: "to the left", hl: [{ obj: "White Dwarf", place: "left" }, { obj: "PSR J0030+0451", label: "neutron star", place: "left", delay: 0.4 }, { obj: "Stellar BH", label: "black hole", delay: 0.8 }] },
    { at: "to the right", hl: [{ obj: "Sun" }, { obj: "Red Giant", label: "red giants", delay: 0.4 }] },
    { at: "clouds of gas", cam: { r: 15, m: 34, span: 10 }, hl: [{ obj: "Red Giant", label: false }, { arrow: true, from: { obj: "Red Giant" }, to: { obj: "Nebulae" } }, { obj: "Nebulae", label: "clouds of gas", delay: 0.6 }] },

    // ── Bigger means emptier ─────────────────────────────────
    { at: "bigger than a star", cam: { r: 20, m: 40, span: 24 }, clear: true },
    { at: "thin cloud", hl: [{ obj: "Nebulae", label: "nebula" }] },
    { at: "mostly empty space", cam: { obj: "Milky Way", span: 7 }, hl: [{ obj: "Milky Way", label: "~1 atom per cm³" }] },
    { at: "local group", hl: [{ obj: "Milky Way", label: false }, { obj: "Andromeda (M31)", label: "local group", delay: 0.4 }] },
    { at: "gather in clusters", cam: { r: 24, m: 46.5, span: 10 }, hl: [{ obj: "Galaxy Cluster" }] },
    { at: "space between the galaxies", hl: [{ obj: "Galaxy Cluster", label: "emptier still" }] },
    { at: "superclusters", cam: { r: 26.2, m: 49.5, span: 7 }, hl: [{ obj: "Laniakea", label: "superclusters" }] },
    { at: "laniakea", hl: [{ obj: "Laniakea", label: "Laniakea · 100,000 galaxies" }] },
    { at: "there are voids", hl: [{ obj: "Laniakea", label: false }, { obj: "Boötes Void", label: "voids" }, { obj: "KBC Void", label: false, delay: 0.4 }] },
    { at: "emptier than average", hl: [{ obj: "Boötes Void", label: "emptier than average" }, { obj: "KBC Void", label: false }] },
    { at: "average density of the universe", cam: { r: 26.5, m: 51, span: 14 },
      hl: [{ line: "darkmatter", label: "galaxies" }, { ...AVG, label: "average density of the universe", delay: 0.6 }] },
    { at: "five hydrogen atoms", hl: [{ ...AVG, label: "≈ 5 hydrogen atoms per m³" }, { obj: "KBC Void", label: false }, { obj: "Laniakea", label: false }] },

    // ── The two edges ────────────────────────────────────────
    { at: "edge of the triangle", cam: FULL, dur: 2.5, clear: true, hl: [{ line: "triangle" }] },
    { at: "the schwarzschild line", hl: [{ ...SCHW, label: "edge 1 · black holes" }] },
    { at: "never cross that line", hl: [{ ...SCHW, label: "black holes live on it" }] },
    { at: "up or to the left", hl: [SCHW, { side: "left", of: "schwarzschild", label: "nothing" }] },
    { at: "the other edge", hl: [{ ...HUB, label: "edge 2" }] },
    { at: "space itself can", cam: { r: 22, m: 46, span: 30 }, hl: [{ ...HUB, label: "space can outrun light" }] },
    { at: "the further away", hl: [HUB, { obj: "Laniakea", label: false }, { arrow: true, from: { obj: "Laniakea" }, to: { obj: HS }, label: "farther, faster" }] },
    { at: "14 billion light years", cam: { r: 27.6, m: 55, span: 6 }, hl: [HUB, { obj: HS, label: "Hubble sphere · 14 billion ly" }] },

    // ── Our own universe ─────────────────────────────────────
    { at: "17 billion light years", cam: { r: 28.17, m: 56.05, span: 1.2 }, hl: [HUB, { obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: EH, label: "event horizon · 17 billion ly" }] },
    { at: "never reach us", hl: [HUB, { obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: EH, label: "never reaches us" }] },
    { at: "edge of our own universe", cam: { r: 27.6, m: 55, span: 6 }, hl: [HUB, { obj: HS, label: "our universe" }] },
    { at: "may well be infinite", cam: { r: 27, m: 54, span: 10 }, hl: [HUB, { side: "right", of: "hubble" }, { obj: HS, label: "beyond: probably more of the same" }] },
    { at: "centered on us", hl: [{ obj: HS, label: "centred on us" }] },
    { at: "their own universe", hl: [{ obj: HS, label: "everyone has their own" }] },

    // ── The twist ────────────────────────────────────────────
    { at: "strange part", cam: { r: 26.5, m: 54, span: 9 }, clear: true },
    { at: "count everything inside", hl: [{ obj: HS, label: "everything inside, even dark energy" }] },
    { at: "right on the black hole line", hl: [SCHW, { obj: HS, label: "on the black-hole line" }] },
    { at: "is our universe a black hole", hl: [SCHW, { obj: HS, label: "a black hole?" }] },
    { at: "lump of mass", cam: { obj: "Ton 618", span: 8 }, hl: [SCHW, { obj: "Ton 618", label: "a black hole: a lump with a centre" }] },
    { at: "no center and no outside", cam: { r: 27, m: 54.5, span: 8 }, hl: [SCHW, { obj: HS, label: "no centre, no outside" }] },
    { at: "not a coincidence", hl: [SCHW, AVG, { obj: HS, label: false }] },
    { at: "rate of expansion", hl: [SCHW, { ...AVG, label: "expansion rate ↔ density" }, { obj: HS, label: false }] },
    { at: "sliding up this line", cam: FULL, dur: 3,
      hl: [SCHW, { arrow: true, from: { obj: "Singularity" }, to: { obj: HS }, label: "our horizon since the Big Bang" }] },

    // ── One more horizon ─────────────────────────────────────
    { at: "one more horizon", cam: { r: 28.4, m: 56.75, span: 2.4 }, clear: true,
      hl: [{ obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: PH, label: "observable universe · 46 billion ly" }] },
    { at: "on the same line", hl: [{ ...AVG, label: "average density" }, { obj: HS, label: false }, { arrow: true, from: { obj: HS }, to: PH, label: false }] },
    { at: "outside the triangle", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, label: "outside the triangle" }] },
    { at: "sort of an illusion", hl: [SCHW, HUB, { arrow: true, from: { obj: HS }, to: PH, label: "light from when it was closer" }] },
    { at: "those two lines", cam: FULL, dur: 3, hl: [{ ...SCHW, label: "black-hole line" }, { ...HUB, label: "Hubble line", delay: 0.6 }] },
    { at: "can exist right now", hl: [{ line: "triangle" }] },
  ],
};
