#!/usr/bin/env node
// What changed in a short since its last render, so the render redoes only that:
//   node scripts/narration-render-diff.mjs short-04-black-holes
// prints one line of JSON: { kind, ranges, base, why }
//   kind "none"     nothing the video shows or plays changed (a comment, a note): keep the render
//        "audio"    only the sound (voice treatment, music, effects), same timing: swap the audio track
//        "partial"  some cues (and maybe the sound), same timing: re-render `ranges` ("m:ss-m:ss, …")
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
const files = git("diff", "--name-only", base, "HEAD", "--", dir, sceneFile).split("\n").filter(Boolean);
if (!files.length) out({ kind: "none", base, why: "nothing of this take changed since its render" });

// the timing: the words (start, end) and the length; a text-only change shows in the captions
const wordsNow = JSON.parse(fs.readFileSync(`${dir}/words.json`, "utf8"));
const oldBuf = gitBuf("show", `${base}:${dir}/words.json`);
if (!oldBuf) out({ kind: "full", base, why: "no words.json at the render's commit" });
const wordsOld = JSON.parse(oldBuf.toString());
const ww = (m) => m.words || [];
const total = wordsNow.duration + (wordsNow.credits || 0);
if (Math.abs(wordsNow.duration - wordsOld.duration) > 0.001 || (wordsNow.credits || 0) !== (wordsOld.credits || 0)
    || ww(wordsNow).length !== ww(wordsOld).length
    || ww(wordsNow).some(([, s, e], i) => Math.abs(s - ww(wordsOld)[i][1]) > 0.001 || Math.abs(e - ww(wordsOld)[i][2]) > 0.001))
  out({ kind: "full", base, why: "the cut's timing changed" });
const ranges = [];
ww(wordsNow).forEach(([w, s, e], i) => { if (w !== ww(wordsOld)[i][0]) ranges.push([s - 1, e + 2]); });   // a caption's text
// a change to anything else in words.json (the audio file's name, tempo…) besides the words: whole
const rest = (m) => JSON.stringify({ ...m, words: undefined });
if (rest(wordsNow) !== rest(wordsOld)) out({ kind: "full", base, why: "words.json's settings changed" });
const sound = files.some(f => /\/(audio|mix)\.m4a$/.test(f));

// the scene: load both versions (plain modules, no imports) and compare cue by cue
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
  const norm = (w) => w.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9']/g, "");
  const toks = ww(wordsNow).map(([w, s, e]) => ({ n: norm(w), s, e }));
  const same = (x, y) => x === y || x.replace(/s$/, "") === y.replace(/s$/, "");
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
  ca.forEach((x, i) => { if (!kb.has(key(x))) ranges.push(span(ca, i)); });
  cb.forEach((x, i) => { if (!ka.has(key(x))) ranges.push(span(cb, i)); });
}
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
out({ kind: "partial", base, ranges: merged.map(([s, e]) => `${fmt(s)}-${fmt(e)}`).join(", "), sound,
      why: `${Math.round(share * 100)}% changed${sound ? ", and the sound" : ""}` });
