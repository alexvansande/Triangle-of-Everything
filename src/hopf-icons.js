// src/hopf-icons.js
// Live Hopf particle icons. The chart keeps drawing each particle's <image>
// (its still webp, content/icons/<file>.webp, is the fallback); while WebGL2
// works, that image is hidden and the particle is rendered live, animated,
// into one transparent canvas laid over the chart at the image's own box and
// opacity, so reveals, hover growth and zoom all carry over.
// The renderer and particles live in public/hopf/hopf-core.js, shared with
// /hopf.html. ?hopf=0 turns this off.

const OPTS = { drift: true, flow: true, width: 1, bloom: 0.9, exposure: 1.1, core: 0.8 };
const HIDDEN = "hopf-live";

// nucleons: the bigger the icon on screen, the finer the probe
const resolutionAt = px => Math.max(0, Math.min(1, Math.log2(px / 24) / Math.log2(600 / 24)));

export async function startHopfIcons(chartEl) {
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
  style.textContent = `#chart image.${HIDDEN} { visibility: hidden; }`;
  document.head.append(style);
  const overlay = document.createElement("canvas");
  overlay.className = "hopf-overlay";
  overlay.style.cssText = "position:absolute; inset:0; width:100%; height:100%; pointer-events:none;";
  chartEl.append(overlay);
  const ctx = overlay.getContext("2d");
  const selector = Object.keys(CHART_ICONS).map(s => `image.obj-icon[data-slug="${s}"]`).join(",");
  const views = new Map();
  const viewFor = slug => {
    if (!views.has(slug)) {
      const particle = PARTICLES.find(p => p.id === CHART_ICONS[slug].id);
      const view = new HopfView(renderer, null, particle);
      view.yaw = Math.random() * Math.PI * 2;
      views.set(slug, view);
    }
    return views.get(slug);
  };
  const opacityOf = el => {
    let a = 1;
    for (let n = el; n && n !== chartEl; n = n.parentElement) a *= +getComputedStyle(n).opacity;
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

  let time = 0, prev = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - prev) / 1000);
    prev = now;
    time += dt;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const box = chartEl.getBoundingClientRect();
    const w = Math.round(box.width * dpr), h = Math.round(box.height * dpr);
    if (overlay.width !== w || overlay.height !== h) { overlay.width = w; overlay.height = h; }
    ctx.clearRect(0, 0, w, h);
    // the chart clips its pictures to the plot area (#clip); so does the overlay
    const plot = plotRect() ?? box;
    const shown = [];
    for (const img of chartEl.querySelectorAll(selector)) {
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
      view.yaw += dt * 0.12;
      view.update(time, OPTS);
      ctx.globalAlpha = alpha;
      renderer.render(view, OPTS, [ctx, (r.left - box.left) * dpr, (r.top - box.top) * dpr, r.width * dpr, r.height * dpr]);
    }
    ctx.restore();
  }
  requestAnimationFrame(frame);
}
