// =============================================================
// Narration scene script — what the camera does while you talk
// =============================================================
// The full tour (take 1). Read by src/narration.js; a take picks its scene
// with "scene" in its words.json (default "tour"). Each cue fires when its phrase is SPOKEN
// (looked up in the take's words.json, in order), so the same script fits
// any recording of roughly the same text. A phrase that isn't found is
// skipped with a console warning — give alternatives as an array.
//
// Cue fields
//   at       phrase (or [alternatives]) that triggers the cue
//   offset   seconds relative to the phrase's first word (default -0.25)
//   atEnd    anchor to the phrase's last word instead
//   cam      { r, m, span } — log radius [cm], log mass [g], decades across
//            the screen width — or { obj: "Name", span, dr, dm }
//   dur      flight seconds (default: from the distance travelled)
//   drift    slow zoom-in while holding, as a fraction (default 0.05)
//   hl       highlights, shown until the next cue with hl/clear:
//              { obj: "Name", label?, place?: "left"|"below", color? }
//              { line: "schwarzschild"|"compton"|"hubble"|"water"|
//                      "darkmatter"|"mainsequence"|"triangle", label? }
//              { side: "left"|"right", of?: "water", label? }
//              { arrow: true, from: {obj}|{r,m}, to: {obj}|{r,m,mark}, label? }
//            any item can take delay (s) to stagger
//   clear    end the current highlights
//   units    pin the unit rulers on (they also show during every move)
//   classic  "out" — cross-fade from the classic figure to the map (fade s)
//
// Sound cues (optional `sound: [...]`, read by scripts/narration-sound.mjs;
// keep them rare). Each names a phrase like a cue does:
//   { at, voice }  an effect on the voice for that phrase: "echo" (repeats
//                  that fade off), "hall" (a long tail), "radio" (a tuned-in
//                  radio with static), "wide" (spreads out in stereo),
//                  "liquid" (a watery wobble), "deep" (sinks and drags)
//   { at, fx }     a small effect from the phrase's first word: "static",
//                  "bubble", "glug", "wind", "hiss", "drops", "ignite",
//                  "boom", "drop"; offset (s), atEnd, gain (dB)
//   { at, music, to?, toEnd? }  quiet rhythm from the phrase to the `to`
//                  phrase (or the end): "pulse" (a soft beat and plucks) or
//                  "heartbeat"; stop: "cut" ends it dead instead of fading
//   { at, intensity, ramp? }  the music bed's energy from this phrase on, until
//                  the next one: 0 silent, 0.5 hushed, 1 normal, 2 a build
//                  (twice the notes, a bass pulse), 3 the peak (a soft kick and
//                  a pad, about 6 dB fuller); ramps over `ramp` s (default 2)
// bed: false        no music bed (by default a quiet rhythmic bed runs under
//                  the whole take, shaped by where the camera is: small scales
//                  quick and high, galaxies slow and low; dense things minor)

const FULL = { r: -2.2, m: -4.8, span: 74 };   // the whole triangle, portrait

export default {
  // Opening frame: the classic Lineweaver–Patel figure, whole
  start: { r: 7.5, m: 9, span: 106 },

  // Caption spelling fixes (Whisper hears the accent literally)
  captionFixes: {
    short: "chart", shard: "chart", shark: "chart", lenyakea: "Laniakea",
    pattern: "Saturn", stores: "stars", radios: "radius", rados: "radius",
    "hawking's": "Hawking", last: "left",
  },

  cues: [
    // ── Hook: the classic figure ─────────────────────────────
    { at: "most interesting chart", cam: { r: 6, m: 8, span: 92 }, dur: 6, drift: 0.02 },
    { at: "diagonal line with humans", cam: { r: 2, m: 6, span: 44 },
      hl: [{ line: "water", label: "the diagonal" }] },
    { at: ["planets and stars", "and stars"], cam: { r: 9, m: 27, span: 40 } },
    { at: "related to mass and size", cam: { r: 7, m: 6, span: 88 }, clear: true },
    { at: "you have particles", cam: { r: -14, m: -24, span: 36 } },
    { at: ["all about energy", "axis is all about"], cam: { r: 47, m: 8, span: 34 } },
    { at: "you have those diagonal lines", cam: { r: 22, m: 50, span: 44 } },
    { at: ["it says now", "says now"], cam: { r: 30, m: 63, span: 22 } },
    { at: "measures in seconds", offset: 0, cam: { r: 27, m: 58, span: 30 }, dur: 3 },

    // ── Intro: fade to the map ───────────────────────────────
    { at: ["triangle of everything", "let me take you"], classic: "out", fade: 3,
      cam: FULL, dur: 3.2 },
    { at: "anything that can ever exist", hl: [{ line: "triangle" }] },

    // ── Axes ─────────────────────────────────────────────────
    { at: "best place to start", cam: { r: 3, m: 7, span: 16 }, clear: true },
    { at: "this is us humans", cam: { obj: "Human", span: 6 }, hl: [{ obj: "Human", label: "you are here" }] },
    { at: "not in the center", cam: FULL, hl: [{ obj: "Human", label: "humans" }] },
    { at: "horizontal axis", cam: { r: 3, m: 6, span: 18 }, units: true, unitsFor: 9,
      hl: [{ arrow: true, from: { r: -2, m: 1 }, to: { r: 8, m: 1 }, label: "size" }] },
    { at: "vertical axis represents the mass",
      hl: [{ arrow: true, from: { r: -4, m: -3 }, to: { r: -4, m: 14 }, label: "mass" }] },
    { at: "one liter of water", cam: { obj: "1 Liter of Water", span: 4.5 },
      hl: [{ obj: "1 Liter of Water", label: "1 liter · 10 cm" }] },
    { at: ["one ton of water", "ton of water"], cam: { r: 1.35, m: 4.6, span: 4.5 },
      hl: [{ obj: "1 Liter of Water", label: "1 kg" }, { obj: "1 Tonne of Water", label: "1 tonne · 1 m" },
           { arrow: true, from: { obj: "1 Liter of Water" }, to: { obj: "1 Tonne of Water" }, label: "×10 size · ×1000 mass" }] },
    { at: "this blue line", cam: { r: 2, m: 6.5, span: 16 },
      hl: [{ line: "water", label: "density of water" }] },

    // ── Density ──────────────────────────────────────────────
    { at: "will float", offset: -1.5,
      hl: [{ line: "water" }, { side: "right", label: "floats" }] },
    { at: "left side are things that are heavier",
      hl: [{ line: "water" }, { side: "right", label: "floats" }, { side: "left", label: "sinks" }] },
    { at: "the hippo", cam: { obj: "Hippopotamus", span: 3.5 },
      hl: [{ obj: "Hippopotamus" }, { line: "water" }] },
    { at: "go up the line", cam: { r: 5.2, m: 15, span: 14 }, hl: [{ line: "water" }] },
    { at: ["mostly meteorites", "meteorites"], hl: [{ line: "water" }, { side: "left", label: "denser than water" }] },

    // ── Human scale to planets ───────────────────────────────
    { at: "we leave the living things", cam: { r: 3.6, m: 10.5, span: 10 }, clear: true },
    { at: "great pyramid", cam: { obj: "Great Pyramid", span: 6 }, hl: [{ obj: "Great Pyramid" }] },
    { at: "asteroids and small moons", cam: { r: 5.6, m: 17.5, span: 8 },
      hl: [{ obj: "Bennu" }, { obj: "Deimos", delay: 0.3 }, { obj: "Phobos", delay: 0.6, place: "left" }] },
    { at: ["notice something interesting", "something interesting starts"], cam: { r: 7.1, m: 22, span: 8 },
      hl: [{ obj: "Phobos", place: "left" }, { obj: "Mimas", delay: 0.8 }, { obj: "Ceres", delay: 1.6 }] },
    { at: "reach pluto", cam: { obj: "Pluto", span: 4 }, hl: [{ obj: "Pluto", label: "Pluto · round" }] },
    { at: "gravity simply overcomes", cam: { r: 7.6, m: 23.8, span: 6 }, hl: [{ obj: "Ceres" }, { obj: "Pluto" }, { obj: "Mimas" }] },
    { at: "something else also starts happening", cam: { r: 8.6, m: 27.1, span: 3.4 }, clear: true },
    { at: "mercury has no", hl: [{ obj: "Mercury", label: "Mercury · none", place: "left" }] },
    { at: "mars has a very thin", hl: [{ obj: "Mercury", label: "Mercury", place: "left" }, { obj: "Mars", label: "Mars · thin" }] },
    { at: "venus", hl: [{ obj: "Mercury", place: "left" }, { obj: "Mars" }, { obj: "Venus", place: "left" }, { obj: "Earth", delay: 0.6 }] },
    { at: "reach the gas giants", cam: { r: 9.45, m: 29.3, span: 4 },
      hl: [{ obj: "Jupiter" }, { obj: "Saturn", delay: 0.3 }] },
    { at: "earth sits in a very thin", cam: { r: 9.1, m: 28.6, span: 4.6 },
      hl: [{ obj: "Earth", label: "Earth", place: "left" }, { obj: "Jupiter", delay: 2.5 }] },
    { at: "four gas giants", cam: { r: 9.55, m: 29.4, span: 3.2 },
      hl: [{ obj: "Neptune", place: "left" }, { obj: "Uranus", delay: 0.25 }, { obj: "Saturn", delay: 0.5 }, { obj: "Jupiter", delay: 0.75 }] },

    // ── Planets to stars ─────────────────────────────────────
    { at: "as they become larger and larger", cam: { r: 9.8, m: 30.5, span: 4.4 }, clear: true },
    { at: "notice the saturn", cam: { obj: "Saturn", span: 3 },
      hl: [{ obj: "Saturn", label: "Saturn · lighter than water" }, { line: "water" }] },
    { at: "then we start seeing", cam: { r: 10.1, m: 31.4, span: 4.6 },
      hl: [{ obj: "Jupiter", place: "left" }, { obj: "Y Brown Dwarf", delay: 0.4, label: "brown dwarfs" }, { line: "water" }] },
    { at: "degenerate matter", hl: [{ obj: "Jupiter", place: "left" }, { obj: "Y Brown Dwarf", label: false },
      { obj: "T Brown Dwarf", label: false }, { obj: "L Brown Dwarf", label: "brown dwarfs" }] },
    { at: "outside pressure", cam: { r: 10.4, m: 32.6, span: 4 }, hl: [{ obj: "Red Dwarf" }] },
    { at: "those will become stars", cam: { obj: "Sun", span: 5 }, hl: [{ obj: "Sun" }] },

    // ── Stellar evolution ────────────────────────────────────
    { at: ["stars like the sun", "like the sun"], cam: { r: 11, m: 33.5, span: 7 },
      hl: [{ obj: "Sun" }, { line: "mainsequence", label: "main sequence" }] },
    { at: "life cycle of a star", cam: { r: 12.4, m: 33.7, span: 9 }, hl: [{ obj: "Sun" }] },
    { at: "they become red giants", cam: { r: 12.6, m: 33.8, span: 7 },
      hl: [{ obj: "Sun" }, { arrow: true, from: { obj: "Sun" }, to: { obj: "Red Giant" } }, { obj: "Red Giant", delay: 1 }, { obj: "Betelgeuse", delay: 1.4 }] },
    { at: "just go boom", cam: { r: 15.8, m: 34, span: 12 }, dur: 1.4,
      hl: [{ arrow: true, from: { obj: "Betelgeuse" }, to: { obj: "Supernova Remnant" }, color: "#ff8a65" }] },

    // ── Stellar cycle ────────────────────────────────────────
    { at: "a supernova is a rapidly", cam: { obj: "Supernova Remnant", span: 8 },
      hl: [{ obj: "Supernova Remnant" }, { obj: "Nebulae", delay: 0.6, place: "below" }] },
    { at: "split the object", cam: { r: 11.5, m: 33.6, span: 17 }, clear: true },
    { at: "white dwarf", hl: [{ obj: "White Dwarf" }] },
    { at: "neutron star", hl: [{ obj: "White Dwarf" }, { obj: "Neutron Star", place: "left" }] },
    { at: "collapse into black holes", cam: { r: 8, m: 34, span: 12 },
      hl: [{ obj: "White Dwarf" }, { obj: "Neutron Star", place: "left" }, { obj: "Stellar BH", place: "left" }] },

    // ── Black holes ──────────────────────────────────────────
    { at: "this line right here", cam: { r: 5, m: 33, span: 16 },
      hl: [{ line: "schwarzschild", label: "schwarzschild radius" }] },
    { at: "first limit of our triangle", cam: FULL, hl: [{ line: "schwarzschild", label: "limit 1 · schwarzschild" }] },
    { at: "every object", cam: { r: 5, m: 28, span: 16 }, hl: [{ line: "schwarzschild" }, { obj: "Earth" }] },
    { at: "compression point", hl: [{ line: "schwarzschild" }, { obj: "Earth" },
      { arrow: true, from: { obj: "Earth" }, to: { r: -0.05, m: 27.78, mark: true }, label: "squeeze to 9 mm" }] },
    { at: "no really defined size", cam: { obj: "Stellar BH", span: 6 }, hl: [{ obj: "Stellar BH", label: "black hole" }] },
    { at: "point of no return", cam: { r: 6, m: 33.5, span: 12 }, hl: [{ line: "schwarzschild" }] },
    { at: "directly proportional", cam: { r: 4, m: 31, span: 24 }, hl: [{ line: "schwarzschild", label: "1 : 1 · 45°" }] },
    { at: "can have any size", cam: { r: 0, m: 26, span: 50 },
      hl: [{ line: "schwarzschild" }, { obj: "Stellar BH", place: "left", delay: 0.3 }, { obj: "Sgr A*", delay: 0.6, place: "left" }, { obj: "Ton 618", delay: 0.9, place: "left" }] },
    { at: "mass of stars", cam: { obj: "Stellar BH", span: 8 }, hl: [{ obj: "Stellar BH", place: "left" }] },
    { at: "anything can become a black hole", cam: { r: 0, m: 26, span: 40 }, hl: [{ line: "schwarzschild" }] },
    { at: "early universe", cam: { r: -6, m: 20, span: 30 } },
    { at: "primordial black holes", cam: { obj: "Smallest Primordial BH", span: 12 },
      hl: [{ obj: "Smallest Primordial BH", label: "primordial black hole" }, { line: "schwarzschild" }] },
    { at: "mass of a small moon", cam: { r: -1.5, m: 19, span: 18 },
      hl: [{ obj: "Phobos", label: "a small moon" }, { line: "schwarzschild" },
           { arrow: true, from: { obj: "Phobos" }, to: { r: -8.8, m: 19.03, mark: true }, label: "atom-sized", delay: 0.8 }] },
    { at: "zipping around", cam: { r: -2.5, m: 19, span: 15 },
      hl: [{ obj: "Phobos", label: "a small moon" }, { arrow: true, from: { obj: "Phobos" }, to: { r: -8.8, m: 19.03, mark: true }, label: "same mass · atom-sized", draw: 0.01 }] },
    { at: "a lot like dark matter", cam: { r: -2, m: 20, span: 24 }, clear: true },

    // ── Dark matter ──────────────────────────────────────────
    { at: "beyond the scale of", cam: { r: 21, m: 42, span: 22 },
      hl: [{ line: "water", label: "atoms" }, { line: "darkmatter", label: "dark matter", delay: 1.2 }] },
    { at: "density of dark matter", hl: [{ line: "darkmatter", label: "dark matter density" }] },
    { at: "stellar nurseries", cam: { r: 19.3, m: 36.5, span: 7 },
      hl: [{ obj: "Supernova Remnant", place: "left" }, { obj: "Nebulae" }, { obj: "Globular Cluster", delay: 0.6 }] },
    { at: "dwarf galaxies", cam: { r: 21.5, m: 42, span: 8 }, hl: [{ obj: "Dwarf Galaxy" }] },
    { at: "our own galaxy", cam: { obj: "Milky Way", span: 5 }, hl: [{ obj: "Milky Way", label: "Milky Way · us" }] },
    { at: "groups of galaxies", cam: { r: 24.5, m: 47, span: 8 }, hl: [{ obj: "Milky Way" }] },
    { at: "galaxy clusters", hl: [{ obj: "Galaxy Cluster" }] },
    { at: ["the one we live on", "we live on"], cam: { obj: "Laniakea", span: 5 }, hl: [{ obj: "Laniakea" }] },

    // ── The largest ──────────────────────────────────────────
    { at: "just voids", cam: { r: 26.6, m: 50.5, span: 5.5 },
      hl: [{ obj: "Boötes Void", place: "left" }, { obj: "KBC Void", delay: 0.4 }] },
    { at: "same diagonal", cam: { r: 24, m: 47, span: 14 },
      hl: [{ obj: "Boötes Void", place: "left" }, { obj: "KBC Void" }, { line: "darkmatter" }] },
    { at: "nothing can be bigger than that", cam: { r: 22, m: 30, span: 30 },
      hl: [{ line: "hubble", label: "hubble radius" }] },
    { at: "second side of our triangle", cam: FULL, hl: [{ line: "schwarzschild" }, { line: "hubble", label: "limit 2 · hubble radius" }] },
    { at: "speed of light", hl: [{ line: "hubble" }] },
    { at: "not the size of the universe", cam: { r: 30, m: 40, span: 30 }, hl: [{ line: "hubble" }] },
    { at: "the observable universe", cam: { obj: "Observable Universe", span: 12, dr: -2 },
      hl: [{ obj: "Observable Universe", place: "left" }] },
    { at: "intersection of the", cam: { r: 25, m: 52, span: 14 },
      hl: [{ obj: "Observable Universe", place: "left" }, { line: "schwarzschild" }, { line: "hubble" }] },
    { at: "itself a black hole", hl: [{ obj: "Observable Universe", place: "left", label: "a black hole?" }] },
    { at: "also the black holes are round", cam: { r: 20, m: 40, span: 30 }, clear: true },
    { at: "only round from", cam: FULL, dur: 4, drift: 0.02, hl: [{ line: "triangle" }] },
  ],
};
