// =============================================================
// src-neutronstars.mjs — neutron stars with a MEASURED mass
// =============================================================
// One source:
//   neutronstar  Measured neutron-star masses compiled by CompOSE
//                (L. Suleiman & M. Fortin, Observatoire de Paris; the data
//                behind Fig. 1 of Suleiman et al., Phys. Rev. C 104, 015801,
//                2021, regularly updated): double neutron stars, millisecond
//                and slow pulsars, X-ray/optical binaries and GW170817.
//
// Radius: almost no neutron star has a measured radius, and all that do sit
// at 11–14 km (NICER), so every star is plotted at 12 km — except the four
// NICER pulsars, which get their measured radius (and are added when the
// compilation lacks a timing mass for them).
// =============================================================

const log = Math.log10;
const M_SUN = 1.989e33;
const R_TYPICAL = 12e5;                                // cm
const BASE = "https://compose.obspm.fr/download/pdf/";
const FILES = ["DNS", "MSP", "SLOW", "XOPT", "GW"];

// NICER pulse-profile fits: [name, M (M_sun), R (km), ref]
const NICER = [
  ["PSR J0030+0451", 1.43, 12.7, "Vinciguerra et al. 2024, ApJ 961, 62"],
  ["PSR J0740+6620", 2.08, 12.5, "Salmi et al. 2024, ApJ 974, 294 (mass: Fonseca et al. 2021)"],
  ["PSR J0437−4715", 1.418, 11.36, "Choudhury et al. 2024, ApJL 971, L20"],
  ["PSR J1231−1411", 1.04, 12.6, "Salmi et al. 2024, ApJ 976, 58"],
];
const norm = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");

// LaTeX bits in the CompOSE names: J1741$+$1351, Her$\,$X$-$1
const clean = (s) => s.replace(/\$\+\$/g, "+").replace(/\$-\$/g, "−").replace(/\$\\,\$/g, " ").replace(/\$/g, "").trim();
const named = (s) => (/^[JB]\d/.test(s) ? `PSR ${s}` : s)
  .replace(/^GW170817a$/, "GW170817 (heavier star)").replace(/^GW170817b$/, "GW170817 (lighter star)");

export default [
  {
    id: "neutronstar",
    label: "Neutron star · measured mass (CompOSE)",
    cat: "remnant",
    cite: "CompOSE neutron-star mass compilation (Suleiman & Fortin; Suleiman et al. 2021, PRC 104, 015801), compose.obspm.fr/resources; NICER radii: " +
      NICER.map((n) => `${n[0]} — ${n[3]}`).join("; "),
    radius: "12 km (the middle of NICER's 11–14 km) unless NICER measured it",
    density: [14, 15.5],
    anchors: [{ name: "PSR J0740+6620", logR: log(12.5e5), tol: 0.01 }],
    async load(fetchText) {
      const rows = [];
      for (const f of FILES) {
        const text = await fetchText(BASE + f + ".dat", `ns-${f}.dat`);
        for (const line of text.split("\n")) {
          if (!line.trim() || line.startsWith("#")) continue;
          const cells = line.trim().split(/\s+/);
          if (cells.length < 4) continue;
          const M = parseFloat(cells[0]);
          if (!(M > 0)) continue;
          rows.push({ name: named(clean(cells.slice(3).join(" "))), M });
        }
      }
      const radius = new Map(NICER.map((n) => [norm(n[0]), n[2] * 1e5]));
      for (const [name, M] of NICER) if (!rows.some((r) => norm(r.name) === norm(name))) rows.push({ name, M });
      return rows.map((r) => ({ name: r.name, logM: log(r.M * M_SUN), logR: log(radius.get(norm(r.name)) ?? R_TYPICAL) }));
    },
  },
];
