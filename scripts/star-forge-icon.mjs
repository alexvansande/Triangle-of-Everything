// A star's picture from the Star Forge (src/star-forge.js), as a PNG for its icon (content/icons/src/<slug>.png):
// for a star the videos draw live but the chart has no picture of yet (R136a1, the author, 2026-11-07).
//   npm run dev    # keep running
//   node scripts/star-forge-icon.mjs r136a1 [size]
import puppeteer from "puppeteer-core";
import fs from "node:fs";
const [slug, sizeArg] = process.argv.slice(2); const size = +sizeArg || 1024;
if (!slug) { console.error("usage: node scripts/star-forge-icon.mjs <slug> [size]"); process.exit(1); }
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/opt/pw-browsers/chromium", args: ["--no-sandbox", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"] });
const p = await b.newPage();
await p.goto(`${process.env.BASE || "http://localhost:5173"}/tools/star-forge.html`, { waitUntil: "load", timeout: 120000 });
await p.waitForFunction("window.__starForge", { timeout: 60000 });
const data = await p.evaluate(async (slug, size) => {
  const F = window.__starForge, s = F.STARS.find(x => x.slug === slug);
  if (!s) throw new Error(`no star ${slug} in the forge`);
  const forge = F.createStarForge(), cv = document.createElement("canvas"); cv.width = cv.height = size;
  forge.render(s, 0, size, { target: cv, alpha: true });   // a transparent background, for an icon
  return cv.toDataURL("image/png");
}, slug, size);
fs.mkdirSync("content/icons/src", { recursive: true });
fs.writeFileSync(`content/icons/src/${slug}.png`, Buffer.from(data.split(",")[1], "base64"));
console.log(`content/icons/src/${slug}.png (${size} px)`);
await b.close();
