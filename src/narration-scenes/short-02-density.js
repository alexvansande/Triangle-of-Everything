// =============================================================
// Scene: short-02-density — why everything sits on the diagonal: humans,
// a liter and a tonne of water, the cube law, the water line, float or sink,
// the hippo. On the map from the start. Recorded 2026-10-07 (video/short-02-density/).
// =============================================================
// Field reference: see the top of ./tour.js.

const FULL = { r: -2.2, m: -4.8, span: 74 };   // the whole triangle, portrait

export default {
  title: "Why the diagonal?",
  blurb: "Humans, a liter of water, the cube law, and what floats or sinks.",
  start: FULL,
  captionFixes: { short: "chart", recipient: "container" },

  cues: [
    { at: "why is everything", cam: { r: 2, m: 6, span: 44 }, dur: 3,
      hl: [{ line: "water", label: "the diagonal", delay: 0.8 }] },
    { at: "let's zoom in", cam: { obj: "Human", span: 6 }, clear: true },
    { at: "here we are humans", hl: [{ obj: "Human", label: "you are here" }] },
    { at: "100 kilograms", hl: [{ obj: "Human", label: "1–2 m · ~100 kg" }] },
    { at: "order of magnitude", cam: { r: 1.9, m: 4.9, span: 10 }, units: true, unitsFor: 8, hl: [{ obj: "Human" }] },

    { at: "one liter of water", cam: { obj: "1 Liter of Water", span: 4.5 },
      hl: [{ obj: "1 Liter of Water", label: "1 liter · 1 kg · 10 cm" }] },
    { at: "multiply your size", cam: { r: 1.35, m: 4.6, span: 4.5 },
      hl: [{ obj: "1 Liter of Water", label: "10 cm" }] },
    { at: "one ton of water",
      hl: [{ obj: "1 Liter of Water", label: "1 kg" }, { obj: "1 Tonne of Water", label: "1 tonne · 1 m" }] },
    { at: ["times more mass"],
      hl: [{ obj: "1 Liter of Water", label: "1 kg" }, { obj: "1 Tonne of Water", label: "1 tonne · 1 m" },
           { arrow: true, from: { obj: "1 Liter of Water" }, to: { obj: "1 Tonne of Water" }, label: "×10 size · ×1000 mass" }] },
    { at: "cube law",
      hl: [{ arrow: true, from: { obj: "1 Liter of Water" }, to: { obj: "1 Tonne of Water" }, label: "mass ∝ size³", draw: 0.01 }] },

    { at: "this blue line", cam: { r: 2, m: 6.5, span: 16 }, hl: [{ line: "water", label: "density of water" }] },
    { at: "will float", offset: -1.2, hl: [{ line: "water" }, { side: "right", label: "floats" }] },
    { at: "will sink", hl: [{ line: "water" }, { side: "right", label: "floats" }, { side: "left", label: "sinks" }] },
    { at: "meteorites and small rocks", cam: { r: 3.5, m: 11, span: 16 },
      hl: [{ line: "water" }, { side: "left", label: "rocks · denser than water" }] },
    { at: "are animals", cam: { r: 1, m: 3.5, span: 9 },
      hl: [{ line: "water" }, { side: "right", label: "animals" }] },
    { at: "the hippo sits", cam: { obj: "Hippopotamus", span: 3.5 },
      hl: [{ obj: "Hippopotamus" }, { line: "water" }] },
    { at: "small interesting story", cam: { r: 2, m: 6, span: 30 }, drift: 0.03,
      hl: [{ line: "water", label: "density of water" }] },
  ],
};
