// Headless capture of the hyperspirograph canvas.
// Renders a luminous spherical electron-cloud preset, varying inner Axis 3,
// Spin XZ, and Tilt YZ to get visually distinct spheres for use in molecule
// composites (H, O₂, H₂O).
// Requires Playwright. Default: bare import (`npm i -D playwright`). If
// you'd rather use a global install, point PLAYWRIGHT_PATH at the package.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const pwPath = process.env.PLAYWRIGHT_PATH || 'playwright';
const pw = (await import(pwPath)).default ?? await import(pwPath);
const { chromium } = pw;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'spheres');
fs.mkdirSync(OUT, { recursive: true });

// Electron-as-an-orbital-shell state — a sparse glowing cage on a mostly-black
// background, so it screen-blends cleanly over a bright nucleus without
// hiding it.
const ELECTRON_STATE = '325a04133e41017d0c05dee8f71401010301061e05-181.56.0.0-020d074f64408c0f09';

// Each variant tweaks i3 (inner hypersphere axis 3), spinXZ, and spinYZ.
// Different (i3, spinXZ, spinYZ) trios change which slice of the 5D shape we
// see and from what angle, so each sphere reads as a unique render rather
// than a duplicate.
const VARIANTS = [
  { name: 'sphere1', i3: 30, xz: 178, yz: 64 }, // the user-provided baseline
  { name: 'sphere2', i3: 19, xz: 45,  yz: 28 },
  { name: 'sphere3', i3: 47, xz: 220, yz: 52 },
  { name: 'sphere4', i3: 23, xz: 310, yz: 38 },
  { name: 'sphere5', i3: 41, xz: 95,  yz: 76 },
  { name: 'sphere6', i3: 13, xz: 150, yz: 18 },
  { name: 'sphere7', i3: 53, xz: 260, yz: 88 },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
page.on('pageerror', e => console.error('PAGE ERROR:', e.message));

await page.goto('http://localhost:5173/hiperspirograph.html', { waitUntil: 'networkidle' });

await page.evaluate((state) => {
  applyState(state);
  // Kill any running time animation — we want a single static slice.
  const t = document.getElementById('timeDim');
  if (t.checked) {
    t.checked = false;
    t.dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (typeof timeAnimId !== 'undefined' && timeAnimId) {
    cancelAnimationFrame(timeAnimId);
    timeAnimId = null;
  }
}, ELECTRON_STATE);

await page.waitForTimeout(150);

async function render(v) {
  const dataUrl = await page.evaluate(({ i3, xz, yz }) => {
    document.getElementById('i3').value = i3;
    document.getElementById('spinXZ').value = xz;
    document.getElementById('spinYZ').value = yz;
    ['i3', 'spinXZ', 'spinYZ'].forEach(id =>
      document.getElementById(id).dispatchEvent(new Event('input', { bubbles: true }))
    );
    draw();
    return document.getElementById('c').toDataURL('image/png');
  }, v);
  const b64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  const buf = Buffer.from(b64, 'base64');
  const out = path.join(OUT, `${v.name}.png`);
  fs.writeFileSync(out, buf);
  console.log(`wrote ${out} (${(buf.length / 1024).toFixed(0)} KB)`);
}

for (const v of VARIANTS) await render(v);

await browser.close();
console.log('done');
