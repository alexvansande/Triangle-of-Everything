// =============================================================
// Scene: short-01-hook — the opening hook as a vertical short, all on the
// classic figure, then the cross-fade into the map on "…the triangle of
// everything". Recorded 2026-10-07 (video/short-01-hook/).
// =============================================================
// Field reference: see the top of ./tour.js. Axis highlights: { axis: side }.
// The classic figure here has energy (GeV) on the left, mass (g) on the
// right, size (cm) on the bottom; time is written on the diagonals.

const FIG = { r: 7.5, m: 9, span: 106 };      // the whole classic figure
const MAP = { r: -2.2, m: -4.8, span: 74 };   // the whole triangle, portrait

export default {
  title: "The hook",
  blurb: "The classic chart, and why it's much more than mass versus size.",
  start: FIG,

  captionFixes: { short: "chart", shard: "chart", lights: "light" },

  sound: [
    { at: "and then you realize", music: "pulse" },
  ],

  cues: [
    { at: "most interesting chart", cam: { r: 6, m: 8, span: 96 }, dur: 5, drift: 0.03 },

    // the diagonal, bottom to top
    { at: "this diagonal line", cam: { r: 3, m: 4, span: 60 }, hl: [{ line: "water", label: "the diagonal" }] },
    { at: "from bacteria", cam: { r: -3.5, m: -9, span: 30 }, hl: [{ line: "water" }] },
    { at: "to humans", cam: { r: 1, m: 2, span: 30 }, hl: [{ line: "water" }] },
    { at: "stars and planets", cam: { r: 9, m: 28, span: 34 }, clear: true },
    { at: "and galaxies", cam: { r: 21, m: 43, span: 34 } },

    // mass and size
    { at: "vertical axis is mass", cam: FIG, dur: 2, hl: [{ axis: "right", label: "mass" }] },
    { at: "horizontal axis", hl: [{ axis: "right", label: "mass" }, { axis: "bottom", label: "size" }] },
    { at: "so much more than that", clear: true },
    { at: "some things that don't have mass", cam: { r: -11, m: -25, span: 30 } },
    { at: "like photons", cam: { r: -9, m: -27, span: 22 } },

    // energy and wavelength
    { at: "this is because", cam: FIG, dur: 2 },
    { at: "of energy", hl: [{ axis: "left", label: "energy" }] },
    { at: "bottom axis", hl: [{ axis: "bottom", label: "size" }] },
    { at: "as a wavelength", hl: [{ axis: "bottom", label: "wavelength" }] },

    // quantum meets relativity at the Planck point; time on the diagonals
    { at: "even crazier", cam: FIG, dur: 2, clear: true },
    { at: "quantum mechanics", cam: { r: -16, m: -10, span: 64 },
      hl: [{ line: "compton", label: "quantum" }] },
    { at: "we have relativity", hl: [{ line: "compton", label: "quantum" }, { line: "schwarzschild", label: "relativity" }] },
    { at: "this one point", cam: { r: -30, m: -3, span: 30 },
      hl: [{ line: "compton" }, { line: "schwarzschild" }] },
    { at: "diagonal lines", cam: { r: 22, m: 50, span: 44 }, clear: true },
    { at: "get to now", cam: { r: 27, m: 60, span: 22 } },
    { at: "since the big bang", cam: { r: 22, m: 52, span: 40 } },
    { at: "joining at the big bang", cam: { r: -18, m: 12, span: 70 }, dur: 2.4,
      hl: [{ line: "compton" }, { line: "schwarzschild" }] },

    // into the map
    { at: "the triangle of everything", offset: -0.6, classic: "out", fade: 3, cam: MAP, dur: 3.4, drift: 0.04,
      hl: [{ line: "triangle", delay: 1.4 }] },
  ],
};
