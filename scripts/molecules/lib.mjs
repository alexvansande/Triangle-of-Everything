/**
 * lib.mjs — Shared rendering for molecule structural diagrams.
 *
 * Each atom is rendered as a tight cluster of small CPK-colored dots, one
 * dot per proton (so a glucose carbon has 6 dots, an oxygen has 8, an H has
 * 1). Bonds are thin blue lines. Black background. The result is fed to an
 * image generator as a *geometry reference* alongside the hand-built atom
 * PNGs in scripts/atoms/, so the model knows where each atom goes and which
 * element it is (by counting dots / reading the color).
 */
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Atomic numbers (= proton count = dot count per atom)
export const PROTONS = { H: 1, C: 6, N: 7, O: 8, P: 15 };

// CPK-inspired colors, adapted for a black background.
export const ELEMENT_COLOR = {
  H: "#ffffff",  // white
  C: "#ffd84a",  // yellow (also matches the "yellow proton" theme of our atom refs)
  N: "#4d8fff",  // blue
  O: "#ff4d4d",  // red
  P: "#ff9933",  // orange
};

// ─── Geometry helpers (SVG y axis points down) ───
export const angleVec = (deg) => {
  const a = (deg * Math.PI) / 180;
  return [Math.cos(a), -Math.sin(a)];
};
export const offset = (pos, deg, dist) => {
  const [dx, dy] = angleVec(deg);
  return [pos[0] + dist * dx, pos[1] + dist * dy];
};

// ─── Proton cluster layout ───
// Pre-built tight packings so the dot count of an atom is unambiguous at a glance.
const PROTON_R_DEFAULT = 6;
const CLUSTER_R_DEFAULT = 16;

export function clusterPositions(n, clusterR = CLUSTER_R_DEFAULT) {
  if (n === 1) return [[0, 0]];
  if (n === 6) {
    return Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI) / 3 + Math.PI / 6;
      return [clusterR * Math.cos(a), clusterR * Math.sin(a)];
    });
  }
  if (n === 7) {
    // Hexagon + center
    const hex = Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI) / 3 + Math.PI / 6;
      return [clusterR * Math.cos(a), clusterR * Math.sin(a)];
    });
    return [[0, 0], ...hex];
  }
  if (n === 8) {
    const hex = Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI) / 3 + Math.PI / 6;
      return [clusterR * Math.cos(a), clusterR * Math.sin(a)];
    });
    return [[0, -clusterR * 0.45], [0, clusterR * 0.45], ...hex];
  }
  if (n === 15) {
    // Phosphorus: 14 around a ring + 1 center
    return [
      [0, 0],
      ...Array.from({ length: 14 }, (_, i) => {
        const a = (i * 2 * Math.PI) / 14;
        return [clusterR * Math.cos(a), clusterR * Math.sin(a)];
      }),
    ];
  }
  // Generic fallback: regular polygon
  return Array.from({ length: n }, (_, i) => {
    const a = (i * 2 * Math.PI) / n;
    return [clusterR * Math.cos(a), clusterR * Math.sin(a)];
  });
}

/**
 * Build SVG string from atoms + bonds.
 *   atoms: [{ id, el, pos: [x, y] }, …]
 *   bonds: [[atomId, atomId], …]
 *   opts:  { width=1024, height=1024, protonR=6, clusterR=16, bondColor='#3a9eff', bondWidth=3.5 }
 */
export function buildSvg(atoms, bonds, opts = {}) {
  const W = opts.width ?? 1024;
  const H = opts.height ?? 1024;
  const protonR = opts.protonR ?? PROTON_R_DEFAULT;
  const clusterR = opts.clusterR ?? CLUSTER_R_DEFAULT;
  const bondColor = opts.bondColor ?? "#3a9eff";
  const bondWidth = opts.bondWidth ?? 3.5;

  const atomById = Object.fromEntries(atoms.map(a => [a.id, a]));

  let svg = "";
  svg += `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">\n`;
  svg += `  <rect width="${W}" height="${H}" fill="#000000"/>\n`;

  // Bonds first
  svg += `  <g stroke="${bondColor}" stroke-width="${bondWidth}" stroke-linecap="round" fill="none">\n`;
  for (const [a, b] of bonds) {
    if (!atomById[a] || !atomById[b]) throw new Error(`Bond references unknown atom: ${a} or ${b}`);
    const [x1, y1] = atomById[a].pos;
    const [x2, y2] = atomById[b].pos;
    svg += `    <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>\n`;
  }
  svg += `  </g>\n`;

  // Atoms grouped by element (one <g fill=…> per element)
  const byEl = atoms.reduce((acc, a) => ((acc[a.el] ||= []).push(a), acc), {});
  for (const [el, group] of Object.entries(byEl)) {
    const color = ELEMENT_COLOR[el];
    if (!color) throw new Error(`No color defined for element ${el}`);
    svg += `  <g fill="${color}">\n`;
    for (const atom of group) {
      const n = PROTONS[el];
      if (!n) throw new Error(`No proton count for element ${el}`);
      for (const [dx, dy] of clusterPositions(n, clusterR)) {
        svg += `    <circle cx="${(atom.pos[0] + dx).toFixed(1)}" cy="${(atom.pos[1] + dy).toFixed(1)}" r="${protonR}"/>\n`;
      }
    }
    svg += `  </g>\n`;
  }

  svg += `</svg>\n`;
  return svg;
}

/**
 * Validate atom + bond list, write SVG and PNG to outDir/<slug>-diagram.{svg,png}.
 *   expectFormula: { C: 6, H: 12, O: 6 } for glucose, etc. Throws if mismatch.
 */
export async function renderDiagram({ slug, atoms, bonds, expectFormula, outDir, opts }) {
  // Sanity check formula
  const counts = {};
  for (const a of atoms) counts[a.el] = (counts[a.el] || 0) + 1;
  if (expectFormula) {
    for (const [el, n] of Object.entries(expectFormula)) {
      if (counts[el] !== n) {
        throw new Error(`${slug}: ${el} count is ${counts[el] ?? 0}, expected ${n}`);
      }
    }
    for (const el of Object.keys(counts)) {
      if (!(el in expectFormula)) {
        throw new Error(`${slug}: unexpected element ${el} (${counts[el]})`);
      }
    }
  }

  // Validate all bond endpoints exist
  const ids = new Set(atoms.map(a => a.id));
  const seen = new Set();
  for (const [a, b] of bonds) {
    if (!ids.has(a) || !ids.has(b)) throw new Error(`${slug}: bond ${a}-${b} references unknown atom`);
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (seen.has(key)) throw new Error(`${slug}: duplicate bond ${a}-${b}`);
    seen.add(key);
  }

  const svg = buildSvg(atoms, bonds, opts);
  mkdirSync(outDir, { recursive: true });
  const svgPath = join(outDir, `${slug}-diagram.svg`);
  const pngPath = join(outDir, `${slug}-diagram.png`);
  writeFileSync(svgPath, svg);
  await sharp(Buffer.from(svg)).png().toFile(pngPath);

  const formula = Object.entries(counts)
    .map(([el, n]) => `${el}${n}`)
    .join("");
  console.log(`✓ ${slug}: ${atoms.length} atoms (${formula}), ${bonds.length} bonds → ${pngPath}`);
  return { svgPath, pngPath, counts };
}
