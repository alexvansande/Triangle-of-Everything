// =============================================================
// Scene: draft-06-wavelengths — the wavelengths video (plan: video/plans/wavelengths.md),
// keyed to the plan's draft script, read by a synthetic voice as a stand-in until the
// author records it (public/narration/draft-06-wavelengths/). Photons on the chart,
// then the spectrum explorer: Earth and the sky across the spectrum, the zoom out by
// log distance, and every wavelength from its own place.
// =============================================================
// Field reference: docs/narration.md, "Scene fields"; the `explorer` cues are in
// src/narration.js, "the spectrum explorer".

// The RGB selector on the sky's bar (29 bands, 0 = 408 MHz … 28 = gamma 3–300 GeV):
// `c` is the green channel's band, red one below, blue one above
const BAND = {
  radio: 1, cmb: 5, coldDust: 11, warmDust: 15, nearIR: 19,
  infraredAsRed: 21, visible: 22, uvAsBlue: 23, xray: 25.5, gamma: 27,
};
const FULL = { r: -2.2, m: -4.8, span: 74 };
// Inside (Earth with the sky behind): zoom is the field of view, smaller is closer
// (seen from this side, Antarctica, dark in June's polar night, stays out of view)
const EARTH = { view: "inside", yaw: -2.11, pitch: -0.15, zoom: 0.75 };
// the Cloud, log radius from 1,000 km: Earth at the centre, every ring a power of ten
const LOG_UNIT = Math.log10(1000 / 9.4607e12);

export default {
  title: "Wavelengths",
  blurb: "Photons from gamma rays to radio are one kind of stuff; colours are labels; Earth and the sky in every wavelength; and where each one comes from.",
  start: FULL,
  icons: ["Gamma Ray", "X-ray", "Ultraviolet", "Visible Light", "Infrared", "Microwave", "FM Radio", "AM Radio"],

  // the explorer's state at t = 0 (hidden until a cue shows it): Earth in natural colour
  explorer: { ...EARTH, c: BAND.visible, s: 1, gmst: 3.2, exposure: 0.9, rings: false },

  cues: [
    // ── One kind of stuff ─────────────────────────────────────
    // never a static open: a slow push towards the photons
    { at: "In the last video", cam: { obj: "Gamma Ray", span: 9 }, dur: 9, drift: 0.02 },
    { at: "Gamma rays are photons", hl: [{ obj: "Gamma Ray" }] },
    { at: "every photon is the same", cam: { obj: "X-ray", span: 9, glide: true }, clear: true },
    { at: "visible light, infrared", cam: { obj: "Visible Light", span: 9, glide: true } },
    { at: "radio waves: it's all", cam: { obj: "FM Radio", span: 9, glide: true } },
    { at: "More energy, shorter", cam: { obj: "Ultraviolet", span: 9, glide: true }, hl: [{ obj: "Gamma Ray" }] },
    { at: "Less energy, longer", hl: [{ obj: "AM Radio" }] },
    // the line itself, with the sine wave along it
    { at: "the line they make", cam: { obj: "Visible Light", span: 16 }, dur: 3, spectrum: true, clear: true },

    // ── Colours are labels ────────────────────────────────────
    // into the visible-light photon, and the explorer opens out of it
    { at: "go back to visible light", spectrum: false, dolly: { obj: "Visible Light", in: 1.8, out: 1.2, size: 0.3 }, dur: 2.4 },
    { at: "go back to visible light", offset: 1.6, explorer: { show: true, fade: 1.4, spin: 0.04 } },
    { at: "a label your brain", explorer: { yaw: -1.95, pitch: -0.05, zoom: 0.6, dur: 6 } },
    { at: "infrared as red", explorer: { c: BAND.infraredAsRed, dur: 2.2 } },
    { at: "Or we could shift", explorer: { c: BAND.visible, dur: 1.5 } },
    { at: "like a bee", explorer: { c: BAND.uvAsBlue, dur: 2 } },

    // ── Up the spectrum and back ──────────────────────────────
    { at: "In ultraviolet, Earth", explorer: { c: 23.6, dur: 2 } },
    { at: "in X-rays, Earth goes dark", explorer: { c: BAND.xray, zoom: 0.9, dur: 3 } },
    { at: "in gamma rays", explorer: { c: BAND.gamma, dur: 3 } },
    { at: "let's go back down", explorer: { c: BAND.visible, dur: 4 } },
    { at: "In infrared, we see heat", explorer: { c: BAND.nearIR, zoom: 0.6, dur: 2.5 } },
    { at: "infrared goes straight through", explorer: { c: BAND.warmDust, zoom: 1.0, dur: 4 } },
    { at: "we see the dust itself", explorer: { c: BAND.coldDust, dur: 3 } },
    { at: "in microwaves, Earth", explorer: { c: BAND.cmb, zoom: 0.7, dur: 3 } },
    { at: "afterglow of the Big Bang", explorer: { zoom: 1.2, dur: 4 } },

    // ── How far is the light from? ────────────────────────────
    // back to visible light, into the Cloud on a log scale from 1,000 km, close on Earth
    { at: "All this light comes", explorer: { c: BAND.visible, dur: 2.5 } },
    { at: "put it on a log scale", explorer: { view: "cloud", radius: "log", unit: LOG_UNIT, rings: true, bright: "lin",
      yaw: 0.6, pitch: 0.35, spinA: 0, zoom: 8, dur: 0.01, spin: 0.03 } },
    { at: "If Earth is this big", offset: 0.6, explorer: { zoom: 2.6, dur: 3 } },
    { at: "The Sun is eight", explorer: { zoom: 1.9, dur: 2.5 } },
    { at: "the closest stars", explorer: { zoom: 1.45, dur: 3.5 } },
    { at: "the sky becomes a cloud", explorer: { zoom: 1.25, dur: 3 } },
    { at: "our whole galaxy", explorer: { zoom: 1.1, dur: 3 } },
    { at: "the entire observable universe", explorer: { zoom: 0.95, dur: 4 } },

    // ── Every wavelength from its own place ───────────────────
    { at: "go through the spectrum again", explorer: { c: BAND.visible, dur: 1 } },
    { at: "Infrared reaches further", explorer: { c: BAND.nearIR, dur: 2.5 } },
    { at: "Radio shows us", explorer: { c: BAND.radio, dur: 4 } },
    { at: "Microwaves come from", explorer: { c: BAND.cmb, dur: 2.5 } },
    { at: "X-rays and gamma rays", explorer: { c: BAND.gamma, dur: 5 } },
    { at: "Every wavelength is a different window", explorer: { c: BAND.visible, zoom: 1.05, dur: 5 } },
  ],
};
