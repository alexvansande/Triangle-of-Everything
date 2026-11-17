// The opening of long video 2's new script (the author, 2026-11-17, "Long 2: Space Triangle — script"): a catalogue of
// everything. The chart's own pictures float in a cloud in 3D on black, the camera drifting among them; as the narration
// names a thing the camera darts to it; glowing lines join the ones of a kind; each gets a label (name in its chart
// colour, its kind, mass, size, density, tags); then they're sorted: floats / sinks, round / not round, alive / not
// alive (the in-betweens in the middle), lighter to heavier and smaller to bigger (a rough bar chart per kind, with
// vertical bands like the chart's grid), and last laid out by size and mass on a log grid, where the chart takes over.
// Everything is a function of the take's clock and the phase times, so a render worker can start anywhere.
//   { catalogue: { phase } }   phases (each cue's own, its time from the cues): start, a slug (the camera darts to it),
//   links, labels, light, float, round, alive, heavy, big, chart, grid
import { iconUrls } from "./assets.js";
import { friendlyMass, friendlyRadius, friendlyWavelength } from "./format.js";

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, f) => a + (b - a) * f;
const rng = (seed) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// the chart's category colours (src/data.js, CAT)
const COL = { particle: "#00e5ff", composite: "#ff9800", atomic: "#64ffda", micro: "#76ff03", macro: "#69f0ae", planet: "#448aff",
  star: "#ffd740", remnant: "#e0e0e0", blackhole: "#ff1744", galaxy: "#d500f9", largescale: "#f48fb1" };
const KIND = { particle: "particle", composite: "particle", atomic: "atom · molecule", micro: "microscopic", macro: "everyday", planet: "planetary",
  star: "star", remnant: "dead star", blackhole: "black hole", galaxy: "galaxy", largescale: "large scale" };

// [slug, name, cat, logR (cm, the ball of its mass and bulk density), logM (g), rho (g/cm³, null: none to speak of),
//  round (1 yes, 0.5 in between, 0 no), alive (1, 0.5 in between, 0), light (true: no mass, placed by its wavelength)]
// The values are the chart's (src/objects.json and the catalogue), rounded.
const OBJ = [
  ["sun", "Sun", "star", 10.84, 33.3, 1.41, 1, 0],
  ["earth", "Earth", "planet", 8.8, 27.78, 5.51, 1, 0],
  ["jupiter", "Jupiter", "planet", 9.84, 30.28, 1.33, 1, 0],
  ["saturn", "Saturn", "planet", 9.77, 29.75, 0.69, 1, 0],
  ["moon", "Moon", "planet", 8.24, 25.87, 3.34, 1, 0],
  ["mars", "Mars", "planet", 8.53, 26.81, 3.93, 1, 0],
  ["pluto", "Pluto", "planet", 8.08, 25.11, 1.85, 1, 0],
  ["vesta", "Vesta", "planet", 7.42, 23.41, 3.46, 0.5, 0],
  ["bennu", "Bennu", "planet", 4.39, 13.87, 1.19, 0.5, 0],
  ["halleys-comet", "Halley's Comet", "planet", 5.74, 17.34, 0.6, 0, 0],
  ["milky-way", "Milky Way", "galaxy", 22.7, 44.93, 1e-23, 0.5, 0],
  ["andromeda-m31", "Andromeda", "galaxy", 22.85, 45.4, 1e-23, 0.5, 0],
  ["whirlpool", "Whirlpool Galaxy", "galaxy", 22.4, 44.5, 1e-23, 0.5, 0],
  ["betelgeuse", "Betelgeuse", "star", 13.94, 34.34, 1e-8, 1, 0],
  ["sirius-a", "Sirius A", "star", 11.07, 33.61, 0.42, 1, 0],
  ["white-dwarf", "White dwarf", "remnant", 8.85, 33.15, 1e6, 1, 0],
  ["neutron-star", "Neutron star", "remnant", 6.08, 33.45, 4e14, 1, 0],
  ["m87", "M87*", "blackhole", 15.28, 43.11, 2e-4, 1, 0],
  ["human", "Human", "macro", 1.93, 4.9, 0.985, 0, 1],
  ["blue-whale", "Blue whale", "macro", 3.13, 8.18, 1.01, 0, 1],
  ["elephant", "Elephant", "macro", 2.2, 6.7, 0.97, 0, 1],
  ["cow", "Cow", "macro", 2.08, 5.78, 1.0, 0, 1],
  ["sequoia", "Sequoia", "macro", 3.62, 9.15, 0.6, 0, 1],
  ["ant", "Ant", "macro", -0.7, -3, 1.05, 0, 1],
  ["ladybug", "Ladybug", "macro", -0.46, -1.7, 0.9, 0.5, 1],
  ["big-rock-okotoks", "Okotoks Erratic", "macro", 3.11, 10.2, 2.7, 0, 0],
  ["mt-everest", "Mount Everest", "macro", 5.35, 17.2, 2.7, 0, 0],
  ["benz-patent-motorwagen", "Benz Motorwagen", "macro", 1.73, 5.42, 0.4, 0, 0],
  ["titanic", "Titanic", "macro", 3.3, 10.72, 0.3, 0, 0],
  ["eiffel-tower", "Eiffel Tower", "macro", 3.8, 9.86, 0.03, 0, 0],
  ["soccer-ball", "Soccer ball", "macro", 1.04, 2.63, 0.08, 1, 0],
  ["bacteria", "Bacterium", "micro", -4.3, -12, 1.1, 0.5, 1],
  ["amoeba", "Amoeba", "micro", -1.65, -5.3, 1.03, 0, 1],
  ["tardigrade", "Tardigrade", "micro", -1.6, -5.82, 1.05, 0, 1],
  ["red-blood-cell", "Red blood cell", "micro", -3.43, -10, 1.1, 0.5, 1],
  ["covid", "Virus", "micro", -5.4, -15.3, 1.18, 1, 0.5],
  ["dna", "DNA", "atomic", -6.77, -19.95, 1.7, 0, 0],
  ["water-h2o", "Water molecule", "atomic", -7.85, -22.52, 1.0, 0.5, 0],
  ["hydrogen", "Hydrogen atom", "atomic", -8.28, -23.78, null, 1, 0],
  ["gold", "Gold atom", "atomic", -7.89, -21.49, null, 1, 0],
  ["proton", "Proton", "composite", -13.06, -23.78, null, 1, 0],
  ["neutron", "Neutron", "composite", -13.06, -23.77, null, 1, 0],
  ["electron", "Electron", "particle", -10.41, -27.04, null, 1, 0],
  ["visible-light", "Visible light", "particle", -5.05, -32.4, null, null, 0, true],
  ["am-radio", "AM radio", "particle", 3.69, -41.14, null, null, 0, true],
  ["microwave", "Microwave", "particle", -0.79, -36.66, null, null, 0, true],
  ["x-ray", "X-ray", "particle", -8.79, -28.66, null, null, 0, true],
].map(([slug, name, cat, logR, logM, rho, round, alive, light]) => ({ slug, name, cat, logR, logM, rho, round, alive, light: !!light }));
export const CATALOGUE_SLUGS = OBJ.map(o => o.slug);
// what each part of the narration names (the camera darts to it): "every star, every planet, galaxy, animal, rock, car, microbe or atom"
const CAT_ORDER = ["particle", "composite", "atomic", "micro", "macro", "planet", "star", "remnant", "blackhole", "galaxy"];

const pics = new Map();
const pic = (slug) => {
  if (!pics.has(slug)) {
    const im = new Image(), url = iconUrls[`../content/icons/${slug}.webp`];
    if (url) { im.src = url; im.decode?.().catch(() => {}); }
    im.__ok = !!url; pics.set(slug, im);
  }
  return pics.get(slug);
};
export const cataloguePending = () => CATALOGUE_SLUGS.map(pic).filter(im => im.__ok && !(im.complete && im.naturalWidth)).length;

const text = (ctx, s, x, y, size, color, align = "center", weight = 700) => {
  ctx.font = `${weight} ${size}px "Barlow Condensed", "Arial Narrow", sans-serif`;
  ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillStyle = color;
  try { ctx.letterSpacing = `${size * 0.06}px`; } catch {}
  ctx.lineWidth = size * 0.18; ctx.strokeStyle = "rgba(0,0,0,0.85)"; ctx.lineJoin = "round";
  String(s).split("\n").forEach((l, i) => { ctx.strokeText(l, x, y + i * size * 1.15); ctx.fillText(l, x, y + i * size * 1.15); });
};
const arrowHead = (ctx, x0, y0, x1, y1, color, w) => {
  const a = Math.atan2(y1 - y0, x1 - x0), h = w * 4.5;
  ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - h * 0.6 * Math.cos(a), y1 - h * 0.6 * Math.sin(a)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - h * Math.cos(a - 0.45), y1 - h * Math.sin(a - 0.45)); ctx.lineTo(x1 - h * Math.cos(a + 0.45), y1 - h * Math.sin(a + 0.45)); ctx.fill();
};

// ---------- the cloud: each object's place in 3D (a seeded scatter, the kinds loosely together) ----------
let _cloud = null;
const cloud = () => _cloud || (_cloud = (() => {
  const r = rng(17), out = OBJ.map((o, i) => {
    // a loose shell round the camera's path, the kinds in neighbourhoods (so a kind's lines stay short)
    const k = CAT_ORDER.indexOf(o.cat), a = (k / CAT_ORDER.length) * 6.283 + (r() - 0.5) * 0.9, rad = 1.2 + r() * 2.6;
    return { ...o, i, key: o.slug, x: Math.cos(a) * rad, y: (r() - 0.5) * 2.6, z: Math.sin(a) * rad, s: 0.8 + r() * 0.5 };
  });
  // the cloud is fuller than the catalogue (the author: "a lot of icons floating"): two more of each, further out,
  // which fade away when the sorting starts
  for (let n = 1; n <= 2; n++) OBJ.forEach((o, i) => {
    if (o.light) return;
    const a = r() * 6.283, rad = 2.2 + r() * 3.2;
    out.push({ ...o, i: i + n * 100, key: `${o.slug}#${n}`, extra: true, x: Math.cos(a) * rad, y: (r() - 0.5) * 3.4, z: Math.sin(a) * rad, s: 0.6 + r() * 0.5 });
  });
  return out;
})());

// the camera on the cloud: a slow orbit, or darting to the object a phase names (it stops in front of it)
function camAt(o, t) {
  const orbit = (tt) => { const a = tt * 0.05; return { x: Math.sin(a) * 2.4, y: Math.sin(tt * 0.07) * 0.4, z: -Math.cos(a) * 2.4, tx: Math.sin(a + 1.9) * 2.2, ty: 0, tz: -Math.cos(a + 1.9) * 2.2 }; };
  const foci = o.foci || [];
  let cam = orbit(t);
  for (const [tf, slug, tEnd] of foci) {
    if (t < tf) break;
    const p = cloud().find(q => q.key === slug); if (!p) continue;
    const base = orbit(tf), dx = base.x - p.x, dz = base.z - p.z, d = Math.hypot(dx, dz) || 1;
    const near = { x: p.x + dx / d * 1.0, y: p.y + 0.05, z: p.z + dz / d * 1.0, tx: p.x, ty: p.y, tz: p.z };
    const fin = smooth((t - tf) / 0.7), fout = tEnd != null ? smooth((t - tEnd) / 1.6) : 0;
    const back = orbit(t);
    const mix = fin * (1 - fout);
    cam = { x: lerp(back.x, near.x, mix), y: lerp(back.y, near.y, mix), z: lerp(back.z, near.z, mix), tx: lerp(back.tx, near.tx, mix), ty: lerp(back.ty, near.ty, mix), tz: lerp(back.tz, near.tz, mix) };
  }
  return cam;
}
function project(cam, p, W, H) {
  // the camera looks from (x, y, z) to (tx, ty, tz), y up
  let fx = cam.tx - cam.x, fy = cam.ty - cam.y, fz = cam.tz - cam.z; const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
  let rx = -fz, rz = fx; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;   // right = forward × world up
  const ux = -rz * fy, uy = rz * fx - rx * fz, uz = rx * fy;                       // up = right × forward
  const dx = p.x - cam.x, dy = p.y - cam.y, dz = p.z - cam.z;
  const zc = dx * fx + dy * fy + dz * fz, xc = -(dx * rx + dz * rz), yc = dx * ux + dy * uy + dz * uz;
  const F = Math.min(W, H) * 1.05;
  return { X: W / 2 + (xc / zc) * F, Y: H * 0.46 - (yc / zc) * F, z: zc };
}

// ---------- the sorted layouts (2D, screen fractions) ----------
function groups(W, H, list, keyOf, heads) {
  // columns, each its own block of pictures fitted to the room under its heading
  const out = new Map(), n = heads.length, colW = W * 0.86 / n, top = H * 0.25, room = H * 0.62;
  heads.forEach(([key], gi) => {
    const items = list.filter(o => keyOf(o) === key), k = items.length; if (!k) return;
    let best = 0, cols = 1;
    for (let c = 1; c <= k; c++) { const cell = Math.min(colW / c, room / Math.ceil(k / c)); if (cell > best) { best = cell; cols = c; } }
    const cell = Math.min(best, H * 0.11), x0 = W * 0.07 + colW * gi + (colW - cell * cols) / 2 + cell / 2;
    items.forEach((o, j) => out.set(o.slug, { X: x0 + (j % cols) * cell, Y: top + cell / 2 + Math.floor(j / cols) * cell, d: cell * 0.82 }));
  });
  return out;
}
function bars(W, H, list, val, lo, hi, bins) {
  // a rough bar chart: binned along x, stacked up from the base by kind (the author: "not exact bar charts, it's a bit chaotic")
  const out = new Map(), base = H * 0.8, x0 = W * 0.08, x1 = W * 0.92, bw = (x1 - x0) / bins, cell = Math.min(bw * 0.95, H * 0.075);
  const stack = new Array(bins).fill(0);
  const sorted = list.slice().sort((a, b) => CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat));
  for (const o of sorted) {
    const b = Math.max(0, Math.min(bins - 1, Math.floor((val(o) - lo) / (hi - lo) * bins)));
    out.set(o.slug, { X: x0 + bw * (b + 0.5) + ((o.i * 37) % 7 - 3) * cell * 0.04, Y: base - cell * (stack[b] + 0.5), d: cell * 0.88 }); stack[b]++;
  }
  return { pos: out, x0, x1, bw, base };
}
const CHART = { r0: -14, r1: 24, m0: -43, m1: 47 };
function chartXY(W, H, o) {
  const fx = (o.logR - CHART.r0) / (CHART.r1 - CHART.r0), fy = (o.logM - CHART.m0) / (CHART.m1 - CHART.m0);
  return { X: W * (0.08 + 0.84 * fx), Y: H * (0.9 - 0.8 * fy) };
}

const LABEL = (o) => {
  const lines = [KIND[o.cat]];
  if (o.light) { lines.push(`wavelength ${friendlyWavelength(o.logR)}`, "no mass at rest"); }
  else {
    lines.push(`mass ${friendlyMass(o.logM)}`, `size ${friendlyRadius(o.logR)}`);
    if (o.rho != null && o.rho > 1e-6 && o.rho < 1e7) lines.push(`density ${o.rho < 0.1 ? o.rho.toPrecision(1) : o.rho.toPrecision(2)} g/cm³`);
    const tags = [o.round === 1 ? "round" : null, o.alive === 1 ? "alive" : null, o.rho != null && o.rho < 1 ? "floats" : null].filter(Boolean);
    if (tags.length) lines.push(tags.join(" · "));
  }
  return lines;
};

/** o: the phase times ({ start, labels, float, …, and the slugs the camera darts to }); t: the take's clock */
export function drawCatalogue(ctx, W, H, o, t) {
  const S = Math.min(W, H), all = cloud(), pts = all.filter(p => !p.extra);
  const at = (k) => o[k] ?? Infinity, on = (k, d = 1.2) => smooth((t - at(k)) / d);
  // the camera's darts: every phase named after an object, each until the next phase
  const order = Object.entries(o).filter(([k, v]) => typeof v === "number" && isFinite(v)).sort((a, b) => a[1] - b[1]);
  const foci = order.filter(([k]) => CATALOGUE_SLUGS.includes(k)).map(([k, v]) => {
    const next = order.find(([, v2]) => v2 > v); return [v, k, next ? next[1] : null];
  });
  const cam = camAt({ foci }, t);
  // the sorted layouts, in order; each object eases from the one before (staggered a little, so they flow)
  const SORTS = ["float", "round", "alive", "heavy", "big", "chart"].filter(k => isFinite(at(k)));
  const layout = (k) => {
    if (k === "float") return groups(W, H, pts.filter(p => p.rho != null && !p.light), p => p.rho < 1 ? "f" : "s", [["f"], ["s"]]);
    if (k === "round") return groups(W, H, pts.filter(p => p.round != null), p => p.round === 1 ? "r" : p.round === 0.5 ? "b" : "n", [["r"], ["b"], ["n"]]);
    if (k === "alive") return groups(W, H, pts.filter(p => !p.light), p => p.alive === 1 ? "a" : p.alive === 0.5 ? "b" : "n", [["a"], ["b"], ["n"]]);
    if (k === "heavy") return bars(W, H, pts.filter(p => !p.light), p => p.logM, -28, 46, 12).pos;
    if (k === "big") return bars(W, H, pts.filter(p => !p.light), p => p.logR, -14, 24, 12).pos;
    if (k === "chart") return new Map(pts.map(p => { const c = chartXY(W, H, p); return [p.slug, { ...c, d: S * 0.06 }]; }));
  };
  const lay = new Map(SORTS.map(k => [k, layout(k)]));
  const lightIn = on("light", 1.4);
  // the 3D projection, as it is now
  const proj = all.map(p => {
    const q = project(cam, p, W, H);
    return { p, ...q, d: q.z > 0.15 ? Math.min(S * 0.9, S * 0.3 * p.s / q.z) : 0 };
  });
  // which layout is current, and how far into it
  let cur = null, prev = null, f = 0;
  for (const k of SORTS) if (t >= at(k)) { prev = cur; cur = k; }
  const items = proj.map(q => {
    const p = q.p; let X = q.X, Y = q.Y, d = q.d, a = 1, z = q.z;
    if (p.light) a *= lightIn;
    if (cur) {
      const stagger = (p.i % 9) * 0.06, g = smooth((t - at(cur) - stagger) / 1.5);
      const A = prev ? lay.get(prev).get(p.key) : { X: q.X, Y: q.Y, d: q.d }, B = lay.get(cur).get(p.key);
      const from = A || { X: q.X, Y: q.Y, d: 0 };
      if (B) { X = lerp(from.X, B.X, g); Y = lerp(from.Y, B.Y, g); d = lerp(from.d, B.d, g); if (!A) a *= g; z = lerp(q.z, 3, g); }
      else { X = from.X; Y = from.Y; d = from.d; a *= 1 - g; z = 3; }
      if (cur === "chart" && p.light) a = lightIn;   // light comes back: placed by its wavelength
    }
    return { p, X, Y, d, a, z };
  });
  const sorted = !!cur;
  // the links: thin glowing lines between nearby things of a kind (in the cloud)
  const linkA = on("links", 1.5) * (sorted ? 1 - smooth((t - at(SORTS[0])) / 1) : 1);
  if (linkA > 0.01) {
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.lineWidth = Math.max(1, S * 0.0022);
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const A = items[i], B = items[j]; if (A.p.cat !== B.p.cat || A.z <= 0.1 || B.z <= 0.1) continue;
      const d3 = Math.hypot(A.p.x - B.p.x, A.p.y - B.p.y, A.p.z - B.p.z); if (d3 > 2.3) continue;
      const fade = Math.min(1, 3 / Math.max(A.z, B.z)) * linkA * A.a * B.a * 0.55;
      ctx.globalAlpha = fade; ctx.strokeStyle = COL[A.p.cat]; ctx.shadowColor = COL[A.p.cat]; ctx.shadowBlur = S * 0.012;
      ctx.beginPath(); ctx.moveTo(A.X, A.Y); ctx.lineTo(B.X, B.Y); ctx.stroke();
    }
    ctx.restore();
  }
  // the vertical bands of the bar charts and the chart's grid
  const bandA = (k) => isFinite(at(k)) ? smooth((t - at(k) - 0.6) / 1) * (cur === k ? 1 : 0) : 0;
  for (const k of ["heavy", "big"]) {
    const a = bandA(k); if (a <= 0) continue;
    const bins = 12, x0 = W * 0.08, x1 = W * 0.92, bw = (x1 - x0) / bins;
    for (let b = 0; b < bins; b++) { ctx.globalAlpha = a * (b % 2 ? 0.07 : 0.035); ctx.fillStyle = "#9fb4ff"; ctx.fillRect(x0 + b * bw, H * 0.2, bw, H * 0.6); }
    ctx.globalAlpha = a; const y = H * 0.87;
    arrowHead(ctx, W * 0.5 - S * 0.02, y, W * 0.12, y, "#ffe9a3", S * 0.004);
    arrowHead(ctx, W * 0.5 + S * 0.02, y, W * 0.88, y, "#ffe9a3", S * 0.004);
    text(ctx, k === "heavy" ? "LIGHTER" : "SMALLER", W * 0.1, y - S * 0.045, S * 0.04, "#ffe9a3", "left");
    text(ctx, k === "heavy" ? "HEAVIER" : "BIGGER", W * 0.9, y - S * 0.045, S * 0.04, "#ffe9a3", "right");
    ctx.globalAlpha = 1;
  }
  const gridA = cur === "chart" ? smooth((t - at("chart") - 0.5) / 1.2) : 0;
  if (gridA > 0) {
    ctx.save(); ctx.lineWidth = 1;
    const x = (r) => W * (0.08 + 0.84 * (r - CHART.r0) / (CHART.r1 - CHART.r0)), y = (m) => H * (0.9 - 0.8 * (m - CHART.m0) / (CHART.m1 - CHART.m0));
    const tens = smooth((t - at("grid")) / 1.5);   // each square ten times the last: every decade, once it's said
    for (let r = CHART.r0; r <= CHART.r1; r++) { const major = r % 5 === 0; if (!major && tens <= 0) continue; ctx.globalAlpha = gridA * (major ? 0.22 : 0.09 * tens); ctx.strokeStyle = "#9fb4ff"; ctx.beginPath(); ctx.moveTo(x(r), y(CHART.m0)); ctx.lineTo(x(r), y(CHART.m1)); ctx.stroke(); }
    for (let m = CHART.m0; m <= CHART.m1; m++) { const major = m % 5 === 0; if (!major && tens <= 0) continue; ctx.globalAlpha = gridA * (major ? 0.22 : 0.09 * tens); ctx.strokeStyle = "#9fb4ff"; ctx.beginPath(); ctx.moveTo(x(CHART.r0), y(m)); ctx.lineTo(x(CHART.r1), y(m)); ctx.stroke(); }
    ctx.globalAlpha = gridA; ctx.strokeStyle = "#ffe9a3"; ctx.lineWidth = S * 0.003;
    ctx.beginPath(); ctx.moveTo(x(CHART.r0), y(CHART.m0)); ctx.lineTo(x(CHART.r1), y(CHART.m0)); ctx.moveTo(x(CHART.r0), y(CHART.m0)); ctx.lineTo(x(CHART.r0), y(CHART.m1)); ctx.stroke();
    text(ctx, "SIZE →", x(CHART.r1), y(CHART.m0) + S * 0.035, S * 0.035, "#ffe9a3", "right");
    ctx.save(); ctx.translate(x(CHART.r0) - S * 0.03, y(CHART.m1)); ctx.rotate(-Math.PI / 2); text(ctx, "MASS →", 0, 0, S * 0.035, "#ffe9a3", "right"); ctx.restore();
    if (tens > 0) { ctx.globalAlpha = gridA * tens; text(ctx, "×10 EACH STEP", W * 0.5, H * 0.955, S * 0.032, "#ffe9a3"); }
    ctx.restore();
  }
  // the headings of the columns
  const HEADS = { float: ["FLOATS IN WATER", "SINKS"], round: ["ROUND", "IN BETWEEN", "NOT ROUND"], alive: ["ALIVE", "IN BETWEEN", "NOT ALIVE"] };
  if (HEADS[cur]) {
    const hs = HEADS[cur], a = smooth((t - at(cur)) / 0.8), colW = W * 0.86 / hs.length;
    hs.forEach((h, i) => { ctx.globalAlpha = a; text(ctx, h, W * 0.07 + colW * (i + 0.5), H * 0.17, S * (hs.length > 2 ? 0.04 : 0.048), "#ffe9a3"); });
    ctx.globalAlpha = 1;
  }
  // the pictures, far ones first; out of focus (blurred) when far away or too close, in the cloud
  const labels = on("labels", 1.0);
  items.sort((A, B) => B.z - A.z);
  for (const q of items) {
    if (q.a <= 0.01 || q.d < 1 || q.z <= 0.05) continue;
    const im = pic(q.p.slug); if (!(im.complete && im.naturalWidth)) continue;
    const blurPx = sorted ? 0 : Math.min(S * 0.014, Math.abs(Math.log(q.z / 1.6)) * S * 0.007);
    ctx.save();
    if (blurPx > 0.6) ctx.filter = `blur(${blurPx.toFixed(1)}px)`;
    ctx.globalAlpha = q.a * (sorted ? 1 : Math.min(1, 3.5 / q.z));
    ctx.drawImage(im, q.X - q.d / 2, q.Y - q.d / 2, q.d, q.d);
    ctx.restore();
    // its label: the name in its chart colour, its kind and numbers under it (in the cloud, the near ones only)
    if (labels > 0 && q.d > S * (sorted ? 0.03 : 0.07)) {
      const near = sorted ? 1 : smooth((3.0 - q.z) / 1.0);
      const la = labels * q.a * near; if (la <= 0.02) continue;
      const fs = sorted ? Math.max(S * 0.014, Math.min(S * 0.024, q.d * 0.2)) : Math.max(S * 0.024, Math.min(S * 0.042, q.d * 0.14));
      ctx.globalAlpha = la;
      text(ctx, q.p.name.toUpperCase(), q.X, q.Y + q.d * 0.52 + fs * 0.7, fs, COL[q.p.cat]);
      if (!sorted) LABEL(q.p).forEach((l, i) => text(ctx, l, q.X, q.Y + q.d * 0.52 + fs * 1.75 + i * fs * 0.85, fs * 0.72, "#e9ecf5", "center", 600));
      ctx.globalAlpha = 1;
    }
  }
}
