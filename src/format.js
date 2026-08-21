// src/format.js
// Pure formatting helpers: scientific/human-friendly numbers, unit picking
// for the axis tooltip, and cosmic time conversion. No chart or DOM state —
// everything here is a pure function of its inputs.

import { DENSITY_SPHERE_C } from "./data.js";

export function formatSci(logVal, unit) {
  const exp = Math.floor(logVal);
  const mantissa = Math.pow(10, logVal - exp);
  if (Math.abs(logVal) < 2) return `${Math.pow(10, logVal).toPrecision(3)} ${unit}`;
  return `${mantissa.toFixed(1)} × 10<sup>${exp}</sup> ${unit}`;
}

export function friendlyRadius(logR) {
  if (logR >= 24.49) return `${Math.pow(10, logR - 24.49).toFixed(1)} Mpc`;
  if (logR >= 17.98) return `${Math.pow(10, logR - 17.98).toFixed(1)} ly`;
  if (logR >= 13.18) return `${Math.pow(10, logR - 13.18).toFixed(2)} AU`;
  if (logR >= 5)     return `${Math.pow(10, logR - 5).toPrecision(3)} km`;
  if (logR >= 2)     return `${Math.pow(10, logR - 2).toPrecision(3)} m`;
  if (logR >= -1)    return `${Math.pow(10, logR).toPrecision(3)} cm`;
  if (logR >= -7)    return `${Math.pow(10, logR + 7).toPrecision(3)} nm`;
  if (logR >= -13)   return `${Math.pow(10, logR + 13).toPrecision(3)} fm`;
  return `10^${logR.toFixed(1)} cm`;
}

export function friendlyMass(logM) {
  const solOff = Math.log10(1.989e33);
  if (logM >= solOff + 1) return `${Math.pow(10, logM - solOff).toPrecision(3)} M☉`;
  if (logM >= 6)   return `${Math.pow(10, logM - 6).toPrecision(3)} tonnes`;
  if (logM >= 3)   return `${Math.pow(10, logM - 3).toPrecision(3)} kg`;
  if (logM >= 0)   return `${Math.pow(10, logM).toPrecision(3)} g`;
  const gevOff = Math.log10(1.783e-24);
  if (logM >= gevOff - 3) return `${Math.pow(10, logM - gevOff).toPrecision(3)} GeV`;
  if (logM >= gevOff - 6) return `${Math.pow(10, logM - gevOff + 3).toPrecision(3)} MeV`;
  if (logM >= gevOff - 9) return `${Math.pow(10, logM - gevOff + 6).toPrecision(3)} keV`;
  return `${Math.pow(10, logM - gevOff + 9).toPrecision(3)} eV`;
}

export function friendlyEnergy(logM) {
  const logE_eV = logM + 32.75;
  if (logE_eV >= 9) return `${Math.pow(10, logE_eV - 9).toPrecision(3)} GeV`;
  if (logE_eV >= 6) return `${Math.pow(10, logE_eV - 6).toPrecision(3)} MeV`;
  if (logE_eV >= 3) return `${Math.pow(10, logE_eV - 3).toPrecision(3)} keV`;
  if (logE_eV >= 0) return `${Math.pow(10, logE_eV).toPrecision(3)} eV`;
  if (logE_eV >= -3) return `${Math.pow(10, logE_eV + 3).toPrecision(3)} meV`;
  return `${Math.pow(10, logE_eV + 6).toPrecision(3)} μeV`;
}

export function isPhoton(obj) {
  return Math.abs(obj.logM + obj.logR + 36.656) < 0.5;
}

export function friendlyWavelength(logR) {
  if (logR >= 2)     return `${Math.pow(10, logR - 2).toPrecision(3)} m`;
  if (logR >= -1)    return `${Math.pow(10, logR).toPrecision(3)} cm`;
  if (logR >= -4)    return `${Math.pow(10, logR + 4).toPrecision(3)} μm`;
  if (logR >= -7)    return `${Math.pow(10, logR + 7).toPrecision(3)} nm`;
  if (logR >= -10)   return `${Math.pow(10, logR + 10).toPrecision(3)} pm`;
  return `${Math.pow(10, logR + 13).toPrecision(3)} fm`;
}

export function friendlyDensity(logR, logM, logDensityOverride) {
  const logRho = logDensityOverride != null ? logDensityOverride : logM - 3 * logR - DENSITY_SPHERE_C;
  if (logRho > 14) return `${Math.pow(10, logRho - 14).toPrecision(2)} × nuclear density`;
  if (logRho > 3) return `${Math.pow(10, logRho - 3).toPrecision(2)} × 10³ kg/m³`;
  if (logRho >= 0) return `${Math.pow(10, logRho).toPrecision(2)} g/cm³`;
  if (logRho > -3) return `${Math.pow(10, logRho + 3).toPrecision(2)} mg/cm³`;
  return `10^${logRho.toFixed(0)} g/cm³`;
}


export const MASS_HOVER_UNITS = [
  { logOff: -32.75, name: "Electron Volts/c²",  sys: "particle" },
  { logOff: -29.75, name: "Kilo Electron Volts/c²", sys: "particle" },
  { logOff: -26.75, name: "Mega Electron Volts/c²", sys: "particle" },
  { logOff: -23.75, name: "Giga Electron Volts/c²", sys: "particle" },
  { logOff: -20.75, name: "Tera Electron Volts/c²", sys: "particle" },
  { logOff: -15,    name: "Picograms",   sys: "metric" },
  { logOff: -12,    name: "Nanograms",   sys: "metric" },
  { logOff: -9,     name: "Micrograms",  sys: "metric" },
  { logOff: -6,     name: "Milligrams",  sys: "metric" },
  { logOff: 0,      name: "Grams",       sys: "metric" },
  { logOff: 3,      name: "Kilograms",   sys: "metric" },
  { logOff: 6,      name: "Tonnes",      sys: "metric" },
  { logOff: 9,      name: "Kilotonnes",  sys: "metric" },
  { logOff: 12,     name: "Megatonnes",  sys: "metric" },
  { logOff: 15,     name: "Gigatonnes",  sys: "metric" },
  { logOff: 1.45,   name: "Ounces",      sys: "imperial" },
  { logOff: 2.66,   name: "Pounds",      sys: "imperial" },
  { logOff: 5.95,   name: "US Tons",     sys: "imperial" },
  { logOff: 27.78,  name: "Earth Masses",   sys: "astro" },
  { logOff: 30.28,  name: "Jupiter Masses", sys: "astro" },
  { logOff: 33.30,  name: "Solar Masses",   sys: "astro" },
];

export const RADIUS_HOVER_UNITS = [
  { logOff: -13,    name: "Femtometers",    sys: "metric" },
  { logOff: -10,    name: "Picometers",     sys: "metric" },
  { logOff: -8,     name: "Angstroms",      sys: "metric" },
  { logOff: -7,     name: "Nanometers",     sys: "metric" },
  { logOff: -4,     name: "Micrometers",    sys: "metric" },
  { logOff: -1,     name: "Millimeters",    sys: "metric" },
  { logOff: 0,      name: "Centimeters",    sys: "metric" },
  { logOff: 2,      name: "Meters",         sys: "metric" },
  { logOff: 5,      name: "Kilometers",     sys: "metric" },
  { logOff: 0.405,  name: "Inches",         sys: "imperial" },
  { logOff: 1.484,  name: "Feet",           sys: "imperial" },
  { logOff: 5.207,  name: "Miles",          sys: "imperial" },
  { logOff: 13.175, name: "Astronomical Units", sys: "astro" },
  { logOff: 17.976, name: "Light Years",    sys: "astro" },
  { logOff: 18.489, name: "Parsecs",        sys: "astro" },
  { logOff: 20.976, name: "Thousand Light Years", sys: "astro" },
  { logOff: 24.489, name: "Megaparsecs",    sys: "astro" },
];

export const ENERGY_HOVER_UNITS = [
  { logOff: -38.75, name: "Micro Electron Volts",  sys: "energy" },
  { logOff: -35.75, name: "Milli Electron Volts",  sys: "energy" },
  { logOff: -32.75, name: "Electron Volts",        sys: "energy" },
  { logOff: -29.75, name: "Kilo Electron Volts",   sys: "energy" },
  { logOff: -26.75, name: "Mega Electron Volts",   sys: "energy" },
  { logOff: -23.75, name: "Giga Electron Volts",   sys: "energy" },
  { logOff: -20.75, name: "Tera Electron Volts",   sys: "energy" },
  { logOff: -36.81, name: "Kelvin",                sys: "temperature" },
];

// Density→cosmic-time lookup (piecewise linear interpolation in log-log)
export const DENSITY_TIME_TABLE = [
  { logRho: 93.7,   logT: -43 },
  { logRho: 76,     logT: -36 },
  { logRho: 25,     logT: -11 },
  { logRho: 14.4,   logT: -6 },
  { logRho: 4,      logT: 0 },
  { logRho: -21,    logT: 13 },
  { logRho: -29.5,  logT: 17.64 },   // now ≈ 4.35×10¹⁷ s ≈ 13.8 Gyr
  // Future: density ruler positions are arbitrary beyond "now", but we
  // extrapolate so the hover tooltip keeps showing increasing cosmic time
  { logRho: -150.6, logT: 107.5 },   // heat death ≈ 10¹⁰⁰ years → 10^107.5 s
];

// ── Picker: choose best human-readable unit ──

export function pickBestUnit(logVal, table, preferSys) {
  let best = null, bestScore = Infinity;
  for (const u of table) {
    const mLog = logVal - u.logOff;
    if (mLog < -2 || mLog > 8) continue;  // mantissa 0.01 to ~100M
    const score = Math.abs(mLog) + (mLog < 0 ? 0.3 : 0) // slight preference for mantissa ≥ 1
      + (preferSys && u.sys === preferSys ? -0.5 : 0);
    if (score < bestScore) { bestScore = score; best = u; }
  }
  if (!best) best = table.reduce((a, b) =>
    Math.abs(logVal - a.logOff) < Math.abs(logVal - b.logOff) ? a : b);
  return { value: Math.pow(10, logVal - best.logOff), unit: best.name, sys: best.sys };
}

export function pickAltUnit(logVal, table, primaryUnit) {
  // Try contrasting system first
  const altMap = { metric: "imperial", imperial: "metric", particle: "metric",
    astro: "metric", energy: "temperature", temperature: "energy" };
  const altSys = altMap[primaryUnit.sys] || null;
  const filtered = table.filter(u => u.sys !== primaryUnit.sys);
  if (filtered.length) {
    const alt = pickBestUnit(logVal, filtered, altSys);
    const mLog = Math.abs(Math.log10(Math.abs(alt.value) || 1));
    if (mLog < 6) return alt; // mantissa is reasonable
  }
  // Fallback: pick any unit that isn't the exact same one
  const any = table.filter(u => u.name !== primaryUnit.unit);
  return pickBestUnit(logVal, any, null);
}

// ── Formatting helpers ──

export function formatHumanNum(value, unit) {
  const a = Math.abs(value);
  if (a === 0) return `0 ${unit}`;
  if (a >= 1e15 || a < 0.001) {
    // Use HTML sup for extreme values
    const exp = Math.floor(Math.log10(a));
    const mant = value / Math.pow(10, exp);
    return `${mant.toFixed(1)}×10<sup>${exp}</sup> ${unit}`;
  }
  if (a < 0.01) return `${value.toPrecision(2)} ${unit}`;
  if (a < 10)   return `${value.toPrecision(3)} ${unit}`;
  if (a < 1000) return `${value.toPrecision(4)} ${unit}`;
  if (a < 1e6)  return `${Number(value.toPrecision(4)).toLocaleString()} ${unit}`;
  if (a < 1e9)  return `${(value / 1e6).toPrecision(3)} million ${unit}`;
  if (a < 1e12) return `${(value / 1e9).toPrecision(3)} billion ${unit}`;
  return `${(value / 1e12).toPrecision(3)} trillion ${unit}`;
}

export function formatLogSuper(logVal, unit) {
  const s = logVal.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return `10<sup>${s}</sup> ${unit}`;
}

// Density → cosmic time via interpolation
export function densityToLogTime(logRho) {
  const t = DENSITY_TIME_TABLE;
  if (logRho >= t[0].logRho) return t[0].logT;
  if (logRho <= t[t.length - 1].logRho) return t[t.length - 1].logT;
  for (let i = 0; i < t.length - 1; i++) {
    if (logRho <= t[i].logRho && logRho >= t[i + 1].logRho) {
      const frac = (logRho - t[i].logRho) / (t[i + 1].logRho - t[i].logRho);
      return t[i].logT + frac * (t[i + 1].logT - t[i].logT);
    }
  }
  return 0;
}

export function friendlyTime(logT) {
  // logT is log₁₀(seconds)
  const logYr = logT - 7.494; // 1 year ≈ 3.156×10⁷ s → log₁₀ ≈ 7.494

  // Turn a small fractional value into natural language: 3.1e-19 → "3.1 ten-billionths of a"
  function humanFrac(val, unitSingular) {
    const a = Math.abs(val);
    if (a >= 0.5) return `${Number(val.toPrecision(2))} ${unitSingular}s`;
    const fracs = [
      [1e-3,  "Thousandth"],  [1e-6,  "Millionth"],  [1e-9,  "Billionth"],
      [1e-12, "Trillionth"], [1e-15, "Quadrillionth"], [1e-18, "Quintillionth"],
      [1e-21, "Sextillionth"], [1e-24, "Septillionth"],
    ];
    for (const [thresh, word] of fracs) {
      const scaled = val / thresh;
      if (Math.abs(scaled) >= 0.5) {
        const n = Number(scaled.toPrecision(2));
        const pl = Math.abs(n) === 1 ? "" : "s";
        return `${n} ${word}${pl} of a ${unitSingular}`;
      }
    }
    // fallback for extremely small values
    const exp = Math.floor(Math.log10(a));
    const mant = val / Math.pow(10, exp);
    return `${mant.toFixed(1)}×10<sup>${exp}</sup> ${unitSingular}s`;
  }

  // Planck time ≈ 5.4×10⁻⁴⁴ s → log₁₀ ≈ -43.27
  if (logT < -36) {
    const logPlanck = -43.27;
    const mult = logT - logPlanck;
    if (mult < 15) {
      const v = Math.pow(10, mult);
      if (v < 1e3) return `${Number(v.toPrecision(2))} Planck Times`;
      if (v < 1e6) return `${Number((v/1e3).toPrecision(2))} Thousand Planck Times`;
      if (v < 1e9) return `${Number((v/1e6).toPrecision(2))} Million Planck Times`;
      if (v < 1e12) return `${Number((v/1e9).toPrecision(2))} Billion Planck Times`;
      return `${Number((v/1e12).toPrecision(2))} Trillion Planck Times`;
    }
    return formatLogSuper(mult, "× Planck Time");
  }
  // Small times: use fractional natural language
  if (logT < -12) { return humanFrac(Math.pow(10, logT + 12), "Picosecond"); }
  if (logT < -9)  { return humanFrac(Math.pow(10, logT + 9),  "Nanosecond"); }
  if (logT < -6)  { return humanFrac(Math.pow(10, logT + 6),  "Microsecond"); }
  if (logT < 0)   { return humanFrac(Math.pow(10, logT + 3),  "Millisecond"); }
  if (logT < 2)   return `${Number(Math.pow(10, logT).toPrecision(2))} Seconds`;
  if (logT < 3.56) return `${Number(Math.pow(10, logT - 1.778).toPrecision(2))} Minutes`;
  if (logT < 4.94) return `${Number(Math.pow(10, logT - 3.556).toPrecision(2))} Hours`;
  if (logT < 6.45) return `${Number(Math.pow(10, logT - 4.937).toPrecision(2))} Days`;
  if (logYr < 3)   return `${Number(Math.pow(10, logYr).toPrecision(3))} Years`;
  if (logYr < 6)   return `${Number(Math.pow(10, logYr - 3).toPrecision(3))} Thousand Years`;
  if (logYr < 9)   return `${Number(Math.pow(10, logYr - 6).toPrecision(3))} Million Years`;
  if (logYr < 12)  return `${Number(Math.pow(10, logYr - 9).toPrecision(3))} Billion Years`;
  if (logYr < 15)  return `${Number(Math.pow(10, logYr - 12).toPrecision(3))} Trillion Years`;
  if (logYr < 18)  return `${Number(Math.pow(10, logYr - 15).toPrecision(3))} Quadrillion Years`;
  // Extreme future: use 10^n years notation
  return `10<sup>${Math.round(logYr)}</sup> Years`;
}


export function fmtTick(v) {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}
