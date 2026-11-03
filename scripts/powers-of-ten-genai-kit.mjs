#!/usr/bin/env node
// The image-generation kit for the stretch from the ladybug's dew drop to the first
// real photograph (video/powers-of-ten/genai-kit/, read its README.md): levels 3× apart,
// each a 3×3 grid of tiles centred on the zoom's centre, north up, the middle tile being
// the whole level below. For each tile, the zoom's current drawing of it (no roll,
// names, fly-bys or photos) with a 12.5% overlap all round; for the two largest levels
// the real NAIP photo of it too; level 0 is the photo itself.
//   node scripts/powers-of-ten-genai-kit.mjs [--base http://localhost:5173] [--out dir]
// Needs a server for the repo (npm run dev) and Playwright (PLAYWRIGHT_PATH for a
// global install), and Python 3 with Pillow for the photo crops.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const arg = (name, def) => { const i = process.argv.indexOf(`--${name}`); return i < 0 ? def : process.argv[i + 1]; };
const base = arg("base", "http://localhost:5173"), out = arg("out", "video/powers-of-ten/genai-kit");
// level k is 40 m / 3^k across (level 0: the 40 m photo, s+1.60); its tiles are a third of that
const LEVELS = Array.from({ length: 10 }, (_, k) => ({ k, width: 10 ** 1.6 / 3 ** k }));
const OVER = 0.125, TILE_PX = 1024, CROP = 1 + 2 * OVER; // a tile with its overlap: 1.25 tiles, 1,280 px
const FRAME = 3 + 2 * OVER;                             // the frame rendered: 3.25 tiles
const VIEW = (FRAME * TILE_PX) / 2;                     // CSS px, at device scale 2
const TILES = [["NW", -1, -1], ["N", 0, -1], ["NE", 1, -1], ["W", -1, 0], ["C", 0, 0], ["E", 1, 0], ["SW", -1, 1], ["S", 0, 1], ["SE", 1, 1]];
const name = (k) => `L${k}-${fmt(LEVELS[k].width)}`;
function fmt(m) { return m >= 1 ? `${+m.toPrecision(3)}m` : m >= 0.01 ? `${+(m * 100).toPrecision(3)}cm` : `${+(m * 1000).toPrecision(3)}mm`; }

const pwPath = process.env.PLAYWRIGHT_PATH || "playwright";
const pw = (await import(pwPath)).default ?? await import(pwPath);
const browser = await pw.chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
async function shoot(labels) {
  const page = await browser.newPage({ viewport: { width: VIEW, height: VIEW }, deviceScaleFactor: 2 });
  page.on("pageerror", (e) => console.error("PAGE ERROR:", e.message));
  await page.goto(`${base}/tools/powers-of-ten.html?ui=0&grid=0&labels=${labels ? 1 : 0}&crossings=0&photos=0&roll=0&s=0`, { waitUntil: "load" });
  await page.waitForFunction(() => window.zoom);
  await page.waitForTimeout(4000);
  return page;
}
const page = await shoot(false), named = await shoot(true);
const manifest = { levels: [] };
for (const { k, width } of LEVELS) {
  const dir = join(out, name(k)), T = width / 3, s = Math.log10(FRAME * T);
  mkdirSync(dir, { recursive: true });
  const level = { level: k, dir: name(k), width_m: +width.toPrecision(4), tile_m: +T.toPrecision(4), frame_s: +s.toFixed(4), tiles: [] };
  if (k > 0) {
    for (const p of [page, named]) await p.evaluate(async (s) => { window.zoom.set(s); await window.zoom.frames(6); }, s);
    await page.waitForTimeout(800);
    // the whole level (without its overlap ring) with and without the names, for context
    const inner = { x: OVER * TILE_PX / 2, y: OVER * TILE_PX / 2, width: 3 * TILE_PX / 2, height: 3 * TILE_PX / 2 };
    await page.screenshot({ path: join(dir, "level-drawing.png"), clip: inner });
    await named.screenshot({ path: join(dir, "level-names.jpg"), clip: inner, type: "jpeg", quality: 85 });
    for (const [t, i, j] of TILES) {
      const clip = { x: (1 + i) * TILE_PX / 2, y: (1 + j) * TILE_PX / 2, width: CROP * TILE_PX / 2, height: CROP * TILE_PX / 2 };
      await page.screenshot({ path: join(dir, `${t}-drawing.png`), clip });
    }
  }
  for (const [t, i, j] of TILES) level.tiles.push({ tile: t, centre_m: { east: +(i * T).toPrecision(4), north: +(-j * T).toPrecision(4) }, generate: t !== "C" });
  manifest.levels.push(level);
  console.log(name(k), `tiles ${fmt(T)}, frame 10^${s.toFixed(3)} m`);
}
await browser.close();
// the photo crops: level 0 from the 71 m photo (it has room for the overlap), levels 1 and 2 from the 40 m one
execFileSync("python3", ["-I", "-c", `
import json, sys
from PIL import Image
out, levels = sys.argv[1], json.loads(sys.argv[2])
over, px = ${OVER}, ${TILE_PX}
photos = {1.85: Image.open("video/powers-of-ten/photos/s+1.85.jpg"), 1.60: Image.open("video/powers-of-ten/photos/s+1.60.jpg")}
for L in levels:
    k, T = L["level"], L["tile_m"]
    if k > 2: continue
    s = 1.85 if k == 0 else 1.60
    im = photos[s]; ppm = im.width / 10 ** s
    for t in L["tiles"]:
        cx = im.width / 2 + t["centre_m"]["east"] * ppm; cy = im.height / 2 - t["centre_m"]["north"] * ppm; h = (0.5 + over) * T * ppm
        crop = im.crop((round(cx - h), round(cy - h), round(cx + h), round(cy + h))).resize((round(px * (1 + 2 * over)),) * 2, Image.LANCZOS)
        crop.save(f"{out}/{L['dir']}/{t['tile']}-photo.jpg", quality=90)
    if k == 0:
        h = 1.5 * T * ppm
        im.crop((round(im.width / 2 - h), round(im.height / 2 - h), round(im.width / 2 + h), round(im.height / 2 + h))).resize((3 * px,) * 2, Image.LANCZOS).save(f"{out}/{L['dir']}/level-photo.jpg", quality=90)
`, out, JSON.stringify(manifest.levels)], { stdio: "inherit" });
writeFileSync(join(out, "manifest.json"), JSON.stringify({
  centre: { lat: 36.5816453, lon: -118.751443, what: "the zoom's centre: the hydrogen atom on the ladybug, on the General Sherman tree (OpenStreetMap node 313753662)" },
  orientation: "north up, looking straight down", overlap: OVER, tile_px: TILE_PX, tile_with_overlap_px: Math.round(TILE_PX * CROP),
  ...manifest,
}, null, 1));
