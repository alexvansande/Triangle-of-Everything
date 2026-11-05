// =============================================================
// Scene: short-l2-edge-of-the-chart — a Short cut from long video 2 (video/cuts/short-l2-edge-of-the-chart.json): its cues come from its
// take's scene. On top, for the cut alone: the visual opener the author asked for on 2026-11-05 instead
// of a spoken intro ("show the axis, show log: mass here, size here"): over the 2.5 s lead, a slow push
// in to where the story starts, the rulers pinned and the two axes named, then it hands over to the words.
// =============================================================

export default {
  cues: [
    { t: 0, cam: {"r": 15.2, "m": 35.6, "span": 28.9}, dur: 0.05, drift: 0, units: true,
      hl: [{ axis: "right", label: "mass · ×10 a step" }, { axis: "bottom", label: "size · ×10 a step", delay: 0.3 }] },
    { t: 0.1, cam: {"r": 15.2, "m": 35.6, "span": 17}, dur: 2.4, ease: "gentle", drift: 0 },
    { t: 2.5, clear: true },
  ],
};
