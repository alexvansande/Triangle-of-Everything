// src/narr-p10.js — a powers-of-ten zoom out on the diagram canvas: from the neutron-star-collapse simulation's last
// frame (fm) out to the whole neutron star (20 km), on a square grid that keeps its look (the author, 2026-11-20, 5:10:
// "keep a square grid and zoom out, from the atomic scale to the size of a neutron star … everything else … a zoom out of
// colored noise with the sort of fractal warp we have on our background with a bit of aberration").
//
// { p10: { sim?, f0?, km?, dur?, end?, labels? } }, drawn by narration.js with start = the cue's time:
//   sim   the squeeze run whose last frame the zoom starts on ({ start?, at?, mode, from, P, zoom }, as the squeeze cue's
//         options; start = that cue's exact time, or else `at` finds it among the take's cues). Its frame is frozen at
//         the cut, folded into the fractal warp as it shrinks (as the powers-of-ten tool's zoom past the quarks folds the
//         quark into swirls), and the coloured noise takes over within about a decade and a half.
//   f0    the frame's width at the start, m (the run's helium nuclei, ~3.4 fm, a quarter of the frame: 1.5e-14)
//   km    the neutron star's diameter (20)
//   dur   the zoom's length, s (9.2); disc: the star's disc at the end, as a fraction of the frame's height (0.62)
//   labels [[text, s after the start], …] under the star (default: "neutron star · 20 km" as it arrives, then
//         "one giant nucleus")
// Everything is a function of the take's clock t (render workers draw frames in any order). One WebGL2 canvas of its own
// for the noise; the star is the Star Forge's live model (src/star-forge.js). A lost context falls back to 2D.

import { drawSqueeze } from "./narr-diagrams.js";
import { createStarForge, starBySlug, discFraction } from "./star-forge.js";

const clamp01 = x => Math.max(0, Math.min(1, x));
const smooth = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
const LOG2_10 = Math.log2(10);

const DEFAULT_SIM = { at: "a new player enters", mode: 3, from: 8.2, P: { helium: true }, zoom: [[0, 2.4], [34, 3.0]] };

export function p10Pending() { return 0; }

// ---------------------------------------------------------------- the zoom's clock
// log10 of the frame's width (m) at time u s after the start: a trapezoid of speed in log scale (eased in from the
// still frame, a steady glide through the decades, eased out onto the star)
function logWidth(u, L0, L1, dur) {
  const a = 0.2 * dur, b = 0.3 * dur, v = 1 / (dur - (a + b) / 2);   // fraction of the way per second at full speed
  let f;
  if (u <= 0) f = 0;
  else if (u < a) f = v * u * u / (2 * a);
  else if (u < dur - b) f = v * (a / 2 + (u - a));
  else if (u < dur) { const r = dur - u; f = 1 - v * r * r / (2 * b); }
  else f = 1;
  return L0 + (L1 - L0) * f;
}

// ---------------------------------------------------------------- the noise (WebGL2)
const VS = `#version 300 es
in vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }`;

// pass 1: the scene. q is in frame widths about the centre. Octave k of every field has a wavelength of C0·2^(k-s)
// frames (s: octaves zoomed out since the start), weighted by sin² of where it sits in the band of NOCT octaves, so
// the sum is the same at every s and the pattern only ever shrinks: an endless zoom out, anchored to the world.
const FS1 = `#version 300 es
precision highp float; precision highp int;
#define NOCT 9
uniform vec2 uRes; uniform float uS, uTime, uSimAmt, uSimWarp, uLimb, uEnd, uWarp, uSimAspect;
uniform sampler2D uSim;
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
vec2 hash2(float k, float ch){ uvec3 h = pcg3(uvec3(uint(int(k) + 4096), uint(ch * 17.), 3u)); return vec2(h.xy & 65535u) / 65535. * 200.; }
const float C0 = 0.55;
// fBm over the band: H sets how much the big octaves outweigh the small
float field(vec2 q, float ch, float H){
  float fs = floor(uS), s = 0., ws = 0.;
  for (int j = 0; j < NOCT; j++){
    float k = fs + 1. - float(j);                 // wavelength C0·2^(k-uS) frames
    float pos = (uS - k + 1.) / float(NOCT);      // 0 (born, a frame wide) … 1 (gone, a couple of pixels)
    float w = sin(3.14159265 * pos); w *= w;
    float amp = w * exp2((k - uS) * H);
    float a = k * 2.39996; mat2 R = mat2(cos(a), sin(a), -sin(a), cos(a));
    vec2 p = R * q * exp2(uS - k) / C0 + hash2(k, ch);
    s += amp * gnoise(vec3(p, uTime * (0.07 + 0.015 * float(j)) + ch * 9.1 + k * 3.7));
    ws += amp;
  }
  return s / max(ws, 1e-4);
}
vec3 ramp(float x, vec3 a, vec3 b, vec3 c, vec3 d){
  x = clamp(x, 0., 1.);
  return x < .33 ? mix(a, b, x / .33) : x < .7 ? mix(b, c, (x - .33) / .37) : mix(c, d, (x - .7) / .3);
}
void main(){
  vec2 q = (gl_FragCoord.xy - .5 * uRes) / uRes.x;
  // the warp: two fields push the third about (bg-noise's swirl), by a fraction of the frame
  vec2 wv = vec2(field(q, 1., .55), field(q + vec2(3.1, 7.7), 2., .55));
  vec2 qw = q + uWarp * wv;
  float v = field(qw, 3., .35);
  float hue = field(q * .7 + wv * .3, 4., .8);
  // ridges: the bright folds where the third field crosses zero
  float ridge = pow(max(0., 1. - abs(v) * 4.5), 6.);
  float n = clamp(.5 + v * 1.25, 0., 1.);
  // two families of colour, cool and warm, sorted by a slow field of their own
  vec3 cool = ramp(n, vec3(.012, .01, .05), vec3(.16, .08, .45), vec3(.25, .48, .95), vec3(.8, .93, 1.));
  vec3 warm = ramp(n, vec3(.03, .006, .03), vec3(.42, .07, .38), vec3(.95, .38, .32), vec3(1., .86, .62));
  vec3 col = mix(cool, warm, smoothstep(-.12, .22, hue));
  col += ridge * mix(vec3(.55, .62, 1.), vec3(1., .7, .85), smoothstep(-.1, .2, hue)) * .55;
  // nearing the star: its own colours, grey-white with violet highlights (src/star-forge.js colours(), kind 3)
  vec3 star = ramp(n, vec3(.16, .16, .22), vec3(.5, .51, .64), vec3(.84, .85, .95), vec3(1., 1., 1.)) + ridge * vec3(.85, .55, 1.) * .35;
  col = mix(col, star, uEnd);
  // the run's last frame, mirrored beyond its edges, folding into the warp as it shrinks
  if (uSimAmt > 0.) {
    vec2 sq = (q + uSimWarp * wv) * exp2(uS);
    vec2 uv = vec2(sq.x + .5, .5 - sq.y * uSimAspect);
    vec3 sim = texture(uSim, uv).rgb;
    col = mix(col, sim, uSimAmt);
  }
  // the star's edge: the matter inside, a glow outside
  float d = length(q);
  if (uLimb < 50.) {
    float aa = 1.5 / uRes.x;
    float inside = smoothstep(uLimb + aa, uLimb - aa, d);
    float limbDark = mix(1., .55 + .45 * sqrt(max(0., 1. - (d / uLimb) * (d / uLimb))), .6);
    float x = max(0., d - uLimb) / uLimb;
    vec3 glow = vec3(.7, .76, .9) * (.55 * exp(-x * 14.) + .18 * exp(-x * 3.));
    col = col * inside * limbDark + glow * (1. - inside);
  }
  o = vec4(col, 1.);
}`;

// pass 2: a little chromatic aberration, growing to the edges, and a faint vignette
const FS2 = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uAb, uVig; uniform sampler2D uTex;
out vec4 o;
void main(){
  vec2 uv = gl_FragCoord.xy / uRes, c = uv - .5; c.x *= uRes.x / uRes.y;
  vec2 off = (uv - .5) * length(c) * uAb;
  vec3 col = vec3(texture(uTex, uv + off).r, texture(uTex, uv).g, texture(uTex, uv - off).b);
  col *= 1. - uVig * smoothstep(.35, 1.1, length(c));
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
    const prog = (fs) => {
      const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o);
        if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
      const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, "a"); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const U = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const u = gl.getActiveUniform(p, i); U[u.name] = gl.getUniformLocation(p, u.name); }
      return { p, U };
    };
    const P1 = prog(FS1), P2 = prog(FS2);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const tex = (wrap, mip) => {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
      return t;
    };
    const simTex = tex(gl.MIRRORED_REPEAT, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    const sceneTex = tex(gl.CLAMP_TO_EDGE, false), fb = gl.createFramebuffer();
    let lost = false;
    canvas.addEventListener("webglcontextlost", e => { e.preventDefault(); lost = true; console.warn("p10: WebGL context lost"); });
    GL = { canvas, gl, P1, P2, simTex, sceneTex, fb, w: 0, h: 0, simKey: null, lost: () => lost || gl.isContextLost() };
    return GL;
  } catch (err) {
    console.warn("p10: no noise, falling back to 2D:", err.message);
    return null;
  }
}

function renderNoise(G, w, h, u) {
  const { gl, P1, P2 } = G;
  if (G.canvas.width !== w || G.canvas.height !== h) { G.canvas.width = w; G.canvas.height = h; }
  if (G.w !== w || G.h !== h) {
    gl.bindTexture(gl.TEXTURE_2D, G.sceneTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, G.fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, G.sceneTex, 0);
    G.w = w; G.h = h;
  }
  gl.viewport(0, 0, w, h);
  gl.bindFramebuffer(gl.FRAMEBUFFER, G.fb);
  gl.useProgram(P1.p);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, G.simTex); gl.uniform1i(P1.U.uSim, 0);
  gl.uniform2f(P1.U.uRes, w, h);
  for (const k of ["uS", "uTime", "uSimAmt", "uSimWarp", "uLimb", "uEnd", "uWarp", "uSimAspect"]) if (P1.U[k]) gl.uniform1f(P1.U[k], u[k]);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.useProgram(P2.p);
  gl.bindTexture(gl.TEXTURE_2D, G.sceneTex); gl.uniform1i(P2.U.uTex, 0);
  gl.uniform2f(P2.U.uRes, w, h); gl.uniform1f(P2.U.uAb, u.uAb); gl.uniform1f(P2.U.uVig, u.uVig);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// ---------------------------------------------------------------- the run's last frame
const simFrame = { key: null, canvas: null };
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
function frozenSim(o, W, H, dpr) {
  if (!o.sim) return null;
  const start = simStart(o);
  if (start == null) return null;
  const key = `${start}:${o.start}:${W}x${H}`;
  if (simFrame.key === key) return simFrame.canvas;
  const c = simFrame.canvas || (simFrame.canvas = document.createElement("canvas"));
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  try {
    const { at, start: _s, ...opts } = o.sim;
    drawSqueeze(ctx, W, H, { ...opts, start, exact: true }, o.start, dpr);
  } catch (err) { console.warn("p10: the run's frame:", err.message); return null; }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  simFrame.key = key;
  return c;
}

// ---------------------------------------------------------------- the grid and its labels
function unitLabel(d) {
  // d: log10 of the spacing in metres
  if (d === -2) return "1 cm";
  if (d === -1) return "10 cm";
  const u = [[-15, "fm"], [-12, "pm"], [-9, "nm"], [-6, "µm"], [-3, "mm"], [0, "m"], [3, "km"]];
  let best = u[0];
  for (const x of u) if (d >= x[0]) best = x;
  return `${10 ** (d - best[0])} ${best[1]}`;
}

function drawGrid(ctx, W, H, logF, fade, dpr) {
  const cx = W / 2, cy = H / 2, S = Math.min(W, H), lw = Math.max(1, S / 720);
  const pxPerM = W / 10 ** logF;
  const dTop = Math.ceil(logF + 0.2);
  ctx.save();
  ctx.lineWidth = lw;
  for (let d = dTop; d >= dTop - 4; d--) {
    const sp = 10 ** d * pxPerM;
    if (sp < 5) continue;
    // a decade's lines come in as they shrink to a few dozen pixels apart, and stay on as the next decade's
    const a = fade * smooth((sp - 5) / 45) * 0.3;
    if (a < 0.004) continue;
    ctx.strokeStyle = `rgba(225,235,255,${a})`;
    ctx.beginPath();
    const nx = Math.ceil(cx / sp), ny = Math.ceil(cy / sp);
    for (let i = -nx; i <= nx; i++) { const x = Math.round(cx + i * sp) + 0.5; ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let j = -ny; j <= ny; j++) { const y = Math.round(cy + j * sp) + 0.5; ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
  }
  // the label: one cell, up and left of the centre, named while it's a good size on screen
  const size = Math.round(S * 0.036);
  ctx.font = `700 ${size}px "Barlow Condensed", "Arial Narrow", sans-serif`;
  try { ctx.letterSpacing = `${size * 0.1}px`; } catch {}
  ctx.textAlign = "left"; ctx.textBaseline = "top";
  for (let d = dTop; d >= dTop - 3; d--) {
    const sp = 10 ** d * pxPerM, r = Math.log10(sp / H);
    // shown from 0.75 H across down to 0.1 H
    const a = fade * smooth((Math.log10(0.75) - r) / 0.12) * smooth((r - Math.log10(0.1)) / 0.12);
    if (a < 0.01) continue;
    const x0 = cx - sp, y0 = cy - sp, pad = Math.max(size * 0.45, 0.06 * sp);
    ctx.lineWidth = 1.6 * lw; ctx.strokeStyle = `rgba(240,245,255,${0.6 * a})`;
    ctx.strokeRect(Math.round(x0) + 0.5, Math.round(y0) + 0.5, Math.round(sp), Math.round(sp));
    const label = unitLabel(d);
    ctx.lineWidth = size * 0.22; ctx.strokeStyle = `rgba(0,0,0,${0.7 * a})`; ctx.lineJoin = "round";
    ctx.strokeText(label, x0 + pad, y0 + pad * 0.8);
    ctx.fillStyle = `rgba(240,245,255,${0.95 * a})`;
    ctx.fillText(label, x0 + pad, y0 + pad * 0.8);
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
function drawStar(ctx, W, H, r, a, t) {
  if (a <= 0.01) return;
  const s = starBySlug("neutron-star");
  if (!forgeDead && !forge) { try { forge = createStarForge(); } catch (err) { forgeDead = true; console.warn("p10: no Star Forge:", err.message); } }
  starCanvas ||= document.createElement("canvas");
  const size = Math.min(4096, Math.ceil(r / discFraction(s)) * 2);
  ctx.save(); ctx.globalAlpha = a;
  if (forge && !forge.lost() && forge.render(s, t, size, { target: starCanvas, alpha: true })) {
    ctx.drawImage(starCanvas, W / 2 - size / 2, H / 2 - size / 2, size, size);
  } else {
    // no GL: a plain disc in the star's colours
    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, r);
    g.addColorStop(0, "#f2f2fa"); g.addColorStop(0.8, "#a9adc4"); g.addColorStop(1, "#6c7190");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the frame
export function drawP10(ctx, W, H, o, t, dpr = 1) {
  o = { sim: DEFAULT_SIM, ...o };
  const start = o.start ?? t, u = Math.max(0, t - start);
  const f0 = o.f0 ?? 1.5e-14, km = o.km ?? 20, dur = o.dur ?? 9.2, endFrac = o.disc ?? 0.62;
  const R = km * 500;                                            // the star's radius, m
  const L0 = Math.log10(f0), L1 = Math.log10(2 * R * (W / H) / endFrac);
  const logF = logWidth(u, L0, L1, dur);
  const s = (logF - L0) * LOG2_10;                               // octaves zoomed out
  const limb = R / 10 ** logF;                                   // the star's radius in frame widths
  const rPx = limb * W;
  const progress = (logF - L0) / (L1 - L0);

  // the run's last frame: full at the cut, folded into the warp and gone by ~1.6 decades out
  const sim = frozenSim(o, W, H, dpr);
  const simAmt = sim ? 1 - smooth((s - 1.2) / 4.2) : 0;
  const G = glNoise();
  // the lens (aberration, vignette) and the grid come in over the first moments, so the cut from the run is clean
  const lens = smooth(u / 0.8), gridIn = smooth(u / 0.6);
  // the noise at most 1600 px wide (it's soft); the grid and words at full resolution
  const k = Math.min(1, 1600 / W), w = Math.round(W * k), h = Math.round(H * k);
  let drew = false;
  if (G && !G.lost()) {
    try {
      const gl = G.gl;
      if (sim && G.simKey !== simFrame.key) {
        gl.bindTexture(gl.TEXTURE_2D, G.simTex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sim);
        gl.generateMipmap(gl.TEXTURE_2D);
        G.simKey = simFrame.key;
      }
      renderNoise(G, w, h, {
        uS: s, uTime: t, uSimAmt: simAmt, uSimWarp: 0.06 * smooth(s / 4), uLimb: limb > 40 ? 99 : limb,
        uEnd: smooth((progress - 0.8) / 0.2), uWarp: 0.14, uSimAspect: W / H, uAb: 0.012 * lens, uVig: 0.25 * lens,
      });
      ctx.drawImage(G.canvas, 0, 0, W, H);
      drew = true;
    } catch (err) { console.warn("p10: noise:", err.message); }
  }
  if (!drew) {
    // 2D fallback: the run's frame shrinking, then the star's disc
    if (sim && simAmt > 0) {
      const z = 2 ** -s; ctx.globalAlpha = simAmt;
      ctx.drawImage(sim, W / 2 - W * z / 2, H / 2 - H * z / 2, W * z, H * z); ctx.globalAlpha = 1;
    }
    if (limb < 40) { ctx.fillStyle = "#3a3d55"; ctx.beginPath(); ctx.arc(W / 2, H / 2, rPx, 0, Math.PI * 2); ctx.fill(); }
  }
  // the star's model, coming in as its disc shrinks from 0.62 to 0.45 of the frame's height (radius)
  const starA = smooth((0.62 * H - rPx) / (0.17 * H));
  if (starA > 0) drawStar(ctx, W, H, rPx, starA, t);

  // the grid, dimmed once the star is whole
  drawGrid(ctx, W, H, logF, gridIn * (1 - 0.45 * smooth((u - dur + 0.5) / 1.5)), dpr);

  // the words
  const labels = o.labels ?? [[`neutron star · ${km} km`, dur - 0.6], ["one giant nucleus", dur + 1.1]];
  labels.forEach(([txt, at], i) => caption(ctx, W, H, txt, H * (0.88 + 0.065 * i) - (labels.length - 1) * H * 0.035, smooth((u - at) / 0.7)));
}
