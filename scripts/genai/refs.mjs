#!/usr/bin/env node
// Style references for the image generator: the Hopf atoms and small molecules
// (public/hopf/hopf-core.js, in their chart looks), rendered at 1024 px on black
// into scripts/genai/refs/<id>.png. Needs the dev server (npm run dev) and
// Playwright (PLAYWRIGHT_PATH for a global install); PORT for another port.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
const HERE = path.dirname(fileURLToPath(import.meta.url)), OUT = path.join(HERE, "refs");
const IDS = ["hydrogen", "carbon", "nitrogen", "oxygen", "phosphorus", "sulfur", "iron", "water", "adenine-a", "fullerene-c60"];
const pwPath = process.env.PLAYWRIGHT_PATH || "playwright";
const pw = (await import(pwPath)).default ?? await import(pwPath);
const browser = await pw.chromium.launch({ args: process.platform === "darwin" ? ["--use-angle=metal", "--enable-gpu"] : ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
page.on("pageerror", e => console.error("PAGE ERROR:", e.message));
await page.goto(`http://localhost:${process.env.PORT || 5173}/hopf.html?focus=none`, { waitUntil: "networkidle" });
const shots = await page.evaluate(async ids => {
  const { PARTICLES, Renderer, HopfView } = await import("/hopf/hopf-core.js");
  const renderer = new Renderer(), px = 1024, out = {};
  renderer.resize(px);
  const opts = { drift: true, flow: true, width: 1, bloom: 0.9, exposure: 1.1, core: 0.8 };
  for (const id of ids) {
    const view = new HopfView(renderer, null, PARTICLES.find(p => p.id === id));
    view.yaw = 0.6;
    const c = document.createElement("canvas");
    c.width = c.height = px;
    for (let t = 0; t <= 3; t += 1 / 30) view.update(t, opts);
    renderer.render(view, opts, [c.getContext("2d"), 0, 0, px, px]);
    out[id] = c.toDataURL("image/png");
  }
  return out;
}, IDS);
await browser.close();
fs.mkdirSync(OUT, { recursive: true });
for (const [id, url] of Object.entries(shots)) {
  await sharp(Buffer.from(url.split(",")[1], "base64")).png().toFile(path.join(OUT, `${id}.png`));
  console.log(`  refs/${id}.png`);
}
