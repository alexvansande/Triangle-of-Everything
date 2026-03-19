#!/usr/bin/env node
import sharp from "sharp";
import { readdirSync, mkdirSync } from "fs";
import { join, basename, extname } from "path";

const SRC_DIR = "content/icons/src";
const OUT_DIR = "content/icons";
const SIZE = 128; // 128x128 px — crisp at 2x retina for 64px hover size
const SKIP = ["sphere template.png"];

mkdirSync(OUT_DIR, { recursive: true });

const files = readdirSync(SRC_DIR).filter(
  f => /\.(png|jpg|jpeg)$/i.test(f) && !SKIP.includes(f)
);

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
}

console.log(`\nProcessed ${files.length} icons.`);
