// Build the site for testing on a phone from a private claude.ai page (or any
// static folder): relative paths, trimmed like the narration preview to fit a
// host that keeps ~500 files (largest icon resolution only, small images
// inlined, no deepest background tiles, no object pages or videos).
//
//   node scripts/device-preview.mjs        # → dist-device/
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const OUT = "dist-device";
execFileSync("npx", ["vite", "build", "--mode", "device-preview", "--base", "./", "--outDir", OUT, "--emptyOutDir"], { stdio: "inherit" });
const rm = (p) => fs.rmSync(path.join(OUT, p), { recursive: true, force: true });
["tiles/z5", "og", "og-preview.jpg", "narration", "hyperspirograph.html", "hiperspirograph.html",
 "spirograph-tour.md", "sw.js", "manifest.webmanifest", "CNAME"].forEach(rm);
for (const f of fs.readdirSync(path.join(OUT, "assets"))) if (/^KaTeX_.*\.(woff|ttf)$/.test(f)) rm(`assets/${f}`);
{
  const mp = path.join(OUT, "tiles", "meta.json"), meta = JSON.parse(fs.readFileSync(mp, "utf8"));
  meta.levels = meta.levels.filter(l => fs.existsSync(path.join(OUT, "tiles", `z${l.z}`)));
  fs.writeFileSync(mp, JSON.stringify(meta));
}
let html = fs.readFileSync(path.join(OUT, "index.html"), "utf8")
  .replace(/<link rel="manifest"[^>]*>\n?/g, "")
  .replace(/<script data-goatcounter[^>]*><\/script>\n?/, "")
  .replace(/<title>[^<]*<\/title>/, "<title>Triangle Dev Build</title>");
fs.writeFileSync(path.join(OUT, "index.html"), html);
// body-only page for hosts that add their own skeleton
fs.writeFileSync(path.join(OUT, "page.html"), html.replace(/<!DOCTYPE html>\s*/i, "").replace(/<\/?html[^>]*>\s*/g, "")
  .replace(/<\/?head>\s*/g, "").replace(/<meta charset[^>]*>\s*/, "").replace(/<meta name="viewport"[^>]*>\s*/, "").replace(/<\/?body>\s*/g, ""));
const files = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach(e => { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : files.push(p); });
walk(OUT);
console.log(`${OUT}/: ${files.length} files, ${(files.reduce((s, f) => s + fs.statSync(f).size, 0) / 1e6).toFixed(1)} MB`);
