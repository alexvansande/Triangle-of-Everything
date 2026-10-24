// =============================================================
// build-sky-onion.mjs — whole-sky maps for tools/cosmic-onion.html
// =============================================================
// Run:  npm run build:sky-onion              (uses cached downloads)
//       npm run build:sky-onion -- --refresh (re-download everything)
//
// Every layer is a full-sky equirectangular (plate carrée) image in
// GALACTIC coordinates: l = 0 (the Galactic Centre) in the middle,
// l increasing to the left (as seen from inside the sphere), b = +90 at
// the top. All layers share this grid, so they line up pixel for pixel.
//
// Two kinds of layer:
//   - survey maps, reprojected by the CDS hips2fits service from HiPS;
//   - catalogue layers we draw ourselves, so a shell really holds things
//     at one distance: nearby stars (Hipparcos), galaxies (2MRS) and
//     quasars (Quaia), coloured by distance / redshift.
// =============================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = join(ROOT, "scripts/sky/.cache");
const OUT = join(ROOT, "tools/cosmic-onion");
const REFRESH = process.argv.includes("--refresh");
const W = 4096, H = 2048;

mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT, { recursive: true });

async function download(url, file) {
  const path = join(CACHE, file);
  if (existsSync(path) && !REFRESH) return path;
  console.log(`  downloading ${file} …`);
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(15 * 60_000),
        headers: { "user-agent": "triangle-of-everything build-sky-onion" }, // Zenodo 403s the default
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeFileSync(path, Buffer.from(await res.arrayBuffer()));
      return path;
    } catch (err) {
      if (attempt >= 4) throw new Error(`${file}: ${err.message}`);
      console.log(`  retry ${file} (${err.message})`);
      await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
    }
  }
}

// ---------- survey maps (HiPS tiles, reprojected here) ----------
// We fetch the HiPS tiles ourselves (CDS hips2fits often times out on
// whole-sky requests) and resample them onto the equirectangular grid.

const SURVEYS = [
  { id: "milkyway", base: "https://alasky.cds.unistra.fr/MellingerRGB" },
  { id: "halpha", base: "https://alasky.cds.unistra.fr/FinkbeinerHalpha" },
  { id: "hydrogen", base: "https://alasky.cds.unistra.fr/HI4PI/P_HI4PI_NHI" },
  { id: "dust", base: "https://alasky.cds.unistra.fr/PLANCK/R3/HFI_SkyMap_857_R3" },
  // MAXI SSC soft X-rays (0.7–7 keV): X-ray binaries and the Galaxy's hot-gas bubbles.
  // JAXA rate-limits tile requests, hence the low concurrency.
  { id: "xray", base: "https://data.darts.isas.jaxa.jp/pub/HiPS/MAXI-SSC_Image", concurrency: 3 },
  { id: "gamma", base: "https://alasky.cds.unistra.fr/Fermi/Color" },
  { id: "cmb", base: "https://alasky.cds.unistra.fr/PLANCK/R3/CMB-smica-R3",
    fits: true, stretch: [0.5, 99.5], ramp: "cmb" },
];
const TARGET_ORDER = 10; // HEALPix nside 1024 ≈ 3.4′ pixels, finer than 4096 px across

// Interleave bits: x in the even bits, y in the odd bits (HEALPix NESTED).
function interleave(x, y) {
  let p = 0;
  for (let i = 0; i < 16; i++) p |= (((x >> i) & 1) << (2 * i)) | (((y >> i) & 1) << (2 * i + 1));
  return p >>> 0;
}

// HEALPix NESTED: direction (z = cos θ, φ) → face and (ix, iy) on that face.
function ang2xyf(nside, z, phi) {
  const za = Math.abs(z);
  const tt = ((phi / (Math.PI / 2)) % 4 + 4) % 4;
  if (za <= 2 / 3) {
    const t1 = nside * (0.5 + tt), t2 = nside * z * 0.75;
    const jp = Math.floor(t1 - t2), jm = Math.floor(t1 + t2);
    const ifp = Math.floor(jp / nside), ifm = Math.floor(jm / nside);
    const face = ifp === ifm ? ifp | 4 : ifp < ifm ? ifp : ifm + 8;
    return [face, jm & (nside - 1), nside - (jp & (nside - 1)) - 1];
  }
  const ntt = Math.min(3, Math.floor(tt)), tp = tt - ntt;
  const tmp = nside * Math.sqrt(3 * (1 - za));
  const jp = Math.min(nside - 1, Math.floor(tp * tmp)), jm = Math.min(nside - 1, Math.floor((1 - tp) * tmp));
  return z >= 0 ? [ntt, nside - jm - 1, nside - jp - 1] : [ntt + 8, jp, jm];
}

async function hipsProperties(base) {
  const text = await (await fetch(`${base}/properties`, { signal: AbortSignal.timeout(60_000) })).text();
  return Object.fromEntries(
    text.split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
  );
}

// Optional tone curve: map the [lo, hi] percentiles of `vals` to 0…1,
// then write grey or a colour ramp into `out`.
function restretch(vals, out, [plo, phi], ramp) {
  const sample = [];
  for (let i = 0; i < vals.length; i += 97) if (Number.isFinite(vals[i])) sample.push(vals[i]);
  sample.sort((a, b) => a - b);
  const lo = sample[Math.floor((plo / 100) * (sample.length - 1))];
  const hi = Math.max(lo + 1e-9, sample[Math.floor((phi / 100) * (sample.length - 1))]);
  for (let i = 0; i < vals.length; i++) {
    const t = Number.isFinite(vals[i]) ? Math.max(0, Math.min(1, (vals[i] - lo) / (hi - lo))) : 0;
    const c = ramp ? lerpRamp(RAMPS[ramp], t) : [t, t, t];
    for (let k = 0; k < 3; k++) out[3 * i + k] = Math.round(255 * c[k]);
  }
}

// One HiPS FITS tile → Float32Array in the same row order as its JPEG twin
// (FITS stores the bottom row first).
function readFitsTile(path) {
  const data = readFileSync(path);
  let off = 0;
  const h = {};
  for (let done = false; !done; ) {
    for (let i = 0; i < 36; i++, off += 80) {
      const card = data.toString("latin1", off, off + 80);
      if (card.startsWith("END ")) done = true;
      else if (card[8] === "=") h[card.slice(0, 8).trim()] = card.slice(10).split("/")[0].trim();
    }
  }
  const w = +h.NAXIS1, n = w * +h.NAXIS2, bitpix = +h.BITPIX;
  const scale = +(h.BSCALE ?? 1), zero = +(h.BZERO ?? 0), blank = h.BLANK === undefined ? null : +h.BLANK;
  const rd = { "-32": [4, "readFloatBE"], "-64": [8, "readDoubleBE"], 32: [4, "readInt32BE"], 16: [2, "readInt16BE"], 8: [1, "readUInt8"] }[bitpix];
  const f = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const raw = data[rd[1]](off + i * rd[0]);
    const row = w - 1 - Math.floor(i / w);
    f[row * w + (i % w)] = raw === blank ? NaN : raw * scale + zero;
  }
  return f;
}

async function loadTiles(base, id, order, ext, fits, concurrency) {
  const tiles = new Map();
  const ids = Array.from({ length: 12 * 4 ** order }, (_, i) => i);
  mkdirSync(join(CACHE, id), { recursive: true });
  let next = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (next < ids.length) {
      const n = ids[next++];
      const dir = Math.floor(n / 10000) * 10000;
      let path;
      try {
        path = await download(`${base}/Norder${order}/Dir${dir}/Npix${n}.${ext}`, `${id}/o${order}-${n}.${ext}`);
      } catch {
        continue; // a missing tile (blank sky) stays black
      }
      if (fits) {
        tiles.set(n, { data: readFitsTile(path), ch: 1 });
        continue;
      }
      const { data, info } = await sharp(path).removeAlpha().toColourspace("srgb").raw()
        .toBuffer({ resolveWithObject: true });
      tiles.set(n, { data, ch: info.channels });
    }
  }));
  return tiles;
}

async function survey({ id, base, stretch, ramp, fits, concurrency = 12 }) {
  const props = await hipsProperties(base);
  const w = +props.hips_tile_width, m = Math.log2(w);
  const order = Math.max(0, Math.min(+props.hips_order, TARGET_ORDER - m));
  const nTile = 2 ** order, nside = nTile * w;
  const formats = props.hips_tile_format.split(/\s+/);
  const ext = fits ? "fits" : formats.includes("jpeg") ? "jpg" : "png";
  const equatorial = props.hips_frame === "equatorial";

  console.log(`  ${id}: ${12 * nTile * nTile} tiles, order ${order}, ${w}px, ${props.hips_frame}`);
  const tiles = await loadTiles(base, id, order, ext, fits, concurrency);

  const out = Buffer.alloc(W * H * 3);
  const vals = stretch ? new Float32Array(W * H).fill(NaN) : null;
  for (let y = 0; y < H; y++) {
    const b = (0.5 - (y + 0.5) / H) * Math.PI;
    for (let x = 0; x < W; x++) {
      const l = (0.5 - (x + 0.5) / W) * 2 * Math.PI;
      let vx = Math.cos(b) * Math.cos(l), vy = Math.cos(b) * Math.sin(l), vz = Math.sin(b);
      if (equatorial) { // galactic → ICRS is the transpose of G
        [vx, vy, vz] = [
          G[0][0] * vx + G[1][0] * vy + G[2][0] * vz,
          G[0][1] * vx + G[1][1] * vy + G[2][1] * vz,
          G[0][2] * vx + G[1][2] * vy + G[2][2] * vz,
        ];
      }
      const [face, ix, iy] = ang2xyf(nside, vz, Math.atan2(vy, vx));
      const tile = tiles.get(face * nTile * nTile + interleave(ix >> m, iy >> m));
      if (!tile) continue;
      // inside a HiPS tile, image row = the cell's x and column = its y
      const src = ((ix & (w - 1)) * w + (iy & (w - 1))) * tile.ch;
      if (vals) vals[y * W + x] = tile.data[src];
      else for (let k = 0; k < 3; k++) out[3 * (y * W + x) + k] = tile.data[src + (tile.ch >= 3 ? k : 0)];
    }
  }
  if (vals) restretch(vals, out, stretch, ramp);
  await sharp(out, { raw: { width: W, height: H, channels: 3 } }).jpeg({ quality: 88 })
    .toFile(join(OUT, `${id}.jpg`));
}

// ---------- catalogue rendering ----------

// ICRS (J2000) → galactic rotation matrix (Hipparcos convention).
const G = [
  [-0.0548755604, -0.8734370902, -0.4838350155],
  [0.4941094279, -0.4448296300, 0.7469822445],
  [-0.8676661490, -0.1980763734, 0.4559837762],
];
const D = Math.PI / 180;

function toPixel(raDeg, decDeg) {
  const ra = raDeg * D, dec = decDeg * D;
  const v = [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
  const x = G[0][0] * v[0] + G[0][1] * v[1] + G[0][2] * v[2];
  const y = G[1][0] * v[0] + G[1][1] * v[1] + G[1][2] * v[2];
  const z = G[2][0] * v[0] + G[2][1] * v[1] + G[2][2] * v[2];
  const l = Math.atan2(y, x) / D;               // −180…180
  const b = Math.asin(Math.max(-1, Math.min(1, z))) / D;
  let px = W * (0.5 - l / 360);
  px = ((px % W) + W) % W;
  return [px, H * (0.5 - b / 180), b];
}

// Additive Gaussian splat into a float RGB canvas. Near the poles a pixel
// covers less sky, so the splat is widened in x by 1/cos(b) to stay round
// on the sphere.
function splat(buf, px, py, b, sigma, r, g, bl) {
  const sx = sigma / Math.max(0.05, Math.cos(b * D));
  const rx = Math.ceil(sx * 3), ry = Math.ceil(sigma * 3);
  for (let dy = -ry; dy <= ry; dy++) {
    const y = Math.round(py) + dy;
    if (y < 0 || y >= H) continue;
    const fy = (y + 0.5 - py) / sigma;
    for (let dx = -rx; dx <= rx; dx++) {
      const xi = Math.round(px) + dx;
      const fx = (xi + 0.5 - px) / sx;
      const w = Math.exp(-0.5 * (fx * fx + fy * fy));
      if (w < 0.01) continue;
      const i = 3 * (y * W + (((xi % W) + W) % W));
      buf[i] += r * w; buf[i + 1] += g * w; buf[i + 2] += bl * w;
    }
  }
}

async function writeCanvas(buf, file, gain = 1) {
  const out = Buffer.alloc(W * H * 3);
  for (let i = 0; i < out.length; i++) {
    // soft shoulder so dense regions saturate gracefully
    out[i] = Math.round(255 * (1 - Math.exp(-buf[i] * gain)));
  }
  await sharp(out, { raw: { width: W, height: H, channels: 3 } })
    .jpeg({ quality: 90 })
    .toFile(join(OUT, file));
}

// Colour ramps.
function lerpRamp(stops, t) {
  t = Math.max(0, Math.min(1, t));
  const s = t * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(s)), f = s - i;
  return stops[i].map((c, k) => c + (stops[i + 1][k] - c) * f);
}
// B−V → approximate star colour (blue-white to orange-red)
const STAR_RAMP = [[0.62, 0.72, 1], [0.85, 0.9, 1], [1, 1, 1], [1, 0.93, 0.78], [1, 0.78, 0.5], [1, 0.6, 0.35]];
// redshift / distance ramp: near = cyan-white, far = magenta-red
const DEPTH_RAMP = [[0.6, 0.95, 1], [0.45, 0.7, 1], [0.75, 0.5, 1], [1, 0.45, 0.75], [1, 0.45, 0.35]];
// Planck-style CMB palette: cold blue → white → hot orange
const RAMPS = { cmb: [[0.0, 0.05, 0.35], [0.1, 0.35, 0.85], [0.95, 0.95, 0.9], [1, 0.62, 0.15], [0.55, 0.08, 0.02]] };

async function tapCsv(query, file) {
  const url =
    "https://tapvizier.cds.unistra.fr/TAPVizieR/tap/sync?" +
    new URLSearchParams({ REQUEST: "doQuery", LANG: "ADQL", FORMAT: "csv", MAXREC: "2000000", QUERY: query });
  const text = readFileSync(await download(url, file), "utf8").trim().split("\n");
  const head = text[0].split(",");
  return text.slice(1).map((line) => {
    const cells = line.split(",");
    return Object.fromEntries(head.map((h, i) => [h, cells[i] === "" ? NaN : Number(cells[i])]));
  });
}

// Nearby stars: Hipparcos (van Leeuwen 2007), parallax > 10 mas = within ~330 ly.
async function nearbyStars() {
  const rows = await tapCsv(
    'SELECT RArad, DErad, Plx, Hpmag, "B-V" FROM "I/311/hip2" WHERE Plx > 10',
    "hip2-near.csv",
  );
  const buf = new Float32Array(W * H * 3);
  for (const s of rows) {
    const [px, py, b] = toPixel(s.RArad, s.DErad);
    const flux = Math.pow(10, -0.4 * (s.Hpmag - 6)); // mag 6 → 1
    const [r, g, bl] = lerpRamp(STAR_RAMP, ((isNaN(s["B-V"]) ? 0.6 : s["B-V"]) + 0.3) / 2.0);
    const amp = Math.min(6, 0.35 + 1.2 * Math.sqrt(flux));
    const sigma = 0.9 + 1.4 * Math.min(1, Math.pow(flux, 0.25));
    splat(buf, px, py, b, sigma, r * amp, g * amp, bl * amp);
  }
  await writeCanvas(buf, "stars.jpg");
  return rows.length;
}

// Galaxies: 2MASS Redshift Survey (galaxy list of Saulder et al. 2016), z ≲ 0.08.
async function galaxies() {
  const rows = await tapCsv('SELECT RAJ2000, DEJ2000, z FROM "J/A+A/596/A14/galist_2"', "2mrs.csv");
  const buf = new Float32Array(W * H * 3);
  for (const g of rows) {
    if (isNaN(g.z)) continue;
    const [px, py, b] = toPixel(g.RAJ2000, g.DEJ2000);
    const [r, gg, bl] = lerpRamp(DEPTH_RAMP, Math.sqrt(Math.max(0, g.z) / 0.06));
    splat(buf, px, py, b, 1.6, r * 0.9, gg * 0.9, bl * 0.9);
  }
  await writeCanvas(buf, "galaxies.jpg");
  return rows.length;
}

// Minimal reader for a FITS binary table (first extension): only the
// scalar float/double/int columns we ask for.
function readFitsTable(path, wanted) {
  const data = readFileSync(path);
  let off = 0;
  const readHeader = () => {
    const cards = {};
    for (;;) {
      const block = data.toString("latin1", off, off + 2880);
      off += 2880;
      for (let i = 0; i < 36; i++) {
        const card = block.slice(i * 80, i * 80 + 80);
        const key = card.slice(0, 8).trim();
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
  const out = Object.fromEntries(wanted.map((w) => [w, new Float64Array(nRows)]));
  const read = { E: "readFloatBE", D: "readDoubleBE", J: "readInt32BE", I: "readInt16BE", K: "readBigInt64BE" };
  for (const w of wanted) {
    const c = cols[w];
    if (!c) throw new Error(`FITS column ${w} not found in ${Object.keys(cols)}`);
    const fn = read[c.code];
    for (let r = 0; r < nRows; r++) out[w][r] = Number(data[fn](off + r * rowLen + c.off));
  }
  return { n: nRows, ...out };
}

// Quasars: Quaia, the Gaia–unWISE quasar catalogue (Storey-Fisher et al. 2024), G < 20.
async function quasars() {
  const path = await download(
    "https://zenodo.org/api/records/10403370/files/quaia_G20.0.fits/content",
    "quaia_G20.0.fits",
  );
  const t = readFitsTable(path, ["ra", "dec", "redshift_quaia"]);
  const buf = new Float32Array(W * H * 3);
  for (let i = 0; i < t.n; i++) {
    const [px, py, b] = toPixel(t.ra[i], t.dec[i]);
    const [r, g, bl] = lerpRamp(DEPTH_RAMP, (t.redshift_quaia[i] - 0.3) / 3.2);
    splat(buf, px, py, b, 0.8, r * 0.22, g * 0.22, bl * 0.22);
  }
  await writeCanvas(buf, "quasars.jpg");
  return t.n;
}

// --only=cmb,stars builds just those layers
const ONLY = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const want = (id) => !ONLY || ONLY.includes(id);

console.log("Survey maps (HiPS):");
for (const s of SURVEYS.filter((s) => want(s.id))) {
  await survey(s);
  console.log(`  ✓ ${s.id}`);
}
console.log("Catalogue layers:");
if (want("stars")) console.log(`  ✓ stars    ${await nearbyStars()} Hipparcos stars within ~330 ly`);
if (want("galaxies")) console.log(`  ✓ galaxies ${await galaxies()} 2MRS galaxies`);
if (want("quasars")) console.log(`  ✓ quasars  ${await quasars()} Quaia quasars`);
console.log(`Wrote ${OUT}`);
