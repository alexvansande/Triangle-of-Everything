#!/usr/bin/env node
/**
 * Compose a 1200×630 Open Graph image for the spirograph page.
 *
 * Input:  a square canvas screenshot (the 1024×1024 PNG produced by the
 *         spirograph's own PNG-export at the curated default-landing state)
 * Output: public/og/spirograph.png — 1200×630, dark background, square art
 *         centered and sized to fit the height with breathing room.
 *
 * Usage:
 *   node scripts/build-og-spirograph.mjs <input.png> [output.png]
 *
 * The input PNG is captured manually via the spirograph's PNG button (or
 * via the Claude Preview eval — see commit history). Re-run this script
 * whenever the curated default state changes.
 */
import sharp from "sharp";
import { mkdirSync } from "fs";
import { dirname } from "path";

const SRC = process.argv[2];
const OUT = process.argv[3] || "public/og/spirograph.png";
const W = 1200;
const H = 630;
const BG = { r: 26, g: 26, b: 26 }; // matches body background

if (!SRC) {
  console.error("Usage: build-og-spirograph.mjs <input.png> [output.png]");
  process.exit(1);
}

mkdirSync(dirname(OUT), { recursive: true });

// Resize the square art to fit comfortably inside the 1200×630 frame.
// Leave ~30px of vertical padding top/bottom -> art height ≈ 570px.
const ART = 570;

const art = await sharp(SRC).resize(ART, ART, { fit: "contain" }).png().toBuffer();

await sharp({
  create: { width: W, height: H, channels: 3, background: BG },
})
  .composite([{ input: art, gravity: "center" }])
  .png({ compressionLevel: 9 })
  .toFile(OUT);

console.log(`✓ Wrote ${OUT} (${W}×${H})`);
