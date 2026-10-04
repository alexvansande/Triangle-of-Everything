// =============================================================
// src-wikidata.mjs — human-made objects and lakes from Wikidata
// =============================================================
// Fills the empty stretch of the chart between the blue whale (~1e8 g)
// and the smallest asteroids (~1e15 g) with real, individually named
// things: car / aircraft / locomotive models, ships, rockets and
// spacecraft, statues, bridges, towers … and lakes.
//
// Numbers are Wikidata's NORMALISED quantities (wikibase:quantityNormalized),
// i.e. converted to SI by Wikibase itself, so statements entered in t,
// lb, long tons, ft, km³ … all come back as kg / m / m³.
//
// Artefacts: mass = the LARGEST mass statement on the item (full-load
// displacement for ships, maximum take-off mass for aircraft, lift-off
// mass for rockets, gross mass for road vehicles — the same convention as
// the hand-placed "Boeing 747" and "Supertanker"), radius = half the
// largest of length / height / width.
//
// Lakes: Wikidata has no lake masses. Mass = measured volume (P2234) ×
// the density of fresh water (1.000 g/cm³) — the Dead Sea uses its
// measured 1.24 g/cm³. Radius = half the lake's length (P2043).
//
// WDQS is queried with a descriptive User-Agent, few heavy-ish but simple
// GROUP BY queries (no label service; English rdfs:label only), one
// request per minute at most (WDQS currently rate-limits to 1 req/min),
// retried with back-off, and every result cached in scripts/dust/.cache/.
// =============================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const CACHE = join(dirname(fileURLToPath(import.meta.url)), ".cache");
const REFRESH = process.argv.includes("--refresh");
const UA = "TriangleOfEverything-dust/1.0 (log-log mass-size chart; build script scripts/dust/src-wikidata.mjs; curl)";
const log = Math.log10;

let lastRequest = 0;
const sleep = (s) => execFileSync("sleep", [String(s)]);

// Cached WDQS query → array of bindings {var: string}.
function wdqs(query, file) {
  mkdirSync(CACHE, { recursive: true });
  const p = join(CACHE, file);
  if (REFRESH || !existsSync(p)) {
    let ok = false;
    for (let attempt = 0; attempt < 7 && !ok; attempt++) {
      const wait = 62 - (Date.now() - lastRequest) / 1000;
      if (lastRequest && wait > 0) sleep(Math.ceil(wait));
      if (attempt > 0) sleep(30 * 2 ** Math.min(attempt - 1, 3));
      console.log(`  ↓ ${file} (WDQS${attempt ? `, retry ${attempt}` : ""})`);
      lastRequest = Date.now();
      let code = "000";
      try {
        code = execFileSync("curl", ["-sS", "-m", "300", "-A", UA, "-H", "Accept: application/sparql-results+json",
          "--data-urlencode", `query=${query}`, "-o", p + ".part", "-w", "%{http_code}",
          "https://query.wikidata.org/sparql"], { encoding: "utf8" }).trim();
      } catch { /* network error → retry */ }
      if (code === "200") {
        try { JSON.parse(readFileSync(p + ".part", "utf8")); renameSync(p + ".part", p); ok = true; }
        catch { console.log("    (truncated / non-JSON answer)"); }
      } else console.log(`    HTTP ${code}`);
    }
    if (!ok) throw new Error(`WDQS query ${file} failed after retries`);
  }
  return JSON.parse(readFileSync(p, "utf8")).results.bindings.map((b) =>
    Object.fromEntries(Object.entries(b).map(([k, v]) => [k, v.value])));
}

// ---------------------------------------------------------------
// Artefacts: three light queries (mass + one dimension property each),
// merged per item. Classes come back as a space-separated QID list.
// ---------------------------------------------------------------
const dimQuery = (P) => `SELECT ?item (SAMPLE(?lab) AS ?name) (MAX(?m) AS ?M) (MAX(?d) AS ?D)
 (GROUP_CONCAT(DISTINCT STRAFTER(STR(?cls), "entity/")) AS ?C) WHERE {
  ?item p:P2067 ?ms. ?ms psv:P2067/wikibase:quantityNormalized/wikibase:quantityAmount ?m.
  ?ms wikibase:rank ?mr. FILTER(?mr != wikibase:DeprecatedRank)
  ?item p:${P} ?ds. ?ds psv:${P}/wikibase:quantityNormalized/wikibase:quantityAmount ?d.
  ?ds wikibase:rank ?dr. FILTER(?dr != wikibase:DeprecatedRank)
  ?item wdt:P31 ?cls.
  OPTIONAL { ?item rdfs:label ?lab FILTER(LANG(?lab) = "en") }
} GROUP BY ?item LIMIT 40000`;

let itemsCache = null;
function artefactItems() {
  if (itemsCache) return itemsCache;
  const by = new Map();
  for (const [P, f] of [["P2043", "length"], ["P2048", "height"], ["P2049", "width"]]) {
    for (const b of wdqs(dimQuery(P), `wd-mass-${f}.json`)) {
      const q = b.item.replace(/.*\//, "");
      const o = by.get(q) || { q, name: b.name, M: 0, D: 0, dims: new Set(), C: new Set() };
      o.name ||= b.name;
      o.M = Math.max(o.M, +b.M);
      o.D = Math.max(o.D, +b.D);
      o.dims.add(f);
      (b.C || "").split(" ").filter(Boolean).forEach((c) => o.C.add(c));
      by.set(q, o);
    }
  }
  return (itemsCache = [...by.values()]);
}

// Which instance-of classes go to which source. Order of GROUPS matters:
// an item is assigned to the first group whose class list it hits, so it
// is never plotted twice. Consumer electronics, lenses, cameras, coins,
// taxa, fictional and abstract things are deliberately not listed.
const GROUPS = {
  spacecraft: `Q148578 Q117384800 Q854845 Q18812508 Q95945728 Q1142930 Q110055303 Q928667 Q105839698
    Q19362195 Q26529 Q149918 Q28803027 Q12832168 Q1064394 Q209363 Q25956 Q2166659 Q2098169 Q111914880
    Q108657366 Q389459 Q1285444 Q266487 Q1580082 Q1147027 Q1471432 Q1007767 Q18819669 Q17993276 Q4302480
    Q579036 Q973887 Q4203973 Q6703812 Q12054919 Q3804473 Q26540 Q763288 Q1369318 Q7556723 Q697175
    Q41291 Q1185557 Q40218 Q5916 Q2133344 Q752392`,
  aircraft: `Q15056995 Q15056993 Q45296117 Q15126161 Q197 Q19799 Q126001158 Q484000 Q118984909 Q24139989
    Q218990 Q11436 Q210932 Q1384417 Q126004726 Q21029360 Q1153376 Q1130697 Q130219275 Q34486 Q127771
    Q4830453 Q46310 Q170877`,
  ship: `Q106179098 Q121289722 Q1307792 Q3511280 Q893182 Q559026 Q18758641 Q1428357 Q852190 Q17205
    Q174736 Q161705 Q10316200 Q11446 Q214196 Q331795 Q1121471 Q1201871 Q14970 Q182531 Q105999 Q12859788
    Q98151017 Q2811 Q130326199 Q575727 Q170013 Q202527 Q1303735 Q1286790 Q391022 Q613316 Q778129 Q324233
    Q660668 Q847109 Q19267382 Q170483 Q14978 Q14928 Q15276 Q2055880 Q4818021 Q104843 Q671079 Q428661
    Q112149492 Q11229656 Q1410980 Q898771 Q214190 Q26211803 Q1752434 Q191826 Q190403 Q207452 Q11479409
    Q1779600 Q697196 Q1075310 Q178193 Q630415 Q1420024 Q1151538 Q848944 Q557281 Q1917626 Q847478
    Q1430687 Q4419860 Q16103215 Q657819 Q1753652 Q11997320 Q170173 Q753784 Q204577 Q3308902 Q15254
    Q2607934 Q14552182 Q683363 Q325884 Q820378 Q11608028 Q1716850 Q473932 Q1185562 Q2031121 Q10316203
    Q402092 Q44188331 Q177597 Q2074370 Q782984 Q20105726 Q640078 Q16070538 Q17210 Q116214636 Q35872
    Q2072352 Q105234809 Q25653 Q202539 Q831515 Q2601071 Q5156774 Q538685 Q917479 Q1424227 Q2461104
    Q1051067 Q1569963 Q3679597 Q122937890 Q1186981 Q257406 Q1326749 Q1361551 Q1763083 Q474161 Q21505397
    Q4847899 Q939770 Q3456301 Q39804 Q1229765 Q4022 Q1137594 Q15141321 Q2235308 Q1069313`,
  vehicle: `Q3231690 Q90834785 Q5352998 Q850270 Q59773381 Q23039057 Q21546143 Q42319471 Q76154857 Q3407658
    Q19832486 Q811704 Q63040754 Q23866334 Q100710213 Q100709275 Q137188246 Q29048322 Q278222 Q673687
    Q811701 Q77814805 Q2666883 Q2387165 Q332280 Q55725952 Q2392395 Q828170 Q1137599 Q190578 Q785745
    Q3959904 Q213853 Q55989 Q143872 Q39495 Q42889 Q137188255 Q130368 Q1420 Q5638 Q93301 Q870 Q93288`,
  artefact: `Q15142894 Q124056273 Q18487055 Q22704163 Q42314054 Q1549314 Q104758804 Q18487018 Q15142889
    Q124078422 Q220659 Q860861 Q179700 Q4989906 Q9252000 Q838948 Q13464614 Q1066288 Q366134 Q39397
    Q12791 Q48634 Q178743 Q1907525 Q124072 Q81103 Q173603 Q378845 Q639460 Q4364339 Q2065736
    Q1068842 Q537127 Q12042110 Q818882 Q158218 Q1210334 Q12280 Q12570
    Q12518 Q1440300 Q11303 Q41176 Q12323 Q39715 Q170980 Q101401 Q193475 Q11707 Q18674739 Q1144661
    Q4830453 Q2319498 Q15057021 Q15057020 Q118017625`,
};
const CLASS_GROUP = new Map();
for (const [g, list] of Object.entries(GROUPS))
  for (const q of list.split(/\s+/).filter(Boolean)) if (!CLASS_GROUP.has(q)) CLASS_GROUP.set(q, g);
const ORDER = Object.keys(GROUPS);

// Group by priority order (spacecraft before artefact, etc.)
function groupOf(o) {
  let best = null;
  for (const c of o.C) {
    const g = CLASS_GROUP.get(c);
    if (g && (best === null || ORDER.indexOf(g) < ORDER.indexOf(best))) best = g;
  }
  return best;
}

function loadGroup(group) {
  const out = [];
  for (const o of artefactItems()) {
    if (groupOf(o) !== group) continue;
    // Quality cuts: an English name, positive values, and at least a
    // length or a height (a lone width/beam would under-size the object).
    if (!o.name || /^Q\d+$/.test(o.name)) continue;
    if (!(o.M > 0 && o.D > 0)) continue;
    if (!o.dims.has("length") && !o.dims.has("height")) continue;
    out.push({ name: o.name, logR: log((o.D * 100) / 2), logM: log(o.M * 1000), _anchor: o.q });
  }
  return out;
}

const CITE = "Wikidata (CC0), via the Wikidata Query Service — mass P2067, length P2043, height P2048, width P2049, as normalised SI values (quantityNormalized)";
const RADIUS = "half the largest of length / height / width (as for “Boeing 747”, “Supertanker”); mass = largest stated mass (full-load displacement, max take-off, lift-off or gross mass)";
// Mean density of the bounding sphere (radius = half the largest
// dimension). Hollow, elongated objects sit far below water: a car
// ~10^-1.5, an airliner or rocket ~10^-2.5 to -3, a ship ~10^-2 to -1,
// a thin bridge or tower ~10^-4; compact solid bronze or stone objects
// approach 10^0.5. Envelopes are generous — they catch kg/t or m/mm
// slips (≥ 3 dex), not real variety.
const artefact = (id, label, density, anchors) => ({
  id, label, cat: "macro", cite: CITE, radius: RADIUS, density, anchors,
  async load() { return loadGroup(id); },
});

export default [
  artefact("vehicle", "Vehicle model · Wikidata", [-4, 0.5], [
    // Volkswagen Beetle: 4.08 m long; heaviest mass statement on the item
    // (checked by hand: ~1.2 t gross) — anchors a kg↔t slip, not the exact value.
  ]),
  artefact("ship", "Ship / boat · Wikidata", [-4.5, 0.5], [
    // RMS Titanic: 269.1 m, 52,310 t displacement
    { name: "Q25173", logR: log(26910 / 2), logM: log(52310e6), tol: 0.05 },
  ]),
  artefact("aircraft", "Aircraft model · Wikidata", [-5, 0], []),
  artefact("spacecraft", "Rocket / spacecraft · Wikidata", [-5, 0.5], [
    // Saturn V: 110.6 m, 2,965 t at lift-off; ISS: 94.5 m truss span, ~420 t
    { name: "Q54363", logR: log(11065 / 2), logM: log(2965241e3), tol: 0.05 },
    { name: "Q25271", logR: log(9450 / 2), logM: log(419725e3), tol: 0.05 },
  ]),
  artefact("artefact", "Artefact / structure · Wikidata", [-6, 1], [
    // Eiffel Tower: 330 m, 10,100 t (Wikidata's figure incl. non-metal parts)
    { name: "Q243", logR: log(33000 / 2), logM: log(10100e6), tol: 0.05 },
  ]),
  // -------------------------------------------------------------
  {
    id: "lake",
    label: "Lake · Wikidata (mass = volume × water density)",
    cat: "planet",
    cite: "Wikidata (CC0), via the Wikidata Query Service — lakes and reservoirs (instance of a subclass of lake, Q23397) with volume P2234 and length P2043, normalised SI values",
    radius: "half the lake's length (P2043). Mass DERIVED: volume × 1.000 g/cm³ (fresh water); Dead Sea × 1.24 g/cm³ (measured brine density)",
    // Lakes are long and shallow: bounding-sphere density of a big lake
    // ~10^-4 to -6; a deep crater lake approaches 10^-2.
    density: [-8.5, -0.5],
    anchors: [
      // Lake Baikal: 23,615 km³, 636 km long
      { name: "Lake Baikal", logR: log(636e5 / 2), logM: log(23615e15), tol: 0.05 },
    ],
    async load() {
      const rows = wdqs(`SELECT ?item (SAMPLE(?lab) AS ?name) (MAX(?v) AS ?V) (MAX(?l) AS ?L) WHERE {
  ?item p:P2234 ?vs. ?vs psv:P2234/wikibase:quantityNormalized/wikibase:quantityAmount ?v.
  ?vs wikibase:rank ?vr. FILTER(?vr != wikibase:DeprecatedRank)
  ?item p:P2043 ?ls. ?ls psv:P2043/wikibase:quantityNormalized/wikibase:quantityAmount ?l.
  ?ls wikibase:rank ?lr. FILTER(?lr != wikibase:DeprecatedRank)
  ?item wdt:P31/wdt:P279* wd:Q23397.
  OPTIONAL { ?item rdfs:label ?lab FILTER(LANG(?lab) = "en") }
} GROUP BY ?item LIMIT 20000`, "wd-lakes.json");
      const RHO = { Q23883: 1.24 }; // Dead Sea
      const out = [];
      for (const b of rows) {
        const q = b.item.replace(/.*\//, "");
        const V = +b.V, L = +b.L;
        if (!b.name || !(V > 0 && L > 0)) continue;
        const rho = RHO[q] ?? 1.0;
        out.push({ name: b.name, logR: log((L * 100) / 2), logM: log(V * 1e6 * rho), _anchor: q });
      }
      return out;
    },
  },
];
