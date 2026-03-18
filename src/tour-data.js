// src/tour-data.js
// Tour step definitions. Content lives in tour-content.md; metadata (zoom, labels) here.

import rawContent from "./tour-content.md?raw";

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
  {
    id: "beginning",
    title: "The Beginning",
    nextLabel: "Condensation",
    view: { x: [-34, -28], y: [-10, 2] },
    highlightObjects: [],
    contextLabel: "Learn about the Big Bang",
  },
  {
    id: "condensation",
    title: "Condensation of the Universe",
    nextLabel: null, // last step
    view: { x: [-26, -8], y: [-10, 10] },
    highlightObjects: [],
    contextLabel: "Learn about condensation",
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
