// =============================================================
// build-sun-spectrum.mjs — the Sun band by band, for tools/sky-spectrum.html (Sun)
// =============================================================
// Run:  npm run build:sun-spectrum              (uses cached downloads)
//       npm run build:sun-spectrum -- --refresh
//
// 18 December 2015, about 02:44 UTC, the one moment with radio, millimetre
// and SDO images together:
//   - Nobeyama Radioheliograph 17 GHz (FITS, the observatory's daily image);
//   - ALMA's 1.25 mm full-disc map from that week (ESO release eso1703c);
//   - SDO HMI and AIA, via Helioviewer, which serves every channel at one
//     scale (2.5″ per pixel) centred on the Sun.
// The radio and ALMA discs carry no usable scale, so each is fitted (centre
// and radius of the bright disc) and resampled onto SDO's. Each band is one
// brightness channel normalised from its own histogram; solar north up.
// =============================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";
import { normalise, writePacks } from "./sky/spectrum-pack.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = join(ROOT, "scripts/sky/.cache/sun");
const OUT = join(ROOT, "tools/sun-spectrum");
const REFRESH = process.argv.includes("--refresh");
const DATE = "2015-12-18T02:44:33Z";
const N = 1024;
mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT, { recursive: true });

async function download(url, file) {
  const path = join(CACHE, file);
  if (existsSync(path) && !REFRESH) return path;
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5 * 60_000), headers: { "user-agent": "triangle-of-everything build-sun-spectrum" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeFileSync(path, Buffer.from(await res.arrayBuffer()));
      return path;
    } catch (err) {
      if (attempt >= 4) throw new Error(`${file}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
    }
  }
}

// a grey float image (w × h) from any picture: luminance
async function lumImage(path) {
  const { data, info } = await sharp(path).removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
  const v = new Float32Array(info.width * info.height);
  for (let i = 0; i < v.length; i++) v[i] = 0.299 * data[3 * i] + 0.587 * data[3 * i + 1] + 0.114 * data[3 * i + 2];
  return { v, w: info.width, h: info.height };
}
const helio = async (layer, file) => lumImage(await download(
  `https://api.helioviewer.org/v2/takeScreenshot/?date=${DATE}&imageScale=2.5&layers=[${layer},1,100]&x0=0&y0=0&width=${N}&height=${N}&display=true&watermark=false`,
  `${file}.png`));

// disc centre and radius from the area above a threshold
function fitDisc({ v, w }, thr) {
  let n = 0, sx = 0, sy = 0;
  for (let i = 0; i < v.length; i++) if (v[i] > thr) { n++; sx += i % w; sy += Math.floor(i / w); }
  return { cx: sx / n, cy: sy / n, r: Math.sqrt(n / Math.PI) };
}
function align(img, thr, to) {
  const d = fitDisc(img, thr), s = d.r / to.r, out = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const sx = Math.round(d.cx + (x - to.cx) * s), sy = Math.round(d.cy + (y - to.cy) * s);
    out[y * N + x] = sx >= 0 && sy >= 0 && sx < img.w && sy < img.h ? img.v[sy * img.w + sx] : 0;
  }
  return { v: out, w: N, h: N };
}

const hmi = await helio("SDO,HMI,continuum", "hmi");
const DISC = fitDisc(hmi, 50);

// Nobeyama 17 GHz: a FITS image, bottom row first, header of any length
const norhRaw = readFileSync(await download("https://solar.nro.nao.ac.jp/norh/images/daily/2015/12/ifa151218_024433", "norh-17ghz.fits"));
let hdr = 0;
while (!/^END\s*$/m.test(norhRaw.toString("latin1", 0, hdr).match(/.{80}/g)?.map((c) => c.trimEnd()).join("\n") ?? "")) hdr += 2880;
const norhImg = { v: new Float32Array(512 * 512), w: 512, h: 512 };
for (let i = 0; i < 512 * 512; i++) norhImg.v[(511 - Math.floor(i / 512)) * 512 + (i % 512)] = norhRaw.readFloatBE(hdr + 4 * i);
const norh = align(norhImg, 5000, DISC);
// keep the radio Sun only: blank the noisy field beyond 1.12 disc radii
for (let i = 0; i < norh.v.length; i++) {
  const r = Math.hypot((i % N) - DISC.cx, Math.floor(i / N) - DISC.cy) / DISC.r;
  norh.v[i] = r > 1.12 ? 0 : Math.max(norh.v[i], 0);
}

const alma = align(await lumImage(await download("https://cdn.eso.org/images/large/eso1703c.jpg", "alma-1.25mm.jpg")), 30, DISC);

const SDO = "SDO, 18 Dec 2015";
const BANDS = [
  { id: "norh", name: "Radio 17 GHz", wave: "1.76 cm", what: "upper chromosphere; active regions and filaments", source: "Nobeyama Radioheliograph", region: "Radio", img: norh, stretch: "lin", lo: 0.6 },
  { id: "alma", name: "ALMA 1.25 mm", wave: "1.25 mm", what: "chromosphere temperature", source: "ALMA (ESO), Dec 2015", region: "Microwave", img: alma, stretch: "lin" },
  { id: "hmi", name: "Visible 617 nm", wave: "617 nm", what: "photosphere: sunspots, limb darkening", source: `HMI continuum, ${SDO}`, region: "Visible", img: hmi, stretch: "lin", lo: 0.55 },
  // AIA 4500 left out: Helioviewer's image of it is clipped flat across most of the disc
  { id: "a1700", name: "UV 1700 Å", wave: "170 nm", what: "top of the photosphere", source: `AIA 1700, ${SDO}`, region: "UV", img: await helio("SDO,AIA,1700", "aia1700"), stretch: "lin" },
  { id: "a1600", name: "UV 1600 Å", wave: "160 nm", what: "upper photosphere, transition region", source: `AIA 1600, ${SDO}`, region: "UV", img: await helio("SDO,AIA,1600", "aia1600"), stretch: "lin" },
  { id: "a335", name: "EUV 335 Å", wave: "33.5 nm", what: "active-region corona, 2.5 million °C", source: `AIA 335, ${SDO}`, region: "EUV", img: await helio("SDO,AIA,335", "aia335"), stretch: "lin" },
  { id: "a304", name: "EUV 304 Å", wave: "30.4 nm", what: "chromosphere, 50,000 °C", source: `AIA 304, ${SDO}`, region: "EUV", img: await helio("SDO,AIA,304", "aia304"), stretch: "lin" },
  { id: "a211", name: "EUV 211 Å", wave: "21.1 nm", what: "active-region corona, 2 million °C", source: `AIA 211, ${SDO}`, region: "EUV", img: await helio("SDO,AIA,211", "aia211"), stretch: "lin" },
  { id: "a193", name: "EUV 193 Å", wave: "19.3 nm", what: "corona 1.5 million °C, coronal holes", source: `AIA 193, ${SDO}`, region: "EUV", img: await helio("SDO,AIA,193", "aia193"), stretch: "lin" },
  { id: "a171", name: "EUV 171 Å", wave: "17.1 nm", what: "quiet corona 0.6 million °C, loops", source: `AIA 171, ${SDO}`, region: "EUV", img: await helio("SDO,AIA,171", "aia171"), stretch: "lin" },
  { id: "a131", name: "EUV 131 Å", wave: "13.1 nm", what: "flaring plasma, 10 million °C", source: `AIA 131, ${SDO}`, region: "EUV", img: await helio("SDO,AIA,131", "aia131"), stretch: "lin" },
  { id: "a094", name: "EUV 94 Å", wave: "9.4 nm", what: "hot corona, 6 million °C", source: `AIA 94, ${SDO}`, region: "EUV", img: await helio("SDO,AIA,94", "aia094"), stretch: "lin" },
];
for (const b of BANDS) {
  b.grey = normalise(b.img.v, b.stretch, b.lo ?? 0.01);
  await sharp(Buffer.from(b.grey), { raw: { width: N, height: N, channels: 1 } }).resize(256, 256).png().toFile(join(CACHE, `${b.id}-preview.png`));
  console.log(`  ✓ ${b.id}`);
}
const packs = await writePacks(OUT, N, N, BANDS, {
  target: "sun", date: DATE, start: { c: BANDS.findIndex((b) => b.id === "a1700"), s: 1.5 },
  frame: "Solar north up, 2.5″ per pixel",
});
console.log(`Wrote ${packs.length} packs for ${BANDS.length} Sun bands to ${OUT}`);
