// =============================================================
// Scene: long-01-intro — the hook and video 2 joined as one 16:9 video (video/cuts/long-01-intro.json),
// recorded in one take with its three Shorts (rec51, 2026-11-03). On top of the pieces' own scenes:
// the cover starts smaller and stays whole for longer, the classic figure then opens out to the 16:9
// frame, and after "…why fire looks the way it does" (the long one has no outro) the camera flies
// slowly from the light to the insects across the 2 s pause and "So let's start with that first
// diagonal I mentioned", the long one's own line. It lands where video 2's Short opening ends
// (short-02-up-the-line's INSECTS), so the join into "In the metric system" doesn't jump.
// =============================================================

const INSECTS = { r: -0.7, m: -1.6, span: 2.4 };   // as short-02-up-the-line's

export default {
  // the YouTube thumbnail, 16:9 (scripts/narration-poster.mjs --wide): the hook's, the whole triangle
  // with its sides named and an arrow to where they meet, and the title (the author, 2026-11-03)
  posterWide: { at: 3, cues: [{ t: 0, cam: { r: 20, m: -7, span: 250 }, dur: 0.1, drift: 0, hl: [
    { line: "schwarzschild", label: "relativity", draw: 0.01, size: 22, labelAt: [-2, 25.5] },
    { line: "compton", label: "quantum mechanics", draw: 0.01, size: 22, labelAt: [2, -42] },
    { line: "hubble", label: "the universe", draw: 0.01, size: 26 },
    { text: "Where do\nthese meet?", at: [-60, -45], size: 28, instant: true },
    { arrow: true, from: { r: -55, m: -36 }, to: { r: -33.4, m: -5.6 }, solid: true, width: 3, color: "#ffe9a3", draw: 0.01 },
    { text: "This triangle\ncontains everything\nthat has ever existed", at: [86, 0], size: 24, color: "#ffffff", instant: true }] }] },
  cover: { from: 0.32, dur: 7 },
  // once the cover has gone (7.9 s), the classic figure's frame opens slowly to the full width
  classicWide: [8, 16],
  cues: [
    // the spectrum's wave goes before the camera moves (it isn't redrawn mid-move)
    { at: "the way it does", atEnd: true, offset: 0.5, spectrum: false },
    { at: "the way it does", atEnd: true, offset: 0.6, cam: INSECTS, dur: 5, ease: "gentle", drift: 0, clear: true },
    { at: "that first diagonal", hl: [{ line: "water", label: "the diagonal" }] },
  ],
};
