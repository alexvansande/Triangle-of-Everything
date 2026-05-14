// One-shot installer: takes the canonical atom PNGs in this directory and
// writes them as the large WebP images expected by the chart's sidebar
// (content/images/). Also copies them into content/icons/src/ so the next
// `npm run process-icons` produces matching chart-marker icons, and deletes
// any stale icon WebPs.
//
// Sidebar images are 624×390 16:10 with the molecule centered on black
// (`fit: contain`) so the whole nucleus + cloud composition stays visible
// instead of being cropped by the panel's `object-fit: cover`.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// scripts/atoms/ → repo root is two levels up.
const REPO = path.resolve(HERE, '../..');
const SRC = HERE;
const IMG_DIR = path.join(REPO, 'content/images');
const ICON_SRC_DIR = path.join(REPO, 'content/icons/src');

// (PNG name) → (slug used by the app to look up the image)
const MAPPING = {
  'hydrogen.png': 'hydrogen',
  'helium.png':   'helium',
  'carbon.png':   'carbon',
  'oxygen.png':   'oxygen',
  'iron.png':     'iron',
  'gold.png':     'gold',
  'uranium.png':  'uranium',
  'h2o.png':      'water-h2o',
};

const W = 624, H = 390;

for (const [src, slug] of Object.entries(MAPPING)) {
  const inPath = path.join(SRC, src);
  const outPath = path.join(IMG_DIR, `${slug}.webp`);
  await sharp(inPath)
    .resize(W, H, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .webp({ quality: 88 })
    .toFile(outPath);
  console.log(`wrote ${outPath}`);

  // Stage the same PNG as the icon source so process-icons.mjs picks it up.
  // Slug becomes the source filename (process-icons re-slugifies, but with
  // already-slug-safe names this is a no-op).
  const iconSrc = path.join(ICON_SRC_DIR, `${slug}.png`);
  fs.copyFileSync(inPath, iconSrc);
  console.log(`staged ${iconSrc}`);
}

// Delete a stale-named water-h2o-v1.webp if present so we don't have two
// versions hanging around in the icons folder.
const stale = path.join(REPO, 'content/icons/water-h2o-v1.webp');
if (fs.existsSync(stale)) {
  fs.unlinkSync(stale);
  console.log(`removed stale ${stale}`);
}

console.log('\nNext: run `npm run process-icons` to refresh chart markers.');
