// Build a self-contained preview of the narration player: the app with
// relative paths, trimmed to what the player needs, so it can be hosted from
// any folder (a private claude.ai page, a phone-reachable static host…) and
// watched live with the audio, without rendering a video.
//
//   node scripts/narration-preview.mjs                 # every take with audio
//   node scripts/narration-preview.mjs short-01-hook take-2
//
// Output: dist-preview/ — page.html (body-only page for hosts that wrap it in
// their own skeleton), index.html (the normal page) and the files both use.
// The first take listed plays by default; #<take> in the address picks another.
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
if (!takes.length) takes = fs.readdirSync(NARR).filter(withAudio).sort().reverse();
const missing = takes.filter(t => !withAudio(t));
if (missing.length) { console.error(`no audio for: ${missing.join(", ")}`); process.exit(1); }
if (!takes.length) { console.error("no take has its audio.m4a in public/narration/"); process.exit(1); }

execFileSync("npx", ["vite", "build", "--mode", "narration-preview", "--base", "./", "--outDir", OUT, "--emptyOutDir"],
  { stdio: "inherit", env: { ...process.env, VITE_NARRATE: takes[0] } });

// ---------- trim what the player never loads ----------
const rm = (p) => fs.rmSync(path.join(OUT, p), { recursive: true, force: true });
["tiles/z5", "og", "og-preview.jpg", "hyperspirograph.html", "hiperspirograph.html", "spirograph-tour.md",
 "sw.js", "manifest.webmanifest", "CNAME", "favicon.png", "apple-touch-icon.png"].forEach(rm);
for (const t of fs.readdirSync(path.join(OUT, "narration"))) if (!takes.includes(t)) rm(`narration/${t}`);
// The audio goes out as MP3: some hosts (claude.ai pages) don't serve .m4a.
for (const t of takes) {
  const dir = path.join(OUT, "narration", t), wj = path.join(dir, "words.json");
  const take = JSON.parse(fs.readFileSync(wj, "utf8"));
  if (take.audio.endsWith(".mp3")) continue;
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", path.join(dir, take.audio),
    "-c:a", "libmp3lame", "-b:a", "128k", path.join(dir, "audio.mp3")]);
  fs.rmSync(path.join(dir, take.audio));
  fs.writeFileSync(wj, JSON.stringify({ ...take, audio: "audio.mp3" }));
}
// KaTeX ships woff2 + woff + ttf of every face; browsers take the woff2.
for (const f of fs.readdirSync(path.join(OUT, "assets"))) if (/^KaTeX_.*\.(woff|ttf)$/.test(f)) rm(`assets/${f}`);

// ---------- the page ----------
let html = fs.readFileSync(path.join(OUT, "index.html"), "utf8")
  .replace(/<link rel="(icon|apple-touch-icon|manifest)"[^>]*>\n?/g, "")
  .replace(/<meta (name|property)="(og|twitter):[^>]*>\n?/g, "")
  .replace(/<script data-goatcounter[^>]*><\/script>\n?/, "")   // no analytics from previews
  .replace(/<title>[^<]*<\/title>/, "<title>Triangle Narration Preview</title>");
// A take switcher, when there's more than one take
if (takes.length > 1) {
  const links = takes.map(t => `<a href="#${t}">${t}</a>`).join("");
  html = html.replace("</body>", `<nav id="narr-takes">${links}</nav>
<style>
#narr-takes { position: fixed; top: calc(env(safe-area-inset-top, 0px) + 8px); left: 8px; z-index: 10000;
  display: flex; flex-wrap: wrap; gap: 6px; font: 600 12px/1 Inter, system-ui, sans-serif; }
#narr-takes a { color: #dfe3ff; background: rgba(12, 14, 40, 0.8); border: 1px solid rgba(160, 170, 255, 0.35);
  border-radius: 4px; padding: 6px 8px; text-decoration: none; }
#narr-takes a.on { color: #0b0c20; background: #ffd54f; border-color: #ffd54f; }
</style>
<script>
(function () {
  var mark = function () {
    var cur = location.hash.slice(1) || ${JSON.stringify(takes[0])};
    document.querySelectorAll("#narr-takes a").forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + cur); });
  };
  mark(); window.addEventListener("hashchange", mark);
})();
</script>
</body>`);
}
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
