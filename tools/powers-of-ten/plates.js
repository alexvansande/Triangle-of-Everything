// tools/powers-of-ten/plates.js — the image pass. The rough frames exported by
// scripts/powers-of-ten-export.mjs are re-rendered in one style and saved in
// video/powers-of-ten/plates/ with a manifest.json (and the real photographs from the
// tree to the globe, scripts/powers-of-ten-photos.py, in video/powers-of-ten/photos/,
// the same way):
//   { "plates": [{ "s": -3.5, "file": "s-03.5.png" }, …] }
// Each plate is a square frame whose width is 10^s metres, centred on the zoom's
// centre. With ?plates=1 they're nested, smallest on top, edges feathered, and
// the drawn layers they replace are hidden.
// the drawn layers the image pass stands in for (DNA up to the Earth)
const BAKED = ["DNA", "chromatin", "veil", "nucleus", "cytoplasm", "amoeba", "drop", "drop shine", "ladybug", "foliage", "crown", "grove", "ground", "forest", "sierra"];

// fadeOut: how many decades past the biggest plate they take to fade. Plates load
// when the zoom comes near their scale and are let go when it's far from it, so only
// a few are held at once (24 full photographs would take ~1.5 GB decoded).
// opts: hides (hide the drawn layers they stand in for; false for overlays),
// single (an overlay: only the plate that just covers the frame, cross-faded with
// the next, so see-through plates don't pile up), fadeIn and fadeOutAt ([from, to] in s), height
// (m: a layer that high above the ground, seen with parallax from a camera
// 1/(2 tan 25°) frame widths up, as for a 50° view: behind the camera until it
// climbs past it, then big and close, settling onto the ground as it climbs on)
export async function platesLayer(enabled, DIR = "/video/powers-of-ten/plates/", fadeOut = 0.4, opts = {}) {
  const { hides = true, single = false, fadeIn = null, height = 0, fadeOutAt = null } = opts;
  const none = { covers: () => new Set(), draw() {} };
  if (!enabled) return none;
  let list;
  try { list = (await (await fetch(DIR + "manifest.json")).json()).plates; } catch { return none; }
  const plates = list.map((p) => ({ s: p.s, src: DIR + p.file, img: null, loading: false })).sort((a, b) => b.s - a.s);
  if (!plates.length) return none;
  const load = (p) => {
    if (p.img || p.loading) return;
    p.loading = true;
    const img = new Image();
    img.onload = () => { p.img = feather(img); p.loading = false; };
    img.onerror = () => { p.loading = false; };
    img.src = p.src;
  };
  const lo = plates[plates.length - 1].s, hi = plates[0].s, all = new Set(BAKED);
  return {
    covers: (s) => (hides && s > lo - 0.4 && s < hi + 0.4 ? all : new Set()),
    draw(cam) {
      for (const p of plates) {
        const side = 10 ** p.s * cam.k;
        if (side >= 1 && side <= 80 * cam.min) load(p); else p.img = null;
      }
      const [f0, f1] = fadeOutAt ?? [hi, hi + fadeOut];
      if (cam.s < lo - 0.4 || cam.s > f1) return;
      let a = 1 - Math.max(0, Math.min(1, (cam.s - f0) / (f1 - f0)));
      if (fadeIn) a *= Math.max(0, Math.min(1, (cam.s - fadeIn[0]) / (fadeIn[1] - fadeIn[0])));
      // the layer's magnification at its height, and gone while it's behind the camera
      let m = 1;
      if (height) {
        const H = cam.F / (2 * Math.tan(25 * Math.PI / 180));
        if (H <= 1.02 * height) return;
        m = H / (H - height);
        a *= Math.max(0, Math.min(1, (H / height - 1.02) / 0.4));
      }
      if (a <= 0.01) return;
      if (single) {
        // the smallest plate that covers the turned frame (its diagonal, cam.W), and
        // the one below it fading in as it comes to cover it too
        const fit = (p) => 10 ** p.s * cam.k * m / cam.W;
        // (or the biggest, once none does: out there the frame's corners are space)
        const i = Math.max(0, plates.findLastIndex((p) => fit(p) >= 1.3));
        const big = plates[i], small = plates[i + 1];
        const f = small ? Math.max(0, Math.min(1, (fit(small) - 0.9) / 0.4)) : 0;
        for (const [p, w] of [[big, 1 - f], [small, f]]) {
          if (!p?.img || w <= 0.01) continue;
          const side = 10 ** p.s * cam.k * m;
          cam.ctx.globalAlpha = a * w;
          cam.ctx.drawImage(p.img, cam.cx - side / 2, cam.cy - side / 2, side, side);
        }
        cam.ctx.globalAlpha = 1;
        return;
      }
      for (const p of plates) {
        const side = 10 ** p.s * cam.k;
        if (!p.img || side < 4 || side > 40 * cam.min) continue;
        cam.ctx.globalAlpha = a;
        cam.ctx.drawImage(p.img, cam.cx - side / 2, cam.cy - side / 2, side, side);
      }
      cam.ctx.globalAlpha = 1;
    },
  };
}

// a round, soft edge, so each plate melts into the one around it
function feather(img) {
  const n = Math.max(img.naturalWidth, img.naturalHeight), c = document.createElement("canvas");
  c.width = c.height = n;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, n, n);
  ctx.globalCompositeOperation = "destination-in";
  const g = ctx.createRadialGradient(n / 2, n / 2, n * 0.36, n / 2, n / 2, n * 0.5);
  g.addColorStop(0, "#000"); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, n, n);
  return c;
}
