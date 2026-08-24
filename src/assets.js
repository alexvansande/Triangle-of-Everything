// src/assets.js
// Content manifests: object descriptions, sidebar photos, map icons, and the
// spirograph embeds. Eager `?url` globs inline URL strings only — bytes are
// fetched on demand (map-tile-style pop-in) with an idle-time warmup.

// Load descriptions from markdown files (eager, at build time)
export const descFiles = import.meta.glob("../content/descriptions/*.md", { query: "?raw", import: "default", eager: true });
export const DESC_BY_SLUG = {};

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
import hiperspirographStates from "../content/icons/hiperspirograph-states.json";

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
for (const [path, url] of Object.entries(iconUrls)) {
  const iconFile = path.replace("../content/icons/", "").replace(".webp", "");
  if (ICON_MULTI_MAP[iconFile]) {
    ICON_MULTI_MAP[iconFile].forEach(s => { ICON_BY_SLUG[s] = url; });
  } else {
    const slug = ICON_SLUG_MAP[iconFile] || iconFile;
    ICON_BY_SLUG[slug] = url;
  }
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

for (const [path, content] of Object.entries(descFiles)) {
  const slug = path.replace("../content/descriptions/", "").replace(".md", "");
  DESC_BY_SLUG[slug] = content.trim();
}

export { imageManifest, hiperspirographStates };
