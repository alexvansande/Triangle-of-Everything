// =============================================================
// src-life.mjs — living things between ~1e-13 g and ~10 kg
// =============================================================
// Fills the gap between viruses and PanTHERIA's mammals with real,
// individually named species:
//
//   bacterium  bacteria & archaea   — Madin et al. 2020 (cell dimensions)
//   cell       phytoplankton/protists — HELCOM PEG biovolume list (Olenina et al. 2006, 2026 release)
//   insect     bees & hoverflies    — Kendall et al. 2019 (pollimetry: body length + dry weight per specimen)
//   moth       British moths        — Kinsella et al. 2020 (forewing length + dry mass per specimen)
//   amphibian  frogs, salamanders, caecilians — AmphiBIO (Oliveira et al. 2017)
//
// What is measured vs derived is written in each `radius`/`cite`, and
// every derived quantity is flagged in the tooltip `label`:
//   • cells: dimensions measured, mass = geometric volume × cell density
//   • insects/moths: length and DRY mass measured on the same specimens;
//     wet mass = dry / 0.35 (insect water content 60–70 % of live mass,
//     Studier & Sevick 1992, Comp. Biochem. Physiol. A 103:579, n = 360 spp.)
//   • amphibians: both measured (maximum adult mass and length)
//
// Binary downloads (zip / xlsx / R .rdata) are cached in .cache/ with
// curl and unpacked with unzip / xz — no npm dependencies.
// =============================================================

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CACHE = join(dirname(fileURLToPath(import.meta.url)), ".cache");
const log = Math.log10;
const num = (s) => {
  if (s == null) return NaN;
  const t = String(s).trim();
  if (t === "" || t === "NA" || t === "-" || t === "NaN") return NaN;
  return Number(t);
};
const ok = (...xs) => xs.every((x) => Number.isFinite(x) && x > 0);
const clean = (s) => String(s).replace(/\s+/g, " ").trim();
const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;

// Cell density used to turn measured cell volume into mass: 1.1 g/cm³ —
// the buoyant density of E. coli (≈1.10 g/mL, Kubitschek, Baldwin &
// Graetzer 1983, J. Bacteriol. 155:1027) and within the 1.03–1.1 g/cm³
// measured for phytoplankton cytoplasm (Reynolds 2006, The Ecology of
// Phytoplankton, §2.5). The choice moves dots by ≤ 0.03 dex.
const CELL_RHO = 1.1;
const UM3 = 1e-12; // cm³ per µm³
// Insect dry/wet ratio (Studier & Sevick 1992, see header)
const DRY_PER_WET = 0.35;

// Cached binary download (zip, xlsx, rdata): curl into .cache/
function download(url, file) {
  const p = join(CACHE, file);
  if (!existsSync(p) || process.argv.includes("--refresh")) {
    console.log(`  ↓ ${file}`);
    execFileSync("curl", ["-sSfL", "--retry", "3", "-m", "600", "-o", p, url], { stdio: "inherit" });
  }
  return p;
}

// Simple quoted-CSV parser → array of objects
function csvRows(text, delim = ",") {
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === delim) { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const head = rows[0].map((h) => h.replace(/^﻿/, "").trim());
  return rows.slice(1).filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

// ---- minimal .xlsx reader (unzip + regex over the sheet XML) ----
const unz = (zip, inner) => execFileSync("unzip", ["-p", zip, inner], { maxBuffer: 1 << 29 }).toString("utf8");
const ent = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&amp;/g, "&");
function xlsxSheet(zip, sheetName) {
  const wb = unz(zip, "xl/workbook.xml");
  const rels = unz(zip, "xl/_rels/workbook.xml.rels");
  const sh = [...wb.matchAll(/<sheet [^>]*?name="([^"]+)"[^>]*?r:id="([^"]+)"/g)].find((m) => ent(m[1]) === sheetName);
  if (!sh) throw new Error(`sheet "${sheetName}" not found`);
  const rel = [...rels.matchAll(/<Relationship [^>]*>/g)].map((m) => m[0]).find((r) => r.includes(`Id="${sh[2]}"`));
  const path = "xl/" + rel.match(/Target="([^"]+)"/)[1].replace(/^\/?xl\//, "");
  const ss = [...unz(zip, "xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)]
    .map((m) => ent([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]).join("")));
  const rows = [];
  for (const rm of unz(zip, path).matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const row = [];
    for (const cm of rm[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const col = [...cm[1]].reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0) - 1;
      const v = (cm[3] || "").match(/<v>([\s\S]*?)<\/v>/);
      let val = v ? v[1] : "";
      if (/t="s"/.test(cm[2])) val = ss[+val];
      else if (/t="inlineStr"/.test(cm[2])) val = ent(((cm[3] || "").match(/<t[^>]*>([\s\S]*?)<\/t>/) || [, ""])[1]);
      else val = ent(val);
      row[col] = val;
    }
    rows.push(row);
  }
  const head = Array.from(rows[0], (h) => clean(h ?? ""));
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

// ---- minimal R .rdata (XDR, format 2/3) reader → { objectName: value } ----
// Enough for data.frames of numbers, strings and factors.
function readRData(buf) {
  if (!/^RDX[23]\nX\n/.test(buf.slice(0, 7).toString("latin1"))) throw new Error("not an XDR .rdata file");
  let p = 7;
  const int = () => { const v = buf.readInt32BE(p); p += 4; return v; };
  const ver = int(); int(); int();
  if (ver === 3) { const n = int(); p += n; } // native encoding name
  const refs = [];
  function item() {
    const flags = int(), type = flags & 0xff, hasAttr = flags & 0x200, hasTag = flags & 0x400;
    const withAttr = (a) => {
      if (hasAttr) { a.attrs = {}; for (const e of item().pairlist) a.attrs[e.tag] = e.value; }
      return a;
    };
    switch (type) {
      case 254: case 242: return null;                       // NILVALUE, EMPTYENV
      case 253: return {};                                    // GLOBALENV
      case 255: return refs[(flags >> 8) - 1];                // REFSXP
      case 1: { const s = item(); refs.push(s); return s; }   // SYMSXP
      case 9: { const n = int(); if (n === -1) return null; const s = buf.slice(p, p + n).toString("utf8"); p += n; return s; }
      case 2: {                                               // pairlist
        const out = [];
        let a = hasAttr, t = hasTag;
        for (;;) {
          if (a) item();
          const tag = t ? item() : null;
          out.push({ tag, value: item() });
          const f = int();
          if ((f & 0xff) === 254) break;
          if ((f & 0xff) !== 2) throw new Error("bad pairlist");
          a = f & 0x200; t = f & 0x400;
        }
        return { pairlist: out };
      }
      case 14: { const n = int(), a = []; for (let i = 0; i < n; i++) { const na = buf.readUInt32BE(p) === 0x7ff00000 && buf.readUInt32BE(p + 4) === 1954; a.push(na ? NaN : buf.readDoubleBE(p)); p += 8; } return withAttr(a); }
      case 13: case 10: { const n = int(), a = []; for (let i = 0; i < n; i++) { const v = int(); a.push(v === -2147483648 ? NaN : v); } return withAttr(a); }
      case 16: case 19: { const n = int(), a = []; for (let i = 0; i < n; i++) a.push(item()); return withAttr(a); }
      default: throw new Error(`unsupported R type ${type}`);
    }
  }
  const out = {};
  for (const e of item().pairlist) out[e.tag] = e.value;
  return out;
}
function rFrame(v) {
  const cols = {};
  v.attrs.names.forEach((n, i) => {
    let c = v[i];
    if (c.attrs?.levels) { const L = c.attrs.levels; c = c.map((k) => (Number.isFinite(k) ? L[k - 1] : null)); }
    cols[n] = c;
  });
  return cols;
}

// A binomial "Genus species" with no placeholders (sp., cf., morphospecies codes)
const isBinomial = (s) => /^[A-Z][a-z]+ [a-z][a-z-]+$/.test(s) && !/^\S+ (sp|spp|cf|aff|nr|indet)$/.test(s);

export default [
  // ---------------------------------------------------------------
  {
    id: "bacterium",
    label: "Bacterium/archaeon · Madin 2020 (mass from volume)",
    cat: "micro",
    cite: "Madin et al. (2020) A synthesis of bacterial and archaeal phenotypic trait data, Scientific Data 7:170 — condensed_species_NCBI.csv (cell diameter d1 and length d2, µm, compiled from species descriptions). Mass derived: capsule volume × 1.1 g/cm³ (E. coli buoyant density, Kubitschek et al. 1983)",
    url: "https://raw.githubusercontent.com/bacteria-archaea-traits/bacteria-archaea-traits/396dcd4d98ca20b613ba280f5514611651b6fb91/output/condensed_species_NCBI.csv",
    radius: "half the measured cell length (rods) or diameter (cocci); mass = capsule volume π/4·d1²·(d2−d1) + π/6·d1³ (midpoints of the reported ranges) × 1.1 g/cm³ — rods, cocci, coccobacilli and vibrios only",
    density: [-4.5, 0.3],
    anchors: [
      // B. subtilis: d1 0.7–0.8, d2 2–3 µm → d1 0.75, d2 2.5 µm
      { name: "Bacillus subtilis", logR: log(1.25e-4), logM: log((Math.PI / 4 * 0.75 ** 2 * (2.5 - 0.75) + Math.PI / 6 * 0.75 ** 3) * UM3 * CELL_RHO), tol: 0.01 },
      // Thiomargarita namibiensis, the giant sulfur bacterium: 750 µm sphere
      { name: "Thiomargarita namibiensis", logR: log(375e-4), logM: log(Math.PI / 6 * 750 ** 3 * UM3 * CELL_RHO), tol: 0.01 },
    ],
    async load(fetchText) {
      const rows = csvRows(await fetchText(this.url, "madin2020-species.csv"));
      const SHAPES = new Set(["bacillus", "coccus", "coccobacillus", "vibrio"]);
      const mid = (lo, up) => (ok(lo) && ok(up) ? (lo + up) / 2 : ok(lo) ? lo : up);
      const out = [];
      for (const x of rows) {
        const shape = clean(x.cell_shape || "");
        if (!SHAPES.has(shape)) continue;
        const name = clean(x.species);
        if (!isBinomial(name)) continue;
        const d1 = mid(num(x.d1_lo), num(x.d1_up));
        let d2 = mid(num(x.d2_lo), num(x.d2_up));
        if (!ok(d1)) continue;
        if (!ok(d2)) { if (shape !== "coccus") continue; d2 = d1; }
        if (d2 < d1) continue; // length shorter than width: inconsistent entry
        const vol = Math.PI / 4 * d1 * d1 * (d2 - d1) + Math.PI / 6 * d1 ** 3; // µm³
        out.push({ name, logR: log(d2 / 2 * 1e-4), logM: log(vol * UM3 * CELL_RHO) });
      }
      return out;
    },
  },
  // ---------------------------------------------------------------
  {
    id: "cell",
    label: "Microalga/protist · HELCOM PEG (mass from volume)",
    cat: "micro",
    cite: "HELCOM PEG phytoplankton biovolume list, PEG_BVOL2026 (ICES; Olenina et al. 2006, HELCOM Balt. Sea Environ. Proc. 106) — measured cell dimensions per size class and the geometric-shape volume. Mass derived: volume × 1.1 g/cm³",
    url: "https://www.ices.dk/data/Documents/ENV/PEG_BVOL.zip",
    radius: "half the largest measured cell dimension (length, diameter or height) of the species' median size class; single cells only (counting unit = cell); mass = the list's calculated cell volume × 1.1 g/cm³",
    density: [-4.5, 0.3],
    anchors: [
      // Aphanocapsa delicatissima, size class 1: sphere d = 0.85 µm
      { name: "Aphanocapsa delicatissima", logR: log(0.425e-4), logM: log(Math.PI / 6 * 0.85 ** 3 * UM3 * CELL_RHO), tol: 0.01 },
      // Noctiluca scintillans (sea sparkle): textbook cell diameter ~0.4 mm (0.2–2 mm)
      { name: "Noctiluca scintillans", logR: log(0.02), tol: 0.3 },
    ],
    async load() {
      const zip = download(this.url, "peg_bvol.zip");
      const inner = execFileSync("unzip", ["-Z1", zip]).toString().split("\n").find((f) => /^PEG_BVOL\d*\.xlsx$/.test(f.trim())).trim();
      const xlsx = join(CACHE, "peg_bvol.xlsx");
      execFileSync("unzip", ["-o", "-q", "-j", zip, inner, "-d", CACHE]);
      execFileSync("mv", ["-f", join(CACHE, inner), xlsx]);
      const rows = xlsxSheet(xlsx, "Biovolume file");
      const H = Object.keys(rows[0]);
      const col = (re) => H.find((h) => re.test(h));
      const cVol = col(/^Calculated_volume_µm3 \(with formula\)/), cUnit = "Unit", cN = col(/^No_of_cells/);
      const dims = [/^Length\(l1\)/, /^Length\(l2\)/, /^Width\(w\)/, /^Height\(h\)/, /^Diameter\(d1\)/, /^Diameter\(d2\)/].map(col);
      const bySpecies = new Map();
      for (const x of rows) {
        const name = clean(x.Species);
        if (!isBinomial(name) || clean(x.SFLAG) || clean(x.STAGE)) continue; // sp./spp./cf. flags, life stages
        if (clean(x[cUnit]) !== "cell" || num(x[cN]) !== 1) continue;           // single cells only
        if (clean(x["WORMS Rank"]) && clean(x["WORMS Rank"]) !== "Species") continue;
        const vol = num(x[cVol]);
        const L = Math.max(...dims.map((c) => num(x[c])).filter(Number.isFinite));
        if (!ok(vol, L)) continue;
        if (!bySpecies.has(name)) bySpecies.set(name, []);
        bySpecies.get(name).push({ vol, L, cls: num(x.SizeClassNo) });
      }
      const out = [];
      for (const [name, cls] of bySpecies) {
        // median size class by volume (lower median for even counts) — deterministic
        cls.sort((a, b) => a.vol - b.vol || a.cls - b.cls);
        const c = cls[(cls.length - 1) >> 1];
        out.push({ name, logR: log(c.L / 2 * 1e-4), logM: log(c.vol * UM3 * CELL_RHO) });
      }
      return out;
    },
  },
  // ---------------------------------------------------------------
  {
    id: "insect",
    label: "Bee/hoverfly · Kendall 2019 (wet from dry mass)",
    cat: "macro",
    cite: "Kendall et al. (2019) Pollinator size and its consequences, Ecol. Evol. 9:1702 — pollimetry_dataset (R package pollimetry): body length and dry weight of the same pinned specimens. Wet mass = dry / 0.35 (Studier & Sevick 1992)",
    url: "https://raw.githubusercontent.com/liamkendall/pollimetry/0d8ff0ae3bb997b5e3beecfcb11a17320dc4d212/data/pollimetry_dataset.rdata",
    radius: "half the species-mean body length (specimens with both length and dry weight measured); mass = species-mean dry weight ÷ 0.35",
    density: [-2.5, 0.5],
    anchors: [
      // Western honey bee worker: ~12 mm, ~100 mg live (textbook). The dataset's
      // 21 mg dry ÷ 0.35 gives 61 mg (−0.22 dex): honey bees hold more water
      // than the 35 % insect average — tol 0.3 still catches mg/g/µg slips.
      { name: "Apis mellifera", logR: log(0.6), logM: log(0.1), tol: 0.3 },
    ],
    async load() {
      const f = download(this.url, "pollimetry_dataset.rdata");
      const df = rFrame(readRData(execFileSync("xz", ["-dc", f], { maxBuffer: 1 << 28 })).pollimetry_dataset);
      const sp = new Map();
      df.Species.forEach((s, i) => {
        const name = clean(String(s).replace(/_/g, " "));
        const bl = df.BL[i], dw = df["Spec.wgt"][i];
        if (!isBinomial(name) || !ok(bl, dw)) return;
        if (!sp.has(name)) sp.set(name, { bl: [], dw: [] });
        sp.get(name).bl.push(bl); sp.get(name).dw.push(dw);
      });
      const out = [];
      for (const [name, v] of sp) {
        const mg = mean(v.dw) / DRY_PER_WET;
        out.push({ name, logR: log(mean(v.bl) / 10 / 2), logM: log(mg / 1000) });
      }
      return out;
    },
  },
  // ---------------------------------------------------------------
  {
    id: "moth",
    label: "Moth · Kinsella 2020 (wet from dry mass)",
    cat: "macro",
    cite: "Kinsella et al. (2020) Unlocking the potential of historical abundance datasets to study biomass change in flying insects, Ecol. Evol. 10:8394 — moth_data.csv: forewing length and oven-dry mass of the same field-caught British moths. Wet mass = dry / 0.35 (Studier & Sevick 1992)",
    url: "https://raw.githubusercontent.com/CallumJMacgregor/KinsellaBiomass/10f1fbcd273e484524d050b93c6fd884548b8a89/moth_data.csv",
    radius: "half the species-mean forewing length (≈ the length of the moth at rest, wings folded); mass = species-mean dry mass ÷ 0.35",
    density: [-3, 0.3],
    anchors: [
      // Peppered moth: one specimen, 74.3 mg dry, forewing 20 mm (parse check) …
      { name: "Biston betularia", logR: log(1.0), logM: log(74.3 / DRY_PER_WET / 1000), tol: 0.01 },
      // … and textbook forewing ≈ 24 mm (wingspan 45–62 mm)
      { name: "Biston betularia", logR: log(1.2), tol: 0.15 },
    ],
    async load(fetchText) {
      const rows = csvRows(await fetchText(this.url, "kinsella2020-moths.csv"));
      const sp = new Map();
      for (const x of rows) {
        const name = clean(x.BINOMIAL).replace(/ \([A-Z][a-z]+\)/, ""); // drop subgenus
        const fw = num(x.FOREWING_LENGTH), dm = num(x.DRY_MASS);
        if (!isBinomial(name) || !ok(fw, dm)) continue;
        if (!sp.has(name)) sp.set(name, { fw: [], dm: [] });
        sp.get(name).fw.push(fw); sp.get(name).dm.push(dm);
      }
      // Species also in LEPSIZE (src-lepidoptera.mjs) are plotted there, by
      // body length like the other insects — this source sizes by forewing.
      const { lepsizeSpecies } = await import("./src-lepidoptera.mjs");
      const inLepsize = lepsizeSpecies();
      const out = [];
      for (const [name, v] of sp) {
        if (inLepsize.has(name)) continue;
        out.push({ name, logR: log(mean(v.fw) / 10 / 2), logM: log(mean(v.dm) / DRY_PER_WET / 1000) });
      }
      return out;
    },
  },
  // ---------------------------------------------------------------
  {
    id: "amphibian",
    label: "Amphibian species · AmphiBIO",
    cat: "macro",
    cite: "Oliveira et al. (2017) AmphiBIO, a global database for amphibian ecological traits, Scientific Data 4:170123 (figshare 4644424) — maximum adult body mass and body size",
    url: "https://ndownloader.figshare.com/files/8828578",
    radius: "half the maximum adult body size: snout–vent length for frogs and toads, total length for salamanders and caecilians (as AmphiBIO reports them)",
    density: [-4.5, 0.5],
    anchors: [
      { name: "Conraua goliath", logR: log(32 / 2), logM: log(3250), tol: 0.05 },        // Goliath frog: SVL 32 cm, 3.25 kg
      { name: "Andrias japonicus", logR: log(136 / 2), logM: log(26000), tol: 0.05 },    // Japanese giant salamander: 1.36 m, 26 kg
    ],
    async load() {
      const zip = download(this.url, "amphibio.zip");
      const txt = execFileSync("unzip", ["-p", zip, "AmphiBIO_v1.csv"], { maxBuffer: 1 << 26 }).toString("latin1");
      const out = [];
      for (const x of csvRows(txt)) {
        const m = num(x.Body_mass_g), L = num(x.Body_size_mm), mat = num(x.Size_at_maturity_max_mm);
        const name = clean(x.Species);
        if (!ok(m, L) || !isBinomial(name)) continue;
        // Quality cuts for transcription slips in the compilation:
        if (m === L) continue;                                            // mass column holds the length value
        if (x.Order === "Anura" && m / (L / 10) ** 3 > 0.3) continue;      // heavier than a frog-shaped body can be (g/cm³ of SVL³)
        if (ok(mat) && L / mat > (x.Order === "Anura" ? 3 : 5)) continue;  // "max size" ≫ size at maturity
        out.push({ name, logR: log(L / 10 / 2), logM: log(m) });
      }
      return out;
    },
  },
];
