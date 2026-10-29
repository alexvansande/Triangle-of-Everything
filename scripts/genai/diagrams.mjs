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

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PDB = path.join(HERE, "pdb"), OUT = path.join(HERE, "diagrams"), PROMPTS = path.join(HERE, "prompts");
for (const d of [PDB, OUT, PROMPTS]) fs.mkdirSync(d, { recursive: true });

// the Hopf molecules' nucleus colours (public/hopf/hopf-core.js ELEMENT_DOT), plus a few
const ELEMENT = { H: "#ffffff", C: "#c9bfa8", N: "#6f8fff", O: "#ff5a48", P: "#ffa030", S: "#ffd93a", FE: "#ff8c1a", ZN: "#9fa8b8" };
const CHAIN = ["#46dcff", "#9a5aff", "#7dffb0", "#ffb46e", "#ff6fae", "#e8f06a", "#6fa8ff", "#c0c0d0"];

async function cifOf(id) {
  const file = path.join(PDB, `${id}.cif`);
  if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
  const res = await fetch(`https://files.rcsb.org/download/${id}.cif`);
  if (!res.ok) throw Error(`RCSB ${id}: ${res.status}`);
  const text = await res.text();
  fs.writeFileSync(file, text);
  return text;
}
// mmCIF's atom_site loop: the first model, the first of any alternate positions
function atomsOf(cif) {
  const lines = cif.split("\n");
  const start = lines.findIndex(l => l.startsWith("_atom_site."));
  const cols = [];
  let i = start;
  for (; lines[i].startsWith("_atom_site."); i++) cols.push(lines[i].trim().slice(11));
  const c = name => cols.indexOf(name);
  const [X, Y, Z, EL, NAME, RES, CHAINC, SEQ, ALT, MODEL, GROUP] = ["Cartn_x", "Cartn_y", "Cartn_z", "type_symbol", "label_atom_id",
    "label_comp_id", "auth_asym_id", "auth_seq_id", "label_alt_id", "pdbx_PDB_model_num", "group_PDB"].map(c);
  const atoms = [];
  for (; i < lines.length && /^(ATOM|HETATM)/.test(lines[i]); i++) {
    const f = lines[i].match(/'[^']*'|"[^"]*"|\S+/g);
    if (f[MODEL] !== "1" || !(f[ALT] === "." || f[ALT] === "A")) continue;
    atoms.push({ el: f[EL].toUpperCase(), name: f[NAME].replace(/["']/g, ""), res: f[RES], chain: f[CHAINC], seq: +f[SEQ], het: f[GROUP] === "HETATM",
      p: [+f[X], +f[Y], +f[Z]] });
  }
  return atoms.filter(a => a.el !== "H" && a.el !== "D" && !/^(HOH|DOD)$/.test(a.res));   // no hydrogens, no water
}
// principal axes: widest across, next up, thinnest toward the viewer
function orient(atoms) {
  const n = atoms.length, m = [0, 1, 2].map(k => atoms.reduce((s, a) => s + a.p[k], 0) / n);
  const P = atoms.map(a => a.p.map((v, k) => v - m[k]));
  const C = [0, 1, 2].map(i => [0, 1, 2].map(j => P.reduce((s, p) => s + p[i] * p[j], 0)));
  const V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep = 0; sweep < 50; sweep++) for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
    if (Math.abs(C[p][q]) < 1e-9) continue;
    const th = 0.5 * Math.atan2(2 * C[p][q], C[q][q] - C[p][p]), c = Math.cos(th), s = Math.sin(th);
    for (let k = 0; k < 3; k++) { const a = C[k][p], b = C[k][q]; C[k][p] = c * a - s * b; C[k][q] = s * a + c * b; }
    for (let k = 0; k < 3; k++) { const a = C[p][k], b = C[q][k]; C[p][k] = c * a - s * b; C[q][k] = s * a + c * b; }
    for (let k = 0; k < 3; k++) { const a = V[k][p], b = V[k][q]; V[k][p] = c * a - s * b; V[k][q] = s * a + c * b; }
  }
  const ax = [0, 1, 2].sort((i, j) => C[j][j] - C[i][i]).map(i => [V[0][i], V[1][i], V[2][i]]);
  const [u, v] = ax;
  ax[2] = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  atoms.forEach((a, k) => { a.q = ax.map(e => e[0] * P[k][0] + e[1] * P[k][1] + e[2] * P[k][2]); });
}

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
