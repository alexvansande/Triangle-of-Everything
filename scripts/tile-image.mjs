#!/usr/bin/env node
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const TILE_SIZE = 512;
const WEBP_QUALITY = 80;

// Calibration: three known triangle vertices in pixel and data coords.
// Derived from user-provided measurements on the 8192x10752 source image.
// Anisotropic scaling: X and Y have slightly different px/unit (causes drift when zoomed out if ignored).
const ORIGIN_PX = 3600.0;
const ORIGIN_PY = 5756.3;
const PX_PER_UNIT_X = 46.10;
const PX_PER_UNIT_Y = 43.5;  // Lower = image covers more logM range; fixes vertical drift when zoomed out
const LOG_R_OFFSET = -0.3;
const LOG_M_OFFSET = 0.1;  // Planck at -4.68 with new scale; +0.1 → -4.58 ≈ -4.6

const SRC = process.argv[2] || "public/imgs/triangle of everything background.png";
const OUT = process.argv[3] || "public/tiles";
const NOISE_OPACITY = 0.10; // 10% noise overlay

/** Generate a random noise buffer (grayscale → RGBA with screen-like blend) */
function generateNoise(w, h) {
  const buf = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const v = Math.floor(Math.random() * 256);
    const off = i * 4;
    buf[off]     = v; // R
    buf[off + 1] = v; // G
    buf[off + 2] = v; // B
    buf[off + 3] = Math.floor(NOISE_OPACITY * 255); // A (10% opacity)
  }
  return buf;
}

async function main() {
  const meta = await sharp(SRC).metadata();
  const imgW = meta.width, imgH = meta.height;
  console.log(`Source: ${imgW}x${imgH}`);

  const imgLogRmin = (0 - ORIGIN_PX) / PX_PER_UNIT_X;
  const imgLogRmax = (imgW - ORIGIN_PX) / PX_PER_UNIT_X;
  const imgLogMmax = (ORIGIN_PY - 0) / PX_PER_UNIT_Y;
  const imgLogMmin = (ORIGIN_PY - imgH) / PX_PER_UNIT_Y;

  console.log(`Data extent: logR [${imgLogRmin.toFixed(1)}, ${imgLogRmax.toFixed(1)}]`);
  console.log(`             logM [${imgLogMmin.toFixed(1)}, ${imgLogMmax.toFixed(1)}]`);

  const maxLevel = Math.ceil(Math.log2(Math.max(imgW, imgH) / TILE_SIZE));
  console.log(`Levels: 0..${maxLevel}`);
  console.log(`Noise: ${(NOISE_OPACITY * 100).toFixed(0)}% opacity screen overlay`);

  const levels = [];

  for (let z = 0; z <= maxLevel; z++) {
    const scale = Math.pow(2, z - maxLevel);
    const w = Math.round(imgW * scale);
    const h = Math.round(imgH * scale);
    const cols = Math.ceil(w / TILE_SIZE);
    const rows = Math.ceil(h / TILE_SIZE);
    levels.push({ z, w, h, cols, rows, scale });

    const dir = join(OUT, `z${z}`);
    mkdirSync(dir, { recursive: true });

    console.log(`  z${z}: ${w}x${h} → ${cols}x${rows} tiles (scale ${scale.toFixed(4)})`);

    const scaled = sharp(SRC).resize(w, h, { fit: "fill" });
    const buf = await scaled.raw().toBuffer();
    const channels = meta.channels || 4;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const left = c * TILE_SIZE;
        const top = r * TILE_SIZE;
        const tileW = Math.min(TILE_SIZE, w - left);
        const tileH = Math.min(TILE_SIZE, h - top);

        // Extract tile
        const tileBuf = await sharp(buf, { raw: { width: w, height: h, channels } })
          .extract({ left, top, width: tileW, height: tileH })
          .ensureAlpha()
          .raw()
          .toBuffer();

        // Generate noise and composite over tile (screen blend approximation via alpha)
        const noiseBuf = generateNoise(tileW, tileH);

        await sharp(tileBuf, { raw: { width: tileW, height: tileH, channels: 4 } })
          .composite([{
            input: noiseBuf,
            raw: { width: tileW, height: tileH, channels: 4 },
            blend: "screen",
          }])
          .webp({ quality: WEBP_QUALITY })
          .toFile(join(dir, `tile_${c}_${r}.webp`));
      }
    }
  }

  const metaJson = {
    tileSize: TILE_SIZE,
    logROffset: LOG_R_OFFSET,
    logMOffset: LOG_M_OFFSET,
    originPx: ORIGIN_PX,
    originPy: ORIGIN_PY,
    pxPerUnitX: PX_PER_UNIT_X,
    pxPerUnitY: PX_PER_UNIT_Y,
    imgW, imgH,
    logRmin: imgLogRmin,
    logRmax: imgLogRmax,
    logMmin: imgLogMmin,
    logMmax: imgLogMmax,
    levels: levels.map(l => ({
      z: l.z, w: l.w, h: l.h, cols: l.cols, rows: l.rows, scale: l.scale,
    })),
  };

  writeFileSync(join(OUT, "meta.json"), JSON.stringify(metaJson, null, 2));
  console.log(`\nWrote ${join(OUT, "meta.json")}`);
  console.log("Done!");
}

main().catch(err => { console.error(err); process.exit(1); });
