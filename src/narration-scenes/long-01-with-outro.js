// =============================================================
// Scene: long-01-with-outro — long video 1 with the author's "I've been obsessed…" lines kept after
// "…why fire looks the way it does" (the author, 2026-11-04): a slow zoom out to the whole triangle,
// a zoom in onto the moth (Eois stantonae), the 2 s pause, then "So let's start with that first diagonal
// I mentioned" pushes out to the insects, the same shot long-01-intro lands on, so the rest of the
// video is that render's frames (video/cuts/long-01-with-outro.json "insertInto";
// scripts/narration-render-insert.py).
// =============================================================

import base from "./long-01-intro.js";

const MAP = { r: -2.2, m: -4.8, span: 74 };          // as short-01-hook's
const MOTH = { r: -0.93, m: -2.22, span: 0.9 };      // as short-02-up-the-line's opening
const INSECTS = { r: -0.7, m: -1.6, span: 2.4 };     // as short-02-up-the-line's

export default {
  posterWide: base.posterWide,
  cover: base.cover,
  classicWide: base.classicWide,
  cues: [
    { at: "the way it does", atEnd: true, offset: 0.5, spectrum: false },
    { at: "obsessed", cam: MAP, dur: 6.8, ease: "gentle", drift: 0, clear: true },
    { at: "I could talk", cam: MOTH, dur: 6.6, ease: "gentle", drift: 0 },
    { at: "So let's start", cam: INSECTS, dur: 3.15, ease: "gentle", drift: 0 },
    { at: "that first diagonal", hl: [{ line: "water", label: "the diagonal" }] },
  ],
};
