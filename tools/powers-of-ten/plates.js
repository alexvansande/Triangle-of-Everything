// tools/powers-of-ten/plates.js — the image pass. The rough frames exported by
// scripts/powers-of-ten-export.mjs are re-rendered in one style and saved in
// video/powers-of-ten/plates/ with a manifest.json:
//   { "plates": [{ "s": -3.5, "file": "s-03.5.png" }, …] }
// Each plate is a square frame whose width is 10^s metres, centred on the zoom's
// centre. With ?plates=1 they're nested, smallest on top, edges feathered, and
// the drawn layers they replace are hidden.
const DIR = "/video/powers-of-ten/plates/";
// the drawn layers the image pass stands in for (DNA up to the Earth)
const BAKED = ["DNA", "chromatin", "veil", "nucleus", "cytoplasm", "amoeba", "drop", "drop shine", "ladybug", "foliage", "crown", "grove", "ground", "forest", "sierra"];

export async function platesLayer(enabled) {
  const none = { covers: () => new Set(), draw() {} };
  if (!enabled) return none;
  let list;
  try { list = (await (await fetch(DIR + "manifest.json")).json()).plates; } catch { return none; }
  const plates = (await Promise.all(list.map((p) => new Promise((ok) => {
    const img = new Image();
    img.onload = () => ok({ s: p.s, img: feather(img) });
    img.onerror = () => ok(null);
    img.src = DIR + p.file;
  })))).filter(Boolean).sort((a, b) => b.s - a.s);
  if (!plates.length) return none;
  const lo = plates[plates.length - 1].s, hi = plates[0].s, all = new Set(BAKED);
  return {
    covers: (s) => (s > lo - 0.4 && s < hi + 0.4 ? all : new Set()),
    draw(cam) {
      if (cam.s < lo - 0.4 || cam.s > hi + 0.6) return;
      const a = 1 - Math.max(0, Math.min(1, (cam.s - hi - 0.2) / 0.4));
      for (const p of plates) {
        const side = 10 ** p.s * cam.k;
        if (side < 4 || side > 40 * cam.min) continue;
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
