// =============================================================
// BG-NOISE.JS — "infinite resolution" background (experimental)
// =============================================================
// The painted background tiles stop at z5 (~46 px per decade). Past that,
// instead of blurring, a WebGL layer reads the same tiles through a
// domain-warped displacement field and adds fractal detail on top, so the
// painting's own colours fold into ever-finer swirls as you zoom.
//
// Everything is pinned to chart position: noise octave i has wavelength
// L0·2^-i source (z5) pixels and a fixed lattice, so panning never slides
// the pattern. An octave fades in once the painted pixels are too coarse to
// show its scale (uStart) and fades out below a couple of device pixels, so
// zooming in never pops. Octave offsets are computed here in double
// precision and wrapped to the noise period (256 cells), which keeps
// float32 shaders steady at any zoom.
//
// Used by the app (createBgNoise) and by tools/background-noise-study.html
// (createNoiseRenderer directly).

export const MAXOCT = 28;
const L0 = 64; // octave i wavelength = L0·2^-i source px

// [shader mode, label] in menu order
export const NOISE_MODES = [
  [8, "Warp + swirl + ridges"],
  [7, "Image warp + swirl"],
  [6, "Image warp"],
  [4, "Ridged multifractal"],
  [3, "Domain-warped fBm"],
  [2, "fBm clouds"],
  [5, "Cellular (cosmic web)"],
  [1, "Smooth upscale (no noise)"],
  [0, "Today (blurred tiles)"],
];

// Tuned for the video (the author's pick, 2026-10-23; detail, ridge mix and drift from the
// author's settings panel, 2026-10-29, so it shows): a faint warp with soft added detail, slowly
// evolving, from ~28 source px (2^4.8)
export const NOISE_DEFAULTS = {
  mode: 8, move: true, speed: 0.09, drift: 0.055, ridge: 0.25, warp: 0.15,
  detail: 0.52, smooth: 1, start: 4.8, filter: 1, res: 1,
  // experimental (2026-10-30): the paths' moving dots and a short trail behind them drawn into the
  // background, read through its swirl warp. trail = their brightness (0 = off), trailLen = css px,
  // trailSwirl = how much harder than the painting they're swirled
  trail: 0, trailLen: 60, trailSwirl: 2,
  // ...and the pictures' cast shadows drawn into it too, swirled shadowSwirl × the painting (0 = off:
  // they stay SVG). On at 1 on the site (the author liked its subtle twirl, 2026-10-30); videos keep it
  // off unless a scene asks (narration.js)
  shadowSwirl: 1,
};

const VS = `#version 300 es
in vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }`;

const FS = `#version 300 es
precision highp float; precision highp int;
#define MAXOCT ${MAXOCT}
uniform sampler2D uMain, uBase;
uniform vec2 uMainSize, uBaseSize, uCMain, uCBase, uRes;
uniform float uMainScale, uBaseScale, uZx, uZy, uZoomCss, uTime, uWarp, uDetail, uRough, uStart, uRidge;
uniform int uMode, uFilter, uHasBase, uHasTrail, uHasShadow;
uniform vec2 uOff[MAXOCT];
// the dots and their trails as light, drawn at screen position (createNoiseRenderer's setTrails);
// read through the swirl warp, uTrailSwirl × harder than the painting, by swirls up to uTrailBand device px
uniform sampler2D uTrail;
uniform float uTrailGain, uTrailSwirl, uTrailBand;
// the pictures' cast shadows, in colour (createNoiseRenderer's setShadows), laid over the painting through the swirl too
uniform sampler2D uShadow;
uniform float uShadowSwirl;
out vec4 o;
const float L0 = ${L0}.0;
float gZoom; // device px per source px (geometric mean of the axes)

// ---- hashing / gradient noise, periodic every 256 cells in x and y ----
uvec3 pcg3(uvec3 v){ v = v*1664525u + 1013904223u; v.x += v.y*v.z; v.y += v.z*v.x; v.z += v.x*v.y;
  v ^= v >> 16u; v.x += v.y*v.z; v.y += v.z*v.x; v.z += v.x*v.y; return v; }
vec3 grad(ivec3 c){ uvec3 h = pcg3(uvec3(uint(c.x) & 255u, uint(c.y) & 255u, uint(c.z)));
  return normalize(vec3(h & 1023u) / 511.5 - 1.0 + 1e-4); }
float gnoise(vec3 p){
  vec3 i = floor(p), f = p - i; ivec3 c = ivec3(i);
  vec3 u = f*f*f*(f*(f*6.-15.)+10.);
  float n000=dot(grad(c),f), n100=dot(grad(c+ivec3(1,0,0)),f-vec3(1,0,0)),
        n010=dot(grad(c+ivec3(0,1,0)),f-vec3(0,1,0)), n110=dot(grad(c+ivec3(1,1,0)),f-vec3(1,1,0)),
        n001=dot(grad(c+ivec3(0,0,1)),f-vec3(0,0,1)), n101=dot(grad(c+ivec3(1,0,1)),f-vec3(1,0,1)),
        n011=dot(grad(c+ivec3(0,1,1)),f-vec3(0,1,1)), n111=dot(grad(c+ivec3(1,1,1)),f-vec3(1,1,1));
  return mix(mix(mix(n000,n100,u.x),mix(n010,n110,u.x),u.y), mix(mix(n001,n101,u.x),mix(n011,n111,u.x),u.y), u.z) * 1.6;
}
// Worley F2-F1 on the 2D lattice, feature points drifting slowly in time
float cells(vec2 p, float t){
  vec2 i = floor(p), f = p - i; float d1 = 9., d2 = 9.;
  for (int y=-1;y<=1;y++) for (int x=-1;x<=1;x++){
    ivec2 c = ivec2(i) + ivec2(x,y);
    uvec3 h = pcg3(uvec3(uint(c.x)&255u, uint(c.y)&255u, 7u));
    vec2 r = vec2(h.xy & 65535u) / 65535.;
    r = .5 + .4*sin(6.2831*r + t*(.5 + r.yx));
    float d = length(vec2(x,y) + r - f);
    if (d < d1){ d2 = d1; d1 = d; } else if (d < d2) d2 = d;
  }
  return d2 - d1;
}

// ---- octave bookkeeping: world-anchored, zoom-faded ----
float lamOf(int i){ return L0 * exp2(-float(i)); }
float env(float lam){ return smoothstep(2.0, 6.0, lam*gZoom) * (1.0 - smoothstep(uStart, 2.0*uStart, lam)); }
vec2 octP(int i, vec2 d, float lam){
  float a = float(i)*2.39996; float c = cos(a), s = sin(a);
  return mat2(c, s, -s, c) * d / lam + uOff[i];
}
float octT(int i){ return uTime * (1.0 + 0.12*float(i)) + float(i)*13.7; }

float fbm(vec2 d, float ch){
  float s = 0.;
  for (int i=0;i<MAXOCT;i++){ float lam = lamOf(i); if (lam*gZoom < 2.0) break;
    float w = env(lam); if (w <= 0.) continue;
    s += w * pow(lam/uStart, uRough) * gnoise(vec3(octP(i,d,lam) + ch*vec2(37.1,91.7), octT(i) + ch*50.)); }
  return s;
}
// displacement field in source px; each octave moves pixels by a fraction of
// its own wavelength, lower smoothness lets finer octaves fold relatively more
vec2 fbmVec(vec2 d, float ch){
  vec2 s = vec2(0);
  for (int i=0;i<MAXOCT;i++){ float lam = lamOf(i); if (lam*gZoom < 2.0) break;
    float w = env(lam); if (w <= 0.) continue;
    vec3 p = vec3(octP(i,d,lam) + ch*vec2(17.3,53.9), octT(i) + ch*31.);
    float k = w * lam * min(pow(lam/uStart, uRough - 1.0), 1.5);
    s += k * vec2(gnoise(p), gnoise(p + vec3(71.3, 11.9, 23.1))); }
  return s;
}
// fbmVec, plus (zw) the same sum kept to octaves up to uTrailBand device px wide (for the trails)
vec4 fbmVec2(vec2 d, float ch){
  vec4 s = vec4(0);
  for (int i=0;i<MAXOCT;i++){ float lam = lamOf(i); if (lam*gZoom < 2.0) break;
    float w = env(lam); if (w <= 0.) continue;
    vec3 p = vec3(octP(i,d,lam) + ch*vec2(17.3,53.9), octT(i) + ch*31.);
    float k = w * lam * min(pow(lam/uStart, uRough - 1.0), 1.5);
    vec2 g = vec2(gnoise(p), gnoise(p + vec3(71.3, 11.9, 23.1)));
    s += vec4(k * g, k * (1. - smoothstep(.5*uTrailBand, uTrailBand, lam*gZoom)) * g); }
  return s;
}
float ridged(vec2 d, float ch){
  float s = 0.;
  for (int i=0;i<MAXOCT;i++){ float lam = lamOf(i); if (lam*gZoom < 2.0) break;
    float w = env(lam); if (w <= 0.) continue;
    float r = 1. - abs(gnoise(vec3(octP(i,d,lam) + ch*vec2(23.9,61.3), octT(i) + ch*40.))); r *= r;
    s += w * pow(lam/uStart, uRough) * (r - .55) * 2.; }
  return s;
}
float web(vec2 d){
  float s = 0.;
  for (int i=0;i<MAXOCT;i++){ float lam = lamOf(i); if (lam*gZoom < 2.0) break;
    float w = env(lam); if (w <= 0.) continue;
    float e = 1. - smoothstep(0., .14, cells(octP(i,d,lam), octT(i)*.6));
    s += w * pow(lam/uStart, uRough) * (e - .25) * 2.; }
  return s;
}

// ---- texture sampling (main = tile window, base = whole low-res image) ----
vec3 tap(ivec2 c){ return texelFetch(uMain, clamp(c, ivec2(0), ivec2(uMainSize) - 1), 0).rgb; }
vec3 bilinear(vec2 tp){ vec2 x = tp - .5, i = floor(x), t = x - i; ivec2 c = ivec2(i);
  return mix(mix(tap(c), tap(c+ivec2(1,0)), t.x), mix(tap(c+ivec2(0,1)), tap(c+ivec2(1,1)), t.x), t.y); }
vec4 wBS(float t){ float t2=t*t, t3=t2*t; return vec4((1.-t)*(1.-t)*(1.-t), 3.*t3-6.*t2+4., -3.*t3+3.*t2+3.*t+1., t3)/6.; }
vec4 wCR(float t){ float t2=t*t, t3=t2*t; return vec4(-.5*t3+t2-.5*t, 1.5*t3-2.5*t2+1., -1.5*t3+2.*t2+.5*t, .5*t3-.5*t2); }
vec3 sampleMain(vec2 tp){
  if (uFilter == 0) return bilinear(tp);
  vec2 x = tp - .5, i = floor(x), t = x - i; ivec2 c = ivec2(i);
  vec4 wx = uFilter == 2 ? wCR(t.x) : wBS(t.x), wy = uFilter == 2 ? wCR(t.y) : wBS(t.y);
  vec3 s = vec3(0);
  for (int j=0;j<4;j++) for (int k=0;k<4;k++) s += wx[k]*wy[j]*tap(c + ivec2(k-1, j-1));
  return max(s, 0.);
}
// d: source px from the camera centre
vec3 sampleAt(vec2 d){
  vec2 tp = uCMain + d*uMainScale;
  vec3 m = sampleMain(tp);
  if (uHasBase == 0) return m;
  vec2 e = min(tp, uMainSize - tp);
  float inside = smoothstep(2., 10., min(e.x, e.y));
  if (inside >= 1.) return m;
  return mix(texture(uBase, (uCBase + d*uBaseScale) / uBaseSize).rgb, m, inside);
}
vec3 today(vec2 d){
  float blurCss = uZoomCss > 1.2 ? min(14., uZoomCss*3.) : 0.;
  float sig = blurCss / uZoomCss * uMainScale; // texels
  vec2 tp = uCMain + d*uMainScale;
  if (sig < .05) return bilinear(tp);
  vec3 s = vec3(0); float ws = 0.;
  for (int j=-4;j<=4;j++) for (int k=-4;k<=4;k++){
    vec2 q = vec2(k,j)*.5; float w = exp(-.5*dot(q,q));
    s += w * bilinear(tp + q*sig); ws += w; }
  return s / ws;
}

void main(){
  gZoom = sqrt(uZx*uZy);
  vec2 fc = gl_FragCoord.xy - uRes*.5;
  vec2 d = vec2(fc.x/uZx, -fc.y/uZy);          // source px from camera centre, y down
  vec3 col;
  if (uMode == 0) col = today(d);
  else if (uMode == 1) col = sampleAt(d);
  else if (uMode == 2) col = sampleAt(d) * exp(uDetail * .8 * fbm(d, 0.));
  else if (uMode == 3) col = sampleAt(d) * exp(uDetail * .8 * fbm(d + 2.5*uWarp*fbmVec(d, 1.), 0.));
  else if (uMode == 4) col = sampleAt(d) * exp(uDetail * .5 * ridged(d, 0.));
  else if (uMode == 5) col = sampleAt(d) * exp(uDetail * .5 * web(d));
  else {
    vec2 q = fbmVec(d, 2.);
    vec2 disp, dT;
    if (uHasTrail == 1 || uHasShadow == 1) { vec4 v = fbmVec2(d + 1.5*q, 3.); disp = uWarp * v.xy; dT = v.zw; }
    else disp = uWarp * fbmVec(d + 1.5*q, 3.);
    col = sampleAt(d + disp);
    if (uMode == 7) col *= exp(uDetail * .45 * fbm(d + disp + 2.*q, 4.));
    if (uMode == 8) { vec2 w = d + disp + 2.*q;
      col *= exp(uDetail * ((1. - uRidge) * .45 * fbm(w, 4.) + uRidge * .55 * ridged(w + q, 5.))); }
    if (uHasShadow == 1) {  // the pictures' shadows, swirled
      vec2 ps = d + uShadowSwirl * uWarp * dT;
      vec4 sh = texture(uShadow, vec2(ps.x*uZx, -ps.y*uZy) / uRes + .5);
      col = mix(col, sh.rgb, sh.a);
    }
    if (uHasTrail == 1) {   // the dots' light, swirled
      vec2 pt = d + uTrailSwirl * uWarp * dT;
      col += uTrailGain * texture(uTrail, vec2(pt.x*uZx, -pt.y*uZy) / uRes + .5).rgb;
    }
  }
  o = vec4(col, 1.);
}`;

/** Low-level renderer: one GL program drawing into `canvas`. */
export function createNoiseRenderer(canvas, { preserve = false } = {}) {
  const gl = canvas.getContext("webgl2", { preserveDrawingBuffer: preserve, antialias: false, alpha: false });
  if (!gl) return null;
  const shader = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
  const locs = {};
  const U = n => (locs[n] ??= gl.getUniformLocation(prog, n));

  const slots = {};
  function setTexture(name, source, info) {
    const unit = name === "main" ? 0 : 1;
    gl.activeTexture(gl.TEXTURE0 + unit);
    const tex = slots[name]?.tex || gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const filt = name === "main" ? gl.NEAREST : gl.LINEAR; // main is filtered in the shader
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filt);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filt);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, source);
    slots[name] = { tex, ...info };
  }

  // ---- the dots' trails: soft coloured points splatted additively into a half-res float texture ----
  let trail = null, trailN = 0, trailOpts = null;
  function trailInit() {
    if (!gl.getExtension("EXT_color_buffer_float")) return null;
    const sp = gl.createProgram();
    gl.attachShader(sp, shader(gl.VERTEX_SHADER, `#version 300 es
      in vec2 aPos; in vec4 aVal; out vec3 vCol; uniform float uPx;
      void main(){ gl_Position = vec4(aPos, 0., 1.); gl_PointSize = max(1., 2. * aVal.x * uPx); vCol = aVal.yzw; }`));
    gl.attachShader(sp, shader(gl.FRAGMENT_SHADER, `#version 300 es
      precision highp float; in vec3 vCol; out vec4 o;
      void main(){ vec2 c = gl_PointCoord*2. - 1.; float r2 = dot(c, c); if (r2 > 1.) discard;
        o = vec4(vCol * exp(-3.*r2) * (1. - r2), 0.); }`));
    gl.linkProgram(sp);
    if (!gl.getProgramParameter(sp, gl.LINK_STATUS)) return null;
    const vao = gl.createVertexArray(), buf = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    const aPos = gl.getAttribLocation(sp, "aPos"), aVal = gl.getAttribLocation(sp, "aVal");
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(aVal); gl.vertexAttribPointer(aVal, 4, gl.FLOAT, false, 24, 8);   // radius css px, rgb
    gl.bindVertexArray(null);
    const tex = gl.createTexture(), fb = gl.createFramebuffer();
    return { sp, vao, buf, tex, fb, w: 0, h: 0, uPx: gl.getUniformLocation(sp, "uPx"), data: new Float32Array(0) };
  }
  /**
   * The dots and their trails for the next render, or null for none: pts = [x, y (css px in the
   * plot area), radius (css px), r, g, b (light, 0–1 × weight)] × n. opts: { gain, swirl, band
   * (css px: the widest swirls that move them), cssW, cssH }.
   */
  function setTrails(pts, n, opts) {
    if (!pts || !n) { trailN = 0; return; }
    if (trail === null) trail = trailInit() || false;
    if (!trail) return;
    if (trail.data.length < n * 6) trail.data = new Float32Array(n * 6 * 2);
    trail.data.set(pts.subarray(0, n * 6));
    for (let k = 0; k < n * 6; k += 6) {   // to clip space
      trail.data[k] = pts[k] / opts.cssW * 2 - 1; trail.data[k + 1] = 1 - pts[k + 1] / opts.cssH * 2;
    }
    trailN = n; trailOpts = opts;
  }
  const TRAIL_DOWN = 2; // trail texture: half the canvas's resolution
  function drawTrails(p) {
    const sw = Math.max(1, Math.ceil(p.w / TRAIL_DOWN)), sh = Math.max(1, Math.ceil(p.h / TRAIL_DOWN));
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, trail.tex);
    if (trail.w !== sw || trail.h !== sh) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, sw, sh, 0, gl.RGBA, gl.HALF_FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, trail.fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, trail.tex, 0);
      trail.w = sw; trail.h = sh;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, trail.fb);
    gl.viewport(0, 0, sw, sh);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(trail.sp);
    gl.uniform1f(trail.uPx, p.w / trailOpts.cssW / TRAIL_DOWN);   // trail-texture px per css px
    gl.bindVertexArray(trail.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, trail.buf);
    gl.bufferData(gl.ARRAY_BUFFER, trail.data.subarray(0, trailN * 6), gl.DYNAMIC_DRAW);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    gl.drawArrays(gl.POINTS, 0, trailN);
    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(prog);
  }

  // ---- the pictures' shadows: a canvas the chart draws them into (colour + alpha), uploaded each render ----
  let shadowCanvas = null, shadowSwirl = 0, shadowTex = null, shadowStale = true;
  /** fresh: the canvas changed since the last call (it's uploaded again only then) */
  function setShadows(canvas, swirl, fresh = true) {
    if (fresh || canvas !== shadowCanvas) shadowStale = true;
    shadowCanvas = canvas; shadowSwirl = swirl || 0;
  }

  const off = new Float32Array(MAXOCT * 2);
  /**
   * p: { w, h } device px · { cx, cy } camera centre in source px (doubles)
   * { zx, zy } device px per source px · zoomCss · time · drift · and the
   * look params (mode, warp, detail, smooth, start, ridge, filter).
   */
  function render(p) {
    const main = slots.main;
    if (!main) return false;
    const base = slots.base;
    if (canvas.width !== p.w || canvas.height !== p.h) { canvas.width = p.w; canvas.height = p.h; }
    gl.viewport(0, 0, p.w, p.h);
    for (let i = 0; i < MAXOCT; i++) {
      const lam = L0 * 2 ** -i, a = i * 2.39996, c = Math.cos(a), s = Math.sin(a);
      const ox = (c * p.cx - s * p.cy) / lam + p.drift, oy = (s * p.cx + c * p.cy) / lam + p.drift * 0.37;
      off[2 * i] = ((ox % 256) + 256) % 256; off[2 * i + 1] = ((oy % 256) + 256) % 256;
    }
    gl.uniform2fv(U("uOff"), off);
    gl.uniform1i(U("uMain"), 0); gl.uniform1i(U("uBase"), 1);
    gl.uniform2f(U("uMainSize"), main.w, main.h);
    gl.uniform1f(U("uMainScale"), main.scale);
    gl.uniform2f(U("uCMain"), (p.cx - main.x0) * main.scale, (p.cy - main.y0) * main.scale);
    gl.uniform1i(U("uHasBase"), base ? 1 : 0);
    if (base) {
      gl.uniform2f(U("uBaseSize"), base.w, base.h);
      gl.uniform1f(U("uBaseScale"), base.scale);
      gl.uniform2f(U("uCBase"), (p.cx - base.x0) * base.scale, (p.cy - base.y0) * base.scale);
    }
    gl.uniform2f(U("uRes"), p.w, p.h);
    gl.uniform1f(U("uZx"), p.zx); gl.uniform1f(U("uZy"), p.zy);
    gl.uniform1f(U("uZoomCss"), p.zoomCss);
    gl.uniform1f(U("uTime"), p.time);
    gl.uniform1f(U("uWarp"), p.warp); gl.uniform1f(U("uDetail"), p.detail);
    gl.uniform1f(U("uRough"), p.smooth); gl.uniform1f(U("uStart"), 2 ** p.start);
    gl.uniform1f(U("uRidge"), p.ridge);
    gl.uniform1i(U("uFilter"), p.filter); gl.uniform1i(U("uMode"), p.mode);
    const trails = trailN > 0 && trail;
    if (trails) {
      drawTrails(p);
      gl.viewport(0, 0, p.w, p.h);
      gl.uniform1i(U("uTrail"), 2);
      gl.uniform1f(U("uTrailGain"), trailOpts.gain);
      gl.uniform1f(U("uTrailSwirl"), trailOpts.swirl);
      gl.uniform1f(U("uTrailBand"), trailOpts.band * p.w / trailOpts.cssW);
    }
    gl.uniform1i(U("uHasTrail"), trails ? 1 : 0);
    const shadows = !!(shadowCanvas && shadowSwirl > 0 && shadowCanvas.width);
    if (shadows) {
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, shadowTex ??= gl.createTexture());
      if (shadowStale) {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);   // canvas rows run down, the screen's up
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, shadowCanvas);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        shadowStale = false;
      }
      gl.uniform1i(U("uShadow"), 3);
      gl.uniform1f(U("uShadowSwirl"), shadowSwirl);
      if (!trails) gl.uniform1f(U("uTrailBand"), 300 * p.w / p.cssW);   // the swirls that move them (fbmVec2)
    }
    gl.uniform1i(U("uHasShadow"), shadows ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return true;
  }
  return { gl, setTexture, render, setTrails, setShadows };
}

/** Number of octaves currently contributing (for readouts). */
export function liveOctaves(zoomDev, start) {
  let n = 0;
  for (let i = 0; i < MAXOCT; i++) { const l = L0 * 2 ** -i; if (l * zoomDev >= 2 && l < 2 * 2 ** start) n++; }
  return n;
}

// =============================================================
// App layer: shared params, tile window texture, render loop, controls
// =============================================================

/** Live look params, shared by the renderer and the controls. Only the values
 *  a viewer changed are kept (per browser), so profile defaults still apply. */
let saved = {};
try { saved = JSON.parse(localStorage.getItem("tri-bgnoise")) || {}; } catch { /* defaults */ }
export const noiseParams = { ...NOISE_DEFAULTS, ...saved };
const saveParams = () => {
  saved = Object.fromEntries(Object.entries(noiseParams).filter(([k, v]) => v !== NOISE_DEFAULTS[k]));
  try { localStorage.setItem("tri-bgnoise", JSON.stringify(saved)); } catch { /* private mode */ }
};
/** Override defaults for this page (e.g. half resolution on the website). */
export function applyNoiseProfile(profile) {
  Object.assign(NOISE_DEFAULTS, profile);
  for (const k in profile) if (!(k in saved)) noiseParams[k] = profile[k];
  for (const el of readouts) el.closest(".bgnoise-panel")?.dispatchEvent(new Event("bgnoise-sync"));
}

let active = null;      // the running layer, if any
const readouts = new Set();

// "/" on the site, "./" in the narration preview
const BASE = import.meta.env.BASE_URL;
const loadImg = src => new Promise(res => {
  const im = new Image();
  im.onload = () => res(im); im.onerror = () => res(null); im.src = src;
});

/**
 * createBgNoise({ host, meta, getView, getTime, onShown, onLost }) → { setVisible, draw, pending, destroy } | null (no WebGL2)
 * Starts hidden and idle. setVisible(true) runs the loop; the canvas fades in
 * (and onShown fires) on the first frame drawn with the tile texture ready.
 * setVisible(false) fades it out and stops all work.
 *  host    — HTML element containing the canvas (in the chart's background foreignObject)
 *  meta    — /tiles/meta.json
 *  onLost  — the GL context was lost (the canvas is blank); the caller destroys it
 *  getView — () => { left, top, w, h } css px of the plot area, plus
 *            { cx, cy } camera centre in source px and { zx, zy } css px per source px
 *  getShadows — optional (view) => { canvas, swirl, fresh } | null: the pictures' shadows drawn into a
 *            canvas over the plot area, to darken the painting through the swirl (experimental)
 *  getTime — optional () => seconds | null: a clock the clouds evolve by (a narration's
 *            audio time), so each frame is a pure function of it, the same in the live
 *            player and in every render worker. null (or no getTime): they evolve by
 *            the frames' own real time, as on the site
 */
export function createBgNoise({ host, meta, getView, getTime, getShadows, onShown, onLost }) {
  const canvas = document.createElement("canvas");
  canvas.className = "bgnoise-canvas";
  host.prepend(canvas);
  const r = createNoiseRenderer(canvas);
  if (!r) { canvas.remove(); return null; }
  // A phone short of memory can take the GL context away: the canvas goes
  // blank, so hand the background back to the painted tiles (onLost).
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); if (alive) onLost?.(); });

  // ---- textures: whole image at z2 as fallback, a tile window at the needed level ----
  const T = meta.tileSize;
  let win = null, building = false, alive = true, dirty = true, visible = false, shown = false, stopTimer = 0, baseReady = false;
  (async () => {
    const lv = meta.levels[2], cv = Object.assign(document.createElement("canvas"), { width: lv.w, height: lv.h });
    const cx = cv.getContext("2d");
    await Promise.all([...Array(lv.cols * lv.rows)].map(async (_, k) => {
      const c = k % lv.cols, rr = k / lv.cols | 0, im = await loadImg(`${BASE}tiles/z${lv.z}/tile_${c}_${rr}.webp`);
      if (im) cx.drawImage(im, c * T, rr * T);
    }));
    if (!alive) return;
    r.setTexture("base", cv, { x0: 0, y0: 0, scale: lv.scale, w: lv.w, h: lv.h });
    baseReady = true;
    dirty = true;
    if (visible) paint();   // now, not on the next frame: a render's frozen clock may not give one
  })();

  function wantWindow(v) {
    // Match drawTiles' source detail so switching renderers doesn't replace
    // the painting with a coarser texture. Noise adds detail beyond the source.
    const zoomCss = Math.sqrt(v.zx * v.zy);
    const targetScale = zoomCss * Math.min(2, devicePixelRatio || 1);
    let lv = meta.levels[0];
    for (const l of meta.levels) { lv = l; if (l.scale >= targetScale) break; }
    const hw = v.w / 2 / v.zx, hh = v.h / 2 / v.zy, s = lv.scale / T;
    const clampC = c => Math.max(0, Math.min(lv.cols - 1, c)), clampR = rr => Math.max(0, Math.min(lv.rows - 1, rr));
    return { lv, c0: clampC(Math.floor((v.cx - hw) * s)), c1: clampC(Math.floor((v.cx + hw) * s)),
      r0: clampR(Math.floor((v.cy - hh) * s)), r1: clampR(Math.floor((v.cy + hh) * s)) };
  }
  async function build(want) {
    building = true;
    const { lv } = want;
    const c0 = Math.max(0, want.c0 - 1), c1 = Math.min(lv.cols - 1, want.c1 + 1);
    const r0 = Math.max(0, want.r0 - 1), r1 = Math.min(lv.rows - 1, want.r1 + 1);
    const w = Math.min(lv.w, (c1 + 1) * T) - c0 * T, h = Math.min(lv.h, (r1 + 1) * T) - r0 * T;
    const cv = Object.assign(document.createElement("canvas"), { width: w, height: h }), cx = cv.getContext("2d");
    const jobs = [];
    for (let rr = r0; rr <= r1; rr++) for (let c = c0; c <= c1; c++) jobs.push((async () => {
      const im = await loadImg(`${BASE}tiles/z${lv.z}/tile_${c}_${rr}.webp`);
      if (im) cx.drawImage(im, (c - c0) * T, (rr - r0) * T);
    })());
    await Promise.all(jobs);
    if (!alive) return;
    r.setTexture("main", cv, { x0: c0 * T / lv.scale, y0: r0 * T / lv.scale, scale: lv.scale, w, h });
    win = { z: lv.z, c0, c1, r0, r1 };
    building = false;
    dirty = true;
    if (visible) paint();
  }

  // ---- loop: draws every frame while moving, otherwise only when the view or a param changes ----
  let time = 0, drift = 0, last = performance.now(), raf = 0, lastKey = "", hadTrails = false;
  const clock = () => { const t = getTime?.(); return Number.isFinite(t) ? t : null; };
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const p = noiseParams;
    if (p.move && clock() === null) { time += dt * p.speed; drift = (drift + dt * p.drift) % 256; }
    paint();
  }
  function paint() {
    const p = noiseParams, t = clock();
    if (p.move && t !== null) { time = t * p.speed; drift = (t * p.drift) % 256; }
    const v = getView();
    if (!v || v.w < 2 || v.h < 2) return;
    const want = wantWindow(v);
    if (!building && !(win && win.z === want.lv.z && want.c0 >= win.c0 && want.c1 <= win.c1 && want.r0 >= win.r0 && want.r1 <= win.r1)) build(want);
    const dpr = Math.min(2, devicePixelRatio || 1) * p.res;
    const key = `${v.left},${v.top},${v.w},${v.h},${v.cx},${v.cy},${v.zx},${v.zy},${dpr},${time},${drift}`;
    if (!dirty && key === lastKey) return;
    lastKey = key; dirty = false;
    const st = canvas.style;
    if (st.left !== v.left + "px") st.left = v.left + "px";
    if (st.top !== v.top + "px") st.top = v.top + "px";
    if (st.width !== v.w + "px") st.width = v.w + "px";
    if (st.height !== v.h + "px") st.height = v.h + "px";
    const sh = getShadows?.(v);
    r.setShadows(sh?.canvas, sh?.swirl, sh?.fresh ?? true);
    const drew = win && r.render({ ...p, cssW: v.w, w: Math.round(v.w * dpr), h: Math.round(v.h * dpr), cx: v.cx, cy: v.cy,
      zx: v.zx * dpr, zy: v.zy * dpr, zoomCss: Math.sqrt(v.zx * v.zy), time, drift });
    if (!drew) { dirty = true; return; }
    if (!shown) { shown = true; canvas.classList.add("bgnoise-shown"); onShown?.(); }
    const text = `${Math.sqrt(v.zx * v.zy).toFixed(2)}× source pixels · tiles z${win?.z ?? "–"} · ${liveOctaves(Math.sqrt(v.zx * v.zy) * dpr, p.start)} octaves live`;
    for (const el of readouts) if (el.textContent !== text) el.textContent = text;
  }
  active = {
    invalidate() { dirty = true; },
    /** The dots and their trails for the next frame (createNoiseRenderer's setTrails); null to clear. */
    setTrails(pts, n, opts) { if (!n && !hadTrails) return; hadTrails = !!n; r.setTrails(pts, n, opts); dirty = true; },
    /** Draw now for the current view and clock (a narration frame), not on the next animation frame. */
    draw() { if (visible && alive) paint(); },
    /** Still loading what this view needs, or not drawn yet (a render waits for it). */
    pending: () => visible && alive && (!baseReady || building || !shown),
    setVisible(v) {
      if (v === visible || !alive) return;
      visible = v;
      clearTimeout(stopTimer);
      if (v) {
        if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
        dirty = true;
      } else {
        shown = false;
        canvas.classList.remove("bgnoise-shown");
        // keep the last frame while it fades, then stop the loop entirely
        stopTimer = setTimeout(() => { cancelAnimationFrame(raf); raf = 0; }, 600);
      }
    },
    destroy() {
      alive = false; cancelAnimationFrame(raf); clearTimeout(stopTimer);
      canvas.remove();
      r.gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (active === this) active = null;
      for (const el of readouts) el.textContent = "Off";
    },
  };
  return active;
}

/** Mount the look controls into `container` (once); they edit noiseParams live. */
export function mountNoiseControls(container) {
  const box = document.createElement("div");
  box.className = "bgnoise-panel";
  const range = (key, label, min, max, step, fmt, title = "") =>
    `<label class="bgnoise-row" title="${title}"><span class="bgnoise-label">${label}</span>` +
    `<input class="bgnoise-range" type="range" data-k="${key}" min="${min}" max="${max}" step="${step}">` +
    `<output class="bgnoise-out" data-o="${key}" data-f="${fmt}"></output></label>`;
  box.innerHTML = `
    <h2 class="bgnoise-title">Fractal background</h2>
    <p class="bgnoise-note">Zoom past the painted tiles (especially near the Hubble radius) and the painting keeps folding into finer detail.</p>
    <label class="bgnoise-row"><span class="bgnoise-label">Pattern</span>
      <select class="bgnoise-select" data-k="mode">${NOISE_MODES.map(([m, n]) => `<option value="${m}">${n}</option>`).join("")}</select></label>
    <label class="bgnoise-row bgnoise-check"><input type="checkbox" data-k="move"> <span class="bgnoise-label">Move over time</span></label>
    ${range("speed", "Evolve", 0, 1, 0.01, "2", "How fast the clouds change shape in place")}
    ${range("drift", "Drift", 0, 0.5, 0.005, "3", "How fast the clouds flow; each octave drifts its own way")}
    ${range("ridge", "Ridge mix", 0, 1, 0.01, "2", "0 = swirl detail only, 1 = ridged veins only (Warp + swirl + ridges)")}
    ${range("warp", "Warp", 0, 3, 0.01, "2", "How far the painting is folded")}
    ${range("detail", "Detail", 0, 1.5, 0.01, "2", "Strength of the added brightness detail")}
    ${range("smooth", "Smoothness", 0, 1, 0.01, "2", "0 = every octave equally strong (rough, CMB-like); 1 = finer octaves fade (soft clouds)")}
    ${range("start", "Starts at", 0, 5, 0.01, "px", "Largest scale the noise may touch, in source pixels. Larger = it starts reshaping the painting at normal zoom")}
    ${range("trail", "Dot trails", 0, 1, 0.005, "3", "Experimental: the paths' moving dots and a short trail behind each drawn into the background, so its swirls carry their light. Brightness; 0 = off")}
    ${range("trailLen", "Trail length", 0, 300, 5, "0", "css px behind each dot")}
    ${range("trailSwirl", "Trail swirl", 0, 20, 0.5, "1", "How much harder than the painting the trails are swirled (1 = just as much)")}
    ${range("shadowSwirl", "Shadow swirl", 0, 5, 0.05, "2", "The pictures' shadows drawn into the background and swirled with it, this much harder than the painting. 0 = off")}
    <label class="bgnoise-row"><span class="bgnoise-label">Base filter</span>
      <select class="bgnoise-select" data-k="filter"><option value="1">B-spline (smooth)</option><option value="2">Catmull-Rom (sharp)</option><option value="0">Bilinear</option></select></label>
    <label class="bgnoise-row"><span class="bgnoise-label">Resolution</span>
      <select class="bgnoise-select" data-k="res"><option value="1">Full</option><option value="0.75">75%</option><option value="0.5">50%</option></select></label>
    <button class="bgnoise-reset" type="button">Reset to defaults</button>
    <p class="bgnoise-readout">${active ? "" : "Off"}</p>`;
  container.append(box);
  readouts.add(box.querySelector(".bgnoise-readout"));
  const fmt = (f, v) => f === "px" ? (2 ** v).toFixed(1) + " px" : (+v).toFixed(+f);
  function sync() {
    for (const el of box.querySelectorAll("[data-k]")) {
      const k = el.dataset.k;
      if (el.type === "checkbox") el.checked = !!noiseParams[k]; else el.value = noiseParams[k];
    }
    for (const o of box.querySelectorAll("[data-o]")) o.textContent = fmt(o.dataset.f, noiseParams[o.dataset.o]);
    active?.invalidate();
  }
  box.addEventListener("bgnoise-sync", sync);
  box.addEventListener("input", e => {
    const k = e.target.dataset?.k; if (!k) return;
    noiseParams[k] = e.target.type === "checkbox" ? e.target.checked : +e.target.value;
    sync(); saveParams();
  });
  box.querySelector(".bgnoise-reset").onclick = () => {
    Object.assign(noiseParams, NOISE_DEFAULTS); sync(); saveParams();
  };
  sync();
}
