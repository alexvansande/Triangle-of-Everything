// Render a narrated tour (src/narration.js) to a 1080×1920 MP4.
//
//   npm run dev                                   # in another terminal
//   node scripts/narration-render.mjs short-01-hook [--from 0] [--to 60] [--fps 30] [--workers 3] [--out narration.mp4]
//          [--subframes 4] [--shutter 0.5]
//
// Frame-exact: the page runs on a virtual clock (performance.now, Date.now,
// requestAnimationFrame, setTimeout and CSS animations are all stepped by
// this script), and every frame is window.__narr.renderAt(t) — the same
// pure function the live player uses. The range is split across workers
// (parallel browsers), each writing a segment; the segments are joined and
// the take's audio is muxed in.
//
// Motion blur, on everything that moves: each output frame is the average of
// --subframes renders spread over --shutter of the frame's time (default 4 over
// half a frame, a film camera's 180° shutter), so a whip or a drawing arrow
// smears along its own path while anything still stays sharp. --subframes 1
// turns it off (4× faster).

import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const take = args[0] && !args[0].startsWith("--") ? args[0] : "short-01-hook";
const opt = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 ? args[i + 1] : d; };
const BASE = opt("url", "http://localhost:5173");
const FPS = +opt("fps", 30);
const WORKERS = +opt("workers", 3);
const SUB = Math.max(1, Math.round(+opt("subframes", 4)));
// --adaptive (default on with sub-frames; --adaptive 0 for every frame in full): a frame where
// nothing moves across the shutter gets one capture, not SUB of them. Two tiny captures at the
// shutter's ends decide: if under 0.1% of their pixels change, the average would be that one
// picture anyway. Captures are JPEG (q 95) by default, ~3× faster than PNG (--capture png);
// averaging the sub-frames smooths the JPEG grain. Most frames hold or glide, so this is several
// times faster than blurring every frame (2026-10-27: 95% of the time was the PNG captures)
const ADAPTIVE = opt("adaptive", "1") !== "0";
const CAPTURE = opt("capture", "jpeg");
const SHUTTER = +opt("shutter", 0.5);
const OUT = path.resolve(opt("out", `narration-${take}.mp4`));
const CHROME = opt("chrome", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome");
const STAGE = { W: 432, H: 768, pad: 36, dpr: 2.5 };   // 432×768 CSS px × 2.5 = 1080×1920
const TMP = fs.mkdtempSync(path.join(path.dirname(OUT), ".narr-render-"));

// Installed before any page script: a clock that stands still until freeze().
const CLOCK_SHIM = `(() => {
  const realNow = performance.now.bind(performance), realDate = Date.now;
  const realRaf = window.requestAnimationFrame.bind(window), realCaf = window.cancelAnimationFrame.bind(window);
  const realST = window.setTimeout.bind(window), realCT = window.clearTimeout.bind(window);
  const dateBase = realDate() - realNow();
  let frozen = false, vt = 0, nextId = 1e6, rafQ = [], timers = [];
  performance.now = () => frozen ? vt : realNow();
  Date.now = () => frozen ? dateBase + vt : realDate();
  window.requestAnimationFrame = (cb) => { if (!frozen) return realRaf(cb); rafQ.push([++nextId, cb]); return nextId; };
  window.cancelAnimationFrame = (id) => { rafQ = rafQ.filter(x => x[0] !== id); realCaf(id); };
  window.setTimeout = (fn, ms = 0, ...a) => {
    if (!frozen || typeof fn !== "function") return realST(fn, ms, ...a);
    timers.push({ id: ++nextId, at: vt + (+ms || 0), fn: () => fn(...a) }); return nextId;
  };
  window.clearTimeout = (id) => { timers = timers.filter(t => t.id !== id); realCT(id); };
  window.__vclock = {
    freeze() { vt = realNow(); frozen = true; },
    now: () => vt,
    step(ms) {
      vt += ms;
      for (let guard = 0; guard < 50; guard++) {
        const due = timers.filter(t => t.at <= vt).sort((a, b) => a.at - b.at);
        if (!due.length) break;
        timers = timers.filter(t => t.at > vt);
        due.forEach(t => { try { t.fn(); } catch (e) { console.error(e); } });
      }
      const q = rafQ; rafQ = [];
      q.forEach(([, cb]) => { try { cb(vt); } catch (e) { console.error(e); } });
      document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = (a.currentTime ?? 0) + ms; } catch {} });
    },
  };
})();`;

// every worker's Chrome, closed if the render is stopped: killing only this process left them
// running, orphaned and still drawing, which starved the next render (2026-10-27)
const browsers = new Set();
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, async () => {
  await Promise.allSettled([...browsers].map(b => b.close()));
  process.exit(130);
});
async function renderRange(t0, t1, file, label) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    args: ["--no-sandbox", "--mute-audio", "--disable-background-timer-throttling", "--disable-renderer-backgrounding"],
  });
  browsers.add(browser);
  const page = await browser.newPage();
  await page.setViewport({ width: STAGE.W + 2 * STAGE.pad, height: STAGE.H + 2 * STAGE.pad, deviceScaleFactor: STAGE.dpr });
  page.on("pageerror", e => console.log(`[${label}] pageerror:`, e.message));
  await page.evaluateOnNewDocument(CLOCK_SHIM);
  await page.goto(`${BASE}/?narrate=${take}&render=1`, { waitUntil: "load", timeout: 600000 });   // not networkidle: a close opening view never reports idle
  await page.waitForFunction("window.__narr", { timeout: 60000 });
  // let dust, icons and the first tiles arrive in real time, then stop the clock
  await page.evaluate(`window.__narr.renderAt(${t0}); window.__narr.settle(${t0})`);
  for (let i = 0; i < 60 && await page.evaluate("window.__narr.pending()"); i++) await new Promise(r => setTimeout(r, 250));
  await page.evaluate("window.__vclock.freeze()");
  const clip = await page.evaluate(() => {
    const r = document.getElementById("narr-layer").getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, scale: devicePixelRatio };
  });
  const cdp = await page.target().createCDPSession();
  const W = Math.round(clip.width * clip.scale), H = Math.round(clip.height * clip.scale);
  const ff = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y",
    ...(SUB > 1 ? ["-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${W}x${H}`] : ["-f", "image2pipe"]), "-framerate", String(FPS),
    "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), file],
    { stdio: ["pipe", "inherit", "inherit"] });
  const shot = async () => (await cdp.send("Page.captureScreenshot", { format: SUB > 1 ? CAPTURE : "jpeg", quality: SUB > 1 ? (CAPTURE === "png" ? undefined : 95) : 92, clip, captureBeyondViewport: false })).data;
  // a tiny capture (1/8 size) for the adaptive check
  const tiny = async () => sharp(Buffer.from((await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 80,
    clip: { ...clip, scale: clip.scale / 8 }, captureBeyondViewport: false })).data, "base64")).removeAlpha().raw().toBuffer();
  const moves = (a, b) => {
    let n = 0;
    for (let j = 0; j < a.length; j += 3) if (Math.abs(a[j] - b[j]) > 12 || Math.abs(a[j + 1] - b[j + 1]) > 12 || Math.abs(a[j + 2] - b[j + 2]) > 12) n++;
    return n > a.length / 3 * 0.001;
  };
  let single = 0;
  const acc = SUB > 1 ? new Uint32Array(W * H * 3) : null;
  const n0 = Math.round(t0 * FPS), n1 = Math.round(t1 * FPS);
  const started = Date.now();
  for (let n = n0; n < n1; n++) {
    const t = n / FPS;
    let frame;
    if (SUB === 1) {
      await page.evaluate(`window.__narr.renderAt(${t}); window.__vclock.step(${1000 / FPS})`);
      // give arriving tiles/icons a moment (real time) — they'd pop in otherwise
      for (let i = 0; i < 8 && await page.evaluate("window.__narr.pending()"); i++) await new Promise(r => setTimeout(r, 120));
      frame = Buffer.from(await shot(), "base64");
    } else {
      // still across the shutter? one capture (the clock still steps a whole frame)
      let still = false;
      if (ADAPTIVE) {
        const half = 0.5 * (1 - 1 / SUB) * SHUTTER / FPS;
        await page.evaluate(`window.__narr.renderAt(${t - half})`);
        const a = await tiny();
        await page.evaluate(`window.__narr.renderAt(${t + half})`);
        still = !moves(a, await tiny());
      }
      if (still) {
        await page.evaluate(`window.__narr.renderAt(${t}); window.__vclock.step(${1000 / FPS})`);
        for (let i = 0; i < 8 && await page.evaluate("window.__narr.pending()"); i++) await new Promise(r => setTimeout(r, 120));
        frame = await sharp(Buffer.from(await shot(), "base64")).removeAlpha().resize(W, H).raw().toBuffer();
        single++;
        if (!ff.stdin.write(frame)) await new Promise(r => ff.stdin.once("drain", r));
        if ((n - n0) % (FPS * 10) === 0) {
          const done = n - n0 + 1, rate = done / ((Date.now() - started) / 1000);
          console.log(`[${label}] t=${t.toFixed(1)}s  ${done}/${n1 - n0} frames  ${rate.toFixed(1)} fps  eta ${((n1 - n) / rate / 60).toFixed(1)} min  (${Math.round(100 * single / done)}% still)`);
        }
        continue;
      }
      // the sub-frames, centred on t across the shutter, averaged
      acc.fill(0);
      for (let k = 0; k < SUB; k++) {
        const ts = t + ((k + 0.5) / SUB - 0.5) * SHUTTER / FPS;
        await page.evaluate(`window.__narr.renderAt(${ts}); window.__vclock.step(${1000 / FPS / SUB})`);
        for (let i = 0; i < 8 && await page.evaluate("window.__narr.pending()"); i++) await new Promise(r => setTimeout(r, 120));
        const px = await sharp(Buffer.from(await shot(), "base64")).removeAlpha().resize(W, H).raw().toBuffer();
        for (let j = 0; j < px.length; j++) acc[j] += px[j];
      }
      frame = Buffer.alloc(W * H * 3);
      for (let j = 0; j < frame.length; j++) frame[j] = (acc[j] + (SUB >> 1)) / SUB;
    }
    if (!ff.stdin.write(frame)) await new Promise(r => ff.stdin.once("drain", r));
    if ((n - n0) % (FPS * 10) === 0) {
      const done = n - n0 + 1, rate = done / ((Date.now() - started) / 1000);
      console.log(`[${label}] t=${t.toFixed(1)}s  ${done}/${n1 - n0} frames  ${rate.toFixed(1)} fps  eta ${((n1 - n) / rate / 60).toFixed(1)} min  (${Math.round(100 * single / done)}% still)`);
    }
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
  await browser.close();
  browsers.delete(browser);
}

const meta = JSON.parse(fs.readFileSync(`public/narration/${take}/words.json`, "utf8"));
const total = meta.duration + (meta.credits || 0);   // the end credits run on after the last word
const from = +opt("from", 0), to = Math.min(+opt("to", total), total);
const parts = [];
const step = (to - from) / WORKERS;
for (let i = 0; i < WORKERS; i++) {
  const a = from + i * step, b = i === WORKERS - 1 ? to : from + (i + 1) * step;
  parts.push({ a: Math.round(a * FPS) / FPS, b: Math.round(b * FPS) / FPS, file: path.join(TMP, `part${i}.mp4`) });
}
console.log(`rendering ${take} ${from}s–${to}s at ${FPS} fps${SUB > 1 ? ` (${SUB} sub-frames, shutter ${SHUTTER})` : ""} with ${WORKERS} worker(s) → ${OUT}`);
// the workers start a few seconds apart: all of them loading the dev server's unbundled
// modules at once timed out at 8 workers (2026-10-27); the first one warms its cache
await Promise.all(parts.map((p, i) => new Promise(r => setTimeout(r, i * 6000)).then(() => renderRange(p.a, p.b, p.file, `w${i}`))));
fs.writeFileSync(path.join(TMP, "list.txt"), parts.map(p => `file '${p.file}'`).join("\n"));
// the voice with its sound design (narration-sound.mjs) if the take has one; --voice-only for the bare voice
const audio = `public/narration/${take}/${meta.mix && !process.argv.includes("--voice-only") ? meta.mix : meta.audio}`;
await new Promise((res, rej) => spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y",
  "-f", "concat", "-safe", "0", "-i", path.join(TMP, "list.txt"),
  "-ss", String(from), "-t", String(to - from), "-i", audio,
  "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", "apad", "-t", String(to - from),   // silent tail if the take runs past its audio
  "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", OUT],
  { stdio: "inherit" }).on("close", c => c ? rej(new Error("ffmpeg mux failed")) : res()));
fs.rmSync(TMP, { recursive: true, force: true });
console.log("done:", OUT);
