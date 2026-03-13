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
const PX_PER_UNIT_Y = 46.20;
const LOG_R_OFFSET = -0.3;
const LOG_M_OFFSET = -0.4;

const SRC = process.argv[2] || "background/large.png";
const OUT = process.argv[3] || "public/tiles";

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

        await sharp(buf, { raw: { width: w, height: h, channels } })
          .extract({ left, top, width: tileW, height: tileH })
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
