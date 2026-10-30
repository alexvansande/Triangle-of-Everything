// public/laniakea/laniakea-core.js — the code-drawn Laniakea, one renderer for the chart's
// still (scripts/laniakea-icon.mjs) and its live picture in the videos (src/laniakea-icons.js).
// 42,986 real galaxies (2MRS) in supergalactic coordinates, each coloured by the attractor it
// flows towards (the powers-of-ten branch's model), linked to its nearest neighbours, drawn as
// light (additive) with a soft glow and the soft round edge of the chart's space pictures.
// Data: galaxies.json beside this file (scripts/laniakea-data.mjs). The look was picked by the
// author in the Laniakea thumb studio (2026-10-30): THUMB.

/** The author's pick: the camera's right and up (supergalactic unit vectors), the centre (the
 *  Great Attractor), the frame's width (Mpc), perspective, the slice shown (Mpc thick) and how far
 *  out (Mpc), and the look. */
export const THUMB = { r: [-0.092, -0.614, -0.784], u: [-0.182, -0.763, 0.62], centre: "ga", pan: [0, 0, 0], span: 214, persp: 0.65,
  slab: 111, radius: 162, palette: "gold-blue", threads: 1.34, dots: 1, dotSize: 1.6, flows: 0.6, glow: 2.04, others: 0.62, round: true };

const PALETTES = {
  "gold-blue": [[255, 196, 90], [120, 160, 255], [120, 160, 255], [120, 160, 255], [120, 160, 255]],
  basins: [[255, 196, 90], [190, 140, 255], [110, 170, 255], [120, 230, 160], [255, 130, 150]],
  only: [[255, 196, 90], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
  white: [[240, 238, 255], [240, 238, 255], [240, 238, 255], [240, 238, 255], [240, 238, 255]],
};

const dec = (s, T) => { const b = Uint8Array.from(atob(s), c => c.charCodeAt(0)); return new T(b.buffer); };
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a) => { const l = Math.hypot(...a); return a.map(v => v / l); };
/** v turned by ang (radians) about the unit axis */
export const rot = (v, axis, ang) => { const c = Math.cos(ang), s = Math.sin(ang), d = dot(axis, v), x = cross(axis, v); return [0, 1, 2].map(i => v[i] * c + x[i] * s + axis[i] * d * (1 - c)); };
/** settings turned by yaw (about their up) and pitch (about their right), radians */
export function turned(S, yaw, pitch) {
  let r = rot(S.r, nrm(S.u), yaw), u = S.u;
  u = rot(u, nrm(r), pitch); r = nrm(r); u = nrm(cross(cross(r, u), r));
  return { ...S, r, u };
}

export async function load(url = new URL("galaxies.json", import.meta.url)) {
  const J = await (await fetch(url)).json();
  const N = J.n, POS = new Float32Array(3 * N), p = dec(J.pos, Int16Array);
  for (let i = 0; i < 3 * N; i++) POS[i] = p[i] / 100;
  const FLOWS = [], F = dec(J.F, Int16Array);
  for (let i = 0; i < F.length;) { const n = F[i], b = F[i + 1]; i += 2; const pts = new Float32Array(3 * n); for (let k = 0; k < 3 * n; k++) pts[k] = F[i + k] / 50; i += 3 * n; FLOWS.push({ b, pts }); }
  const BASIN = dec(J.basin, Uint8Array), LAN = [0, 0, 0];
  let c = 0; for (let j = 0; j < N; j++) if (BASIN[j] === 0) { LAN[0] += POS[3 * j]; LAN[1] += POS[3 * j + 1]; LAN[2] += POS[3 * j + 2]; c++; }
  return { N, POS, BASIN, DEG: dec(J.degree, Uint8Array), LINKS: dec(J.L, Uint16Array), FLOWS, ATT: J.att,
    CENTRES: { ga: J.att[0].p, lan: LAN.map(v => v / c), us: [0, 0, 0] } };
}

const bufs = new WeakMap();
function buf(owner, name, w, h) {
  const m = bufs.get(owner) ?? bufs.set(owner, {}).get(owner);
  const c = m[name] ??= document.createElement("canvas");
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const x = c.getContext("2d"); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = "source-over"; x.clearRect(0, 0, w, h);
  return [c, x];
}

/** Draws Laniakea (settings S, data D) into ctx's W×W px at (x0, y0). Sizes are those of a
 *  1024 px picture, scaled to W. `black`: on black (a still's master); otherwise transparent
 *  light (the live picture over the chart). */
export function render(ctx, W, S, D, { x0 = 0, y0 = 0, black = false } = {}) {
  const { N, POS, BASIN, DEG, LINKS, FLOWS } = D;
  const sc = W / 1024, C0 = D.CENTRES[S.centre], centre = C0.map((v, i) => v + S.pan[i]);
  const r = S.r, u = S.u, n = cross(r, u), k = W / S.span, Dist = S.persp > 0.001 ? S.span * (0.6 + 2.4 * (1 - S.persp)) : Infinity;
  const half = S.slab / 2, R = S.radius, P = PALETTES[S.palette] ?? PALETTES["gold-blue"];
  const basinAlpha = (b) => b === 0 ? 1 : S.palette === "only" ? 0 : S.others;
  const [g, gx] = buf(ctx, "layer", W, W);
  gx.globalCompositeOperation = "lighter";
  const X = new Float32Array(N), Y = new Float32Array(N), A = new Float32Array(N);
  for (let j = 0; j < N; j++) {
    const px = POS[3 * j], py = POS[3 * j + 1], pz = POS[3 * j + 2];
    const dc = Math.hypot(px - C0[0], py - C0[1], pz - C0[2]);
    if (dc > R) continue;
    const qx = px - centre[0], qy = py - centre[1], qz = pz - centre[2];
    const z = qx * n[0] + qy * n[1] + qz * n[2], t = z / half;
    let s = 1;
    if (Dist !== Infinity) { if (z > Dist * 0.9) continue; s = Dist / (Dist - z); }
    X[j] = W / 2 + k * s * (qx * r[0] + qy * r[1] + qz * r[2]);
    Y[j] = W / 2 - k * s * (qx * u[0] + qy * u[1] + qz * u[2]);
    A[j] = Math.exp(-t * t) * Math.min(1, (R - dc) / (0.15 * R));
  }
  // the threads, by basin and four steps of fade
  if (S.threads > 0) {
    gx.lineWidth = 1.1 * sc;
    const paths = P.map(() => [new Path2D(), new Path2D(), new Path2D(), new Path2D()]);
    for (let m = 0; m < LINKS.length; m += 2) {
      const i = LINKS[m], j = LINKS[m + 1], f = Math.min(A[i], A[j]);
      if (f < 0.06) continue;
      const p = paths[BASIN[i]][Math.min(3, (f * 4) | 0)];
      p.moveTo(X[i], Y[i]); p.lineTo(X[j], Y[j]);
    }
    paths.forEach((ps, b) => { const ba = basinAlpha(b); if (ba <= 0) return; const c = P[b]; ps.forEach((p, q) => {
      gx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${Math.min(1, ba * S.threads * 0.32 * (q + 0.5) / 4).toFixed(3)})`; gx.stroke(p); }); });
  }
  // the galaxies: bright where they have neighbours
  if (S.dots > 0) {
    const s = S.dotSize * sc;
    for (let b = 0; b < P.length; b++) {
      const ba = basinAlpha(b); if (ba <= 0) continue;
      gx.fillStyle = `rgb(${P[b][0]},${P[b][1]},${P[b][2]})`;
      for (let j = 0; j < N; j++) {
        if (BASIN[j] !== b || A[j] < 0.04) continue;
        gx.globalAlpha = Math.min(1, ba * S.dots * A[j] * (0.2 + 0.2 * Math.min(4, DEG[j])));
        gx.fillRect(X[j] - s / 2, Y[j] - s / 2, s, s);
      }
    }
    gx.globalAlpha = 1;
  }
  // flow lines, towards the attractors
  if (S.flows > 0) {
    gx.lineWidth = sc;
    for (const f of FLOWS) {
      const ba = basinAlpha(f.b); if (ba <= 0) continue;
      const p0 = f.pts;
      if (Math.hypot(p0[0] - C0[0], p0[1] - C0[1], p0[2] - C0[2]) > R) continue;
      const z0 = (p0[0] - centre[0]) * n[0] + (p0[1] - centre[1]) * n[1] + (p0[2] - centre[2]) * n[2], fa = Math.exp(-((z0 / half) ** 2));
      if (fa < 0.05) continue;
      const c = P[f.b];
      gx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${Math.min(1, 0.07 * S.flows * ba * fa).toFixed(3)})`;
      gx.beginPath();
      for (let i = 0; i < p0.length; i += 3) {
        const qx = p0[i] - centre[0], qy = p0[i + 1] - centre[1], qz = p0[i + 2] - centre[2];
        let s = 1; if (Dist !== Infinity) { const z = qx * n[0] + qy * n[1] + qz * n[2]; if (z > Dist * 0.9) break; s = Dist / (Dist - z); }
        const x = W / 2 + k * s * (qx * r[0] + qy * r[1] + qz * r[2]), y = W / 2 - k * s * (qx * u[0] + qy * u[1] + qz * u[2]);
        i ? gx.lineTo(x, y) : gx.moveTo(x, y);
      }
      gx.stroke();
    }
  }
  // the glow: two blurred copies (a quarter and a sixteenth of the size, scaled back up), laid
  // down as light; then the soft round edge
  const [o, ox] = buf(ctx, "out", W, W);
  if (black) { ox.fillStyle = "#000"; ox.fillRect(0, 0, W, W); }
  ox.globalCompositeOperation = "lighter";
  ox.drawImage(g, 0, 0);
  if (S.glow > 0) {
    const w4 = Math.max(1, W >> 2), w16 = Math.max(1, W >> 4);
    const [q, qx] = buf(ctx, "q", w4, w4), [e, ex] = buf(ctx, "e", w16, w16);
    qx.imageSmoothingQuality = ex.imageSmoothingQuality = ox.imageSmoothingQuality = "high";
    qx.drawImage(g, 0, 0, w4, w4); ex.drawImage(q, 0, 0, w16, w16);
    ox.globalAlpha = Math.min(1, 0.7 * S.glow); ox.drawImage(q, 0, 0, W, W);
    ox.globalAlpha = Math.min(1, 0.9 * S.glow); ox.drawImage(e, 0, 0, W, W);
    if (S.glow > 1.4) { ox.globalAlpha = Math.min(1, (S.glow - 1.4) * 0.8); ox.drawImage(e, 0, 0, W, W); }
  }
  if (S.round) {
    ox.globalCompositeOperation = "destination-in"; ox.globalAlpha = 1;
    const gr = ox.createRadialGradient(W / 2, W / 2, W * 0.36, W / 2, W / 2, W * 0.5);
    gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    ox.fillStyle = gr; ox.fillRect(0, 0, W, W);
  }
  ctx.drawImage(o, x0, y0);
}
