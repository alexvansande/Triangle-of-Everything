// =============================================================
// src-molecules.mjs — dust sources for the molecule → protein range
// (~1e-23 g … ~1e-18 g), between atoms and viruses.
// =============================================================
//   molecule  notable small molecules: Wikidata items with a PubChem CID
//             and ≥ 30 Wikipedia sitelinks → PubChem PUG-REST computed
//             properties (exact molecular weight; Volume3D of the
//             computed 3-D conformer → equivalent-sphere radius).
//   protein   proteins / complexes in solution: SASBDB small-angle
//             scattering entries (measured Guinier Rg; mass from the
//             sample's sequence composition, kept only when the SAXS-
//             measured molecular weight confirms it).
// =============================================================

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const CACHE = join(dirname(fileURLToPath(import.meta.url)), ".cache");
const REFRESH = process.argv.includes("--refresh");
const AMU = 1.66053906660e-24; // g per Da
const log = Math.log10;
const ok = (...xs) => xs.every((x) => Number.isFinite(x) && x > 0);
const sphereR = (vol) => Math.cbrt((3 * vol) / (4 * Math.PI)); // same unit³ → unit
const UA = "TriangleOfEverything-dust/1.0 (log-log mass-size chart build script; contact via GitHub repo)";

// Cached curl download with a User-Agent, optional POST body, and retry
// with backoff on 429/5xx (Wikidata's SPARQL endpoint 502s under load).
function download(url, file, { body, type } = {}) {
  mkdirSync(CACHE, { recursive: true });
  const p = join(CACHE, file);
  if (!REFRESH && existsSync(p)) return readFileSync(p, "utf8");
  console.log(`  ↓ ${file}`);
  const args = ["-sSL", "-m", "300", "-A", UA, "-o", p, "-w", "%{http_code}"];
  if (type) args.push("-H", `Accept: ${type}`);
  if (body) args.push("-X", "POST", "-H", "Content-Type: application/json", "--data-binary", body);
  for (let attempt = 0, wait = 5; ; attempt++, wait *= 2) {
    const code = execFileSync("curl", [...args, url], { encoding: "utf8" }).trim();
    if (code.startsWith("2")) return readFileSync(p, "utf8");
    if (attempt >= 4 || !/^(429|5\d\d)$/.test(code)) throw new Error(`HTTP ${code} for ${file}`);
    execFileSync("sleep", [String(wait)]);
  }
}

// "C6H12O6" → total atom count
const atomCount = (f) => [...f.matchAll(/([A-Z][a-z]?)(\d*)/g)].reduce((s, m) => s + (m[2] ? +m[2] : 1), 0);
const SUB = "₀₁₂₃₄₅₆₇₈₉";
const subscript = (f) => f.replace(/\d/g, (d) => SUB[+d]);
const ucfirst = (s) => (/^[a-z][a-z]/.test(s) ? s[0].toUpperCase() + s.slice(1) : s);

// Wikidata labels → the names hand-placed objects in objects.json use, so
// the build cross-checks them (and keeps the curated copy).
const MOL_ALIAS = {
  "Water": "Water (H₂O)", "Adenosine triphosphate": "ATP", "D-glucose": "Glucose", "Glucose": "Glucose",
  "Adenine": "Adenine (A)", "Guanine": "Guanine (G)", "Cytosine": "Cytosine (C)", "Thymine": "Thymine (T)",
  "Buckminsterfullerene": "Fullerene C₆₀",
};

export default [
  // ---------------------------------------------------------------
  {
    id: "molecule",
    label: "Molecule · PubChem (computed 3-D volume)",
    cat: "atomic",
    cite: "Selection: Wikidata items with a PubChem CID (P662) and ≥ 30 Wikipedia sitelinks. Mass & volume: NCBI PubChem PUG-REST (MolecularWeight; Volume3D of the first computed diverse conformer, Bolton et al. 2011, J. Cheminform. 3:32)",
    radius: "equivalent-sphere radius of PubChem's Volume3D, r = (3V/4π)^⅓ — a COMPUTED shape volume of a modelled conformer (≈ van der Waals volume), not a measurement; PubChem only models molecules with ≤ 50 heavy atoms, so larger molecules are absent",
    density: [-0.7, 1.3],
    anchors: [
      // water: 18.015 Da; PubChem Volume3D 14.7 Å³ → r = 1.52 Å
      { name: "Water (H₂O)", logM: log(18.015 * AMU), logR: log(1.52e-8), tol: 0.02 },
      { name: "Caffeine", logM: log(194.19 * AMU), tol: 0.002 },
    ],
    async load() {
      const q = "SELECT ?item ?cid ?n WHERE { ?item wdt:P662 ?cid; wikibase:sitelinks ?n. FILTER(?n >= 30) } LIMIT 5000";
      const wd = download("https://query.wikidata.org/sparql?query=" + encodeURIComponent(q), "wd-pubchem-items.csv", { type: "text/csv" });
      // one CID per item: the lowest (PubChem's parent / unspecified-stereo record)
      const cidOf = new Map();
      for (const l of wd.replace(/\r/g, "").trim().split("\n").slice(1)) {
        const [item, cid] = l.split(",");
        const qid = item.split("/").pop(), c = +cid;
        if (!/^Q\d+$/.test(qid) || !(c > 0)) continue;
        if (!cidOf.has(qid) || c < cidOf.get(qid)) cidOf.set(qid, c);
      }
      const qids = [...cidOf.keys()].sort((a, b) => +a.slice(1) - +b.slice(1));
      // English labels, 50 items per wbgetentities call
      const label = {};
      for (let i = 0; i < qids.length; i += 50) {
        const ids = qids.slice(i, i + 50);
        const j = JSON.parse(download(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels&languages=en&ids=${ids.join("|")}`,
          `wd-labels-${i / 50}.json`));
        for (const [id, e] of Object.entries(j.entities)) label[id] = e.labels?.en?.value;
      }
      // PubChem properties, 200 CIDs per call
      const cids = [...new Set(cidOf.values())].sort((a, b) => a - b);
      const prop = {};
      for (let i = 0; i < cids.length; i += 200) {
        const txt = download(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cids.slice(i, i + 200).join(",")}/property/MolecularFormula,MolecularWeight,Volume3D,CovalentUnitCount,Charge/CSV`,
          `pubchem-props-${i / 200}.csv`);
        for (const l of txt.trim().split("\n").slice(1)) {
          const c = l.split(",").map((s) => s.replace(/^"|"$/g, ""));
          prop[+c[0]] = { formula: c[1], mw: +c[2], vol: c[3] === "" ? NaN : +c[3], units: +c[4], charge: +c[5] };
        }
      }
      const elements = new Set(JSON.parse(download("https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON", "pubchem-periodic.json")).Table.Row.map((r) => r.Cell[2].toLowerCase()));
      const out = [];
      for (const qid of qids) {
        const p = prop[cidOf.get(qid)], lab = label[qid];
        if (!p || !lab) continue;
        // single covalent unit (no salts / mixtures), ≥ 2 atoms (bare
        // atoms are the "element" source), and a modelled 3-D volume
        if (p.units !== 1 || atomCount(p.formula) < 2 || !ok(p.mw, p.vol)) continue;
        let name = ucfirst(lab);
        // Wikidata "oxygen" (the element item) carries O₂'s CID — say so
        if (elements.has(lab.toLowerCase())) name = `${name} (${subscript(p.formula)})`;
        name = MOL_ALIAS[name] || name;
        out.push({ name, logR: log(sphereR(p.vol) * 1e-8), logM: log(p.mw * AMU) });
      }
      return out;
    },
  },
  // ---------------------------------------------------------------
  {
    id: "protein",
    label: "Protein · SASBDB (SAXS radius of gyration)",
    cat: "atomic",
    cite: "SASBDB — Small Angle Scattering Biological Data Bank (Kikhney et al. 2020, Protein Sci. 29:66), REST API entry summaries; X-ray (SAXS) protein entries",
    radius: "uniform-sphere equivalent of the measured Guinier radius of gyration, R = √(5/3)·Rg (exact for a solid sphere; for elongated or flexible molecules it is the radius of the sphere with the same Rg)",
    density: [-2.5, 0.6],
    anchors: [],
    async load() {
      const codes = JSON.parse(download("https://www.sasbdb.org/rest-api/entry/codes/molecular_type/protein/", "sasbdb-protein-codes.json"))
        .filter((e) => e.status === "Published").map((e) => e.code).sort();
      const entries = [];
      for (let i = 0; i < codes.length; i += 200) {
        const file = `sasbdb-summary-${i / 200}.json`;
        const p = join(CACHE, file);
        if (REFRESH || !existsSync(p)) {
          // fetch the batch, keep only the fields we use (the raw summaries are ~5 KB each)
          const raw = JSON.parse(download("https://www.sasbdb.org/rest-api/entry/summary/list/", file,
            { body: JSON.stringify({ codes: codes.slice(i, i + 200).join(",") }) }));
          writeFileSync(p, JSON.stringify(raw.map(slim)));
        }
        entries.push(...JSON.parse(readFileSync(p, "utf8")));
      }
      this._entries = entries;
      return [];
    },
  },
];

function slim(e) {
  const s = e.experiment?.sample || {};
  return {
    code: e.code, source: e.experiment?.instrument?.type_of_source, name: s.name, mixture: s.mixture,
    mol: (s.molecule || []).map((m) => ({ long: m.long_name, short: m.short_name, org: m.organism, uni: m.uniprot_code,
      type: m.molecular_type, mw: m.mw, total: m.total_mw, n: m.number_molecules, olig: m.oligomerization, deut: m.deuteration })),
    rg: e.guinier_rg, rgErr: e.guinier_rg_error, prg: e.pddf_rg, dmax: e.pddf_dmax,
    mwExp: e.experimental_mw, mwExpErr: e.experimental_mw_error, mwI0: e.guinier_i0_mw, mwPorod: e.porod_mw,
  };
}
