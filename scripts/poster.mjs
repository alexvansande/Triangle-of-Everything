#!/usr/bin/env node
/**
 * Print the site as a poster.
 *
 * The site started as a poster; this closes the loop. Headless Chrome loads
 * the app, switches it into poster mode (window.__poster in src/main.js —
 * no HTML chrome, no animation), frames three views and screenshots each at
 * print resolution. sharp composes them into one raster page; Chrome then
 * prints that raster with vector text on top — the title and the axes
 * (grid numbers, unit references, epoch labels) — as a PDF.
 *
 *   ┌──────────────────────────┐
 *   │ THE TRIANGLE OF EVERYTHING │   title, full width (vector)
 *   │      the whole triangle  │   main chart: one background (nebula,
 *   │      with its axes       │   grid, shading) under the whole page
 *   │ ┌───────┬──────────────┐ │
 *   │ │ part. │   stellar    │ │   bottom row: 1:3 particles, 2:3 stellar,
 *   │ │       │              │ │   cut into the page, axes around them
 *   └─┴───────┴──────────────┴─┘
 *
 * The connection paths the site animates with dots print as static arrows.
 * Object names print in bold Helvetica caps wherever they fit without
 * touching another label, an icon or the panel edge; the rest are dropped.
 * In-chart annotations are still off.
 *
 * Outputs (in posters/): <name>.pdf (raster + vector text), <name>.png (the
 * raster alone), <name>-preview.jpg (small, for a quick look).
 *
 * Usage:
 *   node scripts/poster.mjs                       # A1 @ 300 dpi → posters/poster-A1.*
 *   node scripts/poster.mjs --size A2 --dpi 300   # other paper
 *   node scripts/poster.mjs --scale 2             # smaller icons/type → more objects shown
 *   node scripts/poster.mjs --axis-font 1.4       # bigger axis type (default 1.25×)
 *   node scripts/poster.mjs --label-size 12       # object labels in CSS px (default 11)
 *   node scripts/poster.mjs --text-size 11        # tour callout text in CSS px (default 12)
 *   node scripts/poster.mjs --dist                # render dist/ (run `npm run build`)
 *   node scripts/poster.mjs --url http://...      # any running server
 *   node scripts/poster.mjs --panels              # also keep the three raw panels
 *
 * `--scale` is device pixels per CSS pixel. The chart is laid out in CSS
 * pixels, so it sets how large icons, dots and axis type print and how many
 * objects are shown individually versus merged into a cluster dot.
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import { PLANCK_LOG_R, PLANCK_LOG_M, HUBBLE_LOG_R, schwarzschildM, comptonM } from '../src/data.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ------------------------------------------------------------------ flags --
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] != null ? args[i + 1] : dflt;
};

const PAPER_MM = { A0: [841, 1189], A1: [594, 841], A2: [420, 594], A3: [297, 420], A4: [210, 297] };
const sizeName = opt('size', 'A1').toUpperCase();
if (!PAPER_MM[sizeName]) {
  console.error(`Unknown --size "${sizeName}" (use: ${Object.keys(PAPER_MM).join(', ')})`);
  process.exit(2);
}
const [PAGE_MM_W, PAGE_MM_H] = PAPER_MM[sizeName];
const dpi = Number(opt('dpi', '300'));
const scale = Number(opt('scale', '2.5'));    // device px per CSS px
const fontScale = Number(opt('font-scale', '1'));
const iconSize = Number(opt('icon-size', '100'));
const axisFont = Number(opt('axis-font', '1.25'));   // multiplier on the app's axis type
const labelSize = Number(opt('label-size', '11'));  // object labels, CSS px
const textSize = Number(opt('text-size', '12'));    // tour-text callouts, CSS px
const CALLOUT = {
  titleSize: textSize * 1.25, bodySize: textSize, lineHeight: 1.35, paraGap: 5,
  boxWidth: 380, minWidth: 260, gap: 30, pad: 16, dotR: 3.2,
  split: 0.6, // anchors right of this fraction across the triangle go to the right column
};
const outBase = resolve(ROOT, opt('out', `posters/poster-${sizeName}`)).replace(/\.(pdf|png|jpe?g)$/i, '');
const keepPanels = flag('panels');
const explicitUrl = opt('url', null);
const useDist = flag('dist');

const mmToPx = (mm) => Math.round((mm / 25.4) * dpi);
const PAGE_W = mmToPx(PAGE_MM_W);
const PAGE_H = mmToPx(PAGE_MM_H);

// ----------------------------------------------------------------- layout --
// Everything is a fraction of the page so any size/dpi gives the same poster.
// Device px unless noted; the app's axis margins are handed over in CSS px.
const LAYOUT = {
  margin: 0.03,        // page margin (title, insets), × page width
  gutter: 0.02,        // gap between panels, × page width
  titleTop: 0.028,     // title cap-top, × page height
  titleTracking: 0.06, // letter-spacing, × title font size
  titleGap: 0.012,     // between title and the top axis, × page height
  axisTop: 0.05,       // main chart's top axis column (density / time), × page height
  axisBottom: 0.055,   // main chart's bottom axis column (width), × page height
  axisSide: 0.075,     // main chart's left/right axis columns, × page width
  insetMargins: { left: 48, right: 64, top: 44, bottom: 60 }, // CSS px
  frame: 'rgba(255,255,255,0.35)', // thin line around each inset's plot area
};

const TITLE = [
  { text: 'THE TRIANGLE OF ', weight: 300 },
  { text: 'EVERYTHING', weight: 700 },
];
const TITLE_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

// Data regions ({x: log10 radius cm, y: log10 mass g}) each panel must show.
// fit() centers the region and reveals more on the panel's longer side.
// iconSize is the app's icon-size setting (percent) for that panel.
const PANELS = {
  main: {
    region: { x: [-36, 30], y: [-68, 58] }, pad: 0.02,
    iconSize: 120,
  },
  // Quarks → photons down the Compton edge, atoms & molecules above (square).
  particles: {
    region: { x: [-17, -3.5], y: [-34, -20.5] }, pad: 0.04,
    iconSize: 80,
  },
  // The stellar cycle: from Jupiter and the brown dwarfs through the Sun,
  // giants and remnants out to the nebulae (2:1 landscape).
  stellar: {
    region: { x: [5.5, 19.5], y: [29.8, 36.6] }, pad: 0.04,
    iconSize: 80,
  },
};

/** Page geometry. The main chart covers the page; its axis columns hold the
 *  title (top) and the inset row (bottom). The bottom row splits 1:3 / 2:3
 *  with a square particles inset, which sets the row height. */
function computeLayout(titleH) {
  const m = Math.round(PAGE_W * LAYOUT.margin);
  const g = Math.round(PAGE_W * LAYOUT.gutter);
  const innerW = PAGE_W - 2 * m;
  const partW = Math.floor((innerW - g) / 3);
  const rowH = partW;
  const rowY = PAGE_H - m - rowH;
  const titleTop = Math.round(PAGE_H * LAYOUT.titleTop);
  const chartTop = titleTop + titleH + Math.round(PAGE_H * (LAYOUT.titleGap + LAYOUT.axisTop));
  const chartBottom = rowY - g - Math.round(PAGE_H * LAYOUT.axisBottom);
  const side = Math.round(PAGE_W * LAYOUT.axisSide);
  const css = (v) => Math.round(v / scale);
  const im = LAYOUT.insetMargins;
  return {
    m, g, titleTop,
    boxes: {
      main: { x: 0, y: 0, w: PAGE_W, h: PAGE_H, bleed: true,
              margins: { left: css(side), right: css(side), top: css(chartTop), bottom: css(PAGE_H - chartBottom) } },
      particles: { x: m, y: rowY, w: partW, h: rowH, margins: im },
      stellar: { x: m + partW + g, y: rowY, w: innerW - g - partW, h: rowH, margins: im },
    },
  };
}

// ------------------------------------------------------------ server boot --
function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean);
  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    console.error('Chrome not found. Set CHROME_PATH=/path/to/chrome');
    process.exit(2);
  }
  return found;
}

async function startServer() {
  if (explicitUrl) return { url: explicitUrl, proc: null };
  const port = useDist ? 4197 : 5197;
  const cmd = useDist
    ? ['vite', 'preview', '--port', String(port), '--strictPort']
    : ['vite', '--port', String(port), '--strictPort'];
  if (useDist && !existsSync(join(ROOT, 'dist', 'index.html'))) {
    console.error('No dist/index.html — run `npm run build` first (or drop --dist).');
    process.exit(2);
  }
  const proc = spawn('npx', cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
  const url = `http://localhost:${port}`;
  for (let i = 0; i < 200; i++) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok || res.status === 404) return { url, proc };
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 150));
  }
  proc.kill();
  console.error(`Server at ${url} never came up.`);
  process.exit(2);
}

// ------------------------------------------------------------- rendering --
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Chrome only rasterizes what is near the window, and a window past ~4000
// device px on a side comes back with unpainted black tiles. So each panel
// is laid out once on a fixed stage of its full CSS size, and the browser
// window — kept at most this many device px wide — slides across the stage
// capturing one piece at a time. Everything is placed once for the whole
// stage, so the pieces stitch seamlessly.
const MAX_TILE_DEVICE_PX = 3000;

/** Lay the chart out on the current stage and settle: poster mode with the
 *  given axis margins, the region framed, assets loaded. */
async function layoutPanel(page, spec, cssW, cssH, margins, frame) {
  const layout = await page.evaluate(
    (o) => window.__poster.enter(o),
    { fontScale, iconSize: (iconSize / 100) * spec.iconSize, text: false, arrows: true,
      labels: true, labelSize, margins, stage: { W: cssW, H: cssH } },
  );
  const fitInfo = await page.evaluate((r, p, f) => window.__poster.fit(r, p, f), spec.region, spec.pad, frame);
  await sleep(600); // zoom "end" → full redraw (tiles + vectors + settle)
  const info = await page.evaluate(() => window.__poster.ready());
  await sleep(200);
  return { layout, info, k: fitInfo.k };
}

/** Capture the whole stage in tiles at `scale` device px per CSS px. */
async function captureStage(page, cssW, cssH, tile) {
  // Tile edges in CSS px; device edges are rounded so neighbours share an
  // edge exactly even when scale × tile is fractional.
  const edges = (n) => { const e = []; for (let v = 0; v < n; v += tile) e.push(v); e.push(n); return e; };
  const xs = edges(cssW), ys = edges(cssH);
  const dev = (v) => Math.round(v * scale);
  const pieces = [];
  for (let j = 0; j < ys.length - 1; j++) {
    for (let i = 0; i < xs.length - 1; i++) {
      const x = xs[i], y = ys[j], w = xs[i + 1] - x, h = ys[j + 1] - y;
      await page.evaluate((x, y) => window.__poster.shift(x, y), x, y);
      await sleep(120);
      const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: w, height: h } });
      const dw = dev(x + w) - dev(x), dh = dev(y + h) - dev(y);
      pieces.push({ input: await sharp(png).resize(dw, dh, { fit: 'fill' }).png().toBuffer(), left: dev(x), top: dev(y) });
    }
  }
  await page.evaluate(() => window.__poster.shift(0, 0));
  const stage = await sharp({ create: { width: dev(cssW), height: dev(cssH), channels: 3, background: '#000' } })
    .composite(pieces).png().toBuffer();
  return { stage, tiles: pieces.length };
}

/** The plot area of a box (the box minus its axis margins), in device px. */
function plotRect(box) {
  const m = box.margins;
  const x = box.x + Math.round(m.left * scale), y = box.y + Math.round(m.top * scale);
  return { x, y, w: box.x + box.w - Math.round(m.right * scale) - x, h: box.y + box.h - Math.round(m.bottom * scale) - y };
}

/** Render one panel on a stage of the box's CSS size and return its bitmap
 *  plus its text layers (axes, object labels) as SVG markup for the overlay.
 *
 *  bleed (the main chart): the chart area is the whole box, so the grid,
 *  region tints and triangle shading run edge to edge under everything;
 *  the region is fitted into the plot area (box minus axis margins). The
 *  axes come from a second layout pass with the plot area as chart area —
 *  same region fit, so the same data→page mapping — laid out but not
 *  captured.
 *
 *  cutout (an inset): one pass with the axis margins; only the plot area
 *  is kept, so the numbers around it print on the page background. */
async function renderPanel(page, name, box) {
  const spec = PANELS[name];
  const cssW = Math.round(box.w / scale);
  const cssH = Math.round(box.h / scale);
  const tile = Math.max(256, Math.floor(MAX_TILE_DEVICE_PX / scale));
  const m = box.margins;
  const t0 = Date.now(); const lap = []; let tl = t0;
  const mark = (l) => { const n = Date.now(); lap.push(`${l} ${((n - tl) / 1000).toFixed(1)}s`); tl = n; };
  await page.setViewport({ width: Math.min(cssW, tile), height: Math.min(cssH, tile), deviceScaleFactor: scale });
  await sleep(250); // let the app's debounced resize relayout settle

  let axes, info, layout, kAxes = null;
  if (box.bleed) {
    const none = { left: 0, right: 0, top: 0, bottom: 0 };
    const frame = { x: m.left, y: m.top, w: cssW - m.left - m.right, h: cssH - m.top - m.bottom };
    ({ info, layout } = await layoutPanel(page, spec, cssW, cssH, none, frame));
  } else {
    ({ info, layout } = await layoutPanel(page, spec, cssW, cssH, m, null));
    axes = await page.evaluate((f) => window.__poster.overlay(f), axisFont);
  }
  mark('layout');
  const { stage, tiles } = await captureStage(page, cssW, cssH, tile);
  mark('capture');
  if (box.bleed) {
    const pass2 = await layoutPanel(page, spec, cssW, cssH, m, null);
    axes = await page.evaluate((f) => window.__poster.overlay(f), axisFont);
    kAxes = pass2.info;
    mark('axes');
  }
  // The stage is CSS × scale, rounded; snap to the exact box so composition is tight.
  let buf = await sharp(stage).resize(box.w, box.h, { fit: 'fill' }).png().toBuffer();
  if (!box.bleed) {
    const r = plotRect(box);
    buf = await sharp(buf).extract({ left: r.x - box.x, top: r.y - box.y, width: r.w, height: r.h }).png().toBuffer();
  }
  mark('stitch');
  const view = (i) => `x[${i.x0.toFixed(2)}, ${i.x1.toFixed(2)}] y[${i.y0.toFixed(2)}, ${i.y1.toFixed(2)}]`;
  console.log(
    `  ${name.padEnd(9)} ${String(cssW).padStart(5)}×${String(cssH).padEnd(5)} css → ${box.w}×${box.h} px in ${tiles} tiles` +
    `   images=${info.images}   view ${view(info)}   chart ${layout.cw}×${layout.ch}   [${lap.join(' · ')}]` +
    (kAxes ? `\n            axes pass: plot view ${view(kAxes)}` : ''),
  );
  return { buf, axes, view: kAxes || info };
}

/** Thin frame around each inset's plot area. */
function frameSvg(boxes) {
  const sw = Math.max(2, scale);
  const rects = ['particles', 'stellar'].map((k) => {
    const r = plotRect(boxes[k]);
    return `<rect x="${r.x - sw / 2}" y="${r.y - sw / 2}" width="${r.w + sw}" height="${r.h + sw}" fill="none" stroke="${LAYOUT.frame}" stroke-width="${sw}"/>`;
  });
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${PAGE_W}" height="${PAGE_H}">${rects.join('')}</svg>`);
}

/** Title markup: one <text>, light + bold runs, fitted to `width` device px
 *  at font size `fontPx`. Baseline sits `capTop` + cap height (≈0.72 em). */
function titleSvg(fontPx, capTop, x) {
  const spans = TITLE.map((r) => `<tspan font-weight="${r.weight}">${r.text.replace(/ $/, ' ')}</tspan>`).join('');
  return `<text x="${x}" y="${(capTop + 0.72 * fontPx).toFixed(1)}" font-family="${TITLE_FONT}" font-size="${fontPx.toFixed(2)}" letter-spacing="${(fontPx * LAYOUT.titleTracking).toFixed(2)}" fill="#ffffff" xml:space="preserve">${spans}</text>`;
}

/** Print-page HTML: the raster as a full-bleed image, the vector overlay
 *  (title + every panel's axis layer) as an SVG on top, sized in mm so the
 *  PDF page is exactly the paper. */
function printHtml({ rasterFile, panels, boxes, title }) {
  const calloutScript = String.raw`
// Tour callouts: a white dot on the chart, a straight leader, and the step's
// title and text in the free space beside the triangle. Boxes stack down the
// left and right columns in anchor order; a box that would overlap the
// triangle, another box, or the frame edge is dropped.
window.layoutCallouts = function ({ steps, frame, view, tri, scale, style }) {
  const S = (v) => v * scale;
  const X = (r) => frame.x + (r - view.x0) / (view.x1 - view.x0) * frame.w;
  const Y = (m) => frame.y + (view.y1 - m) / (view.y1 - view.y0) * frame.h;
  const A = { x: X(tri.apex[0]), y: Y(tri.apex[1]) };
  const T = { x: X(tri.top[0]), y: Y(tri.top[1]) };
  const B = { x: X(tri.bottom[0]), y: Y(tri.bottom[1]) };
  // Left boundary of the triangle at page y.
  const xTri = (y) => y <= A.y
    ? (y < T.y ? T.x : A.x + (A.y - y) / (A.y - T.y) * (T.x - A.x))
    : (y > B.y ? B.x : A.x + (y - A.y) / (B.y - A.y) * (B.x - A.x));
  const hubX = T.x;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.querySelector('#page svg');
  // Object labels already on the page are obstacles (page units, from the
  // rendered boxes — the labels sit inside a scaled group).
  const sr = svg.getBoundingClientRect(), k = frame.pageW / sr.width;
  const obstacles = [...svg.querySelectorAll('text[data-label-slug]')]
    .filter((t) => t.getAttribute('display') !== 'none' && t.getClientRects().length)
    .map((t) => { const b = t.getBoundingClientRect(); return { x1: (b.left - sr.left) * k, y1: (b.top - sr.top) * k, x2: (b.right - sr.left) * k, y2: (b.bottom - sr.top) * k }; });
  const hits = (x1, y1, x2, y2) => obstacles.filter((o) => x1 < o.x2 && x2 > o.x1 && y1 < o.y2 && y2 > o.y1);
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('id', 'callouts');
  svg.appendChild(g);
  const ctx = document.createElement('canvas').getContext('2d');
  const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const titleFont = '700 ' + S(style.titleSize) + 'px ' + FONT;
  const bodyFont = '400 ' + S(style.bodySize) + 'px ' + FONT;
  const lineH = S(style.bodySize * style.lineHeight), titleH = S(style.titleSize * 1.4), paraGap = S(style.paraGap);
  const gap = S(style.gap), pad = S(style.pad);
  const wrap = (text, font, maxW) => {
    ctx.font = font;
    const lines = []; let cur = '';
    for (const w of text.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (!cur || ctx.measureText(t).width <= maxW) cur = t; else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines;
  };
  const measure = (it, bw) => {
    it.bw = bw;
    it.lines = it.step.paragraphs.map((q) => wrap(q, bodyFont, bw));
    it.bh = titleH + S(3) + it.lines.reduce((h, ls) => h + ls.length * lineH, 0) + (it.lines.length - 1) * paraGap;
  };
  const items = steps.map((step) => {
    const ax = X((step.view.x[0] + step.view.x[1]) / 2), ay = Y((step.view.y[0] + step.view.y[1]) / 2);
    const it = { step, ax, ay };
    measure(it, S(style.boxWidth));
    return it;
  }).filter((it) => it.ax > frame.x && it.ax < frame.x + frame.w && it.ay > frame.y && it.ay < frame.y + frame.h);
  // Column by where the anchor sits across the triangle, apex → Hubble line.
  const cols = { left: [], right: [] };
  for (const it of items) cols[(it.ax - A.x) / (hubX - A.x) < style.split ? 'left' : 'right'].push(it);
  const placed = [], skipped = [];
  for (const col of ['left', 'right']) {
    const list = cols[col].sort((a, b) => a.ay - b.ay);
    // Greedy pass: each box centred on its anchor, pushed down past the one
    // above. Boxes that run off the bottom are then lifted as a chain into
    // whatever room is left above (the widths were checked at their rows;
    // the lift is re-checked below). Anything still off the page is dropped.
    const fits = (it, by) => {
      if (col === 'right') return true;
      const spansApex = by <= A.y && by + it.bh >= A.y;
      let clear = Math.min(xTri(by), xTri(by + it.bh), spansApex ? A.x : Infinity) - gap;
      for (const o of hits(it.bx, by, clear, by + it.bh)) clear = Math.min(clear, o.x1 - gap / 2);
      return it.bx + it.bw <= clear;
    };
    let cursor = frame.y + pad;
    const colPlaced = [];
    for (const it of list) {
      let ok = false;
      for (let pass = 0; pass < 3; pass++) {
        const by = Math.max(cursor, it.ay - it.bh / 2);
        let bx, bw;
        if (col === 'right') {
          bx = hubX + gap;
          // Step right of any label spilling past the Hubble line in these rows.
          for (const o of hits(bx, by, bx + S(style.boxWidth), by + it.bh)) bx = Math.max(bx, o.x2 + gap / 2);
          bw = Math.min(S(style.boxWidth), frame.x + frame.w - pad - bx);
        } else {
          const spansApex = by <= A.y && by + it.bh >= A.y;
          let clear = Math.min(xTri(by), xTri(by + it.bh), spansApex ? A.x : Infinity) - gap;
          bx = frame.x + pad;
          for (const o of hits(bx, by, clear, by + it.bh)) clear = Math.min(clear, o.x1 - gap / 2);
          bw = Math.min(S(style.boxWidth), clear - bx);
        }
        if (bw < S(style.minWidth)) break;
        if (Math.abs(bw - it.bw) > 1) { measure(it, bw); continue; } // height changed — re-check
        it.bx = bx; it.by = by; it.col = col; ok = true; break;
      }
      if (ok) { colPlaced.push(it); cursor = it.by + it.bh + gap; } else skipped.push(it.step.id);
    }
    // Lift the chain up out of the bottom margin.
    const bottom = frame.y + frame.h - pad;
    for (let i = colPlaced.length - 1; i >= 0; i--) {
      const it = colPlaced[i], next = colPlaced[i + 1];
      const limit = (next ? next.by - gap : bottom) - it.bh;
      if (it.by > limit) it.by = Math.max(frame.y + pad, limit);
    }
    for (const it of colPlaced) {
      const next = colPlaced[colPlaced.indexOf(it) + 1];
      const overlapsNext = next && it.by + it.bh + gap > next.by;
      if (it.by + it.bh > bottom || overlapsNext || !fits(it, it.by)) skipped.push(it.step.id);
      else placed.push(it);
    }
  }
  placed.sort((a, b) => a.step.index - b.step.index);
  const el = (name, attrs, parent = g) => {
    const e = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    parent.appendChild(e); return e;
  };
  placed.forEach((it, n) => {
    const ex = it.col === 'left' ? it.bx + it.bw + S(8) : it.bx - S(8);
    const ey = it.by + titleH * 0.55;
    el('line', { x1: it.ax, y1: it.ay, x2: ex, y2: ey, stroke: 'rgba(255,255,255,0.55)', 'stroke-width': S(0.8) });
    el('circle', { cx: it.ax, cy: it.ay, r: S(style.dotR), fill: '#ffffff', stroke: 'rgba(6,6,26,0.8)', 'stroke-width': S(1) });
    const t = el('text', { x: it.bx, y: it.by + titleH * 0.85, fill: '#ffffff', 'font-family': FONT,
      'font-weight': 700, 'font-size': S(style.titleSize), 'letter-spacing': S(style.titleSize * 0.05) });
    t.textContent = (n + 1) + '   ' + it.step.title.toUpperCase();
    let y = it.by + titleH + S(3) + lineH * 0.8;
    for (const ls of it.lines) {
      for (const line of ls) {
        const b = el('text', { x: it.bx, y, fill: 'rgba(255,255,255,0.9)', 'font-family': FONT,
          'font-weight': 400, 'font-size': S(style.bodySize) });
        b.textContent = line; y += lineH;
      }
      y += paraGap;
    }
  });
  return { placed: placed.map((it) => it.step.id), skipped };
};
`;
  const fontsDir = pathToFileURL(join(ROOT, 'public', 'fonts')).href;
  // Each panel's text layers, clipped to its box: an inset's axis layer
  // places epoch labels far outside its small plot, which would otherwise
  // land on the main chart.
  const groups = Object.entries(panels).map(([name, p]) => {
    const b = boxes[name];
    const tx = b.x + p.axes.x * scale, ty = b.y + p.axes.y * scale;
    return `<clipPath id="clip-${name}"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}"/></clipPath>
<g clip-path="url(#clip-${name})"><g transform="translate(${tx.toFixed(2)},${ty.toFixed(2)}) scale(${scale})">${p.axes.svg}</g></g>`;
  }).join('\n');
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>The Triangle of Everything — poster</title>
<style>
@font-face { font-family: "Inter"; font-weight: 300 700; src: url("${fontsDir}/inter-var-latin.woff2") format("woff2"); }
@font-face { font-family: "Inter"; font-weight: 300 700; src: url("${fontsDir}/inter-var-greek.woff2") format("woff2"); unicode-range: U+0370-03FF; }
@font-face { font-family: "Space Mono"; font-weight: 400; src: url("${fontsDir}/space-mono-400-latin.woff2") format("woff2"); }
@font-face { font-family: "Space Mono"; font-weight: 700; src: url("${fontsDir}/space-mono-700-latin.woff2") format("woff2"); }
@page { size: ${PAGE_MM_W}mm ${PAGE_MM_H}mm; margin: 0; }
html, body { margin: 0; padding: 0; background: #000; }
#page { position: relative; width: ${PAGE_MM_W}mm; height: ${PAGE_MM_H}mm; overflow: hidden; }
#page > img, #page > svg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: block; }
</style></head>
<body><div id="page">
<img src="${rasterFile}" alt="">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PAGE_W} ${PAGE_H}">
${groups}
${title}
</svg>
</div>
<script>${calloutScript}</script>
</body></html>`;
}

// ------------------------------------------------------------------- main --
console.log(`\n▸ Poster ${sizeName} @ ${dpi} dpi → ${PAGE_W}×${PAGE_H} px  (scale ${scale}, icons ${iconSize}%, axis type ×${axisFont}, labels ${labelSize}px)`);

const { url, proc } = await startServer();
const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: true,
  args: ['--no-first-run', '--hide-scrollbars', '--force-color-profile=srgb', '--window-size=1200,1200'],
});

try {
  const page = await browser.newPage();
  // Keep the render out of the site's analytics.
  await page.setRequestInterception(true);
  page.on('request', (req) => (req.url().includes('gc.zgo.at') ? req.abort() : req.continue()));
  page.on('pageerror', (e) => console.error('  page error:', e.message));

  await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: scale });
  // A hash view skips the intro zoom-out so nothing animates under us.
  await page.goto(`${url}/#-5,-5,1`, { waitUntil: 'load', timeout: 90_000 });
  await page.waitForFunction(() => window.__poster && document.body.classList.contains('ready'), { timeout: 90_000 });

  // Title: measure at 100 px, then size it to span the page width minus margins.
  const m0 = Math.round(PAGE_W * LAYOUT.margin);
  const titleLen100 = await page.evaluate((markup) => {
    const holder = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    holder.innerHTML = markup;
    document.body.appendChild(holder);
    const len = holder.querySelector('text').getComputedTextLength();
    holder.remove();
    return len;
  }, titleSvg(100, 0, 0));
  const titlePx = 100 * (PAGE_W - 2 * m0) / titleLen100;
  const titleH = Math.round(0.72 * titlePx);
  const { boxes, titleTop } = computeLayout(titleH);

  console.log(`▸ Rendering panels from ${url}`);
  const panels = {};
  for (const name of ['main', 'particles', 'stellar']) {
    panels[name] = await renderPanel(page, name, boxes[name]);
  }

  // Tour texts → callouts (markdown stripped, paragraphs kept).
  const tour = (await page.evaluate(() => window.__poster.tour())).map((s) => ({
    ...s,
    paragraphs: s.text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*([^*]+)\*/g, '$1')
      .split(/\n\s*\n/).map((q) => q.replace(/\s+/g, ' ').trim()).filter(Boolean),
  }));

  mkdirSync(dirname(outBase), { recursive: true });
  if (keepPanels) {
    for (const [name, p] of Object.entries(panels)) {
      const f = `${outBase}-${name}.png`;
      await sharp(p.buf).png().toFile(f);
      console.log(`  kept ${f}`);
    }
  }

  // The raster: the main chart is the page; the insets' plot areas are cut
  // into it, each with a thin frame.
  const composed = sharp(panels.main.buf).composite([
    ...['particles', 'stellar'].map((name) => { const r = plotRect(boxes[name]); return { input: panels[name].buf, left: r.x, top: r.y }; }),
    { input: frameSvg(boxes), left: 0, top: 0 },
  ]);
  const rasterPng = `${outBase}.png`;
  const meta = await composed.clone().png({ compressionLevel: 6 }).withMetadata({ density: dpi }).toFile(rasterPng);
  console.log(`\n✓ Wrote ${rasterPng}  (${meta.width}×${meta.height}, ${(meta.size / 1e6).toFixed(1)} MB, raster only)`);

  // The PDF: Chrome prints the raster (as JPEG, for size) with the vector text over it.
  const stageDir = join(dirname(outBase), '.print');
  mkdirSync(stageDir, { recursive: true });
  const rasterJpg = join(stageDir, 'raster.jpg');
  await composed.clone().jpeg({ quality: 92, chromaSubsampling: '4:4:4' }).withMetadata({ density: dpi }).toFile(rasterJpg);
  const html = printHtml({
    rasterFile: pathToFileURL(rasterJpg).href, panels, boxes,
    title: titleSvg(titlePx, titleTop, m0),
  });
  const htmlFile = join(stageDir, 'poster.html');
  writeFileSync(htmlFile, html);

  const print = await browser.newPage();
  await print.setViewport({ width: 1200, height: Math.round(1200 * PAGE_H / PAGE_W), deviceScaleFactor: 1 });
  await print.goto(pathToFileURL(htmlFile).href, { waitUntil: 'load', timeout: 120_000 });
  await print.evaluate(() => document.fonts.ready);
  const callouts = await print.evaluate((cfg) => window.layoutCallouts(cfg), {
    steps: tour, frame: { ...plotRect(boxes.main), pageW: PAGE_W }, view: panels.main.view, scale, style: CALLOUT,
    tri: { apex: [PLANCK_LOG_R, PLANCK_LOG_M], top: [HUBBLE_LOG_R, schwarzschildM(HUBBLE_LOG_R)], bottom: [HUBBLE_LOG_R, comptonM(HUBBLE_LOG_R)] },
  });
  console.log(`  callouts: ${callouts.placed.length} of ${tour.length} placed` +
    (callouts.skipped.length ? `; no room for ${callouts.skipped.join(', ')}` : ''));
  writeFileSync(htmlFile, await print.content()); // the page as printed, callouts included
  await sleep(300);
  const pdfFile = `${outBase}.pdf`;
  await print.pdf({ path: pdfFile, preferCSSPageSize: true, printBackground: true, timeout: 180_000 });
  const pdfMB = (await import('node:fs')).statSync(pdfFile).size / 1e6;
  console.log(`✓ Wrote ${pdfFile}  (${PAGE_MM_W}×${PAGE_MM_H} mm, ${pdfMB.toFixed(1)} MB, vector text)`);

  // A small preview of the printed page, text included.
  const previewFile = `${outBase}-preview.jpg`;
  const shot = await print.screenshot({ type: 'png', fullPage: true });
  await sharp(shot).resize({ height: 1900 }).jpeg({ quality: 85 }).toFile(previewFile);
  console.log(`✓ Wrote ${previewFile}\n`);
} finally {
  await browser.close();
  proc?.kill();
}
