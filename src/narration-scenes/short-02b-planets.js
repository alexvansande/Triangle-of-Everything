// =============================================================
// Scene: short-02b-planets — video 2's second half as a short of its own (video/cuts/short-02b-planets.json):
// its cues come from short-02-up-the-line's scene. These are on top, for this cut alone:
// "If you plot everything by mass and size" (rec51) opens on the line itself, the two axes named, with arrows both ways,
// and the density of water (the author, 2026-10-30), before the source's pan to the rocks
// ("…potato shapes into spheres").
// =============================================================
const AX = "#e8ecff";
export default {
  // the YouTube thumbnail (scripts/narration-poster.mjs): the super-Jupiters' vertical line, Jupiter
  // at its foot, and "Why are super-Jupiters all Jupiter-sized?": the size, not the mass (the author, 2026-11-03)
  poster: { at: 3, cues: [{ t: 0, cam: { r: 9.85, m: 30.85, span: 2.5 }, dur: 0.1, drift: 0, hl: [
    { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f", draw: 0.01 },
    { obj: "Jupiter", label: "Jupiter", place: "left" }, { obj: "Y Brown Dwarf", label: false },
    { text: "Why are\nsuper-Jupiters all\nJupiter-sized?", at: [9.85, 32.55], size: 38, color: "#ffd54f", instant: true }] }] },
  cues: [
    { at: "plot everything by mass", offset: -0.4, cam: { r: 6.0, m: 18.4, span: 9 }, dur: 0.9, units: true, unitsUntil: "potato shapes into",
      hl: [
        { line: "water", label: "density of water", size: 26, labelAt: [5.6, 17.42] },
        { arrow: true, both: true, solid: true, width: 3, color: AX, from: { r: 9.7, m: 14.6 }, to: { r: 9.7, m: 25.4 }, draw: 0.8 },
        { text: "Mass (log kg)", at: [9.25, 20.0], rotate: -90, size: 26, color: AX },
        { arrow: true, both: true, solid: true, width: 3, color: AX, from: { r: 2.2, m: 13.6 }, to: { r: 9.2, m: 13.6 }, draw: 0.8, delay: 0.3 },
        { text: "Width (log m)", at: [5.0, 14.4], size: 26, color: AX, delay: 0.3 },
      ] },
  ],
};
