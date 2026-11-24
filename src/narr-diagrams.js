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
// live nucleons for the simulations (the author, 2026-11-20, 3:00: "make sure the protons are not static images but
// dynamic images that rotate in many directions and change"): the Hopf proton and neutron (public/hopf/hopf-core.js, the
// stills' own particles) rendered once as a loop of frames, turning a full turn sideways while nodding up and down twice,
// their quark sea moving; each nucleus plays the loop from its own place (squeeze-sim.js)
const RENDER_FRAMES = typeof location !== "undefined" && new URLSearchParams(location.search).has("render");
const SPRITE_N = 40, SPRITE_PX = 256, HOPF_OPTS = { drift: true, flow: true, width: 1, bloom: 0.9, exposure: 1.1, core: 0.8 };
let _hopf = null;
const hopfCore = () => _hopf || (_hopf = import(/* @vite-ignore */ `${import.meta.env.BASE_URL}hopf/hopf-core.js`).then(core => ({ core, renderer: new core.Renderer({ alpha: true }) })));
let _sprites = null;
function nucleonSprites() {
  if (_sprites) return _sprites;
  _sprites = { proton: null, neutron: null, failed: false };
  const dice = protonDice(); let hopfProton = null;
  (async () => {
    try {
      const { core, renderer } = await hopfCore(); renderer.resize(SPRITE_PX);
      for (const [name, id] of [["proton", "proton-scale"], ["neutron", "neutron-scale"]]) {
        const view = new core.HopfView(renderer, null, core.PARTICLES.find(p => p.id === id));
        view.res = 0; const p0 = view.pitch, frames = [];
        for (let i = 0; i < SPRITE_N; i++) {
          const u = i / SPRITE_N;
          view.yaw = 0.6 + u * Math.PI * 2; view.pitch = p0 + 0.6 * Math.sin(u * Math.PI * 4);
          view.update(u * 4, HOPF_OPTS);
          const c = document.createElement("canvas"); c.width = c.height = SPRITE_PX;
          renderer.render(view, HOPF_OPTS, [c.getContext("2d"), 0, 0, SPRITE_PX, SPRITE_PX]);
          frames.push(c);
        }
        if (name === "neutron") _sprites[name] = frames; else hopfProton = frames;
      }
      _sprites.proton = tintProton(hopfProton, await dice);
    } catch (err) { console.warn("live nucleons unavailable, keeping the stills:", err.message); _sprites.failed = true; _sprites.proton = await dice; }
  })();
  return _sprites;
}
// the old proton's shape coloured by the twisted die, blurred (the author, 2026-11-22: "Pick the shape you just did, blur
// it and use that to color over the old proton shape"): each of the die's 120 frames over the proton's turning picture
// (three die frames to each of its 40, so both loops meet), in the die's colours and the picture's light, cut to its outline
function tintProton(hopf, dice) {
  const S = SPRITE_PX;
  const tint = (H, D, H2 = null, h2 = 0) => {
    const c = document.createElement("canvas"); c.width = c.height = S; const g = c.getContext("2d");
    let M = H;   // the outline: the turning picture, or (frame by frame) two of its frames mixed
    if (H2 && h2 > 0.01) { M = document.createElement("canvas"); M.width = M.height = S; const m = M.getContext("2d");
      m.drawImage(H, 0, 0); m.globalAlpha = h2; m.drawImage(H2, 0, 0); }
    g.drawImage(M, 0, 0);
    // (blurred, a little larger than the picture so its rim takes colour too; multiplied in, then its colour on top: the
    // picture is nearly white, so colour alone came out pastel)
    const k = 1.18, o = -S * (k - 1) / 2;
    g.filter = `blur(${S * 0.035}px)`;
    g.globalCompositeOperation = "multiply"; g.globalAlpha = 0.7; g.drawImage(D, o, o, S * k, S * k);
    g.globalCompositeOperation = "color"; g.globalAlpha = 1; g.drawImage(D, o, o, S * k, S * k);
    g.filter = "none"; g.globalCompositeOperation = "destination-in"; g.drawImage(M, 0, 0);
    // (then more saturated and brighter: the author, 2026-11-22, "I like the new proton but saturate and brighten it a bit more")
    const c2 = document.createElement("canvas"); c2.width = c2.height = S; const g2 = c2.getContext("2d");
    g2.filter = "saturate(1.6) brightness(1.3)"; g2.drawImage(c, 0, 0);
    return c2;
  };
  const out = dice.map((D, i) => tint(hopf[Math.floor(i / 3) % hopf.length], D));
  out.fps = dice.fps; out.total = out.length;
  // frame by frame in a video render (the author, 2026-11-24: "We will render the protons in the video frame by frame, but
  // keep them lighter in the app"): `at(u)` gives the picture at die frame u (fractional), traced when first asked for, on
  // a grid SUB times finer than the loop's (a new picture every video frame at the Short's half speed: 0.3 die frames a
  // frame at 30 fps), the outline mixed from the two nearest turning frames; the app keeps the 120 and blends neighbours
  if (RENDER_FRAMES && dice.make) {
    const SUB = 4, n = dice.length * SUB, cache = new Map();
    out.at = (u) => { if (!Number.isFinite(u)) u = 0; const q = ((Math.round(u * SUB) % n) + n) % n;
      let im = cache.get(q); if (im) return im;
      const fu = q / SUB, hu = fu / 3, h = Math.floor(hu), hn = hopf.length;
      im = tint(hopf[h % hn], dice.make(fu), hopf[(h + 1) % hn], hu - h); cache.set(q, im); return im; };
  }
  return out;
}
// The proton as a three-sided die (the author, 2026-11-22: "protons and neutrons are still too similar … make them be made
// of the 3 basic colors and switch around quickly as if it was some sort three sided dice … and then only becomes gray
// once it's a neutron"; then, with a photo of a twisted ring die: "Make it a sphere with 3 lobes but a twist like this"):
// a ball of three lobes, red, green and blue, running pole to pole and twisted a third of a turn on the way like that
// band, ray-traced and lit. It tumbles, and every third of a second it rolls a third of a turn while two lobes trade
// colours, a white flash along the seam between them (a gluon going across). 120 frames played at 18 a second (`fps`), a
// loop: twenty-four rolls make eight turns, and the swaps come back to where they began. Traced a few frames at a time, so
// the page doesn't stall; spritesPending waits for all of them.
function protonDice() {
  const TAU = Math.PI * 2, N = 120, STEP = 5, S = SPRITE_PX, PX = 128, frames = [], C = [[255, 45, 45], [45, 225, 80], [55, 115, 255]];
  const swaps = [[0, 1], [1, 2], [2, 0]], ease = (u) => u * u * (3 - 2 * u);
  const LOBE = 0.15, TWIST = 2.1, SC = 1.25;            // lobe depth, twist (rad per unit height: 240° pole to pole, so all three colours show from any side), view half-width
  const perms = []; let perm = [0, 1, 2];
  for (let k = 0; k < N / STEP; k++) { perms.push(perm.slice()); const [i, j] = swaps[k % 3]; [perm[i], perm[j]] = [perm[j], perm[i]]; }
  const radius = (x, y, z) => { const r = Math.hypot(x, y, z) || 1e-9, zz = z / r, sxy = Math.sqrt(Math.max(0, 1 - zz * zz));
    return 1 + LOBE * Math.cos(3 * (Math.atan2(y, x) - TWIST * zz)) * sxy ** 1.5; };
  const f = (x, y, z) => Math.hypot(x, y, z) - radius(x, y, z);
  const rot = (ax, ay, az) => { const [ca, sa, cb, sb, cc, sc] = [Math.cos(ax), Math.sin(ax), Math.cos(ay), Math.sin(ay), Math.cos(az), Math.sin(az)];
    // view = Rx(ax)·Ry(ay)·Rz(az), rows
    const Rz = [[cc, -sc, 0], [sc, cc, 0], [0, 0, 1]], Ry = [[cb, 0, sb], [0, 1, 0], [-sb, 0, cb]], Rx = [[1, 0, 0], [0, ca, -sa], [0, sa, ca]];
    const mul = (A, B) => A.map(r => [0, 1, 2].map(j => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
    return mul(Rx, mul(Ry, Rz)); };
  const L = (() => { const v = [-0.45, -0.6, 0.66], n = Math.hypot(...v); return v.map(q => q / n); })();
  const Hh = (() => { const v = [L[0], L[1], L[2] + 1], n = Math.hypot(...v); return v.map(q => q / n); })();
  function frame(fi) {
    const k = Math.floor(fi / STEP), v = (fi % STEP) / STEP, roll = ease(Math.min(1, v / 0.55));
    const P0 = perms[k], P1 = perms[(k + 1) % perms.length], mix = ease(Math.min(1, Math.max(0, (v - 0.45) / 0.12)));
    const M = rot(1.05 + 0.3 * Math.sin(fi / N * TAU * 2), 0.45 * Math.sin(fi / N * TAU), (k + roll) * TAU / 3);
    const flash = Math.max(0, 1 - Math.abs(v - 0.5) / 0.28), [fa, fb] = swaps[k % 3];
    const img = new ImageData(PX, PX), d = img.data, Rb = 1 + LOBE;
    for (let py = 0; py < PX; py++) for (let px = 0; px < PX; px++) {
      const X = ((px + 0.5) / PX * 2 - 1) * SC, Y = ((py + 0.5) / PX * 2 - 1) * SC, rr = X * X + Y * Y;
      if (rr >= Rb * Rb) continue;
      // the ray (view space: from the viewer, z toward them) in the ball's own frame: Mᵀ
      const zf = Math.sqrt(Rb * Rb - rr), o = (vx, vy, vz) => [M[0][0] * vx + M[1][0] * vy + M[2][0] * vz, M[0][1] * vx + M[1][1] * vy + M[2][1] * vz, M[0][2] * vx + M[1][2] * vy + M[2][2] * vz];
      const [ox, oy, oz] = o(X, Y, zf), [dx, dy, dz] = o(0, 0, -1);
      let t0 = 0, t = 0, hit = false;
      for (; t <= 2 * zf; t += 0.07) { if (f(ox + dx * t, oy + dy * t, oz + dz * t) < 0) { hit = true; break; } t0 = t; }
      if (!hit) continue;
      let a = t0, b = t; for (let i = 0; i < 7; i++) { const m = (a + b) / 2; if (f(ox + dx * m, oy + dy * m, oz + dz * m) < 0) b = m; else a = m; }
      const x = ox + dx * b, y = oy + dy * b, z = oz + dz * b, e = 0.004;
      let nx = f(x + e, y, z) - f(x - e, y, z), ny = f(x, y + e, z) - f(x, y - e, z), nz = f(x, y, z + e) - f(x, y, z - e);
      const nn = Math.hypot(nx, ny, nz) || 1; nx /= nn; ny /= nn; nz /= nn;
      const vnx = M[0][0] * nx + M[0][1] * ny + M[0][2] * nz, vny = M[1][0] * nx + M[1][1] * ny + M[1][2] * nz, vnz = M[2][0] * nx + M[2][1] * ny + M[2][2] * nz;
      // which lobe: the third of the twisted turn it's in; near a seam, a thin bright line
      const zz = z / Math.hypot(x, y, z), u = ((Math.atan2(y, x) - TWIST * zz) / (TAU / 3) % 3 + 3) % 3, li = Math.floor(u) % 3, fr = u - Math.floor(u);
      const c0 = C[P0[li]], c1 = C[P1[li]], base = c0.map((q, n) => q + (c1[n] - q) * mix);
      const diff = Math.max(0, vnx * L[0] + vny * L[1] + vnz * L[2]), spec = Math.max(0, vnx * Hh[0] + vny * Hh[1] + vnz * Hh[2]) ** 28, rim = (1 - Math.max(0, vnz)) ** 2;
      const seam = Math.max(0, 1 - Math.min(fr, 1 - fr) / 0.035);
      const sl = (li + (fr > 0.5 ? 1 : 0)) % 3, sr = (sl + 2) % 3;   // the seam's two lobes
      const glu = flash * seam * ((sl === fa && sr === fb) || (sl === fb && sr === fa) || ((sl + 1) % 3 === fa && sl === fb) ? 1 : 0.35);
      const j = (py * PX + px) * 4;
      for (let n = 0; n < 3; n++) {
        let c = base[n] * (0.22 + 0.9 * diff) + 255 * 0.55 * spec + base[n] * 0.35 * rim;
        c = c * (1 - 0.55 * seam) + 255 * (0.45 * seam + glu);
        d[j + n] = Math.min(255, c);
      }
      d[j + 3] = 255;
    }
    const tmp = document.createElement("canvas"); tmp.width = tmp.height = PX; tmp.getContext("2d").putImageData(img, 0, 0);
    // into the sprite's frame, the ball the same share of it as the neutron's picture (its body ~78% across)
    const c = document.createElement("canvas"); c.width = c.height = S; const g = c.getContext("2d");
    const w = S * 0.78 / 2 * SC / 1.06 * 2; g.drawImage(tmp, (S - w) / 2, (S - w) / 2, w, w);
    return c;
  }
  frames.fps = 18; frames.total = N; frames.make = frame;
  let next = 0;
  return new Promise((done) => {
    const work = () => { const t0 = performance.now(); while (next < N && performance.now() - t0 < 30) frames.push(frame(next++)); next < N ? setTimeout(work, 0) : done(frames); };
    work();
  });
}
export const nucleonFrames = () => nucleonSprites();
export const spritesPending = () => { const s = nucleonSprites(); return (s.proton ? 0 : 1) + (s.failed || s.neutron ? 0 : 1); };
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
  if (kinds.particles) n += picsPending(PARTICLES) + spritesPending();
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
  // a step back to where the run was saved last (the frame's earlier moments): from there, not from its start
  if (sim && sim.S.t > want + 1e-6 && sim.mark && sim.mark.t <= want + 1e-6) sim.restore(sim.mark.snap);
  if (!sim || sim.S.t > want + 1e-6) {
    sim = createSqueeze({ pics: { proton: pic("proton"), neutron: pic("neutron"), frames: nucleonSprites() } });
    Object.assign(sim.S, { mode: o.mode, seed: o.seed ?? 1, W: W > H ? SQUEEZE_LONG : SQUEEZE_SHORT, H: W > H ? SQUEEZE_SHORT : SQUEEZE_LONG });
    sim.S.P = { ...squeezeDefaults(o.mode), hud: false, ...o.P };
    sim.build(); SQUEEZE.set(key, sim);
    // (the one the camera follows: picked as built, so every render worker follows the same)
    sim.followId = sim.S.blobs.reduce((a, b) => Math.hypot(b.cx, b.cy) < Math.hypot(a.cx, a.cy) ? b : a).id;
    const k0 = sim.S.blobs.find(b => b.id === sim.followId)?.nuclei[0]; if (k0) sim.S.camSm = { x: k0.x, y: k0.y };
    // the arrows the lab's settings switch on, for the clip's first seconds (the author, 2026-11-09): their time counts
    // from the clip's first frame, in seconds of the video at whatever speed the run plays
    sim.S.arrowT0 = o.from ?? 0; sim.S.P.arrowTime *= o.speed ?? 1;
  }
  // saved before going on, at most once a tenth of a second of the run: the moments a frame's blur goes back to
  if (o.exact && sim.S.t + SQUEEZE_DT <= want + 1e-9 && !(sim.mark && sim.S.t - sim.mark.t < 0.1)) sim.mark = { t: sim.S.t, snap: sim.save() };
  // (the camera trails the nucleus it follows on a soft spring, lag s behind, so the view breathes with it instead of
  // sitting nailed to it: the author, 2026-11-20, 3:09, "let it a bit elastic so it doesn't seem to be stuck on the wall";
  // kept in the run's state, so every worker's frame is the same)
  const lagK = 1 - Math.exp(-SQUEEZE_DT / (o.lag ?? 1.1));
  // (how far the view has gone over to the nucleus it follows at run time u: the box's walls go the same way)
  const zoomAt = (since) => { const Z = o.zoom; if (!Z?.length) return 1; const j = Z.findIndex(([s]) => s > since);
    return j < 0 ? Z[Z.length - 1][1] : j === 0 ? Z[0][1] : Z[j - 1][1] + (Z[j][1] - Z[j - 1][1]) * smooth((since - Z[j - 1][0]) / (Z[j][0] - Z[j - 1][0])); };
  const boxW = (u) => { const since = (u - (o.from ?? 0)) / (o.speed ?? 1), z = zoomAt(since);
    return o.follow && since >= o.follow[0] && since <= o.follow[1] && z > 1 ? Math.min(1, (z - 1) / 0.6) : 0; };
  for (let n = 0; sim.S.t + SQUEEZE_DT <= want + 1e-9 && (o.exact || n < 60); n++) {
    sim.step(SQUEEZE_DT);
    const c = sim.S.camSm, k = o.follow && c && sim.S.blobs.find(b => b.id === sim.followId)?.nuclei[0];
    if (k) { c.x += (k.x - c.x) * lagK; c.y += (k.y - c.y) * lagK; }
    // (boxFollow: the box's walls kept round the camera, so a push in near the edge doesn't show the wall: the
    // degenerate matter's bare nuclei squeezed against it, the author, 2026-11-22)
    if (k && o.boxFollow) { const w = boxW(sim.S.t); sim.S.bx = sim.S.vcx + (c.x - sim.S.vcx) * w; sim.S.by = sim.S.vcy + (c.y - sim.S.vcy) * w; }
  }
  // the camera ({ zoom: [[s since the cue, ×], …], follow?: [from s, to s] }, the author, 2026-11-20: the clips hand over at
  // one zoom, the degenerate matter closing in on a nucleus, the fusion opening on it and closing in on its helium): eased
  // from key to key; within follow, centred on the nucleus nearest the middle at the start, as far as the zoom has come in
  const since = Math.max(0, t - o.start), Z = o.zoom;
  let z = 1;
  if (Z?.length) {
    const j = Z.findIndex(([s]) => s > since);
    z = j < 0 ? Z[Z.length - 1][1] : j === 0 ? Z[0][1] : Z[j - 1][1] + (Z[j][1] - Z[j - 1][1]) * smooth((since - Z[j - 1][0]) / (Z[j][0] - Z[j - 1][0]));
  }
  sim.S.zoom = z; sim.S.camX = sim.S.camY = null;
  if (o.follow && since >= o.follow[0] && since <= o.follow[1] && z > 1) {
    const k = sim.S.camSm;
    if (k) { const w = Math.min(1, (z - 1) / 0.6); sim.S.camX = sim.S.vcx + (k.x - sim.S.vcx) * w; sim.S.camY = sim.S.vcy + (k.y - sim.S.vcy) * w; }
  }
  // (peek: the run stepped to t and its camera set, nothing drawn: the forces Short's hand-over from the crushed atoms to
  // fusion reads where each run's nuclei are on screen, src/narration.js drawMorph)
  if (o.peek) { const S = sim.S, sc = W / S.W * (S.zoom || 1); return { S, scale: sc, ox: W / 2 - (S.camX ?? S.vcx) * sc, oy: H / 2 - (S.camY ?? S.vcy) * sc }; }
  sim.draw(ctx, W, H, pixelRatio);
  // (where the run's units land on screen, and its hexagonal grid if the neutrons have one: src/narr-p10.js picks its
  // lattice up from here, so the zoom out starts on the same grid)
  const S = sim.S, sc = S.view === "screen" ? W / S.W * (S.zoom || 1) : null, site = S.hex && Object.values(S.hex.at)[0];
  const geo = sc && { scale: sc, ox: W / 2 - (S.camX ?? S.vcx) * sc, oy: H / 2 - (S.camY ?? S.vcy) * sc,
    hex: site && { a: S.hex.a, x: site[0], y: site[1], t: S.t, t0: S.hex.t0, time: S.P.hexTime } };
  // optional titles over the run ({ labels: [[text, colour], …] }), one after another from the top, each fading in a
  // second after the one before (long-02b-opening's bonds: "electrons repel electrons", "electrons and protons attract")
  if (o.labels || o.tlabels || o.push != null) ctx.setTransform(1, 0, 0, 1, 0, 0);   // the run draws under its own transform
  // the energy fusion releases pushing out ({ push: s into the clip }, long-02b-opening, the author, 2026-11-17: "a large
  // amount of energy will be released creating an outwards pressure - show arrows representing these"): a ring of red
  // arrows (red: pressure, as in the diagrams) out from the middle, each setting off a little after the one before and
  // running out again and again, as a push that keeps going
  if (o.push != null) {
    const since = t - o.start - o.push, a0 = smooth(since / 0.8), S = Math.min(W, H), cx = W / 2, cy = H / 2;
    // (one wave at a time, all together, every 1.6 s: a ring that keeps pushing out)
    if (a0 > 0) for (let w = 0; w < 2; w++) for (let i = 0; i < 8; i++) {
      const ang = i / 8 * Math.PI * 2 + Math.PI / 8, ph = ((since / 1.6 + w / 2) % 1 + 1) % 1;
      const r0 = S * (0.1 + 0.22 * ph), len = S * 0.13, a = a0 * smooth(ph / 0.2) * (1 - smooth((ph - 0.6) / 0.4));
      if (a <= 0.01) continue;
      const ux = Math.cos(ang), uy = Math.sin(ang), x0 = cx + ux * r0, y0 = cy + uy * r0, x1 = x0 + ux * len, y1 = y0 + uy * len, h = len * 0.6, hw = h * 0.5;
      ctx.globalAlpha = a; ctx.strokeStyle = ctx.fillStyle = "#ff6e50"; ctx.lineWidth = S * 0.009; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * h * 0.8, y1 - uy * h * 0.8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * h - uy * hw, y1 - uy * h + ux * hw); ctx.lineTo(x1 - ux * h + uy * hw, y1 - uy * h - ux * hw); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  // titles on the run's own clock ({ tlabels: [[text, colour, from s, until s | null], …] }), one place, the next taking over
  for (const [s, col, a, b] of o.tlabels || []) {
    const run = t - o.start, f = smooth((run - a) / 0.6) * (b == null ? 1 : 1 - smooth((run - b) / 0.5)); if (f <= 0) continue;
    ctx.globalAlpha = f; text(ctx, s.toUpperCase(), W / 2, H * 0.12, Math.min(W, H) * 0.075, col); ctx.globalAlpha = 1;
  }
  // (a third entry, s into the run, times a title to its words)
  (o.labels || []).forEach(([s, col, at], i) => {
    const f = smooth((t - o.start - (at ?? 0.8 + i * 1.6)) / 0.7); if (f <= 0) return;
    ctx.globalAlpha = f; text(ctx, s, W / 2, H * (0.1 + i * 0.065), Math.min(W, H) * 0.045, col); ctx.globalAlpha = 1;
  });
  return geo;
}

// ---------- our universe and an alien's: the edge, two horizons, and the observable universe (the author's design,
// 2026-11-09, The Cosmic Event Horizon), drawn with the powers-of-ten zoom's own objects (the author: not the
// wavelength explorer's shells): Our Universe (src/event-horizon-object.js) and the observable universe
// (src/cmb-object.js) ----------
// { edge: { phase } }, phases by cue (absolute take times, like the crush's): start (our universe turning), past (its
// distant past's arrow), alien (the
// turn stops; a red circle on a galaxy at our edge), theirs (a second Our Universe, turned its own way, grows round
// that galaxy: their universe), see (a circle grows from ours out to the observable universe as the view pulls back,
// its galaxies showing inside it, part of their universe now among them), meet (the microwave background fades in on
// it). From the dive it starts where the chart left it, centred, and grows in place; ours is marked "now" at its centre
// and "light in our distant past" at its edge on the alien's side (from the past phase, "but"); when theirs comes, the two slide to sit
// side by side, level, theirs marked below: their now, and an arrow to our now saying they only see our distant past
// (the author, 2026-11-09, evening, and 2026-11-10).
let _edgeObjs = null;
const edgeObjs = () => _edgeObjs || (_edgeObjs = { ours: eventHorizonObject(), theirs: eventHorizonObject(), web: cmbObject({ far: 0, near: 0 }), cmb: cmbObject() });
export const edgePending = () => { const o = edgeObjs(); return Object.values(o).filter(x => x && !x.ready()).length; };
export function drawEdge(ctx, W, H, o, t) {
  const O = edgeObjs(), start = o.start ?? t, alien = o.alien ?? Infinity, theirs = o.theirs ?? Infinity, see = o.see ?? Infinity, meet = o.meet ?? Infinity;
  const OBS = 1 / HORIZON;                                              // the observable universe in our universe's radii (45.3 / 16.6)
  const grow = smooth((t - see) / 3.4), R = 1 + (OBS - 1) * grow;     // the circle growing out to it
  const ft = smooth((t - theirs) / 1.6), fin = smooth((t - start) / 1.4);
  // from the size the dive left it at (0.19 of the frame's width, the chart's Our Universe at span 0.35) to the diagram's
  const U0 = Math.min(W, H) * (0.19 + 0.11 * fin), U = U0 / (1 + (OBS * 0.98 * U0 / (Math.min(W, H) * 0.47) - 1) * grow);   // pulls back so it fits
  // centred; when theirs comes, the pair centred instead (theirs to the right), back to ours in the middle as the
  // observable universe grows round us
  const ex = 0.9, ey = 0;                                               // the galaxy at our edge, level with us
  // (back to the middle as the microwave background comes in, where the chart's picture of it takes over: 2:55)
  const cx = W / 2 - ft * (1 - grow) * ex / 2 * U, cy = H * (0.5 - 0.04 * fin * (1 - smooth((t - meet) / 1.8))), frozen = Math.min(t, alien) - start; // our universe turns until the alien
  // a picture of one of the objects: its sphere is FILL of the picture
  const put = (obj, sec, x, y, r, a = 1, clipR = null) => {
    if (!obj || a <= 0.01) return;
    const size = Math.min(1536, Math.max(256, Math.round(2 * r / FILL / 64) * 64)), c = obj.draw(size, sec), d = 2 * r / FILL;
    ctx.save(); ctx.globalAlpha = a;
    if (clipR != null) { ctx.beginPath(); ctx.arc(x, y, clipR, 0, 6.2832); ctx.clip(); }
    ctx.drawImage(c, x - d / 2, y - d / 2, d, d); ctx.restore();
  };
  const X = (u) => cx + u * U, Y = (v) => cy + v * U;
  // the observable universe's galaxies, inside the growing circle; then its microwave background
  const fm = smooth((t - meet) / 1.8);
  // once the microwave background is in, everything drawn on it (our and their galaxies, the rings, the labels) fades,
  // so the bare sphere is what the chart's own picture takes over from (the author, 2026-11-11, 2:53: the hand-over
  // "is not seamless": the galaxies inside and the rings went in a cut)
  const keep = 1 - smooth((t - meet - 1.2) / 1.6);
  if (grow > 0) put(O.web, frozen, X(0), Y(0), OBS * U, 1 - fm, R * U);
  if (fm > 0) put(O.cmb, frozen, X(0), Y(0), OBS * U, fm);
  // ours, and theirs round the edge galaxy, turned its own way
  put(O.ours, frozen, X(0), Y(0), U, keep);
  if (ft > 0) put(O.theirs, frozen + 9, X(ex), Y(ey), U * ft, ft * (grow > 0 ? 0.85 : 0.7) * keep);
  const ring = (u, v, r, col, a, dash, w = 0.005) => { if (a <= 0.01) return; ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = H * w; ctx.setLineDash(dash ? [H * 0.018, H * 0.014] : []); ctx.beginPath(); ctx.arc(X(u), Y(v), r * U, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; };
  ctx.globalAlpha = keep; ctx.fillStyle = "#80deea"; ctx.beginPath(); ctx.arc(X(0), Y(0), H * 0.007, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1;
  ctx.globalAlpha = 1 - smooth((t - start - 0.2) / 0.7) * (1 - smooth(grow * 3));   // ("now" says it while the arrows show)
  text(ctx, "us", X(0), Y(0) - H * 0.026, H * 0.022, "#80deea"); ctx.globalAlpha = 1;
  const fo = smooth((t - alien) / 0.8);
  if (fo > 0) { ctx.globalAlpha = fo * keep; text(ctx, "our universe", X(-0.45), Y(1) + H * 0.04, H * 0.028, "#80deea"); ctx.globalAlpha = 1; }
  if (fo > 0) {                                                         // the red circle on the alien's galaxy
    ctx.globalAlpha = fo; ctx.strokeStyle = "#ff5252"; ctx.lineWidth = H * 0.005;
    ctx.beginPath(); ctx.arc(X(ex), Y(ey), H * 0.02, 0, 6.2832); ctx.stroke(); ctx.globalAlpha = 1;
    // (its name kept inside the frame: centred on the circle it ran off the right edge, the author, 2026-11-11, 2:20)
    if (ft < 0.5) {
      ctx.font = `700 ${H * 0.026}px "Barlow Condensed", "Arial Narrow", sans-serif`;
      const tw = ctx.measureText("AN ALIEN'S GALAXY").width * 1.1, lx = Math.min(X(ex), W * 0.95 - tw / 2);
      ctx.globalAlpha = fo * (1 - 2 * ft); text(ctx, "an alien's galaxy", lx, Y(ey) - H * 0.045, H * 0.026, "#ff8a80"); ctx.globalAlpha = 1;
    }
  }
  if (ft > 0) { ring(ex, ey, ft, "#ffab40", ft * keep, false); ctx.globalAlpha = ft * keep; text(ctx, "their universe", X(ex), Y(ey - ft) - H * 0.02, H * 0.028, "#ffab40"); ctx.globalAlpha = 1; }
  // now and the distant past: at our centre and our edge (from the dive), at theirs below (when theirs comes); gone as
  // the view pulls back
  const arrow = (x0, y0, x1, y1, label, col, a, up) => {
    if (a <= 0.01) return;
    const d = Math.hypot(x1 - x0, y1 - y0), k = Math.min(1, smooth(a * 1.4)), ux = (x1 - x0) / d, uy = (y1 - y0) / d;
    const xe = x0 + (x1 - x0) * k, ye = y0 + (y1 - y0) * k, hs = H * 0.012;
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = H * 0.0028;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(xe - ux * hs * 0.6, ye - uy * hs * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(xe, ye); ctx.lineTo(xe - ux * hs - uy * hs * 0.6, ye - uy * hs + ux * hs * 0.6); ctx.lineTo(xe - ux * hs + uy * hs * 0.6, ye - uy * hs - ux * hs * 0.6); ctx.fill();
    ctx.restore();
    ctx.globalAlpha = a; text(ctx, label, x0, y0 + (up ? -H * 0.012 : H * 0.03), H * 0.022, col); ctx.globalAlpha = 1;
  };
  // (the distant past from its own cue, "but", to our universe's edge on the alien's side; theirs points at us, our now: all they see
  // of us is our distant past (the author, 2026-11-10))
  // (the "now" arrow at once: the chart's own, "not the centre, just our now", points there through the dive and this
  // one takes over, the author, 2026-11-11)
  const off = 1 - smooth(grow * 3), fa = smooth((t - start - 0.2) / 0.7) * off, fb = smooth((t - theirs - 1.4) / 0.9) * off;
  const fp = smooth((t - (o.past ?? start + 0.8)) / 0.9) * off;
  const on = (u, v, ang, r = 1) => [X(u + r * Math.cos(ang)), Y(v + r * Math.sin(ang))];
  // (to the right edge, where the alien's galaxy is: the author, 2026-11-10)
  { const [px, py] = on(0, 0, -0.35, 0.97);
    arrow(Math.min(X(0.55), W * 0.73), Y(-1) - H * 0.115, px, py, "light in our distant past", "#80deea", fp, true);   // (inside the frame)
    arrow(X(-0.62), Y(-1) - H * 0.035, X(0) - H * 0.01, Y(0) - H * 0.012, "now", "#80deea", fa, true); }
  if (ft > 0) {
    arrow(X(0.35), Y(1) + H * 0.115, X(0) + H * 0.006, Y(0) + H * 0.014, "they only see our distant past", "#ffab40", fb, false);
    arrow(X(ex) + U * 0.7, Y(1) + H * 0.035, X(ex) + H * 0.01, Y(ey) + H * 0.012, "their now", "#ffab40", fb, false); }
  if (grow > 0) {
    ring(0, 0, R, "#ffffff", Math.min(1, grow * 3) * 0.85 * (1 - fm), true, 0.004);
    ctx.globalAlpha = smooth((grow - 0.5) / 0.4) * keep; text(ctx, "our observable universe", X(0), Y(-R) - H * 0.02, H * 0.028, "#ffffff"); ctx.globalAlpha = 1;
  }
}

// ---------- the observable universe, cut open (the author's design, 2026-11-09, The Observable Universe) ----------
// { obs: { phase } }, phases by cue (absolute take times), drawn with the zoom's own objects like drawEdge: start (our
// universe, its 16.7 billion ly ring), obs (the view pulls back: the observable universe round it, a triangular cut in
// its shell showing the inside, rings at every few billion light-years), hl (its edge highlighted: 46 billion ly), past
// (from the centre outwards, slowly: what the light we see left before; the centre darkens behind as each era is named:
// clusters, galaxies, stars; the view starts close on the centre and pulls back slowly so each named one is in view),
// cmb (the oldest light: the shell fades in, red, and the view keeps pulling back, slowly).
// (named at their tops, centred, for the Shorts' narrow frame; the innermost two too close to name)
const OBS_RINGS = [[1, ""], [5, ""], [10, "10 billion ly"], [16.7, "our universe · 16.7 billion ly"], [30, "30 billion ly"], [46.3, "46 billion ly"]];
// the eras the light left in, at their distances now (comoving, billion ly) and how long ago it set out
// (z ≈ 1, 2.5, 7 and 20 in Planck 2018's cosmology)
const OBS_ERAS = [["superclusters", 11, "before superclusters · 8 billion years ago"], ["clusters", 20, "before clusters · 11 billion years ago"],
  ["galaxies", 29, "before galaxies · 13 billion years ago"], ["stars", 36, "before the first stars · 13.6 billion years ago"]];
export function drawObservable(ctx, W, H, o, t) {
  const O = edgeObjs(), start = o.start ?? t, obs = o.obs ?? Infinity, hl = o.hl ?? Infinity, past = o.past ?? Infinity, cmbT = o.cmb ?? Infinity;
  const EDGE = 46.3, cx = W / 2, cy = H * 0.46, Rmax = Math.min(W, H) * 0.44;
  const pull = smooth((t - obs) / 3);                                     // ours → the whole observable universe
  // the past: close on the centre (the first era's ring near the frame's edge), then back out with each era named,
  // to the whole universe by the stars; past the oldest light, further out still
  const eras = OBS_ERAS.map(([key, gly, label]) => ({ gly, label, at: o[key] ?? Infinity }));
  let view = EDGE;
  if (t >= past) {
    let v = 13 + (EDGE - 13) * (1 - smooth((t - past) / 1.6));            // in, quickly, as "a time before" begins
    for (const e of eras) if (t >= e.at) v = 13 + (Math.min(EDGE, e.gly * 1.3) - 13) * smooth((t - e.at) / 4) + (v - 13) * (1 - smooth((t - e.at) / 4));
    view = Math.min(EDGE, v);
  }
  const zc = smooth((t - cmbT) / 14), z = EDGE / view * (1 - 0.3 * zc);
  const Robs = Rmax * z * (pull + (1 - pull) / HORIZON), Rours = Robs * HORIZON, sec = t - start;
  const put = (obj, x, y, r, a = 1, clip = null) => {
    if (!obj || a <= 0.01) return;
    const size = Math.min(1536, Math.max(256, Math.round(2 * r / FILL / 64) * 64)), c = obj.draw(size, sec), d = 2 * r / FILL;
    ctx.save(); ctx.globalAlpha = a; if (clip) { ctx.beginPath(); clip(); ctx.clip(); } ctx.drawImage(c, x - d / 2, y - d / 2, d, d); ctx.restore();
  };
  // the triangle cut out of the shell: a wedge from the centre, up and to the right
  const wedge = () => { ctx.moveTo(cx, cy); ctx.arc(cx, cy, Robs * 1.02, -1.25, -0.2); ctx.closePath(); };
  const fc = smooth((t - cmbT) / 5);
  if (pull > 0) {
    put(O.cmb, cx, cy, Robs, pull * (1 - 0.7 * smooth((t - past) / 2)) + 0.7 * fc);   // dims through the past, back for the oldest light
    if (fc > 0) {                                                         // the oldest light in red
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, Robs, 0, 6.2832); ctx.clip();
      ctx.globalCompositeOperation = "color"; ctx.globalAlpha = fc; ctx.fillStyle = "#ff3d1f"; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    put(O.web, cx, cy, Robs, pull * (1 - fc), wedge);                     // inside the cut: the galaxies, no shell
    ctx.save(); ctx.globalAlpha = pull * (1 - fc); ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = H * 0.003; ctx.beginPath(); wedge(); ctx.stroke(); ctx.restore();
  }
  put(O.ours, cx, cy, Rours, 1 - 0.6 * pull);
  // the rings, every few billion light-years (in the cut), the edge highlighted when it's named
  const fr = smooth((t - obs - 1.5) / 1.5) * (1 - smooth((t - past) / 1.2)), fh = smooth((t - hl) / 0.8);
  for (const [gly, name] of OBS_RINGS) {
    const r = Robs * gly / EDGE, edge = gly > 40, a = (gly === 16.7 ? Math.max(fr, 1 - pull) : fr) * (edge ? 0.6 + 0.4 * fh : 0.55);
    if (r > Math.hypot(W, H)) continue;
    if (a <= 0.01 || r < H * 0.01) continue;
    ctx.globalAlpha = a; ctx.strokeStyle = edge && fh > 0 ? "#ffd54f" : gly === 16.7 ? "#80deea" : "#ffffff"; ctx.lineWidth = H * (edge && fh > 0 ? 0.005 : 0.0025);
    ctx.setLineDash(gly === 16.7 ? [H * 0.012, H * 0.01] : []); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
    if (name) text(ctx, edge && fh > 0 ? "observable universe · 46 billion ly" : name, cx, cy - r - H * 0.008, H * (edge && fh > 0 ? 0.022 : 0.017), ctx.strokeStyle);
  }
  ctx.globalAlpha = 1;
  // the past: from the centre out, slowly; behind each named era the light goes dark
  if (t >= past) {
    let reach = 0; for (const e of eras) if (t >= e.at) reach = Math.max(reach, smooth((t - e.at) / 2.5) * e.gly);
    reach = Math.max(reach, smooth((t - past) / 3) * 6, smooth((t - cmbT) / 3) * EDGE * 0.97);
    const dark = Robs * reach / EDGE;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, dark));
    g.addColorStop(0, "rgba(0,0,0,.96)"); g.addColorStop(0.85, "rgba(0,0,0,.9)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, dark, 0, 6.2832); ctx.fill();
    for (const e of eras) {
      const a = smooth((t - e.at) / 0.8) * (1 - fc); if (a <= 0) continue;
      const r = Robs * e.gly / EDGE; ctx.globalAlpha = a; ctx.strokeStyle = "#ffab40"; ctx.lineWidth = H * 0.004; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.stroke();
      text(ctx, e.label, cx, cy - r - H * 0.012, H * 0.021, "#ffab40");
    }
    ctx.globalAlpha = 1;
  }
  const ft = smooth((t - cmbT - 2) / 1.5);
  if (ft > 0) {
    const y = Math.min(H * 0.72, cy + Robs + H * 0.035);
    ctx.globalAlpha = ft; text(ctx, "the oldest light", cx, y, H * 0.026, "#ff8a65"); text(ctx, "380,000 years after the Big Bang", cx, y + H * 0.032, H * 0.02, "#ff8a65"); ctx.globalAlpha = 1;
  }
}

// ---------- fusion in diamonds (long-02b-opening, the author, 2026-11-17, 3:40: "pick a bunch of groups of 4 circles that
// touch each other in a diamond shape and then merge these groups all at the same time ... when it says 'a large amount of
// energy is released' we should center around a single one of these new helium atoms and have a big wave of arrows moving
// away from it, pushing other atoms off the screen") ----------
// The Squeeze Lab's look (yellow rings, the chart's proton pictures), scripted rather than simulated. Phases (the cues'
// times): start (protons jostling, blue pushes between neighbours), squeeze (gravity's orange arrows from the edges; each
// four closes into a diamond, its rings touching, yellow pulls between them: the strong force reaching), capture (every
// diamond merges at once: the rings join, squeeze tall and ring into one, two protons turn into neutrons), energy (the view
// closes in on one helium; waves of red arrows run out from it, shoving the rest off the screen), balance (gravity's arrows
// back at the edges, the waves still pushing out), fusion (its name).
export function drawDiamonds(ctx, W, H, o, t) {
  const TAU = Math.PI * 2, U = Math.min(W, H), cx = W / 2, cy = H / 2, r = U * 0.055, A4 = Math.SQRT2 * r;
  const start = o.start ?? t, sqz = o.squeeze ?? start + 6, cap = o.capture ?? sqz + 3, en = o.energy ?? cap + 5,
    bal = o.balance ?? en + 4, fus = o.fusion ?? bal + 2.5;
  const sq = smooth((t - sqz) / Math.max(1, cap - sqz - 0.2)), mf = smooth((t - cap) / 0.9), zf = smooth((t - en) / 1.6);
  const TN = cap + 1.1;                                                   // two of each four become neutrons
  // the groups on a loose hex grid round the middle; the one nearest the middle is the one the view closes in on
  const G = U * 0.36, groups = [], JM = Math.ceil(H / G) + 1, IM = Math.ceil(W / G) + 1;
  for (let j = -JM; j <= JM; j++) for (let i = -IM; i <= IM; i++) {
    const k = (i + 40) * 97 + (j + 40), gx = (i + (j & 1 ? 0.5 : 0)) * G + (unit2(k, 4) - 0.5) * G * 0.18, gy = j * G * 0.87 + (unit2(k, 5) - 0.5) * G * 0.18;
    groups.push({ k, gx, gy, rot: unit2(k, 6) * 0.6 - 0.3, d0: Math.hypot(gx, gy) });
  }
  const hero = groups.reduce((a, b) => (b.d0 < a.d0 ? b : a));
  // the wave: fronts running out from the hero every 0.9 s once the energy comes out
  const front = (n) => (t - en - 0.4 - n * 1.1) * U * 0.3;   // (slow enough to see the others shoved away)
  // the view: centred on the hero and closer as the energy comes out
  const zoom = 1 + 0.75 * zf, vx = hero.gx * zf, vy = hero.gy * zf;
  const X = (x) => cx + (x - vx) * zoom, Y = (y) => cy + (y - vy) * zoom, Z = (d) => d * zoom;
  // where each group is now: spread apart before the squeeze, shoved outwards by the first front after the energy
  const spreadG = 1.22 - 0.22 * sq;
  for (const g of groups) {
    let x = g.gx * spreadG, y = g.gy * spreadG;
    if (g !== hero && t > en) {
      const dx = x - hero.gx, dy = y - hero.gy, d = Math.hypot(dx, dy) || 1, f0 = front(0), shove = Math.max(0, f0 - d + r * 2.4);
      x += dx / d * shove; y += dy / d * shove;
    }
    g.x = x; g.y = y;
  }
  // the protons of each group: off their diamond points while loose, on them when squeezed, gathered in when merged
  const spreadP = 1.85 - 0.85 * sq, gather = 1 - 0.5 * mf, jamp = r * (0.4 - 0.36 * sq) * (1 - mf);
  const ps = [];
  for (const g of groups) for (let n = 0; n < 4; n++) {
    const a = g.rot + n * TAU / 4, k = g.k * 4 + n, ja = unit2(k, 1) * TAU + t * (0.6 + unit2(k, 2) * 0.8);
    const x = g.x + Math.cos(a) * A4 * spreadP * gather + Math.cos(ja) * jamp, y = g.y + Math.sin(a) * A4 * spreadP * gather + Math.sin(ja) * jamp;
    ps.push({ g, n, k, x, y });
  }
  const onScreen = (x, y, m) => X(x) > -m && X(x) < W + m && Y(y) > -m && Y(y) < H + m;
  // a pointing arrow (the bonds' kind: one size of head)
  const pa = (x0, y0, x1, y1, col, a, w) => {
    const len = Math.hypot(x1 - x0, y1 - y0), hd = Z(r) * 0.42; if (len < hd * 1.2 || a <= 0.01) return;
    const ux = (x1 - x0) / len, uy = (y1 - y0) / len, hw = hd * 0.45;
    ctx.globalAlpha = a; ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hd * 0.8, y1 - uy * hd * 0.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * hd - uy * hw, y1 - uy * hd + ux * hw); ctx.lineTo(x1 - ux * hd + uy * hw, y1 - uy * hd - ux * hw); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  };
  // the rings: each proton's own until the merge, then one bubble per group that squeezes tall and rings into a circle
  ctx.lineJoin = "round";
  for (const g of groups) {
    if (!onScreen(g.x, g.y, Z(r) * 4)) continue;
    const mine = ps.filter(p => p.g === g);
    ctx.strokeStyle = "rgb(255,213,74)"; ctx.lineWidth = U * 0.004; ctx.shadowColor = "#ffd54f"; ctx.shadowBlur = U * 0.012;
    ctx.fillStyle = "rgba(255,213,74,0.06)";
    if (t < cap) for (const p of mine) { ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), Z(r), 0, TAU); ctx.fill(); ctx.stroke(); }
    else if (mf < 1) { const b = blobPath(mine.map(p => ({ x: X(p.x), y: Y(p.y), r: Z(r) * (1 + 0.35 * mf) }))); if (b) { ctx.beginPath(); b.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); ctx.stroke(); } }
    else { const q = squash(t - cap - 0.9), R = Z(r) * 1.95; ctx.fillStyle = "rgba(255,213,74,0.08)"; ctx.beginPath(); ctx.ellipse(X(g.x), Y(g.y), R * (1 - q), R * (1 + q), 0, 0, TAU); ctx.fill(); squashedCircle(ctx, X(g.x), Y(g.y), R, q, U, "#ffe9a3"); }
    ctx.shadowBlur = 0;
  }
  // the nucleons: the chart's pictures; two of each four turn into neutrons a moment after the merge, with a flash
  for (const p of ps) {
    if (!onScreen(p.x, p.y, Z(r) * 2)) continue;
    const x = X(p.x), y = Y(p.y), d = Z(r) * 1.15, neu = p.n % 2 === 1, f = neu ? smooth((t - TN) / 0.4) : 0;
    if (f < 1) particle(ctx, "proton", x, y, d, 1 - f, "#ff8a80", spin(p.k), sizeOf(p.k));
    if (f > 0) particle(ctx, "neutron", x, y, d * 0.92, f, "#e0e0e0", spin(p.k + 1), sizeOf(p.k));
    const age = t - TN;
    if (neu && age > 0 && age < 0.5) { ctx.globalAlpha = (1 - age / 0.5) * 0.9; ctx.strokeStyle = "#e1bee7"; ctx.lineWidth = U * 0.004; ctx.beginPath(); ctx.arc(x, y, d * 0.5 * (1 + 1.8 * age / 0.5), 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
  }
  // the arrows between them, pointing at each other (the author: "pointing to the other nucleus or electrons instead
  // of being just a hard thing"): blue pushes between protons close to each other, before the merge; yellow pulls
  // between the four of a diamond once they touch, until they're one
  const blueA = smooth((t - start - 0.6) / 0.8) * (1 - smooth((t - cap) / 0.5)), yelA = smooth((t - sqz - 1) / 0.8) * (1 - smooth((t - cap - 0.5) / 0.5));
  const w = U * 0.005;
  if (blueA > 0.01) for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
    const P = ps[i], Q = ps[j]; if (P.g === Q.g && sq > 0.6) continue;
    const dx = Q.x - P.x, dy = Q.y - P.y, d = Math.hypot(dx, dy), gap = d - 2 * r; if (gap > r * 1.1 || gap < -r * 0.2) continue;
    if (!onScreen((P.x + Q.x) / 2, (P.y + Q.y) / 2, 0)) continue;
    if ((P.k * 7 + Q.k * 13) % 3) continue;   // a third of the pairs: enough to read, not a thicket
    const ux = dx / d, uy = dy / d, mx = P.x + ux * (r + gap / 2), my = P.y + uy * (r + gap / 2), half = Math.max(r * 0.85, gap / 2 + r * 0.35);
    const a = blueA * clamp01((r * 1.1 - gap) / (r * 0.5));
    pa(X(mx + ux * r * 0.1), Y(my + uy * r * 0.1), X(mx + ux * half), Y(my + uy * half), "#96cdff", a, w);
    pa(X(mx - ux * r * 0.1), Y(my - uy * r * 0.1), X(mx - ux * half), Y(my - uy * half), "#96cdff", a, w);
  }
  if (yelA > 0.01) for (const g of groups) {
    if (!onScreen(g.x, g.y, Z(r) * 3)) continue;
    const mine = ps.filter(p => p.g === g);
    for (let n = 0; n < 4; n++) {
      const P = mine[n], Q = mine[(n + 1) % 4], dx = Q.x - P.x, dy = Q.y - P.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, nx = -uy * r * 0.2, ny = ux * r * 0.2;
      pa(X(P.x + ux * r * 0.55 + nx), Y(P.y + uy * r * 0.55 + ny), X(Q.x - ux * r * 0.3 + nx), Y(Q.y - uy * r * 0.3 + ny), "#ffd54a", yelA, w);
      pa(X(Q.x - ux * r * 0.55 - nx), Y(Q.y - uy * r * 0.55 - ny), X(P.x + ux * r * 0.3 - nx), Y(P.y + uy * r * 0.3 - ny), "#ffd54a", yelA, w);
    }
  }
  // gravity: orange arrows in from the edges while it squeezes, and again as the push balances it
  const gA = smooth((t - sqz) / 0.8) * (1 - smooth((t - cap - 0.4) / 0.6)) + smooth((t - bal) / 0.8);
  if (gA > 0.01) { ctx.globalAlpha = Math.min(1, gA); for (let i = 0; i < 10; i++) edgeArrow(ctx, W, H, i * TAU / 10 + TAU / 20, U * 0.12, U * 0.03, "#ffab40", U * 0.009, U * 0.012 * Math.sin(t * 5)); ctx.globalAlpha = 1; }
  // the energy: fronts of red arrows running out from the hero
  if (t > en) for (let n = 0; n < 12; n++) {
    const R0 = front(n); if (R0 <= 0) break;
    const fa = smooth((t - en - 0.4 - n * 1.1) / 0.3) * (1 - smooth((R0 - U * 1.2) / (U * 0.3)));
    if (fa <= 0.01) continue;
    for (let i = 0; i < 14; i++) {
      const a = i * TAU / 14 + n * 0.22, ux = Math.cos(a), uy = Math.sin(a), rr = Z(r) * 2.2 + R0;
      pa(X(hero.gx) + ux * rr, Y(hero.gy) + uy * rr, X(hero.gx) + ux * (rr + U * 0.12), Y(hero.gy) + uy * (rr + U * 0.12), "#ff6e50", fa, U * 0.009);
    }
  }
  // the words: the key one in yellow, under the hero
  const hy = Y(hero.gy) + Z(r) * 2.6 + U * 0.04;
  const heA = smooth((t - TN - 0.6) / 0.6) * (1 - smooth((t - fus) / 0.4)), fuA = smooth((t - fus) / 0.5);
  if (heA > 0.01) { ctx.globalAlpha = heA; text(ctx, "helium", X(hero.gx), hy, U * 0.036, "#ffd54f"); ctx.globalAlpha = 1; }
  if (fuA > 0.01) { ctx.globalAlpha = fuA; text(ctx, "fusion", X(hero.gx), hy, U * 0.05, "#ffd54f"); ctx.globalAlpha = 1; }
}

// ---------- heavy atoms on black: gold, platinum, uranium (the author, 2026-11-20, 5:30: "when I say gold, platinum, etc
// cut to black and show these atom arrangements on the screen, each occupying a third, rotating and with a label on the
// bottom"; then "so in a way it's like a battery": "fade the other elements, keep just the uranium with a label: energy
// battery. Collide stars to charge") ----------
// { atoms: { phase } }, phases by cue (start, battery); the Hopf atoms (public/hopf/hopf-core.js), each turning its own way
let _atomViews = null, _atomsFailed = false;
const ATOMS = [["gold", "gold", "79 protons"], ["platinum", "platinum", "78 protons"], ["uranium", "uranium", "92 protons"]];
function atomViews() {
  if (_atomViews || _atomsFailed) return _atomViews;
  _atomViews = false;
  hopfCore().then(({ core, renderer }) => {
    _atomViews = { renderer, views: ATOMS.map(([id], i) => { const v = new core.HopfView(renderer, null, core.PARTICLES.find(p => p.id === id)); v.yaw0 = 0.7 + i * 2.1; v.pitch0 = v.pitch; return v; }) };
  }).catch(err => { console.warn("atoms unavailable:", err.message); _atomsFailed = true; });
  return _atomViews;
}
export const atomsPending = () => { const a = atomViews(); return a || _atomsFailed ? 0 : 1; };
export function drawAtoms(ctx, W, H, o, t) {
  const A = atomViews(); if (!A) return;
  const start = o.start ?? t, bat = o.battery ?? Infinity, since = t - start;
  const k = smooth((t - bat) / 1.2);                                  // the battery: the others go, uranium to the middle
  const S = Math.min(W / 3, H * 0.62) * 0.98;
  ATOMS.forEach(([, name, sub], i) => {
    const keep = i === 2, a = keep ? 1 : 1 - smooth((t - bat) / 0.8);
    if (a <= 0.01) return;
    const x0 = W * (i + 0.5) / 3, x = keep ? x0 + (W / 2 - x0) * k : x0, size = S * 1.3 * (keep ? 1 + 0.2 * k : 1), y = H * 0.42;   // (the render's frame is mostly glow: the atom fills its third)
    const v = A.views[i];
    v.yaw = v.yaw0 + 0.35 * since; v.pitch = v.pitch0 + 0.35 * Math.sin(0.5 * since + i * 1.7);
    v.update(t, HOPF_OPTS);
    A.renderer.resize(Math.min(1024, Math.ceil(size / 64) * 64));
    ctx.globalAlpha = a; A.renderer.render(v, HOPF_OPTS, [ctx, x - size / 2, y - size / 2, size, size]);
    // the labels at the bottom: the name and its protons; on the battery, uranium's own
    const fs = Math.min(W, H) * 0.045, ly = y + S * 0.6 + fs * 1.4;
    const la = keep ? 1 - smooth((t - bat) / 0.5) : 1;
    if (la > 0.01) { ctx.globalAlpha = a * la; text(ctx, name.toUpperCase(), x, ly, fs, "#ffe9a3"); text(ctx, sub, x, ly + fs * 1.05, fs * 0.6, "#d8dde8"); }
    if (keep && k > 0) {
      const lb = smooth((t - bat - 0.6) / 0.6); ctx.globalAlpha = lb;
      text(ctx, "ENERGY BATTERY", W / 2, ly, fs * 1.1, "#ffd54a");
      text(ctx, "collide stars to charge", W / 2, ly + fs * 1.15, fs * 0.7, "#d8dde8");
    }
    ctx.globalAlpha = 1;
  });
}
