#!/usr/bin/env node
// Run from the repository root. Uses the SAME Canvas renderer as the studio.
// node scripts/generate-shadows.mjs --all [--dry-run]
// node scripts/generate-shadows.mjs elephant hippo
// --reset-reviewed restores the common preset, never water caustics or spheres.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import puppeteer from 'puppeteer-core';
import { shadowExclusion } from './shadow-eligibility.mjs';
import { LONG_SHADOW_PRESET } from '../src/long-shadow.js';

export const CAUSTIC_SHADOWS = new Set([
  '1-ml-of-water', '1-liter-of-water', '1-tonne-of-water', 'loch-ness', 'soap-bubble',
  'caspian-sea', 'dead-sea', 'lake-baikal', 'lake-nyos', 'lake-superior',
  'lake-tahoe', 'lake-victoria', 'sea-of-galilee', 'hallstatter-see', 'konigssee', 'titicaca',
]);
export const CUSTOM_AI_SHADOWS = new Set(['saturn','y-brown-dwarf','t-brown-dwarf','l-brown-dwarf']);
export function shadowAction(name, excluded, round) {
  if (excluded) return 'excluded';
  if (CAUSTIC_SHADOWS.has(name)) return 'caustics';
  if (CUSTOM_AI_SHADOWS.has(name)) return 'custom';
  if (round.has(name) || name === '_sphere') return 'round';
  return 'generate';
}

async function main() {
  const args = process.argv.slice(2), all = args.includes('--all');
  if (args.some(a => a.startsWith('--') && !['--all', '--dry-run', '--reset-reviewed'].includes(a))) throw Error('Unknown option');
  const icons = 'content/icons', out = `${icons}/shadows`, configPath = `${out}/overrides.json`;
  const files = (await fs.readdir(icons)).filter(f => f.endsWith('.webp')).map(f => f.slice(0, -5)).sort();
  const names = all ? files : [...new Set(args.filter(a => !a.startsWith('--')))];
  if (!names.length) throw Error('Specify icon names or --all; add --dry-run to inspect the plan.');
  for (const name of names) if (!files.includes(name)) throw Error(`Unknown icon: ${name}`);
  const round = new Set(JSON.parse(await fs.readFile(`${out}/round.json`, 'utf8')));
  const overrides = JSON.parse(await fs.readFile(configPath, 'utf8').catch(() => '{}'));
  const plan = [];
  for (const name of names) {
    const reason = await shadowExclusion(name);
    plan.push({ name, action: shadowAction(name, reason, round), ...(reason ? { reason } : {}) });
  }
  const counts = Object.fromEntries(['generate','round','caustics','custom','excluded'].map(a => [a,plan.filter(p => p.action === a).length]));
  console.log(JSON.stringify(counts));
  if (args.includes('--dry-run')) { for (const p of plan) console.log(p.action, p.name); return; }
  const executablePath = [process.env.PUPPETEER_EXECUTABLE_PATH, process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(p => p && existsSync(p));
  if (!executablePath) throw Error('Set CHROME_PATH to Chrome/Chromium; the studio renderer requires Canvas.');
  const stamp = new Date().toISOString().replace(/[:.]/g,'-');
  const archive = `${icons}/shadow-candidates/long-shadow-batches/${stamp}`;
  await fs.mkdir(`${archive}/previous`, { recursive: true });
  await fs.mkdir(`${archive}/prepared`, { recursive: true });
  await fs.copyFile(configPath, `${archive}/previous/overrides.json`);
  await fs.copyFile(`${out}/round.json`, `${archive}/previous/round.json`);
  await fs.copyFile(`${out}/_sphere.webp`, `${archive}/previous/_sphere.webp`);
  const renderer = await fs.readFile('src/long-shadow.js', 'utf8');
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.evaluate(async source => {
      window.shadowRenderer = await import('data:text/javascript;base64,' + source);
    }, Buffer.from(renderer).toString('base64'));
    let count = 0;
    for (const item of plan.filter(p => p.action === 'generate')) {
      const previous = overrides[item.name];
      const settings = { ...LONG_SHADOW_PRESET,
        ...(previous?.mode === 'long' && !args.includes('--reset-reviewed') ? previous : {}),
        mode: 'long', source: 'alpha-long-shadow', anchorBase: false, flipY: false,
      };
      const icon = (await fs.readFile(`${icons}/${item.name}.webp`)).toString('base64');
      const png = Buffer.from(await page.evaluate(async ({icon, settings}) => {
        const image = new Image(); image.src = 'data:image/webp;base64,' + icon; await image.decode();
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = 768;
        window.shadowRenderer.drawLongShadow(canvas, image, settings);
        return canvas.toDataURL('image/png').split(',')[1];
      }, {icon, settings}), 'base64');
      await fs.writeFile(`${archive}/${item.name}.png`, png);
      const webp = await sharp(png).resize(256, 256).webp({ quality: 90, alphaQuality: 100 }).toBuffer();
      await fs.writeFile(`${archive}/prepared/${item.name}.webp`, webp);
      item.settings = { ...settings, reviewed: previous?.mode === 'long' && !!previous.reviewed,
        updated: new Date().toISOString(), generator: 'studio-long-shadow-v1' };
      if (++count % 20 === 0) console.log(`Rendered ${count}/${counts.generate}`);
    }
  } finally { await browser.close(); }
  // Finish rendering before replacing anything. Preserve every previous file.
  for (const item of plan) {
    if (!['generate','excluded'].includes(item.action)) continue;
    const dest = `${out}/${item.name}.webp`;
    if (existsSync(dest)) await fs.copyFile(dest, `${archive}/previous/${item.name}.webp`);
  }
  for (const item of plan) {
    const dest = `${out}/${item.name}.webp`;
    if (item.action === 'generate') {
      await fs.copyFile(`${archive}/prepared/${item.name}.webp`, dest);
      overrides[item.name] = item.settings;
    } else if (item.action === 'excluded') {
      // Obsolete black-background shadows must not be picked up by the chart.
      await fs.rm(dest, { force: true }); delete overrides[item.name];
    }
  }
  const temporary = `${archive}/overrides.json`;
  await fs.writeFile(temporary, JSON.stringify(overrides, null, 2) + '\n');
  await fs.copyFile(temporary, configPath);
  await fs.writeFile(`${archive}/report.json`, JSON.stringify({created:stamp,counts,plan},null,2)+'\n');
  console.log(`Saved ${counts.generate} long shadows. Backup and PNG masters: ${archive}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error); process.exitCode = 1; });
}
