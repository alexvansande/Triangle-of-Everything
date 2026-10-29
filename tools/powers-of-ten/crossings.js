// tools/powers-of-ten/crossings.js — things near the camera at the boundaries we
// cross (the nuclear envelope, the cell, the dew drop's surface, the canopy, the
// clouds, the Oort cloud, the Milky Way's disc): they sit between us and the
// scene, so they move faster than it. Zooming out they come from behind the
// camera, past the frame's edges, and shrink away towards the centre; zooming in
// they rush outwards past us. Soft and blurred, for the feeling of passing
// through, not as objects to look at. ?crossings=0 leaves them out.
import { ramp, rng } from "./math.js";

// s: where the boundary is crossed (log10 m); col: rgb; size: a particle's width
// in frame widths at the crossing; n: how many; op: how opaque; kind: blob (soft) or ring (a bubble)
const CROSSINGS = [
  { name: "nuclear envelope", s: -5.0, col: [235, 150, 205], size: 0.22, n: 26, kind: "blob" },
  { name: "the cell", s: -3.4, col: [175, 220, 160], size: 0.16, n: 34, kind: "blob" },
  { name: "the dew drop", s: -2.5, col: [190, 225, 255], size: 0.2, n: 30, kind: "ring" },
  { name: "the canopy", s: 1.6, col: [90, 140, 70], size: 0.35, n: 24, kind: "blob" },
  { name: "the clouds", s: 5.6, col: [255, 255, 255], size: 0.5, n: 12, op: 0.45, kind: "blob" },
  { name: "the Oort cloud", s: 16.4, col: [205, 222, 255], size: 0.03, n: 60, kind: "blob" },
  { name: "the Milky Way", s: 21.0, col: [255, 238, 215], size: 0.025, n: 70, kind: "blob" },
];
// how much faster than the scene they move: nearer the camera
const NEAR = 2.2;

export function crossingsLayer(on) {
  const r = rng(404);
  const sets = CROSSINGS.map((c) => ({
    ...c,
    parts: Array.from({ length: c.n }, () => {
      const ang = 2 * Math.PI * r(), rad = 0.15 + 0.85 * Math.sqrt(r());
      // each at its own depth: crosses a little before or after the others
      return { x: rad * Math.cos(ang), y: rad * Math.sin(ang), ds: (r() - 0.5) * 0.8, sz: 0.5 + r(), a: 0.5 + 0.5 * r() };
    }),
    sprite: null,
  }));
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
    name: "crossings", range: [-6.5, 22.5],
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
          const a = (c.op ?? 0.8) * p.a * ramp(d, -0.35, 0) * (1 - ramp(d, 0.35, 0.8)) * ramp(size, 2, 12);
          if (a <= 0.01 || size < 1) continue;
          ctx.globalAlpha = a;
          ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;
    },
  };
}
