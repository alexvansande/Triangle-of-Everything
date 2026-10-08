// Build a self-contained preview of the narration player: the app with
// relative paths, trimmed to what the player needs, so it can be hosted from
// any folder (a private claude.ai page, a phone-reachable static host…) and
// watched live with the audio, without rendering a video.
//
//   node scripts/narration-preview.mjs                 # every take with audio
//   node scripts/narration-preview.mjs short-01-hook short-02-density
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

const OUT = "dist-preview";
const NARR = "public/narration";
const withAudio = (t) => {
  try { return fs.existsSync(path.join(NARR, t, JSON.parse(fs.readFileSync(path.join(NARR, t, "words.json"))).audio)); }
  catch { return false; }
};
let takes = process.argv.slice(2);
if (!takes.length) takes = fs.readdirSync(NARR).filter(withAudio).sort();
const missing = takes.filter(t => !withAudio(t));
if (missing.length) { console.error(`no audio for: ${missing.join(", ")}`); process.exit(1); }
if (!takes.length) { console.error("no take has its audio.m4a in public/narration/"); process.exit(1); }

execFileSync("npx", ["vite", "build", "--mode", "narration-preview", "--base", "./", "--outDir", OUT, "--emptyOutDir"],
  { stdio: "inherit" });

// ---------- trim what the player never loads ----------
const rm = (p) => fs.rmSync(path.join(OUT, p), { recursive: true, force: true });
["tiles/z5", "og", "og-preview.jpg", "hyperspirograph.html", "hiperspirograph.html", "spirograph-tour.md",
 "sw.js", "manifest.webmanifest", "CNAME", "favicon.png", "apple-touch-icon.png"].forEach(rm);
for (const t of fs.readdirSync(path.join(OUT, "narration"))) if (!takes.includes(t)) rm(`narration/${t}`);
// The audio goes out as MP3: some hosts (claude.ai pages) don't serve .m4a.
for (const t of takes) {
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
// KaTeX ships woff2 + woff + ttf of every face; browsers take the woff2.
for (const f of fs.readdirSync(path.join(OUT, "assets"))) if (/^KaTeX_.*\.(woff|ttf)$/.test(f)) rm(`assets/${f}`);

// ---------- the page ----------
let html = fs.readFileSync(path.join(OUT, "index.html"), "utf8")
  .replace(/<link rel="(icon|apple-touch-icon|manifest)"[^>]*>\n?/g, "")
  .replace(/<meta (name|property)="(og|twitter):[^>]*>\n?/g, "")
  .replace(/<script data-goatcounter[^>]*><\/script>\n?/, "")   // no analytics from previews
  .replace(/<title>[^<]*<\/title>/, "<title>Triangle Narration Preview</title>");
// ---------- the grid of takes ----------
const info = [];
for (const t of takes) {
  const take = JSON.parse(fs.readFileSync(path.join(OUT, "narration", t, "words.json"), "utf8"));
  const scene = (await import(path.resolve(`src/narration-scenes/${take.scene || "tour"}.js`))).default;
  const first = take.words.map(w => w[0]).join(" ").match(/^.*?[.?!](\s|$)/)?.[0].trim() ?? "";
  const music = scene.backing && (typeof scene.backing === "string" ? scene.backing : scene.backing.track);
  info.push({ id: t, title: scene.title || t, blurb: scene.blurb || first, duration: take.duration, music,
    thumbAt: scene.thumb ?? take.duration * 0.4, num: (t.match(/\d+/) || [""])[0] });
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
    await p.goto(`${BASE}/?narrate=${k.id}&render=1&captions=0&stage=none`, { waitUntil: "networkidle2" });
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
} catch (e) { console.warn(`no stills (${e.message.split("\n")[0]}); is the dev server running?`); }

const esc = (x) => String(x).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const mmss = (d) => `${Math.floor(d / 60)}:${String(Math.round(d % 60)).padStart(2, "0")}`;
const cards = info.map(k => `
    <a class="ng-card" href="#${esc(k.id)}">
      <span class="ng-thumb">${k.thumb ? `<img src="${k.thumb}" alt="" loading="lazy">` : ""}
        <span class="ng-num">${esc(k.num)}</span><span class="ng-len">${mmss(k.duration)}</span><span class="ng-play" aria-hidden="true"></span></span>
      <span class="ng-title">${esc(k.title)}</span>
      <span class="ng-blurb">${esc(k.blurb)}</span>${k.music ? `
      <span class="ng-music">♪ “${esc(k.music)}” Kevin MacLeod (incompetech.com)</span>` : ""}
    </a>`).join("");
html = html.replace("</body>", `<section id="narr-grid" hidden aria-label="Narration previews">
  <header class="ng-head">
    <p class="ng-eyebrow">The Triangle of Everything</p>
    <h1>Narration previews</h1>
    <p class="ng-note">${info.length} vertical shorts, played live from the map with their audio. Tap one to watch it, then tap the screen to pause. With autoplay on, each one rolls into the next.</p>
    <a class="ng-all" href="#${esc(info[0].id)}">Play all · ${mmss(info.reduce((s, k) => s + k.duration, 0))}</a>
  </header>
  <div class="ng-grid">${cards}
  </div>${info.some(k => k.music) ? `
  <p class="ng-credits">Music by Kevin MacLeod (<a href="https://incompetech.com" target="_blank" rel="noopener">incompetech.com</a>),
    licensed under Creative Commons: By Attribution 4.0
    (<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">creativecommons.org/licenses/by/4.0</a>).</p>` : ""}
</section>
<a id="narr-back" href="#" hidden>All videos</a>
<style>
@font-face { font-family: "Barlow Condensed"; font-weight: 700; font-display: swap;
  src: url("fonts/barlow-condensed-700-latin.woff2") format("woff2"); }
#narr-grid {
  /* one dark world, like the map: deep indigo ground, the caption yellow as the accent */
  --ng-bg: #07071c; --ng-card: #11123a; --ng-line: rgba(150, 160, 255, 0.18);
  --ng-fg: #eef0ff; --ng-muted: #a3a8d6; --ng-accent: #ffd54f;
  --ng-display: "Barlow Condensed", "DIN Condensed", "Arial Narrow", sans-serif;
  --ng-body: Inter, system-ui, -apple-system, sans-serif;
  color-scheme: dark; position: fixed; inset: 0; z-index: 100000; overflow-y: auto;
  background: var(--ng-bg); color: var(--ng-fg); font-family: var(--ng-body);
  padding: calc(env(safe-area-inset-top, 0px) + 28px) 16px calc(env(safe-area-inset-bottom, 0px) + 32px);
}
#narr-grid[hidden] { display: none; }
.ng-head { max-width: 960px; margin: 0 auto 22px; }
.ng-eyebrow { margin: 0 0 6px; font: 700 13px/1 var(--ng-display); letter-spacing: 0.14em; text-transform: uppercase; color: var(--ng-accent); }
#narr-grid h1 { margin: 0; font: 700 clamp(34px, 7vw, 52px)/0.95 var(--ng-display); text-transform: uppercase; letter-spacing: 0.01em; text-wrap: balance; }
.ng-note { margin: 10px 0 0; max-width: 46ch; font-size: 14px; line-height: 1.45; color: var(--ng-muted); }
.ng-all { display: inline-block; margin-top: 16px; font: 700 20px/1 var(--ng-display); letter-spacing: 0.08em; text-transform: uppercase;
  color: #0b0c20; background: var(--ng-accent); border-radius: 999px; padding: 12px 20px 11px; text-decoration: none; }
.ng-all::before { content: "▶ "; }
.ng-all:focus-visible { outline: 2px solid var(--ng-fg); outline-offset: 3px; }
.ng-grid { max-width: 960px; margin: 0 auto; display: grid; gap: 18px 14px; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
.ng-card { display: flex; flex-direction: column; gap: 6px; min-width: 0; color: inherit; text-decoration: none; border-radius: 12px; }
.ng-card:focus-visible { outline: 2px solid var(--ng-accent); outline-offset: 4px; }
.ng-thumb { position: relative; display: block; aspect-ratio: 9 / 16; max-width: 100%; overflow: hidden; border-radius: 10px;
  background: var(--ng-card); border: 1px solid var(--ng-line); }
.ng-thumb img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.ng-card:hover .ng-thumb img { transform: scale(1.03); }
.ng-num { position: absolute; top: 8px; left: 8px; font: 700 15px/1 var(--ng-display); letter-spacing: 0.06em;
  color: #0b0c20; background: var(--ng-accent); border-radius: 4px; padding: 4px 6px 3px; }
.ng-len { position: absolute; right: 8px; bottom: 8px; font: 600 12px/1 var(--ng-body); font-variant-numeric: tabular-nums;
  color: var(--ng-fg); background: rgba(7, 7, 28, 0.78); border-radius: 4px; padding: 4px 6px; }
.ng-play { position: absolute; left: 50%; top: 50%; width: 54px; height: 54px; margin: -27px 0 0 -27px; border-radius: 50%;
  background: rgba(7, 7, 28, 0.55); border: 2px solid rgba(255, 255, 255, 0.85); }
.ng-play::after { content: ""; position: absolute; left: 21px; top: 15px; border-style: solid; border-width: 11px 0 11px 17px;
  border-color: transparent transparent transparent #fff; }
.ng-title { font: 700 22px/1 var(--ng-display); text-transform: uppercase; letter-spacing: 0.01em; }
.ng-blurb { font-size: 13px; line-height: 1.4; color: var(--ng-muted); }
.ng-music { font-size: 11.5px; line-height: 1.35; color: var(--ng-accent); opacity: 0.85; }
.ng-credits { max-width: 960px; margin: 26px auto 0; font-size: 12px; line-height: 1.5; color: var(--ng-muted); }
.ng-credits a { color: var(--ng-fg); }
#narr-back { position: fixed; z-index: 100001; top: calc(env(safe-area-inset-top, 0px) + 10px); left: 10px;
  font: 700 15px/1 "Barlow Condensed", "Arial Narrow", sans-serif; letter-spacing: 0.08em; text-transform: uppercase;
  color: #fff; background: rgba(7, 7, 28, 0.82); border: 1px solid rgba(255, 213, 79, 0.7); border-radius: 999px;
  padding: 9px 14px 8px 12px; text-decoration: none; }
#narr-back::before { content: "‹ "; color: #ffd54f; }
#narr-back[hidden] { display: none; }
@media (prefers-reduced-motion: reduce) { .ng-thumb img { transition: none; } }
</style>
<script>
window.__narrTakes = ${JSON.stringify(info.map(k => ({ id: k.id, title: k.title }))).replace(/</g, "\\u003c")};
(function () {
  var playing = location.hash.length > 1;
  document.getElementById(playing ? "narr-back" : "narr-grid").hidden = false;
  // the back button doesn't start or pause the player underneath
  document.getElementById("narr-back").addEventListener("click", function (e) { e.stopPropagation(); });
})();
</script>
</body>`);
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
