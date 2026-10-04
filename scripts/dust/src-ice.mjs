// =============================================================
// src-ice.mjs — glaciers, ice caps and ice sheets
// (fills ~1e12 … 1e22 g on the planet branch, between ships/lakes and
// asteroids/moons)
// =============================================================
// Two sources:
//   glacier   GlaThiDa v3.1.0 glacier-level table (T.csv): SURVEYED mean
//             ice thickness × area → volume; mass = volume × 0.917 g/cm³.
//             Length = RGI 7.0 maximum glacier length (lmax_m), joined by
//             position + area (+ name where RGI has one). Size half that.
//   icesheet  A short cited hand table of ice sheets / ice caps whose
//             volume comes from radio-echo-sounding / seismic surveys,
//             radius = half the maximum horizontal extent.
//
// MASS IS DERIVED: measured ice volume × density of glacier ice
// 0.917 g/cm³ (pure ice at 0 °C; firn makes real bulk density a few %
// lower on accumulation areas — < 0.02 dex).
// =============================================================

import { execFileSync } from "node:child_process";

const log = Math.log10;
const RHO_ICE = 0.917;                  // g/cm³
const KM3 = 1e15, KM2 = 1e10, KM = 1e5, M = 1e2;

// minimal RFC-4180 CSV line splitter (quoted fields may contain commas)
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
// Parse a whole CSV with possible newlines inside quoted fields.
function parseCSV(text) {
  const rows = [];
  let buf = "";
  for (const line of text.split(/\r?\n/)) {
    buf = buf ? buf + "\n" + line : line;
    if ((buf.match(/"/g) || []).length % 2) continue; // unbalanced quotes → continued
    if (buf.trim()) rows.push(splitCSV(buf));
    buf = "";
  }
  const [H, ...body] = rows;
  return body.map((c) => Object.fromEntries(H.map((h, i) => [h, c[i] ?? ""])));
}

const hav = (la1, lo1, la2, lo2) => {
  const p = Math.PI / 180;
  const x = Math.sin((la2 - la1) * p / 2) ** 2 + Math.cos(la1 * p) * Math.cos(la2 * p) * Math.sin((lo2 - lo1) * p / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));   // km
};
// name normaliser for matching GlaThiDa ↔ RGI names (ASCII, no generic words)
const nameKey = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z]/g, "")
  .replace(/glacier|gletscher|glaciaeren|glaciar|glacier|breen|brean|ferner|kees|lednik|glacial/g, "");
// longest common substring length (short strings — brute force is fine)
const lcs = (a, b) => {
  let best = 0;
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) {
    let k = 0;
    while (a[i + k] && a[i + k] === b[j + k]) k++;
    if (k > best) best = k;
  }
  return best;
};
const COUNTRY = { AT: "Austria", CH: "Switzerland", KZ: "Kazakhstan", KG: "Kyrgyzstan", RU: "Russia", CN: "China",
  NO: "Norway", SE: "Sweden", IT: "Italy", FR: "France", US: "USA", CA: "Canada", TJ: "Tajikistan", UZ: "Uzbekistan",
  SJ: "Svalbard", GL: "Greenland", IS: "Iceland", AQ: "Antarctica", CL: "Chile", AR: "Argentina", PE: "Peru",
  BO: "Bolivia", EC: "Ecuador", CO: "Colombia", NP: "Nepal", IN: "India", PK: "Pakistan", NZ: "New Zealand",
  DE: "Germany", ES: "Spain", GE: "Georgia", MN: "Mongolia", BT: "Bhutan", TF: "Kerguelen", GS: "South Georgia" };
const titleCase = (s) => s.toLowerCase().replace(/(^|[\s\-(/.])([a-zà-ÿ])/g, (m, a, b) => a + b.toUpperCase())
  .replace(/\bGr\b\.?/g, "Gr.").replace(/\s+/g, " ").trim();

// Glaciers whose length could not be taken from RGI (RGI splits them into
// several flow units, or the GlaThiDa outline is much larger than any
// single RGI glacier). Lengths are published values.
const LENGTH_KM = {
  "45": [77, "Fedchenko Glacier"],   // 77 km — longest glacier outside the polar regions (Wikipedia / Kotlyakov)
  "201": [51, "Columbia Glacier"],   // 51 km (Wikipedia, "Columbia Glacier (Alaska)", 2007 length; GlaThiDa outline 1050 km²)
};

// Human-readable glacier name: RGI's spelling when the names agree, else GlaThiDa's.
function displayName(rgiName, gName, numeric, cc) {
  if (numeric) return `Glacier No. ${gName.replace(/^NO\.?\s*/i, "")} (${COUNTRY[cc] || cc})`;
  let name = (rgiName && !/[,/]/.test(rgiName) ? rgiName : gName)
    .replace(/^[A-Z]{2}\d[A-Z0-9]{9,}\s+/, "")          // leading WGI code in some RGI names
    .replace(/_/g, " ").replace(/\s+/g, " ").trim();
  if (name === name.toUpperCase()) name = titleCase(name);
  name = name.replace(/ Gl\.?$/, "").replace(/glaciaer(en)?\b/gi, (m) => m.replace(/aer/i, "är"));
  if (!/glac|glet|ferner|kees|bre(e|a)n|bre$|fonna|jökull|joekull|j(o|oe|ø)kel|lednik|firn|ice|névé|neve|nevado|vadret|vedretta|glatsch/i.test(name)
    && !/^No\. /.test(name)) name += " Glacier";
  // inverted French/Romansh names: "Otemma Glacier D'" → "Glacier d'Otemma"
  const inv = name.match(/^(.*?) (Glacier|Vadret|Glatschiu) (D'|Du|De|Des|Dal|Da|Della|Dil)( Glacier)?$/i);
  if (inv) name = `${inv[2]} ${inv[3].toLowerCase()}${inv[3].endsWith("'") ? "" : " "}${inv[1]}`;
  if (/^No\. /.test(name)) name = "Glacier " + name;
  return name.replace(/^\((.*)\) Glacier$/, "$1 Glacier");
}

export default [
  // ---------------------------------------------------------------
  {
    id: "glacier",
    label: "Glacier · GlaThiDa (mass from surveyed volume)",
    cat: "planet",
    cite: "Ice thickness: GlaThiDa Consortium (2020), Glacier Thickness Database 3.1.0, World Glacier Monitoring Service, " +
      "doi:10.5904/wgms-glathida-2020-10 (table T: surveyed glacier area and mean thickness). Lengths: RGI 7.0 Consortium (2023), " +
      "Randolph Glacier Inventory 7.0, doi:10.5067/f6jmovy5navz (lmax_m), via the OGGM mirror; Fedchenko & Columbia lengths from Wikipedia",
    url: "https://gitlab.com/wgms/glathida/-/raw/v3.1.0/data/T.csv",
    rgiUrl: "https://cluster.klima.uni-bremen.de/~oggm/rgi/RGI2000-v7.0-G-global-attributes.csv",
    radius: "half the glacier's maximum length (RGI 7.0 lmax, centreline length of the ~2000 outline), matched to the GlaThiDa " +
      "survey by position (RGI centroid ≤ 3 km, or ≤ 15 km when the names agree), area ratio 0.5–2 and name compatibility. " +
      "MASS IS DERIVED: GlaThiDa surveyed area × interpolated mean thickness × ice density 0.917 g/cm³. Only surveys with no " +
      "GlaThiDa DATA_FLAG (erroneous / partial coverage) are used; latest survey per glacier. Ice caps not resolvable into one RGI " +
      "glacier are left to the 'icesheet' source",
    density: [-4.5, -0.5],
    anchors: [
      // Storglaciären: 3.1 km², mean thickness 99 m (Björnsson 1981) → 0.307 km³; ~3.2 km long
      { name: "Storglaciären", logM: log(3.1 * KM2 * 99 * M * RHO_ICE), logR: log(1.6 * KM), tol: 0.12 },
      // Fedchenko: 144 km³ of ice (Wikipedia), 77 km long
      { name: "Fedchenko Glacier", logM: log(144 * KM3 * RHO_ICE), logR: log(38.5 * KM), tol: 0.02 },
    ],
    async load(fetchText) {
      const T = parseCSV(await fetchText(this.url, "glathida-T.csv"));
      if (!T.length || !("MEAN_THICKNESS" in T[0])) throw new Error("unexpected GlaThiDa header");
      const rgiText = await fetchText(this.rgiUrl, "rgi7-G-attributes.csv");
      // ---- RGI 7.0 glaciers on a 0.1° grid ----
      const lines = rgiText.split("\n");
      const RH = splitCSV(lines[0]);
      const ix = (k) => { const i = RH.indexOf(k); if (i < 0) throw new Error("RGI column missing: " + k); return i; };
      const iLa = ix("cenlat"), iLo = ix("cenlon"), iA = ix("area_km2"), iL = ix("lmax_m"), iN = ix("glac_name");
      const grid = new Map();
      for (let n = 1; n < lines.length; n++) {
        if (!lines[n]) continue;
        const c = splitCSV(lines[n]);
        const g = { la: +c[iLa], lo: +c[iLo], A: +c[iA], L: +c[iL], name: c[iN].trim() };
        const k = `${Math.floor(g.la * 10)},${Math.floor(g.lo * 10)}`;
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k).push(g);
      }

      // ---- GlaThiDa: usable surveys, latest per glacier ----
      const best = new Map();
      for (const t of T) {
        const A = Number(t.AREA), h = Number(t.MEAN_THICKNESS);
        if (!(A > 0 && h > 0) || t.DATA_FLAG.trim()) continue;
        const key = `${t.POLITICAL_UNIT}|${t.GLACIER_NAME.trim().toUpperCase()}`;
        const yr = Number(String(t.SURVEY_DATE).slice(0, 4)) || 0;
        const prev = best.get(key);
        if (!prev || yr > prev.yr || (yr === prev.yr && +t.GlaThiDa_ID > +prev.t.GlaThiDa_ID)) best.set(key, { t, yr, A, h });
      }

      const out = [];
      this._unmatched = [];
      for (const { t, A, h } of best.values()) {
        const la = +t.LAT, lo = +t.LON;
        const gName = t.GLACIER_NAME.trim();
        const numeric = /^[\d\s.\-/A-Z]{0,4}\d[\d\s.\-/]*$/.test(gName);
        const gk = nameKey(gName);
        let L = null, rgiName = "", rgiRef;
        if (LENGTH_KM[t.GlaThiDa_ID]) {
          L = LENGTH_KM[t.GlaThiDa_ID][0] * KM;
          rgiName = LENGTH_KM[t.GlaThiDa_ID][1];
        } else {
          let pick = null;
          const g0 = Math.floor(la * 10), h0 = Math.floor(lo * 10);
          for (let i = -2; i <= 2; i++) for (let j = -4; j <= 4; j++) {
            for (const g of grid.get(`${g0 + i},${h0 + j}`) || []) {
              const d = hav(la, lo, g.la, g.lo);
              if (d > 15) continue;
              const ar = g.A / A;
              if (!(ar > 0.5 && ar < 2) || !(g.L > 0)) continue;
              const rk = g.name ? nameKey(g.name) : "";
              const named = rk && gk && !numeric;
              const same = named && (rk === gk || lcs(rk, gk) >= Math.min(5, rk.length, gk.length));
              if (named && !same) continue;          // two different named glaciers
              if (!same && d > 3) continue;          // unnamed: must be close
              const score = Math.abs(Math.log(ar)) + d / 3 - (same ? 1 : 0);
              if (!pick || score < pick.score) pick = { score, g, same };
            }
          }
          if (!pick) { this._unmatched.push(`${gName} (${t.POLITICAL_UNIT}, ${A} km²)`); continue; }
          L = pick.g.L * M;
          rgiName = pick.same ? pick.g.name : "";
          // two GlaThiDa entries (spelling variants) on the same RGI glacier → keep the later survey
          const yr = Number(String(t.SURVEY_DATE).slice(0, 4)) || 0;
          if (pick.g._yr !== undefined && pick.g._yr >= yr) continue;
          if (pick.g._row) out.splice(out.indexOf(pick.g._row), 1);
          pick.g._yr = yr;
          rgiRef = pick.g;
        }
        const row = { name: displayName(rgiName, gName, numeric, t.POLITICAL_UNIT), _g: displayName("", gName, numeric, t.POLITICAL_UNIT),
          logR: log(L / 2), logM: log(A * KM2 * h * M * RHO_ICE), _cc: t.POLITICAL_UNIT, _yr: Number(String(t.SURVEY_DATE).slice(0, 4)) || 0 };
        if (rgiRef) { rgiRef._row = row; rgiRef = undefined; }
        out.push(row);
      }
      // Two rows with the same display name (e.g. RGI calls both "Passfjellbreen W" and "E"
      // just "Passfjellbreen") → fall back to GlaThiDa's own names; then add the country
      // when the same name exists in two countries; a remaining clash in one country is the
      // same glacier surveyed under two spellings → keep the latest survey.
      const groups = (key) => { const m = new Map(); for (const r of out) { const k = key(r).toLowerCase(); if (!m.has(k)) m.set(k, []); m.get(k).push(r); } return m; };
      for (const g of groups((r) => r.name).values()) if (g.length > 1) for (const r of g) r.name = r._g;
      for (const g of groups((r) => r.name).values())
        if (g.length > 1 && new Set(g.map((r) => r._cc)).size > 1) for (const r of g) r.name += ` (${COUNTRY[r._cc] || r._cc})`;
      const final = [];
      for (const g of groups((r) => r.name).values()) final.push(g.sort((a, b) => b._yr - a._yr)[0]);
      return final;
    },
  },
  // ---------------------------------------------------------------
  {
    id: "icesheet",
    label: "Ice sheet / cap · mass from surveyed volume",
    cat: "planet",
    cite: "Antarctica: Fretwell et al. 2013, The Cryosphere 7, 375 (Bedmap2: 27 × 10⁶ km³). Greenland: Morlighem et al. 2017, GRL 44, " +
      "11051 (BedMachine v3: 2.99 × 10⁶ km³). Vatnajökull: Björnsson & Pálsson 2008, Jökull 58, 365 (3,100 km³). Barnes Ice Cap: " +
      "GlaThiDa 3.1.0 (5,936 km² × 267 m, after Bahr et al. 1997). Extents: Antarctica widest crossing ≈5,340 km; Greenland ice sheet " +
      "2,400 km N–S (Wikipedia, after the Bamber Greenland ice-sheet facts); Vatnajökull ≈140 km; Barnes Ice Cap ≈150 km long " +
      "(USGS Prof. Paper 1386-J)",
    radius: "half the maximum horizontal extent (longest dimension of the ice mass). MASS IS DERIVED: radar-surveyed ice volume × 0.917 g/cm³",
    density: [-4.5, -0.5],
    anchors: [
      { name: "Greenland Ice Sheet", logM: log(2.99e6 * KM3 * RHO_ICE), logR: log(1200 * KM), tol: 0.01 },
    ],
    async load() {
      const T = [
        // name, volume km³, max extent km
        ["Antarctic Ice Sheet", 27.0e6, 5340],
        ["Greenland Ice Sheet", 2.99e6, 2400],
        ["Vatnajökull", 3100, 140],
        ["Barnes Ice Cap", 5936 * 0.267, 150],
      ];
      return T.map(([name, V, L]) => ({ name, logR: log(L * KM / 2), logM: log(V * KM3 * RHO_ICE) }));
    },
  },
];
