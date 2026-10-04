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
      const cidOf = new Map(), links = new Map();
      for (const l of wd.replace(/\r/g, "").trim().split("\n").slice(1)) {
        const [item, cid, n] = l.split(",");
        const qid = item.split("/").pop(), c = +cid;
        if (!/^Q\d+$/.test(qid) || !(c > 0)) continue;
        if (!cidOf.has(qid) || c < cidOf.get(qid)) cidOf.set(qid, c);
        links.set(qid, +n);
      }
      // two items sharing a CID ("hydrogen iodide" / "hydroiodic acid"): keep the better-known one
      const byCid = new Map();
      for (const [qid, c] of cidOf) if (!byCid.has(c) || links.get(qid) > links.get(byCid.get(c))) byCid.set(c, qid);
      const qids = [...byCid.values()].sort((a, b) => +a.slice(1) - +b.slice(1));
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
    anchors: [
      // hen egg-white lysozyme: 14.3 kDa, Rg ≈ 1.4–1.5 nm (textbook SAXS standard)
      { name: "Lysozyme C", logM: log(14.3e3 * AMU), logR: log(Math.sqrt(5 / 3) * 1.45e-7), tol: 0.05 },
      // bovine serum albumin: 66.4 kDa mature (SASBDB lists the 69.4 kDa precursor sequence), Rg ≈ 2.8–3.0 nm
      { name: "Bovine Serum Albumin", logM: log(66.4e3 * AMU), logR: log(Math.sqrt(5 / 3) * 2.9e-7), tol: 0.05 },
    ],
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
      // name → candidate entries (one protein is often measured many times)
      const groups = new Map();
      for (const e of entries) {
        if (!/^X-ray/.test(e.source || "") || e.mixture) continue;            // SAXS only (SANS Rg depends on contrast)
        if (!e.mol.length || e.mol.some((m) => m.deut)) continue;            // no deuterated samples
        const rg = +e.rg, prg = +e.prg, mExp = +e.mwExp;
        const mSeq = e.mol.reduce((s, m) => s + (+m.total || 0), 0);          // kDa, composition × copy number
        if (!ok(rg, mSeq, mExp)) continue;
        if (ok(+e.rgErr) && e.rgErr / rg > 0.05) continue;                   // Rg to ±5 %
        if (ok(prg) && Math.abs(log(prg / rg)) > 0.05) continue;             // Guinier and P(r) Rg agree (±12 %)
        if (Math.abs(log(mExp / mSeq)) > 0.1) continue;                      // SAXS MW confirms the stated composition (±26 %)
        const name = proteinName(e);
        if (!name) continue;
        if (!groups.has(name)) groups.set(name, []);
        groups.get(name).push({ name, logR: log(Math.sqrt(5 / 3) * rg * 1e-7), logM: log(mSeq * 1e3 * AMU), code: e.code });
      }
      // one dot per name: the entry with the median radius (ties → lowest code)
      const out = [];
      for (const g of groups.values()) {
        g.sort((a, b) => a.logR - b.logR || a.code.localeCompare(b.code));
        out.push(g[(g.length - 1) >> 1]);
      }
      return out;
    },
  },
];

// Readable name: the molecule's long name (+ oligomeric state), or the
// sample title for multi-component complexes.
const PROT_ALIAS = { "Immunoglobulin G subclass 1": "Antibody (IgG)" }; // curated "Antibody (IgG)" is a whole IgG1-like antibody
function proteinName(e) {
  const tidy = (t) => {
    t = String(t || "").replace(/\s+/g, " ").trim();
    if (t.length > 5 && t === t.toUpperCase()) t = t[0] + t.slice(1).toLowerCase(); // "INTERLEUKIN 8" → "Interleukin 8"
    return t;
  };
  if (e.mol.length === 1) {
    const m = e.mol[0], base = tidy(m.long || m.short);
    if (!base) return "";
    if (PROT_ALIAS[base] && +m.total < 1.2 * m.mw) return PROT_ALIAS[base];
    const olig = String(m.olig || "").trim();
    return olig && !/^(monomer|other|unknown)$/i.test(olig) && !base.toLowerCase().includes(olig.toLowerCase()) ? `${base} (${olig})` : base;
  }
  const names = e.mol.map((m) => tidy(m.long || m.short));
  const joined = names.join(" + ");
  // sample titles sometimes end in the measured concentration ("… @ 3.0mg/mL", "…, 37.2 μM")
  return names.every(Boolean) && joined.length <= 70 ? joined
    : tidy(e.name).replace(/\s*[@,]\s*[\d.]+\s*(mg\/ml|[µμu]M|mM)\b.*$/i, "");
}

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
