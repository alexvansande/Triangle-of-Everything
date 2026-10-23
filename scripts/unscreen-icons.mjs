#!/usr/bin/env node
// Luminous pictures (src/luminous-art.js) were drawn with mix-blend-mode:
// screen, light on a black square, which WebKit painted solid over the
// fractal background. This converts each one to a plain transparent picture
// that looks the same over any background (how: scripts/unscreen-art.mjs).
//
// The live icon is rewritten (from its master when the tiers use one, so the
// two can't drift apart); the original masters stay as they are and the
// resolution tiers convert them as they are built. An icon without a master
// keeps its original in content/icons/luminous-originals/. Converted icons are
// listed in content/icons/unscreened.json and never converted twice, except
// with --again (after changing the conversion), which starts from the originals.
//
//   node scripts/unscreen-icons.mjs            # all luminous icons not yet converted
//   node scripts/unscreen-icons.mjs sun vega   # just these
//   node scripts/unscreen-icons.mjs --again    # reconvert every converted icon
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { iconCategories } from './shadow-eligibility.mjs';
import { generateIconResolutions } from './generate-icon-resolutions.mjs';
import { convert, UNSCREENED_WEBP } from './unscreen-art.mjs';
import { isLuminousArt } from '../src/luminous-art.js';

const ROOT = 'content/icons', RECORD = `${ROOT}/unscreened.json`, ORIGINALS = `${ROOT}/luminous-originals`;
const record = JSON.parse(await fs.readFile(RECORD, 'utf8').catch(() => '{}'));
const categoryFor = iconCategories();
const manifest = JSON.parse(await fs.readFile(`${ROOT}/resolutions/manifest.json`, 'utf8'));
const again = process.argv.includes('--again');
const requested = process.argv.slice(2).filter(a => a !== '--again');
const files = (await fs.readdir(ROOT)).filter(f => f.endsWith('.webp')).map(f => f.slice(0, -5))
  .filter(f => requested.length ? requested.includes(f) : true)
  .filter(f => { const { slug, cat } = categoryFor(f); return isLuminousArt(cat, slug); })
  .filter(f => again ? record[f] : !record[f]);
const done = [];
for (const file of files) {
  const { slug, cat } = categoryFor(file);
  const live = `${ROOT}/${file}.webp`;
  const liveWidth = (await sharp(live).metadata()).width;
  const master = again ? record[file].master && manifest[file].source
    : manifest[file]?.reason === 'matching master' && manifest[file].source;
  const original = `${ORIGINALS}/${file}.webp`;
  if (!master && !again) { await fs.mkdir(ORIGINALS, { recursive: true }); await fs.copyFile(live, original); }
  const { kind, image } = await convert(await fs.readFile(master || original), slug, cat, 1024);
  const small = master ? sharp(await image.png().toBuffer()).resize(liveWidth, liveWidth) : image;
  await fs.writeFile(live, await small.webp(UNSCREENED_WEBP).toBuffer());
  record[file] = master ? { backing: kind, master: true } : { backing: kind };
  done.push(file);
  await fs.writeFile(RECORD, JSON.stringify(Object.fromEntries(Object.entries(record).sort()), null, 1) + '\n');
  console.log(`${file}: ${kind}${master ? ' (from its master)' : ''}`);
}
if (done.length) await generateIconResolutions(done);
console.log(`${done.length} converted, ${Object.keys(record).length} in ${RECORD}`);
