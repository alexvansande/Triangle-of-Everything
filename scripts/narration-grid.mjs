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

// The take's rendered video: the web encode of a full render (video/web/<take>.mp4,
// in git, ~20 MB), and when it was last rendered (its commit, or the file's date
// before it's committed). `local`: the full render instead where this machine has
// it (output/videos/<take>.mp4, never in git), for the dev server.
export function renderedVideo(t, root = ".", local = false) {
  const full = `output/videos/${t}.mp4`;
  if (local && fs.existsSync(path.join(root, full))) return { video: full, renderedAt: fs.statSync(path.join(root, full)).mtime.toISOString() };
  const f = `video/web/${t}.mp4`, fp = path.join(root, f);
  if (!fs.existsSync(fp)) return {};
  return { video: f, renderedAt: gitDate([f], root) || fs.statSync(fp).mtime.toISOString() };
}

// When a take last changed. Its own audio, captions or scene; or, while it waits in
// video/render-queue.txt, when it was queued there: a change to the code every video shares
// (the lit paths, the renderer) queues the takes it changes without touching their files, and
// the page has to show their renders are behind (the author, 2026-10-29: video 1 read "rendered"
// without the new lit paths). `queued`: it's in the queue now.
function updatedAt(t, scene, root) {
  const own = gitDate([...["audio.m4a", "words.json"].map(f => `public/narration/${t}/${f}`), `src/narration-scenes/${scene}.js`], root);
  let queue = "";
  try { queue = fs.readFileSync(path.join(root, "video/render-queue.txt"), "utf8"); } catch {}
  if (!queue.split("\n").some(l => l.trim() === t)) return { updated: own };
  let at = "";
  try { at = execFileSync("git", ["log", "-1", "--format=%cI", "-G", `^${t}$`, "--", "video/render-queue.txt"], { encoding: "utf8", cwd: root }).trim(); } catch {}
  return { updated: !at || (own && new Date(own) > new Date(at)) ? own : at, queued: true };
}

// What each video goes up to YouTube with (scripts/youtube-publish.py --json: title, the whole
// description, tags, privacy, schedule, playlist, its id once uploaded); {} without Python
function youtubeInfo(root) {
  try { return JSON.parse(execFileSync("python3", ["scripts/youtube-publish.py", "--json"], { encoding: "utf8", cwd: root })); }
  catch { return {}; }
}

/** One card's facts per take. `dir`: the folder holding narration/<take>/ (the build's
 *  copy, or public/). `root`: the checkout. `fresh`: re-import the scenes, and `local`:
 *  the full renders where there are any (both for the dev server). */
export async function takeInfo(takes, dir, { root = ".", fresh = false, local = false } = {}) {
  const info = [], yt = youtubeInfo(root);
  // published (video/render-locked.txt): on YouTube, public, its render final
  let locked = new Set();
  try { locked = new Set(fs.readFileSync(path.join(root, "video/render-locked.txt"), "utf8").split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"))); } catch {}
  for (const t of takes) {
    const take = JSON.parse(fs.readFileSync(path.join(dir, "narration", t, "words.json"), "utf8"));
    const url = pathToFileURL(path.resolve(root, `src/narration-scenes/${take.scene || t}.js`)).href + (fresh ? `?t=${Date.now()}` : "");
    const scene = take.renderOnly ? {} : (await import(url)).default;
    const first = take.words.map(w => w[0]).join(" ").match(/^.*?[.?!](\s|$)/)?.[0].trim() ?? "";
    const music = scene.backing && (typeof scene.backing === "string" ? scene.backing : scene.backing.track);
    // a cut (scripts/narration-cut.py) has its own title and blurb; a long one plays 16:9
    info.push({ renderOnly: !!take.renderOnly, id: t, title: take.title || scene.title || t, blurb: take.blurb || scene.blurb || first, duration: take.duration, music,
      thumbAt: scene.thumb ?? take.duration * 0.4, num: (t.match(/\d+[a-z]?/) || [""])[0],
      long: t.startsWith("long-"), wide: take.stage === "landscape", cut: !!take.segments,
      sources: take.segments ? [...new Set(take.segments.map(s => s.take))] : [t], published: locked.has(t),
      yt: yt[t], ytThumb: fs.existsSync(path.join(root, "video/thumbnails", `${t}.jpg`)) ? `video/thumbnails/${t}.jpg` : "",
      ...renderedVideo(t, root, local),
      ...updatedAt(t, take.scene || t, root) });
  }
  return info;
}

/** The grid, its back button, style and script, to go before </body>. `base`: the
 *  prefix for its own files ("" in the build's folder, "/" on the dev server).
 *  "Last updated": the commit the page comes from (`built`, `commit`) */
export function gridHtml(info, { built, commit, base = "" }) {
  const esc = (x) => String(x).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const mmss = (d) => `${Math.floor(d / 60)}:${String(Math.round(d % 60)).padStart(2, "0")}`;
  // the YouTube side: its thumbnail on the card (else the still), and what goes up with it
  const when = (s) => s ? new Date(s).toISOString().slice(0, 16).replace("T", " ") + " UTC" : "";
  // a Copy button for a field, as it goes in YouTube Studio (tags comma-separated)
  const copy = (text) => `<button type="button" class="ng-copy" data-copy="${esc(text)}">Copy</button>`;
  const ytPanel = (k) => !k.yt ? "" : `
        <details class="ng-yt">
          <summary>YouTube</summary>
          <dl>
            <dt>Title</dt><dd><span class="ng-yt-title">${esc(k.yt.title)}</span> ${copy(k.yt.title)}</dd>
            <dt>Status</dt><dd>${k.yt.youtube ? `<a href="https://youtu.be/${esc(k.yt.youtube)}" target="_blank" rel="noopener">uploaded</a>, ` : "not uploaded, "}${esc(k.yt.privacy)}${
              k.yt.publishAt ? ` · goes public <time datetime="${esc(k.yt.publishAt)}" data-fmt="time">${esc(when(k.yt.publishAt))}</time>` : ""}${
              k.duration + 3 > 180 ? " · over 3:00, a regular video" : " · a Short"}</dd>
            ${k.yt.playlist ? `<dt>Playlist</dt><dd>${esc(k.yt.playlist)}</dd>` : ""}
            <dt>Tags</dt><dd><span class="ng-tags">${k.yt.tags.map(t => `<span>${esc(t)}</span>`).join("")}</span> ${copy(k.yt.tags.join(", "))}</dd>
            <dt>Description</dt><dd>${copy(k.yt.description.trim())}<div class="ng-desc">${esc(k.yt.description.trim())}</div></dd>
          </dl>
          ${k.ytThumb && k.thumb ? `<p class="ng-yt-still">Player still: <img src="${base}${k.thumb}" alt="" loading="lazy"></p>` : ""}
        </details>`;
  // each long video (16:9, scripts/narration-cut.py), then a row of its shorts that scrolls sideways: the shorts
  // cut from the same source takes (the author, 2026-11-03: "the long videos, then a horizontal carousel of their
  // shorts, then the next long"). Shorts of no long video (the powers-of-ten zoom) get a row of their own, first.
  const shorts = info.filter(k => !k.long), longs = info.filter(k => k.long);
  const numOf = (k) => +(k.id.match(/^long-(\d+)/) || [0, 0])[1];
  const groups = [...new Set(longs.map(numOf))].sort((a, b) => a - b).map(n => {
    const ls = longs.filter(l => numOf(l) === n), src = new Set(ls.flatMap(l => l.sources));
    return { n, longs: ls, long: ls[0], shorts: shorts.filter(s => s.sources.some(x => src.has(x))) };
  });
  const grouped = new Set(groups.flatMap(g => g.shorts.map(s => s.id)));
  const loose = shorts.filter(s => !grouped.has(s.id));
  const card = k => `
    <div class="ng-item${k.wide ? " is-wide" : ""}">
      <a class="ng-card" data-render-only="${k.renderOnly ? "1" : "0"}" href="#${k.renderOnly ? "rendered/" : ""}${esc(k.id)}">
        <span class="ng-thumb">${k.ytThumb || k.thumb ? `<img src="${base}${k.ytThumb || k.thumb}" alt="" loading="lazy">` : ""}
          <span class="ng-num">${esc(k.num)}</span>${k.published ? `<span class="ng-pub">Published</span>` : ""}<span class="ng-len">${mmss(k.duration)}</span><span class="ng-play" aria-hidden="true"></span></span>
        <span class="ng-title">${esc(k.yt?.title || k.title)}</span>
        <span class="ng-blurb">${esc(k.yt?.blurb || k.blurb)}</span>${k.updated ? `
        <span class="ng-updated">Updated <time datetime="${k.updated}" data-fmt="day">${k.updated.slice(0, 10)}</time></span>` : ""}${k.renderedAt ? `
        <span class="ng-updated">Last rendered <time datetime="${k.renderedAt}" data-fmt="day">${k.renderedAt.slice(0, 10)}</time>${
          k.queued || (k.updated && new Date(k.updated) > new Date(k.renderedAt)) ? ` <span class="ng-behind">· older than the live version</span>` : ""}</span>` : ""}${k.music ? `
        <span class="ng-music">♪ “${esc(k.music)}” Kevin MacLeod (incompetech.com)</span>` : ""}
      </a>${ytPanel(k)}
    </div>`;
  const row = (list, label) => `
  <div class="ng-carousel" role="list" aria-label="${esc(label)}">${list.map(k => card(k).replace('<div class="ng-item', '<div role="listitem" class="ng-item')).join("")}
  </div>`;
  const sections = (loose.length ? `
  <section class="ng-group">
    <h2 class="ng-sub">Shorts <span>on their own</span></h2>${row(loose, "Shorts on their own")}
  </section>` : "") + groups.map((g, i) => `
  <section class="ng-group">
    <h2 class="ng-sub">Long video ${g.n} <span>16:9 · ${g.longs.map(l => mmss(l.duration)).join(" / ")}${g.longs.length > 1 ? ` · ${g.longs.length} versions` : ""}</span></h2>
    ${g.longs.length > 1 ? row(g.longs, `Long video ${g.n}'s versions`).replace('class="ng-carousel"', 'class="ng-carousel ng-carousel-wide"') : `<div class="ng-long">${card(g.long)}
    </div>`}${g.shorts.length ? `
    <h3 class="ng-sub3">Its shorts <span>${g.shorts.length} · 9:16 · scroll sideways</span></h3>${row(g.shorts, `Long video ${g.n}'s shorts`)}` : ""}
  </section>`).join("");
  return `<section id="narr-grid" hidden aria-label="Narration previews">
  <header class="ng-head">
    <p class="ng-eyebrow">The Triangle of Everything</p>
    <h1>Narration previews</h1>
    <p class="ng-note">${groups.length} long videos (16:9), each followed by its shorts (9:16): ${shorts.length} shorts in all, played live from the map with their audio. Tap one to watch it, then tap the screen to pause. With autoplay on, each one rolls into the next.</p>
    <p class="ng-stamp">Last updated <time datetime="${built}" data-fmt="time">${built.slice(0, 16).replace("T", " ")} UTC</time>${commit ? ` · ${esc(commit)}` : ""}</p>
    <div class="ng-mode" role="group" aria-label="How to watch">
      <button type="button" data-mode="live" aria-pressed="true">Live map</button>
      <button type="button" data-mode="video" aria-pressed="false">Rendered video</button>
    </div>
    <p class="ng-mode-note" id="ng-mode-note"></p>
    <p class="ng-listen"><a href="${base}listen.html">Listen only</a> · the audio alone, no map: for a phone, or on the way home</p>
    <a class="ng-all" href="#${esc((shorts.find(k => !k.renderOnly) || shorts[0]).id)}">Play all · ${mmss(shorts.filter(k => !k.renderOnly).reduce((s, k) => s + k.duration, 0))}</a>
  </header>
${sections}${info.some(k => k.music) ? `
  <p class="ng-credits">Music by Kevin MacLeod (<a href="https://incompetech.com" target="_blank" rel="noopener">incompetech.com</a>),
    licensed under Creative Commons: By Attribution 4.0
    (<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">creativecommons.org/licenses/by/4.0</a>).</p>` : ""}
</section>
<a id="narr-back" href="#" hidden>All videos</a>
<button type="button" id="narr-to-video" hidden>Rendered video</button>
<div id="narr-video" hidden role="dialog" aria-label="Rendered video">
  <video id="nv-player" controls playsinline preload="metadata"></video>
  <button type="button" id="nv-back">All videos</button>
  <button type="button" id="nv-full" hidden>Full screen</button>
  <a id="nv-live" href="#">Live map</a>
</div>
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
.ng-behind { color: var(--ng-accent); }
.ng-sub { max-width: 960px; margin: 30px auto 12px; font: 700 26px/1 var(--ng-display); text-transform: uppercase; letter-spacing: 0.01em; }
.ng-sub span { font: 500 13px/1 var(--ng-body); text-transform: none; letter-spacing: 0; color: var(--ng-muted); margin-left: 8px; }
.ng-grid-wide { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
.ng-group { max-width: 960px; margin: 0 auto; padding-bottom: 8px; border-bottom: 1px solid var(--ng-line); }
.ng-group:last-of-type { border-bottom: 0; }
.ng-long { max-width: 640px; }
.ng-sub3 { margin: 18px 0 10px; font: 700 18px/1 var(--ng-display); text-transform: uppercase; letter-spacing: 0.04em; color: var(--ng-muted); }
.ng-sub3 span { font: 500 12.5px/1 var(--ng-body); text-transform: none; letter-spacing: 0; margin-left: 6px; }
/* a long video's shorts: one row that scrolls sideways, each card snapping into place */
.ng-carousel { display: flex; gap: 14px; overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x mandatory;
  padding: 2px 2px 14px; margin: 0 -2px; scrollbar-width: thin; scrollbar-color: var(--ng-line) transparent; }
.ng-carousel > .ng-item { flex: 0 0 clamp(150px, 40vw, 190px); scroll-snap-align: start; }
.ng-carousel > .ng-item:has(.ng-yt[open]) { flex-basis: min(640px, 88vw); }
/* "Rendered video" on: the videos with no render yet at half strength */
.ng-item { transition: opacity 0.2s ease; }
.ng-item.is-unrendered { opacity: 0.5; }
.ng-carousel-wide > .ng-item { flex-basis: min(420px, 82vw); }
.ng-pub { position: absolute; left: 8px; bottom: 8px; font: 700 12px/1 var(--ng-display); letter-spacing: 0.08em; text-transform: uppercase;
  color: #0b0c20; background: #8be28b; border-radius: 4px; padding: 4px 6px 3px; }
.ng-item.is-wide .ng-thumb { aspect-ratio: 16 / 9; }
.ng-item { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
/* the YouTube panel: opened, the card takes the whole row */
.ng-item:has(.ng-yt[open]) { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(150px, 220px) 1fr; gap: 8px 18px; align-items: start; }
.ng-yt summary { font: 700 14px/1 var(--ng-display); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ng-accent);
  cursor: pointer; padding: 6px 0; list-style-position: inside; }
.ng-yt summary:focus-visible { outline: 2px solid var(--ng-accent); outline-offset: 2px; }
.ng-yt dl { margin: 6px 0 0; display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; font-size: 13px; line-height: 1.45; }
.ng-yt dt { color: var(--ng-muted); font-size: 11.5px; letter-spacing: 0.06em; text-transform: uppercase; padding-top: 2px; }
.ng-yt dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
/* the map turns selection off page-wide; the YouTube text is there to be copied */
.ng-yt dl { -webkit-user-select: text; user-select: text; cursor: auto; }
.ng-copy { font: 700 12px/1 var(--ng-display); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ng-fg);
  background: var(--ng-card); border: 1px solid var(--ng-line); border-radius: 999px; padding: 5px 10px 4px; cursor: pointer;
  vertical-align: middle; -webkit-user-select: none; user-select: none; }
.ng-copy:hover { border-color: var(--ng-accent); }
.ng-copy:focus-visible { outline: 2px solid var(--ng-accent); outline-offset: 2px; }
.ng-copy.is-done { color: #0b0c20; background: var(--ng-accent); border-color: transparent; }
.ng-yt dd > .ng-copy:first-child { margin-bottom: 6px; }
.ng-yt a { color: var(--ng-fg); }
.ng-yt-title { font: 700 20px/1.1 var(--ng-display); }
.ng-tags { display: inline-flex; flex-wrap: wrap; gap: 4px; vertical-align: middle; }
.ng-tags span { font-size: 12px; padding: 2px 8px; border-radius: 999px; background: var(--ng-card); border: 1px solid var(--ng-line); }
.ng-desc { white-space: pre-wrap; background: var(--ng-card); border: 1px solid var(--ng-line); border-radius: 8px; padding: 10px 12px; color: var(--ng-fg); }
.ng-yt-still { margin: 10px 0 0; font-size: 11.5px; color: var(--ng-muted); }
.ng-yt-still img { display: block; width: 90px; margin-top: 4px; border-radius: 6px; border: 1px solid var(--ng-line); }
@media (max-width: 560px) {
  .ng-item:has(.ng-yt[open]) { grid-template-columns: 1fr; }
  .ng-yt dl { grid-template-columns: 1fr; gap: 2px; }
  .ng-yt dt { padding-top: 8px; }
}
.ng-credits { max-width: 960px; margin: 26px auto 0; font-size: 12px; line-height: 1.5; color: var(--ng-muted); }
.ng-credits a { color: var(--ng-fg); }
#narr-back { position: fixed; z-index: 100001; top: calc(env(safe-area-inset-top, 0px) + 10px); left: 10px;
  font: 700 15px/1 "Barlow Condensed", "Arial Narrow", sans-serif; letter-spacing: 0.08em; text-transform: uppercase;
  color: #fff; background: rgba(7, 7, 28, 0.82); border: 1px solid rgba(255, 213, 79, 0.7); border-radius: 999px;
  padding: 9px 14px 8px 12px; text-decoration: none; }
#narr-back::before { content: "‹ "; color: #ffd54f; }
#narr-back[hidden] { display: none; }
@media (prefers-reduced-motion: reduce) { .ng-thumb img { transition: none; } }
/* live map or rendered video */
.ng-mode { display: inline-flex; margin-top: 16px; padding: 3px; border-radius: 999px; background: var(--ng-card); border: 1px solid var(--ng-line); }
.ng-mode button { font: 700 16px/1 var(--ng-display); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ng-muted);
  background: none; border: 0; border-radius: 999px; padding: 10px 16px 9px; cursor: pointer; }
.ng-mode button[aria-pressed="true"] { color: #0b0c20; background: var(--ng-fg); }
.ng-mode button:focus-visible { outline: 2px solid var(--ng-accent); outline-offset: 2px; }
.ng-mode-note { margin: 8px 0 0; font-size: 12.5px; line-height: 1.4; color: var(--ng-muted); min-height: 1.4em; }
.ng-mode + .ng-mode-note + .ng-all { margin-top: 10px; }
.ng-badge { position: absolute; top: 8px; right: 8px; font: 700 12px/1 var(--ng-display); letter-spacing: 0.08em; text-transform: uppercase;
  border-radius: 4px; padding: 4px 6px 3px; color: var(--ng-fg); background: rgba(7, 7, 28, 0.78); border: 1px solid var(--ng-line); }
.ng-badge.is-video { color: #0b0c20; background: var(--ng-fg); border-color: transparent; }
#narr-video { position: fixed; inset: 0; z-index: 100002; background: #000; display: flex; align-items: center; justify-content: center; }
#narr-video[hidden] { display: none; }
#nv-player { width: 100%; height: 100%; object-fit: contain; background: #000; }
#nv-back, #nv-live, #nv-full, #narr-to-video { position: fixed; z-index: 100003; top: calc(env(safe-area-inset-top, 0px) + 10px);
  font: 700 15px/1 "Barlow Condensed", "Arial Narrow", sans-serif; letter-spacing: 0.08em; text-transform: uppercase;
  color: #fff; background: rgba(7, 7, 28, 0.82); border: 1px solid rgba(255, 213, 79, 0.7); border-radius: 999px;
  padding: 9px 14px 8px 12px; text-decoration: none; cursor: pointer; }
#nv-back { left: 10px; }
#nv-back::before { content: "‹ "; color: #ffd54f; }
#nv-live, #narr-to-video { right: 10px; padding-left: 14px; }
#narr-to-video[hidden], #nv-live[hidden], #nv-full[hidden] { display: none; }
/* full screen: some phone browsers show no full-screen button on an inline video (the author, 2026-10-31) */
#nv-full { left: 50%; transform: translateX(-50%); padding-left: 14px; }
</style>
<script>
window.__narrTakes = ${JSON.stringify(shorts.filter(k => !k.renderOnly).map(k => ({ id: k.id, title: k.title }))).replace(/</g, "\\u003c")};
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
  // the YouTube panels: clicks and selections stay there (not the map's), Copy copies a field
  document.querySelectorAll("#narr-grid .ng-yt").forEach(function (d) {
    ["click", "mousedown", "pointerdown", "touchstart"].forEach(function (ev) { d.addEventListener(ev, function (e) { e.stopPropagation(); }); });
  });
  document.querySelectorAll("#narr-grid .ng-copy").forEach(function (b) {
    b.addEventListener("click", function () {
      var text = b.getAttribute("data-copy"), done = function () {
        b.textContent = "Copied"; b.classList.add("is-done");
        setTimeout(function () { b.textContent = "Copy"; b.classList.remove("is-done"); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
      else { var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select();
        try { document.execCommand("copy"); done(); } catch (e) {} t.remove(); }
    });
  });
})();
</script>
<script>
// Live map or rendered video: a take with a rendered video (video/web/, copied to
// rendered/ next to the page) can play it instead; one without plays live.
window.__narrVideos = ${JSON.stringify(Object.fromEntries(info.filter(k => k.video).map(k => [k.id, `${base}rendered/${k.id}.mp4`])))};
(function () {
  var VIDEOS = window.__narrVideos, TAKES = window.__narrTakes;
  var KEY = "narr-watch-mode", OPEN = "narr-open-video";
  var get = function (k, s) { try { return (s || localStorage).getItem(k); } catch (e) { return null; } };
  var put = function (k, v, s) { try { v == null ? (s || localStorage).removeItem(k) : (s || localStorage).setItem(k, v); } catch (e) {} };
  var mode = get(KEY) === "video" ? "video" : "live";
  var box = document.getElementById("narr-video"), player = document.getElementById("nv-player");
  var live = document.getElementById("nv-live"), queue = [];
  var takeOf = function (a) { return (a.getAttribute("href") || "").slice(1).split("rendered/").pop(); };
  var rendered = TAKES.filter(function (t) { return VIDEOS[t.id]; });

  function paint() {
    document.querySelectorAll(".ng-mode button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.mode === mode)); });
    document.querySelectorAll(".ng-card").forEach(function (a) {
      var thumb = a.querySelector(".ng-thumb"), badge = thumb.querySelector(".ng-badge");
      if (!badge) { badge = document.createElement("span"); badge.className = "ng-badge"; thumb.appendChild(badge); }
      var has = !!VIDEOS[takeOf(a)];
      badge.hidden = mode !== "video" && a.dataset.renderOnly !== "1";
      badge.className = "ng-badge" + (has ? " is-video" : "");
      badge.textContent = has ? "Video" : a.dataset.renderOnly === "1" ? "Queued · rendered only" : "Live only";
      var item = a.closest(".ng-item");
      if (item) item.classList.toggle("is-unrendered", mode === "video" && !has);
    });
    // Play all: the whole series live; in video mode, only the rendered ones
    var all = document.querySelector(".ng-all");
    all.dataset.live = all.dataset.live || all.textContent;
    var secs = 0;
    document.querySelectorAll(".ng-card").forEach(function (a) {
      var p = (a.querySelector(".ng-len") || {}).textContent;
      if (VIDEOS[takeOf(a)] && p) secs += +p.split(":")[0] * 60 + +p.split(":")[1];
    });
    all.textContent = mode === "video" && secs
      ? "Play all · " + Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0") : all.dataset.live;
    document.getElementById("ng-mode-note").textContent = mode === "video"
      ? (rendered.length ? rendered.length + " of " + TAKES.length + " rendered; the rest play live." : "None rendered yet; they play live.")
      : "Drawn live in your browser from the map.";
  }
  function open(take, rest) {
    queue = rest || [];
    player.src = VIDEOS[take];
    live.hidden = !!document.querySelector('.ng-card[data-render-only="1"][href="#rendered/'+take+'"]');
    live.href = "#" + take;
    box.hidden = false;
    var p = player.play();
    if (p && p.catch) p.catch(function () {});   // no gesture yet (after a reload): the controls start it
  }
  function close() { player.pause(); player.removeAttribute("src"); player.load(); box.hidden = true; queue = []; }

  document.querySelectorAll(".ng-mode button").forEach(function (b) {
    b.addEventListener("click", function () { mode = b.dataset.mode; put(KEY, mode); paint(); });
  });
  // in video mode a card (or Play all) opens the video, if there is one; it stops
  // the click there, before the app's own handler (on document) starts the take live
  document.getElementById("narr-grid").addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a.ng-card, a.ng-all");
    if (!a) return;
    if(a.dataset.renderOnly === "1") {
      e.preventDefault(); e.stopPropagation();
      if(VIDEOS[takeOf(a)]) return open(takeOf(a));
      document.getElementById("ng-mode-note").textContent="This two-minute zoom is queued. Its rendered video will appear here when ready.";
      return;
    }
    if (mode === "video") {
      if (a.classList.contains("ng-all")) {
        if (!rendered.length) return;
        e.preventDefault(); e.stopPropagation();
        return open(rendered[0].id, rendered.slice(1).map(function (t) { return t.id; }));
      }
      if (VIDEOS[takeOf(a)]) { e.preventDefault(); e.stopPropagation(); return open(takeOf(a)); }
    }
    // live: the app plays it in place (no reload), so offer its video from here
    if (!a.classList.contains("ng-all")) offerVideo(takeOf(a));
  });
  player.addEventListener("ended", function () { if (queue.length) open(queue[0], queue.slice(1)); });
  document.getElementById("nv-back").addEventListener("click", close);
  // the page's own full-screen button (iPhone: the video's native player, webkitEnterFullscreen);
  // a 16:9 video turns the phone sideways where the browser allows it
  var full = document.getElementById("nv-full");
  full.hidden = !(player.requestFullscreen || player.webkitRequestFullscreen || player.webkitEnterFullscreen);
  full.addEventListener("click", function () {
    var go = player.requestFullscreen || player.webkitRequestFullscreen;
    var landscape = function () { if (player.videoWidth > player.videoHeight && screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(function () {}); };
    if (go) { var p = go.call(player); if (p && p.then) p.then(landscape).catch(function () { if (player.webkitEnterFullscreen) player.webkitEnterFullscreen(); }); else landscape(); }
    else if (player.webkitEnterFullscreen) player.webkitEnterFullscreen();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !box.hidden) close(); });
  live.addEventListener("click", function () { put(KEY, "live"); });

  // in the live player: switch this take to its video (the page reloads on a hash change)
  var playing = location.hash.slice(1), toVideo = document.getElementById("narr-to-video"), offered = null;
  function offerVideo(take) { offered = VIDEOS[take] ? take : null; toVideo.hidden = !offered; }
  toVideo.addEventListener("click", function (e) {
    e.stopPropagation();
    if (!offered) return;
    put(KEY, "video"); put(OPEN, offered, sessionStorage);
    location.hash = "";
  });
  if (playing) offerVideo(playing);
  paint();
  var pending = !playing && get(OPEN, sessionStorage);
  put(OPEN, null, sessionStorage);
  if (pending && VIDEOS[pending]) open(pending);
})();
</script>`;
}

/** A listen-only page next to the grid (listen.html): each take's audio with its sound design in a plain
 *  <audio>, long videos first, then their shorts; no map, no player, so a phone can play it on the move
 *  (the author, 2026-11-05: Safari crashed the live page, "a problem repeatedly occurred"). */
export function listenHtml(info, { built, commit, base = "" }) {
  const esc = (x) => String(x).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const mmss = (d) => `${Math.floor(d / 60)}:${String(Math.round(d % 60)).padStart(2, "0")}`;
  const shorts = info.filter(k => !k.long && !k.renderOnly), longs = info.filter(k => k.long);
  const numOf = (k) => +(k.id.match(/^long-(\d+)/) || [0, 0])[1];
  const groups = [...new Set(longs.map(numOf))].sort((a, b) => a - b).map(n => {
    const ls = longs.filter(l => numOf(l) === n), src = new Set(ls.flatMap(l => l.sources));
    return { n, longs: ls, shorts: shorts.filter(s => s.sources.some(x => src.has(x))) };
  });
  const grouped = new Set(groups.flatMap(g => g.shorts.map(s => s.id)));
  const loose = shorts.filter(s => !grouped.has(s.id));
  const item = (k) => `
    <li id="${esc(k.id)}">
      <h3>${esc(k.yt?.title || k.title)} <span>${mmss(k.duration)}${k.wide ? " · 16:9" : ""}</span></h3>
      <p>${esc(k.yt?.blurb || k.blurb)}</p>
      <audio controls preload="none" src="${base}narration/${esc(k.id)}/mix.m4a"></audio>
      <p class="alt"><a href="${base}narration/${esc(k.id)}/mix.m4a" download>Save</a> · <a href="${base}narration/${esc(k.id)}/audio.m4a">voice only</a>${k.updated ? ` · updated ${esc(k.updated.slice(0, 10))}` : ""}</p>
    </li>`;
  const section = (title, list) => list.length ? `
  <section><h2>${esc(title)}</h2><ul>${list.map(item).join("")}
  </ul></section>` : "";
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Listen · The Triangle of Everything</title>
<style>
  body { margin: 0; padding: calc(env(safe-area-inset-top, 0px) + 20px) 16px calc(env(safe-area-inset-bottom, 0px) + 32px); background: #07071c; color: #eef0ff;
    font-family: Inter, system-ui, -apple-system, sans-serif; line-height: 1.4; color-scheme: dark; }
  h1 { font-size: 22px; margin: 0 0 4px; } h2 { font-size: 15px; color: #a3a8d6; margin: 28px 0 8px; text-transform: uppercase; letter-spacing: .06em; }
  h3 { font-size: 17px; margin: 0 0 4px; } h3 span { color: #a3a8d6; font-weight: 400; font-size: 14px; }
  p { margin: 0 0 8px; color: #c9cdf0; font-size: 14px; } .alt { font-size: 12px; color: #a3a8d6; }
  ul { list-style: none; padding: 0; margin: 0; } li { background: #11123a; border: 1px solid rgba(150,160,255,.18); border-radius: 12px; padding: 14px; margin: 0 0 12px; }
  audio { width: 100%; margin: 6px 0; } a { color: #ffd54f; } .stamp { color: #a3a8d6; font-size: 12px; }
</style></head><body>
  <h1>Listen only</h1>
  <p>The voice with its sound and music, nothing drawn. <a href="${base}./">The live page</a> has the pictures.</p>
  <p class="stamp">Last updated ${esc(built.slice(0, 16).replace("T", " "))} UTC${commit ? ` · ${esc(commit)}` : ""}</p>${
  groups.map(g => section(`Long video ${g.n}`, g.longs) + section(`Long video ${g.n}'s shorts`, g.shorts)).join("")}${section("Shorts on their own", loose)}
</body></html>
`;
}
