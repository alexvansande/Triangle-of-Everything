// =============================================================
// DATA.JS — Physics constants, boundary equations, and reference data
// =============================================================
//
// This file contains all the scientific constants, line equations,
// unit definitions, and category styles used by the visualization.
// Everything is in CGS units (centimeters, grams, seconds) because
// that's the natural system for a chart spanning subatomic to cosmic scales.
//
// THE THREE BOUNDARIES (forming the Triangle of Everything):
//
// 1. SCHWARZSCHILD RADIUS (slope +1 in log-log)
//    r_s = 2GM/c² → logR = logM + log(2G/c²)
//    Objects above this line would be black holes.
//
// 2. COMPTON WAVELENGTH (slope -1 in log-log)
//    λ_c = ħ/(Mc) → logR = -logM + log(ħ/c)
//    Objects below this line enter quantum territory.
//
// 3. HUBBLE RADIUS (vertical line)
//    R_H = c/H₀ ≈ 1.37 × 10²⁸ cm
//    The edge of the observable universe.
//
// These three lines intersect at the PLANCK SCALE, forming the
// apex of the triangle. All known objects live inside.
//
// =============================================================

// --- Fundamental constants in CGS ---
export const G = 6.674e-8;          // gravitational constant (cm³ g⁻¹ s⁻²)
export const c = 2.998e10;          // speed of light (cm/s)
export const hbar = 1.055e-27;      // reduced Planck constant (g cm² s⁻¹)
export const M_SUN = 1.989e33;      // solar mass (g)
export const M_EARTH = 5.972e27;    // Earth mass (g)

// --- Boundary line constants (log₁₀ offsets) ---
export const SCHWARZSCHILD_C = Math.log10(2 * G / (c * c));  // ≈ -27.828
export const COMPTON_C = Math.log10(hbar / c);                // ≈ -37.454

// Schwarzschild: given mass → radius, or radius → mass
export const schwarzschildR = (logM) => logM + SCHWARZSCHILD_C;
export const schwarzschildM = (logR) => logR - SCHWARZSCHILD_C;

// Compton: given mass → wavelength, or wavelength → mass
export const comptonR = (logM) => -logM + COMPTON_C;
export const comptonM = (logR) => -logR + COMPTON_C;

// Planck scale — where Schwarzschild and Compton lines cross.
// These are the chart's own Planck units, defined with the coupling 2G —
// the combination nature uses on both dark edges of the triangle
// (r_s = 2Gm/c² and R_H = 2GM/c²) — so the apex lands exactly at
// (1 Planck length, 1 Planck mass) in Planck grid mode.
export const PLANCK_LOG_R = (SCHWARZSCHILD_C + COMPTON_C) / 2; // ≈ -32.64
export const PLANCK_LOG_M = PLANCK_LOG_R - SCHWARZSCHILD_C;    // ≈ -4.81

// CODATA ("textbook") Planck scale — defined with bare G, √2 away from the
// chart convention above. Used by the "planck-true" grid mode.
export const PLANCK_TRUE_LOG_R = 0.5 * Math.log10(hbar * G / (c * c * c)); // ≈ -32.79
export const PLANCK_TRUE_LOG_M = 0.5 * Math.log10(hbar * c / G);           // ≈ -4.66

// Hubble radius — the rightmost vertical boundary
export const HUBBLE_LOG_R = 28.14;   // log₁₀(1.37 × 10²⁸ cm)
export const DE_SITTER_LOG_R = 28.2; // log₁₀(c/H∞) — asymptotic Hubble radius in dark-energy-dominated future

// --- Isodensity line equation ---
// For a uniform sphere: ρ = M / (4π/3 · R³)
// → logM = 3·logR + log(4π/3) + logρ
// These diagonal lines (slope 3) are both density AND time markers.
export const DENSITY_SPHERE_C = Math.log10(4 * Math.PI / 3);   // ≈ 0.622
export const densityLineM = (logR, logDensity) => 3 * logR + DENSITY_SPHERE_C + logDensity;
export const densityLineR = (logM, logDensity) => (logM - DENSITY_SPHERE_C - logDensity) / 3;

// =============================================================
// Chart bounds — the full data range shown at zoom=1
// =============================================================
// x: log₁₀(radius / cm),  y: log₁₀(mass / g)
// Slightly wider than the triangle to show labels and context.

export const BOUNDS = {
  x: { min: -38, max: 32 },  // Planck length to beyond Hubble radius
  y: { min: -48, max: 65 },  // lightest neutrinos to above observable universe mass
};

// =============================================================
// Isodensity / epoch line definitions
// =============================================================
// Each entry defines a diagonal line of constant density.
// logDensity is log₁₀(ρ / g·cm⁻³).
// epoch:true means it also marks a cosmological era boundary.

export const DENSITY_LINES = [
  { logDensity: 93.7,  label: "Planck 10⁻⁴³ s",        color: "#ffffff", epoch: true },
  { logDensity: 76,    label: "GUT 10⁻³⁶ s",            color: "#ffffff", epoch: true },

  { logDensity: 25,    label: "EW 10⁻¹¹ s",             color: "#ffffff", epoch: true },
  { logDensity: 14.4,  label: "nuclear 10⁻⁶ s",         color: "#ffcc80", epoch: true },
  { logDensity: 4,     label: "BBN ~1 s",                color: "#ffe082", epoch: true },
  { logDensity: 0,     label: "water",                    color: "#80deea", epoch: false },
  { logDensity: -2.9,  label: "air",                      color: "#b0bec5", epoch: false },
  { logDensity: -19,   label: "matter=radiation",         color: "#ce93d8", epoch: true },
  { logDensity: -21,   label: "recomb. 10¹³ s (CMB)",    color: "#ffab91", epoch: true },
  { logDensity: -24,   label: "interstellar gas (~1 atom/cm³)", color: "#a5d6a7", epoch: false },
  { logDensity: -29.5, label: "now (current matter)",     color: "#ef9a9a", epoch: true },
];

// Epoch bands — semi-transparent fills between consecutive density lines,
// representing different phases of the universe's evolution.
export const EPOCH_BANDS = [
  { logDensityMin: 93.7,  logDensityMax: 200,   label: "Planck era",         color: "rgba(255,255,255,0.02)" },
  { logDensityMin: 25,    logDensityMax: 93.7,   label: "Radiation dominated", color: "rgba(255,100,100,0.015)" },
  { logDensityMin: -19,   logDensityMax: 25,     label: "",                    color: "rgba(255,150,100,0.01)" },
  { logDensityMin: -29.5, logDensityMax: -19,    label: "Matter dominated",    color: "rgba(100,150,255,0.015)" },
  { logDensityMin: -50,   logDensityMax: -29.5,  label: "Dark energy dominated", color: "rgba(180,180,180,0.01)" },
];

// =============================================================
// Unit reference markers — small red dashes on the axes
// =============================================================
// These appear as labeled tick marks at specific physical scales.
// logR/logM values are in CGS (cm for radius, g for mass).
//
// RADIUS_UNITS: two rows on the bottom axis
//   Row 1: metric/SI units (fm, nm, μm, mm, cm, m, km)
//   Row 2: imperial + astronomical (inch, foot, mile, AU, ly, pc)

// The horizontal axis READS width/diameter: an object's stored logR is its
// radius, so every displayed size is logR + WIDTH_LOG_OFFSET (i.e. ×2).
// Unit markers below sit where objects of that WIDTH sit (radius = width/2),
// hence the −W on each. The Planck-length and Hubble-R labels name the
// chart's radius-defined boundaries and stay anchored to them.
export const WIDTH_LOG_OFFSET = Math.log10(2); // ≈ 0.301
const W = WIDTH_LOG_OFFSET;

export const RADIUS_UNITS = [
  { logR: PLANCK_LOG_R, label: "1 Planck length", row: 1, slug: "planck-length" },
  { logR: -13 - W,    label: "1 fm",            row: 1, slug: "metric-units" },
  { logR: -9 - W,     label: "10 pm",           row: 1, slug: "metric-units" },
  { logR: -8 - W,     label: "1 Å",             row: 1, slug: "metric-units" },
  { logR: -7 - W,     label: "1 nm",            row: 1, slug: "metric-units" },
  { logR: -4 - W,     label: "1 μm",            row: 1, slug: "metric-units" },
  { logR: -1 - W,     label: "1 mm",            row: 1, slug: "metric-units" },
  { logR: 0 - W,      label: "1 cm",            row: 1, slug: "metric-units" },
  { logR: 2 - W,      label: "1 meter",         row: 1, slug: "metric-units" },
  { logR: 5 - W,      label: "1 km",            row: 1, slug: "metric-units" },
  { logR: 8 - W,      label: "1000 km",         row: 1, slug: "metric-units" },
  { logR: 11 - W,     label: "1M km",           row: 1, slug: "metric-units" },
  { logR: 0.405 - W,  label: "1 inch",          row: 2, slug: "imperial-units" },
  { logR: 1.484 - W,  label: "1 foot",          row: 2, slug: "imperial-units" },
  { logR: 5.207 - W,  label: "1 mile",          row: 2, slug: "imperial-units" },
  { logR: 10.477 - W, label: "1 light-second",  row: 2, slug: "imperial-units" },
  { logR: 13.175 - W, label: "1 AU",            row: 2, slug: "imperial-units" },
  { logR: 17.976 - W, label: "1 light-year",    row: 2, slug: "imperial-units" },
  { logR: 18.489 - W, label: "1 parsec",        row: 2, slug: "imperial-units" },
  { logR: 20.976 - W, label: "1,000 ly",        row: 2, slug: "imperial-units" },
  { logR: 21.489 - W, label: "1 kpc",           row: 2, slug: "imperial-units" },
  { logR: 23.976 - W, label: "1M ly",           row: 2, slug: "imperial-units" },
  { logR: 24.489 - W, label: "1 Mpc",           row: 2, slug: "imperial-units" },
  { logR: 26.976 - W, label: "1B ly",           row: 2, slug: "imperial-units" },
  { logR: 27.489 - W, label: "1 Gpc",           row: 2, slug: "imperial-units" },
  { logR: 28.14,  label: "Hubble R",        row: 2, slug: "imperial-units" },
];

// MASS_UNITS: right axis — from eV/c² up to 10¹⁵ M☉
export const MASS_UNITS = [
  { logM: -32.75, label: "1 eV/c²", slug: "mass-units" },
  { logM: -29.75, label: "1 keV/c²", slug: "mass-units" },
  { logM: -27.04, label: "electron", slug: "mass-units" },
  { logM: -26.75, label: "1 MeV/c²", slug: "mass-units" },
  { logM: -23.78, label: "proton", slug: "mass-units" },
  { logM: -23.75, label: "1 GeV/c²", slug: "mass-units" },
  { logM: -20.75, label: "1 TeV/c²", slug: "mass-units" },
  { logM: -15,    label: "1 pg", slug: "mass-units" },
  { logM: -12,    label: "1 ng", slug: "mass-units" },
  { logM: -9,     label: "1 μg", slug: "mass-units" },
  { logM: -6,     label: "1 mg", slug: "mass-units" },
  { logM: PLANCK_LOG_M, label: "Planck", slug: "planck-mass" },
  { logM: 0,      label: "1 gram", slug: "mass-units" },
  { logM: 1.45,   label: "1 oz", slug: "mass-units" },
  { logM: 2.66,   label: "1 lb", slug: "mass-units" },
  { logM: 3,      label: "1 kg", slug: "mass-units" },
  { logM: 6,      label: "1 tonne", slug: "mass-units" },
  { logM: 9,      label: "1 kt", slug: "mass-units" },
  { logM: 12,     label: "1 Mt", slug: "mass-units" },
  { logM: 15,     label: "1 Gt", slug: "mass-units" },
  { logM: 27.78,  label: "Earth", slug: "mass-units" },
  { logM: 30.28,  label: "Jupiter", slug: "mass-units" },
  { logM: 33.30,  label: "1 M☉", slug: "mass-units" },
  { logM: 36.30,  label: "10³ M☉", slug: "mass-units" },
  { logM: 39.30,  label: "10⁶ M☉", slug: "mass-units" },
  { logM: 42.30,  label: "10⁹ M☉", slug: "mass-units" },
  { logM: 45.30,  label: "10¹² M☉", slug: "mass-units" },
  { logM: 48.30,  label: "10¹⁵ M☉", slug: "mass-units" },
];

// ENERGY_UNITS: left axis — shows both energy and temperature scales.
// Mass ↔ Energy:      E = mc²  → log(E/eV) = logM + 32.75
// Mass ↔ Temperature: T = mc²/kB → log(T/K) = logM + 36.81
// This dual-mapping lets us show eV, keV, GeV alongside K, °C, °F.
const LOG_EV_OFFSET = 32.75;
const LOG_K_OFFSET  = 36.81;

export const ENERGY_UNITS = [
  { logM: -35.75, label: "1 meV", slug: "energy-units" },
  { logM: -32.75, label: "1 eV", slug: "energy-units" },
  { logM: -29.75, label: "1 keV", slug: "energy-units" },
  { logM: -26.75, label: "1 MeV", slug: "energy-units" },
  { logM: -23.75, label: "1 GeV", slug: "energy-units" },
  { logM: -20.75, label: "1 TeV", slug: "energy-units" },
  { logM: PLANCK_LOG_M, label: "PLANCK\nENERGY", slug: "planck-energy" },
  { logM: -36.81,                          label: "1 K", slug: "energy-units" },
  { logM: -36.81 + Math.log10(2.725),     label: "2.7 K (CMB)", slug: "energy-units" },
  { logM: -36.81 + Math.log10(273.15),    label: "0°C", slug: "energy-units" },
  { logM: -36.81 + Math.log10(293.15),    label: "20°C (room)", slug: "energy-units" },
  { logM: -36.81 + Math.log10(373.15),    label: "100°C", slug: "energy-units" },
  { logM: -36.81 + 3,                     label: "1000 K", slug: "energy-units" },
  { logM: -36.81 + Math.log10(1273.15),   label: "1000°C", slug: "energy-units" },
  { logM: -36.81 + 6,                     label: "1M K", slug: "energy-units" },
  { logM: -36.81 + Math.log10(1e6 + 273.15), label: "1M°C", slug: "energy-units" },
  { logM: -36.81 + 9,                     label: "1 B K", slug: "energy-units" },
  { logM: -36.81 + Math.log10(255.37),    label: "0°F", slug: "energy-units" },
  { logM: -36.81 + Math.log10(310.93),    label: "100°F", slug: "energy-units" },
];

// =============================================================
// Object categories — color coding and visual style
// =============================================================
// Each object in objects.json has a "cat" field matching one of
// these keys. The color determines dot, label, and sidebar accent.

const CAT = {
  particle:  { color: "#00e5ff", shape: "diamond" },
  composite: { color: "#ff9800", shape: "circle" },
  atomic:    { color: "#64ffda", shape: "circle" },
  micro:     { color: "#76ff03", shape: "circle" },
  macro:     { color: "#69f0ae", shape: "circle" },
  planet:    { color: "#448aff", shape: "circle" },
  star:      { color: "#ffd740", shape: "circle" },
  remnant:   { color: "#e0e0e0", shape: "circle" },
  blackhole: { color: "#ff1744", shape: "circle" },
  galaxy:    { color: "#d500f9", shape: "circle" },
  largescale:{ color: "#f48fb1", shape: "circle" },
};

// =============================================================
// Reference lines — non-density diagonals drawn on the chart
// =============================================================
// These are empirical trend lines (not physics boundaries).
// "Main Sequence" and "Red Giants" show where stars cluster
// on the mass-radius plane. Width=0 hides the Schwarzschild
// entry (its boundary is drawn separately by drawBoundaries).

export const REFERENCE_LINES = [
  {
    label: "Main Sequence",
    points: [{ logR: 9.6, logM: 31.8 }, { logR: 12.4, logM: 35.3 }],
    color: "rgba(255,215,64,0.15)", width: 1, dash: "4 3",
  },
  {
    label: "Red Giants",
    points: [{ logR: 12.0, logM: 33.0 }, { logR: 14.5, logM: 34.5 }],
    color: "rgba(255,130,50,0.12)", width: 1, dash: "4 3",
  },
  {
    label: "Chandrasekhar Limit (1.44 M☉)",
    points: [{ logR: 5.5, logM: 33.46 }, { logR: 9.5, logM: 33.46 }],
    color: "rgba(180,180,255,0.2)", width: 0.8, dash: "6 4",
  },
  {
    label: "TOV Limit (~2.1 M☉)",
    points: [{ logR: 5.5, logM: 33.62 }, { logR: 9.5, logM: 33.62 }],
    color: "rgba(255,100,100,0.2)", width: 0.8, dash: "6 4",
  },
  {
    // Quark-Gluon Plasma transition: ~1 GeV/fm³ ≈ 1.7×10¹⁵ g/cm³, logρ ≈ 15.25
    // Diagonal density line: logM = 3·logR + log(4π/3) + 15.25
    label: "Quark-Gluon Plasma",
    points: [{ logR: -20, logM: 3 * -20 + 15.87 }, { logR: 5, logM: 3 * 5 + 15.87 }],
    color: "rgba(0,229,255,0.2)", width: 0.8, dash: "6 4",
  },
  {
    label: "Schwarzschild Radius",
    points: [{ logR: -32.5, logM: -4.7 }, { logR: 28.5, logM: 56.3 }],
    color: "rgba(255,51,85,0)", width: 0, dash: "",
  },
];

// =============================================================
// Connection Paths — animated relationships between objects
// =============================================================
// Each path defines a visual connection with moving dots.
// family: "spectrum" | "evolution" | "decay" | "combines"
// Dots flow forward along the path (from first point to last).

export const CONNECTION_PATHS = [
  {
    id: "em-spectrum",
    family: "spectrum",
    description: "The electromagnetic spectrum — from gamma rays to radio waves, all photons travel at the speed of light",
    points: [
      { logR: -10.3, logM: -26.66 },
      { logR: -8.3,  logM: -28.66 },
      { logR: -5.3,  logM: -31.66 },
      { logR: -4.56, logM: -32.40 },
      { logR: -3.3,  logM: -33.66 },
      { logR: -1.3,  logM: -35.66 },
      { logR: -0.3,  logM: -36.66 },
      { logR: 2.18,  logM: -39.14 },
      { logR: 4.18,  logM: -41.14 },
    ],
    zoomRange: [0.8, 800],
    style: {
      lineOpacity: 0.20,
      lineWidth: 1.8,
      dotCount: 30,
      dotSize: 1.2,
      dotSpeed: 1.0,
    },
  },
  {
    id: "stellar-low-mass",
    family: "evolution",
    description: "Stars are born in nurseries, live on the main sequence, swell into red giants, and die as white dwarfs",
    points: [
      { logR: 19.0,  logM: 35.5 },
      { logR: 14.5,  logM: 34.5 },
      { logR: 11.14, logM: 33.0 },
      { logR: 10.84, logM: 33.3 },
      { logR: 12.85, logM: 33.3 },
      { logR: 13.14, logM: 33.6 },
      { logR: 16.97, logM: 33.35 },
      { logR: 17.5,  logM: 33.3 },
      { logR: 14.0,  logM: 33.0 },
      { logR: 11.0,  logM: 33.0 },
      { logR: 8.85,  logM: 33.15 },
    ],
    zoomRange: [1.5, 800],
    neighborhood: { x: [5, 22], y: [30, 38] },
    style: {
      lineOpacity: 0.20,
      lineWidth: 1.4,
      dotCount: 14,
      dotSize: 1.6,
      dotSpeed: 0.9,
      color: "rgba(255,215,64,0.6)",
    },
  },
  {
    id: "stellar-high-mass",
    family: "evolution",
    description: "Massive stars burn fast — born in nurseries, they become supergiants and die in supernovae",
    points: [
      { logR: 19.0,  logM: 35.5 },
      { logR: 14.5,  logM: 34.5 },
      { logR: 11.84, logM: 34.8 },
      { logR: 12.24, logM: 34.7 },
      { logR: 13.6,  logM: 34.1 },
      { logR: 18.72, logM: 33.8 },
      { logR: 14.0,  logM: 33.6 },
      { logR: 10.0,  logM: 33.5 },
      { logR: 6.0,   logM: 33.45 },
    ],
    zoomRange: [1.5, 800],
    neighborhood: { x: [3, 22], y: [30, 38] },
    style: {
      lineOpacity: 0.20,
      lineWidth: 1.4,
      dotCount: 14,
      dotSize: 1.6,
      dotSpeed: 0.9,
      color: "rgba(224,224,224,0.5)",
    },
  },
  {
    id: "quark-cascade",
    family: "decay",
    description: "Heavy quarks decay through the weak force — top → bottom → charm → strange → down → up",
    points: [
      { logR: -15.94, logM: -21.51 },  // Top
      { logR: -14.33, logM: -23.13 },  // Bottom
      { logR: -13.81, logM: -23.65 },  // Charm
      { logR: -12.68, logM: -24.77 },  // Strange
      { logR: -11.37, logM: -26.08 },  // Down
      { logR: -11.04, logM: -26.41 },  // Up
    ],
    zoomRange: [3, 800],
    neighborhood: { x: [-18, -8], y: [-29, -19] },
    style: {
      lineOpacity: 0.18,
      lineWidth: 1.2,
      dotCount: 16,
      dotSize: 0.9,
      dotSpeed: 0.8,
      color: "rgba(0,229,255,0.5)",
    },
  },
  {
    id: "lepton-cascade",
    family: "decay",
    description: "Heavy leptons decay through the weak force — tau → muon → electron",
    points: [
      { logR: -13.95, logM: -23.50 },  // Tau
      { logR: -12.72, logM: -24.73 },  // Muon
      { logR: -10.41, logM: -27.04 },  // Electron
    ],
    zoomRange: [3, 800],
    neighborhood: { x: [-18, -8], y: [-29, -19] },
    style: {
      lineOpacity: 0.18,
      lineWidth: 1.2,
      dotCount: 10,
      dotSize: 0.9,
      dotSpeed: 0.8,
      color: "rgba(0,229,255,0.5)",
    },
  },
  {
    id: "up-to-proton",
    family: "combines",
    description: "Two up quarks combine inside a proton (uud)",
    points: [
      { logR: -11.04, logM: -26.41 },  // Up quark
      { logR: -13.06, logM: -23.78 },  // Proton
    ],
    zoomRange: [4, 800],
    neighborhood: { x: [-16, -7], y: [-29, -21] },
    style: {
      lineOpacity: 0.15,
      lineWidth: 1.4,
      dotCount: 8,
      dotSize: 0.8,
      dotSpeed: 0.7,
      color: "rgba(255,152,0,0.5)",
      dash: "4 3",
    },
  },
  {
    id: "down-to-proton",
    family: "combines",
    description: "A down quark joins two up quarks to form a proton (uud)",
    points: [
      { logR: -11.37, logM: -26.08 },  // Down quark
      { logR: -13.06, logM: -23.78 },  // Proton
    ],
    zoomRange: [4, 800],
    neighborhood: { x: [-16, -7], y: [-29, -21] },
    style: {
      lineOpacity: 0.15,
      lineWidth: 1.4,
      dotCount: 8,
      dotSize: 0.8,
      dotSpeed: 0.7,
      color: "rgba(255,152,0,0.5)",
      dash: "4 3",
    },
  },
  {
    id: "proton-to-hydrogen",
    family: "combines",
    description: "A proton captures an electron to form a hydrogen atom",
    points: [
      { logR: -13.06, logM: -23.78 },  // Proton
      { logR: -8.28,  logM: -23.78 },  // Hydrogen
    ],
    zoomRange: [4, 800],
    neighborhood: { x: [-16, -6], y: [-27, -21] },
    style: {
      lineOpacity: 0.15,
      lineWidth: 1.4,
      dotCount: 8,
      dotSize: 0.8,
      dotSpeed: 0.7,
      color: "rgba(255,152,0,0.5)",
      dash: "4 3",
    },
  },
  {
    id: "electron-to-hydrogen",
    family: "combines",
    description: "An electron binds to a proton to form hydrogen",
    points: [
      { logR: -10.41, logM: -27.04 },  // Electron
      { logR: -8.28,  logM: -23.78 },  // Hydrogen
    ],
    zoomRange: [4, 800],
    neighborhood: { x: [-14, -6], y: [-29, -21] },
    style: {
      lineOpacity: 0.15,
      lineWidth: 1.4,
      dotCount: 8,
      dotSize: 0.8,
      dotSpeed: 0.7,
      color: "rgba(255,152,0,0.5)",
      dash: "4 3",
    },
  },
  {
    id: "stellar-to-bh",
    family: "evolution",
    description: "After a supernova, the core collapses into a stellar black hole",
    points: [
      { logR: 18.72, logM: 33.8 },
      { logR: 14.0,  logM: 34.0 },
      { logR: 10.0,  logM: 34.2 },
      { logR: 6.47,  logM: 34.3 },
    ],
    zoomRange: [1.5, 800],
    neighborhood: { x: [3, 22], y: [30, 38] },
    style: {
      lineOpacity: 0.18,
      lineWidth: 1.2,
      dotCount: 10,
      dotSize: 1.4,
      dotSpeed: 0.8,
      color: "rgba(255,23,68,0.5)",
    },
  },
  {
    id: "remnant-to-nursery",
    family: "evolution",
    description: "Supernova remnants and planetary nebulae seed new stellar nurseries — stars are recycled",
    points: [
      { logR: 18.72, logM: 33.80 },
      { logR: 19.1,  logM: 34.2 },
      { logR: 19.5,  logM: 34.8 },
      { logR: 19.00, logM: 35.50 },
    ],
    zoomRange: [1.5, 800],
    neighborhood: { x: [14, 22], y: [30, 38] },
    style: {
      lineOpacity: 0.20,
      lineWidth: 1.2,
      dotCount: 8,
      dotSize: 1.4,
      dotSpeed: 0.7,
      color: "rgba(176,130,255,0.5)",
    },
  },
  {
    id: "nebula-to-nursery",
    family: "evolution",
    description: "Planetary nebulae enrich the interstellar medium, fueling the next generation of stars",
    points: [
      { logR: 17.50, logM: 33.30 },
      { logR: 18.2,  logM: 33.8 },
      { logR: 19.2,  logM: 34.6 },
      { logR: 19.00, logM: 35.50 },
    ],
    zoomRange: [1.5, 800],
    neighborhood: { x: [14, 22], y: [30, 38] },
    style: {
      lineOpacity: 0.20,
      lineWidth: 1.2,
      dotCount: 8,
      dotSize: 1.4,
      dotSpeed: 0.7,
      color: "rgba(176,130,255,0.5)",
    },
  },
  {
    id: "bh-mergers",
    family: "evolution",
    description: "Black holes grow along the Schwarzschild radius — from stellar black holes to supermassive giants",
    points: [
      { logR: schwarzschildR(34.30) + 0.4, logM: 34.30 },
      { logR: schwarzschildR(43.12) + 0.4, logM: 43.12 },
    ],
    zoomRange: [1.0, 800],
    neighborhood: { x: [3, 18], y: [32, 46] },
    style: {
      lineOpacity: 0.18,
      lineWidth: 1.2,
      dotCount: 10,
      dotSize: 1.4,
      dotSpeed: 0.6,
      color: "rgba(255,23,68,0.5)",
    },
  },
  {
    id: "adenine-to-dna",
    family: "combines",
    description: "Adenine pairs with Thymine (A-T) in the DNA double helix",
    // One gentle arc base → DNA (bow fans the four apart)
    curve: "arc", bow: -0.08,
    points: [
      { logR: -7.52, logM: -21.65 },
      { logR: -6.77, logM: -19.95 },   // DNA (one helix turn)
    ],
    zoomRange: [5, 800],
    neighborhood: { x: [-9, -5], y: [-23, -17] },
    style: {
      lineOpacity: 0.15,
      lineWidth: 1.4,
      dotCount: 6,
      dotSize: 0.8,
      dotSpeed: 0.7,
      color: "rgba(76,175,80,0.5)",
      dash: "4 3",
    },
  },
  {
    id: "guanine-to-dna",
    family: "combines",
    description: "Guanine pairs with Cytosine (G-C) in the DNA double helix",
    // One gentle arc base → DNA (bow fans the four apart)
    curve: "arc", bow: -0.03,
    points: [
      { logR: -7.50, logM: -21.60 },
      { logR: -6.77, logM: -19.95 },   // DNA (one helix turn)
    ],
    zoomRange: [5, 800],
    neighborhood: { x: [-9, -5], y: [-23, -17] },
    style: {
      lineOpacity: 0.15,
      lineWidth: 1.4,
      dotCount: 6,
      dotSize: 0.8,
      dotSpeed: 0.7,
      color: "rgba(76,175,80,0.5)",
      dash: "4 3",
    },
  },
  {
    id: "cytosine-to-dna",
    family: "combines",
    description: "Cytosine pairs with Guanine (C-G) in the DNA double helix",
    // One gentle arc base → DNA (bow fans the four apart)
    curve: "arc", bow: 0.03,
    points: [
      { logR: -7.56, logM: -21.73 },
      { logR: -6.77, logM: -19.95 },   // DNA (one helix turn)
    ],
    zoomRange: [5, 800],
    neighborhood: { x: [-9, -5], y: [-23, -17] },
    style: {
      lineOpacity: 0.15,
      lineWidth: 1.4,
      dotCount: 6,
      dotSize: 0.8,
      dotSpeed: 0.7,
      color: "rgba(76,175,80,0.5)",
      dash: "4 3",
    },
  },
  {
    id: "thymine-to-dna",
    family: "combines",
    description: "Thymine pairs with Adenine (T-A) in the DNA double helix",
    // One gentle arc base → DNA (bow fans the four apart)
    curve: "arc", bow: 0.08,
    points: [
      { logR: -7.54, logM: -21.68 },
      { logR: -6.77, logM: -19.95 },   // DNA (one helix turn)
    ],
    zoomRange: [5, 800],
    neighborhood: { x: [-9, -5], y: [-23, -17] },
    style: {
      lineOpacity: 0.15,
      lineWidth: 1.4,
      dotCount: 6,
      dotSize: 0.8,
      dotSpeed: 0.7,
      color: "rgba(76,175,80,0.5)",
      dash: "4 3",
    },
  },
];

export const CATEGORIES = CAT;

// Subtle color shading per subcategory — helps distinguish overlapping groups
// (e.g. moons vs dwarf planets vs asteroids in the same mass-radius region)
// Only subcats that differ from their parent category color need entries.
export const SUBCAT_COLORS = {
  asteroid:          "#7a9cc0",   // desaturated grey-blue — rocky debris
  comet:             "#60a8d8",   // cyan-tinged — icy bodies
  moon:              "#6fa0f0",   // lighter periwinkle — reflected light
  dwarf_planet:      "#7080dd",   // lavender-blue — in-between status
  terrestrial_planet:"#448aff",   // canonical planet blue (same as cat)
  gas_giant:         "#2e74ff",   // deeper vivid blue — massive worlds
  exoplanet:         "#5590dd",   // muted blue — distant / uncertain
  molecule:          "#3d6bff",   // deep blue — bonded atoms, clearly apart from the teal atoms
};

// Text colour for subcategories whose dot colour is too deep to read as a
// label on the dark chart (the dots keep the deep colour).
export const SUBCAT_LABEL_COLORS = { molecule: "#8fa8ff" };

// Dust catalogues coloured as a subcategory rather than their category.
export const DUST_SOURCE_SUBCAT = { molecule: "molecule", protein: "molecule" };

// Subcategories for cluster labels — when objects are too close, show one label
// Key: subcat value in objects.json. Value: display label for the cluster.
// Fallback when cluster has mixed subcats
export const CAT_DISPLAY = {
  particle: "Particles", composite: "Nucleons", atomic: "Atoms & Molecules",
  micro: "Microscopic", macro: "", planet: "Planets",
  star: "Stars", remnant: "Remnants", blackhole: "Black Holes",
  galaxy: "Galaxies", largescale: "Large Scale",
};

// =============================================================
// Periodic-table guides — labels that follow the element dust
// =============================================================
// The element dust (calculated atomic radii, Guerra et al. 2017) shows the
// periodic table as a sawtooth: within a period atoms get heavier but
// SMALLER, then a new electron shell makes the next alkali metal balloon.
// When zoomed in, each period (and the alkali / noble-gas columns and the
// lanthanide clump) gets a quiet label laid along its dots. Names must
// match the element dust or the hand-placed atoms in objects.json.
export const ELEMENT_GUIDES = [
  { label: "Period 1", kind: "row", elements: ["Hydrogen", "Helium"] },
  { label: "Period 2", kind: "row", elements: ["Lithium", "Beryllium", "Boron", "Carbon", "Nitrogen", "Oxygen", "Fluorine", "Neon"] },
  { label: "Period 3", kind: "row", elements: ["Sodium", "Magnesium", "Aluminum", "Silicon", "Phosphorus", "Sulfur", "Chlorine", "Argon"] },
  { label: "Period 4", kind: "row", elements: ["Potassium", "Calcium", "Scandium", "Titanium", "Vanadium", "Chromium", "Manganese", "Iron", "Cobalt", "Nickel", "Copper", "Zinc", "Gallium", "Germanium", "Arsenic", "Selenium", "Bromine", "Krypton"] },
  { label: "Period 5", kind: "row", elements: ["Rubidium", "Strontium", "Yttrium", "Zirconium", "Niobium", "Molybdenum", "Technetium", "Ruthenium", "Rhodium", "Palladium", "Silver", "Cadmium", "Indium", "Tin", "Antimony", "Tellurium", "Iodine", "Xenon"] },
  { label: "Period 6", kind: "row", elements: ["Cesium", "Barium", "Hafnium", "Tantalum", "Tungsten", "Rhenium", "Osmium", "Iridium", "Platinum", "Gold", "Mercury", "Thallium", "Lead", "Bismuth", "Polonium", "Astatine", "Radon"] },
  { label: "Period 7", kind: "row", elements: ["Francium", "Radium", "Rutherfordium", "Dubnium", "Seaborgium", "Bohrium", "Hassium", "Meitnerium", "Darmstadtium", "Roentgenium", "Copernicium", "Nihonium", "Flerovium", "Moscovium", "Livermorium", "Tennessine", "Oganesson"] },
  { label: "Actinides", kind: "cluster", type: "actinide", elements: ["Actinium", "Thorium", "Protactinium", "Uranium", "Neptunium", "Plutonium", "Americium", "Curium", "Berkelium", "Californium", "Einsteinium", "Fermium", "Mendelevium", "Nobelium", "Lawrencium"] },
  { label: "Lanthanides", kind: "cluster", type: "lanthanide", elements: ["Lanthanum", "Cerium", "Praseodymium", "Neodymium", "Promethium", "Samarium", "Europium", "Gadolinium", "Terbium", "Dysprosium", "Holmium", "Erbium", "Thulium", "Ytterbium", "Lutetium"] },
  { label: "Alkali metals", kind: "column", elements: ["Lithium", "Sodium", "Potassium", "Rubidium", "Cesium", "Francium"] },
  { label: "Noble gases", kind: "column", elements: ["Helium", "Neon", "Argon", "Krypton", "Xenon", "Radon", "Oganesson"] },
];

// The periodic table as a grid, for the "THE PERIODIC TABLE" easter egg:
// every element's cell, worked out from its atomic number alone. The order
// by Z comes from ELEMENT_GUIDES above (periods, with the f-block clumps
// spliced back in), so no element is named twice. Lutetium and lawrencium
// sit in group 3 (IUPAC), leaving the f-block rows as lanthanum–ytterbium
// and actinium–nobelium, 14 wide; hydrogen heads group 1, helium group 18.
const guide = (label) => ELEMENT_GUIDES.find((g) => g.label === label).elements;
export const ELEMENTS_BY_Z = [
  null,
  ...["Period 1", "Period 2", "Period 3", "Period 4", "Period 5"].flatMap(guide),
  ...guide("Period 6").slice(0, 2), ...guide("Lanthanides"), ...guide("Period 6").slice(2),
  ...guide("Period 7").slice(0, 2), ...guide("Actinides"), ...guide("Period 7").slice(2),
];
const PERIOD_START = [1, 3, 11, 19, 37, 55, 87, 119];

/** Where element Z sits in the drawn table: { period, group } in the main
 *  grid (groups 1–18), or { period, f } in a detached f-block row (0–13). */
export function periodicCell(z) {
  const p = PERIOD_START.findIndex((s) => s > z); // 1-based period
  const i = z - PERIOD_START[p - 1];
  if (p === 1) return { period: 1, group: i ? 18 : 1 };
  if (i < 2) return { period: p, group: i + 1 };
  if (p <= 3) return { period: p, group: i + 11 };
  if (p <= 5) return { period: p, group: i + 1 };
  if (i < 16) return { period: p, f: i - 2 };
  return { period: p, group: i === 16 ? 3 : i - 13 };
}

// Element types, the colour key of the drawn table, also from Z alone. The
// metalloid staircase and the nonmetals are the only cells that don't follow
// from the group; superheavies take their group's type, as usually drawn.
export const ELEMENT_TYPES = [
  { id: "alkali",     label: "Alkali metals",          color: "#ff6b6b" },
  { id: "alkaline",   label: "Alkaline earth metals",  color: "#ffa94d" },
  { id: "transition", label: "Transition metals",      color: "#ffd43b" },
  { id: "post",       label: "Post-transition metals", color: "#a9e34b" },
  { id: "metalloid",  label: "Metalloids",             color: "#38d9a9" },
  { id: "nonmetal",   label: "Nonmetals",              color: "#3bc9db" },
  { id: "halogen",    label: "Halogens",               color: "#4dabf7" },
  { id: "noble",      label: "Noble gases",            color: "#9775fa" },
  { id: "lanthanide", label: "Lanthanides",            color: "#f783ac" },
  { id: "actinide",   label: "Actinides",              color: "#da77f2" },
];
const METALLOID_Z = new Set([5, 14, 32, 33, 51, 52]);
const NONMETAL_Z = new Set([1, 6, 7, 8, 15, 16, 34]);

/** Type id (see ELEMENT_TYPES) of element Z. */
export function elementType(z) {
  if (z >= 57 && z <= 71) return "lanthanide";
  if (z >= 89 && z <= 103) return "actinide";
  if (METALLOID_Z.has(z)) return "metalloid";
  if (NONMETAL_Z.has(z)) return "nonmetal";
  const { group } = periodicCell(z);
  if (group === 1) return "alkali";
  if (group === 2) return "alkaline";
  if (group <= 12) return "transition";
  if (group === 17) return "halogen";
  if (group === 18) return "noble";
  return "post";
}

// Family names along the group columns, for the same easter egg. A family
// whose members share one type is drawn in that type's colour; groups 13–16
// cross the metal / nonmetal line and stay neutral. The transition metals
// (groups 3–12) get one label for the whole block.
export const PERIODIC_FAMILIES = [
  { label: "Alkali metals",         groups: [1], type: "alkali" },
  { label: "Alkaline earth metals", groups: [2], type: "alkaline" },
  { label: "Transition metals",     groups: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12], type: "transition" },
  { label: "Boron group",           groups: [13] },
  { label: "Carbon group",          groups: [14] },
  { label: "Pnictogens",            groups: [15] },
  { label: "Chalcogens",            groups: [16] },
  { label: "Halogens",              groups: [17], type: "halogen" },
  { label: "Noble gases",           groups: [18], type: "noble" },
];

// =============================================================
// "Made of" — hover lines from a hand-placed object to its building blocks
// =============================================================
// Hovering one of these draws straight lines to what it's made of, so the
// chain electrons + protons → atoms → molecules → bases → DNA can be read
// across the chart. Names are hand-placed objects or element dust (N, P, S).
// Names may be curated objects or dust points (element dust: Nitrogen, …;
// nucleus dust: "Iron-56 nucleus", …). Atoms are built from their most
// abundant isotope's nucleus plus electrons; hydrogen-1's nucleus IS the
// proton, and oganesson has no measured nucleus, so it skips that step.
export const COMPOSITION = {
  "Hydrogen":       ["Proton", "Electron"],
  "Helium":         ["Helium-4 nucleus", "Electron"],
  "Carbon":         ["Carbon-12 nucleus", "Electron"],
  "Oxygen":         ["Oxygen-16 nucleus", "Electron"],
  "Iron":           ["Iron-56 nucleus", "Electron"],
  "Gold":           ["Gold-197 nucleus", "Electron"],
  "Uranium":        ["Uranium-238 nucleus", "Electron"],
  "Oganesson":      ["Proton", "Neutron", "Electron"],
  "Helium-4 nucleus":    ["Proton", "Neutron"],
  "Carbon-12 nucleus":   ["Proton", "Neutron"],
  "Oxygen-16 nucleus":   ["Proton", "Neutron"],
  "Iron-56 nucleus":     ["Proton", "Neutron"],
  "Gold-197 nucleus":    ["Proton", "Neutron"],
  "Uranium-238 nucleus": ["Proton", "Neutron"],
  "Water (H₂O)":    ["Hydrogen", "Oxygen"],
  "Glucose":        ["Carbon", "Hydrogen", "Oxygen"],
  "Fullerene C₆₀":  ["Carbon"],
  "ATP":            ["Carbon", "Hydrogen", "Nitrogen", "Oxygen", "Phosphorus"],
  "Adenine (A)":    ["Carbon", "Hydrogen", "Nitrogen"],
  "Guanine (G)":    ["Carbon", "Hydrogen", "Nitrogen", "Oxygen"],
  "Cytosine (C)":   ["Carbon", "Hydrogen", "Nitrogen", "Oxygen"],
  "Thymine (T)":    ["Carbon", "Hydrogen", "Nitrogen", "Oxygen"],
  "Hemoglobin":     ["Carbon", "Hydrogen", "Nitrogen", "Oxygen", "Sulfur", "Iron"],
  "DNA":            ["Adenine (A)", "Guanine (G)", "Cytosine (C)", "Thymine (T)"],
};

export const SUBCAT_LABELS = {
  nucleon: "Proton & Neutron",
  atom: "Atoms",
  molecule: "Molecules",
  virus: "Viruses",
  bacterium: "Bacteria",
  moon: "Moons",
  dwarf_planet: "Dwarf Planets",
  asteroid: "Asteroids",
  comet: "Comets",
  terrestrial_planet: "Terrestrial Planets",
  gas_giant: "Gas Giants",
  brown_dwarf: "Brown Dwarfs",
  red_dwarf: "Red Dwarfs",
  white_dwarf: "White Dwarfs",
  neutron_star: "Neutron Stars",
  quark: "Quarks",
  lepton: "Leptons",
  boson: "Bosons",
  primordial_bh: "Primordial Black Holes",
  stellar_bh: "Stellar Black Holes",
  supermassive_bh: "Supermassive Black Holes",
};

// =============================================================
// Dark Matter Search Regions
// =============================================================
// Polygonal areas near the Schwarzschild line where macro dark matter
// has not been excluded by current observations (Jacobs, Starkman & Lynn 2015).
// Coordinates in CGS (logR, logM). Each region hugs the Schwarzschild
// line and extends outward 2-3 log units in radius.
// Mass windows: 55g–10^17 g and 2×10^20 g – 4×10^24 g.

export const DARK_MATTER_REGIONS = [
  {
    id: "dm-window-1",
    label: "Macro DM Window I",
    // logM from ~1.74 (55g) to ~17 (10^17 g)
    // Extends from Schwarzschild line outward ~2–3 log units in R
    polygon: [
      { logR: schwarzschildR(1.74),       logM: 1.74 },
      { logR: schwarzschildR(17),         logM: 17 },
      { logR: schwarzschildR(17) + 3,     logM: 17 },
      { logR: schwarzschildR(1.74) + 3,   logM: 1.74 },
    ],
  },
  {
    id: "dm-window-2",
    label: "Macro DM Window II",
    // logM from ~20.3 (2×10^20 g) to ~24.6 (4×10^24 g)
    polygon: [
      { logR: schwarzschildR(20.3),       logM: 20.3 },
      { logR: schwarzschildR(24.6),       logM: 24.6 },
      { logR: schwarzschildR(24.6) + 3,   logM: 24.6 },
      { logR: schwarzschildR(20.3) + 3,   logM: 20.3 },
    ],
  },
];

// =============================================================
// Energy Level Bands (left side of triangle)
// =============================================================
// Horizontal lines marking energy thresholds, with labels floating
// between them. logM values derived from: log(E_eV) = logM + 32.75
// (converting CGS mass to eV energy for the left axis).

// Energy bands — each entry is a threshold LINE; the label names the region
// BELOW that line (between it and the next lower threshold).
// Sorted highest energy first. The topmost entry (PLANCK ENERGY) gets a
// standalone label above its line; all others label the region between pairs.
export const ENERGY_BANDS = [
  { label: "PLANCK ENERGY",            logM: -4.81,  slug: "planck-energy" },
  { label: "GRAND UNIFICATION*",       logM: -7.75,  slug: "grand-unification-theory" },
  { label: "ELECTROWEAK",              logM: -21.75, slug: "electroweak" },
  { label: "FUNDAMENTAL PARTICLES",    logM: -23.75, slug: "fundamental-particles" },
  { label: "SUPERCONDUCTIVITY",        logM: -35.75, slug: "superconductivity" },
  { label: "BOSE-EINSTEIN CONDENSATE", logM: -41.75, slug: "bose-einstein-condensate" },
  { label: "QUANTUM TUNNELING*",       logM: -44.75, slug: "quantum-tunneling" },
];

// Temperature arrows — specific interesting temperatures shown to the left of the triangle
// logM = -LOG_K_OFFSET + log10(T_kelvin)
export const TEMPERATURE_ARROWS = [
  { label: "Highest Temperature\nReached in a Lab (LHC)", logM: -36.81 + Math.log10(1.5e17), slug: "large-hadron-collider" },
  { label: "Core of the Sun",       logM: -36.81 + Math.log10(1.57e7), slug: null },
  { label: "Boiling Point of\nTungsten", logM: -36.81 + Math.log10(5828), slug: null },
  { label: "Cosmic Microwave\nBackground", logM: -36.81 + Math.log10(2.725), slug: null },
  { label: "Lowest Temperature\nReached in a Lab", logM: -36.81 + Math.log10(3.8e-11), slug: null },
];

// Density arrows — cosmic events marked along the logM=56 timeline
// Past events: logRho = log₁₀(average cosmic density in g/cm³) at the time of each event
// Future events: logYearsFromNow = log₁₀(years from now), positioned between Now and Heat Death
export const DENSITY_ARROWS = [
  { label: "First Stars Form",            logRho: -25,    slug: null, priority: 1 },
  { label: "Life Evolves\non Earth",      logRho: -28.5,  slug: null, priority: 0 },
  // TODO in 1 million years, update this position
  { label: "Now",                         logRho: -29,    slug: null, priority: 2 },
];

// Liquid water range (blue highlight)
export const WATER_RANGE = {
  label: "Liquid Water",
  logMTop:    -36.81 + Math.log10(373.15),  // 100°C
  logMBottom: -36.81 + Math.log10(273.15),  // 0°C
};
