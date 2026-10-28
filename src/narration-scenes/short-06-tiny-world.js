// =============================================================
// Scene: short-06-tiny-world — video 6: the third edge. The triangle's three
// sides; a human, measured as a ball, in metric units; the water line (sink or
// float); down the line through the small animals and microbes (the centrifuge);
// where biology hands over to chemistry: viruses, molecules, DNA's four bases;
// atoms (mass from the nucleus, size from the electrons), helium, lithium and the
// sawtooth that is the periodic table, palladium, where heavy elements are made,
// oganesson; the Compton line (eV/c², E = mc², squeezing makes new pairs);
// particles and light all on the line; the water line meeting it where X-rays turn
// into gamma rays, and radioactivity as matter turning into light; the hook for
// wavelengths. Recorded 2026-10-27 (rec39; video/short-06-tiny-world/).
// =============================================================
// Field reference: docs/narration.md, "Scene fields".

const FULL = { r: -2.2, m: -4.8, span: 74 };   // the whole triangle, portrait
const WATER = { line: "water" }, SCHW = { line: "schwarzschild" }, HUBBLE = { line: "hubble" }, COMPTON = { line: "compton" };
// one slow glide: waypoints at their cue times (visual-rules.md: the camera never stands still)
const C = (r, m, span) => ({ r, m, span, glide: true });
// down the water line (m = 3r + 0.62), a bit under two decades wide
const DOWN = (r, span = 1.8) => C(r, +(3 * r + 0.62).toFixed(2), span);
// where the water line meets the Compton line (log R + log M = −37.45 for every particle
// and photon on the chart): ~66 keV, between the X-ray and gamma-ray dots
const CROSS = { r: -9.52, m: -27.93 };
const ALKALI = ["Lithium", "Sodium", "Potassium", "Rubidium", "Cesium"];
const NOBLE = ["Neon", "Argon", "Krypton", "Xenon", "Radon"];
const few = (names, label, delay = 0.15) => names.map((obj, i) => ({ obj, label: i === names.length - 1 ? label : false, delay: i * delay }));
const BASES = ["Adenine (A)", "Thymine (T)", "Cytosine (C)", "Guanine (G)"];
const PARTICLES = ["Electron", "Muon", "Proton", "Tau"];
const LIGHT = ["FM Radio", "Microwave", "Infrared", "Visible Light", "Ultraviolet", "X-ray", "Gamma Ray"];

export default {
  title: "The tiny world",
  blurb: "From us down to the third edge: microbes, molecules, the periodic table, the Compton line, and matter turning into light.",
  // open on the whole triangle and push in slowly while its edges are named
  start: { r: -2.2, m: -4.8, span: 84 },
  thumb: 193,   // the periodic table drawn by the atoms
  captionFixes: { math: "mass", shard: "chart" },

  // background music (Kevin MacLeod, CC BY 4.0: video/music/CREDITS.md). Fretless was too
  // happy and dancy for this one (the author, 2026-10-27); the album's calmest track instead
  backing: "Relaxing Piano Music",

  cues: [
    // ── The three edges ──────────────────────────────────────
    // the cow is drawn as the physicist's spherical cow the whole video (an easter egg for
    // "as if they were spheres")
    { at: "in this series", offset: -0.4, swap: { Cow: "cow-spherical" }, cam: FULL, dur: 9, drift: 0.02, hl: [{ line: "triangle", delay: 1.5 }] },
    { at: "first is the black hole line", cam: C(-8, 6, 70), hl: [{ ...SCHW, label: "edge 1 · black holes" }] },
    { at: "there's a limit", hl: [SCHW, { side: "left", of: "schwarzschild", label: "nothing" }] },
    { at: "the second is the hubble radius", cam: C(3, 8, 70), hl: [{ ...HUBBLE, label: "edge 2 · the Hubble radius" }] },
    { at: "nothing can be bigger", hl: [HUBBLE, { side: "right", of: "hubble", label: "nothing" }] },
    { at: "the third side", cam: C(-5, -14, 62), hl: [{ ...COMPTON, label: "edge 3 · how small" }] },
    // in to us, slowly
    { at: "start with us", cam: { obj: "Human", span: 3 }, dur: 8, clear: true, hl: [{ obj: "Human", delay: 5 }] },

    // ── A human, a ball, metric units ────────────────────────
    { at: "this is a human", cam: C(1.9, 4.8, 2.6), hl: [{ obj: "Human", label: "~2 m · ~100 kg" }] },
    { at: "close enough", hl: [{ obj: "Human", label: "rounded: it's a log chart" }] },
    { at: "we measure everything", cam: C(1.95, 5.1, 2.4),
      hl: [{ obj: "Human", label: false }, { obj: "Cow", label: "the spherical cow", delay: 0.4 }] },
    { at: "as if they were spheres", hl: [{ obj: "Human", label: "measured as a ball" }, { obj: "Cow", label: "the spherical cow" }] },
    { at: "we use the metric units", cam: C(1.2, 3.0, 3.4), units: true, unitsUntil: "one diagonal line", clear: true },
    { at: "every unit fits", cam: C(0.9, 2.4, 3.6) },
    { at: "one gram of water", cam: C(0.3, 1.4, 2.6), hl: [{ obj: "1 mL of Water", label: "1 gram · 1 cm³" }] },
    { at: "one diagonal line", hl: [{ obj: "1 mL of Water", label: false }, { ...WATER, label: "density of water" }] },
    { at: "denser and sinks", cam: C(0.75, 3.0, 2.4),
      hl: [WATER, { side: "left", label: "sinks" }, { obj: "Sylacauga meteorite", label: "meteorite", place: "left", delay: 0.8 }] },
    { at: "like a soccer ball", cam: C(0.95, 3.4, 2.4),
      hl: [WATER, { side: "left", label: "sinks" }, { side: "right", label: "floats" }, { obj: "Soccer Ball", label: "soccer ball" }] },

    // ── Down the line: small animals, microbes ───────────────
    { at: "most animals live", cam: DOWN(1.2, 2), hl: [WATER, { obj: "Human", label: false }, { obj: "Mouse", delay: 0.4 }] },
    { at: "mostly made of water", cam: DOWN(0.6, 2), hl: [WATER, { obj: "Mouse", label: "mostly water" }] },
    { at: "smallest insects", cam: DOWN(-0.6), hl: [WATER, { obj: "Ant", delay: 0.4 }, { obj: "Ladybug", delay: 0.9 }, { obj: "Eois stantonae", label: "tiny moth", delay: 1.4 }] },
    { at: "single grain of sand", cam: DOWN(-1.45), hl: [WATER, { obj: "Grain of Sand" }] },
    { at: "among the microorganisms", cam: DOWN(-1.75), hl: [WATER, { obj: "Tardigrade", delay: 0.6 }, { obj: "Amoeba", delay: 1.1 }] },
    { at: "grain of pollen", cam: DOWN(-2.6), hl: [WATER, { obj: "Pollen Grain" }] },
    { at: "red blood cell", cam: DOWN(-3.3), hl: [WATER, { obj: "Red Blood Cell", label: "~7 thousandths of a mm" }] },
    { at: "then bacteria", cam: DOWN(-4.0, 2), hl: [WATER, { obj: "Bacterium" }] },
    { at: "almost all of microbiology", cam: DOWN(-4.4, 2.6),
      hl: [WATER, { side: "left", label: "denser than water" }, { obj: "Bacterium", label: false }, { obj: "COVID Virus", label: false, delay: 0.4 }] },
    { at: "centrifuge works", hl: [WATER, { side: "left", label: "sinks in a centrifuge" }, { obj: "Bacterium", label: false }, { obj: "COVID Virus", label: false }] },

    // ── Biology hands over to chemistry ──────────────────────
    { at: "where biology ends", cam: DOWN(-5.1, 2), clear: true,
      hl: [{ obj: "Bacterium", label: "biology", place: "left" }, { obj: "Ribosome", label: "chemistry", delay: 1.2 }] },
    { at: "viruses sit right in between", hl: [{ obj: "COVID Virus", label: false }, { obj: "Influenza", label: false, delay: 0.3 }, { obj: "Bacteriophage T4", label: "viruses", delay: 0.6 }] },
    { at: "far more than just a molecule", hl: [{ obj: "Bacteriophage T4", label: "not quite alive" }, { obj: "COVID Virus", label: false }] },
    { at: "kingdom of molecules", cam: DOWN(-6.0, 2), hl: [{ obj: "Ribosome" }] },
    { at: "builds your proteins", hl: [{ obj: "Ribosome", label: "builds proteins" }] },
    { at: "antibodies", cam: DOWN(-6.35, 2), hl: [{ obj: "Ribosome", label: false }, { obj: "Antibody (IgG)", label: "antibody" }] },
    { at: "hemoglobin", hl: [{ obj: "Antibody (IgG)", label: false }, { obj: "Hemoglobin", label: "carries oxygen" }] },
    { at: "every one of us", cam: DOWN(-6.9, 1.6), hl: [{ obj: "DNA" }] },
    { at: "four molecules", cam: C(-7.5, -21.7, 1.7), hl: few(BASES, "A · T · C · G", 0.3) },
    { at: "simpler and simpler", cam: C(-7.7, -22.0, 1.4), hl: [{ obj: "Glucose", label: "sugar" }, { obj: "Water (H₂O)", label: "water", delay: 0.8 }] },

    // ── Atoms and the periodic table ─────────────────────────
    { at: "here's hydrogen", cam: C(-8.25, -23.5, 1.2), clear: true, hl: [{ obj: "Hydrogen" }] },
    { at: "the mass comes almost all", hl: [{ obj: "Hydrogen", label: "mass: the nucleus" }] },
    { at: "cloud of electrons", hl: [{ obj: "Hydrogen", label: "size: the electrons" }] },
    { at: "you get helium", cam: C(-8.4, -23.3, 1.3),
      hl: [{ obj: "Hydrogen", label: false }, { arrow: true, from: { obj: "Hydrogen" }, to: { obj: "Helium" } }, { obj: "Helium", label: "4× the mass", delay: 0.7 }] },
    { at: "actually smaller", hl: [{ obj: "Hydrogen", label: false }, { obj: "Helium", label: "and smaller" }] },
    { at: "you get lithium", cam: C(-8.15, -23.05, 1.5),
      hl: [{ obj: "Helium", label: false }, { arrow: true, from: { obj: "Helium" }, to: { obj: "Lithium" } }, { obj: "Lithium", label: "lithium", delay: 0.6 }] },
    { at: "start a new shell", hl: [{ obj: "Helium", label: false }, { obj: "Lithium", label: "a new shell: bigger" }] },
    // across period 2, smaller and smaller; then sodium balloons out
    { at: "keeps happening", cam: C(-8.05, -22.6, 2.0),
      hl: [{ obj: "Lithium", label: false }, { obj: "Carbon", label: false, delay: 0.4 }, { obj: "Neon", label: "smaller", delay: 0.8 }, { obj: "Sodium", label: "bigger again", delay: 2.4 }] },
    { at: "regular intervals", cam: C(-7.95, -22.2, 2.5), hl: few(["Lithium", "Neon", "Sodium", "Argon", "Potassium", "Krypton"], false, 0.25) },
    { at: "periodic table", periodic: true, clear: true },
    { at: "chemistry class", cam: C(-7.9, -22.1, 2.6) },
    { at: "the alkali metals", hl: few(ALKALI, "alkali metals") },
    { at: "noble gases tucked in", hl: [...few(ALKALI, false, 0), ...few(NOBLE, "noble gases")] },
    { at: "a little weird", cam: C(-8.0, -21.75, 1.4), hl: [{ obj: "Rhodium", label: false }, { obj: "Silver", label: false }] },
    { at: "palladium jumps over", hl: [{ obj: "Rhodium", label: false }, { obj: "Silver", label: false }, { obj: "Palladium", label: "palladium" }] },
    { at: "almost as compact", hl: [{ obj: "Palladium", label: "nearly a noble gas" }, ...few(NOBLE.slice(1, 4), false, 0.2)] },
    { at: "the lanthanides", periodic: false, cam: C(-7.8, -21.6, 1.5), hl: [{ obj: "Lanthanum", label: "lanthanides" }, { obj: "Gold", delay: 0.6 }, { obj: "Silver", delay: 0.9 }] },
    { at: "up to iron", cam: C(-7.85, -21.8, 1.8), hl: [{ obj: "Iron", label: "made in stars' cores" }] },
    { at: "gold or uranium", hl: [{ obj: "Iron", label: false }, { obj: "Gold", place: "left" }, { obj: "Uranium", delay: 0.4 }] },
    { at: "colliding neutron stars", hl: [{ obj: "Gold", label: false }, { obj: "Uranium", label: "exploding stars, neutron stars" }] },
    { at: "every element is radioactive", cam: C(-7.75, -21.4, 1.4), hl: [{ obj: "Uranium", label: "radioactive" }, { obj: "Radon", label: false }] },
    { at: "this is oganesson", hl: [{ obj: "Oganesson", label: "heaviest ever made" }] },

    // ── The wall: the Compton line ───────────────────────────
    { at: "keep following the line", cam: DOWN(-9.0, 3), dur: 4, clear: true, hl: [WATER] },
    { at: "final edge", cam: C(-9.6, -27.5, 4.4), hl: [WATER, { ...COMPTON, label: "edge 3 · the Compton line" }] },
    { at: "electron volts", units: true, unitsFor: 8, hl: [COMPTON, { obj: "Electron", label: "electron" }] },
    { at: "that's einstein", hl: [{ card: "E = mc²", hold: 2.2 }] },
    { at: "deep down", hl: [COMPTON, { obj: "Electron", label: false }] },
    { at: "also has a wavelength", cam: C(-9.9, -27.3, 3.6), hl: [COMPTON, { obj: "Electron", label: "its wavelength" }] },
    { at: "shorter its wavelength", hl: [COMPTON, { obj: "Electron", label: false }, { obj: "Proton", label: "more energy: smaller", delay: 0.3 }] },
    { at: "squeeze something smaller", hl: [COMPTON, { side: "left", of: "compton", label: "can't squeeze" }] },
    { at: "makes new particles", hl: [COMPTON, { side: "left", of: "compton", label: "new pairs" }, { obj: "Electron", label: "e⁻ e⁺ pairs" }] },
    { at: "nothing can be smaller than its own", hl: [{ ...COMPTON, label: "the quantum limit" }] },
    { at: "heavier something is", cam: C(-11.2, -26.0, 5.5), hl: [COMPTON, { obj: "Electron", label: false }, { obj: "Proton", label: "heavier: smaller", delay: 0.4 }] },
    { at: "cross to the other side", hl: [COMPTON, { side: "left", of: "compton", label: "nothing" }] },
    { at: "quantum limit of our triangle", hl: [{ ...COMPTON, label: "edge 3" }] },

    // ── Particles and light, all on the line ─────────────────
    // a held frame, not a glide waypoint: radio (top right) to gamma rays all on screen while they're named
    { at: "something very cool", cam: { r: -4.8, m: -32, span: 16 }, dur: 3.5, drift: 0.03, clear: true, hl: [COMPTON] },
    { at: "every particle sits here", hl: [COMPTON, ...few(PARTICLES, "particles", 0.3)] },
    { at: "so does light", spectrum: true, hl: [COMPTON, ...few(LIGHT, "light", 0.25)] },
    { at: "radio waves", hl: [COMPTON, { obj: "FM Radio", label: "radio" }] },
    { at: "gamma rays down here", hl: [COMPTON, { obj: "FM Radio", label: false }, { obj: "Gamma Ray", label: "gamma rays" }] },

    // ── Where matter meets light ─────────────────────────────
    { at: "interesting question", spectrum: false, cam: DOWN(-8.6, 6), dur: 3, clear: true, hl: [{ ...WATER, label: "ordinary matter" }] },
    { at: "crosses the compton line", cam: C(-9.6, -27.6, 3), hl: [WATER, COMPTON, { cross: CROSS }] },
    { at: "gamma rays become", hl: [WATER, COMPTON, { obj: "X-ray", label: "X-rays", place: "left" }, { obj: "Gamma Ray", label: "gamma rays", delay: 0.4 }] },
    { at: "radioactive atom decays", cam: C(-9.2, -25.3, 5),
      hl: [WATER, COMPTON, { obj: "Uranium", label: "radioactive atom" }, { arrow: true, from: { obj: "Uranium" }, to: { obj: "Gamma Ray" }, delay: 1 }, { obj: "Gamma Ray", delay: 1.6 }] },
    { at: "converting a little bit of matter", hl: [COMPTON, { obj: "Uranium", label: false }, { arrow: true, from: { obj: "Uranium" }, to: { obj: "Gamma Ray" }, draw: 0.01 }, { obj: "Gamma Ray", label: "matter → energy" }] },
    { at: "matter turning into light", hl: [COMPTON, { obj: "Uranium", label: false }, { arrow: true, from: { obj: "Uranium" }, to: { obj: "Gamma Ray" }, draw: 0.01 }, { obj: "Gamma Ray", label: "matter → light" }] },

    // ── The hook: wavelengths ────────────────────────────────
    { at: "light itself", cam: { r: -4.8, m: -32.2, span: 16 }, dur: 4, drift: 0.04, spectrum: true, clear: true, hl: [COMPTON, ...few(LIGHT, false, 0.2)] },
    { at: "wavelengths of light", hl: [COMPTON, ...few(LIGHT, false, 0), { obj: "Visible Light", label: "next: wavelengths of light" }] },
  ],
};
