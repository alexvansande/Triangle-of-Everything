import * as d3 from "d3";
import {
  BOUNDS, SCHWARZSCHILD_C, COMPTON_C, PLANCK_LOG_R, PLANCK_LOG_M,
  schwarzschildR, schwarzschildM, comptonR, comptonM,
  DENSITY_LINES, RADIUS_UNITS, MASS_UNITS, ENERGY_UNITS,
  CATEGORIES, SUBCAT_LABELS, CAT_DISPLAY, DENSITY_SPHERE_C, ARROWS, EPOCH_BANDS,
  REFERENCE_LINES, HUBBLE_LOG_R,
} from "./data.js";
import objectsData from "./objects.json";
import introRaw from "./texts/intro.md?raw";
import "./style.css";

// Load descriptions from markdown files (eager, at build time)
const descFiles = import.meta.glob("../content/descriptions/*.md", { query: "?raw", import: "default", eager: true });
const DESC_BY_SLUG = {};
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

const OBJECTS = objectsData.map(o => ({ ...o, slug: nameToSlug(o.name) }));

// =============================================================
// Layout
// =============================================================

const margin = { top: 90, right: 95, bottom: 80, left: 145 };
let W, H, cw, ch;

// Equal-scale view bounds — computed so 1 data unit = same px in both axes
let viewXMin, viewXMax, viewYMin, viewYMax;

function measure() {
  W = window.innerWidth;
  H = window.innerHeight;
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

// --- Background rect ---
svg.append("rect").attr("width", W).attr("height", H).attr("fill", "#06061a");

// --- Chart container ---
const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
const clip = chart.append("g").attr("clip-path", "url(#clip)");
clip.append("rect").attr("width", cw).attr("height", ch).attr("fill", "url(#grad-tri)");

// Layers
const lRegion     = clip.append("g");
const lGrid       = clip.append("g");
const lDensity    = clip.append("g");
const lTriOverlay = clip.append("g");
const lBound      = clip.append("g");
const lArrows     = clip.append("g");
const lRegLabel   = clip.append("g");
const lObj        = clip.append("g");

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
// Draw: Objects (always-visible dots, smart labels)
// =============================================================

const DOT_MIN_DIST = 6;      // px — hide dot only when circles overlap
const CLUSTER_THRESHOLD = 42; // px — objects within this form a cluster; show category label instead of individual

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
      const cx = members.reduce((s, p) => s + p.sx, 0) / members.length;
      const cy = members.reduce((s, p) => s + p.sy, 0) / members.length;
      const subcats = [...new Set(members.map(p => p.subcat).filter(Boolean))];
      const catKey = Object.keys(CATEGORIES).find(k => CATEGORIES[k] === members[0].cat);
      const label = subcats.length === 1 && SUBCAT_LABELS[subcats[0]]
        ? SUBCAT_LABELS[subcats[0]]
        : (CAT_DISPLAY[catKey] || catKey || "Objects");
      clusters.push({ members, cx, cy, label, cat: members[0].cat });
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

  // Place cluster labels first
  clusters.forEach(cl => {
    const subcats = [...new Set(cl.members.map(p => p.subcat).filter(Boolean))];
    const labelText = subcats.length === 1 && SUBCAT_LABELS[subcats[0]]
      ? SUBCAT_LABELS[subcats[0]]
      : cl.label;
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
  const CATEGORY_LABEL_FONT = 14;
  const CATEGORY_LABEL_OPACITY = 0.5;
  const CATEGORY_LABEL_MIN_CLEAR = 60; // px — min clearance from individual labels

  const bySubcat = new Map();
  projected.forEach(o => {
    if (!o._showDot || o._inCluster || !o.subcat) return;
    if (!bySubcat.has(o.subcat)) bySubcat.set(o.subcat, []);
    bySubcat.get(o.subcat).push(o);
  });

  const categoryLabels = [];
  bySubcat.forEach((members, subcat) => {
    if (members.length < 2 || !SUBCAT_LABELS[subcat]) return;
    const cx = members.reduce((s, p) => s + p.sx, 0) / members.length;
    const cy = members.reduce((s, p) => s + p.sy, 0) / members.length;
    const labelText = SUBCAT_LABELS[subcat];
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

    const g = lObj.append("g");
    g.append("text")
      .attr("x", cl.cx + pos.dx).attr("y", cl.cy + pos.dy)
      .attr("text-anchor", pos.anchor)
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", 9).attr("letter-spacing", "0.5px")
      .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.85)")
      .attr("stroke-width", 3).attr("stroke-linejoin", "round")
      .attr("class", "obj-label obj-cluster-label")
      .text(labelText.toUpperCase());
    g.append("text")
      .attr("x", cl.cx + pos.dx).attr("y", cl.cy + pos.dy)
      .attr("text-anchor", pos.anchor)
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", 9).attr("letter-spacing", "0.5px")
      .attr("fill", cl.cat.color)
      .attr("class", "obj-label obj-cluster-label")
      .text(labelText.toUpperCase());
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
      .attr("r", 6).attr("fill", o.cat.color).attr("opacity", 0.1);

    // Dot
    g.append("circle").attr("cx", o.sx).attr("cy", o.sy)
      .attr("class", "obj-dot")
      .attr("r", 2.8).attr("fill", o.cat.color).attr("opacity", 0.85);

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

// Populate intro
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
  setSidebarOpen(true);
}
showIntro();

function setSidebarOpen(open) {
  if (open) {
    sidebarEl.classList.add("open");
    document.body.classList.add("sidebar-open");
  } else {
    sidebarEl.classList.remove("open");
    document.body.classList.remove("sidebar-open");
  }
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
let _sidebarManuallyExpanded = false; // true only when user clicked >>; otherwise auto-collapse on click elsewhere

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
}

function closeSidebar() {
  selectedObj = null;
  showIntro();
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
  } else if (sidebarEl.classList.contains("open")) {
    if (_sidebarManuallyExpanded) {
      closeSidebar(); // revert to intro, stay expanded
    } else {
      setSidebarOpen(false); // auto-collapse
    }
  }
}, true);

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
    { logRho: 93.7, label: "PLANCK TIME", slug: "planck-time" },
    { logRho: 76, label: "GUT ERA", slug: "gut-era" },
    { logRho: 50, label: "INFLATION", slug: "inflation" },
    { logRho: 25, label: "ELECTROWEAK", slug: "electroweak" },
    { logRho: 14.4, label: "QCD", slug: "qcd" },
    { logRho: 4, label: "BBN", slug: "bbn" },
    { logRho: 0, label: "ρ WATER", slug: "density-water" },
    { logRho: -21, label: "CMB", slug: "cmb" },
    { logRho: -29.5, label: "NOW", slug: "now" },
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

    const txt = axT.append("text")
      .attr("x", tx).attr("y", ty)
      .attr("text-anchor", "start")
      .attr("font-family", "Inter, sans-serif")
      .attr("font-size", 7.5).attr("font-weight", 500)
      .attr("fill", "rgba(255,180,120,0.4)")
      .attr("letter-spacing", "1px")
      .attr("transform", `rotate(${densityAngle},${tx},${ty})`)
      .text(ep.label);
    if (ep.slug) {
      txt.attr("class", "axis-unit-link").attr("data-slug", ep.slug).attr("data-name", ep.label);
    }
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
    axB.append("line").attr("x1", p).attr("y1", 38).attr("x2", p).attr("y2", 48)
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
    if (Math.abs(p - lastEnergyPy) >= minUnitPx && u.slug) {
      axL.append("text").attr("class", "axis-unit-link").attr("data-slug", u.slug).attr("data-name", u.label)
        .attr("x", -60).attr("y", p + 3).attr("text-anchor", "end")
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
    if (Math.abs(p - lastMassUnitPy) >= minUnitPx && u.slug) {
      axR.append("text").attr("class", "axis-unit-link").attr("data-slug", u.slug).attr("data-name", u.label)
        .attr("x", 42).attr("y", p + 3).attr("text-anchor", "start")
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
// Minimap
// =============================================================

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
// Zoom with rAF throttle
// =============================================================

let currentK = 1;
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
      setSidebarOpen(false);
    }
  }
});

// =============================================================
// Preset views
// =============================================================

const PRESETS = {
  all:        null, // identity zoom = full view
  particles:  { x: [-18, -4], y: [-34, -20] },
  solar:      { x: [7, 14], y: [24, 36] },
  engineering: { x: [-1, 6], y: [-2, 14] },  // Nickel → Supertanker, Great Pyramid, Boeing 747
  stars:      { x: [5, 22], y: [30, 45] },
  cosmos:     { x: [18, 30], y: [36, 58] },
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
// URL hash state for bookmarkable zoom positions
// =============================================================

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
// Boot
// =============================================================

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
