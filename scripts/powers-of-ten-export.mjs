#!/usr/bin/env node
// Rough frames of the powers-of-ten zoom (tools/powers-of-ten.html), square,
// with no grid, names or controls: the inputs for the image pass.
//   node scripts/powers-of-ten-export.mjs [--px 2048] [--from -9] [--to 7.5] [--step 0.5] [--names] [--jpg] [--out dir]
// Defaults: the image stretch (DNA → Earth) every half decade, 2048 px, into
// video/powers-of-ten/rough/ as s-03.5.png etc. Each frame is 10^s metres across
// and holds the next one down in its middle ~third.
// Needs the dev server (npm run dev) and Playwright (PLAYWRIGHT_PATH for a global install).
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const arg = (name, def) => { const i = process.argv.indexOf(`--${name}`); return i < 0 ? def : process.argv[i + 1]; };
const px = +arg("px", 2048), from = +arg("from", -9), to = +arg("to", 7.5), step = +arg("step", 0.5);
const names = process.argv.includes("--names"), jpg = process.argv.includes("--jpg");
const out = arg("out", "video/powers-of-ten/rough");
mkdirSync(out, { recursive: true });

const pwPath = process.env.PLAYWRIGHT_PATH || "playwright";
const pw = (await import(pwPath)).default ?? await import(pwPath);
const browser = await pw.chromium.launch({ args: ["--use-angle=metal", "--enable-gpu"] });
const page = await browser.newPage({ viewport: { width: px / 2, height: px / 2 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.error("PAGE ERROR:", e.message));
await page.goto(`http://localhost:5173/tools/powers-of-ten.html?ui=0&grid=0&labels=${names ? 1 : 0}&s=${from}`, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.zoom);
await page.waitForTimeout(2500); // pictures, the Earth maps, the star catalogue

const tag = (s) => `s${s < 0 ? "-" : "+"}${Math.abs(s).toFixed(1).padStart(4, "0")}`;
for (let s = from; s <= to + 1e-9; s += step) {
  await page.evaluate(async (s) => { window.zoom.set(s); await window.zoom.frames(4); }, s);
  await page.waitForTimeout(150);
  const file = join(out, `${tag(s)}.${jpg ? "jpg" : "png"}`);
  await page.screenshot({ path: file, ...(jpg ? { type: "jpeg", quality: 90 } : {}) });
  console.log(file);
}
await browser.close();
