// =============================================================
// Scene: short-l2-dance-of-the-forces — the forces Short as a take of its own (rec58, 2026-11-08; video/short-l2-dance-of-
// the-forces/): everything is a dance between four forces; the diagonal as the tug of war between gravity and
// electromagnetism, panned up from the microbes; the giant planets' column and degenerate matter (the atoms crushed,
// animated); the strong force and fusion (animated); the main sequence; the fuel running out; the weak force at the
// collapse (animated), to the neutron star held by gravity. The shots and the three diagrams are the opening's
// (long-02-intro.js), keyed to this take's words. Until this take the Short was carved from the opening.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

const WATER = { line: "water" };
const ON_LINE = (m) => (m - 0.62) / 3;
const force = (m, dir, color) => ({ arrow: true, solid: true, width: 4, color, from: { r: ON_LINE(m) + dir * 2.0, m }, to: { r: ON_LINE(m) + dir * 0.2, m } });
const GRAV_AT = (m) => [force(m + 0.9, 1, "#ffab40"), force(m - 0.9, 1, "#ffab40"), { text: "gravity\npushes in", at: [ON_LINE(m) + 1.5, m + 1.4], size: 26, color: "#ffab40" }];
const EM_AT = (m) => [force(m + 0.9, -1, "#4fc3f7"), force(m - 0.9, -1, "#4fc3f7"), { text: "electromagnetism\npushes out", at: [ON_LINE(m) - 1.1, m + 3.6], size: 24, color: "#4fc3f7" }];
const UP = (m, span = 4.6) => ({ r: ON_LINE(m), m, span, glide: true });
const still = (h) => ({ ...h, instant: true, draw: 0.01, delay: 0 });
const COLUMN = { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f" };
const G = (r, m, span = 1.7) => ({ r, m, span });
const BD = [{ obj: "Y Brown Dwarf", label: false }, { obj: "T Brown Dwarf", label: false }];
const MS = { line: "mainsequence", label: "main sequence" };

export default {
  title: "The dance of the forces",
  blurb: "Gravity wins over the electric push, then the strong force joins in, then the weak force: the tug of war that shapes everything from a bacterium to a neutron star, in one story.",
  start: { obj: "Bacterium", span: 7 },
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
    { at: "tug of war", hl: [WATER, ...GRAV_AT(-12.5), ...EM_AT(-9.5)] },
    // the diagonal, panned up in one move
    { at: "plot everything", cam: UP(-6), hl: [WATER] },
    { at: "diagonal line", cam: UP(-2), hl: [{ line: "water", label: "the diagonal" }] },
    { at: "electromagnetism and gravity", cam: UP(2), hl: [WATER, ...GRAV_AT(1.5), ...EM_AT(4.5)] },
    { at: "under its own weight", cam: UP(6), clear: true, hl: [WATER, { ellipse: [ON_LINE(6) + 1.7, 6, 0.8, 0.8], rot: 0, label: false, color: "#ffab40" },
      { arrow: true, solid: true, width: 4, color: "#ffab40", from: { r: ON_LINE(6) + 1.7, m: 6 }, to: { r: ON_LINE(6) + 0.1, m: 6 }, delay: 0.4 },
      { text: "crushes under\nits own weight", at: [ON_LINE(6) + 4.2, 6], size: 26, color: "#ffab40", delay: 0.5 }] },
    { at: "squeeze it too hard", cam: UP(10), clear: true, hl: [WATER, { ellipse: [ON_LINE(10) - 1.7, 10, 0.8, 0.8], rot: 0, label: false, color: "#4fc3f7" },
      { arrow: true, solid: true, width: 4, color: "#4fc3f7", from: { r: ON_LINE(10) - 1.7, m: 10 }, to: { r: ON_LINE(10) - 0.1, m: 10 }, delay: 0.4 },
      { text: "its atoms\npush back", at: [ON_LINE(10) - 4.2, 10], size: 26, color: "#4fc3f7", delay: 0.5 }] },
    { at: "density of atoms", cam: UP(16), clear: true, hl: [{ line: "water", label: "the density of atoms" }] },
    { at: "somewhere along here", cam: UP(23), hl: [{ line: "water", label: "the density of atoms" }] },
    // the giant planets' column
    { at: "giant planets", cam: G(9.85, 30.9, 2.4), dur: 2.5, hl: [{ obj: "Jupiter", label: "Jupiter", place: "left" }, ...BD] },
    { at: "up a column", hl: [{ obj: "Jupiter", label: false, place: "left" }, ...BD, COLUMN] },
    { at: "degenerate matter", hl: [{ obj: "Jupiter", label: "degenerate matter inside", place: "left" }, ...BD, { ...COLUMN, draw: 0.01 }] },
    // the atoms crushed: the diagram (src/narr-diagrams.js, drawCrush)
    { at: "so massive", hl: [{ crush: {} }] },
    { at: "break out of their clouds", hl: [{ crush: { phase: "pop" }, instant: true }] },
    { at: "sea of electrons", hl: [{ crush: { phase: "sea" }, instant: true }] },
    { at: "crushed any further", hl: [{ crush: { phase: "hold" }, instant: true }] },
    // the strong force: back to the chart for a beat, then the fusion diagram (drawFuse)
    { at: "even more mass", cam: { r: 9.85, m: 32.6, span: 3 }, hl: [{ obj: "L Brown Dwarf", label: false }, { obj: "Proxima Cen", label: "fusion starts", delay: 0.6 }] },
    { at: "the strong force", hl: [{ fuse: {} }] },
    { at: "very limited range", hl: [{ fuse: { phase: "range" }, instant: true }] },
    { at: "push those cores together", hl: [{ fuse: { phase: "squeeze" }, instant: true }] },
    { at: "capture them", hl: [{ fuse: { phase: "merge" }, instant: true }] },
    { at: "single nucleus", hl: [{ fuse: { phase: "helium" }, instant: true }] },
    { at: "massive amount of energy", hl: [{ fuse: { phase: "burst" }, instant: true }] },
    { at: "even further", hl: [{ fuse: { phase: "push" }, instant: true }] },
    { at: "that delicate dance", cam: { r: 10.9, m: 33.1, span: 3.6 }, hl: [{ fuse: { phase: "stars" }, instant: true }] },
    // the main sequence
    { at: "called the main sequence", hl: [{ obj: "Sun" }, MS, { obj: "Sirius A", delay: 0.4 }] },
    { at: "most of their lives", hl: [MS, { obj: "Sun", label: "billions of years" }, { obj: "Sirius A", delay: 0.3 }, { obj: "Vega", delay: 0.6 }] },
    { at: "once that runs out", hl: [{ line: "mainsequence" }, { obj: "Sun", label: "out of hydrogen" }] },
    { at: "goes haywire", cam: { r: 11.85, m: 33.4, span: 3.6 }, hl: [{ swing: [{ obj: "Sun" }, { obj: "Red Giant" }], period: 1.2, core: true }, { obj: "Red Giant", label: "the fire goes out", delay: 1 }] },
    // the weak force: the diagram (drawWeak); the camera moves behind it to the cores
    { at: "catastrophic core collapse", cam: { r: 8.0, m: 33.5, span: 7 }, dur: 2, hl: [{ weak: {} }] },
    { at: "weak force", hl: [{ weak: { phase: "weak" }, instant: true }] },
    { at: "protons and electrons", hl: [{ weak: { phase: "capture" }, instant: true }] },
    { at: "sea of neutrinos", hl: [{ weak: { phase: "neutrino" }, instant: true }] },
    { at: "do not repel each other", hl: [{ weak: { phase: "pack" }, instant: true }] },
    { at: "very big atomic", hl: [{ weak: { phase: "nucleus" }, instant: true }] },
    { at: "force of gravity", hl: [{ weak: { phase: "gravity" }, instant: true }] },
  ],
};
