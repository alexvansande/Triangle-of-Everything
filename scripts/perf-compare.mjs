#!/usr/bin/env node
/**
 * Compare two mobile-perf reports (scripts/perf-reports/*.json).
 *
 * Usage:
 *   node scripts/perf-compare.mjs                 # latest two reports
 *   node scripts/perf-compare.mjs before.json after.json
 *
 * Prints deltas for load metrics and per-gesture frame rates, so every
 * optimization can be proven (or disproven) against a baseline.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'scripts', 'perf-reports');

let [a, b] = process.argv.slice(2).filter((x) => !x.startsWith('--'));
if (!a || !b) {
  const files = readdirSync(DIR).filter((f) => f.startsWith('mobile-perf-') && f.endsWith('.json')).sort();
  if (files.length < 2) {
    console.error('Need two reports in scripts/perf-reports/ (or pass two paths).');
    process.exit(2);
  }
  a = join(DIR, files[files.length - 2]);
  b = join(DIR, files[files.length - 1]);
}
const load = (p) => JSON.parse(readFileSync(existsSync(p) ? p : join(DIR, p), 'utf8'));
const A = load(a), B = load(b);

const fmt = (v) => (v == null ? 'n/a' : typeof v === 'number' ? +v.toFixed(1) : v);
const delta = (va, vb, lowerBetter = true) => {
  if (va == null || vb == null) return '';
  const d = vb - va;
  if (Math.abs(d) < 1e-9) return '  =';
  const good = lowerBetter ? d < 0 : d > 0;
  const pct = va !== 0 ? ` (${d > 0 ? '+' : ''}${((d / va) * 100).toFixed(0)}%)` : '';
  return `  ${good ? '✓' : '✗'} ${d > 0 ? '+' : ''}${+d.toFixed(1)}${pct}`;
};

console.log(`\nA (before): ${A.when}  [${A.conditions.net}, ${A.conditions.cpuThrottle}x cpu]  ${A.target}`);
console.log(`B (after):  ${B.when}  [${B.conditions.net}, ${B.conditions.cpuThrottle}x cpu]  ${B.target}`);
if (A.conditions.net !== B.conditions.net || A.conditions.cpuThrottle !== B.conditions.cpuThrottle) {
  console.log('⚠ conditions differ — deltas are not apples-to-apples');
}

console.log('\n── Load ──────────────────────────────────────────────');
const rows = [
  ['FCP ms', A.load.fcpMs, B.load.fcpMs],
  ['LCP ms', A.load.lcpMs, B.load.lcpMs],
  ['requests', A.load.requests, B.load.requests],
  ['total KB', A.load.totalTransferKB, B.load.totalTransferKB],
  ['JS KB', A.load.byType.js?.kb, B.load.byType.js?.kb],
  ['long-task ms', A.load.longTaskTotalMs, B.load.longTaskTotalMs],
  ['longest task ms', A.load.longestTaskMs, B.load.longestTaskMs],
  ['SVG nodes', A.load.svgNodes, B.load.svgNodes],
  ['heap MB', A.load.heapMB, B.load.heapMB],
];
for (const [label, va, vb] of rows) {
  console.log(`  ${label.padEnd(16)} ${String(fmt(va)).padStart(8)} → ${String(fmt(vb)).padStart(8)}${delta(va, vb)}`);
}

console.log('\n── Gestures ──────────────────────────────────────────');
const gb = new Map((B.gestures || []).map((g) => [g.label, g]));
for (const ga of A.gestures || []) {
  const g2 = gb.get(ga.label);
  if (!g2) continue;
  console.log(`  ${ga.label}`);
  console.log(`    avg fps ${String(fmt(ga.avgFps)).padStart(6)} → ${String(fmt(g2.avgFps)).padStart(6)}${delta(ga.avgFps, g2.avgFps, false)}`);
  console.log(`    p95 ms  ${String(fmt(ga.p95Ms)).padStart(6)} → ${String(fmt(g2.p95Ms)).padStart(6)}${delta(ga.p95Ms, g2.p95Ms)}`);
}
console.log('');
