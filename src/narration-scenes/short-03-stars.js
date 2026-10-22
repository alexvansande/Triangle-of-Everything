// =============================================================
// Scene: short-03-stars — planets and stars differ by mass: Jupiter's own
// heat, brown dwarfs and deuterium, the fork after them, the main sequence,
// the life of a star, the nebulae that make new stars, and what the core
// becomes. Recorded 2026-10-19 (rec16, ending rec17; video/short-03-stars/).
// =============================================================
// Field reference: docs/narration.md, "Scene fields".

// a dying star splitting in two: the core to the white dwarfs, the outer layers to the nebulae
const SPLIT = { split: { from: { obj: "Red Giant" }, core: { obj: "White Dwarf" }, shell: { obj: "Planetary Nebula" } } };
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
    // no cut: zoom onto Jupiter, grow its picture in a spotlight, then the infrared photo
    // fades in right over the planet (lens), its disc matched to the picture's
    { at: "more heat than they absorb", cam: { obj: "Jupiter", span: 0.45 }, dur: 1.4,
      hl: [{ spot: "Jupiter", grow: 2, dim: 0.65 }] },
    { at: "more heat than they absorb", offset: 1.3, photo: "jupiter-ir", obj: "Jupiter", dur: 4.4,
      lens: { icon: [0.496, 0.5, 0.465], photo: [1791, 1677, 1651], size: [3600, 3353] },
      caption: "Jupiter in infrared · Gemini North · 2021 · glowing with its own heat" },
    { at: "compressing in their core", cam: { r: 9.8, m: 30.05, span: 1.5 },
      hl: [{ obj: "Saturn", place: "left" }, { obj: "Jupiter", label: "slowly contracting" }] },
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
    { at: "bifurcation", cam: { r: 9.9, m: 33.0, span: 3.8 }, dur: 5, drift: 0.02, hl: [{ obj: "L Brown Dwarf", label: false }, ...FORK] },

    // fusion turns on: the main sequence
    { at: "core pressure is strong enough", cam: { r: 10.4, m: 32.8, span: 1.9 }, clear: true, hl: [{ obj: "Proxima Cen", label: "fusion starts" }] },
    { at: "bigger in diameter", hl: [{ obj: "Proxima Cen", place: "left" }, { arrow: true, from: { obj: "Proxima Cen" }, to: { obj: "Sun" } }, { obj: "Sun", delay: 0.8 }] },
    { at: "other diagonal line", cam: { r: 10.9, m: 33.1, span: 3.6 }, hl: [{ obj: "Sun" }, { line: "mainsequence", label: "main sequence" }] },
    { at: "most stars will live", hl: [{ line: "mainsequence", label: "main sequence" }, { obj: "Sun" }, { obj: "Sirius A", delay: 0.3 }, { obj: "Vega", delay: 0.6 }] },
    { at: "hydrogen is depleted", hl: [{ line: "mainsequence" }, { obj: "Sun", label: "out of hydrogen" }] },

    // the end of a star: collapse, expand, split
    // two circles: the core stays small while the outer layers swell and fall back, the
    // star moving along the chart as it does; then the split: core left, layers right
    { at: "start collapsing", cam: { r: 11.85, m: 33.4, span: 3.6 }, hold: 8,
      hl: [{ swing: [{ obj: "Sun" }, { obj: "Red Giant" }], period: 2.4, core: true }, { obj: "Red Giant", label: "red giant", delay: 1 }] },
    { at: "split in two", cam: { r: 13.1, m: 33.6, span: 12.5 }, dur: 1.6,
      hl: [{ ...SPLIT, coreLabel: "core", shellLabel: "outer layers" }] },
    { at: "become a supernova", hl: [{ ...SPLIT, draw: 0.01 }, { obj: "Supernova Remnant", label: "supernova remnant", place: "left" }] },
    { at: "planetary nebula", hl: [{ ...SPLIT, draw: 0.01 }, { obj: "Planetary Nebula", label: "planetary nebula", place: "below" }] },
    { at: "inner core", cam: { r: 7.5, m: 33.4, span: 4.2 },
      hl: [{ obj: "Red Giant", label: false }, { obj: "White Dwarf", label: "dense core", place: "right", delay: 0.4 }, { obj: "PSR J0030+0451", label: false, delay: 0.7 }] },

    // the gas goes round again: stellar nurseries
    { at: "those nebulas expand", cam: { r: 18.1, m: 33.7, span: 2.8 },
      hl: [{ obj: "Supernova Remnant", label: false }, { obj: "Planetary Nebula", label: false }, { obj: "Bubble Nebula", label: false, delay: 0.4 }] },
    // no cut: zoom onto the nursery, grow its picture in a spotlight, then Webb's
    // Pillars fade in over it, rotated and scaled onto the picture's own pillars (lens)
    { at: "stellar nurseries", cam: { obj: "Stellar Nursery", span: 0.6 }, dur: 1.4,
      hl: [{ spot: "Stellar Nursery", grow: 3, dim: 0.65 }] },
    { at: "stellar nurseries", offset: 1.3, photo: "pillars", obj: "Stellar Nursery", dur: 4.2,
      lens: { map: [0.00033491, -0.00026951, -0.34744085, 0.36319975], r: 0.44, size: [2078, 3600] },
      caption: "Pillars of Creation · Webb · 2022 · a stellar nursery" },
    { at: "protostars", cam: { r: 16.8, m: 34.6, span: 6.2 },
      hl: [{ obj: "Stellar Nursery", label: false }, { arrow: true, from: { obj: "Stellar Nursery" }, to: { obj: "Protostar" } }, { obj: "Protostar", delay: 0.6 }] },
    { at: "stars again", cam: { r: 14.6, m: 33.9, span: 9 }, hl: [{ obj: "Stellar Nursery", label: false }, { arrow: true, from: { obj: "Stellar Nursery" }, to: { obj: "Protostar" } },
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
    // teaser for the black-hole video: no cut — zoom onto M87*, grow its picture in a
    // spotlight, and the Event Horizon Telescope photo slowly fades in over it (lens)
    { at: "collapse into a black hole", offset: 1.0, cam: { obj: "M87*", span: 0.6 }, dur: 1.2,
      hl: [{ spot: "M87*", grow: 3, dim: 0.65 }] },
    { at: "collapse into a black hole", offset: 1.9, photo: "m87", obj: "M87*", dur: 2.1, fadeIn: 1.4,
      lens: { map: [0.00043284, -0.00002689, -0.308608, -0.209377], r: 0.46, size: [3600, 3600] },
      caption: "M87* · Event Horizon Telescope · 2019" },
    { at: "deserves a video", cam: { r: 9, m: 36.5, span: 22 }, dur: 2.5,
      hl: [{ line: "schwarzschild" }, { obj: "Stellar BH", label: "next: black holes" }] },
  ],
};
