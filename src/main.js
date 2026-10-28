import {revealIcon,exitReveal} from "./icon-reveal.js";
import {BLACK_HOLE_FRAMES, BLACK_HOLE_SIZE_MULT, BLACK_HOLE_MASK_DEFS, blackHoleMask} from "./black-hole-frames.js";
import {installBlackHoleTones} from "./black-hole-palette.js";
import {LUMINOUS_CATS, isLuminousArt} from "./luminous-art.js";
import {createMobileRulers} from "./mobile-rulers.js";
import * as d3 from "d3";
import {isDiffuseSpaceArt,SPACE_ART_DEFS,spaceEdgeMask} from "./space-art.js";
import {animateIconGrowth, ICON_HOVER_MS, iconHoverEase} from "./icon-hover.js";
import {STAR_BODY_FRAMES, SHADOWED_SCREEN_SPHERES, BROWN_DWARFS, starWallLight, stellarLightProfile} from "./star-light.js";
import { PARALLAX, planePoint, planeTransform, iconPoint, iconDepth } from "./parallax.js";
import { wallShadowState, wallShadowImageGeometry } from "./shadow-geometry.js";
import { buildSearchIndex, searchObjects } from "./object-search.js";
import { VisibilityMemory } from "./visibility-memory.js";
import { priorityCircles } from "./visibility-hierarchy.js";
import { spaceImagePriority } from "./space-image-priority.js";
import {
  formatSci, friendlyRadius, friendlyMass, friendlyEnergy, isPhoton,
  friendlyWavelength, friendlyDensity, MASS_HOVER_UNITS, RADIUS_HOVER_UNITS,
  ENERGY_HOVER_UNITS, pickBestUnit, pickAltUnit, formatHumanNum,
  formatLogSuper, densityToLogTime, friendlyTime, fmtTick,
} from "./format.js";
import {
  DESC_BY_SLUG, IMG_BY_SLUG, ICON_BY_SLUG, ICON_COVERAGE, iconUrlForSize, setIconMaxRes, setIconSwap, SHADOW_BY_SLUG, SHADOW_SETTINGS_BY_SLUG, STRINGS_ATOM_SLUGS,
  imageManifest, hyperspirographStates, parseFrontmatter, _loadedIconUrls,
  startIconWarmup, loadDescriptions,
} from "./assets.js";

// Where the build is served from: "/" on the site, "./" in the narration
// preview (scripts/narration-preview.mjs), which runs from a sub-folder.
const BASE = import.meta.env.BASE_URL;
// The narration preview: the player only, no address-bar sync or service worker.
// The dev server serves the same page at /videos/ (vite.config.js).
const NARR_PREVIEW = import.meta.env.MODE === "narration-preview" ||
  (import.meta.env.DEV && /^\/videos\/?$/.test(location.pathname));
// Built with relative paths (--base ./) to run from a sub-folder, like a
// claude.ai page: the URL path isn't ours, so only the hash is kept in sync —
// rewriting the path to "/" would break every relative asset (map tiles…).
const SUBFOLDER = BASE !== "/";
import {
  BOUNDS, SCHWARZSCHILD_C, COMPTON_C, PLANCK_LOG_R, PLANCK_LOG_M,
  PLANCK_TRUE_LOG_R, PLANCK_TRUE_LOG_M,
  schwarzschildR, schwarzschildM, comptonR, comptonM,
  DENSITY_LINES, RADIUS_UNITS, MASS_UNITS, ENERGY_UNITS,
  CATEGORIES, SUBCAT_COLORS, SUBCAT_LABEL_COLORS, SUBCAT_LABELS, DUST_SOURCE_SUBCAT, ELEMENT_GUIDES, ELEMENTS_BY_Z, periodicCell, ELEMENT_TYPES, elementType, PERIODIC_FAMILIES, COMPOSITION, CAT_DISPLAY, DENSITY_SPHERE_C, EPOCH_BANDS,
  REFERENCE_LINES, HUBBLE_LOG_R, DE_SITTER_LOG_R, CONNECTION_PATHS,
  PBH_WINDOW, ENERGY_BANDS, TEMPERATURE_ARROWS, WATER_RANGE, DENSITY_ARROWS,
  WIDTH_LOG_OFFSET, PHOTON_LAMBDA_OFFSET,
} from "./data.js";
import objectsData from "./objects.json";
import { applyBulkObjects } from "./bulk-density.js";
import {
  openWaterPhasePanel, closeWaterPhasePanel, isWaterPhaseOpen,
  selectWaterPhaseKey, onWaterPhaseToggle, waterPhaseMarkup,
  WP_FRAME, WP_DEX_PER_UNIT, WP_FRAME_TOP_LOGM,
} from "./water-phase.js";
import introRaw from "../content/intro.md?raw";
import "./style.css";
import { initTour, onObjectClick, updateStartButtonLabel, startTour, tourStep, tourGoTo, logAllSteps, isTourActive, closeTour } from "./tour.js";
import { initTimeScrubber } from "./time-scrubber.js";
import { startHopfIcons } from "./hopf-icons.js";
import { enableTrackpadPinch } from "./trackpad-pinch.js";
import { enableTrackpadPan, wheelKind } from "./trackpad-pan.js";
import { loadDust, drawDust, pickDust, pickNamedDust, dustPoint, dustReady, dustPositions, dustOfCat, dustOfSrc, dustByName, dustIcons, dustDots, pickDustIcon, setDustIconScale, dustSearchEntries, focusDust, dustPictureCandidates } from "./dust.js";
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

let _iconsEnabled = true;
let _iconOnly = null;     // narration: a Set of the only object names that get their picture
let _iconFill = false;    // narration: …or first, with every other picture that fits after them
let _iconForce = null;    // narration: names whose picture shows even where a nearer one would hide it
let _iconHide = null;     // narration: names whose picture never shows (they pile onto a neighbour)
let _dustFill = false;    // narration: catalogue pictures without their names (the names stay off)
let _labelFocus = null;   // narration: while a callout shows, only these objects keep their labels
let _labelFocusKey = "";
let _dustPictures = null; // narration: catalogue dots shown as their pictures (names)
// Settings → Icons, 0 (none) … 100 (many); 50 is the map's standard density.
// It isn't a count: it sets how much room pictures keep around each other
// (curated objects and catalogue pictures alike) and how small a catalogue
// picture may be, and the visibility hierarchy shows whatever then fits.
const ICON_DENSITY_DEFAULT = 50;
let _iconDensity = ICON_DENSITY_DEFAULT;
const lerp = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));
/** Clear room between pictures, in radii: 2.6 near none, 1.3 standard, 0.9 at many (may touch). */
function iconRoom() {
  return _iconDensity <= ICON_DENSITY_DEFAULT ? lerp(2.6, 1.3, (_iconDensity - 5) / (ICON_DENSITY_DEFAULT - 5))
    : lerp(1.3, 0.9, (_iconDensity - ICON_DENSITY_DEFAULT) / (100 - ICON_DENSITY_DEFAULT));
}
/** Smallest catalogue picture, px: 44 near none, 30 standard, 20 at many. */
function dustIconMin() {
  return _iconDensity <= ICON_DENSITY_DEFAULT ? lerp(44, 30, (_iconDensity - 5) / (ICON_DENSITY_DEFAULT - 5))
    : lerp(30, 20, (_iconDensity - ICON_DENSITY_DEFAULT) / (100 - ICON_DENSITY_DEFAULT));
}
let _iconSize = 100;  // percent multiplier on top of zoom-derived effective size
let _fontScale = 1;   // global text multiplier (settings "Font size" slider)
const fscale = (px) => px * _fontScale;
let _boldHover = false; // video mode: hovered lines render bold, no tooltips
let _labelsEnabled = true;
let _dustEnabled = true;  // catalogue dust layer (settings checkbox)
let _userEngaged = false; // set on first pointer/wheel/key input (deferred loading)

// Icon size scales with zoom: 16px at k=0.3 (fully out), up to 128px at k=800 (fully in).
// Uses log interpolation for a natural "approaching distant object" feel.
// ?og-shot: headless mode used by scripts/build-pages.mjs to screenshot the
// chart around each object for its preview image (see window.__toeOg below).
const _softSpace = !new URLSearchParams(location.search).has("legacyspace");
const _ogShot = new URLSearchParams(location.search).has("og-shot");
function effectiveIconSize() {
  const minK = 0.3, maxK = 800;
  const minSize = 14, maxSize = 115;
  const t = Math.log(Math.max(minK, Math.min(maxK, currentK)) / minK)
          / Math.log(maxK / minK);
  const size = minSize + (maxSize - minSize) * t;
  // Phones get half the desktop size across the board: full-size icons (×
  // per-object multipliers) drown a 390px screen at stellar zooms.
  // Preview-image screenshots (?og-shot) show pictures larger: they're the subject
  return _ogShot ? size * 1.6 : _isMobile ? size / 2 : size;
}
// Some objects need a larger icon (e.g. Saturn's rings extend beyond the sphere)
const ICON_SIZE_MULT = {
  "saturn": 2,
  "primordial-black-hole": 2, "3k-bh": 2, "stellar-bh": 2,
  "sgr-a": 2, "m87": 2, "ton-618": 2,
  ...BLACK_HOLE_SIZE_MULT,
};

// Physical size scaling: for every 6 orders of magnitude in real radius,
// icon grows 10%. Observable universe icons are ~2.5x larger than instanton icons.
// Centered around logR ≈ -3.5 (midpoint of the full range).
// Pictures that fill little of their square (a hippo, the Eiffel Tower) look
// smaller than ones that fill it (a cube of water): part-compensate by covered
// area (content/icons/coverage.json, scripts/icon-coverage.mjs). Luminous
// pictures (a glow, not a silhouette) and unmeasured ones stay as they are.
const AREA_REF = 0.6, AREA_POWER = 0.25, AREA_MIN = 0.9, AREA_MAX = 1.35;
function iconAreaMult(slug) {
  if (ICON_SIZE_MULT[slug]) return 1;   // sized by hand already (Saturn's rings)
  const c = ICON_COVERAGE[slug];
  if (!c || c >= 0.95) return 1;
  return Math.max(AREA_MIN, Math.min(AREA_MAX, (AREA_REF / c) ** AREA_POWER));
}
// How much room a picture keeps from others (pictures never overlap): its drawn radius,
// less for a glow that leaves most of its square empty (a galaxy cluster's faint halo,
// a nebula) and for Saturn's rings, from content/icons/coverage.json. Solid things
// (rocks, towers, animals) keep their whole square, sparse or not.
const ROOM_REF = 0.6, ROOM_MIN = 0.45;
function iconRoomMult(slug, cat) {
  if (!ICON_SIZE_MULT[slug] && !isLuminousArt(cat, slug)) return 1;
  const c = ICON_COVERAGE[slug];
  return c ? Math.max(ROOM_MIN, Math.min(1, Math.sqrt(c / ROOM_REF))) : 1;
}
// A catalogue dot's rank in its band (1 = its most famous) on the objects' z scale
function dustImportance(rank) { return rank <= 1 ? 3 : rank <= 3 ? 3.5 : rank <= 10 ? 4 : 5; }
let _dustPictureChoice = null;   // catalogue pictures the one picture pass chose (indices)
function iconSizeMult(o) {
  const logR = o.logR ?? 0;
  const sizeScale = Math.pow(1.1, (logR - (-3.5)) / 6);
  const cat = o.catKey || o.cat;
  // Galaxies get a second 25% boost; extend this pass to diffuse large-scale
  // structures and black holes, keeping solid universe/void spheres unchanged.
  const categoryScale = BLACK_HOLE_FRAMES[o.slug] ? 1 : cat === "galaxy" ? 1.25 * 1.25
    : cat === "blackhole" || (cat === "largescale" && isDiffuseSpaceArt(cat, o.slug)) ? 1.25 : 1;
  return sizeScale * categoryScale * (ICON_SIZE_MULT[o.slug] || 1) * iconAreaMult(o.slug) * (_iconSize / 100);
}

// Photons → where the spectrum explorer (/spectrum/) opens: the selector's
// centre c and spread s on its band bar (the sky's bands, radio → gamma), the
// same view their map icons were rendered from.
const SPECTRUM_BANDS = {
  "am-radio": [0.25, 0.25], "fm-radio": [0.25, 0.25], "21-cm-line": [1, 1], "microwave": [3, 1],
  "submillimetre": [8, 1], "far-infrared": [13, 1], "infrared": [16, 1], "near-infrared": [19, 1],
  "visible-light": [22, 1], "ultraviolet": [23.5, 1], "soft-x-ray": [25, 1], "x-ray": [26, 1],
  "gamma-ray": [26.5, 1], "gev-gamma-ray": [27, 1],
};

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

const OBJECTS = applyBulkObjects(objectsData).map(o => ({ ...o, slug: o.slug || nameToSlug(o.name) }));
const CURATED_SLUGS = new Set(OBJECTS.map(o => o.slug)); // dust never shows a curated object's picture
let tileMeta = null;

// =============================================================
// Big Bang animated timeline — state
// =============================================================
import { BIG_BANG_ERAS, TOUR_STEPS } from "./tour-data.js";

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

// Recording viewport (V): lock the app to a fixed stage, scaled to fit the
// window and centered on black — a stable crop target for screenshots and
// screen recordings. V cycles off → landscape (a 1920×1080 desktop) →
// portrait (a 432×768 phone in the mobile layout; ×2.5 = a 1080×1920
// vertical video) → off. While locked the app lays out (and behaves) as
// the stage regardless of the real window.
const VP_STAGES = {
  landscape: { W: 1920, H: 1080, maxScale: 1, pad: 0 },
  // Upscale: a phone is tiny on a monitor. The pad leaves a black gutter for
  // the safe-zone guides (see positionSafeZones), outside the capture crop.
  portrait:  { W: 432,  H: 768,  maxScale: Infinity, pad: 36 },
};
// Where TikTok / Reels / Shorts draw their own UI over a 9:16 video, as
// fractions of the frame — roughly the union of the three apps' overlays:
// status + tabs on top, caption/username/music at the bottom, the
// like/comment/share column on the right.
const VP_SAFE = { top: 0.14, bottom: 0.25, left: 0.06, right: 0.13 };
let _viewportLock = null; // null | "landscape" | "portrait"
const vpStage = () => VP_STAGES[_viewportLock];
const viewportLockScale = () => {
  const s = vpStage();
  return Math.min(s.maxScale,
    (window.innerWidth - 2 * s.pad) / s.W, (window.innerHeight - 2 * s.pad) / s.H);
};

const _isCoarse = !!window.matchMedia?.("(pointer: coarse)").matches;
const _isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
// Every iOS browser and in-app web view (whose UA has no "Safari"), plus Safari.
const _isWebKit = /AppleWebKit/i.test(navigator.userAgent) && !/(Chrome|Chromium|Edg|Android)\b/i.test(navigator.userAgent);
let _booted = false;

const margin = { top: 55, right: 125, bottom: 80, left: SIDEBAR_W };
// Assigned by the axis-resize-handles section at the bottom of the module;
// measure() runs earlier during scaffolding, hence the late binding.
let _repositionAxisHandles = null;
let W, H, cw, ch;

function updateMobileState() {
  const wasMobile = _isMobile;
  // Poster panels can be narrow (an inset) yet must keep the desktop axes.
  _isMobile = _viewportLock ? _viewportLock === "portrait"
    : !_posterMargins && window.innerWidth < MOBILE_BREAKPOINT;
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
let _posterMargins = null; // explicit axis columns, set by window.__poster
let _posterStage = null;   // fixed {W, H} stage in CSS px, set by window.__poster
let _posterNoText = false; // hide every label, number and annotation layer
let _posterArrows = false; // draw every connection path as static arrows
// Videos: the periodic table's lines and the spectrum's sine wave shown by the
// narration (0–1, faded on its clock), without the box or a hover
let _narrPeriodic = 0, _narrSpectrum = 0;
let _posterLabels = false; // strict, measured object labels for the vector overlay
let _posterLabelSize = 11; // CSS px
const _posterLabelFont = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const _posterLabelTracking = 0.04; // em
let _posterMeasureCtx = null;
const _posterLabelWidths = new Map();
/** Real text width of an object name as the poster prints it (bold caps). */
function posterLabelWidth(name) {
  const key = name + "@" + _posterLabelSize;
  let w = _posterLabelWidths.get(key);
  if (w == null) {
    if (!_posterMeasureCtx) _posterMeasureCtx = document.createElement("canvas").getContext("2d");
    _posterMeasureCtx.font = `700 ${_posterLabelSize}px ${_posterLabelFont}`;
    const text = name.toUpperCase();
    w = _posterMeasureCtx.measureText(text).width + text.length * _posterLabelTracking * _posterLabelSize;
    _posterLabelWidths.set(key, w);
  }
  return w;
}
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

// ---------- Axis type & column layout ----------
// Axis type follows the Font size setting (base sizes below, CSS px at
// 100%), and each axis column is laid out FROM that type: frame → ticks →
// decade numbers → named references → rotated title + subtitle, using the
// measured width of the widest label in each column. A column's default
// width is what that layout needs, so bigger type widens the column rather
// than overflowing it; a column dragged narrower shrinks its type to fit.
const AXIS_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const AXIS_TYPE = { num: 15, minor: 10.5, ref: 12.5, title: 12, sub: 10 };
// Top and bottom keep their designed geometry, scaled with the type.
const AXIS_TB_SCALE = { top: 1.25, bottom: 1.15 };
const _axCtx = document.createElement("canvas").getContext("2d");
const _axWidths = new Map();
function axTextWidth(labels, px, weight) {
  const key = `${labels[0]}|${labels.length}|${px}|${weight}`;
  let w = _axWidths.get(key);
  if (w == null) {
    _axCtx.font = `${weight} ${px}px ${AXIS_FONT}`;
    w = 0;
    for (const l of labels) for (const line of l.split("\n")) w = Math.max(w, _axCtx.measureText(line).width);
    _axWidths.set(key, w);
  }
  return w;
}
// Widest decade number any grid mode prints (a sample: measure() first runs
// before GRID_UNITS exists).
const AXIS_NUM_SAMPLE = ["−88", "-88", "188"];

function axisLayout() {
  if (_isMobile) {
    // Compact ruler: numbers + rotated titles in fixed 56–92 px margins.
    return { s: 1, num: 12, minor: 9, ref: 9.5, title: 11, sub: 9, tick: 5, numX: 9,
      L: { title: 44, sub: 30, need: 56 }, R: { title: 46, sub: 32, need: 58 },
      sT: 1, sB: 1, needT: 78, needB: 92 };
  }
  const s = _fontScale, T = AXIS_TYPE;
  const num = T.num * s, minor = T.minor * s, ref = T.ref * s, title = T.title * s, sub = T.sub * s;
  const gap = 10 * s, tick = 5;
  const numX = tick + 4;                                      // number edge, from the frame
  const refX = numX + axTextWidth(AXIS_NUM_SAMPLE, num, 700) + gap; // reference edge
  // Rotated text: glyphs rise ~0.75em from the baseline away from the chart
  // and dip ~0.2em toward it. Baselines measured outward from the frame.
  const side = (refW) => {
    const subB = refX + refW + gap * 0.8 + 0.2 * sub;
    const titleB = subB + 0.75 * sub + 4 * s + 0.2 * title;
    return { sub: subB, title: titleB, need: Math.ceil(titleB + 0.75 * title + 6 * s) };
  };
  return {
    s, num, minor, ref, title, sub, tick, numX, refX,
    L: side(axTextWidth(ENERGY_UNITS.map(u => u.label), ref, 700)),
    R: side(axTextWidth(MASS_UNITS.map(u => u.label), ref, 700)),
    sT: s * AXIS_TB_SCALE.top, sB: s * AXIS_TB_SCALE.bottom,
    needT: Math.ceil(TOP_MARGIN_DEFAULT * s * AXIS_TB_SCALE.top),
    needB: Math.ceil(BOTTOM_MARGIN_DEFAULT * s * AXIS_TB_SCALE.bottom),
  };
}
let _axLayout = null; // axisLayout() + per-column fit, set by measure()

function measure() {
  W = _posterStage ? _posterStage.W : _viewportLock ? vpStage().W : window.innerWidth;
  H = _posterStage ? _posterStage.H : _viewportLock ? vpStage().H : window.innerHeight;
  if (_isMobile) {
    // Edge-to-edge map on phones: the chart IS the screen and all UI floats
    // above it. The rulers come up over it (src/mobile-rulers.js); the axes
    // button pins them.
    margin.left = 0;
    margin.right = 0;
    margin.top = 0;
    margin.bottom = 0;
  } else {
    // Defaults: what the axis layout needs at the current type size. The
    // drag limits stretch to always allow at least that.
    const ax = axisLayout();
    const baseLeft = _isSidebarOpen ? SIDEBAR_W : BASE_MARGIN_LEFT - 80;
    const fit = (user, min, max, need) => user != null
      ? Math.max(min, Math.min(Math.max(max, need), user)) : need;
    margin.left = baseLeft + fit(_userMarginLeft != null ? _userMarginLeft - baseLeft : null,
      LEFT_MARGIN_MIN_EXTRA, LEFT_MARGIN_MAX_EXTRA, ax.L.need);
    margin.right = fit(_userMarginRight, RIGHT_MARGIN_MIN, RIGHT_MARGIN_MAX, ax.R.need);
    margin.top = fit(_userMarginTop, TOP_MARGIN_MIN, TOP_MARGIN_MAX, ax.needT);
    margin.bottom = fit(_userMarginBottom, BOTTOM_MARGIN_MIN, BOTTOM_MARGIN_MAX, ax.needB);
  }
  if (_posterMargins) {
    // Poster renderer (window.__poster): the print frame sizes its own axis
    // columns, uncapped by the drag-handle limits.
    margin.left = _posterMargins.left;
    margin.right = _posterMargins.right;
    margin.top = _posterMargins.top;
    margin.bottom = _posterMargins.bottom;
  }
  cw = W - margin.left - margin.right;
  ch = H - margin.top - margin.bottom;
  // A column narrower than its layout needs shrinks its type to fit.
  {
    const ax = axisLayout();
    const baseLeft = _isMobile ? 0 : _isSidebarOpen ? SIDEBAR_W : BASE_MARGIN_LEFT - 80;
    const f = (have, need) => have > 0 ? Math.min(1, have / need) : 1; // 0: column hidden
    _axLayout = { ...ax, fL: f(margin.left - baseLeft, ax.L.need), fR: f(margin.right, ax.R.need),
      fT: f(margin.top, ax.needT), fB: f(margin.bottom, ax.needB) };
  }
  // Expose axis-column widths to CSS (axis handles, tour box placement).
  document.body.style.setProperty("--left-axis-w",  margin.left  + "px");
  document.body.style.setProperty("--right-axis-w", margin.right + "px");
  document.body.style.setProperty("--top-axis-h",    margin.top    + "px");
  document.body.style.setProperty("--bottom-axis-h", margin.bottom + "px");
  document.body.classList.toggle("axis-r-bold", margin.right >= 130);
  document.body.classList.toggle("axis-l-bold", (margin.left - (_isSidebarOpen ? SIDEBAR_W : BASE_MARGIN_LEFT - 80)) >= 160);
  document.body.classList.toggle("axis-b-bold", margin.bottom >= 110);
  document.body.classList.toggle("axis-t-bold", margin.top >= 90);
  _repositionAxisHandles?.();

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

const svg = d3.select("#chart").append("svg").attr("width", W).attr("height", H)
  .attr("role", "img")
  .attr("aria-label", "Map of every object in the universe, plotted by mass versus width. Use search to find and select objects.");

// Screen-reader announcements (selection changes, etc.)
const _srAnnounceEl = document.getElementById("sr-announce");
function announce(text) {
  if (!_srAnnounceEl) return;
  _srAnnounceEl.textContent = "";           // retrigger even for repeats
  requestAnimationFrame(() => { _srAnnounceEl.textContent = text; });
}

// OS-level reduced-motion preference: shorten/skip camera animation and
// decorative motion. The in-app "Show animations" checkbox still overrides.
const _reduceMotion = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const defs = svg.append("defs");
installBlackHoleTones(defs);   // the black holes' colour ramps (dive photos)
defs.node().insertAdjacentHTML("beforeend",SPACE_ART_DEFS+BLACK_HOLE_MASK_DEFS);

// Clip
defs.append("clipPath").attr("id", "clip")
  .append("rect").attr("width", cw).attr("height", ch);

// --- gradients ---

// Cast shadows under the pictures (drawIconShadows): blur sized to each
// ellipse (objectBoundingBox), so one filter looks the same at every zoom.
// The far ellipse is blurred more: the shadow softens as it leaves the object.
// Dust dots' shadows: one path, a fixed 0.8 px blur (dots don't scale)
defs.append("filter").attr("id", "dust-shadow-blur")
  .attr("x", "-5%").attr("y", "-5%").attr("width", "110%").attr("height", "110%")
  .append("feGaussianBlur").attr("stdDeviation", 0.8);
// A circular wall-light falloff, tinted per star; no generated star textures.
const starFade=defs.append("radialGradient").attr("id","star-wall-fade");
for(const [offset,opacity] of [[0,1],[.18,.75],[.42,.34],[.68,.10],[1,0]])starFade.append("stop").attr("offset",offset).attr("stop-color","white").attr("stop-opacity",opacity);
defs.append("mask").attr("id","star-wall-mask").attr("maskUnits","objectBoundingBox")
  .attr("maskContentUnits","objectBoundingBox").attr("x",0).attr("y",0).attr("width",1).attr("height",1)
  .append("rect").attr("width",1).attr("height",1).attr("fill","url(#star-wall-fade)");
// the videos' halo behind a named object: a pale lavender light in overlay blend, so
// the purple under it brightens towards white without ever going flat white
const narrHalo=defs.append("radialGradient").attr("id","narr-halo-fade");
for(const [offset,opacity] of [[0,1],[.3,.9],[.55,.5],[.8,.15],[1,0]])narrHalo.append("stop").attr("offset",offset).attr("stop-color","#e4dcff").attr("stop-opacity",opacity);
defs.append("filter").attr("id","star-glow").attr("primitiveUnits","objectBoundingBox")
  .attr("x","-20%").attr("y","-20%").attr("width","140%").attr("height","140%")
  .append("feGaussianBlur").attr("stdDeviation",.012);
[["icon-shadow-near", 0.08], ["icon-shadow-far", 0.16]].forEach(([id, sd]) => {
  defs.append("filter").attr("id", id)
    .attr("primitiveUnits", "objectBoundingBox")
    .attr("x", "-60%").attr("y", "-60%").attr("width", "220%").attr("height", "220%")
    .append("feGaussianBlur").attr("stdDeviation", sd);
});

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

// Dives (app.setDolly): each depth of the chart sits in a pair of groups, the
// outer one blurred and darkened, the inner one scaled about the dived-into
// object, so the depths fall back at different rates. Untouched otherwise.
const dollyDepth = (parent) => { const f = parent.append("g"); return [f, f.append("g")]; };
const [dBackF, dBack] = dollyDepth(clip);

// Background tile layer (on top of gradient, below chart content)
const lTilesBase = dBack.append("g").style("pointer-events", "none"); // permanent low-res background
const lTiles = dBack.append("g").style("pointer-events", "none");
let _bgFadeDeep = false;   // narration: fade the over-zoomed painting (app.setBgFadeDeep)

// Content wrapper: CSS-transformed during zoom for smooth panning
// (instead of tearing down & rebuilding all DOM elements each frame)
const [dMidF, dMid] = dollyDepth(clip);
const lContent = dMid.append("g");

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
// Pictures' cast shadows: under the dust, dots, labels and pictures alike
const lShadows    = lContent.append("g").style("pointer-events", "none").attr("class", "icon-shadows");
const SHADOWS = !new URLSearchParams(location.search).has("noshadows");
// Approved circular wall lights; ?noglow is a comparison switch.
const STAR_GLOWS = SHADOWS && !new URLSearchParams(location.search).has("noglow");
const DUST_SHADOWS = SHADOWS && !new URLSearchParams(location.search).has("nodustshadows");
// Catalogue "dust": thousands of faint real objects under the curated ones
// (src/dust.js). Never interactive except for a hover name.
const lDust       = lContent.append("g").style("pointer-events", "none").attr("class", "dust-layer");
const PARALLAX_OFF = new URLSearchParams(location.search).has("noparallax");
let DUST_LABELS_OFF = NARR_PREVIEW || new URLSearchParams(location.search).has("narrate");
lGrid.raise(); // grid plane sits in front of dust, behind labels and pictures
lRegLabel.raise();
const lDustHover  = lContent.append("g").style("pointer-events", "none");
const lObj        = lContent.append("g");
// Retained rendering split: extras (cluster/category/BH labels, ~20 nodes)
// are rebuilt per frame; main object groups are persistent keyed joins.
const lObjExtras  = lObj.append("g");
const lObjMain    = lObj.append("g");
const lHighlight  = lContent.append("g").style("pointer-events", "none");
const lCompose    = lContent.append("g").style("pointer-events", "none"); // hover "made of" lines
const lAxisRef    = lContent.append("g").style("pointer-events", "none").attr("class", "axis-ref-lines");
const lWaterPhase = lContent.append("g"); // states-of-water inset (zooms with the map)
// narration: guide lines from a talked-about object to the rulers, under its picture
const lNarrGuides = lContent.append("g").style("pointer-events", "none").attr("class", "narr-guides");
// Object labels live in lLabels, behind the foreground picture layer.

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
const [dLabF, dLab] = dollyDepth(clip);
const lLabels = dLab.append("g").style("pointer-events", "none");
const [dIconF, dIcon] = dollyDepth(clip);
const lIcons = dIcon.append("g").attr("class", "picture-layer").style("pointer-events", "none");
// a dive darkens everything behind its object (pictures too: a filter on their
// layer would cut the screen-blended ones off from the painting behind them)
const dVeil = clip.append("rect").attr("fill", "#05051a").attr("opacity", 0).attr("display", "none")
  .style("pointer-events", "none");
// a dive's own object, drawn in front of every depth as it comes towards the screen
const dFocus = clip.append("g").attr("class", "picture-layer dolly-focus").style("pointer-events", "none");

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
// Phones: rulers that fade in while you pan, pinch or tap (src/mobile-rulers.js).
// Desktop: the same guides, out to the chart's axes, from a clicked dust dot.
const lMobileRulers = chart.append("g").style("pointer-events", "none");
// what the guides start from: a curated object, { dustIndex, logR, logM }, or null for the centre
let _rulerFocus = null;
const RULER_AVOID = "#search-box, #preset-bar, #sidebar-expand, #axes-toggle, #controls, #settings-btn, #tour-start-btn, #tour-header, #scale-bar";
const mobileRulers = createMobileRulers({
  layer: lMobileRulers, px, py, ipx: (x) => xS.invert(x), ipy: (y) => yS.invert(y),
  rulers: () => _isMobile,
  frame: () => {
    if (!_isMobile) return { w: cw, h: ch, top: 0, bottom: ch };
    // above the object sheet or the tour card when one is up, and the bottom
    // buttons; below the search button
    const up = [_isSidebarOpen && "sidebar", document.body.classList.contains("touring") && "tour-box"].filter(Boolean);
    const sheetTop = Math.min(...up.map(id => document.getElementById(id)?.getBoundingClientRect())
      .filter(r => r && r.height > 0 && r.top < H - 40).map(r => r.top - margin.top), Infinity);
    return { w: cw, h: ch, top: 116, bottom: Math.min(ch - 96, sheetTop - 22) };
  },
  avoid: () => [...document.querySelectorAll(RULER_AVOID)]
    .filter(e => {   // shown, counting faded-out parents (the title lockup's)
      if (getComputedStyle(e).visibility === "hidden") return false;
      let o = 1;
      for (let x = e; x && o > 0.1; x = x.parentElement) o *= +getComputedStyle(x).opacity;
      return o > 0.1;
    })
    .map(e => e.getBoundingClientRect()).filter(r => r.width > 0 && r.height > 0)
    .map(r => ({ x: r.left - margin.left - 4, y: r.top - margin.top - 4, w: r.width + 8, h: r.height + 8 })),
  focus: () => {
    if (!_rulerFocus) return null;
    if (_rulerFocus.dustIndex != null) return dustPoint(_rulerFocus.dustIndex) || { x: px(_rulerFocus.logR), y: py(_rulerFocus.logM) };
    const o = _lastProjected.find(p => p.slug === _rulerFocus.slug);
    return o ? { x: o.sx, y: o.sy } : { x: px(_rulerFocus.logR), y: py(_rulerFocus.logM) };
  },
  onUnpin: () => setAxesButton(false),
});
const mobileRulersOn = () => _isMobile && !_posterStage && !document.body.classList.contains("narrating");
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

// Space darkens with mass, so the nebulae, galaxies and clusters (pictures with soft,
// glowing edges) stand out: from the stars (no darkening at 10^32 g), half by the nebulae
// (10^35 g), 70% from the dwarf galaxies (10^41 g) on. A gradient in chart space: it stays put as you pan.
const SPACE_DARK = { from: 32, mid: 35, to: 41, midK: 0.5, toK: 0.7, color: "#03021a" };
const spaceDarkGrad = defs.append("linearGradient").attr("id", "space-dark")
  .attr("gradientUnits", "userSpaceOnUse").attr("x1", 0).attr("x2", 0);
[[0, 0], [(SPACE_DARK.mid - SPACE_DARK.from) / (SPACE_DARK.to - SPACE_DARK.from), SPACE_DARK.midK], [1, SPACE_DARK.toK]]
  .forEach(([o, k]) => spaceDarkGrad.append("stop").attr("offset", o).attr("stop-color", SPACE_DARK.color).attr("stop-opacity", k));

function drawRegions() {
  lRegion.selectAll("*").remove();
  const d = vd();
  const B = { x: { min: d.x0 - 20, max: d.x1 + 20 }, y: { min: d.y0 - 20, max: d.y1 + 20 } };

  if (B.y.max > SPACE_DARK.from) {
    spaceDarkGrad.attr("y1", py(SPACE_DARK.from)).attr("y2", py(SPACE_DARK.to));
    lRegion.append("rect").attr("x", px(B.x.min)).attr("width", px(B.x.max) - px(B.x.min))
      .attr("y", py(B.y.max)).attr("height", py(B.y.min) - py(B.y.max)).attr("fill", "url(#space-dark)");
  }

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
// Grid unit modes — SI / Planck (2G) / Planck-wavelength / Planck (textbook)
// =============================================================
// The chart's internal coordinates are logR (cm) and logM (g); these never
// change. A unit mode only changes (a) where the grid/axis decade lines are
// anchored (xRef/yRef — so round unit values land on grid lines) and (b) how
// the tick numbers and axis titles read. The main Planck modes anchor to the
// chart's own apex (PLANCK_LOG_R/M — Planck units in the 2G convention, see
// data.js), so the singularity sits exactly on (0,0). "planck-true" anchors
// to the CODATA values instead; there the apex reads (√2, 1/√2) ≈ ±0.15
// decades, which is physically accurate — the boundary lines genuinely do
// not cross at the textbook Planck point.
// "planck-wavelength" additionally shows the LEFT axis as the Compton
// wavelength (inverse energy): 0 at the apex (= the Planck length), growing
// downward — so a particle's left-axis value equals its width.
let _gridUnit = "si";
const _EV_OFFSET = 32.75; // logM(g) + this = log10(energy/eV)

const GRID_UNITS = {
  si: {
    // Anchored so ticks read the WIDTH of objects at that position
    // (stored logR is a radius; width = radius × 2 = logR + WIDTH_LOG_OFFSET).
    xRef: -WIDTH_LOG_OFFSET, yRef: 0,
    xNum: (v) => fmtTick(v + WIDTH_LOG_OFFSET),
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
  "planck-true": {
    xRef: PLANCK_TRUE_LOG_R, yRef: PLANCK_TRUE_LOG_M,
    xNum: (v) => fmtTick(v - PLANCK_TRUE_LOG_R),
    massNum: (v) => fmtTick(v - PLANCK_TRUE_LOG_M),
    energyNum: (v) => fmtTick(v - PLANCK_TRUE_LOG_M),
    bottomSub: "Planck lengths", rightSub: "Planck masses",
    leftTitle: "ENERGY", leftSub: "Planck energy",
  },
};
function gridCfg() { return GRID_UNITS[_gridUnit] || GRID_UNITS.si; }
// First grid line ≥ lo, anchored to ref + k·step (k integer).
const firstAligned = (lo, step, ref) => ref + Math.ceil((lo - ref) / step) * step;

function drawGrid() {
  lGrid.attr("transform", planeTransform(cw, ch, parallaxOn() ? PARALLAX.labels : 0));
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
      // zoomed far in, the decade and log lines are the main way to read the
      // map, so they keep strengthening (author, 2026-10-23)
      if (level.spacing > 600) { opacity = 0.26; width = 0.8; }
      else if (level.spacing > 200) { opacity = 0.18; width = 0.65; }
      else if (level.spacing > 80)  { opacity = 0.12; width = 0.5; }
      else if (level.spacing > 30)  { opacity = 0.08; width = 0.4; }
      else if (level.spacing > 12)  { opacity = 0.05; width = 0.35; }
      else { opacity = 0.025; width = 0.25; }
    } else {
      if (level.spacing > 260) { opacity = 0.2; width = 0.65; }
      else if (level.spacing > 160) { opacity = 0.14; width = 0.55; }
      else if (level.spacing > 80)  { opacity = 0.07; width = 0.45; }
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

  // Diagonal: the isodensity line through the apex (slope 3) — the third
  // Planck guide. Anchored to the apex itself (sphere-density ≈ 10^92.49
  // g/cm³ = m▲ in a sphere of radius ℓ▲); the textbook ρ_P = m_P/l_P³
  // ≈ 10^93.7 has no sphere factor and would miss the apex by 1.2 dex.
  const planckDensityB = PLANCK_LOG_M - 3 * PLANCK_LOG_R;
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
            .attr("font-size", fscale(9)).attr("letter-spacing", "0.5px")
            .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.8)")
            .attr("stroke-width", 2.5).attr("stroke-linejoin", "round")
            .text("de Sitter R\u221E");
          // Visible text
          lBound.append("text")
            .attr("x", deSitterPx + 5).attr("y", labelY)
            .attr("font-family", "var(--font-mono, monospace)")
            .attr("font-size", fscale(9)).attr("letter-spacing", "0.5px")
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
    const refLn = lBound.append("line")
      .attr("x1", px(p0.logR)).attr("y1", py(p0.logM))
      .attr("x2", px(p1.logR)).attr("y2", py(p1.logM))
      .attr("stroke", rl.color).attr("stroke-width", rl.width)
      .attr("stroke-dasharray", rl.dash);

    // Bold-hover mode hit stroke (see drawDensityLines)
    lBound.append("line")
      .attr("x1", px(p0.logR)).attr("y1", py(p0.logM))
      .attr("x2", px(p1.logR)).attr("y2", py(p1.logM))
      .attr("stroke", "transparent").attr("stroke-width", 14)
      .on("mouseenter", () => { if (_boldHover) refLn.classed("line-hot", true); })
      .on("mouseleave", () => refLn.classed("line-hot", false));

    // Label at midpoint of the VISIBLE segment
    const midSx = (clipped.x1 + clipped.x2) / 2;
    const midSy = (clipped.y1 + clipped.y2) / 2;
    const ang = Math.atan2(clipped.y2 - clipped.y1, clipped.x2 - clipped.x1) * 180 / Math.PI;

    lBound.append("text")
      .attr("x", midSx).attr("y", midSy - 5)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif").attr("font-size", fscale(8))
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
      .attr("font-size", fscale(fontSize)).attr("letter-spacing", "1px")
      .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.6)")
      .attr("stroke-width", 2).attr("stroke-linejoin", "round")
      .attr("opacity", 0.5)
      .text(text);
    const txt = lEnergyBands.append("text")
      .attr("x", labelX).attr("y", labelY)
      .attr("text-anchor", "end")
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", fscale(fontSize)).attr("letter-spacing", "1px")
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
        .attr("font-size", fscale(fontSize)).attr("letter-spacing", "0.5px")
        .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.85)")
        .attr("stroke-width", 3).attr("stroke-linejoin", "round")
        .text(line);

      // Colored text (same as obj-label)
      const el = lEnergyBands.append("text")
        .attr("x", labelX).attr("y", startY + li * lineHeight + fontSize * 0.35)
        .attr("text-anchor", "end")
        .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
        .attr("font-size", fscale(fontSize)).attr("letter-spacing", "0.5px")
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
          .attr("font-size", fscale(fontSize)).attr("letter-spacing", "0.5px")
          .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.85)")
          .attr("stroke-width", 3).attr("stroke-linejoin", "round")
          .text("100°C");
        lEnergyBands.append("text")
          .attr("x", labelXTop).attr("y", topY + fontSize * 0.35)
          .attr("text-anchor", "end")
          .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
          .attr("font-size", fscale(fontSize)).attr("letter-spacing", "0.5px")
          .attr("fill", waterColor)
          .text("100°C");

        // 0°C label
        lEnergyBands.append("text")
          .attr("x", labelXBot).attr("y", botY + fontSize * 0.35)
          .attr("text-anchor", "end")
          .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
          .attr("font-size", fscale(fontSize)).attr("letter-spacing", "0.5px")
          .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.85)")
          .attr("stroke-width", 3).attr("stroke-linejoin", "round")
          .text("0°C");
        lEnergyBands.append("text")
          .attr("x", labelXBot).attr("y", botY + fontSize * 0.35)
          .attr("text-anchor", "end")
          .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
          .attr("font-size", fscale(fontSize)).attr("letter-spacing", "0.5px")
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
          .attr("font-size", fscale(fontSize)).attr("letter-spacing", "0.5px")
          .attr("fill", "none").attr("stroke", "rgba(6,6,26,0.85)")
          .attr("stroke-width", 3).attr("stroke-linejoin", "round")
          .text("Liquid Water");
        lEnergyBands.append("text")
          .attr("x", bracketLabelX).attr("y", midY + fontSize * 0.35)
          .attr("text-anchor", "end")
          .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
          .attr("font-size", fscale(fontSize)).attr("letter-spacing", "0.5px")
          .attr("fill", waterColor)
          .text("Liquid Water");

        // Easter egg: the states-of-water panel opens from a quiet pill
        // below the bracket — revealed once the bracket is readable on
        // screen, hidden at poster scale.
        if (botY - topY >= 20) {
        const pillW = 158, pillH = 24;
        const pillX = bracketX - pillW + 20, pillY = botY + 18;
        const pill = lEnergyBands.append("g")
          .attr("class", "water-phase-pill")
          .style("cursor", "pointer")
          // d3.zoom's svg-level mousedown starts a pan gesture and swallows
          // the click that should follow; keep presses on the pill local.
          .on("mousedown", (e) => e.stopPropagation())
          .on("click", (e) => {
            e.stopPropagation();
            // Dismiss the boot intro/title if it's still up — the panel
            // opens into the same part of the screen.
            document.getElementById("tour-close")?.click();
            openWaterPhasePanel();
            drawEnergyBands();
          });
        pill.append("rect")
          .attr("class", "wp-pill-rect")
          .attr("x", pillX).attr("y", pillY)
          .attr("width", pillW).attr("height", pillH).attr("rx", pillH / 2)
          .attr("fill", "rgba(10,14,40,0.75)")
          .attr("stroke", "rgba(125,197,255,0.45)")
          .attr("stroke-width", 1).attr("stroke-dasharray", "4 3");
        pill.append("text")
          .attr("x", pillX + pillW / 2).attr("y", pillY + pillH / 2 + fscale(10) * 0.35)
          .attr("text-anchor", "middle")
          .attr("font-family", "Inter, sans-serif").attr("font-weight", 500)
          .attr("font-size", fscale(10)).attr("letter-spacing", "0.4px")
          .attr("fill", "rgba(159,201,232,0.9)")
          .text("❆ the states of water");

        }

        // Rails: the panel lives in map space with its 0°C/100°C rows at
        // the exact logM of the bracket arrows, so the connectors are
        // simple horizontal dashed lines at those rows.
        if (isWaterPhaseOpen()) {
          const xPanel = px(WATER_PANEL_RIGHT_LOGR);
          [[topY], [botY]].forEach(([y]) => {
            lEnergyBands.append("line")
              .attr("x1", xPanel).attr("y1", y)
              .attr("x2", bracketX).attr("y2", y)
              .attr("stroke", "rgba(93,202,165,0.55)")
              .attr("stroke-width", 1).attr("stroke-dasharray", "2 5");
          });
        }
      }
    }
  }
  drawWaterPhasePanel();
}

// =============================================================
// Draw: the states-of-water inset (map-space easter egg)
// =============================================================
// The panel is authored in local units (water-phase.js) and projected
// into the map with one translate+scale, so it pans and zooms with the
// chart like any printed inset. Its vertical scale is pinned to the
// chart's temperature reading, making the 0°C/100°C rows land exactly
// on the Liquid Water bracket's logM rows.

const WATER_PANEL_RIGHT_LOGR = -4.6;

function drawWaterPhasePanel() {
  lWaterPhase.selectAll("*").remove();
  if (!isWaterPhaseOpen()) return;
  const d = vd();
  const ppu = cw / (d.x1 - d.x0);
  const s = WP_DEX_PER_UNIT * ppu;            // screen px per panel unit
  if (s * WP_FRAME.w < 80) return;            // sub-thumbnail — not worth drawing
  const leftLogR = WATER_PANEL_RIGHT_LOGR - WP_FRAME.w * WP_DEX_PER_UNIT;
  const g = lWaterPhase.append("g")
    .attr("class", "water-phase-g")
    .attr("transform", `translate(${px(leftLogR)},${py(WP_FRAME_TOP_LOGM)}) scale(${s})`);
  g.html(waterPhaseMarkup());
  g.selectAll("[data-key]")
    .style("cursor", "pointer")
    .on("mousedown", (e) => e.stopPropagation())
    .on("click", function (e) {
      e.stopPropagation();
      selectWaterPhaseKey(this.getAttribute("data-key"));
      drawWaterPhasePanel();
    });
  g.select("[data-close]")
    .style("cursor", "pointer")
    .on("mousedown", (e) => e.stopPropagation())
    .on("click", (e) => { e.stopPropagation(); closeWaterPhasePanel(); });
}

// =============================================================
// Draw: Dark Matter Search Regions
// =============================================================

function drawDarkMatterRegions() {
  lDarkMatter.selectAll("*").remove();
  drawPbhWindow();

  // WIMP label — near Compton line in particle region
  const wimpR = -16, wimpM = -22;
  const wx = px(wimpR), wy = py(wimpM);
  if (wx > -50 && wx < cw + 50 && wy > -50 && wy < ch + 50) {
    lDarkMatter.append("text")
      .attr("x", wx).attr("y", wy)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif")
      .attr("font-size", fscale(7)).attr("font-weight", 500)
      .attr("fill", "rgba(255,255,255,0.55)")
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
      .attr("font-size", fscale(7)).attr("font-weight", 500)
      .attr("fill", "rgba(255,255,255,0.55)")
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

/** Primordial black holes: the stretch of the Schwarzschild line where they could
 *  still be the dark matter (PBH_WINDOW), with an arrow at each end, outside the
 *  line like the other black-hole labels, naming what rules out the masses beyond
 *  it. Everything clicks through to the PBH article. */
let _pbhWindowHidden = false;   // narration scenes that draw their own window hide this one
function drawPbhWindow() {
  if (_pbhWindowHidden) return;
  const [m0, m1] = PBH_WINDOW.logM;
  const col = "#ff5c7c";
  const open = (e) => { e.stopPropagation(); openInfoPanel(PBH_WINDOW.slug, PBH_WINDOW.title); setSidebarOpen(true); };
  const ppd = Math.abs(px(1) - px(0));                 // screen px per decade
  const ang = screenAngle(1);                          // the Schwarzschild line on screen
  const along = [Math.cos(ang * Math.PI / 180), Math.sin(ang * Math.PI / 180)];   // up the line
  const inward = [-along[1], along[0]];                // toward the triangle (where objects can be)
  const outward = [-inward[0], -inward[1]];            // beyond the line
  const at = (m) => [px(schwarzschildR(m)), py(m)];
  const [ax, ay] = at(m0), [bx, by] = at(m1);
  const w = Math.max(6, Math.min(18, ppd * 0.35));     // band width, px
  const g = lDarkMatter.append("g").attr("class", "pbh-window").style("cursor", "pointer").on("click", open);
  // the band, on the triangle's side of the line
  g.append("polygon")
    .attr("points", [[ax, ay], [bx, by], [bx + inward[0] * w, by + inward[1] * w], [ax + inward[0] * w, ay + inward[1] * w]].map(p => p.join(",")).join(" "))
    .attr("fill", col).attr("opacity", 0.28);
  g.append("line").attr("x1", ax).attr("y1", ay).attr("x2", bx).attr("y2", by)
    .attr("stroke", col).attr("stroke-width", 2.5).attr("stroke-linecap", "round");
  if (currentK < 2) return;
  const font = (el, size, weight) => el.attr("font-family", "Inter, sans-serif")
    .attr("font-size", fscale(size)).attr("font-weight", weight).attr("letter-spacing", "1px")
    .attr("paint-order", "stroke").attr("stroke", "rgba(6,6,26,0.7)").attr("stroke-width", 2.5)
    .attr("stroke-linejoin", "round");
  // the limits: an arrow pushing in from each end, named by what sets it
  const len = Math.max(26, Math.min(70, ppd * 1.2));
  const off = 12;                                      // beyond the line
  [[ax, ay, 1, PBH_WINDOW.lower], [bx, by, -1, PBH_WINDOW.upper]].forEach(([x, y, dir, name]) => {
    const hx = x + outward[0] * off, hy = y + outward[1] * off;
    const tx = hx - along[0] * dir * len, ty = hy - along[1] * dir * len;
    g.append("line").attr("x1", tx).attr("y1", ty).attr("x2", hx).attr("y2", hy)
      .attr("stroke", col).attr("stroke-width", 1.6);
    const ux = along[0] * dir, uy = along[1] * dir, hs = 7;
    g.append("polygon").attr("fill", col).attr("points", [
      [hx, hy], [hx - ux * hs + uy * hs * 0.55, hy - uy * hs - ux * hs * 0.55],
      [hx - ux * hs - uy * hs * 0.55, hy - uy * hs + ux * hs * 0.55]].map(p => p.join(",")).join(" "));
    // the name past the arrow's tail, beyond the line, reading away from it
    const lx = tx + outward[0] * 6, ly = ty + outward[1] * 6;
    const t = g.append("text").attr("x", lx).attr("y", ly).attr("text-anchor", "end")
      .attr("dominant-baseline", "middle").attr("fill", col);
    name.forEach((line, i) => t.append("tspan").attr("x", lx)
      .attr("dy", i ? "1.2em" : `${-0.6 * (name.length - 1)}em`).text(line.toUpperCase()));
    font(t, 8, 600);
  });
  // the category's name along the line, centred, outside it like the other black-hole labels
  const [mx, my] = at((m0 + m1) / 2);
  const lx = mx + outward[0] * 12, ly = my + outward[1] * 12;
  const t = g.append("text").attr("x", lx).attr("y", ly).attr("text-anchor", "middle")
    .attr("fill", col).attr("transform", `rotate(${ang},${lx},${ly})`).text(PBH_WINDOW.label.toUpperCase());
  font(t, 9, 700);
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
    const ln = lDensity.append("line")
      .attr("x1", px(seg.x1)).attr("y1", py(seg.y1))
      .attr("x2", px(seg.x2)).attr("y2", py(seg.y2))
      .attr("stroke", isWater ? "#80deea" : "#ffffff")
      .attr("stroke-width", isWater ? 0.9 : (isMajor ? 0.6 : 0.3))
      .attr("opacity", isWater ? 0.35 : (isMajor ? 0.22 : 0.10));

    // Bold-hover mode: only the water line earns a hit stroke — the other
    // density diagonals read as grid and should stay quiet.
    if (isWater) {
      lDensity.append("line")
        .attr("x1", px(seg.x1)).attr("y1", py(seg.y1))
        .attr("x2", px(seg.x2)).attr("y2", py(seg.y2))
        .attr("stroke", "transparent").attr("stroke-width", 14)
        .on("mouseenter", () => { if (_boldHover) ln.classed("line-hot", true); })
        .on("mouseleave", () => ln.classed("line-hot", false));
    }
  }
  drawAirLine(d);
}

// Air at 1 atm (1.2 kg/m³, 20 °C), fading in as you zoom. Only from microbes
// to Earth's size: much bigger than that and a ball of air can't stay at
// sea-level pressure (it squeezes itself under its own weight).
const AIR_LOG_RHO = Math.log10(0.0012);
const AIR_LOGR = [-4, Math.log10(6.371e8)];   // 1 µm … Earth's radius, in cm
function drawAirLine(d) {
  const ppuY = ch / (d.y1 - d.y0);
  const fade = Math.max(0, Math.min(1, (ppuY - 14) / 10));
  if (fade <= 0) return;
  const b = DENSITY_SPHERE_C + AIR_LOG_RHO;
  const r0 = Math.max(AIR_LOGR[0], d.x0, (d.y0 - b) / 3);
  const r1 = Math.min(AIR_LOGR[1], d.x1, (d.y1 - b) / 3);
  if (r0 >= r1) return;
  const x1 = px(r0), y1 = py(3 * r0 + b), x2 = px(r1), y2 = py(3 * r1 + b);
  const color = "rgba(176,190,197,0.75)";
  const g = lDensity.append("g").attr("opacity", fade);
  g.append("line")
    .attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2)
    .attr("stroke", color).attr("stroke-width", 0.8).attr("stroke-dasharray", "5 4")
    .append("title").text("Air at 1 atm, 1.2 kg/m³: a ball on this line weighs as much as the air it pushes aside");

  // label near the upper end of what's on screen, along the line
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 120) return;
  const t = Math.max(0.1, 1 - 70 / len);
  const lx = x1 + (x2 - x1) * t, ly = y1 + (y2 - y1) * t;
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  const label = (paint) => g.append("text")
    .attr("x", lx).attr("y", ly - 4).attr("text-anchor", "end")
    .attr("transform", `rotate(${angle},${lx},${ly})`)
    .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
    .attr("font-size", fscale(10)).attr("letter-spacing", "0.5px")
    .call(paint).text("air · 1 atm");
  label(s => s.attr("fill", "none").attr("stroke", "rgba(6,6,26,0.85)").attr("stroke-width", 3).attr("stroke-linejoin", "round"));
  label(s => s.attr("fill", color));
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
        .attr("font-size", fscale(fontSize)).attr("letter-spacing", "0.5px")
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
        .attr("font-size", fscale(fontSize)).attr("letter-spacing", "0.5px")
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
      .attr("font-size", fscale(fontSize)).attr("letter-spacing", "1px")
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
      .attr("font-size", fscale(fontSize)).attr("letter-spacing", "1px")
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
      .attr("font-size", fscale(LABEL_SIZE)).attr("letter-spacing", LABEL_SPACING)
      .attr("fill", "white").attr("opacity", 0.10)
      .attr("transform", `rotate(${l.angle},${mx},${my})`)
      .text(l.text.toUpperCase());
  });
  projectFreshLabels(lRegLabel);
}

// =============================================================
// Draw: Objects (always-visible dots, smart labels)
// =============================================================

/** Display label for a category cluster. An EMPTY string in CAT_DISPLAY
 *  means "this category gets no cluster label" — it must suppress the label
 *  (null), never fall through to the raw internal key (the "macro" leak). */
function catDisplayLabel(catKey) {
  const disp = CAT_DISPLAY[catKey];
  if (disp === "") return null;
  return disp || catKey || "Objects";
}

const DOT_MIN_DIST = 6;      // px — hide dot only when circles overlap
const _objectVisibility = new VisibilityMemory();
const CLUSTER_THRESHOLD = 26; // px — objects within this form a cluster; smaller = more individual/specific labels

let _lastProjected = [];

// Dust dots are a lighter tint of their category colour so a 2 px dot still
// reads against the saturated background tiles.
const _dustColors = {};
function dustColor(catKey, sourceId) {
  const sub = SUBCAT_COLORS[DUST_SOURCE_SUBCAT[sourceId]];
  const key = sub ? `${catKey}/${sourceId}` : catKey;
  // Category dust is paled toward white; a subcategory colour keeps its
  // depth (only lightly lifted) so it still reads apart from its category.
  return _dustColors[key] ??= d3.interpolateRgb(sub || CATEGORIES[catKey]?.color || "#fff", "#fff")(sub ? 0.12 : 0.4);
}

// Easter egg: a "THE PERIODIC TABLE" title by the element dust. Clicking it
// toggles straight lines joining neighbours in the table — its period rows,
// group columns and the detached f-block's two rows and fourteen columns —
// so the familiar grid can be traced through where the elements actually
// sit by size & mass. Each element gets a ring in its type's colour, the
// families are named along their columns, and a box tells the story.
// Grid, types and families all come from atomic numbers (see data.js).
let _periodicOn = false;
let _periodicInView = false; // the title is up and the view sits on the elements (start-button suggestion)
const TYPE_COLOR = Object.fromEntries(ELEMENT_TYPES.map((t) => [t.id, t.color]));
const PERIODIC_LINES = (() => {
  const rows = new Map(), cols = new Map(), fRows = new Map(), fCols = new Map();
  const add = (m, k, z) => (m.get(k) || m.set(k, []).get(k)).push(z);
  for (let z = 1; z < ELEMENTS_BY_Z.length; z++) {
    const c = periodicCell(z);
    if (c.f == null) { add(rows, c.period, z); add(cols, c.group, z); }
    else { add(fRows, c.period, z); add(fCols, c.f, z); }
  }
  // Z already runs along each row and down each column; rows go first, light
  // periods leading (the title is placed by periods 1–3).
  const sorted = (m, kind) => [...m.keys()].sort((a, b) => a - b).map((k) => ({ kind, key: k, zs: m.get(k) }));
  return [...sorted(rows, "row"), ...sorted(fRows, "row"), ...sorted(cols, "column"), ...sorted(fCols, "fcolumn")];
})();

// The box (index.html #periodic-box, styled as a tour card) carries the
// story and the colour key; opening it closes the tour, and its × or the
// tour's start button turns the table off.
const periodicBox = document.getElementById("periodic-box");
document.getElementById("periodic-legend").innerHTML = ELEMENT_TYPES.map((t) =>
  `<li class="periodic-legend-item" style="color:${t.color}"><span class="periodic-legend-ring"></span>${t.label}</li>`).join("");
function setPeriodic(on) {
  _periodicOn = on;
  periodicBox.classList.toggle("tour-hidden", !on);
  document.body.classList.toggle("periodic-open", on);
  if (on && isTourActive()) closeTour();
  redraw();
  updateStartButtonLabel();
}
document.getElementById("periodic-close").addEventListener("click", () => setPeriodic(false));
document.getElementById("tour-start-btn").addEventListener("click", () => { if (_periodicOn) setPeriodic(false); });

function drawPeriodicTable(obstacles) {
  const wasInView = _periodicInView;
  _periodicInView = false;
  drawPeriodicLayer(obstacles);
  // The dust can arrive after a zoom has settled: refresh the suggestion
  // whenever being on the elements changes, not only at zoom end.
  if (_periodicInView !== wasInView) updateStartButtonLabel();
}
function drawPeriodicLayer(obstacles) {
  if (!_dustEnabled || _bigBangMode) return;
  const dustPos = dustPositions("element");
  if (!dustPos) return;
  const pos = (name) => {
    const d = dustPos.get(name);
    if (d) return d;
    const o = OBJECTS.find((x) => x.name === name && x.cat === "atomic");
    return o ? [o.logR, o.logM] : null;
  };
  const at = new Map(); // Z → [sx, sy]
  for (let z = 1; z < ELEMENTS_BY_Z.length; z++) {
    const p = pos(ELEMENTS_BY_Z[z]);
    if (p) at.set(z, [px(p[0]), py(p[1])]);
  }
  const lines = PERIODIC_LINES.map((l) => ({ ...l, zs: l.zs.filter((z) => at.has(z)) }));
  // Title only once the light rows are spread enough on screen to trace;
  // it sits by them (periods 1–3), clear of the crowded heavy end.
  const rows = lines.slice(0, 3).flatMap((l) => l.zs.map((z) => at.get(z)));
  if (rows.length < 2) return;
  const xs = rows.map((p) => p[0]), ys = rows.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  if (Math.max(x1 - x0, y1 - y0) < 120) return;
  {
    // In view = the chart's centre within the elements' extent (padded)
    const all = [...at.values()];
    const ax = all.map((p) => p[0]), ay = all.map((p) => p[1]);
    const ex0 = Math.min(...ax), ex1 = Math.max(...ax), ey0 = Math.min(...ay), ey1 = Math.max(...ay);
    const padX = (ex1 - ex0) * 0.25, padY = (ey1 - ey0) * 0.25;
    _periodicInView = cw / 2 > ex0 - padX && cw / 2 < ex1 + padX && ch / 2 > ey0 - padY && ch / 2 < ey1 + padY;
  }
  const color = dustColor("atomic");
  const gLines = lObjExtras.append("g"); // under the title, legend and labels
  const hits = (r) => obstacles.some((p) => r.x < p.x + p.w && r.x + r.w > p.x && r.y < p.y + p.h && r.y + r.h > p.y);
  const inside = (r) => r.x >= 0 && r.x + r.w <= cw && r.y >= 0 && r.y + r.h <= ch;

  // Category-label style, centred under the light rows (else above them)
  const FONT = 12, text = "THE PERIODIC TABLE";
  const w = text.length * (FONT * 0.68) + 8, h = FONT + 4;
  const drawTitle = (x, ty, anchor) => lObjExtras.append("text")
    .attr("class", "periodic-title")
    .attr("x", x).attr("y", ty).attr("text-anchor", anchor)
    .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
    .attr("font-size", fscale(FONT)).attr("letter-spacing", "1px")
    .attr("paint-order", "stroke").attr("stroke", "rgba(6,6,26,0.6)")
    .attr("stroke-width", 2).attr("stroke-linejoin", "round")
    .attr("fill", color).attr("opacity", _periodicOn ? 0.9 : 0.5)
    .style("cursor", "pointer").style("pointer-events", "all")
    // Toggle on press, not click: lObjExtras is rebuilt per frame, so the
    // node under mousedown is gone by mouseup and no click would fire. Not
    // propagating also keeps a pan from starting on the title.
    .on("mousedown touchstart", (e) => e.stopPropagation())
    .on("pointerdown", (e) => { e.stopPropagation(); setPeriodic(!_periodicOn); })
    .text(text);
  const cx = (x0 + x1) / 2;
  // Zoomed in past the light rows the title has nowhere to sit; the table
  // stays on, and the box (#periodic-box) is there to turn it off.
  for (const ty of [y1 + 26, y0 - 14]) {
    const rect = { x: cx - w / 2, y: ty - FONT, w, h };
    if (!inside(rect) || hits(rect)) continue;
    obstacles.push(rect);
    drawTitle(cx, ty, "middle");
    break;
  }
  if (!_periodicOn && !_narrPeriodic) return;
  if (!_periodicOn) gLines.attr("opacity", _narrPeriodic);

  // Grid lines, neutral; the colour is in the rings
  for (const l of lines) {
    if (l.zs.length < 2) continue;
    const row = l.kind === "row";
    gLines.append("path")
      .attr("class", "periodic-line")
      .attr("d", d3.line()(l.zs.map((z) => at.get(z))))
      .attr("fill", "none").attr("stroke", color)
      .attr("stroke-width", row ? 1.2 : 1)
      .attr("stroke-dasharray", row ? null : "4 3")
      .attr("stroke-linejoin", "round")
      .attr("opacity", row ? 0.55 : 0.275) // columns recede behind the rows
      .style("pointer-events", "none");
  }
  // A ring in its type's colour around every element
  for (const [z, [x, y]] of at) {
    if (x < -5 || x > cw + 5 || y < -5 || y > ch + 5) continue;
    gLines.append("circle").attr("class", "periodic-ring")
      .attr("cx", x).attr("cy", y).attr("r", 4)
      .attr("fill", "none").attr("stroke", TYPE_COLOR[elementType(z)])
      .attr("stroke-width", 1.4).attr("opacity", 0.9)
      .style("pointer-events", "none");
  }
  // Family names along their columns, in the family's colour where it has one
  PERIODIC_FAMILIES.forEach((f, i) => {
    const zs = lines.filter((l) => l.kind === "column" && f.groups.includes(l.key))
      .flatMap((l) => l.zs).filter((z) => !f.type || elementType(z) === f.type);
    labelAlongLine(zs.map((z) => at.get(z)), f.label.toUpperCase(), {
      id: `periodic-family-${i}`, off: -10, obstacles,
      color: f.type ? TYPE_COLOR[f.type] : color, opacity: (f.type ? 0.85 : 0.6) * (_periodicOn ? 1 : _narrPeriodic),
    });
  });
}

// Labels laid along the periodic-table rows/columns that the element dust
// draws (see ELEMENT_GUIDES). A label appears only when its line is long
// enough on screen to carry it, and its whole run along the line must stay
// clear of object labels, icons and category labels (it tries a few spots).
// They all wait for "THE PERIODIC TABLE" to be toggled on.
function drawElementGuides(obstacles) {
  if (!_periodicOn || !_dustEnabled || _bigBangMode) return;
  const dustPos = dustPositions("element");
  if (!dustPos) return;
  const pos = (name) => {
    const d = dustPos.get(name);
    if (d) return d;
    const o = OBJECTS.find((x) => x.name === name && x.cat === "atomic");
    return o ? [o.logR, o.logM] : null;
  };
  const color = dustColor("atomic");
  const FONT = 9, CHAR_W = FONT * 0.68;
  const hits = (r) => obstacles.some((p) =>
    r.x < p.x + p.w && r.x + r.w > p.x && r.y < p.y + p.h && r.y + r.h > p.y);
  const onScreen = (x, y) => x >= 0 && x <= cw && y >= 0 && y <= ch;

  ELEMENT_GUIDES.forEach((g, gi) => {
    const pts = g.elements.map(pos).filter(Boolean).map(([r, m]) => [px(r), py(m)]);
    if (pts.length < 2) return;
    const text = g.label.toUpperCase();
    const textW = text.length * CHAR_W + 8;

    if (g.kind === "cluster") {
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const span = Math.max(Math.max(...ys) - Math.min(...ys), Math.max(...xs) - Math.min(...xs));
      if (span < 24) return;
      const cy = (Math.min(...ys) + Math.max(...ys)) / 2 + 3;
      // right of the clump, else left of it
      for (const [x, anchor] of [[Math.max(...xs) + 10, "start"], [Math.min(...xs) - 10, "end"]]) {
        const rect = { x: anchor === "start" ? x : x - textW, y: cy - FONT, w: textW, h: FONT + 4 };
        if (!onScreen(x, cy) || hits(rect)) continue;
        obstacles.push(rect);
        lObjExtras.append("text").attr("x", x).attr("y", cy).attr("text-anchor", anchor)
          .attr("class", "element-guide")
          .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
          .attr("font-size", fscale(FONT)).attr("letter-spacing", "1px")
          .attr("fill", _periodicOn && g.type ? TYPE_COLOR[g.type] : color).attr("opacity", _periodicOn && g.type ? 0.85 : 0.6)
          .style("pointer-events", "none").text(text);
        return;
      }
      return;
    }

    labelAlongLine(pts, text, {
      id: `element-guide-${gi}`, off: 7, obstacles, color, opacity: 0.65,
    });
  });
}

/** Lay `text` along the straight best-fit line through screen points `pts`
 *  (only if the line is long enough to carry it), `off` px to one side, at
 *  the first of a few spots whose whole run clears `obstacles`. Returns
 *  whether it was placed. */
function labelAlongLine(pts, text, { id, off, obstacles, color, opacity }) {
  if (pts.length < 2) return false;
  const FONT = 9, CHAR_W = FONT * 0.68;
  const textW = text.length * CHAR_W + 8;
  const hits = (r) => obstacles.some((p) =>
    r.x < p.x + p.w && r.x + r.w > p.x && r.y < p.y + p.h && r.y + r.h > p.y);
  const onScreen = (x, y) => x >= 0 && x <= cw && y >= 0 && y <= ch;
  // Straight best-fit line through the dots (principal axis), not a curve
  // through every point: the transition metals zigzag, and text bent along
  // that zigzag is unreadable. Endpoints = the outermost dots projected onto
  // the axis, ordered left → right so the text reads upright.
  {
    const n = pts.length;
    const mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
    let sxx = 0, syy = 0, sxy = 0;
    for (const [x, y] of pts) { sxx += (x - mx) ** 2; syy += (y - my) ** 2; sxy += (x - mx) * (y - my); }
    const ang = 0.5 * Math.atan2(2 * sxy, sxx - syy);
    let ux = Math.cos(ang), uy = Math.sin(ang);
    if (ux < 0) { ux = -ux; uy = -uy; }
    const ts = pts.map(([x, y]) => (x - mx) * ux + (y - my) * uy);
    const t0 = Math.min(...ts), t1 = Math.max(...ts);
    pts = [[mx + t0 * ux, my + t0 * uy], [mx + t1 * ux, my + t1 * uy]];
  }
  const cum = [0];
  for (let i = 1; i < pts.length; i++)
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const len = cum[cum.length - 1];
  if (len < textW * 1.4) return false;
  const at = (s) => { // point + unit normal at arc length s
    let i = 1;
    while (i < pts.length - 1 && cum[i] < s) i++;
    const seg = cum[i] - cum[i - 1] || 1, t = Math.min(1, Math.max(0, (s - cum[i - 1]) / seg));
    const dx = (pts[i][0] - pts[i - 1][0]) / seg, dy = (pts[i][1] - pts[i - 1][1]) / seg;
    return { x: pts[i - 1][0] + t * dx * seg, y: pts[i - 1][1] + t * dy * seg, nx: dy, ny: -dx };
  };
  for (const frac of [0.5, 0.35, 0.65, 0.25, 0.75]) {
    const c = frac * len;
    if (c - textW / 2 < 0 || c + textW / 2 > len) continue;
    const boxes = [];
    let ok = true;
    for (let s2 = c - textW / 2; s2 <= c + textW / 2 + 0.1; s2 += 7) {
      const p = at(s2);
      const bx = p.x + p.nx * off, by = p.y + p.ny * off;
      if (!onScreen(bx, by)) { ok = false; break; }
      const box = { x: bx - 5, y: by - 6, w: 10, h: 12 };
      if (hits(box)) { ok = false; break; }
      boxes.push(box);
    }
    if (!ok) continue;
    obstacles.push(...boxes);
    lObjExtras.append("path").attr("id", id)
      .attr("d", d3.line()(pts))
      .attr("fill", "none").attr("stroke", "none");
    lObjExtras.append("text")
      .attr("class", "element-guide")
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", fscale(FONT)).attr("letter-spacing", "1px")
      .attr("fill", color).attr("opacity", opacity)
      .attr("dy", off < 0 ? -(-off - 3) : off + 3)
      .style("pointer-events", "none")
      .append("textPath").attr("href", `#${id}`)
      .attr("startOffset", `${(frac * 100).toFixed(0)}%`).attr("text-anchor", "middle")
      .text(text);
    return true;
  }
  return false;
}

// Once the periodic-table rows in the element dust are readable, the atom
// and molecule pictures (Hydrogen, Iron, Water, Glucose…) would sit on top
// of them: show the hand-placed atoms and molecules as plain dots instead. "Readable" = the element dust is
// on and the view has ≥ 150 px per decade of mass.
const ATOM_ICON_HIDE_PX_PER_DECADE = 150;
let _atomIconsHidden = false;

function mapIconShown(o, anyName = false) {
  if (!_iconsEnabled || !ICON_BY_SLUG[o.slug]) return false;
  if (_iconOnly && !anyName && !_iconOnly.has(o.name)) return false;
  if (_ogShot) return true; // preview cards always show the picture
  // projected objects carry the category key in catKey (cat is the style object)
  return !(_atomIconsHidden && (o.catKey || o.cat) === "atomic"); // atoms and molecules
}

// Data/collision coordinates stay anchored; only presentation moves in depth.
function parallaxOn() {
  return !_reduceMotion && !_posterLabels && !_bigBangMode &&
    !PARALLAX_OFF;
}
function depthPoint(o, depth) { return planePoint(o.sx, o.sy, cw, ch, parallaxOn() ? depth : 0); }
function objectPicturePoint(o, growth = 1) {
  const body = effectiveIconSize() * iconSizeMult(o) / (ICON_SIZE_MULT[o.slug] || 1);
  return iconPoint(o.sx, o.sy, cw, ch, body, growth, parallaxOn(), o.slug);
}
// These annotation groups are rebuilt each frame; preserve rotations while
// translating text anchors, without stretching type along with the grid.
function projectFreshLabels(layer) {
  layer.selectAll("text[x][y]").each(function() {
    const text = d3.select(this), anchor = { sx: +text.attr("x"), sy: +text.attr("y") };
    text.attr("transform", parallaxTranslation(anchor, depthPoint(anchor, PARALLAX.labels)) + " " + (text.attr("transform") || ""));
  });
}
function parallaxTranslation(o, point) { return "translate(" + (point.x-o.sx) + "," + (point.y-o.sy) + ")"; }
function drawObjects() {
  {
    const d = vd();
    _atomIconsHidden = _dustEnabled && !_bigBangMode && !!dustPositions("element") &&
      ch / Math.abs(d.y1 - d.y0) >= ATOM_ICON_HIDE_PX_PER_DECADE;
  }
  // Retained rendering: object groups, icons, and labels are persistent
  // nodes updated through keyed joins below — per frame this is attribute
  // writes, not DOM teardown. Only the small extras layer (cluster/category/
  // BH labels, ~20 nodes) rebuilds each call.
  lObjExtras.selectAll("*").remove();
  const d = vd();
  const icoSize = effectiveIconSize();
  _objectVisibility.update([px(1)-px(0), py(1)-py(0)], JSON.stringify([
    cw, ch, _iconSize, _fontScale, _iconsEnabled, _iconDensity, _labelsEnabled,
    _dustEnabled, dustReady(), _isMobile, _posterLabels, _atomIconsHidden,
    _bigBangMode && [_bigBangObjectOverrides, _bigBangObjectOpacity],
    _iconOnly && [..._iconOnly], // a narration scene's picture set
    _iconForce && [..._iconForce],
    _iconHide && [..._iconHide],
  ]));

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
        imagePriority: mapIconShown(o) ? spaceImagePriority(o.slug, o.cat) : 1,
        sx: px(logR),
        sy: py(logM),
        cat: CATEGORIES[o.cat],
        color: SUBCAT_COLORS[o.subcat] || CATEGORIES[o.cat]?.color || "#fff",
        bbOpacity,
      };
    })
    .filter(o =>
      o &&
      (!o.minK || currentK >= o.minK)
    )
    .sort((a, b) => {
      // Icon objects get a slight priority boost (lower z = shown first)
      const aZ = mapIconShown(a) ? a.z - 0.5 : a.z;
      const bZ = mapIconShown(b) ? b.z - 0.5 : b.z;
      return a.imagePriority - b.imagePriority || aZ - bZ;
    });

  // Reserve all higher-priority candidates, including hidden ones. Source
  // order resolves equal priorities; last frame's winners never alter rank.
  const visibleDots = priorityCircles(projected, () => DOT_MIN_DIST / 2);
  const icoR = (o) => icoSize * iconSizeMult(o) / 2;
  const roomR = (o) => icoR(o) * iconRoomMult(o.slug, o.catKey || o.cat);   // for overlaps, not drawing
  const iconOrder = projected.filter(o => mapIconShown(o) && !_iconHide?.has(o.name));
  // One pass for every picture, hand-placed or from the catalogue: real photographs
  // first, then importance on one scale (an object's z; a catalogue dot's rank in its
  // band, mapped onto z), the hand-placed one first on a tie; two never overlap. In a
  // narration scene (_iconOnly) the pictures it names come first, one giving way only
  // to a more important named one it overlaps; with _iconFill every other picture that
  // fits joins them, at the density's room. Forced ones (Venus behind Earth) show anyway.
  const dustPics = dustPictureCandidates({
    px, py, hidden: !_dustEnabled || _bigBangMode,
    labels: _labelsEnabled && !DUST_LABELS_OFF && !_posterLabels, fillPictures: !!_iconFill,
    iconOf: _iconsEnabled && !_posterLabels ? (name,size) => {
      const slug=nameToSlug(name);
      return CURATED_SLUGS.has(slug) ? null : iconUrlForSize(slug,size) || null;
    } : null,
    iconSizeAt: (logR,name,cat) => icoSize * iconSizeMult({logR,slug:nameToSlug(name),cat}),
    imagePriorityOf: (name,cat) => spaceImagePriority(nameToSlug(name),cat),
    roomOf: (name, cat) => iconRoomMult(nameToSlug(name), cat),
  }).filter(p => p.r*2 >= dustIconMin() && !_iconHide?.has(p.name));
  const asObj = (o) => ({ o, sx:o.sx, sy:o.sy, room:roomR(o), imagePriority:o.imagePriority, importance:o.z ?? 3, curated:0 });
  const asDust = (p) => ({ p, sx:p.sx, sy:p.sy, room:p.room ?? p.r, imagePriority:p.imagePriority, importance:dustImportance(p.rank), curated:1 });
  const byRank = (a,b) => a.imagePriority-b.imagePriority || a.importance-b.importance || a.curated-b.curated;
  const named = _iconOnly ? [...iconOrder.map(asObj), ...dustPics.filter(p => _dustPictures?.has(p.name)).map(asDust)].sort(byRank) : [];
  const rest = (!_iconOnly ? [...iconOrder.map(asObj), ...dustPics.map(asDust)]
    : _iconFill ? [...projected.filter(o => !_iconOnly.has(o.name) && !_iconHide?.has(o.name) && mapIconShown(o, true)).map(asObj),
        ...dustPics.filter(p => !_dustPictures?.has(p.name)).map(asDust)]
    : []).sort(byRank);
  const room = iconRoom();
  const chosen = priorityCircles(named, c => c.room);
  // (the named ones showing block outright: no picture lands on a named one)
  const namedShown = named.filter(c => chosen.has(c)).map(c => ({ ...c, imagePriority: -Infinity }));
  for (const c of priorityCircles(rest, c => c.room, room, namedShown)) chosen.add(c);
  // (a picture that lost only to hidden ones fills the hole, clear of every one showing)
  for (const c of rest) if (!chosen.has(c) && ![...chosen].some(o => (c.sx-o.sx)**2 + (c.sy-o.sy)**2 < ((c.room+o.room)*room)**2)) chosen.add(c);
  const pictures = [...named, ...rest];
  const shownIcons = new Set(pictures.filter(c => c.o && chosen.has(c)).map(c => c.o));
  const dustChosen = pictures.filter(c => c.p && chosen.has(c));
  // forced pictures (videos: Venus behind Earth) show whatever they overlap;
  // drawn least important first, they sit behind the picture they overlap
  if (_iconForce) for (const o of iconOrder) if (_iconForce.has(o.name)) { shownIcons.add(o); visibleDots.add(o); }
  projected.forEach(o => {
    o._showDot = visibleDots.has(o);
    o._showIcon = o._showDot && shownIcons.has(o);
    if (o._showIcon) o._icoR = icoR(o);
  });
  // Decide against the whole curated collection, not the viewport contents.
  // A neighbour crossing an edge cannot promote/demote a stationary object.
  for (const o of projected) {
    const saved = _objectVisibility.decisions.get(o.slug);
    if (saved) {
      o._showDot = saved.dot; o._showIcon = saved.icon;
      if (o._showIcon) o._icoR = icoR(o);
    } else _objectVisibility.decisions.set(o.slug, { dot:o._showDot, icon:o._showIcon });
  }
  // (an object kept by the visibility memory still wins its place)
  const showingObjects = projected.filter(o => o._showIcon).map(o => ({ sx:o.sx, sy:o.sy, r:roomR(o) }));
  _dustPictureChoice = new Set(dustChosen.filter(c => !showingObjects.some(o => (c.sx-o.sx)**2 + (c.sy-o.sy)**2 < (c.room+o.r)**2)).map(c => c.p.i));

  // --- Cluster detection: connected components within CLUSTER_THRESHOLD px ---
  const th2 = _posterLabels ? -1 : CLUSTER_THRESHOLD * CLUSTER_THRESHOLD; // poster: no clusters
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
            label = parts.length >= 2 ? parts.slice(0, -1).join(", ") + " & " + parts[parts.length - 1] : catDisplayLabel(catKey);
          } else if (nonBH.length === 0 && subcats.length > 0) {
            // All subcats are BH — skip this cluster label (dedicated labels handle it)
            label = null;
          } else {
            label = catDisplayLabel(catKey);
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

  // Icon bounds participate in collision testing (with a per-object owner
  // exemption) so text flips to a free side instead of starting beneath a
  // neighbor's glyph ("lanets", "gr A*", "Soccer Bal"...).
  const iconRects = [];
  projected.forEach(o => {
    if (!o._showIcon) return;
    const s = icoSize * iconSizeMult(o) * (parallaxOn() ? 1 + 2 * PARALLAX.icon * (1 + PARALLAX.variation) / (ICON_SIZE_MULT[o.slug] || 1) : 1);
    iconRects.push({ x: o.sx - s / 2, y: o.sy - s / 2, w: s, h: s, owner: o });
  });
  const hitsIcons = (rect, owner) => iconRects.some(r =>
    r.owner !== owner &&
    rect.x < r.x + r.w && rect.x + rect.w > r.x &&
    rect.y < r.y + r.h && rect.y + rect.h > r.y
  );

  // Place cluster labels first — never show the same label twice
  const usedLabels = new Set();
  clusters.forEach(cl => {
    const labelText = cl.label;
    if (usedLabels.has(labelText.toUpperCase())) {
      cl._showLabel = false;
      cl._labelPos = labelPositions[0];
      return;
    }
    // Atom/molecule category clusters print as spaced 12px caps (see render)
    const subcats = [...new Set(cl.members.map(p => p.subcat).filter(Boolean))];
    cl._broad = cl.cat === CATEGORIES.atomic && subcats.length === 1 && !!SUBCAT_LABELS[subcats[0]];
    const labelW = cl._broad ? labelText.length * 9 + 12 : labelText.length * 5.5 + 12;
    const labelH = cl._broad ? 16 : 12;

    for (const pos of labelPositions) {
      const lx = pos.anchor === "end" ? cl.cx + pos.dx - labelW
               : pos.anchor === "middle" ? cl.cx + pos.dx - labelW / 2
               : cl.cx + pos.dx;
      const ly = cl.cy + pos.dy - labelH;
      const rect = { x: lx, y: ly, w: labelW, h: labelH };

      const collides = placedLabels.some(p =>
        rect.x < p.x + p.w + 6 && rect.x + rect.w + 6 > p.x &&
        rect.y < p.y + p.h + 2 && rect.y + rect.h + 2 > p.y
      ) || hitsIcons(rect, null);

      if (!collides) {
        cl._labelPos = pos;
        cl._labelRect = rect;
        cl._showLabel = true;
        usedLabels.add(labelText.toUpperCase());
        placedLabels.push(rect);
        break;
      }
    }
    if (!cl._labelPos) {
      // No icon-free spot: fall back to the old side placement rather than
      // dropping the label (labels stay visible; overlap beats absence).
      cl._labelPos = labelPositions[0];
      cl._showLabel = true;
      usedLabels.add(labelText.toUpperCase());
    }
  });

  // Place individual labels for non-clustered objects
  projected.forEach(o => {
    if (!o._showDot) { o._showLabel = false; o._labelPos = null; return; }
    if (o._inCluster) { o._showLabel = false; o._labelPos = labelPositions[0]; return; }

    const labelW = _posterLabels ? posterLabelWidth(o.name) + 6 : o.name.length * 6 + 10;
    const labelH = _posterLabels ? _posterLabelSize + 3 : 13;

    // Icon-bearing objects push their own label just outside the glyph
    const ownR = o._showIcon ? icoSize * iconSizeMult(o) * (0.5 + (parallaxOn() ? PARALLAX.icon * (1 + PARALLAX.variation) / (ICON_SIZE_MULT[o.slug] || 1) : 0)) : 0;
    const positions = ownR > 8 ? [
      { dx: ownR + 4, dy: 3.5, anchor: "start" },
      { dx: -(ownR + 4), dy: 3.5, anchor: "end" },
      { dx: 0, dy: -(ownR + 4), anchor: "middle" },
      { dx: 0, dy: ownR + 12, anchor: "middle" },
    ] : labelPositions;

    for (const pos of positions) {
      const lx = pos.anchor === "end" ? o.sx + pos.dx - labelW
               : pos.anchor === "middle" ? o.sx + pos.dx - labelW / 2
               : o.sx + pos.dx;
      const ly = o.sy + pos.dy - labelH;
      const rect = { x: lx, y: ly, w: labelW, h: labelH };

      const collides = placedLabels.some(p =>
        rect.x < p.x + p.w + 6 && rect.x + rect.w + 6 > p.x &&
        rect.y < p.y + p.h + 2 && rect.y + rect.h + 2 > p.y
      ) || hitsIcons(rect, o)
        // Poster: a label must sit fully inside the panel — it is cut out.
        || (_posterLabels && (rect.x < 2 || rect.y < 2 || rect.x + rect.w > cw - 2 || rect.y + rect.h > ch - 2));

      if (!collides) {
        o._showLabel = true;
        o._labelPos = pos;
        o._labelRect = rect;
        placedLabels.push(rect);
        break;
      }
    }

    if (!o._labelPos && !_posterLabels) {
      // Nothing clears both labels AND icons — retry ignoring icons and
      // accept glyph overlap rather than dropping the label (today's
      // behavior; overlap beats absence). Only genuine label-vs-label
      // clashes still suppress.
      for (const pos of positions) {
        const lx = pos.anchor === "end" ? o.sx + pos.dx - labelW
                 : pos.anchor === "middle" ? o.sx + pos.dx - labelW / 2
                 : o.sx + pos.dx;
        const ly = o.sy + pos.dy - labelH;
        const rect = { x: lx, y: ly, w: labelW, h: labelH };
        const labelClash = placedLabels.some(p =>
          rect.x < p.x + p.w + 6 && rect.x + rect.w + 6 > p.x &&
          rect.y < p.y + p.h + 2 && rect.y + rect.h + 2 > p.y
        );
        if (!labelClash) {
          o._showLabel = true;
          o._labelPos = pos;
          o._labelRect = rect;
          placedLabels.push(rect);
          break;
        }
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
      categoryLabels.push({ cx, cy, labelText, color: SUBCAT_LABEL_COLORS[subcat] || SUBCAT_COLORS[subcat] || members[0].cat.color });
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
    const subColor = subcats.length === 1 ? SUBCAT_LABEL_COLORS[subcats[0]] || SUBCAT_COLORS[subcats[0]] : null;

    // A cluster of atoms or of molecules names a broad category ("MOLECULES"),
    // so it reads like the spread-out category labels ("ATOMS") beside it.
    if (cl._broad) {
      lObjExtras.append("text")
        .attr("x", lx).attr("y", ly)
        .attr("text-anchor", pos.anchor)
        .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
        .attr("font-size", fscale(CATEGORY_LABEL_FONT)).attr("letter-spacing", "1px")
        .attr("paint-order", "stroke")
        .attr("stroke", "rgba(6,6,26,0.6)")
        .attr("stroke-width", 2).attr("stroke-linejoin", "round")
        .attr("fill", subColor || cl.cat.color)
        .attr("class", "obj-label obj-cluster-label")
        .attr("opacity", CATEGORY_LABEL_OPACITY)
        .text(labelText.toUpperCase());
      return;
    }

    // Single node: paint-order renders the outline behind the fill,
    // replacing the old shadow-text + fill-text pair.
    lObjExtras.append("text")
      .attr("x", lx).attr("y", ly)
      .attr("text-anchor", pos.anchor)
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", fscale(10)).attr("letter-spacing", "0.5px")
      .attr("paint-order", "stroke")
      .attr("stroke", "rgba(6,6,26,0.85)")
      .attr("stroke-width", 3).attr("stroke-linejoin", "round")
      .attr("fill", subColor || cl.cat.color)
      .attr("class", "obj-label obj-cluster-label")
      .text(labelText);
  });

  // --- Render category labels (spread-out groups, center of mass) ---
  categoryLabels.forEach(cl => {
    lObjExtras.append("text")
      .attr("x", cl.cx).attr("y", cl.cy)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", fscale(CATEGORY_LABEL_FONT)).attr("letter-spacing", "1px")
      .attr("paint-order", "stroke")
      .attr("stroke", "rgba(6,6,26,0.6)")
      .attr("stroke-width", 2).attr("stroke-linejoin", "round")
      .attr("fill", cl.color)
      .attr("class", "obj-category-label")
      .attr("opacity", CATEGORY_LABEL_OPACITY)
      .style("pointer-events", "none")
      .text(cl.labelText.toUpperCase());
  });

  // --- Periodic-table guides along the element dust (zoomed in only) ---
  const guideObstacles = [
    ...placedLabels,
    ...iconRects,
    ...categoryLabels.map((c) => {
      const w = c.labelText.length * 12 * 0.7 + 40; // generous: spaced caps
      return { x: c.cx - w / 2, y: c.cy - 16, w, h: 24 };
    }),
  ];
  drawPeriodicTable(guideObstacles);
  drawElementGuides(guideObstacles);

  // --- Render BH subcategory labels along the Schwarzschild line ---
  const BH_SUBCAT_POSITIONS = [
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
      .attr("font-size", fscale(CATEGORY_LABEL_FONT)).attr("font-weight", 600)
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
    const minDist = d3.min(bhScreenPts.slice(1), (p, i) => Math.hypot(p.x - bhScreenPts[i].x, p.y - bhScreenPts[i].y));

    if (minDist < 200) {
      // Labels would overlap — show single consolidated "BLACK HOLES"
      const midM = (BH_SUBCAT_POSITIONS[0].logM + BH_SUBCAT_POSITIONS.at(-1).logM) / 2;
      renderBHLabel("BLACK HOLES", midM);
    } else {
      BH_SUBCAT_POSITIONS.forEach(bh => renderBHLabel(bh.label.toUpperCase(), bh.logM, bh.slug));
    }
  }

  projectFreshLabels(lObjExtras);

  // --- Render object dots, icons, and labels via keyed joins ---
  // Cull only after making visibility/layout decisions. Keep a generous
  // margin so wide icons and labels slide through the edge rather than pop.
  const shownDots = projected.filter(o => o._showDot &&
    o.sx >= -256 && o.sx <= cw + 256 && o.sy >= -256 && o.sy <= ch + 256);
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
      g.attr("transform", parallaxTranslation(o, depthPoint(o, PARALLAX.dust)));
      const dotDisplay = o._showIcon ? "none" : null;
      g.select(".obj-hit").attr("cx", o.sx).attr("cy", o.sy);
      g.select(".obj-glow").attr("cx", o.sx).attr("cy", o.sy)
        .attr("fill", o.color).attr("display", dotDisplay);
      g.select(".obj-dot").attr("cx", o.sx).attr("cy", o.sy)
        .attr("fill", o.color).attr("display", dotDisplay);
    })
    .order();

  // (2) Icons: fallback dot + image, keyed by slug in their own layer (above
  // the noise overlay). Luminous pictures carry their dark backing inside the
  // picture (src/luminous-art.js), so every icon is drawn the same way.
  // Drawn least important first, so a higher-priority picture (a person)
  // sits in front of a lower one (the water cube) where they overlap.
  lIcons.selectAll("g.icon-g")
    .data(iconObjs.slice().reverse(), o => o.slug)
    .join(enter => {
      const g = enter.append("g").attr("class", "icon-g");
      g.each(function(o) {
        const gg = d3.select(this);
        // Fallback dot: icons fetch on demand, so on a cold cache the
        // <image> is empty until its webp arrives — the dot keeps the
        // object visible. It must HIDE once the image loads: a glow's faint
        // edge doesn't cover what's beneath, so a still-visible dot would
        // show through it permanently.
        gg.append("circle").attr("class", "icon-fallback-dot")
          .attr("r", 2.8).attr("fill", o.color);
        const imgEl = gg.append("image")
          .attr("class", "obj-icon")
          .attr("data-slug", o.slug)
          .attr("mask",blackHoleMask(o.slug)||(softSpaceIcon(o)?spaceEdgeMask(o.slug):null))
          .node();
        imgEl.addEventListener("load", () => {
          _loadedIconUrls.add(ICON_BY_SLUG[o.slug]);
          gg.select(".icon-fallback-dot").attr("display", "none");
        }, { once: true });
      });
      return g;
    }, update=>update, exit=>exitReveal(exit,(o,node)=>{
      const current=projected.find(q=>q.slug===o.slug);
      if(current){const picture=objectPicturePoint(current,node.__iconGrowth??1);d3.select(node).attr('transform',`translate(${picture.x-o.sx},${picture.y-o.sy})`);}
      return iconRevealOptions(o,node);
    }))
    .each(function(o) {
      const gg = d3.select(this);
      const bbOp = (_bigBangMode && o.bbOpacity < 1) ? o.bbOpacity : null;
      const objIcoSize = icoSize * iconSizeMult(o);
      const growth = this.__iconGrowth ?? 1;
      gg.attr("transform", parallaxTranslation(o, objectPicturePoint(o, growth)));
      gg.select(".icon-fallback-dot")
        .attr("cx", o.sx).attr("cy", o.sy)
        .attr("display", _loadedIconUrls.has(ICON_BY_SLUG[o.slug]) ? "none" : null)
        .attr("opacity", bbOp == null ? 0.85 : 0.85 * bbOp);
      gg.select(".obj-icon")
        .style("transform",growth===1?null:`scale(${growth})`)
        .attr("href", iconUrlForSize(o.slug, objIcoSize))
        .attr("x", o.sx - objIcoSize / 2).attr("y", o.sy - objIcoSize / 2)
        .attr("width", objIcoSize).attr("height", objIcoSize)
        .attr("opacity", bbOp);
      revealIcon(this,true,iconRevealOptions(o,this));
    })
    .order();

  // (3) Labels: one text per object with paint-order (outline behind fill,
  // replacing the shadow+fill pair), keyed by slug, behind icons.
  lLabels.selectAll("text.obj-label")
    .data(shownDots, o => o.slug)
    .join(enter => enter.append("text")
      .attr("class", "obj-label")
      .attr("data-label-slug", o => o.slug)
      .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
      .attr("font-size", fscale(10)).attr("letter-spacing", "0.5px")
      .attr("paint-order", "stroke")
      .attr("stroke", "rgba(6,6,26,0.85)")
      .attr("stroke-width", 3).attr("stroke-linejoin", "round")
      .text(o => o.name))
    .attr("transform", o => parallaxTranslation(o, depthPoint(o, PARALLAX.labels)))
    .attr("x", o => o.sx + o._labelPos.dx)
    .attr("y", o => o.sy + o._labelPos.dy)
    .attr("text-anchor", o => o._labelPos.anchor)
    .attr("fill", o => SUBCAT_LABEL_COLORS[o.subcat] || o.color)
    .classed("obj-label-related", o => !!_labelFocus?.has(o.name))
    .each(function(o) {
      // Poster: bold Helvetica caps, sized for print (window.__poster).
      if (!_posterLabels) return;
      d3.select(this)
        .attr("font-family", _posterLabelFont).attr("font-weight", 700)
        .attr("font-size", _posterLabelSize)
        .attr("letter-spacing", `${_posterLabelTracking}em`)
        .attr("stroke-width", 2.5)
        .text(o.name.toUpperCase());
    })
    .attr("display", o => (_labelsEnabled && o._showLabel) ? null : "none");

  _lastProjected = shownDots.filter(o => o.sx >= 0 && o.sx <= cw && o.sy >= 0 && o.sy <= ch);

  // Dust fills whatever room the curated objects leave — it never sits on
  // a curated dot, icon or visible label.
  drawDust(lDust, {
    px, py, cw, ch, mobile: _isMobile,
    parallax: parallaxOn(), reducedMotion:_reduceMotion, iconLayer: lIcons, depthKeyOf: nameToSlug,
    bodySizeAt: (size, name) => size / (ICON_SIZE_MULT[nameToSlug(name)] || 1),
    visibilityEpoch: _objectVisibility.epoch,
    hidden: !_dustEnabled || _bigBangMode,
    pictures: _dustPictures,
    // a few dust names, map-style; not in the narrated videos or the poster
    labels: _labelsEnabled && !DUST_LABELS_OFF && !_posterLabels, fontScale: _fontScale,
    fillPictures: _dustFill && _iconsEnabled,
    labelColorOf: (cat, id) => SUBCAT_COLORS[DUST_SOURCE_SUBCAT[id]] || CATEGORIES[cat]?.color || "#fff",
    // a famous named dot with a picture (content/icons/<its slug>.webp) can
    // show it when there's room — not one a curated object already shows
    iconRoom: iconRoom(), iconMin: dustIconMin(),   // Settings → Icons (videos: setIconDensity)
    iconOf: _iconsEnabled && !_posterLabels ? (name, size) => {
      const slug = nameToSlug(name);
      return CURATED_SLUGS.has(slug) ? null : iconUrlForSize(slug, size) || null;
    } : null,
    // as iconSizeMult, per-object multipliers included
    iconSizeAt: (logR, name, cat) => icoSize * iconSizeMult({logR, slug: nameToSlug(name), cat}),
    roomOf: (name, cat) => iconRoomMult(nameToSlug(name), cat),
    imagePriorityOf: (name,cat) => spaceImagePriority(nameToSlug(name),cat),
    pictureChoice: _dustPictureChoice,   // chosen with the objects' pictures, in one pass
    iconBlend: (cat) => LUMINOUS_CATS.has(cat),   // luminous: no cast shadow
    softSpaceOf:(cat,name)=>_softSpace&&isDiffuseSpaceArt(cat,nameToSlug(name)),
  }, {
    // Catalogue pictures share the same hierarchy: all curated candidates
    // outrank them, not just this frame's visible winners or moving labels.
    // a picture already showing always keeps its room (pictures never overlap); hidden
    // ones keep theirs by priority, so a real photo can still take a generated one's place
    priorityCircles: projected.map(o => ({sx:o.sx,sy:o.sy,r:o._showIcon || mapIconShown(o)?roomR(o):DOT_MIN_DIST/2,imagePriority:o._showIcon ? -Infinity : o.imagePriority})),
    dots: shownDots,
    rects: _labelsEnabled ? placedLabels : [],
    // Icons keep dust out with a CIRCLE, not their square box: a square gap
    // shows as an empty frame around soft, glowing luminous art (globular
    // cluster, nebulae). The circle covers the core of the body only (Saturn's
    // ball, not its rings), so dust still shows close around a picture's edge;
    // luminous art fades out well inside its box, so its circle is tighter.
    circles: shownDots.filter(o => o._showIcon).map(o => {
      const body = icoSize * iconSizeMult(o) / (ICON_SIZE_MULT[o.slug] || 1);
      return { sx: o.sx, sy: o.sy, r: body * (iconIsLuminous(o) ? 0.26 : 0.38) };
    }),
  }, dustColor);
  lDustHover.selectAll("*").remove();
  drawIconShadows([
    // Stellar light and the transitional brown-dwarf shadow share one key.
    ...shownDots.filter(o=>o._showIcon&&STAR_BODY_FRAMES[o.slug]&&(STAR_GLOWS||BROWN_DWARFS.has(o.slug)))
      .map(o=>stellarShadowData({key:o.slug,slug:o.slug,sx:o.sx,sy:o.sy,r:icoSize*iconSizeMult(o)/2,logM:o.logM},o.color)),
    ...dustIcons().filter(d=>STAR_BODY_FRAMES[nameToSlug(d.name)]&&(STAR_GLOWS||BROWN_DWARFS.has(nameToSlug(d.name))))
      .map(d=>stellarShadowData({key:`dust:${d.i}`,...d,slug:nameToSlug(d.name)},"#ffd27a")),
    ...shownDots.filter(o => o._showIcon && (!iconIsLuminous(o) || SHADOWED_SCREEN_SPHERES.has(o.slug)))
      .map(o => ({ key: o.slug, sx: o.sx, sy: o.sy, r: icoSize * iconSizeMult(o) / 2, img: SHADOW_BY_SLUG[o.slug], round: SHADOW_SETTINGS_BY_SLUG[o.slug]?.mode === "shared", roundOffsetScale: SHADOW_SETTINGS_BY_SLUG[o.slug]?.roundOffsetScale, registered: SHADOW_SETTINGS_BY_SLUG[o.slug]?.registered || SHADOW_SETTINGS_BY_SLUG[o.slug]?.mode === "long", anchorBase: SHADOW_SETTINGS_BY_SLUG[o.slug]?.anchorBase })),
    ...dustIcons().filter(d => !d.blend || SHADOWED_SCREEN_SPHERES.has(nameToSlug(d.name))).map(d => ({ key: `dust:${d.i}`, ...d, img: SHADOW_BY_SLUG[nameToSlug(d.name)], round: SHADOW_SETTINGS_BY_SLUG[nameToSlug(d.name)]?.mode === "shared", roundOffsetScale: SHADOW_SETTINGS_BY_SLUG[nameToSlug(d.name)]?.roundOffsetScale, registered: SHADOW_SETTINGS_BY_SLUG[nameToSlug(d.name)]?.registered || SHADOW_SETTINGS_BY_SLUG[nameToSlug(d.name)]?.mode === "long", anchorBase: SHADOW_SETTINGS_BY_SLUG[nameToSlug(d.name)]?.anchorBase })),
  ],new Map(projected.map(o=>[o.slug,o])));
  drawDustShadows();
  const iconShadowKeys=new Set(lShadows.selectAll('g.icon-shadow').data().map(d=>d.key));
  lShadows.selectAll('circle.object-dot-shadow').data(SHADOWS&&!_bigBangMode?shownDots.filter(o=>!o._showIcon):[],o=>o.slug)
    .join('circle').attr('class','object-dot-shadow').attr('cx',o=>o.sx+3).attr('cy',o=>o.sy+4)
    .attr('r',2.8).attr('fill','#000').attr('opacity',o=>iconShadowKeys.has(o.slug)?0:.35).attr('filter','url(#dust-shadow-blur)');
}

function iconRevealOptions(o,node) {
  const picture=objectPicturePoint(o,node.__iconGrowth??1),dot=depthPoint(o,PARALLAX.dust);
  return {x:o.sx,y:o.sy,dx:dot.x-picture.x,dy:dot.y-picture.y,size:effectiveIconSize()*iconSizeMult(o),color:o.color,reducedMotion:_reduceMotion,
    onProgress:p=>{lObjMain.selectAll('g.obj-g').filter(d=>d.slug===o.slug).selectAll('.obj-dot,.obj-glow').style('opacity',p<1?0:null);},
    onDone:()=>{lObjMain.selectAll('g.obj-g').filter(d=>d.slug===o.slug).selectAll('.obj-dot,.obj-glow').style('opacity',null);}};
}

/** Every dust dot casts a tiny soft shadow down-right (same light as the
 *  pictures'), all in one blurred path under everything. */
function drawDustShadows() {
  const dots = DUST_SHADOWS && !_bigBangMode && _dustEnabled ? dustDots() : [];
  const R = 1.4, DX = 3, DY = 4;
  let d = "";
  for (const q of dots) {
    const x = q.sx + DX - R, y = q.sy + DY;
    d += `M${x.toFixed(1)},${y.toFixed(1)}a${R},${R} 0 1,0 ${2 * R},0a${R},${R} 0 1,0 ${-2 * R},0`;
  }
  let p = lShadows.select("path.dust-shadows");
  if (p.empty()) p = lShadows.insert("path", ":first-child").attr("class", "dust-shadows")
    .attr("fill", "#000").attr("opacity", 0.4).attr("filter", "url(#dust-shadow-blur)");
  p.attr("d", d || null);
}

/** Cast shadows fall on a poster behind the floating objects. Hover moves
 *  the object toward the viewer: its shadow moves farther, grows and fades.
 *  Image textures gain blur; fallback ellipse blur scales with their bounds. */
const SHADOW_PARTS = [
  // [class, filter, centre along the diagonal (× r) + px, half-length, half-width (× r), opacity]
  ["sh-near", "icon-shadow-near", 1.1, 10, 1.05, 0.9, 0.28],
  ["sh-far", "icon-shadow-far", 1.6, 16, 1.35, 1.05, 0.18],
];
// A small, fixed wall-plane bias balances the foreground parallax at the
// southeast edge. Measure the body, excluding rings and other extensions.
const SHADOW_SE_BIAS = 0.10;
const LAKE_SHADOWS = new Set([
  'loch-ness', 'caspian-sea', 'dead-sea', 'lake-baikal', 'lake-nyos',
  'lake-superior', 'lake-tahoe', 'lake-victoria', 'sea-of-galilee',
  'hallstatter-see', 'konigssee', 'titicaca',
]);
// Bring the entire optical layer 15% of the resting icon width closer on
// each axis, without changing its caustics, scale or hover travel.
function shadowPlacementBias(d) {
  return LAKE_SHADOWS.has(d.name ? nameToSlug(d.name) : d.key) ? -0.05 : SHADOW_SE_BIAS;
}
let _shadowLift = null; // { key, k }: the hovered picture and how much it grew
function shadowGeom(d, [, , c, px, a, b, op]) {
  const k = _shadowLift?.key === d.key ? _shadowLift.k : 1;
  const state = wallShadowState(d.r, k);
  const r = state.radius;
  const off = (c * d.r + px) * 0.85 + state.travel;
  const cx = d.sx + off * Math.SQRT1_2, cy = d.sy + off * Math.SQRT1_2 + 0.3 * d.r;
  return { cx, cy, rx: a * r, ry: b * r, transform: `rotate(45 ${cx} ${cy})`, opacity: op * state.opacity };
}
function shadowImgGeom(d) {
  const g=wallShadowImageGeometry(d, _shadowLift?.key === d.key ? _shadowLift.k : 1);
  return {...g,opacity:g.opacity*(d.shadowStrength??1)};
}
function applyShadowImg(sel, g) {
  sel.attr("x", g.x).attr("y", g.y).attr("width", g.width).attr("height", g.height).attr("opacity", g.opacity).style("filter", g.blur ? `blur(${g.blur}px)` : "none");
}
function applyShadowGeom(sel, g) {
  sel.attr("cx", g.cx).attr("cy", g.cy).attr("rx", g.rx).attr("ry", g.ry)
    .attr("transform", g.transform).attr("opacity", g.opacity);
}
function stellarShadowData(d,fallback) {
  const profile=stellarLightProfile(d.slug,d.logM),brown=BROWN_DWARFS.has(d.slug);
  return {...d,glow:STAR_GLOWS?(profile.color||starTint(ICON_BY_SLUG[d.slug],fallback)):null,
    glowUrl:profile.color?null:ICON_BY_SLUG[d.slug],
    img:brown?SHADOW_BY_SLUG[d.slug]:null,registered:brown,shadowStrength:profile.shadow};
}
// The wall stays behind the source; hover enlarges and dims its circular light.
function starGlowGeom(d) {
  return starWallLight(d,_shadowLift?.key===d.key?_shadowLift.k:1);
}
/** The colour of a star's light: the mean of its icon's bright pixels, sampled
 *  once per icon (fallback until it has loaded). */
const _starTints = new Map();
function starTint(url, fallback) {
  if (!url) return fallback;
  const known = _starTints.get(url);
  if (known) return known === "pending" ? fallback : known;
  _starTints.set(url, "pending");
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas"); c.width = c.height = 24;
    const cx = c.getContext("2d", { willReadFrequently: true });
    cx.drawImage(img, 0, 0, 24, 24);
    const px = cx.getImageData(0, 0, 24, 24).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < px.length; i += 4) {
      const w = px[i + 3] / 255 * Math.max(px[i], px[i + 1], px[i + 2]) / 255;  // bright, opaque pixels count most
      r += px[i] * w; g += px[i + 1] * w; b += px[i + 2] * w; n += w;
    }
    if (!n) return;
    // light carries the hue at full brightness; the pool's opacity keeps it faint
    const m = Math.max(r, g, b) / n || 1, f = 255 / m;
    _starTints.set(url, `rgb(${Math.round(r / n * f)},${Math.round(g / n * f)},${Math.round(b / n * f)})`);
    lShadows.selectAll("g.icon-shadow").filter(d => d.glow).each(function(d) {
      if (d.glowUrl === url) d3.select(this).select("ellipse.sh-glow").attr("fill", _starTints.get(url));
    });
  };
  img.src = url;
  return fallback;
}
function shadowRevealOptions(d){
  const body=2*d.r/(ICON_SIZE_MULT[d.name?nameToSlug(d.name):d.key]||1);
  const bias=d.glow&&!d.img?0:body*shadowPlacementBias(d);
  return {x:d.sx+3-bias,y:d.sy+4-bias,size:6*d.r,dot:2.8,color:'#000',shadow:true,reducedMotion:_reduceMotion,onDone:()=>lShadows.selectAll('circle.object-dot-shadow').filter(o=>o.slug===d.key).attr('opacity',.35)};
}
function drawIconShadows(shapes,positions=new Map()) {
  if (!SHADOWS || _bigBangMode) shapes = [];
  lShadows.selectAll("g.icon-shadow")
    .data(shapes, d => d.key)
    .join(enter => {
      const g = enter.append("g").attr("class", "icon-shadow");
      SHADOW_PARTS.forEach(([cls, filter]) => g.append("ellipse").attr("class", cls)
        .attr("fill", "#000").attr("filter", `url(#${filter})`));
      g.append("image").attr("class", "sh-img").attr("preserveAspectRatio", "none");
      g.append("ellipse").attr("class", "sh-glow").attr("filter", "url(#star-glow)").attr("mask","url(#star-wall-mask)")
        .style("mix-blend-mode", "screen");
      return g;
    },update=>update,exit=>exitReveal(exit,(d,node)=>{
      const current=positions.get(d.key),opts=shadowRevealOptions(d);
      if(current){const bias=d.sx+3-opts.x;d3.select(node).attr('transform',`translate(${bias+current.sx-d.sx},${bias+current.sy-d.sy})`);}
      return opts;
    }))
    .each(function(d) {
      const g = d3.select(this);
      const body = 2 * d.r / (ICON_SIZE_MULT[d.name ? nameToSlug(d.name) : d.key] || 1);
      const bias = d.glow && !d.img ? 0 : body * shadowPlacementBias(d);
      g.attr("transform", `translate(${bias},${bias})`);
      const glow = g.select("ellipse.sh-glow").attr("display", d.glow ? null : "none");
      if (d.glow) {
        g.selectAll("ellipse:not(.sh-glow)").attr("display", "none");
        g.select("image.sh-img").attr("display", "none");
        const light=starGlowGeom(d);
        applyShadowGeom(glow.interrupt().attr("fill", d.glow), {...light,cx:light.cx-bias,cy:light.cy-bias});
        if(!d.img)return;
      }
      g.selectAll("ellipse:not(.sh-glow)").attr("display", d.img ? "none" : null);
      const img = g.select("image.sh-img").attr("display", d.img ? null : "none");
      if (d.img) {
        if (img.attr("href") !== d.img) img.attr("href", d.img);
        applyShadowImg(img.interrupt(), shadowImgGeom(d));
        return;
      }
      SHADOW_PARTS.forEach(part => applyShadowGeom(g.select(`ellipse.${part[0]}`).interrupt(), shadowGeom(d, part)));
    }).each(function(d){revealIcon(this,true,shadowRevealOptions(d));});
}
/** Ease one picture's shadow to its lifted (hover) or resting place. */
function liftShadow(key, k) {
  _shadowLift = k > 1 ? { key, k } : null;
  lShadows.selectAll("g.icon-shadow").filter(d => d.key === key).each(function(d) {
    const g = d3.select(this);
    if (d.glow) {
      const light=starGlowGeom(d),bias=d.img?2*d.r/(ICON_SIZE_MULT[d.name?nameToSlug(d.name):d.key]||1)*shadowPlacementBias(d):0;
      applyShadowGeom(g.select("ellipse.sh-glow").interrupt().transition().duration(_reduceMotion?0:ICON_HOVER_MS).ease(iconHoverEase), {...light,cx:light.cx-bias,cy:light.cy-bias});
      if(!d.img)return;
    }
    if (d.img) {
      applyShadowImg(g.select("image.sh-img").interrupt().transition().duration(_reduceMotion?0:ICON_HOVER_MS).ease(iconHoverEase), shadowImgGeom(d));
      return;
    }
    SHADOW_PARTS.forEach(part => applyShadowGeom(
      g.select(`ellipse.${part[0]}`).interrupt().transition().duration(_reduceMotion?0:ICON_HOVER_MS).ease(iconHoverEase), shadowGeom(d, part)));
  });
}

function softSpaceIcon(o) {return _softSpace&&isDiffuseSpaceArt(o.catKey||o.cat,o.slug)}
const iconIsLuminous = (o) => isLuminousArt(o.catKey || o.cat, o.slug);

// Hover handlers for the persistent object groups (datum-based, attached
// once at enter — the join rebinds fresh data to the same nodes each frame).
/** Enlarge (on=true) or restore an object's icon on hover — shared by the
 *  SVG group handlers and the HTML click-target handlers. Returns whether
 *  the object currently renders an icon. */
// ---- Dives: the camera trick (app.setDolly) ----
// Depths (back to front): the painting, the chart (grid, dust, lines, dots),
// the labels, the pictures. At k = 1 each is scaled about the object by
// 1 / (1 + FALL), blurred and darkened; the object itself grows towards the
// screen as a copy in front of them all (its own picture hides meanwhile).
const DOLLY_DEPTHS = [
  { outer: dBackF, inner: dBack, fall: 3, blur: 9, dark: 0.75, darkBy: 0.55 },
  { outer: dMidF, inner: dMid, fall: 1.3, blur: 4.5, dark: 0.7, darkBy: 0.7 },
  { outer: dLabF, inner: dLab, fall: 0.8, blur: 0, dark: 0, fade: true },
  { outer: dIconF, inner: dIcon, fall: 0.8, blur: 0, dark: 0 },
];
// the mist (a veil over every depth, under the object) thickens from here to k = 1
const DOLLY_MIST_FROM = 0.3;
// The pictures blur one by one (a filter on their whole layer would cut the
// screen-blended ones off from the painting); those only darken, under the veil.
const DOLLY_ICON_BLUR = 3;
const dollyIconFilter = defs.append("filter").attr("id", "dolly-fi").attr("x", "-50%").attr("y", "-50%")
  .attr("width", "200%").attr("height", "200%").attr("color-interpolation-filters", "sRGB");
const dollyIconBlur = dollyIconFilter.append("feGaussianBlur").attr("stdDeviation", 0);
const dollyIconDark = (() => { const ct = dollyIconFilter.append("feComponentTransfer");
  return ["R", "G", "B"].map(c => ct.append(`feFunc${c}`).attr("type", "linear").attr("slope", 1)); })();
let _dolly = null, _dollyHidden = null;
// tiles drawn this far (px) around the screen while a dive is on (drawTiles)
let _dollyPadPx = 0;
// the chart depth only has what's on screen: its edges feather out as it falls back
const dollyMask = defs.append("mask").attr("id", "dolly-mid-mask").attr("maskUnits", "userSpaceOnUse");
const dollyFeather = defs.append("filter").attr("id", "dolly-feather").attr("filterUnits", "userSpaceOnUse");
const dollyFeatherBlur = dollyFeather.append("feGaussianBlur").attr("stdDeviation", 0);
const dollyMaskRect = dollyMask.append("rect").attr("fill", "#fff").attr("filter", "url(#dolly-feather)");
DOLLY_DEPTHS.forEach((L, i) => {
  if (!L.blur && !L.dark) return;
  const f = defs.append("filter").attr("id", `dolly-f${i}`).attr("filterUnits", "userSpaceOnUse")
    .attr("color-interpolation-filters", "sRGB");
  L.blurEl = f.append("feGaussianBlur").attr("stdDeviation", 0).attr("edgeMode", "duplicate");
  const ct = f.append("feComponentTransfer");
  L.darkEls = ["R", "G", "B"].map(c => ct.append(`feFunc${c}`).attr("type", "linear").attr("slope", 1));
  L.filter = f;
});
function setDolly(d) {
  const k = d ? Math.max(0, Math.min(1, d.k ?? 0)) : 0;
  if (_dollyHidden) { _dollyHidden.style.visibility = ""; _dollyHidden = null; }
  // each picture's own dolly transform comes off before the renderer's is read again
  lIcons.selectAll(":scope > g").each(function () {
    if (this.__dollyApplied && this.getAttribute("transform") === this.__dollyApplied) this.setAttribute("transform", this.__dollyBase);
    this.__dollyApplied = null;
  });
  if (k < 0.0005) {
    if (!_dolly) return;
    _dolly = null;
    for (const L of DOLLY_DEPTHS) { L.outer.attr("filter", null).style("opacity", null); L.inner.attr("transform", null); }
    dMid.attr("mask", null);
    lIcons.selectAll(":scope > g").attr("filter", null);
    _dollyPadPx = 0; drawTiles();
    // the fractal layer comes back over the tiles it lent the dive
    _bgNoiseSurface?.style("opacity", null).style("display", null).attr("transform", null);
    if (_bgNoiseShown) [lTiles, lTilesBase].forEach(l => l.style("display", "none").style("opacity", 0));
    dVeil.attr("display", "none"); dFocus.selectAll("*").remove(); dFocus.style("opacity", null);
    lAxesWrap.style("opacity", null);
    return;
  }
  _dolly = { name: d.name, k };
  const pad = DOLLY_DEPTHS[0].fall * Math.max(cw, ch);
  if (_dollyPadPx !== pad) { _dollyPadPx = pad; drawTiles(); }
  // the painting behind a dive is the tiles (drawn wide), crossfading from the
  // fractal layer, which only covers the screen; blurred, the two are alike
  const lend = Math.min(1, k * 4);
  if (_bgNoiseShown) [lTiles, lTilesBase].forEach(l => l.style("transition", null).style("display", null)
    .style("opacity", lend.toFixed(3)));
  _bgNoiseSurface?.style("opacity", (1 - lend).toFixed(3)).style("display", lend >= 1 ? "none" : null);
  const o = _lastProjected.find(p => p.name === d.name);
  let icon = o && lIcons.select(`.obj-icon[data-slug="${o.slug}"]`).node();
  if (!o) {   // a catalogue dot shown as its picture (the Eiffel Tower)
    const dd = dustIcons().find(p => p.name === d.name);
    icon = dd ? lIcons.selectAll("g.dust-picture").filter(p => p.i === dd.i).select(".dn-icon").node() : null;
  }
  const group = icon?.closest?.("g.dust-picture") || icon?.parentNode;
  // the object's point: where its picture is drawn (parallax included), else its dot
  let px = cw / 2, py = ch / 2;
  if (group) {
    const ib = icon.getBoundingClientRect(), cb = clip.select("rect.bg-rect").node().getBoundingClientRect();
    const sc = cb.width / cw || 1;
    px = (ib.x + ib.width / 2 - cb.x) / sc; py = (ib.y + ib.height / 2 - cb.y) / sc;
  } else if (o) { px = o.sx; py = o.sy; }
  const about = (s) => `translate(${px.toFixed(2)},${py.toFixed(2)}) scale(${s.toFixed(4)}) translate(${(-px).toFixed(2)},${(-py).toFixed(2)})`;
  // Everything behind goes into a dark mist: the painting and the chart first,
  // then the other pictures, all black by the time the dive is fully in.
  const ease = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  const mist = ease((k - DOLLY_MIST_FROM) / (1 - DOLLY_MIST_FROM));
  DOLLY_DEPTHS.forEach((L) => {
    if (L.inner !== dIcon) L.inner.attr("transform", about(1 / (1 + L.fall * k)));
    if (L.fade) L.outer.style("opacity", (1 - k).toFixed(3));
    if (L.filter) {
      L.filter.attr("x", -40).attr("y", -40).attr("width", cw + 80).attr("height", ch + 80);
      L.blurEl.attr("stdDeviation", (L.blur * k).toFixed(2));
      L.darkEls.forEach(e => e.attr("slope", (1 - L.dark * ease(k / L.darkBy)).toFixed(3)));
      L.outer.attr("filter", `url(#${L.filter.attr("id")})`);
    }
  });
  // the fractal canvas only covers the screen: it stays put (undoing its depth's
  // scale) while the tiles fall back around it, or its edge would show
  _bgNoiseSurface?.attr("transform", about(1 + DOLLY_DEPTHS[0].fall * k));
  dVeil.attr("display", null).attr("width", cw).attr("height", ch).attr("opacity", mist.toFixed(3));
  dollyIconBlur.attr("stdDeviation", (DOLLY_ICON_BLUR * k).toFixed(2));
  dollyIconDark.forEach(e => e.attr("slope", (1 - mist).toFixed(3)));
  // The other pictures fall back one by one, each at its own parallax depth
  // (iconDepth, exaggerated so the spread shows), blurring as they go.
  const iconFall = DOLLY_DEPTHS.find(L => L.inner === dIcon).fall;
  lIcons.selectAll(":scope > g").each(function (q) {
    if (this === group) return;
    const depth = q?.slug ? iconDepth(q.slug) : 1;
    const base = this.getAttribute("transform") || "";
    this.__dollyBase = base;
    this.__dollyApplied = `${about(1 / (1 + iconFall * (1 + (depth - 1) * 4) * k))} ${base}`;
    this.setAttribute("transform", this.__dollyApplied);
    this.setAttribute("filter", "url(#dolly-fi)");   // (no picture is screen-blended any more: src/luminous-art.js)
  });
  const fe = 0.12 * Math.min(cw, ch) * Math.min(1, 2 * k);
  dollyMask.attr("x", -cw).attr("y", -ch).attr("width", 3 * cw).attr("height", 3 * ch);
  dollyFeather.attr("x", -cw).attr("y", -ch).attr("width", 3 * cw).attr("height", 3 * ch);
  dollyFeatherBlur.attr("stdDeviation", fe.toFixed(1));
  dollyMaskRect.attr("x", fe).attr("y", fe).attr("width", Math.max(0, cw - 2 * fe)).attr("height", Math.max(0, ch - 2 * fe));
  dMid.attr("mask", "url(#dolly-mid-mask)");
  lAxesWrap.style("opacity", (1 - k).toFixed(3));
  // the object: a copy of its picture group, grown about its point
  dFocus.selectAll("*").remove();
  if (!group) return;
  const copy = group.cloneNode(true);
  copy.removeAttribute("filter");
  const grow = 1 + ((d.grow ?? 3) - 1) * k;
  copy.setAttribute("transform", `${about(grow)} ${group.getAttribute("transform") || ""}`);
  dFocus.node().appendChild(copy);
  group.style.visibility = "hidden"; _dollyHidden = group;
}

function setIconHover(o, on, grow = null) {
  const iconEl = lIcons.select(`.obj-icon[data-slug="${o.slug}"]`);
  if (!iconEl.size()) return false;
  const base = effectiveIconSize() * iconSizeMult(o);
  // Grow around the icon's center via CSS transform; geometry attrs stay
  // owned by the renderer (see .obj-icon in style.css for why).
  const k = on ? grow ?? Math.max(64, base * 1.5) / base : 1;
  const group = d3.select(iconEl.node().closest("g.icon-g"));
  if (on) group.raise();
  animateIconGrowth(group,k,(node,growth)=>{
    const current=node.__data__,g=d3.select(node),size=effectiveIconSize()*iconSizeMult(current);
    g.select('.obj-icon').style('transform',growth===1?null:`scale(${growth})`);
    g.attr('transform',parallaxTranslation(current,objectPicturePoint(current,growth)));
  },_reduceMotion);
  liftShadow(o.slug, k);
  return true;
}

// Hover "made of" (COMPOSITION): reveal the connection paths that build the
// hovered thing — the same lines a hover on the path itself shows. Parts that
// are only dust (element N, P, S; nuclei) get a name tag, and the reveal
// continues through them (atom → nucleus → protons & neutrons); it stops at
// curated objects, which answer their own hover.
let _composeShown = [];
function showComposition(o) {
  hideComposition();
  if (!_connPaths || !COMPOSITION[o.name]) return;
  const color = dustColor("atomic");
  const seen = new Set();
  const reveal = (name) => {
    if (seen.has(name)) return;
    seen.add(name);
    for (const cp of _connPaths) {
      if (cp._into !== name || !cp._lineGroup) continue;
      cp._lineGroup.attr("opacity", 1);
      _composeShown.push(cp);
    }
    for (const part of COMPOSITION[name] || []) {
      if (OBJECTS.some(q => q.name === part)) continue;
      const pos = compositionPartPos(part);
      if (!pos) continue;
      lCompose.append("text").attr("x", px(pos[0]) + 7).attr("y", py(pos[1]) + 3.5)
        .attr("font-family", "Inter, sans-serif").attr("font-weight", 600)
        .attr("font-size", fscale(10)).attr("paint-order", "stroke")
        .attr("stroke", "rgba(6,6,26,0.85)").attr("stroke-width", 3)
        .attr("fill", color).text(part);
      reveal(part);
    }
  };
  reveal(o.name);
}
function hideComposition() {
  lCompose.selectAll("*").remove();
  _composeShown.forEach(cp => cp._lineGroup?.attr("opacity", 0));
  _composeShown = [];
}

function objHoverEnter(e, o) {
  showComposition(o);
  if (!setIconHover(o, true)) {
    d3.select(this).select(".obj-glow").attr("r", 10).attr("opacity", 0.25);
    d3.select(this).select(".obj-dot").attr("r", 4);
  }
  lLabels.selectAll(`[data-label-slug="${o.slug}"]`).attr("display", null);
  showTooltip(e, o, o.cat);
}
function objHoverLeave(e, o) {
  hideComposition();
  if (!setIconHover(o, false)) {
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

function showTooltip(event, obj, cat) {
  const photon = isPhoton(obj);
  // Photons sit on the Compton line at radius λ/2π; the offset restores λ.
  const r = photon ? friendlyWavelength(obj.logR + PHOTON_LAMBDA_OFFSET) : friendlyRadius((obj.logRSpan ?? obj.logR) + WIDTH_LOG_OFFSET);
  const rLabel = photon ? "wavelength" : obj.logRSpan != null ? "longest side" : "width";
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

// Dust hover: the name (and which catalogue it came from) — nothing else.
// Curated objects sit above in the HTML click-target overlay, so they
// always win; dust only answers when nothing else has the tooltip.
let _dustTip = false;
let _dustIconHover = null;   // index of the dust picture grown under the pointer
/** Same growth as setIconHover (curated icons): to ≥ 64 px or 1.5×, shadow lifted. */
function setDustIconHover(icon) {
  const i = icon ? icon.i : null;
  if (i === _dustIconHover) return;
  if (_dustIconHover != null) {
    setDustIconScale(lIcons, _dustIconHover, 1);
    liftShadow(`dust:${_dustIconHover}`, 1);
  }
  _dustIconHover = i;
  if (icon) {
    const base = 2 * icon.r, k = Math.max(64, base * 1.5) / base;
    setDustIconScale(lIcons, i, k);
    liftShadow(`dust:${i}`, k);
  }
}
function hideDustTip() {
  setDustIconHover(null);
  if (!_dustTip) return;
  _dustTip = false;
  lDustHover.selectAll("*").remove();
  hideComposition();
  hideTooltip();
}
svg.on("mousemove.dust", (e) => {
  if (_zooming || _touchMode || !_dustEnabled) return hideDustTip();
  if (!_dustTip && tooltipEl.classList.contains("visible")) return; // someone else's tooltip
  const [mx, my] = d3.pointer(e, chart.node());
  // a dust picture answers anywhere over it, like a curated icon
  const icon = pickDustIcon(mx, my);
  const anchor = icon && depthPoint(icon, PARALLAX.dust);
  const hit = icon ? { ...pickDust(anchor.x, anchor.y, 1), name: icon.name } : pickDust(mx, my, 6);
  if (!hit || !hit.source) return hideDustTip();
  setDustIconHover(icon);
  const color = CATEGORIES[hit.cat]?.color || "#fff";
  lDustHover.selectAll("*").remove();
  if (COMPOSITION[hit.name]) showComposition(hit);
  if (!icon) lDustHover.append("circle")
    .attr("cx", hit.sx).attr("cy", hit.sy).attr("r", 3.2)
    .attr("fill", color).attr("stroke", "rgba(6,6,26,0.9)").attr("stroke-width", 1);
  tooltipEl.innerHTML = `<div class="tt-name" style="color:${color}">${escapeHtml(hit.name)}</div>` +
    `<div class="tt-row">${escapeHtml(hit.source)}</div>`;
  tooltipEl.classList.add("visible");
  positionTooltip(e);
  _dustTip = true;
});
svg.on("mouseleave.dust", hideDustTip);

// =============================================================
// Axis hover tooltip
// =============================================================

const axisTooltipEl = document.getElementById("axis-tooltip");

// ── Unit tables for the axis tooltip picker ──

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
      const logW = logR + WIDTH_LOG_OFFSET;       // radius position → width reading
      const logW_m = logW - 2;                    // cm → m
      const primary = pickBestUnit(logW, RADIUS_HOVER_UNITS, "metric");
      const alt = pickAltUnit(logW, RADIUS_HOVER_UNITS, primary);
      return {
        line1: formatLogSuper(logW_m, "m"),
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

/** Center the view on a data-space point at scale k — THE home for the
 *  cw/2 - xBase(logR)*k centering math (was inlined at ten call sites).
 *  duration 0 (or OS reduced-motion) applies the transform instantly. */
function flyTo(logR, logM, k, duration = 0, ease = d3.easeCubicInOut) {
  const t = d3.zoomIdentity
    .translate(cw / 2 - xBase(logR) * k, ch / 2 - yBase(logM) * k)
    .scale(k);
  if (duration > 0 && !_reduceMotion) {
    svg.transition().duration(duration).ease(ease).call(zoomBehavior.transform, t);
  } else {
    svg.call(zoomBehavior.transform, t);
  }
}

function navigateToObject(slug, name) {
  const obj = OBJECTS.find(o => o.slug === slug);
  if (obj) {
    _sidebarManuallyExpanded = false;
    const targetK = Math.max(currentK, 12);
    flyTo(obj.logR, obj.logM, targetK, 700);
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
    flyTo(logR, logM, k, 700);
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
    syncSheetGrabAria();
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
    syncSheetGrabAria();
  };
  grab.addEventListener("pointerup", endDrag);
  grab.addEventListener("pointercancel", endDrag);
  // Keyboard: Enter/Space on the grabber button toggles peek <-> full
  // (pointer taps are handled by endDrag; e.detail === 0 means keyboard)
  grab.addEventListener("click", (e) => {
    if (e.detail === 0) {
      sidebarEl.classList.toggle("sheet-full");
      syncSheetGrabAria();
    }
  });
})();

function syncSheetGrabAria() {
  document.getElementById("sheet-grab")
    ?.setAttribute("aria-expanded", String(sidebarEl.classList.contains("sheet-full")));
}

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

  flyTo(centerLogR, centerLogM, savedK);

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

// Descriptions arrive in a lazy chunk (usually already fetched on the first
// interaction). If the panel opens first, it fills in when the chunk lands —
// unless the user has moved on to another object by then.
let _descsLoaded = false;
function renderDescription(obj) {
  const apply = () => {
    if (selectedObj !== obj) return;
    sbDesc.innerHTML = simpleMarkdown(DESC_BY_SLUG[obj.slug] || "");
    renderMath(sbDesc);
  };
  if (_descsLoaded) return apply();
  sbDesc.innerHTML = "";
  loadDescriptions().then(() => { _descsLoaded = true; apply(); })
    .catch((e) => console.warn("descriptions failed to load", e));
}

function openInfoPanel(slug, name) {
  openSidebar({ slug, name, isLabel: true });
}

function openSidebar(obj) {
  selectedObj = obj;
  sidebarIntro.style.display = "none";
  sidebarObject.style.display = "";
  announce(`${obj.name} selected. Details shown in the info panel.`);

  if (obj.isLabel) {
    sidebarObject.classList.add("info-panel");
    sbName.textContent = obj.name;
    sbName.style.color = "rgba(255,255,255,0.9)";
    sbDot.style.background = "rgba(255,100,100,0.5)";
    sbDot.style.color = "rgba(255,100,100,0.5)";
    sbCategory.textContent = "Unit reference";
    sbStats.innerHTML = "";
    renderDescription(obj);
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
  // For particles with a Hyperspirograph state, embed the live spirograph instead
  const spiroState = hyperspirographStates[slug];
  // Photons open the electromagnetic-spectrum explorer at their own band
  const spectrumBand = SPECTRUM_BANDS[slug];
  sbImage.classList.toggle("sb-image-app", !!spectrumBand); // the explorer sets its own height
  if (spectrumBand) {
    sbImage.innerHTML = "";
    const [c, s] = spectrumBand;
    const view = `c=${c}&s=${s}`;
    const iframe = document.createElement("iframe");
    iframe.src = `${import.meta.env.BASE_URL}spectrum/index.html?embed=1&${view}`;
    iframe.style.cssText = "width:100%;aspect-ratio:1/1.15;border:0;display:block;background:#000;border-radius:8px;";
    iframe.loading = "lazy";
    iframe.title = `${obj.name} — the sky across the electromagnetic spectrum`;
    sbImage.appendChild(iframe);
    const explore = document.createElement("a");
    explore.className = "sb-spiro-explore";
    explore.href = `${import.meta.env.BASE_URL}spectrum/index.html?${view}`;
    explore.target = "_blank";
    explore.rel = "noopener";
    explore.textContent = "🌈 Explore the electromagnetic spectrum →";
    // a plain click opens it over the chart; modified clicks still get a tab
    explore.addEventListener("click", (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      openAppOverlay(`${explore.href}&app=1`, "Electromagnetic Spectrum");
    });
    sbImage.appendChild(explore);
  } else if (spiroState) {
    sbImage.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.src = `/hyperspirograph.html?embed=1#${spiroState}`;
    iframe.style.cssText = "width:100%;aspect-ratio:1/1;border:0;display:block;background:#000;border-radius:8px;";
    iframe.loading = "lazy";
    iframe.title = `${obj.name} — interactive 5D spirograph`;
    sbImage.appendChild(iframe);
    const explore = document.createElement("a");
    explore.className = "sb-spiro-explore";
    explore.href = `/hyperspirograph.html#${spiroState}`;
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
      explore.href = "/hyperspirograph.html";
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

  const r = photon ? friendlyWavelength(obj.logR + PHOTON_LAMBDA_OFFSET) : friendlyRadius((obj.logRSpan ?? obj.logR) + WIDTH_LOG_OFFSET);
  const m = photon ? friendlyEnergy(obj.logM) : friendlyMass(obj.logM);
  const rho = friendlyDensity(obj.logR, obj.logM, obj.logDensity);

  const logR_m = (obj.logRSpan ?? obj.logR) + WIDTH_LOG_OFFSET - 2;
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
      <tr><td colspan="2" class="sb-log-note">(10<sup>${(obj.logR + PHOTON_LAMBDA_OFFSET).toFixed(1)}</sup> cm · 10<sup>${(obj.logM + 32.75).toFixed(1)}</sup> eV)</td></tr>
      <tr><td colspan="2" class="sb-footnote">* Massless — vertical axis shows mass-equivalent energy E = hc/λ</td></tr>`;
  } else if (isEveryday) {
    const sizeLabel = obj.logRSpan != null ? "Longest side" : obj.logR < -1 ? "Size" : "Width";
    const massLabel = "Weight";
    rows = `
      <tr><td>${sizeLabel}</td><td>${r}</td></tr>
      <tr><td>${massLabel}</td><td>${m}</td></tr>
      <tr><td>${obj.logRSpan != null ? "Bulk density" : "Density"}</td><td>${rho}</td></tr>
      <tr><td colspan="2" class="sb-log-note">${logNote}</td></tr>`;
  } else if (isParticle) {
    rows = `
      <tr><td>Size</td><td>${r}</td></tr>
      <tr><td>Mass</td><td>${m}</td></tr>
      <tr><td>Zone</td><td><span class="sb-zone ${zoneClass}">${zone}</span></td></tr>
      <tr><td colspan="2" class="sb-log-note">(10<sup>${(obj.logR + WIDTH_LOG_OFFSET - 2).toFixed(1)}</sup> m · 10<sup>${(obj.logM - 3).toFixed(1)}</sup> kg)</td></tr>`;
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

  renderDescription(obj);

  const wiki = wikiUrl(obj);
  const scholar = scholarUrl(obj.name);
  // An object may carry its own primary link (e.g. a species too new for
  // Wikipedia links its original description) in place of Wikipedia.
  const primary = obj.paper
    ? `<a href="${obj.paper.url}" target="_blank" rel="noopener">
      <span class="link-icon">P</span>
      <span class="link-label">${obj.paper.label}</span>
      <span class="link-sub">${obj.paper.sub || ""} ↗</span>
    </a>`
    : `<a href="${wiki}" target="_blank" rel="noopener">
      <span class="link-icon">W</span>
      <span class="link-label">Wikipedia</span>
      <span class="link-sub">↗</span>
    </a>`;
  sbLinks.innerHTML = `
    ${primary}
    <a href="${scholar}" target="_blank" rel="noopener">
      <span class="link-icon">S</span>
      <span class="link-label">Google Scholar</span>
      <span class="link-sub">↗</span>
    </a>
  `;

  setSidebarOpen(true);
  if (_booted) { clearTimeout(hashTimer); saveHash(); }
}

// Mini apps (the spectrum explorer) open full-screen over the chart rather
// than in a new tab. Back, Escape (in the app too) or × closes it.
let appOverlay = null;
function openAppOverlay(src, title) {
  if (appOverlay) return;
  const el = document.createElement("div");
  el.id = "app-overlay";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", title);
  const frame = document.createElement("iframe");
  frame.src = src;
  frame.title = title;
  const close = document.createElement("button");
  close.className = "app-overlay-close";
  close.setAttribute("aria-label", `Close ${title}`);
  close.textContent = "×";
  close.addEventListener("click", () => closeAppOverlay());
  el.append(frame, close);
  document.body.appendChild(el);
  appOverlay = { el, frame };
  history.pushState({ appOverlay: true }, "");
  frame.focus();
}
function closeAppOverlay(fromHistory = false) {
  if (!appOverlay) return;
  appOverlay.el.remove();
  appOverlay = null;
  if (!fromHistory && history.state?.appOverlay) history.back();
}
window.addEventListener("popstate", () => { if (appOverlay) closeAppOverlay(true); });
window.addEventListener("message", (e) => {
  if (appOverlay && e.source === appOverlay.frame.contentWindow && e.data?.type === "close-app") closeAppOverlay();
});

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
    if (_booted) { clearTimeout(hashTimer); saveHash(); } // URL back to /
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
  if (mobileRulers.visible) { lMobileRulers.raise(); mobileRulers.draw(); }
  const d = vd();
  // Column layout + type (see axisLayout). Sizes go in as inline styles: a
  // font-size attribute loses to any CSS rule.
  const A = _axLayout;
  const lS = A.fL, rS = A.fR;            // left / right column fit
  const tS = A.sT * A.fT, bS = A.sB * A.fB; // top / bottom geometry scale
  const fs = (px) => `${px.toFixed(2)}px`;
  // Reference labels claim the vertical band their lines really cover; a
  // label that would touch an already-placed one is skipped.
  const bandsFree = (bands, p, lines, f) => {
    const top = p - 0.75 * f - 2, bot = p + (lines - 1) * 1.1 * f + 0.3 * f + 2;
    if (bands.some(([t, b]) => top < b && t < bot)) return false;
    bands.push([top, bot]);
    return true;
  };
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

  // Grid-unit mode: where decade lines are anchored, and how numbers read.
  const cfg = gridCfg();
  const firstX = (lo, s) => firstAligned(lo, s, cfg.xRef);
  const firstY = (lo, s) => firstAligned(lo, s, cfg.yRef);

  // ─── TOP: Diagonal density labels ──────────────────────────
  const densityAngle = screenAngle(3);
  const diagDx = 1;
  const diagDy = 3;
  const diagNorm = Math.sqrt(diagDx * diagDx + diagDy * diagDy);
  const diagLen = 15 * tS;

  let lastDensityLabelP = Infinity;
  for (let logRho = -54; logRho <= 108; logRho += 9) {
    const b = DENSITY_SPHERE_C + logRho;
    const logR_top = (d.y1 - b) / 3;
    if (logR_top < d.x0 - 1 || logR_top > d.x1 + 1) continue;
    const p = px(logR_top);
    if (p < 0 || p > cw) continue;
    // Zoomed out, consecutive 9-decade steps land a few px apart and the
    // rotated numbers pile into an unreadable bundle — enforce min spacing.
    if (Math.abs(lastDensityLabelP - p) < 34 * tS) continue;
    lastDensityLabelP = p;

    const ex = p + (diagDx / diagNorm) * diagLen;
    const ey = -(diagDy / diagNorm) * diagLen;

    axT.append("line")
      .attr("x1", p).attr("y1", 0)
      .attr("x2", ex).attr("y2", ey)
      .attr("stroke", "rgba(255,255,255,0.15)")
      .attr("stroke-width", 0.5);

    const gL = logRho + 3;
    const tx = ex + (diagDx / diagNorm) * 3 * tS;
    const ty = ey - (diagDy / diagNorm) * 3 * tS;
    axT.append("text")
      .attr("class", "axis-label")
      .attr("x", tx).attr("y", ty)
      .attr("text-anchor", "start")
      .attr("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
      .style("font-size", fs(10 * tS)).attr("font-weight", 700)
      .attr("fill", "rgba(255,255,255,0.55)")
      .attr("transform", `rotate(${densityAngle},${tx},${ty})`)
      .text(gL);
  }

  axT.append("text").attr("x", cw - 5).attr("y", -38 * tS).attr("text-anchor", "end")
    .attr("class", "axis-title").style("font-size", fs(A.title * A.fT)).text("DENSITY");
  // On mobile the pill stack occupies the top-left corner — shift TIME clear.
  // The top subtitles collide with the rotated density numbers on a narrow
  // screen, so they're desktop-only.
  const timeTitleX = _isMobile ? 62 : 5;
  axT.append("text").attr("x", timeTitleX).attr("y", -38 * tS).attr("text-anchor", "start")
    .attr("class", "axis-title").style("font-size", fs(A.title * A.fT)).attr("letter-spacing", "3px").text("TIME");
  if (!_isMobile) {
    axT.append("text").attr("x", cw - 5).attr("y", -26 * tS).attr("text-anchor", "end")
      .attr("class", "axis-subtitle").style("font-size", fs(A.sub * A.fT)).text("10ⁿ g/L");
    axT.append("text").attr("x", timeTitleX).attr("y", -26 * tS).attr("text-anchor", "start")
      .attr("class", "axis-subtitle").style("font-size", fs(A.sub * A.fT)).text("10ⁿ s since Big Bang");
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
        axB.append("text").attr("x", p).attr("y", 14 * bS).attr("text-anchor", "middle")
          .attr("class", "axis-label axis-minor").style("font-size", fs(9 * bS)).attr("font-weight", 400)
          .attr("fill", "rgba(255,255,255,0.5)")
          .text(n);
      }
    }
  }

  for (let v = firstX(d.x0, axisStep); v <= d.x1; v += axisStep) {
    const p = px(v);
    if (p < -1 || p > cw + 1) continue;
    axB.append("line").attr("x1", p).attr("y1", 0).attr("x2", p).attr("y2", 5)
      .attr("stroke", "rgba(255,255,255,0.25)");
    axB.append("text").attr("x", p).attr("y", 16 * bS).attr("text-anchor", "middle")
      .attr("class", "axis-label").style("font-size", fs(13 * bS)).attr("font-weight", 700)
      .text(cfg.xNum(v));
  }

  let lastRow1Px = -Infinity;
  RADIUS_UNITS.filter(u => u.row === 1).forEach(u => {
    if (u.logR < d.x0 || u.logR > d.x1) return;
    const p = px(u.logR);
    if (p < -1 || p > cw + 1) return;
    axB.append("line").attr("x1", p).attr("y1", 0).attr("x2", p).attr("y2", 26 * bS)
      .attr("stroke", "rgba(255,100,100,0.4)").attr("stroke-dasharray", "2 2");
    if (Math.abs(p - lastRow1Px) >= 40 * bS * 1.25 && u.slug) {
      axB.append("text").attr("class", "axis-unit-link").attr("data-slug", u.slug).attr("data-name", u.label)
        .attr("x", p).attr("y", 37 * bS).attr("text-anchor", "middle")
        .attr("font-family", AXIS_FONT).style("font-size", fs(10 * bS))
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
    axB.append("line").attr("x1", p).attr("y1", 0).attr("x2", p).attr("y2", 46 * bS)
      .attr("stroke", "rgba(255,100,100,0.25)").attr("stroke-dasharray", "2 2");
    // On the compact mobile ruler the rotated row-2 labels run straight
    // through the centered WIDTH title — keep a clear zone around it.
    if (_isMobile && Math.abs(p - cw / 2) < 80) return;
    if (Math.abs(p - lastRow2Px) >= 35 * bS * 1.25 && u.slug) {
      const y2 = 50 * bS;
      axB.append("text").attr("class", "axis-unit-link").attr("data-slug", u.slug).attr("data-name", u.label)
        .attr("x", p + 2).attr("y", y2)
        .attr("text-anchor", "start")
        .attr("font-family", AXIS_FONT).style("font-size", fs(9.5 * bS))
        .attr("fill", "rgba(255,130,130,0.45)")
        .attr("transform", `rotate(45,${p + 2},${y2})`)
        .text(u.label);
      lastRow2Px = p;
    }
  });

  axB.append("text").attr("x", cw / 2).attr("y", 65 * bS).attr("text-anchor", "middle")
    .attr("class", "axis-title").style("font-size", fs(A.title * A.fB)).text("WIDTH");
  axB.append("text").attr("x", cw / 2).attr("y", 78 * bS).attr("text-anchor", "middle")
    .attr("class", "axis-subtitle").style("font-size", fs(A.sub * A.fB)).text(cfg.bottomSub);

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
        axL.append("text").attr("x", -A.numX * lS).attr("y", p + 0.35 * A.minor * lS).attr("text-anchor", "end")
          .attr("class", "axis-label axis-minor").style("font-size", fs(A.minor * lS)).attr("font-weight", 400)
          .attr("fill", "rgba(255,255,255,0.5)")
          .text(n);
      }
    }
  }

  for (let v = firstY(d.y0, axisStep); v <= Math.min(d.y1, leftMax); v += axisStep) {
    const p = py(v);
    if (p < -1 || p > ch + 1) continue;
    axL.append("line").attr("x1", -5).attr("y1", p).attr("x2", 0).attr("y2", p)
      .attr("stroke", "rgba(255,255,255,0.25)");
    axL.append("text").attr("x", -A.numX * lS).attr("y", p + 0.35 * A.num * lS).attr("text-anchor", "end")
      .attr("class", "axis-label").style("font-size", fs(A.num * lS)).attr("font-weight", 700)
      .text(cfg.energyNum(v));
  }

  // Unit labels sit OUTBOARD of the exponent-number column, in their own
  // column sized by axisLayout; the rotated titles sit outboard of both.
  const unitX = -A.refX * lS;
  const refPx = A.ref * lS;

  // The outboard unit-link column and rotated titles need a wide margin —
  // the compact mobile ruler shows exponent numbers only.
  const bandsL = [];
  if (!_isMobile) ENERGY_UNITS.forEach(u => {
    if (u.logM < d.y0 || u.logM > Math.min(d.y1, leftMax)) return;
    const p = py(u.logM);
    if (p < 2 || p > ch - 2) return;
    axL.append("line").attr("x1", -3).attr("y1", p).attr("x2", 0).attr("y2", p)
      .attr("stroke", "rgba(255,100,100,0.4)").attr("stroke-dasharray", "2 2");
    if (u.slug && bandsFree(bandsL, p, u.label.split("\n").length, refPx)) {
      const lines = u.label.split("\n");
      if (lines.length > 1) {
        const txt = axL.append("text").attr("class", "axis-unit-link").attr("data-slug", u.slug).attr("data-name", u.label)
          .attr("x", unitX).attr("y", p + 0.35 * refPx).attr("text-anchor", "end")
          .attr("font-family", AXIS_FONT).style("font-size", fs(refPx))
          .attr("fill", "rgba(255,150,150,0.92)");
        lines.forEach((line, li) => {
          txt.append("tspan").attr("x", unitX).attr("dy", li === 0 ? 0 : "1.1em").text(line);
        });
      } else {
        axL.append("text").attr("class", "axis-unit-link").attr("data-slug", u.slug).attr("data-name", u.label)
          .attr("x", unitX).attr("y", p + 0.35 * refPx).attr("text-anchor", "end")
          .attr("font-family", AXIS_FONT).style("font-size", fs(refPx))
          .attr("fill", "rgba(255,150,150,0.92)")
          .text(u.label);
      }
    }
  });

  axL.append("text").attr("transform", "rotate(-90)").attr("x", -ch / 2).attr("y", -A.L.title * lS)
    .attr("text-anchor", "middle").attr("class", "axis-title").style("font-size", fs(A.title * lS)).text(cfg.leftTitle);
  if (!_isMobile) {
    axL.append("text").attr("transform", "rotate(-90)").attr("x", -ch / 2).attr("y", -A.L.sub * lS)
      .attr("text-anchor", "middle").attr("class", "axis-subtitle").style("font-size", fs(A.sub * lS)).text(cfg.leftSub);
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
        axR.append("text").attr("x", A.numX * rS).attr("y", p + 0.35 * A.minor * rS).attr("text-anchor", "start")
          .attr("class", "axis-label axis-minor").style("font-size", fs(A.minor * rS)).attr("font-weight", 400)
          .attr("fill", "rgba(255,255,255,0.5)")
          .text(n);
      }
    }
  }

  for (let v = firstY(d.y0, axisStep); v <= d.y1; v += axisStep) {
    const p = py(v);
    if (p < -1 || p > ch + 1) continue;
    axR.append("line").attr("x1", 0).attr("y1", p).attr("x2", 5).attr("y2", p)
      .attr("stroke", "rgba(255,255,255,0.25)");
    axR.append("text").attr("x", A.numX * rS).attr("y", p + 0.35 * A.num * rS).attr("text-anchor", "start")
      .attr("class", "axis-label").style("font-size", fs(A.num * rS)).attr("font-weight", 700)
      .text(cfg.massNum(v));
  }

  const bandsR = [];
  const refPxR = A.ref * rS;
  if (!_isMobile) MASS_UNITS.forEach(u => {
    if (u.logM < d.y0 || u.logM > d.y1) return;
    const p = py(u.logM);
    if (p < 2 || p > ch - 2) return;
    axR.append("line").attr("x1", 0).attr("y1", p).attr("x2", 3).attr("y2", p)
      .attr("stroke", "rgba(255,100,100,0.4)").attr("stroke-dasharray", "2 2");
    if (u.slug && bandsFree(bandsR, p, u.label.split("\n").length, refPxR)) {
      axR.append("text").attr("class", "axis-unit-link").attr("data-slug", u.slug).attr("data-name", u.label)
        .attr("x", A.refX * rS).attr("y", p + 0.35 * refPxR).attr("text-anchor", "start")
        .attr("font-family", AXIS_FONT).style("font-size", fs(refPxR))
        .attr("fill", "rgba(255,150,150,0.92)")
        .text(u.label);
    }
  });

  axR.append("text").attr("transform", "rotate(90)").attr("x", ch / 2).attr("y", -A.R.title * rS)
    .attr("text-anchor", "middle").attr("class", "axis-title").style("font-size", fs(A.title * rS)).text("MASS");
  if (!_isMobile) {
    axR.append("text").attr("transform", "rotate(90)").attr("x", ch / 2).attr("y", -A.R.sub * rS)
      .attr("text-anchor", "middle").attr("class", "axis-subtitle").style("font-size", fs(A.sub * rS)).text(cfg.rightSub);
  }
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
let _dotSizeMult = 1;    // moving-dot size multiplier (settings slider)
let _dotOpacityMult = 1; // moving-dot opacity multiplier (settings slider)
let _dotFixedR = null;    // moving-dot radius in px, overriding the paths' own sizes (narration)

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

// Single gentle arc A → B (quadratic, affine-invariant like the others):
// control point at the chord midpoint, pushed sideways by `bow` × chord
// length. Used by paths with curve: "arc" instead of the S-shaped beziers.
function arcCtrl(A, B, bow = 0.12) {
  const dr = B.logR - A.logR, dm = B.logM - A.logM;
  return { r: (A.logR + B.logR) / 2 - dm * bow, m: (A.logM + B.logM) / 2 + dr * bow };
}
function arcDataPathGen(cp) {
  const [A, B] = [cp.points[0], cp.points[cp.points.length - 1]];
  const c = arcCtrl(A, B, cp.bow);
  return `M ${A.logR},${A.logM} Q ${c.r},${c.m} ${B.logR},${B.logM}`;
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
  probe.setAttribute("d", cp.curve === "arc" ? arcDataPathGen(cp)
    : isBezier ? bezierDataPathGen(cp.points) : dataCurveGen(cp.points));
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
    !document.documentElement.classList.contains("classic-open") &&
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

// "Made of" paths (COMPOSITION in data.js): one "combines" path per building
// block → whole, so composition reads like every other connection — moving
// dots along the curve, line revealed on hover. Hand-written paths that
// already join a part to its whole (proton → hydrogen, …) stand in for the
// generated one. Element-dust parts (N, P, S) have no position until the dust
// loads, so they stay pending and join on a later drawConnections().
const COMBINES_PARTICLE = "rgba(255,152,0,0.5)"; // particles → atoms
const COMBINES_MOLECULE = "rgba(128,222,234,0.5)"; // atoms → molecules → DNA
const _pendingComposition = [];

const nearPt = (p, r, m, tol = 0.005) => Math.abs(p.logR - r) < tol && Math.abs(p.logM - m) < tol;
function objectAt(p) {
  return OBJECTS.find(o => nearPt(p, o.logR, o.logM));
}
function compositionPartPos(name) {
  const o = OBJECTS.find(q => q.name === name);
  if (o) return [o.logR, o.logM];
  return dustPositions("element")?.get(name) ?? dustPositions("nucleus")?.get(name) ?? null;
}
function joinList(names) {
  return names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}
function compositionPath(part, whole, pos, wpos) {
  const A = { logR: pos[0], logM: pos[1] }, B = { logR: wpos[0], logM: wpos[1] };
  const len = Math.hypot(B.logR - A.logR, B.logM - A.logM);
  return {
    id: `made-of:${part}>${whole}`,
    family: "combines",
    _into: whole,
    description: `${whole} is made of ${joinList(COMPOSITION[whole])}`,
    points: [A, B],
    zoomRange: [6, 800],
    neighborhood: {
      x: [Math.min(A.logR, B.logR) - 1, Math.max(A.logR, B.logR) + 1],
      y: [Math.min(A.logM, B.logM) - 1, Math.max(A.logM, B.logM) + 1],
    },
    style: {
      lineOpacity: 0.15,
      lineWidth: 1.4,
      dotCount: Math.max(2, Math.min(6, Math.round(len * 1.5))),
      dotSize: 0.8,
      dotSpeed: 0.7,
      // Nuclei and atoms are built from particles; everything above from atoms
      color: COMPOSITION[whole].includes("Electron") || COMPOSITION[whole].includes("Neutron")
        ? COMBINES_PARTICLE : COMBINES_MOLECULE,
      dash: "4 3",
    },
  };
}
function compositionPaths(existing) {
  const out = [];
  for (const { part, whole } of _pendingComposition.splice(0)) {
    const pos = compositionPartPos(part), wpos = compositionPartPos(whole);
    if (!pos || !wpos) { _pendingComposition.push({ part, whole }); continue; }
    const covered = existing.some(cp => cp._into === whole && nearPt(cp.points[0], pos[0], pos[1]));
    if (!covered) out.push(compositionPath(part, whole, pos, wpos));
  }
  return out;
}
function prepareConnPath(cp) {
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
    _into: cp._into ?? objectAt(cp.points[cp.points.length - 1])?.name ?? null, // whole this path builds
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
}
/** Add any composition paths whose parts have become placeable (dust load). */
function syncCompositionPaths() {
  if (!_connPaths || !_pendingComposition.length) return;
  _connPaths.push(...compositionPaths(_connPaths).map(prepareConnPath));
}

function initConnections() {
  for (const [whole, parts] of Object.entries(COMPOSITION))
    for (const part of parts) _pendingComposition.push({ part, whole });
  _connPaths = CONNECTION_PATHS.map(prepareConnPath);
  _connPaths.push(...compositionPaths(_connPaths).map(prepareConnPath));
  // Warm curve geometry off the boot critical path (~2,500 getPointAtLength
  // calls if done eagerly); ensureConnGeometry() also builds on demand the
  // moment a path is actually used.
  const warm = () => _connPaths && _connPaths.forEach(ensureConnGeometry);
  if (typeof requestIdleCallback === "function") requestIdleCallback(warm, { timeout: 3000 });
  else setTimeout(warm, 1500);
  scheduleConnAnim();
}

/** Arc-length position (0–1) of anchor i on a connection path's curve. The
 *  curve passes through every anchor, so it is the first local minimum of
 *  the sample distance after the previous anchor — "first" matters for the
 *  stellar loops, which pass within a fraction of a unit of themselves. */
function connAnchorT(cp, i, fromK) {
  const n = cp.points.length - 1;
  if (i === 0) return { t: 0, k: 0 };
  if (i === n) return { t: 1, k: cp._samples.sx.length - 1 };
  const p = cp.points[i], s = cp._samples, N = s.sx.length - 1;
  const d2 = (k) => (s.sx[k] - p.logR) ** 2 + (s.sy[k] - p.logM) ** 2;
  const spacing2 = (cp._dataLen / N) ** 2;
  let best = -1, bd = Infinity;
  for (let k = fromK + 1; k <= N; k++) {
    const d = d2(k);
    if (d < bd) { bd = d; best = k; }
    if (d < spacing2 && k < N && d2(k + 1) > d) break; // first local minimum near the anchor
  }
  // Refine on the exact path within one sample either side.
  let lo = Math.max(0, best - 1) / N * cp._dataLen, hi = Math.min(N, best + 1) / N * cp._dataLen;
  const dist = (L) => { const q = cp._probe.getPointAtLength(L); return (q.x - p.logR) ** 2 + (q.y - p.logM) ** 2; };
  for (let it = 0; it < 24; it++) {
    const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3;
    if (dist(m1) < dist(m2)) hi = m2; else lo = m1;
  }
  return { t: ((lo + hi) / 2) / cp._dataLen, k: best };
}

/** Poster arrows: an arrowhead at the midpoint of every segment of a
 *  connection path, pointing the way the animated dots travel. */
function drawConnArrowheads(cp, group, opacity) {
  ensureConnGeometry(cp);
  const size = 9; // px, tip to base
  const ts = [];
  let k = 0;
  for (let i = 0; i < cp.points.length; i++) {
    const r = connAnchorT(cp, i, k);
    ts.push(r.t); k = r.k;
  }
  for (let i = 0; i < cp.points.length - 1; i++) {
    const [ax, ay] = getPathScreenPos(cp, ts[i]);
    const [bx, by] = getPathScreenPos(cp, ts[i + 1]);
    if (Math.hypot(bx - ax, by - ay) < size * 2.5) continue; // too short to carry an arrow
    const tm = (ts[i] + ts[i + 1]) / 2;
    const [x0, y0] = getPathScreenPos(cp, tm - 0.004);
    const [x1, y1] = getPathScreenPos(cp, tm + 0.004);
    const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1;
    const ux = dx / l, uy = dy / l;
    const [mx, my] = getPathScreenPos(cp, tm);
    const tipX = mx + ux * size / 2, tipY = my + uy * size / 2;
    const bX = tipX - ux * size, bY = tipY - uy * size;
    const w = size * 0.42;
    group.append("polygon")
      .attr("points", `${tipX},${tipY} ${bX - uy * w},${bY + ux * w} ${bX + uy * w},${bY - ux * w}`)
      .attr("fill", cp.family === "spectrum" ? emSpectrumColor(tm) : (cp.style.color || "rgba(255,255,255,0.6)"))
      .attr("opacity", opacity);
  }
}

function drawConnections() {
  lArrows.selectAll("*").remove();
  _connDotsStale = true;
  if (!_connPaths) return;
  syncCompositionPaths();

  // Screen-space serializers of the shared curve shape (connCurve /
  // connBezierCtrl are the single source of truth — see their definitions).
  const curveLineGen = d3.line()
    .x(p => px(p.logR)).y(p => py(p.logM))
    .curve(connCurve);

  // Bezier path generator for decay/combines paths:
  // All points are anchors; control points come from connBezierCtrl's
  // "1:2 rectangle at 45°" formula, serialized through px()/py().
  function arcPathGen(cp) {
    const [A, B] = [cp.points[0], cp.points[cp.points.length - 1]];
    const c = arcCtrl(A, B, cp.bow);
    return `M ${px(A.logR)},${py(A.logM)} Q ${px(c.r)},${py(c.m)} ${px(B.logR)},${py(B.logM)}`;
  }
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
  // Poster arrows (window.__poster): every path shown at every zoom, lines
  // strong enough to print, arrowheads instead of the animated dots.
  // A hovered composition line (cp._into) skips the ambient fade.
  const narrWave = (cp) => _narrSpectrum > 0 && cp.family === "spectrum";
  // a video's wave is drawn as strong as the poster's: the hover strength is lost on a phone
  const lineOp = (cp) => _posterArrows || narrWave(cp) ? Math.min(1, cp.style.lineOpacity * 4)
    : cp.style.lineOpacity * (cp._into ? 1 : cp._opacity);
  const lineW = (cp) => cp.style.lineWidth * (_posterArrows ? 1.4 : narrWave(cp) ? 1.8 : 1);
  _connPaths.forEach(cp => {
    cp._opacity = _posterArrows ? 1 : connectionOpacity(cp, view);
    cp._visible = cp._opacity > 0.01;
    cp._lineGroup = null;

    // Composition paths keep a hidden line even outside their ambient zoom
    // range: hovering the whole reveals it (showComposition) at any zoom, at
    // full strength — the ambient fade is for the dots, not a hovered line.
    if (!cp._visible && !cp._into && !narrWave(cp)) return;

    // Decay and combines paths use bezier curves (alternating anchor/control points)
    const isBezier = cp.family === "decay" || cp.family === "combines";

    // Draw visible line (hidden by default, revealed on hover)
    const lineGroup = lArrows.append("g")
      .attr("class", "conn-line")
      .attr("opacity", _posterArrows ? 1 : narrWave(cp) ? _narrSpectrum : 0)
      .style("transition", narrWave(cp) ? null : "opacity 0.3s")
      .style("pointer-events", "none");
    cp._lineGroup = lineGroup;

    if (cp.family === "spectrum") {
      // The line IS light: a clean sine wave whose wavelength grows toward
      // the radio end. Segments cover only the visible slice of the path,
      // dense enough per cycle that the wave stays smooth at any zoom —
      // a fixed segment count turns jagged when zoomed into a narrow slice.
      const CYCLES = 22;  // total cycles over the full path
      const AMP = 8;      // px
      // dφ/dt ∝ (1−t)^1.6 → wavelength increases monotonically, ~flat at the end
      const phase = (t) => 2 * Math.PI * CYCLES * (1 - Math.pow(1 - t, 2.6));
      let tMin = 1, tMax = 0;
      const COARSE = 64, pad = 200;
      for (let i = 0; i <= COARSE; i++) {
        const t = i / COARSE;
        const [sx, sy] = getPathScreenPos(cp, t);
        if (sx > -pad && sx < cw + pad && sy > -pad && sy < ch + pad) {
          if ((i - 1) / COARSE < tMin) tMin = Math.max(0, (i - 1) / COARSE);
          if ((i + 1) / COARSE > tMax) tMax = Math.min(1, (i + 1) / COARSE);
        }
      }
      if (tMax > tMin) {
        const cyclesInSlice = (phase(tMax) - phase(tMin)) / (2 * Math.PI);
        const SEG_COUNT = Math.max(40, Math.min(400, Math.ceil(cyclesInSlice * 16) + 8));
        const wavePoint = (t) => {
          const [sx, sy] = getPathScreenPos(cp, t);
          const [fx, fy] = getPathScreenPos(cp, Math.min(1, t + 0.005));
          const dx = fx - sx, dy = fy - sy;
          const l = Math.hypot(dx, dy) || 1;
          // the path lies on the Compton line: the wave swings out to the allowed
          // side only (larger size and mass: right and up on screen), never below it
          const off = (1 + Math.sin(phase(t))) * AMP / 2 * (dx + dy > 0 ? -1 : 1);   // (−dy, dx) points down-left when the path runs down-right
          return [sx + (-dy / l) * off, sy + (dx / l) * off];
        };
        for (let i = 0; i < SEG_COUNT; i++) {
          const t0 = tMin + (tMax - tMin) * (i / SEG_COUNT);
          const t1 = tMin + (tMax - tMin) * ((i + 1) / SEG_COUNT);
          const [x0, y0] = wavePoint(t0);
          const [x1, y1] = wavePoint(t1);
          lineGroup.append("line")
            .attr("x1", x0).attr("y1", y0).attr("x2", x1).attr("y2", y1)
            .attr("stroke", emSpectrumColor(t0))
            .attr("stroke-width", lineW(cp) * 0.6)
            .attr("opacity", lineOp(cp) * 0.7)
            .attr("stroke-linecap", "round");
        }
      }
    } else {
      const visD = cp.curve === "arc" ? arcPathGen(cp) : isBezier ? bezierPathGen(cp.points) : curveLineGen(cp.points);
      const pathEl = lineGroup.append("path")
        .attr("d", visD)
        .attr("fill", "none")
        .attr("stroke", cp.style.color || "rgba(255,255,255,0.3)")
        .attr("stroke-width", lineW(cp))
        .attr("opacity", lineOp(cp));
      if (cp.style.dash) pathEl.attr("stroke-dasharray", cp.style.dash);
    }
    if (_posterArrows) drawConnArrowheads(cp, lineGroup, lineOp(cp));

    if (!cp._visible) return; // no dots here, so no hover target either

    // Hit area for hover — shows line and tooltip
    const hitD = cp.curve === "arc" ? arcPathGen(cp) : isBezier ? bezierPathGen(cp.points) : curveLineGen(cp.points);
    lArrows.append("path")
      .attr("d", hitD)
      .attr("fill", "none")
      .attr("stroke", "transparent")
      .attr("stroke-width", 18)
      .style("cursor", "pointer")
      .on("mouseenter", function(e) {
        lineGroup.attr("opacity", 1);
        if (_boldHover) return; // video mode: bold line only, no hover menu
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
  // the normal pointing to the allowed side (right and up on screen)
  const flip = tdx + tdy < 0 ? -1 : 1;
  const perpX = flip * tdy / tlen, perpY = -flip * tdx / tlen;

  const freq = 28 * Math.max(0.12, 1 - t * 0.88);
  // The path lies on the Compton line, so the dots swing out from it to the
  // allowed side only, clear of the line by their own radius: no dot crosses
  // into the quantum-forbidden side.
  const amplitude = 6 + t * 10;
  const clear = (_dotFixedR ?? cp.style.dotSize * _dotSizeMult) + 0.5;
  const off = clear + (1 + Math.sin(t * freq * Math.PI * 2 - timestamp * 0.0004)) * amplitude / 2;
  return [sx + perpX * off, sy + perpY * off];
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
      el.setAttribute("r", String((_dotFixedR ?? cp.style.dotSize * _dotSizeMult) * sizeFactor));

      const edgeFade = Math.min(t / 0.04, (1 - t) / 0.04, 1);

      if (sx < -30 || sx > cw + 30 || sy < -30 || sy > ch + 30 || edgeFade <= 0) {
        el.setAttribute("opacity", "0");
      } else {
        const color = cp.family === "spectrum"
          ? emSpectrumColor(t)
          : (cp.style.color || "rgba(255,255,255,0.5)");
        el.setAttribute("fill", color);
        el.setAttribute("opacity", String(Math.min(1, cp._opacity * 0.6 * opacityMult * edgeFade * _dotOpacityMult)));
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
  flyTo(logR, logM, currentK, 400, d3.easeCubicOut);
});

// =============================================================
// Background tile renderer
// =============================================================

const _tileCache = new Map();
let _bgTilesEnabled = true;

// Fractal background (bg-noise.js): once you zoom past the painted tiles'
// resolution, a WebGL layer inside the SVG crossfades in and keeps folding the
// painting into finer detail. Nothing is fetched or run until then (and on the
// site not before the user's first zoom, since the home view is already past
// the tiles), and it stops entirely when you zoom back out. Settings toggle (+ opens its look
// controls); ?bgnoise / ?bgnoise=0 override the saved choice. Narrations
// (?narrate) default it on at full resolution; the site defaults it off and,
// when enabled, renders at half resolution (~4× cheaper on the GPU).
const _bgNoiseNarr = new URLSearchParams(location.search).has("narrate") || NARR_PREVIEW;
const BG_NOISE_DEFAULT_ON = _bgNoiseNarr;
const BG_NOISE_PROFILE = _bgNoiseNarr ? {} : { res: 0.5 };
const BG_NOISE_ON_AT = 1, BG_NOISE_OFF_AT = 0.7; // css px per source px (tiles run out at 1)
const _bgNoiseUrl = new URLSearchParams(location.search).get("bgnoise"); // null | "" | "0" | "1"
let _bgNoise = null;          // the layer, created on first zoom-in
let _bgNoiseSurface = null;
let _bgNoiseShown = false;    // currently replacing the tiles
let _bgNoiseArmed = _bgNoiseNarr; // site: not at startup, only after the first zoom
let _bgNoiseFadeTimer = 0;
let _bgNoiseWanted = _bgNoiseUrl !== null ? _bgNoiseUrl !== "0" : BG_NOISE_DEFAULT_ON;
let _bgNoiseMod = null;
const loadBgNoise = () => (_bgNoiseMod ??= import("./bg-noise.js").then(m => { m.applyNoiseProfile(BG_NOISE_PROFILE); return m; }));

/** Plot area and camera in source (z5) pixels, as drawTiles anchors them. */
function bgNoiseView() {
  const ppu = tileMeta.pxPerUnitX;
  const logR = xS.invert(cw / 2), logM = yS.invert(ch / 2);
  _bgNoiseSurface?.attr("width", cw).attr("height", ch);
  return {
    left: _bgNoiseBehind ? margin.left : 0, top: _bgNoiseBehind ? margin.top : 0, w: cw, h: ch,
    cx: 2114 + (logR - PLANCK_LOG_R) * ppu, cy: 5960 - (logM - PLANCK_LOG_M) * ppu,
    zx: Math.abs(xS(1) - xS(0)) / ppu, zy: Math.abs(yS(0) - yS(1)) / ppu,
  };
}

function setBgNoise(on) {
  _bgNoiseWanted = on;
  if (setBgNoiseChk) setBgNoiseChk.checked = on;
  syncBgNoise();
}

// Both backgrounds share the icons' clipped compositing group, so Screen
// blends against the fractal pixels just as it does against the painted tiles.
// WebKit paints a canvas inside a foreignObject above every later SVG sibling,
// so there the fractal would cover the grid, dust and icons. It keeps the
// canvas behind the whole SVG instead (the first placement): the SVG's black
// backdrops go while the layer is up. Elsewhere it lives inside the chart.
const _bgNoiseBehind = _isWebKit;
function setBgNoiseBackdrop(noise) {
  clearTimeout(_bgNoiseFadeTimer);
  const tiles = [lTiles, lTilesBase];
  const backdrops = (on) => {
    if (!_bgNoiseBehind) return;
    document.getElementById("chart").style.background = on ? "" : "#000";
    svg.style("position", on ? null : "relative");
    svg.select("rect.svg-bg").attr("fill", on ? "#000000" : "none");
    clip.select("rect.bg-rect").attr("display", on ? null : "none");
  };
  if (noise) {
    backdrops(false);
    tiles.forEach(l => l.style("transition", "opacity 0.5s").style("opacity", 0));
    _bgNoiseFadeTimer = setTimeout(() => tiles.forEach(l => l.style("display", "none")), 520);
  } else {
    tiles.forEach(l => l.style("display", null));
    lTiles.node().getBoundingClientRect(); // commit display before fading back in
    tiles.forEach(l => l.style("opacity", 1));
    _bgNoiseFadeTimer = setTimeout(() => {
      tiles.forEach(l => l.style("transition", null).style("opacity", null));
      backdrops(true);
    }, 520);
  }
}

/** Show the layer when enabled and zoomed past the tiles (with hysteresis). */
async function syncBgNoise() {
  const zoom = tileMeta ? Math.abs(xS(1) - xS(0)) / tileMeta.pxPerUnitX : 0;
  const want = !!(_bgNoiseWanted && _bgNoiseArmed && tileMeta && _bgTilesEnabled && !_posterMargins &&
    zoom >= (_bgNoiseShown ? BG_NOISE_OFF_AT : BG_NOISE_ON_AT));
  if (want === _bgNoiseShown) return;
  _bgNoiseShown = want;
  if (!want) {
    _bgNoise?.setVisible(false);
    setBgNoiseBackdrop(false);
    return;
  }
  if (!_bgNoise) {
    const { createBgNoise } = await loadBgNoise();
    if (!_bgNoiseShown || _bgNoise) { _bgNoise?.setVisible(_bgNoiseShown); return; } // changed while loading
    // A sibling HTML canvas lies outside clip's isolated blending group.
    // Embed it beneath the tiles instead, keeping all chart blends intact
    // (WebKit: behind the SVG, see _bgNoiseBehind).
    let host = document.getElementById("chart");
    if (!_bgNoiseBehind) {
      _bgNoiseSurface = dBack.insert("foreignObject", () => lTilesBase.node())
        .attr("class", "fractal-backdrop").attr("width", cw).attr("height", ch)
        .style("pointer-events", "none");
      host = _bgNoiseSurface.append("xhtml:div")
        .style("position", "relative").style("width", "100%").style("height", "100%").node();
    }
    _bgNoise = createBgNoise({
      host, meta: tileMeta, getView: bgNoiseView,
      onShown: () => { if (_bgNoiseShown) setBgNoiseBackdrop(true); },
      onLost: () => {   // back to the tiles at once; the next zoom past them builds it anew
        _bgNoise?.destroy(); _bgNoise = null; _bgNoiseSurface?.remove(); _bgNoiseSurface = null;
        if (_bgNoiseShown) { _bgNoiseShown = false; setBgNoiseBackdrop(false); }
      },
    });
    if (!_bgNoise) { _bgNoiseSurface?.remove(); _bgNoiseSurface = null; _bgNoiseShown = false; setBgNoise(false); return; } // no WebGL2
  }
  _bgNoise.setVisible(true);
}

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

  // Match device pixels before resorting to fractal detail. Deliberately
  // undersampling here made the painted view much softer than the fractal one.
  const targetPPU = screenPPU * Math.min(2, window.devicePixelRatio || 1);
  let best = levels[0];
  for (const lv of levels) {
    const lvPPU = (lv.w / imgDataW);
    best = lv;
    if (lvPPU >= targetPPU) break;
  }

  // Browser interpolation handles zoom beyond the source resolution. Extra
  // blur would erase available detail just before the fractal handoff.
  lTiles.style("filter", null);
  // Narration videos without the fractal layer: past what the painting can
  // hold, fade it to a hint of colour (full at 3× over-zoom, 15% by 10×).
  const overZoom = screenPPU / (best.w / imgDataW);
  const bgFade = _bgFadeDeep && !_bgNoiseShown ? Math.max(0.15, Math.min(1, 1 - (overZoom - 3) / 7 * 0.85)) : 1;
  if (!_bgNoiseShown) {
    lTiles.style("opacity", bgFade < 1 ? bgFade.toFixed(3) : null);
    lTilesBase.style("opacity", bgFade < 1 ? bgFade.toFixed(3) : null);
  }

  // Poster mode: the tile layers sit outside the clip so the nebula also
  // covers the axis columns — cull against the padded range.
  const _vd = vd();
  const _padU = _posterMargins
    ? Math.max(margin.left, margin.right, margin.top, margin.bottom) / Math.abs(px(1) - px(0)) : 0;
  // a dive pulls the painting back: draw what comes into view around the screen
  const _dpx = _dollyPadPx / Math.abs(px(1) - px(0)), _dpy = _dollyPadPx / Math.abs(py(1) - py(0));
  const x0 = _vd.x0 - _padU - _dpx, x1 = _vd.x1 + _padU + _dpx, y0 = _vd.y0 - _padU - _dpy, y1 = _vd.y1 + _padU + _dpy;
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

      const href = `${BASE}tiles/z${best.z}/tile_${c}_${r}.webp`;

      const key = href;
      if (!_tileCache.has(key)) {
        const img = new Image();
        img.src = href;
        _tileCache.set(key, img);
      }

      lTiles.append("image")
        .attr("href", href)
        .attr("x", sx).attr("y", sy)
        .attr("width", sw).attr("height", sh)
        .attr("preserveAspectRatio", "none")
        .attr("image-rendering", "auto");

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

      const href = `${BASE}tiles/z${base.z}/tile_${c}_${r}.webp`;
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
    const response = await fetch(`${BASE}tiles/meta.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    tileMeta = await response.json();
    drawBaseTiles(); // draw low-res background immediately
    redraw();
    syncBgNoise();
  } catch (error) {
    console.warn("Failed to load tile metadata:", error);
  }
}

// =============================================================
// Full redraw
// =============================================================

function redraw() {
  syncBgNoise();
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
// The targets sit above the SVG, so a wheel/trackpad gesture that starts on
// an object would never reach d3-zoom. Re-dispatch it on the SVG (same
// coordinates); zoom start then clears the targets for the rest of it.
clickTargetContainer.addEventListener("wheel", (e) => {
  e.preventDefault();
  wheelKind(e); // classify the real event: the copy loses legacy wheelDeltaY
  svg.node().dispatchEvent(new WheelEvent("wheel", e));
}, { passive: false });

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
  const hasIcon = mapIconShown(o);
  return hasIcon ? baseIco * iconSizeMult(o) : 14; // 14 matches the dot hit-area radius
}

function updateClickTargets() {
  clearClickTargets();
  if (!_lastProjected) return;

  const baseIco = effectiveIconSize();
  _lastProjected.forEach(o => {
    const size = objectHitSizePx(o, baseIco);

    // Convert SVG coords to page coords
    const visual = o._showIcon ? objectPicturePoint(o) : depthPoint(o, PARALLAX.dust);
    const pageX = visual.x + margin.left;
    const pageY = visual.y + margin.top;

    const div = document.createElement("button");
    div.type = "button";
    div.className = "click-target";
    div.setAttribute("aria-label", o.name);
    div.style.left = (pageX - size / 2) + "px";
    div.style.top = (pageY - size / 2) + "px";
    div.style.width = size + "px";
    div.style.height = size + "px";
    div.dataset.slug = o.slug;

    div.addEventListener("click", (e) => {
      e.stopPropagation();
      selectObject(o);
    });

    div.addEventListener("mouseenter", (e) => {
      setIconHover(o, true);
      showComposition(o);
      lLabels.selectAll(`[data-label-slug="${o.slug}"]`).attr("display", null);
      showTooltip(e, o, o.cat);
    });

    div.addEventListener("mouseleave", () => {
      setIconHover(o, false);
      hideComposition();
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
    const point = depthPoint(obj, PARALLAX.labels);
    const r = { ...obj._labelRect, x: obj._labelRect.x + point.x - obj.sx, y: obj._labelRect.y + point.y - obj.sy };
    const div = document.createElement("button");
    div.type = "button";
    div.className = "click-target click-target-label";
    div.setAttribute("aria-label", obj.name);
    div.style.left = (r.x + margin.left - 2) + "px";
    div.style.top = (r.y + margin.top - 2) + "px";
    div.style.width = (r.w + 4) + "px";
    div.style.height = (r.h + 4) + "px";
    div.dataset.slug = obj.slug;

    div.addEventListener("click", (e) => {
      e.stopPropagation();
      selectObject(obj);
    });

    div.addEventListener("mouseenter", (e) => {
      setIconHover(obj, true);
      showComposition(obj);
      showTooltip(e, obj, obj.cat);
    });

    div.addEventListener("mouseleave", () => {
      setIconHover(obj, false);
      hideComposition();
      hideTooltip();
    });

    clickTargetContainer.appendChild(div);
  });

  // Dark matter label click targets (WIMP, MACHO, and the primordial black holes'
  // window, whose labels open the PBH article instead)
  lDarkMatter.selectAll("text").each(function() {
    const pbh = !!this.closest(".pbh-window");
    try {
      const bbox = this.getBBox();
      if (bbox.width < 2 || bbox.height < 2) return;
      const div = document.createElement("button");
      div.type = "button";
      div.className = "click-target";
      div.setAttribute("aria-label", pbh ? `${PBH_WINDOW.title} — learn more` : "Dark matter — learn more");
      div.style.left = (bbox.x + margin.left - 2) + "px";
      div.style.top = (bbox.y + margin.top - 2) + "px";
      div.style.width = (bbox.width + 4) + "px";
      div.style.height = (bbox.height + 4) + "px";
      div.style.cursor = "pointer";

      div.addEventListener("click", (e) => {
        e.stopPropagation();
        if (pbh) openInfoPanel(PBH_WINDOW.slug, PBH_WINDOW.title);
        else openInfoPanel("dark-matter-search", "The Search for Dark Matter");
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
document.addEventListener("pointerdown", (e) => {
  // A real mouse press also exits touch mode (some setups fire few moves)
  if (e.pointerType === "mouse" && performance.now() - _lastTouchTs > 1000) setInputModality(false);
}, { capture: true, passive: true });

function selectObject(o) {
  _sidebarManuallyExpanded = false;
  openSidebar(o);
  setSidebarOpen(true);
  if (mobileRulersOn()) {
    _rulerFocus = o;
    requestAnimationFrame(() => mobileRulers.show());
    setTimeout(() => mobileRulers.visible && mobileRulers.draw(), 450); // once the sheet is up
  }
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
    const point = o._showIcon ? objectPicturePoint(o) : depthPoint(o, PARALLAX.dust);
    const ddx = point.x - sx, ddy = point.y - sy;
    const d2 = ddx * ddx + ddy * ddy;
    if (d2 < r * r && d2 < bestD2) { best = o; bestD2 = d2; }
  });
  if (best) { selectObject(best); return; }

  // 3b. A named catalogue dot (or its picture): the rulers, with guides from it
  if (mobileRulersOn()) {
    const nd = pickNamedDust(sx, sy, 22);
    if (nd) { _rulerFocus = { dustIndex: nd.i, logR: nd.logR, logM: nd.logM }; mobileRulers.show(); return; }
  }

  // 4. The primordial black holes' window (its HTML click-targets are inert on touch)
  if (under.some(el => el.closest?.(".pbh-window"))) {
    openInfoPanel(PBH_WINDOW.slug, PBH_WINDOW.title);
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

// Desktop: a click on any catalogue dot (named or not) draws dashed guides from
// it to the axes, with its values; moving the map or clicking elsewhere clears them.
let _mouseDown = null;
_chartTapEl.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "mouse" && e.button === 0) _mouseDown = { x: e.clientX, y: e.clientY, t: performance.now() };
}, { passive: true });
_chartTapEl.addEventListener("pointerup", (e) => {
  if (e.pointerType !== "mouse" || !_mouseDown || _isMobile || !_dustEnabled) return;
  const dx = e.clientX - _mouseDown.x, dy = e.clientY - _mouseDown.y, dt = performance.now() - _mouseDown.t;
  _mouseDown = null;
  if (dx * dx + dy * dy > 16 || dt > 500) return;  // a drag, not a click
  if (e.target.closest?.(".click-target, button, a, input")) return;
  const [mx, my] = d3.pointer(e, chart.node());
  const icon = pickDustIcon(mx, my);
  const anchor = icon && depthPoint(icon, PARALLAX.dust);
  const hit = icon ? pickDust(anchor.x, anchor.y, 1) : pickDust(mx, my, 6);
  if (hit) { _rulerFocus = { dustIndex: hit.i, logR: hit.logR, logM: hit.logM }; mobileRulers.pin(true); }
  else if (mobileRulers.visible) { _rulerFocus = null; mobileRulers.pin(false); }
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
  if (_posterNoText) posterHideText(); // wordless print: see window.__poster
  updateMinimap();
  updateScaleBar();
  if (_objFocus) applyObjFocus();
  _narrRedrawHook?.();
}

/* NOTE: a dots-only "fast renderer" (drawObjectsFast) used to live here and
 * was twice wired into the zoom path by mistake. It is deleted for good:
 * during ANY zoom/pan, labels must stay visible, correctly positioned, and
 * non-scaling every frame (see memory feedback-zoom-keep-labels). The
 * retained keyed-join renderer above satisfies that cheaply, and the perf
 * harness's label invariants fail CI if a "fast path" ever strands, scales,
 * or hides text again. */

/** Per-frame redraw during an active zoom/pan. Identical to redrawVectors():
 *  it full-renders objects (with text labels at correct positions) every
 *  frame. It is NOT a dots-only fast path — labels must never strand or scale
 *  mid-zoom (see memory feedback-zoom-keep-labels). */
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
  // dots-only renderer here; stranding the label layer is banned.
  drawObjects();
  drawHighlight();
  drawAxes();
  updateMinimap();
  updateScaleBar();
  if (_objFocus) applyObjFocus();
  _narrRedrawHook?.();
}

// =============================================================
// Zoom with rAF throttle
// =============================================================

let currentK = 1;
let rafPending = false;
let _narrRedrawHook = null; // narration overlay redraw (src/narration.js)
// narration: every object but these (names) fades (body.narr-obj-focus, --narr-obj-fade)
let _objFocus = null;
function applyObjFocus() {
  const keep = o => !!_objFocus?.has(o?.name);
  lIcons.selectAll("g.icon-g").classed("narr-keep", keep);
  lObjMain.selectAll("g.obj-g").classed("narr-keep", keep);
  lLabels.selectAll("text.obj-label").classed("narr-keep", keep);
  const slugs = new Set(OBJECTS.filter(keep).map(o => o.slug));
  lShadows.selectAll("g.icon-shadow").classed("narr-keep", d => slugs.has(d?.key));
}
let _zoomPrevTransform = null;  // track previous transform for CSS offset
let _zooming = false;
let _panSamples = [];           // recent touch-pan positions for momentum
// Zooming away from the tour dismisses it: a user zoom (wheel, pinch,
// dblclick — anything with a sourceEvent) that drifts 2× from the scale
// the tour left the view at closes the box. Programmatic zooms (tour
// steps, keyboard W/S) reset the baseline.
const TOUR_DISMISS_ZOOM = 2;
let _userZoomGesture = false;
let _tourBaseK = null;

const zoomBehavior = d3.zoom()
  .scaleExtent([0.3, 800])
  .filter((event) => {
    if (event.button && event.button !== 0) return false;
    if (event.target.closest?.("button, input, a")) return false;
    return svg.node().contains(event.target);
  })
  .on("start", (event) => {
    _zoomPrevTransform = { xS: xS.copy(), yS: yS.copy(), k: currentK };
    _userZoomGesture = !!event.sourceEvent;
    if (_userZoomGesture && mobileRulersOn()) { _rulerFocus = null; mobileRulers.setMoving(true); mobileRulers.show(); }
    else if (_userZoomGesture && !_isMobile && mobileRulers.visible) { _rulerFocus = null; mobileRulers.pin(false); }
    if (!_userZoomGesture) _tourBaseK = null;
    else if (_tourBaseK == null) _tourBaseK = currentK;
    _zooming = true;
    if (_shadowLift) {
      const o = _lastProjected.find(o => o.slug === _shadowLift.key);
      if (o) setIconHover(o, false);
    }
    hideDustTip();
    clearClickTargets();
    hideComposition(); // hover lines would strand at pre-zoom coordinates
    // The hover hit-paths aren't rebuilt during the gesture (see
    // updateConnectionOpacities), so disable them — a mousemove mid-wheel-zoom
    // would otherwise light a connection at stale, pre-zoom coordinates.
    // A line ALREADY revealed by hover would also strand: no mouseleave fires
    // while the cursor sits still, so hide any revealed line for the gesture.
    lArrows.style("pointer-events", "none");
    if (_connPaths) _connPaths.forEach(cp => { if (cp._lineGroup) cp._lineGroup.attr("opacity", 0); });
    hideTooltip();
    // Hide expensive feTurbulence filter during zoom on Safari for smoother animation
    if (_isSafari) grainRect.style("display", "none");
  })
  .on("zoom", (event) => {
    const t = event.transform;
    currentK = t.k;
    if (_userZoomGesture && mobileRulers.visible) mobileRulers.keep();
    if (_userZoomGesture && _tourBaseK && isTourActive() &&
        Math.abs(Math.log(t.k / _tourBaseK)) > Math.log(TOUR_DISMISS_ZOOM)) {
      closeTour();
    }
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
        syncBgNoise();
        updateReadout(null);
        rafPending = false;
        _hopfIcons?.draw();  // live icons follow this frame's positions, not the last one's
      });
    }
  })
  .on("end", (event) => {
    _zooming = false;
    // Dust only matters once the view is zoomed in: fetch it on the first
    // user gesture or any navigation that leaves the overview.
    // Programmatic zooms (presets, search, tour) count once the user has
    // engaged; the boot intro's own zoom-out never does.
    if (!dustReady() && (event.sourceEvent || (_userEngaged && viewZoomedIn()))) ensureDust();
    if (event.sourceEvent || _userEngaged) _bgNoiseArmed = true; // the fractal layer waits for a first zoom
    _zoomPrevTransform = null;
    lTiles.attr("transform", null);
    lTilesBase.attr("transform", null);
    lArrows.style("pointer-events", null); // drawConnections rebuilds fresh hit paths
    redraw();
    if (_isSafari) grainRect.style("display", null);
    updateStartButtonLabel();
    scheduleClickTargets();

    // Momentum pan: after a touch pan release, glide with decay (map-app
    // inertia). Only fires for pure pans (k stable) with real release speed;
    // the glide transition itself produces no touch samples, so it can't
    // re-trigger.
    const s = _panSamples;
    _panSamples = [];
    let gliding = false;
    if (s.length >= 2) {
      const last = s[s.length - 1];
      const ref = [...s].reverse().find(p => last.t - p.t >= 40) || s[0];
      const dt = last.t - ref.t;
      const kStable = Math.abs(last.k - ref.k) < last.k * 0.001;
      if (dt > 0 && kStable && performance.now() - last.t < 120) {
        const vx = (last.x - ref.x) / dt, vy = (last.y - ref.y) / dt; // px/ms
        const speed = Math.hypot(vx, vy);
        if (speed > 0.35 && !_reduceMotion) {
          const glide = Math.min(speed * 300, 700); // px of decay travel
          gliding = true;
          svg.transition("inertia").duration(600).ease(d3.easeCubicOut)
            .call(zoomBehavior.translateBy,
              (vx / speed) * glide / last.k,
              (vy / speed) * glide / last.k);
        }
      }
    }
    // the rulers' guides come back once the map is still (after the glide's own end)
    if (!gliding) mobileRulers.setMoving(false);
  });

svg.call(zoomBehavior);
// Safari's trackpad pinch, also over the click-target overlay above the map
enableTrackpadPinch(svg.node(), [svg.node(), clickTargetContainer]);
// particles drawn live as Hopf fibrations over their still pictures
// (the chart draws them itself right after a pan/zoom redraw, so they don't trail a frame behind)
let _hopfIcons = null;
startHopfIcons(document.getElementById("chart"), { busy: () => rafPending }).then(h => { _hopfIcons = h; });

// Trackpad two-finger drag pans; pinch and mouse wheel zoom (trackpad-pan.js).
// Wraps the start/end listeners above, so it must come after them.
enableTrackpadPan(svg.node(), zoomBehavior);

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
  flyTo(logR, logM, targetK, 400, d3.easeCubicOut);
});

// =============================================================
// Click-to-zoom on objects
// =============================================================

function zoomToObject(obj) {
  flyTo(obj.logR, obj.logM, Math.max(currentK * 2, 12), 700);
}

function panToCoord(logR, logM) {
  flyTo(logR, logM, currentK, 500, d3.easeCubicOut);
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

      const href = `${BASE}tiles/z${best.z}/tile_${c}_${r}.webp`;
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
  if (_reduceMotion) return 0;
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
// Poster renderer hook (scripts/poster.mjs)
// =============================================================
// Headless Chrome drives the chart into a print frame: hide the app UI,
// freeze animation, size the axis columns, lay the chart out on a fixed
// stage (which can be far larger than the browser window), frame a data
// region exactly, wait for every tile and icon to arrive, then screenshot
// the stage one window-sized piece at a time via shift(). Nothing in the
// app calls this — it exists so the site can print its own poster.
// Wordless print: drop the annotation layers whole (labels ride with their
// leader lines and pills) plus any text left in the drawing layers. Runs at
// the end of every redraw while poster no-text mode is on — a DOM pass, not
// a stylesheet rule, because a bare-tag selector would tax every per-frame
// rebuild in the app itself.
function posterHideText() {
  [lAxesWrap, lEnergyBands, lWaterPhase, lRegLabel, lObjExtras, lLabels]
    .forEach(l => l.attr("display", "none"));
  document.querySelectorAll("#chart svg text").forEach(t => { t.style.display = "none"; });
}

window.__poster = {
  /** Poster mode: no HTML chrome, no animation, explicit axis margins, an
   *  optional fixed stage size {W, H} in CSS px replacing the window,
   *  text:false for a wordless raster (no axes, labels or annotations),
   *  arrows:true to draw every connection path as static arrows, and
   *  labels:true to place strict, measured object labels (bold Helvetica
   *  caps, labelSize CSS px) for the vector overlay — see overlay(). */
  enter({ fontScale = 1, iconSize = 100, margins = null, stage = null, text = true, arrows = false,
          labels = false, labelSize = 11 } = {}) {
    svg.interrupt();
    document.body.classList.add("poster-mode", "ui-hidden", "anim-off");
    _animDisabled = true;
    _fontScale = fontScale;
    document.documentElement.style.setProperty("--font-scale", _fontScale);
    _iconSize = iconSize;
    _posterMargins = margins;
    _posterStage = stage;
    _posterNoText = !text;
    _posterArrows = arrows;
    _posterLabels = labels;
    _posterLabelSize = labelSize;
    // Nebula under everything: lift the tile layers out of the clip so they
    // also paint the axis columns (the vector layers stay clipped). The
    // icon and label layers come out too: a clip-path isolates its group,
    // so screen-blended icons left inside would composite against nothing
    // and show their black squares.
    if (lTiles.node().parentNode === dBack.node()) {
      const c = chart.node();
      c.insertBefore(lTilesBase.node(), clip.node());
      c.insertBefore(lTiles.node(), clip.node());
      c.insertBefore(lIcons.node(), lAxesWrap.node());
      c.insertBefore(lLabels.node(), lAxesWrap.node());
      clip.select("rect.bg-rect").attr("display", "none"); // would paint over the tiles
    }
    document.body.style.setProperty("--poster-w", stage ? stage.W + "px" : "100vw");
    document.body.style.setProperty("--poster-h", stage ? stage.H + "px" : "100vh");
    if (_isSidebarOpen) setSidebarOpen(false);
    updateMobileState();
    relayout();
    return { W, H, cw, ch, margin: { ...margin } };
  },
  /** Slide the stage so that stage point (x, y) sits at the window's top-left
   *  corner; resolves after the next two frames have painted. */
  async shift(x, y) {
    document.body.style.transform = `translate(${-x}px, ${-y}px)`;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  },
  /** Fit a data region {x:[lo,hi], y:[lo,hi]} into `frame` ({x, y, w, h} in
   *  chart px; default the whole chart area), centered, with `pad`
   *  (fraction of the region) of breathing room. No transition. */
  fit(region, pad = 0.05, frame = null) {
    svg.interrupt();
    const f = frame || { x: 0, y: 0, w: cw, h: ch };
    const [x0, x1] = region.x, [y0, y1] = region.y;
    const kx = f.w / ((xBase(x1) - xBase(x0)) * (1 + 2 * pad));
    const ky = f.h / ((yBase(y0) - yBase(y1)) * (1 + 2 * pad));
    const k = Math.min(kx, ky);
    const cx = (xBase(x0) + xBase(x1)) / 2;
    const cy = (yBase(y0) + yBase(y1)) / 2;
    const t = d3.zoomIdentity.translate(f.x + f.w / 2 - cx * k, f.y + f.h / 2 - cy * k).scale(k);
    svg.call(zoomBehavior.transform, t);
    return { k, ...vd() };
  },
  /** The text layers — the axes (numbers, unit references, titles, epoch
   *  labels and their tick lines) and, in labels mode, the object labels —
   *  as self-contained SVG markup: computed styles inlined, app classes
   *  stripped, axis font sizes multiplied by `axisFont`. Plus the layers'
   *  offset within the stage. The poster PDF prints this as vector text
   *  over the raster, so the raster itself carries no text. */
  overlay(axisFont = 1) {
    const PROPS = ["font-family", "font-size", "font-weight", "font-style", "letter-spacing",
      "fill", "fill-opacity", "opacity", "stroke", "stroke-width", "stroke-dasharray",
      "stroke-opacity", "stroke-linecap", "stroke-linejoin", "text-anchor", "dominant-baseline", "paint-order"];
    const cloneLayer = (layer, fontMul) => {
      const src = layer.node();
      const clone = src.cloneNode(true);
      clone.removeAttribute("display");
      const a = src.querySelectorAll("*"), b = clone.querySelectorAll("*");
      for (let i = 0; i < a.length; i++) {
        const cs = getComputedStyle(a[i]);
        // Unit references grow less than the numbers (they sit beside them),
        // and on the right axis they step aside so the wider numbers clear.
        const isUnit = a[i].classList.contains("axis-unit-link");
        const mul = isUnit ? 1 + (fontMul - 1) * 0.5 : fontMul;
        if (isUnit && fontMul > 1 && a[i].closest(".axis-r") && b[i].hasAttribute("x")) {
          b[i].setAttribute("x", (parseFloat(b[i].getAttribute("x")) + 8 * (fontMul - 1) * 4).toFixed(2));
        }
        b[i].removeAttribute("style");
        b[i].removeAttribute("class");
        if (b[i].getAttribute("display") === "none") continue;
        for (const p of PROPS) {
          let v = cs.getPropertyValue(p);
          if (!v || v === "none" || v === "normal") continue;
          if (p === "font-size" && mul !== 1) v = (parseFloat(v) * mul).toFixed(2) + "px";
          b[i].style.setProperty(p, v);
        }
      }
      return clone.outerHTML;
    };
    const parts = [cloneLayer(lAxesWrap, axisFont)];
    if (_posterLabels) parts.push(cloneLayer(lLabels, 1));
    return { svg: parts.join(""), x: margin.left, y: margin.top, W, H };
  },
  /** The tour's chart-anchored steps (id, title, text, view region), in
   *  tour order — the poster prints them as callouts. */
  tour() {
    return TOUR_STEPS
      .filter(s => s.view && !s.isIntro)
      .map(s => ({ id: s.id, title: s.title, text: s.text, view: s.view, index: TOUR_STEPS.indexOf(s) }));
  },
  /** Resolves once fonts, the tile manifest and every <image> currently in
   *  the SVG have loaded, and two frames have painted. */
  async ready() {
    await document.fonts?.ready;
    while (!tileMeta) await new Promise(r => setTimeout(r, 50));
    redraw(); // tiles may have been skipped if the manifest arrived after fit()
    const hrefs = [...new Set([...document.querySelectorAll("#chart svg image")]
      .map(el => el.getAttribute("href")).filter(Boolean))];
    await Promise.all(hrefs.map(h => new Promise(res => {
      const im = new Image();
      im.onload = im.onerror = () => res();
      im.src = h;
    })));
    if (_posterNoText) posterHideText();
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const labels = [...document.querySelectorAll("#chart svg text.obj-label")]
      .filter(t => t.getAttribute("display") !== "none").length;
    return { images: hrefs.length, labels, k: currentK, ...vd() };
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
      const rFriendly = friendlyRadius(logR + WIDTH_LOG_OFFSET);
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
  svg.transition().duration(_reduceMotion ? 0 : 500).call(zoomBehavior.transform, d3.zoomIdentity));

// ---------- settings panel ----------
const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");
settingsBtn.addEventListener("click", () => {
  const open = settingsPanel.classList.toggle("open");
  settingsBtn.classList.toggle("active", open);
  settingsBtn.setAttribute("aria-expanded", String(open));
});
// close when clicking outside
document.addEventListener("pointerdown", (e) => {
  if (settingsPanel.classList.contains("open") &&
      !settingsPanel.contains(e.target) && e.target !== settingsBtn && !settingsBtn.contains(e.target) &&
      !document.getElementById("bgnoise-box").contains(e.target)) {
    settingsPanel.classList.remove("open");
    settingsBtn.classList.remove("active");
    settingsBtn.setAttribute("aria-expanded", "false");
  }
});

// Keyboard shortcuts card: settings → "Show keyboard shortcuts", or ?.
// Esc, its × or a press outside closes it.
const shortcutsPanel = document.getElementById("shortcuts-panel");
function setShortcutsOpen(open) {
  shortcutsPanel.hidden = !open;
  if (open) {
    settingsPanel.classList.remove("open");
    settingsBtn.classList.remove("active");
    settingsBtn.setAttribute("aria-expanded", "false");
  }
}
document.getElementById("shortcuts-btn").addEventListener("click", () => setShortcutsOpen(true));
document.getElementById("shortcuts-close").addEventListener("click", () => setShortcutsOpen(false));
document.addEventListener("pointerdown", (e) => {
  if (!shortcutsPanel.hidden && !shortcutsPanel.contains(e.target) &&
      !document.getElementById("shortcuts-btn").contains(e.target)) setShortcutsOpen(false);
});

function saveSettings() {
  localStorage.setItem("tri-settings", JSON.stringify({
    bg: setBg.checked, anim: setAnim.checked, bgNoise: setBgNoiseChk.checked,
    labels: setLabels.checked, icons: _iconDensity, iconSize: +setIconSize.value,
    dust: setDust.checked,
    fontSize: +setFontSize.value, boldHover: setBoldHover.checked,
    dotSize: +setDotSize.value, dotOpacity: +setDotOpacity.value,
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

var setBgNoiseChk = document.getElementById("set-bgnoise"); // var: setBgNoise may run before this line
setBgNoiseChk.checked = _bgNoiseWanted;
setBgNoiseChk.addEventListener("change", () => {
  _bgNoiseArmed = true; // switching it on by hand shows it right away
  setBgNoise(setBgNoiseChk.checked);
  saveSettings();
});
// "+" beside the toggle: floating look controls (mounted on first open)
const bgNoiseBox = document.getElementById("bgnoise-box");
const bgNoiseOpenBtn = document.getElementById("bgnoise-open");
let _bgNoiseControlsMounted = false;
async function setBgNoiseBoxOpen(open) {
  bgNoiseBox.hidden = !open;
  bgNoiseOpenBtn.setAttribute("aria-expanded", String(open));
  if (open && !_bgNoiseControlsMounted) {
    _bgNoiseControlsMounted = true;
    (await loadBgNoise()).mountNoiseControls(document.getElementById("bgnoise-mount"));
    syncBgNoise();
  }
}
bgNoiseOpenBtn.addEventListener("click", () => setBgNoiseBoxOpen(bgNoiseBox.hidden));
document.getElementById("bgnoise-close").addEventListener("click", () => setBgNoiseBoxOpen(false));
bgNoiseBox.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); setBgNoiseBoxOpen(false); } });

const setAnim = document.getElementById("set-anim");
setAnim.addEventListener("change", () => {
  _animDisabled = !setAnim.checked;
  document.body.classList.toggle("anim-off", _animDisabled);
  scheduleConnAnim();  // restart the parked dot loop when re-enabled
  saveSettings();
});

const setDust = document.getElementById("set-dust");
setDust.addEventListener("change", () => {
  _dustEnabled = setDust.checked;
  if (_dustEnabled && viewZoomedIn()) ensureDust();
  redraw();
  saveSettings();
});

const setLabels = document.getElementById("set-labels");
setLabels.addEventListener("change", () => {
  _labelsEnabled = setLabels.checked;
  redraw();
  saveSettings();
});

const setIcons = document.getElementById("set-icons");
setIcons.addEventListener("input", () => {
  _iconDensity = +setIcons.value;
  _iconsEnabled = _iconDensity > 0;
  redraw();
  saveSettings();
});

// Moving dots: read every animation frame, so no redraw is needed
const setDotSize = document.getElementById("set-dot-size");
setDotSize.addEventListener("input", () => {
  _dotSizeMult = +setDotSize.value / 100;
  saveSettings();
});
const setDotOpacity = document.getElementById("set-dot-opacity");
setDotOpacity.addEventListener("input", () => {
  _dotOpacityMult = +setDotOpacity.value / 100;
  saveSettings();
});

const setIconSize = document.getElementById("set-icon-size");
setIconSize.addEventListener("input", () => {
  _iconSize = +setIconSize.value;
  redraw();
  saveSettings();
});

const setBoldHover = document.getElementById("set-bold-hover");
setBoldHover.addEventListener("change", () => {
  _boldHover = setBoldHover.checked;
  document.body.classList.toggle("bold-hover", _boldHover);
  saveSettings();
});

const setFontSize = document.getElementById("set-font-size");
setFontSize.addEventListener("input", () => {
  _fontScale = +setFontSize.value / 100;
  document.documentElement.style.setProperty("--font-scale", _fontScale);
  relayout(); // fonts feed label metrics and static layers — full redraw
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

// Step jump (recording): type a tour step's number — "7", "07", "15" — then
// Space. Digits wait in a short buffer; a lone 0 still resets the view
// (Home does it instantly) unless another digit follows it.
const STEP_DIGIT_MS = 1500;  // a typed number is forgotten after this
const LONE_ZERO_MS = 450;    // how long a lone 0 waits for a second digit
let _stepDigits = "", _stepDigitsTimer = null, _zeroResetTimer = null;
const resetView = () =>
  svg.transition().duration(_reduceMotion ? 0 : 500).call(zoomBehavior.transform, d3.zoomIdentity);
function onStepDigit(digit) {
  clearTimeout(_zeroResetTimer);
  if (digit === "0" && !_stepDigits) _zeroResetTimer = setTimeout(resetView, LONE_ZERO_MS);
  _stepDigits = (_stepDigits + digit).slice(-2);
  clearTimeout(_stepDigitsTimer);
  _stepDigitsTimer = setTimeout(() => { _stepDigits = ""; }, STEP_DIGIT_MS);
}
function jumpToTypedStep() {
  clearTimeout(_zeroResetTimer);
  clearTimeout(_stepDigitsTimer);
  const n = parseInt(_stepDigits, 10);
  _stepDigits = "";
  if (!tourGoTo(n - 1)) console.log(`No tour step ${n}`);
}

document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (/^[0-9]$/.test(e.key)) { onStepDigit(e.key); return; }
  if (e.key === " " && _stepDigits) {
    e.preventDefault(); // not a click on whatever button has focus
    jumpToTypedStep();
    return;
  }
  // ? = Shift+/ on US keys; match the physical key too, so layouts that
  // report another character for it still open the card.
  if (e.key !== "?" && e.code === "Slash" && e.shiftKey) { setShortcutsOpen(shortcutsPanel.hidden); return; }
  // Arrow keys pan. Letter keys are recording shortcuts (see keyhint / docs):
  //   W/S zoom · A/D step the tour pages · Z/X slow/speed animations
  //   H hide UI (and log the whole tour script) · 07 + Space jump to tour step 7
  //   V cycle the recording stage: 1920×1080 → 9:16 phone (mobile layout) → off
  //   R reset all settings (and presenter state) to defaults
  //   L the original Lineweaver–Patel figure (hidden; also /classic/)
  //   ? the keyboard shortcuts card (keep it in step with index.html)
  switch (e.key) {
    case "+": case "=":
      svg.transition().duration(200).call(zoomBehavior.scaleBy, 1.4); break;
    case "-": case "_":
      svg.transition().duration(200).call(zoomBehavior.scaleBy, 1 / 1.4); break;
    case "ArrowLeft":
      svg.transition().duration(_reduceMotion?0:ICON_HOVER_MS).ease(iconHoverEase).call(zoomBehavior.translateBy, PAN_STEP, 0); break;
    case "ArrowRight":
      svg.transition().duration(_reduceMotion?0:ICON_HOVER_MS).ease(iconHoverEase).call(zoomBehavior.translateBy, -PAN_STEP, 0); break;
    case "ArrowUp":
      svg.transition().duration(_reduceMotion?0:ICON_HOVER_MS).ease(iconHoverEase).call(zoomBehavior.translateBy, 0, PAN_STEP); break;
    case "ArrowDown":
      svg.transition().duration(_reduceMotion?0:ICON_HOVER_MS).ease(iconHoverEase).call(zoomBehavior.translateBy, 0, -PAN_STEP); break;
    case "Home":
      resetView(); break; // "0" too — see onStepDigit

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
      // Hiding the UI = recording: print the tour script to read from.
      if (document.body.classList.toggle("ui-hidden")) logAllSteps();
      break;
    case "v": case "V":
      setViewportLock(!_viewportLock ? "landscape" : _viewportLock === "landscape" ? "portrait" : null);
      announce(_viewportLock ? `Viewport: ${_viewportLock} ${vpStage().W}×${vpStage().H}` : "Viewport unlocked");
      break;
    case "r": case "R":
      resetAllSettings(); break;
    case "l": case "L":
      openClassicMode(); break;
    case "?":
      setShortcutsOpen(shortcutsPanel.hidden); break;
  }
});

// Hidden "classic" mode (L key, /classic/ or #classic): the original Lineweaver–Patel
// figure, zoomable. Loaded on demand; it takes over the keyboard while open.
// sync: open on the map's current spot (false for a direct /classic/ visit,
// which shows the published figure's own framing).
function openClassicMode(sync = true) {
  const view = sync ? mapView() : null;
  import("./classic.js").then(m => m.openClassic(view));
}

// View sync across the classic cross-fade: both figures plot log r [cm] ×
// log m [g], so each opens on the spot the other was showing. A view is
// { cx, cy, r, m, ppdX, ppdY } — client point (cx, cy) shows (r, m), at
// ppdX / ppdY screen px per decade (see classic.js).
function plotCenterClient() {
  const ctm = svg.node().getScreenCTM();
  return ctm && [ctm.a * (margin.left + cw / 2) + ctm.e, ctm.d * (margin.top + ch / 2) + ctm.f, ctm.a];
}
function mapView() {
  const p = plotCenterClient();
  if (!p) return null;
  const ppd = p[2] * (xS(1) - xS(0)); // equal-scale axes: one px/decade
  return { cx: p[0], cy: p[1], r: xS.invert(cw / 2), m: yS.invert(ch / 2), ppdX: ppd, ppdY: ppd };
}
function applyMapView(v) {
  const p = plotCenterClient();
  if (!p || !v) return;
  const r = v.r + (p[0] - v.cx) / v.ppdX;
  const m = v.m - (p[1] - v.cy) / v.ppdY;
  const [kMin, kMax] = zoomBehavior.scaleExtent();
  const k = Math.max(kMin, Math.min(kMax, v.ppdX / (p[2] * (xBase(1) - xBase(0)))));
  svg.interrupt();
  flyTo(r, m, k);
}
window.addEventListener("hashchange", () => {
  if (location.hash === "#classic") openClassicMode();
});
// Forward/Back onto the figure's own page, /classic/
window.addEventListener("popstate", () => {
  if (location.pathname.replace(/\/+$/, "") === "/classic") openClassicMode();
});
// The map's dot animation parks while the classic figure covers it. Closing
// hands over the figure's view; the map jumps there while still covered.
window.addEventListener("classic-close", (e) => {
  applyMapView(e.detail);
  scheduleConnAnim();
});

// R: one keystroke back to a clean default state — settings, presenter
// modes, hidden UI, animation speed, custom margins. Each control is
// reset through its own event so its handler applies the side effects.
function resetAllSettings() {
  const setChk = (el, val) => {
    if (el.checked !== val) { el.checked = val; el.dispatchEvent(new Event("change", { bubbles: true })); }
  };
  const setRange = (el, val) => {
    if (+el.value !== val) { el.value = val; el.dispatchEvent(new Event("input", { bubbles: true })); }
  };
  setChk(setBg, true); setChk(setAnim, true);
  setChk(setLabels, true); setRange(setIcons, ICON_DENSITY_DEFAULT);
  setChk(setBoldHover, false);
  setRange(setIconSize, 100); setRange(setFontSize, 100);
  setRange(setDotSize, 100); setRange(setDotOpacity, 100);
  if (setGridUnit.value !== "si") {
    setGridUnit.value = "si";
    setGridUnit.dispatchEvent(new Event("change", { bubbles: true }));
  }
  _animSpeed = 1;
  _userMarginLeft = _userMarginRight = _userMarginTop = _userMarginBottom = null;
  document.body.classList.remove("ui-hidden");
  if (_viewportLock) setViewportLock(null);
  relayout();
  saveSettings();
  announce("Settings reset to defaults");
}

// Recording viewport (V). The transformed <body> becomes the containing
// block for its fixed-position children, so the whole UI — pills, sidebar,
// tour — anchors inside the stage. mode: null | "landscape" | "portrait".
function setViewportLock(mode) {
  _viewportLock = mode;
  // Stop any in-flight zoom transition first: relayout reads the current
  // transform, and reading it mid-transition can propagate NaN.
  svg.interrupt();
  document.documentElement.classList.toggle("viewport-lock-page", !!mode);
  document.body.classList.toggle("viewport-lock", !!mode);
  const bs = document.body.style;
  if (mode) {
    const s = vpStage();
    bs.setProperty("--vp-scale", viewportLockScale());
    // --app-w/h stand in for 100vw/100vh in CSS sized to the viewport.
    bs.setProperty("--app-w", s.W + "px");
    bs.setProperty("--app-h", s.H + "px");
  } else {
    bs.removeProperty("--vp-scale");
    bs.removeProperty("--app-w");
    bs.removeProperty("--app-h");
  }
  positionSafeZones();
  const modeChanged = updateMobileState();
  relayout(); // preserves zoom center + scale through the new layout
  if (modeChanged) {
    applyTitleLockups();
    if (_isMobile && _isSidebarOpen) setSidebarOpen(false);
  }
}

// Vertical-video safe zones (portrait stage only): four colour bars in the
// black gutter around the stage — red where the apps' UI covers the video,
// green where content stays visible. They live outside <body> (the stage),
// so cropping the capture to the stage leaves them out.
let _safeZonesEl = null;
function positionSafeZones() {
  const on = _viewportLock === "portrait";
  if (!on) { _safeZonesEl?.remove(); _safeZonesEl = null; return; }
  if (!_safeZonesEl) {
    _safeZonesEl = document.createElement("div");
    _safeZonesEl.className = "vp-safe-zones";
    _safeZonesEl.setAttribute("aria-hidden", "true");
    _safeZonesEl.innerHTML =
      `<div class="vp-safe-v vp-safe-l"></div><div class="vp-safe-v vp-safe-r"></div>` +
      `<div class="vp-safe-h vp-safe-t"></div><div class="vp-safe-h vp-safe-b"></div>` +
      `<span class="vp-safe-label" style="--y:${VP_SAFE.top / 2}">top bar</span>` +
      `<span class="vp-safe-label" style="--y:${1 - VP_SAFE.bottom / 2}">caption</span>`;
    document.documentElement.appendChild(_safeZonesEl);
  }
  const r = document.body.getBoundingClientRect();
  const st = _safeZonesEl.style;
  st.setProperty("--sx", r.left + "px");
  st.setProperty("--sy", r.top + "px");
  st.setProperty("--sw", r.width + "px");
  st.setProperty("--sh", r.height + "px");
  st.setProperty("--st", VP_SAFE.top * 100 + "%");
  st.setProperty("--sb", (1 - VP_SAFE.bottom) * 100 + "%");
  st.setProperty("--sl", VP_SAFE.left * 100 + "%");
  st.setProperty("--sr", (1 - VP_SAFE.right) * 100 + "%");
}

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

// Resize must never wipe the user's zoom position: rotation, URL-bar
// collapse, and the on-screen keyboard all fire this. On touch devices,
// height-only wiggles (browser chrome showing/hiding) are ignored outright;
// real resizes re-layout around the preserved center. relayout() owns all
// sizing and triggers the full redraw via the zoom handlers — no extra
// redraw() here.
let _lastVw = window.innerWidth, _lastVh = window.innerHeight;
let _resizeTimer = null;
// Moving between displays can change pixel density without changing CSS size.
// Refresh image tiers even when the normal layout resize does not run.
function watchIconPixelDensity() {
  const query = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
  query.addEventListener("change", () => {
    watchIconPixelDensity();
    redraw();
  }, { once: true });
}
watchIconPixelDensity();
window.addEventListener("resize", () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => {
    if (_viewportLock) {
      // Stage dims are fixed; only the fit-to-window scale changes.
      document.body.style.setProperty("--vp-scale", viewportLockScale());
      positionSafeZones();
      return;
    }
    const dw = Math.abs(window.innerWidth - _lastVw);
    const dh = Math.abs(window.innerHeight - _lastVh);
    // Browser-chrome height wiggle only matters in the phone layout; a
    // desktop-layout tablet resizing its window deserves a real relayout.
    // Not while narrating: the narration fills the window, and a host page
    // (a claude.ai panel opening) can grow it by less than that after boot,
    // which would leave the map short of the bottom edge.
    if (_isCoarse && _isMobile && dw === 0 && dh < 160 && !document.body.classList.contains("narrating")) return;
    _lastVw = window.innerWidth; _lastVh = window.innerHeight;
    const modeChanged = updateMobileState();
    relayout(); // preserves zoom center + scale through the new layout
    if (modeChanged) {
      applyTitleLockups(); // re-fit (mobile) or reset (desktop) the lockup
      if (_isMobile && _isSidebarOpen) setSidebarOpen(false);
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
  searchBtn.setAttribute("aria-expanded", "true");
  searchInput.setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => searchInput.focus());
  ensureSearchCatalogue();
}
function closeSearch() {
  searchBox.classList.remove("expanded");
  searchBtn.setAttribute("aria-expanded", "false");
  searchInput.setAttribute("aria-expanded", "false");
  searchInput.removeAttribute("aria-activedescendant");
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
function applyTitleLockups() {
  document.querySelectorAll("#intro-title, #tour-header h2").forEach(h => {
    // Clear any previous fit first — the fitter scales from current computed
    // size, and desktop must return to its stylesheet sizes.
    const l2 = h.querySelector(".title-line2, .tour-title-line2");
    if (l2) { l2.style.fontSize = ""; l2.style.letterSpacing = ""; }
    if (_isMobile) fitTitleLockup(h);
  });
}
(document.fonts?.ready || Promise.resolve()).then(applyTitleLockups);

// Mobile axes button: pins the overlay rulers (src/mobile-rulers.js). They
// unpin after a few idle seconds; the timer restarts on every pan or pinch,
// so they never vanish mid-inspection.
const AXES_AUTO_HIDE_MS = 8000;
function setAxesButton(on) {
  document.body.classList.toggle("mobile-axes-on", on);
  const btn = document.getElementById("axes-toggle");
  btn?.classList.toggle("active", on);
  btn?.setAttribute("aria-pressed", String(on));
}
function setMobileAxes(on, { autoHide = true } = {}) {
  setAxesButton(on);
  if (on) _rulerFocus = null;
  mobileRulers.pin(on, autoHide ? AXES_AUTO_HIDE_MS : Infinity);
}
document.getElementById("axes-toggle")?.addEventListener("click", (e) => {
  // Keyboard activation (event.detail === 0) pins the rulers for good — a
  // timer that yanks them away is hostile to keyboard and switch users.
  // Pointer taps keep the 8s auto-hide.
  setMobileAxes(!mobileRulers.pinned, { autoHide: e.detail !== 0 });
});

searchBtn.addEventListener("click", () => {
  if (searchBox.classList.contains("expanded")) closeSearch();
  else openSearch();
});

// Search covers object names AND category/subcategory names ("black" finds
// no object — black holes are named Sgr A*, M87*, Ton 618 — but it should
// land on the Black Holes region). Region entries fly to the group's bounds.
let _searchRegions = null;
function getSearchRegions() {
  if (_searchRegions) return _searchRegions;
  const groups = new Map();
  const add = (label, o, color) => {
    if (!label) return;
    const key = label.toUpperCase();
    if (!groups.has(key)) groups.set(key, { label, color, members: [] });
    groups.get(key).members.push(o);
  };
  OBJECTS.forEach(o => {
    add(SUBCAT_LABELS[o.subcat], o, SUBCAT_COLORS[o.subcat] || CATEGORIES[o.cat]?.color || "#fff");
    add(catDisplayLabel(o.cat), o, CATEGORIES[o.cat]?.color || "#fff");
  });
  _searchRegions = [...groups.values()].filter(g => g.members.length >= 2);
  return _searchRegions;
}

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

let searchIndex = buildSearchIndex(OBJECTS, []);
let searchCatalogueLoading = null;
function ensureSearchCatalogue() {
  if (searchCatalogueLoading) return;
  searchCatalogueLoading = loadDust().then(() => {
    searchIndex = buildSearchIndex(OBJECTS, dustSearchEntries());
    if (searchBox.classList.contains("expanded")) renderSearchResults();
  }).catch(error => {
    searchCatalogueLoading = null;
    console.warn("Search catalogue failed to load", error);
    if (searchBox.classList.contains("expanded")) renderSearchResults(true);
  });
}

function renderSearchResults(loadFailed = false) {
  const q = searchInput.value.trim().toLowerCase();
  _searchActive = -1;
  searchInput.removeAttribute("aria-activedescendant");
  if (q.length < 1) { searchResults.classList.remove("active"); return; }

  const matches = searchObjects(searchIndex, q);
  const regions = getSearchRegions().filter(g => g.label.toLowerCase().includes(q)).slice(0, 3);

  // The UI must always respond — an empty dropdown reads as "search is broken"
  if (matches.length === 0 && regions.length === 0) {
    searchResults.innerHTML = `<div class="search-empty">${loadFailed ? "Catalogue unavailable. Reopen search to retry." : !dustReady() ? "Loading catalogue…" : `No matches for “${escapeHtml(searchInput.value.trim())}”`}</div>`;
    searchResults.classList.add("active");
    return;
  }

  searchResults.innerHTML = matches.map((o, index) => {
    const dotColor = SUBCAT_COLORS[o.subcat || DUST_SOURCE_SUBCAT[o.sourceId]] || CATEGORIES[o.cat]?.color || "#fff";
    return `<button type="button" role="option" class="search-item" data-result="${index}">
      <span class="search-dot" style="background:${dotColor}"></span>
      <span class="search-name">${escapeHtml(o.name)}</span>
      <span class="search-cat">${escapeHtml(o.kind || o.cat)}</span>
    </button>`;
  }).join("") + regions.map((g, i) => `
    <button type="button" role="option" class="search-item search-region" data-region="${i}">
      <span class="search-dot" style="background:${g.color}"></span>
      <span class="search-name">${escapeHtml(g.label)}</span>
      <span class="search-cat">region</span>
    </button>`).join("");
  searchResults.querySelectorAll(".search-item").forEach((el, i) => { el.id = "sr-opt-" + i; });
  _searchActive = -1;
  searchInput.removeAttribute("aria-activedescendant");
  searchResults.classList.add("active");

  searchResults.querySelectorAll(".search-item:not(.search-region)").forEach(el => {
    el.addEventListener("click", () => {
      const obj = matches[+el.dataset.result];
      focusDust(obj.dustIndex ?? null);
      if (obj.dustIndex != null) {
        closeSidebar();
        _dustEnabled = true;
        setDust.checked = true;
        flyTo(obj.logR, obj.logM, Math.max(currentK, 12), 500, d3.easeCubicOut);
        redraw();
      } else {
        panToCoord(obj.logR, obj.logM);
        openSidebar(obj);
      }
      closeSearch();
    });
  });
  searchResults.querySelectorAll(".search-region").forEach(el => {
    el.addEventListener("click", () => {
      focusDust();
      const g = regions[+el.dataset.region];
      const pad = 1.5;
      const xs = g.members.map(m => m.logR), ys = g.members.map(m => m.logM);
      zoomToRegion({
        x: [Math.min(...xs) - pad, Math.max(...xs) + pad],
        y: [Math.min(...ys) - pad, Math.max(...ys) + pad],
      });
      closeSearch();
    });
  });
}
searchInput.addEventListener("input", () => {
  ensureSearchCatalogue();
  renderSearchResults();
});

// Keyboard: ArrowUp/Down move the active option, Enter activates it,
// Escape closes — search was mouse-only before.
let _searchActive = -1;
function setActiveSearchResult(i) {
  const items = [...searchResults.querySelectorAll(".search-item")];
  if (!items.length) return;
  _searchActive = ((i % items.length) + items.length) % items.length;
  items.forEach((el, j) => el.classList.toggle("kbd-active", j === _searchActive));
  searchInput.setAttribute("aria-activedescendant", items[_searchActive].id);
  items[_searchActive].scrollIntoView({ block: "nearest" });
}
searchInput.addEventListener("keydown", (e) => {
  const items = searchResults.querySelectorAll(".search-item");
  if (e.key === "ArrowDown") { e.preventDefault(); setActiveSearchResult(_searchActive + 1); }
  else if (e.key === "ArrowUp") { e.preventDefault(); setActiveSearchResult(_searchActive - 1); }
  else if (e.key === "Enter" && items.length) { e.preventDefault(); items[Math.max(0, _searchActive)].click(); }
  else if (e.key === "Escape") { e.stopPropagation(); closeSearch(); }
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
    if (appOverlay) {
      closeAppOverlay();
    } else if (!shortcutsPanel.hidden) {
      setShortcutsOpen(false);
    } else if (selectedObj) {
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
      svg.transition().duration(_reduceMotion ? 0 : 800).ease(d3.easeCubicInOut)
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

    svg.transition().duration(_reduceMotion ? 0 : 800).ease(d3.easeCubicInOut)
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
    if (_bgNoiseUrl === null && typeof saved.bgNoise === "boolean") setBgNoise(saved.bgNoise);
    if (saved.anim === false) { setAnim.checked = false; _animDisabled = true; document.body.classList.add("anim-off"); }
    if (saved.labels === false) { setLabels.checked = false; _labelsEnabled = false; }
    if (saved.dust === false) { setDust.checked = false; _dustEnabled = false; }
    // icons: a density 0–100 (an older true/false toggle: false → none)
    const dens = saved.icons === false ? 0 : typeof saved.icons === "number" ? Math.max(0, Math.min(100, saved.icons)) : null;
    if (dens !== null) { setIcons.value = dens; _iconDensity = dens; _iconsEnabled = dens > 0; }
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
    if (saved.fontSize > 0) {
      setFontSize.value = Math.max(50, Math.min(250, +saved.fontSize));
      _fontScale = +setFontSize.value / 100;
      document.documentElement.style.setProperty("--font-scale", _fontScale);
    }
    if (saved.dotSize > 0) {
      setDotSize.value = Math.max(30, Math.min(300, +saved.dotSize));
      _dotSizeMult = +setDotSize.value / 100;
    }
    if (typeof saved.dotOpacity === "number") {
      setDotOpacity.value = Math.max(0, Math.min(300, saved.dotOpacity));
      _dotOpacityMult = +setDotOpacity.value / 100;
    }
    if (saved.boldHover) {
      setBoldHover.checked = true;
      _boldHover = true;
      document.body.classList.add("bold-hover");
    }
    if (typeof saved.marginLeft === "number")   _userMarginLeft   = saved.marginLeft;
    if (typeof saved.marginRight === "number")  _userMarginRight  = saved.marginRight;
    if (typeof saved.marginTop === "number")    _userMarginTop    = saved.marginTop;
    if (typeof saved.marginBottom === "number") _userMarginBottom = saved.marginBottom;
  }
} catch (e) { /* ignore corrupt data */ }
// The first layout ran before the saved settings were read: redo it so the
// saved font size (axis type, column widths) and margins apply from the
// first frame. Still pre-boot, so the zoom is the identity — copy the scales
// rather than firing zoom events.
measure();
applyLayout();
xS = xBase.copy();
yS = yBase.copy();

// OS reduced-motion preference: decorative animation defaults OFF unless the
// user explicitly saved it on (their in-app choice wins over the OS default).
if (_reduceMotion && !_animDisabled) {
  let savedAnimOn = false;
  try { savedAnimOn = JSON.parse(localStorage.getItem("tri-settings"))?.anim === true; } catch (e) { /* ignore */ }
  if (!savedAnimOn) {
    setAnim.checked = false;
    _animDisabled = true;
    document.body.classList.add("anim-off");
  }
}

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
    applyLayout({ resetZoom: true });
    // Re-apply: zoom level k around the captured center
    flyTo(cx, cy, k);
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
    applyLayout({ resetZoom: true });
    flyTo(cx, cy, k);
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
  _repositionAxisHandles = positionHandles;
})();

// =============================================================
// URL hash state for bookmarkable zoom positions
// =============================================================

function saveHash() {
  if (NARR_PREVIEW) return;
  // Don't overwrite tour hashes — the tour manages its own URL state
  if (location.hash.startsWith("#tour=")) return;
  // Nor the hidden classic figure's
  if (location.hash === "#classic" || pathSlug() === "classic" ||
      document.documentElement.classList.contains("classic-open")) return;
  const d = vd();
  const cx = ((d.x0 + d.x1) / 2).toFixed(1);
  const cy = ((d.y0 + d.y1) / 2).toFixed(1);
  const z = currentK.toFixed(2);
  // The open object/article lives in the PATH (/eois-stantonae/), which is a
  // real, crawlable page with its own title and preview image (generated by
  // scripts/build-pages.mjs); the view stays in the hash.
  const slug = selectedObj?.slug || "";
  const path = SUBFOLDER ? location.pathname : slug ? `/${slug}/` : "/";
  history.replaceState(null, "", `${path}#${cx},${cy},${z}`);
  const name = selectedObj && (selectedObj.sidebarName || selectedObj.name);
  document.title = name ? `${name} — The Triangle of Everything` : "The Triangle of Everything";
}

// Object named by the URL path (/eois-stantonae/), if any. Pages built by
// build-pages.mjs also carry its display name for info-panel articles.
function pathSlug() {
  if (NARR_PREVIEW || SUBFOLDER) return null;
  const seg = decodeURIComponent(location.pathname).replace(/^\/+|\/+$/g, "");
  return /^[a-z0-9][a-z0-9-]*$/.test(seg) ? seg : null;
}

function loadHash() {
  if (NARR_PREVIEW) return false; // the hash names the take there
  const h = location.hash.slice(1);
  const ps = pathSlug();
  // Hidden: the original Lineweaver–Patel figure, at /classic/ (or the old
  // #classic). The map waits underneath at its full view.
  if (ps === "classic" || h === "classic") {
    openClassicMode(false);
    svg.call(zoomBehavior.transform, d3.zoomIdentity);
    return true;
  }
  if (ps && !h.startsWith("tour=")) {
    const obj = OBJECTS.find(o => o.slug === ps);
    // Info-panel articles are known from the page build-pages.mjs wrote;
    // anything else (served by 404.html) falls back to the home view.
    const page = window.__TOE_PAGE__?.slug === ps ? window.__TOE_PAGE__ : null;
    if (obj || page) {
      const name = obj?.name || page.name;
      const nums = h.split(",").slice(0, 3).map(Number);
      const view = nums.length === 3 && nums.every(Number.isFinite) ? nums
        : obj ? [obj.logR, obj.logM, 12] : null;
      if (obj) openSidebar(obj); else openInfoPanel(ps, name);
      setSidebarOpen(true);
      // Opening the panel re-lays-out the map; place the view after that
      // settles or the layout pass undoes the zoom.
      if (view) requestAnimationFrame(() => requestAnimationFrame(() => flyTo(view[0], view[1], view[2])));
      return true;
    }
    history.replaceState(null, "", "/" + location.hash);
  }
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
        // Same as a /slug/ landing: open the panel, then zoom once the
        // layout pass has run (navigateToObject's fly-in gets undone).
        openSidebar(obj);
        setSidebarOpen(true);
        requestAnimationFrame(() => requestAnimationFrame(() => flyTo(obj.logR, obj.logM, 12)));
        return true;
      }
    }
    return false;
  }
  const [cx, cy, k] = nums;
  const slug = parts.length > 3 ? parts.slice(3).join(",") : null;
  flyTo(cx, cy, k);
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
// Still required after retained rendering: the click-target overlays sit
// OUTSIDE the SVG, so a touch starting on one never reaches d3-zoom, and
// enter/exit in the keyed joins can still recycle a touch's start node.
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
onWaterPhaseToggle(() => drawEnergyBands()); // add/remove the shared-axis rails
_booted = true;
initConnections();
loadTileMeta();
initTour({
  zoomToRegion,
  vd,
  animateBigBang: animateBigBangTransition,
  exitBigBang: exitBigBangMode,
  isBigBangActive: () => _bigBangMode,
  // Deep in the map (a dozen decades of mass or less on screen) the intro
  // card is in the way of whatever the link points at.
  skipIntro: () => { const d = vd(); return d.y1 - d.y0 < 12; },
  suggest: () => (_periodicInView && !_periodicOn
    ? { label: "Explore the periodic table", open: () => setPeriodic(true) } : null),
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

// A narration (?narrate=, or the preview build) drives the camera itself:
// the boot zoom-out below would fight it for its first seconds.
const _narrating = NARR_PREVIEW || new URLSearchParams(location.search).has("narrate");
if (!loadHash() && !_narrating) {
  // Intro animation: start zoomed on Human, then zoom out to full view
  const introK = 14;
  flyTo(1.7, 4.9, introK); // start on Human

  // After a beat, smoothly zoom out to the full chart.
  // Reduced motion: land on the full view immediately, no cinematic zoom.
  if (_reduceMotion) {
    svg.call(zoomBehavior.transform, d3.zoomIdentity);
  } else {
    setTimeout(() => {
      svg.transition()
        .duration(3000)
        .ease(d3.easeCubicInOut)
        .call(zoomBehavior.transform, d3.zoomIdentity);
    }, 1000);
  }
}

// Fade out the key hint after 6 seconds
setTimeout(() => {
  const hint = document.getElementById("keyhint");
  if (hint) hint.classList.add("faded");
}, 6000);

// Reveal page now that CSS and JS are loaded (prevents FOUC)
document.body.classList.add("ready");

// Deferred loading, triggered by the user rather than by a timer: a visitor
// who only looks at the overview never downloads the descriptions, the
// off-screen icons, or the catalogue dust.
function onFirstInteraction(fn) {
  const evts = ["pointerdown", "wheel", "keydown", "touchstart"];
  const once = () => { evts.forEach((t) => window.removeEventListener(t, once, true)); fn(); };
  evts.forEach((t) => window.addEventListener(t, once, { capture: true, passive: true }));
}
const _readyAt = performance.now();
onFirstInteraction(() => {
  _userEngaged = true;
  // Descriptions: needed by the info panel, so fetch as soon as the user engages
  loadDescriptions().then(() => { _descsLoaded = true; })
    .catch((e) => console.warn("descriptions failed to load", e));
  // Icon cache warmup — never inside the startup window (≥ 3 s after ready)
  setTimeout(startIconWarmup, Math.max(0, 3000 - (performance.now() - _readyAt)));
});

// Service worker: instant repeat visits + offline map (see public/sw.js).
// Registered late and without clients.claim so the FIRST visit never pays
// for interception or cache writes — the SW only serves later navigations.
// Skipped in dev — it would fight Vite's HMR.
if ("serviceWorker" in navigator && !import.meta.env.DEV && !NARR_PREVIEW && import.meta.env.MODE !== "device-preview") {
  window.addEventListener("load", () => {
    setTimeout(() => {
      navigator.serviceWorker.register("/sw.js").catch(() => { /* non-fatal */ });
    }, 8000);
  });
}

// Catalogue dust (~32k real objects, ~250 KB) is invisible in the overview
// (the curated icons fill it), so it loads on the first zoom/pan — see the
// zoom "end" handler — or right away for a shared link that opens zoomed in.
function ensureDust() {
  if (!_dustEnabled) return;
  loadDust().then(() => redraw()).catch((e) => console.warn("dust layer failed to load", e));
}
// "Zoomed in" by visible span, not by k: the mobile layout's resting view
// is already k≈14.
function viewZoomedIn() {
  const d = vd();
  return d.y1 - d.y0 < 60;
}
{
  const [, , k] = location.hash.slice(1).split(",").map(Number);
  if (k > 1.5) ensureDust();
}

// =============================================================
// Preview-image hook (?og-shot) — driven by scripts/build-pages.mjs
// =============================================================
// Hides every piece of interface, loads the dust, and lets the build place
// any object at a chosen pixel of the plot at a chosen zoom, so each
// object's share image is a real, local view of the chart around it.
if (_ogShot) {
  document.body.classList.add("og-shot");
  const st = document.createElement("style");
  st.textContent = "body.og-shot > *:not(#chart){display:none!important}";
  document.head.appendChild(st);
  setSidebarOpen(false);
  _dustEnabled = true;
  loadDust().then(() => redraw());
  window.__toeOg = {
    ready: () => dustReady(),
    plot: () => ({ x: margin.left, y: margin.top, w: cw, h: ch }),
    fullSpanX: () => Math.abs(xBase.domain()[1] - xBase.domain()[0]),
    objects: () => OBJECTS.map(o => ({ slug: o.slug, name: o.name, logR: o.logR, logM: o.logM })),
    // Put object `slug` at plot pixel (px, py) at zoom k; null slug → overview
    place(slug, k, px, py) {
      svg.interrupt();
      const o = OBJECTS.find(x => x.slug === slug);
      selectedObj = null; // no selection ring: the card marks the subject
      if (!o) { svg.call(zoomBehavior.transform, d3.zoomIdentity); return; }
      const t = d3.zoomIdentity.translate(px - xBase(o.logR) * k, py - yBase(o.logM) * k).scale(k);
      svg.call(zoomBehavior.transform, t);
      redraw();
    },
    iconsPending: () => [...document.querySelectorAll(".icon-fallback-dot")]
      .filter(e => e.getAttribute("display") !== "none").length,
  };
}


// =============================================================
// Narration player (?narrate=<take>) — src/narration.js
// =============================================================
// Plays a recorded narration and drives the camera, highlights, unit
// rulers and captions from a phrase-anchored scene script. The player owns
// the camera: each frame it sets the view directly, wrapped in a synthetic
// zoom gesture (start → zoom… → end on arrival) so the app redraws exactly
// as it does during a tour transition, and refreshes tiles on arrival.
{
  // Read the query now: the hash/URL sync later rewrites the address bar.
  const narrParams = new URLSearchParams(location.search);
  // The preview can't pass a query string, so it names the take in the hash
  // (#short-02-density); with no hash it shows its grid of takes instead.
  const narrTake = narrParams.get("narrate") || (NARR_PREVIEW ? location.hash.slice(1) || null : null);
  // the preview reloads to go back to its grid (or to a take typed in the hash)
  if (NARR_PREVIEW) window.addEventListener("hashchange", () => location.reload());
  // One audio element for every take: a tap starts it once, and after that
  // phones let it go on to the next short by itself (autoplay).
  const narrAudio = new Audio();
  /** Start a take in place, replacing the one playing (no reload). */
  const startTake = (take, opts = {}) => {
    const u = new URL(location.href);
    if (NARR_PREVIEW) u.hash = take; else u.searchParams.set("narrate", take);
    history[opts.push ? "pushState" : "replaceState"](history.state, "", u);
    import("./narration.js").then(m => m.startNarration({ ...narrApi, take, autoplay: opts.autoplay, playAll: opts.all }));
  };
  // The preview's grid: a card (or "Play all") opens its take in place, so
  // the tap that chose it also starts the sound.
  if (NARR_PREVIEW) document.addEventListener("click", (e) => {
    const card = e.target.closest("#narr-grid a[href^='#']");
    if (!card || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    narrAudio.muted = true; narrAudio.play().catch(() => {}); narrAudio.pause();  // unlock it within the tap
    document.getElementById("narr-grid").hidden = true;
    document.getElementById("narr-back").hidden = false;
    startTake(card.hash.slice(1), { push: true, autoplay: true, all: card.classList.contains("ng-all") });
  });
  let narrApi = null;
  if (narrTake || NARR_PREVIEW) {
    let gesture = false, last = null;
    const ppdBase = () => xBase(1) - xBase(0); // plot px per decade at k = 1
    const api = narrApi = {
      d3, take: narrTake, params: narrParams, audio: narrAudio,
      goto: (take) => startTake(take, { autoplay: true }),
      plot: () => ({ x: margin.left, y: margin.top, w: cw, h: ch }),
      px: (r) => xS(r), py: (m) => yS(m),
      objects: OBJECTS,
      categories: CATEGORIES,
      /** { r, m, span } → zoom transform: (r, m) at the plot centre, `span`
       *  decades across the plot width. */
      viewTransform(v) {
        const k = cw / (v.span * ppdBase());
        return d3.zoomIdentity.translate(cw / 2 - xBase(v.r) * k, ch / 2 - yBase(v.m) * k).scale(k);
      },
      /** moving=false ends the gesture: full redraw, fresh tiles. */
      setCamera(v, moving) {
        const t = api.viewTransform(v);
        const same = last && Math.abs(last.k - t.k) < 1e-9 && Math.abs(last.x - t.x) < 1e-6 && Math.abs(last.y - t.y) < 1e-6;
        if (same && (moving || !gesture)) return;
        last = t;
        const node = svg.node(), ev = { transform: t, sourceEvent: null };
        if (!gesture) { gesture = true; zoomBehavior.on("start").call(node, ev); }
        node.__zoom = t;
        zoomBehavior.on("zoom").call(node, ev);
        if (!moving) { gesture = false; zoomBehavior.on("end").call(node, ev); }
      },
      onRedraw(fn) { _narrRedrawHook = fn; },
      tilesPending: () => [..._tileCache.values()].filter(img => !img.complete).length,
      iconsPending: () => [...document.querySelectorAll(".icon-fallback-dot")]
        .filter(e => e.getAttribute("display") !== "none").length,
      dustReady: () => dustReady(),
      dustOfCat: (cat) => dustOfCat(cat),
      dustOfSrc: (ids) => dustOfSrc(ids),
      dustByName: (name) => dustByName(name),
      loadDust: () => loadDust().then(() => redraw()),
      /** The moving dots (evolution, composition, spectrum paths): a size
       *  multiplier, an opacity multiplier, or a fixed radius in px. */
      /** Fade the background painting at zooms deeper than its resolution (videos). */
      setBgFadeDeep(on = true) { _bgFadeDeep = on; drawTiles(); },
      /** Object labels on or off (videos: a quiet closing shot). */
      setLabels(on = true) {
        // off also hides the chart's other text (band and path names) for a clean shot
        document.body.classList.toggle("narr-no-text", !on);
        if (_labelsEnabled !== on) { _labelsEnabled = on; redraw(); }
      },
      setDots({ size = 1, opacity = 1, radius = null } = {}) { _dotSizeMult = size; _dotOpacityMult = opacity; _dotFixedR = radius; },
      /** Only these objects keep their picture (the rest are plain dots over
       *  the dust); null for all of them. */
      /** Catalogue pictures in a video, without their names. */
      setDustFill(on) { if (_dustFill !== !!on) { _dustFill = !!on; redraw(); } },
      setIcons(names, fill = false) { _iconOnly = names ? new Set(names) : null; _iconFill = !!names && fill; redraw(); },
      /** Catalogue dots shown as their pictures, whatever the labels say (names; null for none). */
      setDustPictures(names) {
        const key = names ? names.join("|") : "";
        if (key === (_dustPictures ? [..._dustPictures].join("|") : "")) return;
        _dustPictures = names?.length ? new Set(names) : null; redraw();
      },
      /** Screen box of an object's picture as drawn now (growth and parallax included), or null. */
      iconRect(name) {
        if (_dolly?.name === name) {
          const c = dFocus.select(".obj-icon, .dn-icon").node(), b = c?.getBoundingClientRect();
          if (b?.width) return { x: b.x, y: b.y, w: b.width, h: b.height };
        }
        const o = _lastProjected.find(p => p.name === name);
        const el = o ? lIcons.select(`.obj-icon[data-slug="${o.slug}"]`).node()
          : (() => { const d = dustIcons().find(p => p.name === name); return d ? lIcons.selectAll("g.dust-picture").filter(p => p.i === d.i).select(".dn-icon").node() : null; })();
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return b.width ? { x: b.x, y: b.y, w: b.width, h: b.height } : null;
      },
      /** Grow an object's picture like the hover does, by k (1 restores it); false if it has none drawn. */
      growIcon(name, k = 1) {
        // "hover": the app's own hover growth (to ≥ 64 px or 1.5×)
        const o = _lastProjected.find(p => p.name === name);
        if (o) return setIconHover(o, k === "hover" || k > 1, k === "hover" ? null : k);
        const d = dustIcons().find(p => p.name === name);
        if (!d) return false;
        const f = k === "hover" ? Math.max(64, 3 * d.r) / (2 * d.r) : k;
        setDustIconScale(lIcons, d.i, f); liftShadow(`dust:${d.i}`, f);
        return true;
      },
      /** A dive's camera trick (videos): the object comes towards the screen while
       *  every depth behind it falls back, the further the faster, and blurs and
       *  darkens: { name, k: 0–1, grow: the object's size at k = 1 (×) }; null ends it. */
      setDolly(d) { setDolly(d); },
      /** Always the largest resolution of each picture (videos), then redraw. */
      setIconMaxRes(on = true) { setIconMaxRes(on); redraw(); },
      /** Draw objects with another picture for a while (videos): { slug: icon file }, or null. */
      setIconSwap(map) { setIconSwap(map); redraw(); },
      /** Guide lines in the chart, under the pictures: [{ x1, y1, x2, y2, color, opacity }]
       *  in chart-local px (the narration converts from its own layer). */
      drawGuides(lines = []) {
        lNarrGuides.selectAll("line").data(lines).join("line")
          .attr("x1", d => d.x1).attr("y1", d => d.y1).attr("x2", d => d.x2).attr("y2", d => d.y2)
          .attr("stroke", d => d.color || "#fff").attr("stroke-width", 1.1).attr("stroke-dasharray", "4 4")
          .attr("opacity", d => d.opacity ?? 0.55);
      },
      /** Highlighted lines drawn under the pictures (videos): [{ d, color, width, opacity, dash }], chart-local px. */
      drawUnderLines(lines = []) {
        lNarrGuides.selectAll("path.narr-under").data(lines).join("path").attr("class", "narr-under")
          .attr("d", d => d.d).attr("fill", "none").attr("stroke", d => d.color).attr("stroke-width", d => d.width)
          .attr("opacity", d => d.opacity).attr("stroke-linecap", "round").attr("stroke-dasharray", d => d.dash);
      },
      /** Light blue halos behind named objects (videos): [{ x, y, r, opacity }] in chart-local px. */
      drawHalos(halos = []) {
        // two overlay passes: one lifts the purple only so far, the second brightens it again.
        // Safari draws SVG overlay as a plain fill (a white blot): one fainter plain pass there
        lNarrGuides.selectAll("circle.narr-halo").data(_isWebKit ? halos : halos.flatMap(d => [d, d])).join("circle").attr("class", "narr-halo")
          .attr("cx", d => d.x).attr("cy", d => d.y).attr("r", d => d.r)
          .attr("fill", "url(#narr-halo-fade)").attr("opacity", d => d.opacity * (_isWebKit ? 0.3 : 0.7))
          .style("mix-blend-mode", _isWebKit ? null : "overlay");
      },
      /** Catalogue names on or off in a video (they're off by default there). */
      setDustLabels(on) { if (DUST_LABELS_OFF === on) { DUST_LABELS_OFF = !on; redraw(); } },
      /** The dive's picture: its box on screen (the visible copy), or null; and its opacity
       *  (1 shows it, 0 hides it), so drawings over it can stand alone. */
      dollyRect() {
        const n = dFocus.select("image").node(), b = n?.getBoundingClientRect();
        return b?.width ? { x: b.x, y: b.y, w: b.width, h: b.height } : null;
      },
      setDollyOpacity(v = 1) { dFocus.style("opacity", v < 0.999 ? v.toFixed(3) : null); },
      /** Pictures that show even where a nearer one would hide them (videos): names, or null. */
      setIconForce(names) { _iconForce = names?.length ? new Set(names) : null; redraw(); },
      setIconHide(names) { _iconHide = names?.length ? new Set(names) : null; redraw(); },
      /** Settings → Icons for a video (0–100, 100 = many), without saving it. */
      setIconDensity(d = ICON_DENSITY_DEFAULT) { if (_iconDensity !== d) { _iconDensity = d; _iconsEnabled = d > 0; redraw(); } },
      /** Icon size in percent of the app's default (videos), without saving it. */
      setIconScale(pct = 100) { if (_iconSize !== pct) { _iconSize = pct; redraw(); } },
      /** On-screen radius of an object's picture (0 when it shows as a dot). */
      iconRadius(name) {
        const o = _lastProjected.find(p => p.name === name);
        return o?._showIcon ? o._icoR : dustIcons().find(d => d.name === name)?.r || 0;
      },
      /** While a callout is on screen, fade every other chart label but these
       *  objects' own (names), axis text excepted, by `amount` (0–1, driven by
       *  the narration clock so renders fade alike); null brings them all back. */
      setLabelFocus(names, amount = 1) {
        const on = !!names && amount > 0.001;
        const key = on ? names.join("|") : "";
        if (key !== _labelFocusKey) {
          _labelFocusKey = key;
          _labelFocus = on ? new Set(names) : null;
          lLabels.selectAll("text.obj-label").classed("obj-label-related", o => !!_labelFocus?.has(o.name));
        }
        document.body.classList.toggle("narr-label-focus", on);
        document.body.style.setProperty("--narr-label-fade", on ? amount.toFixed(3) : "0");
      },
      /** Fade every object (pictures, dots, shadows, names, catalogue dust) but these
       *  names by `amount` (0–1, on the narration clock); null brings them all back. */
      setObjectFocus(names, amount = 1) {
        const on = !!names?.length && amount > 0.001;
        const key = on ? names.join("|") : "";
        if (key !== (_objFocus ? [..._objFocus].join("|") : "")) { _objFocus = on ? new Set(names) : null; applyObjFocus(); }
        document.body.classList.toggle("narr-obj-focus", on);
        document.body.style.setProperty("--narr-obj-fade", on ? amount.toFixed(3) : "0");
      },
      /** The periodic table's lines, rings and family names (0–1), without its box. */
      setPeriodic(a = 0) { if (a !== _narrPeriodic) { _narrPeriodic = a; redraw(); } },
      /** The spectrum path's sine wave (0–1), as a hover shows it. */
      setSpectrum(a = 0) { if (a !== _narrSpectrum) { _narrSpectrum = a; redraw(); } },
      /** Show or hide the map's own primordial black hole window and its labels. */
      setPbhWindow(show) { _pbhWindowHidden = !show; redraw(); },
      setStage(mode) { if (mode !== _viewportLock) setViewportLock(mode); },
      isMobile: () => _isMobile,
      prepare() {
        svg.interrupt();
        if (isTourActive()) closeTour();
        selectedObj = null;
        setSidebarOpen(false);
        _userEngaged = true;
        _dustEnabled = true;
        ensureDust();
        document.body.classList.add("ui-hidden", "narrating");
        // the map must fill the window the narration fills (see the resize handler)
        if (!_viewportLock && (W !== window.innerWidth || H !== window.innerHeight)) {
          _lastVw = window.innerWidth; _lastVh = window.innerHeight; relayout();
        }
      },
    };
    if (narrTake) import("./narration.js").then(m => m.startNarration(api));

  }
}
