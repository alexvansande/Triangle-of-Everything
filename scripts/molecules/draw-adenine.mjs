#!/usr/bin/env node
/**
 * draw-adenine.mjs — Adenine (C₅H₅N₅), 9H-purine-6-amine.
 *
 * Fused bicyclic: pyrimidine 6-ring (left) + imidazole 5-ring (right),
 * sharing the C4-C5 edge. NH₂ on C6, H on C2 / C8 / N9.
 *
 * Output: scripts/molecules/diagrams/adenine-diagram.{svg,png}
 */
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { offset, renderDiagram } from "./lib.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "diagrams");

const W = 1024, H = 1024;
const CX = W / 2, CY = H / 2;
const RING_R = 130;                            // hexagon circumradius (= edge length)
const PENT_R = RING_R / (2 * Math.sin(Math.PI / 5));  // ≈ 0.851 R

// Center the fused ring system horizontally on the canvas.
// Hexagon centre is offset to the left, pentagon centre to the right; their
// midpoint sits on the canvas centre.
const MID = 0.777 * RING_R;
const HEX_CX  = CX - MID;
const PENT_CX = CX + MID;

const polar = (cx, cy, deg, r) => offset([cx, cy], deg, r);

// ── Pyrimidine 6-ring (going CCW): C4(-30) → C5(30) → C6(90) → N1(150) → C2(210) → N3(270) ──
const N1 = polar(HEX_CX, CY, 150, RING_R);
const C2 = polar(HEX_CX, CY, 210, RING_R);
const N3 = polar(HEX_CX, CY, 270, RING_R);
const C4 = polar(HEX_CX, CY, 330, RING_R);
const C5 = polar(HEX_CX, CY,  30, RING_R);
const C6 = polar(HEX_CX, CY,  90, RING_R);

// ── Imidazole 5-ring (going CCW from C5): C5(144) → N7(72) → C8(0) → N9(-72) → C4(-144) ──
const N7 = polar(PENT_CX, CY,  72, PENT_R);
const C8 = polar(PENT_CX, CY,   0, PENT_R);
const N9 = polar(PENT_CX, CY, -72, PENT_R);

// ── Substituents ──
const SUB = 85;       // ring atom → substituent
const N_TAIL = 60;    // amine N → its H

// NH₂ on C6 (top): the amine N points straight up from C6.
const N6  = offset(C6, 90, SUB);
const H6a = offset(N6,  55, N_TAIL);   // upper-right H
const H6b = offset(N6, 125, N_TAIL);   // upper-left H

// H atoms on C2 (lower-left), C8 (right), N9 (lower-right)
const H2 = offset(C2, 210, SUB);   // outward from hex centre
const H8 = offset(C8,   0, SUB);   // straight right
const H9 = offset(N9, -72, SUB);   // outward from pent centre

const atoms = [
  // 6-ring (pyrimidine)
  { id: "N1", el: "N", pos: N1 },
  { id: "C2", el: "C", pos: C2 },
  { id: "N3", el: "N", pos: N3 },
  { id: "C4", el: "C", pos: C4 },
  { id: "C5", el: "C", pos: C5 },
  { id: "C6", el: "C", pos: C6 },
  // 5-ring (imidazole) — only the 3 not shared
  { id: "N7", el: "N", pos: N7 },
  { id: "C8", el: "C", pos: C8 },
  { id: "N9", el: "N", pos: N9 },
  // Amine on C6
  { id: "N6",  el: "N", pos: N6 },
  { id: "H6a", el: "H", pos: H6a },
  { id: "H6b", el: "H", pos: H6b },
  // Ring H's
  { id: "H2", el: "H", pos: H2 },
  { id: "H8", el: "H", pos: H8 },
  { id: "H9", el: "H", pos: H9 },
];

const bonds = [
  // Pyrimidine ring (6)
  ["N1", "C2"], ["C2", "N3"], ["N3", "C4"], ["C4", "C5"], ["C5", "C6"], ["C6", "N1"],
  // Imidazole ring (4 new bonds; C4-C5 already counted)
  ["C5", "N7"], ["N7", "C8"], ["C8", "N9"], ["N9", "C4"],
  // Amine
  ["C6", "N6"], ["N6", "H6a"], ["N6", "H6b"],
  // Ring H's
  ["C2", "H2"], ["C8", "H8"], ["N9", "H9"],
];

await renderDiagram({
  slug: "adenine",
  atoms,
  bonds,
  expectFormula: { C: 5, H: 5, N: 5 },
  outDir: OUT_DIR,
});
