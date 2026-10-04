// =============================================================
// src-browndwarfs.mjs — brown dwarfs with a MEASURED mass AND radius
// (fills the ~13–80 M_Jup gap between the exoplanet and star dust)
// =============================================================
// One source:
//   browndwarf  Transiting brown dwarfs (true mass from RV + transit
//               inclination, radius from the transit depth) plus the
//               double-lined eclipsing brown-dwarf binary 2M0535−05.
//
// No machine-readable catalogue exists (none of the compilations is on
// VizieR), so this is a cited hand table. Backbone: the population table
// of Henderson et al. 2024 (MNRAS 533, 2823, Table A1 — itself updated
// from Grieves et al. 2021 and Carmichael 2023's Gaia-DR3 radius
// re-analysis), extended with discoveries published after it.
// Values were copied from the papers' LaTeX sources (arXiv e-prints).
//
// Cuts, applied in load():
//   - 13 ≤ M ≤ 80 M_Jup (deuterium- to hydrogen-burning limit). Heavier
//     transiting companions (TOI-587 b 81 M_J, TOI-746 b 82 M_J, …) are
//     very-low-mass stars and are left out.
//   - mass AND radius each known to ±25% (larger of the asymmetric
//     errors), as for the "exoplanet" source.
//   - objects that the "exoplanet" source (NASA pscomppars) already
//     plots are skipped — computed at load time from that source's own
//     filtered rows, so the two never double-plot one object.
// =============================================================

import { SOURCES } from "./sources.mjs";

const log = Math.log10;
const M_JUP = 1.898e30, R_JUP = 7.1492e9;     // g, cm (equatorial R_J, as in sources.mjs)
const M_SUN = 1.989e33, R_SUN = 6.957e10;
const norm = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");

// Reference keys used in the table below
const REF = {
  H24: "Henderson et al. 2024, MNRAS 533, 2823 (arXiv:2408.04475), Table A1 and references therein",
  C23: "Carmichael 2023, MNRAS 519, 5177 (arXiv:2212.02502), list of published transiting BDs",
  V25: "Vowell et al. 2025 (arXiv:2501.09795), median-value fit tables",
  Z25: "Zhang et al. 2025 (arXiv:2503.05115)",
  B25: "Barkaoui et al. 2025, A&A (arXiv:2502.19940)",
  G25: "Gan et al. 2025 (arXiv:2507.09461)",
  S26: "Šubjak et al. 2026, A&A 709, A130 (arXiv:2602.02836), derived-parameters table",
  GMC09: "Gómez Maqueo Chew et al. 2009, ApJ 699, 1196 (arXiv:0905.0491), adopted RVs + NIR + I_C solution",
};

// [name, M (M_J), +σM, −σM, R (R_J), +σR, −σR, ref]
const TRANSITING = [
  // --- Henderson et al. 2024 Table A1 (13–80 M_J) ---
  ["TOI-1278 b",        18.5, 0.5, 0.5,   1.09, 0.24, 0.20, "H24"], // also in pscomppars
  ["GPX-1 b",           19.7, 1.6, 1.6,   1.47, 0.10, 0.10, "H24"], // also in pscomppars
  ["Kepler-39 b",       20.1, 1.3, 1.2,   1.07, 0.03, 0.03, "H24"], // also in pscomppars
  ["CoRoT-3 b",         21.7, 1.0, 1.0,   1.08, 0.05, 0.05, "H24"], // also in pscomppars
  ["KELT-1 b",          27.4, 0.9, 0.9,   1.13, 0.03, 0.03, "H24"], // also in pscomppars
  ["NLTT 41135 b",      33.7, 2.8, 2.6,   1.13, 0.27, 0.17, "H24"],
  ["WASP-128 b",        37.2, 0.8, 0.9,   0.96, 0.02, 0.02, "H24"],
  ["CWW 89A b",         39.2, 1.1, 1.1,   0.94, 0.02, 0.02, "H24"],
  ["KOI-205 b",         39.9, 1.0, 1.0,   0.87, 0.02, 0.02, "H24"],
  ["TOI-1406 b",        46.0, 2.6, 2.7,   0.86, 0.03, 0.03, "H24"],
  ["EPIC 212036875 b",  52.3, 1.9, 1.9,   0.87, 0.02, 0.02, "H24"],
  ["TOI-503 b",         53.7, 1.2, 1.2,   1.34, 0.26, 0.15, "H24"],
  ["TOI-852 b",         53.7, 1.4, 1.3,   0.83, 0.04, 0.04, "H24"],
  ["AD 3116 b",         54.2, 4.3, 4.3,   0.95, 0.07, 0.07, "H24"],
  ["CoRoT-33 b",        59.0, 1.8, 1.7,   1.10, 0.53, 0.53, "H24"], // radius ±48% → cut
  ["TOI-811 b",         59.9, 13.0, 8.6,  1.26, 0.06, 0.06, "H24"],
  ["TOI-263 b",         61.6, 4.0, 4.0,   0.91, 0.07, 0.07, "H24"],
  ["KOI-415 b",         62.1, 2.7, 2.7,   0.86, 0.03, 0.03, "H24"],
  ["WASP-30 b",         62.5, 1.2, 1.2,   0.96, 0.03, 0.03, "H24"],
  ["LHS 6343 C",        62.7, 2.4, 2.4,   0.83, 0.02, 0.02, "H24"],
  ["CoRoT-15 b",        63.3, 4.1, 4.1,   0.94, 0.12, 0.12, "H24"],
  ["TOI-569 b",         64.1, 1.9, 1.4,   0.75, 0.02, 0.02, "H24"],
  ["TOI-2119 b",        64.4, 2.3, 2.2,   1.08, 0.03, 0.03, "H24"],
  ["TOI-1982 b",        65.9, 2.8, 2.7,   1.08, 0.04, 0.04, "H24"],
  ["EPIC 201702477 b",  66.9, 1.7, 1.7,   0.83, 0.04, 0.04, "H24"],
  ["TOI-629 b",         67.0, 3.0, 3.0,   1.11, 0.05, 0.05, "H24"],
  ["TOI-2543 b",        67.6, 3.5, 3.5,   0.95, 0.09, 0.09, "H24"],
  ["NGTS-28A b",        67.7, 5.4, 4.9,   0.97, 0.05, 0.05, "H24"],
  ["HIP 33609 b",       68.0, 7.4, 7.1,   1.58, 0.07, 0.07, "H24"],
  // transiting companion C of Irwin+ 2018 (pscomppars' "LP 261-75 b" is the wide imaged companion)
  ["LP 261-75 C",       68.1, 2.1, 2.1,   0.90, 0.01, 0.01, "H24"],
  ["NGTS-19 b",         69.5, 5.7, 5.4,   1.03, 0.06, 0.05, "H24"],
  ["TOI-2336 b",        69.9, 2.3, 2.3,   1.05, 0.04, 0.04, "H24"],
  ["CoRoT-34 b",        71.4, 8.9, 8.6,   1.09, 0.17, 0.16, "H24"],
  ["TOI-2490 b",        73.6, 2.4, 2.4,   1.00, 0.02, 0.02, "H24"],
  ["NGTS-7A b",         75.5, 3.0, 13.7,  1.38, 0.13, 0.14, "H24"],
  ["TOI-5375 B",        77.0, 8.0, 8.0,   0.99, 0.16, 0.16, "H24"],
  ["TOI-148 b",         77.1, 5.8, 4.6,   0.81, 0.05, 0.06, "H24"],
  ["TOI-2521 b",        77.5, 3.3, 3.3,   1.01, 0.04, 0.04, "H24"],
  ["KOI-189 b",         78.0, 3.4, 3.4,   0.99, 0.02, 0.02, "H24"],
  // --- young, inflated (Upper Sco); excluded from H24's population analysis, not from the data ---
  ["RIK 72 b",          59.2, 6.8, 6.8,   3.10, 0.31, 0.31, "C23"], // David et al. 2019, ApJ 872, 161
  // --- published after H24 ---
  ["TOI-2844 b",        54.0, 4.9, 5.1,   0.775, 0.047, 0.043, "V25"],
  ["TOI-3755 b",        47.1, 2.0, 2.1,   0.885, 0.051, 0.046, "V25"],
  ["TOI-3577 b",        53.8, 1.9, 2.2,   0.999, 0.053, 0.051, "V25"], // preferred (63.8%) low-mass solution
  ["TOI-4737 b",        66.3, 2.7, 3.1,   0.701, 0.079, 0.059, "V25"],
  ["TOI-5882 b",        22.01, 0.61, 0.72, 1.023, 0.045, 0.038, "V25"], // preferred low-mass solution; also in pscomppars
  ["TOI-4776 b",        32.0, 1.9, 1.8,   1.018, 0.048, 0.043, "Z25"],
  ["TOI-5422 b",        27.7, 1.4, 1.1,   0.815, 0.031, 0.026, "Z25"], // also in pscomppars
  ["TOI-6508 b",        72.5, 7.6, 5.1,   1.03, 0.03, 0.03, "B25"],
  ["TOI-5575 b",        72.4, 4.1, 4.1,   0.84, 0.07, 0.07, "G25"],
  ["TIC 9344899 b",     19.4, 1.9, 1.8,   0.817, 0.036, 0.036, "S26"], // also in pscomppars
  ["TIC 52059926 b",    16.9, 1.2, 1.1,   0.955, 0.047, 0.051, "S26"], // also in pscomppars
  ["TIC 13344668 b",    68,   28,  20,    0.921, 0.051, 0.051, "S26"], // mass ±41% → cut
  ["TIC 63921468 b",    67.7, 3.3, 3.3,   0.830, 0.027, 0.024, "S26"],
];

// Double-lined eclipsing brown-dwarf binary (Orion Nebula Cluster, ~1 Myr):
// [name, M (M_sun), σ, R (R_sun), σ, ref]
const ECLIPSING = [
  ["2MASS J05352184-0546085 A", 0.0572, 0.0033, 0.690, 0.011, "GMC09"],
  ["2MASS J05352184-0546085 B", 0.0366, 0.0022, 0.540, 0.009, "GMC09"],
];

export default [
  {
    id: "browndwarf",
    label: "Brown dwarf · transiting/eclipsing (measured M & R)",
    cat: "star",
    cite: "Hand table, one reference per row: " + Object.values(REF).join("; "),
    radius: "measured radius: transit depth × host-star radius (transiting), or eclipse light-curve radius (2M0535−05); " +
      "mass is the true dynamical mass (RV semi-amplitude with the transit/eclipse inclination)",
    // 2M0535−05 B (young, 0.54 R_sun) ≈ 10^-0.5 g/cm³; TOI-4737 b (66 M_J, 0.70 R_J) ≈ 10^2.4
    density: [-1.5, 3],
    anchors: [
      // WASP-30 b: Anderson et al. 2011 / Triaud et al. 2013 — ≈61–63 M_J, ≈0.89–0.96 R_J
      { name: "WASP-30 b", logM: log(61 * M_JUP), logR: log(0.92 * R_JUP), tol: 0.05 },
      // 2M0535−05 A: Stassun et al. 2006 (Nature 440, 311) — 0.054 M_sun, 0.669 R_sun
      { name: "2MASS J05352184-0546085 A", logM: log(0.054 * M_SUN), logR: log(0.669 * R_SUN), tol: 0.05 },
    ],
    async load(fetchText) {
      // names the exoplanet source already plots (same quality filter it applies)
      const exo = SOURCES.find((s) => s.id === "exoplanet");
      const taken = new Set((await exo.load.call(exo, fetchText)).map((r) => norm(r.name)));
      const out = [], skipped = [], cut = [];
      for (const [name, m, mp, mm, r, rp, rm] of TRANSITING) {
        if (m < 13 || m > 80) { cut.push(`${name} (mass ${m} M_J)`); continue; }
        if (Math.max(mp, mm) / m >= 0.25 || Math.max(rp, rm) / r >= 0.25) { cut.push(`${name} (uncertainty)`); continue; }
        if (taken.has(norm(name))) { skipped.push(name); continue; }
        out.push({ name, logR: log(r * R_JUP), logM: log(m * M_JUP) });
      }
      for (const [name, m, , r] of ECLIPSING) out.push({ name, logR: log(r * R_SUN), logM: log(m * M_SUN) });
      console.log(`  browndwarf: ${skipped.length} already in "exoplanet" (${skipped.join(", ")}); cut ${cut.join(", ")}`);
      return out;
    },
  },
];
