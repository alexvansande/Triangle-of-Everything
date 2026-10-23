#!/usr/bin/env node
// Derive chart tiers from matching masters, never upscale old thumbnails or
// silently swap in stale source artwork. Existing root WebPs stay untouched.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { convert, UNSCREENED_WEBP } from './unscreen-art.mjs';
import { iconCategories } from './shadow-eligibility.mjs';

const ROOT = 'content/icons', OUT = `${ROOT}/resolutions`;
const slugOf = file => path.parse(file).name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
async function preview(bytes) {
  return sharp(bytes).resize(128, 128, { fit: 'contain', background: '#0000' })
    .flatten({ background: '#433193' }).removeAlpha().raw().toBuffer();
}

export async function generateIconResolutions(requested = []) {
  await fs.mkdir(OUT, { recursive: true });
  // luminous icons converted from screen-blend art (scripts/unscreen-icons.mjs):
  // their master is converted the same way before the tiers are cut from it
  const unscreened = JSON.parse(await fs.readFile(`${ROOT}/unscreened.json`, 'utf8').catch(() => '{}'));
  const categoryFor = iconCategories();
  const files = (await fs.readdir(ROOT)).filter(f => f.endsWith('.webp')).sort();
  const sources = new Map((await fs.readdir(`${ROOT}/src`)).filter(f => /\.(png|jpe?g)$/i.test(f)).map(f => [slugOf(f), f]));
  const manifest = JSON.parse(await fs.readFile(`${OUT}/manifest.json`, 'utf8').catch(() => '{}'));
  for (const name of requested) if (!files.includes(`${name}.webp`)) throw Error(`Unknown icon: ${name}`);
  const selected = requested.length ? files.filter(f => requested.includes(f.slice(0, -5))) : files;
  let changed = 0;
  for (const file of selected) {
    const name = file.slice(0, -5), live = await fs.readFile(`${ROOT}/${file}`);
    const sourceFile = sources.get(name);
    let source = sourceFile ? await fs.readFile(`${ROOT}/src/${sourceFile}`) : null;
    const unscreen = unscreened[name]?.master && source;
    const fingerprint = hash(Buffer.concat([Buffer.from(unscreen ? 'resolution-v1 unscreen-v1' : 'resolution-v1'), live, source || Buffer.alloc(0)]));
    if (manifest[name]?.fingerprint === fingerprint) continue;
    if (unscreen) { const { slug, cat } = categoryFor(name); source = await (await convert(source, slug, cat, 1024)).image.png().toBuffer(); }
    const base = await sharp(live).metadata();
    let input = live, sourcePath = `${ROOT}/${file}`, reason = source ? 'source differs from current icon' : 'no larger source';
    let difference = null;
    if (source) {
      const [a,b] = await Promise.all([preview(source), preview(live)]);
      let sum = 0; for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
      difference = sum / a.length;
      const meta = await sharp(source).metadata();
      // an icon converted from its master matches it by construction
      if ((difference <= 6 || unscreen) && Math.max(meta.width, meta.height) > Math.max(base.width, base.height)) {
        input = source; sourcePath = `${ROOT}/src/${sourceFile}`; reason = 'matching master';
      }
    }
    const native = await sharp(input).metadata();
    const max = Math.min(1024, Math.max(native.width, native.height));
    const sizes = [...new Set([128,256,512,1024].filter(n => n <= max).concat(max))].sort((a,b) => a-b);
    const variants = [];
    for (const width of sizes) {
      // Reuse the live thumbnail at its native size; don't change approved art.
      if (width === base.width && base.width === base.height) continue;
      const relative = `${width}/${name}.webp`;
      await fs.mkdir(`${OUT}/${width}`, { recursive: true });
      await sharp(input).resize(width, width, { fit:'contain', background:'#0000' })
        .webp(unscreened[name] ? UNSCREENED_WEBP : {quality:90,alphaQuality:100}).toFile(`${OUT}/${relative}`);
      variants.push({width,path:relative});
    }
    manifest[name] = {fingerprint,baseWidth:base.width,source:sourcePath,reason,sourceDifference:difference,variants};
    changed++;
  }
  await fs.writeFile(`${OUT}/manifest.json`, JSON.stringify(manifest,null,2)+'\n');
  const entries = Object.values(manifest);
  console.log(`Updated ${changed} icons; ${entries.filter(e=>e.reason==='matching master').length} matching high-resolution masters. ${entries.filter(e=>e.baseWidth===128&&!e.variants.some(v=>v.width>128)).length} remain limited to their current 128px artwork.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateIconResolutions(process.argv.slice(2)).catch(e=>{console.error(e);process.exitCode=1;});
}
