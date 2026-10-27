// =============================================================
// source-depth.mjs — measured distances for radio, X-ray and gamma-ray sources
// =============================================================
// Used by build-sky-spectrum.mjs to place the radio galaxies' and the
// high-energy bands' light where the catalogued sources actually are,
// instead of in a halo model.
//
// Every source gets a distance from a measurement, or none:
//   - galaxies, AGN, blazars, clusters, radio galaxies: redshift → comoving distance (flat
//     ΛCDM, H0 70, Ωm 0.3), or a published distance in Mpc for nearby ones;
//   - pulsars and pulsar wind nebulae: the ATNF catalogue's best distance;
//   - X-ray binaries: the Avakyan et al. (2023) LMXB catalogue's distance;
//   - binaries, novae, CVs, stars: Gaia DR3 parallax of the optical
//     counterpart (within 2″, parallax over error > 3);
//   - globular clusters: Harris (1996, 2010 edition);
//   - the Magellanic Clouds, M31, M33, the Galactic Centre: standard values.
// Blazars without a redshift get their class's median redshift (4LAC:
// BL Lac 0.33, FSRQ 1.1, unclassified 0.5), flagged "typical"; anything else
// without a distance (unassociated sources, most supernova remnants) is left
// to the diffuse rule.
// Catalogues come from VizieR's TAP service:
//   Swift-BAT 105-month (Oh et al. 2018, J/ApJS/235/4), MCXC (Piffaretti et
//   al. 2011, J/A+A/534/A109), Fermi 4FGL-DR4 (IX/72), 4LAC (Ajello et al.
//   2020, J/ApJ/892/105), ATNF (B/psr), LMXBcat (J/A+A/675/A199),
//   Harris (VII/202), Gaia DR3 (I/355); radio: G4Jy (White et al. 2020,
//   redshifts from the 2025 release, J/MNRAS/547/G446; south of +30°),
//   3CR (Spinrad et al. 1985, J/PASP/97/932; north of −5°), plus four that
//   G4Jy leaves out: Centaurus A and Fornax A (3.8 and 20.8 Mpc, from
//   Cepheids, red giants and supernovae), Hydra A and Pictor A (redshifts).
// =============================================================

const VIZIER = "https://tapvizier.cds.unistra.fr/TAPVizieR/tap/sync";
const KPC_LY = 3261.56;

// comoving distance in log10 ly
const comovingCache = new Map();
export function comovingLd(z) {
  const key = Math.round(z * 1e4);
  if (comovingCache.has(key)) return comovingCache.get(key);
  const n = 400, om = 0.3;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const zi = (z * (i + 0.5)) / n;
    s += 1 / Math.sqrt(om * (1 + zi) ** 3 + 1 - om);
  }
  const mpc = (299792.458 / 70) * s * (z / n);
  const ld = Math.log10(mpc * 1000 * KPC_LY);
  comovingCache.set(key, ld);
  return ld;
}
const kpcLd = (kpc) => Math.log10(kpc * KPC_LY);

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (ch !== "\r") field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(r.map((v, i) => [head[i], v.trim()])));
}
const num = (v) => (v === undefined || v === "" ? NaN : +v);

// unit vector from RA/Dec in degrees, and the angle between two in degrees
const vec = (ra, de) => {
  const a = (ra * Math.PI) / 180, d = (de * Math.PI) / 180;
  return [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)];
};
const sep = (u, v) => (Math.acos(Math.min(1, u[0] * v[0] + u[1] * v[1] + u[2] * v[2])) * 180) / Math.PI;
// nearest catalogue entry within maxDeg (entries carry .v)
function nearest(list, v, maxDeg) {
  let best = null, bd = maxDeg;
  for (const e of list) {
    if (Math.abs(e.v[2] - v[2]) > maxDeg * 0.0175) continue;
    const d = sep(e.v, v);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

export async function sourceCatalogues(download) {
  const tap = async (query, file) => {
    const url = `${VIZIER}?` + new URLSearchParams({ REQUEST: "doQuery", LANG: "ADQL", FORMAT: "csv", QUERY: query });
    const path = await download(url, `sources/${file}.csv`);
    const { readFileSync } = await import("node:fs");
    return parseCsv(readFileSync(path, "utf8"));
  };

  // reference distances
  const atnf = (await tap(`SELECT PSRJ, RAJ2000, DEJ2000, Dist FROM "B/psr/psr" WHERE Dist > 0`, "atnf"))
    .map((r) => ({ v: vec(+r.RAJ2000, +r.DEJ2000), ld: kpcLd(+r.Dist), name: r.PSRJ }));
  const lmxb = (await tap(`SELECT Name, RA_ICRS, DE_ICRS, MeanDist FROM "J/A+A/675/A199/lmxbcat" WHERE MeanDist > 0`, "lmxb"))
    .map((r) => ({ v: vec(+r.RA_ICRS, +r.DE_ICRS), ld: kpcLd(+r.MeanDist / 1000), name: r.Name }));
  const harris = (await tap(`SELECT ID, RAJ2000, DEJ2000, Rsun FROM "VII/202/catalog" WHERE Rsun > 0`, "harris"))
    .map((r) => ({ v: vec(+r.RAJ2000, +r.DEJ2000), ld: kpcLd(+r.Rsun), name: r.ID }));

  // Gaia DR3 parallaxes for a list of counterpart positions, 25 per query
  async function gaiaParallax(list, file) {
    const out = new Map();
    for (let i = 0; i < list.length; i += 25) {
      const part = list.slice(i, i + 25);
      const where = part.map((s) => `1=CONTAINS(POINT('ICRS',RA_ICRS,DE_ICRS),CIRCLE('ICRS',${s.ra},${s.de},0.00056))`).join(" OR ");
      const rows = await tap(`SELECT RA_ICRS, DE_ICRS, Plx, e_Plx FROM "I/355/gaiadr3" WHERE ${where}`, `${file}-${i}`);
      const stars = rows.map((r) => ({ v: vec(+r.RA_ICRS, +r.DE_ICRS), plx: +r.Plx, e: +r.e_Plx }));
      for (const s of part) {
        const g = nearest(stars, vec(s.ra, s.de), 0.00056);
        if (g && g.plx > 3 * g.e) out.set(s, kpcLd(1 / g.plx));
      }
    }
    return out;
  }
  const NAMED = { LMC: 50, SMC: 62, "M 31": 765, "M 33": 870 }; // kpc

  // ---------- X-ray: Swift-BAT 105-month + MCXC clusters ----------
  const bat = await tap(`SELECT RAJ2000, DEJ2000, RACdeg, DECdeg, Flux, z, Type, CName FROM "J/ApJS/235/4/table3"`, "bat105");
  const xray = [], needGaia = [];
  const EXTRAGALACTIC = /Sy|AGN|LINER|Beamed|Galaxy Cluster|Starburst|Compact group/;
  for (const r of bat) {
    const ra = Number.isFinite(num(r.RACdeg)) ? +r.RACdeg : +r.RAJ2000;
    const de = Number.isFinite(num(r.DECdeg)) ? +r.DECdeg : +r.DEJ2000;
    const s = { ra, de, v: vec(ra, de), f: +r.Flux, ld: NaN, how: "", name: r.CName };
    const z = num(r.z);
    if (EXTRAGALACTIC.test(r.Type)) {
      if (z > 0) { s.ld = comovingLd(z); s.how = "redshift"; }
    } else if (r.Type === "Pulsar") {
      const p = nearest(atnf, s.v, 0.2);
      if (p) { s.ld = p.ld; s.how = "pulsar"; }
    } else if (r.Type === "GC") {
      const g = nearest(harris, s.v, 0.1);
      if (g) { s.ld = g.ld; s.how = "globular"; }
    } else if (r.Type === "Galactic Center") {
      s.ld = kpcLd(8.18); s.how = "galactic centre";
    } else if (/LMXB|HMXB|XRB|CV|star|Symbiotic|Nova|Open star cluster/.test(r.Type)) {
      const b = nearest(lmxb, s.v, 0.1);
      if (b) { s.ld = b.ld; s.how = "binary catalogue"; } else needGaia.push(s);
    }
    xray.push(s);
  }
  const xPlx = await gaiaParallax(needGaia, "gaia-bat");
  for (const [s, ld] of xPlx) { s.ld = ld; s.how = "parallax"; }
  const mcxc = await tap(`SELECT RAJ2000, DEJ2000, z, L500 FROM "J/A+A/534/A109/mcxc" WHERE z > 0`, "mcxc");
  for (const r of mcxc) {
    const z = +r.z, ld = comovingLd(z), dlCm = (1 + z) * 10 ** ld * 9.4607e17;
    // L500 (10^44 erg/s, 0.1–2.4 keV) → flux in BAT's units (10^-12 erg/cm²/s)
    xray.push({ ra: +r.RAJ2000, de: +r.DEJ2000, f: (+r.L500 * 1e44) / (4 * Math.PI * dlCm ** 2) / 1e-12, ld, how: "redshift", name: "cluster" });
  }

  // ---------- gamma: Fermi 4FGL-DR4, distances from 4LAC, ATNF, Harris, Gaia ----------
  const fgl = await tap(`SELECT "4FGL", RAJ2000, DEJ2000, RACdeg, DECdeg, Cl1, Assoc1, F300, F3000, F10000, F30000, F100000 FROM "IX/72/4fgldr4"`, "4fgl-dr4");
  const lac = new Map();
  for (const r of await tap(`SELECT "4FGL", z FROM "J/ApJ/892/105/4lac" WHERE z > 0`, "4lac")) lac.set(r["4FGL"], { z: +r.z });
  for (const r of await tap(`SELECT "4FGL", z, Dist FROM "J/ApJ/892/105/table6"`, "4lac-pec")) {
    if (num(r.z) > 0 || num(r.Dist) > 0) lac.set(r["4FGL"], { z: num(r.z), mpc: num(r.Dist) });
  }
  const TYPICAL_Z = { bll: 0.33, fsrq: 1.1, bcu: 0.5 };
  const gamma = [], gNeedGaia = [];
  for (const r of fgl) {
    const cl = r.Cl1.toLowerCase();
    const ra = Number.isFinite(num(r.RACdeg)) ? +r.RACdeg : +r.RAJ2000;
    const de = Number.isFinite(num(r.DECdeg)) ? +r.DECdeg : +r.DEJ2000;
    const s = {
      ra, de, v: vec(ra, de), ld: NaN, how: "", name: r.Assoc1 || r["4FGL"],
      f1: num(r.F300) || 0, f2: [r.F3000, r.F10000, r.F30000, r.F100000].reduce((a, x) => a + (num(x) || 0), 0),
    };
    const known = lac.get(r["4FGL"]);
    if (NAMED[r.Assoc1]) { s.ld = kpcLd(NAMED[r.Assoc1]); s.how = "named galaxy"; }
    else if (known && known.mpc > 0) { s.ld = kpcLd(known.mpc * 1000); s.how = "distance"; }
    else if (known && known.z > 0) { s.ld = comovingLd(known.z); s.how = "redshift"; }
    else if (TYPICAL_Z[cl]) { s.ld = comovingLd(TYPICAL_Z[cl]); s.how = "typical"; }
    else if (cl === "psr" || cl === "msp" || cl === "pwn") {
      const p = nearest(atnf, s.v, 0.1);
      if (p) { s.ld = p.ld; s.how = "pulsar"; }
    } else if (cl === "glc") {
      const g = nearest(harris, s.v, 0.1);
      if (g) { s.ld = g.ld; s.how = "globular"; }
    } else if (["hmb", "lmb", "bin", "nov"].includes(cl)) {
      const b = nearest(lmxb, s.v, 0.05);
      if (b) { s.ld = b.ld; s.how = "binary catalogue"; } else gNeedGaia.push(s);
    }
    gamma.push(s);
  }
  const gPlx = await gaiaParallax(gNeedGaia, "gaia-4fgl");
  for (const [s, ld] of gPlx) { s.ld = ld; s.how = "parallax"; }

  // ---------- radio: G4Jy (151 MHz) and 3CRR (178 MHz), scaled to 408 MHz ----------
  // spectral index −0.8, typical of radio lobes; the flux only ranks sources
  const to408 = (jy, mhz) => jy * (408 / mhz) ** -0.8;
  const radio = [];
  const g4 = await tap(`SELECT G4Jy, NED, RAJ2000, DEJ2000, RAHdeg, DEHdeg, Fint151, zspDESI, zspWARNDESI, zspMisc, zNED, zphMisc, zphLSDR8south, zphANNwiseScos FROM "J/MNRAS/547/G446/catalog"`, "g4jy");
  for (const r of g4) {
    const ra = Number.isFinite(num(r.RAHdeg)) ? +r.RAHdeg : +r.RAJ2000;
    const de = Number.isFinite(num(r.DEHdeg)) ? +r.DEHdeg : +r.DEJ2000;
    const spec = [num(r.zspDESI) > 0 && num(r.zspWARNDESI) === 0 ? +r.zspDESI : NaN, num(r.zspMisc), num(r.zNED)].find((z) => z > 0);
    const phot = [num(r.zphMisc), num(r.zphLSDR8south), num(r.zphANNwiseScos)].find((z) => z > 0);
    const z = spec ?? phot;
    radio.push({ ra, de, f: to408(+r.Fint151, 151), ld: z > 0 ? comovingLd(z) : NaN, how: spec ? "redshift" : phot ? "photometric redshift" : "", name: r.NED || r.G4Jy });
  }
  const c3 = await tap(`SELECT "3CR", z, "S(178)", "_RA.icrs", "_DE.icrs" FROM "J/PASP/97/932/3cr" WHERE z > 0`, "3cr");
  for (const r of c3) {
    radio.push({ ra: +r._RA_icrs, de: +r._DE_icrs, f: to408(+r["S(178)"], 178), ld: comovingLd(+r.z), how: "redshift", name: `3C ${+r["3CR"]}` });
  }
  // the great southern radio galaxies G4Jy leaves out;
  // size: rough extent of their lobes, added to the beam (degrees)
  radio.push({ ra: 201.3651, de: -43.0191, f: 2500, ld: kpcLd(3800), how: "distance", name: "Centaurus A", size: 2.5 });
  radio.push({ ra: 50.6738, de: -37.2083, f: 330, ld: kpcLd(20800), how: "distance", name: "Fornax A", size: 0.4 });
  radio.push({ ra: 139.5236, de: -12.0955, f: 115, ld: comovingLd(0.0549), how: "redshift", name: "Hydra A" });
  radio.push({ ra: 79.9572, de: -45.779, f: 166, ld: comovingLd(0.0351), how: "redshift", name: "Pictor A" });
  return { xray, gamma, radio };
}
