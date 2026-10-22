#!/usr/bin/env node
// Cast shadows for the non-round icons, made from each icon's own silhouette
// the way you'd do it by hand in an image editor:
//   silhouette → rotate −45° (down-right becomes +x) → mirror along x →
//   stretch along x → blur that grows with distance + fade → rotate back.
// The mirror reverses the shadow along the light only: the object's
// down-right edge becomes the shadow's sharp near end (up-left), its top
// lands at the shadow's right and its left at the shadow's bottom.
// Output: content/icons/shadows/<slug>.webp, a square SHADOW_SPAN times the
// icon's size with the object's centre at its centre. The map draws it under
// everything, offset down-right (drawIconShadows in src/main.js).
//
//   node scripts/generate-shadows.mjs human hippo elephant …   (icon file names)
//   node scripts/generate-shadows.mjs --all
//     every opaque icon: round ones share _sphere.webp (listed in round.json),
//     the rest get their own; screen-blended space art and voids get none.
import sharp from "sharp";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";

const ICONS = "content/icons", OUT = "content/icons/shadows";
const ICON = 256;            // working size of the icon itself (px)
const SPAN = 3;              // shadow canvas = SPAN × icon size (keep in sync with SHADOW_SPAN in main.js)
const STRETCH = 1.6;         // along the light direction
const BLUR_NEAR = 8, BLUR_FAR = 40;   // px at ICON = 256
const FADE = 0.75;           // how much of the shadow's opacity is gone at the far end
const OUT_PX = 256;          // shipped size of the whole canvas

mkdirSync(OUT, { recursive: true });

// one-channel buffers; sharp turns them into colour when padding or rotating
// over a background, so every step ends with extractChannel(0)
const raw1 = (buf, w, h) => ({ raw: { width: w, height: h, channels: 1 } });

// The shipped 128 px icon is plenty for a blurred shadow, and every icon has one.
const iconAlpha = (file) => sharp(`${ICONS}/${file}.webp`)
  .resize(ICON, ICON, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .ensureAlpha().extractChannel(3).raw().toBuffer();

async function shadow(file, alphaBuf) {
  // 1. silhouette (alpha → white on black), centred on a SPAN× canvas
  const C = ICON * SPAN, pad = (C - ICON) / 2;
  const alpha = alphaBuf || await iconAlpha(file);
  const sil = await sharp(alpha, raw1(alpha, ICON, ICON))
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: "#000" }).extractChannel(0).raw().toBuffer();

  // 2. rotate −45° (down-right → +x), then mirror along x; sharp grows the
  //    canvas, centre stays put
  //    (two pipelines: sharp would flop before rotating)
  const rot0 = await sharp(sil, raw1(sil, C, C)).rotate(-45, { background: "#000" }).extractChannel(0).raw().toBuffer({ resolveWithObject: true });
  const R = rot0.info.width;
  const rot = { data: await sharp(rot0.data, raw1(rot0.data, R, R)).flop().extractChannel(0).raw().toBuffer() };

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
    .resize(OUT_PX, OUT_PX).webp({ quality: 80, alphaQuality: 80 }).toFile(`${OUT}/${file}.webp`);
  console.log("shadow", file);
}

// --- --all: which icons are opaque, and which of those are round ----------
// Mirrors src/main.js: screen-blended categories cast no shadow.
const SCREEN_BLEND_CATS = new Set(["remnant", "galaxy", "largescale", "star", "particle", "composite", "blackhole", "atomic"]);
const SCREEN_BLEND_SLUGS = new Set(["halleys-comet", "hale-bopp"]);
const nameToSlug = (name) => name.toLowerCase()
  .replace(/γ/g, "gamma").replace(/τ/g, "tau").replace(/μ/g, "mu")
  .replace(/['’]/g, "").replace(/[*()]/g, "")
  .replace(/ö/g, "o").replace(/ü/g, "u").replace(/ä/g, "a")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function iconCategories() {
  const assets = readFileSync("src/assets.js", "utf8");
  const map = {};
  for (const [, a, b] of assets.match(/ICON_SLUG_MAP = \{([\s\S]*?)\};/)[1].matchAll(/"([^"]+)":\s*"([^"]+)"/g)) map[a] = b;
  const cat = {};
  for (const o of JSON.parse(readFileSync("src/objects.json", "utf8"))) cat[o.slug || nameToSlug(o.name)] = o.cat;
  const dust = JSON.parse(readFileSync("src/dust.json", "utf8"));
  const srcCat = Object.fromEntries(dust.sources.map(s => [s.id, s.cat]));
  for (const f of JSON.parse(readFileSync("src/dust-famous.json", "utf8"))) {
    const slug = nameToSlug(f.label || f.name);
    if (!(slug in cat)) cat[slug] = srcCat[f.source];
  }
  return (file) => { const slug = map[file] || file; return { slug, cat: cat[slug] }; };
}

// round = the silhouette nearly fills the circle across its box, and next to
// nothing of it lies outside that circle (a square fills it too)
function roundness(a) {
  let x0 = ICON, y0 = ICON, x1 = -1, y1 = -1, n = 0;
  for (let y = 0; y < ICON; y++) for (let x = 0; x < ICON; x++) if (a[y * ICON + x] > 128) {
    n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  const cx = (x0 + x1 + 1) / 2, cy = (y0 + y1 + 1) / 2, r = Math.max(x1 - x0 + 1, y1 - y0 + 1) / 2;
  let inside = 0, outside = 0, disc = 0;
  for (let y = 0; y < ICON; y++) for (let x = 0; x < ICON; x++) {
    const inC = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r;
    if (inC) disc++;
    if (a[y * ICON + x] > 128) inC ? inside++ : outside++;
  }
  return { fill: inside / disc, spill: outside / Math.max(1, n) };
}

async function all() {
  mkdirSync(OUT, { recursive: true });
  const catOf = iconCategories();
  const round = [];
  for (const f of readdirSync(ICONS).filter(f => f.endsWith(".webp")).map(f => f.replace(".webp", "")).sort()) {
    const { slug, cat } = catOf(f);
    if (!cat || SCREEN_BLEND_CATS.has(cat) || SCREEN_BLEND_SLUGS.has(slug) || slug.includes("void")) continue;
    const a = await iconAlpha(f);
    const { fill, spill } = roundness(a);
    if (fill > 0.9 && spill < 0.03) { round.push(f); continue; }
    await shadow(f, a);
  }
  // one shared shadow for every round thing: a disc filling the icon at 122/128
  const disc = Buffer.alloc(ICON * ICON), R = ICON * 61 / 128;
  for (let y = 0; y < ICON; y++) for (let x = 0; x < ICON; x++)
    disc[y * ICON + x] = Math.hypot(x + 0.5 - ICON / 2, y + 0.5 - ICON / 2) <= R ? 255 : 0;
  await shadow("_sphere", disc);
  writeFileSync(`${OUT}/round.json`, JSON.stringify(round, null, 1) + "\n");
  console.log(`${round.length} round icons share _sphere.webp`);
}

if (process.argv.includes("--all")) await all();
else for (const f of process.argv.slice(2)) await shadow(f);
