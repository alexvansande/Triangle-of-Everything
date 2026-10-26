// =============================================================
// Scene: short-01-hook — the opening hook as a vertical short. On the classic
// figure: the diagonal, mass and size, energy and wavelength, the sciences
// across the chart, the three sides (the size of the universe, quantum
// mechanics, relativity) meeting at the Big Bang, and time on the diagonals;
// then the cross-fade into the map on "…the triangle of everything", a quick
// tour of its stories, and the author's outro over one slow zoom out.
// Recorded 2026-10-26 (rec34; video/short-01-hook/). The 2026-10-07 cut and
// its scene are in git history.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Axis highlights: { axis: side }.
// The classic figure here has energy (GeV) on the left, mass (g) on the
// right, size (cm) on the bottom; time is written on the diagonals.

const FIG = { r: 7.5, m: 9, span: 106 };      // the whole classic figure
const MAP = { r: -2.2, m: -4.8, span: 74 };   // the whole triangle, portrait
const PLANCK = { r: -30, m: -3, span: 30 };   // where quantum meets relativity
const QUANTUM = { line: "compton", label: "quantum mechanics" };
const RELATIVITY = { line: "schwarzschild", label: "relativity" };
const UNIVERSE = { line: "hubble", label: "size of the universe" };
// the sciences across the chart: loops round each one's objects (centre and half-axes in decades)
const SCIENCE = (r, m, rx, ry, label, place = "right") => ({ ellipse: [r, m, rx, ry], label, place });
const ASTRO = SCIENCE(17, 38, 5.5, 13, "astronomy");
const ENGINEERING = SCIENCE(5.4, 14, 2.6, 4.2, "engineering");
const BIOLOGY = SCIENCE(-0.6, -1.8, 3.2, 11, "biology", "left");
const CHEMISTRY = SCIENCE(-6.2, -21, 2.4, 3.6, "chemistry", "right");
const PARTICLES = SCIENCE(-15.5, -23, 3.2, 4, "particle physics", "below");
const drawn = (list) => list.map(h => ({ ...h, draw: 0.01 }));   // already drawn: no regrowing

export default {
  title: "The hook",
  blurb: "The classic chart, and why it's much more than mass versus size.",
  start: FIG,

  captionFixes: { short: "chart", shard: "chart", lights: "light" },

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md)
  backing: "Space X-plorers",
  sound: [
  ],

  cues: [
    { at: "most interesting chart", cam: { r: 6, m: 8, span: 96 }, dur: 5, drift: 0.03 },

    // the diagonal, bottom to top
    { at: "this diagonal line", cam: { r: 3, m: 4, span: 60 }, hl: [{ line: "water", label: "the diagonal" }] },
    { at: "from bacteria", cam: { r: -3.5, m: -9, span: 30 }, hl: [{ line: "water" }] },
    { at: "to humans", cam: { r: 1, m: 2, span: 30 }, hl: [{ line: "water" }] },
    { at: "to planets", cam: { r: 9, m: 28, span: 34 }, clear: true },
    { at: "and galaxies", cam: { r: 21, m: 43, span: 34 } },

    // mass and size
    { at: "vertical axis is mass", cam: FIG, dur: 2, hl: [{ axis: "right", label: "mass" }] },
    { at: "horizontal axis", hl: [{ axis: "right", label: "mass" }, { axis: "bottom", label: "size" }] },
    { at: "so much more than that", clear: true },
    { at: "don't have mass", cam: { r: -11, m: -25, span: 30 } },
    { at: "photons", cam: { r: -9, m: -27, span: 22 } },

    // energy and wavelength
    { at: "also a chart of energy", cam: FIG, dur: 2, hl: [{ axis: "left", label: "energy" }] },
    { at: "bottom axis", hl: [{ axis: "bottom", label: "size" }] },
    { at: "as wavelength", hl: [{ axis: "bottom", label: "wavelength" }] },

    // all of science, top to bottom: a loop round each one as it's named, the earlier ones kept
    { at: "all of science", cam: FIG, dur: 2, clear: true },
    { at: "astronomy", hl: [ASTRO] },
    { at: "engineering is here", hl: [...drawn([ASTRO]), ENGINEERING] },
    { at: "biology", hl: [...drawn([ASTRO, ENGINEERING]), BIOLOGY] },
    { at: "chemistry", hl: [...drawn([ASTRO, ENGINEERING, BIOLOGY]), CHEMISTRY] },
    { at: "particle physics", hl: [...drawn([ASTRO, ENGINEERING, BIOLOGY, CHEMISTRY]), PARTICLES] },

    // the three sides, and where the two left ones meet
    { at: "bounded by three sides", cam: FIG, dur: 2.4, hl: [{ line: "triangle" }] },
    { at: "on the right", hl: [UNIVERSE] },
    { at: "quantum mechanics", hl: [UNIVERSE, QUANTUM] },
    { at: "relativity", hl: [UNIVERSE, QUANTUM, RELATIVITY] },
    { at: "those two lines meet", cam: PLANCK, dur: 2.4, hl: [{ line: "compton" }, { line: "schwarzschild" }] },

    // time on the diagonals along the top
    { at: "along the top", cam: { r: 22, m: 50, span: 44 }, clear: true },
    { at: "measured in seconds", cam: { r: 27, m: 60, span: 22 } },
    { at: "a history of time", cam: { r: 22, m: 52, span: 40 } },
    { at: "our whole universe", cam: { r: 6, m: 14, span: 80 }, dur: 3 },

    // into the map
    { at: "the triangle of everything", offset: -0.6, classic: "out", fade: 3, cam: MAP, dur: 3.4, drift: 0.04,
      hl: [{ line: "triangle", delay: 1.4 }] },

    // a few of its stories, a quick hop each
    // the plane and the hippo share a shot: "hippos" and "gravity" are a breath apart
    { at: "about airplanes", cam: { r: 2.75, m: 7.5, span: 9 }, dur: 2.2, clear: true, hl: [{ obj: "Boeing 747", label: "airplanes" }] },
    { at: "hippos", hl: [{ obj: "Boeing 747", label: "airplanes" }, { obj: "Hippopotamus", label: "hippos" }] },
    { at: "and gravity", cam: { r: 8.5, m: 26.8, span: 9 }, dur: 1.4, hl: [{ obj: "Moon" }, { obj: "Earth", label: "gravity" }] },
    { at: "how stars evolve", cam: { r: 11.6, m: 33.5, span: 11 }, dur: 1.4,
      hl: [{ obj: "Protostar" }, { obj: "Sun", delay: 0.3 }, { obj: "Red Giant", delay: 0.6 }, { obj: "White Dwarf", delay: 0.9 }] },
    { at: "particles turn into", cam: { r: -11.8, m: -25.4, span: 11 }, dur: 1.8,
      hl: [{ obj: "Proton" }, { obj: "Neutron", label: false }, { obj: "Electron", delay: 0.3 }] },
    { at: "why balloons float", cam: { r: 2.1, m: 3.6, span: 9 }, dur: 1.8,
      hl: [{ line: "air" }, { obj: "Helium Party Balloon" }, { obj: "Hot-air Balloon", delay: 0.3 }] },
    { at: "the periodic table", cam: { r: -8, m: -22.6, span: 6 }, dur: 1.8,
      hl: [{ obj: "Hydrogen" }, { obj: "Carbon", delay: 0.2 }, { obj: "Iron", delay: 0.4 }, { obj: "Gold", delay: 0.6 }] },
    { at: "why fire looks", cam: { obj: "Visible Light", span: 9 }, dur: 1.6, hl: [{ obj: "Visible Light", label: "light" }] },

    // the outro: one slow zoom out from the last shot, to the end
    { at: "obsessed", cam: { obj: "Visible Light", span: 40 }, dur: 24, drift: 0, clear: true },
  ],
};
