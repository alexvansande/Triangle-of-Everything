#!/usr/bin/env node
// Still fallbacks for the chart's live Hopf particle icons: renders each
// particle in public/hopf/hopf-core.js (CHART_ICONS) to a 512px transparent
// webp in content/icons/, then regenerates the resolution tiers.
// Needs the dev server (npm run dev) and Playwright (PLAYWRIGHT_PATH for a global install).
import sharp from "sharp";
import { generateIconResolutions } from "./generate-icon-resolutions.mjs";
const pwPath = process.env.PLAYWRIGHT_PATH || "playwright";
const pw = (await import(pwPath)).default ?? await import(pwPath);

const browser = await pw.chromium.launch({ args: ["--use-angle=metal", "--enable-gpu"] });
const page = await browser.newPage();
page.on("pageerror", e => console.error("PAGE ERROR:", e.message));
await page.goto("http://localhost:5173/hopf.html?focus=none", { waitUntil: "networkidle" });
const shots = await page.evaluate(async () => {
  const { PARTICLES, Renderer, HopfView, CHART_ICONS } = await import("/hopf/hopf-core.js");
  const renderer = new Renderer({ alpha: true });
  const px = 512;
  renderer.resize(px);
  const out = {};
  const opts = { drift: true, flow: true, width: 1, bloom: 0.9, exposure: 1.1, core: 0.8 };
  for (const { id, file, res } of Object.values(CHART_ICONS)) {
    const view = new HopfView(renderer, null, PARTICLES.find(p => p.id === id));
    if (res !== undefined) view.res = res;
    view.yaw = 0.6;
    const c = document.createElement("canvas");
    c.width = c.height = px;
    const ctx = c.getContext("2d");
    // a few seconds in, so the drift and the nucleons' motion have settled into a typical pose
    for (let t = 0; t <= 3; t += 1 / 30) view.update(t, opts);
    renderer.render(view, opts, [ctx, 0, 0, px, px]);
    out[file] = c.toDataURL("image/png");
  }
  return out;
});
await browser.close();
for (const [file, url] of Object.entries(shots)) {
  await sharp(Buffer.from(url.split(",")[1], "base64")).webp({ quality: 90, alphaQuality: 100 }).toFile(`content/icons/${file}.webp`);
  console.log(`  ${file}.webp`);
}
await generateIconResolutions();
