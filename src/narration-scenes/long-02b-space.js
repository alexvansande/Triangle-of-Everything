// =============================================================
// Scene: long-02b-space — only the YouTube thumbnail of long video 2 part one ("The Triangle of Everything: The Upper
// Limit"); the video itself plays long-02b-opening's cues (video/cuts/long-02b-space.json, words.json "scene").
// The thumbnail (the author, 2026-11-26): the stars' life cycle with its icons small, living, dying and dead stars named,
// the black-hole line, and on it "nothing can exist above this"; the title and subtitle on top.
// =============================================================

const SCHW = { line: "schwarzschild" };
const LOW = { path: "stellar-low-mass" }, HIGH = { path: "stellar-high-mass" };
const CYCLE = [LOW, HIGH, { path: ["nebula-to-nursery", "remnant-to-nursery"] }];
const T = (text, at, size, color) => ({ text, at, size, ...(color ? { color } : {}), instant: true });

export default {
  posterWide: { at: 3, set: { iconSize: 34 }, cues: [{ t: 0, cam: { r: 12.6, m: 33.6, span: 22 }, dur: 0.1, drift: 0, hl: [
    ...CYCLE.map(h => ({ ...h, draw: 0.01 })),
    { side: "left", of: "schwarzschild" },
    { ...SCHW, label: "nothing can exist above this", size: 17, labelAt: [6.4, 34.6], labelOffset: 12, instant: true },
    { obj: "Sun", label: "living stars", place: "above", labelSize: 18, instant: true },
    { obj: "Red Giant", label: "dying stars", place: "above", labelSize: 18, instant: true },
    { obj: "White Dwarf", label: false, instant: true },
    T("dead stars", [8.2, 32.75], 18, "#e0e0e0"),
    { obj: "Stellar BH", label: false, instant: true },
    T("black holes", [8.1, 34.45], 18, "#ff5a6e"),
    { ellipse: [9.85, 31.2, 0.5, 1.7], rot: 0, label: "super-Jupiters", place: "left", color: "#ffd54f", draw: 0.01 },
    T("The Triangle of Everything", [16.4, 31.85], 20, "#ffd54f"),
    T("The Upper Limit", [16.4, 30.97], 32, "#ffd54f"),
    T("super-Jupiters, stars and black holes", [16.4, 29.5], 15),
  ] }] },
};
