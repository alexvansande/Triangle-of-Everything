// Full-screen diagrams for the narrated videos, drawn on one canvas under the narration's labels (author's notes on
// long video 2, 2026-11-05). Everything is a function of the take's clock, so a render worker can start anywhere.
//   horizons   two circles: light inside a black hole never gets out, light beyond ours never gets here
//   center     a black hole with a little x on its centre
//   own        a sphere of galaxies floating in 3D; it freezes, an arrow picks one at the edge, the sphere moves to it
//   cosmos     the observable universe as nested shells, the CMB outside (colours by distance, not to scale)
import { iconUrls } from "./assets.js";
import { cmbSphere } from "../tools/powers-of-ten/cmb-sphere.js";
import { cmbObject, HORIZON } from "./cmb-object.js";
import { eventHorizonObject } from "./event-horizon-object.js";
import { createSqueeze, defaults as squeezeDefaults, DT as SQUEEZE_DT, SHORT as SQUEEZE_SHORT, LONG as SQUEEZE_LONG } from "./squeeze-sim.js";

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
// the chart's own particles (the author, 2026-11-07: "the proton isn't a red dot, we have a nice image of it"):
// drawn centred at (x, y), `d` wide; a dot of the given colour until the picture has arrived
const PARTICLES = ["proton", "neutron", "electron"];
// each one turned its own way (`rot`, radians: the author, 2026-11-08, "not all identical as if we were pasting
// the same image"), and a few per cent bigger or smaller, so a crowd of them reads as many, not one stamp
// the proton with its aberration turned up (the author, 2026-11-08, so it stands apart from the neutron): the picture's
// red, green and blue drawn at three sizes (red largest, blue smallest) and added, the way a cheap lens splits colours
let _protonStrong = null;
function protonStrong() {
  const im = pic("proton");
  if (!(im.complete && im.naturalWidth)) return null;
  if (_protonStrong) return _protonStrong;
  const S = 512, cv = document.createElement("canvas"); cv.width = cv.height = S;
  const g = cv.getContext("2d"), tmp = document.createElement("canvas"); tmp.width = tmp.height = S; const tg = tmp.getContext("2d");
  for (const [col, k] of [["#ff0000", 1.14], ["#00ff00", 1.0], ["#0000ff", 0.86]]) {
    const s = S * 0.84 * k, o = (S - s) / 2;
    tg.globalCompositeOperation = "source-over"; tg.clearRect(0, 0, S, S); tg.drawImage(im, o, o, s, s);
    tg.globalCompositeOperation = "multiply"; tg.fillStyle = col; tg.fillRect(0, 0, S, S);
    tg.globalCompositeOperation = "destination-in"; tg.drawImage(im, o, o, s, s);
    g.globalCompositeOperation = "lighter"; g.drawImage(tmp, 0, 0);
  }
  return (_protonStrong = cv);
}
const particle = (ctx, slug, x, y, d, alpha = 1, fallback = "#ff8a80", rot = 0, scale = 1) => {
  const im = slug === "proton" ? (protonStrong() || pic(slug)) : pic(slug);
  ctx.globalAlpha = alpha;
  if (im instanceof HTMLCanvasElement) {
    const s = d * scale * 1.19;   // the sprite's own margin
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(im, -s / 2, -s / 2, s, s); ctx.restore();
  } else if (im.complete && im.naturalWidth) {
    const s = d * scale;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(im, -s / 2, -s / 2, s, s); ctx.restore();
  } else { ctx.fillStyle = fallback; ctx.beginPath(); ctx.arc(x, y, d * 0.3, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 1;
};
// a particle's own turn and size, from its key: steady, so it doesn't flicker between frames
const spin = (k) => unit2(k, 7) * Math.PI * 2, sizeOf = (k) => 0.92 + 0.16 * unit2(k, 8);
// the outline of circles merging like soap bubbles (the author, 2026-11-08: "once the two circles touch they should make
// a sort of guitar shape, like two circles kissing, and then hug the nuclei into one"): a metaball contour, found along
// rays from the circles' centroid; apart, each circle stands alone at its own radius, and as they come within reach a
// neck forms and thickens until the two are one. Returns the points, or null if the circles are still separate.
const BLOB_T = 1.6;
function blobPath(circles, n = 120) {
  const F = (x, y) => circles.reduce((s, c) => s + (c.r * c.r * BLOB_T) / Math.max(1e-6, (x - c.x) ** 2 + (y - c.y) ** 2), 0);
  const W = circles.reduce((s, c) => s + c.r, 0), cx = circles.reduce((s, c) => s + c.x * c.r, 0) / W, cy = circles.reduce((s, c) => s + c.y * c.r, 0) / W;
  if (F(cx, cy) < BLOB_T) return null;                   // not touching yet
  const far = circles.reduce((m, c) => Math.max(m, Math.hypot(c.x - cx, c.y - cy) + c.r * 2), 0);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, ux = Math.cos(a), uy = Math.sin(a);
    let lo = 0, hi = far;
    for (let k = 0; k < 22; k++) { const mid = (lo + hi) / 2; if (F(cx + ux * mid, cy + uy * mid) >= BLOB_T) lo = mid; else hi = mid; }
    pts.push([cx + ux * lo, cy + uy * lo]);
  }
  return pts;
}
const strokePath = (ctx, pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.stroke(); };
// the author's sketch of the strong force merging two nuclei (2026-11-08): the joined bubble squeezes into a tall ellipse
// as the energy flares out, then relaxes, ringing, into one round circle. `squash(a)` is how far the outline is pinched
// `a` seconds after the join is complete: positive narrows it sideways and stretches it up, then it swings back and settles.
const squash = (a) => a <= 0 ? 0 : 0.42 * Math.exp(-a * 1.7) * Math.sin(a * 4.5);
// the pinched outline and its flare, drawn in the current stroke style
const squashedCircle = (ctx, x, y, r, q, U, color) => {
  ctx.beginPath(); ctx.ellipse(x, y, r * (1 - q), r * (1 + q), 0, 0, Math.PI * 2); ctx.stroke();
  if (q > 0.12) {   // the flare: short rays out from the squeezed bubble, strongest at the pinch
    const f = Math.min(1, q / 0.42); ctx.save(); ctx.setLineDash([]); ctx.globalAlpha *= f; ctx.strokeStyle = color; ctx.lineWidth = U * 0.003;
    for (let i = 0; i < 14; i++) { const a = i * Math.PI * 2 / 14 + 0.2, r0 = r * (1.25 + 0.1 * (i % 2)), r1 = r0 + U * 0.07 * f * (0.7 + 0.3 * ((i * 7) % 3) / 2); ctx.beginPath(); ctx.moveTo(x + r0 * Math.cos(a), y + r0 * Math.sin(a)); ctx.lineTo(x + r1 * Math.cos(a), y + r1 * Math.sin(a)); ctx.stroke(); }
    ctx.restore();
  }
};
// a stable 0..1 from a pair of integers (for an atom's own offset, drift and timing)
const unit2 = (k, j) => { let h = (k * 374761393 + j * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

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
  if (kinds.particles) n += picsPending(PARTICLES);
  if (kinds.own) n += picsPending(GALAXIES);
  if (kinds.center) n += picsPending(["ton-618"]);
  if (kinds.cosmos) { const c = cosmosData(); n += c.pts && c.shell.ready() ? 0 : 1; }
  return n;
}

// an arrow pushing in from the frame's edge at angle a (the frame inset a little), `len` long
const edgeArrow = (ctx, W, H, a, len, pad, color, w, push = 0) => {
  const cx = W / 2, cy = H / 2, c = Math.cos(a), s = Math.sin(a);
  const m = Math.min(Math.abs((W / 2 - pad) / (c || 1e-9)), Math.abs((H / 2 - pad) / (s || 1e-9)));
  arrow(ctx, cx + m * c, cy + m * s, cx + (m - len + push) * c, cy + (m - len + push) * s, color, w);
};

// ---------- the atoms crushed: the electron shells pop (the author's design, 2026-11-07) ----------
// A hydrogen atom in the middle, its electron cloud cut open to a glowing blue circle (the faint back of the shell
// behind it), the proton at its centre, blue arrows pushing out ("electric repulsion"); the same atoms crowd it on every
// side, and red arrows at the margins push in ("gravity · core pressure"). The crowd is squeezed until the shells pop:
// the electrons fly free and the bare nuclei sit closer, but not too close. Phases, absolute take times from the cues
// (src/narration.js): start, pop, sea, hold.
export function drawCrush(ctx, W, H, o, t) {
  const TAU = Math.PI * 2, U = Math.min(W, H), cx = W / 2, cy = H / 2;
  const start = o.start ?? t, pop = o.pop ?? start + 7, u = t - start;
  const sq = smooth(u / Math.max(1, pop - start - 0.4));             // the squeeze, 0 → 1 by the pop
  const popped = t >= pop, pa = popped ? t - pop : 0;
  const R0 = U * 0.085, R = R0 * (1 - 0.28 * sq);                      // the shell, pressed smaller
  const L = (popped ? R0 * 2 * 0.72 - smooth(pa / 2.2) * R0 * 0.55 : R0 * 2.4 - sq * (R0 * 2.4 - R0 * 2 * 0.72));   // the spacing
  const jit = (k, s = 1) => Math.sin(t * (1.3 + k % 5 * 0.21) + k * 2.1) * s;
  // a liquid, not a crystal (the author, 2026-11-07): every atom sits off its lattice point by its own amount, a few
  // nearly on it (a patch of local order), most well off, and the whole crowd drifts slowly; only after the pop, as
  // the bare nuclei are packed tighter, do the offsets shrink away and the crowd snaps into the hexagonal packing
  const snap = popped ? smooth((pa - 1.4) / 2.2) : 0;
  const atoms = [], JM = Math.ceil(H / 2 / (L * 0.866)) + 2, IM = Math.ceil(W / 2 / L) + 2;   // enough rows and columns to fill the frame at this spacing
  for (let j = -JM; j <= JM; j++) for (let i = -IM; i <= IM; i++) {
    const k = (i + 40) * 97 + (j + 40), u1 = unit2(k, 1), u2 = unit2(k, 2), u3 = unit2(k, 3);
    const amp = L * 0.3 * (u2 < 0.3 ? 0.12 : 0.45 + 0.55 * u3) * (1 - snap), ang = u1 * TAU + 0.35 * Math.sin(t * 0.35 + k);
    const x = cx + (i + (j & 1 ? 0.5 : 0)) * L + amp * Math.cos(ang), y = cy + j * L * 0.866 + amp * Math.sin(ang);
    if (x < -R0 || x > W + R0 || y < -R0 || y > H + R0) continue;
    atoms.push({ x, y, k, c: i === 0 && j === 0 });
  }
  // shells (before the pop) and their popping rings
  const shellA = popped ? 1 - smooth(pa / 0.35) : 1;
  for (const a of atoms) {
    const x = a.x + (popped ? 0 : jit(a.k, U * 0.003)), y = a.y;
    if (shellA > 0) {
      ctx.globalAlpha = shellA * (a.c ? 0.18 : 0.1); ctx.fillStyle = "#4fc3f7"; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();   // the back of the cloud
      ctx.globalAlpha = shellA * (a.c ? 1 : 0.55); ctx.strokeStyle = "#4fc3f7"; ctx.lineWidth = U * (a.c ? 0.006 : 0.004);
      ctx.shadowColor = "#4fc3f7"; ctx.shadowBlur = U * 0.02; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.stroke(); ctx.shadowBlur = 0;
    }
    if (popped && pa < 0.7) {   // the pop: a ring flying out and fading
      const f = pa / 0.7; ctx.globalAlpha = (1 - f) * 0.8; ctx.strokeStyle = "#e1f5fe"; ctx.lineWidth = U * 0.003;
      ctx.beginPath(); ctx.arc(x, y, R * (1 + 0.9 * f), 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  // the nuclei: the chart's proton (hydrogen's nucleus is one), the centre one a little bigger
  for (const a of atoms) particle(ctx, "proton", a.x, a.y, U * (a.c ? 0.04 : 0.03), 1, "#ff8a80", spin(a.k), sizeOf(a.k));   // small (the author's recap: the protons grow from one animation to the next)
  // the electrons: three a shell, flying out at the pop, then roaming between the nuclei
  if (popped) {
    for (const a of atoms) for (let e = 0; e < 3; e++) {
      const ang = a.k * 0.7 + e * 2.094, fly = smooth(pa / 1.1) * R0 * 1.3;
      const wx = Math.sin(t * 1.7 + a.k + e * 2) * R0 * 0.45 * smooth(pa / 1.5), wy = Math.cos(t * 1.3 + a.k * 0.5 + e) * R0 * 0.45 * smooth(pa / 1.5);
      particle(ctx, "electron", a.x + Math.cos(ang) * fly + wx, a.y + Math.sin(ang) * fly + wy, U * 0.016, 0.95, "#b3e5fc", spin(a.k * 3 + e) + t * 0.8);
    }
  }
  // the central atom's push, outwards, and gravity's push from the margins
  const blueA = popped ? 1 - smooth(pa / 0.5) : smooth(u / 0.8);
  if (blueA > 0) {
    ctx.globalAlpha = blueA;
    for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + 0.3, r0 = R + U * 0.012, r1 = R + U * 0.07 * (1 - 0.35 * sq); arrow(ctx, cx + r0 * Math.cos(a), cy + r0 * Math.sin(a), cx + r1 * Math.cos(a), cy + r1 * Math.sin(a), "#4fc3f7", U * 0.005); }
    text(ctx, "electric repulsion", cx, cy - R - U * 0.12, U * 0.03, "#4fc3f7");
    ctx.globalAlpha = 1;
  }
  const redA = smooth((u - 1.2) / 0.8) * (popped ? 1 - smooth((pa - 1.5) / 1) : 1), push = U * 0.015 * Math.sin(t * 5);
  if (redA > 0) {
    ctx.globalAlpha = redA;
    for (let i = 0; i < 8; i++) edgeArrow(ctx, W, H, i * TAU / 8 + TAU / 16, U * 0.11, U * 0.03, "#ff6b5e", U * 0.009, push);
    text(ctx, "gravity · core pressure", cx, H * 0.16, U * 0.034, "#ff8a80");
    ctx.globalAlpha = 1;
  }
  if (popped) {
    const f = smooth((pa - 0.8) / 0.8); ctx.globalAlpha = f;
    text(ctx, o.phase === "hold" ? "the free electrons hold it up" : "free electrons · bare nuclei", cx, H * 0.78, U * 0.034, "#ffe9a3");
    ctx.globalAlpha = 1;
  }
}

// ---------- fusion: the strong force grabs two protons (the author's design, 2026-11-07) ----------
// Where the crushed atoms left off: bare protons floating. The one in the middle wears a dotted yellow circle with thick
// arrows pulling inwards: the strong force, reaching only that far. Outside it, thinner blue arrows push out (the electric
// repulsion), and red arrows at the margins push in (pressure). The protons are squeezed closer until two yellow circles
// touch and merge into one holding both; the energy comes out as a burst of tiny photons, a wave from the side and a
// point head-on, that flies outwards and pushes the other protons apart. Phases, absolute take times from the cues:
// start, range, squeeze, merge, helium, burst, push.
export function drawFuse(ctx, W, H, o, t) {
  const TAU = Math.PI * 2, U = Math.min(W, H), cx = W / 2, cy = H / 2;
  const start = o.start ?? t, sqz = o.squeeze ?? start + 8, mrg = o.merge ?? sqz + 5, brs = o.burst ?? mrg + 5, psh = o.push ?? brs + 2.5;
  const u = t - start, Y = U * 0.13;                                    // the strong force's reach (a closer view: the author, 2026-11-08)
  const sq = t < sqz ? 0 : smooth((t - sqz) / Math.max(1.5, mrg - sqz - 0.3));
  const merged = t >= mrg, ma = merged ? t - mrg : 0, mf = smooth(ma / 0.9);
  const burst = t >= brs, ba = burst ? t - brs : 0;
  const spread = burst ? smooth((ba - 0.6) / 2.6) : 0;                  // the others pushed apart by the light
  const L0 = Y * 2.6, L = (L0 - sq * (L0 - Y * 2.02)) * (1 + 0.45 * spread);
  const jit = (k, s) => Math.sin(t * (1.1 + k % 4 * 0.23) + k * 1.9) * s;
  // the protons on a loose lattice; the partner is the one to the right of the centre
  // a loose crowd with patches of order, not a rigid lattice (the author's recap, 2026-11-08): each proton off its
  // point by its own amount, a third of them nearly on it; the pair in the middle sits on its points
  const ps = [], JM = Math.ceil(H / 2 / (L * 0.866)) + 2, IM = Math.ceil(W / 2 / L) + 2;
  for (let j = -JM; j <= JM; j++) for (let i = -IM; i <= IM; i++) {
    const k = (i + 40) * 97 + (j + 40), four = (i === 0 && j === 0) || (i === 1 && j === 0) || (i === 0 && (j === 1 || j === -1));
    const u1 = unit2(k, 1), u2 = unit2(k, 2), u3 = unit2(k, 3);
    const amp = four ? 0 : L * 0.22 * (u2 < 0.35 ? 0.1 : 0.4 + 0.6 * u3), ang = u1 * TAU + 0.3 * Math.sin(t * 0.3 + k);
    const x = cx + (i + (j & 1 ? 0.5 : 0)) * L + amp * Math.cos(ang), y = cy + j * L * 0.866 + amp * Math.sin(ang);
    if (x < -Y || x > W + Y || y < -Y || y > H + Y) continue;
    ps.push({ x, y, k, c: i === 0 && j === 0, p: i === 1 && j === 0, q: i === 0 && j === 1, s: i === 0 && j === -1 });
  }
  // four hydrogens into one helium (the author, 2026-11-08): the centre proton and its right-hand neighbour join first;
  // the weak force turns one of them into a neutron (deuterium); then the two above and below join, and one of those
  // turns too: two protons and two neutrons in one circle. Each change a flash and a neutrino away.
  const C = ps.find(a => a.c), P = ps.find(a => a.p), Q = ps.find(a => a.q), Sx = ps.find(a => a.s);
  const hel = o.helium ?? mrg + 2.5, hf = t < hel ? 0 : smooth((t - hel) / 0.9);
  const TN1 = mrg + 1.2, TN2 = hel + 1.2;                                 // when a proton becomes a neutron
  if (C && P) {
    const mx = (C.x + P.x) / 2, my = C.y, R4 = Y * 0.28;                  // the cluster: a small diamond round its centre
    const to = (a, tx, ty, f) => { a.x += (tx - a.x) * f; a.y += (ty - a.y) * f; };
    to(C, mx - R4, my, mf); to(P, mx + R4, my, mf);
    if (Q) to(Q, mx, my - R4 * 1.05, hf); if (Sx) to(Sx, mx, my + R4 * 1.05, hf);
  }
  const dotted = (x, y, rad, a, w = U * 0.0055) => { ctx.globalAlpha = a; ctx.strokeStyle = "#ffd54f"; ctx.lineWidth = w; ctx.setLineDash([U * 0.014, U * 0.011]); ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; };
  // every proton has a faint reach; the centre's is bright, the partner's shows as it comes close
  for (const a of ps) {
    const x = a.x + (merged ? 0 : jit(a.k, U * 0.004)), y = a.y;
    if (a.c || a.p) continue;
    dotted(x, y, Y, 0.22, U * 0.003);
  }
  if (C && P) {
    // the reach circles: apart, dotted circles; as they come within reach, one bubble outline with a neck that
    // thickens until it's one circle round the cluster (the author, 2026-11-08); the two newcomers' circles join it
    const members = [{ x: C.x, y: C.y, r: Y }, { x: P.x, y: P.y, r: Y }, ...(hf > 0 ? [Q, Sx].filter(Boolean).map(a => ({ x: a.x, y: a.y, r: Y })) : [])];
    const blob = blobPath(members);
    ctx.strokeStyle = "#ffd54f"; ctx.lineWidth = U * 0.0065; ctx.setLineDash([U * 0.014, U * 0.011]);
    // once a join is complete the bubble is one circle: it squeezes tall and flares, then settles (the author's sketch)
    const qz = (mf >= 1 && !(hf > 0 && hf < 1)) ? squash(ma - 0.9) + (hf >= 1 ? squash(t - hel - 0.9) : 0) : 0;
    if (mf >= 1 && !(hf > 0 && hf < 1)) { ctx.globalAlpha = 1; ctx.shadowColor = "#ffd54f"; ctx.shadowBlur = U * 0.02; squashedCircle(ctx, (C.x + P.x) / 2, C.y, Y * 1.05, qz, U, "#ffe9a3"); ctx.shadowBlur = 0; }
    else if (blob) { ctx.globalAlpha = 1; ctx.shadowColor = "#ffd54f"; ctx.shadowBlur = merged ? U * 0.02 : 0; strokePath(ctx, blob); ctx.shadowBlur = 0; }
    else { dotted(C.x, C.y, Y, 1); dotted(P.x, P.y, Y, Math.max(0.25, sq)); }
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    // the strong force: thick yellow arrows pulling in, only inside the circle
    const sa = (1 - mf) * smooth(u / 0.8);
    if (sa > 0) {
      ctx.globalAlpha = sa;
      for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + 0.52, r0 = Y * 0.98, r1 = Y * 0.42; arrow(ctx, C.x + r0 * Math.cos(a), C.y + r0 * Math.sin(a), C.x + r1 * Math.cos(a), C.y + r1 * Math.sin(a), "#ffd54f", U * 0.008); }
      ctx.globalAlpha = 1;
    }
    // the electric push: thinner blue arrows outside the circle
    const ea = smooth((t - (o.range ?? start + 3)) / 0.8) * (1 - mf);
    if (ea > 0) {
      ctx.globalAlpha = ea;
      for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + 0.52, r0 = Y * 1.12, r1 = Y * 1.12 + U * 0.065; arrow(ctx, C.x + r0 * Math.cos(a), C.y + r0 * Math.sin(a), C.x + r1 * Math.cos(a), C.y + r1 * Math.sin(a), "#4fc3f7", U * 0.0045); }
      text(ctx, "electric repulsion", C.x, C.y - Y - U * 0.12, U * 0.03, "#4fc3f7");
      ctx.globalAlpha = 1;
    }
    const la = smooth(u / 0.8) * (1 - mf); ctx.globalAlpha = la;
    text(ctx, (t >= (o.range ?? start + 3)) ? "strong force · very short range" : "strong force", C.x, C.y + Y + U * 0.09, U * 0.03, "#ffd54f"); ctx.globalAlpha = 1;
  }
  // the protons: the chart's proton picture, the four a little bigger; P and S become neutrons at their moment
  const isN = (a) => (a.p && t >= TN1) || (a.s && t >= TN2), tN = (a) => a.p ? TN1 : TN2;
  for (const a of ps) {
    const four = a.c || a.p || a.q || a.s, x = a.x + (merged || four ? 0 : jit(a.k, U * 0.004)), d = U * (four ? 0.1 : 0.085);
    if (!isN(a)) particle(ctx, "proton", x, a.y, d, 1, "#ff8a80", spin(a.k), sizeOf(a.k));
    else {
      const f = smooth((t - tN(a)) / 0.4);
      if (f < 1) particle(ctx, "proton", x, a.y, d, 1 - f, "#ff8a80", spin(a.k), sizeOf(a.k));
      particle(ctx, "neutron", x, a.y, d * 0.8, f, "#e0e0e0", spin(a.k + 1), sizeOf(a.k));
      const age = t - tN(a);
      if (age < 0.5) { const q = age / 0.5; ctx.globalAlpha = (1 - q) * 0.9; ctx.strokeStyle = "#e1bee7"; ctx.lineWidth = U * 0.004; ctx.beginPath(); ctx.arc(x, a.y, d * 0.5 * (1 + 1.8 * q), 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
      if (age < 2.2) {   // the neutrino away, a faint fast ghost
        const ang = spin(a.k) + 0.6, r = U * 0.7 * age, fade = 1 - smooth((age - 1.4) / 0.8), hx = x + r * Math.cos(ang), hy = a.y + r * Math.sin(ang), tl = Math.min(r, U * 0.16);
        ctx.strokeStyle = "#e0f7fa"; ctx.fillStyle = "#fff"; ctx.lineWidth = U * 0.0025; ctx.globalAlpha = fade * 0.5; ctx.beginPath(); ctx.moveTo(hx - tl * Math.cos(ang), hy - tl * Math.sin(ang)); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.globalAlpha = fade * 0.9; ctx.beginPath(); ctx.arc(hx, hy, U * 0.004, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      }
    }
  }
  // pressure: red arrows at the margins, from the squeeze on
  const ra = sq > 0 ? smooth((t - sqz) / 0.8) * (1 - smooth((ba - 1) / 1)) : 0, push = U * 0.015 * Math.sin(t * 5);
  if (ra > 0) {
    ctx.globalAlpha = ra;
    for (let i = 0; i < 8; i++) edgeArrow(ctx, W, H, i * TAU / 8 + TAU / 16, U * 0.11, U * 0.03, "#ff6b5e", U * 0.009, push);
    text(ctx, "pressure", cx, H * 0.16, U * 0.034, "#ff8a80"); ctx.globalAlpha = 1;
  }
  if (merged && C && P) {
    const f = smooth((ma - 0.6) / 0.8); ctx.globalAlpha = f;
    const word = t >= TN2 + 0.5 ? "helium · 2 protons + 2 neutrons" : t >= hel ? "two more join" : t >= TN1 + 0.3 ? "deuterium · a proton and a neutron" : t >= TN1 ? "the weak force turns one into a neutron" : "two protons, grabbed";
    text(ctx, word, (C.x + P.x) / 2, C.y + Y + U * 0.1, U * 0.034, t >= TN1 && t < TN1 + 0.3 || t >= TN2 && t < TN2 + 0.5 ? "#b388ff" : "#ffd54f"); ctx.globalAlpha = 1;
  }
  // the burst: photons flying out from the pair, a squiggle along the way with a bright head
  if (burst && C && P) {
    const mx = (C.x + P.x) / 2, my = C.y, n = 54, life = 3.4;
    ctx.lineWidth = U * 0.0028; ctx.strokeStyle = "#ffe9a3"; ctx.fillStyle = "#fff8e1"; ctx.shadowColor = "#ffe082";
    for (let i = 0; i < n; i++) {
      const a = i * 2.399 + 0.4, v = U * (0.16 + 0.1 * ((i * 7) % 5) / 5), d = v * ba, fade = 1 - smooth((ba - life + 0.8) / 0.8);
      if (fade <= 0) continue;
      const hx = mx + d * Math.cos(a), hy = my + d * Math.sin(a), len = U * 0.045, amp = U * 0.006, ux = Math.cos(a), uy = Math.sin(a);
      ctx.globalAlpha = fade * 0.9; ctx.shadowBlur = U * 0.008; ctx.beginPath();
      for (let s = 0; s <= 12; s++) { const q = s / 12, w = Math.sin(q * TAU * 2.5 + t * 20) * amp * (1 - q); const px = hx - ux * len * q - uy * w, py = hy - uy * len * q + ux * w; s ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke(); ctx.beginPath(); ctx.arc(hx, hy, U * 0.0045, 0, TAU); ctx.fill();
    }
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    const f = smooth((ba - 0.3) / 0.8); ctx.globalAlpha = f;
    text(ctx, t >= psh ? "the light pushes outwards" : "energy", cx, H * 0.78, U * 0.034, "#ffe9a3"); ctx.globalAlpha = 1;
  }
}

// ---------- the weak force: the core past the white-dwarf limit (the author's ask, 2026-11-07) ----------
// Where the crush left off: bare nuclei packed close, the electron sea between them, pressure at the margins. The
// weak force is the only force that changes what a particle is, and it reaches the least far of all: a tiny dotted
// violet circle round each proton. Nothing happens while an electron merely passes; pushed inside that circle, a
// flash, and the two are one neutron (the chart's own neutron picture), and a neutrino shoots away through everything,
// touching nothing. As the electrons vanish into the nuclei, the sea that held the core up is gone: the whole crowd
// drops to a tight pack, neutrons touching, one giant nucleus, held by gravity. Phases, absolute take times from the
// cues: start, weak, capture, neutrino, pack, nucleus, gravity.
export function drawWeak(ctx, W, H, o, t) {
  const TAU = Math.PI * 2, U = Math.min(W, H), cx = W / 2, cy = H / 2;
  const start = o.start ?? t, weak = o.weak ?? start + 2, cap = o.capture ?? weak + 3, pack = o.pack ?? cap + 9, grav = o.gravity ?? pack + 6;
  const u = t - start, D = U * 0.34;                                   // a nucleus's picture: large, only a dozen in the frame (the author, 2026-11-08)
  // practically touching already; the neutron's picture is the compact one (no aberration), so at the pack cue the whole
  // lattice claps together, suddenly, into the tight neutron packing
  const packed = t < pack ? 0 : smooth((t - pack) / 0.5);
  const DN = D * 0.78, L = D * 1.08 - (D * 1.08 - DN * 0.82) * packed, R = D * 0.47;   // packed: the neutrons' discs touching (their picture has a soft margin)   // the spacing; the weak force's reach, at the picture's edge
  const jit = (k, s) => Math.sin(t * (1.1 + k % 4 * 0.23) + k * 1.9) * s;
  const nuc = [], JM = Math.ceil(H / 2 / (L * 0.866)) + 2, IM = Math.ceil(W / 2 / L) + 2;
  for (let j = -JM; j <= JM; j++) for (let i = -IM; i <= IM; i++) {
    const x = cx + (i + (j & 1 ? 0.5 : 0)) * L, y = cy + j * L * 0.866;
    if (x < -D || x > W + D || y < -D || y > H + D) continue;
    const k = (i + 40) * 97 + (j + 40), u1 = unit2(k, 1), u2 = unit2(k, 2), u3 = unit2(k, 3);
    // a little off its point until the snap (a crowd, not yet a crystal); its electron is captured at its own
    // moment, staggered over four seconds from the capture cue; a few per cent keep their proton ("mostly neutrons")
    const amp = L * 0.06 * (1 - packed) * (0.3 + u3), ang = u2 * TAU + 0.3 * Math.sin(t * 0.3 + k);
    nuc.push({ x: x + amp * Math.cos(ang), y: y + amp * Math.sin(ang), k, c: i === 0 && j === 0, tc: cap + 0.3 + u1 * 3.5, keep: u2 < 0.07 && !(i === 0 && j === 0), ang: unit2(k, 4) * TAU });
  }
  // the pressure, from the margins; the label turns to gravity at the end
  const push = U * 0.015 * Math.sin(t * 5), ra = smooth(u / 0.8);
  ctx.globalAlpha = ra;
  for (let i = 0; i < 8; i++) edgeArrow(ctx, W, H, i * TAU / 8 + TAU / 16, U * 0.11, U * 0.03, "#ff6b5e", U * 0.009, push);
  text(ctx, t >= grav ? "gravity" : "pressure", cx, H * 0.16, U * 0.034, "#ff8a80"); ctx.globalAlpha = 1;
  // where each nucleus's electron is: roaming round it in the sea, then, in its last 0.7 s, pushed straight in
  const epos = (n) => {
    const ex = n.x + Math.sin(t * 1.6 + n.k) * L * 0.46, ey = n.y + Math.cos(t * 1.2 + n.k * 0.7) * L * 0.46;
    if (n.keep || t >= n.tc) return [ex, ey, 0];
    const g = smooth((t - (n.tc - 0.7)) / 0.7);
    return [ex + (n.x - ex) * g, ey + (n.y - ey) * g, g];
  };
  // the weak force's reach: a dotted violet circle round each proton, from the "weak" cue; as its electron comes in,
  // the circle and the electron's own bubble touch, kiss and merge into one (the bubble outline), then the circle goes
  const wa = t < weak ? 0 : smooth((t - weak) / 0.8);
  for (const n of nuc) {
    const done = !n.keep && t >= n.tc;
    if (wa > 0 && !done) {
      const a = wa * (n.c ? 1 : 0.6) * (n.keep ? 1 : 1 - smooth((t - n.tc + 0.15) / 0.15));
      ctx.globalAlpha = a; ctx.strokeStyle = "#b388ff"; ctx.lineWidth = U * (n.c ? 0.006 : 0.004); ctx.setLineDash([U * 0.012, U * 0.01]);
      const [ex, ey, g] = epos(n);
      const blob = g > 0 ? blobPath([{ x: n.x, y: n.y, r: R }, { x: ex, y: ey, r: R * 0.32 }]) : null;
      if (blob) strokePath(ctx, blob);
      else { ctx.beginPath(); ctx.arc(n.x, n.y, R, 0, TAU); ctx.stroke(); if (g > 0) { ctx.beginPath(); ctx.arc(ex, ey, R * 0.32, 0, TAU); ctx.stroke(); } }
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    }
  }
  // the nuclei: a proton until its moment, then a neutron (a cross-fade; the neutron's picture is the compact one),
  // with a flash at the change
  for (const n of nuc) {
    const x = n.x + (packed > 0.9 ? 0 : jit(n.k, U * 0.003)), y = n.y;
    if (n.keep || t < n.tc) particle(ctx, "proton", x, y, D, 1, "#ff8a80", spin(n.k), sizeOf(n.k));
    else {
      const f = smooth((t - n.tc) / 0.4);
      if (f < 1) particle(ctx, "proton", x, y, D, 1 - f, "#ff8a80", spin(n.k), sizeOf(n.k));
      particle(ctx, "neutron", x, y, DN, f, "#e0e0e0", spin(n.k + 1), sizeOf(n.k));
      if (t - n.tc < 0.5) { const q = (t - n.tc) / 0.5; ctx.globalAlpha = (1 - q) * 0.9; ctx.strokeStyle = "#f3e5f5"; ctx.lineWidth = U * 0.004; ctx.beginPath(); ctx.arc(x, y, R * (1 + 1.6 * q), 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
    }
  }
  // the electrons: one a nucleus, roaming round it in the sea, then pushed straight into it at its moment
  for (const n of nuc) {
    if (!n.keep && t >= n.tc) continue;
    const [ex, ey] = epos(n);
    particle(ctx, "electron", ex, ey, D * 0.22, 0.95, "#b3e5fc", spin(n.k) + t * 0.8);
  }
  // the neutrinos: a shower, three from each change, faint fast ghosts on straight lines through everything
  ctx.strokeStyle = "#e0f7fa"; ctx.fillStyle = "#ffffff"; ctx.lineWidth = U * 0.0025;
  for (const n of nuc) {
    if (n.keep || t < n.tc) continue;
    for (let q = 0; q < 3; q++) {
      const age = t - n.tc - q * 0.12, v = U * (0.75 + 0.2 * q), r = v * age, fade = age < 0 ? 0 : 1 - smooth((age - 1.8) / 0.8);
      if (fade <= 0) continue;
      const ang = n.ang + q * 2.094, hx = n.x + r * Math.cos(ang), hy = n.y + r * Math.sin(ang), tl = Math.min(r, U * 0.18);
      ctx.globalAlpha = fade * 0.5; ctx.beginPath(); ctx.moveTo(hx - tl * Math.cos(ang), hy - tl * Math.sin(ang)); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.globalAlpha = fade * 0.9; ctx.beginPath(); ctx.arc(hx, hy, U * 0.0035, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    }
  }
  // the words
  const label = (s, from, col = "#ffe9a3") => { const f = smooth((t - from) / 0.6); if (f > 0) { ctx.globalAlpha = f; text(ctx, s, cx, H * 0.78, U * 0.034, col); ctx.globalAlpha = 1; } };
  if (t >= grav) label("held together by gravity", grav);
  else if (t >= (o.nucleus ?? pack + 3)) label("one giant nucleus", o.nucleus ?? pack + 3);
  else if (t >= pack) label("nothing holds it up any more", pack, "#ff8a80");
  else if (t >= (o.neutrino ?? cap + 3)) label("the neutrinos carry the energy away", o.neutrino ?? cap + 3, "#e0f7fa");
  else if (t >= cap) label("a proton and an electron become a neutron", cap);
  else if (t >= weak) label("the weak force · the shortest reach of all", weak, "#b388ff");
}

// ---------- deuterium: two in a sea of ordinary hydrogen (the author, 2026-11-08) ----------
// Like the fusion diagram, but the crowd is ordinary hydrogen (bare protons) with two deuteriums in it: a proton and a
// neutron snug together in one small yellow circle, labelled. Under pressure the ordinary protons' reach circles touch
// and bounce apart ("not hot enough"), while a deuterium and the proton beside it merge like bubbles into helium-3 with a
// small puff of light: it already carries its neutron, so it skips the hard step. Phases: start, neutron, rare, fuse.
export function drawDeut(ctx, W, H, o, t) {
  const TAU = Math.PI * 2, U = Math.min(W, H), cx = W / 2, cy = H / 2;
  const start = o.start ?? t, neu = o.neutron ?? start + 3, rare = o.rare ?? start + 6, fus = o.fuse ?? rare + 2;
  const u = t - start, Y = U * 0.1, L = Y * 2.3, D = U * 0.085;
  const jit = (k, s) => Math.sin(t * (1.1 + k % 4 * 0.23) + k * 1.9) * s;
  const ps = [], JM = Math.ceil(H / 2 / (L * 0.866)) + 2, IM = Math.ceil(W / 2 / L) + 2;
  for (let j = -JM; j <= JM; j++) for (let i = -IM; i <= IM; i++) {
    const k = (i + 40) * 97 + (j + 40), u1 = unit2(k, 1), u2 = unit2(k, 2), u3 = unit2(k, 3);
    const deut = (i === 0 && j === 0) || (i === -2 && j === 3), mate = i === 1 && j === 0;
    const amp = deut || mate ? 0 : L * 0.2 * (u2 < 0.35 ? 0.1 : 0.4 + 0.6 * u3), ang = u1 * TAU + 0.3 * Math.sin(t * 0.3 + k);
    const x = cx + (i + (j & 1 ? 0.5 : 0)) * L + amp * Math.cos(ang), y = cy + j * L * 0.866 + amp * Math.sin(ang);
    if (x < -Y || x > W + Y || y < -Y || y > H + Y) continue;
    ps.push({ x, y, k, deut, mate, c: i === 0 && j === 0 });
  }
  const C = ps.find(a => a.c), M = ps.find(a => a.mate);
  const ff = t < fus ? 0 : smooth((t - fus) / 0.9);
  if (C && M) { const mx = (C.x + M.x) / 2; C.x += (mx - Y * 0.3 - C.x) * ff; M.x += (mx + Y * 0.3 - M.x) * ff; }
  // pressure from the margins, from the "rare" cue
  const ra = t < rare ? 0 : smooth((t - rare) / 0.8), push = U * 0.015 * Math.sin(t * 5);
  if (ra > 0) { ctx.globalAlpha = ra; for (let i = 0; i < 8; i++) edgeArrow(ctx, W, H, i * TAU / 8 + TAU / 16, U * 0.11, U * 0.03, "#ff6b5e", U * 0.009, push); text(ctx, "pressure · not enough for ordinary hydrogen", cx, H * 0.16, U * 0.03, "#ff8a80"); ctx.globalAlpha = 1; }
  // reach circles: faint on every proton; the deuteriums' solid; the fusing pair's a bubble outline
  const dotted = (x, y, rad, a, w = U * 0.003, dash = true) => { ctx.globalAlpha = a; ctx.strokeStyle = "#ffd54f"; ctx.lineWidth = w; ctx.setLineDash(dash ? [U * 0.014, U * 0.011] : []); ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; };
  for (const a of ps) { if (a.c || a.mate) continue; dotted(a.x + jit(a.k, U * 0.004), a.y, a.deut ? Y * 0.75 : Y, a.deut ? 0.9 : 0.22, a.deut ? U * 0.005 : U * 0.003, !a.deut); }
  if (C && M) {
    const blob = ff > 0 ? blobPath([{ x: C.x, y: C.y, r: Y * 0.75 }, { x: M.x, y: M.y, r: Y }]) : null;
    ctx.strokeStyle = "#ffd54f"; ctx.lineWidth = U * 0.005;
    if (ff >= 1) { ctx.shadowColor = "#ffd54f"; ctx.shadowBlur = U * 0.015; squashedCircle(ctx, (C.x + M.x) / 2, C.y, Y * 0.95, squash(t - fus - 0.9), U, "#ffe9a3"); ctx.shadowBlur = 0; }
    else if (blob) { ctx.shadowColor = "#ffd54f"; ctx.shadowBlur = U * 0.015; strokePath(ctx, blob); ctx.shadowBlur = 0; }
    else { dotted(C.x, C.y, Y * 0.75, 0.9, U * 0.005, false); dotted(M.x, M.y, Y, 0.22); }
  }
  // the nuclei: the deuteriums a proton and a neutron snug together, the rest lone protons
  for (const a of ps) {
    const x = a.x + (a.c || a.mate ? 0 : jit(a.k, U * 0.004));
    if (a.deut) {
      const d2 = D * 0.9, off = d2 * 0.3, g = t >= neu && a.c ? 1 + 0.08 * Math.sin(t * 6) : 1;   // the neutron throbs when it's named
      particle(ctx, "proton", x - off, a.y - off * 0.3, d2, 1, "#ff8a80", spin(a.k), sizeOf(a.k));
      particle(ctx, "neutron", x + off, a.y + off * 0.3, d2 * 0.8 * g, 1, "#e0e0e0", spin(a.k + 1), sizeOf(a.k));
      if (!(a.c && ff > 0.5)) { ctx.globalAlpha = smooth(u / 0.8); text(ctx, a.c && t >= neu && t < rare ? "deuterium · a proton and a neutron" : "deuterium", x, a.y + Y * 0.75 + U * 0.06, U * 0.03, "#ffd54f"); ctx.globalAlpha = 1; }
    } else particle(ctx, "proton", x, a.y, D, 1, "#ff8a80", spin(a.k), sizeOf(a.k));
  }
  if (t >= rare) { ctx.globalAlpha = smooth((t - rare) / 0.6); text(ctx, "1 hydrogen in 40,000", cx, H * 0.78, U * 0.034, "#ffe9a3"); ctx.globalAlpha = 1; }
  if (ff > 0.6 && C && M) {   // the puff of light, and the name
    const age = t - fus - 0.5, mx = (C.x + M.x) / 2, n = 18;
    ctx.strokeStyle = "#ffe9a3"; ctx.fillStyle = "#fff8e1"; ctx.lineWidth = U * 0.0025;
    for (let i = 0; i < n; i++) {
      const a = i * 2.399 + 0.4, r = U * 0.18 * age, fade = 1 - smooth((age - 1.2) / 0.6); if (fade <= 0 || age < 0) continue;
      const hx = mx + r * Math.cos(a), hy = C.y + r * Math.sin(a); ctx.globalAlpha = fade * 0.9; ctx.beginPath(); ctx.arc(hx, hy, U * 0.004, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.globalAlpha = smooth(age / 0.5); text(ctx, "helium-3 · the neutron came along, no hard step", mx, C.y + Y + U * 0.1, U * 0.03, "#ffd54f"); ctx.globalAlpha = 1;
  }
}

// ---------- the Squeeze Lab's simulations (src/squeeze-sim.js, tuned in tools/squeeze-lab.html) ----------
// { squeeze: { mode, from?, speed?, seed?, P? } }: mode 1 the shells crushed, 2 fusion, 3 the neutrons, with the lab's
// settings for that mode (P overrides some). The run is stepped on the take's clock: `from` seconds into it when the cue
// starts, then `speed` × the time since. One run per cue, replayed from its start after a seek back; a render steps
// it exactly (o.exact), the live page catches up at most 60 steps a frame. The lab's arrows open each clip.
const SQUEEZE = new Map();
export function drawSqueeze(ctx, W, H, o, t, pixelRatio) {
  const key = `${o.start}:${o.mode}:${o.seed ?? 1}`, want = (o.from ?? 0) + Math.max(0, t - o.start) * (o.speed ?? 1);
  let sim = SQUEEZE.get(key);
  if (!sim || sim.S.t > want + 1e-6) {
    sim = createSqueeze({ pics: { proton: pic("proton"), neutron: pic("neutron") } });
    Object.assign(sim.S, { mode: o.mode, seed: o.seed ?? 1, W: W > H ? SQUEEZE_LONG : SQUEEZE_SHORT, H: W > H ? SQUEEZE_SHORT : SQUEEZE_LONG });
    sim.S.P = { ...squeezeDefaults(o.mode), hud: false, ...o.P };
    sim.build(); SQUEEZE.set(key, sim);
    // the arrows the lab's settings switch on, for the clip's first seconds (the author, 2026-11-09): their time counts
    // from the clip's first frame, in seconds of the video at whatever speed the run plays
    sim.S.arrowT0 = o.from ?? 0; sim.S.P.arrowTime *= o.speed ?? 1;
  }
  for (let n = 0; sim.S.t + SQUEEZE_DT <= want + 1e-9 && (o.exact || n < 60); n++) sim.step(SQUEEZE_DT);
  sim.draw(ctx, W, H, pixelRatio);
}

// ---------- our universe and an alien's: the edge, two horizons, and the observable universe (the author's design,
// 2026-11-09, The Cosmic Event Horizon), drawn with the powers-of-ten zoom's own objects (the author: not the
// wavelength explorer's shells): Our Universe (src/event-horizon-object.js) and the observable universe
// (src/cmb-object.js) ----------
// { edge: { phase } }, phases by cue (absolute take times, like the crush's): start (our universe turning), alien (the
// turn stops; a red circle on a galaxy at our edge), theirs (a second Our Universe, turned its own way, grows round
// that galaxy: their universe), see (a circle grows from ours out to the observable universe as the view pulls back,
// its galaxies showing inside it, part of their universe now among them), meet (the microwave background fades in on
// it).
let _edgeObjs = null;
const edgeObjs = () => _edgeObjs || (_edgeObjs = { ours: eventHorizonObject(), theirs: eventHorizonObject(), web: cmbObject({ far: 0, near: 0 }), cmb: cmbObject() });
export const edgePending = () => { const o = edgeObjs(); return Object.values(o).filter(x => x && !x.ready()).length; };
export function drawEdge(ctx, W, H, o, t) {
  const O = edgeObjs(), start = o.start ?? t, alien = o.alien ?? Infinity, theirs = o.theirs ?? Infinity, see = o.see ?? Infinity, meet = o.meet ?? Infinity;
  const OBS = 1 / HORIZON;                                              // the observable universe in our universe's radii (45.3 / 16.6)
  const grow = smooth((t - see) / 3.4), R = 1 + (OBS - 1) * grow;     // the circle growing out to it
  const U0 = Math.min(W, H) * 0.3, U = U0 / (1 + (OBS * 0.98 * U0 / (Math.min(W, H) * 0.47) - 1) * grow);   // pulls back so it fits
  // off centre, so their universe fits beside ours, back to the middle as the observable universe grows round us
  const cx = W * (0.36 + 0.14 * grow), cy = H * 0.46, frozen = Math.min(t, alien) - start; // our universe turns until the alien
  // a picture of one of the objects: its sphere is FILL of the picture
  const put = (obj, sec, x, y, r, a = 1, clipR = null) => {
    if (!obj || a <= 0.01) return;
    const size = Math.min(1536, Math.max(256, Math.round(2 * r / FILL / 64) * 64)), c = obj.draw(size, sec), d = 2 * r / FILL;
    ctx.save(); ctx.globalAlpha = a;
    if (clipR != null) { ctx.beginPath(); ctx.arc(x, y, clipR, 0, 6.2832); ctx.clip(); }
    ctx.drawImage(c, x - d / 2, y - d / 2, d, d); ctx.restore();
  };
  const ex = 0.82, ey = -0.4;                                           // the galaxy at our edge, up and to the right
  const X = (u) => cx + u * U, Y = (v) => cy + v * U;
  // the observable universe's galaxies, inside the growing circle; then its microwave background
  const fm = smooth((t - meet) / 1.8);
  if (grow > 0) put(O.web, frozen, X(0), Y(0), OBS * U, 1 - fm, R * U);
  if (fm > 0) put(O.cmb, frozen, X(0), Y(0), OBS * U, fm);
  // ours, and theirs round the edge galaxy, turned its own way
  const ft = smooth((t - theirs) / 1.6);
  put(O.ours, frozen, X(0), Y(0), U);
  if (ft > 0) put(O.theirs, frozen + 9, X(ex), Y(ey), U * ft, ft * (grow > 0 ? 0.85 : 0.7));
  const ring = (u, v, r, col, a, dash, w = 0.005) => { if (a <= 0.01) return; ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = H * w; ctx.setLineDash(dash ? [H * 0.018, H * 0.014] : []); ctx.beginPath(); ctx.arc(X(u), Y(v), r * U, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; };
  ctx.fillStyle = "#80deea"; ctx.beginPath(); ctx.arc(X(0), Y(0), H * 0.007, 0, 6.2832); ctx.fill();
  text(ctx, "us", X(0), Y(0) - H * 0.026, H * 0.022, "#80deea");
  const fo = smooth((t - alien) / 0.8);
  if (fo > 0) { ctx.globalAlpha = fo; text(ctx, "our universe", X(0), Y(1) + H * 0.04, H * 0.028, "#80deea"); ctx.globalAlpha = 1; }
  if (fo > 0) {                                                         // the red circle on the alien's galaxy
    ctx.globalAlpha = fo; ctx.strokeStyle = "#ff5252"; ctx.lineWidth = H * 0.005;
    ctx.beginPath(); ctx.arc(X(ex), Y(ey), H * 0.02, 0, 6.2832); ctx.stroke(); ctx.globalAlpha = 1;
    if (ft < 0.5) { ctx.globalAlpha = fo * (1 - 2 * ft); text(ctx, "an alien's galaxy", X(ex), Y(ey) - H * 0.04, H * 0.026, "#ff8a80"); ctx.globalAlpha = 1; }
  }
  if (ft > 0) { ring(ex, ey, ft, "#ffab40", ft, false); ctx.globalAlpha = ft; text(ctx, "their universe", X(ex), Y(ey - ft) - H * 0.02, H * 0.028, "#ffab40"); ctx.globalAlpha = 1; }
  if (grow > 0) {
    ring(0, 0, R, "#ffffff", Math.min(1, grow * 3) * 0.85 * (1 - fm), true, 0.004);
    ctx.globalAlpha = smooth((grow - 0.5) / 0.4); text(ctx, "our observable universe", X(0), Y(-R) - H * 0.02, H * 0.028, "#ffffff"); ctx.globalAlpha = 1;
  }
}
