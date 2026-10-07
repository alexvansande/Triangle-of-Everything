// Sound design for takes: reads each take's timeline (camera flights, new
// highlights, the classic → map fade) from the player on the dev server, then
// synthesizes the bed and mixes it under the voice (scripts/narration-sound.py).
//
//   npm run dev    # keep running
//   node scripts/narration-sound.mjs short-01-hook short-02-density …
//
// Writes public/narration/<take>/mix.m4a and "mix" in its words.json. Run it
// again after any change to the take's audio or its scene.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";

const takes = process.argv.slice(2);
if (!takes.length) { console.error("usage: node scripts/narration-sound.mjs <take>…"); process.exit(1); }
const BASE = process.env.BASE || "http://localhost:5173";
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox", "--mute-audio"] });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "narr-sound-"));
for (const take of takes) {
  const p = await b.newPage();
  await p.goto(`${BASE}/?narrate=${take}&render=1`, { waitUntil: "networkidle2" });
  await p.waitForFunction("window.__narr", { timeout: 60000 });
  const tl = await p.evaluate("window.__narr.timeline()");
  await p.close();
  const f = path.join(tmp, `${take}.json`);
  fs.writeFileSync(f, JSON.stringify(tl));
  console.log(take);
  execFileSync("python3", ["scripts/narration-sound.py", `public/narration/${take}`, f], { stdio: "inherit" });
}
await b.close();
fs.rmSync(tmp, { recursive: true, force: true });
