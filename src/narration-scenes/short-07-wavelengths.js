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
const lineView = (r, span, glide = false) => ({ r, m: -r - 37.454 - 0.36 * span, span, glide });
const LINEVIEW = lineView(-5, 15);
// Inside (Earth with the sky behind): zoom is the field of view, smaller is closer
// (seen from this side, Antarctica, dark in June's polar night, stays out of view)
const EARTH = { view: "inside", yaw: -2.11, pitch: -0.15, zoom: 1.05 };
// the Cloud, log radius from 1,000 km: Earth at the centre, every ring a power of ten
const LOG_UNIT = Math.log10(1000 / 9.4607e12);

export default {
  title: "Wavelengths",
  blurb: "Photons from gamma rays to radio are one kind of stuff on the Compton line; colours are labels; Earth and the sky in every wavelength; and where each one comes from.",
  start: FULL,
  thumb: 128,   // the videos page's still: X-rays, Earth dark, the ranges on the Compton line
  icons: ["GeV Gamma Ray", "Gamma Ray", "X-ray", "Ultraviolet", "Visible Light", "Infrared", "Microwave", "21 cm Line", "FM Radio", "AM Radio"],

  // the explorer's state at t = 0 (hidden until a cue shows it): Earth in natural colour
  explorer: { ...EARTH, c: BAND.visible, s: 1, gmst: 3.2, exposure: 0.9, rings: false },

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
    { at: "go back to visible light", clear: true, explorer: { show: true, fade: 1.6, spin: 0.04 } },
    { at: "isn't something out there", cam: lineView(-4.85, 3), dur: 5, explorer: { yaw: -1.95, pitch: -0.05, zoom: 0.9, dur: 6 } },
    { at: "infrared as red", explorer: { c: BAND.infraredAsRed, dur: 2.2 } },
    { at: "Or we could shift", explorer: { c: BAND.visible, dur: 1.5 } },
    { at: "like a bee", explorer: { c: BAND.uvAsBlue, dur: 2 } },

    // ── Up the spectrum and back ──────────────────────────────
    { at: "Now let's keep going", cam: lineView(-6, 6, true) },
    { at: "In ultraviolet, Earth", explorer: { c: 23.6, dur: 2 } },
    { at: "Further up", cam: lineView(-8.5, 11, true), explorer: { c: BAND.xray, zoom: 1.2, dur: 3 } },
    { at: "In gamma rays", cam: lineView(-10, 13, true), explorer: { c: BAND.gamma, dur: 3 } },
    { at: "all the way back down", cam: lineView(-3.5, 9, true), explorer: { c: BAND.heat, zoom: 0.9, dur: 4 } },
    { at: "In the sky, infrared", cam: lineView(-4, 8, true), explorer: { c: BAND.nearIR, zoom: 1.25, dur: 3 } },
    { at: "the dust itself", cam: lineView(-2.6, 9, true), explorer: { c: BAND.coldDust, dur: 3 } },
    { at: "in microwaves, Earth", cam: lineView(-1, 11, true), explorer: { c: BAND.cmb, zoom: 0.95, dur: 3 } },
    { at: "afterglow of the Big Bang", explorer: { zoom: 1.5, dur: 4 } },

    // ── How far is the light from? ────────────────────────────
    // back to visible light, into the Cloud on a log scale from 1,000 km, close on Earth;
    // the line steps back while the distances are told
    { at: "not all light comes", cam: LINEVIEW, dur: 3, explorer: { c: BAND.visible, dur: 2.5 } },
    { at: "put everything in a log scale", explorer: { view: "cloud", radius: "log", unit: LOG_UNIT, rings: true, bright: "lin",
      yaw: 3.74, pitch: 0.5, spinA: 0, zoom: 8, dur: 0.01, spin: 0.03 } },   // (this side keeps Antarctica's polar night out of view)
    { at: "put everything in a log scale", offset: 0.5, explorer: { line: 0.35, dur: 2 } },
    { at: "the Moon's orbit", explorer: { zoom: 2.6, dur: 3 } },
    { at: "Then the Sun", explorer: { zoom: 1.9, dur: 2.5 } },
    { at: "the closest stars", explorer: { zoom: 1.45, dur: 3 } },
    { at: "Zoom out further", explorer: { zoom: 1.25, dur: 3 } },
    { at: "then our galaxy", explorer: { zoom: 1.1, dur: 3 } },
    { at: "entire observable universe", explorer: { zoom: 0.95, dur: 4 } },

    // ── Every wavelength from its own place ───────────────────
    { at: "through the spectrum again", explorer: { c: BAND.visible, line: 1, dur: 1.5 } },
    { at: "Infrared reaches further", explorer: { c: BAND.nearIR, dur: 2.5 } },
    { at: "Radio shows", cam: lineView(-2, 13), dur: 4, explorer: { c: BAND.radio, dur: 4 } },
    { at: "Microwave comes from", explorer: { c: BAND.cmb, dur: 2.5 } },
    { at: "X-rays and gamma rays from", cam: lineView(-8.5, 15), dur: 5, explorer: { c: BAND.gamma, dur: 5 } },
    { at: "Every wavelength is", cam: LINEVIEW, dur: 5, explorer: { c: BAND.visible, zoom: 1.05, dur: 5 } },
  ],
};
