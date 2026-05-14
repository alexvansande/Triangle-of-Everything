#!/usr/bin/env node
/**
 * draw-atp.mjs — Adenosine triphosphate (C₁₀H₁₆N₅O₁₃P₃).
 *
 * Three connected moieties:
 *   1. Adenine (purine base) — upper-left
 *   2. Ribose (5-ring sugar) — middle, bonded to N9 of adenine via C1'
 *   3. Triphosphate chain — extending right from ribose's C5'-O-Pα-O-Pβ-O-Pγ
 *
 * Each P has 4 oxygens: two bridging (in the chain) plus terminal =O and
 * -OH groups. γ has 3 terminal oxygens (1 =O, 2 -OH).
 *
 * Output: scripts/molecules/diagrams/atp-diagram.{svg,png}
 */
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { offset, renderDiagram } from "./lib.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "diagrams");

const W = 1024, H = 1024;
const polar = (cx, cy, deg, r) => offset([cx, cy], deg, r);

// ──────────────────────────────────────────────────────────────────
//  ADENINE (upper-left)
// ──────────────────────────────────────────────────────────────────
const ADE_RING_R = 65;
const ADE_PENT_R = ADE_RING_R / (2 * Math.sin(Math.PI / 5));
const ADE_HEX_CX = 230;
const ADE_HEX_CY = 320;
const ADE_PENT_CX = ADE_HEX_CX + 1.554 * ADE_RING_R;

const N1 = polar(ADE_HEX_CX, ADE_HEX_CY, 150, ADE_RING_R);
const C2 = polar(ADE_HEX_CX, ADE_HEX_CY, 210, ADE_RING_R);
const N3 = polar(ADE_HEX_CX, ADE_HEX_CY, 270, ADE_RING_R);
const C4 = polar(ADE_HEX_CX, ADE_HEX_CY, 330, ADE_RING_R);
const C5 = polar(ADE_HEX_CX, ADE_HEX_CY,  30, ADE_RING_R);
const C6 = polar(ADE_HEX_CX, ADE_HEX_CY,  90, ADE_RING_R);
const N7 = polar(ADE_PENT_CX, ADE_HEX_CY,  72, ADE_PENT_R);
const C8 = polar(ADE_PENT_CX, ADE_HEX_CY,   0, ADE_PENT_R);
const N9 = polar(ADE_PENT_CX, ADE_HEX_CY, -72, ADE_PENT_R);

const ADE_SUB = 50;
const ADE_TAIL = 45;
const N6  = offset(C6, 90, ADE_SUB);
const H6a = offset(N6,  55, ADE_TAIL);
const H6b = offset(N6, 125, ADE_TAIL);
const H2  = offset(C2, 210, ADE_SUB);
const H8  = offset(C8,   0, ADE_SUB);
// N9 has NO H in ATP — it's bonded to C1' of ribose instead.

// ──────────────────────────────────────────────────────────────────
//  RIBOSE (middle)
// ──────────────────────────────────────────────────────────────────
const RIB_CX = 500;
const RIB_CY = 480;
const RIB_R  = 75;

// Pentagon going CCW from O4' at the top:
//   O4'(90°) → C1'(162°) → C2'(234°) → C3'(306°) → C4'(18°)
const O4p = polar(RIB_CX, RIB_CY,  90, RIB_R);
const C1p = polar(RIB_CX, RIB_CY, 162, RIB_R);  // bonded to N9 of adenine
const C2p = polar(RIB_CX, RIB_CY, 234, RIB_R);
const C3p = polar(RIB_CX, RIB_CY, 306, RIB_R);
const C4p = polar(RIB_CX, RIB_CY,  18, RIB_R);  // bonded to C5'

const RIB_SUB = 55;
const RIB_TAIL = 45;

// -OH on C2' (down-left of ring)
const O2p   = offset(C2p, 234, RIB_SUB);
const HO2p  = offset(O2p, 234, RIB_TAIL);
// -OH on C3' (down-right of ring)
const O3p   = offset(C3p, 306, RIB_SUB);
const HO3p  = offset(O3p, 306, RIB_TAIL);
// Ring H atoms (one per C, perpendicular to radial outward — placed above the ring plane)
const H1p = offset(C1p, 102, RIB_SUB);  // C1' H (tucked toward top so it doesn't collide with C1'-N9 bond)
const H2p = offset(C2p, 174, RIB_SUB);  // C2' H, just left of the -OH
const H3p = offset(C3p, 354, RIB_SUB);  // C3' H, just right of the -OH
const H4p = offset(C4p,  78, RIB_SUB);  // C4' H, tucked above

// C5' branches up from C4' (out of the ring plane)
const C5p  = offset(C4p, 60, 80);
const H5pa = offset(C5p, 120, RIB_TAIL);
const H5pb = offset(C5p,  10, RIB_TAIL);

// ──────────────────────────────────────────────────────────────────
//  TRIPHOSPHATE CHAIN (right)
// ──────────────────────────────────────────────────────────────────
// Chain: C5'─O5α─Pα─O_αβ─Pβ─O_βγ─Pγ, plus terminal =O/-OH on each P.
const CHAIN_Y = C5p[1];           // keep chain at same y as C5'
const BOND = 48;                  // P-O bond length in diagram
const O5a    = [C5p[0]  + BOND, CHAIN_Y];
const Pa     = [O5a[0]  + BOND, CHAIN_Y];
const O_ab   = [Pa[0]   + BOND, CHAIN_Y];
const Pb     = [O_ab[0] + BOND, CHAIN_Y];
const O_bg   = [Pb[0]   + BOND, CHAIN_Y];
const Pg     = [O_bg[0] + BOND, CHAIN_Y];

// Pα terminal: =O up, -OH down
const Oa_dbl = [Pa[0], Pa[1] - BOND];
const Oa_oh  = [Pa[0], Pa[1] + BOND];
const Ha_oh  = [Pa[0], Pa[1] + BOND + 42];
// Pβ terminal: =O up, -OH down
const Ob_dbl = [Pb[0], Pb[1] - BOND];
const Ob_oh  = [Pb[0], Pb[1] + BOND];
const Hb_oh  = [Pb[0], Pb[1] + BOND + 42];
// Pγ terminal: 1 =O (right), 2 -OH (up + down)
const Og_dbl  = [Pg[0] + BOND, Pg[1]];
const Og_oha  = [Pg[0], Pg[1] - BOND];
const Hg_a    = [Pg[0], Pg[1] - BOND - 42];
const Og_ohb  = [Pg[0], Pg[1] + BOND];
const Hg_b    = [Pg[0], Pg[1] + BOND + 42];

// ──────────────────────────────────────────────────────────────────
//  Atom list
// ──────────────────────────────────────────────────────────────────
const atoms = [
  // Adenine — 14 atoms
  { id: "N1", el: "N", pos: N1 },
  { id: "C2", el: "C", pos: C2 },
  { id: "N3", el: "N", pos: N3 },
  { id: "C4", el: "C", pos: C4 },
  { id: "C5", el: "C", pos: C5 },
  { id: "C6", el: "C", pos: C6 },
  { id: "N7", el: "N", pos: N7 },
  { id: "C8", el: "C", pos: C8 },
  { id: "N9", el: "N", pos: N9 },
  { id: "N6",  el: "N", pos: N6 },
  { id: "H6a", el: "H", pos: H6a },
  { id: "H6b", el: "H", pos: H6b },
  { id: "H2",  el: "H", pos: H2 },
  { id: "H8",  el: "H", pos: H8 },

  // Ribose — 16 atoms
  { id: "O4p", el: "O", pos: O4p },
  { id: "C1p", el: "C", pos: C1p },
  { id: "C2p", el: "C", pos: C2p },
  { id: "C3p", el: "C", pos: C3p },
  { id: "C4p", el: "C", pos: C4p },
  { id: "C5p", el: "C", pos: C5p },
  { id: "O2p", el: "O", pos: O2p },
  { id: "HO2p", el: "H", pos: HO2p },
  { id: "O3p", el: "O", pos: O3p },
  { id: "HO3p", el: "H", pos: HO3p },
  { id: "H1p", el: "H", pos: H1p },
  { id: "H2p", el: "H", pos: H2p },
  { id: "H3p", el: "H", pos: H3p },
  { id: "H4p", el: "H", pos: H4p },
  { id: "H5pa", el: "H", pos: H5pa },
  { id: "H5pb", el: "H", pos: H5pb },

  // Triphosphate — 17 atoms
  { id: "O5a",  el: "O", pos: O5a },
  { id: "Pa",   el: "P", pos: Pa },
  { id: "Oad",  el: "O", pos: Oa_dbl },
  { id: "Oao",  el: "O", pos: Oa_oh },
  { id: "Hao",  el: "H", pos: Ha_oh },
  { id: "Oab",  el: "O", pos: O_ab },
  { id: "Pb",   el: "P", pos: Pb },
  { id: "Obd",  el: "O", pos: Ob_dbl },
  { id: "Obo",  el: "O", pos: Ob_oh },
  { id: "Hbo",  el: "H", pos: Hb_oh },
  { id: "Obg",  el: "O", pos: O_bg },
  { id: "Pg",   el: "P", pos: Pg },
  { id: "Ogd",  el: "O", pos: Og_dbl },
  { id: "Oga",  el: "O", pos: Og_oha },
  { id: "Hga",  el: "H", pos: Hg_a },
  { id: "Ogb",  el: "O", pos: Og_ohb },
  { id: "Hgb",  el: "H", pos: Hg_b },
];

// ──────────────────────────────────────────────────────────────────
//  Bond list
// ──────────────────────────────────────────────────────────────────
const bonds = [
  // Adenine pyrimidine + imidazole + amine + ring H
  ["N1", "C2"], ["C2", "N3"], ["N3", "C4"], ["C4", "C5"], ["C5", "C6"], ["C6", "N1"],
  ["C5", "N7"], ["N7", "C8"], ["C8", "N9"], ["N9", "C4"],
  ["C6", "N6"], ["N6", "H6a"], ["N6", "H6b"],
  ["C2", "H2"], ["C8", "H8"],

  // Glycosidic bond: adenine N9 — ribose C1'
  ["N9", "C1p"],

  // Ribose ring + branches
  ["O4p", "C1p"], ["C1p", "C2p"], ["C2p", "C3p"], ["C3p", "C4p"], ["C4p", "O4p"],
  ["C4p", "C5p"],
  ["C2p", "O2p"], ["O2p", "HO2p"],
  ["C3p", "O3p"], ["O3p", "HO3p"],
  ["C1p", "H1p"], ["C2p", "H2p"], ["C3p", "H3p"], ["C4p", "H4p"],
  ["C5p", "H5pa"], ["C5p", "H5pb"],

  // C5'-O5'-Pα-O-Pβ-O-Pγ chain
  ["C5p", "O5a"], ["O5a", "Pa"],
  ["Pa", "Oad"], ["Pa", "Oao"], ["Oao", "Hao"],
  ["Pa", "Oab"], ["Oab", "Pb"],
  ["Pb", "Obd"], ["Pb", "Obo"], ["Obo", "Hbo"],
  ["Pb", "Obg"], ["Obg", "Pg"],
  ["Pg", "Ogd"],
  ["Pg", "Oga"], ["Oga", "Hga"],
  ["Pg", "Ogb"], ["Ogb", "Hgb"],
];

await renderDiagram({
  slug: "atp",
  atoms,
  bonds,
  expectFormula: { C: 10, H: 16, N: 5, O: 13, P: 3 },
  outDir: OUT_DIR,
  opts: { protonR: 4.5, clusterR: 13 },  // smaller dots since atoms are denser
});
