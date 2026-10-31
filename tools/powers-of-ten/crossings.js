// tools/powers-of-ten/crossings.js — things near the camera at the boundaries we
// cross (the nuclear envelope, the cell, the dew drop's surface, the canopy, the
// clouds, the Oort cloud, the Milky Way's disc): they sit between us and the
// scene, so they move faster than it. Zooming out they come from behind the
// camera, past the frame's edges, and shrink away towards the centre; zooming in
// they rush outwards past us. Soft and blurred, for the feeling of passing
// through, not as objects to look at. ?crossings=0 leaves them out.
import { ramp, rng } from "./math.js";
import { image } from "./micro.js";

// s: where the boundary is crossed (log10 m); col: rgb; size: a particle's width
// in frame widths at the crossing; n: how many; op: how opaque; kind: blob (soft) or ring (a bubble)
const CROSSINGS = [
  { name: "nuclear envelope", s: -5.0, col: [235, 150, 205], size: 0.22, n: 26, kind: "blob" },
  { name: "the cell", s: -3.4, col: [175, 220, 160], size: 0.16, n: 34, kind: "blob" },
  { name: "the dew drop", s: -2.5, col: [190, 225, 255], size: 0.2, n: 30, kind: "ring" },
  { name: "the canopy", s: 1.6, col: [90, 140, 70], size: 0.35, n: 24, kind: "blob" },
  { name: "the Oort cloud", s: 16.4, col: [205, 222, 255], size: 0.03, n: 60, kind: "blob" },
  { name: "the Milky Way", s: 21.0, col: [255, 238, 215], size: 0.025, n: 70, kind: "blob" },
];
// how much faster than the scene they move: nearer the camera
const NEAR = 2.2;

// and catalogue objects flying past, near where they really are (s: log10 m of the
// frame as we pass them, about their distance from us), for a sense of scale and of
// depth, like the opening of Contact; size: their width in frame widths as they pass
const FLYBYS = [
  // the small world: what shares a dew drop with an amoeba, and what lands on the leaves
  [-6.7, "bacteriophage-t4", "a bacteriophage (T4)", 0.2], [-5.8, "escherichia-coli", "E. coli", 0.22],
  [-5.5, "caulobacter-vibrioides", "Caulobacter", 0.2], [-5.2, "bacteria", "bacteria", 0.24],
  [-4.4, "pollen-grain", "a pollen grain", 0.24], [-3.2, "tardigrade", "a tardigrade", 0.26],
  [11.1, "eros", "433 Eros", 0.16], [11.55, "vesta", "Vesta", 0.2], [11.7, "ceres", "Ceres", 0.22],
  [12.1, "comet-67p", "Comet 67P", 0.14], [12.45, "halleys-comet", "Halley's Comet", 0.2],
  [12.8, "pluto", "Pluto", 0.22], [12.9, "charon", "Charon", 0.13],
  [16.9, "sirius-a", "Sirius", 0.18, true], [17.35, "vega", "Vega", 0.16, true],
  [18.55, "pleiades", "the Pleiades", 0.3, true], [18.7, "betelgeuse", "Betelgeuse", 0.18, true],
  [18.85, "planetary-nebula", "the Helix Nebula", 0.24, true], [19.1, "nebulae", "the Orion Nebula", 0.32, true],
  [19.8, "ngc7635bubble-nebula", "the Bubble Nebula", 0.22, true], [20.3, "globular-cluster", "M13", 0.2, true],
  [23.05, "bodes-galaxy", "Bode's Galaxy", 0.24, true], [23.1, "cigar-galaxy", "the Cigar Galaxy", 0.2, true],
  [23.3, "whirlpool", "the Whirlpool", 0.26, true], [23.45, "sombrero-m104", "the Sombrero", 0.24, true],
  [23.7, "m87", "M87", 0.2, true], [24.4, "perseus-cluster", "the Perseus Cluster", 0.3, true],
  [25.5, "bullet-cluster", "the Bullet Cluster", 0.3, true],
];
const NEAR_FLY = 1.7;

export function crossingsLayer(on) {
  const r = rng(404);
  const sets = CROSSINGS.map((c) => ({
    ...c,
    parts: Array.from({ length: c.n }, () => {
      const lo = c.minRad ?? 0.15, ang = 2 * Math.PI * r(), rad = lo + (1 - lo) * Math.sqrt(r());
      // each at its own depth: crosses a little before or after the others
      return { x: rad * Math.cos(ang), y: rad * Math.sin(ang), ds: (r() - 0.5) * 0.8, sz: 0.5 + r(), a: 0.5 + 0.5 * r(), pick: r(), turn: 2 * Math.PI * r() };
    }),
    imgs: c.files?.map((f) => image(f)),
    sprite: null,
  }));
  const flys = FLYBYS.map(([s, file, name, size, light], i) => {
    // round the frame by the golden angle, so neighbours pass on different sides
    const ang = i * 2.39996 + 0.7, rad = 0.5 + 0.3 * r();
    return { s, name, size, light, img: image(`/content/icons/${file}.webp`), x: rad * Math.cos(ang), y: rad * Math.sin(ang) };
  });
  const sprite = (c) => {
    if (c.sprite) return c.sprite;
    const S = 128, cv = document.createElement("canvas"); cv.width = cv.height = S;
    const g = cv.getContext("2d"), [R, G, B] = c.col, grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    if (c.kind === "ring") {
      grd.addColorStop(0, `rgba(${R},${G},${B},0.05)`); grd.addColorStop(0.7, `rgba(${R},${G},${B},0.12)`);
      grd.addColorStop(0.88, `rgba(255,255,255,0.55)`); grd.addColorStop(1, `rgba(${R},${G},${B},0)`);
    } else {
      grd.addColorStop(0, `rgba(${R},${G},${B},0.7)`); grd.addColorStop(0.4, `rgba(${R},${G},${B},0.35)`); grd.addColorStop(1, `rgba(${R},${G},${B},0)`);
    }
    g.fillStyle = grd; g.fillRect(0, 0, S, S);
    return (c.sprite = cv);
  };
  return {
    name: "crossings", range: [-6.5, 26.5],
    draw(cam) {
      if (!on) return;
      const ctx = cam.ctx, half = cam.min / 2;
      for (const c of sets) {
        if (Math.abs(cam.s - c.s) > 1.6) continue;
        const img = sprite(c);
        for (const p of c.parts) {
          // past the crossing (zooming out) they shrink towards the centre, NEAR times
          // faster than the scene; before it they're behind the camera
          const d = cam.s - (c.s + p.ds);
          const f = 10 ** (-NEAR * d), size = c.size * p.sz * cam.min * f * 3;
          const x = cam.cx + p.x * half * 1.6 * f, y = cam.cy + p.y * half * 1.6 * f;
          let a = (c.op ?? 0.8) * p.a * ramp(d, -0.35, 0) * (1 - ramp(d, 0.35, 0.8)) * ramp(size, 2, 12);
          if (c.clearCentre) a *= ramp(Math.hypot(x - cam.cx, y - cam.cy) / half, 0.45, 0.85);
          if (a <= 0.01 || size < 1) continue;
          ctx.globalAlpha = a;
          if (c.imgs) {
            const im = c.imgs[(p.pick * c.imgs.length) | 0];
            if (!im.complete || !im.naturalWidth) continue;
            ctx.save(); ctx.translate(x, y); ctx.rotate(p.turn);
            ctx.drawImage(im, -size / 2, -size / 2, size, size);
            ctx.restore();
          } else ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
        }
      }
      for (const o of flys) {
        const d = cam.s - o.s;
        if (d < -0.5 || d > 0.95 || !o.img.complete || !o.img.naturalWidth) continue;
        const f = 10 ** (-NEAR_FLY * d), w = o.size * cam.min * f, h = w * o.img.naturalHeight / o.img.naturalWidth;
        const x = cam.cx + o.x * half * 1.7 * f, y = cam.cy + o.y * half * 1.7 * f;
        const a = ramp(d, -0.45, -0.15) * (1 - ramp(d, 0.5, 0.9)) * ramp(w, 3, 14);
        if (a <= 0.01 || x + w < 0 || x - w > cam.W || y + h < 0 || y - h > cam.H) continue;
        ctx.globalAlpha = a;
        if (o.light) ctx.globalCompositeOperation = "lighter";
        ctx.drawImage(o.img, x - w / 2, y - h / 2, w, h);
        ctx.globalCompositeOperation = "source-over";
        cam.labelPx(x, y + h / 2 + 14 * cam.dpr, o.name, a * ramp(w, 30, 60) * (1 - ramp(w, 0.6 * cam.min, 0.9 * cam.min)));
      }
      ctx.globalAlpha = 1;
    },
  };
}
