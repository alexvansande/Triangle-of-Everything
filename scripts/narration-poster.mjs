// The YouTube thumbnail of each short: its scene's `poster` shot (a camera and highlights,
// src/narration-scenes/<take>.js) stilled at 1080×1920 without captions, from the dev server.
//   node scripts/narration-poster.mjs short-01-hook [take …]
// Output: video/thumbnails/<take>.jpg (what scripts/youtube-publish.py uploads). Needs the dev
// server (BASE, default http://localhost:5184) and Google Chrome (CHROME).
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE || "http://localhost:5184";
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "video/thumbnails";
fs.mkdirSync(OUT, { recursive: true });
const b = await puppeteer.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
for (const take of process.argv.slice(2)) {
  const p = await b.newPage();
  await p.setViewport({ width: 540, height: 960, deviceScaleFactor: 2 });
  await p.goto(`${BASE}/?narrate=${take}&render=1&captions=0&stage=none&poster=1`, { waitUntil: "load", timeout: 180000 });
  await p.waitForFunction("window.__narr", { timeout: 60000 });
  const scene = await p.evaluate("window.__narrPoster");
  const at = scene?.at ?? 5;
  await p.evaluate(`window.__narr.renderAt(${at}); window.__narr.settle(${at})`);
  for (let i = 0; i < 40 && await p.evaluate("window.__narr.pending()"); i++) await new Promise(r => setTimeout(r, 150));
  await new Promise(r => setTimeout(r, 1500));
  await p.evaluate(`window.__narr.renderAt(${at})`);
  const missing = await p.evaluate("window.__narrMissing");
  if (missing?.length) console.warn(`${take}: not found:`, missing.join(", "));
  const file = path.join(OUT, `${take}.jpg`);
  await p.screenshot({ path: file, type: "jpeg", quality: 92 });
  console.log(file);
  await p.close();
}
await b.close();
