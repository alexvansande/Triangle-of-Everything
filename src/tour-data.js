// src/tour-data.js
// Tour step definitions. Content lives in content/tour-content.md; metadata (zoom, labels) here.

import rawContent from "../content/tour-content.md?raw";

// ---- Parse markdown into sections keyed by ## heading ----
function parseTourMarkdown(raw) {
  const sections = {};
  let currentId = null;
  let lines = [];
  for (const line of raw.split("\n")) {
    if (line.startsWith("## ")) {
      if (currentId) sections[currentId] = lines.join("\n").trim();
      currentId = line.slice(3).trim();
      lines = [];
    } else {
      lines.push(line);
    }
  }
  if (currentId) sections[currentId] = lines.join("\n").trim();
  return sections;
}

const CONTENT = parseTourMarkdown(rawContent);

// ---- Big Bang era configuration ----
// Each era defines which objects are visible (by category/slug) and the Hubble radius.
// hubbleLogR: log₁₀(c × t) ≈ 10.48 + log₁₀(t_seconds)
// Objects appear cumulatively — each era adds to what's already visible.

export const BIG_BANG_ERAS = {
  planck:        { hubbleLogR: -32.8, whiteOverlay: 0,
                   showSlugs: ["big-bang"] },
  gut:           { hubbleLogR: -25.5, whiteOverlay: 0,
                   showSlugs: ["big-bang", "x-y-bosons"] },
  electroweak:   { hubbleLogR: -1.5,  whiteOverlay: 0,
                   showCats: ["particle", "composite"] },
  nuclear:       { hubbleLogR: 4.5,   whiteOverlay: 0,
                   showCats: ["particle", "composite"],
                   showSlugs: ["hydrogen", "helium"] },
  recombination: { hubbleLogR: 23.6,  whiteOverlay: 0,
                   showCats: ["particle", "composite", "atomic"],
                   showSlugs: ["cmb-photon", "gamma-ray", "x-ray",
                               "ultraviolet", "visible-light",
                               "infrared", "microwave", "am-radio", "fm-radio"] },
  stellar:       { hubbleLogR: 26.5,  whiteOverlay: 0,
                   showAll: true,
                   hideCats: ["micro", "macro"] },
  now:           { hubbleLogR: 28.14, whiteOverlay: 0,
                   showAll: true },
  future:        { hubbleLogR: 28.14, whiteOverlay: 0,
                   showAll: true,
                   hideCats: ["macro"],
                   hideSlugs: ["earth", "mars", "venus", "mercury",
                               "moon", "io", "europa", "ganymede", "callisto",
                               "enceladus", "mimas", "deimos", "phobos"],
                   moveObjects: { sun: { logR: 13.0, logM: 33.30 } } },
  "far-future":  { hubbleLogR: 28.2,  whiteOverlay: 0,
                   showCats: ["remnant", "blackhole", "particle"],
                   showSlugs: ["big-bang"] },
  death:         { hubbleLogR: 28.2,  whiteOverlay: 0,
                   showCats: ["blackhole"],
                   fadeBlackHoles: true },
};

// ---- Step metadata (zoom regions, IDs, labels) ----
const TOUR_META = [
  {
    id: "intro",
    title: null,
    nextLabel: "Start Tour",
    isIntro: true,
    view: null,
    highlightObjects: [],
    contextLabel: null,
  },
  {
    id: "axes",
    title: "Understanding the Axes",
    nextLabel: "The Density Diagonal",
    view: { x: [-2, 4], y: [-1, 9] },
    highlightObjects: [],
    contextLabel: "Learn about the axes",
  },
  {
    id: "density",
    title: "The Density Diagonal",
    nextLabel: "Human Scale to Planets",
    view: { x: [-2, 6], y: [-4, 12] },
    highlightObjects: [],
    contextLabel: "Learn about density",
  },
  {
    id: "human-to-planets",
    title: "From Human Scale to Planets",
    nextLabel: "Planets to Stars",
    view: { x: [3, 10], y: [8, 28] },
    highlightObjects: [],
    contextLabel: "From humans to planets",
  },
  {
    id: "planets-to-stars",
    title: "From Planets to Stars",
    nextLabel: "Stellar Evolution",
    view: { x: [5, 18], y: [28, 36] },
    highlightObjects: [],
    contextLabel: "From planets to stars",
  },
  {
    id: "stellar-evolution",
    title: "Stellar Evolution",
    nextLabel: "The Stellar Cycle",
    view: { x: [8, 16], y: [30, 36] },
    highlightObjects: [],
    contextLabel: "Learn about stellar evolution",
  },
  {
    id: "stellar-cycle",
    title: "The Stellar Cycle",
    nextLabel: "Black Holes",
    view: { x: [5, 22], y: [29, 38] },
    highlightObjects: [],
    contextLabel: "Learn about the stellar cycle",
  },
  {
    id: "black-holes",
    title: "The Upper Limit: Black Holes",
    nextLabel: "Large Structures",
    view: { x: [-4, 16], y: [22, 44] },
    highlightObjects: [],
    contextLabel: "Learn about black holes",
  },
  {
    id: "dark-matter",
    title: "Large Structures and Dark Matter",
    nextLabel: "The Largest Structures",
    view: { x: [16, 27], y: [38, 52] },
    highlightObjects: [],
    contextLabel: "Learn about dark matter",
  },
  {
    id: "largest",
    title: "The Largest Structures",
    nextLabel: "The Microscopic World",
    view: { x: [20, 29], y: [42, 57] },
    highlightObjects: [],
    contextLabel: "Learn about cosmic structures",
  },
  {
    id: "microscopic",
    title: "The Microscopic World",
    nextLabel: "The Compton Limit",
    view: { x: [-12, -2], y: [-28, -14] },
    highlightObjects: [],
    contextLabel: "Learn about the microscopic world",
  },
  {
    id: "compton",
    title: "The Compton Limit",
    nextLabel: "The EM Spectrum",
    view: { x: [-16, -6], y: [-40, -22] },
    highlightObjects: [],
    contextLabel: "Learn about the Compton limit",
  },
  {
    id: "em-spectrum",
    title: "The Electromagnetic Spectrum",
    nextLabel: "Particle Physics",
    view: { x: [-8, 6], y: [-42, -28] },
    highlightObjects: [],
    contextLabel: "Learn about the EM spectrum",
  },
  {
    id: "particle-physics",
    title: "Particle Physics and Phase Transitions",
    nextLabel: "Laboratory Limits",
    view: { x: [-18, -8], y: [-29, -19] },
    highlightObjects: [],
    contextLabel: "Learn about particle physics",
  },
  {
    id: "lab-limits",
    title: "Laboratory Limits",
    nextLabel: "Theoretical Limits",
    view: { x: [-32, -8], y: [-22, -6] },
    highlightObjects: [],
    contextLabel: "Learn about lab limits",
  },
  {
    id: "theoretical",
    title: "Theoretical Limits",
    nextLabel: "The Beginning",
    view: { x: [-32, -8], y: [-50, -16] },
    highlightObjects: [],
    contextLabel: "Learn about theoretical limits",
  },
  // ======== BIG BANG ANIMATED TIMELINE ========
  // Steps below have `bigBang` config — activates cinematic animation mode:
  // dynamic Hubble radius, white overlay, object fade-in/out by era.
  {
    id: "the-beginning",
    title: "The Beginning",
    nextLabel: "Grand Unification",
    view: null, // auto-fit to triangle at era's Hubble radius
    highlightObjects: [],
    contextLabel: "Learn about the Big Bang",
    bigBang: { era: "planck", enterWhite: true, duration: 3000 },
  },
  {
    id: "gut",
    title: "Grand Unification",
    nextLabel: "The Electroweak Era",
    view: null,
    highlightObjects: [],
    contextLabel: null,
    bigBang: { era: "gut", duration: 5000 },
  },
  {
    id: "electroweak",
    title: "The Electroweak Era",
    nextLabel: "The Nuclear Era",
    view: null,
    highlightObjects: [],
    contextLabel: null,
    bigBang: { era: "electroweak", duration: 5000 },
  },
  {
    id: "nuclear",
    title: "The Nuclear Era",
    nextLabel: "Recombination",
    view: null,
    highlightObjects: [],
    contextLabel: null,
    bigBang: { era: "nuclear", duration: 4000 },
  },
  {
    id: "recombination",
    title: "Recombination",
    nextLabel: "The First Stars",
    view: null,
    highlightObjects: [],
    contextLabel: null,
    bigBang: { era: "recombination", duration: 5000 },
  },
  {
    id: "atomic-era",
    title: "Stars and Galaxies",
    nextLabel: "The Present",
    view: null,
    highlightObjects: [],
    contextLabel: null,
    bigBang: { era: "stellar", duration: 4000 },
  },
  {
    id: "now",
    title: "The Present",
    nextLabel: "The Future",
    view: null,
    highlightObjects: [],
    contextLabel: null,
    bigBang: { era: "now", duration: 4000 },
  },
  {
    id: "future",
    title: "The Future",
    nextLabel: "The Far Future",
    view: null,
    highlightObjects: [],
    contextLabel: null,
    bigBang: { era: "future", duration: 5000 },
  },
  {
    id: "far-future",
    title: "The Far Future",
    nextLabel: "Heat Death",
    view: null,
    highlightObjects: [],
    contextLabel: null,
    bigBang: { era: "far-future", duration: 5000 },
  },
  {
    id: "heat-death",
    title: "The Heat Death of the Universe",
    nextLabel: "Credits",
    view: null,
    highlightObjects: [],
    contextLabel: null,
    bigBang: { era: "death", duration: 6000 },
  },
  {
    id: "credits",
    title: "Credits",
    nextLabel: null, // last step
    view: null, // full view
    highlightObjects: [],
    contextLabel: null,
    // No bigBang — exits Big Bang mode, restores everything
  },
];

// ---- Merge content + metadata ----
export const TOUR_STEPS = TOUR_META.map(meta => ({
  ...meta,
  text: CONTENT[meta.id] || "",
}));

// Auto-derive proximity regions for contextual button text.
// Expands each step's view bounds by 30% for earlier detection.
export const TOUR_REGIONS = TOUR_STEPS
  .filter(s => s.view && s.contextLabel)
  .map(s => {
    const xSpan = s.view.x[1] - s.view.x[0];
    const ySpan = s.view.y[1] - s.view.y[0];
    return {
      stepIndex: TOUR_STEPS.indexOf(s),
      label: s.contextLabel,
      x: [s.view.x[0] - xSpan * 0.3, s.view.x[1] + xSpan * 0.3],
      y: [s.view.y[0] - ySpan * 0.3, s.view.y[1] + ySpan * 0.3],
    };
  });
