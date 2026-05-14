#!/usr/bin/env node
/**
 * draw-cytosine.mjs — Cytosine (C₄H₅N₃O).
 *
 * Single 6-ring pyrimidine. C2 carbonyl, C4 amine (-NH₂), N1/C5/C6 each
 * carry an H. N3 has no substituent (ring N).
 *
 * Output: scripts/molecules/diagrams/cytosine-diagram.{svg,png}
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

// Ring positions, going CCW from the bottom: N1 → C2 → N3 → C4 → C5 → C6
const N1 = polar(CX, CY, -90, RING_R);
const C2 = polar(CX, CY, -30, RING_R);
const N3 = polar(CX, CY,  30, RING_R);
const C4 = polar(CX, CY,  90, RING_R);
const C5 = polar(CX, CY, 150, RING_R);
const C6 = polar(CX, CY, 210, RING_R);

// Substituents (point radially outward from ring centre)
const SUB = 95;
const N_TAIL = 55;

const O2  = offset(C2,  -30, SUB);          // C2=O
const N4  = offset(C4,   90, SUB);          // C4 amine N
const H4a = offset(N4,   55, N_TAIL);
const H4b = offset(N4,  125, N_TAIL);
const H1  = offset(N1,  -90, SUB);          // N1-H (straight down)
const H5  = offset(C5,  150, SUB);          // C5-H
const H6  = offset(C6,  210, SUB);          // C6-H

const atoms = [
  { id: "N1", el: "N", pos: N1 },
  { id: "C2", el: "C", pos: C2 },
  { id: "N3", el: "N", pos: N3 },
  { id: "C4", el: "C", pos: C4 },
  { id: "C5", el: "C", pos: C5 },
  { id: "C6", el: "C", pos: C6 },
  { id: "O2",  el: "O", pos: O2 },
  { id: "N4",  el: "N", pos: N4 },
  { id: "H4a", el: "H", pos: H4a },
  { id: "H4b", el: "H", pos: H4b },
  { id: "H1",  el: "H", pos: H1 },
  { id: "H5",  el: "H", pos: H5 },
  { id: "H6",  el: "H", pos: H6 },
];

const bonds = [
  ["N1", "C2"], ["C2", "N3"], ["N3", "C4"], ["C4", "C5"], ["C5", "C6"], ["C6", "N1"],
  ["C2", "O2"],
  ["C4", "N4"], ["N4", "H4a"], ["N4", "H4b"],
  ["N1", "H1"], ["C5", "H5"], ["C6", "H6"],
];

await renderDiagram({
  slug: "cytosine",
  atoms,
  bonds,
  expectFormula: { C: 4, H: 5, N: 3, O: 1 },
  outDir: OUT_DIR,
});
