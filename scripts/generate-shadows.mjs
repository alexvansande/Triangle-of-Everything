#!/usr/bin/env node
// Cast shadows for the non-round icons, made from each icon's own silhouette
// the way you'd do it by hand in an image editor:
//   silhouette → rotate −45° (down-right becomes +x) → stretch along x →
//   blur that grows with distance + fade to transparent → rotate back.
// Output: content/icons/shadows/<slug>.webp, a square SHADOW_SPAN times the
// icon's size with the object's centre at its centre. The map draws it under
// everything, offset down-right (drawIconShadows in src/main.js).
//
//   node scripts/generate-shadows.mjs human hippo elephant …
import sharp from "sharp";
import { mkdirSync } from "fs";

const SRC = "content/icons/src", OUT = "content/icons/shadows";
const ICON = 256;            // working size of the icon itself (px)
const SPAN = 3;              // shadow canvas = SPAN × icon size (keep in sync with SHADOW_SPAN in main.js)
const STRETCH = 1.6;         // along the light direction
const BLUR_NEAR = 4, BLUR_FAR = 26;   // px at ICON = 256
const FADE = 0.75;           // how much of the shadow's opacity is gone at the far end
const OUT_PX = 256;          // shipped size of the whole canvas

mkdirSync(OUT, { recursive: true });

// one-channel buffers; sharp turns them into colour when padding or rotating
// over a background, so every step ends with extractChannel(0)
const raw1 = (buf, w, h) => ({ raw: { width: w, height: h, channels: 1 } });

async function shadow(slug) {
  // 1. silhouette (alpha → white on black), centred on a SPAN× canvas
  const C = ICON * SPAN, pad = (C - ICON) / 2;
  const alpha = await sharp(`${SRC}/${slug}.png`).resize(ICON, ICON, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha().extractChannel(3).raw().toBuffer();
  const sil = await sharp(alpha, raw1(alpha, ICON, ICON))
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: "#000" }).extractChannel(0).raw().toBuffer();

  // 2. rotate −45° (down-right → +x); sharp grows the canvas, centre stays put
  const rot = await sharp(sil, raw1(sil, C, C)).rotate(-45, { background: "#000" }).extractChannel(0).raw().toBuffer({ resolveWithObject: true });
  const R = rot.info.width;

  // 3. stretch along x about the centre
  const W = Math.round(R * STRETCH);
  const str = await sharp(rot.data, raw1(rot.data, R, R)).resize(W, R, { fit: "fill" }).extractChannel(0).raw().toBuffer();

  // 4. blur that grows along x, and a fade: mix a near and a far blur by
  //    position across the stretched silhouette
  const [near, far] = await Promise.all([BLUR_NEAR, BLUR_FAR].map(s =>
    sharp(str, raw1(str, W, R)).blur(s).extractChannel(0).raw().toBuffer()));
  let x0 = W, x1 = 0;
  for (let y = 0; y < R; y++) for (let x = 0; x < W; x++) if (str[y * W + x] > 32) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
  const span = Math.max(1, x1 - x0);
  const out = Buffer.alloc(W * R);
  for (let y = 0; y < R; y++) for (let x = 0; x < W; x++) {
    const t = Math.min(1, Math.max(0, (x - x0) / span));
    const v = near[y * W + x] * (1 - t) + far[y * W + x] * t;
    out[y * W + x] = Math.round(v * (1 - FADE * t));
  }

  // 5. rotate back (the stretch now runs down-right) and crop the SPAN×
  //    square around the centre
  const back = await sharp(out, raw1(out, W, R)).rotate(45, { background: "#000" }).extractChannel(0).raw().toBuffer({ resolveWithObject: true });
  const BW = back.info.width, BH = back.info.height;
  const crop = await sharp(back.data, raw1(back.data, BW, BH))
    .extract({ left: Math.round((BW - C) / 2), top: Math.round((BH - C) / 2), width: C, height: C }).extractChannel(0).raw().toBuffer();

  // alpha = shadow; colour black
  const rgba = Buffer.alloc(C * C * 4);
  for (let i = 0; i < C * C; i++) rgba[i * 4 + 3] = crop[i];
  await sharp(rgba, { raw: { width: C, height: C, channels: 4 } })
    .resize(OUT_PX, OUT_PX).webp({ quality: 80, alphaQuality: 80 }).toFile(`${OUT}/${slug}.webp`);
  console.log("shadow", slug);
}

for (const slug of process.argv.slice(2)) await shadow(slug);
