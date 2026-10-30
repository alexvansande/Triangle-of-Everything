// =============================================================
// Scene: long-01-intro — the hook and video 2 joined as one 16:9 video (video/cuts/long-01-intro.json).
// On top of the pieces' own scenes: the cover starts smaller and stays whole for longer, the
// classic figure then opens out to the 16:9 frame, and the
// outro, instead of zooming out to the whole triangle, pans and zooms slowly to where video 2
// opens (Eois stantonae), across the 2 s pause between them (the author, 2026-10-30).
// =============================================================

export default {
  cover: { from: 0.32, dur: 7 },
  // once the cover has gone (7.9 s), the classic figure's frame opens slowly to the full width
  classicWide: [8, 16],
  cues: [
    // from "obsessed" to the first word of video 2 (107.7 s): one slow, even move
    { at: "obsessed", offset: 0.05, cam: { r: -0.93, m: -2.22, span: 0.9 }, dur: 18.1, ease: "gentle", drift: 0, clear: true },
  ],
};
