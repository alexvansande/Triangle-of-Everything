// Build a self-contained preview of the narration player: the app with
// relative paths, trimmed to what the player needs, so it can be hosted from
// any folder (a private claude.ai page, a phone-reachable static host…) and
// watched live with the audio, without rendering a video.
//
//   node scripts/narration-preview.mjs                 # every take with audio
//   node scripts/narration-preview.mjs short-01-hook short-02-density
//   OUT=dist/<folder> AUDIO=m4a node scripts/narration-preview.mjs   # the site's copy (npm run build)
//
// Output: dist-preview/ — page.html (body-only page for hosts that wrap it in
// their own skeleton), index.html (the normal page) and the files both use.
// The page opens on a grid of the takes (title and blurb from each scene,
// a still, the length); #<take> plays one, with a button back to the grid.
// The stills come from a running dev server (npm run dev; BASE to point
// elsewhere); without one the cards go without.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { gitDate, takeInfo, gridHtml } from "./narration-grid.mjs";

// OUT: where it goes (the site's build puts it in an unlisted folder of dist/, see
// package.json); AUDIO=m4a keeps the takes' own audio (only claude.ai pages need MP3)
const OUT = process.env.OUT || "dist-preview";
const MP3 = process.env.AUDIO !== "m4a";
const NARR = "public/narration";
const withAudio = (t) => {
  try { return fs.existsSync(path.join(NARR, t, JSON.parse(fs.readFileSync(path.join(NARR, t, "words.json"))).audio)); }
  catch { return false; }
};
let takes = process.argv.slice(2);
// default: the shorts
if (!takes.length) takes = fs.readdirSync(NARR).filter(t => t.startsWith("short-") && withAudio(t)).sort();
const missing = takes.filter(t => !withAudio(t));
if (missing.length) { console.error(`no audio for: ${missing.join(", ")}`); process.exit(1); }
if (!takes.length) { console.error("no take has its audio.m4a in public/narration/"); process.exit(1); }

execFileSync("npx", ["vite", "build", "--mode", "narration-preview", "--base", "./", "--outDir", OUT, "--emptyOutDir"],
  { stdio: "inherit" });

// ---------- trim what the player never loads ----------
const rm = (p) => fs.rmSync(path.join(OUT, p), { recursive: true, force: true });
["tiles/z5", "tiles/z4", "og", "og-preview.jpg", "hyperspirograph.html", "hiperspirograph.html", "spirograph-tour.md",
 "sw.js", "manifest.webmanifest", "CNAME", "favicon.png", "apple-touch-icon.png"].forEach(rm);
// photos/ holds the cutaways' pictures, shared by every take
for (const t of fs.readdirSync(path.join(OUT, "narration"))) if (!takes.includes(t) && t !== "photos") rm(`narration/${t}`);
// The audio goes out as MP3: some hosts (claude.ai pages) don't serve .m4a.
for (const t of MP3 ? takes : []) {
  const dir = path.join(OUT, "narration", t), wj = path.join(dir, "words.json");
  const take = JSON.parse(fs.readFileSync(wj, "utf8"));
  const out = { ...take };
  for (const k of ["audio", "mix"]) {          // the voice, and the voice with its sound design
    if (!take[k] || take[k].endsWith(".mp3")) continue;
    const mp3 = take[k].replace(/\.\w+$/, ".mp3");
    execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", path.join(dir, take[k]),
      "-c:a", "libmp3lame", "-b:a", k === "mix" ? "160k" : "128k", path.join(dir, mp3)]);
    fs.rmSync(path.join(dir, take[k]));
    out[k] = mp3;
  }
  fs.writeFileSync(wj, JSON.stringify(out));
}
// The map picks tile levels from meta.json: list only the ones shipped, or
// it asks for the missing z5 tiles at deep zooms and they never load.
{
  const mp = path.join(OUT, "tiles", "meta.json"), meta = JSON.parse(fs.readFileSync(mp, "utf8"));
  meta.levels = meta.levels.filter(l => fs.existsSync(path.join(OUT, "tiles", `z${l.z}`)));
  fs.writeFileSync(mp, JSON.stringify(meta));
}
// The cutaway photos go out at 2000 px on the long side (up to 3600 px in the
// repo, for the renders): a phone holding several decoded 3600 px photos runs
// short of memory and starts dropping pictures and the WebGL background. The
// player places a photo by its scene's pixel size, not the file's, so this
// changes nothing on screen.
{
  const { default: sharp } = await import("sharp");
  const dir = path.join(OUT, "narration", "photos");
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    if (!/\.jpe?g$/i.test(f)) continue;
    const fp = path.join(dir, f), meta = await sharp(fp).metadata();
    if (Math.max(meta.width, meta.height) <= 2000) continue;
    const buf = await sharp(fp).resize({ width: 2000, height: 2000, fit: "inside" }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    fs.writeFileSync(fp, buf);
  }
}
// KaTeX ships woff2 + woff + ttf of every face; browsers take the woff2.
for (const f of fs.readdirSync(path.join(OUT, "assets"))) if (/^KaTeX_.*\.(woff|ttf)$/.test(f)) rm(`assets/${f}`);

// ---------- the page ----------
let html = fs.readFileSync(path.join(OUT, "index.html"), "utf8")
  .replace(/<link rel="(icon|apple-touch-icon|manifest)"[^>]*>\n?/g, "")
  .replace(/<meta (name|property)="(og|twitter):[^>]*>\n?/g, "")
  .replace(/<script data-goatcounter[^>]*><\/script>\n?/, "")   // no analytics from previews
  .replace(/<title>[^<]*<\/title>/, `<title>Triangle Narration Preview</title>\n<meta name="robots" content="noindex, nofollow">`);
// ---------- the grid of takes ----------
const info = await takeInfo(takes, OUT);
// the rendered videos go next to the page, in rendered/ (the grid's "Rendered video")
for (const k of info) if (k.video) {
  fs.mkdirSync(path.join(OUT, "rendered"), { recursive: true });
  fs.copyFileSync(k.video, path.join(OUT, "rendered", `${k.id}.mp4`));
}
// A still of each take from the dev server, if one is running
try {
  const BASE = process.env.BASE || "http://localhost:5173";
  await fetch(BASE);
  const { default: puppeteer } = await import("puppeteer-core");
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
  for (const k of info) {
    const p = await b.newPage();
    await p.setViewport({ width: 540, height: 960 });
    await p.goto(`${BASE}/?narrate=${k.id}&render=1&captions=0&stage=none`, { waitUntil: "load", timeout: 180000 });
    await p.waitForFunction("window.__narr", { timeout: 60000 });
    await p.evaluate(`window.__narr.renderAt(${k.thumbAt}); window.__narr.settle(${k.thumbAt})`);
    for (let i = 0; i < 20 && await p.evaluate("window.__narr.pending()"); i++) await new Promise(r => setTimeout(r, 150));
    await new Promise(r => setTimeout(r, 1200));
    await p.evaluate(`window.__narr.renderAt(${k.thumbAt})`);
    await p.screenshot({ path: path.join(OUT, "narration", k.id, "thumb.jpg"), type: "jpeg", quality: 72 });
    await p.close();
    k.thumb = `narration/${k.id}/thumb.jpg`;
  }
  await b.close();
} catch (e) { console.warn(`no new stills (${e.message.split("\n")[0]}); is the dev server running?`); }
// without a dev server (the site's build), the stills kept in public/narration/<take>/thumb.jpg
for (const k of info) if (!k.thumb && fs.existsSync(path.join(OUT, "narration", k.id, "thumb.jpg"))) k.thumb = `narration/${k.id}/thumb.jpg`;

// "Last updated": the commit the build comes from, and each take's last change
// (its audio, captions or scene; not the still). Needs the git history: the deploy
// checks out with fetch-depth 0
const built = gitDate() || new Date().toISOString();
const commit = (() => { try { return execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim(); } catch { return ""; } })();
html = html.replace("</body>", gridHtml(info, { built, commit }) + "\n</body>");
fs.writeFileSync(path.join(OUT, "index.html"), html);
// Body-only variant: hosts that add their own <!doctype>/<head>/<body> skeleton
const page = html
  .replace(/<!DOCTYPE html>\s*/i, "")
  .replace(/<\/?html[^>]*>\s*/g, "")
  .replace(/<\/?head>\s*/g, "")
  .replace(/<meta charset[^>]*>\s*/, "")
  .replace(/<meta name="viewport"[^>]*>\s*/, "")
  .replace(/<\/?body>\s*/g, "");
fs.writeFileSync(path.join(OUT, "page.html"), page);

const files = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else files.push(path.relative(OUT, p));
});
walk(OUT);
const bytes = files.reduce((s, f) => s + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`\n${OUT}/: ${files.length} files, ${(bytes / 1e6).toFixed(1)} MB · takes: ${takes.join(", ")}`);
