// =============================================================
// validate-objects.mjs — physics sanity-check for objects.json
// =============================================================
// Run: npm run validate
//
// Two kinds of check, both in CGS (cm, g):
//
//   1. TRIANGLE BOUNDS (hard errors, exit 1)
//      Every object must sit inside the Schwarzschild / Compton /
//      Hubble triangle. Black holes are allowed to sit ON the
//      Schwarzschild line; particles ON the Compton line.
//
//   2. DENSITY OUTLIERS (warnings — advisory only)
//      For ordinary-matter categories we compare each object's
//      implied density against its SIZE NEIGHBOURS — other objects
//      of the same category within a narrow width window. This
//      surfaces GROSS density anomalies (≥1 dex) and gives a stable
//      baseline list: if it suddenly grows after an edit, look.
//
//      Honest limitation: it does NOT reliably catch subtle (~0.5 dex)
//      single-object mass typos. The everyday-object and virus bands
//      contain real 1-2 dex density scatter (rod-shaped viruses,
//      hollow vehicles, etc.) that pollutes the local baseline, so a
//      threshold tight enough to catch a 0.5 dex slip also floods with
//      false positives. Human review remains the backstop for subtle
//      value errors. `--strict` lowers the threshold for a noisy pass.
// =============================================================

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const objects = JSON.parse(
  readFileSync(join(__dirname, "..", "src", "objects.json"), "utf8")
);

// --- constants (recomputed here so this script stays standalone) ---
const G = 6.674e-8, c = 2.998e10, hbar = 1.055e-27;
const SCHWARZSCHILD_C = Math.log10(2 * G / (c * c)); // ≈ -27.83
const COMPTON_C = Math.log10(hbar / c);              // ≈ -37.45
const HUBBLE_LOG_R = 28.14;
const DENSITY_SPHERE_C = Math.log10(4 * Math.PI / 3); // ≈ 0.622

const schwarzschildR = (logM) => logM + SCHWARZSCHILD_C;
const comptonR = (logM) => -logM + COMPTON_C;
// log10 of mean density for a uniform sphere of the given size/mass
const logDensity = (logR, logM) => logM - 3 * logR - DENSITY_SPHERE_C;

// Tolerances. The defaults are deliberately quiet: they surface only gross
// (≥1 dex) density anomalies, because the everyday-object band has so much
// genuine density scatter (a mouse, a soccer ball and a jet are all far below
// water density) that a tighter threshold drowns real typos in false alarms.
// Run `npm run validate -- --strict` for an aggressive review pass that will
// also catch subtler ~0.5 dex slips — at the cost of many false positives.
const STRICT = process.argv.includes("--strict");
const BOUND_TOL = 0.2;                    // dex of slack on the triangle edges
const DENSITY_DEV = STRICT ? 0.5 : 1.0;   // dex deviation from size-neighbours → warn
const NEIGHBOUR_WIN = 0.5;                // ± logR window that counts as "the same size"
const MIN_NEIGHBOURS = STRICT ? 2 : 3;    // need a stable local cluster before judging

// Categories made of ordinary matter at roughly atomic/water density.
// Others (particle, blackhole, star, remnant, galaxy, largescale) sit on
// boundary lines or are dark-matter-dominated, so density checks don't apply.
const DENSITY_CATS = new Set(["atomic", "micro", "macro", "planet"]);

const errors = [];
const warnings = [];

// ---- 1. Triangle bounds ----
for (const o of objects) {
  const { name, logR, logM, cat } = o;
  if (typeof logR !== "number" || typeof logM !== "number") {
    errors.push(`${name}: missing/invalid logR or logM`);
    continue;
  }
  const sR = schwarzschildR(logM);
  const cR = comptonR(logM);

  // Smaller than its Schwarzschild radius → would be a black hole.
  if (cat !== "blackhole" && logR < sR - BOUND_TOL) {
    errors.push(
      `${name}: logR ${logR} is below Schwarzschild radius ${sR.toFixed(2)} ` +
      `(would be a black hole). Off by ${(sR - logR).toFixed(2)} dex.`
    );
  }
  // Smaller than its Compton wavelength → quantum-forbidden.
  if (cat !== "particle" && logR < cR - BOUND_TOL) {
    errors.push(
      `${name}: logR ${logR} is below Compton wavelength ${cR.toFixed(2)} ` +
      `(quantum-forbidden). Off by ${(cR - logR).toFixed(2)} dex.`
    );
  }
  // Beyond the Hubble radius.
  if (logR > HUBBLE_LOG_R + BOUND_TOL) {
    errors.push(
      `${name}: logR ${logR} exceeds Hubble radius ${HUBBLE_LOG_R} ` +
      `(beyond the observable universe).`
    );
  }
}

// ---- 2. Density outliers vs same-category SIZE NEIGHBOURS ----
const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const candidates = objects
  .filter((o) => DENSITY_CATS.has(o.cat))
  .filter((o) => typeof o.logR === "number" && typeof o.logM === "number")
  .filter((o) => !o._note) // skip intentional easter eggs (e.g. the sinking hippo)
  .map((o) => ({ name: o.name, cat: o.cat, logR: o.logR, ld: logDensity(o.logR, o.logM) }));

for (const o of candidates) {
  // Neighbours: same category, within the width window, excluding self.
  const neighbours = candidates.filter(
    (n) => n !== o && n.cat === o.cat && Math.abs(n.logR - o.logR) <= NEIGHBOUR_WIN
  );
  if (neighbours.length < MIN_NEIGHBOURS) continue; // too few to judge reliably
  const med = median(neighbours.map((n) => n.ld));
  const dev = o.ld - med;
  if (Math.abs(dev) >= DENSITY_DEV) {
    warnings.push(
      `[${o.cat}] ${o.name}: density ${dev > 0 ? "+" : ""}${dev.toFixed(2)} dex ` +
      `vs ${neighbours.length} object(s) of similar width ` +
      `(logρ ${o.ld.toFixed(2)} vs ${med.toFixed(2)}). Check mass/size.`
    );
  }
}

// ---- Report ----
console.log(`Checked ${objects.length} objects.\n`);

if (warnings.length) {
  console.log(`⚠  ${warnings.length} density warning(s):`);
  warnings.forEach((w) => console.log("   " + w));
  console.log("");
}

if (errors.length) {
  console.log(`✗  ${errors.length} hard error(s):`);
  errors.forEach((e) => console.log("   " + e));
  process.exit(1);
}

console.log(warnings.length ? "No hard errors." : "✓ All checks passed.");
