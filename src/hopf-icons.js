// src/hopf-icons.js
// Live Hopf particle pictures, in the videos only (the author, 2026-10-29: the
// site's chart shows the stills, content/icons/<file>.webp, rendered from the
// same particles by scripts/hopf-icons.mjs). While a take plays (#narr-layer),
// each particle's <image> on the chart, and each picture a scene places (a
// narration `pic`), is hidden and the particle is rendered live, animated by
// the take's clock, into one transparent canvas laid over the chart at the
// image's own box and opacity, so reveals, hover growth and zoom carry over.
// As the camera pans, each turns with its place on screen, a parallax as if
// seen in 3D. The renderer and particles live in public/hopf/hopf-core.js,
// shared with /hopf.html. ?hopf=0 turns this off.

const OPTS = { drift: true, flow: true, width: 1, bloom: 0.9, exposure: 1.1, core: 0.8 };
const HIDDEN = "hopf-live";

// nucleons: the bigger the icon on screen, the finer the probe; the author likes
// the two ends (the ball from afar, the sea up close), so the curve passes
// quickly through the middle (three quarks) instead of lingering there
const resolutionAt = px => {
  const x = Math.max(0, Math.min(1, Math.log2(px / 24) / Math.log2(600 / 24)));
  return x < 0.5 ? 4 * x ** 3 : 1 - 4 * (1 - x) ** 3;
};
// parallax: radians a picture turns across the whole frame, sideways and up
const TURN_X = 0.9, TURN_Y = 0.45;
const seedOf = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 9973; return h / 9973; };
const inVideo = () => !!document.getElementById("narr-layer");

// While the chart has a pan/zoom redraw queued (busy), the loop skips and the
// chart calls draw() right after it redraws: run before it, the icons would
// copy the previous frame's boxes and trail the drag by a frame.
export async function startHopfIcons(chartEl, { busy = () => false } = {}) {
  if (new URLSearchParams(location.search).get("hopf") === "0") return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let core, renderer;
  try {
    core = await import(/* @vite-ignore */ `${import.meta.env.BASE_URL}hopf/hopf-core.js`);
    renderer = new core.Renderer({ alpha: true });
  } catch (err) {
    console.warn("Hopf icons unavailable, keeping still pictures:", err.message);
    return;
  }
  const { PARTICLES, HopfView, CHART_ICONS } = core;
  const style = document.createElement("style");
  style.textContent = `image.${HIDDEN} { visibility: hidden; }`;
  document.head.append(style);
  const overlay = document.createElement("canvas");
  overlay.className = "hopf-overlay";
  overlay.style.cssText = "position:absolute; inset:0; width:100%; height:100%; pointer-events:none;";
  chartEl.append(overlay);
  const ctx = overlay.getContext("2d");
  // the chart's particles, and pictures a scene places anywhere (narration `pic`)
  const selector = [...Object.keys(CHART_ICONS).map(s => `#chart image.obj-icon[data-slug="${s}"]`), "image.narr-pic[data-slug]"].join(",");
  const views = new Map();
  const viewFor = slug => {
    if (!views.has(slug)) {
      const particle = PARTICLES.find(p => p.id === (CHART_ICONS[slug]?.id ?? slug));
      if (!particle) return null;
      const view = new HopfView(renderer, null, particle);
      // the same turn in every render worker (a random one would jump at their joins)
      view.yaw0 = seedOf(slug) * Math.PI * 2;
      view.pitch0 = view.pitch;
      views.set(slug, view);
    }
    return views.get(slug);
  };
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

  let time = 0, prev = performance.now(), wasVideo = false;
  function draw(now = performance.now()) {
    const dt = Math.min(0.1, (now - prev) / 1000);
    prev = now;
    time += dt;
    const video = inVideo();
    if (!video) {
      // the site's chart: the stills (put back any hidden while a take played)
      if (wasVideo) { for (const img of document.querySelectorAll(`image.${HIDDEN}`)) img.classList.remove(HIDDEN); ctx.clearRect(0, 0, overlay.width, overlay.height); }
      wasVideo = false;
      return;
    }
    wasVideo = true;
    // the take's own clock, so every frame of a render is the same whichever worker draws it
    const t = window.__narr?.now?.() ?? time;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const box = chartEl.getBoundingClientRect();
    const w = Math.round(box.width * dpr), h = Math.round(box.height * dpr);
    if (overlay.width !== w || overlay.height !== h) { overlay.width = w; overlay.height = h; }
    ctx.clearRect(0, 0, w, h);
    // the chart clips its pictures to the plot area (#clip); so does the overlay
    const plot = plotRect() ?? box;
    const shown = [];
    for (const img of document.querySelectorAll(selector)) {
      if (!viewFor(img.dataset.slug)) continue;
      img.classList.add(HIDDEN);
      const r = img.getBoundingClientRect();
      if (r.width < 2 || r.right < plot.left || r.left > plot.right || r.bottom < plot.top || r.top > plot.bottom) continue;
      const alpha = opacityOf(img);
      if (alpha < 0.01) continue;
      shown.push({ slug: img.dataset.slug, r, alpha });
    }
    if (!shown.length) return;
    // one render size per frame (the shared targets aren't reallocated per icon), in 64px steps
    const px = Math.min(1024, Math.ceil(Math.max(...shown.map(s => s.r.width * dpr)) / 64) * 64);
    renderer.resize(px);
    ctx.save();
    ctx.beginPath();
    ctx.rect((plot.left - box.left) * dpr, (plot.top - box.top) * dpr, plot.width * dpr, plot.height * dpr);
    ctx.clip();
    for (const { slug, r, alpha } of shown) {
      const view = viewFor(slug);
      if (view.particle.resolution !== undefined) view.res = resolutionAt(r.width);
      // a slow turn of its own, plus the parallax: where it sits across the frame
      const nx = (r.left + r.width / 2 - box.left) / box.width - 0.5, ny = (r.top + r.height / 2 - box.top) / box.height - 0.5;
      view.yaw = view.yaw0 + 0.12 * t + TURN_X * nx;
      view.pitch = view.pitch0 + TURN_Y * ny;
      view.update(t, OPTS);
      ctx.globalAlpha = alpha;
      renderer.render(view, OPTS, [ctx, (r.left - box.left) * dpr, (r.top - box.top) * dpr, r.width * dpr, r.height * dpr]);
    }
    ctx.restore();
  }
  function loop(now) {
    requestAnimationFrame(loop);
    if (!busy()) draw(now);
  }
  requestAnimationFrame(loop);
  return { draw };
}
