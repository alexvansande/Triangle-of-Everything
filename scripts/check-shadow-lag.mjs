// node scripts/check-shadow-lag.mjs [--url http://localhost:5190] [take …]
// The fractal background draws the pictures' shadows into itself. If it draws before the chart has
// moved the pictures for a frame, the shadows trail the camera: a faint ghost in fast moves (the
// author, 2026-11-01). For each take (all by default), at its fastest camera moves, this steps the
// player as a render does and measures after each frame how far the background's shadows sit from the
// chart's. With the bug they were 8 to 1,000+ px behind; a picture settling its own animation can
// leave 2-5 px for one frame, so the alarm is at 6 px.
import puppeteer from "puppeteer-core";
import { readdirSync } from "node:fs";

const args = process.argv.slice(2);
const ui = args.indexOf("--url");
const URL_ = ui >= 0 ? args.splice(ui, 2)[1] : "http://localhost:5190";
const takes = args.length ? args : readdirSync("video/web").filter(f => f.endsWith(".mp4")).map(f => f.slice(0, -4));   // the rendered videos
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--no-sandbox"] });
let bad = 0;
for (const take of takes) {
  const wide = take.startsWith("long");
  const p = await browser.newPage();
  await p.setViewport(wide ? { width: 768, height: 432 } : { width: 432, height: 768 });
  await p.goto(`${URL_}/?narrate=${take}&render=1&stage=${wide ? "landscape" : "none"}`, { waitUntil: "load", timeout: 180000 });
  await p.waitForFunction("window.__narr", { timeout: 90000 });
  // the fastest camera moves, in screens per 0.1 s, at least 3 s apart
  const ts = await p.evaluate(() => {
    const n = window.__narr, out = [];
    for (let t = 1; t < n.duration - 1; t += 0.25) {
      const a = n.view(t), c = n.view(t + 0.1);
      out.push([t, Math.hypot(a.r - c.r, a.m - c.m) / a.span + Math.abs(Math.log(c.span / a.span))]);
    }
    out.sort((x, y) => y[1] - x[1]);
    const pick = [];
    for (const [t, v] of out) { if (v < 0.01) break; if (pick.every(q => Math.abs(q - t) > 3)) pick.push(t); if (pick.length >= 6) break; }
    return pick.sort((x, y) => x - y);
  });
  const frame = () => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  let stale = 0, n = 0, at = [];
  for (const t0 of ts) {
    await p.evaluate(`window.__narr.renderAt(${t0}); window.__narr.settle(${t0})`);
    for (let k = 0; k < 40 && await p.evaluate("window.__narr.pending()"); k++) await new Promise(r => setTimeout(r, 100));
    // a render's sub-frames (1/360 s), then whole frames
    for (const dt of [1 / 360, 1 / 360, 1 / 30, 1 / 30, 0.25]) {
      const t = t0 + dt * (++n % 5 + 1);
      await p.evaluate(`window.__narr.renderAt(${t})`);
      await frame();
      // a picture growing in or changing shape moves its shadow by itself, camera or not: count only
      // the shadows that hold still over one more frame with the camera still
      const lag = await p.evaluate("window.__narr.shadowLag()");
      await frame();
      const after = await p.evaluate("window.__narr.shadowLag()");
      const worst = Math.max(0, ...Object.entries(lag).filter(([id]) => (after[id] ?? 0) < 0.25).map(([, v]) => v));
      if (worst > 6) { stale++; at.push(`${t.toFixed(2)} (${worst.toFixed(0)} px)`); }
    }
  }
  console.log(`${stale ? "GHOST" : "ok   "} ${take}: ${ts.length} fast moves${stale ? `, shadows behind at ${at.slice(0, 6).join(", ")} s` : ""}`);
  bad += stale;
  await p.close();
}
await browser.close();
process.exit(bad ? 1 : 0);
