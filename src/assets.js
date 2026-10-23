// src/assets.js
// Content manifests: object descriptions, sidebar photos, map icons, and the
// spirograph embeds. Eager `?url` globs inline URL strings only — bytes are
// fetched on demand (map-tile-style pop-in) with an idle-time warmup.

// Object descriptions live in their own lazily loaded chunk (descriptions.js).
// DESC_BY_SLUG fills in once loadDescriptions() resolves.
export const DESC_BY_SLUG = {};
let _descLoading = null;
export function loadDescriptions() {
  return _descLoading ??= import("./descriptions.js")
    .then((m) => Object.assign(DESC_BY_SLUG, m.DESC_BY_SLUG));
}

// Object images: eager `?url` glob inlines just the URL strings (no per-file
// JS wrapper chunk); the webp itself is fetched on demand when the sidebar
// sets <img src>, same laziness as before with 114 fewer chunks.
export const imgUrls = import.meta.glob("../content/images/*.webp", { query: "?url", import: "default", eager: true });
export const IMG_BY_SLUG = {};
for (const [path, url] of Object.entries(imgUrls)) {
  const slug = path.replace("../content/images/", "").replace(".webp", "");
  IMG_BY_SLUG[slug] = url;
}
import imageManifest from "../content/images/manifest.json";
// Spirograph state hashes for particles that can be opened in the 5D spirograph
import hyperspirographStates from "../content/icons/hyperspirograph-states.json";
import roundShadows from "../content/icons/shadows/round.json";
import shadowOverrides from "../content/icons/shadows/overrides.json";
import iconResolutions from "../content/icons/resolutions/manifest.json";
import iconCoverage from "../content/icons/coverage.json";
import { iconPixelRequirement, chooseIconResolution } from "./icon-resolution.js";

// Atoms whose sidebar image is a sphere-packed spirograph composite (built
// from the hyperspirograph itself). These get a "Explore multidimensional
// strings" link pointing at the spirograph with no particular preset.
export const STRINGS_ATOM_SLUGS = new Set([
  "hydrogen", "helium", "carbon", "oxygen", "iron", "gold", "uranium",
  "water-h2o",
]);

// Load object icons (small WebP, preloaded eagerly)
export const ICON_SLUG_MAP = {
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
  "x-and-y-bosons": "x-y-bosons",
};
// Icons that map to multiple objects (same icon, different slugs)
export const ICON_MULTI_MAP = {
  "void": ["bo-tes-void", "eridanus-supervoid", "kbc-void"],
  "neutrino-tau": ["neutrino"],  // Neutrino (τ) — shares slug with μ
};
// Eager `?url` glob inlines the 130 icon URLs into the bundle as plain
// strings — no per-icon JS wrapper chunk, no upfront image fetches. The
// browser fetches each webp on demand the first time its <image> renders
// (map-tile-style pop-in); a gentle warmup prefetches the rest after boot.
export const iconUrls = import.meta.glob("../content/icons/*.webp", { query: "?url", import: "default", eager: true });
export const ICON_BY_SLUG = {};
// How much of its square each picture covers (scripts/icon-coverage.mjs), by slug
export const ICON_COVERAGE = {};
for (const [path, url] of Object.entries(iconUrls)) {
  const iconFile = path.replace("../content/icons/", "").replace(".webp", "");
  if (ICON_MULTI_MAP[iconFile]) {
    ICON_MULTI_MAP[iconFile].forEach(s => { ICON_BY_SLUG[s] = url; });
  } else {
    const slug = ICON_SLUG_MAP[iconFile] || iconFile;
    ICON_BY_SLUG[slug] = url;
  }
}
for (const [file, c] of Object.entries(iconCoverage)) {
  for (const slug of ICON_MULTI_MAP[file] || [ICON_SLUG_MAP[file] || file]) ICON_COVERAGE[slug] = c;
}

// URLs are bundled eagerly, but browsers fetch only the selected tier. Budget
// for hover here so the 150ms animation never has to wait for a larger image.
const resolutionUrls = import.meta.glob("../content/icons/resolutions/*/*.webp", { query: "?url", import: "default", eager: true });
export const ICON_RESOLUTIONS_BY_SLUG = {};
for (const [file, entry] of Object.entries(iconResolutions)) {
  const slugs = ICON_MULTI_MAP[file] || [ICON_SLUG_MAP[file] || file];
  for (const slug of slugs) {
    const base = ICON_BY_SLUG[slug];
    if (!base) continue;
    ICON_RESOLUTIONS_BY_SLUG[slug] = [
      { width: entry.baseWidth, url: base },
      ...entry.variants.map(v => ({ width: v.width, url: resolutionUrls[`../content/icons/resolutions/${v.path}`] })),
    ].filter(v => v.url).sort((a,b) => a.width-b.width);
  }
}
export function iconUrlForSize(slug, cssSize, dpr = globalThis.devicePixelRatio || 1) {
  return chooseIconResolution(ICON_RESOLUTIONS_BY_SLUG[slug], iconPixelRequirement(cssSize, dpr))?.url || ICON_BY_SLUG[slug];
}

// Silhouette cast shadows for non-round icons (scripts/generate-shadows.mjs):
// slug → url. Objects without one get the generic soft ellipses.
// Round icons (round.json) all share _sphere.webp.
const shadowUrls = import.meta.glob("../content/icons/shadows/*.webp", { query: "?url", import: "default", eager: true });
export const SHADOW_BY_SLUG = {};
export const SHADOW_SETTINGS_BY_SLUG = Object.fromEntries(
  Object.entries(shadowOverrides).map(([file, settings]) => [ICON_SLUG_MAP[file] || file, settings]),
);
let sphereShadow = null;
for (const [path, url] of Object.entries(shadowUrls)) {
  const file = path.replace(/^.*\//, "").replace(".webp", "");
  if (file === "_sphere") sphereShadow = url;
  else SHADOW_BY_SLUG[ICON_SLUG_MAP[file] || file] = url;
}
for (const file of roundShadows) {
  const slug = ICON_SLUG_MAP[file] || file;
  SHADOW_BY_SLUG[slug] = sphereShadow;
  SHADOW_SETTINGS_BY_SLUG[slug] = { mode: "shared" };
}
// Icon webps whose bytes have actually arrived (SVG <image> load events) —
// gates the fallback dot rendered beneath each icon.
export const _loadedIconUrls = new Set();
// Warm the browser cache for off-screen icons once the app has settled —
// idle-scheduled batches so it never competes with user interaction, skipped
// on data-saver connections, paused while the tab is hidden. Called from
// main.js AFTER the app signals ready (+3s), so it can never race the
// startup window on a slow machine.
export function startIconWarmup() {
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
}

export function parseFrontmatter(raw) {
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

export { imageManifest, hyperspirographStates };
