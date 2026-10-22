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
import {spaceCoreGeometry,spaceEdgeMask} from "./space-art.js";
import {animateIconGrowth} from "./icon-hover.js";
import {priorityCircles} from "./visibility-hierarchy.js";
import {starBodyGeometry} from "./star-light.js";
import { PARALLAX, planePoint, unprojectPlane, planeTransform, iconPoint } from "./parallax.js";
import { applyBulkDust } from "./bulk-density.js";
import { select as d3sel } from "d3";
// The most recognisable objects of each mass band (three decades wide), picked
// by hand: [{ band, rank, source, name, kind }]. They are drawn and named
// before anything else, with their specific kind ("ocean liner", "axolotl").
import FAMOUS from "./dust-famous.json";

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
const LABEL_MAX_DESKTOP = 10;   // incidental labels; selected pictures always keep their names
const LABEL_MAX_MOBILE = 5;
const LABEL_GAP_DESKTOP = 110;  // px — clear radius around each labelled dot
const LABEL_GAP_MOBILE = 90;
const LABEL_FONT = 10;          // px, before the font-size setting — as curated labels
const LABEL_MAX_CHARS = 24;    // longer names are skipped, not cut (~90% of names fit)
// Named famous dots with a picture are promoted once more, map-style: the
// picture replaces the dot when it would be big enough and has room.
const ICON_MIN = 30;            // px — smallest picture a dot is promoted to
const ICON_ROOM = 1.3;          // pictures keep 30% of their radii clear between them
// Catalogue designations (Gaia DR3 4057…, 2MASS J0523…, MD17 cloud 6573)
// aren't worth reading.
const ID_LIKE = /\d{5,}|^(Gaia|2MASS|TIC|KIC|EPIC|HIP|HD|TYC|WISE|SDSS|UGC|PGC|NGC|IC|GJ|LHS|NLTT|MD17)\b/i;
// One-word acronyms (EOFdMKM) read as noise; S-125 or MAZ-537 still pass.
const ACRONYM = /^(?=\S+$)(?:[^A-Z]*[A-Z]){5}/;
// What each catalogue's things are, added as "Twike (car)" unless the name
// already says it. Missing = no label for that catalogue.
const LABEL_KIND = {
  hadron: "particle", element: "element", molecule: "molecule", protein: "protein",
  bacterium: "microbe", cell: "microalga", insect: "insect", lepidoptera: "moth or butterfly",
  moth: "moth", amphibian: "amphibian", mammal: "mammal",
  vehicle: "vehicle", rail: "train", armour: "military vehicle", ship: "ship",
  aircraft: "aircraft", spacecraft: "spacecraft", artefact: "artefact",
  lake: "lake", glacier: "glacier", icesheet: "ice sheet",
  meteorite: "meteorite", "asteroid-boulder": "boulder", impactor: "impactor",
  smallbody: "asteroid", "smallbody-measured": "asteroid", moon: "moon",
  exoplanet: "exoplanet", browndwarf: "brown dwarf",
  debcat: "binary star", host: "star", wd: "white dwarf", neutronstar: "neutron star",
  oc: "star cluster", gc: "globular cluster", galaxy: "galaxy", cluster: "galaxy cluster",
};
// Wikidata files drones as aircraft: below ~100 kg they all are (the
// lightest crewed one, the 1909 Demoiselle, is 110 kg), bar museum models.
function labelKind(id, name, logM) {
  if (id === "aircraft" && logM < 5.02) return /\bmodel\b/i.test(name) ? "model" : "drone";
  return LABEL_KIND[id];
}

// Catalogue entries dropped at load: [source id, name, why]. Also listed in
// the source's build script so the next dust build leaves them out.
const DUST_EXCLUDE = [
  ["artefact", "Untitled", "an artwork's title, not a name"],
];

let _data = null;          // { names, r, m, src, rank, sources }
let _loading = null;
let _kept = [];            // [{ i, sx, sy }] drawn this frame
let _keptGrid = new Map(); // cell key → indices into _kept (hover lookup)
let _labelled = new Set(); // dust indices labelled last frame: kept first, so labels don't flicker
let _priorityIcons = new Map(); // fixed-rank catalogue pictures, independent of dot/label thinning
const _priorityIconDecisions = new Map();
let _iconShapes = [];      // [{ i, name, sx, sy, r, blend }] of those pictures, for the map's cast shadows
let _visibilityEpoch = null;
const _dotDecisions = new Map();
const _nameDecisions = new Map(); // null means deliberately hidden, not undecided
let _view = null;
const _iconGrowth = new Map();
const _loadedPictures = new Set();
function iconClearance(radius, name) {
  return _view.parallax ? PARALLAX.icon * (1 + PARALLAX.variation) * (_view.bodySizeAt?.(radius * 2, name) ?? radius * 2) : 0;
}
function picturePoint(p, k = _iconGrowth.get(p.i) || 1) {
  return iconPoint(p.sx, p.sy, _view.cw, _view.ch, _view.bodySizeAt?.(p.r * 2, p.name) ?? p.r * 2, k, _view.parallax, _view.depthKeyOf?.(p.name) || p.name);
}
let _focused = null;
let _searchEntries = null;

/** Search uses the same loaded, bulk-adjusted coordinates as the renderer. */
export function dustSearchEntries() {
  if (!_data) return [];
  return _searchEntries ??= _data.names.map((name, i) => {
    const source = _data.sources[_data.src[i]], famous = _data.fame.get(i);
    return { name: famous?.label || name, aliases: [name], dustIndex: i,
      logR: _data.r[i], logM: _data.m[i], cat: source.cat, sourceId: source.id,
      kind: famous?.kind || labelKind(source.id, name, _data.m[i]) || source.label };
  });
}

export function focusDust(index = null) {
  for (const i of [_focused, index]) {
    _dotDecisions.delete(i); _nameDecisions.delete(i);
  }
  _focused = index;
}

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
    const drop = new Set(DUST_EXCLUDE.map(([id, nm]) => `${id}|${nm}`));
    const keep = [];
    for (let i = 0; i < name.length; i++) if (!drop.has(`${sources[ss[i]].id}|${name[i]}`)) keep.push(i);
    const n = keep.length;
    const names = new Array(n);
    const raw = keep.map((i) => name[i]);
    const r = Float32Array.from(keep, (i) => rr[i]), m = Float32Array.from(keep, (i) => mm[i]);
    const src = Uint8Array.from(keep, (i) => ss[i]);
    // Non-round things to their bulk-density ball radius (bulk-density.js);
    // rSpan keeps the catalogue's half-longest-dimension radius.
    const rSpan = applyBulkDust(r, m, src, sources, raw);
    for (let i = 0; i < n; i++) {
      const so = sources[src[i]];
      names[i] = so.pre + raw[i] + so.suf;
    }
    // The famous few first (each band's no. 1, then each band's no. 2…), then
    // the rest in a deterministic shuffle (mulberry32): stable thinning priority
    const famousKey = new Map(FAMOUS.map((f) => [`${f.source}|${f.name}`, f]));
    const fame = new Map();     // dust index → { rank, kind }
    for (let i = 0; i < n; i++) {
      const f = famousKey.get(`${sources[src[i]].id}|${raw[i]}`);
      if (f) fame.set(i, f);
    }
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
    const first = [...fame.keys()].sort((a, b) => fame.get(a).rank - fame.get(b).rank);
    const rest = rank.filter((i) => !fame.has(i));
    rank.set(first, 0); rank.set(rest, first.length);
    _data = { names, r, rSpan, m, src, rank, sources, fame };
    return _data;
  }).catch(error => {
    _loading = null;
    throw error;
  });
  return _loading;
}

/**
 * Draw the dust layer.
 * @param layer    d3 selection of the <g> to draw into
 * @param view     { px, py, cw, ch, mobile, hidden, labels, fontScale, labelColorOf }
 *                 — labelColorOf (catKey, sourceId): full colour for named dust
 * @param blockers { dots: [{sx, sy}], rects: [{x, y, w, h}], circles: [{sx, sy, r}] }
 *                 — curated dots, labels and (round) icons dust must stay clear of
 * @param colorOf  (catKey, sourceId) → css colour
 */
export function drawDust(layer, view, blockers, colorOf) {
  _view = view;
  if (_visibilityEpoch !== view.visibilityEpoch) {
    _visibilityEpoch = view.visibilityEpoch;
    _dotDecisions.clear(); _nameDecisions.clear(); _priorityIconDecisions.clear();
  }
  _kept = [];
  _keptGrid = new Map();
  if (!_data || view.hidden) { view.iconLayer?.selectAll("g.dust-picture").remove(); _iconGrowth.clear(); layer.selectAll("path, g.dust-named").remove(); _labelled = new Set(); _priorityIcons.clear(); _iconShapes = []; return; }

  const { px, py, cw, ch } = view;
  const { r, m, src, rank, sources } = _data;
  const cap = view.mobile ? MAX_DOTS_MOBILE : MAX_DOTS_DESKTOP;

  // Promote pictures against a world-wide fixed hierarchy, before viewport
  // thinning and labels. Hidden higher ranks still reserve their footprint;
  // neither a new label nor a viewport quota can replace an existing picture.
  _priorityIcons = new Map();
  if (view.labels && view.iconOf) {
    const candidates = [];
    for (const [i, famous] of _data.fame) {
      const name = famous.label || _data.names[i], size = view.iconSizeAt(r[i], name, sources[src[i]].cat);
      const url = view.iconOf(name, size);
      if (url) candidates.push({i,name,url,rank:famous.rank,sx:px(r[i]),sy:py(m[i]),r:size/2,
        blend:view.iconBlend?.(sources[src[i]].cat)});
    }
    candidates.sort((a,b) => a.rank-b.rank || a.i-b.i);
    const selected = priorityCircles(candidates, p=>p.r, ICON_ROOM, blockers.priorityCircles || []);
    for (const p of candidates) {
      if (!_priorityIconDecisions.has(p.i)) _priorityIconDecisions.set(p.i, selected.has(p) && p.r*2 >= ICON_MIN);
      if (_priorityIconDecisions.get(p.i)) _priorityIcons.set(p.i,p);
    }
  }

  // --- occupancy grid of things dust must not touch ---
  const OC = 4; // px per occupancy cell
  const gw = Math.ceil(cw / OC) + 1, gh = Math.ceil(ch / OC) + 1;
  const occ = new Uint8Array(gw * gh);
  const fill = (x0, y0, x1, y1) => {
    const a = Math.max(0, Math.floor(x0 / OC)), b = Math.min(gw - 1, Math.floor(x1 / OC));
    const c = Math.max(0, Math.floor(y0 / OC)), d = Math.min(gh - 1, Math.floor(y1 / OC));
    if (a > b || c > d) return;
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
  // Existing visible decisions reserve their space before new arrivals.
  // Existing hidden decisions remain hidden until the next zoom epoch.
  const order = [...(_focused == null ? [] : [_focused]),
    ...[..._priorityIcons.keys()].filter(i=>i!==_focused),
    ...rank.filter(i => i !== _focused && !_priorityIcons.has(i) && _dotDecisions.get(i) === true),
    ...rank.filter(i => i !== _focused && !_priorityIcons.has(i) && !_dotDecisions.has(i))];
  for (const i of order) {
    const retained = i === _focused || _priorityIcons.has(i) || _dotDecisions.get(i) === true;
    const pad = retained ? 256 : 0;
    const sx = px(r[i]);
    if (sx < -pad || sx > cw + pad) continue;
    const sy = py(m[i]);
    if (sy < -pad || sy > ch + pad) continue;
    if (!retained) {
      _dotDecisions.set(i, false);
      if (_kept.length >= cap || occ[Math.floor(sy / OC) * gw + Math.floor(sx / OC)]) continue;
    }
    const cx = Math.floor(sx / G), cy = Math.floor(sy / G);
    let clash = false;
    for (let dy = -1; !retained && dy <= 1 && !clash; dy++) {
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
    _dotDecisions.set(i, true);
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
    .attr("d", (g) => g.d)
    .attr("transform", planeTransform(cw, ch, view.parallax ? PARALLAX.dust : 0));

  drawDustLabels(layer, view, occ, gw, gh, OC, colorOf);
}

/** Render fixed-priority catalogue pictures first, with persistent labels.
 *  Then name a sparse few incidental dots in the remaining text space.
 *  Label placement never decides which catalogue picture is visible. */
function drawDustLabels(layer, view, occ, gw, gh, OC, colorOf) {
  const { names, src, sources } = _data;
  const placed = [];
  if (view.labels || _focused != null) {
    const max = view.mobile ? LABEL_MAX_MOBILE : LABEL_MAX_DESKTOP;
    const gap2 = (view.mobile ? LABEL_GAP_MOBILE : LABEL_GAP_DESKTOP) ** 2;
    const fs = LABEL_FONT * (view.fontScale || 1);
    const free = (x0, y0, x1, y1) => {
      // The viewport clips artwork; its edge is not a visibility blocker.
      for (let y = Math.max(0,Math.floor(y0 / OC)); y <= Math.min(gh-1,Math.floor(y1 / OC)); y++)
        for (let x = Math.max(0,Math.floor(x0 / OC)); x <= Math.min(gw-1,Math.floor(x1 / OC)); x++)
          if (occ[y * gw + x]) return false;
      return true;
    };
    // Fixed-priority pictures precede incidental labels. Label collisions
    // can change the text side, but never demote a selected picture to a dot.
    const order = [..._kept.filter(q => q.i === _focused),
      ..._kept.filter(q => q.i !== _focused && _priorityIcons.has(q.i)),
      ..._kept.filter(q => q.i !== _focused && !_priorityIcons.has(q.i) && _nameDecisions.get(q.i)),
      ..._kept.filter(q => q.i !== _focused && !_priorityIcons.has(q.i) && !_nameDecisions.has(q.i))];
    const occupyIcon = (q, r, name) => {
      // Reserve existing and newly selected silhouettes equally.
      const R = r + iconClearance(r, name) + 1;
      for (let y = Math.max(0, Math.floor((q.sy - R) / OC)); y <= Math.min(gh - 1, Math.floor((q.sy + R) / OC)); y++) {
        const dy = Math.abs((y + 0.5) * OC - q.sy);
        if (dy > R) continue;
        const hw = Math.sqrt(R * R - dy * dy);
        const a = Math.max(0, Math.floor((q.sx - hw) / OC)), b = Math.min(gw - 1, Math.floor((q.sx + hw) / OC));
        if (b >= a) occ.fill(1, y * gw + a, y * gw + b + 1);
      }
    };
    for (const q of order) {
      if (q.i === _focused) {
        const name = _data.fame.get(q.i)?.label || names[q.i];
        const size = Math.max(64, view.iconSizeAt(_data.r[q.i], name, sources[src[q.i]].cat));
        const url = view.iconOf?.(name, size);
        const icon = url ? { url, r: size / 2, name, blend: view.iconBlend?.(sources[src[q.i]].cat) } : null;
        if (icon) occupyIcon(q, icon.r, icon.name);
        placed.push({ ...q, text: name, anchor: 'start', fs, icon });
        continue;
      }
      if (!view.labels) continue;
      const chosen = _priorityIcons.get(q.i);
      if (chosen) {
        const famous=_data.fame.get(q.i), name=chosen.name;
        const text=famous.kind && !name.toLowerCase().includes(famous.kind.split(' ').pop()) ? `${name} (${famous.kind})` : name;
        const icon={url:chosen.url,r:chosen.r,name,blend:chosen.blend};
        const saved=_nameDecisions.get(q.i);
        const off=chosen.r+4+iconClearance(chosen.r,name),w=text.length*fs*.62,h=fs*1.2;
        const anchor=saved?.anchor || (free(q.sx+off,q.sy-h/2,q.sx+off+w,q.sy+h/2)?'start':'end');
        const placement={...q,text,anchor,fs,icon};
        occupyIcon(q,icon.r,name);placed.push(placement);_nameDecisions.set(q.i,placement);
        continue;
      }
      const saved = _nameDecisions.get(q.i);
      if (saved) {
        const p = { ...saved, sx:q.sx, sy:q.sy };
        if (saved.icon) {
          const size = view.iconSizeAt(_data.r[q.i], saved.icon.name, sources[src[q.i]].cat);
          p.icon = { ...saved.icon, r:size/2, url:view.iconOf(saved.icon.name,size) };
          occupyIcon(q, p.icon.r, p.icon.name);
        }
        placed.push(p);
        continue;
      }
      _nameDecisions.set(q.i, null);
      if (placed.length >= max) continue;
      const so = sources[src[q.i]], famous = _data.fame.get(q.i);
      let text;
      if (famous) {
        // hand-picked: its popular name ("Andromeda", "Hedgehog") and kind ("" = none)
        const name = famous.label || names[q.i];
        text = famous.kind && !name.toLowerCase().includes(famous.kind.split(" ").pop()) ? `${name} (${famous.kind})` : name;
      } else {
        const kind = labelKind(so.id, names[q.i], _data.m[q.i]);
        if (!kind || so.suf) continue;           // black holes (ticks), clouds, nuclei…
        const name = names[q.i];
        if (!name || name.length > LABEL_MAX_CHARS || ID_LIKE.test(name) || ACRONYM.test(name)) continue;
        text = name.toLowerCase().includes(kind.split(" ").pop()) ? name : `${name} (${kind})`;
      }
      if (placed.some((p) => (p.sx - q.sx) ** 2 + (p.sy - q.sy) ** 2 < gap2)) continue;
      const w = text.length * fs * 0.62, h = fs * 1.2;
      // the text beside a dot (off = 6) or beside a picture of radius r (off = r + 2)
      const side = (off) => free(q.sx + off, q.sy - h / 2, q.sx + off + 3 + w, q.sy + h / 2) ? "start"
        : free(q.sx - off - 3 - w, q.sy - h / 2, q.sx - off, q.sy + h / 2) ? "end" : null;
      const icon = null, anchor = side(6);
      if (!anchor) continue;
      const placement = { i: q.i, sx: q.sx, sy: q.sy, text, anchor, fs, icon };
      placed.push(placement);
      _nameDecisions.set(q.i, placement);
    }
  }
  _labelled = new Set(placed.map((p) => p.i));
  _iconShapes = placed.filter((p) => p.icon).map((p) => ({ i: p.i, name: p.icon.name, cat: sources[src[p.i]].cat, logM:_data.m[p.i], sx: p.sx, sy: p.sy, r: p.icon.r, blend: p.icon.blend }));
  const color = (p) => (view.labelColorOf || colorOf)(sources[src[p.i]].cat, sources[src[p.i]].id);
  layer.selectAll("g.dust-named")
    .data(placed, (p) => p.i)
    .join((enter) => {
      const g = enter.append("g").attr("class", "dust-named");
      g.append("circle").attr("class", "dn-glow").attr("r", 6).attr("opacity", 0.1);
      g.append("circle").attr("class", "dn-dot").attr("r", 2.8).attr("opacity", 0.85);

      g.append("text")
        .attr("font-family", "Inter, sans-serif").attr("font-weight", 600).attr("letter-spacing", "0.5px")
        .attr("paint-order", "stroke").attr("stroke", "rgba(6,6,26,0.85)")
        .attr("stroke-width", 3).attr("stroke-linejoin", "round")
        .attr("dominant-baseline", "central");
      return g;
    })
    .each(function (p) {
      const g = d3sel(this), c = color(p);
      const dot = planePoint(p.sx, p.sy, view.cw, view.ch, view.parallax ? PARALLAX.dust : 0);
      const label = planePoint(p.sx, p.sy, view.cw, view.ch, view.parallax ? PARALLAX.labels : 0);
      g.selectAll("circle").attr("transform", `translate(${dot.x-p.sx},${dot.y-p.sy})`);
      g.select("text").attr("transform", `translate(${label.x-p.sx},${label.y-p.sy})`);
      g.selectAll("circle").attr("cx", p.sx).attr("cy", p.sy).attr("fill", c)
        .attr("display", p.icon ? "none" : null);
      const off = p.icon ? p.icon.r + 4 + iconClearance(p.icon.r, p.icon.name) : 8;
      g.select("text")
        .attr("x", p.sx + (p.anchor === "start" ? off : -off)).attr("y", p.sy)
        .attr("text-anchor", p.anchor).attr("font-size", p.fs)
        .attr("fill", c).text(p.text);
    });
  const imageLayer = view.iconLayer || layer;
  imageLayer.selectAll("g.dust-picture").data(_iconShapes, p => p.i)
    .join(enter => { const g = enter.append("g").attr("class", "dust-picture");
      g.append("circle").attr("class","dn-body").attr("fill","#000");
      g.append("image").attr("class", "dn-icon").attr("preserveAspectRatio", "xMidYMid meet")
        .on("load",function(){_loadedPictures.add(this.getAttribute("href"));d3sel(this.parentNode).select(".dn-body").attr("visibility",null)}); return g; })
    .each(function(p) {
      const g = d3sel(this), point = picturePoint(p);
      g.attr("transform", "translate(" + (point.x-p.sx) + "," + (point.y-p.sy) + ")");
      const source = placed.find(q => q.i === p.i).icon;
      const soft=view.softSpaceOf?.(p.cat,p.name);
      const disc=starBodyGeometry(view.depthKeyOf?.(p.name),p.sx,p.sy,p.r*2,_iconGrowth.get(p.i)||1)||(soft?spaceCoreGeometry(view.depthKeyOf?.(p.name),p.sx,p.sy,p.r*2,_iconGrowth.get(p.i)||1):null);
      g.select(".dn-body").attr("display",disc?null:"none").attr("fill",soft?"url(#space-core-gradient)":"#000")
        .attr("visibility",_loadedPictures.has(source.url)?null:"hidden")
        .attr("cx",disc?.cx??p.sx).attr("cy",disc?.cy??p.sy).attr("r",disc?.r??0);
      g.select("image").style("transform",(_iconGrowth.get(p.i)||1)===1?null:`scale(${_iconGrowth.get(p.i)})`).attr("href", source.url)
        .attr("x", p.sx-p.r).attr("y", p.sy-p.r).attr("width", p.r*2).attr("height", p.r*2)
        .style("mix-blend-mode", p.blend ? "screen" : null)
        .style("filter",view.iconFilterOf?.(p.cat,p.name)||`brightness(${view.iconBrightnessOf?.(p.cat,p.name)??1})`)
        .attr("mask",soft?spaceEdgeMask(view.depthKeyOf?.(p.name)):null);
    });
}

/** The dust picture under (x, y), if any: { i, name, sx, sy, r, blend }. */
export function pickDustIcon(x, y) {
  let best = null, bestD = Infinity;
  for (const p of _iconShapes) {
    const point = picturePoint(p);
    const d = (point.x - x) ** 2 + (point.y - y) ** 2;
    const radius = p.r * (_iconGrowth.get(p.i) || 1);
    if (d <= radius * radius && d < bestD) { bestD = d; best = p; }
  }
  return best;
}

/** Grow (k > 1) or restore (k = 1) dust picture i, as curated icons do on hover. */
export function setDustIconScale(layer, i, k) {
  const group = layer.selectAll("g.dust-picture").filter(p => p.i === i);
  if (k > 1) group.raise();
  animateIconGrowth(group,k,(node,growth)=>{
    const p=node.__data__,g=d3sel(node);
    if(growth>1)_iconGrowth.set(i,growth);else _iconGrowth.delete(i);
    const point=picturePoint(p,growth);
    const disc=starBodyGeometry(_view.depthKeyOf?.(p.name),p.sx,p.sy,p.r*2,growth)||(_view.softSpaceOf?.(p.cat,p.name)?spaceCoreGeometry(_view.depthKeyOf?.(p.name),p.sx,p.sy,p.r*2,growth):null);
    if(disc)g.select('.dn-body').attr('cx',disc.cx).attr('cy',disc.cy).attr('r',disc.r);
    g.attr('transform',`translate(${point.x-p.sx},${point.y-p.sy})`);
    g.select('.dn-icon').style('transform',growth===1?null:`scale(${growth})`);
  },_view.reducedMotion);

}

/** The dust pictures drawn last frame: [{ i, name, sx, sy, r, blend }]. */
export function dustIcons() { return _iconShapes; }

/** The dots drawn last frame: [{ i, sx, sy }] (the map casts their shadows). */
export function dustDots() { return _kept; }

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
  ({x,y} = unprojectPlane(x,y,_view.cw,_view.ch,_view.parallax ? PARALLAX.dust : 0));
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
    sx: planePoint(best.sx,best.sy,_view.cw,_view.ch,_view.parallax ? PARALLAX.dust : 0).x,
    sy: planePoint(best.sx,best.sy,_view.cw,_view.ch,_view.parallax ? PARALLAX.dust : 0).y,
  };
}

/** Raw positions { r, m } (log radius, log mass) once loaded, else null. */
export function dustArrays() {
  return _data ? { r: _data.r, m: _data.m } : null;
}
