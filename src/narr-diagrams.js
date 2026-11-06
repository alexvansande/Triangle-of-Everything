// Full-screen diagrams for the narrated videos, drawn on one canvas under the narration's labels (author's notes on
// long video 2, 2026-11-05). Everything is a function of the take's clock, so a render worker can start anywhere.
//   horizons   two circles: light inside a black hole never gets out, light beyond ours never gets here
//   center     a black hole with a little x on its centre
//   own        a sphere of galaxies floating in 3D; it freezes, an arrow picks one at the edge, the sphere moves to it
//   cosmos     the observable universe as nested shells, the CMB outside (colours by distance, not to scale)
import { iconUrls } from "./assets.js";
import { cmbSphere } from "../tools/powers-of-ten/cmb-sphere.js";

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const rng = (seed) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const text = (ctx, s, x, y, size, color = "#ffe9a3", align = "center") => {
  ctx.font = `700 ${size}px "Barlow Condensed", "Arial Narrow", sans-serif`;
  ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillStyle = color;
  try { ctx.letterSpacing = `${size * 0.08}px`; } catch {}
  ctx.lineWidth = size * 0.16; ctx.strokeStyle = "rgba(0,0,0,0.8)"; ctx.lineJoin = "round";
  String(s).toUpperCase().split("\n").forEach((l, i) => { ctx.strokeText(l, x, y + i * size * 1.15); ctx.fillText(l, x, y + i * size * 1.15); });
};
const arrow = (ctx, x0, y0, x1, y1, color, w) => {
  const a = Math.atan2(y1 - y0, x1 - x0), h = w * 4.5;
  ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - h * 0.6 * Math.cos(a), y1 - h * 0.6 * Math.sin(a)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - h * Math.cos(a - 0.45), y1 - h * Math.sin(a - 0.45)); ctx.lineTo(x1 - h * Math.cos(a + 0.45), y1 - h * Math.sin(a + 0.45)); ctx.fill();
};

// ---------- pictures ----------
const GALAXIES = ["milky-way", "andromeda-m31", "triangulum-m33", "sombrero-m104", "whirlpool", "bodes-galaxy", "cigar-galaxy", "dwarf-galaxy"];
const pics = new Map();
const pic = (slug) => {
  if (!pics.has(slug)) {
    const im = new Image(), url = iconUrls[`../content/icons/${slug}.webp`];
    if (url) { im.src = url; im.decode?.().catch(() => {}); }
    im.__ok = !!url; pics.set(slug, im);
  }
  return pics.get(slug);
};
const picsPending = (slugs) => slugs.map(pic).filter(im => im.__ok && !(im.complete && im.naturalWidth)).length;

// ---------- two circles, two kinds of light ----------
export function drawHorizons(ctx, W, H, o, t) {
  const R = H * 0.25, cy = H * 0.5, LX = W * 0.27, RX = W * 0.73, TAU = Math.PI * 2;
  const ph = (i, n, T) => (t / T + i / n) % 1;
  const dot = (x, y, a, c = "#ffe9a3") => { ctx.globalAlpha = a; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, H * 0.009, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; };
  const tail = (x0, y0, x1, y1, a) => { ctx.globalAlpha = a * 0.55; ctx.strokeStyle = "#ffe9a3"; ctx.lineWidth = H * 0.004; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.globalAlpha = 1; };
  // the black hole: light that tries to leave falls back, the horizon a one-way door inwards
  ctx.fillStyle = "#000"; ctx.strokeStyle = "#ffab40"; ctx.lineWidth = H * 0.005; ctx.beginPath(); ctx.arc(LX, cy, R, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ff8a80"; ctx.beginPath(); ctx.arc(LX, cy, H * 0.008, 0, TAU); ctx.fill();
  for (let i = 0; i < 14; i++) {
    const a = i * 2.399, p = ph(i, 14, 5), f = smooth(p / 0.12) * (1 - smooth((p - 0.9) / 0.1));
    if (i % 2) {   // aimed outwards, from inside: it slows, turns, falls
      const r = R * (0.82 * (1 - p) ** 1.2 + 0.14 * Math.sin(p * Math.PI));
      dot(LX + r * Math.cos(a), cy + r * Math.sin(a), f); tail(LX + r * Math.cos(a), cy + r * Math.sin(a), LX + (r + H * 0.02) * Math.cos(a), cy + (r + H * 0.02) * Math.sin(a), f);
    } else {       // from outside, falling in
      const r = R * (1.55 - 1.5 * p ** 1.3);
      dot(LX + r * Math.cos(a), cy + r * Math.sin(a), f); tail(LX + r * Math.cos(a), cy + r * Math.sin(a), LX + (r + H * 0.03) * Math.cos(a), cy + (r + H * 0.03) * Math.sin(a), f);
    }
  }
  text(ctx, "a black hole\nlight inside never gets out", LX, cy - R - H * 0.12, H * 0.036);
  if (o.right === false) return;
  const fade = o.instant ? 1 : smooth((o.age ?? 9) / 0.8);
  ctx.globalAlpha = fade;
  // our horizon: light from beyond it aims at us and is carried away, light from inside it arrives
  ctx.strokeStyle = "#ffab40"; ctx.lineWidth = H * 0.005; ctx.beginPath(); ctx.arc(RX, cy, R, 0, TAU); ctx.stroke();
  ctx.fillStyle = "#80deea"; ctx.beginPath(); ctx.arc(RX, cy, H * 0.009, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  text(ctx, "us", RX, cy - H * 0.035, H * 0.024, "#80deea");
  for (let i = 0; i < 14; i++) {
    const a = 0.7 + i * 2.399, p = ph(i, 14, 6), f = fade * smooth(p / 0.12) * (1 - smooth((p - 0.88) / 0.12));
    const inside = i % 2 === 0;
    const r = inside ? R * 0.92 * (1 - p ** 1.15) : R * (1.08 + 0.55 * p ** 1.4);   // aimed at us either way
    const x = RX + r * Math.cos(a), y = cy + r * Math.sin(a), q = r + H * 0.024;
    dot(x, y, f); tail(x, y, RX + q * Math.cos(a), cy + q * Math.sin(a), f);
  }
  ctx.globalAlpha = fade; text(ctx, "our universe\nlight beyond never gets here", RX, cy - R - H * 0.12, H * 0.036); ctx.globalAlpha = 1;
}

// ---------- the black hole has a centre ----------
export function drawCenter(ctx, W, H, o) {
  const im = pic(o.slug || "ton-618"), S = H * 1.05, cx = W / 2, cy = H * 0.44, x = H * 0.028, g = smooth((o.age ?? 9 - 1) / 0.6);
  if (im.complete && im.naturalWidth) ctx.drawImage(im, cx - S / 2, cy - S / 2, S, S);
  ctx.globalAlpha = g; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = H * 0.008; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx - x, cy - x); ctx.lineTo(cx + x, cy + x); ctx.moveTo(cx + x, cy - x); ctx.lineTo(cx - x, cy + x); ctx.stroke(); ctx.globalAlpha = 1;
}

// ---------- everyone's own sphere ----------
let _own = null;
const ownField = () => _own || (_own = (() => {
  const r = rng(11), out = [];
  for (let i = 0; i < 150; i++) out.push({ x: (r() - 0.5) * 4.6, y: (r() - 0.5) * 2.4, z: (r() - 0.5) * 2.4, slug: GALAXIES[i % GALAXIES.length], s: 0.45 + r() * 0.75, rot: r() * 6.28 });
  return out;
})());
/** o: { phase: 0 floating, 1 frozen with an arrow on a galaxy at the edge, 2 the sphere moved there, 3 the new galaxies lit;
 *  freezeAt: the take's time it stops; age: seconds since this phase's cue } */
export function drawOwn(ctx, W, H, o, t) {
  const phase = o.phase ?? 0, age = o.age ?? 9, field = ownField(), U = H * 0.33, cy = H * 0.45;
  const th = (o.freezeAt != null ? Math.min(t, o.freezeAt) : t) * 0.05;   // a slow turn about the vertical, until it freezes
  const pts = field.map(g => {
    const c = Math.cos(th), s = Math.sin(th), x = g.x * c - g.z * s, z = g.x * s + g.z * c, k = 3 / (3 - z);
    return { ...g, X: x * k, Y: g.y * k, k };
  });
  // the galaxy at our edge: the one closest to 1.0 of a radius to the right, on the frozen layout
  let edge = pts[0], bd = 9;
  for (const p of pts) { const d = Math.abs(Math.hypot(p.X, p.Y) - 0.94) + Math.abs(p.Y) * 0.8 + (p.X < 0 ? 5 : 0); if (d < bd) { bd = d; edge = p; } }
  // the camera: on us, then panning to that galaxy
  const pan = phase >= 2 ? smooth((phase === 2 ? age : 9) / 2.6) : 0;
  const CX = edge.X * pan, CY = edge.Y * pan, cx = W / 2, sx = (X) => cx + (X - CX) * U, sy = (Y) => cy + (Y - CY) * U;
  const usX = sx(0), usY = sy(0);
  // which galaxies each sphere holds: outside the first one they're dark until the new one reaches them
  for (const p of pts.slice().sort((a, b) => a.k - b.k)) {
    const im = pic(p.slug); if (!(im.complete && im.naturalWidth)) continue;
    const inOurs = Math.hypot(p.X, p.Y) <= 1, inTheirs = Math.hypot(p.X - edge.X, p.Y - edge.Y) <= 1;
    const lit = inOurs ? 1 : inTheirs ? (phase >= 3 ? smooth(age / 1.2) : phase === 2 ? smooth((age - 2) / 1.4) : 0) : 0;
    const alpha = 0.12 + 0.88 * lit, d = H * 0.052 * p.s * p.k * (p === edge && phase >= 1 ? 1.5 : 1);
    ctx.globalAlpha = alpha; ctx.drawImage(im, sx(p.X) - d / 2, sy(p.Y) - d / 2, d, d);
  }
  ctx.globalAlpha = 1;
  const ring = (x, y, col, a, dash) => { ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = H * 0.0055; ctx.setLineDash(dash ? [H * 0.018, H * 0.014] : []); ctx.beginPath(); ctx.arc(x, y, U, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; };
  ring(usX, usY, "#80deea", pan > 0 ? 0.6 : 1, pan > 0);
  ctx.fillStyle = "#80deea"; ctx.beginPath(); ctx.arc(usX, usY, H * 0.009, 0, 6.2832); ctx.fill();
  text(ctx, "us", usX, usY - H * 0.035, H * 0.026, "#80deea");
  if (phase === 1) {
    const f = smooth(age / 0.7), ex = sx(edge.X), ey = sy(edge.Y);
    ctx.globalAlpha = f; arrow(ctx, ex + H * 0.2, ey - H * 0.16, ex + H * 0.045, ey - H * 0.035, "#ffd54f", H * 0.006); ctx.globalAlpha = 1;
    ctx.globalAlpha = f; text(ctx, "a galaxy at our edge", ex + H * 0.21, ey - H * 0.2, H * 0.03, "#ffd54f"); ctx.globalAlpha = 1;
  }
  if (phase >= 2) {
    const f = smooth((phase === 2 ? age - 1.4 : 9) / 1.2), ex = sx(edge.X), ey = sy(edge.Y);
    ring(ex, ey, "#ffd54f", f, false);
    ctx.globalAlpha = f; text(ctx, "their own universe", ex + U * 0.25, ey - U - H * 0.035, H * 0.03, "#ffd54f"); ctx.globalAlpha = 1;
  }
}

// ---------- the universe as nested shells ----------
const TAN = 0.3639702343, FILL = 0.92, DIST = Math.sqrt(1 + 1 / (FILL * TAN) ** 2);
// radii on screen (share of the shell's; distance is compressed, ρ = (d / 46 Gly)^0.6, so the near things show)
const RHO = (gly) => (gly / 46) ** 0.6;
export const COSMOS_RINGS = {
  laniakea: { rho: RHO(0.25), label: "Laniakea", color: "#ffc94d" },
  hubble: { rho: RHO(14), label: "Hubble sphere · 14 billion ly", color: "#ffffff", dash: true },
  horizon: { rho: RHO(16.7), label: "cosmic event horizon · 16 billion ly", color: "#ffab40" },
  galaxies: { rho: RHO(33), label: "the first galaxies", color: "#ffe0b0" },
  dark: { rho: RHO(41), label: "the dark ages: almost nothing", color: "#c9b8a8" },
  cmb: { rho: 1, label: "cosmic microwave background · 46 billion ly", color: "#ff8a65" },
};
let _cosmos = null;
function cosmosData() {
  if (_cosmos) return _cosmos;
  const c = { pts: null, shell: cmbSphere("/powers-of-ten/wmap-ilc-5yr-2k.webp") };
  _cosmos = c;
  fetch(`${import.meta.env.BASE_URL}powers-of-ten/cosmic-web-icon.bin`.replace("//", "/")).then(r => r.arrayBuffer()).then(raw => {
    const v = new DataView(raw), n = raw.byteLength / 8, out = [], r = rng(5);
    let mx = 0;
    for (let i = 0; i < n; i++) { const x = v.getInt16(i * 8, true), y = v.getInt16(i * 8 + 2, true), z = v.getInt16(i * 8 + 4, true); mx = Math.max(mx, Math.hypot(x, y, z)); }
    const COL_NEAR = ["#2979ff", "#00e5ff", "#ff2bd6", "#7c4dff", "#00e676", "#ffffff"];
    const push = (x, y, z, col, size, a) => out.push(x, y, z, size, a, col);
    const flat = [], rho1 = RHO(33);
    for (let i = 0; i < n; i++) {
      let x = v.getInt16(i * 8, true) / mx, y = v.getInt16(i * 8 + 2, true) / mx, z = v.getInt16(i * 8 + 4, true) / mx;
      const w = v.getUint8(i * 8 + 6) / 255, k = v.getUint8(i * 8 + 7) / 255;
      const d = Math.hypot(x, y, z) || 1e-6, rho = Math.max(RHO(0.25) * 1.2, d) * rho1, f = rho / d;
      x *= f; y *= f; z *= f;
      let col, a = 0.28 + 0.6 * Math.max(w, k), size = 0.7 + 1.4 * Math.max(w * 1.2, k);
      if (rho < RHO(16.7)) col = COL_NEAR[Math.floor(r() * COL_NEAR.length)];          // ours: the saturated colours
      else {   // past the horizon: orange, then red towards the first galaxies
        const q = clamp01((rho - RHO(16.7)) / (rho1 - RHO(16.7)));
        col = `rgb(255,${Math.round(165 - 120 * q)},${Math.round(40 - 25 * q)})`; a *= 0.85;
      }
      flat.push([x, y, z, col, size, a]);
    }
    // the first small galaxies, thinning out (the deep fields' look)
    for (let i = 0; i < 1100; i++) {
      const g = () => r() * 2 - 1; let x, y, z, l; do { x = g(); y = g(); z = g(); l = Math.hypot(x, y, z); } while (l > 1 || l < 0.05);
      const rho = RHO(33) + (RHO(38) - RHO(33)) * r() ** 1.6;
      flat.push([x / l * rho, y / l * rho, z / l * rho, r() < 0.5 ? "#ffe9c4" : "#c6d8ff", 0.9 + r(), 0.55]);
    }
    // the dark ages: a few dots
    for (let i = 0; i < 70; i++) {
      const g = () => r() * 2 - 1; let x, y, z, l; do { x = g(); y = g(); z = g(); l = Math.hypot(x, y, z); } while (l > 1 || l < 0.05);
      const rho = RHO(38) + (0.985 - RHO(38)) * r();
      flat.push([x / l * rho, y / l * rho, z / l * rho, "#a89a8f", 0.8, 0.5]);
    }
    // Laniakea, golden: a few strands out of a knot
    for (let s = 0; s < 22; s++) {
      const a = r() * 6.283, b = Math.acos(r() * 2 - 1), dx = Math.sin(b) * Math.cos(a), dy = Math.sin(b) * Math.sin(a), dz = Math.cos(b), bend = (r() - 0.5) * 0.9;
      for (let i = 0; i < 90; i++) {
        const u = r() ** 1.5, rr = RHO(0.25) * 1.15 * u, j = RHO(0.25) * 0.09;
        flat.push([dx * rr + (r() - 0.5) * j + bend * u * dy * rr, dy * rr + (r() - 0.5) * j - bend * u * dx * rr, dz * rr + (r() - 0.5) * j, "#ffc94d", 0.7 + r() * 0.7, 0.8]);
      }
    }
    c.pts = flat;
  }).catch(e => { console.warn("cosmos: no cloud", e); c.pts = []; });
  return c;
}
const work = document.createElement("canvas"), wctx = work.getContext("2d");
/** o: { zoom: [[s, z], …] (s after the cue; the camera sits at the zoom's distance / z: z 1 is the whole CMB in frame, big z inside it, near us),
 *  rings: [[s, key], …], age } */
const RING_ANGLE = { laniakea: -0.5, hubble: -0.95, horizon: -0.55, galaxies: -0.15, dark: 0.2, cmb: -1.05 };
export function drawCosmos(ctx, W, H, o, t) {
  const c = cosmosData(); if (!c.pts) return;
  const Z = o.zoom || [[0, 1]], age = o.age ?? 0;
  let z = Z[0][1];
  for (let i = 0; i < Z.length - 1; i++) if (age > Z[i][0]) { const q = smooth((age - Z[i][0]) / (Z[i + 1][0] - Z[i][0])); z = Math.exp(Math.log(Z[i][1]) + (Math.log(Z[i + 1][1]) - Math.log(Z[i][1])) * q); }
  const D = DIST / z, a = 0.6 + t * 0.045, e = 0.35;
  const n = [Math.cos(a) * Math.cos(e), Math.sin(a) * Math.cos(e), Math.sin(e)];
  const rv = [-Math.sin(a), Math.cos(a), 0], u = [-Math.cos(a) * Math.sin(e), -Math.sin(a) * Math.sin(e), Math.cos(e)];
  const basis = { n, r: rv, u }, cx = W / 2, cy = H / 2, S = H, scale = (S / 2) / TAN;
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  const shellA = smooth((D - 1.15) / 0.7), SS = Math.min(1536, Math.round(S));
  if (work.width !== SS) { work.width = work.height = SS; }
  // the far half of the shell behind everything, the near half barely there, so the shells inside show through
  const shell = (pass, alpha) => { if (shellA <= 0 || !c.shell.ready()) return; wctx.clearRect(0, 0, SS, SS); c.shell.draw(wctx, SS, { dist: D, a: alpha }, basis, pass);
    ctx.globalAlpha = shellA; ctx.drawImage(work, cx - S / 2, cy - S / 2, S, S); ctx.globalAlpha = 1; };
  shell(0, 0.3);
  ctx.globalCompositeOperation = "lighter";
  const px = Math.min(W, H) / 1080 * 1.5;
  for (const p of c.pts) {
    const d = p[0] * n[0] + p[1] * n[1] + p[2] * n[2], w = D - d;
    if (w < 0.03) continue;
    const k = 1 / w, x = cx + (p[0] * rv[0] + p[1] * rv[1] + p[2] * rv[2]) * k * scale, y = cy - (p[0] * u[0] + p[1] * u[1] + p[2] * u[2]) * k * scale;
    if (x < -4 || y < -4 || x > W + 4 || y > H + 4) continue;
    const sz = p[4] * px * Math.min(2.5, Math.sqrt(DIST / w) * 0.8); ctx.globalAlpha = p[5] * 0.55 * smooth((w - 0.03) / 0.12); ctx.fillStyle = p[3]; ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  shell(1, 0.08);
  for (const [s, key] of o.rings || []) {
    const R = COSMOS_RINGS[key]; if (!R || age < s || D <= R.rho * 1.02) continue;
    const rad = R.rho / Math.sqrt(D * D - R.rho * R.rho) * scale;
    if (rad > H * 0.72) continue;
    if (key === "laniakea" && D > 1.3) continue;   // only while it can be told apart
    const f = smooth((age - s) / 0.8);
    ctx.globalAlpha = f * 0.9; ctx.strokeStyle = R.color; ctx.lineWidth = Math.max(1.5, H * 0.002); ctx.setLineDash(R.dash ? [H * 0.012, H * 0.012] : []);
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
    const ang = RING_ANGLE[key] ?? 0;
    ctx.globalAlpha = f; text(ctx, R.label, cx + rad * Math.cos(ang) + H * 0.015, cy + rad * Math.sin(ang), H * 0.027, R.color, "left"); ctx.globalAlpha = 1;
  }
}
export function diagramsPending(kinds) {
  let n = 0;
  if (kinds.own) n += picsPending(GALAXIES);
  if (kinds.center) n += picsPending(["ton-618"]);
  if (kinds.cosmos) { const c = cosmosData(); n += c.pts && c.shell.ready() ? 0 : 1; }
  return n;
}
