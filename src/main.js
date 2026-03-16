import * as d3 from "d3";
import {
  BOUNDS, SCHWARZSCHILD_C, COMPTON_C, PLANCK_LOG_R, PLANCK_LOG_M,
  schwarzschildR, schwarzschildM, comptonR, comptonM,
  DENSITY_LINES, RADIUS_UNITS, MASS_UNITS, ENERGY_UNITS,
  CATEGORIES, SUBCAT_COLORS, SUBCAT_LABELS, CAT_DISPLAY, DENSITY_SPHERE_C, ARROWS, EPOCH_BANDS,
  REFERENCE_LINES, HUBBLE_LOG_R, CONNECTION_PATHS,
  DARK_MATTER_REGIONS, ENERGY_BANDS, TEMPERATURE_ARROWS, WATER_RANGE,
} from "./data.js";
import objectsData from "./objects.json";
import introRaw from "./texts/intro.md?raw";
import "./style.css";
import katex from "katex";
import "katex/dist/katex.min.css";

// Load descriptions from markdown files (eager, at build time)
const descFiles = import.meta.glob("../content/descriptions/*.md", { query: "?raw", import: "default", eager: true });
const DESC_BY_SLUG = {};

// Load object images (eager, at build time — Vite hashes for cache-busting)
const imgFiles = import.meta.glob("../content/images/*.webp", { eager: true });
const IMG_BY_SLUG = {};
for (const [path, mod] of Object.entries(imgFiles)) {
  const slug = path.replace("../content/images/", "").replace(".webp", "");
  IMG_BY_SLUG[slug] = mod.default;
}
import imageManifest from "../content/images/manifest.json";

function parseFrontmatter(raw) {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("---")) return { meta: {}, body: trimmed };
  const end = trimmed.indexOf("---", 3);
  if (end === -1) return { meta: {}, body: trimmed };
  const yamlBlock = trimmed.slice(3, end).trim();
  const body = trimmed.slice(end + 3).trim();
  const meta = {};
  yamlBlock.split("\n").forEach(line => {
    const idx = line.indexOf(":");
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    meta[key] = val;
  });
  return { meta, body };
}

for (const [path, content] of Object.entries(descFiles)) {
  const slug = path.replace("../content/descriptions/", "").replace(".md", "");
  DESC_BY_SLUG[slug] = content.trim();
}

function nameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/γ/g, "gamma").replace(/τ/g, "tau").replace(/μ/g, "mu")
    .replace(/['']/g, "").replace(/[*()]/g, "")
    .replace(/₀/g, "0").replace(/₁/g, "1").replace(/₂/g, "2").replace(/₃/g, "3")
    .replace(/₄/g, "4").replace(/₅/g, "5").replace(/₆/g, "6").replace(/₇/g, "7")
    .replace(/₈/g, "8").replace(/₉/g, "9")
    .replace(/ö/g, "o").replace(/ü/g, "u").replace(/ä/g, "a")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const OBJECTS = objectsData.map(o => ({ ...o, slug: o.slug || nameToSlug(o.name) }));
let tileMeta = null;

// =============================================================
// Layout
// =============================================================

const SIDEBAR_W = 360;
const BASE_MARGIN_LEFT = 145;
let _isSidebarOpen = true;
let _booted = false;

const margin = { top: 55, right: 95, bottom: 80, left: SIDEBAR_W };
let W, H, cw, ch;

// Equal-scale view bounds — computed so 1 data unit = same px in both axes
let viewXMin, viewXMax, viewYMin, viewYMax;

function measure() {
  W = window.innerWidth;
  H = window.innerHeight;
  margin.left = _isSidebarOpen ? SIDEBAR_W + 80 : BASE_MARGIN_LEFT;
  cw = W - margin.left - margin.right;
  ch = H - margin.top - margin.bottom;

  const origXRange = BOUNDS.x.max - BOUNDS.x.min;
  const origYRange = BOUNDS.y.max - BOUNDS.y.min;
  const ppuX = cw / origXRange;
  const ppuY = ch / origYRange;

  if (ppuX > ppuY) {
    const ppu = ppuY;
    const xRange = cw / ppu;
    const xCenter = (BOUNDS.x.min + BOUNDS.x.max) / 2;
    viewXMin = xCenter - xRange / 2;
    viewXMax = xCenter + xRange / 2;
    viewYMin = BOUNDS.y.min;
    viewYMax = BOUNDS.y.max;
  } else {
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
// Scales  (equal px-per-unit for both axes)
// =============================================================

const xBase = d3.scaleLinear().domain([viewXMin, viewXMax]).range([0, cw]);
const yBase = d3.scaleLinear().domain([viewYMin, viewYMax]).range([ch, 0]);
let xS = xBase.copy();
let yS = yBase.copy();

const px = v => xS(v);
const py = v => yS(v);

// =============================================================
// SVG scaffolding
// =============================================================

const svg = d3.select("#chart").append("svg").attr("width", W).attr("height", H);
const defs = svg.append("defs");

// Clip
defs.append("clipPath").attr("id", "clip")
  .append("rect").attr("width", cw).attr("height", ch);

// --- gradients ---

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

const triGlow = defs.append("radialGradient").attr("id", "grad-tri")
  .attr("cx", "0.4").attr("cy", "0.45").attr("r", "0.6");
triGlow.append("stop").attr("offset", "0%").attr("stop-color", "#181852").attr("stop-opacity", 0.18);
triGlow.append("stop").attr("offset", "100%").attr("stop-color", "#06061a").attr("stop-opacity", 0);

// --- glow filter for boundary lines ---
const blurF = defs.append("filter").attr("id", "line-glow")
  .attr("x", "-40%").attr("y", "-40%").attr("width", "180%").attr("height", "180%");
blurF.append("feGaussianBlur").attr("in", "SourceGraphic").attr("stdDeviation", "3")
  .attr("result", "b");
const m = blurF.append("feMerge");
m.append("feMergeNode").attr("in", "b");
m.append("feMergeNode").attr("in", "SourceGraphic");

// --- glow filter for connection dots ---
const connGlow = defs.append("filter").attr("id", "conn-glow")
  .attr("x", "-150%").attr("y", "-150%").attr("width", "400%").attr("height", "400%");
connGlow.append("feGaussianBlur").attr("in", "SourceGraphic").attr("stdDeviation", "2")
  .attr("result", "b");
const cg = connGlow.append("feMerge");
cg.append("feMergeNode").attr("in", "b");
cg.append("feMergeNode").attr("in", "SourceGraphic");

// --- Film grain noise filter ---
const grainF = defs.append("filter").attr("id", "film-grain")
  .attr("x", "0%").attr("y", "0%").attr("width", "100%").attr("height", "100%");
grainF.append("feTurbulence")
  .attr("type", "fractalNoise").attr("baseFrequency", "1.2")
  .attr("numOctaves", "3").attr("stitchTiles", "stitch").attr("result", "noise");
grainF.append("feColorMatrix").attr("type", "saturate").attr("values", "0").attr("in", "noise").attr("result", "mono");
grainF.append("feBlend").attr("in", "SourceGraphic").attr("in2", "mono").attr("mode", "multiply");

// --- Background rect ---
svg.append("rect").attr("width", W).attr("height", H).attr("fill", "#000000");

// --- Chart container ---
const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
const clip = chart.append("g").attr("clip-path", "url(#clip)");
clip.append("rect").attr("width", cw).attr("height", ch).attr("fill", "#000000");
clip.append("rect").attr("width", cw).attr("height", ch).attr("fill", "url(#grad-tri)");

// Background tile layer (on top of gradient, below chart content)
const lTiles = clip.append("g").style("pointer-events", "none");

// Layers
const lRegion     = clip.append("g");
const lGrid       = clip.append("g");
const lDensity    = clip.append("g");
const lTriOverlay = clip.append("g");
const lBound      = clip.append("g");
const lBigBangEras = clip.append("g");
const lEnergyBands = clip.append("g");
const lDarkMatter = clip.append("g");
const lArrows     = clip.append("g").style("mix-blend-mode", "screen");
const lConnDots   = clip.append("g").style("pointer-events", "none").style("mix-blend-mode", "screen");
const lRegLabel   = clip.append("g");
const lObj        = clip.append("g");
const lHighlight  = clip.append("g").style("pointer-events", "none");

// Film grain noise overlay (paper texture, controlled by Noise slider)
const grainRect = clip.append("rect")
  .attr("id", "grain-overlay")
  .attr("width", cw).attr("height", ch)
  .attr("fill", "white").attr("opacity", 1.05)
  .attr("filter", "url(#film-grain)")
  .style("mix-blend-mode", "overlay")
  .style("pointer-events", "none");

// Axes outside clip
const axB = chart.append("g");
const axT = chart.append("g");
const axL = chart.append("g");
const axR = chart.append("g");

// Border on top
chart.append("rect").attr("width", cw).attr("height", ch)
  .attr("fill", "none").attr("stroke", "rgba(255,255,255,0.15)").attr("stroke-width", 1);

// =============================================================
// Utility: visible domain
// =============================================================

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
// Draw: Multi-level adaptive grid (×10 thin, ×1000 bright)
// =============================================================

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

  // Planck guide lines — red dashed lines from Planck point to axes
  const planckGuideStyle = { stroke: "rgba(255,100,100,0.15)", width: 0.8, dash: "4 4" };

  // Vertical: Planck point → bottom axis (Planck length guide)
  lBound.append("line")
    .attr("x1", planckX).attr("y1", planckY).attr("x2", planckX).attr("y2", ch)
    .attr("stroke", planckGuideStyle.stroke).attr("stroke-width", planckGuideStyle.width)
    .attr("stroke-dasharray", planckGuideStyle.dash);

  // Horizontal: Planck point → left axis (Planck energy guide)
  lBound.append("line")
    .attr("x1", 0).attr("y1", planckY).attr("x2", planckX).attr("y2", planckY)
    .attr("stroke", planckGuideStyle.stroke).attr("stroke-width", planckGuideStyle.width)
    .attr("stroke-dasharray", planckGuideStyle.dash);

  // Horizontal: Planck point → right axis (Planck mass guide)
  lBound.append("line")
    .attr("x1", planckX).attr("y1", planckY).attr("x2", cw).attr("y2", planckY)
    .attr("stroke", planckGuideStyle.stroke).attr("stroke-width", planckGuideStyle.width)
    .attr("stroke-dasharray", planckGuideStyle.dash);

  // Diagonal: Planck density / Planck time line (slope 3, logDensity ≈ 93.7)
  // This is the isodensity line through the Planck point
  const planckDensityB = DENSITY_SPHERE_C + 93.7;
  // logM = 3*logR + b → extend line in both directions from Planck point
  // Toward top axis (higher R, higher M)
  const diagR1 = PLANCK_LOG_R - 5, diagM1 = 3 * diagR1 + planckDensityB;
  const diagR2 = PLANCK_LOG_R + 5, diagM2 = 3 * diagR2 + planckDensityB;
  const diagSeg = clampLineToChart(px(diagR1), py(diagM1), px(diagR2), py(diagM2));
  if (diagSeg) {
    lBound.append("line")
      .attr("x1", diagSeg.x1).attr("y1", diagSeg.y1)
      .attr("x2", diagSeg.x2).attr("y2", diagSeg.y2)
      .attr("stroke", "rgba(255,100,100,0.15)").attr("stroke-width", 0.8)
      .attr("stroke-dasharray", "4 4");
  }

  // Reference lines (main sequence, red giants, TOV, QGP, etc.)
  const d = vd();
  REFERENCE_LINES.forEach(rl => {
    if (rl.width <= 0) return;
    const p0 = rl.points[0], p1 = rl.points[1];

    // Clip line segment to the viewport (handles diagonal lines that cross without
    // having endpoints inside the view)
    const clipped = clampLineToChart(px(p0.logR), py(p0.logM), px(p1.logR), py(p1.logM));
    if (!clipped) return; // fully outside viewport

    const screenLen = Math.hypot(clipped.x2 - clipped.x1, clipped.y2 - clipped.y1);
    if (screenLen < 60) return;

    // Draw the full line (SVG clip-path handles visual clipping)
    lBound.append("line")
      .attr("x1", px(p0.logR)).attr("y1", py(p0.logM))
      .attr("x2", px(p1.logR)).attr("y2", py(p1.logM))
      .attr("stroke", rl.color).attr("stroke-width", rl.width)
      .attr("stroke-dasharray", rl.dash);

    // Label at midpoint of the VISIBLE segment
    const midSx = (clipped.x1 + clipped.x2) / 2;
    const midSy = (clipped.y1 + clipped.y2) / 2;
    const ang = Math.atan2(clipped.y2 - clipped.y1, clipped.x2 - clipped.x1) * 180 / Math.PI;

    lBound.append("text")
      .attr("x", midSx).attr("y", midSy - 5)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif").attr("font-size", 8)
      .attr("fill", rl.color.replace(/[\d.]+\)$/, "0.4)"))
      .attr("font-style", "italic").attr("letter-spacing", "1px")
      .attr("transform", `rotate(${ang},${midSx},${midSy - 5})`)
      .text(rl.label.toUpperCase());
  });
}

// =============================================================
// Draw: Energy Band Labels & Temperature Arrows
// =============================================================

function drawEnergyBands() {
  lEnergyBands.selectAll("*").remove();
  const d = vd();
  const ppuY = ch / (d.y1 - d.y0);

  // Sort bands by logM descending (highest energy first)
  const sorted = ENERGY_BANDS.slice().sort((a, b) => b.logM - a.logM);
  const planckX = px(PLANCK_LOG_R);

  // --- Range labels (dashed lines from Compton line to Planck length + labels) ---
  const fontSize = 12;

  // Helper to render a band label (outline + colored fill)
  function renderBandLabel(labelX, labelY, text, slug) {
    lEnergyBands.append("text")
      .attr("x", labelX).attr("y", labelY)
      .attr("text-anchor", "end")
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", fontSize).attr("letter-spacing", "1px")
      .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.6)")
      .attr("stroke-width", 2).attr("stroke-linejoin", "round")
      .attr("opacity", 0.5)
      .text(text);
    const txt = lEnergyBands.append("text")
      .attr("x", labelX).attr("y", labelY)
      .attr("text-anchor", "end")
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", fontSize).attr("letter-spacing", "1px")
      .attr("fill", "rgba(255,130,130,0.8)")
      .attr("opacity", 0.5)
      .text(text);
    if (slug) {
      txt.style("cursor", "pointer")
        .on("click", (e) => { e.stopPropagation(); openInfoPanel(slug, text); setSidebarOpen(true); });
    }
  }

  // First pass: compute yPx for all bands and draw dashed lines
  const bandYPx = sorted.map(b => {
    if (b.logM < d.y0 - 5 || b.logM > d.y1 + 5) return null;
    return py(b.logM);
  });

  for (let i = 0; i < sorted.length; i++) {
    if (bandYPx[i] === null) continue;
    const yPx = bandYPx[i];
    if (yPx < -50 || yPx > ch + 50) continue;

    const compX = px(comptonR(sorted[i].logM));
    if (Math.min(compX, planckX) > cw + 50 || Math.max(compX, planckX) < -50) continue;

    lEnergyBands.append("line")
      .attr("x1", compX).attr("y1", yPx)
      .attr("x2", planckX).attr("y2", yPx)
      .attr("stroke", "rgba(255,100,100,0.4)")
      .attr("stroke-width", 0.7)
      .attr("stroke-dasharray", "4 3");
  }

  // Second pass: draw labels between visible band pairs
  const labelX = planckX - 5;
  let firstVisibleDrawn = false;

  for (let i = 0; i < sorted.length; i++) {
    const yPx = bandYPx[i] !== null ? bandYPx[i] : null;
    const inView = yPx !== null && yPx >= -50 && yPx <= ch + 50;

    if (!inView) continue;

    // For the first visible band, show its own label above its line
    // (handles the case where PLANCK ENERGY is above the viewport)
    if (!firstVisibleDrawn) {
      firstVisibleDrawn = true;
      if (i > 0) {
        // A band above is out of view — show this band's label above its line
        const ly = yPx - 6;
        if (ly > -2) renderBandLabel(labelX, ly, sorted[i].label, sorted[i].slug);
      } else {
        // This IS the topmost band — show PLANCK ENERGY above its line
        const ly = yPx - 6;
        if (ly > -2) renderBandLabel(labelX, ly, sorted[i].label, sorted[i].slug);
      }
    }

    // Region label between this band and the next visible one
    if (i < sorted.length - 1) {
      const nextYPx = bandYPx[i + 1];
      if (nextYPx === null) continue;
      if (nextYPx < -50 || nextYPx > ch + 50) continue;
      const gap = Math.abs(nextYPx - yPx);
      if (gap < fontSize + 4) continue;

      const midY = (yPx + nextYPx) / 2;
      renderBandLabel(labelX, midY + fontSize * 0.35, sorted[i + 1].label, sorted[i + 1].slug);
    }
  }

  // --- Helper: compute arrow X positions relative to Compton line ---
  // Arrow tip touches the Compton line; tail and label are a fixed
  // pixel distance to the left so they stay visible at any zoom.
  const ARROW_PX_LEN = 60;   // arrow length in pixels
  const LABEL_PX_GAP = 5;    // gap between label and arrow tail

  function drawArrow(logM, label, color, slug) {
    const yPx = py(logM);
    if (yPx < -20 || yPx > ch + 20) return;

    const compR = comptonR(logM);
    const tipX = px(compR);
    if (tipX > cw + 50) return;   // Compton line off-screen right

    const tailX = tipX - ARROW_PX_LEN;
    const labelX = tailX - LABEL_PX_GAP;

    // Dotted line
    lEnergyBands.append("line")
      .attr("x1", tailX).attr("y1", yPx)
      .attr("x2", tipX).attr("y2", yPx)
      .attr("stroke", color)
      .attr("stroke-width", 0.7)
      .attr("stroke-dasharray", "2 3");

    // Arrowhead
    lEnergyBands.append("path")
      .attr("d", `M${tipX},${yPx} L${tipX - 4},${yPx - 2.4} L${tipX - 4},${yPx + 2.4}Z`)
      .attr("fill", color);

    // Label — match object label style: Inter 600, 10px, letter-spacing 0.5px
    const lines = label.split("\n");
    const fontSize = 10;
    const lineHeight = fontSize * 1.3;
    const startY = yPx - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, li) => {
      // Dark outline (same as obj-label)
      lEnergyBands.append("text")
        .attr("x", labelX).attr("y", startY + li * lineHeight + fontSize * 0.35)
        .attr("text-anchor", "end")
        .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
        .attr("font-size", fontSize).attr("letter-spacing", "0.5px")
        .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.85)")
        .attr("stroke-width", 3).attr("stroke-linejoin", "round")
        .text(line);

      // Colored text (same as obj-label)
      const el = lEnergyBands.append("text")
        .attr("x", labelX).attr("y", startY + li * lineHeight + fontSize * 0.35)
        .attr("text-anchor", "end")
        .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
        .attr("font-size", fontSize).attr("letter-spacing", "0.5px")
        .attr("fill", color);
      el.text(line);

      if (slug && li === 0) {
        el.style("cursor", "pointer")
          .on("click", (e) => {
            e.stopPropagation();
            openInfoPanel(slug, label.replace("\n", " "));
            setSidebarOpen(true);
          });
      }
    });
  }

  // Temperature arrows — only when zoomed enough, skip overlapping
  if (ppuY >= 6) {
    const arrowFontSize = 10;
    const arrowLineH = arrowFontSize * 1.3;
    const placedArrows = [];  // array of { yMin, yMax } in px

    // Sort by logM descending so highest energy (top of screen) first
    const sortedArrows = TEMPERATURE_ARROWS.slice()
      .filter(a => a.logM >= d.y0 && a.logM <= d.y1)
      .sort((a, b) => b.logM - a.logM);

    sortedArrows.forEach(arr => {
      const yPx = py(arr.logM);
      const lines = arr.label.split("\n");
      const totalH = lines.length * arrowLineH;
      const yMin = yPx - totalH / 2 - 2;
      const yMax = yPx + totalH / 2 + 2;

      // Check collision with already placed arrows
      const collides = placedArrows.some(p => yMin < p.yMax && yMax > p.yMin);
      if (collides) return;

      placedArrows.push({ yMin, yMax });
      drawArrow(arr.logM, arr.label, "rgba(255,255,255,0.5)", arr.slug);
    });
  }

  // --- Water range (blue highlight) ---
  if (WATER_RANGE.logMTop >= d.y0 && WATER_RANGE.logMBottom <= d.y1 && ppuY >= 6) {
    const topY = py(WATER_RANGE.logMTop);
    const botY = py(WATER_RANGE.logMBottom);
    const gap = Math.abs(botY - topY);
    const waterBlue = "rgba(128,222,234,0.5)";

    if (gap >= 2) {
      const compRTop = comptonR(WATER_RANGE.logMTop);
      const compRBot = comptonR(WATER_RANGE.logMBottom);
      const tipXTop = px(compRTop);
      const tipXBot = px(compRBot);

      if (tipXTop > -50 && tipXBot > -50) {
        const tailXTop = tipXTop - ARROW_PX_LEN;
        const tailXBot = tipXBot - ARROW_PX_LEN;
        const midY = (topY + botY) / 2;
        const labelX = Math.min(tailXTop, tailXBot) - LABEL_PX_GAP;

        // Top arrow (100°C)
        lEnergyBands.append("line")
          .attr("x1", tailXTop).attr("y1", topY)
          .attr("x2", tipXTop).attr("y2", topY)
          .attr("stroke", waterBlue).attr("stroke-width", 0.7)
          .attr("stroke-dasharray", "2 3");
        lEnergyBands.append("path")
          .attr("d", `M${tipXTop},${topY} L${tipXTop - 4},${topY - 2.4} L${tipXTop - 4},${topY + 2.4}Z`)
          .attr("fill", waterBlue);

        // Bottom arrow (0°C)
        lEnergyBands.append("line")
          .attr("x1", tailXBot).attr("y1", botY)
          .attr("x2", tipXBot).attr("y2", botY)
          .attr("stroke", waterBlue).attr("stroke-width", 0.7)
          .attr("stroke-dasharray", "2 3");
        lEnergyBands.append("path")
          .attr("d", `M${tipXBot},${botY} L${tipXBot - 4},${botY - 2.4} L${tipXBot - 4},${botY + 2.4}Z`)
          .attr("fill", waterBlue);

        // Vertical bracket
        lEnergyBands.append("line")
          .attr("x1", tailXTop).attr("y1", topY)
          .attr("x2", tailXBot).attr("y2", botY)
          .attr("stroke", waterBlue).attr("stroke-width", 0.7);

        // Label — match object label style
        const fontSize = 10;
        lEnergyBands.append("text")
          .attr("x", labelX).attr("y", midY + fontSize * 0.35)
          .attr("text-anchor", "end")
          .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
          .attr("font-size", fontSize).attr("letter-spacing", "0.5px")
          .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.85)")
          .attr("stroke-width", 3).attr("stroke-linejoin", "round")
          .text(WATER_RANGE.label);
        lEnergyBands.append("text")
          .attr("x", labelX).attr("y", midY + fontSize * 0.35)
          .attr("text-anchor", "end")
          .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
          .attr("font-size", fontSize).attr("letter-spacing", "0.5px")
          .attr("fill", waterBlue)
          .text(WATER_RANGE.label);
      }
    }
  }
}

// =============================================================
// Draw: Dark Matter Search Regions
// =============================================================

let _dmHovered = false;

function drawDarkMatterRegions() {
  lDarkMatter.selectAll("*").remove();
  if (currentK < 2) return; // only show when zoomed in enough

  const baseOpacity = currentK > 3 ? 0.2 : 0.1;
  const opacity = _dmHovered ? 0.3 : baseOpacity;

  DARK_MATTER_REGIONS.forEach(region => {
    const pts = region.polygon.map(p => `${px(p.logR)},${py(p.logM)}`).join(" ");
    lDarkMatter.append("polygon")
      .attr("points", pts)
      .attr("fill", "#ffffff")
      .attr("opacity", opacity)
      .attr("class", "dm-region")
      .style("cursor", "pointer")
      .on("mouseover", () => { _dmHovered = true; drawDarkMatterRegions(); })
      .on("mouseout", () => { _dmHovered = false; drawDarkMatterRegions(); })
      .on("click", (e) => {
        e.stopPropagation();
        openInfoPanel("dark-matter-search", "The Search for Dark Matter");
      });
  });

  // Label — positioned between the two windows, rotated along Schwarzschild line
  const schwAng = screenAngle(1);
  const labelM = 19;
  const labelR = schwarzschildR(labelM) + 1.5;
  const lx = px(labelR), ly = py(labelM);
  if (lx > -50 && lx < cw + 50 && ly > -50 && ly < ch + 50) {
    const g = lDarkMatter.append("g").style("cursor", "pointer")
      .on("click", (e) => {
        e.stopPropagation();
        openInfoPanel("dark-matter-search", "The Search for Dark Matter");
      })
      .on("mouseover", () => { _dmHovered = true; drawDarkMatterRegions(); })
      .on("mouseout", () => { _dmHovered = false; drawDarkMatterRegions(); });
    // Background stroke for readability
    g.append("text")
      .attr("x", lx).attr("y", ly)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif")
      .attr("font-size", 10).attr("font-weight", 600)
      .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.6)")
      .attr("stroke-width", 3).attr("stroke-linejoin", "round")
      .attr("letter-spacing", "1px")
      .attr("transform", `rotate(${schwAng},${lx},${ly})`)
      .text("POSSIBLE AREAS FOR DARK MATTER");
    // Foreground text
    g.append("text")
      .attr("x", lx).attr("y", ly)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif")
      .attr("font-size", 10).attr("font-weight", 600)
      .attr("fill", `rgba(255,255,255,${opacity + 0.2})`)
      .attr("letter-spacing", "1px")
      .attr("transform", `rotate(${schwAng},${lx},${ly})`)
      .text("POSSIBLE AREAS FOR DARK MATTER");
  }

  // WIMP label — near Compton line in particle region
  const wimpR = -16, wimpM = -22;
  const wx = px(wimpR), wy = py(wimpM);
  if (wx > -50 && wx < cw + 50 && wy > -50 && wy < ch + 50) {
    lDarkMatter.append("text")
      .attr("x", wx).attr("y", wy)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif")
      .attr("font-size", 7).attr("font-weight", 500)
      .attr("fill", "rgba(255,255,255,0.3)")
      .attr("letter-spacing", "1.5px")
      .style("cursor", "pointer")
      .text("WIMP")
      .on("click", (e) => {
        e.stopPropagation();
        openInfoPanel("dark-matter-search", "The Search for Dark Matter");
      });
  }

  // MACHO label — near stellar BH / brown dwarf area
  const machoR = 10, machoM = 32;
  const mx = px(machoR), my = py(machoM);
  if (mx > -50 && mx < cw + 50 && my > -50 && my < ch + 50) {
    lDarkMatter.append("text")
      .attr("x", mx).attr("y", my)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif")
      .attr("font-size", 7).attr("font-weight", 500)
      .attr("fill", "rgba(255,255,255,0.3)")
      .attr("letter-spacing", "1.5px")
      .style("cursor", "pointer")
      .text("MACHO")
      .on("click", (e) => {
        e.stopPropagation();
        openInfoPanel("dark-matter-search", "The Search for Dark Matter");
      });
  }
}

// =============================================================
// Draw: Isodensity / epoch lines
// =============================================================

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
// Draw: Big Bang era lines along Schwarzschild boundary
// =============================================================

const BIG_BANG_ERAS = [
  { logRho: 93.7 },
  { logRho: 76,     label: "PLANCK EPOCH",                    slug: "planck-era" },
  { logRho: 50,     label: "GRAND UNIFIED THEORY EPOCH",      slug: "grand-unified-theory-era" },
  { logRho: 25,     label: "INFLATION EPOCH",                 slug: "inflation-era" },
  { logRho: 14.4,   label: "ELECTROWEAK EPOCH",               slug: "electroweak-era" },
  { logRho: 4,      label: "QUARK EPOCH",                     slug: "quantum-chromodynamics-era" },
  { logRho: 0,      label: "NUCLEOSYNTHESIS ERA",             slug: "big-bang-nucleosynthesis" },
  { logRho: -29.5,  label: "DARK ENERGY ERA",                 slug: "dark-energy-era" },
  { logRho: -150.6,  label: "HEAT DEATH OF THE UNIVERSE",    slug: "heat-death" },
];

function drawBigBangEras() {
  lBigBangEras.selectAll("*").remove();
  if (currentK < 1.3) return; // hide when zoomed out too much
  const d = vd();
  const densAngle = screenAngle(3);

  // Precompute Schwarzschild intersection points for each era
  const eras = BIG_BANG_ERAS.map(era => {
    const logR_int = (-SCHWARZSCHILD_C - DENSITY_SPHERE_C - era.logRho) / 2;
    const logM_int = logR_int - SCHWARZSCHILD_C;
    return { ...era, logR_int, logM_int };
  });

  // Draw diagonal lines (slope 3) from Schwarzschild intersection extending right.
  // Special case: the heat death line (last entry, no label) starts from the
  // Hubble-Compton corner instead of the Schwarzschild intersection.
  eras.forEach((era, idx) => {
    const b = DENSITY_SPHERE_C + era.logRho;

    let startR, startM;
    if (era.logRho <= -150) {
      // Heat death line: start from bottom of Hubble radius (Compton-Hubble corner)
      startR = HUBBLE_LOG_R;
      startM = comptonM(HUBBLE_LOG_R);
    } else {
      startR = era.logR_int;
      startM = era.logM_int;
    }

    // Extend along density line (slope 3) to the right
    const farR = startR + 200;
    const farM = 3 * farR + b;
    const clipped = clampLineToChart(
      px(startR), py(startM),
      px(farR), py(farM)
    );
    if (!clipped) return;

    const screenLen = Math.hypot(clipped.x2 - clipped.x1, clipped.y2 - clipped.y1);
    if (screenLen < 5) return;

    lBigBangEras.append("line")
      .attr("x1", clipped.x1).attr("y1", clipped.y1)
      .attr("x2", clipped.x2).attr("y2", clipped.y2)
      .attr("stroke", "rgba(255,100,100,0.4)")
      .attr("stroke-width", 0.7)
      .attr("stroke-dasharray", "4 3");
  });

  // Draw labels between consecutive era lines.
  // Place each label along the mid-density line, offset past the Schwarzschild
  // intersection so the text stays fully above the Schwarzschild boundary.
  for (let i = 1; i < eras.length; i++) {
    if (!eras[i].label) continue;

    const prev = eras[i - 1];
    const curr = eras[i];

    // Skip label if the two intersection points are too close on screen
    const dist = Math.hypot(px(curr.logR_int) - px(prev.logR_int),
                            py(curr.logM_int) - py(prev.logM_int));
    if (dist < 30) continue;

    // Use mid-density between the two bounding era lines
    const midLogRho = (prev.logRho + curr.logRho) / 2;
    const midB = DENSITY_SPHERE_C + midLogRho;

    const pxPerUnitR = Math.abs(px(1) - px(0));
    const labelOffsetPx = 8;
    const dR = labelOffsetPx / (pxPerUnitR || 1);

    let labelLogR, labelLogM;

    // Special case: heat death label — position it just above the Observable
    // Universe object, horizontally centered between the two bounding density lines.
    if (curr.logRho < -100) {
      // Observable Universe is at logM ≈ 55.97; place label a bit above
      labelLogM = 57;
      // At this logM, find logR on each bounding density line:
      // logM = 3*logR + DENSITY_SPHERE_C + logRho  =>  logR = (logM - DENSITY_SPHERE_C - logRho) / 3
      const logR_prev = (labelLogM - DENSITY_SPHERE_C - prev.logRho) / 3;
      const logR_curr = (labelLogM - DENSITY_SPHERE_C - curr.logRho) / 3;
      labelLogR = (logR_prev + logR_curr) / 2;
    } else {
      // Find where mid-density line meets Schwarzschild
      const schwLogR = (-SCHWARZSCHILD_C - DENSITY_SPHERE_C - midLogRho) / 2;
      labelLogR = schwLogR + dR;
      labelLogM = 3 * labelLogR + midB;
    }

    const labelX = px(labelLogR);
    const labelY = py(labelLogM);
    const anchor = curr.logRho < -100 ? "middle" : "start";

    // Skip if label is far outside viewport
    if (labelX < -100 || labelX > cw + 100 || labelY < -100 || labelY > ch + 100) continue;

    // Dark outline for readability (matches energy band style)
    lBigBangEras.append("text")
      .attr("x", labelX).attr("y", labelY)
      .attr("text-anchor", anchor)
      .attr("font-family", "Inter, sans-serif")
      .attr("font-size", 12).attr("font-weight", 600)
      .attr("letter-spacing", "1px")
      .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.6)")
      .attr("stroke-width", 2).attr("stroke-linejoin", "round")
      .attr("opacity", 0.5)
      .attr("transform", `rotate(${densAngle},${labelX},${labelY})`)
      .text(curr.label);

    const txt = lBigBangEras.append("text")
      .attr("x", labelX).attr("y", labelY)
      .attr("text-anchor", anchor)
      .attr("font-family", "Inter, sans-serif")
      .attr("font-size", 12).attr("font-weight", 600)
      .attr("letter-spacing", "1px")
      .attr("fill", "rgba(255,130,130,0.8)")
      .attr("opacity", 0.5)
      .attr("transform", `rotate(${densAngle},${labelX},${labelY})`)
      .text(curr.label);
    if (curr.slug) {
      txt.style("cursor", "pointer")
        .on("click", (e) => { e.stopPropagation(); openInfoPanel(curr.slug, curr.label); setSidebarOpen(true); });
    }
  }
}

// =============================================================
// Draw: Region labels
// =============================================================

function screenAngle(slope) {
  // With equal px/unit, slope 1 → -45° (SVG y is inverted), slope -1 → 45°
  return Math.atan2(-slope, 1) * 180 / Math.PI;
}

function clampLineToChart(x1, y1, x2, y2) {
  const pts = [];
  [[0, "x"], [cw, "x"], [0, "y"], [ch, "y"]].forEach(([val, axis]) => {
    let t;
    if (axis === "x") t = (x2 - x1) !== 0 ? (val - x1) / (x2 - x1) : -1;
    else t = (y2 - y1) !== 0 ? (val - y1) / (y2 - y1) : -1;
    if (t >= 0 && t <= 1) {
      const cx = x1 + t * (x2 - x1), cy = y1 + t * (y2 - y1);
      if (cx >= -1 && cx <= cw + 1 && cy >= -1 && cy <= ch + 1) pts.push({ cx, cy, t });
    }
  });
  if (x1 >= 0 && x1 <= cw && y1 >= 0 && y1 <= ch) pts.push({ cx: x1, cy: y1, t: 0 });
  if (x2 >= 0 && x2 <= cw && y2 >= 0 && y2 <= ch) pts.push({ cx: x2, cy: y2, t: 1 });
  if (pts.length < 2) return null;
  pts.sort((a, b) => a.t - b.t);
  return { x1: pts[0].cx, y1: pts[0].cy, x2: pts[pts.length - 1].cx, y2: pts[pts.length - 1].cy };
}

function drawRegionLabels() {
  lRegLabel.selectAll("*").remove();
  const schwAng = screenAngle(1);
  const compAng = screenAngle(-1);

  const LABEL_SIZE = 22;
  const LABEL_SPACING = `${LABEL_SIZE * 0.25}px`;
  const OFFSET_PX = 28;
  const PAD = 60;

  // Triangle vertices in screen coords
  const plkX = px(PLANCK_LOG_R), plkY = py(PLANCK_LOG_M);
  const hubSchwX = px(HUBBLE_LOG_R), hubSchwY = py(schwarzschildM(HUBBLE_LOG_R));
  const hubCompX = px(HUBBLE_LOG_R), hubCompY = py(comptonM(HUBBLE_LOG_R));
  // Centroid — used to determine "outward" direction from each edge
  const centX = (plkX + hubSchwX + hubCompX) / 3;
  const centY = (plkY + hubSchwY + hubCompY) / 3;

  const boundaryLabels = [
    { text: "Schwarzschild Radius", angle: schwAng,
      x1: plkX, y1: plkY, x2: hubSchwX, y2: hubSchwY },
    { text: "Compton Limit", angle: compAng,
      x1: plkX, y1: plkY, x2: hubCompX, y2: hubCompY },
    { text: "Hubble Radius", angle: -90,
      x1: hubSchwX, y1: hubSchwY, x2: hubCompX, y2: hubCompY },
  ];

  boundaryLabels.forEach(l => {
    const seg = clampLineToChart(l.x1, l.y1, l.x2, l.y2);
    if (!seg) return;
    const len = Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1);
    if (len < 80) return;

    const edgeMx = (seg.x1 + seg.x2) / 2;
    const edgeMy = (seg.y1 + seg.y2) / 2;

    // Two perpendicular candidates
    const edx = seg.x2 - seg.x1, edy = seg.y2 - seg.y1;
    const n1x = -edy / len, n1y = edx / len;
    const n2x = edy / len, n2y = -edx / len;
    // Pick the one pointing AWAY from triangle centroid (= outside)
    const d1 = (edgeMx + n1x - centX) ** 2 + (edgeMy + n1y - centY) ** 2;
    const d2 = (edgeMx + n2x - centX) ** 2 + (edgeMy + n2y - centY) ** 2;
    const nx = d1 > d2 ? n1x : n2x;
    const ny = d1 > d2 ? n1y : n2y;

    let mx = edgeMx + nx * OFFSET_PX;
    let my = edgeMy + ny * OFFSET_PX;
    mx = Math.max(PAD, Math.min(cw - PAD, mx));
    my = Math.max(PAD, Math.min(ch - PAD, my));

    lRegLabel.append("text")
      .attr("x", mx).attr("y", my)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 800)
      .attr("font-size", LABEL_SIZE).attr("letter-spacing", LABEL_SPACING)
      .attr("fill", "white").attr("opacity", 0.10)
      .attr("transform", `rotate(${l.angle},${mx},${my})`)
      .text(l.text.toUpperCase());
  });
}

// =============================================================
// Draw: Objects (always-visible dots, smart labels)
// =============================================================

const DOT_MIN_DIST = 6;      // px — hide dot only when circles overlap
const CLUSTER_THRESHOLD = 26; // px — objects within this form a cluster; smaller = more individual/specific labels

let _lastProjected = [];

function drawObjects() {
  lObj.selectAll("*").remove();
  const d = vd();
  const pad = 5;

  // Project all objects to screen, sorted by priority (low z = important)
  const projected = OBJECTS
    .map(o => ({
      ...o,
      catKey: o.cat,
      sx: px(o.logR),
      sy: py(o.logM),
      cat: CATEGORIES[o.cat],
      color: SUBCAT_COLORS[o.subcat] || CATEGORIES[o.cat]?.color || "#fff",
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

  // --- Cluster detection: connected components within CLUSTER_THRESHOLD px ---
  const th2 = CLUSTER_THRESHOLD * CLUSTER_THRESHOLD;
  const clusters = [];
  const assigned = new Set();

  projected.forEach(o => {
    if (assigned.has(o)) return;
    const queue = [o];
    const visited = new Set([o]);
    while (queue.length) {
      const p = queue.shift();
      for (const q of projected) {
        if (assigned.has(q) || visited.has(q)) continue;
        const d2 = (p.sx - q.sx) ** 2 + (p.sy - q.sy) ** 2;
        if (d2 <= th2) { visited.add(q); queue.push(q); }
      }
    }
    if (visited.size >= 2) {
      const members = [...visited];
      members.forEach(p => assigned.add(p));

      const groups = [...new Set(members.map(p => p.group).filter(Boolean))];
      const hasSharedGroup = groups.length === 1 && members.every(p => p.group === groups[0]);

      if (visited.size > 2 || hasSharedGroup) {
        const cx = members.reduce((s, p) => s + p.sx, 0) / members.length;
        const cy = members.reduce((s, p) => s + p.sy, 0) / members.length;
        let label;
        if (hasSharedGroup) {
          label = groups[0];
        } else {
          const BH_SC = new Set(["primordial_bh", "stellar_bh", "supermassive_bh"]);
          const subcats = [...new Set(members.map(p => p.subcat).filter(Boolean))];
          // Exclude BH subcats — they get dedicated rotated labels along S line
          const nonBH = subcats.filter(s => !BH_SC.has(s));
          const catKey = Object.keys(CATEGORIES).find(k => CATEGORIES[k] === members[0].cat);
          if (nonBH.length === 1 && SUBCAT_LABELS[nonBH[0]]) {
            label = SUBCAT_LABELS[nonBH[0]];
          } else if (nonBH.length >= 2 && nonBH.length <= 4) {
            const parts = nonBH.map(s => SUBCAT_LABELS[s]).filter(Boolean);
            label = parts.length >= 2 ? parts.slice(0, -1).join(", ") + " & " + parts[parts.length - 1] : (CAT_DISPLAY[catKey] || catKey || "Objects");
          } else if (nonBH.length === 0 && subcats.length > 0) {
            // All subcats are BH — skip this cluster label (dedicated labels handle it)
            label = null;
          } else {
            label = CAT_DISPLAY[catKey] || catKey || "Objects";
          }
        }
        if (label !== null) {
          clusters.push({ members, cx, cy, label, cat: members[0].cat });
        } else {
          // BH-only cluster: still suppress individual labels but no cluster label
          members.forEach(o => { o._inCluster = true; o._clusterLabel = ""; });
        }
      }
    }
  });

  // Mark cluster members: no individual labels
  clusters.forEach(cl => {
    cl.members.forEach(o => {
      o._inCluster = true;
      o._clusterLabel = SUBCAT_LABELS[o.subcat] || cl.label;
    });
  });

  // --- Label placement: individual labels for non-clustered; category labels for clusters ---
  const placedLabels = [];
  const labelPositions = [
    { dx: 8, dy: 3.5, anchor: "start" },
    { dx: -8, dy: 3.5, anchor: "end" },
    { dx: 0, dy: -10, anchor: "middle" },
    { dx: 0, dy: 16, anchor: "middle" },
  ];

  // Place cluster labels first — never show the same label twice
  const usedLabels = new Set();
  clusters.forEach(cl => {
    const labelText = cl.label;
    if (usedLabels.has(labelText.toUpperCase())) {
      cl._showLabel = false;
      cl._labelPos = labelPositions[0];
      return;
    }
    const labelW = labelText.length * 5.5 + 12;
    const labelH = 12;

    for (const pos of labelPositions) {
      const lx = pos.anchor === "end" ? cl.cx + pos.dx - labelW
               : pos.anchor === "middle" ? cl.cx + pos.dx - labelW / 2
               : cl.cx + pos.dx;
      const ly = cl.cy + pos.dy - labelH;
      const rect = { x: lx, y: ly, w: labelW, h: labelH };

      const collides = placedLabels.some(p =>
        rect.x < p.x + p.w + 6 && rect.x + rect.w + 6 > p.x &&
        rect.y < p.y + p.h + 2 && rect.y + rect.h + 2 > p.y
      );

      if (!collides) {
        cl._labelPos = pos;
        cl._labelRect = rect;
        cl._showLabel = true;
        usedLabels.add(labelText.toUpperCase());
        placedLabels.push(rect);
        break;
      }
    }
    if (!cl._labelPos) cl._labelPos = labelPositions[0];
  });

  // Place individual labels for non-clustered objects
  projected.forEach(o => {
    if (!o._showDot) { o._showLabel = false; o._labelPos = null; return; }
    if (o._inCluster) { o._showLabel = false; o._labelPos = labelPositions[0]; return; }

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
      o._labelPos = labelPositions[0];
    }
  });

  // --- Category labels for spread-out groups: when zoomed in, show subcat label in center ---
  const CATEGORY_LABEL_FONT = 12;
  const CATEGORY_LABEL_OPACITY = 0.5;
  const CATEGORY_LABEL_MIN_CLEAR = 60; // px — min clearance from individual labels

  const bySubcat = new Map();
  projected.forEach(o => {
    if (!o._showDot || o._inCluster || !o.subcat) return;
    if (!bySubcat.has(o.subcat)) bySubcat.set(o.subcat, []);
    bySubcat.get(o.subcat).push(o);
  });

  const BH_SUBCATS = new Set(["primordial_bh", "stellar_bh", "supermassive_bh"]);
  const categoryLabels = [];
  bySubcat.forEach((members, subcat) => {
    if (BH_SUBCATS.has(subcat)) return; // BH subcats rendered separately along S line
    if (members.length < 2 || !SUBCAT_LABELS[subcat]) return;
    const labelText = SUBCAT_LABELS[subcat];
    if (usedLabels.has(labelText.toUpperCase())) return; // never show same label twice
    const cx = members.reduce((s, p) => s + p.sx, 0) / members.length;
    const cy = members.reduce((s, p) => s + p.sy, 0) / members.length;
    const labelW = labelText.length * (CATEGORY_LABEL_FONT * 0.55) + 20;
    const labelH = CATEGORY_LABEL_FONT + 4;
    const rect = { x: cx - labelW / 2, y: cy - labelH / 2, w: labelW, h: labelH };

    const collides = placedLabels.some(p =>
      rect.x < p.x + p.w + CATEGORY_LABEL_MIN_CLEAR &&
      rect.x + rect.w + CATEGORY_LABEL_MIN_CLEAR > p.x &&
      rect.y < p.y + p.h + 8 &&
      rect.y + rect.h + 8 > p.y
    );
    if (!collides) {
      usedLabels.add(labelText.toUpperCase());
      categoryLabels.push({ cx, cy, labelText, cat: members[0].cat });
    }
  });

  // --- Render cluster labels ---
  clusters.forEach(cl => {
    if (!cl._showLabel) return;
    const pos = cl._labelPos;
    const subcats = [...new Set(cl.members.map(p => p.subcat).filter(Boolean))];
    const labelText = subcats.length === 1 && SUBCAT_LABELS[subcats[0]]
      ? SUBCAT_LABELS[subcats[0]]
      : cl.label;
    const lx = cl.cx + pos.dx, ly = cl.cy + pos.dy;

    const g = lObj.append("g");
    g.append("text")
      .attr("x", lx).attr("y", ly)
      .attr("text-anchor", pos.anchor)
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", 10).attr("letter-spacing", "0.5px")
      .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.85)")
      .attr("stroke-width", 3).attr("stroke-linejoin", "round")
      .attr("class", "obj-label obj-cluster-label")
      .text(labelText);
    g.append("text")
      .attr("x", lx).attr("y", ly)
      .attr("text-anchor", pos.anchor)
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", 10).attr("letter-spacing", "0.5px")
      .attr("fill", cl.cat.color)
      .attr("class", "obj-label obj-cluster-label")
      .text(labelText);
  });

  // --- Render category labels (spread-out groups, center of mass) ---
  categoryLabels.forEach(cl => {
    const g = lObj.append("g").style("pointer-events", "none");
    g.append("text")
      .attr("x", cl.cx).attr("y", cl.cy)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", CATEGORY_LABEL_FONT).attr("letter-spacing", "1px")
      .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.6)")
      .attr("stroke-width", 2).attr("stroke-linejoin", "round")
      .attr("class", "obj-category-label")
      .attr("opacity", CATEGORY_LABEL_OPACITY)
      .text(cl.labelText.toUpperCase());
    g.append("text")
      .attr("x", cl.cx).attr("y", cl.cy)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", CATEGORY_LABEL_FONT).attr("letter-spacing", "1px")
      .attr("fill", cl.cat.color)
      .attr("class", "obj-category-label")
      .attr("opacity", CATEGORY_LABEL_OPACITY)
      .text(cl.labelText.toUpperCase());
  });

  // --- Render BH subcategory labels along the Schwarzschild line ---
  const BH_SUBCAT_POSITIONS = [
    { label: "Primordial Black Holes", logM: 25.0, slug: "primordial-black-hole" },
    { label: "Stellar Black Holes", logM: 35.5 },
    { label: "Supermassive Black Holes", logM: 41.5 },
  ];
  const schwAngBH = screenAngle(1);
  const bhColor = CATEGORIES.blackhole?.color || "#ff6e40";

  // Helper: render one rotated BH label just outside the S line
  // Offset by pixels perpendicular to the S line (outward from triangle)
  const schwAngRad = schwAngBH * Math.PI / 180;
  const perpX = Math.sin(schwAngRad);  // perpendicular outward (away from triangle interior)
  const perpY = -Math.cos(schwAngRad);
  const BH_PX_OFFSET = 12; // pixels outside S line (SCHWARZSCHILD RADIUS label is at ~28px)

  function renderBHLabel(text, logM, slug) {
    const sR = schwarzschildR(logM);
    const sx = px(sR) + perpX * BH_PX_OFFSET;
    const sy = py(logM) + perpY * BH_PX_OFFSET;
    if (sx < -100 || sx > cw + 100 || sy < -100 || sy > ch + 100) return;
    const g = lObj.append("g");
    if (slug) {
      g.style("cursor", "pointer")
       .on("click", () => openInfoPanel(slug, text));
    } else {
      g.style("pointer-events", "none");
    }
    g.append("text")
      .attr("x", sx).attr("y", sy)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif")
      .attr("font-size", CATEGORY_LABEL_FONT).attr("font-weight", 600)
      .attr("letter-spacing", "1px")
      .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.6)")
      .attr("stroke-width", 2).attr("stroke-linejoin", "round")
      .attr("opacity", CATEGORY_LABEL_OPACITY)
      .attr("transform", `rotate(${schwAngBH},${sx},${sy})`)
      .text(text);
    g.append("text")
      .attr("x", sx).attr("y", sy)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif")
      .attr("font-size", CATEGORY_LABEL_FONT).attr("font-weight", 600)
      .attr("letter-spacing", "1px")
      .attr("fill", bhColor)
      .attr("opacity", CATEGORY_LABEL_OPACITY)
      .attr("transform", `rotate(${schwAngBH},${sx},${sy})`)
      .text(text);
  }

  if (currentK > 1.5) {
    // Measure screen distances between labels along the S line
    const bhScreenPts = BH_SUBCAT_POSITIONS.map(bh => ({
      x: px(schwarzschildR(bh.logM)), y: py(bh.logM), label: bh.label, logM: bh.logM,
    }));
    const dist01 = Math.hypot(bhScreenPts[1].x - bhScreenPts[0].x, bhScreenPts[1].y - bhScreenPts[0].y);
    const dist12 = Math.hypot(bhScreenPts[2].x - bhScreenPts[1].x, bhScreenPts[2].y - bhScreenPts[1].y);
    const minDist = Math.min(dist01, dist12);

    if (minDist < 200) {
      // Labels would overlap — show single consolidated "BLACK HOLES"
      const midM = (BH_SUBCAT_POSITIONS[0].logM + BH_SUBCAT_POSITIONS[2].logM) / 2;
      renderBHLabel("BLACK HOLES", midM);
    } else {
      BH_SUBCAT_POSITIONS.forEach(bh => renderBHLabel(bh.label.toUpperCase(), bh.logM, bh.slug));
    }
  }

  // --- Render object dots and labels ---
  projected.forEach(o => {
    if (!o._showDot) return;

    const g = lObj.append("g").style("cursor", "pointer").attr("data-obj-slug", o.slug);

    // Hit area (invisible circle for dot clicks)
    g.append("circle").attr("cx", o.sx).attr("cy", o.sy)
      .attr("r", 14).attr("fill", "transparent");

    // Glow
    g.append("circle").attr("cx", o.sx).attr("cy", o.sy)
      .attr("class", "obj-glow")
      .attr("r", 6).attr("fill", o.color).attr("opacity", 0.1);

    // Dot
    g.append("circle").attr("cx", o.sx).attr("cy", o.sy)
      .attr("class", "obj-dot")
      .attr("r", 2.8).attr("fill", o.color).attr("opacity", 0.85);

    const pos = o._labelPos;

    // Shadow + Label (always present, but hidden if no space; on hover shows individual name)
    const shadow = g.append("text")
      .attr("x", o.sx + pos.dx).attr("y", o.sy + pos.dy)
      .attr("text-anchor", pos.anchor)
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", 10).attr("letter-spacing", "0.5px")
      .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.85)")
      .attr("stroke-width", 3).attr("stroke-linejoin", "round")
      .attr("class", "obj-label")
      .attr("display", o._showLabel ? null : "none")
      .text(o.name);

    const label = g.append("text")
      .attr("x", o.sx + pos.dx).attr("y", o.sy + pos.dy)
      .attr("text-anchor", pos.anchor)
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", 10).attr("letter-spacing", "0.5px")
      .attr("fill", o.color)
      .attr("class", "obj-label")
      .attr("display", o._showLabel ? null : "none")
      .text(o.name);

    g.on("click", function(e) {
      e.stopPropagation();
      e.preventDefault();
      _sidebarManuallyExpanded = false;
      openSidebar(o);
      setSidebarOpen(true);
    });
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
// Tooltip
// =============================================================

const tooltipEl = document.getElementById("tooltip");

function formatSci(logVal, unit) {
  const exp = Math.floor(logVal);
  const mantissa = Math.pow(10, logVal - exp);
  if (Math.abs(logVal) < 2) return `${Math.pow(10, logVal).toPrecision(3)} ${unit}`;
  return `${mantissa.toFixed(1)} × 10<sup>${exp}</sup> ${unit}`;
}

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

function friendlyEnergy(logM) {
  const logE_eV = logM + 32.75;
  if (logE_eV >= 9) return `${Math.pow(10, logE_eV - 9).toPrecision(3)} GeV`;
  if (logE_eV >= 6) return `${Math.pow(10, logE_eV - 6).toPrecision(3)} MeV`;
  if (logE_eV >= 3) return `${Math.pow(10, logE_eV - 3).toPrecision(3)} keV`;
  if (logE_eV >= 0) return `${Math.pow(10, logE_eV).toPrecision(3)} eV`;
  if (logE_eV >= -3) return `${Math.pow(10, logE_eV + 3).toPrecision(3)} meV`;
  return `${Math.pow(10, logE_eV + 6).toPrecision(3)} μeV`;
}

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

function friendlyDensity(logR, logM, logDensityOverride) {
  const logRho = logDensityOverride != null ? logDensityOverride : logM - 3 * logR - DENSITY_SPHERE_C;
  if (logRho > 14) return `${Math.pow(10, logRho - 14).toPrecision(2)} × nuclear density`;
  if (logRho > 3) return `${Math.pow(10, logRho - 3).toPrecision(2)} × 10³ kg/m³`;
  if (logRho >= 0) return `${Math.pow(10, logRho).toPrecision(2)} g/cm³`;
  if (logRho > -3) return `${Math.pow(10, logRho + 3).toPrecision(2)} mg/cm³`;
  return `10^${logRho.toFixed(0)} g/cm³`;
}

function showTooltip(event, obj, cat) {
  const photon = isPhoton(obj);
  const r = photon ? friendlyWavelength(obj.logR) : friendlyRadius(obj.logR);
  const rLabel = photon ? "wavelength" : "width";
  const mLabel = photon ? "energy" : "mass";
  const mVal = photon ? friendlyEnergy(obj.logM) : friendlyMass(obj.logM);
  const ttColor = obj.color || cat.color;
  tooltipEl.innerHTML = `
    <div class="tt-name" style="color:${ttColor}">${obj.name}</div>
    <div class="tt-row">${rLabel} ≈ ${r}</div>
    <div class="tt-row">${mLabel} ≈ ${mVal}</div>
    ${photon ? '' : `<div class="tt-row">density ≈ ${friendlyDensity(obj.logR, obj.logM, obj.logDensity)}</div>`}
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
// Axis hover tooltip
// =============================================================

const axisTooltipEl = document.getElementById("axis-tooltip");

// ── Unit tables for the axis tooltip picker ──

const MASS_HOVER_UNITS = [
  { logOff: -32.75, name: "Electron Volts/c²",  sys: "particle" },
  { logOff: -29.75, name: "Kilo Electron Volts/c²", sys: "particle" },
  { logOff: -26.75, name: "Mega Electron Volts/c²", sys: "particle" },
  { logOff: -23.75, name: "Giga Electron Volts/c²", sys: "particle" },
  { logOff: -20.75, name: "Tera Electron Volts/c²", sys: "particle" },
  { logOff: -15,    name: "Picograms",   sys: "metric" },
  { logOff: -12,    name: "Nanograms",   sys: "metric" },
  { logOff: -9,     name: "Micrograms",  sys: "metric" },
  { logOff: -6,     name: "Milligrams",  sys: "metric" },
  { logOff: 0,      name: "Grams",       sys: "metric" },
  { logOff: 3,      name: "Kilograms",   sys: "metric" },
  { logOff: 6,      name: "Tonnes",      sys: "metric" },
  { logOff: 9,      name: "Kilotonnes",  sys: "metric" },
  { logOff: 12,     name: "Megatonnes",  sys: "metric" },
  { logOff: 15,     name: "Gigatonnes",  sys: "metric" },
  { logOff: 1.45,   name: "Ounces",      sys: "imperial" },
  { logOff: 2.66,   name: "Pounds",      sys: "imperial" },
  { logOff: 5.95,   name: "US Tons",     sys: "imperial" },
  { logOff: 27.78,  name: "Earth Masses",   sys: "astro" },
  { logOff: 30.28,  name: "Jupiter Masses", sys: "astro" },
  { logOff: 33.30,  name: "Solar Masses",   sys: "astro" },
];

const RADIUS_HOVER_UNITS = [
  { logOff: -13,    name: "Femtometers",    sys: "metric" },
  { logOff: -10,    name: "Picometers",     sys: "metric" },
  { logOff: -8,     name: "Angstroms",      sys: "metric" },
  { logOff: -7,     name: "Nanometers",     sys: "metric" },
  { logOff: -4,     name: "Micrometers",    sys: "metric" },
  { logOff: -1,     name: "Millimeters",    sys: "metric" },
  { logOff: 0,      name: "Centimeters",    sys: "metric" },
  { logOff: 2,      name: "Meters",         sys: "metric" },
  { logOff: 5,      name: "Kilometers",     sys: "metric" },
  { logOff: 0.405,  name: "Inches",         sys: "imperial" },
  { logOff: 1.484,  name: "Feet",           sys: "imperial" },
  { logOff: 5.207,  name: "Miles",          sys: "imperial" },
  { logOff: 13.175, name: "Astronomical Units", sys: "astro" },
  { logOff: 17.976, name: "Light Years",    sys: "astro" },
  { logOff: 18.489, name: "Parsecs",        sys: "astro" },
  { logOff: 20.976, name: "Thousand Light Years", sys: "astro" },
  { logOff: 24.489, name: "Megaparsecs",    sys: "astro" },
];

const ENERGY_HOVER_UNITS = [
  { logOff: -38.75, name: "Micro Electron Volts",  sys: "energy" },
  { logOff: -35.75, name: "Milli Electron Volts",  sys: "energy" },
  { logOff: -32.75, name: "Electron Volts",        sys: "energy" },
  { logOff: -29.75, name: "Kilo Electron Volts",   sys: "energy" },
  { logOff: -26.75, name: "Mega Electron Volts",   sys: "energy" },
  { logOff: -23.75, name: "Giga Electron Volts",   sys: "energy" },
  { logOff: -20.75, name: "Tera Electron Volts",   sys: "energy" },
  { logOff: -36.81, name: "Kelvin",                sys: "temperature" },
];

// Density→cosmic-time lookup (piecewise linear interpolation in log-log)
const DENSITY_TIME_TABLE = [
  { logRho: 93.7,  logT: -43 },
  { logRho: 76,    logT: -36 },
  { logRho: 25,    logT: -11 },
  { logRho: 14.4,  logT: -6 },
  { logRho: 4,     logT: 0 },
  { logRho: -21,   logT: 13 },
  { logRho: -29.5, logT: 17.64 },  // now ≈ 4.35×10¹⁷ s
];

// ── Picker: choose best human-readable unit ──

function pickBestUnit(logVal, table, preferSys) {
  let best = null, bestScore = Infinity;
  for (const u of table) {
    const mLog = logVal - u.logOff;
    if (mLog < -2 || mLog > 8) continue;  // mantissa 0.01 to ~100M
    const score = Math.abs(mLog) + (mLog < 0 ? 0.3 : 0) // slight preference for mantissa ≥ 1
      + (preferSys && u.sys === preferSys ? -0.5 : 0);
    if (score < bestScore) { bestScore = score; best = u; }
  }
  if (!best) best = table.reduce((a, b) =>
    Math.abs(logVal - a.logOff) < Math.abs(logVal - b.logOff) ? a : b);
  return { value: Math.pow(10, logVal - best.logOff), unit: best.name, sys: best.sys };
}

function pickAltUnit(logVal, table, primaryUnit) {
  // Try contrasting system first
  const altMap = { metric: "imperial", imperial: "metric", particle: "metric",
    astro: "metric", energy: "temperature", temperature: "energy" };
  const altSys = altMap[primaryUnit.sys] || null;
  const filtered = table.filter(u => u.sys !== primaryUnit.sys);
  if (filtered.length) {
    const alt = pickBestUnit(logVal, filtered, altSys);
    const mLog = Math.abs(Math.log10(Math.abs(alt.value) || 1));
    if (mLog < 6) return alt; // mantissa is reasonable
  }
  // Fallback: pick any unit that isn't the exact same one
  const any = table.filter(u => u.name !== primaryUnit.unit);
  return pickBestUnit(logVal, any, null);
}

// ── Formatting helpers ──

function formatHumanNum(value, unit) {
  const a = Math.abs(value);
  if (a === 0) return `0 ${unit}`;
  if (a >= 1e15 || a < 0.001) {
    // Use HTML sup for extreme values
    const exp = Math.floor(Math.log10(a));
    const mant = value / Math.pow(10, exp);
    return `${mant.toFixed(1)}×10<sup>${exp}</sup> ${unit}`;
  }
  if (a < 0.01) return `${value.toPrecision(2)} ${unit}`;
  if (a < 10)   return `${value.toPrecision(3)} ${unit}`;
  if (a < 1000) return `${value.toPrecision(4)} ${unit}`;
  if (a < 1e6)  return `${Number(value.toPrecision(4)).toLocaleString()} ${unit}`;
  if (a < 1e9)  return `${(value / 1e6).toPrecision(3)} million ${unit}`;
  if (a < 1e12) return `${(value / 1e9).toPrecision(3)} billion ${unit}`;
  return `${(value / 1e12).toPrecision(3)} trillion ${unit}`;
}

function formatLogSuper(logVal, unit) {
  const s = logVal.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return `10<sup>${s}</sup> ${unit}`;
}

// Density → cosmic time via interpolation
function densityToLogTime(logRho) {
  const t = DENSITY_TIME_TABLE;
  if (logRho >= t[0].logRho) return t[0].logT;
  if (logRho <= t[t.length - 1].logRho) return t[t.length - 1].logT;
  for (let i = 0; i < t.length - 1; i++) {
    if (logRho <= t[i].logRho && logRho >= t[i + 1].logRho) {
      const frac = (logRho - t[i].logRho) / (t[i + 1].logRho - t[i].logRho);
      return t[i].logT + frac * (t[i + 1].logT - t[i].logT);
    }
  }
  return 0;
}

function friendlyTime(logT) {
  // logT is log₁₀(seconds)
  const logYr = logT - 7.494; // 1 year ≈ 3.156×10⁷ s → log₁₀ ≈ 7.494

  // Turn a small fractional value into natural language: 3.1e-19 → "3.1 ten-billionths of a"
  function humanFrac(val, unitSingular) {
    const a = Math.abs(val);
    if (a >= 0.5) return `${Number(val.toPrecision(2))} ${unitSingular}s`;
    const fracs = [
      [1e-3,  "Thousandth"],  [1e-6,  "Millionth"],  [1e-9,  "Billionth"],
      [1e-12, "Trillionth"], [1e-15, "Quadrillionth"], [1e-18, "Quintillionth"],
      [1e-21, "Sextillionth"], [1e-24, "Septillionth"],
    ];
    for (const [thresh, word] of fracs) {
      const scaled = val / thresh;
      if (Math.abs(scaled) >= 0.5) {
        const n = Number(scaled.toPrecision(2));
        const pl = Math.abs(n) === 1 ? "" : "s";
        return `${n} ${word}${pl} of a ${unitSingular}`;
      }
    }
    // fallback for extremely small values
    const exp = Math.floor(Math.log10(a));
    const mant = val / Math.pow(10, exp);
    return `${mant.toFixed(1)}×10<sup>${exp}</sup> ${unitSingular}s`;
  }

  // Planck time ≈ 5.4×10⁻⁴⁴ s → log₁₀ ≈ -43.27
  if (logT < -36) {
    const logPlanck = -43.27;
    const mult = logT - logPlanck;
    if (mult < 15) {
      const v = Math.pow(10, mult);
      if (v < 1e3) return `${Number(v.toPrecision(2))} Planck Times`;
      if (v < 1e6) return `${Number((v/1e3).toPrecision(2))} Thousand Planck Times`;
      if (v < 1e9) return `${Number((v/1e6).toPrecision(2))} Million Planck Times`;
      if (v < 1e12) return `${Number((v/1e9).toPrecision(2))} Billion Planck Times`;
      return `${Number((v/1e12).toPrecision(2))} Trillion Planck Times`;
    }
    return formatLogSuper(mult, "× Planck Time");
  }
  // Small times: use fractional natural language
  if (logT < -12) { return humanFrac(Math.pow(10, logT + 12), "Picosecond"); }
  if (logT < -9)  { return humanFrac(Math.pow(10, logT + 9),  "Nanosecond"); }
  if (logT < -6)  { return humanFrac(Math.pow(10, logT + 6),  "Microsecond"); }
  if (logT < 0)   { return humanFrac(Math.pow(10, logT + 3),  "Millisecond"); }
  if (logT < 2)   return `${Number(Math.pow(10, logT).toPrecision(2))} Seconds`;
  if (logT < 3.56) return `${Number(Math.pow(10, logT - 1.778).toPrecision(2))} Minutes`;
  if (logT < 4.94) return `${Number(Math.pow(10, logT - 3.556).toPrecision(2))} Hours`;
  if (logT < 6.45) return `${Number(Math.pow(10, logT - 4.937).toPrecision(2))} Days`;
  if (logYr < 3)   return `${Number(Math.pow(10, logYr).toPrecision(3))} Years`;
  if (logYr < 6)   return `${Number(Math.pow(10, logYr - 3).toPrecision(3))} Thousand Years`;
  if (logYr < 9)   return `${Number(Math.pow(10, logYr - 6).toPrecision(3))} Million Years`;
  return `${Number(Math.pow(10, logYr - 9).toPrecision(3))} Billion Years`;
}

// ── Axis region detection ──

function detectAxisRegion(clientX, clientY) {
  const cx = clientX - margin.left;
  const cy = clientY - margin.top;
  const inX = cx >= 0 && cx <= cw;
  const inY = cy >= 0 && cy <= ch;

  if (inX && cy > ch && cy <= ch + margin.bottom)
    return { axis: "bottom", chartX: cx };
  if (inX && cy < 0 && cy >= -margin.top)
    return { axis: "top", chartX: cx };
  if (inY && cx > cw && cx <= cw + margin.right)
    return { axis: "right", chartY: cy };
  if (inY && cx < 0 && cx >= -margin.left)
    return { axis: "left", chartY: cy };
  return null;
}

// ── Tooltip content builders ──

// Physical bounds for clamping (in CGS log units)
const AX_MIN_LOGR = PLANCK_LOG_R;   // ≈ -32.64 cm (Planck length)
const AX_MAX_LOGR = HUBBLE_LOG_R;   // 28.14 cm (Hubble radius)
const AX_MIN_LOGM = -67;            // lightest meaningful mass
const AX_MAX_LOGM = 56;             // ~observable universe mass

function buildAxisContent(region) {
  const d = vd();
  switch (region.axis) {
    case "right": {
      const logM = yS.invert(region.chartY);
      if (logM < AX_MIN_LOGM || logM > AX_MAX_LOGM) return null;
      const logKg = logM - 3;
      const primary = pickBestUnit(logM, MASS_HOVER_UNITS, "metric");
      const alt = pickAltUnit(logM, MASS_HOVER_UNITS, primary);
      return {
        line1: formatLogSuper(logKg, "kg"),
        line2: formatHumanNum(primary.value, primary.unit),
        line3: formatHumanNum(alt.value, alt.unit),
      };
    }
    case "left": {
      const logM = yS.invert(region.chartY);
      if (logM < AX_MIN_LOGM || logM > AX_MAX_LOGM) return null;
      const logEv = logM + 32.75;
      const logK = logM + 36.81;
      const primary = pickBestUnit(logM, ENERGY_HOVER_UNITS, "energy");
      // Always show temperature as alt for energy axis
      const tempStr = logK >= 15 ? formatLogSuper(logK, "Kelvin")
        : logK >= 9 ? `${(Math.pow(10, logK - 9)).toPrecision(3)} billion Kelvin`
        : logK >= 6 ? `${(Math.pow(10, logK - 6)).toPrecision(3)} million Kelvin`
        : logK >= 3 ? `${(Math.pow(10, logK - 3)).toPrecision(3)} thousand Kelvin`
        : logK >= 0 ? `${Math.pow(10, logK).toPrecision(3)} Kelvin`
        : formatLogSuper(logK, "Kelvin");
      return {
        line1: formatLogSuper(logEv, "eV"),
        line2: formatHumanNum(primary.value, primary.unit),
        line3: tempStr,
      };
    }
    case "bottom": {
      const logR = xS.invert(region.chartX);
      if (logR < AX_MIN_LOGR || logR > AX_MAX_LOGR) return null;
      const logM = logR - 2; // cm → m
      const primary = pickBestUnit(logR, RADIUS_HOVER_UNITS, "metric");
      const alt = pickAltUnit(logR, RADIUS_HOVER_UNITS, primary);
      return {
        line1: formatLogSuper(logM, "m"),
        line2: formatHumanNum(primary.value, primary.unit),
        line3: formatHumanNum(alt.value, alt.unit),
      };
    }
    case "top": {
      const logR = xS.invert(region.chartX);
      const logRho = d.y1 - 3 * logR - DENSITY_SPHERE_C;
      const logT = densityToLogTime(logRho);
      const logRho_kgm3 = logRho + 3; // g/cm³ → kg/m³
      // Friendly density string using relatable comparisons
      let densStr;
      // logRho is in g/cm³; water=0, air≈-3.1, nuclear≈14.4
      // Helper to format a multiplier with words
      function fmtMult(logDiff, ref) {
        if (logDiff > 15) return formatLogSuper(logDiff, `× ${ref}`);
        const v = Math.pow(10, logDiff);
        if (v >= 1e12) return `${Number((v/1e12).toPrecision(2))} Trillion× ${ref}`;
        if (v >= 1e9) return `${Number((v/1e9).toPrecision(2))} Billion× ${ref}`;
        if (v >= 1e6) return `${Number((v/1e6).toPrecision(2))} Million× ${ref}`;
        if (v >= 1e3) return `${Number((v/1e3).toPrecision(2))} Thousand× ${ref}`;
        return `${Number(v.toPrecision(2))}× ${ref}`;
      }
      function fmtFrac(logDiff, ref) {
        if (logDiff < -15) return formatLogSuper(logDiff, `× ${ref}`);
        const v = Math.pow(10, logDiff);
        if (v >= 0.5) return `${Number(v.toPrecision(2))}× ${ref}`;
        if (v >= 1e-3) return `${Number((v*1e3).toPrecision(2))} Thousandths of ${ref}`;
        if (v >= 1e-6) return `${Number((v*1e6).toPrecision(2))} Millionths of ${ref}`;
        if (v >= 1e-9) return `${Number((v*1e9).toPrecision(2))} Billionths of ${ref}`;
        if (v >= 1e-12) return `${Number((v*1e12).toPrecision(2))} Trillionths of ${ref}`;
        return formatLogSuper(logDiff, `× ${ref}`);
      }
      if (logRho > 14) densStr = fmtMult(logRho - 14, "Nuclear Density");
      else if (logRho > 0) densStr = fmtMult(logRho, "Water Density");
      else if (logRho > -3.1) densStr = fmtMult(logRho + 3.1, "Air Density");
      else if (logRho > -20) densStr = fmtFrac(logRho + 3.1, "Air Density");
      else if (logRho > -30) densStr = fmtFrac(logRho + 28, "Interstellar Medium");
      else densStr = formatLogSuper(logRho_kgm3, "kg/m³");
      return {
        line1: `${formatLogSuper(logT, "s")}  |  ${formatLogSuper(logRho_kgm3, "kg/m³")}`,
        line2: `Age of the Universe: ${friendlyTime(logT)}`,
        line3: `Average Density: ${densStr}`,
      };
    }
  }
}

// ── Positioning (anchored to axis edge) ──

function positionAxisTooltip(region) {
  const el = axisTooltipEl;
  const tw = el.offsetWidth || 160;
  const th = el.offsetHeight || 50;
  let left, top;

  switch (region.axis) {
    case "right":
      left = margin.left + cw - tw - 4;
      top = margin.top + region.chartY - th / 2;
      break;
    case "left":
      left = margin.left + 4;
      top = margin.top + region.chartY - th / 2;
      break;
    case "bottom":
      left = margin.left + region.chartX - tw / 2;
      top = margin.top + ch - th - 4;
      break;
    case "top":
      left = margin.left + region.chartX - tw / 2;
      top = margin.top + 4;
      break;
  }
  left = Math.max(4, Math.min(left, W - tw - 4));
  top = Math.max(4, Math.min(top, H - th - 4));
  el.style.left = left + "px";
  el.style.top = top + "px";
}

function hideAxisTooltip() {
  axisTooltipEl.className = "";
}

// ── Event binding ──

svg.on("mousemove.axisTooltip", (e) => {
  if (_zooming) { hideAxisTooltip(); return; }
  const region = detectAxisRegion(e.clientX, e.clientY);
  if (!region) { hideAxisTooltip(); return; }
  const content = buildAxisContent(region);
  if (!content) { hideAxisTooltip(); return; }
  hideTooltip();  // hide object tooltip when on axis
  const arrowChar = { right: "▶", left: "◀", bottom: "▼", top: "▲" }[region.axis];
  axisTooltipEl.innerHTML =
    `<div class="at-arrow">${arrowChar}</div>` +
    `<div class="at-line1">${content.line1}</div>` +
    `<div class="at-line2">${content.line2}</div>` +
    `<div class="at-line3">${content.line3}</div>`;
  axisTooltipEl.className = `visible at-${region.axis}`;
  positionAxisTooltip(region);
});

svg.on("mouseleave.axisTooltip", () => hideAxisTooltip());

// =============================================================
// Sidebar
// =============================================================

const sidebarEl = document.getElementById("sidebar");
const sidebarIntro = document.getElementById("sidebar-intro");
const sidebarObject = document.getElementById("sidebar-object");
const sbName = document.getElementById("sb-name");
const sbDot = document.getElementById("sb-dot");
const sbCategory = document.getElementById("sb-category");
const sbStats = document.getElementById("sb-stats");
const sbDesc = document.getElementById("sb-desc");
const sbLinks = document.getElementById("sb-links");
const sbImage = document.getElementById("sb-image");

// Populate intro
function simpleMarkdown(md) {
  const { meta, body } = parseFrontmatter(md);

  let html = body
    // KaTeX: display math $$...$$ → centered block
    .replace(/\$\$(.+?)\$\$/gs, (_, tex) => {
      try { return `<div class="katex-display">${katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false })}</div>`; }
      catch { return tex; }
    })
    // KaTeX: inline math $...$
    .replace(/\$(.+?)\$/g, (_, tex) => {
      try { return katex.renderToString(tex.trim(), { throwOnError: false }); }
      catch { return tex; }
    })
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\[\[>@([\d.,-]+):([^|\]]+?)(?:\|([^\]]+?))?\]\]/g, (_, coords, slug, label) => {
      const display = (label || slug).trim();
      return `<a class="internal-nav" data-slug="${slug.trim()}" data-name="${display}" data-zoom="${coords.trim()}">${display} →</a>`;
    })
    .replace(/\[\[>([^|\]]+?)(?:\|([^\]]+?))?\]\]/g, (_, name, label) => {
      const slug = nameToSlug(name.trim());
      const display = (label || name).trim();
      return `<a class="internal-nav" data-slug="${slug}" data-name="${name.trim()}">${display} →</a>`;
    })
    .replace(/\[\[([^|\]]+?)(?:\|([^\]]+?))?\]\]/g, (_, name, label) => {
      const slug = nameToSlug(name.trim());
      const display = (label || name).trim();
      return `<a class="internal-link" data-slug="${slug}" data-name="${name.trim()}">${display}</a>`;
    })
    .replace(/<div/g, "<div").replace(/<\/div>/g, "</div>")
    .split(/\n\n+/)
    .map(p => {
      const t = p.trim();
      if (t.startsWith("<div") || t.startsWith("</div>") || t.startsWith("<p ") || t.startsWith("<p>")) return t;
      return `<p>${t}</p>`;
    })
    .join("\n");

  if (meta.navigate && meta.button) {
    const nav = meta.navigate.trim();
    const label = meta.button.trim();
    if (meta.zoom) {
      const coords = meta.zoom.trim();
      html += `\n<a class="internal-nav" data-slug="${nav}" data-name="${label}" data-zoom="${coords}">${label} →</a>`;
    } else {
      const slug = nameToSlug(nav);
      html += `\n<a class="internal-nav" data-slug="${slug}" data-name="${nav}">${label} →</a>`;
    }
  }

  return html;
}
document.getElementById("intro-body").innerHTML = simpleMarkdown(introRaw);

function navigateToObject(slug, name) {
  const obj = OBJECTS.find(o => o.slug === slug);
  if (obj) {
    _sidebarManuallyExpanded = false;
    const targetK = Math.max(currentK, 12);
    const tx = cw / 2 - xBase(obj.logR) * targetK;
    const ty = ch / 2 - yBase(obj.logM) * targetK;
    svg.transition().duration(700).ease(d3.easeCubicInOut)
      .call(zoomBehavior.transform,
        d3.zoomIdentity.translate(tx, ty).scale(targetK));
    openSidebar(obj);
    setSidebarOpen(true);
  } else if (name) {
    openInfoPanel(slug, name);
    setSidebarOpen(true);
  }
}

sidebarEl.addEventListener("click", (e) => {
  const link = e.target.closest(".internal-link, .internal-nav");
  if (!link) return;
  e.preventDefault();
  const slug = link.dataset.slug;
  const name = link.dataset.name;
  const zoom = link.dataset.zoom;
  if (zoom) {
    const [logR, logM, k] = zoom.split(",").map(Number);
    const tx = cw / 2 - xBase(logR) * k;
    const ty = ch / 2 - yBase(logM) * k;
    svg.transition().duration(700).ease(d3.easeCubicInOut)
      .call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
    openInfoPanel(slug, name);
    setSidebarOpen(true);
  } else {
    navigateToObject(slug, name);
  }
});

function showIntro() {
  sidebarIntro.style.display = "";
  sidebarObject.style.display = "none";
  setSidebarOpen(true);
}
showIntro();

function setSidebarOpen(open) {
  const changed = _isSidebarOpen !== open;
  _isSidebarOpen = open;
  if (open) {
    sidebarEl.classList.add("open");
    document.body.classList.add("sidebar-open");
  } else {
    sidebarEl.classList.remove("open");
    document.body.classList.remove("sidebar-open");
  }
  if (changed) relayout();
}

function relayout() {
  if (!_booted) return;

  const centerLogR = xS.invert(cw / 2);
  const centerLogM = yS.invert(ch / 2);
  const savedK = currentK;

  measure();

  defs.select("#clip rect").attr("width", cw).attr("height", ch);
  clip.select("rect").attr("width", cw).attr("height", ch);
  chart.attr("transform", `translate(${margin.left},${margin.top})`);
  chart.select("rect:last-of-type").attr("width", cw).attr("height", ch);

  xBase.domain([viewXMin, viewXMax]).range([0, cw]);
  yBase.domain([viewYMin, viewYMax]).range([ch, 0]);

  const tx = cw / 2 - xBase(centerLogR) * savedK;
  const ty = ch / 2 - yBase(centerLogM) * savedK;
  svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(savedK));

  miniSvg.attr("transform",
    `translate(${W - MINIMAP_SIZE - MINIMAP_PAD - margin.right}, ${margin.top + MINIMAP_PAD})`);
  resizeCloudCanvas();
}

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
let _sidebarManuallyExpanded = false;
let hashTimer = null;

function openInfoPanel(slug, name) {
  openSidebar({ slug, name, isLabel: true });
}

function openSidebar(obj) {
  selectedObj = obj;
  sidebarIntro.style.display = "none";
  sidebarObject.style.display = "";

  if (obj.isLabel) {
    sidebarObject.classList.add("info-panel");
    sbName.textContent = obj.name;
    sbName.style.color = "rgba(255,255,255,0.9)";
    sbDot.style.background = "rgba(255,100,100,0.5)";
    sbDot.style.color = "rgba(255,100,100,0.5)";
    sbCategory.textContent = "Unit reference";
    sbStats.innerHTML = "";
    sbDesc.innerHTML = simpleMarkdown(DESC_BY_SLUG[obj.slug] || "");
    const wiki = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(obj.name)}`;
    sbLinks.innerHTML = `
      <a href="${wiki}" target="_blank" rel="noopener">
        <span class="link-icon">W</span>
        <span class="link-label">Wikipedia</span>
        <span class="link-sub">↗</span>
      </a>
    `;
    setSidebarOpen(true);
    return;
  }

  sidebarObject.classList.remove("info-panel");
  const catKey = obj.catKey || obj.cat;
  const cat = typeof obj.cat === "string" ? CATEGORIES[obj.cat] : obj.cat;

  const objColor = obj.color || cat.color;
  sbName.textContent = obj.name;
  sbName.style.color = objColor;
  sbDot.style.background = objColor;
  sbDot.style.color = objColor;
  sbCategory.textContent = catKey;

  // Display object image or placeholder
  const slug = obj.slug || nameToSlug(obj.name);
  const imgSrc = IMG_BY_SLUG[slug];
  const imgMeta = imageManifest[slug];
  if (imgSrc) {
    sbImage.innerHTML = "";
    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = obj.name;
    sbImage.appendChild(img);
    if (imgMeta) {
      const credit = document.createElement("a");
      credit.className = "sb-image-credit";
      credit.href = imgMeta.source;
      credit.target = "_blank";
      credit.rel = "noopener";
      credit.textContent = `${imgMeta.credit} · ${imgMeta.license}`;
      sbImage.appendChild(credit);
    }
  } else {
    sbImage.innerHTML = `
      <svg viewBox="0 0 48 48" width="48" height="48" opacity="0.15">
        <rect x="4" y="8" width="40" height="32" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="16" cy="20" r="4" fill="currentColor"/>
        <polyline points="4,36 16,26 24,32 32,22 44,34" fill="none" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span>Image coming soon</span>`;
  }

  const photon = isPhoton(obj);
  const c = catKey;
  const isEveryday = c === "macro" || c === "micro";
  const isPlanet = c === "planet";
  const isStar = c === "star";
  const isRemnant = c === "remnant";
  const isBH = c === "blackhole";
  const isParticle = c === "particle" || c === "composite" || c === "atomic";
  const isCosmicStructure = c === "galaxy" || c === "largescale";

  const r = photon ? friendlyWavelength(obj.logR) : friendlyRadius(obj.logR);
  const m = photon ? friendlyEnergy(obj.logM) : friendlyMass(obj.logM);
  const rho = friendlyDensity(obj.logR, obj.logM, obj.logDensity);

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
    const sizeLabel = isPlanet || isStar || isRemnant ? "Diameter" : "Size";
    rows = `
      <tr><td>${sizeLabel}</td><td>${r}</td></tr>
      <tr><td>Mass</td><td>${m}</td></tr>
      <tr><td>Density</td><td>${rho}</td></tr>
      <tr><td>Zone</td><td><span class="sb-zone ${zoneClass}">${zone}</span></td></tr>
      <tr><td colspan="2" class="sb-log-note">${logNote}</td></tr>`;
  }

  sbStats.innerHTML = `<table>${rows}</table>`;

  sbDesc.innerHTML = simpleMarkdown(DESC_BY_SLUG[obj.slug] || "");

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

  setSidebarOpen(true);
  if (_booted) { clearTimeout(hashTimer); saveHash(); }
}

function closeSidebar() {
  selectedObj = null;
  showIntro();
  if (_booted) { clearTimeout(hashTimer); saveHash(); }
}

document.getElementById("sidebar-close").addEventListener("click", () => {
  setSidebarOpen(false);
});

document.getElementById("sidebar-expand").addEventListener("click", () => {
  _sidebarManuallyExpanded = true;
  setSidebarOpen(true);
});

// Click detection: use a document-level click listener registered BEFORE D3 zoom
// D3 zoom suppresses clicks via a capture-phase handler added dynamically,
// so we register ours in capture phase first, tracking mousedown position.
let _clickDown = null;

document.addEventListener("pointerdown", (e) => {
  const chartEl = document.getElementById("chart");
  if (!chartEl?.contains(e.target)) return;
  // If pointerdown is on an object or axis label, stop zoom from capturing (so click can fire)
  if (e.target.closest?.("[data-obj-slug], .axis-unit-link")) {
    e.stopImmediatePropagation();
  }
  _clickDown = { x: e.clientX, y: e.clientY, t: Date.now() };
}, true);

document.addEventListener("click", (e) => {
  if (!_clickDown) return;
  const ddx = e.clientX - _clickDown.x, ddy = e.clientY - _clickDown.y;
  const dist2 = ddx * ddx + ddy * ddy;
  const elapsed = Date.now() - _clickDown.t;
  _clickDown = null;
  if (dist2 > 36 || elapsed > 600) return;

  // Use d3.pointer to get coordinates in chart space (accounts for zoom transform)
  const [mx, my] = d3.pointer(e, chart.node());

  // Click on object group (dot or label) — check before coordinate hit-test
  const objGroup = e.target.closest?.("[data-obj-slug]");
  if (objGroup) {
    const slug = objGroup.getAttribute("data-obj-slug");
    const obj = _lastProjected.find(o => o.slug === slug);
    if (obj) {
      e.stopImmediatePropagation();
      openSidebar(obj);
      return;
    }
  }

  const HIT_RADIUS = 18;
  let closest = null, closestDist = HIT_RADIUS * HIT_RADIUS;
  for (const o of _lastProjected) {
    const dx = o.sx - mx, dy = o.sy - my;
    const d2 = dx * dx + dy * dy;
    if (d2 < closestDist) { closest = o; closestDist = d2; }
  }

  const labelEl = e.target.closest?.(".axis-unit-link");
  if (labelEl) {
    const slug = labelEl.getAttribute("data-slug");
    const name = labelEl.getAttribute("data-name");
    if (slug && name) {
      e.stopImmediatePropagation();
      _sidebarManuallyExpanded = false;
      openInfoPanel(slug, name);
      setSidebarOpen(true);
      return;
    }
  }

  if (closest) {
    e.stopImmediatePropagation();
    _sidebarManuallyExpanded = false;
    openSidebar(closest);
    setSidebarOpen(true);
  } else {
    // Click on empty space — deselect object and remove highlight
    selectedObj = null;
    drawHighlight();
    if (sidebarEl.classList.contains("open")) {
      if (_sidebarManuallyExpanded) {
        closeSidebar(); // revert to intro, stay expanded
      } else {
        setSidebarOpen(false); // auto-collapse
      }
    }
  }
}, true);

// =============================================================
// Draw: Selection highlight
// =============================================================

function drawHighlight() {
  lHighlight.selectAll("*").remove();
  if (!selectedObj || selectedObj.isLabel) return;
  const sx = px(selectedObj.logR), sy = py(selectedObj.logM);
  if (sx < -50 || sx > cw + 50 || sy < -50 || sy > ch + 50) return;

  const catKey = selectedObj.catKey || selectedObj.cat;
  const catObj = typeof catKey === "string" ? CATEGORIES[catKey] : catKey;
  const color = SUBCAT_COLORS[selectedObj.subcat] || catObj?.color || "#fff";

  lHighlight.append("circle")
    .attr("cx", sx).attr("cy", sy).attr("r", 18)
    .attr("fill", "none").attr("stroke", color)
    .attr("stroke-width", 1.5).attr("opacity", 0.5)
    .attr("stroke-dasharray", "4 3");

  lHighlight.append("circle")
    .attr("cx", sx).attr("cy", sy).attr("r", 10)
    .attr("fill", color).attr("opacity", 0.08);
}

// =============================================================
// Draw: Axes
// =============================================================

function drawAxes() {
  [axB, axT, axL, axR].forEach(g => g.selectAll("*").remove());
  const d = vd();
  const ppu = cw / (d.x1 - d.x0);
  const LOG_EV_OFFSET = 32.75;

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
  const densityAngle = screenAngle(3);
  const diagDx = 1;
  const diagDy = 3;
  const diagNorm = Math.sqrt(diagDx * diagDx + diagDy * diagDy);
  const diagLen = 15;

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

  axT.append("text").attr("x", cw - 5).attr("y", -38).attr("text-anchor", "end")
    .attr("class", "axis-title").text("DENSITY");
  axT.append("text").attr("x", cw - 5).attr("y", -26).attr("text-anchor", "end")
    .attr("class", "axis-subtitle").text("10ⁿ g/L");
  axT.append("text").attr("x", 5).attr("y", -38).attr("text-anchor", "start")
    .attr("class", "axis-title").attr("letter-spacing", "3px").text("TIME");
  axT.append("text").attr("x", 5).attr("y", -26).attr("text-anchor", "start")
    .attr("class", "axis-subtitle").text("10ⁿ s since Big Bang");

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
    const logDigits = ppu >= 300 ? [2,3,4,5,6,7,8,9]
                    : ppu >= 140 ? [2,4,6,8]
                    :              [5];
    const startX = Math.floor(d.x0), endX = Math.ceil(d.x1);
    for (let i = startX; i <= endX; i++) {
      for (const n of logDigits) {
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
    axB.append("line").attr("x1", p).attr("y1", 0).attr("x2", p).attr("y2", 28)
      .attr("stroke", "rgba(255,100,100,0.4)").attr("stroke-dasharray", "2 2");
    if (Math.abs(p - lastRow1Px) >= 40 && u.slug) {
      axB.append("text").attr("class", "axis-unit-link").attr("data-slug", u.slug).attr("data-name", u.label)
        .attr("x", p).attr("y", 37).attr("text-anchor", "middle")
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
    axB.append("line").attr("x1", p).attr("y1", 0).attr("x2", p).attr("y2", 48)
      .attr("stroke", "rgba(255,100,100,0.25)").attr("stroke-dasharray", "2 2");
    if (Math.abs(p - lastRow2Px) >= 35 && u.slug) {
      axB.append("text").attr("class", "axis-unit-link").attr("data-slug", u.slug).attr("data-name", u.label)
        .attr("x", p + 2).attr("y", 50)
        .attr("text-anchor", "start")
        .attr("font-family", "'Space Mono', monospace").attr("font-size", 7.5)
        .attr("fill", "rgba(255,130,130,0.45)")
        .attr("transform", `rotate(45,${p + 2},50)`)
        .text(u.label);
      lastRow2Px = p;
    }
  });

  axB.append("text").attr("x", cw / 2).attr("y", 65).attr("text-anchor", "middle")
    .attr("class", "axis-title").text("WIDTH");
  axB.append("text").attr("x", cw / 2).attr("y", 78).attr("text-anchor", "middle")
    .attr("class", "axis-subtitle").text("10ⁿ meters");

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
    const ppuY = ch / (d.y1 - d.y0);
    const logDigitsY = ppuY >= 300 ? [2,3,4,5,6,7,8,9]
                     : ppuY >= 140 ? [2,4,6,8]
                     :               [5];
    const startY = Math.floor(d.y0), endY = Math.ceil(Math.min(d.y1, leftMax));
    for (let i = startY; i <= endY; i++) {
      for (const n of logDigitsY) {
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

  const leftCompact = _isSidebarOpen;
  const unitX = leftCompact ? -12 : -20;
  const titleY = leftCompact ? -45 : -60;

  let lastEnergyPy = -Infinity;
  ENERGY_UNITS.forEach(u => {
    if (u.logM < d.y0 || u.logM > Math.min(d.y1, leftMax)) return;
    const p = py(u.logM);
    if (p < 2 || p > ch - 2) return;
    axL.append("line").attr("x1", -3).attr("y1", p).attr("x2", 0).attr("y2", p)
      .attr("stroke", "rgba(255,100,100,0.4)").attr("stroke-dasharray", "2 2");
    if (Math.abs(p - lastEnergyPy) >= minUnitPx && u.slug) {
      axL.append("text").attr("class", "axis-unit-link").attr("data-slug", u.slug).attr("data-name", u.label)
        .attr("x", unitX).attr("y", p + 3).attr("text-anchor", "end")
        .attr("font-family", "'Space Mono', monospace").attr("font-size", leftCompact ? 8 : 9)
        .attr("fill", "rgba(255,130,130,0.6)")
        .text(u.label);
      lastEnergyPy = p;
    }
  });

  axL.append("text").attr("transform", "rotate(-90)").attr("x", -ch / 2).attr("y", titleY)
    .attr("text-anchor", "middle").attr("class", "axis-title").text("ENERGY");
  axL.append("text").attr("transform", "rotate(-90)").attr("x", -ch / 2).attr("y", titleY + 14)
    .attr("text-anchor", "middle").attr("class", "axis-subtitle").text("10ⁿ eV");

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
    const ppuY2 = ch / (d.y1 - d.y0);
    const logDigitsR = ppuY2 >= 300 ? [2,3,4,5,6,7,8,9]
                     : ppuY2 >= 140 ? [2,4,6,8]
                     :                [5];
    const startY = Math.floor(d.y0), endY = Math.ceil(d.y1);
    for (let i = startY; i <= endY; i++) {
      for (const n of logDigitsR) {
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
    axR.append("line").attr("x1", 0).attr("y1", p).attr("x2", 3).attr("y2", p)
      .attr("stroke", "rgba(255,100,100,0.4)").attr("stroke-dasharray", "2 2");
    if (Math.abs(p - lastMassUnitPy) >= minUnitPx && u.slug) {
      axR.append("text").attr("class", "axis-unit-link").attr("data-slug", u.slug).attr("data-name", u.label)
        .attr("x", 12).attr("y", p + 3).attr("text-anchor", "start")
        .attr("font-family", "'Space Mono', monospace").attr("font-size", 8)
        .attr("fill", "rgba(255,130,130,0.6)")
        .text(u.label);
      lastMassUnitPy = p;
    }
  });

  axR.append("text").attr("transform", "rotate(90)").attr("x", ch / 2).attr("y", -45)
    .attr("text-anchor", "middle").attr("class", "axis-title").text("MASS");
  axR.append("text").attr("transform", "rotate(90)").attr("x", ch / 2).attr("y", -33)
    .attr("text-anchor", "middle").attr("class", "axis-subtitle").text("10ⁿ kg");
}

function fmtTick(v) {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

// =============================================================
// Connection Animation System
// =============================================================

function computePathDists(points) {
  const dists = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].logR - points[i - 1].logR;
    const dy = points[i].logM - points[i - 1].logM;
    dists.push(dists[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  return dists;
}

function pathPosAt(points, dists, t) {
  const totalDist = dists[dists.length - 1];
  const target = Math.max(0, Math.min(1, t)) * totalDist;
  for (let i = 0; i < dists.length - 1; i++) {
    if (target <= dists[i + 1] || i === dists.length - 2) {
      const segLen = dists[i + 1] - dists[i];
      const lt = segLen > 0 ? (target - dists[i]) / segLen : 0;
      return {
        logR: points[i].logR + (points[i + 1].logR - points[i].logR) * lt,
        logM: points[i].logM + (points[i + 1].logM - points[i].logM) * lt,
      };
    }
  }
  return points[points.length - 1];
}

function emSpectrumColor(t) {
  const stops = [
    [0.00,  90,  90, 140],
    [0.10, 100, 100, 180],
    [0.18, 110,  80, 210],
    [0.25, 140,  40, 230],
    [0.30, 160,   0, 220],
    [0.32, 100,   0, 255],
    [0.34,   0,  60, 255],
    [0.36,   0, 180, 220],
    [0.38,   0, 220, 100],
    [0.40, 120, 255,   0],
    [0.42, 255, 240,   0],
    [0.44, 255, 160,   0],
    [0.46, 255,  40,   0],
    [0.50, 200,  15,  15],
    [0.60, 140,  30,  25],
    [0.75, 100,  45,  35],
    [1.00,  65,  45,  38],
  ];
  let i = 0;
  while (i < stops.length - 1 && stops[i + 1][0] < t) i++;
  if (i >= stops.length - 1) {
    const s = stops[stops.length - 1];
    return `rgb(${s[1]},${s[2]},${s[3]})`;
  }
  const [t0, r0, g0, b0] = stops[i];
  const [t1, r1, g1, b1] = stops[i + 1];
  const f = (t - t0) / (t1 - t0);
  return `rgb(${Math.round(r0 + (r1 - r0) * f)},${Math.round(g0 + (g1 - g0) * f)},${Math.round(b0 + (b1 - b0) * f)})`;
}

function connectionOpacity(cp) {
  const [zMin, zMax] = cp.zoomRange;
  if (currentK < zMin * 0.5) return 0;
  if (currentK > zMax) return 0;
  let fade = 1;
  if (currentK < zMin) fade = (currentK - zMin * 0.5) / (zMin * 0.5);
  if (cp.neighborhood) {
    const d = vd();
    const nb = cp.neighborhood;
    if (d.x1 < nb.x[0] || d.x0 > nb.x[1] || d.y1 < nb.y[0] || d.y0 > nb.y[1]) return 0;
    const ox = Math.max(0, Math.min(d.x1, nb.x[1]) - Math.max(d.x0, nb.x[0]));
    const oy = Math.max(0, Math.min(d.y1, nb.y[1]) - Math.max(d.y0, nb.y[0]));
    const viewArea = (d.x1 - d.x0) * (d.y1 - d.y0);
    fade *= viewArea > 0 ? Math.min(1, (ox * oy) / (viewArea * 0.2)) : 0;
  }
  return Math.max(0, Math.min(1, fade));
}

const CLUSTER_DOTS = 5;
const CLUSTER_SPREAD = 0.008;
const BASE_PX_PER_SEC = 12;

let _connPaths = null;
let _connDotsStale = true;
let _connDotEls = [];
let _connLastTime = 0;
let _connAnimId = null;
let _animPaused = false;
let _animDisabled = false;
let _animResumeTimer = null;

function pauseAnimOnInteract() {
  if (_animDisabled) return;
  _animPaused = true;
  clearTimeout(_animResumeTimer);
  _animResumeTimer = setTimeout(() => { _animPaused = false; }, 1000);
}

function screenPathLength(cp) {
  if (cp._pathLen > 0) return cp._pathLen;
  const N = 40;
  let len = 0;
  for (let i = 0; i < N; i++) {
    const t0 = i / N, t1 = (i + 1) / N;
    const p0 = pathPosAt(cp.points, cp.dists, t0);
    const p1 = pathPosAt(cp.points, cp.dists, t1);
    const dx = px(p1.logR) - px(p0.logR);
    const dy = py(p1.logM) - py(p0.logM);
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return Math.max(len, 1);
}

function initConnections() {
  _connPaths = CONNECTION_PATHS.map(cp => {
    const isMeteor = cp.family === "evolution";
    // Evolution paths: random positions and speeds for meteor shower effect
    const dotTs = isMeteor
      ? Array.from({ length: cp.style.dotCount }, () => Math.random())
      : Array.from({ length: cp.style.dotCount }, (_, i) => i / cp.style.dotCount);
    const dotSpeeds = isMeteor
      ? Array.from({ length: cp.style.dotCount }, () => 0.6 + Math.random() * 0.8)
      : Array.from({ length: cp.style.dotCount }, () => 1);
    return {
      ...cp,
      dists: computePathDists(cp.points),
      dotTs,
      dotSpeeds,
      _screenLen: 1,
      _visible: false,
      _opacity: 0,
    };
  });
  _connLastTime = performance.now();
  _connAnimId = requestAnimationFrame(animateConnections);
}

function drawConnections() {
  lArrows.selectAll("*").remove();
  _connDotsStale = true;
  if (!_connPaths) return;

  const curveLineGen = d3.line()
    .x(p => px(p.logR)).y(p => py(p.logM))
    .curve(d3.curveCatmullRom.alpha(0.5));

  // Bezier path generator for decay/combines paths:
  // All points are anchors. Between each consecutive pair (A → B),
  // auto-compute cubic bezier control points using the "1:2 rectangle at 45°" formula:
  //   H = (B.logR - A.logR) / 2,  V = (A.logM - B.logM) / 2
  //   CP1 = (A.logR + H, A.logM + V)   — from A: right H, up V
  //   CP2 = (B.logR + H, A.logM - V)   — from furthest: down V, right H
  function bezierPathGen(pts) {
    if (pts.length < 2) return "";
    let d = `M ${px(pts[0].logR)},${py(pts[0].logM)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const A = pts[i], B = pts[i + 1];
      const H = (B.logR - A.logR) / 2;
      const V = (A.logM - B.logM) / 2;
      const cp1r = A.logR + H, cp1m = A.logM + V;
      const cp2r = B.logR + H, cp2m = A.logM - V;
      d += ` C ${px(cp1r)},${py(cp1m)} ${px(cp2r)},${py(cp2m)} ${px(B.logR)},${py(B.logM)}`;
    }
    return d;
  }

  _connPaths.forEach(cp => {
    cp._opacity = connectionOpacity(cp);
    cp._visible = cp._opacity > 0.01;

    // Decay and combines paths use bezier curves (alternating anchor/control points)
    const isBezier = cp.family === "decay" || cp.family === "combines";
    const hiddenPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    hiddenPath.setAttribute("d", isBezier ? bezierPathGen(cp.points) : curveLineGen(cp.points));
    cp._pathEl = hiddenPath;
    cp._pathLen = hiddenPath.getTotalLength();

    if (!cp._visible) return;

    // Draw visible line (hidden by default, revealed on hover)
    const lineGroup = lArrows.append("g")
      .attr("opacity", 0)
      .style("transition", "opacity 0.3s")
      .style("pointer-events", "none");
    cp._lineGroup = lineGroup;

    if (cp.family === "spectrum") {
      const SEG_COUNT = 40;
      for (let i = 0; i < SEG_COUNT; i++) {
        const t0 = i / SEG_COUNT, t1 = (i + 1) / SEG_COUNT;
        let [sx0, sy0] = getPathScreenPos(cp, t0);
        let [sx1, sy1] = getPathScreenPos(cp, t1);
        const freq0 = 28 * Math.max(0.12, 1 - t0 * 0.88);
        const amp0 = 6 + t0 * 10;
        const freq1 = 28 * Math.max(0.12, 1 - t1 * 0.88);
        const amp1 = 6 + t1 * 10;
        const [fx0, fy0] = getPathScreenPos(cp, Math.min(1, t0 + 0.005));
        const dx0 = fx0 - sx0, dy0 = fy0 - sy0;
        const l0 = Math.sqrt(dx0 * dx0 + dy0 * dy0) || 1;
        const [fx1, fy1] = getPathScreenPos(cp, Math.min(1, t1 + 0.005));
        const dx1 = fx1 - sx1, dy1 = fy1 - sy1;
        const l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
        sx0 += (-dy0 / l0) * Math.sin(t0 * freq0 * Math.PI * 2) * amp0;
        sy0 += (dx0 / l0) * Math.sin(t0 * freq0 * Math.PI * 2) * amp0;
        sx1 += (-dy1 / l1) * Math.sin(t1 * freq1 * Math.PI * 2) * amp1;
        sy1 += (dx1 / l1) * Math.sin(t1 * freq1 * Math.PI * 2) * amp1;
        lineGroup.append("line")
          .attr("x1", sx0).attr("y1", sy0).attr("x2", sx1).attr("y2", sy1)
          .attr("stroke", emSpectrumColor(t0))
          .attr("stroke-width", cp.style.lineWidth * 0.6)
          .attr("opacity", cp.style.lineOpacity * cp._opacity * 0.7)
          .attr("stroke-linecap", "round");
      }
    } else {
      const visD = isBezier ? bezierPathGen(cp.points) : curveLineGen(cp.points);
      const pathEl = lineGroup.append("path")
        .attr("d", visD)
        .attr("fill", "none")
        .attr("stroke", cp.style.color || "rgba(255,255,255,0.3)")
        .attr("stroke-width", cp.style.lineWidth)
        .attr("opacity", cp.style.lineOpacity * cp._opacity);
      if (cp.style.dash) pathEl.attr("stroke-dasharray", cp.style.dash);
    }

    // Hit area for hover — shows line and tooltip
    const hitD = isBezier ? bezierPathGen(cp.points) : curveLineGen(cp.points);
    lArrows.append("path")
      .attr("d", hitD)
      .attr("fill", "none")
      .attr("stroke", "transparent")
      .attr("stroke-width", 18)
      .style("cursor", "pointer")
      .on("mouseenter", function(e) {
        lineGroup.attr("opacity", 1);
        if (cp.description) {
          const color = cp.style.color || "rgba(255,255,255,0.6)";
          tooltipEl.innerHTML = `<div class="tt-desc" style="color:${color}">${cp.description}</div>`;
          tooltipEl.classList.add("visible");
          positionTooltip(e);
        }
      })
      .on("mouseleave", function() {
        lineGroup.attr("opacity", 0);
        hideTooltip();
      });
  });
}

function getPathScreenPos(cp, t) {
  if (cp._pathEl && cp._pathLen > 0) {
    const pt = cp._pathEl.getPointAtLength(Math.max(0, Math.min(1, t)) * cp._pathLen);
    return [pt.x, pt.y];
  }
  const pos = pathPosAt(cp.points, cp.dists, t);
  return [px(pos.logR), py(pos.logM)];
}

function applyEmWave(cp, t, sx, sy, timestamp) {
  if (cp.family !== "spectrum") return [sx, sy];
  const tFwd = Math.min(1, t + 0.005);
  const [fsx, fsy] = getPathScreenPos(cp, tFwd);
  const tdx = fsx - sx, tdy = fsy - sy;
  const tlen = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
  const perpX = -tdy / tlen, perpY = tdx / tlen;

  const freq = 28 * Math.max(0.12, 1 - t * 0.88);
  const amplitude = 6 + t * 10;
  const phase = t * freq * Math.PI * 2 - timestamp * 0.0004;
  return [sx + perpX * Math.sin(phase) * amplitude, sy + perpY * Math.sin(phase) * amplitude];
}

function animateConnections(timestamp) {
  if (!_connPaths) {
    _connAnimId = requestAnimationFrame(animateConnections);
    return;
  }

  const dt = Math.min((timestamp - _connLastTime) / 1000, 0.1);
  _connLastTime = timestamp;

  if (_animDisabled) {
    lConnDots.selectAll("*").remove();
    _connDotEls = [];
    _connDotsStale = true;
    _connAnimId = requestAnimationFrame(animateConnections);
    return;
  }

  if (_connDotsStale) {
    lConnDots.selectAll("*").remove();
    _connDotEls = [];
    const container = lConnDots.node();
    _connPaths.forEach((cp, pi) => {
      if (!cp._visible) return;
      cp._screenLen = screenPathLength(cp);
      for (let i = 0; i < cp.style.dotCount; i++) {
        const group = [];
        for (let c = 0; c < CLUSTER_DOTS; c++) {
          const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          if (c === 0 && (cp.family === "spectrum" || cp.family === "evolution")) el.setAttribute("filter", "url(#conn-glow)");
          container.appendChild(el);
          group.push({ el, idx: c });
        }
        _connDotEls.push({ group, pi, di: i });
      }
    });
    _connDotsStale = false;
  }

  if (!_animPaused) {
    _connPaths.forEach(cp => {
      if (!cp._visible) return;
      cp._screenLen = screenPathLength(cp);
      const pxSpeed = (cp.style.dotSpeed || 1) * BASE_PX_PER_SEC;
      const baseDtFrac = pxSpeed / cp._screenLen * dt;
      for (let i = 0; i < cp.dotTs.length; i++) {
        cp.dotTs[i] = (cp.dotTs[i] + baseDtFrac * cp.dotSpeeds[i]) % 1;
      }
    });
  }

  _connDotEls.forEach(({ group, pi, di }) => {
    const cp = _connPaths[pi];
    const baseT = cp.dotTs[di];

    group.forEach(({ el, idx }) => {
      const isMeteor = cp.family === "evolution";
      const spread = isMeteor ? CLUSTER_SPREAD * 3 : CLUSTER_SPREAD;
      const tailOffset = idx * spread;
      let t = (baseT - tailOffset + 1) % 1;

      const headFactor = 1 - idx / CLUSTER_DOTS;
      const sizeFactor = isMeteor
        ? (0.15 + 0.85 * headFactor * headFactor)  // sharper falloff for comet tail
        : (0.5 + 0.5 * headFactor);
      const opacityMult = isMeteor
        ? (0.05 + 0.95 * headFactor * headFactor)   // brighter head, dimmer tail
        : (0.3 + 0.7 * headFactor);

      let [sx, sy] = getPathScreenPos(cp, t);
      [sx, sy] = applyEmWave(cp, t, sx, sy, timestamp);

      el.setAttribute("cx", String(sx));
      el.setAttribute("cy", String(sy));
      el.setAttribute("r", String(cp.style.dotSize * sizeFactor));

      const edgeFade = Math.min(t / 0.04, (1 - t) / 0.04, 1);

      if (sx < -30 || sx > cw + 30 || sy < -30 || sy > ch + 30 || edgeFade <= 0) {
        el.setAttribute("opacity", "0");
      } else {
        const color = cp.family === "spectrum"
          ? emSpectrumColor(t)
          : (cp.style.color || "rgba(255,255,255,0.5)");
        el.setAttribute("fill", color);
        el.setAttribute("opacity", String(cp._opacity * 0.6 * opacityMult * edgeFade));
      }
    });
  });

  _connAnimId = requestAnimationFrame(animateConnections);
}

// =============================================================
// Minimap
// =============================================================

const MINIMAP_SIZE = 120;
const MINIMAP_PAD = 10;

const miniSvg = svg.append("g")
  .attr("transform", `translate(${W - MINIMAP_SIZE - MINIMAP_PAD - margin.right}, ${margin.top + MINIMAP_PAD})`);

// Minimap background — transparent, blends with chart
miniSvg.append("rect")
  .attr("width", MINIMAP_SIZE).attr("height", MINIMAP_SIZE)
  .attr("rx", 4).attr("fill", "none");

// Mini scales — equal px/unit so the right triangle isn't distorted
const _xRange = BOUNDS.x.max - BOUNDS.x.min;
const _yRange = BOUNDS.y.max - BOUNDS.y.min;
const _usable = MINIMAP_SIZE - 4;
const _ppu = _usable / Math.max(_xRange, _yRange);
const _xPad = (MINIMAP_SIZE - _xRange * _ppu) / 2;
const _yPad = (MINIMAP_SIZE - _yRange * _ppu) / 2;
const miniX = d3.scaleLinear().domain([BOUNDS.x.min, BOUNDS.x.max]).range([_xPad, MINIMAP_SIZE - _xPad]);
const miniY = d3.scaleLinear().domain([BOUNDS.y.min, BOUNDS.y.max]).range([MINIMAP_SIZE - _yPad, _yPad]);

// Draw the Triangle of Everything in minimap
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

// Water density reference line (logRho = 0, slope 3 in logM vs logR)
{
  const waterB = DENSITY_SPHERE_C; // logM = 3*logR + DENSITY_SPHERE_C for water
  // Clip to minimap data bounds
  const xMin = BOUNDS.x.min, xMax = BOUNDS.x.max;
  const yAtXmin = 3 * xMin + waterB, yAtXmax = 3 * xMax + waterB;
  // Clip line to visible Y range
  const yMin = BOUNDS.y.min, yMax = BOUNDS.y.max;
  let x1 = xMin, y1 = yAtXmin, x2 = xMax, y2 = yAtXmax;
  if (y1 < yMin) { y1 = yMin; x1 = (yMin - waterB) / 3; }
  if (y2 > yMax) { y2 = yMax; x2 = (yMax - waterB) / 3; }
  if (y1 > yMax) { y1 = yMax; x1 = (yMax - waterB) / 3; }
  if (y2 < yMin) { y2 = yMin; x2 = (yMin - waterB) / 3; }
  miniSvg.append("line")
    .attr("x1", miniX(x1)).attr("y1", miniY(y1))
    .attr("x2", miniX(x2)).attr("y2", miniY(y2))
    .attr("stroke", "#80deea").attr("stroke-width", 0.8)
    .attr("stroke-dasharray", "2,2").attr("opacity", 0.5);
}

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
// Background tile renderer
// =============================================================

const _tileCache = new Map();
let _bgTilesEnabled = true;

function drawTiles() {
  lTiles.selectAll("*").remove();
  if (!_bgTilesEnabled || !tileMeta) return;

  const { tileSize, levels } = tileMeta;
  // Use a single px/unit for both axes so image pixels render isotropically
  // (source image has pxPerUnitX=46.1 vs pxPerUnitY=43.5 — using X for both
  //  eliminates the ~6% vertical stretch and aligns the background triangle)
  const ppu = tileMeta.pxPerUnitX;
  const imgDataW = tileMeta.imgW / ppu;
  const imgDataH = tileMeta.imgH / ppu;

  // Anchor image to chart's Planck point so alignment holds at all zoom levels.
  // Pixel position measured from the source image's triangle vertex.
  const PLANCK_FRAC_X = 2114 / tileMeta.imgW;
  const PLANCK_FRAC_Y = 5960 / tileMeta.imgH;
  const imgLogRmin = PLANCK_LOG_R - PLANCK_FRAC_X * imgDataW;
  const imgLogRmax = imgLogRmin + imgDataW;
  const imgLogMmax = PLANCK_LOG_M + PLANCK_FRAC_Y * imgDataH;
  const imgLogMmin = imgLogMmax - imgDataH;

  const screenPPU = Math.abs(px(1) - px(0));

  let best = levels[0];
  for (const lv of levels) {
    const lvPPU = (lv.w / imgDataW);
    best = lv;
    if (lvPPU >= screenPPU) break;
  }

  // Detect over-zoom: when screen resolution exceeds the best tile level
  const bestPPU = best.w / imgDataW;
  const overZoom = screenPPU / bestPPU;
  const blurPx = overZoom > 1.5 ? Math.min(4, (overZoom - 1) * 0.7) : 0;

  const { x0, x1, y0, y1 } = vd();
  // Data units per pixel at this zoom level (correct for partial edge tiles)
  const dppX = imgDataW / best.w;
  const dppY = imgDataH / best.h;

  for (let r = 0; r < best.rows; r++) {
    for (let c = 0; c < best.cols; c++) {
      const tileW = (c === best.cols - 1) ? (best.w - c * tileSize) : tileSize;
      const tileH = (r === best.rows - 1) ? (best.h - r * tileSize) : tileSize;

      const tLogRmin = imgLogRmin + c * tileSize * dppX;
      const tLogRmax = tLogRmin + tileW * dppX;
      const tLogMmax = imgLogMmax - r * tileSize * dppY;
      const tLogMmin = tLogMmax - tileH * dppY;

      if (tLogRmax < x0 || tLogRmin > x1 || tLogMmax < y0 || tLogMmin > y1) continue;

      const sx = px(tLogRmin);
      const sy = py(tLogMmax);
      const sw = px(tLogRmax) - sx;
      const sh = py(tLogMmin) - sy;

      if (sw < 1 || sh < 1) continue;

      const href = `/tiles/z${best.z}/tile_${c}_${r}.webp`;

      const key = href;
      if (!_tileCache.has(key)) {
        const img = new Image();
        img.src = href;
        _tileCache.set(key, img);
      }

      const tileImg = lTiles.append("image")
        .attr("href", href)
        .attr("x", sx).attr("y", sy)
        .attr("width", sw).attr("height", sh)
        .attr("preserveAspectRatio", "none")
        .attr("image-rendering", "auto");

      // Apply blur when zoomed past tile resolution to hide pixelation
      if (blurPx > 0) {
        tileImg.style("filter", `blur(${blurPx.toFixed(1)}px)`);
      }
    }
  }
}

async function loadTileMeta() {
  try {
    const response = await fetch("/tiles/meta.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    tileMeta = await response.json();
    redraw();
  } catch (error) {
    console.warn("Failed to load tile metadata:", error);
  }
}

// =============================================================
// Full redraw
// =============================================================

function redraw() {
  drawTiles();
  redrawVectors();
}

function redrawVectors() {
  drawRegions();
  drawGrid();
  drawDensityLines();
  drawTriangleOverlay();
  drawBoundaries();
  drawBigBangEras();
  drawEnergyBands();
  drawDarkMatterRegions();
  drawConnections();
  drawRegionLabels();
  drawObjects();
  drawHighlight();
  drawAxes();
  updateMinimap();
  updateScaleBar();
}

// =============================================================
// Zoom with rAF throttle
// =============================================================

let currentK = 1;
let rafPending = false;
let _zoomPrevTransform = null;  // track previous transform for CSS offset
let _zooming = false;

const zoomBehavior = d3.zoom()
  .scaleExtent([0.3, 800])
  .filter((event) => {
    if (event.button && event.button !== 0) return false;
    if (event.target.closest?.("button, input, a")) return false;
    return svg.node().contains(event.target);
  })
  .on("start", () => {
    _zoomPrevTransform = { xS: xS.copy(), yS: yS.copy(), k: currentK };
    _zooming = true;
  })
  .on("zoom", (event) => {
    const t = event.transform;
    currentK = t.k;
    xS = t.rescaleX(xBase);
    yS = t.rescaleY(yBase);

    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        // During drag: CSS-translate tiles for instant feedback, redraw vectors only
        if (_zooming && _zoomPrevTransform) {
          const dx = xS(0) - _zoomPrevTransform.xS(0);
          const dy = yS(0) - _zoomPrevTransform.yS(0);
          const sk = currentK / _zoomPrevTransform.k;
          lTiles.attr("transform", `translate(${dx},${dy}) scale(${sk})`);
        }
        redrawVectors();
        updateReadout(null);
        rafPending = false;
      });
    }
  })
  .on("end", () => {
    _zooming = false;
    _zoomPrevTransform = null;
    lTiles.attr("transform", null);
    drawTiles();
  });

svg.call(zoomBehavior);

svg.on("pointerdown.animPause", pauseAnimOnInteract);
svg.on("wheel.animPause", pauseAnimOnInteract);

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
  const targetK = Math.max(currentK * 2, 12);
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

// ---------- settings panel ----------
const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");
settingsBtn.addEventListener("click", () => {
  const open = settingsPanel.classList.toggle("open");
  settingsBtn.classList.toggle("active", open);
});
// close when clicking outside
document.addEventListener("pointerdown", (e) => {
  if (settingsPanel.classList.contains("open") &&
      !settingsPanel.contains(e.target) && e.target !== settingsBtn && !settingsBtn.contains(e.target)) {
    settingsPanel.classList.remove("open");
    settingsBtn.classList.remove("active");
  }
});

function saveSettings() {
  localStorage.setItem("tri-settings", JSON.stringify({
    bg: setBg.checked, anim: setAnim.checked,
    noise: +setNoise.value
  }));
}

const setBg = document.getElementById("set-bg");
setBg.addEventListener("change", () => {
  _bgTilesEnabled = setBg.checked;
  redraw();
  saveSettings();
});

const setAnim = document.getElementById("set-anim");
setAnim.addEventListener("change", () => {
  _animDisabled = !setAnim.checked;
  document.body.classList.toggle("anim-off", _animDisabled);
  saveSettings();
});

const setNoise = document.getElementById("set-noise");
setNoise.addEventListener("input", () => {
  grainRect.attr("opacity", (setNoise.value / 100) * 3);  // 0→0, 100→3.0
  saveSettings();
});



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
  clip.select("rect").attr("width", cw).attr("height", ch);
  chart.attr("transform", `translate(${margin.left},${margin.top})`);
  xBase.domain([viewXMin, viewXMax]).range([0, cw]);
  yBase.domain([viewYMin, viewYMax]).range([ch, 0]);
  svg.call(zoomBehavior.transform, d3.zoomIdentity);
  xS = xBase.copy();
  yS = yBase.copy();
  currentK = 1;
  chart.select("rect:last-of-type").attr("width", cw).attr("height", ch);
  miniSvg.attr("transform",
    `translate(${W - MINIMAP_SIZE - MINIMAP_PAD - margin.right}, ${margin.top + MINIMAP_PAD})`);
  resizeCloudCanvas();
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
    const dotColor = SUBCAT_COLORS[o.subcat] || CATEGORIES[o.cat]?.color || "#fff";
    return `<div class="search-item" data-logr="${o.logR}" data-logm="${o.logM}">
      <span class="search-dot" style="background:${dotColor}"></span>
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
      setSidebarOpen(false);
    }
  }
});

// =============================================================
// Preset views
// =============================================================

const PRESETS = {
  "all":              null,
  "particle-physics": { x: [-17, -8],  y: [-42, -20] },
  "chemistry":        { x: [-10, -4],  y: [-25, -14] },
  "biology":          { x: [-5, 4],    y: [-17, 4] },
  "engineering":      { x: [-2, 7],    y: [-4, 18] },
  "geology":          { x: [4, 12],    y: [13, 31] },
  "astrophysics":     { x: [5, 20],    y: [30, 36] },
  "cosmology":        { x: [19, 30],   y: [37, 58] },
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
// Procedural star background (fixed, doesn't zoom)
// =============================================================

// (starfield removed — replaced by background image tiles)

// Restore saved settings
try {
  const saved = JSON.parse(localStorage.getItem("tri-settings"));
  if (saved) {
    if (saved.bg === false) { setBg.checked = false; _bgTilesEnabled = false; redraw(); }
    if (saved.anim === false) { setAnim.checked = false; _animDisabled = true; document.body.classList.add("anim-off"); }
    if (saved.noise > 0) {
      setNoise.value = saved.noise;
      grainRect.attr("opacity", (saved.noise / 100) * 3);
    }
  }
} catch (e) { /* ignore corrupt data */ }

// =============================================================
// URL hash state for bookmarkable zoom positions
// =============================================================

function saveHash() {
  const d = vd();
  const cx = ((d.x0 + d.x1) / 2).toFixed(1);
  const cy = ((d.y0 + d.y1) / 2).toFixed(1);
  const z = currentK.toFixed(2);
  const slug = selectedObj && !selectedObj.isLabel ? selectedObj.slug : "";
  const hash = slug ? `${cx},${cy},${z},${slug}` : `${cx},${cy},${z}`;
  history.replaceState(null, "", `#${hash}`);
}

function loadHash() {
  const h = location.hash.slice(1);
  if (!h) return false;
  const parts = h.split(",");
  const nums = parts.slice(0, 3).map(Number);
  if (nums.length !== 3 || nums.some(isNaN)) return false;
  const [cx, cy, k] = nums;
  const slug = parts.length > 3 ? parts.slice(3).join(",") : null;
  const tx = cw / 2 - xBase(cx) * k;
  const ty = ch / 2 - yBase(cy) * k;
  svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
  if (slug) {
    const obj = OBJECTS.find(o => o.slug === slug);
    if (obj) {
      openSidebar(obj);
      setSidebarOpen(true);
    }
  }
  return true;
}

// Save hash on zoom end (debounced)
const origZoomHandler = zoomBehavior.on("zoom");
zoomBehavior.on("zoom", (event) => {
  origZoomHandler(event);
  clearTimeout(hashTimer);
  hashTimer = setTimeout(saveHash, 500);
});
svg.call(zoomBehavior);

// =============================================================
// Boot
// =============================================================

_booted = true;
initConnections();
loadTileMeta();

if (!loadHash()) {
  // Intro animation: start zoomed on the Sun, then zoom out to full view
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
