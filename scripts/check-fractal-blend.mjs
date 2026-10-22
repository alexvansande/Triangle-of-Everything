// Run with the dev server on 5173. Black Screen pixels must leave the backdrop unchanged.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true, args: ['--no-sandbox'],
});
try {
  const page = await browser.newPage();
  await page.setViewport({width: 1200, height: 900});
  await page.goto('http://127.0.0.1:5173/?og-shot#24.2,50.1,7.82', {waitUntil: 'networkidle0'});
  await page.waitForFunction(() => window.__toeOg?.ready());
  await page.evaluate(async () => (await import('/src/bg-noise.js')).applyNoiseProfile({move: false}));
  for (const [enabled, width] of [[true, 1200], [true, 1000], [false, 1000], [true, 1000]]) {
    await page.setViewport({width, height: 900});
    await page.evaluate(on => {
      const toggle = document.querySelector('#set-bgnoise');
      toggle.checked = on; toggle.dispatchEvent(new Event('change'));
    }, enabled);
    if (enabled) await page.waitForSelector('.bgnoise-shown');
    await new Promise(resolve => setTimeout(resolve, 1500));
    const box = await page.evaluate(() => {
      const probe = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      probe.id = 'blend-probe';
      for (const [key, value] of Object.entries({x: 50, y: 50, width: 30, height: 30, fill: 'black'})) probe.setAttribute(key, value);
      probe.style.mixBlendMode = 'screen';
      document.querySelector('.picture-layer').append(probe);
      const rect = probe.getBoundingClientRect();
      return {left: Math.round(rect.x + 10), top: Math.round(rect.y + 10), width: 1, height: 1};
    });
    const probe = await sharp(await page.screenshot()).extract(box).raw().toBuffer();
    await page.evaluate(() => document.querySelector('#blend-probe').remove());
    const background = await sharp(await page.screenshot()).extract(box).raw().toBuffer();
    const difference = Math.max(...probe.map((v, i) => Math.abs(v - background[i])));
    assert.ok(difference <= 1, `Fractal ${enabled}, width ${width}: black Screen pixel changed background by ${difference}`);
    console.log(`Fractal ${enabled ? 'on' : 'off'}, width ${width}: Screen blend matches background`);
  }
} finally { await browser.close(); }
