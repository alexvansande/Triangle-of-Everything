#!/usr/bin/env node
// What changed in a short since its last render, so the render redoes only that:
//   node scripts/narration-render-diff.mjs short-04-black-holes
// prints one line of JSON: { kind, ranges, base, why }
//   kind "none"     nothing the video shows or plays changed (a comment, a note): keep the render
//        "audio"    only the sound (voice treatment, music, effects), same timing: swap the audio track
//        "partial"  some cues (and maybe the sound), same timing: re-render `ranges` ("m:ss-m:ss, …")
//        "partial"  with tail: true and a last range "m:ss-end": the timing changed, but only from that point on
//                   (a re-recorded end, the author, 2026-11-03: "replace just the audio… we don't need to re-render
//                   all again"): keep the old frames up to it, render the rest (narration-render-partial.py --tail)
//        "full"     the timing (the cut), or scene-wide fields, changed: render it whole
// The base is the commit the render was made from (output/videos/<take>.commit, written by
// scripts/narration-render-stale.sh), or else the last commit before the render file's time.
// A changed cue counts from its own time to the end of the cue after it (generous: a highlight
// or camera move lasts until the next one takes over). The author's rule, 2026-10-29: "always
// check for the diffs, sometimes all that changes is partial segments or audios".
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const take = process.argv[2];
const git = (...a) => execFileSync("git", a, { encoding: "utf8", maxBuffer: 1 << 28 });
const gitBuf = (...a) => { try { return execFileSync("git", a, { maxBuffer: 1 << 28 }); } catch { return null; } };
let out = (o) => { console.log(JSON.stringify(o)); process.exit(0); };
const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;

const render = `output/videos/${take}.mp4`, stamp = `output/videos/${take}.commit`;
if (!fs.existsSync(render)) out({ kind: "full", why: "no render yet" });
let base = fs.existsSync(stamp) ? fs.readFileSync(stamp, "utf8").trim() : "";
if (!base) base = git("rev-list", "-1", `--before=@${Math.floor(fs.statSync(render).mtimeMs / 1000)}`, "HEAD").trim();
if (!base) out({ kind: "full", why: "no commit before the render" });

// the code and pictures every short draws with: changed since the render? (a queued take without
// a note then renders whole: its session changed something shared)
const shared = git("diff", "--name-only", base, "HEAD", "--", "src", ":!src/narration-scenes", "content",
  "public/hopf", "public/spectrum", "public/narration/photos", "index.html").trim() !== "";
out = (o) => { console.log(JSON.stringify({ ...o, shared })); process.exit(0); };
const dir = `public/narration/${take}`, sceneFile = `src/narration-scenes/${take}.js`;
// (a cut's pieces play their source takes' scenes too)
const srcScenes = [...new Set((JSON.parse(fs.readFileSync(`${dir}/words.json`, "utf8")).segments || []).map(s => `src/narration-scenes/${s.scene}.js`))];
const files = git("diff", "--name-only", base, "HEAD", "--", dir, sceneFile, ...srcScenes).split("\n").filter(Boolean);
if (!files.length) out({ kind: "none", base, why: "nothing of this take changed since its render" });

// the timing: the words (start, end) and the length; a text-only change shows in the captions
const wordsNow = JSON.parse(fs.readFileSync(`${dir}/words.json`, "utf8"));
const oldBuf = gitBuf("show", `${base}:${dir}/words.json`);
if (!oldBuf) out({ kind: "full", base, why: "no words.json at the render's commit" });
const wordsOld = JSON.parse(oldBuf.toString());
const ww = (m) => m.words || [];
const total = wordsNow.duration + (wordsNow.credits || 0);
// where the timing first differs (a word's start or end, or its count, or the length): Infinity if nowhere
const [wn, wo] = [ww(wordsNow), ww(wordsOld)];
let tail = Infinity;
for (let i = 0; i < Math.max(wn.length, wo.length); i++) {
  const a = wn[i], b = wo[i];
  if (!a || !b || Math.abs(a[1] - b[1]) > 0.001 || Math.abs(a[2] - b[2]) > 0.001) { tail = Math.min(a?.[1] ?? Infinity, b?.[1] ?? Infinity); break; }
}
if (tail === Infinity && (Math.abs(wordsNow.duration - wordsOld.duration) > 0.001 || (wordsNow.credits || 0) !== (wordsOld.credits || 0)))
  tail = Math.min(wordsNow.duration, wordsOld.duration);
// a cut's pieces (scripts/narration-cut.py): the ones that start before the change must be the same pieces
// (only where one ends may move); a piece that changed earlier moves everything after it: whole
const segs = (m) => m.segments || [];
for (let i = 0; i < Math.max(segs(wordsNow).length, segs(wordsOld).length); i++) {
  const a = segs(wordsNow)[i], b = segs(wordsOld)[i];
  if (JSON.stringify(a) === JSON.stringify(b)) continue;
  const at = Math.min(a?.at ?? Infinity, b?.at ?? Infinity);
  if (a && b && ["take", "scene", "from", "at", "tempo"].every(k => a[k] === b[k])) continue;   // only its end moved
  tail = Math.min(tail, at);
}
if (tail < Infinity && tail < 0.3 * total) out({ kind: "full", base, why: "the cut's timing changed near the start" });
const ranges = [];
wn.forEach(([w, s, e], i) => { if (s < tail && w !== wo[i][0]) ranges.push([s - 1, e + 2]); });   // a caption's text
// a change to anything else in words.json (the audio file's name, tempo…) besides the words: whole (the length, a
// cut's pieces and music only matter from the tail on)
const rest = (m) => JSON.stringify({ ...m, words: undefined, ...(tail < Infinity && { duration: undefined, segments: undefined, music: undefined }) });
if (rest(wordsNow) !== rest(wordsOld)) out({ kind: "full", base, why: "words.json's settings changed" });
const sound = files.some(f => /\/(audio|mix)\.m4a$/.test(f));

// the scene: load both versions (plain modules, no imports) and compare cue by cue
const norm = (w) => w.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9']/g, "");
const same = (x, y) => x === y || x.replace(/s$/, "") === y.replace(/s$/, "");
async function loadScene(src) {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "narr-diff-")), "scene.mjs");
  fs.writeFileSync(f, src);
  return (await import(f)).default;
}
if (files.includes(sceneFile)) {
  const oldSrc = gitBuf("show", `${base}:${sceneFile}`);
  if (!oldSrc) out({ kind: "full", base, why: "no scene at the render's commit" });
  const [a, b] = [await loadScene(oldSrc.toString()), await loadScene(fs.readFileSync(sceneFile, "utf8"))];
  // the sound fields only make the mix (its change shows as mix.m4a); anything else scene-wide: whole
  const wide = (s) => JSON.stringify({ ...s, cues: undefined, sound: undefined, backing: undefined, title: undefined, blurb: undefined });
  if (wide(a) !== wide(b)) out({ kind: "full", base, why: "a scene-wide field changed" });
  // narration.js resolveScene, the same matching: phrases → times
  const toks = ww(wordsNow).map(([w, s, e]) => ({ n: norm(w), s, e }));
  const find = (phrase, lo) => {
    const p = phrase.split(/\s+/).map(norm).filter(Boolean);
    for (let i = 0; i + p.length <= toks.length; i++)
      if (toks[i].s >= lo && p.every((x, j) => same(toks[i + j].n, x))) return { s: toks[i].s, e: toks[i + p.length - 1].e };
    return null;
  };
  const timed = (scene) => {
    let cursor = 0;
    return scene.cues.map(c => {
      if (c.t != null) return { c, t: c.t };
      let hit = null;
      for (const ph of [].concat(c.at)) { hit = find(ph, cursor); if (hit) break; }
      if (!hit) return null;
      cursor = hit.s;
      return { c, t: Math.max(0, (c.atEnd ? hit.e : hit.s) + (c.offset ?? -0.25)) };
    }).filter(Boolean).sort((x, y) => x.t - y.t);
  };
  const key = ({ c, t }) => t.toFixed(3) + JSON.stringify(c);
  const [ca, cb] = [timed(a), timed(b)];
  const ka = new Set(ca.map(key)), kb = new Set(cb.map(key));
  const span = (list, i) => {   // from this cue to the end of the one after it
    const { c, t } = list[i], next = list[i + 2]?.t ?? list[i + 1]?.t ?? total;
    const own = t + (c.dur === "end" ? total : (+c.dur || 0)) + (+c.hold || 0) + (+c.dive?.out || 0);
    return [t - 1, Math.max(next, own) + 1];
  };
  ca.forEach((x, i) => { if (x.t < tail && !kb.has(key(x))) ranges.push(span(ca, i)); });
  cb.forEach((x, i) => { if (x.t < tail && !ka.has(key(x))) ranges.push(span(cb, i)); });
}
// a cut's pieces play their source takes' scenes: a cue changed there shows where its piece puts it (and, carried
// into a piece's first instant, at the start of every later piece of that take)
for (const scene of [...new Set(segs(wordsNow).map(s => s.scene))]) {
  const f = `src/narration-scenes/${scene}.js`;
  if (!git("diff", "--name-only", base, "HEAD", "--", f).trim()) continue;
  const oldSrc = gitBuf("show", `${base}:${f}`);
  if (!oldSrc) out({ kind: "full", base, why: `no ${scene} scene at the render's commit` });
  const [a, b] = [await loadScene(oldSrc.toString()), await loadScene(fs.readFileSync(f, "utf8"))];
  const wide = (s) => JSON.stringify({ ...s, cues: undefined, sound: undefined, backing: undefined, title: undefined, blurb: undefined, poster: undefined, posterWide: undefined });
  if (wide(a) !== wide(b)) out({ kind: "full", base, why: `a scene-wide field of ${scene} changed` });
  const take = segs(wordsNow).find(s => s.scene === scene).take;
  const srcNow = JSON.parse(fs.readFileSync(`public/narration/${take}/words.json`, "utf8"));
  const srcOldBuf = gitBuf("show", `${base}:public/narration/${take}/words.json`);
  if (!srcOldBuf) out({ kind: "full", base, why: `no ${take} words at the render's commit` });
  const timedOn = (scene, words) => {
    const toks = words.map(([w, s, e]) => ({ n: norm(w), s, e }));
    const find = (phrase, lo) => {
      const p = phrase.split(/\s+/).map(norm).filter(Boolean);
      for (let i = 0; i + p.length <= toks.length; i++)
        if (toks[i].s >= lo && p.every((x, j) => same(toks[i + j].n, x))) return { s: toks[i].s, e: toks[i + p.length - 1].e };
      return null;
    };
    let cursor = 0;
    return scene.cues.map(c => {
      if (c.t != null) return { c, t: c.t };
      let hit = null;
      for (const ph of [].concat(c.at)) { hit = find(ph, cursor); if (hit) break; }
      if (!hit) return null;
      cursor = hit.s;
      return { c, t: Math.max(0, (c.atEnd ? hit.e : hit.s) + (c.offset ?? -0.25)) };
    }).filter(Boolean);
  };
  const key = ({ c, t }) => t.toFixed(3) + JSON.stringify(c);
  const [ta, tb] = [timedOn(a, JSON.parse(srcOldBuf.toString()).words), timedOn(b, srcNow.words)];
  const [ka, kb] = [new Set(ta.map(key)), new Set(tb.map(key))];
  const changed = [...ta.filter(x => !kb.has(key(x))), ...tb.filter(x => !ka.has(key(x)))].map(x => x.t);
  for (const s of segs(wordsNow).filter(s => s.scene === scene)) {
    for (const t of changed) {
      if (t >= s.from - 0.01 && t < s.to) { const at = t - s.from + s.at; if (at < tail) ranges.push([at - 1, Math.min(tail, at + 12)]); }
      else if (t < s.from && s.at < tail) ranges.push([s.at - 1, s.at + 3]);   // carried into the piece's start
    }
  }
}
if (tail < Infinity) ranges.push([tail - 1, total]);   // the changed end, rendered to the new end
if (!ranges.length) out(sound ? { kind: "audio", base, why: "only the sound changed" } : { kind: "none", base, why: "no cue or caption changed" });

// merged, inside the video; most of it changed: whole
ranges.sort((x, y) => x[0] - y[0]);
const merged = [];
for (const [s, e] of ranges.map(([s, e]) => [Math.max(0, s), Math.min(total, e)])) {
  if (merged.length && s <= merged.at(-1)[1] + 1) merged.at(-1)[1] = Math.max(merged.at(-1)[1], e);
  else merged.push([s, e]);
}
const share = merged.reduce((n, [s, e]) => n + e - s, 0) / total;
if (share > 0.7) out({ kind: "full", base, why: `${Math.round(share * 100)}% of it changed` });
out({ kind: "partial", base, ranges: merged.map(([s, e]) => `${fmt(s)}-${e >= total - 0.01 && tail < Infinity ? "end" : fmt(e)}`).join(", "), sound,
      tail: tail < Infinity,
      why: `${Math.round(share * 100)}% changed${tail < Infinity ? `, the timing from ${fmt(tail)} on` : ""}${sound ? ", and the sound" : ""}` });
