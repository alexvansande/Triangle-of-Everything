// =============================================================
// Scene: short-07-wavelengths — video 7 (plan: video/plans/wavelengths.md), rec42 of
// 2026-10-27 (video/short-07-wavelengths/). Photons from gamma rays to radio on the
// Compton line; then the spectrum explorer behind that line, which becomes its
// spectrum bar (the author's note in the take): Earth and the sky across the
// spectrum, the zoom out by log distance, and every wavelength from its own place.
// =============================================================
// Field reference: docs/narration.md, "Scene fields"; the `explorer` cues are in
// src/narration.js, "the spectrum explorer".

// The RGB selector on the sky's bar (29 bands, 0 = 408 MHz … 28 = gamma 3–300 GeV):
// `c` is the green channel's band, red one below, blue one above
const BAND = {
  radio: 1, cmb: 5, coldDust: 11, heat: 16, nearIR: 19,
  infraredAsRed: 21, visible: 22, uvAsBlue: 23, xray: 25.5, gamma: 27,
};
const FULL = { r: -2.2, m: -4.8, span: 74 };
// the photons along the Compton line, framed so the line runs across the top half of
// the screen: the explorer's Earth sits in the middle, below it
// (the camera sits below the line by a fixed share of the span, so the line keeps clear
// of Earth however close it is; while the explorer shows, the camera follows its
// selector along the line: close in on the colours, wider for gamma rays and radio)
// (k: how far below the line the camera sits, as a share of the span; higher while Earth
// is close)
const lineView = (r, span, glide = false, k = 0.36) => ({ r, m: -r - 37.454 - k * span, span, glide });
const LINEVIEW = lineView(-5, 15);
// Earth, north up, seen from 15°N (Antarctica, dark in June's polar night, stays behind
// the limb); one camera for Inside and the Cloud, `ezoom` is Earth's size (Inside's field
// of view, smaller is closer). Earth stays still and the camera goes round it, eastward:
// the orbit puts longitude −60° (the Amazon) in front at 90 s, at "the forests light
// up", Africa and its dust for ultraviolet, Arabia and India for "warm land glows",
// monsoon Asia for the water in microwaves (author's notes, 2026-10-27). Earth's picture
// is all daylight, so its turn (gmst) is free: it's set so the sky behind Earth is the
// galactic plane for gamma rays (RA ≈ 230° at 145 s) and the Galactic Centre itself at
// "the dust that hides the center of our galaxy" (RA 266°, 164 s)
const ORBIT_RATE = 0.034;   // rad/s, about 2° of longitude a second
const EARTH = { view: "inside", yaw: -2.5666, pitch: 0.835, orbit: 5.05 - ORBIT_RATE * 90, gmst: 0.035, ezoom: 0.38 };
// the Cloud, log radius from 1,000 km: Earth at the centre, every ring a power of ten
// (on it, ezoom 1.86 shows the Moon's orbit, 2.5 the Sun's path, 8.8 the whole universe)
const LOG_UNIT = Math.log10(1000 / 9.4607e12);

export default {
  title: "Wavelengths",
  blurb: "Photons from gamma rays to radio are one kind of stuff on the Compton line; colours are labels; Earth and the sky in every wavelength; and where each one comes from.",
  start: FULL,
  thumb: 128,   // the videos page's still: X-rays, Earth dark, the ranges on the Compton line
  icons: ["GeV Gamma Ray", "Gamma Ray", "X-ray", "Ultraviolet", "Visible Light", "Infrared", "Microwave", "21 cm Line", "FM Radio", "AM Radio"],

  // the explorer's state at t = 0 (hidden until a cue shows it): Earth in natural colour
  explorer: { ...EARTH, c: BAND.visible, s: 1, exposure: 0.9, rings: false, labels: [], spin: ORBIT_RATE },

  cues: [
    // ── One kind of stuff ─────────────────────────────────────
    // never a static open: a slow push towards the photons
    { at: "I've been exploring this chart", cam: { obj: "Visible Light", span: 30 }, dur: 12, drift: 0.02 },
    { at: "Gamma rays are photons", cam: { obj: "Gamma Ray", span: 9 }, dur: 3, hl: [{ obj: "Gamma Ray" }] },
    { at: "Every photon is the same", clear: true },
    { at: ["Gamma rays, X-rays", "X-rays, ultraviolet"], cam: { obj: "X-ray", span: 9, glide: true } },
    { at: "visible light, infrared", cam: { obj: "Visible Light", span: 9, glide: true } },
    { at: "radio waves, all", cam: { obj: "FM Radio", span: 9, glide: true } },
    { at: "More energy, shorter", cam: { obj: "Ultraviolet", span: 10, glide: true }, hl: [{ obj: "Gamma Ray" }] },
    { at: "Less energy, longer", hl: [{ obj: "AM Radio" }] },
    // the line itself, with the sine wave along it, framed as the explorer will use it
    { at: "the line they make", cam: LINEVIEW, dur: 3, drift: 0, spectrum: true, clear: true },
    { at: "Compton line runs", spectrum: false, hl: [{ line: "compton", label: "the Compton line" }] },
    { at: "limits of our triangle", hl: [{ line: "compton", label: "the quantum edge of the triangle" }] },

    // ── Colours are labels ────────────────────────────────────
    // everything else goes; the explorer opens behind the Compton line, which becomes
    // its spectrum bar: the selector's ranges glow on it, the photons' names light up
    // close on Earth first (the line raised to keep clear of it), then a slow pull back
    // while the camera goes round
    { at: "go back to visible light", clear: true, cam: lineView(-5, 15, false, 0.47), dur: 2, explorer: { show: true, fade: 1.6 } },
    { at: "This is Earth as you", explorer: { ezoom: 0.62, dur: 24 } },
    { at: "isn't something out there", cam: lineView(-4.85, 3, false, 0.47), dur: 5 },
    { at: "infrared as red", explorer: { c: BAND.infraredAsRed, dur: 2.2 } },
    { at: "Or we could shift", explorer: { c: BAND.visible, dur: 1.5 } },
    { at: "like a bee", explorer: { c: BAND.uvAsBlue, dur: 2 } },

    // ── Up the spectrum and back ──────────────────────────────
    { at: "Now let's keep going", cam: lineView(-6, 6, true) },
    // (held at the bee's shift: blue is Earth's UV and the sky's empty UV slot; any further
    // and the sky's blue would be X-rays while the words say there's no UV sky map)

    { at: "Further up", cam: lineView(-8.5, 11, true), explorer: { c: BAND.xray, s: 0.5, ezoom: 1.1, dur: 3 } },   // (narrower: all three channels in X-rays, none left in ultraviolet, so Earth is truly dark)
    { at: "In gamma rays", cam: lineView(-10, 13, true), explorer: { c: BAND.gamma, s: 1, dur: 3 } },
    { at: "all the way back down", cam: lineView(-3.5, 9, true), explorer: { c: BAND.heat, ezoom: 0.75, dur: 4 } },
    { at: "In the sky, infrared", cam: lineView(-4, 8, true), explorer: { c: BAND.nearIR, ezoom: 1.25, dur: 3 } },
    { at: "the dust itself", cam: lineView(-2.6, 9, true), explorer: { c: BAND.coldDust, dur: 3 } },
    { at: "in microwaves, Earth", cam: lineView(-1, 11, true), explorer: { c: BAND.cmb, ezoom: 0.85, dur: 3 } },
    { at: "afterglow of the Big Bang", explorer: { ezoom: 1.5, dur: 4 } },

    // ── How far is the light from? ────────────────────────────
    // back to visible light; a slow fade into the Cloud on a log scale from 1,000 km,
    // the same camera, so Earth stays exactly where it is; the line steps back while the
    // distances are told, and each name shows only while it's being talked about
    { at: "not all light comes", cam: LINEVIEW, dur: 3, explorer: { c: BAND.visible, dur: 2.5 } },
    { at: "put everything in a log scale", explorer: { view: "cloud", xfade: 4, radius: "log", unit: LOG_UNIT, bright: "lin", line: 0.35, dur: 3 } },
    { at: "the only way we can see", explorer: { rings: true } },
    { at: "the Moon's orbit", explorer: { ezoom: 1.86, dur: 3, labels: ["moon"] } },
    { at: "Then the Sun", explorer: { ezoom: 2.5, dur: 2.5, labels: ["sun"] } },
    { at: "the closest stars", explorer: { ezoom: 3.3, dur: 3, labels: ["proxima"] } },
    { at: "Zoom out further", explorer: { ezoom: 3.9, dur: 3, labels: [] } },
    { at: "then our galaxy", explorer: { ezoom: 5.6, dur: 2.5, labels: ["milkyway"] } },
    { at: "entire observable universe", explorer: { ezoom: 8.8, dur: 5, labels: [] } },

    // ── Every wavelength from its own place ───────────────────
    { at: "through the spectrum again", explorer: { c: BAND.visible, line: 1, dur: 1.5 } },
    { at: "Infrared reaches further", explorer: { c: BAND.nearIR, dur: 2.5 } },
    { at: "Radio shows", cam: lineView(-2, 13), dur: 4, explorer: { c: BAND.radio, dur: 4 } },
    { at: "Microwave comes from", explorer: { c: BAND.cmb, dur: 2.5 } },
    { at: "X-rays and gamma rays from", cam: lineView(-8.5, 15), dur: 5, explorer: { c: BAND.gamma, dur: 5 } },
    { at: "Every wavelength is", cam: LINEVIEW, dur: 5, explorer: { c: BAND.visible, ezoom: 7.5, dur: 5 } },
  ],
};
