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
const GRAVITY = [force(9.6, 1, "#ffab40"), force(7.8, 1, "#ffab40"), { text: "gravity\npushes in", at: [ON_LINE(8.7) + 4.6, 8.7], size: 26, color: "#ffab40" }];
const EM = [force(9.6, -1, "#4fc3f7"), force(7.8, -1, "#4fc3f7"), { text: "electromagnetism\npushes out", at: [ON_LINE(8.7) - 3.6, 8.7], size: 26, color: "#4fc3f7" }];
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
  forceIcons: ["Sun"],
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
    { at: "how do they die", hl: [{ obj: "Stellar Nursery", label: false }, { obj: "Red Giant", label: "red giant" }, { obj: "Supernova Remnant", delay: 0.4 }] },
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

    // the tug of war along the density line
    { at: "delicate dance", cam: { r: 2, m: 7, span: 4.6 }, dur: 2.5, clear: true, hl: [WATER] },
    { at: "gravity wants", hl: [WATER, ...GRAVITY] },
    { at: "electromagnetism", cam: { r: 2.3, m: 7.6, span: 4.6, glide: true }, hl: [WATER, ...GRAVITY.map(still), ...EM] },
    { at: "result of that tug of war", cam: { r: 2.6, m: 8.4, span: 4.6, glide: true }, hl: [{ line: "water", label: "the diagonal" }, ...GRAVITY.map(still), ...EM.map(still)] },
    // too big: a circle right of the line, pushed back to it; too compact: left of it, pushed back the other way
    { at: "under its own weight", cam: { r: 3.2, m: 10.4, span: 4.6, glide: true }, clear: true, hl: [WATER, { ellipse: [ON_LINE(10.4) + 1.7, 10.4, 0.8, 0.8], rot: 0, label: false, color: "#ffab40" },
      { arrow: true, solid: true, width: 4, color: "#ffab40", from: { r: ON_LINE(10.4) + 1.7, m: 10.4 }, to: { r: ON_LINE(10.4) + 0.1, m: 10.4 }, delay: 0.4 },
      { text: "crushes under\nits own weight", at: [ON_LINE(10.4) + 4.2, 10.4], size: 26, color: "#ffab40", delay: 0.5 }] },
    { at: "push it away", cam: { r: 3.4, m: 11, span: 4.6, glide: true }, clear: true, hl: [WATER, { ellipse: [ON_LINE(11) - 1.7, 11, 0.8, 0.8], rot: 0, label: false, color: "#4fc3f7" },
      { arrow: true, solid: true, width: 4, color: "#4fc3f7", from: { r: ON_LINE(11) - 1.7, m: 11 }, to: { r: ON_LINE(11) - 0.1, m: 11 }, delay: 0.4 },
      { text: "its atoms\npush back", at: [ON_LINE(11) - 4.2, 11], size: 26, color: "#4fc3f7", delay: 0.5 }] },
    // the pan up the line, the smallest life to the giant planets
    { at: "smallest form of life", cam: { obj: "Bacterium", span: 4 }, dur: 2, clear: true, hl: [WATER, { obj: "Bacterium", label: "a bacterium" }] },
    { at: "larger planets", cam: { obj: "Jupiter", span: 4 }, dur: 4.5, ease: "gentle", hl: [WATER, { obj: "Jupiter", delay: 3 }] },
    { at: "planets to be round", cam: { r: 8.3, m: 25.3, span: 4.6 }, dur: 2.5, hl: [{ obj: "Ceres", label: "round", place: "left" }, { obj: "Pluto", label: false, delay: 0.3 }] },
    { at: "atmosphere they have", hl: [{ obj: "Mars", label: false }, { obj: "Venus", label: false, delay: 0.2 }, { obj: "Earth", label: "holds an atmosphere", delay: 0.4 }] },
    // the Jupiter turn: the column of super-Jupiters at one size
    { at: "trend stops", cam: G(9.85, 30.9), dur: 2.5, hl: [{ obj: "Jupiter", label: "Jupiter size", place: "left" }, ...BD, { ...COLUMN, delay: 0.6 }] },
    // the split: a little to the left (denser), straight up, then the fork
    { at: "slightly to the left", cam: G(9.85, 31.4, 2.4), dur: 2, hl: [{ obj: "Jupiter", label: false, place: "left" }, ...BD, { ...COLUMN, draw: 0.01 }] },
    { at: "there's a split", cam: { r: 9.9, m: 33.0, span: 3.8 }, dur: 3, drift: 0.02, hl: [{ obj: "L Brown Dwarf", label: false }, ...FORK] },

    // planets into stars (video 3's shots)
    { at: "completely different things", cam: { r: 10.3, m: 31.8, span: 2.6 }, dur: 2,
      hl: [{ obj: "Jupiter", label: "planet", place: "left" }, { obj: "Sun", label: "star", delay: 0.6 }] },
    { at: "for example jupiter", cam: JUPITER_SATURN, hl: [{ obj: "Jupiter" }, { obj: "Saturn", label: false, delay: 0.3 }] },
    // a dive (visual-rules.md §3): Jupiter comes towards the screen as the chart behind it falls back;
    // the infrared photo fades in over the grown planet, holds, fades out, and the dive unwinds
    { at: "half of the energy", cam: { obj: "Jupiter", span: 1.5 }, dur: 2 },
    { at: "half of the energy", photo: "jupiter-ir", obj: "Jupiter", dive: true, dur: 2.6, fadeIn: 1, fadeOut: 1,
      lens: { icon: [0.496, 0.5, 0.465], photo: [1791, 1677, 1651], size: [3600, 3353] },
      caption: "Jupiter in infrared · Gemini North · 2021 · glowing with its own heat" },
    { at: "inside its own core", cam: JUPITER_SATURN, hl: [{ obj: "Saturn", label: false }, { obj: "Jupiter", label: "slowly contracting" }] },
    { at: "generates heat", hl: [{ obj: "Saturn", label: false }, { obj: "Jupiter", label: "its own heat" }] },
    // the dance tips towards gravity (no scoreboard in this video: the author, 2026-11-05)
    { at: ["favours gravity", "favors gravity"], cam: G(9.85, 31.0), hl: [{ obj: "Jupiter", place: "left" }, COLUMN] },
    { at: "atoms themselves are crushed", cam: G(9.85, 31.2), hl: [{ obj: "Jupiter", label: "the atom crushed", place: "left" }, { ...COLUMN, draw: 0.01 }, ...BD] },
    { at: "sea of electrons", hl: [{ obj: "Jupiter", label: "bare nuclei, free electrons", place: "left" }, { ...COLUMN, draw: 0.01 }, ...BD] },
    { at: "squeezed any further", hl: [{ obj: "Jupiter", label: "the electrons hold it up", place: "left" }, { ...COLUMN, draw: 0.01 }, ...BD] },
    { at: "just gets denser", hl: [{ obj: "Jupiter", label: "more mass, same size", place: "left" }, COLUMN, ...BD] },
    // brown dwarfs
    { at: "reach brown dwarfs", cam: { r: 9.9, m: 31.35, span: 1.8 }, clear: true,
      hl: [{ obj: "Jupiter", label: "planet", place: "left" }, ...BD, { obj: "L Brown Dwarf", label: "brown dwarfs" }, { obj: "Proxima Cen", label: "star", delay: 0.5 }] },
    { at: "fusing hydrogen", hl: [{ obj: "Jupiter", place: "left" }, ...BD, { obj: "L Brown Dwarf", label: "fuses a little" }] },
    { at: "called deuterium", hl: [...BD, { obj: "L Brown Dwarf", label: "deuterium only" }] },
    // hydrogen and deuterium side by side on black (video 3's clips from the Atom Lab)
    { at: "called deuterium", photo: ["hopf-hydrogen", "hopf-deuterium"], clip: true, row: true, kb: [1, 1], dur: 5.8, fadeIn: 0.6, fadeOut: 0.6,
      labels: ["hydrogen<small>1 proton</small><small>99.997%</small>", "deuterium<small>1 proton + 1 neutron</small><small>0.003%</small>"] },
    { at: "deuterium is so rare", hl: [...BD, { obj: "L Brown Dwarf", label: "1 hydrogen in ~40,000" }] },
    { at: "billions of years", hl: [...BD, { obj: "L Brown Dwarf", label: "never a star" }, { obj: "Proxima Cen", label: false }] },

    // hydrogen fusion: the strong force, the main sequence
    { at: "little bit more mass", cam: { r: 9.85, m: 32.6, span: 3 }, hl: [{ obj: "L Brown Dwarf", label: false }, { obj: "Proxima Cen", label: "fusion starts", delay: 0.6 }] },
    { at: "the strong force", hl: [{ obj: "L Brown Dwarf", label: false }, { obj: "Proxima Cen", label: "the strong force" }] },
    { at: "very limited range", hl: [{ obj: "L Brown Dwarf", label: false }, { obj: "Proxima Cen", label: "reaches only its neighbours" }] },
    { at: "grab them together", hl: [{ obj: "L Brown Dwarf", label: false }, { obj: "Proxima Cen", label: "protons grabbed" }] },
    { at: "it's helium", hl: [{ obj: "L Brown Dwarf", label: false }, { obj: "Proxima Cen", label: "hydrogen → helium" }] },
    { at: "outward pressure", hl: [{ obj: "Proxima Cen", place: "left" }, { arrow: true, from: { obj: "Proxima Cen" }, to: { obj: "Sun" } }, { obj: "Sun", delay: 0.8 }] },
    { at: "brighter it shines", cam: { r: 10.9, m: 33.1, span: 3.6 }, hl: [{ obj: "Proxima Cen", label: false }, { obj: "Sun" }, { obj: "Sirius A", delay: 0.4 }] },
    { at: "called main sequence", hl: [{ obj: "Sun" }, MS] },
    { at: "most of their lives", hl: [MS, { obj: "Sun" }, { obj: "Sirius A", delay: 0.3 }, { obj: "Vega", delay: 0.6 }] },
    // the cap: up the sequence to the heaviest stars, whose light blows their outer layers away
    { at: "also has a limit", cam: TOP, dur: 3, ease: "gentle", hl: [MS, { obj: "Wolf-Rayet", label: false }, { obj: "R136a1", label: false, delay: 0.5 }] },
    { at: "too bright", hl: [MS, { obj: "R136a1", label: "its light pushes out" }] },
    { at: "so violently", hl: [{ line: "mainsequence" }, { obj: "R136a1", label: false },
      { arrow: true, from: { obj: "R136a1" }, to: { r: 13.1, m: 35.4 }, solid: true, width: 3, color: "#ffe9a3" }] },
    { at: "expands as a cloud", hl: [{ line: "mainsequence" }, { obj: "R136a1", label: false },
      { arrow: true, from: { obj: "R136a1" }, to: { r: 13.1, m: 35.4 }, solid: true, width: 3, color: "#ffe9a3", draw: 0.01 }, { obj: "Wolf-Rayet", label: "its winds blow the layers off", delay: 0.3 }] },
    { at: "largest stars", hl: [MS, { obj: "R136a1", label: "R136a1 · ~200 Suns, the heaviest known" }, { obj: "Wolf-Rayet", label: false }] },

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
    { at: "outer layers will keep", cam: NEBULAE, dur: 1.6, hl: [...CYCLE, HIGH, { ...SPLIT, draw: 0.01 }, { obj: "Supernova Remnant", label: "supernova remnant", place: "left" }] },
    { at: ["or nebulae", "or nebulas", "nebulae"], hl: [...CYCLE, { ...SPLIT, draw: 0.01 }, { obj: "Planetary Nebula", label: "planetary nebula", place: "below" }] },
    { at: "meet others", cam: CYCLE_VIEW, dur: 3.5, ease: "gentle" },
    { at: "stellar nursery", hl: [...CYCLE, { obj: "Supernova Remnant", label: false }, { obj: "Planetary Nebula", label: false }, { obj: "Stellar Nursery", label: "stellar nursery", place: "left", delay: 0.2 }] },
    { at: ["protostar", "protostore"], hl: [...CYCLE, { obj: "Stellar Nursery", label: false }, { obj: "Protostar", delay: 0.6 }] },
    { at: "new cycle", cam: { r: 12.6, m: 31.4, span: 13 }, dur: 3, ease: "gentle", hl: [...CYCLE, { obj: "Protostar", label: false }, { obj: "Sun", delay: 0.6 },
      { arrow: true, from: { obj: "Protostar" }, to: { r: PROTOPLANET[0], m: PROTOPLANET[1] }, color: "#ffe9a3", delay: 0.8 }, { mark: PROTOPLANET, label: "protoplanet", place: "left", delay: 1.4 }] },
    { at: "richer materials", hl: [...CYCLE, { obj: "Sun", label: "a third-generation star" }, { arrow: true, from: { obj: "Protostar" }, to: { r: PROTOPLANET[0], m: PROTOPLANET[1] }, color: "#ffe9a3", draw: 0.01 }, { mark: PROTOPLANET, label: "protoplanet", place: "left", instant: true }] },
    { at: "planet full of life", hl: [...CYCLE, { mark: PROTOPLANET, label: "protoplanet", place: "left", instant: true }, { arrow: true, from: { r: PROTOPLANET[0], m: PROTOPLANET[1] }, to: { obj: "Earth" }, color: "#90caf9", solid: true, width: 3 }, { obj: "Earth", label: "a planet with metals", place: "right", delay: 0.6 }] },
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
    { at: "deserves a video", offset: 1.3, cam: { r: 9, m: 36.5, span: 22 }, dur: 2.5,
      hl: [{ line: "schwarzschild" }, { obj: "Stellar BH", label: "next: black holes" }] },
    // (Long only: the bridge into the black holes)
    { at: "closer look", cam: { r: 9, m: 36.5, span: 22 }, dur: 2.5,
      hl: [{ line: "schwarzschild", label: "black holes" }, { obj: "Stellar BH", label: false }] },
  ],
};
