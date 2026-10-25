// =============================================================
// build-earth-spectrum.mjs — Earth band by band, for tools/sky-spectrum.html (Earth)
// =============================================================
// Run:  npm run build:earth-spectrum              (uses cached downloads)
//       npm run build:earth-spectrum -- --refresh
//
// One day (DATE) of global daily maps from NASA GIBS (WMS, plate carrée,
// longitude −180…180 left to right, north up), each reduced to a single
// brightness channel and normalised from its own histogram:
//   - MODIS Terra corrected reflectance: the three colour composites hold
//     bands 1, 2, 3, 4, 6 and 7 in their channels (645, 858, 469, 555 nm,
//     1.64 and 2.13 µm), so each band is read straight out of one channel;
//   - MODIS 11 µm brightness temperature and the OMI UV aerosol index are
//     drawn with colour palettes: GIBS publishes each palette's colour →
//     value table, so the colours are turned back into values;
//   - VIIRS city lights (2012 composite; its dark-blue landscape is removed
//     by keeping only how much redder than blue each pixel is) and the GPM GMI
//     microwave composite (89–166 GHz, read as its brightness).
// Gaps (between orbits, polar night, swath edges) stay black.
// =============================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";
import { normalise, writePacks } from "./sky/spectrum-pack.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = join(ROOT, "scripts/sky/.cache/earth");
const OUT = join(ROOT, "tools/earth-spectrum");
const REFRESH = process.argv.includes("--refresh");
const DATE = "2024-06-15";
const W = 2048, H = 1024;
mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT, { recursive: true });

async function download(url, file) {
  const path = join(CACHE, file);
  if (existsSync(path) && !REFRESH) return path;
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5 * 60_000), headers: { "user-agent": "triangle-of-everything build-earth-spectrum" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeFileSync(path, Buffer.from(await res.arrayBuffer()));
      return path;
    } catch (err) {
      if (attempt >= 4) throw new Error(`${file}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
    }
  }
}
const gibs = (layer, time = DATE) => download(
  "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?" + new URLSearchParams({
    SERVICE: "WMS", REQUEST: "GetMap", VERSION: "1.3.0", LAYERS: layer, CRS: "EPSG:4326",
    BBOX: "-90,-180,90,180", WIDTH: W, HEIGHT: H, FORMAT: "image/png", ...(time ? { TIME: time } : {}),
  }), `${layer}-${time ?? "static"}.png`);

async function rgba(path) {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== W || info.height !== H) throw new Error(`${path}: ${info.width}×${info.height}`);
  return data;
}
// one channel of a composite; fully transparent or black pixels are gaps
async function channel(path, c) {
  const d = await rgba(path), v = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = d[4 * i], g = d[4 * i + 1], b = d[4 * i + 2], a = d[4 * i + 3];
    v[i] = a === 0 || r + g + b === 0 ? NaN : d[4 * i + c];
  }
  return v;
}
async function luminance(path) {
  const d = await rgba(path), v = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const a = d[4 * i + 3], r = d[4 * i], g = d[4 * i + 1], b = d[4 * i + 2];
    v[i] = a === 0 || r + g + b === 0 ? NaN : 0.299 * r + 0.587 * g + 0.114 * b;
  }
  return v;
}
// palette image → values, through GIBS's published colour → value table
async function unpalette(path, colormapUrl, cacheName) {
  const xml = readFileSync(await download(colormapUrl, cacheName), "utf8");
  const table = new Map();
  for (const m of xml.matchAll(/<ColorMapEntry rgb="(\d+),(\d+),(\d+)"[^>]*?(?:nodata="true"[^>]*)?\/>/g)) {
    const entry = m[0];
    if (/nodata="true"/.test(entry)) continue;
    const val = entry.match(/ value="[\[(]?(-?[\d.]+)(?:,(-?[\d.]+|INF))?/);
    if (!val) continue;
    const lo = +val[1], hi = val[2] && val[2] !== "INF" ? +val[2] : lo;
    table.set((+m[1] << 16) | (+m[2] << 8) | +m[3], (lo + hi) / 2);
  }
  const d = await rgba(path), v = new Float32Array(W * H).fill(NaN);
  for (let i = 0; i < W * H; i++) {
    if (d[4 * i + 3] === 0) continue;
    const key = (d[4 * i] << 16) | (d[4 * i + 1] << 8) | d[4 * i + 2];
    const val = table.get(key);
    if (val !== undefined) v[i] = val;
  }
  console.log(`  palette ${cacheName}: ${table.size} colours`);
  return v;
}

const TRUE = await gibs("MODIS_Terra_CorrectedReflectance_TrueColor"); // R b1 645, G b4 555, B b3 469
const B721 = await gibs("MODIS_Terra_CorrectedReflectance_Bands721"); // R b7 2.13 µm, G b2 858, B b1
const B367 = await gibs("MODIS_Terra_CorrectedReflectance_Bands367"); // R b3, G b6 1.64 µm, B b7
const T31 = await gibs("MODIS_Terra_Brightness_Temp_Band31_Day");
const GMI = await gibs("GMI_Brightness_Temp_Asc");
const UVAI = await gibs("OMI_UV_Aerosol_Index");
const LIGHTS = await gibs("VIIRS_CityLights_2012", null);
// lights are yellow-white, the landscape behind them blue: keep red minus blue
async function lightsOnly(path) {
  const d = await rgba(path), v = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) v[i] = Math.max(0, d[4 * i] - d[4 * i + 2]);
  return v;
}
const CM = "https://gibs.earthdata.nasa.gov/colormaps/v1.3";

const MODIS = "MODIS Terra corrected reflectance, " + DATE;
const BANDS = [
  { id: "gmi", name: "Microwave 89–166 GHz", wave: "2–3 mm", what: "rain, ice clouds, sea ice (GMI colour composite, read as brightness)", source: `GPM GMI, ${DATE}`, region: "Microwave", vals: await luminance(GMI), stretch: "lin" },
  { id: "t11", name: "Thermal 11 µm", wave: "11 µm", what: "heat: warm ground bright, cold cloud tops dark", source: `MODIS Terra band 31, ${DATE}`, region: "Thermal IR", vals: await unpalette(T31, `${CM}/MODIS_Brightness_Temp_Band31.xml`, "t31-colormap.xml"), stretch: "lin" },
  { id: "b7", name: "SWIR 2.13 µm", wave: "2.13 µm", what: "dry land bright, water and ice dark", source: MODIS, region: "Near-IR", vals: await channel(B721, 0), stretch: "lin" },
  { id: "b6", name: "SWIR 1.64 µm", wave: "1.64 µm", what: "snow and ice dark, water clouds bright", source: MODIS, region: "Near-IR", vals: await channel(B367, 1), stretch: "lin" },
  { id: "b2", name: "Near-IR 858 nm", wave: "858 nm", what: "plants bright, water black", source: MODIS, region: "Near-IR", vals: await channel(B721, 1), stretch: "lin" },
  { id: "lights", name: "Night lights", wave: "500–900 nm", what: "cities, fires and gas flares at night (2012 composite)", source: "VIIRS city lights", region: "Visible", vals: await lightsOnly(LIGHTS), stretch: "lin", hi: 0.9995 },
  { id: "b1", name: "Red 645 nm", wave: "645 nm", what: "red light", source: MODIS, region: "Visible", vals: await channel(TRUE, 0), stretch: "lin" },
  { id: "b4", name: "Green 555 nm", wave: "555 nm", what: "green light", source: MODIS, region: "Visible", vals: await channel(TRUE, 1), stretch: "lin" },
  { id: "b3", name: "Blue 469 nm", wave: "469 nm", what: "blue light, scattered by air", source: MODIS, region: "Visible", vals: await channel(TRUE, 2), stretch: "lin" },
  { id: "uvai", name: "UV aerosol index", wave: "354–388 nm", what: "smoke and dust absorbing ultraviolet", source: `OMI, ${DATE}`, region: "UV", vals: await unpalette(UVAI, `${CM}/OMI_UV_Aerosol_Index.xml`, "uvai-colormap.xml"), stretch: "lin" },
];
for (const b of BANDS) {
  b.grey = normalise(b.vals, b.stretch, 0.01, b.hi ?? 0.998);
  await sharp(Buffer.from(b.grey), { raw: { width: W, height: H, channels: 1 } }).resize(512, 256).png().toFile(join(CACHE, `${b.id}-preview.png`));
  console.log(`  ✓ ${b.id}`);
}
const packs = await writePacks(OUT, W, H, BANDS, {
  target: "earth", date: DATE, start: { c: BANDS.findIndex((b) => b.id === "b4"), s: 1 },
  frame: "Longitude −180° to 180°, north up",
});
console.log(`Wrote ${packs.length} packs for ${BANDS.length} Earth bands to ${OUT}`);
