#!/usr/bin/env node
/**
 * draw-thymine.mjs — Thymine (C₅H₆N₂O₂), 5-methyluracil.
 *
 * Single 6-ring pyrimidine. Two carbonyls (C2=O, C4=O), N1 and N3 each
 * carry an H, C5 has a -CH₃ branch, C6 has an H.
 *
 * Output: scripts/molecules/diagrams/thymine-diagram.{svg,png}
 */
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { offset, renderDiagram } from "./lib.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "diagrams");

const W = 1024, H = 1024;
const CX = W / 2, CY = H / 2;
const RING_R = 160;

const polar = (cx, cy, deg, r) => offset([cx, cy], deg, r);

const N1 = polar(CX, CY, -90, RING_R);
const C2 = polar(CX, CY, -30, RING_R);
const N3 = polar(CX, CY,  30, RING_R);
const C4 = polar(CX, CY,  90, RING_R);
const C5 = polar(CX, CY, 150, RING_R);
const C6 = polar(CX, CY, 210, RING_R);

const SUB = 95;

// Substituents
const O2 = offset(C2, -30, SUB);              // C2=O
const H3 = offset(N3,  30, SUB);              // N3-H
const O4 = offset(C4,  90, SUB);              // C4=O
const C7 = offset(C5, 150, SUB);              // methyl C
// 3 H around C7 (CH₃) in a tripod
const H7a = offset(C7, 150, 55);              // outward
const H7b = offset(C7, 210, 55);              // CCW
const H7c = offset(C7,  90, 55);              // CW
const H6  = offset(C6, 210, SUB);             // C6-H
const H1  = offset(N1, -90, SUB);             // N1-H

const atoms = [
  { id: "N1", el: "N", pos: N1 },
  { id: "C2", el: "C", pos: C2 },
  { id: "N3", el: "N", pos: N3 },
  { id: "C4", el: "C", pos: C4 },
  { id: "C5", el: "C", pos: C5 },
  { id: "C6", el: "C", pos: C6 },
  { id: "O2", el: "O", pos: O2 },
  { id: "O4", el: "O", pos: O4 },
  { id: "C7", el: "C", pos: C7 },             // methyl carbon
  { id: "H7a", el: "H", pos: H7a },
  { id: "H7b", el: "H", pos: H7b },
  { id: "H7c", el: "H", pos: H7c },
  { id: "H1", el: "H", pos: H1 },
  { id: "H3", el: "H", pos: H3 },
  { id: "H6", el: "H", pos: H6 },
];

const bonds = [
  ["N1", "C2"], ["C2", "N3"], ["N3", "C4"], ["C4", "C5"], ["C5", "C6"], ["C6", "N1"],
  ["C2", "O2"], ["C4", "O4"],
  ["C5", "C7"], ["C7", "H7a"], ["C7", "H7b"], ["C7", "H7c"],
  ["N1", "H1"], ["N3", "H3"], ["C6", "H6"],
];

await renderDiagram({
  slug: "thymine",
  atoms,
  bonds,
  expectFormula: { C: 5, H: 6, N: 2, O: 2 },
  outDir: OUT_DIR,
});
