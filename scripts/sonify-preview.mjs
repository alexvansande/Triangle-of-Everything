// Build the sound map (src/sonify.js) as its own page: the app with relative
// paths, opening straight into the sound map, trimmed like the narration
// preview so it can be hosted from any folder (a private claude.ai page…).
//
//   node scripts/sonify-preview.mjs
//
// Output: dist-sonify/ — page.html (body-only, for hosts that add their own
// skeleton), index.html, and the files both use.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const OUT = "dist-sonify";
execFileSync("npx", ["vite", "build", "--mode", "sonify-preview", "--base", "./", "--outDir", OUT, "--emptyOutDir"],
  { stdio: "inherit" });

// ---------- trim what the sound map never loads ----------
const rm = (p) => fs.rmSync(path.join(OUT, p), { recursive: true, force: true });
["tiles/z5", "narration", "og", "og-preview.jpg", "hyperspirograph.html", "hiperspirograph.html", "spirograph-tour.md",
 "sw.js", "manifest.webmanifest", "CNAME", "favicon.png", "apple-touch-icon.png"].forEach(rm);
{ // the map picks tile levels from meta.json: list only the ones shipped
  const mp = path.join(OUT, "tiles", "meta.json"), meta = JSON.parse(fs.readFileSync(mp, "utf8"));
  meta.levels = meta.levels.filter(l => fs.existsSync(path.join(OUT, "tiles", `z${l.z}`)));
  fs.writeFileSync(mp, JSON.stringify(meta));
}
for (const f of fs.readdirSync(path.join(OUT, "assets"))) if (/^KaTeX_.*\.(woff|ttf)$/.test(f)) rm(`assets/${f}`);

// ---------- the page ----------
const html = fs.readFileSync(path.join(OUT, "index.html"), "utf8")
  .replace(/<link rel="(icon|apple-touch-icon|manifest)"[^>]*>\n?/g, "")
  .replace(/<meta (name|property)="(og|twitter):[^>]*>\n?/g, "")
  .replace(/<script data-goatcounter[^>]*><\/script>\n?/, "")
  .replace(/<title>[^<]*<\/title>/, "<title>Triangle Sound Map</title>");
fs.writeFileSync(path.join(OUT, "index.html"), html);
fs.writeFileSync(path.join(OUT, "page.html"), html
  .replace(/<!DOCTYPE html>\s*/i, "").replace(/<\/?html[^>]*>\s*/g, "").replace(/<\/?head>\s*/g, "")
  .replace(/<meta charset[^>]*>\s*/, "").replace(/<meta name="viewport"[^>]*>\s*/, "").replace(/<\/?body>\s*/g, ""));

const files = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
  const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else files.push(p);
});
walk(OUT);
const bytes = files.reduce((s, f) => s + fs.statSync(f).size, 0);
console.log(`\n${OUT}/: ${files.length} files, ${(bytes / 1e6).toFixed(1)} MB`);
