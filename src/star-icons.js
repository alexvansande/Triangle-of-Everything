// src/star-icons.js
// The generated stars, in the videos only (the author, 2026-10-31: "add it so the video renderer picks
// it up but not the main site"). The site's chart keeps its pictures. While a take plays
// (#narr-layer), each catalogued star's <image> on the chart, and each picture a scene places (a
// narration `pic`), is hidden and the star is drawn live by the Star Forge engine (src/star-forge.js,
// tuned in tools/star-forge.html): it turns, its cells and spots evolve and it flares, all by the
// take's clock, so every render worker draws the same frame. It goes into one transparent canvas
// laid over the chart, the same way as the live Laniakea and the Hopf particles (src/laniakea-icons.js,
// src/hopf-icons.js): at the picture's own place and opacity, its disc on the old picture's disc
// (src/star-body-frames.json), so reveals, hover growth, dives, zoom and the stars' wall lights carry
// over. As the camera pans it turns a little with its place on screen, a parallax as if seen in 3D.
// The brown dwarfs keep their pictures. ?stars=0 turns this off.

import { STARS, createStarForge, discFraction } from "./star-forge.js";
import { STAR_BODY_FRAMES } from "./star-light.js";

const HIDDEN = "star-live";
// parallax: radians a star turns across the whole frame, sideways and up (gentler than the
// particles': a sphere's turn shows plainly)
const TURN_X = 0.6, TURN_Y = 0.3;
const inVideo = () => !!document.getElementById("narr-layer");
const BY_SLUG = new Map(STARS.map(s => [s.slug, s]));

// a live star's disc, limb and glow reach past its picture's box: the labels keep clear of this much
// (the author, 2026-11-03: "…ite Dwarfs", "…ontal Branch" cut by the stars in long video 1)
export const LIVE_STAR_REACH = 1.25;
export const isLiveStar = slug => BY_SLUG.has(slug) && inVideo();
export async function startStarIcons(chartEl, { busy = () => false } = {}) {
  if (new URLSearchParams(location.search).get("stars") === "0") return;
  // nothing is set up until a take plays
  while (!inVideo()) await new Promise(r => setTimeout(r, 500));
  let forge;
  try {
    forge = createStarForge();
  } catch (err) {
    console.warn("Live stars unavailable, keeping the pictures:", err.message);
    return;
  }
  const style = document.createElement("style");
  style.textContent = `image.${HIDDEN} { visibility: hidden; }`;
  document.head.append(style);
  const overlay = document.createElement("canvas");
  overlay.className = "star-overlay";
  overlay.style.cssText = "position:absolute; inset:0; width:100%; height:100%; pointer-events:none;";
  chartEl.append(overlay);
  const ctx = overlay.getContext("2d");
  // the chart's stars, pictures a scene places (narration `pic`), and catalogue dots shown as a star's
  // picture (dust.js: no slug of their own, so read off the picture's file)
  const selector = [...[...BY_SLUG.keys()].map(s => `#chart image.obj-icon[data-slug="${s}"]`), "image.narr-pic[data-slug]", "#chart image.dn-icon"].join(",");
  const SLUG_RE = new RegExp(`^(${[...BY_SLUG.keys()].join("|")})(-[A-Za-z0-9_]{6,10})?$`);
  const slugOf = img => {
    if (img.dataset.slug) return img.dataset.slug;
    const file = (img.getAttribute("href") || "").split(/[?#]/)[0].split("/").pop().replace(/\.\w+$/, "");
    return SLUG_RE.exec(file)?.[1] ?? null;
  };
  // each catalogue dot its own pattern (the same in every worker: from its place in the data)
  const seedOf = img => img.classList.contains("dn-icon") ? 1 + ((+img.parentNode?.__data__?.i || 0) % 97) * 0.731 : 0;
  const opacityOf = el => {
    let a = 1;
    for (let n = el; n && n !== chartEl && n !== document.body; n = n.parentNode) a *= +getComputedStyle(n).opacity;
    return a;
  };
  // #clip's rect lives in <defs> (no box of its own): map it through the clipped group
  const plotRect = () => {
    const rect = chartEl.querySelector("#clip rect"), g = chartEl.querySelector('g[clip-path="url(#clip)"]');
    const m = g?.getScreenCTM();
    if (!rect || !m) return null;
    const x = rect.x.baseVal.value, y = rect.y.baseVal.value;
    const a = new DOMPoint(x, y).matrixTransform(m);
    const b = new DOMPoint(x + rect.width.baseVal.value, y + rect.height.baseVal.value).matrixTransform(m);
    return { left: a.x, top: a.y, right: b.x, bottom: b.y, width: b.x - a.x, height: b.y - a.y };
  };

  let wasVideo = false, blankFrames = 0, warned = false;
  function draw() {
    if (!inVideo()) {
      // the site's chart: the pictures (put back any hidden while a take played)
      if (wasVideo) { for (const img of document.querySelectorAll(`image.${HIDDEN}`)) img.classList.remove(HIDDEN); ctx.clearRect(0, 0, overlay.width, overlay.height); }
      wasVideo = false;
      return;
    }
    wasVideo = true;
    // the take's own clock, so every frame of a render is the same whichever worker draws it; held to
    // the video's frame (30 fps), so a render's motion-blur sub-frames, centred on it, share one
    // surface: the boiling cells were smeared across the shutter, softer than the pictures beside
    // them (the author, 2026-11-03). Their place still follows the camera, blur and all.
    const t = Math.round((window.__narr?.now?.() ?? performance.now() / 1000) * 30) / 30;
    const dpr = devicePixelRatio || 1;
    const box = chartEl.getBoundingClientRect();
    const w = Math.round(box.width * dpr), h = Math.round(box.height * dpr);
    if (overlay.width !== w || overlay.height !== h) { overlay.width = w; overlay.height = h; }
    ctx.clearRect(0, 0, w, h);
    const plot = plotRect() ?? box;
    ctx.save();
    ctx.beginPath();
    ctx.rect((plot.left - box.left) * dpr, (plot.top - box.top) * dpr, plot.width * dpr, plot.height * dpr);
    ctx.clip();
    // the GL context gone (see createStarForge): the pictures show until it is back, rather than
    // a hidden picture with nothing in its place (the render of 2026-11-08: glows with no stars)
    const down = forge.lost();
    if (down) blankFrames++;
    for (const img of document.querySelectorAll(selector)) {
      const star = BY_SLUG.get(slugOf(img));
      if (!star) continue;
      if (down) { img.classList.remove(HIDDEN); continue; }
      const r = img.getBoundingClientRect();
      if (r.width < 2) { img.classList.remove(HIDDEN); continue; }
      img.classList.add(HIDDEN);
      // the old picture's disc (centre and radius, as fractions of its box); the star's disc goes there,
      // its atmosphere and halo spilling round it (Vega's frame is its polar radius: it's flattened)
      const f = STAR_BODY_FRAMES[star.slug] ?? { cx: 0.5, cy: 0.5, r: 0.45 };
      const disc = f.r * r.width / (1 - (star.oblate || 0));
      const size = 2 * disc / discFraction(star);
      const cx = r.left + f.cx * r.width, cy = r.top + f.cy * r.height;
      if (cx + size / 2 < plot.left || cx - size / 2 > plot.right || cy + size / 2 < plot.top || cy - size / 2 > plot.bottom) continue;
      const alpha = opacityOf(img);
      if (alpha < 0.01) continue;
      // a parallax: where it sits across the frame
      const nx = (cx - box.left) / box.width - 0.5, ny = (cy - box.top) / box.height - 0.5;
      const px = Math.max(128, Math.min(1024, Math.ceil(size * dpr / 64) * 64));
      try {
        if (!forge.render(star, t, px, { view: [TURN_X * nx, TURN_Y * ny], alpha: true, seed: seedOf(img) })) { img.classList.remove(HIDDEN); continue; }
        ctx.globalAlpha = alpha;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(forge.canvas, 0, forge.canvas.height - px, px, px,
          (cx - size / 2 - box.left) * dpr, (cy - size / 2 - box.top) * dpr, size * dpr, size * dpr);
      } catch (err) {
        // one star's draw failing must not leave the ones after it hidden and undrawn
        img.classList.remove(HIDDEN);
        if (!warned) { warned = true; console.warn(`Live star ${star.slug} could not be drawn, its picture kept:`, err.message); }
      }
    }
    ctx.restore();
  }
  function loop() {
    requestAnimationFrame(loop);
    if (!busy()) draw();
  }
  requestAnimationFrame(loop);
  // status for the renderer (scripts/narration-render.mjs prints it at the end of a worker's range):
  // how often the context was lost and how many frames showed the pictures instead
  return { draw, status: () => ({ lost: forge.losses(), blankFrames, down: forge.lost() }) };
}
