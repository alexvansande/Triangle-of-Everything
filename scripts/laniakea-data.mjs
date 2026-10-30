#!/usr/bin/env node
// The data the code-drawn Laniakea is drawn from (public/laniakea/laniakea-core.js):
//   node scripts/laniakea-data.mjs   → public/laniakea/galaxies.json
// The 2MRS galaxies out to 320 Mpc (tools/sky-points, see scripts/build-sky-points.mjs) in
// supergalactic coordinates (Mpc), each one's basin (which attractor it rolls down to, among a
// few softened point masses: a rough Laniakea, not Cosmicflows; the powers-of-ten branch's
// model, tools/powers-of-ten/space.js), the cosmic web (each galaxy to its 3 nearest within a
// reach that grows as the survey thins out) and a sample of flow lines.
import fs from "node:fs";
const ROOT = "tools/sky-points/";
const meta = JSON.parse(fs.readFileSync(ROOT + "points.json", "utf8"));
const raw = Uint8Array.from(Buffer.from(fs.readFileSync(ROOT + "points.txt", "utf8"), "base64")).buffer;
const dirs = new Int16Array(raw, meta.dir.offset, meta.dir.length), logs = new Uint16Array(raw, meta.logd.offset, meta.logd.length);
const types = new Uint8Array(raw, meta.type.offset, meta.type.length);
const D = Math.PI / 180, LY = 9.4607e15, MPC = 3.0857e22, MPC_LY = MPC / LY;
const lb = (l, b, r = 1) => [r * Math.cos(b * D) * Math.cos(l * D), r * Math.cos(b * D) * Math.sin(l * D), r * Math.sin(b * D)];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const SGZ = lb(47.37, 6.32), SGX = lb(137.37, 0), SGY = cross(SGZ, SGX);
const toSG = (p) => [dot(p, SGX), dot(p, SGY), dot(p, SGZ)];
const STEP = 0.001 * (299792.458 / 70); // Mpc, 2MRS's redshift step
const jit = rng(5), R = 320;
const G = [];
for (let i = 0; i < meta.count; i++) {
  if (types[i] !== 2) continue;
  const d = 10 ** (meta.logMin + (logs[i] / 65535) * (meta.logMax - meta.logMin)) / MPC_LY + (jit() - 0.5) * STEP;
  if (d > R) continue;
  const v = [dirs[3 * i] / 32767, dirs[3 * i + 1] / 32767, dirs[3 * i + 2] / 32767];
  G.push(toSG([v[0] * d, -v[2] * d, v[1] * d]));
}
const n = G.length;
const ATT = [
  { name: "Laniakea (Great Attractor)", l: 325.3, b: -7.3, d: 68, m: 1.0, eps: 35 },
  { name: "Shapley", l: 311.5, b: 30.7, d: 200, m: 3.0, eps: 50 },
  { name: "Perseus–Pisces", l: 150.6, b: -13.3, d: 73, m: 0.8, eps: 30 },
  { name: "Coma", l: 58.1, b: 88.0, d: 100, m: 0.6, eps: 25 },
  { name: "Hercules", l: 31.5, b: 44.5, d: 150, m: 0.5, eps: 30 },
].map(A => ({ ...A, p: toSG(lb(A.l, A.b, A.d)) }));
const grad = (p) => { const f = [0, 0, 0]; for (const A of ATT) { const d = sub(A.p, p), q = dot(d, d) + A.eps * A.eps, w = A.m / (q * Math.sqrt(q)); f[0] += d[0] * w; f[1] += d[1] * w; f[2] += d[2] * w; } return f; };
const basin = new Uint8Array(n), flows = [], r = rng(91);
for (let j = 0; j < n; j++) {
  let p = G[j]; const keep = r() < 0.06 && Math.hypot(...p) < 250, path = keep ? [p] : null;
  for (let s = 0; s < 160; s++) { const f = grad(p), l = Math.hypot(...f); if (l < 1e-12) break; p = [p[0] + f[0] * 2 / l, p[1] + f[1] * 2 / l, p[2] + f[2] * 2 / l]; if (path && s % 3 === 0) path.push(p); }
  let best = 0, bd = Infinity; ATT.forEach((A, i) => { const d = Math.hypot(...sub(A.p, p)) / A.eps; if (d < bd) { bd = d; best = i; } });
  basin[j] = best; if (path) flows.push({ path, b: best });
}
// the web
const SH = 10, shells = new Float32Array(60);
for (const p of G) shells[Math.min(59, (Math.hypot(...p) / SH) | 0)]++;
const spacing = Array.from(shells, (c, i) => Math.cbrt((4 / 3) * Math.PI * (((i + 1) * SH) ** 3 - (i * SH) ** 3) / Math.max(c, 1)));
const reach = (d) => Math.max(1.5, 0.55 * spacing[Math.min(59, (d / SH) | 0)]);
const C = 8, cell = new Map(), key = (x, y, z) => `${x},${y},${z}`;
G.forEach((p, j) => { const k = key(Math.floor(p[0] / C), Math.floor(p[1] / C), Math.floor(p[2] / C)); (cell.get(k) ?? cell.set(k, []).get(k)).push(j); });
const links = [], seen = new Set(), degree = new Uint8Array(n);
G.forEach(([x, y, z], j) => {
  const Rr = Math.min(reach(Math.hypot(x, y, z)), C), near = [], cx = Math.floor(x / C), cy = Math.floor(y / C), cz = Math.floor(z / C);
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) for (const i of cell.get(key(cx + a, cy + b, cz + c)) ?? []) {
    if (i === j) continue; const d = Math.hypot(G[i][0] - x, G[i][1] - y, G[i][2] - z); if (d < Rr) near.push([d, i]); }
  near.sort((p, q) => p[0] - q[0]);
  for (const [, i] of near.slice(0, 3)) { const id = Math.min(i, j) * n + Math.max(i, j); if (!seen.has(id)) { seen.add(id); links.push(j, i); } }
  degree[j] = Math.min(255, near.length);
});
// pack: positions int16 (0.01 Mpc), basin, degree, links uint16 pairs, flows (count, basin, points int16)
const pos = new Int16Array(3 * n); G.forEach((p, j) => { for (let k = 0; k < 3; k++) pos[3 * j + k] = Math.round(p[k] * 100); });
const L = Uint16Array.from(links);
const fl = []; for (const f of flows) { fl.push(f.path.length, f.b); for (const q of f.path) fl.push(...q.map(v => Math.max(-32767, Math.min(32767, Math.round(v * 50))))); }
const F = Int16Array.from(fl);
const b64 = (a) => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString("base64");
const out = { n, links: L.length / 2, flows: flows.length, att: ATT.map(A => ({ name: A.name, p: A.p.map(v => +v.toFixed(2)) })),
  pos: b64(pos), basin: b64(basin), degree: b64(degree), L: b64(L), F: b64(F) };
const OUT = "public/laniakea/galaxies.json";
fs.mkdirSync("public/laniakea", { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`${OUT}: ${n} galaxies, ${L.length / 2} links, ${flows.length} flow lines, ${(fs.statSync(OUT).size / 1e6).toFixed(2)} MB`);
