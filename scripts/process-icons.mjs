#!/usr/bin/env node
import sharp from "sharp";
import { readdirSync, mkdirSync } from "fs";
import { join, basename, extname } from "path";

// Source PNGs live in content/icons/src/; their webp counterparts are
// regenerated into content/icons/ on every run. Particle icons (quarks,
// leptons, bosons, photons, meson) have NO source PNG — they're exported
// straight to content/icons/*.webp from the hyperspirograph pipeline. Don't
// re-add their old DALL-E PNGs to src/ unless they're authoritative for
// that slug; otherwise this script will silently overwrite the live webp.
const SRC_DIR = "content/icons/src";
const OUT_DIR = "content/icons";
const SIZE = 128; // 128x128 px — crisp at 2x retina for 64px hover size
const SKIP = ["sphere template.png"];

mkdirSync(OUT_DIR, { recursive: true });

const files = readdirSync(SRC_DIR).filter(
  f => /\.(png|jpg|jpeg)$/i.test(f) && !SKIP.includes(f)
);

let processed = 0;
for (const file of files) {
  const slug = basename(file, extname(file))
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const outFile = join(OUT_DIR, `${slug}.webp`);

  await sharp(join(SRC_DIR, file))
    .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(outFile);

  console.log(`  ${file} → ${outFile}`);
  processed++;
}

console.log(`\nProcessed ${processed} icons.`);
