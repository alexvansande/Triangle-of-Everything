#!/usr/bin/env node
/**
 * Static asset & request-shape audit for the Triangle of Everything.
 *
 * Complements scripts/mobile-perf.mjs (runtime measurement) by answering,
 * from the repo alone: what will a phone have to download, in how many
 * round-trips, and which files are bigger than their on-screen job requires?
 *
 * Usage:
 *   node scripts/asset-audit.mjs           # human report
 *   node scripts/asset-audit.mjs --json    # machine-readable to stdout
 *
 * Checks:
 *   1. dist/assets chunk shape (request-storm detection, gzip sizes)
 *   2. content/icons/*.webp   — dimensions vs on-map display size
 *   3. content/images/*.webp  — dimensions vs sidebar display size
 *   4. public/tiles pyramid   — per-zoom weight and tile counts
 *   5. index.html             — render-blocking external requests
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const asJson = process.argv.includes('--json');
const KB = (b) => +(b / 1024).toFixed(1);

// Display assumptions (CSS px), derived from the app:
// - map icons render up to ~230 CSS px at deep zoom (effectiveIconSize max
//   115 × per-object multiplier up to 2), on @3x screens — so 512px sources
//   are justified; anything beyond that is waste.
// - sidebar photos render at sidebar width, ~380px on phone / ~420px desktop.
const ICON_MAX_PX = 512;
const IMAGE_MAX_PX = 840;  // 420 CSS px * 2x

const report = { when: new Date().toISOString(), sections: {}, suggestions: [] };
const suggest = (priority, text) => report.suggestions.push({ priority, text });

function listFiles(dir, extRe) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => extRe.test(f))
    .map((f) => ({ name: f, path: join(dir, f), bytes: statSync(join(dir, f)).size }));
}

// ------------------------------------------------------------ 1. dist shape --
{
  const dir = join(ROOT, 'dist', 'assets');
  const js = listFiles(dir, /\.js$/);
  const css = listFiles(dir, /\.css$/);
  const imgs = listFiles(dir, /\.(webp|png|jpe?g|avif|svg)$/);
  const gz = (f) => KB(gzipSync(readFileSync(f.path)).length);

  const jsSized = js.map((f) => ({ ...f, kb: KB(f.bytes), gzKb: gz(f) })).sort((a, b) => b.bytes - a.bytes);
  const tiny = jsSized.filter((f) => f.bytes < 10 * 1024);
  report.sections.dist = {
    built: js.length > 0,
    jsChunks: js.length,
    jsTotalKB: KB(js.reduce((a, f) => a + f.bytes, 0)),
    jsTotalGzKB: +jsSized.reduce((a, f) => a + f.gzKb, 0).toFixed(1),
    tinyChunks: tiny.length,
    cssKB: KB(css.reduce((a, f) => a + f.bytes, 0)),
    bundledImages: imgs.length,
    bundledImagesKB: KB(imgs.reduce((a, f) => a + f.bytes, 0)),
    top: jsSized.slice(0, 8).map((f) => ({ name: f.name, kb: f.kb, gzKb: f.gzKb })),
  };
  if (!js.length) {
    suggest('info', 'dist/ not built — run `npm run build` for chunk-shape analysis.');
  } else {
    if (tiny.length > 20) {
      suggest('critical', `${tiny.length} JS chunks under 10KB in dist/assets — the import.meta.glob over icons/images emits one module chunk per file, so startup pays ~2 round-trips per icon. Bundle icon URLs with { query: "?url", eager: true } (no per-file chunk), or build a single icon spritesheet/atlas.`);
    }
    const katex = jsSized.find((f) => /katex/i.test(f.name));
    if (katex && katex.gzKb > 40) {
      suggest('high', `KaTeX chunk is ${katex.gzKb}KB gzipped. Load it on demand (dynamic import when a formula first becomes visible), not at startup.`);
    }
  }
}

// --------------------------------------------------------------- 2. icons --
{
  const files = listFiles(join(ROOT, 'content', 'icons'), /\.webp$/);
  let oversized = [];
  for (const f of files) {
    const m = await sharp(f.path).metadata();
    f.w = m.width; f.h = m.height;
    if (Math.max(m.width, m.height) > ICON_MAX_PX) oversized.push(f);
  }
  oversized.sort((a, b) => b.bytes - a.bytes);
  report.sections.icons = {
    count: files.length,
    totalKB: KB(files.reduce((a, f) => a + f.bytes, 0)),
    oversized: oversized.map((f) => ({ name: f.name, px: `${f.w}x${f.h}`, kb: KB(f.bytes) })).slice(0, 15),
  };
  if (oversized.length) {
    suggest('medium', `${oversized.length} icons exceed ${ICON_MAX_PX}px (max on-map render ≈230 CSS px @3x ≈ 690 device px, but 512 is the practical ceiling). Re-encode via scripts/process-icons.mjs.`);
  }
}

// -------------------------------------------------------------- 3. photos --
{
  const files = listFiles(join(ROOT, 'content', 'images'), /\.webp$/);
  let oversized = [];
  for (const f of files) {
    const m = await sharp(f.path).metadata();
    f.w = m.width; f.h = m.height;
    if (m.width > IMAGE_MAX_PX) oversized.push(f);
  }
  oversized.sort((a, b) => b.bytes - a.bytes);
  report.sections.images = {
    count: files.length,
    totalKB: KB(files.reduce((a, f) => a + f.bytes, 0)),
    over100KB: files.filter((f) => f.bytes > 100 * 1024).map((f) => ({ name: f.name, kb: KB(f.bytes) })),
    oversized: oversized.map((f) => ({ name: f.name, px: `${f.w}x${f.h}`, kb: KB(f.bytes) })).slice(0, 15),
  };
  if (oversized.length) {
    suggest('low', `${oversized.length} sidebar photos wider than ${IMAGE_MAX_PX}px (sidebar renders ≈420 CSS px). Resize on import.`);
  }
}

// --------------------------------------------------------------- 4. tiles --
{
  const base = join(ROOT, 'public', 'tiles');
  const zooms = existsSync(base) ? readdirSync(base).filter((d) => /^z\d+$/.test(d)).sort() : [];
  const perZoom = zooms.map((z) => {
    const files = listFiles(join(base, z), /\.(webp|png|jpe?g)$/);
    return { zoom: z, tiles: files.length, kb: KB(files.reduce((a, f) => a + f.bytes, 0)) };
  });
  report.sections.tiles = {
    perZoom,
    totalKB: +perZoom.reduce((a, z) => a + z.kb, 0).toFixed(1),
    meta: existsSync(join(base, 'meta.json')) ? JSON.parse(readFileSync(join(base, 'meta.json'), 'utf8')) : null,
  };
}

// ---------------------------------------------------- 5. render-blocking --
{
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  const blocking = [...html.matchAll(/<link[^>]+href="(https?:[^"]+)"[^>]*>/g)]
    .map((m) => m[1])
    .filter((u) => !/preconnect/.test(html.slice(Math.max(0, html.indexOf(u) - 120), html.indexOf(u))));
  const fontCss = blocking.filter((u) => /fonts\.googleapis/.test(u));
  report.sections.html = { externalLinks: blocking };
  if (fontCss.length) {
    suggest('high', 'Google Fonts CSS is render-blocking and adds a third-party round-trip chain (css → woff2) before text paints. Self-host Inter + Space Mono as woff2 with font-display: swap, preload the two weights actually used above the fold.');
  }
}

// ---------------------------------------------------------------- output --
report.suggestions.sort((a, b) =>
  ['critical', 'high', 'medium', 'low', 'info'].indexOf(a.priority) -
  ['critical', 'high', 'medium', 'low', 'info'].indexOf(b.priority));

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

const s = report.sections;
console.log('\n── dist/assets chunk shape ───────────────────────────');
if (s.dist.built) {
  console.log(`  ${s.dist.jsChunks} JS chunks · ${s.dist.jsTotalKB}KB raw · ${s.dist.jsTotalGzKB}KB gz · ${s.dist.tinyChunks} chunks <10KB`);
  console.log(`  CSS ${s.dist.cssKB}KB · ${s.dist.bundledImages} bundled images (${s.dist.bundledImagesKB}KB)`);
  for (const t of s.dist.top) console.log(`    ${String(t.kb).padStart(8)}KB (${t.gzKb}KB gz)  ${t.name}`);
} else console.log('  (not built)');

console.log('\n── content/icons ─────────────────────────────────────');
console.log(`  ${s.icons.count} icons · ${s.icons.totalKB}KB total`);
for (const f of s.icons.oversized) console.log(`    oversized ${f.px}  ${String(f.kb).padStart(7)}KB  ${f.name}`);

console.log('\n── content/images (sidebar photos) ───────────────────');
console.log(`  ${s.images.count} photos · ${s.images.totalKB}KB total · ${s.images.over100KB.length} over 100KB`);
for (const f of s.images.oversized) console.log(`    oversized ${f.px}  ${String(f.kb).padStart(7)}KB  ${f.name}`);

console.log('\n── tile pyramid ──────────────────────────────────────');
for (const z of s.tiles.perZoom) console.log(`    ${z.zoom}: ${String(z.tiles).padStart(4)} tiles  ${z.kb}KB`);
console.log(`    total ${s.tiles.totalKB}KB`);

console.log('\n── suggestions ───────────────────────────────────────');
for (const g of report.suggestions) console.log(`  [${g.priority}] ${g.text}`);
console.log('');
