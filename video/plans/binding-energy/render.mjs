// Periodic table as drawn on the chart (element dust, logR × logM),
// coloured by binding energy per nucleon of each element's main isotope.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const REPO = "/home/user/Triangle-of-Everything";
const SP = path.dirname(new URL(import.meta.url).pathname);
const require = createRequire(REPO + "/package.json");
const { chromium } = await import("/opt/node22/lib/node_modules/playwright/index.mjs").catch(() => require("playwright"));
const d3 = await import(REPO + "/node_modules/d3/src/index.js");
const { ELEMENTS_BY_Z, periodicCell } = await import(REPO + "/src/data.js");

const dust = JSON.parse(fs.readFileSync(REPO + "/src/dust.json"));
const objs = JSON.parse(fs.readFileSync(REPO + "/src/objects.json"));
const be = JSON.parse(fs.readFileSync(SP + "/be.json"));
const pos = new Map();
dust.name.forEach((n, i) => { if (dust.s[i] === 2) pos.set(n, [dust.r[i], dust.m[i]]); });
for (const o of objs) if (o.cat === "atomic" && o.subcat === "atom") pos.set(o.name, [o.logR, o.logM]);

const els = [];
for (let z = 1; z < ELEMENTS_BY_Z.length; z++) {
  const p = pos.get(ELEMENTS_BY_Z[z]);
  if (!p) { console.warn("missing", z, ELEMENTS_BY_Z[z]); continue; }
  const b = be[z];
  els.push({ z, name: ELEMENTS_BY_Z[z], r: p[0], m: p[1], ...b, mev: b.ba / 1000 });
}
// Lines: periods (solid), groups (dashed), as on the chart
const rows = new Map(), cols = new Map();
const add = (m, k, z) => (m.get(k) || m.set(k, []).get(k)).push(z);
for (let z = 1; z < ELEMENTS_BY_Z.length; z++) {
  const c = periodicCell(z);
  if (c.f == null) { add(rows, "p" + c.period, z); add(cols, "g" + c.group, z); }
  else { add(rows, "f" + c.period, z); add(cols, "f" + c.f, z); }
}

const W = 1800, H = 1580, BG = "#06061a";
const lineCol = d3.interpolateRgb("#64ffda", "#fff")(0.4);
// Main panel: equal-aspect logR × logM
const rx = d3.extent(els, (e) => e.r), my = d3.extent(els, (e) => e.m);
const P = { x: 70, y: 150, w: 1020, h: 1240 };
const k = Math.min(P.w / (rx[1] - rx[0] + 0.2), P.h / (my[1] - my[0] + 0.25));
const cxr = (rx[0] + rx[1]) / 2, cym = (my[0] + my[1]) / 2;
const X = (r) => P.x + P.w / 2 + (r - cxr) * k, Y = (m) => P.y + P.h / 2 - (m - cym) * k;
const byZ = new Map(els.map((e) => [e.z, e]));

const LO = 7.0, HI = 8.8;
const t = (v) => Math.max(0, Math.min(1, (v - LO) / (HI - LO)));
const col = (v) => d3.interpolatePlasma(0.12 + 0.88 * t(v));

let s = "";
for (const [key, zs] of [...rows, ...cols]) {
  const pts = zs.map((z) => byZ.get(z)).filter(Boolean).map((e) => [X(e.r), Y(e.m)]);
  if (pts.length < 2) continue;
  const row = key[0] === "p" || (key[0] === "f" && rows.has(key));
  const isRow = rows.has(key) && rows.get(key) === zs;
  s += `<path d="${d3.line()(pts)}" fill="none" stroke="${lineCol}" stroke-width="${isRow ? 1.6 : 1.2}" ${isRow ? "" : 'stroke-dasharray="5 4"'} opacity="${isRow ? 0.5 : 0.22}" stroke-linejoin="round"/>`;
}
// Dots, heavy ones first so the light, spread rows sit on top
for (const e of [...els].sort((a, b) => b.z - a.z)) {
  const x = X(e.r), y = Y(e.m), c = col(e.mev);
  const special = e.z === 26;
  s += `<circle cx="${x}" cy="${y}" r="${special ? 15 : e.z > 36 ? 8.5 : 11}" fill="${c}" stroke="${special ? "#fff" : BG}" stroke-width="${special ? 2.5 : 1.5}"/>`;
  if (!e.stable && e.natural) s += `<circle cx="${x}" cy="${y}" r="${e.z > 36 ? 11 : 15}" fill="none" stroke="#ff8787" stroke-width="1.3" stroke-dasharray="2 2" opacity="0.9"/>`;
  if (!e.natural) s += `<circle cx="${x}" cy="${y}" r="${e.z > 36 ? 11 : 15}" fill="none" stroke="#adb5bd" stroke-width="1" stroke-dasharray="1 3" opacity="0.7"/>`;
  const dark = t(e.mev) > 0.55;
  s += `<text x="${x}" y="${y + (e.z > 36 && !special ? 2.7 : 3.6)}" text-anchor="middle" font-size="${special ? 12 : e.z > 36 ? 7.5 : 9.5}" font-weight="700" fill="${dark ? "#111" : "#fff"}">${e.sym}</text>`;
}
// Callouts
const call = (z, text, dx, dy) => {
  const e = byZ.get(z), x = X(e.r), y = Y(e.m);
  s += `<line x1="${x}" y1="${y}" x2="${x + dx}" y2="${y + dy}" stroke="#fff" stroke-width="1" opacity="0.5"/>`;
  s += `<text x="${x + dx + (dx > 0 ? 6 : -6)}" y="${y + dy + 4}" text-anchor="${dx > 0 ? "start" : "end"}" font-size="15" fill="#fff" opacity="0.9">${text}</text>`;
};
call(26, `Iron-56 · ${byZ.get(26).mev.toFixed(3)} MeV per nucleon`, 140, -40);
call(1, "Hydrogen-1 · 0 (a lone proton)", 60, 40);
call(2, "Helium-4 · 7.07", 60, 10);
call(92, "Uranium-238 · 7.57", -120, 50);

// Side panel: the binding-energy curve vs mass number, same colours
const Q = { x: 1180, y: 190, w: 560, h: 420 };
const xa = d3.scaleLinear([0, 300], [Q.x, Q.x + Q.w]), yb = d3.scaleLinear([0, 9.2], [Q.y + Q.h, Q.y]);
let q = `<rect x="${Q.x}" y="${Q.y}" width="${Q.w}" height="${Q.h}" fill="none" stroke="#fff" stroke-opacity="0.12"/>`;
for (const v of [0, 2, 4, 6, 8]) q += `<line x1="${Q.x}" x2="${Q.x + Q.w}" y1="${yb(v)}" y2="${yb(v)}" stroke="#fff" stroke-opacity="0.07"/><text x="${Q.x - 8}" y="${yb(v) + 4}" text-anchor="end" font-size="12" fill="#aab">${v}</text>`;
for (const v of [0, 50, 100, 150, 200, 250, 300]) q += `<text x="${xa(v)}" y="${Q.y + Q.h + 18}" text-anchor="middle" font-size="12" fill="#aab">${v}</text>`;
q += `<text x="${Q.x + Q.w / 2}" y="${Q.y + Q.h + 40}" text-anchor="middle" font-size="13" fill="#ccd">mass number A (protons + neutrons)</text>`;
q += `<text transform="translate(${Q.x - 36},${Q.y + Q.h / 2}) rotate(-90)" text-anchor="middle" font-size="13" fill="#ccd">MeV per nucleon</text>`;
const curve = [...els].sort((a, b) => a.A - b.A);
q += `<path d="${d3.line()(curve.map((e) => [xa(e.A), yb(e.mev)]))}" fill="none" stroke="#fff" stroke-opacity="0.25"/>`;
const fe = byZ.get(26);
q += `<line x1="${xa(56)}" x2="${xa(56)}" y1="${Q.y}" y2="${Q.y + Q.h}" stroke="#fff" stroke-opacity="0.35" stroke-dasharray="3 3"/>`;
q += `<text x="${xa(56) - 8}" y="${Q.y + Q.h - 150}" font-size="13" fill="#fff" text-anchor="end" opacity="0.85">← fusion</text><text x="${xa(56) + 8}" y="${Q.y + Q.h - 150}" font-size="13" fill="#fff" opacity="0.85">fission →</text>`;
q += `<text x="${xa(56) + 8}" y="${Q.y + Q.h - 130}" font-size="12" fill="#ccd" opacity="0.85">both release energy only</text><text x="${xa(56) + 8}" y="${Q.y + Q.h - 114}" font-size="12" fill="#ccd" opacity="0.85">by moving toward iron</text>`;
for (const e of curve) q += `<circle cx="${xa(e.A)}" cy="${yb(e.mev)}" r="${e.z === 26 ? 6 : 3.6}" fill="${col(e.mev)}" stroke="${e.z === 26 ? "#fff" : "none"}" stroke-width="1.5"/>`;
q += `<text x="${Q.x}" y="${Q.y - 14}" font-size="16" font-weight="600" fill="#fff">The same numbers, against mass</text>`;

// Colour bar
const B = { x: 1180, y: 720, w: 560, h: 22 };
let grad = "";
for (let i = 0; i <= 20; i++) grad += `<stop offset="${i * 5}%" stop-color="${col(LO + (HI - LO) * i / 20)}"/>`;
let bar = `<defs><linearGradient id="g">${grad}</linearGradient></defs><rect x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}" rx="3" fill="url(#g)"/>`;
const bx = d3.scaleLinear([LO, HI], [B.x, B.x + B.w]);
for (const v of [7.0, 7.4, 7.8, 8.2, 8.6, 8.8]) bar += `<line x1="${bx(v)}" x2="${bx(v)}" y1="${B.y + B.h}" y2="${B.y + B.h + 5}" stroke="#aab"/><text x="${bx(v)}" y="${B.y + B.h + 20}" text-anchor="middle" font-size="12" fill="#aab">${v === 7 ? "≤7.0" : v.toFixed(1)}</text>`;
bar += `<text x="${B.x}" y="${B.y - 12}" font-size="16" font-weight="600" fill="#fff">Binding energy per nucleon (MeV)</text>`;
bar += `<text x="${B.x}" y="${B.y + B.h + 44}" font-size="12.5" fill="#aab">How tightly each proton or neutron is held. Brighter = more tightly bound = less energy left to give.</text>`;
// Ring key
const L = { x: 1180, y: 830 };
const key = [
  ["#ff8787", "2 2", "Found in nature, but radioactive (Bi, Th, U, Ra…)"],
  ["#adb5bd", "1 3", "Not found in nature: made in labs (longest-lived isotope shown)"],
];
let lk = "";
key.forEach(([c, da, txt], i) => {
  lk += `<circle cx="${L.x + 10}" cy="${L.y + i * 30}" r="10" fill="#555"/><circle cx="${L.x + 10}" cy="${L.y + i * 30}" r="14" fill="none" stroke="${c}" stroke-dasharray="${da}" stroke-width="1.3"/><text x="${L.x + 34}" y="${L.y + i * 30 + 5}" font-size="13" fill="#ccd">${txt}</text>`;
});
lk += `<text x="${L.x}" y="${L.y + 66}" font-size="13" fill="#ccd">Solid lines: periods. Dashed: groups. Dots sit where the chart puts</text>`;
lk += `<text x="${L.x}" y="${L.y + 84}" font-size="13" fill="#ccd">each element: atomic size across, mass up (both logarithmic).</text>`;
const notes = [
  "Each element is coloured by its most abundant isotope (or, if none is",
  "natural, its longest-lived one). Iron-56 has the least mass per nucleon",
  "of any nucleus; nickel-62 edges it on binding per nucleon (8.7945 vs",
  "8.7904 MeV), a technicality of the neutron/proton mass difference.",
  "",
  "Superheavy values (Z ≥ ~104) are AME2020 extrapolations, not measured.",
  "",
  "Data: IAEA Nuclear Data Services LiveChart (AME2020 masses, NUBASE",
  "abundances & half-lives); radii & masses as on the main chart.",
];
notes.forEach((n, i) => lk += `<text x="${1180}" y="${1400 + i * 17}" font-size="12.5" fill="#99a">${n}</text>`);


// Standard grid, same colours, for reading the crowded heavy end
const G = { x: 1180, y: 1060, c: 30 };
let gt = `<text x="${G.x}" y="${G.y - 14}" font-size="16" font-weight="600" fill="#fff">The usual grid, same colours</text>`;
for (const e of els) {
  const c = periodicCell(e.z);
  const gx = c.f == null ? c.group - 1 : c.f + 3, gy = c.f == null ? c.period - 1 : c.period + 1.4;
  const x = G.x + gx * G.c, y = G.y + gy * G.c;
  gt += `<rect x="${x}" y="${y}" width="${G.c - 2}" height="${G.c - 2}" rx="3" fill="${col(e.mev)}" stroke="${e.z === 26 ? "#fff" : "none"}" stroke-width="2"/>`;
  gt += `<text x="${x + (G.c - 2) / 2}" y="${y + 18}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${t(e.mev) > 0.55 ? "#111" : "#fff"}">${e.sym}</text>`;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="Inter, sans-serif">
<rect width="${W}" height="${H}" fill="${BG}"/>
<text x="70" y="70" font-size="34" font-weight="700" fill="#fff" letter-spacing="1">THE PERIODIC TABLE, BY HOW TIGHTLY THE NUCLEUS HOLDS</text>
<text x="70" y="104" font-size="17" fill="#ccd">Everything is downhill toward iron: lighter nuclei give energy by fusing up to it, heavier ones by splitting down to it.</text>
${s}${q}${bar}${lk}${gt}
<text x="${W - 40}" y="${H - 24}" text-anchor="end" font-size="13" fill="#667">triangleofeverything.com</text>
</svg>`;
fs.writeFileSync(SP + "/binding-periodic.svg", svg);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1.5 });
await page.setContent(`<html><body style="margin:0;background:${BG}">${svg}</body></html>`);
await page.screenshot({ path: SP + "/binding-periodic.png" });
await browser.close();
console.log("ok", els.length, "x", rx, "y", my);
