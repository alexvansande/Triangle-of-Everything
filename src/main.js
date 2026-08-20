import * as d3 from "d3";
import {
  BOUNDS, SCHWARZSCHILD_C, COMPTON_C, PLANCK_LOG_R, PLANCK_LOG_M,
  schwarzschildR, schwarzschildM, comptonR, comptonM,
  DENSITY_LINES, RADIUS_UNITS, MASS_UNITS, ENERGY_UNITS,
  CATEGORIES, SUBCAT_COLORS, SUBCAT_LABELS, CAT_DISPLAY, DENSITY_SPHERE_C, EPOCH_BANDS,
  REFERENCE_LINES, HUBBLE_LOG_R, DE_SITTER_LOG_R, CONNECTION_PATHS,
  DARK_MATTER_REGIONS, ENERGY_BANDS, TEMPERATURE_ARROWS, WATER_RANGE, DENSITY_ARROWS,
} from "./data.js";
import objectsData from "./objects.json";
import introRaw from "../content/intro.md?raw";
import "./style.css";
import { initTour, onObjectClick, updateStartButtonLabel, startTour, tourStep } from "./tour.js";
import { initTimeScrubber } from "./time-scrubber.js";
// KaTeX: lazy-loaded on first use (saves ~1.6 MB from initial bundle)
let _katex = null;
async function loadKatex() {
  if (!_katex) {
    const [mod] = await Promise.all([
      import("katex"),
      import("katex/dist/katex.min.css"),
    ]);
    _katex = mod.default;
  }
  return _katex;
}

// Load descriptions from markdown files (eager, at build time)
const descFiles = import.meta.glob("../content/descriptions/*.md", { query: "?raw", import: "default", eager: true });
const DESC_BY_SLUG = {};

// Object images: eager `?url` glob inlines just the URL strings (no per-file
// JS wrapper chunk); the webp itself is fetched on demand when the sidebar
// sets <img src>, same laziness as before with 114 fewer chunks.
const imgUrls = import.meta.glob("../content/images/*.webp", { query: "?url", import: "default", eager: true });
const IMG_BY_SLUG = {};
for (const [path, url] of Object.entries(imgUrls)) {
  const slug = path.replace("../content/images/", "").replace(".webp", "");
  IMG_BY_SLUG[slug] = url;
}
import imageManifest from "../content/images/manifest.json";
// Spirograph state hashes for particles that can be opened in the 5D spirograph
import hiperspirographStates from "../content/icons/hiperspirograph-states.json";

// Atoms whose sidebar image is a sphere-packed spirograph composite (built
// from the hyperspirograph itself). These get a "Explore multidimensional
// strings" link pointing at the spirograph with no particular preset.
const STRINGS_ATOM_SLUGS = new Set([
  "hydrogen", "helium", "carbon", "oxygen", "iron", "gold", "uranium",
  "water-h2o",
]);

// Load object icons (small WebP, preloaded eagerly)
const ICON_SLUG_MAP = {
  "bacteria":       "bacterium",
  "covid":          "covid-virus",
  "grain-of-salt":  "grain-of-sand",
  "hippo":          "hippopotamus",
  "pyramid-giza":   "great-pyramid",
  "ngc7538s-bubble-nebula": "ngc-7538",
  "ngc7635bubble-nebula": "bubble-nebula",
  "observable-universe": "observable-universe",
  "up-quark":           "up",
  "smallest-primordial-bh": "primordial-black-hole",
  "w-boson":            "w",
  "z-boson":            "z",
  "laniakea-galaxy-supercluster": "laniakea",
  "x-and-y-bosons": "x--y-bosons",
};
// Icons that map to multiple objects (same icon, different slugs)
const ICON_MULTI_MAP = {
  "void": ["bo-tes-void", "eridanus-supervoid", "kbc-void"],
  "neutrino-tau": ["neutrino"],  // Neutrino (τ) — shares slug with μ
};
// Eager `?url` glob inlines the 130 icon URLs into the bundle as plain
// strings — no per-icon JS wrapper chunk, no upfront image fetches. The
// browser fetches each webp on demand the first time its <image> renders
// (map-tile-style pop-in); a gentle warmup prefetches the rest after boot.
const iconUrls = import.meta.glob("../content/icons/*.webp", { query: "?url", import: "default", eager: true });
const ICON_BY_SLUG = {};
for (const [path, url] of Object.entries(iconUrls)) {
  const iconFile = path.replace("../content/icons/", "").replace(".webp", "");
  if (ICON_MULTI_MAP[iconFile]) {
    ICON_MULTI_MAP[iconFile].forEach(s => { ICON_BY_SLUG[s] = url; });
  } else {
    const slug = ICON_SLUG_MAP[iconFile] || iconFile;
    ICON_BY_SLUG[slug] = url;
  }
}
// Warm the browser cache for off-screen icons once the app has settled —
// idle-scheduled batches so it never competes with user interaction, skipped
// on data-saver connections, paused while the tab is hidden.
setTimeout(() => {
  if (navigator.connection?.saveData) return;
  const urls = [...new Set(Object.values(ICON_BY_SLUG))]; // multi-map slugs share URLs
  let i = 0;
  const batch = () => {
    if (i >= urls.length) return;
    if (document.hidden) { setTimeout(batch, 2000); return; }
    urls.slice(i, i + 8).forEach(u => { const img = new Image(); img.src = u; });
    i += 8;
    if (typeof requestIdleCallback === "function") requestIdleCallback(batch, { timeout: 1500 });
    else setTimeout(batch, 300);
  };
  batch();
}, 4000);
let _iconsEnabled = true;
let _iconSize = 100;  // percent multiplier on top of zoom-derived effective size
let _labelsEnabled = true;

// Icon size scales with zoom: 16px at k=0.3 (fully out), up to 128px at k=800 (fully in).
// Uses log interpolation for a natural "approaching distant object" feel.
function effectiveIconSize() {
  const minK = 0.3, maxK = 800;
  const minSize = 14, maxSize = 115;
  const t = Math.log(Math.max(minK, Math.min(maxK, currentK)) / minK)
          / Math.log(maxK / minK);
  const size = minSize + (maxSize - minSize) * t;
  // Phones get half the desktop size across the board: full-size icons (×
  // per-object multipliers) drown a 390px screen at stellar zooms.
  return _isMobile ? size / 2 : size;
}
// Some objects need a larger icon (e.g. Saturn's rings extend beyond the sphere)
const ICON_SIZE_MULT = {
  "saturn": 2,
  "primordial-black-hole": 2, "3k-bh": 2, "stellar-bh": 2,
  "sgr-a": 2, "m87": 2, "ton-618": 2,
};

// Physical size scaling: for every 6 orders of magnitude in real radius,
// icon grows 10%. Observable universe icons are ~2.5x larger than instanton icons.
// Centered around logR ≈ -3.5 (midpoint of the full range).
function iconSizeMult(o) {
  const logR = o.logR ?? 0;
  const sizeScale = Math.pow(1.1, (logR - (-3.5)) / 6);
  return sizeScale * (ICON_SIZE_MULT[o.slug] || 1) * (_iconSize / 100);
}

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
// Big Bang animated timeline — state
// =============================================================
import { BIG_BANG_ERAS } from "./tour-data.js";

let _bigBangMode = false;
let _bigBangHubbleLogR = HUBBLE_LOG_R;
let _bigBangWhiteOverlay = 0;
let _bigBangObjectOpacity = {};       // slug → target opacity (0–1)
let _bigBangObjectOverrides = {};     // slug → {logR, logM} position overrides
let _bigBangFadeBlackHoles = false;
let _bigBangTransition = null;        // phase-1 d3.timer: Hubble radius + white overlay
let _bigBangTransition2 = null;       // phase-2 d3.timer: object opacities + position overrides
let _bigBangPhase2Timer = null;       // setTimeout ID for phase-2 delay

/** Dynamic Hubble radius: normal or animated during Big Bang mode. */
function getHubbleLogR() {
  return _bigBangMode ? _bigBangHubbleLogR : HUBBLE_LOG_R;
}

/**
 * Compute target opacities for all objects given a Big Bang era key.
 * Returns a map of slug → opacity (0 or 1).
 */
function computeEraOpacities(eraKey) {
  const era = BIG_BANG_ERAS[eraKey];
  if (!era) return {};
  const opacities = {};

  OBJECTS.forEach(o => {
    let visible = false;

    if (era.showAll) {
      visible = true;
    }

    // Show by category
    if (era.showCats && era.showCats.includes(o.cat)) {
      visible = true;
    }

    // Show by subcategory
    if (era.showSubcats && era.showSubcats.includes(o.subcat)) {
      visible = true;
    }

    // Show by slug
    if (era.showSlugs && era.showSlugs.includes(o.slug)) {
      visible = true;
    }

    // Hide by category (overrides showAll)
    if (era.hideCats && era.hideCats.includes(o.cat)) {
      visible = false;
    }

    // Hide by slug (overrides showAll)
    if (era.hideSlugs && era.hideSlugs.includes(o.slug)) {
      visible = false;
    }

    opacities[o.slug] = visible ? 1 : 0;
  });

  return opacities;
}

// =============================================================
// Layout
// =============================================================

const SIDEBAR_W = 360;
const BASE_MARGIN_LEFT = 80;
const MOBILE_BREAKPOINT = 768;
let _isSidebarOpen = false;
let _isMobile = window.innerWidth < MOBILE_BREAKPOINT;
let _showAxesMobile = false; // edge-to-edge by default; axes pill toggles unit margins
const _isCoarse = !!window.matchMedia?.("(pointer: coarse)").matches;
const _isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
let _booted = false;

const margin = { top: 55, right: 125, bottom: 80, left: SIDEBAR_W };
let W, H, cw, ch;

function updateMobileState() {
  const wasMobile = _isMobile;
  _isMobile = window.innerWidth < MOBILE_BREAKPOINT;
  if (_isMobile) {
    document.body.classList.add("is-mobile");
  } else {
    document.body.classList.remove("is-mobile");
  }
  const closeBtn = document.getElementById("sidebar-close");
  if (closeBtn) {
    closeBtn.innerHTML = _isMobile ? "\u2715" : "&lt;&lt;";
  }
  return wasMobile !== _isMobile;
}

// Equal-scale view bounds — computed so 1 data unit = same px in both axes
let viewXMin, viewXMax, viewYMin, viewYMax;

// User-overridable margins. null = use the default for the current
// sidebar/mobile state. Set by dragging the axis resize handles.
let _userMarginLeft = null;
let _userMarginRight = null;
let _userMarginTop = null;
let _userMarginBottom = null;
const RIGHT_MARGIN_DEFAULT = 125;
const RIGHT_MARGIN_MIN = 50;
const RIGHT_MARGIN_MAX = 220;
const LEFT_MARGIN_MIN_EXTRA = 40;     // gap above sidebar / base
const LEFT_MARGIN_MAX_EXTRA = 260;
const TOP_MARGIN_DEFAULT = 55;
const TOP_MARGIN_MIN = 35;
const TOP_MARGIN_MAX = 150;
const BOTTOM_MARGIN_DEFAULT = 80;
const BOTTOM_MARGIN_MIN = 50;
const BOTTOM_MARGIN_MAX = 200;

function measure() {
  W = window.innerWidth;
  H = window.innerHeight;
  if (_isMobile) {
    // Edge-to-edge map on phones: the chart IS the screen and all UI floats
    // above it. The axes pill (#axes-toggle) temporarily restores the unit
    // margins so the axis numbers can be read, map-app style.
    if (_showAxesMobile) {
      // Compact ruler: exponent numbers + rotated axis titles fit; the
      // outboard unit links and subtitles are skipped on mobile.
      margin.left = 56;
      margin.right = 58;
      margin.top = 78;
      margin.bottom = 92;
    } else {
      margin.left = 0;
      margin.right = 0;
      margin.top = 0;
      margin.bottom = 0;
    }
  } else {
    const baseLeft = _isSidebarOpen ? SIDEBAR_W : BASE_MARGIN_LEFT - 80;
    const defaultLeft = _isSidebarOpen ? SIDEBAR_W + 80 : BASE_MARGIN_LEFT;
    margin.left = _userMarginLeft != null
      ? Math.max(baseLeft + LEFT_MARGIN_MIN_EXTRA,
                 Math.min(baseLeft + LEFT_MARGIN_MAX_EXTRA, _userMarginLeft))
      : defaultLeft;
    margin.right = _userMarginRight != null
      ? Math.max(RIGHT_MARGIN_MIN, Math.min(RIGHT_MARGIN_MAX, _userMarginRight))
      : RIGHT_MARGIN_DEFAULT;
    margin.top = _userMarginTop != null
      ? Math.max(TOP_MARGIN_MIN, Math.min(TOP_MARGIN_MAX, _userMarginTop))
      : TOP_MARGIN_DEFAULT;
    margin.bottom = _userMarginBottom != null
      ? Math.max(BOTTOM_MARGIN_MIN, Math.min(BOTTOM_MARGIN_MAX, _userMarginBottom))
      : BOTTOM_MARGIN_DEFAULT;
  }
  cw = W - margin.left - margin.right;
  ch = H - margin.top - margin.bottom;
  // Expose axis-column widths to CSS so .axis-l / .axis-r font-sizes scale.
  document.body.style.setProperty("--left-axis-w",  margin.left  + "px");
  document.body.style.setProperty("--right-axis-w", margin.right + "px");
  document.body.style.setProperty("--top-axis-h",    margin.top    + "px");
  document.body.style.setProperty("--bottom-axis-h", margin.bottom + "px");
  document.body.classList.toggle("axis-r-bold", margin.right >= 130);
  document.body.classList.toggle("axis-l-bold", (margin.left - (_isSidebarOpen ? SIDEBAR_W : BASE_MARGIN_LEFT - 80)) >= 160);
  document.body.classList.toggle("axis-b-bold", margin.bottom >= 110);
  document.body.classList.toggle("axis-t-bold", margin.top >= 90);
  if (typeof window.__repositionAxisHandles === "function") {
    window.__repositionAxisHandles();
  }

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

// Soft black disc for screen-blend icon backgrounds
const iconBgGrad = defs.append("radialGradient").attr("id", "icon-bg-grad");
iconBgGrad.append("stop").attr("offset", "0%").attr("stop-color", "#000").attr("stop-opacity", 0.8);
iconBgGrad.append("stop").attr("offset", "50%").attr("stop-color", "#000").attr("stop-opacity", 0.5);
iconBgGrad.append("stop").attr("offset", "100%").attr("stop-color", "#000").attr("stop-opacity", 0);

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

// --- Background gradient (approximates tile background colors) ---
// The gradient follows the orthogonal to density lines (1:3 slope in chart space).
// Bright/warm near the Planck hot spot, fading to dark toward the cosmic corner.

// Layer 1: Linear gradient along density-orthogonal direction
const gradBg = defs.append("linearGradient").attr("id", "grad-bg")
  .attr("gradientUnits", "userSpaceOnUse");
gradBg.append("stop").attr("offset", "0%")
  .attr("stop-color", "#4a2860").attr("stop-opacity", 0.9);
gradBg.append("stop").attr("offset", "25%")
  .attr("stop-color", "#3a1d4a").attr("stop-opacity", 0.65);
gradBg.append("stop").attr("offset", "55%")
  .attr("stop-color", "#241035").attr("stop-opacity", 0.4);
gradBg.append("stop").attr("offset", "100%")
  .attr("stop-color", "#0a0518").attr("stop-opacity", 0);

// Layer 2: Radial glow for the warm hot spot (magenta / violet concentration)
const gradHot = defs.append("radialGradient").attr("id", "grad-hot")
  .attr("gradientUnits", "userSpaceOnUse");
gradHot.append("stop").attr("offset", "0%")
  .attr("stop-color", "#6a2055").attr("stop-opacity", 0.55);
gradHot.append("stop").attr("offset", "35%")
  .attr("stop-color", "#451038").attr("stop-opacity", 0.3);
gradHot.append("stop").attr("offset", "100%")
  .attr("stop-color", "#100118").attr("stop-opacity", 0);

// Layer 3: Subtle blue zone (right side of triangle)
const gradBlue = defs.append("radialGradient").attr("id", "grad-blue")
  .attr("gradientUnits", "userSpaceOnUse");
gradBlue.append("stop").attr("offset", "0%")
  .attr("stop-color", "#202060").attr("stop-opacity", 0.4);
gradBlue.append("stop").attr("offset", "100%")
  .attr("stop-color", "#0a0a20").attr("stop-opacity", 0);

function updateBgGradients() {
  // Linear gradient: from Planck hot region → cosmic cool region
  // Direction: (3, 1) in chart coords = 1:3 slope, orthogonal to density lines
  gradBg
    .attr("x1", xBase(-28)).attr("y1", yBase(-8))
    .attr("x2", xBase(20)).attr("y2", yBase(8));
  // Hot spot radial: centered near the brightest tile area (~logR=-15, logM=-2)
  const hx = xBase(-15), hy = yBase(-2);
  const hr = Math.abs(xBase(15) - xBase(-15)); // ~30 data-units radius in px
  gradHot.attr("cx", hx).attr("cy", hy).attr("r", hr);
  // Blue zone: centered around (logR=0, logM=15)
  const bx = xBase(0), by = yBase(15);
  const br = Math.abs(xBase(12) - xBase(-12));
  gradBlue.attr("cx", bx).attr("cy", by).attr("r", br);
}
updateBgGradients();

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
// Classed: a bare svg.select("rect") would match the clipPath rect in defs
// (first rect in document order) and silently resize the wrong element.
svg.append("rect").attr("class", "svg-bg").attr("width", W).attr("height", H).attr("fill", "#000000");

// --- Chart container ---
const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
const clip = chart.append("g").attr("clip-path", "url(#clip)");
clip.append("rect").attr("class", "bg-rect").attr("width", cw).attr("height", ch).attr("fill", "#000000");

// Background tile layer (on top of gradient, below chart content)
const lTilesBase = clip.append("g").style("pointer-events", "none"); // permanent low-res background
const lTiles = clip.append("g").style("pointer-events", "none");

// Content wrapper: CSS-transformed during zoom for smooth panning
// (instead of tearing down & rebuilding all DOM elements each frame)
const lContent = clip.append("g");

// Layers (all inside lContent so they can be batch-transformed during zoom)
const lRegion     = lContent.append("g");
const lGrid       = lContent.append("g");
const lDensity    = lContent.append("g");
const lTriOverlay = lContent.append("g");
const lBound      = lContent.append("g");
const lBigBangEras = lContent.append("g");
const lEnergyBands = lContent.append("g");
const lDarkMatter = lContent.append("g");
const lArrows     = lContent.append("g").style("mix-blend-mode", "screen");
const lConnDots   = lContent.append("g").style("pointer-events", "none").style("mix-blend-mode", "screen");
const lRegLabel   = lContent.append("g");
const lObj        = lContent.append("g");
// Retained rendering split: extras (cluster/category/BH labels, ~20 nodes)
// are rebuilt per frame; main object groups are persistent keyed joins.
const lObjExtras  = lObj.append("g");
const lObjMain    = lObj.append("g");
const lHighlight  = lContent.append("g").style("pointer-events", "none");
const lAxisRef    = lContent.append("g").style("pointer-events", "none").attr("class", "axis-ref-lines");
// Label layer inside lContent (so it pans/zooms) but above dots
const lLabels     = lContent.append("g").style("pointer-events", "none");

// Film grain noise overlay (paper texture, controlled by Noise slider)
// TEMPORARILY DISABLED for testing — uncomment to restore
// const grainRect = clip.append("rect")
//   .attr("id", "grain-overlay")
//   .attr("width", cw).attr("height", ch)
//   .attr("fill", "white").attr("opacity", 1.05)
//   .attr("filter", "url(#film-grain)")
//   .style("mix-blend-mode", "overlay")
//   .style("pointer-events", "none");
const grainRect = { attr: () => grainRect, style: () => grainRect }; // stub

// Icon layer: rendered above noise for cleaner visibility
const lIcons = clip.append("g").style("pointer-events", "none");

// Click capture now uses HTML overlays (see updateClickTargets)

// Big Bang white overlay — sits above everything for the "screen goes white" effect
const whiteOverlay = clip.append("rect")
  .attr("class", "bg-rect")
  .attr("width", cw).attr("height", ch)
  .attr("fill", "#ffffff")
  .attr("opacity", 0)
  .style("pointer-events", "none");

// Axes outside clip (also wrapped for batch CSS-transform during zoom)
const lAxesWrap = chart.append("g");
const axB = lAxesWrap.append("g").attr("class", "axis-b");
const axT = lAxesWrap.append("g").attr("class", "axis-t");
const lDensityArrows = lAxesWrap.append("g");  // non-clipped, for density arrows & era labels on logM=56 line
const axL = lAxesWrap.append("g").attr("class", "axis-l");
const axR = lAxesWrap.append("g").attr("class", "axis-r");

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
  const hLogR = getHubbleLogR();
  const planckX = px(PLANCK_LOG_R),  planckY = py(PLANCK_LOG_M);
  const schwX   = px(hLogR),  schwY  = py(schwarzschildM(hLogR));
  const compX   = px(hLogR),  compY  = py(comptonM(hLogR));

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

// =============================================================
// Grid unit modes — SI / Planck / Planck-wavelength
// =============================================================
// The chart's internal coordinates are logR (cm) and logM (g); these never
// change. A unit mode only changes (a) where the grid/axis decade lines are
// anchored (xRef/yRef — so round unit values land on grid lines) and (b) how
// the tick numbers and axis titles read. Planck modes anchor to the chart's
// own apex (PLANCK_LOG_R/M), so the singularity sits exactly on (0,0).
// "planck-wavelength" additionally shows the LEFT axis as the Compton
// wavelength (inverse energy): 0 at the apex (= the Planck length), growing
// downward — so a particle's left-axis value equals its width.
let _gridUnit = "si";
const _EV_OFFSET = 32.75; // logM(g) + this = log10(energy/eV)

const GRID_UNITS = {
  si: {
    xRef: 0, yRef: 0,
    xNum: (v) => fmtTick(v),
    massNum: (v) => fmtTick(v - 3),
    energyNum: (v) => Math.round(v + _EV_OFFSET),
    bottomSub: "10ⁿ meters", rightSub: "10ⁿ kg",
    leftTitle: "ENERGY", leftSub: "10ⁿ eV",
  },
  planck: {
    xRef: PLANCK_LOG_R, yRef: PLANCK_LOG_M,
    xNum: (v) => fmtTick(v - PLANCK_LOG_R),
    massNum: (v) => fmtTick(v - PLANCK_LOG_M),
    energyNum: (v) => fmtTick(v - PLANCK_LOG_M),
    bottomSub: "Planck lengths", rightSub: "Planck masses",
    leftTitle: "ENERGY", leftSub: "Planck energy",
  },
  "planck-wavelength": {
    xRef: PLANCK_LOG_R, yRef: PLANCK_LOG_M,
    xNum: (v) => fmtTick(v - PLANCK_LOG_R),
    massNum: (v) => fmtTick(v - PLANCK_LOG_M),
    energyNum: (v) => fmtTick(-(v - PLANCK_LOG_M)),
    bottomSub: "Planck lengths", rightSub: "Planck masses",
    leftTitle: "WAVELENGTH", leftSub: "Planck lengths",
  },
};
function gridCfg() { return GRID_UNITS[_gridUnit] || GRID_UNITS.si; }
// First grid line ≥ lo, anchored to ref + k·step (k integer).
const firstAligned = (lo, step, ref) => ref + Math.ceil((lo - ref) / step) * step;

function drawGrid() {
  lGrid.selectAll("*").remove();
  const d = vd();
  const ppu = cw / (d.x1 - d.x0);
  const { xRef, yRef } = gridCfg();

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

    // All lines in a level share stroke/width — batch them into ONE <path>
    // (a few nodes per frame instead of hundreds of <line> elements).
    let dPath = "";
    const y0 = py(d.y0), y1 = py(d.y1), x0 = px(d.x0), x1 = px(d.x1);
    const addV = (v) => { const x = px(v); dPath += `M${x},${y0}L${x},${y1}`; };
    const addH = (v) => { const y = py(v); dPath += `M${x0},${y}L${x1},${y}`; };

    if (level.step === 0) {
      const startX = Math.floor(d.x0 - xRef), endX = Math.ceil(d.x1 - xRef);
      const startY = Math.floor(d.y0 - yRef), endY = Math.ceil(d.y1 - yRef);
      for (let i = startX; i <= endX; i++) {
        for (const sub of LOG_SUBS) {
          const v = xRef + i + sub;
          if (v < d.x0 || v > d.x1) continue;
          addV(v);
        }
      }
      for (let i = startY; i <= endY; i++) {
        for (const sub of LOG_SUBS) {
          const v = yRef + i + sub;
          if (v < d.y0 || v > d.y1) continue;
          addH(v);
        }
      }
    } else {
      const step = level.step;
      const firstX = firstAligned(d.x0, step, xRef);
      for (let v = firstX; v <= d.x1; v += step) {
        // Skip positions drawn by a higher-level grid (relative to the anchor)
        const kx = v - xRef;
        if (step === 1 && Math.abs(kx % 3) < 0.01) continue;
        if (step === 3 && Math.abs(kx % 9) < 0.01) continue;
        if (step === 9 && Math.abs(kx % 30) < 0.01) continue;
        addV(v);
      }
      const firstY = firstAligned(d.y0, step, yRef);
      for (let v = firstY; v <= d.y1; v += step) {
        const ky = v - yRef;
        if (step === 1 && Math.abs(ky % 3) < 0.01) continue;
        if (step === 3 && Math.abs(ky % 9) < 0.01) continue;
        if (step === 9 && Math.abs(ky % 30) < 0.01) continue;
        addH(v);
      }
    }

    if (dPath) {
      const p = lGrid.append("path")
        .attr("d", dPath)
        .attr("fill", "none")
        .attr("stroke", stroke).attr("stroke-width", width);
      // The log-subdivision tier never had crispEdges; keep that distinction
      if (level.step !== 0) p.attr("shape-rendering", "crispEdges");
    }
  });
}


// =============================================================
// Draw: Boundary lines
// =============================================================

function drawBoundaries() {
  lBound.selectAll("*").remove();

  const hLogR = getHubbleLogR();
  const planckX = px(PLANCK_LOG_R), planckY = py(PLANCK_LOG_M);
  const schwX = px(hLogR), schwY = py(schwarzschildM(hLogR));
  const compX = px(hLogR), compY = py(comptonM(hLogR));

  // White glow behind the triangle — stacked strokes instead of a
  // viewport-sized feGaussianBlur (which forced a filter re-raster every frame)
  const triPath = `M ${planckX} ${planckY} L ${schwX} ${schwY} L ${compX} ${compY} Z`;
  [[11, 0.025], [6, 0.05], [3, 0.08]].forEach(([w, o]) => {
    lBound.append("path").attr("d", triPath)
      .attr("fill", "none").attr("stroke", "white")
      .attr("stroke-width", w).attr("opacity", o)
      .attr("stroke-linejoin", "round");
  });

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

  // De Sitter radius — dotted vertical line showing the asymptotic future Hubble radius
  // Only visible when zoomed in enough to distinguish it from the current Hubble radius
  {
    const deSitterPx = px(DE_SITTER_LOG_R);
    const hubblePx = px(HUBBLE_LOG_R);
    const separation = Math.abs(deSitterPx - hubblePx);
    if (separation > 1) {
      const dsSchwY = py(schwarzschildM(DE_SITTER_LOG_R));
      const dsCompY = py(comptonM(DE_SITTER_LOG_R));
      const dsSeg = clampLineToChart(deSitterPx, dsSchwY, deSitterPx, dsCompY);
      if (dsSeg) {
        lBound.append("line")
          .attr("x1", dsSeg.x1).attr("y1", dsSeg.y1)
          .attr("x2", dsSeg.x2).attr("y2", dsSeg.y2)
          .attr("stroke", "rgba(255,255,255,0.3)")
          .attr("stroke-width", 0.8)
          .attr("stroke-dasharray", "3 3")
          .style("cursor", "pointer")
          .on("click", (e) => { e.stopPropagation(); openInfoPanel("de-sitter-radius", "De Sitter Radius"); setSidebarOpen(true); });

        // Label — appears when there's enough space
        if (separation > 8) {
          const labelY = Math.max(dsSeg.y1 + 16, 16);
          // Outline
          lBound.append("text")
            .attr("x", deSitterPx + 5).attr("y", labelY)
            .attr("font-family", "var(--font-mono, monospace)")
            .attr("font-size", 9).attr("letter-spacing", "0.5px")
            .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.8)")
            .attr("stroke-width", 2.5).attr("stroke-linejoin", "round")
            .text("de Sitter R\u221E");
          // Visible text
          lBound.append("text")
            .attr("x", deSitterPx + 5).attr("y", labelY)
            .attr("font-family", "var(--font-mono, monospace)")
            .attr("font-size", 9).attr("letter-spacing", "0.5px")
            .attr("fill", "rgba(255,255,255,0.4)")
            .style("cursor", "pointer")
            .on("click", (e) => { e.stopPropagation(); openInfoPanel("de-sitter-radius", "De Sitter Radius"); setSidebarOpen(true); })
            .text("de Sitter R\u221E");
        }
      }
    }
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

  // Dashed lines, band labels, and temperature arrows only when zoomed in enough
  if (ppuY < 10) return;

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
  if (ppuY >= 10) {
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

  // --- Water range: 100°C and 0°C arrows with "Liquid Water" label ---
  if (ppuY >= 10) {
    const topLogM = WATER_RANGE.logMTop;     // 100°C
    const botLogM = WATER_RANGE.logMBottom;  // 0°C
    const topY = py(topLogM);
    const botY = py(botLogM);

    // Only draw if the range is at least partially on-screen
    if (topY < ch + 20 && botY > -20) {
      const compRTop = comptonR(topLogM);
      const tipXTop = px(compRTop);
      const compRBot = comptonR(botLogM);
      const tipXBot = px(compRBot);

      if (tipXTop < cw + 50 && tipXBot < cw + 50) {
        const waterColor = "rgba(100,200,255,0.5)";
        const tailXTop = tipXTop - ARROW_PX_LEN;
        const tailXBot = tipXBot - ARROW_PX_LEN;

        // 100°C arrow (dotted line + arrowhead)
        lEnergyBands.append("line")
          .attr("x1", tailXTop).attr("y1", topY)
          .attr("x2", tipXTop).attr("y2", topY)
          .attr("stroke", waterColor).attr("stroke-width", 0.7)
          .attr("stroke-dasharray", "2 3");
        lEnergyBands.append("path")
          .attr("d", `M${tipXTop},${topY} L${tipXTop - 4},${topY - 2.4} L${tipXTop - 4},${topY + 2.4}Z`)
          .attr("fill", waterColor);

        // 0°C arrow (dotted line + arrowhead)
        lEnergyBands.append("line")
          .attr("x1", tailXBot).attr("y1", botY)
          .attr("x2", tipXBot).attr("y2", botY)
          .attr("stroke", waterColor).attr("stroke-width", 0.7)
          .attr("stroke-dasharray", "2 3");
        lEnergyBands.append("path")
          .attr("d", `M${tipXBot},${botY} L${tipXBot - 4},${botY - 2.4} L${tipXBot - 4},${botY + 2.4}Z`)
          .attr("fill", waterColor);

        // Labels for 100°C and 0°C
        const labelXTop = tailXTop - LABEL_PX_GAP;
        const labelXBot = tailXBot - LABEL_PX_GAP;
        const fontSize = 10;

        // 100°C label
        lEnergyBands.append("text")
          .attr("x", labelXTop).attr("y", topY + fontSize * 0.35)
          .attr("text-anchor", "end")
          .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
          .attr("font-size", fontSize).attr("letter-spacing", "0.5px")
          .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.85)")
          .attr("stroke-width", 3).attr("stroke-linejoin", "round")
          .text("100°C");
        lEnergyBands.append("text")
          .attr("x", labelXTop).attr("y", topY + fontSize * 0.35)
          .attr("text-anchor", "end")
          .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
          .attr("font-size", fontSize).attr("letter-spacing", "0.5px")
          .attr("fill", waterColor)
          .text("100°C");

        // 0°C label
        lEnergyBands.append("text")
          .attr("x", labelXBot).attr("y", botY + fontSize * 0.35)
          .attr("text-anchor", "end")
          .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
          .attr("font-size", fontSize).attr("letter-spacing", "0.5px")
          .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.85)")
          .attr("stroke-width", 3).attr("stroke-linejoin", "round")
          .text("0°C");
        lEnergyBands.append("text")
          .attr("x", labelXBot).attr("y", botY + fontSize * 0.35)
          .attr("text-anchor", "end")
          .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
          .attr("font-size", fontSize).attr("letter-spacing", "0.5px")
          .attr("fill", waterColor)
          .text("0°C");

        // Bracket connecting the two arrows with "Liquid Water" label
        // Push bracket left enough to clear the "100°C" label (~40px wide)
        const bracketX = Math.min(tailXTop, tailXBot) - LABEL_PX_GAP - 38;

        // Vertical bracket line
        lEnergyBands.append("line")
          .attr("x1", bracketX).attr("y1", topY)
          .attr("x2", bracketX).attr("y2", botY)
          .attr("stroke", waterColor).attr("stroke-width", 1);
        // Top cap
        lEnergyBands.append("line")
          .attr("x1", bracketX).attr("y1", topY)
          .attr("x2", bracketX + 4).attr("y2", topY)
          .attr("stroke", waterColor).attr("stroke-width", 1);
        // Bottom cap
        lEnergyBands.append("line")
          .attr("x1", bracketX).attr("y1", botY)
          .attr("x2", bracketX + 4).attr("y2", botY)
          .attr("stroke", waterColor).attr("stroke-width", 1);

        // "Liquid Water" label — centered between the two arrows
        const midY = (topY + botY) / 2;
        const bracketLabelX = bracketX - 4;

        lEnergyBands.append("text")
          .attr("x", bracketLabelX).attr("y", midY + fontSize * 0.35)
          .attr("text-anchor", "end")
          .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
          .attr("font-size", fontSize).attr("letter-spacing", "0.5px")
          .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.85)")
          .attr("stroke-width", 3).attr("stroke-linejoin", "round")
          .text("Liquid Water");
        lEnergyBands.append("text")
          .attr("x", bracketLabelX).attr("y", midY + fontSize * 0.35)
          .attr("text-anchor", "end")
          .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
          .attr("font-size", fontSize).attr("letter-spacing", "0.5px")
          .attr("fill", waterColor)
          .text("Liquid Water");
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

  const baseOpacity = currentK > 3 ? 0.2 : (currentK > 1.5 ? 0.1 : 0.06);
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
        setSidebarOpen(true);
      });
  });

  // Label — positioned between the two windows, rotated along Schwarzschild line
  // Only show labels at higher zoom; polygons are visible earlier
  if (currentK < 2) return;
  const schwAng = screenAngle(1);
  const labelM = 19;
  const labelR = schwarzschildR(labelM) + 1.5;
  const lx = px(labelR), ly = py(labelM);
  if (lx > -50 && lx < cw + 50 && ly > -50 && ly < ch + 50) {
    const g = lDarkMatter.append("g").style("cursor", "pointer")
      .on("click", (e) => {
        e.stopPropagation();
        openInfoPanel("dark-matter-search", "The Search for Dark Matter");
        setSidebarOpen(true);
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
        navigateToObject("wimp", "WIMP*");
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
        setSidebarOpen(true);
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

const ERA_LINES = [
  { logRho: 120 },
  { logRho: 93.7,   label: "PLANCK EPOCH",                    slug: "planck-era" },
  { logRho: 60,     label: "GRAND UNIFIED THEORY EPOCH",      slug: "grand-unified-theory-era" },
  { logRho: 18,     label: "ELECTROWEAK EPOCH",               slug: "electroweak-era" },
  { logRho: 6,      label: "QUARK EPOCH",                     slug: "quantum-chromodynamics-era" },
  { logRho: 0,      label: "NUCLEOSYNTHESIS ERA",             slug: "big-bang-nucleosynthesis" },
  { logRho: -21,    label: "PHOTON EPOCH",                    slug: "photon-epoch" },
  { logRho: -29.5,  label: "MATTER ERA",                      slug: "matter-era" },
  { logRho: -150.6 },
];

function drawBigBangEras() {
  lBigBangEras.selectAll("*").remove();
  const d = vd();
  const ppuY = ch / (d.y1 - d.y0);
  if (ppuY < 10) return;  // match energy band zoom threshold
  const densAngle = screenAngle(3);

  // Precompute Schwarzschild intersection points for each era
  const eras = ERA_LINES.map(era => {
    const logR_int = (-SCHWARZSCHILD_C - DENSITY_SPHERE_C - era.logRho) / 2;
    const logM_int = logR_int - SCHWARZSCHILD_C;
    return { ...era, logR_int, logM_int };
  });

  // Draw diagonal lines (slope 3) from Schwarzschild intersection extending right.
  // Special case: the heat death line (last entry, no label) starts from the
  // Hubble-Compton corner instead of the Schwarzschild intersection.
  eras.forEach((era, idx) => {
    // Skip boundary-only entries (no label = just a positioning boundary)
    if (!era.label) return;
    // Skip the "Now" boundary line (Dark Energy Era at logRho=-29.5)
    if (era.logRho === -29.5) return;

    const b = DENSITY_SPHERE_C + era.logRho;

    let startR, startM;
    if (era.logRho <= -150) {
      // Heat death line: start from bottom of Hubble radius (Compton-Hubble corner)
      startR = getHubbleLogR();
      startM = comptonM(getHubbleLogR());
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

  // Era labels are now drawn by drawDensityArrows() along the logM=56 line
}

// =============================================================
// Draw: Density arrows & era labels along the logM=56 timeline
// =============================================================

function drawDensityArrows() {
  lDensityArrows.selectAll("*").remove();
  const d = vd();
  const ppuY = ch / (d.y1 - d.y0);
  if (ppuY < 10) return;  // match energy band zoom threshold

  const OBS_LOGM = 56;          // Observable Universe logM — the invisible timeline
  const ARROW_LEN = 50;         // arrow length in pixels (event arrows)
  const densAngle = screenAngle(3);

  // Screen-space direction along density line (upper-right in screen coords)
  const pxPerR = Math.abs(px(1) - px(0));
  const pxPerM = Math.abs(py(1) - py(0));
  const rawDx = pxPerR;          // positive = right
  const rawDy = -3 * pxPerM;     // negative = up (SVG y inverted)
  const lineLen = Math.hypot(rawDx, rawDy);
  if (lineLen < 1) return;
  const ndx = rawDx / lineLen;   // unit vector along density line (upper-right)
  const ndy = rawDy / lineLen;

  // Arrow direction: from tail to tip = lower-left = (-ndx, -ndy)
  const adx = -ndx, ady = -ndy;
  // Perpendicular (pointing "above" the line in screen space)
  const perpX = -ady, perpY = adx;

  const tipYpx = py(OBS_LOGM);

  // Compute tip X for past events using their density (logRho)
  function computeTipX(logRho) {
    const logR = (OBS_LOGM - DENSITY_SPHERE_C - logRho) / 3;
    return px(logR);
  }

  // "Now" position on the logM=56 line
  const nowX = computeTipX(-29);
  // Heat Death diagonal intersection with logM=56
  const heatDeathLogR = (OBS_LOGM - DENSITY_SPHERE_C + 150.6) / 3;
  const heatDeathX = px(heatDeathLogR);
  // Max logYearsFromNow (Heat Death = 10^100 years)
  const maxLogYears = 100;

  // Compute tip X for future events using log-time interpolation
  // between Now's position and the Heat Death diagonal's intersection with logM=56
  function computeFutureTipX(logYearsFromNow) {
    const t = logYearsFromNow / maxLogYears;
    return nowX + t * (heatDeathX - nowX);
  }

  // Draw an event arrow (small, white, with dashed line + arrowhead — like temperature arrows)
  function drawEventArrow(tipXpx, label, slug) {
    const color = "rgba(255,255,255,0.5)";
    const fontSize = 10;
    const lineHeight = fontSize * 1.3;
    const lines = label.split("\n");

    // Tail position (upper-right from tip along density line)
    const tailX = tipXpx + ndx * ARROW_LEN;
    const tailY = tipYpx + ndy * ARROW_LEN;

    // Dashed line
    lDensityArrows.append("line")
      .attr("x1", tailX).attr("y1", tailY)
      .attr("x2", tipXpx).attr("y2", tipYpx)
      .attr("stroke", color)
      .attr("stroke-width", 0.7)
      .attr("stroke-dasharray", "2 3");

    // Arrowhead at tip
    lDensityArrows.append("path")
      .attr("d", `M${tipXpx},${tipYpx} L${tipXpx - adx * 4 + perpX * 2.4},${tipYpx - ady * 4 + perpY * 2.4} L${tipXpx - adx * 4 - perpX * 2.4},${tipYpx - ady * 4 - perpY * 2.4}Z`)
      .attr("fill", color);

    // Label at the tail, start-aligned so text extends up-right from the line
    // Position label so bottom of first line sits at tail
    const labelX = tailX + perpX * 3;
    const labelY = tailY + perpY * 3;

    lines.forEach((line, li) => {
      const yOff = li * lineHeight;

      // Dark outline
      lDensityArrows.append("text")
        .attr("x", labelX).attr("y", labelY + yOff)
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "auto")
        .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
        .attr("font-size", fontSize).attr("letter-spacing", "0.5px")
        .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.85)")
        .attr("stroke-width", 3).attr("stroke-linejoin", "round")
        .attr("transform", `rotate(${densAngle},${labelX},${labelY})`)
        .text(line);

      // Colored text
      const el = lDensityArrows.append("text")
        .attr("x", labelX).attr("y", labelY + yOff)
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "auto")
        .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
        .attr("font-size", fontSize).attr("letter-spacing", "0.5px")
        .attr("fill", color)
        .attr("transform", `rotate(${densAngle},${labelX},${labelY})`)
        .text(line);

      if (slug && li === 0) {
        el.style("cursor", "pointer")
          .on("click", (e) => { e.stopPropagation(); openInfoPanel(slug, label.replace("\n", " ")); setSidebarOpen(true); });
      }
    });
  }

  // Draw an era label (big, red, no arrow — like energy band labels)
  function drawEraLabel(tipXpx, label, slug) {
    const color = "rgba(255,130,130,0.8)";
    const fontSize = 12;

    // Label positioned at the invisible logM=56 line, start-aligned
    const labelX = tipXpx;
    const labelY = tipYpx;

    // Dark outline
    lDensityArrows.append("text")
      .attr("x", labelX).attr("y", labelY)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "auto")
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", fontSize).attr("letter-spacing", "1px")
      .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.6)")
      .attr("stroke-width", 2).attr("stroke-linejoin", "round")
      .attr("opacity", 0.5)
      .attr("transform", `rotate(${densAngle},${labelX},${labelY})`)
      .text(label);

    // Colored text
    const el = lDensityArrows.append("text")
      .attr("x", labelX).attr("y", labelY)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "auto")
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", fontSize).attr("letter-spacing", "1px")
      .attr("fill", color)
      .attr("opacity", 0.5)
      .attr("transform", `rotate(${densAngle},${labelX},${labelY})`)
      .text(label);

    if (slug) {
      el.style("cursor", "pointer")
        .on("click", (e) => { e.stopPropagation(); openInfoPanel(slug, label); setSidebarOpen(true); });
    }
  }

  // Collect all items to draw: era labels + event arrows
  const allItems = [];

  // Era labels from ERA_LINES (positioned at midpoint between bounding lines)
  for (let i = 1; i < ERA_LINES.length; i++) {
    if (!ERA_LINES[i].label) continue;
    const midLogRho = (ERA_LINES[i - 1].logRho + ERA_LINES[i].logRho) / 2;
    const tipX = computeTipX(midLogRho);
    allItems.push({
      tipX,
      label: ERA_LINES[i].label,
      slug: ERA_LINES[i].slug,
      logRho: midLogRho,
      type: "era",
      priority: 3,
    });
  }

  // Event arrows from DENSITY_ARROWS
  DENSITY_ARROWS.forEach(arr => {
    let tipX;
    if (arr.logYearsFromNow != null) {
      // Future event: log-time interpolation between Now and Heat Death
      tipX = computeFutureTipX(arr.logYearsFromNow);
    } else {
      // Past event or Now: density-based positioning
      tipX = computeTipX(arr.logRho);
    }
    allItems.push({
      tipX,
      label: arr.label,
      slug: arr.slug,
      type: "event",
      priority: arr.priority || 0,
    });
  });

  // Sort by priority (high first), then by tipX for stable ordering
  allItems.sort((a, b) => b.priority - a.priority || a.tipX - b.tipX);

  // Collision detection: minimum spacing between arrow tips
  const placed = [];  // array of tipX values
  const MIN_SPACING = 20;  // minimum pixels between arrow tips

  allItems.forEach(item => {
    if (item.tipX < -200 || item.tipX > cw + 200) return;

    const collides = placed.some(p => Math.abs(item.tipX - p) < MIN_SPACING);
    if (collides) return;

    placed.push(item.tipX);
    if (item.type === "era") {
      drawEraLabel(item.tipX, item.label, item.slug);
    } else {
      drawEventArrow(item.tipX, item.label, item.slug);
    }
  });
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
  const hLogR = getHubbleLogR();
  const plkX = px(PLANCK_LOG_R), plkY = py(PLANCK_LOG_M);
  const hubSchwX = px(hLogR), hubSchwY = py(schwarzschildM(hLogR));
  const hubCompX = px(hLogR), hubCompY = py(comptonM(hLogR));
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
  // Retained rendering: object groups, icons, and labels are persistent
  // nodes updated through keyed joins below — per frame this is attribute
  // writes, not DOM teardown. Only the small extras layer (cluster/category/
  // BH labels, ~20 nodes) rebuilds each call.
  lObjExtras.selectAll("*").remove();
  const d = vd();
  const icoSize = effectiveIconSize();
  const pad = 5;

  // Project all objects to screen, sorted by priority (low z = important)
  const projected = OBJECTS
    .map(o => {
      // Big Bang mode: apply position overrides (e.g. Sun → red giant)
      let logR = o.logR, logM = o.logM;
      if (_bigBangMode && _bigBangObjectOverrides[o.slug]) {
        logR = _bigBangObjectOverrides[o.slug].logR;
        logM = _bigBangObjectOverrides[o.slug].logM;
      }
      // Big Bang mode: compute effective opacity
      let bbOpacity = 1;
      if (_bigBangMode) {
        bbOpacity = _bigBangObjectOpacity[o.slug] ?? 0;
        if (bbOpacity <= 0.01) return null;  // skip invisible objects entirely
      }
      return {
        ...o,
        logR, logM,
        catKey: o.cat,
        sx: px(logR),
        sy: py(logM),
        cat: CATEGORIES[o.cat],
        color: SUBCAT_COLORS[o.subcat] || CATEGORIES[o.cat]?.color || "#fff",
        bbOpacity,
      };
    })
    .filter(o =>
      o &&
      o.sx >= -pad && o.sx <= cw + pad &&
      o.sy >= -pad && o.sy <= ch + pad &&
      (!o.minK || currentK >= o.minK)
    )
    .sort((a, b) => {
      // Icon objects get a slight priority boost (lower z = shown first)
      const aZ = (_iconsEnabled && ICON_BY_SLUG[a.slug]) ? a.z - 0.5 : a.z;
      const bZ = (_iconsEnabled && ICON_BY_SLUG[b.slug]) ? b.z - 0.5 : b.z;
      return aZ - bZ;
    });

  // --- Dot clustering: hide dots only when circles truly overlap ---
  const visibleDots = [];
  projected.forEach(o => {
    const dx2 = (s) => (s.sx - o.sx) ** 2 + (s.sy - o.sy) ** 2;
    const tooClose = visibleDots.some(s => dx2(s) < DOT_MIN_DIST * DOT_MIN_DIST);
    o._showDot = !tooClose;
    if (o._showDot) visibleDots.push(o);
  });

  // --- Icon overlap: when icons touch, only the highest-priority keeps its icon ---
  const icoOverlap = icoSize * 1.0; // icons overlap when closer than 70% of icon size
  const icoOverlap2 = icoOverlap * icoOverlap;
  const shownIcons = [];
  projected.forEach(o => {
    const hasIcon = _iconsEnabled && ICON_BY_SLUG[o.slug];
    if (!hasIcon || !o._showDot) { o._showIcon = false; return; }
    const tooClose = shownIcons.some(s => {
      const dx = s.sx - o.sx, dy = s.sy - o.sy;
      return dx * dx + dy * dy < icoOverlap2;
    });
    o._showIcon = !tooClose;
    if (o._showIcon) shownIcons.push(o);
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

    // Single node: paint-order renders the outline behind the fill,
    // replacing the old shadow-text + fill-text pair.
    lObjExtras.append("text")
      .attr("x", lx).attr("y", ly)
      .attr("text-anchor", pos.anchor)
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", 10).attr("letter-spacing", "0.5px")
      .attr("paint-order", "stroke")
      .attr("stroke", "rgba(6,6,26,0.85)")
      .attr("stroke-width", 3).attr("stroke-linejoin", "round")
      .attr("fill", cl.cat.color)
      .attr("class", "obj-label obj-cluster-label")
      .text(labelText);
  });

  // --- Render category labels (spread-out groups, center of mass) ---
  categoryLabels.forEach(cl => {
    lObjExtras.append("text")
      .attr("x", cl.cx).attr("y", cl.cy)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", CATEGORY_LABEL_FONT).attr("letter-spacing", "1px")
      .attr("paint-order", "stroke")
      .attr("stroke", "rgba(6,6,26,0.6)")
      .attr("stroke-width", 2).attr("stroke-linejoin", "round")
      .attr("fill", cl.cat.color)
      .attr("class", "obj-category-label")
      .attr("opacity", CATEGORY_LABEL_OPACITY)
      .style("pointer-events", "none")
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
    const g = lObjExtras.append("g");
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
      .attr("paint-order", "stroke")
      .attr("stroke", "rgba(6,6,26,0.6)")
      .attr("stroke-width", 2).attr("stroke-linejoin", "round")
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

  // --- Render object dots, icons, and labels via keyed joins ---
  const shownDots = projected.filter(o => o._showDot);
  const iconObjs = shownDots.filter(o => o._showIcon);

  // (1) Object groups: hit area + glow/dot, keyed by slug. Structure is
  // created once per object; per frame only positions/visibility update.
  lObjMain.selectAll("g.obj-g")
    .data(shownDots, o => o.slug)
    .join(enter => {
      const g = enter.append("g")
        .attr("class", "obj-g")
        .style("cursor", "pointer")
        .attr("data-obj-slug", o => o.slug);
      g.append("circle").attr("class", "obj-hit").attr("r", 14).attr("fill", "transparent");
      g.append("circle").attr("class", "obj-glow").attr("r", 6).attr("opacity", 0.1);
      g.append("circle").attr("class", "obj-dot").attr("r", 2.8).attr("opacity", 0.85);
      // Click handled by HTML overlay divs (see updateClickTargets)
      g.on("mouseenter", objHoverEnter).on("mouseleave", objHoverLeave);
      return g;
    })
    .attr("opacity", o => (_bigBangMode && o.bbOpacity < 1) ? o.bbOpacity : null)
    .each(function(o) {
      const g = d3.select(this);
      const dotDisplay = o._showIcon ? "none" : null;
      g.select(".obj-hit").attr("cx", o.sx).attr("cy", o.sy);
      g.select(".obj-glow").attr("cx", o.sx).attr("cy", o.sy)
        .attr("fill", o.color).attr("display", dotDisplay);
      g.select(".obj-dot").attr("cx", o.sx).attr("cy", o.sy)
        .attr("fill", o.color).attr("display", dotDisplay);
    })
    .order();

  // (2) Icons: bg disc (screen-blend cats) + fallback dot + image, keyed by
  // slug in their own layer (above the noise overlay).
  lIcons.selectAll("g.icon-g")
    .data(iconObjs, o => o.slug)
    .join(enter => {
      const g = enter.append("g").attr("class", "icon-g");
      g.each(function(o) {
        const gg = d3.select(this);
        if (iconUsesScreenBlend(o)) {
          gg.append("circle").attr("class", "icon-bg").attr("fill", "url(#icon-bg-grad)");
        }
        // Fallback dot: icons fetch on demand, so on a cold cache the
        // <image> is empty until its webp arrives — the dot keeps the
        // object visible (the loaded icon covers it).
        gg.append("circle").attr("class", "icon-fallback-dot")
          .attr("r", 2.8).attr("fill", o.color);
        gg.append("image")
          .attr("class", "obj-icon")
          .attr("data-slug", o.slug)
          .attr("href", ICON_BY_SLUG[o.slug])
          .style("mix-blend-mode", iconUsesScreenBlend(o) ? "screen" : null);
      });
      return g;
    })
    .each(function(o) {
      const gg = d3.select(this);
      const bbOp = (_bigBangMode && o.bbOpacity < 1) ? o.bbOpacity : null;
      const objIcoSize = icoSize * iconSizeMult(o);
      gg.select(".icon-bg")
        .attr("cx", o.sx).attr("cy", o.sy)
        .attr("r", objIcoSize * 0.52).attr("opacity", bbOp);
      gg.select(".icon-fallback-dot")
        .attr("cx", o.sx).attr("cy", o.sy)
        .attr("opacity", bbOp == null ? 0.85 : 0.85 * bbOp);
      gg.select(".obj-icon")
        .attr("x", o.sx - objIcoSize / 2).attr("y", o.sy - objIcoSize / 2)
        .attr("width", objIcoSize).attr("height", objIcoSize)
        .attr("opacity", bbOp);
    })
    .order();

  // (3) Labels: one text per object with paint-order (outline behind fill,
  // replacing the shadow+fill pair), keyed by slug, above icons.
  lLabels.selectAll("text.obj-label")
    .data(shownDots, o => o.slug)
    .join(enter => enter.append("text")
      .attr("class", "obj-label")
      .attr("data-label-slug", o => o.slug)
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", 10).attr("letter-spacing", "0.5px")
      .attr("paint-order", "stroke")
      .attr("stroke", "rgba(6,6,26,0.85)")
      .attr("stroke-width", 3).attr("stroke-linejoin", "round")
      .text(o => o.name))
    .attr("x", o => o.sx + o._labelPos.dx)
    .attr("y", o => o.sy + o._labelPos.dy)
    .attr("text-anchor", o => o._labelPos.anchor)
    .attr("fill", o => o.color)
    .attr("display", o => (_labelsEnabled && o._showLabel) ? null : "none");

  _lastProjected = shownDots;
}

// Screen-blend decision is static per object — shared by enter and update.
const SCREEN_BLEND_CATS = new Set(["remnant", "galaxy", "largescale", "star", "particle", "composite", "blackhole", "atomic"]);
const SCREEN_BLEND_SLUGS = new Set(["halleys-comet", "hale-bopp"]);
function iconUsesScreenBlend(o) {
  if (o.slug.includes("void")) return false;
  return SCREEN_BLEND_CATS.has(o.catKey || o.cat) || SCREEN_BLEND_SLUGS.has(o.slug);
}

// Hover handlers for the persistent object groups (datum-based, attached
// once at enter — the join rebinds fresh data to the same nodes each frame).
function objHoverEnter(e, o) {
  const icoSize = effectiveIconSize();
  const iconEl = lIcons.select(`.obj-icon[data-slug="${o.slug}"]`);
  if (iconEl.size()) {
    const hoverSize = Math.max(64, icoSize * iconSizeMult(o) * 1.5);
    iconEl.attr("width", hoverSize).attr("height", hoverSize)
      .attr("x", o.sx - hoverSize / 2).attr("y", o.sy - hoverSize / 2);
  } else {
    d3.select(this).select(".obj-glow").attr("r", 10).attr("opacity", 0.25);
    d3.select(this).select(".obj-dot").attr("r", 4);
  }
  lLabels.selectAll(`[data-label-slug="${o.slug}"]`).attr("display", null);
  showTooltip(e, o, o.cat);
}
function objHoverLeave(e, o) {
  const icoSize = effectiveIconSize();
  const iconEl = lIcons.select(`.obj-icon[data-slug="${o.slug}"]`);
  if (iconEl.size()) {
    const objIcoSize = icoSize * iconSizeMult(o);
    iconEl.attr("width", objIcoSize).attr("height", objIcoSize)
      .attr("x", o.sx - objIcoSize / 2).attr("y", o.sy - objIcoSize / 2);
  } else {
    d3.select(this).select(".obj-glow").attr("r", 6).attr("opacity", 0.1);
    d3.select(this).select(".obj-dot").attr("r", 2.8);
  }
  if (!_labelsEnabled || !o._showLabel) {
    lLabels.selectAll(`[data-label-slug="${o.slug}"]`).attr("display", "none");
  }
  hideTooltip();
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
  { logRho: 93.7,   logT: -43 },
  { logRho: 76,     logT: -36 },
  { logRho: 25,     logT: -11 },
  { logRho: 14.4,   logT: -6 },
  { logRho: 4,      logT: 0 },
  { logRho: -21,    logT: 13 },
  { logRho: -29.5,  logT: 17.64 },   // now ≈ 4.35×10¹⁷ s ≈ 13.8 Gyr
  // Future: density ruler positions are arbitrary beyond "now", but we
  // extrapolate so the hover tooltip keeps showing increasing cosmic time
  { logRho: -150.6, logT: 107.5 },   // heat death ≈ 10¹⁰⁰ years → 10^107.5 s
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
  if (logYr < 12)  return `${Number(Math.pow(10, logYr - 9).toPrecision(3))} Billion Years`;
  if (logYr < 15)  return `${Number(Math.pow(10, logYr - 12).toPrecision(3))} Trillion Years`;
  if (logYr < 18)  return `${Number(Math.pow(10, logYr - 15).toPrecision(3))} Quadrillion Years`;
  // Extreme future: use 10^n years notation
  return `10<sup>${Math.round(logYr)}</sup> Years`;
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
  hideAxisRefLine();
}

// ── Axis reference line ──

const axisRefLine = lAxisRef.append("line")
  .attr("stroke", "rgba(255,255,255,0.18)")
  .attr("stroke-width", 1)
  .attr("stroke-dasharray", "4,4")
  .style("display", "none");

function showAxisRefLine(region) {
  const d = vd();
  let x1, y1, x2, y2;

  switch (region.axis) {
    case "right":
    case "left": {
      // Horizontal line at the hovered mass/energy
      const logM = yS.invert(region.chartY);
      x1 = xS(d.x0); y1 = yS(logM);
      x2 = xS(d.x1); y2 = yS(logM);
      break;
    }
    case "bottom": {
      // Vertical line at the hovered size
      const logR = xS.invert(region.chartX);
      x1 = xS(logR); y1 = yS(d.y1);
      x2 = xS(logR); y2 = yS(d.y0);
      break;
    }
    case "top": {
      // Diagonal line along constant-density (slope 3: logM = 3·logR + b)
      const logR = xS.invert(region.chartX);
      const logRho = d.y1 - 3 * logR - DENSITY_SPHERE_C;
      const b = DENSITY_SPHERE_C + logRho;
      const seg = clipDensityLine(d, b);
      if (!seg) { hideAxisRefLine(); return; }
      x1 = xS(seg.x1); y1 = yS(seg.y1);
      x2 = xS(seg.x2); y2 = yS(seg.y2);
      break;
    }
  }

  axisRefLine
    .attr("x1", x1).attr("y1", y1)
    .attr("x2", x2).attr("y2", y2)
    .style("display", null);
}

function hideAxisRefLine() {
  axisRefLine.style("display", "none");
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
  showAxisRefLine(region);
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
    // KaTeX: display math $$...$$ → placeholder (rendered async)
    .replace(/\$\$(.+?)\$\$/gs, (_, tex) =>
      `<span class="math-pending math-display" data-tex="${tex.trim().replace(/"/g, '&quot;')}">$$${tex}$$</span>`)
    // KaTeX: inline math $...$  → placeholder (rendered async)
    .replace(/\$(.+?)\$/g, (_, tex) =>
      `<span class="math-pending" data-tex="${tex.trim().replace(/"/g, '&quot;')}">$${tex}$</span>`)
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

  if (meta.action === "start-tour" && meta.button) {
    html += `\n<a class="internal-nav" data-action="start-tour">${meta.button.trim()} →</a>`;
  } else if (meta.navigate && meta.button) {
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

// Render math placeholders in a container (lazy-loads KaTeX on first call)
async function renderMath(container) {
  const pending = container.querySelectorAll(".math-pending");
  if (pending.length === 0) return;
  const k = await loadKatex();
  pending.forEach(el => {
    const tex = el.getAttribute("data-tex");
    const isDisplay = el.classList.contains("math-display");
    try {
      const html = k.renderToString(tex, { displayMode: isDisplay, throwOnError: false });
      if (isDisplay) {
        const div = document.createElement("div");
        div.className = "katex-display";
        div.innerHTML = html;
        el.replaceWith(div);
      } else {
        const span = document.createElement("span");
        span.innerHTML = html;
        el.replaceWith(span);
      }
    } catch { /* leave as-is */ }
  });
}

const introBody = document.getElementById("intro-body");
introBody.innerHTML = simpleMarkdown(introRaw);
renderMath(introBody);

// Retro visitor counter via GoatCounter API
fetch("https://triangleofeverything.goatcounter.com/counter/TOTAL.json")
  .then(r => r.json())
  .then(d => { document.querySelectorAll("#visitor-count, #visitor-count-tour").forEach(el => { el.textContent = d.count; }); })
  .catch(() => {});

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
  if (link.dataset.action === "start-tour") {
    setSidebarOpen(false);
    startTour(0);
    return;
  }
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
    sidebarEl.classList.remove("sheet-full"); // next mobile open starts at peek
  }
  if (changed && !_isMobile) relayout();
}

// Bottom-sheet drag (mobile): the grabber strip at the top of the sheet
// drags between peek and full; dragging or flinging down closes. A short
// tap on the strip toggles peek/full.
(function initSheetDrag() {
  const grab = document.getElementById("sheet-grab");
  if (!grab) return;
  let dragging = false, startY = 0, startT = 0, dy = 0;
  grab.addEventListener("pointerdown", (e) => {
    if (!_isMobile) return;
    dragging = true;
    startY = e.clientY;
    startT = performance.now();
    dy = 0;
    sidebarEl.style.transition = "none";
    grab.setPointerCapture(e.pointerId);
  });
  grab.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    dy = e.clientY - startY;
    // Follow the finger; resist upward drag past the top a little
    const off = dy < 0 ? dy / 3 : dy;
    sidebarEl.style.transform = `translateY(${off}px)`;
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    sidebarEl.style.transition = "";
    sidebarEl.style.transform = "";
    const vel = dy / Math.max(1, performance.now() - startT); // px/ms, + = down
    const isFull = sidebarEl.classList.contains("sheet-full");
    if (Math.abs(dy) < 8) {
      sidebarEl.classList.toggle("sheet-full");           // tap: toggle state
    } else if (dy < -50) {
      sidebarEl.classList.add("sheet-full");              // drag up: expand
    } else if (dy > 70 || vel > 0.55) {
      if (isFull) sidebarEl.classList.remove("sheet-full"); // full → peek
      else setSidebarOpen(false);                           // peek → closed
    }
  };
  grab.addEventListener("pointerup", endDrag);
  grab.addEventListener("pointercancel", endDrag);
})();

function relayout() {
  if (!_booted) return;

  const centerLogR = xS.invert(cw / 2);
  const centerLogM = yS.invert(ch / 2);
  const savedK = currentK;

  measure();

  svg.attr("width", W).attr("height", H);
  svg.select("rect.svg-bg").attr("width", W).attr("height", H);
  defs.select("#clip rect").attr("width", cw).attr("height", ch);
  clip.selectAll("rect.bg-rect").attr("width", cw).attr("height", ch);
  chart.attr("transform", `translate(${margin.left},${margin.top})`);
  chart.select("rect:last-of-type").attr("width", cw).attr("height", ch);

  xBase.domain([viewXMin, viewXMax]).range([0, cw]);
  yBase.domain([viewYMin, viewYMax]).range([ch, 0]);
  updateBgGradients();

  const tx = cw / 2 - xBase(centerLogR) * savedK;
  const ty = ch / 2 - yBase(centerLogM) * savedK;
  svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(savedK));

  miniSvg.attr("transform",
    `translate(${W - MINIMAP_SIZE - MINIMAP_PAD - margin.right}, ${margin.top + MINIMAP_PAD})`);
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
    renderMath(sbDesc);
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
  // sidebarName lets an object show a fuller title on click than its
  // (shorter) graph label — e.g. "Singularity" on the chart, "Big Bang
  // Singularity" in the panel.
  sbName.textContent = obj.sidebarName || obj.name;
  sbName.style.color = objColor;

  // Show icon in sidebar header if available, otherwise colored dot
  const slug = obj.slug || nameToSlug(obj.name);
  const iconUrl = _iconsEnabled && ICON_BY_SLUG[slug];
  if (iconUrl) {
    sbDot.style.background = "none";
    sbDot.style.boxShadow = "none";
    sbDot.innerHTML = `<img src="${iconUrl}" alt="" style="width:14px;height:14px;display:block;">`;
  } else {
    sbDot.style.background = objColor;
    sbDot.style.boxShadow = "";
    sbDot.innerHTML = "";
  }
  sbDot.style.color = objColor;
  sbCategory.textContent = catKey;

  // Display object image or placeholder (fetched on demand via <img src>)
  const imgUrl = IMG_BY_SLUG[slug];
  const imgMeta = imageManifest[slug];
  // For particles with a Hiperspirograph state, embed the live spirograph instead
  const spiroState = hiperspirographStates[slug];
  if (spiroState) {
    sbImage.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.src = `/hiperspirograph.html?embed=1#${spiroState}`;
    iframe.style.cssText = "width:100%;aspect-ratio:1/1;border:0;display:block;background:#000;border-radius:8px;";
    iframe.loading = "lazy";
    iframe.title = `${obj.name} — interactive 5D spirograph`;
    sbImage.appendChild(iframe);
    const explore = document.createElement("a");
    explore.className = "sb-spiro-explore";
    explore.href = `/hiperspirograph.html#${spiroState}`;
    explore.target = "_blank";
    explore.rel = "noopener";
    explore.textContent = "✨ Explore multidimensional strings →";
    sbImage.appendChild(explore);
  } else if (imgUrl) {
    sbImage.innerHTML = "";
    const img = document.createElement("img");
    img.alt = obj.name;
    sbImage.appendChild(img);
    img.src = imgUrl;
    if (imgMeta) {
      const credit = document.createElement("a");
      credit.className = "sb-image-credit";
      credit.href = imgMeta.source;
      credit.target = "_blank";
      credit.rel = "noopener";
      credit.textContent = `${imgMeta.credit} · ${imgMeta.license}`;
      sbImage.appendChild(credit);
    }
    // Atoms whose sidebar image is a sphere-packed spirograph composite get an
    // invite to open the spirograph itself. No preset — landing on the default.
    if (STRINGS_ATOM_SLUGS.has(slug)) {
      const explore = document.createElement("a");
      explore.className = "sb-spiro-explore";
      explore.href = "/hiperspirograph.html";
      explore.target = "_blank";
      explore.rel = "noopener";
      explore.textContent = "✨ Explore multidimensional strings →";
      sbImage.appendChild(explore);
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
  if (obj.logR > DE_SITTER_LOG_R) {
    zone = "Beyond cosmic horizon"; zoneClass = "desitter";
  } else if (obj.logM > schwarzschildM(obj.logR)) {
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
      <tr><td colspan="2" class="sb-log-note">(10<sup>${(obj.logR - 2).toFixed(1)}</sup> m · 10<sup>${(obj.logM - 3).toFixed(1)}</sup> kg)</td></tr>`;
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
  renderMath(sbDesc);

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

// ─── Click detection ───────────────────────────────────────────
// Object/label clicks are handled by HTML overlay divs (see
// updateClickTargets above). This approach replaced the old SVG
// click handlers which were constantly broken by D3-zoom's pointer
// capture. See the extensive comment block above updateClickTargets
// for the full explanation.
//
// What remains here: axis-unit-link clicks (still SVG-based) and
// click-on-empty-space to close the sidebar.
// ───────────────────────────────────────────────────────────────

document.addEventListener("pointerdown", (e) => {
  const chartEl = document.getElementById("chart");
  if (!chartEl?.contains(e.target)) return;
  // Axis unit links still live in SVG — let their clicks through
  if (e.target.closest?.(".axis-unit-link")) {
    e.stopImmediatePropagation();
  }
}, true);

document.addEventListener("click", (e) => {
  // Ignore the touch compatibility click that follows a handled tap — it
  // targets the gesture surface, and the tap handler has already acted.
  // Without this, tapping an object would open the sidebar and this handler
  // would immediately close it again.
  if (e.target.classList?.contains("gesture-surface")) return;

  // Axis unit link click
  const labelEl = e.target.closest?.(".axis-unit-link");
  if (labelEl) {
    const slug = labelEl.getAttribute("data-slug");
    const name = labelEl.getAttribute("data-name");
    if (slug && name) {
      _sidebarManuallyExpanded = false;
      openInfoPanel(slug, name);
      setSidebarOpen(true);
      return;
    }
  }

  // Click on empty chart space — close sidebar
  const chartEl = document.getElementById("chart");
  if (chartEl?.contains(e.target) && !e.target.closest?.("#click-targets")) {
    selectedObj = null;
    drawHighlight();
    if (sidebarEl.classList.contains("open")) {
      if (_sidebarManuallyExpanded) {
        closeSidebar();
      } else {
        setSidebarOpen(false);
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

  // Grid-unit mode: where decade lines are anchored, and how numbers read.
  const cfg = gridCfg();
  const firstX = (lo, s) => firstAligned(lo, s, cfg.xRef);
  const firstY = (lo, s) => firstAligned(lo, s, cfg.yRef);

  // ─── TOP: Diagonal density labels ──────────────────────────
  const densityAngle = screenAngle(3);
  const diagDx = 1;
  const diagDy = 3;
  const diagNorm = Math.sqrt(diagDx * diagDx + diagDy * diagDy);
  const diagLen = 15;

  let lastDensityLabelP = Infinity;
  for (let logRho = -54; logRho <= 108; logRho += 9) {
    const b = DENSITY_SPHERE_C + logRho;
    const logR_top = (d.y1 - b) / 3;
    if (logR_top < d.x0 - 1 || logR_top > d.x1 + 1) continue;
    const p = px(logR_top);
    if (p < 0 || p > cw) continue;
    // Zoomed out, consecutive 9-decade steps land a few px apart and the
    // rotated numbers pile into an unreadable bundle — enforce min spacing.
    if (Math.abs(lastDensityLabelP - p) < 34) continue;
    lastDensityLabelP = p;

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
      .attr("class", "axis-label")
      .attr("x", tx).attr("y", ty)
      .attr("text-anchor", "start")
      .attr("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
      .attr("font-size", 10).attr("font-weight", 700)
      .attr("fill", "rgba(255,255,255,0.3)")
      .attr("transform", `rotate(${densityAngle},${tx},${ty})`)
      .text(gL);
  }

  axT.append("text").attr("x", cw - 5).attr("y", -38).attr("text-anchor", "end")
    .attr("class", "axis-title").text("DENSITY");
  // On mobile the pill stack occupies the top-left corner — shift TIME clear.
  // The top subtitles collide with the rotated density numbers on a narrow
  // screen, so they're desktop-only.
  const timeTitleX = _isMobile ? 62 : 5;
  axT.append("text").attr("x", timeTitleX).attr("y", -38).attr("text-anchor", "start")
    .attr("class", "axis-title").attr("letter-spacing", "3px").text("TIME");
  if (!_isMobile) {
    axT.append("text").attr("x", cw - 5).attr("y", -26).attr("text-anchor", "end")
      .attr("class", "axis-subtitle").text("10ⁿ g/L");
    axT.append("text").attr("x", timeTitleX).attr("y", -26).attr("text-anchor", "start")
      .attr("class", "axis-subtitle").text("10ⁿ s since Big Bang");
  }

  // ─── BOTTOM: Big log numbers + two rows of width units ────
  axB.attr("transform", `translate(0,${ch})`);

  if (minorStep !== null && minorStep > 0) {
    for (let v = firstX(d.x0, minorStep); v <= d.x1; v = +(v + minorStep).toFixed(6)) {
      const kx = v - cfg.xRef;
      if (Math.abs(kx % axisStep) < 0.01 || Math.abs(kx % axisStep - axisStep) < 0.01) continue;
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
    const startX = Math.floor(d.x0 - cfg.xRef), endX = Math.ceil(d.x1 - cfg.xRef);
    for (let i = startX; i <= endX; i++) {
      for (const n of logDigits) {
        const v = cfg.xRef + i + Math.log10(n);
        if (v < d.x0 || v > d.x1) continue;
        const p = px(v);
        if (p < -1 || p > cw + 1) continue;
        axB.append("line").attr("x1", p).attr("y1", 0).attr("x2", p).attr("y2", 3)
          .attr("stroke", "rgba(255,255,255,0.10)");
        axB.append("text").attr("x", p).attr("y", 14).attr("text-anchor", "middle")
          .attr("class", "axis-label axis-minor").attr("font-size", 9).attr("font-weight", 400)
          .attr("fill", "rgba(255,255,255,0.35)")
          .text(n);
      }
    }
  }

  for (let v = firstX(d.x0, axisStep); v <= d.x1; v += axisStep) {
    const p = px(v);
    if (p < -1 || p > cw + 1) continue;
    axB.append("line").attr("x1", p).attr("y1", 0).attr("x2", p).attr("y2", 5)
      .attr("stroke", "rgba(255,255,255,0.25)");
    axB.append("text").attr("x", p).attr("y", 16).attr("text-anchor", "middle")
      .attr("class", "axis-label").attr("font-size", 13).attr("font-weight", 700)
      .text(cfg.xNum(v));
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
        .attr("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif").attr("font-size", 8)
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
        .attr("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif").attr("font-size", 7.5)
        .attr("fill", "rgba(255,130,130,0.45)")
        .attr("transform", `rotate(45,${p + 2},50)`)
        .text(u.label);
      lastRow2Px = p;
    }
  });

  axB.append("text").attr("x", cw / 2).attr("y", 65).attr("text-anchor", "middle")
    .attr("class", "axis-title").text("WIDTH");
  axB.append("text").attr("x", cw / 2).attr("y", 78).attr("text-anchor", "middle")
    .attr("class", "axis-subtitle").text(cfg.bottomSub);

  // ─── LEFT: Energy / Temperature (capped at Planck energy) ─
  const leftMax = PLANCK_LOG_M;

  if (minorStep !== null && minorStep > 0) {
    for (let v = firstY(d.y0, minorStep); v <= Math.min(d.y1, leftMax); v = +(v + minorStep).toFixed(6)) {
      const ky = v - cfg.yRef;
      if (Math.abs(ky % axisStep) < 0.01 || Math.abs(ky % axisStep - axisStep) < 0.01) continue;
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
    const startY = Math.floor(d.y0 - cfg.yRef), endY = Math.ceil(Math.min(d.y1, leftMax) - cfg.yRef);
    for (let i = startY; i <= endY; i++) {
      for (const n of logDigitsY) {
        const v = cfg.yRef + i + Math.log10(n);
        if (v < d.y0 || v > leftMax) continue;
        const p = py(v);
        if (p < -1 || p > ch + 1) continue;
        axL.append("line").attr("x1", -3).attr("y1", p).attr("x2", 0).attr("y2", p)
          .attr("stroke", "rgba(255,255,255,0.10)");
        axL.append("text").attr("x", -10).attr("y", p + 3.5).attr("text-anchor", "middle")
          .attr("class", "axis-label axis-minor").attr("font-size", 9).attr("font-weight", 400)
          .attr("fill", "rgba(255,255,255,0.35)")
          .text(n);
      }
    }
  }

  for (let v = firstY(d.y0, axisStep); v <= Math.min(d.y1, leftMax); v += axisStep) {
    const p = py(v);
    if (p < -1 || p > ch + 1) continue;
    axL.append("line").attr("x1", -5).attr("y1", p).attr("x2", 0).attr("y2", p)
      .attr("stroke", "rgba(255,255,255,0.25)");
    axL.append("text").attr("x", -25).attr("y", p + 4.5).attr("text-anchor", "middle")
      .attr("class", "axis-label").attr("font-size", 11).attr("font-weight", 700)
      .text(cfg.energyNum(v));
  }

  const leftCompact = _isSidebarOpen;
  // Unit labels sit OUTBOARD of the exponent-number column (which is at x=-25)
  // so the two don't overlap. Energy/temperature names get their own column.
  const unitX = leftCompact ? -34 : -42;
  const titleY = leftCompact ? -45 : -40;

  // The outboard unit-link column and rotated titles need a wide margin —
  // the compact mobile ruler shows exponent numbers only.
  let lastEnergyPy = -Infinity;
  if (!_isMobile) ENERGY_UNITS.forEach(u => {
    if (u.logM < d.y0 || u.logM > Math.min(d.y1, leftMax)) return;
    const p = py(u.logM);
    if (p < 2 || p > ch - 2) return;
    axL.append("line").attr("x1", -3).attr("y1", p).attr("x2", 0).attr("y2", p)
      .attr("stroke", "rgba(255,100,100,0.4)").attr("stroke-dasharray", "2 2");
    if (Math.abs(p - lastEnergyPy) >= minUnitPx && u.slug) {
      const lines = u.label.split("\n");
      if (lines.length > 1) {
        const txt = axL.append("text").attr("class", "axis-unit-link").attr("data-slug", u.slug).attr("data-name", u.label)
          .attr("x", unitX).attr("y", p + 3).attr("text-anchor", "end")
          .attr("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif").attr("font-size", leftCompact ? 8.5 : 9.5)
          .attr("fill", "rgba(255,150,150,0.92)");
        lines.forEach((line, li) => {
          txt.append("tspan").attr("x", unitX).attr("dy", li === 0 ? 0 : "1.1em").text(line);
        });
      } else {
        axL.append("text").attr("class", "axis-unit-link").attr("data-slug", u.slug).attr("data-name", u.label)
          .attr("x", unitX).attr("y", p + 3).attr("text-anchor", "end")
          .attr("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif").attr("font-size", leftCompact ? 8.5 : 9.5)
          .attr("fill", "rgba(255,150,150,0.92)")
          .text(u.label);
      }
      lastEnergyPy = p;
    }
  });

  const leftTitleY = _isMobile ? -44 : titleY;
  axL.append("text").attr("transform", "rotate(-90)").attr("x", -ch / 2).attr("y", leftTitleY)
    .attr("text-anchor", "middle").attr("class", "axis-title").text(cfg.leftTitle);
  if (!_isMobile) {
    axL.append("text").attr("transform", "rotate(-90)").attr("x", -ch / 2).attr("y", titleY + 14)
      .attr("text-anchor", "middle").attr("class", "axis-subtitle").text(cfg.leftSub);
  }

  // ─── RIGHT: Mass ──────────────────────────────────────────
  axR.attr("transform", `translate(${cw},0)`);

  if (minorStep !== null && minorStep > 0) {
    for (let v = firstY(d.y0, minorStep); v <= d.y1; v = +(v + minorStep).toFixed(6)) {
      const ky = v - cfg.yRef;
      if (Math.abs(ky % axisStep) < 0.01 || Math.abs(ky % axisStep - axisStep) < 0.01) continue;
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
    const startY = Math.floor(d.y0 - cfg.yRef), endY = Math.ceil(d.y1 - cfg.yRef);
    for (let i = startY; i <= endY; i++) {
      for (const n of logDigitsR) {
        const v = cfg.yRef + i + Math.log10(n);
        if (v < d.y0 || v > d.y1) continue;
        const p = py(v);
        if (p < -1 || p > ch + 1) continue;
        axR.append("line").attr("x1", 0).attr("y1", p).attr("x2", 3).attr("y2", p)
          .attr("stroke", "rgba(255,255,255,0.10)");
        axR.append("text").attr("x", 14).attr("y", p + 3.5).attr("text-anchor", "middle")
          .attr("class", "axis-label axis-minor").attr("font-size", 9).attr("font-weight", 400)
          .attr("fill", "rgba(255,255,255,0.35)")
          .text(n);
      }
    }
  }

  for (let v = firstY(d.y0, axisStep); v <= d.y1; v += axisStep) {
    const p = py(v);
    if (p < -1 || p > ch + 1) continue;
    axR.append("line").attr("x1", 0).attr("y1", p).attr("x2", 5).attr("y2", p)
      .attr("stroke", "rgba(255,255,255,0.25)");
    axR.append("text").attr("x", 28).attr("y", p + 4.5).attr("text-anchor", "middle")
      .attr("class", "axis-label").attr("font-size", 13).attr("font-weight", 700)
      .text(cfg.massNum(v));
  }

  let lastMassUnitPy = -Infinity;
  if (!_isMobile) MASS_UNITS.forEach(u => {
    if (u.logM < d.y0 || u.logM > d.y1) return;
    const p = py(u.logM);
    if (p < 2 || p > ch - 2) return;
    axR.append("line").attr("x1", 0).attr("y1", p).attr("x2", 3).attr("y2", p)
      .attr("stroke", "rgba(255,100,100,0.4)").attr("stroke-dasharray", "2 2");
    if (Math.abs(p - lastMassUnitPy) >= minUnitPx && u.slug) {
      axR.append("text").attr("class", "axis-unit-link").attr("data-slug", u.slug).attr("data-name", u.label)
        .attr("x", 44).attr("y", p + 3).attr("text-anchor", "start")
        .attr("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif").attr("font-size", 9.5)
        .attr("fill", "rgba(255,150,150,0.92)")
        .text(u.label);
      lastMassUnitPy = p;
    }
  });

  axR.append("text").attr("transform", "rotate(90)").attr("x", ch / 2).attr("y", _isMobile ? -46 : -114)
    .attr("text-anchor", "middle").attr("class", "axis-title").text("MASS");
  if (!_isMobile) {
    axR.append("text").attr("transform", "rotate(90)").attr("x", ch / 2).attr("y", -102)
      .attr("text-anchor", "middle").attr("class", "axis-subtitle").text(cfg.rightSub);
  }
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

function connectionOpacity(cp, view = null) {
  const [zMin, zMax] = cp.zoomRange;
  if (currentK < zMin * 0.5) return 0;
  if (currentK > zMax) return 0;
  let fade = 1;
  if (currentK < zMin) fade = (currentK - zMin * 0.5) / (zMin * 0.5);
  if (cp.neighborhood) {
    const d = view || vd();
    const nb = cp.neighborhood;
    if (d.x1 < nb.x[0] || d.x0 > nb.x[1] || d.y1 < nb.y[0] || d.y0 > nb.y[1]) return 0;
    const ox = Math.max(0, Math.min(d.x1, nb.x[1]) - Math.max(d.x0, nb.x[0]));
    const oy = Math.max(0, Math.min(d.y1, nb.y[1]) - Math.max(d.y0, nb.y[0]));
    const viewArea = (d.x1 - d.x0) * (d.y1 - d.y0);
    fade *= viewArea > 0 ? Math.min(1, (ox * oy) / (viewArea * 0.2)) : 0;
  }
  return Math.max(0, Math.min(1, fade));
}

// Shorter dot trails on phones. Read live at dot-pool rebuild time —
// _isMobile changes on resize/rotation and the glow gate below reads it live.
function clusterDots() { return _isMobile ? 2 : 5; }
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
let _animSpeed = 1; // global animation-speed multiplier (Z slower / X faster)

function pauseAnimOnInteract() {
  if (_animDisabled) return;
  _animPaused = true;
  clearTimeout(_animResumeTimer);
  _animResumeTimer = setTimeout(() => { _animPaused = false; }, 1000);
}

function screenPathLength(cp, ppu) {
  ensureConnGeometry(cp);
  // Data-space arc length × current px-per-unit (the view is equal-scale in
  // both axes, so this equals the on-screen arc length). Pure math, no DOM.
  if (cp._dataLen > 0) return Math.max(1, cp._dataLen * (ppu ?? Math.abs(px(1) - px(0))));
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

// Data-space path generators (no px/py): Catmull-Rom and the bezier formula
// are affine-invariant, so a curve built from log coordinates and mapped
// through the scales per frame is identical to one rebuilt in screen space.
// These are the single source of truth for connection curve shape — the
// screen-space generators in drawConnections share connCurve/connBezierCtrl.
const connCurve = d3.curveCatmullRom.alpha(0.5);
const dataCurveGen = d3.line()
  .x(p => p.logR).y(p => p.logM)
  .curve(connCurve);

// "1:2 rectangle at 45°" control points for decay/combines beziers,
// in data space (see the comment in drawConnections).
function connBezierCtrl(A, B) {
  const H = (B.logR - A.logR) / 2;
  const V = (A.logM - B.logM) / 2;
  return { c1r: A.logR + H, c1m: A.logM + V, c2r: B.logR + H, c2m: A.logM - V };
}

function bezierDataPathGen(pts) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].logR},${pts[0].logM}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const c = connBezierCtrl(pts[i], pts[i + 1]);
    d += ` C ${c.c1r},${c.c1m} ${c.c2r},${c.c2m} ${pts[i + 1].logR},${pts[i + 1].logM}`;
  }
  return d;
}

/** Build a path's curve geometry on first use: a detached data-space path
 *  element plus arc-length samples for cheap per-frame positioning. Lazy so
 *  boot pays nothing; sample count scales with curve length; getPathScreenPos
 *  switches to the exact path element at deep zoom where sample chords would
 *  visibly cut corners. */
function ensureConnGeometry(cp) {
  if (cp._samples) return;
  const isBezier = cp.family === "decay" || cp.family === "combines";
  const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
  probe.setAttribute("d", isBezier ? bezierDataPathGen(cp.points) : dataCurveGen(cp.points));
  const dataLen = probe.getTotalLength();
  const N = Math.min(128, Math.max(24, Math.ceil(dataLen * 4)));
  const sx = new Float64Array(N + 1), sy = new Float64Array(N + 1);
  for (let i = 0; i <= N; i++) {
    const pt = probe.getPointAtLength(dataLen * i / N);
    sx[i] = pt.x; sy[i] = pt.y;
  }
  cp._probe = probe;
  cp._dataLen = dataLen;
  cp._samples = { sx, sy };
}

// The dot animation loop parks itself (returns without re-queuing) whenever
// nothing needs animating; these restart it when conditions change.
function connAnimActive() {
  return !_animDisabled && !document.hidden &&
    _connPaths != null && _connPaths.some(cp => cp._visible);
}
function scheduleConnAnim() {
  if (_connAnimId == null && connAnimActive()) {
    _connLastTime = performance.now();
    _connAnimId = requestAnimationFrame(animateConnections);
  }
}
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) scheduleConnAnim();
});

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
      _samples: null,   // curve geometry built lazily by ensureConnGeometry()
      _probe: null,
      _dataLen: 0,
      _screenLen: 1,
      _visible: false,
      _opacity: 0,
    };
  });
  // Warm curve geometry off the boot critical path (~2,500 getPointAtLength
  // calls if done eagerly); ensureConnGeometry() also builds on demand the
  // moment a path is actually used.
  const warm = () => _connPaths && _connPaths.forEach(ensureConnGeometry);
  if (typeof requestIdleCallback === "function") requestIdleCallback(warm, { timeout: 3000 });
  else setTimeout(warm, 1500);
  scheduleConnAnim();
}

function drawConnections() {
  lArrows.selectAll("*").remove();
  _connDotsStale = true;
  if (!_connPaths) return;

  // Screen-space serializers of the shared curve shape (connCurve /
  // connBezierCtrl are the single source of truth — see their definitions).
  const curveLineGen = d3.line()
    .x(p => px(p.logR)).y(p => py(p.logM))
    .curve(connCurve);

  // Bezier path generator for decay/combines paths:
  // All points are anchors; control points come from connBezierCtrl's
  // "1:2 rectangle at 45°" formula, serialized through px()/py().
  function bezierPathGen(pts) {
    if (pts.length < 2) return "";
    let d = `M ${px(pts[0].logR)},${py(pts[0].logM)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const B = pts[i + 1];
      const c = connBezierCtrl(pts[i], B);
      d += ` C ${px(c.c1r)},${py(c.c1m)} ${px(c.c2r)},${py(c.c2m)} ${px(B.logR)},${py(B.logM)}`;
    }
    return d;
  }

  const view = vd(); // hoisted: identical for every path this draw
  _connPaths.forEach(cp => {
    cp._opacity = connectionOpacity(cp, view);
    cp._visible = cp._opacity > 0.01;

    if (!cp._visible) return;

    // Decay and combines paths use bezier curves (alternating anchor/control points)
    const isBezier = cp.family === "decay" || cp.family === "combines";

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
  scheduleConnAnim();
}

/** Per-frame stand-in for drawConnections during an active zoom/pan: updates
 *  visibility/opacity (cheap math) so the dots track the view correctly, but
 *  leaves the hover lines/hit paths alone — they're invisible mid-gesture and
 *  get rebuilt by the full drawConnections() on gesture end. */
function updateConnectionOpacities() {
  if (!_connPaths) return;
  let changed = false;
  const view = vd(); // hoisted: identical for every path this frame
  _connPaths.forEach(cp => {
    cp._opacity = connectionOpacity(cp, view);
    const vis = cp._opacity > 0.01;
    if (vis !== cp._visible) { cp._visible = vis; changed = true; }
  });
  if (changed) {
    _connDotsStale = true;
    scheduleConnAnim();
  }
}

function getPathScreenPos(cp, t, ppu) {
  ensureConnGeometry(cp);
  const s = cp._samples;
  if (s) {
    const tt = Math.max(0, Math.min(1, t));
    const perUnit = ppu ?? Math.abs(px(1) - px(0));
    // At deep zoom a sample chord spans many screen px and linear
    // interpolation would visibly cut curve corners — switch to the exact
    // path element (few paths/dots are visible at those zoom levels).
    if (cp._probe && (cp._dataLen * perUnit) / (s.sx.length - 1) > 24) {
      const pt = cp._probe.getPointAtLength(tt * cp._dataLen);
      return [px(pt.x), py(pt.y)];
    }
    // Interpolate the pre-sampled data-space curve, then map to screen —
    // dots always follow the *current* transform (never stranded mid-gesture).
    const u = tt * (s.sx.length - 1);
    const i = Math.floor(u), f = u - i;
    const j = Math.min(i + 1, s.sx.length - 1);
    return [px(s.sx[i] + (s.sx[j] - s.sx[i]) * f), py(s.sy[i] + (s.sy[j] - s.sy[i]) * f)];
  }
  const pos = pathPosAt(cp.points, cp.dists, t);
  return [px(pos.logR), py(pos.logM)];
}

function applyEmWave(cp, t, sx, sy, timestamp, ppu) {
  if (cp.family !== "spectrum") return [sx, sy];
  const tFwd = Math.min(1, t + 0.005);
  const [fsx, fsy] = getPathScreenPos(cp, tFwd, ppu);
  const tdx = fsx - sx, tdy = fsy - sy;
  const tlen = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
  const perpX = -tdy / tlen, perpY = tdx / tlen;

  const freq = 28 * Math.max(0.12, 1 - t * 0.88);
  const amplitude = 6 + t * 10;
  const phase = t * freq * Math.PI * 2 - timestamp * 0.0004;
  return [sx + perpX * Math.sin(phase) * amplitude, sy + perpY * Math.sin(phase) * amplitude];
}

function animateConnections(timestamp) {
  if (!connAnimActive()) {
    // Park the loop — no re-queue. scheduleConnAnim() restarts it when a
    // path becomes visible, the tab becomes visible, or animation re-enables.
    lConnDots.selectAll("*").remove();
    _connDotEls = [];
    _connDotsStale = true;
    _connAnimId = null;
    return;
  }

  const dt = Math.min((timestamp - _connLastTime) / 1000, 0.1) * _animSpeed;
  _connLastTime = timestamp;
  // px-per-data-unit is constant within a frame — hoist it for every
  // screenPathLength/getPathScreenPos call below.
  const ppu = Math.abs(px(1) - px(0));

  if (_connDotsStale) {
    lConnDots.selectAll("*").remove();
    _connDotEls = [];
    const container = lConnDots.node();
    const cd = clusterDots();
    _connPaths.forEach((cp, pi) => {
      if (!cp._visible) return;
      for (let i = 0; i < cp.style.dotCount; i++) {
        const group = [];
        for (let c = 0; c < cd; c++) {
          const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          // Glow filter is a per-frame blur pass — desktop only; phones get crisp dots
          if (c === 0 && !_isMobile && (cp.family === "spectrum" || cp.family === "evolution")) el.setAttribute("filter", "url(#conn-glow)");
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
      cp._screenLen = screenPathLength(cp, ppu);
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

      const headFactor = 1 - idx / group.length;
      const sizeFactor = isMeteor
        ? (0.15 + 0.85 * headFactor * headFactor)  // sharper falloff for comet tail
        : (0.5 + 0.5 * headFactor);
      const opacityMult = isMeteor
        ? (0.05 + 0.95 * headFactor * headFactor)   // brighter head, dimmer tail
        : (0.3 + 0.7 * headFactor);

      let [sx, sy] = getPathScreenPos(cp, t, ppu);
      [sx, sy] = applyEmWave(cp, t, sx, sy, timestamp, ppu);

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
  .attr("class", "minimap-group")
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

/** Draw a permanent low-res background from the smallest tile level (z0).
 *  This ensures the background image is always visible, even before
 *  higher-res tiles load. Redrawn on zoom like regular tiles. */
function drawBaseTiles() {
  lTilesBase.selectAll("*").remove();
  if (!_bgTilesEnabled || !tileMeta) return;

  const { tileSize, levels } = tileMeta;
  const base = levels[0]; // lowest resolution level
  const ppu = tileMeta.pxPerUnitX;
  const imgDataW = tileMeta.imgW / ppu;
  const imgDataH = tileMeta.imgH / ppu;

  const PLANCK_FRAC_X = 2114 / tileMeta.imgW;
  const PLANCK_FRAC_Y = 5960 / tileMeta.imgH;
  const imgLogRmin = PLANCK_LOG_R - PLANCK_FRAC_X * imgDataW;
  const imgLogMmax = PLANCK_LOG_M + PLANCK_FRAC_Y * imgDataH;

  const dppX = imgDataW / base.w;
  const dppY = imgDataH / base.h;

  for (let r = 0; r < base.rows; r++) {
    for (let c = 0; c < base.cols; c++) {
      const tileW = (c === base.cols - 1) ? (base.w - c * tileSize) : tileSize;
      const tileH = (r === base.rows - 1) ? (base.h - r * tileSize) : tileSize;
      const tLogRmin = imgLogRmin + c * tileSize * dppX;
      const tLogRmax = tLogRmin + tileW * dppX;
      const tLogMmax = imgLogMmax - r * tileSize * dppY;
      const tLogMmin = tLogMmax - tileH * dppY;

      const sx = px(tLogRmin);
      const sy = py(tLogMmax);
      const sw = px(tLogRmax) - sx;
      const sh = py(tLogMmin) - sy;

      if (sw < 1 || sh < 1) continue;

      const href = `/tiles/z${base.z}/tile_${c}_${r}.webp`;
      if (!_tileCache.has(href)) {
        const img = new Image();
        img.src = href;
        _tileCache.set(href, img);
      }

      lTilesBase.append("image")
        .attr("href", href)
        .attr("x", sx).attr("y", sy)
        .attr("width", sw).attr("height", sh)
        .attr("preserveAspectRatio", "none")
        .attr("image-rendering", "auto");
    }
  }
}

async function loadTileMeta() {
  try {
    const response = await fetch("/tiles/meta.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    tileMeta = await response.json();
    drawBaseTiles(); // draw low-res background immediately
    redraw();
  } catch (error) {
    console.warn("Failed to load tile metadata:", error);
  }
}

// =============================================================
// Full redraw
// =============================================================

function redraw() {
  drawBaseTiles();
  drawTiles();
  redrawVectors();
  scheduleClickTargets();
}

// =============================================================
// HTML click targets overlay
// =============================================================
// ─── WHY THIS EXISTS (read before changing!) ───────────────────
//
// Clicking on SVG objects was EXTREMELY fragile and broke repeatedly.
// The root cause: D3-zoom registers a capture-phase pointerdown handler
// that calls setPointerCapture() on the SVG. Once captured, D3 suppresses
// the subsequent "click" event entirely. This means:
//
//   1. If the user clicks on a transparent SVG circle (hit area), D3-zoom
//      captures the pointer BEFORE the click fires, so g.on("click")
//      never triggers.
//   2. Workarounds like capture-phase pointerdown + distance tracking
//      broke whenever the rendering changed (new layers, different
//      stacking order, icons above noise, etc.)
//   3. Every refactor of the icon/label layer structure broke clicks
//      in a different way.
//
// THE SOLUTION: Don't fight D3-zoom at all. Instead, after zoom/pan
// settles (500ms debounce), we overlay invisible HTML <div> elements
// positioned over each visible object and label. These divs:
//
//   - Sit in a fixed-position container ABOVE the SVG (z-index: 5)
//   - Have pointer-events: all, so they intercept clicks normally
//   - Are completely invisible (no background, no border)
//   - Are cleared instantly when zoom/pan starts (so they don't
//     interfere with D3-zoom's drag/pan behavior)
//   - Are re-created 500ms after zoom/pan ends
//
// This approach is robust because HTML click handling is completely
// independent of SVG rendering. No matter how the SVG layers are
// restructured, clicks will keep working.
//
// DO NOT: re-add click handlers to SVG elements. It will seem to
// work at first but will break in subtle ways when D3-zoom is active.
// ────────────────────────────────────────────────────────────────

const clickTargetContainer = document.getElementById("click-targets");
let _clickTargetTimer = null;

function clearClickTargets() {
  clickTargetContainer.innerHTML = "";
}

function scheduleClickTargets() {
  clearTimeout(_clickTargetTimer);
  clearClickTargets();
  _clickTargetTimer = setTimeout(updateClickTargets, 500);
}

// Hit-target size for an object, shared by the HTML click targets (mouse)
// and the touch tap hit-test so the two input paths never drift.
function objectHitSizePx(o, baseIco) {
  const hasIcon = _iconsEnabled && ICON_BY_SLUG[o.slug];
  return hasIcon ? baseIco * iconSizeMult(o) : 14; // 14 matches the dot hit-area radius
}

function updateClickTargets() {
  clearClickTargets();
  if (!_lastProjected) return;

  const baseIco = effectiveIconSize();
  _lastProjected.forEach(o => {
    const size = objectHitSizePx(o, baseIco);

    // Convert SVG coords to page coords
    const pageX = o.sx + margin.left;
    const pageY = o.sy + margin.top;

    const div = document.createElement("div");
    div.className = "click-target";
    div.style.left = (pageX - size / 2) + "px";
    div.style.top = (pageY - size / 2) + "px";
    div.style.width = size + "px";
    div.style.height = size + "px";
    div.dataset.slug = o.slug;

    div.addEventListener("click", (e) => {
      e.stopPropagation();
      _sidebarManuallyExpanded = false;
      openSidebar(o);
      setSidebarOpen(true);
    });

    div.addEventListener("mouseenter", (e) => {
      // Trigger SVG hover effects
      const iconEl = lIcons.select(`.obj-icon[data-slug="${o.slug}"]`);
      if (iconEl.size()) {
        const hoverSize = Math.max(64, baseIco * iconSizeMult(o) * 1.5);
        iconEl.attr("width", hoverSize).attr("height", hoverSize)
          .attr("x", o.sx - hoverSize / 2).attr("y", o.sy - hoverSize / 2);
      }
      lLabels.selectAll(`[data-label-slug="${o.slug}"]`).attr("display", null);
      showTooltip(e, o, o.cat);
    });

    div.addEventListener("mouseleave", () => {
      const iconEl = lIcons.select(`.obj-icon[data-slug="${o.slug}"]`);
      if (iconEl.size()) {
        const objS = baseIco * iconSizeMult(o);
        iconEl.attr("width", objS).attr("height", objS)
          .attr("x", o.sx - objS / 2).attr("y", o.sy - objS / 2);
      }
      if (!_labelsEnabled || !o._showLabel) {
        lLabels.selectAll(`[data-label-slug="${o.slug}"]`).attr("display", "none");
      }
      hideTooltip();
    });

    clickTargetContainer.appendChild(div);
  });

  // Label click targets: use the layout solution's label rects (the same
  // rects used for collision placement) — replaces a forced-layout getBBox
  // per label after every gesture.
  if (_labelsEnabled) _lastProjected.forEach(obj => {
    if (!obj._showLabel || !obj._labelRect) return;
    const r = obj._labelRect;
    const div = document.createElement("div");
    div.className = "click-target click-target-label";
    div.style.left = (r.x + margin.left - 2) + "px";
    div.style.top = (r.y + margin.top - 2) + "px";
    div.style.width = (r.w + 4) + "px";
    div.style.height = (r.h + 4) + "px";
    div.dataset.slug = obj.slug;

    div.addEventListener("click", (e) => {
      e.stopPropagation();
      _sidebarManuallyExpanded = false;
      openSidebar(obj);
      setSidebarOpen(true);
    });

    div.addEventListener("mouseenter", (e) => {
      const iconEl = lIcons.select(`.obj-icon[data-slug="${obj.slug}"]`);
      if (iconEl.size()) {
        const hoverSize = Math.max(64, baseIco * iconSizeMult(obj) * 1.5);
        iconEl.attr("width", hoverSize).attr("height", hoverSize)
          .attr("x", obj.sx - hoverSize / 2).attr("y", obj.sy - hoverSize / 2);
      }
      showTooltip(e, obj, obj.cat);
    });

    div.addEventListener("mouseleave", () => {
      const iconEl = lIcons.select(`.obj-icon[data-slug="${obj.slug}"]`);
      if (iconEl.size()) {
        const objS = baseIco * iconSizeMult(obj);
        iconEl.attr("width", objS).attr("height", objS)
          .attr("x", obj.sx - objS / 2).attr("y", obj.sy - objS / 2);
      }
      hideTooltip();
    });

    clickTargetContainer.appendChild(div);
  });

  // Dark matter region click targets: overlay on the "POSSIBLE AREAS" label and region polygons
  lDarkMatter.selectAll("text, polygon.dm-region").each(function() {
    try {
      const bbox = this.getBBox();
      if (bbox.width < 2 || bbox.height < 2) return;
      const div = document.createElement("div");
      div.className = "click-target";
      div.style.left = (bbox.x + margin.left - 2) + "px";
      div.style.top = (bbox.y + margin.top - 2) + "px";
      div.style.width = (bbox.width + 4) + "px";
      div.style.height = (bbox.height + 4) + "px";
      div.style.cursor = "pointer";

      div.addEventListener("click", (e) => {
        e.stopPropagation();
        openInfoPanel("dark-matter-search", "The Search for Dark Matter");
        setSidebarOpen(true);
      });

      clickTargetContainer.appendChild(div);
    } catch(e) {}
  });
}

// =============================================================
// Touch input: modality tracking + tap-to-select
// =============================================================
// Touch and mouse need different plumbing over the same chart:
//  - mouse mode: the invisible HTML click-target divs handle hover + click,
//    and the gesture-surface rect is transparent to events.
//  - touch mode: the divs go inert (a pinch/pan starting on one never
//    reaches d3-zoom — the div sits outside the SVG) and the gesture-surface
//    rect becomes the stable touch target (see its creation for why).
// body.touch-mode is the single source of truth, flipped by actual input, so
// hybrid devices (touchscreen laptops, iPad + trackpad) get the right
// behavior for whichever input is in use.
let _gestureSurface = null; // assigned at boot where the rect is created
let _touchMode = _isCoarse;
let _lastTouchTs = 0;
function setInputModality(touch) {
  if (touch === _touchMode) return;
  _touchMode = touch;
  document.body.classList.toggle("touch-mode", touch);
  if (_gestureSurface) _gestureSurface.style("pointer-events", touch ? "all" : "none");
}
document.body.classList.toggle("touch-mode", _touchMode);
document.addEventListener("touchstart", () => {
  _lastTouchTs = performance.now();
  setInputModality(true);
}, { capture: true, passive: true });
document.addEventListener("mousemove", () => {
  // Browsers fire synthetic mouse events right after taps — ignore those
  if (performance.now() - _lastTouchTs > 1000) setInputModality(false);
}, { capture: true, passive: true });

function selectObject(o) {
  _sidebarManuallyExpanded = false;
  openSidebar(o);
  setSidebarOpen(true);
}

// Tap detection: taps hit-test labels and projected objects directly
// (working even during the 500ms window before click targets rebuild), and
// anything else is forwarded as a click to the element under the finger so
// in-SVG handlers (minimap, info-panel labels, axis links) keep working.
let _touchTap = null;
const _chartTapEl = document.getElementById("chart");
_chartTapEl.addEventListener("pointerdown", (e) => {
  if (e.pointerType !== "touch") return;
  // A second finger means pinch, not tap
  _touchTap = e.isPrimary ? { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId } : null;
}, { passive: true });
_chartTapEl.addEventListener("pointerup", (e) => {
  if (e.pointerType !== "touch" || !_touchTap || e.pointerId !== _touchTap.id) return;
  const dx = e.clientX - _touchTap.x, dy = e.clientY - _touchTap.y;
  const dt = performance.now() - _touchTap.t;
  _touchTap = null;
  if (dx * dx + dy * dy > 20 * 20 || dt > 400) return; // drag or hold, not a tap

  // Look through the gesture surface at what's under the finger
  const surfEl = _gestureSurface?.node();
  if (surfEl) surfEl.style.pointerEvents = "none";
  const under = document.elementsFromPoint(e.clientX, e.clientY);
  if (surfEl) surfEl.style.pointerEvents = _touchMode ? "all" : "none";

  // 1. Tap on an object's text label
  const labelEl = under.find(el => el.getAttribute?.("data-label-slug"));
  if (labelEl) {
    const o = (_lastProjected || []).find(p => p.slug === labelEl.getAttribute("data-label-slug"));
    if (o) { selectObject(o); return; }
  }

  // 2. Tap on the minimap — forwarded before the object hit-test, or an
  // object plotted beneath the minimap would hijack the tap
  const miniEl = under.find(el => miniSvg.node().contains(el));
  if (miniEl) {
    miniEl.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: e.clientX, clientY: e.clientY }));
    return;
  }

  // 3. Radial hit-test against projected objects (≥44px effective target)
  const sx = e.clientX - margin.left, sy = e.clientY - margin.top;
  const baseIco = effectiveIconSize();
  let best = null, bestD2 = Infinity;
  (_lastProjected || []).forEach(o => {
    const r = Math.max(22, objectHitSizePx(o, baseIco) / 2 + 8);
    const ddx = o.sx - sx, ddy = o.sy - sy;
    const d2 = ddx * ddx + ddy * ddy;
    if (d2 < r * r && d2 < bestD2) { best = o; bestD2 = d2; }
  });
  if (best) { selectObject(best); return; }

  // 4. Dark-matter regions (their HTML click-targets are inert on touch)
  if (under.some(el => el.classList?.contains("dm-region"))) {
    openInfoPanel("dark-matter-search", "The Search for Dark Matter");
    setSidebarOpen(true);
    return;
  }

  // 5. Anything else: forward the tap as a click to the top element under
  // the finger — in-SVG handlers (info labels, axis-unit links) and the
  // document-level empty-space deselect react exactly as they do for mouse.
  if (under[0] && under[0] !== document.documentElement && under[0] !== document.body) {
    under[0].dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: e.clientX, clientY: e.clientY }));
  }
}, { passive: true });

function redrawVectors() {
  drawRegions();
  drawGrid();
  drawDensityLines();
  drawTriangleOverlay();
  drawBoundaries();
  drawBigBangEras();
  drawDensityArrows();
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

/** Fast dot-only renderer: projects objects to screen and draws coloured
 *  dots at correct positions. Skips clustering, collision detection, and
 *  text labels entirely — roughly O(n) instead of O(n²).
 *
 *  ⚠️ CURRENTLY UNUSED — and must stay out of the zoom/pan path. It clears the
 *  dot/icon layers but NOT lLabels, so the previous frame's text labels stay
 *  frozen in place while the chart moves underneath. The user explicitly
 *  dislikes text that lingers or scales during a zoom (see memory
 *  feedback-zoom-keep-labels). Smoothness is handled by recording slow and
 *  speeding up in post, NOT by dropping/stranding labels. Do not wire this in. */
function drawObjectsFast() {
  lObj.selectAll("*").remove();
  lIcons.selectAll("*").remove();
  const pad = 5;
  const fastProjected = [];
  const shownIconsFast = [];
  const icoSize = effectiveIconSize();
  OBJECTS.forEach(o => {
    if (o.minK && currentK < o.minK) return;
    // Big Bang mode: skip invisible objects, apply position overrides
    let logR = o.logR, logM = o.logM;
    let opacity = 0.8;
    if (_bigBangMode) {
      const bbOp = _bigBangObjectOpacity[o.slug] ?? 0;
      if (bbOp <= 0.01) return;
      opacity = 0.8 * bbOp;
      if (_bigBangObjectOverrides[o.slug]) {
        logR = _bigBangObjectOverrides[o.slug].logR;
        logM = _bigBangObjectOverrides[o.slug].logM;
      }
    }
    const sx = px(logR), sy = py(logM);
    if (sx < -pad || sx > cw + pad || sy < -pad || sy > ch + pad) return;
    fastProjected.push({ ...o, sx, sy, _showDot: true });

    const hasIcon = _iconsEnabled && ICON_BY_SLUG[o.slug];
    // Icon overlap check: skip if too close to an already-shown icon
    if (hasIcon) {
      const icoOverlap = icoSize * 1.0;
      const icoOverlap2 = icoOverlap * icoOverlap;
      const tooClose = shownIconsFast.some(s => {
        const dx = s.sx - sx, dy = s.sy - sy;
        return dx * dx + dy * dy < icoOverlap2;
      });
      if (tooClose) { // demote to dot
        lObj.append("circle").attr("cx", sx).attr("cy", sy).attr("r", 3)
          .attr("fill", SUBCAT_COLORS[o.subcat] || CATEGORIES[o.cat]?.color || "#fff")
          .attr("opacity", opacity);
        return;
      }
      shownIconsFast.push({ sx, sy });
    }
    if (hasIcon) {
      const SCREEN_CATS = new Set(["remnant", "galaxy", "largescale", "star", "particle", "composite", "blackhole", "atomic"]);
      const SCREEN_SLUGS = new Set(["halleys-comet", "hale-bopp"]);
      const isVoid = o.slug.includes("void");
      const useScreen = (SCREEN_CATS.has(o.cat) || SCREEN_SLUGS.has(o.slug)) && !isVoid;
      const objIcoSize = icoSize * (iconSizeMult(o));
      if (useScreen) {
        lIcons.append("circle").attr("cx", sx).attr("cy", sy)
          .attr("r", objIcoSize * 0.52).attr("fill", "url(#icon-bg-grad)").attr("opacity", opacity);
      }
      lIcons.append("image")
        .attr("class", "obj-icon").attr("data-slug", o.slug)
        .attr("href", ICON_BY_SLUG[o.slug])
        .attr("x", sx - objIcoSize / 2).attr("y", sy - objIcoSize / 2)
        .attr("width", objIcoSize).attr("height", objIcoSize)
        .attr("opacity", opacity)
        .style("mix-blend-mode", useScreen ? "screen" : null);
    } else {
      lObj.append("circle")
        .attr("cx", sx).attr("cy", sy).attr("r", 3)
        .attr("fill", SUBCAT_COLORS[o.subcat] || CATEGORIES[o.cat]?.color || "#fff")
        .attr("opacity", opacity);
    }
  });
  _lastProjected = fastProjected;
}

/** Per-frame redraw during an active zoom/pan. Identical to redrawVectors():
 *  it full-renders objects (with text labels at correct positions) every
 *  frame. It is NOT a dots-only fast path — labels must never strand or scale
 *  mid-zoom (see drawObjectsFast's warning and memory feedback-zoom-keep-labels). */
function redrawVectorsLight() {
  drawRegions();
  drawGrid();
  drawDensityLines();
  drawTriangleOverlay();
  drawBoundaries();
  drawBigBangEras();
  drawDensityArrows();
  drawEnergyBands();
  drawDarkMatterRegions();
  updateConnectionOpacities();  // dots keep tracking the view; hover lines rebuilt on gesture end
  drawRegionLabels();
  // ALWAYS full-render objects every frame, including during automated tour
  // transitions. Text labels must redraw at their correct positions on every
  // frame — never linger in place and never scale with the chart. (Per the
  // user; see memory feedback-zoom-keep-labels.) If a transition feels slow,
  // the user records it slow and speeds it up in post — do NOT swap in the
  // dots-only drawObjectsFast() here; it strands the label layer in place.
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
let _panSamples = [];           // recent touch-pan positions for momentum

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
    clearClickTargets();
    // The hover hit-paths aren't rebuilt during the gesture (see
    // updateConnectionOpacities), so disable them — a mousemove mid-wheel-zoom
    // would otherwise light a connection at stale, pre-zoom coordinates.
    lArrows.style("pointer-events", "none");
    // Hide expensive feTurbulence filter during zoom on Safari for smoother animation
    if (_isSafari) grainRect.style("display", "none");
  })
  .on("zoom", (event) => {
    const t = event.transform;
    currentK = t.k;
    xS = t.rescaleX(xBase);
    yS = t.rescaleY(yBase);

    // Momentum sampling: remember where a touch pan has been recently
    if (event.sourceEvent?.type === "touchmove") {
      _panSamples.push({ t: performance.now(), x: t.x, y: t.y, k: t.k });
      if (_panSamples.length > 6) _panSamples.shift();
    }

    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        // Guard: if zoom ended before this rAF fired, skip the light redraw
        // (the end handler already did a full redraw).
        if (!_zooming) { rafPending = false; return; }

        if (_zoomPrevTransform) {
          // CSS-transform background tiles only (images stretch fine during zoom)
          const sk = currentK / _zoomPrevTransform.k;
          const dx = xS(0) - sk * _zoomPrevTransform.xS(0);
          const dy = yS(0) - sk * _zoomPrevTransform.yS(0);
          const tf = `translate(${dx},${dy}) scale(${sk})`;
          lTiles.attr("transform", tf);
          lTilesBase.attr("transform", tf);
        }
        // Full SVG redraw every frame for smooth icon/label/grid transitions
        redrawVectorsLight();
        updateReadout(null);
        rafPending = false;
      });
    }
  })
  .on("end", () => {
    _zooming = false;
    _zoomPrevTransform = null;
    lTiles.attr("transform", null);
    lTilesBase.attr("transform", null);
    lArrows.style("pointer-events", null); // drawConnections rebuilds fresh hit paths
    redraw();
    if (_isSafari) grainRect.style("display", null);
    updateStartButtonLabel();
    scheduleClickTargets();
    rearmAxesHideTimer(); // keep the mobile ruler up while actively zooming

    // Momentum pan: after a touch pan release, glide with decay (map-app
    // inertia). Only fires for pure pans (k stable) with real release speed;
    // the glide transition itself produces no touch samples, so it can't
    // re-trigger.
    const s = _panSamples;
    _panSamples = [];
    if (s.length >= 2) {
      const last = s[s.length - 1];
      const ref = [...s].reverse().find(p => last.t - p.t >= 40) || s[0];
      const dt = last.t - ref.t;
      const kStable = Math.abs(last.k - ref.k) < last.k * 0.001;
      if (dt > 0 && kStable && performance.now() - last.t < 120) {
        const vx = (last.x - ref.x) / dt, vy = (last.y - ref.y) / dt; // px/ms
        const speed = Math.hypot(vx, vy);
        if (speed > 0.35) {
          const glide = Math.min(speed * 300, 700); // px of decay travel
          svg.transition("inertia").duration(600).ease(d3.easeCubicOut)
            .call(zoomBehavior.translateBy,
              (vx / speed) * glide / last.k,
              (vy / speed) * glide / last.k);
        }
      }
    }
  });

svg.call(zoomBehavior);

svg.on("pointerdown.animPause", pauseAnimOnInteract);
svg.on("wheel.animPause", pauseAnimOnInteract);

// Double-click zooms in at click location
svg.on("dblclick.zoom", null);
svg.on("dblclick", (event) => {
  event.preventDefault();
  // Double-tap on touch fires dblclick too — map-app double-tap zoom
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

/** Preload tiles that will be visible at a target zoom transform */
function preloadTilesForTransform(targetTransform) {
  if (!_bgTilesEnabled || !tileMeta) return Promise.resolve();

  const { tileSize, levels } = tileMeta;
  const ppu = tileMeta.pxPerUnitX;
  const imgDataW = tileMeta.imgW / ppu;
  const imgDataH = tileMeta.imgH / ppu;

  const PLANCK_FRAC_X = 2114 / tileMeta.imgW;
  const PLANCK_FRAC_Y = 5960 / tileMeta.imgH;
  const imgLogRmin = PLANCK_LOG_R - PLANCK_FRAC_X * imgDataW;
  const imgLogMmax = PLANCK_LOG_M + PLANCK_FRAC_Y * imgDataH;

  // Compute target scales
  const tXS = targetTransform.rescaleX(xBase);
  const tYS = targetTransform.rescaleY(yBase);
  const screenPPU = Math.abs(tXS(1) - tXS(0));

  let best = levels[0];
  for (const lv of levels) {
    best = lv;
    if ((lv.w / imgDataW) >= screenPPU) break;
  }

  // Compute visible data range at target
  const x0 = tXS.invert(0), x1 = tXS.invert(cw);
  const y1 = tYS.invert(0), y0 = tYS.invert(ch);

  const dppX = imgDataW / best.w;
  const dppY = imgDataH / best.h;

  const promises = [];
  for (let r = 0; r < best.rows; r++) {
    for (let c = 0; c < best.cols; c++) {
      const tileW = (c === best.cols - 1) ? (best.w - c * tileSize) : tileSize;
      const tileH = (r === best.rows - 1) ? (best.h - r * tileSize) : tileSize;
      const tLogRmin = imgLogRmin + c * tileSize * dppX;
      const tLogRmax = tLogRmin + tileW * dppX;
      const tLogMmax = imgLogMmax - r * tileSize * dppY;
      const tLogMmin = tLogMmax - tileH * dppY;

      if (tLogRmax < x0 || tLogRmin > x1 || tLogMmax < y0 || tLogMmin > y1) continue;

      const href = `/tiles/z${best.z}/tile_${c}_${r}.webp`;
      if (!_tileCache.has(href)) {
        const img = new Image();
        const p = new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
        img.src = href;
        _tileCache.set(href, img);
        promises.push(p);
      }
    }
  }
  return promises.length ? Promise.all(promises) : Promise.resolve();
}

function zoomToRegion(region, overrideDuration) {
  // Get current transform to calculate travel distance
  const cur = d3.zoomTransform(svg.node());

  if (!region) {
    const target = d3.zoomIdentity;
    const dur = overrideDuration || _calcZoomDuration(cur, target);
    svg.transition().duration(dur).ease(d3.easeCubicInOut)
      .call(zoomBehavior.transform, target);
    return dur;
  }

  // On mobile, account for tour box covering the bottom of the chart.
  // Fit the region into the visible area above the tour box and center there.
  let usableH = ch;
  let centerOffsetY = 0;
  const tourBox = document.getElementById('tour-box');
  if (tourBox && !tourBox.classList.contains('tour-hidden')) {
    const boxH = tourBox.offsetHeight + 20; // include gap
    if (_isMobile) {
      usableH = ch - boxH;
      centerOffsetY = boxH / 2;
    } else {
      // Desktop: box is small in lower-left, nudge up slightly
      centerOffsetY = boxH * 0.15;
    }
  }

  const kx = cw / (xBase(region.x[1]) - xBase(region.x[0]));
  const ky = usableH / (yBase(region.y[0]) - yBase(region.y[1]));
  const k = Math.min(kx, ky) * 0.9;
  const cx = (xBase(region.x[0]) + xBase(region.x[1])) / 2;
  const cy = (yBase(region.y[0]) + yBase(region.y[1])) / 2;
  const tx = cw / 2 - cx * k;
  const ty = ch / 2 - cy * k - centerOffsetY;
  const target = d3.zoomIdentity.translate(tx, ty).scale(k);
  const dur = overrideDuration || _calcZoomDuration(cur, target);

  // Preload tiles for destination, then zoom
  preloadTilesForTransform(target).then(() => {
    svg.transition().duration(dur).ease(d3.easeCubicInOut)
      .call(zoomBehavior.transform, target);
  });
  return dur;
}

/** Duration scales with how far the camera travels (pan + zoom change). */
function _calcZoomDuration(from, to) {
  // Normalise translation distance relative to viewport size
  const panDist = Math.hypot(
    (to.x - from.x) / cw,
    (to.y - from.y) / ch
  );
  // Zoom ratio (log-scale so zooming in 10× ≈ zooming out 10×)
  const zoomRatio = Math.abs(Math.log(to.k / from.k));
  // Combined "effort" — higher means bigger jump
  const effort = panDist + zoomRatio;
  // Clamp between 2000ms and 3000ms for a relaxed, natural feel
  return Math.round(Math.min(3000, Math.max(2000, 1500 + effort * 500)));
}

// =============================================================
// Big Bang animated timeline — animation engine
// =============================================================

/** Helper: run a Big Bang animation using d3.timer for reliable execution.
 *  The tick function receives eased t ∈ [0,1]. Returns the timer for cancellation.
 *  d3.timer fires on each rAF frame — the tick updates state, then we redraw.
 *  If a zoom transition is also running (_zooming), it handles redraws; otherwise
 *  the Big Bang timer does its own redraws. */
function _bigBangAnimate(duration, tick, onEnd) {
  const timer = d3.timer(elapsed => {
    const raw = Math.min(1, elapsed / duration);
    const t = d3.easeCubicInOut(raw);
    tick(t);
    // Redraw: skip if zoom is concurrently redrawing (it picks up our state)
    if (!_zooming) {
      redrawVectors();
    }
    if (raw >= 1) {
      timer.stop();
      // Clear whichever transition reference points to this timer
      if (_bigBangTransition === timer) _bigBangTransition = null;
      if (_bigBangTransition2 === timer) _bigBangTransition2 = null;
      redrawVectors(); // final redraw with exact target values
      if (onEnd) onEnd();
    }
  });
  return timer;
}

/** Cancel all Big Bang transitions and pending timers. */
function _cancelBigBangTransitions() {
  if (_bigBangTransition) { _bigBangTransition.stop(); _bigBangTransition = null; }
  if (_bigBangPhase2Timer) { clearTimeout(_bigBangPhase2Timer); _bigBangPhase2Timer = null; }
  if (_bigBangTransition2) { _bigBangTransition2.stop(); _bigBangTransition2 = null; }
}

/**
 * Animate the Big Bang state to a target era (two-phase):
 * Phase 1 (concurrent with zoom): Hubble radius + white overlay.
 * Phase 2 (delayed after zoom): Object opacities + position overrides.
 */
function animateBigBangTransition(bigBangConfig, duration) {
  const eraKey = bigBangConfig.era;
  const era = BIG_BANG_ERAS[eraKey];
  if (!era) return;

  _cancelBigBangTransitions();
  _bigBangMode = true;

  // Target values
  const targetHubble = era.hubbleLogR;
  const targetWhite = bigBangConfig.enterWhite ? 1.0 : (era.whiteOverlay || 0);
  const targetOpacities = computeEraOpacities(eraKey);
  const targetOverrides = era.moveObjects || {};
  const targetFadeBlackHoles = !!era.fadeBlackHoles;

  // Starting values (snapshot current state)
  const startHubble = _bigBangHubbleLogR;
  const startWhite = _bigBangWhiteOverlay;

  // Phase 1: Hubble radius + white overlay (runs alongside zoom)
  _bigBangTransition = _bigBangAnimate(duration, (t) => {
    _bigBangHubbleLogR = startHubble + (targetHubble - startHubble) * t;
    _bigBangWhiteOverlay = startWhite + (targetWhite - startWhite) * t;
    whiteOverlay.attr("opacity", _bigBangWhiteOverlay);
  });

  // Phase 2: Object opacities + position overrides (after zoom + delay)
  const objectDelay = bigBangConfig.objectDelay ?? 1000;
  const objectDuration = bigBangConfig.objectDuration ?? 2500;

  _bigBangPhase2Timer = setTimeout(() => {
    _bigBangPhase2Timer = null;

    // Snapshot current state at the moment phase 2 begins
    const p2StartOpacities = { ..._bigBangObjectOpacity };
    const p2StartOverrides = {};
    for (const slug in targetOverrides) {
      const orig = OBJECTS.find(o => o.slug === slug);
      if (!orig) continue;
      p2StartOverrides[slug] = {
        logR: _bigBangObjectOverrides[slug]?.logR ?? orig.logR,
        logM: _bigBangObjectOverrides[slug]?.logM ?? orig.logM,
      };
    }
    const allSlugs = new Set([...Object.keys(p2StartOpacities), ...Object.keys(targetOpacities)]);

    _bigBangTransition2 = _bigBangAnimate(objectDuration, (t) => {
      // Each object opacity interpolates independently
      for (const slug of allSlugs) {
        const from = p2StartOpacities[slug] ?? 0;
        const to = targetOpacities[slug] ?? 0;
        _bigBangObjectOpacity[slug] = from + (to - from) * t;
      }
      // Position overrides (e.g. Sun → red giant) interpolate smoothly
      for (const slug in targetOverrides) {
        const from = p2StartOverrides[slug];
        if (!from) continue;
        _bigBangObjectOverrides[slug] = {
          logR: from.logR + (targetOverrides[slug].logR - from.logR) * t,
          logM: from.logM + (targetOverrides[slug].logM - from.logM) * t,
        };
      }
      _bigBangFadeBlackHoles = targetFadeBlackHoles;
    }, () => {
      // On end: clear overrides for objects that are back to original position
      for (const slug in _bigBangObjectOverrides) {
        if (!targetOverrides[slug]) delete _bigBangObjectOverrides[slug];
      }
    });
  }, duration + objectDelay);
}

/**
 * Exit Big Bang mode — restore everything to normal.
 */
function exitBigBangMode(duration) {
  if (!_bigBangMode) return;

  // Cancel any in-progress Big Bang transitions (both phases)
  _cancelBigBangTransitions();

  const startHubble = _bigBangHubbleLogR;
  const startWhite = _bigBangWhiteOverlay;
  const startOpacities = { ..._bigBangObjectOpacity };
  const startOverrides = { ..._bigBangObjectOverrides };

  _bigBangTransition = _bigBangAnimate(duration || 2000, (t) => {
    _bigBangHubbleLogR = startHubble + (HUBBLE_LOG_R - startHubble) * t;
    _bigBangWhiteOverlay = startWhite * (1 - t);
    whiteOverlay.attr("opacity", _bigBangWhiteOverlay);

    // Fade all objects back to full opacity
    for (const slug in startOpacities) {
      _bigBangObjectOpacity[slug] = startOpacities[slug] + (1 - startOpacities[slug]) * t;
    }

    // Interpolate position overrides back to original
    for (const slug in startOverrides) {
      const orig = OBJECTS.find(o => o.slug === slug);
      if (!orig) continue;
      _bigBangObjectOverrides[slug] = {
        logR: startOverrides[slug].logR + (orig.logR - startOverrides[slug].logR) * t,
        logM: startOverrides[slug].logM + (orig.logM - startOverrides[slug].logM) * t,
      };
    }
  }, () => {
    // On end: fully reset Big Bang state
    _bigBangMode = false;
    _bigBangHubbleLogR = HUBBLE_LOG_R;
    _bigBangWhiteOverlay = 0;
    _bigBangObjectOpacity = {};
    _bigBangObjectOverrides = {};
    _bigBangFadeBlackHoles = false;
    whiteOverlay.attr("opacity", 0);
    redraw();
  });
}

/** Check if Big Bang mode is currently active */
function isBigBangActive() {
  return _bigBangMode;
}

// Debug API: force Big Bang state for testing in environments without rAF
window.__debugBigBang = {
  setEra(eraKey) {
    const era = BIG_BANG_ERAS[eraKey];
    if (!era) return 'unknown era: ' + eraKey;
    _cancelBigBangTransitions();
    _bigBangMode = true;
    _bigBangHubbleLogR = era.hubbleLogR;
    _bigBangWhiteOverlay = era.whiteOverlay || 0;
    _bigBangObjectOpacity = computeEraOpacities(eraKey);
    _bigBangObjectOverrides = {};
    _bigBangFadeBlackHoles = !!era.fadeBlackHoles;
    if (era.moveObjects) {
      for (const slug in era.moveObjects) {
        _bigBangObjectOverrides[slug] = { ...era.moveObjects[slug] };
      }
    }
    whiteOverlay.attr("opacity", _bigBangWhiteOverlay);
    redrawVectors();
    return 'set to era: ' + eraKey + ', hubbleLogR=' + era.hubbleLogR;
  },
  setWhite(opacity) {
    _bigBangWhiteOverlay = opacity;
    whiteOverlay.attr("opacity", opacity);
    return 'white overlay set to ' + opacity;
  },
  reset() {
    _cancelBigBangTransitions();
    _bigBangMode = false;
    _bigBangHubbleLogR = HUBBLE_LOG_R;
    _bigBangWhiteOverlay = 0;
    _bigBangObjectOpacity = {};
    _bigBangObjectOverrides = {};
    _bigBangFadeBlackHoles = false;
    whiteOverlay.attr("opacity", 0);
    redrawVectors();
    return 'reset';
  },
  getState() {
    return { mode: _bigBangMode, hubbleLogR: _bigBangHubbleLogR, white: _bigBangWhiteOverlay,
             visibleObjects: Object.keys(_bigBangObjectOpacity).filter(s => _bigBangObjectOpacity[s] > 0.5).length,
             overrides: { ..._bigBangObjectOverrides },
             fadeBlackHoles: _bigBangFadeBlackHoles };
  },
};

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
      if (logR > DE_SITTER_LOG_R) zone = `<span style="color:#ff9900">unreachable</span>`;
      else if (logM > schwarzschildM(logR)) zone = `<span style="color:#ff3355">gravity forbidden</span>`;
      else if (logM < comptonM(logR)) zone = `<span style="color:#9944ff">quantum forbidden</span>`;
      else zone = `<span style="color:#64ffda">accessible</span>`;

      html = `<div>R ≈ ${rFriendly} &nbsp;(10<sup>${(logR - 2).toFixed(1)}</sup> m)</div>`
        + `<div>M ≈ ${mFriendly} &nbsp;(10<sup>${(logM - 3).toFixed(1)}</sup> kg)</div>`
        + `<div>ρ ≈ 10<sup>${(logRho + 3).toFixed(0)}</sup> kg/m³ &nbsp;${zone}</div>`
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
    labels: setLabels.checked, icons: setIcons.checked, iconSize: +setIconSize.value,
    gridUnit: _gridUnit,
    marginLeft: _userMarginLeft, marginRight: _userMarginRight,
    marginTop: _userMarginTop, marginBottom: _userMarginBottom,
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
  scheduleConnAnim();  // restart the parked dot loop when re-enabled
  saveSettings();
});

const setLabels = document.getElementById("set-labels");
setLabels.addEventListener("change", () => {
  _labelsEnabled = setLabels.checked;
  redraw();
  saveSettings();
});

const setIcons = document.getElementById("set-icons");
setIcons.addEventListener("change", () => {
  _iconsEnabled = setIcons.checked;
  redraw();
  saveSettings();
});

const setIconSize = document.getElementById("set-icon-size");
setIconSize.addEventListener("input", () => {
  _iconSize = +setIconSize.value;
  redraw();
  saveSettings();
});

const setGridUnit = document.getElementById("set-grid-unit");
setGridUnit.addEventListener("change", () => {
  _gridUnit = GRID_UNITS[setGridUnit.value] ? setGridUnit.value : "si";
  drawGrid();
  drawAxes();
  saveSettings();
});



// =============================================================
// Keyboard shortcuts
// =============================================================

const PAN_STEP = 80;
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  // Arrow keys pan. Letter keys are recording shortcuts (see keyhint / docs):
  //   W/S zoom · A/D step the tour pages · Z/X slow/speed animations · H hide UI
  switch (e.key) {
    case "+": case "=":
      svg.transition().duration(200).call(zoomBehavior.scaleBy, 1.4); break;
    case "-": case "_":
      svg.transition().duration(200).call(zoomBehavior.scaleBy, 1 / 1.4); break;
    case "ArrowLeft":
      svg.transition().duration(150).call(zoomBehavior.translateBy, PAN_STEP, 0); break;
    case "ArrowRight":
      svg.transition().duration(150).call(zoomBehavior.translateBy, -PAN_STEP, 0); break;
    case "ArrowUp":
      svg.transition().duration(150).call(zoomBehavior.translateBy, 0, PAN_STEP); break;
    case "ArrowDown":
      svg.transition().duration(150).call(zoomBehavior.translateBy, 0, -PAN_STEP); break;
    case "Home": case "0":
      svg.transition().duration(500).call(zoomBehavior.transform, d3.zoomIdentity); break;

    // ── Recording shortcuts ──────────────────────────────────────
    case "w": case "W":
      svg.transition().duration(200).call(zoomBehavior.scaleBy, 1.4); break;
    case "s": case "S":
      svg.transition().duration(200).call(zoomBehavior.scaleBy, 1 / 1.4); break;
    case "a": case "A":
      tourStep(-1); break;
    case "d": case "D":
      tourStep(1); break;
    case "z": case "Z":
      _animSpeed = Math.max(0.1, +(_animSpeed / 1.4).toFixed(3));
      console.log(`Animation speed: ${_animSpeed}×`); break;
    case "x": case "X":
      _animSpeed = Math.min(8, +(_animSpeed * 1.4).toFixed(3));
      console.log(`Animation speed: ${_animSpeed}×`); break;
    case "h": case "H":
      document.body.classList.toggle("ui-hidden"); break;
  }
});

// =============================================================
// Resize
// =============================================================

// Shared layout sync — updates SVG, clip path, chart transform, and scale
// bases to match the current margin / W / H. Used by both the window
// resize listener and the chart-margin drag handles.
function applyLayout({ resetZoom } = {}) {
  svg.attr("width", W).attr("height", H);
  svg.select("rect.svg-bg").attr("width", W).attr("height", H);
  defs.select("#clip rect").attr("width", cw).attr("height", ch);
  clip.selectAll("rect.bg-rect").attr("width", cw).attr("height", ch);
  chart.attr("transform", `translate(${margin.left},${margin.top})`);
  xBase.domain([viewXMin, viewXMax]).range([0, cw]);
  yBase.domain([viewYMin, viewYMax]).range([ch, 0]);
  updateBgGradients();
  if (resetZoom) {
    svg.call(zoomBehavior.transform, d3.zoomIdentity);
    xS = xBase.copy();
    yS = yBase.copy();
    currentK = 1;
  }
  chart.select("rect:last-of-type").attr("width", cw).attr("height", ch);
  miniSvg.attr("transform",
    `translate(${W - MINIMAP_SIZE - MINIMAP_PAD - margin.right}, ${margin.top + MINIMAP_PAD})`);
}
window.__applyLayout = applyLayout;

// Resize must never wipe the user's zoom position: rotation, URL-bar
// collapse, and the on-screen keyboard all fire this. On touch devices,
// height-only wiggles (browser chrome showing/hiding) are ignored outright;
// real resizes re-layout around the preserved center. relayout() owns all
// sizing and triggers the full redraw via the zoom handlers — no extra
// redraw() here.
let _lastVw = window.innerWidth, _lastVh = window.innerHeight;
let _resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => {
    const dw = Math.abs(window.innerWidth - _lastVw);
    const dh = Math.abs(window.innerHeight - _lastVh);
    if (_isCoarse && dw === 0 && dh < 160) return; // mobile browser chrome
    _lastVw = window.innerWidth; _lastVh = window.innerHeight;
    const modeChanged = updateMobileState();
    relayout(); // preserves zoom center + scale through the new layout
    if (modeChanged && _isMobile && _isSidebarOpen) {
      setSidebarOpen(false);
    }
  }, 150);
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

// Title lockup on phones: "THE TRIANGLE OF" stays one line (CSS nowrap) and
// "EVERYTHING" is scaled so both lines span exactly the same width — the
// classic poster lockup. Measured with canvas so it's exact for the loaded
// font, then applied once per title.
function fitTitleLockup(container) {
  const l1 = container.querySelector(".title-line1, .tour-title-line1");
  const l2 = container.querySelector(".title-line2, .tour-title-line2");
  if (!l1 || !l2) return;
  const ctx = document.createElement("canvas").getContext("2d");
  const measure = (el) => {
    const cs = getComputedStyle(el);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const ls = parseFloat(cs.letterSpacing) || 0;
    const text = el.textContent.trim();
    return ctx.measureText(text).width + ls * Math.max(0, text.length - 1);
  };
  const w1 = measure(l1), w2 = measure(l2);
  if (w1 > 0 && w2 > 0) {
    const scale = w1 / w2;
    const cur = parseFloat(getComputedStyle(l2).fontSize);
    l2.style.fontSize = `${(cur * scale).toFixed(2)}px`;
    const ls2 = parseFloat(getComputedStyle(l2).letterSpacing) || 0;
    if (ls2) l2.style.letterSpacing = `${(ls2 * scale).toFixed(2)}px`;
  }
}
if (_isMobile) {
  (document.fonts?.ready || Promise.resolve()).then(() => {
    document.querySelectorAll("#intro-title, #tour-header h2").forEach(fitTitleLockup);
  });
}

// Mobile axes pill: toggles the unit margins (and axis numbers) on and off
// around the edge-to-edge map. relayout() keeps the view centered through
// the margin change. The ruler auto-hides after a few idle seconds — the
// timer re-arms on every zoom/pan end so it never vanishes mid-inspection.
const AXES_AUTO_HIDE_MS = 8000;
let _axesHideTimer = null;
function setMobileAxes(on) {
  _showAxesMobile = on;
  document.body.classList.toggle("mobile-axes-on", on);
  document.getElementById("axes-toggle")?.classList.toggle("active", on);
  clearTimeout(_axesHideTimer);
  if (on) _axesHideTimer = setTimeout(() => setMobileAxes(false), AXES_AUTO_HIDE_MS);
  relayout();
}
function rearmAxesHideTimer() {
  if (!_showAxesMobile) return;
  clearTimeout(_axesHideTimer);
  _axesHideTimer = setTimeout(() => setMobileAxes(false), AXES_AUTO_HIDE_MS);
}
document.getElementById("axes-toggle")?.addEventListener("click", () => {
  setMobileAxes(!_showAxesMobile);
});

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
    if (saved.labels === false) { setLabels.checked = false; _labelsEnabled = false; }
    if (saved.icons === false) { setIcons.checked = false; _iconsEnabled = false; }
    if (saved.gridUnit && GRID_UNITS[saved.gridUnit]) { _gridUnit = saved.gridUnit; setGridUnit.value = saved.gridUnit; }
    if (saved.iconSize > 0) {
      // Migration: old slider used 8-64 px range; new slider is 30-300 percent.
      // If the saved value falls in the old range, convert by treating it as the
      // old default (48) → 100%.
      const v = +saved.iconSize;
      const migrated = v <= 64 ? Math.round(v / 48 * 100) : v;
      setIconSize.value = Math.max(30, Math.min(300, migrated));
      _iconSize = +setIconSize.value;
    }
    if (typeof saved.marginLeft === "number")   _userMarginLeft   = saved.marginLeft;
    if (typeof saved.marginRight === "number")  _userMarginRight  = saved.marginRight;
    if (typeof saved.marginTop === "number")    _userMarginTop    = saved.marginTop;
    if (typeof saved.marginBottom === "number") _userMarginBottom = saved.marginBottom;
  }
} catch (e) { /* ignore corrupt data */ }

// =============================================================
// Draggable margins on all four chart edges
// =============================================================
(function setupAxisResizeHandles() {
  // side → state-mapping helpers. Keep this declarative so each handle is
  // self-contained and there's no chance of one side mutating another.
  const SIDES = {
    left: {
      title: "Drag to resize the energy-axis column",
      currentMargin: () => margin.left,
      apply: (delta, start) => { _userMarginLeft = start + delta; },
      reset: () => { _userMarginLeft = null; },
      axis: "x",
    },
    right: {
      title: "Drag to resize the mass-axis column",
      currentMargin: () => margin.right,
      apply: (delta, start) => { _userMarginRight = start - delta; },
      reset: () => { _userMarginRight = null; },
      axis: "x",
    },
    top: {
      title: "Drag to resize the time-axis header",
      currentMargin: () => margin.top,
      apply: (delta, start) => { _userMarginTop = start + delta; },
      reset: () => { _userMarginTop = null; },
      axis: "y",
    },
    bottom: {
      title: "Drag to resize the width-axis footer",
      currentMargin: () => margin.bottom,
      apply: (delta, start) => { _userMarginBottom = start - delta; },
      reset: () => { _userMarginBottom = null; },
      axis: "y",
    },
  };

  const handles = {};
  for (const side of Object.keys(SIDES)) {
    const el = document.createElement("div");
    el.className = "axis-resize-handle";
    el.dataset.side = side;
    el.title = SIDES[side].title;
    document.body.appendChild(el);
    handles[side] = el;
  }

  function positionHandles() {
    if (_isMobile) {
      for (const el of Object.values(handles)) el.style.display = "none";
      return;
    }
    for (const el of Object.values(handles)) el.style.display = "";
    handles.left.style.left   = (margin.left - 7) + "px";
    handles.right.style.left  = (W - margin.right - 7) + "px";
    handles.top.style.top     = (margin.top - 7) + "px";
    handles.bottom.style.top  = (H - margin.bottom - 7) + "px";
  }

  let dragSide = null;
  let dragStart = 0;
  let dragStartMargin = 0;

  function onPointerDown(e) {
    dragSide = e.currentTarget.dataset.side;
    const cfg = SIDES[dragSide];
    dragStart = cfg.axis === "x" ? e.clientX : e.clientY;
    dragStartMargin = cfg.currentMargin();
    e.currentTarget.classList.add("dragging");
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  }
  function onPointerMove(e) {
    if (!dragSide) return;
    const cfg = SIDES[dragSide];
    const cur = cfg.axis === "x" ? e.clientX : e.clientY;
    cfg.apply(cur - dragStart, dragStartMargin);
    // Capture data-space center & zoom so we can re-apply the same view
    // after the chart-area dimensions change.
    const d = vd();
    const cx = (d.x0 + d.x1) / 2;
    const cy = (d.y0 + d.y1) / 2;
    const k  = currentK;
    measure();
    if (typeof window.__applyLayout === "function") window.__applyLayout({ resetZoom: true });
    // Re-apply: zoom level k around the captured center
    const tx = cw / 2 - xBase(cx) * k;
    const ty = ch / 2 - yBase(cy) * k;
    svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
    positionHandles();
    redraw();
  }
  function onPointerUp(e) {
    if (!dragSide) return;
    e.currentTarget.classList.remove("dragging");
    dragSide = null;
    saveSettings();
  }
  function onDoubleClick(e) {
    SIDES[e.currentTarget.dataset.side].reset();
    const d = vd();
    const cx = (d.x0 + d.x1) / 2;
    const cy = (d.y0 + d.y1) / 2;
    const k  = currentK;
    measure();
    if (typeof window.__applyLayout === "function") window.__applyLayout({ resetZoom: true });
    const tx = cw / 2 - xBase(cx) * k;
    const ty = ch / 2 - yBase(cy) * k;
    svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
    positionHandles();
    redraw();
    saveSettings();
  }

  for (const h of Object.values(handles)) {
    h.addEventListener("pointerdown", onPointerDown);
    h.addEventListener("pointermove", onPointerMove);
    h.addEventListener("pointerup", onPointerUp);
    h.addEventListener("pointercancel", onPointerUp);
    h.addEventListener("dblclick", onDoubleClick);
  }

  positionHandles();
  window.addEventListener("resize", positionHandles);
  window.__repositionAxisHandles = positionHandles;
})();

// =============================================================
// URL hash state for bookmarkable zoom positions
// =============================================================

function saveHash() {
  // Don't overwrite tour hashes — the tour manages its own URL state
  if (location.hash.startsWith("#tour=")) return;
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
  if (!h || h.startsWith("tour=")) return false;
  // Preset region hash like #preset=particle-physics — clicks the matching button.
  if (h.startsWith("preset=")) {
    const key = h.slice(7);
    const btn = document.querySelector(`#preset-bar button[data-preset="${key}"]`);
    if (btn) { btn.click(); return true; }
    return false;
  }
  const parts = h.split(",");
  const nums = parts.slice(0, 3).map(Number);
  // Slug-only hash like #electron — find the object and pan/zoom to it
  if (nums.length !== 3 || nums.some(isNaN)) {
    if (parts.length === 1 && /^[a-z][a-z0-9-]*$/i.test(h)) {
      const obj = OBJECTS.find(o => o.slug === h);
      if (obj) {
        navigateToObject(obj.slug, obj.name);
        return true;
      }
    }
    return false;
  }
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
// Touch gesture surface: touch events stay bound to the element the finger
// first landed on — and the per-frame redraw deletes and recreates chart
// nodes, so a pinch/pan starting on a label or icon died after one frame
// (the detached node stops bubbling to the SVG). This topmost, transparent,
// never-rebuilt rect gives every touch a stable target.
// INTERIM until Phase 2's retained rendering (docs/mobile-plan.md) removes
// the per-frame teardown — though the click-target divs must stay
// touch-inert regardless (they sit outside the SVG entirely).
// Created for any device with a coarse pointer (hybrids included); its
// pointer-events follow the input modality (see setInputModality) so mouse
// hover on in-SVG elements keeps working whenever a mouse is in use.
if (window.matchMedia?.("(any-pointer: coarse)").matches) {
  _gestureSurface = svg.append("rect")
    .attr("class", "gesture-surface")
    .attr("width", "100%").attr("height", "100%")
    .attr("fill", "none")
    .style("pointer-events", _touchMode ? "all" : "none");
}

svg.call(zoomBehavior);

// =============================================================
// Boot
// =============================================================

updateMobileState();
_booted = true;
initConnections();
loadTileMeta();
initTour({
  zoomToRegion,
  vd,
  animateBigBang: animateBigBangTransition,
  exitBigBang: exitBigBangMode,
  isBigBangActive: () => _bigBangMode,
});

// Standalone cosmic-time scrubber — drives the same Big Bang era engine
// as the tour, but freely draggable. Quick fades (no camera move) so
// scrubbing feels responsive.
initTimeScrubber({
  setEra: (eraKey) =>
    animateBigBangTransition({ era: eraKey, objectDelay: 0, objectDuration: 600 }, 450),
  exit: (duration) => exitBigBangMode(duration),
  isActive: () => _bigBangMode,
  // Snap to the full-chart view so objects across every scale are in frame
  // while scrubbing (otherwise an early era looks empty if you're zoomed in).
  resetView: () => svg.call(zoomBehavior.transform, d3.zoomIdentity),
});

if (!loadHash()) {
  // Intro animation: start zoomed on Human, then zoom out to full view
  const introK = 14;
  const introTx = cw / 2 - xBase(1.7) * introK;
  const introTy = ch / 2 - yBase(4.9) * introK;
  svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(introTx, introTy).scale(introK));

  // After a beat, smoothly zoom out to the full chart
  setTimeout(() => {
    svg.transition()
      .duration(3000)
      .ease(d3.easeCubicInOut)
      .call(zoomBehavior.transform, d3.zoomIdentity);
  }, 1000);
}

// Fade out the key hint after 6 seconds
setTimeout(() => {
  const hint = document.getElementById("keyhint");
  if (hint) hint.classList.add("faded");
}, 6000);

// Reveal page now that CSS and JS are loaded (prevents FOUC)
document.body.classList.add("ready");
