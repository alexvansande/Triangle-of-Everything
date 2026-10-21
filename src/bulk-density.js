// =============================================================
// BULK-DENSITY.JS — where non-round things sit on the chart
// =============================================================
//
// The chart's diagonals are densities of a BALL (data.js: DENSITY_SPHERE_C),
// but a human, a whale or a 747 is not a ball: plotted at half its longest
// dimension, a person reads as 0.03 g/cm³ and floats like styrofoam.
//
// In "bulk" mode a non-round object is placed at the radius of a ball with
// its real mass and its BULK density: mass ÷ the volume of its outer
// envelope, empty space inside included (lungs, cabin, hull). Nothing is
// crumpled. r = ∛(3M / 4πρ), so the dot sits on the right side of the water
// line: animals on it, ships and planes to the right (full of air, they
// float), stone and metal to the left.
//
// The source data is untouched: objects.json and dust.json keep half the
// longest dimension in logR / r. It is copied to `logRSpan` (objects) and
// `rSpan` (dust) and still shown as the object's size in the tooltip and
// info panel. SIZE_MODE = "span" puts everything back where it was.
//
// Curated objects: `rho` in objects.json, either a number (known, or how the
// mass was derived) or [low, best, high] in g/cm³; the best guess is used.
// Dust: DUST_RHO per catalogue source. A range places each dot at a random
// (but fixed, seeded by its name) density inside it, so a cloud keeps its
// real spread instead of collapsing onto a line.
// =============================================================

import { DENSITY_SPHERE_C } from "./data.js";

export const SIZE_MODE = "bulk";   // "span" = the old half-longest-dimension placement

// g/cm³. A number = exact by construction (the catalogue derived the mass
// as volume × that density, so the ball has exactly the object's volume).
// [lo, hi] = plausible bulk densities for the class.
export const DUST_RHO = {
  // living things: tissue ~1.05, minus air in lungs / tracheae
  mammal: [0.93, 1.03],        // lungs full: most mammals float, barely
  amphibian: [0.95, 1.05],
  insect: [0.8, 1.1],
  lepidoptera: [0.7, 1.1],
  moth: [0.7, 1.1],
  bacterium: [1.05, 1.15],     // measured buoyant densities (E. coli 1.08–1.11)
  cell: [1.02, 1.15],          // protists and algae; diatoms' silica runs higher
  // ice and water: mass = surveyed volume × density
  glacier: 0.917,
  icesheet: 0.917,
  lake: 1.0,                   // Dead Sea: LAKE_RHO below
  // machines, envelope including the air inside
  vehicle: [0.05, 0.6],        // car ~0.12, loaded truck ~0.4, lattice excavator ~0.05
  rail: [0.1, 0.8],            // passenger car ~0.15, locomotive ~0.4–0.85
  armour: [0.5, 1.4],          // amphibious APC ~0.8, tank ~1.2 (tanks sink)
  ship: [0.2, 0.6],            // full-load displacement ÷ hull + superstructure
  aircraft: [0.05, 0.3],       // glider ~0.05, Cessna ~0.09, 747 ~0.15, Concorde ~0.26
  spacecraft: [0.05, 0.5],     // satellites ~0.05–0.3, fuelled rockets ~0.3–0.5
};
const LAKE_RHO = { "Dead Sea": 1.24 };

// Catalogues whose MASS is derived as measured volume × this density. Their
// ball radius is exact (the volume is measured); the density is the guess,
// so a range spreads them in mass instead (up/down, at a fixed radius).
const MASS_FROM_VOLUME = { bacterium: 1.1, cell: 1.1 };

// Meteorites: mass measured, size derived from the mean density of their
// class (stony ~3.2–3.4, irons 7.8 g/cm³; Britt & Consolmagno 2003). The two
// families stay apart — stone vs metal is the story — but each meteorite
// gets its class's real spread (porosity, weathering), so a family is a band,
// not a line: ×0.88–1.12 for stones, 7.0–7.9 g/cm³ for irons.
const METEORITE_SPREAD = { stone: [0.88, 1.12], iron: [7.0, 7.9] };

// Too varied for one density range (bells, statues, towers, bridges):
// bulk density = density of the bounding ball × k, where k = how many times
// the bounding ball's volume exceeds the envelope's. Keeps each item's own
// information (a bell stays dense, a tower stays airy).
export const DUST_SHAPE = {
  artefact: [2, 30],           // Tsar Bell ~2, Eiffel Tower ~11, long bridges ~30+
};
const ARTEFACT_MAX_RHO = 8;    // g/cm³, about bronze

const logBall = (logM, rho) => (logM - DENSITY_SPHERE_C - Math.log10(rho)) / 3;

/** Stable 0..1 from a string (FNV-1a), so a dot doesn't move between loads. */
function unit(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12;
  return (h >>> 0) / 4294967296;
}
const logUniform = (lo, hi, u) => Math.log10(lo) + u * (Math.log10(hi) - Math.log10(lo));
/** Bell-shaped 0..1: the mean of three uniforms (peaks mid-range, never
 *  leaves it), so a cloud is dense in the middle and thins out to its limits. */
const bell = (key) => (unit(key + "#a") + unit(key + "#b") + unit(key + "#c")) / 3;

/** Curated objects → new array; those with `rho` move to their ball radius. */
export function applyBulkObjects(list) {
  if (SIZE_MODE !== "bulk") return list;
  return list.map((o) => {
    if (o.rho == null) return o;
    const best = Array.isArray(o.rho) ? o.rho[1] : o.rho;
    return { ...o, logRSpan: o.logR, logR: logBall(o.logM, best) };
  });
}

/** Dust radii (Float32Array `r`, mutated in place; masses `m` too for the
 *  MASS_FROM_VOLUME catalogues). Returns the original radii, or null when
 *  nothing moved. */
export function applyBulkDust(r, m, src, sources, rawNames) {
  if (SIZE_MODE !== "bulk") return null;
  const rSpan = Float32Array.from(r);
  for (let i = 0; i < r.length; i++) {
    const id = sources[src[i]].id;
    const rho = id === "lake" ? (LAKE_RHO[rawNames[i]] ?? DUST_RHO.lake) : DUST_RHO[id];
    const shape = DUST_SHAPE[id];
    if (rho == null && !shape && id !== "meteorite") continue;
    const u = bell(id + ":" + rawNames[i]);
    if (id === "meteorite") {
      const classRho = 10 ** (m[i] - 3 * r[i] - DENSITY_SPHERE_C);
      const logRho = classRho > 6
        ? logUniform(METEORITE_SPREAD.iron[0], METEORITE_SPREAD.iron[1], u)
        : Math.log10(classRho) + logUniform(METEORITE_SPREAD.stone[0], METEORITE_SPREAD.stone[1], u);
      r[i] = logBall(m[i], 10 ** logRho);
      continue;
    }
    const fromVolume = MASS_FROM_VOLUME[id];
    if (fromVolume) {
      r[i] = logBall(m[i], fromVolume);
      m[i] += logUniform(rho[0], rho[1], u) - Math.log10(fromVolume);
      continue;
    }
    let logRho;
    const bounding = m[i] - 3 * r[i] - DENSITY_SPHERE_C;
    if (shape) {
      // a compact item (a bell) can't be packed much tighter: cap at ~bronze
      const cap = Math.max(1, ARTEFACT_MAX_RHO / 10 ** bounding);
      logRho = bounding + logUniform(Math.min(shape[0], cap), Math.min(shape[1], cap), u);
    } else {
      logRho = Array.isArray(rho) ? logUniform(rho[0], rho[1], u) : Math.log10(rho);
    }
    // The envelope fits inside the bounding ball: never denser-looking than
    // that, i.e. never a bigger radius than before.
    r[i] = Math.min(r[i], (m[i] - DENSITY_SPHERE_C - logRho) / 3);
  }
  return rSpan;
}
