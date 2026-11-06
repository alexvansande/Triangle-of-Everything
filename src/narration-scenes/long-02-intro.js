// =============================================================
// Scene: long-02-intro — the opening of long video 2 (space), the author's one-take recording of
// 2026-11-05 (rec54; video/long-02-intro/): the video's questions, whipped through on the chart;
// the chart and its three limits; the hand-over from long video 1 (humans to brown dwarfs); the
// balance of gravity and electromagnetism along the density line; the Jupiter turn and the split;
// then the start of the stars' story (Jupiter's heat, electrons stripped, brown dwarfs and deuterium,
// hydrogen fusion and the main sequence, the light-pressure cap on the biggest stars). The cut
// (video/cuts/long-02-space.json) goes on with video 3's take from "as the fuel for fusion is used up".
// The shots on the planets and stars are video 3's and long video 1's, so the pictures match.
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
const GRAVITY = [force(9, 1, "#ffab40"), force(6.6, 1, "#ffab40"), { text: "gravity\npushes in", at: [ON_LINE(7.8) + 4.6, 7.8], size: 26, color: "#ffab40" }];
const EM = [force(9, -1, "#4fc3f7"), force(6.6, -1, "#4fc3f7"), { text: "electromagnetism\npushes out", at: [ON_LINE(7.8) - 4.8, 7.8], size: 26, color: "#4fc3f7" }];
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

export default {
  title: "Space: the opening",
  blurb: "The questions, the chart and its limits, the balance of forces up the line, and planets into stars.",
  start: { r: 10.6, m: 32.4, span: 8 },
  // galaxies and up 60% of their size, Laniakea a good deal less: it hid everything around it (the author, 2026-11-05)
  iconBoost: { from: 21.2, k: 0.6, slugs: { "laniakea-galaxy-supercluster": 0.55 } },
  captionFixes: { shard: "chart", math: "mass", tense: "tension", favors: "favours" },

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md): video 3's, so the join into it carries on
  backing: "Immersed",
  sound: [
    { at: "actually fuse hydrogen", fx: "ignite", offset: 0.4 },
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
    { at: "just black holes", cam: { r: -8.6, m: 19.4, span: 12, whip: true }, hl: [{ line: "schwarzschild" }, PBH] },
    { at: "dark matter", cam: { r: 23, m: 45, span: 10, whip: true }, hl: [{ line: "darkmatter", label: "dark matter" }, { obj: "Milky Way", label: false }] },
    { at: "how far does our universe", cam: { r: 27.3, m: 55, span: 12, whip: true }, hl: [{ line: "hubble", label: "the Hubble sphere" }, { obj: "Observable Universe", delay: 0.4 }] },

    // the chart: the whole triangle, its rulers, its three sides
    { at: "surprisingly useful tool", cam: MAP, dur: 4, ease: "gentle", clear: true },
    { at: "single chart", hl: [{ line: "triangle", delay: 0.4 }] },
    { at: "log plot of", units: true, hl: [{ line: "triangle", draw: 0.01 }] },
    { at: "contains limits", units: false, hl: [{ line: "triangle", draw: 0.01 }] },
    { at: "relativity", hl: [RELATIVITY] },
    { at: "quantum mechanics", hl: [RELATIVITY, QUANTUM] },
    { at: "size of the universe", hl: [RELATIVITY, QUANTUM, UNIVERSE] },
    { at: "three sides", hl: [{ ...RELATIVITY, draw: 0.01 }, { ...QUANTUM, draw: 0.01 }, { ...UNIVERSE, draw: 0.01 }, { line: "triangle" }] },

    // the hand-over from long video 1: humans up to the brown dwarfs, then the upper part of the triangle
    { at: "from humans", cam: { obj: "Human", span: 5 }, dur: 2.2, clear: true, hl: [{ obj: "Human" }] },
    { at: "to brown dwarfs", cam: { obj: "L Brown Dwarf", span: 5 }, dur: 3.5, ease: "gentle", hl: [{ obj: "L Brown Dwarf", label: "brown dwarfs" }] },
    { at: "upper part of the triangle", cam: { r: 15, m: 40, span: 32 }, dur: 3.5, ease: "gentle", clear: true },

    // the balance of forces along the density line
    { at: "plot everything by mass", cam: { r: 5, m: 15, span: 34 }, dur: 3, hl: [{ line: "water", label: "the diagonal" }] },
    { at: "gravity, for example", cam: { r: 2, m: 7, span: 4.6 }, dur: 2.5, clear: true, hl: [WATER, ...GRAVITY] },
    { at: "electromagnetism wants", cam: { r: 2.3, m: 7.6, span: 4.6, glide: true }, hl: [WATER, ...GRAVITY.map(still), ...EM] },
    { at: "equilibrium point", cam: { r: 2.6, m: 8.4, span: 4.6, glide: true }, hl: [{ line: "water", label: "the diagonal" }, ...GRAVITY.map(still), ...EM.map(still)] },
    { at: "density of atoms", cam: { r: 3, m: 9.5, span: 4.6, glide: true }, clear: true, hl: [{ line: "water", label: "the density of atoms" }] },
    // too compact: a circle left of the line, pushed back to it; too big: right of it, pushed back the other way
    { at: "electrons will push it out", cam: { r: 3.2, m: 10.4, span: 4.6, glide: true }, clear: true, hl: [WATER, { ellipse: [ON_LINE(10.4) - 1.7, 10.4, 0.8, 0.8], rot: 0, label: false, color: "#4fc3f7" },
      { arrow: true, solid: true, width: 4, color: "#4fc3f7", from: { r: ON_LINE(10.4) - 1.7, m: 10.4 }, to: { r: ON_LINE(10.4) - 0.1, m: 10.4 }, delay: 0.4 },
      { text: "electrons repel\neach other", at: [ON_LINE(10.4) - 4.2, 10.4], size: 26, color: "#4fc3f7", delay: 0.5 }] },
    { at: "collapse in its own weight", cam: { r: 3.4, m: 11, span: 4.6, glide: true }, clear: true, hl: [WATER, { ellipse: [ON_LINE(11) + 1.7, 11, 0.8, 0.8], rot: 0, label: false, color: "#ffab40" },
      { arrow: true, solid: true, width: 4, color: "#ffab40", from: { r: ON_LINE(11) + 1.7, m: 11 }, to: { r: ON_LINE(11) + 0.1, m: 11 }, delay: 0.4 },
      { text: "crushes under\nits own weight", at: [ON_LINE(11) + 4.2, 11], size: 26, color: "#ffab40", delay: 0.5 }] },
    // the pan up the line, the smallest life to the giant planets
    { at: "smallest form of life", cam: { obj: "Bacterium", span: 4 }, dur: 2, clear: true, hl: [WATER, { obj: "Bacterium", label: "a bacterium" }] },
    { at: "larger planets", cam: { obj: "Jupiter", span: 4 }, dur: 4.5, ease: "gentle", hl: [WATER, { obj: "Jupiter", delay: 3 }] },
    { at: "planets to be round", cam: { r: 8.3, m: 25.3, span: 4.6 }, dur: 2.5, hl: [{ obj: "Ceres", label: "round", place: "left" }, { obj: "Pluto", label: false, delay: 0.3 }] },
    { at: "atmosphere they have", hl: [{ obj: "Mars", label: false }, { obj: "Venus", label: false, delay: 0.2 }, { obj: "Earth", label: "holds an atmosphere", delay: 0.4 }] },
    // the Jupiter turn: the column of super-Jupiters at one size
    { at: "trend stops", cam: G(9.85, 30.9), dur: 2.5, hl: [{ obj: "Jupiter", label: "Jupiter size", place: "left" }, ...BD, { ...COLUMN, delay: 0.6 }] },
    // the split
    { at: "straight up and then they split", cam: { r: 9.9, m: 33.0, span: 3.8 }, dur: 3, drift: 0.02, hl: [{ obj: "L Brown Dwarf", label: false }, ...FORK] },

    // planets into stars (video 3's shots)
    { at: "completely different things", cam: { r: 10.3, m: 31.8, span: 2.6 }, dur: 2,
      hl: [{ obj: "Jupiter", label: "planet", place: "left" }, { obj: "Sun", label: "star", delay: 0.6 }] },
    { at: "saturn and jupiter", cam: JUPITER_SATURN, hl: [{ obj: "Jupiter" }, { obj: "Saturn", place: "left", delay: 0.3 }] },
    // a dive (visual-rules.md §3): Jupiter comes towards the screen as the chart behind it falls back;
    // the infrared photo fades in over the grown planet, holds, fades out, and the dive unwinds
    { at: "more heat than they receive", cam: { obj: "Jupiter", span: 1.5 }, dur: 2 },
    { at: "more heat than they receive", photo: "jupiter-ir", obj: "Jupiter", dive: true, dur: 2.6, fadeIn: 1, fadeOut: 1,
      lens: { icon: [0.496, 0.5, 0.465], photo: [1791, 1677, 1651], size: [3600, 3353] },
      caption: "Jupiter in infrared · Gemini North · 2021 · glowing with its own heat" },
    { at: "inside their cores", cam: JUPITER_SATURN, hl: [{ obj: "Saturn", place: "left" }, { obj: "Jupiter", label: "slowly contracting" }] },
    // the dance tips towards gravity (no scoreboard in this video: the author, 2026-11-05)
    { at: ["favours gravity", "favors gravity"], cam: G(9.85, 31.0), hl: [{ obj: "Jupiter", place: "left" }, COLUMN] },
    { at: "inward force", cam: G(9.85, 31.2), hl: [{ obj: "Jupiter", label: "the atom crushed", place: "left" }, { ...COLUMN, draw: 0.01 }, ...BD] },
    { at: "sea of electrons", hl: [{ obj: "Jupiter", label: "bare nuclei, free electrons", place: "left" }, { ...COLUMN, draw: 0.01 }, ...BD] },
    // brown dwarfs
    { at: "reach brown dwarfs", cam: { r: 9.9, m: 31.35, span: 1.8 }, clear: true,
      hl: [{ obj: "Jupiter", label: "planet", place: "left" }, ...BD, { obj: "L Brown Dwarf", label: "brown dwarfs" }, { obj: "Proxima Cen", label: "star", delay: 0.5 }] },
    { at: "fuses hydrogen together", hl: [{ obj: "Jupiter", place: "left" }, ...BD, { obj: "L Brown Dwarf", label: "fuses a little" }] },
    { at: "called deuterium", hl: [...BD, { obj: "L Brown Dwarf", label: "deuterium only" }] },
    // hydrogen and deuterium side by side on black (video 3's clips from the Atom Lab)
    { at: "called deuterium", photo: ["hopf-hydrogen", "hopf-deuterium"], clip: true, row: true, kb: [1, 1], dur: 5.8, fadeIn: 0.6, fadeOut: 0.6,
      labels: ["hydrogen<small>1 proton</small><small>99.997%</small>", "deuterium<small>1 proton + 1 neutron</small><small>0.003%</small>"] },
    { at: "deuterium is so rare", hl: [...BD, { obj: "L Brown Dwarf", label: "1 hydrogen in ~40,000" }] },
    { at: "billions of years", hl: [...BD, { obj: "L Brown Dwarf", label: "never a star" }, { obj: "Proxima Cen", label: false }] },

    // hydrogen fusion: the main sequence
    { at: "little bit more mass", cam: { r: 9.85, m: 32.6, span: 3 }, hl: [{ obj: "L Brown Dwarf", label: false }, { obj: "Proxima Cen", label: "fusion starts", delay: 0.6 }] },
    { at: "outward pressure", hl: [{ obj: "Proxima Cen", place: "left" }, { arrow: true, from: { obj: "Proxima Cen" }, to: { obj: "Sun" } }, { obj: "Sun", delay: 0.8 }] },
    { at: "called the main sequence", cam: { r: 10.9, m: 33.1, span: 3.6 }, hl: [{ obj: "Sun" }, MS] },
    { at: "most of their lives", hl: [MS, { obj: "Sun" }, { obj: "Sirius A", delay: 0.3 }, { obj: "Vega", delay: 0.6 }] },
    // the cap: up the sequence to the heaviest stars, whose light blows their outer layers away
    { at: "also has a limit", cam: TOP, dur: 3, ease: "gentle", hl: [MS, { obj: "Wolf-Rayet", label: false }, { obj: "R136a1", label: false, delay: 0.5 }] },
    { at: "light itself has pressure", hl: [MS, { obj: "R136a1", label: "its light pushes out" }] },
    { at: "thrown away", hl: [{ line: "mainsequence" }, { obj: "R136a1", label: false },
      { arrow: true, from: { obj: "R136a1" }, to: { r: 13.1, m: 35.4 }, solid: true, width: 3, color: "#ffe9a3" }] },
    { at: "largest stars live", hl: [MS, { obj: "R136a1", label: "R136a1 · ~200 Suns, the heaviest known" }, { obj: "Wolf-Rayet", label: false }] },
  ],
};
