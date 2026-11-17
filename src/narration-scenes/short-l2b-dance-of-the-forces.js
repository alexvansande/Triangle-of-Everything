// =============================================================
// Scene: short-l2b-dance-of-the-forces — the forces Short cut from long video 2's new opening (rec74, 2026-11-17;
// video/cuts/short-l2b-dance-of-the-forces.json): its cues come from its take's scene (long-02b-opening.js). On top, for
// the cut alone: the Shorts' visual opener (the author, 2026-11-05: the Shorts open on the axes), over the 2.5 s lead a
// slow push in from the whole diagonal, the rulers pinned and the two axes named; and the end credits.
// =============================================================

export default {
  credits: 3,
  cues: [
    { t: 0, cam: { r: 5.5, m: 14, span: 30 }, dur: 0.05, drift: 0, units: true,
      hl: [{ axis: "right", label: "mass · ×10 a step" }, { axis: "bottom", label: "size · ×10 a step", delay: 0.3 }] },
    { t: 0.1, cam: { r: 5.0, m: 13, span: 26 }, dur: 2.4, ease: "gentle", drift: 0 },
    { t: 2.5, clear: true },
  ],
};
