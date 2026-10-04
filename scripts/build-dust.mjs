// =============================================================
// build-dust.mjs — fetch, check and pack the background "dust" layer
// =============================================================
// Run:  npm run build:dust              (uses cached downloads)
//       npm run build:dust -- --refresh (re-download every catalogue)
//
// Dust = thousands of real catalogue objects drawn as faint dots behind
// the curated objects. They only have a name — no description, no link —
// and exist to show trends: the stellar main sequence fanning off into
// giants, the exoplanet mass–radius curve, nuclear density, Larson's law
// for molecular clouds, black holes pinned to the Schwarzschild line…
//
// HOW WE KEEP IT CORRECT. Every source must pass, or the build fails:
//
//   1. PROVENANCE   Only published catalogues (scripts/dust/sources.mjs),
//                   each with a citation and a written-down radius
//                   definition. Quality cuts (uncertainty limits,
//                   "measured, not calculated" flags) are applied at load.
//   2. ANCHORS      Each source reproduces textbook values for known
//                   members (Fe-56 charge radius, Ceres' GM, GW150914's
//                   remnant…). Catches unit / column mistakes wholesale.
//   3. CROSS-CHECK  Any dust object that is also a hand-curated object
//                   (Sirius B, Ceres, the Moon, Iron…) is compared with
//                   objects.json; a gap > 0.3 dex fails the build. The
//                   curated copy wins and the dust duplicate is dropped.
//   4. PHYSICS      Nothing inside its own Schwarzschild radius or
//                   Compton wavelength, nothing beyond the Hubble radius,
//                   and every source has a plausible density envelope.
//   5. OUTLIERS     Within each source, objects > 1.5 dex (and > 6 MAD)
//                   from the running median of their size neighbours are
//                   dropped and LISTED in docs/dust-report.md for review.
//
// A rejection rate above 2% for any source fails the build — that means
// a parsing bug, not a few odd objects.
// =============================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readdirSync } from "node:fs";
import { SOURCES as CORE_SOURCES } from "./dust/sources.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = join(ROOT, "scripts", "dust", ".cache");
const OUT = join(ROOT, "src", "dust.json");
const REPORT = join(ROOT, "docs", "dust-report.md");
const REFRESH = process.argv.includes("--refresh");
// --only id1,id2 : run just these sources and print the report, write nothing
const ONLY = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7).split(",").filter(Boolean);
mkdirSync(CACHE, { recursive: true });

// curl (not fetch) so the environment's HTTPS proxy / CA settings apply.
function fetchText(url, file) {
  const p = join(CACHE, file);
  if (!REFRESH && existsSync(p)) return Promise.resolve(readFileSync(p, "utf8"));
  console.log(`  ↓ ${file}`);
  execFileSync("curl", ["-sSfL", "--retry", "3", "-m", "600", "-o", p, url], { stdio: "inherit" });
  return Promise.resolve(readFileSync(p, "utf8"));
}

// --- physics (same constants as src/data.js / validate-objects.mjs) ---
const G = 6.674e-8, c = 2.998e10, hbar = 1.055e-27;
const SCHW_C = Math.log10(2 * G / (c * c));
const COMPTON_C = Math.log10(hbar / c);
const HUBBLE_LOG_R = 28.14;
const SPHERE_C = Math.log10(4 * Math.PI / 3);
const logRho = (o) => o.logM - 3 * o.logR - SPHERE_C;

// Plausible mean-density envelopes, log10(g/cm³). Wide on purpose: they
// catch unit slips (a factor 10³ or 10⁶), not real astrophysical scatter.
const ENVELOPE = {
  nucleus: [13, 15.5], element: [-1.5, 2.5], mammal: [-3.5, 1.5],
  smallbody: [-1, 1.5], moon: [-1, 1.5], exoplanet: [-2.5, 2],
  debcat: [-9, 3], host: [-9, 3], gaia: [-11, 3], wd: [3, 9.5],
  cloud: [-25, -17], oc: [-27, -18], gc: [-24.5, -14], galaxy: [-28, -19], cluster: [-28.5, -24],
};
const ON_LINE = new Set(["hadron", "gw", "smbh"]); // placed on a boundary by definition
// A source may also set `density: [lo, hi]` (log10 g/cm³) instead of an
// ENVELOPE entry — every source MUST have one or the other unless ON_LINE.

const norm = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
const curated = JSON.parse(readFileSync(join(ROOT, "src", "objects.json"), "utf8"));
// Keyed by category too: the element "Mercury" is not the planet Mercury.
const curatedByName = new Map(curated.map((o) => [`${o.cat}:${norm(o.name)}`, o]));
// Curated names written differently from their catalogue entries
const ALIAS = { "1ceres": "ceres", "2pallas": "pallas", "4vesta": "vesta", "3juno": "juno",
  "433eros": "eros", "243ida": "ida", "951gaspra": "gaspra", "101955bennu": "bennu" };

const errors = [];
const report = [];
const packed = [];
const sourcesMeta = [];
const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

// Extra sources live one file each in scripts/dust/src-*.mjs, each
// exporting `default` = an array of source objects (same shape as above).
const SOURCES = [...CORE_SOURCES];
for (const f of readdirSync(join(ROOT, "scripts", "dust")).filter((f) => /^src-.*\.mjs$/.test(f)).sort()) {
  const mod = await import(join(ROOT, "scripts", "dust", f));
  SOURCES.push(...mod.default);
}
for (const src of SOURCES) {
  if (ONLY.length && !ONLY.includes(src.id)) continue;
  console.log(`• ${src.id}`);
  let rows;
  try {
    rows = await src.load.call(src, fetchText);
  } catch (e) {
    errors.push(`${src.id}: failed to load — ${e.message}`);
    continue;
  }
  const n0 = rows.length;
  if (n0 === 0) { errors.push(`${src.id}: 0 rows parsed`); continue; }
  const rejected = [];

  // ---- anchors ----
  for (const a of src.anchors || []) {
    const hit = rows.find((r) => r.name === a.name || r._anchor === a.name);
    if (!hit) { errors.push(`${src.id}: anchor "${a.name}" not found`); continue; }
    for (const k of ["logR", "logM"]) {
      if (a[k] === undefined) continue;
      const d = Math.abs(hit[k] - a[k]);
      if (d > a.tol) errors.push(`${src.id}: anchor ${a.name} ${k}=${hit[k].toFixed(4)} expected ${a[k].toFixed(4)} (off ${d.toFixed(4)} dex)`);
    }
  }

  // ---- finite + dedupe ----
  const seen = new Set();
  rows = rows.filter((r) => {
    if (!Number.isFinite(r.logR) || !Number.isFinite(r.logM) || !r.name) { rejected.push([r, "non-finite"]); return false; }
    const k = norm(r.name);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // ---- physics: triangle + density envelope ----
  rows = rows.filter((r) => {
    if (!ON_LINE.has(src.id)) {
      if (r.logR < r.logM + SCHW_C - 0.05) { rejected.push([r, "inside its Schwarzschild radius"]); return false; }
      if (r.logR < COMPTON_C - r.logM - 0.05) { rejected.push([r, "inside its Compton wavelength"]); return false; }
    }
    if (r.logR > HUBBLE_LOG_R) { rejected.push([r, "beyond the Hubble radius"]); return false; }
    const env = src.density || ENVELOPE[src.id];
    if (env) {
      const rho = logRho(r);
      if (rho < env[0] || rho > env[1]) { rejected.push([r, `density 10^${rho.toFixed(1)} g/cm³ outside [${env}]`]); return false; }
    }
    return true;
  });

  // ---- outliers vs size neighbours (same source) ----
  if (!ON_LINE.has(src.id) && rows.length >= 20) {
    const sorted = [...rows].sort((a, b) => a.logR - b.logR);
    const resid = new Map();
    for (const r of sorted) {
      const nb = sorted.filter((q) => q !== r && Math.abs(q.logR - r.logR) <= 0.15);
      if (nb.length < 8) continue;
      const med = median(nb.map((q) => q.logM));
      const mad = median(nb.map((q) => Math.abs(q.logM - med))) || 0.05;
      const dev = Math.abs(r.logM - med);
      if (dev > 1.5 && dev > 6 * mad) resid.set(r, `${dev.toFixed(2)} dex from size-neighbour median (MAD ${mad.toFixed(2)})`);
    }
    rows = rows.filter((r) => { if (resid.has(r)) { rejected.push([r, resid.get(r)]); return false; } return true; });
  }

  // ---- cross-check against curated objects ----
  const xcheck = [];
  rows = rows.filter((r) => {
    const k = norm(r.name);
    const cur = curatedByName.get(`${src.cat}:${ALIAS[k] || k}`);
    if (!cur) return true;
    const dR = r.logR - cur.logR, dM = r.logM - cur.logM;
    xcheck.push(`${r.name}: Δwidth ${dR >= 0 ? "+" : ""}${dR.toFixed(2)} dex, Δmass ${dM >= 0 ? "+" : ""}${dM.toFixed(2)} dex vs curated "${cur.name}"`);
    if (Math.abs(dM) > 0.3 || Math.abs(dR) > 0.3)
      errors.push(`${src.id}: ${r.name} disagrees with curated object by ΔR=${dR.toFixed(2)}, ΔM=${dM.toFixed(2)} dex`);
    return false; // curated copy wins
  });

  const rate = rejected.length / n0;
  if (rate > 0.02) errors.push(`${src.id}: ${(rate * 100).toFixed(1)}% of rows rejected (> 2%) — likely a parsing bug`);

  const idx = sourcesMeta.length;
  sourcesMeta.push({ id: src.id, label: src.label, cat: src.cat, cite: src.cite, radius: src.radius, n: rows.length });
  for (const r of rows) packed.push([r.name, +r.logR.toFixed(3), +r.logM.toFixed(3), idx]);

  report.push(`## ${src.label}\n\n- **Source:** ${src.cite}\n- **Radius plotted:** ${src.radius}\n- **Kept:** ${rows.length} of ${n0} rows` +
    ((src.anchors || []).length ? `\n- **Anchors checked:** ${src.anchors.map((a) => a.name).join(", ")}` : "") +
    (xcheck.length ? `\n- **Matches curated objects** (curated kept, dust copy dropped):\n${xcheck.map((s) => `  - ${s}`).join("\n")}` : "") +
    (rejected.length ? `\n- **Rejected (${rejected.length}):**\n${rejected.slice(0, 40).map(([r, why]) => `  - ${r.name ?? "?"} — ${why}`).join("\n")}` +
      (rejected.length > 40 ? `\n  - … and ${rejected.length - 40} more` : "") : ""));
  console.log(`  kept ${rows.length}/${n0}${rejected.length ? `, rejected ${rejected.length}` : ""}${xcheck.length ? `, ${xcheck.length} curated matches` : ""}`);
}

for (const src of SOURCES) {
  if (ONLY.length && !ONLY.includes(src.id)) continue;
  if (!ON_LINE.has(src.id) && !src.density && !ENVELOPE[src.id]) errors.push(`${src.id}: no density envelope`);
}
if (ONLY.length && !process.argv.includes("--write")) {
  console.log("\n" + report.join("\n\n"));
  if (errors.length) { console.error(`\n✗ ${errors.length} error(s):`); errors.forEach((e) => console.error("  " + e)); process.exit(1); }
  console.log("\n✓ --only run passed (nothing written)");
  process.exit(0);
}
if (errors.length) {
  console.error(`\n✗ ${errors.length} error(s):`);
  errors.forEach((e) => console.error("  " + e));
  process.exit(1);
}

// Compact columnar layout. Names that share a catalogue prefix/suffix
// ("Gaia DR3 …", "… nucleus") store it once on the source.
packed.sort((a, b) => a[1] - b[1]);
sourcesMeta.forEach((meta, idx) => {
  const names = packed.filter((p) => p[3] === idx).map((p) => p[0]);
  meta.pre = commonEnd(names, false);
  meta.suf = commonEnd(names, true);
});
const out = { sources: sourcesMeta, name: [], r: [], m: [], s: [] };
for (const [name, r, m, s] of packed) {
  const { pre, suf } = sourcesMeta[s];
  out.name.push(name.slice(pre.length, name.length - suf.length));
  out.r.push(r); out.m.push(m); out.s.push(s);
}
writeFileSync(OUT, JSON.stringify(out));

// Shared leading (or trailing) text, cut at a word boundary; "" if short.
function commonEnd(names, fromEnd) {
  if (names.length < 20) return "";
  const rev = (x) => [...x].reverse().join("");
  const list = fromEnd ? names.map(rev) : names;
  let p = list[0];
  for (const n of list) { while (!n.startsWith(p)) p = p.slice(0, -1); if (!p) return ""; }
  const cut = p.lastIndexOf(" ");
  p = cut >= 0 ? p.slice(0, cut + 1) : "";
  if (p.length < 4 || names.some((n) => n.length <= p.length)) return "";
  return fromEnd ? rev(p) : p;
}
writeFileSync(REPORT, `# Dust layer — build report\n\nGenerated by \`npm run build:dust\`. ${packed.length.toLocaleString("en")} background objects from ${sourcesMeta.length} catalogues.\nSee \`scripts/build-dust.mjs\` for the checks every source must pass.\n\n${report.join("\n\n")}\n`);
console.log(`\n✓ ${packed.length} dust objects → src/dust.json (${(readFileSync(OUT).length / 1024).toFixed(0)} KB)`);
