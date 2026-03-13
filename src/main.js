// =============================================================
// THE TRIANGLE OF EVERYTHING — main.js
// =============================================================
//
// ARCHITECTURE OVERVIEW
// ---------------------
// This is a single-file D3.js application that renders an interactive
// log-log scatter plot of EVERY known object in the universe, from
// subatomic particles to the observable universe itself.
//
// COORDINATE SYSTEM
//   X-axis: log₁₀(radius / cm)     — ranges from ~-38 (Planck) to ~32 (Hubble)
//   Y-axis: log₁₀(mass / g)        — ranges from ~-48 to ~65
//   Both axes use EQUAL scale (1 data unit = same pixel count in X and Y),
//   which means physics lines at 45° slope appear at 45° on screen.
//
// THE TRIANGLE
//   All known objects are bounded by three lines forming an isosceles
//   right triangle:
//   1. Schwarzschild radius (slope +1): logR = logM + C_schwarz
//      → too dense = black hole
//   2. Compton wavelength (slope -1):   logR = -logM + C_compton
//      → too light/small = quantum particle
//   3. Hubble radius (vertical):        logR = 28.14
//      → beyond the observable universe
//   The three lines meet at the Planck scale (top vertex).
//
// DENSITY LINES (diagonal, slope 3)
//   Since density ρ = M / (4π/3 · R³), lines of constant density
//   have slope 3 on this chart: logM = 3·logR + const.
//   Because the universe expands, density also maps to TIME —
//   earlier epochs had higher density. So these diagonals are
//   simultaneously density lines and epoch markers.
//
// AXES
//   - Left axis:   ENERGY (10ⁿ eV) — via E = mc²
//   - Right axis:  MASS (10ⁿ kg)
//   - Bottom axis: WIDTH (10ⁿ cm) — with metric + imperial unit markers
//   - Top axis:    DENSITY / TIME — diagonal labels following density lines
//
// RENDERING PIPELINE
//   All drawing is done in SVG via D3. The `redraw()` function clears
//   and redraws every layer on each zoom/pan frame:
//     1. drawRegions()        — subtle red/purple forbidden-zone tints
//     2. drawGrid()           — adaptive multi-level grid lines
//     3. drawDensityLines()   — diagonal constant-density lines
//     4. drawTriangleOverlay()— 50% black mask outside the triangle
//     5. drawBoundaries()     — white triangle outline + reference lines
//     6. drawArrows()         — directional annotation arrows (currently empty)
//     7. drawRegionLabels()   — "SCHWARZSCHILD RADIUS" etc. watermarks
//     8. drawObjects()        — dots + labels for all 130+ objects
//     9. drawAxes()           — tick marks, numbers, unit labels
//    10. updateMinimap()      — small overview triangle in corner
//    11. updateScaleBar()     — bottom-left scale indicator
//
// ZOOM & EVENT HANDLING
//   D3's zoom behavior handles scroll-to-zoom and drag-to-pan.
//   A critical subtlety: D3 zoom suppresses click events via
//   pointer capture. To allow clicking on objects, we use
//   document-level capture-phase event listeners that fire BEFORE
//   D3's handlers, performing manual hit-testing against projected
//   object coordinates.
//
// SIDEBAR
//   The left sidebar has two modes:
//   - INTRO mode (default): shows project title + description
//   - OBJECT mode: shows details when an object is clicked
//   Closing from object mode returns to intro; closing from intro
//   collapses the sidebar entirely.
//
// DATA LOADING
//   - Object coordinates: src/objects.json
//   - Object descriptions: src/descriptions/<slug>.md (one file each)
//   - Intro text: src/texts/intro.md
//   All loaded at build time via Vite's ?raw import and import.meta.glob.
//
// =============================================================

import * as d3 from "d3";
import {
  BOUNDS, SCHWARZSCHILD_C, COMPTON_C, PLANCK_LOG_R, PLANCK_LOG_M,
  schwarzschildR, schwarzschildM, comptonR, comptonM,
  DENSITY_LINES, RADIUS_UNITS, MASS_UNITS, ENERGY_UNITS,
  CATEGORIES, DENSITY_SPHERE_C, ARROWS, EPOCH_BANDS,
  REFERENCE_LINES, HUBBLE_LOG_R,
} from "./data.js";
import objectsData from "./objects.json";
import introRaw from "./texts/intro.md?raw";
import "./style.css";

// ------------------------------------
// Load all per-object markdown descriptions at build time.
// Vite's import.meta.glob with eager:true bundles them into the JS.
// Each file is keyed by its slug (filename minus extension).
// ------------------------------------
const descFiles = import.meta.glob("./descriptions/*.md", { query: "?raw", import: "default", eager: true });
const DESC_BY_SLUG = {};
for (const [path, content] of Object.entries(descFiles)) {
  const slug = path.replace("./descriptions/", "").replace(".md", "");
  DESC_BY_SLUG[slug] = content.trim();
}

// Convert an object's display name to a filename-safe slug.
// Handles Greek letters (γ→gamma, τ→tau, μ→mu) and special chars.
function nameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/γ/g, "gamma").replace(/τ/g, "tau").replace(/μ/g, "mu")
    .replace(/['']/g, "").replace(/[*()]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Enrich raw JSON objects with computed slugs for description lookup
const OBJECTS = objectsData.map(o => ({ ...o, slug: nameToSlug(o.name) }));

// =============================================================
// Layout — margins and equal-scale viewport computation
// =============================================================
//
// Margins are generous to fit multi-row axis labels:
//   top: 90px    — density/epoch diagonal labels + "TIME" title
//   bottom: 80px — log numbers + two rows of unit markers
//   left: 145px  — energy log numbers + unit markers (eV, K, °C, etc.)
//   right: 95px  — mass log numbers + unit markers (kg, M☉, etc.)
//
// CRITICAL: both axes must have the SAME pixels-per-log-unit (ppu)
// so that the 45° physics lines (Schwarzschild slope=1, Compton slope=-1)
// actually render at 45° on screen. We compute which axis is the
// constraining one and expand the other to fill remaining space.

const margin = { top: 90, right: 95, bottom: 80, left: 145 };
let W, H, cw, ch; // window size and chart (content) width/height

let viewXMin, viewXMax, viewYMin, viewYMax;

function measure() {
  W = window.innerWidth;
  H = window.innerHeight;
  cw = W - margin.left - margin.right;
  ch = H - margin.top - margin.bottom;

  // Determine which axis constrains the equal-scale requirement
  const origXRange = BOUNDS.x.max - BOUNDS.x.min;
  const origYRange = BOUNDS.y.max - BOUNDS.y.min;
  const ppuX = cw / origXRange;
  const ppuY = ch / origYRange;

  if (ppuX > ppuY) {
    // Y-axis is tighter — use its ppu, widen X to fill horizontal space
    const ppu = ppuY;
    const xRange = cw / ppu;
    const xCenter = (BOUNDS.x.min + BOUNDS.x.max) / 2;
    viewXMin = xCenter - xRange / 2;
    viewXMax = xCenter + xRange / 2;
    viewYMin = BOUNDS.y.min;
    viewYMax = BOUNDS.y.max;
  } else {
    // X-axis is tighter — use its ppu, expand Y to fill vertical space
    const ppu = ppuX;
    const yRange = ch / ppu;
    const yCenter = (BOUNDS.y.min + BOUNDS.y.max) / 2;
    viewXMin = BOUNDS.x.min;
    viewXMax = BOUNDS.x.max;
    viewYMin = yCenter - yRange / 2;
    viewYMax = yCenter + yRange / 2;
  }
}
measure();

// =============================================================
// D3 Scales — two scale objects, base (un-zoomed) and current (zoomed)
// =============================================================
// xBase/yBase define the identity (zoom=1) mapping.
// xS/yS are the "live" scales updated by D3's zoom transform.
// px()/py() are shorthand to convert data coords → screen pixels.

const xBase = d3.scaleLinear().domain([viewXMin, viewXMax]).range([0, cw]);
const yBase = d3.scaleLinear().domain([viewYMin, viewYMax]).range([ch, 0]);
let xS = xBase.copy();
let yS = yBase.copy();

const px = v => xS(v); // data logR → screen x
const py = v => yS(v); // data logM → screen y

// =============================================================
// SVG scaffolding — element hierarchy and layer order
// =============================================================
//
// SVG LAYER STACK (bottom to top within the clipped chart area):
//   lRegion     — subtle forbidden-zone background tints
//   lGrid       — grid lines (×1000, ×10, log subdivisions)
//   lDensity    — diagonal density/epoch lines and bands
//   lTriOverlay — 50% black mask outside the Triangle of Everything
//   lBound      — white triangle outline + Planck point + reference lines
//   lArrows     — directional annotations (currently unused)
//   lRegLabel   — large watermark text ("SCHWARZSCHILD RADIUS", etc.)
//   lObj        — object dots and labels (topmost interactive layer)
//
// Axes (axT, axB, axL, axR) are OUTSIDE the clip, drawn in the margins.

const svg = d3.select("#chart").append("svg").attr("width", W).attr("height", H);
const defs = svg.append("defs");

defs.append("clipPath").attr("id", "clip")
  .append("rect").attr("width", cw).attr("height", ch);

// --- SVG gradients for forbidden-zone tints ---

function makeLinGrad(id, x1, y1, x2, y2, stops) {
  const g = defs.append("linearGradient").attr("id", id)
    .attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
  stops.forEach(s => g.append("stop")
    .attr("offset", s[0]).attr("stop-color", s[1]).attr("stop-opacity", s[2]));
}

makeLinGrad("grad-grav", "1", "1", "0", "0", [
  ["0%", "#440011", 0], ["30%", "#550019", 0.4], ["100%", "#2a0008", 0.9]]);
makeLinGrad("grad-quant", "1", "0", "0", "1", [
  ["0%", "#1a0044", 0], ["30%", "#2a0055", 0.4], ["100%", "#120028", 0.9]]);

// Subtle radial glow centered inside the triangle
const triGlow = defs.append("radialGradient").attr("id", "grad-tri")
  .attr("cx", "0.4").attr("cy", "0.45").attr("r", "0.6");
triGlow.append("stop").attr("offset", "0%").attr("stop-color", "#181852").attr("stop-opacity", 0.18);
triGlow.append("stop").attr("offset", "100%").attr("stop-color", "#06061a").attr("stop-opacity", 0);

// Gaussian blur filter for the triangle boundary glow effect
const blurF = defs.append("filter").attr("id", "line-glow")
  .attr("x", "-40%").attr("y", "-40%").attr("width", "180%").attr("height", "180%");
blurF.append("feGaussianBlur").attr("in", "SourceGraphic").attr("stdDeviation", "3")
  .attr("result", "b");
const m = blurF.append("feMerge");
m.append("feMergeNode").attr("in", "b");
m.append("feMergeNode").attr("in", "SourceGraphic");

// Full-window dark background
svg.append("rect").attr("width", W).attr("height", H).attr("fill", "#06061a");

// Main chart group, offset by margins
const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
const clip = chart.append("g").attr("clip-path", "url(#clip)");
clip.append("rect").attr("width", cw).attr("height", ch).attr("fill", "url(#grad-tri)");

// Rendering layers — order matters for visual stacking
const lRegion     = clip.append("g");
const lGrid       = clip.append("g");
const lDensity    = clip.append("g");
const lTriOverlay = clip.append("g");
const lBound      = clip.append("g");
const lArrows     = clip.append("g");
const lRegLabel   = clip.append("g");
const lObj        = clip.append("g");

// Axis groups live outside the clip, in the margin areas
const axB = chart.append("g"); // bottom
const axT = chart.append("g"); // top
const axL = chart.append("g"); // left
const axR = chart.append("g"); // right

// Thin border around the chart area
chart.append("rect").attr("width", cw).attr("height", ch)
  .attr("fill", "none").attr("stroke", "rgba(255,255,255,0.15)").attr("stroke-width", 1);

// =============================================================
// Utility: get the currently visible data-coordinate rectangle
// =============================================================
// Returns {x0, x1, y0, y1} in log-units (logR and logM).
// Called by every draw function to know what's on screen.

function vd() {
  return { x0: xS.domain()[0], x1: xS.domain()[1], y0: yS.domain()[0], y1: yS.domain()[1] };
}

// =============================================================
// Draw: Subtle region tints (underneath the triangle overlay)
// =============================================================

function drawRegions() {
  lRegion.selectAll("*").remove();
  const d = vd();
  const B = { x: { min: d.x0 - 20, max: d.x1 + 20 }, y: { min: d.y0 - 20, max: d.y1 + 20 } };

  // Gravity forbidden — very subtle red tint
  const sy0 = schwarzschildM(B.x.min), sy1 = schwarzschildM(B.x.max);
  lRegion.append("polygon")
    .attr("points", [
      [px(B.x.min), py(Math.max(sy0, B.y.min))],
      [px(B.x.max), py(Math.max(sy1, B.y.min))],
      [px(B.x.max), py(B.y.max)],
      [px(B.x.min), py(B.y.max)],
    ].map(p => p.join(",")).join(" "))
    .attr("fill", "#440011").attr("opacity", 0.15);

  // Quantum forbidden — very subtle purple tint
  const cy0 = comptonM(B.x.min);
  const cxBot = comptonR(B.y.min);
  lRegion.append("polygon")
    .attr("points", [
      [px(B.x.min), py(Math.min(cy0, B.y.max))],
      [px(Math.min(cxBot, B.x.max)), py(B.y.min)],
      [px(B.x.min), py(B.y.min)],
    ].map(p => p.join(",")).join(" "))
    .attr("fill", "#1a0044").attr("opacity", 0.15);
}

// =============================================================
// Draw: Triangle overlay (50% black outside the triangle)
// =============================================================

function drawTriangleOverlay() {
  lTriOverlay.selectAll("*").remove();

  // The Triangle of Everything: Schwarzschild + Compton + Hubble radius
  const planckX = px(PLANCK_LOG_R),  planckY = py(PLANCK_LOG_M);
  const schwX   = px(HUBBLE_LOG_R),  schwY  = py(schwarzschildM(HUBBLE_LOG_R));
  const compX   = px(HUBBLE_LOG_R),  compY  = py(comptonM(HUBBLE_LOG_R));

  // Viewport rectangle with triangular hole (even-odd fill)
  const pad = 100;
  const path = [
    `M ${-pad} ${-pad} L ${cw + pad} ${-pad} L ${cw + pad} ${ch + pad} L ${-pad} ${ch + pad} Z`,
    `M ${planckX} ${planckY} L ${schwX} ${schwY} L ${compX} ${compY} Z`,
  ].join(" ");

  lTriOverlay.append("path")
    .attr("d", path)
    .attr("fill", "#06061a")
    .attr("opacity", 0.55)
    .attr("fill-rule", "evenodd");
}

// =============================================================
// Draw: Multi-level adaptive grid
// =============================================================
//
// GRID HIERARCHY (from thickest/most prominent to thinnest):
//   ×10³⁰ (step 30) — visible only when very zoomed out
//   ×10⁹  (step 9)  — aligns with density line intervals
//   ×10³  (step 3)  — the "major" grid at moderate zoom
//   ×10   (step 1)  — the "minor" grid at closer zoom
//   log subdivisions (2,3,4…9) — visible only when deeply zoomed
//
// Each level only renders if its pixel spacing exceeds a minimum
// threshold, and each line skips positions already drawn by a
// higher-level grid. Opacity and width scale with pixel spacing
// for smooth transitions between zoom levels.

const LOG_SUBS = [
  Math.log10(2), Math.log10(3), Math.log10(4), Math.log10(5),
  Math.log10(6), Math.log10(7), Math.log10(8), Math.log10(9),
];

function drawGrid() {
  lGrid.selectAll("*").remove();
  const d = vd();
  const ppu = cw / (d.x1 - d.x0);

  // Grid hierarchy:  ×1000 (step 3) is the major grid,
  //                  ×10   (step 1) is the minor grid,
  //                  log subs (2-9) at high zoom
  const levels = [
    { step: 30, spacing: 30 * ppu, major: true },
    { step: 9,  spacing: 9 * ppu,  major: true },
    { step: 3,  spacing: 3 * ppu,  major: true },
    { step: 1,  spacing: ppu,      major: false },
    { step: 0,  spacing: 0.301 * ppu, major: false },
  ];

  levels.forEach(level => {
    if (level.spacing < 4) return;

    let opacity, width;
    if (level.major) {
      if (level.spacing > 200) { opacity = 0.40; width = 1.6; }
      else if (level.spacing > 80)  { opacity = 0.30; width = 1.3; }
      else if (level.spacing > 30)  { opacity = 0.20; width = 1.0; }
      else if (level.spacing > 12)  { opacity = 0.10; width = 0.6; }
      else { opacity = 0.05; width = 0.4; }
    } else if (level.step === 1) {
      if (level.spacing > 200) { opacity = 0.16; width = 0.6; }
      else if (level.spacing > 80)  { opacity = 0.12; width = 0.5; }
      else if (level.spacing > 30)  { opacity = 0.08; width = 0.4; }
      else if (level.spacing > 12)  { opacity = 0.05; width = 0.35; }
      else { opacity = 0.025; width = 0.25; }
    } else {
      if (level.spacing > 200) { opacity = 0.08; width = 0.5; }
      else if (level.spacing > 80)  { opacity = 0.05; width = 0.4; }
      else if (level.spacing > 30)  { opacity = 0.03; width = 0.3; }
      else if (level.spacing > 12)  { opacity = 0.015; width = 0.2; }
      else { opacity = 0.008; width = 0.15; }
    }

    const stroke = `rgba(255,255,255,${opacity})`;

    if (level.step === 0) {
      const startX = Math.floor(d.x0), endX = Math.ceil(d.x1);
      const startY = Math.floor(d.y0), endY = Math.ceil(d.y1);
      for (let i = startX; i <= endX; i++) {
        for (const sub of LOG_SUBS) {
          const v = i + sub;
          if (v < d.x0 || v > d.x1) continue;
          lGrid.append("line")
            .attr("x1", px(v)).attr("y1", py(d.y0))
            .attr("x2", px(v)).attr("y2", py(d.y1))
            .attr("stroke", stroke).attr("stroke-width", width);
        }
      }
      for (let i = startY; i <= endY; i++) {
        for (const sub of LOG_SUBS) {
          const v = i + sub;
          if (v < d.y0 || v > d.y1) continue;
          lGrid.append("line")
            .attr("x1", px(d.x0)).attr("y1", py(v))
            .attr("x2", px(d.x1)).attr("y2", py(v))
            .attr("stroke", stroke).attr("stroke-width", width);
        }
      }
    } else {
      const step = level.step;
      const firstX = Math.ceil(d.x0 / step) * step;
      for (let v = firstX; v <= d.x1; v += step) {
        // Skip positions drawn by a higher-level grid
        if (step === 1 && Math.abs(v % 3) < 0.01) continue;
        if (step === 3 && Math.abs(v % 9) < 0.01) continue;
        if (step === 9 && Math.abs(v % 30) < 0.01) continue;
        lGrid.append("line")
          .attr("x1", px(v)).attr("y1", py(d.y0))
          .attr("x2", px(v)).attr("y2", py(d.y1))
          .attr("stroke", stroke).attr("stroke-width", width)
          .attr("shape-rendering", "crispEdges");
      }
      const firstY = Math.ceil(d.y0 / step) * step;
      for (let v = firstY; v <= d.y1; v += step) {
        if (step === 1 && Math.abs(v % 3) < 0.01) continue;
        if (step === 3 && Math.abs(v % 9) < 0.01) continue;
        if (step === 9 && Math.abs(v % 30) < 0.01) continue;
        lGrid.append("line")
          .attr("x1", px(d.x0)).attr("y1", py(v))
          .attr("x2", px(d.x1)).attr("y2", py(v))
          .attr("stroke", stroke).attr("stroke-width", width)
          .attr("shape-rendering", "crispEdges");
      }
    }
  });
}


// =============================================================
// Draw: Boundary lines
// =============================================================

function drawBoundaries() {
  lBound.selectAll("*").remove();

  const planckX = px(PLANCK_LOG_R), planckY = py(PLANCK_LOG_M);
  const schwX = px(HUBBLE_LOG_R), schwY = py(schwarzschildM(HUBBLE_LOG_R));
  const compX = px(HUBBLE_LOG_R), compY = py(comptonM(HUBBLE_LOG_R));

  // White glow behind the triangle
  const triPath = `M ${planckX} ${planckY} L ${schwX} ${schwY} L ${compX} ${compY} Z`;
  lBound.append("path").attr("d", triPath)
    .attr("fill", "none").attr("stroke", "white")
    .attr("stroke-width", 6).attr("opacity", 0.08)
    .attr("filter", "url(#line-glow)");

  // White triangle outline
  lBound.append("path").attr("d", triPath)
    .attr("fill", "none").attr("stroke", "white")
    .attr("stroke-width", 1.5).attr("opacity", 0.7)
    .attr("stroke-linejoin", "round");

  // Planck point marker (vertex of the triangle)
  lBound.append("circle")
    .attr("cx", planckX).attr("cy", planckY)
    .attr("r", 12).attr("fill", "#ffffff").attr("class", "planck-pulse");
  lBound.append("circle")
    .attr("cx", planckX).attr("cy", planckY)
    .attr("r", 3).attr("fill", "#ffffff").attr("opacity", 0.8);

  // Reference lines (main sequence, red giants, etc.)
  const d = vd();
  REFERENCE_LINES.forEach(rl => {
    if (rl.width <= 0) return;
    const pts = rl.points.filter(p =>
      p.logR >= d.x0 - 5 && p.logR <= d.x1 + 5 &&
      p.logM >= d.y0 - 5 && p.logM <= d.y1 + 5
    );
    if (pts.length < 2) return;

    lBound.append("line")
      .attr("x1", px(rl.points[0].logR)).attr("y1", py(rl.points[0].logM))
      .attr("x2", px(rl.points[1].logR)).attr("y2", py(rl.points[1].logM))
      .attr("stroke", rl.color).attr("stroke-width", rl.width)
      .attr("stroke-dasharray", rl.dash);

    // Label
    const mx = (rl.points[0].logR + rl.points[1].logR) / 2;
    const my = (rl.points[0].logM + rl.points[1].logM) / 2;
    const ang = Math.atan2(
      py(rl.points[1].logM) - py(rl.points[0].logM),
      px(rl.points[1].logR) - px(rl.points[0].logR)
    ) * 180 / Math.PI;

    lBound.append("text")
      .attr("x", px(mx)).attr("y", py(my) - 5)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif").attr("font-size", 8)
      .attr("fill", rl.color.replace(/[\d.]+\)$/, "0.4)"))
      .attr("font-style", "italic").attr("letter-spacing", "1px")
      .attr("transform", `rotate(${ang},${px(mx)},${py(my) - 5})`)
      .text(rl.label.toUpperCase());
  });
}

// =============================================================
// Draw: Isodensity / epoch lines (diagonal, slope 3)
// =============================================================
//
// PHYSICS: For a sphere, ρ = M / (4π/3 · R³)
//   → logM = 3·logR + log(4π/3) + logρ
// So constant-density lines have slope 3 in log-log space.
//
// COSMOLOGICAL CONNECTION: Because the universe expands,
// its mean density decreases over time. So each density line
// also corresponds to a moment in cosmic history (an "epoch").
//
// Lines are drawn every 3 orders of density, with every 9th
// being "major" (thicker). The special logρ=0 line (water density)
// is highlighted in light blue.
//
// Epoch bands are semi-transparent colored regions between
// consecutive density lines, showing different cosmic eras
// (radiation dominated, matter dominated, etc.).

function clipDensityLine(d, b) {
  // logM = 3·logR + b — clip to visible domain d
  const yXmin = 3 * d.x0 + b, yXmax = 3 * d.x1 + b;
  const xYmin = (d.y0 - b) / 3, xYmax = (d.y1 - b) / 3;
  let x1, y1, x2, y2;

  if (yXmin >= d.y0 && yXmin <= d.y1) { x1 = d.x0; y1 = yXmin; }
  else if (yXmin < d.y0) { x1 = xYmin; y1 = d.y0; }
  else { x1 = xYmax; y1 = d.y1; }

  if (yXmax >= d.y0 && yXmax <= d.y1) { x2 = d.x1; y2 = yXmax; }
  else if (yXmax > d.y1) { x2 = xYmax; y2 = d.y1; }
  else { x2 = xYmin; y2 = d.y0; }

  if (x1 >= x2) return null;
  return { x1, y1, x2, y2 };
}

function drawDensityLines() {
  lDensity.selectAll("*").remove();
  const d = vd();

  // Epoch background bands between consecutive density lines
  EPOCH_BANDS.forEach(band => {
    const bLo = DENSITY_SPHERE_C + band.logDensityMax;
    const bHi = DENSITY_SPHERE_C + band.logDensityMin;
    const segLo = clipDensityLine(d, bLo);
    const segHi = clipDensityLine(d, bHi);
    if (!segLo || !segHi) return;

    lDensity.append("polygon")
      .attr("points", [
        [px(segLo.x1), py(segLo.y1)],
        [px(segLo.x2), py(segLo.y2)],
        [px(segHi.x2), py(segHi.y2)],
        [px(segHi.x1), py(segHi.y1)],
      ].map(p => p.join(",")).join(" "))
      .attr("fill", band.color);
  });

  for (let logRho = -54; logRho <= 108; logRho += 3) {
    const b = DENSITY_SPHERE_C + logRho;
    const seg = clipDensityLine(d, b);
    if (!seg) continue;

    const isWater = logRho === 0;
    const isMajor = logRho % 9 === 0;
    lDensity.append("line")
      .attr("x1", px(seg.x1)).attr("y1", py(seg.y1))
      .attr("x2", px(seg.x2)).attr("y2", py(seg.y2))
      .attr("stroke", isWater ? "#80deea" : "#ffffff")
      .attr("stroke-width", isWater ? 0.9 : (isMajor ? 0.6 : 0.3))
      .attr("opacity", isWater ? 0.35 : (isMajor ? 0.22 : 0.10));
  }
}

// =============================================================
// Draw: Region labels
// =============================================================

function screenAngle(slope) {
  // With equal px/unit, slope 1 → -45° (SVG y is inverted), slope -1 → 45°
  return Math.atan2(-slope, 1) * 180 / Math.PI;
}

function drawRegionLabels() {
  lRegLabel.selectAll("*").remove();
  const d = vd();
  const schwAng = screenAngle(1);
  const compAng = screenAngle(-1);
  const span = Math.min(d.x1 - d.x0, d.y1 - d.y0);
  const bigSize = Math.max(14, Math.min(span * 0.6, 60));

  const midS = (d.x0 + d.x1) * 0.5;
  const midC = (d.x0 + d.x1) * 0.5;

  const boundaryLabels = [
    { text: "SCHWARZSCHILD RADIUS",
      x: midS, y: schwarzschildM(midS),
      offset: span * 0.04,
      angle: schwAng, side: 1 },
    { text: "COMPTON LIMIT",
      x: midC, y: comptonM(midC),
      offset: span * 0.04,
      angle: compAng, side: -1 },
    { text: "HUBBLE RADIUS",
      x: HUBBLE_LOG_R, y: (d.y0 + d.y1) * 0.5,
      offset: span * 0.02,
      angle: -90, side: -1 },
  ];

  boundaryLabels.forEach(l => {
    const lx = l.angle === -90 ? l.x + l.offset * l.side : l.x;
    const ly = l.angle === -90 ? l.y : l.y + l.offset * l.side;
    if (ly < d.y0 || ly > d.y1) return;
    if (lx < d.x0 || lx > d.x1) return;
    const sx = px(lx), sy = py(ly);

    lRegLabel.append("text")
      .attr("x", sx).attr("y", sy)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 800)
      .attr("font-size", bigSize).attr("letter-spacing", `${bigSize * 0.3}px`)
      .attr("fill", "white").attr("opacity", 0.12)
      .attr("transform", `rotate(${l.angle},${sx},${sy})`)
      .text(l.text);
  });

  const smallSize = Math.max(8, bigSize * 0.5);
  const otherLabels = [
    { text: "BLACK HOLES",
      x: d.x0 * 0.45 + d.x1 * 0.55,
      y: schwarzschildM(d.x0 * 0.45 + d.x1 * 0.55) - span * 0.06,
      angle: schwAng, opacity: 0.06 },
    { text: "OBSERVABLE UNIVERSE",
      x: (HUBBLE_LOG_R + d.x0) * 0.5 + (d.x1 - d.x0) * 0.18,
      y: (schwarzschildM(HUBBLE_LOG_R) + d.y1) * 0.5,
      angle: 0, opacity: 0.04 },
  ];

  otherLabels.forEach(l => {
    if (l.y < d.y0 || l.y > d.y1) return;
    if (l.x < d.x0 || l.x > d.x1) return;
    const sx = px(l.x), sy = py(l.y);
    lRegLabel.append("text")
      .attr("x", sx).attr("y", sy)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 700)
      .attr("font-size", smallSize).attr("letter-spacing", "4px")
      .attr("fill", "white").attr("opacity", l.opacity)
      .attr("transform", `rotate(${l.angle},${sx},${sy})`)
      .text(l.text);
  });
}

// =============================================================
// Draw: Objects — dot clustering + smart label placement
// =============================================================
//
// VISIBILITY RULES:
//   - Dots are ALWAYS visible unless they physically overlap another dot
//     (Euclidean distance < DOT_MIN_DIST). Sorted by z-priority, so
//     important objects (low z value) claim space first.
//   - Labels try 4 positions around each dot (right, left, above, below).
//     A label is placed only if it doesn't collide with already-placed labels.
//     On hover, hidden labels temporarily appear.
//
// _lastProjected stores the most recent on-screen objects with their
// screen coordinates, used for click hit-testing (see click handler below).

const DOT_MIN_DIST = 6;    // px — hide dot only when circles overlap
const LABEL_MIN_DX  = 80;  // px — minimum horizontal gap between labels
const LABEL_MIN_DY  = 16;  // px — minimum vertical gap between labels

let _lastProjected = [];

function drawObjects() {
  lObj.selectAll("*").remove();
  const d = vd();
  const pad = 5;

  // Project all objects to screen, sorted by priority (low z = important)
  const projected = OBJECTS
    .map(o => ({
      ...o,
      sx: px(o.logR),
      sy: py(o.logM),
      cat: CATEGORIES[o.cat],
    }))
    .filter(o =>
      o.sx >= -pad && o.sx <= cw + pad &&
      o.sy >= -pad && o.sy <= ch + pad
    )
    .sort((a, b) => a.z - b.z);

  // --- Dot clustering: hide dots only when circles truly overlap ---
  const visibleDots = [];
  projected.forEach(o => {
    const dx2 = (s) => (s.sx - o.sx) ** 2 + (s.sy - o.sy) ** 2;
    const tooClose = visibleDots.some(s => dx2(s) < DOT_MIN_DIST * DOT_MIN_DIST);
    o._showDot = !tooClose;
    if (o._showDot) visibleDots.push(o);
  });

  // --- Label placement: show labels only where space allows ---
  const placedLabels = [];

  const labelPositions = [
    { dx: 8, dy: 3.5, anchor: "start" },
    { dx: -8, dy: 3.5, anchor: "end" },
    { dx: 0, dy: -10, anchor: "middle" },
    { dx: 0, dy: 16, anchor: "middle" },
  ];

  projected.forEach(o => {
    if (!o._showDot) { o._showLabel = false; o._labelPos = null; return; }

    const labelW = o.name.length * 6 + 10;
    const labelH = 13;

    for (const pos of labelPositions) {
      const lx = pos.anchor === "end" ? o.sx + pos.dx - labelW
               : pos.anchor === "middle" ? o.sx + pos.dx - labelW / 2
               : o.sx + pos.dx;
      const ly = o.sy + pos.dy - labelH;
      const rect = { x: lx, y: ly, w: labelW, h: labelH };

      const collides = placedLabels.some(p =>
        rect.x < p.x + p.w + 6 && rect.x + rect.w + 6 > p.x &&
        rect.y < p.y + p.h + 2 && rect.y + rect.h + 2 > p.y
      );

      if (!collides) {
        o._showLabel = true;
        o._labelPos = pos;
        o._labelRect = rect;
        placedLabels.push(rect);
        break;
      }
    }

    if (!o._labelPos) {
      o._showLabel = false;
      // Still reserve a default position for hover labels
      o._labelPos = labelPositions[0];
    }
  });

  // --- Render ---
  projected.forEach(o => {
    if (!o._showDot) return;

    const g = lObj.append("g").style("cursor", "pointer");

    // Hit area
    g.append("circle").attr("cx", o.sx).attr("cy", o.sy)
      .attr("r", 14).attr("fill", "transparent");

    // Glow
    g.append("circle").attr("cx", o.sx).attr("cy", o.sy)
      .attr("class", "obj-glow")
      .attr("r", 6).attr("fill", o.cat.color).attr("opacity", 0.1);

    // Dot
    g.append("circle").attr("cx", o.sx).attr("cy", o.sy)
      .attr("class", "obj-dot")
      .attr("r", 2.8).attr("fill", o.cat.color).attr("opacity", 0.85);

    const pos = o._labelPos;

    // Shadow + Label (always present, but hidden if no space)
    const shadow = g.append("text")
      .attr("x", o.sx + pos.dx).attr("y", o.sy + pos.dy)
      .attr("text-anchor", pos.anchor)
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", 10).attr("letter-spacing", "0.5px")
      .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.85)")
      .attr("stroke-width", 3).attr("stroke-linejoin", "round")
      .attr("class", "obj-label")
      .attr("display", o._showLabel ? null : "none")
      .text(o.name.toUpperCase());

    const label = g.append("text")
      .attr("x", o.sx + pos.dx).attr("y", o.sy + pos.dy)
      .attr("text-anchor", pos.anchor)
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", 10).attr("letter-spacing", "0.5px")
      .attr("fill", o.cat.color)
      .attr("class", "obj-label")
      .attr("display", o._showLabel ? null : "none")
      .text(o.name.toUpperCase());

    g.on("mouseenter", function(e) {
      d3.select(this).select(".obj-glow").attr("r", 10).attr("opacity", 0.25);
      d3.select(this).select(".obj-dot").attr("r", 4);
      d3.select(this).selectAll(".obj-label").attr("display", null);
      showTooltip(e, o, o.cat);
    });
    g.on("mouseleave", function() {
      d3.select(this).select(".obj-glow").attr("r", 6).attr("opacity", 0.1);
      d3.select(this).select(".obj-dot").attr("r", 2.8);
      if (!o._showLabel) {
        d3.select(this).selectAll(".obj-label").attr("display", "none");
      }
      hideTooltip();
    });
  });
  _lastProjected = projected.filter(o => o._showDot);
}

// =============================================================
// Tooltip — hover info card that follows the mouse
// =============================================================

const tooltipEl = document.getElementById("tooltip");

function formatSci(logVal, unit) {
  const exp = Math.floor(logVal);
  const mantissa = Math.pow(10, logVal - exp);
  if (Math.abs(logVal) < 2) return `${Math.pow(10, logVal).toPrecision(3)} ${unit}`;
  return `${mantissa.toFixed(1)} × 10<sup>${exp}</sup> ${unit}`;
}

// Convert log₁₀(radius/cm) to a human-friendly string with appropriate units
function friendlyRadius(logR) {
  if (logR >= 24.49) return `${Math.pow(10, logR - 24.49).toFixed(1)} Mpc`;
  if (logR >= 17.98) return `${Math.pow(10, logR - 17.98).toFixed(1)} ly`;
  if (logR >= 13.18) return `${Math.pow(10, logR - 13.18).toFixed(2)} AU`;
  if (logR >= 5)     return `${Math.pow(10, logR - 5).toPrecision(3)} km`;
  if (logR >= 2)     return `${Math.pow(10, logR - 2).toPrecision(3)} m`;
  if (logR >= -1)    return `${Math.pow(10, logR).toPrecision(3)} cm`;
  if (logR >= -7)    return `${Math.pow(10, logR + 7).toPrecision(3)} nm`;
  if (logR >= -13)   return `${Math.pow(10, logR + 13).toPrecision(3)} fm`;
  return `10^${logR.toFixed(1)} cm`;
}

function friendlyMass(logM) {
  const solOff = Math.log10(1.989e33);
  if (logM >= solOff + 1) return `${Math.pow(10, logM - solOff).toPrecision(3)} M☉`;
  if (logM >= 6)   return `${Math.pow(10, logM - 6).toPrecision(3)} tonnes`;
  if (logM >= 3)   return `${Math.pow(10, logM - 3).toPrecision(3)} kg`;
  if (logM >= 0)   return `${Math.pow(10, logM).toPrecision(3)} g`;
  const gevOff = Math.log10(1.783e-24);
  if (logM >= gevOff - 3) return `${Math.pow(10, logM - gevOff).toPrecision(3)} GeV`;
  if (logM >= gevOff - 6) return `${Math.pow(10, logM - gevOff + 3).toPrecision(3)} MeV`;
  if (logM >= gevOff - 9) return `${Math.pow(10, logM - gevOff + 6).toPrecision(3)} keV`;
  return `${Math.pow(10, logM - gevOff + 9).toPrecision(3)} eV`;
}

// Convert log₁₀(mass/g) to energy units via E = mc²
// The offset 32.75 converts log(g) to log(eV): log(c²/eV_in_erg) ≈ 32.75
function friendlyEnergy(logM) {
  const logE_eV = logM + 32.75;
  if (logE_eV >= 9) return `${Math.pow(10, logE_eV - 9).toPrecision(3)} GeV`;
  if (logE_eV >= 6) return `${Math.pow(10, logE_eV - 6).toPrecision(3)} MeV`;
  if (logE_eV >= 3) return `${Math.pow(10, logE_eV - 3).toPrecision(3)} keV`;
  if (logE_eV >= 0) return `${Math.pow(10, logE_eV).toPrecision(3)} eV`;
  if (logE_eV >= -3) return `${Math.pow(10, logE_eV + 3).toPrecision(3)} meV`;
  return `${Math.pow(10, logE_eV + 6).toPrecision(3)} μeV`;
}

// Detect photons/EM radiation: for massless particles, E = hc/λ,
// so logM + logR ≈ -36.656 (the log of h/(2π·c) in CGS).
// We use a tolerance of 0.5 to catch all EM spectrum entries.
function isPhoton(obj) {
  return Math.abs(obj.logM + obj.logR + 36.656) < 0.5;
}

function friendlyWavelength(logR) {
  if (logR >= 2)     return `${Math.pow(10, logR - 2).toPrecision(3)} m`;
  if (logR >= -1)    return `${Math.pow(10, logR).toPrecision(3)} cm`;
  if (logR >= -4)    return `${Math.pow(10, logR + 4).toPrecision(3)} μm`;
  if (logR >= -7)    return `${Math.pow(10, logR + 7).toPrecision(3)} nm`;
  if (logR >= -10)   return `${Math.pow(10, logR + 10).toPrecision(3)} pm`;
  return `${Math.pow(10, logR + 13).toPrecision(3)} fm`;
}

function friendlyDensity(logR, logM) {
  // ρ = M / (4π/3 · R³)
  const logRho = logM - 3 * logR - DENSITY_SPHERE_C;
  if (logRho > 14) return `${Math.pow(10, logRho - 14).toPrecision(2)} × nuclear density`;
  if (logRho > 3) return `${Math.pow(10, logRho - 3).toPrecision(2)} × 10³ kg/m³`;
  if (logRho > 0) return `${Math.pow(10, logRho).toPrecision(2)} g/cm³`;
  if (logRho > -3) return `${Math.pow(10, logRho + 3).toPrecision(2)} mg/cm³`;
  return `10^${logRho.toFixed(0)} g/cm³`;
}

function showTooltip(event, obj, cat) {
  const photon = isPhoton(obj);
  const r = photon ? friendlyWavelength(obj.logR) : friendlyRadius(obj.logR);
  const rLabel = photon ? "wavelength" : "radius";
  const mLabel = photon ? "energy" : "mass";
  const mVal = photon ? friendlyEnergy(obj.logM) : friendlyMass(obj.logM);
  tooltipEl.innerHTML = `
    <div class="tt-name" style="color:${cat.color}">${obj.name}</div>
    <div class="tt-row">${rLabel} ≈ ${r}</div>
    <div class="tt-row">${mLabel} ≈ ${mVal}</div>
    ${photon ? '' : `<div class="tt-row">density ≈ ${friendlyDensity(obj.logR, obj.logM)}</div>`}
  `;
  tooltipEl.classList.add("visible");
  positionTooltip(event);
}

function positionTooltip(e) {
  let x = e.clientX + 16, y = e.clientY - 10;
  if (x + 260 > W) x = e.clientX - 270;
  if (y + 80 > H) y = H - 90;
  tooltipEl.style.left = x + "px";
  tooltipEl.style.top = y + "px";
}

function hideTooltip() {
  tooltipEl.classList.remove("visible");
}

svg.on("mousemove.tooltip", (e) => {
  if (tooltipEl.classList.contains("visible")) positionTooltip(e);
});

// =============================================================
// Sidebar — two-mode info panel (intro / object detail)
// =============================================================
//
// MODE 1 — INTRO (default on load):
//   Shows the project title and introductory text from intro.md.
//
// MODE 2 — OBJECT DETAIL:
//   When any object is clicked, shows its name, stats, description,
//   and links to Wikipedia/Google Scholar. Stats are customized by
//   object category:
//     - Photons:   wavelength, energy, mass-equivalent (with footnote)
//     - Everyday:  "Width"/"Weight" instead of "Radius"/"Mass"
//     - Particles: size, mass, zone (accessible/forbidden)
//     - Black holes: event horizon, mass, density, zone
//     - Others:    radius, mass, density, zone
//
// NAVIGATION:
//   - Click object → opens object detail
//   - Close button from object detail → returns to intro
//   - Close button from intro → collapses sidebar entirely
//   - Escape key follows the same cascade
//   - Click empty chart space → returns to intro (if object is showing)

const sidebarEl = document.getElementById("sidebar");
const sidebarIntro = document.getElementById("sidebar-intro");
const sidebarObject = document.getElementById("sidebar-object");
const sbName = document.getElementById("sb-name");
const sbDot = document.getElementById("sb-dot");
const sbCategory = document.getElementById("sb-category");
const sbStats = document.getElementById("sb-stats");
const sbDesc = document.getElementById("sb-desc");
const sbLinks = document.getElementById("sb-links");

// Minimal markdown parser for intro.md — handles bold, italic, links,
// paragraphs, and passes through raw <div> blocks for custom formatting.
function simpleMarkdown(md) {
  return md
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/<div/g, "<div").replace(/<\/div>/g, "</div>")
    .split(/\n\n+/)
    .map(p => {
      if (p.trim().startsWith("<div")) return p;
      if (p.trim().startsWith("</div>")) return p;
      return `<p>${p.trim()}</p>`;
    })
    .join("\n");
}
document.getElementById("intro-body").innerHTML = simpleMarkdown(introRaw);

function showIntro() {
  sidebarIntro.style.display = "";
  sidebarObject.style.display = "none";
  sidebarEl.classList.add("open");
}
showIntro();

function wikiUrl(obj) {
  if (obj.wiki) return `https://en.wikipedia.org/wiki/${obj.wiki}`;
  const cleaned = obj.name.replace(/\s*\(.*\)$/, "").trim();
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(cleaned.replace(/ /g, "_"))}`;
}

function scholarUrl(name) {
  const q = name.replace(/\s*\(.*\)$/, "").trim();
  return `https://scholar.google.com/scholar?q=${encodeURIComponent(q)}`;
}

let selectedObj = null;

function openSidebar(obj) {
  selectedObj = obj;
  sidebarIntro.style.display = "none";
  sidebarObject.style.display = "";
  const cat = CATEGORIES[obj.cat];

  sbName.textContent = obj.name;
  sbName.style.color = cat.color;
  sbDot.style.background = cat.color;
  sbDot.style.color = cat.color;
  sbCategory.textContent = obj.cat;

  const photon = isPhoton(obj);
  const c = obj.cat;
  const isEveryday = c === "macro" || c === "micro";
  const isPlanet = c === "planet";
  const isStar = c === "star";
  const isRemnant = c === "remnant";
  const isBH = c === "blackhole";
  const isParticle = c === "particle" || c === "composite" || c === "atomic";
  const isCosmicStructure = c === "galaxy" || c === "largescale";

  const r = photon ? friendlyWavelength(obj.logR) : friendlyRadius(obj.logR);
  const m = photon ? friendlyEnergy(obj.logM) : friendlyMass(obj.logM);
  const rho = friendlyDensity(obj.logR, obj.logM);

  const logR_m = obj.logR - 2;
  const logM_kg = obj.logM - 3;
  const logNote = `(10<sup>${logR_m >= 0 ? logR_m.toFixed(1) : logR_m.toFixed(1)}</sup> m · 10<sup>${logM_kg >= 0 ? logM_kg.toFixed(1) : logM_kg.toFixed(1)}</sup> kg)`;

  let zone, zoneClass;
  if (obj.logM > schwarzschildM(obj.logR)) {
    zone = "Gravity forbidden"; zoneClass = "gravity";
  } else if (obj.logM < comptonM(obj.logR)) {
    zone = "Quantum forbidden"; zoneClass = "quantum";
  } else {
    zone = "Accessible"; zoneClass = "accessible";
  }

  const schwRatio = obj.logR - schwarzschildR(obj.logM);
  const compRatio = obj.logR - comptonR(obj.logM);

  let rows = "";

  if (photon) {
    rows = `
      <tr><td>Wavelength</td><td>${r}</td></tr>
      <tr><td>Energy</td><td>${m}</td></tr>
      <tr><td>Mass equiv.</td><td>${friendlyMass(obj.logM)} *</td></tr>
      <tr><td colspan="2" class="sb-log-note">(10<sup>${obj.logR.toFixed(1)}</sup> cm · 10<sup>${(obj.logM + 32.75).toFixed(1)}</sup> eV)</td></tr>
      <tr><td colspan="2" class="sb-footnote">* Massless — vertical axis shows mass-equivalent energy E = hc/λ</td></tr>`;
  } else if (isEveryday) {
    const sizeLabel = obj.logR < -1 ? "Size" : "Width";
    const massLabel = "Weight";
    rows = `
      <tr><td>${sizeLabel}</td><td>${r}</td></tr>
      <tr><td>${massLabel}</td><td>${m}</td></tr>
      <tr><td>Density</td><td>${rho}</td></tr>
      <tr><td colspan="2" class="sb-log-note">${logNote}</td></tr>`;
  } else if (isParticle) {
    rows = `
      <tr><td>Size</td><td>${r}</td></tr>
      <tr><td>Mass</td><td>${m}</td></tr>
      <tr><td>Zone</td><td><span class="sb-zone ${zoneClass}">${zone}</span></td></tr>
      <tr><td colspan="2" class="sb-log-note">(10<sup>${obj.logR.toFixed(1)}</sup> cm · 10<sup>${obj.logM.toFixed(1)}</sup> g)</td></tr>`;
  } else if (isBH) {
    rows = `
      <tr><td>Event horizon</td><td>${r}</td></tr>
      <tr><td>Mass</td><td>${m}</td></tr>
      <tr><td>Density</td><td>${rho}</td></tr>
      <tr><td>Zone</td><td><span class="sb-zone ${zoneClass}">${zone}</span></td></tr>
      <tr><td colspan="2" class="sb-log-note">${logNote}</td></tr>`;
  } else {
    const sizeLabel = isPlanet || isStar || isRemnant ? "Radius" : "Size";
    rows = `
      <tr><td>${sizeLabel}</td><td>${r}</td></tr>
      <tr><td>Mass</td><td>${m}</td></tr>
      <tr><td>Density</td><td>${rho}</td></tr>
      <tr><td>Zone</td><td><span class="sb-zone ${zoneClass}">${zone}</span></td></tr>
      <tr><td colspan="2" class="sb-log-note">${logNote}</td></tr>`;
  }

  sbStats.innerHTML = `<table>${rows}</table>`;

  sbDesc.textContent = DESC_BY_SLUG[obj.slug] || "";

  const wiki = wikiUrl(obj);
  const scholar = scholarUrl(obj.name);
  sbLinks.innerHTML = `
    <a href="${wiki}" target="_blank" rel="noopener">
      <span class="link-icon">W</span>
      <span class="link-label">Wikipedia</span>
      <span class="link-sub">↗</span>
    </a>
    <a href="${scholar}" target="_blank" rel="noopener">
      <span class="link-icon">S</span>
      <span class="link-label">Google Scholar</span>
      <span class="link-sub">↗</span>
    </a>
  `;

  sidebarEl.classList.add("open");
}

function closeSidebar() {
  selectedObj = null;
  showIntro();
}

document.getElementById("sidebar-close").addEventListener("click", () => {
  if (selectedObj) {
    closeSidebar();
  } else {
    sidebarEl.classList.remove("open");
  }
});

// =============================================================
// Click detection — bypassing D3 zoom's event suppression
// =============================================================
//
// PROBLEM: D3's zoom behavior uses setPointerCapture() and
// stopImmediatePropagation() internally, which swallows click
// events before they reach our SVG object elements.
//
// SOLUTION: Register document-level listeners in the CAPTURE phase
// (third argument = true), which fire BEFORE D3's handlers.
// We track pointerdown position and time, then on click we:
//   1. Reject if the pointer moved (drag) or was held too long
//   2. Convert click coordinates to chart-space pixels
//   3. Hit-test against _lastProjected (the on-screen objects)
//   4. If a hit: stopImmediatePropagation + open sidebar
//   5. If no hit: return to intro view
//
// This approach was chosen after trying (and failing) with:
//   - g.on("click") — swallowed by zoom
//   - g.on("pointerup") — unreliable with pointer capture
//   - Invisible HTML overlay — worked but added DOM complexity

let _clickDown = null;

document.addEventListener("pointerdown", (e) => {
  const svgEl = svg.node();
  if (!svgEl.contains(e.target) && e.target !== svgEl) return;
  _clickDown = { x: e.clientX, y: e.clientY, t: Date.now() };
}, true);

document.addEventListener("click", (e) => {
  if (!_clickDown) return;
  const ddx = e.clientX - _clickDown.x, ddy = e.clientY - _clickDown.y;
  const dist2 = ddx * ddx + ddy * ddy;
  const elapsed = Date.now() - _clickDown.t;
  _clickDown = null;

  // Reject drags (>6px movement) and long presses (>600ms)
  if (dist2 > 36 || elapsed > 600) return;

  // Convert click to chart-local coordinates
  const svgRect = svg.node().getBoundingClientRect();
  const mx = e.clientX - svgRect.left - margin.left;
  const my = e.clientY - svgRect.top - margin.top;

  // Find closest object within HIT_RADIUS pixels
  const HIT_RADIUS = 18;
  let closest = null, closestDist = HIT_RADIUS * HIT_RADIUS;
  for (const o of _lastProjected) {
    const dx = o.sx - mx, dy = o.sy - my;
    const d2 = dx * dx + dy * dy;
    if (d2 < closestDist) { closest = o; closestDist = d2; }
  }

  if (closest) {
    e.stopImmediatePropagation();
    openSidebar(closest);
  } else if (sidebarEl.classList.contains("open")) {
    closeSidebar();
  }
}, true);

// =============================================================
// Draw: Axes — four margin areas with adaptive tick density
// =============================================================
//
// TICK HIERARCHY (adapts to zoom level via ppu = pixels per log unit):
//   axisStep=30 — ticks every 30 orders (very zoomed out)
//   axisStep=9  — every 9 orders (matches density line spacing)
//   axisStep=3  — every 3 orders (moderate zoom)
//   axisStep=1  — every order of magnitude (close zoom)
//
//   minorStep — smaller ticks between major ones:
//     9 → shows ticks at 9-unit intervals between 30s
//     3 → shows ticks at 3-unit intervals between 9s
//     1 → shows ticks at 1-unit intervals between 3s
//     0 → shows log subdivisions (2,3,4…9) between integers
//         (only at deep zoom, threshold: 0.301*ppu ≥ 22px)
//
// AXIS DETAILS:
//   Bottom: WIDTH · 10ⁿ cm — big log numbers + two rows of unit
//           markers (row 1: metric, row 2: imperial/astronomical)
//   Left:   ENERGY · 10ⁿ eV — capped at Planck energy; shows
//           temperature and energy unit markers (eV, K, °C, °F)
//   Right:  MASS · 10ⁿ Kg — shows mass unit markers (g, kg, M☉)
//   Top:    DENSITY · TIME — diagonal labels at 1:3 angle following
//           density lines, with density values (g/L) and epoch names

function drawAxes() {
  [axB, axT, axL, axR].forEach(g => g.selectAll("*").remove());
  const d = vd();
  const ppu = cw / (d.x1 - d.x0);
  const LOG_EV_OFFSET = 32.75; // log₁₀(c² / eV_in_erg)

  const minLabelPx = 45;
  let axisStep;
  if (ppu >= minLabelPx) axisStep = 1;
  else if (3 * ppu >= minLabelPx) axisStep = 3;
  else if (9 * ppu >= minLabelPx) axisStep = 9;
  else axisStep = 30;

  let minorStep = null;
  if (axisStep === 30 && 9 * ppu >= 8) minorStep = 9;
  else if (axisStep === 9 && 3 * ppu >= 8) minorStep = 3;
  else if (axisStep === 3 && ppu >= 8) minorStep = 1;
  else if (axisStep === 1 && 0.301 * ppu >= 22) minorStep = 0;

  const first = (lo, s) => Math.ceil(lo / s) * s;
  const minUnitPx = 12;

  // ─── TOP: Diagonal density labels ──────────────────────────
  // These labels sit in the top margin and extend UPWARD along
  // connector lines that follow the density slope (1:3 ratio).
  // diagDx=1, diagDy=-3 points up-right in SVG coords (y-inverted).
  const densityAngle = screenAngle(3);
  const diagDx = 1;
  const diagDy = -3;
  const diagNorm = Math.sqrt(diagDx * diagDx + diagDy * diagDy);
  const diagLen = 35;

  for (let logRho = -54; logRho <= 108; logRho += 9) {
    const b = DENSITY_SPHERE_C + logRho;
    const logR_top = (d.y1 - b) / 3;
    if (logR_top < d.x0 - 1 || logR_top > d.x1 + 1) continue;
    const p = px(logR_top);
    if (p < 0 || p > cw) continue;

    const ex = p + (diagDx / diagNorm) * diagLen;
    const ey = -(diagDy / diagNorm) * diagLen;

    axT.append("line")
      .attr("x1", p).attr("y1", 0)
      .attr("x2", ex).attr("y2", ey)
      .attr("stroke", "rgba(255,255,255,0.15)")
      .attr("stroke-width", 0.5);

    const gL = logRho + 3;
    const tx = ex + (diagDx / diagNorm) * 3;
    const ty = ey - (diagDy / diagNorm) * 3;
    axT.append("text")
      .attr("x", tx).attr("y", ty)
      .attr("text-anchor", "start")
      .attr("font-family", "'Space Mono', monospace")
      .attr("font-size", 10).attr("font-weight", 700)
      .attr("fill", "rgba(255,255,255,0.3)")
      .attr("transform", `rotate(${densityAngle},${tx},${ty})`)
      .text(gL);
  }

  const EPOCH_TOP = [
    { logRho: 93.7, label: "PLANCK TIME" },
    { logRho: 76, label: "GUT ERA" },
    { logRho: 50, label: "INFLATION" },
    { logRho: 25, label: "ELECTROWEAK" },
    { logRho: 14.4, label: "QCD" },
    { logRho: 4, label: "BBN" },
    { logRho: 0, label: "ρ WATER" },
    { logRho: -21, label: "CMB" },
    { logRho: -29.5, label: "NOW" },
  ];

  const epochLen = 55;
  EPOCH_TOP.forEach(ep => {
    const b = DENSITY_SPHERE_C + ep.logRho;
    const logR_top = (d.y1 - b) / 3;
    if (logR_top < d.x0 - 3 || logR_top > d.x1 + 3) return;
    const p = px(logR_top);
    if (p < -20 || p > cw + 20) return;

    const ex = p + (diagDx / diagNorm) * epochLen;
    const ey = -(diagDy / diagNorm) * epochLen;
    const tx = ex + (diagDx / diagNorm) * 3;
    const ty = ey - (diagDy / diagNorm) * 3;

    axT.append("text")
      .attr("x", tx).attr("y", ty)
      .attr("text-anchor", "start")
      .attr("font-family", "Inter, sans-serif")
      .attr("font-size", 7.5).attr("font-weight", 500)
      .attr("fill", "rgba(255,180,120,0.4)")
      .attr("letter-spacing", "1px")
      .attr("transform", `rotate(${densityAngle},${tx},${ty})`)
      .text(ep.label);
  });

  axT.append("text").attr("x", cw - 5).attr("y", -72).attr("text-anchor", "end")
    .attr("class", "axis-title").text("DENSITY · 10ⁿ g/L");
  axT.append("text").attr("x", 5).attr("y", -20).attr("text-anchor", "start")
    .attr("class", "axis-title").attr("letter-spacing", "3px").text("TIME");

  // ─── BOTTOM: Big log numbers + two rows of width units ────
  axB.attr("transform", `translate(0,${ch})`);

  if (minorStep !== null && minorStep > 0) {
    for (let v = first(d.x0, minorStep); v <= d.x1; v = +(v + minorStep).toFixed(6)) {
      if (Math.abs(v % axisStep) < 0.01 || Math.abs(v % axisStep - axisStep) < 0.01) continue;
      const p = px(v);
      if (p < -1 || p > cw + 1) continue;
      axB.append("line").attr("x1", p).attr("y1", 0).attr("x2", p).attr("y2", 3)
        .attr("stroke", "rgba(255,255,255,0.12)");
    }
  }

  if (minorStep === 0) {
    const startX = Math.floor(d.x0), endX = Math.ceil(d.x1);
    for (let i = startX; i <= endX; i++) {
      for (let n = 2; n <= 9; n++) {
        const v = i + Math.log10(n);
        if (v < d.x0 || v > d.x1) continue;
        const p = px(v);
        if (p < -1 || p > cw + 1) continue;
        axB.append("line").attr("x1", p).attr("y1", 0).attr("x2", p).attr("y2", 3)
          .attr("stroke", "rgba(255,255,255,0.10)");
        axB.append("text").attr("x", p).attr("y", 14).attr("text-anchor", "middle")
          .attr("class", "axis-label").attr("font-size", 9).attr("font-weight", 400)
          .attr("fill", "rgba(255,255,255,0.35)")
          .text(n);
      }
    }
  }

  for (let v = first(d.x0, axisStep); v <= d.x1; v += axisStep) {
    const p = px(v);
    if (p < -1 || p > cw + 1) continue;
    axB.append("line").attr("x1", p).attr("y1", 0).attr("x2", p).attr("y2", 5)
      .attr("stroke", "rgba(255,255,255,0.25)");
    axB.append("text").attr("x", p).attr("y", 16).attr("text-anchor", "middle")
      .attr("class", "axis-label").attr("font-size", 13).attr("font-weight", 700)
      .text(fmtTick(v));
  }

  let lastRow1Px = -Infinity;
  RADIUS_UNITS.filter(u => u.row === 1).forEach(u => {
    if (u.logR < d.x0 || u.logR > d.x1) return;
    const p = px(u.logR);
    if (p < -1 || p > cw + 1) return;
    axB.append("line").attr("x1", p).attr("y1", 20).attr("x2", p).attr("y2", 28)
      .attr("stroke", "rgba(255,100,100,0.4)").attr("stroke-dasharray", "2 2");
    if (Math.abs(p - lastRow1Px) >= 40) {
      axB.append("text").attr("x", p).attr("y", 37).attr("text-anchor", "middle")
        .attr("font-family", "'Space Mono', monospace").attr("font-size", 8)
        .attr("fill", "rgba(255,130,130,0.6)")
        .text(u.label);
      lastRow1Px = p;
    }
  });

  let lastRow2Px = -Infinity;
  RADIUS_UNITS.filter(u => u.row === 2).forEach(u => {
    if (u.logR < d.x0 || u.logR > d.x1) return;
    const p = px(u.logR);
    if (p < -1 || p > cw + 1) return;
    axB.append("line").attr("x1", p).attr("y1", 38).attr("x2", p).attr("y2", 48)
      .attr("stroke", "rgba(255,100,100,0.25)").attr("stroke-dasharray", "2 2");
    if (Math.abs(p - lastRow2Px) >= 35) {
      axB.append("text").attr("x", p + 2).attr("y", 50)
        .attr("text-anchor", "start")
        .attr("font-family", "'Space Mono', monospace").attr("font-size", 7.5)
        .attr("fill", "rgba(255,130,130,0.45)")
        .attr("transform", `rotate(45,${p + 2},50)`)
        .text(u.label);
      lastRow2Px = p;
    }
  });

  axB.append("text").attr("x", cw / 2).attr("y", 70).attr("text-anchor", "middle")
    .attr("class", "axis-title").text("WIDTH  ·  10ⁿ cm");

  // ─── LEFT: Energy / Temperature (capped at Planck energy) ─
  const leftMax = PLANCK_LOG_M;

  if (minorStep !== null && minorStep > 0) {
    for (let v = first(d.y0, minorStep); v <= Math.min(d.y1, leftMax); v = +(v + minorStep).toFixed(6)) {
      if (Math.abs(v % axisStep) < 0.01 || Math.abs(v % axisStep - axisStep) < 0.01) continue;
      const p = py(v);
      if (p < -1 || p > ch + 1) continue;
      axL.append("line").attr("x1", -3).attr("y1", p).attr("x2", 0).attr("y2", p)
        .attr("stroke", "rgba(255,255,255,0.12)");
    }
  }

  if (minorStep === 0) {
    const startY = Math.floor(d.y0), endY = Math.ceil(Math.min(d.y1, leftMax));
    for (let i = startY; i <= endY; i++) {
      for (let n = 2; n <= 9; n++) {
        const v = i + Math.log10(n);
        if (v < d.y0 || v > leftMax) continue;
        const p = py(v);
        if (p < -1 || p > ch + 1) continue;
        axL.append("line").attr("x1", -3).attr("y1", p).attr("x2", 0).attr("y2", p)
          .attr("stroke", "rgba(255,255,255,0.10)");
        axL.append("text").attr("x", -14).attr("y", p + 3.5).attr("text-anchor", "middle")
          .attr("class", "axis-label").attr("font-size", 9).attr("font-weight", 400)
          .attr("fill", "rgba(255,255,255,0.35)")
          .text(n);
      }
    }
  }

  for (let v = first(d.y0, axisStep); v <= Math.min(d.y1, leftMax); v += axisStep) {
    const p = py(v);
    if (p < -1 || p > ch + 1) continue;
    axL.append("line").attr("x1", -5).attr("y1", p).attr("x2", 0).attr("y2", p)
      .attr("stroke", "rgba(255,255,255,0.25)");
    const evVal = Math.round(v + LOG_EV_OFFSET);
    axL.append("text").attr("x", -35).attr("y", p + 4.5).attr("text-anchor", "middle")
      .attr("class", "axis-label").attr("font-size", 13).attr("font-weight", 700)
      .text(evVal);
  }

  let lastEnergyPy = -Infinity;
  ENERGY_UNITS.forEach(u => {
    if (u.logM < d.y0 || u.logM > Math.min(d.y1, leftMax)) return;
    const p = py(u.logM);
    if (p < 2 || p > ch - 2) return;
    axL.append("line").attr("x1", -3).attr("y1", p).attr("x2", 6).attr("y2", p)
      .attr("stroke", "rgba(255,100,100,0.4)").attr("stroke-dasharray", "2 2");
    if (Math.abs(p - lastEnergyPy) >= minUnitPx) {
      axL.append("text").attr("x", -60).attr("y", p + 3).attr("text-anchor", "end")
        .attr("font-family", "'Space Mono', monospace").attr("font-size", 9)
        .attr("fill", "rgba(255,130,130,0.6)")
        .text(u.label);
      lastEnergyPy = p;
    }
  });

  axL.append("text").attr("transform", "rotate(-90)").attr("x", -ch / 2).attr("y", -125)
    .attr("text-anchor", "middle").attr("class", "axis-title").text("ENERGY · 10ⁿ eV");

  // ─── RIGHT: Mass ──────────────────────────────────────────
  axR.attr("transform", `translate(${cw},0)`);

  if (minorStep !== null && minorStep > 0) {
    for (let v = first(d.y0, minorStep); v <= d.y1; v = +(v + minorStep).toFixed(6)) {
      if (Math.abs(v % axisStep) < 0.01 || Math.abs(v % axisStep - axisStep) < 0.01) continue;
      const p = py(v);
      if (p < -1 || p > ch + 1) continue;
      axR.append("line").attr("x1", 0).attr("y1", p).attr("x2", 3).attr("y2", p)
        .attr("stroke", "rgba(255,255,255,0.12)");
    }
  }

  if (minorStep === 0) {
    const startY = Math.floor(d.y0), endY = Math.ceil(d.y1);
    for (let i = startY; i <= endY; i++) {
      for (let n = 2; n <= 9; n++) {
        const v = i + Math.log10(n);
        if (v < d.y0 || v > d.y1) continue;
        const p = py(v);
        if (p < -1 || p > ch + 1) continue;
        axR.append("line").attr("x1", 0).attr("y1", p).attr("x2", 3).attr("y2", p)
          .attr("stroke", "rgba(255,255,255,0.10)");
        axR.append("text").attr("x", 14).attr("y", p + 3.5).attr("text-anchor", "middle")
          .attr("class", "axis-label").attr("font-size", 9).attr("font-weight", 400)
          .attr("fill", "rgba(255,255,255,0.35)")
          .text(n);
      }
    }
  }

  for (let v = first(d.y0, axisStep); v <= d.y1; v += axisStep) {
    const p = py(v);
    if (p < -1 || p > ch + 1) continue;
    axR.append("line").attr("x1", 0).attr("y1", p).attr("x2", 5).attr("y2", p)
      .attr("stroke", "rgba(255,255,255,0.25)");
    const kgVal = v - 3;
    axR.append("text").attr("x", 28).attr("y", p + 4.5).attr("text-anchor", "middle")
      .attr("class", "axis-label").attr("font-size", 13).attr("font-weight", 700)
      .text(fmtTick(kgVal));
  }

  let lastMassUnitPy = -Infinity;
  MASS_UNITS.forEach(u => {
    if (u.logM < d.y0 || u.logM > d.y1) return;
    const p = py(u.logM);
    if (p < 2 || p > ch - 2) return;
    axR.append("line").attr("x1", -6).attr("y1", p).attr("x2", 3).attr("y2", p)
      .attr("stroke", "rgba(255,100,100,0.4)").attr("stroke-dasharray", "2 2");
    if (Math.abs(p - lastMassUnitPy) >= minUnitPx) {
      axR.append("text").attr("x", 42).attr("y", p + 3).attr("text-anchor", "start")
        .attr("font-family", "'Space Mono', monospace").attr("font-size", 8)
        .attr("fill", "rgba(255,130,130,0.6)")
        .text(u.label);
      lastMassUnitPy = p;
    }
  });

  axR.append("text").attr("transform", "rotate(90)").attr("x", ch / 2).attr("y", -65)
    .attr("text-anchor", "middle").attr("class", "axis-title").text("MASS · 10ⁿ Kg");
}

function fmtTick(v) {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

// =============================================================
// Draw: Directional annotations (COMBINES INTO / DECAYS INTO)
// =============================================================

function drawArrows() {
  lArrows.selectAll("*").remove();
  const d = vd();

  ARROWS.forEach(arrow => {
    const visible = arrow.points.filter(p =>
      p.logR >= d.x0 - 5 && p.logR <= d.x1 + 5 &&
      p.logM >= d.y0 - 5 && p.logM <= d.y1 + 5
    );
    if (visible.length < 2) return;

    // Draw curved path through points
    const lineGen = d3.line()
      .x(p => px(p.logR))
      .y(p => py(p.logM))
      .curve(d3.curveBasis);

    lArrows.append("path")
      .attr("d", lineGen(arrow.points))
      .attr("fill", "none")
      .attr("stroke", arrow.color)
      .attr("stroke-width", 2.5)
      .attr("stroke-linecap", "round");

    // Arrowhead at last visible point
    const last = arrow.points[arrow.points.length - 1];
    const prev = arrow.points[arrow.points.length - 2];
    const angle = Math.atan2(py(last.logM) - py(prev.logM), px(last.logR) - px(prev.logR));
    const ax = px(last.logR), ay = py(last.logM);
    const arLen = 12;
    lArrows.append("path")
      .attr("d", `M${ax},${ay} L${ax - arLen * Math.cos(angle - 0.35)},${ay - arLen * Math.sin(angle - 0.35)} M${ax},${ay} L${ax - arLen * Math.cos(angle + 0.35)},${ay - arLen * Math.sin(angle + 0.35)}`)
      .attr("fill", "none").attr("stroke", arrow.color).attr("stroke-width", 2);

    // Label near the midpoint
    const mid = arrow.points[Math.floor(arrow.points.length / 2)];
    if (mid.logR >= d.x0 && mid.logR <= d.x1 && mid.logM >= d.y0 && mid.logM <= d.y1) {
      const pathAng = Math.atan2(
        py(arrow.points[Math.floor(arrow.points.length / 2) + 1]?.logM || mid.logM) - py(mid.logM),
        px(arrow.points[Math.floor(arrow.points.length / 2) + 1]?.logR || mid.logR) - px(mid.logR)
      ) * 180 / Math.PI;

      lArrows.append("text")
        .attr("x", px(mid.logR)).attr("y", py(mid.logM) - 10)
        .attr("text-anchor", "middle")
        .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
        .attr("font-size", 11).attr("letter-spacing", "3px")
        .attr("fill", arrow.color).attr("font-style", "italic")
        .attr("transform", `rotate(${pathAng},${px(mid.logR)},${py(mid.logM) - 10})`)
        .text(arrow.label);
    }
  });
}

// =============================================================
// Minimap — small overview in top-right corner
// =============================================================
// Shows the Triangle of Everything outline and a viewport indicator
// rectangle. Only visible when zoomed in (currentK > 1.3).
// Clicking the minimap pans the main view to that location.

const MINIMAP_SIZE = 120;
const MINIMAP_PAD = 10;

const miniSvg = svg.append("g")
  .attr("transform", `translate(${W - MINIMAP_SIZE - MINIMAP_PAD - margin.right}, ${margin.top + MINIMAP_PAD})`);

// Minimap background
miniSvg.append("rect")
  .attr("width", MINIMAP_SIZE).attr("height", MINIMAP_SIZE)
  .attr("rx", 4).attr("fill", "rgba(6,6,26,0.85)")
  .attr("stroke", "rgba(255,255,255,0.08)").attr("stroke-width", 1);

// Mini scales
const miniX = d3.scaleLinear().domain([BOUNDS.x.min, BOUNDS.x.max]).range([2, MINIMAP_SIZE - 2]);
const miniY = d3.scaleLinear().domain([BOUNDS.y.min, BOUNDS.y.max]).range([MINIMAP_SIZE - 2, 2]);

// Draw the Triangle of Everything in minimap
const B = BOUNDS;
const triPlanckX = miniX(PLANCK_LOG_R);
const triPlanckY = miniY(PLANCK_LOG_M);
const triHubbleSchw = miniX(HUBBLE_LOG_R);
const triHubbleSchwY = miniY(schwarzschildM(HUBBLE_LOG_R));
const triHubbleComp = miniX(HUBBLE_LOG_R);
const triHubbleCompY = miniY(comptonM(HUBBLE_LOG_R));
miniSvg.append("polygon")
  .attr("points", [
    [triPlanckX, triPlanckY],
    [triHubbleSchw, triHubbleSchwY],
    [triHubbleComp, triHubbleCompY],
  ].map(p => p.join(",")).join(" "))
  .attr("fill", "none")
  .attr("stroke", "rgba(255,255,255,0.5)")
  .attr("stroke-width", 1);

// Viewport indicator rect (updated on zoom)
const miniViewport = miniSvg.append("rect")
  .attr("fill", "rgba(255,255,255,0.08)")
  .attr("stroke", "rgba(255,255,255,0.35)")
  .attr("stroke-width", 1)
  .attr("rx", 1);

function updateMinimap() {
  miniSvg.attr("display", currentK > 1.3 ? null : "none");
  const d = vd();
  const x = miniX(d.x0), y = miniY(d.y1);
  const w = miniX(d.x1) - miniX(d.x0);
  const h = miniY(d.y0) - miniY(d.y1);
  miniViewport
    .attr("x", Math.max(0, x)).attr("y", Math.max(0, y))
    .attr("width", Math.min(MINIMAP_SIZE, w)).attr("height", Math.min(MINIMAP_SIZE, h));
}

// Make minimap clickable for navigation
miniSvg.style("cursor", "pointer");
miniSvg.on("click", (event) => {
  const [mx, my] = d3.pointer(event, miniSvg.node());
  const logR = miniX.invert(mx);
  const logM = miniY.invert(my);
  const tx = cw / 2 - xBase(logR) * currentK;
  const ty = ch / 2 - yBase(logM) * currentK;
  svg.transition().duration(400).ease(d3.easeCubicOut)
    .call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(currentK));
});

// =============================================================
// Full redraw
// =============================================================

function redraw() {
  drawRegions();
  drawGrid();
  drawDensityLines();
  drawTriangleOverlay();
  drawBoundaries();
  drawArrows();
  drawRegionLabels();
  drawObjects();
  drawAxes();
  updateMinimap();
  updateScaleBar();
}

// =============================================================
// Zoom — D3 zoom behavior with requestAnimationFrame throttle
// =============================================================
// On each zoom event, we update xS/yS from D3's transform,
// then schedule a single redraw via rAF to avoid redundant
// repaints during fast scroll/pinch gestures.

let currentK = 1;    // current zoom scale factor (1 = identity)
let rafPending = false;

const zoomBehavior = d3.zoom()
  .scaleExtent([0.3, 800])
  .on("zoom", (event) => {
    const t = event.transform;
    currentK = t.k;
    xS = t.rescaleX(xBase);
    yS = t.rescaleY(yBase);

    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        redraw();
        updateReadout(null);
        rafPending = false;
      });
    }
  });

svg.call(zoomBehavior);

// Double-click zooms in at click location
svg.on("dblclick.zoom", null);
svg.on("dblclick", (event) => {
  event.preventDefault();
  const [mx, my] = d3.pointer(event, chart.node());
  const targetK = currentK * 2.5;
  const logR = xS.invert(mx), logM = yS.invert(my);
  const tx = cw / 2 - xBase(logR) * targetK;
  const ty = ch / 2 - yBase(logM) * targetK;
  svg.transition().duration(400).ease(d3.easeCubicOut)
    .call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(targetK));
});

// =============================================================
// Click-to-zoom on objects
// =============================================================

function zoomToObject(obj) {
  const targetK = Math.max(currentK * 2, 8);
  const tx = cw / 2 - xBase(obj.logR) * targetK;
  const ty = ch / 2 - yBase(obj.logM) * targetK;
  svg.transition().duration(700).ease(d3.easeCubicInOut)
    .call(zoomBehavior.transform,
      d3.zoomIdentity.translate(tx, ty).scale(targetK));
}

function panToCoord(logR, logM) {
  const tx = cw / 2 - xBase(logR) * currentK;
  const ty = ch / 2 - yBase(logM) * currentK;
  svg.transition().duration(500).ease(d3.easeCubicOut)
    .call(zoomBehavior.transform,
      d3.zoomIdentity.translate(tx, ty).scale(currentK));
}

// =============================================================
// Readout
// =============================================================

const readoutEl = document.getElementById("readout");

function updateReadout(event) {
  const d = vd();
  const xR = (d.x1 - d.x0).toFixed(0);
  const yR = (d.y1 - d.y0).toFixed(0);
  let html = `<span style="opacity:0.4">Viewing ${xR} × ${yR} orders of magnitude</span>`;

  if (event) {
    const [mx, my] = d3.pointer(event, chart.node());
    if (mx >= 0 && mx <= cw && my >= 0 && my <= ch) {
      const logR = xS.invert(mx), logM = yS.invert(my);
      const rFriendly = friendlyRadius(logR);
      const mFriendly = friendlyMass(logM);
      const logRho = logM - 3 * logR - DENSITY_SPHERE_C;

      // Zone indicator
      let zone = "";
      if (logM > schwarzschildM(logR)) zone = `<span style="color:#ff3355">gravity forbidden</span>`;
      else if (logM < comptonM(logR)) zone = `<span style="color:#9944ff">quantum forbidden</span>`;
      else zone = `<span style="color:#64ffda">accessible</span>`;

      html = `<div>R ≈ ${rFriendly} &nbsp;(10<sup>${logR.toFixed(1)}</sup> cm)</div>`
        + `<div>M ≈ ${mFriendly} &nbsp;(10<sup>${logM.toFixed(1)}</sup> g)</div>`
        + `<div>ρ ≈ 10<sup>${logRho.toFixed(0)}</sup> g/cm³ &nbsp;${zone}</div>`
        + `<div style="opacity:0.3; margin-top:3px">${xR}×${yR} decades</div>`;
    }
  }
  readoutEl.innerHTML = html;
}

svg.on("mousemove", (e) => updateReadout(e));
svg.on("mouseleave", () => updateReadout(null));

// Scale bar
const scaleBarEl = document.getElementById("scale-bar");

function updateScaleBar() {
  const d = vd();
  // How many log units does 80px span on the x-axis?
  const pxPerUnit = cw / (d.x1 - d.x0);
  const barUnits = 80 / pxPerUnit; // log units in 80px

  // Find a nice round number of decades
  const decades = barUnits;
  let label;
  if (decades >= 10) label = `${Math.round(decades)} decades`;
  else if (decades >= 1) label = `${decades.toFixed(1)} decades`;
  else if (decades >= 0.1) label = `${(decades * 10).toFixed(0)} orders × 0.1`;
  else label = `×${Math.pow(10, decades).toPrecision(2)}`;

  scaleBarEl.innerHTML = `<div class="bar"></div>${label}`;
}

updateScaleBar();

// =============================================================
// Controls
// =============================================================

document.getElementById("zoom-in").addEventListener("click", () =>
  svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.5));
document.getElementById("zoom-out").addEventListener("click", () =>
  svg.transition().duration(300).call(zoomBehavior.scaleBy, 1 / 1.5));
document.getElementById("zoom-reset").addEventListener("click", () =>
  svg.transition().duration(500).call(zoomBehavior.transform, d3.zoomIdentity));

// =============================================================
// Keyboard shortcuts
// =============================================================

const PAN_STEP = 80;
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  switch (e.key) {
    case "+": case "=":
      svg.transition().duration(200).call(zoomBehavior.scaleBy, 1.4); break;
    case "-": case "_":
      svg.transition().duration(200).call(zoomBehavior.scaleBy, 1 / 1.4); break;
    case "ArrowLeft": case "a":
      svg.transition().duration(150).call(zoomBehavior.translateBy, PAN_STEP, 0); break;
    case "ArrowRight": case "d":
      svg.transition().duration(150).call(zoomBehavior.translateBy, -PAN_STEP, 0); break;
    case "ArrowUp": case "w":
      svg.transition().duration(150).call(zoomBehavior.translateBy, 0, PAN_STEP); break;
    case "ArrowDown": case "s":
      svg.transition().duration(150).call(zoomBehavior.translateBy, 0, -PAN_STEP); break;
    case "Home": case "0":
      svg.transition().duration(500).call(zoomBehavior.transform, d3.zoomIdentity); break;
  }
});

// =============================================================
// Resize
// =============================================================

window.addEventListener("resize", () => {
  measure();
  svg.attr("width", W).attr("height", H);
  svg.select("rect").attr("width", W).attr("height", H);
  defs.select("#clip rect").attr("width", cw).attr("height", ch);
  xBase.domain([viewXMin, viewXMax]).range([0, cw]);
  yBase.domain([viewYMin, viewYMax]).range([ch, 0]);
  svg.call(zoomBehavior.transform, d3.zoomIdentity);
  xS = xBase.copy();
  yS = yBase.copy();
  currentK = 1;
  chart.select("rect:last-of-type").attr("width", cw).attr("height", ch);
  miniSvg.attr("transform",
    `translate(${W - MINIMAP_SIZE - MINIMAP_PAD - margin.right}, ${margin.top + MINIMAP_PAD})`);
  redraw();
});

// =============================================================
// Search
// =============================================================

const searchBox = document.getElementById("search-box");
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

function openSearch() {
  searchBox.classList.add("expanded");
  requestAnimationFrame(() => searchInput.focus());
}
function closeSearch() {
  searchBox.classList.remove("expanded");
  searchInput.value = "";
  searchResults.classList.remove("active");
  searchInput.blur();
}

searchBtn.addEventListener("click", () => {
  if (searchBox.classList.contains("expanded")) closeSearch();
  else openSearch();
});

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  if (q.length < 1) { searchResults.classList.remove("active"); return; }

  const matches = OBJECTS.filter(o => o.name.toLowerCase().includes(q)).slice(0, 8);
  if (matches.length === 0) { searchResults.classList.remove("active"); return; }

  searchResults.innerHTML = matches.map(o => {
    const cat = CATEGORIES[o.cat];
    return `<div class="search-item" data-logr="${o.logR}" data-logm="${o.logM}">
      <span class="search-dot" style="background:${cat.color}"></span>
      <span class="search-name">${o.name}</span>
      <span class="search-cat">${o.cat}</span>
    </div>`;
  }).join("");
  searchResults.classList.add("active");

  searchResults.querySelectorAll(".search-item").forEach(el => {
    el.addEventListener("click", () => {
      const logR = parseFloat(el.dataset.logr);
      const logM = parseFloat(el.dataset.logm);
      const obj = OBJECTS.find(o => o.logR === logR && o.logM === logM);
      panToCoord(logR, logM);
      if (obj) openSidebar(obj);
      closeSearch();
    });
  });
});

searchInput.addEventListener("blur", () => {
  setTimeout(() => {
    searchResults.classList.remove("active");
    if (searchInput.value.trim() === "") closeSearch();
  }, 200);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== searchInput) {
    e.preventDefault();
    openSearch();
  }
  if (e.key === "Escape") {
    if (selectedObj) {
      closeSidebar();
    } else if (searchBox.classList.contains("expanded")) {
      closeSearch();
    } else if (sidebarEl.classList.contains("open")) {
      sidebarEl.classList.remove("open");
    }
  }
});

// =============================================================
// Preset views
// =============================================================

const PRESETS = {
  all:       null, // identity zoom = full view
  particles: { x: [-18, -4], y: [-34, -20] },
  solar:     { x: [7, 14], y: [24, 36] },
  stars:     { x: [5, 22], y: [30, 45] },
  cosmos:    { x: [18, 30], y: [36, 58] },
};

document.querySelectorAll("#preset-bar button").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.preset;
    const p = PRESETS[key];

    document.querySelectorAll("#preset-bar button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (!p) {
      svg.transition().duration(800).ease(d3.easeCubicInOut)
        .call(zoomBehavior.transform, d3.zoomIdentity);
      return;
    }

    const kx = cw / (xBase(p.x[1]) - xBase(p.x[0]));
    const ky = ch / (yBase(p.y[0]) - yBase(p.y[1]));
    const k = Math.min(kx, ky) * 0.9;
    const cx = (xBase(p.x[0]) + xBase(p.x[1])) / 2;
    const cy = (yBase(p.y[0]) + yBase(p.y[1])) / 2;
    const tx = cw / 2 - cx * k;
    const ty = ch / 2 - cy * k;

    svg.transition().duration(800).ease(d3.easeCubicInOut)
      .call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
  });
});

// =============================================================
// Procedural star background — cosmetic, doesn't zoom
// =============================================================
// 300 tiny circles with a seeded PRNG for deterministic placement.
// Some stars are tinted blue or amber for visual variety.

function drawStarfield() {
  // Insert behind everything else in the chart group but after the clip background
  const starGroup = chart.insert("g", ":first-child").attr("clip-path", "url(#clip)");
  // Seeded pseudo-random for consistent stars
  let seed = 42;
  const rng = () => { seed = (seed * 16807 + 0) % 2147483647; return seed / 2147483647; };

  for (let i = 0; i < 300; i++) {
    const sx = rng() * cw;
    const sy = rng() * ch;
    const size = rng() * 1.0 + 0.15;
    const opacity = rng() * 0.12 + 0.01;
    const hue = rng() > 0.8 ? (rng() > 0.5 ? "#aaccff" : "#ffddaa") : "#ffffff";
    starGroup.append("circle")
      .attr("cx", sx).attr("cy", sy)
      .attr("r", size).attr("fill", hue)
      .attr("opacity", opacity);
  }
}

drawStarfield();

// =============================================================
// URL hash state — bookmarkable zoom positions
// =============================================================
// Format: #centerX,centerY,zoomScale  (e.g., #10.8,33.3,12.00)
// Saved on a 500ms debounce after zoom events.
// On page load, if a hash exists, the view jumps there instead
// of playing the intro animation.

function saveHash() {
  const d = vd();
  const cx = ((d.x0 + d.x1) / 2).toFixed(1);
  const cy = ((d.y0 + d.y1) / 2).toFixed(1);
  const z = currentK.toFixed(2);
  history.replaceState(null, "", `#${cx},${cy},${z}`);
}

function loadHash() {
  const h = location.hash.slice(1);
  if (!h) return false;
  const parts = h.split(",").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return false;
  const [cx, cy, k] = parts;
  const tx = cw / 2 - xBase(cx) * k;
  const ty = ch / 2 - yBase(cy) * k;
  svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
  return true;
}

// Save hash on zoom end (debounced)
let hashTimer = null;
const origZoomHandler = zoomBehavior.on("zoom");
zoomBehavior.on("zoom", (event) => {
  origZoomHandler(event);
  clearTimeout(hashTimer);
  hashTimer = setTimeout(saveHash, 500);
});
svg.call(zoomBehavior);

// =============================================================
// Boot — intro animation or hash restore
// =============================================================

if (!loadHash()) {
  // Intro animation: start zoomed on the Sun (logR≈10.84, logM≈33.30),
  // then after 800ms, smoothly zoom out to the full chart view.
  const introK = 12;
  const introTx = cw / 2 - xBase(10.84) * introK;
  const introTy = ch / 2 - yBase(33.30) * introK;
  svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(introTx, introTy).scale(introK));

  // After a beat, zoom out to the full chart
  setTimeout(() => {
    svg.transition()
      .duration(2500)
      .ease(d3.easeCubicInOut)
      .call(zoomBehavior.transform, d3.zoomIdentity);
  }, 800);
}

// Fade out the key hint after 6 seconds
setTimeout(() => {
  const hint = document.getElementById("keyhint");
  if (hint) hint.classList.add("faded");
}, 6000);
