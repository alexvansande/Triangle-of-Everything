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

// Planck scale — where Schwarzschild and Compton lines cross
export const PLANCK_LOG_R = (SCHWARZSCHILD_C + COMPTON_C) / 2; // ≈ -32.64
export const PLANCK_LOG_M = PLANCK_LOG_R - SCHWARZSCHILD_C;    // ≈ -4.81

// Hubble radius — the rightmost vertical boundary
export const HUBBLE_LOG_R = 28.14;   // log₁₀(1.37 × 10²⁸ cm)

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
  { logDensity: 50,    label: "inflation ends",          color: "#ffab91", epoch: true },
  { logDensity: 25,    label: "EW 10⁻¹¹ s",             color: "#ffffff", epoch: true },
  { logDensity: 14.4,  label: "nuclear 10⁻⁶ s",         color: "#ffcc80", epoch: true },
  { logDensity: 4,     label: "BBN ~1 s",                color: "#ffe082", epoch: true },
  { logDensity: 0,     label: "water",                    color: "#80deea", epoch: false },
  { logDensity: -2.9,  label: "air",                      color: "#b0bec5", epoch: false },
  { logDensity: -19,   label: "matter=radiation",         color: "#ce93d8", epoch: true },
  { logDensity: -21,   label: "recomb. 10¹³ s (CMB)",    color: "#ffab91", epoch: true },
  { logDensity: -24,   label: "atomic density line",      color: "#a5d6a7", epoch: false },
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

export const RADIUS_UNITS = [
  // ── Row 1: metric / SI ──
  { logR: -32.79, label: "1 Planck length", row: 1 },
  { logR: -13,    label: "1 fm",            row: 1 },
  { logR: -9,     label: "10 pm",           row: 1 },
  { logR: -8,     label: "1 Å",             row: 1 },
  { logR: -7,     label: "1 nm",            row: 1 },
  { logR: -4,     label: "1 μm",            row: 1 },
  { logR: -1,     label: "1 mm",            row: 1 },
  { logR: 0,      label: "1 cm",            row: 1 },
  { logR: 2,      label: "1 meter",         row: 1 },
  { logR: 5,      label: "1 km",            row: 1 },
  { logR: 8,      label: "1000 km",         row: 1 },
  { logR: 11,     label: "1M km",           row: 1 },

  // ── Row 2: imperial / astronomical ──
  { logR: 0.405,  label: "1 inch",          row: 2 },
  { logR: 1.484,  label: "1 foot",          row: 2 },
  { logR: 5.207,  label: "1 mile",          row: 2 },
  { logR: 10.477, label: "1 light-second",  row: 2 },
  { logR: 13.175, label: "1 AU",            row: 2 },
  { logR: 17.976, label: "1 light-year",    row: 2 },
  { logR: 18.489, label: "1 parsec",        row: 2 },
  { logR: 20.976, label: "1,000 ly",        row: 2 },
  { logR: 21.489, label: "1 kpc",           row: 2 },
  { logR: 23.976, label: "1M ly",           row: 2 },
  { logR: 24.489, label: "1 Mpc",           row: 2 },
  { logR: 26.976, label: "1B ly",           row: 2 },
  { logR: 27.489, label: "1 Gpc",           row: 2 },
  { logR: 28.14,  label: "Hubble R",        row: 2 },
];

// MASS_UNITS: right axis — from eV/c² up to 10¹⁵ M☉
export const MASS_UNITS = [
  { logM: -32.75, label: "1 eV/c²" },
  { logM: -29.75, label: "1 keV/c²" },
  { logM: -27.04, label: "mₑ (electron)" },
  { logM: -26.75, label: "1 MeV/c²" },
  { logM: -23.78, label: "mₚ (proton)" },
  { logM: -23.75, label: "1 GeV/c²" },
  { logM: -20.75, label: "1 TeV/c²" },

  // Sub-gram
  { logM: -15,    label: "1 pg" },
  { logM: -12,    label: "1 ng" },
  { logM: -9,     label: "1 μg" },
  { logM: -6,     label: "1 mg" },

  // Special
  { logM: -4.66,  label: "PLANCK MASS" },

  // Everyday
  { logM: 0,      label: "1 gram" },
  { logM: 1.45,   label: "1 oz" },
  { logM: 2.66,   label: "1 lb" },
  { logM: 3,      label: "1 kg" },
  { logM: 6,      label: "1 tonne" },
  { logM: 9,      label: "1 kilotonne" },
  { logM: 12,     label: "1 megatonne" },
  { logM: 15,     label: "1 gigatonne" },

  // Astronomical
  { logM: 27.78,  label: "M⊕ (Earth)" },
  { logM: 30.28,  label: "Mⱼ (Jupiter)" },
  { logM: 33.30,  label: "1 M☉" },
  { logM: 36.30,  label: "1000 M☉" },
  { logM: 39.30,  label: "1 M M☉" },
  { logM: 42.30,  label: "1 B M☉" },
  { logM: 45.30,  label: "1 T M☉" },
  { logM: 48.30,  label: "10¹⁵ M☉" },
];

// ENERGY_UNITS: left axis — shows both energy and temperature scales.
// Mass ↔ Energy:      E = mc²  → log(E/eV) = logM + 32.75
// Mass ↔ Temperature: T = mc²/kB → log(T/K) = logM + 36.81
// This dual-mapping lets us show eV, keV, GeV alongside K, °C, °F.
const LOG_EV_OFFSET = 32.75;
const LOG_K_OFFSET  = 36.81;

export const ENERGY_UNITS = [
  // Energy scale
  { logM: -35.75, label: "1 meV" },
  { logM: -32.75, label: "1 eV" },
  { logM: -29.75, label: "1 keV" },
  { logM: -26.75, label: "1 MeV" },
  { logM: -23.75, label: "1 GeV" },
  { logM: -20.75, label: "1 TeV" },
  { logM: -4.66,  label: "PLANCK ENERGY" },

  // Temperature scale
  { logM: -36.81,                          label: "1 K" },
  { logM: -36.81 + Math.log10(2.725),     label: "2.7 K (CMB)" },
  { logM: -36.81 + Math.log10(77),        label: "77 K (liq. N₂)" },
  { logM: -36.81 + Math.log10(273.15),    label: "0°C" },
  { logM: -36.81 + Math.log10(293.15),    label: "20°C (room)" },
  { logM: -36.81 + Math.log10(310.15),    label: "37°C (body)" },
  { logM: -36.81 + Math.log10(373.15),    label: "100°C" },
  { logM: -36.81 + 3,                     label: "1000 K" },
  { logM: -36.81 + Math.log10(5778),      label: "5778 K (Sun surface)" },
  { logM: -36.81 + 6,                     label: "1 M K" },
  { logM: -36.81 + 9,                     label: "1 B K" },

  // Fahrenheit reference
  { logM: -36.81 + Math.log10(255.37),    label: "0°F" },
  { logM: -36.81 + Math.log10(310.93),    label: "100°F" },
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
    label: "Schwarzschild Radius",
    points: [{ logR: -32.5, logM: -4.7 }, { logR: 28.5, logM: 56.3 }],
    color: "rgba(255,51,85,0)", width: 0, dash: "",
  },
];

export const ARROWS = [];

export const CATEGORIES = CAT;
