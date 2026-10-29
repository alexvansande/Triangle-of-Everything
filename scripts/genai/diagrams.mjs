#!/usr/bin/env node
// Geometry references for the big molecules, to hand an image generator with the
// style references (scripts/genai/refs.mjs): each structure from the Protein Data
// Bank (mmCIF, cached in scripts/genai/pdb/), turned to its principal axes and
// drawn as a plain SVG → PNG: every nucleus a small dot in its element's colour
// (the Hopf molecules' colours), each chain's backbone a line in its own colour,
// on black. Writes scripts/genai/diagrams/<slug>.{svg,png} and prompts/<slug>.md.
//
//   node scripts/genai/diagrams.mjs            # every subject
//   node scripts/genai/diagrams.mjs dna        # one
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { SUBJECTS, promptFor } from "./subjects.mjs";
import { cifOf, atomsOf, orient } from "../molecules/pdb.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "diagrams"), PROMPTS = path.join(HERE, "prompts");
for (const d of [OUT, PROMPTS]) fs.mkdirSync(d, { recursive: true });

// the Hopf molecules' nucleus colours (public/hopf/hopf-core.js ELEMENT_DOT), plus a few
const ELEMENT = { H: "#ffffff", C: "#c9bfa8", N: "#6f8fff", O: "#ff5a48", P: "#ffa030", S: "#ffd93a", FE: "#ff8c1a", ZN: "#9fa8b8" };
const CHAIN = ["#46dcff", "#9a5aff", "#7dffb0", "#ffb46e", "#ff6fae", "#e8f06a", "#6fa8ff", "#c0c0d0"];

function svgOf(atoms, s) {
  const W = 1024, pad = 70;
  // (loops, not Math.max(...): a ribosome has too many atoms to spread)
  let ext = 0, z0 = Infinity, z1 = -Infinity;
  for (const a of atoms) { ext = Math.max(ext, Math.abs(a.q[0]), Math.abs(a.q[1])); z0 = Math.min(z0, a.q[2]); z1 = Math.max(z1, a.q[2]); }
  const k = (W / 2 - pad) / ext;
  const X = a => (W / 2 + a.q[0] * k).toFixed(1), Y = a => (W / 2 - a.q[1] * k).toFixed(1);
  const depth = a => 0.35 + 0.65 * (a.q[2] - z0) / (z1 - z0 || 1);   // far atoms dimmer
  const chains = [...new Set(atoms.map(a => a.chain))];
  // backbones: consecutive backbone atoms of a chain, broken where the gap is too long
  const lines = [];
  for (const [ci, ch] of chains.entries()) {
    const bb = atoms.filter(a => a.chain === ch && !a.het && s.backbone.includes(a.name)).sort((a, b) => a.seq - b.seq);
    for (let i = 1; i < bb.length; i++) {
      const a = bb[i - 1], b = bb[i];
      if (Math.hypot(...a.p.map((v, j) => v - b.p[j])) > 8) continue;
      lines.push(`<line x1="${X(a)}" y1="${Y(a)}" x2="${X(b)}" y2="${Y(b)}" stroke="${CHAIN[ci % CHAIN.length]}" stroke-width="${s.line ?? 2.2}" stroke-opacity="${(0.5 + 0.5 * depth(a)).toFixed(2)}" stroke-linecap="round"/>`);
    }
  }
  const shown = s.backboneOnly ? atoms.filter(a => s.backbone.includes(a.name) || a.het) : atoms;
  const dots = shown.sort((a, b) => a.q[2] - b.q[2]).map(a => {
    const r = (s.dot ?? 1.6) * (a.het && a.el === "FE" ? 4 : 1);
    return `<circle cx="${X(a)}" cy="${Y(a)}" r="${r}" fill="${ELEMENT[a.el] || "#d0d0d0"}" fill-opacity="${depth(a).toFixed(2)}"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}"><rect width="100%" height="100%" fill="#000"/>${lines.join("")}${dots.join("")}</svg>`;
}

const only = process.argv.slice(2);
for (const [slug, s] of Object.entries(SUBJECTS)) {
  if (only.length && !only.includes(slug)) continue;
  const atoms = atomsOf(await cifOf(s.pdb)).filter(a => !s.chains || s.chains.test(a.chain));
  orient(atoms);
  const svg = svgOf(atoms, s);
  fs.writeFileSync(path.join(OUT, `${slug}.svg`), svg);
  await sharp(Buffer.from(svg), { limitInputPixels: false }).png().toFile(path.join(OUT, `${slug}.png`));
  const chains = new Set(atoms.map(a => a.chain)).size;
  fs.writeFileSync(path.join(PROMPTS, `${slug}.md`), promptFor(slug, s, { atoms: atoms.length, chains }));
  console.log(`${slug}: ${s.pdb}, ${atoms.length} heavy atoms in ${chains} chains`);
}
