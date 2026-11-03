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
