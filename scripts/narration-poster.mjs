// The YouTube thumbnail of each short: its scene's `poster` shot (a camera and highlights,
// src/narration-scenes/<take>.js) stilled at 1080×1920 without captions, from the dev server.
//   node scripts/narration-poster.mjs short-01-hook [take …]
//   node scripts/narration-poster.mjs --wide short-02-up-the-line   # 1920×1080, the scene's posterWide
// Output: video/thumbnails/<take>.jpg, or <take>-wide.jpg (what scripts/youtube-publish.py uploads:
// the wide one for a video over 3:00, which YouTube doesn't count as a Short). Needs the dev
// server (BASE, default http://localhost:5184) and Google Chrome (CHROME).
import fs from "node:fs";
import path from "node:path";
import { CLOCK_SHIM } from "./narration-clock.mjs";
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE || "http://localhost:5184";
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "video/thumbnails";
fs.mkdirSync(OUT, { recursive: true });
// WebGL as the renderer has it (the fractal background, the live stars and particles): on the GPU,
// or Chrome's software GL where there's none
const b = await puppeteer.launch({ executablePath: CHROME, args: ["--no-sandbox", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"] });
const WIDE = process.argv.includes("--wide");
for (const take of process.argv.slice(2).filter(a => !a.startsWith("--"))) {
  const p = await b.newPage();
  // wide: a window narrower than the desktop layout, so the map keeps its phone look (no axis
  // frames or hints, the chart to the edges), scaled up to 1920×1080
  await p.setViewport(WIDE ? { width: 720, height: 405, deviceScaleFactor: 8 / 3 } : { width: 540, height: 960, deviceScaleFactor: 2 });
  // the renderer's clock: the shot is the frame a render would draw at that t (a real-time page on a
  // slow machine piles up the dots' trails, 2026-11-01)
  await p.evaluateOnNewDocument(CLOCK_SHIM);
  await p.goto(`${BASE}/?narrate=${take}&render=1&captions=0&stage=none&poster=${WIDE ? "wide" : 1}`, { waitUntil: "load", timeout: 180000 });
  await p.waitForFunction("window.__narr", { timeout: 60000 });
  const scene = await p.evaluate("window.__narrPoster");
  const at = scene?.at ?? 5;
  await p.evaluate(`window.__narr.renderAt(${at}); window.__narr.settle(${at})`);
  for (let i = 0; i < 40 && await p.evaluate("window.__narr.pending()"); i++) await new Promise(r => setTimeout(r, 150));
  await new Promise(r => setTimeout(r, 1500));
  // play the last 2 s up to the shot on the stopped clock, at 30 fps, as a render reaches it
  const tw = Math.max(0, at - 2);
  await p.evaluate(`window.__narr.renderAt(${tw}); window.__narr.settle(${tw})`);
  await new Promise(r => setTimeout(r, 1500));
  await p.evaluate("window.__vclock.freeze()");
  for (let t = tw; t < at - 1e-6; t += 1 / 30) await p.evaluate(`window.__narr.renderAt(${t}); window.__vclock.step(${1000 / 30})`);
  await p.evaluate(`window.__narr.renderAt(${at}); window.__vclock.step(${1000 / 30})`);
  const missing = await p.evaluate("window.__narrMissing");
  if (missing?.length) console.warn(`${take}: not found:`, missing.join(", "));
  const file = path.join(OUT, `${take}${WIDE ? "-wide" : ""}.jpg`);
  await p.screenshot({ path: file, type: "jpeg", quality: 92 });
  console.log(file);
  await p.close();
}
await b.close();
