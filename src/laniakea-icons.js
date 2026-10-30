// src/laniakea-icons.js
// The live Laniakea, in the videos only (the author, 2026-10-30: "for the video we should render it
// as a 3d object with parallax effect like we do with others"). The site's chart shows the still,
// content/icons/laniakea-galaxy-supercluster.webp, drawn from the same galaxies by
// scripts/laniakea-icon.mjs. While a take plays (#narr-layer), Laniakea's <image> on the chart is
// hidden and the real galaxies are drawn live, swaying slowly by the take's clock, into a
// transparent canvas laid over the chart at the image's own box and opacity (so reveals, hover
// growth, dives and zoom carry over). As the camera pans, it turns with its place on screen, a
// parallax as if seen in 3D, as the Hopf particles do (src/hopf-icons.js). The renderer and the
// data live in public/laniakea/. ?laniakea=0 turns this off.

const HIDDEN = "laniakea-live";
const SLUGS = ["laniakea"];
// radians it turns across the whole frame, sideways and up; and a slow sway of its own about the
// view the author picked (so it's never far from it, whenever in a take it shows), ± SWAY over PERIOD s
const TURN_X = 0.9, TURN_Y = 0.45, SWAY = 0.35, PERIOD = 40;
// it draws at least this many px and is scaled down, so its threads and dots keep the still's weight
const MIN_PX = 512;
const inVideo = () => !!document.getElementById("narr-layer");

export async function startLaniakeaIcons(chartEl, { busy = () => false } = {}) {
  if (new URLSearchParams(location.search).get("laniakea") === "0") return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // nothing is fetched until a take plays
  while (!inVideo()) await new Promise(r => setTimeout(r, 500));
  // a render waits for the galaxies (window.__narr.pending), or its first frames would show the still
  window.__laniakeaLoading = true;
  let core, data;
  try {
    core = await import(/* @vite-ignore */ `${import.meta.env.BASE_URL}laniakea/laniakea-core.js`);
    data = await core.load();
  } catch (err) {
    console.warn("Live Laniakea unavailable, keeping the still picture:", err.message);
    return;
  } finally {
    window.__laniakeaLoading = false;
  }
  const style = document.createElement("style");
  style.textContent = `image.${HIDDEN} { visibility: hidden; }`;
  document.head.append(style);
  const overlay = document.createElement("canvas");
  overlay.className = "laniakea-overlay";
  overlay.style.cssText = "position:absolute; inset:0; width:100%; height:100%; pointer-events:none;";
  chartEl.append(overlay);
  const ctx = overlay.getContext("2d");
  const pic = document.createElement("canvas"), pctx = pic.getContext("2d");
  const selector = SLUGS.map(s => `#chart image.obj-icon[data-slug="${s}"]`).join(",");
  const opacityOf = el => {
    let a = 1;
    for (let n = el; n && n !== chartEl && n !== document.body; n = n.parentNode) a *= +getComputedStyle(n).opacity;
    return a;
  };
  const plotRect = () => {
    const rect = chartEl.querySelector("#clip rect"), g = chartEl.querySelector('g[clip-path="url(#clip)"]');
    const m = g?.getScreenCTM();
    if (!rect || !m) return null;
    const x = rect.x.baseVal.value, y = rect.y.baseVal.value;
    const a = new DOMPoint(x, y).matrixTransform(m);
    const b = new DOMPoint(x + rect.width.baseVal.value, y + rect.height.baseVal.value).matrixTransform(m);
    return { left: a.x, top: a.y, right: b.x, bottom: b.y, width: b.x - a.x, height: b.y - a.y };
  };

  let wasVideo = false;
  function draw() {
    if (!inVideo()) {
      if (wasVideo) { for (const img of document.querySelectorAll(`image.${HIDDEN}`)) img.classList.remove(HIDDEN); ctx.clearRect(0, 0, overlay.width, overlay.height); }
      wasVideo = false;
      return;
    }
    wasVideo = true;
    // the take's own clock, so every frame of a render is the same whichever worker draws it
    const t = window.__narr?.now?.() ?? performance.now() / 1000;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const box = chartEl.getBoundingClientRect();
    const w = Math.round(box.width * dpr), h = Math.round(box.height * dpr);
    if (overlay.width !== w || overlay.height !== h) { overlay.width = w; overlay.height = h; }
    ctx.clearRect(0, 0, w, h);
    const plot = plotRect() ?? box;
    ctx.save();
    ctx.beginPath();
    ctx.rect((plot.left - box.left) * dpr, (plot.top - box.top) * dpr, plot.width * dpr, plot.height * dpr);
    ctx.clip();
    for (const img of document.querySelectorAll(selector)) {
      img.classList.add(HIDDEN);
      const r = img.getBoundingClientRect();
      if (r.width < 2 || r.right < plot.left || r.left > plot.right || r.bottom < plot.top || r.top > plot.bottom) continue;
      const alpha = opacityOf(img);
      if (alpha < 0.01) continue;
      // a slow turn of its own, plus the parallax: where it sits across the frame
      const nx = (r.left + r.width / 2 - box.left) / box.width - 0.5, ny = (r.top + r.height / 2 - box.top) / box.height - 0.5;
      const S = core.turned(core.THUMB, SWAY * Math.sin(2 * Math.PI * t / PERIOD) + TURN_X * nx, TURN_Y * ny);
      const px = Math.max(MIN_PX, Math.min(1024, Math.ceil(r.width * dpr / 64) * 64));
      if (pic.width !== px) pic.width = pic.height = px;
      pctx.clearRect(0, 0, px, px);
      core.render(pctx, px, S, data);
      ctx.globalAlpha = alpha;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(pic, (r.left - box.left) * dpr, (r.top - box.top) * dpr, r.width * dpr, r.height * dpr);
    }
    ctx.restore();
  }
  function loop() {
    requestAnimationFrame(loop);
    if (!busy()) draw();
  }
  requestAnimationFrame(loop);
  return { draw };
}
