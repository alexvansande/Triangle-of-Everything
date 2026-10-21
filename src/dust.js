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
import { applyBulkDust } from "./bulk-density.js";

const DUST_GAP = 5;        // px — minimum spacing between dust dots
const DUST_R = 1.15;       // px — dot radius
const CLEAR_DOT = 9;       // px — keep-out radius around curated dots
const BH_TICK_GAP = 2;     // px — black-hole ticks start this far beyond the Schwarzschild line
const BH_TICK_LEN = 4;     // px
const BH_TICK_W = 1.3;     // px
const MAX_DOTS_DESKTOP = 7000;
const MAX_DOTS_MOBILE = 3000;
// Named dust: a few dots get their name written next to them, like a map
// showing more towns as you zoom in. Sparse on purpose.
const LABEL_MAX_DESKTOP = 10;   // labels on screen at most
const LABEL_MAX_MOBILE = 5;
const LABEL_GAP_DESKTOP = 110;  // px — clear radius around each labelled dot
const LABEL_GAP_MOBILE = 90;
const LABEL_FONT = 9;           // px, before the font-size setting
const LABEL_MAX_CHARS = 28;
// Catalogue designations (Gaia DR3 4057…, 2MASS J0523…) aren't worth reading.
const ID_LIKE = /\d{5,}|^(Gaia|2MASS|TIC|KIC|EPIC|HIP|HD|TYC|WISE|SDSS|UGC|PGC|NGC|IC|GJ|LHS|NLTT)\b/i;

let _data = null;          // { names, r, m, src, rank, sources }
let _loading = null;
let _kept = [];            // [{ i, sx, sy }] drawn this frame
let _keptGrid = new Map(); // cell key → indices into _kept (hover lookup)
let _labelled = new Set(); // dust indices labelled last frame: kept first, so labels don't flicker

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
    // Non-round things to their bulk-density ball radius (bulk-density.js);
    // rSpan keeps the catalogue's half-longest-dimension radius.
    const rSpan = applyBulkDust(r, m, src, sources, name);
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
    _data = { names, r, rSpan, m, src, rank, sources };
    return _data;
  });
  return _loading;
}

/**
 * Draw the dust layer.
 * @param layer    d3 selection of the <g> to draw into
 * @param view     { px, py, cw, ch, mobile, hidden, labels, fontScale }
 * @param blockers { dots: [{sx, sy}], rects: [{x, y, w, h}], circles: [{sx, sy, r}] }
 *                 — curated dots, labels and (round) icons dust must stay clear of
 * @param colorOf  (catKey, sourceId) → css colour
 */
export function drawDust(layer, view, blockers, colorOf) {
  _kept = [];
  _keptGrid = new Map();
  if (!_data || view.hidden) { layer.selectAll("path, text").remove(); _labelled = new Set(); return; }

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

  // Black holes sit exactly on the Schwarzschild line, where a dot vanishes into
  // the line: they're drawn as short ticks just beyond it instead, like a rug plot.
  const ax = px(1) - px(0), ay = py(1) - py(0), al = Math.hypot(ax, ay) || 1;
  const tnx = ay / al, tny = -ax / al;                  // across the line, away from the triangle
  const tick = (sx, sy) => `M${(sx + tnx * BH_TICK_GAP).toFixed(1)} ${(sy + tny * BH_TICK_GAP).toFixed(1)}` +
    `l${(tnx * BH_TICK_LEN).toFixed(1)} ${(tny * BH_TICK_LEN).toFixed(1)}`;

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
    paths.get(s).push(sources[s].cat === "blackhole" ? tick(sx, sy) : `M${sx.toFixed(1)} ${sy.toFixed(1)}h0`);
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
      .attr("stroke-width", (g) => sources[g.s].cat === "blackhole" ? BH_TICK_W : DUST_R * 2)
      .attr("opacity", (g) => sources[g.s].cat === "blackhole" ? 0.85 : 0.7)
      .attr("stroke", (g) => colorOf(sources[g.s].cat, sources[g.s].id)))
    .attr("d", (g) => g.d);

  drawDustLabels(layer, view, occ, gw, gh, OC, colorOf);
}

/** Name a sparse few of the dots just drawn: greedy by priority (last
 *  frame's labels first, then the fixed random rank), each needing a clear
 *  radius from the others and a free spot for its text. */
function drawDustLabels(layer, view, occ, gw, gh, OC, colorOf) {
  const { names, src, sources } = _data;
  const placed = [];
  if (view.labels) {
    const max = view.mobile ? LABEL_MAX_MOBILE : LABEL_MAX_DESKTOP;
    const gap2 = (view.mobile ? LABEL_GAP_MOBILE : LABEL_GAP_DESKTOP) ** 2;
    const fs = LABEL_FONT * (view.fontScale || 1);
    const free = (x0, y0, x1, y1) => {
      if (x0 < 0 || y0 < 0 || x1 > view.cw || y1 > view.ch) return false;
      for (let y = Math.floor(y0 / OC); y <= Math.floor(y1 / OC); y++)
        for (let x = Math.floor(x0 / OC); x <= Math.floor(x1 / OC); x++)
          if (occ[y * gw + x]) return false;
      return true;
    };
    // _kept is already in rank order; last frame's labels go first
    const order = [..._kept.filter((q) => _labelled.has(q.i)), ..._kept.filter((q) => !_labelled.has(q.i))];
    for (const q of order) {
      if (placed.length >= max) break;
      if (sources[src[q.i]].cat === "blackhole") continue;     // ticks on the line, not dots
      let text = names[q.i];
      if (!text || ID_LIKE.test(text)) continue;
      if (text.length > LABEL_MAX_CHARS) text = text.slice(0, LABEL_MAX_CHARS - 1) + "…";
      if (placed.some((p) => (p.sx - q.sx) ** 2 + (p.sy - q.sy) ** 2 < gap2)) continue;
      const w = text.length * fs * 0.55, h = fs * 1.2;
      let anchor = null;
      if (free(q.sx + 4, q.sy - h / 2, q.sx + 6 + w, q.sy + h / 2)) anchor = "start";
      else if (free(q.sx - 6 - w, q.sy - h / 2, q.sx - 4, q.sy + h / 2)) anchor = "end";
      if (!anchor) continue;
      placed.push({ i: q.i, sx: q.sx, sy: q.sy, text, anchor, fs });
    }
  }
  _labelled = new Set(placed.map((p) => p.i));
  layer.selectAll("text.dust-label")
    .data(placed, (p) => p.i)
    .join((enter) => enter.append("text")
      .attr("class", "dust-label")
      .attr("font-family", "Inter, sans-serif").attr("font-style", "italic").attr("font-weight", 500)
      .attr("paint-order", "stroke").attr("stroke", "rgba(6,6,26,0.85)")
      .attr("stroke-width", 2.5).attr("stroke-linejoin", "round")
      .attr("dominant-baseline", "central").attr("opacity", 0.8))
    .attr("x", (p) => p.sx + (p.anchor === "start" ? 5 : -5))
    .attr("y", (p) => p.sy)
    .attr("text-anchor", (p) => p.anchor)
    .attr("font-size", (p) => p.fs)
    .attr("fill", (p) => colorOf(sources[src[p.i]].cat, sources[src[p.i]].id))
    .text((p) => p.text);
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

/** Every dust dot of one category as [logR, logM] pairs (e.g. all the known
 *  black holes, for the narration), or null before the dust has loaded. */
const _byCat = new Map();
export function dustOfCat(cat) {
  if (!_data) return null;
  if (_byCat.has(cat)) return _byCat.get(cat);
  const out = [];
  for (let i = 0; i < _data.src.length; i++)
    if (_data.sources[_data.src[i]].cat === cat) out.push([_data.r[i], _data.m[i]]);
  _byCat.set(cat, out);
  return out;
}

/** Dots of the given catalogue sources (ids from dust.json's sources), as
 *  [r, m, sourceId]. */
export function dustOfSrc(ids) {
  if (!_data) return null;
  const want = new Set(ids), out = [];
  for (let i = 0; i < _data.src.length; i++) {
    const id = _data.sources[_data.src[i]].id;
    if (want.has(id)) out.push([_data.r[i], _data.m[i], id]);
  }
  return out;
}

/** Raw positions { r, m } (log radius, log mass) once loaded, else null. */
export function dustArrays() {
  return _data ? { r: _data.r, m: _data.m } : null;
}
