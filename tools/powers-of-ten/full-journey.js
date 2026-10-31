import {atmosphereLayer} from "./atmosphere.js";
import {distanceLabel,readableNumber} from "./distance-labels.js";
import { drawScaleOverlay } from './scale-overlay.js';
import { canopyCrownDepth } from './canopy-crown-depth.js';
import { canopyMicro } from './canopy-micro.js';
import { canopyDepth } from './canopy-depth.js';
import { canopyOptics } from './canopy-optics.js';
import { catalogueInsects } from './canopy-insects.js';
// tools/powers-of-ten/main.js — the zoom: one number, s = log10(frame width in
// metres, across the stage's shorter side), and every layer drawn from it.
// The centre never moves: a hydrogen atom in a DNA base pair, in an amoeba, in a
// drop of dew on a ladybug on the General Sherman tree. At the top the spectrum
// page's Cloud (public/spectrum, ?bare=1) takes over for the microwave sky.
//   ?s=  ?grid=0  ?labels=0  ?ui=0  ?stage=9x16|16x9|1x1  ?plates=1 (use video/powers-of-ten/plates/)  ?photos=0 (leave out the real photos, tree to globe)  ?crossings=0  ?roll=0
import { ramp, clamp, LY, AU, cameraAt, perspAt } from "./math.js";
import { smallLayers } from "./small.js";
import { microLayers } from "./micro.js";
import { macroLayers } from "./macro.js";
import { spaceLayers } from "./space.js";
import { platesLayer } from "./plates.js";
import { crossingsLayer } from "./crossings.js";

const canopyTest = new URLSearchParams(location.search).has('canopytest');
const insects=canopyTest?catalogueInsects():null,optics=canopyTest?canopyOptics():null,depth=canopyTest?canopyDepth():null,crown=canopyTest?canopyCrownDepth():null,microscope=canopyTest?canopyMicro():null;
const S_MIN = canopyTest ? -18.7 : -35.3, S_MAX = Math.log10(2 * 46e9 * LY / .78);
window.canopyTest = {enabled:true,minimum:-18.7,photoMinimum:-8.260667536990012,maximum:S_MAX};
const q = new URLSearchParams(location.search);
const state = {
  s: q.has("s") ? clamp(+q.get("s"),S_MIN,S_MAX) : 0,
  grid: q.get("grid") !== "0", labels: q.get("labels") !== "0",
  play: 0, speed: 1, stage: q.get("stage") ?? "fill",
};
if (q.get("ui") === "0") document.body.classList.add("bare");

const stage = document.getElementById("stage"), canvas = document.getElementById("view"), ctx = canvas.getContext("2d");
const frame = document.getElementById("cloud");

const atmosphere=atmosphereLayer();
const small = await smallLayers();
const micro = microLayers();
const macro = macroLayers();
const space = spaceLayers(macro.globe);
const rawPlates = await platesLayer(canopyTest || q.get('plates') === '1', canopyTest ? '/video/powers-of-ten/generated/canopy-test/plates/' : '/video/powers-of-ten/plates/', 0.4, {square:canopyTest,floor:canopyTest?-9.25:undefined});
const plates={covers:s=>(!canopyTest||window.canopyTest.enabled)?rawPlates.covers(s):new Set(),draw:cam=>{if(!canopyTest||window.canopyTest.enabled)rawPlates.draw(cam)}};
// the real photographs from the tree's crown to the globe, on unless ?photos=0; they
// give way to the turning 3D globe (the same map, macro.js) as the camera starts to
// swing round the Earth, once the satellite clouds are in view (10^6.4 m)
const PHOTOS_OUT = [6.45, 6.9];
const photos = await platesLayer(q.get("photos") !== "0", "/video/powers-of-ten/photos/", 0.3, { fadeOutAt: PHOTOS_OUT, extendLow:canopyTest });
// and the clouds of the day the globe shows (15 June 2024), a layer of their own 8 km
// up: behind the camera at first, then passed through (with the wisps, crossings.js)
// near 10^3.9 m, then settling onto the ground as we climb on; gone as the globe,
// with its own clouds, takes over
const CLOUD_HEIGHT = 8000;
const clouds = await platesLayer(q.get("photos") !== "0", "/video/powers-of-ten/photos/clouds/", 0.3, { hides: false, single: true, height: CLOUD_HEIGHT, fadeOutAt: PHOTOS_OUT });
// biggest first, so smaller things paint over what holds them; what we cross, nearest the camera, last
const layers = [...space, ...macro.layers, ...micro, ...small.reverse(), crossingsLayer(q.get("crossings") !== "0")];
// the whole picture rolls round the line of sight at the same rate at every scale,
// a little over one turn from the Planck length to the CMB: we fall down a spiral
// (?roll=0: none, for exporting frames north up)
const ROLL = q.get("roll") === "0" ? 0 : 5 * Math.PI / 180; // per decade, anticlockwise as we zoom out

// ---------- the spectrum Cloud, for the last decades ----------
// on its linear radius scale (the CMB at radius1),
// the whole spectrum bar in its light, the CMB's light alone (the distance window
// from 20 Gly: the zoom has already shown the Galaxy and the galaxies), each dot
// with a glow: the camera flies backwards and turns, so the CMB comes past it from
// behind, and settles on the author's view (2026-10-29)
const CLOUD_END = { unit: -10, c: 11.3, s: 11.3, yaw: 0.402, pitch: 0.389, dlo: 10.3, dhi: 11, glow: 1, centre: false };
// the camera sits 3.2 / zoom from the centre; it starts just inside the Milky Way's
// shell (radius ~0.7 on this scale) and ends where the CMB's sphere spans 78% of the
// frame's shorter side, as in the author's view; the Cloud's field of view is 40° tall
const CLOUD_FLY = [25.9, S_MAX], DIST0 = 0.68, FILL = 0.78;
// the Cloud's frame is a square as wide as the stage's diagonal, so it can roll with
// the picture without showing its corners
let frameSize = "";
function driveCloud(s, W, H, Dg, roll, dpr) {
  const a = ramp(s, 25.9, 26.6);
  frame.style.opacity = a;
  frame.style.visibility = a > 0 ? "visible" : "hidden";
  const size = `${Dg / dpr}px/${(W - Dg) / 2 / dpr}px/${(H - Dg) / 2 / dpr}px`;
  if (size !== frameSize) {
    frameSize = size;
    Object.assign(frame.style, { inset: "auto", width: `${Dg / dpr}px`, height: `${Dg / dpr}px`, left: `${(W - Dg) / 2 / dpr}px`, top: `${(H - Dg) / 2 / dpr}px` });
  }
  frame.style.transform = `rotate(${roll}rad)`;
  const ctl = frame.contentWindow?.spectrumControl;
  if (!a || !ctl) return;
  const dEnd = 1 / Math.sin(Math.atan(FILL * (Math.min(W, H) / Dg) * Math.tan(20 * Math.PI / 180)));
  const t = ramp(s, ...CLOUD_FLY), dist = Math.exp(Math.log(DIST0) + (Math.log(dEnd) - Math.log(DIST0)) * t);
  // turning a little as it goes (35°), for the depth, and still at the end
  ctl({ galaxy: true, lz:Math.log10(46e9), ...CLOUD_END, zoom: 3.2 / dist, yaw: CLOUD_END.yaw + 0.6 * (1 - t) });
  cloudView = { dist, Dg, a };
}
// Radius comparisons use a linear ruler: Hubble14.4Gly / CMB46Gly.
// The outer shell is the CMB sphere; both labels explicitly say radius.
let cloudView = null;
const HUBBLE_TO_CMB = 14.4 / 46;
function drawSpheres(ctx, W, H, dpr, s) {
  if (!cloudView) return;
  const { dist, Dg, a: ca } = cloudView, a = ca * ramp(s, 26.8, 27.2);
  if (a <= 0.01) return;
  const px = (r) => (dist > r ? Math.tan(Math.asin(r / dist)) / Math.tan(20 * Math.PI / 180) * Dg / 2 : 0);
  const rc = px(1), rh = rc * HUBBLE_TO_CMB;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = `${13 * dpr}px "IBM Plex Sans", system-ui, sans-serif`; ctx.textAlign = "center";
  ctx.lineWidth = 3 * dpr; ctx.strokeStyle = "rgba(0,0,0,0.7)";
  if (rh) {
    ctx.setLineDash([6 * dpr, 6 * dpr]); ctx.lineWidth = 1.2 * dpr; ctx.strokeStyle = "rgba(170,205,255,0.75)";
    ctx.beginPath(); ctx.arc(W / 2, H / 2, rh, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.textBaseline = "top"; ctx.lineWidth = 3 * dpr; ctx.strokeStyle = "rgba(0,0,0,0.7)";
    ctx.strokeText("Hubble sphere · radius 14.4 billion light-years", W / 2, H / 2 - rh + 8 * dpr);
    ctx.fillStyle = "rgba(200,222,255,0.95)"; ctx.fillText("Hubble sphere · radius 14.4 billion light-years", W / 2, H / 2 - rh + 8 * dpr);
  }
  if (rc) {
    ctx.textBaseline = "top";
    ctx.strokeText("CMB · radius 46 billion light-years", W / 2, H / 2 + rc + 8 * dpr);
    ctx.fillStyle = "#f2d6b0"; ctx.fillText("CMB · radius 46 billion light-years", W / 2, H / 2 + rc + 8 * dpr);
  }
  ctx.restore();
}

// ---------- drawing ----------
const labels = [];
function render(t) {
  const dpr = Math.min(2, devicePixelRatio || 1);
  const box = stage.getBoundingClientRect();
  const W = Math.round(box.width * dpr), H = Math.round(box.height * dpr);
  if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
  // the layers draw on a square as wide as the diagonal (so the roll never shows its
  // corners), centred on the stage and turned with it
  const s = state.s, Dg = Math.ceil(Math.hypot(W, H)), roll = -ROLL * s, rc = Math.cos(roll), rs = Math.sin(roll);
  const F = 10 ** s, min = Math.min(W, H), k = min / F, cx = Dg / 2, cy = Dg / 2;
  const basis = cameraAt(s), pw = perspAt(s), Dc = pw > 1e-4 ? F / (2 * Math.tan(25 * Math.PI / 180)) / pw : Infinity;
  const projS = (p) => {
    const z = p[0] * basis.n[0] + p[1] * basis.n[1] + p[2] * basis.n[2], den = Dc - z;
    if (den < 0.01 * Dc) return [NaN, NaN, 0];
    const sc = Dc === Infinity ? 1 : Dc / den;
    return [cx + k * sc * (p[0] * basis.r[0] + p[1] * basis.r[1] + p[2] * basis.r[2]), cy - k * sc * (p[0] * basis.u[0] + p[1] * basis.u[1] + p[2] * basis.u[2]), sc];
  };
  labels.length = 0;
  const cam = {
    ctx, W: Dg, H: Dg, min, dpr, s, F, k, cx, cy, t, cam: basis,
    // the stage itself, unturned: for what stays upright (the grid, the Planck cells)
    screen: { W, H, cx: W / 2, cy: H / 2 },
    P: ([x, y]) => [cx + x * k, cy + y * k],
    // a point's place on the frame (NaN behind the camera) and, with projS, how much
    // nearer than the centre it is: in perspective the camera stands Dc from the centre,
    // where the frame is F wide across 50°; flat (orthographic) when Dc is infinite
    Dc, proj: (p) => { const q = projS(p); return [q[0], q[1]]; }, projS,
    label: (x, y, text, a) => labels.push([cx + x * k, cy + y * k, text, a]),
    labelPx: (x, y, text, a) => labels.push([x, y, text, a]),
  };
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  driveCloud(s, W, H, Dg, roll, dpr);
  ctx.fillStyle = `rgba(0,0,0,${1 - ramp(s, 25.9, 26.6)})`;
  ctx.fillRect(0, 0, W, H);
  ctx.setTransform(rc, rs, -rs, rc, W / 2 - rc * cx + rs * cy, H / 2 - rs * cx - rc * cy);
  const hide = new Set([...plates.covers(s), ...photos.covers(s)]);
  for (const L of layers) {
    if (s >= L.range[0] && s <= L.range[1] && !hide.has(L.name)) {
      ctx.save();
      try { L.draw(cam); } catch (e) { console.error(L.name, e); }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    // the photographs and the image pass sit between the globe and the small world (in
    // or out of the globe's own range)
    if (L.name === "earth") {
      // Optical registration belongs only to the photographic pass. Never move
      // the shared camera used by atomic or astronomical geometry.
      const picture={...cam};
      if(canopyTest){const t=Math.max(0,Math.min(1,(-cam.s-.7)/1.05)),f=t*t*(3-2*t);picture.cx-=(-0.0024822744142255736)*cam.k*f;picture.cy-=(-0.0009580708265432034)*cam.k*f;}
      photos.draw(canopyTest ? {...picture,cx:picture.cx-8.242062515365374*cam.k,cy:picture.cy-3.8877653374364973*cam.k} : cam);
      clouds.draw(cam);
      if(canopyTest)insects.draw(picture);
      plates.draw(picture);
      if(canopyTest){crown.draw(picture);depth.draw(picture);microscope.draw(picture);atmosphere.draw(picture);optics.plane(picture);optics.bird(picture);}
    }
  }
  // the grid and the names stay upright: the grid on the screen, the names where the
  // turned picture puts them
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawScaleOverlay({ ...cam, W, H, cx: W / 2, cy: H / 2 }, {grid:state.grid,labels:state.labels,canopy:canopyTest});
  if (state.labels) for (const [lx, ly, text, a] of labels) {
    if (a <= 0.02) continue;
    const x = W / 2 + rc * (lx - cx) - rs * (ly - cy), y = H / 2 + rs * (lx - cx) + rc * (ly - cy);
    ctx.globalAlpha = Math.min(1, a);
    ctx.font = `${13 * dpr}px "IBM Plex Sans", system-ui, sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    ctx.lineWidth = 3 * dpr; ctx.strokeStyle = "rgba(0,0,0,0.7)"; ctx.strokeText(text, x, y);
    ctx.fillStyle = "#f2f0ea"; ctx.fillText(text, x, y);
  }
  ctx.globalAlpha = 1;
  if (state.labels) drawSpheres(ctx, W, H, dpr, s);
  readout(s);
}

const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
const sup = (n) => String(n).split("").map((c) => SUP[c]).join("");
const UNITS = [[1e-21, "zm"], [1e-18, "am"], [1e-15, "fm"], [1e-12, "pm"], [1e-9, "nm"], [1e-6, "µm"], [1e-3, "mm"], [1e-2, "cm"], [1, "m"], [1e3, "km"], [1e6, "thousand km"], [1e9, "million km"], [AU * 100, "AU", AU], [LY, "light-years"], [LY * 1e3, "thousand light-years"], [LY * 1e6, "million light-years"], [LY * 1e9, "billion light-years"]];
const counter = document.getElementById("counter"), plain = document.getElementById("plain"), slider = document.getElementById("s");
function readout(s) {
  const e = Math.floor(s + 1e-9), m = 10 ** (s - e);
  counter.textContent = `${m.toFixed(1)} × 10${sup(e)} m`;
  const v = 10 ** s;
  let u = UNITS[0];
  for (const x of UNITS) if (v >= x[0]) u = x;
  const per = u[2] ?? u[0];
  plain.textContent = v < 1e-30 ? `${(v / 1.616e-35).toPrecision(2)} Planck lengths` : v>=LY ? `${readableNumber(v/LY)} light-years` : distanceLabel(v);
  if (document.activeElement !== slider) slider.value = s;
}

// ---------- controls ----------
let last = performance.now(), t = 0, urlT = 0;
function tick(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now; t += dt;
  if (state.play) { state.s = clamp(state.s + state.play * state.speed * dt, S_MIN, S_MAX); if (state.s <= S_MIN || state.s >= S_MAX) setPlay(0); }
  render(t);
  if (now - urlT > 400) { urlT = now; const u = new URL(location); u.searchParams.set("s", state.s.toFixed(2)); history.replaceState(null, "", u); }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

const setS = (s) => { state.s = clamp(s, S_MIN, S_MAX); };
function setPlay(dir) {
  state.play = dir;
  document.querySelectorAll("[data-play]").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.play === dir && dir !== 0));
}
slider.min = S_MIN; slider.max = S_MAX;
slider.addEventListener("input", () => { setPlay(0); setS(+slider.value); });
document.querySelectorAll("[data-play]").forEach((b) => b.addEventListener("click", () => setPlay(+b.dataset.play)));
document.getElementById("speed").addEventListener("change", (e) => (state.speed = +e.target.value));
const toggle = (id, key) => { const el = document.getElementById(id); el.checked = state[key]; el.addEventListener("change", () => { state[key] = el.checked; const u = new URL(location); u.searchParams.set(key, el.checked ? "1" : "0"); history.replaceState(null, "", u); }); };
toggle("gridOn", "grid"); toggle("labelsOn", "labels");
stage.addEventListener("wheel", (e) => { e.preventDefault(); setPlay(0); setS(state.s + e.deltaY * (e.ctrlKey ? 0.01 : 0.002)); }, { passive: false });
addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" && e.target.type !== "range") return;
  if (e.key === "ArrowRight" || e.key === "ArrowUp") { setPlay(0); setS(state.s + (e.shiftKey ? 0.5 : 0.05)); e.preventDefault(); }
  if (e.key === "ArrowLeft" || e.key === "ArrowDown") { setPlay(0); setS(state.s - (e.shiftKey ? 0.5 : 0.05)); e.preventDefault(); }
  if (e.key === " ") { setPlay(state.play ? 0 : 1); e.preventDefault(); }
});
// pinch on touch screens
let pinch = null;
stage.addEventListener("touchstart", (e) => { if (e.touches.length === 2) pinch = { d: dist2(e), s: state.s }; }, { passive: true });
stage.addEventListener("touchmove", (e) => { if (pinch && e.touches.length === 2) { e.preventDefault(); setS(pinch.s - Math.log10(dist2(e) / pinch.d)); } }, { passive: false });
stage.addEventListener("touchend", () => (pinch = null));
const dist2 = (e) => Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);

const stageSel = document.getElementById("stageSel");
stageSel.value = state.stage;
const applyStage = () => { document.body.dataset.stage = stageSel.value; };
stageSel.addEventListener("change", applyStage); applyStage();

// for scripts/powers-of-ten-export.mjs and the narration: jump, then wait for a few frames
window.zoom = {
  set: (s) => { setPlay(0); setS(s); },
  frames: (n = 3) => new Promise((ok) => { const f = () => (--n <= 0 ? ok() : requestAnimationFrame(f)); requestAnimationFrame(f); }),
  get s() { return state.s; },
};

if(canopyTest) (await import('./canopy-test.js')).mountCanopyTest();
