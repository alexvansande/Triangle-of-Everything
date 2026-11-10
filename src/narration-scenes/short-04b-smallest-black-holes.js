// =============================================================
// Scene: short-04b-smallest-black-holes — The Smallest Black Holes, part 2 of video 4, as a take of its own (the
// author's re-recordings of 2026-11-09, rec61 and rec60: video/short-04b-smallest-black-holes/). The new opening is
// the black-hole line as relativity's limit (The Black Hole Slope's shots: the Moon squeezed onto the line, the line,
// the dark side beyond it); from "with enough pressure" on, video 4's scene, its phrases given this take's wording.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

import V4 from "./short-04-black-holes.js";

const SCHW = { line: "schwarzschild" };
const BH = (m) => ({ r: m - 27.83, m, mark: true });
// this take's wording for video 4's phrases (a cue matches any of its `at`)
const ALSO = {
  "the core of a dying star": "very large star dies",
  "instants after the big bang": "instants just after the big bang",
  "super dense soup": "hot and dense soup",
  "they'd have evaporated": "have evaporated",
  "they'd be invisible": "would be invisible",
  "we don't know what it is": "we don't know what dark matter is",
  "if they are just tiny black holes": "if it's just tiny black holes",
  "lumps about roughly this size": "lumps roughly this size",
  "any new particles": "any new particle",
  "very first moments of our history": "very first instants of our history",
};
const reword = (c) => {
  const at = [].concat(c.at ?? []);
  const extra = at.map(a => ALSO[a]).filter(Boolean);
  return extra.length ? { ...c, at: [...at, ...extra] } : c;
};
const from = V4.cues.findIndex(c => [].concat(c.at).includes("with enough pressure"));

// The window on the line, from "we don't know what dark matter is" to the end: drawn once, then kept as it is.
// Video 4 draws it again at "something else entirely" (2.5 s into the zoom out: the bracket runs along the line a
// second time, what the author saw as "the line animation restarts" at 2:03, reported three times by 2026-11-10),
// and names the contested neutron-star limit on it again from "if it's just tiny black holes" on ("might still be
// ruled out by neutron star studies", with its source): that label was shown at "narrow window" (1:10) already, and
// doesn't need to come back (the author, 2026-11-10). So here every later window keeps only the microlensing and
// Hawking cuts, and one already on screen comes in at once, not redrawn.
const NS = (q) => /neutron star/i.test((q && (q.label || q.title)) || "");
const AGAIN = ["if they are just tiny black holes", "any new particles", "to explain them", "something else entirely", "somewhere on this chart",
  "not only on the black hole line", "lumps about roughly this size", "can't be here either", "the search for dark matter"];
function fixWindow(c) {
  if (!c.hl || !AGAIN.some(a => [].concat(c.at).includes(a))) return c;
  const hl = c.hl.filter(q => q.window || !NS(q)).map(q => {
    if (!q.window || !q.cuts) return q;
    const cuts = q.cuts.filter(x => !NS(x));
    // the window narrowing at "any new particle" (from W6) and the staged full set of cuts at "the search for dark
    // matter" (quasars, microwave background, waves) still play; a plain re-listing comes in at once
    return q.from || cuts.length > 2 ? { ...q, cuts } : { ...q, cuts, instant: true, delay: 0 };
  });
  return { ...c, hl };
}

export default {
  ...V4,
  title: "The Smallest Black Holes",
  blurb: "What is the smallest black hole that could exist? Some might have formed in the first instants after the Big Bang, and if they're still around, they could be the dark matter we can't see.",
  start: { r: 4.2, m: 26.6, span: 16 },
  poster: undefined, posterWide: undefined,
  cues: [
    // the line: for any mass, a size it can't go under (the Moon squeezed down onto it)
    { at: "for any given mass", cam: { r: 4.2, m: 26.6, span: 16 }, dur: 3, hl: [SCHW, { obj: "Moon" }] },
    { at: "minimum size", hl: [SCHW, { obj: "Moon" }, { arrow: true, from: { obj: "Moon" }, to: BH(25.87), label: "squeeze", delay: 0.2 }] },
    { at: "collapses into a black hole", hl: [SCHW, { obj: "Moon", label: false }, { arrow: true, from: { obj: "Moon" }, to: BH(25.87), draw: 0.01 }, { ...BH(25.87), label: "a black hole" }] },
    { at: "once it becomes a black hole", cam: { obj: "Sgr A*", span: 15 }, dur: 5, drift: 0.02, clear: true, hl: [{ ...SCHW, label: "every black hole lives here" }] },
    // (the "physically impossible" sentence cut, the author, 2026-11-09: its label comes with the line's)
    { at: "constantly on this line", hl: [{ ...SCHW, label: "every black hole lives here" }, { text: "nothing can\nexist here", at: [9, 46.5], size: 26, delay: 0.6 }] },   // (in the dark side, clear of the frame's edge)
    // the dark-matter maps (the candidates, the window, the crossed-out areas): the dots only, no pictures (the author,
    // 2026-11-09), until the ending pulls back out
    ...V4.cues.slice(from).map(reword).map((c, i, all) => {
      const s = all.findIndex(q => [].concat(q.at).includes("something invisible")), e = all.findIndex(q => [].concat(q.at).includes("very first moments of our history"));
      return i >= s && i < e ? { ...c, icons: false } : i === e ? { ...c, icons: true } : c;
    })
    // the black-hole line is on screen from the start here: where video 4 lists it again after clearing (its "something
    // else entirely"), it stays put instead of drawing itself again (the author, 2026-11-09: "the line animation restarts")
      .map(c => c.hl ? { ...c, hl: c.hl.map(q => q.line === "schwarzschild" && q.draw === undefined ? { ...q, draw: 0.01 } : q) } : c)
      .map(fixWindow),
  ],
};

