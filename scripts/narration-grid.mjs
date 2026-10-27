// The narration videos page: a grid of the takes (title and blurb from each
// scene, a still, the length, when it last changed). Shared by the build
// (scripts/narration-preview.mjs, the site's unlisted folder) and the dev
// server's /videos/ (vite.config.js), so both show the same page.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// ISO date of the last commit (touching `paths`, if given); "" outside a git checkout.
// Paths are relative to `root`, the checkout (default: the working directory)
export function gitDate(paths = [], root = ".") {
  try { return execFileSync("git", ["log", "-1", "--format=%cI", "--", ...paths], { encoding: "utf8", cwd: root }).trim(); }
  catch { return ""; }
}

/** One card's facts per take. `dir`: the folder holding narration/<take>/ (the build's
 *  copy, or public/). `root`: the checkout. `fresh`: re-import the scenes (the dev
 *  server, after an edit). */
export async function takeInfo(takes, dir, { root = ".", fresh = false } = {}) {
  const info = [];
  for (const t of takes) {
    const take = JSON.parse(fs.readFileSync(path.join(dir, "narration", t, "words.json"), "utf8"));
    const url = pathToFileURL(path.resolve(root, `src/narration-scenes/${take.scene || t}.js`)).href + (fresh ? `?t=${Date.now()}` : "");
    const scene = (await import(url)).default;
    const first = take.words.map(w => w[0]).join(" ").match(/^.*?[.?!](\s|$)/)?.[0].trim() ?? "";
    const music = scene.backing && (typeof scene.backing === "string" ? scene.backing : scene.backing.track);
    info.push({ id: t, title: scene.title || t, blurb: scene.blurb || first, duration: take.duration, music,
      thumbAt: scene.thumb ?? take.duration * 0.4, num: (t.match(/\d+/) || [""])[0],
      updated: gitDate([...["audio.m4a", "words.json"].map(f => `public/narration/${t}/${f}`), `src/narration-scenes/${take.scene || t}.js`], root) });
  }
  return info;
}

/** The grid, its back button, style and script, to go before </body>. `base`: the
 *  prefix for its own files ("" in the build's folder, "/" on the dev server).
 *  "Last updated": the commit the page comes from (`built`, `commit`) */
export function gridHtml(info, { built, commit, base = "" }) {
  const esc = (x) => String(x).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const mmss = (d) => `${Math.floor(d / 60)}:${String(Math.round(d % 60)).padStart(2, "0")}`;
  const cards = info.map(k => `
      <a class="ng-card" href="#${esc(k.id)}">
        <span class="ng-thumb">${k.thumb ? `<img src="${base}${k.thumb}" alt="" loading="lazy">` : ""}
          <span class="ng-num">${esc(k.num)}</span><span class="ng-len">${mmss(k.duration)}</span><span class="ng-play" aria-hidden="true"></span></span>
        <span class="ng-title">${esc(k.title)}</span>
        <span class="ng-blurb">${esc(k.blurb)}</span>${k.updated ? `
        <span class="ng-updated">Updated <time datetime="${k.updated}" data-fmt="day">${k.updated.slice(0, 10)}</time></span>` : ""}${k.music ? `
        <span class="ng-music">♪ “${esc(k.music)}” Kevin MacLeod (incompetech.com)</span>` : ""}
      </a>`).join("");
  return `<section id="narr-grid" hidden aria-label="Narration previews">
  <header class="ng-head">
    <p class="ng-eyebrow">The Triangle of Everything</p>
    <h1>Narration previews</h1>
    <p class="ng-note">${info.length} vertical shorts, played live from the map with their audio. Tap one to watch it, then tap the screen to pause. With autoplay on, each one rolls into the next.</p>
    <p class="ng-stamp">Last updated <time datetime="${built}" data-fmt="time">${built.slice(0, 16).replace("T", " ")} UTC</time>${commit ? ` · ${esc(commit)}` : ""}</p>
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
  src: url("${base}fonts/barlow-condensed-700-latin.woff2") format("woff2"); }
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
.ng-stamp { margin: 8px 0 0; font-size: 12.5px; line-height: 1.4; color: var(--ng-muted); font-variant-numeric: tabular-nums; }
.ng-updated { font-size: 11.5px; line-height: 1.35; color: var(--ng-muted); }
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
  // the dates in the viewer's own time zone: today as "2 hours ago", then "yesterday", then the date
  var now = new Date(), day = function (d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
  document.querySelectorAll("#narr-grid time[data-fmt]").forEach(function (t) {
    var d = new Date(t.getAttribute("datetime"));
    if (isNaN(d)) return;
    var days = Math.round((day(now) - day(d)) / 864e5), mins = Math.max(0, Math.floor((now - d) / 6e4));
    t.title = d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    t.textContent = days <= 0
      ? (mins < 1 ? "just now" : mins < 60 ? mins + (mins === 1 ? " minute" : " minutes") + " ago"
        : Math.floor(mins / 60) + (mins < 120 ? " hour" : " hours") + " ago")
      : days === 1 ? "yesterday"
      : t.dataset.fmt === "day" ? d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : t.title;
  });
  // the back button doesn't start or pause the player underneath
  document.getElementById("narr-back").addEventListener("click", function (e) { e.stopPropagation(); });
})();
</script>`;
}
