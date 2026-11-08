// =============================================================
// Scene: short-l2-dance-of-the-forces — a Short cut from long video 2 (video/cuts/short-l2-dance-of-the-forces.json),
// six pieces of the opening carved by phrase: the tug of war on the diagonal, gravity crushing the atoms, the strong
// force at fusion, the truce on the main sequence, the fuel running out, the weak force at the supernova, to "held
// together by pure gravity" (the author's idea, 2026-11-06). Its cues come from its take's scene. On top, for the
// cut alone: the visual opener (the author, 2026-11-05): over the 2.5 s lead, a slow push in to where the story
// starts (the bacterium on the diagonal), the rulers pinned and the two axes named, then it hands over to the words.
// =============================================================

export default {
  cues: [
    { t: 0, cam: {"r": -4.3, "m": -12, "span": 7.8}, dur: 0.05, drift: 0, units: true,
      hl: [{ axis: "right", label: "mass · ×10 a step" }, { axis: "bottom", label: "size · ×10 a step", delay: 0.3 }] },
    { t: 0.1, cam: {"r": -4.3, "m": -12, "span": 4.6}, dur: 2.4, ease: "gentle", drift: 0 },
    { t: 2.5, clear: true },
  ],
};
