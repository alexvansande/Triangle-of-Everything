// =============================================================
// Scene: long-02-intro — the opening of long video 2 (space), the author's one-take recording of
// 2026-11-06 (rec57; video/long-02-intro/): the video's questions, whipped through on the chart; the
// chart and its three limits; the hand-over from long video 1 (humans to planets, the density of
// atoms); the tug of war between gravity and electromagnetism along the diagonal; the trend up to
// the giant planets and the split; Jupiter's own heat, the atoms crushed, the sea of electrons;
// brown dwarfs and deuterium; hydrogen fusion and the strong force; the main sequence and the
// light-pressure cap; then the stars' death (the truce breaking, red giant, iron, the split in
// two), the cycle of nebulae and nurseries, the cores (white dwarf, the weak force and the
// neutrino, the neutron star as a giant nucleus held by gravity) and the collapse into a black
// hole. The cut (video/cuts/long-02-space.json) goes on with long-02-middle from "most objects on
// our chart". The shots are video 3's and long video 1's (and the stars' death and cores are
// long-02-middle's, keyed to the new words), so the pictures match across the series.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

const MAP = { r: -2.2, m: -4.8, span: 74 };           // the whole triangle (as the hook's)
const QUANTUM = { line: "compton", label: "quantum mechanics" };
const RELATIVITY = { line: "schwarzschild", label: "relativity" };
const UNIVERSE = { line: "hubble", label: "size of the universe" };
const WATER = { line: "water" };
// the two sides of the density line while the forces are named
// the author, 2026-11-05: close on the atomic diagonal, two arrows each, so gravity doesn't read as the black-hole line
const ON_LINE = (m) => (m - 0.62) / 3;
const force = (m, dir, color, label) => ({ arrow: true, solid: true, width: 4, color, label,
  from: { r: ON_LINE(m) + dir * 3, m }, to: { r: ON_LINE(m) + dir * 0.2, m } });
// the arrows at any mass along the line: the camera pans up it while the forces are named (the author, 2026-11-07)
const GRAV_AT = (m) => [force(m + 0.9, 1, "#ffab40"), force(m - 0.9, 1, "#ffab40"), { text: "gravity\npushes in", at: [ON_LINE(m) + 4.6, m], size: 26, color: "#ffab40" }];
const EM_AT = (m) => [force(m + 0.9, -1, "#4fc3f7"), force(m - 0.9, -1, "#4fc3f7"), { text: "electromagnetism\npushes out", at: [ON_LINE(m) - 3.6, m], size: 26, color: "#4fc3f7" }];
const UP = (m, span = 4.6) => ({ r: ON_LINE(m), m, span, glide: true });   // a waypoint on the density line
const still = (h) => ({ ...h, instant: true, draw: 0.01, delay: 0 });
// the super-Jupiter column (as long video 1's)
const COLUMN = { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f" };
const G = (r, m, span = 1.7) => ({ r, m, span });
const BD = [{ obj: "Y Brown Dwarf", label: false }, { obj: "T Brown Dwarf", label: false }];
const FORK = [
  { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f" },
  { obj: "White Dwarf", label: "dead stars' cores", place: "right", delay: 0.8 },
];
const JUPITER_SATURN = { r: 9.8, m: 30.05, span: 1.5 };
const MS = { line: "mainsequence", label: "main sequence" };
// the top of the main sequence: the heaviest stars, where light pushes the outer layers off
const TOP = { r: 11.9, m: 34.9, span: 3.2 };
const PBH = { mark: [-8.3, 19.5], label: "primordial black holes?", place: "right", color: "#ff8fa8" };
// ── the stars' death, the cycle and the cores: long-02-middle's pieces (video 3's shots) ──
const SPLIT = { split: { from: { obj: "Red Giant" }, core: { obj: "White Dwarf" }, shell: { obj: "Planetary Nebula" } } };
const LOW = { path: "stellar-low-mass" }, HIGH = { path: "stellar-high-mass" };
const CYCLE = [LOW, { path: ["nebula-to-nursery", "remnant-to-nursery"] }];
const NEBULAE = { r: 18.0, m: 33.6, span: 5 };
const CYCLE_VIEW = { r: 16.95, m: 34.5, span: 7.8 };
const WD_LIMIT = (delay = 0, kept = false) => [{ line: "chandrasekhar", label: "white dwarf upper limit", delay, ...(kept ? { draw: 0.01 } : {}) },
  { cross: { r: 9.7, m: 33.46 }, mass: "1.44 solar masses", size: false, color: "#90caf9", delay: delay + 0.4 }];
const PSR_RING = { mark: [6.1, 33.45], color: "#80deea" };
const DENSITIES = [{ density: 0, label: "atomic density" }, { density: 14.36, label: "neutron density" }];
const DENSE_BOTTOM = { r: -9.3, m: -27.6, span: 11.5 };
const DENSE_TOP = { r: DENSE_BOTTOM.r + 19.1, m: DENSE_BOTTOM.m + 3 * 19.1, span: 11.5 };
const H_AT = [-8.28, -23.78], N_AT = [-13.06, -23.77], NU_AT = [-4.5, -32.9];
// a planet's start: no object on the chart, so a name of its own (the size of Mars, in the making)
const PROTOPLANET = [8.5, 26.8];
const SWING = (period) => ({ swing: [{ obj: "Sun" }, { obj: "Red Giant" }], period, core: true });

export default {
  title: "Space: the opening",
  blurb: "The questions, the chart and its limits, the tug of war up the line, planets into stars, how stars die, and what's left.",
  start: { r: 10.6, m: 32.4, span: 8 },
  // galaxies and up 60% of their size, Laniakea a good deal less: it hid everything around it (the author, 2026-11-05)
  iconBoost: { from: 21.2, k: 0.6, slugs: { "laniakea-galaxy-supercluster": 0.55 } },
  icons: "all",
  forceIcons: ["Sun", "L Brown Dwarf", "T Brown Dwarf", "Y Brown Dwarf", "Tycho’s Supernova Remnant"],   // Tycho's sits beside the Crab, which would hide it
  captionFixes: { shard: "chart", math: "mass", tense: "tension", favors: "favours", protostore: "protostar", buffers: "puffs" },

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md): video 3's
  backing: "Immersed",
  sound: [
    { at: "something magical happens", fx: "ignite", offset: 0.3 },
    { at: "once it runs out", music: "heartbeat", to: "split in two", stop: "cut" },
    { at: "split in two", fx: "boom", offset: 0.1 },
    { at: "collapse into a black hole", fx: "drop", atEnd: true, offset: -0.4 },
  ],

  cues: [
    // the questions: a slow push onto the first, then whips to each next one (visual-rules.md: lists get whips)
    { at: "difference between a star", cam: { r: 10.3, m: 31.8, span: 2.6 }, dur: 3.2, ease: "gentle",
      hl: [{ obj: "Jupiter", label: "planet", place: "left" }, { obj: "Sun", label: "star", delay: 0.8 }] },
    { at: "dead stars", cam: { r: 7.8, m: 33.5, span: 5, whip: true },
      hl: [{ obj: "White Dwarf", place: "right" }, { obj: "PSR J0030+0451", label: "neutron star", delay: 0.3 }, { obj: "Stellar BH", label: "black hole", delay: 0.6 }] },
    { at: "stars born", cam: { r: 16.9, m: 34.6, span: 7.8, whip: true },
      hl: [{ obj: "Stellar Nursery", place: "left" }, { obj: "Protostar", delay: 0.4 }] },
    { at: "how do they die", hl: [{ obj: "Stellar Nursery", label: false }, { obj: "Red Giant", label: "red giant" }, { obj: "Crab Nebula", delay: 0.4 }] },
    { at: "smallest a black hole", cam: { r: 10.5, m: 37.8, span: 15, whip: true },
      hl: [{ line: "schwarzschild" }, { obj: "Stellar BH", label: false }, { obj: "Sgr A*", label: false, delay: 0.3 }, { obj: "Ton 618", delay: 0.6 }] },
    { at: "most of the matter", cam: { r: -8.6, m: 19.4, span: 12, whip: true }, hl: [{ line: "schwarzschild" }, PBH] },

    // the chart: the whole triangle, its rulers, its three sides
    { at: "surprisingly useful", cam: MAP, dur: 4, ease: "gentle", clear: true },
    { at: "single chart", hl: [{ line: "triangle", delay: 0.4 }] },
    { at: "log plot of", units: true, hl: [{ line: "triangle", draw: 0.01 }] },
    { at: "its own limits", units: false, hl: [{ line: "triangle", draw: 0.01 }] },
    { at: "three sides", hl: [{ line: "triangle", draw: 0.01 }] },
    { at: "relativity", hl: [{ line: "triangle", draw: 0.01 }, RELATIVITY] },
    { at: "quantum mechanics", hl: [{ line: "triangle", draw: 0.01 }, RELATIVITY, QUANTUM] },
    { at: "size of the universe", hl: [{ line: "triangle", draw: 0.01 }, RELATIVITY, QUANTUM, UNIVERSE] },
    { at: "nothing can exist outside", hl: [{ ...RELATIVITY, label: false, draw: 0.01 }, { ...QUANTUM, label: false, draw: 0.01 }, { ...UNIVERSE, label: false, draw: 0.01 }, { line: "triangle", label: "nothing outside it" }] },
    { at: "fits inside the triangle", hl: [{ line: "triangle", label: "everything inside it" }] },
    { at: "triangle of everything", hl: [{ line: "triangle", label: "the triangle of everything" }] },

    // the hand-over from long video 1: humans up to the planets, the diagonal they fall on
    { at: "from humans", cam: { obj: "Human", span: 5 }, dur: 2.2, clear: true, hl: [{ obj: "Human" }] },
    { at: "to planets", cam: { obj: "Jupiter", span: 5 }, dur: 3.5, ease: "gentle", hl: [{ obj: "Jupiter", label: "planets" }] },
    { at: "falls on this diagonal", cam: { r: 5, m: 15, span: 34 }, dur: 3, clear: true, hl: [{ line: "water", label: "the diagonal" }] },
    { at: "density of water", hl: [{ line: "water", label: "the density of water" }] },
    { at: "density of atoms", hl: [{ line: "water", label: "the density of atoms" }] },

    // the tug of war along the density line: one slow pan up it, from the microbes to the round worlds (the author,
    // 2026-11-07: "zoom into microbials and be slowly panning up so that it reaches planets by the time I say round,
    // no panning up and down"); the arrows and the two circles sit wherever the camera is at the time
    { at: "delicate dance", cam: { obj: "Bacterium", span: 4.6 }, dur: 2.5, clear: true, hl: [WATER, { obj: "Bacterium", label: "a bacterium" }] },
    { at: "gravity wants", cam: UP(-9), hl: [WATER, ...GRAV_AT(-9.5)] },
    { at: "electromagnetism", cam: UP(-6), hl: [WATER, ...GRAV_AT(-9.5).map(still), ...EM_AT(-6)] },
    { at: "result of that tug of war", cam: UP(0), hl: [{ line: "water", label: "the diagonal" }, ...GRAV_AT(-9.5).map(still), ...EM_AT(-6).map(still)] },
    // too big: a circle right of the line, pushed back to it; too compact: left of it, pushed back the other way
    { at: "under its own weight", cam: UP(5), clear: true, hl: [WATER, { ellipse: [ON_LINE(5) + 1.7, 5, 0.8, 0.8], rot: 0, label: false, color: "#ffab40" },
      { arrow: true, solid: true, width: 4, color: "#ffab40", from: { r: ON_LINE(5) + 1.7, m: 5 }, to: { r: ON_LINE(5) + 0.1, m: 5 }, delay: 0.4 },
      { text: "crushes under\nits own weight", at: [ON_LINE(5) + 4.2, 5], size: 26, color: "#ffab40", delay: 0.5 }] },
    { at: "push it away", cam: UP(9.5), clear: true, hl: [WATER, { ellipse: [ON_LINE(9.5) - 1.7, 9.5, 0.8, 0.8], rot: 0, label: false, color: "#4fc3f7" },
      { arrow: true, solid: true, width: 4, color: "#4fc3f7", from: { r: ON_LINE(9.5) - 1.7, m: 9.5 }, to: { r: ON_LINE(9.5) - 0.1, m: 9.5 }, delay: 0.4 },
      { text: "its atoms\npush back", at: [ON_LINE(9.5) - 4.2, 9.5], size: 26, color: "#4fc3f7", delay: 0.5 }] },
    // the pan goes on up the line, the smallest life to the giant planets, and lands on the round worlds at "round"
    { at: "smallest form of life", cam: UP(14), clear: true, hl: [WATER] },
    { at: "larger planets", cam: UP(21), hl: [WATER] },
    { at: "planets to be round", cam: { r: 8.3, m: 25.3, span: 4.6, glide: true }, hl: [{ obj: "Ceres", label: "round", place: "left" }, { obj: "Pluto", label: false, delay: 0.3 }] },
    { at: "atmosphere they have", hl: [{ obj: "Mars", label: false }, { obj: "Venus", label: false, delay: 0.2 }, { obj: "Earth", label: "holds an atmosphere", delay: 0.4 }] },
    // the Jupiter turn: the column of super-Jupiters at one size
    { at: "trend stops", cam: G(9.85, 30.9), dur: 2.5, hl: [{ obj: "Jupiter", label: "Jupiter size", place: "left" }, ...BD, { ...COLUMN, delay: 0.6 }] },
    // the split: a little to the left (denser), straight up, then the fork
    { at: "slightly to the left", cam: G(9.85, 31.4, 2.4), dur: 2, hl: [{ obj: "Jupiter", label: false, place: "left" }, ...BD, { ...COLUMN, draw: 0.01 }] },
    { at: "there's a split", cam: { r: 9.9, m: 33.0, span: 3.8 }, dur: 3, drift: 0.02, hl: [{ obj: "L Brown Dwarf", label: false }, ...FORK] },

    // planets into stars (video 3's shots)
    { at: "completely different things", cam: { r: 10.3, m: 31.8, span: 2.6 }, dur: 2,
      hl: [{ obj: "Jupiter", label: "planet", place: "left" }, { obj: "Sun", label: "star", delay: 0.6 }] },
    { at: "for example jupiter", cam: JUPITER_SATURN, hl: [{ obj: "Jupiter" }] },   // Jupiter alone (the author, 2026-11-07: Saturn was lit too)
    // a dive (visual-rules.md §3): Jupiter comes towards the screen as the chart behind it falls back;
    // the infrared photo fades in over the grown planet, holds, fades out, and the dive unwinds
    { at: "half of the energy", cam: { obj: "Jupiter", span: 1.5 }, dur: 2 },
    { at: "half of the energy", photo: "jupiter-ir", obj: "Jupiter", dive: true, dur: 2.6, fadeIn: 1, fadeOut: 1,
      lens: { icon: [0.496, 0.5, 0.465], photo: [1791, 1677, 1651], size: [3600, 3353] },
      caption: "Jupiter in infrared · Gemini North · 2021 · glowing with its own heat" },
    { at: "inside its own core", cam: JUPITER_SATURN, hl: [{ obj: "Jupiter", label: "slowly contracting" }] },
    { at: "generates heat", hl: [{ obj: "Jupiter", label: "its own heat" }] },
    // the dance tips towards gravity (no scoreboard in this video: the author, 2026-11-05)
    { at: ["favours gravity", "favors gravity"], cam: G(9.85, 31.0), hl: [{ obj: "Jupiter", place: "left" }, COLUMN] },
    // the atoms crushed: a diagram on black (the author's design, 2026-11-07): a hydrogen atom, its electron shell a
    // glowing blue circle pushing out, crowded by its neighbours, gravity's red arrows pushing in from the edges; the
    // squeeze goes on until the shells pop, the electrons fly free and the bare nuclei sit closer (src/narr-diagrams.js)
    { at: "so much weight", cam: G(9.85, 31.2), hl: [{ crush: {} }] },
    { at: "stripped of their nuclei", hl: [{ crush: { phase: "pop" }, instant: true }] },
    { at: "sea of electrons", hl: [{ crush: { phase: "sea" }, instant: true }] },
    { at: "squeezed any further", hl: [{ crush: { phase: "hold" }, instant: true }] },
    { at: "just gets denser", hl: [{ obj: "Jupiter", label: "more mass, same size", place: "left" }, COLUMN, ...BD] },
    // brown dwarfs
    { at: "reach brown dwarfs", cam: { r: 9.9, m: 31.35, span: 1.8 }, clear: true,
      hl: [{ obj: "Jupiter", label: "planet", place: "left" }, ...BD, { obj: "L Brown Dwarf", label: "brown dwarfs" }, { obj: "Proxima Cen", label: "star", delay: 0.5 }] },
    { at: "fusing hydrogen", hl: [{ obj: "Jupiter", place: "left" }, ...BD, { obj: "L Brown Dwarf", label: "fuses a little" }] },
    { at: "called deuterium", hl: [...BD, { obj: "L Brown Dwarf", label: "deuterium only" }] },
    // hydrogen and deuterium side by side on black (video 3's clips from the Atom Lab)
    { at: "called deuterium", photo: ["hopf-hydrogen", "hopf-deuterium"], clip: true, row: true, kb: [1, 1], dur: 5.8, fadeIn: 0.6, fadeOut: 0.6,
      labels: ["hydrogen<small>1 proton</small><small>99.997%</small>", "deuterium<small>1 proton + 1 neutron</small><small>0.003%</small>"] },
    // back from the clips on a close-up of the brown dwarf, zooming out slowly (the author, 2026-11-07: the halo sat
    // on empty space here; the brown dwarfs' pictures are forced so there's a star to look at)
    { at: "extra neutron", cam: { obj: "L Brown Dwarf", span: 0.7 }, dur: 1.5, hl: [{ obj: "L Brown Dwarf", label: false }] },
    { at: "deuterium is so rare", cam: { obj: "L Brown Dwarf", span: 1.3, glide: true }, hl: [{ obj: "L Brown Dwarf", label: "1 hydrogen in ~40,000" }] },
    { at: "billions of years", cam: { obj: "L Brown Dwarf", span: 2.4, glide: true }, hl: [...BD, { obj: "L Brown Dwarf", label: "never a star" }, { obj: "Proxima Cen", label: false, delay: 0.8 }] },

    // hydrogen fusion: the strong force, the main sequence
    { at: "little bit more mass", cam: { r: 9.85, m: 32.6, span: 3 }, hl: [{ obj: "L Brown Dwarf", label: false }, { obj: "Proxima Cen", label: "fusion starts", delay: 0.6 }] },
    // fusion: a diagram on black (the author's design, 2026-11-07): bare protons, the strong force a dotted yellow circle
    // with thick arrows pulling in but reaching only that far, the electric push blue and outward, pressure red at the
    // margins; the protons are squeezed until two yellow circles touch and merge, and the energy comes out as a burst
    // of photons that pushes the others apart (src/narr-diagrams.js)
    { at: "the strong force", hl: [{ fuse: {} }] },
    { at: "very limited range", hl: [{ fuse: { phase: "range" }, instant: true }] },
    { at: "squeezing the protons", hl: [{ fuse: { phase: "squeeze" }, instant: true }] },
    { at: "grab them together", hl: [{ fuse: { phase: "merge" }, instant: true }] },
    { at: "it's helium", hl: [{ fuse: { phase: "helium" }, instant: true }] },
    { at: "releases a lot of energy", hl: [{ fuse: { phase: "burst" }, instant: true }] },
    { at: "outward pressure", hl: [{ fuse: { phase: "push" }, instant: true }] },
    { at: "brighter it shines", cam: { r: 10.9, m: 33.1, span: 3.6 }, hl: [{ fuse: { phase: "stars" }, instant: true }] },   // the camera moves behind the diagram
    // the chart is back as the main sequence is named (the author, 2026-11-07: the animation ends when it pushes the stars to the main sequence)
    { at: "called main sequence", hl: [{ obj: "Sun" }, MS, { obj: "Sirius A", delay: 0.4 }] },
    { at: "most of their lives", hl: [MS, { obj: "Sun" }, { obj: "Sirius A", delay: 0.3 }, { obj: "Vega", delay: 0.6 }] },
    // the cap: up the sequence to the heaviest stars, whose light blows their outer layers away
    { at: "also has a limit", cam: TOP, dur: 3, ease: "gentle", hl: [MS, { obj: "Wolf-Rayet", label: false }, { obj: "R136a1", label: false, delay: 0.5 }] },
    { at: "too bright", hl: [MS, { obj: "R136a1", label: "its light pushes out" }] },
    // the dive onto R136a1 (the author, 2026-11-07): the star comes forward, drawn live by the Star Forge, while
    // its outer layers stream away in rings and streaks, pushed off by its own light (the `blow` drawing,
    // src/narration.js, in the layer that doesn't dim with the chart), through "thrown so violently outside…
    // escapes its own gravity well, and it just expands as a cloud"; it unwinds by "where it ends"
    { at: "so violently", cam: { obj: "R136a1", span: 1.4 }, dur: 1.5, hl: [{ obj: "R136a1", label: false }] },
    { at: "so violently", offset: 0.8, dolly: { obj: "R136a1", grow: "fill", size: 0.3, in: 1.6, out: 2 }, dur: 5,
      hl: [{ blow: { obj: "R136a1", size: 0.3 }, label: "its light blows the outer layers away" }] },
    { at: "largest stars", cam: { obj: "R136a1", span: 3 }, dur: 2, hl: [MS, { obj: "R136a1", label: "R136a1 · ~200 Suns, the heaviest known" }] },

    // ── the truce, and how it breaks (video 3's shots, as long-02-middle had them) ──
    { at: "new delicate dance", cam: { r: 10.9, m: 33.1, span: 3.6 }, dur: 2.5, hl: [MS, { obj: "Sun", label: "a truce" }] },
    { at: "between gravity", hl: [MS, { obj: "Sun", label: "gravity pulls in" }] },
    { at: "the strong force", hl: [MS, { obj: "Sun", label: "fusion pushes out" }] },
    { at: "stable equilibrium", hl: [MS, { obj: "Sun", label: "a truce" }] },
    { at: "most of their lives", hl: [MS, { obj: "Sun", label: "billions of years" }, { obj: "Sirius A", delay: 0.3 }, { obj: "Vega", delay: 0.6 }] },
    { at: "once it runs out", hl: [{ line: "mainsequence" }, { obj: "Sun", label: "out of hydrogen" }] },
    // the collapse and swell: two circles, the core staying small while the layers swell and fall back
    { at: "core shrinks", cam: { r: 11.85, m: 33.4, span: 3.6 }, hold: 8, hl: [SWING(2.4), { obj: "Red Giant", label: "red giant", delay: 2 }] },
    { at: "end of the road", hl: [SWING(2.4), { obj: "Red Giant", label: "a star like the Sun stops here" }] },
    { at: "biggest stars will go on", hl: [SWING(1.6), { obj: "Red Giant", label: "carbon, oxygen, silicon…" }] },
    { at: "core is iron", hl: [SWING(1.6), { obj: "Red Giant", label: "an iron core" }] },
    { at: "fire suddenly goes out", hl: [SWING(1.2), { obj: "Red Giant", label: "the fire goes out" }] },
    { at: "split in two", cam: { r: 13.1, m: 33.6, span: 12.5 }, dur: 1.6,
      hl: [{ ...SPLIT, coreLabel: "core", shellLabel: "outer layers" }] },
    // the cycle: over to the nebulae, up to the nurseries, round to the stars again
    { at: "outer layers will keep", cam: NEBULAE, dur: 1.6, hl: [...CYCLE, HIGH, { ...SPLIT, draw: 0.01 }, { obj: "Crab Nebula", label: "supernova remnant", place: "left" }, { obj: "Tycho’s Supernova Remnant", label: false, delay: 0.5 }] },
    { at: ["or nebulae", "or nebulas", "nebulae"], hl: [...CYCLE, { ...SPLIT, draw: 0.01 }, { obj: "Tycho’s Supernova Remnant", label: false }, { obj: "Planetary Nebula", label: "planetary nebula", place: "below" }] },
    { at: "meet others", cam: CYCLE_VIEW, dur: 3.5, ease: "gentle" },
    { at: "stellar nursery", hl: [...CYCLE, { obj: "Crab Nebula", label: false }, { obj: "Planetary Nebula", label: false }, { obj: "Stellar Nursery", label: "stellar nursery", place: "left", delay: 0.2 }] },
    { at: ["protostar", "protostore"], hl: [...CYCLE, { obj: "Stellar Nursery", label: false }, { obj: "Protostar", delay: 0.6 }] },
    { at: "new cycle", cam: { r: 12.6, m: 31.4, span: 13 }, dur: 3, ease: "gentle", hl: [...CYCLE, { obj: "Protostar", label: false }, { obj: "Sun", delay: 0.6 },
      { arrow: true, from: { obj: "Protostar" }, to: { r: PROTOPLANET[0], m: PROTOPLANET[1] }, color: "#ffe9a3", delay: 0.8 }, { mark: PROTOPLANET, label: "protoplanet", place: "left", delay: 1.4 }] },
    { at: "richer materials", hl: [...CYCLE, { obj: "Sun", label: "a third-generation star" }, { arrow: true, from: { obj: "Protostar" }, to: { r: PROTOPLANET[0], m: PROTOPLANET[1] }, color: "#ffe9a3", draw: 0.01 }, { mark: PROTOPLANET, label: "protoplanet", place: "left", instant: true }] },
    { at: "planet full of life", hl: [...CYCLE, { mark: PROTOPLANET, label: "protoplanet", place: "left", instant: true }, { arrow: true, from: { r: PROTOPLANET[0], m: PROTOPLANET[1] }, to: { obj: "Earth" }, color: "#90caf9", solid: true, width: 3 }, { obj: "Earth", label: "a planet with carbon, oxygen, nitrogen…", place: "right", delay: 0.6 }] },
    // the cores
    { at: "the core, however", cam: { r: 8.4, m: 33.6, span: 6 }, clear: true, hl: [{ obj: "Sun" }] },
    { at: "white dwarf", cam: { r: 9.85, m: 33.25, span: 2.6 }, hl: [{ obj: "Sun" }, { arrow: true, from: { obj: "Sun" }, to: { obj: "White Dwarf" }, color: "#90caf9" }, { obj: "White Dwarf", place: "left", delay: 0.6 },
      ...WD_LIMIT(1.2)] },
    { at: "carbon and oxygen", hl: [...WD_LIMIT(0, true), { obj: "White Dwarf", label: "carbon and oxygen", place: "left" }] },
    { at: "does go supernova", hl: [...WD_LIMIT(0, true), { obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: false, delay: 0.4 }] },
    // past the electrons' last stand (the white dwarf limit): the weak force steps in
    { at: "new player force", hl: [...WD_LIMIT(0, true), { obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: false }] },
    // neutron stars and neutrons, the same density: out to both, a whip down the density lines to the
    // hydrogen atom collapsing into a neutron, then the whip back up (video 3's sequence)
    { at: "weak force", offset: 0.3, cam: DENSE_TOP, dur: 2.2, ease: "gentle",
      hl: [...DENSITIES, { obj: "L Brown Dwarf", label: "brown dwarfs", place: "left", delay: 0.8 }, { obj: "PSR J0030+0451", label: "neutron stars", place: "right", delay: 1.2 }, { ...PSR_RING, delay: 1.2 }] },
    { at: "protons and electrons", offset: -0.2, cam: { ...DENSE_BOTTOM, whip: true, overshoot: 0.15 }, dur: 1,
      icons: ["Neutrino (e)"], hideIcons: ["Hydrogen", "Neutron"], labels: false, hl: [...DENSITIES,
      { clip: "hopf-collapse", from: H_AT, to: N_AT, lead: 1.2, move: [1.8, 6.4], size: 150 },
      { text: "1 proton + 1 electron\n= 1 neutron + 1 neutrino", at: [-10.3, -20.3], size: 20, color: "#e9ecf5", delay: 1.4 },
      { obj: "Neutrino (e)", label: false, grow: 1.6 }] },
    { at: "neutrino will be sent", hl: [...DENSITIES,
      { clip: "hopf-collapse", from: H_AT, to: N_AT, lead: 0, move: [0, 0.01], size: 150, instant: true },
      { text: "1 proton + 1 electron\n= 1 neutron + 1 neutrino", at: [-10.3, -20.3], size: 20, color: "#e9ecf5", instant: true },
      { obj: "Neutrino (e)", label: false, grow: 1.6 },
      { fly: { from: N_AT, to: NU_AT }, dur: 1.2, color: "#b3e5fc", label: "neutrino", delay: 0.4 }] },
    { at: "do not repel each other", cam: { ...DENSE_TOP, whip: true, overshoot: 0.15 }, dur: 1, icons: true, hideIcons: [], labels: true,
      hl: [...DENSITIES, { obj: "PSR J0030+0451", label: "neutron star", place: "right" }, PSR_RING,
      { dust: "neutronstar", src: ["neutronstar"], color: "#80deea", sweep: 0.8, delay: 0.8 }] },
    { at: "very big atomic", hl: [...DENSITIES, { obj: "PSR J0030+0451", label: "one giant nucleus", place: "right" }, PSR_RING,
      { dust: "neutronstar", src: ["neutronstar"], color: "#80deea", sweep: 0.01 }] },
    { at: "strong force", hl: [...DENSITIES, { obj: "PSR J0030+0451", label: "held by gravity", place: "right" }, PSR_RING,
      { dust: "neutronstar", src: ["neutronstar"], color: "#80deea", sweep: 0.01 }] },
    { at: "any bigger", hl: [{ path: "stellar-to-bh" }, { line: "tov", label: "neutron star limit · ~2.2–2.3 Suns" }, { obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: false }, { obj: "Stellar BH", label: "black hole", delay: 0.3 }] },
    { at: "collapse into a black hole", offset: 0.6, cam: { obj: "Stellar BH", span: 1.6 }, dur: 1 },
    { at: "collapse into a black hole", offset: 1.4, photo: "m87", obj: "Stellar BH", dive: { in: 1, out: 1 }, dur: 1.2, fadeIn: 0.6, fadeOut: 0.7,
      lens: { icon: [0.5, 0.5, 0.3], photo: [1800, 1800, 700], size: [3600, 3600], fill: "cover", hold: 0.2, fillDur: 1.2 },
      caption: "a black hole · M87* · Event Horizon Telescope · 2019" },
    // (Short only: the line the long cut skips)
    { at: "deserves a video", offset: 1.3, cam: { obj: "Stellar BH", span: 8 }, dur: 2.5, ease: "gentle",
      hl: [{ line: "schwarzschild" }, { obj: "Stellar BH", label: "next: black holes" }] },
    // (Long only: the bridge into the black holes)
    { at: "closer look", cam: { obj: "Stellar BH", span: 5 }, dur: 3, ease: "gentle",
      hl: [{ line: "schwarzschild", label: "black holes" }, { obj: "Stellar BH", label: false }] },
  ],
};
