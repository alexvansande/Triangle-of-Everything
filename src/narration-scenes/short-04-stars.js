// =============================================================
// Scene: short-04-stars — planets and stars differ by mass: Jupiter's own
// heat, brown dwarfs and deuterium, the fork after them, the main sequence,
// the life of a star, the nebulae that make new stars, and what the core
// becomes. Recorded 2026-10-19 (rec16, ending rec17; video/short-04-stars/).
// =============================================================
// Field reference: docs/narration.md, "Scene fields".

const BD = [{ obj: "Y Brown Dwarf", label: false }, { obj: "T Brown Dwarf", label: false }];
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
    { at: "fuse all of the hydrogen", fx: "ignite", offset: 0.4 },
    { at: "fuel for fusion is depleted", music: "heartbeat", to: "split in two", stop: "cut" },
    { at: "split in two", fx: "boom", offset: 0.1 },
    { at: "collapse into a black hole", fx: "drop", atEnd: true, offset: -0.4 },
  ],

  cues: [
    { at: "completely different categories", cam: { r: 10.3, m: 31.8, span: 2.6 },
      hl: [{ obj: "Jupiter", label: "planet", place: "left" }, { obj: "Sun", label: "star", delay: 0.6 }] },

    // Jupiter and Saturn make their own heat
    { at: "saturn and jupiter", cam: { r: 9.8, m: 30.05, span: 1.5 }, hl: [{ obj: "Saturn", place: "left" }, { obj: "Jupiter", delay: 0.3 }] },
    { at: "more heat than they absorb", hl: [{ obj: "Saturn", place: "left" }, { obj: "Jupiter", label: "gives off more heat than it gets" }] },
    { at: "compressing in their core", hl: [{ obj: "Saturn", place: "left" }, { obj: "Jupiter", label: "slowly contracting" }] },
    { at: "as that mass increases", cam: { r: 9.85, m: 30.9, span: 1.7 },
      hl: [{ obj: "Jupiter", place: "left" }, { obj: "Y Brown Dwarf", label: false, delay: 0.4 }, { obj: "T Brown Dwarf", label: false, delay: 0.8 }] },

    // brown dwarfs: deuterium only
    { at: "become brown dwarfs", hl: [{ obj: "Jupiter", place: "left" }, ...BD, { obj: "L Brown Dwarf", label: "brown dwarfs" }] },
    { at: "in-between objects", cam: { r: 9.9, m: 31.35, span: 1.8 },
      hl: [{ obj: "Jupiter", label: "planet", place: "left" }, { obj: "L Brown Dwarf", label: "brown dwarf" }, { obj: "Proxima Cen", label: "star", delay: 0.5 }] },
    { at: "start fusing hydrogen", hl: [{ obj: "Jupiter", place: "left" }, ...BD, { obj: "L Brown Dwarf", label: "fuses a little" }] },
    { at: "form of deuterium", hl: [...BD, { obj: "L Brown Dwarf", label: "deuterium only" }] },
    { at: "minuscule portion", hl: [...BD, { obj: "L Brown Dwarf", label: "1 hydrogen in ~40,000" }] },
    { at: "sustain themselves as stars", hl: [...BD, { obj: "L Brown Dwarf", label: "never a star" }, { obj: "Proxima Cen", label: false }] },

    // the fork: stars to the right, white dwarfs to the left
    { at: "increase that mass even further", cam: { r: 9.85, m: 32.6, span: 3 }, hl: [{ obj: "L Brown Dwarf", label: false }] },
    { at: "bifurcation", hl: [{ obj: "L Brown Dwarf", label: false }, ...FORK] },

    // fusion turns on: the main sequence
    { at: "core pressure is strong enough", cam: { r: 10.4, m: 32.8, span: 1.9 }, clear: true, hl: [{ obj: "Proxima Cen", label: "fusion starts" }] },
    { at: "bigger in diameter", hl: [{ obj: "Proxima Cen", place: "left" }, { arrow: true, from: { obj: "Proxima Cen" }, to: { obj: "Sun" } }, { obj: "Sun", delay: 0.8 }] },
    { at: "other diagonal line", cam: { r: 10.9, m: 33.1, span: 3.6 }, hl: [{ obj: "Sun" }, { line: "mainsequence", label: "main sequence" }] },
    { at: "most stars will live", hl: [{ line: "mainsequence", label: "main sequence" }, { obj: "Sun" }, { obj: "Sirius A", delay: 0.3 }, { obj: "Vega", delay: 0.6 }] },
    { at: "hydrogen is depleted", hl: [{ line: "mainsequence" }, { obj: "Sun", label: "out of hydrogen" }] },

    // the end of a star: collapse, expand, split
    { at: "start collapsing", cam: { r: 11.85, m: 33.4, span: 3.2 }, hold: 6,
      hl: [{ swing: [{ obj: "Sun" }, { obj: "Red Giant" }], period: 2.4 }, { obj: "Red Giant", label: "red giant", delay: 1 }] },
    { at: "split in two", cam: { r: 15.8, m: 33.6, span: 7.4 },
      hl: [{ obj: "Red Giant", label: false }, { obj: "Planetary Nebula", delay: 0.4 }, { obj: "Supernova Remnant", delay: 0.8 }] },
    { at: "become a supernova", hl: [{ obj: "Red Giant", label: false }, { obj: "Supernova Remnant", label: "supernova remnant", place: "left" }, { obj: "Planetary Nebula", label: false }] },
    { at: "planetary nebula", hl: [{ obj: "Red Giant", label: false }, { obj: "Supernova Remnant", label: false }, { obj: "Planetary Nebula", label: "planetary nebula", place: "below" }] },
    { at: "inner core", cam: { r: 7.5, m: 33.4, span: 4.2 },
      hl: [{ obj: "Red Giant", label: false }, { obj: "White Dwarf", label: "dense core", place: "right", delay: 0.4 }, { obj: "PSR J0030+0451", label: false, delay: 0.7 }] },

    // the gas goes round again: stellar nurseries
    { at: "those nebulas expand", cam: { r: 18.1, m: 33.7, span: 2.8 },
      hl: [{ obj: "Supernova Remnant", label: false }, { obj: "Planetary Nebula", label: false }, { obj: "Bubble Nebula", label: false, delay: 0.4 }] },
    { at: "stellar nurseries", hl: [{ obj: "Supernova Remnant", label: false }, { obj: "Nebulae", label: "stellar nursery" }] },
    { at: "protostars", cam: { r: 16.5, m: 34.2, span: 5.4 },
      hl: [{ obj: "Nebulae", label: false }, { arrow: true, from: { obj: "Nebulae" }, to: { obj: "Protostar" } }, { obj: "Protostar", delay: 0.6 }] },
    { at: "stars again", cam: { r: 14.6, m: 33.9, span: 9 }, hl: [{ obj: "Nebulae", label: false }, { arrow: true, from: { obj: "Nebulae" }, to: { obj: "Protostar" } },
      { arrow: true, from: { obj: "Protostar" }, to: { obj: "Sun" } }, { obj: "Sun", delay: 0.6 }] },

    // what the core becomes
    { at: "what about the core", cam: { r: 8.4, m: 33.6, span: 6 }, clear: true, hl: [{ obj: "Sun" }] },
    // the two mass limits: a white dwarf can't pass 1.44 Suns (Chandrasekhar), a neutron star ~2.2–2.3 (TOV, uncertain)
    { at: "white dwarf", cam: { r: 9.85, m: 33.25, span: 2.6 }, hl: [{ obj: "Sun" }, { arrow: true, from: { obj: "Sun" }, to: { obj: "White Dwarf" }, color: "#90caf9" }, { obj: "White Dwarf", place: "left", delay: 0.6 },
      { line: "chandrasekhar", label: "white dwarf limit · 1.44 Suns", delay: 1.2 }] },
    { at: "big enough to go supernova", hl: [{ line: "chandrasekhar", label: "core passes 1.44 Suns" }, { obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: false, delay: 0.4 }] },
    { at: ["protons and the electrons", "protons and electrons"], cam: { r: 6.35, m: 33.75, span: 2 }, hl: [{ line: "chandrasekhar" }, { obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: "protons + electrons → neutrons", place: "right" }] },
    { at: "create a neutron star", hl: [{ line: "chandrasekhar" }, { obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: "neutron star", place: "right" },
      { line: "tov", label: "neutron star limit · ~2.2–2.3 Suns", delay: 0.8 }] },
    { at: "single spoonful", hl: [{ line: "tov" }, { obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: "a teaspoon ≈ 2 billion tonnes", place: "right" }] },
    { at: "collapse into a black hole", hl: [{ line: "tov", label: "above it: black hole" }, { obj: "White Dwarf", label: false }, { obj: "PSR J0030+0451", label: false }, { obj: "Stellar BH", label: "black hole", delay: 0.3 }] },
    // teaser for the black-hole video: the edge they sit on
    { at: "deserves a video", cam: { r: 9, m: 36.5, span: 22 }, dur: 2.5,
      hl: [{ line: "schwarzschild" }, { obj: "Stellar BH", label: "next: black holes" }] },
  ],
};
