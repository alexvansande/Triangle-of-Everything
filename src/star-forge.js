// src/star-forge.js
// The generated stars (the author's Star Forge, tools/star-forge.html): every star a two-colour fractal
// on a sphere inside a glowing atmosphere, its colours picked by temperature. Shared by the catalogue
// page, where they're tuned, and the videos' live stars (src/star-icons.js), so what's tuned is what
// the videos show. The site's chart keeps its pictures.

// stretch a linear colour away from its own grey by k, keeping the brightest channel at its level
// (done on gamma-encoded values, so the stretch is even to the eye)
export function boost(c, k) {
  const m0 = Math.max(...c), e = c.map(v => Math.pow(v / m0, 1 / 2.2));
  const L = (e[0] + e[1] + e[2]) / 3;
  const o = e.map(v => Math.max(0, L + (v - L) * k)), m = Math.max(...o);
  return o.map(v => Math.pow(v / m, 2.2) * m0);
}

// ---------------------------------------------------------------- palettes by temperature
// Every star gets two colours: a deep one for the lanes, spots and the atmosphere's base, and a
// bright one for the hot granules and the network. Both slide along one sequence ordered by
// temperature (the spectral classes M K G F A B O): crimson→orange for the coolest, orange→yellow
// for the Sun, cyan→white for A stars, blue→ice for B, violet→blue for the hottest. The bright
// colour stays close to the star's real colour on the Vega-balanced blackbody scale; the deep one
// leans one step further out along the sequence (redder for cool stars, more violet for hot ones).
// Interpolated in log T, in linear RGB.
export const PALETTE = [ // [T, deep, bright]
  [2600,  [0.40, 0.010, 0.006], [1.00, 0.32, 0.030]],
  [3300,  [0.55, 0.015, 0.006], [1.00, 0.50, 0.060]],   // M: red and yellow-orange
  [4200,  [0.62, 0.050, 0.005], [1.00, 0.62, 0.100]],   // K
  [5800,  [0.70, 0.100, 0.004], [1.00, 0.75, 0.200]],   // G
  [7200,  [0.75, 0.280, 0.040], [1.00, 0.90, 0.550]],   // F
  [9800,  [0.18, 0.420, 0.850], [1.00, 1.00, 1.000]],   // A
  [15000, [0.03, 0.200, 0.850], [0.55, 0.85, 1.000]],   // late B
  [25000, [0.02, 0.060, 0.750], [0.22, 0.68, 1.000]],   // B: navy and cyan
  [50000, [0.18, 0.020, 0.800], [0.30, 0.50, 1.000]],   // O, Wolf-Rayet: violet and blue
];
let hueK = 1;
export const setHue = k => { hueK = k; };
export const getHue = () => hueK;
export function palette(T) {
  const P = PALETTE, lt = Math.log(Math.min(Math.max(T, P[0][0]), P[P.length - 1][0]));
  let i = 0; while (i < P.length - 2 && lt > Math.log(P[i + 1][0])) i++;
  const f = (lt - Math.log(P[i][0])) / (Math.log(P[i + 1][0]) - Math.log(P[i][0]));
  const mixc = (x, y) => x.map((v, k) => v + (y[k] - v) * f);
  return { deep: boost(mixc(P[i][1], P[i + 1][1]), hueK), bright: boost(mixc(P[i][2], P[i + 1][2]), hueK) };
}

// ---------------------------------------------------------------- the catalogue
// kind: 0 star, 2 white dwarf, 3 neutron star. T: effective temperature (K).
// scale: cells across the sphere; cells: convection cells; network: their bright magnetic edges;
// warp: swirl; ridge: filaments; active: bright active regions (in belts at activeLat, or anywhere at 0);
// spots: dark spots; limb: limb darkening; atm: the glowing shell's thickness (star radii);
// atmGlow: its brightness; spic: spicules (radial fine streaks); prom: prominences and loops;
// glow: the wide halo; wind: a streaming outflow; rot: spin (rad/s); evolve: surface change; tilt.
// The brown dwarfs keep their pictures (the author, 2026-10-31).
// Every star starts from the author's Proxima Centauri (2026-10-31) and changes only what makes it
// itself: its temperature (so its colours), the size of its cells, its atmosphere, a few features.
// Its pattern differs too: each star has its own noise seed.
export const MODEL = { rot: 0.05, evolve: 0.205, scale: 16.9, cells: 1, warp: 1.67, ridge: 0, network: 1.5, active: 1.5, activeLat: 0,
  spots: 1, limb: 1, atm: 0.3, atmGlow: 1.44, spic: 1.84, prom: 1.29, hi: 0.36, hiSize: 1, hiT: 1.6, flare: 1.34, glow: 1.41,
  wind: 1.06, tilt: 0.45, tone: 0.4, toneSpread: 1.2, toneSharp: 0.45 };
// The author liked the strong colour regions on Proxima and the blue supergiant only (2026-10-31: on the
// others two distinct tones read as a dalmatian), so those two set them strong; the rest stay subtle.
const STRONG_TONES = { tone: 0.9, toneSpread: 1.5, toneSharp: 0.12 };
export const STARS = [
  { slug: "proxima-cen", name: "Proxima Centauri", cls: "M5.5 V", T: 3042, kind: 0,
    ...STRONG_TONES,
    note: "3,042 K. A flare star: big starspots, and flares that briefly brighten it. The model the others start from." },
  { slug: "red-dwarf", name: "Red dwarf (TOI-700)", cls: "M2 V", T: 3480, kind: 0,
    scale: 14, flare: 0.7, spots: 0.85, tilt: -0.3, evolve: 0.17,
    note: "3,480 K. The most common kind of star; large, long-lived spots, calmer than Proxima." },
  { slug: "betelgeuse", name: "Betelgeuse", cls: "M2 Iab", T: 3600, kind: 0,
    scale: 3, warp: 1.9, network: 0.9, active: 0.7, spots: 0.4, atm: 0.42, prom: 1.5, spic: 1.2, flare: 0.4, rot: 0.015, evolve: 0.08, tilt: 0.15,
    note: "3,600 K, ~760 Suns wide. A handful of giant convection cells, and a lumpy, extended atmosphere." },
  { slug: "red-giant", name: "Red giant", cls: "K5 III", T: 4000, kind: 0,
    scale: 6, network: 1.1, active: 0.9, spots: 0.6, atm: 0.36, flare: 0.5, rot: 0.025, evolve: 0.12, tilt: 0.25,
    note: "~4,000 K. The Sun's future: swollen, cooler, with cells a few hundred across." },
  { slug: "sun", name: "Sun", cls: "G2 V", T: 5772, kind: 0,
    scale: 22, activeLat: 0.3, spots: 0.8, atm: 0.26, flare: 0.6, wind: 0.8, tilt: 0.12,
    note: "5,772 K. Granules, a bright magnetic network, active regions and sunspots in two belts." },
  { slug: "vega", name: "Vega", cls: "A0 V", T: 9600, Tpole: 10150, Tequator: 7900, kind: 0,
    scale: 12, oblate: 0.16, grav: 1.0, active: 0.6, spots: 0.2, atm: 0.22, flare: 0.3, rot: 0.12, tilt: 0,
    note: "Spins in 12.5 h: flattened, with poles ~2,000 K hotter than its equator." },
  { slug: "sirius-a", name: "Sirius A", cls: "A1 V", T: 9940, kind: 0,
    scale: 13, active: 0.7, spots: 0.25, atm: 0.24, flare: 0.3, tilt: 0.2,
    note: "9,940 K. Brightest star in the night sky; a calm, nearly featureless surface." },
  { slug: "white-dwarf", name: "White dwarf", cls: "DA", T: 10000, kind: 2,
    scale: 10, warp: 1.2, network: 0.8, active: 0.3, spots: 0, atm: 0.1, spic: 0.8, prom: 0.4, wind: 0.2, flare: 0.15, rot: 0.1, tilt: 0.3,
    note: "~10,000 K, Earth-sized. Gravity 100,000× ours flattens away almost every feature: a thin atmosphere." },
  { slug: "blue-supergiant", name: "Blue supergiant", cls: "B Ia", T: 20000, kind: 0,
    scale: 6, ridge: 0.6, active: 1.0, spots: 0.4, atm: 0.4, wind: 1.4, flare: 0.8, rot: 0.03, tilt: 0.15, ...STRONG_TONES,
    note: "~20,000 K. Magnetic loops and a strong wind off a hot surface." },
  { slug: "sirius-b", name: "Sirius B", cls: "DA2", T: 25200, kind: 2,
    scale: 10, warp: 1.2, network: 0.8, active: 0.3, spots: 0, atm: 0.1, spic: 0.8, prom: 0.4, wind: 0.2, flare: 0.15, rot: 0.1, tilt: -0.2,
    note: "25,200 K. The Sun's mass in the size of Earth." },
  { slug: "wolf-rayet", name: "Wolf-Rayet", cls: "WN", T: 70000, kind: 0,
    scale: 7, ridge: 1.0, active: 0.8, spots: 0, toneHue: -70, atm: 0.5, wind: 1.6, spic: 2.0, flare: 0.8, rot: 0.03, tilt: 0.1,
    note: "30,000–200,000 K. Blowing its own outer layers away in a dense wind." },
  { slug: "neutron-star", name: "PSR J0030+0451", cls: "pulsar", T: 1.2e6, kind: 3, own: true,
    // the author's neutron-star base (2026-10-31)
    rot: 0.08, evolve: 0.025, scale: 14.5, cells: 0.12, warp: 2.5, ridge: 1, network: 1.06, active: 0.29, activeLat: 0,
    spots: 1, limb: 0.25, atm: 0.4, atmGlow: 0.95, spic: 0.32, prom: 0.39, hi: 1.04, hiSize: 0.29, hiT: 0.9, flare: 0.62,
    glow: 1.16, wind: 0, tilt: 0.85, lens: 0.15, aberr: 0.034,
    note: "A Sun and a third in a ball 26 km wide. Light bends round it: you see past its edge." },
];
const DEF = { cells: 0, network: 0, warp: 0.8, ridge: 0, active: 0, activeLat: 0, spots: 0, oblate: 0, grav: 0, wind: 0,
  lens: 0, aberr: 0, atm: 0, atmGlow: 0, spic: 0, prom: 0, hi: 0.55, hiSize: 0.32, hiT: 1.5, flare: 0.3,
  tone: 0, toneScale: 2.5, toneSharp: 0.18, toneSpread: 1.35, toneHue: 0 };
// tone: the cloud layer of colour regions (0 off, 1 full); toneScale: how many regions across;
// toneSharp: how soft their borders are; toneSpread: how far apart in temperature the two regions'
// palettes are (×/÷ the star's); toneHue: turns the warm regions' hue (degrees), for blue next to green.
const UNIFORM_KEYS = ["scale", "cells", "network", "warp", "ridge", "active", "activeLat", "spots", "limb", "atm", "atmGlow", "spic", "prom",
  "glow", "wind", "rot", "evolve", "tilt", "seed", "oblate", "grav", "flare", "lens", "aberr", "hi", "hiSize", "tone", "toneScale", "toneSharp"];
STARS.forEach((s, i) => { if (!s.own) for (const k in MODEL) if (s[k] === undefined) s[k] = MODEL[k];
  for (const k in DEF) if (s[k] === undefined) s[k] = DEF[k]; s.seed = i * 7.31 + 1.7; s.orig = JSON.parse(JSON.stringify(s)); });

// ---------------------------------------------------------------- renderer
const VS = `#version 300 es
in vec2 a; out vec2 uv; void main(){ uv = a; gl_Position = vec4(a, 0., 1.); }`;
const FS = `#version 300 es
precision highp float; precision highp int;
in vec2 uv; out vec4 o;
uniform vec2 uView;   // the parallax: the star seen turned by (sideways, up) radians
uniform int uAlpha;   // 1: brightness becomes opacity (a transparent picture, for the chart)
uniform float uTime, uR, uSize, uScale, uCells, uNetwork, uWarp, uRidge, uActive, uActiveLat, uSpots, uLimb, uAtm, uAtmGlow,
  uSpic, uProm, uGlow, uWind, uRot, uEvolve, uTilt, uSeed, uOblate, uGrav, uFlare, uLens, uAberr, uHi, uHiSize, uTone, uToneScale, uToneSharp;
uniform int uKind;
uniform vec3 uDeep, uBright, uGlowC, uHiC, uDeepA, uBrightA, uDeepB, uBrightB;

uvec3 pcg3(uvec3 v){ v = v*1664525u + 1013904223u; v.x += v.y*v.z; v.y += v.z*v.x; v.z += v.x*v.y;
  v ^= v >> 16u; v.x += v.y*v.z; v.y += v.z*v.x; v.z += v.x*v.y; return v; }
vec3 h3(vec3 c){ uvec3 h = pcg3(uvec3(ivec3(c) + 4096)); return vec3(h >> 16u) / 32767.5 - 1.0; }
float gn(vec3 p){
  vec3 i = floor(p), f = p - i, u = f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(mix(dot(h3(i), f), dot(h3(i+vec3(1,0,0)), f-vec3(1,0,0)), u.x),
                 mix(dot(h3(i+vec3(0,1,0)), f-vec3(0,1,0)), dot(h3(i+vec3(1,1,0)), f-vec3(1,1,0)), u.x), u.y),
             mix(mix(dot(h3(i+vec3(0,0,1)), f-vec3(0,0,1)), dot(h3(i+vec3(1,0,1)), f-vec3(1,0,1)), u.x),
                 mix(dot(h3(i+vec3(0,1,1)), f-vec3(0,1,1)), dot(h3(i+vec3(1,1,1)), f-vec3(1,1,1)), u.x), u.y), u.z);
}
const mat3 RO = mat3(0.00,0.80,0.60, -0.80,0.36,-0.48, -0.60,-0.48,0.64);
// gPix: sphere units per device pixel; gF: the frequency (per sphere unit) of the p passed in.
// Octaves finer than ~3 px fade out, so small renders don't alias into streaks.
float gPix, gF;
float lod(float f){ return smoothstep(.36, .18, f*gPix); }
float fbm(vec3 p, int n){ float s = 0., a = .5, f = gF; for(int i=0;i<8;i++){ if(i>=n) break; s += a*gn(p)*lod(f); p = RO*p*2.02; a *= .5; f *= 2.02; } return s; }
float ridged(vec3 p, int n){ float s = 0., a = .5, f = gF; for(int i=0;i<8;i++){ if(i>=n) break; s += a*mix(.4, 1.-abs(gn(p))*1.6, lod(f)); p = RO*p*2.03; a *= .5; f *= 2.03; } return s; }
float fbmF(vec3 p, int n, float f){ gF = f; return fbm(p, n); }
// convection cells: F1 and F2 of a moving 3D Voronoi
vec2 cells(vec3 p, float t){
  vec3 i = floor(p), f = p - i; float d1 = 9., d2 = 9.;
  for(int z=-1;z<=1;z++) for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){
    vec3 c = vec3(x,y,z), h = h3(i+c);
    vec3 r = c + .5 + .42*sin(t*.9 + 6.2831*h) - f; float d = dot(r,r);
    if(d < d1){ d2 = d1; d1 = d; } else if(d < d2) d2 = d;
  }
  return vec2(sqrt(d1), sqrt(d2));
}
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0,-s, 0,1,0, s,0,c); }
mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1,0,0, 0,c,s, 0,-s,c); }
mat3 rotZ(float a){ float c=cos(a), s=sin(a); return mat3(c,s,0, -s,c,0, 0,0,1); }
// view space -> the star's own turning frame (axis tilt, then spin)
mat3 gFrame;

// The tone layer: a slow cloud field on the sphere (turning with it) that splits the star into regions,
// each with its own pair of colours: cool regions (A) take the palette at a lower temperature, warm
// regions (B) at a higher one. So Proxima has wholly red areas and wholly yellow ones.
float toneMask(vec3 n){
  float te = uTime*uEvolve*.35;
  float f = fbmF(n*uToneScale + uSeed*3.3 + vec3(te, -te*.6, te*.4), 5, uToneScale);
  return smoothstep(-uToneSharp, uToneSharp, f*1.6);
}
void toneColours(vec3 n, out vec3 D, out vec3 B){
  if(uTone <= 0.){ D = uDeep; B = uBright; return; }
  float m = toneMask(n);
  D = mix(uDeep, mix(uDeepA, uDeepB, m), uTone);
  B = mix(uBright, mix(uBrightA, uBrightB, m), uTone);
}

// active regions: 0..1, clustered in belts either side of the equator (or anywhere)
float activity(vec3 p, float te){
  if(uActive <= 0.) return 0.;
  float band = uActiveLat > 0. ? exp(-pow((abs(p.y) - uActiveLat)/.13, 2.)) : .8;
  return smoothstep(.02, .3, fbmF(p*1.7 + uSeed*.7 + vec3(te*.15, 0., 0.), 4, 1.7) + .12*band - .1) * band * uActive;
}

// the photosphere at object-space point p: rgb, linear
vec3 surface(vec3 p, float mu){
  vec3 D, B; toneColours(p, D, B);
  float t = uTime, te = t*uEvolve, lat = p.y, S = uScale;
  vec3 q = p * S + uSeed;
  vec3 w = vec3(fbmF(q*.45 + vec3(te, 0., -te*.7), 4, S*.45), fbm(q*.45 + vec3(5.2, te*.8, 1.3), 4), fbm(q*.45 + vec3(-te*.6, 9.1, te), 4));
  vec3 qw = q + uWarp*1.8*w;
  float v = .5 + 1.1*fbmF(qw*1.3, 7, S*1.3);
  if(uRidge > 0.) v = mix(v, ridged(qw*1.1, 7)*1.1 - .1, uRidge*.65);
  float net = 0.;
  if(uCells > 0. || uNetwork > 0.){
    vec2 c = cells(qw*.9, te*6.);
    float cl = lod(S*.9*1.5);                            // cells under ~3 px fade to their mean
    float lane = smoothstep(.0, .25, c.y - c.x);
    float c2 = .12 + .88*lane*(1.2 - c.x*.7);
    v = mix(v, mix(.7, c2, cl) + .15*fbmF(qw*3.5, 4, S*3.5), uCells);
    // the magnetic network: bright, broken threads along a coarser cell pattern (supergranulation)
    vec2 c3 = cells(q*.32 + w*.8, te*2.);
    net = (1. - smoothstep(.0, .2, c3.y - c3.x)) * (.55 + .9*fbmF(qw*2.2, 3, S*2.2)) * lod(S*.32*2.5) * uNetwork;
  }
  float act = activity(p, te);
  v += uGrav * (abs(lat) - .45) * 1.1;                   // gravity darkening: hot poles
  bool ns = uKind == 3;   // the neutron star keeps the earlier two-stop ramp the author tuned it with
  v = ns ? clamp(v + act*.25, 0., 1.) : clamp(v*.85 - .04 + act*.2, 0., 1.);
  // the base is mostly the deep colour; the bright one is kept for granule cores, network and active regions
  // three stops, so the darks stay saturated (dark red, not brown): near-black deep, deep, bright
  vec3 col = ns ? mix(D*.75, B, smoothstep(.25, 1., v)) * mix(.4, .95, v)
    : v < .45 ? mix(D*.1, D, smoothstep(0., .45, v)) : mix(D, B, smoothstep(.45, 1., v));
  // network and active regions in the middle colour; only their peaks reach the bright one
  vec3 mid = mix(D, B, .55);
  float ap = max(fbmF(qw*1.6, 4, S*1.6) + .1, 0.);
  if(ns){
    col = mix(col, B*1.15, clamp(net*.8, 0., 1.));
    col += B * act*(.55 + 1.4*ap);
    col += mix(B, vec3(1.), .5) * max(v - .85, 0.)*1.6;
  } else {
    col = mix(col, mid*1.1, clamp(net*.65, 0., 1.));
    col += mix(mid, B, clamp(ap*2., 0., 1.)) * act*(.3 + 1.1*ap) * .75;
    col += mix(B, vec3(1.), .5) * max(v - .9, 0.)*1.5;   // hot cores run toward white
  }
  // spots: cooler and darker, inside the active regions
  if(uSpots > 0.){
    float s = fbmF(p*5. + uSeed*1.3 + vec3(0., te*.5, te*.3), 4, 5.) + .5;
    float region = uActive > 0. ? act / max(uActive, .01) : 1.;
    s *= mix(.7, 1.25, region);
    float th = mix(.95, .66, uSpots);
    float pen = smoothstep(th - .05, th, s), umb = smoothstep(th + .03, th + .08, s);
    col = mix(col, D*.3, pen*.8); col = mix(col, D*.04, umb);
  }
  if(uKind == 3){
    // the pulsar's two hot spots, both in the southern hemisphere (NICER, PSR J0030+0451), not opposite
    float h1 = exp(-(1. - dot(p, normalize(vec3(.35, -.55, .76))))*90.), h2 = exp(-(1. - dot(p, normalize(vec3(-.6, -.75, -.3))))*30.);
    col += vec3(.9, .95, 1.1) * (2.2*h1 + 1.4*h2);
  }
  // limb darkening; the limb is also redder (we see higher, cooler gas there)
  float I = 1. - uLimb*(1. - pow(max(mu, 0.), .6));
  col = mix(col, D*length(col)*1.2, (1.-mu)*uLimb*.5) * I;
  return col;
}

// The atmosphere: a glowing shell from the surface up to 1 + uAtm, marched along the line of sight.
// Its brightness is the length of glowing gas each ray crosses, so the rim brightens and the edge
// comes out ragged on its own. Its structure lives in the star's frame and turns with it:
// spicules (fine, radially stretched streaks) and prominences (tall loops, mostly over active regions).
vec3 atmosphere(vec2 d, float r){
  if(uAtm <= 0. || r > 1. + uAtm) return vec3(0.);
  float R2 = (1. + uAtm)*(1. + uAtm);
  float zo = sqrt(max(R2 - r*r, 0.)), zi = r < 1. ? sqrt(1. - r*r) : -zo;
  const int N = 14;
  float dz = (zo - zi) / float(N), te = uTime*uEvolve, H = uAtm;
  vec3 em = vec3(0.);
  for(int i = 0; i < N; i++){
    float z = zo - (float(i) + .5)*dz;
    vec3 P = vec3(d, z); float rad = length(P), h = (rad - 1.)/H;      // height, 0..1 of the shell
    if(h < 0.) continue;
    vec3 n = gFrame * (P / rad);
    float act = activity(n, te);
    // spicules: depend on direction, barely on height, so they come out as radial streaks
    float sp = fbmF(n*uScale*.9 + uSeed + vec3(0., h*.6, te*.4), 4, uScale*.9) + .5;
    float base = exp(-h*4.) * (.35 + uSpic*1.4*sp*sp);
    // prominences: thin loops reaching most of the way up
    float pr = ridged(n*3.2 + vec3(h*1.2, -te*.3, uSeed), 4);
    float prom = smoothstep(.62, .86, pr) * exp(-h*1.6) * (.25 + 1.6*act) * uProm;
    // a wind: streams leaving radially, slowly moving out
    float wd = 0.;
    if(uWind > 0.) wd = uWind * exp(-h*1.4) * smoothstep(-.1, .5, fbmF(n*5. + vec3(0., 0., -h*2. + uTime*.15) + uSeed, 4, 5.));
    // fade to nothing over the outer part of the shell, so the atmosphere has no edge of its own
    float fade = 1. - smoothstep(.4, 1., h); fade *= sqrt(fade);
    float dens = (base + prom*2.2 + wd*1.3) * fade;
    vec3 D, B; toneColours(n, D, B);
    em += uKind == 3 ? mix(D*1.4, B, clamp(.25 + .6*sp + prom, 0., 1.)) * dens
                     : mix(D*1.3, B, clamp(.08 + .45*sp*sp + prom*.8, 0., 1.)) * dens;
  }
  // per unit of length: a ray along the rim crosses far more gas than one straight down
  return em * dz / H * .75 * uAtmGlow;
}

bool normalAt(vec2 d, out vec3 n, out float mu){
  float r = length(d);
  if(uLens > 0.){
    if(r >= 1.) return false;
    // Beloborodov (2002): 1 - cos(psi) = (1 - cos(alpha)) / (1 - rs/R), sin(alpha) = r
    float ca = sqrt(1. - r*r), cp = max(1. - (1. - ca)/(1. - uLens), -1.), sp = sqrt(1. - cp*cp);
    vec2 dir = r > 1e-5 ? d / r : vec2(0.);
    n = vec3(dir*sp, cp); mu = ca; return true;
  }
  float zz = 1. - dot(d,d); if(zz <= 0.) return false;
  n = vec3(d, sqrt(zz)); mu = n.z; return true;
}

// The highlight: a few bright patches in the star's frame (so they turn with it), always there and
// breathing slowly, plus a flare that flashes up somewhere new every cycle (uFlare). Its own colour,
// laid over the picture with an overlay blend in main(), and spilling over the limb into the atmosphere.
float gHi;
float hiMask(vec3 n){
  float t = uTime, te = t*uEvolve;
  float steady = smoothstep(1. - uHiSize*.9, 1.12 - uHiSize*.6, fbmF(n*2.2 + uSeed*2.1 + vec3(te*.2, -te*.1, 0.), 4, 2.2) + .5 + .12);
  steady *= .65 + .35*sin(t*.31 + uSeed*3.);
  float cyc = t*.45 + uSeed;
  float fl = pow(max(0., sin(cyc)), 16.) * uFlare;
  float spot = smoothstep(.5, .78, fbmF(n*3. + vec3(floor(cyc/6.2831)*3.7), 4, 3.) + .5);
  return uHi * (steady + 2.2*fl*spot);
}

vec3 star(vec2 d){
  // flattening along the (screen-tilted) spin axis
  vec2 e = d; if(uOblate > 0.){ e = mat2(cos(uTilt), -sin(uTilt), sin(uTilt), cos(uTilt)) * e; e.y /= (1. - uOblate);
    e = mat2(cos(uTilt), sin(uTilt), -sin(uTilt), cos(uTilt)) * e; }
  vec3 n; float mu; vec3 col = vec3(0.);
  float r = length(e);
  gHi = 0.;
  if(normalAt(e, n, mu)){
    col = surface(gFrame * n, mu);
    col *= smoothstep(1., 1. - 1.5*gPix, r);            // one-pixel edge; the atmosphere covers it
    gHi = hiMask(gFrame * n);
  }
  if(uHi > 0. && r > .97){
    // over the limb: the patch at the nearest edge point lights the atmosphere above it
    vec2 dir = e / max(r, 1e-4);
    float above = hiMask(gFrame * vec3(dir, 0.)) * exp(-max(r - 1., 0.)/(.05 + uAtm*.8));
    gHi = mix(gHi, above, smoothstep(.97, 1.01, r));
  }
  col += atmosphere(e, r);
  // the halo: soft, from the top of the atmosphere outwards
  float x = max(r - 1. - uAtm*.4, 0.);
  float halo = (.22*exp(-x*7.) + .07*exp(-x*2.4)) * uGlow;
  if(r < 1.) halo *= smoothstep(.85, 1., r) * .5;
  col += uGlowC * halo;
  return col;
}

void main(){
  gPix = 2. / (uR * uSize);
  gFrame = rotY(uTime*uRot) * rotX(-.35*uTilt) * rotZ(uTilt) * rotY(uView.x) * rotX(uView.y);
  vec2 d = uv / uR;
  vec3 col;
  if(uKind == 3){
    // neutron star: grey, with a chromatic aberration splitting the channels at the edges
    float k = uAberr;
    col = vec3(star(d*(1.-k)).r, star(d).g, star(d*(1.+k)).b);
    float r = length(d);
    // pastel iridescence on the side, like the neutron's own picture
    vec2 dn = d / max(r, 1e-4);
    vec3 iri = .5 + .5*cos(6.2831*(r*1.6 + .12*dn.x + .07*dn.y - uTime*.03 + vec3(0., .33, .67)));
    col = mix(col, col*(.55 + .9*iri), smoothstep(.75, 1.05, r)*.4);
  } else col = star(d);
  // the highlight: a little of its light added (so it glows past the edge), then overlaid
  col += uHiC * gHi * .3;
  col = col / (1. + .22*col);                         // soft shoulder for the hot cores
  vec3 g = pow(max(col, 0.), vec3(1./2.2));
  vec3 L = mix(vec3(.5), pow(uHiC, vec3(1./2.2)), clamp(gHi, 0., 1.));
  vec3 ov = mix(2.*g*L, 1. - 2.*(1. - g)*(1. - L), step(.5, g));   // overlay blend
  ov = clamp(ov, 0., 1.);
  // on the chart, everything fades out before the frame's edge (no square around the halo)
  if(uAlpha == 1) ov *= 1. - smoothstep(.78, .99, length(uv));
  // premultiplied: over black it's the same picture; over the chart, the dark parts let it through
  o = uAlpha == 1 ? vec4(ov, max(ov.r, max(ov.g, ov.b))) : vec4(ov, 1.);
}`;

// turn a linear colour's hue by deg degrees (rotation about the grey axis, on gamma-encoded values)
export function hueTurn(c, deg) {
  if (!deg) return c;
  const e = c.map(v => Math.pow(Math.max(v, 0), 1 / 2.2)), a = deg * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a), k = 1 / 3, q = Math.sqrt(1 / 3);
  const m = [[cs + (1 - cs) * k, k * (1 - cs) - q * sn, k * (1 - cs) + q * sn],
             [k * (1 - cs) + q * sn, cs + k * (1 - cs), k * (1 - cs) - q * sn],
             [k * (1 - cs) - q * sn, k * (1 - cs) + q * sn, cs + k * (1 - cs)]];
  return m.map(r => Math.pow(Math.max(0, Math.min(1, r[0] * e[0] + r[1] * e[1] + r[2] * e[2])), 2.2));
}
export function colours(s) {
  if (s.kind === 3) { // grey, faintly blue-white (a million kelvin is past the blue end of the scale)
    const g = [.16, .165, .18], w = [.95, .95, .98];
    return { deep: g, bright: w, glow: [.7, .76, .9], hi: [.85, .55, 1.0], sw: [g, w], deepA: g, brightA: w, deepB: g, brightB: w };
  }
  // Vega's hot poles and cool equator: the deep colour from the equator, the bright from the poles
  const p = palette(s.T), deep = s.Tequator ? palette(s.Tequator).deep : p.deep, bright = s.Tpole ? palette(s.Tpole).bright : p.bright;
  // the highlight's colour: the palette further along, hotter, a touch more saturated
  const h = palette(s.T * s.hiT), hi = boost(h.bright.map((v, i) => .55 * v + .45 * h.deep[i]), 1.3);
  // the tone layer's two regions: cooler and hotter along the palette, the warm one's hue turned by toneHue
  const A = palette(s.T / s.toneSpread), Bp = palette(s.T * s.toneSpread);
  const B = { deep: hueTurn(Bp.deep, s.toneHue), bright: hueTurn(Bp.bright, s.toneHue) };
  return { deep, bright, glow: deep.map((v, i) => .45 * v + .55 * bright[i]), hi, sw: [deep, bright, hi],
    deepA: A.deep, brightA: A.bright, deepB: B.deep, brightB: B.bright };
}

// One WebGL canvas that draws any star: render(star, t, size, { target, view, alpha }) leaves the frame
// in the bottom-left size×size corner of .canvas (and copies it to target, a 2D canvas, if given).
export function createStarForge() {
  const glc = document.createElement("canvas");
  const gl = glc.getContext("webgl2", { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: true, alpha: true });
  if (!gl) throw new Error("WebGL 2 unavailable");
  const U = {};
  const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o);
    if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const u = gl.getActiveUniform(prog, i); U[u.name] = gl.getUniformLocation(prog, u.name); }
  function render(s, t, size, { target = null, view = [0, 0], alpha = false, seed = 0 } = {}) {
    if (glc.width < size || glc.height < size) { glc.width = Math.max(glc.width, size); glc.height = Math.max(glc.height, size); }
    gl.viewport(0, 0, size, size);
    const c = s._c || (s._c = colours(s));
    const f1 = (nm, v) => U[nm] && gl.uniform1f(U[nm], v);
    f1("uTime", t + s.seed); f1("uSize", size); f1("uR", discFraction(s));
    for (const k of UNIFORM_KEYS) f1("u" + k[0].toUpperCase() + k.slice(1), s[k]);
    if (seed) { f1("uSeed", s.seed + seed); f1("uTime", t + s.seed + seed * 7); }   // another star of the same kind
    gl.uniform1i(U.uKind, s.kind); gl.uniform1i(U.uAlpha, alpha ? 1 : 0); gl.uniform2f(U.uView, view[0], view[1]);
    gl.uniform3fv(U.uDeep, c.deep); gl.uniform3fv(U.uBright, c.bright); gl.uniform3fv(U.uGlowC, c.glow); gl.uniform3fv(U.uHiC, c.hi);
    for (const k of ["deepA", "brightA", "deepB", "brightB"]) gl.uniform3fv(U["u" + k[0].toUpperCase() + k.slice(1)], c[k]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (target) {
      const ctx = target.getContext("2d");
      if (target.width !== size) { target.width = size; target.height = size; }
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(glc, 0, glc.height - size, size, size, 0, 0, size, size);
    }
  }
  return { canvas: glc, render };
}
// the disc's radius as a fraction of half the frame: the rest is room for the atmosphere and halo
export const discFraction = s => s.kind === 3 ? .66 : .64;
export const starBySlug = slug => STARS.find(s => s.slug === slug);
