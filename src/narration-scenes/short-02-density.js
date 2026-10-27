// =============================================================
// Scene: short-02-density — why everything sits on the diagonal: humans,
// a liter and a tonne of water, the cube law, the water line, float or sink,
// the hippo. On the map from the start. Recorded 2026-10-07 (video/short-02-density/).
// =============================================================
// Field reference: docs/narration.md, "Scene fields".

const FULL = { r: -2.2, m: -4.8, span: 74 };   // the whole triangle, portrait

export default {
  title: "Why the diagonal?",
  blurb: "Humans, a liter of water, the cube law, and what floats or sinks.",
  start: FULL,
  captionFixes: { short: "chart", recipient: "container" },

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md)
  backing: "Dreamer",
  sound: [
    { at: "will float in water", fx: "bubble", offset: 0.3 },
    { at: "will sink", fx: "glug", offset: 0.15 },
    { at: "it just sinks", fx: "glug", offset: 0.2, gain: 2 },
  ],

  cues: [
    { at: "this diagonal line", cam: { r: 2, m: 6, span: 44 }, dur: 3,
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
    // Bulk density (src/bulk-density.js): animals sit ON the line, within about
    // ±0.01 decades of it, so these zoom in far enough to see which side.
    { at: "most animals float", cam: { obj: "Human", span: 0.12 }, dur: 1.2,
      hl: [{ line: "water" }, { obj: "Human", label: "human · 0.985 g/cm³" }, { side: "right", label: "floats" }] },
    { at: "except the hippo", cam: { obj: "Hippopotamus", span: 3.5 }, dur: 1.5,
      hl: [{ obj: "Hippopotamus" }, { line: "water" }] },
    { at: "the hippo sits", cam: { obj: "Hippopotamus", span: 0.1 }, dur: 2.5,
      hl: [{ obj: "Hippopotamus" }, { line: "water" }] },
    { at: "a little bit to the left",
      hl: [{ obj: "Hippopotamus", label: "hippo · 1.05 g/cm³" }, { line: "water" }, { side: "left", label: "sinks" }] },
    { at: "small interesting story", cam: { r: 2, m: 6, span: 30 }, drift: 0.03,
      hl: [{ line: "water", label: "density of water" }] },
  ],
};
