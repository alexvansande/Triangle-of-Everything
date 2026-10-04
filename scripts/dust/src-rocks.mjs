// =============================================================
// src-rocks.mjs — rocks from a gram-sized meteorite to km-sized
// near-Earth asteroids (fills ~1e-2 g … 1e17 g on the planet branch)
// =============================================================
// Two sources:
//   meteorite           Meteoritical Bulletin masses (NASA "Meteorite
//                       Landings"); size DERIVED from the measured bulk
//                       density of the meteorite's class.
//   smallbody-measured  Small asteroids whose mass was MEASURED (binary
//                       mutual orbits from radar, DART) — a cited hand
//                       table, skipping bodies already in JPL SBDB
//                       ("smallbody" source).
// =============================================================

const log = Math.log10;
const SPHERE = (4 * Math.PI) / 3;

// Measured mean BULK density (g/cm³) per class. Stones: Britt & Consolmagno
// (2003, MAPS 38, 1161) as summarised in Britt & Consolmagno (2004, LPSC
// XXXV #2108, "Meteorite porosities and densities: a review of trends in the
// data"). Irons: Consolmagno & Britt (2013, MetSoc #5128) measure 7.47–7.96
// g/cm³ for whole irons (inclusion-free metal 7.85–7.9) → 7.8 adopted.
// Classes left out: CI (too few, discordant measurements), CK and
// chassignite (only grain densities), ungrouped/anomalous stones, lunar,
// ambiguous types (H/L, L/LL, "OC", "Stone-uncl"), melt rocks and relicts.
const CLASS_RHO = [
  [/^H(\d(\.\d+)?([-/]\d(\.\d+)?)?|~\d)?$/, 3.40, "H chondrite"],
  [/^L(\d(\.\d+)?([-/]\d(\.\d+)?)?|~\d)?$/, 3.35, "L chondrite"],
  [/^LL(\d(\.\d+)?([-/]\d(\.\d+)?)?|~\d)?$/, 3.21, "LL chondrite"],
  [/^EH(\d(\.\d+)?([-/]\d(\.\d+)?)?)?$/, 3.72, "EH chondrite"],
  [/^EL(\d(\.\d+)?([-/]\d(\.\d+)?)?)?$/, 3.55, "EL chondrite"],
  [/^CM\d(\.\d+)?([-/]\d(\.\d+)?)?$/, 2.12, "CM chondrite"],
  [/^CR\d(\.\d+)?([-/]\d(\.\d+)?)?$/, 3.1, "CR chondrite"],
  [/^CO\d(\.\d+)?([-/]\d(\.\d+)?)?$/, 2.95, "CO chondrite"],
  [/^CV\d(\.\d+)?([-/]\d(\.\d+)?)?$/, 2.95, "CV chondrite"],
  [/^Eucrite(-(pmict|mmict|br|unbr|cm))?$/, 2.86, "eucrite"],
  [/^Howardite$/, 3.02, "howardite"],
  [/^Diogenite(-(pm|olivine))?$/, 3.26, "diogenite"],
  [/^Aubrite$/, 3.12, "aubrite"],
  [/^Ureilite(-pmict)?$/, 3.05, "ureilite"],
  [/^Martian \(shergottite\)$/, 3.10, "shergottite"],
  [/^Martian \(nakhlite\)$/, 3.15, "nakhlite"],
  [/^Mesosiderite(-[A-C]\d?(\/\d)?)?$/, 4.25, "mesosiderite"],
  [/^Pallasite(, .+)?$/, 4.76, "pallasite"],
  [/^Iron(, .+)?$/, 7.8, "iron"],
];
const classRho = (c) => {
  for (const [re, rho] of CLASS_RHO) if (re.test(c)) return rho;
  return null;
};

// minimal RFC-4180 CSV line splitter (quoted fields contain commas)
function splitCSV(line) {
  const out = [];
  let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

// stable 32-bit FNV-1a hash → deterministic sampling
const fnv = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h;
};

// Famous meteorites always kept by the sampler.
const MUST = new Set(["Hoba", "Cape York", "Sikhote-Alin", "Allende", "Murchison", "Willamette",
  "Campo del Cielo", "Canyon Diablo", "Gibeon", "Armanty", "Mundrabilla", "Jilin", "Norton County",
  "Ensisheim", "Chelyabinsk", "Peekskill", "Zagami", "Nakhla", "Esquel", "Fukang", "Imilac",
  "Brenham", "Estherville", "Abee", "Murnpeowie", "Old Woman", "Bacubirito", "Mbosi", "Allan Hills 84001",
  "Shergotty", "Kapoeta", "Juvinas", "Stannern", "Johnstown", "Bishunpur", "Semarkona", "Tieschitz",
  "Holbrook", "Pultusk", "L'Aigle", "Mighei", "Cold Bokkeveld", "Vigarano", "Ornans", "Renazzo",
  "Novo-Urei", "Bjurböle", "Gao-Guenie", "Benld", "Park Forest", "Sutter's Mill"]);

const MAX_ROWS = 5000;

export default [
  // ---------------------------------------------------------------
  {
    id: "meteorite",
    label: "Meteorite · Met. Bulletin (size from class density)",
    cat: "planet",
    cite: "Masses: The Meteoritical Society, Meteoritical Bulletin Database, as compiled in NASA's \"Meteorite Landings\" dataset " +
      "(data.nasa.gov, 45,716 records). Class bulk densities: Britt & Consolmagno 2003, MAPS 38, 1161 (via Britt & Consolmagno 2004, " +
      "LPSC XXXV #2108); irons: Consolmagno & Britt 2013, MetSoc #5128",
    url: "https://data.nasa.gov/docs/legacy/meteorite_landings/Meteorite_Landings.csv",
    radius: "equivalent-sphere radius (3M / 4πρ)^(1/3) of the total recovered mass M, with ρ the measured mean bulk density " +
      "of the meteorite's class (H 3.40, L 3.35, LL 3.21, EH 3.72, EL 3.55, CM 2.12, CR 3.1, CO/CV 2.95, eucrite 2.86, howardite 3.02, " +
      "diogenite 3.26, aubrite 3.12, ureilite 3.05, shergottite 3.10, nakhlite 3.15, mesosiderite 4.25, pallasite 4.76, iron 7.8 g/cm³). " +
      "Size is DERIVED; mass is measured. Stratified deterministic sample (0.1-dex mass bins) of ≤5,000, famous falls/finds always kept",
    density: [0.25, 0.95],
    anchors: [
      { name: "Sikhote-Alin", logM: log(23e6), tol: 0.05 },        // 23 t recovered (iron, 1947)
      { name: "Allende", logM: log(2e6), tol: 0.1 },               // ~2 t (CV3, 1969)
      { name: "Hoba", logM: log(60e6), tol: 0.1,                   // ~60 t iron; sphere of 60 t at 7.8 g/cm³
        logR: log(Math.cbrt((60e6 / 7.8) / SPHERE)), },
    ],
    async load(fetchText) {
      const txt = await fetchText(this.url, "meteorites.csv");
      const lines = txt.split(/\r?\n/).filter(Boolean);
      const H = splitCSV(lines[0]);
      const iN = H.indexOf("name"), iT = H.indexOf("nametype"), iC = H.indexOf("recclass"), iM = H.indexOf("mass (g)");
      if ([iN, iT, iC, iM].some((i) => i < 0)) throw new Error("unexpected header: " + lines[0]);
      const rows = [];
      for (const l of lines.slice(1)) {
        const c = splitCSV(l);
        if (c[iT] !== "Valid") continue;                  // "Relict" = no meteoritic material left
        const m = Number(c[iM]);
        if (!(m > 0)) continue;
        const rho = classRho(c[iC].trim());
        if (!rho) continue;
        const name = c[iN].replace(/\s+/g, " ").trim();
        const r = Math.cbrt(m / rho / SPHERE);
        rows.push({ name, logR: log(r), logM: log(m) });
      }
      if (rows.length <= MAX_ROWS) return rows;
      // ---- deterministic stratified sample: keep every bin's tail, cap dense bins ----
      const keep = rows.filter((r) => MUST.has(r.name));
      const rest = rows.filter((r) => !MUST.has(r.name));
      const bins = new Map();
      for (const r of rest) {
        const b = Math.floor(r.logM * 10);
        if (!bins.has(b)) bins.set(b, []);
        bins.get(b).push(r);
      }
      const budget = MAX_ROWS - keep.length;
      const sizes = [...bins.values()].map((a) => a.length);
      let q = 1;
      while (sizes.reduce((s, n) => s + Math.min(n, q + 1), 0) <= budget) q++;
      for (const a of bins.values()) {
        a.sort((x, y) => fnv(x.name) - fnv(y.name) || (x.name < y.name ? -1 : 1));
        keep.push(...a.slice(0, q));
      }
      return keep;
    },
  },
  // ---------------------------------------------------------------
  {
    id: "smallbody-measured",
    label: "Asteroid · measured mass (radar binaries, DART)",
    cat: "planet",
    cite: "Hand table, one reference per row: Ostro et al. 2006, Science 314, 1276 (Moshup/Squannit); Fang et al. 2011, AJ 141, 154 " +
      "(masses of 1994 CC and 2001 SN263 primaries); Brozović et al. 2011, Icarus 216, 241 (1994 CC size); Becker et al. 2015, " +
      "Icarus 248, 499 (2001 SN263 size); Shepard et al. 2006, Icarus 184, 198 (2002 CE26); Richardson et al. 2025, PSJ " +
      "(arXiv:2502.14990; Didymos, DART); Lauretta et al. 2019 Nature 568, 55 / Scheeres et al. 2019 Nat. Astron. 3, 352 (Bennu)",
    radius: "half the volume-equivalent diameter of the body's radar or spacecraft shape model",
    density: [-0.7, 0.7],
    anchors: [
      { name: "66391 Moshup", logM: log(2.353e15), logR: log(1.317e5 / 2), tol: 0.01 },
    ],
    async load() {
      // [name, mass (g), volume-equivalent diameter (km), reference]
      // Mass from the satellite's orbit (Kepler III on the radar/lightcurve
      // orbit) or from spacecraft tracking — never from an assumed density.
      // Bodies already in JPL SBDB with a GM (Itokawa, Ryugu, Dinkinesh,
      // 2000 DP107, 67P, Eros, Ida, Mathilde, Lutetia) are left to "smallbody".
      // Satellites whose mass is unconstrained (1994 CC / 2001 SN263 Beta &
      // Gamma, Dimorphos — mass only via an assumed density) are omitted.
      const T = [
        ["66391 Moshup", 2.353e15, 1.317, "Ostro+ 2006: M_α = 2.353±0.100e12 kg, V = 1.195 km³"],
        ["Squannit", 1.35e14, 0.451, "Ostro+ 2006: M_β = 0.135±0.024e12 kg, axes 0.571×0.463×0.349 km"],
        ["136617 (1994 CC)", 2.5935e14, 0.62, "Fang+ 2011: M_α = 25.935±1e10 kg; Brozović+ 2011: D = 0.62±0.06 km"],
        ["153591 (2001 SN263)", 9.17466e15, 2.5, "Fang+ 2011: M_α = 917.466e10 kg; Becker+ 2015: D = 2.5±0.3 km"],
        ["276049 (2002 CE26)", 1.95e16, 3.46, "Shepard+ 2006: M = 1.95±0.25e13 kg, D = 3.46±0.35 km"],
        // system mass 5.3±0.2e11 kg minus Dimorphos (D 150 m; ≈4.2e9 kg at 2.4 g/cm³, <1% of the total)
        ["65803 Didymos", 5.26e14, 0.73, "Richardson+ 2025 Table 2: M_sys = 5.3±0.2e11 kg, D = 730±17 m"],
        // curated duplicate (cross-check only; curated object wins)
        ["Bennu", 7.329e13, 0.490, "Scheeres+ 2019: GM = 4.892 m³/s²; Lauretta+ 2019: mean D = 490 m"],
      ];
      return T.map(([name, m, d]) => ({ name, logR: log(d * 1e5 / 2), logM: log(m) }));
    },
  },
];
