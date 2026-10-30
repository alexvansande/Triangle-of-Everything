#!/usr/bin/env node
// The chart's still Laniakea, drawn from the real galaxies by public/laniakea/laniakea-core.js
// with the look the author picked (THUMB, 2026-10-30): a 1024 px master on black in
// content/icons/src/, made transparent the way the chart's luminous pictures are
// (scripts/unscreen-art.mjs, content/icons/unscreened.json) for the 128 px live icon, then the
// resolution tiers. The videos draw it live instead (src/laniakea-icons.js).
//   node scripts/laniakea-icon.mjs      (needs the dev server: npm run dev; PORT for another port)
import sharp from "sharp";
import { generateIconResolutions } from "./generate-icon-resolutions.mjs";
import { convert } from "./unscreen-art.mjs";
import { iconCategories } from "./shadow-eligibility.mjs";
const pwPath = process.env.PLAYWRIGHT_PATH || "playwright";
const pw = (await import(pwPath)).default ?? await import(pwPath);

const FILE = "laniakea-galaxy-supercluster", PX = 1024;
const browser = await pw.chromium.launch();
const page = await browser.newPage();
page.on("pageerror", e => console.error("PAGE ERROR:", e.message));
await page.goto(`http://localhost:${process.env.PORT || 5173}/hopf.html?focus=none`, { waitUntil: "load" });
const url = await page.evaluate(async (px) => {
  const core = await import("/laniakea/laniakea-core.js");
  const data = await core.load();
  const c = document.createElement("canvas");
  c.width = c.height = px;
  core.render(c.getContext("2d"), px, core.THUMB, data, { black: true });
  return c.toDataURL("image/png");
}, PX);
await browser.close();
const png = Buffer.from(url.split(",")[1], "base64");
await sharp(png).toFile(`content/icons/src/${FILE}.png`);
const { slug, cat } = iconCategories()(FILE);
const live = await (await convert(png, slug, cat, 1024)).image.png().toBuffer();
await sharp(live).resize(128, 128).webp({ quality: 90, alphaQuality: 100 }).toFile(`content/icons/${FILE}.webp`);
console.log(`  content/icons/src/${FILE}.png, content/icons/${FILE}.webp`);
await generateIconResolutions([FILE]);
