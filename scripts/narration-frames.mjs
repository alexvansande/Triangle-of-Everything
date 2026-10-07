// Check a take without rendering the video: list the scene cues whose phrase
// isn't in the take, and save stills at chosen times.
//
//   npm run dev    # keep running
//   node scripts/narration-frames.mjs short-02-density 4 30 61.5 --out /tmp/frames
//
// Each still is <out>/<take>-<t>.png at 540×960 (the 9:16 stage).
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const args = process.argv.slice(2);
const oi = args.indexOf("--out");
const out = oi >= 0 ? args.splice(oi, 2)[1] : "narration-frames";
const [take, ...times] = args;
if (!take) { console.error("usage: node scripts/narration-frames.mjs <take> [t …] [--out dir]"); process.exit(1); }
fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || "http://localhost:5173";
const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const b = await puppeteer.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
const p = await b.newPage();
await p.setViewport({ width: 540, height: 960 });
p.on("pageerror", e => console.log("page error:", e.message));
await p.goto(`${BASE}/?narrate=${take}&render=1`, { waitUntil: "networkidle2" });
await p.waitForFunction("window.__narr", { timeout: 60000 });
const missing = await p.evaluate("window.__narrMissing");
console.log(missing.length ? `${take}: phrases not found: ${JSON.stringify(missing)}` : `${take}: every cue found`);
for (const t of times) {
  await p.evaluate(`window.__narr.renderAt(${t}); window.__narr.settle(${t})`);
  for (let i = 0; i < 20 && await p.evaluate("window.__narr.pending()"); i++) await new Promise(r => setTimeout(r, 150));
  await new Promise(r => setTimeout(r, 1200));   // highlights finish easing in
  await p.evaluate(`window.__narr.renderAt(${t})`);
  await p.screenshot({ path: `${out}/${take}-${t}.png` });
}
await b.close();
