#!/usr/bin/env node
/**
 * Mobile performance harness for the Triangle of Everything.
 *
 * Measures what screenshots can't: load waterfall, main-thread long tasks and
 * frame rate during pinch/pan/preset animations, all under mobile CPU and
 * network throttling in headless Chrome (no visible window needed).
 *
 * Usage:
 *   node scripts/mobile-perf.mjs                  # build's preview server (dist/), Fast-4G + 4x CPU
 *   node scripts/mobile-perf.mjs --dev            # against `vite` dev server instead of dist
 *   node scripts/mobile-perf.mjs --url http://... # against any running server / deployed site
 *   node scripts/mobile-perf.mjs --net 3g --cpu 6 # meaner phone
 *   node scripts/mobile-perf.mjs --trace          # also save a DevTools-loadable trace
 *   node scripts/mobile-perf.mjs --ci             # exit 1 if any budget is busted
 *
 * Reports to stdout and scripts/perf-reports/<timestamp>.json.
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------- budgets --
// What "as good as a mobile map app" means, in numbers. Tune as you improve.
const BUDGETS = {
  lcpMs: 2500,          // largest contentful paint on Fast 4G + 4x CPU
  jsTransferKB: 350,    // compressed JS on the wire
  totalTransferKB: 1200,// everything fetched before interactive
  requests: 60,         // request count before interactive
  startupLongTaskMs: 800, // sum of long tasks during load
  avgFps: 45,           // during pinch/pan/preset animation
  p95FrameMs: 40,       // 95th percentile frame time during interaction
};

// ------------------------------------------------------------------ flags --
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};

const NET_PRESETS = {
  // Rough DevTools-style presets. latency ms, throughput bytes/sec.
  '4g': { latency: 60, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (3 * 1024 * 1024) / 8 },
  '3g': { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 },
  none: null,
};

const netName = opt('net', '4g');
const net = NET_PRESETS[netName];
if (net === undefined) {
  console.error(`Unknown --net "${netName}" (use: ${Object.keys(NET_PRESETS).join(', ')})`);
  process.exit(2);
}
const cpuRate = Number(opt('cpu', '4'));
const explicitUrl = opt('url', null);
const useDev = flag('dev');

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

// ------------------------------------------------------------ server bootup --
async function startServer() {
  if (explicitUrl) return { url: explicitUrl, proc: null };
  const port = useDev ? 5199 : 4199;
  const cmd = useDev
    ? ['vite', '--port', String(port), '--strictPort']
    : ['vite', 'preview', '--port', String(port), '--strictPort'];
  if (!useDev && !existsSync(join(ROOT, 'dist', 'index.html'))) {
    console.error('No dist/index.html — run `npm run build` first (or pass --dev).');
    process.exit(2);
  }
  const proc = spawn('npx', cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
  const url = `http://localhost:${port}`;
  // wait for the port to answer
  for (let i = 0; i < 100; i++) {
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

// ------------------------------------------------- in-page instrumentation --
// Installed before any app code runs.
const COLLECTOR = `
  window.__perf = { fcp: null, lcp: null, longTasks: [], frames: null };
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__perf.fcp = e.startTime;
    }).observe({ type: 'paint', buffered: true });
  } catch {}
  try {
    new PerformanceObserver((l) => {
      const es = l.getEntries();
      if (es.length) window.__perf.lcp = es[es.length - 1].startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__perf.longTasks.push({ start: e.startTime, dur: e.duration });
    }).observe({ type: 'longtask', buffered: true });
  } catch {}
  window.__startFrames = () => {
    const s = { times: [], last: null, running: true };
    window.__perf.frames = s;
    const tick = (t) => {
      if (s.last !== null) s.times.push(t - s.last);
      s.last = t;
      if (s.running) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  window.__stopFrames = () => {
    const s = window.__perf.frames;
    if (s) s.running = false;
    return s ? s.times : [];
  };
`;

// Label invariants — three past "optimizations" the user explicitly banned:
//   1. stranded: text/vectors stay fixed while images (tiles/icons) move
//   2. scaled:   text rasterized/transformed so it grows with the zoom
//   3. hidden:   the vector layer turned off during gestures
// These passes snapshot SVG <text> and <image> rects before/after a gesture
// (matched by content) and sample text visibility during it. Violations fail
// the run — see "Label invariants" in the output.
const INVARIANT_PROBE = `
  window.__invStart = () => {
    const grab = () => {
      const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      // Prefer object labels/icons: their data-slug keys are unique, so
      // start/end rects match the SAME element. Generic texts (axis ticks)
      // repeat their content and can false-match a different instance.
      const labelTexts = [...document.querySelectorAll('#chart svg text[data-label-slug]')].filter(t => vis(t));
      const anyTexts = [...document.querySelectorAll('#chart svg text')].filter(t => t.textContent.trim() && vis(t));
      const texts = labelTexts.length >= 3 ? labelTexts : anyTexts;
      const textKey = labelTexts.length >= 3
        ? (el) => el.getAttribute('data-label-slug')
        : (el) => el.textContent.trim().slice(0, 40);
      const iconImgs = [...document.querySelectorAll('#chart svg image.obj-icon[data-slug]')].filter(vis);
      const anyImgs = [...document.querySelectorAll('#chart svg image')].filter(vis);
      const imgs = iconImgs.length >= 3 ? iconImgs : anyImgs;
      const imgKey = iconImgs.length >= 3
        ? (el) => el.getAttribute('data-slug')
        : (el) => (el.getAttribute('href') || el.getAttribute('xlink:href') || '').slice(-40);
      const snap = (els, key) => els.slice(0, 15).map(el => {
        const r = el.getBoundingClientRect();
        return { k: key(el), x: r.x, y: r.y, h: r.height };
      });
      const z = document.querySelector('#chart svg')?.__zoom;
      return {
        textCount: anyTexts.length,
        texts: snap(texts, textKey),
        imgs: snap(imgs, imgKey),
        zoom: z ? { k: z.k, x: z.x, y: z.y } : null,
      };
    };
    window.__inv = { grab, start: grab(), minTextCount: Infinity };
    window.__inv.timer = setInterval(() => {
      const n = window.__inv.grab().textCount;
      if (n < window.__inv.minTextCount) window.__inv.minTextCount = n;
    }, 120);
  };
  window.__invStop = () => {
    const inv = window.__inv;
    clearInterval(inv.timer);
    const end = inv.grab();
    const match = (a, b) => { const m = new Map(b.map(o => [o.k, o])); return a.filter(o => m.has(o.k)).map(o => ({ s: o, e: m.get(o.k) })); };
    const med = (arr) => { if (!arr.length) return null; const s = [...arr].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
    const tm = match(inv.start.texts, end.texts);
    const im = match(inv.start.imgs, end.imgs);
    const zs = inv.start.zoom, ze = end.zoom;
    return {
      startTextCount: inv.start.textCount,
      minTextCountDuring: inv.minTextCount === Infinity ? end.textCount : inv.minTextCount,
      matchedTexts: tm.length,
      matchedImages: im.length,
      medianTextMovePx: med(tm.map(p => Math.hypot(p.e.x - p.s.x, p.e.y - p.s.y))),
      medianImageMovePx: med(im.map(p => Math.hypot(p.e.x - p.s.x, p.e.y - p.s.y))),
      medianTextHeightRatio: med(tm.filter(p => p.s.h > 1).map(p => p.e.h / p.s.h)),
      // Ground truth from d3's own transform: how far the map really moved
      transformDeltaPx: zs && ze ? Math.hypot(ze.x - zs.x, ze.y - zs.y) : null,
      kRatio: zs && ze ? ze.k / zs.k : null,
    };
  };
`;

async function measureInvariants(page, cdp, cx, cy) {
  await page.evaluate(INVARIANT_PROBE);

  // Pinch pass: does text scale with the map?
  await page.evaluate('window.__invStart()');
  await cdp.send('Input.synthesizePinchGesture', { x: cx, y: cy, scaleFactor: 1.6, relativeSpeed: 300, gestureSourceType: 'touch' });
  await new Promise((r) => setTimeout(r, 150));
  const pinch = await page.evaluate('window.__invStop()');
  await cdp.send('Input.synthesizePinchGesture', { x: cx, y: cy, scaleFactor: 1 / 1.6, relativeSpeed: 300, gestureSourceType: 'touch' });
  await new Promise((r) => setTimeout(r, 400));

  // Pan pass: do texts move with the images, and stay visible?
  await page.evaluate('window.__invStart()');
  await cdp.send('Input.synthesizeScrollGesture', { x: cx, y: cy, xDistance: -120, yDistance: -120, speed: 600, gestureSourceType: 'touch' });
  await new Promise((r) => setTimeout(r, 150));
  const pan = await page.evaluate('window.__invStop()');

  const enoughData = pinch.matchedTexts >= 3 && pan.matchedTexts >= 3;
  // Reference for "did the map move": d3's own transform delta, with the
  // measured image movement as a fallback.
  const mapMoved = Math.max(pan.transformDeltaPx ?? 0, pan.medianImageMovePx ?? 0);
  return {
    pinch, pan, enoughData,
    textsScaled: enoughData && pinch.medianTextHeightRatio != null && pinch.medianTextHeightRatio > 1.15,
    textsHidden: (pinch.startTextCount > 0 && pinch.minTextCountDuring === 0) || (pan.startTextCount > 0 && pan.minTextCountDuring === 0),
    textsStranded: enoughData && mapMoved > 30 && pan.medianTextMovePx < 0.3 * mapMoved,
    mapMovedPx: mapMoved,
  };
}

function frameStats(times) {
  if (!times || times.length < 5) return null;
  const sorted = [...times].sort((a, b) => a - b);
  const pick = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  return {
    frames: times.length,
    avgFps: +(1000 / avg).toFixed(1),
    avgMs: +avg.toFixed(1),
    p50Ms: +pick(0.5).toFixed(1),
    p95Ms: +pick(0.95).toFixed(1),
    worstMs: +sorted[sorted.length - 1].toFixed(1),
    over33ms: times.filter((t) => t > 33).length,
    over100ms: times.filter((t) => t > 100).length,
  };
}

async function measureGesture(page, cdp, label, run) {
  await page.evaluate('window.__startFrames()');
  await run();
  await new Promise((r) => setTimeout(r, 120)); // let trailing frames land
  const times = await page.evaluate('window.__stopFrames()');
  const stats = frameStats(times);
  return { label, ...stats };
}

// --------------------------------------------------------------------- main --
const { url, proc } = await startServer();
const chrome = findChrome();
console.log(`\n▸ Target: ${url}  (net: ${netName}, cpu: ${cpuRate}x, chrome: headless)`);

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: 'new',
  args: ['--no-first-run', '--hide-scrollbars', '--window-size=390,900'],
});

let exitCode = 0;
try {
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
  );
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.evaluateOnNewDocument(COLLECTOR);

  const cdp = await page.target().createCDPSession();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuRate });
  if (net) await cdp.send('Network.enable');
  if (net) await cdp.send('Network.emulateNetworkConditions', { offline: false, ...net });

  let tracing = false;
  if (flag('trace')) {
    mkdirSync(join(ROOT, 'scripts', 'perf-reports'), { recursive: true });
    await page.tracing.start({
      path: join(ROOT, 'scripts', 'perf-reports', `trace-${Date.now()}.json`),
      categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline.frame', 'blink.user_timing'],
    });
    tracing = true;
  }

  // ------------------------------------------------------------- cold load --
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120_000 });
  await page
    .waitForFunction('document.body.classList.contains("ready") && document.querySelector("#chart svg")', { timeout: 60_000 })
    .catch(() => console.warn('  (app never signalled ready — measuring anyway)'));
  const wallLoadMs = Date.now() - t0;
  await new Promise((r) => setTimeout(r, 1000)); // idle-period long tasks

  const load = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    const byType = {};
    let total = 0;
    const biggest = [];
    for (const r of res) {
      const ext = (r.name.split('?')[0].split('.').pop() || '').toLowerCase();
      const kind = /^(png|jpg|jpeg|webp|avif|gif|svg|ico)$/.test(ext) ? 'img'
        : /^(js|mjs)$/.test(ext) ? 'js'
        : ext === 'css' ? 'css'
        : /^(woff2?|ttf|otf)$/.test(ext) ? 'font'
        : /^(json|md)$/.test(ext) ? 'data' : 'other';
      const bytes = r.transferSize || r.encodedBodySize || 0;
      (byType[kind] ??= { count: 0, kb: 0 });
      byType[kind].count++;
      byType[kind].kb += bytes / 1024;
      total += bytes;
      biggest.push({ url: r.name.replace(location.origin, ''), kb: +(bytes / 1024).toFixed(1) });
    }
    for (const k of Object.keys(byType)) byType[k].kb = Math.round(byType[k].kb);
    biggest.sort((a, b) => b.kb - a.kb);
    const lt = window.__perf.longTasks;
    return {
      ttfbMs: nav ? Math.round(nav.responseStart) : null,
      domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      fcpMs: window.__perf.fcp ? Math.round(window.__perf.fcp) : null,
      lcpMs: window.__perf.lcp ? Math.round(window.__perf.lcp) : null,
      requests: res.length,
      totalTransferKB: Math.round(total / 1024),
      byType,
      biggest: biggest.slice(0, 10),
      longTaskCount: lt.length,
      longTaskTotalMs: Math.round(lt.reduce((a, t) => a + t.dur, 0)),
      longestTaskMs: Math.round(Math.max(0, ...lt.map((t) => t.dur))),
      domNodes: document.getElementsByTagName('*').length,
      svgNodes: document.querySelectorAll('svg *').length,
      heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null,
    };
  });

  // ------------------------------------------------------------ interactions --
  // Dismiss the tour intro card first: on a phone it covers the bottom half
  // of the screen and swallows any gesture finger that lands on it (tracked
  // as a Phase 3 layout fix — compact mobile tour card). Gesture passes here
  // measure the map itself.
  await page.evaluate(() => document.getElementById('tour-close')?.click());
  await new Promise((r) => setTimeout(r, 400));

  const cx = 195, cy = 350;
  const gestures = [];

  gestures.push(await measureGesture(page, cdp, 'pinch zoom in (2.5x)', () =>
    cdp.send('Input.synthesizePinchGesture', { x: cx, y: cy, scaleFactor: 2.5, relativeSpeed: 400, gestureSourceType: 'touch' })
  ));
  gestures.push(await measureGesture(page, cdp, 'pinch zoom out (0.4x)', () =>
    cdp.send('Input.synthesizePinchGesture', { x: cx, y: cy, scaleFactor: 0.4, relativeSpeed: 400, gestureSourceType: 'touch' })
  ));
  gestures.push(await measureGesture(page, cdp, 'pan (drag across)', () =>
    cdp.send('Input.synthesizeScrollGesture', {
      x: cx, y: cy, xDistance: -150, yDistance: -150, speed: 800, gestureSourceType: 'touch',
    })
  ));

  // Preset-button animated transition — the app's own "flyTo" animation.
  const hasPreset = await page.$('#preset-bar button[data-preset="particle-physics"]');
  if (hasPreset) {
    gestures.push(await measureGesture(page, cdp, 'preset fly-to animation', async () => {
      await page.evaluate(() => document.querySelector('#preset-bar button[data-preset="particle-physics"]').click());
      await new Promise((r) => setTimeout(r, 2500)); // let the transition play out
    }));
  }

  // Label invariants (separate pass so rect sampling doesn't skew FPS numbers)
  const invariants = await measureInvariants(page, cdp, cx, cy);

  if (tracing) await page.tracing.stop();

  // ---------------------------------------------------------------- report --
  const report = {
    when: new Date().toISOString(),
    target: url,
    conditions: { net: netName, cpuThrottle: cpuRate, viewport: '390x844@3x touch' },
    wallLoadMs,
    load,
    gestures,
    labelInvariants: invariants,
    budgets: BUDGETS,
  };

  const outDir = join(ROOT, 'scripts', 'perf-reports');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `mobile-perf-${report.when.replace(/[:.]/g, '-')}.json`);
  writeFileSync(outPath, JSON.stringify(report, null, 2));

  const fail = [];
  const check = (label, val, limit, lowerIsBetter = true) => {
    if (val == null) return `  ?  ${label}: n/a`;
    const bad = lowerIsBetter ? val > limit : val < limit;
    if (bad) fail.push(label);
    return `  ${bad ? '✗' : '✓'}  ${label}: ${val} (budget ${lowerIsBetter ? '≤' : '≥'} ${limit})`;
  };

  console.log('\n── Cold load ──────────────────────────────────────────');
  console.log(`  TTFB ${load.ttfbMs}ms · FCP ${load.fcpMs}ms · LCP ${load.lcpMs}ms · DCL ${load.domContentLoadedMs}ms · wall ${wallLoadMs}ms`);
  console.log(`  ${load.requests} requests · ${load.totalTransferKB}KB on the wire`);
  for (const [k, v] of Object.entries(load.byType)) console.log(`    ${k.padEnd(5)} ${String(v.count).padStart(4)} req  ${v.kb}KB`);
  console.log(`  long tasks: ${load.longTaskCount} totalling ${load.longTaskTotalMs}ms (longest ${load.longestTaskMs}ms)`);
  console.log(`  DOM ${load.domNodes} nodes (${load.svgNodes} in SVG) · heap ${load.heapMB}MB`);
  console.log('  heaviest requests:');
  for (const b of load.biggest) console.log(`    ${String(b.kb).padStart(8)}KB  ${b.url}`);

  console.log('\n── Interaction frame rate ─────────────────────────────');
  for (const g of gestures) {
    if (!g || !g.frames) { console.log(`  ${g?.label ?? '?'}: no frames captured`); continue; }
    console.log(`  ${g.label}`);
    console.log(`    ${g.avgFps}fps avg · frame p50 ${g.p50Ms}ms / p95 ${g.p95Ms}ms / worst ${g.worstMs}ms · >33ms: ${g.over33ms} · >100ms: ${g.over100ms}`);
  }

  console.log('\n── Label invariants (banned gesture regressions) ──────');
  if (!invariants.enoughData) {
    console.log('  ?  not enough matched labels to judge — check manually');
  } else {
    const inv = (bad, label, detail) => {
      if (bad) fail.push(label);
      return `  ${bad ? '✗' : '✓'}  ${label} (${detail})`;
    };
    console.log(inv(invariants.textsScaled, 'texts must not scale during pinch',
      `median height ratio ${invariants.pinch.medianTextHeightRatio?.toFixed(2)}`));
    console.log(inv(invariants.textsHidden, 'texts must stay visible during gestures',
      `min visible during pinch/pan: ${invariants.pinch.minTextCountDuring}/${invariants.pan.minTextCountDuring}`));
    console.log(inv(invariants.textsStranded, 'texts must move with the map during pan',
      `texts moved ${invariants.pan.medianTextMovePx?.toFixed(0)}px vs map ${invariants.mapMovedPx?.toFixed(0)}px`));
  }

  console.log('\n── Budgets ────────────────────────────────────────────');
  console.log(check('LCP ms', load.lcpMs, BUDGETS.lcpMs));
  console.log(check('JS transfer KB', load.byType.js?.kb ?? 0, BUDGETS.jsTransferKB));
  console.log(check('total transfer KB', load.totalTransferKB, BUDGETS.totalTransferKB));
  console.log(check('requests', load.requests, BUDGETS.requests));
  console.log(check('startup long-task ms', load.longTaskTotalMs, BUDGETS.startupLongTaskMs));
  const worstGesture = gestures.filter((g) => g && g.frames);
  if (worstGesture.length) {
    const minFps = Math.min(...worstGesture.map((g) => g.avgFps));
    const maxP95 = Math.max(...worstGesture.map((g) => g.p95Ms));
    console.log(check('worst avg fps', minFps, BUDGETS.avgFps, false));
    console.log(check('worst p95 frame ms', maxP95, BUDGETS.p95FrameMs));
  }

  console.log(`\nReport: ${outPath.replace(ROOT + '/', '')}`);
  if (fail.length) {
    console.log(`\n${fail.length} budget(s) busted: ${fail.join(', ')}`);
    if (flag('ci')) exitCode = 1;
  } else {
    console.log('\nAll budgets green.');
  }
} finally {
  await browser.close();
  if (proc) proc.kill();
}
process.exit(exitCode);
