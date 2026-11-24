// src/narr-p10.js — a powers-of-ten zoom out on the diagram canvas: from the neutron-star-collapse simulation's last
// frame (fm) out to the whole neutron star (20 km), on a square grid that keeps its look (the author, 2026-11-20, 5:10:
// "keep a square grid and zoom out, from the atomic scale to the size of a neutron star").
// Rebuilt as a warp (the author, 2026-11-22: "remove the fractal thing … start acellerating slowly so we see a square
// become 10x smaller then we accelerate to see hexes becoming just too tiny and then it fades into a noise layer, and we
// accelerate quickly outwards with just a lot of noise layer going outwards with s motion blur … like if we were warping
// at light speed. During the whole zoom out we see squares every 1000x getting smaller"): the neutrons' lattice, then
// layers of plain noise in the star's greys streaming past with their own radial blur, squares every 1000×.
//
// { p10: { sim?, f0?, km?, dur?, end?, labels?, shutter?, flow? } }, drawn by narration.js with start = the cue's time:
//   sim   the squeeze run whose last frame the zoom starts on ({ start?, at?, mode, from, P, zoom }, as the squeeze cue's
//         options; start = that cue's exact time, or else `at` finds it among the take's cues). Its frame is frozen at
//         the cut, the run itself goes on under the lattice for its first second, both shrinking together, and the
//         lattice continues the run's own grid (src/squeeze-sim.js buildHex: the same sites, spacing and sprite size on
//         screen at the cut, so the handover doesn't jump).
//   f0    the frame's width at the start, m (default: what makes the run's hexagonal grid LA fm a site; 1.5e-14 if it
//         has none)
//   km    the neutron star's diameter (20)
//   dur   the zoom's length, s (9.2); disc: the star's disc at the end, as a fraction of the frame's height (0.62)
//   labels [[text, s after the start], …] under the star (default: "neutron star · 20 km" as it arrives, then
//         "one giant nucleus")
//   shutter the streaks' exposure, s (1/24: a little over a frame, so the warp reads as motion in the drafts too)
//   flow  1: the noise streams inward with the grid, as a zoom out does (default); -1: outward, a forward warp
// Everything is a function of the take's clock t (render workers draw frames in any order). One WebGL2 canvas of its own
// for the noise; the star is the Star Forge's live model (src/star-forge.js). A lost context falls back to 2D.

import { drawSqueeze, nucleonFrames, spritesPending } from "./narr-diagrams.js";
import { createStarForge, starBySlug, discFraction } from "./star-forge.js";

const clamp01 = x => Math.max(0, Math.min(1, x));
const smooth = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
const LOG2_10 = Math.log2(10);

const DEFAULT_SIM = { at: "a new player enters", mode: 3, from: 11.5, P: { helium: true, hexAt: 21.6, hexTime: 1.6 }, zoom: [[0, 2.4], [34, 3.0]] };

export function p10Pending() { return spritesPending(); }

// ---------------------------------------------------------------- the zoom's clock
// decades zoomed out a second, u s after the start: slow at first, one decade in the first FIRST s (d = u²/FIRST², the
// fm square shrinking ten times), then growing GROW-fold an e-second towards a cruise of vmax (the warp), eased off
// over the last EASE s onto the star; vmax is found so the whole run covers the decades from the neutrons to the star
const FIRST = 3.0, GROW = 1.0, EASE = 2.3;
function vel(u, dur, vmax) {
  const v0 = 2 / FIRST;                                          // the speed at the end of the first decade
  const v = u <= FIRST ? 2 * u / (FIRST * FIRST) : vmax * Math.tanh(v0 * Math.exp(GROW * (u - FIRST)) / vmax);
  return v * (1 - smooth((u - (dur - EASE)) / EASE));
}
const PROFILE = new Map(), N_PROF = 600;
function profile(dur, D) {
  const key = `${dur}:${D.toFixed(4)}`;
  let P = PROFILE.get(key);
  if (P) return P;
  const integ = (vmax) => { const c = [0]; for (let i = 1; i <= N_PROF; i++) c.push(c[i - 1] + vel((i - 0.5) * dur / N_PROF, dur, vmax) * dur / N_PROF); return c; };
  let lo = 0.7, hi = 60;
  for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; if (integ(m)[N_PROF] < D) lo = m; else hi = m; }
  const c = integ((lo + hi) / 2), n = c[N_PROF];
  P = { c: c.map(x => x * D / n), vmax: (lo + hi) / 2 };   // (the last few % trued up, if the first decade can't fit)
  PROFILE.set(key, P);
  return P;
}
// log10 of the frame's width (m) at u
function logWidth(u, L0, L1, dur) {
  const P = profile(dur, L1 - L0).c;
  const x = clamp01(u / dur) * N_PROF, i = Math.min(N_PROF - 1, Math.floor(x));
  return L0 + P[i] + (P[i + 1] - P[i]) * (x - i);
}
// the inverse: u at which the frame is logF wide
function timeAt(logF, L0, L1, dur) {
  const P = profile(dur, L1 - L0).c, d = logF - L0;
  if (d <= 0) return 0;
  if (d >= P[N_PROF]) return dur;
  let lo = 0, hi = N_PROF;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (P[m] <= d) lo = m; else hi = m; }
  return (lo + (d - P[lo]) / Math.max(1e-9, P[hi] - P[lo])) * dur / N_PROF;
}

// ---------------------------------------------------------------- the neutrons' lattice
// Neutrons packed edge to edge on the run's hexagonal grid (fm, rows horizontal), each the live Hopf neutron turning (the
// sims' loops, src/narr-diagrams.js), each from its own frame and turned its own way; close up every one is drawn and
// trembles on its site as in the run, and once they're too small to see turn, a still tile of them (32 × 32 cells, repeating, with its own
// halvings so it shrinks without shimmering) carries the lattice on until it melts into the noise
const LA = 1.75, ND = LA, ROW = LA * Math.sqrt(3) / 2, TN = 32, TP = 32;   // spacing, neutron, row (fm); tile cells; tile px a cell
const hsh = (i, j, k) => { let h = (i * 374761393 + j * 668265263 + k * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const wrapT = (n) => ((n % TN) + TN) % TN;
function site(i, j, t, wob) {
  const a = wrapT(i), b = wrapT(j);
  return [(i + 0.5 * (j & 1)) * LA + wob * 0.03 * LA * Math.sin(t * 1.9 + hsh(a, b, 2) * 6.283),
    j * ROW + wob * 0.03 * LA * Math.cos(t * 1.6 + hsh(a, b, 4) * 6.283), hsh(a, b, 5), hsh(a, b, 6) * 6.283];
}
let tile = null;
function latticeTile(F) {
  if (tile) return tile;
  const k0 = TP / LA, w = TN * TP, h = Math.round(TN * ROW * k0), ky = h / (TN * ROW * k0);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"), dd = ND * k0 / 0.78;
  for (let j = -2; j < TN + 2; j++) for (let i = -2; i < TN + 2; i++) {
    const [x, y, f, rot] = site(i, j, 0, 0);
    g.setTransform(Math.cos(rot), Math.sin(rot), -Math.sin(rot), Math.cos(rot), x * k0, y * k0 * ky);
    g.drawImage(F[Math.floor(f * F.length)], -dd / 2, -dd / 2, dd, dd);
  }
  const levels = [c];
  while (levels.at(-1).width > 48) {
    const p = levels.at(-1), q = document.createElement("canvas"); q.width = Math.round(p.width / 2); q.height = Math.round(p.height / 2);
    const qg = q.getContext("2d"); qg.imageSmoothingQuality = "high"; qg.drawImage(p, 0, 0, q.width, q.height); levels.push(q);
  }
  return (tile = levels);
}
// ppf: px a fm; ox, oy: site (0, 0) on screen; a: opacity; live: how far the neutrons are drawn one by one (1) rather
// than the tile (0)
function drawLattice(ctx, W, H, ppf, ox, oy, t, a, live) {
  const F = nucleonFrames()?.neutron; if (!F?.length || a <= 0.01) return;
  if (live < 1) {
    const L = latticeTile(F), want = TN * LA * ppf;   // the tile's width on screen
    let lv = 0; while (lv < L.length - 1 && L[lv + 1].width >= want) lv++;
    const pat = ctx.createPattern(L[lv], "repeat");
    pat.setTransform(new DOMMatrix([want / L[lv].width, 0, 0, TN * ROW * ppf / L[lv].height, ox, oy]));
    ctx.globalAlpha = a * (1 - live); ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H);
  }
  if (live > 0) {
    const dd = ND * ppf / 0.78, x0 = -ox / ppf - LA, x1 = (W - ox) / ppf + LA, y0 = -oy / ppf - LA, y1 = (H - oy) / ppf + LA;
    ctx.globalAlpha = a * live;
    for (let j = Math.floor(y0 / ROW) - 1; j <= Math.ceil(y1 / ROW) + 1; j++) for (let i = Math.floor(x0 / LA) - 1; i <= Math.ceil(x1 / LA) + 1; i++) {
      const [x, y, f, rot] = site(i, j, t, 1);
      if (x < x0 || x > x1 || y < y0 || y > y1) continue;
      ctx.setTransform(Math.cos(rot), Math.sin(rot), -Math.sin(rot), Math.cos(rot), ox + x * ppf, oy + y * ppf);
      ctx.drawImage(F[(Math.floor(t * 6 + f * F.length) % F.length + F.length) % F.length], -dd / 2, -dd / 2, dd, dd);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- the noise (WebGL2)
const VS = `#version 300 es
in vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }`;

// q is in frame widths about the centre. Layer k is a sheet of cloud (gradient noise, cut to clouds with gaps) with a
// wavelength of C0·2^(k-s) frames (s: octaves zoomed out), weighted by sin² of where it sits in the band of NOCT
// layers, so the sum looks the same at every s and the layers only ever shrink past: an endless zoom out, anchored to
// the world. The streaks: each pixel averages the layers over the octaves passed during the shutter (uDS), with a
// per-pixel jitter so the taps blend into grain rather than ghosts; and a sparse dust of specks, placed in (angle, log
// radius) so they're as thick at every radius, each drawn exactly as the line it sweeps during the shutter.
const FS = `#version 300 es
precision highp float; precision highp int;
#define NOCT 6
#define TAPS 28
uniform vec2 uRes; uniform float uS, uDS, uTime, uNoise, uLimb, uEnd, uDust, uFlow;
out vec4 o;
uvec3 pcg3(uvec3 v){ v = v*1664525u + 1013904223u; v.x += v.y*v.z; v.y += v.z*v.x; v.z += v.x*v.y;
  v ^= v >> 16u; v.x += v.y*v.z; v.y += v.z*v.x; v.z += v.x*v.y; return v; }
vec3 grad(ivec3 c){ uvec3 h = pcg3(uvec3(c)); return normalize(vec3(h & 1023u) / 511.5 - 1.0 + 1e-4); }
float gnoise(vec3 p){
  vec3 i = floor(p), f = p - i; ivec3 c = ivec3(i);
  vec3 u = f*f*f*(f*(f*6.-15.)+10.);
  float n000=dot(grad(c),f), n100=dot(grad(c+ivec3(1,0,0)),f-vec3(1,0,0)),
        n010=dot(grad(c+ivec3(0,1,0)),f-vec3(0,1,0)), n110=dot(grad(c+ivec3(1,1,0)),f-vec3(1,1,0)),
        n001=dot(grad(c+ivec3(0,0,1)),f-vec3(0,0,1)), n101=dot(grad(c+ivec3(1,0,1)),f-vec3(1,0,1)),
        n011=dot(grad(c+ivec3(0,1,1)),f-vec3(0,1,1)), n111=dot(grad(c+ivec3(1,1,1)),f-vec3(1,1,1));
  return mix(mix(mix(n000,n100,u.x),mix(n010,n110,u.x),u.y), mix(mix(n001,n101,u.x),mix(n011,n111,u.x),u.y), u.z) * 1.6;
}
float h1(float a, float b){ uvec3 h = pcg3(uvec3(uint(int(a) + 65536), uint(int(b) + 65536), 7u)); return float(h.x & 65535u) / 65535.; }
const float C0 = 0.6;
// the layers at zoom s: brightness (x) and how violet (y)
vec2 layers(vec2 q, float s){
  float fs = floor(s), b = 0., vi = 0., ws = 0.;
  for (int j = 0; j < NOCT; j++){
    float k = fs + 1. - float(j);                 // wavelength C0·2^(k-s) frames
    float pos = (s - k + 1.) / float(NOCT);       // 0 (born, a frame wide) … 1 (gone, a few pixels)
    float w = sin(3.14159265 * pos); w *= w;
    float amp = w * exp2((k - s) * .3);
    float a = k * 2.39996; mat2 R = mat2(cos(a), sin(a), -sin(a), cos(a));
    vec2 p = R * q * exp2(s - k) / C0 + vec2(h1(k, 1.), h1(k, 2.)) * 200.;
    float n = gnoise(vec3(p, uTime * .05 + k * 3.7));
    float cloud = smoothstep(-.05, .55, n);       // a sheet of cloud with gaps between
    b += amp * cloud; vi += amp * cloud * h1(k, 3.); ws += amp;
  }
  return vec2(b, vi) / max(ws, 1e-4);
}
vec3 ramp(float x, vec3 a, vec3 b, vec3 c, vec3 d){
  x = clamp(x, 0., 1.);
  return x < .33 ? mix(a, b, x / .33) : x < .7 ? mix(b, c, (x - .33) / .37) : mix(c, d, (x - .7) / .3);
}
void main(){
  vec2 px = gl_FragCoord.xy - .5 * uRes, q = px / uRes.x;
  // the layers, averaged over the octaves passed during the shutter (a radial blur, since the zoom is about the centre)
  float jit = float(pcg3(uvec3(uvec2(gl_FragCoord.xy), 11u)).x & 1023u) / 1024.;
  int n = uDS < .004 ? 1 : TAPS;
  vec2 acc = vec2(0.);
  for (int j = 0; j < TAPS; j++){
    if (j >= n) break;
    float f = n == 1 ? 0. : (float(j) + jit) / float(n);
    acc += layers(q, uS - uFlow * uDS * f);
  }
  acc /= float(n);
  float v = acc.x;
  // calm: the star's own greys (src/star-forge.js colours(), kind 3), cool to violet, mostly dark
  vec3 cool = ramp(v, vec3(.006, .007, .014), vec3(.07, .08, .12), vec3(.32, .35, .46), vec3(.78, .8, .9));
  vec3 vio = ramp(v, vec3(.01, .006, .016), vec3(.1, .07, .15), vec3(.4, .33, .55), vec3(.86, .78, .96));
  vec3 col = mix(cool, vio, clamp(acc.y / max(v, .05), 0., 1.)) * uNoise;
  // the dust: specks in (angle, ln R), R the world's radius; this pixel sees the ones whose ln R sweeps across it
  float r = length(px);
  if (uDust > .002 && r > 2.) {
    const float NA = 720., CR = .22;              // angular cells, ln-radius cell
    float th = atan(px.y, px.x) / 6.2831853 + .5, lr = log(r / uRes.x);
    float s0 = (uS - uFlow * uDS) * .6931472, s1 = uS * .6931472;
    float lo = lr + min(s0, s1), hi = lr + max(s0, s1);
    hi = max(hi, lo + .004);
    float ac = th * NA, dust = 0.;
    for (int da = -1; da <= 1; da++){
      float ai = floor(ac) + float(da);
      for (int m = 0; m < 10; m++){
        float mi = floor(lo / CR) + float(m);
        if (mi * CR > hi) break;
        if (h1(mod(ai, NA), mi) > .16) continue;   // a speck in about one cell in six
        float pl = (mi + h1(mi, ai + 1.)) * CR;     // its ln R
        if (pl < lo || pl > hi) continue;
        float pa = ai + h1(ai, mi + 3.);            // its angle, in cells
        float d = abs(ac - pa) / NA * 6.2831853 * r;   // px across the streak
        float bright = .35 + .65 * h1(ai + 9., mi);
        dust += bright * smoothstep(1.3, .2, d) / (1. + (hi - lo) * 6.);
      }
    }
    col += vec3(.75, .78, .95) * dust * uDust * smoothstep(.01, .08, r / uRes.x);
  }
  // nearing the star: its surface inside the limb, a glow outside
  float d = length(q);
  if (uLimb < 50.) {
    float aa = 1.5 / uRes.x;
    float inside = smoothstep(uLimb + aa, uLimb - aa, d);
    vec3 surf = ramp(v, vec3(.16, .16, .22), vec3(.5, .51, .64), vec3(.84, .85, .95), vec3(1., 1., 1.));
    col = mix(col, surf, uEnd * inside);
    float limbDark = mix(1., .55 + .45 * sqrt(max(0., 1. - (d / uLimb) * (d / uLimb))), .6);
    float x = max(0., d - uLimb) / uLimb;
    vec3 glow = vec3(.7, .76, .9) * (.55 * exp(-x * 14.) + .18 * exp(-x * 3.));
    col = col * mix(1., inside * limbDark, uEnd) + glow * (1. - inside) * uEnd;
  }
  o = vec4(col, 1.);
}`;

let GL = null;
function glNoise() {
  if (GL) return GL.dead ? null : GL;
  GL = { dead: true };
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, preserveDrawingBuffer: true });
    if (!gl) throw new Error("WebGL2 unavailable");
    const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS));
    gl.bindAttribLocation(p, 0, "a"); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const U = {}, nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < nu; i++) { const u = gl.getActiveUniform(p, i); U[u.name] = gl.getUniformLocation(p, u.name); }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    let lost = false;
    canvas.addEventListener("webglcontextlost", e => { e.preventDefault(); lost = true; console.warn("p10: WebGL context lost"); });
    GL = { canvas, gl, P: { p, U }, lost: () => lost || gl.isContextLost() };
    return GL;
  } catch (err) {
    console.warn("p10: no noise, falling back to 2D:", err.message);
    return null;
  }
}

function renderNoise(G, w, h, u) {
  const { gl, P } = G;
  if (G.canvas.width !== w || G.canvas.height !== h) { G.canvas.width = w; G.canvas.height = h; }
  gl.viewport(0, 0, w, h);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.useProgram(P.p);
  gl.uniform2f(P.U.uRes, w, h);
  for (const k of ["uS", "uDS", "uTime", "uNoise", "uLimb", "uEnd", "uDust", "uFlow"]) if (P.U[k]) gl.uniform1f(P.U[k], u[k]);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// ---------------------------------------------------------------- the run's last frame
const simFrame = { key: null, canvas: null, geo: null };
function simStart(o) {
  const s = o.sim;
  if (s.start != null) return s.start;
  const want = [].concat(s.at || []);
  const cues = window.__narr?.cues || [];
  let best = null;
  for (const c of cues) {
    if (c.t >= o.start - 1e-3) continue;
    if ([].concat(c.at).some(a => want.some(w => String(a).includes(w)))) best = c.t;
  }
  return best;
}
// the run at time tt (its frame and where its units and grid land on screen: drawSqueeze's geometry)
function runFrame(o, W, H, dpr, tt) {
  if (!o.sim) return null;
  const start = simStart(o);
  if (start == null) return null;
  const key = `${start}:${tt}:${W}x${H}`;
  if (simFrame.key === key) return simFrame.canvas;
  const c = simFrame.canvas || (simFrame.canvas = document.createElement("canvas"));
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  try {
    const { at, start: _s, ...opts } = o.sim;
    simFrame.geo = drawSqueeze(ctx, W, H, { ...opts, start, exact: true }, tt, dpr) || null;
  } catch (err) { console.warn("p10: the run's frame:", err.message); return null; }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  simFrame.key = key;
  return c;
}

// where the run's units and grid were at the cut (drawn once and kept: every frame's lattice is placed from it)
const GEO = new Map();
function runGeo(o, W, H, dpr, start) {
  const key = `${o.sim && simStart(o)}:${start}:${W}x${H}`;
  if (!GEO.has(key)) { const c = runFrame(o, W, H, dpr, start); GEO.set(key, c ? simFrame.geo || { none: true } : null); }
  const g = GEO.get(key);
  return g && !g.none ? g : null;
}

// ---------------------------------------------------------------- the squares and their labels
// one level of squares every 1000× (1 fm, 1 pm, 1 nm, 1 µm, 1 mm, 1 m, 1 km: the author, 2026-11-22), each coming in as
// its squares shrink to a frame and a bit, going as they shrink to a few pixels
const UNITS = [[-15, "fm"], [-12, "pm"], [-9, "nm"], [-6, "µm"], [-3, "mm"], [0, "m"], [3, "km"]];
const unitLabel = d => `1 ${UNITS.find(x => x[0] === d)?.[1] ?? `e${d} m`}`;
// a label on the square is read only if it's on screen, at its size, for READ s: it's there while the square's side
// goes from LBL_HI to LBL_LO of the frame's height; levels faster than that are named in the readout on top instead
const READ = 0.7, LBL_HI = 0.75, LBL_LO = 0.03;
// the level named now: the biggest whose square is under 1.2 frame heights
const levelNow = (logF, W, H) => Math.max(-15, Math.min(3, 3 * Math.floor((logF + Math.log10(1.2 * H / W)) / 3)));
// px for one square of level d
const sideOf = (d, logF, W) => W * 10 ** (d - logF);

function squareA(sp, H) { return smooth((Math.log10(3 * H / sp)) / 0.4) * smooth((sp - 3) / 9); }

function strokeGrid(ctx, W, H, sp, a, lw) {
  if (a < 0.004 || sp < 2.5) return;
  const cx = W / 2, cy = H / 2;
  ctx.strokeStyle = `rgba(225,235,255,${a})`; ctx.lineWidth = lw;
  ctx.beginPath();
  const nx = Math.ceil(cx / sp), ny = Math.ceil(cy / sp);
  // (offset half a square, so one square sits right in the middle of the frame)
  for (let i = -nx - 1; i <= nx; i++) { const x = Math.round(cx + (i + 0.5) * sp) + 0.5; ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let j = -ny - 1; j <= ny; j++) { const y = Math.round(cy + (j + 0.5) * sp) + 0.5; ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
}

function label(ctx, txt, x, y, size, a, align = "left") {
  ctx.font = `700 ${size}px "Barlow Condensed", "Arial Narrow", sans-serif`;
  try { ctx.letterSpacing = `${size * 0.1}px`; } catch {}
  ctx.textAlign = align; ctx.textBaseline = "top";
  ctx.lineWidth = size * 0.22; ctx.strokeStyle = `rgba(0,0,0,${0.7 * a})`; ctx.lineJoin = "round";
  ctx.strokeText(txt, x, y);
  ctx.fillStyle = `rgba(240,245,255,${0.95 * a})`; ctx.fillText(txt, x, y);
}

// dS: log10 zoomed out over the shutter (the grid's own blur: a few faint copies across it when it's fast)
function drawGrid(ctx, W, H, logF, dS, fade, Z) {
  const S = Math.min(W, H), lw = Math.max(1, S / 720), size = Math.round(S * 0.036);
  ctx.save();
  const copies = dS > 0.01 ? Math.min(6, 1 + Math.ceil(dS / 0.012)) : 1;
  for (let d = -15; d <= 3; d += 3) {
    for (let c = 0; c < copies; c++) {
      const lf = logF - Z.flow * dS * (copies === 1 ? 0 : c / (copies - 1));
      const sp = sideOf(d, lf, W), a = fade * squareA(sp, H) * 0.34 / copies;
      strokeGrid(ctx, W, H, sp, a, lw);
    }
  }
  // the square in the middle of the frame, outlined, its name riding on it as it shrinks (the author, 2026-11-23: "The
  // square zooming out showing the units should be in the center. Try moving the text with it like we do in the powers
  // of 10"): the words keep their size and stay on the square's top edge, inside while it's roomy, then just above it
  const cx = W / 2, cy = H / 2;
  for (let d = -15; d <= 3; d += 3) {
    const sp = sideOf(d, logF, W);
    const a = fade * squareA(sp, H);
    if (a < 0.01) continue;
    ctx.lineWidth = 1.6 * lw; ctx.strokeStyle = `rgba(240,245,255,${0.55 * a})`;
    ctx.strokeRect(Math.round(cx - sp / 2) + 0.5, Math.round(cy - sp / 2) + 0.5, Math.round(sp), Math.round(sp));
    if (!Z.onSquare(d)) continue;
    const r = sp / H, la = a * smooth((Math.log10(LBL_HI) - Math.log10(r)) / 0.1) * smooth((Math.log10(r) - Math.log10(LBL_LO)) / 0.1);
    if (la < 0.01) continue;
    // inside the square while it's roomy, just above its corner once it's small
    // (glides from inside the top edge to just above it as the square closes in on the words, so it never jumps)
    const pad = Math.max(size * 0.45, 0.06 * sp), k = smooth((sp / size - 3) / 3);
    label(ctx, unitLabel(d), cx, cy - sp / 2 + k * pad * 0.8 - (1 - k) * size * 1.25, size, la, "center");
  }
  // the readout on top: once the squares pass too fast to be named on them, the current square's size stays here
  const dn = levelNow(logF, W, H);
  if (Z.readout(dn)) {
    // (cross-faded at each 1000× step, over a twentieth of a decade either side)
    const x = Math.log10(1.2 * H / W) + logF - dn;   // 0 … 3 through the level
    const a = fade * Z.readIn * smooth(x / 0.05) * smooth((3 - x) / 0.05);
    if (a > 0.01) {
      const rs = Math.round(S * 0.042), bx = W / 2, by = Math.round(S * 0.045), box = Math.round(rs * 0.62);
      ctx.font = `700 ${rs}px "Barlow Condensed", "Arial Narrow", sans-serif`;
      try { ctx.letterSpacing = `${rs * 0.1}px`; } catch {}
      const tw = ctx.measureText(unitLabel(dn)).width, x0 = bx - (box + rs * 0.4 + tw) / 2;
      ctx.lineWidth = 2 * lw; ctx.strokeStyle = `rgba(240,245,255,${0.9 * a})`;
      ctx.strokeRect(Math.round(x0) + 0.5, Math.round(by + (rs - box) / 2) + 0.5, box, box);
      label(ctx, unitLabel(dn), x0 + box + rs * 0.4, by, rs, a);
    }
  }
  ctx.restore();
}

function caption(ctx, W, H, s, y, a) {
  if (a <= 0.01) return;
  const S = Math.min(W, H), size = Math.round(S * 0.045);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = `700 ${size}px "Barlow Condensed", "Arial Narrow", sans-serif`;
  try { ctx.letterSpacing = `${size * 0.1}px`; } catch {}
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.lineWidth = size * 0.18; ctx.strokeStyle = "rgba(0,0,0,0.8)"; ctx.lineJoin = "round";
  ctx.strokeText(s.toUpperCase(), W / 2, y); ctx.fillStyle = "#e9ecf5"; ctx.fillText(s.toUpperCase(), W / 2, y);
  ctx.restore();
}

// ---------------------------------------------------------------- the star
let forge = null, forgeDead = false, starCanvas = null;
// (exported for the escape scene, src/narration.js drawEscape, which goes on with this same star: x, y its centre)
export function drawStar(ctx, W, H, r, a, t, x = W / 2, y = H / 2) {
  if (a <= 0.01) return;
  const s = starBySlug("neutron-star");
  if (!forgeDead && !forge) { try { forge = createStarForge(); } catch (err) { forgeDead = true; console.warn("p10: no Star Forge:", err.message); } }
  starCanvas ||= document.createElement("canvas");
  const size = Math.min(4096, Math.ceil(r / discFraction(s)) * 2);
  ctx.save(); ctx.globalAlpha = a;
  if (forge && !forge.lost() && forge.render(s, t, size, { target: starCanvas, alpha: true })) {
    ctx.drawImage(starCanvas, x - size / 2, y - size / 2, size, size);
  } else {
    // no GL: a plain disc in the star's colours
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "#f2f2fa"); g.addColorStop(0.8, "#a9adc4"); g.addColorStop(1, "#6c7190");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the frame
// which levels are named on their squares (those that stay READ s in the label's range), and from which level on the
// readout takes over (the first that can't, and every one after it, so the name doesn't hop back onto the squares)
const PLAN = new Map();
function labelPlan(L0, L1, dur, W, H) {
  const key = `${L0}:${L1}:${dur}:${W}x${H}`;
  if (PLAN.has(key)) return PLAN.get(key);
  const dwell = {};
  let firstFast = Infinity;
  for (let d = -15; d <= 3; d += 3) {
    // the square's side is r·H when logF = d + log10(W / (r·H))
    const t1 = timeAt(d + Math.log10(W / (LBL_HI * H)), L0, L1, dur), t2 = timeAt(d + Math.log10(W / (LBL_LO * H)), L0, L1, dur);
    dwell[d] = (t2 >= dur - 1e-6 ? 99 : t2) - t1;   // (still on at the end: it stays)
    if (dwell[d] < READ && firstFast === Infinity) firstFast = d;
  }
  const P = { dwell, firstFast, readFrom: firstFast === Infinity ? dur : timeAt(firstFast + Math.log10(W / (1.2 * H)), L0, L1, dur) };
  PLAN.set(key, P);
  return P;
}

export function drawP10(ctx, W, H, o, t, dpr = 1) {
  o = { sim: DEFAULT_SIM, ...o };
  const start = o.start ?? t, u = Math.max(0, t - start);
  // the run at the cut, for its grid (drawn first: the lattice's scale comes from it)
  const geo = runGeo(o, W, H, dpr, start), hex = geo?.hex;
  const cell0 = hex ? hex.a * geo.scale : null;                  // the run's grid spacing on screen at the cut, px
  const org0 = hex ? [geo.ox + hex.x * geo.scale, geo.oy + hex.y * geo.scale] : [W / 2, H / 2];
  const f0 = o.f0 ?? (cell0 ? W * LA * 1e-15 / cell0 : 1.5e-14), km = o.km ?? 20, dur = o.dur ?? 9.2, endFrac = o.disc ?? 0.62;
  const shutter = o.shutter ?? 1 / 24, flow = o.flow ?? 1;
  const R = km * 500;                                            // the star's radius, m
  const L0 = Math.log10(f0), L1 = Math.log10(2 * R * (W / H) / endFrac);
  const logF = logWidth(u, L0, L1, dur);
  const s = (logF - L0) * LOG2_10;                               // octaves zoomed out
  const limb = R / 10 ** logF;                                   // the star's radius in frame widths
  const rPx = limb * W;
  const progress = (logF - L0) / (L1 - L0);
  // decades passed over the shutter, ending now (the streaks' length)
  const dS = logF - logWidth(u - shutter, L0, L1, dur);
  const vNow = dS / shutter;                                     // decades a second

  // (the run goes on under the lattice for the zoom's first moments, shrinking with it, and crossfades into it by 0.8 s)
  const simAmt = geo ? 1 - smooth((u - 0.2) / 0.6) : 0;
  const sim = simAmt > 0.002 ? runFrame(o, W, H, dpr, t) : null;
  const ppf = W / (10 ** logF / 1e-15), cellPx = LA * ppf, zf = ppf / (W / (f0 / 1e-15));
  const ox = W / 2 + (org0[0] - W / 2) * zf, oy = H / 2 + (org0[1] - H / 2) * zf;
  // the lattice: black between the neutrons while they're big, the noise showing through as they shrink, gone by 2.5 px
  // (and dimmed as it goes, to the noise's own grey, so the tile's bright mesh melts into it rather than popping off)
  const blackA = smooth((cellPx - 6) / 16), latA = smooth((cellPx - 1.2) / 9) * (0.35 + 0.65 * smooth((cellPx - 3) / 12)), live = smooth((cellPx - 18) / 12);
  // the noise comes up as the neutrons melt into it; the dust only once we're going fast (the warp)
  const noiseIn = smooth((16 - cellPx) / 12), dust = smooth((vNow - 1.2) / 1.6) * (1 - smooth((progress - 0.9) / 0.1));
  const G = glNoise();
  // the noise at most 1100 px wide (it's soft, and streaked when it's fast); the grid and words at full resolution
  const k = Math.min(1, 1100 / W), w = Math.round(W * k), h = Math.round(H * k);
  let drew = false;
  if (G && !G.lost() && (noiseIn > 0.002 || limb < 50)) {
    try {
      renderNoise(G, w, h, {
        uS: s, uDS: dS * LOG2_10, uTime: t, uNoise: noiseIn, uLimb: limb > 40 ? 99 : limb, uFlow: flow,
        uEnd: smooth((progress - 0.8) / 0.15), uDust: dust,
      });
      ctx.drawImage(G.canvas, 0, 0, W, H);
      drew = true;
    } catch (err) { console.warn("p10: noise:", err.message); }
  }
  if (!drew) {
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    if (limb < 40) { ctx.fillStyle = "#3a3d55"; ctx.beginPath(); ctx.arc(W / 2, H / 2, rPx, 0, Math.PI * 2); ctx.fill(); }
  }
  if (blackA > 0) { ctx.globalAlpha = blackA; ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  drawLattice(ctx, W, H, ppf, ox, oy, t, latA, live);
  // the run over it all at first, going as the lattice takes over
  if (sim && simAmt > 0) { ctx.globalAlpha = simAmt; ctx.drawImage(sim, W / 2 * (1 - zf), H / 2 * (1 - zf), W * zf, H * zf); ctx.globalAlpha = 1; }
  // the star's model, coming in as its disc shrinks from 0.62 to 0.45 of the frame's height (radius)
  const starA = smooth((0.62 * H - rPx) / (0.17 * H));
  if (starA > 0) drawStar(ctx, W, H, rPx, starA, t);

  // the squares, coming in over the first moments (so the cut from the run is clean), dimmed once the star is whole
  const plan = labelPlan(L0, L1, dur, W, H);
  const Z = {
    // every 1000× is named on its own square now ("I think at every 1000s it will be slow enough"); the readout on top
    // only if Z.readout is asked for (o.readout)
    flow: 1, onSquare: d => !o.readout || d < plan.firstFast, readout: d => !!o.readout && d >= plan.firstFast,
    readIn: smooth((u - plan.readFrom + 0.15) / 0.3),
  };
  drawGrid(ctx, W, H, logF, Math.max(0, dS), smooth(u / 0.6) * (1 - 0.45 * smooth((u - dur + 0.5) / 1.5)), Z);

  // the words
  const labels = o.labels ?? [[`neutron star · ${km} km`, dur - 0.6], ["one giant nucleus", dur + 1.1]];
  labels.forEach(([txt, at], i) => caption(ctx, W, H, txt, H * (0.88 + 0.065 * i) - (labels.length - 1) * H * 0.035, smooth((u - at) / 0.7)));
  if (o.debug || window.__p10dbg) window.__p10 = { u, logF, vNow, dS, plan, cellPx, progress, cell0, org0, hex, scale: geo?.scale };
}
