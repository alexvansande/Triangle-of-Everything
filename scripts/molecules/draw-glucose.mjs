#!/usr/bin/env node
/**
 * draw-glucose.mjs — β-D-glucopyranose (C₆H₁₂O₆), radial layout.
 *
 * Output: scripts/molecules/diagrams/glucose-diagram.{svg,png}
 */
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { offset, renderDiagram } from "./lib.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "diagrams");

const W = 1024, H = 1024;
const CX = W / 2, CY = H / 2;
const RING_R = 175;

// Ring layout: regular hexagon, O5 at top
const ringAngleDeg = { O5: 90, C1: 30, C2: -30, C3: -90, C4: -150, C5: 150 };
const ringPos = Object.fromEntries(
  Object.entries(ringAngleDeg).map(([id, deg]) => [id, offset([CX, CY], deg, RING_R)])
);

const SUB_DIST = 95;
const SUB_SPREAD = 28;
const OH_TAIL = 60;
const subAngle = (ringId, side) => ringAngleDeg[ringId] + side * SUB_SPREAD;
const sub = (ringId, side, d = SUB_DIST) => offset(ringPos[ringId], subAngle(ringId, side), d);
const ohH = (ringId, side) => offset(ringPos[ringId], subAngle(ringId, side), SUB_DIST + OH_TAIL);

// CH2OH chain off C5 on the +1 side
const C5_CHAIN_ANGLE = subAngle("C5", +1);
const C6_pos  = offset(ringPos.C5, C5_CHAIN_ANGLE, 105);
const O6_pos  = offset(ringPos.C5, C5_CHAIN_ANGLE, 215);
const HO6_pos = offset(ringPos.C5, C5_CHAIN_ANGLE, 285);
const H6a_pos = offset(C6_pos, C5_CHAIN_ANGLE + 95, 50);
const H6b_pos = offset(C6_pos, C5_CHAIN_ANGLE - 95, 50);

const atoms = [
  { id: "O5", el: "O", pos: ringPos.O5 },
  { id: "C1", el: "C", pos: ringPos.C1 },
  { id: "C2", el: "C", pos: ringPos.C2 },
  { id: "C3", el: "C", pos: ringPos.C3 },
  { id: "C4", el: "C", pos: ringPos.C4 },
  { id: "C5", el: "C", pos: ringPos.C5 },

  // C1: -OH (β) up-side, -H down-side
  { id: "O1",  el: "O", pos: sub("C1", +1) },
  { id: "HO1", el: "H", pos: ohH("C1", +1) },
  { id: "H1",  el: "H", pos: sub("C1", -1) },

  // C2: alternating
  { id: "H2",  el: "H", pos: sub("C2", +1) },
  { id: "O2",  el: "O", pos: sub("C2", -1) },
  { id: "HO2", el: "H", pos: ohH("C2", -1) },

  { id: "O3",  el: "O", pos: sub("C3", +1) },
  { id: "HO3", el: "H", pos: ohH("C3", +1) },
  { id: "H3",  el: "H", pos: sub("C3", -1) },

  { id: "H4",  el: "H", pos: sub("C4", +1) },
  { id: "O4",  el: "O", pos: sub("C4", -1) },
  { id: "HO4", el: "H", pos: ohH("C4", -1) },

  // C5: -CH2OH chain on +1, -H on -1
  { id: "C6",  el: "C", pos: C6_pos },
  { id: "H6a", el: "H", pos: H6a_pos },
  { id: "H6b", el: "H", pos: H6b_pos },
  { id: "O6",  el: "O", pos: O6_pos },
  { id: "HO6", el: "H", pos: HO6_pos },
  { id: "H5",  el: "H", pos: sub("C5", -1) },
];

const bonds = [
  ["O5", "C1"], ["C1", "C2"], ["C2", "C3"], ["C3", "C4"], ["C4", "C5"], ["C5", "O5"],
  ["C1", "O1"], ["O1", "HO1"], ["C1", "H1"],
  ["C2", "H2"], ["C2", "O2"], ["O2", "HO2"],
  ["C3", "O3"], ["O3", "HO3"], ["C3", "H3"],
  ["C4", "H4"], ["C4", "O4"], ["O4", "HO4"],
  ["C5", "C6"], ["C6", "H6a"], ["C6", "H6b"], ["C6", "O6"], ["O6", "HO6"], ["C5", "H5"],
];

await renderDiagram({
  slug: "glucose",
  atoms,
  bonds,
  expectFormula: { C: 6, H: 12, O: 6 },
  outDir: OUT_DIR,
});
