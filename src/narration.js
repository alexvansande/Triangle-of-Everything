// =============================================================
// Narration player — ?narrate=<take>
// =============================================================
// Plays a recorded narration (public/narration/<take>/) over the map and
// drives everything from a phrase-anchored scene script
// (src/narration-scenes/<take>.js): camera moves, highlights, the unit rulers,
// karaoke captions, and the cross-fade from the classic Lineweaver–Patel
// figure. Cues are anchored to WORDS, not timestamps: a new recording only
// needs its own words.json (word timings) and every cue lands on the same
// phrase again.
//
// Everything on screen is a pure function of the audio time t (renderAt),
// so the live player can seek freely and scripts/narration-render.mjs can
// render a frame-exact video by stepping t.
//
//   ?narrate=short-01-hook      live player (tap to start, tap to pause)
//   &render=1                   no player UI; exposes window.__narr for the renderer
//   &autoplay=0                 don't start on load or roll on to the next short
//   &speed=1.2                  playback speed (1–1.5 of the pace it was spoken at, pitch kept;
//                               default: the take's "tempo"); also on the pause screen, or [ and ]
//   &captions=0                 no captions
//   &stage=landscape|none       recording stage (default: 9:16 phone)

import * as d3 from "d3";
import {
  HUBBLE_LOG_R, PLANCK_LOG_R, PLANCK_LOG_M, schwarzschildM, comptonM,
  densityLineM, DENSITY_SPHERE_C, SCHWARZSCHILD_C, COMPTON_C,
  RADIUS_UNITS, MASS_UNITS, REFERENCE_LINES,
} from "./data.js";
import { narrClassic, classicFrameClient, classicAxisNumbers } from "./classic.js";
// Scene scripts, one per file in ./narration-scenes/ (lazy chunks)
const SCENES = import.meta.glob("./narration-scenes/*.js");
let SCENE;

let params, RENDER, CAPTIONS;
// The running player, so the next take can replace it in place (autoplay)
let current = null;
// The size ruler hugs the bottom edge (y as a fraction of the stage height):
// out of the middle of the picture. Captions sit just above it.
const RULER_Y = 0.955;
const AXIS_GLOW = "#ffc531";   // axis highlights: glow under the tick numbers

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
  // the galaxies' line without their dark matter: ten times less dense
  luminous:      { pts: densitySegment(-25), color: "#80deea" },
  mainsequence:  { pts: REFERENCE_LINES.find(l => l.label === "Main Sequence").points.map(p => [p.logR, p.logM]), color: "#ffd740" },
  chandrasekhar: { pts: REFERENCE_LINES.find(l => l.label.startsWith("Chandrasekhar")).points.map(p => [p.logR, p.logM]), color: "#90caf9" },
  tov:           { pts: REFERENCE_LINES.find(l => l.label.startsWith("TOV")).points.map(p => [p.logR, p.logM]), color: "#ff8a80" },
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
  // Sound cues (scripts/narration-sound.mjs): the span of the phrase they
  // name (s → e), or up to the phrase in `to` (or the end) for music. Each
  // takes the phrase's first occurrence, so their order doesn't matter.
  cues.sound = [];
  for (const c of SCENE.sound || []) {
    const alts = Array.isArray(c.at) ? c.at : [c.at];
    let hit = null;
    for (const a of alts) { hit = find(a, 0); if (hit) break; }
    if (!hit) { missing.push(alts[0]); continue; }
    let e = hit.e;
    if (c.to) {
      const end = find(c.to, hit.s);
      if (!end) { missing.push(c.to); continue; }
      e = c.toEnd ? end.e : end.s;
    } else if (c.music) e = words[words.length - 1][2];
    cues.sound.push({ ...c, s: +hit.s.toFixed(3), e: +e.toFixed(3) });
  }
  if (missing.length) window.__narrMissing = missing;
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
  current?.destroy(); current = null;
  const ac = new AbortController(), on = { signal: ac.signal };
  params = app.params;
  RENDER = params.has("render");
  CAPTIONS = params.get("captions") !== "0";
  const base = `${import.meta.env.BASE_URL}narration/${app.take}/`;
  const take = await fetch(base + "words.json").then(r => r.json());
  SCENE = (await SCENES[`./narration-scenes/${take.scene || app.take}.js`]()).default;
  const cues = resolveScene(take.words);
  const captions = CAPTIONS ? buildCaptions(take.words) : [];
  // The video runs on for the end credits (scene `credits`, default 3 s) after
  // the last word; the mix (narration-sound.mjs) carries the music under them.
  const speechEnd = take.duration;
  const CREDITS = take.credits ?? SCENE.credits ?? 3;
  const duration = speechEnd + CREDITS;

  const stage = params.get("stage") || "portrait";
  if (stage !== "none" && (RENDER || !app.isMobile())) app.setStage(stage);
  app.prepare();
  // the paths' moving dots: as big as the catalogue dust (1.15 px), brighter
  // than in the app so they still read in a phone video
  app.setDots?.(SCENE.dots ?? { radius: 1.15, opacity: 1.7 });
  app.setBgFadeDeep?.(SCENE.bgFadeDeep ?? false);   // off: the author prefers the background kept on deep zooms
  // a scene that tells the primordial black hole window itself hides the map's
  // ready-made one, so no label shows before it's been talked about
  app.setPbhWindow?.(SCENE.pbhWindow !== false);

  const objects = new Map(app.objects.map(o => [o.name, o]));
  // { obj: name } also takes a catalogue dot's name (the Eiffel Tower, a statue, a ship)
  const objByName = { get(name) {
    const o = objects.get(name);
    if (o) return o;
    const d = app.dustByName?.(name);
    return d ? { name, logR: d.r, logM: d.m, dust: true } : undefined;
  } };
  const objColor = (o) => app.categories[o.cat]?.color || "#fff";
  const resolveView = (v) => {
    if (v.obj) {
      const o = objByName.get(v.obj);
      if (!o) { console.warn("[narration] unknown object", v.obj); return null; }
      return { r: o.logR + (v.dr || 0), m: o.logM + (v.dm || 0), span: v.span };
    }
    return { r: v.r, m: v.m, span: v.span };
  };

  // a cue that names a catalogue dot needs the catalogue before the camera is planned
  const named = (v) => v && v.obj && !objects.has(v.obj);
  if (cues.some(c => named(c.cam) || (c.hl || []).some(h => named(h) || named(h.from) || named(h.to))))
    await app.loadDust?.();

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

  // ---------- icons: only the objects the scene points at keep their picture ----------
  // (a cue's `icons`: false for none, true for the scene's set, or a list of names,
  // from that cue on; the scene's `icons` replaces the default set)
  const sceneIcons = SCENE.icons ?? [...new Set(cues.flatMap(c => (c.hl || []).flatMap(h =>
    [h.obj, h.arrow && h.from?.obj, h.arrow && h.to?.obj].filter(Boolean))))];
  const iconCues = cues.filter(c => c.icons !== undefined);
  let iconsNow;
  function applyIcons(t) {
    let v = true;
    for (const c of iconCues) if (c.time <= t) v = c.icons;
    const names = v === false ? [] : v === true ? sceneIcons : v;
    const key = names.join("|");
    if (key !== iconsNow) { iconsNow = key; app.setIcons?.(names); }
  }

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
  if (!RENDER) layer.classList.add("live");     // the player's own UI (renders have none)
  const track = SCENE.backing && (typeof SCENE.backing === "string" ? SCENE.backing : SCENE.backing.track);
  layer.innerHTML = `<svg id="narr-svg"></svg><div id="narr-photo"><div class="np-imgs"></div><div class="np-cap"></div></div><div id="narr-caption"></div>` + creditsHTML(track) +
    (RENDER ? "" : `<div id="narr-ui"><button id="narr-play" aria-label="Play">▶</button>
      <div id="narr-title">${SCENE.title || "The Triangle of Everything"}<span>${SCENE.title ? "the triangle of everything" : "narrated tour"} · tap to play</span></div>
      <a id="narr-next" href="#" hidden></a>
      <div id="narr-speed" role="group" aria-label="Speed">${SPEEDS.map(v =>
        `<button type="button" data-speed="${v}">${v}×</button>`).join("")}</div>
      <div id="narr-chips"><button id="narr-auto" class="narr-chip" type="button" aria-pressed="true"></button>
      <button id="narr-sound" class="narr-chip" type="button" aria-pressed="true" hidden></button></div></div>
      <div id="narr-bar" role="slider" aria-label="Seek" tabindex="0"><div id="narr-track"><div id="narr-bar-fill"></div><div id="narr-knob"></div></div><span id="narr-time"></span></div>`);
  document.body.appendChild(layer);
  if (!document.getElementById("narr-css")) {
    const style = document.createElement("style");
    style.id = "narr-css";
    style.textContent = NARR_CSS;
    document.head.appendChild(style);
  }
  await document.fonts.load('700 38px "Barlow Condensed"').catch(() => {});
  const nsvg = d3.select("#narr-svg");
  const gUnits = nsvg.append("g").attr("class", "narr-units");
  const hlClip = nsvg.append("clipPath").attr("id", "narr-hl-clip").append("rect");
  const gHl = nsvg.append("g").attr("class", "narr-hl");
  const gHlFree = nsvg.append("g").attr("class", "narr-hl-free"); // axis bands: never clipped
  const capEl = document.getElementById("narr-caption");

  // ---------- photo cutaways ----------
  // { at, photo: "m87" | ["hyperion", "vesta", …], caption: "what · who · when", labels?: […],
  //   obj?: dot it grows from, dur?: s (6), fit?: "cover" | "contain", kb?: [scale from, to],
  //   focus?: [x, y] (0–1 in the image, where the Ken Burns push heads),
  //   place?: true | width (fraction of the screen, default 0.78) }
  // Full screen (default): a black disc grows out of the object's dot until it fills the
  // frame, with the real photo inside; the photo pushes in slowly under its caption, then
  // shrinks back into the dot. `place`: the photo opens as a soft-edged round window on
  // the chart itself, over the dot, with the chart still around it (nebulae, galaxies).
  // Files: public/narration/photos/<name>.jpg (credits in video/photos/CREDITS.md).
  const PHOTO_IN = 0.9, PHOTO_OUT = 0.8;
  const photoUrl = (n) => `${import.meta.env.BASE_URL}narration/photos/${n}.jpg`;
  const photos = cues.filter(c => c.photo).map(c => ({ ...c, names: [].concat(c.photo),
    t0: c.time, t1: c.time + (c.dur ?? 6) }));
  const photoImgs = new Map();
  for (const p of photos) for (const n of p.names) if (!photoImgs.has(n)) {
    const im = new Image(); im.decoding = "sync"; im.src = photoUrl(n); photoImgs.set(n, im);
  }
  const photoEl = document.getElementById("narr-photo");
  const photoBox = photoEl.querySelector(".np-imgs"), photoCap = photoEl.querySelector(".np-cap");
  let photoShown = null;
  function drawPhoto(t) {
    const p = photos.find(q => t >= q.t0 && t < q.t1 + PHOTO_OUT);
    const reveal = p ? smooth((t - p.t0) / PHOTO_IN) * (1 - smooth((t - p.t1) / PHOTO_OUT)) : 0;
    if (reveal <= 0.001) { photoEl.style.visibility = "hidden"; return; }
    const SW = layer.clientWidth, SH = layer.clientHeight;
    if (photoShown !== p) {
      photoShown = p;
      photoBox.className = "np-imgs" + (p.names.length > 1 ? " np-stack" : "");
      photoBox.innerHTML = p.names.map((n, i) => `<figure><img src="${photoUrl(n)}" alt="">` +
        (p.labels?.[i] ? `<figcaption>${p.labels[i]}</figcaption>` : "") + `</figure>`).join("");
      photoBox.querySelectorAll("img").forEach(im => { im.style.objectFit = p.fit || (p.names.length > 1 ? "contain" : "cover"); });
      const [what, ...rest] = (p.caption || "").split(" · ");
      photoCap.innerHTML = p.caption ? `<b>${what}</b>${rest.join(" · ")}` : "";
    }
    // grow from the object's dot (or the middle), on the camera as it is now
    let cx = SW / 2, cy = SH / 2;
    const o = p.obj && objByName.get(p.obj);
    if (o) { cx = Math.min(SW, Math.max(0, sx(o.logR))); cy = Math.min(SH, Math.max(0, sy(o.logM))); }
    photoEl.style.visibility = "visible";
    if (p.place) {
      // a round window on the chart: centred on the dot, pulled towards the middle so it fits
      const R = SW * (p.place === true ? 0.78 : p.place) / 2 * reveal ** 0.8;
      const wx = Math.min(SW - R - 4, Math.max(R + 4, cx)), wy = Math.min(SH * 0.78 - R, Math.max(SH * 0.16 + R, cy));
      const qx = cx + (wx - cx) * reveal, qy = cy + (wy - cy) * reveal;
      photoEl.style.background = "transparent";
      photoEl.style.clipPath = "none";
      const m = `radial-gradient(circle ${R.toFixed(1)}px at ${qx.toFixed(1)}px ${qy.toFixed(1)}px, #000 82%, transparent 100%)`;
      photoEl.style.maskImage = photoEl.style.webkitMaskImage = m;
      Object.assign(photoBox.style, { left: `${(qx - R).toFixed(1)}px`, top: `${(qy - R).toFixed(1)}px`,
        width: `${(2 * R).toFixed(1)}px`, height: `${(2 * R).toFixed(1)}px`, right: "auto", bottom: "auto" });
    } else {
      const far = Math.hypot(Math.max(cx, SW - cx), Math.max(cy, SH - cy));
      photoEl.style.background = "";
      photoEl.style.maskImage = photoEl.style.webkitMaskImage = "none";
      Object.assign(photoBox.style, { left: "0", top: "0", width: "100%", height: "100%" });
      photoEl.style.clipPath = `circle(${(12 + (far - 12) * reveal ** 1.4).toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
    }
    // Ken Burns: a slow push towards the focus point over the whole cutaway
    const [k0, k1] = p.kb || [1, 1.12], [fx, fy] = p.focus || [0.5, 0.5];
    const k = clamp01((t - p.t0) / (p.t1 + PHOTO_OUT - p.t0));
    const sc = k0 + (k1 - k0) * (0.5 - Math.cos(Math.PI * k) / 2);
    photoBox.style.transformOrigin = `${(fx * 100).toFixed(2)}% ${(fy * 100).toFixed(2)}%`;
    photoBox.style.transform = `scale(${sc.toFixed(4)})`;
    photoCap.style.opacity = (smooth((t - p.t0 - PHOTO_IN * 0.6) / 0.5) * (1 - smooth((t - p.t1 + 0.3) / 0.4))).toFixed(3);
  }

  let curT = 0;
  const sx = (r) => app.plot().x + app.px(r);
  const sy = (m) => app.plot().y + app.py(m);

  function drawHighlights(t) {
    applyIcons(t);
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
    const axisHls = live.filter(h => h.axis);
    join(gHlFree, axisHls).each(function (h) {
      const el = d3.select(this);
      el.selectAll("*").remove();
      const age = t - h.t0;
      el.attr("opacity", smooth(age / 0.45) * (1 - smooth((t - h.t1) / 0.5)));
      drawAxis(el, h, age, fr);
    });
    swellAxisNumbers(fr ? axisHls : [], t);
    join(gHl, live.filter(h => !h.axis)).each(function (h) {
      const el = d3.select(this);
      el.selectAll("*").remove();
      const age = t - h.t0;
      const op = smooth(age / 0.45) * (1 - smooth((t - h.t1) / 0.5));
      el.attr("opacity", op);
      if (h.obj) drawObj(el, h, age);
      else if (h.line) drawLine(el, LINES[h.line], h, age);
      else if (h.density != null) drawLine(el, { pts: densitySegment(h.density), color: "#ffab40" }, h, age);
      else if (h.side) drawSide(el, h);
      else if (h.arrow) drawArrow(el, h, age);
      else if (h.swing) drawSwing(el, h, age);
      else if (h.split) drawSplit(el, h, age);
      else if (h.dust) drawDustCat(el, h, age);
      else if (h.ellipse) drawEllipse(el, h, age);
      else if (h.window) drawWindow(el, h, age);
      else if (h.cross) drawCross(el, h, age);
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
    const col = h.color || AXIS_GLOW;
    const grow = d3.easeCubicOut(clamp01(age / 0.7));
    const vert = side === "left" || side === "right";
    // On the map there are no tick numbers to swell: a soft glow runs along
    // that edge instead, growing from the middle outwards.
    if (!frClient) {
      const gr = vert ? { x: r.x, y: r.y + r.h * (1 - grow) / 2, w: r.w, h: r.h * grow }
        : { x: r.x + r.w * (1 - grow) / 2, y: r.y, w: r.w * grow, h: r.h };
      el.append("rect").attr("x", gr.x).attr("y", gr.y).attr("width", gr.w).attr("height", gr.h)
        .attr("rx", T / 2).attr("fill", col).attr("opacity", 0.35).attr("filter", "url(#narr-soft)");
    }
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
  /** Over the classic figure, an axis highlight acts on the figure's own tick
   *  numbers: they swell one after another along the axis (a wave of about a
   *  second), then stay a little larger, each over a blurred yellow disk. */
  function swellAxisNumbers(hls, t) {
    const ax = classicAxisNumbers();
    if (!ax) return;
    const fx = new Map();               // number → { s: extra scale, g: glow }
    for (const h of hls) {
      const age = t - h.t0, fade = smooth(age / 0.3) * (1 - smooth((t - h.t1) / 0.5));
      const nums = ax.nums.filter(n => n.getAttribute("data-side") === h.axis);
      const vert = h.axis === "left" || h.axis === "right";
      // the wave runs up a vertical axis, left to right along a horizontal one
      nums.sort((a, b) => vert ? +b.getAttribute("y") - +a.getAttribute("y") : +a.getAttribute("x") - +b.getAttribute("x"));
      nums.forEach((n, i) => {
        const u = age - 0.9 * i / Math.max(1, nums.length - 1);
        const bump = Math.sin(Math.PI * clamp01(u / 0.45));
        const s = (0.3 * smooth(u / 0.3) + 0.4 * bump) * fade;
        const g = (0.55 * smooth(u / 0.3) + 0.45 * bump) * fade;
        const prev = fx.get(n);
        if (!prev || prev.s < s) fx.set(n, { s, g });
      });
    }
    // An SVG transform attribute, not CSS: Safari mis-places CSS transforms
    // on SVG text (the numbers drifted off or vanished there).
    const disks = [];
    for (const n of ax.nums) {
      const e = fx.get(n);
      if (!e || e.s < 0.001) { n.removeAttribute("transform"); continue; }
      const b = n.getBBox(), k = 1 + e.s, side = n.getAttribute("data-side");
      // grow away from the axis line, so the ticks stay clear
      const ox = side === "left" ? b.x + b.width : side === "right" ? b.x : b.x + b.width / 2;
      const oy = side === "top" ? b.y + b.height : side === "bottom" ? b.y : b.y + b.height / 2;
      n.setAttribute("transform", `translate(${ox} ${oy}) scale(${k}) translate(${-ox} ${-oy})`);
      if (e.g > 0.005) disks.push({ x: ox + (b.x + b.width / 2 - ox) * k, y: oy + (b.y + b.height / 2 - oy) * k,
        r: Math.max(b.width, b.height) * 0.62 * k, g: e.g });
    }
    ax.glow.selectAll("circle").data(disks).join("circle")
      .attr("cx", d => d.x).attr("cy", d => d.y).attr("r", d => d.r)
      .attr("fill", AXIS_GLOW).attr("opacity", d => 0.75 * d.g).attr("filter", "url(#cl-glow-blur)");
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
      // "\n" stacks the label in lines above the line
      const lines = h.label.toUpperCase().split("\n");
      const t = el.append("text").attr("class", "narr-linelabel")
        .attr("transform", `translate(${mid[0]},${mid[1]}) rotate(${a2}) translate(0,${-10 - 13 * (lines.length - 1)})`)
        .attr("text-anchor", "middle").attr("fill", col).attr("opacity", prog);
      lines.forEach((ln, i) => t.append("tspan").attr("x", 0).attr("dy", i ? "1.2em" : 0).text(ln));
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
  /** Every catalogue dot of one category ({ dust: "blackhole", label? }), or of
   *  some sources ({ dust: "galaxy", src: ["galaxy", "cluster"] }): a small ring
   *  on each, lit in a sweep from the lightest to the heaviest. shift: { source:
   *  decades } then slides each dot down (or up) in mass, after shiftAt seconds
   *  over shiftDur, leaving a faint ghost where it was: "take the dark matter
   *  away". */
  function drawDustCat(el, h, age) {
    const pts = h.src ? app.dustOfSrc?.(h.src) : app.dustOfCat?.(h.dust);
    // (ticks?, len?, w?: black holes default to ticks beside the line)
    if (!pts?.length) return;
    // as solid as the Schwarzschild line and a little wider than it
    const col = h.color || (h.dust === "blackhole" ? LINES.schwarzschild.color : app.categories[h.dust]?.color) || "#fff";
    const plot = app.plot();
    const lo = d3.min(pts, p => p[1]), hi = d3.max(pts, p => p[1]);
    const sweep = h.sweep ?? 1.6;
    // black holes sit exactly on the Schwarzschild line, where dots vanish into it:
    // they become ticks just beyond the line instead, like a rug plot
    const ticks = h.ticks ?? h.dust === "blackhole";
    const ax = sx(1) - sx(0), ay = sy(1) - sy(0), al = Math.hypot(ax, ay) || 1;
    const nx = ay / al, ny = -ax / al;                 // across the line, away from the triangle
    const sh = h.shift ? smooth((age - (h.shiftAt ?? 1.2)) / (h.shiftDur ?? 1.8)) : 0;
    for (const [r, m, id] of pts) {
      const dm = h.shift ? (h.shift[id] ?? h.shift.all ?? 0) * sh : 0;
      if (dm) {
        const gx = sx(r), gy = sy(m);
        el.append("circle").attr("cx", gx).attr("cy", gy).attr("r", h.r ?? 2.6).attr("fill", "none")
          .attr("stroke", h.color || app.categories[h.dust]?.color || "#fff").attr("stroke-width", 0.8).attr("opacity", 0.35 * sh);
      }
      const x = sx(r), y = sy(m + dm);
      if (x < plot.x - 10 || x > plot.x + plot.w + 10 || y < plot.y - 10 || y > plot.y + plot.h + 10) continue;
      const a = clamp01((age - sweep * (m - lo) / Math.max(1e-6, hi - lo)) / 0.35);
      if (a <= 0) continue;
      if (ticks) {
        const g0 = 4, len = (h.len ?? 11) * (0.4 + 0.6 * a);
        el.append("line").attr("x1", x + nx * g0).attr("y1", y + ny * g0)
          .attr("x2", x + nx * (g0 + len)).attr("y2", y + ny * (g0 + len))
          .attr("stroke", col).attr("stroke-width", h.w ?? 2).attr("stroke-linecap", "round").attr("opacity", a);
      } else {
        el.append("circle").attr("cx", x).attr("cy", y).attr("r", (h.r ?? 2.6) + 3 * (1 - a)).attr("fill", col).attr("opacity", a);
      }
    }
    if (h.label) el.append("text").attr("class", "narr-sidelabel")
      .attr("x", plot.x + plot.w * (h.labelX ?? 0.5)).attr("y", plot.y + plot.h * (h.labelY ?? 0.2))
      .attr("text-anchor", "middle").attr("fill", col).attr("opacity", clamp01(age / 0.6)).text(h.label.toUpperCase());
  }
  /** A point read off both axes: { cross: { r, m }, mass: "label", size: "label",
   *  color? } — a dot, with dashed guides out to the left edge (labelled with the
   *  mass) and down to the size ruler (labelled with the size), drawn out from the
   *  dot. */
  function drawCross(el, h, age) {
    const SH = layer.clientHeight;
    const x = sx(h.cross.r), y = sy(h.cross.m), col = h.color || "#ffd54f";
    const k = d3.easeCubicOut(clamp01(age / 0.9));
    const xR = massAxisX(layer.clientWidth), yB = SH * (SCENE.rulerY ?? RULER_Y) - 8;
    const guide = (x1, y1, x2, y2) => el.append("line").attr("x1", x1).attr("y1", y1)
      .attr("x2", x1 + (x2 - x1) * k).attr("y2", y1 + (y2 - y1) * k)
      .attr("stroke", col).attr("stroke-width", 1.4).attr("stroke-dasharray", "5 4").attr("opacity", 0.9);
    guide(x, y, xR, y);                                  // mass is read on the right-hand ruler
    guide(x, y, x, yB);
    el.append("circle").attr("cx", x).attr("cy", y).attr("r", 5).attr("fill", col);
    el.append("circle").attr("cx", x).attr("cy", y).attr("r", 9 + 3 * (1 - k)).attr("fill", "none")
      .attr("stroke", col).attr("stroke-width", 1.2).attr("opacity", 0.7);
    const a = clamp01((age - 0.6) / 0.4);
    if (h.mass) el.append("text").attr("class", "narr-sidelabel").attr("x", xR - 2).attr("y", y - 8)
      .attr("text-anchor", "end").attr("fill", col).attr("opacity", a).text(h.mass.toUpperCase());
    // the size label rides up the guide, clear of the captions
    if (h.size) el.append("text").attr("class", "narr-sidelabel").attr("x", x + 8).attr("y", Math.min(yB - 6, SH * 0.72))
      .attr("text-anchor", "start").attr("fill", col).attr("opacity", a).text(h.size.toUpperCase());
  }
  /** Masses still allowed along the Schwarzschild line, and what rules out the
   *  rest: { window: [lo, hi], from?: [lo, hi], label?, cuts: [{ m: [lo, hi],
   *  label?, dash? }] } — log10 grams. The red band slides from `from` to
   *  `window` (over `dur`, 1.2 s) as the newly named cut grows in; each cut is a
   *  grey band beside the line, in a lane of its own where it overlaps an earlier
   *  one, with ticks back to the line at its limits; a cut with a label is the new
   *  one and gets a horizontal label out in the forbidden corner. `trace: [lo, hi]`
   *  keeps a faint line along the first window. */
  function drawWindow(el, h, age) {
    const at = (m) => [sx(m - 27.83), sy(m)];           // on the Schwarzschild line
    const ax = sx(1) - sx(0), ay = sy(1) - sy(0), al = Math.hypot(ax, ay) || 1;
    const nx = ay / al, ny = -ax / al;                   // across the line, away from the triangle
    const off = (p, d) => [p[0] + nx * d, p[1] + ny * d];
    const seg = (lo, hi, d) => { const a = off(at(lo), d), b = off(at(hi), d); return `M${a}L${b}`; };
    // a horizontal label out in the forbidden corner, kept on screen, with a
    // leader back to the band
    const SW = layer.clientWidth;
    const sideLabel = (mid, lab, text, fill, stroke, op) => {
      const t = el.append("text").attr("class", "narr-sidelabel").attr("y", lab[1] + 4)
        .attr("text-anchor", "middle").attr("fill", fill).attr("opacity", op).text(text.toUpperCase());
      let w = t.node().getComputedTextLength?.() || text.length * 8;
      // two lines where the label says so ("\n"), or when it's too wide for the screen
      const lines = text.includes("\n") ? text.toUpperCase().split("\n")
        : w > SW - 24 ? (() => { const ws = text.toUpperCase().split(" "), k = Math.ceil(ws.length / 2);
            return [ws.slice(0, k).join(" "), ws.slice(k).join(" ")]; })() : null;
      if (lines) {
        t.text(null).attr("y", lab[1] - 4);
        lines.forEach((ln, i) => t.append("tspan").attr("dy", i ? "1.25em" : 0).text(ln));
        t.selectAll("tspan").attr("x", 0);
        w = Math.max(...t.selectAll("tspan").nodes().map(n => n.getComputedTextLength?.() || 0)) || w / 2;
      }
      const x = Math.max(12 + w / 2, Math.min(SW - 12 - w / 2, lab[0] - w / 2));
      t.attr("x", x); t.selectAll("tspan").attr("x", x);
      const ex = Math.max(x - w / 2, Math.min(x + w / 2, mid[0]));
      el.insert("line", "text").attr("x1", mid[0]).attr("y1", mid[1]).attr("x2", ex).attr("y2", lab[1] - 6)
        .attr("stroke", stroke).attr("stroke-width", 1).attr("opacity", op);
    };
    // each survey keeps its own range, in its own lane beside the line where it
    // overlaps one drawn before it (lanes given in the order the cuts are listed)
    const lanes = [];
    const laneOf = (c) => {
      let i = 0;
      while (lanes[i]?.some(([lo, hi]) => c.m[0] < hi && lo < c.m[1])) i++;
      (lanes[i] ||= []).push(c.m); return i;
    };
    const grow = smooth(age / (h.dur ?? 1.2));
    if (h.trace) el.append("path").attr("d", seg(h.trace[0], h.trace[1], 7)).attr("stroke", h.color || "#ff5c7a")
      .attr("stroke-width", 2).attr("stroke-linecap", "round").attr("opacity", 0.35);
    for (const c of h.cuts || []) {
      const d = 14 + 7 * laneOf(c), col = c.color || "#b0b4c8";
      // the newly named one (with a label) grows out from its middle
      const g = c.label ? grow : 1, mid0 = (c.m[0] + c.m[1]) / 2;
      const lo = mid0 + (c.m[0] - mid0) * g, hi = mid0 + (c.m[1] - mid0) * g;
      el.append("path").attr("d", seg(lo, hi, d)).attr("stroke", col)
        .attr("stroke-width", 4).attr("stroke-linecap", "butt").attr("opacity", 0.8)
        .attr("stroke-dasharray", c.dash ? "5 4" : null);
      if (g === 1) for (const m of c.m) {                // end ticks, back to the line: the limit
        const a = off(at(m), 3), b = off(at(m), d + 4);
        el.append("line").attr("x1", a[0]).attr("y1", a[1]).attr("x2", b[0]).attr("y2", b[1])
          .attr("stroke", col).attr("stroke-width", 1.2).attr("opacity", 0.8);
      }
      if (c.label) {
        const mid = off(at(mid0), d + 2), lab = off(mid, c.dist ?? 46);
        sideLabel(mid, lab, c.label, "#e8eaf6", "#d0d4e8", clamp01(age / 0.5));
      }
    }
    const k = h.from ? smooth(age / (h.dur ?? 1.2)) : 1;
    const lo = h.from ? h.from[0] + (h.window[0] - h.from[0]) * k : h.window[0];
    const hi = h.from ? h.from[1] + (h.window[1] - h.from[1]) * k : h.window[1];
    const col = h.color || "#ff5c7a";
    [[12, 0.2], [6, 1]].forEach(([w, o]) => el.append("path").attr("d", seg(lo, hi, 7)).attr("stroke", col)
      .attr("stroke-width", w).attr("stroke-linecap", "round").attr("opacity", o));
    if (h.label) {
      const mid = off(at((lo + hi) / 2), 9), lab = off(mid, h.dist ?? 46);
      sideLabel(mid, lab, h.label, col, col, 1);
    }
  }
  /** A loop drawn round a cloud of dots: { ellipse: [r, m, rx, ry], rot?, label?,
   *  place?: "above"|"below"|"left"|"right" } — centre and half-axes in decades
   *  (log cm, log g). It leans with the 3 : 1 density diagonals unless rot
   *  (screen degrees) says otherwise. */
  function drawEllipse(el, h, age) {
    const [r, m, rx, ry] = h.ellipse;
    const cx = sx(r), cy = sy(m);
    const kx = Math.abs(sx(r + 1) - sx(r)), ky = Math.abs(sy(m + 1) - sy(m));
    const RX = rx * kx, RY = ry * ky;
    const col = h.color || "#ffd54f";
    const prog = d3.easeCubicOut(clamp01(age / (h.draw ?? 0.9)));
    const len = Math.PI * (3 * (RX + RY) - Math.sqrt((3 * RX + RY) * (RX + 3 * RY)));
    // by default the tall axis leans with the 3 : 1 density diagonals (log M = 3 log R + c)
    const rot = h.rot ?? 90 - Math.atan2(3 * ky, kx) * 180 / Math.PI;
    const g = el.append("g").attr("transform", `translate(${cx},${cy}) rotate(${rot})`);
    // drawn as a path from the top, clockwise, so the stroke grows from 12 o'clock
    const d = `M0,${-RY}A${RX},${RY} 0 1,1 0,${RY}A${RX},${RY} 0 1,1 0,${-RY}`;
    [[7, 0.15], [2.2, 1]].forEach(([w, o]) => g.append("path").attr("d", d)
      .attr("fill", "none").attr("stroke", col).attr("stroke-width", w).attr("opacity", o)
      .attr("stroke-dasharray", `${len * prog} ${len + 10}`));
    if (h.label === false) return;
    const place = h.place || "above";
    const tx = place === "left" ? cx - RX - 8 : place === "right" ? cx + RX + 8 : cx;
    const ty = place === "below" ? cy + RY + 22 : place === "above" ? cy - RY - 10 : cy + 5;
    el.append("text").attr("class", "narr-tag").attr("x", tx).attr("y", ty)
      .attr("text-anchor", place === "left" ? "end" : place === "right" ? "start" : "middle")
      .attr("fill", col).attr("opacity", prog).text((h.label || "").toUpperCase());
  }
  /** A star living its life: a glowing disk that swings back and forth between
   *  two points (swing: [from, to], each { obj } or { r, m }), each swing a
   *  little further and slower, swelling and reddening toward `to` and shrinking
   *  back as it falls. period (s, default 2.4) is the first swing's length. */
  function drawSwing(el, h, age) {
    const pt = (q) => { const o = q.obj && objByName.get(q.obj); return o ? [o.logR, o.logM] : [q.r, q.m]; };
    const [A, B] = h.swing.map(pt);
    const [x1, y1, x2, y2] = [sx(A[0]), sy(A[1]), sx(B[0]), sy(B[1])];
    const fade = smooth(age / 0.6);
    el.append("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2)   // the track
      .attr("stroke", "#ffd54f").attr("stroke-width", 1.4).attr("stroke-dasharray", "3 5").attr("opacity", 0.45 * fade);
    // phase: swings stretch out over time (the period grows ~6% a swing)
    const P0 = h.period ?? 2.4, g = 0.06;
    const n = Math.log1p(g * age / P0) / Math.log1p(g);                 // swings so far (fractional)
    const u = (0.5 - 0.5 * Math.cos(2 * Math.PI * n)) * Math.min(1, 0.45 + 0.12 * n);  // reach grows to the full track
    const x = x1 + (x2 - x1) * u, y = y1 + (y2 - y1) * u;
    const col = d3.interpolateRgb("#ffe27a", "#ff6a3d")(u);
    if (h.core) {
      // two circles: a small hot core that stays put inside the star, and the outer
      // layers swelling into a red giant and falling back
      const R = (9 + 30 * u) * fade;
      el.append("circle").attr("cx", x).attr("cy", y).attr("r", R * 1.6).attr("fill", col).attr("opacity", 0.14).attr("filter", "url(#narr-soft)");
      el.append("circle").attr("cx", x).attr("cy", y).attr("r", R).attr("fill", col).attr("opacity", 0.32)
        .attr("stroke", col).attr("stroke-width", 2);
      el.append("circle").attr("cx", x).attr("cy", y).attr("r", 4.5 * fade).attr("fill", "#fff7d6");
      if (h.label) el.append("text").attr("class", "narr-tag").attr("x", x).attr("y", y - R - 9)
        .attr("text-anchor", "middle").attr("fill", col).text(h.label.toUpperCase());
      return;
    }
    const R = (8 + 14 * u) * fade;
    el.append("circle").attr("cx", x).attr("cy", y).attr("r", R * 2.2).attr("fill", col).attr("opacity", 0.18).attr("filter", "url(#narr-soft)");
    el.append("circle").attr("cx", x).attr("cy", y).attr("r", R).attr("fill", col).attr("opacity", 0.85);
    el.append("circle").attr("cx", x).attr("cy", y).attr("r", R + 3).attr("fill", "none").attr("stroke", "#fff").attr("stroke-width", 1).attr("opacity", 0.5);
    if (h.label) el.append("text").attr("class", "narr-tag").attr("x", x).attr("y", y - R - 9)
      .attr("text-anchor", "middle").attr("fill", col).text(h.label.toUpperCase());
  }
  /** A dying star splitting in two (split: { from, core, shell }, each { obj } or
   *  { r, m }): the core slides to `core` and shrinks to a hot white dot, the outer
   *  layers drift to `shell`, opening into a fading ring. draw (s, default 2.4);
   *  coreLabel / shellLabel show once they arrive. */
  function drawSplit(el, h, age) {
    const pt = (q) => { const o = q.obj && objByName.get(q.obj); return o ? [o.logR, o.logM] : [q.r, q.m]; };
    const [A, C, S] = [h.split.from, h.split.core, h.split.shell].map(pt).map(([r, m]) => [sx(r), sy(m)]);
    const p = d3.easeCubicInOut(clamp01(age / (h.draw ?? 2.4)));
    const lerp = (P, Q) => [P[0] + (Q[0] - P[0]) * p, P[1] + (Q[1] - P[1]) * p];
    const [sxp, syp] = lerp(A, S), [cxp, cyp] = lerp(A, C);
    // the outer layers: a red disc thinning into a ring
    const Rs = 39 + 36 * p, scol = d3.interpolateRgb("#ff6a3d", "#ff8fb0")(p);
    el.append("circle").attr("cx", sxp).attr("cy", syp).attr("r", Rs).attr("fill", scol).attr("opacity", 0.32 * (1 - p) + 0.06)
      .attr("stroke", scol).attr("stroke-width", 2 + 3 * p).attr("stroke-opacity", 0.9 - 0.3 * p);
    // the core: small, white-hot, a trail behind it
    el.append("line").attr("x1", A[0]).attr("y1", A[1]).attr("x2", cxp).attr("y2", cyp)
      .attr("stroke", "#bfe3ff").attr("stroke-width", 1.4).attr("stroke-dasharray", "3 5").attr("opacity", 0.5);
    el.append("circle").attr("cx", cxp).attr("cy", cyp).attr("r", 10).attr("fill", "#bfe3ff").attr("opacity", 0.25).attr("filter", "url(#narr-soft)");
    el.append("circle").attr("cx", cxp).attr("cy", cyp).attr("r", 4.5 - 1 * p).attr("fill", d3.interpolateRgb("#fff7d6", "#e8f4ff")(p));
    const lab = clamp01((p - 0.8) / 0.2);
    if (h.coreLabel) el.append("text").attr("class", "narr-tag").attr("x", cxp).attr("y", cyp + 24).attr("text-anchor", "middle")
      .attr("fill", "#bfe3ff").attr("opacity", lab).text(h.coreLabel.toUpperCase());
    if (h.shellLabel) el.append("text").attr("class", "narr-tag").attr("x", sxp).attr("y", syp - Rs - 10).attr("text-anchor", "middle")
      .attr("fill", scol).attr("opacity", lab).text(h.shellLabel.toUpperCase());
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
  const massAxisX = (SW) => SW - Math.round(SW * 0.065);
  const W_OFF = Math.log10(2);
  // In-between ticks for the rulers: every decade once there's room for it (10 kg,
  // 100 kg between 1 kg and 1 tonne), and 2–9× inside a decade when zoomed in far
  // enough to see the log lines (20 kg, 30 kg…). The named units go first and win.
  // Prefix bases in log10 of the ruler's unit (grams; centimetres of diameter).
  const MASS_BASES = [[-12, "pg"], [-9, "ng"], [-6, "μg"], [-3, "mg"], [0, "g"], [3, "kg"], [6, "t"], [9, "kt"], [12, "Mt"], [15, "Gt"]];
  const SIZE_BASES = [[-13, "fm"], [-10, "pm"], [-7, "nm"], [-4, "μm"], [-1, "mm"], [0, "cm"], [2, "m"], [5, "km"]];
  const SUP = (n) => String(n).replace(/./g, c => "⁰¹²³⁴⁵⁶⁷⁸⁹⁻"["0123456789-".indexOf(c)]);
  function tickLabel(v, bases) {          // v = log10 of the value in the base unit
    const d = Math.floor(v + 1e-9), k = Math.round(10 ** (v - d));
    let base = bases[0];
    for (const b of bases) if (b[0] <= d) base = b;
    const e = d - base[0];
    if (e > 5) return `${k > 1 ? k + "×" : ""}10${SUP(e)} ${base[1]}`;
    return `${(k * 10 ** e).toLocaleString("en-US")} ${base[1]}`;
  }
  // [{ at, label, minor }] for the visible span lo…hi (log10, base unit) at ppd px per decade
  function fillTicks(lo, hi, ppd, bases) {
    const out = [];
    for (let d = Math.floor(lo); d <= Math.ceil(hi); d++) {
      if (ppd > 70) out.push({ at: d, label: tickLabel(d, bases) });
      const ks = ppd > 520 ? [2, 3, 4, 5, 6, 7, 8, 9] : ppd > 260 ? [2, 3, 5] : ppd > 150 ? [2, 5] : [];
      for (const k of ks) out.push({ at: d + Math.log10(k), label: tickLabel(d + Math.log10(k), bases), minor: true });
    }
    return out.filter(t => t.at >= lo && t.at <= hi);
  }
  function drawUnits(t) {
    const o = unitsOpacity(t);
    gUnits.attr("opacity", o).style("display", o > 0.01 ? null : "none");
    if (o <= 0.01) return;
    gUnits.selectAll("*").remove();
    const SW = layer.clientWidth, SH = layer.clientHeight;
    const yR = Math.round(SH * (SCENE.rulerY ?? RULER_Y)), xR = massAxisX(SW);
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
    // the ruler reads diameter: the label at logR is for 2r
    const rppd = Math.abs(sx(1) - sx(0)), ix = (x) => (x - sx(0)) / (sx(1) - sx(0));
    const rlo = ix(0) + W_OFF, rhi = ix(SW) + W_OFF;
    for (const tk of fillTicks(Math.min(rlo, rhi), Math.max(rlo, rhi), rppd, SIZE_BASES)) {
      const x = sx(tk.at - W_OFF), w = tk.label.length * 5.6 + 10;
      if (x < 6 || x > SW - 6) continue;
      if (placed.some(p => Math.abs(p - x) < w)) continue;
      placed.push(x);
      gUnits.append("line").attr("x1", x).attr("x2", x).attr("y1", yR - (tk.minor ? 3 : 5)).attr("y2", yR + (tk.minor ? 3 : 5)).attr("class", "narr-tick");
      gUnits.append("text").attr("x", x).attr("y", yR + 15).attr("text-anchor", "middle")
        .attr("class", tk.minor ? "narr-unit narr-unit-minor" : "narr-unit").text(tk.label);
    }
    gUnits.append("text").attr("x", SW - 8).attr("y", yR - 7).attr("text-anchor", "end").attr("class", "narr-axname").text("SIZE →");
    // vertical: mass, on the right as in the map (the left is kept for energy and temperature)
    gUnits.append("rect").attr("x", xR - 54).attr("y", 0).attr("width", SW - xR + 54).attr("height", SH).attr("fill", "url(#narr-fade-v)");
    gUnits.append("line").attr("x1", xR).attr("x2", xR).attr("y1", 0).attr("y2", SH).attr("class", "narr-axis");
    const placedY = [];
    for (const u of MASS_UNITS) {
      if (/\/c²|Planck|electron|proton/.test(u.label)) continue;
      const y = sy(u.logM);
      if (y < SH * 0.1 || y > yR - 24) continue;
      if (placedY.some(p => Math.abs(p - y) < 17)) continue;
      placedY.push(y);
      gUnits.append("line").attr("x1", xR - 5).attr("x2", xR + 5).attr("y1", y).attr("y2", y).attr("class", "narr-tick");
      gUnits.append("text").attr("x", xR - 8).attr("y", y + 3.5).attr("text-anchor", "end").attr("class", "narr-unit").text(u.label);
    }
    const mppd = Math.abs(sy(1) - sy(0)), iy = (y) => (y - sy(0)) / (sy(1) - sy(0));
    const mA = iy(SH * 0.1), mB = iy(yR - 24);
    for (const tk of fillTicks(Math.min(mA, mB), Math.max(mA, mB), mppd, MASS_BASES)) {
      const y = sy(tk.at);
      if (y < SH * 0.1 || y > yR - 24) continue;
      if (placedY.some(p => Math.abs(p - y) < 17)) continue;
      placedY.push(y);
      gUnits.append("line").attr("x1", xR - (tk.minor ? 3 : 5)).attr("x2", xR + (tk.minor ? 3 : 5)).attr("y1", y).attr("y2", y).attr("class", "narr-tick");
      gUnits.append("text").attr("x", xR - 8).attr("y", y + 3.5).attr("text-anchor", "end")
        .attr("class", tk.minor ? "narr-unit narr-unit-minor" : "narr-unit").text(tk.label);
    }
    gUnits.append("text").attr("transform", `translate(${xR + 13},${SH * 0.16}) rotate(-90)`).attr("text-anchor", "end")
      .attr("class", "narr-axname").text("MASS →");
  }
  const defs = nsvg.append("defs");
  defs.append("filter").attr("id", "narr-soft").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%")
    .append("feGaussianBlur").attr("stdDeviation", 8);
  const gh = defs.append("linearGradient").attr("id", "narr-fade-h").attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", 1);
  gh.append("stop").attr("offset", 0).attr("stop-color", "#000").attr("stop-opacity", 0);
  gh.append("stop").attr("offset", 0.5).attr("stop-color", "#000").attr("stop-opacity", 0.55);
  gh.append("stop").attr("offset", 1).attr("stop-color", "#000").attr("stop-opacity", 0);
  const gv = defs.append("linearGradient").attr("id", "narr-fade-v").attr("x1", 0).attr("x2", 1).attr("y1", 0).attr("y2", 0);
  gv.append("stop").attr("offset", 0).attr("stop-color", "#000").attr("stop-opacity", 0);
  gv.append("stop").attr("offset", 1).attr("stop-color", "#000").attr("stop-opacity", 0.6);

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
  const creditsEl = document.getElementById("narr-credits");
  function renderAt(t) {
    curT = t;
    const co_ = CREDITS ? clamp01((t - speechEnd - 0.15) / 0.5) : 0;    // the end card fades in after the last word
    creditsEl.style.opacity = co_;
    creditsEl.style.visibility = co_ > 0 ? "visible" : "hidden";
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
    drawPhoto(curT);
    drawCaption(curT);
  }
  app.onRedraw(() => { gHl && overlay(); });

  renderAt(0);

  window.__narr = {
    duration,
    cues: cues.map(c => ({ t: +c.time.toFixed(2), at: c.at })),
    // the scene's sound cues resolved to times, for scripts/narration-sound.mjs
    timeline: () => ({
      duration: speechEnd,
      credits: CREDITS,
      sound: cues.sound,
      // the music bed follows the camera: [t, log r, log m, span] every 0.25 s
      bed: SCENE.bed ?? false,      // off by default for now; a scene opts in with bed: true
      backing: SCENE.backing ?? null,   // a real track under the take (video/music/)
      path: Array.from({ length: Math.ceil(duration * 4) + 1 }, (_, i) => {
        const v = camera(i / 4).view;
        return [i / 4, +v.r.toFixed(3), +v.m.toFixed(3), +v.span.toFixed(3)];
      }),
    }),
    renderAt,
    settle(t) { const { view } = camera(t); app.setCamera(view, false); overlay(); },
    camera: (t) => camera(t).view,
    pending: () => app.tilesPending() + app.iconsPending() + (app.dustReady() ? 0 : 1) +
      [...photoImgs.values()].filter(im => !im.complete).length +
      [...photoBox.querySelectorAll("img")].filter(im => !im.complete).length,
    audio: base + take.audio,
  };
  if (RENDER) return;

  // ---------- live player ----------
  // One audio element for every take (app.audio): once a tap has started it,
  // mobile browsers let it play the next take without another tap.
  const audio = app.audio || new Audio();
  audio.muted = false;
  // Sound design (scripts/narration-sound.mjs): the voice with its bed, if the
  // take has one; the chip switches back to the bare voice, in place.
  const srcFor = () => base + (take.mix && soundOn() ? take.mix : take.audio);
  audio.src = srcFor();
  audio.preload = "auto";
  // Speed: the pitch stays put (the browser time-stretches); every frame
  // follows audio.currentTime, so the camera and captions keep in step.
  // The buttons count from the pace it was spoken at: a take sped up to 1.2×
  // (scripts/narration-tempo.py) plays as-is at 1.2× and slows down at 1×.
  audio.preservesPitch = audio.mozPreservesPitch = audio.webkitPreservesPitch = true;
  const tempo = take.tempo || 1;
  const speedEl = document.getElementById("narr-speed");
  const setSpeed = (v, keep = true) => {
    speed = v; audio.defaultPlaybackRate = audio.playbackRate = v / tempo;
    if (keep) try { localStorage.setItem("narr-speed-v2", v); } catch {}
    speedEl.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", +b.dataset.speed === v));
  };
  setSpeed(speed ?? (SPEEDS.includes(tempo) ? tempo : 1), false);
  speedEl.addEventListener("click", (e) => {
    e.stopPropagation();
    const b = e.target.closest("button[data-speed]");
    if (b) setSpeed(+b.dataset.speed);
  }, on);
  const ui = document.getElementById("narr-ui");
  const fill = document.getElementById("narr-bar-fill");
  const knob = document.getElementById("narr-knob");
  const bar = document.getElementById("narr-bar");
  const timeEl = document.getElementById("narr-time");
  const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  const showTime = (t) => {
    const f = Math.min(1, t / duration) * 100;
    fill.style.width = f + "%"; knob.style.left = f + "%";
    timeEl.textContent = `${mmss(t)} / ${mmss(duration)}`;
    bar.setAttribute("aria-valuenow", Math.round(t));
  };
  bar.setAttribute("aria-valuemin", 0); bar.setAttribute("aria-valuemax", Math.round(duration));
  let raf = 0, countdown = 0;
  const loop = () => {
    renderAt(audio.currentTime);
    showTime(audio.currentTime);
    if (!audio.paused) raf = requestAnimationFrame(loop);
  };
  const hint = (text) => { ui.querySelector("span").textContent = text; };
  const play = () => {
    stopCountdown();
    ui.classList.add("hidden"); layer.classList.remove("paused");
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
    // blocked (no tap yet on this page): back to the play button
    audio.play().catch(() => { ui.classList.remove("hidden"); layer.classList.add("paused"); hint("tap to play"); });
  };
  const pause = () => { audio.pause(); ui.classList.remove("hidden"); layer.classList.add("paused"); hint("paused · tap to resume"); window.__narr.settle(audio.currentTime); };
  layer.classList.add("paused");
  const seek = (t) => {
    t = Math.max(0, Math.min(duration - 0.05, t));
    audio.currentTime = t;
    renderAt(t); showTime(t);
    if (audio.paused) window.__narr.settle(t);
  };
  // Tap anywhere to play or pause. Taps are read from the pointer itself (a
  // short press that barely moves), not from "click": iOS Safari doesn't always
  // turn a tap on a plain full-screen area into a click (and may hold it back
  // waiting for a double-tap), which left the player deaf to taps once playing.
  const controls = "#narr-bar, #narr-next, #narr-chips, #narr-speed";
  let down = null, tappedAt = 0;
  layer.addEventListener("pointerdown", (e) => {
    down = e.target.closest(controls) || e.button > 0 ? null : { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
  }, on);
  layer.addEventListener("pointerup", (e) => {
    const d = down; down = null;
    if (!d || d.id !== e.pointerId || e.target.closest(controls)) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 12 || performance.now() - d.t > 600) return;   // a drag or a long press
    tappedAt = performance.now();
    audio.paused ? play() : pause();
  }, on);
  layer.addEventListener("pointercancel", () => { down = null; }, on);
  layer.addEventListener("click", (e) => {     // keyboard activation of the play button (a pointer tap was handled above)
    if (e.target.closest(controls) || performance.now() - tappedAt < 800 || e.detail !== 0) return;
    audio.paused ? play() : pause();
  }, on);
  // the scrubber: press anywhere on the bar and drag; the scene follows the finger
  const at = (e) => { const r = bar.getBoundingClientRect(); return (e.clientX - r.left) / r.width * duration; };
  bar.addEventListener("pointerdown", (e) => {
    e.preventDefault(); e.stopPropagation();
    try { bar.setPointerCapture(e.pointerId); } catch {}
    layer.classList.add("scrubbing");
    seek(at(e));
  });
  bar.addEventListener("pointermove", (e) => { if (bar.hasPointerCapture(e.pointerId)) seek(at(e)); });
  const end = (e) => { if (bar.hasPointerCapture(e.pointerId)) bar.releasePointerCapture(e.pointerId); layer.classList.remove("scrubbing"); };
  bar.addEventListener("pointerup", end);
  bar.addEventListener("pointercancel", end);
  bar.addEventListener("click", (e) => e.stopPropagation());
  window.addEventListener("keydown", (e) => {
    if (e.key === " ") { e.preventDefault(); audio.paused ? play() : pause(); }
    else if (e.key === "[" || e.key === "]") {
      const i = SPEEDS.indexOf(speed) + (e.key === "]" ? 1 : -1);
      if (SPEEDS[i]) setSpeed(SPEEDS[i]);
    }
    else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault(); e.stopImmediatePropagation();
      seek(audio.currentTime + (e.key === "ArrowRight" ? 5 : -5));
    }
  }, { capture: true, signal: ac.signal });
  showTime(0);

  // "Play next" on the end screen: the preview's grid order (window.__narrTakes),
  // or the shorts in name order on the dev server. With autoplay on, the end
  // screen counts down and the next short starts in place, on the same audio.
  const nextEl = document.getElementById("narr-next");
  const autoEl = document.getElementById("narr-auto");
  const order = window.__narrTakes ||
    Object.keys(SCENES).map(k => k.match(/([^/]+)\.js$/)[1]).filter(n => n.startsWith("short-")).sort().map(id => ({ id }));
  const next = order[order.findIndex(k => k.id === app.take) + 1];
  let nextTitle = next?.id;
  const goNext = () => { stopCountdown(); app.goto(next.id); };
  if (next) {
    (async () => {
      nextTitle = next.title || (SCENES[`./narration-scenes/${next.id}.js`] &&
        (await SCENES[`./narration-scenes/${next.id}.js`]()).default.title) || next.id;
      nextEl.textContent = `Play next: ${nextTitle}`;
    })();
    nextEl.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); goNext(); }, on);
  }
  const soundEl = document.getElementById("narr-sound");
  const showSound = () => {
    soundEl.textContent = `Sound design ${soundOn() ? "on" : "off"}`;
    soundEl.setAttribute("aria-pressed", soundOn());
  };
  if (take.mix) { soundEl.hidden = false; showSound(); }
  soundEl.addEventListener("click", (e) => {
    e.stopPropagation();
    setSoundOn(!soundOn()); showSound();
    const at = audio.currentTime, playing = !audio.paused;
    audio.src = srcFor(); audio.playbackRate = audio.defaultPlaybackRate;
    audio.addEventListener("loadedmetadata", () => { audio.currentTime = at; if (playing) audio.play().catch(() => {}); }, { once: true });
  }, on);
  const showAuto = () => {
    autoEl.textContent = `Autoplay ${autoplayOn() ? "on" : "off"}`;
    autoEl.setAttribute("aria-pressed", autoplayOn());
  };
  if (app.playAll) setAutoplay(true);   // "Play all" on the grid
  showAuto();
  autoEl.addEventListener("click", (e) => {
    e.stopPropagation();
    setAutoplay(!autoplayOn()); showAuto();
    if (!autoplayOn() && countdown) { stopCountdown(); hint("the end · tap to replay"); }
  }, on);
  function stopCountdown() { clearInterval(countdown); countdown = 0; }
  audio.addEventListener("ended", () => {
    ui.classList.remove("hidden"); layer.classList.add("paused");
    hint("the end · tap to replay");
    renderAt(duration); showTime(duration);     // the credits card stays up behind the end screen
    if (!next) return;
    nextEl.hidden = false;
    if (!autoplayOn()) return;
    let n = 5;
    const tick = () => n ? hint(`${nextTitle} in ${n--}… · tap to replay`) : goNext();
    tick();
    countdown = setInterval(tick, 1000);
  }, on);
  audio.addEventListener("play", () => { nextEl.hidden = true; }, on);

  current = {
    destroy() {
      stopCountdown(); cancelAnimationFrame(raf); ac.abort();
      audio.pause(); layer.remove(); app.onRedraw(null);
    },
  };
  // Autoplay: start on load (the browser may still want a tap first)
  if (app.autoplay ?? autoplayOn()) play();
}

// Playback speeds; the choice is remembered per browser, &speed= overrides it
const SPEEDS = [1, 1.1, 1.2, 1.3, 1.4, 1.5];
let speed = (() => {   // null: the take's own tempo
  let v = +new URLSearchParams(location.search).get("speed");
  if (!SPEEDS.includes(v)) try { v = +localStorage.getItem("narr-speed-v2"); } catch {}
  return SPEEDS.includes(v) ? v : null;
})();

// The autoplay switch, remembered per browser; &autoplay=0 turns it off
let autoplayPref = null;
function autoplayOn() {
  if (autoplayPref == null) {
    try { autoplayPref = localStorage.getItem("narr-autoplay") !== "0"; } catch { autoplayPref = true; }
    if (params?.get("autoplay") === "0") autoplayPref = false;
  }
  return autoplayPref;
}
let soundPref = null;
function soundOn() {
  if (soundPref == null) try { soundPref = localStorage.getItem("narr-sound") !== "0"; } catch { soundPref = true; }
  return soundPref;
}
function setSoundOn(v) {
  soundPref = v;
  try { localStorage.setItem("narr-sound", v ? "1" : "0"); } catch {}
}
function setAutoplay(v) {
  autoplayPref = v;
  try { localStorage.setItem("narr-autoplay", v ? "1" : "0"); } catch {}
}

// End credits: every video, short or long, closes on this card for a few seconds.
const creditsHTML = (track) => `<div id="narr-credits" aria-hidden="true"><div class="nc-in">
  <div class="nc-title">The Triangle<br>of Everything</div>
  <dl>
    <dt>Design and narration</dt><dd>Alex Van de Sande</dd>
    <dt>Inspired by the paper</dt><dd>“All objects and some questions”<span>Charles H. Lineweaver and Vihan M. Patel · Am. J. Phys. 2023</span></dd>
    <dt>Music</dt><dd>${track ? `“${track}” by ` : ""}Kevin MacLeod<span>incompetech.com · CC BY 4.0</span></dd>
  </dl>
  <div class="nc-url"><span>More at</span>triangleofeverything.com</div>
</div></div>`;

const NARR_CSS = `
#narr-layer { position: fixed; inset: 0; z-index: 10001; pointer-events: auto; overflow: hidden;
  cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
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
.narr-unit-minor { fill: rgba(255,255,255,0.6); font-size: 8.5px; font-weight: 500; }
.narr-axname { fill: rgba(255,255,255,0.6); font-size: 9px; font-weight: 800; letter-spacing: 0.2em; }
@font-face { font-family: "Barlow Condensed"; font-weight: 700; font-display: block;
  src: url("${import.meta.env.BASE_URL}fonts/barlow-condensed-700-latin.woff2") format("woff2"); }
#narr-caption { position: absolute; left: 6%; right: 6%; bottom: 8.5%; text-align: center; pointer-events: none;
  font: 700 38px/1.02 "Barlow Condensed", "DIN Condensed", "Arial Narrow", sans-serif; text-transform: uppercase;
  letter-spacing: 0.01em; color: #fff;
  -webkit-text-stroke: 6px #000; paint-order: stroke fill; }
#narr-caption span { color: #fff; }
#narr-photo { position: absolute; inset: 0; background: #000; overflow: hidden; visibility: hidden; pointer-events: none; }
#narr-photo .np-imgs { position: absolute; inset: 0; will-change: transform; }
#narr-photo figure { position: absolute; inset: 0; margin: 0; }
#narr-photo img { width: 100%; height: 100%; display: block; }
#narr-photo .np-stack { display: flex; flex-direction: column; justify-content: center; gap: 2%; padding: 15% 8% 30%; box-sizing: border-box; }
#narr-photo .np-stack figure { position: relative; flex: 1 1 0; min-height: 0; display: flex; flex-direction: column; align-items: center; }
#narr-photo .np-stack img { flex: 1 1 0; min-height: 0; }
#narr-photo figcaption { margin-top: 4px; font: 700 17px/1 "Barlow Condensed", "Arial Narrow", sans-serif; letter-spacing: 0.12em;
  text-transform: uppercase; color: #ffd54f; }
#narr-photo .np-cap { position: absolute; left: 6%; right: 6%; top: 6.5%; text-align: center;
  font: 600 15px/1.25 Inter, system-ui, sans-serif; letter-spacing: 0.02em; color: rgba(255,255,255,0.88);
  text-shadow: 0 1px 6px rgba(0,0,0,0.9), 0 0 2px #000; }
#narr-photo .np-cap b { display: block; margin-bottom: 3px; font: 700 26px/1 "Barlow Condensed", "Arial Narrow", sans-serif;
  letter-spacing: 0.06em; text-transform: uppercase; color: #ffd54f; }
/* in the player, the captions sit above the lifted scrubber */
#narr-layer.live #narr-caption { bottom: max(8.5%, calc(env(safe-area-inset-bottom, 0px) + 92px)); }
#narr-credits { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; visibility: hidden; opacity: 0;
  background: radial-gradient(ellipse at 50% 40%, rgba(16, 14, 52, 0.9), rgba(4, 4, 16, 0.97)); color: #eef0ff; pointer-events: none;
  font-family: Inter, system-ui, sans-serif; text-align: center; }
#narr-credits .nc-in { width: min(84%, 560px); container-type: inline-size; }
.nc-title { font: 700 13.5cqi/0.92 "Barlow Condensed", "Arial Narrow", sans-serif; text-transform: uppercase; letter-spacing: 0.01em; margin-bottom: 7cqi; }
#narr-credits dl { margin: 0; }
#narr-credits dt { font: 700 3.6cqi/1 "Barlow Condensed", "Arial Narrow", sans-serif; letter-spacing: 0.16em; text-transform: uppercase; color: #ffd54f; margin-top: 4.6cqi; }
#narr-credits dd { margin: 1.4cqi 0 0; font-size: 5cqi; font-weight: 600; line-height: 1.2; }
#narr-credits dd span { display: block; margin-top: 0.8cqi; font-size: 3.4cqi; font-weight: 400; color: #a3a8d6; }
.nc-url { margin-top: 6cqi; font: 700 7cqi/1 "Barlow Condensed", "Arial Narrow", sans-serif; letter-spacing: 0.02em; color: #ffd54f; }
.nc-url span { display: block; margin-bottom: 1.2cqi; font: 500 3.2cqi/1 Inter, system-ui, sans-serif; letter-spacing: 0.04em; color: #a3a8d6; }
#narr-caption span.now { color: #ffd54f; }
#narr-ui { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 18px; background: rgba(0,0,0,0.35); color: #fff; font-family: Inter, system-ui, sans-serif; }
#narr-ui.hidden { display: none; }
#narr-play { width: 84px; height: 84px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.12); color: #fff; font-size: 34px; padding-left: 8px; cursor: pointer; }
#narr-title { text-align: center; font-weight: 800; letter-spacing: 0.06em; font-size: 17px; }
#narr-title span { display: block; font-weight: 500; letter-spacing: 0.02em; font-size: 13px; opacity: 0.75; margin-top: 6px; }
#narr-next { font: 700 20px/1 "Barlow Condensed", "Arial Narrow", sans-serif; letter-spacing: 0.08em; text-transform: uppercase;
  color: #0b0c20; background: #ffd54f; border-radius: 999px; padding: 11px 18px 10px; text-decoration: none; margin-top: 4px; }
#narr-next::after { content: " ›"; }
#narr-next[hidden] { display: none; }
#narr-speed { display: flex; gap: 4px; padding: 3px; border-radius: 999px; background: rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.2); }
#narr-speed button { font: 600 13px/1 Inter, system-ui, sans-serif; font-variant-numeric: tabular-nums; color: #fff;
  background: none; border: 0; border-radius: 999px; padding: 8px 9px; min-width: 40px; cursor: pointer; }
#narr-speed button[aria-pressed="true"] { background: #ffd54f; color: #0b0c20; }
#narr-speed button:focus-visible { outline: 2px solid #ffd54f; outline-offset: 1px; }
#narr-chips { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
#narr-chips [hidden] { display: none; }
.narr-chip { font: 600 12px/1 Inter, system-ui, sans-serif; letter-spacing: 0.04em; color: #fff; cursor: pointer;
  background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.35); border-radius: 999px; padding: 7px 12px; }
.narr-chip[aria-pressed="true"] { border-color: #ffd54f; color: #ffd54f; }
/* the scrubber: a hairline while playing, a full track with a knob and the time
   when paused, hovered or dragged; the hit area is 44 px tall for fingers */
/* Lifted clear of the bottom edge, where phones put the home bar and the
   app-switch swipe, and inset from the side edges (back/forward swipes). */
#narr-bar { position: absolute; left: 10px; right: 10px; bottom: calc(env(safe-area-inset-bottom, 0px) + 38px); height: 44px;
  cursor: pointer; touch-action: none; }
#narr-track { position: absolute; left: 14px; right: 14px; bottom: 16px; height: 3px; border-radius: 2px;
  background: rgba(255,255,255,0.18); transition: height 0.15s, left 0.15s, right 0.15s, bottom 0.15s; }
#narr-bar-fill { position: absolute; left: 0; top: 0; bottom: 0; width: 0; border-radius: 2px; background: #ffd54f; }
#narr-knob { position: absolute; top: 50%; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%;
  background: #ffd54f; box-shadow: 0 0 0 3px rgba(0,0,0,0.35); opacity: 0; transition: opacity 0.15s; }
#narr-time { position: absolute; right: 14px; bottom: 28px; font: 600 12px/1 Inter, system-ui, sans-serif;
  font-variant-numeric: tabular-nums; color: #fff; text-shadow: 0 1px 3px #000; opacity: 0; transition: opacity 0.15s; pointer-events: none; }
#narr-layer:not(.paused):not(.scrubbing) #narr-track { opacity: 0.55; }
#narr-layer.paused #narr-track, #narr-layer.scrubbing #narr-track, #narr-bar:hover #narr-track { height: 5px; }
#narr-layer.paused #narr-knob, #narr-layer.scrubbing #narr-knob, #narr-bar:hover #narr-knob,
#narr-layer.paused #narr-time, #narr-layer.scrubbing #narr-time, #narr-bar:hover #narr-time { opacity: 1; }
`;
