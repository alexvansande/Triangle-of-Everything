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
// Microwave and radio from AMSU-A on NOAA-15 (23.8, 50.3, 57.3 and 89 GHz)
// and SMAP (1.41 GHz). Three stretches of the spectrum have no global map,
// so their bands are modelled and named so: 408 MHz from SMAP, the far-IR
// and 3–5 µm from the 11 µm heat map.
// Gaps between orbits are filled from the same layer on the nearest other
// day within three days either side (12–18 June), then anything still empty
// is filled in smoothly from around it. The polar night (no sunlight all day)
// stays black in the bands that are reflected sunlight.
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
    const val = entry.match(/ value="[\[(]?(-?[\d.]+|-INF)(?:,(-?[\d.]+|INF))?/);
    if (!val) continue;
    // open-ended classes ("[-INF,0.5)", "[40,INF)") take their finite end
    const lo = val[1] === "-INF" ? NaN : +val[1], hi = val[2] && val[2] !== "INF" ? +val[2] : lo;
    table.set((+m[1] << 16) | (+m[2] << 8) | +m[3], Number.isNaN(lo) ? hi : (lo + hi) / 2);
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

// one band from a daily layer: the main date first, then each gap from the
// nearest other day that has it
const OFFSETS = [0, -1, 1, -2, 2, -3, 3];
const dayOf = (off) => new Date(Date.parse(DATE) + off * 864e5).toISOString().slice(0, 10);
// swath edges are dark but not empty: shave EDGE pixels off every gap
const EDGE = 2;
function widenGaps(v) {
  const gap = v.map(Number.isNaN);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!gap[y * W + x]) continue;
    for (let dy = -EDGE; dy <= EDGE; dy++) for (let dx = -EDGE; dx <= EDGE; dx++) {
      const yy = y + dy;
      if (yy >= 0 && yy < H) v[yy * W + ((x + dx + W) % W)] = NaN;
    }
  }
  return v;
}
async function daily(layer, read) {
  let v = null;
  for (const off of OFFSETS) {
    const vals = widenGaps(await read(await gibs(layer, dayOf(off))));
    if (!v) { v = vals; continue; }
    for (let i = 0; i < v.length; i++) if (Number.isNaN(v[i])) v[i] = vals[i];
  }
  return v;
}
const gapShare = (v) => v.reduce((n, x) => n + Number.isNaN(x), 0) / v.length;

// no sunlight all day: noon Sun below the horizon, for every day used
// (declination at least 23.0° in mid-June, so south of −67°)
const POLAR_NIGHT_LAT = -67;
function polarNight(v) {
  for (let y = 0; y < H; y++) {
    if (90 - ((y + 0.5) / H) * 180 > POLAR_NIGHT_LAT) continue;
    for (let x = 0; x < W; x++) v[y * W + x] = 0;
  }
  return v;
}
// fill what is still empty from around it: average down a pyramid (ignoring
// empty pixels) until nothing is empty, then bring the coarse values back up
// into the holes only; longitude wraps
function inpaint(v, w = W, h = H) {
  if (!v.some(Number.isNaN) || w < 2 || h < 2) return v;
  const cw = w >> 1, ch = h >> 1, coarse = new Float32Array(cw * ch);
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    let sum = 0, n = 0;
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      const val = v[(2 * y + dy) * w + 2 * x + dx];
      if (!Number.isNaN(val)) { sum += val; n++; }
    }
    coarse[y * cw + x] = n ? sum / n : NaN;
  }
  inpaint(coarse, cw, ch);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!Number.isNaN(v[y * w + x])) continue;
    // bilinear from the coarse level, wrapping in longitude
    const fx = (x + 0.5) / 2 - 0.5, fy = Math.min(ch - 1, Math.max(0, (y + 0.5) / 2 - 0.5));
    const x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0, y1 = Math.min(ch - 1, y0 + 1);
    const at = (xx, yy) => coarse[yy * cw + ((xx % cw) + cw) % cw];
    v[y * w + x] = (at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx) * (1 - ty) + (at(x0, y1) * (1 - tx) + at(x0 + 1, y1) * tx) * ty;
  }
  return v;
}
// a daily band, gap-filled: reflected bands keep the polar night black
async function band(layer, read, reflected) {
  const v = await daily(layer, read), before = gapShare(await read(await gibs(layer, DATE)));
  const after = gapShare(v);
  if (reflected) polarNight(v);
  inpaint(v);
  console.log(`  ${layer}: ${(100 * before).toFixed(1)}% empty on ${DATE}, ${(100 * after).toFixed(1)}% after ±3 days, rest inpainted`);
  return v;
}
const TRUE = "MODIS_Terra_CorrectedReflectance_TrueColor"; // R b1 645, G b4 555, B b3 469
const B721 = "MODIS_Terra_CorrectedReflectance_Bands721"; // R b7 2.13 µm, G b2 858, B b1
const B367 = "MODIS_Terra_CorrectedReflectance_Bands367"; // R b3, G b6 1.64 µm, B b7
const T31 = "MODIS_Terra_Brightness_Temp_Band31_Day";
const GMI = "GMI_Brightness_Temp_Asc";
const UVAI = "OMI_UV_Aerosol_Index";
const LIGHTS = await gibs("VIIRS_CityLights_2012", null);
// lights are yellow-white, the landscape behind them blue: keep red minus blue
async function lightsOnly(path) {
  const d = await rgba(path), v = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) v[i] = Math.max(0, d[4 * i] - d[4 * i + 2]);
  return v;
}
const CM = "https://gibs.earthdata.nasa.gov/colormaps/v1.3";

const FILLED = ` (gaps from ${dayOf(-3)} to ${dayOf(3)})`;
const MODIS = `MODIS Terra corrected reflectance, ${DATE}${FILLED}`;
const t31Read = (path) => unpalette(path, `${CM}/MODIS_Brightness_Temp_Band31.xml`, "t31-colormap.xml");
const uvaiRead = (path) => unpalette(path, `${CM}/OMI_UV_Aerosol_Index.xml`, "uvai-colormap.xml");
const amsuRead = (path) => unpalette(path, `${CM}/AMSU_Brightness_Temp.xml`, "amsu-colormap.xml");
const smapRead = (path) => unpalette(path, `${CM}/SMAP_Brightness_Temp.xml`, "smap-colormap.xml");
const AMSU = (ch) => `AMSUA_NOAA15_Brightness_Temp_Channel_${ch}`;
const AMSU_SRC = `AMSU-A on NOAA-15, ${DATE}${FILLED}`;
// the bands with no data of their own, modelled from neighbours (labelled so)
const T11 = await band(T31, t31Read, false), SMAP = await band("SMAP_L3_Passive_Brightness_Temp_H", smapRead, false);
const BANDS = [
  { id: "radio", name: "Radio 408 MHz (modelled)", wave: "30–75 cm", what: "Earth's own radio glow, much like at 21 cm: modelled from the SMAP map", source: "model, from SMAP 1.41 GHz", region: "Radio", vals: SMAP, stretch: "lin" },
  { id: "smap", name: "Radio 1.41 GHz", wave: "21 cm", what: "warm dry land bright; oceans dark; wet soil and salt water darker", source: `SMAP, ${DATE}${FILLED}`, region: "Radio", vals: SMAP, stretch: "lin" },
  { id: "amsu1", name: "Microwave 23.8 GHz", wave: "1.26 cm", what: "water vapour (a weak water line): humid tropics bright over the dark ocean", source: AMSU_SRC, region: "Microwave", vals: await band(AMSU(1), amsuRead, false), stretch: "lin" },
  { id: "amsu3", name: "Microwave 50.3 GHz", wave: "6.0 mm", what: "the lower air and the ground together", source: AMSU_SRC, region: "Microwave", vals: await band(AMSU(3), amsuRead, false), stretch: "lin" },
  { id: "amsu9", name: "Microwave 57.3 GHz", wave: "5.2 mm", what: "oxygen glow from the lower stratosphere (~17 km): the air, not the ground", source: AMSU_SRC, region: "Microwave", vals: await band(AMSU(9), amsuRead, false), stretch: "lin" },
  { id: "amsu15", name: "Microwave 89 GHz", wave: "3.4 mm", what: "ground and clouds; ice in storm tops scatters dark", source: AMSU_SRC, region: "Microwave", vals: await band(AMSU(15), amsuRead, false), stretch: "lin" },
  { id: "gmi", name: "Microwave 89–166 GHz", wave: "1.8–3.4 mm", what: "rain, ice clouds, sea ice (GMI colour composite, read as brightness)", source: `GPM GMI, ${DATE}${FILLED}`, region: "Microwave", vals: await band(GMI, luminance, false), stretch: "lin" },
  { id: "fir", name: "Far-IR (modelled)", wave: "20 µm–1.5 mm", what: "Earth's heat glow beyond 20 µm, where the air itself absorbs and glows: modelled from the 11 µm map", source: "model, from MODIS 11 µm", region: "Far-IR", vals: T11, stretch: "lin" },
  { id: "t11", name: "Thermal 11 µm", wave: "11 µm", what: "heat: warm ground bright, cold cloud tops dark", source: `MODIS Terra band 31, ${DATE}${FILLED}`, region: "Thermal IR", vals: T11, stretch: "lin" },
  { id: "mir", name: "Mid-IR 3–5 µm (modelled)", wave: "3–5 µm", what: "heat glow, plus some reflected sunlight by day: modelled from the 11 µm map", source: "model, from MODIS 11 µm", region: "Mid-IR", vals: T11, stretch: "lin" },
  { id: "b7", name: "SWIR 2.13 µm", wave: "2.13 µm", what: "dry land bright, water and ice dark", source: MODIS, region: "Near-IR", vals: await band(B721, (p) => channel(p, 0), true), stretch: "lin" },
  { id: "b6", name: "SWIR 1.64 µm", wave: "1.64 µm", what: "snow and ice dark, water clouds bright", source: MODIS, region: "Near-IR", vals: await band(B367, (p) => channel(p, 1), true), stretch: "lin" },
  { id: "b2", name: "Near-IR 858 nm", wave: "858 nm", what: "plants bright, water black", source: MODIS, region: "Near-IR", vals: await band(B721, (p) => channel(p, 1), true), stretch: "lin" },
  { id: "lights", name: "Night lights", wave: "500–900 nm", what: "cities, fires and gas flares at night (2012 composite)", source: "VIIRS city lights", region: "Visible", vals: await lightsOnly(LIGHTS), stretch: "lin", hi: 0.9995 },
  { id: "b1", name: "Red 645 nm", wave: "645 nm", what: "red light", source: MODIS, region: "Visible", vals: await band(TRUE, (p) => channel(p, 0), true), stretch: "lin" },
  { id: "b4", name: "Green 555 nm", wave: "555 nm", what: "green light", source: MODIS, region: "Visible", vals: await band(TRUE, (p) => channel(p, 1), true), stretch: "lin" },
  { id: "b3", name: "Blue 469 nm", wave: "469 nm", what: "blue light, scattered by air", source: MODIS, region: "Visible", vals: await band(TRUE, (p) => channel(p, 2), true), stretch: "lin" },
  { id: "uvai", name: "UV aerosol index", wave: "354–388 nm", what: "smoke and dust absorbing ultraviolet", source: `OMI, ${DATE}${FILLED}`, region: "UV", vals: await band(UVAI, uvaiRead, true), stretch: "lin" },
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
