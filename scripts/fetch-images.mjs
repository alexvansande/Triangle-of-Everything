#!/usr/bin/env node
/**
 * Fetches images from Wikimedia Commons for objects with a `wiki` field.
 * Downloads, resizes to 624x390 WebP, and updates manifest.json.
 *
 * Usage:
 *   npm run fetch-images                        # fetch all missing
 *   npm run fetch-images -- --slug earth,sun     # specific slugs
 *   npm run fetch-images -- --force              # re-fetch existing
 */
import sharp from "sharp";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OBJECTS_PATH = join(ROOT, "src/objects.json");
const IMAGES_DIR = join(ROOT, "content/images");
const MANIFEST_PATH = join(IMAGES_DIR, "manifest.json");

const IMG_W = 624;   // 2x retina for 312px sidebar
const IMG_H = 390;   // 16:10 aspect
const WEBP_QUALITY = 80;
const RATE_LIMIT_MS = 2000;  // ms between API calls (Wikimedia rate-limits aggressively)

// Allowed licenses (prefix match)
const ALLOWED_LICENSES = [
  "public domain",
  "pd",
  "cc0",
  "cc-by-sa",
  "cc-by ",
  "cc-by-",
  "cc by-sa",
  "cc by ",
  "cc by-",
  "gfdl",  // GNU Free Doc License (often dual-licensed with CC BY-SA)
  "fal",   // Free Art License
  "attribution",  // Generic attribution (NASA, etc.)
];

// Parse CLI args
const args = process.argv.slice(2);
const force = args.includes("--force");
const slugIdx = args.indexOf("--slug");
const slugFilter = slugIdx !== -1 && args[slugIdx + 1]
  ? args[slugIdx + 1].split(",").map(s => s.trim())
  : null;

function nameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/γ/g, "gamma").replace(/τ/g, "tau").replace(/μ/g, "mu")
    .replace(/['']/g, "").replace(/[*()]/g, "")
    .replace(/₀/g, "0").replace(/₁/g, "1").replace(/₂/g, "2").replace(/₃/g, "3")
    .replace(/₄/g, "4").replace(/₅/g, "5").replace(/₆/g, "6").replace(/₇/g, "7")
    .replace(/₈/g, "8").replace(/₉/g, "9")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

const HEADERS = { "User-Agent": "TriangleOfEverything/1.0 (image-fetch-script; open-source)" };

async function fetchWithRetry(url, opts = {}) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { ...opts, headers: { ...HEADERS, ...opts.headers } });
    if (res.status === 429) {
      const wait = (attempt + 1) * 5000;
      process.stdout.write(`[429, wait ${wait/1000}s] `);
      await sleep(wait);
      continue;
    }
    return res;
  }
  throw new Error(`HTTP 429 after 5 retries for ${url}`);
}

async function fetchJson(url) {
  const res = await fetchWithRetry(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

/**
 * Query Wikipedia API for the main image of an article.
 * Returns { imageFile, thumbUrl } or null.
 */
async function getWikipediaImage(wikiTitle) {
  // Decode first in case the wiki field is already percent-encoded, then re-encode properly
  const decoded = decodeURIComponent(wikiTitle);
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(decoded)}`;
  try {
    const data = await fetchJson(url);
    if (data.originalimage && data.originalimage.source) {
      // Extract the real File: name from the Wikimedia URL
      // URL pattern: /commons/thumb/a/ab/RealFilename.jpg/1920px-RealFilename.jpg
      // or /commons/a/ab/RealFilename.jpg (non-thumb)
      const imgUrl = data.originalimage.source;
      let filename = null;
      const thumbMatch = imgUrl.match(/\/commons\/thumb\/([a-f0-9]\/[a-f0-9]{2})\/([^/]+)\//);
      if (thumbMatch) {
        filename = decodeURIComponent(thumbMatch[2]);
      } else {
        const directMatch = imgUrl.match(/\/commons\/([a-f0-9]\/[a-f0-9]{2})\/([^/]+)$/);
        if (directMatch) filename = decodeURIComponent(directMatch[2]);
      }

      // Build a 1280px-wide thumbnail URL instead of downloading the full original
      // This avoids downloading huge TIFFs/PNGs and reduces Wikimedia load
      let downloadUrl = imgUrl;
      if (filename) {
        const hash = thumbMatch ? thumbMatch[1] : (imgUrl.match(/\/commons\/([a-f0-9]\/[a-f0-9]{2})\//)?.[1]);
        if (hash) {
          const ext = filename.match(/\.([^.]+)$/)?.[1]?.toLowerCase();
          const thumbExt = (ext === "tiff" || ext === "tif" || ext === "svg") ? ".png" : "";
          downloadUrl = `https://upload.wikimedia.org/wikipedia/commons/thumb/${hash}/${encodeURIComponent(filename)}/1280px-${encodeURIComponent(filename)}${thumbExt}`;
        }
      }

      return { imageFile: filename, downloadUrl, thumbUrl: data.thumbnail?.source };
    }
    return null;
  } catch (e) {
    console.warn(`  Wikipedia API error for "${wikiTitle}": ${e.message}`);
    return null;
  }
}

/**
 * Query Wikimedia Commons API for license/credit info of a file.
 */
async function getCommonsMetadata(filename) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=extmetadata|url&format=json&origin=*`;
  try {
    const data = await fetchJson(url);
    const pages = data.query?.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0];
    const ii = page?.imageinfo?.[0];
    if (!ii) return null;

    const ext = ii.extmetadata || {};
    let artist = ext.Artist?.value?.replace(/<[^>]+>/g, "").replace(/\n/g, " ").trim() || "Unknown";
    // Clean up common Wikimedia credit patterns
    artist = artist.replace(/\s+/g, " ").replace(/Unknown author/gi, "").trim() || "Unknown";
    const licenseShort = ext.LicenseShortName?.value || "";
    const licenseUrl = ext.LicenseUrl?.value || "";
    const descUrl = ii.descriptionurl || "";

    return { artist, licenseShort, licenseUrl, descUrl };
  } catch (e) {
    console.warn(`  Commons API error for "${filename}": ${e.message}`);
    return null;
  }
}

function isLicenseAllowed(licenseShort) {
  if (!licenseShort) return false;
  const lower = licenseShort.toLowerCase();
  return ALLOWED_LICENSES.some(prefix => lower.startsWith(prefix) || lower.includes(prefix));
}

/**
 * Download an image URL and resize to WebP.
 */
async function downloadAndProcess(imageUrl, outputPath) {
  const res = await fetchWithRetry(imageUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading ${imageUrl}`);
  const buffer = Buffer.from(await res.arrayBuffer());

  await sharp(buffer)
    .resize(IMG_W, IMG_H, { fit: "cover", position: "centre" })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);
}

async function main() {
  // Ensure output dir exists
  mkdirSync(IMAGES_DIR, { recursive: true });

  // Load objects and manifest
  const objects = JSON.parse(readFileSync(OBJECTS_PATH, "utf-8"));
  let manifest = {};
  if (existsSync(MANIFEST_PATH)) {
    try { manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf-8")); } catch { manifest = {}; }
  }

  // Filter to objects with wiki fields
  const candidates = objects
    .filter(o => o.wiki && !o.isLabel)
    .map(o => ({ name: o.name, wiki: o.wiki, slug: nameToSlug(o.name) }));

  // Apply slug filter if provided
  const toProcess = slugFilter
    ? candidates.filter(c => slugFilter.includes(c.slug))
    : candidates;

  console.log(`Found ${candidates.length} objects with wiki fields`);
  console.log(`Processing ${toProcess.length} objects${slugFilter ? ` (filtered: ${slugFilter.join(", ")})` : ""}`);
  if (!force) console.log(`Skipping already-fetched entries (use --force to re-fetch)`);
  console.log();

  let fetched = 0, skipped = 0, failed = 0;

  for (const obj of toProcess) {
    const { name, wiki, slug } = obj;
    const outFile = `${slug}.webp`;
    const outPath = join(IMAGES_DIR, outFile);

    // Skip if already in manifest (unless --force)
    if (!force && manifest[slug]) {
      skipped++;
      continue;
    }

    process.stdout.write(`${name} (${slug})... `);

    try {
      // 1. Get image from Wikipedia
      await sleep(RATE_LIMIT_MS);
      const imgInfo = await getWikipediaImage(wiki);
      if (!imgInfo) {
        console.log("NO IMAGE");
        failed++;
        continue;
      }

      // 2. Get license info from Commons
      await sleep(RATE_LIMIT_MS);
      const meta = imgInfo.imageFile ? await getCommonsMetadata(imgInfo.imageFile) : null;

      // 3. Check license
      if (meta && !isLicenseAllowed(meta.licenseShort)) {
        console.log(`BAD LICENSE: ${meta.licenseShort}`);
        failed++;
        continue;
      }

      // 4. Download and process
      await sleep(RATE_LIMIT_MS);
      await downloadAndProcess(imgInfo.downloadUrl, outPath);

      // 5. Update manifest
      manifest[slug] = {
        file: outFile,
        credit: meta?.artist || "Unknown",
        license: meta?.licenseShort || "Unknown",
        source: meta?.descUrl || imgInfo.downloadUrl,
      };

      console.log(`OK (${meta?.licenseShort || "unknown license"})`);
      fetched++;

      // Save manifest after each successful fetch (crash-safe)
      writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      failed++;
    }
  }

  // Final save
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nDone! Fetched: ${fetched}, Skipped: ${skipped}, Failed: ${failed}`);
  console.log(`Manifest: ${Object.keys(manifest).length} entries`);
}

main().catch(err => { console.error(err); process.exit(1); });
