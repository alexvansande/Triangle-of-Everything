// Animation: element dots morph from their chart positions (size across, mass up)
// to the periodic table, rotated 180° so hydrogen sits at the bottom like on the chart.
// Colours: slope of the binding curve, full spectrum (as binding-slope-spectrum.png).
// Run: NODE_PATH=$(npm root -g) node anim.mjs   → table-morph.mp4
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
const REPO = "/home/user/Triangle-of-Everything";
const SP = path.dirname(new URL(import.meta.url).pathname);
const require = createRequire(REPO + "/package.json");
const { chromium } = require("playwright");
const d3 = await import(REPO + "/node_modules/d3/src/index.js");
const { ELEMENTS_BY_Z, periodicCell } = await import(REPO + "/src/data.js");

const dust = JSON.parse(fs.readFileSync(REPO + "/src/dust.json"));
const objs = JSON.parse(fs.readFileSync(REPO + "/src/objects.json"));
const SL = JSON.parse(fs.readFileSync(SP + "/slope.json"));
const pos = new Map();
dust.name.forEach((n, i) => { if (dust.s[i] === 2) pos.set(n, [dust.r[i], dust.m[i]]); });
for (const o of objs) if (o.cat === "atomic" && o.subcat === "atom") pos.set(o.name, [o.logR, o.logM]);

// Colours (same as render-slope.mjs, SPECTRUM=1)
const S0 = 5, SMAX = 50, SMIN = 8, TOP = 0.64;
const u = (v) => Math.max(-1, Math.min(1, v >= 0 ? Math.asinh(v / S0) / Math.asinh(SMAX / S0) : -Math.asinh(-v / S0) / Math.asinh(SMIN / S0)));
const colU = (x) => { const c = d3.hsl(d3.interpolateTurbo(x >= 0 ? TOP - x * (TOP - 0.06) : TOP + -x * (0.96 - TOP))); c.s *= 0.15 + 0.85 * Math.min(1, Math.abs(x) / 0.8); return c.formatHex(); };
const ink = (c) => (d3.lab(c).l > 62 ? "#111" : "#fff");

const W = 1080, H = 1920, BG = "#06061a";
const els = [];
for (let z = 1; z < ELEMENTS_BY_Z.length; z++) {
  const [r, m] = pos.get(ELEMENTS_BY_Z[z]);
  const b = SL.els[z];
  els.push({ z, sym: b.sym, r, m, col: colU(u(b.slope)) });
}
// Chart frame: equal aspect, fitted to the middle of the screen
const rx = d3.extent(els, (e) => e.r), my = d3.extent(els, (e) => e.m);
const box = { x: 60, y: 300, w: W - 120, h: 1380 };
const k = Math.min(box.w / (rx[1] - rx[0] + 0.15), box.h / (my[1] - my[0] + 0.15));
const cr = (rx[0] + rx[1]) / 2, cm = (my[0] + my[1]) / 2;
// Grid: rotated 180° (period 1 at the bottom, group 1 on the right), f-block on top
const CELL = 56, gw = 18 * CELL, gx0 = (W - gw) / 2, gyBottom = 1260;
for (const e of els) {
  e.ax = box.x + box.w / 2 + (e.r - cr) * k;
  e.ay = box.y + box.h / 2 - (e.m - cm) * k;
  e.ar = e.z <= 36 ? 15 : 11;
  const c = periodicCell(e.z);
  const col = c.f == null ? c.group - 1 : c.f + 3;          // 0..17
  const row = c.f == null ? c.period - 1 : c.period + 1.5;  // f rows above period 7
  e.bx = gx0 + (17 - col) * CELL + CELL / 2;
  e.by = gyBottom - row * CELL;
  e.br = CELL / 2 - 4;
  e.ink = ink(e.col);
}
const rows = new Map(), cols = new Map();
const add = (mm, key, z) => (mm.get(key) || mm.set(key, []).get(key)).push(z);
for (const e of els) {
  const c = periodicCell(e.z);
  if (c.f == null) { add(rows, "p" + c.period, e.z); add(cols, "g" + c.group, e.z); }
  else { add(rows, "f" + c.period, e.z); add(cols, "f" + c.f, e.z); }
}
const lines = [...[...rows.values()].map((zs) => ({ zs, row: true })), ...[...cols.values()].map((zs) => ({ zs, row: false }))];

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:${BG};font-family:Inter,sans-serif}
</style></head><body><svg id="s" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"></svg>
<script>
const els=${JSON.stringify(els)}, lines=${JSON.stringify(lines)};
const by=new Map(els.map(e=>[e.z,e]));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const NS="http://www.w3.org/2000/svg";
window.draw=(p)=>{ // p: 0 chart → 1 table
  const s=document.getElementById("s"); s.innerHTML="";
  const el=(n,a,txt)=>{const x=document.createElementNS(NS,n);for(const k in a)x.setAttribute(k,a[k]);if(txt!=null)x.textContent=txt;s.appendChild(x);return x;};
  el("rect",{width:${W},height:${H},fill:"${BG}"});
  const at={};
  for(const e of els){
    // light elements lead, heavy ones follow a little later
    const d=(e.z-1)/117*0.25, q=ease(Math.min(1,Math.max(0,(p-d*(1-p)-d*p*0)/(1-d))));
    const t=Math.min(1,Math.max(0,(p-d)/(1-0.25)));
    const v=ease(t);
    at[e.z]=[e.ax+(e.bx-e.ax)*v, e.ay+(e.by-e.ay)*v, e.ar+(e.br-e.ar)*v, v];
  }
  for(const l of lines){
    if(l.zs.length<2)continue;
    el("path",{d:"M"+l.zs.map(z=>at[z][0].toFixed(1)+","+at[z][1].toFixed(1)).join("L"),fill:"none",
      stroke:"#a2fff0","stroke-width":l.row?2:1.4,"stroke-dasharray":l.row?"":"6 5",opacity:l.row?0.45:0.2,"stroke-linejoin":"round"});
  }
  for(const e of [...els].sort((a,b)=>b.z-a.z)){
    const [x,y,r,v]=at[e.z];
    el("circle",{cx:x,cy:y,r:r,fill:e.col,stroke:e.z===26?"#fff":"${BG}","stroke-width":e.z===26?3:1.5});
    el("text",{x:x,y:y+r*0.36,"text-anchor":"middle","font-size":(r*0.82).toFixed(1),"font-weight":700,fill:e.ink},e.sym);
  }
  const fa=Math.max(0,1-p*2.2), fb=Math.max(0,p*2.2-1.2);
  el("text",{x:60,y:120,"font-size":46,"font-weight":700,fill:"#fff"},"THE PERIODIC TABLE");
  const sub1=el("text",{x:60,y:175,"font-size":28,fill:"#ccd",opacity:fa},"as the chart draws it: size across, mass up");
  el("text",{x:60,y:175,"font-size":28,fill:"#ccd",opacity:fb},"the usual table, turned upside down");
  el("text",{x:60,y:215,"font-size":24,fill:"#99a",opacity:fb},"hydrogen at the bottom, heavy rows on top");
  // colour key
  const ky=1800;
  el("text",{x:60,y:ky-40,"font-size":24,fill:"#ccd"},"colour: which way is downhill for the nucleus");
  const g=el("defs",{}); 
  s.lastChild.innerHTML='<linearGradient id="g">${d3.range(0, 41).map((i) => `<stop offset="${i * 2.5}%" stop-color="${colU(1 - i / 20)}"/>`).join("")}</linearGradient>';
  el("rect",{x:60,y:ky-20,width:${W - 120},height:22,rx:4,fill:"url(#g)"});
  el("text",{x:60,y:ky+34,"font-size":22,fill:"#aab"},"fusing gives energy");
  el("text",{x:${W / 2},y:ky+34,"font-size":22,fill:"#aab","text-anchor":"middle"},"iron");
  el("text",{x:${W - 60},y:ky+34,"font-size":22,fill:"#aab","text-anchor":"end"},"splitting gives energy");
};
</script></body></html>`;

const FR = path.join(process.env.FRAMES || "/tmp/claude-0/table-frames");
fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
const FPS = 30;
const seg = [[1.2, 0, 0], [3.6, 0, 1], [2.0, 1, 1], [3.6, 1, 0], [0.6, 0, 0]]; // [seconds, from, to]
let f = 0;
for (const [sec, a, b] of seg) {
  const n = Math.round(sec * FPS);
  for (let i = 0; i < n; i++) {
    await page.evaluate((p) => window.draw(p), a + (b - a) * (i / n));
    await page.screenshot({ path: `${FR}/f${String(f++).padStart(4, "0")}.png` });
  }
}
await browser.close();
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", `${FR}/f%04d.png`,
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", SP + "/table-morph.mp4"]);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", `${FR}/f0090.png`, "-update", "1", SP + "/table-morph-mid.png"]);
console.log("frames", f);
