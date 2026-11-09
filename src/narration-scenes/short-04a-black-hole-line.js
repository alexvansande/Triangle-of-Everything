// =============================================================
// Scene: short-04a-black-hole-line — The Black Hole Line, part 1, a cut (video/cuts/short-04a-black-hole-line.json):
// its pieces play with their own takes' scenes. This file holds only its thumbnail (scripts/narration-poster.mjs).
// =============================================================
// Field reference: docs/narration.md, "Scene fields".

export default {
  // the thumbnail (the author, 2026-11-09): the objects up to the black-hole line, the super-Jupiters, the brown
  // dwarfs, the first stars of the main sequence, a white dwarf and a neutron star, named; the line itself lit, "every
  // black hole sits here"; and beyond it, "nothing can exist here". The rulers and their MASS and SIZE stay on.
  poster: { at: 3, set: { forceIcons: ["Jupiter", "T Brown Dwarf", "L Brown Dwarf", "Red Dwarf", "Sun", "White Dwarf", "PSR J0030+0451"],
    hideLabels: ["Jupiter", "T Brown Dwarf", "L Brown Dwarf", "Y Brown Dwarf", "Red Dwarf", "Proxima Cen", "Sun", "White Dwarf", "PSR J0030+0451"] },
  cues: [{ t: 0, cam: { r: 8.6, m: 34.0, span: 7.6 }, dur: 0.1, drift: 0, hl: [
    { line: "schwarzschild", draw: 0.01, label: "every black hole\nsits here", size: 30, labelOffset: 8, labelAt: [9.9, 37.73] },
    { text: "nothing can\nexist here", at: [6.9, 38.7], size: 30, instant: true },
    { obj: "Jupiter", label: "super-Jupiters", place: "left", labelSize: 22 },
    { obj: "T Brown Dwarf", label: "brown dwarfs", place: "left", labelSize: 22 },
    { obj: "Sun", label: "stars", place: "above", labelSize: 22 },
    { obj: "White Dwarf", label: "white dwarf", place: "below", labelSize: 22 },
    // (a free label: placed by the object, it went off the left edge)
    { obj: "PSR J0030+0451", label: false },
    { text: "neutron star", at: [6.15, 32.9], size: 22, color: "#eef1f6", instant: true }] }] },
};
