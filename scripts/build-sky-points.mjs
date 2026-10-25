// =============================================================
// build-sky-points.mjs — objects with measured distances, for tools/sky-points.html
// =============================================================
// Run:  npm run build:sky-points              (uses cached downloads)
//       npm run build:sky-points -- --refresh (re-download everything)
//
// One point per object, at its real direction and distance:
//   - Hipparcos stars nearer than 30 ly (the brightest, which Gaia misses);
//   - Gaia DR3 stars from 30 to 30,000 ly, sampled evenly per log-distance
//     bin (random_index keeps each sample uniform across the sky), parallax
//     measured to better than 20 %;
//   - 2MRS galaxies and a fixed sample of Quaia quasars, comoving distance
//     from redshift (flat ΛCDM, H0 = 70, Ωm = 0.3), like the CMB's 46 Gly.
// Because every Gaia bin holds about the same number of stars, the cloud
// shows where stars are, not how many: near bins are thinned far more.
//
// Output: tools/sky-points/points.bin (packed arrays) + points.json.
// =============================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = join(ROOT, "scripts/sky/.cache/points");
const ONION_CACHE = join(ROOT, "scripts/sky/.cache"); // 2MRS and Quaia, shared with the onion build
const OUT = join(ROOT, "tools/sky-points");
const REFRESH = process.argv.includes("--refresh");
mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT, { recursive: true });

const PC_IN_LY = 3.26156;
const MPC_IN_LY = 3.26156e6;

async function fetchText(url, file) {
  const path = join(CACHE, file);
  if (existsSync(path) && !REFRESH) return readFileSync(path, "utf8");
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10 * 60_000), headers: { "user-agent": "triangle-of-everything build-sky-points" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      writeFileSync(path, text);
      return text;
    } catch (err) {
      if (attempt >= 4) throw new Error(`${file}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
    }
  }
}
const csv = (text) => {
  const [head, ...rows] = text.trim().split("\n");
  const cols = head.split(",");
  return rows.map((r) => Object.fromEntries(r.split(",").map((v, i) => [cols[i], v === "" ? NaN : Number(v)])));
};
const tap = (base, query, file) => fetchText(`${base}?` + new URLSearchParams({ REQUEST: "doQuery", LANG: "ADQL", FORMAT: "csv", QUERY: query }), file);
const VIZIER = "https://tapvizier.cds.unistra.fr/TAPVizieR/tap/sync";
const GAIA = "https://gea.esac.esa.int/tap-server/tap/sync";

// ---------- geometry: ICRS → galactic → the viewer's frame ----------
// viewer frame: x toward the Galactic Centre, y toward the north galactic
// pole, z toward l = 270° (right-handed; same as the onions' spheres)
const G = [
  [-0.0548755604, -0.8734370902, -0.4838350155],
  [0.4941094279, -0.4448296300, 0.7469822445],
  [-0.8676661490, -0.1980763734, 0.4559837762],
];
const D = Math.PI / 180;
function dir(raDeg, decDeg) {
  const ra = raDeg * D, dec = decDeg * D;
  const v = [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
  const gx = G[0][0] * v[0] + G[0][1] * v[1] + G[0][2] * v[2];
  const gy = G[1][0] * v[0] + G[1][1] * v[1] + G[1][2] * v[2];
  const gz = G[2][0] * v[0] + G[2][1] * v[1] + G[2][2] * v[2];
  return [gx, gz, -gy];
}

// comoving distance (ly) for redshift z, flat ΛCDM
const DH_LY = (299792.458 / 70) * MPC_IN_LY;
const comoving = (() => {
  const table = [0];
  const dz = 0.001;
  for (let i = 1; i <= 8000; i++) {
    const z = i * dz, E = (zz) => Math.sqrt(0.3 * (1 + zz) ** 3 + 0.7);
    table.push(table[i - 1] + (dz / 2) * (1 / E(z - dz) + 1 / E(z)));
  }
  return (z) => DH_LY * table[Math.min(8000, Math.max(0, Math.round(z / dz)))];
})();

// ---------- point list ----------
// type: 0 Hipparcos star, 1 Gaia star, 2 galaxy, 3 quasar
// aux (0…1): stars → colour index scaled from −0.4…3.6; galaxies, quasars → redshift scaled
const pts = [];
const add = (ra, dec, ly, type, aux) => {
  if (!(ly > 0) || !Number.isFinite(ra) || !Number.isFinite(dec)) return;
  pts.push({ d: dir(ra, dec), logd: Math.log10(ly), type, aux: Math.max(0, Math.min(1, aux)) });
};
const colourAux = (bv) => (Number.isFinite(bv) ? (bv + 0.4) / 4 : 0.3);

// Hipparcos: everything within 30 ly with a parallax better than 10 %
const hip = csv(await tap(VIZIER, 'SELECT RArad, DErad, Plx, e_Plx, "B-V" FROM "I/311/hip2" WHERE Plx > 108.7 AND Plx > 10 * e_Plx', "hip-30ly.csv"));
hip.forEach((s) => add(s.RArad, s.DErad, (1000 / s.Plx) * PC_IN_LY, 0, colourAux(s["B-V"] * 1.25))); // B−V → roughly BP−RP
console.log(`Hipparcos: ${hip.length} stars within 30 ly`);

// Gaia: 20 log-distance bins from 30 ly to 30,000 ly, up to ~15,000 stars each
const PER_BIN = 15000;
let gaiaTotal = 0;
for (let i = 0; i < 20; i++) {
  const lo = 1.5 + i * 0.15, hi = lo + 0.15; // log10 ly
  const plxHi = 1000 / (10 ** lo / PC_IN_LY), plxLo = 1000 / (10 ** hi / PC_IN_LY);
  // random_index is a random permutation of all sources: random_index < K is a
  // uniform sample. Shrink K until the sample fits under the row cap.
  let K = 1.8e9, rows;
  for (let tries = 0; tries < 12; tries++) {
    const q = `SELECT TOP ${PER_BIN * 2} ra, dec, parallax, bp_rp FROM gaiadr3.gaia_source ` +
      `WHERE parallax BETWEEN ${plxLo} AND ${plxHi} AND parallax_over_error > 5 AND random_index < ${Math.round(K)}`;
    rows = csv(await tap(GAIA, q, `gaia-${i}-${Math.round(K)}.csv`));
    if (rows.length < PER_BIN * 2) break;
    K /= 3;
  }
  // if still more than PER_BIN, thin evenly (rows are already a random sample)
  const step = Math.max(1, rows.length / PER_BIN);
  for (let k = 0; k < rows.length; k += step) {
    const s = rows[Math.floor(k)];
    add(s.ra, s.dec, (1000 / s.parallax) * PC_IN_LY, 1, colourAux(s.bp_rp));
    gaiaTotal++;
  }
  console.log(`Gaia bin ${(10 ** lo).toFixed(0)}–${(10 ** hi).toFixed(0)} ly: ${Math.min(rows.length, PER_BIN)} stars (of a ${rows.length}-row sample, K = ${Math.round(K)})`);
}

// 2MRS galaxies (cached by the onion build, else fetched here)
const twomrsFile = join(ONION_CACHE, "2mrs.csv");
const twomrs = csv(existsSync(twomrsFile) ? readFileSync(twomrsFile, "utf8")
  : await tap(VIZIER, 'SELECT RAJ2000, DEJ2000, z FROM "J/A+A/596/A14/galist_2"', "2mrs.csv"));
let nGal = 0;
twomrs.forEach((g) => { if (g.z > 0.0005) { add(g.RAJ2000, g.DEJ2000, comoving(g.z), 2, g.z / 0.1); nGal++; } });
console.log(`2MRS: ${nGal} galaxies`);

// Quaia quasars: every 5th row of the G < 20 catalogue
function readFitsTable(path, wanted) {
  const data = readFileSync(path);
  let off = 0;
  const readHeader = () => {
    const cards = {};
    for (;;) {
      const block = data.toString("latin1", off, off + 2880);
      off += 2880;
      for (let i = 0; i < 36; i++) {
        const card = block.slice(i * 80, i * 80 + 80), key = card.slice(0, 8).trim();
        if (key === "END") return cards;
        if (card[8] === "=") cards[key] = card.slice(10).split("/")[0].trim().replace(/^'|'\s*$/g, "").trim();
      }
    }
  };
  const primary = readHeader();
  const pbytes = Math.abs(+primary.BITPIX / 8) * Array.from({ length: +primary.NAXIS }, (_, i) => +primary[`NAXIS${i + 1}`]).reduce((a, b) => a * b, +primary.NAXIS ? 1 : 0);
  off += Math.ceil(pbytes / 2880) * 2880;
  const h = readHeader();
  const rowLen = +h.NAXIS1, nRows = +h.NAXIS2;
  const SIZE = { L: 1, X: 1, B: 1, I: 2, J: 4, K: 8, A: 1, E: 4, D: 8, C: 8, M: 16 };
  const cols = {};
  let colOff = 0;
  for (let i = 1; i <= +h.TFIELDS; i++) {
    const [, rep, code] = h[`TFORM${i}`].match(/^(\d*)([A-Z])/);
    cols[h[`TTYPE${i}`].toLowerCase()] = { off: colOff, code };
    colOff += (rep === "" ? 1 : +rep) * SIZE[code];
  }
  const read = { E: "readFloatBE", D: "readDoubleBE", J: "readInt32BE", I: "readInt16BE" };
  const out = Object.fromEntries(wanted.map((w) => [w, new Float64Array(nRows)]));
  for (const w of wanted) {
    const c = cols[w];
    for (let r = 0; r < nRows; r++) out[w][r] = data[read[c.code]](off + r * rowLen + c.off);
  }
  return { n: nRows, ...out };
}
const quaiaPath = join(ONION_CACHE, "quaia_G20.0.fits");
if (!existsSync(quaiaPath)) throw new Error("Quaia catalogue missing: run npm run build:sky-onion first (it downloads it)");
const q = readFitsTable(quaiaPath, ["ra", "dec", "redshift_quaia"]);
let nQso = 0;
for (let i = 0; i < q.n; i += 5) {
  add(q.ra[i], q.dec[i], comoving(q.redshift_quaia[i]), 3, q.redshift_quaia[i] / 4.5);
  nQso++;
}
console.log(`Quaia: ${nQso} quasars (every 5th)`);

// ---------- pack ----------
// dir: Int16×3 (unit vector × 32767); logd: Uint16 over −2…12; aux: Uint8; type: Uint8
const n = pts.length, LOG_MIN = -2, LOG_MAX = 12;
const dirA = new Int16Array(3 * n), logA = new Uint16Array(n), auxA = new Uint8Array(n), typeA = new Uint8Array(n);
pts.forEach((p, i) => {
  for (let k = 0; k < 3; k++) dirA[3 * i + k] = Math.round(p.d[k] * 32767);
  logA[i] = Math.round(((p.logd - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 65535);
  auxA[i] = Math.round(p.aux * 255);
  typeA[i] = p.type;
});
const parts = [dirA, logA, auxA, typeA];
const buf = Buffer.concat(parts.map((a) => Buffer.from(a.buffer)));
writeFileSync(join(OUT, "points.bin"), buf);
let o = 0;
const layout = parts.map((a) => { const r = { offset: o, length: a.length }; o += a.byteLength; return r; });
writeFileSync(join(OUT, "points.json"), JSON.stringify({
  count: n, logMin: LOG_MIN, logMax: LOG_MAX,
  dir: layout[0], logd: layout[1], aux: layout[2], type: layout[3],
  types: ["Hipparcos star", "Gaia star", "2MRS galaxy", "Quaia quasar"],
  counts: [0, 1, 2, 3].map((t) => pts.filter((p) => p.type === t).length),
}, null, 1));
console.log(`Wrote ${n} points (${(buf.length / 1e6).toFixed(1)} MB) to ${OUT}`);
