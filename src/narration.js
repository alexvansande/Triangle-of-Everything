// =============================================================
// Narration player — ?narrate=<take>
// =============================================================
// Plays a recorded narration (public/narration/<take>/) over the map and
// drives everything from a phrase-anchored scene script
// (src/narration-scene.js): camera moves, highlights, the unit rulers,
// karaoke captions, and the cross-fade from the classic Lineweaver–Patel
// figure. Cues are anchored to WORDS, not timestamps: a new recording only
// needs its own words.json (word timings) and every cue lands on the same
// phrase again.
//
// Everything on screen is a pure function of the audio time t (renderAt),
// so the live player can seek freely and scripts/narration-render.mjs can
// render a frame-exact video by stepping t.
//
//   ?narrate=take-1             live player (tap to start, tap to pause)
//   &render=1                   no player UI; exposes window.__narr for the renderer
//   &captions=0                 no captions
//   &stage=landscape|none       recording stage (default: 9:16 phone)

import * as d3 from "d3";
import {
  HUBBLE_LOG_R, PLANCK_LOG_R, PLANCK_LOG_M, schwarzschildM, comptonM,
  densityLineM, DENSITY_SPHERE_C, SCHWARZSCHILD_C, COMPTON_C,
  RADIUS_UNITS, MASS_UNITS, REFERENCE_LINES,
} from "./data.js";
import { narrClassic, classicFrameClient } from "./classic.js";
// Scene scripts, one per file in ./narration-scenes/ (lazy chunks)
const SCENES = import.meta.glob("./narration-scenes/*.js");
let SCENE;

let params, RENDER, CAPTIONS;
// The size ruler hugs the bottom edge (y as a fraction of the stage height):
// out of the middle of the picture. Captions sit just above it.
const RULER_Y = 0.955;

const norm = (w) => w.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9']/g, "");
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };

// ---------- lines the script can highlight (data space) ----------
function densitySegment(logRho) {
  // logM = 3 logR + b, clipped to the triangle: Compton below, Schwarzschild
  // above, Hubble on the right.
  const b = DENSITY_SPHERE_C + logRho;
  const r0 = (COMPTON_C - b) / 4;
  const r1 = Math.min((-SCHWARZSCHILD_C - b) / 2, HUBBLE_LOG_R);
  return r0 < r1 ? [[r0, densityLineM(r0, logRho)], [r1, densityLineM(r1, logRho)]] : [];
}
const H = HUBBLE_LOG_R;
const LINES = {
  schwarzschild: { pts: [[PLANCK_LOG_R, PLANCK_LOG_M], [H, schwarzschildM(H)]], color: "#ff6e6e" },
  compton:       { pts: [[PLANCK_LOG_R, PLANCK_LOG_M], [H, comptonM(H)]], color: "#4dd0e1" },
  hubble:        { pts: [[H, comptonM(H)], [H, schwarzschildM(H)]], color: "#ffd54f" },
  water:         { pts: densitySegment(0), color: "#80deea" },
  darkmatter:    { pts: densitySegment(-24), color: "#e1a6ff" },
  mainsequence:  { pts: REFERENCE_LINES.find(l => l.label === "Main Sequence").points.map(p => [p.logR, p.logM]), color: "#ffd740" },
};
LINES.triangle = { pts: [...LINES.schwarzschild.pts, [H, comptonM(H)], LINES.schwarzschild.pts[0]], color: "#ffffff" };

// ---------- scene resolution: phrases → times ----------
function resolveScene(words) {
  const toks = words.map(([w, s, e]) => ({ w, n: norm(w), s, e }));
  const same = (a, b) => a === b || a.replace(/s$/, "") === b.replace(/s$/, "");
  function find(phrase, from) {
    const p = phrase.split(/\s+/).map(norm).filter(Boolean);
    const scan = (lo) => {
      for (let i = 0; i + p.length <= toks.length; i++) {
        if (toks[i].s < lo) continue;
        if (p.every((x, j) => same(toks[i + j].n, x))) return { s: toks[i].s, e: toks[i + p.length - 1].e };
      }
      return null;
    };
    return scan(from) || null;
  }
  const cues = [];
  let cursor = 0;
  const missing = [];
  for (const c of SCENE.cues) {
    let t;
    if (c.t != null) t = c.t;
    else {
      const alts = Array.isArray(c.at) ? c.at : [c.at];
      let hit = null;
      for (const a of alts) { hit = find(a, cursor); if (hit) break; }
      if (!hit) { missing.push(alts[0]); continue; }
      t = (c.atEnd ? hit.e : hit.s) + (c.offset ?? -0.25);
      cursor = hit.s;
    }
    cues.push({ ...c, time: Math.max(0, t) });
  }
  window.__narrMissing = missing;
  if (missing.length) console.warn(`[narration] ${missing.length} cue phrase(s) not found:`, missing);
  cues.sort((a, b) => a.time - b.time);
  return cues;
}

// ---------- captions ----------
function buildCaptions(words) {
  const fix = SCENE.captionFixes || {};
  const out = [];
  let cur = [];
  const flush = () => { if (cur.length) out.push(cur); cur = []; };
  words.forEach(([w, s, e], i) => {
    const key = norm(w);
    const shown = fix[key] ? w.replace(/[A-Za-z’']+/, fix[key]) : w;
    const prev = cur[cur.length - 1];
    if (prev && (s - prev.e > 0.45 || cur.length >= 4 || cur.reduce((n, x) => n + x.w.length + 1, 0) + shown.length > 22)) flush();
    cur.push({ w: shown, s, e });
    if (/[.?!]$/.test(w)) flush();
  });
  flush();
  return out.map((ws, i) => ({ ws, s: ws[0].s - 0.08, e: Math.min(ws[ws.length - 1].e + 0.5, out[i + 1]?.[0].s - 0.08 ?? Infinity) }));
}

export async function startNarration(app) {
  params = app.params;
  RENDER = params.has("render");
  CAPTIONS = params.get("captions") !== "0";
  const base = `/narration/${app.take}/`;
  const take = await fetch(base + "words.json").then(r => r.json());
  SCENE = (await SCENES[`./narration-scenes/${take.scene || "tour"}.js`]()).default;
  const cues = resolveScene(take.words);
  const captions = CAPTIONS ? buildCaptions(take.words) : [];
  const duration = take.duration;

  const stage = params.get("stage") || "portrait";
  if (stage !== "none" && (RENDER || !app.isMobile())) app.setStage(stage);
  app.prepare();

  const objByName = new Map(app.objects.map(o => [o.name, o]));
  const objColor = (o) => app.categories[o.cat]?.color || "#fff";
  const resolveView = (v) => {
    if (v.obj) {
      const o = objByName.get(v.obj);
      if (!o) { console.warn("[narration] unknown object", v.obj); return null; }
      return { r: o.logR + (v.dr || 0), m: o.logM + (v.dm || 0), span: v.span };
    }
    return { r: v.r, m: v.m, span: v.span };
  };

  // ---------- camera timeline ----------
  const START = SCENE.start;
  const keys = cues.filter(c => c.cam).map(c => ({ t: c.time, to: resolveView(c.cam), dur: c.dur, drift: c.drift ?? 0.05 }))
    .filter(k => k.to);
  for (let i = 0; i < keys.length; i++) {
    const from = i === 0 ? START : camAt(keys[i].t, i - 1);
    const k = keys[i];
    k.from = from;
    k.interp = d3.interpolateZoom([from.r, from.m, from.span], [k.to.r, k.to.m, k.to.span]);
    if (k.dur == null) k.dur = Math.max(1.4, Math.min(3.6, k.interp.duration / 1000 * 0.8));
    k.end = k.t + k.dur;
  }
  /** Camera at time t using key i (and the drift until key i+1). */
  function camAt(t, i) {
    if (i < 0) return START;
    const k = keys[i];
    if (t < k.end) {
      const [r, m, span] = k.interp(d3.easeCubicInOut(clamp01((t - k.t) / k.dur)));
      return { r, m, span, phase: "fly" };
    }
    const next = keys[i + 1]?.t ?? k.end + 20;
    const f = clamp01((t - k.end) / Math.max(1, next - k.end));
    return { ...k.to, span: k.to.span * (1 - k.drift * f), phase: "hold" };
  }
  function camera(t) {
    let i = -1;
    while (i + 1 < keys.length && keys[i + 1].t <= t) i++;
    return { view: camAt(t, i), key: i };
  }

  // ---------- classic figure ----------
  const fadeCue = cues.find(c => c.classic === "out");
  const fadeT = fadeCue ? fadeCue.time : -1;
  const FADE = fadeCue?.fade ?? 3;
  const classicOpacity = (t) => fadeT < 0 ? 0 : 1 - smooth((t - fadeT) / FADE);

  // ---------- highlights: each lasts until the next cue with hl/clear ----------
  const hlCues = cues.filter(c => c.hl || c.clear);
  const highlights = [];
  hlCues.forEach((c, i) => {
    if (!c.hl) return;
    const t1 = Math.min(hlCues[i + 1]?.time ?? Infinity, c.time + (c.hold ?? 14));
    c.hl.forEach((h, j) => highlights.push({ ...h, t0: c.time + (h.delay || 0), t1, id: `${i}-${j}` }));
  });

  // ---------- unit rulers: up while the camera moves (or pinned) ----------
  const pins = cues.filter(c => c.units).map(c => ({ t0: c.time, t1: c.time + (c.unitsFor ?? 6) }));
  function unitsOpacity(t) {
    let o = 0;
    for (const k of keys) {
      if (k.end - k.t < 0.4) continue;
      o = Math.max(o, smooth((t - (k.t - 0.4)) / 0.4) * (1 - smooth((t - (k.end + 0.9)) / 0.9)));
    }
    for (const p of pins) o = Math.max(o, smooth((t - p.t0) / 0.4) * (1 - smooth((t - p.t1) / 0.9)));
    return o * (1 - clamp01(classicOpacity(t) * 2));
  }

  // ---------- DOM ----------
  const layer = document.createElement("div");
  layer.id = "narr-layer";
  layer.innerHTML = `<svg id="narr-svg"></svg><div id="narr-caption"></div>` +
    (RENDER ? "" : `<div id="narr-ui"><button id="narr-play" aria-label="Play">▶</button>
      <div id="narr-title">The Triangle of Everything<span>narrated tour · tap to play</span></div></div>
      <div id="narr-bar"><div id="narr-bar-fill"></div></div>`);
  document.body.appendChild(layer);
  const style = document.createElement("style");
  style.textContent = NARR_CSS;
  document.head.appendChild(style);
  await document.fonts.load('700 38px "Barlow Condensed"').catch(() => {});
  const nsvg = d3.select("#narr-svg");
  const gUnits = nsvg.append("g").attr("class", "narr-units");
  const hlClip = nsvg.append("clipPath").attr("id", "narr-hl-clip").append("rect");
  const gHl = nsvg.append("g").attr("class", "narr-hl");
  const gHlFree = nsvg.append("g").attr("class", "narr-hl-free"); // axis bands: never clipped
  const capEl = document.getElementById("narr-caption");

  let curT = 0;
  const sx = (r) => app.plot().x + app.px(r);
  const sy = (m) => app.plot().y + app.py(m);

  function drawHighlights(t) {
    // over the classic figure, keep highlights inside its plot frame
    const fr = classicOpacity(t) > 0.5 ? classicFrameClient() : null;
    if (fr) {
      const lr = layer.getBoundingClientRect(), sc = lr.width / layer.clientWidth;
      hlClip.attr("x", (fr.x - lr.x) / sc).attr("y", (fr.y - lr.y) / sc).attr("width", fr.w / sc).attr("height", fr.h / sc);
      gHl.attr("clip-path", "url(#narr-hl-clip)");
    } else gHl.attr("clip-path", null);
    const live = highlights.filter(h => t >= h.t0 - 0.01 && t < h.t1 + 0.5);
    const join = (grp, data) => {
      const g = grp.selectAll("g.hl").data(data, d => d.id);
      g.exit().remove();
      return g.enter().append("g").attr("class", "hl").merge(g);
    };
    join(gHlFree, live.filter(h => h.axis)).each(function (h) {
      const el = d3.select(this);
      el.selectAll("*").remove();
      const age = t - h.t0;
      el.attr("opacity", smooth(age / 0.45) * (1 - smooth((t - h.t1) / 0.5)));
      drawAxis(el, h, age, fr);
    });
    join(gHl, live.filter(h => !h.axis)).each(function (h) {
      const el = d3.select(this);
      el.selectAll("*").remove();
      const age = t - h.t0;
      const op = smooth(age / 0.45) * (1 - smooth((t - h.t1) / 0.5));
      el.attr("opacity", op);
      if (h.obj) drawObj(el, h, age);
      else if (h.line) drawLine(el, LINES[h.line], h, age);
      else if (h.side) drawSide(el, h);
      else if (h.arrow) drawArrow(el, h, age);
    });
  }
  /** A glowing band over one axis: { axis: "left"|"right"|"top"|"bottom", label? }.
   *  Over the classic figure the band covers that side's tick labels, just
   *  outside the plot frame; on the map it hugs the screen edge (or the size
   *  ruler, for "bottom"). */
  function drawAxis(el, h, age, frClient) {
    const SW = layer.clientWidth, SH = layer.clientHeight;
    let box;
    if (frClient) {
      const lr = layer.getBoundingClientRect(), sc = lr.width / SW;
      box = { x: (frClient.x - lr.x) / sc, y: (frClient.y - lr.y) / sc, w: frClient.w / sc, h: frClient.h / sc };
    } else {
      const yR = SH * (SCENE.rulerY ?? RULER_Y);
      box = { x: 34, y: 18, w: SW - 68, h: yR - 18 };
    }
    const T = frClient ? 44 : 30;   // band thickness
    const side = h.axis;
    const r = side === "left" ? { x: box.x - T, y: box.y, w: T, h: box.h }
      : side === "right" ? { x: box.x + box.w, y: box.y, w: T, h: box.h }
      : side === "top" ? { x: box.x, y: box.y - T, w: box.w, h: T }
      : { x: box.x, y: box.y + box.h, w: box.w, h: T };
    const col = h.color || "#ffb300";
    const grow = d3.easeCubicOut(clamp01(age / 0.7));
    const pulse = 0.5 + 0.5 * Math.sin(age * 3);
    const vert = side === "left" || side === "right";
    // the band grows from the middle of the axis outwards
    const gr = vert ? { x: r.x, y: r.y + r.h * (1 - grow) / 2, w: r.w, h: r.h * grow }
      : { x: r.x + r.w * (1 - grow) / 2, y: r.y, w: r.w * grow, h: r.h };
    el.append("rect").attr("x", gr.x - 3).attr("y", gr.y - 3).attr("width", gr.w + 6).attr("height", gr.h + 6)
      .attr("rx", 9).attr("fill", col).attr("opacity", 0.10 + 0.06 * pulse);
    el.append("rect").attr("x", gr.x).attr("y", gr.y).attr("width", gr.w).attr("height", gr.h)
      .attr("rx", 7).attr("fill", col).attr("fill-opacity", 0.16).attr("stroke", col).attr("stroke-width", 2.4);
    if (!h.label) return;
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    // label sits inside the plot, next to the band, so it never leaves the stage
    const lx = side === "left" ? r.x + r.w + 14 : side === "right" ? r.x - 14 : cx;
    const ly = side === "top" ? r.y + r.h + 26 : side === "bottom" ? r.y - 12 : cy;
    const rot = side === "left" ? 90 : side === "right" ? -90 : 0;
    el.append("text").attr("class", "narr-axislabel").attr("text-anchor", "middle")
      .attr("transform", `translate(${lx},${ly}) rotate(${rot})`)
      .attr("fill", col).attr("opacity", grow).text(h.label.toUpperCase());
  }
  function drawObj(el, h, age) {
    const o = objByName.get(h.obj);
    if (!o) return;
    const x = sx(o.logR), y = sy(o.logM);
    const col = h.color || objColor(o);
    const pop = 0.6 + 0.4 * d3.easeBackOut(clamp01(age / 0.5));
    const R = (h.r || 17) * pop + 2 * Math.sin(age * 3.2);
    el.append("circle").attr("cx", x).attr("cy", y).attr("r", R + 7).attr("fill", col).attr("opacity", 0.12);
    el.append("circle").attr("cx", x).attr("cy", y).attr("r", R).attr("fill", "none")
      .attr("stroke", col).attr("stroke-width", 2.2);
    el.append("circle").attr("cx", x).attr("cy", y).attr("r", R + 4).attr("fill", "none")
      .attr("stroke", "#fff").attr("stroke-width", 0.8).attr("opacity", 0.6)
      .attr("stroke-dasharray", "3 4").attr("stroke-dashoffset", -age * 6);
    if (h.label === false) return;
    const label = (h.label || o.name).toUpperCase();
    // default: centred above the ring, clear of the app's own label (right)
    const place = h.place || "above";
    const tx = place === "left" ? x - R - 8 : place === "right" ? x + R + 8 : x;
    const ty = place === "below" ? y + R + 18 : place === "above" ? y - R - 9 : y + 4;
    const anchor = place === "left" ? "end" : place === "right" ? "start" : "middle";
    el.append("text").attr("class", "narr-tag").attr("x", tx).attr("y", ty)
      .attr("text-anchor", anchor).attr("fill", col).text(label);
  }
  function linePath(pts) {
    return pts.map(([r, m]) => [sx(r), sy(m)]);
  }
  function drawLine(el, L, h, age) {
    if (!L || !L.pts.length) return;
    const p = linePath(L.pts);
    let len = 0;
    for (let i = 1; i < p.length; i++) len += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    const prog = d3.easeCubicOut(clamp01(age / (h.draw ?? 1.3)));
    const d = "M" + p.map(q => q.join(",")).join("L");
    const col = h.color || L.color;
    [[12, 0.12], [6, 0.25], [2.4, 1]].forEach(([w, o]) => {
      el.append("path").attr("d", d).attr("fill", "none").attr("stroke", col)
        .attr("stroke-width", w).attr("opacity", o).attr("stroke-linecap", "round")
        .attr("stroke-dasharray", `${len * prog} ${len + 10}`);
    });
    if (h.label) {
      // label at the on-screen middle of the visible part of the line
      const plot = app.plot();
      const mid = h.labelAt != null ? [sx(h.labelAt[0]), sy(h.labelAt[1])] : clipMid(p, plot);
      const ang = Math.atan2(p[p.length - 1][1] - p[0][1], p[p.length - 1][0] - p[0][0]) * 180 / Math.PI;
      const a2 = ang > 90 ? ang - 180 : ang < -90 ? ang + 180 : ang;
      el.append("text").attr("class", "narr-linelabel")
        .attr("transform", `translate(${mid[0]},${mid[1]}) rotate(${a2}) translate(0,-10)`)
        .attr("text-anchor", "middle").attr("fill", col).attr("opacity", prog).text(h.label.toUpperCase());
    }
  }
  function clipMid(p, plot) {
    // middle of the line segment that is on screen (first→last vertex)
    const [a, b] = [p[0], p[p.length - 1]];
    const ts = [];
    for (let i = 0; i <= 200; i++) {
      const u = i / 200, x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u;
      if (x > plot.x + 30 && x < plot.x + plot.w - 30 && y > plot.y + plot.h * 0.18 && y < plot.y + plot.h * 0.7) ts.push(u);
    }
    const u = ts.length ? (ts[0] + ts[ts.length - 1]) / 2 : 0.5;
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  }
  function drawSide(el, h) {
    // shade one side of a line (default the water line) across the screen
    const L = LINES[h.of || "water"].pts;
    const [a, b] = [L[0], L[L.length - 1]];
    const dir = h.side === "right" ? 1 : -1;
    // extend the line far beyond the view, then close the polygon sideways
    const ext = (u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    const p1 = ext(-3), p2 = ext(4);
    const poly = [p1, p2, [p2[0] + dir * 200, p2[1]], [p1[0] + dir * 200, p1[1]]].map(([r, m]) => `${sx(r)},${sy(m)}`).join(" ");
    const col = h.color || (h.side === "right" ? "#4fc3f7" : "#ffab40");
    el.append("polygon").attr("points", poly).attr("fill", col).attr("opacity", 0.13);
    if (h.label) {
      const plot = app.plot();
      el.append("text").attr("class", "narr-sidelabel")
        .attr("x", plot.x + plot.w * (h.side === "right" ? 0.78 : 0.22)).attr("y", plot.y + plot.h * (h.labelY ?? 0.3))
        .attr("text-anchor", "middle").attr("fill", col).text(h.label.toUpperCase());
    }
  }
  function drawArrow(el, h, age) {
    const from = h.from.obj ? objByName.get(h.from.obj) : null;
    const to = h.to.obj ? objByName.get(h.to.obj) : null;
    const A = from ? [from.logR, from.logM] : [h.from.r, h.from.m];
    const B = to ? [to.logR, to.logM] : [h.to.r, h.to.m];
    const [x1, y1, x2r, y2r] = [sx(A[0]), sy(A[1]), sx(B[0]), sy(B[1])];
    const prog = d3.easeCubicInOut(clamp01(age / (h.draw ?? 1.4)));
    const pad = 20, L = Math.hypot(x2r - x1, y2r - y1);
    if (L < 2 * pad) return;
    const ux = (x2r - x1) / L, uy = (y2r - y1) / L;
    const sxp = x1 + ux * pad, syp = y1 + uy * pad;
    const ex = sxp + (x2r - x1 - 2 * pad * ux) * prog, ey = syp + (y2r - y1 - 2 * pad * uy) * prog;
    const col = h.color || "#ffffff";
    el.append("line").attr("x1", sxp).attr("y1", syp).attr("x2", ex).attr("y2", ey)
      .attr("stroke", col).attr("stroke-width", 2).attr("stroke-dasharray", "6 5")
      .attr("stroke-dashoffset", -age * 18);
    const ah = 9, ang = Math.atan2(uy, ux);
    el.append("path").attr("d", `M${ex},${ey} L${ex - ah * Math.cos(ang - 0.45)},${ey - ah * Math.sin(ang - 0.45)} L${ex - ah * Math.cos(ang + 0.45)},${ey - ah * Math.sin(ang + 0.45)} Z`)
      .attr("fill", col);
    if (h.to.mark) el.append("circle").attr("cx", x2r).attr("cy", y2r).attr("r", 4 * prog).attr("fill", col);
    if (h.label) {
      el.append("text").attr("class", "narr-tag").attr("x", (x1 + x2r) / 2).attr("y", (y1 + y2r) / 2 - 10)
        .attr("text-anchor", "middle").attr("fill", col).attr("opacity", prog).text(h.label.toUpperCase());
    }
  }

  // ---------- unit rulers (HUD) ----------
  const W_OFF = Math.log10(2);
  function drawUnits(t) {
    const o = unitsOpacity(t);
    gUnits.attr("opacity", o).style("display", o > 0.01 ? null : "none");
    if (o <= 0.01) return;
    gUnits.selectAll("*").remove();
    const SW = layer.clientWidth, SH = layer.clientHeight;
    const yR = Math.round(SH * (SCENE.rulerY ?? RULER_Y)), xR = Math.round(SW * 0.065);
    // horizontal: size
    gUnits.append("rect").attr("x", 0).attr("y", yR - 16).attr("width", SW).attr("height", 34)
      .attr("fill", "url(#narr-fade-h)");
    gUnits.append("line").attr("x1", 0).attr("x2", SW).attr("y1", yR).attr("y2", yR).attr("class", "narr-axis");
    const placed = [];
    const runits = [...RADIUS_UNITS].filter(u => !/Planck|Hubble/.test(u.label)).sort((a, b) => a.row - b.row);
    for (const u of runits) {
      const x = sx(u.logR);
      const w = u.label.length * 5.6 + 10;
      if (x < 6 || x > SW - 6) continue;
      if (placed.some(p => Math.abs(p - x) < w)) continue;
      placed.push(x);
      gUnits.append("line").attr("x1", x).attr("x2", x).attr("y1", yR - 5).attr("y2", yR + 5).attr("class", "narr-tick");
      gUnits.append("text").attr("x", x).attr("y", yR + 15).attr("text-anchor", "middle").attr("class", "narr-unit").text(u.label);
    }
    gUnits.append("text").attr("x", SW - 8).attr("y", yR - 7).attr("text-anchor", "end").attr("class", "narr-axname").text("SIZE →");
    // vertical: mass
    gUnits.append("rect").attr("x", 0).attr("y", 0).attr("width", xR + 54).attr("height", SH).attr("fill", "url(#narr-fade-v)");
    gUnits.append("line").attr("x1", xR).attr("x2", xR).attr("y1", 0).attr("y2", SH).attr("class", "narr-axis");
    const placedY = [];
    for (const u of MASS_UNITS) {
      if (/\/c²|Planck|electron|proton/.test(u.label)) continue;
      const y = sy(u.logM);
      if (y < SH * 0.1 || y > yR - 24) continue;
      if (placedY.some(p => Math.abs(p - y) < 17)) continue;
      placedY.push(y);
      gUnits.append("line").attr("x1", xR - 5).attr("x2", xR + 5).attr("y1", y).attr("y2", y).attr("class", "narr-tick");
      gUnits.append("text").attr("x", xR + 8).attr("y", y + 3.5).attr("class", "narr-unit").text(u.label);
    }
    gUnits.append("text").attr("transform", `translate(${xR - 6},${SH * 0.16}) rotate(-90)`).attr("text-anchor", "end")
      .attr("class", "narr-axname").text("MASS →");
  }
  const defs = nsvg.append("defs");
  const gh = defs.append("linearGradient").attr("id", "narr-fade-h").attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", 1);
  gh.append("stop").attr("offset", 0).attr("stop-color", "#000").attr("stop-opacity", 0);
  gh.append("stop").attr("offset", 0.5).attr("stop-color", "#000").attr("stop-opacity", 0.55);
  gh.append("stop").attr("offset", 1).attr("stop-color", "#000").attr("stop-opacity", 0);
  const gv = defs.append("linearGradient").attr("id", "narr-fade-v").attr("x1", 0).attr("x2", 1).attr("y1", 0).attr("y2", 0);
  gv.append("stop").attr("offset", 0).attr("stop-color", "#000").attr("stop-opacity", 0.6);
  gv.append("stop").attr("offset", 1).attr("stop-color", "#000").attr("stop-opacity", 0);

  // ---------- captions ----------
  let capIdx = -2;
  function drawCaption(t) {
    if (!CAPTIONS) return;
    const i = captions.findIndex(c => t >= c.s && t < c.e);
    const c = captions[i];
    if (i !== capIdx) {
      capIdx = i;
      capEl.innerHTML = c ? c.ws.map(w => `<span>${w.w.replace(/</g, "&lt;")}</span>`).join(" ") : "";
    }
    if (!c) return;
    capEl.style.opacity = smooth((t - c.s) / 0.12) * (1 - smooth((t - (c.e - 0.15)) / 0.15));
    [...capEl.children].forEach((sp, j) => {
      sp.classList.toggle("on", t >= c.ws[j].s - 0.03);
      sp.classList.toggle("now", t >= c.ws[j].s - 0.03 && t < (c.ws[j + 1]?.s ?? c.ws[j].e + 0.3) - 0.03);
    });
  }

  // ---------- frame ----------
  let lastKey = -2, lastPhase = null;
  function renderAt(t) {
    curT = t;
    const { view, key } = camera(t);
    const co = classicOpacity(t);
    narrClassic(co, co > 0 ? view : null);
    // end the gesture once on arrival (full redraw + tiles); otherwise keep it open
    const arriving = view.phase === "hold" && (lastPhase === "fly" || key !== lastKey);
    app.setCamera(view, !arriving);
    lastKey = key; lastPhase = view.phase;
    overlay();
  }
  function overlay() {
    drawUnits(curT);
    drawHighlights(curT);
    drawCaption(curT);
  }
  app.onRedraw(() => { gHl && overlay(); });

  renderAt(0);

  window.__narr = {
    duration,
    cues: cues.map(c => ({ t: +c.time.toFixed(2), at: c.at })),
    renderAt,
    settle(t) { const { view } = camera(t); app.setCamera(view, false); overlay(); },
    pending: () => app.tilesPending() + app.iconsPending() + (app.dustReady() ? 0 : 1),
    audio: base + take.audio,
  };
  if (RENDER) return;

  // ---------- live player ----------
  const audio = new Audio(base + take.audio);
  audio.preload = "auto";
  const ui = document.getElementById("narr-ui");
  const fill = document.getElementById("narr-bar-fill");
  const bar = document.getElementById("narr-bar");
  let raf = 0;
  const loop = () => {
    renderAt(audio.currentTime);
    fill.style.width = (100 * audio.currentTime / duration) + "%";
    if (!audio.paused) raf = requestAnimationFrame(loop);
  };
  const play = () => { ui.classList.add("hidden"); audio.play(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); };
  const pause = () => { audio.pause(); ui.classList.remove("hidden"); ui.querySelector("span").textContent = "paused · tap to resume"; window.__narr.settle(audio.currentTime); };
  layer.addEventListener("click", (e) => {
    if (e.target.closest("#narr-bar")) return;
    audio.paused ? play() : pause();
  });
  bar.addEventListener("click", (e) => {
    const f = (e.clientX - bar.getBoundingClientRect().left) / bar.getBoundingClientRect().width;
    audio.currentTime = f * duration;
    renderAt(audio.currentTime);
    fill.style.width = (100 * f) + "%";
    if (audio.paused) window.__narr.settle(audio.currentTime);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === " ") { e.preventDefault(); audio.paused ? play() : pause(); }
    else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault(); e.stopImmediatePropagation();
      audio.currentTime = Math.max(0, audio.currentTime + (e.key === "ArrowRight" ? 5 : -5));
      renderAt(audio.currentTime);
      if (audio.paused) window.__narr.settle(audio.currentTime);
    }
  }, true);
  audio.addEventListener("ended", () => { ui.classList.remove("hidden"); ui.querySelector("span").textContent = "the end · tap to replay"; });
}

const NARR_CSS = `
#narr-layer { position: fixed; inset: 0; z-index: 10001; pointer-events: auto; overflow: hidden;
  width: var(--app-w, 100vw); height: var(--app-h, 100vh); }
body.narrating #search-btn, body.narrating #search-box, body.narrating #settings-btn,
body.narrating #axes-toggle, body.narrating #minimap, body.narrating #scale-bar,
body.narrating .keyhint, body.narrating #key-hint, body.narrating #click-targets { display: none !important; }
#narr-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
#narr-svg text { font-family: Inter, system-ui, sans-serif; paint-order: stroke; stroke: rgba(0,0,0,0.85); stroke-width: 3px; stroke-linejoin: round; }
.narr-tag { font-size: 11.5px; font-weight: 700; letter-spacing: 0.08em; }
.narr-linelabel { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; }
.narr-axislabel { font-family: "Barlow Condensed", Inter, sans-serif !important; font-size: 22px; font-weight: 700; letter-spacing: 0.12em; }
.narr-sidelabel { font-size: 15px; font-weight: 800; letter-spacing: 0.22em; }
.narr-axis { stroke: rgba(255,255,255,0.45); stroke-width: 1; }
.narr-tick { stroke: rgba(255,255,255,0.9); stroke-width: 1.2; }
.narr-unit { fill: rgba(255,255,255,0.92); font-size: 9.5px; font-weight: 600; }
.narr-axname { fill: rgba(255,255,255,0.6); font-size: 9px; font-weight: 800; letter-spacing: 0.2em; }
@font-face { font-family: "Barlow Condensed"; font-weight: 700; font-display: block;
  src: url("/fonts/barlow-condensed-700-latin.woff2") format("woff2"); }
#narr-caption { position: absolute; left: 6%; right: 6%; bottom: 8.5%; text-align: center; pointer-events: none;
  font: 700 38px/1.02 "Barlow Condensed", "DIN Condensed", "Arial Narrow", sans-serif; text-transform: uppercase;
  letter-spacing: 0.01em; color: #fff;
  -webkit-text-stroke: 6px #000; paint-order: stroke fill;
  text-shadow: 0 4px 12px rgba(0,0,0,0.6); }
#narr-caption span { color: #fff; }
#narr-caption span.now { color: #ffd54f; }
#narr-ui { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 18px; background: rgba(0,0,0,0.35); color: #fff; font-family: Inter, system-ui, sans-serif; }
#narr-ui.hidden { display: none; }
#narr-play { width: 84px; height: 84px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.12); color: #fff; font-size: 34px; padding-left: 8px; cursor: pointer; }
#narr-title { text-align: center; font-weight: 800; letter-spacing: 0.06em; font-size: 17px; }
#narr-title span { display: block; font-weight: 500; letter-spacing: 0.02em; font-size: 13px; opacity: 0.75; margin-top: 6px; }
#narr-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 14px; cursor: pointer; }
#narr-bar-fill { position: absolute; left: 0; bottom: 0; height: 3px; width: 0; background: rgba(255,255,255,0.75); }
`;
