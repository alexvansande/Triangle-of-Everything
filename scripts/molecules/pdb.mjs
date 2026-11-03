// Structures from the Protein Data Bank: mmCIF downloads (cached in
// scripts/genai/pdb/, not in git), their heavy atoms, and their principal axes.
// Shared by scripts/genai/diagrams.mjs and scripts/molecules/build-big-molecules.mjs.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const PDB = path.join(path.dirname(fileURLToPath(import.meta.url)), "../genai/pdb");

export async function cifOf(id) {
  fs.mkdirSync(PDB, { recursive: true });
  const file = path.join(PDB, `${id}.cif`);
  if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
  const res = await fetch(`https://files.rcsb.org/download/${id}.cif`);
  if (!res.ok) throw Error(`RCSB ${id}: ${res.status}`);
  const text = await res.text();
  fs.writeFileSync(file, text);
  return text;
}
// mmCIF's atom_site loop: the first model, the first of any alternate positions
export function atomsOf(cif) {
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
export function orient(atoms) {
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

