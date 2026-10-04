// =============================================================
// DUST.JS — thousands of real catalogue objects as background texture
// =============================================================
//
// Dust is deliberately humble. Each dot is a real, named object from a
// published catalogue (src/dust.json, built and checked by
// scripts/build-dust.mjs), but it has no description, no link and no
// click action. It exists to show TRENDS: how stars scatter off the main
// sequence, the exoplanet mass–radius curve, nuclei at nuclear density,
// molecular clouds following Larson's law, black holes pinned to the
// Schwarzschild line.
//
// Rules:
//   - drawn under the curated objects, as small faint dots
//   - a dot only appears where there is room: never on top of a curated
//     dot, icon or label, and never closer than DUST_GAP px to another
//     dust dot. Dust is always the first thing to give way.
//   - its name appears only on hover (pickDust → main.js tooltip)
//
// Which dots survive thinning is decided by a fixed per-object random
// rank, so the same dots stay put while you pan instead of flickering.
// =============================================================

import dustUrl from "./dust.json?url";

const DUST_GAP = 5;        // px — minimum spacing between dust dots
const DUST_R = 1.15;       // px — dot radius
const CLEAR_DOT = 9;       // px — keep-out radius around curated dots
const MAX_DOTS_DESKTOP = 7000;
const MAX_DOTS_MOBILE = 3000;

let _data = null;          // { names, r, m, src, rank, sources }
let _loading = null;
let _kept = [];            // [{ i, sx, sy }] drawn this frame
let _keptGrid = new Map(); // cell key → indices into _kept (hover lookup)

export function dustReady() { return !!_data; }

/** Lazy-load the catalogue (≈300 KB gzipped) off the critical path. */
export function loadDust() {
  if (_loading) return _loading;
  // Fetched as a content-hashed JSON asset (not a JS chunk): it is data,
  // parses faster as JSON, and stays out of the JS byte budget.
  _loading = fetch(dustUrl).then((res) => {
    if (!res.ok) throw new Error(`dust.json: HTTP ${res.status}`);
    return res.json();
  }).then(({ sources, name, r: rr, m: mm, s: ss }) => {
    const n = name.length;
    const names = new Array(n);
    const r = Float32Array.from(rr), m = Float32Array.from(mm);
    const src = Uint8Array.from(ss);
    for (let i = 0; i < n; i++) {
      const so = sources[src[i]];
      names[i] = so.pre + name[i] + so.suf;
    }
    // Deterministic shuffle (mulberry32) → stable thinning priority
    const rank = new Uint32Array(n);
    for (let i = 0; i < n; i++) rank[i] = i;
    let s = 0x9e3779b9;
    const rnd = () => {
      s |= 0; s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = rank[i]; rank[i] = rank[j]; rank[j] = t;
    }
    _data = { names, r, m, src, rank, sources };
    return _data;
  });
  return _loading;
}

/**
 * Draw the dust layer.
 * @param layer    d3 selection of the <g> to draw into
 * @param view     { px, py, cw, ch, mobile, hidden }
 * @param blockers { dots: [{sx, sy}], rects: [{x, y, w, h}], circles: [{sx, sy, r}] }
 *                 — curated dots, labels and (round) icons dust must stay clear of
 * @param colorOf  (catKey, sourceId) → css colour
 */
export function drawDust(layer, view, blockers, colorOf) {
  _kept = [];
  _keptGrid = new Map();
  if (!_data || view.hidden) { layer.selectAll("path").remove(); return; }

  const { px, py, cw, ch } = view;
  const { r, m, src, rank, sources } = _data;
  const cap = view.mobile ? MAX_DOTS_MOBILE : MAX_DOTS_DESKTOP;

  // --- occupancy grid of things dust must not touch ---
  const OC = 4; // px per occupancy cell
  const gw = Math.ceil(cw / OC) + 1, gh = Math.ceil(ch / OC) + 1;
  const occ = new Uint8Array(gw * gh);
  const fill = (x0, y0, x1, y1) => {
    const a = Math.max(0, Math.floor(x0 / OC)), b = Math.min(gw - 1, Math.floor(x1 / OC));
    const c = Math.max(0, Math.floor(y0 / OC)), d = Math.min(gh - 1, Math.floor(y1 / OC));
    for (let y = c; y <= d; y++) occ.fill(1, y * gw + a, y * gw + b + 1);
  };
  for (const o of blockers.dots) fill(o.sx - CLEAR_DOT, o.sy - CLEAR_DOT, o.sx + CLEAR_DOT, o.sy + CLEAR_DOT);
  for (const b of blockers.rects) fill(b.x - 2, b.y - 2, b.x + b.w + 2, b.y + b.h + 2);
  for (const c of blockers.circles || []) {
    // row-by-row disc fill
    const R = c.r + 1;
    for (let y = Math.max(0, Math.floor((c.sy - R) / OC)); y <= Math.min(gh - 1, Math.floor((c.sy + R) / OC)); y++) {
      const dy = Math.abs((y + 0.5) * OC - c.sy);
      if (dy > R) continue;
      const hw = Math.sqrt(R * R - dy * dy);
      const a = Math.max(0, Math.floor((c.sx - hw) / OC)), b = Math.min(gw - 1, Math.floor((c.sx + hw) / OC));
      if (b >= a) occ.fill(1, y * gw + a, y * gw + b + 1);
    }
  }

  // --- thinning: spatial hash with cell = DUST_GAP ---
  const G = DUST_GAP, G2 = G * G;
  const paths = new Map(); // srcIdx → path string parts
  for (let k = 0; k < rank.length && _kept.length < cap; k++) {
    const i = rank[k];
    const sx = px(r[i]);
    if (sx < 0 || sx > cw) continue;
    const sy = py(m[i]);
    if (sy < 0 || sy > ch) continue;
    if (occ[Math.floor(sy / OC) * gw + Math.floor(sx / OC)]) continue;
    const cx = Math.floor(sx / G), cy = Math.floor(sy / G);
    let clash = false;
    for (let dy = -1; dy <= 1 && !clash; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cell = _keptGrid.get((cx + dx) * 65536 + (cy + dy));
        if (!cell) continue;
        for (const j of cell) {
          const q = _kept[j];
          if ((q.sx - sx) ** 2 + (q.sy - sy) ** 2 < G2) { clash = true; break; }
        }
        if (clash) break;
      }
    }
    if (clash) continue;
    const key = cx * 65536 + cy;
    if (!_keptGrid.has(key)) _keptGrid.set(key, []);
    _keptGrid.get(key).push(_kept.length);
    _kept.push({ i, sx, sy });
    const s = src[i];
    if (!paths.has(s)) paths.set(s, []);
    paths.get(s).push(`M${sx.toFixed(1)} ${sy.toFixed(1)}h0`);
  }

  // One <path> per source: round caps on zero-length segments render as
  // dots, so thousands of dots cost a handful of DOM nodes.
  const groups = [...paths.entries()].map(([s, parts]) => ({ s, d: parts.join("") }));
  layer.selectAll("path.dust")
    .data(groups, (g) => g.s)
    .join((enter) => enter.append("path")
      .attr("class", "dust")
      .attr("fill", "none")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", DUST_R * 2)
      .attr("opacity", 0.7)
      .attr("stroke", (g) => colorOf(sources[g.s].cat, sources[g.s].id)))
    .attr("d", (g) => g.d);
}

/** Map of name → [logR, logM] for one dust source (e.g. "element"). */
const _bySource = new Map();
export function dustPositions(sourceId) {
  if (!_data) return null;
  if (_bySource.has(sourceId)) return _bySource.get(sourceId);
  const idx = _data.sources.findIndex((s) => s.id === sourceId);
  const map = new Map();
  if (idx >= 0) {
    for (let i = 0; i < _data.src.length; i++)
      if (_data.src[i] === idx) map.set(_data.names[i], [_data.r[i], _data.m[i]]);
  }
  _bySource.set(sourceId, map);
  return map;
}

/** Nearest drawn dust dot within `radius` px of (x, y), or null. */
export function pickDust(x, y, radius = 6) {
  if (!_data || !_kept.length) return null;
  const G = DUST_GAP;
  const reach = Math.ceil(radius / G);
  const cx = Math.floor(x / G), cy = Math.floor(y / G);
  let best = null, bestD = radius * radius;
  for (let dy = -reach; dy <= reach; dy++) {
    for (let dx = -reach; dx <= reach; dx++) {
      const cell = _keptGrid.get((cx + dx) * 65536 + (cy + dy));
      if (!cell) continue;
      for (const j of cell) {
        const q = _kept[j];
        const d = (q.sx - x) ** 2 + (q.sy - y) ** 2;
        if (d <= bestD) { bestD = d; best = q; }
      }
    }
  }
  if (!best) return null;
  const src = _data.sources[_data.src[best.i]];
  return {
    name: _data.names[best.i],
    source: src.label,
    cat: src.cat,
    sx: best.sx, sy: best.sy,
  };
}

/** Raw positions { r, m } (log radius, log mass) once loaded, else null. */
export function dustArrays() {
  return _data ? { r: _data.r, m: _data.m } : null;
}
