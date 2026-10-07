// =============================================================
// Scene: the opening hook (take 2) — all on the classic figure, then the
// cross-fade into the map on "…the triangle of everything".
// =============================================================
// Field reference: see the top of ./tour.js. Axis bands: { axis: side }.
// The classic figure has its axes swapped from the paper to match the map:
// the left axis is energy (mass in GeV), the right ones mass (g, M☉), the
// top one radius in Mpc (time lives on the diagonals).

const FIG = { r: 7.5, m: 9, span: 106 };      // the whole classic figure
const MAP = { r: -2.2, m: -4.8, span: 74 };   // the whole triangle, portrait

export default {
  start: FIG,

  captionFixes: {
    short: "chart", shard: "chart", shards: "charts", put: "but", math: "mass",
  },

  cues: [
    { at: "most interesting charts", cam: { r: 6, m: 8, span: 96 }, dur: 5, drift: 0.03 },
    { at: "big huge diagonal", cam: { r: 3, m: 4, span: 60 },
      hl: [{ line: "water", label: "the diagonal" }] },
    { at: "whales and humans", cam: { r: 1, m: 2, span: 34 }, hl: [{ line: "water" }] },
    { at: "microbes and viruses", cam: { r: -3.5, m: -9, span: 34 }, hl: [{ line: "water" }] },
    { at: "planets and stars", cam: { r: 8.5, m: 27, span: 36 }, clear: true },
    { at: "if you zoom in", cam: { r: 11, m: 33, span: 13 } },
    { at: "life cycle of stars", cam: { r: 11.5, m: 33.3, span: 11 }, drift: 0.08 },

    // the axes: back out to the whole figure, light up the side named
    { at: "on the right axis", cam: FIG, dur: 2, hl: [{ axis: "right", label: "mass" }] },
    { at: "on the bottom", hl: [{ axis: "right", label: "mass" }, { axis: "bottom", label: "size" }] },
    { at: "size versus a mass chart", hl: [{ axis: "right", label: "mass" }, { axis: "bottom", label: "size" }] },
    { at: "so much more than that", clear: true },
    { at: "on the other side", hl: [{ axis: "left" }] },
    { at: "also have particles", cam: { r: -11, m: -25, span: 30 }, clear: true },
    { at: "don't even have mass", cam: { r: -9, m: -27, span: 22 } },

    // time
    { at: "time on the top axis", cam: FIG, dur: 1.8, hl: [{ axis: "top" }] },
    { at: "numbers on the diagonals", cam: { r: 22, m: 50, span: 44 }, clear: true },
    { at: "seconds since the big bang", cam: { r: 30, m: 63, span: 24 } },
    { at: "you have quantum", cam: { r: -18, m: -42, span: 40 } },
    { at: "black holes", cam: { r: -14, m: 28, span: 44 } },

    { at: "so what is this thing", cam: FIG, dur: 2.4, drift: 0.04 },
    { at: "from the big bang", cam: { r: -26, m: -3, span: 34 } },
    { at: "quantum mechanics", cam: { r: -11, m: -25, span: 34 } },
    { at: "what is fire", cam: { r: 2, m: 3, span: 50 } },
    { at: "different view", cam: FIG, dur: 1.8, drift: 0.03 },

    // into the map
    { at: "the triangle of everything", offset: -0.6, classic: "out", fade: 3, cam: MAP, dur: 3.4, drift: 0.04,
      hl: [{ line: "triangle", delay: 1.4 }] },
  ],
};
