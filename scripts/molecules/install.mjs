// One-shot installer: takes the AI-generated molecule PNGs in
// scripts/molecules/generated/ and writes them as the large sidebar WebPs
// expected by the chart (content/images/<slug>.webp, 624×390 16:10 with
// `fit: contain` so the whole molecule stays visible). Also copies each
// PNG into content/icons/src/<slug>.png so the next `npm run process-icons`
// produces a matching chart-marker icon.
//
// Mirrors scripts/atoms/install.mjs.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const SRC = path.join(HERE, 'generated');
const IMG_DIR = path.join(REPO, 'content/images');
const ICON_SRC_DIR = path.join(REPO, 'content/icons/src');

// (PNG name in generated/) → (slug used by the app, derived from objects.json names via nameToSlug)
const MAPPING = {
  'glucose.png':   'glucose',
  'adenine.png':   'adenine-a',
  'guanine.png':   'guanine-g',
  'cytosine.png':  'cytosine-c',
  'thymine.png':   'thymine-t',
  'ATP.png':       'atp',
  'fullerene.png': 'fullerene-c60',
  'dna.png':       'dna',
};

const W = 624, H = 390;

fs.mkdirSync(IMG_DIR, { recursive: true });
fs.mkdirSync(ICON_SRC_DIR, { recursive: true });

for (const [src, slug] of Object.entries(MAPPING)) {
  const inPath = path.join(SRC, src);
  if (!fs.existsSync(inPath)) {
    console.warn(`! skip ${src}: not found at ${inPath}`);
    continue;
  }

  // Sidebar image: 624×390 with the molecule centered on black (fit: contain
  // so the whole composition stays visible — the sidebar's CSS uses
  // object-fit: cover which would otherwise crop the bonds at the edges).
  const outImg = path.join(IMG_DIR, `${slug}.webp`);
  await sharp(inPath)
    .resize(W, H, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .webp({ quality: 88 })
    .toFile(outImg);
  console.log(`wrote ${outImg}`);

  // Stage the PNG as the icon source. process-icons.mjs resizes to 128×128
  // square WebP for the chart marker, also fit: contain on transparent bg.
  const iconSrc = path.join(ICON_SRC_DIR, `${slug}.png`);
  fs.copyFileSync(inPath, iconSrc);
  console.log(`staged ${iconSrc}`);
}

console.log('\nNext: run `npm run process-icons` to refresh chart markers.');
