// =============================================================
// Scene: short-04a-black-hole-slope — "The Black Hole Slope", the first black holes Short as a take of
// its own (rec59, 2026-11-09; video/short-04a-black-hole-slope/, video/sources/2026-11-09/NOTES.md).
// The chart as a tool and the ranges things fall in (the water diagonal, the super-Jupiters' column,
// the stars' labyrinth), the left side as a cemetery of dead stars, the line every black hole lives
// on as the first limit, the horizon growing with the mass and so a 45° slope, the black holes we
// know, and "how small?".
// The earlier version, carved from video 4's take, keeps its own scene (short-04-black-holes, the cut
// short-04a-black-hole-line); the shots from "squeeze the Sun" to "but how small" are that scene's,
// keyed to this take's words.
// =============================================================
// Field reference: docs/narration.md, "Scene fields".

const FULL = { r: -2.2, m: -4.8, span: 74 };
// On the Schwarzschild line log R = log M − 27.83 (cm, g).
const BH = (m) => ({ r: m - 27.83, m, mark: true });
const SCHW = { line: "schwarzschild" };
const KNOWN = { dust: "blackhole", sweep: 1.6 };
// the stars' lives, the paths the chart draws: low and high mass, and the nebulae back to the nurseries
const LOW = { path: "stellar-low-mass" }, HIGH = { path: "stellar-high-mass" };
const CYCLE = [LOW, HIGH, { path: ["nebula-to-nursery", "remnant-to-nursery"] }];
// super-Jupiters and brown dwarfs: one column at Jupiter's size
const COLUMN = { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f" };
// the three things a dead star leaves, lit without tags
const WD = { obj: "White Dwarf", label: false }, NS = { obj: "PSR J0030+0451", label: false }, SBH = { obj: "Stellar BH", label: false };
// the dives (Sgr A*, M87*): one move in over 2 s, the photo fading in over its second half, a
// second held, and the same move out (dive.mirror); the picture grows to 42% of the screen's short side
const DIVE = { in: 2, out: 2, photoAt: 0.9, size: 0.42, mirror: true };
const DIVE_PHOTO = { fadeIn: 1.1, fadeOut: 1.1, dur: 2.1 };
const DIVE_HELD = DIVE.photoAt + DIVE_PHOTO.dur;   // s from the cue to the way out

export default {
  title: "The Black Hole Slope",
  // the map's own icon visibility throughout (no scene-picked set, no shots without pictures)
  icons: "all",
  blurb: "Squeeze anything hard enough and it becomes a black hole. Every black hole lives on one line, the first limit we meet on our chart of everything.",
  start: FULL,
  forceIcons: ["Sun", "Ton 618"],   // the Sun's picture in "squeeze the Sun into a black hole", where nearby stars would otherwise win the room; TON 618 beside the (larger) M87*
  pbhWindow: false,

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md)
  backing: "Mesmerize",
  sound: [
    { at: "become a black hole", fx: "drop", atEnd: true, offset: -0.3 },
    { at: "pool big enough", fx: "bubble", offset: 0.2 },
  ],

  cues: [
    // ── The chart, a tool ────────────────────────────────────
    { at: "i've been exploring", cam: { r: 3, m: 9, span: 56 }, dur: 12, drift: 0.02, hl: [{ line: "triangle" }] },
    { at: "log chart of size", units: true, unitsFor: 9, hl: [{ axis: "bottom", label: "size" }] },
    { at: "and mass", hl: [{ axis: "bottom", label: "size" }, { axis: "right", label: "mass" }] },

    // ── The ranges things fall in: a list, so whips at one close zoom, then one slow zoom out ──
    { at: "most objects will fall", cam: { r: 2.2, m: 5.6, span: 9 }, dur: 2.4, clear: true },
    { at: "this diagonal line", hl: [{ line: "water", label: "density of water" }] },
    { at: "this huge vertical column", cam: { r: 9.85, m: 30.9, span: 9, whip: true }, hl: [{ ...COLUMN, delay: 0.5 }] },
    { at: "this rather complex labyrinth", cam: { r: 11.6, m: 33.7, span: 9, whip: true }, hl: CYCLE },
    { at: "tells you the life", cam: { r: 12.6, m: 34, span: 15 }, dur: 4, hl: CYCLE },

    // ── The cemetery of dead stars ───────────────────────────
    { at: "this whole left side", cam: { r: 8.6, m: 33.7, span: 8 }, dur: 3, clear: true,
      hl: [WD, NS, SBH, { ellipse: [7.45, 33.75, 2.3, 1.15], rot: 0, label: "dead stars", place: "above", color: "#e0e0e0", delay: 1.4 }] },
    { at: "stars like ours", cam: { r: 9.4, m: 33.5, span: 7.5 }, dur: 3, hl: [{ obj: "Sun", place: "right" }, { ...LOW, from: "Sun" }, { obj: "White Dwarf", place: "left", delay: 1.6 }] },
    // (the high-mass path isn't lit here: its last leg runs past the Sun's picture, and read as the Sun making the neutron star)
    { at: "larger ones will go supernova", cam: { r: 8.4, m: 33.7, span: 7.5 }, dur: 3.5, hl: [WD, { obj: "PSR J0030+0451", label: "neutron star", place: "right", delay: 1.4 }] },
    { at: "but larger still", hl: [WD, NS, { path: "stellar-to-bh" }, { obj: "Stellar BH", label: "black hole", delay: 1.2 }] },

    // ── The line: the first limit ────────────────────────────
    // the real black holes on it, the stellar ones up to M87*
    { at: "every black hole lives", cam: { obj: "Sgr A*", span: 15 }, dur: 4, drift: 0.02, clear: true, hl: [KNOWN, { ...SCHW, label: "black holes" }] },
    { at: "this line is special", cam: { r: 11, m: 38.6, span: 20 }, dur: 5, hl: [{ line: "triangle" }, { ...SCHW, label: "the first limit" }] },
    // squeeze anything you can see: the Moon, straight across (same mass) onto the line
    { at: "for every object you can see", cam: { r: 4.2, m: 26.6, span: 16 }, dur: 3, hl: [SCHW, { obj: "Moon" }] },
    { at: "if you squeeze them", hl: [SCHW, { obj: "Moon" }, { arrow: true, from: { obj: "Moon" }, to: BH(25.87), label: "squeeze", delay: 0.2 }] },
    { at: "become a black hole", hl: [SCHW, { obj: "Moon" }, { arrow: true, from: { obj: "Moon" }, to: BH(25.87), delay: 0 },
      { cross: BH(25.87), size: "the Moon: 0.2 mm wide", delay: 0.3 }] },
    { at: "called the schwarzschild radius", cam: { obj: "Sgr A*", span: 15 }, dur: 6, drift: 0.02, clear: true, hl: [{ ...SCHW, label: "schwarzschild radius" }] },
    { at: "upper limit in which", hl: [{ ...SCHW, label: "schwarzschild radius" }, { side: "left", of: "schwarzschild" }] },

    // ── The slope: the size we draw is the event horizon, which grows with the mass ──
    { at: ["don't actually have a size", "doesn't really have a size"], cam: { obj: "Stellar BH", span: 6 }, clear: true, hl: [SCHW, { obj: "Stellar BH", label: "black hole" }] },
    // (the singularity is what's inside; the size on the chart is the horizon's: the editor's note of 2026-11-08)
    { at: "singularity", hl: [SCHW, { obj: "Stellar BH", label: "inside: a singularity" }] },
    { at: "event horizon", hl: [SCHW, { obj: "Stellar BH", label: "size = event horizon" }] },
    { at: "light cannot escape", hl: [SCHW, { obj: "Stellar BH", label: "no light gets out" }] },
    { at: "dependent on the mass", cam: { r: 4, m: 31, span: 24 }, hl: [{ ...SCHW, label: "twice the mass, twice the size" }] },
    { at: ["one-to-one", "45 degree"], hl: [{ ...SCHW, label: "1 : 1 · 45°" }] },
    { at: "according to relativity", cam: { r: 11, m: 38.6, span: 20 }, dur: 5, hl: [{ line: "triangle" }, { ...SCHW, label: "nothing beyond this line" }, { side: "left", of: "schwarzschild" }] },

    // ── The black holes we know ──────────────────────────────
    // the Sun and the Earth squeezed into black holes: straight across (same mass) onto the line
    { at: "squeeze the sun", cam: { r: 7.6, m: 31.5, span: 12 }, dur: 2.5, clear: true, hl: [SCHW, { obj: "Sun", place: "right" },
      { arrow: true, from: { obj: "Sun" }, to: BH(33.3), delay: 0.5 }, { cross: BH(33.3), size: "the Sun: 6 km wide", delay: 1.4 }] },
    { at: "the earth would be", cam: { r: 4.6, m: 30.3, span: 13 }, dur: 2, hl: [SCHW, { obj: "Sun", label: false }, { mark: [5.47, 33.3], label: "the Sun · 6 km", place: "left" },
      { obj: "Earth", place: "right" }, { arrow: true, from: { obj: "Earth" }, to: BH(27.78), delay: 0.4 }, { cross: BH(27.78), size: "the Earth: 2 cm, a marble", delay: 1.2 }] },
    { at: "collapsing core of dying stars", cam: { r: 8, m: 34, span: 12 }, hl: [{ path: "stellar-to-bh" }, NS, { obj: "Stellar BH", label: "collapsed stars" }] },
    { at: "merging with other black holes", hl: [{ path: "bh-mergers" }, { obj: "Stellar BH", label: "or merged black holes" }] },
    { at: "a few sun masses", cam: { r: 11, m: 38.6, span: 20 }, hl: [{ ...SCHW, label: "every known black hole" }] },
    { at: "the milky way", cam: { r: 14, m: 41.5, span: 12 }, hl: [{ obj: "Sgr A*", label: "sgr a* · our galaxy's" }] },
    { at: ["4 million", "four million"], hl: [{ obj: "Sgr A*", label: "4 million suns" }] },
    // a dive onto Sgr A*, one continuous move (the author, 2026-10-30): it comes towards us while the
    // camera turns to it, the EHT photo fading in over its growing picture; a second held, then the
    // same move backwards, the camera turning back out to what comes next
    { at: ["4 million", "four million"], offset: 0.8, cam: { obj: "Sgr A*", span: 12 }, dur: 2 },
    { at: ["4 million", "four million"], offset: 0.8, photo: "sgr-a", obj: "Sgr A*", dive: DIVE, ...DIVE_PHOTO,
      lens: { map: [0.00038123, 0, -0.17691, -0.200666], r: 0.48, size: [3600, 3600] },
      caption: "Sagittarius A*, our galaxy's black hole · Event Horizon Telescope · 2022" },
    { at: ["4 million", "four million"], offset: 0.8 + DIVE_HELD, cam: { r: 13.5, m: 41.3, span: 14 }, dur: 2 },
    { at: "the less dense they are", hl: [SCHW, { line: "water", label: "water" }] },
    { at: "less dense than water", hl: [SCHW, { line: "water", label: "water" }, { side: "right", of: "water" },
      { obj: "Sgr A*", label: "denser than water", place: "left" }, { obj: "M87*", label: "lighter than water", delay: 0.6 }] },
    { at: "pool big enough", hl: [{ line: "water" }, { side: "right", of: "water" }, { obj: "M87*", label: "it would float" }, { obj: "Ton 618", label: false }] },
    // a dive onto M87*, the same move as Sgr A*'s, from "like M87" so it's back out for TON 618
    { at: ["like m87", "m87"], cam: { obj: "M87*", span: 14 }, dur: 2, hl: [{ obj: "M87*", label: "m87* · first photographed", place: "left" }] },
    { at: ["like m87", "m87"], photo: "m87", obj: "M87*", dive: DIVE, ...DIVE_PHOTO,
      lens: { map: [0.00056505, -0.00003499, -0.550765, -0.453559], r: 0.48, size: [3600, 3600] },
      caption: "M87*, the first black hole ever photographed · Event Horizon Telescope · 2019" },
    { at: "one of the largest", cam: { r: 15.4, m: 43.3, span: 7 }, hl: [{ obj: "M87*", label: false }, { obj: "Ton 618", label: "ton 618", place: "above" }] },
    { at: "bigger than pluto's", hl: [{ obj: "M87*", label: false }, { obj: "Ton 618", label: "horizon ≈ 20–30× pluto's orbit", place: "above" }] },

    // ── How small? ───────────────────────────────────────────
    { at: "but how small", cam: { r: -2, m: 25, span: 28 }, dur: 4, clear: true, hl: [{ ...SCHW, label: "the smallest" }] },
    // down the line to where the tiny ones could still be: an asteroid's mass, smaller than an atom
    { at: "some people who believe", cam: { r: -6.4, m: 20.6, span: 17 }, dur: 9, drift: 0, hl: [SCHW, { mark: [-8.3, 19.5], label: "tiny black holes?", place: "right", color: "#ff8fa8", delay: 3.6 }] },
  ],
};
