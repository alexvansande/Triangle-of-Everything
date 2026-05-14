#!/usr/bin/env node
/**
 * draw-fullerene.mjs — Buckminsterfullerene C₆₀ (truncated icosahedron).
 *
 * 60 carbon vertices, 90 edges, organized into 12 pentagons + 20 hexagons.
 * Constructed by truncating an icosahedron: each of its 30 edges contributes
 * two new vertices (at 1/3 and 2/3 along the edge), giving 60 carbons. Each
 * original icosahedron vertex becomes a pentagon, each triangular face
 * becomes a hexagon.
 *
 * Geometry generated procedurally from icosahedron coordinates, rotated for
 * a "soccer ball" view, orthographically projected to 2D. Back-facing edges
 * are drawn dimmer so the front/back are distinguishable.
 *
 * Output: scripts/molecules/diagrams/fullerene-c60-diagram.{svg,png}
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { PROTONS, ELEMENT_COLOR, clusterPositions } from "./lib.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "diagrams");

const W = 1024, H = 1024;
const CX = W / 2, CY = H / 2;

// ─── Vector helpers ───
const sub = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
const add = (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
const scl = (a, k) => [a[0]*k, a[1]*k, a[2]*k];
const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const len  = (a) => Math.sqrt(dot(a, a));
const norm = (a) => { const l = len(a); return [a[0]/l, a[1]/l, a[2]/l]; };

// ─── 1. Icosahedron vertices ───
const phi = (1 + Math.sqrt(5)) / 2;
const icoVerts = [
  [ 0,  1,  phi], [ 0,  1, -phi], [ 0, -1,  phi], [ 0, -1, -phi],
  [ 1,  phi, 0], [ 1, -phi, 0], [-1,  phi, 0], [-1, -phi, 0],
  [ phi, 0,  1], [ phi, 0, -1], [-phi, 0,  1], [-phi, 0, -1],
];
const EDGE_LEN = 2;
const TOL = 0.001;

// ─── 2. Icosahedron edges (all vertex pairs at distance 2) ───
const icoEdges = [];
for (let i = 0; i < icoVerts.length; i++) {
  for (let j = i + 1; j < icoVerts.length; j++) {
    if (Math.abs(len(sub(icoVerts[i], icoVerts[j])) - EDGE_LEN) < TOL) {
      icoEdges.push([i, j]);
    }
  }
}
if (icoEdges.length !== 30) throw new Error(`Expected 30 ico edges, got ${icoEdges.length}`);

// ─── 3. Truncated icosahedron vertices ───
// For each ico edge (V1, V2): two new vertices at 1/3 and 2/3 along the edge.
const trunc = [];
const nearV = new Map();        // ico vertex idx → list of trunc vertex indices around it
icoEdges.forEach(([i, j]) => {
  const v1 = icoVerts[i], v2 = icoVerts[j];
  const t1 = add(v1, scl(sub(v2, v1), 1/3));   // nearer V1
  const t2 = add(v1, scl(sub(v2, v1), 2/3));   // nearer V2
  const t1Idx = trunc.length; trunc.push(t1);
  const t2Idx = trunc.length; trunc.push(t2);
  if (!nearV.has(i)) nearV.set(i, []);
  if (!nearV.has(j)) nearV.set(j, []);
  nearV.get(i).push(t1Idx);
  nearV.get(j).push(t2Idx);
});
if (trunc.length !== 60) throw new Error(`Expected 60 trunc vertices, got ${trunc.length}`);

// ─── 4. Truncated icosahedron edges ───
// (a) Axial edges: along each original ico edge, T1-T2 are connected. (30 edges)
// (b) Pentagon edges: around each ico vertex, the 5 trunc points form a pentagon. (60 edges)
const truncEdges = [];
icoEdges.forEach((_, edgeIdx) => {
  truncEdges.push([edgeIdx * 2, edgeIdx * 2 + 1]);
});

// For each ico vertex, order its 5 surrounding trunc points cyclically and connect consecutive ones.
nearV.forEach((indices, vertIdx) => {
  if (indices.length !== 5) throw new Error(`Vertex ${vertIdx} has ${indices.length} neighbors, expected 5`);
  const center = icoVerts[vertIdx];
  const normal = norm(center);                     // pentagon's normal points away from origin
  const ref = sub(trunc[indices[0]], center);
  // tangent basis on the pentagon's plane
  const refProj = sub(ref, scl(normal, dot(ref, normal)));
  const u = norm(refProj);
  const v = cross(normal, u);
  // angle in (u, v) plane
  const sorted = indices
    .map(idx => {
      const r = sub(trunc[idx], center);
      const angle = Math.atan2(dot(r, v), dot(r, u));
      return { idx, angle };
    })
    .sort((a, b) => a.angle - b.angle);
  for (let k = 0; k < 5; k++) {
    truncEdges.push([sorted[k].idx, sorted[(k + 1) % 5].idx]);
  }
});
if (truncEdges.length !== 90) throw new Error(`Expected 90 trunc edges, got ${truncEdges.length}`);

// ─── 5. Rotate for a nice viewing angle ───
// Slight tilt about X and Y axes so it looks like a soccer ball, not a flat ring.
function rotateX(p, theta) {
  const c = Math.cos(theta), s = Math.sin(theta);
  return [p[0], c*p[1] - s*p[2], s*p[1] + c*p[2]];
}
function rotateY(p, theta) {
  const c = Math.cos(theta), s = Math.sin(theta);
  return [c*p[0] + s*p[2], p[1], -s*p[0] + c*p[2]];
}
const rot = (p) => rotateY(rotateX(p, 0.35), 0.20);
const rotated = trunc.map(rot);

// ─── 6. Orthographic projection to canvas ───
let maxR = 0;
for (const p of rotated) {
  const r = Math.sqrt(p[0]*p[0] + p[1]*p[1]);
  if (r > maxR) maxR = r;
}
const TARGET_RADIUS = 360;       // half the diagram extent in pixels
const SCALE = TARGET_RADIUS / maxR;
const xy = rotated.map(p => [CX + p[0] * SCALE, CY + p[1] * SCALE]);   // SVG y already points down naturally for this 3D orientation
const z  = rotated.map(p => p[2]);

// ─── 7. Render SVG (fullerene-specific: tiny clusters, depth-shaded bonds) ───
const PROTON_R = 2.6;
const CLUSTER_R = 8;
const cClusterOffsets = clusterPositions(PROTONS.C, CLUSTER_R);
const C_COLOR = ELEMENT_COLOR.C;

// Bonds: depth-shade by averaging the z of endpoints
const zMin = Math.min(...z), zMax = Math.max(...z);
function bondColor(zAvg) {
  // Map back-most z → dim, front-most z → bright
  const t = (zAvg - zMin) / (zMax - zMin);    // 0 (back) … 1 (front)
  const alpha = 0.25 + 0.75 * t;
  // dodgerblue, opacity scaled
  const r = Math.round(0x3a * alpha + 6 * (1 - alpha));
  const g = Math.round(0x9e * alpha + 14 * (1 - alpha));
  const b = Math.round(0xff * alpha + 36 * (1 - alpha));
  return `rgb(${r},${g},${b})`;
}

let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">\n`;
svg += `  <rect width="${W}" height="${H}" fill="#000000"/>\n`;

// Bonds — sort back-to-front so front bonds occlude back ones
const bondsSorted = truncEdges
  .map(([a, b]) => ({ a, b, zAvg: (z[a] + z[b]) / 2 }))
  .sort((u, v) => u.zAvg - v.zAvg);

svg += `  <g stroke-width="2.2" stroke-linecap="round" fill="none">\n`;
for (const { a, b, zAvg } of bondsSorted) {
  const [x1, y1] = xy[a];
  const [x2, y2] = xy[b];
  svg += `    <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${bondColor(zAvg)}"/>\n`;
}
svg += `  </g>\n`;

// Atoms — also sorted so front ones draw on top
const atomOrder = z.map((_, i) => i).sort((u, v) => z[u] - z[v]);
svg += `  <g fill="${C_COLOR}">\n`;
for (const i of atomOrder) {
  const [ax, ay] = xy[i];
  for (const [dx, dy] of cClusterOffsets) {
    svg += `    <circle cx="${(ax + dx).toFixed(1)}" cy="${(ay + dy).toFixed(1)}" r="${PROTON_R}"/>\n`;
  }
}
svg += `  </g>\n</svg>\n`;

mkdirSync(OUT_DIR, { recursive: true });
const svgPath = join(OUT_DIR, "fullerene-c60-diagram.svg");
const pngPath = join(OUT_DIR, "fullerene-c60-diagram.png");
writeFileSync(svgPath, svg);
await sharp(Buffer.from(svg)).png().toFile(pngPath);

console.log(`✓ fullerene-c60: ${trunc.length} atoms (C${trunc.length}), ${truncEdges.length} bonds → ${pngPath}`);
