// =============================================================
// src-lepidoptera.mjs — butterflies and moths (LEPSIZE 2024)
// =============================================================
// García-Barros (2025) measured dry body mass and body length (plus wing,
// head, thorax and abdomen dimensions) of 2,645 Lepidoptera species,
// mostly European, on dried museum specimens. The CSV comes from Dryad,
// which only serves it to signed-in users, so a copy (CC0) is committed at
// scripts/dust/data/lepsize2024.csv.
//
// Units (checked against known species: Acherontia atropos Bl 47 mm,
// DBw 860 mg → ≈2.5 g alive, matching its 2–3 g; Pieris rapae Bl 16 mm):
//   Bl  = body length, mm          DBw = dry body mass, mg
//   n   = specimens measured (species means)
// Radius = half the body length — the same convention as the bees
// (Kendall 2019) and the hand-placed insects. Wet mass = dry / 0.35, the
// insect water content used for the other insect sources (Studier &
// Sevick 1992), and flagged in the label.
// =============================================================

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const log = Math.log10;
const DRY_PER_WET = 0.35;
const FILE = join(dirname(fileURLToPath(import.meta.url)), "data", "lepsize2024.csv");

function rows() {
  const lines = readFileSync(FILE, "utf8").replace(/^﻿/, "").split(/\r?\n/).filter(Boolean);
  const split = (l) => {
    const out = []; let cur = "", q = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (ch === '"') { if (q && l[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
      else if (ch === "," && !q) { out.push(cur); cur = ""; }
      else cur += ch;
    }
    out.push(cur);
    return out;
  };
  const head = split(lines[0]);
  return lines.slice(1).map((l) => {
    const c = split(l), o = {};
    head.forEach((h, i) => (o[h] = c[i]));
    return o;
  });
}

// '"Micropterix aureatella (Scopoli, 1763)"' → "Micropterix aureatella";
// open names (sp., cf., aff.) are skipped.
export function lepsizeName(raw) {
  const s = String(raw).replace(/"/g, "").replace(/\s+/g, " ").trim();
  if (/\b(sp|cf|aff|nr)\./.test(s)) return null;
  const m = s.match(/^([A-Z][a-z]+) ([a-z][a-z-]+)(?: ([a-z][a-z-]+))?(?=\s|$|\()/);
  if (!m) return null;
  return m[3] ? `${m[1]} ${m[2]} ${m[3]}` : `${m[1]} ${m[2]}`;
}

export function lepsizeSpecies() {
  const out = new Map();
  for (const r of rows()) {
    const name = lepsizeName(r.SPECIES);
    const bl = Number(r.Bl), dbw = Number(r.DBw);
    if (!name || !(bl > 0) || !(dbw > 0) || out.has(name)) continue;
    out.set(name, { name, bl, dbw, family: r.FAMILY });
  }
  return out;
}

export default [
  {
    id: "lepidoptera",
    label: "Butterfly / moth · LEPSIZE (wet from dry mass)",
    cat: "macro",
    cite: "García-Barros (2025) LEPSIZE2024 — body size of 2,645 Lepidoptera species, Dryad doi:10.5061/dryad.bk3j9kdnw (CC0): body length and dry body mass of the same museum specimens, species means. Wet mass = dry / 0.35 (Studier & Sevick 1992)",
    radius: "half the body length; mass = dry body mass ÷ 0.35",
    density: [-3, 0.3],
    anchors: [
      // Death's-head hawkmoth: body 47.18 mm, dry 859.8 mg (≈ 2.5 g alive; textbook 2–3 g)
      { name: "Acherontia atropos", logR: log(4.718 / 2), logM: log(0.8598 / DRY_PER_WET), tol: 0.01 },
      { name: "Acherontia atropos", logM: log(2.5), tol: 0.15 },
      // Cabbage white: body 15.8 mm
      { name: "Pieris rapae", logR: log(1.58 / 2), tol: 0.01 },
    ],
    async load() {
      return [...lepsizeSpecies().values()].map((s) => ({
        name: s.name,
        logR: log(s.bl / 10 / 2),
        logM: log(s.dbw / 1000 / DRY_PER_WET),
      }));
    },
  },
];
