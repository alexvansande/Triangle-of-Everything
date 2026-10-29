#!/usr/bin/env node
// Installs a generated picture (scripts/genai/generated/<slug>.png, made from the
// prompt in prompts/<slug>.md) as the chart's: the sidebar picture
// content/images/<slug>.webp (624×390 on black, the whole molecule in view) and
// the icon's master content/icons/src/<slug>.png; then run `npm run process-icons`
// for the chart icon and its resolution tiers.
//
//   node scripts/genai/install.mjs dna hemoglobin    # or no slugs: every generated picture
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, "../..");
const GEN = path.join(HERE, "generated");
const slugs = process.argv.slice(2).length ? process.argv.slice(2)
  : fs.existsSync(GEN) ? fs.readdirSync(GEN).filter(f => f.endsWith(".png")).map(f => f.slice(0, -4)) : [];
if (!slugs.length) console.log("Nothing in scripts/genai/generated/ yet (see scripts/genai/README.md).");
for (const slug of slugs) {
  const src = path.join(GEN, `${slug}.png`);
  if (!fs.existsSync(src)) { console.warn(`! ${slug}: no ${path.relative(REPO, src)}`); continue; }
  await sharp(src).resize(624, 390, { fit: "contain", background: "#000" }).webp({ quality: 88 })
    .toFile(path.join(REPO, `content/images/${slug}.webp`));
  fs.copyFileSync(src, path.join(REPO, `content/icons/src/${slug}.png`));
  console.log(`${slug}: content/images/${slug}.webp, content/icons/src/${slug}.png`);
}
if (slugs.length) console.log("Next: npm run process-icons");
