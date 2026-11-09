// =============================================================
// Scene: short-l2-dance-of-the-forces — the forces Short as a take of its own (rec58, 2026-11-08; video/short-l2-dance-of-
// the-forces/): everything is a dance between four forces; the diagonal as the tug of war between gravity and
// electromagnetism, panned up from the microbes; the giant planets' column and degenerate matter (the atoms crushed,
// animated); the strong force and fusion (animated); the main sequence; the fuel running out; the weak force at the
// collapse (animated), to the neutron star held by gravity (cut to 2:48 with the credits on 2026-11-09). The shots are the opening's
// (long-02-intro.js), keyed to this take's words; the three animations are the Squeeze Lab's simulations (src/squeeze-sim.js). Until this take the Short was carved from the opening.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

const WATER = { line: "water" };
const ON_LINE = (m) => (m - 0.62) / 3;
// The frame (span 4.6, 9:16) shows 2.3 decades of size either side of its centre and 4.1 of mass above and
// below it, and the camera up the diagonal is one glide that never holds (1.3 to 2 decades of mass a second), so
// a mark placed where the camera is when its cue starts has left the frame a few seconds later (the author,
// 2026-11-09: the labels were outside the frame, or in it only for a moment). Each mark goes a little ahead of
// the camera instead, at the mass the camera passes a third of the way through its cue, and close to the line
// (the texts beside their arrows, the arrows' tails at 1.5): a mark on the right stays in frame while the
// camera's mass is within 2.3 below it and 3.7 above, one on the left within 3.7 below and 1.6 above;
// the texts clear of the line by their half-width.
const force = (m, dir, color) => ({ arrow: true, solid: true, width: 4, color, from: { r: ON_LINE(m) + dir * 1.5, m }, to: { r: ON_LINE(m) + dir * 0.2, m } });
const GRAV_AT = (m) => [force(m + 0.9, 1, "#ffab40"), force(m - 0.9, 1, "#ffab40"), { text: "gravity\npushes in", at: [ON_LINE(m) + 0.85, m], size: 22, color: "#ffab40" }];
const EM_AT = (m) => [force(m + 0.9, -1, "#4fc3f7"), force(m - 0.9, -1, "#4fc3f7"), { text: "electro-\nmagnetism\npushes out", at: [ON_LINE(m) - 1.05, m], size: 22, color: "#4fc3f7" }];
const UP = (m, span = 4.6) => ({ r: ON_LINE(m), m, span, glide: true });
const still = (h) => ({ ...h, instant: true, draw: 0.01, delay: 0 });
const COLUMN = { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f" };
const G = (r, m, span = 1.7) => ({ r, m, span });
const BD = [{ obj: "Y Brown Dwarf", label: false }, { obj: "T Brown Dwarf", label: false }];
const MS = { line: "mainsequence", label: "main sequence" };

export default {
  title: "The dance of the forces",
  blurb: "Gravity wins over the electric push, then the strong force joins in, then the weak force: the tug of war that shapes everything from a bacterium to a neutron star, in one story.",
  start: { r: -4.22, m: -12, span: 7 },   // the bacterium (a start takes r and m, not an object: with obj the view had no position and every frame threw)
  iconBoost: { from: 21.2, k: 0.6, slugs: { "laniakea-galaxy-supercluster": 0.55 } },
  icons: "all",
  forceIcons: ["Sun", "L Brown Dwarf", "T Brown Dwarf", "Y Brown Dwarf"],
  captionFixes: { short: "chart", nuclei: "nuclei", prevents: "prevent" },
  credits: 3,

  backing: "Immersed",
  sound: [
    { at: "something magical happens", fx: "ignite", offset: 0.3 },
    { at: "goes haywire", fx: "boom", offset: 0.2 },
  ],

  cues: [
    // the opener: the axes named on the bacterium, then the push in (the author, 2026-11-05: the Shorts open on the axes)
    { t: 0, cam: { obj: "Bacterium", span: 7 }, dur: 0.05, drift: 0, units: true,
      hl: [{ axis: "right", label: "mass · ×10 a step" }, { axis: "bottom", label: "size · ×10 a step", delay: 0.3 }] },
    { at: "delicate dance", cam: { obj: "Bacterium", span: 4.6 }, dur: 2.4, ease: "gentle", clear: true, hl: [WATER, { obj: "Bacterium", label: "a bacterium" }] },
    { at: "tug of war", hl: [WATER, ...GRAV_AT(-13), ...EM_AT(-10.5)] },   // the camera holds on the bacterium (m −12)
    // the diagonal, panned up in one move
    { at: "plot everything", cam: UP(-6), hl: [WATER] },
    { at: "diagonal line", cam: UP(-2), hl: [{ line: "water", label: "the diagonal" }] },
    { at: "electromagnetism and gravity", cam: UP(2), hl: [WATER, ...GRAV_AT(3.3), ...EM_AT(5)] },   // the camera passes m 2 to 6
        // the camera passes m 6 to 10 in two seconds: the ring ahead at 7.5, its text above it
    { at: "under its own weight", cam: UP(6), clear: true, hl: [WATER, { ellipse: [ON_LINE(7.5) + 1.2, 7.5, 0.6, 0.6], rot: 0, label: false, color: "#ffab40" },
      { arrow: true, solid: true, width: 4, color: "#ffab40", from: { r: ON_LINE(7.5) + 1.2, m: 7.5 }, to: { r: ON_LINE(7.5) + 0.1, m: 7.5 }, delay: 0.4 },
      { text: "crushes under\nits own weight", at: [ON_LINE(7.5) + 1.25, 8.6], size: 22, color: "#ffab40", delay: 0.5 }] },
        // the camera passes m 10 to 16 in seven seconds: the ring ahead at 12.5 (in frame for the first five), its text below it
    { at: "squeeze it too hard", cam: UP(10), clear: true, hl: [WATER, { ellipse: [ON_LINE(12.5) - 1.2, 12.5, 0.6, 0.6], rot: 0, label: false, color: "#4fc3f7" },
      { arrow: true, solid: true, width: 4, color: "#4fc3f7", from: { r: ON_LINE(12.5) - 1.2, m: 12.5 }, to: { r: ON_LINE(12.5) - 0.1, m: 12.5 }, delay: 0.4 },
      { text: "its atoms\npush back", at: [ON_LINE(12.5) - 1.2, 11.4], size: 22, color: "#4fc3f7", delay: 0.5 }] },
    { at: "density of atoms", cam: UP(16), clear: true, hl: [{ line: "water", label: "the density of atoms" }] },
    { at: "somewhere along here", cam: UP(23), hl: [{ line: "water", label: "the density of atoms" }] },
    // the giant planets' column
    { at: "giant planets", cam: G(9.85, 30.9, 2.4), dur: 2.5, hl: [{ obj: "Jupiter", label: "Jupiter", place: "left" }, ...BD] },
    { at: "up a column", hl: [{ obj: "Jupiter", label: false, place: "left" }, ...BD, COLUMN] },
    { at: "degenerate matter", hl: [{ obj: "Jupiter", label: "degenerate matter inside", place: "left" }, ...BD, { ...COLUMN, draw: 0.01 }] },
    // the atoms crushed: the Squeeze Lab's mode 1 (src/squeeze-sim.js, the author's settings in tools/squeeze-lab.html),
    // 11.7 s into its run, so its first shell pops on "win over" (18.38 s of the run; the rest by 22 s)
    { at: "this happens", hold: 12, hl: [{ squeeze: { mode: 1, from: 11.7 } }] },
    // the strong force: back to the chart for a beat, then the fusion diagram (drawFuse)
    { at: "even more mass", cam: { r: 9.85, m: 32.6, span: 3 }, hl: [{ obj: "L Brown Dwarf", label: false }, { obj: "Proxima Cen", label: "fusion starts", delay: 0.6 }] },
    // the fusion, the lab's mode 2 with the box a little roomier at the start (2.6× the screen, the lab's 2.2): packed as
    // tight as in the lab the crowd fused in its first moments, before the words get there (the author, 2026-11-09: the
    // first fusion in sync with the text). Then nothing fuses until 18.83 s of the run and seven go within half a
    // second: 1.8 s in, they fall on "capture them"
    { at: "the strong force", hold: 25, hl: [{ squeeze: { mode: 2, from: 1.8, P: { startBox: 2.6 } } }] },
    { at: "that delicate dance", cam: { r: 10.9, m: 33.1, span: 3.6 }, clear: true, hl: [] },
    // the main sequence
    { at: "called the main sequence", hl: [{ obj: "Sun" }, MS, { obj: "Sirius A", delay: 0.4 }] },
    { at: "most of their lives", hl: [MS, { obj: "Sun", label: "billions of years" }, { obj: "Sirius A", delay: 0.3 }, { obj: "Vega", delay: 0.6 }] },
    { at: "once that runs out", hl: [{ line: "mainsequence" }, { obj: "Sun", label: "out of hydrogen" }] },
    { at: "goes haywire", cam: { r: 11.85, m: 33.4, span: 3.6 }, hl: [{ swing: [{ obj: "Sun" }, { obj: "Red Giant" }], period: 1.2, core: true }, { obj: "Red Giant", label: "the fire goes out", delay: 1 }] },
    // the weak force, the lab's mode 3: 7.2 s into its run, so its first ring clenches on "squeezed" (19.86 s of the
    // run) and the cascade (to 22 s) runs through "a mass of neutrons"; the grey discs pack from there
    { at: "catastrophic core collapse", cam: { r: 8.0, m: 33.5, span: 7 }, dur: 2, hold: 45, hl: [{ squeeze: { mode: 3, from: 7.2 } }] },
  ],
};
