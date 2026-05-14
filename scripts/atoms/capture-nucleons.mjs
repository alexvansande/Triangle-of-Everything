// Render proton and neutron variants for use as packed-sphere nuclei.
// Proton state: vivid red/orange/yellow ("Fire" gradient).
// Neutron state: white/silver/yellow ("Steel" gradient).
// We vary spin XZ and Tilt YZ to get visually unique variants.
// Requires Playwright. Default: bare import (`npm i -D playwright`). If
// you'd rather use a global install, point PLAYWRIGHT_PATH at the package.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const pwPath = process.env.PLAYWRIGHT_PATH || 'playwright';
const pw = (await import(pwPath)).default ?? await import(pwPath);
const { chromium } = pw;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'nucleons');
fs.mkdirSync(OUT, { recursive: true });

const PROTON_STATE  = '32592203010001545904fffff50e01030317010d05-179.51.0.0-100b04325b00860f89';
const NEUTRON_STATE = '32592203010001545909fffff50e01030317010d05-171.52.0.0-100b06194100870f84';

// 6 spin XZ / YZ combos per nucleon — enough variety that no two packed
// nucleons look like obvious copies of each other.
const SPINS = [
  { xz: 30,  yz: 22 },
  { xz: 90,  yz: 48 },
  { xz: 150, yz: 36 },
  { xz: 210, yz: 60 },
  { xz: 270, yz: 30 },
  { xz: 330, yz: 70 },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
page.on('pageerror', e => console.error('PAGE ERROR:', e.message));

await page.goto('http://localhost:5173/hiperspirograph.html', { waitUntil: 'networkidle' });

async function renderSet(state, prefix) {
  await page.evaluate((s) => {
    applyState(s);
    const t = document.getElementById('timeDim');
    if (t.checked) { t.checked = false; t.dispatchEvent(new Event('change', { bubbles: true })); }
    if (typeof timeAnimId !== 'undefined' && timeAnimId) {
      cancelAnimationFrame(timeAnimId);
      timeAnimId = null;
    }
  }, state);
  await page.waitForTimeout(120);

  for (let i = 0; i < SPINS.length; i++) {
    const { xz, yz } = SPINS[i];
    const dataUrl = await page.evaluate(({ xz, yz }) => {
      document.getElementById('spinXZ').value = xz;
      document.getElementById('spinYZ').value = yz;
      ['spinXZ', 'spinYZ'].forEach(id =>
        document.getElementById(id).dispatchEvent(new Event('input', { bubbles: true }))
      );
      draw();
      return document.getElementById('c').toDataURL('image/png');
    }, { xz, yz });
    const buf = Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
    const out = path.join(OUT, `${prefix}${i + 1}.png`);
    fs.writeFileSync(out, buf);
    console.log(`wrote ${out} (${(buf.length / 1024).toFixed(0)} KB)`);
  }
}

await renderSet(PROTON_STATE,  'proton');
await renderSet(NEUTRON_STATE, 'neutron');

await browser.close();
console.log('done');
