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

import { blackHoleFilter } from "./black-hole-palette.js";
import * as d3 from "d3";
import { iconUrls } from "./assets.js";
import {
  HUBBLE_LOG_R, PLANCK_LOG_R, PLANCK_LOG_M, schwarzschildM, comptonM,
  densityLineM, DENSITY_SPHERE_C, SCHWARZSCHILD_C, COMPTON_C,
  RADIUS_UNITS, MASS_UNITS, REFERENCE_LINES, PHOTON_LAMBDA_OFFSET,
} from "./data.js";
import { narrClassic, classicFrameClient, classicAxisNumbers, classicRect, classicScreen, classicFullView } from "./classic.js";
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
  // air at 1 atm, as the map draws it: from microbes (1 µm) to Earth's size
  air:           { pts: [-4, Math.log10(6.371e8)].map(r => [r, densityLineM(r, Math.log10(0.0012))]), color: "#b0bec5" },
  darkmatter:    { pts: densitySegment(-24), color: "#e1a6ff" },
  // the galaxies' line without their dark matter: ten times less dense
  luminous:      { pts: densitySegment(-25), color: "#80deea" },
  mainsequence:  { pts: REFERENCE_LINES.find(l => l.label === "Main Sequence").points.map(p => [p.logR, p.logM]), color: "#ffd740" },
  chandrasekhar: { pts: REFERENCE_LINES.find(l => l.label.startsWith("Chandrasekhar")).points.map(p => [p.logR, p.logM]), color: "#90caf9" },
  tov:           { pts: REFERENCE_LINES.find(l => l.label.startsWith("TOV")).points.map(p => [p.logR, p.logM]), color: "#ff8a80" },
};
// the cosmic event horizon (16.7 billion ly comoving today), drawn like the Hubble line a
// little to its right, up to where a sphere of the universe's mean density that big sits
// (drawn top down, so its name sits on its right, clear of the Hubble line)
const EH_LOG_R = Math.log10(16.7e9 * 9.4607e17);
LINES.eventhorizon = { pts: [[EH_LOG_R, densityLineM(EH_LOG_R, -29.05)], [EH_LOG_R, comptonM(EH_LOG_R)]], color: "#ffab40" };
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
  // pictures 1.28× the app's default size, so they read on a phone (1.6× was too big)
  app.setIconScale?.(SCENE.iconSize ?? 128);
  // Settings → Icons at "many" (the author's pick): pictures may nearly touch, smaller catalogue ones show
  app.setIconDensity?.(SCENE.iconDensity ?? 60);   // a little over standard: pictures keep clear of each other
  app.setIconForce?.(SCENE.forceIcons ?? null);   // pictures shown even where a nearer one would hide them
  app.setIconHide?.(SCENE.hideIcons ?? null);     // pictures never shown in this scene
  app.setIconBoost?.(SCENE.iconBoost ?? null);    // { from: log r, k }: pictures of the big things k× larger
  app.setLabelHide?.(SCENE.hideLabels ?? null);   // objects whose own chart label never shows
  app.setIconMaxRes?.(true);   // grown pictures stay sharp
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
  // cam.glide: a waypoint of one continuous pan. The camera passes through each
  // glide point at its cue's time on a smooth (Catmull-Rom) curve, never holding,
  // instead of flying and stopping at each one.
  // dur: "end" flies until the end card has covered the picture (it fades in over
  // speechEnd + 0.15…0.65 s); ease: "gentle" (sine) keeps a long move
  // close to an even pace instead of the default cubic's slow-fast-slow
  const keys = cues.filter(c => c.cam).map(c => ({ t: c.time, to: resolveView(c.cam),
    dur: c.dur === "end" ? speechEnd + (CREDITS ? 0.65 : 0) - c.time : c.dur, drift: c.drift ?? 0.05,
    ease: c.ease === "gentle" ? d3.easeSinInOut : d3.easeCubicInOut,
    quiet: !!c.quiet, glide: !!c.cam.glide, whip: !!c.cam.whip, overshoot: c.cam.overshoot }))
    .filter(k => k.to);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (k.glide && keys[i - 1]?.glide) { k.end = k.t; continue; }   // reached by the pan itself
    const from = i === 0 ? START : camAt(k.t, i - 1);
    k.from = from;
    if (k.whip) {
      // cam.whip: a fast straight move at close zoom, with no zooming out on the way. It
      // overshoots a touch and settles back (an elastic bump). Motion blur comes from the
      // renderer's sub-frames (scripts/narration-render.mjs --subframes), not from the page
      const back = d3.easeBackOut.overshoot(k.overshoot ?? 0.7), ls0 = Math.log(from.span), ls1 = Math.log(k.to.span);
      k.interp = (p) => [from.r + (k.to.r - from.r) * back(p), from.m + (k.to.m - from.m) * back(p),
        Math.exp(ls0 + (ls1 - ls0) * d3.easeCubicInOut(p))];
      if (k.dur == null) k.dur = 0.6;
    } else k.interp = d3.interpolateZoom([from.r, from.m, from.span], [k.to.r, k.to.m, k.to.span]);
    if (k.dur == null) k.dur = Math.max(1.4, Math.min(3.6, k.interp.duration / 1000 * 0.8));
    k.end = k.t + k.dur;
  }
  const P = (k) => [k.to.r, k.to.m, k.to.span];
  /** Camera at time t using key i (and the drift until key i+1). */
  function camAt(t, i) {
    if (i < 0) return START;
    const k = keys[i], nx = keys[i + 1];
    if (k.glide && nx?.glide && t >= k.end) {
      // the segment from this waypoint to the next, at the next one's cue time
      const u = clamp01((t - k.end) / Math.max(0.1, nx.t - k.end));
      const p0 = P(keys[i - 1]?.glide ? keys[i - 1] : k), p1 = P(k), p2 = P(nx), p3 = P(keys[i + 2]?.glide ? keys[i + 2] : nx);
      const [r, m, span] = p1.map((_, j) => 0.5 * (2 * p1[j] + (p2[j] - p0[j]) * u +
        (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u * u + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * u * u * u));
      return { r, m, span, phase: "fly" };
    }
    if (t < k.end) {
      const p = clamp01((t - k.t) / k.dur);
      const [r, m, span] = k.interp(k.whip ? p : k.ease(p));
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
  // An object named while the camera is still on its way there is highlighted from the
  // moment it's well inside the frame (the middle 80%), not before.
  for (const h of highlights) {
    h.tc = h.t0;
    const o = h.obj && objByName.get(h.obj);
    if (!o) continue;
    const pl = app.plot(), aspect = pl.h / pl.w;
    for (let t = h.t0; t < h.t1; t += 0.1) {
      const v = camera(t).view;
      if (Math.abs(o.logR - v.r) < v.span * 0.4 && Math.abs(o.logM - v.m) < v.span * aspect * 0.4) { h.t0 = t; break; }
    }
  }
  // an object still named from the cue before keeps its first mention (`since`), so its
  // halo and guides don't start over at every cue
  for (const h of highlights) if (h.obj || h.line) {
    const prev = highlights.find(q => q !== h && (h.obj ? q.obj === h.obj : q.line === h.line) && q.tc < h.tc && Math.abs(q.t1 - h.tc) < 0.6);
    h.since = prev ? prev.since : h.t0;
  }
  // (and a cross read off the axes again doesn't draw its guides out again)
  for (const h of highlights) if (h.cross) {
    const key = JSON.stringify([h.cross, h.mass, h.size]);
    const prev = highlights.find(q => q !== h && q.cross && JSON.stringify([q.cross, q.mass, q.size]) === key && q.tc < h.tc && Math.abs(q.t1 - h.tc) < 0.6);
    h.since = prev ? prev.since : h.t0;
  }
  // (and a lit path named again doesn't draw itself on again)
  for (const h of highlights) if (h.path) {
    const key = JSON.stringify([h.path, h.from, h.to]);
    const prev = highlights.find(q => q !== h && q.path && JSON.stringify(q.path) === key && q.tc < h.tc && Math.abs(q.t1 - h.tc) < 0.6);
    h.since = prev ? prev.since : h.t0;
  }
  // the water line lies under the pictures, except its first mention: brighter and
  // thicker over them for WATER_GLOW s, then down to its place (drawLine)
  // a `trace` told over consecutive cues (the same picture, each cue the next step) is one run:
  // the close-up holds from its first cue to the end of its last (drawTraces)
  const traceRuns = [];
  // (`trace: "name"` is the outline close-up; a window's `trace: [lo, hi]` is only its faint line)
  const isTrace = (h) => typeof h.trace === "string";
  for (const h of highlights) if (isTrace(h)) {
    const run = traceRuns.find(r => r.name === h.trace && Math.abs(r.t1 - h.t0) < 0.05);
    if (run) { run.items.push(h); run.t1 = h.t1; } else traceRuns.push({ name: h.trace, t0: h.t0, t1: h.t1, items: [h] });
  }
  const firstWater = highlights.find(h => h.line === "water")?.t0;
  const WATER_GLOW = 2;

  // ---------- icons: only the objects the scene points at keep their picture ----------
  // (a cue's `icons`: false for none, true for the scene's set, or a list of names,
  // from that cue on; the scene's `icons` replaces the default set, and "all" keeps
  // the map's own icon visibility, as in the app)
  // (a dive's object counts as named: it needs its picture to come towards the screen)
  // ("all" was the map's own visibility; now that every scene fills in the other
  // pictures after its own, it works like the default, so named ones go first)
  // (the scene's `alsoIcons` join the default set after the named ones: pictures it
  // wants first on screen without naming them)
  const sceneIcons = Array.isArray(SCENE.icons) ? SCENE.icons : [...new Set([
    ...cues.flatMap(c => (c.hl || []).flatMap(h => [h.obj, h.spot, typeof h.trace === "string" && h.trace, h.arrow && h.from?.obj, h.arrow && h.to?.obj].filter(Boolean))),
    ...cues.flatMap(c => [c.dive && c.obj, c.dolly && (c.dolly.obj || c.dolly)].filter(n => typeof n === "string")),
    ...(SCENE.alsoIcons || [])])];
  const iconCues = cues.filter(c => c.icons !== undefined);
  let iconsNow;
  function applyIcons(t) {
    let v = true;
    for (const c of iconCues) if (c.time <= t) v = c.icons;
    const names = v === false ? [] : v === true ? sceneIcons : v;
    // the scene's set comes first, with every other picture that fits after it
    // (and the catalogue's own pictures); an explicit list or false stays as given
    const fill = v === true;
    const key = (names ? names.join("|") : "*") + (fill ? "+" : "");
    if (key !== iconsNow) { iconsNow = key; app.setIcons?.(names, fill); app.setDustFill?.(fill); }
    // a cue's `forceIcons` / `hideIcons` / `hideLabels` / `firstIcons` replace the scene's from that cue on (null: the scene's
    // again): the 1 mL ball hidden until it's talked about, the animals put first (video 2)
    for (const [k, set, now] of [["forceIcons", app.setIconForce, iconForceNow], ["hideIcons", app.setIconHide, iconHideNow], ["hideLabels", app.setLabelHide, labelHideNow], ["firstIcons", app.setIconFirst, iconFirstNow]]) {
      let v = SCENE[k] ?? null;
      for (const c of cues) if (c[k] !== undefined && c.time <= t) v = c[k] ?? SCENE[k] ?? null;
      const key = v ? v.join("|") : "";
      if (key !== now.key) { now.key = key; set?.(v); }
    }
  }
  const iconForceNow = { key: (SCENE.forceIcons ?? []).join("|") }, iconHideNow = { key: (SCENE.hideIcons ?? []).join("|") },
    labelHideNow = { key: (SCENE.hideLabels ?? []).join("|") }, iconFirstNow = { key: (SCENE.firstIcons ?? []).join("|") };

  // ---------- object focus: a cue's `focus: [names]` fades every other object from then
  // on (to FOCUS_FADE, over 0.6 s), `focus: false` brings them back ----------
  const focusCues = cues.filter(c => c.focus !== undefined);
  const FOCUS_FADE = 0.88;
  function applyFocus(t) {
    let cur = null, prev = null;
    for (const c of focusCues) if (c.time <= t) { prev = cur; cur = c; }
    if (!cur) return app.setObjectFocus?.(null);
    const k = smooth((t - cur.time) / 0.6);
    if (cur.focus) {
      // from one focus set to another: straight over, no fade back up in between
      app.setObjectFocus?.(cur.focus, FOCUS_FADE * (prev?.focus ? 1 : k));
    } else if (prev?.focus) app.setObjectFocus?.(k < 1 ? prev.focus : null, FOCUS_FADE * (1 - k));
    else app.setObjectFocus?.(null);
  }

  // ---------- picture density: a cue's `density` (Settings → Icons, 0–100+; above 100 the
  // pictures may overlap more) from then on, `density: null` back to the scene's ----------
  const densityCues = cues.filter(c => c.density !== undefined);
  function applyDensity(t) {
    if (!densityCues.length) return;
    let v = null;
    for (const c of densityCues) if (c.time <= t) v = c.density;
    app.setIconDensity?.(v ?? SCENE.iconDensity ?? 60);
  }

  // ---------- object labels: a cue's `labels: false` hides them from then on ----------
  const labelCues = cues.filter(c => c.labels !== undefined);
  let labelsNow;
  function applyLabels(t) {
    let v = true;
    for (const c of labelCues) if (c.time <= t) v = c.labels;
    if (v !== labelsNow) { labelsNow = v; app.setLabels?.(v); }
  }

  // ---------- chart overlays: `periodic` / `spectrum: true` from a cue on, false to end ----------
  // (the periodic table's lines; the spectrum's sine wave). Each fades in once
  // its cue's camera has arrived (the wave isn't redrawn mid-move); out from its cue.
  const OVERLAY_FADE = 0.4;
  const overlays = ["periodic", "spectrum"].map(key => ({ key, set: key === "periodic" ? "setPeriodic" : "setSpectrum",
    cues: cues.filter(c => c[key] !== undefined).map(c => ({ on: !!c[key], t: c[key] && keys.find(k => k.t === c.time)?.end || c.time })) }));
  // ---------- swapped pictures: `swap: { "Cow": "cow-spherical" }` from a cue on (an object
  // drawn with another icon file's picture), `swap: false` back to its own ----------
  // `pop: true` on a swap cue: the picture pops into its new one (shrinks, swaps at its
  // smallest, springs back past its size and settles), with a ring bursting out of it
  const swapCues = cues.filter(c => c.swap !== undefined);
  const POP_SWAP = 0.14, POP_END = 1.2;
  const swapAt = (c) => c.time + (c.pop ? POP_SWAP : 0);
  const popScale = (u) => u < 0 || u >= POP_END ? 1
    : u < POP_SWAP ? 1 - 0.45 * d3.easeQuadIn(u / POP_SWAP)
    : 1 - 0.45 * Math.exp(-3.4 * (u - POP_SWAP)) * Math.cos(13 * (u - POP_SWAP));
  let swapNow = "";
  const popping = new Set();
  function applySwap(t) {
    let map = null;
    for (const c of swapCues) if (swapAt(c) <= t) map = c.swap || null;
    const slugs = map && Object.fromEntries(Object.entries(map).map(([name, file]) => [objByName.get(name)?.slug, file]).filter(([s]) => s));
    const key = JSON.stringify(slugs);
    if (key !== swapNow) { swapNow = key; app.setIconSwap?.(slugs); }
    const now = new Map();
    for (const c of swapCues) if (c.pop && c.swap) for (const name of Object.keys(c.swap)) {
      const k = popScale(t - c.time);
      if (k !== 1) now.set(name, k);
    }
    for (const [name, k] of now) { app.growIcon?.(name, k, true); popping.add(name); }
    for (const name of [...popping]) if (!now.has(name)) { popping.delete(name); app.growIcon?.(name, 1, true); }
  }
  /** The pop's ring: a white circle bursting out of the picture as it swaps. */
  function drawPops(t) {
    gPop.selectAll("*").remove();
    const lr = layer.getBoundingClientRect(), scl = lr.width / layer.clientWidth;
    for (const c of swapCues) if (c.pop && c.swap) for (const name of Object.keys(c.swap)) {
      const u = (t - swapAt(c)) / 0.55;
      if (u < 0 || u > 1) continue;
      const box = app.iconRect?.(name), o = objByName.get(name);
      if (!o) continue;
      const x = box ? (box.x + box.w / 2 - lr.x) / scl : sx(o.logR), y = box ? (box.y + box.h / 2 - lr.y) / scl : sy(o.logM);
      const r0 = box ? Math.max(box.w, box.h) / scl * 0.5 : 24, e = d3.easeCubicOut(u);
      gPop.append("circle").attr("cx", x).attr("cy", y).attr("r", r0 * (0.9 + 1.4 * e)).attr("fill", "none")
        .attr("stroke", "#fff").attr("stroke-width", 5 * (1 - u) + 0.5).attr("opacity", 0.9 * (1 - u));
      for (let i = 0; i < 8; i++) {   // little rays, like a cartoon pop
        const a = i * Math.PI / 4 + Math.PI / 8, ra = r0 * (1.25 + 1.3 * e), rb = r0 * (1.5 + 1.7 * e);
        gPop.append("line").attr("x1", x + ra * Math.cos(a)).attr("y1", y + ra * Math.sin(a))
          .attr("x2", x + rb * Math.cos(a)).attr("y2", y + rb * Math.sin(a))
          .attr("stroke", "#ffe9a3").attr("stroke-width", 3).attr("stroke-linecap", "round").attr("opacity", 1 - u);
      }
    }
  }
  function applyOverlays(t) {
    for (const o of overlays) {
      let a = 0;
      for (const c of o.cues) if (c.t <= t) {
        const f = clamp01((t - c.t) / OVERLAY_FADE);
        a = c.on ? Math.max(a, f) : Math.min(a, 1 - f);
      }
      app[o.set]?.(+a.toFixed(3));
    }
  }

  // ---------- the classic figure's title block: `header: false` fades it out from a
  // cue, `true` fades it in (hidden from the start when the first such cue is a true) ----------
  const headerCues = cues.filter(c => c.header !== undefined);
  const HEADER_FADE = 0.6;
  function classicParts(t) {
    let header = headerCues[0]?.header ? 0 : 1;
    for (const c of headerCues) if (c.time <= t) {
      const f = smooth((t - c.time) / HEADER_FADE);
      header = c.header ? Math.max(header, f) : Math.min(header, 1 - f);
    }
    return { header };
  }

  // ---------- unit rulers: up while the camera moves (or pinned) ----------
  // unitsFor: seconds (6); unitsUntil: the `at` of a later cue to hold them up to
  const pins = cues.filter(c => c.units).map(c => {
    const until = c.unitsUntil && cues.find(d => d.time > c.time && [].concat(d.at).includes(c.unitsUntil));
    return { t0: c.time, t1: until ? until.time : c.time + (c.unitsFor ?? 6) };
  });
  const guided = highlights.filter(h => h.obj && h.label !== false);   // see drawGuides
  function unitsOpacity(t) {
    let o = 0;
    for (const k of keys) {
      if (k.end - k.t < 0.4 || k.quiet) continue;   // quiet: a move with no rulers
      o = Math.max(o, smooth((t - (k.t - 0.4)) / 0.4) * (1 - smooth((t - (k.end + 0.9)) / 0.9)));
    }
    for (const p of pins) o = Math.max(o, smooth((t - p.t0) / 0.4) * (1 - smooth((t - p.t1) / 0.9)));
    // an object's guides point at the rulers, so the rulers come up with them
    for (const h of guided) o = Math.max(o, smooth((t - h.t0) / 0.4) * (1 - smooth((t - h.t1) / 0.9)));
    // (and never over the spectrum explorer: it has no chart axes)
    return o * (1 - clamp01(classicOpacity(t) * 2)) * (1 - (specFrame ? specFrame(t).show : 0));
  }

  // ---------- DOM ----------
  const layer = document.createElement("div");
  layer.id = "narr-layer";
  if (!RENDER) layer.classList.add("live");     // the player's own UI (renders have none)
  const track = SCENE.backing && (typeof SCENE.backing === "string" ? SCENE.backing : SCENE.backing.track);
  layer.innerHTML = `<svg id="narr-svg"></svg><div id="narr-clips"></div><div id="narr-cover" hidden><img alt=""></div><div id="narr-photo"><div class="np-imgs"></div><div class="np-cap"></div></div><div id="narr-caption"></div>` + creditsHTML(track) +
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
  const gGuides = nsvg.append("g").attr("class", "narr-guides");   // the guides' values, at the rulers
  const gSketch = nsvg.append("g").attr("class", "narr-sketch");   // line drawings over a dived picture: stay up while the chart dims
  const gPop = nsvg.append("g").attr("class", "narr-pop");         // a swap cue's pop (drawPops)
  const capEl = document.getElementById("narr-caption");

  // ---------- photo cutaways ----------
  // { at, photo: "m87" | ["hyperion", "vesta", …], caption: "what · who · when", labels?: […],
  //   obj?: dot it grows from, dur?: s (6), fit?: "cover" | "contain", kb?: [scale from, to],
  //   focus?: [x, y] (0–1 in the image, where the Ken Burns push heads),
  //   place?: true | width (fraction of the screen, default 0.78), fadeIn?: s, row?: true (several
//   pictures side by side, not stacked), labels?: [html under each], clip?: true (the pictures are
//   short .mp4 videos playing from the cue: the Hopf atoms),
  //   lens?: { icon: [cx, cy, r], photo: [cx, cy, r], size: [w, h] }
  //        | { map: [ar, ai, br, bi], r, at?: [x, y], size: [w, h] }
  //        plus fill?: true | "cover", hold?: s (0.3), fillDur?: s (1.6) — then grow:
  //        true = the disc to the screen's width, "cover" = the whole photo upright, edge to edge;
  //        turn?: 0–1, how much of the way upright a "cover" photo turns (default 1),
  //        back?: s, a filled photo shrinks back onto the picture over its last `back` s before it fades }
  // A spot on the object + a photo with `lens` = a "dive" (video/plans/visual-rules.md §3),
  // the default way to show a real photo of something that has a picture on the chart.
  // `lens`: no cut. The photo fades in through a round window laid exactly over the
  // object's own picture, scaled so the photo's disc (photo: px in the image) sits on
  // the picture's disc (icon: fractions of the icon) — like holding a lens to it.
  // A picture that isn't a disc (the Pillars of Creation) takes `map` instead: the
  // similarity q = a·p + b (complex numbers) from photo px p to icon fractions q,
  // fitted on matching features, shown through a circle of radius r (icon widths).
  // Pair it with a spot on the object and a camera move onto it.
  // Full screen (default): a black disc grows out of the object's dot until it fills the
  // frame, with the real photo inside; the photo pushes in slowly under its caption, then
  // shrinks back into the dot. `place`: the photo opens as a soft-edged round window on
  // the chart itself, over the dot, with the chart still around it (nebulae, galaxies).
  // Files: public/narration/photos/<name>.jpg (credits in video/photos/CREDITS.md).
  const PHOTO_IN = 0.9, PHOTO_OUT = 0.8;

  // ---------- dives: the camera trick ----------
  // { at, dolly: name | { obj, grow?: × | "fill" (default), size?: share of the screen's short side a
  //   "fill" picture's radius reaches (0.4), in?: s (2.4), out?: s (4) },
  //   dur?: s held all the way in (4) }
  // The object comes towards the screen while the depths behind it fall back, the
  // further the faster (painting, then dust and lines, then the other pictures),
  // blurring and darkening (app.setDolly): changing the zoom as the camera moves.
  // Then it goes back the same way over `out`. A photo with `lens` on the same object,
  // timed inside the hold, lands on the grown picture (video/plans/visual-rules.md §3).
  // "fill": the object grows to 40% of the screen's short side.
  // A photo cue with `dive: { in?, out?, grow?, photoAt?, under? }` is a whole dive in one cue: the
  // dive starts at the cue, the photo fades in once everything behind has fully fallen
  // back (in + 0.25 s; or `photoAt` s after the cue, so it's already coming in during the
  // approach), holds `dur`, fades out, and then the dive unwinds over `out`.
  const DIVE_IN = 2, DIVE_OUT = 3.5, DIVE_LEAD = 0.25;
  const diveLead = (c) => !c.dive ? 0 : c.dive.photoAt ?? (c.dive.in ?? DIVE_IN) + DIVE_LEAD;
  const dollies = [
    ...cues.filter(c => c.dolly).map(c => {
      const d = typeof c.dolly === "string" ? { obj: c.dolly } : c.dolly, tin = d.in ?? 2.4;
      return { ...d, t0: c.time, t1: c.time + tin + (c.dur ?? 4), tin, tout: d.out ?? 4 };
    }),
    // `dive.under`: the dive unwinds behind its photo while it still fills the screen, so
    // the chart is back to normal by the time the photo fades (no zoom back out to watch)
    ...cues.filter(c => c.photo && c.dive).map(c => {
      const d = c.dive === true ? {} : c.dive, tin = d.in ?? DIVE_IN, tout = d.out ?? DIVE_OUT;
      const held = c.time + diveLead(c) + (c.dur ?? 6);
      return { obj: c.obj, grow: d.grow, t0: c.time, tin, tout,
        t1: d.under ? Math.max(c.time + tin, held - tout) : held + (c.fadeOut ?? PHOTO_OUT) };
    }),
  ];
  let dollyOn = false;
  function drawDolly(t) {
    const d = dollies.find(q => t >= q.t0 && t < q.t1 + q.tout);
    // the narration's own marks (callouts, rulers) step back with the chart
    const marks = [gHl, gHlFree, gGuides, gUnits];
    if (!d) { if (dollyOn) { app.setDolly?.(null); marks.forEach(g => g.style("opacity", null)); dollyOn = false; } return; }
    const k = t < d.t1 ? d3.easeCubicInOut(clamp01((t - d.t0) / d.tin))
      : 1 - d3.easeCubicInOut(clamp01((t - d.t1) / d.tout));
    let grow = d.grow ?? "fill";
    if (grow === "fill") grow = Math.max(1, Math.min(layer.clientWidth, layer.clientHeight) * (d.size ?? 0.4) / (app.iconRadius?.(d.obj) || 20));
    app.setDolly?.({ name: d.obj, k, grow });
    marks.forEach(g => g.style("opacity", (1 - k).toFixed(3)));
    dollyOn = true;
  }
  const photoUrl = (n, clip) => `${import.meta.env.BASE_URL}narration/photos/${n}.${clip ? "mp4" : "jpg"}`;
  const photos = cues.filter(c => c.photo).map(c => ({ ...c, names: [].concat(c.photo),
    t0: c.time + diveLead(c), t1: c.time + diveLead(c) + (c.dur ?? 6) }));
  const photoImgs = new Map();
  for (const p of photos) for (const n of p.names) if (!p.clip && !photoImgs.has(n)) {
    const im = new Image(); im.decoding = "sync"; im.src = photoUrl(n); photoImgs.set(n, im);
  }
  // ---------- the opening cover (scene `cover: { src, size: [w, h], frame: [x0, y0, x1, y1],
  // r: [r0, r1], m: [m0, m1], hole: [x0, y0, x1, y1], from, dur, fade, bg, surround }`): a picture of the
  // page the classic figure comes from (a journal cover) with the figure's box (`hole`, in
  // its px) cut out, so the live figure shows through it. It starts at `from` of the
  // stage's width (1), centred on `surround`, and zooms in for `dur` s, the figure's camera following it
  // (its plot, `frame`, spans log radius r and log mass m), until the plot is where the
  // scene's camera has it at `dur`; then the cover keeps to the figure and fades over
  // `fade` s. While it zooms the figure is shown whole, as laid out (as on the page), and
  // scaled on screen with the cover (its frame and axes don't zoom with the camera); then
  // its camera eases into the scene's over COVER_BLEND s ----------
  const COVER_BLEND = 1.5;
  let classicView = null;   // the figure's camera as last drawn
  const COVER = SCENE.cover;
  const coverEl = document.getElementById("narr-cover"), coverImg = coverEl.querySelector("img");
  if (COVER) {
    const [w, h] = COVER.size, [a, b, c, d] = COVER.hole;
    coverEl.hidden = false; coverEl.style.background = "none"; coverImg.src = photoUrl(COVER.src);
    // around it the dark of the stage (a shadow's spread), where it starts small, far off
    const F = 1e5;
    Object.assign(coverImg.style, { width: `${w}px`, height: `${h}px`, background: COVER.bg || "#000",
      boxShadow: `0 0 0 ${F}px ${COVER.surround || "#05051a"}`,
      clipPath: `polygon(evenodd, ${-F}px ${-F}px, ${F}px ${-F}px, ${F}px ${F}px, ${-F}px ${F}px, ${-F}px ${-F}px, ` +
        `${a}px ${b}px, ${c}px ${b}px, ${c}px ${d}px, ${a}px ${d}px, ${a}px ${b}px)` });
  }
  /** The cover's place at t (layer px: scales sx, sy and offset tx, ty), and the figure's
   *  view that puts the plot under the cover's own; null without a figure to follow. */
  function coverPose(t) {
    const rect = classicRect();
    if (!rect?.width) return null;
    const lr = layer.getBoundingClientRect(), scl = lr.width / layer.clientWidth;
    const SW = layer.clientWidth, SH = layer.clientHeight;
    const [w, h] = COVER.size, [x0, y0, x1, y1] = COVER.frame, [r0, r1] = COVER.r, [m0, m1] = COVER.m;
    const ppdX = (x1 - x0) / (r1 - r0), asp = ppdX / ((y1 - y0) / (m1 - m0));   // its decades made square
    const W = rect.width / scl, ccx = (rect.x + rect.width / 2 - lr.x) / scl, ccy = (rect.y + rect.height / 2 - lr.y) / scl;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rc = (r0 + r1) / 2, mc = (m0 + m1) / 2;
    // the end: the plot as the figure shows it at `dur` (whole), and after it as it moves on
    const v = t < COVER.dur ? classicFullView() : classicView;
    if (!v) return null;
    const ppd1 = W / v.span;
    const s0 = SW / w * (COVER.from ?? 1), s1 = ppd1 / ppdX, k = smooth(clamp01(t / COVER.dur));
    const sx = s0 * (s1 / s0) ** k, ppd = sx * ppdX;                            // a steady zoom
    // the plot's centre travels in a straight line on screen
    const px = (1 - k) * (SW / 2 + (cx - w / 2) * s0) + k * (ccx + (rc - v.r) * ppd1);
    const py = (1 - k) * ((SH - h * s0 * asp) / 2 + cy * s0 * asp) + k * (ccy - (mc - v.m) * ppd1);
    // the figure, at the end's camera, carried from the end's place to the cover's now
    const f = sx / s1, ex = ccx + (rc - v.r) * ppd1, ey = ccy - (mc - v.m) * ppd1;
    return { sx, sy: sx * asp, tx: px - cx * sx, ty: py - cy * sx * asp,
      fig: { f, dx: px - ccx - f * (ex - ccx), dy: py - ccy - f * (ey - ccy) } };
  }
  function coverView(t) {
    if (!COVER || t >= COVER.dur + COVER_BLEND) return null;
    const full = classicFullView();
    if (!full || t < COVER.dur) return full;
    const k = smooth((t - COVER.dur) / COVER_BLEND), v = camera(t).view;
    return { r: full.r + (v.r - full.r) * k, m: full.m + (v.m - full.m) * k, span: full.span * (v.span / full.span) ** k };
  }
  function drawCover(t) {
    if (!COVER) return;
    const a = 1 - smooth((t - COVER.dur) / (COVER.fade ?? 0.8));
    const p = a > 0.001 && classicOpacity(t) > 0 ? coverPose(t) : null;
    coverEl.style.visibility = p ? "visible" : "hidden";
    if (!p) return;
    coverImg.style.transform = `translate(${p.tx.toFixed(2)}px, ${p.ty.toFixed(2)}px) scale(${p.sx.toFixed(5)}, ${p.sy.toFixed(5)})`;
    if (t < COVER.dur) classicScreen(p.fig.f.toFixed(5), p.fig.dx.toFixed(2), p.fig.dy.toFixed(2));
    coverEl.style.opacity = a.toFixed(3);
  }
  const photoEl = document.getElementById("narr-photo");
  const photoBox = photoEl.querySelector(".np-imgs"), photoCap = photoEl.querySelector(".np-cap");
  let photoShown = null;
  function drawPhoto(t) {
    const p = photos.find(q => t >= q.t0 && t < q.t1 + (q.fadeOut ?? PHOTO_OUT));
    // fadeIn / fadeOut: s, for a slower reveal or return than the defaults
    const reveal = p ? smooth((t - p.t0) / (p.fadeIn ?? PHOTO_IN)) * (1 - smooth((t - p.t1) / (p.fadeOut ?? PHOTO_OUT))) : 0;
    if (reveal <= 0.001) { photoEl.style.visibility = "hidden"; return; }
    const SW = layer.clientWidth, SH = layer.clientHeight;
    if (photoShown !== p) {
      photoShown = p;
      // several pictures: one above the other, or side by side with `row: true`
      photoBox.className = "np-imgs" + (p.names.length > 1 ? " np-stack" + (p.row ? " np-row" : "") : "");
      // `clip: true`: the pictures are short videos (public/narration/photos/<name>.mp4), playing from
      // the cue on, frame-exact in the renderer (syncClips)
      photoBox.innerHTML = p.names.map((n, i) => `<figure>${p.clip ? `<video src="${photoUrl(n, true)}" muted playsinline preload="auto"></video>` : `<img src="${photoUrl(n)}" alt="">`}` +
        (p.labels?.[i] ? `<figcaption>${p.labels[i]}</figcaption>` : "") + `</figure>`).join("");
      photoBox.querySelectorAll("img").forEach(im => { im.style.objectFit = p.fit || (p.names.length > 1 ? "contain" : "cover"); im.style.filter = ""; });
      const [what, ...rest] = (p.caption || "").split(" · ");
      photoCap.innerHTML = p.caption ? `<b>${what}</b>${rest.join(" · ")}` : "";
    }
    if (p.clip) syncClips(p, t);
    // grow from the object's dot (or the middle), on the camera as it is now
    let cx = SW / 2, cy = SH / 2;
    const o = p.obj && objByName.get(p.obj);
    if (o) { cx = Math.min(SW, Math.max(0, sx(o.logR))); cy = Math.min(SH, Math.max(0, sy(o.logM))); }
    photoEl.style.visibility = "visible";
    photoEl.style.opacity = "";
    photoEl.style.maskSize = photoEl.style.webkitMaskSize = photoEl.style.maskPosition = photoEl.style.webkitMaskPosition = "";
    photoEl.style.maskRepeat = photoEl.style.webkitMaskRepeat = "";
    const lensBox = p.lens && app.iconRect?.(p.obj);
    if (p.lens && !lensBox) { photoEl.style.visibility = "hidden"; return; }
    if (lensBox) {
      const lr = layer.getBoundingClientRect(), scl = lr.width / SW;
      const bx = (lensBox.x - lr.x) / scl, by = (lensBox.y - lr.y) / scl, bw = lensBox.w / scl, bh = lensBox.h / scl;
      const [iw, ih] = p.lens.size;
      // photo px → icon fractions, as a complex similarity q = a·p + b
      let ar, ai, br, bi, qx, qy, R;
      if (p.lens.map) {
        [ar, ai, br, bi] = p.lens.map;
        const [ax, ay] = p.lens.at || [0.5, 0.5];   // window centre, icon fractions
        qx = bx + bw * ax; qy = by + bh * ay; R = bw * (p.lens.r ?? 0.44);
      } else {
        const [icx, icy, ir] = p.lens.icon, [pcx, pcy, pr] = p.lens.photo;
        ar = ir / pr; ai = 0; br = icx - pcx * ar; bi = icy - pcy * ar;
        qx = bx + bw * icx; qy = by + bh * icy; R = bw * ir * 1.03;
      }
      // screen = icon box ∘ similarity, as one CSS matrix on the full-size image
      let mtx = [bw * ar, bh * ai, -bw * ai, bh * ar, bx + bw * br, by + bh * bi];
      let fillK = 0;   // how far the fill has gone: the backdrop turns black with it
      // fill: once the photo sits on the picture, it grows and moves to the middle
      // until its disc spans the screen (over fillDur s, after a short hold)
      // back: s — and before it fades, it shrinks back onto the picture the same way (the
      // dive in reversed: the author, 2026-10-29), so the fade lands on the picture as it was
      const back = p.lens.back ? 1 - d3.easeCubicInOut(clamp01((t - p.t1 + p.lens.back) / p.lens.back)) : 1;
      const g = p.lens.fill ? back * d3.easeCubicInOut(clamp01((t - p.t0 - (p.fadeIn ?? PHOTO_IN) - (p.lens.hold ?? 0.3)) / (p.lens.fillDur ?? 1.6))) : 0;
      if (p.lens.fill === "cover") {
        // the whole photo, upright, covering the screen: turn, scale and slide from
        // the lens (photo point under the lens centre → there) to the cover (photo
        // centre → screen centre); scale interpolated in log, so the growth is even
        const S0 = Math.hypot(mtx[0], mtx[1]), th0 = Math.atan2(mtx[1], mtx[0]);
        const det = mtx[0] * mtx[3] - mtx[1] * mtx[2];
        const dx = qx - mtx[4], dy = qy - mtx[5];
        const P0 = [(mtx[3] * dx - mtx[2] * dy) / det, (-mtx[1] * dx + mtx[0] * dy) / det];   // photo px under the lens centre
        // turn: how much of the way upright it turns (default all of it); what's left of the
        // tilt needs a bigger photo to still cover the screen
        const thEnd = th0 * (1 - (p.lens.turn ?? 1)), cE = Math.abs(Math.cos(thEnd)), sE = Math.abs(Math.sin(thEnd));
        const S1 = Math.max((SW * cE + SH * sE) / iw, (SW * sE + SH * cE) / ih), P1 = [iw / 2, ih / 2], Q1 = [SW / 2, SH / 2];
        const S = S0 * (S1 / S0) ** g, th = th0 + (thEnd - th0) * g;
        const Px = P0[0] + (P1[0] - P0[0]) * g, Py = P0[1] + (P1[1] - P0[1]) * g;
        const Qx = qx + (Q1[0] - qx) * g, Qy = qy + (Q1[1] - qy) * g;
        const c = S * Math.cos(th), s = S * Math.sin(th);
        mtx = [c, s, -s, c, Qx - c * Px + s * Py, Qy - s * Px - c * Py];
        qx = Qx; qy = Qy; R = R + (Math.hypot(SW, SH) - R) * g; fillK = g;
      } else if (p.lens.fill) {
        const Rt = Math.min(SW * 0.47, SH * 0.36), cx2 = SW / 2, cy2 = SH * 0.44;
        const R2 = R + (Rt - R) * g, nx = qx + (cx2 - qx) * g, ny = qy + (cy2 - qy) * g, k = R2 / R;
        mtx = [k * mtx[0], k * mtx[1], k * mtx[2], k * mtx[3], nx + k * (mtx[4] - qx), ny + k * (mtx[5] - qy)];
        qx = nx; qy = ny; R = R2; fillK = g;
      }
      // a filling lens takes the whole screen to black as it grows (whatever the cues
      // underneath do); otherwise only the lens and the caption show
      photoEl.style.background = p.lens.fill ? "#000" : "transparent";
      photoEl.style.clipPath = "none";
      photoEl.style.opacity = reveal.toFixed(3);
      // the lens, plus the caption's strip so the caption isn't masked away
      const cap = photoCap.getBoundingClientRect(), capY = (cap.y - lr.y) / scl - 6, capH = cap.height / scl + 12;
      // a filling lens goes to black with the photo's fade-in, before it grows
      if (p.lens.fill) fillK = Math.max(fillK, 0.5 * back * smooth((t - p.t0) / (p.fadeIn ?? PHOTO_IN)));
      const a = (Math.min(1, fillK * 2)).toFixed(3);
      const m = `radial-gradient(circle ${R.toFixed(1)}px at ${qx.toFixed(1)}px ${qy.toFixed(1)}px, #000 88%, transparent 100%), linear-gradient(#000, #000)` +
        (fillK > 0 ? `, linear-gradient(rgba(0,0,0,${a}), rgba(0,0,0,${a}))` : "");
      photoEl.style.maskImage = photoEl.style.webkitMaskImage = m;
      photoEl.style.maskSize = photoEl.style.webkitMaskSize = `100% 100%, 100% ${capH.toFixed(1)}px` + (fillK > 0 ? ", 100% 100%" : "");
      photoEl.style.maskPosition = photoEl.style.webkitMaskPosition = `0 0, 0 ${capY.toFixed(1)}px` + (fillK > 0 ? ", 0 0" : "");
      photoEl.style.maskRepeat = photoEl.style.webkitMaskRepeat = "no-repeat";
      mtx = mtx.map(v => +v.toFixed(5));
      Object.assign(photoBox.style, { left: "0", top: "0", width: `${iw}px`, height: `${ih}px`, right: "auto", bottom: "auto",
        transformOrigin: "0 0", transform: `matrix(${mtx.join(",")})` });
      // the photo takes its picture's colours (the black holes' mass-ordered palette),
      // so the dive doesn't change hue as it lands
      const tint = blackHoleFilter(objByName.get(p.obj)?.slug) || "";
      photoBox.querySelectorAll("img").forEach(im => { im.style.objectFit = "fill"; im.style.filter = tint; });
      photoCap.style.opacity = (smooth((t - p.t0 - PHOTO_IN * 0.6) / 0.5) * (1 - smooth((t - p.t1 + 0.3) / 0.4))).toFixed(3);
      return;
    } else if (p.place) {
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

  // a clip cutaway's videos follow the narration's clock: the renderer seeks each frame exactly
  // (pending() waits for the seek); the live player lets them play and only corrects a drift
  function syncClips(p, t) {
    let live = false;
    try { live = !RENDER && !audio.paused; } catch {}
    for (const v of photoBox.querySelectorAll("video")) {
      const want = Math.max(0, Math.min((v.duration || 1e9) - 0.04, t - p.t0));
      if (RENDER || !live) {
        if (!v.paused) v.pause();
        if (Math.abs(v.currentTime - want) > 0.001) v.currentTime = want;
      } else {
        if (Math.abs(v.currentTime - want) > 0.25) v.currentTime = want;
        if (v.paused && want < (v.duration || 1e9) - 0.05) v.play().catch(() => {});
      }
    }
  }

  let curT = 0;
  const sx = (r) => app.plot().x + app.px(r);
  const sy = (m) => app.plot().y + app.py(m);

  // callout label fade: 0 = every chart label shown, 1 = only the highlighted objects'
  const grown = new Map(); // spotlit pictures grown, by name → factor
  let nearbyOn = false;    // a `nearby` close-up is on (catalogue names shown)
  let labelFade = 0, labelFadeT = null, labelFadeSent = 0, labelFocusNames = [], labelFocusKey = "";
  function drawHighlights(t) {
    applyIcons(t);
    applyDensity(t);
    applyFocus(t);
    applyLabels(t);
    applyOverlays(t);
    applySwap(t);
    drawPops(t);
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
    // axis highlights and full-screen cards stay unclipped, over the classic figure too
    join(gHlFree, live.filter(h => h.axis || h.card)).each(function (h) {
      const el = d3.select(this);
      el.selectAll("*").remove();
      const age = t - h.t0;
      if (h.card) { el.attr("opacity", 1); drawCard(el, h, age, fr); return; }
      el.attr("opacity", smooth(age / 0.45) * (1 - smooth((t - h.t1) / 0.5)));
      drawAxis(el, h, age, fr);
    });
    swellAxisNumbers(fr ? axisHls : [], t);
    // a sketched dive's picture fades once its outline is drawn, so the later drawings stand
    // alone, and comes back after the last one
    if (dollyOn) {
      const sk = highlights.filter(h => h.sketch), first = sk[0], last = sk[sk.length - 1];
      const f = first ? smooth((t - first.t0 - (first.draw ?? 0.9) - 0.2) / 0.6) * (1 - smooth((t - last.t1) / 0.5)) : 0;
      app.setDollyOpacity?.(1 - f);
    }
    // line drawings over a picture (a dive's): in their own layer, which doesn't dim with the chart
    join(gSketch, live.filter(h => h.sketch)).each(function (h) {
      const el = d3.select(this);
      el.selectAll("*").remove();
      // one level hands straight over to the next (same towers, same places); only the
      // first fades in and the last fades out
      const next = highlights.some(q => q.sketch === h.sketch && Math.abs(q.t0 - h.t1) < 0.05);
      const prev = highlights.some(q => q.sketch === h.sketch && Math.abs(q.t1 - h.t0) < 0.05);
      el.attr("opacity", (prev ? 1 : smooth((t - h.t0) / 0.3)) * (next ? (t < h.t1 ? 1 : 0) : 1 - smooth((t - h.t1) / 0.6)));
      drawSketch(el, h, t - h.t0);
    });
    drawTraces(t);
    join(gHl, live.filter(h => !h.axis && !h.card && !h.sketch && !isTrace(h))).each(function (h) {
      const el = d3.select(this);
      el.selectAll("*").remove();
      const age = t - h.t0;
      let op = smooth(age / 0.45) * (1 - smooth((t - h.t1) / 0.5));
      // a dying star handing over to its split: the swing stops dead at the hand-over and
      // the split starts at full strength from the same spot (a cross-fade showed two
      // stars, one still moving, which read as a jump)
      if (h.split) op = t >= h.t0 ? 1 - smooth((t - h.t1) / 0.5) : 0;
      else if (h.swing && h.core && t >= h.t1 && highlights.some(q => q.split && Math.abs(q.t0 - h.t1) < 0.05)) op = 0;
      // a lit path named again by the next cue hands straight over, no fade between them
      if (h.path) {
        if (h.since < h.t0 - 0.01) op = t >= h.t0 ? 1 - smooth((t - h.t1) / 0.5) : 0;
        if (t >= h.t1 && highlights.some(q => q !== h && q.path && q.since === h.since && q.t0 > h.t0)) op = 0;
      }
      el.attr("opacity", op);
      h.op = op;
      if (h.obj) drawObj(el, h, age);
      else if (h.spot) drawSpot(el, h, age);
      else if (h.line) drawLine(el, LINES[h.line], h, age);
      else if (h.density != null) drawLine(el, { pts: densitySegment(h.density), color: "#ffab40" }, h, age);
      else if (h.trend) drawLine(el, { pts: h.trend, color: h.color || "#ffd54f" }, h, age);   // a trend line: [[r, m], …]
      else if (h.side) drawSide(el, h);
      else if (h.arrow) drawArrow(el, h, age);
      else if (h.swing) drawSwing(el, h, age);
      else if (h.split) drawSplit(el, h, age);
      else if (h.poly) drawPoly(el, h, age);
      else if (h.title) drawTitle(el, h, age);
      else if (h.mark) drawMark(el, h, age);
      else if (h.dust) drawDustCat(el, h, age);
      else if (h.ellipse) drawEllipse(el, h, age);
      else if (h.window) drawWindow(el, h, age);
      else if (h.cross) drawCross(el, h, t - (h.since ?? h.t0));
      else if (h.text) drawText(el, h, age);
      else if (h.pic) drawPic(el, h, age);
      else if (h.clip) drawClipHl(h, t);
      else if (h.fly) drawFly(el, h, age);
      else if (h.pixels) drawPixels(el, h, age);
      else if (h.key) drawKey(el, h, age);
      else if (h.path) drawPath(el, h, age);
    });
    // While a callout is on screen, the chart's other labels step back: only the
    // highlighted objects keep theirs (the rest come back between callouts).
    // Catalogue dots the scene points at show their pictures (boats, the Eiffel
    // Tower…); a spotlight grows its object's picture as a hover would.
    const named = [...live.flatMap(h => [h.obj, h.spot]), ...traceRuns.filter(r => t >= r.t0 - 0.01 && t < r.t1 + TRACE_OUT + 0.1).map(r => r.name)]
      .filter(n => n && objByName.get(n)?.dust);
    app.setDustPictures?.(named.length ? [...new Set(named)] : null);
    // grown pictures: a spotlight's (by its factor), and an object's only when its cue asks
    // (`grow`); a named object gets a halo instead (drawHalos)
    const grows = new Map(live.filter(h => h.obj && h.grow && t >= h.t0 && t < h.t1).map(h => [h.obj, h.grow]));
    for (const h of live) if (h.spot && t < h.t1) grows.set(h.spot, h.grow ?? 2.2);
    // (only marked done once the picture is there to grow, so a late picture still grows)
    for (const [n, k] of grows) if (grown.get(n) !== k && app.growIcon?.(n, k)) grown.set(n, k);
    for (const n of [...grown.keys()]) if (!grows.has(n)) { grown.delete(n); app.growIcon?.(n, 1); }
    // The fade follows the narration clock (0.5 s), so the renderer's frames match playback.
    dropClips(live);
    drawHalos(live, t);
    drawGuides(live, t);
    app.drawUnderLines?.(underLines.splice(0), underDots.splice(0));
    app.setDotBoost?.(pathBoosts.splice(0));
    // a close-up cue with `nearby: true` keeps its surroundings named: no fade, catalogue names on
    const hlNow = hlCues.filter(c => c.time <= t).at(-1);
    const nearby = !!hlNow?.nearby;
    if (nearby !== nearbyOn) { nearbyOn = nearby; app.setDustLabels?.(nearby); }
    const callout = !nearby && (!gHl.select("text").empty() || !gHlFree.select("text").empty());
    if (callout) labelFocusNames = live.filter(h => h.obj).map(h => h.obj);
    const dt = labelFadeT == null ? Infinity : Math.abs(t - labelFadeT);
    labelFadeT = t;
    const target = callout ? 1 : 0;
    labelFade = dt > 1 ? target : labelFade + Math.sign(target - labelFade) * Math.min(Math.abs(target - labelFade), dt / 0.5);
    const amount = smooth(labelFade);
    if (Math.abs(amount - labelFadeSent) > 0.002 || labelFocusNames.join("|") !== labelFocusKey) {
      labelFadeSent = amount; labelFocusKey = labelFocusNames.join("|");
      app.setLabelFocus?.(amount > 0.001 ? labelFocusNames : null, amount);
    }
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
  /** One object in the spotlight: { spot: name, grow?: 2.2, dim?: 0.6 } — its
   *  picture grows as on hover and everything around it dims. */
  function drawSpot(el, h, age) {
    const o = objByName.get(h.spot);
    if (!o) return;
    const x = sx(o.logR), y = sy(o.logM);
    const SW = layer.clientWidth, SH = layer.clientHeight;
    const hole = ((app.iconRadius?.(h.spot) || 20) * (h.grow ?? 2.2)) * 1.1 + 12;
    const far = Math.hypot(Math.max(x, SW - x), Math.max(y, SH - y)) + 10;
    const id = `narr-spot-${h.id}`;
    const g = el.append("radialGradient").attr("id", id).attr("gradientUnits", "userSpaceOnUse")
      .attr("cx", x).attr("cy", y).attr("r", far);
    g.append("stop").attr("offset", 0).attr("stop-color", "#05051a").attr("stop-opacity", 0);
    g.append("stop").attr("offset", hole / far).attr("stop-color", "#05051a").attr("stop-opacity", 0);
    g.append("stop").attr("offset", Math.min(1, (hole + 60) / far)).attr("stop-color", "#05051a").attr("stop-opacity", h.dim ?? 0.6);
    g.append("stop").attr("offset", 1).attr("stop-color", "#05051a").attr("stop-opacity", h.dim ?? 0.6);
    el.append("rect").attr("x", 0).attr("y", 0).attr("width", SW).attr("height", SH)
      .attr("fill", `url(#${id})`).attr("opacity", smooth(age / 0.8));
  }
  const bare = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  function ownLabelShown(o, label) {
    const t = [...document.querySelectorAll("#chart text.obj-label")].find(n => n.__data__?.name === o.name);
    return !!t && bare(t.textContent) === bare(label) && t.getAttribute("display") !== "none";
  }
  function drawObj(el, h, age) {
    const o = objByName.get(h.obj);
    if (!o) return;
    const x = sx(o.logR), y = sy(o.logM);
    const col = h.color || objColor(o);
    const pop = 0.6 + 0.4 * d3.easeBackOut(clamp01(age / 0.5));
    // 1.5× the old 17 px default, and always clear of the object's own picture
    // The object itself is marked by its halo (drawHalos); this only places the tag.
    const box = app.iconRect?.(h.obj);
    let R;
    if (box) {
      const lr = layer.getBoundingClientRect(), scl = lr.width / layer.clientWidth;
      R = Math.max(box.w, box.h) / scl / 2 * 0.85 + 2;
    } else R = (h.r || 17) * 1.5 * pop;
    if (h.label === false) return;
    const label = (h.label || o.name).toUpperCase();
    // no tag that only repeats the object's own label on the chart, while that shows
    if (ownLabelShown(o, label)) return;
    // default: centred above the ring, clear of the app's own label (right)
    const place = h.place || "above";
    const tx = place === "left" ? x - R - 8 : place === "right" ? x + R + 8 : x;
    const ty = place === "below" ? y + R + 18 : place === "above" ? y - R - 9 : y + 4;
    const anchor = place === "left" ? "end" : place === "right" ? "start" : "middle";
    el.append("text").attr("class", "narr-tag").attr("x", tx).attr("y", ty)
      .attr("text-anchor", anchor).attr("fill", col).text(label);
  }
  /** A line drawing over an object's picture: { sketch: name, level: 0–2, draw?: s (0.9) },
   *  drawn as the Eiffel Tower's, traced from its picture (shares of the picture's square):
   *  level 0 the outline, the legs' outer curve (the envelope the chart measures it by);
   *  1 adds the arch under the first floor and the opening between the first and second
   *  floors; 2 fills what's left with the lattice, cross-braced panels: the fractal. */
  const EIFFEL = {
    // the outer curve, platforms left out: [height, half width]
    prof: [[0.033, 0.004], [0.1, 0.013], [0.2, 0.031], [0.3, 0.036], [0.4, 0.047], [0.5, 0.064],
      [0.6, 0.095], [0.675, 0.125], [0.8, 0.19], [0.85, 0.222], [0.9, 0.251], [0.966, 0.296]],
    arch: { c: [0.5, 0.966], r: 0.16 },
    gap: [[0.474, 0.605], [0.526, 0.605], [0.547, 0.69], [0.453, 0.69]],
  };
  // tower i of the row, as drawn: 0 the outline, 1 carved, 2 the lattice
  function towerPath(level, M) {
    const P = ([u, v]) => { const [x, y] = M(u, v); return `${x.toFixed(1)},${y.toFixed(1)}`; };
    const { prof, arch, gap } = EIFFEL;
    const half = (v) => {
      if (v <= prof[0][0]) return prof[0][1];
      for (let i = 1; i < prof.length; i++) if (v <= prof[i][0]) {
        const [v0, w0] = prof[i - 1], [v1, w1] = prof[i];
        return w0 + (w1 - w0) * (v - v0) / (v1 - v0);
      }
      return prof[prof.length - 1][1];
    };
    const outline = [...prof.slice().reverse().map(([v, w]) => [0.5 - w, v]), ...prof.slice(1).map(([v, w]) => [0.5 + w, v])];
    const d = d3.line().x(p => M(p[0], p[1])[0]).y(p => M(p[0], p[1])[1]).curve(d3.curveCatmullRom.alpha(0.5))(outline) + "Z";
    const inGap = ([u, v]) => v > gap[0][1] && v < gap[2][1] && (() => {
      const f = (v - gap[0][1]) / (gap[2][1] - gap[0][1]);
      return u > gap[0][0] + (gap[3][0] - gap[0][0]) * f && u < gap[1][0] + (gap[2][0] - gap[1][0]) * f;
    })();
    const inArch = ([u, v]) => v < arch.c[1] && Math.hypot(u - arch.c[0], v - arch.c[1]) < arch.r;
    let holes = "", lattice = "";
    if (level >= 1) {
      const [x0] = M(arch.c[0] - arch.r, arch.c[1]), [x1] = M(arch.c[0] + arch.r, arch.c[1]), r = ((x1 - x0) / 2).toFixed(1);
      holes += `M${P([arch.c[0] - arch.r, arch.c[1]])}A${r},${r} 0 0 1 ${P([arch.c[0] + arch.r, arch.c[1]])}`;
      holes += `M${gap.map(P).join("L")}Z`;
    }
    if (level >= 2) {
      // bands up the tower, each cut into panels about as wide as they're tall, each with
      // its X brace; the arch and the opening left open
      const top = 0.1, bottom = prof[prof.length - 1][0], rows = 16;
      for (let i = 0; i < rows; i++) {
        const v0 = bottom - (bottom - top) * i / rows, v1 = bottom - (bottom - top) * (i + 1) / rows;
        const n = Math.max(1, Math.round(half((v0 + v1) / 2) * 2 / (v0 - v1)));
        for (let j = 0; j < n; j++) {
          const q = [[0.5 - half(v0) + 2 * half(v0) * j / n, v0], [0.5 - half(v0) + 2 * half(v0) * (j + 1) / n, v0],
            [0.5 - half(v1) + 2 * half(v1) * (j + 1) / n, v1], [0.5 - half(v1) + 2 * half(v1) * j / n, v1]];
          const c = [(q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, (v0 + v1) / 2];
          if (inArch(c) || inGap(c)) continue;
          lattice += `M${q.map(P).join("L")}ZM${P(q[0])}L${P(q[2])}M${P(q[1])}L${P(q[3])}`;
        }
      }
    }
    return { outline: d, holes, lattice };
  }
  /** The tower's steps side by side: { sketch: name, level: 0–2, draw?: s, labels: [[volume,
   *  density], …] }. Level n shows n + 1 towers in a row, the outline, carved, the lattice;
   *  going up a level, the row slides apart and the new tower splits off the last one and
   *  draws in. Placed on the dive's visible picture, a little smaller as the row grows. */
  function drawSketch(el, h, age) {
    // over a dive, the visible copy of the picture (the original stays put, hidden, smaller)
    const box = (dollyOn && app.dollyRect?.()) || app.iconRect?.(h.sketch);
    if (!box) return;
    const lr = layer.getBoundingClientRect(), scl = lr.width / layer.clientWidth;
    const X = (u) => (box.x - lr.x + u * box.w) / scl, Y = (v) => (box.y - lr.y + v * box.h) / scl;
    const L = h.level || 0, n = L + 1, W = layer.clientWidth;
    const size = (m) => [1, 0.82, 0.68][m - 1] ?? 0.68;
    const gapPx = (m) => Math.min(W / 3.1, box.w / scl * 0.85);
    const slot = (i, m) => (i - (m - 1) / 2) * gapPx(m);
    const slide = d3.easeCubicInOut(clamp01(age / 0.8));
    const cx = X(0.5), baseY = Y(0.966);
    for (let i = 0; i < n; i++) {
      // where it starts: its place in the row before (the new one, at the last tower's)
      const from = L === 0 ? 0 : slot(Math.min(i, L - 1), L), to = slot(i, n);
      const dx = from + (to - from) * slide;
      const s = L === 0 ? 1 : size(L) + (size(n) - size(L)) * slide;
      const M = (u, v) => [cx + (X(u) - cx) * s + dx, baseY - (baseY - Y(v)) * s];
      const { outline, holes, lattice } = towerPath(i, M);
      const fresh = i === L, k = fresh ? d3.easeCubicOut(clamp01(age / (h.draw ?? 0.9))) : 1;
      const g = el.append("g");
      [[outline + holes, 6, 0.16], [outline + holes, 1.3, 0.95], [lattice, 0.8, 0.7]].forEach(([path, w, o]) => path && g.append("path")
        .attr("d", path).attr("fill", "none").attr("stroke", "#fff").attr("stroke-width", w).attr("opacity", o)
        .attr("stroke-linejoin", "round").attr("pathLength", 1).attr("stroke-dasharray", `${k} 1`));
      const lab = h.labels?.[i];
      if (lab) {
        const a = fresh ? clamp01((age - 0.5) / 0.5) : 1, tx = cx + dx, ty = baseY + 22;
        g.append("text").attr("class", "narr-sketch-num").attr("x", tx).attr("y", ty).attr("text-anchor", "middle").attr("opacity", a).text(lab[0]);
        if (lab[1]) g.append("text").attr("class", "narr-sketch-sub").attr("x", tx).attr("y", ty + 17).attr("text-anchor", "middle").attr("opacity", a).text(lab[1]);
      }
    }
  }
  // ---------- traces: a close-up on one picture, its outline drawn, then copies of the outline
  // moved to where other ways of measuring the same thing would put it on the chart ----------
  // hl: { trace: name, step, grow?: × (2.4), shapes: [{ at?: { rho: g/cm³ } | { r: log cm },
  //   holes?: true, lattice?: true, label?: [line, smaller line], place?: "above"|"below"|"left"|"right" }, …],
  //   draw?: s (1.2), move?: s (1.3), isolate?: true }
  // Consecutive cues with the same `trace` are one run, each cue the next step:
  //   step -1  the close-up: every other chart element fades but the grid, the density
  //            diagonals and the catalogue dots (app.setIsolate), and the picture grows to `grow`;
  //   step 0   shape 0's outline is traced over the picture (from the picture's own alpha:
  //            its outer edge, plus its big openings with `holes`), then the picture fades out;
  //   step n   a faint copy of shape n − 1 slides to shape n's place (same mass, the size its
  //            measure gives: `at.rho`, a bulk density, or `at.r`), lands, draws its holes or
  //            the lattice (`lattice`: the Eiffel Tower's, see towerPath), and its label shows.
  // A cue's `grow` changes the size of every outline (and the picture) from that step on.
  // After the run everything fades back over TRACE_OUT s (the picture first comes back).
  // Video 2's Eiffel Tower (src/narration-scenes/short-02-up-the-line.js).
  const TRACE_IN = 0.9, TRACE_OUT = 0.9;
  const traceShapes = new Map();   // name → { im, outer?, holes?, failed? }
  /** The picture's outline from its alpha channel (shares of its square), or null while it loads. */
  function traceShape(name) {
    let s = traceShapes.get(name);
    if (s) return s.outer ? s : null;
    const href = app.iconHref?.(name);
    if (!href) return null;
    s = { im: new Image() };
    traceShapes.set(name, s);
    s.im.onload = () => {
      try {
        const N = 128, cv = document.createElement("canvas");
        cv.width = cv.height = N;
        const g = cv.getContext("2d", { willReadFrequently: true }), im = s.im;
        const k = Math.min(N / im.naturalWidth, N / im.naturalHeight), w = im.naturalWidth * k, h = im.naturalHeight * k;
        g.drawImage(im, (N - w) / 2, (N - h) / 2, w, h);
        const a = g.getImageData(0, 0, N, N).data, T = 110;
        // the envelope: each row filled from its first opaque pixel to its last (the arch and
        // the openings closed, the edges kept soft); the openings: what's clear inside it
        const env = new Float64Array(N * N), open = new Float64Array(N * N);
        for (let y = 0; y < N; y++) {
          let x0 = N, x1 = -1;
          for (let x = 0; x < N; x++) if (a[(y * N + x) * 4 + 3] > T) { x0 = Math.min(x0, x); x1 = x; }
          for (let x = 0; x < N; x++) {
            const al = a[(y * N + x) * 4 + 3], inside = x > x0 && x < x1;
            env[y * N + x] = inside ? 255 : al;
            open[y * N + x] = inside ? 255 - al : 0;
          }
        }
        const norm = (ring) => ring.slice(0, -1).map(([x, y]) => [x / N, y / N]);
        const [mp] = d3.contours().size([N, N]).thresholds([T])(env);
        let best = null, bestA = 0;
        for (const poly of mp.coordinates) { const A = Math.abs(d3.polygonArea(poly[0])); if (A > bestA) { bestA = A; best = poly; } }
        // traced from its tip (the topmost point) round
        const outer = norm(best[0]), top = outer.reduce((j, p, i) => p[1] < outer[j][1] ? i : j, 0);
        s.outer = [...outer.slice(top), ...outer.slice(0, top)];
        const [mh] = d3.contours().size([N, N]).thresholds([255 - T])(open);
        s.holes = mh.coordinates.map(poly => poly[0]).filter(r => Math.abs(d3.polygonArea(r)) > 0.002 * N * N).map(norm);
        s.top = d3.min(s.outer, p => p[1]); s.bottom = d3.max(s.outer, p => p[1]);
        s.left = d3.min(s.outer, p => p[0]); s.right = d3.max(s.outer, p => p[0]);
      } catch (e) { s.failed = true; console.warn("[narration] trace", name, e); }
    };
    s.im.onerror = () => { s.failed = true; };
    s.im.src = href;
    return null;
  }
  const tracesPending = () => [...traceShapes.values()].filter(s => !s.outer && !s.failed).length;
  const traceOn = new Set();   // runs whose picture is grown or faded now
  /** One run's state at t: the step on screen, how far in, the picture's growth and opacity. */
  function traceState(run, t) {
    const items = run.items;
    let i = items.length - 1;
    while (i > 0 && items[i].t0 > t) i--;
    const it = items[i], gOf = (j) => items[j].grow ?? (j > 0 ? gOf(j - 1) : 2.4);
    const gNow = gOf(i), gPrev = i ? gOf(i - 1) : 1;
    const out = smooth((t - run.t1) / TRACE_OUT);
    let grow = gPrev + (gNow - gPrev) * d3.easeCubicInOut(clamp01((t - it.t0) / TRACE_IN));
    grow += (1 - grow) * out;
    const iso = smooth((t - run.t0) / TRACE_IN) * (1 - out);
    // the picture fades once the first outline is drawn, and comes back as the outlines go
    const first = items.find(h => (h.step ?? 0) >= 0);
    const gone = first ? smooth((t - first.t0 - (first.draw ?? 1.2) - 0.2) / 0.6) : 0;
    return { it, grow, iso, icon: 1 - gone * (1 - smooth((t - run.t1) / (TRACE_OUT * 0.7))), fade: 1 - out };
  }
  const gTrace = gSketch.append("g").attr("class", "narr-trace");
  function drawTraces(t) {
    gTrace.selectAll("*").remove();
    for (const run of traceRuns) {
      const live = t >= run.t0 - 0.01 && t < run.t1 + TRACE_OUT;
      if (run.t0 - 8 < t && t < run.t1) traceShape(run.name);   // load the outline before it's needed
      if (!live) {
        if (traceOn.has(run)) { traceOn.delete(run); app.setIsolate?.(0); app.growIcon?.(run.name, 1, true); }
        continue;
      }
      traceOn.add(run);
      const st = traceState(run, t), h = st.it;
      if (h.isolate !== false) app.setIsolate?.(st.iso, run.name, st.icon);
      app.growIcon?.(run.name, st.grow, true);
      const o = objByName.get(run.name), shape = traceShape(run.name), box = app.iconRect?.(run.name);
      const step = h.step ?? 0;
      if (!o || !shape || !box || step < 0) continue;
      const lr = layer.getBoundingClientRect(), scl = lr.width / layer.clientWidth;
      const w = box.w / scl, hh = box.h / scl;
      // copies keep the picture's offset from its dot (its parallax), at their own size
      const dx = (box.x - lr.x) / scl + w / 2 - sx(o.logR), dy = (box.y - lr.y) / scl + hh / 2 - sy(o.logM);
      const shapes = h.shapes || [{}];
      const rOf = (sh) => sh?.at?.r ?? (sh?.at?.rho != null ? (o.logM - DENSITY_SPHERE_C - Math.log10(sh.at.rho)) / 3 : o.logR);
      const g = gTrace.append("g").attr("opacity", st.fade.toFixed(3));
      const age = t - h.t0, mv = h.move ?? 1.3, dr = h.draw ?? 1.2;
      for (let i = 0; i <= Math.min(step, shapes.length - 1); i++) {
        const sh = shapes[i], fresh = i === step;
        // the new copy slides over from the one before it (faint), then draws in
        const u = fresh && i > 0 ? d3.easeCubicInOut(clamp01(age / mv)) : 1;
        const r = i > 0 ? rOf(shapes[i - 1]) + (rOf(sh) - rOf(shapes[i - 1])) * u : rOf(sh);
        const cx = sx(r) + dx, cy = sy(o.logM) + dy;
        const M = (pu, pv) => [cx + (pu - 0.5) * w, cy + (pv - 0.5) * hh];
        const P = (ring) => "M" + ring.map(p => M(p[0], p[1]).map(v => v.toFixed(1)).join(",")).join("L") + "Z";
        const landed = fresh ? (i === 0 ? 0 : mv) : -1e9;
        const kOut = fresh && i === 0 ? d3.easeCubicInOut(clamp01(age / dr)) : 1;   // the first outline traces in
        const kIn = d3.easeCubicOut(clamp01((age - landed) / dr));               // then the holes or lattice
        const ghost = fresh && i > 0 ? 0.45 + 0.55 * smooth((age - mv * 0.8) / 0.4) : 1;
        const sg = g.append("g").attr("opacity", ghost.toFixed(3));
        const stroke = (d, wd, op, k) => d && sg.append("path").attr("d", d).attr("fill", "none").attr("stroke", "#fff")
          .attr("stroke-width", wd).attr("opacity", op).attr("stroke-linejoin", "round")
          .attr("pathLength", 1).attr("stroke-dasharray", `${k.toFixed(4)} 1`);
        const outline = P(shape.outer);
        stroke(outline, 6, 0.16, kOut); stroke(outline, 1.6, 0.95, kOut);
        if (sh.holes && shape.holes.length) { const d = shape.holes.map(P).join(""); stroke(d, 5, 0.14, kIn); stroke(d, 1.3, 0.9, kIn); }
        if (sh.lattice) stroke(towerPath(2, M).lattice, 0.8, 0.7, kIn);
        if (sh.label) {
          const a = fresh ? clamp01((age - Math.max(landed, i ? 0 : dr) - 0.2) / 0.5) : 1, place = sh.place || "below";
          const [x0, yTop] = M(0.5, shape.top), [, yBot] = M(0.5, shape.bottom), [xL] = M(shape.left, 0.5), [xR] = M(shape.right, 0.5);
          const side = place === "left" || place === "right";
          const tx = place === "left" ? xL - 8 : place === "right" ? xR + 8 : x0;
          const ty = place === "above" ? yTop - 8 - (sh.label[1] ? 17 : 0) : place === "below" ? yBot + 22 : cy - (sh.label[1] ? 4 : -5);
          const anchor = place === "left" ? "end" : place === "right" ? "start" : "middle";
          g.append("text").attr("class", "narr-sketch-num").attr("x", tx).attr("y", ty).attr("text-anchor", anchor).attr("opacity", a).text(sh.label[0]);
          if (sh.label[1]) g.append("text").attr("class", "narr-sketch-sub").attr("x", tx).attr("y", ty + 17)
            .attr("text-anchor", side ? anchor : "middle").attr("opacity", a).text(sh.label[1]);
        }
      }
    }
  }
  /** Every object being named gets a light blue halo behind its picture (like a
   *  star's wall glow, stronger), from its first mention: on in 0.5 s, held to
   *  HALO_HOLD, then fading over HALO_FADE, or sooner when its highlight ends. */
  const HALO_HOLD = 2.5, HALO_FADE = 1.5;
  function drawHalos(live, t) {
    const lr = layer.getBoundingClientRect(), scl = lr.width / layer.clientWidth, pl = app.plot();
    const halos = new Map();
    for (const h of live) {
      const o = h.obj && objByName.get(h.obj);
      if (!o || h.halo === false || t < h.t0) continue;
      const a = smooth((t - h.since) / 0.5) * (1 - smooth((t - h.since - HALO_HOLD) / HALO_FADE)) * (1 - smooth((t - h.t1) / 0.5));
      if (a <= 0.005 || (halos.get(h.obj)?.opacity ?? 0) >= a) continue;
      const box = app.iconRect?.(h.obj);
      const x = box ? (box.x + box.w / 2 - lr.x) / scl : sx(o.logR), y = box ? (box.y + box.h / 2 - lr.y) / scl : sy(o.logM);
      const r = box ? Math.max(box.w, box.h) / scl * 0.95 + 10 : 30;
      halos.set(h.obj, { x: x - pl.x, y: y - pl.y, r, opacity: a });
    }
    app.drawHalos?.([...halos.values()]);
  }
  /** When a single object is being named: dashed guides out to the mass ruler
   *  (right) and the size ruler (bottom), drawn in the chart under its picture so
   *  they seem to leave its centre, and its mass and diameter written at the rulers. */
  function drawGuides(live, t) {
    const on = live.filter(h => h.obj && t >= h.t0 && t < h.t1);
    const cur = new Set(on.map(h => h.obj)).size === 1 ? on.filter(h => h.label !== false).at(-1) : null;
    const o = cur && objByName.get(cur.obj);
    gGuides.selectAll("*").remove();
    if (!o) { app.drawGuides?.([]); return; }
    const SW = layer.clientWidth, SH = layer.clientHeight, pl = app.plot();
    const x = sx(o.logR), y = sy(o.logM), xR = massAxisX(SW) - 2, yB = SH * (SCENE.rulerY ?? RULER_Y) - 10;
    const age = t - cur.since, k = d3.easeCubicOut(clamp01(age / 0.7));
    const op = 0.55 * smooth(age / 0.4) * (1 - smooth((t - cur.t1 + 0.4) / 0.4));
    const L = (x2, y2) => ({ x1: x - pl.x, y1: y - pl.y, x2: x - pl.x + (x2 - x) * k, y2: y - pl.y + (y2 - y) * k, color: "#e8ecff", opacity: op });
    app.drawGuides?.([L(xR, y), L(x, yB)]);
    const a = clamp01((age - 0.5) / 0.4) * (1 - smooth((t - cur.t1 + 0.4) / 0.4));
    if (a <= 0.01) return;
    gGuides.append("text").attr("class", "narr-guide").attr("x", xR - 4).attr("y", y - 6).attr("text-anchor", "end")
      .attr("opacity", a).text(o.logM < ENERGY_BELOW ? `${valueLabel(o.logM + EV_PER_G, ENERGY_BASES)}/c²` : valueLabel(o.logM, MASS_BASES));
    gGuides.append("text").attr("class", "narr-guide").attr("x", x + 6).attr("y", yB - 6).attr("text-anchor", "start")
      .attr("opacity", a).text(valueLabel(o.logR + W_OFF, SIZE_BASES));
  }
  /** "70 kg", "1.7 m": two significant figures in the ruler's units. */
  function valueLabel(v, bases) {
    const d = Math.floor(v + 1e-9);
    let base = bases[0];
    for (const b of bases) if (b[0] <= d) base = b;
    const e = d - base[0], mant = +(10 ** (v - d)).toPrecision(2);
    if (e > 5) return `${mant}×10${SUP(e)} ${base[1]}`;
    return `${(+(mant * 10 ** e).toPrecision(2)).toLocaleString("en-US")} ${base[1]}`;
  }
  function linePath(pts) {
    return pts.map(([r, m]) => [sx(r), sy(m)]);
  }
  const underLines = [];   // the water line's strokes for under the pictures, this frame
  const underDots = [];    // dots drawn with the under-lines
  const pathBoosts = [];   // lit paths whose own moving dots grow, this frame
  function drawLine(el, L, h, age) {
    if (!L || !L.pts.length) return;
    const p = linePath(L.pts);
    let len = 0;
    for (let i = 1; i < p.length; i++) len += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    const prog = d3.easeCubicOut(clamp01(age / (h.draw ?? 1.3)));
    const d = "M" + p.map(q => q.join(",")).join("L");
    const col = h.color || L.color;
    const strokes = [[12, 0.12], [6, 0.25], [2.4, 1]];
    const dash = `${len * prog} ${len + 10}`;
    // the water line: over the pictures only while its first mention glows
    const glow = h.line !== "water" ? 1 : h.since === firstWater ? 1 - smooth((curT - h.since - WATER_GLOW) / 0.6) : 0;
    if (h.line === "water") {
      const pl = app.plot(), dl = "M" + p.map(([x, y]) => `${x - pl.x},${y - pl.y}`).join("L");
      if (glow < 1) strokes.forEach(([w, o]) => underLines.push({ d: dl, color: col, width: w, opacity: o * (1 - glow) * (h.op ?? 1), dash }));
    }
    const thick = h.line === "water" ? 1.6 : 1;
    if (glow > 0.001) strokes.forEach(([w, o]) => {
      el.append("path").attr("d", d).attr("fill", "none").attr("stroke", col)
        .attr("stroke-width", w * thick).attr("opacity", o * glow).attr("stroke-linecap", "round")
        .attr("stroke-dasharray", dash);
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
  /** A connection path lit up: { path: "DNA" | id | [ids or wholes], label?, color? } —
   *  every moving-dot path with that id, or building that whole (the paths from DNA's four
   *  bases into DNA; a star's life, "stellar-high-mass"), drawn on as a glowing line under
   *  the pictures, with bright dots streaming along it the way the chart's own dots go. */
  function drawPath(el, h, age) {
    const pl = app.plot(), prog = d3.easeCubicOut(clamp01((curT - (h.since ?? h.t0)) / (h.draw ?? 1.2)));
    const list = app.connPaths?.(h.path) || [];
    // a path name that matches nothing shows with the missed cues (window.__narrMissing)
    if (!list.length && app.connPaths && Array.isArray(window.__narrMissing) && !window.__narrMissing.includes("path " + h.path))
      window.__narrMissing.push("path " + h.path);
    // `from` / `to` (object names): only the stretch of the path between them
    const near = (pts, name, i0 = 0) => {
      const o = objByName.get(name);
      if (!o) return -1;
      const X = sx(o.logR) - pl.x, Y = sy(o.logM) - pl.y;
      let best = -1, bd = Infinity;
      for (let i = i0; i < pts.length; i++) { const dd = Math.hypot(pts[i][0] - X, pts[i][1] - Y); if (dd < bd) { bd = dd; best = i; } }
      return best;
    };
    for (const cp of list) {
      if (h.from || h.to) {
        const i0 = h.from ? Math.max(0, near(cp.pts, h.from)) : 0;
        const i1 = h.to ? near(cp.pts, h.to, i0) : cp.pts.length - 1;
        const n = cp.pts.length - 1, j1 = i1 < 0 ? n : i1;
        cp.pts = cp.pts.slice(i0, j1 + 1);
        cp.t0 = i0 / n; cp.t1 = j1 / n;
      }
      const p = cp.pts.map(([x, y]) => [x + pl.x, y + pl.y]);
      const cum = [0];
      for (let i = 1; i < p.length; i++) cum.push(cum[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
      const len = cum.at(-1);
      if (len < 4) continue;
      const rgb = h.color || (cp.family === "spectrum" ? "#ffffff"
        : (cp.color || "#fff").replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, "rgb($1,$2,$3)"));
      const dash = `${len * prog} ${len + 10}`;
      const dl = "M" + cp.pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L");
      // the line glows like a named object's halo (blurred lavender, overlay), the path's
      // own colour over it (author, 2026-10-28: "highlight them more")
      // (discreet, like the objects' halos: the author, 2026-10-29)
      underLines.push({ d: dl, color: "#e4dcff", width: 16, opacity: 0.55 * (h.op ?? 1), dash, halo: true });
      // (the glow does the work: the line itself at 10%, the author, 2026-10-29)
      [[1.4, 0.1]].forEach(([w, o]) =>
        underLines.push({ d: dl, color: rgb, width: w, opacity: o * (h.op ?? 1), dash }));
      const at = (s) => {
        let i = d3.bisectLeft(cum, s);
        i = Math.max(1, Math.min(p.length - 1, i));
        const f = (s - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
        return [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * f, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * f];
      };
      // the chart's own dots on it, bigger and brighter (the author, 2026-10-29: evenly
      // spaced dots of our own made it a subway line; the natural ones stay natural)
      pathBoosts.push({ idx: cp.idx, t0: cp.t0, t1: cp.t1, k: 1 + 2 * (h.op ?? 1) * prog });
      if (h.label && cp === list[0]) {
        const [x, y] = at(len / 2);
        el.append("text").attr("class", "narr-tag").attr("x", x + 10).attr("y", y).attr("fill", rgb).attr("opacity", prog)
          .text(h.label.toUpperCase());
      }
    }
  }
  function clipMid(p, plot) {
    // middle of the line segment that is on screen (first→last vertex), inside the band
    // the labels keep to. Clipped exactly (Liang–Barsky), so the label slides with the
    // camera: sampling the whole line in steps made it hop once zoomed in
    const [a, b] = [p[0], p[p.length - 1]], dx = b[0] - a[0], dy = b[1] - a[1];
    const x0 = plot.x + 30, x1 = plot.x + plot.w - 30, y0 = plot.y + plot.h * 0.18, y1 = plot.y + plot.h * 0.7;
    let lo = 0, hi = 1;
    for (const [q, r] of [[-dx, a[0] - x0], [dx, x1 - a[0]], [-dy, a[1] - y0], [dy, y1 - a[1]]]) {
      if (q === 0) { if (r < 0) { lo = 1; hi = 0; } continue; }
      const u = r / q;
      if (q < 0) lo = Math.max(lo, u); else hi = Math.min(hi, u);
    }
    const u = lo <= hi ? (lo + hi) / 2 : 0.5;
    return [a[0] + dx * u, a[1] + dy * u];
  }
  function drawSide(el, h) {
    if (h.mass != null) return drawMassSide(el, h);
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
  /** One side of a level of constant mass, across the screen: { side: "above"|"below",
   *  mass: logM, label? }, shaded like the water line's sides, with the level drawn
   *  as a line and the label just off it on that side. */
  function drawMassSide(el, h, age) {
    const plot = app.plot(), y = sy(h.mass), up = h.side === "above";
    const col = h.color || (up ? "#4fc3f7" : "#ffab40");
    const y2 = up ? plot.y : plot.y + plot.h;
    el.append("rect").attr("x", plot.x).attr("width", plot.w).attr("y", Math.min(y, y2))
      .attr("height", Math.abs(y2 - y)).attr("fill", col).attr("opacity", 0.13);
    el.append("line").attr("x1", plot.x).attr("x2", plot.x + plot.w).attr("y1", y).attr("y2", y)
      .attr("stroke", "#fff").attr("stroke-width", 2).attr("stroke-dasharray", "8 6").attr("opacity", 0.8);
    if (!h.label) return;
    // "\n" stacks the label; it sits just off the level, on its own side, with an optional
    // smaller note under it (note: "line\nline")
    // labelCenter: in the middle of the side's rectangle as it is on screen, at labelSize px
    const lines = h.label.split("\n"), notes = h.note ? h.note.split("\n") : [];
    const big = h.labelCenter ? h.labelSize ?? 22 : null;
    const LH = big ? Math.round(big * 1.12) : 22, NH = big ? Math.round(Math.max(16, big * 0.72) * 1.2) : 16;
    let x = plot.x + plot.w * (h.labelX ?? 0.5), y0 = up ? y - 18 - (lines.length - 1) * LH - notes.length * NH : y + 38;
    if (big) {
      const [b0, b1] = screenBand(up ? plot.y : y, up ? y : plot.y + plot.h);
      x = screenMidX(plot);
      // the block (label lines, then the note) centred on the rectangle's middle; a baseline
      // sits about 0.35 em under the middle of its line
      const block = (lines.length - 1) * LH + (notes.length ? notes.length * NH : 0);
      y0 = (b0 + b1) / 2 - block / 2 + big * 0.35;
    }
    const t = el.append("text").attr("class", "narr-sidelabel").attr("x", x)
      .attr("y", y0).attr("text-anchor", "middle").attr("fill", col);
    if (big) t.style("font-size", `${big}px`).style("letter-spacing", "0.16em");
    lines.forEach((ln, i) => t.append("tspan").attr("x", x).attr("dy", i ? LH : 0).text(ln.toUpperCase()));
    const n = el.append("text").attr("class", "narr-sidenote").attr("x", x)
      .attr("y", y0 + (lines.length - 1) * LH + NH + 2).attr("text-anchor", "middle").attr("fill", col);
    if (big) n.style("font-size", `${Math.round(Math.max(16, big * 0.72))}px`);
    notes.forEach((ln, i) => n.append("tspan").attr("x", x).attr("dy", i ? NH : 0).text(ln));
  }
  /** The part of [y0, y1] (layer px) that's on screen: the plot, above the size ruler. */
  function screenBand(y0, y1) {
    const plot = app.plot(), SH = layer.clientHeight;
    const lo = Math.max(Math.min(y0, y1), plot.y, 0), hi = Math.min(Math.max(y0, y1), plot.y + plot.h, SH * (SCENE.rulerY ?? RULER_Y));
    return hi > lo ? [lo, hi] : [Math.min(y0, y1), Math.max(y0, y1)];
  }
  /** The middle of the plot as it is on screen, left of the mass ruler. */
  const screenMidX = (plot) => (Math.max(plot.x, 0) + Math.min(plot.x + plot.w, massAxisX(layer.clientWidth))) / 2;
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
    if (h.size !== false) guide(x, y, x, yB);              // size: false, the mass guide only
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
      // grow: "up" sweeps from the light end (a limit pushing the window's floor up),
      // "down" from the heavy end; default from the middle
      const g = c.label ? grow : 1, mid0 = (c.m[0] + c.m[1]) / 2;
      const [lo, hi] = c.grow === "up" ? [c.m[0], c.m[0] + (c.m[1] - c.m[0]) * g]
        : c.grow === "down" ? [c.m[1] - (c.m[1] - c.m[0]) * g, c.m[1]]
        : [mid0 + (c.m[0] - mid0) * g, mid0 + (c.m[1] - mid0) * g];
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
  /** How far along its track a swing is (0 at `from`, 1 at `to`) after `age` s:
   *  the swings stretch out over time (the period grows ~6% a swing) and reach further. */
  function swingU(h, age) {
    const P0 = h.period ?? 2.4, g = 0.06;
    const n = Math.log1p(g * Math.max(0, age) / P0) / Math.log1p(g);
    return (0.5 - 0.5 * Math.cos(2 * Math.PI * n)) * Math.min(1, 0.45 + 0.12 * n);
  }
  function drawSwing(el, h, age) {
    const pt = (q) => { const o = q.obj && objByName.get(q.obj); return o ? [o.logR, o.logM] : [q.r, q.m]; };
    const [A, B] = h.swing.map(pt);
    const [x1, y1, x2, y2] = [sx(A[0]), sy(A[1]), sx(B[0]), sy(B[1])];
    const fade = smooth(age / 0.6);
    el.append("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2)   // the track
      .attr("stroke", "#ffd54f").attr("stroke-width", 1.4).attr("stroke-dasharray", "3 5").attr("opacity", 0.45 * fade);
    const u = swingU(h, age);
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
    // start where the swelling star is right now (the core-and-layers swing before it),
    // so nothing jumps; without one, start at `from`
    let start = pt(h.split.from), R0 = 39;
    const sw = highlights.filter(q => q.swing && q.core && q.t0 <= h.t0 + 0.01).pop();
    if (sw && h.t0 - sw.t0 < 60) {
      const u0 = swingU(sw, h.t0 - sw.t0), [P, Q] = sw.swing.map(pt);
      start = [P[0] + (Q[0] - P[0]) * u0, P[1] + (Q[1] - P[1]) * u0];
      R0 = 9 + 30 * u0;
    }
    const A = [sx(start[0]), sy(start[1])];
    const [C, S] = [h.split.core, h.split.shell].map(pt).map(([r, m]) => [sx(r), sy(m)]);
    const p = d3.easeCubicInOut(clamp01(age / (h.draw ?? 2.4)));
    const lerp = (P, Q) => [P[0] + (Q[0] - P[0]) * p, P[1] + (Q[1] - P[1]) * p];
    const [sxp, syp] = lerp(A, S), [cxp, cyp] = lerp(A, C);
    // the outer layers: a red disc thinning into a ring
    const Rs = R0 + (75 - R0) * p, scol = d3.interpolateRgb("#ff6a3d", "#ff8fb0")(p);
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
  /** A region of the chart: { poly: [[r, m], …], fill, label?, labelAt?: [r, m] },
   *  fading in (e.g. what's been ruled out as dark matter). */
  function hatchFill(col) {
    const id = "narr-hatch-" + col.replace(/[^0-9a-z]/gi, "");
    if (defs.select("#" + id).empty())
      defs.append("pattern").attr("id", id).attr("width", 9).attr("height", 9).attr("patternUnits", "userSpaceOnUse")
        .attr("patternTransform", "rotate(45)")
        .append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 9).attr("stroke", col).attr("stroke-width", 2.4);
    return `url(#${id})`;
  }
  function drawPoly(el, h, age) {
    const op = h.instant ? 1 : smooth(age / 0.9), col = h.fill || "#3b6fd8";
    const pts = h.poly.map(([r, m]) => `${sx(r).toFixed(1)},${sy(m).toFixed(1)}`).join(" ");
    // hatch: crossed out, a ruled-out area
    el.append("polygon").attr("points", pts).attr("fill", h.hatch ? hatchFill(col) : col).attr("opacity", (h.opacity ?? 0.5) * op)
      .attr("stroke", col).attr("stroke-width", 1.4).attr("stroke-opacity", 0.9 * op);
    if (h.label && h.labelCenter) {
      // in the middle of the region as it is on screen (its box, cut to the plot), at labelSize
      // px, with an optional smaller note under it ("\n" stacks lines in either)
      const plot = app.plot(), xs = h.poly.map(p => sx(p[0])), ys = h.poly.map(p => sy(p[1]));
      const [b0, b1] = screenBand(d3.min(ys), d3.max(ys));
      const x = (Math.max(d3.min(xs), plot.x, 0) + Math.min(d3.max(xs), plot.x + plot.w, massAxisX(layer.clientWidth))) / 2;
      const big = h.labelSize ?? 26, LH = Math.round(big * 1.12), ns = Math.round(Math.max(13, big * 0.55)), NH = Math.round(ns * 1.25);
      const lines = h.label.split("\n"), notes = h.note ? h.note.split("\n") : [];
      const y0 = (b0 + b1) / 2 - ((lines.length - 1) * LH + notes.length * NH) / 2 + big * 0.35;
      const op = h.instant ? 1 : smooth((age - 0.3) / 0.6), col = h.labelColor || "#fff";
      const t = el.append("text").attr("class", "narr-sidelabel").attr("x", x).attr("y", y0).attr("text-anchor", "middle")
        .attr("fill", col).attr("opacity", op).style("font-size", `${big}px`).style("letter-spacing", "0.16em");
      lines.forEach((ln, i) => t.append("tspan").attr("x", x).attr("dy", i ? LH : 0).text(ln.toUpperCase()));
      const n = el.append("text").attr("class", "narr-sidenote").attr("x", x).attr("y", y0 + (lines.length - 1) * LH + NH + 2)
        .attr("text-anchor", "middle").attr("fill", col).attr("opacity", op).style("font-size", `${ns}px`);
      notes.forEach((ln, i) => n.append("tspan").attr("x", x).attr("dy", i ? NH : 0).text(ln));
    } else if (h.label) {
      const [lr, lm] = h.labelAt || [h.poly.reduce((a, p) => a + p[0], 0) / h.poly.length, h.poly.reduce((a, p) => a + p[1], 0) / h.poly.length];
      const t = el.append("text").attr("class", "narr-tag").attr("x", sx(lr)).attr("y", sy(lm)).attr("text-anchor", "middle")
        .attr("fill", h.labelColor || "#fff").attr("opacity", h.instant ? 1 : smooth((age - 0.3) / 0.6));
      h.label.split("\n").forEach((ln, i) => t.append("tspan").attr("x", sx(lr)).attr("dy", i ? "1.2em" : 0).text(ln.toUpperCase()));
    }
  }
  /** A big title in the middle of the screen: { title: "Here be dark matter?", y?: 0.4 };
   *  small: true for a quiet note (a source, a credit) */
  function drawTitle(el, h, age) {
    const SW = layer.clientWidth, SH = layer.clientHeight, op = h.instant ? 1 : smooth(age / 1.0);
    const t = el.append("text").attr("class", h.small ? "narr-note" : "narr-title").attr("x", SW / 2).attr("y", SH * (h.y ?? 0.4))
      .attr("text-anchor", "middle").attr("opacity", op);
    h.title.split("\n").forEach((ln, i) => t.append("tspan").attr("x", SW / 2).attr("dy", i ? "1.0em" : 0).text(ln.toUpperCase()));
  }
  /** A card: { card: "E = mc²", hold?: 2, bg?: "#fff", arrow?: true, caption? } — the screen
   *  fades to the card's colour, holds the text (an equation: serif italic, a trailing "²"
   *  set as a superscript) for `hold` seconds, and fades back to the chart. Over the classic
   *  figure only its plot frame turns white, so the axes beside it stay readable; `arrow`
   *  draws a double arrow between them (left axis ↔ right axis) under the text, and `caption`
   *  goes under the arrow. */
  function drawCard(el, h, age, fr) {
    let X = 0, Y = 0, W = layer.clientWidth, H = layer.clientHeight;
    if (fr) {
      const lr = layer.getBoundingClientRect(), sc = lr.width / layer.clientWidth;
      X = (fr.x - lr.x) / sc; Y = (fr.y - lr.y) / sc; W = fr.w / sc; H = fr.h / sc;
    }
    const hold = h.hold ?? 2, op = smooth(age / 0.35) * (1 - smooth((age - 0.35 - hold) / 0.45));
    if (op <= 0) return;
    const ink = h.color || "#111";
    el.append("rect").attr("x", X).attr("y", Y).attr("width", W).attr("height", H)
      .attr("fill", h.bg || "#fff").attr("opacity", op);
    const sup = h.card.endsWith("²"), body = sup ? h.card.slice(0, -1) : h.card;
    const fs = Math.min(W * 0.2, H * 0.12), cx = X + W / 2, ty = Y + H * 0.42 + fs * 0.35;
    const t = el.append("text").attr("x", cx).attr("y", ty).attr("text-anchor", "middle")
      .attr("fill", ink).attr("opacity", op).style("font", `italic ${fs}px "Times New Roman", Georgia, serif`).style("stroke", "none");
    t.append("tspan").text(body);
    if (sup) t.append("tspan").attr("dy", -fs * 0.42).style("font-size", `${fs * 0.6}px`).text("2");
    if (h.arrow) {
      const ay = ty + fs * 0.75, x1 = X + 10, x2 = X + W - 10, k = 12;
      const g = el.append("g").attr("stroke", ink).attr("stroke-width", 2.5).attr("fill", "none")
        .attr("stroke-linecap", "round").attr("stroke-linejoin", "round").attr("opacity", op);
      g.append("line").attr("x1", x1).attr("x2", x2).attr("y1", ay).attr("y2", ay);
      g.append("path").attr("d", `M${x1 + k},${ay - k * 0.7}L${x1},${ay}L${x1 + k},${ay + k * 0.7}`);
      g.append("path").attr("d", `M${x2 - k},${ay - k * 0.7}L${x2},${ay}L${x2 - k},${ay + k * 0.7}`);
    }
    if (h.caption) el.append("text").attr("x", cx).attr("y", ty + fs * (h.arrow ? 1.35 : 0.8)).attr("text-anchor", "middle")
      .attr("fill", ink).attr("opacity", op).style("font", `600 ${Math.max(15, fs * 0.2)}px Inter, system-ui, sans-serif`)
      .style("stroke", "none").text(h.caption);
  }
  /** A labelled point: { mark: [r, m], label, color? } (a candidate with no object of its own) */
  function drawMark(el, h, age) {
    const op = h.instant ? 1 : smooth(age / 0.6), x = sx(h.mark[0]), y = sy(h.mark[1]), col = h.color || "#ffd54f";
    el.append("circle").attr("cx", x).attr("cy", y).attr("r", 5).attr("fill", col).attr("opacity", op);
    el.append("circle").attr("cx", x).attr("cy", y).attr("r", 11).attr("fill", "none").attr("stroke", col).attr("stroke-width", 1.4).attr("opacity", 0.7 * op);
    const place = h.place || "right";
    el.append("text").attr("class", "narr-tag narr-cand").attr("x", place === "left" ? x - 16 : x + 16).attr("y", y + 5)
      .attr("text-anchor", place === "left" ? "end" : "start").attr("fill", col).attr("opacity", op).text((h.label || "").toUpperCase());
  }
  /** A colour key: { key: [["microwave", "#ff6b5e"], …], title?, y? (share of the height, 0.1) }, for a false-colour view */
  function drawKey(el, h, age) {
    const SW = layer.clientWidth, SH = layer.clientHeight, op = h.instant ? 1 : smooth(age / 0.6);
    const rows = h.key, y0 = SH * (h.y ?? 0.1), lh = 19;
    const g = el.append("g").attr("opacity", op);
    if (h.title) g.append("text").attr("class", "narr-tag").attr("x", SW / 2).attr("y", y0 - 10).attr("text-anchor", "middle")
      .attr("fill", "#e9ecf5").text(h.title.toUpperCase());
    rows.forEach(([name, col], i) => {
      const y = y0 + i * lh + 8;
      g.append("rect").attr("x", SW / 2 - 70).attr("y", y - 9).attr("width", 12).attr("height", 12).attr("rx", 2).attr("fill", col);
      g.append("text").attr("class", "narr-tag").attr("x", SW / 2 - 50).attr("y", y + 1.5).attr("fill", col).text(name.toUpperCase());
    });
  }
  /** Expansion as a picture gaining pixels: { pixels: { steps: [s, …], cell?, seed? } }, on its
   *  own over a black screen (no chart behind) and full screen, so no border is seen growing (the
   *  author's note, 2026-10-27: a border expanding is the balloon metaphor again). A picture of
   *  a few lit pixels; at each step (seconds after the cue) every pixel becomes 2 × 2, "one pixel
   *  into four": the old one keeps its place in the corner, the lit ones spread apart while
   *  staying the same size, and the new pixels fade in, dark, in the gaps that open between them. */
  function drawPixels(el, h, age) {
    const o = h.pixels, cell = o.cell ?? 16, steps = o.steps || [], seed = o.seed ?? 7;
    const SW = layer.clientWidth, SH = layer.clientHeight, cx = SW / 2, cy = SH / 2;
    // how far each step has gone (0–1, eased over 1.2 s), and the spread so far
    const prog = steps.map(st => d3.easeCubicInOut(clamp01((age - st) / 1.2)));
    let L = 0; while (L < steps.length && prog[L] > 0) L++;            // steps begun
    const k = prog.reduce((a, p) => a * (1 + p), 1);                   // ×2 per step
    // pixels at the current level: index (p, q) sits at p · cell · k / 2^L from the centre
    const sp = cell * k / 2 ** L;
    const lit = (i, j) => {   // the original picture: a few lit pixels, colours from a hash
      const hsh = Math.abs(Math.sin(i * 127.1 + j * 311.7 + seed) * 43758.5453) % 1;
      return hsh < 0.13 ? ["#ffd54f", "#ffffff", "#80deea", "#ff8a80", "#b39ddb"][Math.floor(hsh / 0.026)] : null;
    };
    const tz = (n) => { let z = 0; n = Math.abs(n); if (!n) return 99; while (n % 2 === 0) { n /= 2; z++; } return z; };
    const g = el.append("g").attr("opacity", smooth(age / 0.6));
    g.append("rect").attr("x", 0).attr("y", 0).attr("width", SW).attr("height", SH).attr("fill", "#000");
    const pm = Math.ceil((SW / 2 + cell) / sp), qm = Math.ceil((SH / 2 + cell) / sp);
    for (let p = -pm; p <= pm; p++) for (let q = -qm; q <= qm; q++) {
      const x = cx + p * sp - cell / 2, y = cy + q * sp - cell / 2;
      // born at the step after which p and q were last both on the coarser grid
      const born = L - Math.min(L, tz(p), tz(q));                       // 0: an original pixel
      const col = born === 0 ? lit(p / 2 ** L, q / 2 ** L) : null;
      const a = born === 0 ? 1 : smooth((age - steps[born - 1] - 0.3) / 1.0);
      if (a <= 0) continue;
      g.append("rect").attr("x", x + 0.5).attr("y", y + 0.5).attr("width", cell - 1).attr("height", cell - 1)
        .attr("fill", col || "#0d0f16").attr("stroke", "rgba(255,255,255,0.13)").attr("stroke-width", 1).attr("opacity", a);
    }
  }
  /** A big free-standing word on the chart: { text, at: [r, m], color?, size? (px, 30) } (a hub that
   *  arrows point out from); "\n" stacks lines, centred on `at` */
  function drawText(el, h, age) {
    const t = el.append("text").attr("class", "narr-tag narr-hub").attr("x", sx(h.at[0])).attr("y", sy(h.at[1]))
      .attr("text-anchor", "middle").attr("fill", h.color || "#ffe9a3").attr("opacity", h.instant ? 1 : smooth(age / 0.6));
    if (h.size) t.style("font-size", `${h.size}px`);
    const lines = h.text.toUpperCase().split("\n");
    if (lines.length === 1) { t.text(lines[0]); return; }
    lines.forEach((s, i) => t.append("tspan").attr("x", sx(h.at[0])).attr("dy", i ? "1.15em" : `${-0.575 * (lines.length - 1)}em`).text(s));
  }
  /** A particle's picture anywhere on the chart: { pic: "deuterium", at: [r, m], size? (px, 140),
   *  label?, sub? }. The still content/icons/<pic>.webp, which the videos draw live and
   *  animated (src/hopf-icons.js, any Hopf particle id), the label and sub-line under it. */
  /** A video on the chart: { clip: "name" (public/narration/photos/<name>.mp4), from: [r, m],
   *  to?: [r, m], move?: [s0, s1] (seconds after it starts: the slide from `from` to `to`),
   *  lead?: s (the video starts this long after the highlight), size?: px (120) }. Drawn over
   *  the chart in screen blend (its black is see-through), following the camera; the video
   *  plays on the narration's clock, frame-exact in the renderer (pending() waits for its seek).
   *  Video 3's hydrogen collapsing into a neutron. */
  const clipsEl = () => layer.querySelector("#narr-clips");
  const clipEls = new Map();
  // The video plays hidden; each frame is copied onto a canvas with its black made see-through
  // (alpha from brightness), so it lies on the chart like a picture (CSS blending can't reach the
  // chart from this layer).
  function lumaFrame(c, v) {
    const S = c.width, x = c.getContext("2d", { willReadFrequently: true });
    if (v.readyState < 2) return;
    x.clearRect(0, 0, S, S); x.drawImage(v, 0, 0, S, S);
    const im = x.getImageData(0, 0, S, S), d = im.data;
    for (let i = 0; i < d.length; i += 4) {
      const a = Math.max(d[i], d[i + 1], d[i + 2]);
      if (a < 2) { d[i + 3] = 0; continue; }
      const k = 255 / a; d[i] *= k; d[i + 1] *= k; d[i + 2] *= k; d[i + 3] = a;
    }
    x.putImageData(im, 0, 0);
  }
  function drawClipHl(h, t) {
    let e = clipEls.get(h);
    if (!e) {
      const v = document.createElement("video");
      Object.assign(v, { src: photoUrl(h.clip, true), muted: true, playsInline: true, preload: "auto" });
      v.className = "narr-clip-src";
      const c = document.createElement("canvas");
      c.width = c.height = 300; c.className = "narr-clip";
      v.addEventListener("seeked", () => lumaFrame(c, v));
      clipsEl().append(v, c); e = { v, c }; clipEls.set(h, e);
    }
    const { v, c } = e;
    const local = t - h.t0, [s0, s1] = h.move || [0, 0];
    const u = h.to ? d3.easeCubicInOut(clamp01((local - s0) / Math.max(0.01, s1 - s0))) : 0;
    const r = h.from[0] + ((h.to || h.from)[0] - h.from[0]) * u, m = h.from[1] + ((h.to || h.from)[1] - h.from[1]) * u;
    const size = h.size ?? 120, op = h.op ?? 1;
    Object.assign(c.style, { left: `${(sx(r) - size / 2).toFixed(1)}px`, top: `${(sy(m) - size / 2).toFixed(1)}px`,
      width: `${size}px`, height: `${size}px`, opacity: op.toFixed(3) });
    const want = Math.max(0, Math.min((v.duration || 1e9) - 0.04, local - (h.lead ?? 0)));
    let live = false;
    try { live = !RENDER && !audio.paused; } catch {}
    if (RENDER || !live) { if (!v.paused) v.pause(); if (Math.abs(v.currentTime - want) > 0.001) v.currentTime = want; }
    else { if (Math.abs(v.currentTime - want) > 0.25) v.currentTime = want; if (v.paused && want < (v.duration || 1e9) - 0.05) v.play().catch(() => {}); }
    if (!v.seeking) lumaFrame(c, v);
  }
  function dropClips(live) {
    for (const [h, e] of clipEls) if (!live.includes(h)) { e.v.remove(); e.c.remove(); clipEls.delete(h); }
  }
  /** Something flying off across the chart: { fly: { from: [r, m], to: [r, m] }, dur?: s (0.9),
   *  color?, label? } — a bright dot with a fading trail (a neutrino leaving). */
  function drawFly(el, h, age) {
    const dur = h.dur ?? 0.9, k = d3.easeCubicIn(clamp01(age / dur)), col = h.color || "#e1f5fe";
    if (age < 0 || k >= 1) return;
    const [r0, m0] = h.fly.from, [r1, m1] = h.fly.to;
    const at = (q) => [sx(r0 + (r1 - r0) * q), sy(m0 + (m1 - m0) * q)];
    const [x, y] = at(k), [tx, ty] = at(Math.max(0, k - 0.18));
    el.append("line").attr("x1", tx).attr("y1", ty).attr("x2", x).attr("y2", y).attr("stroke", col)
      .attr("stroke-width", 3).attr("stroke-linecap", "round").attr("opacity", 0.55);
    el.append("circle").attr("cx", x).attr("cy", y).attr("r", 9).attr("fill", col).attr("opacity", 0.3);
    el.append("circle").attr("cx", x).attr("cy", y).attr("r", 4).attr("fill", "#fff");
    if (h.label) el.append("text").attr("class", "narr-tag").attr("x", x + 12).attr("y", y + 4).attr("fill", col).text(h.label.toUpperCase());
  }
  function drawPic(el, h, age) {
    const size = h.size ?? 140, x = sx(h.at[0]), y = sy(h.at[1]);
    const a = h.instant ? 1 : smooth(age / 0.8), grow = 0.85 + 0.15 * a;
    el.append("image").attr("class", "narr-pic").attr("data-slug", h.pic)
      .attr("href", iconUrls[`../content/icons/${h.pic}.webp`] || "")
      .attr("x", x - size * grow / 2).attr("y", y - size * grow / 2).attr("width", size * grow).attr("height", size * grow)
      .attr("opacity", a);
    const lines = [h.label && [h.label.toUpperCase(), h.color || "#ffe9a3", null], h.sub && [h.sub, "#d8dde8", "13px"]].filter(Boolean);
    lines.forEach(([text, fill, fs], i) => {
      const t = el.append("text").attr("class", "narr-tag").attr("x", x).attr("y", y + size / 2 + 18 + 18 * i)
        .attr("text-anchor", "middle").attr("fill", fill).attr("opacity", a).text(text);
      if (fs) t.style("font-size", fs).style("letter-spacing", "0.02em").style("font-weight", 600);
    });
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
    // solid / width: a bold arrow (a movement to read at a glance), else a dashed path
    el.append("line").attr("x1", sxp).attr("y1", syp).attr("x2", ex).attr("y2", ey)
      .attr("stroke", col).attr("stroke-width", h.width ?? 2).attr("stroke-dasharray", h.solid ? null : "6 5")
      .attr("stroke-dashoffset", -age * 18);
    const ah = 9 + 2.5 * ((h.width ?? 2) - 2), ang = Math.atan2(uy, ux);
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
  const MASS_BASES = [[-18, "ag"], [-15, "fg"], [-12, "pg"], [-9, "ng"], [-6, "μg"], [-3, "mg"], [0, "g"], [3, "kg"], [6, "t"], [9, "kt"], [12, "Mt"], [15, "Gt"]];
  const SIZE_BASES = [[-13, "fm"], [-10, "pm"], [-7, "nm"], [-4, "μm"], [-1, "mm"], [0, "cm"], [2, "m"], [5, "km"]];
  const ENERGY_BASES = [[-3, "meV"], [0, "eV"], [3, "keV"], [6, "MeV"], [9, "GeV"], [12, "TeV"], [15, "PeV"], [18, "EeV"]];
  const EV_PER_G = 32.75, ENERGY_BELOW = -18;   // log10 of 1 g × c² in eV; where the mass ruler turns to eV/c²
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
    // below about a large molecule's mass, grams run out of prefixes ("0 pg"): ticks in
    // eV/c² instead, on round energies, as the map's own ruler does (mobile-rulers.js)
    const mLo = Math.min(mA, mB), mHi = Math.max(mA, mB);
    const massTicks = [
      ...fillTicks(Math.max(mLo, ENERGY_BELOW), mHi, mppd, MASS_BASES),
      ...fillTicks(mLo + EV_PER_G, Math.min(mHi, ENERGY_BELOW) + EV_PER_G, mppd, ENERGY_BASES)
        .map(tk => ({ ...tk, at: tk.at - EV_PER_G, label: `${tk.label}/c²` })),
    ];
    for (const tk of massTicks) {
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

  // ---------- the spectrum explorer (public/spectrum/, ?video=1) ----------
  // A scene can play over the electromagnetic-spectrum explorer instead of the chart.
  // The explorer opens full-frame in an iframe under the captions; the scene's
  // `explorer` (the state at t = 0, hidden) and each cue's `explorer: { … }` set it,
  // (not `spectrum`, which is the chart's sine wave along the photons)
  // a pure function of t like everything else here:
  //   show: true | false (fades over `fade` s, default 1.2) · view "inside" | "cloud"
  //   radius "custom" | "log" | "linear" · bright "lin" | "log" · rings · labels ({ name:
  //   "shown as" }: only those ring and marker labels; "edge": the observable universe's): switch at the cue
  //   c, s (the RGB selector, in bands of the sky's bar: natural colour is c 22, s 1),
  //   yaw, pitch, orbit, ezoom: one camera for Inside and the Cloud, so Earth stays put
  //   when the view switches (ezoom is Earth's size as Inside's field of view, smaller
  //   is closer; orbit turns the camera about Earth's axis, Earth and the sky together),
  //   gmst (Earth's turn), unit, lz, exposure, contrast, lift, guides (0–1, the Cloud's rings,
  //   discs and names faded so the dots show): glide there from wherever
  //   they are, over `dur` s (default 2.5)
  //   spin: a turn rate (rad/s) that never stops while it's on. With ezoom it's added to
  //   the orbit: Earth stays still and the camera goes round it (the author's note,
  //   2026-10-27); without, Earth turns on its axis in Inside (gmst), the Cloud turns (spinA)
  //   xfade: with a view switch, the old view fades out over it over this many seconds
  //   line: 0–1 (default 1), the Compton line drawn over the explorer as its spectrum
  //   bar (the author's note, 2026-10-27): the line where the chart's camera puts it,
  //   the colours we see on it, the selector's red, green and blue ranges glowing on
  //   it, and the photons' names lighting up as the ranges pass them
  const SPEC_KEYS = cues.filter(c => c.explorer);
  const SPEC = SCENE.explorer || SPEC_KEYS.length ? { ...(SCENE.explorer || {}) } : null;
  let specFrame = null, specLastT = NaN;
  const SPEC_SWITCH = ["view", "radius", "bright", "rings", "labels"];
  const SPEC_LOG = new Set(["zoom", "ezoom"]);   // glides evenly in powers of ten
  // a cue's `ease` for its glides (default cubic in-out): "in", "out" or "linear", to chain
  // several glides into one move without stopping at each
  const SPEC_EASE = { in: d3.easeQuadIn, out: d3.easeQuadOut, linear: d3.easeLinear };
  const specSegs = {}, specSwitch = {};
  if (SPEC) {
    const init = { show: false, spin: 0, line: 1, ...SPEC };
    const at = (f, t) => {
      const segs = specSegs[f];
      if (!segs) return init[f];
      let v = init[f];
      for (const g of segs) {
        if (g.t0 > t) break;
        const p = (SPEC_EASE[g.ease] || d3.easeCubicInOut)(clamp01((t - g.t0) / g.dur));
        v = SPEC_LOG.has(f) ? Math.exp(Math.log(g.from) + (Math.log(g.to) - Math.log(g.from)) * p) : g.from + (g.to - g.from) * p;
      }
      return v;
    };
    for (const c of SPEC_KEYS) for (const [f, to] of Object.entries(c.explorer)) {
      if (f === "dur" || f === "fade" || f === "xfade" || f === "ease") continue;
      if (SPEC_SWITCH.includes(f)) { (specSwitch[f] ||= []).push({ t: c.time, v: to, xfade: c.explorer.xfade }); continue; }
      const dur = f === "show" ? (c.explorer.fade ?? 1.2) : (c.explorer.dur ?? 2.5);
      const from = at(f, c.time) ?? (f === "zoom" ? 1 : 0);
      (specSegs[f] ||= []).push({ t0: c.time, dur, from: f === "show" ? +from : from, to: f === "show" ? +to : to, ease: c.explorer.ease });
    }
    // the spin's turn so far, summed in 1/50 s steps once
    const STEP = 0.02, turn = [0];
    for (let i = 1; i * STEP <= duration + 1; i++) turn.push(turn[i - 1] + at("spin", (i - 0.5) * STEP) * STEP);
    const turned = (t) => { const x = clamp01(t / (duration + 1)) * (duration + 1) / STEP, i = Math.floor(x); return turn[i] + ((turn[i + 1] ?? turn[i]) - turn[i]) * (x - i); };
    specFrame = (t) => {
      const st = {};
      for (const f of SPEC_SWITCH) { let v = init[f]; for (const k of specSwitch[f] || []) if (k.t <= t) v = k.v; if (v !== undefined) st[f] = v; }
      // a cross-fade out of the view before the last switch
      let prev = init.view ?? "inside";
      for (const k of specSwitch.view || []) {
        if (k.t > t) break;
        if (k.xfade && t < k.t + k.xfade) { st.from = prev; st.fromA = 1 - smooth((t - k.t) / k.xfade); }
        prev = k.v;
      }
      for (const f of new Set([...Object.keys(init), ...Object.keys(specSegs)])) {
        if (SPEC_SWITCH.includes(f) || f === "spin" || f === "show" || f === "line") continue;
        const v = at(f, t);
        if (v !== undefined) st[f] = v;
      }
      const a = turned(t);
      if (a) {
        if (init.ezoom != null) st.orbit = (st.orbit ?? 0) + a;
        else if ((st.view ?? "inside") === "cloud") st.spinA = (st.spinA ?? 0) + a; else st.gmst = (st.gmst ?? 0) + a;
      }
      return { show: smooth(at("show", t)), line: clamp01(at("line", t)), st };
    };
  }
  let specEl = null;
  if (SPEC) {
    specEl = document.createElement("iframe");
    specEl.id = "narr-spectrum";
    specEl.title = "The electromagnetic spectrum";
    specEl.src = `${import.meta.env.BASE_URL}spectrum/index.html?video=1&target=sky&view=${SPEC.view || "inside"}`;
    layer.insertBefore(specEl, layer.firstChild);   // under the drawings and captions
    specEl.addEventListener("load", () => {
      // the explorer boots after its data loads: hand it this frame once it's ready
      const wait = () => specEl.contentWindow?.spectrumVideo ? (specLastT = NaN, drawSpectrum(curT)) : setTimeout(wait, 50);
      wait();
    }, on);
  }
  const specReady = () => !specEl || !!specEl.contentWindow?.spectrumVideo;
  // the sky's bands (the explorer's bar): each one's wavelength, so a selector
  // position (in bands) lands on the Compton line
  const specBands = SPEC ? await fetch(`${import.meta.env.BASE_URL}spectrum/sky-spectrum/bands.json`).then(r => r.json()).then(m => m.bands).catch(() => null) : null;
  const UNIT_M = { fm: 1e-15, nm: 1e-9, "µm": 1e-6, mm: 1e-3, cm: 1e-2, m: 1 };
  const waveLog = (str) => {   // log10 of a band's wavelength in cm ("21 cm", "330–680 nm", "~1 fm": a range's geometric mean)
    const parts = str.replace(/~/g, "").split("–").map(x => x.trim().match(/^([\d.]+)\s*(fm|nm|µm|mm|cm|m)?$/));
    if (parts.some(x => !x)) return NaN;
    const unit = parts[parts.length - 1][2];
    const ls = parts.map(x => Math.log10(+x[1] * UNIT_M[x[2] ?? unit] * 100));
    return ls.reduce((a, b) => a + b, 0) / ls.length;
  };
  const bandLam = specBands ? specBands.map(b => waveLog(b.wave)) : [];
  const lamAt = (p) => {   // selector position (bands) → log10 λ (cm), straight between band centres, on past the ends
    const n = bandLam.length, i = Math.max(0, Math.min(n - 2, Math.floor(p)));
    return bandLam[i] + (bandLam[i + 1] - bandLam[i]) * (p - i);
  };
  const posAt = (L) => {   // and back: log10 λ → selector position
    const n = bandLam.length;
    for (let i = 0; i < n - 1; i++) if ((L <= bandLam[i] && L >= bandLam[i + 1]) || i === n - 2)
      return i + (L - bandLam[i]) / (bandLam[i + 1] - bandLam[i]);
    return 0;
  };
  // a chart point on the Compton line for a wavelength (photons sit at λ/2π)
  const linePt = (L) => { const r = L - PHOTON_LAMBDA_OFFSET; return [sx(r), sy(comptonM(r))]; };
  const PHOTONS = app.objects.filter(o => o.photon).map(o => ({ name: o.name, L: o.logR + PHOTON_LAMBDA_OFFSET }));
  // the colours we see, along 380–750 nm
  const seen = (nm) => {
    const h = Math.max(0, Math.min(270, 270 * (1 - (nm - 400) / 300)));
    const edge = nm < 420 ? (nm - 380) / 40 : nm > 700 ? (750 - nm) / 50 : 1;
    return d3.hsl(h, 1, 0.55, Math.max(0, Math.min(1, edge))).toString();
  };
  const gSpec = nsvg.insert("g", ":first-child").attr("class", "narr-spec");
  const CHANNELS = [["#ff3b3b", -1], ["#3bff5a", 0], ["#4a7bff", 1]];
  function drawSpecLine(t, a, st) {
    gSpec.selectAll("*").remove();
    gSpec.attr("opacity", a);
    if (a <= 0 || !bandLam.length) return;
    // the whole line across the screen, then the visible band in its own colours
    const [x0, y0] = linePt(-16), [x1, y1] = linePt(8);
    gSpec.append("line").attr("x1", x0).attr("y1", y0).attr("x2", x1).attr("y2", y1).attr("class", "narr-spec-line");
    for (let nm = 380; nm < 750; nm += 10) {
      const [ax, ay] = linePt(Math.log10(nm * 1e-7)), [bx, by] = linePt(Math.log10((nm + 10) * 1e-7));
      gSpec.append("line").attr("x1", ax).attr("y1", ay).attr("x2", bx).attr("y2", by).attr("stroke", seen(nm + 5)).attr("class", "narr-spec-seen");
    }
    // the selector's three ranges, as soft glows on the line
    const c = st.c, sp = st.s ?? 1, sig = Math.max(0.35, 0.45 * sp);
    for (const [col, k] of CHANNELS) {
      const p = c + k * sp, [ax, ay] = linePt(lamAt(p - sig)), [bx, by] = linePt(lamAt(p + sig)), [mx, my] = linePt(lamAt(p));
      // (visible light is a sliver of the line, to scale: a halo keeps each range readable)
      gSpec.append("circle").attr("cx", mx).attr("cy", my).attr("r", 15).attr("fill", col).attr("class", "narr-spec-halo");
      gSpec.append("line").attr("x1", ax).attr("y1", ay).attr("x2", bx).attr("y2", by).attr("stroke", col).attr("class", "narr-spec-ch");
      gSpec.append("circle").attr("cx", mx).attr("cy", my).attr("r", 4.5).attr("fill", col).attr("class", "narr-spec-dot");
    }
    // the photons: a dot each, and their names while a range is on them
    for (const ph of PHOTONS) {
      const [x, y] = linePt(ph.L), q = posAt(ph.L);
      const d = Math.min(...CHANNELS.map(([, k]) => Math.abs(q - (c + k * sp))));
      const on = 1 - smooth((d - sig) / 1.2);
      gSpec.append("circle").attr("cx", x).attr("cy", y).attr("r", 2.6).attr("class", "narr-spec-ph").attr("opacity", 0.45 + 0.55 * on);
      // names above the line, to its right; near the right edge, to its left
      const left = x > nsvg.node().clientWidth - 8.5 * ph.name.length - 20;
      if (on > 0.01) gSpec.append("text").attr("x", left ? x - 9 : x + 9).attr("y", y - 7).attr("text-anchor", left ? "end" : "start")
        .attr("class", "narr-spec-name").attr("opacity", on).text(ph.name);
    }
  }
  function drawSpectrum(t) {
    if (!specFrame) return;
    const { show, line, st } = specFrame(t);
    drawSpecLine(t, show * line, st);   // follows the chart's camera, so every frame
    if (t === specLastT) return;
    specEl.style.opacity = show;
    specEl.style.visibility = show > 0 ? "visible" : "hidden";
    const api = specEl.contentWindow?.spectrumVideo;
    // set it while it shows, and once while hidden so it's ready to fade in
    if (api && (show > 0 || !(specLastT >= 0))) { api.set(st); specLastT = t; }
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
    classicView = co > 0 ? coverView(t) || view : null;
    narrClassic(co, classicView, classicParts(t));
    // end the gesture once on arrival (full redraw + tiles); otherwise keep it open
    const arriving = view.phase === "hold" && (lastPhase === "fly" || key !== lastKey);
    app.setCamera(view, !arriving);
    lastKey = key; lastPhase = view.phase;
    app.bgNoiseTime(t);    // the fractal background, drawn for this t (its clouds evolve by t)
    overlay();
  }
  function overlay() {
    drawUnits(curT);
    drawDolly(curT);       // first, so drawings over a dive's picture measure this frame's copy
    drawHighlights(curT);
    drawPhoto(curT);
    drawCover(curT);
    drawSpectrum(curT);
    drawCaption(curT);
  }
  app.onRedraw(() => { gHl && overlay(); });

  renderAt(0);

  window.__narr = {
    duration,
    // where an object sits on the chart, [log r, log m] (for framing scenes)
    // the camera at time t: { r, m, span } (for checking framing)
    view: (t) => { const v = camera(t).view; return { r: v.r, m: v.m, span: v.span }; },
    where: (name) => { const o = objByName.get(name); return o ? [+o.logR.toFixed(2), +o.logM.toFixed(2)] : null; },
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
    now: () => curT,     // the take's time on screen (the live Hopf pictures animate by it)
    settle(t) { const { view } = camera(t); app.setCamera(view, false); app.bgNoiseSettle(); overlay(); },
    camera: (t) => camera(t).view,
    pending: () => app.tilesPending() + app.iconsPending() + (app.dustReady() ? 0 : 1) +
      [...photoImgs.values()].filter(im => !im.complete).length +
      [...photoBox.querySelectorAll("img")].filter(im => !im.complete).length +
      [...photoBox.querySelectorAll("video"), ...layer.querySelectorAll("#narr-clips video")].filter(v => v.seeking || v.readyState < 2).length +
      (COVER && !coverImg.complete ? 1 : 0) + (specReady() ? 0 : 1) + tracesPending() + app.bgNoisePending(),
    // the fractal background: { wanted, shown, failed, lost } (failed: "no WebGL2"; lost: GL contexts lost), for the renderer's log
    bgNoise: () => app.bgNoiseStatus(),
    audio: base + take.audio,
  };
  if (RENDER) return;

  // ---------- live player ----------
  // every picture the scene names, fetched now: on a phone the camera can otherwise reach an
  // object before its picture has downloaded (the renderer waits for them, the live player can't)
  {
    const names = [];
    const walk = (v) => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") { if (typeof v.obj === "string") names.push(v.obj); Object.values(v).forEach(walk); }
    };
    walk(SCENE.cues);
    app.prefetchIcons?.(names);
  }
  // One audio element for every take (app.audio): once a tap has started it,
  // mobile browsers let it play the next take without another tap.
  const audio = app.audio || new Audio();
  audio.muted = false;
  // Sound design (scripts/narration-sound.mjs): the voice with its bed, if the
  // take has one; the chip switches back to the bare voice, in place.
  const srcFor = () => base + (take.mix && soundOn() ? take.mix : take.audio);
  audio.src = srcFor();
  audio.preload = "auto";
  // Then the whole file, played from memory: Safari streams long audio by byte
  // ranges, and a host that answers a range with the file from its start (the
  // preview's) made the voice jump back to the beginning about two minutes in,
  // while the picture carried on.
  const blobs = app.audioBlobs || (app.audioBlobs = new Map());
  const wholeFile = (url) => {
    if (!blobs.has(url)) blobs.set(url, fetch(url).then(r => r.ok ? r.blob() : null)
      .then(b => b ? URL.createObjectURL(b) : url).catch(() => url));
    return blobs.get(url);
  };
  const toWholeFile = () => {
    const url = srcFor();
    wholeFile(url).then(u => {
      if (u === url || srcFor() !== url || audio.src === u) return;
      const at = audio.currentTime, playing = !audio.paused;
      audio.src = u; audio.playbackRate = audio.defaultPlaybackRate;
      if (at > 0 || playing) audio.addEventListener("loadedmetadata", () => { audio.currentTime = at; if (playing) audio.play().catch(() => {}); }, { once: true });
    });
  };
  toWholeFile();
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
  let playTry = 0;
  const play = () => {
    stopCountdown();
    ui.classList.add("hidden"); layer.classList.remove("paused");
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
    // blocked (no tap yet on this page): back to the play button. Only for the latest
    // try, and only if nothing is playing: autoplay's attempt can fail after a tap has
    // already started the sound, which used to bring the controls back over the video
    const n = ++playTry;
    audio.play().catch(() => {
      if (n !== playTry || !audio.paused) return;
      ui.classList.remove("hidden"); layer.classList.add("paused"); hint("tap to play");
    });
  };
  // the sound actually started (it can lag behind play()): controls away, and the frame
  // loop running (its first frame may have seen the audio still paused and stopped)
  audio.addEventListener("playing", () => {
    ui.classList.add("hidden"); layer.classList.remove("paused");
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }, on);
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
    toWholeFile();
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
#narr-svg text.narr-sketch-num { font-size: 15px; font-weight: 700; fill: #fff; letter-spacing: 0.03em; }
#narr-svg text.narr-sketch-sub { font-size: 11.5px; font-weight: 600; fill: rgba(235,238,255,0.8); letter-spacing: 0.05em; }
#narr-svg text.narr-guide { font-size: 11px; font-weight: 600; fill: #e8ecff; letter-spacing: 0.03em; }
.narr-cand { font-size: 15px; }
.narr-hub { font-size: 30px; letter-spacing: 0.06em; }
body.narr-no-text #chart text { visibility: hidden; }
/* a cue's focus: every other object fades (pictures, dots, shadows, names, catalogue dust) */
body.narr-obj-focus #chart :is(g.icon-g, g.obj-g, g.icon-shadow, text.obj-label):not(.narr-keep),
body.narr-obj-focus #chart :is(.dust-layer, g.dust-picture, .dust-shadows, .dust-named, .dust-name) {
  opacity: calc(1 - var(--narr-obj-fade, 0)) !important; }
/* a callout on screen: every other chart label fades (axis text and the highlighted objects' own stay) */
body.narr-label-focus #chart text:not(.obj-label-related):not(.dust-name):not(.axis-label):not(.axis-title):not(.axis-subtitle):not(.axis-unit-link) {
  /* multiplies with each label's own opacity, so faint ones never brighten mid-fade */
  fill-opacity: calc(1 - var(--narr-label-fade, 1)) !important; stroke-opacity: calc(1 - var(--narr-label-fade, 1)) !important; }
#narr-svg text.narr-note { font-size: 12.5px; font-weight: 500; letter-spacing: 0.04em; fill: rgba(235,238,255,0.9); stroke-width: 3px; }
#narr-svg text.narr-title { font-family: "Barlow Condensed", "Arial Narrow", sans-serif !important; font-size: 42px; font-weight: 700;
  letter-spacing: 0.04em; fill: #ffd54f; stroke: rgba(0,0,0,0.9); stroke-width: 6px; }
.narr-linelabel { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; }
.narr-axislabel { font-family: "Barlow Condensed", Inter, sans-serif !important; font-size: 22px; font-weight: 700; letter-spacing: 0.12em; }
.narr-sidelabel { font-size: 15px; font-weight: 800; letter-spacing: 0.22em; }
.narr-sidenote { font-size: 12px; font-weight: 600; letter-spacing: 0.04em; }
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
#narr-cover { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
#narr-layer .narr-spec-line { stroke: #fff; stroke-width: 2; opacity: 0.6; }
#narr-layer .narr-spec-seen { stroke-width: 5; stroke-linecap: butt; }
#narr-layer .narr-spec-ch { stroke-width: 16; stroke-linecap: round; opacity: 0.5; mix-blend-mode: screen; }
#narr-layer .narr-spec-dot { stroke: #000; stroke-width: 1; }
#narr-layer .narr-spec-halo { opacity: 0.35; filter: blur(6px); mix-blend-mode: screen; }
#narr-layer .narr-spec-ph { fill: #fff; }
#narr-layer .narr-spec-name { fill: #fff; font: 600 15px "IBM Plex Sans", "Helvetica Neue", sans-serif; paint-order: stroke; stroke: #000; stroke-width: 3px; }
#narr-spectrum { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; background: #000; pointer-events: none; visibility: hidden; opacity: 0; }
#narr-cover img { position: absolute; left: 0; top: 0; transform-origin: 0 0; max-width: none; }
#narr-photo { position: absolute; inset: 0; background: #000; overflow: hidden; visibility: hidden; pointer-events: none; }
#narr-photo .np-imgs { position: absolute; inset: 0; will-change: transform; }
#narr-photo figure { position: absolute; inset: 0; margin: 0; }
#narr-clips { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
#narr-clips .narr-clip { position: absolute; }
#narr-clips .narr-clip-src { position: absolute; width: 2px; height: 2px; opacity: 0; }
#narr-photo img, #narr-photo video { width: 100%; height: 100%; display: block; object-fit: contain; }
#narr-photo .np-stack { display: flex; flex-direction: column; justify-content: center; gap: 2%; padding: 15% 8% 30%; box-sizing: border-box; }
#narr-photo .np-stack figure { position: relative; flex: 1 1 0; min-height: 0; display: flex; flex-direction: column; align-items: center; }
#narr-photo .np-stack img { flex: 1 1 0; min-height: 0; }
#narr-photo .np-row { flex-direction: row; align-items: center; gap: 3%; padding: 30% 3% 38%; }
#narr-photo .np-row figure { min-width: 0; height: 100%; justify-content: center; }
#narr-photo .np-row img, #narr-photo .np-row video { flex: 0 1 auto; width: 100%; height: auto; aspect-ratio: 1; }
#narr-photo .np-row figcaption { margin-top: 10px; text-align: center; line-height: 1.25; }
#narr-photo figcaption small { display: block; font-size: 14px; letter-spacing: 0.06em; color: rgba(255,255,255,0.8); }
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
