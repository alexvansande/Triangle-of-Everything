// Video 6 preview: the periodic-table sequence, vertical 1080×1920.
// 1. chart positions → long table upside down (H bottom, alkali metals right, f-block inline)
// 2. "like this": rotate 180° (H top left), then lanthanides/actinides slide out to their own rows
// 3. recolour from element types to energy: blue/green fuse, grey iron, brown heavy, bright red radioactive
// Run: NODE_PATH=$(npm root -g) node table-sequence.mjs → table-sequence.mp4
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
const REPO = "/home/user/Triangle-of-Everything";
const SP = path.dirname(new URL(import.meta.url).pathname);
const require = createRequire(REPO + "/package.json");
const { chromium } = require("playwright");
const d3 = await import(REPO + "/node_modules/d3/src/index.js");
const { ELEMENTS_BY_Z, periodicCell, elementType, ELEMENT_TYPES } = await import(REPO + "/src/data.js");

const dust = JSON.parse(fs.readFileSync(REPO + "/src/dust.json"));
const objs = JSON.parse(fs.readFileSync(REPO + "/src/objects.json"));
const SL = JSON.parse(fs.readFileSync(SP + "/slope.json"));
const pos = new Map();
dust.name.forEach((n, i) => { if (dust.s[i] === 2) pos.set(n, [dust.r[i], dust.m[i]]); });
for (const o of objs) if (o.cat === "atomic" && o.subcat === "atom") pos.set(o.name, [o.logR, o.logM]);
const TYPE = Object.fromEntries(ELEMENT_TYPES.map((t) => [t.id, t.color]));

// Energy colours: the light side of the slope spectrum (violet → green), grey at the top,
// brown for heavier stable nuclei, bright red for the radioactive ones (no stable isotope)
const S0 = 5, SMAX = 50, SMIN = 8, TOP = 0.64;
const u = (v) => Math.max(-1, Math.min(1, v >= 0 ? Math.asinh(v / S0) / Math.asinh(SMAX / S0) : -Math.asinh(-v / S0) / Math.asinh(SMIN / S0)));
const GREYTOP = "#9a958a", BROWN = "#8a5a3c", RADIO = "#ff3b2f";
const energyCol = (slope, radio) => {
  if (radio) return RADIO;
  const x = u(slope);
  if (x < 0) return d3.interpolateLab(GREYTOP, BROWN)(Math.min(1, -x / 0.6));
  const c = d3.hsl(d3.interpolateTurbo(TOP - x * (TOP - 0.06)));
  c.s *= 0.15 + 0.85 * Math.min(1, x / 0.8);
  return c.formatHex();
};
const ink = (c) => (d3.lab(c).l > 62 ? "#111" : "#fff");

const W = 1080, H = 1920, BG = "#06061a";
const els = [];
for (let z = 1; z < ELEMENTS_BY_Z.length; z++) {
  const [r, m] = pos.get(ELEMENTS_BY_Z[z]);
  const b = SL.els[z];
  // radioactive = no stable isotope at all: Tc, Pm, and polonium on (bismuth-209 decays, but
  // with a half-life of ~2×10¹⁹ years it gives off no heat to speak of, so it stays brown)
  const radio = z === 43 || z === 61 || z >= 84;
  const t = d3.color(TYPE[elementType(z)]).formatHex(), en = d3.color(energyCol(b.slope, radio)).formatHex();
  els.push({ z, sym: b.sym, r, m, radio, ct: t, ce: en, it: ink(t), ie: ink(en) });
}
// A: chart
const rx = d3.extent(els, (e) => e.r), my = d3.extent(els, (e) => e.m);
const box = { x: 60, y: 260, w: W - 120, h: 1340 };
const k = Math.min(box.w / (rx[1] - rx[0] + 0.15), box.h / (my[1] - my[0] + 0.15));
const cr = (rx[0] + rx[1]) / 2, cm = (my[0] + my[1]) / 2;
// B: long table, upside down (32 columns); C: B turned 180°; D: the classroom 18-column table
const CY = 900; // centre of the tables
const L = 32, LC = (W - 40) / L, lw = L * LC, lh = 7 * LC;
const S = 56, sw = 18 * S, sh = 9.6 * S;
for (const e of els) {
  e.A = [box.x + box.w / 2 + (e.r - cr) * k, box.y + box.h / 2 - (e.m - cm) * k, e.z <= 36 ? 15 : 11];
  const c = periodicCell(e.z);
  const lcol = c.f == null ? (c.group <= 2 ? c.group - 1 : c.group + 13) : c.f + 2;
  e.lcol = lcol;
  const bx = (W - lw) / 2 + (L - 1 - lcol) * LC + LC / 2, byy = CY + lh / 2 - (c.period - 1) * LC - LC / 2;
  e.B = [bx, byy, LC / 2 - 2];
  e.C = [W - bx, 2 * CY - byy, LC / 2 - 2];
  const scol = c.f == null ? c.group - 1 : c.f + 3;
  const srow = c.f == null ? c.period - 1 : c.period + 1.6;
  e.D = [(W - sw) / 2 + scol * S + S / 2, CY - sh / 2 + srow * S + S / 2, S / 2 - 3];
}
const rows = new Map(), cols = new Map();
const add = (mm, key, z) => (mm.get(key) || mm.set(key, []).get(key)).push(z);
for (const e of els) { const c = periodicCell(e.z); add(rows, c.period, e.z); add(cols, e.lcol, e.z); }
for (const zs of rows.values()) zs.sort((a, b) => els[a - 1].lcol - els[b - 1].lcol);
const lines = [...[...rows.values()].map((zs) => ({ zs, row: true })), ...[...cols.values()].map((zs) => ({ zs, row: false }))];

// Timeline (seconds)
const T = { hold0: 1.0, morph: 3.2, hold1: 1.4, rot: 1.4, slide: 1.4, hold2: 1.4, recol: 2.6, pulse: 3.0, hold3: 1.2 };
const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:${BG};font-family:Inter,sans-serif}</style></head>
<body><svg id="s" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"></svg><script>
const els=${JSON.stringify(els)}, lines=${JSON.stringify(lines)}, T=${JSON.stringify(T)}, CX=${W / 2}, CY=${CY};
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2, cl=t=>Math.max(0,Math.min(1,t));
const lerp=(a,b,t)=>a+(b-a)*t, mix=(p,q,t)=>[lerp(p[0],q[0],t),lerp(p[1],q[1],t),lerp(p[2],q[2],t)];
const NS="http://www.w3.org/2000/svg";
function hex(c){return [1,3,5].map(i=>parseInt(c.slice(i,i+2),16))}
function mixc(a,b,t){const x=hex(a),y=hex(b);return "rgb("+x.map((v,i)=>Math.round(lerp(v,y[i],t))).join(",")+")"}
window.draw=(time)=>{
  const s=document.getElementById("s"); s.innerHTML="";
  const el=(n,a,txt)=>{const x=document.createElementNS(NS,n);for(const k in a)x.setAttribute(k,a[k]);if(txt!=null)x.textContent=txt;s.appendChild(x);return x;};
  el("rect",{width:${W},height:${H},fill:"${BG}"});
  let t=time, ph;
  const seg=[["hold0"],["morph"],["hold1"],["rot"],["slide"],["hold2"],["recol"],["pulse"],["hold3"]];
  const at={}; let p={};
  for(const [k] of seg){ p[k]=cl(t/T[k]); t-=T[k]; }
  const lineA = 1-cl(p.slide*1.6);
  for(const e of els){
    const d=(e.z-1)/117*0.3, m=ease(cl((p.morph-d)/(1-0.3)));
    let q=mix(e.A,e.B,m);
    if(p.rot>0){ const a=Math.PI*ease(p.rot), dx=e.B[0]-CX, dy=e.B[1]-CY;
      q=[CX+dx*Math.cos(a)-dy*Math.sin(a), CY+dx*Math.sin(a)+dy*Math.cos(a), e.B[2]]; }
    if(p.slide>0) q=mix(e.C,e.D,ease(p.slide));
    const rd=(e.z-1)/117*0.5, rc=ease(cl((p.recol-rd)/0.5));
    at[e.z]={x:q[0],y:q[1],r:q[2],rc};
  }
  if(lineA>0) for(const l of lines){
    el("path",{d:"M"+l.zs.map(z=>at[z].x.toFixed(1)+","+at[z].y.toFixed(1)).join("L"),fill:"none",stroke:"#a2fff0",
      "stroke-width":l.row?2:1.3,"stroke-dasharray":l.row?"":"6 5",opacity:(l.row?0.45:0.2)*lineA,"stroke-linejoin":"round"});
  }
  const pulse = p.pulse>0 ? 0.5-0.5*Math.cos(p.pulse*Math.PI*4) : 0;
  for(const e of [...els].sort((a,b)=>b.z-a.z)){
    const a=at[e.z];
    if(e.radio && p.pulse>0) el("circle",{cx:a.x,cy:a.y,r:a.r*(1.25+0.35*pulse),fill:"#ff3b2f",opacity:0.15+0.35*pulse});
    const fill=mixc(e.ct,e.ce,a.rc);
    const iron=e.z===26 && a.rc>0;
    el("circle",{cx:a.x,cy:a.y,r:a.r,fill,stroke:iron?"#fff":"${BG}","stroke-width":iron?3:1.5});
    el("text",{x:a.x,y:a.y+a.r*0.36,"text-anchor":"middle","font-size":(a.r*0.82).toFixed(1),"font-weight":700,fill:a.rc>0.5?e.ie:e.it},e.sym);
  }
  // colour key, once the energy colours are on
  const ka=cl(p.recol*2-0.6);
  if(ka>0){ const ky=1560, items=[["#3b5bdb","fusing gives energy"],["#9a958a","iron: the most stable"],["#8a5a3c","fusing costs energy"],["#ff3b2f","radioactive"]];
    items.forEach(([c,txt],i)=>{ const x=90+(i%2)*470, y=ky+Math.floor(i/2)*64;
      el("circle",{cx:x,cy:y,r:18,fill:c,opacity:ka}); el("text",{x:x+34,y:y+10,"font-size":30,fill:"#dde",opacity:ka},txt); });
  }
};
</script></body></html>`;

const FR = process.env.FRAMES || path.join(SP, "frames");
fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
const FPS = 30, total = Object.values(T).reduce((a, b) => a + b, 0);
const n = Math.round(total * FPS);
for (let f = 0; f < n; f++) {
  await page.evaluate((t) => window.draw(t), f / FPS);
  await page.screenshot({ path: `${FR}/f${String(f).padStart(4, "0")}.png` });
}
await browser.close();
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", `${FR}/f%04d.png`,
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", SP + "/table-sequence.mp4"]);
console.log("frames", n, "seconds", total.toFixed(1));
