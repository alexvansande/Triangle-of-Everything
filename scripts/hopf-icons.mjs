#!/usr/bin/env node
// Still fallbacks for the chart's live Hopf particle icons: renders each
// particle in public/hopf/hopf-core.js (CHART_ICONS) to a 512px transparent
// webp in content/icons/, then regenerates the resolution tiers.
// Needs the dev server (npm run dev) and Playwright (PLAYWRIGHT_PATH for a global install).
// Pass icon files to render only those (node scripts/hopf-icons.mjs proton neutron);
// PORT for a dev server on another port. --sidebar also writes each one's sidebar
// picture, content/images/<file>.webp (624×390 on black, from a 1024px render).
import sharp from "sharp";
import { generateIconResolutions } from "./generate-icon-resolutions.mjs";
const pwPath = process.env.PLAYWRIGHT_PATH || "playwright";
const pw = (await import(pwPath)).default ?? await import(pwPath);

const sidebar = process.argv.includes("--sidebar");
const only = process.argv.slice(2).filter(a => !a.startsWith("--"));
const browser = await pw.chromium.launch({ args: process.platform === "darwin" ? ["--use-angle=metal", "--enable-gpu"] : ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
page.on("pageerror", e => console.error("PAGE ERROR:", e.message));
await page.goto(`http://localhost:${process.env.PORT || 5173}/hopf.html?focus=none`, { waitUntil: "networkidle" });
const shots = await page.evaluate(async ([only, sidebar]) => {
  const { PARTICLES, Renderer, HopfView, CHART_ICONS } = await import("/hopf/hopf-core.js");
  const renderer = new Renderer({ alpha: true });
  const px = sidebar ? 1024 : 512;
  renderer.resize(px);
  const out = {};
  const opts = { drift: true, flow: true, width: 1, bloom: 0.9, exposure: 1.1, core: 0.8 };
  for (const { id, file, res } of Object.values(CHART_ICONS)) {
    if (only.length && !only.includes(file)) continue;
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
}, [only, sidebar]);
await browser.close();
for (const [file, url] of Object.entries(shots)) {
  const png = Buffer.from(url.split(",")[1], "base64");
  await sharp(png).resize(512, 512).webp({ quality: 90, alphaQuality: 100 }).toFile(`content/icons/${file}.webp`);
  if (sidebar) await sharp(png).flatten({ background: "#000" }).resize(624, 390, { fit: "contain", background: "#000" })
    .webp({ quality: 88 }).toFile(`content/images/${file}.webp`);
  console.log(`  ${file}.webp${sidebar ? " (+ sidebar)" : ""}`);
}
await generateIconResolutions(only);
