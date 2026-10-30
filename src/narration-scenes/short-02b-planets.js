// =============================================================
// Scene: short-02b-planets — video 2's second half as a short of its own (video/cuts/short-02b-planets.json):
// its cues come from short-02-up-the-line's scene. These are on top, for this cut alone:
// "As we move up the line" opens on the line itself, the two axes named, with arrows both ways,
// and the density of water (the author, 2026-10-30), before the source's pan to the rocks
// ("less potato").
// =============================================================
const AX = "#e8ecff";
export default {
  cues: [
    { at: "As we move up the line", offset: -0.4, cam: { r: 6.0, m: 18.4, span: 9 }, dur: 0.9, units: true, unitsUntil: "less potato",
      hl: [
        { line: "water", label: "density of water", size: 26, labelAt: [5.6, 17.42] },
        { arrow: true, both: true, solid: true, width: 3, color: AX, from: { r: 9.7, m: 14.6 }, to: { r: 9.7, m: 25.4 }, draw: 0.8 },
        { text: "Mass (log kg)", at: [9.25, 20.0], rotate: -90, size: 26, color: AX },
        { arrow: true, both: true, solid: true, width: 3, color: AX, from: { r: 2.2, m: 13.6 }, to: { r: 9.2, m: 13.6 }, draw: 0.8, delay: 0.3 },
        { text: "Width (log m)", at: [5.0, 14.4], size: 26, color: AX, delay: 0.3 },
      ] },
  ],
};
