// =============================================================
// Scene: short-03-stars — planets and stars differ by mass: Jupiter's own
// heat, brown dwarfs and deuterium, the fork after them, the main sequence,
// the life of a star, the nebulae that make new stars, and what the core
// becomes. Recorded 2026-10-27 (rec36; video/short-03-stars/).
// =============================================================
// Field reference: docs/narration.md, "Scene fields".

// a dying star splitting in two: the core to the white dwarfs, the outer layers to the nebulae
const SPLIT = { split: { from: { obj: "Red Giant" }, core: { obj: "White Dwarf" }, shell: { obj: "Planetary Nebula" } } };
const BD = [{ obj: "Y Brown Dwarf", label: false }, { obj: "T Brown Dwarf", label: false }];
// the chart's own star-life paths, lit (narration.js drawPath: `from`/`to` keep the stretch
// between two objects): the low-mass life (nursery → protostar → Sun → red giant → nebula →
// white dwarf), the high-mass one (… supergiant → supernova → neutron star), the core to a black hole
const LOW = { path: "stellar-low-mass" }, HIGH = { path: "stellar-high-mass" };
// the cycle, lit from the split on (not during the collapse and swell: the author, 2026-10-29):
// star → red giant → nebula and dense core, nebula → nursery → protostar → star
const CYCLE = [LOW, { path: ["nebula-to-nursery", "remnant-to-nursery"] }];
// the nebulae (planetary nebula, supernova remnant, Bubble Nebula) and the whole cycle above them
const NEBULAE = { r: 18.0, m: 33.6, span: 5 };
const CYCLE_VIEW = { r: 16.95, m: 34.5, span: 7.8 };
// the white dwarf limit (Chandrasekhar, 1.44 Suns): one line, named once and kept, with a guide
// out to the mass ruler (the author, 2026-10-29: it blinked from one label to another)
const WD_LIMIT = (delay = 0, kept = false) => [{ line: "chandrasekhar", label: "white dwarf upper limit", delay, ...(kept ? { draw: 0.01 } : {}) },
  { cross: { r: 9.7, m: 33.46 }, mass: "1.44 solar masses", size: false, color: "#90caf9", delay: delay + 0.4 }];
// a ring on one real neutron star, the pulsar PSR J0030+0451 (its own dot is tiny)
const PSR_RING = { mark: [6.1, 33.45], color: "#80deea" };
const FORK = [
  { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f" },
  // the left branch is not where brown dwarfs go: white dwarfs are the cores of dead stars (end of the video)
  { obj: "White Dwarf", label: "dead stars' cores", place: "right", delay: 0.8 },
];

export default {
  title: "Planets into stars",
  blurb: "Brown dwarfs, the main sequence, the life of a star, and what is left of it.",
  start: { r: 10.4, m: 31.6, span: 6 },

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md)
  backing: "Immersed",
  sound: [
    { at: "fuse ordinary hydrogen", fx: "ignite", offset: 0.4 },
    { at: "fuel for fusion is used up", music: "heartbeat", to: "split in two", stop: "cut" },
    { at: "split in two", fx: "boom", offset: 0.1 },
    { at: "collapse into a black hole", fx: "drop", atEnd: true, offset: -0.4 },
  ],

  cues: [
    { at: "completely different things", cam: { r: 10.3, m: 31.8, span: 2.6 },
      hl: [{ obj: "Jupiter", label: "planet", place: "left" }, { obj: "Sun", label: "star", delay: 0.6 }] },

    // Jupiter and Saturn make their own heat
    { at: "jupiter and saturn", cam: { r: 9.8, m: 30.05, span: 1.5 }, hl: [{ obj: "Jupiter" }, { obj: "Saturn", place: "left", delay: 0.3 }] },
    // a dive (visual-rules.md §3): Jupiter comes towards the screen as the chart behind
    // it falls back into a dark mist; the infrared photo fades in right over the grown
    // planet (lens, discs matched), holds, fades out, and the dive slowly unwinds
    { at: "more heat than they get", cam: { obj: "Jupiter", span: 1.5 }, dur: 2 },
    { at: "more heat than they get", photo: "jupiter-ir", obj: "Jupiter", dive: true, dur: 2.6, fadeIn: 1, fadeOut: 1,
      lens: { icon: [0.496, 0.5, 0.465], photo: [1791, 1677, 1651], size: [3600, 3353] },
      caption: "Jupiter in infrared · Gemini North · 2021 · glowing with its own heat" },
    { at: "squeezing their cores", cam: { r: 9.8, m: 30.05, span: 1.5 },
      hl: [{ obj: "Saturn", place: "left" }, { obj: "Jupiter", label: "slowly contracting" }] },
    { at: "as mass grows", cam: { r: 9.85, m: 30.9, span: 1.7 },
      hl: [{ obj: "Jupiter", place: "left" }, { obj: "Y Brown Dwarf", label: false, delay: 0.4 }, { obj: "T Brown Dwarf", label: false, delay: 0.8 }] },

    // brown dwarfs: deuterium only
    { at: "become brown dwarfs", hl: [{ obj: "Jupiter", place: "left" }, ...BD, { obj: "L Brown Dwarf", label: "brown dwarfs" }] },
    { at: "brown dwarfs are really", cam: { r: 9.9, m: 31.35, span: 1.8 },
      hl: [{ obj: "Jupiter", label: "planet", place: "left" }, { obj: "L Brown Dwarf", label: "brown dwarf" }, { obj: "Proxima Cen", label: "star", delay: 0.5 }] },
    { at: "massive enough to fuse", hl: [{ obj: "Jupiter", place: "left" }, ...BD, { obj: "L Brown Dwarf", label: "fuses a little" }] },
    { at: "called deuterium", hl: [...BD, { obj: "L Brown Dwarf", label: "deuterium only" }] },
    // hydrogen and deuterium side by side on black, named underneath (the author, 2026-10-29): the
    // Atom Lab's Hydrogen 1s and Deuterium 3p looks (public/atom-lab.html, branch claude/hopf-atoms)
    // (live: 8 s clips recorded from the lab frame by frame on a stepped clock, turning and flowing at
    // the presets' own rates, the background crushed to pure black)
    { at: "called deuterium", photo: ["hopf-hydrogen", "hopf-deuterium"], clip: true, row: true, kb: [1, 1], dur: 5.8, fadeIn: 0.6, fadeOut: 0.6,
      // how much of the universe's hydrogen each is: deuterium ~2.5 in 100,000 (D/H, primordial;
      // "1 in ~40,000", as the next cue says); on Earth's water it's ~0.016%
      labels: ["hydrogen<small>1 proton</small><small>99.997%</small>", "deuterium<small>1 proton + 1 neutron</small><small>0.003%</small>"] },
    { at: "deuterium is so rare", hl: [...BD, { obj: "L Brown Dwarf", label: "1 hydrogen in ~40,000" }] },
    { at: "shining on like stars", hl: [...BD, { obj: "L Brown Dwarf", label: "never a star" }, { obj: "Proxima Cen", label: false }] },

    // the fork: stars to the right, white dwarfs to the left
    { at: "a little bit more mass", cam: { r: 9.85, m: 32.6, span: 3 }, hl: [{ obj: "L Brown Dwarf", label: false }] },
    { at: "the split you see", cam: { r: 9.9, m: 33.0, span: 3.8 }, dur: 3, drift: 0.02, hl: [{ obj: "L Brown Dwarf", label: false }, ...FORK] },

    // fusion turns on: the main sequence
    { at: "pressure in the core is high", cam: { r: 10.4, m: 32.8, span: 1.9 }, clear: true, hl: [{ obj: "Proxima Cen", label: "fusion starts" }] },
    { at: "making it bigger", hl: [{ obj: "Proxima Cen", place: "left" }, { arrow: true, from: { obj: "Proxima Cen" }, to: { obj: "Sun" } }, { obj: "Sun", delay: 0.8 }] },
    { at: "other diagonal line", cam: { r: 10.9, m: 33.1, span: 3.6 }, hl: [{ obj: "Sun" }, { line: "mainsequence", label: "main sequence" }] },
    { at: "where stars spend", hl: [{ line: "mainsequence", label: "main sequence" }, { obj: "Sun" }, { obj: "Sirius A", delay: 0.3 }, { obj: "Vega", delay: 0.6 }] },
    { at: "hydrogen runs out", hl: [{ line: "mainsequence" }, { obj: "Sun", label: "out of hydrogen" }] },

    // the end of a star: collapse, expand, split
    // two circles: the core stays small while the outer layers swell and fall back, the
    // star moving along the chart as it does; then the split: core left, layers right
    { at: "the star collapses", cam: { r: 11.85, m: 33.4, span: 3.6 }, hold: 8,
      hl: [{ swing: [{ obj: "Sun" }, { obj: "Red Giant" }], period: 2.4, core: true }, { obj: "Red Giant", label: "red giant", delay: 1 }] },
    { at: "split in two", cam: { r: 13.1, m: 33.6, span: 12.5 }, dur: 1.6,
      hl: [{ ...SPLIT, coreLabel: "core", shellLabel: "outer layers" }] },
    // the camera follows the words (the author, 2026-10-29): over to the nebulae as the layers are
    // blown away, quickly across to the dense cores, back to the nebulae, then slowly up to the
    // nurseries, with the whole cycle (protostars, nurseries, supernovae) in the frame
    { at: "blown away", cam: NEBULAE, dur: 1.6, hl: [...CYCLE, HIGH, { ...SPLIT, draw: 0.01 }, { obj: "Supernova Remnant", label: "supernova remnant", place: "left" }] },
    { at: "planetary nebula", hl: [...CYCLE, { ...SPLIT, draw: 0.01 }, { obj: "Planetary Nebula", label: "planetary nebula", place: "below" }] },
    { at: "inner core", cam: { r: 7.6, m: 33.4, span: 5 }, dur: 1,
      hl: [...CYCLE, HIGH, { obj: "Red Giant", label: false }, { obj: "White Dwarf", label: "dense core", place: "right", delay: 0.4 }, { obj: "PSR J0030+0451", label: false, delay: 0.7 }] },

    // the gas goes round again: stellar nurseries
    { at: ["supernova and nebulae", "nebulae spread out"], cam: NEBULAE, dur: 1.2,
      hl: [...CYCLE, { obj: "Supernova Remnant", label: false }, { obj: "Planetary Nebula", label: false }, { obj: "Bubble Nebula", label: false, delay: 0.4 }] },
    // the slow pan up to the nurseries, arriving on the whole cycle
    { at: ["meet others", "they meet"], cam: CYCLE_VIEW, dur: 3.5, ease: "gentle" },
    // (no dive: the author dropped the Pillars of Creation, 2026-10-29)
    { at: "stellar nurseries", hl: [...CYCLE, { obj: "Supernova Remnant", label: false }, { obj: "Planetary Nebula", label: false }, { obj: "Stellar Nursery", label: "stellar nurseries", place: "left", delay: 0.2 }] },
    { at: "protostars",
      hl: [...CYCLE, { obj: "Stellar Nursery", label: false }, { obj: "Protostar", delay: 0.6 }] },
    { at: "stars again", cam: { r: 14.6, m: 33.9, span: 9 }, hl: [...CYCLE, { obj: "Stellar Nursery", label: false }, { obj: "Sun", delay: 0.6 }] },

    // what the core becomes
    { at: "what about the dense core", cam: { r: 8.4, m: 33.6, span: 6 }, clear: true, hl: [{ obj: "Sun" }] },
    // the two mass limits: a white dwarf can't pass 1.44 Suns (Chandrasekhar), a neutron star ~2.2–2.3 (TOV, uncertain)
    { at: "white dwarf", cam: { r: 9.85, m: 33.25, span: 2.6 }, hl: [{ obj: "Sun" }, { arrow: true, from: { obj: "Sun" }, to: { obj: "White Dwarf" }, color: "#90caf9" }, { obj: "White Dwarf", place: "left", delay: 0.6 },
      ...WD_LIMIT(1.2)] },
    { at: "big enough to go supernova", hl: [...WD_LIMIT(0, true), { obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: false, delay: 0.4 }] },
    // a slow zoom in on the neutron stars (the author, 2026-10-29), arriving as they're named
    { at: "pressure in its core", cam: { r: 6.4, m: 33.6, span: 2.2 }, dur: 6.5, ease: "gentle",
      hl: [{ obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: false }] },
    { at: ["protons and the electrons", "protons and electrons"], hl: [{ obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: "protons + electrons → neutrons", place: "right" }, PSR_RING] },
    { at: "becomes a neutron star", hl: [{ obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: "neutron star", place: "right" }, PSR_RING,
      { dust: "neutronstar", src: ["neutronstar"], color: "#80deea", sweep: 0.8, delay: 0.3 }] },
    { at: "single spoonful", hl: [{ obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: "a teaspoon ≈ 2 billion tonnes", place: "right" }, PSR_RING,
      { dust: "neutronstar", src: ["neutronstar"], color: "#80deea", sweep: 0.01 }] },
    // the neutron star limit (Oppenheimer–Volkoff) only once the narration gets past neutron stars
    { at: "collapse into a black hole", hl: [{ path: "stellar-to-bh" }, { line: "tov", label: "neutron star limit · ~2.2–2.3 Suns" }, { obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: false }, { obj: "Stellar BH", label: "black hole", delay: 0.3 }] },
    // teaser for the black-hole video: in close on the stellar black hole right there (not off
    // to M87*), then a dive with the Event Horizon Telescope photo over its picture; it's
    // M87*'s photo, the only kind there is (the author's call: a black hole is a black hole)
    { at: "collapse into a black hole", offset: 0.6, cam: { obj: "Stellar BH", span: 1.6 }, dur: 1 },
    { at: "collapse into a black hole", offset: 1.4, photo: "m87", obj: "Stellar BH", dive: { in: 1, out: 1 }, dur: 1.2, fadeIn: 0.6, fadeOut: 0.7,
      lens: { icon: [0.5, 0.5, 0.3], photo: [1800, 1800, 700], size: [3600, 3600], fill: "cover", hold: 0.2, fillDur: 1.2 },
      caption: "a black hole · M87* · Event Horizon Telescope · 2019" },
    { at: "deserves a video", offset: 1.3, cam: { r: 9, m: 36.5, span: 22 }, dur: 2.5,
      hl: [{ line: "schwarzschild" }, { obj: "Stellar BH", label: "next: black holes" }] },
  ],
};
