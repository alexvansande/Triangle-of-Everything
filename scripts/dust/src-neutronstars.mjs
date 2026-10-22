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
// Radius: almost no neutron star has a measured radius. The NICER ones sit at
// 11.4–12.7 km with ±1 km errors, consistent with a single radius of about 12 km
// whatever the mass. So each star gets a radius spread at random between 11.2 and
// 13.2 km (fixed per name, so rebuilds don't move it): a range, not a line that
// looks measured. The NICER pulsars whose radius is well measured get theirs (and
// are added when the compilation lacks a timing mass for them).
// =============================================================

const log = Math.log10;
const M_SUN = 1.989e33;
const R_RANGE = [11.2e5, 13.2e5];                     // cm: illustrative, see above
// a fixed pseudo-random number in [0, 1) from the star's name (FNV-1a)
const unit = (name) => { let h = 2166136261; for (const ch of name) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0; return h / 2 ** 32; };
const radiusOf = (name) => R_RANGE[0] + (R_RANGE[1] - R_RANGE[0]) * unit(name);
const BASE = "https://compose.obspm.fr/download/pdf/";
const FILES = ["DNS", "MSP", "SLOW", "XOPT", "GW"];

// NICER pulse-profile fits: [name, M (M_sun), R (km), ref]
const NICER = [
  ["PSR J0030+0451", 1.43, 12.7, "Vinciguerra et al. 2024, ApJ 961, 62"],
  ["PSR J0740+6620", 2.08, 12.5, "Salmi et al. 2024, ApJ 974, 294 (mass: Fonseca et al. 2021)"],
  ["PSR J0437−4715", 1.418, 11.36, "Choudhury et al. 2024, ApJL 971, L20"],
];
// Left out: PSR J1231−1411 (Salmi et al. 2024: 1.04 Msun, 12.6 km). Its mass and
// radius both come from the X-ray fit and are set mostly by its priors (a 2025
// reanalysis gets 1.12 Msun, 9.9 km), and it has no timing mass in the compilation.
const norm = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");

// LaTeX bits in the CompOSE names: J1741$+$1351, Her$\,$X$-$1
const clean = (s) => s.replace(/\$\+\$/g, "+").replace(/\$-\$/g, "−").replace(/\$\\,\$/g, " ").replace(/\$/g, "").trim();
// The compilation's typos: J0952+0607 is PSR J0952−0607 (Romani et al. 2022)
const FIX = { "J0952+0607": "J0952−0607" };
const named = (s) => (/^[JB]\d/.test(FIX[s] || s) ? `PSR ${FIX[s] || s}` : s)
  .replace(/^GW170817a$/, "GW170817 (heavier star)").replace(/^GW170817b$/, "GW170817 (lighter star)");

export default [
  {
    id: "neutronstar",
    label: "Neutron star · measured mass (CompOSE), radius illustrative",
    cat: "remnant",
    cite: "CompOSE neutron-star mass compilation (Suleiman & Fortin; Suleiman et al. 2021, PRC 104, 015801), compose.obspm.fr/resources; NICER radii: " +
      NICER.map((n) => `${n[0]} — ${n[3]}`).join("; "),
    radius: "not measured: spread at random over 11.2–13.2 km (NICER's measured range), unless NICER measured it well",
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
      return rows.map((r) => ({ name: r.name, logM: log(r.M * M_SUN), logR: log(radius.get(norm(r.name)) ?? radiusOf(r.name)) }));
    },
  },
];
