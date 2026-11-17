// =============================================================
// Scene: long-02b-opening — the new opening of long video 2 (space), the author's first draft of the new script (rec74,
// 2026-11-17; video/long-02b-opening/, the script: the claude.ai doc "Long 2: Space Triangle — script"). The catalogue of
// everything on black (src/narr-catalogue.js, the author's notes in the script): the chart's pictures floating in 3D,
// the camera darting to each thing named, glowing lines between the ones of a kind, labels, then sorted (floats / sinks,
// round, alive, heavier, bigger) and laid out by size and mass on a log grid. Then the chart: everything from far away,
// the bands and the diagonal; the dance of the forces, the electric bonds (a few atoms settling, the Squeeze Lab's
// mode 1 without the squeeze), gravity pushing in, the pan up to the round worlds, the giant planets' column and the
// atoms crushed, the split, the strong force and fusion, the main sequence, the fuel running out, how stars end and the
// weak force, the neutron star; then the black-hole line up to the Schwarzschild limit, where the long cut
// (video/cuts/long-02b-space.json) hands over to the Black Hole Slope. The forces Short (short-l2b-dance-of-the-forces)
// is cut from this take. The chart's shots are the forces Short's (short-l2-dance-of-the-forces.js) and the Black Hole
// Slope's (short-04a-black-hole-slope.js), keyed to this take's words, so the pictures match across the series.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

const WATER = { line: "water" };
const ON_LINE = (m) => (m - 0.62) / 3;
// marks a little ahead of the camera on the pan up the diagonal (visual-rules.md, "Marks during a glide")
const force = (m, dir, color) => ({ arrow: true, solid: true, width: 4, color, from: { r: ON_LINE(m) + dir * 1.5, m }, to: { r: ON_LINE(m) + dir * 0.2, m } });
// (named = false: the arrows alone; the words come once the narration names the force, the author, 2026-11-17, 1:35:
// "don't show the pushes out and in labels yet")
const GRAV_AT = (m, named = true) => [force(m + 0.9, 1, "#ffab40"), force(m - 0.9, 1, "#ffab40"), ...(named ? [{ text: "gravity\npushes in", at: [ON_LINE(m) + 0.85, m], size: 22, color: "#ffab40" }] : [])];
const EM_AT = (m, named = true) => [force(m + 0.9, -1, "#4fc3f7"), force(m - 0.9, -1, "#4fc3f7"), ...(named ? [{ text: "electro-\nmagnetism\npushes out", at: [ON_LINE(m) - 1.05, m], size: 22, color: "#4fc3f7" }] : [])];
const UP = (m, span = 4.6) => ({ r: ON_LINE(m), m, span, glide: true });
const COLUMN = { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f" };
const G = (r, m, span = 1.7) => ({ r, m, span });
const BD = [{ obj: "Y Brown Dwarf", label: false }, { obj: "T Brown Dwarf", label: false }];
const FORK = [
  { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f" },
  { obj: "White Dwarf", label: "dead stars' cores", place: "right", delay: 0.8 },
];
const MS = { line: "mainsequence", label: "main sequence" };
// where things turn round (Short 2's ROUND_M, between Vesta and Ceres): the shape held by bonds below, by gravity above
const ROUND_M = 23.7;
const ROUND_BONDS = { side: "below", mass: ROUND_M, label: "electromagnetism\ndominates", labelX: 0.22 };
const ROUND_GRAV = { side: "above", mass: ROUND_M, label: "gravity\ndominates", labelX: 0.22 };
// "so far our objects…": the chart with no pictures, its dots only, the places they gather looped (the author,
// 2026-11-17, 5:21: "hide all icons, keep just the dots and then use circles and ovals to highlight these areas")
const SO_FAR = { r: 4.6, m: 15, span: 22, frame: [-5, -9, 14, 41] };
const OV_WATER = { ellipse: [2.4, 7.9, 1.3, 20], label: "ordinary matter", place: "left", color: "#80deea" };
const OV_COLUMN = { ellipse: [9.85, 31.2, 0.5, 1.7], rot: 0, label: "super-Jupiters", place: "left", color: "#ffd54f" };
const OV_STARS = { ellipse: [11.1, 33.9, 0.55, 2.1], rot: 34, label: "living stars", place: "right", color: "#ffab40" };
// (each cue holds the catalogue until the next: with the default 14 s it ended at 0:26 and the chart showed through,
// the author, 2026-11-17: "0:29 dont show the chart yet just keep floating among the objects"; out: its fade into the chart)
const CAT = (phase) => ({ catalogue: { phase }, instant: true, out: 1.6 });
const CQ = (at, phase) => ({ at, hold: 999, hl: [CAT(phase)] });
// the black-hole line (the Black Hole Slope's)
const BH = (m) => ({ r: m - 27.83, m, mark: true });
const SCHW = { line: "schwarzschild" };
const KNOWN = { dust: "blackhole", sweep: 1.6 };
const LOW = { path: "stellar-low-mass" }, HIGH = { path: "stellar-high-mass" };
const CYCLE = [LOW, HIGH, { path: ["nebula-to-nursery", "remnant-to-nursery"] }];
const WD = { obj: "White Dwarf", label: false }, NS = { obj: "PSR J0030+0451", label: false }, SBH = { obj: "Stellar BH", label: false };
// a few atoms finding their distance: the Squeeze Lab's mode 1 with a roomy box that doesn't shrink and nothing popping,
// its arrows on (the author's note in the script: "electrons repel electrons", "electrons and protons attract"); the
// arrows on the line between each two neighbours' centres (the author, 2026-11-17, 1:41): blue pairs pushing them
// apart at the electron rings, purple ones from each ring to the other's nucleus (squeeze-sim.js, arrowsBonds)
const BONDS = { squeeze: { mode: 1, from: 0, P: { count: 34, startBox: 1.12, endBox: 1.12, shrinkTime: 999, threshold: 9, centreFirst: 0, initSpeed: 140, arrowTime: 30, arrowsIn: false, arrowsOut: false, arrowsBonds: true,
  // each kind of arrow as it's named ("electrons repel other electrons", "and are attracted to protons"), s into the run
  bondPushFrom: 0.7, bondPullFrom: 2.6 },
  labels: [["electrons repel electrons", "#4fc3f7"], ["electrons and protons attract", "#b39ddb"]] } };

export default {
  title: "The Triangle of Everything: space (the new opening)",
  blurb: "A map of every single thing: the catalogue, sorted and laid out by mass and size; then the dance of the forces up the diagonal, from chemical bonds to the neutron star, and the black-hole line.",
  // the chart's first frame, behind the catalogue until it hands over (bare: the painting comes back from 1:20)
  start: { r: 5.5, m: 14, span: 30 },
  bgStart: 0,
  // and bare of its edges, regions and names until the diagonal is named (the author, 2026-11-17, 1:19: "first move the
  // objects, then show the grid and the axis. Dont show the edges yet nor the quark gluon plasma label, then after a
  // second or so, slowly fade in the background")
  edgesStart: 0,
  iconBoost: { from: 21.2, k: 0.6, slugs: { "laniakea-galaxy-supercluster": 0.55 } },
  icons: "all",
  forceIcons: ["Sun", "L Brown Dwarf", "T Brown Dwarf", "Y Brown Dwarf"],
  captionFixes: { hair: "here", nucleon: "nucleus", nebulas: "nebulae" },

  backing: "Immersed",
  sound: [
    { at: "something magical happens", fx: "ignite", offset: 0.3 },
    { at: "goes haywire", fx: "boom", offset: 0.2 },
    { at: "become a black hole", fx: "drop", atEnd: true, offset: -0.3 },
  ],

  cues: [
    // ── A map of every single thing: the catalogue on black ──
    { t: 0, hold: 999, hl: [{ catalogue: { phase: "start" }, out: 1.6 }] },
    CQ("every star", "sun"),
    CQ("every planet", "earth"),
    CQ("galaxy", "milky-way"),
    CQ("animal", "elephant"),
    CQ("rock", "big-rock-okotoks"),
    CQ("car", "benz-patent-motorwagen"),
    CQ("microbe", "bacteria"),
    CQ("atom", "hydrogen"),
    CQ("relate to each other", "links"),
    CQ("add numbers", "labels"),
    CQ("rainbow", "light"),
    CQ("float in water", "float"),
    CQ("some are round", "round"),
    CQ("are alive", "alive"),
    CQ("heavy or light", "heavy"),
    CQ("big or small", "big"),
    // to the chart: each picture flies to where the chart has it (the author, 2026-11-17, 1:10), then the chart takes over
    CQ("organize them", "chart"),

    // ── The chart: everything from far away, then the bands and the diagonal ──
    // the catalogue fades into the chart as it is, the painting off (bgStart); then one slow pan and zoom down to the human,
    // the painting fading back in from "this particular diagonal" (the author, 2026-11-17: "from now on its a slow pan and
    // zoom", "1:20 now slowly fade the background as we zoom towards the macro scale")
    { at: "each square", cam: { r: 5.5, m: 14, span: 30, glide: true }, dur: 0.05, bg: { to: 1, dur: 7, after: 1.4 }, hl: [] },
    { at: "fall in bands", cam: { r: 4.0, m: 11.0, span: 21, glide: true }, hl: [WATER, { ...COLUMN, delay: 1.2 }] },
    { at: "particular diagonal", cam: { r: 3.0, m: 9.3, span: 13, glide: true }, edges: { to: 1, dur: 3 }, hl: [{ line: "water", label: "the diagonal" }] },
    // the four forces: on the human, the tug of war marked on the line
    { at: "delicate dance", cam: { obj: "Human", span: 4.6, glide: true }, clear: true, hl: [WATER, { obj: "Human" }] },
    { at: "tug of war", hl: [WATER, ...GRAV_AT(3.6, false), ...EM_AT(6.2, false)] },
    // the chemical bonds: a few atoms on black, settling at their distance
    // (on until "…the electromagnetic force", the author, 2026-11-17: "the bond animation can last until 1:50")
    { at: "electrons repel", hold: 999, hl: [BONDS] },
    { at: "electromagnetic force", offset: 0.2, cam: { obj: "Human", span: 6 }, dur: 0.05, clear: true, hl: [WATER, { obj: "Human", label: "held by chemical bonds" }, ...EM_AT(6.2)] },
    { at: "gravity works", hl: [WATER, ...EM_AT(6.2, false), ...GRAV_AT(3.6)] },
    // one pan up the line (visual-rules.md: one pan, one direction), the rings ahead of the camera
    { at: "make something too big", cam: UP(6), clear: true, hl: [WATER, { ellipse: [ON_LINE(7.5) + 1.2, 7.5, 0.6, 0.6], rot: 0, label: false, color: "#ffab40" },
      { arrow: true, solid: true, width: 4, color: "#ffab40", from: { r: ON_LINE(7.5) + 1.2, m: 7.5 }, to: { r: ON_LINE(7.5), m: 7.5 }, padEnd: 0, delay: 0.4 },
      { text: "crushes under\nits own weight", at: [ON_LINE(7.5) + 1.25, 8.6], size: 22, color: "#ffab40", delay: 0.5 }] },
    // (the arrows' tips on the line itself: "the blue arrow seems to be placed before the line ends", the author, 2026-11-17)
    { at: "squeeze it too hard", cam: UP(10), clear: true, hl: [WATER, { ellipse: [ON_LINE(12.5) - 1.2, 12.5, 0.6, 0.6], rot: 0, label: false, color: "#4fc3f7" },
      { arrow: true, solid: true, width: 4, color: "#4fc3f7", from: { r: ON_LINE(12.5) - 1.2, m: 12.5 }, to: { r: ON_LINE(12.5), m: 12.5 }, padEnd: 0, delay: 0.4 },
      { text: "its atoms\npush back", at: [ON_LINE(12.5) - 1.2, 11.4], size: 22, color: "#4fc3f7", delay: 0.5 }] },
    { at: "density of atoms", cam: UP(16), clear: true, hl: [{ line: "water", label: "the density of atoms" }] },
    { at: "gravity is very weak", cam: UP(19), hl: [WATER, ...GRAV_AT(20.5)] },
    // (no Burj Khalifa: ten decades below the camera, the frame grew to take it in, a slow zoom out before the pan; the
    // author, 2026-11-17, 2:29: "just keep the pan and zoom together so we end up in the same place with a single movement")
    { at: "very tall buildings", cam: UP(22), hl: [WATER] },
    // "we are just panning up now, seeing the round moons" (the author's note); where things turn round marked as in
    // Short 2 (the author, 2026-11-17: "highlight the moment things start getting round, like we do in the other short"):
    // the line between Vesta, lumpy, and Ceres, round, the bonds holding the shape below it and gravity above
    { at: "becomes round", cam: { r: 7.75, m: 24.1, span: 4.6, glide: true }, hl: [ROUND_BONDS, { ...ROUND_GRAV, delay: 0.5 }, { obj: "Vesta", label: "Vesta · lumpy", place: "left" }, { obj: "Ceres", label: "Ceres · round", delay: 0.4 }, { obj: "Pluto", label: false, delay: 0.7 }] },
    { at: "gravity shapes everything", cam: { r: 8.6, m: 27.0, span: 4.6, glide: true }, hl: [ROUND_GRAV, { obj: "Earth", label: "shaped by gravity" }, { obj: "Moon", label: false }] },
    // the giant planets' column
    { at: "atomic scale", cam: G(9.85, 30.9, 2.4), dur: 2.5, clear: true, hl: [{ obj: "Jupiter", label: "Jupiter", place: "left" }] },
    { at: "go up on a column", hl: [{ obj: "Jupiter", label: false, place: "left" }, ...BD, COLUMN] },
    { at: "not made of ordinary matter", hl: [{ obj: "Jupiter", label: "not ordinary matter inside", place: "left" }, ...BD, { ...COLUMN, draw: 0.01 }] },
    // the atoms crushed: the Squeeze Lab's mode 1 ("show that sim of the degenerate matter forming")
    // (its arrows pointing at each other, as in the bonds: blue between the shells, purple to the other nucleus; red from
    // the edges, the squeeze; the author, 2026-11-17, 3:30)
    { at: "these planets are massive", hold: 14, hl: [{ squeeze: { mode: 1, from: 13.2, P: { arrowsOut: false, arrowsBonds: true, arrowTime: 30, bondPushFrom: 13.4, bondPullFrom: 14.5, bondShare: 0.25 } } }] },
    { at: "don't get bigger", cam: G(9.85, 31.4, 2.6), clear: true, hl: [{ obj: "Jupiter", label: false, place: "left" }, ...BD, { ...COLUMN, draw: 0.01 }] },
    // "show the super jupiters and brown dwarf branching"
    { at: "bifurcation", cam: { r: 9.9, m: 33.0, span: 3.8 }, dur: 3, drift: 0.02, hl: [{ obj: "L Brown Dwarf", label: false }, ...FORK] },
    // the strong force: the brown dwarfs and Proxima, then the fusion diagram
    { at: "even more mass", cam: { r: 9.85, m: 32.6, span: 3 }, clear: true, hl: [{ obj: "L Brown Dwarf", label: false }, { obj: "Proxima Cen", label: "fusion starts", delay: 0.6 }] },
    // fusion in diamonds (src/narr-diagrams.js, drawDiamonds; the author, 2026-11-17, 3:40): fours squeezed into diamonds,
    // all merging at once on "capture them", then one helium pushing the rest away as the energy comes out
    { at: "the strong force", hold: 999, hl: [{ diamonds: {}, out: 0.8 }] },
    { at: "for some massive", hold: 999, hl: [{ diamonds: { phase: "squeeze" }, instant: true, out: 0.8 }] },
    { at: "capture them", hold: 999, hl: [{ diamonds: { phase: "capture" }, instant: true, out: 0.8 }] },
    { at: "large amount of energy", hold: 999, hl: [{ diamonds: { phase: "energy" }, instant: true, out: 0.8 }] },
    { at: "counterbalances", hold: 999, hl: [{ diamonds: { phase: "balance" }, instant: true, out: 0.8 }] },
    { at: "that's fusion", hold: 999, hl: [{ diamonds: { phase: "fusion" }, instant: true, out: 0.8 }] },
    // the main sequence: one slow push in (the author, 2026-11-17, 4:11: "I don't like static cameras")
    { at: "changes the delicate dance", cam: { r: 10.9, m: 33.1, span: 4.2, glide: true }, dur: 0.05, clear: true, hl: [] },
    { at: "called the main sequence", cam: { r: 11.0, m: 33.15, span: 3.5, glide: true }, hl: [{ obj: "Sun" }, MS, { obj: "Sirius A", delay: 0.4 }] },
    { at: "most of their lives", cam: { r: 11.1, m: 33.2, span: 3.0, glide: true }, hl: [MS, { obj: "Sun", label: "billions of years" }, { obj: "Sirius A", delay: 0.3 }, { obj: "Vega", delay: 0.6 }] },
    { at: "once it runs out", cam: { r: 11.3, m: 33.25, span: 2.8, glide: true }, hl: [{ line: "mainsequence" }, { obj: "Sun", label: "out of hydrogen" }] },
    { at: "goes haywire", cam: { r: 11.85, m: 33.4, span: 3.6, glide: true }, hl: [{ swing: [{ obj: "Sun" }, { obj: "Red Giant" }], period: 1.2, core: true }, { obj: "Red Giant", label: "the fire goes out", delay: 1 }] },
    // how stars end: the small ones (the white dwarf and the nebula), the big ones (the supernova), then the weak force
    { at: "small stars", cam: { r: 12.6, m: 33.6, span: 9 }, dur: 3, clear: true, hl: [{ ...LOW, from: "Sun" }, { obj: "White Dwarf", label: "the core left", place: "left", delay: 0.8 }, { obj: "Planetary Nebula", label: "a nebula", delay: 1.6 }] },
    { at: "more massive stars", hl: [HIGH, { obj: "Crab Nebula", label: "supernova", delay: 0.8 }] },
    { at: "catastrophic core collapse", hl: [HIGH, { obj: "Crab Nebula", label: "supernova" }, { obj: "PSR J0030+0451", label: "the core", delay: 0.8 }] },
    // the weak force, the lab's mode 3, its first ring clenching on "squeeze a proton"
    { at: "a new player force", cam: { r: 8.0, m: 33.5, span: 7 }, dur: 2, hold: 34, hl: [{ squeeze: { mode: 3, from: 10.5 } }] },
    { at: "this forms a neutron star", cam: { obj: "PSR J0030+0451", span: 3.4 }, dur: 2.5, clear: true, hl: [{ obj: "PSR J0030+0451", label: "neutron star" }] },
    { at: "a bunch of neutrons", hl: [{ obj: "PSR J0030+0451", label: "one giant nucleus" }, { density: 14.36, label: "the density of a nucleus" }] },

    // ── The black-hole line (the Black Hole Slope's shots) ──
    { at: "a stranger thing", cam: { r: 8.6, m: 33.7, span: 8 }, dur: 3, clear: true, hl: [NS, { obj: "Stellar BH", label: "?", delay: 0.6 }] },
    { at: "so far our", cam: SO_FAR, dur: 2.6, ease: "gentle", icons: false, forceIcons: [], clear: true, hl: [] },
    { at: "around bands", hl: [OV_WATER] },
    { at: "column of super-Jupiter", hl: [OV_WATER, OV_COLUMN] },
    { at: "all living stars", hl: [OV_WATER, OV_COLUMN, OV_STARS] },
    { at: "where stars go to die", cam: { r: 12.6, m: 34, span: 15 }, dur: 4, hl: [OV_STARS, ...CYCLE] },
    { at: "cemetery of dead stars", cam: { r: 8.6, m: 33.7, span: 8 }, dur: 3, clear: true, icons: true, forceIcons: null,
      hl: [WD, NS, SBH, { ellipse: [7.45, 33.75, 2.3, 1.15], rot: 0, label: "dead stars", place: "above", color: "#e0e0e0", delay: 1.4 }] },
    { at: "white dwarfs", hl: [{ obj: "White Dwarf", place: "left" }, NS, SBH] },
    { at: "neutron stars", hl: [WD, { obj: "PSR J0030+0451", label: "neutron star", place: "right" }, SBH] },
    { at: "black holes", hl: [WD, NS, { obj: "Stellar BH", label: "black hole" }] },
    { at: "not scattered around", cam: { obj: "Sgr A*", span: 15 }, dur: 4, drift: 0.02, clear: true, hl: [KNOWN] },
    { at: "lives exactly on this line", hl: [KNOWN, { ...SCHW, label: "black holes" }] },
    { at: "this line is very special", cam: { r: 11, m: 38.6, span: 20 }, dur: 5, hl: [{ line: "triangle" }, { ...SCHW, label: "the first limit" }] },
    { at: "for every object you can see", cam: { r: 4.2, m: 26.6, span: 16 }, dur: 3, hl: [SCHW, { obj: "Moon" }] },
    { at: "if you squeeze them", hl: [SCHW, { obj: "Moon" }, { arrow: true, from: { obj: "Moon" }, to: BH(25.87), label: "squeeze", delay: 0.2 }] },
    { at: "become a black hole", hl: [SCHW, { obj: "Moon" }, { arrow: true, from: { obj: "Moon" }, to: BH(25.87), delay: 0 },
      { cross: BH(25.87), size: "the Moon: 0.2 mm wide", delay: 0.3 }] },
    { at: "never cross this line", cam: { obj: "Sgr A*", span: 15 }, dur: 6, drift: 0.02, clear: true, hl: [{ ...SCHW, label: "nothing crosses it" }] },
    { at: "called the schwarzschild radius", hl: [{ ...SCHW, label: "schwarzschild radius" }] },
    { at: "upper limit in which", hl: [{ ...SCHW, label: "schwarzschild radius" }, { side: "left", of: "schwarzschild" }] },
  ],
};
