// Sound design for takes: resolves each scene's `sound` cues (voice effects,
// small effects, rare music) to times through the player on the dev server,
// then synthesizes them and mixes them with the voice (scripts/narration-sound.py).
//
//   npm run dev    # keep running
//   node scripts/narration-sound.mjs short-01-hook short-02-density …
//
// Writes public/narration/<take>/mix.m4a and "mix" in its words.json. Run it
// again after any change to the take's audio or its scene.
//
//   node scripts/narration-sound.mjs --wav short-02-up-the-line
// mixes the lossless voice output/narration/<take>/voice.wav into output/narration/<take>/mix.wav
// instead, for the YouTube upload (scripts/narration-master.py); mix.m4a stays as it is.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";

const wav = process.argv.includes("--wav");
const takes = process.argv.slice(2).filter(a => a !== "--wav");
if (!takes.length) { console.error("usage: node scripts/narration-sound.mjs <take>…"); process.exit(1); }
const BASE = process.env.BASE || "http://localhost:5173";
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox", "--mute-audio"] });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "narr-sound-"));
for (const take of takes) {
  const p = await b.newPage();
  await p.goto(`${BASE}/?narrate=${take}&render=1`, { waitUntil: "load", timeout: 120000 });   // not networkidle: a close opening view never reports idle
  await p.waitForFunction("window.__narr", { timeout: 180000 });   // (a take with the universe explorer can take over a minute to start on a slow machine)
  const tl = await p.evaluate("window.__narr.timeline()");
  await p.close();
  const f = path.join(tmp, `${take}.json`);
  fs.writeFileSync(f, JSON.stringify(tl));
  console.log(take);
  const out = `output/narration/${take}`;
  execFileSync(process.env.PYTHON || "python3", ["scripts/narration-sound.py", `public/narration/${take}`, f,
    ...(wav ? ["--voice", `${out}/voice.wav`, "--wav", `${out}/mix.wav`] : [])], { stdio: "inherit" });
}
await b.close();
fs.rmSync(tmp, { recursive: true, force: true });
