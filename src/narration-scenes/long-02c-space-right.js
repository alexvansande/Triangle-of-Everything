// =============================================================
// Scene: long-02c-space-right — only the YouTube thumbnail of long video 2 part two ("The Triangle of Everything: The
// Outer Limit"); the video itself plays long-02c-outer's cues (video/cuts/long-02c-space-right.json, words.json
// "scene"). The thumbnail, as the Upper Limit's: the right of the chart, galaxies to superclusters and voids, the
// Hubble line and the black-hole line meeting at our universe, the observable universe outside the triangle; the
// title and subtitle on top (composited over the still).
// =============================================================

const T = (text, at, size, color) => ({ text, at, size, ...(color ? { color } : {}), instant: true });

export default {
  posterWide: { at: 3, set: { iconSize: 34 }, cues: [{ t: 0, cam: { r: 25.6, m: 51.2, span: 25 }, dur: 0.1, drift: 0, bg: { to: 1, dur: 0.01 },
    hideObjects: [], hideIcons: ["Boötes Void", "Eridanus Supervoid", "KBC Void"], hl: [
    { line: "schwarzschild", instant: true },
    { line: "hubble", instant: true },
    T("galaxies", [24.3, 45.1], 9, "#e0e0e0"),
    T("clusters", [26.1, 47.4], 9, "#e0e0e0"),
    T("superclusters", [28.0, 49.4], 9, "#e0e0e0"),
    T("cosmic event horizon", [30.4, 56.0], 9, "#ffd54f"),
    T("observable universe", [31.2, 57.6], 9, "#ff8a65"),
  ] }] },
};
