// =============================================================
// build-sky-spectrum.mjs — whole-sky maps band by band, for tools/sky-spectrum.html
// =============================================================
// Run:  npm run build:sky-spectrum              (uses cached downloads)
//       npm run build:sky-spectrum -- --refresh (re-download everything)
//
// Every band, from 408 MHz radio to Fermi gamma rays, is resampled from
// its HiPS tiles onto one galactic equirectangular grid (l = 0 in the
// middle, l growing to the left, b = +90 at the top), reduced to a single
// brightness channel and normalised from its own histogram (log, asinh or
// linear stretch between two percentiles), so every band reads 0…1.
//
// Three bands are packed per RGB image (pack-0.jpg … ), JPEG 4:4:4 so the
// channels don't bleed, and bands.json lists what is where. The page reads
// all of them at once and mixes them into its own R, G and B.
// =============================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = join(ROOT, "scripts/sky/.cache/spectrum");
const OUT = join(ROOT, "tools/sky-spectrum");
const REFRESH = process.argv.includes("--refresh");
const W = 2048, H = 1024;
const TARGET_ORDER = 9; // HEALPix nside 512 ≈ 7′, about one output pixel

mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT, { recursive: true });

// Long wavelength → short. `stretch`: how raw values map to brightness.
// Planck maps hold CMB fluctuations around zero, so they get asinh (log-like
// for the bright plane, linear and signed near zero) instead of log.
const A = "https://alasky.cds.unistra.fr", IRAP = "https://cade.irap.omp.eu/documents/Ancillary/4Aladin";
const BANDS = [
  { id: "radio408", name: "Radio 408 MHz", wave: "73 cm", what: "synchrotron from cosmic-ray electrons", source: "Haslam et al., reprocessed 2014", base: `${A}/Haslam408_2014`, stretch: "log" },
  { id: "hi21", name: "21 cm hydrogen", wave: "21 cm", what: "neutral hydrogen gas", source: "HI4PI", base: `${A}/HI4PI/P_HI4PI_NHI`, stretch: "log" },
  { id: "p030", name: "Planck 30 GHz", wave: "1 cm", what: "synchrotron, free-free, CMB", source: "Planck LFI R3", base: `${A}/PLANCK/R3/LFI_SkyMap_30_R3`, stretch: "asinh" },
  { id: "p044", name: "Planck 44 GHz", wave: "6.8 mm", what: "CMB and Galactic plane", source: "Planck LFI R3", base: `${A}/PLANCK/R3/LFI_SkyMap_44_R3`, stretch: "asinh" },
  { id: "p070", name: "Planck 70 GHz", wave: "4.3 mm", what: "CMB", source: "Planck LFI R3", base: `${A}/PLANCK/R3/LFI_SkyMap_70_R3`, stretch: "asinh" },
  { id: "p100", name: "Planck 100 GHz", wave: "3 mm", what: "CMB, CO gas", source: "Planck HFI R3", base: `${A}/PLANCK/R3/HFI_SkyMap_100_R3`, stretch: "asinh" },
  { id: "p143", name: "Planck 143 GHz", wave: "2.1 mm", what: "CMB", source: "Planck HFI R3", base: `${A}/PLANCK/R3/HFI_SkyMap_143_R3`, stretch: "asinh" },
  { id: "p217", name: "Planck 217 GHz", wave: "1.4 mm", what: "CMB and dust", source: "Planck HFI R3", base: `${A}/PLANCK/R3/HFI_SkyMap_217_R3`, stretch: "asinh" },
  { id: "p353", name: "Planck 353 GHz", wave: "850 µm", what: "cold dust", source: "Planck HFI R3", base: `${A}/PLANCK/R3/HFI_SkyMap_353_R3`, stretch: "asinh" },
  { id: "p545", name: "Planck 545 GHz", wave: "550 µm", what: "cold dust", source: "Planck HFI R3", base: `${A}/PLANCK/R3/HFI_SkyMap_545_R3`, stretch: "log" },
  { id: "p857", name: "Planck 857 GHz", wave: "350 µm", what: "cold dust", source: "Planck HFI R3", base: `${A}/PLANCK/R3/HFI_SkyMap_857_R3`, stretch: "log" },
  // AKARI (2006–07) rather than IRAS: IRAS left two strips of sky unobserved
  { id: "a160", name: "AKARI 160 µm", wave: "160 µm", what: "cold dust", source: "AKARI FIS all-sky survey", base: `${A}/AKARI-FIS/N160`, stretch: "log" },
  { id: "a140", name: "AKARI 140 µm", wave: "140 µm", what: "cold dust", source: "AKARI FIS all-sky survey", base: `${A}/AKARI-FIS/WideL`, stretch: "log" },
  { id: "a90", name: "AKARI 90 µm", wave: "90 µm", what: "dust, star-forming clouds", source: "AKARI FIS all-sky survey", base: `${A}/AKARI-FIS/WideS`, stretch: "log" },
  { id: "a65", name: "AKARI 65 µm", wave: "65 µm", what: "warm dust", source: "AKARI FIS all-sky survey", base: `${A}/AKARI-FIS/N60`, stretch: "asinh" }, // faint and noisy: dips below zero near the ecliptic poles,
  { id: "w4", name: "WISE W4", wave: "22 µm", what: "warm dust, star formation", source: "AllWISE", base: `${A}/AllWISE/W4`, stretch: "log" },
  { id: "w3", name: "WISE W3", wave: "12 µm", what: "PAH molecules, zodiacal dust", source: "AllWISE", base: `${A}/AllWISE/W3`, stretch: "log" },
  { id: "w2", name: "WISE W2", wave: "4.6 µm", what: "cool stars", source: "AllWISE", base: `${A}/AllWISE/W2`, stretch: "log", minOrder: 1, lo: 0.45 },
  { id: "w1", name: "WISE W1", wave: "3.4 µm", what: "old stars", source: "AllWISE", base: `${A}/AllWISE/W1`, stretch: "log", lo: 0.35 },
  { id: "k", name: "2MASS K", wave: "2.2 µm", what: "stars through the dust", source: "2MASS", base: `${A}/2MASS/K`, stretch: "log", lo: 0.45 },
  // 2MASS H left out: the CDS HiPS shows tile-pattern streaks at every order
  { id: "j", name: "2MASS J", wave: "1.25 µm", what: "stars", source: "2MASS", base: `${A}/2MASS/J`, stretch: "log", lo: 0.45 },
  { id: "rp", name: "Gaia RP (red)", wave: "640–1050 nm", what: "starlight", source: "Gaia DR3 flux map", base: `${A}/ancillary/GaiaDR3/Rp-flux-map`, stretch: "log" },
  { id: "g", name: "Gaia G (green)", wave: "330–1050 nm", what: "starlight", source: "Gaia DR3 flux map", base: `${A}/ancillary/GaiaDR3/G-flux-map`, stretch: "log" },
  { id: "bp", name: "Gaia BP (blue)", wave: "330–680 nm", what: "starlight", source: "Gaia DR3 flux map", base: `${A}/ancillary/GaiaDR3/Bp-flux-map`, stretch: "log" },
  { id: "uv", name: "Ultraviolet", wave: "10–330 nm", what: "no all-sky map exists", source: "—", empty: true },
  { id: "xsoft", name: "X-ray 0.7–7 keV", wave: "0.2–2 nm", what: "hot gas, X-ray binaries", source: "MAXI SSC", base: "https://data.darts.isas.jaxa.jp/pub/HiPS/MAXI-SSC_Image", stretch: "lin", concurrency: 3 },
  { id: "xhard", name: "X-ray 2–20 keV", wave: "0.06–0.6 nm", what: "X-ray binaries, clusters", source: "MAXI GSC", base: "https://data.darts.isas.jaxa.jp/pub/HiPS/MAXI-GSC_Image", stretch: "lin", concurrency: 3 },
  { id: "gamma1", name: "Gamma 0.3–1 GeV", wave: "~1 fm", what: "cosmic rays hitting gas", source: "Fermi-LAT", base: `${IRAP}/Fermi_Band3`, stretch: "log" },
  { id: "gamma2", name: "Gamma 3–300 GeV", wave: "~0.01 fm", what: "pulsars, blazars", source: "Fermi-LAT", base: `${IRAP}/Fermi_Band5`, stretch: "log" },
];

// ---------- downloads ----------
async function download(url, file) {
  const path = join(CACHE, file);
  if (existsSync(path) && !REFRESH) return path;
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(5 * 60_000),
        headers: { "user-agent": "triangle-of-everything build-sky-spectrum" },
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeFileSync(path, Buffer.from(await res.arrayBuffer()));
      return path;
    } catch (err) {
      if (attempt >= 4) throw new Error(`${file}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
    }
  }
}

async function hipsProperties(base) {
  const text = await (await fetch(`${base}/properties`, { signal: AbortSignal.timeout(60_000) })).text();
  return Object.fromEntries(text.split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]));
}

// ---------- HEALPix / HiPS ----------
function interleave(x, y) {
  let p = 0;
  for (let i = 0; i < 16; i++) p |= (((x >> i) & 1) << (2 * i)) | (((y >> i) & 1) << (2 * i + 1));
  return p >>> 0;
}
// NESTED: direction (z = cos θ, φ) → face and (ix, iy) on that face
function ang2xyf(nside, z, phi) {
  const za = Math.abs(z), tt = ((phi / (Math.PI / 2)) % 4 + 4) % 4;
  if (za <= 2 / 3) {
    const t1 = nside * (0.5 + tt), t2 = nside * z * 0.75;
    const jp = Math.floor(t1 - t2), jm = Math.floor(t1 + t2);
    const ifp = Math.floor(jp / nside), ifm = Math.floor(jm / nside);
    const face = ifp === ifm ? ifp | 4 : ifp < ifm ? ifp : ifm + 8;
    return [face, jm & (nside - 1), nside - (jp & (nside - 1)) - 1];
  }
  const ntt = Math.min(3, Math.floor(tt)), tp = tt - ntt, tmp = nside * Math.sqrt(3 * (1 - za));
  const jp = Math.min(nside - 1, Math.floor(tp * tmp)), jm = Math.min(nside - 1, Math.floor((1 - tp) * tmp));
  return z >= 0 ? [ntt, nside - jm - 1, nside - jp - 1] : [ntt + 8, jp, jm];
}
// ICRS → galactic rotation (Hipparcos convention); galactic → ICRS is its transpose
const G = [
  [-0.0548755604, -0.8734370902, -0.4838350155],
  [0.4941094279, -0.4448296300, 0.7469822445],
  [-0.8676661490, -0.1980763734, 0.4559837762],
];

// One FITS tile → Float32Array in its JPEG twin's row order (FITS is bottom-up)
function readFitsTile(path) {
  const data = readFileSync(path);
  let off = 0;
  const h = {};
  for (let done = false; !done;) {
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
    f[(w - 1 - Math.floor(i / w)) * w + (i % w)] = raw === blank || !Number.isFinite(raw) ? NaN : raw * scale + zero;
  }
  return f;
}

// Fetch one band's tiles (FITS when the survey has them, else its images)
// and resample onto the grid. Returns one float value per output pixel.
async function reproject(band) {
  const props = await hipsProperties(band.base);
  const formats = props.hips_tile_format.split(/\s+/);
  const fits = formats.includes("fits");
  const ext = fits ? "fits" : formats.includes("png") ? "png" : "jpg";
  const w = +props.hips_tile_width, m = Math.log2(w);
  let order = Math.max(+(props.hips_order_min ?? 0), band.minOrder ?? 0, Math.min(+props.hips_order, TARGET_ORDER - m));
  mkdirSync(join(CACHE, band.id), { recursive: true });

  let tiles;
  for (;; order++) { // some surveys skip their lowest orders: step up until tiles exist
    tiles = new Map();
    const ids = Array.from({ length: 12 * 4 ** order }, (_, i) => i);
    let next = 0;
    await Promise.all(Array.from({ length: band.concurrency ?? 12 }, async () => {
      while (next < ids.length) {
        const n = ids[next++];
        const path = await download(`${band.base}/Norder${order}/Dir${Math.floor(n / 10000) * 10000}/Npix${n}.${ext}`,
          `${band.id}/o${order}-${n}.${ext}`);
        if (!path) continue;
        if (fits) { tiles.set(n, { data: readFitsTile(path), ch: 1 }); continue; }
        const { data, info } = await sharp(path).removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
        const lum = new Float32Array(w * w);
        for (let i = 0; i < w * w; i++) {
          const j = i * info.channels;
          lum[i] = info.channels >= 3 ? 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2] : data[j];
        }
        tiles.set(n, { data: lum, ch: 1 });
      }
    }));
    if (tiles.size > 0.5 * ids.length || order >= +props.hips_order) break;
  }

  const nTile = 2 ** order, nside = nTile * w, equatorial = props.hips_frame === "equatorial";
  const vals = new Float32Array(W * H).fill(NaN);
  for (let y = 0; y < H; y++) {
    const b = (0.5 - (y + 0.5) / H) * Math.PI;
    for (let x = 0; x < W; x++) {
      const l = (0.5 - (x + 0.5) / W) * 2 * Math.PI;
      let vx = Math.cos(b) * Math.cos(l), vy = Math.cos(b) * Math.sin(l), vz = Math.sin(b);
      if (equatorial) {
        [vx, vy, vz] = [
          G[0][0] * vx + G[1][0] * vy + G[2][0] * vz,
          G[0][1] * vx + G[1][1] * vy + G[2][1] * vz,
          G[0][2] * vx + G[1][2] * vy + G[2][2] * vz,
        ];
      }
      const [face, ix, iy] = ang2xyf(nside, vz, Math.atan2(vy, vx));
      const tile = tiles.get(face * nTile * nTile + interleave(ix >> m, iy >> m));
      if (tile) vals[y * W + x] = tile.data[(ix & (w - 1)) * w + (iy & (w - 1))];
    }
  }
  return { vals, order, fits };
}

// ---------- normalisation ----------
// Map a band to 0…1: log, asinh or linear, then its [lo, 99.8] percentiles.
// Star-dominated bands take a higher black point (lo) so survey background
// residue (scan stripes, tile edges) drops to black and the stars stay.
function normalise(vals, stretch, loPct = 0.01) {
  const finite = [];
  for (let i = 0; i < vals.length; i += 37) if (Number.isFinite(vals[i])) finite.push(vals[i]);
  finite.sort((a, b) => a - b);
  const q = (p) => finite[Math.floor(p * (finite.length - 1))];
  let f = (v) => v;
  if (stretch === "log") {
    const floor = Math.max(q(0.005), q(0.5) * 1e-3, 1e-12);
    f = (v) => Math.log10(Math.max(v, floor));
  } else if (stretch === "asinh") {
    // soft knee at a few times the typical spread around the median
    const med = q(0.5), mad = q(0.75) - q(0.25) || 1;
    f = (v) => Math.asinh((v - med) / (2 * mad));
  }
  const t = [];
  for (let i = 0; i < vals.length; i += 37) if (Number.isFinite(vals[i])) t.push(f(vals[i]));
  t.sort((a, b) => a - b);
  const lo = t[Math.floor(loPct * (t.length - 1))], hi = t[Math.floor(0.998 * (t.length - 1))];
  const out = new Uint8Array(vals.length);
  for (let i = 0; i < vals.length; i++) {
    if (!Number.isFinite(vals[i])) continue;
    out[i] = Math.round(255 * Math.max(0, Math.min(1, (f(vals[i]) - lo) / (hi - lo || 1))));
  }
  return out;
}

// ---------- build ----------
const ONLY = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const grey = [];
for (const band of BANDS) {
  const file = join(CACHE, `${band.id}.grey`);
  if (band.empty) {
    grey.push(new Uint8Array(W * H));
    continue;
  }
  if (existsSync(file) && !REFRESH && !(ONLY && ONLY.includes(band.id))) {
    grey.push(new Uint8Array(readFileSync(file)));
    console.log(`  · ${band.id} (cached)`);
    continue;
  }
  const { vals, order, fits } = await reproject(band);
  const g = normalise(vals, band.stretch, band.lo);
  writeFileSync(file, g);
  await sharp(Buffer.from(g), { raw: { width: W, height: H, channels: 1 } }).resize(512, 256).png()
    .toFile(join(CACHE, `${band.id}-preview.png`));
  grey.push(g);
  console.log(`  ✓ ${band.id} (order ${order}, ${fits ? "FITS" : "image"} tiles, ${band.stretch})`);
}

// three bands per RGB image
const packs = [];
for (let p = 0; p * 3 < BANDS.length; p++) {
  const rgb = Buffer.alloc(W * H * 3);
  for (let c = 0; c < 3; c++) {
    const g = grey[p * 3 + c];
    if (!g) continue;
    for (let i = 0; i < W * H; i++) rgb[3 * i + c] = g[i];
  }
  const file = `pack-${p}.jpg`;
  await sharp(rgb, { raw: { width: W, height: H, channels: 3 } })
    .jpeg({ quality: 90, chromaSubsampling: "4:4:4" }).toFile(join(OUT, file));
  packs.push(file);
}
// ---------- depth: where along the line of sight each band's light comes from ----------
// depth.png (512×256, same galactic grid) holds log10(distance in ly) / 11 × 255:
//   R  starlight — Gaia stars' G-flux-weighted mean log distance per sky cell
//   G  dust      — where Gaia stars' extinction rises along the line of sight
//   B  halo      — a thick-disc model (scale height 1 kpc): diffuse synchrotron, X-ray, gamma
// Each band names its depth kind; the page mixes them by what each pixel shows.
// Microwave bands are CMB (46 Gly) except where the Galaxy is bright; the page
// blends that per pixel from the 857 GHz (dust) and 408 MHz (synchrotron) maps.
const DEPTH_KIND = { stars: 0, dust: 1, halo: 2, "cmb-dust": 3, "cmb-halo": 4, none: 5 };
const depthOf = (id) =>
  ["rp", "g", "bp", "j", "k", "w1", "w2"].includes(id) ? "stars"
  : ["hi21", "p353", "p545", "p857", "a160", "a140", "a90", "a65", "w4", "w3"].includes(id) ? "dust"
  : ["p070", "p100", "p143", "p217"].includes(id) ? "cmb-dust"
  : ["p030", "p044"].includes(id) ? "cmb-halo"
  : id === "uv" ? "none" : "halo";

const DW = 512, DH = 256;
const GAIA = "https://gea.esac.esa.int/tap-server/tap/sync";
async function gaiaChunks(level, perCell, select, where, groupBy, file) {
  const cells = 12 * 4 ** level, chunk = Math.floor(49000 / perCell);
  const span = 2n ** BigInt(35 + 2 * (12 - level)); // source_ids per cell
  const rows = [];
  for (let a = 0; a < cells; a += chunk) {
    const b = Math.min(cells, a + chunk);
    const q = `SELECT GAIA_HEALPIX_INDEX(${level}, source_id) AS hpx, ${select} FROM gaiadr3.gaia_source ` +
      `WHERE ${where} AND source_id >= ${BigInt(a) * span} AND source_id < ${BigInt(b) * span} GROUP BY ${groupBy}`;
    const url = `${GAIA}?` + new URLSearchParams({ REQUEST: "doQuery", LANG: "ADQL", FORMAT: "csv", QUERY: q });
    const path = await download(url, `depth/${file}-${a}.csv`);
    const [head, ...lines] = readFileSync(path, "utf8").trim().split("\n");
    const cols = head.split(",");
    for (const l of lines) rows.push(Object.fromEntries(l.split(",").map((v, i) => [cols[i], +v])));
  }
  return rows;
}
mkdirSync(join(CACHE, "depth"), { recursive: true });

// starlight: flux-weighted mean log10 distance (ly) per level-6 cell
const STAR_LEVEL = 6;
const starRows = await gaiaChunks(STAR_LEVEL, 1,
  "SUM(phot_g_mean_flux * LOG10(3261.56 / parallax)) / SUM(phot_g_mean_flux) AS ld, COUNT(*) AS n",
  "parallax_over_error > 5", "hpx", "stars");
const starLd = new Float32Array(12 * 4 ** STAR_LEVEL).fill(NaN);
starRows.forEach((r) => { if (r.n >= 5) starLd[r.hpx] = r.ld; });

// dust: mean GSP-Phot extinction of stars in 8 distance bins (31 pc … 3.2 kpc)
// per level-5 cell; the dust sits where the extinction rises
const DUST_LEVEL = 5, NB = 8;
const dustRows = await gaiaChunks(DUST_LEVEL, NB,
  "FLOOR((LOG10(1000 / parallax) - 1.5) / 0.25) AS bin, AVG(ag_gspphot) AS ag, COUNT(*) AS n",
  "parallax_over_error > 5 AND ag_gspphot IS NOT NULL AND parallax < 31.6 AND parallax > 0.316", "hpx, bin", "dust");
const agCell = new Float32Array(12 * 4 ** DUST_LEVEL * NB).fill(NaN);
dustRows.forEach((r) => { if (r.bin >= 0 && r.bin < NB && r.n >= 3) agCell[r.hpx * NB + r.bin] = r.ag; });
const dustLd = new Float32Array(12 * 4 ** DUST_LEVEL).fill(NaN);
for (let c = 0; c < dustLd.length; c++) {
  let prev = 0, num = 0, den = 0;
  for (let k = 0; k < NB; k++) {
    const a = agCell[c * NB + k];
    if (!Number.isFinite(a)) continue;
    const cum = Math.max(prev, a), dA = cum - prev;
    num += dA * (1.5 + 0.25 * (k + 0.5) + Math.log10(3.26156)); // bin centre, log10 ly
    den += dA;
    prev = cum;
  }
  if (den > 0.05) dustLd[c] = num / den;
}

// resample onto the galactic grid; fill gaps with a disc model
const depth = Buffer.alloc(DW * DH * 3);
const enc = (ld) => Math.round(255 * Math.max(0, Math.min(1, ld / 11)));
const LY = Math.log10(3.26156);
for (let y = 0; y < DH; y++) {
  const b = (0.5 - (y + 0.5) / DH) * Math.PI, sb = Math.max(0.03, Math.abs(Math.sin(b)));
  for (let x = 0; x < DW; x++) {
    const l = (0.5 - (x + 0.5) / DW) * 2 * Math.PI;
    const gx = Math.cos(b) * Math.cos(l), gy = Math.cos(b) * Math.sin(l), gz = Math.sin(b);
    const vx = G[0][0] * gx + G[1][0] * gy + G[2][0] * gz;
    const vy = G[0][1] * gx + G[1][1] * gy + G[2][1] * gz;
    const vz = G[0][2] * gx + G[1][2] * gy + G[2][2] * gz;
    const cell = (level) => {
      const ns = 2 ** level, [f, ix, iy] = ang2xyf(ns, vz, Math.atan2(vy, vx));
      return f * ns * ns + interleave(ix, iy);
    };
    // models (pc): dust layer ~100 pc thick, halo ~1 kpc, both capped in the plane
    const dustModel = Math.log10(Math.min(100 / sb, 3000) * 0.6) + LY;
    const haloModel = Math.log10(Math.min(1000 / sb, 15000) * 0.6) + LY;
    const st = starLd[cell(STAR_LEVEL)], du = dustLd[cell(DUST_LEVEL)];
    const i = 3 * (y * DW + x);
    depth[i] = enc(Number.isFinite(st) ? st : dustModel);
    depth[i + 1] = enc(Number.isFinite(du) ? du : dustModel);
    depth[i + 2] = enc(haloModel);
  }
}
await sharp(depth, { raw: { width: DW, height: DH, channels: 3 } }).blur(1.2).png().toFile(join(OUT, "depth.png"));
console.log(`depth.png: starlight from ${starRows.length} Gaia cells, dust from ${dustLd.filter(Number.isFinite).length} cells`);

writeFileSync(join(OUT, "bands.json"), JSON.stringify({
  width: W, height: H, packs, depth: "depth.png", depthScale: 11,
  depthKinds: Object.keys(DEPTH_KIND),
  bands: BANDS.map(({ id, name, wave, what, source, empty }, i) =>
    ({ id, name, wave, what, source, empty: !!empty, pack: Math.floor(i / 3), channel: i % 3, depth: DEPTH_KIND[depthOf(id)] })),
}, null, 1));
console.log(`Wrote ${packs.length} packs for ${BANDS.length} bands to ${OUT}`);
