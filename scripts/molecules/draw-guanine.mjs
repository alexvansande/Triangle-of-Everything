#!/usr/bin/env node
/**
 * draw-guanine.mjs — Guanine (C₅H₅N₅O), 9H-purine-2-amine-6(1H)-one.
 *
 * Same purine skeleton as adenine, but C6 has a carbonyl (=O) instead of
 * an amine, C2 has -NH₂ instead of H, and N1 picks up an H (lactam tautomer).
 *
 * Output: scripts/molecules/diagrams/guanine-diagram.{svg,png}
 */
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { offset, renderDiagram } from "./lib.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "diagrams");

const W = 1024, H = 1024;
const CX = W / 2, CY = H / 2;
const RING_R = 130;
const PENT_R = RING_R / (2 * Math.sin(Math.PI / 5));

const MID = 0.777 * RING_R;
const HEX_CX  = CX - MID;
const PENT_CX = CX + MID;

const polar = (cx, cy, deg, r) => offset([cx, cy], deg, r);

// Pyrimidine 6-ring (same vertex positions as adenine)
const N1 = polar(HEX_CX, CY, 150, RING_R);
const C2 = polar(HEX_CX, CY, 210, RING_R);
const N3 = polar(HEX_CX, CY, 270, RING_R);
const C4 = polar(HEX_CX, CY, 330, RING_R);
const C5 = polar(HEX_CX, CY,  30, RING_R);
const C6 = polar(HEX_CX, CY,  90, RING_R);

// Imidazole 5-ring
const N7 = polar(PENT_CX, CY,  72, PENT_R);
const C8 = polar(PENT_CX, CY,   0, PENT_R);
const N9 = polar(PENT_CX, CY, -72, PENT_R);

const SUB = 85;
const N_TAIL = 60;

// C6=O (top)
const O6 = offset(C6, 90, SUB);

// C2-NH₂ (lower-left)
const N2  = offset(C2, 210, SUB);
const H2a = offset(N2, 245, N_TAIL);
const H2b = offset(N2, 175, N_TAIL);

// Ring H's: N1 (upper-left), C8 (right), N9 (lower-right)
const H1 = offset(N1, 150, SUB);
const H8 = offset(C8,   0, SUB);
const H9 = offset(N9, -72, SUB);

const atoms = [
  // Pyrimidine ring
  { id: "N1", el: "N", pos: N1 },
  { id: "C2", el: "C", pos: C2 },
  { id: "N3", el: "N", pos: N3 },
  { id: "C4", el: "C", pos: C4 },
  { id: "C5", el: "C", pos: C5 },
  { id: "C6", el: "C", pos: C6 },
  // Imidazole ring
  { id: "N7", el: "N", pos: N7 },
  { id: "C8", el: "C", pos: C8 },
  { id: "N9", el: "N", pos: N9 },
  // Substituents
  { id: "O6",  el: "O", pos: O6 },
  { id: "N2",  el: "N", pos: N2 },
  { id: "H2a", el: "H", pos: H2a },
  { id: "H2b", el: "H", pos: H2b },
  { id: "H1",  el: "H", pos: H1 },
  { id: "H8",  el: "H", pos: H8 },
  { id: "H9",  el: "H", pos: H9 },
];

const bonds = [
  // Pyrimidine ring
  ["N1", "C2"], ["C2", "N3"], ["N3", "C4"], ["C4", "C5"], ["C5", "C6"], ["C6", "N1"],
  // Imidazole ring (C4-C5 already counted)
  ["C5", "N7"], ["N7", "C8"], ["C8", "N9"], ["N9", "C4"],
  // Substituents
  ["C6", "O6"],
  ["C2", "N2"], ["N2", "H2a"], ["N2", "H2b"],
  ["N1", "H1"], ["C8", "H8"], ["N9", "H9"],
];

await renderDiagram({
  slug: "guanine",
  atoms,
  bonds,
  expectFormula: { C: 5, H: 5, N: 5, O: 1 },
  outDir: OUT_DIR,
});
